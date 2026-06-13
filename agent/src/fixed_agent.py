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
    "bed":      {"width": 160, "depth": 200},
    "wardrobe": {"width": 120, "depth": 60},
    "desk":     {"width": 140, "depth": 70},
    "sofa":     {"width": 200, "depth": 90},
    "table":    {"width": 120, "depth": 80},
    "chair":    {"width": 60,  "depth": 60},
    "shelf":    {"width": 100, "depth": 30},
    "tv_stand": {"width": 150, "depth": 45},
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
        "bed": ("#a3bffa", "#1e40af"),
        "wardrobe": ("#c4b5fd", "#6d28d9"),
        "desk": ("#6ee7b7", "#065f46"),
        "sofa": ("#fca5a5", "#991b1b"),
        "table": ("#fde68a", "#92400e"),
        "chair": ("#fdba74", "#92400e"),
        "shelf": ("#d1d5db", "#374151"),
        "tv_stand": ("#a5b4fc", "#3730a3"),
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
              "width": float, "depth": float, "rotation": float }
            x, y are center coordinates in cm. rotation in degrees (0/90/180/270).
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
                }],
            ),
        ]
    )


SYSTEM_PROMPT = f"""\
You are an AI home designer. When the user describes a room or uploads a floor plan image:

1. Understand the room type (bedroom, living room, office, etc.) and dimensions.
   If no dimensions are given, assume a reasonable default (e.g. 520x430 cm for a bedroom).

2. Select 3-6 appropriate furniture items from this catalog:
   bed (160x200), wardrobe (120x60), desk (140x70), sofa (200x90),
   table (120x80), chair (60x60), shelf (100x30), tv_stand (150x45)

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
        tools=[render_room_blueprint],
        middleware=[CopilotKitMiddleware()],
        system_prompt=SYSTEM_PROMPT,
        checkpointer=MemorySaver(),
    )


graph = build_fixed_agent()
