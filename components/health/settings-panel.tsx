"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { MODELS, VERSIONS } from "@/lib/health-types"
import type { ModelId, PromptVersion } from "@/lib/health-types"
import { Cpu, GitBranch } from "lucide-react"

interface SettingsPanelProps {
  model: ModelId
  version: PromptVersion
  onModelChange: (m: ModelId) => void
  onVersionChange: (v: PromptVersion) => void
}

export function SettingsPanel({ model, version, onModelChange, onVersionChange }: SettingsPanelProps) {
  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Model selector */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Cpu className="h-4 w-4" />
              Inference Model
            </div>
            <Select value={model} onValueChange={(v) => onModelChange(v as ModelId)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                      {m.label}
                      <span className="text-xs text-muted-foreground font-normal">
                        {m.fullName}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Version selector */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              Prompt Version
            </div>
            <Select value={version} onValueChange={(v) => onVersionChange(v as PromptVersion)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {VERSIONS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    <div className="flex items-center gap-2">
                      {v.label}
                      <span className="text-xs text-muted-foreground font-normal">
                        — {v.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
