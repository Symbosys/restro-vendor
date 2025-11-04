import notifee, { AndroidImportance } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, onMessage, requestPermission, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
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
import { useAuth } from '../../context/AuthContext';
import { updateVendor } from '../../services/vendor.service';
import { RootStackParamList } from '../../types/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Splash = () => {
  const navigation = useNavigation<NavigationProps>();
  const { isAuthenticated, vendorId, token } = useAuth();

  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  // ✅ Check both permissions
  const checkPermissions = async () => {
    const locationGranted = await checkLocationPermission();
    const notificationGranted = await checkNotificationPermission();

    if (locationGranted && notificationGranted) {
      return true;
    } else {
      setShowPermissionPopup(true);
      return false;
    }
  };

  // 📍 LOCATION permission check
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
      console.warn('Location permission error:', err);
      return false;
    }
  };

  // 🔔 NOTIFICATION permission check (Android 13+)
  const checkNotificationPermission = async () => {
    try {
      if (typeof Platform.Version === 'number' && Platform.Version < 33) return true; // auto-granted before Android 13

      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'We need permission to send you notifications.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return false;
    }
  };

  // 🚀 Navigation logic
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!isAuthenticated || !vendorId || !token) {
        navigation.navigate('Login');
      } else {
        const allowed = await checkPermissions();
        if (allowed) {
          await setupFirebaseMessaging();
          navigation.navigate('BottomTab');
        }
      }
    }, 2000);

    const app = getApp();
    const messagingInstance = getMessaging(app);

    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      console.log('📩 Foreground FCM (modular):', remoteMessage);
    });

    return unsubscribe;
  }, [isAuthenticated, vendorId, token]);


  // ⚙️ Open App Settings when user taps "Allow Permissions"
  const handleOpenSettings = async () => {
    const locationGranted = await checkLocationPermission();
    const notificationGranted = await checkNotificationPermission();

    if (locationGranted && notificationGranted) {
      setShowPermissionPopup(false);
      navigation.navigate('BottomTab');
    } else {
      setShowPermissionPopup(false);
      await Linking.openSettings();
      setShowPermissionPopup(true);
    }
  };

  // 🔥 Firebase FCM setup
  // 🔥 Firebase FCM setup (v22+ modular syntax)
  const setupFirebaseMessaging = async () => {
    try {
      const app = getApp(); // Get your default Firebase app
      const messagingInstance = getMessaging(app);

      // 🔐 Request permission
      const authStatus = await requestPermission(messagingInstance);
      console.log('🔐 FCM permission status:', authStatus);

      // ✅ Get FCM token (modular API)
      const fcmToken = await getToken(messagingInstance);
      console.log('✅ FCM Token:', fcmToken);

      // 🔔 Setup Notifee channel
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      // Optionally send token to backend
      if(vendorId) await updateVendor(vendorId, { fcmToken });

      // 📩 Foreground listener
      onMessage(messagingInstance, async (remoteMessage) => {
        console.log('📩 Foreground FCM:', remoteMessage);

        // Show a Notifee notification
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || '',
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
        });
      });

      // 📬 Background listener (killed/background state)
      setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
        console.log('📬 Background FCM:', remoteMessage);
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || '',
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
        });
      });

    } catch (err) {
      console.error('🔥 FCM setup error:', err);
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Splash Logo */}
      <Image
        source={require('../../assets/logo/LOGO.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* 🚨 Custom Popup */}
      <Modal visible={showPermissionPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Permissions Required</Text>
            <Text style={styles.modalText}>
              Please enable both Location and Notification permissions to
              continue using the app.
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

// 💅 Styles
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
