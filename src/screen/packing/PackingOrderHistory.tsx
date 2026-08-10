import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { usePackingOrders } from '../../api/hooks/packing_items';
import { PackingOrder } from '../../services/packing.service';
import { parseToDecimal } from '../../utils/utils';

const filters = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

const getStatusConfig = (status: string, isPaid: boolean) => {
    const configs: Record<string, { text: string; color: string; bgColor: string }> = {
        PENDING: { text: 'Pending', color: '#F59E0B', bgColor: '#FEF3C7' },
        CONFIRMED: { text: 'Confirmed', color: '#3B82F6', bgColor: '#DBEAFE' },
        PROCESSING: { text: 'Processing', color: '#8B5CF6', bgColor: '#EDE9FE' },
        SHIPPED: { text: 'Shipped', color: '#3B82F6', bgColor: '#DBEAFE' },
        DELIVERED: { text: 'Delivered', color: '#10B981', bgColor: '#D1FAE5' },
        CANCELLED: { text: 'Cancelled', color: '#EF4444', bgColor: '#FEE2E2' },
        FAILED: { text: 'Failed', color: '#EF4444', bgColor: '#FEE2E2' },
    };

    const statusBadge = configs[status] || configs.PENDING;
    const paymentBadge = isPaid
        ? { text: 'Paid', color: '#10B981', bgColor: '#D1FAE5' }
        : { text: 'Payment Pending', color: '#F59E0B', bgColor: '#FEF3C7' };

    return { statusBadge, paymentBadge };
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function PackingOrderHistoryScreen({ navigation }: AppNavigation) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('');

    const { data, isLoading, isError, refetch, isRefetching } = usePackingOrders({
        status: selectedFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const orders: PackingOrder[] = data?.orders || [];

    // Filter orders by search query
    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const query = searchQuery.toLowerCase();
        return orders.filter((order) =>
            order.orderNumber.toLowerCase().includes(query)
        );
    }, [orders, searchQuery]);

    const handleOrderPress = useCallback((orderId: string) => {
        // Navigate to order details or installment screen
        navigation.navigate('PackingOrderInstallment', { orderId });
    }, [navigation]);

    return (
        <View style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Packing Order History 📦</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <MaterialIcons name="search" size={20} color={COLORS.muted} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by Order ID"
                            placeholderTextColor={COLORS.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialIcons name="close" size={20} color={COLORS.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    {filters.map((filter, index) =>
                        filter.value === selectedFilter ? (
                            <LinearGradient
                                key={index}
                                colors={[COLORS.primary, COLORS.accent]}
                                style={styles.filterActive}
                            >
                                <Text style={styles.filterTextActive}>{filter.label}</Text>
                            </LinearGradient>
                        ) : (
                            <TouchableOpacity
                                key={index}
                                style={styles.filter}
                                onPress={() => setSelectedFilter(filter.value)}
                            >
                                <Text style={styles.filterText}>{filter.label}</Text>
                            </TouchableOpacity>
                        ),
                    )}
                </ScrollView>

                {/* Loading State */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading orders...</Text>
                    </View>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={48} color={COLORS.muted} />
                        <Text style={styles.errorText}>Failed to load orders</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredOrders.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="inventory-2" size={48} color={COLORS.muted} />
                        <Text style={styles.emptyText}>No orders found</Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery ? 'Try a different search term' : 'Place your first order to see it here'}
                        </Text>
                    </View>
                )}

                {/* Orders List */}
                {!isLoading && !isError && filteredOrders.length > 0 && (
                    <ScrollView
                        style={styles.ordersContainer}
                        contentContainerStyle={styles.ordersContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                colors={[COLORS.primary]}
                            />
                        }
                    >
                        {filteredOrders.map((order) => {
                            const { statusBadge, paymentBadge } = getStatusConfig(order.status, order.isPaid);
                            const itemsSummary = order.items
                                .slice(0, 2)
                                .map((item) => item.productSnapshot?.title || 'Item')
                                .join(', ');
                            const moreItems = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';

                            return (
                                <TouchableOpacity
                                    key={order.id}
                                    style={styles.orderCard}
                                    onPress={() => handleOrderPress(order.id)}
                                >
                                    <View style={styles.orderHeader}>
                                        <Text style={styles.orderId}>{order.orderNumber}</Text>
                                        <MaterialIcons name="chevron-right" size={24} color={COLORS.muted} />
                                    </View>
                                    <View style={styles.orderDetails}>
                                        <Text style={styles.orderDate}>Ordered on {formatDate(order.createdAt)}</Text>
                                        <Text style={styles.orderItems} numberOfLines={1}>
                                            {order.itemsCount} items: {itemsSummary}{moreItems}
                                        </Text>
                                        <Text style={styles.orderTotal}>Total: ₹{parseToDecimal(order.totalAmount as any).toFixed(0)}</Text>
                                    </View>
                                    <View style={styles.statuses}>
                                        <View style={[styles.statusBadge, { backgroundColor: paymentBadge.bgColor }]}>
                                            <Text style={[styles.statusText, { color: paymentBadge.color }]}>
                                                {paymentBadge.text}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                                            <Text style={[styles.statusText, { color: statusBadge.color }]}>
                                                {statusBadge.text}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
        flex: 1,
        textAlign: 'center',
        marginLeft: -48,
    },
    searchContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: COLORS.textPrimary,
        backgroundColor: 'transparent',
    },
    filtersContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filtersContent: {
        flexDirection: 'row',
        gap: 12,
    },
    filter: {
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterActive: {
        height: 32,
        borderRadius: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    filterTextActive: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.muted,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
    },
    ordersContainer: {
        backgroundColor: COLORS.background,
    },
    ordersContent: {
        padding: 16,
        gap: 16,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    orderDetails: {
        gap: 4,
        marginBottom: 12,
    },
    orderDate: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
    },
    orderItems: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
    },
    orderTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    statuses: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
});