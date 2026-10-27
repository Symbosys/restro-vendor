import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles/homeStyles';

interface OrderTabsProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabPress: (key: any) => void;
}

const OrderTabs: React.FC<OrderTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Orders</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.activeOrdersTabs}
        contentContainerStyle={styles.tabsScrollContent}
      >
        <View style={styles.tabsWrapper}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => onTabPress(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderTabs;
