"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setError("تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "أنشئ حساباً للحصول على ملصقين مجاناً" 
              : "الرجاء إدخال بياناتك للمتابعة"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-right"
                dir="rtl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-right"
                dir="rtl"
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className={`text-sm text-center font-medium ${error.includes("بنجاح") ? "text-green-600" : "text-destructive"}`}>
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "إنشاء حساب" : "دخول"}
            </Button>
            <Button 
              type="button" 
              variant="link" 
              className="text-sm text-muted-foreground"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp 
                ? "لديك حساب بالفعل؟ تسجيل الدخول" 
                : "ليس لديك حساب؟ أنشئ حساباً جديداً"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
