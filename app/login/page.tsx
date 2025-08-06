"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { validateAdminCredentials, isAdminAccount } from "@/lib/adminConfig"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Shield } from "lucide-react"
import Link from "next/link"
import { GoogleAuthProvider } from "firebase/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const provider = new GoogleAuthProvider()

  const redirectTo = searchParams.get("redirect") || "/dashboard"

  // Check if entered email is an admin account
  useEffect(() => {
    setIsAdminLogin(isAdminAccount(formData.email))
  }, [formData.email])

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [authLoading, isAuthenticated, router, redirectTo])

  const validateForm = () => {
    if (!formData.email) {
      setError("Email is required")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (!isAdminLogin && formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("") // Clear error when user starts typing
  }

  const handleAdminLogin = async () => {
    // Local validation of admin credentials first
    if (!validateAdminCredentials(formData.email, formData.password)) {
      setError("Invalid admin credentials. Please check the email and the hardcoded password.")
      return false
    }

    setLoading(true)
    setError("")

    try {
      // First, attempt to sign in with existing account.
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
    } catch (signInError: any) {
      console.error("Initial Firebase sign-in error for admin:", signInError)
      // Explicitly check for user-not-found or general invalid-credential that implies not found.
      if (signInError.code === "auth/user-not-found" || signInError.code === "auth/invalid-credential") {
        try {
          // If user doesn't exist or a general invalid credential error occurred, try creating the user.
          // This assumes `auth/invalid-credential` can mean 'user-not-found' when an account isn't registered.
          await createUserWithEmailAndPassword(auth, formData.email, formData.password)
          // Immediately sign in after creation to establish session.
          await signInWithEmailAndPassword(auth, formData.email, formData.password)
          toast.success("Admin account created and logged in!")
          router.push("/admin")
          setLoading(false)
          return true
        } catch (createError: any) {
          console.error("Admin account creation/re-login error:", createError)
          if (createError.code === "auth/email-already-in-use") {
            // This case should ideally not happen if signInError was 'user-not-found'
            // but if it does, it implies password mismatch for an existing user.
            setError(
              "Admin account exists in Firebase but with a different password. Please ensure it's 'ADMIN_TUTORIUM' or reset it via Firebase console if not already.",
            )
          } else if (createError.code === "auth/weak-password") {
            setError(
              "Admin password 'ADMIN_TUTORIUM' is too weak for Firebase. Consider changing it to a stronger one or modifying Firebase project's password policy.",
            )
          } else {
            setError(`Failed to create or re-authenticate admin account: ${createError.message}`)
          }
          setLoading(false)
          return false
        }
      } else if (signInError.code === "auth/wrong-password") {
        setError("Incorrect admin password in Firebase. Please ensure it is 'ADMIN_TUTORIUM'.")
      } else {
        setError(`Admin login failed: ${signInError.message || "An unknown error occurred."}`)
      }
      setLoading(false)
      return false
    }

    // If no error was thrown above, login was successful.
    toast.success("Admin login successful!")
    router.push("/admin")
    setLoading(false)
    return true
  }

  const handleRegularLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password)

      if (!result.user.emailVerified) {
        setError("Please verify your email address before logging in.")
        return false
      }

      toast.success("Welcome back!")
      router.push(redirectTo)
      return true
    } catch (err: any) {
      console.error("Login error:", err)

      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.")
          break
        case "auth/wrong-password":
          setError("Incorrect password.")
          break
        case "auth/invalid-email":
          setError("Invalid email address.")
          break
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.")
          break
        default:
          setError("Login failed. Please try again.")
      }
      return false
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      if (isAdminLogin) {
        await handleAdminLogin()
      } else {
        await handleRegularLogin()
      }
    } finally {
      // setLoading(false) // setLoading is handled inside handleAdminLogin/handleRegularLogin
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")

    try {
      await signInWithPopup(auth, googleProvider)
      toast.success("Welcome back!")
      router.push(redirectTo)
    } catch (err: any) {
      console.error("Google login error:", err)

      switch (err.code) {
        case "auth/popup-closed-by-user":
          setError("Login cancelled.")
          break
        case "auth/popup-blocked":
          setError("Popup blocked. Please allow popups and try again.")
          break
        default:
          setError("Google login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError("Please enter your email address first.")
      return
    }

    if (isAdminLogin) {
      setError("Password reset is not available for hardcoded admin accounts.")
      return
    }

    try {
      await sendPasswordResetEmail(auth, formData.email)
      setResetEmailSent(true)
      toast.success("Password reset email sent!")
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError("Failed to send password reset email.")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-800">
            {isAdminLogin ? (
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                Admin Login
              </div>
            ) : (
              "Welcome back"
            )}
          </CardTitle>
          <CardDescription className="text-center">
            {isAdminLogin ? "Administrator access to Tutorium" : "Sign in to your Tutorium account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resetEmailSent && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>Password reset email sent! Check your inbox.</AlertDescription>
            </Alert>
          )}

          {isAdminLogin && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>You are logging in as an administrator using hardcoded credentials.</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {!isAdminLogin && (
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  Forgot password?
                </Button>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full ${isAdminLogin ? "bg-red-700 hover:bg-red-800" : "bg-blue-700 hover:bg-blue-800"}`}
              disabled={loading}
            >
              {loading ? "Signing in..." : isAdminLogin ? "Admin Sign In" : "Sign In"}
            </Button>
          </form>

          {!isAdminLogin && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
