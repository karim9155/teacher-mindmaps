import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: generations } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">سجل التصاميم</h1>
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
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {new Date(gen.created_at).toLocaleDateString("ar-TN")}
                  </p>
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
