import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const WEBHOOK_URL = "https://karim.n8nkk.tech/webhook/c924151b-1474-4cf7-af1b-48d9cdb85aac"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Define costs
    const COST_PER_ACTION = {
      poster: 1,
      watermark: 1 // You can change this to 2, 3, etc.
    }
    const cost = COST_PER_ACTION[mode as keyof typeof COST_PER_ACTION] || 1

    // Check credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single()

    if (!profile || profile.credits < cost) {
      return NextResponse.json({ error: `Insufficient credits. You need ${cost} credits.` }, { status: 403 })
    }

    const formData = await request.formData()
    const mode = formData.get("mode") as string || "poster"
    
    console.log(`[API] Forwarding request to n8n webhook (Mode: ${mode})...`)

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

    // Check if n8n returned JSON (metadata) instead of the image
    if (contentType && contentType.includes("application/json")) {
      const text = await blob.text()
      try {
        const json = JSON.parse(text)
        console.log("[API] n8n returned JSON:", json)
        
        // Check for the specific metadata signature
        if (json.fileExtension && json.mimeType && !json.data && !json.image) {
           return NextResponse.json(
              { error: "n8n Error: The webhook returned file metadata instead of the image. Please set 'Respond With' to 'Binary' in your n8n Webhook node." },
              { status: 500 }
          )
        }
        
        // If it's a generic error
        if (json.error || json.message) {
           return NextResponse.json(
              { error: json.error || json.message },
              { status: 500 }
          )
        }
      } catch (e) {
        console.error("Error parsing JSON response:", e)
      }
    }

    // Upload to Supabase Storage
    const filename = `${user.id}/${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('posters')
      .upload(filename, blob, {
        contentType: contentType || 'image/png',
        upsert: false
      })

    if (uploadError) {
        console.error("Upload error:", uploadError)
    } else {
        // Get Public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('posters')
          .getPublicUrl(filename)

        // Save to history
        await supabase.from('generations').insert({
            user_id: user.id,
            image_url: publicUrl,
            prompt: mode === 'watermark' ? 'Watermark Removal' : 'Generated Poster'
        })
    }

    // Deduct credit
    await supabase.rpc("decrement_credits", { user_id: user.id, amount: cost })

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
