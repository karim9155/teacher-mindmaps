import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, History, CreditCard } from "lucide-react"
import PricingList from "@/components/pricing-list"
import LogoutButton from "@/components/logout-button"
import { Badge } from "@/components/ui/badge"

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">باقات الرصيد</h1>
            <p className="text-muted-foreground mt-1 text-sm">اختر الباقة المناسبة لاحتياجاتك</p>
          </div>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">الرصيد:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {profile?.credits ?? 0}
                </Badge>
              </div>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" title="الرئيسية">
                  <Home className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="icon" title="السجل">
                  <History className="w-5 h-5" />
                </Button>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <PricingList />
      </main>
    </div>
  )
}

