"use client";

import { useState } from "react";
import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";
import { SiteNav } from "@/components/pdf-analyst/Brand";
import { SurfaceCanvas, CanvasEmptyState } from "@/components/pdf-analyst/SurfaceCanvas";
import { FilteredUserMessage } from "@/components/pdf-analyst/FilteredUserMessage";
import { FilteredAssistantMessage } from "@/components/pdf-analyst/FilteredAssistantMessage";
import { Split } from "@/components/pdf-analyst/Split";

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

      <div className="flex-1 min-h-0 flex">
      <Split
        persistKey="fixed.split"
        initialLeftFraction={0.32}
        left={
          <div className="h-full flex flex-col copilot-chat-wrapper">
            {loaded && (
              <div className="shrink-0 px-4 py-2 border-b border-[var(--line)] flex items-center gap-2 bg-[color-mix(in_oklab,var(--mint)_8%,var(--surface))]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d6b4f]" />
                <span className="mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--ink)]">
                  image loaded
                </span>
                <span className="text-[12.5px] font-medium text-[var(--ink)] truncate">
                  {loaded.filename}
                </span>
                <span className="text-[11px] text-[var(--ink)] ml-auto">
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
                    "Upload a floor plan image (📎), or describe your room…",
                  welcomeMessageText:
                    "Upload a floor plan image with 📎, then ask: 'Design this room.' Or just describe your room in text.",
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
                title="Canvas is empty"
                subtitle="Upload a floor plan image or describe your room in chat. The AI will generate a furniture layout and render it here."
                hint={
                  <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]">
                    try: "design a minimalist bedroom 500×400cm"
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
