import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  permissionStatus: Location.PermissionStatus | null;
  requestPermission: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    checkPermission();
    return () => { if (subscription) subscription.remove(); };
  }, []);

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(status);
    if (status === Location.PermissionStatus.GRANTED) {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (e) {
        console.warn('getCurrentPositionAsync on start failed:', e);
        setLocation({
          coords: { latitude: -5.194, longitude: -80.632, accuracy: null, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: Date.now(),
        } as any);
      }
    } else if (status === Location.PermissionStatus.DENIED) {
      // Initialize with default fallback coordinates if already denied
      setLocation({
        coords: { latitude: -5.194, longitude: -80.632, accuracy: null, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
        timestamp: Date.now(),
      } as any);
    }
  };

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    if (status === Location.PermissionStatus.GRANTED) {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (e) {
        console.warn('Location.getCurrentPositionAsync failed, using fallback:', e);
        setLocation({
          coords: {
            latitude: -5.194,
            longitude: -80.632,
            accuracy: null,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as any);
      }
    } else {
      setErrorMsg('Permiso de ubicación denegado');
      // Set default fallback so user isn't stuck on a spinner if permission is denied
      setLocation({
        coords: {
          latitude: -5.194,
          longitude: -80.632,
          accuracy: null,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);
    }
  };

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      setErrorMsg('Permiso de ubicación denegado');
      return;
    }

    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50, timeInterval: 30000 },
      (newLocation) => setLocation(newLocation)
    );
    setSubscription(sub);
  };

  const stopTracking = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  return (
    <LocationContext.Provider value={{ location, errorMsg, permissionStatus, requestPermission, startTracking, stopTracking }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocationContext must be used within LocationProvider');
  return context;
}
