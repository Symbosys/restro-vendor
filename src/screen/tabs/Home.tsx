// Updated VendorHome.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from "../../theme/color"
import NewOrderModal from '../../components/orers/NewOrderModal';

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

const sampleOrders = [
    {
        id: '3456',
        customer: 'Alex Johnson',
        items: '1x Butter Chicken, 2x Garlic Naan, 1x Coke',
        distance: '3.2 km • 12 min',
        status: 'New',
        action: 'Accept',
        actionColor: 'white',
        actionBg: COLORS.primary,
        disabled: false,
    },
    {
        id: '3455',
        customer: 'Samantha Bee',
        items: '2x Paneer Tikka, 1x Veg Biryani',
        distance: '1.8 km • 8 min',
        status: 'Preparing',
        action: 'Ready',
        actionColor: 'white',
        actionBg: COLORS.primary,
        disabled: false,
    },
    {
        id: '3454',
        customer: 'Chris Evans',
        items: '1x Chicken Tandoori, 3x Roti',
        distance: '5.1 km • 20 min',
        status: 'Ready',
        action: 'Picked Up',
        actionColor: COLORS.muted,
        actionBg: '#E0E0E0',
        disabled: true,
    },
    // Additional sample orders for other statuses
    {
        id: '3457',
        customer: 'Jordan Lee',
        items: '1x Lamb Curry, 1x Rice',
        distance: '2.5 km • 10 min',
        status: 'Delivered',
        action: 'Complete',
        actionColor: 'white',
        actionBg: COLORS.primary,
        disabled: false,
    },
];

const VendorHome: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<string>('All');
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const filteredOrders = sampleOrders.filter(order =>
        selectedFilter === 'All' ? true : order.status === selectedFilter
    );

    useEffect(() => {
        if (isOnline) {
            const interval = setInterval(() => {
                setModalVisible(true);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isOnline]);

    const toggleOnline = () => {
        setIsOnline(!isOnline);
    };

    const handleAccept = () => {
        setModalVisible(false);
        // Handle accept logic
    };

    const handleReject = () => {
        setModalVisible(false);
        // Handle reject logic
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New':
                return COLORS.highlight;
            case 'Preparing':
                return '#FFC107'; // Fallback for preparing if not in theme
            case 'Ready':
                return '#4CAF50'; // Fallback for ready
            case 'Delivered':
                return COLORS.primary;
            default:
                return COLORS.primary;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'New':
                return COLORS.highlight + '20';
            case 'Preparing':
                return '#FFC10720';
            case 'Ready':
                return '#4CAF5040';
            case 'Delivered':
                return COLORS.primary + '20';
            default:
                return COLORS.primary + '20';
        }
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
                    <Text style={styles.statValue}>42</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <MaterialIcons name="payments" size={20} color={COLORS.muted} />
                        <Text style={styles.statLabel}>Revenue</Text>
                    </View>
                    <Text style={styles.statValue}>$856</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <MaterialIcons name="pending-actions" size={20} color={COLORS.muted} />
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <Text style={styles.statValue}>5</Text>
                </View>
            </ScrollView>

            {/* SearchBar */}
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

            {/* Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
            >
                {['All', 'New', 'Preparing', 'Ready', 'Delivered'].map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.chip,
                            selectedFilter === filter && styles.activeChip,
                        ]}
                        onPress={() => setSelectedFilter(filter)}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedFilter === filter ? styles.chipTextActive : null,
                        ]}>
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

            {/* Active Orders List */}
            <View style={styles.ordersContainer}>
                {filteredOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <View>
                                <Text style={styles.orderId}>Order #{order.id}</Text>
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
                                        { backgroundColor: order.actionBg }
                                    ]}
                                    disabled={order.disabled}
                                >
                                    <Text style={[
                                        styles.actionButtonText,
                                        { color: order.actionColor }
                                    ]}>
                                        {order.action}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
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
                        <TouchableOpacity onPress={toggleOnline} style={[
                            styles.onlineStatus,
                            { backgroundColor: isOnline ? COLORS.primary : '#F5F5F5' }
                        ]}>
                            <View style={[
                                styles.onlineIndicator,
                                { backgroundColor: isOnline ? COLORS.white : '#E0E0E0' }
                            ]}>
                                <MaterialIcons
                                    name={isOnline ? 'check' : 'close'}
                                    size={12}
                                    color={isOnline ? COLORS.primary : COLORS.muted}
                                />
                            </View>
                            <Text style={[
                                styles.onlineText,
                                { color: isOnline ? COLORS.white : COLORS.textSecondary }
                            ]}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </TouchableOpacity>
                        <Image
                            style={styles.profileImage}
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAScI9pkc7_c9MtCKhutLsut8y5VqkQ7Gl0UFkE5kMGChxEdvgzcRoQVPbGAchBKUhwwWmPJyRET1vMBeIxC_Q9pWLkLbHRuJkymbgqnJiEMwp0xmeGgg2EuELBWVGoPoBjY_jWKCHRNMcQGcNW42otpgIBWNeZ7aRa0GNjjclofJv4iWu1H5B4ie385NziZOMNJeBI4T9nkHiPt1l3iN084_sQh-ajt2Vjtq5QRqZgvyxElxmTJJvnK46halJI2KwS4rOYlfgmFwSM' }}
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

                {/* New Order Modal */}
                <NewOrderModal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    onAccept={handleAccept}
                    onReject={handleReject}
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
        paddingTop: Platform.OS === 'android' ? 4 : 0, // Mimic shadow-sm
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
        paddingBottom: 100, // Extra padding to prevent cutting at bottom
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