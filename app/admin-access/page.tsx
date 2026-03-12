"use client";

export default function AdminAccess() {
  return (
    <div style={{ 
      padding: "2rem", 
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
      backgroundColor: "#1a1a1a",
      color: "#ffffff",
      minHeight: "100vh"
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        🎯 Admin Access Portal
      </h1>
      
      <div style={{ 
        backgroundColor: "#2a2a2a", 
        padding: "2rem", 
        borderRadius: "12px",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <h2 style={{ color: "#FF6D1F", marginBottom: "1rem" }}>
          Direct Admin Access
        </h2>
        
        <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
          This page provides direct access to the admin dashboard without authentication checks.
          Use this to test admin functionality while we resolve the authentication issues.
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <a 
            href="/admin/users"
            style={{
              display: "block",
              padding: "1rem",
              backgroundColor: "#FF6D1F",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#E04D00";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#FF6D1F";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            👥 User Management
          </a>
          
          <a 
            href="/admin/courses"
            style={{
              display: "block",
              padding: "1rem",
              backgroundColor: "#FF6D1F",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#E04D00";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#FF6D1F";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            📚 Course Management
          </a>
          
          <a 
            href="/admin/community"
            style={{
              display: "block",
              padding: "1rem",
              backgroundColor: "#FF6D1F",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#E04D00";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#FF6D1F";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            💬 Community Management
          </a>
          
          <a 
            href="/admin"
            style={{
              display: "block",
              padding: "1rem",
              backgroundColor: "#10B981",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#059669";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#10B981";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            📊 Main Dashboard
          </a>
        </div>
        
        <div style={{ 
          marginTop: "2rem", 
          padding: "1rem", 
          backgroundColor: "#333333", 
          borderRadius: "8px",
          fontSize: "0.875rem"
        }}>
          <h3 style={{ color: "#FF6D1F", marginBottom: "0.5rem" }}>
            🚀 Alternative Admin Links
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              📁 <strong>Original Admin:</strong> 
              <a href="/admin" style={{ color: "#FF6D1F", textDecoration: "none" }}>
                https://animated-collective-app.vercel.app/admin
              </a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              🎯 <strong>Direct Access:</strong>
              <a href="/admin-access" style={{ color: "#10B981", textDecoration: "none" }}>
                https://animated-collective-app.vercel.app/admin-access
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
