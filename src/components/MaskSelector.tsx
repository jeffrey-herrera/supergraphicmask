import { Card } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { masks } from '@/data/masks.tsx';
import { cn } from '@/lib/utils';

const INACTIVE_COLOR = '#C9C4FF';
const ACTIVE_COLOR = '#801ED7';

export function MaskSelector() {
  const { state, dispatch } = useAppState();

  const handleMaskSelect = (maskId: string) => {
    dispatch({ type: 'SET_MASK', payload: maskId });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Select Mask</h3>
      <div className="grid grid-cols-2 gap-3">
        {masks.map((mask) => {
          const isActive = state.selectedMask === mask.id;
          return (
            <button
              key={mask.id}
              onClick={() => handleMaskSelect(mask.id)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-200 hover:border-primary/50 hover:scale-105",
                isActive
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-muted-foreground/25 hover:bg-muted/5"
              )}
            >
              <div className="flex items-center justify-center">
                {mask.preview(isActive ? ACTIVE_COLOR : INACTIVE_COLOR)}
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200">
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