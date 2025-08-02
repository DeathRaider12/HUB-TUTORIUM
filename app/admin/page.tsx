"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import useUser from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const ADMIN_EMAILS = ["lateefedidi4@gmail.com", "envostructs@gmail.com"]

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user && !ADMIN_EMAILS.includes(user.email)) {
      router.push("/dashboard")
    }
  }, [user])

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "users"), where("role", "==", "pending"))
      const snap = await getDocs(q)
      setPendingUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    }
    fetch()
  }, [])

  const handleApprove = async (id: string, role: string) => {
    await updateDoc(doc(db, "users", id), { role })
    setPendingUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success("Approved successfully")
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>
      <div className="space-y-4">
        {pendingUsers.map((u) => (
          <div key={u.id} className="p-4 border rounded bg-white">
            <p><strong>Email:</strong> {u.email}</p>
            <p><strong>Requested Role:</strong> {u.requestedRole}</p>
            <button onClick={() => handleApprove(u.id, "lecturer")} className="mr-2 bg-blue-600 text-white px-4 py-1 rounded">Lecturer</button>
            <button onClick={() => handleApprove(u.id, "student")} className="bg-green-600 text-white px-4 py-1 rounded">Student</button>
          </div>
        ))}
      </div>
    </div>
  )
}
