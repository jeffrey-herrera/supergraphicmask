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
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">SuperMask</h2>
      </div>
      
      {/* Content - All sections always visible */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 48px - 4rem)' }}>
        <div className="p-4 space-y-6">
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