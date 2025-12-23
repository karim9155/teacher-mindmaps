"use client"

import { useState } from "react"
import { Check, Phone, CreditCard, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function PricingPage() {
  const [selectedPack, setSelectedPack] = useState<string | null>(null)

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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">باقات الرصيد</h1>
            <p className="text-muted-foreground mt-1 text-sm">اختر الباقة المناسبة لاحتياجاتك</p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packs.map((pack) => (
            <Card key={pack.id} className={`relative flex flex-col ${pack.recommended ? 'border-primary shadow-lg scale-105' : ''}`}>
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
              <CardFooter>
                <PaymentDialog packName={pack.name} price={pack.price} />
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">كيف تعمل عملية الدفع؟</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-card rounded-lg border">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <p>اختر الباقة وأرسل المبلغ عبر D17</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <p>أدخل رمز المعاملة في الموقع</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <p>يتم شحن رصيدك فوراً</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function PaymentDialog({ packName, price }: { packName: string, price: string }) {
  const [step, setStep] = useState(1)
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">شراء الباقة</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>شراء {packName}</DialogTitle>
          <DialogDescription>
            اتبع الخطوات التالية لإتمام عملية الدفع
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 text-center">
                المبلغ المطلوب: <span className="text-lg font-bold">{price} دينار</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">أرسل المبلغ عبر D17</p>
                  <p className="text-sm text-muted-foreground">إلى الرقم: <span className="font-bold text-foreground select-all">55123456</span></p>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              لقد قمت بإرسال المبلغ
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>رقم الهاتف الذي أرسلت منه</Label>
              <Input placeholder="مثال: 55123456" type="tel" className="text-right" />
            </div>
            <div className="space-y-2">
              <Label>رمز المعاملة (Code de transaction)</Label>
              <Input placeholder="أدخل الرمز الموجود في رسالة التأكيد" className="text-right" />
            </div>
            <div className="pt-4">
              <Button className="w-full" onClick={() => alert("تم استلام طلبك! سيتم تفعيل الباقة خلال دقائق.")}>
                تأكيد الدفع
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)} className="w-full mt-2">
                رجوع
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
