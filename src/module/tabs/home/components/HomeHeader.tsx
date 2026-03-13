import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useHome } from '../hooks/useHome';
import { styles } from '../styles/homeStyles';

interface HomeHeaderProps {
    navigation: any;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation }) => {
    const {vendor} = useHome()
    return (
        <View style={styles.topBar}>
            <View style={styles.logoContainer}>
                <Text style={styles.greeting}>Good Morning,</Text>
                <Text style={styles.storeName}>{vendor?.shopName}</Text>
            </View>
            <View style={styles.headerButtons}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate("Notification")}
                    activeOpacity={0.7}
                >
                    <Icon name="notifications-none" size={26} color="#1e293b" />
                    <View style={styles.badgeDot} />
                </TouchableOpacity>
                {/* <TouchableOpacity
                    style={styles.headerButton}
                    activeOpacity={0.7}
                >
                    <Icon name="account-circle" size={26} color="#1e293b" />
                </TouchableOpacity> */}
            </View>
        </View>
    );
};

export default HomeHeader;
