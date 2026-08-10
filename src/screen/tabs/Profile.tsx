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
  Linking
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  { icon: 'person', title: 'Personal Info', route: 'UpdateProfile', subtext: 'Update your personal details' },
  { icon: 'description', title: 'Documents', route: 'MyDocuments', subtext: 'Manage vendor documents' },
  { icon: 'store', title: 'Shop Details', route: 'MyShopDetails', subtext: 'Address & shop info' },
  { icon: 'location-on', title: 'Work Location', route: 'WorkLocation', subtext: 'Update service area' },
  // { icon: 'image', title: 'Shop Image', route: 'ShopImage', subtext: 'Update storefront photo' },
  // { icon: 'gesture', title: 'Signature', route: 'SignatureUpload', subtext: 'Digital signature' },
  { icon: 'account-balance', title: 'Bank Details', route: 'BankList', subtext: 'Payout accounts' },
];

const operations: LinkItem[] = [
  { icon: 'analytics', title: 'Analytics', route: 'Analytics', subtext: 'Sales & performance' },
  { icon: 'inventory', title: 'Packing Items', route: 'PackingBegItems' },
  // { icon: 'shopping-cart', title: 'Packing Cart', route: 'Packingcart' },
  { icon: 'receipt-long', title: 'Packing Orders', route: 'PackingOrderHistory' },
];

const support: LinkItem[] = [
  { icon: 'help-outline', title: 'Help & Support', route: 'AiAssistant', subtext: 'AI Partner Support Assistant' },
  { icon: 'gavel', title: 'Terms & Conditions', route: 'Docs', params: { type: 'TERMS_AND_CONDITIONS' } },
  { icon: 'verified-user', title: 'Privacy Policy', route: 'Docs', params: { type: 'PRIVACY_POLICY' } },
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
          const isVerified = isDocsRoute &&
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
                <View style={[styles.iconBox, { backgroundColor: item.color || '#F3E8FF' }]}>
                  <Icon name={item.icon} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.menuContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Icon name="verified" size={14} color="#059669" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  {item.subtext && <Text style={styles.menuSubtitle}>{item.subtext}</Text>}
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>
              {index < data.length - 1 && <View style={styles.separator} />}
            </View>
          )
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            {/* <TouchableOpacity style={styles.editBtn}>
              <Icon name="edit" size={20} color="#FFF" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* --- PROFILE CARD --- */}
        <View style={styles.profileCard}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="large" />
          ) : (
            <>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: vendor?.images?.url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
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
              <Text style={styles.address}>{vendor?.completeAddress || 'No address details available'}</Text>

              <View style={[styles.statusBadge, { backgroundColor: vendor?.isApproved ? '#DCFCE7' : '#FEE2E2' }]}>
                <Icon
                  name={vendor?.isApproved ? 'verified' : 'pending'}
                  size={14}
                  color={vendor?.isApproved ? '#166534' : '#991B1B'}
                />
                <Text style={[styles.statusText, { color: vendor?.isApproved ? '#166534' : '#991B1B' }]}>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // --- Header Styles ---
  headerBackground: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 60, // Extra padding at bottom to allow card overlap
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    // REMOVED: position: 'absolute', top: 0, etc.
    // This allows the header to scroll up naturally with the content
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },
  // --- Card Styles ---
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 20,
    marginTop: -50, // Negative margin pulls it UP over the header
    marginBottom: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    marginTop: -50, // Pulls avatar up to overlap card edge
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  address: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
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
    paddingHorizontal: 20, // Add padding here since ScrollView padding was removed
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 20,
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
    color: '#CBD5E1',
    fontSize: 12,
  }
});

export default VendorProfileScreen;