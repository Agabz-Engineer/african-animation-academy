"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface FollowButtonProps {
  targetUserId: string;
  onUpdate?: () => void;
  variant?: "primary" | "outline" | "ghost";
}

export default function FollowButton({ targetUserId, onUpdate, variant = "primary" }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkFollowStatus() {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user && user.id !== targetUserId) {
        const { data, error } = await supabase
          .from("user_follows")
          .select("*")
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId)
          .single();
        
        if (data && !error) setIsFollowing(true);
      }
      setLoading(false);
    }
    checkFollowStatus();
  }, [targetUserId]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || !supabase || actionLoading) return;
    setActionLoading(true);

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", targetUserId);
      
      if (!error) {
        setIsFollowing(false);
        onUpdate?.();
      }
    } else {
      // Follow
      const { error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: currentUser.id,
          following_id: targetUserId
        });
      
      if (!error) {
        setIsFollowing(true);
        onUpdate?.();
      }
    }
    setActionLoading(false);
  };

  if (loading || !currentUser || currentUser.id === targetUserId) return null;

  const styles = {
    primary: {
      bg: isFollowing ? "rgba(255,109,31,0.15)" : "#FF6D1F",
      color: isFollowing ? "#FF6D1F" : "#fff",
      border: isFollowing ? "1px solid rgba(255,109,31,0.3)" : "none",
    },
    outline: {
      bg: "transparent",
      color: isFollowing ? "#FF6D1F" : "inherit",
      border: `1px solid ${isFollowing ? "#FF6D1F" : "rgba(128,128,128,0.3)"}`,
    },
    ghost: {
      bg: "transparent",
      color: "#FF6D1F",
      border: "none",
    }
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleFollow}
      disabled={actionLoading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.4rem 0.8rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 700,
        cursor: actionLoading ? "not-allowed" : "pointer",
        backgroundColor: styles.bg,
        color: styles.color,
        border: styles.border,
        transition: "all 0.2s ease",
        fontFamily: "'General Sans', sans-serif"
      }}
    >
      {actionLoading ? (
        <Loader2 className="animate-spin" size={14} />
      ) : isFollowing ? (
        <>
          <UserMinus size={14} />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus size={14} />
          Follow
        </>
      )}
    </motion.button>
  );
}
