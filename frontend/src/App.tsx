import { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages((m) => [...m, `You: ${userMsg}`]);

    const res = await fetch("/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: userMsg }] }),
    });

    const text = await res.text();
    setMessages((m) => [...m, `Agent: ${text}`]);
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>AI Home Designer</h1>
      <div style={{ border: "1px solid #ccc", padding: 16, minHeight: 200, marginBottom: 12 }}>
        {messages.map((m, i) => <p key={i}>{m}</p>)}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Describe your home..."
        style={{ width: "80%", padding: 8 }}
      />
      <button onClick={sendMessage} style={{ padding: "8px 16px", marginLeft: 8 }}>
        Send
      </button>
    </div>
  );
}
