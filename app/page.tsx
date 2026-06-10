"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://burhanalqahar-public-assistance-pakistan.hf.space";
const G = "#01411C", GL = "#0a5c2b", GOLD = "#C9A227";

type Lang = "en" | "ur" | "roman";
type Msg  = { id:string; role:"user"|"assistant"; content:string; feedback?:1|-1; copied?:boolean };
type Session = { id:string; title:string; msgs:Msg[]; lang:Lang; ts:number };

const TOPICS = [
  { icon:"⚖️", en:"Laws & Rights",     ur:"قوانین و حقوق",       q:{ en:"What are the fundamental rights of Pakistani citizens under the 1973 Constitution?", ur:"پاکستانی آئین کے تحت شہریوں کے بنیادی حقوق کیا ہیں؟", roman:"Pakistani constitution ke tehat buniyadi huqooq kya hain?" }},
  { icon:"📄", en:"NADRA / CNIC",       ur:"نادرا / شناختی کارڈ", q:{ en:"What documents and fees are needed to get or renew a CNIC from NADRA?", ur:"نادرا سے شناختی کارڈ بنوانے کے لیے کاغذات اور فیس کیا ہے؟", roman:"NADRA se CNIC ke liye documents aur fee kya hai?" }},
  { icon:"💰", en:"Tax / FBR",          ur:"ٹیکس / ایف بی آر",   q:{ en:"How do I register for NTN and file my income tax return with FBR?", ur:"این ٹی این رجسٹریشن اور ایف بی آر ٹیکس ریٹرن کیسے فائل کریں؟", roman:"NTN registration aur FBR tax return kaise karein?" }},
  { icon:"🏠", en:"Property Laws",      ur:"جائیداد",             q:{ en:"What is the process for property registration and mutation in Pakistan?", ur:"پاکستان میں جائیداد رجسٹریشن اور انتقال کا طریقہ کیا ہے؟", roman:"Property registration aur intiqaal ka tareeqa kya hai?" }},
  { icon:"💼", en:"Labour Rights",      ur:"مزدور حقوق",         q:{ en:"What are employee rights in Pakistan — minimum wage, leave, termination?", ur:"پاکستان میں ملازم کے حقوق — اجرت، چھٹی، ملازمت ختم کرنا؟", roman:"Pakistan mein mulazim ke huqooq — wage, leave, termination?" }},
  { icon:"🏛️", en:"Govt Programs",      ur:"سرکاری پروگرام",     q:{ en:"What government support programs are available for poor families in Pakistan?", ur:"غریب خاندانوں کے لیے کون سے سرکاری پروگرام ہیں؟", roman:"Ghareeb families ke liye sarkari programs kya hain?" }},
  { icon:"🛂", en:"Passport",           ur:"پاسپورٹ",             q:{ en:"What is the process, fee, and documents needed for a Pakistani passport?", ur:"پاکستانی پاسپورٹ کے لیے طریقہ، فیس اور کاغذات کیا ہیں؟", roman:"Pakistani passport ke liye tareeqa, fee aur documents?" }},
  { icon:"🚗", en:"Traffic & Vehicles", ur:"ٹریفک اور گاڑی",     q:{ en:"How do I register a vehicle in Pakistan and what documents are required?", ur:"گاڑی رجسٹریشن کا طریقہ اور کاغذات کیا ہیں؟", roman:"Gaadi registration ka tareeqa aur documents kya hain?" }},
  { icon:"👨‍👩‍👧", en:"Family Laws",        ur:"خاندانی قوانین",     q:{ en:"What are Pakistan's laws on marriage, divorce (talaq/khula), and child custody?", ur:"نکاح، طلاق، خلع اور بچوں کی تحویل کے قوانین کیا ہیں؟", roman:"Nikah, talaq, khula aur bachon ki tahweel ke qawaneen?" }},
  { icon:"🏥", en:"Healthcare",         ur:"صحت",                 q:{ en:"What is Sehat Sahulat Program and how do I get free hospital treatment?", ur:"سہت سہولت پروگرام کیا ہے اور مفت علاج کیسے ملتا ہے؟", roman:"Sehat Sahulat Program kya hai aur muft ilaj kaise milta hai?" }},
  { icon:"🎓", en:"Education / HEC",    ur:"تعلیم / ایچ ای سی",  q:{ en:"What HEC scholarships and government education programs are available?", ur:"HEC وظائف اور سرکاری تعلیمی پروگرام کون سے ہیں؟", roman:"HEC scholarships aur taaleemi programs kya hain?" }},
  { icon:"🚨", en:"FIR & Police",       ur:"ایف آئی آر / پولیس", q:{ en:"How do I file an FIR in Pakistan and what if the police refuse?", ur:"پاکستان میں ایف آئی آر کیسے درج کرائیں اور پولیس منع کرے تو؟", roman:"Pakistan mein FIR kaise darj karaein aur police mana kare to?" }},
];

const FOLLOW_UPS = {
  en:["Can you explain that in simpler terms?","What documents do I need?","What are the fees involved?","Is there free legal help available?","What happens if I don't comply?"],
  ur:["کیا آپ اسے آسان الفاظ میں سمجھا سکتے ہیں؟","مجھے کون سے کاغذات چاہئیں؟","اس میں کتنی فیس لگتی ہے؟"],
  roman:["Kya aap ise aasaan alfaaz mein samjhayein?","Mujhe kaun se documents chahiyein?","Is mein kitni fee lagti hai?"],
};

const L10N = {
  en:    { title:"Pakistan AI Assistant", sub:"Free civic help · 🇵🇰", newChat:"New Chat", topics:"Topics", send:"Send", ph:"Ask about Pakistani laws, rights, procedures...", disc:"General information only — consult a qualified professional for legal advice", welcome:"Assalam-o-Alaikum! 🇵🇰", welcomeSub:"Ask anything about Pakistani laws, rights, NADRA, FBR, property, labour, and more — completely free.", quickStart:"Quick Start", typing:"Researching...", sessions:"Recent Chats", noSessions:"No previous chats", adminLink:"Admin Panel" },
  ur:    { title:"پاکستان اے آئی اسسٹنٹ", sub:"مفت مدد · 🇵🇰", newChat:"نئی گفتگو", topics:"موضوعات", send:"بھیجیں", ph:"پاکستانی قوانین، حقوق اور خدمات کے بارے میں پوچھیں...", disc:"عمومی معلومات — اہم معاملات میں ماہر سے رجوع کریں", welcome:"السلام علیکم! 🇵🇰", welcomeSub:"پاکستانی قوانین، حقوق، نادرا، ایف بی آر اور مزید کے بارے میں بالکل مفت مدد۔", quickStart:"جلدی شروعات", typing:"تحقیق ہو رہی ہے...", sessions:"حالیہ گفتگو", noSessions:"کوئی پرانی گفتگو نہیں", adminLink:"ایڈمن پینل" },
  roman: { title:"Pakistan AI Assistant", sub:"Muft Madad · 🇵🇰", newChat:"Nayi Baat", topics:"Mauzoat", send:"Bhejein", ph:"Pakistani qawaneen, huqooq ke baare mein poochein...", disc:"Aam maalumat — ahem mamlaaat mein maahir se rujoo karein", welcome:"Assalam-o-Alaikum! 🇵🇰", welcomeSub:"Pakistani qawaneen, NADRA, FBR aur mazeed ke baare mein muft madad.", quickStart:"Jaldi Shurooat", typing:"Tahqeeq ho rahi hai...", sessions:"Haaliya Baatein", noSessions:"Koi purani baat nahi", adminLink:"Admin Panel" },
};

function uid() { return Math.random().toString(36).slice(2,10); }
function fmt(t:string){ return t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>"); }

export default function ChatPage() {
  const [msgs,        setMsgs]        = useState<Msg[]>([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [lang,        setLang]        = useState<Lang>("en");
  const [tab,         setTab]         = useState<"topics"|"history">("topics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions,    setSessions]    = useState<Session[]>([]);
  const [sid]                         = useState(()=>uid());
  const [listening,   setListening]   = useState(false);
  const [toast,       setToast]       = useState("");
  const endRef  = useRef<HTMLDivElement>(null);
  const taRef   = useRef<HTMLTextAreaElement>(null);
  const recog   = useRef<any>(null);

  const T = L10N[lang];
  const isRTL = lang==="ur";

  useEffect(()=>{ try{ const s=localStorage.getItem("pk_sessions"); if(s) setSessions(JSON.parse(s)); const l=localStorage.getItem("pk_lang") as Lang|null; if(l) setLang(l); }catch{} },[]);
  useEffect(()=>{ if(msgs.length>1){ const title=msgs.find(m=>m.role==="user")?.content.slice(0,45)||"Chat"; const upd=[{id:sid,title,msgs,lang,ts:Date.now()},...sessions.filter(s=>s.id!==sid)].slice(0,20); setSessions(upd); try{localStorage.setItem("pk_sessions",JSON.stringify(upd));}catch{} } },[msgs]);
  useEffect(()=>{ try{localStorage.setItem("pk_lang",lang);}catch{} },[lang]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(""),2200); };

  const sendMsg=async(text:string)=>{
    if(!text.trim()||loading) return;
    const um:Msg={id:uid(),role:"user",content:text};
    const upd=[...msgs,um]; setMsgs(upd); setInput(""); if(taRef.current) taRef.current.style.height="auto"; setLoading(true);
    try{
      const res=await fetch(API+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,session_id:sid,language:lang,history:upd.slice(-12)})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.detail||"Server error");
      setMsgs([...upd,{id:uid(),role:"assistant",content:data.reply||"Please try again."}]);
    }catch(e:any){ setMsgs([...upd,{id:uid(),role:"assistant",content:"Error: "+e.message}]); }
    finally{ setLoading(false); }
  };

  const doFeedback=async(id:string,v:1|-1)=>{
    setMsgs(prev=>prev.map(m=>m.id===id?{...m,feedback:v}:m));
    showToast(v===1?"Thanks for the positive feedback!":"Thanks, we will improve.");
    try{ await fetch(API+"/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:sid,rating:v===1?5:2})}); }catch{}
  };

  const copyMsg=(id:string,content:string)=>{
    navigator.clipboard.writeText(content.replace(/<[^>]*>/g,"")).then(()=>{
      setMsgs(prev=>prev.map(m=>m.id===id?{...m,copied:true}:m));
      showToast("Copied to clipboard!"); setTimeout(()=>setMsgs(prev=>prev.map(m=>m.id===id?{...m,copied:false}:m)),2000);
    });
  };

  const toggleVoice=()=>{
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){showToast("Voice not supported in this browser");return;}
    if(listening){recog.current?.stop();setListening(false);return;}
    const r=new SR(); r.lang=lang==="ur"?"ur-PK":"en-US"; r.interimResults=false;
    r.onresult=(e:any)=>{setInput(e.results[0][0].transcript);setListening(false);};
    r.onerror=()=>{setListening(false);showToast("Voice error — try again");};
    r.onend=()=>setListening(false);
    recog.current=r; r.start(); setListening(true);
  };

  const fuOpts=FOLLOW_UPS[lang]||FOLLOW_UPS.en;
  const randFU=()=>fuOpts[Math.floor(Math.random()*fuOpts.length)];

  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"#f0f7f0",direction:isRTL?"rtl":"ltr"}}>
      {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"rgba(1,65,28,0.9)",color:"#fff",padding:"8px 20px",borderRadius:20,fontSize:13,fontWeight:600,zIndex:999}}>
        {toast}
      </div>}

      <div style={{background:"linear-gradient(to right,"+G+","+GL+")",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"#fff",width:36,height:36,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>☰</button>
          <span style={{fontSize:24}}>🇵🇰</span>
          <div><div style={{color:"#fff",fontWeight:700,fontSize:15}}>{T.title}</div><div style={{color:"rgba(255,255,255,0.65)",fontSize:10}}>{T.sub}</div></div>
        </div>
        <div style={{display:"flex",gap:3,background:"rgba(0,0,0,0.18)",borderRadius:20,padding:"3px 4px"}}>
          {(["en","ur","roman"] as Lang[]).map(c=>(
            <button key={c} onClick={()=>setLang(c)} style={{padding:"4px 8px",borderRadius:14,border:"none",background:lang===c?"#fff":"transparent",color:lang===c?G:"rgba(255,255,255,0.85)",cursor:"pointer",fontSize:11,fontWeight:lang===c?700:400}}>
              {c==="en"?"EN":c==="ur"?"اردو":"Roman"}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>
        {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",zIndex:90}}/>}

        <div style={{position:"absolute",top:0,left:isRTL?"auto":0,right:isRTL?0:"auto",bottom:0,width:280,background:"#fff",zIndex:100,transform:sidebarOpen?"translateX(0)":(isRTL?"translateX(100%)":"translateX(-100%)"),transition:"transform 0.28s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 14px",background:"#f5faf5",borderBottom:"1px solid #d4edda",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:4}}>
              {(["topics","history"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:"5px 12px",borderRadius:14,border:"none",background:tab===t?G:"transparent",color:tab===t?"#fff":"#567a56",cursor:"pointer",fontSize:12,fontWeight:600}}>
                  {t==="topics"?"📋 "+T.topics:"🕐 "+T.sessions}
                </button>
              ))}
            </div>
            <button onClick={()=>setSidebarOpen(false)} style={{background:"#e0f0e0",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:G,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          <button onClick={()=>{setMsgs([]);setSidebarOpen(false);}} style={{margin:"10px 12px",padding:9,background:G,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
            ✨ {T.newChat}
          </button>
          <div style={{flex:1,overflowY:"auto"}}>
            {tab==="topics" ? TOPICS.map((t,i)=>(
              <button key={i} onClick={()=>{sendMsg(t.q[lang]);setSidebarOpen(false);}} style={{width:"100%",textAlign:isRTL?"right":"left",padding:"10px 14px",border:"none",borderBottom:"1px solid #f0f8f0",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
                <div><div style={{fontWeight:600,color:"#1a2e1a",fontSize:13}}>{t.en}</div><div style={{fontSize:11,color:"#888",direction:"rtl",textAlign:"right"}}>{t.ur}</div></div>
              </button>
            )) : sessions.length===0 ? (
              <div style={{padding:24,textAlign:"center",color:"#888",fontSize:13}}>💬 {T.noSessions}</div>
            ) : sessions.map(s=>(
              <button key={s.id} onClick={()=>{setMsgs(s.msgs);setLang(s.lang);setSidebarOpen(false);}} style={{width:"100%",textAlign:"left",padding:"10px 14px",border:"none",borderBottom:"1px solid #f0f8f0",background:"transparent",cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:500,color:"#1a2e1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</div>
                <div style={{fontSize:10,color:"#aaa",marginTop:2}}>{new Date(s.ts).toLocaleDateString()}</div>
              </button>
            ))}
          </div>
          <div style={{padding:"10px 14px",borderTop:"1px solid #d4edda",background:"#f5faf5"}}>
            <a href="/admin" style={{display:"block",padding:"7px 12px",background:"rgba(1,65,28,0.08)",borderRadius:8,textDecoration:"none",color:G,fontSize:12,fontWeight:600,textAlign:"center"}}>🛠️ {T.adminLink}</a>
          </div>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"16px 14px",display:"flex",flexDirection:"column",gap:14}}>
            {msgs.length===0&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 10px 10px",textAlign:"center"}}>
                <div style={{position:"relative",marginBottom:14}}>
                  <div style={{width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,"+G+","+GL+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,boxShadow:"0 4px 20px rgba(1,65,28,0.28)"}}>🇵🇰</div>
                  <div style={{position:"absolute",bottom:-2,right:-2,width:24,height:24,borderRadius:"50%",background:GOLD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
                </div>
                <h1 style={{color:G,fontSize:20,fontWeight:800,margin:"0 0 8px"}}>{T.welcome}</h1>
                <p style={{color:"#567a56",fontSize:13,maxWidth:360,lineHeight:1.65,margin:"0 0 20px"}}>{T.welcomeSub}</p>
                <div style={{fontWeight:700,fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{T.quickStart}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:440,width:"100%"}}>
                  {TOPICS.slice(0,8).map((t,i)=>(
                    <button key={i} onClick={()=>sendMsg(t.q[lang])} style={{padding:"10px 8px",border:"1.5px solid #c8e6c9",borderRadius:10,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                      <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
                      <div><div style={{fontSize:12,fontWeight:700,color:"#1a2e1a"}}>{t.en}</div><div style={{fontSize:10,color:"#888",direction:"rtl"}}>{t.ur}</div></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m,i)=>(
              <div key={m.id} className="msg-enter" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-start"}}>
                {m.role==="assistant"&&<div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,"+G+","+GL+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15,boxShadow:"0 2px 6px rgba(1,65,28,0.25)"}}>🇵🇰</div>}
                <div style={{maxWidth:"80%",display:"flex",flexDirection:"column",gap:6,alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{padding:"10px 14px",borderRadius:m.role==="user"?(isRTL?"18px 18px 18px 4px":"18px 18px 4px 18px"):(isRTL?"18px 18px 4px 18px":"18px 18px 18px 4px"),background:m.role==="user"?"linear-gradient(135deg,"+G+","+GL+")":"#fff",color:m.role==="user"?"#fff":"#1a2e1a",boxShadow:"0 2px 8px rgba(0,0,0,0.07)",fontSize:14,lineHeight:1.65,direction:isRTL?"rtl":"ltr"}}>
                    {m.role==="assistant"?<div dangerouslySetInnerHTML={{__html:fmt(m.content)}}/>:m.content}
                  </div>
                  {m.role==="assistant"&&(
                    <div style={{display:"flex",gap:6,paddingLeft:4}}>
                      <button onClick={()=>copyMsg(m.id,m.content)} style={{background:m.copied?"#e0f0e0":"transparent",border:"1px solid #c8e6c9",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:m.copied?"#01411C":"#888"}}>
                        {m.copied?"✓ Copied":"📋 Copy"}
                      </button>
                      <button onClick={()=>doFeedback(m.id,1)} style={{background:m.feedback===1?"#e0f0e0":"transparent",border:"1px solid #c8e6c9",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:12}}>👍</button>
                      <button onClick={()=>doFeedback(m.id,-1)} style={{background:m.feedback===-1?"#fde8e8":"transparent",border:"1px solid #c8e6c9",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:12}}>👎</button>
                    </div>
                  )}
                  {m.role==="assistant"&&i===msgs.length-1&&!loading&&(
                    <button onClick={()=>sendMsg(randFU())} style={{fontSize:11,color:G,background:"rgba(1,65,28,0.06)",border:"1px dashed #c8e6c9",borderRadius:10,padding:"4px 10px",cursor:"pointer"}}>
                      💡 {randFU()}
                    </button>
                  )}
                </div>
                {m.role==="user"&&<div style={{width:32,height:32,borderRadius:"50%",background:"#e0f0e0",border:"2px solid #c8e6c9",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>👤</div>}
              </div>
            ))}

            {loading&&(
              <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,"+G+","+GL+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>🇵🇰</div>
                <div style={{padding:"10px 14px",background:"#fff",borderRadius:"18px 18px 18px 4px",boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}}>
                  <div style={{fontSize:11,color:"#888",marginBottom:5}}>{T.typing}</div>
                  <div style={{display:"flex",gap:4}}><span className="dot"/><span className="dot"/><span className="dot"/></div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          <div style={{padding:"4px 14px",background:"#fffbeb",borderTop:"1px solid #fde68a",fontSize:10,color:"#92400e",textAlign:"center",flexShrink:0}}>⚠️ {T.disc}</div>

          <div style={{padding:"10px 12px",background:"#fff",borderTop:"1px solid #d4edda",display:"flex",gap:8,alignItems:"flex-end",flexShrink:0}}>
            <button onClick={toggleVoice} style={{width:36,height:36,borderRadius:"50%",border:"1.5px solid",borderColor:listening?"#c0392b":"#c8e6c9",background:listening?"#fde8e8":"#f5faf5",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {listening?"🔴":"🎤"}
            </button>
            <textarea ref={taRef} value={input} onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg(input);}}}
              placeholder={listening?"Listening...":T.ph} rows={1}
              style={{flex:1,padding:"9px 14px",borderRadius:20,border:"1.5px solid #c8e6c9",resize:"none",fontSize:14,fontFamily:"inherit",lineHeight:1.5,maxHeight:120,overflow:"auto",outline:"none",direction:isRTL?"rtl":"ltr",background:"#fafff5"}}
              onFocus={e=>(e.target.style.borderColor=G)} onBlur={e=>(e.target.style.borderColor="#c8e6c9")}/>
            <button onClick={()=>sendMsg(input)} disabled={loading||!input.trim()} style={{padding:"9px 16px",background:loading||!input.trim()?"#ccc":"linear-gradient(135deg,"+G+","+GL+")",color:"#fff",border:"none",borderRadius:20,cursor:loading||!input.trim()?"not-allowed":"pointer",fontWeight:700,fontSize:13,whiteSpace:"nowrap",flexShrink:0}}>
              {T.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
