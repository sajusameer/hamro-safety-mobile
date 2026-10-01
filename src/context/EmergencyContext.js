// Hamro Safety - Global Emergency State Context
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAFETY_STATES } from '../constants/safetyStates';
import sosService from '../services/sosService';
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
  const [dispatches] = useState([]);
  const [isActivating, setIsActivating] = useState(false);

  // Check for active SOS event on component mount
  useEffect(() => {
    let isMounted = true;
    const checkActive = async () => {
      try {
        const existing = await sosService.getActiveSOSEvent();
        if (isMounted && existing) {
          setActiveEmergency(existing);
          setSafetyState(SAFETY_STATES.SOS_ACTIVE);
          locationService.startEmergencyTracking((loc) => {
            if (isMounted) setLastLocation(loc);
          });
        } else if (isMounted) {
          const loc = await locationService.getCurrentLocation();
          if (isMounted) setLastLocation(loc);
        }
      } catch (e) {
        console.warn('Check active SOS event failed:', e);
      }
    };
    checkActive();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshLocation = useCallback(async () => {
    const loc = await locationService.getCurrentLocation();
    setLastLocation(loc);
    return loc;
  }, []);

  // Called when user starts holding SOS button
  const startActivating = () => {
    setIsActivating(true);
    setSafetyState(SAFETY_STATES.SOS_ACTIVATING);
  };

  // Called if user releases before 3-second hold finishes
  const cancelActivating = () => {
    setIsActivating(false);
    if (safetyState === SAFETY_STATES.SOS_ACTIVATING) {
      setSafetyState(SAFETY_STATES.SAFE);
    }
  };

  // Trigger SOS event after 3-second hold
  const triggerSOS = async () => {
    setIsActivating(false);
    try {
      const loc = await locationService.getCurrentLocation();
      setLastLocation(loc);

      const event = await sosService.triggerSOS({
        latitude: loc.latitude,
        longitude: loc.longitude,
        batteryLevel: loc.batteryPercentage || null,
      });

      setActiveEmergency(event);
      setSafetyState(SAFETY_STATES.SOS_ACTIVE);

      locationService.startEmergencyTracking((newLoc) => {
        setLastLocation(newLoc);
      });

      return event;
    } catch (error) {
      console.error('Trigger SOS failed:', error);
      setSafetyState(SAFETY_STATES.FAILED);
      throw error;
    }
  };

  // Resolve emergency safely ("I'm Safe" confirmed)
  const resolveEmergency = async (eventId) => {
    const targetId = eventId || activeEmergency?.id;
    if (targetId) {
      try {
        await sosService.resolveSOS(targetId);
      } catch (e) {
        console.warn('Resolve SOS error in context:', e);
      }
    }
    locationService.stopEmergencyTracking();
    setActiveEmergency(null);
    setSafetyState(SAFETY_STATES.RESOLVED);

    setTimeout(() => {
      setSafetyState(SAFETY_STATES.SAFE);
    }, 3000);
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
