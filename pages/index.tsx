import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Cursor from '../components/Cursor';
import Modal from '../components/Modal';
import Toast, { ToastHandle } from '../components/Toast';
import { IMG_ASSEMBLED, IMG_DISASSEMBLY, IMG_EXPLODED1, IMG_EXPLODED2 } from '../components/imageData';

const PHASES = [
  { title: 'SOOS PRO X1', sub: 'The Complete Form', imgs: [1,0,0,0], labels: false },
  { title: 'STRUCTURAL REVEAL', sub: 'Headband · Yoke · Pivot Assembly', imgs: [0.35,0,0.65,0], labels: false },
  { title: 'MECHANICAL ANATOMY', sub: 'Precision Disassembly in Progress', imgs: [0,0,1,0], labels: false },
  { title: 'COMPONENT ARCHITECTURE', sub: 'Driver · PCB · Voice Coil · Magnetic System', imgs: [0,0.15,0.2,0.85], labels: false },
  { title: 'FULL EXPLODED VIEW', sub: '47 Precision Components · Zero Compromise', imgs: [0,0,0,1], labels: true },
];

const FEATURES = [
  { n:'01', name:'40mm Planar Magnetic', desc:'Ultra-thin diaphragm driven by a distributed voice coil delivers zero distortion at any volume. Every frequency reproduced with surgical precision — from 10Hz sub-bass rumble to 40kHz crystalline highs you feel before you hear.' },
  { n:'02', name:'Adaptive ANC –42dB', desc:'Six beamforming microphones map your acoustic environment 1,000 times per second. Neural Silence Engine eliminates ambient noise before it reaches your ears. Aircraft engines. City streets. Open offices. All gone.' },
  { n:'03', name:'60-Hour Battery Life', desc:'Dual-cell lithium polymer with intelligent power routing. ANC on, LDAC streaming, 60 continuous hours. 10 minutes of rapid charge unlocks 8 hours of playback. Your music never stops.' },
  { n:'04', name:'Spatial Audio Engine', desc:'Head-tracking at 1000Hz with gyroscopic precision. HRTF profiles calibrated to your ear anatomy via the SOOS app. Dolby Atmos and 360 Reality Audio deliver concert hall acoustics on your daily commute.' },
  { n:'05', name:'Aerospace-Grade Build', desc:'CNC-machined 7075 aluminium yoke. Carbon-fibre reinforced headband. Memory protein ear cushions that conform precisely to your anatomy. Rated IPX4. Built to survive every journey you will ever take.' },
  { n:'06', name:'Bluetooth 5.3 Multipoint', desc:'Connect to three devices simultaneously with seamless priority-switching. LDAC at 990kbps, aptX HD, AAC. A connection that keeps pace with your life without ever asking you to choose a single device.' },
];

const SPECS = [
  ['Driver Type','40mm Planar Magnetic',''],
  ['Frequency Response','10 – 40,000','Hz'],
  ['Impedance','32','Ω'],
  ['Sensitivity','105','dB/mW'],
  ['ANC Attenuation','–42','dB'],
  ['Battery Life','60','hrs ANC on'],
  ['Charge Time','90','min full'],
  ['Weight','248','g'],
  ['Bluetooth','5.3 Multipoint',''],
  ['Water Resistance','IPX4 Rated',''],
];

const COLORS = [
  { name:'Obsidian', label:'Obsidian Black', bg:'#0d0d0d', shadow:'inset 0 0 0 1px rgba(255,255,255,.1)' },
  { name:'Champagne', label:'Champagne Gold', bg:'linear-gradient(135deg,#c8a96e,#f0d4a0)' },
  { name:'Arctic', label:'Arctic Silver', bg:'linear-gradient(135deg,#a8a8a8,#d4d4d4)' },
  { name:'Navy', label:'Deep Navy', bg:'linear-gradient(135deg,#0a1628,#1a3a6b)' },
  { name:'Forest', label:'Forest Sage', bg:'linear-gradient(135deg,#2d4a3e,#4a7c6a)' },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function ease(t: number) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const toastRef = useRef<ToastHandle>(null);
  const toast = useCallback((msg: string) => toastRef.current?.show(msg), []);

  // Scroll engine refs
  const scrollRef = useRef({ current: 0, target: 0 });
  const tiltRef = useRef({ x: 0, y: 0 });

  // DOM refs for animation
  const imgRefs = useRef<(HTMLImageElement | null)[]>([null,null,null,null]);
  const heroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLDivElement>(null);
  const phaseTitleRef = useRef<HTMLDivElement>(null);
  const phaseSubRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([null,null,null,null]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([null,null,null,null,null]);
  const glowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const lastPhase = useRef(-1);

  useEffect(() => {
    const scroll = scrollRef.current;

    // Smooth scroll engine
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scroll.target = clamp(scroll.target + e.deltaY * 0.85, 0, document.documentElement.scrollHeight - window.innerHeight);
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const d = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      scroll.target = clamp(scroll.target + d * 2, 0, document.documentElement.scrollHeight - window.innerHeight);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Tilt on mousemove
    const onMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      const r = sceneRef.current.getBoundingClientRect();
      tiltRef.current.x = (e.clientX - r.left - r.width / 2) / r.width;
      tiltRef.current.y = (e.clientY - r.top - r.height / 2) / r.height;
    };
    const onMouseLeave = () => { tiltRef.current.x *= 0.9; tiltRef.current.y *= 0.9; };
    sceneRef.current?.addEventListener('mousemove', onMouseMove);
    sceneRef.current?.addEventListener('mouseleave', onMouseLeave);

    let raf: number;
    const loop = () => {
      scroll.current += (scroll.target - scroll.current) * 0.055;
      if (Math.abs(scroll.target - scroll.current) > 0.05) window.scrollTo(0, scroll.current);

      const ch = (containerRef.current?.offsetHeight ?? 0) - window.innerHeight;
      const sf = clamp(scroll.current / ch, 0, 1);
      const pr = sf * (PHASES.length - 1);
      const pi = Math.floor(pr);
      const pf = ease(pr - pi);
      const cp = PHASES[Math.min(pi, PHASES.length - 1)];
      const np = PHASES[Math.min(pi + 1, PHASES.length - 1)];

      // Images
      imgRefs.current.forEach((img, i) => {
        if (!img) return;
        const op = clamp(lerp(cp.imgs[i], np.imgs[i], pf), 0, 1);
        img.style.opacity = String(op);
        const sc = 1 + sf * 0.06;
        const ry = tiltRef.current.x * 12 + (sf - 0.5) * 6;
        const rx = tiltRef.current.y * -7 + (sf - 0.5) * -3;
        img.style.transform = `scale(${sc}) perspective(1400px) rotateY(${ry}deg) rotateX(${rx}deg)`;
      });

      // Hero
      const ho = clamp(1 - sf * 9, 0, 1);
      if (heroRef.current) { heroRef.current.style.opacity = String(ho); heroRef.current.style.transform = `translate(-50%, calc(-50% - ${sf * 90}px))`; }
      if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - sf * 22, 0, 1));

      // Phase text
      const pv = clamp((sf - 0.08) * 7, 0, 1) * clamp(1 - (sf - 0.87) * 12, 0, 1);
      if (phaseRef.current) phaseRef.current.style.opacity = String(pv);

      const di = Math.round(pr);
      if (di !== lastPhase.current && di < PHASES.length) {
        lastPhase.current = di;
        if (phaseTitleRef.current) phaseTitleRef.current.textContent = PHASES[di].title;
        if (phaseSubRef.current) phaseSubRef.current.textContent = PHASES[di].sub;
        dotRefs.current.forEach((d, i) => d?.classList.toggle('active', i === Math.min(di, PHASES.length - 1)));
      }

      // Labels
      const lo = lerp(cp.labels ? 1 : 0, np.labels ? 1 : 0, pf);
      labelRefs.current.forEach((l, i) => {
        if (!l) return;
        l.style.opacity = String(lo * (0.5 + i * 0.15));
        l.style.transform = `translateX(${(1 - lo) * -24}px)`;
      });

      // Glow
      if (glowRef.current) glowRef.current.style.opacity = String(0.25 + sf * 0.75);

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const scrollToPhase = (i: number) => {
    const ch = (containerRef.current?.offsetHeight ?? 0) - window.innerHeight;
    scrollRef.current.target = (i / (PHASES.length - 1)) * ch;
  };

  const scrollToId = (id: string) => {
    if (id === 'top') { scrollRef.current.target = 0; return; }
    const el = document.getElementById(id);
    if (el) scrollRef.current.target = el.offsetTop;
  };

  const submitOrder = () => { setModalOpen(false); toast('Order Reserved! Check Your Email'); };

  // Ticker items
  const tickerItems = ['Driver · 40mm Planar','Freq · 10Hz–40kHz','ANC · –42dB','Battery · 60 Hours','Codec · LDAC · aptX HD','Weight · 248g','BT · 5.3 Multipoint','Charge · 10min=8h'];

  return (
    <>
      <Head><title>ET Icon Headsets — Hear Every Dimension</title></Head>

      <div className="noise-overlay" />
      <Cursor />

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:1000,padding:'22px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',backdropFilter:'blur(24px)',background:'rgba(10,10,10,.65)',borderBottom:'1px solid var(--border)' }}>
        <div onClick={() => scrollToId('top')} style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:6,cursor:'pointer',transition:'color .3s' }} onMouseOver={e=>(e.currentTarget.style.color='var(--accent)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text)')}>SOOS</div>
        <ul style={{ display:'flex',gap:36,listStyle:'none' }} className="hide-mobile">
          {[['Technology','features-section'],['Specifications','specs-section'],['Editions','colors-section'],['Buy','cta-section']].map(([l,id]) => (
            <li key={id}><button className="nav-link" onClick={() => scrollToId(id)}>{l}</button></li>
          ))}
        </ul>
        <button className="btn-primary" onClick={() => setModalOpen(true)} style={{ padding:'12px 28px',fontSize:11,letterSpacing:3 }}><span>Order Now</span></button>
      </nav>

      {/* MAIN SCROLL CONTAINER */}
      <div id="scroll-container" ref={containerRef} style={{ height:'700vh',position:'relative' }}>
        <div id="scene" ref={sceneRef} style={{ position:'sticky',top:0,height:'100vh',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:'var(--bg)' }}>

          {/* Ambient glow */}
          <div ref={glowRef} style={{ position:'absolute',width:640,height:640,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(200,169,110,.09) 0%,transparent 70%)',pointerEvents:'none',opacity:.25 }} />

          {/* Product images — stacked, opacity-driven */}
          {[IMG_ASSEMBLED, IMG_DISASSEMBLY, IMG_EXPLODED1, IMG_EXPLODED2].map((src, i) => (
            <img key={i} ref={el => { imgRefs.current[i] = el; }} src={src} alt={`SOOS phase ${i}`} className="product-img" style={{ opacity: i === 0 ? 1 : 0 }} />
          ))}

          {/* Floating part labels */}
          {[
            { label:'40mm Planar Driver', style:{top:'42%',left:'61%'} },
            { label:'Dual-Layer ANC Board', style:{top:'51%',left:'63%'} },
            { label:'Memory Foam Ear Cup', style:{top:'36%',left:'14%'} },
            { label:'Voice Coil Assembly', style:{top:'59%',left:'59%'} },
          ].map((lb, i) => (
            <div key={i} ref={el => { labelRefs.current[i] = el; }} className="float-label" style={{ ...lb.style, opacity:0 }}>{lb.label}</div>
          ))}

          {/* Hero text */}
          <div ref={heroRef} style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center',pointerEvents:'none',zIndex:10 }}>
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:6,textTransform:'uppercase',color:'var(--accent)',marginBottom:16,opacity:0,animation:'fadeUp 1.2s .3s forwards' }}>Introducing ET Icon Headsets</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(64px,10vw,140px)',lineHeight:.88,letterSpacing:4,opacity:0,animation:'fadeUp 1.2s .5s forwards' }}>
              Hear Every<br /><span style={{ color:'var(--accent)' }}>Dimension</span>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,letterSpacing:2,color:'var(--dim)',marginTop:20,opacity:0,animation:'fadeUp 1.2s .7s forwards' }}>40mm Planar Magnetic &nbsp;·&nbsp; Adaptive ANC &nbsp;·&nbsp; 60hr Battery</div>
          </div>

          {/* Scroll hint */}
          <div ref={hintRef} style={{ position:'absolute',bottom:88,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,animation:'glow 2s ease-in-out infinite',zIndex:20 }}>
            <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:4,textTransform:'uppercase',color:'var(--dim)' }}>Scroll to Explore</span>
            <div style={{ width:1,height:40,background:'linear-gradient(to bottom,var(--accent),transparent)',animation:'scrollBar 2s ease-in-out infinite' }} />
          </div>

          {/* Phase text */}
          <div ref={phaseRef} style={{ position:'absolute',bottom:110,left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:20,pointerEvents:'none',opacity:0,transition:'opacity .6s ease' }}>
            <div ref={phaseTitleRef} style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:40,letterSpacing:6,lineHeight:1 }} />
            <div ref={phaseSubRef} style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,color:'var(--dim)',marginTop:8,textTransform:'uppercase' }} />
          </div>

          {/* Sound visualizer */}
          <div style={{ position:'absolute',bottom:82,right:48,display:'flex',alignItems:'flex-end',gap:4,height:40,opacity:.45 }}>
            {[60,100,40,80,55,90,35,70,50,85].map((h,i) => (
              <div key={i} className="vis-bar" style={{ height:`${h}%`,animation:`barPulse ${1+i*0.08}s ease-in-out ${i*0.08}s infinite` }} />
            ))}
          </div>
        </div>
      </div>

      {/* SCROLL PROGRESS SIDEBAR */}
      <div style={{ position:'fixed',right:32,top:'50%',transform:'translateY(-50%)',zIndex:500,display:'flex',flexDirection:'column',gap:10,alignItems:'center' }}>
        {PHASES.map((p, i) => (
          <div key={i} ref={el => { dotRefs.current[i] = el; }} className={`progress-dot${i === 0 ? ' active' : ''}`} onClick={() => scrollToPhase(i)} title={p.title} />
        ))}
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,color:'var(--dim)',writingMode:'vertical-rl',textTransform:'uppercase',marginTop:16 }}>Explore</div>
      </div>

      {/* SPEC TICKER BAR */}
      <div style={{ position:'fixed',bottom:0,left:0,right:0,zIndex:500,borderTop:'1px solid var(--border)',background:'rgba(10,10,10,.82)',backdropFilter:'blur(20px)',padding:'13px 0',overflow:'hidden' }}>
        <div style={{ display:'flex',gap:0,animation:'ticker 28s linear infinite',width:'max-content' }}>
          {[...tickerItems,...tickerItems].map((item,i) => (
            <div key={i} style={{ display:'flex',gap:10,alignItems:'center',paddingRight:64,whiteSpace:'nowrap',flexShrink:0 }}>
              <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,color:'var(--accent)',textTransform:'uppercase' }}>◈</span>
              <span style={{ fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section id="features-section" style={{ background:'var(--bg)',padding:'120px 48px',position:'relative',zIndex:10 }}>
        <div style={{ textAlign:'center',marginBottom:80 }}>
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:5,textTransform:'uppercase',color:'var(--accent)',marginBottom:16 }}>Engineering Excellence</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(48px,6vw,80px)',letterSpacing:3,lineHeight:1 }}>Built Different.<br />Heard Different.</div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,maxWidth:1200,margin:'0 auto' }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="feature-card" onClick={e => { document.querySelectorAll('.feature-card').forEach(c => (c as HTMLElement).style.borderColor='var(--border)'); (e.currentTarget as HTMLElement).style.borderColor='var(--accent)'; }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:72,color:'rgba(200,169,110,.1)',lineHeight:1,marginBottom:16,transition:'color .4s' }}>{f.n}</div>
              <div style={{ width:48,height:48,marginBottom:20 }}>
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" strokeWidth={1.5} style={{ width:'100%',height:'100%' }}>
                  {i===0&&<><circle cx="24" cy="24" r="10"/><line x1="24" y1="4" x2="24" y2="8"/><line x1="24" y1="40" x2="24" y2="44"/><line x1="4" y1="24" x2="8" y2="24"/><line x1="40" y1="24" x2="44" y2="24"/></>}
                  {i===1&&<><path d="M8 24c0-8.8 7.2-16 16-16s16 7.2 16 16"/><path d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10"/><circle cx="24" cy="24" r="3"/><line x1="24" y1="27" x2="24" y2="35"/></>}
                  {i===2&&<><rect x="8" y="20" width="32" height="16" rx="2"/><path d="M16 20v-4a8 8 0 0 1 16 0v4"/></>}
                  {i===3&&<><path d="M6 38l10-10 8 8 18-20"/><circle cx="40" cy="12" r="4"/></>}
                  {i===4&&<><path d="M30 6l12 12-20 20-12-12z"/><line x1="6" y1="42" x2="12" y2="36"/></>}
                  {i===5&&<><circle cx="24" cy="24" r="20"/><polyline points="24,12 24,24 32,30"/></>}
                </svg>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,marginBottom:12,letterSpacing:1 }}>{f.name}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:13,lineHeight:1.85,color:'var(--dim)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SPECS ============ */}
      <section id="specs-section" style={{ padding:'120px 48px',background:'#080808',borderTop:'1px solid var(--border)',position:'relative',zIndex:10 }}>
        <div style={{ textAlign:'center',marginBottom:80 }}>
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:5,textTransform:'uppercase',color:'var(--accent)',marginBottom:16 }}>Technical Specifications</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(48px,6vw,80px)',letterSpacing:3,lineHeight:1 }}>Numbers That<br />Tell the Story</div>
        </div>
        <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center' }}>
          <div style={{ position:'relative',height:500,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ position:'absolute',width:340,height:340,borderRadius:'50%',border:'1px solid var(--border)',animation:'spinRing 15s linear infinite reverse' }} />
            <div style={{ position:'absolute',width:480,height:480,borderRadius:'50%',border:'1px dashed var(--border)',animation:'spinRing 22s linear infinite' }} />
            <img src={IMG_ASSEMBLED} alt="SOOS P
