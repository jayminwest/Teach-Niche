import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | Teach Niche",
  description: "Privacy Policy for Teach Niche",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            At Teach Niche, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>
            We collect the following types of information:
          </p>
          <ul>
            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</li>
            <li><strong>Profile Information:</strong> Information you provide in your user profile, such as biography, profile picture, and social media links.</li>
            <li><strong>Payment Information:</strong> When you make a purchase or receive payments as an instructor, we collect payment details. Full payment information is processed by our payment processor, Stripe.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our platform, including videos watched, lessons purchased, and browsing activity.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies.</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>
            We use your information to:
          </p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process transactions and send transaction notifications</li>
            <li>Communicate with you about your account and our services</li>
            <li>Personalize your experience on our platform</li>
            <li>Ensure the security of our platform</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2>4. Information Sharing</h2>
          <p>
            We may share your information with:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform (e.g., payment processors, cloud storage providers).</li>
            <li><strong>Other Users:</strong> Limited profile information is visible to other users on the platform.</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
          
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
          
          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to:
          </p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal information</li>
            <li>Object to or restrict certain processing activities</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise these rights, please contact us at privacy@teachniche.com.
          </p>
          
          <h2>7. Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience on our platform. You can manage your cookie preferences through your browser settings.
          </p>
          
          <h2>8. Children's Privacy</h2>
          <p>
            Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>
          
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
          
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@teachniche.com.
          </p>
        </div>
        
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            For more information about how we protect your data, please see our <Link href="/legal/terms" className="underline underline-offset-4">Terms of Service</Link> or <Link href="/about" className="underline underline-offset-4">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
