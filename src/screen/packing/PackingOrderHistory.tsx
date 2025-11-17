import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';

const { width: screenWidth } = Dimensions.get('window');

const filters = [
    { label: 'All', active: true },
    { label: 'Completed', active: false },
    { label: 'Pending Payment', active: false },
    { label: 'Delivered', active: false },
];

const orders = [
    {
        id: '#PACK-2023-001',
        date: 'Ordered on Jan 15, 2023',
        items: '3 items: Boxes, Containers',
        total: '₹870',
        statuses: [
            { text: 'Paid', color: '#10B981', bgColor: '#D1FAE5' },
            { text: 'Delivered', color: '#10B981', bgColor: '#D1FAE5' },
        ],
    },
    {
        id: '#PACK-2023-002',
        date: 'Ordered on Jan 20, 2023',
        items: '2 items: Bags, Tape',
        total: '₹450',
        statuses: [
            { text: 'Pending Installment', color: '#F59E0B', bgColor: '#FEF3C7' },
            { text: 'Shipped', color: '#3B82F6', bgColor: '#DBEAFE' },
        ],
    },
    {
        id: '#PACK-2023-003',
        date: 'Ordered on Jan 28, 2023',
        items: '5 items: Labels, Pouches, Wraps',
        total: '₹1250',
        statuses: [
            { text: 'Overdue', color: '#EF4444', bgColor: '#FEE2E2' },
            { text: 'Processing', color: '#8B5CF6', bgColor: '#EDE9FE' },
        ],
    },
];

export default function PackingOrderHistoryScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
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
                        />
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
                        filter.active ? (
                            <LinearGradient
                                key={index}
                                colors={[COLORS.primary, COLORS.secondary]}
                                style={styles.filterActive}
                            >
                                <Text style={styles.filterTextActive}>{filter.label}</Text>
                            </LinearGradient>
                        ) : (
                            <TouchableOpacity key={index} style={styles.filter}>
                                <Text style={styles.filterText}>{filter.label}</Text>
                            </TouchableOpacity>
                        ),
                    )}
                </ScrollView>

                {/* Orders List */}
                <ScrollView
                    style={styles.ordersContainer}
                    contentContainerStyle={styles.ordersContent}
                    showsVerticalScrollIndicator={false}
                >
                    {orders.map((order, index) => (
                        <TouchableOpacity key={index} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>{order.id}</Text>
                                <MaterialIcons name="chevron-right" size={24} color={COLORS.muted} />
                            </View>
                            <View style={styles.orderDetails}>
                                <Text style={styles.orderDate}>{order.date}</Text>
                                <Text style={styles.orderItems}>{order.items}</Text>
                                <Text style={styles.orderTotal}>Total: {order.total}</Text>
                            </View>
                            <View style={styles.statuses}>
                                {order.statuses.map((status, sIndex) => (
                                    <View
                                        key={sIndex}
                                        style={[styles.statusBadge, { backgroundColor: status.bgColor }]}
                                    >
                                        <Text style={[styles.statusText, { color: status.color }]}>
                                            {status.text}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
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
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
        flex: 1,
        textAlign: 'center',
        marginLeft: -48, // Adjust for back button
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
        paddingLeft: 12,
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
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    filterTextActive: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.white,
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