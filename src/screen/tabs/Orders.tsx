import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
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
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../../api/api'; // Assuming this is the path to your API client
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

const { width } = Dimensions.get('window');

const statusMap: { [key: string]: string } = {
  Pending: 'PENDING',
  Accepted: 'ACCEPTED',
  Rejected: 'REJECTED',
  Missed: 'MISSED',
};

const orderStatusMap: { [key: string]: string } = {
  VENDOR_ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  DELIVERY_PENDING: 'Delivery Pending',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  DISPUTED: 'Disputed',
};

const broadcastStatusMap: { [key: string]: string } = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  MISSED: 'Missed',
};

const getDisplayStatus = (broadcastStatus: string, orderStatus?: string) => {
  if (broadcastStatus !== 'ACCEPTED') {
    return broadcastStatusMap[broadcastStatus as keyof typeof broadcastStatusMap] || broadcastStatus;
  }
  return orderStatusMap[orderStatus || ''] || 'Accepted';
};

interface OrderQueryParams {
  broadcastStatus?: string;
  date?: string;
  page?: number;
  limit?: number;
}

interface OrderApiResponse {
  success: boolean;
  message: string;
  data: {
    totalBroadcasts: number;
    totalPage: number;
    currentPage: number;
    broadcasts: any[]; // Adjust based on actual broadcast structure
  };
}

const fetchOrders = async (params: OrderQueryParams): Promise<OrderApiResponse> => {
  const { data } = await api.get('/vendor/order/all/', { params });
  return data;
};

export const useOrders = (queryParams: OrderQueryParams) => {
  return useInfiniteQuery({
    queryKey: ['orders', queryParams],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => fetchOrders({ ...queryParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.currentPage < lastPage.data.totalPage) {
        return lastPage.data.currentPage + 1;
      }
      return undefined;
    },
  });
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
  orderId: number | string;
  broadcastId: string;
  isPending: boolean;
  isMarkReady: boolean;
  fullOrder: any;
}

const MyOrdersScreen = ({ navigation }: AppNavigation) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'Today' | 'Last 7 Days' | 'All Time'>('Today');
  const [selectedStatusModal, setSelectedStatusModal] = useState<string>('');

  const possibleStatuses = ['Pending', 'Accepted', 'Rejected', 'Missed'];

  const queryParams = useMemo(() => {
    let dateParam: string | undefined;
    const now = new Date();
    if (dateRange === 'Today') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      dateParam = today.toISOString();
    } else if (dateRange === 'Last 7 Days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      dateParam = sevenDaysAgo.toISOString();
    }
    // For 'All Time', dateParam undefined

    const params: OrderQueryParams = {
      limit: 10,
    };

    if (selectedStatuses.length > 0) {
      params.broadcastStatus = statusMap[selectedStatuses[0] as keyof typeof statusMap];
    }
    if (dateParam) {
      params.date = dateParam;
    }

    return params;
  }, [selectedStatuses, dateRange]);

  const {
    data: queryData,
    error,
    isError,
    isLoading,
    isFetching,
    fetchNextPage,
    refetch,
  } = useOrders(queryParams);

  const ordersFromApi = useMemo(() =>
    queryData?.pages?.flatMap(page =>
      page.data.broadcasts?.map((broadcast: any) => ({
        id: broadcast.order.orderNumber,
        time: new Date(broadcast.notifiedAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        customer: 'Customer Name', // TODO: Include address in backend include for receiverName
        items: broadcast.order.items.length,
        amount: `₹${Number(broadcast.order.paidAmount || 0).toFixed(2)}`,
        status: getDisplayStatus(broadcast.status, broadcast.order.status),
        payment: broadcast.order.paymentMethod === 'COD' ? 'COD' : 'PREPAID',
        createdAt: broadcast.order.timestamps?.placedAt || broadcast.notifiedAt,
        orderId: broadcast.order.id,
        broadcastId: broadcast.id,
        isPending: broadcast.status === 'PENDING',
        isMarkReady: broadcast.status === 'ACCEPTED' && broadcast.order.status === 'VENDOR_ACCEPTED',
        fullOrder: broadcast.order,
      })) || []
    ) || [],
    [queryData]
  );

  const mappedOrders: MappedOrder[] = useMemo(() => ordersFromApi, [ordersFromApi]);

  const handleChipPress = useCallback((status: string) => {
    if (status === 'All') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses([status]);
    }
  }, []);

  const isChipActive = useCallback((status: string) => {
    if (status === 'All') {
      return selectedStatuses.length === 0;
    }
    return selectedStatuses.includes(status);
  }, [selectedStatuses]);

  const handleOpenModal = useCallback(() => {
    setSelectedStatusModal(selectedStatuses[0] || '');
    setModalVisible(true);
  }, [selectedStatuses]);

  const handleClearAll = useCallback(() => {
    setSelectedStatusModal('');
  }, []);

  const handleApplyFilter = useCallback(() => {
    if (selectedStatusModal) {
      setSelectedStatuses([selectedStatusModal]);
    } else {
      setSelectedStatuses([]);
    }
    setModalVisible(false);
  }, [selectedStatusModal]);

  const handleStatusSelect = useCallback((status: string) => {
    setSelectedStatusModal(status);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedStatuses([]);
    setDateRange('Today');
  }, []);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (!isFetching && queryData?.pages.length && queryData.pages[queryData.pages.length - 1].data.currentPage < queryData.pages[queryData.pages.length - 1].data.totalPage) {
      fetchNextPage();
    }
  }, [isFetching, queryData, fetchNextPage]);

  const acceptOrder = useCallback(async (orderId: string | number) => {
    try {
      await api.post(`/vendor/order/accept-order/${orderId}`, { action: 'accept' });
      Alert.alert('Success', 'Order accepted');
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    }
  }, [refetch]);

  const rejectOrder = useCallback(async (orderId: string | number) => {
    try {
      await api.post(`/vendor/order/accept-order/${orderId}`, { action: 'reject' });
      Alert.alert('Success', 'Order rejected');
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject order');
    }
  }, [refetch]);

  const markReady = useCallback(async (orderId: string | number) => {
    try {
      await api.post(`/vendor/order/mark-ready/${orderId}`);
      Alert.alert('Success', 'Order marked ready');
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark ready');
    }
  }, [refetch]);

  const handleViewDetails = useCallback((orderId: number | string) => {
    navigation.navigate('OrderDetails', { orderId });
  }, [navigation]);

  const isRejectedStatus = useCallback((status: string) => ['Rejected', 'Missed', 'Cancelled'].includes(status), []);

  const getStatusBadgeStyle = useCallback((status: string) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#3b82f6' };
      case 'Accepted':
        return styles.acceptedBadge;
      case 'Delivered':
      case 'Ready for Pickup':
        return styles.deliveredBadge;
      case 'Rejected':
      case 'Missed':
      case 'Cancelled':
        return styles.rejectedBadge;
      case 'Preparing':
        return styles.preparingBadge;
      case 'Out for Delivery':
      case 'Delivery Pending':
        return { backgroundColor: '#3b82f6' };
      case 'Refunded':
      case 'Disputed':
        return { backgroundColor: '#ef4444' };
      default:
        return {};
    }
  }, []);

  const isFiltered = selectedStatuses.length > 0 || dateRange !== 'Today';

  const emptyMessage = isFiltered
    ? 'No Orders Match Your Filters'
    : 'No Orders Yet';

  const emptySubtitle = isFiltered
    ? 'Try adjusting your filters to find what you\'re looking for.'
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

  const renderOrderItem = useCallback(({ item }: { item: MappedOrder }) => (
    <View style={[styles.orderCard, isRejectedStatus(item.status) && styles.rejectedCard]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderDetails}>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <Text style={styles.orderTime}>{item.time}</Text>
          <Text style={styles.orderSummary}>
            {item.customer} - {item.items} items - {item.amount}
          </Text>
        </View>
        <View style={styles.orderActions}>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <View style={styles.paymentTag}>
            <Text style={styles.paymentText}>{item.payment}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.orderFooter, isRejectedStatus(item.status) && styles.rejectedFooter]}>
        <View
          style={[
            styles.footerButtons,
            {
              flex: 1,
              justifyContent: item.isPending ? 'space-between' : item.isMarkReady ? 'space-between' : 'flex-end',
            },
          ]}
        >
          <TouchableOpacity style={styles.secondaryButton} onPress={() => handleViewDetails(item.orderId)}>
            <Text style={styles.secondaryButtonText}>View Details</Text>
          </TouchableOpacity>
          {item.isPending && (
            <>
              <TouchableOpacity style={[styles.primaryButton, styles.rejectButton]} onPress={() => rejectOrder(item.orderId)}>
                <Text style={[styles.primaryButtonText, styles.rejectButtonText]}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => acceptOrder(item.orderId)}>
                <Text style={styles.primaryButtonText}>Accept</Text>
              </TouchableOpacity>
            </>
          )}
          {item.isMarkReady && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => markReady(item.orderId)}>
              <Text style={styles.primaryButtonText}>Mark Ready</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  ), [isRejectedStatus, getStatusBadgeStyle, handleViewDetails, acceptOrder, rejectOrder, markReady]);

  const tabs = [
    { value: 'All' as const, label: 'All' },
    ...possibleStatuses.map(status => ({ value: status , label: status })),
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
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>My Orders</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="search" size={24} color={COLORS.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="calendar-today" size={24} color={COLORS.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleOpenModal}>
                <MaterialIcons name="tune" size={24} color={COLORS.muted} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Horizontal Filter Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}
            contentContainerStyle={styles.filterBarContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                style={[styles.filterChip, isChipActive(tab.value) && styles.activeChip]}
                onPress={() => handleChipPress(tab.value)}
              >
                <Text style={isChipActive(tab.value) ? styles.activeChipText : styles.chipText}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FlatList of Order Cards */}
        <FlatList
          data={mappedOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersContent}
          refreshControl={
            <RefreshControl refreshing={isFetching && mappedOrders.length === 0} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={
            isFetching && mappedOrders.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
        />

        {/* Filter Sheet Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
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
                {/* Date Range */}
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Date Range</Text>
                  <View style={styles.dateGrid}>
                    {['Today', 'Last 7 Days', 'All Time'].map((text) => (
                      <TouchableOpacity
                        key={text}
                        style={[styles.dateButton, text === dateRange && styles.activeDateButton]}
                        onPress={() => setDateRange(text as 'Today' | 'Last 7 Days' | 'All Time')}
                      >
                        <Text style={text === dateRange ? styles.activeDateText : styles.dateText}>
                          {text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {/* Order Status */}
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Order Status</Text>
                  <View style={styles.statusGrid}>
                    {possibleStatuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={styles.radioRow}
                        onPress={() => handleStatusSelect(status)}
                      >
                        <View style={[styles.radio, selectedStatusModal === status && styles.selectedRadio]} />
                        <Text style={styles.radioLabel}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {/* Apply Button */}
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                  <Text style={styles.applyButtonText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.015,
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
    gap: 16,
  },
  rejectedCard: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.highlight,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderDetails: {
    gap: 4,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  orderTime: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  orderSummary: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginTop: 4,
  },
  orderActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  acceptedBadge: {
    backgroundColor: COLORS.primary,
  },
  deliveredBadge: {
    backgroundColor: '#10b981',
  },
  rejectedBadge: {
    backgroundColor: COLORS.danger,
  },
  preparingBadge: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paymentTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  rejectedFooter: {
    borderTopColor: `${COLORS.highlight}50`,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButton: {
    minWidth: 84,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    minWidth: 84,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 20,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  rejectButtonText: {
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
    backgroundColor: 'rgba(135, 25, 198, 0.05)', // Light purple tint matching primary
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
    backgroundColor: 'rgba(20, 20, 20, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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