"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  url: string
  filename: string
}

export default function DownloadButton({ url, filename }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
      // Fallback to opening in new tab if fetch fails (e.g. CORS)
      window.open(url, '_blank')
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
      <Download className="w-4 h-4" />
      تحميل
    </Button>
  )
}
