"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MessageSquare, 
  Send, 
  MoreVertical,
  ArrowLeft,
  Sparkles
} from "lucide-react";
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

const DARK = {
  pageBg: "#000000",
  panel: "#1C1C1E",
  border: "rgba(255,255,255,0.08)",
  text: "#F5F5F7",
  muted: "#86868B",
  dim: "#666666",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.15)",
  input: "#2C2C2E",
  glass: "rgba(28,28,30,0.8)",
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
};

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

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Real-time listener for new messages
  useEffect(() => {
    if (!supabase || !user) return;

    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            const activeChat = selectedChatRef.current;
            
            // If the message belongs to the currently active chat
            if (activeChat && (
              (newMsg.sender_id === activeChat.other_user_id) || 
              (newMsg.receiver_id === activeChat.other_user_id)
            )) {
                setMessages((prev) => {
                  if (!prev.find(m => m.id === newMsg.id)) {
                    return [...prev, newMsg];
                  }
                  return prev;
                });
                
                // Mark as read immediately if chat is openly active
                if (newMsg.receiver_id === user.id) {
                   supabase?.from("direct_messages")
                     .update({ read: true })
                     .eq("id", newMsg.id)
                     .then();
                }
            }
            // Always refresh sidebar conversation list
            fetchConversations(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [user]);

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
            other_user_name: "User",
            other_user_handle: "animator",
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

  async function sendMessage() {
    if (!user || !selectedChat || !newMessage.trim() || sending || !supabase) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          receiver_id: selectedChat.other_user_id,
          content: newMessage.trim()
        })
        .select("*")
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
      setNewMessage("");
      
      setConversations(prev => {
        const idx = prev.findIndex(c => c.other_user_id === selectedChat.other_user_id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], last_message: data.content, last_message_at: data.created_at };
          const [moved] = updated.splice(idx, 1);
          return [moved, ...updated];
        }
        return prev;
      });
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  }

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
            other_user_name: profile?.full_name || "Unknown",
            other_user_handle: profile?.user_name || "unknown",
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
          void client
            .from("direct_messages")
            .update({ is_read: true })
            .eq("id", msg.id);
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

  useEffect(() => {
    if (!user || !supabase) return;
    const interval = setInterval(() => {
      fetchConversations(user.id);
      const current = selectedChatRef.current;
      if (current) fetchMessages(current.other_user_id);
    }, 8000);
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
          padding: "1.5rem 1rem", 
          borderBottom: `1px solid ${T.border}`,
          position: "sticky",
          top: 0,
          backgroundColor: T.glass,
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem", padding: "0 0.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.03em" }}>Messages</h1>
            <div style={{ padding: "0.5rem", borderRadius: "50%", backgroundColor: T.accentSoft, cursor: "pointer" }}>
               <MessageSquare size={18} color={T.accent} />
            </div>
          </div>
          <div style={{ position: "relative", padding: "0 0.5rem" }}>
            <Search style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: T.dim }} />
            <input 
              placeholder="Search..."
              style={{
                width: "100%",
                padding: "0.6rem 0.6rem 0.6rem 2.5rem",
                borderRadius: "12px",
                border: "none",
                backgroundColor: T.input,
                color: T.text,
                fontSize: "0.95rem",
                outline: "none",
                transition: "box-shadow 0.2s ease"
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${T.accentSoft}`}
              onBlur={(e) => e.target.style.boxShadow = "none"}
            />
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem 0" }} className="hide-scroll">
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
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={convo.other_user_id}
                    onClick={() => {
                      setSelectedChat(convo);
                      fetchMessages(convo.other_user_id);
                    }}
                    whileHover={{ backgroundColor: isActive ? T.input : T.panel }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "0.8rem 1rem",
                      margin: "0.2rem 0.5rem",
                      borderRadius: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      backgroundColor: isActive ? T.input : "transparent",
                      transition: "background-color 0.2s ease"
                    }}
                  >
                    <div style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "50%", 
                      backgroundColor: T.accentSoft,
                      backgroundImage: convo.other_user_avatar ? `url(${convo.other_user_avatar})` : "none",
                      backgroundSize: "cover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.accent,
                      fontWeight: 600,
                      position: "relative",
                      flexShrink: 0
                    }}>
                      {!convo.other_user_avatar && convo.other_user_name.charAt(0)}
                      {convo.unread_count > 0 && (
                        <div style={{ 
                          position: "absolute", 
                          top: -2, 
                          right: -2, 
                          width: "14px", 
                          height: "14px", 
                          borderRadius: "50%", 
                          backgroundColor: "#007AFF", // Apple blue notification dot
                          border: `2px solid ${isActive ? T.input : T.pageBg}`
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {convo.other_user_name}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: convo.unread_count > 0 ? "#007AFF" : T.dim, fontWeight: convo.unread_count > 0 ? 600 : 400 }}>
                          {timeAgo(convo.last_message_at)}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: "0.85rem", 
                        color: convo.unread_count > 0 ? T.text : T.muted, 
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: convo.unread_count > 0 ? 500 : 400
                      }}>
                        {convo.last_message}
                      </p>
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
              padding: "1rem 1.5rem", 
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
                  width: "36px", 
                  height: "36px", 
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
                  <p style={{ fontWeight: 600, margin: 0, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>{selectedChat.other_user_name}</p>
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
              padding: "5rem 1.5rem 6rem 1.5rem", 
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
                        maxWidth: "75%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                        marginTop: isConsecutive ? "2px" : "12px"
                      }}
                    >
                      <div style={{
                        padding: "0.65rem 1rem",
                        borderRadius: isMine 
                          ? `18px ${isConsecutive ? '4px' : '18px'} 18px 18px` 
                          : `${isConsecutive ? '4px' : '18px'} 18px 18px 18px`,
                        backgroundColor: isMine ? "#007AFF" : T.input, // iMessage Blue
                        color: isMine ? "#FFF" : T.text,
                        fontSize: "0.95rem",
                        lineHeight: 1.4,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}>
                        {m.content}
                      </div>
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
              padding: "1rem 1.5rem 1.5rem 1.5rem", 
              backgroundColor: T.glass,
              backdropFilter: "saturate(180%) blur(20px)",
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
              borderTop: `1px solid ${T.border}`,
              zIndex: 20
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "flex-end", 
                gap: "0.8rem",
                backgroundColor: T.pageBg,
                borderRadius: "24px",
                padding: "0.4rem 0.4rem 0.4rem 1.2rem",
                border: `1px solid ${T.border}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
              }}>
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
                  placeholder="iMessage"
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
                  disabled={!newMessage.trim() || sending}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    backgroundColor: newMessage.trim() ? "#007AFF" : T.input,
                    color: newMessage.trim() ? "#fff" : T.dim,
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    cursor: newMessage.trim() ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                    marginBottom: "2px"
                  }}
                >
                  <Send size={16} style={{ marginLeft: "-1px" }} />
                </motion.button>
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
