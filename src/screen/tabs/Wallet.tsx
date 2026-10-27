import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/color';
import { useVendorWalletTransactions } from '../../hooks/wallet';
import { useAuth } from '../../context/AuthContext';
import { parseToDecimal } from '../../utils/utils';
import { TransactionType } from '../../types/wallet.type';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';

type FilterType = 'All' | 'Credits' | 'Debits' | 'Refunds' | 'Payouts';

const MyWalletScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');

  const filters: FilterType[] = ['All', 'Credits', 'Debits', 'Refunds'];

  const { vendorId, isAuthenticated } = useAuth();

  const filterToType: Record<Exclude<FilterType, 'All'>, TransactionType> = {
    Credits: 'CREDIT',
    Debits: 'DEBIT',
    Refunds: 'REFUND',
    Payouts: 'PAYOUT',
  };

  const transactionType =
    selectedFilter === 'All' ? undefined : filterToType[selectedFilter];

  const {
    data: walletData,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useVendorWalletTransactions(
    { vendorId: vendorId || '', transactionType },
    { enabled: isAuthenticated },
  );

  const flatTransactions = useMemo(
    () => walletData?.pages.flatMap(page => page.transactions) || [],
    [walletData],
  );

  const balance = useMemo(
    () => parseToDecimal(walletData?.pages?.[0]?.totalBalance).toFixed(2),
    [walletData],
  );

  const currency = useMemo(
    () => walletData?.pages?.[0]?.currency || 'INR',
    [walletData],
  );

  const handleFilterPress = useCallback((filter: FilterType) => {
    setSelectedFilter(filter);
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderTransaction = useCallback(({ item }: { item: any }) => {
    const isIncoming = item.type === 'CREDIT' || item.type === 'REFUND';
    const iconName = isIncoming ? 'call-received' : 'call-made';
    const amountSign = isIncoming ? '+' : '-';
    const amountColor = isIncoming ? '#1DB954' : '#ff9fa3';
    const bgColor = isIncoming ? '#f0fff4' : '#fef2f2';
    const iconBgColor = isIncoming ? '#d1fae5' : '#fecaca';
    const iconColor = isIncoming ? '#10b981' : '#ef4444';

    const title = item.description || `${item.type} Transaction`;
    const subtitle = item.orderId
      ? `Order #${item.orderId}`
      : item.referenceId
      ? `Ref: ${item.referenceId}`
      : 'N/A';

    const formattedAmount = `${amountSign} ₹ ${parseToDecimal(item.amount)}`;
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={[styles.transactionCard, { backgroundColor: bgColor }]}>
        <View
          style={[styles.transactionIcon, { backgroundColor: iconBgColor }]}
        >
          <Icon name={iconName as any} size={24} color={iconColor} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{title}</Text>
          <Text style={styles.transactionSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {formattedAmount}
          </Text>
          <Text style={styles.transactionDate}>{formattedDate}</Text>
        </View>
      </View>
    );
  }, []);

  const getEmptyMessage = useCallback((filter: FilterType) => {
    switch (filter) {
      case 'All':
        return {
          title: 'No Transactions Yet',
          subtitle: 'Your transaction history will appear here.',
        };
      case 'Credits':
        return {
          title: 'No Credit Transactions',
          subtitle: 'Credit transactions will appear here.',
        };
      case 'Debits':
        return {
          title: 'No Debit Transactions',
          subtitle: 'Debit transactions will appear here.',
        };
      case 'Refunds':
        return {
          title: 'No Refund Transactions',
          subtitle: 'Refund transactions will appear here.',
        };
      case 'Payouts':
        return {
          title: 'No Payout Transactions',
          subtitle: 'Payout transactions will appear here.',
        };
      default:
        return {
          title: 'No Transactions',
          subtitle: 'Try adjusting your filter.',
        };
    }
  }, []);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading transactions...</Text>
        </View>
      );
    }
    const { title, subtitle } = getEmptyMessage(selectedFilter);
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Icon name="account-balance-wallet" size={70} color="#7654B5" />
          <View style={styles.emptyIconDot} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
      </View>
    );
  }, [isLoading, selectedFilter, getEmptyMessage]);

  const renderFooterComponent = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderHeaderComponent = useCallback(
    () => (
      <>
        {/* Header */}
        <View style={styles.headerShell}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={26} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Wallet</Text>
            <View style={styles.headerIcon}>
              <Icon
                name="account-balance-wallet"
                size={26}
                color={COLORS.white}
              />
            </View>
          </View>

          <LinearGradient
            colors={['#45217D', '#32165F', '#4A1D68', '#F58232']}
            locations={[0, 0.55, 0.82, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View pointerEvents="none" style={styles.balanceGlowTop} />
            <View pointerEvents="none" style={styles.balanceGlowBottom} />
            <View style={styles.balanceContainer}>
              <Text style={styles.balance}>
                {currency} {balance}
              </Text>
              <Text style={styles.balanceLabel}>Available Balance</Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.withdrawButtonFull}
                onPress={() => navigation.navigate('Payout')}
                activeOpacity={0.85}
              >
                <Icon name="send" size={21} color="#F97316" />
                <Text style={styles.withdrawText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Sticky Section: History Header + Filters */}
        <View style={styles.stickySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Transaction History</Text>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterPress(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.activeFilterText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </>
    ),
    [balance, currency, selectedFilter, handleFilterPress, navigation],
  );

  if (isLoading && !walletData) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={flatTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooterComponent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  headerShell: {
    backgroundColor: '#32165F',
    paddingTop: 4,
    paddingBottom: 0,
  },
  headerTop: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  balanceCard: {
    marginTop: 4,
    marginHorizontal: 16,
    minHeight: 310,
    paddingTop: 30,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: 'hidden',
  },
  balanceGlowTop: {
    position: 'absolute',
    top: -90,
    left: -60,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(155, 108, 226, 0.12)',
  },
  balanceGlowBottom: {
    position: 'absolute',
    right: -105,
    bottom: -95,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 143, 57, 0.16)',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.015,
  },
  balanceContainer: {
    alignItems: 'center',
    marginTop: 44,
    paddingHorizontal: 12,
  },
  balance: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.8,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.76)',
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 38,
    paddingHorizontal: 24,
  },
  addMoneyButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.015,
  },
  withdrawButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.5)',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  withdrawButtonFull: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EAF8',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  withdrawText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#29134F',
  },
  stickySection: {
    backgroundColor: COLORS.white,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  historyTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#29134F',
  },
  filtersContainer: {
    paddingBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 24,
    paddingRight: 40,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F4F1FA',
    minWidth: 88,
  },
  activeFilterButton: {
    backgroundColor: '#4A2185',
    shadowColor: '#4A2185',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#77718A',
    textAlign: 'center',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 16,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 80,
    paddingHorizontal: 24,
    backgroundColor: '#FFFEFC',
  },
  emptyIconCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#F3EEFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyIconDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F97316',
    right: 60,
    top: 83,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#29134F',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default MyWalletScreen;
