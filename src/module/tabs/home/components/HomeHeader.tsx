import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useHome } from '../hooks/useHome';
import { styles } from '../styles/homeStyles';

interface HomeHeaderProps {
  navigation: any;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation }) => {
  const { vendor } = useHome();

  return (
    <View style={styles.topBar}>
      <View style={styles.leftContainer}>
        <View style={styles.headerLogoContainer}>
          <Image
            source={require('../../../../assets/logo/logo2.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.logoContainer}>
          <Text style={styles.greeting}>GOOD MORNING,</Text>

          <Text style={styles.storeName} numberOfLines={1}>
            {vendor?.shopName}
          </Text>
        </View>
      </View>

      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notification')}
          activeOpacity={0.7}
        >
          <Icon name="notifications-none" size={28} color="#241044" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
