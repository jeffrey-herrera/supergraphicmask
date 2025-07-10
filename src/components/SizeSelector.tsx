import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { Check } from 'lucide-react';

// Export size options
const EXPORT_SIZES = [
  { label: '512px', value: 512, description: 'Small' },
  { label: '1024px', value: 1024, description: 'Medium' },
  { label: '2048px', value: 2048, description: 'Large' },
] as const;

interface SizeSelectorProps {
  selectedSize: number;
  onSizeChange: (size: number) => void;
}

export function SizeSelector({ selectedSize, onSizeChange }: SizeSelectorProps) {
  const { state } = useAppState();
  
  const isDisabled = !state.selectedImage;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-medium mb-4"><span className="text-primary">3. </span>Select Output Size <span className="block text-[10px] text-muted-foreground/60">(Upload an image to unlock size options)</span></h3>
      <div className="grid grid-cols-3 gap-2 h-20">
        {EXPORT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => onSizeChange(size.value)}
            disabled={isDisabled}
            className={`
              relative p-2 rounded-md bg-background/90 border text-xs transition-all duration-200 flex-1 h-full
              ${selectedSize === size.value 
                ? 'border-primary' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-background/70'}
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
  );
}