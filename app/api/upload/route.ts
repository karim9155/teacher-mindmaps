import { NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = "https://karim.n8nkk.tech/webhook/c924151b-1474-4cf7-af1b-48d9cdb85aac"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    console.log("[API] Forwarding request to n8n webhook...")

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    })

    console.log("[API] n8n response status:", response.status)
    
    const contentType = response.headers.get("content-type")
    console.log("[API] n8n content-type:", contentType)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Webhook failed with status: ${response.status}` },
        { status: response.status }
      )
    }
    
    // Get the response body as a blob/buffer
    const blob = await response.blob()
    console.log("[API] n8n response size:", blob.size)
    
    // Return the response with the correct content type
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
    })
  } catch (error) {
    console.error("[API] Error forwarding request:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
