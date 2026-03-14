"use client";

import { useState } from "react";
import { Send, X, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  contextTitle?: string;
}

export default function MessageModal({ isOpen, onClose, receiverId, receiverName, contextTitle }: MessageModalProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || !supabase || sending) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === receiverId) {
      setSending(false);
      return;
    }

    const { error } = await supabase
      .from("direct_messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: contextTitle 
          ? `Regarding "${contextTitle}": ${content}`
          : content
      });

    if (!error) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setContent("");
        onClose();
      }, 2000);
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)"
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              width: "100%",
              maxWidth: "450px",
              backgroundColor: "#222",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "1.5rem",
              position: "relative",
              color: "#fff"
            }}
          >
            <button 
              onClick={onClose}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "#888" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: "rgba(255,109,31,0.15)" }}>
                <MessageSquare style={{ color: "#FF6D1F" }} size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>Message {receiverName}</h3>
                {contextTitle && <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Regarding: {contextTitle}</p>}
              </div>
            </div>

            {sent ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  <Send size={24} />
                </div>
                <h4 style={{ margin: 0, color: "#22c55e" }}>Message Sent!</h4>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#888" }}>Closing dialog...</p>
              </div>
            ) : (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message here..."
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "1rem",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontFamily: "'General Sans', sans-serif",
                    resize: "none",
                    outline: "none",
                    marginBottom: "1.25rem"
                  }}
                />

                <button
                  disabled={sending || !content.trim()}
                  onClick={handleSend}
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    borderRadius: "12px",
                    backgroundColor: sending ? "#444" : "#FF6D1F",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: sending ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Send Message</>}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
