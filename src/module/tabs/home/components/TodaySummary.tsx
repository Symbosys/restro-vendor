import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/homeStyles';
import { RootStackParamList } from '../../../../types/types';

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

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Summary</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Analytics")}>
                    <Text style={styles.sectionAction}>View Analytics</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.summaryContainer}
                contentContainerStyle={{ paddingRight: 40 }}
            >
                <SummaryItem
                    icon="shopping-bag"
                    label="Orders"
                    value="142"
                    color="#8719C6"
                    bgColor="#f5eeff"
                />
                <SummaryItem
                    icon="account-balance-wallet"
                    label="Revenue"
                    value="₹8,450"
                    color="#10b981"
                    bgColor="#ecfdf5"
                />
                <SummaryItem
                    icon="auto-awesome"
                    label="New"
                    value="5"
                    color="#f59e0b"
                    bgColor="#fffbeb"
                />
                <SummaryItem
                    icon="check-circle"
                    label="Completed"
                    value="68"
                    color="#0ea5e9"
                    bgColor="#f0f9ff"
                />
            </ScrollView>
        </View>
    );
};

export default TodaySummary;
