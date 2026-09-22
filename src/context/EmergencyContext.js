// Hamro Safety - Global Emergency State Context
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAFETY_STATES } from '../constants/safetyStates';
import sosService from '../services/sos/sosService';
import locationService from '../services/location/locationService';

const EmergencyContext = createContext({
  safetyState: SAFETY_STATES.SAFE,
  activeEmergency: null,
  lastLocation: null,
  dispatches: [],
  isActivating: false,
  startActivating: () => {},
  cancelActivating: () => {},
  triggerSOS: async () => {},
  resolveEmergency: async () => {},
  refreshLocation: async () => {},
});

export const EmergencyProvider = ({ children }) => {
  const [safetyState, setSafetyState] = useState(SAFETY_STATES.SAFE);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [isActivating, setIsActivating] = useState(false);

  // Check for any active ongoing emergency on app startup
  useEffect(() => {
    const checkActive = async () => {
      try {
        const existing = await sosService.getActiveEmergency();
        if (existing) {
          setActiveEmergency(existing);
          setSafetyState(SAFETY_STATES.SOS_ACTIVE);
          locationService.startEmergencyTracking((loc) => setLastLocation(loc));
        } else {
          // Pre-fetch single location snapshot for dashboard
          const loc = await locationService.getCurrentLocation();
          setLastLocation(loc);
        }
      } catch (e) {
        console.warn('Check active emergency failed:', e);
      }
    };
    checkActive();
  }, []);

  const refreshLocation = async () => {
    const loc = await locationService.getCurrentLocation();
    setLastLocation(loc);
    return loc;
  };

  // Called when user begins holding SOS button
  const startActivating = () => {
    setIsActivating(true);
    setSafetyState(SAFETY_STATES.SOS_ACTIVATING);
  };

  // Called if user releases SOS button before 3-second hold finishes
  const cancelActivating = () => {
    setIsActivating(false);
    if (safetyState === SAFETY_STATES.SOS_ACTIVATING) {
      setSafetyState(SAFETY_STATES.SAFE);
    }
  };

  // Called after full 3-second hold finishes
  const triggerSOS = async () => {
    setIsActivating(false);
    setSafetyState(SAFETY_STATES.SOS_ACTIVE);

    try {
      const result = await sosService.triggerSOS();
      setActiveEmergency(result.event);
      setLastLocation(result.location);
      setDispatches(result.dispatches);

      // Start continuous location stream during active emergency
      locationService.startEmergencyTracking((loc) => {
        setLastLocation(loc);
      });

      return result;
    } catch (error) {
      console.error('Trigger SOS failed:', error);
      setSafetyState(SAFETY_STATES.FAILED);
      throw error;
    }
  };

  // Resolve emergency safely
  const resolveEmergency = async (resolutionNote = 'Resolved safely by user') => {
    if (activeEmergency?.id) {
      await sosService.resolveSOS(activeEmergency.id, resolutionNote);
    }
    locationService.stopEmergencyTracking();
    setActiveEmergency(null);
    setSafetyState(SAFETY_STATES.RESOLVED);

    // Return to calm SAFE state after 4 seconds
    setTimeout(() => {
      setSafetyState(SAFETY_STATES.SAFE);
    }, 4000);
  };

  return (
    <EmergencyContext.Provider
      value={{
        safetyState,
        activeEmergency,
        lastLocation,
        dispatches,
        isActivating,
        startActivating,
        cancelActivating,
        triggerSOS,
        resolveEmergency,
        refreshLocation,
        setSafetyState,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
export default EmergencyContext;
