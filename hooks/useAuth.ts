"use client"

import { useEffect, useState, useCallback } from "react"
import { onAuthStateChanged, type User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth"
import { doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { isAdminAccount, getAdminAccountInfo } from "@/lib/adminConfig"
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
  isHardcodedAdmin?: boolean
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

  const createOrUpdateUserDocument = useCallback(async (firebaseUser: FirebaseUser, isAdmin = false) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid)
      const adminInfo = isAdmin ? getAdminAccountInfo(firebaseUser.email || "") : null

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: adminInfo?.displayName || firebaseUser.displayName || firebaseUser.email?.split("@")[0],
        role: isAdmin ? "admin" : "pending",
        emailVerified: firebaseUser.emailVerified || isAdmin,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
        ...(isAdmin && { isHardcodedAdmin: true }),
      }

      await setDoc(userDocRef, userData, { merge: true })
      return userData
    } catch (error) {
      console.error("Error creating/updating user document:", error)
      throw error
    }
  }, [])

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

        // Check if this is a hardcoded admin account
        const isAdmin = isAdminAccount(firebaseUser.email || "")

        if (isAdmin) {
          // For admin accounts, create/update user document and set state directly
          const userData = await createOrUpdateUserDocument(firebaseUser, true)
          const user: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData.displayName,
            emailVerified: true, // Admin accounts are always verified
            role: "admin",
            isHardcodedAdmin: true,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          }
          setAuthState({ user, loading: false, error: null })
        } else {
          // For regular users, listen to user document changes in real-time
          const userDocRef = doc(db, "users", firebaseUser.uid)
          userDocUnsubscribe = onSnapshot(
            userDocRef,
            async (docSnapshot) => {
              let userData = docSnapshot.exists() ? docSnapshot.data() : null

              // If user document doesn't exist, create it
              if (!userData) {
                userData = await createOrUpdateUserDocument(firebaseUser, false)
              }

              const user: UserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || userData?.displayName,
                emailVerified: firebaseUser.emailVerified,
                role: userData?.role || "pending",
                requestedRole: userData?.requestedRole,
                createdAt: userData?.createdAt?.toDate?.() || new Date(),
                lastLoginAt: userData?.lastLoginAt?.toDate?.() || new Date(),
                isHardcodedAdmin: false,
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
        }
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
  }, [createOrUpdateUserDocument])

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user,
    isEmailVerified: authState.user?.emailVerified ?? false,
    isAdmin: authState.user?.role === "admin",
    isLecturer: authState.user?.role === "lecturer",
    isStudent: authState.user?.role === "student",
    isPending: authState.user?.role === "pending",
    isHardcodedAdmin: authState.user?.isHardcodedAdmin ?? false,
  }
}
