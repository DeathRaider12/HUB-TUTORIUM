import Link from "next/link"
import { Button } from "@/components/ui/button"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 text-gray-800">
        {/* Hero Section */}
        <section className="w-full py-20 px-6 bg-white text-center shadow-sm">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Welcome to Tutorium</h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto">
            A modern learning platform where certified lecturers answer your engineering questions, and students can
            learn via Q&A and video lessons.
          </p>
          <div className="mt-6">
            <Link href="/ask">
              <Button className="bg-blue-700 text-white hover:bg-blue-800">Ask a Question</Button>
            </Link>
            <Link href="/lessons">
              <Button variant="outline" className="ml-4 bg-transparent">
                Browse Lessons
              </Button>
            </Link>
          </div>
        </section>
        {/* Core Features */}
        <section className="py-16 px-6 bg-blue-50">
          <h2 className="text-2xl font-semibold text-blue-800 text-center mb-10">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-bold text-lg text-blue-700">Verified Lecturers</h3>
              <p className="text-gray-600 mt-2">All educators are certified professionals in their fields.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-bold text-lg text-blue-700">Ask & Answer</h3>
              <p className="text-gray-600 mt-2">Students can ask questions and get detailed answers anytime.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-bold text-lg text-blue-700">Video Lessons</h3>
              <p className="text-gray-600 mt-2">Structured video classes available for registered students.</p>
            </div>
          </div>
        </section>
        {/* Authentication Call-to-Actions */}
        <section className="py-16 px-6 bg-white text-center">
          <h2 className="text-2xl font-bold text-blue-900">Get Started with Tutorium</h2>
          <p className="text-gray-600 mt-2">
            Create an account or log in to join the community of learners and educators.
          </p>
          <div className="mt-6">
            <Link href="/signup">
              <Button className="bg-green-600 text-white hover:bg-green-700">Sign Up</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="ml-4 bg-transparent">
                Log In
              </Button>
            </Link>
          </div>
        </section>
        {/* Preview of Question Board */}
        <section className="py-16 px-6 bg-blue-50">
          <h2 className="text-xl font-semibold text-center text-blue-800 mb-6">Popular Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-xl shadow border">
              <h3 className="font-semibold text-lg text-blue-700">
                How does a cantilever beam work in real-world structures?
              </h3>
              <p className="text-gray-600 mt-1 text-sm">Asked by Musa A., answered by Engr. Kola Akinwale</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow border">
              <h3 className="font-semibold text-lg text-blue-700">
                What is the purpose of a flywheel in a mechanical system?
              </h3>
              <p className="text-gray-600 mt-1 text-sm">Asked by Ngozi O., answered by Prof. Danladi Umar</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/questions">
              <Button variant="ghost" className="text-blue-700">
                View All Questions →
              </Button>
            </Link>
          </div>
        </section>
        {/* Video Classroom Preview */}
        <section className="py-16 px-6 bg-white">
          <h2 className="text-xl font-semibold text-center text-blue-900 mb-6">Featured Video Lessons</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow">
              <video controls className="w-full h-52 object-cover">
                <source src="/videos/thermodynamics-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-blue-700 font-semibold">Thermodynamics 101</h3>
                <p className="text-sm text-gray-600">By Dr. Abiola Ajayi</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow">
              <video controls className="w-full h-52 object-cover">
                <source src="/videos/structural-analysis-basics.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-blue-700 font-semibold">Structural Analysis Basics</h3>
                <p className="text-sm text-gray-600">By Engr. Fatima Yakubu</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/lessons">
              <Button variant="ghost" className="text-blue-700">
                Browse All Lessons →
              </Button>
            </Link>
          </div>
        </section>
        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
