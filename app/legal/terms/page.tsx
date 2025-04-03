import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | Teach Niche",
  description: "Terms of Service for Teach Niche",
}

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Teach Niche. These Terms of Service govern your use of our website and services. By accessing or using Teach Niche, you agree to be bound by these Terms.
          </p>
          
          <h2>2. Definitions</h2>
          <p>
            <strong>"Platform"</strong> refers to the Teach Niche website and services.<br />
            <strong>"User"</strong> refers to any individual who accesses or uses the Platform.<br />
            <strong>"Instructor"</strong> refers to Users who create and sell content on the Platform.<br />
            <strong>"Student"</strong> refers to Users who purchase and consume content on the Platform.
          </p>
          
          <h2>3. Account Registration</h2>
          <p>
            To access certain features of the Platform, you must register for an account. You agree to provide accurate information during the registration process and to keep your account information updated.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          
          <h2>4. User Content</h2>
          <p>
            Instructors retain ownership of the content they create and upload to the Platform. By uploading content, Instructors grant Teach Niche a non-exclusive license to display, distribute, and promote the content on the Platform.
          </p>
          <p>
            You agree not to upload content that infringes on the intellectual property rights of others or violates any applicable laws.
          </p>
          
          <h2>5. Purchases and Payments</h2>
          <p>
            All purchases are final and non-refundable unless otherwise required by law.
          </p>
          <p>
            Instructors receive payment for their content according to our payment schedule, minus applicable platform fees.
          </p>
          
          <h2>6. Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use the Platform for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Platform</li>
            <li>Interfere with the proper functioning of the Platform</li>
            <li>Share your account credentials with others</li>
            <li>Download, copy, or redistribute content without authorization</li>
          </ul>
          
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at our discretion, particularly if you violate these Terms.
          </p>
          
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Teach Niche shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform.
          </p>
          
          <h2>9. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will provide notice of significant changes. Your continued use of the Platform after such modifications constitutes your acceptance of the updated Terms.
          </p>
          
          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@teachniche.com.
          </p>
        </div>
        
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            For questions about our Terms of Service, please see our <Link href="/legal/privacy" className="underline underline-offset-4">Privacy Policy</Link> or <Link href="/about" className="underline underline-offset-4">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
