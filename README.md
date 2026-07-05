# Plana

Plana is an AI interior layout assistant for turning a room description or floor-plan image into an editable, to-scale furniture plan. It combines a Next.js canvas, a Python LangGraph agent, CopilotKit runtime transport, and A2UI surfaces so the AI output is not just text: it becomes an interactive floor plan you can inspect, move, rotate, and refine.

The project is built for the **TestSprite Hackathon Season 3** CLI Launch & Loop Engineering track.

**Repository:** https://github.com/OkeyAmy/plana

## What Plana Does

- Generates room layouts from natural language prompts such as “design a 520 x 430 cm Scandinavian bedroom with a king bed, wardrobe, and desk near the window.”
- Reads floor-plan images well enough to reason about walls, door swing arcs, windows, dimension labels, and usable circulation zones.
- Renders a real A2UI floor-plan surface with room dimensions, furniture dimensions, doors, windows, and a generated SVG blueprint.
- Lets users drag and rotate furniture while preserving layout state in the canvas.
- Gives AI feedback after furniture moves, including collision, walkway, door-swing, and ergonomic suggestions.
- Supports offline demo mode for the fixed layout path when an API key is not available.
- Includes optional Linkup-powered furniture search hooks for shopping suggestions.

## Architecture

| Layer | Implementation |
| --- | --- |
| Web app | Next.js 16, React 19, Tailwind 4 |
| AI runtime | CopilotKit Runtime v2 with AG-UI HTTP agents |
| Agent server | FastAPI on port `8123` |
| Agent graph | LangGraph Python agents |
| LLM provider | Gemini via `langchain-google-genai` |
| Generative UI | A2UI v0.9 operations rendered in the Plana canvas |
| Layout surface | Custom `FloorPlanSVG` catalog component |
| Verification | TypeScript typecheck, doctor script, smoke tooling |

The frontend talks to `/api/copilotkit-plana`, which proxies two FastAPI agent endpoints:

- `/fixed` generates the room blueprint surface.
- `/dynamic` generates follow-up A2UI surfaces.

## Getting Started

### Requirements

- Node.js 20+
- pnpm 10+
- Python 3.12+
- `uv`
- Gemini API key from https://aistudio.google.com/apikey

### Install

```bash
git clone https://github.com/OkeyAmy/ai_home_designer.git
cd ai_home_designer
pnpm install
```

Create your environment file:

```bash
cp .env.example .env
```

Set at least:

```bash
GEMINI_API_KEY=your_key_here
```

Optional:

```bash
LINKUP_API_KEY=your_key_here
OFFLINE=1
```

`OFFLINE=1` makes the fixed Plana agent return a built-in sample layout without calling Gemini. The dynamic agent still requires a Gemini key.

### Run

```bash
pnpm run doctor
pnpm dev
```

Open http://localhost:3000.

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Plana landing and product overview |
| `/fixed` | Main room designer workspace |
| `/dynamic` | Dynamic A2UI follow-up surface workspace |
| `/catalog` | Plana A2UI component catalog preview |
| `/api/copilotkit-plana` | CopilotKit runtime route for the Plana agents |

## How To Use It

1. Open `/fixed`.
2. Describe the room, including dimensions, room type, style, and must-have furniture.
3. Attach a floor-plan image if available.
4. Wait for Plana to render the interactive blueprint.
5. Drag or rotate furniture in the canvas.
6. Ask Plana to add, remove, resize, or reposition items.
7. Use the shopping action when you want product options for a furniture piece.

Good prompt example:

```text
Design a 520 x 430 cm bedroom with a warm minimalist style. Add a queen bed,
two nightstands, a wardrobe, a desk near the window, a rug, and one plant.
Keep the south door swing clear and leave an 80 cm walkway.
```

## Important Files

| Path | Purpose |
| --- | --- |
| `agent/src/fixed_agent.py` | Main Plana room-design agent and design-generation prompt |
| `agent/src/dynamic_agent.py` | Secondary agent for dynamic A2UI surfaces |
| `agent/main.py` | FastAPI server exposing `/fixed` and `/dynamic` |
| `src/app/(plana)/fixed/page.tsx` | Main designer route |
| `src/components/plana/SurfaceCanvas.tsx` | Canvas that renders the A2UI floor-plan surface |
| `src/a2ui/catalog/` | Frontend A2UI component definitions and renderers |
| `agent/src/catalog.py` | Python mirror of the A2UI catalog |
| `src/app/api/copilotkit-plana/route.ts` | Runtime bridge from Next.js to the Plana agents |

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the Next.js app and FastAPI agent together |
| `pnpm dev:ui` | Run only the Next.js app |
| `pnpm dev:agent` | Run only the Python agent server |
| `pnpm run doctor` | Check local setup and required environment |
| `pnpm typecheck` | Run TypeScript validation |
| `pnpm smoke` | Run the repo smoke checks |
| `pnpm validate-widget <path>` | Validate A2UI widget fixture shape |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes for live AI | Gemini key used by the Plana agents |
| `MODEL` | No | Override the default Gemini model |
| `FIXED_AGENT_URL` | No | Defaults to `http://localhost:8123/fixed` |
| `DYNAMIC_AGENT_URL` | No | Defaults to `http://localhost:8123/dynamic` |
| `LINKUP_API_KEY` | No | Enables furniture-shopping search |
| `OFFLINE` | No | `1` enables the fixed-agent offline sample |

## Verification

Before shipping changes, run:

```bash
pnpm run doctor
pnpm typecheck
```

For broader checks:

```bash
pnpm smoke
```

## License

MIT
