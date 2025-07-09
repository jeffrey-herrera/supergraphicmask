import { Card } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { masks } from '@/data/masks.tsx';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const INACTIVE_COLOR = '#C9C4FF';
const ACTIVE_COLOR = '#801ED7';

export function MaskSelector() {
  const { state, dispatch } = useAppState();

  // Auto-select first mask when image is uploaded
  useEffect(() => {
    if (state.selectedImage && !state.selectedMask && masks.length > 0) {
      dispatch({ type: 'SET_MASK', payload: masks[0].id });
    }
  }, [state.selectedImage, state.selectedMask, dispatch]);

  const handleMaskSelect = (maskId: string) => {
    if (!state.selectedImage) return; // Prevent selection if no image
    dispatch({ type: 'SET_MASK', payload: maskId });
  };

  const isDisabled = !state.selectedImage;

  return (
    <div className="h-full flex flex-col justify-center">
      <h3 className="text-sm font-medium">
        Choose a Shape {isDisabled && <span className="text-[10px] font-normal block">(Upload an image to unlock mask options)</span>}
      </h3>
      {/* Desktop: Single row, Mobile: 2x3 grid */}
      <div className="hidden lg:flex gap-2 h-20">
        {masks.map((mask, index) => {
          const isActive = state.selectedMask === mask.id;
          return (
            <button
              key={mask.id}
              onClick={() => handleMaskSelect(mask.id)}
              disabled={isDisabled}
              className={cn(
                "relative rounded-lg border-2 smooth-transition flex-1 min-w-0 h-full",
                isDisabled 
                  ? "border-muted-foreground/25 bg-muted/20 cursor-not-allowed opacity-50"
                  : isActive
                    ? "border-primary bg-primary/5 scale-105 animate-pulse-glow hover-lift"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/5 hover-lift"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
            >
              <div className="flex items-center justify-center smooth-transition">
                {mask.preview(isActive ? ACTIVE_COLOR : INACTIVE_COLOR)}
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-bounce-in">
                  <svg
                    className="w-2 h-2 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Mobile: 2x3 grid */}
      <div className="lg:hidden grid grid-cols-3 gap-3 auto-rows-fr">
        {masks.map((mask, index) => {
          const isActive = state.selectedMask === mask.id;
          return (
            <button
              key={mask.id}
              onClick={() => handleMaskSelect(mask.id)}
              disabled={isDisabled}
              className={cn(
                "relative rounded-lg border-2 smooth-transition aspect-square min-h-[60px]",
                isDisabled 
                  ? "border-muted-foreground/25 bg-muted/20 cursor-not-allowed opacity-50"
                  : isActive
                    ? "border-primary bg-primary/5 animate-pulse-glow hover-lift"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/5 hover-lift"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
            >
              <div className="flex items-center justify-center smooth-transition h-full w-full p-2">
                {mask.preview(isActive ? ACTIVE_COLOR : INACTIVE_COLOR)}
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-bounce-in">
                  <svg
                    className="w-2 h-2 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}