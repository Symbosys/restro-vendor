import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../api/api';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../styles/homeStyles';
import { RootStackParamList } from '../../../../types/types';
import { COLORS } from '../../../../theme/color';

const SummaryItem = ({ icon, label, value, color, bgColor }: any) => {
  const waveColor =
    label === 'Orders'
      ? '#DCC5FF'
      : label === 'Revenue'
      ? '#A7E8C3'
      : label === 'New Cust.'
      ? '#FFE2A8'
      : '#BAE6FD';

  const waveLightColor =
    label === 'Orders'
      ? '#F0E6FF'
      : label === 'Revenue'
      ? '#E8F8EF'
      : label === 'New Cust.'
      ? '#FFFAEB'
      : '#F0F9FF';

  return (
    <View style={styles.summaryCard}>
      {/* Background waves */}
      <View
        pointerEvents="none"
        style={[styles.summaryWaveBack, { backgroundColor: waveLightColor }]}
      />
      <View
        pointerEvents="none"
        style={[styles.summaryWaveFront, { backgroundColor: waveColor }]}
      />

      {/* Icon and chart */}
      <View style={styles.summaryCardTop}>
        <View
          style={[styles.summaryIconContainer, { backgroundColor: bgColor }]}
        >
          <Icon name={icon} size={27} color={color} />
        </View>

        <View style={styles.summaryChartDecoration}>
          {[22, 36, 50, 64].map((height, index) => (
            <View
              key={index}
              style={[
                styles.summaryChartBar,
                { height, backgroundColor: waveColor },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Text stays above the background decoration */}
      <Text style={styles.summaryLabel}>{label}</Text>

      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const TodaySummary: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'today'],
    queryFn: async () => {
      const response = await api.get('/vendor/stats/analytics', {
        params: { range: 'today' },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const kpis = analytics?.kpis || [];

  const getKpiValue = (labelKey: string, fallback: string) => {
    const item = kpis.find((k: any) =>
      k.label.toLowerCase().includes(labelKey.toLowerCase()),
    );
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
        <TouchableOpacity
          style={styles.analyticsButton}
          onPress={() => navigation.navigate('Analytics')}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionAction}>View Analytics</Text>
          <Icon name="arrow-forward" size={18} color="#5721B7" />
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
            color={COLORS.primary}
            bgColor={COLORS.primaryLight}
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
