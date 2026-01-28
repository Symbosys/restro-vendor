import React from 'react';
import { View, Text, Switch } from 'react-native';
import { COLORS } from '../../../../theme/color';
import { styles } from '../styles/homeStyles';

interface StoreStatusProps {
    storeOpen: boolean | string;
    onToggle: () => void;
}

const StoreStatus: React.FC<StoreStatusProps> = ({ storeOpen, onToggle }) => {
    const isOpen = !!storeOpen;

    return (
        <View style={styles.storeStatusContainer}>
            <View style={[
                styles.statusIndicator,
                { backgroundColor: isOpen ? '#10b981' : '#ef4444' }
            ]} />
            <View style={styles.storeStatusContent}>
                <Text style={styles.storeStatusText}>
                    Store is {isOpen ? 'Accepting Orders' : 'Currently Closed'}
                </Text>
                <Text style={styles.storeTimings}>Today's Schedule: 9:00 AM - 10:00 PM</Text>
            </View>
            <Switch
                value={isOpen}
                onValueChange={onToggle}
                thumbColor={isOpen ? COLORS.white : "#f4f4f5"}
                trackColor={{ false: "#e2e8f0", true: COLORS.primary }}
                style={{ transform: [{ scale: 1.1 }] }}
            />
        </View>
    );
};

export default StoreStatus;
