"use client"

import useUser from "@/hooks/useUser" // Import the useUser hook
import LogoutButton from "@/components/LogoutButton"
import AuthGuard from "@/components/AuthGuard"
import Link from "next/link"

export default function Dashboard() {
  const { user, role: userRole, loading } = useUser() // Use the custom hook

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  // Ensure user is logged in before rendering dashboard content
  if (!user) {
    return <AuthGuard /> // AuthGuard will redirect to login if no user
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-800">Tutorium Dashboard</h1>
            <LogoutButton />
          </div>
        </nav>

        <div className="max-w-6xl mx-auto py-12 px-6">
          <div className="bg-white p-8 rounded-xl shadow-md text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Welcome to your dashboard</h2>
            <p className="text-gray-600">
              Logged in as <strong>{user.email || "N/A"}</strong> ({userRole})
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/ask">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Ask a Question</h3>
                <p className="text-gray-600">Get help from verified lecturers</p>
              </div>
            </Link>

            <Link href="/lessons">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Browse Lessons</h3>
                <p className="text-gray-600">Watch video lessons from experts</p>
              </div>
            </Link>

            {userRole === "lecturer" && (
              <Link href="/Lecturer/questions">
                {" "}
                {/* Updated link for lecturers */}
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Answer Questions</h3>
                  <p className="text-gray-600">View student questions and provide answers</p>
                </div>
              </Link>
            )}
            {userRole === "lecturer" && (
              <Link href="/Lecturer/upload">
                {" "}
                {/* Added link for lecturers to upload lessons */}
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-purple-700 mb-2">Upload Lessons</h3>
                  <p className="text-gray-600">Upload new video lessons for students</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
