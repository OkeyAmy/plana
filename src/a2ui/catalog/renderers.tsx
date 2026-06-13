"use client";

import { clsx } from "clsx";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Rnd } from "react-rnd";
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart as RScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RendererProps } from "@copilotkit/a2ui-renderer";

/* The runtime walks `{path}` bindings against the data model before
 * handing props to renderers, so every prop value below is post-resolution. */

const GAP = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-10",
};
const JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  spaceBetween: "justify-between",
};
const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

/* CopilotKit brand-accent palette in fixed legend order. */
const CHART_PALETTE = ["#7c70f5", "#3aa37f", "#e89232", "#d5b62c", "#d54b53"];

const fmtNumber = (n: number) =>
  Math.abs(n) >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : Math.abs(n) >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : n.toLocaleString();

/* A delta value is "meaningful" if it has a digit. Bare "+" / "-" or empty
 * strings shouldn't render a badge; that just produces an empty pill. */
const hasMeaningfulDelta = (v?: string) =>
  typeof v === "string" && /\d/.test(v);

/* Reduce verbose delta strings to the badge's job: just the magnitude.
 * Agents sometimes dump comparison prose like "vs. $89,498M in Q4 FY23"
 * into delta when asked about quarterly comparisons. The badge can't hold
 * that without breaking the card layout, so we extract the first signed
 * number/percent token and let the surrounding context (StatCard caption,
 * table cell) carry the comparison text instead. */
const condenseDelta = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.length <= 8) return trimmed;
  const patterns = [
    /[+-]\s*\d+(?:[.,]\d+)?\s*%/,
    /\d+(?:[.,]\d+)?\s*%/,
    /[+-]\s*\$?\d+(?:[.,]\d+)?\s*[KMB]?/i,
    /\$?\d+(?:[.,]\d+)?\s*[KMB]?/i,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[0].replace(/\s+/g, "");
  }
  return trimmed;
};

/* Pull the first number from a free-form string. Handles $X, X.XM, etc.
 * Returns the number's magnitude (sign + numeric value), preserving the
 * order-of-magnitude suffix (k/M/B) when present. */
const parseMoneyish = (s: string): number | null => {
  if (typeof s !== "string") return null;
  const m = s.replace(/[,_]/g, "").match(/(-?\d+(?:\.\d+)?)\s*([kKmMbB]?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return null;
  const suffix = (m[2] || "").toLowerCase();
  const mult =
    suffix === "k"
      ? 1_000
      : suffix === "m"
        ? 1_000_000
        : suffix === "b"
          ? 1_000_000_000
          : 1;
  return n * mult;
};

/* When the agent leaves `delta` empty but caption carries a prior-period
 * value like "vs. $89,498M in Q4 FY23", compute the percentage from
 * value vs. that prior number so the user still sees the badge they
 * asked for. Returns a string like "+6.1%" / "-3.0%" or null when we
 * can't extract two comparable numbers. Loose by design: this is a
 * fallback for noisy prompts; the agent should provide its own delta. */
const autoDelta = (value?: string, caption?: string): string | null => {
  if (!value || !caption) return null;
  // Caption needs to look like a comparison. Anchor on "vs.", "from",
  // "compared", "prior", or a leading "$" right after the verb.
  if (!/vs\.|from|compared|prior|previous|last|relative to/i.test(caption)) {
    return null;
  }
  const current = parseMoneyish(value);
  const prior = parseMoneyish(caption);
  if (current == null || prior == null || prior === 0) return null;
  const pct = ((current - prior) / Math.abs(prior)) * 100;
  if (!isFinite(pct)) return null;
  const sign = pct >= 0 ? "+" : "";
  // 1 decimal for sub-10% movements, integer otherwise: easier to scan.
  return `${sign}${Math.abs(pct) < 10 ? pct.toFixed(1) : pct.toFixed(0)}%`;
};

const Stack = ({
  props,
  children,
}: RendererProps<{
  children: string[] | { componentId: string; path: string };
  gap?: keyof typeof GAP;
  align?: keyof typeof ALIGN;
}>) => (
  <div
    className={clsx(
      "flex flex-col",
      GAP[props.gap ?? "md"],
      props.align && ALIGN[props.align],
    )}
  >
    {Array.isArray(props.children)
      ? props.children.map((id) => <Slot key={id} render={children(id)} />)
      : null}
  </div>
);

const Row = ({
  props,
  children,
}: RendererProps<{
  children: string[];
  gap?: keyof typeof GAP;
  justify?: keyof typeof JUSTIFY;
  align?: keyof typeof ALIGN;
}>) => (
  <div
    className={clsx(
      "flex flex-wrap",
      GAP[props.gap ?? "sm"],
      props.justify && JUSTIFY[props.justify],
      ALIGN[props.align ?? "center"],
    )}
  >
    {Array.isArray(props.children)
      ? props.children.map((id) => <Slot key={id} render={children(id)} />)
      : null}
  </div>
);

const Grid = ({
  props,
  children,
}: RendererProps<{
  children: string[];
  columns?: number;
  gap?: keyof typeof GAP;
}>) => {
  const cols = props.columns ?? 3;
  const colMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-2 lg:grid-cols-6",
  };
  return (
    <div className={clsx("grid", colMap[cols], GAP[props.gap ?? "md"])}>
      {Array.isArray(props.children)
        ? props.children.map((id) => <Slot key={id} render={children(id)} />)
        : null}
    </div>
  );
};

const Section = ({
  props,
  children,
}: RendererProps<{ title: string; eyebrow?: string; child: string }>) => (
  <section className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      {props.eyebrow && (
        <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] font-medium">
          {props.eyebrow}
        </span>
      )}
      <h2 className="text-[18px] font-semibold tracking-tight text-[var(--ink)]">
        {props.title}
      </h2>
    </div>
    {children(props.child)}
  </section>
);

const Card = ({
  props,
  children,
}: RendererProps<{
  child: string;
  tone?: "default" | "lilac" | "mint" | "warning";
}>) => {
  const tones: Record<string, string> = {
    default: "bg-[var(--surface)] border-[var(--line)]",
    lilac:
      "bg-[color-mix(in_oklab,var(--lilac)_8%,white)] border-[var(--lilac)]",
    mint: "bg-[color-mix(in_oklab,var(--mint)_10%,white)] border-[color-mix(in_oklab,var(--mint)_60%,white)]",
    warning:
      "bg-[color-mix(in_oklab,var(--orange)_8%,white)] border-[color-mix(in_oklab,var(--orange)_50%,white)]",
  };
  return (
    <div
      className={clsx(
        "rounded-[var(--radius)] border p-5",
        tones[props.tone ?? "default"],
      )}
    >
      {children(props.child)}
    </div>
  );
};

const Divider = () => <hr className="border-0 border-t border-[var(--line)]" />;

const Heading = ({
  props,
}: RendererProps<{ text: string; level?: "1" | "2" | "3" }>) => {
  const level = props.level ?? "2";
  const Tag = level === "1" ? "h1" : level === "3" ? "h3" : "h2";
  const sizes = {
    "1": "text-[30px] font-semibold tracking-tight leading-[1.1]",
    "2": "text-[20px] font-semibold tracking-tight leading-[1.2]",
    "3": "text-[15px] font-semibold leading-tight",
  } as const;
  return (
    <Tag className={clsx(sizes[level], "text-[var(--ink)]")}>{props.text}</Tag>
  );
};

const Text = ({
  props,
}: RendererProps<{
  text: string;
  tone?: "default" | "muted";
  size?: "sm" | "md" | "lg";
  weight?: "regular" | "medium" | "semibold";
}>) => (
  <p
    className={clsx(
      props.size === "sm"
        ? "text-[13px]"
        : props.size === "lg"
          ? "text-[16px]"
          : "text-[14px]",
      props.tone === "muted" ? "text-[var(--ink)]" : "text-[var(--ink-2)]",
      props.weight === "medium"
        ? "font-medium"
        : props.weight === "semibold"
          ? "font-semibold"
          : "font-normal",
      "leading-relaxed",
    )}
  >
    {props.text}
  </p>
);

const Overline = ({ props }: RendererProps<{ text: string }>) => (
  <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] font-medium">
    {props.text}
  </span>
);

const Badge = ({
  props,
}: RendererProps<{
  label: string;
  tone?: "neutral" | "positive" | "warning" | "danger" | "info";
}>) => {
  const tones = {
    neutral:
      "bg-[var(--surface-soft)] text-[var(--ink-2)] border-[var(--line)]",
    info: "bg-[color-mix(in_oklab,var(--lilac)_18%,white)] text-[#2e2c75] border-[color-mix(in_oklab,var(--lilac)_60%,white)]",
    positive:
      "bg-[color-mix(in_oklab,var(--mint)_18%,white)] text-[#0a5d44] border-[color-mix(in_oklab,var(--mint)_70%,white)]",
    warning:
      "bg-[color-mix(in_oklab,var(--orange)_18%,white)] text-[#7a3f0f] border-[color-mix(in_oklab,var(--orange)_60%,white)]",
    danger:
      "bg-[color-mix(in_oklab,var(--red)_12%,white)] text-[#7a1b22] border-[color-mix(in_oklab,var(--red)_55%,white)]",
  } as const;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] mono uppercase tracking-wider font-medium",
        tones[props.tone ?? "neutral"],
      )}
    >
      {props.label}
    </span>
  );
};

const Callout = ({
  props,
}: RendererProps<{
  body: string;
  title?: string;
  tone?: "info" | "positive" | "warning" | "neutral";
}>) => {
  const tone = props.tone ?? "info";
  const accents: Record<
    typeof tone,
    { bar: string; bg: string; chip: string }
  > = {
    info: {
      bar: "bg-[var(--lilac)]",
      bg: "bg-[color-mix(in_oklab,var(--lilac)_7%,var(--surface))]",
      chip: "text-[#2e2c75]",
    },
    positive: {
      bar: "bg-[var(--mint)]",
      bg: "bg-[color-mix(in_oklab,var(--mint)_8%,var(--surface))]",
      chip: "text-[#0a5d44]",
    },
    warning: {
      bar: "bg-[var(--orange)]",
      bg: "bg-[color-mix(in_oklab,var(--orange)_8%,var(--surface))]",
      chip: "text-[#7a3f0f]",
    },
    neutral: {
      bar: "bg-[var(--ink-2)]",
      bg: "bg-[var(--surface-soft)]",
      chip: "text-[var(--ink)]",
    },
  };
  const a = accents[tone];
  return (
    <div
      className={clsx(
        "relative rounded-[var(--radius)] border border-[var(--line)] pl-4 pr-5 py-4 flex flex-col gap-1.5 overflow-hidden",
        a.bg,
      )}
    >
      <span
        aria-hidden
        className={clsx("absolute left-0 top-0 bottom-0 w-1", a.bar)}
      />
      {props.title && (
        <span
          className={clsx(
            "mono text-[10.5px] uppercase tracking-[0.14em] font-medium",
            a.chip,
          )}
        >
          {props.title}
        </span>
      )}
      <span className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
        {props.body}
      </span>
    </div>
  );
};

const BulletList = ({
  props,
}: RendererProps<{
  items: string[];
  ordered?: boolean;
}>) => {
  const items = Array.isArray(props.items) ? props.items : [];
  if (!items.length) return null;
  const Tag = props.ordered ? "ol" : "ul";
  // We render markers manually inside each <li>. `display: flex` on the
  // li (which we want for clean alignment) kills the browser's native
  // `list-decimal` / `list-disc` rendering, so for ordered lists we
  // synthesize the "1." / "2." prefix ourselves.
  return (
    <Tag className="flex flex-col gap-2 text-[14px] text-[var(--ink-2)] leading-relaxed list-none pl-0 m-0">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5">
          {props.ordered ? (
            <span
              aria-hidden
              className="mono tabular-nums text-[12px] text-[var(--ink)] font-medium leading-relaxed min-w-[1.25rem] flex-none"
            >
              {i + 1}.
            </span>
          ) : (
            <span
              aria-hidden
              className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--lilac)] flex-none"
            />
          )}
          <span className="flex-1 min-w-0">{it}</span>
        </li>
      ))}
    </Tag>
  );
};

const StatCard = ({
  props,
}: RendererProps<{
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  caption?: string;
}>) => {
  // Prefer the agent's delta. Fall back to auto-computing from value vs.
  // the prior number in caption when the agent left delta blank.
  const explicitDelta = hasMeaningfulDelta(props.delta)
    ? condenseDelta(props.delta!)
    : null;
  const computedDelta = explicitDelta
    ? null
    : autoDelta(props.value, props.caption);
  const finalDelta = explicitDelta ?? computedDelta;

  // Derive tone from the sign of the computed delta when the agent
  // didn't set deltaTone (or set it incorrectly relative to the actual
  // movement). For explicit deltas, trust the agent's tone choice.
  const inferredTone: "positive" | "negative" | "neutral" =
    computedDelta?.startsWith("-")
      ? "negative"
      : computedDelta?.startsWith("+")
        ? "positive"
        : (props.deltaTone ?? "neutral");
  const effectiveTone = explicitDelta
    ? (props.deltaTone ?? "neutral")
    : inferredTone;

  const deltaClass =
    effectiveTone === "positive"
      ? "text-[#0a5d44] bg-[color-mix(in_oklab,var(--mint)_22%,white)] border-[color-mix(in_oklab,var(--mint)_60%,white)]"
      : effectiveTone === "negative"
        ? "text-[#7a1b22] bg-[color-mix(in_oklab,var(--red)_15%,white)] border-[color-mix(in_oklab,var(--red)_45%,white)]"
        : "text-[var(--ink-2)] bg-[var(--surface-soft)] border-[var(--line)]";

  const arrow =
    effectiveTone === "positive"
      ? "↑"
      : effectiveTone === "negative"
        ? "↓"
        : "→";

  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-5 flex flex-col gap-2.5">
      <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink)] font-medium">
        {props.label}
      </span>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <span className="text-[28px] font-semibold tracking-tight text-[var(--ink)] leading-none tabular-nums">
          {props.value}
        </span>
        {finalDelta && (
          <span
            className={clsx(
              "mono text-[11px] px-1.5 py-0.5 rounded-md border font-medium tabular-nums inline-flex items-center gap-1",
              deltaClass,
            )}
          >
            <span aria-hidden>{arrow}</span>
            {finalDelta}
          </span>
        )}
      </div>
      {props.caption && (
        <span className="text-[12px] text-[var(--ink)] leading-snug">
          {props.caption}
        </span>
      )}
    </div>
  );
};

type Series = { label: string; value: number }[];

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
  color: "var(--ink)",
  boxShadow: "0 4px 12px -2px rgba(10, 10, 15, 0.08)",
};

/* Per-item text inside the tooltip. Recharts otherwise inherits the
 * series fill color (light lilac for our charts), which renders as
 * washed-out text. Force a saturated dark purple so the numbers stay
 * readable and on-brand. */
const tooltipItemStyle = {
  color: "#3b3a8a",
  fontSize: 12,
  fontWeight: 500,
};
const tooltipLabelStyle = {
  color: "var(--ink)",
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 2,
};

const axisTickStyle = {
  fontSize: 11,
  fill: "var(--ink)",
  fontWeight: 500,
};

/* If long or many x-axis labels would collide, rotate them and let
 * recharts auto-skip overlapping ones. The threshold is conservative:
 * any label over 6 chars OR more than 6 data points → angle. */
function xAxisProps(data: Series) {
  const maxLen = data.reduce((m, d) => Math.max(m, (d.label ?? "").length), 0);
  const tilt = maxLen > 6 || data.length > 6;
  return {
    angle: tilt ? -28 : 0,
    height: tilt ? 56 : 24,
    textAnchor: tilt ? ("end" as const) : ("middle" as const),
    interval: "preserveStartEnd" as const,
    minTickGap: 8,
    dy: tilt ? 4 : 0,
  };
}

const BarChart = ({
  props,
}: RendererProps<{ data: Series; height?: number }>) => {
  const data = props.data ?? [];
  const xa = xAxisProps(data);
  return (
    <div style={{ width: "100%", height: props.height ?? 240 }}>
      <ResponsiveContainer>
        <RBarChart
          data={data}
          margin={{ top: 24, right: 12, left: 4, bottom: xa.angle ? 16 : 4 }}
        >
          <CartesianGrid
            stroke="var(--line-2)"
            vertical={false}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            angle={xa.angle}
            height={xa.height}
            textAnchor={xa.textAnchor}
            interval={xa.interval}
            minTickGap={xa.minTickGap}
            dy={xa.dy}
          />
          <YAxis
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={fmtNumber}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: "var(--lilac-softer)" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--lilac)">
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 11, fontWeight: 600, fill: "var(--ink)" }}
              formatter={(v: unknown) => fmtNumber(Number(v))}
            />
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LineChart = ({
  props,
}: RendererProps<{ data: Series; height?: number }>) => {
  const data = props.data ?? [];
  const xa = xAxisProps(data);
  return (
    <div style={{ width: "100%", height: props.height ?? 240 }}>
      <ResponsiveContainer>
        <RLineChart
          data={data}
          margin={{ top: 24, right: 16, left: 4, bottom: xa.angle ? 16 : 4 }}
        >
          <CartesianGrid
            stroke="var(--line-2)"
            vertical={false}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            angle={xa.angle}
            height={xa.height}
            textAnchor={xa.textAnchor}
            interval={xa.interval}
            minTickGap={xa.minTickGap}
            dy={xa.dy}
          />
          <YAxis
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={fmtNumber}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b3a8a"
            strokeWidth={2.5}
            dot={{
              r: 3.5,
              fill: "var(--lilac)",
              stroke: "#3b3a8a",
              strokeWidth: 1.5,
            }}
            activeDot={{ r: 5 }}
          >
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 11, fontWeight: 600, fill: "var(--ink)" }}
              formatter={(v: unknown) => fmtNumber(Number(v))}
            />
          </Line>
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
};

const HorizontalBarChart = ({
  props,
}: RendererProps<{ data: Series; height?: number }>) => {
  const data = props.data ?? [];
  // Auto-size: ~32px per row + padding. Caller can override via height.
  const height = props.height ?? Math.max(180, data.length * 32 + 48);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RBarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 56, left: 4, bottom: 8 }}
        >
          <CartesianGrid
            stroke="var(--line-2)"
            horizontal={false}
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtNumber}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: "var(--lilac-softer)" }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="var(--lilac)">
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 11, fontWeight: 600, fill: "var(--ink)" }}
              formatter={(v: unknown) => fmtNumber(Number(v))}
            />
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
};

type ScatterPoint = { x: number; y: number; label?: string };

const ScatterChart = ({
  props,
}: RendererProps<{
  data: ScatterPoint[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
}>) => {
  const data = props.data ?? [];
  return (
    <div style={{ width: "100%", height: props.height ?? 280 }}>
      <ResponsiveContainer>
        <RScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 28 }}>
          <CartesianGrid stroke="var(--line-2)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={props.xLabel ?? "x"}
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtNumber}
            label={
              props.xLabel
                ? {
                    value: props.xLabel,
                    position: "insideBottom",
                    offset: -8,
                    style: { fontSize: 11, fill: "var(--ink)" },
                  }
                : undefined
            }
          />
          <YAxis
            type="number"
            dataKey="y"
            name={props.yLabel ?? "y"}
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={fmtNumber}
            label={
              props.yLabel
                ? {
                    value: props.yLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "var(--ink)" },
                  }
                : undefined
            }
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(v: unknown, name: unknown) => [
              fmtNumber(Number(v)),
              name == null ? "" : String(name),
            ]}
          />
          <Scatter
            data={data}
            fill="var(--lilac)"
            stroke="#3b3a8a"
            strokeWidth={1.5}
          />
        </RScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const DonutChart = ({
  props,
}: RendererProps<{ data: Series; height?: number }>) => {
  const data = props.data ?? [];
  const total = data.reduce((s, d) => s + d.value, 0);
  const height = props.height ?? 240;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(value: unknown, name: unknown) => [
                fmtNumber(Number(value)),
                String(name),
              ]}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="92%"
              paddingAngle={1.5}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Total in the middle of the donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink)]">
            Total
          </span>
          <span className="text-[20px] font-semibold tracking-tight text-[var(--ink)] tabular-nums leading-tight">
            {fmtNumber(total)}
          </span>
        </div>
      </div>

      {/* External legend with values */}
      <ul className="flex-1 min-w-0 flex flex-col gap-1.5">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li
              key={`${d.label}-${i}`}
              className="flex items-center gap-3 text-[13px]"
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
              />
              <span className="text-[var(--ink-2)] truncate flex-1 min-w-0">
                {d.label}
              </span>
              <span className="mono tabular-nums text-[12.5px] text-[var(--ink)] font-medium shrink-0">
                {fmtNumber(d.value)}
              </span>
              <span className="mono text-[11px] text-[var(--ink)] shrink-0 w-9 text-right">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const DataTable = ({
  props,
}: RendererProps<{
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string | number>[];
}>) => {
  const columns = props.columns ?? [];
  const rows = props.rows ?? [];
  return (
    <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)]">
      <table className="w-full text-[13.5px] border-collapse">
        <thead className="bg-[var(--surface-soft)]">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={clsx(
                  "px-4 py-2.5 font-medium mono uppercase tracking-[0.1em] text-[10.5px] text-[var(--ink)] border-b border-[var(--line)]",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={clsx(
                "border-b border-[var(--line-2)] last:border-b-0 transition-colors hover:bg-[var(--surface-soft)]",
              )}
            >
              {columns.map((c) => {
                const raw = row[c.key];
                const text = raw == null ? "" : String(raw);
                const looksLikeDelta = c.key === "delta" || c.key === "Δ";
                const meaningful = !looksLikeDelta || hasMeaningfulDelta(text);
                if (looksLikeDelta && meaningful) {
                  const tone = text.trim().startsWith("-")
                    ? "text-[#7a1b22]"
                    : text.trim().startsWith("+")
                      ? "text-[#0a5d44]"
                      : "text-[var(--ink-2)]";
                  return (
                    <td
                      key={c.key}
                      className={clsx(
                        "px-4 py-3 tabular-nums mono text-[12px] font-medium",
                        c.align === "right" ? "text-right" : "text-left",
                        tone,
                      )}
                    >
                      {text}
                    </td>
                  );
                }
                return (
                  <td
                    key={c.key}
                    className={clsx(
                      "px-4 py-3 text-[var(--ink-2)]",
                      c.align === "right"
                        ? "text-right tabular-nums mono text-[13px]"
                        : "text-left",
                    )}
                  >
                    {meaningful ? (
                      (text as ReactNode)
                    ) : (
                      <span className="text-[var(--ink)]">. </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Button = ({
  props,
  dispatch,
}: RendererProps<{
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  action: { event: { name: string; context?: Record<string, unknown> } };
}>) => {
  const variants = {
    primary: "bg-[var(--ink)] text-white hover:bg-[#1d1d23]",
    secondary:
      "border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-soft)]",
    ghost: "text-[var(--ink)] hover:text-[var(--ink)]",
  };
  return (
    <button
      type="button"
      onClick={() =>
        dispatch?.({ ...props.action, sourceComponentId: undefined } as never)
      }
      className={clsx(
        "inline-flex items-center gap-2 px-4 py-2 rounded-[10px] mono text-[12.5px] font-medium transition",
        variants[props.variant ?? "secondary"],
      )}
    >
      {props.label}
    </button>
  );
};

const ChoiceChips = ({
  props,
  dispatch,
}: RendererProps<{
  label: string;
  options: { label: string; value: string }[];
  value: string | string[];
  multi?: boolean;
}>) => {
  const selected = Array.isArray(props.value)
    ? props.value
    : props.value
      ? [props.value]
      : [];
  return (
    <div className="flex flex-col gap-2">
      <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] font-medium">
        {props.label}
      </span>
      <div className="flex flex-wrap gap-2">
        {(props.options ?? []).map((o) => {
          const isOn = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() =>
                dispatch?.({
                  event: {
                    name: "select_chip",
                    context: { value: o.value, label: props.label },
                  },
                } as never)
              }
              className={clsx(
                "px-3 py-1.5 rounded-full text-[12px] border transition mono",
                isOn
                  ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                  : "bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-2)]",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function Slot({ render }: { render: ReactNode }) {
  return <>{render}</>;
}

type FurnitureItem = {
  type: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  rotation?: number;
  color?: string;
  collidable?: boolean;
};
type Door = { wall: "north" | "south" | "east" | "west"; offset: number; width?: number };
type WinDef = { wall: "north" | "south" | "east" | "west"; start: number; end: number };
type FurnitureFeedback = {
  type: "positive" | "suggestion";
  message: string;
  title?: string;
  suggestedFurniture?: FurnitureItem[];
};

type FurnitureProduct = {
  name: string;
  brand?: string;
  price?: string;
  url: string;
  image_url?: string;
  style?: string;
  material?: string;
  dimensions?: string;
  description?: string;
};
type SearchData = { products: FurnitureProduct[] };

const FURNITURE_COLORS: Record<string, [string, string]> = {
  // bedroom
  bed:             ["#a3bffa", "#1e40af"],
  single_bed:      ["#bfdbfe", "#1e40af"],
  wardrobe:        ["#c4b5fd", "#6d28d9"],
  nightstand:      ["#ddd6fe", "#6d28d9"],
  dresser:         ["#e9d5ff", "#7e22ce"],
  // living / office
  sofa:            ["#fca5a5", "#991b1b"],
  armchair:        ["#fecaca", "#991b1b"],
  coffee_table:    ["#fde68a", "#92400e"],
  tv_stand:        ["#a5b4fc", "#3730a3"],
  bookcase:        ["#d1d5db", "#374151"],
  desk:            ["#6ee7b7", "#065f46"],
  office_chair:    ["#a7f3d0", "#065f46"],
  shelf:           ["#d1d5db", "#374151"],
  // dining
  table:           ["#fde68a", "#92400e"],
  dining_table:    ["#fcd34d", "#92400e"],
  chair:           ["#fdba74", "#92400e"],
  // kitchen
  cooker:          ["#f97316", "#7c2d12"],
  fridge:          ["#bae6fd", "#0c4a6e"],
  countertop:      ["#e5e7eb", "#374151"],
  kitchen_sink:    ["#bae6fd", "#0369a1"],
  dishwasher:      ["#cbd5e1", "#334155"],
  kitchen_island:  ["#f1f5f9", "#334155"],
  microwave:       ["#94a3b8", "#1e293b"],
  // bathroom
  bathtub:         ["#e0f2fe", "#0369a1"],
  shower:          ["#bae6fd", "#0284c7"],
  toilet:          ["#f8fafc", "#64748b"],
  sink:            ["#e0f2fe", "#0369a1"],
  washing_machine: ["#dbeafe", "#1d4ed8"],
  // utility
  plant:           ["#bbf7d0", "#166534"],
  rug:             ["#fce7f3", "#9d174d"],
  piano:           ["#1e293b", "#0f172a"],
};

const SNAP_PX = 14;

function boxesOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
  gap = 2,
): boolean {
  return ax < bx + bw - gap && ax + aw > bx + gap &&
         ay < by + bh - gap && ay + ah > by + gap;
}

function hexIsDark(hex: string): boolean {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function doorBBox(door: Door, scale: number, canvasW: number, canvasH: number) {
  const dw = (door.width ?? 80) * scale;
  const off = door.offset * scale;
  switch (door.wall) {
    case "west":  return { x: 0,            y: off,           w: dw, h: dw };
    case "east":  return { x: canvasW - dw, y: off,           w: dw, h: dw };
    case "north": return { x: off,           y: 0,            w: dw, h: dw };
    case "south": return { x: off,           y: canvasH - dw, w: dw, h: dw };
  }
}

const SWING_FILL = "rgba(180,180,180,0.18)";
const SWING_STROKE = "#999";

function DoorFeature({ door, scale, canvasW, canvasH }: { door: Door; scale: number; canvasW: number; canvasH: number }) {
  const dw = (door.width ?? 80) * scale;
  const off = door.offset * scale;
  const cover = 7;
  const sw = { fill: SWING_FILL, stroke: SWING_STROKE, strokeWidth: 1.5, strokeDasharray: "4,2" } as const;
  switch (door.wall) {
    case "west":
      return <g>
        <rect x={0} y={off} width={cover} height={dw} fill="#f5f0eb" />
        <path d={`M 0 ${off} L ${dw} ${off} A ${dw} ${dw} 0 0 1 0 ${off + dw} Z`} {...sw} />
      </g>;
    case "east":
      return <g>
        <rect x={canvasW - cover} y={off} width={cover} height={dw} fill="#f5f0eb" />
        <path d={`M ${canvasW} ${off} L ${canvasW - dw} ${off} A ${dw} ${dw} 0 0 0 ${canvasW} ${off + dw} Z`} {...sw} />
      </g>;
    case "north":
      return <g>
        <rect x={off} y={0} width={dw} height={cover} fill="#f5f0eb" />
        <path d={`M ${off} 0 L ${off} ${dw} A ${dw} ${dw} 0 0 0 ${off + dw} 0 Z`} {...sw} />
      </g>;
    case "south":
      return <g>
        <rect x={off} y={canvasH - cover} width={dw} height={cover} fill="#f5f0eb" />
        <path d={`M ${off} ${canvasH} L ${off} ${canvasH - dw} A ${dw} ${dw} 0 0 1 ${off + dw} ${canvasH} Z`} {...sw} />
      </g>;
  }
}

function WindowFeature({ win, scale, canvasW, canvasH }: { win: WinDef; scale: number; canvasW: number; canvasH: number }) {
  const s = win.start * scale, e = win.end * scale;
  switch (win.wall) {
    case "north": return <line x1={s} y1={0} x2={e} y2={0} stroke="#60a5fa" strokeWidth={5} />;
    case "south": return <line x1={s} y1={canvasH} x2={e} y2={canvasH} stroke="#60a5fa" strokeWidth={5} />;
    case "west":  return <line x1={0} y1={s} x2={0} y2={e} stroke="#60a5fa" strokeWidth={5} />;
    case "east":  return <line x1={canvasW} y1={s} x2={canvasW} y2={e} stroke="#60a5fa" strokeWidth={5} />;
  }
}

function FloorPlanSVG({
  props,
  dispatch,
}: RendererProps<{
  svg: string;
  title?: string;
  room?: { width: number; height: number };
  furniture?: FurnitureItem[];
  doors?: Door[];
  windows?: WinDef[];
  feedback?: FurnitureFeedback;
}>) {
  const [items, setItems] = useState<FurnitureItem[]>(props.furniture ?? []);
  const [collisionWarning, setCollisionWarning] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<FurnitureFeedback | null>(props.feedback ?? null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Smart merge: keep user-dragged positions for items that already exist,
  // place truly new items at the agent's suggested coordinates.
  const prevFurnitureRef = useRef(props.furniture);
  useEffect(() => {
    if (props.furniture === prevFurnitureRef.current) return;
    prevFurnitureRef.current = props.furniture;
    if (!props.furniture) return;
    setItems(prev => {
      const used = new Set<number>();
      return props.furniture!.map(newItem => {
        const matchIdx = prev.findIndex((old, idx) =>
          !used.has(idx) && old.type === newItem.type,
        );
        if (matchIdx >= 0) {
          used.add(matchIdx);
          const old = prev[matchIdx];
          return { ...newItem, x: old.x, y: old.y, rotation: old.rotation ?? newItem.rotation };
        }
        return newItem;
      });
    });
  });

  // Sync feedback from data model when agent calls update_data_model
  useEffect(() => {
    if (props.feedback) {
      setLocalFeedback(props.feedback);
      setIsAnalyzing(false);
    }
  }, [props.feedback]);

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSearch = async (type: string) => {
    setSearchQuery(type);
    setIsSearching(true);
    setSearchResults(null);
    try {
      const res = await fetch("/api/search-furniture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ furnitureType: type }),
      });
      const data = await res.json() as Partial<SearchData>;
      setSearchResults({ products: data.products ?? [] });
    } catch {
      setSearchResults({ products: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const hasDraggable = props.furniture && props.furniture.length > 0 && props.room;

  if (!hasDraggable) {
    return (
      <div style={{ background: "var(--card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-container)", padding: 16 }}>
        {props.title && <p style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>{props.title}</p>}
        <div dangerouslySetInnerHTML={{ __html: props.svg }} />
      </div>
    );
  }

  const MAX_W = 520;
  const MAX_H = 440;
  const scale = Math.min(MAX_W / props.room!.width, MAX_H / props.room!.height, 1.2);
  const canvasW = Math.round(props.room!.width * scale);
  const canvasH = Math.round(props.room!.height * scale);
  const doors = props.doors ?? [];
  const windows = props.windows ?? [];

  return (
    <div style={{ background: "var(--card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-container)", padding: 16 }}>
      {props.title && (
        <p style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 10, fontSize: 15 }}>
          {props.title}
          <span style={{ fontWeight: 400, fontSize: 11, color: "var(--text-secondary)", marginLeft: 8 }}>drag · ↻ rotate · 🛒 shop</span>
        </p>
      )}

      {/* Floor plan + search results side by side */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

      {/* Room with dimension labels */}
      <div style={{ display: "inline-flex", alignItems: "flex-start", gap: 6 }}>

        {/* Height label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: canvasH, width: 28 }}>
          <span style={{ fontSize: 10, color: "#888", writingMode: "vertical-rl", transform: "rotate(180deg)", userSelect: "none" }}>
            {props.room!.height} cm
          </span>
        </div>

        <div>
          {/* Canvas */}
          <div style={{ position: "relative", width: canvasW, height: canvasH }}>

            {/* Ghost overlay — suggested positions (dashed outlines, pointer-events: none) */}
            {localFeedback?.type === "suggestion" && (localFeedback.suggestedFurniture ?? []).map((suggItem, si) => {
              const isRotated = suggItem.rotation === 90 || suggItem.rotation === 270;
              const effW = isRotated ? suggItem.depth : suggItem.width;
              const effH = isRotated ? suggItem.width : suggItem.depth;
              const [, stroke] = FURNITURE_COLORS[suggItem.type] ?? ["#e5e7eb", "#374151"];
              return (
                <div key={`ghost-${si}`} style={{
                  position: "absolute",
                  left: Math.round((suggItem.x - effW / 2) * scale),
                  top: Math.round((suggItem.y - effH / 2) * scale),
                  width: Math.round(effW * scale),
                  height: Math.round(effH * scale),
                  border: `2px dashed ${stroke}`, borderRadius: 3,
                  opacity: 0.45, pointerEvents: "none", zIndex: 5,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 9, color: stroke, fontWeight: 600, opacity: 0.8 }}>
                    {suggItem.type.replace("_", " ")}
                  </span>
                </div>
              );
            })}

            {/* Collision warning */}
            {collisionWarning && (
              <div style={{
                position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6,
                padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "#92400e",
                whiteSpace: "nowrap", pointerEvents: "none", zIndex: 20,
              }}>
                Can't place here — overlapping another piece
              </div>
            )}

            {/* SVG layer: background + walls + doors + windows */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                 viewBox={`0 0 ${canvasW} ${canvasH}`}>
              <rect x={0} y={0} width={canvasW} height={canvasH} fill="#f5f0eb" />
              <rect x={0} y={0} width={canvasW} height={canvasH} fill="none" stroke="#333" strokeWidth={4} />
              {doors.map((d, i) => <DoorFeature key={i} door={d} scale={scale} canvasW={canvasW} canvasH={canvasH} />)}
              {windows.map((w, i) => <WindowFeature key={i} win={w} scale={scale} canvasW={canvasW} canvasH={canvasH} />)}
            </svg>

            {/* Furniture layer */}
            {items.map((item, i) => {
              const [fill, stroke] = item.color
                ? [item.color, hexIsDark(item.color) ? "#ffffff" : "#1a1a1a"]
                : (FURNITURE_COLORS[item.type] ?? ["#e5e7eb", "#374151"]);
              const isRotated = item.rotation === 90 || item.rotation === 270;
              const effectiveW = isRotated ? item.depth : item.width;
              const effectiveH = isRotated ? item.width : item.depth;
              const w = Math.round(effectiveW * scale);
              const h = Math.round(effectiveH * scale);
              const x = Math.round((item.x - effectiveW / 2) * scale);
              const y = Math.round((item.y - effectiveH / 2) * scale);
              const fontSize = Math.max(8, Math.min(12, w / 6));
              const showDims = w > 36 && h > 24;

              return (
                <Rnd
                  key={i}
                  position={{ x, y }}
                  size={{ width: w, height: h }}
                  bounds="parent"
                  enableResizing={false}
                  onDragStop={(_e, d) => {
                    // snap to wall
                    let sx = d.x, sy = d.y;
                    if (sx < SNAP_PX) sx = 0;
                    if (sy < SNAP_PX) sy = 0;
                    if (sx + w > canvasW - SNAP_PX) sx = canvasW - w;
                    if (sy + h > canvasH - SNAP_PX) sy = canvasH - h;
                    // collision detection — revert if overlapping any other piece
                    // non-collidable items (rugs, plants) are skipped as obstacles
                    // and skip the whole check if the dragged item itself is non-collidable
                    const draggable = item.collidable !== false;
                    const collision = draggable && items.some((other, idx) => {
                      if (idx === i) return false;
                      if (other.collidable === false) return false;
                      const oRot = other.rotation === 90 || other.rotation === 270;
                      const oEW = oRot ? other.depth : other.width;
                      const oEH = oRot ? other.width : other.depth;
                      const oW = Math.round(oEW * scale);
                      const oH = Math.round(oEH * scale);
                      const oX = Math.round((other.x - oEW / 2) * scale);
                      const oY = Math.round((other.y - oEH / 2) * scale);
                      return boxesOverlap(sx, sy, w, h, oX, oY, oW, oH);
                    });
                    const doorCollision = draggable && doors.some(door => {
                      const z = doorBBox(door, scale, canvasW, canvasH);
                      return boxesOverlap(sx, sy, w, h, z.x, z.y, z.w, z.h);
                    });
                    if (collision || doorCollision) {
                      setCollisionWarning(true);
                      setTimeout(() => setCollisionWarning(false), 1800);
                      return;
                    }
                    setItems((prev) =>
                      prev.map((it, idx) =>
                        idx === i
                          ? { ...it, x: sx / scale + effectiveW / 2, y: sy / scale + effectiveH / 2 }
                          : it,
                      ),
                    );
                    // Debounce: wait 3s after last drag then ask agent to analyse
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                      if (!dispatch || !props.room) return;
                      setIsAnalyzing(true);
                      setLocalFeedback(null);
                      dispatch({
                        event: {
                          name: "furniture_moved",
                          context: {
                            label: item.type,
                            title: props.title ?? "Room Layout",
                            movedItem: { type: item.type, fromX: item.x, fromY: item.y, toX: sx / scale + effectiveW / 2, toY: sy / scale + effectiveH / 2 },
                            furniture: itemsRef.current,
                            room: props.room,
                          },
                        },
                      } as never);
                    }, 3000);
                  }}
                  style={{ background: fill, border: `2px solid ${stroke}`, borderRadius: 3, cursor: "grab", zIndex: item.collidable === false ? 1 : 2 }}
                >
                  <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize, color: stroke, fontWeight: 600, pointerEvents: "none", textAlign: "center", lineHeight: 1.2 }}>
                      {item.type.replace("_", " ")}
                    </span>
                    {showDims && (
                      <span style={{ fontSize: fontSize - 1, color: stroke, opacity: 0.7, pointerEvents: "none" }}>
                        {item.width}×{item.depth}
                      </span>
                    )}
                    {/* Rotate button */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItems((prev) =>
                          prev.map((it, idx) =>
                            idx === i ? { ...it, rotation: ((it.rotation ?? 0) + 90) % 360 } : it,
                          ),
                        );
                      }}
                      style={{
                        position: "absolute", top: 2, right: 2,
                        width: 16, height: 16, borderRadius: "50%",
                        border: `1px solid ${stroke}`, background: "rgba(255,255,255,0.75)",
                        cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      ↻
                    </button>
                    {/* Shop button */}
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); void handleSearch(item.type); }}
                      title={`Shop ${item.type.replace(/_/g, " ")}`}
                      style={{
                        position: "absolute", top: 2, left: 2,
                        width: 16, height: 16, borderRadius: "50%",
                        border: `1px solid ${stroke}`, background: "rgba(255,255,255,0.75)",
                        cursor: "pointer", fontSize: 9, padding: 0, lineHeight: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      🛒
                    </button>
                  </div>
                </Rnd>
              );
            })}
          </div>

          {/* Width label */}
          <div style={{ textAlign: "center", fontSize: 10, color: "#888", marginTop: 4, userSelect: "none" }}>
            {props.room!.width} cm
          </div>
        </div>
      </div>

      {/* Search results panel — right of floor plan */}
      {(isSearching || searchQuery) && (
        <div style={{ width: 270, flexShrink: 0, maxHeight: canvasH + 40, overflowY: "auto", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>
              🛒 {(searchQuery ?? "").replace(/_/g, " ")}
            </span>
            <button type="button" onClick={() => { setSearchQuery(null); setSearchResults(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, lineHeight: 1 }}>×</button>
          </div>

          {isSearching && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3].map(k => (
                <div key={k} style={{ height: 72, borderRadius: 8, background: "#f3f4f6", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          )}

          {!isSearching && searchResults && (
            <>
              {(searchResults.products ?? []).length === 0 && (
                <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 16 }}>No results found.</p>
              )}
              {(searchResults.products ?? []).map((item, k) => (
                <div key={k} style={{ marginBottom: 10, borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", background: "#fff" }}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} loading="lazy"
                      style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: "#111", lineHeight: 1.3 }}>{item.name}</span>
                      {item.price && (
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#166534", flexShrink: 0 }}>{item.price}</span>
                      )}
                    </div>
                    {item.brand && (
                      <span style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.brand}</span>
                    )}
                    {item.description && (
                      <p style={{ fontSize: 11, color: "#374151", margin: "4px 0 0 0", lineHeight: 1.4 }}>{item.description}</p>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "5px 0" }}>
                      {item.style && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#eff6ff", color: "#1e40af" }}>{item.style}</span>}
                      {item.material && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#f0fdf4", color: "#166534" }}>{item.material}</span>}
                      {item.dimensions && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#f9fafb", color: "#374151" }}>{item.dimensions}</span>}
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 2, fontSize: 11, color: "#1e40af", fontWeight: 600, textDecoration: "none" }}>
                      View product →
                    </a>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      </div>{/* end flex row */}

      {/* Analysing indicator */}
      {isAnalyzing && !localFeedback && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "#f9fafb", border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>🔍 Analysing layout…</span>
        </div>
      )}

      {/* Feedback popup */}
      {localFeedback && (
        <div style={{
          marginTop: 10, padding: "12px 14px", borderRadius: 10,
          background: localFeedback.type === "positive" ? "#f0fdf4" : "#eff6ff",
          border: `1.5px solid ${localFeedback.type === "positive" ? "#86efac" : "#93c5fd"}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              {localFeedback.title && (
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px 0", color: localFeedback.type === "positive" ? "#166534" : "#1e40af" }}>
                  {localFeedback.type === "positive" ? "✓ " : "💡 "}{localFeedback.title}
                </p>
              )}
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5, margin: 0 }}>
                {localFeedback.message}
              </p>
            </div>
            <button type="button" onClick={() => setLocalFeedback(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, padding: "0 0 0 8px", lineHeight: 1, flexShrink: 0 }}>
              ×
            </button>
          </div>
          {localFeedback.type === "suggestion" && localFeedback.suggestedFurniture && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setLocalFeedback(null)}
                style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontSize: 12, color: "#6b7280" }}>
                Dismiss
              </button>
              <button type="button"
                onClick={() => {
                  setItems((prev) => {
                    const updated = prev.map(it => ({ ...it }));
                    for (const sugg of localFeedback.suggestedFurniture!) {
                      const idx = updated.findIndex(it => it.type === sugg.type);
                      if (idx !== -1) updated[idx] = { ...updated[idx], x: sugg.x, y: sugg.y, rotation: sugg.rotation ?? updated[idx].rotation };
                    }
                    return updated;
                  });
                  setLocalFeedback(null);
                }}
                style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#1e40af", cursor: "pointer", fontSize: 12, color: "white", fontWeight: 600 }}>
                Apply suggestion
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const renderers = {
  Stack,
  Row,
  Grid,
  Section,
  Card,
  Divider,
  Heading,
  Text,
  Overline,
  Badge,
  Callout,
  BulletList,
  StatCard,
  BarChart,
  HorizontalBarChart,
  LineChart,
  DonutChart,
  ScatterChart,
  DataTable,
  Button,
  ChoiceChips,
  FloorPlanSVG,
};
