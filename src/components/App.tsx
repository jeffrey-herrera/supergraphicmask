import { AppProvider } from '@/lib/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGate } from './AuthGate';
import { AppContent } from './AppContent';

export function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthGate>
    </AuthProvider>
  );
}