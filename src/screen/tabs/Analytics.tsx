import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../theme/color';

const { width } = Dimensions.get('window');


const AnalyticsScreen = () => {
  const [selectedRange, setSelectedRange] = useState('today');

  const kpiData = [
    { label: 'Total Revenue', value: '$1,250.75', change: '+5.2%', isPositive: true },
    { label: 'Total Orders', value: '86', change: '-1.5%', isPositive: false },
    { label: 'Avg. Order Value', value: '$14.54', change: '+2.1%', isPositive: true },
    { label: 'New Customers', value: '12', change: '+8.0%', isPositive: true },
  ];

  const busiestTimesData = [
    { day: 'Mon', height: 20 },
    { day: 'Tue', height: 50 },
    { day: 'Wed', height: 60 },
    { day: 'Thu', height: 80 },
    { day: 'Fri', height: 95 },
    { day: 'Sat', height: 70 },
    { day: 'Sun', height: 85 },
  ];

  const topSellers = [
    { name: 'Milkshake', percentage: 90 },
    { name: 'Iced Tea', percentage: 80 },
    { name: 'Fries', percentage: 50 },
    { name: 'Classic Burger', percentage: 20 },
    { name: 'Salad', percentage: 10 },
  ];

  const detailedReports = [
    'Sales by Item Report',
    'Order Fulfillment Report',
    'Customer Feedback Summary',
  ];

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
              Custom{' '}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={
                selectedRange === 'custom' ? COLORS.white : COLORS.textPrimary
              }
            />
          </TouchableOpacity>
        </ScrollView>

        {/* KPIs Section */}
        <View style={styles.kpiGrid}>
          {kpiData.map((kpi, index) => (
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
              <Text style={styles.chartValue}>1,240 Orders</Text>
              <Text style={[styles.chartChange, styles.negative]}>-3.1%</Text>
            </View>
            <Text style={styles.chartSubtitle}>Last 7 Days</Text>
            <View style={styles.barChartContainer}>
              {busiestTimesData.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${item.height}%`,
                          backgroundColor: item.day === 'Fri' ? COLORS.primary : `${COLORS.primary}33`,
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
              <Text style={styles.chartValue}>5 Items</Text>
              <Text style={[styles.chartChange, styles.positive]}>+7.8%</Text>
            </View>
            <Text style={styles.chartSubtitle}>Last 30 Days</Text>
            <View style={styles.topSellersContainer}>
              {topSellers.map((item, index) => (
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
            {detailedReports.map((report, index) => (
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
    marginBottom: 60,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default AnalyticsScreen;