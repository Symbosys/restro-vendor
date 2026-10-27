import React from 'react';
import { View, Text, Switch } from 'react-native';
import { COLORS } from '../../../../theme/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/homeStyles';

interface StoreStatusProps {
  storeOpen: boolean | string;
  onToggle: () => void;
}

const StoreStatus: React.FC<StoreStatusProps> = ({ storeOpen, onToggle }) => {
  const isOpen = !!storeOpen;

  return (
    <View style={styles.storeStatusContainer}>
      <View style={styles.storeIconContainer}>
        <Icon name="store" size={32} color={COLORS.primary} />

        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: isOpen ? '#10B981' : '#EF4444',
            },
          ]}
        />
      </View>

      <View style={styles.storeStatusContent}>
        <Text style={styles.storeStatusText} numberOfLines={1}>
          Store is {isOpen ? 'Accepting Orders' : 'Currently Closed'}
        </Text>

        <Text style={styles.storeTimings} numberOfLines={1}>
          Today's Schedule: 9:00 AM - 10:00 PM
        </Text>
      </View>

      <Switch
        value={isOpen}
        onValueChange={onToggle}
        thumbColor="#FFFFFF"
        trackColor={{
          false: '#E5E1EB',
          true: COLORS.primary,
        }}
        ios_backgroundColor="#E5E1EB"
        style={styles.storeSwitch}
      />
    </View>
  );
};

export default StoreStatus;
