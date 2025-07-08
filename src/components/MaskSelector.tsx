import { Card } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { masks } from '@/data/masks';
import { cn } from '@/lib/utils';

export function MaskSelector() {
  const { state, dispatch } = useAppState();

  const handleMaskSelect = (maskId: string) => {
    dispatch({ type: 'SET_MASK', payload: maskId });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Mask</h2>
        <div className="grid grid-cols-2 gap-3">
          {masks.map((mask) => (
            <button
              key={mask.id}
              onClick={() => handleMaskSelect(mask.id)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                state.selectedMask === mask.id
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
              )}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <img
                    src={mask.path}
                    alt={mask.name}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="text-sm font-medium">{mask.name}</span>
              </div>
              {state.selectedMask === mask.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-primary-foreground"
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
          ))}
        </div>
      </div>
    </Card>
  );
}