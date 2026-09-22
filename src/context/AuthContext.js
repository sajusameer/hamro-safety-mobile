// Hamro Safety - Auth Context
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth/authService';

const AuthContext = createContext({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isDemo: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loginAsDemo: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(!authService.isConfigured);

  useEffect(() => {
    let subscription = null;

    const initAuth = async () => {
      try {
        const { session: currentSession, isDemo: demoActive } = await authService.getSession();
        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          setIsDemo(demoActive);
        } else if (demoActive) {
          // In demo mode without configured credentials, keep user signed in for testing
          setUser({
            id: 'demo-user-123',
            email: 'demo@hamrosafety.zuptrix.com',
            user_metadata: { full_name: 'Demo Safety User', phone_number: '+977-9800000000' },
          });
          setIsDemo(true);
        }
      } catch (e) {
        console.warn('Init auth failed:', e);
      } finally {
        setIsLoading(false);
      }

      subscription = authService.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
      });
    };

    initAuth();

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.signIn(email, password);
      setUser(res.user);
      setSession(res.session || null);
      setIsDemo(res.isDemo);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, fullName, phone) => {
    setIsLoading(true);
    try {
      const res = await authService.signUp(email, password, fullName, phone);
      setUser(res.user);
      setSession(res.session || null);
      setIsDemo(res.isDemo);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = () => {
    setUser({
      id: 'demo-user-123',
      email: 'demo@hamrosafety.zuptrix.com',
      user_metadata: { full_name: 'Sajus Shrestha', phone_number: '+977-9841234567' },
    });
    setIsDemo(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: Boolean(user),
        isLoading,
        isDemo,
        signIn,
        signUp,
        signOut,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
