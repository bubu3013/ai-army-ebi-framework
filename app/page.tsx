import Link from "next/link"
import { ArrowRight, BarChart3, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 space-y-10">

        {/* Header */}
        <div className="space-y-3 max-w-2xl">
          <Badge variant="outline" className="text-xs tracking-widest">
            AI-ARMY · EBI FRAMEWORK
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight">
            Can LLMs Approximate<br />Collective Behavior?
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Applying analogical reasoning to predict population-level outcomes across
            multiple behavioral domains. Each case study tests a different configuration
            of the <span className="text-foreground font-medium">[A] Context →
            [B] Signal → [C] Outcome</span> framework.
          </p>
        </div>

        {/* Experiment cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">

          {/* Experiment I — Health Food */}
          <Link href="/health" className="group block">
            <Card className="border-border h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">Experiment I</Badge>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                    ✓ New
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <ShoppingBag className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Health Food Sales Prediction</CardTitle>
                </div>
                <CardDescription className="mt-2 leading-relaxed">
                  Environmental context + promotions → monthly sales category (Low/Mid/High).
                  GPT-4o with CoT achieves perfect 3/3 accuracy vs. statistical baselines at 0/3.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ABC pills */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                    [A] Epidemic / Promo
                  </span>
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20">
                    [B] Purchase Intent
                  </span>
                  <span className="px-2 py-1 rounded bg-chart-4/10 text-chart-4 border border-chart-4/20">
                    [C] Sales Qty
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                  {[
                    { label: "Dir. Accuracy ↑", value: "3/3"   },
                    { label: "Avg RPS ↓",        value: "0.267" },
                    { label: "Ordinal MAE ↓",    value: "0.000" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-2xl font-semibold">{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-2">
                    {["GPT-4o", "Haiku", "4o-mini"].map(m => (
                      <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Experiment II — Election */}
          <a
            href="https://ai-army-vis.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Card className="border-border h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">Experiment II</Badge>
                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                    ✓ Published
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">2024 Taiwan Presidential Election</CardTitle>
                </div>
                <CardDescription className="mt-2 leading-relaxed">
                  Demographics + self-reported vote intention → predicted vote distribution.
                  GPT-4o achieves JS-D = 0.0002, outperforming respondents&apos; own stated preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ABC pills */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                    [A] Demographics
                  </span>
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20">
                    [B] Vote Intention
                  </span>
                  <span className="px-2 py-1 rounded bg-chart-4/10 text-chart-4 border border-chart-4/20">
                    [C] Election Result
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                  {[
                    { label: "JS-Divergence ↓", value: "0.0002" },
                    { label: "Winner Accuracy", value: "100%"   },
                    { label: "Models Tested",   value: "3"       },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-2xl font-semibold">{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-2">
                    {["GPT-4", "GPT-4o", "Haiku"].map(m => (
                      <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground max-w-2xl">
          AI-Army Research · NTU · ACL Demo 2026 ·
          Supervised by Prof. Gu ·{" "}
          <em>From Social Surveys to Populations: Can LLMs Approximate Collective Behavior?</em>
        </p>
      </main>
    </div>
  )
}
