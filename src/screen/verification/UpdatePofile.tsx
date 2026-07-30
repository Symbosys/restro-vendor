import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  FlatList,
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
import { useVendorById } from '../../hooks/useVendorQueries';
import { useUpdateProfileMutation } from '../../api/hooks/verification';
import useAlertStore from '../../store/useAlertStore';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import api from '../../api/api';

interface VendorOwnerItem {
  id: string | number;
  name: string;
  email?: string;
  mobile?: string;
  fssaiLicenceNumber?: string | null;
  city?: string | null;
  state?: string | null;
}

const UpdateProfile = ({ navigation }: AppNavigation) => {
  const { vendorId } = useAuth();
  const { data: vendor, isLoading: isFetching } = useVendorById();
  const { mutateAsync, isPending: isUpdating } = useUpdateProfileMutation(vendorId!);
  const showAlert = useAlertStore((state) => state.showAlert);

  const [formData, setFormData] = useState({
    ownerName: '',
    companyName: '',
    email: '',
  });

  const [selectedVendorOwner, setSelectedVendorOwner] = useState<VendorOwnerItem | null>(null);

  // Vendor Owner Modal states
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vendorOwnersList, setVendorOwnersList] = useState<VendorOwnerItem[]>([]);
  const [isSearchingOwners, setIsSearchingOwners] = useState<boolean>(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        ownerName: vendor.ownerName || '',
        companyName: vendor.companyName || '',
        email: vendor.email || '',
      });
      if (vendor.vendorOwner) {
        setSelectedVendorOwner({
          id: vendor.vendorOwner.id,
          name: vendor.vendorOwner.name,
          email: vendor.vendorOwner.email,
          mobile: vendor.vendorOwner.mobile,
          fssaiLicenceNumber: vendor.vendorOwner.fssaiLicenceNumber,
        });
      }
    }
  }, [vendor]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch / search vendor owners from server
  const fetchVendorOwners = async (query: string = '') => {
    try {
      setIsSearchingOwners(true);
      const res = await api.get('/auth/vendor-owner/search', {
        params: { q: query },
      });
      setVendorOwnersList(res.data.data || []);
    } catch (err) {
      console.error('Failed to search vendor owners:', err);
    } finally {
      setIsSearchingOwners(false);
    }
  };

  const handleOpenModal = () => {
    if (isLocked) return;
    setIsModalVisible(true);
    fetchVendorOwners('');
  };

  const handleSelectVendorOwner = (owner: VendorOwnerItem) => {
    setSelectedVendorOwner(owner);
    setIsModalVisible(false);
  };

  const handleClearVendorOwner = () => {
    setSelectedVendorOwner(null);
  };

  const handleUpdate = async () => {
    if (!formData.ownerName || !formData.companyName || !formData.email) {
      showAlert("Missing Fields", "Please fill in all required details.", "error");
      return;
    }

    try {
      const payload: any = {
        ...formData,
        vendorOwnerId: selectedVendorOwner ? selectedVendorOwner.id : null,
      };
      if (vendor?.status === 'NEW') {
        payload.status = "DOCUMENTS_NOT_VERIFIED";
      }

      await mutateAsync(payload);
      showAlert("Success", "Profile updated successfully!", "success", "Outlet");
    } catch (error) {
      showAlert("Error", error instanceof AxiosError ? error.response?.data.message : "Failed to update profile.", "error");
    }
  };

  const hasChanges = vendor ? (
    formData.ownerName !== (vendor.ownerName || '') ||
    formData.companyName !== (vendor.companyName || '') ||
    formData.email !== (vendor.email || '') ||
    (selectedVendorOwner?.id || null) !== (vendor.vendorOwner?.id || null)
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
              <Text style={styles.label}>Owner Name *</Text>
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
              <Text style={styles.label}>Company Name *</Text>
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
              <Text style={styles.label}>Shop Email Address *</Text>
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

            {/* BELONGS TO VENDOR OWNER SELECTOR */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Belongs to Vendor Owner</Text>
              <TouchableOpacity
                style={[
                  styles.ownerCard,
                  selectedVendorOwner ? styles.ownerCardSelected : styles.ownerCardEmpty,
                  isLocked && styles.disabledInput,
                ]}
                onPress={handleOpenModal}
                activeOpacity={0.7}
                disabled={isLocked}
              >
                {selectedVendorOwner ? (
                  <View style={styles.ownerCardContent}>
                    <View style={styles.ownerIconWrapper}>
                      <Icon name="person" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ownerCardName}>{selectedVendorOwner.name}</Text>
                      {selectedVendorOwner.mobile && (
                        <Text style={styles.ownerCardDetail}>📱 {selectedVendorOwner.mobile}</Text>
                      )}
                      {selectedVendorOwner.email && (
                        <Text style={styles.ownerCardDetail}>✉️ {selectedVendorOwner.email}</Text>
                      )}
                      {selectedVendorOwner.fssaiLicenceNumber && (
                        <Text style={styles.ownerCardDetail}>📄 FSSAI: {selectedVendorOwner.fssaiLicenceNumber}</Text>
                      )}
                    </View>
                    {!isLocked && (
                      <TouchableOpacity onPress={handleClearVendorOwner} style={styles.clearOwnerButton}>
                        <Icon name="close" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.ownerCardPlaceholder}>
                    <Icon name="person-search" size={22} color="#6B7280" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.placeholderText}>Tap to search & select Vendor Owner</Text>
                      <Text style={styles.placeholderSubText}>Link shop under a registered Vendor Owner</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>
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

      {/* VENDOR OWNER SEARCH MODAL */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Vendor Owner</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Box */}
          <View style={styles.modalSearchContainer}>
            <View style={styles.searchBox}>
              <Icon name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, phone, email, or FSSAI..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  fetchVendorOwners(text);
                }}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); fetchVendorOwners(''); }}>
                  <Icon name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Owners List */}
          {isSearchingOwners ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 8, color: '#6B7280' }}>Searching vendor owners...</Text>
            </View>
          ) : (
            <FlatList
              data={vendorOwnersList}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="person-off" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>No Vendor Owners Found</Text>
                  <Text style={styles.emptySubtitle}>Try searching with a different name, phone, email, or FSSAI number.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOwnerItem}
                  onPress={() => handleSelectVendorOwner(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalOwnerIcon}>
                    <Icon name="person" size={22} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalOwnerName}>{item.name}</Text>
                    <Text style={styles.modalOwnerMeta}>📱 {item.mobile}  •  ✉️ {item.email}</Text>
                    {item.fssaiLicenceNumber ? (
                      <Text style={styles.modalOwnerFssai}>FSSAI: {item.fssaiLicenceNumber}</Text>
                    ) : null}
                  </View>
                  <Icon name="check-circle-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  ownerCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  ownerCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: COLORS.primary,
  },
  ownerCardEmpty: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  ownerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  ownerCardDetail: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  clearOwnerButton: {
    padding: 6,
  },
  ownerCardPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholderSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalSearchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOwnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  modalOwnerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOwnerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  modalOwnerMeta: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  modalOwnerFssai: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default UpdateProfile;