import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { ClarityAnalytics } from "@/components/clarity-analytics"
import { validateEnv, logEnvironment } from "@/lib/env-utils"

// Validate environment variables on server
const { valid, message } = validateEnv()
if (!valid && process.env.NODE_ENV !== 'production') {
  console.error(`❌ Environment validation failed: ${message}`)
}

// Log environment in development
if (process.env.NODE_ENV === 'development') {
  logEnvironment()
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Teach Niche | Kendama Tutorial Platform",
  description: "A platform for kendama instructors to share tutorial videos and for students to learn",
  generator: 'v0.dev',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        href: '/favicon.png'
      }
    ],
    apple: '/favicon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <Analytics />
          <ClarityAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
