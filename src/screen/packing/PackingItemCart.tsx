import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

const { width: screenWidth } = Dimensions.get('window');

const cartItems = [
    {
        title: 'Eco-friendly Container',
        desc: '500ml, Pack of 50',
        price: '₹120',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzY8-KxZK12J-pXEBCQQ8mQyuF2JmzmjTVlno288LdonpQ89R75wRavPWtE0Wrw8JGZpfNeBKLng-McO9zZuT1uNcDcBaVBzMgzw4l5lNFOO6O3UW4XFJLr3D-9h1O2PgPOq1Y3W-SrSESBvuRoS8YZfUqgn1bUgdlcv2KGsfAfQMtQjg150O1qd0mi8gxGm-hWLUUzxI_TDvmj5UImXI_EQGUJiVG0SBmLUYqJ_JXACEetcvrYGaG2hQbUBiehVl_bwy6dw5YqARJ',
        quantity: 1,
    },
    {
        title: 'Minta Fresh Large Bags',
        desc: 'Pack of 100',
        price: '₹350',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhgBrAVNVmKwYl9PmWC0qDlYfuVBF9YsiPQBkebfpd5lfvSbOuF3Y5MAPmGCYTHrB2L5tl50NBZcfQ3QIe5RgYWTY0dGGrtE1PKLtGT8o4w4b1Pi1tz9rP3sSUkkQ8yqm0joXATWgsMY33sTQBT92atGmJkbq3eR6BEzR1yChqCOEXNNk8ESx3Jb2BKZkiY23S81nIQ9ZGBl8s9dlmzANGwjeVIT8CgHo-1l9wgsNZUxvPB6ELGms4q5lThYXxNuhuv_qmlAqWvF4R',
        quantity: 2,
    },
];

export default function CartScreen({navigation}: AppNavigation) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#24292F" />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Cart 🛒</Text>
                    <View style={styles.emptyRight} />
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.main}
                    contentContainerStyle={styles.mainContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Cart Items */}
                    <View style={styles.itemsContainer}>
                        {cartItems.map((item, index) => (
                            <View key={index} style={styles.cartItem}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.itemDesc} numberOfLines={2}>
                                        {item.desc}
                                    </Text>
                                    <Text style={styles.itemPrice}>{item.price}</Text>
                                </View>
                                <View style={styles.itemActions}>
                                    <TouchableOpacity style={styles.deleteButton}>
                                        <MaterialIcons name="delete" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity style={styles.quantityButton}>
                                            <Text style={styles.quantityButtonText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>{item.quantity}</Text>
                                        <TouchableOpacity style={styles.quantityButton}>
                                            <Text style={styles.quantityButtonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.flexSpacer} />

                    {/* Price Summary */}
                    <View style={styles.priceSummary}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>₹820</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Shipping</Text>
                            <Text style={styles.priceValue}>₹50</Text>
                        </View>
                        <View style={styles.dashedBorder} />
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹870</Text>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.paymentCard}>
                        <Text style={styles.paymentTitle}>Payment Method</Text>
                        <View style={styles.paymentContent}>
                            <View style={styles.paymentRow}>
                                <MaterialIcons name="account-balance-wallet" size={20} color={COLORS.primary} style={styles.paymentIcon} />
                                <Text style={styles.paymentText}>
                                    Payment will be deducted from your Wallet.
                                </Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentText}>
                                    Total amount of <Text style={styles.strongText}>₹870</Text> will be cut in <Text style={styles.strongText}>3 installments</Text>.
                                </Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentText}>
                                    Each installment of <Text style={styles.strongText}>₹290</Text> will be deducted weekly.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Button */}
                <TouchableOpacity onPress={() => navigation.navigate('PackingOrderConfirmation')}>
                    <View style={styles.bottomBar}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.accent]}
                            style={styles.confirmButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.confirmContent}>
                                <Text style={styles.confirmButtonText} numberOfLines={1}>Confirm Order & Setup Installments</Text>
                                <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
                            </View>
                        </LinearGradient>
                    </View>
                </TouchableOpacity>
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
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
        flex: 1,
        textAlign: 'center',
        marginLeft: -20, // Adjust for button width
    },
    emptyRight: {
        width: 40,
    },
    main: {
        flex: 1,
    },
    mainContent: {
        padding: 16,
        paddingBottom: 200, // Space for bottom bar
    },
    itemsContainer: {
        gap: 16,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    itemDesc: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    itemActions: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
        justifyContent: 'space-between',
        height: 64, // Match image height
    },
    deleteButton: {
        padding: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        width: 20,
        textAlign: 'center',
    },
    flexSpacer: {
        flex: 1,
    },
    priceSummary: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        gap: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 24,
    },
    priceLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'right',
    },
    dashedBorder: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        borderStyle: 'dashed',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 24,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'right',
    },
    paymentCard: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        gap: 12,
    },
    paymentTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    paymentContent: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
        gap: 8,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    paymentIcon: {
        marginTop: -2,
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
        flex: 1,
    },
    strongText: {
        fontWeight: '800',
        color: COLORS.primary,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    confirmButton: {
        flex: 1,
        height: 56,
        borderRadius: 8,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    confirmContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
});