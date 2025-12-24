import ImageTool from "@/components/image-tool"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreditCard, History } from "lucide-react"
import LogoutButton from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Badge } from "@/components/ui/badge"

export default async function Dashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Dashboard Auth Error:", authError)
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  if (profileError) {
    console.error("Dashboard Profile Error:", profileError)
    // If the table doesn't exist or row is missing, we'll just show 0 credits
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">أدوات المعلم الذكية</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">أهلاً بك،</p>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {profile?.credits ?? 0} رصيد
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/history">
              <Button variant="ghost" size="icon">
                <History className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="gap-2" variant={(profile?.credits ?? 0) > 0 ? "outline" : "default"}>
                <CreditCard className="w-4 h-4" />
                شراء رصيد
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="poster" className="w-full max-w-4xl mx-auto" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="poster">مصمم الملصقات</TabsTrigger>
            <TabsTrigger value="watermark">إزالة العلامة المائية</TabsTrigger>
          </TabsList>
          <TabsContent value="poster">
            <ImageTool userId={user.id} credits={profile?.credits ?? 0} mode="poster" />
          </TabsContent>
          <TabsContent value="watermark">
            <ImageTool userId={user.id} credits={profile?.credits ?? 0} mode="watermark" />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>صُنع بكل حب لمعلمي الصف الأول</p>
        </div>
      </footer>
    </div>
  )
}
