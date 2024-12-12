import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number;
  longitude: number;
  error: string | null;
  isLoading: boolean;
  isDefault: boolean;
  source: 'gps' | 'ip' | 'default';
  debug?: string;
}

const DEFAULT_LOCATION = {
  latitude: 52.2297,
  longitude: 21.0122
};

const getStoredLocation = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('lastKnownLocation');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.latitude && parsed.longitude) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const useGeolocation = () => {
  const storedLocation = getStoredLocation();
  const [state, setState] = useState<GeolocationState>({
    ...(storedLocation || DEFAULT_LOCATION),
    error: null,
    isLoading: !storedLocation,
    isDefault: !storedLocation,
    source: storedLocation ? 'ip' : 'default'
  });

  useEffect(() => {
    let mounted = true;

    const getIpBasedLocation = async () => {
      try {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) throw new Error('IP API error');
        const data = await response.json();
        
        if (!data.success) throw new Error('IP data not available');

        return {
          latitude: data.latitude,
          longitude: data.longitude
        };
      } catch (error: unknown) {
        console.error('IP location error:', error);
        try {
          const backupResponse = await fetch('https://ip-api.com/json/?fields=lat,lon,status');
          const backupData = await backupResponse.json();
          
          if (backupData.status === 'success') {
            return {
              latitude: backupData.lat,
              longitude: backupData.lon
            };
          }
        } catch (backupError) {
          console.error('Backup IP location error:', backupError);
        }
        return null;
      }
    };

    const getGPSLocation = () => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolokalizacja nie jest wspierana'));
          return;
        }

        if (navigator.permissions) {
          navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            if (permissionStatus.state === 'denied') {
              reject(new Error('Dostęp do lokalizacji jest zablokowany w przeglądarce'));
              return;
            }
          });
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });
    };

    const initLocation = async () => {
      if (!state.isDefault) return;

      try {
        const gpsPosition = await getGPSLocation();
        
        if (mounted) {
          const newLocation = {
            latitude: gpsPosition.coords.latitude,
            longitude: gpsPosition.coords.longitude,
          };
          
          localStorage.setItem('lastKnownLocation', JSON.stringify(newLocation));
          
          setState({
            ...newLocation,
            error: null,
            isLoading: false,
            isDefault: false,
            source: 'gps',
          });
        }
      } catch (gpsError) {
        console.error('GPS error:', gpsError);
        try {
          const ipLocation = await getIpBasedLocation();
          
          if (mounted && ipLocation) {
            localStorage.setItem('lastKnownLocation', JSON.stringify(ipLocation));
            
            setState({
              ...ipLocation,
              error: gpsError instanceof Error ? gpsError.message : 'GPS niedostępny',
              isLoading: false,
              isDefault: false,
              source: 'ip'
            });
          }
        } catch {
          if (mounted) {
            setState(prev => ({
              ...prev,
              error: 'Nie udało się ustalić lokalizacji GPS ani IP',
              isLoading: false
            }));
          }
        }
      }
    };

    initLocation();

    return () => {
      mounted = false;
    };
  }, [state.isDefault]);

  return state;
};