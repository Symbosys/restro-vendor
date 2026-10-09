import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../../theme/color';
import { styles } from '../styles/homeStyles';

interface OfflineViewProps {
    onGoOnline: () => void;
}

const OfflineView: React.FC<OfflineViewProps> = ({ onGoOnline }) => {
    return (
        <View style={styles.offlineContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <View style={styles.offlineContent}>
                <View style={styles.offlineIllustration}>
                    <View style={styles.offlineCircleOuter}>
                        <View style={styles.offlineCircleInner}>
                            <Icon name="storefront" size={70} color="#cbd5e1" />
                        </View>
                        <View style={styles.offlineBadgeIcon}>
                            <Icon name="power-off" size={24} color="#fff" />
                        </View>
                    </View>
                </View>

                <View style={styles.offlineTextContainer}>
                    <Text style={styles.offlineTitle}>Store is Offline</Text>
                    <Text style={styles.offlineSubtitle}>
                        Your store is currently hidden from customers. Go online to start receiving fresh orders!
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.goOnlineButton}
                    onPress={onGoOnline}
                    activeOpacity={0.85}
                >
                    <View style={styles.powerIconContainer}>
                        <Icon name="power-settings-new" size={26} color="#fff" />
                    </View>
                    <Text style={styles.goOnlineText}>GO ONLINE NOW</Text>
                    <Icon name="arrow-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.offlineFooter}>
                    <Icon name="info-outline" size={18} color="#94a3b8" />
                    <Text style={styles.offlineFooterText}>Toggle the switch to change status</Text>
                </View>
            </View>
        </View>
    );
};

export default OfflineView;
