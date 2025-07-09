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
        const envClientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
        const fallbackClientId = '904580882877-uo48gf4dq08kkdmvajrgiasg931abamq.apps.googleusercontent.com';
        const clientId = envClientId || fallbackClientId;
        
        // Debug: Check which CLIENT_ID is being used
        console.log('Environment variable CLIENT_ID:', envClientId);
        console.log('Using CLIENT_ID:', clientId);
        console.log('Is using fallback?', !envClientId);
        
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
            <h1 className="text-3xl font-bold text-gray-900">SuperMask</h1>
          </div>
          <p className="text-gray-600 mb-2">
            Sign in with your <span className="text-purple-600 font-medium">@braze.com</span> email
          </p>
          <p className="text-gray-600">
            to access SuperMask
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-6">
          <div ref={googleButtonRef} className="flex justify-center mb-4"></div>
          
          {/* Fallback button for development */}
          {!import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || import.meta.env.PUBLIC_GOOGLE_CLIENT_ID === 'your_google_client_id_here' ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">Development Mode</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Google OAuth not configured. Please set PUBLIC_GOOGLE_CLIENT_ID in .env
                </p>
              </div>
              <button 
                onClick={() => {
                  // Simulate a @braze.com login for development
                  const mockJWT = {
                    email: 'developer@braze.com',
                    name: 'Developer',
                    picture: ''
                  };
                  // Create a simple base64 encoded token (not a real JWT, but works for development)
                  const mockToken = btoa(JSON.stringify({ header: {}, payload: mockJWT }));
                  login(mockToken);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continue with Mock @braze.com Login
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer Text */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>Secure authentication via Google OAuth.</p>
          <p>Only Braze team members can access this system.</p>
        </div>
      </div>
    </div>
  );
}