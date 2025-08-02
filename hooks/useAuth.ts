"use client"

import { useEffect, useState, useCallback } from "react"
import { onAuthStateChanged, type User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth"
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
  role: "student" | "lecturer" | "admin" | "pending"
  requestedRole?: "student" | "lecturer"
  createdAt?: Date
  lastLoginAt?: Date
}

interface AuthState {
  user: UserData | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
      setAuthState((prev) => ({ ...prev, user: null }))
      router.push("/login")
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Failed to log out")
    }
  }, [router])

  useEffect(() => {
    let userDocUnsubscribe: Unsubscribe | null = null

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        // Clean up previous user document listener
        if (userDocUnsubscribe) {
          userDocUnsubscribe()
          userDocUnsubscribe = null
        }

        if (!firebaseUser) {
          setAuthState({ user: null, loading: false, error: null })
          return
        }

        // Listen to user document changes in real-time
        const userDocRef = doc(db, "users", firebaseUser.uid)
        userDocUnsubscribe = onSnapshot(
          userDocRef,
          (docSnapshot) => {
            const userData = docSnapshot.exists() ? docSnapshot.data() : null

            const user: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              role: userData?.role || "pending",
              requestedRole: userData?.requestedRole,
              createdAt: userData?.createdAt?.toDate(),
              lastLoginAt: userData?.lastLoginAt?.toDate(),
            }

            setAuthState({ user, loading: false, error: null })
          },
          (error) => {
            console.error("User document listener error:", error)
            setAuthState((prev) => ({
              ...prev,
              loading: false,
              error: "Failed to load user data",
            }))
          },
        )
      } catch (error) {
        console.error("Auth state change error:", error)
        setAuthState({
          user: null,
          loading: false,
          error: "Authentication error occurred",
        })
      }
    })

    return () => {
      authUnsubscribe()
      if (userDocUnsubscribe) {
        userDocUnsubscribe()
      }
    }
  }, [])

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user,
    isEmailVerified: authState.user?.emailVerified ?? false,
    isAdmin: authState.user?.role === "admin",
    isLecturer: authState.user?.role === "lecturer",
    isStudent: authState.user?.role === "student",
    isPending: authState.user?.role === "pending",
  }
}
