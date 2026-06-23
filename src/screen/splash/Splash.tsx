import notifee, { AndroidImportance } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { updateVendor } from '../../services/vendor.service';
import { RootStackParamList } from '../../types/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Splash = () => {
  const navigation = useNavigation<NavigationProps>();
  const { isAuthenticated, vendorId, token, setFcmToken } = useAuth();

  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  console.log({ isAuthenticated, vendorId, token });

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
    const allowed = await checkPermissions();
    if (!allowed) return;

    // -----------------------------------
    // PERMISSIONS GRANTED → Now authenticate
    // -----------------------------------

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
      await setupFirebaseMessaging();
      await handleNavigationFlow();
    }, 2000);

    const app = getApp();
    const messagingInstance = getMessaging(app);

    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      console.log('📩 Foreground FCM:', remoteMessage);
    });

    return unsubscribe;
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
  // FIREBASE FCM SETUP
  // ------------------------------------------------------------

  const setupFirebaseMessaging = async () => {
    try {
      const app = getApp();
      const messagingInstance = getMessaging(app);

      const authStatus = await requestPermission(messagingInstance);
      console.log('🔐 FCM permission:', authStatus);

      const fcmToken = await getToken(messagingInstance);
      console.log('🔔 FCM Token:', fcmToken);

      await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
      });

      const storedToken = await AsyncStorage.getItem('vendorFcmToken');
      if (fcmToken && fcmToken !== storedToken) {
        if (vendorId) {
          try {
            await updateVendor(vendorId, { fcmToken });
            await setFcmToken(fcmToken);
            console.log('✅ New FCM token saved to DB and AsyncStorage');
          } catch (err) {
            console.error('❌ Failed to save initial FCM token to DB:', err);
          }
        }
      }

      onTokenRefresh(messagingInstance, async (refreshedToken) => {
        console.log('🔄 FCM Token Refreshed:', refreshedToken);
        const latestStoredToken = await AsyncStorage.getItem('vendorFcmToken');
        if (refreshedToken && refreshedToken !== latestStoredToken) {
          if (vendorId) {
            try {
              await updateVendor(vendorId, { fcmToken: refreshedToken });
              await setFcmToken(refreshedToken);
              console.log('✅ Refreshed FCM token saved to DB and AsyncStorage');
            } catch (err) {
              console.error('❌ Failed to save refreshed FCM token to DB:', err);
            }
          }
        }
      });

      onMessage(messagingInstance, async (remoteMessage) => {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || '',
          android: { channelId: 'default', pressAction: { id: 'default' } },
        });
      });

      setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || '',
          android: { channelId: 'default', pressAction: { id: 'default' } },
        });
      });

    } catch (err) {
      console.error('🔥 FCM setup failed:', err);
    }
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <View style={styles.container}>
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#fff',
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
    color: '#222',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  allowButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  allowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Splash;
