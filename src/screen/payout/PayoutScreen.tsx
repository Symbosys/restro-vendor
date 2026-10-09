import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/color';
import { useAuth } from '../../context/AuthContext';
import { useVendorWalletTransactions } from '../../hooks/wallet';
import { useBankAccounts } from '../../api/hooks/bank';
import {
  useRequestPayout,
  useVendorPayouts,
  useCancelVendorPayout,
} from '../../api/hooks/payout';
import { parseToDecimal } from '../../utils/utils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { MIN_PAYOUT_AMOUNT } from '../../constants/payout.constant';

const { width: screenWidth } = Dimensions.get('window');

interface BankAccount {
  id: string | number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  status: string;
  ifsc?: string;
  branch?: string;
}

const PayoutScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { vendorId, isAuthenticated } = useAuth();

  // Modal State for payout request
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | number>('');

  // Fetch Wallet transactions (to get balance)
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } =
    useVendorWalletTransactions(
      { vendorId: vendorId || "", limit: 1 },
      { enabled: isAuthenticated }
    );

  // Fetch Payout history
  const {
    data: payoutData,
    isLoading: payoutsLoading,
    refetch: refetchPayouts,
    isFetching: payoutsFetching,
  } = useVendorPayouts({ page: 1, limit: 100 });

  // Fetch Bank Accounts
  const { data: bankAccounts = [], isLoading: banksLoading, refetch: refetchBanks } =
    useBankAccounts();

  // Mutations
  const requestPayoutMutation = useRequestPayout();
  const cancelPayoutMutation = useCancelVendorPayout();

  // Wallet balance and currency calculations
  const balance = useMemo(() => {
    return parseToDecimal(walletData?.pages?.[0]?.totalBalance);
  }, [walletData]);

  const currency = useMemo(() => {
    return walletData?.pages?.[0]?.currency || 'INR';
  }, [walletData]);

  // Filters APPROVED bank accounts
  const approvedBanks: BankAccount[] = useMemo(() => {
    return bankAccounts.filter((bank: BankAccount) => bank.status === 'APPROVED');
  }, [bankAccounts]);

  const onRefresh = useCallback(() => {
    refetchWallet();
    refetchPayouts();
    refetchBanks();
  }, [refetchWallet, refetchPayouts, refetchBanks]);

  // Open payout request modal & auto-select bank if available
  const handleOpenRequestModal = () => {
    if (approvedBanks.length === 0) {
      Alert.alert(
        'Bank Account Required',
        'You do not have an APPROVED bank account. Please add a bank account and wait for its approval to request payouts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Bank', onPress: () => navigation.navigate('BankList') },
        ]
      );
      return;
    }
    // Auto-select first approved bank
    setSelectedBankId(approvedBanks[0].id);
    setAmount('');
    setModalVisible(true);
  };

  const handleRequestPayout = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < MIN_PAYOUT_AMOUNT) {
      Alert.alert('Invalid Amount', `Minimum payout amount is ₹${MIN_PAYOUT_AMOUNT}.`);
      return;
    }

    if (parsedAmount > balance) {
      Alert.alert('Insufficient Balance', 'Payout amount cannot exceed available balance.');
      return;
    }

    if (!selectedBankId) {
      Alert.alert('Select Bank Account', 'Please choose a bank account.');
      return;
    }

    requestPayoutMutation.mutate(
      {
        amount: parsedAmount,
        bankAccountId: selectedBankId,
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          onRefresh();
        },
      }
    );
  };

  const handleCancelPayout = (payoutId: string | number) => {
    Alert.alert(
      'Cancel Payout Request',
      'Are you sure you want to cancel this pending payout request? The amount will be refunded to your wallet.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: () => {
            cancelPayoutMutation.mutate(payoutId, {
              onSuccess: () => {
                onRefresh();
              },
            });
          },
        },
      ]
    );
  };

  const renderPayoutItem = ({ item }: { item: any }) => {
    // Determine status badge color
    const isPending = item.status === 'PENDING';
    const isSuccess = item.status === 'SUCCESS';
    const isRejected = item.status === 'REJECTED';
    const isFailed = item.status === 'FAILED';

    let badgeColor = '#6B7280'; // gray
    let badgeText = item.status;
    let cardBg = '#FFFFFF';

    if (isPending) {
      badgeColor = '#F59E0B'; // orange
      badgeText = 'Pending';
      cardBg = '#FFFBEB';
    } else if (isSuccess) {
      badgeColor = '#10B981'; // green
      badgeText = 'Completed';
      cardBg = '#ECFDF5';
    } else if (isRejected || isFailed) {
      badgeColor = '#EF4444'; // red
      badgeText = isRejected ? 'Rejected' : 'Failed';
      cardBg = '#FEF2F2';
    }

    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const bankDetails = item.bankAccount
      ? `${item.bankAccount.bankName} (**** ${item.bankAccount.accountNumber.slice(-4)})`
      : 'N/A';

    return (
      <View style={[styles.payoutCard, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardAmount}>₹ {parseToDecimal(item.amount).toFixed(2)}</Text>
            <Text style={styles.cardDate}>{formattedDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.statusText}>{badgeText}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Icon name="account-balance" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailValue}>{bankDetails}</Text>
          </View>

          {item.reference && (
            <View style={styles.detailRow}>
              <Icon name="receipt" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailValue}>Ref: {item.reference}</Text>
            </View>
          )}

          {(item.rejectReason || item.failureReason) && (
            <View style={styles.detailRow}>
              <Icon name="error" size={16} color={COLORS.primary} />
              <Text style={styles.reasonText}>
                Reason: {item.rejectReason || item.failureReason}
              </Text>
            </View>
          )}
        </View>

        {isPending && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelPayout(item.id.toString())}
            disabled={cancelPayoutMutation.isPending}
          >
            {cancelPayoutMutation.isPending ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Icon name="close" size={18} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceHeader}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payouts</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceValue}>
            {currency} {balance.toFixed(2)}
          </Text>
          <Text style={styles.balanceLabel}>Withdrawable Balance</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.requestButton,
              approvedBanks.length === 0 && styles.disabledRequestButton,
            ]}
            onPress={handleOpenRequestModal}
          >
            <Text style={styles.requestButtonText}>Request Payout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {approvedBanks.length === 0 && (
        <View style={styles.warningCard}>
          <Icon name="warning" size={24} color="#D97706" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Setup Bank Account</Text>
            <Text style={styles.warningText}>
              You must have an approved bank account to request payouts.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('BankList')}>
              <Text style={styles.warningLink}>Manage Bank Accounts →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Payout History</Text>
    </>
  );

  const listData = payoutData?.payouts || [];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listData}
        renderItem={renderPayoutItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={payoutsFetching || walletLoading || banksLoading}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !payoutsLoading ? (
            <View style={styles.emptyContainer}>
              <Icon name="payments" size={64} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No Payouts Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your requested payouts and withdrawals will show up here.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )
        }
      />

      {/* Payout Request Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Payout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <View style={styles.modalBalanceContainer}>
                <Text style={styles.modalBalanceLabel}>Available Balance</Text>
                <Text style={styles.modalBalanceValue}>₹ {balance.toFixed(2)}</Text>
              </View>

              <Text style={styles.inputLabel}>Enter Amount (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder={`Minimum ₹${MIN_PAYOUT_AMOUNT}`}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor={COLORS.muted}
              />

              <Text style={styles.inputLabel}>Select Bank Account</Text>
              {approvedBanks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankOption,
                    selectedBankId === bank.id && styles.selectedBankOption,
                  ]}
                  onPress={() => setSelectedBankId(bank.id)}
                >
                  <Icon
                    name={selectedBankId === bank.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={selectedBankId === bank.id ? COLORS.primary : COLORS.muted}
                  />
                  <View style={styles.bankOptionDetails}>
                    <Text style={styles.bankNameText}>{bank.bankName}</Text>
                    <Text style={styles.accountNumberText}>
                      {bank.accountHolder} - **** {bank.accountNumber.slice(-4)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  requestPayoutMutation.isPending && styles.disabledSubmitButton,
                ]}
                onPress={handleRequestPayout}
                disabled={requestPayoutMutation.isPending}
              >
                {requestPayoutMutation.isPending ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  balanceHeader: {
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  balanceContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  requestButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledRequestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  warningText: {
    fontSize: 14,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 18,
  },
  warningLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  payoutCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 12,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  reasonText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 14,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalForm: {
    marginBottom: 10,
  },
  modalBalanceContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBalanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalBalanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 16,
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  selectedBankOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  bankOptionDetails: {
    flex: 1,
  },
  bankNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  accountNumberText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledSubmitButton: {
    backgroundColor: COLORS.muted,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default PayoutScreen;
