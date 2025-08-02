"use client"

import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  BookOpen,
  HelpCircle,
  Upload,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface DashboardStats {
  totalQuestions: number
  answeredQuestions: number
  totalLessons: number
  recentActivity: any[]
}

export default function Dashboard() {
  const { user, loading, isLecturer, isStudent, isPending, isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    answeredQuestions: 0,
    totalLessons: 0,
    recentActivity: [],
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        // Fetch user's questions
        const questionsQuery = query(
          collection(db, "questions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5),
        )
        const questionsSnap = await getDocs(questionsQuery)
        const questions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const answeredCount = questions.filter((q) => q.answered).length

        // Fetch lessons (for lecturers)
        let lessonsCount = 0
        if (isLecturer) {
          const lessonsQuery = query(collection(db, "lessons"), where("uploadedBy", "==", user.email))
          const lessonsSnap = await getDocs(lessonsQuery)
          lessonsCount = lessonsSnap.size
        }

        setStats({
          totalQuestions: questions.length,
          answeredQuestions: answeredCount,
          totalLessons: lessonsCount,
          recentActivity: questions.slice(0, 3),
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [user, isLecturer])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "lecturer":
        return "bg-green-100 text-green-800"
      case "student":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const quickActions = [
    {
      title: "Ask a Question",
      description: "Get help from verified lecturers",
      icon: HelpCircle,
      href: "/ask",
      color: "text-blue-600",
      show: true,
    },
    {
      title: "Browse Lessons",
      description: "Watch video lessons from experts",
      icon: BookOpen,
      href: "/lessons",
      color: "text-green-600",
      show: true,
    },
    {
      title: "Answer Questions",
      description: "Help students with their queries",
      icon: MessageSquare,
      href: "/Lecturer/questions",
      color: "text-purple-600",
      show: isLecturer,
    },
    {
      title: "Upload Lessons",
      description: "Share your knowledge with students",
      icon: Upload,
      href: "/Lecturer/upload",
      color: "text-orange-600",
      show: isLecturer,
    },
    {
      title: "Admin Panel",
      description: "Manage users and content",
      icon: Users,
      href: "/admin",
      color: "text-red-600",
      show: isAdmin,
    },
  ].filter((action) => action.show)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.displayName?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your account today.</p>
              </div>
              <Badge className={getRoleColor(user?.role || "pending")}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Pending Account Alert */}
          {isPending && (
            <Alert className="mb-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your account is pending approval. You'll receive an email once an administrator reviews your request.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingStats ? "..." : stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">{stats.answeredQuestions} answered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats
                    ? "..."
                    : stats.totalQuestions > 0
                      ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100)
                      : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Of your questions</p>
              </CardContent>
            </Card>

            {isLecturer && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lessons Uploaded</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loadingStats ? "..." : stats.totalLessons}</div>
                  <p className="text-xs text-muted-foreground">Total content created</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                {user?.emailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.emailVerified ? "Verified" : "Pending"}</div>
                <p className="text-xs text-muted-foreground">Email verification</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you can perform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                      <Link key={action.href} href={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <action.icon className={`h-6 w-6 ${action.color} mt-1`} />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-500">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest questions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : stats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${activity.answered ? "bg-green-100" : "bg-yellow-100"}`}>
                            {activity.answered ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                            <p className="text-xs text-gray-500">
                              {activity.answered ? "Answered" : "Pending"} •{" "}
                              {activity.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
                        <Link href="/student/dashboard">View All Questions</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-4">No recent activity yet</p>
                      <Button size="sm" asChild>
                        <Link href="/ask">Ask Your First Question</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
