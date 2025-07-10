// Simplified floating sidebar without ShadCN sidebar components
import { ImageUploader } from './ImageUploader';
import { MaskSelector } from './MaskSelector';
import { ExportButton } from './ExportButton';
import { SizeSelector } from './SizeSelector';
import { useAppState } from '@/lib/store';
import { useState } from 'react';
import { X, LogOut, EyeOff, Eye, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function FloatingSidebar() {
  const { state } = useAppState();
  const { logout } = useAuth();
  const [selectedSize, setSelectedSize] = useState(1024); // Default to medium
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  return (
    <>
      {/* Desktop Layout - Hidden on mobile */}
      <div className={`hidden lg:block fixed left-4 right-4 z-40 transition-transform duration-300 ${
        isSidebarHidden ? '-translate-y-full top-4' : 'top-4'
      }`}>
        <div className="bg-background/20 backdrop-blur-sm border border-border rounded-lg shadow-xl overflow-hidden p-4 relative">
          <div className="grid grid-cols-12 gap-8 w-full items-start">

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
          
          {/* Hide/Show Button - Bottom right of sidebar */}
          <button
            onClick={() => setIsSidebarHidden(!isSidebarHidden)}
            className="absolute -bottom-8 right-0 px-2 py-1 bg-background/90 hover:bg-background border border-border rounded-md shadow-lg text-xs text-muted-foreground transition-colors flex items-center gap-1 z-10"
            title={isSidebarHidden ? "Show sidebar" : "Hide sidebar"}
          >
            {isSidebarHidden ? (
              <>
                <Eye className="w-3 h-3" />
                Show
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                Hide
              </>
            )}
          </button>
        </div>

      {/* Mobile Menu Button - Shown on mobile */}
      <div className="lg:hidden fixed top-4 left-4 right-4 z-40 flex items-stretch justify-between bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40 backdrop-blur-md border border-border rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col p-6">
          <img src="/Braze_Primary_logo_PURPLE.svg" alt="Braze Logo" className="w-10 relative top-[3px]" />
          <h2 className="text-xl font-semibold">SuperMask</h2>
        </div>
        <div className="flex items-center gap-2 p-4 pl-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="h-full flex items-center gap-2 px-4 rounded-lg border border-border hover:bg-background/80 transition-colors"          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Edit & Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Bottom sheet panel */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl transform transition-transform duration-300 ease-in-out animate-in slide-in-from-bottom h-[90vh]">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40 rounded-t-xl flex-shrink-0">
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
                <div className="px-4 pt-4 pb-2 space-y-8">
                  {/* Upload Section */}
                  <div className="h-40">
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
                  <div className="pb-4">
                    <ExportButton selectedSize={selectedSize} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Logo - Bottom Left - Hidden on mobile */}
      <div className="hidden lg:block fixed bottom-4 left-4 z-30 px-6 py-4 gap-8 bg-gradient-to-br from-white/95 via-blue-50/60 to-purple-50/40 backdrop-blur-md border border-border rounded-lg shadow-xl">
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