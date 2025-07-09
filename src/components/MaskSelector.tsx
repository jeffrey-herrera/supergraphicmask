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
    <>
      <h3 className="text-sm font-medium">Choose a Shape <span className="block text-[10px] text-muted-foreground/60">(Upload an image to unlock mask options)</span></h3>
      <div>
        {/* All mask option buttons go here, no extra wrappers */}
        <div className="hidden lg:flex gap-2 h-20">
          {masks.map((mask) => (
            <button
              key={mask.id}
              onClick={() => handleMaskSelect(mask.id)}
              disabled={isDisabled}
              className={`
                rounded-lg border-2 transition-all duration-200 flex-1 h-full
                ${state.selectedMask === mask.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/5'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <img src={mask.icon} alt={mask.name} className="w-8 h-8 mx-auto" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}