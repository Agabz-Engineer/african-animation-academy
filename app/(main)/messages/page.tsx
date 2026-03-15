"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MessageSquare, 
  Send, 
  MoreVertical,
  ArrowLeft,
  Pin
} from "lucide-react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";

// ─── Types ─────────────────────────────────────────────────
type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

type Conversation = {
  other_user_id: string;
  other_user_name: string;
  other_user_handle: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
};

type SessionUser = Pick<User, "id" | "user_metadata">;

type ProfilePreview = {
  id: string;
  full_name: string | null;
  user_name: string | null;
  avatar_url: string | null;
};

type RealtimeInsertPayload = {
  new: Message;
};

const DARK = {
  pageBg: "#050505", // True studio black
  panel: "rgba(18, 18, 18, 0.7)",  // Translucent panel
  border: "rgba(255,255,255,0.08)",
  text: "#FFFFFF",
  muted: "#8A8A8E",
  dim: "#636366",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.18)",
  input: "rgba(28, 28, 30, 0.8)",
  glass: "rgba(10,10,10,0.7)",
  unreadBadge: "#FF6D1F",
  shadow: "0 8px 32px rgba(0,0,0,0.5)",
  bubbleShadow: "0 4px 12px rgba(0,0,0,0.2)",
  meshGradient: "radial-gradient(at 0% 0%, rgba(255, 109, 31, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 109, 31, 0.05) 0px, transparent 50%)",
};

const LIGHT = {
  pageBg: "#F2F2F7",
  panel: "rgba(255, 255, 255, 0.8)",
  border: "rgba(0,0,0,0.05)",
  text: "#000000",
  muted: "#8E8E93",
  dim: "#AEAEB2",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.08)",
  input: "rgba(255, 255, 255, 0.9)",
  glass: "rgba(255,255,255,0.7)",
  unreadBadge: "#FF6D1F",
  shadow: "0 8px 32px rgba(0,0,0,0.06)",
  bubbleShadow: "0 2px 8px rgba(0,0,0,0.04)",
  meshGradient: "radial-gradient(at 0% 0%, rgba(255, 109, 31, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 109, 31, 0.02) 0px, transparent 50%)",
};

// ─── Helpers ────────────────────────────────────────────────

const timeAgo = (isoDate: string) => {
  const mins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

// ─── Page Component ────────────────────────────────────────
export default function MessagesPage() {
  const theme = useThemeMode();
  const T = theme === "dark" ? DARK : LIGHT;
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const selectedChatRef = useRef<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  // Auth and Session initialization
  const fetchConversations = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      const { data: msgs, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const convosMap = new Map<string, Conversation>();
      const otherUserIds = new Set<string>();

      msgs?.forEach((m: Message) => {
        const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
        otherUserIds.add(otherId);
        
        if (!convosMap.has(otherId)) {
          convosMap.set(otherId, {
            other_user_id: otherId,
            other_user_name: "Creative",
            other_user_handle: "creative",
            other_user_avatar: null,
            last_message: m.content,
            last_message_at: m.created_at,
            unread_count: m.receiver_id === userId && !m.is_read ? 1 : 0
          });
        } else if (m.receiver_id === userId && !m.is_read) {
          const c = convosMap.get(otherId)!;
          c.unread_count++;
        }
      });

      if (otherUserIds.size > 0) {
        const { data: profiles, error: profileErr } = await supabase
          .from("profiles")
          .select("id, full_name, user_name, avatar_url")
          .in("id", Array.from(otherUserIds));
          
        if (!profileErr && profiles) {
          profiles.forEach((p: ProfilePreview) => {
             const convo = convosMap.get(p.id);
             if (convo) {
               convo.other_user_name = p.full_name || "Creative";
               convo.other_user_handle = p.user_name || "creative";
               convo.other_user_avatar = p.avatar_url;
             }
          });
        }
      }

      setConversations(
        Array.from(convosMap.values())
          .filter(c => c.other_user_id !== userId)
          .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      );
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (otherId: string) => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("sender_id", otherId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      setConversations(prev => prev.map(c => 
        c.other_user_id === otherId ? { ...c, unread_count: 0 } : c
      ));
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    const handleSession = (session: Session | null) => {
      if (!active) return;
      if (session?.user) {
        setUser(session.user);
        void fetchConversations(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    const init = async () => {
      const { data: { session } } = await client.auth.getSession();
      handleSession(session);
    };

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    void init();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchConversations]);


  async function sendMessage() {
    if (!user || !selectedChat || !newMessage.trim() || sending || !supabase) {
      return;
    }
    
    setSending(true);
    try {
      const payload = {
        sender_id: user.id,
        receiver_id: selectedChat.other_user_id,
        content: newMessage.trim()
      };

      const { data, error } = await supabase
        .from("direct_messages")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        throw error;
      }
      
      setMessages(prev => [...prev, data]);
      setNewMessage("");
      
      setConversations(prev => {
        const idx = prev.findIndex(c => c.other_user_id === selectedChat.other_user_id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { 
            ...updated[idx], 
            last_message: data.content, 
            last_message_at: data.created_at 
          };
          const [moved] = updated.splice(idx, 1);
          return [moved, ...updated];
        }
        return prev;
      });
    } catch (err) {
      console.error("Critical error in sendMessage:", err);
    } finally {
      setSending(false);
    }
  }

  // Real-time synchronization
  useEffect(() => {
    if (!user || !supabase) return;
    const client = supabase;

    const upsertConversation = async (msg: Message, isActiveChat: boolean) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const isIncoming = msg.receiver_id === user.id;
      let needsProfile = false;

      setConversations(prev => {
        const idx = prev.findIndex(c => c.other_user_id === otherId);
        const unreadInc = isIncoming && !isActiveChat ? 1 : 0;
        
        if (idx === -1) {
          needsProfile = true;
          return prev;
        }
        const updated = [...prev];
        const c = updated[idx];
        updated[idx] = {
          ...c,
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: isActiveChat ? 0 : c.unread_count + unreadInc
        };
        const [moved] = updated.splice(idx, 1);
        return [moved, ...updated];
      });

      if (needsProfile) {
        const { data: profile } = await client
          .from("profiles")
          .select("full_name, user_name, avatar_url")
          .eq("id", otherId)
          .single();
        setConversations(prev => {
          if (prev.some(c => c.other_user_id === otherId)) return prev;
          return [{
            other_user_id: otherId,
            other_user_name: profile?.full_name || "Creative",
            other_user_handle: profile?.user_name || "creative",
            other_user_avatar: profile?.avatar_url || null,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: isIncoming ? 1 : 0
          }, ...prev];
        });
      }
    };

    const handleInsert = async (payload: RealtimeInsertPayload) => {
      const msg = payload.new;
      if (msg.sender_id !== user.id && msg.receiver_id !== user.id) return;

      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const activeChat = selectedChatRef.current?.other_user_id === otherId;

      if (activeChat) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          const next = [...prev, msg];
          next.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return next;
        });
        if (msg.receiver_id === user.id) {
          void client.from("direct_messages").update({ is_read: true }).eq("id", msg.id);
        }
      }
      await upsertConversation(msg, activeChat);
    };

    const channel = client
      .channel(`direct-messages-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `sender_id=eq.${user.id}` }, handleInsert)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `receiver_id=eq.${user.id}` }, handleInsert)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  // Polling fallback
  useEffect(() => {
    if (!user || !supabase) return;
    const interval = setInterval(() => {
      fetchConversations(user.id);
      const current = selectedChatRef.current;
      if (current) fetchMessages(current.other_user_id);
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages, user]);

  if (!user && !loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: T.muted }}>
        Please sign in to view your messages.
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center",
      height: "calc(100vh - 64px)", 
      backgroundColor: T.pageBg,
      backgroundImage: T.meshGradient,
      color: T.text,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Mesh Gradient Background Layer */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: theme === 'dark' ? 0.3 : 0.6,
        pointerEvents: "none",
        zIndex: 0
      }}>
        <div style={{ position: "absolute", top: "10%", left: "10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(255, 109, 31, 0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(255, 109, 31, 0.1) 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "1380px",
          display: "flex",
          gap: isMobile ? 0 : "1.25rem",
          padding: isMobile ? 0 : "1rem",
          position: "relative",
          zIndex: 5,
        }}
      >
      {/* Sidebar: Global Conversation List */}
      <div style={{ 
        width: isMobile ? "100%" : "360px",
        minWidth: isMobile ? "auto" : "320px",
        maxWidth: isMobile ? "100%" : "380px",
        borderRight: isMobile ? `1px solid ${T.border}` : "none",
        border: isMobile ? "none" : `1px solid ${T.border}`,
        borderRadius: isMobile ? 0 : "28px",
        display: isMobile ? (selectedChat ? "none" : "flex") : "flex",
        flexDirection: "column",
        backgroundColor: T.panel,
        backdropFilter: "blur(30px) saturate(190%)",
        WebkitBackdropFilter: "blur(30px) saturate(190%)",
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
        boxShadow: isMobile ? "none" : T.shadow,
      }}>
        <div style={{ 
          padding: "1.2rem 1rem 0.5rem 1rem", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          backgroundColor: T.pageBg
        }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: T.text, letterSpacing: "-0.04em" }}>Messages</h1>
          <div style={{ display: "flex", gap: "0.8rem" }}>
             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ padding: "0.4rem", cursor: "pointer", color: T.dim }}>
               <MessageSquare size={22} />
             </motion.div>
             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ padding: "0.4rem", cursor: "pointer", color: T.dim }}>
               <MoreVertical size={22} />
             </motion.div>
          </div>
        </div>

        <div style={{ padding: "0.5rem 1rem 1rem 1rem", backgroundColor: T.pageBg }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: T.dim }} />
            <input 
              placeholder="Search conversations"
              style={{
                width: "100%",
                padding: "0.6rem 0.6rem 0.6rem 2.6rem",
                borderRadius: "10px",
                border: "none",
                backgroundColor: T.input,
                color: T.text,
                fontSize: "0.9rem",
                outline: "none",
                transition: "background-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.backgroundColor = theme === 'dark' ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}
              onBlur={(e) => e.target.style.backgroundColor = T.input}
            />
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "1rem 0" }} className="hide-scroll">
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: T.dim, fontSize: "0.9rem" }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: T.muted }}>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ type: "spring", stiffness: 200, damping: 20 }} 
                style={{ marginBottom: "1.5rem" }}
              >
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "24px", 
                  backgroundColor: T.input, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  margin: "0 auto",
                  boxShadow: T.shadow
                }}>
                  <MessageSquare size={40} style={{ strokeWidth: 1.5, opacity: 0.4, color: T.accent }} />
                </div>
              </motion.div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: T.text, margin: "0 0 0.5rem 0" }}>No Conversations</h2>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.6, maxWidth: "200px", margin: "0 auto" }}>Your active threads will appear here once you start messaging.</p>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map(convo => {
                const isActive = selectedChat?.other_user_id === convo.other_user_id;
                const isUnread = convo.unread_count > 0;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={convo.other_user_id}
                    onClick={() => {
                      setSelectedChat(convo);
                      fetchMessages(convo.other_user_id);
                    }}
                    whileHover={{ backgroundColor: isActive ? T.accentSoft : theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      backgroundColor: isActive ? T.accentSoft : "transparent",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      borderLeft: isActive ? `3px solid ${T.accent}` : "3px solid transparent",
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ 
                        width: "52px", 
                        height: "52px", 
                        borderRadius: "16px", // Organic squircle
                        backgroundColor: T.accent,
                        backgroundImage: convo.other_user_avatar ? `url(${convo.other_user_avatar})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        boxShadow: T.bubbleShadow,
                        fontSize: "1.2rem"
                      }}>
                        {!convo.other_user_avatar && convo.other_user_name.charAt(0)}
                      </div>
                      {/* Presence Indicator (Demo) */}
                      <div style={{
                        position: "absolute",
                        bottom: "-2px",
                        right: "-2px",
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "#34C759", // iOS Green
                        border: `2px solid ${T.pageBg}`
                      }} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                        <h3 style={{ 
                          fontSize: "0.95rem", 
                          fontWeight: 700, 
                          color: T.text, 
                          margin: 0,
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {convo.other_user_name}
                        </h3>
                        <span style={{ 
                          fontSize: "0.7rem", 
                          color: isUnread ? T.accent : T.muted, 
                          fontWeight: isUnread ? 700 : 500,
                          textTransform: "uppercase"
                        }}>
                          {timeAgo(convo.last_message_at)}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ 
                          fontSize: "0.85rem", 
                          color: isUnread ? T.text : T.muted, 
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.2,
                          fontWeight: isUnread ? 500 : 400
                        }}>
                          {convo.last_message}
                        </p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                          {convo.other_user_id === 'pinned-demo' && <Pin size={12} style={{ color: T.accent }} />}
                          {isUnread && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{ 
                                backgroundColor: T.unreadBadge,
                                color: "#fff",
                                borderRadius: "8px",
                                minWidth: "18px",
                                height: "18px",
                                padding: "0 5px",
                                fontSize: "0.7rem",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 4px rgba(255,109,31,0.3)"
                              }}>
                              {convo.unread_count}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Main Content: Chat View */}
      <div style={{ 
        flex: 1, 
        minWidth: 0,
        display: isMobile ? (selectedChat ? "flex" : "none") : "flex", 
        flexDirection: "column",
        backgroundColor: isMobile ? "transparent" : T.panel,
        backdropFilter: isMobile ? "none" : "blur(30px) saturate(190%)",
        WebkitBackdropFilter: isMobile ? "none" : "blur(30px) saturate(190%)",
        position: "relative",
        zIndex: 5,
        border: isMobile ? "none" : `1px solid ${T.border}`,
        borderRadius: isMobile ? 0 : "28px",
        overflow: "hidden",
        boxShadow: isMobile ? "none" : T.shadow,
      }}>
        {selectedChat ? (
          <>
            <div style={{ 
              padding: "1rem 1.5rem", 
              borderBottom: `1px solid ${T.border}`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              backgroundColor: isMobile ? T.glass : T.panel,
              backdropFilter: "saturate(210%) blur(40px)",
              WebkitBackdropFilter: "saturate(210%) blur(40px)",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              boxShadow: "0 1px 0 rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <motion.button 
                  onClick={() => setSelectedChat(null)}
                  whileHover={{ x: -2 }}
                  style={{ display: "flex", alignItems: "center", background: "none", border: "none", color: T.accent, cursor: "pointer", padding: "0 0.2rem 0 0", fontWeight: 600 }}
                  className="mobile-back"
                >
                  <ArrowLeft size={24} />
                </motion.button>
                <div style={{ position: "relative" }}>
                   <div style={{ 
                     width: "38px", 
                     height: "38px", 
                     borderRadius: "12px", 
                     backgroundColor: T.accent,
                     backgroundImage: selectedChat.other_user_avatar ? `url(${selectedChat.other_user_avatar})` : "none",
                     backgroundSize: "cover",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     color: "#fff",
                     fontWeight: 700,
                     fontSize: "0.9rem"
                   }}>
                     {!selectedChat.other_user_avatar && selectedChat.other_user_name.charAt(0)}
                   </div>
                   <div style={{
                     position: "absolute",
                     bottom: "-2px",
                     right: "-2px",
                     width: "12px",
                     height: "12px",
                     borderRadius: "50%",
                     backgroundColor: "#34C759",
                     border: `2px solid ${T.panel}`
                   }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: "1rem", letterSpacing: "-0.01em", color: T.text }}>{selectedChat.other_user_name}</p>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: "#34C759", fontWeight: 600 }}>Online</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", padding: "0.5rem" }}>
                <MoreVertical size={20} />
              </motion.button>
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: "auto", 
              padding: "5rem 1.5rem 8.5rem 1.5rem", 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.4rem",
              maxWidth: isMobile ? "100%" : "980px",
              width: "100%",
              margin: "0 auto",
            }}>
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const isMine = m.sender_id === user?.id;
                  const prev = messages[i - 1];
                  const next = messages[i + 1];
                  const isConsecutivePrev = prev && prev.sender_id === m.sender_id;
                  const isConsecutiveNext = next && next.sender_id === m.sender_id;
                  const borderRadius = isMine 
                    ? `${isConsecutivePrev ? '12px' : '22px'} 22px ${isConsecutiveNext ? '12px' : '4px'} ${isConsecutivePrev ? '12px' : '22px'}`
                    : `22px ${isConsecutivePrev ? '12px' : '22px'} ${isConsecutivePrev ? '12px' : '22px'} ${isConsecutiveNext ? '12px' : '4px'}`;

                  return (
                    <motion.div 
                      key={m.id}
                      initial={{ opacity: 0, y: 15, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 450, damping: 30, mass: 1 }}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "75%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                        marginTop: isConsecutivePrev ? "2px" : "1rem",
                        position: "relative"
                      }}
                    >
                      {m.content && (
                        <div style={{
                          padding: "0.75rem 1.1rem",
                          borderRadius: borderRadius,
                          backgroundColor: isMine ? T.accent : T.input,
                          color: isMine ? "#FFF" : T.text,
                          fontSize: "0.95rem",
                          lineHeight: 1.45,
                          boxShadow: T.bubbleShadow,
                          border: isMine ? "none" : `1px solid ${T.border}`,
                          fontWeight: 450,
                          letterSpacing: "-0.005em"
                        }}>
                          {m.content}
                        </div>
                      )}
                      {!isConsecutiveNext && (
                         <span style={{ 
                           fontSize: "0.65rem", 
                           color: T.muted, 
                           marginTop: "4px",
                           fontWeight: 600,
                           textTransform: "uppercase",
                           padding: "0 4px"
                         }}>
                           {timeAgo(m.created_at)}
                         </span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div style={{ 
              padding: "1rem 1.5rem 1.5rem 1.5rem", 
              backgroundColor: "transparent",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "flex-end", 
                gap: "0.8rem",
                backgroundColor: theme === 'dark' ? "rgba(28, 28, 30, 0.9)" : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(30px) saturate(190%)",
                borderRadius: "26px",
                padding: "0.5rem 0.8rem",
                border: `1px solid ${T.border}`,
                boxShadow: T.shadow
              ,
                maxWidth: isMobile ? "100%" : "980px",
                margin: "0 auto",
              }}>
                <div style={{ padding: "0.5rem" }} />
                <textarea 
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Message..."
                  rows={1}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    color: T.text,
                    fontSize: "1rem",
                    padding: "0.6rem 0",
                    outline: "none",
                    resize: "none",
                    maxHeight: "160px",
                    minHeight: "26px",
                    lineHeight: 1.5,
                    overflowY: "auto",
                    fontFamily: "inherit"
                  }}
                  className="hide-scroll"
                />
                <motion.button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  whileHover={{ scale: newMessage.trim() ? 1.1 : 1 }}
                  whileTap={{ scale: newMessage.trim() ? 0.9 : 1 }}
                  style={{
                    backgroundColor: newMessage.trim() ? T.accent : "transparent",
                    color: newMessage.trim() ? "#fff" : T.dim,
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    cursor: newMessage.trim() ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: newMessage.trim() ? "0 4px 12px rgba(255,109,31,0.3)" : "none",
                    marginBottom: "4px"
                  }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </>
          ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: T.dim }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ textAlign: "center" }}
            >
              <div style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "32px", 
                backgroundColor: T.pageBg, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 2rem auto",
                boxShadow: T.shadow,
                border: `1px solid ${T.border}`
              }}>
                <MessageSquare size={56} style={{ strokeWidth: 1, opacity: 0.2, color: T.accent }} />
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: T.text, margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Select a Conversation</h2>
              <p style={{ fontSize: "0.95rem", color: T.muted, maxWidth: "260px", margin: "0 auto" }}>Choose a thread from the sidebar to start collaborating with other creatives.</p>
            </motion.div>
          </div>
        )}
      </div>
      </div>

      <style jsx>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Custom Premium Scrollbar */
        *::-webkit-scrollbar {
          width: 5px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
        }
        .mobile-back {
          display: none !important;
        }
        @media (max-width: 767px) {
          .mobile-back {
             display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
