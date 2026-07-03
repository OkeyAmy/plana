# Plana — AI Home Designer

An AI-powered floor plan designer built for the **TestSprite Hackathon Season 3** (CLI Launch & Loop Engineering, Jun 30 – Jul 7 2026). Describe your room or upload a floor plan image — Plana generates a pixel-perfect, to-scale interactive layout, lets you drag furniture with real collision detection, and gives live AI layout feedback.

**Live app:** <!-- add your deployed URL here -->  
**Public repo:** https://github.com/mezberg/ai_home_designer

---

## What it does

1. **Describe or upload a floor plan** — Type your room dimensions and style, or attach an image. The agent reads architectural symbols: door swing arcs, window lines, wall dimensions.

2. **AI generates a to-scale interactive floor plan** — Every piece of furniture is placed with real centimetre dimensions. The layout streams into the canvas via A2UI v0.9 declarative envelopes.

3. **Drag, rotate, and rearrange — with collision detection** — Move furniture freely. Pieces cannot overlap or block door arcs. Rugs and plants layer underneath collidable furniture. Rotate any piece 90° with one click.

4. **Get shopping suggestions** — Once the layout is ready, receive style-matched product links for every piece via Linkup web search.

---

## LOOP.md

Agent-written iteration log lives at [`LOOP.md`](./LOOP.md). One line per iteration: what was written, what the TestSprite CLI caught, what was fixed.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · React 19 · Tailwind 4 |
| Generative UI | A2UI v0.9 — `createSurface` / `updateComponents` / `updateDataModel` |
| Agent–UI transport | AG-UI via `@ag-ui/client` HttpAgent |
| CopilotKit runtime | `@copilotkit/runtime` + `@copilotkit/react-ui` |
| Agent framework | LangGraph (Python) + FastAPI (`uvicorn`, port 8123) |
| LLM | Gemini Flash via `langchain-google-genai` |
| Drag & resize | `react-rnd` (controlled, position preserved across agent updates) |
| Shopping search | Linkup structured web search |
| Verification | TestSprite CLI |

---

## Getting started

### Prerequisites

- Node 20+ and pnpm 10+
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- Gemini API key — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free)

### Install and run

```bash
git clone https://github.com/mezberg/ai_home_designer.git
cd ai_home_designer

pnpm install

cp .env.example .env
# set GEMINI_API_KEY=<your-key>
# optional: LINKUP_API_KEY=<your-key> for shopping suggestions

pnpm run doctor   # preflight check
pnpm dev          # Next.js (3000) + FastAPI agent (8123)
```

Open [http://localhost:3000](http://localhost:3000).

### Try it

1. Go to **Designer** (`/fixed`)
2. Attach a floor plan image and describe your room:
   > *"My bedroom is ~520×430 cm. Scandinavian feel — king bed, large wardrobe, desk near the window."*
3. Drag furniture around — the agent comments on your moves
4. Ask follow-ups: *"Add a reading chair in the corner."* / *"Rotate the wardrobe."*
5. Click **Find furniture to buy** for shopping links

No API key? Set `OFFLINE=1` in `.env` for a built-in sample layout.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (live mode) | Gemini Flash key |
| `LINKUP_API_KEY` | No | Linkup key for shopping suggestions |
| `OFFLINE` | No | `1` = serve canned sample layout, no API call |

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Boot Next.js + FastAPI agent |
| `pnpm run doctor` | Preflight env check |
| `pnpm typecheck` | TypeScript type check |

---

## License

MIT
