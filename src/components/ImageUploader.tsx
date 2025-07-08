import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/store';
import { Upload, Loader2, X } from 'lucide-react';

const MAX_IMAGE_SIZE = 2000;
const JPEG_QUALITY = 0.85;

export function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localIsDragging, setLocalIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { state, dispatch } = useAppState();

  const isDragging = localIsDragging || state.isDragging;

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
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
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

  const handleRemoveImage = () => {
    dispatch({ type: 'SET_IMAGE', payload: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Upload Image</h3>
        {state.selectedImage && !isProcessing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            className="text-destructive hover:text-destructive h-5 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Remove
          </Button>
        )}
      </div>
      {/* Minimal drop zone container */}
      <div className="relative">
        {!state.selectedImage ? (
          <div
            className={`
              pointer-events-auto smooth-transition hover-lift
              ${isDragging 
                ? 'scale-102 bg-primary/5 border-primary/50' 
                : 'bg-background/60 border-border/50 hover:bg-background/80 hover:border-border/80'
              }
              ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
              backdrop-blur-sm border-2 border-solid rounded-xl
              px-4 py-4 text-center max-w-full min-h-[90px]
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className={`
              w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center
              smooth-transition
              ${isDragging ? 'bg-primary/20' : 'bg-muted/50'}
            `}>
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Upload className={`
                  w-5 h-5 smooth-transition
                  ${isDragging ? 'text-primary' : 'text-muted-foreground'}
                `} />
              )}
            </div>
            <h3 className="text-xs font-semibold mb-1">
              {isProcessing ? 'Processing...' : 
                isDragging ? 'Drop image here' : 'Drop or click to upload'}
            </h3>
            <p className="text-xs text-muted-foreground mb-1 [text-wrap:balance]">
              {isProcessing ? 'Optimizing image...' :
                isDragging ? 'Release to upload' : 'or browse files'}
            </p>
            <div className="text-[10px] text-muted-foreground/60 [text-wrap:balance]">
              {isProcessing ? 'Please wait...' : 'JPG, PNG, GIF, and more'}
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
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={state.selectedImage}
                alt="Selected image"
                className="w-full h-16 object-cover rounded-lg smooth-transition hover-lift"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 smooth-transition hover-lift text-xs h-7"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 mr-1" />
                    Replace
                  </>
                )}
              </Button>
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
        )}
      </div>
      {/* Optimization helper text below the container */}
      <p className="text-[10px] text-muted-foreground/60 mt-1 [text-wrap:balance] text-center">
        We'll optimize large images for you.
      </p>
    </div>
  );
}