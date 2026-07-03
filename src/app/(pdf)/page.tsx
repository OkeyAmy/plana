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
          className="brand-gradient-soft absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ opacity: 0.14 }}
        />
        <div className="relative max-w-[860px] mx-auto px-6 py-24 text-center">
          <span className="pill inline-flex items-center gap-2 mb-6">
            <span className="dot" />
            TestSprite Hackathon S3 · Jul 2026
          </span>

          <h1 className="text-[42px] md:text-[58px] font-extrabold tracking-tight leading-[1.05]">
            Your floor plan,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--brand-gradient)" }}
            >
              built to scale
            </span>
          </h1>

          <p className="mt-6 text-[17px] text-[var(--muted)] max-w-[580px] mx-auto leading-relaxed">
            Describe your room or upload a floor plan image. Plana generates a
            pixel-perfect interactive layout — every piece of furniture placed
            with real centimetre dimensions. Drag, rotate, and get live AI
            feedback.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/fixed"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition hover:opacity-90 cursor-pointer"
              style={{ background: "var(--brand-gradient)" }}
            >
              Start Designing
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="https://github.com/mezberg/ai_home_designer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium surface hover:border-[var(--lilac)] transition text-[var(--ink)] cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-[1100px] mx-auto px-6 py-20 w-full space-y-20">

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section>
          <div className="mb-10">
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
              How it works
            </span>
            <h2 className="text-[28px] font-bold tracking-tight mt-1">
              Three steps to a perfect layout
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <StepCard
              step="01"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              }
              title="Describe or upload"
              body="Attach a floor plan image or type your room dimensions and style. Plana reads door arcs, window lines, and wall lengths from your image."
            />
            <StepCard
              step="02"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              }
              title="AI generates to scale"
              badge="A2UI"
              body="Every piece of furniture placed with real centimetre dimensions. The layout streams live via A2UI generative UI — no guessed sizes, no hallucinated geometry."
            />
            <StepCard
              step="03"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              }
              title="Drag, rotate, refine"
              badge="AG-UI"
              body="Move furniture freely — collision detection prevents overlaps. The agent watches your moves via AG-UI and comments on flow, light, and clearance in real time."
            />
          </div>
        </section>

        {/* ── TestSprite loop ───────────────────────────────────────────── */}
        <section className="surface p-8 md:p-10">
          <div className="mb-6">
            <span className="pill inline-flex items-center gap-2 mb-4">
              <span className="dot" style={{ background: "var(--mint)", boxShadow: "0 0 0 3px var(--mint-soft)" }} />
              TestSprite Loop
            </span>
            <h2 className="text-[24px] font-bold tracking-tight">
              Built with a real verification loop
            </h2>
            <p className="mt-2 text-[14px] text-[var(--muted)] max-w-xl">
              Every feature in Plana was built and verified by the TestSprite CLI — write, test against the live app, fix, repeat.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Write", sub: "agent ships code", color: "var(--lilac)" },
              { label: "Verify", sub: "TestSprite CLI runs", color: "var(--mint)" },
              { label: "Fix", sub: "agent reads failures", color: "var(--orange)" },
              { label: "Verify again", sub: "pass banks, repeat", color: "var(--mint)" },
            ].map((step, i) => (
              <div key={i} className="surface-soft p-4 rounded-xl">
                <div
                  className="w-2 h-2 rounded-full mb-3"
                  style={{ background: step.color }}
                />
                <div className="text-[15px] font-semibold text-[var(--ink)]">{step.label}</div>
                <div className="text-[12px] text-[var(--muted)] mt-0.5">{step.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature highlights ───────────────────────────────────────── */}
        <section>
          <div className="mb-8">
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
              Features
            </span>
            <h2 className="text-[28px] font-bold tracking-tight mt-1">
              What Plana does
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              }
              title="Collision detection"
              body="Furniture pieces cannot overlap or block door swing zones. Collidable flag lets rugs and plants layer underneath."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              }
              title="Rotate with one click"
              body="Hit the rotate button on any piece. Effective width and depth update instantly — the agent knows the new dimensions."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              }
              title="Shopping suggestions"
              body="Once your layout is ready, get style-matched product links for every piece via Linkup structured web search."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              }
              title="Any room, any furniture"
              body="From bedrooms to kitchens, aquariums to pianos. The AI names, sizes, and colours any item you describe with a custom hex."
            />
          </div>
        </section>

        {/* ── Tech stack ───────────────────────────────────────────────── */}
        <footer className="border-t border-[var(--line)] pt-10">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {[
              "Next.js 16",
              "LangGraph",
              "A2UI v0.9",
              "AG-UI",
              "Gemini Flash",
              "CopilotKit",
              "TestSprite CLI",
            ].map((label) => (
              <span
                key={label}
                className="pill inline-flex items-center text-[var(--muted)]"
              >
                {label}
              </span>
            ))}
          </div>
          <p className="text-center text-[12px] text-[var(--muted-2)]">
            Built for TestSprite Hackathon Season 3 · Jul 2026
          </p>
        </footer>

      </main>
    </>
  );
}

function StepCard({
  step,
  icon,
  title,
  body,
  badge,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <div className="surface p-6 relative overflow-hidden group hover:border-[var(--lilac)] transition-colors">
      <div className="absolute -top-16 -right-16 w-[180px] h-[180px] rounded-full brand-gradient-soft opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
            {step}
          </span>
          {badge && (
            <span className="pill inline-flex items-center gap-1.5 text-[10px]">
              <span className="dot" />
              {badge}
            </span>
          )}
        </div>
        <div className="text-[var(--lilac)] mb-4">{icon}</div>
        <h3 className="text-[16px] font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h3>
        <p className="mt-2 text-[13px] text-[var(--muted)] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="surface p-5 flex gap-4 hover:border-[var(--lilac)] transition-colors">
      <div className="flex-none w-8 h-8 rounded-lg bg-[var(--lilac-softer)] flex items-center justify-center text-[var(--lilac)] border border-[var(--lilac-soft)]">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h3>
        <p className="mt-1 text-[13px] text-[var(--muted)] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
