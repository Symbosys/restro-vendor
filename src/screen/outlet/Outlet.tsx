import { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getVendorById } from '../../services/vendor.service';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { Vendor } from '../../types/vendor.types';
import { ErrorMessage } from '../../utils/utils';

const { width, height } = Dimensions.get('window');

// UI Colors extracted from images
const UI_COLORS = {
  pendingBg: '#F3E8FF', // Light purple circle
  pendingIcon: '#9333EA', // Purple icon
  pendingPill: '#F3E8FF',
  pendingPillText: '#9333EA',
  rejectedBg: '#FEE2E2', // Light red circle
  rejectedIcon: '#EF4444', // Red icon
  blockedBg: '#FEE2E2',
  blockedIcon: '#EF4444',
  blueButton: '#4F46E5', // Royal Blue
  textMain: '#111827',
  textSub: '#6B7280',
};

const OutletStatus = ({ navigation }: AppNavigation) => {
  const { vendorId, setAuthStatus, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch vendor details
  const fetchVendorDetailsById = async () => {
    try {
      setLoading(true);
      const response = await getVendorById(vendorId || '');
      console.log("Vendor Details", JSON.stringify(response, null, 2))
      setVendorDetails(response);
    } catch (error) {
      ErrorMessage(error as AxiosError | Error);
      console.error('Error fetching vendor details:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchVendorDetailsById();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVendorDetailsById();
    setRefreshing(false);
  }, []);

  // 🧠 Navigation logic
  useEffect(() => {
    if (!vendorDetails) return;

    switch (vendorDetails.status) {
      case "NEW":
        return;
      case 'PROFILE_COMPLETION_NOT_FILLED':
        navigation.reset({ index: 0, routes: [{ name: 'UpdateProfile' }] });
        break;
      case 'DOCUMENTS_NOT_VERIFIED':
        navigation.reset({ index: 0, routes: [{ name: 'Documents' }] });
        break;
      case 'SHOP_DETAILS_NOT_FILLED':
        navigation.reset({ index: 0, routes: [{ name: 'ShopDetails' }] });
        break;
      case 'SHOP_IMAGES_NOT_UPLOADED':
        navigation.navigate('ShopImage');
        break;
      case 'PRODUCT_SELECTION_NOT_DONE':
        navigation.reset({ index: 0, routes: [{ name: 'ProductSelection' }] });
        break;
      case 'BANK_ACCOUNT_NOT_ADDED':
        navigation.reset({ index: 0, routes: [{ name: 'BankAccount' }] });
        break;
      case 'SIGNATURE_NOT_UPLOADED':
        navigation.reset({ index: 0, routes: [{ name: 'SignatureUpload' }] });
        break;
      case 'APPROVED':
        setAuthStatus(true);
        navigation.reset({ index: 0, routes: [{ name: 'BottomTab' }] });
        break;
      case 'REJECTED':
        setAuthStatus(false);
        break;
      default:
        break;
    }
  }, [vendorDetails?.status]);

  // Handle contact support
  const handleContactSupport = async () => {
    const supportEmail = 'support@yourapp.com';
    const subject = 'Account Blocked - Need Assistance';
    const body = `Hi, my outlet account is blocked. Vendor ID: ${vendorId}. Please help resolve.`;
    const url = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  // 🌀 Loading screen
  if (loading || !vendorDetails) {
    return <Loader />;
  }

  // --- RENDER HELPERS ---

  const Header = ({ title }: { title?: string }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        {/* <Icon name="arrow-left" size={24} color="#1F2937" /> */}
      </TouchableOpacity>
      {title && <Text style={styles.headerTitle}>{title}</Text>}
      <View style={{ width: 40 }} />
    </View>
  );

  const ActionItem = ({ icon, title, onPress }: { icon: string, title: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIconBox}>
        <Icon name={icon} size={22} color="#64748B" />
      </View>
      <Text style={styles.actionText}>{title}</Text>
      <Icon name="chevron-right" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );

  // ==========================================
  // 1. PENDING VIEW
  // ==========================================
  if (vendorDetails.status === 'PENDING') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        <ScrollView contentContainerStyle={styles.centerContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

          {/* Nested Circles to create the Glow/Ring effect */}
          <View style={styles.pendingCircleOuter}>
            <View style={styles.pendingCircleInner}>
              <Icon name="clock" size={42} color={UI_COLORS.pendingIcon} />
            </View>
          </View>

          <View style={styles.pendingPill}>
            <Text style={styles.pendingPillText}>Pending</Text>
          </View>

          <Text style={styles.statusTitle}>Your profile is under review</Text>

          <Text style={styles.statusSub}>This could take up to 24 to 48 hours.</Text>
        </ScrollView>

        <View style={styles.footer}>
          {/* <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 2. REJECTED VIEW
  // ==========================================
  if (vendorDetails.status === 'REJECTED') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <Header title="Verification Status" />

        <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

          <View style={styles.centerAlign}>
            <View style={styles.rejectedCircle}>
              <Icon name="shield-remove" size={40} color="#FFF" />
            </View>
            <Text style={styles.statusTitle}>Verification Rejected</Text>
            <Text style={styles.statusSub}>
              Your profile could not be verified. Please{'\n'}see the reason below.
            </Text>
          </View>

          {/* Reason Box */}
          <View style={styles.reasonBoxRejected}>
            <Text style={styles.reasonTitleRed}>REASON FOR REJECTION</Text>
            <Text style={styles.reasonText}>
              {vendorDetails.rejectReason || 'The provided shop image was blurry and unclear, making it difficult to verify details.'}
            </Text>
          </View>

          {/* Action List */}
          <View style={styles.actionList}>
            <ActionItem
              icon="account"
              title="Update Profile"
              onPress={() => navigation.navigate('UpdateProfile')}
            />
            <ActionItem
              icon="file-document"
              title="Update Documents"
              onPress={() => navigation.navigate('Documents')}
            />
            <ActionItem
              icon="store"
              title="Update Shop Details"
              onPress={() => navigation.navigate('ShopDetails')}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('ShopImage')}
          >
            <Icon name="camera" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Update Shop Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportLinkBtn} onPress={handleContactSupport}>
            <Text style={styles.supportLinkText}>Need Help? Contact Support</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 3. BLOCKED VIEW
  // ==========================================
  if (vendorDetails.status === 'BLOCKED') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <Header title="Profile Status" />

        <ScrollView contentContainerStyle={styles.centerContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

          <View style={styles.blockedCircle}>
            <Icon name="block-helper" size={48} color="#FFF" />
          </View>

          <Text style={styles.statusTitle}>Account Blocked</Text>
          <Text style={styles.statusSub}>
            Your profile has been temporarily blocked due to a violation of our policies.
          </Text>

          {/* Reason Box Blocked */}
          <View style={styles.reasonBoxBlocked}>
            <View style={styles.reasonHeaderRow}>
              <Icon name="alert-circle" size={24} color="#DC2626" />
              <Text style={styles.reasonTitleBlocked}>Reason for Block</Text>
            </View>
            <Text style={styles.reasonTextGray}>
              {vendorDetails.blockReason || 'Violation of Community Guidelines regarding inappropriate content.'}
            </Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContactSupport}>
            <Icon name="face-agent" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // DEFAULT / FALLBACK (No Outlet Found)
  // ==========================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <Header />

      <ScrollView contentContainerStyle={styles.centerContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        <View style={[styles.pendingCircleOuter, { shadowColor: COLORS.primary }]}>
          <View style={[styles.pendingCircleInner, { backgroundColor: '#EFF6FF' }]}>
            <Icon name="store-plus" size={42} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.statusTitle}>No Outlet Found</Text>
        <Text style={styles.statusSub}>
          It looks like you haven't set up an outlet yet.
        </Text>

        <View style={{ width: '100%', marginTop: 32 }}>
          {/* Option 1: Register */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('UpdateProfile')}
          >
            <Text style={styles.primaryBtnText}>Register your Outlet</Text>
          </TouchableOpacity>

          {/* Option 2: Login with different account */}
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={async () => {
              await logout();
              navigation.navigate('Login');
              // Clear auth or navigate to login
              setAuthStatus(false);
            }}
          >
            <Text style={styles.secondaryActionText}>Login with another account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // Clean circle back button for Pending screen
  circleBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  centerAlign: {
    alignItems: 'center',
    marginTop: 20,
  },

  // --- Text Styles ---
  statusTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 24,
    lineHeight: 34,
  },
  statusSub: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: '80%',
    fontWeight: 'bold',
    marginTop: 16,
  },

  // --- Icons ---
  // PENDING CIRCLE LOGIC
  pendingCircleOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  pendingCircleInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pendingPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
    marginBottom: 8,
  },
  pendingPillText: {
    color: '#9333EA',
    fontWeight: '700',
    fontSize: 14,
  },

  rejectedCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 6,
    borderColor: '#FEE2E2',
  },

  blockedCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 8,
    borderColor: '#FEE2E2',
  },

  // --- Boxes ---
  reasonBoxRejected: {
    backgroundColor: '#FFF1F2',
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  reasonTitleRed: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  reasonText: {
    color: '#1F2937',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  reasonBoxBlocked: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 10,
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reasonTitleBlocked: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 10,
  },
  reasonTextGray: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
  },

  // --- Actions List ---
  actionList: {
    width: '100%',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  // --- Footer / Button ---
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    width: '100%',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  supportLinkBtn: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  supportLinkText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  // Secondary Button for Fallback
  secondaryActionBtn: {
    marginTop: 12,
    height: 56,
    width: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  secondaryActionText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
  }
});

export default OutletStatus;