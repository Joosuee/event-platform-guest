import { useRef } from 'react';

// Detecta un deslizamiento horizontal (dedo o mouse) sin mostrar flechas ni
// botones. Funciona igual en celular (touch) y escritorio (mouse), porque
// usa Pointer Events, que unifica ambos.
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 40 } = {}) {
  const startX = useRef(null);

  function onPointerDown(e) {
    startX.current = e.clientX;
  }

  function onPointerUp(e) {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    startX.current = null;
    if (delta <= -threshold) onSwipeLeft?.();
    else if (delta >= threshold) onSwipeRight?.();
  }

  function onPointerCancel() {
    startX.current = null;
  }

  return { onPointerDown, onPointerUp, onPointerCancel };
}