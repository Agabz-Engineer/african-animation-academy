-- Repoint community_posts.user_id to public.profiles for PostgREST joins

alter table public.community_posts
  drop constraint if exists community_posts_user_id_fkey;

alter table public.community_posts
  add constraint community_posts_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
