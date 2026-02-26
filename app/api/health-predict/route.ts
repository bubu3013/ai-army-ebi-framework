import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { predictWithOpenAI, predictWithClaude } from "@/lib/health-llm"
import type { HealthFeatures, PredictionResult } from "@/lib/health-llm"
import type { PromptVersion } from "@/lib/health-types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      features,
      model,
      version,
      openai_api_key,
      anthropic_api_key,
    }: {
      features: HealthFeatures
      model: "gpt-4o" | "haiku" | "mini"
      version: PromptVersion
      openai_api_key?: string
      anthropic_api_key?: string
    } = body

    if (!features || !model || !version) {
      return NextResponse.json({ error: "Missing required fields: features, model, version" }, { status: 400 })
    }

    let result: PredictionResult

    if (model === "haiku") {
      if (!anthropic_api_key) {
        return NextResponse.json({ error: "Anthropic API key required for Claude Haiku" }, { status: 400 })
      }
      result = await predictWithClaude(features, version, anthropic_api_key)
    } else {
      if (!openai_api_key) {
        return NextResponse.json({ error: "OpenAI API key required for GPT models" }, { status: 400 })
      }
      const openaiModel = model === "mini" ? "gpt-4o-mini" : "gpt-4o"
      result = await predictWithOpenAI(features, version, openaiModel, openai_api_key)
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("health-predict API error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
