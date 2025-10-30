import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';

/**
 * Check location permission
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted;
  } catch (err) {
    console.warn('Error checking location permission:', err);
    return false;
  }
};

/**
 * Request location permission
 */
export const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Permission Denied',
        'Location permission is permanently denied. Please enable it in settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      );
      return false;
    } else {
      Alert.alert(
        'Permission Denied',
        'You need to allow location to use this feature.',
      );
      return false;
    }
  } catch (err) {
    console.warn('Error requesting location permission:', err);
    return false;
  }
};

/**
 * Turn on location (Android only)
 */
export const turnOnLocation = async () => {
  if (Platform.OS === 'android') {
    try {
      const enabled = await isLocationEnabled();
      console.log('Location enabled:', enabled);

      if (enabled) {
        return;
      }

      const enableResult = await promptForEnableLocationIfNeeded();
      console.log('Enable result:', enableResult);
    } catch (error: any) {
      if (error?.message?.includes('ERR00')) {
        ToastAndroid.show('GPS enabling cancelled ❌', ToastAndroid.LONG);
      } else {
        ToastAndroid.show('Failed to enable GPS ❌', ToastAndroid.LONG);
        console.error('turnOnLocation error:', error);
      }
      return false;
    }
  }
};

/**
 * Get the current location (latitude, longitude)
 */
export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    let watchId: number | null = null;
    let timeoutId: any;

    const cleanup = () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
        watchId = null;
      }
      clearTimeout(timeoutId);
    };

    const requestLocation = (enableHighAccuracy: boolean) => {
      watchId = Geolocation.watchPosition(
        position => {
          cleanup();
          const {latitude, longitude} = position.coords;
          resolve({latitude, longitude});
        },
        error => {
          cleanup();
          // Retry once with high accuracy if it failed the first time
          if (!enableHighAccuracy) {
            console.log('Retrying with high accuracy...');
            requestLocation(true);
          } else {
            console.log('Location error:', error);
            reject(error);
          }
        },
        {
          enableHighAccuracy,
          distanceFilter: 0,
          timeout: 20000, // 20s
          maximumAge: 5000, // allow cache up to 5s old
        },
      );

      // Fallback if no response within 25s
      timeoutId = setTimeout(() => {
        cleanup();
        reject({code: 3, message: 'Location request timed out'});
      }, 25000);
    };

    requestLocation(false);
  });
};

export const getAddressFromCoords = async (lat: number, lng: number) => {
  const apiKey = 'AIzaSyDp1m24jCv0artNLvNYGiRemEEjwAduk20';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results[0]) {
      console.log('API response:', data);
      return data.results[0].formatted_address;
    }
  } catch (error) {
    console.error('Error fetching address:', error);
  }
  return 'Unknown Address';
};
