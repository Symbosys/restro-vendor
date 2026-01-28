import React, { useEffect, useState, useMemo } from 'react';
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/color';
import { useGetAllProducts } from '../../hooks/useProducts';
import { useGetAllCategories } from '../../hooks/useCategory';
import { Category, Product } from '../../types/product.type';
import { parseToDecimal } from '../../utils/utils';
import { useUpdateInventory } from '../../hooks/useInventory';
import Loader from '../../components/ui/Loader';


if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
const SPACING = 16;
const CARD_WIDTH = (width - SPACING * 3) / 2;

const VendorInventoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const isTabScreen = route.name === 'Inventory';
  const tabBarHeight = isTabScreen ? (Platform.OS === 'ios' ? 90 : 75) : 0;

  const [activeTabId, setActiveTabId] = useState('1');
  const { updateInventory, isUpdating } = useUpdateInventory();

  // State for selections
  const [enabledCategories, setEnabledCategories] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // State to track initial values from API (to detect changes)
  const [initialEnabledCategories, setInitialEnabledCategories] = useState<string[]>([]);
  const [initialSelectedProductIds, setInitialSelectedProductIds] = useState<string[]>([]);

  // State to track if data has been synced with API once
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: products } = useGetAllProducts();
  console.log('products', products);
  const { data: categories } = useGetAllCategories();

  // ==========================================================
  // ⚡️ UPDATED: Hydrate State from API Response (isSelected/isAvailable)
  // ==========================================================
  useEffect(() => {
    // If we have already synced data, or data isn't ready, do nothing
    if (isHydrated || !products?.data?.products || !categories?.data) return;

    const apiProducts = products.data.products;
    const apiCategories = categories.data;

    // 1. Get Categories where isSelected === true
    const preSelectedCategoryIds = apiCategories
      .filter((cat: any) => cat.isSelected)
      .map((cat: any) => cat.id);

    // 2. Get Products where isAvailable === true
    const preSelectedProductIds = apiProducts
      .filter((prod: any) => prod.isAvailable)
      .map((prod: any) => prod.id);

    // 3. Update State
    setEnabledCategories(preSelectedCategoryIds);
    setSelectedProductIds(preSelectedProductIds);

    // 4. Save initial state for change detection
    setInitialEnabledCategories(preSelectedCategoryIds);
    setInitialSelectedProductIds(preSelectedProductIds);

    // 5. Set Active Tab to first category if available
    if (apiCategories.length > 0) {
      setActiveTabId(apiCategories[0].id);
    }

    // Mark as hydrated so user changes aren't overwritten later
    setIsHydrated(true);

  }, [products, categories, isHydrated]);


  const realProducts = products?.data?.products || [];
  const categoryProducts = useMemo(
    () => realProducts.filter(p => p.categoryId === activeTabId),
    [realProducts, activeTabId],
  );


  const toggleCategoryEnabled = (val: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (val) {
      setEnabledCategories(prev => [...prev, activeTabId]);
      const mandatoryItems = realProducts
        .filter(p => p.categoryId === activeTabId && p.isMandatory)
        .map(p => p.id);
      // Only add mandatory items that aren't already selected to prevent duplicates
      setSelectedProductIds(prev => {
        const newItems = mandatoryItems.filter(id => !prev.includes(id));
        return [...prev, ...newItems];
      });
    } else {
      setEnabledCategories(prev => prev.filter(id => id !== activeTabId));
      const categoryProductIds = realProducts
        .filter(p => p.categoryId === activeTabId)
        .map(p => p.id);
      setSelectedProductIds(prev =>
        prev.filter(id => !categoryProductIds.includes(id)),
      );
    }
  };

  const toggleProductSelection = (id: string, isMandatory: boolean) => {
    if (!enabledCategories.includes(activeTabId)) {
      Alert.alert(
        'Category Disabled',
        'Please enable this category to select products.',
      );
      return;
    }
    if (isMandatory) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (selectedProductIds.length === 0) {
      Alert.alert('Error', 'Please select at least one product.');
      return;
    }
    const payload = {
      categoryIds: enabledCategories,
      productIds: selectedProductIds,
    };

    console.log('📦 SENDING PAYLOAD:', payload);

    // Trigger the API call
    await updateInventory(payload);

    // Update initial state to current state (so hasChanges becomes false)
    setInitialEnabledCategories(enabledCategories);
    setInitialSelectedProductIds(selectedProductIds);

    navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
  };

  const activeCategory = categories?.data.find(c => c.id === activeTabId);
  const isCategoryEnabled = enabledCategories.includes(activeTabId);

  // Detect if user has made any changes
  const hasChanges = useMemo(() => {
    // Compare arrays by sorting and converting to strings
    const categoriesChanged =
      JSON.stringify([...enabledCategories].sort()) !==
      JSON.stringify([...initialEnabledCategories].sort());

    const productsChanged =
      JSON.stringify([...selectedProductIds].sort()) !==
      JSON.stringify([...initialSelectedProductIds].sort());

    return categoriesChanged || productsChanged;
  }, [enabledCategories, selectedProductIds, initialEnabledCategories, initialSelectedProductIds]);

  // Show Loader until hydration is complete
  if (!isHydrated && (!products || !categories)) {
    return (
      <Loader />
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
        >
          {/* [Index 0] HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>Vendor Portal</Text>
              <Text style={styles.headerTitle}>Manage Inventory</Text>
            </View>
            <View style={styles.profileIcon}>
              <Icon name="store-cog" size={26} color={COLORS.primary} />
            </View>
          </View>

          {/* [Index 1] STICKY SECTION */}
          <View style={{ backgroundColor: COLORS.background, zIndex: 10 }}>
            <View style={styles.tabsContainer}>
              <FlatList
                data={categories?.data}
                renderItem={({ item }) => (
                  <CategoryTab
                    item={item}
                    activeTabId={activeTabId}
                    setActiveTabId={setActiveTabId}
                    enabledCategories={enabledCategories}
                  />
                )}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SPACING }}
              />
            </View>

            <View style={styles.categoryActionHeader}>
              <View style={styles.categoryActionLeft}>
                <Text style={styles.categoryActionTitle}>
                  Selling {activeCategory?.name}?
                </Text>
                <Text style={styles.categoryActionSub}>
                  {isCategoryEnabled
                    ? 'Toggle off to stop selling this category.'
                    : 'Toggle on to select products.'}
                </Text>
              </View>
              <Switch
                trackColor={{ false: '#e0e0e0', true: COLORS.accent }}
                thumbColor={isCategoryEnabled ? COLORS.primary : '#f4f3f4'}
                onValueChange={toggleCategoryEnabled}
                value={isCategoryEnabled}
                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
              />
            </View>
          </View>

          {/* [Index 2] PRODUCTS GRID */}
          <View style={styles.gridContent}>
            {categoryProducts.length > 0 ? (
              <View style={styles.gridContainer}>
                {categoryProducts.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    selectedProductIds={selectedProductIds}
                    isCategoryEnabled={isCategoryEnabled}
                    toggleProductSelection={toggleProductSelection}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text>No products found in this category.</Text>
              </View>
            )}
            <View style={{ height: 100 + tabBarHeight }} />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* BOTTOM BAR - Only show when there are changes */}
      {hasChanges && (
        <View style={[styles.bottomBarContainer, { bottom: tabBarHeight }]}>
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomBarLabel}>Total Active Items</Text>
              <Text style={styles.bottomBarCount}>
                {selectedProductIds.length} Products
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isUpdating && { opacity: 0.7 }]} // 👈 Dim when loading
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isUpdating} // 👈 Disable when loading
            >
              {isUpdating ? (
                // 👈 Show Loader
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                  <Icon
                    name="arrow-right-circle"
                    size={20}
                    color={COLORS.white}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* DISABLED OVERLAY */}
      {!isCategoryEnabled && (
        <View style={styles.disabledOverlay} pointerEvents="none" />
      )}
    </View>
  );
};

const CategoryTab = ({
  item,
  activeTabId,
  setActiveTabId,
  enabledCategories,
}: {
  item: Category;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  enabledCategories: string[];
}) => {
  const isActiveTab = activeTabId === item.id;
  const isEnabled = enabledCategories.includes(item.id);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveTabId(item.id);
      }}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.tabImageContainer,
          isActiveTab && styles.tabImageContainerActive,
          !isEnabled && !isActiveTab && { opacity: 0.5 },
        ]}
      >
        <Image source={{ uri: item.image.url }} style={styles.tabImage} />
        {isActiveTab && <View style={styles.tabActiveOverlay} />}
        {isEnabled && (
          <View style={styles.categoryBadge}>
            <Icon name="check" size={10} color={COLORS.white} />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.tabText,
          isActiveTab ? styles.tabTextActive : { color: COLORS.textSecondary },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const ProductCard = ({
  item,
  selectedProductIds,
  isCategoryEnabled,
  toggleProductSelection,
}: {
  item: Product;
  selectedProductIds: string[];
  isCategoryEnabled: boolean;
  toggleProductSelection: (id: string, isMandatory: boolean) => void;
}) => {
  // Fix: Check if product is selected OR if it's mandatory and category is enabled
  // This ensures mandatory products show as selected immediately when category is toggled on
  const isSelected = selectedProductIds.includes(item.id) || (item.isMandatory && isCategoryEnabled);
  const isDisabled = !isCategoryEnabled;

  // Show selected styling for all selected products (including mandatory ones)
  const cardBg = isSelected ? '#FBF5FF' : COLORS.white;
  const borderColor = isSelected ? COLORS.primary : '#E0E0E0';
  const borderWidth = isSelected ? 2 : 1;
  const opacity = isDisabled && !isSelected ? 0.5 : 1;

  return (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor, borderWidth, opacity },
      ]}
      onPress={() => toggleProductSelection(item.id, item.isMandatory)}
      activeOpacity={0.9}
      disabled={isDisabled}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images[0]?.image?.url }}
          style={styles.productImage}
        />
        <View style={styles.imageOverlay} />
        <View
          style={[
            styles.checkCircle,
            isSelected
              ? { backgroundColor: COLORS.primary }
              : {
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: '#ddd',
              },
          ]}
        >
          <Icon
            name={isSelected ? 'check' : item.isMandatory ? 'lock' : 'circle'}
            size={14}
            color={isSelected ? COLORS.white : '#fefefeff'}
          />
        </View>
        {item.isMandatory && (
          <View style={styles.mandatoryTag}>
            <Text style={styles.mandatoryText}>MANDATORY</Text>
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>{item.weight}</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.pieceText}>{item.pieces}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Your Price</Text>
          <Text style={styles.priceValue}>
            ₹{parseToDecimal(item.vendorPrice)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // HEADER
  header: {
    paddingHorizontal: SPACING,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // TABS
  tabsContainer: {
    paddingVertical: 15,
  },
  tabItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  tabImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  tabImageContainerActive: {
    borderColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
  },
  tabImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#eee',
  },
  tabActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    backgroundColor: 'rgba(135, 25, 198, 0.15)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // CATEGORY TOGGLE SECTION
  categoryActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING,
    marginBottom: SPACING,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  categoryActionLeft: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  categoryActionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // GRID
  gridContent: {
    paddingHorizontal: SPACING,
    paddingBottom: 20,
  },
  // New Grid Container Style to mimic FlatList numColumns
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  checkCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mandatoryTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(34, 34, 34, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  mandatoryText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // CARD INFO
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  specBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dot: {
    marginHorizontal: 4,
    color: COLORS.muted,
    fontSize: 10,
  },
  pieceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // BOTTOM BAR
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING,
    paddingBottom: Platform.OS === 'ios' ? 20 : SPACING,
  },
  bottomBar: {
    backgroundColor: '#1E1E2D',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  bottomBarLabel: {
    color: '#8F9BB3',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bottomBarCount: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // DISABLED OVERLAY
  disabledOverlay: {
    position: 'absolute',
    top: 280, // Approximate height of sticky header area
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250,250,250, 0.4)',
    zIndex: 10,
  },
  disabledMessage: {
    alignItems: 'center',
    opacity: 0.3,
  },
  disabledText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.muted,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    opacity: 0.5,
  },
});

export default VendorInventoryScreen;