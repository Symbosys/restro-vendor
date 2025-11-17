import React from 'react';
import {
    View,
    Text,
    TextInput,
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
const itemWidth = (screenWidth - 48) / 2;

const chips = [
    { label: 'All', active: true },
    { label: 'Boxes 🧁', active: false },
    { label: 'Containers 🍱', active: false },
    { label: 'Paper Bags 🛍️', active: false },
    { label: 'Stickers & Labels 🏷️', active: false },
    { label: 'Tapes & Wraps 🧻', active: false },
];

const products = [
    {
        title: 'Kraft Paper Box',
        desc: 'Eco-friendly paper container 500ml',
        price: '₹120 / 50 pcs',
        image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAz5DjprAlMsIbBl5NJhPdgxJPlIaFePlwdQEziiXwLtwfEnxotBQLwLmtkebRqyF4bQ5WeYG-NJ6nnX9xQ4FBFGm-9krh5uFWcAmI_yX2otQOP19haQQqE2FCzcsfYk4ioX1ZEi-eZXR5rAFVT3YAV-6y9B2sM-WjqGlD-PEOlvsF8yf5pt8qhArJjC3vDhIWdwbPTBK56qBjHkeWuXT528ExAiys2QWp2EPh4WC-SMcc74mLyYAElm6dfCLLizJWwFvcNEfy6UxVv',
        badge: 'Best Seller',
        badgeColor: COLORS.highlight,
    },
    {
        title: 'Paper Container',
        desc: 'Eco-friendly paper container 750ml',
        price: '₹150 / 50 pcs',
        image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAEA70CErECvVtG9PvamRBbau3oJvSU7MNUIhQXovN6BoBk_LQj04IOSWdJpdSK6l_XRBhAHeos8TfdFAH8xs5mDEy8q9jcPjLtihiGpE0qTzZzSV6NCW2XH93MLZ-pPBbzg474cmoxtwabiirW0EWzlK_-jrzV6jJlknXiNhtnatvzi5xfV1U4nAvgYXt-aJJk2Amaq7ZuN7rUP1ew_ypMqJarHmlFhgCuhSlLyDLJSXMHuygAUKw-GN-VCBQVC1LHwd6dkISHEF8g',
        badge: 'Eco-friendly',
        badgeColor: '#50C878',
    },
    {
        title: 'Brown Paper Bag',
        desc: 'Sturdy paper bag with handles',
        price: '₹250 / 100 pcs',
        image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDoQT4gsFAHLajDqwAkgH3c1K6anKMwsKuQM1q6Ya76VFKpecox5boaJio7JfQ9-mmnHyegJL4XGxxsoDMJgHnTaO-9UPns1zIG2dFXv24xhu-CYzwlarRpehpdYpY_ySk2_-Be3u-LRNbH_KqK0bpk515H1vfWFK6MmkZBQPA-KEXe-uXy2nKAKQ5bsQpqUmoTxK-kDZE285bHc1RQl0GRcwDQyR9ww2TjZCySfbdmOEJcjaFLp8oth61TbH5Pfgs2T1kKSo-ORo_R',
    },
    {
        title: 'Sticker Roll',
        desc: 'Thank you stickers for packaging',
        price: '₹300 / 500 pcs',
        image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAVYHP79vH3HfVSSNj0UDlwfPLQi6jmY7BISKjZMyxWPN9LqoxxBaPmjwzPw_rNdIVpn9dtiUC2FvHw9hOBSQK3aTnd60WFvp8IvRJUwPEqCOCrgzp3WHcClxCnmW1dkappWwD35h2mZ8KVxuHaVbeiEfUXtUwWOyplvTDUfBrSjiyaJMyLh6VguUtbxpnydAvBbjHfwFcgdSo4OhXHM5m84QWh2p7wxtkvg9AdDPMcLYqaXUsStYGrbfU_M9tBaQwtx5cycAqZK0GJ',
    },
];

export default function PackingScreen({ navigation }: AppNavigation) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top App Bar */}
                <View style={styles.topBar}>
                    <View style={styles.topRow} >
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={styles.cartWrapper}>
                            <TouchableOpacity style={styles.cartButton}>
                                <MaterialIcons name="shopping-cart" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>3</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Search Bar */}
                    <View style={styles.searchWrapper}>
                        <View style={styles.searchInputWrapper}>
                            <MaterialIcons name="search" size={24} color={COLORS.muted} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search packing items"
                                placeholderTextColor={COLORS.muted}
                            />
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={COLORS.muted}
                                style={styles.closeIcon}
                            />
                        </View>
                    </View>

                    {/* Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipsScroll}
                        contentContainerStyle={styles.chipsContent}
                    >
                        {chips.map((chip, index) =>
                            chip.active ? (
                                <LinearGradient
                                    key={index}
                                    colors={[COLORS.primary, COLORS.accent]}
                                    style={styles.chipActive}
                                >
                                    <Text style={styles.chipTextActive}>{chip.label}</Text>
                                </LinearGradient>
                            ) : (
                                <TouchableOpacity key={index} style={styles.chip}>
                                    <Text style={styles.chipText}>{chip.label}</Text>
                                </TouchableOpacity>
                            ),
                        )}
                    </ScrollView>

                    {/* Image Grid */}
                    <View style={styles.grid}>
                        {products.map((product, index) => (
                            <View key={index} style={[styles.productCard, { width: itemWidth }]}>
                                <View style={styles.imageWrapper}>
                                    <Image source={{ uri: product.image }} style={styles.productImage} />
                                    {product.badge && (
                                        <View style={[styles.badge, { backgroundColor: product.badgeColor }]}>
                                            <Text style={styles.badgeText}>{product.badge}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.productDetails}>
                                    <Text style={styles.productTitle} numberOfLines={1}>
                                        {product.title}
                                    </Text>
                                    <Text style={styles.productDesc} numberOfLines={2}>
                                        {product.desc}
                                    </Text>
                                    <Text style={styles.productPrice}>{product.price}</Text>
                                    <View style={styles.quantityWrapper}>
                                        <TouchableOpacity style={styles.quantityButton}>
                                            <Text style={styles.quantityButtonText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>1</Text>
                                        <TouchableOpacity style={styles.quantityButton}>
                                            <Text style={styles.quantityButtonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.accent]}
                                        style={styles.addToCartButton}
                                    >
                                        <Text style={styles.addToCartText}>Add to Cart</Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* Sticky Cart Summary */}
                <TouchableOpacity onPress={() => navigation.navigate("Packingcart")}>
                    <View style={styles.stickyCartWrapper}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.accent]}
                            style={styles.stickyCartGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.cartSummaryWrapper}>
                                <Text style={styles.cartSummaryText}>3 items in cart</Text>
                                <Text style={styles.cartTotalText}>Total ₹820</Text>
                            </View>
                            <TouchableOpacity style={styles.proceedButton}>
                                <MaterialIcons name="arrow-forward" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
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
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
        marginTop: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.muted,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 12,
        paddingHorizontal: 16,
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