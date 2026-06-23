import { useState, useMemo } from "react";

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size=22, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d) ? d.map((s,i)=><path key={i} d={s}/>) : <path d={d}/>}
  </svg>
);
const HomeIcon  = () => <Icon d={["M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z","M9 21V12h6v9"]} />;
const BellIcon  = () => <Icon d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"]} />;
const TrendIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const GearIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const PlusIcon  = () => <Icon d="M12 5v14M5 12h14" />;
const ArrowLeft = () => <Icon d="M19 12H5M12 19l-7-7 7-7" />;
const ChevLeft  = () => <Icon d="M15 18l-6-6 6-6" size={16}/>;
const ChevRight = () => <Icon d="M9 18l6-6-6-6" size={16}/>;
const CheckIcon = () => <Icon d="M20 6L9 17l-5-5" size={16}/>;
const TrashIcon = () => <Icon d={["M3 6h18","M19 6l-1 14H6L5 6","M8 6V4h8v2"]} size={16}/>;
const SwapIcon  = () => <Icon d={["M7 16V4m0 0L3 8m4-4l4 4","M17 8v12m0 0l4-4m-4 4l-4-4"]} size={18}/>;
const CalIcon   = () => <Icon d={["M8 2v4M16 2v4","M3 8h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"]} size={16}/>;

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const AIRPORTS = [
  {code:"SAN",city:"San Diego"},{code:"LAX",city:"Los Angeles"},{code:"JFK",city:"New York"},
  {code:"ORD",city:"Chicago"},{code:"MIA",city:"Miami"},{code:"LAS",city:"Las Vegas"},
  {code:"SEA",city:"Seattle"},{code:"DFW",city:"Dallas"},{code:"BOS",city:"Boston"},
  {code:"ATL",city:"Atlanta"},{code:"DEN",city:"Denver"},{code:"SFO",city:"San Francisco"},
  {code:"PHX",city:"Phoenix"},{code:"HNL",city:"Honolulu"},{code:"MCO",city:"Orlando"},
  {code:"EWR",city:"Newark"},{code:"IAH",city:"Houston"},{code:"MSP",city:"Minneapolis"},
];
const COLORS = ["#4F8EF7","#A78BFA","#34D399","#F87171","#FBBF24","#F472B6","#60A5FA","#FB923C"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const fmt    = d => d ? new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "";
const uid    = () => Math.random().toString(36).slice(2,8);
const toKey  = d => d.toISOString().slice(0,10);

// ── PRICE CALENDAR GENERATOR ──────────────────────────────────────────────────
// Deterministic mock prices based on route + date so they're stable per session
function genCalPrices(from, to, baseYear, baseMonth) {
  const seed = (from+to).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const prices = {};
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let m = 0; m < 2; m++) {
    const month = (baseMonth + m) % 12;
    const year  = baseYear + Math.floor((baseMonth + m) / 12);
    const days  = new Date(year, month+1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const dt = new Date(year, month, d);
      if (dt < today) continue;
      const key = toKey(dt);
      // Simulate price variation: weekends cheaper, mid-month spikes, route-based base
      const dow      = dt.getDay();
      const base     = 180 + (seed % 180);
      const wknd     = (dow===2||dow===3) ? -20 : (dow===5||dow===6||dow===0) ? 30 : 0;
      const midSpike = d > 12 && d < 18 ? 40 : 0;
      const noise    = ((seed * d * (month+1)) % 60) - 20;
      prices[key]    = Math.round(base + wknd + midSpike + noise);
    }
  }
  return prices;
}

// ── PRICE CALENDAR COMPONENT ──────────────────────────────────────────────────
function PriceCalendar({ from, to, selectedDepart, selectedReturn, onSelectDepart, onSelectReturn, selectingReturn }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDepart ? new Date(selectedDepart+"T12:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const prices = useMemo(() =>
    from && to ? genCalPrices(from, to, viewMonth.year, viewMonth.month) : {},
    [from, to, viewMonth.year, viewMonth.month]
  );

  const vals     = Object.values(prices);
  const minPrice = vals.length ? Math.min(...vals) : 0;
  const maxPrice = vals.length ? Math.max(...vals) : 999;
  const midPrice = (minPrice + maxPrice) / 2;

  const priceColor = (p) => {
    if (!p) return "#555E73";
    if (p <= minPrice + (maxPrice - minPrice) * 0.25) return "#34D399";
    if (p <= midPrice) return "#FBBF24";
    return "#F87171";
  };

  const prevMonth = () => setViewMonth(v => {
    const d = new Date(v.year, v.month - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setViewMonth(v => {
    const d = new Date(v.year, v.month + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const firstDay  = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysCount = new Date(viewMonth.year, viewMonth.month+1, 0).getDate();

  const handleDay = (key) => {
    if (selectingReturn) {
      if (selectedDepart && key <= selectedDepart) return;
      onSelectReturn(key);
    } else {
      onSelectDepart(key);
    }
  };

  const isSelected  = (key) => key === selectedDepart || key === selectedReturn;
  const isInRange   = (key) => selectedDepart && selectedReturn && key > selectedDepart && key < selectedReturn;
  const isStart     = (key) => key === selectedDepart;
  const isEnd       = (key) => key === selectedReturn;
  const isPast      = (key) => new Date(key+"T12:00:00") < today;

  // Legend: find cheapest days of this month for badge
  const cheapDays   = Object.entries(prices)
    .filter(([k]) => k.startsWith(`${viewMonth.year}-${String(viewMonth.month+1).padStart(2,"0")}`))
    .sort(([,a],[,b]) => a-b).slice(0,3).map(([k])=>k);

  return (
    <div style={{ background:"#111318", borderRadius:12, overflow:"hidden", border:"1px solid #252B3B" }}>
      {/* Month nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 14px", borderBottom:"1px solid #252B3B" }}>
        <button onClick={prevMonth}
          style={{ background:"#1E2330", border:"1px solid #2E3448", borderRadius:7,
            padding:"4px 8px", color:"#8B93A8", cursor:"pointer", display:"flex" }}>
          <ChevLeft />
        </button>
        <div style={{ fontSize:13, fontWeight:700, color:"#F0F2F8", letterSpacing:-0.3 }}>
          {MONTHS[viewMonth.month]} {viewMonth.year}
        </div>
        <button onClick={nextMonth}
          style={{ background:"#1E2330", border:"1px solid #2E3448", borderRadius:7,
            padding:"4px 8px", color:"#8B93A8", cursor:"pointer", display:"flex" }}>
          <ChevRight />
        </button>
      </div>

      {/* Selecting hint */}
      <div style={{ padding:"8px 14px 4px", fontSize:10, fontWeight:600, color: selectingReturn ? "#A78BFA" : "#4F8EF7",
        textTransform:"uppercase", letterSpacing:.6 }}>
        {selectingReturn ? "↩ Tap return date (optional)" : "✈ Tap departure date"}
      </div>

      {/* Day headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"4px 8px 0" }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:9, fontWeight:600,
            color:"#555E73", padding:"4px 0", textTransform:"uppercase", letterSpacing:.4 }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"2px 8px 10px", gap:"2px 0" }}>
        {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`} />)}
        {Array.from({length: daysCount}).map((_,i) => {
          const day  = i+1;
          const key  = `${viewMonth.year}-${String(viewMonth.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const p    = prices[key];
          const past = isPast(key);
          const sel  = isSelected(key);
          const rng  = isInRange(key);
          const st   = isStart(key);
          const en   = isEnd(key);
          const chp  = cheapDays.includes(key);

          return (
            <div key={key} onClick={() => !past && p && handleDay(key)}
              style={{
                position:"relative",
                display:"flex", flexDirection:"column", alignItems:"center",
                padding:"4px 2px",
                borderRadius: st ? "8px 0 0 8px" : en ? "0 8px 8px 0" : rng ? 0 : 6,
                background: sel ? "#4F8EF7" : rng ? "rgba(79,142,247,.12)" : "transparent",
                cursor: past || !p ? "default" : "pointer",
                opacity: past || !p ? 0.3 : 1,
              }}>
              <div style={{
                fontSize:11, fontWeight: sel ? 800 : 600,
                color: sel ? "#fff" : "#C8CEDF",
                lineHeight:1, marginBottom:2,
              }}>{day}</div>
              {p && (
                <div style={{
                  fontSize:8, fontWeight:700,
                  color: sel ? "rgba(255,255,255,.8)" : priceColor(p),
                  lineHeight:1,
                }}>
                  ${p < 1000 ? p : (p/1000).toFixed(1)+"k"}
                </div>
              )}
              {chp && !sel && (
                <div style={{ position:"absolute", top:1, right:2, width:4, height:4,
                  borderRadius:"50%", background:"#34D399" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 14px",
        borderTop:"1px solid #252B3B", justifyContent:"center" }}>
        {[["#34D399","Cheapest"],["#FBBF24","Moderate"],["#F87171","Expensive"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:c }} />
            <span style={{ fontSize:9, color:"#555E73", fontWeight:500 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SHEET ──────────────────────────────────────────────────────────────────────
function Sheet({ children, onClose, title }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.65)" }} />
      <div style={{ position:"relative", background:"#161A22", borderRadius:"20px 20px 0 0",
        padding:"0 18px 28px", maxHeight:"92vh", display:"flex", flexDirection:"column",
        border:"1px solid #252B3B", borderBottom:"none" }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 6px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#2E3448" }} />
        </div>
        {title && <div style={{ fontSize:15, fontWeight:700, color:"#F0F2F8", marginBottom:14, letterSpacing:-0.3 }}>{title}</div>}
        <div style={{ flex:1, overflowY:"auto" }}>{children}</div>
      </div>
    </div>
  );
}

// ── AIRPORT SHEET ──────────────────────────────────────────────────────────────
function AirportSheet({ value, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const list = AIRPORTS.filter(a =>
    a.code.includes(q.toUpperCase()) || a.city.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <Sheet onClose={onClose} title="Select Airport">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search city or code…"
        style={{ width:"100%", background:"#1E2330", border:"1.5px solid #2E3448", borderRadius:9,
          padding:"10px 14px", color:"#F0F2F8", fontSize:14, fontFamily:"Inter,sans-serif",
          marginBottom:10, outline:"none" }} />
      <div style={{ overflowY:"auto", maxHeight:340 }}>
        {list.map(a => (
          <div key={a.code} onClick={() => { onSelect(a); onClose(); }}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"11px 4px", borderBottom:"1px solid #1E2330", cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.background="#1E2330"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, letterSpacing:-0.5, color:"#F0F2F8" }}>{a.code}</div>
              <div style={{ fontSize:11, color:"#555E73", marginTop:1 }}>{a.city}</div>
            </div>
            {value===a.code && <span style={{color:"#4F8EF7"}}><CheckIcon /></span>}
          </div>
        ))}
      </div>
    </Sheet>
  );
}

// ── ADD ROUTE FORM ─────────────────────────────────────────────────────────────
function AddRouteForm({ onSave, onClose }) {
  const [from,      setFrom]      = useState({code:"SAN",city:"San Diego"});
  const [to,        setTo]        = useState({code:"",city:""});
  const [depart,    setDepart]    = useState("");
  const [ret,       setRet]       = useState("");
  const [threshold, setThreshold] = useState(300);
  const [pax,       setPax]       = useState(1);
  const [picker,    setPicker]    = useState(null);       // "from"|"to"
  const [calOpen,   setCalOpen]   = useState(false);
  const [selRet,    setSelRet]    = useState(false);      // are we picking return?
  const [step,      setStep]      = useState("route");    // "route"|"cal"|"details"

  const canShowCal = from.code && to.code;
  const valid = from.code && to.code && depart && threshold > 0;

  const handleSave = () => {
    if (!valid) return;
    const prices = genCalPrices(from.code, to.code, new Date().getFullYear(), new Date().getMonth());
    const mockPrice = depart && prices[depart] ? prices[depart] : threshold + Math.round(Math.random()*60+10);
    const hist = Array.from({length:9}, () => Math.round(mockPrice + (Math.random()-.4)*30));
    onSave({
      id: uid(), from:from.code, fromCity:from.city, to:to.code, toCity:to.city,
      depart, ret, threshold, passengers:pax,
      currentPrice: mockPrice, history: hist,
      status:"watching", lastScan:"just now", nextScan:"8h 0m"
    });
    onClose();
  };

  if (picker) return (
    <AirportSheet value={picker==="from"?from.code:to.code}
      onSelect={a => picker==="from" ? setFrom(a) : setTo(a)}
      onClose={() => setPicker(null)} />
  );

  return (
    <Sheet onClose={onClose} title="Add Route">

      {/* STEP INDICATOR */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {[["route","Route"],["cal","Dates"],["details","Details"]].map(([s,l],i) => (
          <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div onClick={() => (s==="cal"&&!canShowCal) ? null : setStep(s)}
              style={{ display:"flex", alignItems:"center", gap:5, cursor: s==="cal"&&!canShowCal?"default":"pointer" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:10, fontWeight:700,
                background: step===s ? "#4F8EF7" : "#1E2330",
                border: `1.5px solid ${step===s ? "#4F8EF7" : "#2E3448"}`,
                color: step===s ? "#fff" : "#555E73" }}>{i+1}</div>
              <span style={{ fontSize:11, fontWeight:600, color:step===s?"#F0F2F8":"#555E73" }}>{l}</span>
            </div>
            {i < 2 && <div style={{ width:20, height:1, background:"#2E3448" }} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: ROUTE ── */}
      {step==="route" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 36px 1fr", gap:8 }}>
            <button onClick={() => setPicker("from")} style={tileBtn}>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:-1, color:"#F0F2F8" }}>{from.code||"—"}</div>
              <div style={{ fontSize:10, color:"#555E73", marginTop:2 }}>{from.city||"Origin"}</div>
            </button>
            <button onClick={() => { const t=from; setFrom(to); setTo(t); }}
              style={{ background:"#252B3B", border:"1px solid #2E3448", borderRadius:"50%",
                width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", color:"#8B93A8", alignSelf:"center" }}>
              <SwapIcon />
            </button>
            <button onClick={() => setPicker("to")} style={tileBtn}>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:-1, color:to.code?"#F0F2F8":"#555E73" }}>{to.code||"—"}</div>
              <div style={{ fontSize:10, color:"#555E73", marginTop:2 }}>{to.city||"Destination"}</div>
            </button>
          </div>
          <Lbl>Passengers</Lbl>
          <div style={{ display:"flex", gap:8 }}>
            {[1,2,3,4].map(n => (
              <button key={n} onClick={()=>setPax(n)}
                style={{ flex:1, padding:"9px 0", borderRadius:8, fontFamily:"Inter,sans-serif",
                  background:pax===n?"rgba(79,142,247,.15)":"#1E2330",
                  border:`1.5px solid ${pax===n?"#4F8EF7":"#2E3448"}`,
                  color:pax===n?"#4F8EF7":"#8B93A8", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                {n}
              </button>
            ))}
          </div>
          <PrimaryBtn onClick={() => setStep("cal")} disabled={!canShowCal}>
            {canShowCal ? "Browse Prices →" : "Select both airports first"}
          </PrimaryBtn>
        </div>
      )}

      {/* ── STEP 2: CALENDAR ── */}
      {step==="cal" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Route summary */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"#1E2330", borderRadius:10, padding:"10px 14px" }}>
            <span style={{ fontSize:14, fontWeight:800, color:"#F0F2F8", letterSpacing:-0.5 }}>
              {from.code} <span style={{color:"#555E73",fontWeight:300}}>→</span> {to.code}
            </span>
            <div style={{ display:"flex", gap:8, fontSize:11 }}>
              {depart && (
                <div style={{ background:"rgba(79,142,247,.15)", border:"1px solid rgba(79,142,247,.3)",
                  borderRadius:6, padding:"3px 8px", color:"#4F8EF7", fontWeight:600 }}>
                  ✈ {fmt(depart)}
                </div>
              )}
              {ret && (
                <div style={{ background:"rgba(167,139,250,.15)", border:"1px solid rgba(167,139,250,.3)",
                  borderRadius:6, padding:"3px 8px", color:"#A78BFA", fontWeight:600 }}>
                  ↩ {fmt(ret)}
                </div>
              )}
            </div>
          </div>

          {/* Toggle depart/return picker */}
          <div style={{ display:"flex", background:"#1E2330", borderRadius:8, padding:3, gap:3 }}>
            {[false,true].map(isRet => (
              <button key={String(isRet)} onClick={() => setSelRet(isRet)}
                style={{ flex:1, padding:"7px 0", borderRadius:6, border:"none", cursor:"pointer",
                  fontFamily:"Inter,sans-serif", fontSize:11, fontWeight:600, transition:"all .15s",
                  background: selRet===isRet ? "#4F8EF7" : "transparent",
                  color: selRet===isRet ? "#fff" : "#555E73" }}>
                {isRet ? "↩ Return" : "✈ Depart"}
              </button>
            ))}
          </div>

          <PriceCalendar
            from={from.code} to={to.code}
            selectedDepart={depart} selectedReturn={ret}
            onSelectDepart={k => { setDepart(k); setSelRet(true); }}
            onSelectReturn={k => setRet(k)}
            selectingReturn={selRet}
          />

          {depart && (
            <PrimaryBtn onClick={() => setStep("details")}>Set Alert →</PrimaryBtn>
          )}
          {!depart && (
            <div style={{ textAlign:"center", fontSize:12, color:"#555E73", padding:"4px 0" }}>
              Tap a date on the calendar to select it
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: DETAILS ── */}
      {step==="details" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Summary */}
          <div style={{ background:"#1E2330", borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#F0F2F8", letterSpacing:-0.5, marginBottom:6 }}>
              {from.code} → {to.code}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <Chip color="#4F8EF7">✈ {fmt(depart)}</Chip>
              {ret && <Chip color="#A78BFA">↩ {fmt(ret)}</Chip>}
              <Chip color="#8B93A8">{pax} pax</Chip>
            </div>
            <button onClick={() => setStep("cal")}
              style={{ marginTop:8, fontSize:11, color:"#4F8EF7", background:"none", border:"none",
                cursor:"pointer", fontFamily:"Inter,sans-serif", padding:0, fontWeight:600 }}>
              ← Change dates
            </button>
          </div>

          {/* Price context from calendar */}
          {(() => {
            const prices = genCalPrices(from.code, to.code, new Date().getFullYear(), new Date().getMonth());
            const cal    = prices[depart];
            const vals   = Object.values(prices);
            const minP   = Math.min(...vals);
            const avgP   = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
            return cal ? (
              <div style={{ background:"rgba(79,142,247,.08)", border:"1px solid rgba(79,142,247,.2)",
                borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#4F8EF7", fontWeight:600, textTransform:"uppercase",
                  letterSpacing:.6, marginBottom:6 }}>Price intel for {fmt(depart)}</div>
                <div style={{ display:"flex", gap:16 }}>
                  <div>
                    <div style={{ fontSize:22, fontWeight:800, color:"#F0F2F8", letterSpacing:-1 }}>${cal}</div>
                    <div style={{ fontSize:10, color:"#555E73" }}>This date</div>
                  </div>
                  <div>
                    <div style={{ fontSize:22, fontWeight:800, color:"#34D399", letterSpacing:-1 }}>${minP}</div>
                    <div style={{ fontSize:10, color:"#555E73" }}>Cheapest day</div>
                  </div>
                  <div>
                    <div style={{ fontSize:22, fontWeight:800, color:"#8B93A8", letterSpacing:-1 }}>${avgP}</div>
                    <div style={{ fontSize:10, color:"#555E73" }}>Avg this month</div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          <div>
            <Lbl>Alert me when price drops below</Lbl>
            <div style={{ display:"flex", alignItems:"center", background:"#1E2330",
              border:"1.5px solid #2E3448", borderRadius:9, padding:"8px 14px", gap:4 }}>
              <span style={{ fontSize:20, fontWeight:700, color:"#555E73" }}>$</span>
              <input type="number" value={threshold} onChange={e=>setThreshold(+e.target.value)}
                style={{ flex:1, background:"transparent", border:"none", fontSize:26, fontWeight:800,
                  color:"#F0F2F8", letterSpacing:-1, fontFamily:"Inter,sans-serif", outline:"none" }} />
            </div>
            {(() => {
              const prices = genCalPrices(from.code, to.code, new Date().getFullYear(), new Date().getMonth());
              const cal    = prices[depart];
              if (!cal) return null;
              const diff   = cal - threshold;
              return (
                <div style={{ fontSize:11, color: diff > 0 ? "#34D399" : "#FBBF24", marginTop:5, fontWeight:600 }}>
                  {diff > 0
                    ? `↓ $${diff} below today's price — you'd get notified now`
                    : `↑ Above today's price of $${cal} — still watching for a better deal`}
                </div>
              );
            })()}
          </div>

          <PrimaryBtn onClick={handleSave} disabled={!valid}>Start Tracking</PrimaryBtn>
        </div>
      )}
    </Sheet>
  );
}

// ── ADD TRIP FORM ──────────────────────────────────────────────────────────────
function AddTripForm({ onSave, onClose }) {
  const [name,  setName]  = useState("");
  const [color, setColor] = useState(COLORS[0]);
  return (
    <Sheet onClose={onClose} title="New Trip">
      <div style={{ marginBottom:16 }}>
        <Lbl>Trip Name</Lbl>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Summer Vacation"
          style={{ ...inp, fontSize:15 }} />
      </div>
      <div style={{ marginBottom:24 }}>
        <Lbl>Color</Lbl>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {COLORS.map(c => (
            <button key={c} onClick={()=>setColor(c)}
              style={{ width:32, height:32, borderRadius:"50%", background:c, border:"none",
                cursor:"pointer", outline:color===c?`3px solid ${c}`:"3px solid transparent", outlineOffset:2 }} />
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={() => { if(name.trim()){ onSave({id:uid(),name:name.trim(),color,routes:[]}); onClose(); } }}
        disabled={!name.trim()}>
        Create Trip
      </PrimaryBtn>
    </Sheet>
  );
}

// ── SPARKLINE ─────────────────────────────────────────────────────────────────
function Spark({ data, threshold }) {
  if (!data||data.length<2) return null;
  const W=110,H=36,pad=3;
  const mn=Math.min(...data)-5, mx=Math.max(...data)+5;
  const x=i=>pad+(i/(data.length-1))*(W-pad*2);
  const y=v=>H-pad-((v-mn)/(mx-mn))*(H-pad*2);
  const ci=data.findIndex(v=>v<threshold);
  return (
    <svg width={W} height={H} style={{overflow:"visible"}}>
      {ci>0 && <polyline points={data.slice(0,ci+1).map((v,i)=>`${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#4F8EF7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>}
      {ci>=0 && <polyline points={data.slice(ci).map((v,i)=>`${x(ci+i)},${y(v)}`).join(" ")} fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>}
      {ci===-1 && <polyline points={data.map((v,i)=>`${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#4F8EF7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>}
      <circle cx={x(data.length-1)} cy={y(data[data.length-1])} r="3"
        fill={ci>=0?"#34D399":"#4F8EF7"} stroke="#161A22" strokeWidth="1.5"/>
    </svg>
  );
}

// ── FULL CHART ─────────────────────────────────────────────────────────────────
function FullChart({ data, threshold }) {
  if (!data||data.length<2) return null;
  const W=300,H=110,px=8,py=12;
  const mn=Math.min(...data,threshold)-15, mx=Math.max(...data,threshold)+15;
  const x=i=>px+(i/(data.length-1))*(W-px*2);
  const y=v=>H-py-((v-mn)/(mx-mn))*(H-py*2);
  const ci=data.findIndex(v=>v<threshold);
  const bp=ci>0?data.slice(0,ci+1):(ci===-1?data:[]);
  const gp=ci>=0?data.slice(ci):[];
  const ty=y(threshold);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F8EF7" stopOpacity=".15"/><stop offset="100%" stopColor="#4F8EF7" stopOpacity="0"/></linearGradient>
        <linearGradient id="gg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34D399" stopOpacity=".15"/><stop offset="100%" stopColor="#34D399" stopOpacity="0"/></linearGradient>
      </defs>
      {[.25,.5,.75].map(f=><line key={f} x1={px} y1={py+f*(H-py*2)} x2={W-px} y2={py+f*(H-py*2)} stroke="#252B3B" strokeWidth="1"/>)}
      <line x1={px} y1={ty} x2={W-px} y2={ty} stroke="#F87171" strokeWidth="1.5" strokeDasharray="5 4" opacity=".7"/>
      <text x={px+2} y={ty-4} fill="#F87171" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="600">${threshold} limit</text>
      {bp.length>1&&<path fill="url(#bg2)" d={`M${x(0)},${y(bp[0])} ${bp.map((v,i)=>`L${x(i)},${y(v)}`).join(" ")} L${x(bp.length-1)},${H} L${x(0)},${H} Z`}/>}
      {gp.length>1&&<path fill="url(#gg2)" d={`M${x(ci)},${y(gp[0])} ${gp.map((v,i)=>`L${x(ci+i)},${y(v)}`).join(" ")} L${x(data.length-1)},${H} L${x(ci)},${H} Z`}/>}
      {bp.length>1&&<polyline points={bp.map((v,i)=>`${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#4F8EF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
      {gp.length>1&&<polyline points={gp.map((v,i)=>`${x(ci+i)},${y(v)}`).join(" ")} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
      {data.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r={i===data.length-1?4.5:3} fill={ci>=0&&i>=ci?"#34D399":"#4F8EF7"} stroke="#161A22" strokeWidth="2"/>)}
    </svg>
  );
}

// ── ROUTE DETAIL ───────────────────────────────────────────────────────────────
function RouteDetail({ route, onBack, onDelete }) {
  const dropped = route.currentPrice < route.threshold;
  const trend   = route.history[route.history.length-1] - route.history[0];
  return (
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"#1E2330",border:"1px solid #2E3448",borderRadius:9,padding:"7px 10px",color:"#8B93A8",cursor:"pointer",display:"flex"}}><ArrowLeft/></button>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:"#555E73",fontWeight:600,textTransform:"uppercase",letterSpacing:.6}}>Route Detail</div>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:-1,color:"#F0F2F8"}}>{route.from} <span style={{color:"#555E73",fontWeight:300}}>→</span> {route.to}</div>
        </div>
        <button onClick={onDelete} style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.2)",borderRadius:9,padding:"7px 10px",color:"#F87171",cursor:"pointer",display:"flex"}}><TrashIcon/></button>
      </div>
      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"#555E73",textTransform:"uppercase",letterSpacing:.6,marginBottom:4}}>Current Price</div>
              <div style={{fontSize:38,fontWeight:800,letterSpacing:-2,color:dropped?"#34D399":"#F0F2F8",lineHeight:1}}>${route.currentPrice}</div>
              <div style={{fontSize:12,color:"#555E73",marginTop:4}}>{route.passengers} pax · {fmt(route.depart)}{route.ret?` – ${fmt(route.ret)}`:""}</div>
            </div>
            <div style={{textAlign:"right"}}>
              {dropped
                ?<div style={{background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.25)",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#34D399"}}>↓ Below limit</div>
                :<div style={{background:"rgba(79,142,247,.12)",border:"1px solid rgba(79,142,247,.25)",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#4F8EF7"}}>Watching</div>
              }
              <div style={{fontSize:11,color:"#555E73",marginTop:8}}>Limit: ${route.threshold}</div>
            </div>
          </div>
          <FullChart data={route.history} threshold={route.threshold}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[
            {l:"Trend",v:trend<0?"↓ Falling":"↑ Rising",c:trend<0?"#34D399":"#F87171",s:`${Math.abs(trend).toFixed(0)}pts 14d`},
            {l:"Pred Low",v:`~$${Math.round(route.currentPrice*.92)}`,c:"#F0F2F8",s:"Based on trend"},
            {l:"Signal",v:dropped?"Buy Now":"Wait",c:dropped?"#34D399":"#FBBF24",s:dropped?"Price is low":"Still watching"},
          ].map(s=>(
            <div key={s.l} style={{background:"#1E2330",border:"1px solid #252B3B",borderRadius:10,padding:12}}>
              <div style={{fontSize:9,fontWeight:600,color:"#555E73",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{s.l}</div>
              <div style={{fontSize:13,fontWeight:800,color:s.c,letterSpacing:-0.3}}>{s.v}</div>
              <div style={{fontSize:9,color:"#555E73",marginTop:2}}>{s.s}</div>
            </div>
          ))}
        </div>
        {dropped&&(
          <button style={{width:"100%",padding:15,background:"linear-gradient(135deg,#34D399,#059669)",color:"#0A2118",border:"none",borderRadius:10,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"Inter,sans-serif",boxShadow:"0 4px 20px rgba(52,211,153,.35)"}}>
            Book Now for ${route.currentPrice} →
          </button>
        )}
      </div>
    </div>
  );
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────────
function HomeScreen({ trips, setTrips }) {
  const [showAddTrip,  setShowAddTrip]  = useState(false);
  const [addRouteFor,  setAddRouteFor]  = useState(null);
  const [detail,       setDetail]       = useState(null);

  const allRoutes = trips.flatMap(t=>t.routes.map(r=>({...r,tripId:t.id,tripName:t.name,tripColor:t.color})));
  const dropped   = allRoutes.filter(r=>r.currentPrice<r.threshold);

  const addTrip   = t  => setTrips(ts=>[...ts,t]);
  const addRoute  = r  => setTrips(ts=>ts.map(t=>t.id===addRouteFor?{...t,routes:[...t.routes,r]}:t));
  const delRoute  = (tid,rid) => { setTrips(ts=>ts.map(t=>t.id===tid?{...t,routes:t.routes.filter(r=>r.id!==rid)}:t)); setDetail(null); };
  const delTrip   = id => setTrips(ts=>ts.filter(t=>t.id!==id));

  if (detail) {
    const trip  = trips.find(t=>t.id===detail.tripId);
    const route = trip?.routes.find(r=>r.id===detail.routeId);
    if (route) return <RouteDetail route={route} tripColor={trip.color} onBack={()=>setDetail(null)} onDelete={()=>delRoute(detail.tripId,detail.routeId)}/>;
  }

  return (
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
        {dropped.map(r=>(
          <div key={r.id} onClick={()=>setDetail({tripId:r.tripId,routeId:r.id})}
            style={{background:"linear-gradient(135deg,rgba(52,211,153,.12),rgba(52,211,153,.05))",border:"1px solid rgba(52,211,153,.3)",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
            <div style={{fontSize:20}}>🎯</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"#34D399"}}>Price drop — {r.from} → {r.to}</div>
              <div style={{fontSize:12,color:"#8B93A8",marginTop:2}}>${r.currentPrice} · Under ${r.threshold} limit</div>
            </div>
            <div style={{fontSize:13,fontWeight:800,color:"#34D399"}}>Book →</div>
          </div>
        ))}

        {trips.map(trip=>(
          <div key={trip.id} style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:trip.color,boxShadow:`0 0 8px ${trip.color}80`}}/>
                <div style={{fontSize:14,fontWeight:700,color:"#F0F2F8",letterSpacing:-0.3}}>{trip.name}</div>
                <div style={{fontSize:11,color:"#555E73"}}>{trip.routes.length} route{trip.routes.length!==1?"s":""}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setAddRouteFor(trip.id)}
                  style={{background:"rgba(79,142,247,.12)",border:"1px solid rgba(79,142,247,.2)",borderRadius:7,padding:"5px 10px",color:"#4F8EF7",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>+ Route</button>
                {trip.routes.length===0&&<button onClick={()=>delTrip(trip.id)} style={{background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.15)",borderRadius:7,padding:"5px 8px",color:"#F87171",cursor:"pointer",display:"flex"}}><TrashIcon/></button>}
              </div>
            </div>
            {trip.routes.length===0
              ?<div style={{padding:"18px 16px",textAlign:"center",color:"#555E73",fontSize:13}}>Tap <b style={{color:"#4F8EF7"}}>+ Route</b> to start tracking</div>
              :trip.routes.map(route=>{
                const dr=route.currentPrice<route.threshold;
                return (
                  <div key={route.id} onClick={()=>setDetail({tripId:trip.id,routeId:route.id})}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderTop:"1px solid #252B3B",cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#1E2330"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:dr?"#34D399":"#4F8EF7",boxShadow:dr?"0 0 0 3px rgba(52,211,153,.18)":"none"}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#F0F2F8",letterSpacing:-0.3}}>{route.from} <span style={{color:"#555E73",fontWeight:300}}>→</span> {route.to}</div>
                      <div style={{fontSize:11,color:"#555E73",marginTop:2}}>{fmt(route.depart)}{route.ret?` – ${fmt(route.ret)}`:""} · {route.passengers}p</div>
                    </div>
                    <Spark data={route.history} threshold={route.threshold}/>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:15,fontWeight:800,letterSpacing:-0.5,color:dr?"#34D399":"#F0F2F8"}}>${route.currentPrice}</div>
                      <div style={{fontSize:10,color:"#555E73",marginTop:1}}>limit ${route.threshold}</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        ))}

        <button onClick={()=>setShowAddTrip(true)}
          style={{width:"100%",padding:14,background:"transparent",border:"1.5px dashed #2E3448",borderRadius:14,color:"#555E73",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <PlusIcon/> New Trip
        </button>
      </div>

      {showAddTrip && <AddTripForm onSave={addTrip} onClose={()=>setShowAddTrip(false)}/>}
      {addRouteFor && <AddRouteForm onSave={addRoute} onClose={()=>setAddRouteFor(null)}/>}
    </div>
  );
}

// ── ALERTS SCREEN ──────────────────────────────────────────────────────────────
function AlertsScreen({ trips }) {
  const all     = trips.flatMap(t=>t.routes.map(r=>({...r,tripName:t.name})));
  const dropped  = all.filter(r=>r.currentPrice<r.threshold);
  const watching = all.filter(r=>r.currentPrice>=r.threshold);
  const Row = ({r,hi}) => (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"1px solid #252B3B",background:hi?"linear-gradient(90deg,rgba(52,211,153,.05),transparent)":"transparent"}}>
      <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:hi?"#34D399":"#4F8EF7",boxShadow:hi?"0 0 0 3px rgba(52,211,153,.18)":"none"}}/>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{r.from} → {r.to}</div>
        <div style={{fontSize:11,color:"#555E73",marginTop:2}}>{r.tripName} · {fmt(r.depart)}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:14,fontWeight:800,color:hi?"#34D399":"#F0F2F8"}}>${r.currentPrice}</div>
        <div style={{fontSize:10,color:"#555E73"}}>limit ${r.threshold}</div>
      </div>
      {hi&&<div style={{background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.2)",borderRadius:20,padding:"3px 8px",fontSize:10,fontWeight:700,color:"#34D399"}}>↓ Drop</div>}
    </div>
  );
  return (
    <div style={{flex:1,overflowY:"auto"}}>
      {dropped.length>0&&<div style={{padding:"16px 20px 8px"}}><SL>Price Drops ({dropped.length})</SL></div>}
      {dropped.map(r=><Row key={r.id} r={r} hi/>)}
      <div style={{padding:"16px 20px 8px"}}><SL>Watching ({watching.length})</SL></div>
      {watching.length===0?<div style={{padding:20,textAlign:"center",color:"#555E73",fontSize:13}}>No active watches</div>:watching.map(r=><Row key={r.id} r={r}/>)}
      <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#34D399",animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:11,color:"#555E73"}}>Scanning automatically · Next check in 5h 46m</span>
      </div>
    </div>
  );
}

// ── TRENDS SCREEN ──────────────────────────────────────────────────────────────
function TrendsScreen({ trips }) {
  const all = trips.flatMap(t=>t.routes.map(r=>({...r,tripName:t.name})));
  return (
    <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
      {all.length===0&&<div style={{textAlign:"center",color:"#555E73",fontSize:13,paddingTop:40}}>Add routes to see trends</div>}
      {all.map(r=>{
        const trend=r.history[r.history.length-1]-r.history[0];
        return (
          <div key={r.id} style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:800,letterSpacing:-0.5,color:"#F0F2F8"}}>{r.from} → {r.to}</div>
                <div style={{fontSize:11,color:"#555E73",marginTop:2}}>{r.tripName}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:800,letterSpacing:-1,color:r.currentPrice<r.threshold?"#34D399":"#F0F2F8"}}>${r.currentPrice}</div>
                <div style={{fontSize:11,fontWeight:600,color:trend<0?"#34D399":"#F87171",marginTop:2}}>{trend<0?"↓":"↑"} ${Math.abs(trend)} over 14d</div>
              </div>
            </div>
            <FullChart data={r.history} threshold={r.threshold}/>
          </div>
        );
      })}
    </div>
  );
}

// ── SETTINGS SCREEN ────────────────────────────────────────────────────────────
function SettingsScreen({ trips, setTrips }) {
  const [notif, setNotif] = useState(true);
  const [email, setEmail] = useState(true);
  const [freq,  setFreq]  = useState("3x");
  return (
    <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"12px 16px 8px"}}><SL>Notifications</SL></div>
        {[[notif,setNotif,"Push Notifications","Alert me the moment a price drops"],[email,setEmail,"Email Alerts","Also send an email with booking link"]].map(([v,s,l,sub])=>(
          <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderTop:"1px solid #252B3B"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{l}</div>
              <div style={{fontSize:11,color:"#555E73",marginTop:2}}>{sub}</div>
            </div>
            <div onClick={()=>s(!v)} style={{width:44,height:26,borderRadius:13,cursor:"pointer",transition:"background .2s",background:v?"#4F8EF7":"#2E3448",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:v?21:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"12px 16px 8px"}}><SL>Scan Frequency</SL></div>
        {[["2x","2× daily","Morning + Evening"],["3x","3× daily (recommended)","Morning, Afternoon, Evening"],["4x","4× daily","Every 6 hours"]].map(([v,l,s])=>(
          <div key={v} onClick={()=>setFreq(v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderTop:"1px solid #252B3B",cursor:"pointer"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{l}</div>
              <div style={{fontSize:11,color:"#555E73",marginTop:2}}>{s}</div>
            </div>
            {freq===v&&<span style={{color:"#4F8EF7"}}><CheckIcon/></span>}
          </div>
        ))}
      </div>
      <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"12px 16px 8px"}}><SL>My Trips</SL></div>
        {trips.map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderTop:"1px solid #252B3B"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:t.color}}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{t.name}</div>
                <div style={{fontSize:11,color:"#555E73"}}>{t.routes.length} route{t.routes.length!==1?"s":""}</div>
              </div>
            </div>
            <button onClick={()=>setTrips(ts=>ts.filter(x=>x.id!==t.id))} style={{background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.15)",borderRadius:7,padding:"5px 8px",color:"#F87171",cursor:"pointer",display:"flex"}}><TrashIcon/></button>
          </div>
        ))}
        {trips.length===0&&<div style={{padding:"18px 16px",color:"#555E73",fontSize:13,textAlign:"center"}}>No trips yet</div>}
      </div>
      <div style={{background:"rgba(52,211,153,.06)",border:"1px solid rgba(52,211,153,.15)",borderRadius:14,padding:16}}>
        <div style={{fontSize:12,fontWeight:600,color:"#34D399",marginBottom:4}}>✓ Scanning Active</div>
        <div style={{fontSize:11,color:"#555E73",lineHeight:1.5}}>Your server checks prices {freq==="2x"?"twice":"three times"} a day. Push notifications fire the moment any route drops below your threshold.</div>
      </div>
    </div>
  );
}

// ── MINI HELPERS ───────────────────────────────────────────────────────────────
const tileBtn = { background:"#1E2330", border:"1.5px solid #2E3448", borderRadius:9, padding:"10px 12px", cursor:"pointer", textAlign:"left", width:"100%" };
const inp     = { width:"100%", background:"#1E2330", border:"1.5px solid #2E3448", borderRadius:9, padding:"10px 14px", color:"#F0F2F8", fontSize:14, fontFamily:"Inter,sans-serif", outline:"none", colorScheme:"dark" };
const Lbl  = ({children}) => <div style={{fontSize:10,fontWeight:600,color:"#555E73",textTransform:"uppercase",letterSpacing:.7,marginBottom:7}}>{children}</div>;
const SL   = ({children}) => <div style={{fontSize:10,fontWeight:600,color:"#555E73",textTransform:"uppercase",letterSpacing:.7}}>{children}</div>;
const Chip = ({children,color}) => <div style={{background:`${color}22`,border:`1px solid ${color}44`,borderRadius:6,padding:"3px 8px",fontSize:11,color,fontWeight:600,display:"inline-block"}}>{children}</div>;
const PrimaryBtn = ({children,onClick,disabled}) => (
  <button onClick={onClick} disabled={disabled}
    style={{width:"100%",padding:13,background:disabled?"#1E2330":"linear-gradient(135deg,#4F8EF7,#7C5CF6)",
      color:disabled?"#555E73":"#fff",border:"none",borderRadius:9,fontSize:14,fontWeight:700,
      cursor:disabled?"default":"pointer",fontFamily:"Inter,sans-serif",letterSpacing:-0.2,
      boxShadow:disabled?"none":"0 4px 16px rgba(79,142,247,.3)"}}>
    {children}
  </button>
);

// ── SEED DATA ──────────────────────────────────────────────────────────────────
const SEED = [
  { id:"t1", name:"Summer Vacation", color:"#4F8EF7", routes:[
    { id:"r1", from:"SAN", fromCity:"San Diego", to:"JFK", toCity:"New York",
      depart:"2026-08-12", ret:"2026-08-19", threshold:320, passengers:1,
      currentPrice:287, history:[345,338,330,325,318,310,298,291,287],
      status:"drop", lastScan:"14 min ago", nextScan:"5h 46m" },
    { id:"r2", from:"JFK", fromCity:"New York", to:"SAN", toCity:"San Diego",
      depart:"2026-08-19", ret:"", threshold:300, passengers:1,
      currentPrice:312, history:[310,315,308,312,320,305,312,309,312],
      status:"watching", lastScan:"14 min ago", nextScan:"5h 46m" },
  ]},
  { id:"t2", name:"Chicago Work Trip", color:"#A78BFA", routes:[
    { id:"r3", from:"SAN", fromCity:"San Diego", to:"ORD", toCity:"Chicago",
      depart:"2026-09-03", ret:"2026-09-10", threshold:280, passengers:1,
      currentPrice:341, history:[355,360,348,341,338,345,341,340,341],
      status:"watching", lastScan:"14 min ago", nextScan:"5h 46m" },
  ]},
  { id:"t3", name:"Miami Getaway", color:"#34D399", routes:[
    { id:"r4", from:"SAN", fromCity:"San Diego", to:"MIA", toCity:"Miami",
      depart:"2026-07-24", ret:"2026-07-31", threshold:350, passengers:2,
      currentPrice:398, history:[420,415,405,398,402,398,395,398,398],
      status:"watching", lastScan:"14 min ago", nextScan:"5h 46m" },
  ]},
];

// ── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,   setTab]   = useState("home");
  const [trips, setTrips] = useState(SEED);

  const TABS = [
    {id:"home",    label:"Home",    I:HomeIcon },
    {id:"alerts",  label:"Alerts",  I:BellIcon },
    {id:"trends",  label:"Trends",  I:TrendIcon},
    {id:"settings",label:"Settings",I:GearIcon },
  ];

  const dropCount = trips.flatMap(t=>t.routes).filter(r=>r.currentPrice<r.threshold).length;

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#05070A",fontFamily:"Inter,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
        input[type=number]{-moz-appearance:textfield;}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.75);}}
        ::-webkit-scrollbar{width:0;}
      `}</style>

      <div style={{width:390,height:844,background:"#0A0C10",borderRadius:44,border:"2px solid #1E2330",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 40px 80px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.06)"}}>

        {/* Status bar */}
        <div style={{height:44,background:"#0A0C10",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",flexShrink:0}}>
          <span style={{fontSize:12,fontWeight:600,color:"#F0F2F8"}}>9:41</span>
          <div style={{width:120,height:28,background:"#0A0C10",borderRadius:"0 0 18px 18px",position:"absolute",left:"50%",transform:"translateX(-50%)",top:0}}/>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#F0F2F8"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4.5" y="2" width="3" height="10" rx="1"/><rect x="9" y="0" width="3" height="12" rx="1"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" opacity=".3"/></svg>
            <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="#F0F2F8" strokeWidth="2"><path d="M1.5 6.5C5.5 2.5 18.5 2.5 22.5 6.5"/><path d="M5 10C7.5 7.5 16.5 7.5 19 10"/><path d="M8.5 13.5C10 12 14 12 15.5 13.5"/><circle cx="12" cy="17" r="1.5" fill="#F0F2F8"/></svg>
            <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="3" stroke="#F0F2F8" strokeWidth="1.5" fill="none"/><rect x="1.5" y="2.5" width="17" height="7" rx="1.5" fill="#F0F2F8"/><path d="M23 4v4a2 2 0 0 0 0-4z" fill="#F0F2F8"/></svg>
          </div>
        </div>

        {/* App nav */}
        <div style={{background:"rgba(10,12,16,.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid #252B3B",padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:800,fontSize:15,letterSpacing:-0.3,color:"#F0F2F8"}}>
            <div style={{width:28,height:28,background:"linear-gradient(135deg,#4F8EF7,#7C5CF6)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:"0 0 14px rgba(79,142,247,.4)"}}>✈</div>
            FlightWatch
          </div>
          <div style={{color:"#8B93A8",position:"relative",cursor:"pointer"}} onClick={()=>setTab("alerts")}>
            {dropCount>0&&<div style={{position:"absolute",top:-4,right:-4,width:16,height:16,background:"#F87171",borderRadius:"50%",fontSize:9,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #0A0C10"}}>{dropCount}</div>}
            <BellIcon/>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {tab==="home"     && <HomeScreen     trips={trips} setTrips={setTrips}/>}
          {tab==="alerts"   && <AlertsScreen   trips={trips}/>}
          {tab==="trends"   && <TrendsScreen   trips={trips}/>}
          {tab==="settings" && <SettingsScreen trips={trips} setTrips={setTrips}/>}
        </div>

        {/* Tab bar */}
        <div style={{display:"flex",borderTop:"1px solid #252B3B",background:"#0D0F14",paddingBottom:20,flexShrink:0}}>
          {TABS.map(t=>{
            const on=tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{flex:1,padding:"10px 0 6px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,color:on?"#4F8EF7":"#555E73",transition:"color .15s"}}>
                <t.I/>
                <span style={{fontSize:9,fontWeight:on?700:500,letterSpacing:.3,textTransform:"uppercase",fontFamily:"Inter,sans-serif"}}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
