import PosterUpload from "@/components/poster-upload"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">مصمم الملصقات للمعلمين</h1>
          <p className="text-muted-foreground mt-1">حول ملصقاتك المرسومة يدوياً إلى تصاميم جميلة واحترافية</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <PosterUpload />
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>صُنع بكل حب لمعلمي الصف الأول</p>
        </div>
      </footer>
    </div>
  )
}
