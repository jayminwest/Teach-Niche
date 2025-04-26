import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import ManualInstructions from "./manual-instructions"
import RLSPoliciesSetup from "./rls-policies"
import SecureStorageSetup from "./secure-storage"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth-utils"
import AdminSetupClient from "./admin-setup-client"

import { redirect } from "next/navigation"

export default async function SetupPage() {
  // This page is no longer needed - redirect to the main admin dashboard
  redirect("/admin");
}

