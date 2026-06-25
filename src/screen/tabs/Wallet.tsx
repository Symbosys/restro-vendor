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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/color';
import { useVendorWalletTransactions } from '../../hooks/wallet';
import { useAuth } from '../../context/AuthContext';
import { parseToDecimal } from '../../utils/utils';
import { TransactionType } from '../../types/wallet.type';

const { width: screenWidth } = Dimensions.get('window');

type FilterType = 'All' | 'Credits' | 'Debits' | 'Refunds' | 'Payouts';

const MyWalletScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');

  const filters: FilterType[] = ['All', 'Credits', 'Debits', 'Refunds', 'Payouts'];

  const { vendorId, isAuthenticated } = useAuth();

  const filterToType: Record<Exclude<FilterType, 'All'>, TransactionType> = {
    Credits: 'CREDIT',
    Debits: 'DEBIT',
    Refunds: 'REFUND',
    Payouts: 'PAYOUT',
  };

  const transactionType = selectedFilter === 'All' ? undefined : filterToType[selectedFilter];

  const {
    data: walletData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useVendorWalletTransactions({ vendorId: vendorId || "", transactionType }, { enabled: isAuthenticated });

  const flatTransactions = useMemo(
    () => walletData?.pages.flatMap((page) => page.transactions) || [],
    [walletData]
  );

  const balance = useMemo(
    () =>
      parseToDecimal(walletData?.pages?.[0]?.totalBalance).toFixed(2),
    [walletData]
  );

  const currency = useMemo(
    () => walletData?.pages?.[0]?.currency || 'INR',
    [walletData]
  );

  const handleFilterPress = useCallback((filter: FilterType) => {
    setSelectedFilter(filter);
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderTransaction = useCallback(
    ({ item }: { item: any }) => {
      const isIncoming = item.type === 'CREDIT' || item.type === 'REFUND';
      const iconName = isIncoming ? 'call-received' : 'call-made';
      const amountSign = isIncoming ? '+' : '-';
      const amountColor = isIncoming ? '#1DB954' : '#ff9fa3';
      const bgColor = isIncoming ? '#f0fff4' : '#fef2f2';
      const iconBgColor = isIncoming ? '#d1fae5' : '#fecaca';
      const iconColor = isIncoming ? '#10b981' : '#ef4444';

      const title = item.description || `${item.type} Transaction`;
      const subtitle =
        item.orderId
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
        <View
          style={[
            styles.transactionCard,
            { backgroundColor: bgColor },
          ]}
        >
          <View
            style={[
              styles.transactionIcon,
              { backgroundColor: iconBgColor },
            ]}
          >
            <Icon
              name={iconName as any}
              size={24}
              color={iconColor}
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>{title}</Text>
            <Text style={styles.transactionSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                { color: amountColor },
              ]}
            >
              {formattedAmount}
            </Text>
            <Text style={styles.transactionDate}>{formattedDate}</Text>
          </View>
        </View>
      );
    },
    []
  );

  const getEmptyMessage = useCallback((filter: FilterType) => {
    switch (filter) {
      case 'All':
        return { title: 'No Transactions Yet', subtitle: 'Your transaction history will appear here.' };
      case 'Credits':
        return { title: 'No Credit Transactions', subtitle: 'Credit transactions will appear here.' };
      case 'Debits':
        return { title: 'No Debit Transactions', subtitle: 'Debit transactions will appear here.' };
      case 'Refunds':
        return { title: 'No Refund Transactions', subtitle: 'Refund transactions will appear here.' };
      case 'Payouts':
        return { title: 'No Payout Transactions', subtitle: 'Payout transactions will appear here.' };
      default:
        return { title: 'No Transactions', subtitle: 'Try adjusting your filter.' };
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
        <Icon name="account-balance-wallet" size={64} color={COLORS.textSecondary} />
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

  const renderHeaderComponent = useCallback(() => (
    <>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="account-balance-wallet" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>{currency} {balance}</Text>
          <Text style={styles.balanceLabel}>Available Balance</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.withdrawButtonFull}>
            <Text style={styles.withdrawText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
          {filters.map((filter) => (
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
  ), [balance, currency, selectedFilter, handleFilterPress]);

  if (isLoading && !walletData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={flatTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooterComponent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
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
  header: {
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    marginTop: 16,
  },
  balance: {
    fontSize: 50,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.015,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 16,
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
  withdrawText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.015,
  },
  stickySection: {
    backgroundColor: COLORS.white,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#160e1b',
    letterSpacing: -0.015,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginRight: 16,
  },
  filtersContent: {
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    minWidth: 88,
  },
  activeFilterButton: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  activeFilterText: {
    color: COLORS.primary,
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
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
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