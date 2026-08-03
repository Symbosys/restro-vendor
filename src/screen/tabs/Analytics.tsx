import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../theme/color';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [selectedRange, setSelectedRange] = useState('today');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const customStartDate = formatDate(startDate);
  const customEndDate = formatDate(endDate);

  const { isAuthenticated } = useAuth();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', selectedRange, customStartDate, customEndDate],
    queryFn: async () => {
      const params: any = { range: selectedRange };
      if (selectedRange === 'custom') {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }
      const response = await api.get('/vendor/stats/analytics', { params });
      return response.data.data; // Assuming SuccessResponse structure: { success: true, message: string, data: AnalyticsResponse }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  });

  const kpiData = analytics?.kpis || [];

  const busiestTimesData = analytics?.busiestTimes?.data?.map((item: any) => ({
    day: item.day,
    height: item.height,
  })) || [];

  const topSellers = analytics?.topSellers?.data || [];

  const detailedReports = analytics?.detailedReports || [
    'Sales by Item Report',
    'Order Fulfillment Report',
    'Customer Feedback Summary',
  ];

  const getSubtitle = () => {
    switch (selectedRange) {
      case 'today': return 'Today';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'custom': return `${customStartDate} to ${customEndDate}`;
      default: return '';
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const showStartDatepicker = () => {
    setShowStartPicker(true);
  };

  const showEndDatepicker = () => {
    setShowEndPicker(true);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50, color: COLORS.muted }}>Error loading analytics data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top App Bar */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="download-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Date Range Selector Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <TouchableOpacity
            style={[styles.chip, selectedRange === 'today' && styles.chipActive]}
            onPress={() => setSelectedRange('today')}
          >
            <Text style={[styles.chipText, selectedRange === 'today' && styles.chipTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, selectedRange === '7days' && styles.chipActive]}
            onPress={() => setSelectedRange('7days')}
          >
            <Text style={[styles.chipText, selectedRange === '7days' && styles.chipTextActive]}>
              Last 7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, selectedRange === '30days' && styles.chipActive]}
            onPress={() => setSelectedRange('30days')}
          >
            <Text style={[styles.chipText, selectedRange === '30days' && styles.chipTextActive]}>
              Last 30 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, selectedRange === 'custom' && styles.chipActive]}
            onPress={() => setSelectedRange('custom')}
          >
            <Text style={[styles.chipText, selectedRange === 'custom' && styles.chipTextActive]}>
              Custom
            </Text>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={selectedRange === 'custom' ? COLORS.white : COLORS.textPrimary}
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Custom Date Inputs (visible only for custom range) */}
        {selectedRange === 'custom' && (
          <View style={styles.customDateContainer}>
            <TouchableOpacity style={styles.dateInputWrapper} onPress={showStartDatepicker}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <View style={[styles.dateInput, styles.dateTouchable]}>
                <Text style={styles.dateDisplay}>{customStartDate}</Text>
                <Ionicons name="calendar-outline" size={16} color={COLORS.muted} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateInputWrapper} onPress={showEndDatepicker}>
              <Text style={styles.dateLabel}>End Date</Text>
              <View style={[styles.dateInput, styles.dateTouchable]}>
                <Text style={styles.dateDisplay}>{customEndDate}</Text>
                <Ionicons name="calendar-outline" size={16} color={COLORS.muted} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* KPIs Section */}
        <View style={styles.kpiGrid}>
          {kpiData.map((kpi: any, index: any) => (
            <View key={index} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <View style={styles.kpiChange}>
                <Ionicons
                  name={kpi.isPositive ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={kpi.isPositive ? '#10b981' : '#ef4444'}
                />
                <Text style={[styles.changeText, kpi.isPositive ? styles.positive : styles.negative]}>
                  {kpi.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          {/* Busiest Times */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Busiest Times</Text>
            <View style={styles.chartHeader}>
              <Text style={styles.chartValue}>
                {(analytics?.busiestTimes?.totalOrders ?? 0).toLocaleString()} Orders
              </Text>
              <Text
                style={[
                  styles.chartChange,
                  analytics?.busiestTimes?.isPositive ? styles.positive : styles.negative,
                ]}
              >
                {analytics?.busiestTimes?.change ?? '0%'}
              </Text>
            </View>
            <Text style={styles.chartSubtitle}>{getSubtitle()}</Text>
            <View style={styles.barChartContainer}>
              {busiestTimesData.map((item: any, index: any) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${item.height}%`,
                          backgroundColor:
                            item.day === 'Fri' ? COLORS.primary : `${COLORS.primary}33`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      item.day === 'Fri' && styles.barLabelActive,
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top Sellers */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Top Sellers</Text>
            <View style={styles.chartHeader}>
              <Text style={styles.chartValue}>{analytics?.topSellers?.totalItems ?? 0} Items</Text>
              <Text
                style={[
                  styles.chartChange,
                  analytics?.topSellers?.isPositive ? styles.positive : styles.negative,
                ]}
              >
                {analytics?.topSellers?.change ?? '0%'}
              </Text>
            </View>
            <Text style={styles.chartSubtitle}>{getSubtitle()}</Text>
            <View style={styles.topSellersContainer}>
              {topSellers.map((item: any, index: any) => (
                <View key={index} style={styles.progressItem}>
                  <Text style={styles.progressLabel}>{item.name}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${item.percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Detailed Reports Section */}
        <View style={styles.reportsSection}>
          <Text style={styles.reportsTitle}>Detailed Reports</Text>
          <View style={styles.reportsCard}>
            {detailedReports.map((report: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.reportItem,
                  index < detailedReports.length - 1 && styles.reportBorder,
                ]}
              >
                <Text style={styles.reportText}>{report}</Text>
                <Ionicons name="chevron-forward" size={24} color={COLORS.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="download" size={20} color={COLORS.white} />
        <Text style={styles.fabText}>Export CSV</Text>
      </TouchableOpacity>

      {/* Date Pickers (Modal for iOS, Inline for Android) */}
      {showStartPicker && (
        <DateTimePicker
          testID="startDateTimePicker"
          value={startDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
          maximumDate={endDate}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          testID="endDateTimePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
          minimumDate={startDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexDirection: 'row',
    gap: 4,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  // Custom Date Styles
  customDateContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  dateInputWrapper: {
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTouchable: {
    // For TouchableOpacity styling if needed
  },
  dateDisplay: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  kpiCard: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.muted,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  kpiChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  chartsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  chartChange: {
    fontSize: 14,
    fontWeight: '800',
    paddingBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 160,
    gap: 16,
    paddingTop: 16,
  },
  barColumn: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barWrapper: {
    width: '100%',
    height: 148,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
    marginTop: 8,
  },
  barLabelActive: {
    color: COLORS.textPrimary,
  },
  topSellersContainer: {
    gap: 16,
    paddingTop: 12,
  },
  progressItem: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  reportsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    paddingTop: 16,
  },
  reportsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  reportBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reportText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingLeft: 20,
    paddingRight: 24,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
    marginBottom: 20,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default AnalyticsScreen;