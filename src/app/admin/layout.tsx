import { verifyAdmin } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await verifyAdmin();

  return (
    <div className="min-h-screen">
      <AdminSidebar userName={admin.name || "Admin"} />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
