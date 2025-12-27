"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowLeft } from "lucide-react"

export default function LandingPage() {
  const packs = [
    {
      id: "basic",
      name: "باقة البداية",
      posters: 10,
      price: "8",
      description: "مثالية لتجربة الخدمة",
      features: ["10 ملصقات عالية الجودة", "حفظ بصيغة PDF", "دعم فني عبر واتساب"],
      recommended: false
    },
    {
      id: "teacher",
      name: "باقة المعلم",
      posters: 30,
      price: "22",
      originalPrice: "24",
      description: "الأكثر طلباً للمعلمين",
      features: ["30 ملصق عالي الجودة", "أولوية في المعالجة", "حفظ بصيغة PDF", "دعم فني مميز"],
      recommended: true
    },
    {
      id: "pro",
      name: "الباقة السنوية",
      posters: 100,
      price: "65",
      originalPrice: "80",
      description: "تكفي لسنة دراسية كاملة",
      features: ["100 ملصق عالي الجودة", "أعلى سرعة معالجة", "حفظ بصيغة PDF", "دعم فني مباشر"],
      recommended: false
    }
  ]

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="مصمم الملصقات للمعلمين" className="h-12 w-auto" />
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">تسجيل الدخول</Button>
            </Link>
            <Link href="/login">
              <Button>ابدأ الآن</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            حول رسوماتك اليدوية إلى <span className="text-primary">ملصقات تعليمية احترافية</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            أداة مصممة خصيصاً لمعلمي الصف الأول في تونس. التقط صورة لرسمك، وسنقوم بتحويله إلى ملصق جميل جاهز للطباعة في ثوانٍ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 text-lg px-8">
                جربها الآن <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">باقات تناسب الجميع</h2>
            <p className="text-muted-foreground">اختر الباقة التي تناسب احتياجاتك الدراسية</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packs.map((pack) => (
              <Card key={pack.id} className={`relative flex flex-col bg-card ${pack.recommended ? 'border-primary shadow-xl scale-105 z-10' : 'border-border'}`}>
                {pack.recommended && (
                  <div className="absolute -top-4 right-0 left-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                      الأكثر مبيعاً
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{pack.name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{pack.price}</span>
                    <span className="text-muted-foreground mr-2">دينار</span>
                    {pack.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        {pack.originalPrice} دينار
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-primary mt-2">
                    {pack.posters} ملصق ({Math.round(Number(pack.price) / pack.posters * 1000)} مليم للملصق)
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {pack.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Link href="/login" className="w-full">
                    <Button className="w-full" variant={pack.recommended ? "default" : "outline"}>
                      اشترك الآن
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-4">صُنع بكل حب لمعلمي الصف الأول في تونس 🇹🇳</p>
          <div className="flex justify-center gap-6">
            <Link href="#" className="hover:text-primary">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-primary">شروط الاستخدام</Link>
            <button
              type="button"
              className="hover:text-primary underline bg-transparent border-0 cursor-pointer"
              style={{ background: 'none', padding: 0, font: 'inherit' }}
              onClick={() => window.alert("26620734")}
            >
              اتصل بنا
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
