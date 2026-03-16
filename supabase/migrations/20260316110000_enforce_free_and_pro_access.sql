-- Enforce free vs Pro access at the database layer.
-- Free users can browse, message, like, and publish up to 3 portfolio projects per month.
-- Pro users can also create community posts/comments and publish unlimited portfolio projects.

create or replace function public.user_has_active_pro(target_user_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    exists (
      select 1
      from public.profiles
      where id = target_user_id
        and (
          role = 'admin'
          or subscription_tier in ('pro', 'team')
        )
    )
    or exists (
      select 1
      from public.subscriptions
      where user_id = target_user_id
        and plan in ('pro', 'team')
        and status = 'active'
        and (ends_at is null or ends_at > now())
    );
$$;

create or replace function public.user_can_create_portfolio_project(target_user_id uuid)
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  monthly_project_count integer := 0;
begin
  if public.user_has_active_pro(target_user_id) then
    return true;
  end if;

  if to_regclass('public.portfolio_projects') is null then
    return false;
  end if;

  execute $query$
    select count(*)
    from public.portfolio_projects
    where user_id = $1
      and created_at >= date_trunc('month', now())
      and created_at < date_trunc('month', now()) + interval '1 month'
  $query$
  into monthly_project_count
  using target_user_id;

  return monthly_project_count < 3;
end;
$$;

do $$
begin
  if to_regclass('public.community_posts') is not null then
    execute $policy$
      drop policy if exists "community_posts_insert_own" on public.community_posts
    $policy$;

    execute $policy$
      create policy "community_posts_insert_own"
        on public.community_posts
        for insert
        to authenticated
        with check (
          auth.uid() = user_id
          and public.user_has_active_pro(auth.uid())
        )
    $policy$;
  end if;

  if to_regclass('public.community_post_comments') is not null then
    execute $policy$
      drop policy if exists "community_post_comments_insert_own" on public.community_post_comments
    $policy$;

    execute $policy$
      create policy "community_post_comments_insert_own"
        on public.community_post_comments
        for insert
        to authenticated
        with check (
          auth.uid() = user_id
          and public.user_has_active_pro(auth.uid())
        )
    $policy$;
  end if;

  if to_regclass('public.portfolio_projects') is not null then
    execute $policy$
      drop policy if exists "portfolio_projects_insert_own" on public.portfolio_projects
    $policy$;

    execute $policy$
      create policy "portfolio_projects_insert_own"
        on public.portfolio_projects
        for insert
        to authenticated
        with check (
          auth.uid() = user_id
          and public.user_can_create_portfolio_project(auth.uid())
        )
    $policy$;
  end if;
end;
$$;
