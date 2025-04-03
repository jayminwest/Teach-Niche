import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Legal Information | Teach Niche",
  description: "Legal information, terms of service, and privacy policy for Teach Niche",
}

export default function LegalPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter">Legal Information</h1>
          <p className="text-xl text-muted-foreground">
            Important documents regarding your use of Teach Niche
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
              <CardDescription>
                The rules and guidelines for using our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Our Terms of Service outline the rules for using Teach Niche, including user responsibilities, content ownership, payment terms, and more.
              </p>
              <Button asChild>
                <Link href="/legal/terms">Read Terms of Service</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>
                How we collect, use, and protect your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Our Privacy Policy explains what information we collect, how we use it, and the steps we take to protect your privacy while using our platform.
              </p>
              <Button asChild>
                <Link href="/legal/privacy">Read Privacy Policy</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            If you have any questions about our legal documents, please contact us at legal@teachniche.com
          </p>
        </div>
      </div>
    </div>
  )
}
