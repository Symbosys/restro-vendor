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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/color';
import { useGetAllProducts } from '../../hooks/useProducts';
import { useGetAllCategories } from '../../hooks/useCategory';
import { useGetVendorModes } from '../../hooks/useMode';
import { Category, Product, Mode } from '../../types/product.type';
import { parseToDecimal } from '../../utils/utils';
import { useUpdateInventory } from '../../hooks/useInventory';
import Loader from '../../components/ui/Loader';
import { useVendorById } from '../../hooks/useVendorQueries';

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
  const insets = useSafeAreaInsets();
  const isTabScreen = route.name === 'Inventory';
  const tabBarHeight = isTabScreen ? (Platform.OS === 'ios' ? 90 : 75) : 0;

  const { updateInventory, isUpdating } = useUpdateInventory();
  const { data: vendor } = useVendorById();

  // Mode, Category, and Product Queries
  const { data: modesResponse, isLoading: isModesLoading } =
    useGetVendorModes();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetAllCategories();
  const { data: productsResponse, isLoading: isProductsLoading } =
    useGetAllProducts();

  // Selection states
  const [selectedModeIds, setSelectedModeIds] = useState<string[]>([]);
  const [enabledCategories, setEnabledCategories] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Snapshots for change detection
  const [initialSelectedModeIds, setInitialSelectedModeIds] = useState<
    string[]
  >([]);
  const [initialEnabledCategories, setInitialEnabledCategories] = useState<
    string[]
  >([]);
  const [initialSelectedProductIds, setInitialSelectedProductIds] = useState<
    string[]
  >([]);

  // Active mode & active category view
  const [activeModeTabId, setActiveModeTabId] = useState<string>('');
  const [activeTabId, setActiveTabId] = useState<string>('');

  // Hydration state
  const [isHydrated, setIsHydrated] = useState(false);

  const allModes = modesResponse?.data || [];
  const allCategories = categoriesResponse?.data || [];
  const allProducts = productsResponse?.data?.products || [];

  // ==========================================================
  // ⚡️ Hydrate State from API Responses
  // ==========================================================
  useEffect(() => {
    if (
      isHydrated ||
      !modesResponse?.data ||
      !categoriesResponse?.data ||
      !productsResponse?.data
    ) {
      return;
    }

    const apiModes = modesResponse.data;
    const apiCategories = categoriesResponse.data;
    const apiProducts = productsResponse.data.products;

    // 1. Pre-selected Modes
    const preSelectedModeIds = apiModes
      .filter((m: any) => m.isSelected)
      .map((m: any) => m.id);

    // If vendor has no modes pre-selected yet, default to first mode
    const finalModeIds =
      preSelectedModeIds.length > 0
        ? preSelectedModeIds
        : apiModes.length > 0
        ? [apiModes[0].id]
        : [];

    // 2. Pre-selected Categories
    const preSelectedCategoryIds = apiCategories
      .filter((cat: any) => cat.isSelected)
      .map((cat: any) => cat.id);

    // 3. Pre-selected Products
    const preSelectedProductIds = apiProducts
      .filter((prod: any) => prod.isAvailable)
      .map((prod: any) => prod.id);

    // 4. Update states
    setSelectedModeIds(finalModeIds);
    setEnabledCategories(preSelectedCategoryIds);
    setSelectedProductIds(preSelectedProductIds);

    // 5. Save initial snapshots
    setInitialSelectedModeIds(finalModeIds);
    setInitialEnabledCategories(preSelectedCategoryIds);
    setInitialSelectedProductIds(preSelectedProductIds);

    // 6. Set initial active mode & category tab
    const initialModeId = finalModeIds[0] || (apiModes[0]?.id ?? '');
    setActiveModeTabId(initialModeId);

    const categoriesForInitialMode = apiCategories.filter(
      (c: any) => !c.modeId || c.modeId === initialModeId,
    );
    if (categoriesForInitialMode.length > 0) {
      setActiveTabId(categoriesForInitialMode[0].id);
    } else if (apiCategories.length > 0) {
      setActiveTabId(apiCategories[0].id);
    }

    setIsHydrated(true);
  }, [modesResponse, categoriesResponse, productsResponse, isHydrated]);

  // Categories filtered by the active mode being viewed
  const visibleCategories = useMemo(() => {
    if (!allCategories.length) return [];
    if (!activeModeTabId) {
      return allCategories;
    }
    return allCategories.filter(
      (c: any) => !c.modeId || c.modeId === activeModeTabId,
    );
  }, [allCategories, activeModeTabId]);

  // Products under active category
  const categoryProducts = useMemo(() => {
    return allProducts.filter((p: any) => p.categoryId === activeTabId);
  }, [allProducts, activeTabId]);

  // Active Category & Enabled Status
  const activeCategory = allCategories.find((c: any) => c.id === activeTabId);
  const isCategoryEnabled = enabledCategories.includes(activeTabId);

  // ==========================================================
  // 🔘 Mode Selection / Activation Handlers
  // ==========================================================
  const handleModeCardPress = (modeId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Always switch active view to this mode
    setActiveModeTabId(modeId);
    const catsForMode = allCategories.filter((c: any) => c.modeId === modeId);
    if (catsForMode.length > 0) {
      setActiveTabId(catsForMode[0].id);
    }

    // If it was not selected in the shop, select it too!
    if (!selectedModeIds.includes(modeId)) {
      setSelectedModeIds(prev => [...prev, modeId]);
    }
  };

  const handleToggleModeSelectionOnly = (modeId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const isCurrentlySelected = selectedModeIds.includes(modeId);

    if (isCurrentlySelected) {
      if (selectedModeIds.length === 1) {
        Alert.alert(
          'Mode Required',
          'Your shop must support at least one operational mode.',
        );
        return;
      }

      const categoriesInThisMode = allCategories
        .filter((c: any) => c.modeId === modeId)
        .map((c: any) => c.id);

      const hasEnabledCategories = categoriesInThisMode.some((catId: string) =>
        enabledCategories.includes(catId),
      );

      const performDeselect = () => {
        const nextSelectedModes = selectedModeIds.filter(id => id !== modeId);
        setSelectedModeIds(nextSelectedModes);

        // Remove categories and their products under this mode
        setEnabledCategories(prev =>
          prev.filter(cId => !categoriesInThisMode.includes(cId)),
        );

        const productsInThisMode = allProducts
          .filter((p: any) => categoriesInThisMode.includes(p.categoryId))
          .map((p: any) => p.id);

        setSelectedProductIds(prev =>
          prev.filter(pId => !productsInThisMode.includes(pId)),
        );

        // If the deselected mode was currently active, switch to another selected mode
        if (activeModeTabId === modeId) {
          const fallbackModeId = nextSelectedModes[0] || '';
          setActiveModeTabId(fallbackModeId);
          const fallbackCats = allCategories.filter(
            (c: any) => c.modeId === fallbackModeId,
          );
          if (fallbackCats.length > 0) {
            setActiveTabId(fallbackCats[0].id);
          }
        }
      };

      if (hasEnabledCategories) {
        Alert.alert(
          'Disable Mode?',
          'Deselecting this mode will disable its categories and products from your inventory.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Disable', style: 'destructive', onPress: performDeselect },
          ],
        );
      } else {
        performDeselect();
      }
    } else {
      setSelectedModeIds(prev => [...prev, modeId]);
      setActiveModeTabId(modeId);
      const catsForMode = allCategories.filter((c: any) => c.modeId === modeId);
      if (catsForMode.length > 0) {
        setActiveTabId(catsForMode[0].id);
      }
    }
  };

  // ==========================================================
  // 🔘 Category Toggle Handler
  // ==========================================================
  const toggleCategoryEnabled = (val: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (val) {
      setEnabledCategories(prev => [...prev, activeTabId]);
      const mandatoryItems: string[] = allProducts
        .filter((p: any) => p.categoryId === activeTabId && p.isMandatory)
        .map((p: any) => String(p.id));

      setSelectedProductIds(prev => {
        const newItems = mandatoryItems.filter(
          (id: string) => !prev.includes(id),
        );
        return [...prev, ...newItems];
      });
    } else {
      setEnabledCategories(prev => prev.filter(id => id !== activeTabId));
      const categoryProductIds = allProducts
        .filter((p: any) => p.categoryId === activeTabId)
        .map((p: any) => p.id);
      setSelectedProductIds(prev =>
        prev.filter(id => !categoryProductIds.includes(id)),
      );
    }
  };

  // ==========================================================
  // 🔘 Product Selection Handler
  // ==========================================================
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

  // ==========================================================
  // 💾 Save Inventory
  // ==========================================================
  const handleSave = async () => {
    if (selectedModeIds.length === 0) {
      Alert.alert('Error', 'Please select at least one operational mode.');
      return;
    }
    if (enabledCategories.length === 0) {
      Alert.alert('Error', 'Please enable at least one category.');
      return;
    }
    if (selectedProductIds.length === 0) {
      Alert.alert('Error', 'Please select at least one product.');
      return;
    }

    const payload = {
      modeIds: selectedModeIds,
      categoryIds: enabledCategories,
      productIds: selectedProductIds,
    };

    console.log('📦 SENDING INVENTORY PAYLOAD:', payload);

    await updateInventory(payload);

    setInitialSelectedModeIds(selectedModeIds);
    setInitialEnabledCategories(enabledCategories);
    setInitialSelectedProductIds(selectedProductIds);

    if (vendor?.status === 'APPROVED') {
      navigation.goBack();
    } else {
      navigation.navigate('BankAccount');
    }
  };

  // ==========================================================
  // 🔎 Change Detection
  // ==========================================================
  const hasChanges = useMemo(() => {
    const modesChanged =
      JSON.stringify([...selectedModeIds].sort()) !==
      JSON.stringify([...initialSelectedModeIds].sort());

    const categoriesChanged =
      JSON.stringify([...enabledCategories].sort()) !==
      JSON.stringify([...initialEnabledCategories].sort());

    const productsChanged =
      JSON.stringify([...selectedProductIds].sort()) !==
      JSON.stringify([...initialSelectedProductIds].sort());

    return modesChanged || categoriesChanged || productsChanged;
  }, [
    selectedModeIds,
    initialSelectedModeIds,
    enabledCategories,
    initialEnabledCategories,
    selectedProductIds,
    initialSelectedProductIds,
  ]);

  if (
    !isHydrated &&
    (isModesLoading || isCategoriesLoading || isProductsLoading)
  ) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
        >
          {/* [Index 0] HEADER & ENHANCED MODE CARDS (NO OUTER WRAPPER, NO EXTRA TEXT) */}
          <View>
            <View style={styles.header}>
              {/* Soft brand-colour accents in the header background */}
              <View pointerEvents="none" style={styles.headerPurpleGlow} />
              <View pointerEvents="none" style={styles.headerOrangeGlow} />
              <View style={styles.headerContent}>
                <View style={styles.headerTextContent}>
                  <Text style={styles.headerSubtitle}>VENDOR PORTAL</Text>
                  <Text style={styles.headerTitle}>
                    Manage{' '}
                    <Text style={styles.headerTitleAccent}>Inventory</Text>
                  </Text>
                  <Text style={styles.headerDescription}>
                    Configure your shop's modes, categories & products
                  </Text>
                </View>
                <View style={styles.profileIcon}>
                  <Icon name="store-cog" size={27} color={COLORS.primary} />
                </View>
              </View>
            </View>

            {/* Enhanced Mode Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modeCarouselContent}
            >
              {allModes.map((mode: Mode) => {
                const isSelected = selectedModeIds.includes(mode.id);
                const isActiveView = activeModeTabId === mode.id;
                const modeImgUrl =
                  typeof mode.image === 'string'
                    ? mode.image
                    : mode.image?.url ||
                      (mode.image as any)?.secure_url ||
                      null;

                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.modeCard,
                      isActiveView && styles.modeCardActiveView,
                      !isActiveView && isSelected && styles.modeCardSelected,
                      !isSelected && styles.modeCardUnselected,
                    ]}
                    onPress={() => handleModeCardPress(mode.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.modeCardHeader}>
                      <View
                        style={[
                          styles.modeIconContainer,
                          isActiveView && styles.modeIconContainerActive,
                        ]}
                      >
                        {modeImgUrl ? (
                          <Image
                            source={{ uri: modeImgUrl }}
                            style={styles.modeImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Icon
                            name="silverware-fork-knife"
                            size={22}
                            color={isActiveView ? COLORS.primary : '#6B7280'}
                          />
                        )}
                      </View>

                      {/* Mode On/Off Switch */}
                      <Switch
                        trackColor={{ false: '#E2E8F0', true: COLORS.accent }}
                        thumbColor={isSelected ? COLORS.primary : '#FFFFFF'}
                        onValueChange={() =>
                          handleToggleModeSelectionOnly(mode.id)
                        }
                        value={isSelected}
                        style={
                          Platform.OS === 'ios'
                            ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }
                            : { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.modeName,
                        isActiveView && styles.modeNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {mode.name}
                    </Text>

                    <View style={styles.modeMetaRow}>
                      {mode.badge ? (
                        <View style={styles.modeBadge}>
                          <Text style={styles.modeBadgeText}>{mode.badge}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.modeCategoryCount}>
                        {mode.categoryCount || 0} Categories
                      </Text>
                    </View>

                    {/* Active view indicator pill */}
                    {isActiveView && (
                      <View style={styles.activePill}>
                        <View style={styles.activePillDot} />
                        <Text style={styles.activePillText}>Viewing</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* [Index 1] STICKY CATEGORIES & TOGGLE SECTION */}
          <View style={styles.stickySection}>
            {/* Category Avatar Tabs */}
            {visibleCategories.length > 0 ? (
              <View style={styles.tabsContainer}>
                <FlatList
                  data={visibleCategories}
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
            ) : null}

            {/* Category Toggle Card */}
            {activeCategory && (
              <View style={styles.categoryActionCard}>
                <View style={styles.categoryActionLeft}>
                  <Text style={styles.categoryActionTitle} numberOfLines={1}>
                    Selling {activeCategory.name}?
                  </Text>
                  <Text style={styles.categoryActionSub}>
                    {isCategoryEnabled
                      ? 'Toggle off to stop selling this category.'
                      : 'Toggle on to select products.'}
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: '#E2E8F0', true: COLORS.accent }}
                  thumbColor={isCategoryEnabled ? COLORS.primary : '#FFFFFF'}
                  onValueChange={toggleCategoryEnabled}
                  value={isCategoryEnabled}
                  style={{ transform: [{ scaleX: 1.05 }, { scaleY: 1.05 }] }}
                />
              </View>
            )}
          </View>

          {/* [Index 2] PRODUCTS GRID */}
          <View style={styles.gridContent}>
            {categoryProducts.length > 0 ? (
              <View style={styles.gridContainer}>
                {categoryProducts.map((item: Product) => (
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
                <Icon
                  name="package-variant"
                  size={44}
                  color="#D1D5DB"
                  style={{ marginBottom: 6 }}
                />
                <Text style={styles.emptyStateText}>
                  No products found in this category.
                </Text>
              </View>
            )}
            <View style={{ height: 120 + tabBarHeight }} />
          </View>
        </ScrollView>
      </View>

      {/* BOTTOM BAR - Show when changes exist */}
      {hasChanges && (
        <View
          style={[
            styles.bottomBarContainer,
            { bottom: Math.max(tabBarHeight, insets.bottom) },
          ]}
        >
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomBarLabel}>Inventory Selected</Text>
              <Text style={styles.bottomBarCount}>
                {selectedModeIds.length} Modes • {selectedProductIds.length}{' '}
                Products
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isUpdating && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
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
  const catImgUrl =
    typeof item.image === 'string'
      ? item.image
      : item.image?.url || (item.image as any)?.secure_url || null;

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
          !isEnabled && !isActiveTab && { opacity: 0.6 },
        ]}
      >
        {catImgUrl ? (
          <Image source={{ uri: catImgUrl }} style={styles.tabImage} />
        ) : (
          <View style={styles.tabFallback}>
            <Icon name="food" size={24} color={COLORS.primary} />
          </View>
        )}
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
        numberOfLines={2}
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
  const isSelected =
    selectedProductIds.includes(item.id) ||
    (item.isMandatory && isCategoryEnabled);
  const isDisabled = !isCategoryEnabled;

  const cardBg = isSelected ? '#FAF5FF' : COLORS.white;
  const borderColor = isSelected ? COLORS.primary : '#E5E7EB';
  const borderWidth = isSelected ? 2 : 1;
  const opacity = isDisabled && !isSelected ? 0.5 : 1;

  const productImgUrl =
    item.images?.[0]?.image?.url ||
    (item.images?.[0]?.image as any)?.secure_url ||
    null;

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
        {productImgUrl ? (
          <Image source={{ uri: productImgUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productImageFallback}>
            <Icon name="image" size={32} color="#D1D5DB" />
          </View>
        )}
        <View style={styles.imageOverlay} />
        <View
          style={[
            styles.checkCircle,
            isSelected
              ? { backgroundColor: COLORS.primary }
              : {
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                },
          ]}
        >
          <Icon
            name={isSelected ? 'check' : item.isMandatory ? 'lock' : 'circle'}
            size={13}
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
            <Text style={styles.specText}>{item.weight || 'Std'}</Text>
          </View>
          {item.pieces ? (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.pieceText}>{item.pieces}</Text>
            </>
          ) : null}
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Your Price</Text>
          <Text style={styles.priceValue}>
            ₹{parseToDecimal(item.vendorPrice ?? item.sellingPrice)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  // HEADER
  header: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    backgroundColor: '#FCF9FF',
  },
  headerPurpleGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -112,
    right: 42,
    backgroundColor: 'rgba(113, 45, 190, 0.10)',
  },
  headerOrangeGlow: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 73,
    top: -68,
    right: -76,
    backgroundColor: 'rgba(255, 111, 24, 0.10)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#5B16B8',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  headerTitle: {
    fontSize: 27,
    color: '#32105F',
    fontWeight: '800',
    marginTop: 5,
    letterSpacing: -0.5,
  },
  headerTitleAccent: {
    color: '#6A20C8',
  },
  headerDescription: {
    fontSize: 13,
    color: '#77718A',
    marginTop: 5,
    lineHeight: 19,
  },
  profileIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E6FF',
    shadowColor: '#3B126E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // MODE CAROUSEL CONTENT (Directly below header)
  modeCarouselContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  modeCard: {
    width: CARD_WIDTH,
    minHeight: 194,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    shadowColor: '#3B126E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  modeCardActiveView: {
    borderColor: '#5713B8',
    backgroundColor: '#FBF7FF',
    borderWidth: 2,
    shadowColor: '#5713B8',
    shadowOpacity: 0.12,
    elevation: 4,
  },
  modeCardSelected: {
    borderColor: '#E6D8FF',
    backgroundColor: '#FFFFFF',
  },
  modeCardUnselected: {
    borderColor: '#E9DFFF',
    backgroundColor: '#FFFFFF',
    opacity: 1,
  },
  modeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F5F1FA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modeIconContainerActive: {
    backgroundColor: 'rgba(135, 25, 198, 0.1)',
  },
  modeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  modeCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeCheckCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#32105F',
    marginTop: 2,
  },
  modeNameActive: {
    color: COLORS.primary,
  },
  modeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  modeBadge: {
    backgroundColor: '#FFF0D8',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D96A0B',
    textTransform: 'uppercase',
  },
  modeCategoryCount: {
    fontSize: 11,
    color: '#77718A',
    fontWeight: '600',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0E1FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 10,
    gap: 5,
  },
  activePillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5713B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // STICKY SECTION (CATEGORIES + TOGGLE)
  stickySection: {
    backgroundColor: '#FFFEFC',
    zIndex: 10,
    paddingBottom: 6,
  },

  // CATEGORY TABS
  tabsContainer: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 92,
  },
  tabImageContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3,
    borderWidth: 2,
    borderColor: '#F0E5FF',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#3B126E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  tabImageContainerActive: {
    borderColor: COLORS.primary,
  },
  tabImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#F3F0F8',
  },
  tabFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#F3F0F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    backgroundColor: 'rgba(91, 22, 184, 0.10)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    color: '#77718A',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // CATEGORY ACTION CARD
  categoryActionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FBF7FF',
    marginHorizontal: SPACING,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F0E3FF',
    shadowColor: '#3B126E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryActionLeft: {
    flex: 1,
    marginRight: 12,
  },
  categoryActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#32105F',
  },
  categoryActionSub: {
    fontSize: 12,
    color: '#77718A',
    marginTop: 4,
    lineHeight: 17,
  },

  // GRID & PRODUCTS
  gridContent: {
    paddingHorizontal: SPACING,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 46,
  },
  emptyStateText: {
    color: '#32105F',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    marginBottom: SPACING,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 115,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImageFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
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
  },
  mandatoryTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mandatoryText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  specBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  specText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dot: {
    marginHorizontal: 4,
    color: '#9CA3AF',
    fontSize: 10,
  },
  pieceText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // BOTTOM BAR
  bottomBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: SPACING,
    paddingBottom: 8,
  },
  bottomBar: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBarLabel: {
    fontSize: 10,
    color: '#D1D5DB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomBarCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  disabledOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});

export default VendorInventoryScreen;
