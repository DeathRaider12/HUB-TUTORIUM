"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) router.push("/dashboard")
    })
    return () => unsub()
  }, [router])

  const login = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await signInWithEmailAndPassword(auth, email, password)
      if (!res.user.emailVerified) {
        setError("Please verify your email.")
        return
      }
      toast.success("Logged in!")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await signInWithPopup(auth, googleProvider)
      toast.success("Logged in with Google!")
      router.push("/dashboard")
    } catch (err: any) {
      setError("Google login error. Try enabling popups.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={login} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Log In to Tutorium</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            className="mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            className="mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full bg-blue-700 text-white hover:bg-blue-800 mb-4" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </Button>

        <div className="text-center mb-4">
          <span className="text-gray-500">or</span>
        </div>

        <Button
          type="button"
          onClick={googleLogin}
          className="w-full bg-red-500 text-white hover:bg-red-600 mb-6"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  )
}
