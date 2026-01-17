import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { usePackingProducts } from '../../api/hooks/packing_items';
import { usePackingCart, useAddToPackingCart } from '../../api/hooks/packing_items';
import { usePackingCartStore } from '../../store/cart';
import { PackingProduct } from '../../services/packing.service';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = (screenWidth - 48) / 2;

const categoryChips = [
    { label: 'All', value: '' },
    { label: 'Boxes 🧁', value: 'box' },
    { label: 'Containers 🍱', value: 'container' },
    { label: 'Paper Bags 🛍️', value: 'bag' },
    { label: 'Stickers 🏷️', value: 'sticker' },
    { label: 'Wraps 🧻', value: 'wrap' },
];

export default function PackingScreen({ navigation }: AppNavigation) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // React Query hooks
    const { data, isLoading, isError, refetch, isRefetching } = usePackingProducts({
        search: searchQuery || undefined,
        material: selectedCategory || undefined,
        isActive: true,
        isAvailable: true,
    });

    const { data: cartData } = usePackingCart();
    const addToCartMutation = useAddToPackingCart();

    // Zustand store
    const { getProductQuantity, incrementQuantity, decrementQuantity, setProductQuantity } = usePackingCartStore();

    const products: PackingProduct[] = data?.products || [];
    const cartItemsCount = cartData?.summary?.itemsCount || 0;
    const cartTotal = cartData?.summary?.subtotal || 0;

    const handleAddToCart = useCallback(async (product: PackingProduct) => {
        const quantity = getProductQuantity(product.id, product.minOrderQty);
        try {
            await addToCartMutation.mutateAsync({ productId: product.id, quantity });
            // Reset quantity after adding
            setProductQuantity(product.id, product.minOrderQty);
        } catch (error) {
            // Error handled in mutation
        }
    }, [addToCartMutation, getProductQuantity, setProductQuantity]);

    const renderProductCard = useCallback((product: PackingProduct, index: number) => {
        const quantity = getProductQuantity(product.id, product.minOrderQty);
        const imageUrl = product.image?.url || 'https://via.placeholder.com/200';
        const pricePerPack = `₹${parseToDecimal(product.price as any).toFixed(0)} / ${product.quantityPerPack} pcs`;

        return (
            <View key={product.id} style={[styles.productCard, { width: itemWidth }]}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: imageUrl }} style={styles.productImage} />
                    {product.badge && (
                        <View style={[styles.badge, { backgroundColor: product.badgeColor || COLORS.highlight }]}>
                            <Text style={styles.badgeText}>{product.badge}</Text>
                        </View>
                    )}
                    {product.stockQuantity <= product.lowStockAlert && product.stockQuantity > 0 && (
                        <View style={[styles.badge, { backgroundColor: '#EF4444', top: product.badge ? 36 : 8 }]}>
                            <Text style={styles.badgeText}>Low Stock</Text>
                        </View>
                    )}
                </View>
                <View style={styles.productDetails}>
                    <Text style={styles.productTitle} numberOfLines={1}>
                        {product.title}
                    </Text>
                    <Text style={styles.productDesc} numberOfLines={2}>
                        {product.description}
                    </Text>
                    <Text style={styles.productPrice}>{pricePerPack}</Text>
                    <View style={styles.quantityWrapper}>
                        <TouchableOpacity
                            style={[
                                styles.quantityButton,
                                quantity <= product.minOrderQty ? styles.quantityButtonDisabled : undefined
                            ]}
                            onPress={() => decrementQuantity(product.id, product.minOrderQty)}
                            disabled={quantity <= product.minOrderQty}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity
                            style={[
                                styles.quantityButton,
                                (product.maxOrderQty !== null && quantity >= product.maxOrderQty) ? styles.quantityButtonDisabled : undefined
                            ]}
                            onPress={() => incrementQuantity(product.id, product.minOrderQty, product.maxOrderQty)}
                            disabled={product.maxOrderQty !== null && quantity >= product.maxOrderQty}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleAddToCart(product)}
                        disabled={addToCartMutation.isPending || product.stockQuantity === 0}
                    >
                        <LinearGradient
                            colors={product.stockQuantity === 0 ? ['#9CA3AF', '#9CA3AF'] : [COLORS.primary, COLORS.accent]}
                            style={styles.addToCartButton}
                        >
                            {addToCartMutation.isPending ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Text style={styles.addToCartText}>
                                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }, [getProductQuantity, incrementQuantity, decrementQuantity, handleAddToCart, addToCartMutation.isPending]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top App Bar */}
                <View style={styles.topBar}>
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={styles.cartWrapper}>
                            <TouchableOpacity
                                style={styles.cartButton}
                                onPress={() => navigation.navigate('Packingcart')}
                            >
                                <MaterialIcons name="shopping-cart" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                            {cartItemsCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>
                                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            colors={[COLORS.primary]}
                        />
                    }
                >
                    {/* Search Bar */}
                    <View style={styles.searchWrapper}>
                        <View style={styles.searchInputWrapper}>
                            <MaterialIcons name="search" size={24} color={COLORS.muted} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search packing items"
                                placeholderTextColor={COLORS.muted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <MaterialIcons
                                        name="close"
                                        size={24}
                                        color={COLORS.muted}
                                        style={styles.closeIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Category Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipsScroll}
                        contentContainerStyle={styles.chipsContent}
                    >
                        {categoryChips.map((chip, index) =>
                            chip.value === selectedCategory ? (
                                <LinearGradient
                                    key={index}
                                    colors={[COLORS.primary, COLORS.accent]}
                                    style={styles.chipActive}
                                >
                                    <Text style={styles.chipTextActive}>{chip.label}</Text>
                                </LinearGradient>
                            ) : (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.chip}
                                    onPress={() => setSelectedCategory(chip.value)}
                                >
                                    <Text style={styles.chipText}>{chip.label}</Text>
                                </TouchableOpacity>
                            ),
                        )}
                    </ScrollView>

                    {/* Loading State */}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Loading products...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {isError && !isLoading && (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error-outline" size={48} color={COLORS.muted} />
                            <Text style={styles.errorText}>Failed to load products</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && products.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="inventory-2" size={48} color={COLORS.muted} />
                            <Text style={styles.emptyText}>No products found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                        </View>
                    )}

                    {/* Product Grid */}
                    {!isLoading && !isError && products.length > 0 && (
                        <View style={styles.grid}>
                            {products.map((product, index) => renderProductCard(product, index))}
                        </View>
                    )}
                </ScrollView>

                {/* Sticky Cart Summary */}
                {cartItemsCount > 0 && (
                    <TouchableOpacity onPress={() => navigation.navigate('Packingcart')}>
                        <View style={styles.stickyCartWrapper}>
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.accent]}
                                style={styles.stickyCartGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.cartSummaryWrapper}>
                                    <Text style={styles.cartSummaryText}>{cartItemsCount} items in cart</Text>
                                    <Text style={styles.cartTotalText}>Total ₹{cartTotal.toFixed(0)}</Text>
                                </View>
                                <TouchableOpacity style={styles.proceedButton}>
                                    <MaterialIcons name="arrow-forward" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.background,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
    },
    iconButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartWrapper: {
        width: 48,
        position: 'relative',
    },
    cartButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    cartBadge: {
        position: 'absolute',
        top: 8,
        right: 4,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 170,
    },
    searchWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
    },
    searchInput: {
        flex: 1,
        height: 56,
        paddingLeft: 48,
        paddingRight: 40,
        fontSize: 16,
        color: COLORS.textPrimary,
        borderRadius: 28,
    },
    closeIcon: {
        position: 'absolute',
        right: 16,
    },
    chipsScroll: {
        paddingHorizontal: 16,
    },
    chipsContent: {
        flexDirection: 'row',
        gap: 12,
    },
    chip: {
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0d1ed',
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipActive: {
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.muted,
    },
    chipTextActive: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
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
        paddingTop: 80,
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
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    emptySubtext: {
        marginTop: 4,
        fontSize: 14,
        color: COLORS.muted,
    },
    grid: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    productCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
    },
    productImage: {
        flex: 1,
        width: undefined,
        height: undefined,
        resizeMode: 'cover',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        height: 24,
        borderRadius: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
    },
    productDetails: {
        flex: 1,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    productDesc: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    quantityWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonDisabled: {
        opacity: 0.4,
    },
    quantityButtonText: {
        fontSize: 16,
        color: '#6b7280',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    addToCartButton: {
        marginTop: 8,
        borderRadius: 28,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
    stickyCartWrapper: {
        position: 'absolute',
        bottom: 40,
        left: 16,
        right: 16,
        zIndex: 20,
    },
    stickyCartGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 28,
        paddingVertical: 12,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cartSummaryWrapper: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    cartSummaryText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
        opacity: 0.9,
    },
    cartTotalText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        marginTop: 2,
    },
    proceedButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});