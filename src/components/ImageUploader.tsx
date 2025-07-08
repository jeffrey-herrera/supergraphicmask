import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppState } from '@/lib/store';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

// Image optimization settings
const MAX_IMAGE_SIZE = 2000; // Maximum width/height in pixels
const JPEG_QUALITY = 0.85; // Quality for JPEG compression

export function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { state, dispatch } = useAppState();

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
    setIsDragging(true);
    dispatch({ type: 'SET_DRAGGING', payload: true });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dispatch({ type: 'SET_DRAGGING', payload: false });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dispatch({ type: 'SET_DRAGGING', payload: false });
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    dispatch({ type: 'SET_IMAGE', payload: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDisabled = isProcessing;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Upload Image</h3>
        {state.selectedImage && !isProcessing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            className="text-destructive hover:text-destructive h-6 px-2"
          >
            <X className="w-3 h-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {!state.selectedImage ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-sm font-medium text-primary mb-2">Processing image...</p>
              <p className="text-xs text-muted-foreground">
                Optimizing for better performance
              </p>
            </>
          ) : (
            <>
          <ImageIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-3">
            Drag and drop an image here, or click to select
          </p>
              <Button 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled}
              >
            <Upload className="w-3 h-3 mr-2" />
            Select Image
          </Button>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Large images will be automatically optimized
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
            disabled={isDisabled}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={state.selectedImage}
              alt="Selected image"
              className="w-full h-24 object-cover rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              disabled={isDisabled}
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
              disabled={isDisabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}