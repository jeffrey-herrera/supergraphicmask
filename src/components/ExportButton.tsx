import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { getMaskById } from '@/data/masks';
import { Download, Loader2 } from 'lucide-react';

export function ExportButton() {
  const { state, dispatch } = useAppState();
  const [isExporting, setIsExporting] = useState(false);

  const selectedMask = state.selectedMask ? getMaskById(state.selectedMask) : null;

  const handleExport = async () => {
    if (!state.selectedImage || !selectedMask) return;

    setIsExporting(true);
    dispatch({ type: 'SET_EXPORTING', payload: true });

    try {
      // Create a canvas for export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size (high resolution for better quality)
      const exportSize = 800;
      canvas.width = exportSize;
      canvas.height = exportSize;

      // Load the image
      const img = new Image();
      img.onload = async () => {
        try {
          // Load mask SVG
          const maskResponse = await fetch(selectedMask.path);
          const maskSVG = await maskResponse.text();
          
          // Create an SVG for the mask
          const maskCanvas = document.createElement('canvas');
          const maskCtx = maskCanvas.getContext('2d');
          if (!maskCtx) throw new Error('Mask canvas context not available');
          
          maskCanvas.width = exportSize;
          maskCanvas.height = exportSize;
          
          // Convert SVG to image for mask
          const svgBlob = new Blob([maskSVG], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const maskImg = new Image();
          
          maskImg.onload = () => {
            try {
              // Draw mask to get mask data
              maskCtx.drawImage(maskImg, 0, 0, exportSize, exportSize);
              const maskData = maskCtx.getImageData(0, 0, exportSize, exportSize);
              
              // Calculate image dimensions and position
              const { scale, translateX, translateY } = state.transform;
              const scaledSize = exportSize * scale;
              const offsetX = translateX * (exportSize / 400) + (exportSize - scaledSize) / 2;
              const offsetY = translateY * (exportSize / 400) + (exportSize - scaledSize) / 2;
              
              // Draw the image
              ctx.drawImage(img, offsetX, offsetY, scaledSize, scaledSize);
              
              // Get image data and apply mask
              const imageData = ctx.getImageData(0, 0, exportSize, exportSize);
              
              // Apply mask (use mask's alpha channel)
              for (let i = 0; i < imageData.data.length; i += 4) {
                const maskAlpha = maskData.data[i]; // Use red channel as alpha
                imageData.data[i + 3] = imageData.data[i + 3] * (maskAlpha / 255);
              }
              
              // Clear canvas and draw the masked image
              ctx.clearRect(0, 0, exportSize, exportSize);
              ctx.putImageData(imageData, 0, 0);
              
              // Download the image
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `masked-image-${Date.now()}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
                
                setIsExporting(false);
                dispatch({ type: 'SET_EXPORTING', payload: false });
              }, 'image/png');
              
              URL.revokeObjectURL(svgUrl);
            } catch (error) {
              console.error('Export error:', error);
              setIsExporting(false);
              dispatch({ type: 'SET_EXPORTING', payload: false });
            }
          };
          
          maskImg.src = svgUrl;
        } catch (error) {
          console.error('Export error:', error);
          setIsExporting(false);
          dispatch({ type: 'SET_EXPORTING', payload: false });
        }
      };
      
      img.src = state.selectedImage;
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      dispatch({ type: 'SET_EXPORTING', payload: false });
    }
  };

  const isDisabled = !state.selectedImage || !state.selectedMask || isExporting;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Export</h3>
      
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Export your masked image as a transparent PNG file.
        </div>
        
        <Button
          onClick={handleExport}
          disabled={isDisabled}
          className="w-full"
          size="sm"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-3 h-3 mr-2" />
              Export PNG
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