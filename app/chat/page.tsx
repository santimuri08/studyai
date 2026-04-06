"use client";
import Sidebar from "@/components/dashboard/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";

export default function ChatPage() {
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>
      <Sidebar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:28, height:"100vh", overflow:"hidden" }}>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:"1.4rem", fontWeight:700, color:"var(--text)", fontFamily:"var(--font-sora,'Sora'),sans-serif", letterSpacing:"-0.025em", marginBottom:4 }}>
            AI Assistant
          </h1>
          <p style={{ fontSize:13, color:"var(--text-muted)", margin:0 }}>
            Ask anything about your assignments, study strategies, or academic questions.
          </p>
        </div>
        <div style={{ flex:1, minHeight:0 }}>
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}