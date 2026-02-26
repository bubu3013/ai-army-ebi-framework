import type { MonthResult, GroundTruth, AblationRow, ModelId, PromptVersion } from "./health-types"

const FILE_MAP: Record<ModelId, string> = {
  "gpt-4o": "gpt4o",
  "haiku":  "haiku",
  "mini":   "mini",
}

// Simple in-memory cache
const resultCache = new Map<string, MonthResult[]>()
let groundTruthCache: GroundTruth | null = null
let ablationCache: AblationRow[] | null = null

export async function loadResults(model: ModelId, version: PromptVersion): Promise<MonthResult[]> {
  const key = `${model}_${version}`
  if (resultCache.has(key)) return resultCache.get(key)!

  const fileName = `${FILE_MAP[model]}_${version}`
  const res = await fetch(`/data/results/${fileName}.json`)
  if (!res.ok) { console.error(`Failed to load ${fileName}.json`); return [] }

  const data: MonthResult[] = await res.json()
  resultCache.set(key, data)
  return data
}

export async function loadAllResults(): Promise<MonthResult[]> {
  const models: ModelId[] = ["gpt-4o", "haiku", "mini"]
  const versions: PromptVersion[] = ["vA", "vB"]
  const all = await Promise.all(
    models.flatMap(m => versions.map(v => loadResults(m, v)))
  )
  return all.flat()
}

export async function loadGroundTruth(): Promise<GroundTruth> {
  if (groundTruthCache) return groundTruthCache
  const res = await fetch("/data/results/ground_truth.json")
  groundTruthCache = await res.json()
  return groundTruthCache!
}

export async function loadAblation(): Promise<AblationRow[]> {
  if (ablationCache) return ablationCache
  const res = await fetch("/data/results/ablation.json")
  ablationCache = await res.json()
  return ablationCache!
}

export function clearCache() {
  resultCache.clear()
  groundTruthCache = null
  ablationCache = null
}

// Compute summary stats for a set of results
export function computeStats(results: MonthResult[]) {
  if (results.length === 0) return { dirAcc: 0, avgRps: 0, avgMae: 0 }
  const dirAcc  = results.filter(r => r.correct === 1).length / results.length
  const avgRps  = results.reduce((s, r) => s + r.rps, 0) / results.length
  const avgMae  = results.reduce((s, r) => s + r.ordinal_mae, 0) / results.length
  return { dirAcc, avgRps, avgMae }
}
