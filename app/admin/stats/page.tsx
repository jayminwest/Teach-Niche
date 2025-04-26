import { requireAdmin } from "@/lib/auth-utils"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

export default async function StatsPage() {
  // Check if the user is an admin - this will redirect if not authorized
  await requireAdmin();
  
  const supabase = createServerComponentClient({ cookies })
  
  // Get user stats
  const { count: userCount } = await supabase
    .from("users")
    .select("*", { count: 'exact', head: true })
  
  // Get instructor stats  
  const { count: instructorCount } = await supabase
    .from("users")
    .select("*", { count: 'exact', head: true })
    .eq("role", "instructor")
  
  // Get lesson stats
  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: 'exact', head: true })
  
  // Get purchase stats
  const { data: purchases } = await supabase
    .from("purchases")
    .select("amount, is_free")
  
  const totalPurchases = purchases?.length || 0
  const freePurchases = purchases?.filter(p => p.is_free).length || 0
  const paidPurchases = totalPurchases - freePurchases
  
  // Calculate revenue
  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Platform Statistics</h1>
        <Button variant="outline" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {instructorCount || 0} instructors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available on the platform
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {paidPurchases} paid, {freePurchases} free
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime revenue
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Button asChild>
          <Link href="/admin">Back to Admin Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}