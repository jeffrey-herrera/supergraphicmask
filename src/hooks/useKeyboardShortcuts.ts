import { useEffect } from 'react';
import { useAppState } from '@/lib/store';

export function useKeyboardShortcuts() {
  const { state, dispatch } = useAppState();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Reset position and zoom (R key)
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        dispatch({ type: 'RESET_TRANSFORM' });
        return;
      }

      // Zoom in (+ or =)
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        const newScale = Math.min(3, state.transform.scale + 0.2);
        dispatch({
          type: 'SET_TRANSFORM',
          payload: {
            ...state.transform,
            scale: newScale,
          },
        });
        return;
      }

      // Zoom out (- or _)
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        const newScale = Math.max(0.1, state.transform.scale - 0.2);
        dispatch({
          type: 'SET_TRANSFORM',
          payload: {
            ...state.transform,
            scale: newScale,
          },
        });
        return;
      }

      // Fill (F key)
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        dispatch({
          type: 'SET_TRANSFORM',
          payload: {
            scale: 1.5,
            translateX: 0,
            translateY: 0,
          },
        });
        return;
      }

      // Contain (C key)
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        dispatch({
          type: 'SET_TRANSFORM',
          payload: {
            scale: 0.8,
            translateX: 0,
            translateY: 0,
          },
        });
        return;
      }

      // Arrow keys for fine positioning
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const moveAmount = e.shiftKey ? 10 : 2; // Shift for larger movements
        
        let newX = state.transform.translateX;
        let newY = state.transform.translateY;
        
        switch (e.key) {
          case 'ArrowUp':
            newY -= moveAmount;
            break;
          case 'ArrowDown':
            newY += moveAmount;
            break;
          case 'ArrowLeft':
            newX -= moveAmount;
            break;
          case 'ArrowRight':
            newX += moveAmount;
            break;
        }
        
        dispatch({
          type: 'SET_TRANSFORM',
          payload: {
            ...state.transform,
            translateX: newX,
            translateY: newY,
          },
        });
        return;
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }

      // Export (E key)
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        // This would trigger export - we'll need to expose this through context
        // For now, just log
        console.log('Export shortcut pressed');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state, dispatch]);
}