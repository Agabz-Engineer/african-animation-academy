"use client";

import { useEffect, useState } from "react";
import { Settings, Shield, Database, CheckCircle } from "lucide-react";
import { getAdminSettings, saveAdminSettings } from "@/app/admin/actions";
import { getAdminActionAccessToken } from "@/lib/adminClientAuth";

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

interface AdminSettingsState {
  maintenanceMode: boolean;
  allowSignups: boolean;
  postModeration: boolean;
  paymentSandbox: boolean;
  weeklyDigest: boolean;
  notificationAlerts: boolean;
}

const DEFAULT_SETTINGS: AdminSettingsState = {
  maintenanceMode: false,
  allowSignups: true,
  postModeration: true,
  paymentSandbox: true,
  weeklyDigest: true,
  notificationAlerts: true,
};

export default function AdminSettingsPage() {
  const [theme] = useState<"dark" | "light">("dark");
  const [settings, setSettings] = useState<AdminSettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const accessToken = await getAdminActionAccessToken();
        if (!accessToken) throw new Error("Admin access required.");
        const data = await getAdminSettings(accessToken);
        if (!active) return;
        setSettings({
          maintenanceMode: data.maintenance_mode,
          allowSignups: data.allow_signups,
          postModeration: data.post_moderation,
          paymentSandbox: data.payment_sandbox,
          weeklyDigest: data.weekly_digest,
          notificationAlerts: data.notification_alerts,
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load settings.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const toggleSetting = (key: keyof AdminSettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const accessToken = await getAdminActionAccessToken();
      if (!accessToken) throw new Error("Admin access required.");
      await saveAdminSettings(accessToken, {
        maintenance_mode: settings.maintenanceMode,
        allow_signups: settings.allowSignups,
        post_moderation: settings.postModeration,
        payment_sandbox: settings.paymentSandbox,
        weekly_digest: settings.weeklyDigest,
        notification_alerts: settings.notificationAlerts,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: UI.textMuted, fontFamily: "Inter, sans-serif" }}>Loading settings...</div>;
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ color: UI.text, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>Admin Settings</h1>
        <p style={{ color: UI.textMuted, fontSize: "0.95rem", margin: 0 }}>
          Configure platform-wide toggles and operational controls.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: "1rem", padding: "0.8rem 1rem", borderRadius: "10px", border: `1px solid ${UI.danger}55`, color: UI.danger, backgroundColor: `${UI.danger}12` }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Shield style={{ width: "18px", height: "18px", color: UI.accent }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Platform Controls</h3>
          </div>
          <ToggleRow label="Maintenance mode" description="Show a maintenance banner and block restricted flows like checkout and community posting." checked={settings.maintenanceMode} onToggle={() => toggleSetting("maintenanceMode")} UI={UI} />
          <ToggleRow label="Allow new signups" description="Enable or disable new account creation." checked={settings.allowSignups} onToggle={() => toggleSetting("allowSignups")} UI={UI} />
        </div>

        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Settings style={{ width: "18px", height: "18px", color: UI.info }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Content Governance</h3>
          </div>
          <ToggleRow label="Require post approval" description="New community posts enter admin review before appearing publicly." checked={settings.postModeration} onToggle={() => toggleSetting("postModeration")} UI={UI} />
          <ToggleRow label="Weekly admin digest" description="Keep weekly digest delivery enabled for admin updates." checked={settings.weeklyDigest} onToggle={() => toggleSetting("weeklyDigest")} UI={UI} />
        </div>

        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Database style={{ width: "18px", height: "18px", color: UI.warning }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Billing & Integrations</h3>
          </div>
          <ToggleRow label="Payment sandbox" description="Use sandbox/test payment credentials when available." checked={settings.paymentSandbox} onToggle={() => toggleSetting("paymentSandbox")} UI={UI} />
          <ToggleRow label="Notification alerts" description="Keep admin alert messages enabled for payment or moderation issues." checked={settings.notificationAlerts} onToggle={() => toggleSetting("notificationAlerts")} UI={UI} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: UI.accent,
            border: "none",
            color: "#FFFFFF",
            padding: "0.6rem 1.1rem",
            borderRadius: "8px",
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontFamily: "Inter, sans-serif",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        {saved && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: UI.success, fontSize: "0.85rem", fontWeight: 600 }}>
            <CheckCircle style={{ width: "16px", height: "16px" }} />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
  UI,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  UI: typeof DARK_UI;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 0" }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 0.2rem 0", color: UI.text, fontWeight: 600, fontSize: "0.85rem" }}>{label}</p>
        <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.78rem" }}>{description}</p>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: "44px",
          height: "24px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: checked ? UI.success : UI.border,
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start",
          padding: "3px",
          cursor: "pointer",
        }}
      >
        <span style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#FFFFFF" }} />
      </button>
    </div>
  );
}
