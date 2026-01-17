import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import {
    usePackingCart,
    useUpdatePackingCartItem,
    useRemovePackingCartItem,
    useClearPackingCart,
} from '../../api/hooks/packing_items';
import { parseToDecimal } from '../../utils/utils';

export default function CartScreen({ navigation }: AppNavigation) {
    const { data, isLoading, isError, refetch, isRefetching } = usePackingCart();
    const updateItemMutation = useUpdatePackingCartItem();
    const removeItemMutation = useRemovePackingCartItem();
    const clearCartMutation = useClearPackingCart();

    const cartItems = data?.cart?.items || [];
    const summary = data?.summary;

    const subtotal = summary?.subtotal || 0;
    const shippingFee = subtotal > 0 ? 50 : 0; // Fixed shipping fee
    const total = subtotal + shippingFee;
    const installmentAmount = Math.ceil(total / 3);

    const handleUpdateQuantity = useCallback(async (itemId: string, newQuantity: number, minQty: number, maxQty: number | null) => {
        if (newQuantity < minQty) return;
        if (maxQty !== null && newQuantity > maxQty) return;

        try {
            await updateItemMutation.mutateAsync({ itemId, quantity: newQuantity });
        } catch (error) {
            // Error handled in mutation
        }
    }, [updateItemMutation]);

    const handleRemoveItem = useCallback(async (itemId: string, productTitle: string) => {
        Alert.alert(
            'Remove Item',
            `Are you sure you want to remove "${productTitle}" from your cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeItemMutation.mutateAsync(itemId);
                        } catch (error) {
                            // Error handled in mutation
                        }
                    },
                },
            ]
        );
    }, [removeItemMutation]);

    const handleClearCart = useCallback(() => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCartMutation.mutateAsync();
                        } catch (error) {
                            // Error handled in mutation
                        }
                    },
                },
            ]
        );
    }, [clearCartMutation]);

    const isUpdating = updateItemMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending;

    // Empty cart state
    if (!isLoading && !isError && cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color="#24292F" />
                        </TouchableOpacity>
                        <Text style={styles.title}>My Cart 🛒</Text>
                        <View style={styles.emptyRight} />
                    </View>
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="shopping-cart" size={64} color={COLORS.muted} />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                        <Text style={styles.emptySubtext}>Add some packing items to get started</Text>
                        <TouchableOpacity
                            style={styles.shopButton}
                            onPress={() => navigation.goBack()}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.accent]}
                                style={styles.shopButtonGradient}
                            >
                                <Text style={styles.shopButtonText}>Browse Products</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#24292F" />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Cart 🛒</Text>
                    {cartItems.length > 0 && (
                        <TouchableOpacity onPress={handleClearCart} disabled={isUpdating}>
                            <MaterialIcons name="delete-sweep" size={24} color={COLORS.muted} />
                        </TouchableOpacity>
                    )}
                    {cartItems.length === 0 && <View style={styles.emptyRight} />}
                </View>

                {/* Loading State */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading cart...</Text>
                    </View>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={48} color={COLORS.muted} />
                        <Text style={styles.errorText}>Failed to load cart</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Main Content */}
                {!isLoading && !isError && cartItems.length > 0 && (
                    <>
                        <ScrollView
                            style={styles.main}
                            contentContainerStyle={styles.mainContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefetching}
                                    onRefresh={refetch}
                                    colors={[COLORS.primary]}
                                />
                            }
                        >
                            {/* Price Change Warning */}
                            {summary?.hasPriceChanges && (
                                <View style={styles.warningBanner}>
                                    <MaterialIcons name="warning" size={20} color="#F59E0B" />
                                    <Text style={styles.warningText}>
                                        Some prices have changed since you added items
                                    </Text>
                                </View>
                            )}

                            {/* Cart Items */}
                            <View style={styles.itemsContainer}>
                                {cartItems.map((item) => {
                                    const imageUrl = item.product.image?.url || 'https://via.placeholder.com/64';
                                    const pricePerPack = `₹${parseToDecimal(item.priceAtAdd as any).toFixed(0)}`;
                                    const itemTotal = parseToDecimal(item.priceAtAdd as any) * item.quantity;

                                    return (
                                        <View key={item.id} style={styles.cartItem}>
                                            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                                            <View style={styles.itemDetails}>
                                                <Text style={styles.itemTitle} numberOfLines={1}>
                                                    {item.product.title}
                                                </Text>
                                                <Text style={styles.itemDesc}>
                                                    {item.product.quantityPerPack} pcs/pack
                                                </Text>
                                                <Text style={styles.itemDesc}>
                                                    Total: {item.quantity * item.product.quantityPerPack} pcs
                                                </Text>
                                                <Text style={styles.itemPrice}>{pricePerPack} × {item.quantity} = ₹{itemTotal}</Text>
                                                {item.priceChanged && (
                                                    <Text style={styles.priceChangeText}>
                                                        {item.priceDifference! > 0 ? '↑' : '↓'} Price {item.priceDifference! > 0 ? 'increased' : 'decreased'}
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={styles.itemActions}>
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => handleRemoveItem(item.id, item.product.title)}
                                                    disabled={isUpdating}
                                                >
                                                    <MaterialIcons name="delete" size={20} color="#6B7280" />
                                                </TouchableOpacity>
                                                <View style={styles.quantityContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.quantityButton,
                                                            item.quantity <= item.product.minOrderQty ? styles.quantityButtonDisabled : undefined,
                                                        ]}
                                                        onPress={() => handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity - 1,
                                                            item.product.minOrderQty,
                                                            item.product.maxOrderQty
                                                        )}
                                                        disabled={isUpdating || item.quantity <= item.product.minOrderQty}
                                                    >
                                                        <Text style={styles.quantityButtonText}>-</Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.quantityButton,
                                                            (item.product.maxOrderQty !== null && item.quantity >= item.product.maxOrderQty) ? styles.quantityButtonDisabled : undefined,
                                                        ]}
                                                        onPress={() => handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity + 1,
                                                            item.product.minOrderQty,
                                                            item.product.maxOrderQty
                                                        )}
                                                        disabled={isUpdating || (item.product.maxOrderQty !== null && item.quantity >= item.product.maxOrderQty)}
                                                    >
                                                        <Text style={styles.quantityButtonText}>+</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Price Summary */}
                            <View style={styles.priceSummary}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Items in Cart</Text>
                                    <Text style={styles.priceValue}>{cartItems.length} items</Text>
                                </View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Total Quantity</Text>
                                    <Text style={styles.priceValue}>{cartItems.reduce((acc, item) => acc + (item.quantity * item.product.quantityPerPack), 0)} pcs</Text>
                                </View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Subtotal</Text>
                                    <Text style={styles.priceValue}>₹{subtotal.toFixed(0)}</Text>
                                </View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Shipping</Text>
                                    <Text style={styles.priceValue}>₹{shippingFee}</Text>
                                </View>
                                <View style={styles.dashedBorder} />
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
                                </View>
                            </View>

                            {/* Payment Method */}
                            <View style={styles.paymentCard}>
                                <Text style={styles.paymentTitle}>Payment Method</Text>
                                <View style={styles.paymentContent}>
                                    <View style={styles.paymentRow}>
                                        <MaterialIcons
                                            name="account-balance-wallet"
                                            size={20}
                                            color={COLORS.primary}
                                            style={styles.paymentIcon}
                                        />
                                        <Text style={styles.paymentText}>
                                            Payment will be deducted from your Wallet.
                                        </Text>
                                    </View>
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentText}>
                                            Total amount of <Text style={styles.strongText}>₹{total.toFixed(0)}</Text> will be cut in{' '}
                                            <Text style={styles.strongText}>3 installments</Text>.
                                        </Text>
                                    </View>
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentText}>
                                            Each installment of <Text style={styles.strongText}>₹{installmentAmount}</Text> will be
                                            deducted weekly.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Bottom Button */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PackingOrderConfirmation')}
                            disabled={isUpdating}
                        >
                            <View style={styles.bottomBar}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.accent]}
                                    style={styles.confirmButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.confirmContent}>
                                        <Text style={styles.confirmButtonText} numberOfLines={1}>
                                            Confirm Order & Setup Installments
                                        </Text>
                                        <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
                                    </View>
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>
                    </>
                )}
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
    },
    emptyRight: {
        width: 40,
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
        fontWeight: '800',
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
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
    },
    shopButton: {
        marginTop: 24,
    },
    shopButtonGradient: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 28,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
    },
    main: {
        flex: 1,
    },
    mainContent: {
        padding: 16,
        paddingBottom: 200,
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
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.muted,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    priceChangeText: {
        fontSize: 11,
        color: '#F59E0B',
        marginTop: 2,
    },
    itemActions: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
        justifyContent: 'space-between',
        height: 64,
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
    quantityButtonDisabled: {
        opacity: 0.4,
    },
    quantityButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        width: 20,
        textAlign: 'center',
    },
    priceSummary: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 12,
        marginTop: 16,
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
        fontWeight: '800',
        color: COLORS.muted,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '800',
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
        marginTop: 16,
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
        fontWeight: '800',
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