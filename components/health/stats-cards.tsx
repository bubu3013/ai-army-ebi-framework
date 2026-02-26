"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, TrendingDown, AlignJustify } from "lucide-react"
import type { MonthResult } from "@/lib/health-types"
import { computeStats } from "@/lib/health-data-store"

interface StatsCardsProps {
  results: MonthResult[]
}

export function StatsCards({ results }: StatsCardsProps) {
  const { dirAcc, avgRps, avgMae } = computeStats(results)
  const correct = results.filter(r => r.correct === 1).length
  const total   = results.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Directional Accuracy</p>
              <p className="text-2xl font-semibold">{correct}/{total}</p>
              <p className="text-sm text-muted-foreground">{(dirAcc * 100).toFixed(0)}% correct</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <TrendingDown className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg RPS ↓</p>
              <p className="text-2xl font-semibold">{avgRps.toFixed(4)}</p>
              <p className="text-sm text-muted-foreground">Ranked Probability Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-chart-4/10">
              <AlignJustify className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Ordinal MAE ↓</p>
              <p className="text-2xl font-semibold">{avgMae.toFixed(3)}</p>
              <p className="text-sm text-muted-foreground">Ordinal distance error</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
