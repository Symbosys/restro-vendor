import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import { navigationRef } from '../../helpers/navigationService';

export let isNotificationRedirectHandled = false;

export const displayForegroundNotification = async (remoteMessage: any) => {
  try {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    const title =
      remoteMessage.notification?.title ||
      (remoteMessage.data?.title as string) ||
      'New Order Request';

    const body =
      remoteMessage.notification?.body ||
      (remoteMessage.data?.body as string) ||
      'New order notification received';

    await notifee.displayNotification({
      title,
      body,
      data: remoteMessage.data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });
  } catch (err) {
    console.error('🔥 Error displaying foreground notification:', err);
  }
};

export const handleNotificationNavigation = (data?: Record<string, any>) => {
  if (!data) return;
  const rawOrderId = data.orderId || data.order_id;
  if (!rawOrderId) return;

  const orderId = String(rawOrderId);
  console.log('🔔 [Notification] Redirecting to OrderDetails for orderId:', orderId);
  isNotificationRedirectHandled = true;

  const doNavigate = () => {
    if (!navigationRef.isReady()) return false;

    try {
      const currentRoute = navigationRef.getCurrentRoute();
      console.log('🔔 [Notification] Current route name:', currentRoute?.name);

      // If app is currently on Splash or cold started, replace Splash with [BottomTab, OrderDetails]
      if (currentRoute?.name === 'Splash' || currentRoute?.name === undefined) {
        navigationRef.reset({
          index: 1,
          routes: [
            { name: 'BottomTab' },
            { name: 'OrderDetails', params: { orderId } },
          ],
        });
      } else {
        // App is already open and on a screen -> navigate directly onto current stack
        navigationRef.navigate('OrderDetails', { orderId });
      }
      return true;
    } catch (err) {
      console.error('🔔 [Notification] Navigation error, resetting stack:', err);
      navigationRef.reset({
        index: 1,
        routes: [
          { name: 'BottomTab' },
          { name: 'OrderDetails', params: { orderId } },
        ],
      });
      return true;
    }
  };

  if (navigationRef.isReady()) {
    doNavigate();
  }

  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const success = doNavigate();
    if (success || attempts > 20) {
      clearInterval(interval);
    }
  }, 300);
};

// ----------------------------------------------------------------------
// NOTIFEE BACKGROUND EVENT HANDLER (Must run top-level)
// ----------------------------------------------------------------------
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('🔔 Notifee Background Event:', type, detail);
  if (
    (type === EventType.PRESS || type === EventType.ACTION_PRESS) &&
    detail.notification?.data
  ) {
    handleNotificationNavigation(detail.notification.data);
  }
});

// ----------------------------------------------------------------------
// FCM BACKGROUND MESSAGE HANDLER (Must run top-level)
// ----------------------------------------------------------------------
try {
  const app = getApp();
  const messagingInstance = getMessaging(app);
  setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
    console.log('📩 Notification Payload (Background/Killed):', remoteMessage);
    await displayForegroundNotification(remoteMessage);
  });
} catch (e) {
  // Ignored if firebase not ready at import time
}

// ----------------------------------------------------------------------
// INITIALIZE ACTIVE LISTENERS (Foreground, Background, Cold Start)
// ----------------------------------------------------------------------
export const initNotificationListeners = () => {
  // Create channel immediately
  notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  // 1. Notifee Foreground Event Listener
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    console.log('🔔 Notifee Foreground Event:', type, detail);
    if (
      (type === EventType.PRESS || type === EventType.ACTION_PRESS) &&
      detail.notification?.data
    ) {
      handleNotificationNavigation(detail.notification.data);
    }
  });

  // 2. FCM Foreground Message Listener (Active when app is OPEN)
  let unsubscribeFcmOnMessage: (() => void) | undefined;
  try {
    const app = getApp();
    const messagingInstance = getMessaging(app);

    unsubscribeFcmOnMessage = onMessage(messagingInstance, async (remoteMessage) => {
      console.log('📩 FCM Foreground Message received while app is OPEN:', remoteMessage);
      await displayForegroundNotification(remoteMessage);
    });

    onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      console.log('🔔 FCM Notification opened app from background:', remoteMessage);
      if (remoteMessage?.data) {
        handleNotificationNavigation(remoteMessage.data);
      }
    });

    getInitialNotification(messagingInstance).then((remoteMessage) => {
      if (remoteMessage?.data) {
        console.log('🔔 FCM Notification opened app from quit state:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      }
    });
  } catch (err) {
    console.error('Error setting up FCM foreground/click listeners:', err);
  }

  // 3. Notifee Initial Notification (Cold Start Launch)
  notifee.getInitialNotification().then((initialNotification) => {
    if (initialNotification?.notification?.data) {
      console.log('🔔 Notifee Initial Notification:', initialNotification);
      handleNotificationNavigation(initialNotification.notification.data);
    }
  });

  return () => {
    unsubscribeNotifee();
    if (unsubscribeFcmOnMessage) {
      unsubscribeFcmOnMessage();
    }
  };
};

// ----------------------------------------------------------------------
// SETUP FIREBASE MESSAGING & PERMISSIONS
// ----------------------------------------------------------------------
export const setupFirebaseMessaging = async (
  vendorId?: string | null,
  fcmToken?: string | null,
  setFcmToken?: (token: string) => Promise<void> | void,
  updateVendorFn?: (id: string, data: any) => Promise<any>
) => {
  try {
    const app = getApp();
    const messagingInstance = getMessaging(app);

    const authStatus = await requestPermission(messagingInstance);
    console.log('🔐 FCM permission:', authStatus);

    const freshFcmToken = await getToken(messagingInstance);
    console.log('🔔 FCM Token:', freshFcmToken);

    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    if (freshFcmToken && (!fcmToken || fcmToken !== freshFcmToken)) {
      if (vendorId && updateVendorFn && setFcmToken) {
        try {
          await updateVendorFn(vendorId, { fcmToken: freshFcmToken });
          await setFcmToken(freshFcmToken);
          console.log('✅ New FCM token saved to DB and AuthContext');
        } catch (err) {
          console.error('❌ Failed to save initial FCM token to DB:', err);
        }
      }
    }

    onTokenRefresh(messagingInstance, async (refreshedToken) => {
      console.log('🔄 FCM Token Refreshed:', refreshedToken);
      if (refreshedToken && (!fcmToken || fcmToken !== refreshedToken)) {
        if (vendorId && updateVendorFn && setFcmToken) {
          try {
            await updateVendorFn(vendorId, { fcmToken: refreshedToken });
            await setFcmToken(refreshedToken);
            console.log('✅ Refreshed FCM token saved to DB and AuthContext');
          } catch (err) {
            console.error('❌ Failed to save refreshed FCM token to DB:', err);
          }
        }
      }
    });
  } catch (err) {
    console.error('🔥 FCM setup failed:', err);
  }
};
