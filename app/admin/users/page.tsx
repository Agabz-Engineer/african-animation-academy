"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Shield, 
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  UserPlus,
  RefreshCw
} from "lucide-react";
import { banUser, unbanUser, createAdminUser, deleteUser, getAdminUsers, setUserRole, syncProfilesFromAuth } from "@/app/admin/actions";

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

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  skill_level?: string | null;
  created_at: string;
  last_sign_in?: string | null;
  subscription_tier?: string | null;
  status: string;
}

export default function UserManagement() {
  const [theme] = useState<"dark" | "light">("dark");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingProfiles, setSyncingProfiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userError, setUserError] = useState("");

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { users } = await getAdminUsers();
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProfiles = async () => {
    setSyncingProfiles(true);
    try {
      const result = await syncProfilesFromAuth();
      await fetchUsers();
      alert(`Synced profiles. Inserted ${result.inserted} of ${result.total} users.`);
    } catch (error) {
      console.error('Error syncing profiles:', error);
      alert('Failed to sync profiles. Make sure the profiles table exists.');
    } finally {
      setSyncingProfiles(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'ban':
          await banUser(userId);
          break;
        case 'unban':
          await unbanUser(userId);
          break;
        case 'delete':
          await deleteUser(userId);
          break;
        case 'make_admin':
          await setUserRole(userId, 'admin');
          break;
        case 'remove_admin':
          await setUserRole(userId, 'user');
          break;
      }
      
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const nextSelected = users.find((user) => user.id === userId) || null;
        setSelectedUser(nextSelected);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      alert('Failed to perform user action. Please check console for details.');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case 'export':
          const csvContent = [
            ['Email', 'Name', 'Role', 'Status', 'Created At'],
            ...users
              .filter(user => selectedUsers.includes(user.id))
              .map(user => [
                user.email,
                user.full_name || '',
                user.role,
                user.status,
                new Date(user.created_at).toLocaleDateString()
              ])
          ].map(row => row.join(',')).join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'users_export.csv';
          a.click();
          window.URL.revokeObjectURL(url);
          break;
        
        case 'bulk_email':
          // Implement bulk email functionality
          console.log('Send bulk email to:', selectedUsers);
          break;
        
        case 'bulk_delete':
          for (const userId of selectedUsers) {
            await handleUserAction('delete', userId);
          }
          setSelectedUsers([]);
          break;
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleCreateUser = async (input: {
    email: string;
    password: string;
    fullName: string;
    role: "user" | "admin" | "moderator";
  }) => {
    setCreatingUser(true);
    setUserError("");

    try {
      await createAdminUser(input);
      await fetchUsers();
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: UI.success,
      inactive: UI.warning,
      banned: UI.danger,
    };
    
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
        {status === 'active' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
        {status === 'inactive' && <Clock style={{ width: '12px', height: '12px' }} />}
        {status === 'banned' && <XCircle style={{ width: '12px', height: '12px' }} />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: UI.danger,
      user: UI.info,
      moderator: UI.warning,
    };
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: `${colors[role as keyof typeof colors]}20`,
        color: colors[role as keyof typeof colors],
      }}>
        <Shield style={{ width: '12px', height: '12px' }} />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
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
        flexDirection: "column", 
        gap: "1rem",
        marginBottom: "2rem" 
      }}>
        <div>
          <h1 style={{ 
            color: UI.text, 
            fontSize: "2rem", 
            fontWeight: 700, 
            margin: "0 0 0.5rem 0" 
          }}>
            User Management
          </h1>
          <p style={{ 
            color: UI.textMuted, 
            fontSize: "1rem", 
            margin: 0 
          }}>
            Manage and monitor all platform users
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => handleBulkAction('export')}
            disabled={selectedUsers.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              backgroundColor: selectedUsers.length > 0 ? UI.info : UI.border,
              color: selectedUsers.length > 0 ? "#FFFFFF" : UI.textMuted,
              border: "none",
              cursor: selectedUsers.length > 0 ? "pointer" : "not-allowed",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            Export ({selectedUsers.length})
          </button>
          <button
            onClick={handleSyncProfiles}
            disabled={syncingProfiles}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              backgroundColor: syncingProfiles ? UI.border : UI.accent,
              color: syncingProfiles ? UI.textMuted : "#FFFFFF",
              border: "none",
              cursor: syncingProfiles ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            <RefreshCw style={{ width: "16px", height: "16px" }} />
            {syncingProfiles ? "Syncing..." : "Sync Profiles"}
          </button>
          <button
            onClick={() => setShowUserModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              backgroundColor: UI.success,
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            <UserPlus style={{ width: "16px", height: "16px" }} />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: UI.card,
        border: `1px solid ${UI.border}`,
        borderRadius: "12px",
        padding: "1rem",
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
          minWidth: "200px",
        }}>
          <Search style={{ width: "16px", height: "16px", color: UI.textMuted }} />
          <input
            type="text"
            placeholder="Search users by email or name..."
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
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
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
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
          <option value="moderator">Moderators</option>
        </select>
        
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>

        <button
          onClick={fetchUsers}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
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
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.info, marginBottom: "0.5rem" }}>
            {users.length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Total Users</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.success, marginBottom: "0.5rem" }}>
            {users.filter(u => u.status === 'active').length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Active Users</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.warning, marginBottom: "0.5rem" }}>
            {users.filter(u => u.status === 'banned').length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Banned Users</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.danger, marginBottom: "0.5rem" }}>
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Admins</div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: UI.card,
        border: `1px solid ${UI.border}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${UI.border}` }}>
                <th style={{ 
                  padding: "1rem", 
                  textAlign: "left", 
                  color: UI.textMuted, 
                  fontSize: "0.875rem", 
                  fontWeight: 600 
                }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    style={{ marginRight: "0.5rem" }}
                  />
                  User
                </th>
                <th style={{ padding: "1rem", textAlign: "left", color: UI.textMuted, fontSize: "0.875rem", fontWeight: 600 }}>
                  Role
                </th>
                <th style={{ padding: "1rem", textAlign: "left", color: UI.textMuted, fontSize: "0.875rem", fontWeight: 600 }}>
                  Status
                </th>
                <th style={{ padding: "1rem", textAlign: "left", color: UI.textMuted, fontSize: "0.875rem", fontWeight: 600 }}>
                  Skill Level
                </th>
                <th style={{ padding: "1rem", textAlign: "left", color: UI.textMuted, fontSize: "0.875rem", fontWeight: 600 }}>
                  Joined
                </th>
                <th style={{ padding: "1rem", textAlign: "left", color: UI.textMuted, fontSize: "0.875rem", fontWeight: 600 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${UI.border}` }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <div>
                        <div style={{ 
                          color: UI.text, 
                          fontSize: "0.875rem", 
                          fontWeight: 500, 
                          marginBottom: "0.25rem" 
                        }}>
                          {user.full_name || 'Unknown User'}
                        </div>
                        <div style={{ color: UI.textMuted, fontSize: "0.75rem" }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {getRoleBadge(user.role)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {getStatusBadge(user.status)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      color: UI.textMuted,
                      fontSize: "0.875rem",
                    }}>
                      {user.skill_level || 'Not set'}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "6px",
                          backgroundColor: UI.info,
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Eye style={{ width: "14px", height: "14px" }} />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction('ban', user.id)}
                          style={{
                            padding: "0.5rem",
                            borderRadius: "6px",
                            backgroundColor: UI.warning,
                            color: "#FFFFFF",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Ban style={{ width: "14px", height: "14px" }} />
                        </button>
                      ) : user.status === 'banned' ? (
                        <button
                          onClick={() => handleUserAction('unban', user.id)}
                          style={{
                            padding: "0.5rem",
                            borderRadius: "6px",
                            backgroundColor: UI.success,
                            color: "#FFFFFF",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <CheckCircle style={{ width: "14px", height: "14px" }} />
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleUserAction('delete', user.id)}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "6px",
                          backgroundColor: UI.danger,
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 style={{ width: "14px", height: "14px" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
	      </div>

      {showUserModal && (
        <UserModal
          user={selectedUser}
          creating={creatingUser}
          error={userError}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
            setUserError("");
          }}
          onCreate={handleCreateUser}
          onToggleRole={async () => {
            if (!selectedUser) return;
            await handleUserAction(selectedUser.role === "admin" ? "remove_admin" : "make_admin", selectedUser.id);
            await fetchUsers();
          }}
          onToggleStatus={async () => {
            if (!selectedUser) return;
            await handleUserAction(selectedUser.status === "banned" ? "unban" : "ban", selectedUser.id);
            await fetchUsers();
          }}
          UI={UI}
        />
      )}

	      <style jsx>{`
	        @keyframes spin {
	          to { transform: rotate(360deg); }
	        }
	      `}</style>
	    </div>
	  );
}

function UserModal({
  user,
  creating,
  error,
  onClose,
  onCreate,
  onToggleRole,
  onToggleStatus,
  UI,
}: {
  user: User | null;
  creating: boolean;
  error: string;
  onClose: () => void;
  onCreate: (input: {
    email: string;
    password: string;
    fullName: string;
    role: "user" | "admin" | "moderator";
  }) => Promise<void>;
  onToggleRole: () => Promise<void>;
  onToggleStatus: () => Promise<void>;
  UI: typeof DARK_UI;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "admin" | "moderator">("user");

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", zIndex: 1000 }}>
      <div style={{ width: "100%", maxWidth: "520px", backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "16px", padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, color: UI.text, fontSize: "1.2rem" }}>{user ? "User Details" : "Create User"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: UI.textMuted, cursor: "pointer" }}>Close</button>
        </div>

        {error && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: "10px", border: `1px solid ${UI.danger}55`, backgroundColor: `${UI.danger}12`, color: UI.danger }}>
            {error}
          </div>
        )}

        {user ? (
          <div style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <div style={{ color: UI.textMuted, fontSize: "0.78rem" }}>Name</div>
              <div style={{ color: UI.text, fontWeight: 600 }}>{user.full_name || "Unknown User"}</div>
            </div>
            <div>
              <div style={{ color: UI.textMuted, fontSize: "0.78rem" }}>Email</div>
              <div style={{ color: UI.text }}>{user.email}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
              <button onClick={() => void onToggleRole()} style={{ padding: "0.7rem", borderRadius: "8px", border: "none", backgroundColor: UI.info, color: "#fff", cursor: "pointer" }}>
                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>
              <button onClick={() => void onToggleStatus()} style={{ padding: "0.7rem", borderRadius: "8px", border: "none", backgroundColor: user.status === "banned" ? UI.success : UI.warning, color: "#fff", cursor: "pointer" }}>
                {user.status === "banned" ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" style={modalInput(UI)} />
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" style={modalInput(UI)} />
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" style={modalInput(UI)} />
            <select value={role} onChange={(event) => setRole(event.target.value as "user" | "admin" | "moderator")} style={modalInput(UI)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            <button
              onClick={() => void onCreate({ email, password, fullName, role })}
              disabled={creating}
              style={{ padding: "0.8rem", borderRadius: "8px", border: "none", backgroundColor: UI.success, color: "#fff", cursor: creating ? "wait" : "pointer", opacity: creating ? 0.7 : 1 }}
            >
              {creating ? "Creating..." : "Create User"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function modalInput(UI: typeof DARK_UI) {
  return {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: `1px solid ${UI.border}`,
    backgroundColor: UI.bg,
    color: UI.text,
    fontSize: "0.9rem",
  };
}
