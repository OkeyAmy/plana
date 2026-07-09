# Plana

> **Describe a Room. Get a Blueprint You Can Move.**

Plana is an AI interior layout assistant. It is designed to turn a natural-language room description or floor-plan image into an editable, to-scale interactive furniture blueprint — so the AI output isn't just text, it's a live floor plan where you drag, rotate, and refine every piece of furniture while Plana gives real-time feedback on walkway clearance, door-swing arcs, and ergonomics.

Built for the **TestSprite Hackathon Season 3** — CLI Launch & Loop Engineering track.

---

## Demo

[![Plana Demo](https://img.youtube.com/vi/tvFLXt2lMeM/maxresdefault.jpg)](https://youtu.be/tvFLXt2lMeM)

**[Watch the full demo →](https://youtu.be/tvFLXt2lMeM)**

---

## Links

| | |
|---|---|
| **Live app** | https://plana-fl0t.onrender.com/ |
| **Repository** | https://github.com/OkeyAmy/plana |
| **TestSprite FE project** | `b298bfd7-93c5-4774-8973-327faf5af513` |
| **TestSprite BE project** | `956f829e-873c-4499-8709-eff18779deb3` |

---

## What Plana Does

- Generates room layouts from natural language — e.g. *"Design a 520 × 430 cm Scandinavian bedroom with a king bed, wardrobe, and desk near the window."*
- Reads floor-plan images and reasons about walls, door-swing arcs, windows, dimension labels, and usable circulation zones.
- Renders an interactive A2UI floor-plan surface with real room dimensions, furniture dimensions, doors, windows, and a generated SVG blueprint.
- Lets you drag and rotate furniture while preserving layout state in the canvas.
- Gives AI feedback after furniture moves — collision detection, walkway clearance, door-swing, and ergonomic suggestions.
- Supports offline demo mode when a Gemini API key is not available.
- Optional Linkup-powered furniture search for shopping suggestions.

---

## Architecture

| Layer | Implementation |
|---|---|
| Web app | Next.js 16, React 19, Tailwind 4 |
| AI runtime | CopilotKit Runtime v2 with AG-UI HTTP agents |
| Agent server | FastAPI on port `8123` |
| Agent graph | LangGraph Python agents |
| LLM provider | Gemini via `langchain-google-genai` |
| Generative UI | A2UI v0.9 operations rendered in the Plana canvas |
| Layout surface | Custom `FloorPlanSVG` catalog component |

The frontend talks to `/api/copilotkit-plana`, which proxies two FastAPI agent endpoints:

- `/fixed` — generates the room blueprint surface
- `/dynamic` — generates follow-up A2UI surfaces

---

## Getting Started

### Requirements

- Node.js 20+
- pnpm 10+
- Python 3.12+
- `uv`
- Gemini API key from https://aistudio.google.com/apikey

### Install

```bash
git clone https://github.com/OkeyAmy/plana.git
cd plana
pnpm install
```

Create your environment file:

```bash
cp .env.example .env
```

Set at least:

```env
GEMINI_API_KEY=your_key_here
```

Optional:

```env
LINKUP_API_KEY=your_key_here
OFFLINE=1   # use built-in sample layout without calling Gemini
```

### Run

```bash
pnpm run doctor
pnpm dev
```

Open http://localhost:3000.

---

## How To Use It

1. Open `/fixed`.
2. Describe the room — dimensions, room type, style, and must-have furniture.
3. Attach a floor-plan image if available.
4. Wait for Plana to render the interactive blueprint.
5. Drag or rotate furniture in the canvas.
6. Ask Plana to add, remove, resize, or reposition items.
7. Use the shopping action for product options on any furniture piece.

**Good prompt example:**

```
Design a 520 x 430 cm bedroom with a warm minimalist style. Add a queen bed,
two nightstands, a wardrobe, a desk near the window, a rug, and one plant.
Keep the south door swing clear and leave an 80 cm walkway.
```

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing and product overview |
| `/fixed` | Main room designer workspace |
| `/dynamic` | Dynamic A2UI follow-up surface |
| `/catalog` | A2UI component catalog preview |
| `/api/copilotkit-plana` | CopilotKit runtime route |

---

## Important Files

| Path | Purpose |
|---|---|
| `agent/src/fixed_agent.py` | Main room-design agent and generation prompt |
| `agent/src/dynamic_agent.py` | Secondary agent for dynamic A2UI surfaces |
| `agent/main.py` | FastAPI server exposing `/fixed` and `/dynamic` |
| `src/app/(plana)/fixed/page.tsx` | Main designer route |
| `src/components/plana/SurfaceCanvas.tsx` | Canvas that renders the A2UI floor-plan surface |
| `src/a2ui/catalog/` | Frontend A2UI component definitions and renderers |
| `agent/src/catalog.py` | Python mirror of the A2UI catalog |
| `src/app/api/copilotkit-plana/route.ts` | Runtime bridge from Next.js to the agents |

---

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Run the Next.js app and FastAPI agent together |
| `pnpm dev:ui` | Run only the Next.js app |
| `pnpm dev:agent` | Run only the Python agent server |
| `pnpm run doctor` | Check local setup and required environment |
| `pnpm typecheck` | Run TypeScript validation |
| `pnpm smoke` | Run repo smoke checks |
| `pnpm validate-widget <path>` | Validate A2UI widget fixture shape |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for live AI) | Gemini key used by the Plana agents |
| `MODEL` | No | Override the default Gemini model |
| `FIXED_AGENT_URL` | No | Defaults to `http://localhost:8123/fixed` |
| `DYNAMIC_AGENT_URL` | No | Defaults to `http://localhost:8123/dynamic` |
| `LINKUP_API_KEY` | No | Enables furniture-shopping search |
| `OFFLINE` | No | `1` enables the fixed-agent offline sample |

---

## TestSprite Coverage

The CI wires TestSprite against the live Render deployment on every push to `main`. The suite covers:

**Frontend (12 tests)**
- Landing page hero, CTAs, feature sections, and verification-loop copy
- Navigation from home into the room designer workspace
- `/fixed` room-designer shell, text-prompt layout generation, and follow-up revision flow
- `/catalog` component inventory, counts, and category filters
- `/dynamic` workspace shell and canvas empty state
- Split-pane resize behavior and deep-link routing across `/`, `/fixed`, `/dynamic`, and `/catalog`

**Backend (3 tests)**
- Home route and designer route API contracts
- Furniture-search endpoint

**Latest run:** 12/12 FE · 3/3 BE — all passing

`LOOP.md` records the agent-written build/test/fix loop, one line per iteration.

---

## Verification

```bash
pnpm run doctor
pnpm typecheck
pnpm smoke
```

---

## License

MIT
