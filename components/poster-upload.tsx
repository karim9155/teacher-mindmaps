"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2, CheckCircle2, XCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const WEBHOOK_URL = "/api/upload"

type UploadStatus = "idle" | "uploading" | "success" | "error"

export default function PosterUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file")
      return
    }

    setSelectedFile(file)
    setStatus("idle")
    setResultImageUrl(null)
    setErrorMessage("")

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setStatus("uploading")
    setErrorMessage("")
    setResultImageUrl(null)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("filename", selectedFile.name)
      formData.append("timestamp", new Date().toISOString())

      console.log("[v0] Sending request to webhook...")

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      console.log("[v0] Content-Type:", contentType)

      // n8n sends binary files with image/* content type
      if (
        contentType &&
        (contentType.startsWith("image/") ||
          contentType.includes("jpeg") ||
          contentType.includes("jpg") ||
          contentType.includes("png"))
      ) {
        console.log("[v0] Detected image response, creating blob...")
        const blob = await response.blob()
        console.log("[v0] Blob created, size:", blob.size, "type:", blob.type)
        const imageUrl = URL.createObjectURL(blob)
        console.log("[v0] Blob URL created:", imageUrl)
        setResultImageUrl(imageUrl)
        setStatus("success")
      } else {
        // Try JSON response (backup)
        console.log("[v0] Trying to parse as JSON...")
        const result = await response.json()
        console.log("[v0] JSON response:", result)

        if (result.image || result.imageUrl || result.url || result.data) {
          setResultImageUrl(result.image || result.imageUrl || result.url || result.data)
          setStatus("success")
        } else {
          setStatus("error")
          setErrorMessage("لم يتم استلام الصورة المصممة. يرجى المحاولة مرة أخرى.")
          console.log("[v0] No image found in response")
        }
      }
    } catch (error) {
      console.log("[v0] Error occurred:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "فشل الرفع. يرجى المحاولة مرة أخرى.")
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setStatus("idle")
    if (resultImageUrl && resultImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(resultImageUrl)
    }
    setResultImageUrl(null)
    setErrorMessage("")
  }

  const handleDownload = async () => {
    if (!resultImageUrl) return

    try {
      let blob: Blob

      if (resultImageUrl.startsWith("blob:")) {
        // Already a blob URL, fetch it
        const response = await fetch(resultImageUrl)
        blob = await response.blob()
      } else {
        // External URL, fetch it
        const response = await fetch(resultImageUrl)
        blob = await response.blob()
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `designed-poster-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setErrorMessage("فشل تحميل الصورة. يرجى المحاولة مرة أخرى.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">ارفع ملصقك المرسوم يدوياً</CardTitle>
          <CardDescription>قم بتحميل صورة لملصقك أو تمرينك المرسوم يدوياً، وسنحوله إلى تصميم احترافي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          {!selectedFile && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">اسحب الصورة هنا</p>
                <p className="text-sm text-muted-foreground">أو</p>
                <Button variant="secondary" onClick={() => document.getElementById("file-input")?.click()}>
                  تصفح الملفات
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4">الصيغ المدعومة: JPG, PNG, HEIC</p>
            </div>
          )}

          {/* Preview and Upload */}
          {selectedFile && previewUrl && status !== "success" && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="معاينة"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpload} disabled={status === "uploading"} className="flex-1" size="lg">
                  {status === "uploading" ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <Upload className="ml-2 h-4 w-4" />
                      تحويل الملصق
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline" disabled={status === "uploading"} size="lg">
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="space-y-4">
              <Alert className="border-primary bg-primary/5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription className="text-foreground">تم تحويل ملصقك بنجاح!</AlertDescription>
              </Alert>

              {resultImageUrl && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">الأصلي</h3>
                      <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                        <img src={previewUrl || ""} alt="الأصلي" className="w-full h-auto object-contain" />
                      </div>
                    </div>

                    {/* Designed */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">المصمم</h3>
                      <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                        <img
                          src={resultImageUrl || "/placeholder.svg"}
                          alt="الملصق المصمم"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleDownload} className="flex-1" size="lg">
                      <Download className="ml-2 h-4 w-4" />
                      تحميل الملصق المصمم
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="lg">
                      رفع ملصق آخر
                    </Button>
                  </div>
                </div>
              )}

              {!resultImageUrl && (
                <Button onClick={handleReset} variant="outline" size="lg" className="w-full bg-transparent">
                  رفع ملصق آخر
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>كيف يعمل؟</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-medium text-xs">
                ١
              </span>
              <span>التقط صورة واضحة لملصقك أو تمرينك المرسوم يدوياً</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-medium text-xs">
                ٢
              </span>
              <span>قم برفع الصورة باستخدام النموذج أعلاه</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-medium text-xs">
                ٣
              </span>
              <span>سيقوم الذكاء الاصطناعي باستخراج النص وإعادة إنشائه كتصميم احترافي</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-medium text-xs">
                ٤
              </span>
              <span>حمل ملصقك المصمم بشكل جميل جاهزاً للطباعة أو المشاركة</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
