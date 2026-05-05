import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { VendorBroadcastItem, BroadcastStatus, OrderStatus, VendorBroadcastFilter } from '../../types/order.types';
import { useAuth } from '../../context/AuthContext';
import { useVendorBroadcastedOrders } from '../../api/hooks/order';
import { parseToDecimal } from '../../utils/utils';
import { AcceptOrderButton, RejectOrderButton } from '../../components/orers/order.action';

const { width } = Dimensions.get('window');

// Map display label → OrderStatus (for modal filter)
const orderStatusMap: { [key: string]: OrderStatus } = {
  Preparing: OrderStatus.PREPARING,
  'Ready for Pickup': OrderStatus.READY_FOR_PICKUP,
  Delivered: OrderStatus.DELIVERED,
  Cancelled: OrderStatus.CANCELLED,
};

// Map BroadcastStatus → display label (for top chips)
const broadcastStatusLabels: { [key in BroadcastStatus]: string } = {
  [BroadcastStatus.PENDING]: 'Pending',
  [BroadcastStatus.ACCEPTED]: 'Accepted',
  [BroadcastStatus.REJECTED]: 'Rejected',
  [BroadcastStatus.MISSED]: 'Missed',
};

// For display in cards
const getDisplayStatus = (broadcastStatus: BroadcastStatus, orderStatus?: OrderStatus) => {
  if (broadcastStatus !== BroadcastStatus.ACCEPTED) {
    return broadcastStatusLabels[broadcastStatus];
  }
  switch (orderStatus) {
    case OrderStatus.VENDOR_ACCEPTED:
      return 'Accepted';
    case OrderStatus.PREPARING:
      return 'Preparing';
    case OrderStatus.READY_FOR_PICKUP:
      return 'Ready for Pickup';
    case OrderStatus.DELIVERY_PENDING:
      return 'Delivery Pending';
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'Out for Delivery';
    case OrderStatus.DELIVERED:
      return 'Delivered';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    case OrderStatus.REFUNDED:
      return 'Refunded';
    case OrderStatus.DISPUTED:
      return 'Disputed';
    default:
      return 'Accepted';
  }
};


interface MappedOrder {
  id: string;
  time: string;
  customer: string;
  items: number;
  amount: string;
  status: string;
  payment: string;
  createdAt: string;
  orderId: string;
  broadcastId: string;
  isPending: boolean;
  isMarkReady: boolean;
  fullOrder: VendorBroadcastItem['order'];
}

const MyOrdersScreen = ({ navigation }: AppNavigation) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Top header: Filter by Broadcast Status
  const [selectedBroadcastStatus, setSelectedBroadcastStatus] = useState<BroadcastStatus | ''>('');

  // Modal: Filter by Order Status
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus | ''>('');

  const [dateRange, setDateRange] = useState<'Today' | 'Last 7 Days' | 'All Time' | 'Custom'>('All Time');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDateValue, setStartDateValue] = useState(new Date());
  const [endDateValue, setEndDateValue] = useState(new Date());

  const broadcastStatusOptions = Object.entries(broadcastStatusLabels).map(([value, label]) => ({
    value: value as BroadcastStatus,
    label,
  }));

  const orderStatusOptions = ['Preparing', 'Ready for Pickup', 'Delivered', 'Cancelled'];

  const queryParams = useMemo(() => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    if (dateRange === 'Custom') {
      startDate = startDateValue.toISOString();
      endDate = endDateValue.toISOString();
    } else if (dateRange === 'Today') {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      startDate = todayStart.toISOString();
      endDate = now.toISOString();
    } else if (dateRange === 'Last 7 Days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      startDate = sevenDaysAgo.toISOString();
      endDate = now.toISOString();
    }

    const params: VendorBroadcastFilter = { limit: 10 };

    if (selectedBroadcastStatus) {
      params.broadcastStatus = selectedBroadcastStatus;
    }
    if (selectedOrderStatus) {
      params.orderStatus = selectedOrderStatus;
    }
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return params;
  }, [
    selectedBroadcastStatus,
    selectedOrderStatus,
    dateRange,
    startDateValue,
    endDateValue,
  ]);

  const { isAuthenticated } = useAuth();

  const {
    data: queryData,
    error,
    isError,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useVendorBroadcastedOrders(queryParams);

  const ordersFromApi = useMemo(
    () =>
      queryData?.pages?.flatMap((page) =>
        page.data.broadcasts?.map((broadcast: VendorBroadcastItem) => ({
          id: broadcast.order.orderNumber,
          time: new Date(broadcast.notifiedAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          customer: broadcast.order.address?.receiverName || 'Guest Customer',
          items: broadcast.order.items.length,
          amount: `₹${(parseToDecimal(broadcast.order.paidAmount) || parseToDecimal(broadcast.order.subtotal)).toFixed(2)}`,
          status: getDisplayStatus(broadcast.status, broadcast.order.status),
          payment: broadcast.order.paymentMethod === 'COD' ? 'COD' : 'PREPAID',
          createdAt: broadcast.order.timestamps?.placedAt || broadcast.notifiedAt,
          orderId: broadcast.order.id,
          broadcastId: broadcast.id,
          isPending: broadcast.status === BroadcastStatus.PENDING,
          isMarkReady:
            broadcast.status === BroadcastStatus.ACCEPTED &&
            broadcast.order.status === OrderStatus.VENDOR_ACCEPTED,
          fullOrder: broadcast.order,
        }))
      ) || [],
    [queryData]
  );

  const mappedOrders: MappedOrder[] = useMemo(() => ordersFromApi, [ordersFromApi]);

  const handleBroadcastChipPress = useCallback((status: BroadcastStatus | 'All') => {
    setSelectedBroadcastStatus(status === 'All' ? '' : status);
  }, []);

  const isBroadcastChipActive = useCallback(
    (status: BroadcastStatus | 'All') => {
      if (status === 'All') return selectedBroadcastStatus === '';
      return selectedBroadcastStatus === status;
    },
    [selectedBroadcastStatus]
  );

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedOrderStatus('');
    setDateRange('All Time');
  }, []);

  const handleApplyFilter = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleOrderStatusSelect = useCallback((statusLabel: string) => {
    setSelectedOrderStatus(orderStatusMap[statusLabel] || '');
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedBroadcastStatus('');
    setSelectedOrderStatus('');
    setDateRange('All Time');
  }, []);

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const acceptOrder = useCallback(
    async (orderId: string) => {
      try {
        await api.post(`/vendor/order/accept-order/${orderId}`, { action: 'accept' });
        Alert.alert('Success', 'Order accepted');
        refetch();
      } catch (error) {
        Alert.alert('Error', 'Failed to accept order');
      }
    },
    [refetch]
  );

  const rejectOrder = useCallback(
    async (orderId: string) => {
      try {
        await api.post(`/vendor/order/accept-order/${orderId}`, { action: 'reject' });
        Alert.alert('Success', 'Order rejected');
        refetch();
      } catch (error) {
        Alert.alert('Error', 'Failed to reject order');
      }
    },
    [refetch]
  );

  const markReady = useCallback(
    async (orderId: string) => {
      try {
        await api.post(`/vendor/order/mark-ready/${orderId}`);
        Alert.alert('Success', 'Order marked ready');
        refetch();
      } catch (error) {
        Alert.alert('Error', 'Failed to mark ready');
      }
    },
    [refetch]
  );

  const handleViewDetails = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetails', { orderId });
    },
    [navigation]
  );

  const isRejectedStatus = useCallback(
    (status: string) => ['Rejected', 'Missed', 'Cancelled'].includes(status),
    []
  );

  const getStatusTheme = useCallback((status: string) => {
    switch (status) {
      case 'Pending':
        return { color: '#3b82f6', bgColor: '#eff6ff' };
      case 'Accepted':
        return { color: COLORS.primary, bgColor: '#f5eeff' };
      case 'Delivered':
      case 'Ready for Pickup':
        return { color: '#10b981', bgColor: '#ecfdf5' };
      case 'Rejected':
      case 'Missed':
      case 'Cancelled':
        return { color: '#ef4444', bgColor: '#fef2f2' };
      case 'Preparing':
        return { color: '#f59e0b', bgColor: '#fffbeb' };
      default:
        return { color: '#64748b', bgColor: '#f1f5f9' };
    }
  }, []);

  const isFiltered = selectedBroadcastStatus || selectedOrderStatus || dateRange !== 'All Time';
  const emptyMessage = isFiltered ? 'No Orders Match Your Filters' : 'No Orders Yet';
  const emptySubtitle = isFiltered
    ? "Try adjusting your filters to find what you're looking for."
    : 'Your orders will appear here once you receive some. Stay tuned!';

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
          <MaterialIcons name="receipt-long" size={64} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>{emptyMessage}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
        {isFiltered && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooterComponent = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  };

  const renderOrderItem = useCallback(
    ({ item }: { item: MappedOrder }) => {
      const itemsPreview = item.fullOrder.items.slice(0, 2);
      const moreItems = item.fullOrder.items.length > 2 ? `+${item.fullOrder.items.length - 2}` : '';
      const theme = getStatusTheme(item.status);

      return (
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => handleViewDetails(item.orderId)}
          activeOpacity={0.8}
        >
          {/* Header: Order ID and Status */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <View style={styles.orderIdBadge}>
                <Text style={styles.orderIdText}>#{item.id.split('-').pop()}</Text>
              </View>
              <View style={styles.timeContainer}>
                <MaterialIcons name="access-time" size={14} color="#64748b" />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: theme.bgColor }]}>
              <View style={[styles.pulsingDot, { backgroundColor: theme.color }]} />
              <Text style={[styles.statusBadgeText, { color: theme.color }]}>{item.status}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Customer & Payment Info */}
          <View style={styles.customerPaymentRow}>
            <View style={styles.customerSection}>
              <MaterialIcons name="person-outline" size={18} color="#64748b" />
              <Text style={styles.customerNameText} numberOfLines={1}>{item.customer}</Text>
            </View>
            <View style={[styles.paymentBadge, { backgroundColor: item.payment === 'COD' ? '#fef3c7' : '#ecfdf5' }]}>
              <Text style={[styles.paymentBadgeText, { color: item.payment === 'COD' ? '#92400e' : '#065f46' }]}>
                {item.payment}
              </Text>
            </View>
          </View>

          {/* Items Preview */}
          <View style={styles.itemsGrid}>
            {itemsPreview.map((orderItem, idx) => (
              <View key={idx} style={styles.itemPreview}>
                <View style={styles.itemThumb}>
                  <MaterialIcons name="restaurant" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNameLabel} numberOfLines={1}>{orderItem.product.name}</Text>
                  <Text style={styles.itemQtyLabel}>Quantity: {orderItem.quantity}</Text>
                </View>
              </View>
            ))}
            {moreItems && (
              <View style={styles.moreItemsRow}>
                <View style={styles.moreItemsBadge}>
                  <Text style={styles.moreItemsText}>{moreItems} more items</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.orderFooter}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabelSmall}>Payable Amount</Text>
              <Text style={styles.totalValueLarge}>{item.amount}</Text>
            </View>

            {item.isPending ? (
              <View style={[styles.actionButtons, { gap: 10 }]}>
                <RejectOrderButton orderId={item.orderId} />
                <AcceptOrderButton orderId={item.orderId} />
              </View>
            ) : item.isMarkReady ? (
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => markReady(item.orderId)}
              >
                <Text style={styles.actionBtnText}>Mark Ready</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.detailsBtn}>
                <Text style={styles.detailsBtnText}>View Details</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [getStatusTheme, handleViewDetails, rejectOrder, acceptOrder, markReady]
  );

  const topTabs = [
    { value: 'All' as const, label: 'All' },
    ...broadcastStatusOptions.map(({ value, label }) => ({ value, label })),
  ];

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Error loading orders</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>My Orders</Text>
            <View style={styles.headerButtons}>
              {/* <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="search" size={24} color={COLORS.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="calendar-today" size={24} color={COLORS.muted} />
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.iconButton} onPress={handleOpenModal}>
                <MaterialIcons name="tune" size={24} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Top: Broadcast Status Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}
            contentContainerStyle={styles.filterBarContent}
          >
            {topTabs.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.filterChip,
                  isBroadcastChipActive(tab.value) && styles.activeChip,
                ]}
                onPress={() => handleBroadcastChipPress(tab.value)}
              >
                <Text
                  style={
                    isBroadcastChipActive(tab.value)
                      ? styles.activeChipText
                      : styles.chipText
                  }
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <FlatList
          data={mappedOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.broadcastId}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && mappedOrders.length === 0}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooterComponent}
        />

        {/* Filter Modal */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <TouchableOpacity style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </TouchableOpacity>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={styles.clearButton}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                {/* Date Range - Horizontally Scrollable */}
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Date Range</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {['Today', 'Last 7 Days', 'All Time', 'Custom'].map((text) => (
                      <TouchableOpacity
                        key={text}
                        style={[styles.dateButton, text === dateRange && styles.activeDateButton]}
                        onPress={() => setDateRange(text as any)}
                      >
                        <Text style={text === dateRange ? styles.activeDateText : styles.dateText}>
                          {text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {dateRange === 'Custom' && (
                    <View style={styles.customDateContainer}>
                      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowStartPicker(true)}>
                        <Text style={styles.datePickerText}>Start: {startDateValue.toDateString()}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowEndPicker(true)}>
                        <Text style={styles.datePickerText}>End: {endDateValue.toDateString()}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Order Status */}
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Order Status</Text>
                  <View style={styles.statusGrid}>
                    {orderStatusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={styles.radioRow}
                        onPress={() => handleOrderStatusSelect(status)}
                      >
                        <View
                          style={[
                            styles.radio,
                            orderStatusMap[status] === selectedOrderStatus && styles.selectedRadio,
                          ]}
                        >
                          {orderStatusMap[status] === selectedOrderStatus && (
                            <View style={styles.selectedRadioDot} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDateValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selectedDate) setStartDateValue(selectedDate);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDateValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selectedDate) setEndDateValue(selectedDate);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -1,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filterBarContent: {
    gap: 8,
    paddingRight: 40,
  },
  filterChip: {
    height: 36,
    minWidth: 80,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  activeChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 20,
  },
  ordersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderIdBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e293b',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  customerPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  customerNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemsGrid: {
    gap: 12,
    paddingBottom: 4,
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNameLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  itemQtyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  moreItemsRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 52,
  },
  moreItemsBadge: {
    backgroundColor: '#f5eeff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  totalContainer: {
    gap: 2,
  },
  totalLabelSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  totalValueLarge: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  detailsBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
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
    lineHeight: 24,
    maxWidth: '85%',
  },
  resetButton: {
    width: '100%',
    height: 44,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 24,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandleContainer: {
    height: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  dragHandle: {
    height: 6,
    width: 40,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalContent: {
    flexDirection: 'column',
    gap: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  activeDateButton: {
    backgroundColor: `${COLORS.primary}20`,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  activeDateText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  customDateContainer: {
    gap: 12,
    marginTop: 12,
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  datePickerText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  statusGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    flex: 1,
  },
  applyButton: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default MyOrdersScreen;