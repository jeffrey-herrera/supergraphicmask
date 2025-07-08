import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/store';
import { getMaskById } from '@/data/masks';
import { Download, Loader2, Check } from 'lucide-react';

// Export size options
const EXPORT_SIZES = [
  { label: '512px', value: 512, description: 'Small' },
  { label: '1024px', value: 1024, description: 'Medium' },
  { label: '2048px', value: 2048, description: 'Large' },
] as const;

export function ExportButton() {
  const { state, dispatch } = useAppState();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSize, setSelectedSize] = useState(1024); // Default to medium

  const selectedMask = state.selectedMask ? getMaskById(state.selectedMask) : null;

  const handleExport = async (exportSize: number) => {
    if (!state.selectedImage || !selectedMask) return;

    setIsExporting(true);
    dispatch({ type: 'SET_EXPORTING', payload: true });

    try {
      // Create images for source and mask
      const sourceImg = new Image();
      const maskImg = new Image();
      
      // Load source image
      await new Promise<void>((resolve, reject) => {
        sourceImg.onload = () => resolve();
        sourceImg.onerror = reject;
        sourceImg.crossOrigin = 'anonymous';
        sourceImg.src = state.selectedImage!;
      });

      // Load mask image
      await new Promise<void>((resolve, reject) => {
        maskImg.onload = () => resolve();
        maskImg.onerror = reject;
        maskImg.crossOrigin = 'anonymous';
        maskImg.src = selectedMask.path;
      });

      // Create export canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = exportSize;
      canvas.height = exportSize;

      // Calculate mask display size with 2% margin (same as preview)
      const margin = 0.02;
      const availableWidth = canvas.width * (1 - margin * 2);
      const availableHeight = canvas.height * (1 - margin * 2);
      
      // Calculate mask size to fit in available space while maintaining aspect ratio
      const maskAspect = maskImg.width / maskImg.height;
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

      // Calculate image size and position within mask bounds (same as preview)
      const { scale, translateX, translateY } = state.transform;
      
      // Make image fill mask bounds by default (like CSS object-fit: cover)
      const imageAspect = sourceImg.width / sourceImg.height;
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
      
      // Apply user scale and translation
      const finalImageWidth = baseImageWidth * scale;
      const finalImageHeight = baseImageHeight * scale;
      
      // Scale translation for export size (relative to preview canvas)
      const previewCanvasSize = Math.min(window.innerWidth - 400, window.innerHeight - 100);
      const scaleRatio = exportSize / previewCanvasSize;
      
      const imageCenterX = maskX + maskDisplayWidth / 2 + (translateX * scaleRatio);
      const imageCenterY = maskY + maskDisplayHeight / 2 + (translateY * scaleRatio);
      
      const imageX = imageCenterX - finalImageWidth / 2;
      const imageY = imageCenterY - finalImageHeight / 2;

      // Draw the image first
      ctx.drawImage(
        sourceImg,
        imageX,
        imageY,
        finalImageWidth,
        finalImageHeight
      );

      // Apply mask using composite operation
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(
        maskImg,
        maskX,
        maskY,
        maskDisplayWidth,
        maskDisplayHeight
      );

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      // Download the image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `masked-image-${exportSize}x${exportSize}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        
        setIsExporting(false);
        dispatch({ type: 'SET_EXPORTING', payload: false });
      }, 'image/png', 1.0); // Max quality

    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      dispatch({ type: 'SET_EXPORTING', payload: false });
    }
  };

  const isDisabled = !state.selectedImage || !state.selectedMask || isExporting;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Size Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Export Size</label>
          <div className="grid grid-cols-3 gap-1">
            {EXPORT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value)}
                disabled={isDisabled}
                className={`
                  relative p-2 rounded-md border text-xs transition-all duration-200
                  ${selectedSize === size.value 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/5'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="font-medium">{size.label}</div>
                <div className="text-muted-foreground">{size.description}</div>
                {selectedSize === size.value && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={() => handleExport(selectedSize)}
          disabled={isDisabled}
          className="w-full"
          size="sm"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Exporting {selectedSize}px...
            </>
          ) : (
            <>
              <Download className="w-3 h-3 mr-2" />
              Export {selectedSize}px PNG
            </>
          )}
        </Button>
        
        {isDisabled && !isExporting && (
          <p className="text-xs text-muted-foreground text-center">
            Select an image and mask to export
          </p>
        )}
      </div>
    </div>
  );
}