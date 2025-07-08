import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAppState } from '@/lib/store';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2, Undo, Redo } from 'lucide-react';

export function BottomControls() {
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

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleRedo = () => {
    dispatch({ type: 'REDO' });
  };

  const handleFill = () => {
    // Fill: Reset transform to default fill (scale 1, centered)
    dispatch({
      type: 'SET_TRANSFORM',
      payload: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
    });
  };

  const handleContain = () => {
    // Contain: Scale down image to fit entirely within the mask
    dispatch({
      type: 'SET_TRANSFORM',
      payload: {
        scale: 0.6,
        translateX: 0,
        translateY: 0,
      },
    });
  };

  const isDisabled = !state.selectedImage || !state.selectedMask;
  const isContainActive = state.transform.scale < 1 && state.transform.translateX === 0 && state.transform.translateY === 0;
  const isFillActive = state.transform.scale === 1 && state.transform.translateX === 0 && state.transform.translateY === 0;

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 z-30 max-w-[calc(100vw-48px)] max-w-4xl" style={{ bottom: '48px' }}>
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-4 py-3 mx-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Zoom controls */}
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={isDisabled}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 flex-1 sm:min-w-[150px]">
              <span className="text-xs font-medium hidden sm:inline">Zoom:</span>
              <Slider
                value={[state.transform.scale]}
                onValueChange={handleZoomChange}
                max={3}
                min={0.1}
                step={0.1}
                disabled={isDisabled}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground min-w-[35px]">
                {Math.round(state.transform.scale * 100)}%
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={isDisabled}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-1 border-r border-border/30 pr-2 mr-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={isDisabled || !state.canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={isDisabled || !state.canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            {/* Transform buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleContain}
              disabled={isDisabled}
              className={isContainActive ? 'border-primary' : ''}
            >
              <Minimize2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Contain</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleFill}
              disabled={isDisabled}
              className={isFillActive ? 'border-primary' : ''}
            >
              <Maximize2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Fill</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isDisabled}
            >
              <RotateCcw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}