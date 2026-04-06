"use client";
import { motion, useInView, AnimatePresence, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// ── AI Orb ────────────────────────────────────────────────────────────────────
function AIOrb({ intensityMV }: { intensityMV: ReturnType<typeof useMotionValue<number>> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const S = 130; canvas.width = canvas.height = S;
    const cx = S/2, cy = S/2;
    let raf: number, t = 0;
    const COLS = ["167,139,250","124,111,255","196,181,253","99,102,241"];
    type P = { angle:number;dist:number;baseD:number;r:number;alpha:number;color:string };
    const pts: P[] = Array.from({length:30},(_,i)=>{
      const b=36+Math.random()*14;
      return{angle:(i/30)*Math.PI*2,dist:b,baseD:b,r:Math.random()*2+0.8,alpha:0.4+Math.random()*0.4,color:COLS[i%4]};
    });
    function draw(){
      if(!ctx||!canvas)return;
      ctx.clearRect(0,0,S,S); t+=0.02;
      const g=Math.min(1,Math.max(0,intensityMV.get()));
      for(const p of pts){
        p.dist+=((g>0.15?0:p.baseD)-p.dist)*0.06;
        p.angle+=0.013+g*0.03;
        const x=cx+Math.cos(p.angle)*p.dist, y=cy+Math.sin(p.angle)*p.dist;
        const la=(p.alpha+g*0.4)*(0.85+0.15*Math.sin(t+p.angle));
        const gr=ctx.createRadialGradient(x,y,0,x,y,p.r*6);
        gr.addColorStop(0,`rgba(${p.color},${Math.min(la,1)})`);
        gr.addColorStop(1,`rgba(${p.color},0)`);
        ctx.beginPath();ctx.arc(x,y,p.r*6,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
        ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.color},${Math.min(la*2,1)})`;ctx.fill();
      }
      if(g>0.02){
        const pulse=0.5+0.5*Math.sin(t*4),radius=6+g*30+pulse*14;
        const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
        cg.addColorStop(0,`rgba(124,111,255,${g*(0.85+pulse*0.15)})`);
        cg.addColorStop(0.4,`rgba(99,102,241,${g*0.4})`);
        cg.addColorStop(1,"rgba(124,111,255,0)");
        ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill();
      }
      raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  return <canvas ref={canvasRef} width={130} height={130} style={{display:"block"}}/>;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const OUTPUT_CARDS=[
  {icon:"📋",label:"Summary",color:"#7c6fff",rgb:"124,111,255",
   content:"6-page research paper on climate policy in developing nations"},
  {icon:"✅",label:"Key Tasks",color:"#34d399",rgb:"52,211,153",
   items:["Find 5 peer-reviewed sources (90 min)","Write outline (45 min)","Draft intro + body (2h)","Revise & citations (1h)"]},
  {icon:"⏱",label:"Time Estimate",color:"#f59e0b",rgb:"245,158,11",
   content:"~6.5 hours total · Due Friday 11:59 PM"},
];
const TASK_COLORS=["#7c6fff","#34d399","#f59e0b","#ec4899"];
const TASK_LABELS=["Research","Outline","Draft","Revise"];
const CAL_SLOTS=["Mon","Tue","Wed","Thu","Fri"];

const STEPS=[
  {label:"Raw Text",   color:"#f87171"},
  {label:"Processing", color:"#7c6fff"},
  {label:"Structured", color:"#34d399"},
  {label:"Scheduled",  color:"#f59e0b"},
];

const STEP_COPY=[
  {heading:"This is your assignment.",         sub:"Unstructured. Dense. Confusing."},
  {heading:"AI is reading every word.",        sub:"Extracting requirements, deadlines, and constraints."},
  {heading:"Instant structured breakdown.",    sub:"Summary, tasks and time estimate — in one shot."},
  {heading:"Auto-scheduled to your calendar.", sub:"Every task placed on the right day, ready to go."},
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProblemSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [step, setStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-advance once when section enters view
  useEffect(() => {
    if (!inView || hasStarted) return;
    setHasStarted(true);
    const timers = [
      setTimeout(() => setStep(1), 1000),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView, hasStarted]);

  // Orb intensity: full during step 1
  const orbMV = useMotionValue<number>(0);
  useEffect(() => {
    let raf: number;
    let current = orbMV.get();
    const target = step === 1 ? 1 : 0;
    function tick() {
      current += (target - current) * 0.06;
      orbMV.set(current);
      if (Math.abs(target - current) > 0.001) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, orbMV]);

  return (
    <section
      ref={ref}
      style={{ padding:"120px 24px", position:"relative", zIndex:2 }}
    >
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity:0, y:24 }}
          animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.6 }}
          style={{ textAlign:"center", marginBottom:"40px" }}
        >
          <span style={{
            display:"inline-block", marginBottom:"14px",
            fontSize:"12px", fontWeight:700, color:"#7c6fff",
            background:"rgba(124,111,255,0.1)", border:"1px solid rgba(124,111,255,0.25)",
            borderRadius:"9999px", padding:"5px 14px",
            letterSpacing:"0.1em", textTransform:"uppercase",
          }}>
            AI Transformation
          </span>
          <h2 style={{
            fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:800,
            color:"white", marginBottom:"10px", lineHeight:1.1,
          }}>
            Messy assignment.{" "}
            <span style={{
              background:"linear-gradient(135deg,#fff 0%,#7c6fff 50%,#a78bfa 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>Clear plan.</span>
          </h2>
          {/* Step heading */}
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.3 }}
              style={{ color:"#9ca3af", fontSize:"0.95rem" }}
            >
              {STEP_COPY[step].heading}{" "}
              <span style={{ color:"#6b7280" }}>{STEP_COPY[step].sub}</span>
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Stage */}
        <motion.div
          initial={{ opacity:0, y:28 }}
          animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.6, delay:0.2 }}
          style={{
            display:"grid",
            gridTemplateColumns:"1fr 90px 1fr",
            gap:"20px",
            alignItems:"center",
          }}
        >
          {/* LEFT */}
          <motion.div
            animate={{
              opacity: step >= 1 ? 0.55 : 1,
              filter:  step >= 1 ? "blur(2px)" : "blur(0px)",
              scale:   step >= 1 ? 0.98 : 1,
            }}
            transition={{ duration:0.7, ease:[0.25,0.1,0.25,1] }}
          >
            <div style={{
              background:"rgba(60,20,20,0.85)",
              border:"2px solid #f87171",
              borderRadius:"20px", padding:"28px",
              boxShadow:"0 0 50px rgba(248,113,113,0.18), 0 8px 32px rgba(20,20,60,0.25)",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <motion.div
                  animate={{opacity:[1,0.3,1]}}
                  transition={{repeat:Infinity,duration:2,ease:"easeInOut"}}
                  style={{width:10,height:10,borderRadius:"50%",background:"#f87171",boxShadow:"0 0 10px #f87171"}}
                />
                <span style={{color:"#fca5a5",fontSize:"13px",fontWeight:700}}>Raw assignment text</span>
              </div>
              <p style={{color:"#ffffff",lineHeight:1.8,fontSize:"14px"}}>
                Write a 6-page research paper analyzing the socioeconomic impacts of climate
                policy in developing nations. Include at least 5 peer-reviewed sources from
                the last 10 years. Follow APA 7th edition formatting. Submit via Canvas by
                next Friday at 11:59 PM. Paper should incorporate at least two competing
                theoretical frameworks.
              </p>
              <div style={{marginTop:"14px",display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {["6 pages","5 sources","APA 7th","Friday","Canvas"].map(tag=>(
                  <span key={tag} style={{
                    background:"rgba(248,113,113,0.25)",border:"1.5px solid #f87171",
                    borderRadius:"6px",padding:"4px 10px",fontSize:"12px",color:"#ffffff",fontWeight:600,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CENTER — orb */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
            <motion.div
              animate={{ scale: step===1 ? [1,1.1,1] : 1 }}
              transition={{ repeat:step===1?Infinity:0, duration:1.4, ease:"easeInOut" }}
            >
              <AIOrb intensityMV={orbMV}/>
            </motion.div>
            <motion.p
              animate={{ color: step===1 ? "#a78bfa" : "#4b5563" }}
              style={{fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700}}
            >
              {step===0?"AI":step===1?"Thinking...":"Done ✓"}
            </motion.p>
          </div>

          {/* RIGHT */}
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {OUTPUT_CARDS.map((card,i)=>(
              <motion.div key={card.label}
                initial={false}
                animate={step>=2 ? {opacity:1,x:0,y:0} : {opacity:0,x:16,y:8}}
                transition={{duration:0.45,delay:i*0.12,ease:[0.25,0.1,0.25,1]}}
                style={{
                  background: card.color==="#7c6fff"?"rgba(40,28,80,0.90)":card.color==="#34d399"?"rgba(20,50,40,0.90)":"rgba(50,32,10,0.90)",
                  border:`2px solid ${card.color}`,
                  borderRadius:"14px", padding:"16px 18px",
                  position:"relative", overflow:"hidden",
                  boxShadow:`0 0 30px rgba(${card.rgb},0.20), 0 8px 32px rgba(20,20,60,0.25)`,
                }}
              >
                <motion.div
                  initial={{scaleX:0}} animate={step>=2?{scaleX:1}:{}}
                  transition={{duration:0.5,delay:i*0.12+0.2}}
                  style={{
                    position:"absolute",top:0,left:"10px",right:"10px",height:"2px",
                    background:`linear-gradient(90deg,transparent,${card.color},transparent)`,
                    transformOrigin:"left",
                  }}
                />
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                  <span style={{fontSize:"16px",filter:`drop-shadow(0 0 6px ${card.color})`}}>{card.icon}</span>
                  <span style={{fontSize:"11px",fontWeight:800,color:card.color,letterSpacing:"0.08em",textTransform:"uppercase"}}>{card.label}</span>
                </div>
                {"items" in card&&card.items
                  ?<div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                    {card.items.map((item,ii)=>(
                      <div key={ii} style={{display:"flex",alignItems:"center",gap:"7px"}}>
                        <div style={{width:5,height:5,borderRadius:"50%",background:card.color,flexShrink:0,boxShadow:`0 0 5px ${card.color}`}}/>
                        <span style={{fontSize:"12px",color:"#ffffff",fontWeight:500}}>{item}</span>
                      </div>
                    ))}
                  </div>
                  :<p style={{fontSize:"13px",color:"#ffffff",lineHeight:1.6}}>{card.content}</p>
                }
              </motion.div>
            ))}

            {/* Calendar */}
            <AnimatePresence>
              {step>=3&&(
                <motion.div
                  initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  transition={{duration:0.4}}
                  style={{
                    background:"rgba(30,25,70,0.90)",
                    border:"2px solid rgba(255,255,255,0.35)",
                    borderRadius:"14px", padding:"14px 16px",
                    boxShadow:"0 8px 32px rgba(20,20,60,0.25)",
                  }}
                >
                  <p style={{fontSize:"11px",color:"#ffffff",fontWeight:700,marginBottom:"10px",letterSpacing:"0.05em",textTransform:"uppercase"}}>
                    📅 Auto-scheduled
                  </p>
                  <div style={{display:"flex",gap:"6px"}}>
                    {CAL_SLOTS.map((day,si)=>(
                      <motion.div key={day}
                        initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
                        transition={{delay:si*0.08,type:"spring",stiffness:300,damping:20}}
                        style={{
                          flex:1,background:"rgba(255,255,255,0.08)",
                          border:"1.5px solid rgba(255,255,255,0.25)",
                          borderRadius:"8px",padding:"6px 4px",
                          textAlign:"center",minHeight:"50px",
                        }}
                      >
                        <p style={{fontSize:"10px",color:"#ffffff",marginBottom:"5px",fontWeight:700}}>{day}</p>
                        {si<TASK_LABELS.length&&(
                          <div style={{
                            background:TASK_COLORS[si],
                            borderRadius:"5px",padding:"3px 4px",
                            fontSize:"9px",color:"#ffffff",fontWeight:800,
                            boxShadow:`0 0 10px ${TASK_COLORS[si]}`,
                          }}>
                            {TASK_LABELS[si]}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Controls */}
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"20px",marginTop:"40px"}}>
          <motion.button
            onClick={()=>setStep(s=>Math.max(0,s-1))}
            whileHover={step>0?{scale:1.05}:{}}
            whileTap={step>0?{scale:0.95}:{}}
            data-hover
            style={{
              background:step>0?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:"10px",padding:"9px 20px",
              fontSize:"13px",color:step>0?"white":"#374151",
              cursor:step>0?"none":"default",
              fontWeight:500,
            }}
          >← Back</motion.button>

          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            {STEPS.map((s,i)=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <motion.button
                  onClick={()=>setStep(i)}
                  data-hover
                  animate={{
                    background:step===i?s.color:step>i?s.color+"70":"rgba(255,255,255,0.12)",
                    scale:step===i?1.35:1,
                    boxShadow:step===i?`0 0 12px ${s.color}80`:"none",
                  }}
                  transition={{duration:0.3}}
                  style={{width:9,height:9,borderRadius:"50%",border:"none",padding:0,cursor:"none"}}
                />
                {i<STEPS.length-1&&(
                  <motion.div
                    animate={{background:step>i?`linear-gradient(90deg,${STEPS[i].color},${STEPS[i+1].color})`:"rgba(255,255,255,0.1)"}}
                    style={{width:"24px",height:"1px"}}
                  />
                )}
              </div>
            ))}
          </div>

          <motion.button
            onClick={()=>setStep(s=>Math.min(3,s+1))}
            whileHover={step<3?{scale:1.05}:{}}
            whileTap={step<3?{scale:0.95}:{}}
            data-hover
            style={{
              background:step<3?"linear-gradient(135deg,#7c6fff,#6366f1)":"rgba(255,255,255,0.02)",
              border:"1px solid rgba(124,111,255,0.3)",
              borderRadius:"10px",padding:"9px 20px",
              fontSize:"13px",color:step<3?"white":"#374151",
              cursor:step<3?"none":"default",
              fontWeight:step<3?600:400,
              boxShadow:step<3?"0 0 20px rgba(124,111,255,0.35)":"none",
            }}
          >
            {step===3?"Done ✓":"Next →"}
          </motion.button>
        </div>

        {/* Step label */}
        <div style={{textAlign:"center",marginTop:"10px"}}>
          <motion.span
            key={step}
            initial={{opacity:0}} animate={{opacity:1}}
            style={{fontSize:"11px",color:STEPS[step].color,fontWeight:600,letterSpacing:"0.05em"}}
          >
            Step {step+1} of 4 — {STEPS[step].label}
          </motion.span>
        </div>

      </div>
    </section>
  );
}