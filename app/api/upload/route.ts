import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const MODEL_ANALYZE = "models/gemini-2.5-flash"           // vision/text analysis
const MODEL_POSTER  = "models/gemini-3-pro-image-preview" // Nano Banana Pro - image generation


const ANALYSIS_PROMPT = `You are an educational design assistant helping first grade teachers digitize their hand-sketched posters and exercises.

Analyze the uploaded image and extract:

1. **All text content**: Extract every word, phrase, title, and label exactly as written, preserving spelling and capitalization.

2. **Structure and layout**: Describe the visual hierarchy and organization including:
   - Main title/heading
   - Subheadings
   - Lists (numbered or bulleted)
   - Sections or columns
   - Any special formatting (bold, underlined, circled items)
   - Position of elements (top, center, left, right)

3. **Visual elements**: Note any:
   - Drawings, illustrations, or icons
   - Shapes or borders
   - Colors used
   - Arrows or connectors

4. **Educational context**: Identify:
   - Subject matter (math, reading, science, etc.)
   - Type of content (worksheet, poster, flashcard, etc.)
   - Grade-appropriate design elements

Provide the output in this JSON format:
{
  "title": "main title",
  "content": "all extracted text",
  "structure": "detailed description of layout",
  "visual_elements": "description of drawings and decorations",
  "educational_type": "subject and content type",
  "design_notes": "suggestions for professional redesign"
}`

function buildPosterPrompt(analysisText: string, gradePrompt: string): string {
  return `PROMPT

STRICT RULE (VERY IMPORTANT):
Use ONLY the text contained in the provided content, written in Arabic.
❌ Do NOT add, rewrite, simplify, translate, explain, or invent any new words or sentences.
❌ Do NOT add titles, labels, examples, or decorations containing text that is not already present in the content.
✅ You may only visually style, position, and illustrate the existing Arabic text.


Content and structure:
${analysisText}

Design requirements:
${gradePrompt}


Final result:

A professional, eye-catching classroom poster that helps first-grade children easily read and understand the original Arabic content, using visuals only for support.


Adapt it for A4 vs A3 print

Add right-to-left (RTL) layout guidance explicitly for Arabic typography`
}


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
    const imageFile = formData.get("image") as File | null
    const gradePrompt = (formData.get("prompt") as string) || ""

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const cost = 1

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
      return NextResponse.json({ error: `Insufficient credits. You need ${cost} credits.` }, { status: 403 })
    }

    console.log(`[API] User has ${profile.credits} credits, proceeding (cost: ${cost})`)

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString("base64")
    const mimeType = (imageFile.type || "image/jpeg") as string

    let resultImageBase64: string
    let resultMimeType: string

    // Step 1: Analyze the image
      console.log("[API] Step 1: Analyzing image with", MODEL_ANALYZE)
      const analyzeModel = genAI.getGenerativeModel({ model: MODEL_ANALYZE })

      const analysisResult = await analyzeModel.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: ANALYSIS_PROMPT },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        }],
      })

      const analysisText = analysisResult.response.candidates?.[0]?.content?.parts
        ?.find((p: { text?: string }) => p.text)?.text ?? ""

      if (!analysisText) {
        return NextResponse.json({ error: "Failed to analyze the image. Please try again." }, { status: 500 })
      }

      console.log("[API] Step 1 complete. Analysis length:", analysisText.length)

      // Step 2: Generate the poster image from analysis
      console.log("[API] Step 2: Generating poster with", MODEL_POSTER)
      const generateModel = genAI.getGenerativeModel({ model: MODEL_POSTER })

      const generateResult = await generateModel.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: buildPosterPrompt(analysisText, gradePrompt) }],
        }],
        // @ts-expect-error: responseModalities not yet in SDK types
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      })

      const imagePart = generateResult.response.candidates?.[0]?.content?.parts
        ?.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData)

      if (!imagePart?.inlineData) {
        console.error("[API] No image in generation response. Parts:", JSON.stringify(
          generateResult.response.candidates?.[0]?.content?.parts
        ))
        return NextResponse.json({ error: "Gemini did not return an image. Please try again." }, { status: 500 })
      }

      resultImageBase64 = imagePart.inlineData.data
      resultMimeType = imagePart.inlineData.mimeType || "image/png"
      console.log("[API] Step 2 complete. Image size (base64):", resultImageBase64.length)

    // Upload to Supabase Storage
    const generatedBuffer = Buffer.from(resultImageBase64, "base64")
    const blob = new Blob([generatedBuffer], { type: resultMimeType })
    const filename = `${user.id}/${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from("posters")
      .upload(filename, blob, { contentType: resultMimeType, upsert: false })

    if (uploadError) {
      console.error("[API] Supabase upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload image", details: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from("posters").getPublicUrl(filename)
    console.log("[API] Public URL:", publicUrl)

    // Save to history
    const { error: insertError } = await supabase.from("generations").insert({
      user_id: user.id,
      image_url: publicUrl,
      prompt: "Generated Poster",
    })

    if (insertError) {
      console.error("[API] Failed to save to history:", insertError)
    }

    // Deduct credit
    const { error: rpcError } = await supabase.rpc("decrement_credits", { user_id: user.id, amount: cost })

    if (rpcError) {
      console.error("[API] Failed to decrement credits:", rpcError)
      return NextResponse.json({ error: "Failed to deduct credits", details: rpcError.message }, { status: 500 })
    }

    console.log("[API] Credits decremented. Returning image.")

    return new NextResponse(blob, {
      status: 200,
      headers: { "Content-Type": resultMimeType },
    })

  } catch (error) {
    console.error("[API] Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 })
  }
}
