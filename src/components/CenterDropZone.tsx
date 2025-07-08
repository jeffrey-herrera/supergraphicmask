import { useRef, useState } from 'react';
import { useAppState } from '@/lib/store';
import { Upload } from 'lucide-react';

export function CenterDropZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { state, dispatch } = useAppState();

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Only show if no image is selected
  if (state.selectedImage) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`
          pointer-events-auto cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'scale-105 bg-primary/5 border-primary/50' 
            : 'bg-background/60 border-border/50 hover:bg-background/80 hover:border-border/80'
          }
          backdrop-blur-sm border-2 border-dashed rounded-2xl
          px-12 py-16 text-center max-w-md
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className={`
          w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center
          transition-colors duration-200
          ${isDragging ? 'bg-primary/20' : 'bg-muted/50'}
        `}>
          <Upload className={`
            w-8 h-8 transition-colors duration-200
            ${isDragging ? 'text-primary' : 'text-muted-foreground'}
          `} />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {isDragging ? 'Drop your image here' : 'Drag and drop an image'}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          {isDragging ? 'Release to upload' : 'or click to browse files'}
        </p>
        
        <div className="text-xs text-muted-foreground/60">
          Supports JPG, PNG, GIF, and more
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    </div>
  );
}