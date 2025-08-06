"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { applyActionCode, sendEmailVerification } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/firebase" // Ensure auth is imported from your firebase config
import { toast } from "react-toastify" // Import toast from react-toastify

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading")
  const [message, setMessage] = useState("")
  const [oobCode, setOobCode] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("oobCode")
    if (code) {
      setOobCode(code)
      handleVerifyEmail(code)
    } else {
      setStatus("pending")
      setMessage("A verification link has been sent to your email. Please check your inbox.")
    }
  }, [searchParams])

  const handleVerifyEmail = async (code: string) => {
    try {
      await applyActionCode(auth, code)
      setStatus("success")
      setMessage("Your email has been successfully verified! You can now log in.")
    } catch (error: any) {
      console.error("Email verification error:", error)
      setStatus("error")
      switch (error.code) {
        case "auth/invalid-action-code":
          setMessage("The verification link is invalid or has expired. Please request a new one.")
          break
        case "auth/user-disabled":
          setMessage("Your account has been disabled. Please contact support.")
          break
        default:
          setMessage("Failed to verify email. Please try again or request a new link.")
      }
    }
  }

  const handleResendVerificationEmail = async () => {
    const currentUser = auth.currentUser
    if (currentUser) {
      try {
        await sendEmailVerification(currentUser)
        toast.success("New verification email sent! Check your inbox.")
        setMessage("A new verification link has been sent to your email. Please check your inbox.")
        setStatus("pending") // Reset status to pending after resend
      } catch (error) {
        console.error("Error resending verification email:", error)
        toast.error("Failed to resend verification email.")
        setMessage("Failed to resend verification email. Please try again later.")
        setStatus("error")
      }
    } else {
      setMessage("No active user found. Please log in or sign up to receive a verification email.")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email address..."}
            {status === "pending" && "Action required"}
            {status === "success" && "Verification Complete!"}
            {status === "error" && "Verification Failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-gray-600">Please wait while we verify your email.</p>
            </div>
          )}

          {status === "success" && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "pending" && (
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
              <Mail className="h-5 w-5" />
              <AlertTitle>Verification Pending</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            {status === "success" && (
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            )}
            {(status === "error" || status === "pending") && (
              <Button onClick={handleResendVerificationEmail} disabled={status === "loading"} className="w-full">
                Resend Verification Email
              </Button>
            )}
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
