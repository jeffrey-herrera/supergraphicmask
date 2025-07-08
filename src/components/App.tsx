import { AppProvider } from '@/lib/store';
import { ImageUploader } from './ImageUploader';
import { MaskSelector } from './MaskSelector';
import { MaskedImage } from './MaskedImage';
import { Controls } from './Controls';
import { ExportButton } from './ExportButton';
import { Toaster } from '@/components/ui/sonner';

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              SupergraphicMask
            </h1>
            <p className="text-muted-foreground">
              Transform your images with stylized SVG masks
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar */}
            <div className="space-y-6">
              <ImageUploader />
              <MaskSelector />
              <Controls />
              <ExportButton />
            </div>

            {/* Main content */}
            <div className="lg:col-span-2">
              <MaskedImage />
            </div>
          </div>
        </div>
        
        <Toaster />
      </div>
    </AppProvider>
  );
}