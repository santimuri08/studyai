"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/types";

const SV={strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
function IcoSpark({z=14}){return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SV}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>;}
function IcoSend({z=14}){return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...SV}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;}

interface Props {
  compact?: boolean;
  systemContext?: string;
}

export default function ChatPanel({ compact=false, systemContext }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role:"assistant",
    content: compact?"Hi! Ask me anything about your assignments.":"Hi! I'm your StudyAI assistant. How can I help you today?",
    timestamp: new Date().toISOString(),
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  async function send() {
    if (!input.trim()||loading) return;
    const userMsg:ChatMessage={role:"user",content:input,timestamp:new Date().toISOString()};
    setMessages(m=>[...m,userMsg]); setInput(""); setLoading(true);

    const apiMessages=[...messages,userMsg].map(({role,content})=>({role,content}));
    if(systemContext) apiMessages.unshift({role:"user",content:`[Context: ${systemContext}]`});

    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:apiMessages})});
      const reader=res.body?.getReader();
      const decoder=new TextDecoder();
      let text="";
      setMessages(m=>[...m,{role:"assistant",content:"",timestamp:new Date().toISOString()}]);
      while(reader){
        const {done,value}=await reader.read();
        if(done)break;
        const lines=decoder.decode(value).split("\n").filter(l=>l.startsWith("data: "));
        for(const line of lines){
          try{
            const json=JSON.parse(line.replace("data: ",""));
            if(json.type==="content_block_delta"){
              text+=json.delta?.text||"";
              setMessages(m=>{const u=[...m];u[u.length-1]={role:"assistant",content:text,timestamp:new Date().toISOString()};return u;});
            }
          }catch{}
        }
      }
    } catch {
      setMessages(m=>[...m,{role:"assistant",content:"Sorry, something went wrong. Please try again.",timestamp:new Date().toISOString()}]);
    } finally { setLoading(false); }
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:compact?"420px":"100%",background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",borderRadius:18,overflow:"hidden",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}>
      {/* Header */}
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10,flexShrink:0,background:"rgba(255,255,255,0.01)"}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,rgba(124,92,255,0.2),rgba(124,92,255,0.1))",border:"1px solid rgba(124,92,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary-text)"}}><IcoSpark z={14}/></div>
        <div>
          <p style={{fontSize:13.5,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-sora,'Sora'),sans-serif",margin:0,letterSpacing:"-0.01em"}}>StudyAI</p>
          <p style={{fontSize:10,color:"#34d399",margin:0}}>● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
        <AnimatePresence initial={false}>
          {messages.map((msg,i)=>(
            <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:0.22}}
              style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"84%",borderRadius:msg.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"9px 13px",fontSize:13,lineHeight:1.6,whiteSpace:"pre-line",fontFamily:"var(--font-dm-sans,'DM Sans'),sans-serif",...(msg.role==="user"?{background:"linear-gradient(135deg,var(--primary),#5b45e0)",color:"white",boxShadow:"0 4px 14px rgba(124,92,255,0.25)"}:{background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text)"})}}>
                {msg.content||(loading&&i===messages.length-1?(
                  <span style={{display:"flex",gap:4,alignItems:"center",padding:"2px 0"}}>
                    {[0,1,2].map(j=><motion.span key={j} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:"var(--text-muted)"}} animate={{opacity:[0.3,1,0.3]}} transition={{repeat:Infinity,duration:1,delay:j*0.2}}/>)}
                  </span>
                ):"")}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"12px 14px",borderTop:"1px solid var(--border)",flexShrink:0}}>
        <div style={{display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder="Ask anything…"
            style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:10,padding:"9px 13px",color:"var(--text)",fontSize:13,fontFamily:"var(--font-dm-sans,'DM Sans'),sans-serif",outline:"none",transition:"border-color var(--transition),box-shadow var(--transition)"}}
            onFocus={e=>{e.target.style.borderColor="rgba(124,92,255,0.45)";e.target.style.boxShadow="0 0 0 3px rgba(124,92,255,0.1)";}}
            onBlur={e=>{e.target.style.borderColor="var(--border)";e.target.style.boxShadow="none";}}/>
          <button onClick={send} disabled={loading||!input.trim()}
            style={{background:"linear-gradient(135deg,var(--primary),#5b45e0)",border:"none",borderRadius:10,padding:"9px 13px",color:"white",cursor:"none",display:"flex",alignItems:"center",justifyContent:"center",opacity:loading||!input.trim()?0.4:1,transition:"all 0.2s ease",boxShadow:"0 2px 10px rgba(124,92,255,0.25)"}}
            onMouseEnter={e=>{if(!loading&&input.trim()){(e.currentTarget).style.transform="scale(1.04) translateY(-1px)";(e.currentTarget).style.boxShadow="0 6px 18px rgba(124,92,255,0.45)";}}}
            onMouseLeave={e=>{(e.currentTarget).style.transform="";(e.currentTarget).style.boxShadow="0 2px 10px rgba(124,92,255,0.25)";}}>
            <IcoSend z={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}