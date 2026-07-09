import React from "react";
import {
  ArrowRight,
  Layers,
  Layout,
  Move,
  Package,
  RotateCw,
  Shield,
  ShoppingCart,
  Upload,
} from "@geist-ui/icons";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const colors = {
  bg: "#08090B",
  bgAlt: "#0D0F14",
  surface: "#0F1117",
  surfaceSoft: "#141720",
  ink: "#EDEEF2",
  ink2: "#C2C3CC",
  muted: "#8A8B99",
  muted2: "#5F6072",
  line: "#1A1C26",
  line2: "#1E2130",
  lilac: "#A5B4FC",
  mint: "#6EE7B7",
  orange: "#FCA97A",
  yellow: "#FDE68A",
  red: "#F87171",
  canvas: "#FAFAFC",
  canvasLine: "#DBDBE5",
};

const gradient = `linear-gradient(90deg, ${colors.lilac} 0%, ${colors.mint} 52%, ${colors.orange} 100%)`;
const font = '"Geist", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const mono = '"Geist Mono", "SFMono-Regular", Consolas, monospace';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const sceneStyle: React.CSSProperties = {
  background: colors.bg,
  color: colors.ink,
  fontFamily: font,
  overflow: "hidden",
};

export const PlanaDemo = () => {
  return (
    <AbsoluteFill style={sceneStyle}>
      <Audio src={staticFile("voiceover/plana-demo.mp3")} volume={0.92} />
      <Sequence durationInFrames={240}>
        <HeroScene />
      </Sequence>
      <Sequence from={240} durationInFrames={210}>
        <WorkflowScene />
      </Sequence>
      <Sequence from={450} durationInFrames={330}>
        <DesignerScene />
      </Sequence>
      <Sequence from={780} durationInFrames={330}>
        <FloorPlanScene />
      </Sequence>
      <Sequence from={1110} durationInFrames={210}>
        <FeatureScene />
      </Sequence>
      <Sequence from={1320} durationInFrames={120}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

const BlueprintBackground = ({ opacity = 1 }: { opacity?: number }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        backgroundImage:
          "linear-gradient(rgba(165,180,252,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(165,180,252,0.045) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 980,
        height: 700,
        translate: "-50% -50%",
        borderRadius: 999,
        background:
          "radial-gradient(ellipse at center, rgba(110,231,183,0.11) 0%, rgba(165,180,252,0.075) 42%, transparent 72%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, transparent 0%, rgba(8,9,11,0.15) 52%, rgba(8,9,11,0.92) 100%)",
      }}
    />
  </AbsoluteFill>
);

const SiteNav = ({ active = "Home" }: { active?: "Home" | "Designer" }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 76,
      borderBottom: `1px solid ${colors.line}`,
      background: "rgba(8,9,11,0.82)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    }}
  >
    <div
      style={{
        width: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Logo size={30} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {(["Home", "Designer"] as const).map((item) => (
          <div
            key={item}
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              fontSize: 16,
              color: active === item ? colors.ink : colors.muted,
              background: active === item ? colors.surface : "transparent",
              border: active === item ? `1px solid ${colors.line}` : "1px solid transparent",
              fontWeight: 600,
            }}
          >
            {item}
          </div>
        ))}
        <div style={{ width: 1, height: 22, background: colors.line, margin: "0 12px" }} />
        <div style={{ color: colors.muted, fontSize: 16 }}>GitHub</div>
      </div>
    </div>
  </div>
);

const Logo = ({ size = 28 }: { size?: number }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 800,
      letterSpacing: "-0.04em",
      backgroundImage: gradient,
      WebkitBackgroundClip: "text",
      color: "transparent",
    }}
  >
    Plana
  </div>
);

const Pill = ({ children, color = colors.lilac }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 18px",
      borderRadius: 999,
      border: `1px solid ${colors.line}`,
      background: colors.surface,
      color: colors.muted,
      fontFamily: mono,
      fontSize: 13,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: color,
        boxShadow: `0 0 0 5px ${color}33`,
      }}
    />
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ width: 40, height: 1, background: gradient }} />
    <span
      style={{
        fontFamily: mono,
        fontSize: 15,
        color: colors.muted2,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  </div>
);

const HeroScene = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [10, 58], [0, 1], { ...clamp, easing: ease });
  const bodyIn = interpolate(frame, [55, 95], [0, 1], { ...clamp, easing: ease });
  const statsIn = interpolate(frame, [100, 150], [0, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <BlueprintBackground />
      <SiteNav active="Home" />
      <CornerMarks />
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 390,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: 0.7,
        }}
      >
        <div style={{ width: 1, height: 130, background: colors.line }} />
        <div style={{ fontFamily: mono, color: colors.muted2, fontSize: 13, rotate: "90deg", letterSpacing: "0.16em" }}>520 cm</div>
        <div style={{ width: 1, height: 130, background: colors.line }} />
      </div>
      <main
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 50,
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: titleIn,
            translate: `0 ${interpolate(frame, [10, 58], [36, 0], { ...clamp, easing: ease })}px`,
          }}
        >
          <Pill color={colors.mint}>TestSprite Hackathon S3 · Jul 2026</Pill>
          <h1
            style={{
              margin: "54px 0 0",
              fontSize: 108,
              lineHeight: 0.93,
              fontWeight: 900,
              letterSpacing: "-0.055em",
            }}
          >
            Design your room
            <br />
            <span style={{ backgroundImage: gradient, WebkitBackgroundClip: "text", color: "transparent" }}>
              down to the centimetre.
            </span>
          </h1>
        </div>
        <p
          style={{
            width: 760,
            marginTop: 38,
            fontSize: 29,
            lineHeight: 1.48,
            color: colors.muted,
            opacity: bodyIn,
            translate: `0 ${interpolate(frame, [55, 95], [24, 0], { ...clamp, easing: ease })}px`,
          }}
        >
          Describe your room or upload a floor plan. Plana generates a pixel-perfect interactive layout in seconds.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 48,
            opacity: bodyIn,
          }}
        >
          <div
            style={{
              padding: "18px 34px",
              borderRadius: 18,
              background: gradient,
              color: colors.bg,
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            <span>Start designing</span>
            <ArrowRight size={22} />
          </div>
          <div
            style={{
              padding: "18px 34px",
              borderRadius: 18,
              border: `1px solid ${colors.line}`,
              background: colors.surface,
              color: colors.ink2,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            View source
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 36,
            marginTop: 78,
            opacity: statsIn,
          }}
        >
          {[
            ["Real cm", "dimensions"],
            ["Live", "AI feedback"],
            ["A2UI", "generative UI"],
            ["Drag & drop", "canvas"],
          ].map(([value, label], index) => (
            <React.Fragment key={label}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
                <div style={{ color: colors.muted2, fontSize: 15, marginTop: 4 }}>{label}</div>
              </div>
              {index < 3 && <div style={{ width: 1, height: 36, background: colors.line }} />}
            </React.Fragment>
          ))}
        </div>
      </main>
    </AbsoluteFill>
  );
};

const WorkflowScene = () => {
  const frame = useCurrentFrame();
  const cards = [
    {
      n: "01",
      title: "Describe or upload",
      body: "Type room dimensions and style, or attach a floor plan image.",
      icon: Upload,
      accent: colors.lilac,
    },
    {
      n: "02",
      title: "AI generates layout",
      body: "Furniture streams into a to-scale canvas via A2UI envelopes.",
      icon: Layers,
      accent: colors.mint,
      tag: "A2UI",
    },
    {
      n: "03",
      title: "Drag, rotate, refine",
      body: "Collision checks and AI feedback keep flow and clearance realistic.",
      icon: Move,
      accent: colors.orange,
      tag: "AG-UI",
    },
  ];

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <BlueprintBackground opacity={0.55} />
      <div style={{ position: "absolute", inset: "118px 130px" }}>
        <SectionLabel>How it works</SectionLabel>
        <h2
          style={{
            margin: "34px 0 0",
            fontSize: 82,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            width: 820,
          }}
        >
          From room idea to live layout.
        </h2>
        <div
          style={{
            marginTop: 76,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            border: `1px solid ${colors.line}`,
            borderRadius: 28,
            overflow: "hidden",
            background: colors.bg,
          }}
        >
          {cards.map((card, index) => {
            const start = 28 + index * 32;
            const reveal = interpolate(frame, [start, start + 34], [0, 1], { ...clamp, easing: ease });
            return (
              <div
                key={card.n}
                style={{
                  minHeight: 455,
                  padding: 54,
                  borderRight: index < 2 ? `1px solid ${colors.line}` : undefined,
                  background: `radial-gradient(ellipse at 50% 0%, ${card.accent}18, transparent 62%), ${colors.bg}`,
                  opacity: reveal,
                  translate: `0 ${interpolate(frame, [start, start + 34], [48, 0], { ...clamp, easing: ease })}px`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: mono, fontSize: 16, color: colors.muted2, letterSpacing: "0.16em" }}>{card.n}</span>
                  {card.tag && (
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 14,
                        letterSpacing: "0.12em",
                        color: card.accent,
                        border: `1px solid ${card.accent}55`,
                        borderRadius: 999,
                        padding: "5px 12px",
                      }}
                    >
                      {card.tag}
                    </span>
                  )}
                </div>
                <div style={{ color: card.accent, opacity: 0.9 }}>
                  <card.icon size={82} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 35, letterSpacing: "-0.03em" }}>{card.title}</h3>
                  <p style={{ margin: "18px 0 0", color: colors.muted, fontSize: 22, lineHeight: 1.5 }}>{card.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DesignerScene = () => {
  const frame = useCurrentFrame();
  const chatIn = interpolate(frame, [30, 70], [0, 1], { ...clamp, easing: ease });
  const canvasIn = interpolate(frame, [86, 138], [0, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <SiteNav active="Designer" />
      <div
        style={{
          position: "absolute",
          top: 76,
          left: 0,
          right: 0,
          height: 54,
          borderBottom: `1px solid ${colors.line}`,
          background: colors.surface,
          display: "flex",
          alignItems: "center",
          padding: "0 34px",
          gap: 18,
        }}
      >
        <span style={{ fontFamily: mono, color: colors.muted2, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Room Designer
        </span>
        <span style={{ width: 1, height: 18, background: colors.line }} />
        <span style={{ fontSize: 17, color: colors.ink, fontWeight: 700 }}>Plana · AI Floor Plan Generator</span>
        <span style={{ marginLeft: "auto" }}>
          <Pill color={colors.mint}>agent ready</Pill>
        </span>
      </div>
      <div style={{ position: "absolute", top: 130, left: 0, right: 0, bottom: 0, display: "flex" }}>
        <div
          style={{
            width: 610,
            borderRight: `1px solid ${colors.line}`,
            background: colors.bg,
            display: "flex",
            flexDirection: "column",
            opacity: chatIn,
            translate: `${interpolate(frame, [30, 70], [-46, 0], { ...clamp, easing: ease })}px 0`,
          }}
        >
          <ChatPanel />
        </div>
        <div style={{ flex: 1, padding: 34 }}>
          <div
            style={{
              height: "100%",
              borderRadius: 26,
              border: `1px solid ${colors.line2}`,
              background: colors.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              opacity: canvasIn,
              scale: interpolate(frame, [86, 138], [0.95, 1], { ...clamp, easing: ease }),
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(165,180,252,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(165,180,252,0.035) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />
            <div style={{ textAlign: "center", width: 620, zIndex: 1 }}>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 24,
                  margin: "0 auto 28px",
                  background: `${colors.lilac}14`,
                  border: `1px solid ${colors.lilac}33`,
                  color: colors.lilac,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 42,
                }}
              >
                <Layout size={44} />
              </div>
              <h2 style={{ margin: 0, fontSize: 42, letterSpacing: "-0.035em" }}>No layout yet</h2>
              <p style={{ margin: "18px auto 0", fontSize: 22, lineHeight: 1.45, color: colors.muted, maxWidth: 520 }}>
                Describe your room or upload a floor plan image in chat. Plana will generate an interactive, to-scale layout here.
              </p>
              <div style={{ marginTop: 30 }}>
                <Pill>try: “design a minimalist bedroom 500×400 cm”</Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FloorPlanScene = () => {
  const frame = useCurrentFrame();
  const planIn = interpolate(frame, [20, 80], [0, 1], { ...clamp, easing: ease });
  const feedbackIn = interpolate(frame, [150, 200], [0, 1], { ...clamp, easing: ease });
  const shopIn = interpolate(frame, [210, 270], [0, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <BlueprintBackground opacity={0.38} />
      <div style={{ position: "absolute", inset: "80px 96px" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between" }}>
          <div>
            <SectionLabel>Generated canvas</SectionLabel>
            <h2 style={{ margin: "26px 0 0", fontSize: 72, letterSpacing: "-0.045em", lineHeight: 1 }}>
              Pixel-perfect to scale.
            </h2>
          </div>
          <Pill color={colors.mint}>live AI feedback</Pill>
        </div>
        <div
          style={{
            marginTop: 46,
            height: 760,
            borderRadius: 32,
            border: `1px solid ${colors.line}`,
            background: colors.surface,
            padding: 28,
            display: "grid",
            gridTemplateColumns: shopIn > 0.03 ? "1fr 360px" : "1fr 0px",
            gap: 22,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              borderRadius: 24,
              background: colors.canvas,
              border: `1px solid ${colors.canvasLine}`,
              position: "relative",
              overflow: "hidden",
              opacity: planIn,
              scale: interpolate(frame, [20, 80], [0.96, 1], { ...clamp, easing: ease }),
            }}
          >
            <FloorPlanMockup progress={planIn} frame={frame} />
            <div
              style={{
                position: "absolute",
                right: 28,
                top: 28,
                width: 360,
                opacity: feedbackIn,
                translate: `${interpolate(frame, [150, 200], [34, 0], { ...clamp, easing: ease })}px 0`,
              }}
            >
              <FeedbackCard />
            </div>
          </div>
          <div
            style={{
              opacity: shopIn,
              translate: `${interpolate(frame, [210, 270], [70, 0], { ...clamp, easing: ease })}px 0`,
            }}
          >
            <ShoppingPanel />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FeatureScene = () => {
  const frame = useCurrentFrame();
  const featureCards: Array<{
    title: string;
    body: string;
    color: string;
    Icon: typeof Shield;
  }> = [
    { title: "Collision detection", body: "Furniture cannot overlap or block door arcs.", color: colors.lilac, Icon: Shield },
    { title: "One-click rotate", body: "Dimensions update instantly at every footprint.", color: colors.mint, Icon: RotateCw },
    { title: "Any furniture", body: "Custom sizes, names, colors, and room styles.", color: colors.orange, Icon: Package },
    { title: "Shopping suggestions", body: "Style-matched buy links after layout finalization.", color: colors.lilac, Icon: ShoppingCart },
  ];

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <BlueprintBackground opacity={0.42} />
      <div style={{ position: "absolute", inset: "112px 130px" }}>
        <SectionLabel>Features</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 24, marginTop: 42 }}>
          <div
            style={{
              border: `1px solid ${colors.line}`,
              borderRadius: 34,
              background: `radial-gradient(ellipse at 70% 0%, ${colors.lilac}1f, transparent 55%), ${colors.surface}`,
              padding: 42,
              minHeight: 690,
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Pill>Core</Pill>
                <h2 style={{ margin: "26px 0 14px", fontSize: 58, letterSpacing: "-0.045em", lineHeight: 0.98 }}>
                  Pixel-perfect floor plans
                </h2>
                <p style={{ margin: 0, width: 590, color: colors.muted, fontSize: 22, lineHeight: 1.42 }}>
                  Real centimetre dimensions for every wall, door, window, and furniture piece.
                </p>
              </div>
              <div style={{ display: "grid", gap: 12, minWidth: 170 }}>
                <Metric value="520×430" label="room cm" />
                <Metric value="82 cm" label="clearance" />
              </div>
            </div>
            <div style={{ marginTop: 34, flex: 1, minHeight: 0 }}>
              <MiniFloorPlan frame={frame} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {featureCards.map(({ title, body, color, Icon }, index) => {
              const start = 22 + index * 18;
              const shown = interpolate(frame, [start, start + 28], [0, 1], { ...clamp, easing: ease });
              return (
                <div
                  key={title}
                  style={{
                    border: `1px solid ${colors.line}`,
                    borderRadius: 26,
                    background: colors.surface,
                    padding: 30,
                    opacity: shown,
                    translate: `0 ${interpolate(frame, [start, start + 28], [32, 0], { ...clamp, easing: ease })}px`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${color}55`,
                        background: `${color}16`,
                        color,
                        fontSize: 27,
                      }}
                    >
                      <Icon size={28} />
                    </div>
                    <h3 style={{ margin: "30px 0 0", fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.03em" }}>{title}</h3>
                    <p style={{ margin: "14px 0 0", fontSize: 18, lineHeight: 1.45, color: colors.muted }}>{body}</p>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 13, color: colors.muted2, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    real-time
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene = () => {
  const frame = useCurrentFrame();
  const inValue = interpolate(frame, [6, 42], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <BlueprintBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          opacity: inValue,
          scale: interpolate(frame, [6, 42], [0.96, 1], { ...clamp, easing: ease }),
        }}
      >
        <Logo size={76} />
        <h2 style={{ margin: "42px 0 0", fontSize: 88, lineHeight: 0.98, letterSpacing: "-0.055em" }}>
          AI room design,
          <br />
          down to the centimetre.
        </h2>
        <p style={{ marginTop: 34, color: colors.muted, fontSize: 30 }}>Describe it. Generate it. Refine it live.</p>
      </div>
    </AbsoluteFill>
  );
};

const CornerMarks = () => (
  <>
    {[
      [44, 44, "left", "top"],
      [44, 44, "right", "top"],
      [44, 74, "left", "bottom"],
      [44, 74, "right", "bottom"],
    ].map(([x, y, h, v]) => (
      <div
        key={`${h}-${v}`}
        style={{
          position: "absolute",
          [h as string]: x,
          [v as string]: y,
          width: 34,
          height: 34,
          borderColor: colors.lilac,
          opacity: 0.35,
          borderLeftWidth: h === "left" ? 2 : 0,
          borderRightWidth: h === "right" ? 2 : 0,
          borderTopWidth: v === "top" ? 2 : 0,
          borderBottomWidth: v === "bottom" ? 2 : 0,
          borderStyle: "solid",
        }}
      />
    ))}
  </>
);

const ChatPanel = () => {
  const frame = useCurrentFrame();
  const messages = [
    { who: "agent", text: "Attach a floor plan image or describe your room." },
    { who: "user", text: "Design a minimalist bedroom, 520×430 cm." },
    { who: "agent", text: "Reading dimensions. Placing bed, desk, rug, and storage with clearance checks." },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 24 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, paddingTop: 22 }}>
        {messages.map((message, index) => {
          const start = 62 + index * 38;
          const shown = interpolate(frame, [start, start + 22], [0, 1], { ...clamp, easing: ease });
          const isUser = message.who === "user";
          return (
            <div key={message.text} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", opacity: shown }}>
              <div
                style={{
                  maxWidth: 445,
                  borderRadius: 22,
                  padding: "18px 20px",
                  background: isUser ? colors.lilac : colors.surface,
                  color: isUser ? colors.bg : colors.ink2,
                  border: isUser ? "none" : `1px solid ${colors.line}`,
                  fontSize: 19,
                  lineHeight: 1.42,
                  fontWeight: isUser ? 700 : 500,
                }}
              >
                {message.text}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          height: 74,
          borderRadius: 22,
          border: `1px solid ${colors.line}`,
          background: colors.surface,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          color: colors.muted,
          fontSize: 18,
        }}
      >
        Attach a floor plan image or describe your room…
      </div>
    </div>
  );
};

const FloorPlanMockup = ({ progress, frame }: { progress: number; frame: number }) => {
  const furniture = [
    { label: "Bed", sublabel: "", x: 210, y: 148, w: 330, h: 235, color: "#C7D2FE", delay: 72, fontSize: 22 },
    { label: "Desk", sublabel: "", x: 690, y: 142, w: 210, h: 92, color: "#BEE8D7", delay: 102, fontSize: 20 },
    { label: "Wardrobe", sublabel: "", x: 835, y: 365, w: 155, h: 220, color: "#FED7AA", delay: 132, fontSize: 16 },
    { label: "Rug", sublabel: "", x: 310, y: 424, w: 300, h: 170, color: "#E9D5FF", delay: 162, fontSize: 20 },
    { label: "Chair", sublabel: "", x: 742, y: 260, w: 96, h: 96, color: "#FDE68A", delay: 190, fontSize: 15 },
  ];
  return (
    <div style={{ position: "absolute", inset: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="1120" height="690" viewBox="0 0 1120 690" style={{ overflow: "visible" }}>
        <defs>
          <pattern id="planGrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#ececf4" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="62" y="42" width="996" height="600" rx="12" fill="url(#planGrid)" stroke="#25283A" strokeWidth="12" opacity={progress} />
        <line x1="62" y1="112" x2="62" y2="250" stroke="#93C5FD" strokeWidth="8" opacity={progress} />
        <line x1="880" y1="42" x2="1010" y2="42" stroke="#93C5FD" strokeWidth="8" opacity={progress} />
        <path d="M 62 476 A 132 132 0 0 1 194 608" fill="none" stroke="#FCA97A" strokeWidth="4" strokeDasharray="8 8" opacity={progress} />
        <line x1="62" y1="476" x2="62" y2="608" stroke="#25283A" strokeWidth="12" opacity={progress} />
        <text x="500" y="22" fontFamily={mono} fontSize="20" fill="#74758a" letterSpacing="3">520 CM</text>
        <text x="28" y="354" fontFamily={mono} fontSize="20" fill="#74758a" letterSpacing="3" transform="rotate(-90 28 354)">430 CM</text>
        {furniture.map((item) => {
          const shown = interpolate(frame, [item.delay, item.delay + 26], [0, 1], { ...clamp, easing: ease });
          const float = Math.sin((frame - item.delay) / 24) * 2;
          return (
            <g key={item.label} opacity={shown} transform={`translate(0 ${float})`}>
              <rect
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                rx="16"
                fill={item.color}
                stroke="#8B8FA8"
                strokeWidth="2"
              />
              <text
                x={item.x + item.w / 2}
                y={item.y + item.h / 2 - (item.sublabel ? 5 : -7)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily={font}
                fontSize={item.fontSize}
                fontWeight="800"
                fill="#1f2937"
              >
                {item.label}
              </text>
              {item.sublabel && (
                <text
                  x={item.x + item.w / 2}
                  y={item.y + item.h / 2 + 22}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily={mono}
                  fontSize="13"
                  letterSpacing="2"
                  fill="#62677A"
                >
                  {item.sublabel.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const FeedbackCard = () => (
  <div
    style={{
      borderRadius: 24,
      background: "rgba(255,255,255,0.95)",
      border: `1px solid ${colors.canvasLine}`,
      padding: 24,
      boxShadow: "0 24px 70px rgba(12,14,22,0.18)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#047857", fontFamily: mono, fontSize: 13, letterSpacing: "0.12em" }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, background: "#10B981" }} />
      ANALYZING FLOW
    </div>
    <h3 style={{ color: "#111827", margin: "18px 0 8px", fontSize: 26, letterSpacing: "-0.03em" }}>Clearance looks good</h3>
    <p style={{ color: "#62677A", margin: 0, fontSize: 18, lineHeight: 1.4 }}>
      Door swing is open. Bed keeps 82 cm walkway. Desk gets window light.
    </p>
  </div>
);

const ShoppingPanel = () => (
  <div
    style={{
      height: "100%",
      borderRadius: 24,
      background: "#FFFFFF",
      border: `1px solid ${colors.canvasLine}`,
      padding: 22,
      color: "#111827",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 13, color: "#74758A", letterSpacing: "0.12em" }}>SHOPPING MATCHES</div>
    {[
      ["Oak platform bed", "$480", colors.lilac],
      ["Slim walnut desk", "$210", colors.mint],
      ["Linen storage bench", "$165", colors.orange],
    ].map(([name, price, color]) => (
      <div key={name} style={{ border: `1px solid ${colors.canvasLine}`, borderRadius: 18, padding: 16, display: "flex", gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: `${color}55`, border: `1px solid ${color}` }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{name}</div>
          <div style={{ color: "#74758A", marginTop: 5 }}>{price} · fits layout</div>
        </div>
      </div>
    ))}
  </div>
);

const Metric = ({ value, label }: { value: string; label: string }) => (
  <div
    style={{
      borderRadius: 18,
      border: `1px solid ${colors.line2}`,
      background: colors.bgAlt,
      padding: "14px 16px",
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", color: colors.ink }}>{value}</div>
    <div style={{ marginTop: 4, fontFamily: mono, fontSize: 11, letterSpacing: "0.14em", color: colors.muted2, textTransform: "uppercase" }}>
      {label}
    </div>
  </div>
);

const MiniFloorPlan = ({ frame }: { frame: number }) => {
  const pulse = interpolate(Math.sin(frame / 18), [-1, 1], [0.9, 1.04]);
  return (
    <div
      style={{
        height: "100%",
        borderRadius: 24,
        background: colors.canvas,
        border: `1px solid ${colors.canvasLine}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#ececf4 1px, transparent 1px), linear-gradient(90deg, #ececf4 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div style={{ position: "absolute", left: 120, top: 62, right: 120, bottom: 54, border: "8px solid #25283A", borderRadius: 10 }} />
      <div style={{ position: "absolute", left: 230, top: 112, width: 260, height: 145, borderRadius: 16, background: "#C7D2FE", border: "2px solid #8B8FA8", scale: pulse }} />
      <div style={{ position: "absolute", right: 270, top: 124, width: 170, height: 72, borderRadius: 14, background: "#BEE8D7", border: "2px solid #8B8FA8" }} />
      <div style={{ position: "absolute", left: 330, bottom: 82, width: 250, height: 100, borderRadius: 18, background: "#E9D5FF", border: "2px solid #8B8FA8" }} />
      <div style={{ position: "absolute", right: 228, bottom: 70, width: 92, height: 180, borderRadius: 12, background: "#FED7AA", border: "2px solid #8B8FA8" }} />
      <div style={{ position: "absolute", left: 124, bottom: 72, width: 126, height: 126, borderTopRightRadius: 126, border: `3px dashed ${colors.orange}`, borderLeft: 0, borderBottom: 0 }} />
    </div>
  );
};
