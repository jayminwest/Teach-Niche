import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createServerClient();

  // Get the current user (more secure than getSession)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // User is not logged in
    redirect("/auth/sign-in");
  }

  // Get the user's role from the database
  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData || userData.role !== 'admin') {
    // User is not an admin
    console.log("Access denied: User is not an admin");
    redirect("/dashboard");
  }

  // User is an admin, return the user data for later use if needed
  return {
    user: user,
    role: userData.role
  };
}

export async function getRole() {
  const supabase = await createServerClient();

  // Get the current user (more secure than getSession)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get the user's role from the database
  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    return null;
  }

  return userData.role;
}
