"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, AlertCircle, CheckCircle, Lightbulb } from "lucide-react"

interface QuestionForm {
  title: string
  description: string
  subject: string
  tags: string[]
  urgency: "low" | "medium" | "high"
}

const SUBJECTS = [
  { value: "mechanical", label: "Mechanical Engineering" },
  { value: "civil", label: "Civil Engineering" },
  { value: "electrical", label: "Electrical Engineering" },
  { value: "chemical", label: "Chemical Engineering" },
  { value: "computer", label: "Computer Engineering" },
  { value: "aerospace", label: "Aerospace Engineering" },
  { value: "biomedical", label: "Biomedical Engineering" },
  { value: "environmental", label: "Environmental Engineering" },
]

const COMMON_TAGS = [
  "thermodynamics",
  "mechanics",
  "circuits",
  "structures",
  "materials",
  "fluid-dynamics",
  "programming",
  "design",
  "analysis",
  "theory",
]

export default function AskPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState<QuestionForm>({
    title: "",
    description: "",
    subject: "",
    tags: [],
    urgency: "medium",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customTag, setCustomTag] = useState("")

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Question title is required")
      return false
    }
    if (formData.title.length < 10) {
      setError("Question title should be at least 10 characters long")
      return false
    }
    if (!formData.description.trim()) {
      setError("Question description is required")
      return false
    }
    if (formData.description.length < 20) {
      setError("Please provide more details in your description (at least 20 characters)")
      return false
    }
    if (!formData.subject) {
      setError("Please select a subject area")
      return false
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }))
    if (error) setError("")
  }

  const handleUrgencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, urgency: value as "low" | "medium" | "high" }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim().toLowerCase())
      setCustomTag("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      await addDoc(collection(db, "questions"), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject,
        tags: formData.tags,
        urgency: formData.urgency,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        createdAt: serverTimestamp(),
        answered: false,
        views: 0,
        upvotes: 0,
        status: "open",
      })

      toast.success("Question submitted successfully!")
      router.push("/student/dashboard")
    } catch (err: any) {
      console.error("Error submitting question:", err)
      setError("Failed to submit question. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
            <p className="text-gray-600">Get help from our community of verified lecturers and experts</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <span>Question Details</span>
                  </CardTitle>
                  <CardDescription>Provide clear and detailed information to get the best answers</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Question Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., How does a cantilever beam support load?"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="text-lg"
                        required
                      />
                      <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Area *</Label>
                      <Select value={formData.subject} onValueChange={handleSubjectChange} disabled={loading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your subject area" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Explain your question in detail. Include any relevant context, what you've tried, and what specific help you need..."
                        rows={8}
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                      />
                      <p className="text-xs text-gray-500">{formData.description.length}/1000 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags (Optional)</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {COMMON_TAGS.filter((tag) => !formData.tags.includes(tag)).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-blue-50"
                            onClick={() => addTag(tag)}
                          >
                            + {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add custom tag"
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomTag())}
                          disabled={loading || formData.tags.length >= 5}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddCustomTag}
                          disabled={loading || !customTag.trim() || formData.tags.length >= 5}
                        >
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Tags help categorize your question. Maximum 5 tags.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Urgency Level</Label>
                      <Select value={formData.urgency} onValueChange={handleUrgencyChange} disabled={loading}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - General inquiry</SelectItem>
                          <SelectItem value="medium">Medium - Need help soon</SelectItem>
                          <SelectItem value="high">High - Urgent assignment/exam</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={getUrgencyColor(formData.urgency)}>
                        {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} Priority
                      </Badge>
                    </div>

                    <div className="flex space-x-4 pt-6">
                      <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Question"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span>Tips for Great Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Be specific and clear in your title</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Include relevant context and background</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Mention what you've already tried</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Use proper grammar and formatting</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Add relevant tags to help categorize</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>High Priority:</span>
                      <span className="font-medium">2-6 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Priority:</span>
                      <span className="font-medium">6-24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Priority:</span>
                      <span className="font-medium">1-3 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
