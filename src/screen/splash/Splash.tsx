import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../../theme/color';
import { useAuth } from '../../context/AuthContext';
import { updateVendor } from '../../services/vendor.service';
import { RootStackParamList } from '../../types/types';
import {
  initNotificationListeners,
  isNotificationRedirectHandled,
  setupFirebaseMessaging,
} from './notification';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Splash = () => {
  const navigation = useNavigation<NavigationProps>();
  const { isAuthenticated, vendorId, token, setFcmToken, fcmToken } = useAuth();

  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  console.log({ isAuthenticated, vendorId, token });

  // Initialize notification click listeners (Foreground, Background, Cold Start)
  useEffect(() => {
    const cleanup = initNotificationListeners();
    return cleanup;
  }, []);

  // ------------------------------------------------------------
  // PERMISSION HANDLING
  // ------------------------------------------------------------

  const checkPermissions = async () => {
    const location = await checkLocationPermission();
    const notification = await checkNotificationPermission();

    if (location && notification) {
      return true;
    } else {
      setShowPermissionPopup(true);
      return false;
    }
  };

  const checkLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location error:', err);
      return false;
    }
  };

  const checkNotificationPermission = async () => {
    try {
      if (typeof Platform.Version === 'number' && Platform.Version < 33)
        return true;

      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'We need permission to send notifications.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Notification error:', err);
      return false;
    }
  };

  // ------------------------------------------------------------
  // NAVIGATION LOGIC
  // ------------------------------------------------------------

  const handleNavigationFlow = async () => {
    if (isNotificationRedirectHandled) {
      console.log('🔔 Skipping splash navigation reset because notification redirection occurred.');
      return;
    }

    const allowed = await checkPermissions();
    if (!allowed) return;

    if (isNotificationRedirectHandled) {
      return;
    }

    if (isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'BottomTab' }] });
      return;
    }

    if (vendorId && token && !isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await setupFirebaseMessaging(vendorId, fcmToken, setFcmToken, updateVendor);
      await handleNavigationFlow();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, vendorId, token]);

  // ------------------------------------------------------------
  // SETTINGS REDIRECT
  // ------------------------------------------------------------

  const handleOpenSettings = async () => {
    const location = await checkLocationPermission();
    const notification = await checkNotificationPermission();

    if (location && notification) {
      setShowPermissionPopup(false);
      await handleNavigationFlow();
    } else {
      await Linking.openSettings();
      setShowPermissionPopup(true);
    }
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Image
        source={require('../../assets/logo/LOGO.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Modal visible={showPermissionPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Permissions Required</Text>
            <Text style={styles.modalText}>
              Please enable both Location and Notification permissions.
            </Text>

            <TouchableOpacity
              style={styles.allowButton}
              onPress={handleOpenSettings}
            >
              <Text style={styles.allowText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: '70%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    padding: 25,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  allowButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  allowText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Splash;
