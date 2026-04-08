"use client";

import { useEffect, useState } from "react";
import {
  ACCESSIBLE,
  FALLBACK_COURSES,
  mergeCourseCatalog,
  type CourseLevel,
  type CourseRecord,
  type DbCourse,
} from "@/lib/courseCatalog";
import { supabase } from "@/lib/supabase";

type CourseLibraryState = {
  loading: boolean;
  courses: CourseRecord[];
  skillLevel: string;
  accessibleLevels: CourseLevel[];
  hasProAccess: boolean;
  subscriptionEndsAt: string | null;
  subscriptionExpired: boolean;
};

const DEFAULT_STATE: CourseLibraryState = {
  loading: true,
  courses: FALLBACK_COURSES,
  skillLevel: "beginner",
  accessibleLevels: ACCESSIBLE.beginner,
  hasProAccess: false,
  subscriptionEndsAt: null,
  subscriptionExpired: false,
};

export function useCourseLibrary(): CourseLibraryState {
  const [state, setState] = useState<CourseLibraryState>(DEFAULT_STATE);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!supabase) {
        if (active) {
          setState((current) => ({ ...current, loading: false }));
        }
        return;
      }

      try {
        const [{ data: authData }, { data: courseData }] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("courses")
            .select(
              "id,title,instructor,level,duration,lessons,description,thumbnail_url,access_tier,price,rating,enrolled_count,video_path,status"
            )
            .eq("status", "published")
            .order("created_at", { ascending: false }),
        ]);

        const user = authData.user;
        const nextSkillLevel = String(user?.user_metadata?.skill_level || "beginner").toLowerCase();
        let nextHasPro = false;
        let nextEndsAt: string | null = null;
        let nextExpired = false;

        if (user?.id) {
          const [{ data: profile }, { data: subscription }] = await Promise.all([
            supabase
              .from("profiles")
              .select("subscription_tier")
              .eq("id", user.id)
              .single(),
            supabase
              .from("subscriptions")
              .select("plan, status, ends_at, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          nextHasPro =
            profile?.subscription_tier === "pro" || profile?.subscription_tier === "team";

          if (subscription && (subscription.plan === "pro" || subscription.plan === "team")) {
            nextEndsAt = subscription.ends_at ?? null;

            if (subscription.status !== "active") {
              nextHasPro = false;
              nextExpired = true;
            } else if (subscription.ends_at) {
              const endsAtDate = new Date(subscription.ends_at);
              if (!Number.isNaN(endsAtDate.getTime())) {
                nextHasPro = endsAtDate > new Date();
                nextExpired = !nextHasPro;
              }
            } else {
              nextHasPro = true;
            }
          }
        }

        if (!active) return;

        setState({
          loading: false,
          courses: mergeCourseCatalog((courseData || []) as DbCourse[]),
          skillLevel: nextSkillLevel,
          accessibleLevels: ACCESSIBLE[nextSkillLevel] || ACCESSIBLE.beginner,
          hasProAccess: nextHasPro,
          subscriptionEndsAt: nextEndsAt,
          subscriptionExpired: nextExpired,
        });
      } catch {
        if (active) {
          setState((current) => ({ ...current, loading: false }));
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
