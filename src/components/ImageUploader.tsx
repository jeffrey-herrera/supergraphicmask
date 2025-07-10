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
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-medium mb-4"><span className="text-primary">1. </span>Upload Image <span className="block text-[10px] text-muted-foreground/60">We'll optimize large images for you.</span></h3>
      <div className="flex-1 flex flex-col">
        {!state.selectedImage ? (
          <div
            className={`
              pointer-events-auto smooth-transition hover-lift flex-1
              ${isDragging 
                ? 'scale-102 bg-primary/5 border-primary/50' 
                : 'bg-background/60 border-border/50 hover:bg-background/80 hover:border-border/80'
              }
              ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
              backdrop-blur-sm border-2 border-solid rounded-xl
              px-4 text-center max-w-full w-full flex flex-col justify-center
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="flex items-center justify-center gap-3">
              <div className={`
                w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center
                smooth-transition
                ${isDragging ? 'bg-primary/20' : 'bg-muted'}
              `}>
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Upload className={`
                    w-6 h-6 smooth-transition
                    ${isDragging ? 'text-primary' : 'text-muted-foreground'}
                  `} />
                )}
              </div>
              <div className="text-left inline-block">
                <h3 className="text-xs font-semibold">
                  {isProcessing ? 'Processing...' : 
                    isDragging ? 'Drop image here' : 'Drop or click to upload'}
                </h3>
                <div className="text-[10px] text-muted-foreground/60">
                  {isProcessing ? 'Please wait...' : 'JPG, PNG, GIF, and more'}
                </div>
              </div>
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
          <div className="relative flex-1">
            <img
              src={state.selectedImage}
              alt="Selected image"
              className="w-full h-full object-cover rounded-lg smooth-transition"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/95 hover:bg-white text-black border-white/50 smooth-transition hover-lift text-xs cursor-pointer"
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
        )}
      </div>
    </div>
  );
}