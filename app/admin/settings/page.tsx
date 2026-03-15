"use client";

import { useState } from "react";
import { Settings, Shield, Database, CheckCircle } from "lucide-react";

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

const STORAGE_KEY = "africafx-admin-settings";

interface AdminSettingsState {
  maintenanceMode: boolean;
  allowSignups: boolean;
  postModeration: boolean;
  paymentSandbox: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_SETTINGS: AdminSettingsState = {
  maintenanceMode: false,
  allowSignups: true,
  postModeration: true,
  paymentSandbox: true,
  weeklyDigest: true,
};

export default function AdminSettingsPage() {
  const [theme] = useState<"dark" | "light">("dark");
  const [settings, setSettings] = useState<AdminSettingsState>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.warn("Failed to load admin settings:", error);
      return DEFAULT_SETTINGS;
    }
  });
  const [saved, setSaved] = useState(false);

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  const toggleSetting = (key: keyof AdminSettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ color: UI.text, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>Admin Settings</h1>
        <p style={{ color: UI.textMuted, fontSize: "0.95rem", margin: 0 }}>
          Configure platform-wide toggles and operational controls.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Shield style={{ width: "18px", height: "18px", color: UI.accent }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Platform Controls</h3>
          </div>
          <ToggleRow
            label="Maintenance mode"
            description="Put the site into read-only mode for visitors."
            checked={settings.maintenanceMode}
            onToggle={() => toggleSetting("maintenanceMode")}
            UI={UI}
          />
          <ToggleRow
            label="Allow new signups"
            description="Enable or disable new account creation."
            checked={settings.allowSignups}
            onToggle={() => toggleSetting("allowSignups")}
            UI={UI}
          />
        </div>

        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Settings style={{ width: "18px", height: "18px", color: UI.info }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Content Governance</h3>
          </div>
          <ToggleRow
            label="Require post approval"
            description="Moderate community posts before they go live."
            checked={settings.postModeration}
            onToggle={() => toggleSetting("postModeration")}
            UI={UI}
          />
          <ToggleRow
            label="Weekly admin digest"
            description="Receive a weekly activity summary by email."
            checked={settings.weeklyDigest}
            onToggle={() => toggleSetting("weeklyDigest")}
            UI={UI}
          />
        </div>

        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Database style={{ width: "18px", height: "18px", color: UI.warning }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Billing & Integrations</h3>
          </div>
          <ToggleRow
            label="Payment sandbox"
            description="Use test payments only."
            checked={settings.paymentSandbox}
            onToggle={() => toggleSetting("paymentSandbox")}
            UI={UI}
          />
          <ToggleRow
            label="Notification alerts"
            description="Send alerts for failed payments or fraud flags."
            checked={true}
            onToggle={() => {}}
            UI={UI}
            disabled
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={saveSettings}
          style={{
            backgroundColor: UI.accent,
            border: "none",
            color: "#FFFFFF",
            padding: "0.6rem 1.1rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          Save settings
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
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  UI: typeof DARK_UI;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 0" }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 0.2rem 0", color: UI.text, fontWeight: 600, fontSize: "0.85rem" }}>{label}</p>
        <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.78rem" }}>{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
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
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#FFFFFF" }} />
      </button>
    </div>
  );
}
