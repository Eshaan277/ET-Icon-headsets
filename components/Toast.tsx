import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface ToastHandle { show: (msg: string) => void; }

const Toast = forwardRef<ToastHandle>((_, ref) => {
  const el = useRef<HTMLDivElement>(null);
  const t = useRef<ReturnType<typeof setTimeout>>();
  useImperativeHandle(ref, () => ({
    show(msg: string) {
      if (!el.current) return;
      clearTimeout(t.current);
      el.current.textContent = msg;
      el.current.style.opacity = '1';
      el.current.style.transform = 'translateX(-50%) translateY(0)';
      t.current = setTimeout(() => {
        if (el.current) { el.current.style.opacity = '0'; el.current.style.transform = 'translateX(-50%) translateY(20px)'; }
      }, 2400);
    }
  }));
  return (
    <div ref={el} style={{ position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%) translateY(20px)',background:'var(--accent)',color:'var(--bg)',fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:3,textTransform:'uppercase',padding:'14px 36px',zIndex:99999,opacity:0,transition:'all .4s ease',whiteSpace:'nowrap',pointerEvents:'none' }} />
  );
});
Toast.displayName = 'Toast';
export default Toast;
