import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/store';
import { getMaskById } from '@/data/masks.tsx';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  selectedSize: number;
}

export function ExportButton({ selectedSize }: ExportButtonProps) {
  const { state, dispatch } = useAppState();
  const [isExporting, setIsExporting] = useState(false);

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
    <div className="p-4">
      <div className="w-full space-y-4">
        {/* Export Button */}
        <button
          onClick={() => handleExport(selectedSize)}
          disabled={isDisabled}
          className={`w-full font-bold text-xs sm:text-sm py-6 sm:py-8 px-3 sm:px-4 rounded-full shadow-2xl transition-all duration-300 transform flex items-center justify-center gap-1 sm:gap-2 relative overflow-hidden ${
            isDisabled 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60' 
              : 'bg-gradient-to-r from-[#5710E5] via-[#7C3AED] to-[#A855F7] hover:from-[#4A0DCC] hover:via-[#6B21A8] hover:to-[#9333EA] text-white hover:shadow-[0_20px_40px_-8px_rgba(87,16,229,0.6)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Image'}</span>
          <span className="sm:hidden">{isExporting ? 'Export...' : 'Export'}</span>
        </button>
        
        {isDisabled && !isExporting && (
          <p className="text-[10px] text-muted-foreground text-center [text-wrap:balance]">
            Add an image and shape to export
          </p>
        )}
      </div>
    </div>
  );
}