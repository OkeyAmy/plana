# AI Home Designer

An AI-powered interior design tool built at the **London A2A & A2UI Hackathon** (Google London CSG, June 2026). Upload a floor plan image and describe your room — the agent generates a pixel-perfect, to-scale interactive layout using **A2UI generative UI**, lets you drag furniture around with real collision detection, and gives you live layout feedback via **AG-UI**. When you're happy with the layout, get style-matched shopping suggestions powered by **Linkup**.

---

## What it does

1. **Upload a floor plan + describe your room** — Attach a floor plan image and type your preferences (style, room type, must-have furniture). The agent reads architectural symbols: door swing arcs, window parallel lines, wall dimensions.

2. **AI generates a to-scale interactive floor plan** — Every piece of furniture is placed with real centimetre dimensions. The layout streams into the canvas via **A2UI v0.9** declarative envelopes — no hallucinated sizes, no generic stock images.

3. **Drag, rotate, and rearrange — with collision detection** — Move furniture freely. Pieces cannot overlap each other or block door swing zones. Rugs and plants layer underneath collidable furniture. Rotate any piece 90° with a single click. The agent watches your moves via **AG-UI** and comments on flow, natural light, and clearance.

4. **Get shopping suggestions** — Once the layout is ready, receive style-matched product links for every piece powered by **Linkup** web search.

---

## Key features

| Feature | Detail |
|---|---|
| Floor plan image reading | Detects door arcs, window lines, wall dimensions from uploaded images |
| A2UI generative UI | Agent streams a full interactive floor plan as declarative JSON — rendered live in React |
| AG-UI real-time feedback | Agent reacts to furniture moves with layout suggestions (clearance, light, traffic flow) |
| Collision detection | Furniture pieces cannot overlap; door swing zones are blocked |
| Collidable flag | Rugs, mats, and plants are non-collidable — other items can be placed on top |
| Rotate with one click | ↻ button rotates any piece 90°; effective dimensions update automatically |
| Smart merge | When the agent updates the layout, user-dragged positions are preserved |
| Red flash on blocked move | Colliding item flashes red for 1 second so the user knows immediately |
| Custom furniture | LLM can generate any furniture type by name (aquarium, piano, etc.) with a custom hex colour |
| Shopping suggestions | Style-matched product recommendations with buy links via Linkup |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · React 19 · Tailwind 4 |
| Generative UI protocol | [A2UI v0.9](https://a2ui.org/) — agent emits `createSurface` / `updateComponents` / `updateDataModel` envelopes |
| Agent–UI transport | [AG-UI](https://docs.ag-ui.com/) via `@ag-ui/client` `HttpAgent` |
| CopilotKit runtime | `@copilotkit/runtime` + `@copilotkit/react-ui` (chat, surface renderer) |
| Agent framework | [LangGraph (Python)](https://langchain-ai.github.io/langgraph/) served by FastAPI (`uvicorn`, port 8123) |
| LLM | Gemini 3.5 Flash via `langchain-google-genai` (native SDK — required for thought-signature replay) |
| Drag & resize | `react-rnd` (controlled component, position preserved across agent updates) |
| Shopping search | [Linkup](https://www.linkup.so/) structured web search |

---

## Architecture

```
Browser
 ├── Next.js 16 app (src/app/)
 │    ├── /           → home / pitch page
 │    └── /fixed      → interactive designer workspace
 │         ├── CopilotKit chat panel (AG-UI transport)
 │         └── SurfaceCanvas → A2UI renderer → FloorPlanSVG component
 │
 └── FastAPI agent server (agent/, port 8123)
      ├── POST /fixed   → fixed_agent (LangGraph)
      │    ├── tool: render_room_blueprint  → emits A2UI surface
      │    └── tool: analyze_layout        → emits feedback popup via data model
      └── POST /dynamic → dynamic_agent (LangGraph)
           └── tool: generate_a2ui         → secondary LLM invents component tree
```

**A2UI flow:**
1. Agent calls `render_room_blueprint` with room dimensions, furniture list, doors, windows
2. Tool wraps data into `create_surface` + `update_components` + `update_data_model` operations
3. AG-UI transport carries the envelope to the Next.js runtime
4. `@copilotkit/a2ui-renderer` materialises the envelope into the `FloorPlanSVG` React component
5. `FloorPlanSVG` renders `react-rnd` draggable boxes on top of an SVG wall/door/window layer

**AG-UI feedback flow:**
1. User moves furniture → frontend sends `"I moved the [item] to [position]"` message
2. Agent calls `analyze_layout` (never re-renders the whole floor plan)
3. Tool pushes a feedback object to `/feedback` in the A2UI data model
4. `FloorPlanSVG` reads the data model binding and shows a popup with type (`positive` or `suggestion`)

---

## Project structure

```
.
├── src/
│   ├── app/(pdf)/              # Next.js route group
│   │   ├── page.tsx            # Home / pitch page
│   │   ├── fixed/page.tsx      # Designer workspace (main demo)
│   │   └── pdf-analyst.css     # Brand tokens (Seam #1)
│   ├── a2ui/
│   │   ├── catalog/
│   │   │   ├── definitions.ts  # 21-component Zod prop schemas (Seam #4)
│   │   │   └── renderers.tsx   # React renderers incl. FloorPlanSVG (Seam #4)
│   │   └── theme.css           # A2UI surface design tokens (Seam #1)
│   └── components/pdf-analyst/
│       └── Brand.tsx           # Logo, SiteNav, WorkspaceHeader (Seam #2)
│
└── agent/
    ├── main.py                 # FastAPI app, exposes /fixed /dynamic /legal
    └── src/
        ├── fixed_agent.py      # Home designer agent + render_room_blueprint tool (Seam #5)
        ├── dynamic_agent.py    # Dynamic A2UI Q&A agent (Seam #5)
        ├── pdf_tools.py        # PDF → structured data extractor
        ├── catalog.py          # Python mirror of the A2UI catalog prompt (Seam #4)
        └── offline_sample.py   # Canned sample for OFFLINE=1 mode
```

---

## Getting started

### Prerequisites

- Node 20+ and pnpm 10+
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- A free Gemini API key — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (no credit card)

### Install and run

```bash
git clone https://github.com/mezberg/ai_home_designer.git
cd ai_home_designer

pnpm install           # installs JS deps + runs uv sync for the Python agent

cp .env.example .env
# open .env and set GEMINI_API_KEY=<your-key>
# optionally set LINKUP_API_KEY=<your-key> for shopping suggestions

pnpm run doctor        # preflight check: Node, pnpm, Python, uv, env vars, ports
pnpm dev               # boots Next.js (port 3000) + FastAPI agent (port 8123)
```

Open [http://localhost:3000](http://localhost:3000).

### Try the designer

1. Go to **Design Room** (`/fixed`)
2. Attach a floor plan image in the chat and describe your room:
   > *"This is my bedroom floor plan, ~520×430 cm. I want a minimalist Scandinavian feel with a king bed, a large wardrobe, and a desk near the window."*
3. The agent generates the interactive floor plan with doors, windows, and furniture placed to scale
4. Drag furniture around — the agent comments on your moves
5. Ask follow-up questions:
   > *"Add a reading armchair in the corner."*
   > *"Rotate the wardrobe."*
6. Click **Find furniture to buy** to get shopping suggestions

### No Gemini key?

Set `OFFLINE=1` in `.env` — the `/fixed` endpoint serves a built-in sample layout with no API call.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (live mode) | Gemini 3.5 Flash API key — [get one free](https://aistudio.google.com/apikey) |
| `LINKUP_API_KEY` | No | Linkup web search key for shopping suggestions — [linkup.so](https://www.linkup.so/) |
| `OFFLINE` | No | Set to `1` to skip Gemini calls and serve a canned sample layout |
| `MODEL` | No | Override the Gemini model ID (default: `gemini-3.5-flash`) |
| `FIXED_AGENT_URL` | No | Override the fixed agent URL (default: `http://localhost:8123/fixed`) |

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Boot Next.js + FastAPI agent concurrently |
| `pnpm run doctor` | Preflight env check (Node, pnpm, Python, uv, env vars, ports) |
| `pnpm smoke` | Composite gate: validators + pin check + offline probe |
| `pnpm typecheck` | TypeScript type check |
| `pnpm validate-widget <path>` | Validate a widget JSON against A2UI v0.9 |

---

## Built at

**London A2A & A2UI Hackathon** · Google London CSG · June 13, 2026  
Organised by Google Cloud, [A2A Net](https://a2anet.com/), [CopilotKit](https://copilotkit.ai), [Linkup](https://www.linkup.so/), and [Redis](https://redis.io/iris/).

## License

MIT
