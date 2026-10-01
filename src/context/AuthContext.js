// Hamro Safety - Auth Context
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth/authService';
import profileService from '../services/profile/profileService';

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async (targetUser) => {
    if (!targetUser?.id) return;
    try {
      const data = await profileService.getProfile(targetUser.id);
      if (data) setProfile(data);
    } catch (e) {
      console.warn('Load user profile warning:', e);
    }
  };

  useEffect(() => {
    let subscription = null;

    const initAuth = async () => {
      try {
        const { session: currentSession, error: sessionErr } = await authService.getSession();
        if (sessionErr) {
          console.log('Supabase Auth Error:', sessionErr);
        }
        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          await loadUserProfile(currentSession.user);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (e) {
        console.log('Supabase Auth Error:', e);
      } finally {
        setIsLoading(false);
      }

      subscription = authService.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession || null);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          await loadUserProfile(newSession.user);
        } else {
          setProfile(null);
        }
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
      setUser(res.user || null);
      setSession(res.session || null);
      if (res.user) await loadUserProfile(res.user);
      return res;
    } catch (err) {
      console.log('Supabase Auth Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, fullName, phone) => {
    setIsLoading(true);
    try {
      const res = await authService.signUp(email, password, fullName, phone);
      if (res.session) {
        setUser(res.user || res.session.user);
        setSession(res.session);
        if (res.user || res.session.user) {
          await loadUserProfile(res.user || res.session.user);
        }
      }
      return res;
    } catch (err) {
      console.log('Supabase Auth Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: Boolean(user),
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
