import { useEffect, useRef } from 'react';

export default function Cursor() {
  const curRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0, raf = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (curRef.current) { curRef.current.style.left = mx + 'px'; curRef.current.style.top = my + 'px'; }
    };
    const loop = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      if (ringRef.current) { ringRef.current.style.left = rx + 'px'; ringRef.current.style.top = ry + 'px'; }
      raf = requestAnimationFrame(loop);
    };
    document.addEventListener('mousemove', onMove);
    loop();
    const grow = () => {
      if (curRef.current) { curRef.current.style.width = '20px'; curRef.current.style.height = '20px'; }
      if (ringRef.current) { ringRef.current.style.width = '64px'; ringRef.current.style.height = '64px'; ringRef.current.style.opacity = '1'; }
    };
    const shrink = () => {
      if (curRef.current) { curRef.current.style.width = '12px'; curRef.current.style.height = '12px'; }
      if (ringRef.current) { ringRef.current.style.width = '40px'; ringRef.current.style.height = '40px'; ringRef.current.style.opacity = '0.6'; }
    };
    const targets = document.querySelectorAll('a,button,.feature-card,.color-option,.spec-row,.progress-dot');
    targets.forEach(el => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      targets.forEach(el => { el.removeEventListener('mouseenter', grow); el.removeEventListener('mouseleave', shrink); });
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={curRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}
