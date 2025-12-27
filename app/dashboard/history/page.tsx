import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CreditCard, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/logout-button"
import DownloadButton from "@/components/download-button"

import { Badge } from "@/components/ui/badge"

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single()

  const { data: generations } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-start md:flex-row md:items-center gap-4">
            <img src="/logo.png" alt="مصمم الملصقات للمعلمين" className="h-12 w-auto" />
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <p className="text-muted-foreground">أهلاً بك،</p>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {profile?.credits ?? 0} رصيد
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" title="الرئيسية">
                <Home className="w-5 h-5" />
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
        {generations && generations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((gen) => (
              <Card key={gen.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src={gen.image_url} 
                    alt="Generated Poster" 
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {new Date(gen.created_at).toLocaleDateString("ar-TN")}
                  </p>
                  <DownloadButton 
                    url={gen.image_url} 
                    filename={`poster-${new Date(gen.created_at).getTime()}.png`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">لا يوجد تصاميم سابقة</p>
            <Link href="/dashboard">
              <Button className="mt-4">صمم أول ملصق لك</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
