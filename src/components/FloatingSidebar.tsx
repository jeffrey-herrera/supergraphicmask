// Simplified floating sidebar without ShadCN sidebar components
import { ImageUploader } from './ImageUploader';
import { MaskSelector } from './MaskSelector';
import { ExportButton } from './ExportButton';
import { SizeSelector } from './SizeSelector';
import { useAppState } from '@/lib/store';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function FloatingSidebar() {
  const { state } = useAppState();
  const { logout } = useAuth();
  const [selectedSize, setSelectedSize] = useState(1024); // Default to medium
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden lg:block fixed top-4 left-4 right-4 p-4 z-40 bg-background border border-border rounded-lg shadow-xl overflow-hidden h-[168px] p-4">
        {/* Single Row, 5-Column Layout */}
          <div className="grid grid-cols-12 gap-6 h-full items-start">

            {/* Column 1: Upload Section */}
            <div className="col-span-3 flex-col flex-1 min-w-0 align-start h-full">
              <ImageUploader />
            </div>

            {/* Column 2: Masks Section */}
            <div className="col-span-4 flex-col flex-1 min-w-0 align-start h-full">
              <MaskSelector />
            </div>

            {/* Column 3: Size Selection */}
            <div className="col-span-3 flex-col flex-1 min-w-0 align-start h-full">
              <SizeSelector selectedSize={selectedSize} onSizeChange={setSelectedSize} />
            </div>

            {/* Column 4: Export Section */}
            <div className="col-span-2 flex-1 min-w-0 h-full">
                <ExportButton selectedSize={selectedSize} />
            </div>
        </div>
      </div>

      {/* Mobile Menu Button - Shown on mobile */}
      <div className="lg:hidden fixed top-4 left-4 right-4 z-40 flex items-center justify-between p-4 bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40 backdrop-blur-md border border-border rounded-lg shadow-xl">
        <div className="flex items-center gap-2">
          <img src="/Braze_Primary_logo_PURPLE.svg" alt="Braze Logo" className="w-8" />
          <h2 className="text-lg font-semibold">SuperMask</h2>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg border border-border hover:bg-background/80 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Slide-over Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40">
                <div className="flex items-center gap-2">
                  <img src="/Braze_Primary_logo_PURPLE.svg" alt="Braze Logo" className="w-8" />
                  <h2 className="text-lg font-semibold">SuperMask</h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg border border-border hover:bg-background/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 p-4">
                  {/* Upload Section */}
                  <div>
                    <ImageUploader />
                  </div>

                  {/* Masks Section */}
                  <div>
                    <MaskSelector />
                  </div>

                  {/* Size Selection */}
                  <div>
                    <SizeSelector selectedSize={selectedSize} onSizeChange={setSelectedSize} />
                  </div>

                  {/* Export Section */}
                  <div>
                    <ExportButton selectedSize={selectedSize} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Logo - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-30 px-6 py-4 gap-8 bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40 backdrop-blur-md border border-border rounded-lg shadow-xl">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-col items-center gap-2">
            <img src="/Braze_Primary_logo_PURPLE.svg" alt="Braze Logo" className="w-12" />
            <h2 className="text-2xl font-semibold whitespace-nowrap">SuperMask</h2>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 p-2 rounded-lg border border-border hover:bg-background/80 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}