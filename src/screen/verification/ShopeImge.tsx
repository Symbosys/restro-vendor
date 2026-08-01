import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useUpdateVendorMutation, useVendorById } from '../../hooks/useVendorQueries';
import { COLORS } from '../../theme/color';
import { RootStackParamList } from '../../types/types';
import api from '../../api/api';

interface ShopImageUploadScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const ShopImageUploadScreen: React.FC<ShopImageUploadScreenProps> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const { vendorId, token } = useAuth();
  const { data: vendor, refetch: refetchVendor } = useVendorById();
  const { mutateAsync } = useUpdateVendorMutation(vendorId!);

  useEffect(() => {
    if (vendor?.images?.url) {
      setImageUri(vendor.images.url);
    }
  }, [vendor]);

  const isImageFromApi = vendor?.images?.url === imageUri;
  const isButtonDisabled = uploading || !imageUri;

  const handleSelectImage = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'Minta Fresh needs access to your camera to take a photo of your shop.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show('Camera permission denied', ToastAndroid.SHORT);
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1280,
        maxHeight: 1280,
        includeBase64: false,
      });

      if (result.didCancel) {
        ToastAndroid.show('Cancelled', ToastAndroid.SHORT);
      } else if (result.errorCode) {
        ToastAndroid.show(result.errorMessage || 'Error selecting image', ToastAndroid.SHORT);
      } else if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) {
          setImageUri(asset.uri);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      ToastAndroid.show('Please select an image first', ToastAndroid.SHORT);
      return;
    }

    if (isImageFromApi) {
      if (vendor?.status === 'APPROVED') {
        navigation.goBack();
      } else {
        navigation.navigate('ProductSelection');
      }
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'shop-image.jpg',
      } as any);


      if (vendor?.status !== 'APPROVED') {
        formData.append('status', 'PRODUCT_SELECTION_NOT_DONE');
      }

      // Use fetch to avoid Axios network errors with FormData
      const baseURL = api.defaults.baseURL || 'http://192.168.31.40:4000/api/v1/minta-fresh';
      const response = await fetch(`${baseURL}/vendor/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type must be omitted so the browser/engine sets it with boundary
        },
        body: formData,
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (err) {
        console.error("Non-JSON API response:", responseText);
        throw new Error("Server returned an invalid response. Check console for details.");
      }

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      refetchVendor();

      ToastAndroid.show('Shop image updated!', ToastAndroid.SHORT);
      if (vendor?.status === 'APPROVED') {
        navigation.goBack();
      } else {
        navigation.navigate('ProductSelection');
      }
    } catch (error: any) {
      console.error(error);
      ToastAndroid.show(error.message || 'Upload failed', ToastAndroid.LONG);
    } finally {
      setUploading(false);
    }
  };

  // Icons for guidelines (using remote icons to match the style without local assets)
  const ICONS = {
    sun: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
    camera: 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
    store: 'https://cdn-icons-png.flaticon.com/512/869/869636.png',
    upload: 'https://cdn-icons-png.flaticon.com/512/1040/1040241.png'
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (vendor?.status === 'APPROVED' && navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('ShopDetails');
            }
          }} 
          style={styles.backButton}
        >
          {/* Simple Arrow Icon representation */}
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {imageUri ? "Shop Image" : "Shop Setup"}
        </Text>
        <View style={{ width: 24 }} />{/* Spacer for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* --- Main Titles --- */}
        <Text style={styles.mainTitle}>
          {imageUri ? "Upload Your Shop's\nMain Photo" : "Showcase Your Shop"}
        </Text>
        <Text style={styles.subTitle}>
          {imageUri
            ? "Use a high-quality photo of your storefront or a signature dish."
            : "Upload a photo that represents your business."}
        </Text>

        {/* --- Upload Area (Dynamic based on state) --- */}
        {imageUri ? (
          // Filled State (Matches screen.jpg)
          <View style={styles.previewContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.changeImageButton} onPress={handleSelectImage}>
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Empty State (Matches shop.png dashed box)
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={handleSelectImage}
            activeOpacity={0.8}
          >
            <Image source={{ uri: ICONS.camera }} style={styles.uploadIconMain} />
            <Text style={styles.uploadBoxTitle}>Take a high-quality photo</Text>
            <Text style={styles.uploadBoxSub}>Tap here to open camera</Text>

            <View style={styles.innerUploadBtn}>
              <Text style={styles.innerUploadBtnText}>Take Photo</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* --- Guidelines Section (Matches shop.png) --- */}
        {!imageUri && (
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>

            <View style={styles.guidelineRow}>
              <View style={styles.iconCircle}>
                <Image source={{ uri: ICONS.sun }} style={styles.guidelineIcon} />
              </View>
              <Text style={styles.guidelineText}>Use bright, natural lighting.</Text>
            </View>

            <View style={styles.guidelineRow}>
              <View style={styles.iconCircle}>
                <Image source={{ uri: ICONS.camera }} style={styles.guidelineIcon} />
              </View>
              <Text style={styles.guidelineText}>Ensure the image is clear and not blurry.</Text>
            </View>

            <View style={styles.guidelineRow}>
              <View style={styles.iconCircle}>
                <Image source={{ uri: ICONS.store }} style={styles.guidelineIcon} />
              </View>
              <Text style={styles.guidelineText}>Showcase your storefront</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* --- Footer Action --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.mainButton, isButtonDisabled && styles.disabledBtn]}
          onPress={handleUpload}
          disabled={isButtonDisabled}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.mainButtonText}>
              {imageUri ? "Save" : "Next"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Light grey/white background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Titles
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 36,
  },
  subTitle: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 32,
  },

  // Upload Box (Empty State - Dashed)
  uploadBox: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#CBD5E1', // Light grey border
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  uploadIconMain: {
    width: 56,
    height: 56,
    tintColor: COLORS.primary,
    marginBottom: 16,
  },
  uploadBoxTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadBoxSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  innerUploadBtn: {
    backgroundColor: '#DBEAFE', // Very light blue
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  innerUploadBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  // Preview State (Filled)
  previewContainer: {
    width: '100%',
    marginBottom: 24,
  },
  imageWrapper: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeImageButton: {
    width: '100%',
    backgroundColor: '#DBEAFE', // Light blue
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  changeImageText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  // Guidelines
  guidelinesContainer: {
    marginTop: 0,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE', // Light blue circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  guidelineIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary,
  },
  guidelineText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },

  // Footer
  footer: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ShopImageUploadScreen;