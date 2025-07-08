// Simplified floating sidebar without ShadCN sidebar components
import { ImageUploader } from './ImageUploader';
import { MaskSelector } from './MaskSelector';
import { ExportButton } from './ExportButton';
import { useAppState } from '@/lib/store';
// No longer needed - removed lucide imports

export function FloatingSidebar() {
  const { state } = useAppState();

  return (
    <div className="fixed z-40 w-80 max-w-[calc(100vw-48px)] bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl overflow-hidden" style={{ top: '32px', left: '32px', maxHeight: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <div className="py-6 px-8 border-b flex flex-col bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40 backdrop-blur-md">
        <img src="/Braze_Primary_logo_PURPLE.svg" alt="Braze Logo" className="w-16 h-auto" />
        <h2 className="text-3xl font-semibold">SuperMask</h2>
      </div>
      
      {/* Content - All sections always visible */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 48px - 4rem)' }}>
        <div className="p-8 space-y-8">
          {/* Upload Section */}
          <div>
            <ImageUploader />
          </div>

          {/* Masks Section */}
          <div>
            <MaskSelector />
          </div>

          {/* Export Section */}
          <div>
            <ExportButton />
          </div>
        </div>
      </div>
    </div>
  );
}