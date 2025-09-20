import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Call Center CRM</h1>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-700">Account Created Successfully!</CardTitle>
              <CardDescription className="text-slate-600">
                Please check your email to verify your account
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  We've sent a verification email to your inbox. Please click the verification link to activate your
                  account and access the CRM system.
                </p>
                <div className="pt-4">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/auth/login">Return to Login</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
