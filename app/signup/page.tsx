"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, updateProfile } from "firebase/auth"
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: "student" | "lecturer" | ""
  agreeToTerms: boolean
}

export default function SignupPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [authLoading, isAuthenticated, router])

  // Password strength checker
  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0
      if (password.length >= 8) strength += 1
      if (/[a-z]/.test(password)) strength += 1
      if (/[A-Z]/.test(password)) strength += 1
      if (/[0-9]/.test(password)) strength += 1
      if (/[^A-Za-z0-9]/.test(password)) strength += 1
      return strength
    }
    setPasswordStrength(calculateStrength(formData.password))
  }, [formData.password])

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return false
    }
    if (!formData.email) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!formData.role) {
      setError("Please select your account type")
      return false
    }
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return false
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (error) setError("") // Clear error when user starts typing
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as "student" | "lecturer" }))
    if (error) setError("")
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

await sendEmailVerification(user)
      // Update user profile
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        requestedRole: formData.role,
        role: "pending", // All new users start as pending
        createdAt: serverTimestamp(),
        emailVerified: false,
      })

      // Send email verification
      await sendEmailVerification(user)

      toast.success("Account created! Please check your email to verify your account.")
      router.push("/login?message=verify-email")
      router.push("/verify-email?message=verify-email")
    } catch (err: any) {
      console.error("Signup error:", err)

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.")
          break
        case "auth/invalid-email":
          setError("Invalid email address.")
          break
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.")
          break
        default:
          setError("Failed to create account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    if (!formData.role) {
      setError("Please select your account type first.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user document already exists
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // Create new user document
        const nameParts = user.displayName?.split(" ") || ["", ""]
        await setDoc(userDocRef, {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email,
          displayName: user.displayName || "",
          requestedRole: formData.role,
          role: "pending",
          createdAt: serverTimestamp(),
          emailVerified: user.emailVerified,
        })
      }

      toast.success("Account created with Google!")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Google signup error:", err)

      switch (err.code) {
        case "auth/popup-closed-by-user":
          setError("Signup cancelled.")
          break
        case "auth/popup-blocked":
          setError("Popup blocked. Please allow popups and try again.")
          break
        default:
          setError("Google signup failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
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
          <CardTitle className="text-2xl font-bold text-center text-blue-800">Create your account</CardTitle>
          <CardDescription className="text-center">Join the Tutorium community today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{getPasswordStrengthText()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs">Passwords match</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                disabled={loading}
              />
              <Label htmlFor="agreeToTerms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

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
            onClick={handleGoogleSignup}
            disabled={loading || !formData.role}
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
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
