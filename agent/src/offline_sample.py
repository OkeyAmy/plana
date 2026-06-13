"""Canned floor plan for OFFLINE=1 mode.

Passed verbatim to render_room_blueprint(**OFFLINE_BLUEPRINT_ARGS).
"""
from __future__ import annotations

from typing import Any

OFFLINE_BLUEPRINT_ARGS: dict[str, Any] = {
    "title": "Minimalist Bedroom Layout",
    "room_width": 520,
    "room_height": 430,
    "furniture": [
        {"type": "bed",      "x": 260, "y": 110, "width": 160, "depth": 200, "rotation": 0},
        {"type": "wardrobe", "x": 64,  "y": 320, "width": 120, "depth": 60,  "rotation": 0},
        {"type": "desk",     "x": 450, "y": 250, "width": 140, "depth": 70,  "rotation": 90},
    ],
    "summary": "A clean bedroom with bed on the north wall, wardrobe on the west, and desk on the east.",
}
