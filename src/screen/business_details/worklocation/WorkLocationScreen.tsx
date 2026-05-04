import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../theme/color';
import { useCities, useAreasByCity, City, Area } from '../../../api/hooks/location.hook';
import { useChangeWorkLocation } from '../../../api/hooks/vendor.hook';
import { useVendorById } from '../../../hooks/useVendorQueries';
import { useAuth } from '../../../context/AuthContext';
import { SuccessMessage, ErrorMessage } from '../../../utils/utils';

const { height } = Dimensions.get('window');

/**
 * WorkLocationScreen allows vendors to select and update their primary work city and area.
 * It uses TanStack Query for fetching locations and performing the update mutation.
 */
const WorkLocationScreen = ({ navigation }: any) => {
  const { vendorId } = useAuth();
  
  // Fetch vendor data to show current location (if any)
  const { data: vendor, isLoading: isVendorLoading } = useVendorById();
  
  // Selection states
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  
  // UI states for modals
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  // Queries for fetching cities and areas
  const { data: cities, isLoading: isCitiesLoading } = useCities();
  const { data: areas, isLoading: isAreasLoading } = useAreasByCity(selectedCity?.id);

  // Mutation for updating work location
  const { mutate: changeLocation, isPending: isUpdating } = useChangeWorkLocation();

  // Initialize selection from vendor data if available
  useEffect(() => {
    if (vendor && vendor.vendorWorkLocations) {
        // We might want to pre-fill based on ID, but we need the names for the UI.
        // For now, we allow the user to select fresh ones to ensure data consistency.
    }
  }, [vendor]);

  /**
   * Handles the save action to update vendor's work location
   */
  const handleSave = () => {
    if (!selectedCity || !selectedArea) {
      return;
    }

    changeLocation(
      {
        cityId: selectedCity.id,
        areaId: selectedArea.id,
      },
      {
        onSuccess: () => {
          // Success handled in the hook's onSuccess (toast shown)
          navigation.goBack();
        },
      }
    );
  };

  /**
   * Renders an item in the city or area selection list
   */
  const renderPickerItem = ({ item, type }: { item: any; type: 'city' | 'area' }) => {
    const isSelected = type === 'city' ? selectedCity?.id === item.id : selectedArea?.id === item.id;
    
    return (
      <TouchableOpacity
        style={styles.pickerItem}
        onPress={() => {
          if (type === 'city') {
            setSelectedCity(item);
            setSelectedArea(null); // Reset area when city changes
            setShowCityModal(false);
          } else {
            setSelectedArea(item);
            setShowAreaModal(false);
          }
        }}
      >
        <Text style={[
          styles.pickerItemText,
          isSelected && styles.selectedItemText
        ]}>
          {item.name}
        </Text>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isVendorLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Work Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Intro Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardGlow} />
          <Text style={styles.infoTitle}>Service Hub</Text>
          <Text style={styles.infoSubtitle}>
            Update your operational city and area to receive relevant orders and updates.
          </Text>
        </View>

        {/* City Selection Section */}
        <View style={styles.section}>
          <Text style={styles.label}>OPERATING CITY</Text>
          <TouchableOpacity 
            style={[styles.selector, showCityModal && styles.selectorActive]} 
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.selectorText, !selectedCity && styles.placeholder]}>
                {selectedCity ? selectedCity.name : "Select City"}
              </Text>
              {selectedCity && <Text style={styles.selectionLabel}>Tap to change city</Text>}
            </View>
            {isCitiesLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.dropdownIcon}>▼</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Area Selection Section */}
        <View style={[styles.section, !selectedCity && styles.disabledSection]}>
          <Text style={styles.label}>SPECIFIC AREA</Text>
          <TouchableOpacity 
            style={[
                styles.selector, 
                !selectedCity && styles.disabledSelector,
                showAreaModal && styles.selectorActive
            ]} 
            onPress={() => selectedCity && setShowAreaModal(true)}
            disabled={!selectedCity}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.selectorText, !selectedArea && styles.placeholder]}>
                {selectedArea ? selectedArea.name : (selectedCity ? "Select Area" : "Select city first")}
              </Text>
              {selectedArea && <Text style={styles.selectionLabel}>Tap to change area</Text>}
            </View>
            {isAreasLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.dropdownIcon}>▼</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Current Working Location Display */}
        {vendor?.vendorWorkLocations && (
           <View style={styles.currentBadge}>
             <View style={styles.pulseDot} />
             <Text style={styles.currentBadgeText}>
               Active in: <Text style={{fontWeight: '800'}}>{vendor.vendorWorkLocations.city.name + " - " + vendor.vendorWorkLocations.area.name || 'N/A'}</Text>
             </Text>
           </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, (!selectedCity || !selectedArea || isUpdating) && styles.disabledButton]}
          onPress={handleSave}
          disabled={!selectedCity || !selectedArea || isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Apply Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* City Selection Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select City</Text>
                <Text style={styles.modalSubtitle}>Cities we currently serve</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCityModal(false)} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={(props) => renderPickerItem({ ...props, type: 'city' })}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Loading cities...</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Area Selection Modal */}
      <Modal visible={showAreaModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Area</Text>
                <Text style={styles.modalSubtitle}>Available areas in {selectedCity?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAreaModal(false)} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            {isAreasLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.emptyStateText}>Fetching areas...</Text>
              </View>
            ) : areas && areas.length > 0 ? (
              <FlatList
                data={areas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={(props) => renderPickerItem({ ...props, type: 'area' })}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No operational areas found in this city yet.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    fontSize: 26,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  infoSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: '#ececec',
  },
  selectorActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fdfbff',
  },
  selectorText: {
    fontSize: 17,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  selectionLabel: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  placeholder: {
    color: COLORS.muted,
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 10,
    color: COLORS.muted,
  },
  disabledSection: {
    opacity: 0.5,
  },
  disabledSelector: {
    backgroundColor: '#f9f9f9',
    borderColor: '#eee',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.1)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  currentBadgeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: '#d1d1d1',
    elevation: 0,
    shadowOpacity: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.75,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  closeIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  pickerItemText: {
    fontSize: 17,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedItemText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '900',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  }
});

export default WorkLocationScreen;
