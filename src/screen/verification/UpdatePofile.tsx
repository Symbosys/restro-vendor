import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useUpdateVendorMutation, useVendorById } from '../../hooks/useVendorQueries';
import useAlertStore from '../../store/useAlertStore';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { Vendor, VendorStatus } from '../../types/vendor.types';

const UpdateProfile = ({ navigation }: AppNavigation) => {
  const { vendorId } = useAuth();
  const { data: vendor, isLoading: isFetching } = useVendorById();
  const { mutateAsync, isPending: isUpdating } = useUpdateVendorMutation(vendorId!);
  const showAlert = useAlertStore((state) => state.showAlert);

  const [formData, setFormData] = useState({
    ownerName: '',
    companyName: '',
    email: '',
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        ownerName: vendor.ownerName || '',
        companyName: vendor.companyName || '',
        email: vendor.email || '',
      });
    }
  }, [vendor]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!formData.ownerName || !formData.companyName || !formData.email) {
      showAlert("Missing Fields", "Please fill in all details.", "error");
      return;
    }

    try {
      const payload: Partial<Vendor> = vendor?.status === 'NEW'
        ? { ...formData, status: "DOCUMENTS_NOT_VERIFIED" as VendorStatus }
        : { ...formData };
      await mutateAsync(payload);
      showAlert("Success", "Profile updated successfully!", "success", "Outlet");
    } catch (error) {
      showAlert("Error", error instanceof AxiosError ? error.response?.data.message : "Failed to update profile.", "error");
    }
  };

  const hasChanges = vendor ? (
    formData.ownerName !== (vendor.ownerName || '') ||
    formData.companyName !== (vendor.companyName || '') ||
    formData.email !== (vendor.email || '')
  ) : false;

  const getInitials = () => {
    const name = formData.companyName || formData.ownerName || "V";
    return name.slice(0, 2).toUpperCase();
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isLocked = !!vendor?.isApproved;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerBarTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
              {/* Optional: Add camera icon if photo upload is supported later */}
            </View>
            <Text style={styles.profileName}>{formData.companyName || 'Business Name'}</Text>
            <View style={[styles.roleBadge, isLocked ? styles.roleBadgeVerified : styles.roleBadgePending]}>
              <Icon
                name={isLocked ? "verified" : "account-circle"}
                size={14}
                color={isLocked ? "#059669" : "#6B7280"}
              />
              <Text style={[styles.roleText, isLocked ? styles.roleTextVerified : styles.roleTextPending]}>
                {isLocked ? 'Verified Merchant' : 'Merchant Account'}
              </Text>
            </View>
          </View>

          {/* Locked Status Banner */}
          {isLocked && (
            <View style={styles.lockedBanner}>
              <Icon name="verified-user" size={20} color="#059669" />
              <View style={styles.lockedContent}>
                <Text style={styles.lockedTitle}>Profile Verified</Text>
                <Text style={styles.lockedDescription}>
                  Your profile has been verified. To make changes, please contact support.
                </Text>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Name</Text>
              <TextInput
                style={[styles.input, isLocked && styles.disabledInput]}
                value={formData.ownerName}
                onChangeText={(text) => handleInputChange('ownerName', text)}
                placeholder="Enter owner name"
                placeholderTextColor="#9CA3AF"
                editable={!isLocked}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={[styles.input, isLocked && styles.disabledInput]}
                value={formData.companyName}
                onChangeText={(text) => handleInputChange('companyName', text)}
                placeholder="Enter company name"
                placeholderTextColor="#9CA3AF"
                editable={!isLocked}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, isLocked && styles.disabledInput]}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Enter email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLocked}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Action */}
        {!isLocked && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                (!hasChanges || isUpdating) && styles.buttonDisabled
              ]}
              onPress={handleUpdate}
              disabled={!hasChanges || isUpdating}
              activeOpacity={0.8}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleBadgeVerified: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  roleBadgePending: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  roleTextVerified: {
    color: '#059669',
  },
  roleTextPending: {
    color: '#6B7280',
  },
  lockedBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  lockedContent: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  lockedDescription: {
    fontSize: 13,
    color: '#15803D',
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    borderColor: 'transparent',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UpdateProfile;