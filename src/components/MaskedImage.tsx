import { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { getMaskById } from '@/data/masks';

export function MaskedImage() {
  const { state, dispatch } = useAppState();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [maskContent, setMaskContent] = useState<string>('');

  const selectedMask = state.selectedMask ? getMaskById(state.selectedMask) : null;

  useEffect(() => {
    if (selectedMask) {
      fetch(selectedMask.path)
        .then(response => response.text())
        .then(svg => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svg, 'image/svg+xml');
          const svgElement = doc.documentElement;
          
          // Extract the path/shape from the SVG
          const shapes = svgElement.innerHTML;
          setMaskContent(shapes);
        })
        .catch(error => {
          console.error('Error loading mask:', error);
        });
    }
  }, [selectedMask]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!state.selectedImage) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !state.selectedImage) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    dispatch({
      type: 'SET_TRANSFORM',
      payload: {
        ...state.transform,
        translateX: state.transform.translateX + deltaX * 0.5,
        translateY: state.transform.translateY + deltaY * 0.5,
      },
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!state.selectedImage) return;

    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.1, Math.min(3, state.transform.scale + delta));

    dispatch({
      type: 'SET_TRANSFORM',
      payload: {
        ...state.transform,
        scale: newScale,
      },
    });
  };

  const canvasSize = 400;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Preview</h2>
        
        <div className="flex justify-center">
          <div
            className="relative bg-muted rounded-lg overflow-hidden"
            style={{ width: canvasSize, height: canvasSize }}
          >
            {state.selectedImage && selectedMask && maskContent ? (
              <svg
                ref={svgRef}
                width={canvasSize}
                height={canvasSize}
                viewBox="0 0 100 100"
                className="cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <defs>
                  <clipPath id="mask">
                    <g dangerouslySetInnerHTML={{ __html: maskContent }} />
                  </clipPath>
                </defs>
                
                <image
                  href={state.selectedImage}
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#mask)"
                  transform={`translate(${state.transform.translateX}, ${state.transform.translateY}) scale(${state.transform.scale})`}
                  style={{ transformOrigin: '50% 50%' }}
                />
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                {!state.selectedImage ? (
                  <p className="text-sm">Select an image to preview</p>
                ) : !selectedMask ? (
                  <p className="text-sm">Select a mask to preview</p>
                ) : (
                  <p className="text-sm">Loading mask...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {state.selectedImage && selectedMask && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Drag to pan • Scroll to zoom</p>
            <p>
              Scale: {Math.round(state.transform.scale * 100)}% • 
              Position: ({Math.round(state.transform.translateX)}, {Math.round(state.transform.translateY)})
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}