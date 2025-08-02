"use client"

import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, MessageSquare, Shield, Settings, Activity, UserCheck, UserX, Crown } from "lucide-react"
import { useEffect, useState } from "react"
import { collection, query, getDocs, orderBy, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import toast from "react-hot-toast"

interface User {
  id: string
  email: string
  displayName: string
  role: string
  requestedRole?: string
  createdAt: any
  emailVerified: boolean
  isHardcodedAdmin?: boolean
}

interface AdminStats {
  totalUsers: number
  pendingUsers: number
  totalLecturers: number
  totalStudents: number
  totalQuestions: number
  totalLessons: number
}

export default function AdminPage() {
  const { userData, isAdmin, loading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingUsers: 0,
    totalLecturers: 0,
    totalStudents: 0,
    totalQuestions: 0,
    totalLessons: 0,
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAdmin) return

      try {
        // Fetch all users
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
        const usersSnap = await getDocs(usersQuery)
        const usersData = usersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]

        setUsers(usersData)

        // Calculate stats
        const pendingUsers = usersData.filter((u) => u.role === "pending").length
        const lecturers = usersData.filter((u) => u.role === "lecturer").length
        const students = usersData.filter((u) => u.role === "student").length

        // Fetch questions count
        const questionsSnap = await getDocs(collection(db, "questions"))
        const questionsCount = questionsSnap.size

        // Fetch lessons count
        const lessonsSnap = await getDocs(collection(db, "lessons"))
        const lessonsCount = lessonsSnap.size

        setStats({
          totalUsers: usersData.length,
          pendingUsers,
          totalLecturers: lecturers,
          totalStudents: students,
          totalQuestions: questionsCount,
          totalLessons: lessonsCount,
        })
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast.error("Failed to load admin data")
      } finally {
        setLoadingData(false)
      }
    }

    fetchAdminData()
  }, [isAdmin])

  const handleUserRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date(),
      })

      // Update local state
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-8 w-8 text-red-600" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage users, content, and system settings</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
                {userData?.isHardcodedAdmin && <Badge className="bg-purple-100 text-purple-800">System Admin</Badge>}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingUsers} pending approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lecturers</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLecturers}</div>
                <p className="text-xs text-muted-foreground">Verified educators</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active learners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">Total questions asked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lessons</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLessons}</div>
                <p className="text-xs text-muted-foreground">Video lessons uploaded</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="content">Content Management</TabsTrigger>
              <TabsTrigger value="settings">System Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.displayName || user.email}</h3>
                            {user.isHardcodedAdmin && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">System Admin</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={
                                user.role === "admin"
                                  ? "bg-red-100 text-red-800"
                                  : user.role === "lecturer"
                                    ? "bg-green-100 text-green-800"
                                    : user.role === "student"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {user.role}
                            </Badge>
                            {user.requestedRole && user.role === "pending" && (
                              <Badge variant="outline">Requested: {user.requestedRole}</Badge>
                            )}
                            {!user.emailVerified && (
                              <Badge variant="destructive" className="text-xs">
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </div>

                        {!user.isHardcodedAdmin && user.role === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUserRoleUpdate(user.id, user.requestedRole || "student")}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserRoleUpdate(user.id, "rejected")}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>Manage lessons, questions, and other content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Content management features will be implemented in future updates.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>System settings panel will be implemented in future updates.</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
