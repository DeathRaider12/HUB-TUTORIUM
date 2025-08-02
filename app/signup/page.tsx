"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth"
import { setDoc, doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const googleProvider = new GoogleAuthProvider()

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSignup = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        requestedRole: role,
        role: "pending",
        createdAt: new Date(),
      })

      await sendEmailVerification(user)
      toast.success("Account created! Please verify your email.")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // Only create a new document if one doesn't exist
        await setDoc(userDocRef, {
          email: user.email,
          role: "pending", // Default role for new signups
          requestedRole: role || "student", // Use selected role or default to student
          createdAt: new Date(),
          displayName: user.displayName || "",
        })
      }

      toast.success("Signed up with Google!")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Google signup error:", err)
      setError("Google signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Sign Up</h2>

        {error && <p className="text-red-600 bg-red-50 border px-4 py-2 rounded mb-4">{error}</p>}
        {message && <p className="text-green-700 bg-green-50 border px-4 py-2 rounded mb-4">{message}</p>}

        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className="mt-1"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            className="mt-1"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="role">Account Type</Label>
          <Select value={role} onValueChange={setRole} disabled={loading}>
            <SelectTrigger id="role" className="w-full mt-1">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="lecturer">Lecturer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-green-600 text-white hover:bg-green-700 mb-4">
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>

        <div className="text-center mb-4">
          <span className="text-gray-500">or</span>
        </div>

        <Button
          type="button"
          className="w-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? "Signing up with Google..." : "Continue with Google"}
        </Button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  )
}
