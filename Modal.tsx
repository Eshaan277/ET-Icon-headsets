import { useEffect } from 'react';

interface Props { open: boolean; onClose: () => void; onSubmit: () => void; }

export default function Modal({ open, onClose, onSubmit }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!open) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position:'fixed',inset:0,zIndex:10000,background:'rgba(0,0,0,.88)',backdropFilter:'blur(24px)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#111',border:'1px solid var(--border)',padding:60,maxWidth:520,width:'90%',position:'relative',animation:'modalSlide .4s forwards' }}>
        <button onClick={onClose} className="nav-link" style={{ position:'absolute',top:20,right:24,fontSize:11,letterSpacing:2 }}>[ESC] CLOSE</button>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:44,letterSpacing:4,marginBottom:8 }}>Reserve Now</div>
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--accent)',marginBottom:32 }}>SOOS Pro X1 · Limited Edition · $449</div>
        <input className="modal-input" type="text" placeholder="Full Name" />
        <input className="modal-input" type="email" placeholder="Email Address" />
        <input className="modal-input" type="text" placeholder="Shipping Country" />
        <select className="modal-input" style={{ appearance:'none', cursor:'pointer', color:'var(--text)' }}>
          <option value="">Select Color Edition</option>
          {['Obsidian Black','Champagne Gold','Arctic Silver','Deep Navy','Forest Sage'].map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={onSubmit} className="btn-primary" style={{ width:'100%',marginTop:8,display:'block',textAlign:'center' }}>
          <span>Reserve Your Pair — $449</span>
        </button>
      </div>
    </div>
  );
}
