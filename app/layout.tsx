import type React from "react"
import type { Metadata } from "next"
// import { Geist, Geist_Mono } from "next/font/google"
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import Toaster from "@/components/toaster";

// const geistSans = Geist({ subsets: ["latin"] })
// const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "U Asha Super Auto Tech - Garage Management",
  description: "Professional vehicle painting and repair garage management system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} font-sans`}>
        <Toaster/>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
