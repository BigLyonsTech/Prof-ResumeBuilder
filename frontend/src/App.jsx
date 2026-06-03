import { useState, useRef, useCallback, useEffect, createContext, useContext } from "react";

const API = "/api/resumes";

// ═══════════════════════════════════════════════════════════
//  THEME TOKENS
// ═══════════════════════════════════════════════════════════
const DARK = {
  bg:"#0A0A0F", surface:"#111118", surfaceHi:"#16161F",
  border:"#1E1E2E", borderHi:"#2E2E4E",
  gold:"#F5A623", goldDim:"#C4841C", goldGlow:"rgba(245,166,35,0.12)", goldGlow2:"rgba(245,166,35,0.06)",
  text:"#F0EFE9", muted:"#6B6B7B", faint:"#3A3A4A",
  blue:"#4F6EF7", success:"#00D48A", successDim:"rgba(0,212,138,0.12)",
  danger:"#FF4D6A", dangerDim:"rgba(255,77,106,0.12)", warn:"#FFB347",
  sidebar:"#080810", inputBg:"#0A0A0F", previewBg:"#0D0D14",
  headerBg:"rgba(8,8,16,0.85)",
};

const LIGHT = {
  bg:"#F8F7F4", surface:"#FFFFFF", surfaceHi:"#F0EEE9",
  border:"#E2DDD5", borderHi:"#C8C2B8",
  gold:"#D4860A", goldDim:"#B5700A", goldGlow:"rgba(212,134,10,0.10)", goldGlow2:"rgba(212,134,10,0.05)",
  text:"#1A1714", muted:"#6B6560", faint:"#C0BAB2",
  blue:"#2952CC", success:"#0A9E6A", successDim:"rgba(10,158,106,0.10)",
  danger:"#D93054", dangerDim:"rgba(217,48,84,0.10)", warn:"#D4860A",
  sidebar:"#1A1714", inputBg:"#F0EEE9", previewBg:"#ECEAE5",
  headerBg:"rgba(248,247,244,0.90)",
};

// ═══════════════════════════════════════════════════════════
//  THEME CONTEXT — self-contained, no external file needed
// ═══════════════════════════════════════════════════════════
const ThemeContext = createContext({ theme: DARK, isDark: true, toggleTheme: () => {} });
const useTheme = () => useContext(ThemeContext);

// ═══════════════════════════════════════════════════════════
//  GLOBAL STYLES — injected dynamically so they respond to theme
// ═══════════════════════════════════════════════════════════
const DynamicStyles = () => {
  const { theme: T, isDark } = useTheme();
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes slideR  { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
      @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes spin    { to{transform:rotate(360deg)} }
      @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes glow    { 0%,100%{box-shadow:0 0 20px ${T.goldGlow}} 50%{box-shadow:0 0 40px rgba(245,166,35,0.3)} }
      @keyframes toastIn { from{opacity:0;transform:translateX(110%)} to{opacity:1;transform:translateX(0)} }
      @keyframes popIn   { from{opacity:0;transform:scale(0.9) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
      @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

      *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
      html,body,#root { height:100%; }
      body { font-family:'Inter',sans-serif; background:${T.bg}; color:${T.text}; -webkit-font-smoothing:antialiased; }
      input,textarea,select,button { font-family:'Inter',sans-serif; }
      ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:99px; }

      .fadeUp  { animation:fadeUp  0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
      .slideR  { animation:slideR  0.4s  cubic-bezier(0.16,1,0.3,1) forwards; }
      .float   { animation:float   3s    ease-in-out infinite; }
      .spin    { animation:spin    0.7s  linear infinite; }
      .pulse   { animation:pulse   2s    ease-in-out infinite; }
      .glow    { animation:glow    2s    ease-in-out infinite; }
      .toastIn { animation:toastIn 0.4s  cubic-bezier(0.16,1,0.3,1) forwards; }
      .popIn   { animation:popIn   0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }

      input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
        -webkit-box-shadow:0 0 0 1000px ${T.inputBg} inset !important;
        -webkit-text-fill-color:${T.text} !important;
        caret-color:${T.gold};
      }

      .field-input {
        width:100%; padding:12px 16px;
        background:${T.inputBg}; border:1.5px solid ${T.border};
        border-radius:12px; color:${T.text}; font-size:14px;
        outline:none; transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
      }
      .field-input:focus { border-color:${T.gold}; box-shadow:0 0 0 3px ${T.goldGlow}; }
      .field-input::placeholder { color:${T.faint}; }
      .field-input.error { border-color:${T.danger}; box-shadow:0 0 0 3px ${T.dangerDim}; }

      .card {
        background:${T.surface}; border:1.5px solid ${T.border}; border-radius:16px;
        transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
      }
      .card:hover { border-color:${T.borderHi}; box-shadow:0 8px 32px rgba(0,0,0,${isDark?0.4:0.1}); transform:translateY(-2px); }

      .btn-primary {
        background:linear-gradient(135deg,${T.gold},${T.goldDim}); color:${isDark?"#0A0A0F":"#111"};
        border:none; border-radius:12px; padding:12px 28px; font-weight:700; font-size:14px;
        cursor:pointer; transition:all 0.25s; display:inline-flex; align-items:center; gap:8px;
        box-shadow:0 4px 16px ${T.goldGlow};
      }
      .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(245,166,35,0.4); filter:brightness(1.1); }
      .btn-primary:active { transform:translateY(0); }
      .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }

      .btn-ghost {
        background:transparent; color:${T.muted}; border:1.5px solid ${T.border};
        border-radius:12px; padding:11px 22px; font-size:13px; font-weight:500;
        cursor:pointer; transition:all 0.2s; display:inline-flex; align-items:center; gap:8px;
      }
      .btn-ghost:hover { border-color:${T.gold}; color:${T.gold}; background:${T.goldGlow}; }
      .btn-ghost:disabled { opacity:0.4; cursor:not-allowed; }

      .btn-danger {
        background:transparent; color:${T.danger}; border:1.5px solid ${T.dangerDim};
        border-radius:8px; padding:7px 14px; font-size:12px; font-weight:600;
        cursor:pointer; transition:all 0.2s;
      }
      .btn-danger:hover { background:${T.dangerDim}; border-color:${T.danger}; }

      .cal-popup {
        position:absolute; top:calc(100% + 8px); left:0; z-index:999;
        background:${T.surface}; border:1.5px solid ${T.borderHi}; border-radius:16px;
        padding:20px; min-width:300px;
        box-shadow:0 20px 60px rgba(0,0,0,${isDark?0.6:0.15});
      }
      .cal-day {
        width:36px; height:36px; border-radius:8px; border:none;
        background:transparent; color:${T.muted}; font-size:12px; cursor:pointer;
        transition:all 0.15s; display:flex; align-items:center; justify-content:center; font-weight:500;
      }
      .cal-day:hover:not(:disabled) { background:${T.surfaceHi}; color:${T.text}; }
      .cal-day.today { color:${T.gold}; font-weight:700; }
      .cal-day.selected { background:linear-gradient(135deg,${T.gold},${T.goldDim}); color:${isDark?"#0A0A0F":"#111"}; font-weight:700; }
      .cal-day.other-month { opacity:0.25; }
      .cal-day:disabled { opacity:0.2; cursor:not-allowed; }

      .yr-btn {
        padding:8px 12px; border-radius:8px; border:1.5px solid ${T.border};
        background:transparent; color:${T.muted}; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s;
      }
      .yr-btn:hover { border-color:${T.gold}; color:${T.gold}; background:${T.goldGlow}; }
      .yr-btn.sel { background:${T.goldGlow}; border-color:${T.gold}; color:${T.gold}; }

      .mo-btn {
        padding:8px 6px; border-radius:8px; border:1.5px solid ${T.border};
        background:transparent; color:${T.muted}; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.15s; text-align:center;
      }
      .mo-btn:hover { border-color:${T.gold}; color:${T.gold}; background:${T.goldGlow}; }
      .mo-btn.sel { background:${T.goldGlow}; border-color:${T.gold}; color:${T.gold}; }

      .theme-btn {
        width:44px; height:26px; border-radius:99px; cursor:pointer; position:relative;
        border:2px solid ${T.border}; background:${T.surfaceHi};
        display:flex; align-items:center; padding:2px; transition:all 0.3s;
      }
      .theme-btn:hover { border-color:${T.gold}; }
      .theme-knob {
        width:18px; height:18px; border-radius:50%;
        background:linear-gradient(135deg,${T.gold},${T.goldDim});
        transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        display:flex; align-items:center; justify-content:center; font-size:10px;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
      }
    `}</style>
  );
};

// ═══════════════════════════════════════════════════════════
//  CALENDAR COMPONENTS
// ═══════════════════════════════════════════════════════════
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function MonthYearPicker({ value, onChange, placeholder="Select month", maxToday=false }) {
  const { theme: T } = useTheme();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("month");
  const today = new Date();
  const parsed = value ? new Date(value+"-01") : null;
  const [month, setMonth] = useState(parsed?parsed.getMonth():today.getMonth());
  const [year,  setYear]  = useState(parsed?parsed.getFullYear():today.getFullYear());
  const ref = useRef(null);

  useEffect(()=>{
    const h=(e)=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const display=()=>{ if(!value) return ""; const d=new Date(value+"-01"); return MONTHS[d.getMonth()].slice(0,3)+" "+d.getFullYear(); };
  const isDis=(m,y)=>maxToday&&new Date(y,m,1)>today;
  const pick=(m)=>{
    if(isDis(m,year)) return;
    onChange(`${year}-${String(m+1).padStart(2,"0")}`); setOpen(false);
  };
  const yearPage=()=>{ const s=Math.floor(year/12)*12; return Array.from({length:12},(_,i)=>s+i); };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div className="field-input" onClick={()=>{ setOpen(o=>!o); setView("month"); }}
        style={{ cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none" }}>
        <span style={{ color:value?T.text:T.faint }}>{display()||placeholder}</span>
        <span style={{ color:T.gold,fontSize:12,transition:"transform 0.2s",transform:open?"rotate(180deg)":"none" }}>▾</span>
      </div>
      {open&&(
        <div className="cal-popup popIn">
          {view==="month"&&(
            <>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                <button onClick={()=>setYear(y=>y-1)} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18,padding:"2px 8px" }}>‹</button>
                <button onClick={()=>setView("year")} style={{ background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:13,fontWeight:700 }}>{year} ▾</button>
                <button onClick={()=>setYear(y=>y+1)} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18,padding:"2px 8px" }}>›</button>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
                {MONTHS.map((m,i)=>{
                  const sel=value&&new Date(value+"-01").getMonth()===i&&new Date(value+"-01").getFullYear()===year;
                  const dis=isDis(i,year);
                  return <button key={m} className={`mo-btn${sel?" sel":""}`} onClick={()=>pick(i)} style={{ opacity:dis?.4:1,cursor:dis?"not-allowed":"pointer" }}>{m.slice(0,3)}</button>;
                })}
              </div>
              <div style={{ marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,textAlign:"center" }}>
                <button onClick={()=>{ setYear(today.getFullYear()); setMonth(today.getMonth()); onChange(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`); setOpen(false); }}
                  style={{ background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:12,fontWeight:600 }}>This Month</button>
              </div>
            </>
          )}
          {view==="year"&&(
            <>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                <button onClick={()=>setYear(y=>y-12)} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18,padding:"2px 8px" }}>‹</button>
                <span style={{ fontSize:12,fontWeight:600,color:T.muted }}>{yearPage()[0]} – {yearPage()[11]}</span>
                <button onClick={()=>setYear(y=>y+12)} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18,padding:"2px 8px" }}>›</button>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
                {yearPage().map(y=>(
                  <button key={y} className={`yr-btn${year===y?" sel":""}`} onClick={()=>{ setYear(y); setView("month"); }}>{y}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function YearPicker({ value, onChange, placeholder="Select year", min=1950, max=2100 }) {
  const { theme: T } = useTheme();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(Math.floor((parseInt(value)||new Date().getFullYear())/12)*12);
  const ref = useRef(null);

  useEffect(()=>{
    const h=(e)=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const years=Array.from({length:12},(_,i)=>page+i).filter(y=>y>=min&&y<=max);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div className="field-input" onClick={()=>setOpen(o=>!o)}
        style={{ cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none" }}>
        <span style={{ color:value?T.text:T.faint }}>{value||placeholder}</span>
        <span style={{ color:T.gold,fontSize:12,transition:"transform 0.2s",transform:open?"rotate(180deg)":"none" }}>▾</span>
      </div>
      {open&&(
        <div className="cal-popup popIn">
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <button onClick={()=>setPage(p=>Math.max(p-12,min))} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18,padding:"2px 8px" }}>‹</button>
            <span style={{ fontSize:12,fontWeight:600,color:T.muted }}>{page} – {Math.min(page+11,max)}</span>
            <button onClick={()=>setPage(p=>Math.min(p+12,max))} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18,padding:"2px 8px" }}>›</button>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
            {years.map(y=>(
              <button key={y} className={`yr-btn${String(value)===String(y)?" sel":""}`} onClick={()=>{ onChange(y); setOpen(false); }}>{y}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SVG ICONS
// ═══════════════════════════════════════════════════════════
const Icon = ({ d, size=20, color, stroke=2 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const ICONS = {
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  briefcase: "M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2",
  academic:  "M22 10v6M2 10l10-5 10 5v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm6 10V11l4-2 4 2v9",
  wrench:    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z",
  pen:       "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  doc:       "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6",
};

const STEP_ICONS = [ICONS.user, ICONS.briefcase, ICONS.academic, ICONS.wrench, ICONS.pen, ICONS.download];

// ═══════════════════════════════════════════════════════════
//  UI PRIMITIVES
// ═══════════════════════════════════════════════════════════
const Toast = ({ list }) => {
  const { theme: T } = useTheme();
  return (
    <div style={{ position:"fixed",top:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:10 }}>
      {list.map(t=>(
        <div key={t.id} className="toastIn card" style={{
          padding:"13px 20px",minWidth:290,maxWidth:380,display:"flex",alignItems:"center",gap:12,
          borderColor:t.type==="success"?T.success:t.type==="error"?T.danger:T.warn,
          boxShadow:`0 8px 32px rgba(0,0,0,0.2)`,
        }}>
          <div style={{ width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,
            background:t.type==="success"?T.successDim:t.type==="error"?T.dangerDim:"rgba(255,179,71,0.12)",
            color:t.type==="success"?T.success:t.type==="error"?T.danger:T.warn,
          }}>{t.type==="success"?"✓":t.type==="error"?"✕":"⚠"}</div>
          <p style={{ fontSize:13,color:T.text,flex:1,lineHeight:1.5 }}>{t.msg}</p>
        </div>
      ))}
    </div>
  );
};

const Field = ({ label,req,err,hint,children,char,maxChar }) => {
  const { theme: T } = useTheme();
  return (
    <div style={{ marginBottom:20 }}>
      {label&&(
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
          <label style={{ fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:T.muted }}>
            {label}{req&&<span style={{ color:T.gold,marginLeft:3 }}>*</span>}
          </label>
          {char!==undefined&&maxChar&&(
            <span style={{ fontSize:10,color:char>maxChar*0.9?T.warn:T.faint,fontFamily:"'JetBrains Mono',monospace" }}>{char}/{maxChar}</span>
          )}
        </div>
      )}
      {children}
      {hint&&!err&&<p style={{ fontSize:11,color:T.faint,marginTop:5,lineHeight:1.5 }}>{hint}</p>}
      {err&&<p style={{ fontSize:11,color:T.danger,marginTop:5,display:"flex",alignItems:"center",gap:4 }}>⚠ {err}</p>}
    </div>
  );
};

const Input    = ({err,...p}) => <input    className={`field-input ${err?"error":""}`} {...p}/>;
const Textarea = ({err,...p}) => <textarea className={`field-input ${err?"error":""}`} style={{ resize:"vertical",minHeight:110,lineHeight:1.7,...p.style}} {...p}/>;
const Select   = ({err,children,...p}) => (
  <select className={`field-input ${err?"error":""}`} style={{
    cursor:"pointer",appearance:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B7B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",paddingRight:38,...p.style
  }} {...p}>{children}</select>
);
const Row     = ({children,cols=2,gap=16}) => <div style={{ display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap }}>{children}</div>;
const Divider = ({mt=24,mb=24}) => { const {theme:T}=useTheme(); return <div style={{ margin:`${mt}px 0 ${mb}px`,height:1,background:`linear-gradient(90deg,${T.border},transparent)` }}/>; };
const Check   = ({checked,onChange,label}) => {
  const {theme:T}=useTheme();
  return (
    <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",userSelect:"none",marginBottom:18 }}>
      <div style={{
        width:20,height:20,borderRadius:6,border:`2px solid ${checked?T.gold:T.border}`,
        background:checked?T.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all 0.2s",flexShrink:0,
      }} onClick={onChange}>
        {checked&&<span style={{ color:"#111",fontSize:11,fontWeight:800 }}>✓</span>}
      </div>
      <span style={{ fontSize:13,color:T.muted }}>{label}</span>
    </label>
  );
};

// ═══════════════════════════════════════════════════════════
//  SIGNATURE PAD
// ═══════════════════════════════════════════════════════════
const SignaturePad = ({ onSave }) => {
  const {theme:T} = useTheme();
  const ref = useRef(null);
  const drawing = useRef(false);
  const [drawn, setDrawn] = useState(false);
  const [brush, setBrush] = useState(2.5);

  const init = useCallback(()=>{
    const c=ref.current; if(!c) return;
    c.width=c.offsetWidth; c.height=c.offsetHeight;
    const ctx=c.getContext("2d");
    ctx.fillStyle=T.inputBg; ctx.fillRect(0,0,c.width,c.height);
  },[T.inputBg]);

  useEffect(()=>{ setTimeout(init,60); },[init]);

  const getCtx=()=>{ const ctx=ref.current.getContext("2d"); ctx.strokeStyle=T.gold; ctx.lineWidth=brush; ctx.lineCap="round"; ctx.lineJoin="round"; return ctx; };
  const pos=(e)=>{ const r=ref.current.getBoundingClientRect(); const sx=ref.current.width/r.width,sy=ref.current.height/r.height; const s=e.touches?.[0]??e; return {x:(s.clientX-r.left)*sx,y:(s.clientY-r.top)*sy}; };
  const onStart=(e)=>{ e.preventDefault(); drawing.current=true; const {x,y}=pos(e); const c=getCtx(); c.beginPath(); c.moveTo(x,y); };
  const onMove =(e)=>{ e.preventDefault(); if(!drawing.current) return; const {x,y}=pos(e); const c=getCtx(); c.lineTo(x,y); c.stroke(); setDrawn(true); };
  const onEnd  =()=>{ drawing.current=false; };

  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:14,alignItems:"center" }}>
        <label style={{ fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:T.muted }}>Brush</label>
        {[1.5,2.5,4].map(s=>(
          <button key={s} onClick={()=>setBrush(s)} style={{ width:32,height:32,borderRadius:"50%",border:`2px solid ${brush===s?T.gold:T.border}`,background:brush===s?T.goldGlow:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ width:s*3,height:s*3,borderRadius:"50%",background:brush===s?T.gold:T.muted }}/>
          </button>
        ))}
      </div>
      <canvas ref={ref} style={{ width:"100%",height:155,display:"block",borderRadius:12,cursor:"crosshair",border:`1.5px solid ${T.border}`,background:T.inputBg,touchAction:"none" }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd}
        onMouseLeave={e=>{ onEnd(); e.currentTarget.style.borderColor=T.border; }}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
      />
      <p style={{ textAlign:"center",fontSize:11,color:T.faint,margin:"8px 0 14px" }}>Draw your signature above with mouse or touch</p>
      <div style={{ display:"flex",gap:10 }}>
        <button className="btn-ghost" onClick={()=>{ init(); setDrawn(false); }} style={{ fontSize:12 }}>↺ Clear</button>
        {drawn&&<button className="btn-primary" onClick={()=>onSave(ref.current.toDataURL("image/png"))} style={{ fontSize:12,padding:"10px 20px" }}>✓ Use Signature</button>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  LIVE PREVIEW
// ═══════════════════════════════════════════════════════════
const Preview = ({ data }) => {
  const {theme:T} = useTheme();
  const {personalInfo:pi,experiences:exp,educations:edu,skills,signature:sig}=data;
  if(!pi?.fullName&&!pi?.email) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:500,gap:16 }}>
      <Icon d={ICONS.doc} size={40} color={T.faint}/>
      <p style={{ fontSize:13,color:T.faint,textAlign:"center",lineHeight:1.8,maxWidth:220 }}>Fill in the form and your resume will appear here in real-time</p>
    </div>
  );
  const sec=(t)=>(
    <div style={{ marginTop:14,marginBottom:8 }}>
      <p style={{ fontSize:8,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#2952CC",marginBottom:3 }}>{t}</p>
      <div style={{ height:1.5,background:"linear-gradient(90deg,#2952CC,transparent)" }}/>
    </div>
  );
  const fmtD=(v)=>{ if(!v) return ""; try{ const d=new Date((v.length<=7?v+"-01":v)); return MONTHS[d.getMonth()].slice(0,3)+" "+d.getFullYear(); }catch{ return v; } };
  return (
    <div style={{ padding:"24px",fontSize:10,lineHeight:1.6,color:"#1A1714",fontFamily:"'Inter',sans-serif",background:"white",minHeight:550 }}>
      <div style={{ textAlign:"center",marginBottom:12 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#1E3A8A",lineHeight:1.2 }}>{pi.fullName||"Your Name"}</h1>
        <p style={{ fontSize:8.5,color:"#64748B",marginTop:5,lineHeight:1.9 }}>{[pi.phone,pi.email,pi.address].filter(Boolean).join("  ·  ")}</p>
        {(pi.linkedIn||pi.github||pi.portfolio)&&<p style={{ fontSize:8.5,color:"#1E3A8A",marginTop:2 }}>{[pi.linkedIn,pi.github,pi.portfolio].filter(Boolean).join("  ·  ")}</p>}
      </div>
      <div style={{ borderBottom:"2px solid #1E3A8A",marginBottom:8 }}/>
      {pi.summary&&<>{sec("Professional Summary")}<p style={{ fontSize:9,color:"#374151",lineHeight:1.65 }}>{pi.summary}</p></>}
      {exp?.filter(e=>e.company||e.jobTitle).length>0&&(
        <>{sec("Work Experience")}
          {exp.filter(e=>e.company||e.jobTitle).map((e,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex",justifyContent:"space-between" }}>
                <strong style={{ fontSize:9.5 }}>{e.jobTitle}</strong>
                <span style={{ fontSize:8,color:"#94A3B8" }}>{fmtD(e.startDate)} – {e.currentlyWorking?"Present":fmtD(e.endDate)}</span>
              </div>
              <p style={{ fontSize:8.5,color:"#64748B",fontStyle:"italic" }}>{e.company}</p>
              {e.description&&<p style={{ fontSize:8.5,color:"#374151",marginTop:2 }}>{e.description}</p>}
            </div>
          ))}
        </>
      )}
      {edu?.filter(e=>e.school).length>0&&(
        <>{sec("Education")}
          {edu.filter(e=>e.school).map((e,i)=>(
            <div key={i} style={{ marginBottom:7 }}>
              <div style={{ display:"flex",justifyContent:"space-between" }}>
                <strong style={{ fontSize:9.5 }}>{e.degree}{e.fieldOfStudy?` in ${e.fieldOfStudy}`:""}</strong>
                <span style={{ fontSize:8,color:"#94A3B8" }}>{e.startYear} – {e.currentlyStudying?"Present":e.endYear}</span>
              </div>
              <p style={{ fontSize:8.5,color:"#64748B",fontStyle:"italic" }}>{e.school}{e.gpa?`  ·  GPA ${e.gpa}`:""}</p>
            </div>
          ))}
        </>
      )}
      {skills?.filter(s=>s.name).length>0&&(
        <>{sec("Skills")}
          <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
            {skills.filter(s=>s.name).map((s,i)=>(
              <span key={i} style={{ padding:"2px 8px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:4,fontSize:8.5,color:"#1E3A8A" }}>{s.name}</span>
            ))}
          </div>
        </>
      )}
      {sig?.signatoryName&&(
        <>{sec("Signature")}
          {sig.signatureType==="TYPED"?<p style={{ fontFamily:"'Dancing Script',cursive",fontSize:20,color:"#1E3A8A" }}>{sig.signatoryName}</p>:sig.imageData&&<img src={sig.imageData} alt="sig" style={{ maxHeight:50,maxWidth:140 }}/>}
          {sig.showDate&&sig.dateLabel&&<p style={{ fontSize:8,color:"#94A3B8",marginTop:3 }}>{sig.dateLabel}</p>}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  STEPS
// ═══════════════════════════════════════════════════════════
const Step1 = ({data,set,errors}) => {
  const {theme:T}=useTheme();
  return (
    <div className="fadeUp">
      <Row>
        <Field label="Full Name" req err={errors.fullName}>
          <Input placeholder="Jane O'Brien" value={data.fullName||""} err={errors.fullName} onChange={e=>set("fullName",e.target.value.replace(/[^a-zA-Z\s''\-]/g,""))}/>
        </Field>
        <Field label="Email Address" req err={errors.email}>
          <Input type="email" placeholder="jane@example.com" value={data.email||""} err={errors.email} onChange={e=>set("email",e.target.value)}/>
        </Field>
      </Row>
      <Row>
        <Field label="Phone Number" req hint="7–15 digits, optional + prefix" err={errors.phone}>
          <Input placeholder="+1 555 123 4567" value={data.phone||""} err={errors.phone} onChange={e=>set("phone",e.target.value.replace(/[^\d+]/g,""))}/>
        </Field>
        <Field label="City / Address" req err={errors.address}>
          <Input placeholder="New York, NY, USA" value={data.address||""} err={errors.address} onChange={e=>set("address",e.target.value)}/>
        </Field>
      </Row>
      <Field label="Professional Summary" req char={(data.summary||"").length} maxChar={500} hint="Min 50 characters" err={errors.summary}>
        <Textarea placeholder="Experienced professional with a passion for..." value={data.summary||""} err={errors.summary} onChange={e=>set("summary",e.target.value)} style={{ minHeight:120 }}/>
      </Field>
      <Divider/>
      <p style={{ fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:T.muted,marginBottom:16 }}>
        Online Presence <span style={{ fontWeight:400,textTransform:"none",letterSpacing:0,color:T.faint }}>(optional)</span>
      </p>
      <Row cols={3}>
        <Field label="LinkedIn"><Input placeholder="linkedin.com/in/you" value={data.linkedIn||""} onChange={e=>set("linkedIn",e.target.value)}/></Field>
        <Field label="GitHub"><Input placeholder="github.com/you" value={data.github||""} onChange={e=>set("github",e.target.value)}/></Field>
        <Field label="Portfolio"><Input placeholder="https://yoursite.dev" value={data.portfolio||""} onChange={e=>set("portfolio",e.target.value)}/></Field>
      </Row>
    </div>
  );
};

const BLANK_EXP={company:"",jobTitle:"",description:"",startDate:"",endDate:"",currentlyWorking:false};
const Step2 = ({data,set}) => {
  const {theme:T}=useTheme();
  const add=()=>set([...data,{...BLANK_EXP}]);
  const remove=(i)=>set(data.filter((_,j)=>j!==i));
  const upd=(i,f,v)=>{ const a=[...data]; a[i]={...a[i],[f]:v}; set(a); };
  return (
    <div className="fadeUp">
      {data.length===0&&(
        <div style={{ textAlign:"center",padding:"48px 24px",border:`2px dashed ${T.border}`,borderRadius:16,marginBottom:20 }}>
          <div className="float" style={{ fontSize:40,marginBottom:12 }}>💼</div>
          <p style={{ color:T.muted,fontSize:14,marginBottom:4 }}>No experience added yet</p>
          <p style={{ color:T.faint,fontSize:12 }}>Add your most recent role first</p>
        </div>
      )}
      {data.map((exp,i)=>(
        <div key={i} className="card fadeUp" style={{ padding:24,marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:32,height:32,borderRadius:8,background:T.goldGlow,border:`1px solid ${T.gold}44`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Icon d={ICONS.briefcase} size={16} color={T.gold}/>
              </div>
              <span style={{ fontSize:12,fontWeight:700,color:T.gold,letterSpacing:".06em",textTransform:"uppercase" }}>Position {i+1}</span>
            </div>
            <button className="btn-danger" onClick={()=>remove(i)}>✕ Remove</button>
          </div>
          <Row>
            <Field label="Job Title" req><Input placeholder="Software Engineer" value={exp.jobTitle} onChange={e=>upd(i,"jobTitle",e.target.value.replace(/[^a-zA-Z\s&,'.()""-]/g,""))}/></Field>
            <Field label="Company" req><Input placeholder="Google LLC" value={exp.company} onChange={e=>upd(i,"company",e.target.value)}/></Field>
          </Row>
          <Row>
            <Field label="Start Date" req><MonthYearPicker value={exp.startDate} maxToday onChange={v=>upd(i,"startDate",v)} placeholder="Select start month"/></Field>
            <Field label="End Date"><MonthYearPicker value={exp.endDate} maxToday onChange={v=>upd(i,"endDate",v)} placeholder={exp.currentlyWorking?"Currently working here":"Select end month"}/></Field>
          </Row>
          <Check checked={exp.currentlyWorking} label="I currently work here" onChange={()=>{ upd(i,"currentlyWorking",!exp.currentlyWorking); if(!exp.currentlyWorking) upd(i,"endDate",""); }}/>
          <Field label="Description" req char={exp.description.length} maxChar={1000} hint="Min 20 characters — describe your responsibilities and impact">
            <Textarea placeholder="Led development of microservices architecture serving 2M+ users..." value={exp.description} onChange={e=>upd(i,"description",e.target.value)} style={{ minHeight:100 }}/>
          </Field>
        </div>
      ))}
      <button className="btn-ghost" onClick={add}>+ Add Work Experience</button>
    </div>
  );
};

const BLANK_EDU={school:"",degree:"",fieldOfStudy:"",startYear:"",endYear:"",gpa:"",currentlyStudying:false};
const Step3 = ({data,set}) => {
  const {theme:T}=useTheme();
  const add=()=>set([...data,{...BLANK_EDU}]);
  const remove=(i)=>set(data.filter((_,j)=>j!==i));
  const upd=(i,f,v)=>{ const a=[...data]; a[i]={...a[i],[f]:v}; set(a); };
  return (
    <div className="fadeUp">
      {data.length===0&&(
        <div style={{ textAlign:"center",padding:"48px 24px",border:`2px dashed ${T.border}`,borderRadius:16,marginBottom:20 }}>
          <div className="float" style={{ fontSize:40,marginBottom:12 }}>🎓</div>
          <p style={{ color:T.muted,fontSize:14,marginBottom:4 }}>No education added yet</p>
          <p style={{ color:T.faint,fontSize:12 }}>Add degrees and certifications</p>
        </div>
      )}
      {data.map((edu,i)=>(
        <div key={i} className="card fadeUp" style={{ padding:24,marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:32,height:32,borderRadius:8,background:`rgba(79,110,247,0.12)`,border:`1px solid ${T.blue}44`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Icon d={ICONS.academic} size={16} color={T.blue}/>
              </div>
              <span style={{ fontSize:12,fontWeight:700,color:T.blue,letterSpacing:".06em",textTransform:"uppercase" }}>Entry {i+1}</span>
            </div>
            <button className="btn-danger" onClick={()=>remove(i)}>✕ Remove</button>
          </div>
          <Field label="School / University" req><Input placeholder="Massachusetts Institute of Technology" value={edu.school} onChange={e=>upd(i,"school",e.target.value)}/></Field>
          <Row>
            <Field label="Degree" req><Input placeholder="Bachelor of Science" value={edu.degree} onChange={e=>upd(i,"degree",e.target.value.replace(/[^a-zA-Z\s.]/g,""))}/></Field>
            <Field label="Field of Study" req><Input placeholder="Computer Science" value={edu.fieldOfStudy} onChange={e=>upd(i,"fieldOfStudy",e.target.value.replace(/[^a-zA-Z\s&,'.()""-]/g,""))}/></Field>
          </Row>
          <Row cols={3}>
            <Field label="Start Year" req><YearPicker value={edu.startYear} onChange={v=>upd(i,"startYear",v)} placeholder="Year" min={1950} max={new Date().getFullYear()}/></Field>
            <Field label="End Year"><YearPicker value={edu.endYear} onChange={v=>upd(i,"endYear",v)} placeholder={edu.currentlyStudying?"Present":"Year"} min={edu.startYear||1950} max={2100}/></Field>
            <Field label="GPA (optional)"><Input type="number" placeholder="3.92" min={0} max={4} step={0.01} value={edu.gpa} onChange={e=>upd(i,"gpa",e.target.value)}/></Field>
          </Row>
          <Check checked={edu.currentlyStudying} label="Currently studying here" onChange={()=>{ upd(i,"currentlyStudying",!edu.currentlyStudying); if(!edu.currentlyStudying) upd(i,"endYear",""); }}/>
        </div>
      ))}
      <button className="btn-ghost" onClick={add}>+ Add Education</button>
    </div>
  );
};

const LEVELS=["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"];
const Step4 = ({data,set}) => {
  const {theme:T}=useTheme();
  const LC={ BEGINNER:T.muted, INTERMEDIATE:T.warn, ADVANCED:T.blue, EXPERT:T.gold };
  const LP={ BEGINNER:"25%", INTERMEDIATE:"50%", ADVANCED:"75%", EXPERT:"100%" };
  const add=()=>set([...data,{name:"",proficiencyLevel:"INTERMEDIATE"}]);
  const remove=(i)=>set(data.filter((_,j)=>j!==i));
  const upd=(i,f,v)=>{ const a=[...data]; a[i]={...a[i],[f]:v}; set(a); };
  return (
    <div className="fadeUp">
      {data.length===0&&(
        <div style={{ textAlign:"center",padding:"48px 24px",border:`2px dashed ${T.border}`,borderRadius:16,marginBottom:20 }}>
          <div className="float" style={{ fontSize:40,marginBottom:12 }}>🛠️</div>
          <p style={{ color:T.muted,fontSize:14,marginBottom:4 }}>No skills added yet</p>
          <p style={{ color:T.faint,fontSize:12 }}>Add technical skills, languages and tools</p>
        </div>
      )}
      <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:16 }}>
        {data.map((sk,i)=>(
          <div key={i} className="card fadeUp" style={{ padding:"14px 18px" }}>
            <div style={{ display:"flex",gap:10,alignItems:"center",marginBottom:10 }}>
              <Input style={{ flex:1 }} placeholder="e.g. React, Java, Python, Docker" value={sk.name} onChange={e=>upd(i,"name",e.target.value.replace(/[^a-zA-Z0-9\s#+.()/\-]/g,""))}/>
              <Select style={{ width:175 }} value={sk.proficiencyLevel} onChange={e=>upd(i,"proficiencyLevel",e.target.value)}>
                {LEVELS.map(l=><option key={l} value={l}>{l.charAt(0)+l.slice(1).toLowerCase()}</option>)}
              </Select>
              <button className="btn-danger" style={{ padding:"8px 12px" }} onClick={()=>remove(i)}>✕</button>
            </div>
            <div style={{ height:3,background:T.faint,borderRadius:2,overflow:"hidden" }}>
              <div style={{ height:"100%",borderRadius:2,width:LP[sk.proficiencyLevel],background:`linear-gradient(90deg,${LC[sk.proficiencyLevel]},${LC[sk.proficiencyLevel]}88)`,transition:"width 0.45s cubic-bezier(0.4,0,0.2,1)" }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
              {LEVELS.map(l=><span key={l} style={{ fontSize:9,textTransform:"capitalize",color:l===sk.proficiencyLevel?LC[l]:T.faint,fontWeight:l===sk.proficiencyLevel?700:400,transition:"color 0.2s" }}>{l.charAt(0)+l.slice(1).toLowerCase()}</span>)}
            </div>
          </div>
        ))}
      </div>
      <button className="btn-ghost" onClick={add}>+ Add Skill</button>
    </div>
  );
};

const SIG_FONTS=[{name:"Dancing Script",label:"Elegant"},{name:"Playfair Display",label:"Classic"},{name:"Georgia",label:"Formal"}];
const Step5 = ({data,set}) => {
  const {theme:T}=useTheme();
  const [tab,setTab]=useState(data.signatureType||"TYPED");
  const [saved,setSaved]=useState(data.imageData||null);
  const [fi,setFi]=useState(0);
  const today=new Date().toLocaleDateString("en-US",{day:"2-digit",month:"long",year:"numeric"});
  const switchTab=(t)=>{ setTab(t); set("signatureType",t); if(t==="TYPED"){set("imageData","");setSaved(null);} };
  return (
    <div className="fadeUp">
      <p style={{ fontSize:13,color:T.muted,marginBottom:24,lineHeight:1.8 }}>Add your personal signature to the bottom of your exported PDF resume.</p>
      <div style={{ display:"inline-flex",background:T.bg,borderRadius:12,padding:4,gap:4,marginBottom:28,border:`1.5px solid ${T.border}` }}>
        {[["TYPED","✏️  Typed"],["IMAGE","🖊️  Hand-drawn"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>switchTab(t)} style={{ padding:"9px 22px",border:"none",borderRadius:9,fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.2s",background:tab===t?T.surface:"transparent",color:tab===t?T.text:T.muted,boxShadow:tab===t?"0 2px 8px rgba(0,0,0,0.12)":"none" }}>{lbl}</button>
        ))}
      </div>
      {tab==="TYPED"&&(
        <div>
          <Field label="Full Name" req hint="Letters, spaces, hyphens and apostrophes only">
            <Input placeholder="Jane O'Brien" value={data.signatoryName||""} onChange={e=>set("signatoryName",e.target.value.replace(/[^a-zA-Z\s''\-]/g,""))}/>
          </Field>
          {data.signatoryName&&(
            <>
              <p style={{ fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:T.muted,marginBottom:12 }}>Choose Style</p>
              <div style={{ display:"flex",gap:10,marginBottom:20 }}>
                {SIG_FONTS.map((f,idx)=>(
                  <button key={idx} onClick={()=>setFi(idx)} style={{ flex:1,padding:"14px 12px",borderRadius:12,cursor:"pointer",transition:"all 0.2s",border:`2px solid ${fi===idx?T.gold:T.border}`,background:fi===idx?T.goldGlow:T.surface }}>
                    <p style={{ fontFamily:`'${f.name}',serif`,fontSize:18,color:fi===idx?T.gold:T.text,marginBottom:4 }}>{data.signatoryName}</p>
                    <p style={{ fontSize:10,color:T.faint }}>{f.label}</p>
                  </button>
                ))}
              </div>
              <div style={{ padding:"20px 24px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:14,textAlign:"center" }}>
                <p style={{ fontSize:10,color:T.faint,marginBottom:10,letterSpacing:".07em",textTransform:"uppercase" }}>Preview</p>
                <p style={{ fontFamily:`'${SIG_FONTS[fi].name}',serif`,fontSize:30,color:T.gold }}>{data.signatoryName}</p>
              </div>
            </>
          )}
        </div>
      )}
      {tab==="IMAGE"&&(
        saved?(
          <div>
            <div style={{ padding:"18px 22px",background:T.successDim,border:`1px solid ${T.success}44`,borderRadius:14,marginBottom:14 }}>
              <p style={{ fontSize:11,color:T.success,fontWeight:700,marginBottom:10 }}>✓ Signature captured</p>
              <img src={saved} alt="signature" style={{ maxHeight:60,maxWidth:200 }}/>
            </div>
            <button className="btn-ghost" style={{ fontSize:12 }} onClick={()=>{ setSaved(null); set("imageData",""); }}>↺ Draw again</button>
          </div>
        ):(
          <SignaturePad onSave={(url)=>{ setSaved(url); set("imageData",url); set("signatureType","IMAGE"); }}/>
        )
      )}
      <Divider mt={28} mb={20}/>
      <div style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
        <Check checked={data.showDate} label="Show date on signature" onChange={()=>{ set("showDate",!data.showDate); if(!data.showDate&&!data.dateLabel) set("dateLabel",today); }}/>
        {data.showDate&&<Input style={{ flex:1,minWidth:200 }} placeholder={today} value={data.dateLabel||""} onChange={e=>set("dateLabel",e.target.value)}/>}
      </div>
    </div>
  );
};

const Step6 = ({data,resumeId,onExport,exporting}) => {
  const {theme:T}=useTheme();
  const sections=[
    {label:"Personal Info",   done:!!data.personalInfo?.fullName, icon:ICONS.user},
    {label:"Work Experience", done:data.experiences?.length>0,    icon:ICONS.briefcase},
    {label:"Education",       done:data.educations?.length>0,     icon:ICONS.academic},
    {label:"Skills",          done:data.skills?.length>0,         icon:ICONS.wrench},
    {label:"Signature",       done:!!(data.signature?.signatoryName||data.signature?.imageData), icon:ICONS.pen},
  ];
  const complete=sections.filter(s=>s.done).length;
  return (
    <div className="fadeUp">
      <div style={{ display:"flex",alignItems:"center",gap:24,marginBottom:32,padding:"24px",background:T.surface,borderRadius:16,border:`1.5px solid ${T.border}` }}>
        <div style={{ position:"relative",width:80,height:80,flexShrink:0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke={T.faint} strokeWidth="6"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke={T.gold} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(complete/5)*213.6} 213.6`} style={{ transition:"stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }}/>
          </svg>
          <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ fontSize:18,fontWeight:700,color:T.gold }}>{complete}<span style={{ fontSize:11,color:T.muted }}>/5</span></span>
          </div>
        </div>
        <div>
          <p style={{ fontSize:16,fontWeight:600,color:T.text,marginBottom:4 }}>{complete===5?"Resume Complete! 🎉":`${5-complete} section${5-complete>1?"s":""} remaining`}</p>
          <p style={{ fontSize:12,color:T.muted,lineHeight:1.6 }}>{complete===5?"Ready to export as a professional PDF.":"Complete all sections for the best result."}</p>
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:32 }}>
        {sections.map(s=>(
          <div key={s.label} style={{ display:"flex",alignItems:"center",gap:14,padding:"13px 18px",background:T.surface,borderRadius:12,border:`1.5px solid ${s.done?T.success+"44":T.border}`,transition:"all 0.3s" }}>
            <Icon d={s.icon} size={18} color={s.done?T.success:T.muted}/>
            <span style={{ flex:1,fontSize:14,fontWeight:500,color:T.text }}>{s.label}</span>
            <span style={{ fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:99,background:s.done?T.successDim:T.dangerDim,color:s.done?T.success:T.danger }}>
              {s.done?"✓ Complete":"○ Incomplete"}
            </span>
          </div>
        ))}
      </div>
      {resumeId?(
        <button className="btn-primary glow" onClick={onExport} disabled={exporting||!data.personalInfo?.fullName}
          style={{ width:"100%",justifyContent:"center",padding:"15px 32px",fontSize:16,borderRadius:14 }}>
          {exporting?<><span className="spin" style={{ width:18,height:18,border:"2.5px solid #111",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block" }}/> Generating PDF...</>:"⬇  Download Resume PDF"}
        </button>
      ):(
        <div style={{ padding:"15px 20px",background:T.dangerDim,border:`1.5px solid ${T.danger}44`,borderRadius:12,fontSize:13,color:T.danger }}>
          ⚠ No resume saved yet. Complete Step 1 first.
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════════
const STEPS=[
  {id:1,label:"Personal Info",  sub:"Contact & summary"},
  {id:2,label:"Experience",     sub:"Work history"},
  {id:3,label:"Education",      sub:"Qualifications"},
  {id:4,label:"Skills",         sub:"Technical skills"},
  {id:5,label:"Signature",      sub:"Sign your resume"},
  {id:6,label:"Export",         sub:"Download PDF"},
];

const ThemeToggle = () => {
  const {isDark,toggleTheme} = useTheme();
  return (
    <div className="theme-btn" onClick={toggleTheme} title={isDark?"Switch to Light Mode":"Switch to Dark Mode"}>
      <div className="theme-knob" style={{ transform:isDark?"translateX(0)":"translateX(18px)" }}>
        {isDark?"🌙":"☀️"}
      </div>
    </div>
  );
};

const Sidebar = ({current,done,onGo}) => {
  const {theme:T,isDark}=useTheme();
  return (
    <aside style={{ width:252,minHeight:"100vh",background:T.sidebar,borderRight:`1px solid rgba(255,255,255,0.06)`,display:"flex",flexDirection:"column",flexShrink:0 }}>
      {/* Logo + toggle */}
      <div style={{ padding:"28px 20px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${T.gold},${T.goldDim})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${T.goldGlow}` }}>
              <Icon d={ICONS.doc} size={20} color="#111"/>
            </div>
            <div>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#F0EFE9",lineHeight:1.15,letterSpacing:"-0.3px" }}>ProfResume</h1>
              <p style={{ fontSize:9,color:T.gold,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700 }}>Builder</p>
            </div>
          </div>
          <ThemeToggle/>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"14px 10px" }}>
        {STEPS.map((s,idx)=>{
          const active=current===s.id, complete=done.includes(s.id);
          return (
            <button key={s.id} onClick={()=>onGo(s.id)} style={{
              width:"100%",padding:"11px 12px",
              background:active?"rgba(245,166,35,0.08)":"transparent",
              border:`1px solid ${active?"rgba(245,166,35,0.25)":"transparent"}`,
              borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:11,
              marginBottom:3,textAlign:"left",transition:"all 0.2s",
            }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
            >
              <div style={{
                width:36,height:36,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s",
                background:complete?"rgba(0,212,138,0.12)":active?"rgba(245,166,35,0.12)":"rgba(255,255,255,0.05)",
                border:`1.5px solid ${complete?"#00D48A":active?T.gold:"rgba(255,255,255,0.08)"}`,
                boxShadow:active?`0 0 14px ${T.goldGlow}`:"none",
              }}>
                {complete?<span style={{ fontSize:14,color:"#00D48A",fontWeight:700 }}>✓</span>:<Icon d={STEP_ICONS[idx]} size={16} color={active?T.gold:"#6B6B7B"}/>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:13,fontWeight:active?600:400,color:active?T.gold:complete?"#A0E6C8":"#9CA3AF",transition:"color 0.2s",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{s.label}</p>
                <p style={{ fontSize:10,color:"#4B5563" }}>{s.sub}</p>
              </div>
              {active&&<div style={{ width:3,height:22,borderRadius:2,background:`linear-gradient(${T.gold},${T.goldDim})`,flexShrink:0 }}/>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
          <span className="pulse" style={{ width:6,height:6,borderRadius:"50%",background:"#00D48A",display:"inline-block",flexShrink:0 }}/>
          <span style={{ fontSize:10,color:"#4B5563",fontFamily:"'JetBrains Mono',monospace" }}>MongoDB Atlas</span>
        </div>
        <p style={{ fontSize:10,color:"#374151" }}>{isDark?"🌙 Dark Mode active":"☀️ Light Mode active"}</p>
      </div>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════
const INIT={
  title:"My Resume",
  personalInfo:{fullName:"",email:"",phone:"",address:"",summary:"",linkedIn:"",github:"",portfolio:""},
  experiences:[],educations:[],skills:[],
  signature:{signatureType:"TYPED",signatoryName:"",imageData:"",showDate:true,dateLabel:""},
};
const STEP_TITLES=["Personal Information","Work Experience","Education","Skills","Signature","Review & Export"];
const STEP_DESC=["Contact details and professional summary","Work history, starting from most recent","Academic qualifications and certifications","Technical, professional and soft skills","Add your signature to the PDF","Review completeness and download"];

function AppInner() {
  const {theme:T,isDark}=useTheme();
  const [step,setStep]=useState(1);
  const [done,setDone]=useState([]);
  const [form,setForm]=useState(INIT);
  const [resumeId,setResumeId]=useState(null);
  const [toasts,setToasts]=useState([]);
  const [saving,setSaving]=useState(false);
  const [exporting,setExporting]=useState(false);
  const [preview,setPreview]=useState(true);
  const [errors,setErrors]=useState({});
  const tid=useRef(0);

  const toast=useCallback((msg,type="success")=>{
    const id=++tid.current;
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4500);
  },[]);

  const setPI =(f,v)=>setForm(d=>({...d,personalInfo:{...d.personalInfo,[f]:v}}));
  const setSig=(f,v)=>setForm(d=>({...d,signature:{...d.signature,[f]:v}}));

  const validatePI=()=>{
    const pi=form.personalInfo; const e={};
    if(!pi.fullName?.trim()) e.fullName="Full name is required";
    else if(!/^[a-zA-Z\s''\-]+$/.test(pi.fullName)) e.fullName="Letters, spaces, hyphens only";
    if(!pi.email?.trim()) e.email="Email is required";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pi.email)) e.email="Must be a valid email";
    if(!pi.phone?.trim()) e.phone="Phone is required";
    else if(!/^[+]?[0-9]{7,15}$/.test(pi.phone)) e.phone="7–15 digits, optional +";
    if(!pi.address?.trim()) e.address="Address is required";
    if(!pi.summary?.trim()) e.summary="Summary is required";
    else if(pi.summary.trim().length<50) e.summary=`Need ${50-pi.summary.trim().length} more characters`;
    return e;
  };

  const saveStep=async()=>{
    let rid=resumeId;
    if(step===1){
      if(!rid){
        const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:form.title||"My Resume"})});
        if(!r.ok) throw new Error("Failed to create resume — is the backend running?");
        const res=await r.json(); rid=res.id; setResumeId(rid);
      }
      const r=await fetch(`${API}/${rid}/personal-info`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form.personalInfo)});
      if(!r.ok){ const e=await r.json().catch(()=>({})); if(e.fieldErrors){setErrors(e.fieldErrors);throw new Error("Fix the highlighted fields.");} throw new Error(e.message||"Failed to save"); }
      toast("Personal info saved ✓");
    } else if(step===2){
      if(!rid) return;
      const r=await fetch(`${API}/${rid}/experiences`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form.experiences)});
      if(!r.ok){ const e=await r.json().catch(()=>({})); throw new Error(e.message||"Failed to save experience"); }
      toast("Work experience saved ✓");
    } else if(step===3){
      if(!rid) return;
      const edus=form.educations.map(e=>({...e,startYear:e.startYear?parseInt(e.startYear):null,endYear:e.endYear?parseInt(e.endYear):null,gpa:e.gpa?parseFloat(e.gpa):null}));
      const r=await fetch(`${API}/${rid}/educations`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(edus)});
      if(!r.ok){ const e=await r.json().catch(()=>({})); throw new Error(e.message||"Failed to save education"); }
      toast("Education saved ✓");
    } else if(step===4){
      if(!rid) return;
      const r=await fetch(`${API}/${rid}/skills`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form.skills)});
      if(!r.ok){ const e=await r.json().catch(()=>({})); throw new Error(e.message||"Failed to save skills"); }
      toast("Skills saved ✓");
    } else if(step===5){
      if(!rid) return;
      const sig=form.signature; if(!sig.signatoryName&&!sig.imageData){ toast("Signature skipped","warn"); return; }
      const r=await fetch(`${API}/${rid}/signature`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({signatureType:sig.signatureType,signatoryName:sig.signatoryName||null,imageData:sig.imageData||null,showDate:sig.showDate,dateLabel:sig.dateLabel||null})});
      if(!r.ok){ const e=await r.json().catch(()=>({})); throw new Error(e.message||"Failed to save signature"); }
      toast("Signature saved ✓");
    }
    return rid;
  };

  const handleNext=async()=>{
    if(step===1){ const e=validatePI(); if(Object.keys(e).length){ setErrors(e); toast("Fix the errors before continuing","error"); return; } setErrors({}); }
    setSaving(true);
    try { await saveStep(); setDone(d=>d.includes(step)?d:[...d,step]); setStep(s=>Math.min(s+1,6)); }
    catch(err){ toast(err.message||"Something went wrong","error"); }
    finally{ setSaving(false); }
  };

  const handleExport=async()=>{
    if(!resumeId) return; setExporting(true);
    try {
      const r=await fetch(`${API}/${resumeId}/pdf`);
      if(!r.ok) throw new Error("Failed to generate PDF");
      const blob=await r.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download=`resume-${resumeId}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast("PDF downloaded successfully ✓");
    } catch(err){ toast(err.message,"error"); }
    finally{ setExporting(false); }
  };

  return (
    <>
      <DynamicStyles/>
      <Toast list={toasts}/>
      <div style={{ display:"flex",minHeight:"100vh",background:T.bg }}>
        <Sidebar current={step} done={done} onGo={setStep}/>
        <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
          {/* Header */}
          <header style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"15px 32px",borderBottom:`1px solid ${T.border}`,
            background:T.headerBg,backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100,
          }}>
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,color:T.text,marginBottom:1 }}>{STEP_TITLES[step-1]}</h2>
              <p style={{ fontSize:11.5,color:T.faint }}>{STEP_DESC[step-1]}</p>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <input value={form.title} onChange={e=>setForm(d=>({...d,title:e.target.value}))} placeholder="Resume title..."
                style={{ padding:"8px 13px",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:9,color:T.text,fontSize:13,outline:"none",width:195 }}/>
              <button onClick={()=>setPreview(p=>!p)} style={{
                padding:"8px 14px",background:preview?T.goldGlow:T.surface,border:`1.5px solid ${preview?T.gold:T.border}`,
                borderRadius:9,color:preview?T.gold:T.muted,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.2s",
              }}>{preview?"◧ Hide":"◧ Preview"}</button>
            </div>
          </header>

          {/* Progress */}
          <div style={{ height:2.5,background:T.border }}>
            <div style={{ height:"100%",width:`${(step/6)*100}%`,background:`linear-gradient(90deg,${T.gold},${T.goldDim})`,transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 0 10px ${T.goldGlow}` }}/>
          </div>

          {/* Body */}
          <div style={{ flex:1,display:"flex",overflow:"hidden" }}>
            {/* Form */}
            <div style={{ flex:preview?"0 0 55%":1,overflow:"auto",padding:"34px 38px 80px",transition:"flex 0.3s",background:T.bg }}>
              {step===1&&<Step1 data={form.personalInfo} set={setPI} errors={errors}/>}
              {step===2&&<Step2 data={form.experiences}  set={v=>setForm(d=>({...d,experiences:v}))}/>}
              {step===3&&<Step3 data={form.educations}   set={v=>setForm(d=>({...d,educations:v}))}/>}
              {step===4&&<Step4 data={form.skills}       set={v=>setForm(d=>({...d,skills:v}))}/>}
              {step===5&&<Step5 data={form.signature}    set={setSig}/>}
              {step===6&&<Step6 data={form} resumeId={resumeId} onExport={handleExport} exporting={exporting}/>}
              {step<6&&(
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:38,paddingTop:26,borderTop:`1px solid ${T.border}` }}>
                  <button className="btn-ghost" onClick={()=>setStep(s=>Math.max(s-1,1))} disabled={step===1} style={{ opacity:step===1?.4:1 }}>← Previous</button>
                  <span style={{ fontSize:11,color:T.faint,fontFamily:"'JetBrains Mono',monospace" }}>{step} / 6</span>
                  <button className="btn-primary" onClick={handleNext} disabled={saving}>
                    {saving?<><span className="spin" style={{ width:15,height:15,border:"2px solid #111",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block" }}/> Saving...</>:step===5?"Save & Review →":"Save & Continue →"}
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            {preview&&(
              <div className="slideR" style={{ flex:"0 0 45%",borderLeft:`1px solid ${T.border}`,background:T.previewBg,overflow:"auto" }}>
                <div style={{ padding:"11px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:T.headerBg,backdropFilter:"blur(10px)",zIndex:10 }}>
                  <span style={{ fontSize:10,fontWeight:700,color:T.faint,letterSpacing:".1em",textTransform:"uppercase" }}>Live Preview</span>
                  <span style={{ fontSize:10,color:T.faint,display:"flex",alignItems:"center",gap:6 }}>
                    <span className="pulse" style={{ width:5,height:5,borderRadius:"50%",background:T.success,display:"inline-block" }}/>Real-time
                  </span>
                </div>
                <div style={{ padding:"22px 18px" }}>
                  <div style={{ background:"white",borderRadius:10,boxShadow:`0 16px 48px rgba(0,0,0,${isDark?0.6:0.1})`,minHeight:560,overflow:"hidden" }}>
                    <Preview data={form}/>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  DEFAULT EXPORT — wraps everything in ThemeProvider
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("prb-theme") !== "light"; } catch { return true; }
  });

  const toggleTheme = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("prb-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  const theme = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <AppInner/>
    </ThemeContext.Provider>
  );
}
