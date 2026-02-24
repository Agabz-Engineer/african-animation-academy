import DashboardLayout from "@/app/components/ui/DashboardLayout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}