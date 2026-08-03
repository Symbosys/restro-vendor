import { useMemo, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useVendorBroadcastedOrders } from '../../../../api/hooks/order';
import {
  useToggleStoreStatusMutation,
  useVendorById,
} from '../../../../hooks/useVendorQueries';
import { useAuth } from '../../../../context/AuthContext';
import {
  VendorBroadcastItem,
  OrderStatus,
  BroadcastStatus,
} from '../../../../types/order.types';
import { useHomeStore } from '../store/homeStore';

export const useHome = () => {
  const {
    storeOpen,
    setStoreOpen,
    activeTab,
    setActiveTab,
    modalVisible,
    setModalVisible,
    selectedOrder,
    setSelectedOrder,
  } = useHomeStore();

  const tabs = [
    { key: 'all' as const, label: 'All' },
    { key: 'new' as const, label: 'New' },
    { key: 'preparing' as const, label: 'Preparing' },
    { key: 'ready' as const, label: 'Ready' },
    { key: 'outForDelivery' as const, label: 'Out for Delivery' },
    { key: 'delivered' as const, label: 'Delivered' },
  ];

  const tabToFilter = useMemo(
    () => ({
      all: undefined,
      new: { broadcastStatus: BroadcastStatus.PENDING },
      preparing: { orderStatus: OrderStatus.PREPARING },
      ready: { orderStatus: OrderStatus.READY_FOR_PICKUP },
      outForDelivery: { orderStatus: OrderStatus.OUT_FOR_DELIVERY },
      delivered: { orderStatus: OrderStatus.DELIVERED },
    }),
    [],
  );

  // === Force today's date range (current date only) ===
  const todayDateRange = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    return {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    };
  }, []);

  const queryParams = useMemo(() => {
    const baseFilter = tabToFilter[activeTab] || {};
    return { ...baseFilter, ...todayDateRange };
  }, [activeTab, tabToFilter, todayDateRange]);

  const { vendorId, isAuthenticated } = useAuth();

  const {
    data: queryData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch: refetchBroadcasts,
  } = useVendorBroadcastedOrders(queryParams);

  const { data: vendor, refetch: refetchVendor } = useVendorById({
    enabled: isAuthenticated,
  });
  const { mutate: toggleStoreStatus } = useToggleStoreStatusMutation();

  // Sync storeOpen with vendor data from query
  useEffect(() => {
    if (vendor?.isOpen !== undefined) {
      setStoreOpen(vendor.isOpen);
    }
  }, [vendor?.isOpen, setStoreOpen]);

  // === AUTO OPEN MODAL LOGIC ===
  const staticOrder = useMemo(
    () => ({
      id: 'static-broadcast-demo',
      status: BroadcastStatus.PENDING,
      vendorId: vendorId || 'demo-vendor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: {
        id: 'static-order-demo',
        orderNumber: 'DEMO-001',
        status: OrderStatus.VENDOR_PENDING,
        vendorId: vendorId || 'demo-vendor',
        customerId: 'demo-customer',
        subtotal: 450,
        deliveryFee: 40,
        totalAmount: 490,
        items: [
          {
            id: 'item-1',
            quantity: 1,
            totalPrice: 450,
            product: {
              id: 'prod-1',
              name: 'Premium Chicken Curry Cut',
              images: [],
            },
          },
        ],
        timestamps: {
          placedAt: new Date().toISOString(),
        },
      },
    }),
    [vendorId],
  );

  // Modal Logic is now purely event-driven via Home.tsx and WebSocket events.

  const broadcasts = useMemo(
    () => queryData?.pages.flatMap(page => page.data.broadcasts) || [],
    [queryData],
  );

  const handleOrderPress = useCallback(
    (broadcast: VendorBroadcastItem) => {
      setSelectedOrder(broadcast);
      setModalVisible(true);
    },
    [setSelectedOrder, setModalVisible],
  );

  const handleEndReached = useCallback(() => {
    // Only fetch next page if we aren't already fetching something and we have a next page
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetching &&
      broadcasts.length > 0
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    broadcasts.length,
  ]);

  const handleOrderAction = useCallback(
    (action: 'accept' | 'reject' | 'markReady', orderId: string) => {
      console.log(`Action: ${action} for order ${orderId}`);
    },
    [],
  );

  const handleToggleStore = useCallback(async () => {
    const newStatus = !storeOpen;
    setStoreOpen(newStatus);
    toggleStoreStatus(newStatus, {
      onError: () => {
        setStoreOpen(storeOpen);
      },
    });
  }, [storeOpen, toggleStoreStatus, setStoreOpen]);

  const queryClient = useQueryClient();
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.resetQueries({ queryKey: ['vendorBroadcastedOrders'] }),
      queryClient.resetQueries({ queryKey: ['analytics'] }),
      refetchVendor(),
    ]);
  }, [queryClient, refetchVendor]);

  return {
    storeOpen,
    setStoreOpen,
    activeTab,
    setActiveTab,
    modalVisible,
    setModalVisible,
    selectedOrder,
    setSelectedOrder,
    tabs,
    broadcasts,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    handleOrderPress,
    handleEndReached,
    handleOrderAction,
    handleToggleStore,
    handleRefresh,
    refetchBroadcasts,
    refetchVendor,
    vendor,
  };
};
