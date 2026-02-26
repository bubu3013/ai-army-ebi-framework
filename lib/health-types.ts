export type SalesCategory = "Low" | "Mid" | "High"
export type PromptVersion = "vA" | "vB"
export type ModelId = "gpt-4o" | "haiku" | "mini"

export interface MonthResult {
  model: string
  version: string
  month: string
  true_class: SalesCategory
  pred_class: SalesCategory
  correct: number
  prob_L: number
  prob_M: number
  prob_H: number
  rps: number
  log_score: number
  ordinal_mae: number
  step1_b: string | null
  notes: string
}

export interface GroundTruthMonth {
  month: string
  label: string
  true_class: SalesCategory
  true_sales_qty: number
  description: string
}

export interface GroundTruth {
  months: GroundTruthMonth[]
  cutpoints: { Low: string; Mid: string; High: string }
}

export interface AblationRow {
  id: string
  label: string
  features_removed: string
  dir_acc: number
  avg_ordinal_mae: number
  avg_rps: number
  delta_rps: number
  impact: "critical" | "minor" | "none" | "positive"
}

export const MODELS: { value: ModelId; label: string; fullName: string; color: string }[] = [
  { value: "gpt-4o", label: "GPT-4o",       fullName: "gpt-4o-2024-11-20",       color: "oklch(0.55 0.2 270)" },
  { value: "haiku",  label: "Claude Haiku",  fullName: "claude-3-haiku-20240307", color: "oklch(0.6 0.18 50)"  },
  { value: "mini",   label: "GPT-4o-mini",   fullName: "gpt-4o-mini-2024-07-18",  color: "oklch(0.55 0.18 300)"},
]

export const VERSIONS: { value: PromptVersion; label: string; description: string }[] = [
  { value: "vA", label: "Version A", description: "Implicit direct prediction" },
  { value: "vB", label: "Version B", description: "CoT two-step reasoning" },
]

export const CATEGORY_COLORS: Record<SalesCategory, string> = {
  Low:  "oklch(0.55 0.2 25)",
  Mid:  "oklch(0.6 0.15 60)",
  High: "oklch(0.5 0.18 145)",
}

export const FEATURE_LABELS: Record<string, string> = {
  F1: "疫情焦慮",
  F2: "疫情指數",
  F3: "促銷吸引",
  F4: "季節需求",
  F5: "競品聲量",
  F6: "節慶標籤",
  F7: "歷史銷量",
  F8: "搭贈促銷",
  F9: "多量售促銷",
}
