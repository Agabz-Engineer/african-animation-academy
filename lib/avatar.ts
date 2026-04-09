"use client";

import { supabase } from "@/lib/supabase";

type AvatarMetadata = {
  avatarPath: string | null;
  avatarPublicUrl: string | null;
};

export const getAvatarMetadata = (
  metadata: Record<string, unknown> | null | undefined
): AvatarMetadata => ({
  avatarPath:
    typeof metadata?.avatar_path === "string" ? metadata.avatar_path : null,
  avatarPublicUrl:
    typeof metadata?.avatar_url === "string" ? metadata.avatar_url : null,
});

export const resolveAvatarDisplayUrl = async (
  avatarPath: string | null,
  avatarPublicUrl: string | null
) => {
  if (avatarPath && supabase) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(avatarPath, 60 * 60);

    if (!signedError && signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarPath);
    if (publicData?.publicUrl) return publicData.publicUrl;
  }

  return avatarPublicUrl;
};
