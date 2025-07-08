import { AppProvider } from '@/lib/store';
import { AppContent } from './AppContent';

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}