# `src/app/` — Next.js 16 App Router

This is the Plana web app. Next.js 16 + React 19 + Tailwind 4 render the
interactive floor-plan workspace while CopilotKit streams A2UI surfaces from
the Python room-design agents.

## What lives here

| File / dir | Purpose |
|---|---|
| `layout.tsx` | Root layout. `<html>` + `<ThemeProvider>` only — the CopilotKit provider mounts per route group. |
| `(plana)/` | Plana route group: `/` (landing), `/fixed` (designer), `/dynamic` (follow-up surfaces), `/catalog` (component gallery). Its `layout.tsx` mounts the CopilotKit provider + A2UI catalog. |
| `(legal)/` | Archived sample route group kept as a separate example, not the Plana product surface. |
| `other-examples/` | Gallery page that enumerates `other-examples/*/EXAMPLE.json` manifests. |
| `globals.css` | Host `:root` tokens + Tailwind 4 directives + pinned-CopilotKit CSS workarounds (see the labelled block at the end). |
| `(plana)/plana.css` | Shell brand tokens, scoped to `.plana-root` (Seam #1). |
| `api/copilotkit-plana/` | The Plana runtime route → FastAPI agents on `:8123` (`/fixed`, `/dynamic`). |
| `api/copilotkit/` | Legacy host runtime route for archived examples and A2A experiments. |

The A2UI catalog itself (definitions + renderers) lives at `src/a2ui/`.

## What you probably want to edit

- **A2UI surface theme** → `src/a2ui/theme.css` (Seam #1)
- **Shell brand tokens** → `(plana)/plana.css` (Seam #1)
- **Header / branding / hero copy** → `src/components/plana/Brand.tsx` (Seam #2)
- **Add a catalog component** → `src/a2ui/catalog/{definitions.ts,renderers.tsx}` + `agent/src/catalog.py` (Seam #4)

## What you probably should NOT edit

- The `<CopilotKit>` provider config in `(plana)/layout.tsx` — versions are
  pinned for a reason (see `FROZEN.md`).
- `api/copilotkit-plana/route.ts`'s `injectA2UITool: false` — the dynamic
  agent's `generate_a2ui` Python tool depends on it (the docstring in
  `agent/src/dynamic_agent.py` explains the orphan-`function_call` trap).
- The legacy PortKit-era components (`BrandFrame.tsx`, `example-layout/`,
  `ModeToggle.tsx`, …) — they're not mounted by the Plana routes.

See `AGENTS.md` for the workspace operating contract.
