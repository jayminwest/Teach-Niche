import { requireAdmin } from "@/lib/auth-utils"
import AdminDashboardClient from "./admin-dashboard-client"

export default async function AdminPage() {
  // Check if the user is an admin - this will redirect if not authorized
  await requireAdmin();
  
  return <AdminDashboardClient />;
}