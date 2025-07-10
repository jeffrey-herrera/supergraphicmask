import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppState } from '@/lib/store';
import { getMaskById } from '@/data/masks.tsx';
import { CenterDropZone } from './CenterDropZone';

export function MaskedImage() {
  const { state, dispatch } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(isDragging);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef(dragStart);
  useEffect(() => { dragStartRef.current = dragStart; }, [dragStart]);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isLoading, setIsLoading] = useState(false);
  const [isMaskLoading, setIsMaskLoading] = useState(false);

  const selectedMask = state.selectedMask ? getMaskById(state.selectedMask) : null;

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth - 400; // Account for sidebar
      const height = window.innerHeight - 100; // Account for controls
      setCanvasSize({ 
        width: Math.max(width, 400), 
        height: Math.max(height, 300) 
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load mask image when selectedMask changes
  useEffect(() => {
    if (selectedMask) {
      setIsMaskLoading(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setMaskImage(img);
        setIsMaskLoading(false);
      };
      img.onerror = (error) => {
        console.error('Error loading mask image:', error);
        setMaskImage(null);
        setIsMaskLoading(false);
      };
      img.src = selectedMask.path;
    } else {
      setMaskImage(null);
      setIsMaskLoading(false);
    }
  }, [selectedMask]);

  // Load source image when selectedImage changes
  useEffect(() => {
    if (state.selectedImage) {
      setIsLoading(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSourceImage(img);
        setIsLoading(false);
      };
      img.onerror = (error) => {
        console.error('Error loading source image:', error);
        setSourceImage(null);
        setIsLoading(false);
      };
      img.src = state.selectedImage;
    } else {
      setSourceImage(null);
      setIsLoading(false);
    }
  }, [state.selectedImage]);

  // Canvas drawing function - SIMPLIFIED AND ROBUST
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || !sourceImage || !maskImage) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate mask display size with 2% margin
    const margin = 0.02;
    const availableWidth = canvas.width * (1 - margin * 2);
    const availableHeight = canvas.height * (1 - margin * 2);
    
    // Calculate mask size to fit in available space while maintaining aspect ratio
    const maskAspect = maskImage.width / maskImage.height;
    const availableAspect = availableWidth / availableHeight;
    
    let maskDisplayWidth, maskDisplayHeight;
    if (maskAspect > availableAspect) {
      // Mask is wider - fit by width
      maskDisplayWidth = availableWidth;
      maskDisplayHeight = availableWidth / maskAspect;
    } else {
      // Mask is taller - fit by height
      maskDisplayHeight = availableHeight;
      maskDisplayWidth = availableHeight * maskAspect;
    }
    
    // Center the mask on canvas
    const maskX = (canvas.width - maskDisplayWidth) / 2;
    const maskY = (canvas.height - maskDisplayHeight) / 2;

    // Calculate image size and position within mask bounds
    const { scale, translateX, translateY } = state.transform;
    
    // Make image fill mask bounds by default (like CSS object-fit: cover)
    const imageAspect = sourceImage.width / sourceImage.height;
    let baseImageWidth, baseImageHeight;
    
    if (imageAspect > maskAspect) {
      // Image is wider - fit by height to fill mask
      baseImageHeight = maskDisplayHeight;
      baseImageWidth = baseImageHeight * imageAspect;
    } else {
      // Image is taller - fit by width to fill mask
      baseImageWidth = maskDisplayWidth;
      baseImageHeight = baseImageWidth / imageAspect;
    }

    // Apply user scale
    const finalImageWidth = baseImageWidth * scale;
    const finalImageHeight = baseImageHeight * scale;
    
    // Apply user translation (relative to mask center)
    const imageCenterX = maskX + maskDisplayWidth / 2 + translateX;
    const imageCenterY = maskY + maskDisplayHeight / 2 + translateY;
    
    const imageX = imageCenterX - finalImageWidth / 2;
    const imageY = imageCenterY - finalImageHeight / 2;

    // Draw the image first
    ctx.drawImage(
      sourceImage,
      imageX,
      imageY,
      finalImageWidth,
      finalImageHeight
    );

    // Apply mask using composite operation
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(
      maskImage,
      maskX,
      maskY,
      maskDisplayWidth,
      maskDisplayHeight
    );

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

  }, [sourceImage, maskImage, state.transform, canvasSize]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // --- Native event handler versions for passive: false ---
  // Native touch and wheel handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Touch events
    const handleNativeTouchStart = (e: TouchEvent) => {
      if (!state.selectedImage) return;
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setIsMultiTouch(false);
        setDragStart({ x: touch.clientX, y: touch.clientY });
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        setIsDragging(false);
        setIsMultiTouch(true);
        setLastTouchDistance(getTouchDistance(touch1, touch2));
        setLastTouchCenter(getTouchCenter(touch1, touch2));
      }
    };
    const handleNativeTouchMove = (e: TouchEvent) => {
      if (!state.selectedImage) return;
      e.preventDefault();
      if (e.touches.length === 1 && isDraggingRef.current && !isMultiTouchRef.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartRef.current.x;
        const deltaY = touch.clientY - dragStartRef.current.y;
        dispatch({
          type: 'SET_TRANSFORM',
          payload: {
            ...state.transform,
            translateX: state.transform.translateX + deltaX,
            translateY: state.transform.translateY + deltaY,
          },
        });
        setDragStart({ x: touch.clientX, y: touch.clientY });
      } else if (e.touches.length === 2 && isMultiTouchRef.current) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = getTouchDistance(touch1, touch2);
        const currentCenter = getTouchCenter(touch1, touch2);
        if (lastTouchDistanceRef.current > 0) {
          const scaleChange = currentDistance / lastTouchDistanceRef.current;
          const newScale = Math.max(0.1, Math.min(3, state.transform.scale * scaleChange));
          const panX = currentCenter.x - lastTouchCenterRef.current.x;
          const panY = currentCenter.y - lastTouchCenterRef.current.y;
          dispatch({
            type: 'SET_TRANSFORM',
            payload: {
              ...state.transform,
              scale: newScale,
              translateX: state.transform.translateX + panX,
              translateY: state.transform.translateY + panY,
            },
          });
        }
        setLastTouchDistance(currentDistance);
        setLastTouchCenter(currentCenter);
      }
    };
    const handleNativeTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        setIsDragging(false);
        setIsMultiTouch(false);
        setLastTouchDistance(0);
      } else if (e.touches.length === 1 && isMultiTouchRef.current) {
        const touch = e.touches[0];
        setIsMultiTouch(false);
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
        setLastTouchDistance(0);
      }
    };
    // Wheel event
    const handleNativeWheel = (e: WheelEvent) => {
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
    canvas.addEventListener('touchstart', handleNativeTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleNativeTouchEnd, { passive: false });
    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', handleNativeTouchStart);
      canvas.removeEventListener('touchmove', handleNativeTouchMove);
      canvas.removeEventListener('touchend', handleNativeTouchEnd);
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [state.selectedImage, state.transform, dispatch]);

  // Remove e.preventDefault() from React synthetic handlers
  const handleTouchStart = () => {};
  const handleTouchMove = () => {};
  const handleTouchEnd = () => {};
  const handleWheel = () => {};

  // Mouse event handlers
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
        translateX: state.transform.translateX + deltaX,
        translateY: state.transform.translateY + deltaY,
      },
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Enhanced touch event handlers with pinch-to-zoom and multi-touch pan
  const [lastTouchDistance, setLastTouchDistance] = useState<number>(0);
  const lastTouchDistanceRef = useRef(lastTouchDistance);
  useEffect(() => { lastTouchDistanceRef.current = lastTouchDistance; }, [lastTouchDistance]);
  const [lastTouchCenter, setLastTouchCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchCenterRef = useRef(lastTouchCenter);
  useEffect(() => { lastTouchCenterRef.current = lastTouchCenter; }, [lastTouchCenter]);
  const [isMultiTouch, setIsMultiTouch] = useState(false);
  const isMultiTouchRef = useRef(isMultiTouch);
  useEffect(() => { isMultiTouchRef.current = isMultiTouch; }, [isMultiTouch]);

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // Full-screen drop handlers for image upload
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      dispatch({ type: 'SET_IMAGE', payload: result });
    };
    reader.readAsDataURL(file);
  };

  const handleScreenDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_DRAGGING', payload: true });
  };

  const handleScreenDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      dispatch({ type: 'SET_DRAGGING', payload: false });
    }
  };

  const handleScreenDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_DRAGGING', payload: false });
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center bg-background overflow-hidden transition-all duration-200 ${
        state.isDragging ? 'bg-primary/5' : ''
      }`}
      onDragOver={handleScreenDragOver}
      onDragLeave={handleScreenDragLeave}
      onDrop={handleScreenDrop}
    >
      {/* Checkered background pattern */}
      <div 
        className={`absolute inset-0 transition-opacity duration-200 ${
          state.isDragging ? 'opacity-20' : 'opacity-30'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(45deg, #E3E1FF 25%, transparent 25%), 
            linear-gradient(-45deg, #E3E1FF 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #E3E1FF 30%), 
            linear-gradient(-45deg, transparent 75%, #E3E1FF 30%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
      
      <div className="relative flex items-center justify-center">
        <div
          className="relative"
          style={{ width: canvasSize.width, height: canvasSize.height }}
        >
          {state.selectedImage && selectedMask && sourceImage && maskImage ? (
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="cursor-move touch-none animate-image-load"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            />
          ) : !state.selectedImage ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 rounded-lg animate-slide-in-up">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center animate-bounce-in">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-sm">Upload an image to get started</p>
              </div>
            </div>
          ) : !selectedMask ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 rounded-lg animate-slide-in-up">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center animate-bounce-in">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <p className="text-sm">Select a mask to preview</p>
              </div>
            </div>
          ) : isLoading || isMaskLoading ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 rounded-lg animate-slide-in-up">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center animate-pulse-glow">
                  <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-sm animate-shimmer">
                  {isLoading ? 'Loading image...' : 'Loading mask...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 rounded-lg animate-slide-in-up">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center animate-bounce-in">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-sm">Something went wrong</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Center Drop Zone - only shows when no image */}
        <CenterDropZone />
        
        {/* Helper text when active */}
        {state.selectedImage && selectedMask && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-xs text-muted-foreground/60 bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="hidden sm:inline">Drag to pan • Scroll to zoom</span>
            <span className="sm:hidden">Drag to pan • Pinch to zoom</span>
          </div>
        )}
      </div>
    </div>
  );
}