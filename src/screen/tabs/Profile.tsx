import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { useVendorById } from '../../hooks/useVendorQueries';
import api from '../../api/api';


interface LinkItem {
  icon: string;
  title: string;
  subtext?: string;
  route: string;
}

const restaurantInfo: LinkItem[] = [
  {
    icon: 'person',
    title: 'Personal Information',
    route: 'UpdateProfile',
  },
  {
    icon: 'description',
    title: 'Documents',
    route: 'Documents',
  },
  {
    icon: 'location-on',
    title: 'Address',
    route: 'ShopDetails',
  },
  {
    icon: 'inventory',
    title: 'My Products',
    route: 'MyProducts',
  },
];

const accountSettings: LinkItem[] = [
  {
    icon: 'help',
    title: 'Help & Support',
    route: 'HelpSupport',
  },
  
];

const legalSupport: LinkItem[] = [
  {
    icon: 'gavel',
    title: 'Terms & Conditions',
    route: 'TermsAndConditions',
  },
  {
    icon: 'shield',
    title: 'Privacy Policy',
    route: 'PrivacyPolicy',
  },
  // {
  //   icon: 'help',
  //   title: 'Help & Support',
  //   route: 'Support',
  // },
];

const packingBag: LinkItem[] = [
  {
    icon: 'inventory',
    title: 'Packing Bag Items',
    route: 'PackingBegItems',
  },
  {
    icon: 'shopping-cart',
    title: 'Packing Bag Cart',
    route: 'Packingcart',
  },
  {
    icon: 'receipt',
    title: 'Packing Bag Orders',
    route: 'PackingOrderHistory',
  },
];

const VendorProfileScreen = ({ navigation }: AppNavigation) => {

  const { vendorId , logout} = useAuth();
  
  const {data: vendor} = useVendorById();


  const handleLinkPress = (route: string) => {
    navigation.navigate(route as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="edit" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      {/* Main Content */}
      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: vendor?.images?.url,
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="photo-camera" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.restaurantName}>{vendor?.shopName}</Text>
            <Text style={styles.address}>{vendor?.completeAddress}</Text>
          </View>
        </View>
        {/* Restaurant Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Restaurant Information</Text>
          {restaurantInfo.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkItem}
              onPress={() => handleLinkPress(item.route)}
            >
              <View style={styles.linkContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={24} color={COLORS.primary} />
                </View>
                {item.subtext ? (
                  <View style={styles.linkTextContainer}>
                    <Text style={styles.linkText}>{item.title}</Text>
                    <Text style={styles.linkSubtext}>{item.subtext}</Text>
                  </View>
                ) : (
                  <Text style={styles.linkText}>{item.title}</Text>
                )}
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Packing Bag Section Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Packing Bag Section</Text>
          {packingBag.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkItem}
              onPress={() => handleLinkPress(item.route)}
            >
              <View style={styles.linkContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.linkText}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Help And Support  */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Help And Support</Text>
          {accountSettings.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkItem}
              onPress={() => handleLinkPress(item.route)}
            >
              <View style={styles.linkContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={24} color={COLORS.primary} />
                </View>
                {item.subtext ? (
                  <View style={styles.linkTextContainer}>
                    <Text style={styles.linkText}>{item.title}</Text>
                    <Text style={styles.linkSubtext}>{item.subtext}</Text>
                  </View>
                ) : (
                  <Text style={styles.linkText}>{item.title}</Text>
                )}
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>


        {/* Legal & Support Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal & Support</Text>
          {legalSupport.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkItem}
              onPress={() => handleLinkPress(item.route)}
            >
              <View style={styles.linkContent}>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.linkText}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>
        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={async () => {
            await api.post('/auth/vendor/logout')
            await logout()
            navigation.navigate('Login')
          }}>
            <Icon name="logout" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.5)',
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 21.6,
    letterSpacing: -0.27,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 64,
    gap: 24,
  },
  profileHeader: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.background,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 26.4,
    letterSpacing: -0.33,
    textAlign: 'center',
  },
  address: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'column',
    gap: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 21.6,
    letterSpacing: -0.27,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 8,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10', // Subtle primary opacity for clean look
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  linkTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  linkSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.muted,
    lineHeight: 20,
    letterSpacing: 0.05,
  },
  logoutContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 24,
  },
});

export default VendorProfileScreen;