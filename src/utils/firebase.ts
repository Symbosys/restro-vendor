import notifee, { AndroidImportance } from '@notifee/react-native';

export async function displayNotification(remoteMessage: any) {
  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? 'New Message',
    body: remoteMessage.notification?.body ?? '',
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
    },
  });
}
