import { AxiosError } from 'axios';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useVendorById } from '../../hooks/useVendorQueries';
import { useVendorDocumentStore } from '../../api/hooks/document';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { ErrorMessage } from '../../utils/utils';

// --- Types ---
interface LinkItem {
  icon: string;
  title: string;
  subtext?: string;
  route: string;
  color?: string;
  params?: any;
}

// --- Menu Data ---
const restaurantInfo: LinkItem[] = [
  {
    icon: 'person',
    title: 'Personal Info',
    route: 'UpdateProfile',
    subtext: 'Update your personal details',
  },
  {
    icon: 'description',
    title: 'Documents',
    route: 'MyDocuments',
    subtext: 'Manage vendor documents',
  },
  {
    icon: 'store',
    title: 'Shop Details',
    route: 'MyShopDetails',
    subtext: 'Address & shop info',
  },
  {
    icon: 'location-on',
    title: 'Work Location',
    route: 'WorkLocation',
    subtext: 'Update service area',
  },
  // { icon: 'image', title: 'Shop Image', route: 'ShopImage', subtext: 'Update storefront photo' },
  // { icon: 'gesture', title: 'Signature', route: 'SignatureUpload', subtext: 'Digital signature' },
  {
    icon: 'account-balance',
    title: 'Bank Details',
    route: 'BankList',
    subtext: 'Payout accounts',
  },
];

const operations: LinkItem[] = [
  {
    icon: 'analytics',
    title: 'Analytics',
    route: 'Analytics',
    subtext: 'Sales & performance',
  },
  { icon: 'inventory', title: 'Packing Items', route: 'PackingBegItems' },
  // { icon: 'shopping-cart', title: 'Packing Cart', route: 'Packingcart' },
  {
    icon: 'receipt-long',
    title: 'Packing Orders',
    route: 'PackingOrderHistory',
  },
];

const support: LinkItem[] = [
  {
    icon: 'help-outline',
    title: 'Help & Support',
    route: 'AiAssistant',
    subtext: 'AI Partner Support Assistant',
  },
  {
    icon: 'gavel',
    title: 'Terms & Conditions',
    route: 'Docs',
    params: { type: 'TERMS_AND_CONDITIONS' },
  },
  {
    icon: 'verified-user',
    title: 'Privacy Policy',
    route: 'Docs',
    params: { type: 'PRIVACY_POLICY' },
  },
];

const VendorProfileScreen = ({ navigation }: AppNavigation) => {
  const { logout } = useAuth();
  const { data: vendor, isLoading } = useVendorById();
  const { document, fetchDocument } = useVendorDocumentStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (vendor?.id) {
      fetchDocument(vendor.id.toString());
    }
  }, [vendor?.id, fetchDocument]);

  // Dynamic Header Padding for Status Bar
  const headerPaddingTop = insets.top > 0 ? insets.top + 10 : 30;

  const handleLinkPress = (item: LinkItem) => {
    if (item.route.startsWith('mailto:')) {
      Linking.openURL(item.route);
    } else {
      (navigation as any).navigate(item.route, item.params);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/vendor/logout');
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
    } catch (error) {
      ErrorMessage(error as Error | AxiosError);
    }
  };

  const renderSection = (title: string, data: LinkItem[]) => (
    <View style={styles.sectionContainer} key={title}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuCard}>
        {data.map((item, index) => {
          const isDocsRoute = item.route === 'MyDocuments';
          // Check if all major docs are verified
          const isVerified =
            isDocsRoute &&
            document?.isAadhaarVerified &&
            document?.isPanVerified &&
            (document?.fassaiNumber ? document?.isFassaiVerified : true);

          return (
            <View key={index}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleLinkPress(item)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.color || '#F3E8FF' },
                  ]}
                >
                  <Icon name={item.icon} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.menuContent}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Icon name="verified" size={14} color="#059669" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  {item.subtext && (
                    <Text style={styles.menuSubtitle}>{item.subtext}</Text>
                  )}
                </View>
                <View style={styles.arrowCircle}>
                  <Icon name="chevron-right" size={22} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
              {index < data.length - 1 && <View style={styles.separator} />}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    // <SafeAreaView style={styles.container}>
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      {/* --- HEADER (Inside ScrollView now) --- */}
      <View style={[styles.headerBackground, { paddingTop: headerPaddingTop }]}>
        <View pointerEvents="none" style={styles.headerShapeTop} />
        <View pointerEvents="none" style={styles.headerShapeRight} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          {/* <TouchableOpacity style={styles.editBtn}>
              <Icon name="edit" size={20} color="#FFF" />
            </TouchableOpacity> */}
        </View>
      </View>

      {/* --- PROFILE CARD --- */}
      <View style={styles.profileCard}>
        <View pointerEvents="none" style={styles.profileCardDecoration}>
          <View style={styles.profileCardShapeLeft} />
          <View style={styles.profileCardShapeRight} />
        </View>
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} size="large" />
        ) : (
          <>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    vendor?.images?.url ||
                    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={() => navigation.navigate('ShopImage' as never)}
                activeOpacity={0.8}
              >
                <Icon name="camera-alt" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{vendor?.shopName || 'Vendor Name'}</Text>
            <Text style={styles.address}>
              {vendor?.completeAddress || 'No address details available'}
            </Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: vendor?.isApproved ? '#DCFCE7' : '#FEE2E2' },
              ]}
            >
              <Icon
                name={vendor?.isApproved ? 'verified' : 'pending'}
                size={14}
                color={vendor?.isApproved ? '#166534' : '#991B1B'}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: vendor?.isApproved ? '#166534' : '#991B1B' },
                ]}
              >
                {vendor?.isApproved ? 'Verified' : 'Pending Approval'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* --- MENU SECTIONS --- */}
      <View style={styles.menuContainer}>
        {renderSection('BUSINESS DETAILS', restaurantInfo)}
        {renderSection('OPERATIONS', operations)}
        {renderSection('SUPPORT & LEGAL', support)}

        {/* --- LOGOUT --- */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.0</Text>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
    // </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // --- Header Styles ---
  headerBackground: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingBottom: 66, // Keeps space for the overlapping profile card
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    // REMOVED: position: 'absolute', top: 0, etc.
    // This allows the header to scroll up naturally with the content
  },
  headerShapeTop: {
    position: 'absolute',
    top: -42,
    right: 50,
    width: 230,
    height: 120,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    transform: [{ rotate: '-12deg' }],
  },
  headerShapeRight: {
    position: 'absolute',
    top: 10,
    right: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(150,100,220,0.20)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },
  // --- Card Styles ---
  profileCard: {
    position: 'relative',
    backgroundColor: '#F5F0FF',
    borderRadius: 28,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 26,
    marginHorizontal: 20,
    marginTop: -54,
    marginBottom: 28,
    shadowColor: '#2E1558',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  profileCardDecoration: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: 'hidden',
  },
  profileCardShapeLeft: {
    position: 'absolute',
    left: -70,
    bottom: -55,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(124, 58, 237, 0.07)',
  },
  profileCardShapeRight: {
    position: 'absolute',
    right: -55,
    bottom: -75,
    width: 165,
    height: 165,
    borderRadius: 83,
    backgroundColor: 'rgba(124, 58, 237, 0.045)',
    borderWidth: 16,
    borderColor: 'rgba(124, 58, 237, 0.025)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    marginTop: -50, // Pulls avatar up to overlap card edge
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1E1B2E',
    marginBottom: 4,
    textAlign: 'center',
  },
  address: {
    fontSize: 14,
    color: '#73758A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // --- Content Wrappers ---
  menuContainer: {
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8589A3',
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 6,
    shadowColor: '#2E1558',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4ECFF',
    marginLeft: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#242238',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#73778D',
    marginTop: 4,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 79,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7F7',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#A4A7B8',
    fontSize: 12,
  },
});

export default VendorProfileScreen;
