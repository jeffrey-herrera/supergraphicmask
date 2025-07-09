import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: GoogleUser | null;
  login: (credential: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on page load
    const savedAuth = localStorage.getItem('braze_auth');
    if (savedAuth) {
      try {
        const userData = JSON.parse(savedAuth);
        if (userData.email && userData.email.endsWith('@braze.com')) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('braze_auth');
        }
      } catch (error) {
        localStorage.removeItem('braze_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (credential: string) => {
    try {
      // Decode JWT token from Google OAuth
      const decoded: any = jwtDecode(credential);
      const userData: GoogleUser = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };

      // Check if email ends with @braze.com
      if (userData.email && userData.email.endsWith('@braze.com')) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('braze_auth', JSON.stringify(userData));
      } else {
        alert('Access denied. This application is only available to @braze.com email addresses.');
      }
    } catch (error) {
      console.error('Failed to decode credential:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('braze_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}