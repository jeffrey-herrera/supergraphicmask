import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

export function LoginScreen() {
  const { login } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        const clientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          console.error('CLIENT_ID is not defined!');
          return;
        }
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: 250,
          }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = (response: any) => {
    login(response.credential);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        {/* SuperMask Logo Lockup */}
        <div className="mb-8">
          <div className="flex-col text-center gap-2 mb-6">
            <img src="/Braze_Primary_logo_PURPLE.svg" alt="Braze Logo" className="w-16 mx-auto" />
            <h1 className="text-4xl font-bold text-gray-900">SuperMask</h1>
          </div>
          <p className="text-gray-600 mb-2">
            Sign in with your <span className="text-purple-600 font-medium">@braze.com</span> email
            <br />to access SuperMask
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-6">
          <div ref={googleButtonRef} className="flex justify-center mb-4 w-full"></div>
          

        </div>

        {/* Footer Text */}
        <div className="text-xs text-gray-300">
          <p>Secure authentication via Google OAuth.<br/>Only Braze team members can access this system.</p>
        </div>
      </div>
    </div>
  );
}