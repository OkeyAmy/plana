"use client";

import { useState } from "react";
import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";
import { SiteNav } from "@/components/plana/Brand";
import { SurfaceCanvas, CanvasEmptyState } from "@/components/plana/SurfaceCanvas";
import { FilteredUserMessage } from "@/components/plana/FilteredUserMessage";
import { FilteredAssistantMessage } from "@/components/plana/FilteredAssistantMessage";
import { Split } from "@/components/plana/Split";

const AGENT_ID = "fixed_agent";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FixedPage() {
  const { agent: _agent } = useAgent({ agentId: AGENT_ID });
  const [loaded, setLoaded] = useState<{ filename: string; size: string } | null>(null);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg)]">
      <SiteNav active="fixed" />

      {/* Workspace title strip */}
      <div className="shrink-0 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 flex items-center gap-3">
        <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
          Room Designer
        </span>
        <span className="w-px h-3.5 bg-[var(--line)]" />
        <span className="text-[13px] font-medium text-[var(--ink)]">
          Plana · AI Floor Plan Generator
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[10.5px] mono uppercase tracking-[0.12em] text-[var(--muted)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mint)]" />
            agent ready
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        <Split
          persistKey="fixed.split"
          initialLeftFraction={0.32}
          left={
            <div className="h-full flex flex-col copilot-chat-wrapper">
              {loaded && (
                <div className="shrink-0 px-4 py-2.5 border-b border-[var(--line)] flex items-center gap-2.5 bg-[color-mix(in_oklab,var(--mint)_8%,var(--surface))]">
                  <span className="w-2 h-2 rounded-full bg-[var(--mint)] flex-none" />
                  <div className="flex-1 min-w-0">
                    <span className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-2)] block">
                      image loaded
                    </span>
                    <span className="text-[12px] font-medium text-[var(--ink)] truncate block">
                      {loaded.filename}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] flex-none">
                    {loaded.size}
                  </span>
                </div>
              )}
              <div className="flex-1 min-h-0">
                <CopilotChat
                  agentId={AGENT_ID}
                  chatView={{
                    messageView: {
                      userMessage: FilteredUserMessage,
                      assistantMessage: FilteredAssistantMessage,
                    },
                  }}
                  attachments={{
                    enabled: true,
                    accept: "image/png,image/jpeg,image/jpg,image/webp",
                    maxSize: 10 * 1024 * 1024,
                    onUpload: async (file) => {
                      const base64 = await toBase64(file);
                      setLoaded({
                        filename: file.name,
                        size: `${(file.size / 1024).toFixed(0)} KB`,
                      });
                      return {
                        type: "data",
                        value: base64,
                        mimeType: file.type,
                        metadata: { filename: file.name },
                      };
                    },
                    onUploadFailed: (err) =>
                      console.warn("[image upload failed]", err),
                  }}
                  labels={{
                    chatInputPlaceholder:
                      "Attach a floor plan image or describe your room…",
                    welcomeMessageText:
                      "Attach a floor plan image using the clip button, then describe your room. Or just type: 'Design a minimalist bedroom, 520×430 cm.'",
                  }}
                />
              </div>
            </div>
          }
          right={
            <SurfaceCanvas
              channel={AGENT_ID}
              emptyState={
                <CanvasEmptyState
                  title="No layout yet"
                  subtitle="Describe your room or upload a floor plan image in the chat. Plana will generate an interactive, to-scale layout here."
                  hint={
                    <span className="pill text-[11px]">
                      try: &ldquo;design a minimalist bedroom 500×400 cm&rdquo;
                    </span>
                  }
                />
              }
            />
          }
        />
      </div>
    </div>
  );
}
