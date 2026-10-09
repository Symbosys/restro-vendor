import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/color';

const { width: screenWidth } = Dimensions.get('window');

interface IProduct {
    id: number;
    name: string;
    subtitle: string;
    image: string;
    alt: string;
    marketPrice: number;
    vendorPrice: number;
    isChecked: boolean;
}

const initialProducts: IProduct[] = [
    {
        id: 1,
        name: 'Spicy Chicken Curry',
        subtitle: '500g, Chicken',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMX25YKZn9LqfYPV6Ru1i-WCDIOe4ersm6Eo-W-ASdadysRtwiBnxEAVu8flMeY3WQXqHY6_7eRfaDYX1zP8_PK0upMs6UYDWfvUM0hKu-IY8dUSUKy5djzVz-Wp4Qv8SDG3ibzCj_GOnSzc1t-vn7njwPWvaHFTb6X425NyugZq24M8zq0iVSugth58Wv5opRpmE35OJHvxBEbHxi97eoIEyNTC4OXTN4bW-ad9qvbTwK71LP-904rAaTOE7UV8Wqf0PAUHhBXdz1',
        alt: 'A bowl of spicy chicken curry with herbs.',
        marketPrice: 299,
        vendorPrice: 250,
        isChecked: true,
    },
    {
        id: 2,
        name: 'Grilled Fish',
        subtitle: '2 pcs, Fish',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtbSiuVrvKtKYyYSLiFaU6I87SqD_TlmpAoUe6Vty2paKBSfsrp5rPXGjEyohwPKe7Q62YtB7v0BDsCNmvJyDi7RhN7Vuu0he0WRpecW0kcX6aD_Grjzp0tjymS8aseD6w5eGjy0DEyj4lmG3xDyaQqWRwiXv3OmhfeJZm2aiOyQxcwIk0tKtGLic4AV9SYQVngMMoovDoKLGwH1X5h6pmNOjCzBJeDeJqdvsVeX9LFQ6AG4W4nvfOHAeS13yzFzpmHeSeQOvLn0IE',
        alt: 'A piece of grilled fish with lemon and herbs.',
        marketPrice: 399,
        vendorPrice: 350,
        isChecked: false,
    },
    {
        id: 3,
        name: 'Paneer Tikka',
        subtitle: '8 pcs, Vegetarian',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlrXp2LCSHSpg5KuFyXL-pUYNQiZIcv_vU7IWNiHs1ps66FCuNvSB2rop7nWHJi2KXP18VscE0K5-I43Z3joeSONCrl_KUHZQEtc8g2ls_QfvajjhxKUOka1W4-kdjVou1Q1iUsIUhJ7vfOm3K7eDcOMcw4gwiK-Uy1xxCDLCxIa4ZYzndZLFAP3LRhyCWAZh-ABEQsnkDJWxrMBscvHhy87rhtsLoZpcgPi26dwxPye2FpzROXwhuJ1uDUNhS1MJq2s0D47BttEIo',
        alt: 'A plate of fresh Paneer Tikka skewers.',
        marketPrice: 249,
        vendorPrice: 199,
        isChecked: true,
    },
];

const ProductsScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedFilter, setSelectedFilter] = useState<string>('All');
    const [products, setProducts] = useState<IProduct[]>(initialProducts);

    const filters: string[] = ['All', 'Available', 'Unavailable'];

    const handleToggle = (id: number) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isChecked: !p.isChecked } : p));
    };

    return (
        <View style={styles.container}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>My Products</Text>
                </View>
                <View style={styles.searchOuter}>
                    <View style={styles.searchContainer}>
                        <View style={styles.searchIconContainer}>
                            <Text style={styles.searchIcon}>🔍</Text>
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a product..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#6B7280"
                        />
                    </View>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersScroll}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedFilter === filter && styles.filterTextActive,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Products List */}
            <ScrollView
                style={styles.productsScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
            >
                {products.map((product) => (
                    <View key={product.id} style={styles.productCard}>
                        <View style={styles.productHeader}>
                            <Image source={{ uri: product.image }} style={styles.productImage} />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productSubtitle}>{product.subtitle}</Text>
                            </View>
                            <Switch
                                value={product.isChecked}
                                onValueChange={() => handleToggle(product.id)}
                                trackColor={{
                                    false: '#E5E7EB', // Off track color (iOS/Android)
                                    true: '#22C55E',   // On track color (iOS)
                                }}
                                thumbColor={product.isChecked ? '#FFFFFF' : '#F3F4F6'} 
                                ios_backgroundColor="#E5E7EB" 
                                style={styles.scaledSwitch}
                            />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.priceRow}>
                            <Text style={styles.marketPriceText}>
                                Market Price:{' '}
                                <Text style={styles.strikethrough}>₹ {product.marketPrice}.00</Text>
                            </Text>
                            <Text style={styles.vendorPriceText}>
                                Vendor Price: ₹ {product.vendorPrice}.00
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#F7F8FA',
        paddingTop: 16, // pt-4
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16, // p-4
        paddingBottom: 8, // pb-2
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 24, // text-2xl
        fontWeight: '700', // font-bold
        color: '#111827', // text-zinc-900
        flex: 1,
        lineHeight: 28.8, // leading-tight approx 1.2 * 24
        letterSpacing: -0.36, // tracking-[-0.015em] approx -0.015*24
    },
    searchOuter: {
        paddingHorizontal: 16, // px-4
        paddingVertical: 12, // py-3
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        height: 48, // h-12
        borderRadius: 24, // rounded-xl = 1.5rem = 24px per config
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1, // shadow-sm
        backgroundColor: '#F3F4F6', // bg-zinc-100
    },
    searchIconContainer: {
        backgroundColor: '#F3F4F6', // bg-zinc-100
        borderRadius: 24, // rounded-l-xl = 1.5rem = 24px
        paddingLeft: 16, // pl-4
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    searchIcon: {
        fontSize: 20,
    },
    searchInput: {
        flex: 1,
        paddingLeft: 8, // pl-2 = 0.5rem = 8px
        paddingRight: 16, // px-4 right = 1rem = 16px
        paddingVertical: 0, // h-full, no vertical padding
        fontSize: 16, // text-base
        color: '#111827', // text-zinc-900
        backgroundColor: '#F3F4F6', // bg-zinc-100
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    },
    filtersScroll: {
        paddingHorizontal: 16, // p-4
        paddingTop: 0, // pt-0
        paddingBottom: 16,
    },
    filtersContainer: {
        flexDirection: 'row',
        gap: 12, // gap-3 = 0.75rem = 12px
    },
    filterChip: {
        height: 32, // h-8
        paddingHorizontal: 16, // pl-4 pr-4 = 1rem = 16px
        borderRadius: 9999, // rounded-full
        backgroundColor: '#E5E7EB', // bg-zinc-200
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: {
        backgroundColor: COLORS.primary, // bg-primary
    },
    filterText: {
        fontSize: 14, // text-sm
        fontWeight: '800', // font-medium
        color: '#111827', // text-zinc-900
        lineHeight: 20, // leading-normal
    },
    filterTextActive: {
        color: '#FFFFFF', // text-white
    },
    productsScroll: {
        flex: 1,
    },
    productsContainer: {
        flexGrow: 1,
        flexDirection: 'column',
        gap: 12, // gap-3 = 12px
        paddingHorizontal: 16, // p-4
        paddingTop: 192, // Approximate total header height (title ~69px + search 72px + filters 48px = ~189px, rounded to 192 for safety)
        paddingBottom: 16,
    },
    productCard: {
        flexDirection: 'column',
        gap: 16, // gap-4 = 1rem = 16px
        backgroundColor: '#FFFFFF', // bg-white
        padding: 16, // p-4
        borderRadius: 24, // rounded-xl = 1.5rem = 24px per config
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 1, // shadow-subtle
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16, // gap-4 = 16px
    },
    productImage: {
        width: 70, // w-[70px]
        height: 70, // h-[70px]
        borderRadius: 16, // rounded-lg = 1rem = 16px per config
    },
    switchContainer: {
        width: 70, 
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scaledSwitch: {
        transform: [{ scale: 1.5 }], 
    },
    productInfo: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16, // text-base
        fontWeight: '500', // font-medium
        color: '#111827', // text-zinc-900
        lineHeight: 24, // leading-normal approx
    },
    productSubtitle: {
        fontSize: 14, // text-sm
        fontWeight: '400', // font-normal
        color: '#6B7280', // text-zinc-500
        lineHeight: 20,
    },
    divider: {
        width: '100%',
        height: 1, // h-px
        backgroundColor: '#E5E7EB', // bg-zinc-200
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    marketPriceText: {
        fontSize: 14, // text-sm
        fontWeight: '400', // font-normal
        color: '#6B7280', // text-zinc-500
        lineHeight: 20,
    },
    strikethrough: {
        textDecorationLine: 'line-through',
    },
    vendorPriceText: {
        fontSize: 16, // text-base
        fontWeight: '700', // font-bold
        color: COLORS.primary, // text-primary
        lineHeight: 24,
    },
});

export default ProductsScreen;