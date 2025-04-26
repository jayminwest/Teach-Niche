import { requireAdmin } from "@/lib/auth-utils"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import EditUserForm from "../../edit/edit-user-form"

// In Next.js 15, params is a Promise that needs to be awaited
interface PageParams {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditUserPage(props: PageParams) {
  // Check if the user is an admin - this will redirect if not authorized
  await requireAdmin();
  
  // Await params to get the actual values in Next.js 15
  const resolvedParams = await props.params;
  const userId = resolvedParams.id;
  
  if (!userId) {
    redirect('/admin/users');
  }
  
  const supabase = createServerComponentClient({ cookies });
  
  // Get user data
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error || !user) {
    console.error("Error fetching user:", error?.message);
    redirect('/admin/users');
  }
  
  return <EditUserForm user={user} />;
}