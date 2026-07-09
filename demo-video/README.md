# Plana Remotion demo video

Standalone Remotion package for the Plana product demo video.

## Commands

```bash
cd demo-video
pnpm install
pnpm run dev
pnpm run voiceover
pnpm run render
pnpm run still
pnpm run typecheck
```

## Notes

- The video recreates Plana's current UI from source code instead of screenshots.
- Voiceover lives at `public/voiceover/plana-demo.mp3` and plays once in the composition.
- `pnpm run voiceover` does not regenerate if the MP3 already exists. Use `pnpm run voiceover -- --force` to replace it.
- Use `public/` for any future screenshots, logos, audio, or video clips.
- Reference assets with Remotion `staticFile()` if you add them later.
