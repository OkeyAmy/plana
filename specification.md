# Specification: A2UI Generative Floorplan Agent

## Goal

Build a working AI agent that takes a floor plan image, calculates a furniture layout, and **acts as a rendering engine** by generating the complete, mathematically accurate SVG code for the room layout, displaying it via A2UI.

---

## Core Principle (The Hackathon Flex)

The frontend contains **zero rendering logic**. No HTML5 Canvas, no complex React state, no drag-and-drop coordinate math.

The backend does all the work. It calculates the layout, builds an exact SVG string, and uses the **A2UI Protocol** to command the frontend: *"Render this SVG blueprint."*

| Responsibility | Owner |
|---|---|
| Understand user request | LLM |
| Choose furniture & placement strategy | LLM |
| Translate strategy → coordinates | Backend code |
| **Generate visual blueprint (SVG)** | **Backend code** |
| Render the visual | Frontend (A2UI Component) |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | CopilotKit (Next.js) + `FloorPlanSVG` A2UI catalog component |
| Protocol | A2UI v0.9 envelopes (`createSurface` → `updateComponents` → `updateDataModel`) |
| Backend | FastAPI + LangGraph |
| LLM | Gemini 3.5 Flash (vision + tool-calling agent) |

---

## Architecture

```
User uploads floor plan image
        ↓
  Gemini 3.5 Flash Vision
  (extracts Scene State JSON from image)
        ↓
  User: "Make this a minimalist bedroom"
        ↓
  LangGraph Agent
    ├── Step 1: Select furniture (bed, desk, wardrobe)
    ├── Step 2: Assign semantic walls (north, south, etc.)
    ├── Step 3: Backend computes precise (x, y) coordinates
    └── Step 4: Backend SVG Engine templates coordinates into <svg> code
        ↓
  Agent emits A2UI v0.9 Envelope
  createSurface → updateComponents({ "FloorPlanSVG", props: { svg: "..." } })
        ↓
  Frontend A2UI catalog component instantly renders the SVG blueprint
```

---

## Part 1: Floor Plan → Base Room State

### Input
User uploads a floor plan image (PNG/JPG).

### Method
Use **Gemini 3.5 Flash vision** with structured output to extract room geometry. No SAM or complex pipelines.

### Output (Internal State)
```json
{
  "room": { "width": 520, "height": 430 },
  "windows": [{ "wall": "north", "start": 150, "end": 300 }],
  "doors": [{ "wall": "west", "offset": 80 }]
}
```

---

## Part 2: Furniture Layout Agent

### Furniture Catalog
Hardcoded dictionary. Dimensions in centimeters.

| Type | Width | Depth |
|---|---|---|
| bed | 160 | 200 |
| wardrobe | 120 | 60 |
| desk | 140 | 70 |

### Agent Workflow

#### Step 1 — Furniture & Strategy Selection
The LLM decides what furniture is needed and assigns a target wall for each.

#### Step 2 — Coordinate Generation
The backend translates the placement strategy into exact `(x, y)` coordinates, applying necessary offsets (e.g., placing the item against the wall).

#### Step 3 — The SVG Rendering Engine (Backend)
Instead of returning JSON state to the frontend, the backend runs a templating function.

The function maps the room dimensions to an SVG `viewBox`. It loops through the placed furniture and creates `<rect>` elements.

**Example SVG Output Generation:**
```python
def generate_svg(scene, furniture_list):
    width = scene["room"]["width"]
    height = scene["room"]["height"]

    svg = f'<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" style="background:#f5f5f5; border: 2px solid #333;">'

    for door in scene["doors"]:
        # draw arc/gap on the wall
        pass

    for f in furniture_list:
        cx = f["x"] - (f["width"] / 2)
        cy = f["y"] - (f["depth"] / 2)
        svg += f'''
        <g transform="rotate({f["rotation"]} {f["x"]} {f["y"]})">
            <rect x="{cx}" y="{cy}" width="{f["width"]}" height="{f["depth"]}" fill="#a3bffa" stroke="#1e40af" stroke-width="2"/>
            <text x="{f["x"]}" y="{f["y"]}" font-size="14" text-anchor="middle" dominant-baseline="middle">{f["type"]}</text>
        </g>
        '''

    svg += '</svg>'
    return svg
```

#### Step 4 — A2UI v0.9 Envelope (Seam #4)
The LangGraph agent emits the SVG via the A2UI catalog protocol — NOT `useRenderToolCall`.

The `FloorPlanSVG` component lives in the shared catalog:
- **Definition** (`src/a2ui/catalog/definitions.ts`): `svg: z.string()`, `title?: z.string()`
- **Renderer** (`src/a2ui/catalog/renderers.tsx`): `dangerouslySetInnerHTML={{ __html: props.svg }}`
- **Prompt mirror** (`agent/src/catalog.py`): one-line summary so the agent knows the component exists

Agent emits:
```python
create_surface(catalog_id=CATALOG_ID)
update_components([{
    "id": "root",
    "type": "FloorPlanSVG",
    "props": {
        "title": "Minimalist Bedroom Layout",
        "svg": svg_string
    }
}])
```

---

## Part 3: The Frontend (A2UI Consumer)

The frontend codebase is radically simplified. There is no Redux state, no canvas lifecycle hooks, and no drag-and-drop math.

A single catalog entry handles all rendering. The renderer:

```tsx
// src/a2ui/catalog/renderers.tsx (added entry)
FloorPlanSVG: ({ svg, title }) => (
  <div className="a2ui-room-card" style={{ background: "var(--card)", borderRadius: "var(--radius-md)", padding: 16 }}>
    {title && <h3 style={{ color: "var(--text-primary)" }}>{title}</h3>}
    <div dangerouslySetInnerHTML={{ __html: svg }} />
  </div>
),
```

---

## Developer Split

| Developer | Focus | Output |
|---|---|---|
| **Dev B** | Questionnaire forms + CopilotKit chat (Seams #2, #3) | Client preferences JSON |
| **Dev A** | Gemini vision extractor + LangGraph layout agent + SVG engine + `FloorPlanSVG` catalog component (Seams #3, #4, #5) | Scene State JSON → SVG via A2UI |

---

## Why This Wins

1. **Maximum A2UI Creativity:** Judges expect A2UI for simple forms or buttons. Generating a full architectural blueprint via A2UI envelopes is wildly unexpected.
2. **Incredible Speed:** Backend SVG templating eliminates 80% of frontend dev time. SVGs scale perfectly and handle rotations natively via `transform`.
3. **Robustness:** No coordinate-syncing bugs. The backend controls the pixels.
4. **Easy Iteration:** User says *"swap the bed for a smaller one"* → backend recalculates, emits a new envelope. Old surface replaced instantly.
