import Link from "next/link";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        background: "var(--brand-gradient)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      Plana
    </span>
  );
}

export function SiteNav({
  active,
}: {
  active?: "home" | "fixed" | "dynamic" | "catalog";
}) {
  const links: Array<{ href: string; label: string; key: typeof active }> = [
    { href: "/", label: "Home", key: "home" },
    { href: "/fixed", label: "Designer", key: "fixed" },
  ];
  return (
    <header className="shrink-0 border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="max-w-[1480px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={22} />
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-[13.5px] transition ${
                active === l.key
                  ? "bg-[var(--surface-soft)] text-[var(--ink)] border border-[var(--line)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="max-w-[1480px] mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
            {eyebrow}
          </span>
          {meta}
        </div>
        <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight leading-[1.1] text-[var(--ink)]">
          {title}
        </h1>
        <p className="mt-2 text-[var(--muted)] max-w-2xl text-[15px] leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

export function WorkspaceHeader({
  eyebrow,
  title,
  agentId,
  status,
}: {
  eyebrow: string;
  title: string;
  agentId: string;
  status?: React.ReactNode;
}) {
  return (
    <div className="shrink-0 border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="max-w-[1480px] mx-auto px-5 py-3 flex items-center gap-4">
        <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
          {eyebrow}
        </span>
        <span className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[10.5px] uppercase tracking-[0.12em] mono text-[var(--muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--lilac)]" />
          agent: {agentId}
        </span>
        <div className="ml-auto flex items-center gap-3">{status}</div>
      </div>
    </div>
  );
}
