import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NewOrderModal from '../../components/orers/NewOrderModal';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { acceptOrder, BroadcastedOrder, getOrders, GetOrdersParams, markReady } from "../../services/order.service";
import { updateVendor } from '../../services/vendor.service';
import { wsService } from '../../services/websocket.service';
import { COLORS } from '../../theme/color';
import { BroadcastStatus, OrderStatus } from '../../types/order.types';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');
const maxWidth = Math.min(screenWidth, 375);

const FONTS = {
    display: Platform.select({
        ios: 'System',
        android: 'sans-serif',
    }),
    heading: Platform.select({
        ios: 'System',
        android: 'sans-serif',
    }),
};

interface VendorOrder {
    id: string; // order.id
    orderNumber: string;
    customer: string;
    receiverName?: string;
    items: string;
    distance: string;
    status: string;
    action: string;
    actionColor: string;
    actionBg: string;
    disabled: boolean;
    totalAmount?: number;
    broadcastStatus: string;
}

// Haversine distance calculation
// Haversine distance in km (same formula, just safer)
const haversineDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number): number => {
    if (typeof lat2 !== "number" || typeof lon2 !== "number") return 0;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


// Status mapping
const statusMap: Record<string, { display: string; color: string; bg: string }> = {
    VENDOR_PENDING: { display: 'New', color: COLORS.highlight, bg: `${COLORS.highlight}20` },
    VENDOR_ACCEPTED: { display: 'Accepted', color: '#2196F3', bg: '#2196F320' },
    PREPARING: { display: 'Preparing', color: '#FFC107', bg: '#FFC10720' },
    READY_FOR_PICKUP: { display: 'Ready', color: '#4CAF50', bg: '#4CAF5040' },
    DELIVERY_PENDING: { display: 'Delivery Pending', color: '#FF9800', bg: '#FF980020' },
    OUT_FOR_DELIVERY: { display: 'Out for Delivery', color: '#9C27B0', bg: '#9C27B020' },
    DELIVERED: { display: 'Delivered', color: COLORS.primary, bg: `${COLORS.primary}20` },
    CANCELLED: { display: 'Cancelled', color: '#F44336', bg: '#F4433620' },
    REFUNDED: { display: 'Refunded', color: '#F44336', bg: '#F4433620' },
    DISPUTED: { display: 'Disputed', color: '#FF5722', bg: '#FF572220' },
};

const VendorHome: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<string>('All');
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [revenue, setRevenue] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const { vendorId } = useAuth();
    const { connected } = useWebSocket();

    // Hardcoded vendor location for distance calc (replace with real from auth/context)
    const vendorLocation = { lat: 28.6139, lng: 77.2090 }; // Example: Delhi

    // Load initial online status from AsyncStorage
    useEffect(() => {
        const loadOnlineStatus = async () => {
            try {
                const savedStatus = await AsyncStorage.getItem('vendorIsOnline');
                if (savedStatus !== null) {
                    setIsOnline(JSON.parse(savedStatus));
                }
            } catch (error) {
                console.error('Error loading online status:', error);
            }
        };
        loadOnlineStatus();
    }, []);

    const saveOnlineStatus = async (status: boolean) => {
        try {
            await AsyncStorage.setItem('vendorIsOnline', JSON.stringify(status));
        } catch (error) {
            console.error('Error saving online status:', error);
        }
    };

    // Separate unfiltered fetch for global stats (runs independently of tab filters)
    const fetchStats = useCallback(async () => {
        if (!isOnline || !vendorId) return;
        try {
            const params: GetOrdersParams = {
                page: 1,
                limit: 100, // Higher limit for better stats approx.
                // No status filters for global stats
            };
            const { orders: rawOrders } = await getOrders(params);
            const filteredRawOrders = rawOrders.filter(
                (o: BroadcastedOrder) => !['MISSED', 'REJECTED'].includes(o.status)
            );
            // Transform minimally for stats
            const transformedOrders: VendorOrder[] = filteredRawOrders.map((broadcast: BroadcastedOrder) => {
                const order = broadcast.order;
                return {
                    totalAmount: Number(order.totalAmount || 0),
                    broadcastStatus: broadcast.status,
                } as VendorOrder; // Partial for stats
            });
            const pendingOrders = transformedOrders.filter((o) => o.broadcastStatus === 'PENDING');
            const acceptedOrders = transformedOrders.filter((o) => o.broadcastStatus === 'ACCEPTED');
            setTotalOrders(acceptedOrders.length);
            setPendingCount(pendingOrders.length);
            setRevenue(
                acceptedOrders.reduce((sum, o) => sum + parseToDecimal(o.totalAmount), 0)
            );
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [isOnline, vendorId]);

    const fetchOrders = useCallback(async () => {
        if (!isOnline || !vendorId) return;
        setLoading(true);
        try {
            const params: GetOrdersParams = {
                page: 1,
                limit: 50,
                // Always fetch unfiltered; filter in frontend
            };
            const { orders: rawOrders } = await getOrders(params);
            // Filter out missed/rejected for display
            const filteredRawOrders = rawOrders.filter(
                (o: BroadcastedOrder) => !['MISSED', 'REJECTED'].includes(o.status)
            );
            // Transform to VendorOrder
            const transformedOrders: VendorOrder[] = filteredRawOrders.map((broadcast: BroadcastedOrder) => {
                const order = broadcast.order;
                const itemsStr = order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(', ');
                const distanceKm = haversineDistance(
                    vendorLocation.lat,
                    vendorLocation.lng,
                    order.address?.latitude,
                    order.address?.longitude
                );

                let displayDistance = "N/A";
                let etaMin = 0;

                if (distanceKm > 0) {
                    // Assume 25 km/h average speed -> 2.4 min per km
                    etaMin = Math.max(5, Math.round(distanceKm * 2.4));
                    displayDistance = `${distanceKm.toFixed(2)} km • ${etaMin} min`;
                } else {
                    displayDistance = "Distance unavailable";
                }

                const distance = displayDistance;

                const backendStatus = order.status;
                const { display: status } = statusMap[backendStatus] || {
                    display: backendStatus,
                };
                let action = '';
                let actionColor = 'white';
                let actionBg = COLORS.primary;
                let disabled = false;
                if (broadcast.status === 'PENDING') {
                    action = 'Accept';
                } else if (broadcast.status === 'ACCEPTED') {
                    if (backendStatus === 'READY_FOR_PICKUP') {
                        action = 'Picked Up';
                        actionBg = '#E0E0E0';
                        actionColor = COLORS.muted;
                        disabled = true;
                    } else {
                        action = 'Ready';
                    }
                } else if (backendStatus === 'DELIVERED') {
                    action = 'Complete';
                    disabled = true;
                }
                return {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    customer: order.user.name,
                    receiverName: order.address.receiverName,
                    items: itemsStr,
                    distance,
                    status,
                    action,
                    actionColor,
                    actionBg,
                    disabled,
                    totalAmount: Number(order.totalAmount || 0),
                    broadcastStatus: broadcast.status,
                };
            });
            setOrders(transformedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            Alert.alert('Error', 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [isOnline, vendorId]);

    // Fetch data when online/vendorId changes
    useEffect(() => {
        if (isOnline && vendorId) {
            fetchStats();
            fetchOrders();
        }
    }, [isOnline, vendorId, fetchStats, fetchOrders]);

    const handleNewOrder = useCallback((payload: any) => {
        console.log("Received new_order event payload from backend:", payload);
        console.log("Order data specifically:", payload?.data);
        setSelectedOrder(payload?.data || null);
        setModalVisible(true);
        fetchStats(); // Refresh stats on new order
        fetchOrders(); // Refetch to include new order
    }, [fetchStats, fetchOrders]);

    // WebSocket setup
    useEffect(() => {
        if (connected && isOnline) {
            wsService.on("new_order", handleNewOrder);
        }
        return () => {
            wsService.off("new_order", handleNewOrder);
        };
    }, [connected, isOnline, handleNewOrder]);

    const toggleOnline = async () => {
        if (vendorId) {
            try {
                const newStatus = !isOnline;
                await updateVendor(vendorId, { isOpen: newStatus });
                setIsOnline(newStatus);
                await saveOnlineStatus(newStatus);
                if (newStatus) {
                    fetchOrders(); // Fetch immediately when going online
                    fetchStats();
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to update online status');
            }
        }
    };

    const handleAccept = async (order: VendorOrder) => {
        try {
            await acceptOrder(order.id);
            Alert.alert('Success', 'Order accepted successfully');
            fetchOrders(); // Refetch to update list
            fetchStats(); // Refresh stats
        } catch (error: any) {
            console.error('Accept error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to accept order');
        }
    };

    const handleMarkReady = async (order: VendorOrder) => {
        try {
            await markReady(order.id);
            Alert.alert('Success', 'Order marked as ready');
            fetchOrders(); // Refetch
            fetchStats(); // Refresh stats
        } catch (error: any) {
            console.error('Mark ready error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to mark order ready');
        }
    };

    const handleActionPress = (order: VendorOrder) => {
        if (order.disabled) return;
        if (order.action === 'Accept') {
            handleAccept(order);
        } else if (order.action === 'Ready') {
            handleMarkReady(order);
        }
        // Add more actions if needed (e.g., Complete)
    };

    const getStatusColor = (status: string) => {
        return statusMap[status]?.color || COLORS.primary;
    };

    const getStatusBg = (status: string) => {
        return statusMap[status]?.bg || `${COLORS.primary}20`;
    };

    const renderOnlineContent = () => (
        <>
            {/* Stats - Horizontal Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statsContainer}
            >
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <MaterialIcons name="receipt-long" size={20} color={COLORS.muted} />
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <Text style={styles.statValue}>{totalOrders}</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <MaterialIcons name="payments" size={20} color={COLORS.muted} />
                        <Text style={styles.statLabel}>Revenue</Text>
                    </View>
                    <Text style={styles.statValue}>₹{revenue.toFixed(0)}</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <MaterialIcons name="pending-actions" size={20} color={COLORS.muted} />
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <Text style={styles.statValue}>{pendingCount}</Text>
                </View>
            </ScrollView>
            {/* SearchBar - TODO: Implement search logic */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <View style={styles.searchIconContainer}>
                        <MaterialIcons name="search" size={20} color={COLORS.muted} />
                    </View>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search orders, customers, items..."
                        placeholderTextColor={COLORS.muted}
                        value=""
                    />
                </View>
            </View>
            {/* Chips - Show tabs but no filtering */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
            >
                {['All', 'New', 'Accepted', 'Preparing', 'Ready', 'Delivered'].map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.chip, selectedFilter === filter && styles.activeChip]}
                        onPress={() => {
                            setSelectedFilter(filter);
                        }}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                selectedFilter === filter ? styles.chipTextActive : null,
                            ]}
                        >
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/* SectionHeader */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Orders</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            </View>
            {/* Active Orders List - Always show all orders */}
            <View style={styles.ordersContainer}>
                {loading ? (
                    <Text style={{ textAlign: 'center', padding: 20 }}>Loading...</Text>
                ) : orders.length === 0 ? (
                    <Text style={{ textAlign: 'center', padding: 20, color: COLORS.muted }}>No orders found</Text>
                ) : (
                    orders.map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderId}>Order #{order.orderNumber}</Text>
                                    <Text style={styles.customerName}>{order.customer}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                        {order.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.orderItems}>{order.items}</Text>
                            <View style={styles.orderFooter}>
                                <View style={styles.distanceContainer}>
                                    <MaterialIcons name="directions-bike" size={20} color={COLORS.primary} />
                                    <Text style={styles.distanceText}>{order.distance}</Text>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[
                                            order.disabled ? styles.actionButtonDisabled : styles.actionButton,
                                            { backgroundColor: order.actionBg },
                                        ]}
                                        disabled={order.disabled}
                                        onPress={() => handleActionPress(order)}
                                    >
                                        <Text
                                            style={[
                                                styles.actionButtonText,
                                                { color: order.actionColor },
                                            ]}
                                        >
                                            {order.action}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </>
    );

    const renderOfflineContent = () => (
        <View style={styles.offlineContent}>
            <MaterialIcons name="wifi-off" size={64} color={COLORS.muted} />
            <Text style={styles.offlineTitle}>You are offline</Text>
            <Text style={styles.offlineSubtitle}>Go online to accept orders</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={[styles.container, { maxWidth }]}>
                {/* Top App Bar */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoContainer}>
                            <MaterialIcons name="restaurant" size={20} color={COLORS.textPrimary} />
                        </View>
                        <Text style={styles.title}>Minta Club</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={toggleOnline}
                            style={[styles.onlineStatus, { backgroundColor: isOnline ? COLORS.primary : '#F5F5F5' }]}
                        >
                            <View
                                style={[
                                    styles.onlineIndicator,
                                    { backgroundColor: isOnline ? COLORS.white : '#E0E0E0' },
                                ]}
                            >
                                <MaterialIcons
                                    name={isOnline ? 'check' : 'close'}
                                    size={12}
                                    color={isOnline ? COLORS.primary : COLORS.muted}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.onlineText,
                                    { color: isOnline ? COLORS.white : COLORS.textSecondary },
                                ]}
                            >
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </TouchableOpacity>
                        <Image
                            style={styles.profileImage}
                            source={{
                                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAScI9pkc7_c9MtCKhutLsut8y5VqkQ7Gl0UFkE5kMGChxEdvgzcRoQVPbGAchBKUhwwWmPJyRET1vMBeIxC_Q9pWLkLbHRuJkymbgqnJiEMwp0xmeGgg2EuELBWVGoPoBjY_jWKCHRNMcQGcNW42otpgIBWNeZ7aRa0GNjjclofJv4iWu1H5B4ie385NziZOMNJeBI4T9nkHiPt1l3iN084_sQh-ajt2Vjtq5QRqZgvyxElxmTJJvnK46halJI2KwS4rOYlfgmFwSM',
                            }}
                            resizeMode="cover"
                        />
                    </View>
                </View>
                {/* Main Content */}
                <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
                    {isOnline ? renderOnlineContent() : renderOfflineContent()}
                    {/* Add padding to prevent cutting at bottom */}
                    <View style={{ height: 100 }} />
                </ScrollView>
                {/* NewOrderModal */}
                <NewOrderModal
                    visible={modalVisible}
                    currentOrder={selectedOrder}
                    onDismiss={() => {
                        setModalVisible(false);
                        setSelectedOrder(null);
                    }}
                    onAccept={async () => {
                        if (selectedOrder) {
                            try {
                                await acceptOrder(selectedOrder.id);
                                Alert.alert('Success', 'Order accepted successfully');
                            } catch (error: any) {
                                console.error('Accept error:', error);
                                Alert.alert('Error', error.response?.data?.message || 'Failed to accept order');
                            }
                        }
                        setModalVisible(false);
                        setSelectedOrder(null);
                        fetchOrders();
                        fetchStats();
                    }}
                    onReject={() => {
                        setModalVisible(false);
                        setSelectedOrder(null);
                    }}
                />
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
        flexDirection: 'column',
        backgroundColor: COLORS.background,
        overflow: 'hidden',
    },
    header: {
        position: 'relative',
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: Platform.OS === 'android' ? 4 : 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '700',
        fontFamily: FONTS.heading,
        letterSpacing: -0.25,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        borderRadius: 16,
        paddingHorizontal: 4,
    },
    onlineIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    onlineText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    profileImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    main: {
        flex: 1,
    },
    offlineContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    offlineTitle: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    offlineSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
    },
    statCard: {
        minWidth: 100,
        flexDirection: 'column',
        gap: 8,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    statValue: {
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
        fontSize: 30,
        fontWeight: '700',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderRadius: 9999,
        height: 56,
        backgroundColor: COLORS.white,
    },
    searchIconContainer: {
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 20,
        borderTopLeftRadius: 9999,
        borderBottomLeftRadius: 9999,
    },
    searchInput: {
        flex: 1,
        minWidth: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingLeft: 8,
        borderTopRightRadius: 9999,
        borderBottomRightRadius: 9999,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    chipsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    chip: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: COLORS.white,
        borderRadius: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    activeChip: {
        backgroundColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    chipTextActive: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 16,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '700',
        fontFamily: FONTS.heading,
        letterSpacing: -0.25,
    },
    seeAllText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    ordersContainer: {
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        paddingTop: 8,
        paddingBottom: 100,
    },
    orderCard: {
        flexDirection: 'column',
        gap: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    orderId: {
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: '500',
    },
    customerName: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 28,
        paddingHorizontal: 12,
        borderRadius: 14,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    orderItems: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    orderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 16,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    distanceText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonDisabled: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingHorizontal: 24,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
});

export default VendorHome;