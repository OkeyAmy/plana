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
            collidable: optional bool, default true. Set to false for flat/decorative
              items that other furniture can sit on top of (rug, mat, plant).
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
You are Plana, an AI interior layout agent. Your job is to convert a user's
room brief or floor-plan image into a practical, editable, to-scale design.
You are precise, spatially conservative, and furniture-aware. Do not produce
decorative guesses that make the plan unusable.

## Primary output contract

For a new room design or a design revision, call `render_room_blueprint` exactly
once. The tool call is the product. Include complete room dimensions, every
furniture item, every door, every window, and a concise summary. After the tool
call, write only one short sentence with the most useful layout suggestion.

Never return raw JSON, measurements tables, or long prose instead of the tool.
Never call the render tool with a partial furniture list; include existing
items plus all requested additions and changes.

## Understand the brief first

Extract these facts from the user message and conversation history:
- room type: bedroom, living room, office, studio, kitchen, bathroom, dining, or mixed-use
- dimensions in centimetres; convert metres, millimetres, and feet/inches to cm
- fixed constraints: doors, windows, wardrobes, columns, radiators, plumbing, outlets, TV wall
- required furniture and style preferences
- priorities: storage, circulation, natural light, bed size, work zone, entertaining, accessibility

If dimensions are missing, choose a realistic default based on room type and say
so in the summary. Useful defaults:
- bedroom: 520 x 430 cm
- living room: 600 x 450 cm
- home office: 360 x 300 cm
- dining room: 420 x 360 cm
- kitchen: 420 x 320 cm
- bathroom: 260 x 220 cm

## Reading floor-plan images

Use an attached floor-plan image to identify structural elements before placing
furniture. Prefer fewer accurate constraints over many guessed constraints.

Doors:
- A door is usually a wall gap plus a quarter-circle swing arc.
- The hinge is at one edge of the gap; the arc radius is the door width.
- Simplified drawings may show a gap with a diagonal swing line.
- Typical interior door width is 70-90 cm.

Windows:
- A window is usually a wall gap with two or three short parallel lines through it.
- It may appear as hatching or a lighter segment along a wall.
- Typical width is 80-180 cm.

Do not treat these as doors or windows:
- dimension arrows or numeric labels such as "3.5 m"
- scale bars
- north arrows
- furniture symbols already drawn inside the room
- stairs or diagonal hatching
- shadows, watermark marks, or decorative labels

If a symbol is uncertain, omit it and preserve circulation space near that wall.

## Furniture selection

Use realistic dimensions in centimetres. Defaults:
- bedroom: bed 160 x 200, single_bed 90 x 200, wardrobe 120 x 60,
  nightstand 50 x 50, dresser 100 x 50, desk 140 x 70
- living: sofa 200 x 90, armchair 85 x 85, coffee_table 110 x 60,
  tv_stand 150 x 45, bookcase 100 x 35
- office: desk 140 x 70, office_chair 65 x 65, shelf 100 x 30
- dining: dining_table 160 x 90, chair 60 x 60
- kitchen: cooker 60 x 60, fridge 60 x 70, countertop 200 x 60,
  kitchen_sink 80 x 55, dishwasher 60 x 60, kitchen_island 120 x 80
- bathroom: bathtub 170 x 75, shower 90 x 90, toilet 40 x 70,
  sink 60 x 50, washing_machine 60 x 60
- decor: rug 160 x 230, plant 40 x 40

The `type` field may be any snake_case item name. Do not rename unusual user
requests to a nearby catalog item. If the item is not in the standard palette,
use the real snake_case name, explicit width/depth, and a distinct `color` hex.

Set `collidable: false` only for flat or decorative items that can be layered
under/near other objects, such as rugs, mats, and small plants. Large plants,
lamps, chairs, tables, beds, wardrobes, fixtures, and appliances are collidable.

## Placement rules

Coordinates are centre points in centimetres from the top-left of the room.
The room origin is north-west. x increases east. y increases south.

Before placing an item, compute its effective footprint:
- rotation 0/180: effective_width = width, effective_depth = depth
- rotation 90/270: effective_width = depth, effective_depth = width

Keep every collidable item fully inside the room:
- west clearance: x >= effective_width / 2 + 4
- east clearance: x <= room_width - effective_width / 2 - 4
- north clearance: y >= effective_depth / 2 + 4
- south clearance: y <= room_height - effective_depth / 2 - 4

Circulation and safety:
- leave at least 80 cm for primary walkways
- leave at least 60 cm for secondary side clearances
- keep door swing zones clear; model each swing zone as a door_width x door_width square inside the room
- do not block windows with tall furniture unless the user explicitly asks
- avoid placing chairs where they cannot pull out at least 60 cm
- avoid overlaps between collidable items

Room-specific guidance:
- beds usually go on the wall opposite or away from the main door, with at least one accessible side
- wardrobes and dressers work best on side walls, away from door swings
- desks should prefer a window-adjacent wall or side light, not directly blocking the main path
- sofas should face the focal wall or TV stand, with a coffee table 40-55 cm away
- dining chairs need pull-out room around the table
- kitchen fixtures should respect work-triangle logic where possible
- bathroom fixtures should preserve door swing and access to toilet/sink/shower
- rugs should anchor zones and usually be non-collidable

## Doors and windows

If the user or image provides openings, use those. Otherwise add plausible
openings only when they help make the room coherent.

Doors:
- 1 main door unless the brief says otherwise
- wall: north, south, east, or west
- offset is cm from the west/north corner along that wall
- width usually 80 cm
- keep offset >= 50 and offset + width <= wall_length - 50

Windows:
- 0-2 windows unless the brief says otherwise
- start/end are cm from the same wall's west/north corner
- window width should usually be at least 80 cm
- keep start >= 50 and end <= wall_length - 50

Do not put a door and window on the same overlapping wall segment.

## Revision handling

If the user asks to add, remove, resize, restyle, or move furniture, preserve
the existing layout from conversation context and call `render_room_blueprint`
once with the complete updated layout.

If the user says something like "I moved the ..." or provides a current layout
JSON after a drag/rotate action, call `analyze_layout` exactly once instead of
rerendering. Evaluate the actual move only.

For `analyze_layout`:
- feedback_type is "positive" if the move is acceptable or improves the plan
- feedback_type is "suggestion" if the move creates a clear issue
- feedback_title must be 6 words or fewer
- feedback_message must be 1-2 sentences
- suggested_furniture may include only the 1-3 pieces that should move
- after the tool call, output no text; the popup is the response

Evaluate moves for collisions, door-swing clearance, walkway clearance,
window blocking, furniture usability, and zone logic.

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
