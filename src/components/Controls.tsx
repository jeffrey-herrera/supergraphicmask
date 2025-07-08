import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAppState } from '@/lib/store';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export function Controls() {
  const { state, dispatch } = useAppState();

  const handleZoomChange = (value: number[]) => {
    dispatch({
      type: 'SET_TRANSFORM',
      payload: {
        ...state.transform,
        scale: value[0],
      },
    });
  };

  const handleZoomIn = () => {
    const newScale = Math.min(3, state.transform.scale + 0.2);
    dispatch({
      type: 'SET_TRANSFORM',
      payload: {
        ...state.transform,
        scale: newScale,
      },
    });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.1, state.transform.scale - 0.2);
    dispatch({
      type: 'SET_TRANSFORM',
      payload: {
        ...state.transform,
        scale: newScale,
      },
    });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_TRANSFORM' });
  };

  const isDisabled = !state.selectedImage || !state.selectedMask;

  return (
    <Card className="p-6 animate-slide-in-up">
      <div className="space-y-4">
        <h2 className="text-sm font-medium">Controls</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={isDisabled}
                className="smooth-transition hover-lift"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <Slider
                  value={[state.transform.scale]}
                  onValueChange={handleZoomChange}
                  max={3}
                  min={0.1}
                  step={0.1}
                  disabled={isDisabled}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={isDisabled}
                className="smooth-transition hover-lift"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center animate-shimmer">
              {Math.round(state.transform.scale * 100)}%
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Position</label>
            <div className="text-xs text-muted-foreground animate-shimmer">
              X: {Math.round(state.transform.translateX)} • Y: {Math.round(state.transform.translateY)}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isDisabled}
            className="w-full smooth-transition hover-lift"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Position
          </Button>
        </div>
      </div>
    </Card>
  );
}