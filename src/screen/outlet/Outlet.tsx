import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getVendorById } from '../../services/vendor.service';
import { useAuth } from '../../context/AuthContext';
import { Vendor } from '../../types/vendor.types'; // Assuming Vendor type from your types
import { AppNavigation } from '../../types/types'; // Adjust if needed for navigation prop
import { COLORS } from '../../theme/color';
import Loader from '../../components/ui/Loader';
import { ErrorMessage } from '../../utils/utils';
import { AxiosError } from 'axios';

const OutletStatus = ({ navigation }: AppNavigation) => {
  const { vendorId, setAuthStatus } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch vendor details
  const fetchVendorDetailsById = async () => {
    try {
      setLoading(true);
      const response = await getVendorById(vendorId ?? '1');
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
      case 'PROFILE_COMPLETION_NOT_FILLED':
        navigation.reset({ index: 0, routes: [{ name: 'UpdateProfile' }] }); // Adjust route name as needed
        break;
      case 'DOCUMENTS_NOT_VERIFIED':
        navigation.reset({ index: 0, routes: [{ name: 'Documents' }] });
        break;
      case 'SHOP_DETAILS_NOT_FILLED':
        navigation.reset({ index: 0, routes: [{ name: 'ShopDetails' }] });
        break;
      case 'SHOP_IMAGES_NOT_UPLOADED':
        navigation.reset({ index: 0, routes: [{ name: 'ShopImage' }] });
        break;
      case 'APPROVED':
        setAuthStatus(true);
        navigation.reset({ index: 0, routes: [{ name: 'BottomTab' }] }); // Adjust to vendor main tab
        break;
      case 'REJECTED':
        setAuthStatus(false);
        break;
      default:
        break;
    }
  }, [vendorDetails?.status]);

  // Handle contact support (e.g., open email or support chat)
  const handleContactSupport = async () => {
    // Example: Open email client with support address
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

  // 🎉 NEW vendor (show default "no outlet" screen)
  if (vendorDetails.status === 'NEW') {
    const handleRegister = () => {
      navigation.navigate('UpdateProfile'); // Or 'Documents' if starting there
    };

    const handleDifferentLogin = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Header */}
          <Text style={styles.header}>No outlet found</Text>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Icon name="storefront" size={64} color={COLORS.primary} />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>No outlets linked to this account</Text>
          <Text style={styles.subtitle}>
            Please check your login details once again or{"\n"}
            click below to register your outlet.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
              <Text style={styles.registerText}>Register your outlet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleDifferentLogin}>
              <Text style={styles.loginText}>Login with a different account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 🕒 Pending Review
  if (vendorDetails.status === 'PENDING') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.statusContainer}>
            <Icon name="timelapse" size={48} color={COLORS.accent} />
            <Text style={styles.title}>Outlet Under Review</Text>
            <Text style={styles.description}>
              Your outlet profile is being reviewed. You'll hear from us within 24-48 hours.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 🚫 Blocked
  if (vendorDetails.status === 'BLOCKED') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.statusContainer}>
            <Icon name="block-helper" size={48} color={COLORS.danger || "#FF0000"} />
            <Text style={styles.title}>Outlet Blocked</Text>
            <Text style={styles.description}>
              {vendorDetails.blockReason ||
                'Your outlet is currently blocked. Contact support for help resolving this issue.'}
            </Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleContactSupport}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 🚫 Rejected
  if (vendorDetails.status === 'REJECTED') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.statusContainer}>
            <Icon name="alert-circle" size={48} color={COLORS.danger || "#FF0000"} />
            <Text style={styles.title}>Outlet Rejected</Text>
            <Text style={styles.description}>
              {vendorDetails.rejectReason ||
                'Your outlet registration was rejected. Please review and resubmit.'}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Outlet')}
            >
              <Text style={styles.buttonText}>Edit & Resubmit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 🕓 Default Fallback (e.g., for other incomplete statuses)
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.illustrationContainer}>
          <Icon name="timelapse-outline" size={64} color={COLORS.primary} />
          <Text style={styles.title}>Outlet Under Review</Text>
          <Text style={styles.description}>
            Your outlet details are being verified. We're finalizing your profile review, and you'll be notified within 24–48 hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OutletStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    marginVertical: 12,
  },
  illustrationContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginVertical: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  registerText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  loginBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  loginText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.background,
    textAlign: 'center',
  },
  supportButton: {
    backgroundColor: COLORS.danger || "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.background,
    textAlign: 'center',
  },
});