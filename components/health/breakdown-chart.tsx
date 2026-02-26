"use client"

import { useState } from "react"
import {
  Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, LabelList,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { MonthResult, AblationRow } from "@/lib/health-types"
import { MODELS, VERSIONS, CATEGORY_COLORS } from "@/lib/health-types"
import { computeStats } from "@/lib/health-data-store"

interface BreakdownChartProps {
  allResults: MonthResult[]
  ablation: AblationRow[]
}

type ViewMode = "rps" | "dirac" | "mae" | "ablation"

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "rps",      label: "Avg RPS (↓ better)"           },
  { value: "dirac",    label: "Directional Accuracy (↑ better)"},
  { value: "mae",      label: "Avg Ordinal MAE (↓ better)"   },
  { value: "ablation", label: "Ablation Study (GPT-4o vB)"   },
]

const IMPACT_COLOR: Record<string, string> = {
  critical: "hsl(var(--destructive))",
  minor:    "oklch(0.6 0.15 60)",
  none:     "hsl(var(--muted-foreground))",
  positive: "hsl(var(--accent))",
}

export function BreakdownChart({ allResults, ablation }: BreakdownChartProps) {
  const [view, setView] = useState<ViewMode>("rps")

  // Build model × version comparison data
  const comparisonData = MODELS.flatMap(m =>
    VERSIONS.map(v => {
      const rows = allResults.filter(r => r.model === m.value && r.version === v.value)
      const { dirAcc, avgRps, avgMae } = computeStats(rows)
      return {
        name:   `${m.label} ${v.value}`,
        model:  m.value,
        version: v.value,
        color:  m.color,
        rps:    parseFloat(avgRps.toFixed(4)),
        dirac:  parseFloat((dirAcc * 100).toFixed(1)),
        mae:    parseFloat(avgMae.toFixed(3)),
      }
    })
  )

  const ablationData = ablation.map(a => ({
    ...a,
    color: IMPACT_COLOR[a.impact] ?? "hsl(var(--muted-foreground))",
  }))

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-medium">Model Comparison</CardTitle>
          <Select value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {view !== "ablation" ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => view === "dirac" ? `${v}%` : String(v)}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) =>
                    view === "dirac" ? [`${v}%`, "Dir Acc"] :
                    view === "rps"   ? [v, "Avg RPS"] :
                                       [v, "Avg MAE"]
                  }
                />
                <Bar dataKey={view} radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {comparisonData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <LabelList
                    position="top"
                    fontSize={11}
                    formatter={(v: number) => view === "dirac" ? `${v}%` : v}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Ablation table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 pr-4 font-medium">Ablation</th>
                  <th className="text-left py-2 pr-4 font-medium">Removed Features</th>
                  <th className="text-right py-2 pr-4 font-medium">Dir Acc</th>
                  <th className="text-right py-2 pr-4 font-medium">Avg MAE</th>
                  <th className="text-right py-2 pr-4 font-medium">Avg RPS</th>
                  <th className="text-right py-2 font-medium">ΔRPS</th>
                </tr>
              </thead>
              <tbody>
                {ablationData.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="py-2 pr-4 font-medium whitespace-nowrap">{row.label}</td>
                    <td className="py-2 pr-4 text-muted-foreground max-w-[240px]">{row.features_removed}</td>
                    <td className="py-2 pr-4 text-right">{row.dir_acc}/3</td>
                    <td className="py-2 pr-4 text-right">{row.avg_ordinal_mae.toFixed(3)}</td>
                    <td className="py-2 pr-4 text-right">{row.avg_rps.toFixed(3)}</td>
                    <td className="py-2 text-right">
                      <Badge
                        variant="outline"
                        style={{ color: row.color, borderColor: row.color }}
                        className="font-mono text-xs"
                      >
                        {row.delta_rps === 0 ? "±0.000" :
                         row.delta_rps  > 0 ? `+${row.delta_rps.toFixed(3)}` :
                                              row.delta_rps.toFixed(3)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
