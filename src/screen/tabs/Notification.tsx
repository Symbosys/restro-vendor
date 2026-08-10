import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useMarkNotificationRead, useNotification } from '../../hooks/useNotification';
import { COLORS } from '../../theme/color';
import { NotificationItem, NotificationType } from '../../types/notification.type';

interface NotificationItemProps {
  icon: string;
  iconColor: string;
  title: string;
  note: string;
  time: string;
  isUnread: boolean;
  onPress?: () => void;
}

const NotificationItems: React.FC<NotificationItemProps> = ({ icon, iconColor, title, note, time, isUnread, onPress }) => {
  return (
    <TouchableOpacity style={[styles.notificationItem, isUnread && styles.unreadItem]} onPress={onPress}>
      {isUnread && <View style={styles.unreadDot} />}
      <View style={styles.notificationContent}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          <Icon name={icon as any} size={24} color={COLORS.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.note} numberOfLines={2}>{note}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface Notification {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  note: string;
  time: string;
  isUnread: boolean;
  type: 'All' | 'Orders' | 'Payments' | 'System';
  data?: Record<string, any>;
  deepLink?: string;
}

const getCategory = (apiType: string): Notification['type'] => {
  const type = apiType as NotificationType;
  if (['NEW_ORDER', 'ORDER_STATUS_UPDATE', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'DELIVERY_ASSIGNMENT', 'VENDOR_ORDER_REQUEST', 'DELIVERY_ORDER_REQUEST', 'ORDER_REJECTED'].includes(type)) {
    return 'Orders';
  }
  if (['PAYMENT_RECEIVED', 'PAYOUT_PROCESSED'].includes(type)) {
    return 'Payments';
  }
  return 'System';
};

const getIcon = (category: Notification['type']): string => {
  switch (category) {
    case 'Orders': return 'shopping-cart';
    case 'Payments': return 'payments';
    case 'System': return 'priority-high';
    default: return 'notifications';
  }
};

const getColor = (category: Notification['type']): string => {
  switch (category) {
    case 'Orders': return '#8719C6';
    case 'Payments': return '#16a34a';
    case 'System': return '#ff9fa3';
    default: return '#3b82f6';
  }
};

const extractOrderId = (notification: Notification): string | undefined => {
  if (notification.data?.orderId) {
    return String(notification.data.orderId);
  }
  if (notification.data?.id) {
    return String(notification.data.id);
  }
  if (notification.deepLink) {
    const match = notification.deepLink.match(/order\/([^\/]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return undefined;
};

interface NotificationModalProps {
  notification: Notification;
  visible: boolean;
  onClose: () => void;
  onViewDetails?: (orderId: string) => void;
}

const NotificationDetailModal: React.FC<NotificationModalProps> = ({ notification, visible, onClose, onViewDetails }) => {
  const orderId = extractOrderId(notification);
  const showViewDetails = !!orderId || !!notification.deepLink;

  const handleDeepLink = () => {
    onClose();
    if (orderId && onViewDetails) {
      onViewDetails(orderId);
    }
  };

  if (!visible) return null;

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'Orders': return '#8719C6';
      case 'Payments': return '#16a34a';
      case 'System': return '#ff9fa3';
      default: return COLORS.primary;
    }
  };

  const formattedKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { backgroundColor: notification.iconColor }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalBodyContent}>
              <View style={[styles.iconCircleLarge, { backgroundColor: notification.iconColor }]}>
                <Icon name={notification.icon as any} size={40} color={COLORS.white} />
              </View>
              <Text style={styles.modalTitle}>{notification.title}</Text>
              <Text style={styles.modalBodyText}>{notification.note}</Text>
              <View style={styles.infoRow}>
                <View style={styles.timeContainer}>
                  <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.modalTime}>{notification.time}</Text>
                </View>
                <View style={[styles.typeContainer, { backgroundColor: getTypeColor(notification.type) + '10' }]}>
                  <Text style={[styles.modalType, { color: getTypeColor(notification.type) }]}>{notification.type}</Text>
                </View>
              </View>
              {notification.data && Object.keys(notification.data).length > 0 && (
                <View style={styles.dataSection}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  {Object.entries(notification.data).map(([key, value]) => (
                    <View key={key} style={styles.dataItem}>
                      <Text style={styles.dataKey}>{formattedKey(key)}</Text>
                      <Text style={styles.dataValue}>
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {showViewDetails && (
                <TouchableOpacity style={[styles.deepLinkButton, { backgroundColor: notification.iconColor }]} onPress={handleDeepLink}>
                  <Text style={styles.deepLinkText}>View Details</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const NotificationsScreen: React.FC<any> = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = React.useState<'All' | 'Orders' | 'Payments' | 'System'>('All');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);

  const { vendorId, isAuthenticated } = useAuth();
  const markReadMutation = useMarkNotificationRead();

  const handleViewOrderDetails = (orderId: string) => {
    if (orderId && navigation?.navigate) {
      navigation.navigate('OrderDetails', { orderId });
    }
  };

  const {
    data: queryData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useNotification({
    recipientId: vendorId || "",
    recipientType: "VENDOR",
  }, { enabled: isAuthenticated });

  const notificationsFromApi = React.useMemo(() =>
    queryData?.pages?.flatMap(page => page.data.notifications) || [],
    [queryData]
  );

  const notifications: Notification[] = React.useMemo(() => {
    return notificationsFromApi.map((item: NotificationItem) => {
      const category = getCategory(item.type);
      return {
        id: String(item.id),
        icon: getIcon(category),
        iconColor: getColor(category),
        title: item.title,
        note: item.body,
        time: formatDistanceToNow(new Date(item.sentAt), { addSuffix: true }),
        isUnread: !item.isRead,
        type: category,
        data: item.data,
        deepLink: item.deepLink,
      } as Notification;
    });
  }, [notificationsFromApi]);

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notif) =>
      selectedFilter === 'All' || notif.type === selectedFilter
    );
  }, [notifications, selectedFilter]);

  const handleNotificationPress = (notification: Notification) => {
    if (notification.isUnread) {
      markReadMutation.mutate(notification.id);
    }
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Icon name="notifications-none" size={64} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>No Notifications Yet</Text>
        <Text style={styles.emptySubtitle}>You're all caught up! Stay tuned for exciting updates on your orders, payments, and more.</Text>
      </View>
    );
  };

  const renderFooterComponent = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const tabs = [
    { value: 'All' as const, label: 'All' },
    { value: 'Orders' as const, label: 'Orders' },
    { value: 'Payments' as const, label: 'Payments' },
    { value: 'System' as const, label: 'System' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.filterTab,
                selectedFilter === tab.value && styles.activeTab,
              ]}
              onPress={() => setSelectedFilter(tab.value)}
            >
              <Text style={[
                styles.tabText,
                selectedFilter === tab.value && styles.activeTabText,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={({ item: notification }) => (
          <NotificationItems
            {...notification}
            onPress={() => handleNotificationPress(notification)}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.mainContent, { paddingBottom: 100 }]}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooterComponent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        removeClippedSubviews={true}
      />
      {modalVisible && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedNotification(null);
          }}
          onViewDetails={handleViewOrderDetails}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(247, 246, 248, 0.8)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterBar: {
    backgroundColor: 'rgba(247, 246, 248, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterContent: {
    height: 40,
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    minWidth: 80,
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  unreadItem: {
    backgroundColor: '#f0e7f5',
  },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(135, 25, 198, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 32,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 24,
    maxWidth: '85%',
  },
  // NEW: Styles for loading footer
  loadingFooter: {
    paddingVertical: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  // Modal Styles (unchanged)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '75%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  iconCircleLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalTime: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  typeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalType: {
    fontSize: 12,
    fontWeight: '600',
  },
  dataSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  dataKey: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'right',
    flex: 1,
  },
  deepLinkButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  deepLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default NotificationsScreen;