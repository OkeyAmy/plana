import Link from "next/link";
import { SiteNav } from "@/components/plana/Brand";

export default function Home() {
  return (
    <>
      <SiteNav active="home" />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden border-b border-[var(--line)]">

        {/* Blueprint grid background */}
        <div className="absolute inset-0 blueprint-grid pointer-events-none" />

        {/* Radial glow centre */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(110,231,183,0.07) 0%, rgba(165,180,252,0.05) 40%, transparent 70%)",
          }}
        />

        {/* Corner marks — architectural */}
        <div className="absolute top-7 left-7 w-6 h-6 border-l-2 border-t-2 border-[var(--lilac)] opacity-30" />
        <div className="absolute top-7 right-7 w-6 h-6 border-r-2 border-t-2 border-[var(--lilac)] opacity-30" />
        <div className="absolute bottom-14 left-7 w-6 h-6 border-l-2 border-b-2 border-[var(--lilac)] opacity-30" />
        <div className="absolute bottom-14 right-7 w-6 h-6 border-r-2 border-b-2 border-[var(--lilac)] opacity-30" />

        {/* Scale dimension line — left edge decoration */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-1">
          <div className="w-px h-20 bg-[var(--line)]" />
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-2)] rotate-90 whitespace-nowrap">520 cm</span>
          <div className="w-px h-20 bg-[var(--line)]" />
        </div>

        <div className="relative max-w-[840px] mx-auto px-6 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[10.5px] mono uppercase tracking-[0.12em] text-[var(--muted)]">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--mint)", boxShadow: "0 0 0 3px var(--mint-soft)" }}
            />
            TestSprite Hackathon S3 · Jul 2026
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold tracking-[-0.035em] leading-[0.94]"
            style={{ fontSize: "clamp(48px, 8vw, 84px)" }}
          >
            Design your room
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--brand-gradient)" }}
            >
              down to the centimetre.
            </span>
          </h1>

          <p className="mt-7 text-[17px] text-[var(--muted)] max-w-[520px] mx-auto leading-[1.65]">
            Describe your room or upload a floor plan. Plana generates a
            pixel-perfect interactive layout in seconds — drag furniture around
            and get live AI feedback on flow and clearance.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/fixed"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-semibold text-[#080910] transition-all hover:opacity-90 hover:scale-[1.02] cursor-pointer"
              style={{ background: "var(--brand-gradient)" }}
            >
              Start designing
              <ArrowRight />
            </Link>
            <a
              href="https://github.com/OkeyAmy/plana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-medium border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--lilac)] transition-colors text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <GitHub />
              View source
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex items-center justify-center gap-6 flex-wrap">
            {[
              { val: "Real cm", lbl: "dimensions" },
              { val: "Live", lbl: "AI feedback" },
              { val: "A2UI", lbl: "generative UI" },
              { val: "Drag & drop", lbl: "canvas" },
            ].map((s, i, arr) => (
              <div key={s.lbl} className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-[15px] font-semibold text-[var(--ink)]">{s.val}</div>
                  <div className="text-[11px] text-[var(--muted-2)] mt-0.5">{s.lbl}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-6 bg-[var(--line)]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted-2)]">scroll</span>
          <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, var(--muted-2), transparent)" }} />
        </div>
      </section>


      <main className="max-w-[1140px] mx-auto px-6 py-28 space-y-32">

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section>
          <SectionLabel text="How it works" />

          <div className="mt-10 grid md:grid-cols-3 rounded-2xl overflow-hidden border border-[var(--line)]">
            {[
              {
                n: "01",
                icon: <UploadIcon />,
                title: "Describe or upload",
                body: "Type room dimensions and style, or attach a floor plan image. Plana reads door arcs, window lines, and wall measurements from your photo.",
                accent: null,
              },
              {
                n: "02",
                icon: <LayersIcon />,
                title: "AI generates the layout",
                body: "Every piece of furniture is placed with real centimetre dimensions. The layout streams into the canvas live via A2UI declarative envelopes — no hallucinated sizes.",
                accent: "A2UI",
              },
              {
                n: "03",
                icon: <MoveIcon />,
                title: "Drag, rotate, refine",
                body: "Move furniture freely — collision detection prevents overlaps and door blockage. The agent watches moves via AG-UI and comments on flow and clearance in real time.",
                accent: "AG-UI",
              },
            ].map((step, i) => (
              <div
                key={step.n}
                className={`group relative bg-[var(--bg)] p-8 md:p-10 flex flex-col gap-5 hover:bg-[var(--surface)] transition-colors ${i < 2 ? "md:border-r border-b md:border-b-0 border-[var(--line)]" : ""}`}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(165,180,252,0.05), transparent)" }}
                />

                <div className="flex items-center justify-between">
                  <span className="mono text-[10.5px] text-[var(--muted-2)] uppercase tracking-[0.15em]">{step.n}</span>
                  {step.accent && (
                    <span className="mono text-[9.5px] px-2 py-0.5 rounded-full border border-[var(--lilac-soft)] text-[var(--lilac)] uppercase tracking-[0.1em]">
                      {step.accent}
                    </span>
                  )}
                </div>

                <div className="text-[var(--lilac)] opacity-70 group-hover:opacity-100 transition-opacity">
                  {step.icon}
                </div>

                <div>
                  <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{step.title}</h3>
                  <p className="mt-2 text-[13.5px] text-[var(--muted)] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ── FEATURES BENTO ────────────────────────────────────────────── */}
        <section>
          <SectionLabel text="Features" />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 auto-rows-[220px] gap-3">

            {/* Large — floor plan preview */}
            <div className="md:col-span-2 md:row-span-2 surface rounded-2xl p-7 flex flex-col justify-between group hover:border-[var(--lilac)] transition-colors overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 70% at 50% 100%, rgba(165,180,252,0.05), transparent)" }}
              />
              <div className="relative">
                <BentoLabel color="var(--lilac)" text="Core" />
                <h3 className="mt-3 text-[20px] font-bold tracking-tight text-[var(--ink)]">
                  Pixel-perfect to scale
                </h3>
                <p className="mt-2 text-[13.5px] text-[var(--muted)] max-w-[360px] leading-relaxed">
                  Every furniture piece has real centimetre dimensions. No guessing, no generic stock sizes. The agent places everything precisely from your room measurements.
                </p>
              </div>
              {/* Inline floor plan illustration */}
              <div className="relative mt-4">
                <FloorPlanIllustration />
              </div>
            </div>

            {/* Collision detection */}
            <div className="surface rounded-2xl p-6 flex flex-col justify-between group hover:border-[var(--lilac)] transition-colors">
              <div>
                <FeatureIcon color="var(--lilac)" bg="var(--lilac-softer)" border="var(--lilac-soft)">
                  <ShieldIcon />
                </FeatureIcon>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-[var(--ink)]">Collision detection</h3>
                <p className="mt-1.5 text-[12.5px] text-[var(--muted)] leading-relaxed">
                  Pieces can&rsquo;t overlap or block door arcs. Rugs layer underneath collidable furniture.
                </p>
              </div>
              <Overline text="Real-time" />
            </div>

            {/* Rotate */}
            <div className="surface rounded-2xl p-6 flex flex-col justify-between group hover:border-[var(--mint)] transition-colors">
              <div>
                <FeatureIcon color="var(--mint)" bg="var(--mint-soft)" border="var(--mint)44">
                  <RotateIcon />
                </FeatureIcon>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-[var(--ink)]">One-click rotate</h3>
                <p className="mt-1.5 text-[12.5px] text-[var(--muted)] leading-relaxed">
                  Hit rotate. Dimensions update instantly — the agent tracks the new footprint automatically.
                </p>
              </div>
              <Overline text="90° increments" />
            </div>

            {/* Any furniture */}
            <div className="surface rounded-2xl p-6 flex flex-col justify-between group hover:border-[var(--orange)] transition-colors">
              <div>
                <FeatureIcon color="var(--orange)" bg="var(--orange-soft)" border="var(--orange)44">
                  <SparkleIcon />
                </FeatureIcon>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-[var(--ink)]">Any room, any furniture</h3>
                <p className="mt-1.5 text-[12.5px] text-[var(--muted)] leading-relaxed">
                  Pianos, aquariums, custom hex colours. The AI names and sizes whatever you describe.
                </p>
              </div>
              <Overline text="Gemini Flash" />
            </div>

            {/* Shopping */}
            <div className="surface rounded-2xl p-6 flex flex-col justify-between group hover:border-[var(--lilac)] transition-colors">
              <div>
                <FeatureIcon color="var(--lilac)" bg="var(--lilac-softer)" border="var(--lilac-soft)">
                  <CartIcon />
                </FeatureIcon>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-[var(--ink)]">Shopping suggestions</h3>
                <p className="mt-1.5 text-[12.5px] text-[var(--muted)] leading-relaxed">
                  Style-matched buy links for every piece once your layout is finalised.
                </p>
              </div>
              <Overline text="Powered by Linkup" />
            </div>

          </div>
        </section>


        {/* ── TESTSPRITE LOOP ───────────────────────────────────────────── */}
        <section>
          <SectionLabel text="The loop" />

          <div className="mt-10 border border-[var(--line)] bg-[var(--surface)] rounded-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-[var(--line)]">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--lilac)] mb-3">
                TestSprite CLI · Season 3
              </div>
              <h2 className="text-[22px] font-bold tracking-tight text-[var(--ink)]">
                Built with a real verification loop
              </h2>
              <p className="mt-2 text-[14px] text-[var(--muted)] max-w-[500px]">
                Every Plana feature was written, tested against the live app, fixed, and re-verified. No hallucinated progress — the CLI caught every regression.
              </p>
            </div>

            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Write", sub: "Agent ships code", dot: "var(--lilac)" },
                { label: "Verify", sub: "CLI runs real tests", dot: "var(--mint)" },
                { label: "Fix", sub: "Agent reads failures", dot: "var(--orange)" },
                { label: "Verify again", sub: "Pass banks. Repeat.", dot: "var(--mint)" },
              ].map((step, i, arr) => (
                <div key={i} className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="flex-1 bg-[var(--bg)] border border-[var(--line)] rounded-xl p-4">
                    <div
                      className="w-2 h-2 rounded-full mb-3"
                      style={{ background: step.dot }}
                    />
                    <div className="text-[14px] font-semibold text-[var(--ink)]">{step.label}</div>
                    <div className="text-[11.5px] text-[var(--muted)] mt-0.5">{step.sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:block text-[var(--muted-2)]">
                      <ChevronRight />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="border-t border-[var(--line)] pt-10">
          <div className="flex flex-wrap gap-2 mb-8">
            {["Next.js 16", "LangGraph", "A2UI v0.9", "AG-UI", "Gemini Flash", "CopilotKit", "TestSprite CLI", "Linkup", "FastAPI"].map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full border border-[var(--line)] bg-[var(--surface)] mono text-[11px] text-[var(--muted)]"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-[12px] text-[var(--muted-2)]">
              TestSprite Hackathon Season 3 · CLI Launch &amp; Loop Engineering · Jul 2026
            </p>
            <span
              className="text-[16px] font-extrabold tracking-[-0.04em]"
              style={{
                background: "var(--brand-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Plana
            </span>
          </div>
        </footer>

      </main>
    </>
  );
}


/* ─── Small layout helpers ─────────────────────────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-2)]">{text}</span>
      <div className="flex-1 h-px bg-[var(--line)]" />
    </div>
  );
}

function BentoLabel({ color, text }: { color: string; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mono text-[10px] uppercase tracking-[0.1em] border"
      style={{ color, borderColor: `${color}44`, background: `${color}14` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {text}
    </span>
  );
}

function Overline({ text }: { text: string }) {
  return (
    <span className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-2)]">{text}</span>
  );
}

function FeatureIcon({
  color, bg, border, children,
}: {
  color: string; bg: string; border: string; children: React.ReactNode;
}) {
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      {children}
    </div>
  );
}


/* ─── Floor plan illustration (SVG top-down) ───────────────────────────── */
function FloorPlanIllustration() {
  return (
    <svg
      viewBox="0 0 480 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-[140px] opacity-80"
    >
      {/* Room outline */}
      <rect x="20" y="10" width="440" height="180" rx="3" stroke="#1A1C26" strokeWidth="1.5" fill="#0F1117" />

      {/* Wall — thick */}
      <rect x="20" y="10" width="440" height="5" fill="#A5B4FC22" />
      <rect x="20" y="10" width="5" height="180" fill="#A5B4FC22" />
      <rect x="455" y="10" width="5" height="180" fill="#A5B4FC22" />
      <rect x="20" y="185" width="440" height="5" fill="#A5B4FC22" />

      {/* Door arc — bottom left */}
      <path d="M 60 185 A 30 30 0 0 0 90 155" stroke="#A5B4FC44" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="60" y1="185" x2="60" y2="155" stroke="#A5B4FC44" strokeWidth="1" />

      {/* Window — top */}
      <rect x="180" y="10" width="120" height="5" fill="none" stroke="#6EE7B777" strokeWidth="1.5" />
      <line x1="200" y1="12" x2="280" y2="12" stroke="#6EE7B7" strokeWidth="1" strokeOpacity="0.4" />

      {/* BED */}
      <rect x="320" y="30" width="110" height="80" rx="4" fill="#1A1C30" stroke="#A5B4FC33" strokeWidth="1" />
      <rect x="320" y="30" width="110" height="22" rx="3" fill="#A5B4FC22" />
      {/* pillow */}
      <rect x="330" y="34" width="40" height="14" rx="2" fill="#A5B4FC33" />
      <rect x="378" y="34" width="40" height="14" rx="2" fill="#A5B4FC33" />
      {/* label */}
      <text x="375" y="82" fill="#A5B4FC" fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.6">BED 200cm</text>

      {/* WARDROBE */}
      <rect x="38" y="30" width="50" height="100" rx="3" fill="#141720" stroke="#6EE7B744" strokeWidth="1" />
      <line x1="63" y1="30" x2="63" y2="130" stroke="#6EE7B733" strokeWidth="0.5" />
      <text x="63" y="86" fill="#6EE7B7" fontSize="8" textAnchor="middle" fontFamily="monospace" opacity="0.5">WRD</text>

      {/* DESK */}
      <rect x="110" y="30" width="90" height="44" rx="3" fill="#141720" stroke="#FCA97A44" strokeWidth="1" />
      <rect x="118" y="36" width="30" height="20" rx="2" fill="#FCA97A22" />
      <text x="155" y="58" fill="#FCA97A" fontSize="8" textAnchor="middle" fontFamily="monospace" opacity="0.5">DESK</text>

      {/* SOFA */}
      <rect x="110" y="130" width="130" height="46" rx="4" fill="#1A1C26" stroke="#A5B4FC33" strokeWidth="1" />
      <rect x="110" y="130" width="130" height="15" rx="3" fill="#A5B4FC1A" />
      <rect x="110" y="130" width="14" height="46" rx="3" fill="#A5B4FC1A" />
      <rect x="226" y="130" width="14" height="46" rx="3" fill="#A5B4FC1A" />
      <text x="175" y="160" fill="#A5B4FC" fontSize="8" textAnchor="middle" fontFamily="monospace" opacity="0.5">SOFA</text>

      {/* RUG (non-collidable, dashed) */}
      <rect x="100" y="118" width="160" height="72" rx="6" stroke="#6EE7B733" strokeWidth="1" strokeDasharray="4 3" fill="none" />

      {/* Dimension line — width */}
      <line x1="20" y1="200" x2="460" y2="200" stroke="#A5B4FC22" strokeWidth="0.5" />
      <text x="240" y="210" fill="#5F6072" fontSize="8" textAnchor="middle" fontFamily="monospace">520 cm</text>

      {/* Dimension line — height */}
      <line x1="468" y1="10" x2="468" y2="190" stroke="#A5B4FC22" strokeWidth="0.5" />
      <text x="476" y="104" fill="#5F6072" fontSize="8" textAnchor="middle" fontFamily="monospace" transform="rotate(90,476,104)">430 cm</text>
    </svg>
  );
}


/* ─── SVG icon components ──────────────────────────────────────────────── */
const iconProps = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

function UploadIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...{ ...iconProps, width: 18, height: 18 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg {...{ ...iconProps, width: 18, height: 18 }}>
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 .49-3" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg {...{ ...iconProps, width: 18, height: 18 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg {...{ ...iconProps, width: 18, height: 18 }}>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GitHub() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
