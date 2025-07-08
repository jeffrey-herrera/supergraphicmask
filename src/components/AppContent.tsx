import { useEffect } from 'react';
import { FloatingSidebar } from './FloatingSidebar';
import { MaskedImage } from './MaskedImage';
import { BottomControls } from './BottomControls';
import { Toaster } from '@/components/ui/sonner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAppState } from '@/lib/store';
import { getMaskById } from '@/data/masks.tsx';

export function AppContent() {
  const { state, dispatch } = useAppState();
  
  useKeyboardShortcuts();

  // Clean up invalid state on app load
  useEffect(() => {
    // If there's a selected mask that doesn't exist in our current mask data, reset it
    if (state.selectedMask && !getMaskById(state.selectedMask)) {
      dispatch({ type: 'SET_MASK', payload: null });
    }
  }, [state.selectedMask, dispatch]);

  return (
    <div className="min-h-screen bg-background">
      {/* Horizontal Sidebar */}
      <FloatingSidebar />
      
      {/* Full-screen Preview - with top padding for horizontal sidebar */}
      <div className="pt-40 md:pt-32 lg:pt-28">
        <MaskedImage />
      </div>
      
      {/* Floating Bottom Controls */}
      <BottomControls />
      
      <Toaster />
    </div>
  );
}