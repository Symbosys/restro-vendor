// import React, { useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { useVendorStore } from '../../api/query/vendor';
// import { NavigationProp } from '@react-navigation/native';
// import { RootStackParamList } from '../../types/types';
// import { useVendorById } from '../../hooks/useVendorQueries';
// // import { useAuth } from '../../context/AuthContext';

// const SimplePersonalDetailsScreen = ({ navigation }: { navigation: NavigationProp<RootStackParamList> }) => {
//   const { updateVendor, loading, loadingAction,  selectedVendor } = useVendorStore(); //fetchVendorById
//   // const { id } = useAuth();

//   const [email, setEmail] = React.useState(selectedVendor?.email || '');
//   const [ownerName, setOwnerName] = React.useState(selectedVendor?.ownerName || '');
//   const [companyName, setCompanyName] = React.useState(selectedVendor?.companyName || '');

// //   useEffect(() => {
// //     const loadVendorDetails = async (id: string) => {
// //       await fetchVendorById(id);
// //     };
// //     if (id) {
// //       loadVendorDetails(id);
// //     }
//   //   }, [id]);
  
//   const { data: vendor } = useVendorById()
  
//   console.log("Vendor Data:", vendor);

//   useEffect(() => {
//     if (selectedVendor) {
//       setEmail(selectedVendor.email || '');
//       setOwnerName(selectedVendor.ownerName || '');
//       setCompanyName(selectedVendor.companyName || '');
//     }
//   }, [selectedVendor]);

//   const handleSave = async () => {
//     const payload = { email, ownerName, companyName };
//     const res = await updateVendor(payload);
//     if (res.data.success) {
//       navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
//     }
//   };

//   const handleContinue = () => {
//     navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
//   };

//   const isDataComplete = selectedVendor?.email && selectedVendor?.ownerName && selectedVendor?.companyName;

//   console.log("Selected Vendor:", selectedVendor);

//   return (
//     <View style={styles.container}>
//       <View style={styles.headerWrapper}>
//         <Text style={styles.title}>Your Profile</Text>
//         <Text style={styles.subtitle}>Complete or update your details below</Text>
//       </View>

//       <View style={styles.card}>
//         <TextInput
//           style={[styles.input, email ? styles.inputFilled : {}]}
//           placeholder="Enter your email"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           placeholderTextColor="#9CA3AF"
//         />

//         <TextInput
//           style={[styles.input, ownerName ? styles.inputFilled : {}]}
//           placeholder="Enter owner name"
//           value={ownerName}
//           onChangeText={setOwnerName}
//           placeholderTextColor="#9CA3AF"
//         />

//         <TextInput
//           style={[styles.input, companyName ? styles.inputFilled : {}]}
//           placeholder="Enter company name"
//           value={companyName}
//           onChangeText={setCompanyName}
//           placeholderTextColor="#9CA3AF"
//         />

//         <TouchableOpacity
//           style={[styles.button, (loading && loadingAction === 'update') && styles.buttonDisabled]}
//           activeOpacity={0.7}
//           onPress={isDataComplete ? handleContinue : handleSave}
//           disabled={loading && loadingAction === 'update'}
//         >
//           <Text style={styles.buttonText}>
//             {loading && loadingAction === 'update' ? 'Saving...' : isDataComplete ? 'Continue' : 'Save Details'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default SimplePersonalDetailsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9eae9',
//     paddingHorizontal: 20,
//     paddingVertical: 32,
//     justifyContent: 'center',
//   },
//   headerWrapper: {
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#8719c6',
//     letterSpacing: 0.2,
//   },
//   subtitle: {
//     fontSize: 15,
//     color: '#6B7280',
//     marginTop: 8,
//     fontWeight: '400',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     padding: 16,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     borderWidth: 0.5,
//     borderColor: '#8719c6',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     fontSize: 15,
//     marginBottom: 12,
//     backgroundColor: '#F9FAFB',
//     color: '#1F2937',
//   },
//   inputFilled: {
//     borderColor: '#8719c6',
//     backgroundColor: '#F3E8FF',
//   },
//   button: {
//     backgroundColor: '#8719c6',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//     letterSpacing: 0.4,
//   },
// });






import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useUpdateVendorMutation, useVendorById } from '../../hooks/useVendorQueries';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/color';
import { SafeAreaView } from 'react-native-safe-area-context';

const UpdateProfile = () => {
  const { vendorId } = useAuth();

  // 1. Fetch Data (Assuming hook returns isLoading as well)
  const { data: vendor, isLoading: isFetching } = useVendorById();

  // 2. Mutation Hook
  const { mutateAsync, isPending: isUpdating } = useUpdateVendorMutation(vendorId!);

  // 3. Local State for Form Inputs
  const [formData, setFormData] = useState({
    ownerName: '',
    companyName: '',
    email: '',
  });

  // 4. Sync API data to Local State
  // This ensures inputs are pre-filled when data loads
  useEffect(() => {
    if (vendor) {
      setFormData({
        ownerName: vendor.ownerName || '',     // Use API data or empty string
        companyName: vendor.companyName || '',
        email: vendor.email || '',
      });
    }
  }, [vendor]);

  // Handle Text Input Changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Submit
  const handleUpdate = async () => {
    if (!formData.ownerName || !formData.companyName || !formData.email) {
      Alert.alert("Missing Fields", "Please fill in all details.");
      return;
    }

    try {
      const resp = await mutateAsync({ ...formData, status: "DOCUMENTS_NOT_VERIFIED" });
      console.log(resp);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  // Show loading spinner if fetching initial data
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your business details below</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>

            {/* Owner Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter owner name"
                placeholderTextColor={COLORS.muted}
                value={formData.ownerName}
                onChangeText={(text) => handleInputChange('ownerName', text)}
              />
            </View>

            {/* Company Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter company name"
                placeholderTextColor={COLORS.muted}
                value={formData.companyName}
                onChangeText={(text) => handleInputChange('companyName', text)}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={COLORS.muted}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isUpdating && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    // Shadow for iOS
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    // Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});