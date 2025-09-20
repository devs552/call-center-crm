"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin-dashboard"
import { EmployeeDashboard } from "@/components/employee-dashboard"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const authData = getCurrentUser()

    if (!authData) {
      router.push("/auth/login")
      return
    }

    setUser(authData.user)
    setProfile(authData.profile)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          {/* Animated spinner */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
            <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 absolute top-2 left-1/2 transform -translate-x-1/2 animate-reverse-spin"></div>
          </div>
          
          {/* Loading text with animation */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 animate-pulse">
              Loading Dashboard
            </h2>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-gray-600 text-sm animate-fade-in">
              Preparing your workspace...
            </p>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes reverse-spin {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }
          .animate-reverse-spin {
            animation: reverse-spin 1s linear infinite;
          }
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 2s ease-in-out infinite alternate;
          }
        `}</style>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  if (profile.role === "admin") {
    return <AdminDashboard user={user} profile={profile} />
  } else {
    return <EmployeeDashboard user={user} profile={profile} />
  }
}