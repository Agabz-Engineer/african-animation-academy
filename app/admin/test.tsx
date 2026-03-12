"use client";

export default function AdminTest() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🎯 Admin Test Page</h1>
      <p>If you can see this page, the admin route is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Deployment status: ✅ Active</p>
    </div>
  );
}
