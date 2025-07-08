// Simplified floating sidebar without ShadCN sidebar components
import { ImageUploader } from './ImageUploader';
import { MaskSelector } from './MaskSelector';
import { ExportButton } from './ExportButton';
import { useAppState } from '@/lib/store';
// No longer needed - removed lucide imports

export function FloatingSidebar() {
  const { state } = useAppState();

  return (
    <div className="fixed top-2 left-2 right-2 lg:top-4 lg:left-4 lg:right-4 z-40 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="py-3 px-4 lg:py-4 lg:px-6 border-b flex items-center gap-3 lg:gap-4 bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40 backdrop-blur-md">
        <img src="/Braze_Primary_logo_PURPLE.svg" alt="Braze Logo" className="w-8 h-auto lg:w-12" />
        <h2 className="text-xl lg:text-2xl font-semibold">SuperMask</h2>
      </div>
      
      {/* Horizontal Content Layout */}
      <div className="p-3 lg:p-4">
        <div className="flex flex-col md:flex-row gap-3 lg:gap-6">
          {/* Upload Section */}
          <div className="flex-1 min-w-0">
            <ImageUploader />
          </div>

          {/* Masks Section */}
          <div className="flex-1 min-w-0">
            <MaskSelector />
          </div>

          {/* Export Section */}
          <div className="flex-shrink-0 md:min-w-[120px]">
            <ExportButton />
          </div>
        </div>
      </div>
    </div>
  );
}