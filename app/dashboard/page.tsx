import PosterUpload from "@/components/poster-upload"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreditCard, History } from "lucide-react"
import LogoutButton from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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
            <h1 className="text-2xl font-bold text-foreground">مصمم الملصقات للمعلمين</h1>
            <p className="text-muted-foreground mt-1">
              أهلاً بك، لديك {profile?.credits ?? 0} رصيد متبقي
            </p>
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
        <PosterUpload userId={user.id} credits={profile?.credits ?? 0} />
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>صُنع بكل حب لمعلمي الصف الأول</p>
        </div>
      </footer>
    </div>
  )
}
