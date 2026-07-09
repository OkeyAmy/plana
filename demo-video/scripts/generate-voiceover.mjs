import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

if (!apiKey) {
  throw new Error("ELEVENLABS_API_KEY is missing. Add it to demo-video/.env.");
}

const output = resolve("public/voiceover/plana-demo.mp3");
const force = process.argv.includes("--force");

if (existsSync(output) && !force) {
  console.log(`Voiceover already exists at ${output}. Use pnpm run voiceover -- --force to regenerate.`);
  process.exit(0);
}

const text = `Meet Plana: an AI room designer that turns measurements into a live, editable floor plan. Start with a room description or upload a floor plan image. Plana reads the dimensions, detects doors and windows, then places furniture at real centimeter scale. The canvas is interactive, so you can move, rotate, and refine every piece while the agent checks clearance, traffic flow, and collisions in real time. It highlights what works, warns when furniture blocks a door, and keeps the whole room grounded in real measurements instead of guesses. When the layout is ready, Plana can suggest matching products for the space, so a design idea can become a practical shopping plan. Describe it, generate it, and refine it live with Plana.`;

const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: "POST",
  headers: {
    "xi-api-key": apiKey,
    "Content-Type": "application/json",
    Accept: "audio/mpeg",
  },
  body: JSON.stringify({
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.8,
      style: 0.28,
      use_speaker_boost: true,
    },
  }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`ElevenLabs request failed: ${response.status} ${response.statusText}\n${body}`);
}

const audio = Buffer.from(await response.arrayBuffer());
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, audio);
console.log(`Generated ${output}`);
