"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  Flag,
  MoreVertical,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  User,
  Image,
  Video,
  FileText,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  approvePost, 
  rejectPost, 
  flagPost, 
  deletePost, 
  bulkApprovePosts, 
  bulkRejectPosts, 
  bulkDeletePosts 
} from "@/app/admin/actions";

const DARK_UI = {
  bg: "#0F0F0F",
  card: "#1E1E1E",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textMuted: "#A0A0A0",
  accent: "#FF8C00",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const LIGHT_UI = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#1F2937",
  textMuted: "#6B7280",
  accent: "#FF8C00",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reports_count?: number;
}

export default function CommunityManagement() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!inner (full_name, avatar_url),
          community_reports (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include reports count
      const transformedPosts = (data || []).map((post: any) => ({
        ...post,
        reports_count: post.community_reports?.length || 0,
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.profiles?.full_name && post.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handlePostAction = async (action: string, postId: string) => {
    try {
      let result;
      switch (action) {
        case 'approve':
          result = await approvePost(postId);
          break;
        case 'reject':
          result = await rejectPost(postId);
          break;
        case 'flag':
          result = await flagPost(postId);
          break;
        case 'delete':
          result = await deletePost(postId);
          break;
      }
      
      await fetchPosts();
    } catch (error) {
      console.error('Error performing post action:', error);
      alert('Failed to perform post action. Please check console for details.');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) return;

    try {
      switch (action) {
        case 'approve_all':
          await bulkApprovePosts(selectedPosts);
          break;
        case 'reject_all':
          await bulkRejectPosts(selectedPosts);
          break;
        case 'delete_all':
          await bulkDeletePosts(selectedPosts);
          break;
      }
      
      setSelectedPosts([]);
      await fetchPosts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action. Please check console for details.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: UI.warning,
      approved: UI.success,
      rejected: UI.danger,
      flagged: UI.info,
    };
    
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      flagged: AlertTriangle,
    };
    
    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: `${colors[status as keyof typeof colors]}20`,
        color: colors[status as keyof typeof colors],
      }}>
        <Icon style={{ width: '12px', height: '12px' }} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getMediaTypeIcon = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <Image style={{ width: "16px", height: "16px" }} />;
    } else if (url.match(/\.(mp4|webm|mov)$/i)) {
      return <Video style={{ width: "16px", height: "16px" }} />;
    } else {
      return <FileText style={{ width: "16px", height: "16px" }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px" 
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: `3px solid ${UI.border}`, 
          borderTopColor: UI.accent, 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <div>
          <h1 style={{ 
            color: UI.text, 
            fontSize: "2rem", 
            fontWeight: 700, 
            margin: "0 0 0.5rem 0" 
          }}>
            Community Management
          </h1>
          <p style={{ 
            color: UI.textMuted, 
            fontSize: "1rem", 
            margin: 0 
          }}>
            Moderate and manage community posts and content
          </p>
        </div>
        <button
          onClick={fetchPosts}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: UI.accent,
            color: "#FFFFFF",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <RefreshCw style={{ width: "16px", height: "16px" }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: UI.card,
        border: `1px solid ${UI.border}`,
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: UI.bg,
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: `1px solid ${UI.border}`,
          flex: 1,
          minWidth: "300px",
        }}>
          <Search style={{ width: "16px", height: "16px", color: UI.textMuted }} />
          <input
            type="text"
            placeholder="Search posts by content or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: UI.text,
              fontSize: "0.875rem",
              flex: 1,
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: `1px solid ${UI.border}`,
            backgroundColor: UI.bg,
            color: UI.text,
            fontSize: "0.875rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>

        {selectedPosts.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => handleBulkAction('approve_all')}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                backgroundColor: UI.success,
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Approve ({selectedPosts.length})
            </button>
            <button
              onClick={() => handleBulkAction('reject_all')}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                backgroundColor: UI.warning,
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Reject ({selectedPosts.length})
            </button>
            <button
              onClick={() => handleBulkAction('delete_all')}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                backgroundColor: UI.danger,
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Delete ({selectedPosts.length})
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.info, marginBottom: "0.5rem" }}>
            {posts.length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Total Posts</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.warning, marginBottom: "0.5rem" }}>
            {posts.filter(p => p.status === 'pending').length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Pending Review</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.info, marginBottom: "0.5rem" }}>
            {posts.filter(p => p.status === 'flagged').length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Flagged</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.danger, marginBottom: "0.5rem" }}>
            {posts.reduce((sum, p) => sum + (p.reports_count || 0), 0)}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Total Reports</div>
        </div>
      </div>

      {/* Posts List */}
      <div style={{
        backgroundColor: UI.card,
        border: `1px solid ${UI.border}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}>
        {filteredPosts.length === 0 ? (
          <div style={{
            padding: "3rem",
            textAlign: "center",
            color: UI.textMuted,
          }}>
            <MessageSquare style={{ width: "48px", height: "48px", margin: "0 auto 1rem", opacity: 0.5 }} />
            <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>No posts found</p>
            <p style={{ fontSize: "0.875rem" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  borderBottom: `1px solid ${UI.border}`,
                  padding: "1.5rem",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Post Header */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                        }
                      }}
                    />
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: UI.bg,
                      backgroundImage: post.profiles?.avatar_url ? `url(${post.profiles.avatar_url})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: UI.textMuted,
                    }}>
                      {!post.profiles?.avatar_url && <User style={{ width: "20px", height: "20px" }} />}
                    </div>
                    <div>
                      <div style={{ 
                        color: UI.text, 
                        fontSize: "0.875rem", 
                        fontWeight: 600, 
                        marginBottom: "0.25rem" 
                      }}>
                        {post.profiles?.full_name || 'Unknown User'}
                      </div>
                      <div style={{ 
                        color: UI.textMuted, 
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}>
                        <Clock style={{ width: "12px", height: "12px" }} />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {getStatusBadge(post.status)}
                    {post.reports_count && post.reports_count > 0 && (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: `${UI.danger}20`,
                        color: UI.danger,
                      }}>
                        <Flag style={{ width: "12px", height: "12px" }} />
                        {post.reports_count} reports
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div style={{
                  color: UI.text,
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  marginBottom: "1rem",
                  whiteSpace: "pre-wrap",
                }}>
                  {post.content}
                </div>

                {/* Media */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                  }}>
                    {post.media_urls.map((url, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: `1px solid ${UI.border}`,
                          backgroundColor: UI.bg,
                        }}
                      >
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div style={{
                            width: "100px",
                            height: "100px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: UI.textMuted,
                            fontSize: "0.75rem",
                            padding: "0.5rem",
                            textAlign: "center",
                          }}>
                            {getMediaTypeIcon(url)}
                            <span style={{ marginTop: "0.25rem" }}>Media</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: UI.textMuted,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Heart style={{ width: "14px", height: "14px" }} />
                    {post.likes_count}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <MessageCircle style={{ width: "14px", height: "14px" }} />
                    {post.comments_count}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Share2 style={{ width: "14px", height: "14px" }} />
                    {post.shares_count}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setShowPostModal(true);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      backgroundColor: UI.info,
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    <Eye style={{ width: "14px", height: "14px", marginRight: "0.5rem" }} />
                    View Details
                  </button>
                  
                  {post.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handlePostAction('approve', post.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          backgroundColor: UI.success,
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        <CheckCircle style={{ width: "14px", height: "14px", marginRight: "0.5rem" }} />
                        Approve
                      </button>
                      <button
                        onClick={() => handlePostAction('reject', post.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          backgroundColor: UI.warning,
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        <XCircle style={{ width: "14px", height: "14px", marginRight: "0.5rem" }} />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {post.status === 'approved' && (
                    <button
                      onClick={() => handlePostAction('flag', post.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        backgroundColor: UI.info,
                        color: "#FFFFFF",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      <AlertTriangle style={{ width: "14px", height: "14px", marginRight: "0.5rem" }} />
                      Flag
                    </button>
                  )}
                  
                  <button
                    onClick={() => handlePostAction('delete', post.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      backgroundColor: UI.danger,
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    <Trash2 style={{ width: "14px", height: "14px", marginRight: "0.5rem" }} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {showPostModal && selectedPost && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "2rem",
        }}>
          <div style={{
            backgroundColor: UI.card,
            border: `1px solid ${UI.border}`,
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "1.5rem",
            }}>
              <h2 style={{ 
                color: UI.text, 
                fontSize: "1.5rem", 
                fontWeight: 700, 
                margin: 0 
              }}>
                Post Details
              </h2>
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setSelectedPost(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: UI.textMuted,
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <XCircle style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ color: UI.textMuted, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>
                  Author
                </label>
                <p style={{ color: UI.text, fontSize: "1rem", margin: 0 }}>
                  {selectedPost.profiles?.full_name || 'Unknown User'}
                </p>
              </div>

              <div>
                <label style={{ color: UI.textMuted, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>
                  Status
                </label>
                {getStatusBadge(selectedPost.status)}
              </div>

              <div>
                <label style={{ color: UI.textMuted, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>
                  Content
                </label>
                <p style={{ 
                  color: UI.text, 
                  fontSize: "1rem", 
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}>
                  {selectedPost.content}
                </p>
              </div>

              <div>
                <label style={{ color: UI.textMuted, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>
                  Engagement
                </label>
                <div style={{ display: "flex", gap: "2rem" }}>
                  <div>
                    <span style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Likes: </span>
                    <span style={{ color: UI.text, fontSize: "1rem", fontWeight: 600 }}>
                      {selectedPost.likes_count}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Comments: </span>
                    <span style={{ color: UI.text, fontSize: "1rem", fontWeight: 600 }}>
                      {selectedPost.comments_count}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Shares: </span>
                    <span style={{ color: UI.text, fontSize: "1rem", fontWeight: 600 }}>
                      {selectedPost.shares_count}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ color: UI.textMuted, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>
                  Created
                </label>
                <p style={{ color: UI.text, fontSize: "1rem", margin: 0 }}>
                  {new Date(selectedPost.created_at).toLocaleString()}
                </p>
              </div>

              {selectedPost.reports_count && selectedPost.reports_count > 0 && (
                <div>
                  <label style={{ color: UI.textMuted, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>
                    Reports
                  </label>
                  <p style={{ color: UI.danger, fontSize: "1rem", margin: 0 }}>
                    {selectedPost.reports_count} user reports
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
