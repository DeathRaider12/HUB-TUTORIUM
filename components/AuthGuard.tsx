"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mail } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireEmailVerification?: boolean
  allowedRoles?: Array<"student" | "lecturer" | "admin" | "pending">
  fallbackPath?: string
}

export default function AuthGuard({
  children,
  requireEmailVerification = true,
  allowedRoles,
  fallbackPath = "/login",
}: AuthGuardProps) {
  const { user, loading, error, isAuthenticated, isEmailVerified,setLoading } = useAuth(), useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(fallbackPath)
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else if (!user.emailVerified) {
        router.push("/verify-email?message=verify-email")
      } else {
        setLoading(false)
      }
  }, [loading, isAuthenticated, router, fallbackPath])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full bg-transparent"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
          <Skeleton className="h-8 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  // Email verification required
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert className="max-w-md">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Please verify your email address to continue. Check your inbox for a verification link.
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full bg-transparent"
              onClick={() => router.push("/verify-email")}
            >
              Resend Verification Email
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full bg-transparent"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
