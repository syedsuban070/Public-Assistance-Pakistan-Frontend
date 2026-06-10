"use client";

import { useState, useRef, useEffect } from "react";

// ── Backend URL (set NEXT_PUBLIC_API_URL in Vercel env vars) ──────────────
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://burhanalqahar-public-assistance-pakistan.hf.space";

const G  = "#01411C";
const GL = "#0a5c2b";

// ── Topics ────────────────────────────────────────────────────────────────
const TOPICS = [
  { icon: "⚖️", en: "Laws & Rights",        ur: "قوانین و حقوق",         q: { en: "What are the fundamental rights of Pakistani citizens under the 1973 Constitution?",          ur: "پاکستانی آئین 1973 کے تحت شہریوں کے بنیادی حقوق کیا ہیں؟",          roman: "Pakistani constitution ke tehat citizens ke buniyadi huqooq kya hain?" } },
  { icon: "🏛️", en: "Govt Services",         ur: "سرکاری خدمات",          q: { en: "How do I access government services in Pakistan and what portals are available?",              ur: "پاکستان میں سرکاری خدمات تک رسائی کیسے حاصل کریں؟",                 roman: "Pakistan mein sarkari khidmaat tak kaise rasaai haasil karein?" } },
  { icon: "📄", en: "NADRA / CNIC",          ur: "نادرا / شناختی کارڈ",   q: { en: "What is the complete process to get or renew a CNIC from NADRA in Pakistan?",                 ur: "نادرا سے شناختی کارڈ بنوانے یا تجدید کرانے کا مکمل طریقہ کار کیا ہے؟", roman: "NADRA se CNIC banwane ya tajdeed karane ka tareeqa kya hai?" } },
  { icon: "🏠", en: "Property Laws",         ur: "جائیداد",               q: { en: "What are the property registration laws and procedures in Pakistan?",                           ur: "پاکستان میں جائیداد رجسٹریشن کے قوانین کیا ہیں؟",                   roman: "Pakistan mein jaidad registration ke qawaneen kya hain?" } },
  { icon: "💼", en: "Labor Rights",          ur: "مزدور حقوق",            q: { en: "What are my rights as an employee under Pakistani labor law, including minimum wage?",         ur: "پاکستانی مزدور قانون کے تحت ملازم کے کیا حقوق ہیں؟",               roman: "Pakistani labour law ke tehat mulazim ke kya huqooq hain?" } },
  { icon: "💰", en: "Tax / FBR",             ur: "ٹیکس / ایف بی آر",      q: { en: "How do I register for NTN and file my income tax return with FBR Pakistan?",                  ur: "این ٹی این رجسٹریشن اور ایف بی آر ٹیکس ریٹرن کیسے فائل کریں؟",    roman: "NTN registration aur FBR tax return kaise file karein?" } },
  { icon: "🚗", en: "Traffic & Vehicles",    ur: "ٹریفک اور گاڑی",        q: { en: "What is the process to register a vehicle in Pakistan and what documents are required?",      ur: "پاکستان میں گاڑی رجسٹریشن کا طریقہ اور کون سے کاغذات درکار ہیں؟", roman: "Pakistan mein gaadi registration ka tareeqa kya hai?" } },
  { icon: "🏥", en: "Healthcare",            ur: "صحت",                   q: { en: "What government healthcare programs like Sehat Sahulat are available for Pakistani citizens?",  ur: "پاکستانی شہریوں کے لیے سہت سہولت جیسے سرکاری صحت کے پروگرام کیا ہیں؟", roman: "Pakistani citizens ke liye Sehat Sahulat jaise sarkari programs kya hain?" } },
  { icon: "🎓", en: "Education",             ur: "تعلیم",                 q: { en: "What HEC scholarships and government education programs are available in Pakistan?",            ur: "پاکستان میں HEC وظائف اور سرکاری تعلیمی پروگرام کون سے ہیں؟",     roman: "Pakistan mein HEC scholarships aur taaleemi programs kya hain?" } },
  { icon: "🏢", en: "Business Reg.",         ur: "کاروباری رجسٹریشن",     q: { en: "How do I register a company or business in Pakistan with SECP and get an NTN?",               ur: "SECP کے ساتھ پاکستان میں کمپنی کیسے رجسٹر کریں؟",                  roman: "SECP ke saath Pakistan mein company kaise register karein?" } },
  { icon: "🛂", en: "Passport & Visa",       ur: "پاسپورٹ و ویزا",        q: { en: "What is the process to apply for a new Pakistani passport or renew an existing one?",          ur: "پاکستانی پاسپورٹ کی درخواست یا تجدید کا طریقہ کیا ہے؟",             roman: "Pakistani passport ki darkhwast ya tajdeed ka tareeqa kya hai?" } },
  { icon: "👨‍👩‍👧", en: "Family Laws",           ur: "خاندانی قوانین",        q: { en: "What are Pakistan's family laws under the Muslim Family Laws Ordinance regarding marriage and divorce?", ur: "مسلم فیملی لا آرڈیننس کے تحت نکاح اور طلاق کے قوانین کیا ہیں؟", roman: "Muslim Family Laws Ordinance ke tehat nikah aur talaq ke qawaneen kya hain?" } },
];

// ── Labels ────────────────────────────────────────────────────────────────
const LABELS = {
  en: {
    title: "Pakistan AI Assistant", sub: "Free civic help for every citizen",
    newChat: "New Chat", topics: "Browse Topics", send: "Send",
    ph: "Ask about Pakistani laws, rights, government procedures...",
    disc: "Not legal advice — consult a professional for important matters",
    welcome: "Assalam-o-Alaikum! 🇵🇰",
    welcomeSub: "I can help you with Pakistani laws, government procedures, your rights, and civic information — completely free.",
    quickStart: "Quick Start Topics", typing: "Researching your question...",
  },
  ur: {
    title: "پاکستان اے آئی اسسٹنٹ", sub: "ہر شہری کے لیے مفت مدد",
    newChat: "نئی گفتگو", topics: "موضوعات", send: "بھیجیں",
    ph: "پاکستانی قوانین، حقوق اور سرکاری خدمات کے بارے میں پوچھیں...",
    disc: "یہ قانونی مشورہ نہیں — اہم معاملات میں ماہر سے رجوع کریں",
    welcome: "السلام علیکم! 🇵🇰",
    welcomeSub: "میں آپ کو پاکستانی قوانین، سرکاری طریقہ کار اور آپ کے حقوق کے بارے میں مکمل مفت مدد کر سکتا ہوں۔",
    quickStart: "جلدی شروعات", typing: "آپ کے سوال کی تحقیق ہو رہی ہے...",
  },
  roman: {
    title: "Pakistan AI Assistant", sub: "Har citizen ke liye muft madad",
    newChat: "Nayi Baat", topics: "Mauzoat", send: "Bhejein",
    ph: "Pakistani qawaneen, huqooq, sarkari tareeqakar ke baare mein poochein...",
    disc: "Yeh qanooni mashwara nahi — ahem mamlaaat mein maahir se rujoo karein",
    welcome: "Assalam-o-Alaikum! 🇵🇰",
    welcomeSub: "Main aap ko Pakistani qawaneen, sarkari tareeqakar aur huqooq ke baare mein bilkul muft madad kar sakta hoon.",
    quickStart: "Jaldi Shurooat", typing: "Aapke sawal ki tahqeeq ho rahi hai...",
  },
} as const;

type Lang    = keyof typeof LABELS;
type Message = { role: "user" | "assistant"; content: string };

// ── Helpers ───────────────────────────────────────────────────────────────
function fmt(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

// ── Component ─────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [lang,        setLang]        = useState<Lang>("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef    = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(Math.random().toString(36).slice(2));

  const L     = LABELS[lang];
  const isRTL = lang === "ur";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Send ────────────────────────────────────────────────────────────────
  const sendMsg = async (text: string) => {
    if (!text.trim() || loading) return;
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message:    text,
          session_id: sessionId.current,
          language:   lang,
          history:    updated.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply || "Sorry, please try again." }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); }
  };

  // ── Shared styles ───────────────────────────────────────────────────────
  const s = {
    wrap:      { height: "100dvh", display: "flex", flexDirection: "column" as const, background: "#f0f7f0", direction: isRTL ? "rtl" as const : "ltr" as const },
    header:    { background: `linear-gradient(to right, ${G}, ${GL})`, height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" },
    body:      { flex: 1, display: "flex", overflow: "hidden", position: "relative" as const },
    sidebar:   { position: "absolute" as const, top: 0, left: isRTL ? "auto" : 0, right: isRTL ? 0 : "auto", bottom: 0, width: 272, background: "#fff", zIndex: 100, transform: sidebarOpen ? "translateX(0)" : (isRTL ? "translateX(100%)" : "translateX(-100%)"), transition: "transform 0.28s cubic-bezier(.4,0,.2,1)", display: "flex", flexDirection: "column" as const, boxShadow: sidebarOpen ? "4px 0 16px rgba(0,0,0,0.12)" : "none" },
    msgs:      { flex: 1, overflowY: "auto" as const, padding: "16px 14px", display: "flex", flexDirection: "column" as const, gap: 14 },
    disc:      { padding: "5px 14px", background: "#fffbeb", borderTop: "1px solid #fde68a", fontSize: 10, color: "#92400e", textAlign: "center" as const, flexShrink: 0 },
    inputWrap: { padding: "10px 12px", background: "#fff", borderTop: "1px solid #d4edda", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 },
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={s.wrap}>

      {/* ── HEADER ─────────────────────────────────── */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#fff", width: 36, height: 36, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ☰
          </button>
          <span style={{ fontSize: 26 }}>🇵🇰</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{L.title}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>{L.sub}</div>
          </div>
        </div>
        {/* Language switcher */}
        <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.18)", borderRadius: 20, padding: "3px 4px" }}>
          {(["en", "ur", "roman"] as Lang[]).map((c) => (
            <button key={c} onClick={() => setLang(c)}
              style={{ padding: "4px 9px", borderRadius: 14, border: "none", background: lang === c ? "#fff" : "transparent", color: lang === c ? G : "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 11, fontWeight: lang === c ? 700 : 400 }}>
              {c === "en" ? "EN" : c === "ur" ? "اردو" : "Roman"}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────── */}
      <div style={s.body}>

        {/* Overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 90 }} />
        )}

        {/* ── SIDEBAR ──────────────────────────────── */}
        <div style={s.sidebar}>
          <div style={{ padding: "12px 14px", background: "#f5faf5", borderBottom: "1px solid #d4edda", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: G, fontSize: 13 }}>📋 {L.topics}</span>
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: "#d4edda", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: G, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ×
            </button>
          </div>
          <button onClick={() => { setMessages([]); setSidebarOpen(false); }}
            style={{ margin: "10px 12px", padding: 9, background: G, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            ✨ {L.newChat}
          </button>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {TOPICS.map((t, i) => (
              <button key={i}
                onClick={() => { sendMsg(t.q[lang]); setSidebarOpen(false); }}
                style={{ width: "100%", textAlign: isRTL ? "right" : "left", padding: "10px 14px", border: "none", borderBottom: "1px solid #f0f8f0", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a2e1a" }}>{t.en}</div>
                  <div style={{ fontSize: 11, color: "#888", direction: "rtl", textAlign: "right" }}>{t.ur}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ padding: "10px 14px", borderTop: "1px solid #d4edda", background: "#f5faf5", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#888" }}>🔒 Free · Open Source · For Pakistani Citizens</div>
          </div>
        </div>

        {/* ── MAIN CHAT ────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Messages */}
          <div style={s.msgs}>

            {/* Welcome screen */}
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 10px 10px", textAlign: "center" }}>
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <div style={{ width: 76, height: 76, borderRadius: "50%", background: `linear-gradient(135deg, ${G}, ${GL})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, boxShadow: "0 4px 16px rgba(1,65,28,0.25)" }}>
                    🇵🇰
                  </div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "#C9A227", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                    🤖
                  </div>
                </div>
                <h1 style={{ color: G, fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>{L.welcome}</h1>
                <p style={{ color: "#567a56", fontSize: 13, maxWidth: 340, lineHeight: 1.65, margin: "0 0 20px" }}>{L.welcomeSub}</p>
                <div style={{ fontWeight: 700, fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{L.quickStart}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 420, width: "100%" }}>
                  {TOPICS.slice(0, 6).map((t, i) => (
                    <button key={i} onClick={() => sendMsg(t.q[lang])}
                      style={{ padding: "10px 8px", border: "1.5px solid #c8e6c9", borderRadius: 10, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a2e1a" }}>{t.en}</div>
                        <div style={{ fontSize: 10, color: "#888", direction: "rtl" }}>{t.ur}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((m, i) => (
              <div key={i} className="msg-enter"
                style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${G}, ${GL})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, boxShadow: "0 2px 6px rgba(1,65,28,0.25)" }}>
                    🇵🇰
                  </div>
                )}
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: m.role === "user"
                    ? (isRTL ? "18px 18px 18px 4px" : "18px 18px 4px 18px")
                    : (isRTL ? "18px 18px 4px 18px" : "18px 18px 18px 4px"),
                  background: m.role === "user" ? `linear-gradient(135deg, ${G}, ${GL})` : "#fff",
                  color: m.role === "user" ? "#fff" : "#1a2e1a",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  direction: isRTL ? "rtl" : "ltr",
                }}>
                  {m.role === "assistant"
                    ? <div dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
                    : m.content
                  }
                </div>
                {m.role === "user" && (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e0f0e0", border: "2px solid #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${G}, ${GL})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, boxShadow: "0 2px 6px rgba(1,65,28,0.25)" }}>
                  🇵🇰
                </div>
                <div style={{ padding: "10px 14px", background: "#fff", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 5 }}>{L.typing}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Disclaimer */}
          <div style={s.disc}>⚠️ {L.disc}</div>

          {/* Input */}
          <div style={s.inputWrap}>
            <textarea value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={L.ph}
              rows={1}
              style={{ flex: 1, padding: "9px 14px", borderRadius: 20, border: "1.5px solid #c8e6c9", resize: "none", fontSize: 14, fontFamily: "inherit", lineHeight: 1.5, maxHeight: 90, overflow: "auto", outline: "none", direction: isRTL ? "rtl" : "ltr" }}
              onFocus={(e) => (e.target.style.borderColor = G)}
              onBlur={(e)  => (e.target.style.borderColor = "#c8e6c9")}
            />
            <button onClick={() => sendMsg(input)}
              disabled={loading || !input.trim()}
              style={{ padding: "9px 16px", background: loading || !input.trim() ? "#ccc" : `linear-gradient(135deg, ${G}, ${GL})`, color: "#fff", border: "none", borderRadius: 20, cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0, boxShadow: !loading && input.trim() ? "0 2px 8px rgba(1,65,28,0.3)" : "none" }}>
              {L.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
