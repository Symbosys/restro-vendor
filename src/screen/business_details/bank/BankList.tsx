import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import GlobalHeader from '../../components/ui/custom/GlobalHeader';
import Loader from '../../../components/ui/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useBankAccounts } from '../../../api/hooks/bank';
import { COLORS } from '../../../theme/color';
import { AppNavigation } from '../../../types/types';

const BankListScreen = ({ navigation }: AppNavigation) => {
    const { vendorId } = useAuth();
    // Using TanStack Query hook
    const { data: banks = [], isLoading, refetch, isRefetching } = useBankAccounts();

    const onRefresh = () => {
        refetch();
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UpdateBankAccount', { bankId: item.id, bankDetails: item } as any)}
        >
            <View style={styles.iconBox}>
                <Icon name="account-balance" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.bankName}>{item.bankName}</Text>
                <Text style={styles.accountNumber}>**** {item.accountNumber.slice(-4)}</Text>
                <Text style={[styles.statusItem, { color: item.status === 'APPROVED' ? 'green' : item.status === 'REJECTED' ? 'red' : 'orange' }]}>
                    {item.status}
                </Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.muted} />
        </TouchableOpacity>
    );

    if (isLoading) return <Loader />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>Bank Accounts</Text>
                <TouchableOpacity onPress={() => navigation.navigate('BankAccount' as any)} style={{ padding: 10 }}>
                    <Icon name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={banks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No bank accounts found.</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('BankAccount' as any)}>
                            <Text style={{ color: COLORS.primary, marginTop: 10, fontWeight: '700' }}>Add One</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    bankName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    accountNumber: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    statusItem: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
});

export default BankListScreen;
