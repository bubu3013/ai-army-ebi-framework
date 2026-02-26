"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UploadCloud, Eye, EyeOff, FileText, AlertCircle } from "lucide-react"
import { MODELS, VERSIONS, CATEGORY_COLORS } from "@/lib/health-types"
import type { ModelId, PromptVersion, SalesCategory } from "@/lib/health-types"
import type { PredictionResult } from "@/lib/health-llm"

// CSV template fields
const CSV_TEMPLATE = `month,avg_temp_taipei,epidemic_index,gt_flu,gt_cold,gt_immunity,gt_competitor_total,has_bundle_promo,bundle_discount_rate,bundle_start_date,bundle_duration_days,has_bulk_promo,bulk_discount_rate,season_event_tag,historical_m1_month,historical_m1_qty,historical_m2_month,historical_m2_qty,historical_m3_month,historical_m3_qty
2025-11,18.5,45.2,62,55,48,120,true,0.30,2025-11-05,14,false,0,,2025-08,668,2025-09,316,2025-10,904`

function CategoryBadge({ cat }: { cat: SalesCategory }) {
  const color = CATEGORY_COLORS[cat]
  return (
    <Badge variant="outline" style={{ color, borderColor: color }} className="font-semibold">
      {cat}
    </Badge>
  )
}

function ProbBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function UploadPage() {
  const [model,   setModel]   = useState<ModelId>("gpt-4o")
  const [version, setVersion] = useState<PromptVersion>("vB")

  const [openaiKey,    setOpenaiKey]    = useState("")
  const [anthropicKey, setAnthropicKey] = useState("")
  const [showKeys,     setShowKeys]     = useState(false)

  const [file,    setFile]    = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [result,  setResult]  = useState<PredictionResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const needsOpenAI    = model === "gpt-4o" || model === "mini"
  const needsAnthropic = model === "haiku"
  const apiKeyMissing  = (needsOpenAI && !openaiKey.trim()) || (needsAnthropic && !anthropicKey.trim())

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = "health_food_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePredict = async () => {
    if (!file) { setError("Please select a CSV file."); return }
    if (apiKeyMissing) { setError("Please enter the required API key."); return }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const text = await file.text()
      const lines = text.trim().split("\n")
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.")

      const headers = lines[0].split(",").map(h => h.trim())
      const values  = lines[1].split(",").map(v => v.trim())
      const row: Record<string, string> = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]))

      // Parse historical sales
      const historical_sales = []
      for (let i = 1; i <= 7; i++) {
        const m = row[`historical_m${i}_month`]
        const q = row[`historical_m${i}_qty`]
        if (m && q) historical_sales.push({ month: m, qty: parseInt(q) })
      }

      const features = {
        month:                  row.month,
        avg_temp_taipei:        parseFloat(row.avg_temp_taipei),
        epidemic_index:         parseFloat(row.epidemic_index),
        gt_flu:                 parseInt(row.gt_flu),
        gt_cold:                parseInt(row.gt_cold),
        gt_immunity:            parseInt(row.gt_immunity),
        gt_competitor_total:    parseFloat(row.gt_competitor_total),
        has_bundle_promo:       row.has_bundle_promo?.toLowerCase() === "true",
        bundle_discount_rate:   parseFloat(row.bundle_discount_rate) || 0,
        bundle_start_date:      row.bundle_start_date || "",
        bundle_duration_days:   parseInt(row.bundle_duration_days) || 0,
        has_bulk_promo:         row.has_bulk_promo?.toLowerCase() === "true",
        bulk_discount_rate:     parseFloat(row.bulk_discount_rate) || 0,
        season_event_tag:       row.season_event_tag || "",
        historical_sales,
      }

      const res = await fetch("/api/health-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features,
          model,
          version,
          openai_api_key:    needsOpenAI    ? openaiKey.trim()    : undefined,
          anthropic_api_key: needsAnthropic ? anthropicKey.trim() : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Prediction failed")

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">

        {/* Config card */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Upload & Predict</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload a month&apos;s feature CSV and get an instant L/M/H sales prediction.
              Your API key is sent directly to the provider and never stored.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Model + Version */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Model</label>
                <Select value={model} onValueChange={(v) => setModel(v as ModelId)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODELS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Prompt Version</label>
                <Select value={version} onValueChange={(v) => setVersion(v as PromptVersion)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VERSIONS.map(v => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label} — {v.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* API Keys */}
            <div className="space-y-3 p-4 rounded-lg border border-border bg-secondary/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">API Key {needsOpenAI ? "(OpenAI)" : "(Anthropic)"}</p>
                <Button variant="ghost" size="sm" onClick={() => setShowKeys(!showKeys)}>
                  {showKeys
                    ? <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
                    : <><Eye     className="h-4 w-4 mr-1" /> Show</>}
                </Button>
              </div>
              {needsOpenAI && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">OpenAI API Key</label>
                  <Input
                    type={showKeys ? "text" : "password"}
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={e => setOpenaiKey(e.target.value)}
                  />
                </div>
              )}
              {needsAnthropic && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Anthropic API Key</label>
                  <Input
                    type={showKeys ? "text" : "password"}
                    placeholder="sk-ant-..."
                    value={anthropicKey}
                    onChange={e => setAnthropicKey(e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Key is forwarded directly to the provider. Not stored or logged.
              </p>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Feature CSV</label>
                <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
                  <FileText className="h-4 w-4 mr-1" /> Download Template
                </Button>
              </div>
              <Input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {file && (
                <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handlePredict}
              disabled={!file || loading || apiKeyMissing}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Predicting…</>
                : <><UploadCloud className="mr-2 h-4 w-4" /> Get Prediction</>
              }
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/40 bg-destructive/5 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Generating prediction…</span>
          </div>
        )}

        {/* Result */}
        {!loading && result && (
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Prediction Result</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{MODELS.find(m => m.value === model)?.label}</Badge>
                  <Badge variant="outline">{version}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Predicted class */}
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">Predicted Sales Category</p>
                <CategoryBadge cat={result.pred_class} />
              </div>

              {/* Probability bars */}
              <div className="space-y-3">
                <ProbBar label="P(Low)  — ≤ 363 bottles"  value={result.prob_L} color={CATEGORY_COLORS.Low}  />
                <ProbBar label="P(Mid)  — 364–446 bottles" value={result.prob_M} color={CATEGORY_COLORS.Mid}  />
                <ProbBar label="P(High) — ≥ 447 bottles"  value={result.prob_H} color={CATEGORY_COLORS.High} />
              </div>

              {/* CoT reasoning (vB only) */}
              {result.step1_b && (
                <div className="p-4 rounded-lg border border-border bg-secondary/20 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Step 1 Reasoning — Active Purchase Drivers [B]
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.step1_b}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Upload a CSV and click Get Prediction to see results here.
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            AI-Army EBI Framework · Health Food Sales Prediction
          </p>
        </div>
      </footer>
    </div>
  )
}
