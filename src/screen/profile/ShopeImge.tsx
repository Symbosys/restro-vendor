import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ToastAndroid,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../theme/color';

interface ShopImageUploadScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const ShopImageUploadScreen: React.FC<ShopImageUploadScreenProps> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Handle image selection from gallery
  const handleSelectImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      });

      if (result.didCancel) {
        ToastAndroid.show('Image selection cancelled', ToastAndroid.SHORT);
      } else if (result.errorCode) {
        ToastAndroid.show(`Error: ${result.errorMessage}`, ToastAndroid.SHORT);
      } else if (result.assets && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        ToastAndroid.show('Image selected successfully', ToastAndroid.SHORT);
      }
    } catch (error) {
        console.error(error);
      ToastAndroid.show('Failed to select image', ToastAndroid.SHORT);
    }
  };

  // Handle image upload (placeholder API call)
  const handleUpload = async () => {
    if (!imageUri) {
      ToastAndroid.show('Please select an image first', ToastAndroid.SHORT);
      return;
    }

    setUploading(true);
    try {
      // Placeholder API call (replace with your actual API endpoint)
      // Example: await api.post('/upload/shop-image', { image: imageUri });
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      ToastAndroid.show('Shop image uploaded successfully!', ToastAndroid.SHORT);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Outlet' }],
      });
    } catch (error) {
        console.error(error);
      ToastAndroid.show('Failed to upload image', ToastAndroid.LONG);
    } finally {
      setUploading(false);
    }
  };

  // Handle skip (navigate to OutletScreen)
  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Outlet' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📸 Upload Shop Image</Text>
        <Text style={styles.headerSubtitle}>
          Add a photo of your shop to complete your profile
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={{
                uri: 'https://static.vecteezy.com/system/resources/previews/015/131/905/original/flat-cartoon-style-shop-facade-front-view-modern-flat-storefront-or-supermarket-design-png.png',
              }}
              style={styles.image}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Select Image Button */}
        <TouchableOpacity
          style={[styles.selectButton, uploading && styles.buttonDisabled]}
          onPress={handleSelectImage}
          disabled={uploading}
        >
          <Text style={styles.selectButtonText}>
            {imageUri ? 'Change Image' : 'Select Image'}
          </Text>
        </TouchableOpacity>

        {/* Upload and Skip Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.buttonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={uploading}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    opacity: 0.95,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: 220,
    height: 180,
  },
  selectButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  skipButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  skipButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    backgroundColor: COLORS.muted,
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default ShopImageUploadScreen;