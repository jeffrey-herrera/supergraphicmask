import { useRef, useState } from 'react';
import { useAppState } from '@/lib/store';
import { Upload, Loader2 } from 'lucide-react';

// Image optimization settings (same as ImageUploader)
const MAX_IMAGE_SIZE = 2000; // Maximum width/height in pixels
const JPEG_QUALITY = 0.85; // Quality for JPEG compression

export function CenterDropZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localIsDragging, setLocalIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { state, dispatch } = useAppState();

  // Use global drag state OR local drag state for visual feedback
  const isDragging = state.isDragging || localIsDragging;

  const optimizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          
          if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = MAX_IMAGE_SIZE;
              height = width / aspectRatio;
            } else {
              height = MAX_IMAGE_SIZE;
              width = height * aspectRatio;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress the image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to optimized format
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const quality = mimeType === 'image/jpeg' ? JPEG_QUALITY : undefined;
          
          const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(optimizedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (warn if over 10MB)
    if (file.size > 10 * 1024 * 1024) {
      if (!confirm('This image is quite large. It will be optimized for better performance. Continue?')) {
        return;
      }
    }

    setIsProcessing(true);

    try {
      const optimizedImageUrl = await optimizeImage(file);
      dispatch({ type: 'SET_IMAGE', payload: optimizedImageUrl });
    } catch (error) {
      console.error('Image optimization failed:', error);
      alert('Failed to process image. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setLocalIsDragging(true);
    dispatch({ type: 'SET_DRAGGING', payload: true });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setLocalIsDragging(false);
    dispatch({ type: 'SET_DRAGGING', payload: false });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLocalIsDragging(false);
    dispatch({ type: 'SET_DRAGGING', payload: false });
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
    fileInputRef.current?.click();
    }
  };

  // Only show if no image is selected
  if (state.selectedImage) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`
          pointer-events-auto smooth-transition hover-lift
          ${isDragging 
            ? 'scale-105 bg-primary/5 border-primary/50 animate-pulse-glow' 
            : 'bg-background/60 border-border/50 hover:bg-background/80 hover:border-border/80 animate-border-pulse'
          }
          ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
          backdrop-blur-sm border-2 border-solid rounded-2xl
          px-12 py-16 text-center max-w-md
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className={`
          w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center
          smooth-transition
          ${isDragging ? 'bg-primary/20 animate-pulse-glow' : 'bg-muted/50'}
        `}>
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
          <Upload className={`
            w-8 h-8 smooth-transition
            ${isDragging ? 'text-primary animate-bounce-in' : 'text-muted-foreground'}
          `} />
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {isProcessing ? 'Processing image...' : 
           isDragging ? 'Drop your image here' : 'Drag and drop an image'}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 [text-wrap:balance]">
          {isProcessing ? 'Optimizing for better performance' :
           isDragging ? 'Release to upload' : 'or click to browse files'}
        </p>
        
        <div className="text-xs text-muted-foreground/60 [text-wrap:balance]">
          {isProcessing ? 'Please wait...' : 'Supports JPG, PNG, GIF, and more'}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}