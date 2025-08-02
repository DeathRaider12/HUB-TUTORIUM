import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "react-hot-toast"
import NavBar from "@/components/NavBar"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Tutorium - Engineering Learning Platform",
  description:
    "A modern learning platform where certified lecturers answer your engineering questions, and students can learn via Q&A and video lessons.",
  keywords: ["engineering", "education", "learning", "tutoring", "Q&A"],
  authors: [{ name: "Tutorium Team" }],
  openGraph: {
    title: "Tutorium - Engineering Learning Platform",
    description: "Learn engineering with certified professionals",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NavBar />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
