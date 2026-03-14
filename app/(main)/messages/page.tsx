"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MessageSquare, 
  Send, 
  MoreVertical,
  ArrowLeft,
  Paperclip,
  Smile,
  X,
  Image as ImageIcon,
  Pin
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";

// ─── Types ─────────────────────────────────────────────────
type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
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

const DARK = {
  pageBg: "#0B141A", // WhatsApp-like dark background
  panel: "#111B21",  // Lighter sidebar/panel
  border: "rgba(255,255,255,0.05)",
  text: "#E9EDEF",
  muted: "#8696A0",
  dim: "#667781",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.12)",
  input: "#2A3942",
  glass: "rgba(11,20,26,0.9)",
  unreadBadge: "#00A884", // WhatsApp green
};

const LIGHT = {
  pageBg: "#F5F5F7",
  panel: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  text: "#1D1D1F",
  muted: "#86868B",
  dim: "#AEAEB2",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.08)",
  input: "#E5E5EA",
  glass: "rgba(255,255,255,0.8)",
  unreadBadge: "#00A884",
};

const EMOJIS = ["😀", "😂", "🥰", "😎", "🤔", "🤩", "😊", "🔥", "✨", "🙌", "👍", "❤️", "📍", "🎨", "🎬", "💎"];

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
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const selectedChatRef = useRef<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Auth and Session initialization
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    const handleSession = (session: any) => {
      if (!active) return;
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || "User",
          handle: session.user.user_metadata.user_name || "user"
        });
        fetchConversations(session.user.id);
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

    init();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchConversations(userId: string) {
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

      msgs?.forEach((m: any) => {
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
          profiles.forEach(p => {
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
  }

  async function fetchMessages(otherId: string) {
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
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !supabase) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      setPendingImage(publicUrl);
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function sendMessage() {
    if (!user || !selectedChat || (!newMessage.trim() && !pendingImage) || sending || !supabase) {
      console.log("Send blocked:", { user: !!user, selectedChat: !!selectedChat, hasContent: !!newMessage.trim(), hasImage: !!pendingImage, sending, hasSupabase: !!supabase });
      return;
    }
    
    setSending(true);
    try {
      const payload = {
        sender_id: user.id,
        receiver_id: selectedChat.other_user_id,
        content: newMessage.trim() || (pendingImage ? "Sent an image" : ""),
        image_url: pendingImage
      };

      const { data, error } = await supabase
        .from("direct_messages")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        alert(`Failed to send: ${error.message}`);
        throw error;
      }

      setMessages(prev => [...prev, data]);
      setNewMessage("");
      setPendingImage(null);
      setShowEmojis(false);
      
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
      // alert("An unexpected error occurred. Please check your connection.");
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

    const handleInsert = async (payload: any) => {
      const msg = payload.new as Message;
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
  }, [user?.id]);

  // Polling fallback
  useEffect(() => {
    if (!user || !supabase) return;
    const interval = setInterval(() => {
      fetchConversations(user.id);
      const current = selectedChatRef.current;
      if (current) fetchMessages(current.other_user_id);
    }, 20000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (!user && !loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: T.muted }}>
        Please sign in to view your messages.
      </div>
    );
  }

  return (
    <div style={{ 
      height: "calc(100vh - 80px)", 
      display: "flex", 
      backgroundColor: T.pageBg,
      color: T.text,
      fontFamily: "var(--font-geist-sans), 'General Sans', sans-serif",
      overflow: "hidden"
    }}>
      {/* Sidebar: Conversation List */}
      <div style={{ 
        width: selectedChat ? "350px" : "100%", 
        maxWidth: "400px",
        borderRight: `1px solid ${T.border}`,
        display: selectedChat ? "none" : "flex",
        flexDirection: "column",
        backgroundColor: T.pageBg,
        position: "relative",
        zIndex: 10
      }}>
        <div style={{ 
          padding: "1rem", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          backgroundColor: T.panel
        }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, color: T.text }}>Chats</h1>
          <div style={{ display: "flex", gap: "1rem" }}>
             <MessageSquare size={20} color={T.dim} style={{ cursor: "pointer" }} />
             <MoreVertical size={20} color={T.dim} style={{ cursor: "pointer" }} />
          </div>
        </div>

        <div style={{ padding: "0.5rem 1rem", backgroundColor: T.panel }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: T.dim }} />
            <input 
              placeholder="Search or start new chat"
              style={{
                width: "100%",
                padding: "0.5rem 0.5rem 0.5rem 2.5rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: T.input,
                color: T.text,
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "1rem 0" }} className="hide-scroll">
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: T.dim, fontSize: "0.9rem" }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: T.muted }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ marginBottom: "1rem" }}>
                <MessageSquare size={48} style={{ margin: "0 auto", strokeWidth: 1.5, opacity: 0.3 }} />
              </motion.div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>No messages yet.<br/>Connect with creators to start!</p>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map(convo => {
                const isActive = selectedChat?.other_user_id === convo.other_user_id;
                const isUnread = convo.unread_count > 0;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={convo.other_user_id}
                    onClick={() => {
                      setSelectedChat(convo);
                      fetchMessages(convo.other_user_id);
                    }}
                    whileHover={{ backgroundColor: isActive ? T.accentSoft : T.input }}
                    style={{
                      padding: "0.8rem 1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.9rem",
                      backgroundColor: isActive ? T.accentSoft : "transparent",
                      borderBottom: `1px solid ${T.border}`,
                      transition: "background-color 0.2s ease",
                      position: "relative"
                    }}
                  >
                    <div style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "50%", 
                      backgroundColor: T.accent,
                      backgroundImage: convo.other_user_avatar ? `url(${convo.other_user_avatar})` : "none",
                      backgroundSize: "cover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {!convo.other_user_avatar && convo.other_user_name.charAt(0)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0, paddingRight: "40px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                        <h3 style={{ 
                          fontSize: "1rem", 
                          fontWeight: 600, 
                          color: T.text, 
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {convo.other_user_name}
                        </h3>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          color: isUnread ? T.unreadBadge : T.dim, 
                          fontWeight: isUnread ? 600 : 400 
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
                          fontWeight: isUnread ? 500 : 400
                        }}>
                          {convo.last_message}
                        </p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {convo.other_user_id === 'pinned-demo' && <Pin size={14} style={{ color: T.dim, transform: "rotate(45deg)" }} />}
                          {isUnread && (
                            <div style={{ 
                              backgroundColor: T.unreadBadge,
                              color: "#fff",
                              borderRadius: "12px",
                              minWidth: "20px",
                              height: "20px",
                              padding: "0 6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                            }}>
                              {convo.unread_count}
                            </div>
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
        display: selectedChat ? "flex" : "none", 
        flexDirection: "column",
        backgroundColor: T.panel,
        position: "relative"
      }}>
        {selectedChat ? (
          <>
            <div style={{ 
              padding: "0.8rem 1.5rem", 
              borderBottom: `1px solid ${T.border}`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              backgroundColor: T.glass,
              backdropFilter: "saturate(180%) blur(20px)",
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <button 
                  onClick={() => setSelectedChat(null)}
                  style={{ display: "flex", alignItems: "center", background: "none", border: "none", color: T.accent, cursor: "pointer", padding: "0 0.5rem 0 0", fontSize: "1rem", fontWeight: 500 }}
                  className="mobile-back"
                >
                  <ArrowLeft size={22} style={{ marginRight: "0.2rem" }} />
                </button>
                <div style={{ 
                  width: "34px", 
                  height: "34px", 
                  borderRadius: "50%", 
                  backgroundColor: T.accentSoft,
                  backgroundImage: selectedChat.other_user_avatar ? `url(${selectedChat.other_user_avatar})` : "none",
                  backgroundSize: "cover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.accent,
                  fontWeight: 600
                }}>
                  {!selectedChat.other_user_avatar && selectedChat.other_user_name.charAt(0)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>{selectedChat.other_user_name}</p>
                </div>
              </div>
              <button style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", padding: "0.4rem", borderRadius: "50%" }}>
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Chat History */}
            <div style={{ 
              flex: 1, 
              overflowY: "auto", 
              padding: "5rem 1.5rem 8.5rem 1.5rem", 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.4rem" 
            }}>
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const isMine = m.sender_id === user.id;
                  const prev = messages[i - 1];
                  const isConsecutive = prev && prev.sender_id === m.sender_id;
                  
                  return (
                    <motion.div 
                      key={m.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                        marginTop: isConsecutive ? "2px" : "12px"
                      }}
                    >
                      {m.image_url && (
                        <div style={{ marginBottom: "0.4rem" }}>
                          <img 
                            src={m.image_url} 
                            alt="Attached" 
                            style={{ 
                              maxWidth: "100%", 
                              maxHeight: "300px", 
                              borderRadius: "12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }} 
                          />
                        </div>
                      )}
                      {m.content && m.content !== "Sent an image" && (
                        <div style={{
                          padding: "0.6rem 1rem",
                          borderRadius: isMine 
                            ? `16px 16px 4px 16px` 
                            : `16px 16px 16px 4px`,
                          backgroundColor: isMine ? T.accent : T.input,
                          color: isMine ? "#FFF" : T.text,
                          fontSize: "0.9rem",
                          lineHeight: 1.4,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}>
                          {m.content}
                        </div>
                      )}
                      {!messages[i+1] || messages[i+1].sender_id !== m.sender_id ? (
                        <span style={{ fontSize: "0.65rem", color: T.dim, margin: "4px 4px 0 4px" }}>
                          {timeAgo(m.created_at)}
                        </span>
                      ) : null}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div style={{ 
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "0.8rem 1.5rem 1.5rem 1.5rem", 
              backgroundColor: T.glass,
              backdropFilter: "saturate(180%) blur(20px)",
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
              borderTop: `1px solid ${T.border}`,
              zIndex: 20
            }}>
              {pendingImage && (
                <div style={{ marginBottom: "0.8rem", position: "relative", width: "fit-content" }}>
                  <img src={pendingImage} alt="Preview" style={{ height: "60px", borderRadius: "8px", border: `1px solid ${T.border}` }} />
                  <button 
                    onClick={() => setPendingImage(null)}
                    style={{ position: "absolute", top: -8, right: -8, backgroundColor: T.accent, color: "#fff", borderRadius: "50%", padding: "2px", border: "none", cursor: "pointer" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div style={{ position: "relative" }}>
                <AnimatePresence>
                  {showEmojis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        left: 0,
                        backgroundColor: T.panel,
                        border: `1px solid ${T.border}`,
                        borderRadius: "16px",
                        padding: "0.8rem",
                        marginBottom: "0.8rem",
                        display: "grid",
                        gridTemplateColumns: "repeat(8, 1fr)",
                        gap: "0.4rem",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        zIndex: 30
                      }}
                    >
                      {EMOJIS.map(e => (
                        <button 
                          key={e} 
                          onClick={() => {
                            setNewMessage(prev => prev + e);
                          }}
                          style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", padding: "0.2rem" }}
                        >
                          {e}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ 
                  display: "flex", 
                  alignItems: "flex-end", 
                  gap: "0.6rem",
                  backgroundColor: T.pageBg,
                  borderRadius: "24px",
                  padding: "0.4rem 0.6rem 0.4rem 0.8rem",
                  border: `1px solid ${T.border}`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                }}>
                  <button 
                    onClick={() => setShowEmojis(!showEmojis)}
                    style={{ background: "none", border: "none", color: showEmojis ? T.accent : T.dim, cursor: "pointer", padding: "0.4rem" }}
                  >
                    <Smile size={20} />
                  </button>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0.4rem", color: T.dim }}>
                    <Paperclip size={20} />
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                  
                  <textarea 
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    style={{
                      flex: 1,
                      background: "none",
                      border: "none",
                      color: T.text,
                      fontSize: "0.95rem",
                      padding: "0.4rem 0",
                      outline: "none",
                      resize: "none",
                      maxHeight: "120px",
                      minHeight: "24px",
                      lineHeight: 1.4,
                      overflowY: "auto"
                    }}
                    className="hide-scroll"
                  />
                  <motion.button 
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && !pendingImage) || sending || uploadingImage}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      backgroundColor: (newMessage.trim() || pendingImage) ? T.accent : T.input,
                      color: (newMessage.trim() || pendingImage) ? "#fff" : T.dim,
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      cursor: (newMessage.trim() || pendingImage) ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                      marginBottom: "2px"
                    }}
                  >
                    {uploadingImage ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} /> : <Send size={16} />}
                  </motion.button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: T.dim }}>
            <MessageSquare size={48} style={{ strokeWidth: 1, marginBottom: "1rem", opacity: 0.5 }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>Select a Conversation</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .mobile-back {
          display: none !important;
        }
        @media (min-width: 768px) {
           div[style*="width: 350px"] {
             display: flex !important;
           }
           div[style*="flex: 1"] {
             display: flex !important;
           }
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
