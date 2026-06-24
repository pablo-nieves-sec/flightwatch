import { useState, useMemo, useRef, useEffect } from "react";

// ── ICONS ──────────────────────────────────────────────────────────────────────
const Ic = ({ d, size=22, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d)?d.map((s,i)=><path key={i} d={s}/>):<path d={d}/>}
  </svg>
);
const HomeIcon  = ()=><Ic d={["M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z","M9 21V12h6v9"]}/>;
const BellIcon  = ()=><Ic d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"]}/>;
const TrendIcon = ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const GearIcon  = ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const Plus   = ()=><Ic d="M12 5v14M5 12h14"/>;
const ChevL  = ()=><Ic d="M15 18l-6-6 6-6" size={16}/>;
const ChevR  = ()=><Ic d="M9 18l6-6-6-6" size={16}/>;
const ChevD  = ()=><Ic d="M6 9l6 6 6-6" size={16}/>;
const ChevU  = ()=><Ic d="M18 15l-6-6-6 6" size={16}/>;
const Check  = ()=><Ic d="M20 6L9 17l-5-5" size={16}/>;
const Trash  = ()=><Ic d={["M3 6h18","M19 6l-1 14H6L5 6","M8 6V4h8v2"]} size={16}/>;
const Swap   = ()=><Ic d={["M7 16V4m0 0L3 8m4-4l4 4","M17 8v12m0 0l4-4m-4 4l-4-4"]} size={18}/>;
const Edit   = ()=><Ic d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} size={15}/>;
const Refresh= ()=><Ic d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" size={17}/>;

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const AIRPORTS=[
  {code:"SAN",city:"San Diego"},{code:"LAX",city:"Los Angeles"},{code:"JFK",city:"New York"},
  {code:"ORD",city:"Chicago"},{code:"MIA",city:"Miami"},{code:"LAS",city:"Las Vegas"},
  {code:"SEA",city:"Seattle"},{code:"DFW",city:"Dallas"},{code:"BOS",city:"Boston"},
  {code:"ATL",city:"Atlanta"},{code:"DEN",city:"Denver"},{code:"SFO",city:"San Francisco"},
  {code:"PHX",city:"Phoenix"},{code:"HNL",city:"Honolulu"},{code:"MCO",city:"Orlando"},
  {code:"EWR",city:"Newark"},{code:"IAH",city:"Houston"},{code:"MSP",city:"Minneapolis"},
];
const COLORS=["#4F8EF7","#A78BFA","#34D399","#F87171","#FBBF24","#F472B6","#60A5FA","#FB923C"];
const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const MS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmt   =d=>d?new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}):"";
const uid   =()=>Math.random().toString(36).slice(2,8);
const toKey =d=>d.toISOString().slice(0,10);
const addD  =(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return toKey(d);};
const gfl   =(from,to,dep,ret)=>`https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}+on+${(dep||"").replace(/-/g,"")}${ret?"+returning+"+(ret||"").replace(/-/g,""):""}&curr=USD`;

// ── PRICE GENERATOR ────────────────────────────────────────────────────────────
function genPrices(from,to,yr,mo){
  const seed=(from+to).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const prices={};const today=new Date();today.setHours(0,0,0,0);
  for(let m=0;m<2;m++){
    const month=(mo+m)%12,year=yr+Math.floor((mo+m)/12);
    const days=new Date(year,month+1,0).getDate();
    for(let d=1;d<=days;d++){
      const dt=new Date(year,month,d);if(dt<today)continue;
      const key=toKey(dt),dow=dt.getDay();
      const base=180+(seed%180),wknd=(dow===2||dow===3)?-20:(dow===5||dow===6||dow===0)?30:0;
      const mid=d>12&&d<18?40:0,noise=((seed*d*(month+1))%60)-20;
      prices[key]=Math.round(base+wknd+mid+noise);
    }
  }
  return prices;
}

// simulate a price refresh — nudge current price slightly
function refreshPrice(current){
  const delta=Math.round((Math.random()-.45)*18);
  return Math.max(80,current+delta);
}

// ── LOCAL STORAGE ──────────────────────────────────────────────────────────────
const LS_KEY="flightwatch_trips_v2";
function loadTrips(){
  try{const s=localStorage.getItem(LS_KEY);return s?JSON.parse(s):null;}catch{return null;}
}
function saveTrips(trips){
  try{localStorage.setItem(LS_KEY,JSON.stringify(trips));}catch{}
}

// ── SEED DATA ──────────────────────────────────────────────────────────────────
const SEED=[
  {id:"t1",name:"Summer Vacation",color:"#4F8EF7",routes:[
    {id:"r1",from:"SAN",fromCity:"San Diego",to:"JFK",toCity:"New York",depart:"2026-08-12",ret:"2026-08-19",flex:3,threshold:320,passengers:1,currentPrice:287,history:[345,338,330,325,318,310,298,291,287],lastScan:"14 min ago"},
    {id:"r2",from:"JFK",fromCity:"New York",to:"SAN",toCity:"San Diego",depart:"2026-08-19",ret:"",flex:0,threshold:300,passengers:1,currentPrice:312,history:[310,315,308,312,320,305,312,309,312],lastScan:"14 min ago"},
  ]},
  {id:"t2",name:"Chicago Work Trip",color:"#A78BFA",routes:[
    {id:"r3",from:"SAN",fromCity:"San Diego",to:"ORD",toCity:"Chicago",depart:"2026-09-03",ret:"2026-09-10",flex:2,threshold:280,passengers:1,currentPrice:341,history:[355,360,348,341,338,345,341,340,341],lastScan:"14 min ago"},
  ]},
  {id:"t3",name:"Miami Getaway",color:"#34D399",routes:[
    {id:"r4",from:"SAN",fromCity:"San Diego",to:"MIA",toCity:"Miami",depart:"2026-07-24",ret:"2026-07-31",flex:1,threshold:350,passengers:2,currentPrice:398,history:[420,415,405,398,402,398,395,398,398],lastScan:"14 min ago"},
  ]},
];

// ── PRICE CALENDAR ─────────────────────────────────────────────────────────────
function PriceCalendar({from,to,selDep,selRet,onDep,onRet,pickingRet}){
  const today=new Date();today.setHours(0,0,0,0);
  const [vm,setVm]=useState(()=>{
    const d=selDep?new Date(selDep+"T12:00:00"):new Date();
    return{year:d.getFullYear(),month:d.getMonth()};
  });
  const prices=useMemo(()=>from&&to?genPrices(from,to,vm.year,vm.month):{},[from,to,vm.year,vm.month]);
  const vals=Object.values(prices),minP=vals.length?Math.min(...vals):0,maxP=vals.length?Math.max(...vals):999,midP=(minP+maxP)/2;
  const pc=p=>!p?"#555E73":p<=minP+(maxP-minP)*.25?"#34D399":p<=midP?"#FBBF24":"#F87171";
  const prev=()=>setVm(v=>{const d=new Date(v.year,v.month-1,1);return{year:d.getFullYear(),month:d.getMonth()};});
  const next=()=>setVm(v=>{const d=new Date(v.year,v.month+1,1);return{year:d.getFullYear(),month:d.getMonth()};});
  const fd=new Date(vm.year,vm.month,1).getDay(),dc=new Date(vm.year,vm.month+1,0).getDate();
  const handle=k=>{
    if(pickingRet){if(selDep&&k<=selDep)return;onRet(k);}else onDep(k);
  };
  const isSel=k=>k===selDep||k===selRet;
  const inRng=k=>selDep&&selRet&&k>selDep&&k<selRet;
  const isPast=k=>new Date(k+"T12:00:00")<today;
  const cheap=Object.entries(prices)
    .filter(([k])=>k.startsWith(`${vm.year}-${String(vm.month+1).padStart(2,"0")}`))
    .sort(([,a],[,b])=>a-b).slice(0,3).map(([k])=>k);
  return(
    <div style={{background:"#111318",borderRadius:12,overflow:"hidden",border:"1px solid #252B3B"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderBottom:"1px solid #252B3B"}}>
        <button onClick={prev} style={iconBtn}><ChevL/></button>
        <span style={{fontSize:13,fontWeight:700,color:"#F0F2F8"}}>{MONTHS[vm.month]} {vm.year}</span>
        <button onClick={next} style={iconBtn}><ChevR/></button>
      </div>
      <div style={{padding:"4px 10px 2px",fontSize:9,fontWeight:600,color:pickingRet?"#A78BFA":"#4F8EF7",textTransform:"uppercase",letterSpacing:.6}}>
        {pickingRet?"↩ Tap return date (optional)":"✈ Tap departure date"}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"2px 6px 0"}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:8,fontWeight:600,color:"#555E73",padding:"3px 0",textTransform:"uppercase"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"2px 6px 8px",gap:"1px 0"}}>
        {Array.from({length:fd}).map((_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:dc}).map((_,i)=>{
          const day=i+1,key=`${vm.year}-${String(vm.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const p=prices[key],past=isPast(key),sel=isSel(key),rng=inRng(key),chp=cheap.includes(key);
          return(
            <div key={key} onClick={()=>!past&&p&&handle(key)}
              style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",
                padding:"3px 1px",borderRadius:sel?6:rng?0:4,
                background:sel?"#4F8EF7":rng?"rgba(79,142,247,.12)":"transparent",
                cursor:past||!p?"default":"pointer",opacity:past||!p?.3:1}}>
              <div style={{fontSize:10,fontWeight:sel?800:600,color:sel?"#fff":"#C8CEDF",lineHeight:1,marginBottom:1}}>{day}</div>
              {p&&<div style={{fontSize:7,fontWeight:700,color:sel?"rgba(255,255,255,.8)":pc(p),lineHeight:1}}>${p}</div>}
              {chp&&!sel&&<div style={{position:"absolute",top:1,right:1,width:3,height:3,borderRadius:"50%",background:"#34D399"}}/>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"6px 12px",borderTop:"1px solid #252B3B",justifyContent:"center"}}>
        {[["#34D399","Cheapest"],["#FBBF24","Moderate"],["#F87171","Expensive"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:3}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:c}}/><span style={{fontSize:8,color:"#555E73"}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DRAG-DOWN SHEET ────────────────────────────────────────────────────────────
function Sheet({children,onClose,title}){
  const [dy,setDy]=useState(0);
  const sy=useRef(null);
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.65)"}}/>
      <div
        onTouchStart={e=>{sy.current=e.touches[0].clientY;}}
        onTouchMove={e=>{const d=e.touches[0].clientY-sy.current;if(d>0)setDy(d);}}
        onTouchEnd={()=>{if(dy>80)onClose();else setDy(0);sy.current=null;}}
        style={{position:"relative",background:"#161A22",borderRadius:"20px 20px 0 0",
          padding:"0 18px 32px",height:"95dvh",display:"flex",flexDirection:"column",
          border:"1px solid #252B3B",borderBottom:"none",
          transform:`translateY(${dy}px)`,transition:dy===0?"transform .25s ease":"none"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px",cursor:"grab"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"#3A4055"}}/>
        </div>
        {title&&<div style={{fontSize:15,fontWeight:700,color:"#F0F2F8",marginBottom:14,letterSpacing:-0.3}}>{title}</div>}
        <div style={{flex:1,overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
}

// ── AIRPORT SHEET — floats above keyboard ──────────────────────────────────────
function AirportSheet({value,onSelect,onClose}){
  const [q,setQ]=useState("");
  const inputRef=useRef(null);
  const list=AIRPORTS.filter(a=>a.code.includes(q.toUpperCase())||a.city.toLowerCase().includes(q.toLowerCase()));
  useEffect(()=>{
    // Short delay to let sheet animate in, then focus
    const t=setTimeout(()=>inputRef.current?.focus(),120);
    return()=>clearTimeout(t);
  },[]);
  return(
    // Fixed overlay so it sits above the keyboard
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)"}}/>
      <div style={{position:"relative",background:"#161A22",borderRadius:"20px 20px 0 0",
        border:"1px solid #252B3B",borderBottom:"none",
        // key: don't set maxHeight with % — let it shrink naturally above keyboard
        display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 8px"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"#3A4055"}}/>
        </div>
        <div style={{padding:"0 18px 10px"}}>
          <div style={{fontSize:15,fontWeight:700,color:"#F0F2F8",marginBottom:12}}>Select Airport</div>
          <input
            ref={inputRef}
            value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search city or code…"
            // inputMode keeps keyboard from jumping to wrong type
            inputMode="search"
            style={{width:"100%",background:"#1E2330",border:"1.5px solid #2E3448",borderRadius:9,
              padding:"10px 14px",color:"#F0F2F8",fontSize:16,fontFamily:"Inter,sans-serif",
              outline:"none",marginBottom:8}}/>
        </div>
        {/* Fixed height list so keyboard doesn't hide results */}
        <div style={{overflowY:"auto",maxHeight:220,paddingBottom:20,padding:"0 18px 20px"}}>
          {list.map(a=>(
            <div key={a.code} onClick={()=>{onSelect(a);onClose();}}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"12px 4px",borderBottom:"1px solid #1E2330",cursor:"pointer"}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,letterSpacing:-0.5,color:"#F0F2F8"}}>{a.code}</div>
                <div style={{fontSize:11,color:"#555E73",marginTop:1}}>{a.city}</div>
              </div>
              {value===a.code&&<span style={{color:"#4F8EF7"}}><Check/></span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SWIPE ROW ──────────────────────────────────────────────────────────────────
function SwipeRow({onDelete,label="Delete",children}){
  const [offset,setOffset]=useState(0);
  const [live,setLive]=useState(false);
  const [revealed,setRevealed]=useState(false);
  const sx=useRef(null);
  const DW=80;
  return(
    <div style={{position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:DW,
        background:"#EF4444",display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",gap:3,cursor:"pointer",opacity:revealed?1:0,transition:"opacity .15s"}}
        onClick={()=>{setOffset(0);setRevealed(false);onDelete();}}>
        <Trash/><span style={{color:"#fff",fontSize:10,fontWeight:700}}>{label}</span>
      </div>
      <div
        onTouchStart={e=>{sx.current=e.touches[0].clientX;setLive(true);}}
        onTouchMove={e=>{
          if(sx.current===null)return;
          const dx=e.touches[0].clientX-sx.current;
          if(dx<0){setOffset(Math.max(dx,-DW));setRevealed(true);}
          else if(dx>0){setOffset(0);setRevealed(false);}
        }}
        onTouchEnd={()=>{
          setLive(false);
          const snap=offset<-DW/2;
          setOffset(snap?-DW:0);
          setRevealed(snap);
          sx.current=null;
        }}
        style={{transform:`translateX(${offset}px)`,transition:live?"none":"transform .22s ease",position:"relative",zIndex:1}}>
        {children}
      </div>
    </div>
  );
}

// ── SPARKLINE ──────────────────────────────────────────────────────────────────
function Spark({data,threshold,depart}){
  if(!data||data.length<2)return null;
  const W=90,H=30,pad=3;
  const mn=Math.min(...data)-5,mx=Math.max(...data)+5;
  const x=i=>pad+(i/(data.length-1))*(W-pad*2);
  const y=v=>H-pad-((v-mn)/(mx-mn))*(H-pad*2);
  const ci=data.findIndex(v=>v<threshold);
  const end=depart?new Date(depart+"T12:00:00"):new Date();
  const start=new Date(end);start.setDate(start.getDate()-(data.length-1));
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0}}>
      <svg width={W} height={H} style={{overflow:"visible"}}>
        {ci>0&&<polyline points={data.slice(0,ci+1).map((v,i)=>`${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#4F8EF7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
        {ci>=0&&<polyline points={data.slice(ci).map((v,i)=>`${x(ci+i)},${y(v)}`).join(" ")} fill="none" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
        {ci===-1&&<polyline points={data.map((v,i)=>`${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#4F8EF7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
        <circle cx={x(data.length-1)} cy={y(data[data.length-1])} r="2.5"
          fill={ci>=0?"#34D399":"#4F8EF7"} stroke="#161A22" strokeWidth="1.5"/>
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",width:W}}>
        <span style={{fontSize:7,color:"#555E73"}}>{MS[start.getMonth()]} {start.getDate()}</span>
        <span style={{fontSize:7,color:"#555E73"}}>{MS[end.getMonth()]} {end.getDate()}</span>
      </div>
    </div>
  );
}

// ── FULL CHART ─────────────────────────────────────────────────────────────────
function FullChart({data,threshold,depart}){
  if(!data||data.length<2)return null;
  const W=300,H=100,px=8,py=10;
  const mn=Math.min(...data,threshold)-15,mx=Math.max(...data,threshold)+15;
  const x=i=>px+(i/(data.length-1))*(W-px*2);
  const y=v=>H-py-((v-mn)/(mx-mn))*(H-py*2);
  const ci=data.findIndex(v=>v<threshold);
  const bp=ci>0?data.slice(0,ci+1):(ci===-1?data:[]);
  const gp=ci>=0?data.slice(ci):[];
  const ty=y(threshold);
  const end=depart?new Date(depart+"T12:00:00"):new Date();
  const labels=data.map((_,i)=>{const d=new Date(end);d.setDate(d.getDate()-(data.length-1-i));return`${MS[d.getMonth()]} ${d.getDate()}`;});
  return(
    <div>
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
        {data.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r={i===data.length-1?4:2.5} fill={ci>=0&&i>=ci?"#34D399":"#4F8EF7"} stroke="#161A22" strokeWidth="1.5"/>)}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4,padding:`0 ${px}px`}}>
        {[0,Math.floor((data.length-1)/2),data.length-1].map(i=>(
          <span key={i} style={{fontSize:9,color:"#555E73",textAlign:i===0?"left":i===data.length-1?"right":"center"}}>{labels[i]}</span>
        ))}
      </div>
    </div>
  );
}

// ── ROUTE EXPANDED CARD (inline on home) ───────────────────────────────────────
function RouteExpanded({route,onClose,onEdit,onDelete,onRefresh}){
  const dr=route.currentPrice<route.threshold;
  const trend=route.history[route.history.length-1]-route.history[0];
  const [refreshing,setRefreshing]=useState(false);
  const doRefresh=()=>{
    setRefreshing(true);
    setTimeout(()=>{onRefresh(route.id);setRefreshing(false);},900);
  };
  return(
    <div style={{background:"#1A1F2E",borderTop:"1px solid #252B3B",padding:"14px 14px 16px"}}>
      {/* Header row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:-1.5,color:dr?"#34D399":"#F0F2F8",lineHeight:1}}>${route.currentPrice}</div>
          <div style={{fontSize:10,color:"#555E73",marginTop:3}}>
            {fmt(route.depart)}{route.ret?` – ${fmt(route.ret)}`:""} · {route.passengers}p
            {route.flex>0&&<span style={{color:"#FBBF24"}}> ±{route.flex}d</span>}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
          <div style={{display:"flex",gap:6}}>
            <button onClick={doRefresh} disabled={refreshing}
              style={{...iconBtn,background:"rgba(79,142,247,.12)",border:"1px solid rgba(79,142,247,.2)",color:"#4F8EF7",
                animation:refreshing?"spin .8s linear infinite":"none"}}>
              <Refresh/>
            </button>
            <button onClick={()=>onEdit(route)} style={{...iconBtn,background:"rgba(79,142,247,.12)",border:"1px solid rgba(79,142,247,.2)",color:"#4F8EF7"}}><Edit/></button>
            <button onClick={()=>onDelete(route.id)} style={{...iconBtn,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.2)",color:"#F87171"}}><Trash/></button>
          </div>
          <div style={{fontSize:9,color:"#555E73"}}>Updated {route.lastScan}</div>
        </div>
      </div>

      {/* Status + limit */}
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
        {dr
          ?<div style={{background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.25)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:"#34D399"}}>↓ Below your limit</div>
          :<div style={{background:"rgba(79,142,247,.12)",border:"1px solid rgba(79,142,247,.25)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:"#4F8EF7"}}>Watching</div>
        }
        <div style={{fontSize:10,color:"#555E73"}}>Limit ${route.threshold} · Save ${Math.max(0,route.threshold-route.currentPrice)}/ticket</div>
      </div>

      {/* Chart */}
      <FullChart data={route.history} threshold={route.threshold} depart={route.depart}/>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>
        {[
          {l:"Trend",v:trend<0?"↓ Falling":"↑ Rising",c:trend<0?"#34D399":"#F87171",s:`${Math.abs(trend).toFixed(0)}pts 14d`},
          {l:"Pred Low",v:`~$${Math.round(route.currentPrice*.92)}`,c:"#F0F2F8",s:"Based on trend"},
          {l:"Signal",v:dr?"Buy Now":"Wait",c:dr?"#34D399":"#FBBF24",s:dr?"Price is low":"Still watching"},
        ].map(s=>(
          <div key={s.l} style={{background:"#252B3B",borderRadius:10,padding:"10px 10px"}}>
            <div style={{fontSize:8,fontWeight:600,color:"#555E73",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:12,fontWeight:800,color:s.c,letterSpacing:-0.3}}>{s.v}</div>
            <div style={{fontSize:8,color:"#555E73",marginTop:2}}>{s.s}</div>
          </div>
        ))}
      </div>

      {/* Book button */}
      <a href={gfl(route.from,route.to,route.depart,route.ret)} target="_blank" rel="noopener noreferrer"
        style={{display:"block",width:"100%",marginTop:14,padding:"13px 0",textAlign:"center",
          background:dr?"linear-gradient(135deg,#34D399,#059669)":"linear-gradient(135deg,#4F8EF7,#7C5CF6)",
          color:dr?"#0A2118":"#fff",borderRadius:10,fontSize:14,fontWeight:800,
          textDecoration:"none",letterSpacing:-0.3,
          boxShadow:dr?"0 4px 20px rgba(52,211,153,.3)":"0 4px 14px rgba(79,142,247,.3)"}}>
        {dr?`Book Now — $${route.currentPrice} →`:"Search on Google Flights →"}
      </a>
    </div>
  );
}

// ── ROUTE FORM ─────────────────────────────────────────────────────────────────
function RouteForm({existing,openCal=null,onSave,onClose}){
  const isEdit=!!existing;
  const [from,setFrom]=useState(existing?{code:existing.from,city:existing.fromCity}:{code:"SAN",city:"San Diego"});
  const [to,setTo]    =useState(existing?{code:existing.to,city:existing.toCity}:{code:"",city:""});
  const [dep,setDep]  =useState(existing?.depart||"");
  const [ret,setRet]  =useState(existing?.ret||"");
  const [flex,setFlex]=useState(existing?.flex??3);
  const [thr,setThr]  =useState(existing?.threshold||"");
  const [pax,setPax]  =useState(existing?.passengers||1);
  const [picker,setPicker]=useState(null);
  const [pickRet,setPickRet]=useState(openCal==="return");
  const [step,setStep]=useState(openCal?"cal":isEdit?"details":"route");

  const canCal=from.code&&to.code;
  const valid=from.code&&to.code&&dep&&thr!==""&&Number(thr)>0;

  const save=()=>{
    if(!valid)return;
    const prices=genPrices(from.code,to.code,new Date().getFullYear(),new Date().getMonth());
    const mp=dep&&prices[dep]?prices[dep]:Number(thr)+Math.round(Math.random()*60+10);
    const hist=existing?.history||Array.from({length:9},()=>Math.round(mp+(Math.random()-.4)*30));
    onSave({id:existing?.id||uid(),from:from.code,fromCity:from.city,to:to.code,toCity:to.city,
      dep,ret,depart:dep,flex,threshold:Number(thr),passengers:pax,
      currentPrice:existing?.currentPrice??mp,history:hist,lastScan:existing?.lastScan||"just now"});
    onClose();
  };

  if(picker)return<AirportSheet value={picker==="from"?from.code:to.code} onSelect={a=>picker==="from"?setFrom(a):setTo(a)} onClose={()=>setPicker(null)}/>;

  return(
    <Sheet onClose={onClose} title={isEdit?"Edit Route":"Add Route"}>
      {/* Step indicator */}
      {!isEdit&&(
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[["route","Route"],["cal","Dates"],["details","Alert"]].map(([s,l],i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
              <div onClick={()=>(s==="cal"&&!canCal)?null:setStep(s)}
                style={{display:"flex",alignItems:"center",gap:5,cursor:s==="cal"&&!canCal?"default":"pointer"}}>
                <div style={{width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:10,fontWeight:700,
                  background:step===s?"#4F8EF7":"#1E2330",border:`1.5px solid ${step===s?"#4F8EF7":"#2E3448"}`,
                  color:step===s?"#fff":"#555E73"}}>{i+1}</div>
                <span style={{fontSize:11,fontWeight:600,color:step===s?"#F0F2F8":"#555E73"}}>{l}</span>
              </div>
              {i<2&&<div style={{width:16,height:1,background:"#2E3448"}}/>}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 */}
      {step==="route"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 36px 1fr",gap:8}}>
            <button onClick={()=>setPicker("from")} style={tileBtn}>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:-1,color:"#F0F2F8"}}>{from.code||"—"}</div>
              <div style={{fontSize:10,color:"#555E73",marginTop:2}}>{from.city||"Origin"}</div>
            </button>
            <button onClick={()=>{const t=from;setFrom(to);setTo(t);}}
              style={{background:"#252B3B",border:"1px solid #2E3448",borderRadius:"50%",
                width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"pointer",color:"#8B93A8",alignSelf:"center"}}><Swap/></button>
            <button onClick={()=>setPicker("to")} style={tileBtn}>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:-1,color:to.code?"#F0F2F8":"#555E73"}}>{to.code||"—"}</div>
              <div style={{fontSize:10,color:"#555E73",marginTop:2}}>{to.city||"Destination"}</div>
            </button>
          </div>
          <div><Lbl>Passengers</Lbl>
            <div style={{display:"flex",gap:8}}>
              {[1,2,3,4].map(n=>(
                <button key={n} onClick={()=>setPax(n)} style={{flex:1,padding:"9px 0",borderRadius:8,
                  fontFamily:"Inter,sans-serif",background:pax===n?"rgba(79,142,247,.15)":"#1E2330",
                  border:`1.5px solid ${pax===n?"#4F8EF7":"#2E3448"}`,
                  color:pax===n?"#4F8EF7":"#8B93A8",fontWeight:700,fontSize:14,cursor:"pointer"}}>{n}</button>
              ))}
            </div>
          </div>
          <PBtn onClick={()=>setStep("cal")} disabled={!canCal}>{canCal?"Browse Prices →":"Select both airports first"}</PBtn>
        </div>
      )}

      {/* STEP 2 — CALENDAR */}
      {step==="cal"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1E2330",borderRadius:10,padding:"10px 12px"}}>
            <span style={{fontSize:14,fontWeight:800,color:"#F0F2F8",letterSpacing:-0.5}}>{from.code} <span style={{color:"#555E73",fontWeight:300}}>→</span> {to.code}</span>
            <div style={{display:"flex",gap:6}}>
              {dep&&<Chip color="#4F8EF7">✈ {fmt(dep)}</Chip>}
              {ret&&<Chip color="#A78BFA">↩ {fmt(ret)}</Chip>}
            </div>
          </div>
          <div style={{display:"flex",background:"#1E2330",borderRadius:8,padding:3,gap:3}}>
            {[false,true].map(ir=>(
              <button key={String(ir)} onClick={()=>setPickRet(ir)}
                style={{flex:1,padding:"7px 0",borderRadius:6,border:"none",cursor:"pointer",
                  fontFamily:"Inter,sans-serif",fontSize:11,fontWeight:600,
                  background:pickRet===ir?"#4F8EF7":"transparent",color:pickRet===ir?"#fff":"#555E73"}}>
                {ir?"↩ Return":"✈ Depart"}
              </button>
            ))}
          </div>
          <PriceCalendar from={from.code} to={to.code} selDep={dep} selRet={ret}
            onDep={k=>{setDep(k);setPickRet(true);}} onRet={k=>setRet(k)} pickingRet={pickRet}/>
          {dep?<PBtn onClick={()=>setStep("details")}>Set Alert →</PBtn>
            :<div style={{textAlign:"center",fontSize:12,color:"#555E73",padding:"4px 0"}}>Tap a date to select</div>}
        </div>
      )}

      {/* STEP 3 — DETAILS */}
      {step==="details"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#1E2330",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#F0F2F8",letterSpacing:-0.5,marginBottom:10}}>{from.code} → {to.code}</div>
            <Lbl>Tap a date to change it</Lbl>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>{setPickRet(false);setStep("cal");}}
                style={{background:"rgba(79,142,247,.15)",border:"1px solid rgba(79,142,247,.35)",
                  borderRadius:8,padding:"8px 12px",cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:8,color:"#4F8EF7",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Depart</div>
                <div style={{fontSize:13,fontWeight:700,color:"#F0F2F8"}}>{dep?fmt(dep):"Tap to set"}</div>
              </button>
              <button onClick={()=>{setPickRet(true);setStep("cal");}}
                style={{background:"rgba(167,139,250,.15)",border:"1px solid rgba(167,139,250,.35)",
                  borderRadius:8,padding:"8px 12px",cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:8,color:"#A78BFA",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Return</div>
                <div style={{fontSize:13,fontWeight:700,color:ret?"#F0F2F8":"#555E73"}}>{ret?fmt(ret):"Optional"}</div>
              </button>
              <div style={{background:"#252B3B",borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontSize:8,color:"#555E73",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Pax</div>
                <div style={{fontSize:13,fontWeight:700,color:"#F0F2F8"}}>{pax}</div>
              </div>
            </div>
          </div>

          <div><Lbl>Date Flexibility</Lbl>
            <div style={{display:"flex",gap:8}}>
              {[0,1,2,3].map(n=>(
                <button key={n} onClick={()=>setFlex(n)} style={{flex:1,padding:"9px 0",borderRadius:8,
                  fontFamily:"Inter,sans-serif",background:flex===n?"rgba(79,142,247,.15)":"#1E2330",
                  border:`1.5px solid ${flex===n?"#4F8EF7":"#2E3448"}`,
                  color:flex===n?"#4F8EF7":"#8B93A8",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  {n===0?"Exact":`±${n}d`}
                </button>
              ))}
            </div>
            {flex>0&&dep&&<div style={{fontSize:11,color:"#555E73",marginTop:5}}>
              Covers {fmt(addD(dep,-flex))} – {fmt(addD(dep,flex))}
              {ret?` · return ${fmt(addD(ret,-flex))} – ${fmt(addD(ret,flex))}` :""}
            </div>}
          </div>

          {(()=>{
            const prices=genPrices(from.code,to.code,new Date().getFullYear(),new Date().getMonth());
            const cal=prices[dep];if(!cal)return null;
            const vals=Object.values(prices),minP=Math.min(...vals),avgP=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
            return(
              <div style={{background:"rgba(79,142,247,.08)",border:"1px solid rgba(79,142,247,.2)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:9,color:"#4F8EF7",fontWeight:600,textTransform:"uppercase",letterSpacing:.6,marginBottom:6}}>Price intel · {fmt(dep)}</div>
                <div style={{display:"flex",gap:16}}>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#F0F2F8",letterSpacing:-1}}>${cal}</div><div style={{fontSize:9,color:"#555E73"}}>This date</div></div>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#34D399",letterSpacing:-1}}>${minP}</div><div style={{fontSize:9,color:"#555E73"}}>Cheapest</div></div>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#8B93A8",letterSpacing:-1}}>${avgP}</div><div style={{fontSize:9,color:"#555E73"}}>Avg</div></div>
                </div>
              </div>
            );
          })()}

          <div><Lbl>Alert me when price drops below</Lbl>
            <div style={{display:"flex",alignItems:"center",background:"#1E2330",
              border:"1.5px solid #2E3448",borderRadius:9,padding:"8px 14px",gap:4}}>
              <span style={{fontSize:20,fontWeight:700,color:"#555E73"}}>$</span>
              <input type="number" value={thr} onChange={e=>setThr(e.target.value)} placeholder="e.g. 300"
                style={{flex:1,background:"transparent",border:"none",fontSize:26,fontWeight:800,
                  color:"#F0F2F8",letterSpacing:-1,fontFamily:"Inter,sans-serif",outline:"none"}}/>
            </div>
            {(()=>{
              const prices=genPrices(from.code,to.code,new Date().getFullYear(),new Date().getMonth());
              const cal=prices[dep];if(!cal||!thr)return null;
              const diff=cal-Number(thr);
              return<div style={{fontSize:11,color:diff>0?"#34D399":"#FBBF24",marginTop:5,fontWeight:600}}>
                {diff>0?`↓ $${diff} below today's price — you'd be notified now`:`↑ Above today's price of $${cal}`}
              </div>;
            })()}
          </div>
          <PBtn onClick={save} disabled={!valid}>{isEdit?"Save Changes":"Start Tracking"}</PBtn>
        </div>
      )}
    </Sheet>
  );
}

// ── ADD TRIP FORM ──────────────────────────────────────────────────────────────
function AddTripForm({onSave,onClose}){
  const [name,setName]=useState(""); const [color,setColor]=useState(COLORS[0]);
  return(
    <Sheet onClose={onClose} title="New Trip">
      <div style={{marginBottom:16}}><Lbl>Trip Name</Lbl>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Summer Vacation"
          style={{...INP,fontSize:15}}/>
      </div>
      <div style={{marginBottom:24}}><Lbl>Color</Lbl>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {COLORS.map(c=><button key={c} onClick={()=>setColor(c)}
            style={{width:32,height:32,borderRadius:"50%",background:c,border:"none",cursor:"pointer",
              outline:color===c?`3px solid ${c}`:"3px solid transparent",outlineOffset:2}}/>)}
        </div>
      </div>
      <PBtn onClick={()=>{if(name.trim()){onSave({id:uid(),name:name.trim(),color,routes:[]});onClose();}}} disabled={!name.trim()}>
        Create Trip
      </PBtn>
    </Sheet>
  );
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────────
function HomeScreen({trips,setTrips}){
  const [showAddTrip,setShowAddTrip]=useState(false);
  const [addRouteFor,setAddRouteFor]=useState(null);
  const [editRoute,setEditRoute]    =useState(null);
  // expandedRoute: {tripId, routeId} — which route is expanded inline
  const [expanded,setExpanded]      =useState(null);

  // persist on every change
  useEffect(()=>saveTrips(trips),[trips]);

  const dropped=trips.flatMap(t=>t.routes.map(r=>({...r,tripId:t.id}))).filter(r=>r.currentPrice<r.threshold);

  const addTrip =t=>setTrips(ts=>[...ts,t]);
  const addRoute=r=>setTrips(ts=>ts.map(t=>t.id===addRouteFor?{...t,routes:[...t.routes,r]}:t));
  const saveEdit=r=>setTrips(ts=>ts.map(t=>({...t,routes:t.routes.map(x=>x.id===r.id?r:x)})));
  const delTrip =id=>{setTrips(ts=>ts.filter(t=>t.id!==id));if(expanded?.tripId===id)setExpanded(null);};
  const delRoute=(tid,rid)=>{
    setTrips(ts=>ts.map(t=>t.id===tid?{...t,routes:t.routes.filter(r=>r.id!==rid)}:t));
    if(expanded?.routeId===rid)setExpanded(null);
  };
  const doRefresh=(routeId)=>{
    setTrips(ts=>ts.map(t=>({...t,routes:t.routes.map(r=>{
      if(r.id!==routeId)return r;
      const np=refreshPrice(r.currentPrice);
      return{...r,currentPrice:np,history:[...r.history.slice(1),np],lastScan:"just now"};
    })})));
  };

  const toggleExpanded=(tid,rid)=>{
    setExpanded(e=>(e?.tripId===tid&&e?.routeId===rid)?null:{tripId:tid,routeId:rid});
  };

  return(
    <div>
      <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Price drop banners */}
        {dropped.map(r=>(
          <div key={r.id} onClick={()=>toggleExpanded(r.tripId,r.id)}
            style={{background:"linear-gradient(135deg,rgba(52,211,153,.12),rgba(52,211,153,.05))",
              border:"1px solid rgba(52,211,153,.3)",borderRadius:14,padding:"12px 14px",
              display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <div style={{fontSize:18}}>🎯</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"#34D399"}}>Price drop — {r.from} → {r.to}</div>
              <div style={{fontSize:11,color:"#8B93A8",marginTop:1}}>${r.currentPrice} · Under ${r.threshold} limit</div>
            </div>
            <div style={{fontSize:12,fontWeight:800,color:"#34D399"}}>View →</div>
          </div>
        ))}

        {/* Trip cards — swipe left deletes whole trip */}
        {trips.map(trip=>(
          <SwipeRow key={trip.id} onDelete={()=>delTrip(trip.id)} label="Trip">
            <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
              {/* Trip header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:9,height:9,borderRadius:"50%",background:trip.color,boxShadow:`0 0 7px ${trip.color}80`}}/>
                  <div style={{fontSize:14,fontWeight:700,color:"#F0F2F8",letterSpacing:-0.3}}>{trip.name}</div>
                  <div style={{fontSize:11,color:"#555E73"}}>{trip.routes.length} route{trip.routes.length!==1?"s":""}</div>
                </div>
                <button onClick={()=>setAddRouteFor(trip.id)}
                  style={{background:"rgba(79,142,247,.12)",border:"1px solid rgba(79,142,247,.2)",
                    borderRadius:7,padding:"4px 10px",color:"#4F8EF7",fontSize:11,fontWeight:600,
                    cursor:"pointer",fontFamily:"Inter,sans-serif"}}>+ Route</button>
              </div>

              {trip.routes.length===0
                ?<div onClick={()=>setAddRouteFor(trip.id)}
                  style={{padding:"20px 14px",textAlign:"center",color:"#555E73",fontSize:13,
                    borderTop:"1px solid #252B3B",cursor:"pointer",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(79,142,247,.12)",
                    border:"1.5px dashed rgba(79,142,247,.4)",display:"flex",alignItems:"center",
                    justifyContent:"center",color:"#4F8EF7"}}>
                    <Plus/>
                  </div>
                  <span>Tap anywhere here to add your first route</span>
                </div>
                :trip.routes.map(route=>{
                  const dr=route.currentPrice<route.threshold;
                  const isOpen=expanded?.tripId===trip.id&&expanded?.routeId===route.id;
                  return(
                    <div key={route.id} style={{borderTop:"1px solid #252B3B"}}>
                      {/* Route row — tap to expand */}
                      <div onClick={()=>toggleExpanded(trip.id,route.id)}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",
                          cursor:"pointer",background:isOpen?"#1A1F2E":"#161A22",
                          transition:"background .15s"}}>
                        <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
                          background:dr?"#34D399":"#4F8EF7",
                          boxShadow:dr?"0 0 0 3px rgba(52,211,153,.18)":"none"}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#F0F2F8",letterSpacing:-0.3}}>
                            {route.from} <span style={{color:"#555E73",fontWeight:300}}>→</span> {route.to}
                          </div>
                          <div style={{fontSize:10,color:"#555E73",marginTop:1}}>
                            {fmt(route.depart)}{route.ret?` – ${fmt(route.ret)}`:""} · {route.passengers}p
                            {route.flex>0&&<span style={{color:"#FBBF24"}}> ±{route.flex}d</span>}
                          </div>
                        </div>
                        <Spark data={route.history} threshold={route.threshold} depart={route.depart}/>
                        <div style={{textAlign:"right",flexShrink:0,marginLeft:6}}>
                          <div style={{fontSize:14,fontWeight:800,letterSpacing:-0.5,color:dr?"#34D399":"#F0F2F8"}}>${route.currentPrice}</div>
                          <div style={{fontSize:9,color:"#555E73",marginTop:1}}>limit ${route.threshold}</div>
                        </div>
                        <div style={{color:"#555E73",marginLeft:4,flexShrink:0}}>
                          {isOpen?<ChevU/>:<ChevD/>}
                        </div>
                      </div>

                      {/* Expanded inline panel */}
                      {isOpen&&(
                        <RouteExpanded
                          route={route}
                          onClose={()=>setExpanded(null)}
                          onEdit={r=>{setEditRoute(r);setExpanded(null);}}
                          onDelete={rid=>delRoute(trip.id,rid)}
                          onRefresh={doRefresh}/>
                      )}
                    </div>
                  );
                })
              }
            </div>
          </SwipeRow>
        ))}

        <button onClick={()=>setShowAddTrip(true)}
          style={{width:"100%",padding:14,background:"transparent",border:"1.5px dashed #2E3448",
            borderRadius:14,color:"#555E73",fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <Plus/> New Trip
        </button>
      </div>
      {showAddTrip&&<AddTripForm onSave={addTrip} onClose={()=>setShowAddTrip(false)}/>}
      {addRouteFor&&<RouteForm onSave={addRoute} onClose={()=>setAddRouteFor(null)}/>}
      {editRoute&&<RouteForm existing={editRoute} onSave={r=>{saveEdit(r);setEditRoute(null);}} onClose={()=>setEditRoute(null)}/>}
    </div>
  );
}

// ── ALERTS SCREEN ──────────────────────────────────────────────────────────────
function AlertsScreen({trips,setTrips}){
  useEffect(()=>saveTrips(trips),[trips]);
  const all=trips.flatMap(t=>t.routes.map(r=>({...r,tripId:t.id,tripName:t.name})));
  const dropped=all.filter(r=>r.currentPrice<r.threshold);
  const watching=all.filter(r=>r.currentPrice>=r.threshold);
  const del=(tid,rid)=>setTrips(ts=>ts.map(t=>t.id===tid?{...t,routes:t.routes.filter(r=>r.id!==rid)}:t));

  const Row=({r,hi})=>(
    <SwipeRow onDelete={()=>del(r.tripId,r.id)}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
        borderBottom:"1px solid #252B3B",
        background:hi?"#0E1A14":"#0A0C10"}}>
        <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
          background:hi?"#34D399":"#4F8EF7",boxShadow:hi?"0 0 0 3px rgba(52,211,153,.18)":"none"}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{r.from} → {r.to}</div>
          <div style={{fontSize:10,color:"#555E73",marginTop:1}}>
            {r.tripName} · {fmt(r.depart)}{r.flex>0&&<span style={{color:"#FBBF24"}}> ±{r.flex}d</span>}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:800,color:hi?"#34D399":"#F0F2F8",letterSpacing:-0.5}}>${r.currentPrice}</div>
          <div style={{fontSize:9,color:"#555E73",marginTop:1}}>limit ${r.threshold}</div>
        </div>
      </div>
    </SwipeRow>
  );

  return(
    <div>
      {dropped.length>0&&<div style={{padding:"14px 16px 6px"}}><SL>Price Drops ({dropped.length})</SL></div>}
      {dropped.map(r=><Row key={r.id} r={r} hi/>)}
      <div style={{padding:"14px 16px 6px"}}><SL>Watching ({watching.length})</SL></div>
      {watching.length===0
        ?<div style={{padding:20,textAlign:"center",color:"#555E73",fontSize:13}}>No active watches</div>
        :watching.map(r=><Row key={r.id} r={r}/>)}
      <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#34D399",animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:11,color:"#555E73"}}>Scanning automatically · Next check in 5h 46m</span>
      </div>
    </div>
  );
}

// ── TRENDS SCREEN ──────────────────────────────────────────────────────────────
function TrendsScreen({trips}){
  const all=trips.flatMap(t=>t.routes.map(r=>({...r,tripName:t.name})));
  return(
    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:12}}>
      {all.length===0&&<div style={{textAlign:"center",color:"#555E73",fontSize:13,paddingTop:40}}>Add routes to see trends</div>}
      {all.map(r=>{
        const trend=r.history[r.history.length-1]-r.history[0];
        return(
          <div key={r.id} style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,letterSpacing:-0.5,color:"#F0F2F8"}}>{r.from} → {r.to}</div>
                <div style={{fontSize:10,color:"#555E73",marginTop:2}}>{r.tripName} · {fmt(r.depart)}{r.ret?` – ${fmt(r.ret)}`:""}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:17,fontWeight:800,letterSpacing:-1,color:r.currentPrice<r.threshold?"#34D399":"#F0F2F8"}}>${r.currentPrice}</div>
                <div style={{fontSize:10,fontWeight:600,color:trend<0?"#34D399":"#F87171",marginTop:1}}>{trend<0?"↓":"↑"} ${Math.abs(trend)} / 14d</div>
              </div>
            </div>
            <FullChart data={r.history} threshold={r.threshold} depart={r.depart}/>
          </div>
        );
      })}
    </div>
  );
}

// ── SETTINGS SCREEN ────────────────────────────────────────────────────────────
function SettingsScreen({trips,setTrips}){
  useEffect(()=>saveTrips(trips),[trips]);
  const [notif,setNotif]=useState(true);
  const [email,setEmail]=useState(true);
  const [freq,setFreq]  =useState("3x");
  return(
    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"10px 14px 6px"}}><SL>Notifications</SL></div>
        {[[notif,setNotif,"Push Notifications","Alert me the moment a price drops"],
          [email,setEmail,"Email Alerts","Also send an email with booking link"]].map(([v,s,l,sub])=>(
          <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderTop:"1px solid #252B3B"}}>
            <div style={{flex:1,paddingRight:12}}>
              <div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{l}</div>
              <div style={{fontSize:11,color:"#555E73",marginTop:2}}>{sub}</div>
            </div>
            <div onClick={()=>s(!v)} style={{width:44,height:26,borderRadius:13,cursor:"pointer",
              transition:"background .2s",background:v?"#4F8EF7":"#2E3448",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:v?21:3,width:20,height:20,
                borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"10px 14px 6px"}}><SL>Scan Frequency</SL></div>
        {[["2x","2× daily","Morning + Evening"],["3x","3× daily (recommended)","Morning, Afternoon, Evening"],["4x","4× daily","Every 6 hours"]].map(([v,l,s])=>(
          <div key={v} onClick={()=>setFreq(v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderTop:"1px solid #252B3B",cursor:"pointer"}}>
            <div><div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{l}</div><div style={{fontSize:11,color:"#555E73",marginTop:2}}>{s}</div></div>
            {freq===v&&<span style={{color:"#4F8EF7"}}><Check/></span>}
          </div>
        ))}
      </div>
      <div style={{background:"#161A22",border:"1px solid #252B3B",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"10px 14px 6px"}}><SL>My Trips</SL></div>
        {trips.map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderTop:"1px solid #252B3B"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:9,height:9,borderRadius:"50%",background:t.color}}/>
              <div><div style={{fontSize:13,fontWeight:600,color:"#F0F2F8"}}>{t.name}</div><div style={{fontSize:10,color:"#555E73"}}>{t.routes.length} route{t.routes.length!==1?"s":""}</div></div>
            </div>
            <button onClick={()=>setTrips(ts=>ts.filter(x=>x.id!==t.id))}
              style={{background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.15)",borderRadius:7,padding:"5px 8px",color:"#F87171",cursor:"pointer",display:"flex"}}><Trash/></button>
          </div>
        ))}
        {trips.length===0&&<div style={{padding:"16px 14px",color:"#555E73",fontSize:13,textAlign:"center"}}>No trips yet</div>}
      </div>
      <div style={{background:"rgba(52,211,153,.06)",border:"1px solid rgba(52,211,153,.15)",borderRadius:14,padding:14}}>
        <div style={{fontSize:12,fontWeight:600,color:"#34D399",marginBottom:4}}>✓ Scanning Active</div>
        <div style={{fontSize:11,color:"#555E73",lineHeight:1.5}}>Your server checks prices {freq==="2x"?"twice":"three times"} a day. Push notifications fire the moment any route drops below your threshold.</div>
      </div>
      <div style={{background:"rgba(248,113,113,.06)",border:"1px solid rgba(248,113,113,.15)",borderRadius:14,padding:14}}>
        <div style={{fontSize:11,fontWeight:600,color:"#F87171",marginBottom:6}}>⚠ Note on prices</div>
        <div style={{fontSize:11,color:"#555E73",lineHeight:1.5}}>Prices shown are simulated for demo. Real-time scraping requires a backend server (Phase 2). Tap the refresh icon on any route to simulate a price check.</div>
      </div>
    </div>
  );
}

// ── HELPERS ────────────────────────────────────────────────────────────────────
const iconBtn={background:"#1E2330",border:"1px solid #2E3448",borderRadius:7,padding:"5px 8px",color:"#8B93A8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"};
const tileBtn={background:"#1E2330",border:"1.5px solid #2E3448",borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left",width:"100%"};
const INP={width:"100%",background:"#1E2330",border:"1.5px solid #2E3448",borderRadius:9,padding:"10px 14px",color:"#F0F2F8",fontSize:14,fontFamily:"Inter,sans-serif",outline:"none",colorScheme:"dark"};
const Lbl=({children})=><div style={{fontSize:10,fontWeight:600,color:"#555E73",textTransform:"uppercase",letterSpacing:.7,marginBottom:7}}>{children}</div>;
const SL =({children})=><div style={{fontSize:10,fontWeight:600,color:"#555E73",textTransform:"uppercase",letterSpacing:.7}}>{children}</div>;
const Chip=({children,color})=><div style={{background:`${color}22`,border:`1px solid ${color}44`,borderRadius:6,padding:"3px 8px",fontSize:11,color,fontWeight:600,display:"inline-block"}}>{children}</div>;
const PBtn=({children,onClick,disabled})=>(
  <button onClick={onClick} disabled={disabled}
    style={{width:"100%",padding:13,background:disabled?"#1E2330":"linear-gradient(135deg,#4F8EF7,#7C5CF6)",
      color:disabled?"#555E73":"#fff",border:"none",borderRadius:9,fontSize:14,fontWeight:700,
      cursor:disabled?"default":"pointer",fontFamily:"Inter,sans-serif",letterSpacing:-0.2,
      boxShadow:disabled?"none":"0 4px 16px rgba(79,142,247,.3)"}}>
    {children}
  </button>
);

// ── APP ────────────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("home");
  const [trips,setTrips]=useState(()=>loadTrips()||SEED);

  // Save on every trips change
  useEffect(()=>saveTrips(trips),[trips]);

  const TABS=[
    {id:"home",    label:"Home",    I:HomeIcon },
    {id:"alerts",  label:"Alerts",  I:BellIcon },
    {id:"trends",  label:"Trends",  I:TrendIcon},
    {id:"settings",label:"Settings",I:GearIcon },
  ];
  const dropCount=trips.flatMap(t=>t.routes).filter(r=>r.currentPrice<r.threshold).length;

  return(
    <div style={{minHeight:"100dvh",background:"#0A0C10",fontFamily:"Inter,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        html,body,#root{height:100%;margin:0;padding:0;}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
        input[type=number]{-moz-appearance:textfield;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:#555E73 !important;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.75);}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        ::-webkit-scrollbar{width:0;}
        a{-webkit-tap-highlight-color:transparent;}
      `}</style>

      {/* Fixed top nav */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
        background:"rgba(10,12,16,.94)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
        borderBottom:"1px solid #252B3B",padding:"0 16px",height:54,
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:800,fontSize:16,letterSpacing:-0.4,color:"#F0F2F8"}}>
          <div style={{width:28,height:28,background:"linear-gradient(135deg,#4F8EF7,#7C5CF6)",borderRadius:8,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
            boxShadow:"0 0 12px rgba(79,142,247,.4)"}}>✈</div>
          FlightWatch
        </div>
        <div style={{color:"#8B93A8",position:"relative",cursor:"pointer",padding:6}} onClick={()=>setTab("alerts")}>
          {dropCount>0&&<div style={{position:"absolute",top:2,right:2,width:16,height:16,
            background:"#F87171",borderRadius:"50%",fontSize:8,fontWeight:700,color:"#fff",
            display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #0A0C10"}}>{dropCount}</div>}
          <BellIcon/>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",paddingTop:54,paddingBottom:"calc(58px + env(safe-area-inset-bottom,8px))"}}>
        {tab==="home"    &&<HomeScreen     trips={trips} setTrips={setTrips}/>}
        {tab==="alerts"  &&<AlertsScreen   trips={trips} setTrips={setTrips}/>}
        {tab==="trends"  &&<TrendsScreen   trips={trips}/>}
        {tab==="settings"&&<SettingsScreen trips={trips} setTrips={setTrips}/>}
      </div>

      {/* Fixed bottom tab bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,
        display:"flex",borderTop:"1px solid #252B3B",
        background:"rgba(13,15,20,.97)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
        paddingBottom:"env(safe-area-inset-bottom,8px)"}}>
        {TABS.map(t=>{
          const on=tab===t.id;
          return(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{flex:1,padding:"9px 0 5px",background:"transparent",border:"none",
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",
                gap:3,color:on?"#4F8EF7":"#555E73",transition:"color .15s"}}>
              <t.I/>
              <span style={{fontSize:9,fontWeight:on?700:500,letterSpacing:.3,
                textTransform:"uppercase",fontFamily:"Inter,sans-serif"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
