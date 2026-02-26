"use client"

import { useState } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import type { MonthResult, GroundTruth, GroundTruthMonth } from "@/lib/health-types"
import { CATEGORY_COLORS } from "@/lib/health-types"

interface ResultsTableProps {
  results: MonthResult[]
  groundTruth: GroundTruth | null
}

const MONTH_LABELS: Record<string, string> = {
  "2025-08": "Aug 2025 (M8)",
  "2025-09": "Sep 2025 (M9)",
  "2025-10": "Oct 2025 (M10)",
}

function CategoryBadge({ cat }: { cat: string }) {
  const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ?? "hsl(var(--muted-foreground))"
  return (
    <Badge variant="outline" style={{ color, borderColor: color }} className="font-semibold text-xs">
      {cat}
    </Badge>
  )
}

function ProbBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{(value * 100).toFixed(0)}%</span>
    </div>
  )
}

export function ResultsTable({ results, groundTruth }: ResultsTableProps) {
  const [selected, setSelected] = useState<MonthResult | null>(null)

  const months = ["2025-08", "2025-09", "2025-10"]
  const rows = months.map(m => results.find(r => r.month === m)).filter(Boolean) as MonthResult[]

  const gtByMonth: Record<string, GroundTruthMonth> = Object.fromEntries(
    (groundTruth?.months ?? []).map(m => [m.month, m])
  )

  return (
    <div>
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Monthly Prediction Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Month</TableHead>
                  <TableHead>True Class</TableHead>
                  <TableHead>P(Low)</TableHead>
                  <TableHead>P(Mid)</TableHead>
                  <TableHead>P(High)</TableHead>
                  <TableHead>Predicted</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Ord MAE</TableHead>
                  <TableHead>RPS</TableHead>
                  <TableHead className="w-[60px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.month} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">{MONTH_LABELS[row.month] ?? row.month}</TableCell>
                    <TableCell><CategoryBadge cat={row.true_class} /></TableCell>
                    <TableCell className="min-w-[120px]"><ProbBar value={row.prob_L} color={CATEGORY_COLORS.Low} /></TableCell>
                    <TableCell className="min-w-[120px]"><ProbBar value={row.prob_M} color={CATEGORY_COLORS.Mid} /></TableCell>
                    <TableCell className="min-w-[120px]"><ProbBar value={row.prob_H} color={CATEGORY_COLORS.High} /></TableCell>
                    <TableCell><CategoryBadge cat={row.pred_class} /></TableCell>
                    <TableCell>
                      <span className={row.correct === 1 ? "text-primary font-semibold" : "text-destructive font-semibold"}>
                        {row.correct === 1 ? "Correct" : "Wrong"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{row.ordinal_mae}</TableCell>
                    <TableCell className="font-mono text-sm">{row.rps.toFixed(4)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelected(row)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length > 0 && (
                  <TableRow className="bg-secondary/30 font-semibold">
                    <TableCell>Average</TableCell>
                    <TableCell /><TableCell /><TableCell /><TableCell /><TableCell />
                    <TableCell>
                      {rows.filter(r => r.correct === 1).length}/{rows.length}
                    </TableCell>
                    <TableCell className="font-mono">
                      {(rows.reduce((s, r) => s + r.ordinal_mae, 0) / rows.length).toFixed(3)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {(rows.reduce((s, r) => s + r.rps, 0) / rows.length).toFixed(4)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg bg-card max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected ? (MONTH_LABELS[selected.month] ?? selected.month) : ""} Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground text-xs mb-1">True Class</p><CategoryBadge cat={selected.true_class} /></div>
                <div><p className="text-muted-foreground text-xs mb-1">Predicted</p><CategoryBadge cat={selected.pred_class} /></div>
                <div><p className="text-muted-foreground text-xs mb-1">P(Low)</p><span className="font-mono">{(selected.prob_L * 100).toFixed(0)}%</span></div>
                <div><p className="text-muted-foreground text-xs mb-1">P(Mid)</p><span className="font-mono">{(selected.prob_M * 100).toFixed(0)}%</span></div>
                <div><p className="text-muted-foreground text-xs mb-1">P(High)</p><span className="font-mono">{(selected.prob_H * 100).toFixed(0)}%</span></div>
                <div><p className="text-muted-foreground text-xs mb-1">RPS</p><span className="font-mono">{selected.rps.toFixed(4)}</span></div>
                <div><p className="text-muted-foreground text-xs mb-1">Ordinal MAE</p><span className="font-mono">{selected.ordinal_mae}</span></div>
                <div><p className="text-muted-foreground text-xs mb-1">Log Score</p><span className="font-mono">{selected.log_score.toFixed(4)}</span></div>
              </div>
              {selected.step1_b && (
                <div className="pt-3 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-1">Step 1 Active Drivers</p>
                  <p>{selected.step1_b}</p>
                </div>
              )}
              {selected.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-1">Notes</p>
                  <p>{selected.notes}</p>
                </div>
              )}
              {gtByMonth[selected.month] && (
                <div className="pt-3 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-1">Ground Truth Context</p>
                  <p>{gtByMonth[selected.month].description}</p>
                  <p className="text-muted-foreground text-xs mt-1">Actual sales: {gtByMonth[selected.month].true_sales_qty} bottles</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
