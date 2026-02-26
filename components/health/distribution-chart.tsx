"use client"

import {
  Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer,
  Tooltip, LabelList, ReferenceLine, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthResult, GroundTruth } from "@/lib/health-types"
import { CATEGORY_COLORS } from "@/lib/health-types"

interface DistributionChartProps {
  results: MonthResult[]
  groundTruth: GroundTruth | null
}

const MONTH_LABELS: Record<string, string> = {
  "2025-08": "Month 8 (Aug)",
  "2025-09": "Month 9 (Sep)",
  "2025-10": "Month 10 (Oct)",
}

export function DistributionChart({ results, groundTruth }: DistributionChartProps) {
  const months = ["2025-08", "2025-09", "2025-10"]

  const chartData = months.map((month) => {
    const row = results.find(r => r.month === month)
    const gt  = groundTruth?.months.find(m => m.month === month)
    return {
      month: MONTH_LABELS[month] ?? month,
      prob_L: row ? Math.round(row.prob_L * 100) : 0,
      prob_M: row ? Math.round(row.prob_M * 100) : 0,
      prob_H: row ? Math.round(row.prob_H * 100) : 0,
      true_class: gt?.true_class ?? "",
      correct: row?.correct ?? null,
    }
  })

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Probability Distribution per Month</CardTitle>
        <p className="text-sm text-muted-foreground">P(Low) / P(Mid) / P(High) — stacked bars sum to 100%</p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === "prob_L" ? "P(Low)" : name === "prob_M" ? "P(Mid)" : "P(High)"
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "prob_L" ? "Low" : value === "prob_M" ? "Mid" : "High"
                }
              />
              <Bar dataKey="prob_L" stackId="a" fill={CATEGORY_COLORS.Low}  name="prob_L" radius={[0,0,0,0]} maxBarSize={80} />
              <Bar dataKey="prob_M" stackId="a" fill={CATEGORY_COLORS.Mid}  name="prob_M" maxBarSize={80} />
              <Bar dataKey="prob_H" stackId="a" fill={CATEGORY_COLORS.High} name="prob_H" radius={[4,4,0,0]} maxBarSize={80}>
                <LabelList
                  position="top"
                  content={(props: any) => {
                    const { x, y, width, index } = props
                    const d = chartData[index]
                    if (!d) return null
                    const icon = d.correct === 1 ? "✓" : d.correct === 0 ? "✗" : ""
                    const color = d.correct === 1 ? CATEGORY_COLORS.High : CATEGORY_COLORS.Low
                    return (
                      <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={14} fill={color} fontWeight={700}>
                        {icon}
                      </text>
                    )
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Ground truth row */}
        {groundTruth && (
          <div className="flex justify-around mt-2 pt-3 border-t border-border">
            {groundTruth.months.map((m) => (
              <div key={m.month} className="text-center">
                <p className="text-xs text-muted-foreground">{MONTH_LABELS[m.month]}</p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: CATEGORY_COLORS[m.true_class] }}
                >
                  Ground Truth: {m.true_class}
                </p>
                <p className="text-xs text-muted-foreground">{m.true_sales_qty} bottles</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
