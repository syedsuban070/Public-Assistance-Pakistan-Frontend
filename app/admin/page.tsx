"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "https://burhanalqahar-public-assistance-pakistan.hf.space";
const G = "#01411C";
type Health = { status:string; version:string; groq:boolean; database:boolean; embeddings:boolean; timestamp:string };
type Analytics = { total_conversations:number; by_language:{language:string;count:number}[]; avg_rating:number|null; total_feedback:number };

export default function AdminPage() {
  const [auth,      setAuth]      = useState(false);
  const [pw,        setPw]        = useState("");
  const [health,    setHealth]    = useState<Health|null>(null);
  const [analytics, setAnalytics] = useState<Analytics|null>(null);
  const [tab,       setTab]       = useState<"overview"|"ingest">("overview");
  const [form,      setForm]      = useState({title:"",content:"",source:"",category:"constitution",token:""});
  const [msg,       setMsg]       = useState("");
  const PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "pakistan-admin-2024";

  const login=()=>{ if(pw===PASS){setAuth(true);fetchAll();}else alert("Wrong password"); };
  const fetchAll=async()=>{
    try{
      const [h,a]=await Promise.all([fetch(API+"/health").then(r=>r.json()),fetch(API+"/api/analytics").then(r=>r.json())]);
      setHealth(h); setAnalytics(a);
    }catch(e){console.error(e);}
  };
  const doIngest=async()=>{
    if(!form.title||!form.content||!form.token){setMsg("Title, content and token required");return;}
    setMsg("Ingesting...");
    try{
      const res=await fetch(API+"/api/ingest",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d=await res.json();
      setMsg(res.ok?"Saved "+d.chunks_saved+" chunks!":"Error: "+d.detail);
    }catch{setMsg("Connection error");}
  };
  const dot=(ok:boolean)=><span style={{width:10,height:10,borderRadius:"50%",background:ok?"#22c55e":"#ef4444",display:"inline-block",marginRight:6}}/>;

  if(!auth) return (
    <div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f7f0"}}>
      <div style={{background:"#fff",padding:36,borderRadius:16,boxShadow:"0 4px 24px rgba(0,0,0,0.1)",minWidth:320,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🇵🇰</div>
        <h2 style={{color:G,margin:"0 0 6px",fontWeight:800}}>Admin Panel</h2>
        <p style={{color:"#888",fontSize:13,margin:"0 0 20px"}}>Pakistan AI Platform</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
          placeholder="Admin password" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #c8e6c9",fontSize:14,outline:"none",marginBottom:12}}/>
        <button onClick={login} style={{width:"100%",padding:10,background:G,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>Login</button>
        <div style={{marginTop:14}}><a href="/" style={{color:G,fontSize:12}}>← Back to Chat</a></div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100dvh",background:"#f0f7f0",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:"linear-gradient(to right,"+G+",#0a5c2b)",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>🇵🇰</span>
          <div><div style={{color:"#fff",fontWeight:700,fontSize:15}}>Admin Dashboard</div><div style={{color:"rgba(255,255,255,0.65)",fontSize:10}}>Pakistan AI Platform</div></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={fetchAll} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontSize:12}}>🔄 Refresh</button>
          <a href="/" style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",padding:"5px 12px",borderRadius:8,fontSize:12,textDecoration:"none"}}>← Chat</a>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:20}}>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {(["overview","ingest"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:10,border:"none",background:tab===t?G:"#fff",color:tab===t?"#fff":"#567a56",cursor:"pointer",fontWeight:600,fontSize:13,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              {t==="overview"?"📊 Overview":"📥 Add Documents"}
            </button>
          ))}
        </div>

        {tab==="overview"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:20}}>
            {[
              {label:"API Status",  val:health?(health.status==="ok"?"Online":"Error"):"…", ok:health?.status==="ok", icon:"🌐"},
              {label:"Groq LLM",    val:health?(health.groq?"Connected":"Missing key"):"…",  ok:health?.groq,          icon:"🤖"},
              {label:"Database",    val:health?(health.database?"Connected":"Not connected"):"…", ok:health?.database, icon:"🗄️"},
              {label:"Embeddings",  val:health?(health.embeddings?"Connected":"No token"):"…", ok:health?.embeddings,  icon:"🔢"},
            ].map(c=>(
              <div key={c.label} style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",borderLeft:"4px solid "+(c.ok?"#22c55e":"#ef4444")}}>
                <div style={{fontSize:22,marginBottom:6}}>{c.icon}</div>
                <div style={{fontSize:12,color:"#888",marginBottom:3}}>{c.label}</div>
                <div style={{fontWeight:700,fontSize:14,color:c.ok?"#22c55e":"#ef4444",display:"flex",alignItems:"center"}}>{dot(c.ok??false)}{c.val}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20}}>
            {[
              {label:"Total Conversations", val:analytics?.total_conversations??"…", icon:"💬"},
              {label:"Feedback Received",   val:analytics?.total_feedback??"…",       icon:"⭐"},
              {label:"Avg Rating",          val:analytics?.avg_rating?analytics.avg_rating+"/5":"N/A", icon:"📊"},
              {label:"Version",             val:health?.version??"…", icon:"🔖"},
            ].map(c=>(
              <div key={c.label} style={{background:"#fff",borderRadius:12,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:22,marginBottom:6}}>{c.icon}</div>
                <div style={{fontSize:12,color:"#888",marginBottom:3}}>{c.label}</div>
                <div style={{fontWeight:800,fontSize:22,color:G}}>{String(c.val)}</div>
              </div>
            ))}
          </div>
          {analytics?.by_language&&analytics.by_language.length>0&&(
            <div style={{background:"#fff",borderRadius:12,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 14px",color:G,fontSize:15}}>📈 Conversations by Language</h3>
              {analytics.by_language.map(l=>{
                const total=analytics.by_language.reduce((s,x)=>s+Number(x.count),0);
                const pct=total>0?Math.round((Number(l.count)/total)*100):0;
                return(
                  <div key={l.language} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                      <span>{l.language==="en"?"🇬🇧":l.language==="ur"?"🇵🇰":""} {l.language}</span>
                      <span style={{fontWeight:700}}>{l.count} ({pct}%)</span>
                    </div>
                    <div style={{height:8,borderRadius:4,background:"#e8f5e9",overflow:"hidden"}}>
                      <div style={{height:"100%",width:pct+"%",background:"linear-gradient(to right,"+G+",#0a5c2b)",borderRadius:4}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>}

        {tab==="ingest"&&(
          <div style={{background:"#fff",borderRadius:12,padding:24,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <h3 style={{margin:"0 0 6px",color:G}}>📥 Add to Knowledge Base</h3>
            <p style={{fontSize:13,color:"#888",margin:"0 0 20px"}}>Upload Pakistani legal documents to improve AI answers with real sources.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[
                {label:"Document Title *",  key:"title",  ph:"e.g. Constitution of Pakistan 1973 — Fundamental Rights"},
                {label:"Source / Citation *",key:"source", ph:"e.g. Constitution of Pakistan 1973, Article 25"},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{fontSize:12,fontWeight:600,color:"#567a56",display:"block",marginBottom:4}}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph}
                    style={{width:"100%",padding:"9px 14px",borderRadius:10,border:"1.5px solid #c8e6c9",fontSize:14,outline:"none"}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:12,fontWeight:600,color:"#567a56",display:"block",marginBottom:4}}>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                  style={{width:"100%",padding:"9px 14px",borderRadius:10,border:"1.5px solid #c8e6c9",fontSize:14,outline:"none",background:"#fff"}}>
                  {["constitution","penal_code","civil_procedure","criminal_procedure","tax","nadra","property","labor","family","traffic","business","health","education","consumer","other"].map(c=>(
                    <option key={c} value={c}>{c.replace(/_/g," ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:"#567a56",display:"block",marginBottom:4}}>Document Text * (paste full text)</label>
                <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={8} placeholder="Paste full text of the legal document..."
                  style={{width:"100%",padding:"9px 14px",borderRadius:10,border:"1.5px solid #c8e6c9",fontSize:13,outline:"none",resize:"vertical",lineHeight:1.6}}/>
                <div style={{fontSize:11,color:"#aaa",marginTop:3}}>{form.content.split(" ").filter(Boolean).length} words</div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:"#567a56",display:"block",marginBottom:4}}>Admin Token (ADMIN_SECRET_TOKEN) *</label>
                <input type="password" value={form.token} onChange={e=>setForm({...form,token:e.target.value})} placeholder="Your HuggingFace Space ADMIN_SECRET_TOKEN"
                  style={{width:"100%",padding:"9px 14px",borderRadius:10,border:"1.5px solid #c8e6c9",fontSize:14,outline:"none"}}/>
              </div>
              <button onClick={doIngest} style={{padding:11,background:G,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>📤 Ingest Document</button>
              {msg&&<div style={{padding:"10px 14px",borderRadius:10,background:msg.startsWith("Saved")?"#e8f5e9":msg.startsWith("Error")||msg.startsWith("Connection")?"#fde8e8":"#e8f4fd",fontSize:13}}>{msg}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
