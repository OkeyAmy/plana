import Link from "next/link";
import { SiteNav } from "@/components/pdf-analyst/Brand";

export default function Home() {
  return (
    <>
      <SiteNav active="home" />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div
          className="brand-gradient-soft absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ opacity: 0.18 }}
        />
        <div className="relative max-w-[860px] mx-auto px-6 py-20 text-center">
          <span className="pill inline-flex items-center gap-2 mb-6">
            <span className="dot" />
            AI Home Designer · A2UI + AG-UI
          </span>

          <h1 className="text-[40px] md:text-[54px] font-bold tracking-tight leading-[1.1]">
            Tired of image generators{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--brand-gradient)" }}
            >
              screwing up your flat dimensions?
            </span>
          </h1>

          <p className="mt-6 text-[17px] text-[var(--muted)] max-w-[600px] mx-auto leading-relaxed">
            Upload your floor plan or describe your room in text. Get a
            pixel-perfect, to-scale interactive layout generated on the fly —
            then drag furniture around and receive live AI suggestions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/fixed"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition hover:opacity-90"
              style={{ background: "var(--brand-gradient)" }}
            >
              Design Your Room →
            </Link>
            <Link
              href="/fixed"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium surface hover:border-[var(--lilac)] transition text-[var(--ink)]"
            >
              Upload a Floor Plan 📐
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-[1120px] mx-auto px-6 py-16 w-full space-y-16">

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section>
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
            How it works
          </span>
          <h2 className="text-[26px] font-semibold tracking-tight mt-1 mb-8">
            Three steps to a perfect layout
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            <StepCard
              step="01"
              emoji="📸"
              title="Upload a floor plan and describe your room"
              body="Attach a floor plan image and type your preferences. The AI reads architectural symbols — door arcs, window lines, wall dimensions."
            />
            <StepCard
              step="02"
              emoji="🏠"
              title="Perfect dimensions, instantly"
              badge="A2UI"
              body="Every piece of furniture is placed with real centimetre dimensions. The layout streams in via A2UI generative UI — no hallucinated sizes, no guessing."
            />
            <StepCard
              step="03"
              emoji="💬"
              title="Drag, rearrange, get feedback"
              badge="AG-UI"
              body="Move furniture around the canvas. The agent watches and comments on flow, natural light, and clearance — powered by AG-UI real-time communication."
            />
          </div>
        </section>


        {/* ── Feature highlights ───────────────────────────────────────── */}
        <section className="grid md:grid-cols-2 gap-5">
          <FeatureCard
            emoji="🔄"
            title="Rotate with a tap"
            body="Hit ↻ on any piece to rotate 90°. Dimensions update live — the agent knows effective width and depth after rotation."
          />
          <FeatureCard
            emoji="🎨"
            title="Any room, any furniture"
            body="From kitchens with cookers and fridges to bathrooms with bathtubs. The AI names, sizes and colours any item you describe."
          />
        </section>

        {/* ── Shopping suggestions ─────────────────────────────────────── */}
        <section>
          <div className="surface p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">🛍️</div>
            <div>
              <h3 className="text-[20px] font-semibold tracking-tight">
                Find where to buy every piece
              </h3>
              <p className="mt-1 text-[var(--muted)] text-[14px]">
                Once your layout is ready, get style-matched product suggestions with buy links.
                The agent recommends items that fit your room, your aesthetic, and your budget.
              </p>
            </div>
          </div>
        </section>

        {/* ── Tech stack footer ────────────────────────────────────────── */}
        <footer className="border-t border-[var(--line)] pt-8 flex flex-wrap gap-3 items-center justify-center">
          {["⚡ A2UI v0.9", "🔗 AG-UI", "🤖 CopilotKit", "✨ Gemini 3.5 Flash", "🐍 LangGraph", "⚛️ Next.js 16"].map((label) => (
            <span key={label} className="pill inline-flex items-center gap-1.5 text-[var(--muted)]">
              {label}
            </span>
          ))}
        </footer>

      </main>
    </>
  );
}

function StepCard({ step, emoji, title, body, badge }: {
  step: string; emoji: string; title: string; body: string; badge?: string;
}) {
  return (
    <div className="surface p-6 relative overflow-hidden group hover:border-[var(--lilac)] transition">
      <div className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full brand-gradient-soft opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)]">{step}</span>
          {badge && (
            <span className="pill inline-flex items-center gap-1.5">
              <span className="dot" />
              {badge}
            </span>
          )}
        </div>
        <div className="text-4xl mb-4">{emoji}</div>
        <h3 className="text-[18px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-[14px] text-[var(--muted)] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function FeatureCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="surface p-6 flex gap-4">
      <div className="text-3xl flex-none">{emoji}</div>
      <div>
        <h3 className="text-[16px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[14px] text-[var(--muted)] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
