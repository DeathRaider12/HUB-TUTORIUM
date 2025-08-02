"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const emailSent = params.get("message") === "verify-email"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          {emailSent ? (
            <>
              <Mail className="h-10 w-10 text-blue-600" />
              <h2 className="text-xl font-semibold text-blue-800">
                Please Verify Your Email
              </h2>
              <p className="text-gray-600">
                A verification email has been sent to your inbox. Click the verification link to activate your account.
              </p>
              <Button asChild className="mt-4">
                <Link href="/login">Go to Login</Link>
              </Button>
            </>
          ) : (
            <>
              <CheckCircle className="h-10 w-10 text-green-600" />
              <h2 className="text-xl font-semibold text-green-800">Email Verified!</h2>
              <p className="text-gray-600">Your email has been verified. You can now log in to your account.</p>
              <Button asChild className="mt-4">
                <Link href="/login">Proceed to Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
