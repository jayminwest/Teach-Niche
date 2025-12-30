import { requireAdmin } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default async function UsersPage() {
  // Check if the user is an admin - this will redirect if not authorized
  await requireAdmin();

  const supabase = await createServerClient()
  
  // Get all users from the public.users table
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    
  // Get instructor profiles separately
  const { data: instructorProfiles } = await supabase
    .from("instructor_profiles")
    .select("*")
    
  if (error) {
    console.error("Error fetching users:", error.message)
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button variant="outline" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>
      
      <div className="rounded-md border mb-8">
        <Table>
          <TableCaption>A list of all users in the system.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Stripe Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <Badge variant={
                    user.role === 'admin' ? "destructive" : 
                    user.role === 'instructor' ? "default" : "secondary"
                  }>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.role === 'instructor' ? (
                    (() => {
                      const profile = instructorProfiles?.find(p => p.user_id === user.id);
                      if (profile?.stripe_account_enabled) {
                        return (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Enabled
                          </Badge>
                        );
                      } else {
                        return (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        );
                      }
                    })()
                  ) : (
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                      N/A
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.created_at && format(new Date(user.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" disabled>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-8">
        <Button asChild>
          <Link href="/admin">Back to Admin Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}