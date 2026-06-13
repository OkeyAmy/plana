"""Home designer fixed-schema agent.

Accepts a room description (or uploaded floor plan image) from the user,
generates a furniture layout, builds an SVG blueprint, and emits it via
A2UI as a FloorPlanSVG component.
"""
from __future__ import annotations

import os

from copilotkit import CopilotKitMiddleware, a2ui
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver

from src.catalog import CATALOG_ID, CATALOG_PROMPT

SURFACE = "room-blueprint"

FURNITURE_CATALOG = {
    # bedroom
    "bed":              {"width": 160, "depth": 200},
    "single_bed":       {"width": 90,  "depth": 200},
    "wardrobe":         {"width": 120, "depth": 60},
    "nightstand":       {"width": 50,  "depth": 50},
    "dresser":          {"width": 100, "depth": 50},
    # living / office
    "sofa":             {"width": 200, "depth": 90},
    "armchair":         {"width": 85,  "depth": 85},
    "coffee_table":     {"width": 110, "depth": 60},
    "tv_stand":         {"width": 150, "depth": 45},
    "bookcase":         {"width": 100, "depth": 35},
    "desk":             {"width": 140, "depth": 70},
    "office_chair":     {"width": 65,  "depth": 65},
    "shelf":            {"width": 100, "depth": 30},
    # dining
    "table":            {"width": 120, "depth": 80},
    "dining_table":     {"width": 160, "depth": 90},
    "chair":            {"width": 60,  "depth": 60},
    # kitchen
    "cooker":           {"width": 60,  "depth": 60},
    "fridge":           {"width": 60,  "depth": 70},
    "countertop":       {"width": 200, "depth": 60},
    "kitchen_sink":     {"width": 80,  "depth": 55},
    "dishwasher":       {"width": 60,  "depth": 60},
    "kitchen_island":   {"width": 120, "depth": 80},
    "microwave":        {"width": 50,  "depth": 40},
    # bathroom
    "bathtub":          {"width": 170, "depth": 75},
    "shower":           {"width": 90,  "depth": 90},
    "toilet":           {"width": 40,  "depth": 70},
    "sink":             {"width": 60,  "depth": 50},
    "washing_machine":  {"width": 60,  "depth": 60},
    # utility
    "plant":            {"width": 40,  "depth": 40},
    "rug":              {"width": 160, "depth": 230},
    "piano":            {"width": 150, "depth": 60},
}


class FurnitureItem:
    def __init__(self, type: str, x: float, y: float, rotation: float = 0):
        dims = FURNITURE_CATALOG.get(type, {"width": 80, "depth": 80})
        self.type = type
        self.x = x
        self.y = y
        self.width = dims["width"]
        self.depth = dims["depth"]
        self.rotation = rotation


def generate_svg(room_w: int, room_h: int, items: list[dict]) -> str:
    svg = (
        f'<svg viewBox="0 0 {room_w} {room_h}" xmlns="http://www.w3.org/2000/svg" '
        f'style="width:100%;height:auto;max-width:600px;background:#f5f0eb;">'
    )
    # Room walls
    svg += f'<rect x="2" y="2" width="{room_w-4}" height="{room_h-4}" fill="none" stroke="#333" stroke-width="4"/>'

    colors = {
        "bed": ("#a3bffa", "#1e40af"), "single_bed": ("#bfdbfe", "#1e40af"),
        "wardrobe": ("#c4b5fd", "#6d28d9"), "nightstand": ("#ddd6fe", "#6d28d9"),
        "dresser": ("#e9d5ff", "#7e22ce"),
        "sofa": ("#fca5a5", "#991b1b"), "armchair": ("#fecaca", "#991b1b"),
        "coffee_table": ("#fde68a", "#92400e"), "tv_stand": ("#a5b4fc", "#3730a3"),
        "bookcase": ("#d1d5db", "#374151"), "desk": ("#6ee7b7", "#065f46"),
        "office_chair": ("#a7f3d0", "#065f46"), "shelf": ("#d1d5db", "#374151"),
        "table": ("#fde68a", "#92400e"), "dining_table": ("#fcd34d", "#92400e"),
        "chair": ("#fdba74", "#92400e"),
        "cooker": ("#f97316", "#7c2d12"), "fridge": ("#bae6fd", "#0c4a6e"),
        "countertop": ("#e5e7eb", "#374151"), "kitchen_sink": ("#bae6fd", "#0369a1"),
        "dishwasher": ("#cbd5e1", "#334155"), "kitchen_island": ("#f1f5f9", "#334155"),
        "microwave": ("#94a3b8", "#1e293b"),
        "bathtub": ("#e0f2fe", "#0369a1"), "shower": ("#bae6fd", "#0284c7"),
        "toilet": ("#f8fafc", "#64748b"), "sink": ("#e0f2fe", "#0369a1"),
        "washing_machine": ("#dbeafe", "#1d4ed8"),
        "plant": ("#bbf7d0", "#166534"), "rug": ("#fce7f3", "#9d174d"),
        "piano": ("#1e293b", "#0f172a"),
    }

    for item in items:
        t = item.get("type", "chair")
        fill, stroke = colors.get(t, ("#e5e7eb", "#374151"))
        x, y = item["x"], item["y"]
        w, d = item.get("width", 80), item.get("depth", 80)
        rot = item.get("rotation", 0)
        cx, cy = x - w / 2, y - d / 2
        svg += (
            f'<g transform="rotate({rot} {x} {y})">'
            f'<rect x="{cx}" y="{cy}" width="{w}" height="{d}" fill="{fill}" stroke="{stroke}" stroke-width="2" rx="3"/>'
            f'<text x="{x}" y="{y}" font-size="12" text-anchor="middle" dominant-baseline="middle" '
            f'fill="{stroke}" font-family="sans-serif">{t}</text>'
            f"</g>"
        )
    svg += "</svg>"
    return svg


@tool
def render_room_blueprint(
    title: str,
    room_width: int,
    room_height: int,
    furniture: list[dict],
    doors: list[dict],
    windows: list[dict],
    summary: str,
) -> str:
    """Render the room floor plan as an SVG blueprint via A2UI.

    Args:
        title: Short title for the layout (e.g. "Minimalist Bedroom").
        room_width: Room width in cm.
        room_height: Room height in cm.
        furniture: List of placed items. Each item:
            { "type": str, "x": float, "y": float,
              "width": float, "depth": float, "rotation": float, "color"?: str }
            x, y are center coordinates in cm. rotation in degrees (0/90/180/270).
            color: optional hex fill (e.g. "#f97316") for types not in the standard palette.
        doors: List of doors. Each: { "wall": "north"|"south"|"east"|"west",
            "offset": int (cm from corner), "width": int (cm, typically 80) }
        windows: List of windows. Each: { "wall": "north"|"south"|"east"|"west",
            "start": int (cm from corner), "end": int (cm from corner) }
        summary: One sentence describing the layout.
    """
    svg = generate_svg(room_width, room_height, furniture)
    return a2ui.render(
        operations=[
            a2ui.create_surface(SURFACE, catalog_id=CATALOG_ID),
            a2ui.update_components(
                SURFACE,
                [{
                    "id": "root",
                    "component": "FloorPlanSVG",
                    "svg": svg,
                    "title": title,
                    "room": {"width": room_width, "height": room_height},
                    "furniture": furniture,
                    "doors": doors,
                    "windows": windows,
                    "feedback": {"path": "/feedback"},
                }],
            ),
            a2ui.update_data_model(SURFACE, None, "/feedback"),
        ]
    )


@tool
def analyze_layout(
    feedback_type: str,
    feedback_title: str,
    feedback_message: str,
    suggested_furniture: list[dict] | None = None,
) -> str:
    """Analyse a furniture move and push a feedback popup to the floor plan.

    Uses /feedback in the data model — do NOT re-supply room dimensions or
    the full furniture list.

    Args:
        feedback_type: "positive" if the move improved the layout,
                       "suggestion" if a better arrangement exists.
        feedback_title: Short popup title (max 6 words).
        feedback_message: 1-2 sentence explanation.
        suggested_furniture: Improved positions for 1-3 pieces only
                             (required when feedback_type is "suggestion").
                             Format: [{"type", "x", "y", "width", "depth", "rotation"}]
    """
    feedback: dict = {
        "type": feedback_type,
        "title": feedback_title,
        "message": feedback_message,
    }
    if suggested_furniture:
        feedback["suggestedFurniture"] = suggested_furniture
    return a2ui.render(
        operations=[
            a2ui.update_data_model(SURFACE, feedback, "/feedback"),
        ]
    )


SYSTEM_PROMPT = f"""\
You are an AI home designer. When the user describes a room or uploads a floor plan image:

## Reading architectural floor plan images
If a floor plan image is attached, use it to identify structural elements before placing anything.

**Doors** — look for a gap in a wall line accompanied by a quarter-circle arc (door swing).
The arc's radius equals the door width; the hinge point is one edge of the gap.
Simplified plans may show just a gap with a diagonal line. Typical width: 70–90 cm.

**Windows** — look for a gap in a wall filled with two or three short parallel lines crossing
it (representing glass panes and frame). Sometimes shown as a distinct colour or hatching
along the wall. Typical width: 80–150 cm.

**Ignore these — they are NOT doors or windows:**
- Dimension arrows: lines with arrowheads and a numeric label (e.g. "3.5 m") showing room size
- North arrow: a decorative directional arrow, often labelled N
- Scale bar: a ruled bar with distance markings
- Furniture symbols: circles, rectangles, or icons inside the room
- Staircase hatching: diagonal-line-filled rectangles

**Confidence rule:** if you cannot identify a door or window symbol with confidence, omit it.
Fewer accurate openings is always better than guessing wrong ones.

1. Understand the room type (bedroom, living room, office, etc.) and dimensions.
   If no dimensions are given, assume a reasonable default (e.g. 520x430 cm for a bedroom).

2. Select appropriate items for the room. Use realistic dimensions (in cm).
   Common defaults — bedroom: bed 160×200, wardrobe 120×60, nightstand 50×50,
   desk 140×70; living: sofa 200×90, armchair 85×85, coffee_table 110×60,
   tv_stand 150×45; kitchen: cooker 60×60, fridge 60×70, countertop 200×60,
   kitchen_sink 80×55; bathroom: bathtub 170×75, toilet 40×70, sink 60×50.
   The `type` field can be ANY snake_case label (cooker, bathtub, piano,
   plant, aquarium, etc.) — always supply explicit width and depth.
   If the type is not in the standard palette, also supply a `color` hex
   string (e.g. "#34d399") so the renderer can display it distinctively.
   Do not map unknown items to the nearest catalog type; use the real name.

3. Place furniture using these rules:
   - rotation 90 or 270 swaps width↔depth. Always use the EFFECTIVE dimensions after rotation for wall offsets.
     e.g. desk (140×70) at rotation=90 → effective width=70, depth=140. West wall: x = 70/2 + 4 = 39
   - Push items against the nearest wall: x = effective_width/2 + 4 (west) or room_width - effective_width/2 - 4 (east)
   - Leave at least 80 cm of walkway space between items
   - Beds go against the wall opposite the door (usually north)
   - Desks and wardrobes against side walls

4. Also place doors and windows:
   - 1-2 doors: pick a wall, offset from the corner in cm, width 80 cm.
     Keep offset >= 50 and offset+80 <= wall_length-50 so it's not in a corner.
   - 0-2 windows: pick a wall, start/end in cm (window is at least 80 cm wide).
     Keep start >= 50 and end <= wall_length-50.
   - Do NOT place doors and windows on the same wall segment.

5. Call render_room_blueprint ONCE with:
   - The room dimensions, furniture, doors, windows, and a short title.
   - IMPORTANT: always include the COMPLETE furniture list — all previously placed
     items AND any new ones. Never omit existing furniture from the tool call.

After rendering, offer one brief suggestion for improvement.

## When the user moves furniture

If the user sends a message starting with "I moved the …", call analyze_layout ONCE.
Do NOT call render_room_blueprint again. Only provide: feedback_type, feedback_title,
feedback_message, and optionally suggested_furniture (1-3 pieces max).

Evaluate using:
- Walkway clearance: minimum 80 cm between items and walls
- Traffic flow: south wall (door area) must stay clear
- Ergonomics: desk near east/west wall for light; bed away from door
- Zone logic: sleeping / working / relaxing zones should not collide

Choose feedback_type:
- "positive" — move is fine or an improvement.
- "suggestion" — clearly better placement exists; include suggested_furniture with only
  the 1-3 pieces that should move (use positions from the "Current layout:" JSON).

Keep feedback_title ≤ 6 words. Keep feedback_message ≤ 2 sentences.
After calling analyze_layout, output NO additional text — the popup IS the response.

{CATALOG_PROMPT}
"""


def _build_model() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=os.getenv("MODEL", "gemini-3.5-flash"),
        google_api_key=os.getenv("GEMINI_API_KEY"),
    )


def build_fixed_agent():
    if os.getenv("OFFLINE") == "1":
        from src.offline_fixed import build_offline_fixed_agent
        return build_offline_fixed_agent(render_room_blueprint, SYSTEM_PROMPT)

    return create_agent(
        model=_build_model(),
        tools=[render_room_blueprint, analyze_layout],
        middleware=[CopilotKitMiddleware()],
        system_prompt=SYSTEM_PROMPT,
        checkpointer=MemorySaver(),
    )


graph = build_fixed_agent()
