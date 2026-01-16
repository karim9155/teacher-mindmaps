import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const WEBHOOK_URL = "https://karim.n8nkk.tech/webhook/c924151b-1474-4cf7-af1b-48d9cdb85aac"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error("[API] Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed", details: authError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[API] User authenticated:", user.id)

    const formData = await request.formData()
    const mode = formData.get("mode") as string || "poster"

    // Define costs
    const COST_PER_ACTION = {
      poster: 1,
      watermark: 1 // You can change this to 2, 3, etc.
    }
    const cost = COST_PER_ACTION[mode as keyof typeof COST_PER_ACTION] || 1

    // Check credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[API] Profile fetch error:", profileError)
      return NextResponse.json({ error: "Failed to fetch user profile", details: profileError.message }, { status: 500 })
    }

    if (!profile || profile.credits < cost) {
      console.log("[API] Insufficient credits. User has:", profile?.credits, "needs:", cost)
      return NextResponse.json({ error: `Insufficient credits. You need ${cost} credits.` }, { status: 403 })
    }
    
    console.log(`[API] User has ${profile.credits} credits, proceeding with ${mode} (cost: ${cost})`)
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
        console.error("[API] Supabase upload error:", uploadError)
        return NextResponse.json({ error: "Failed to upload image", details: uploadError.message }, { status: 500 })
    } else {
        console.log("[API] Upload successful:", filename)
        // Get Public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('posters')
          .getPublicUrl(filename)

        console.log("[API] Public URL:", publicUrl)

        // Save to history
        const { error: insertError } = await supabase.from('generations').insert({
            user_id: user.id,
            image_url: publicUrl,
            prompt: mode === 'watermark' ? 'Watermark Removal' : 'Generated Poster'
        })

        if (insertError) {
          console.error("[API] Failed to save to history:", insertError)
          // Don't fail the request if history insert fails
        }
    }

    // Deduct credit
    const { error: rpcError } = await supabase.rpc("decrement_credits", { user_id: user.id, amount: cost })
    
    if (rpcError) {
      console.error("[API] Failed to decrement credits:", rpcError)
      return NextResponse.json({ error: "Failed to deduct credits", details: rpcError.message }, { status: 500 })
    }

    console.log("[API] Credits decremented successfully")

    // Return the response with the correct content type
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
    })
  } catch (error) {
    console.error("[API] Error forwarding request:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    )
  }
}
