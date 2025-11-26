import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpdateVendorMutation, useVendorById } from '../../hooks/useVendorQueries';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/color';
import useAlertStore from '../../store/useAlertStore';
import { AppNavigation } from '../../types/types';
import { AxiosError } from 'axios';
import { VendorStatus, Vendor } from '../../types/vendor.types';


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

  // Helper to get initials for the avatar
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* --- Header / Avatar Section --- */}
          <View style={styles.headerContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <Text style={styles.headerSubtitle}>Update your business identity</Text>
          </View>

          {/* --- Clean Form Section --- */}
          <View style={styles.formSection}>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>OWNER FULL NAME</Text>
              <TextInput
                style={styles.cleanInput}
                placeholder="e.g. John Doe"
                placeholderTextColor="#9CA3AF"
                value={formData.ownerName}
                onChangeText={(text) => handleInputChange('ownerName', text)}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>COMPANY / BRAND NAME</Text>
              <TextInput
                style={styles.cleanInput}
                placeholder="e.g. Tech Solutions Ltd."
                placeholderTextColor="#9CA3AF"
                value={formData.companyName}
                onChangeText={(text) => handleInputChange('companyName', text)}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>BUSINESS EMAIL</Text>
              <TextInput
                style={styles.cleanInput}
                placeholder="name@company.com"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

          </View>

        </ScrollView>

        {/* --- Floating Action Footer --- */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
            onPress={handleUpdate}
            disabled={isUpdating}
            activeOpacity={0.8}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white for clean look
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100, // Space for footer
  },

  // Header Styling
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary, // Uses your theme color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // Soft shadow for depth
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827', // Almost black
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280', // Cool gray
    fontWeight: '800',
  },

  // Form Styling
  formSection: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF', // Light gray label
    marginBottom: 8,
    letterSpacing: 0.8, // Spaced out caps
    textTransform: 'uppercase',
  },
  cleanInput: {
    backgroundColor: '#F3F4F6', // Increased contrast (was #F9FAFB)
    borderWidth: 1,              // Added border for better visibility
    borderColor: '#E5E7EB',      // Light gray border
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '800',
  },

  // Footer Styling
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default UpdateProfile;