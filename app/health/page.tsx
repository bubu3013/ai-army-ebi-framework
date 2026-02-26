"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { SettingsPanel } from "@/components/health/settings-panel"
import { StatsCards } from "@/components/health/stats-cards"
import { DistributionChart } from "@/components/health/distribution-chart"
import { BreakdownChart } from "@/components/health/breakdown-chart"
import { ResultsTable } from "@/components/health/results-table"
import { loadResults, loadAllResults, loadGroundTruth, loadAblation } from "@/lib/health-data-store"
import type { ModelId, PromptVersion, MonthResult, AblationRow } from "@/lib/health-types"
import type { GroundTruth } from "@/lib/health-types"

export default function HealthDashboardPage() {
  const [model,   setModel]   = useState<ModelId>("gpt-4o")
  const [version, setVersion] = useState<PromptVersion>("vB")

  const [results,     setResults]     = useState<MonthResult[]>([])
  const [allResults,  setAllResults]  = useState<MonthResult[]>([])
  const [groundTruth, setGroundTruth] = useState<GroundTruth | null>(null)
  const [ablation,    setAblation]    = useState<AblationRow[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [current, all, gt, abl] = await Promise.all([
        loadResults(model, version),
        loadAllResults(),
        loadGroundTruth(),
        loadAblation(),
      ])
      setResults(current)
      setAllResults(all)
      setGroundTruth(gt)
      setAblation(abl)
      setLoading(false)
    }
    fetchData()
  }, [model, version])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">

        <SettingsPanel
          model={model}
          version={version}
          onModelChange={setModel}
          onVersionChange={setVersion}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading results…</span>
          </div>
        )}

        {!loading && (
          <>
            <StatsCards results={results} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DistributionChart results={results} groundTruth={groundTruth} />
              <BreakdownChart allResults={allResults} ablation={ablation} />
            </div>

            <ResultsTable results={results} groundTruth={groundTruth} />
          </>
        )}
      </main>

      <footer className="border-t border-border mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            AI-Army EBI Framework · Health Food Sales Prediction · ACL Demo 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
