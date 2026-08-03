import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../api/api';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../styles/homeStyles';
import { RootStackParamList } from '../../../../types/types';
import { COLORS } from '../../../../theme/color';

const SummaryItem = ({ icon, label, value, color, bgColor }: any) => (
    <View style={styles.summaryCard}>
        <View style={[styles.summaryIconContainer, { backgroundColor: bgColor }]}>
            <Icon name={icon} size={28} color={color} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const TodaySummary: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { isAuthenticated } = useAuth();

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics', 'today'],
        queryFn: async () => {
            const response = await api.get('/vendor/stats/analytics', { params: { range: 'today' } });
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
        enabled: isAuthenticated,
    });

    const kpis = analytics?.kpis || [];

    const getKpiValue = (labelKey: string, fallback: string) => {
        const item = kpis.find((k: any) => k.label.toLowerCase().includes(labelKey.toLowerCase()));
        return item ? item.value : fallback;
    };

    const ordersValue = getKpiValue('Total Orders', '0');
    const revenueValue = getKpiValue('Total Revenue', '₹0');
    const newCustomersValue = getKpiValue('New Customers', '0');
    const avgOrderValue = getKpiValue('Avg. Order', '₹0');

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Summary</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Analytics")}>
                    <Text style={styles.sectionAction}>View Analytics</Text>
                </TouchableOpacity>
            </View>
            {isLoading ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.summaryContainer}
                    contentContainerStyle={{ paddingRight: 40 }}
                >
                    <SummaryItem
                        icon="shopping-bag"
                        label="Orders"
                        value={ordersValue}
                        color="#8719C6"
                        bgColor="#f5eeff"
                    />
                    <SummaryItem
                        icon="account-balance-wallet"
                        label="Revenue"
                        value={revenueValue}
                        color="#10b981"
                        bgColor="#ecfdf5"
                    />
                    <SummaryItem
                        icon="auto-awesome"
                        label="New Cust."
                        value={newCustomersValue}
                        color="#f59e0b"
                        bgColor="#fffbeb"
                    />
                    <SummaryItem
                        icon="trending-up"
                        label="Avg Order"
                        value={avgOrderValue}
                        color="#0ea5e9"
                        bgColor="#f0f9ff"
                    />
                </ScrollView>
            )}
        </View>
    );
};

export default TodaySummary;
