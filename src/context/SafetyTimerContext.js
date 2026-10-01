// Hamro Safety - Safety Timer Context
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { createContext, useContext, useState, useEffect } from 'react';
import safetyTimerService from '../services/safetyTimer/safetyTimerService';
import { useEmergency } from './EmergencyContext';
import { useAuth } from './AuthContext';
import { SAFETY_STATES } from '../constants/safetyStates';

const SafetyTimerContext = createContext({
  activeTimer: null,
  remainingSeconds: 0,
  isExpired: false,
  startTimer: async () => {},
  extendTimer: async () => {},
  checkInSafe: async () => {},
  needHelp: async () => {},
  cancelTimer: async () => {},
});

export const SafetyTimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const { setSafetyState, triggerSOS } = useEmergency();
  const { user } = useAuth();

  // Load existing active timer on startup
  useEffect(() => {
    const checkActive = async () => {
      const timer = await safetyTimerService.getActiveTimer(user?.id);
      if (timer) {
        setActiveTimer(timer);
      }
    };
    checkActive();
  }, [user]);

  // Countdown timer loop & automatic escalation upon expiry
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(async () => {
      const now = new Date().getTime();
      const expiresAt = new Date(activeTimer.expires_at).getTime();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));

      setRemainingSeconds(diff);

      if (diff === 0 && !isExpired) {
        setIsExpired(true);
        setSafetyState(SAFETY_STATES.EXPIRED);
        clearInterval(interval);
        // Automatic escalation to active emergency event upon unconfirmed expiry
        try {
          await safetyTimerService.escalateTimerToHelp(activeTimer.id);
          await triggerSOS();
        } catch (e) {
          console.warn('Auto escalation failed:', e);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, isExpired, setSafetyState, triggerSOS]);

  const startTimer = async (title, destination, durationMinutes) => {
    const timer = await safetyTimerService.startTimer(title, destination, durationMinutes, user?.id);
    setActiveTimer(timer);
    setIsExpired(false);
    return timer;
  };

  const extendTimer = async (additionalMinutes = 15) => {
    if (activeTimer) {
      const updated = await safetyTimerService.extendTimer(activeTimer.id, additionalMinutes);
      setActiveTimer({ ...updated });
      setIsExpired(false);
    }
  };

  const checkInSafe = async (note) => {
    if (activeTimer) {
      await safetyTimerService.checkInSafe(activeTimer.id, note);
    }
    setActiveTimer(null);
    setIsExpired(false);
    setSafetyState(SAFETY_STATES.SAFE);
  };

  const needHelp = async () => {
    if (activeTimer) {
      await safetyTimerService.escalateTimerToHelp(activeTimer.id);
    }
    setActiveTimer(null);
    setIsExpired(false);
    // Auto-trigger full SOS
    await triggerSOS();
  };

  const cancelTimer = async () => {
    if (activeTimer) {
      await safetyTimerService.cancelTimer(activeTimer.id);
    }
    setActiveTimer(null);
    setIsExpired(false);
    setSafetyState(SAFETY_STATES.SAFE);
  };

  return (
    <SafetyTimerContext.Provider
      value={{
        activeTimer,
        remainingSeconds,
        isExpired,
        startTimer,
        extendTimer,
        checkInSafe,
        needHelp,
        cancelTimer,
      }}
    >
      {children}
    </SafetyTimerContext.Provider>
  );
};

export const useSafetyTimer = () => useContext(SafetyTimerContext);
export default SafetyTimerContext;
