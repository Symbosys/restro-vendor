// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import React, { useCallback, useEffect, useState } from 'react';
// // import {
// //     Alert,
// //     Dimensions,
// //     Image,
// //     Platform,
// //     ScrollView,
// //     StyleSheet,
// //     Text,
// //     TextInput,
// //     TouchableOpacity,
// //     View,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// // import NewOrderModal from '../../components/orers/NewOrderModal';
// // import { useAuth } from '../../context/AuthContext';
// // import { useWebSocket } from '../../context/WebSocketContext';
// // import { acceptOrder, BroadcastedOrder, getOrders, GetOrdersParams, markReady } from "../../services/order.service";
// // import { updateVendor } from '../../services/vendor.service';
// // import { wsService } from '../../services/websocket.service';
// // import { COLORS } from '../../theme/color';
// // import { BroadcastStatus, OrderStatus } from '../../types/order.types';
// // import { parseToDecimal } from '../../utils/utils';

// // const { width: screenWidth } = Dimensions.get('window');
// // const maxWidth = Math.min(screenWidth, 375);

// // const FONTS = {
// //     display: Platform.select({
// //         ios: 'System',
// //         android: 'sans-serif',
// //     }),
// //     heading: Platform.select({
// //         ios: 'System',
// //         android: 'sans-serif',
// //     }),
// // };

// // interface VendorOrder {
// //     id: string; // order.id
// //     orderNumber: string;
// //     customer: string;
// //     receiverName?: string;
// //     items: string;
// //     distance: string;
// //     status: string;
// //     action: string;
// //     actionColor: string;
// //     actionBg: string;
// //     disabled: boolean;
// //     totalAmount?: number;
// //     broadcastStatus: string;
// // }

// // // Haversine distance calculation
// // // Haversine distance in km (same formula, just safer)
// // const haversineDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number): number => {
// //     if (typeof lat2 !== "number" || typeof lon2 !== "number") return 0;
// //     const R = 6371; // Earth's radius in km
// //     const dLat = (lat2 - lat1) * (Math.PI / 180);
// //     const dLon = (lon2 - lon1) * (Math.PI / 180);
// //     const a =
// //         Math.sin(dLat / 2) ** 2 +
// //         Math.cos(lat1 * (Math.PI / 180)) *
// //         Math.cos(lat2 * (Math.PI / 180)) *
// //         Math.sin(dLon / 2) ** 2;
// //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //     return R * c;
// // };


// // // Status mapping
// // const statusMap: Record<string, { display: string; color: string; bg: string }> = {
// //     VENDOR_PENDING: { display: 'New', color: COLORS.highlight, bg: `${COLORS.highlight}20` },
// //     VENDOR_ACCEPTED: { display: 'Accepted', color: '#2196F3', bg: '#2196F320' },
// //     PREPARING: { display: 'Preparing', color: '#FFC107', bg: '#FFC10720' },
// //     READY_FOR_PICKUP: { display: 'Ready', color: '#4CAF50', bg: '#4CAF5040' },
// //     DELIVERY_PENDING: { display: 'Delivery Pending', color: '#FF9800', bg: '#FF980020' },
// //     OUT_FOR_DELIVERY: { display: 'Out for Delivery', color: '#9C27B0', bg: '#9C27B020' },
// //     DELIVERED: { display: 'Delivered', color: COLORS.primary, bg: `${COLORS.primary}20` },
// //     CANCELLED: { display: 'Cancelled', color: '#F44336', bg: '#F4433620' },
// //     REFUNDED: { display: 'Refunded', color: '#F44336', bg: '#F4433620' },
// //     DISPUTED: { display: 'Disputed', color: '#FF5722', bg: '#FF572220' },
// // };

// // const VendorHome: React.FC = () => {
// //     const [selectedFilter, setSelectedFilter] = useState<string>('All');
// //     const [isOnline, setIsOnline] = useState<boolean>(true);
// //     const [orders, setOrders] = useState<VendorOrder[]>([]);
// //     const [loading, setLoading] = useState<boolean>(false);
// //     const [totalOrders, setTotalOrders] = useState<number>(0);
// //     const [pendingCount, setPendingCount] = useState<number>(0);
// //     const [revenue, setRevenue] = useState<number>(0);
// //     const [modalVisible, setModalVisible] = useState(false);
// //     const [selectedOrder, setSelectedOrder] = useState<any>(null);
// //     const { vendorId } = useAuth();
// //     const { connected } = useWebSocket();

// //     // Hardcoded vendor location for distance calc (replace with real from auth/context)
// //     const vendorLocation = { lat: 28.6139, lng: 77.2090 }; // Example: Delhi

// //     // Load initial online status from AsyncStorage
// //     useEffect(() => {
// //         const loadOnlineStatus = async () => {
// //             try {
// //                 const savedStatus = await AsyncStorage.getItem('vendorIsOnline');
// //                 if (savedStatus !== null) {
// //                     setIsOnline(JSON.parse(savedStatus));
// //                 }
// //             } catch (error) {
// //                 console.error('Error loading online status:', error);
// //             }
// //         };
// //         loadOnlineStatus();
// //     }, []);

// //     const saveOnlineStatus = async (status: boolean) => {
// //         try {
// //             await AsyncStorage.setItem('vendorIsOnline', JSON.stringify(status));
// //         } catch (error) {
// //             console.error('Error saving online status:', error);
// //         }
// //     };

// //     // Separate unfiltered fetch for global stats (runs independently of tab filters)
// //     const fetchStats = useCallback(async () => {
// //         if (!isOnline || !vendorId) return;
// //         try {
// //             const params: GetOrdersParams = {
// //                 page: 1,
// //                 limit: 100, // Higher limit for better stats approx.
// //                 // No status filters for global stats
// //             };
// //             const { orders: rawOrders } = await getOrders(params);
// //             const filteredRawOrders = rawOrders.filter(
// //                 (o: BroadcastedOrder) => !['MISSED', 'REJECTED'].includes(o.status)
// //             );
// //             // Transform minimally for stats
// //             const transformedOrders: VendorOrder[] = filteredRawOrders.map((broadcast: BroadcastedOrder) => {
// //                 const order = broadcast.order;
// //                 return {
// //                     totalAmount: Number(order.totalAmount || 0),
// //                     broadcastStatus: broadcast.status,
// //                 } as VendorOrder; // Partial for stats
// //             });
// //             const pendingOrders = transformedOrders.filter((o) => o.broadcastStatus === 'PENDING');
// //             const acceptedOrders = transformedOrders.filter((o) => o.broadcastStatus === 'ACCEPTED');
// //             setTotalOrders(acceptedOrders.length);
// //             setPendingCount(pendingOrders.length);
// //             setRevenue(
// //                 acceptedOrders.reduce((sum, o) => sum + parseToDecimal(o.totalAmount), 0)
// //             );
// //         } catch (error) {
// //             console.error('Error fetching stats:', error);
// //         }
// //     }, [isOnline, vendorId]);

// //     const fetchOrders = useCallback(async () => {
// //         if (!isOnline || !vendorId) return;
// //         setLoading(true);
// //         try {
// //             const params: GetOrdersParams = {
// //                 page: 1,
// //                 limit: 50,
// //                 // Always fetch unfiltered; filter in frontend
// //             };
// //             const { orders: rawOrders } = await getOrders(params);
// //             // Filter out missed/rejected for display
// //             const filteredRawOrders = rawOrders.filter(
// //                 (o: BroadcastedOrder) => !['MISSED', 'REJECTED'].includes(o.status)
// //             );
// //             // Transform to VendorOrder
// //             const transformedOrders: VendorOrder[] = filteredRawOrders.map((broadcast: BroadcastedOrder) => {
// //                 const order = broadcast.order;
// //                 const itemsStr = order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(', ');
// //                 const distanceKm = haversineDistance(
// //                     vendorLocation.lat,
// //                     vendorLocation.lng,
// //                     order.address?.latitude,
// //                     order.address?.longitude
// //                 );

// //                 let displayDistance = "N/A";
// //                 let etaMin = 0;

// //                 if (distanceKm > 0) {
// //                     // Assume 25 km/h average speed -> 2.4 min per km
// //                     etaMin = Math.max(5, Math.round(distanceKm * 2.4));
// //                     displayDistance = `${distanceKm.toFixed(2)} km • ${etaMin} min`;
// //                 } else {
// //                     displayDistance = "Distance unavailable";
// //                 }

// //                 const distance = displayDistance;

// //                 const backendStatus = order.status;
// //                 const { display: status } = statusMap[backendStatus] || {
// //                     display: backendStatus,
// //                 };
// //                 let action = '';
// //                 let actionColor = 'white';
// //                 let actionBg = COLORS.primary;
// //                 let disabled = false;
// //                 if (broadcast.status === 'PENDING') {
// //                     action = 'Accept';
// //                 } else if (broadcast.status === 'ACCEPTED') {
// //                     if (backendStatus === 'READY_FOR_PICKUP') {
// //                         action = 'Picked Up';
// //                         actionBg = '#E0E0E0';
// //                         actionColor = COLORS.muted;
// //                         disabled = true;
// //                     } else {
// //                         action = 'Ready';
// //                     }
// //                 } else if (backendStatus === 'DELIVERED') {
// //                     action = 'Complete';
// //                     disabled = true;
// //                 }
// //                 return {
// //                     id: order.id,
// //                     orderNumber: order.orderNumber,
// //                     customer: order.user.name,
// //                     receiverName: order.address.receiverName,
// //                     items: itemsStr,
// //                     distance,
// //                     status,
// //                     action,
// //                     actionColor,
// //                     actionBg,
// //                     disabled,
// //                     totalAmount: Number(order.totalAmount || 0),
// //                     broadcastStatus: broadcast.status,
// //                 };
// //             });
// //             setOrders(transformedOrders);
// //         } catch (error) {
// //             console.error('Error fetching orders:', error);
// //             Alert.alert('Error', 'Failed to fetch orders');
// //         } finally {
// //             setLoading(false);
// //         }
// //     }, [isOnline, vendorId]);

// //     // Fetch data when online/vendorId changes
// //     useEffect(() => {
// //         if (isOnline && vendorId) {
// //             fetchStats();
// //             fetchOrders();
// //         }
// //     }, [isOnline, vendorId, fetchStats, fetchOrders]);

// //     const handleNewOrder = useCallback((payload: any) => {
// //         console.log("Received new_order event payload from backend:", payload);
// //         console.log("Order data specifically:", payload?.data);
// //         setSelectedOrder(payload?.data || null);
// //         setModalVisible(true);
// //         fetchStats(); // Refresh stats on new order
// //         fetchOrders(); // Refetch to include new order
// //     }, [fetchStats, fetchOrders]);

// //     // WebSocket setup
// //     useEffect(() => {
// //         if (connected && isOnline) {
// //             wsService.on("new_order", handleNewOrder);
// //         }
// //         return () => {
// //             wsService.off("new_order", handleNewOrder);
// //         };
// //     }, [connected, isOnline, handleNewOrder]);

// //     const toggleOnline = async () => {
// //         if (vendorId) {
// //             try {
// //                 const newStatus = !isOnline;
// //                 await updateVendor(vendorId, { isOpen: newStatus });
// //                 setIsOnline(newStatus);
// //                 await saveOnlineStatus(newStatus);
// //                 if (newStatus) {
// //                     fetchOrders(); // Fetch immediately when going online
// //                     fetchStats();
// //                 }
// //             } catch (error) {
// //                 Alert.alert('Error', 'Failed to update online status');
// //             }
// //         }
// //     };

// //     const handleAccept = async (order: VendorOrder) => {
// //         try {
// //             await acceptOrder(order.id);
// //             Alert.alert('Success', 'Order accepted successfully');
// //             fetchOrders(); // Refetch to update list
// //             fetchStats(); // Refresh stats
// //         } catch (error: any) {
// //             console.error('Accept error:', error);
// //             Alert.alert('Error', error.response?.data?.message || 'Failed to accept order');
// //         }
// //     };

// //     const handleMarkReady = async (order: VendorOrder) => {
// //         try {
// //             await markReady(order.id);
// //             Alert.alert('Success', 'Order marked as ready');
// //             fetchOrders(); // Refetch
// //             fetchStats(); // Refresh stats
// //         } catch (error: any) {
// //             console.error('Mark ready error:', error);
// //             Alert.alert('Error', error.response?.data?.message || 'Failed to mark order ready');
// //         }
// //     };

// //     const handleActionPress = (order: VendorOrder) => {
// //         if (order.disabled) return;
// //         if (order.action === 'Accept') {
// //             handleAccept(order);
// //         } else if (order.action === 'Ready') {
// //             handleMarkReady(order);
// //         }
// //         // Add more actions if needed (e.g., Complete)
// //     };

// //     const getStatusColor = (status: string) => {
// //         return statusMap[status]?.color || COLORS.primary;
// //     };

// //     const getStatusBg = (status: string) => {
// //         return statusMap[status]?.bg || `${COLORS.primary}20`;
// //     };

// //     const renderOnlineContent = () => (
// //         <>
// //             {/* Stats - Horizontal Scroll */}
// //             <ScrollView
// //                 horizontal
// //                 showsHorizontalScrollIndicator={false}
// //                 contentContainerStyle={styles.statsContainer}
// //             >
// //                 <View style={styles.statCard}>
// //                     <View style={styles.statHeader}>
// //                         <MaterialIcons name="receipt-long" size={20} color={COLORS.muted} />
// //                         <Text style={styles.statLabel}>Orders</Text>
// //                     </View>
// //                     <Text style={styles.statValue}>{totalOrders}</Text>
// //                 </View>
// //                 <View style={styles.statCard}>
// //                     <View style={styles.statHeader}>
// //                         <MaterialIcons name="payments" size={20} color={COLORS.muted} />
// //                         <Text style={styles.statLabel}>Revenue</Text>
// //                     </View>
// //                     <Text style={styles.statValue}>₹{revenue.toFixed(0)}</Text>
// //                 </View>
// //                 <View style={styles.statCard}>
// //                     <View style={styles.statHeader}>
// //                         <MaterialIcons name="pending-actions" size={20} color={COLORS.muted} />
// //                         <Text style={styles.statLabel}>Pending</Text>
// //                     </View>
// //                     <Text style={styles.statValue}>{pendingCount}</Text>
// //                 </View>
// //             </ScrollView>
// //             {/* SearchBar - TODO: Implement search logic */}
// //             <View style={styles.searchContainer}>
// //                 <View style={styles.searchInputContainer}>
// //                     <View style={styles.searchIconContainer}>
// //                         <MaterialIcons name="search" size={20} color={COLORS.muted} />
// //                     </View>
// //                     <TextInput
// //                         style={styles.searchInput}
// //                         placeholder="Search orders, customers, items..."
// //                         placeholderTextColor={COLORS.muted}
// //                         value=""
// //                     />
// //                 </View>
// //             </View>
// //             {/* Chips - Show tabs but no filtering */}
// //             <ScrollView
// //                 horizontal
// //                 showsHorizontalScrollIndicator={false}
// //                 contentContainerStyle={styles.chipsContainer}
// //             >
// //                 {['All', 'New', 'Accepted', 'Preparing', 'Ready', 'Delivered'].map((filter) => (
// //                     <TouchableOpacity
// //                         key={filter}
// //                         style={[styles.chip, selectedFilter === filter && styles.activeChip]}
// //                         onPress={() => {
// //                             setSelectedFilter(filter);
// //                         }}
// //                     >
// //                         <Text
// //                             style={[
// //                                 styles.chipText,
// //                                 selectedFilter === filter ? styles.chipTextActive : null,
// //                             ]}
// //                         >
// //                             {filter}
// //                         </Text>
// //                     </TouchableOpacity>
// //                 ))}
// //             </ScrollView>
// //             {/* SectionHeader */}
// //             <View style={styles.sectionHeader}>
// //                 <Text style={styles.sectionTitle}>Active Orders</Text>
// //                 <TouchableOpacity>
// //                     <Text style={styles.seeAllText}>See all</Text>
// //                 </TouchableOpacity>
// //             </View>
// //             {/* Active Orders List - Always show all orders */}
// //             <View style={styles.ordersContainer}>
// //                 {loading ? (
// //                     <Text style={{ textAlign: 'center', padding: 20 }}>Loading...</Text>
// //                 ) : orders.length === 0 ? (
// //                     <Text style={{ textAlign: 'center', padding: 20, color: COLORS.muted }}>No orders found</Text>
// //                 ) : (
// //                     orders.map((order) => (
// //                         <View key={order.id} style={styles.orderCard}>
// //                             <View style={styles.orderHeader}>
// //                                 <View>
// //                                     <Text style={styles.orderId}>Order #{order.orderNumber}</Text>
// //                                     <Text style={styles.customerName}>{order.customer}</Text>
// //                                 </View>
// //                                 <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}>
// //                                     <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
// //                                         {order.status}
// //                                     </Text>
// //                                 </View>
// //                             </View>
// //                             <Text style={styles.orderItems}>{order.items}</Text>
// //                             <View style={styles.orderFooter}>
// //                                 <View style={styles.distanceContainer}>
// //                                     <MaterialIcons name="directions-bike" size={20} color={COLORS.primary} />
// //                                     <Text style={styles.distanceText}>{order.distance}</Text>
// //                                 </View>
// //                                 <View style={styles.actionButtons}>
// //                                     <TouchableOpacity
// //                                         style={[
// //                                             order.disabled ? styles.actionButtonDisabled : styles.actionButton,
// //                                             { backgroundColor: order.actionBg },
// //                                         ]}
// //                                         disabled={order.disabled}
// //                                         onPress={() => handleActionPress(order)}
// //                                     >
// //                                         <Text
// //                                             style={[
// //                                                 styles.actionButtonText,
// //                                                 { color: order.actionColor },
// //                                             ]}
// //                                         >
// //                                             {order.action}
// //                                         </Text>
// //                                     </TouchableOpacity>
// //                                 </View>
// //                             </View>
// //                         </View>
// //                     ))
// //                 )}
// //             </View>
// //         </>
// //     );

// //     const renderOfflineContent = () => (
// //         <View style={styles.offlineContent}>
// //             <MaterialIcons name="wifi-off" size={64} color={COLORS.muted} />
// //             <Text style={styles.offlineTitle}>You are offline</Text>
// //             <Text style={styles.offlineSubtitle}>Go online to accept orders</Text>
// //         </View>
// //     );

// //     return (
// //         <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
// //             <View style={[styles.container, { maxWidth }]}>
// //                 {/* Top App Bar */}
// //                 <View style={styles.header}>
// //                     <View style={styles.headerLeft}>
// //                         <View style={styles.logoContainer}>
// //                             <MaterialIcons name="restaurant" size={20} color={COLORS.textPrimary} />
// //                         </View>
// //                         <Text style={styles.title}>Minta Club</Text>
// //                     </View>
// //                     <View style={styles.headerRight}>
// //                         <TouchableOpacity
// //                             onPress={toggleOnline}
// //                             style={[styles.onlineStatus, { backgroundColor: isOnline ? COLORS.primary : '#F5F5F5' }]}
// //                         >
// //                             <View
// //                                 style={[
// //                                     styles.onlineIndicator,
// //                                     { backgroundColor: isOnline ? COLORS.white : '#E0E0E0' },
// //                                 ]}
// //                             >
// //                                 <MaterialIcons
// //                                     name={isOnline ? 'check' : 'close'}
// //                                     size={12}
// //                                     color={isOnline ? COLORS.primary : COLORS.muted}
// //                                 />
// //                             </View>
// //                             <Text
// //                                 style={[
// //                                     styles.onlineText,
// //                                     { color: isOnline ? COLORS.white : COLORS.textSecondary },
// //                                 ]}
// //                             >
// //                                 {isOnline ? 'Online' : 'Offline'}
// //                             </Text>
// //                         </TouchableOpacity>
// //                         <Image
// //                             style={styles.profileImage}
// //                             source={{
// //                                 uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAScI9pkc7_c9MtCKhutLsut8y5VqkQ7Gl0UFkE5kMGChxEdvgzcRoQVPbGAchBKUhwwWmPJyRET1vMBeIxC_Q9pWLkLbHRuJkymbgqnJiEMwp0xmeGgg2EuELBWVGoPoBjY_jWKCHRNMcQGcNW42otpgIBWNeZ7aRa0GNjjclofJv4iWu1H5B4ie385NziZOMNJeBI4T9nkHiPt1l3iN084_sQh-ajt2Vjtq5QRqZgvyxElxmTJJvnK46halJI2KwS4rOYlfgmFwSM',
// //                             }}
// //                             resizeMode="cover"
// //                         />
// //                     </View>
// //                 </View>
// //                 {/* Main Content */}
// //                 <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
// //                     {isOnline ? renderOnlineContent() : renderOfflineContent()}
// //                     {/* Add padding to prevent cutting at bottom */}
// //                     <View style={{ height: 100 }} />
// //                 </ScrollView>
// //                 {/* NewOrderModal */}
// //                 <NewOrderModal
// //                     visible={modalVisible}
// //                     currentOrder={selectedOrder}
// //                     onDismiss={() => {
// //                         setModalVisible(false);
// //                         setSelectedOrder(null);
// //                     }}
// //                     onAccept={async () => {
// //                         if (selectedOrder) {
// //                             try {
// //                                 await acceptOrder(selectedOrder.id);
// //                                 Alert.alert('Success', 'Order accepted successfully');
// //                             } catch (error: any) {
// //                                 console.error('Accept error:', error);
// //                                 Alert.alert('Error', error.response?.data?.message || 'Failed to accept order');
// //                             }
// //                         }
// //                         setModalVisible(false);
// //                         setSelectedOrder(null);
// //                         fetchOrders();
// //                         fetchStats();
// //                     }}
// //                     onReject={() => {
// //                         setModalVisible(false);
// //                         setSelectedOrder(null);
// //                     }}
// //                 />
// //             </View>
// //         </SafeAreaView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     safeArea: {
// //         flex: 1,
// //         backgroundColor: COLORS.background,
// //     },
// //     container: {
// //         flex: 1,
// //         flexDirection: 'column',
// //         backgroundColor: COLORS.background,
// //         overflow: 'hidden',
// //     },
// //     header: {
// //         position: 'relative',
// //         zIndex: 10,
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         gap: 16,
// //         backgroundColor: COLORS.background,
// //         paddingHorizontal: 16,
// //         paddingBottom: 12,
// //         paddingTop: Platform.OS === 'android' ? 4 : 0,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 1 },
// //         shadowOpacity: 0.05,
// //         shadowRadius: 2,
// //         elevation: 2,
// //     },
// //     headerLeft: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 12,
// //     },
// //     logoContainer: {
// //         width: 40,
// //         height: 40,
// //         borderRadius: 20,
// //         backgroundColor: COLORS.secondary,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     title: {
// //         color: COLORS.textPrimary,
// //         fontSize: 20,
// //         fontWeight: '700',
// //         fontFamily: FONTS.heading,
// //         letterSpacing: -0.25,
// //     },
// //     headerRight: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 16,
// //     },
// //     onlineStatus: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         height: 32,
// //         borderRadius: 16,
// //         paddingHorizontal: 4,
// //     },
// //     onlineIndicator: {
// //         width: 24,
// //         height: 24,
// //         borderRadius: 12,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 1 },
// //         shadowOpacity: 0.2,
// //         shadowRadius: 1,
// //         elevation: 2,
// //     },
// //     onlineText: {
// //         marginLeft: 4,
// //         fontSize: 12,
// //         fontWeight: '500',
// //     },
// //     profileImage: {
// //         width: 36,
// //         height: 36,
// //         borderRadius: 18,
// //     },
// //     main: {
// //         flex: 1,
// //     },
// //     offlineContent: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         padding: 32,
// //         gap: 16,
// //     },
// //     offlineTitle: {
// //         color: COLORS.textPrimary,
// //         fontSize: 24,
// //         fontWeight: '700',
// //         textAlign: 'center',
// //     },
// //     offlineSubtitle: {
// //         color: COLORS.textSecondary,
// //         fontSize: 16,
// //         textAlign: 'center',
// //     },
// //     statsContainer: {
// //         flexDirection: 'row',
// //         gap: 12,
// //         padding: 16,
// //     },
// //     statCard: {
// //         minWidth: 100,
// //         flexDirection: 'column',
// //         gap: 8,
// //         backgroundColor: COLORS.white,
// //         borderRadius: 12,
// //         padding: 16,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 1 },
// //         shadowOpacity: 0.05,
// //         shadowRadius: 2,
// //         elevation: 1,
// //     },
// //     statHeader: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 8,
// //     },
// //     statLabel: {
// //         color: COLORS.textSecondary,
// //         fontSize: 14,
// //         fontWeight: '500',
// //     },
// //     statValue: {
// //         color: COLORS.textPrimary,
// //         letterSpacing: -0.5,
// //         fontSize: 30,
// //         fontWeight: '700',
// //     },
// //     searchContainer: {
// //         paddingHorizontal: 16,
// //         paddingVertical: 8,
// //     },
// //     searchInputContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'stretch',
// //         borderRadius: 9999,
// //         height: 56,
// //         backgroundColor: COLORS.white,
// //     },
// //     searchIconContainer: {
// //         backgroundColor: COLORS.white,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         paddingLeft: 20,
// //         borderTopLeftRadius: 9999,
// //         borderBottomLeftRadius: 9999,
// //     },
// //     searchInput: {
// //         flex: 1,
// //         minWidth: 0,
// //         backgroundColor: COLORS.white,
// //         paddingHorizontal: 16,
// //         paddingLeft: 8,
// //         borderTopRightRadius: 9999,
// //         borderBottomRightRadius: 9999,
// //         fontSize: 16,
// //         color: COLORS.textPrimary,
// //     },
// //     chipsContainer: {
// //         paddingHorizontal: 16,
// //         paddingVertical: 12,
// //         gap: 12,
// //     },
// //     chip: {
// //         height: 40,
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         paddingHorizontal: 20,
// //         backgroundColor: COLORS.white,
// //         borderRadius: 9999,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 1 },
// //         shadowOpacity: 0.05,
// //         shadowRadius: 2,
// //         elevation: 1,
// //     },
// //     activeChip: {
// //         backgroundColor: COLORS.primary,
// //     },
// //     chipText: {
// //         color: COLORS.textPrimary,
// //         fontSize: 14,
// //         fontWeight: '500',
// //     },
// //     chipTextActive: {
// //         color: COLORS.white,
// //         fontSize: 14,
// //         fontWeight: '500',
// //     },
// //     sectionHeader: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         paddingHorizontal: 16,
// //         paddingBottom: 8,
// //         paddingTop: 16,
// //     },
// //     sectionTitle: {
// //         color: COLORS.textPrimary,
// //         fontSize: 20,
// //         fontWeight: '700',
// //         fontFamily: FONTS.heading,
// //         letterSpacing: -0.25,
// //     },
// //     seeAllText: {
// //         color: COLORS.primary,
// //         fontSize: 14,
// //         fontWeight: '500',
// //     },
// //     ordersContainer: {
// //         flexDirection: 'column',
// //         gap: 16,
// //         padding: 16,
// //         paddingTop: 8,
// //         paddingBottom: 100,
// //     },
// //     orderCard: {
// //         flexDirection: 'column',
// //         gap: 16,
// //         backgroundColor: COLORS.white,
// //         borderRadius: 12,
// //         padding: 16,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.1,
// //         shadowRadius: 4,
// //         elevation: 3,
// //     },
// //     orderHeader: {
// //         flexDirection: 'row',
// //         alignItems: 'flex-start',
// //         justifyContent: 'space-between',
// //     },
// //     orderId: {
// //         color: COLORS.muted,
// //         fontSize: 14,
// //         fontWeight: '500',
// //     },
// //     customerName: {
// //         color: COLORS.textPrimary,
// //         fontSize: 18,
// //         fontWeight: '700',
// //     },
// //     statusBadge: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         gap: 6,
// //         height: 28,
// //         paddingHorizontal: 12,
// //         borderRadius: 14,
// //     },
// //     statusText: {
// //         fontSize: 12,
// //         fontWeight: '700',
// //     },
// //     orderItems: {
// //         color: COLORS.textSecondary,
// //         fontSize: 14,
// //     },
// //     orderFooter: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         borderTopWidth: 1,
// //         borderTopColor: '#E0E0E0',
// //         paddingTop: 16,
// //     },
// //     distanceContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 8,
// //     },
// //     distanceText: {
// //         color: COLORS.textPrimary,
// //         fontSize: 14,
// //         fontWeight: '500',
// //     },
// //     actionButtons: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 12,
// //     },
// //     actionButton: {
// //         height: 40,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         borderRadius: 20,
// //         paddingHorizontal: 24,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.1,
// //         shadowRadius: 4,
// //         elevation: 3,
// //     },
// //     actionButtonDisabled: {
// //         height: 40,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         borderRadius: 20,
// //         paddingHorizontal: 24,
// //     },
// //     actionButtonText: {
// //         fontSize: 14,
// //         fontWeight: '700',
// //     },
// // });

// // export default VendorHome;



// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Switch,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const { width } = Dimensions.get('window');

// const COLORS = {
//   primary: '#9235D0',
//   secondary: '#f9eae9',
//   accent: '#b58ff0',
//   highlight: '#ff9fa3',
//   background: '#fafafa',
//   white: '#ffffff',
//   textPrimary: '#222222',
//   textSecondary: '#4a4a4a',
//   muted: '#888888',
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   topBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//     backgroundColor: 'rgba(248, 250, 252, 0.8)',
//     padding: 16,
//   },
//   logoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   logoIcon: {
//     fontSize: 24,
//     color: COLORS.textPrimary,
//   },
//   storeName: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.textPrimary,
//   },
//   headerButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     padding: 16,
//     gap: 24,
//   },
//   storeStatusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     padding: 20,
//   },
//   storeStatusText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.textPrimary,
//   },
//   storeTimings: {
//     fontSize: 16,
//     color: COLORS.textSecondary,
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 32,
//     width: 56,
//     borderRadius: 16,
//     backgroundColor: '#f1f5f9',
//     padding: 4,
//   },
//   toggleThumb: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: COLORS.white,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.textPrimary,
//     paddingHorizontal: 4,
//     paddingBottom: 12,
//     paddingTop: 8,
//   },
//   summaryContainer: {
//     flexDirection: 'row',
//     paddingBottom: 8,
//   },
//   summaryCard: {
//     minWidth: 150,
//     flex: 1,
//     flexDirection: 'column',
//     gap: 8,
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     padding: 16,
//   },
//   summaryIcon: {
//     fontSize: 24,
//     color: COLORS.primary,
//   },
//   summaryLabel: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//   },
//   summaryValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.textPrimary,
//   },
//   activeOrdersTabs: {
//     flexDirection: 'row',
//     borderBottomWidth: 2,
//     borderBottomColor: '#e2e8f0',
//   },
//   tab: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     marginRight: 4,
//   },
//   tabActive: {
//     borderBottomWidth: 2,
//     borderBottomColor: COLORS.primary,
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   tabTextInactive: {
//     fontWeight: '500',
//     color: COLORS.textSecondary,
//   },
//   orderCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     padding: 16,
//     gap: 16,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//   },
//   orderId: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.textPrimary,
//   },
//   customerName: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 999,
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   statusNew: {
//     backgroundColor: 'rgba(22, 163, 74, 0.1)',
//     color: '#16a34a',
//   },
//   statusPreparing: {
//     backgroundColor: 'rgba(249, 115, 22, 0.1)',
//     color: '#f97316',
//   },
//   statusReady: {
//     backgroundColor: 'rgba(135, 53, 208, 0.1)',
//     color: COLORS.primary,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   itemIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9',
//   },
//   itemIconColor: {
//     color: COLORS.muted,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.textPrimary,
//   },
//   itemDetails: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//   },
//   footerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//     paddingTop: 12,
//   },
//   distanceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     fontSize: 14,
//     color: COLORS.textSecondary,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     fontSize: 14,
//     color: COLORS.textSecondary,
//   },
//   price: {
//     fontWeight: 'bold',
//     color: COLORS.textPrimary,
//   },
//   viewDetailsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 999,
//     backgroundColor: 'transparent',
//   },
//   viewDetailsText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.primary,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   actionButton: {
//     flex: 1,
//     height: 44,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   rejectButton: {
//     backgroundColor: '#f1f5f9',
//     color: COLORS.textPrimary,
//   },
//   acceptButton: {
//     backgroundColor: '#16a34a',
//     color: COLORS.white,
//   },
//   readyButton: {
//     backgroundColor: COLORS.primary,
//     color: COLORS.white,
//   },
//   markDeliveredButton: {
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     backgroundColor: 'transparent',
//     color: COLORS.primary,
//   },
// });

// const VendorDashboard: React.FC = () => {
//   const [storeOpen, setStoreOpen] = useState(true);
//   const [activeTab, setActiveTab] = useState('All');

//   const tabs = [
//     { label: 'All (3)', active: true },
//     { label: 'New (1)', active: false },
//     { label: 'Preparing (1)', active: false },
//     { label: 'Ready (1)', active: false },
//     { label: 'Delivered', active: false },
//   ];

//   const orders = [
//     {
//       id: 'OD128945',
//       customer: 'Arjun Sharma',
//       status: 'New',
//       items: [
//         { icon: 'kebab-dining', name: 'Chicken Curry Cut', details: '1 kg x ₹180' },
//         { icon: 'restaurant', name: 'Mutton Chops', details: '500 g x ₹350' },
//       ],
//       distance: '2.1 km',
//       price: '₹530',
//     },
//     {
//       id: 'OD128942',
//       customer: 'Priya Patel',
//       status: 'Preparing',
//       items: [
//         { icon: 'set-meal', name: 'Fish Tikka', details: '250 g x ₹250' },
//       ],
//       distance: '4.5 km',
//       price: '₹250',
//     },
//     {
//       id: 'OD128939',
//       customer: 'Rohan Singh',
//       status: 'Ready',
//       items: [
//         { icon: 'tapas', name: 'Chicken Seekh Kebab', details: '8 pcs x ₹220' },
//       ],
//       distance: '1.2 km',
//       price: '₹220',
//     },
//   ];

//   const renderStatusBadge = (status: string) => {
//     let style, color;
//     switch (status) {
//       case 'New':
//         style = styles.statusNew;
//         color = '#16a34a';
//         break;
//       case 'Preparing':
//         style = styles.statusPreparing;
//         color = '#f97316';
//         break;
//       case 'Ready':
//         style = styles.statusReady;
//         color = COLORS.primary;
//         break;
//       default:
//         return null;
//     }
//     return (
//       <View style={[styles.statusBadge, style]}>
//         <Text style={{ color }}>{status}</Text>
//       </View>
//     );
//   };

//   const renderItem = (item: any) => (
//     <View key={item.name} style={styles.itemRow}>
//       <View style={[styles.itemIcon, { backgroundColor: '#f1f5f9' }]}>
//         <Icon name={item.icon} size={20} color={COLORS.muted} />
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.itemName}>{item.name}</Text>
//         <Text style={styles.itemDetails}>{item.details}</Text>
//       </View>
//     </View>
//   );

//   const renderOrderCard = (order: any) => (
//     <View style={styles.orderCard}>
//       <View style={styles.orderHeader}>
//         <View>
//           <Text style={styles.orderId}>#{order.id}</Text>
//           <Text style={styles.customerName}>{order.customer}</Text>
//         </View>
//         {renderStatusBadge(order.status)}
//       </View>
//       <View style={{ gap: 12 }}>
//         {order.items.map(renderItem)}
//       </View>
//       <View style={styles.footerRow}>
//         <View style={styles.distanceContainer}>
//           <Icon name="pin-drop" size={16} color={COLORS.textSecondary} />
//           <Text>{order.distance}</Text>
//         </View>
//         <View style={styles.priceContainer}>
//           <Icon name="currency-rupee" size={16} color={COLORS.textSecondary} />
//           <Text style={styles.price}>{order.price}</Text>
//         </View>
//         <TouchableOpacity style={styles.viewDetailsButton}>
//           <Text style={styles.viewDetailsText}>View Details</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.actionButtons}>
//         {order.status === 'New' ? (
//           <>
//             <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
//               <Text style={styles.rejectButton}>Reject</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
//               <Text style={styles.acceptButton}>Accept</Text>
//             </TouchableOpacity>
//           </>
//         ) : order.status === 'Preparing' ? (
//           <TouchableOpacity style={[styles.actionButton, styles.readyButton]}>
//             <Text style={styles.readyButton}>Ready for Pickup</Text>
//           </TouchableOpacity>
//         ) : order.status === 'Ready' ? (
//           <TouchableOpacity style={[styles.actionButton, styles.markDeliveredButton]}>
//             <Text style={styles.markDeliveredButton}>Mark as Delivered</Text>
//           </TouchableOpacity>
//         ) : null}
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Top Bar */}
//       <View style={styles.topBar}>
//         <View style={styles.logoContainer}>
//           <Icon name="storefront" style={styles.logoIcon} />
//           <Text style={styles.storeName}>Meat & Greet</Text>
//         </View>
//         <View style={styles.headerButtons}>
//           <TouchableOpacity style={styles.headerButton}>
//             <Icon name="notifications" size={20} color={COLORS.textPrimary} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.headerButton}>
//             <Icon name="account-circle" size={20} color={COLORS.textPrimary} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={styles.content}>
//         {/* Store Status */}
//         <View style={styles.storeStatusContainer}>
//           <View style={{ gap: 4 }}>
//             <Text style={styles.storeStatusText}>Your Store is OPEN</Text>
//             <Text style={styles.storeTimings}>Today's Timings: 9 AM - 10 PM</Text>
//           </View>
//           <View style={styles.toggleContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.toggleThumb,
//                 { transform: [{ translateX: storeOpen ? 24 : 0 }] },
//               ]}
//               onPress={() => setStoreOpen(!storeOpen)}
//             />
//           </View>
//         </View>

//         {/* Today's Summary */}
//         <View>
//           <Text style={styles.sectionTitle}>Today's Summary</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
//             <View style={{ flexDirection: 'row', gap: 16 }}>
//               <View style={styles.summaryCard}>
//                 <Icon name="shopping-cart" style={styles.summaryIcon} />
//                 <Text style={styles.summaryLabel}>Total Orders</Text>
//                 <Text style={styles.summaryValue}>142</Text>
//               </View>
//               <View style={styles.summaryCard}>
//                 <Icon name="payments" style={[styles.summaryIcon, { color: '#16a34a' }]} />
//                 <Text style={styles.summaryLabel}>Sales</Text>
//                 <Text style={styles.summaryValue}>₹8,450</Text>
//               </View>
//               <View style={styles.summaryCard}>
//                 <Icon name="fiber-new" style={[styles.summaryIcon, { color: '#f97316' }]} />
//                 <Text style={styles.summaryLabel}>New Orders</Text>
//                 <Text style={styles.summaryValue}>5</Text>
//               </View>
//               <View style={styles.summaryCard}>
//                 <Icon name="task-alt" style={[styles.summaryIcon, { color: COLORS.textSecondary }]} />
//                 <Text style={styles.summaryLabel}>Completed</Text>
//                 <Text style={styles.summaryValue}>68</Text>
//               </View>
//             </View>
//           </ScrollView>
//         </View>

//         {/* Active Orders Tabs */}
//         <View>
//           <Text style={styles.sectionTitle}>Active Orders</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeOrdersTabs}>
//             <View style={{ flexDirection: 'row' }}>
//               {tabs.map((tab, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   style={[styles.tab, tab.active && styles.tabActive]}
//                   onPress={() => setActiveTab(tab.label)}
//                 >
//                   <Text style={[styles.tabText, !tab.active && styles.tabTextInactive]}>
//                     {tab.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </ScrollView>
//         </View>

//         {/* Orders List */}
//         <View style={{ gap: 16 }}>
//           {orders.map(renderOrderCard)}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default VendorDashboard;











import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { useVendorBroadcastedOrders } from '../../hooks/useOrder';
import { formatDistanceToNow } from 'date-fns';
import { VendorBroadcastItem, OrderStatus, BroadcastStatus } from '../../types/order.types';
import { AppNavigation } from '../../types/types';

interface OrderModalProps {
    order: VendorBroadcastItem;
    visible: boolean;
    onClose: () => void;
    onAction?: (action: 'accept' | 'reject' | 'markReady', orderId: string) => void;
}

const OrderDetailModal: React.FC<OrderModalProps> = ({ order: broadcast, visible, onClose, onAction }) => {
    const { order } = broadcast;
    const handleAction = (action: 'accept' | 'reject' | 'markReady') => {
        onAction?.(action, order.id);
        onClose();
    };

    if (!visible) return null;

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.VENDOR_PENDING:
                return '#16a34a';
            case OrderStatus.PREPARING:
                return '#f97316';
            case OrderStatus.READY_FOR_PICKUP:
                return COLORS.primary;
            case OrderStatus.DELIVERED:
                return '#10b981';
            default:
                return COLORS.textSecondary;
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
                    <View style={[styles.modalHeader, { backgroundColor: getStatusColor(order.status) }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <View style={styles.modalBodyContent}>
                            <View style={[styles.iconCircleLarge, { backgroundColor: getStatusColor(order.status) }]}>
                                <Icon name="shopping-cart" size={40} color={COLORS.white} />
                            </View>
                            <Text style={styles.modalTitle}>Order #{order.orderNumber}</Text>
                            <Text style={styles.modalBodyText}>Status: {order.status}</Text>
                            <View style={styles.infoRow}>
                                <View style={styles.timeContainer}>
                                    <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                                    <Text style={styles.modalTime}>{formatDistanceToNow(new Date(order.timestamps.placedAt), { addSuffix: true })}</Text>
                                </View>
                                <View style={[styles.typeContainer, { backgroundColor: getStatusColor(order.status) + '10' }]}>
                                    <Text style={[styles.modalType, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                                </View>
                            </View>
                            <View style={styles.dataSection}>
                                <Text style={styles.sectionTitle}>Items</Text>
                                {order.items.map((item) => (
                                    <View key={item.id} style={styles.dataItem}>
                                        <Text style={styles.dataKey}>{item.product.name}</Text>
                                        <Text style={styles.dataValue}>
                                            Qty: {item.quantity} - ₹{item.totalPrice.toFixed(2)}
                                            {item.notes && ` | ${item.notes}`}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.dataSection}>
                                <Text style={styles.sectionTitle}>Order Details</Text>
                                <View style={styles.dataItem}>
                                    <Text style={styles.dataKey}>Subtotal</Text>
                                    <Text style={styles.dataValue}>₹{order.subtotal.toFixed(2)}</Text>
                                </View>
                                <View style={styles.dataItem}>
                                    <Text style={styles.dataKey}>Delivery Fee</Text>
                                    <Text style={styles.dataValue}>₹{order.deliveryFee.toFixed(2)}</Text>
                                </View>
                                <View style={styles.dataItem}>
                                    <Text style={styles.dataKey}>Total</Text>
                                    <Text style={styles.dataValue}>₹{order.paidAmount?.toFixed(2) || order.subtotal.toFixed(2)}</Text>
                                </View>
                                {/* Add more fields like address, payment if available */}
                            </View>
                            {broadcast.status === BroadcastStatus.PENDING && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleAction('reject')}>
                                        <Text style={styles.rejectButton}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleAction('accept')}>
                                        <Text style={styles.acceptButton}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {order.status === OrderStatus.PREPARING && (
                                <TouchableOpacity style={[styles.actionButton, styles.readyButton]} onPress={() => handleAction('markReady')}>
                                    <Text style={styles.readyButton}>Mark as Ready</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const VendorDashboard = ({navigation}: AppNavigation) => {
    const [storeOpen, setStoreOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'preparing' | 'ready' | 'delivered'>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<VendorBroadcastItem | null>(null);

    const tabs = [
        { key: 'all' as const, label: 'All' },
        { key: 'new' as const, label: 'New' },
        { key: 'preparing' as const, label: 'Preparing' },
        { key: 'ready' as const, label: 'Ready' },
        { key: 'delivered' as const, label: 'Delivered' },
    ];

    const tabToFilter = useMemo(() => ({
        all: undefined,
        new: { broadcastStatus: BroadcastStatus.PENDING },
        preparing: { orderStatus: OrderStatus.PREPARING },
        ready: { orderStatus: OrderStatus.READY_FOR_PICKUP },
        delivered: { orderStatus: OrderStatus.DELIVERED },
    }), []);

    const queryParams = useMemo(() => tabToFilter[activeTab], [activeTab, tabToFilter]);

    const { data: queryData, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error } = useVendorBroadcastedOrders(queryParams || {});

    const broadcasts = useMemo(() => queryData?.pages.flatMap(page => page.data.broadcasts) || [], [queryData]);

    const handleOrderPress = useCallback((broadcast: VendorBroadcastItem) => {
        setSelectedOrder(broadcast);
        setModalVisible(true);
    }, []);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderEmptyComponent = useCallback(() => {
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
                    <Icon name="shopping-cart" size={64} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptySubtitle}>Your orders will appear here once customers place them.</Text>
            </View>
        );
    }, [isLoading]);

    const renderStatusBadge = useCallback((status: OrderStatus | BroadcastStatus) => {
        let style, color, label;
        switch (status) {
            case OrderStatus.VENDOR_PENDING:
            case BroadcastStatus.PENDING:
                style = styles.statusNew;
                color = '#16a34a';
                label = 'New';
                break;
            case OrderStatus.PREPARING:
                style = styles.statusPreparing;
                color = '#f97316';
                label = 'Preparing';
                break;
            case OrderStatus.READY_FOR_PICKUP:
                style = styles.statusReady;
                color = COLORS.primary;
                label = 'Ready';
                break;
            case OrderStatus.DELIVERED:
                style = styles.statusNew;
                color = '#10b981';
                label = 'Delivered';
                break;
            default:
                return null;
        }
        return (
            <View style={[styles.statusBadge, style]}>
                <Text style={{ color, fontWeight: '800' }}>{label}</Text>
            </View>
        );
    }, []);

    const renderItemCard = useCallback(({ item: broadcast }: { item: VendorBroadcastItem }) => {
        const { order } = broadcast;
        const isPending = broadcast.status === BroadcastStatus.PENDING;
        const itemsPreview = order.items.slice(0, 2);
        const moreItems = order.items.length > 2 ? `+${order.items.length - 2}` : '';

        return (
            <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(broadcast)}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>#{order.orderNumber}</Text>
                        <Text style={styles.customerName}>Customer Order</Text>
                    </View>
                    {renderStatusBadge(order.status)}
                </View>
                <View style={{ gap: 12 }}>
                    {itemsPreview.map((item) => (
                        <View key={item.id} style={[styles.itemRow, { marginBottom: 12 }]}>
                            <View style={[styles.itemIcon, { backgroundColor: '#f1f5f9' }]}>
                                <Icon name="restaurant" size={20} color={COLORS.muted} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.product.name}</Text>
                                <Text style={styles.itemDetails}>Qty: {item.quantity}</Text>
                            </View>
                            <Text style={styles.itemPrice}>₹{item.totalPrice.toFixed(2)}</Text>
                        </View>
                    ))}
                    {moreItems && (
                        <Text style={styles.itemDetails}>{moreItems} more items</Text>
                    )}
                </View>
                <View style={styles.footerRow}>
                    <View style={styles.distanceContainer}>
                        <Icon name="pin-drop" size={16} color={COLORS.textSecondary} />
                        <Text>2.1 km</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Icon name="currency-rupee" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.price}>₹{order.subtotal.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewDetailsButton}>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.actionButtons}>
                    {isPending ? (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
                                <Text style={styles.rejectButton}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
                                <Text style={styles.acceptButton}>Accept</Text>
                            </TouchableOpacity>
                        </>
                    ) : order.status === OrderStatus.PREPARING ? (
                        <TouchableOpacity style={[styles.actionButton, styles.readyButton]}>
                            <Text style={styles.readyButton}>Ready for Pickup</Text>
                        </TouchableOpacity>
                    ) : order.status === OrderStatus.READY_FOR_PICKUP ? (
                        <TouchableOpacity style={[styles.actionButton, styles.markDeliveredButton]}>
                            <Text style={styles.markDeliveredButton}>Mark Delivered</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    }, [renderStatusBadge, handleOrderPress]);

    const handleOrderAction = useCallback((action: 'accept' | 'reject' | 'markReady', orderId: string) => {
        // TODO: Implement mutation (e.g., api.post(`/vendor/order/${action}-order/${orderId}`))
        console.log(`Action: ${action} for order ${orderId}`);
        // Invalidate and refetch after success
    }, []);

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Error loading orders: {error.message}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.logoContainer}>
                    <Icon name="storefront" style={styles.logoIcon} />
                    <Text style={styles.storeName}>Meat & Greet</Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("Notification")}>
                        <Icon name="notifications" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="account-circle" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Store Status */}
                <View style={styles.storeStatusContainer}>
                    <View style={{ gap: 4 }}>
                        <Text style={styles.storeStatusText}>Your Store is {storeOpen ? 'OPEN' : 'CLOSED'}</Text>
                        <Text style={styles.storeTimings}>Today's Timings: 9 AM - 10 PM</Text>
                    </View>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleThumb,
                                { transform: [{ translateX: storeOpen ? 24 : 0 }] },
                            ]}
                            onPress={() => setStoreOpen(!storeOpen)}
                        />
                    </View>
                </View>

                {/* Today's Summary */}
                <View>
                    <Text style={styles.sectionTitle}>Today's Summary</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View style={styles.summaryCard}>
                                <Icon name="shopping-cart" style={styles.summaryIcon} />
                                <Text style={styles.summaryLabel}>Total Orders</Text>
                                <Text style={styles.summaryValue}>142</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Icon name="payments" style={[styles.summaryIcon, { color: '#16a34a' }]} />
                                <Text style={styles.summaryLabel}>Sales</Text>
                                <Text style={styles.summaryValue}>₹8,450</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Icon name="fiber-new" style={[styles.summaryIcon, { color: '#f97316' }]} />
                                <Text style={styles.summaryLabel}>New Orders</Text>
                                <Text style={styles.summaryValue}>5</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Icon name="task-alt" style={[styles.summaryIcon, { color: COLORS.textSecondary }]} />
                                <Text style={styles.summaryLabel}>Completed</Text>
                                <Text style={styles.summaryValue}>68</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Active Orders Tabs */}
                <View>
                    <Text style={styles.sectionTitle}>Active Orders</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeOrdersTabs}>
                        <View style={{ flexDirection: 'row' }}>
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[
                                        styles.tab,
                                        activeTab === tab.key && styles.tabActive,
                                    ]}
                                    onPress={() => setActiveTab(tab.key)}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        activeTab !== tab.key && styles.tabTextInactive,
                                    ]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Orders List - Using FlatList for infinite scroll */}
                <FlatList
                    data={broadcasts}
                    renderItem={renderItemCard}
                    keyExtractor={(item) => item.id}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.1}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.mainContent}
                    ListEmptyComponent={renderEmptyComponent}
                    ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 20 }} /> : null}
                />

                <View style={{ height: 100 }} />
            </ScrollView>

            {modalVisible && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedOrder(null);
                    }}
                    onAction={handleOrderAction}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        padding: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        fontSize: 24,
        color: COLORS.textPrimary,
    },
    storeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        gap: 24,
    },
    storeStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 20,
    },
    storeStatusText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    storeTimings: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        width: 56,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        padding: 4,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        paddingHorizontal: 4,
        paddingBottom: 12,
        paddingTop: 8,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingBottom: 8,
    },
    summaryCard: {
        minWidth: 150,
        flex: 1,
        flexDirection: 'column',
        gap: 8,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
    },
    summaryIcon: {
        fontSize: 24,
        color: COLORS.primary,
    },
    summaryLabel: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    activeOrdersTabs: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#e2e8f0',
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 4,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
    },
    tabTextInactive: {
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        gap: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    customerName: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: '800',
    },
    statusNew: {
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        color: '#16a34a',
    },
    statusPreparing: {
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        color: '#f97316',
    },
    statusReady: {
        backgroundColor: 'rgba(135, 53, 208, 0.1)',
        color: COLORS.primary,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    itemIconColor: {
        color: COLORS.muted,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    itemDetails: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 12,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    price: {
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'transparent',
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: '800',
    },
    rejectButton: {
        backgroundColor: '#f1f5f9',
        color: COLORS.textPrimary,
        fontWeight: "900"
    },
    acceptButton: {
        backgroundColor: '#16a34a',
        color: COLORS.white,
        fontWeight: "900"
    },
    readyButton: {
        backgroundColor: COLORS.primary,
        color: COLORS.white,
        fontWeight: "900"
    },
    markDeliveredButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
        color: COLORS.primary,
        fontWeight: "900"
    },
    mainContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
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
});

export default VendorDashboard;