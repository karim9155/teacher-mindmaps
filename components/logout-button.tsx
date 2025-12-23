"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button variant="ghost" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
      <LogOut className="w-4 h-4" />
      تسجيل خروج
    </Button>
  )
}
