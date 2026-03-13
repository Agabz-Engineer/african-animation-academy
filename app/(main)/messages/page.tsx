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
  pageBg: "#222222",
  panel: "#2C2C2C",
  border: "#444444",
  text: "#FAF3E1",
  muted: "#D2C9B8",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.09)",
  input: "#333333",
};

const LIGHT = {
  pageBg: "#FAF3E1",
  panel: "#FFFFFF",
  border: "#E7DBBD",
  text: "#222222",
  muted: "#555555",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.09)",
  input: "#F5E7C6",
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
    async function getSession() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || "User",
          handle: session.user.user_metadata.user_name || "user"
        });
        fetchConversations(session.user.id);
      } else {
        setLoading(false);
      }
    }
    getSession();
  }, []);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  async function fetchConversations(userId: string) {
    if (!supabase) return;
    try {
      const { data: msgs, error } = await supabase
        .from("direct_messages")
        .select(`
          *,
          sender:profiles!direct_messages_sender_id_fkey(full_name, user_name, avatar_url),
          receiver:profiles!direct_messages_receiver_id_fkey(full_name, user_name, avatar_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const convosMap = new Map<string, Conversation>();
      msgs?.forEach((m: any) => {
        const otherUser = m.sender_id === userId ? m.receiver : m.sender;
        const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
        if (!convosMap.has(otherId)) {
          convosMap.set(otherId, {
            other_user_id: otherId,
            other_user_name: otherUser?.full_name || "Unknown",
            other_user_handle: otherUser?.user_name || "unknown",
            other_user_avatar: otherUser?.avatar_url,
            last_message: m.content,
            last_message_at: m.created_at,
            unread_count: m.receiver_id === userId && !m.is_read ? 1 : 0
          });
        } else if (m.receiver_id === userId && !m.is_read) {
          const c = convosMap.get(otherId)!;
          c.unread_count++;
        }
      });
      setConversations(Array.from(convosMap.values()));
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
      fontFamily: "'Satoshi', sans-serif"
    }}>
      {/* Sidebar: Conversation List */}
      <div style={{ 
        width: selectedChat ? "350px" : "100%", 
        borderRight: `1px solid ${T.border}`,
        display: selectedChat ? "none" : "flex",
        flexDirection: "column",
        backgroundColor: T.panel
      }}>
        <div style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <div style={{ padding: "0.4rem", borderRadius: "8px", backgroundColor: T.accentSoft }}>
               <MessageSquare size={18} color={T.accent} />
            </div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, fontFamily: "'Clash Display', sans-serif" }}>Messages</h1>
          </div>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: T.dim }} />
            <input 
              placeholder="Search conversations..."
              style={{
                width: "100%",
                padding: "0.5rem 0.5rem 0.5rem 2rem",
                borderRadius: "10px",
                border: `1px solid ${T.border}`,
                backgroundColor: T.input,
                color: T.text,
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: T.dim }}>Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "3rem 2rem", textAlign: "center", color: T.muted }}>
              <div style={{ marginBottom: "0.8rem", opacity: 0.5 }}>
                <MessageSquare size={40} style={{ margin: "0 auto" }} />
              </div>
              <p>No messages yet. Start a conversation from the Community or Portfolio pages!</p>
            </div>
          ) : (
            conversations.map(convo => (
              <div 
                key={convo.other_user_id}
                onClick={() => {
                  setSelectedChat(convo);
                  fetchMessages(convo.other_user_id);
                }}
                style={{
                  padding: "1rem",
                  borderBottom: `1px solid ${T.border}`,
                  cursor: "pointer",
                  display: "flex",
                  gap: "0.8rem",
                  backgroundColor: selectedChat?.other_user_id === convo.other_user_id ? T.accentSoft : "transparent",
                  transition: "background 0.2s ease"
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
                  fontWeight: 700,
                  position: "relative"
                }}>
                  {!convo.other_user_avatar && convo.other_user_name.charAt(0)}
                  {convo.unread_count > 0 && (
                    <div style={{ 
                      position: "absolute", 
                      top: 0, 
                      right: 0, 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%", 
                      backgroundColor: T.accent,
                      border: `2px solid ${T.panel}`
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {convo.other_user_name}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: T.dim }}>
                      {timeAgo(convo.last_message_at)}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: "0.8rem", 
                    color: convo.unread_count > 0 ? T.text : T.muted, 
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: convo.unread_count > 0 ? 600 : 400
                  }}>
                    {convo.last_message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Chat View */}
      <div style={{ 
        flex: 1, 
        display: selectedChat ? "flex" : "none", 
        flexDirection: "column",
        backgroundColor: T.pageBg
      }}>
        {selectedChat && (
          <>
            <div style={{ 
              padding: "0.8rem 1.5rem", 
              borderBottom: `1px solid ${T.border}`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              backgroundColor: T.panel
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <button 
                  onClick={() => setSelectedChat(null)}
                  style={{ display: "flex", background: "none", border: "none", color: T.dim, cursor: "pointer", padding: "0.4rem" }}
                  className="mobile-back"
                >
                  <ArrowLeft size={20} />
                </button>
                <div style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: T.accent,
                  backgroundImage: selectedChat.other_user_avatar ? `url(${selectedChat.other_user_avatar})` : "none",
                  backgroundSize: "cover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700
                }}>
                  {!selectedChat.other_user_avatar && selectedChat.other_user_name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: "0.95rem" }}>{selectedChat.other_user_name}</p>
                  <p style={{ fontSize: "0.75rem", color: T.accent, margin: 0 }}>Active now</p>
                </div>
              </div>
              <button style={{ background: "none", border: "none", color: T.dim, cursor: "pointer" }}>
                <MoreVertical size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const isMine = m.sender_id === user.id;
                  return (
                    <motion.div 
                      key={m.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start"
                      }}
                    >
                      <div style={{
                        padding: "0.7rem 1rem",
                        borderRadius: isMine ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                        backgroundColor: isMine ? T.accent : T.panel,
                        color: isMine ? "#fff" : T.text,
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}>
                        {m.content}
                      </div>
                      <span style={{ fontSize: "0.65rem", color: T.dim, marginTop: "0.3rem" }}>
                        {timeAgo(m.created_at)}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div style={{ padding: "1.2rem 1.5rem", borderTop: `1px solid ${T.border}`, backgroundColor: T.panel }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.8rem",
                backgroundColor: T.input,
                borderRadius: "14px",
                padding: "0.4rem 0.6rem",
                border: `1px solid ${T.border}`
              }}>
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    color: T.text,
                    fontSize: "0.9rem",
                    padding: "0.5rem",
                    outline: "none"
                  }}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    backgroundColor: T.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.5rem 0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "opacity 0.2s"
                  }}
                >
                  <Send size={16} />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{sending ? "..." : "Send"}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .mobile-back {
          display: none;
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
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
