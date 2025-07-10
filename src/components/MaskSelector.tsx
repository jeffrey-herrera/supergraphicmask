import { useAppState } from '@/lib/store';
import { masks } from '@/data/masks.tsx';
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
    <>
      <h3 className="text-sm font-medium mb-4"><span className="text-primary">2. </span>Choose a Shape <span className="block text-[10px] text-muted-foreground/60">(Upload an image to unlock mask options)</span></h3>
      <div>
        {/* Desktop layout */}
        <div className="hidden lg:flex gap-2 h-20">
          {masks.map((mask) => {
            const isActive = state.selectedMask === mask.id;
            return (
              <button
                key={mask.id}
                onClick={() => handleMaskSelect(mask.id)}
                disabled={isDisabled}
                className={`
                  rounded-lg border bg-background/90 transition-all duration-200 flex-1 h-full flex items-center justify-center
                  ${isActive ? 'border-primary' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-background/70'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {mask.preview(isActive ? ACTIVE_COLOR : INACTIVE_COLOR)}
              </button>
            );
          })}
        </div>
        
        {/* Mobile layout */}
        <div className="lg:hidden grid grid-cols-3 gap-2">
          {masks.map((mask) => {
            const isActive = state.selectedMask === mask.id;
            return (
              <button
                key={mask.id}
                onClick={() => handleMaskSelect(mask.id)}
                disabled={isDisabled}
                className={`
                  rounded-lg border bg-background/90 transition-all duration-200 h-16 flex items-center justify-center overflow-hidden
                  ${isActive ? 'border-primary' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-background/70'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {mask.preview(isActive ? ACTIVE_COLOR : INACTIVE_COLOR)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}