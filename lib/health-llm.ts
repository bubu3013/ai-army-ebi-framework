import type { PromptVersion } from "./health-types"

export interface HealthFeatures {
  month: string
  avg_temp_taipei: number
  epidemic_index: number
  gt_flu: number
  gt_cold: number
  gt_immunity: number
  gt_competitor_total: number
  has_bundle_promo: boolean
  bundle_discount_rate: number
  bundle_start_date: string
  bundle_duration_days: number
  has_bulk_promo: boolean
  bulk_discount_rate: number
  season_event_tag: string
  historical_sales: { month: string; qty: number }[]
}

export interface PredictionResult {
  prob_L: number
  prob_M: number
  prob_H: number
  pred_class: "Low" | "Mid" | "High"
  step1_b?: string
  raw_output: string
}

function buildPromptVA(features: HealthFeatures): string {
  const histLines = features.historical_sales
    .map(h => `  - ${h.month}: ${h.qty} bottles`)
    .join("\n")

  return `You are a sales forecasting expert for health supplements in Taiwan.

## Product
超級好抗60粒 (Super Defense 60 Capsules) — immune supplement sold through pharmacy chains.

## Sales Categories (based on historical training data)
- Low:  ≤ 363 bottles/month
- Mid:  364–446 bottles/month  
- High: ≥ 447 bottles/month

## Historical Monthly Sales (training context)
${histLines}

## Context for the month to predict: ${features.month}
- Average Temperature (Taipei): ${features.avg_temp_taipei}°C
- Epidemic Index: ${features.epidemic_index}
- Google Trends — Flu searches: ${features.gt_flu}
- Google Trends — Cold searches: ${features.gt_cold}
- Google Trends — Immunity searches: ${features.gt_immunity}
- Google Trends — Competitor total: ${features.gt_competitor_total}
- Season/Event Tag: ${features.season_event_tag || "none"}
- Bundle Promotion: ${features.has_bundle_promo ? `YES — ${(features.bundle_discount_rate * 100).toFixed(1)}% discount, starts ${features.bundle_start_date}, duration ${features.bundle_duration_days} days` : "NO"}
- Bulk Purchase Promotion: ${features.has_bulk_promo ? `YES — ${(features.bulk_discount_rate * 100).toFixed(1)}% discount` : "NO"}

## Task
Based on all the above context, predict the sales category for ${features.month}.

Output ONLY valid JSON in this exact format, no other text:
{
  "prob_L": <0.0-1.0>,
  "prob_M": <0.0-1.0>,
  "prob_H": <0.0-1.0>
}
The three probabilities must sum to 1.0.`
}

function buildPromptVB(features: HealthFeatures): string {
  const histLines = features.historical_sales
    .map(h => `  - ${h.month}: ${h.qty} bottles`)
    .join("\n")

  return `You are a sales forecasting expert for health supplements in Taiwan.

## Product
超級好抗60粒 (Super Defense 60 Capsules) — immune supplement sold through pharmacy chains.

## Sales Categories (based on historical training data)
- Low:  ≤ 363 bottles/month
- Mid:  364–446 bottles/month  
- High: ≥ 447 bottles/month

## Historical Monthly Sales (training context)
${histLines}

## Context for the month to predict: ${features.month}
- Average Temperature (Taipei): ${features.avg_temp_taipei}°C
- Epidemic Index: ${features.epidemic_index}
- Google Trends — Flu searches: ${features.gt_flu}
- Google Trends — Cold searches: ${features.gt_cold}
- Google Trends — Immunity searches: ${features.gt_immunity}
- Google Trends — Competitor total: ${features.gt_competitor_total}
- Season/Event Tag: ${features.season_event_tag || "none"}
- Bundle Promotion: ${features.has_bundle_promo ? `YES — ${(features.bundle_discount_rate * 100).toFixed(1)}% discount, starts ${features.bundle_start_date}, duration ${features.bundle_duration_days} days` : "NO"}
- Bulk Purchase Promotion: ${features.has_bulk_promo ? `YES — ${(features.bulk_discount_rate * 100).toFixed(1)}% discount` : "NO"}

## Task — Two Steps

### Step 1: Identify active consumer purchase drivers
From the following list, identify which motivations are likely ACTIVE this month:
1. Epidemic anxiety (high epidemic index or flu search volume)
2. Seasonal demand (temperature drop, winter onset)
3. Promotion attraction (active bundle or bulk discount)
4. Pre-purchase anticipation (upcoming major event like pharmacy anniversary)
5. Competitor influence (high competitor search volume)

List the active driver numbers and explain briefly why each is active or inactive.
Critically assess: does an active demand motivation ALSO have a purchase trigger (promotion)?

### Step 2: Predict sales category
Based on your Step 1 analysis, output ONLY valid JSON in this exact format, no other text:
{
  "step1_reasoning": "<your Step 1 analysis>",
  "prob_L": <0.0-1.0>,
  "prob_M": <0.0-1.0>,
  "prob_H": <0.0-1.0>
}
The three probabilities must sum to 1.0.`
}

function parseOutput(text: string): Omit<PredictionResult, "raw_output"> {
  // Strip markdown code fences if present
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  try {
    const parsed = JSON.parse(clean)
    const prob_L = parseFloat(parsed.prob_L) || 0
    const prob_M = parseFloat(parsed.prob_M) || 0
    const prob_H = parseFloat(parsed.prob_H) || 0
    const classes = [
      { c: "Low" as const, p: prob_L },
      { c: "Mid" as const, p: prob_M },
      { c: "High" as const, p: prob_H },
    ]
    const pred_class = classes.reduce((a, b) => (b.p > a.p ? b : a)).c
    return { prob_L, prob_M, prob_H, pred_class, step1_b: parsed.step1_reasoning }
  } catch {
    throw new Error(`Failed to parse model output: ${text.slice(0, 200)}`)
  }
}

// Called from API route — apiKey is passed per request
export async function predictWithOpenAI(
  features: HealthFeatures,
  version: PromptVersion,
  model: "gpt-4o" | "gpt-4o-mini",
  apiKey: string
): Promise<PredictionResult> {
  const prompt = version === "vB" ? buildPromptVB(features) : buildPromptVA(features)

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 512,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || "OpenAI API error")
  }

  const data = await res.json()
  const raw_output: string = data.choices[0].message.content ?? ""
  return { ...parseOutput(raw_output), raw_output }
}

export async function predictWithClaude(
  features: HealthFeatures,
  version: PromptVersion,
  apiKey: string
): Promise<PredictionResult> {
  const prompt = version === "vB" ? buildPromptVB(features) : buildPromptVA(features)

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || "Anthropic API error")
  }

  const data = await res.json()
  const raw_output: string =
    data.content?.[0]?.type === "text" ? data.content[0].text : ""
  return { ...parseOutput(raw_output), raw_output }
}
