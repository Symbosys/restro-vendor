import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useVendorStore } from '../../api/query/vendor';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
// import { useAuth } from '../../context/AuthContext';

const SimplePersonalDetailsScreen = ({ navigation }: { navigation: NavigationProp<RootStackParamList> }) => {
  const { updateVendor, loading, loadingAction,  selectedVendor } = useVendorStore(); //fetchVendorById
  // const { id } = useAuth();

  const [email, setEmail] = React.useState(selectedVendor?.email || '');
  const [ownerName, setOwnerName] = React.useState(selectedVendor?.ownerName || '');
  const [companyName, setCompanyName] = React.useState(selectedVendor?.companyName || '');

//   useEffect(() => {
//     const loadVendorDetails = async (id: string) => {
//       await fetchVendorById(id);
//     };
//     if (id) {
//       loadVendorDetails(id);
//     }
//   }, [id]);

  useEffect(() => {
    if (selectedVendor) {
      setEmail(selectedVendor.email || '');
      setOwnerName(selectedVendor.ownerName || '');
      setCompanyName(selectedVendor.companyName || '');
    }
  }, [selectedVendor]);

  const handleSave = async () => {
    const payload = { email, ownerName, companyName };
    const res = await updateVendor(payload);
    if (res.data.success) {
      navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
    }
  };

  const handleContinue = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
  };

  const isDataComplete = selectedVendor?.email && selectedVendor?.ownerName && selectedVendor?.companyName;

  console.log("Selected Vendor:", selectedVendor);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Complete or update your details below</Text>
      </View>

      <View style={styles.card}>
        <TextInput
          style={[styles.input, email ? styles.inputFilled : {}]}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          style={[styles.input, ownerName ? styles.inputFilled : {}]}
          placeholder="Enter owner name"
          value={ownerName}
          onChangeText={setOwnerName}
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          style={[styles.input, companyName ? styles.inputFilled : {}]}
          placeholder="Enter company name"
          value={companyName}
          onChangeText={setCompanyName}
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={[styles.button, (loading && loadingAction === 'update') && styles.buttonDisabled]}
          activeOpacity={0.7}
          onPress={isDataComplete ? handleContinue : handleSave}
          disabled={loading && loadingAction === 'update'}
        >
          <Text style={styles.buttonText}>
            {loading && loadingAction === 'update' ? 'Saving...' : isDataComplete ? 'Continue' : 'Save Details'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SimplePersonalDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9eae9',
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  headerWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#8719c6',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: '#8719c6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  inputFilled: {
    borderColor: '#8719c6',
    backgroundColor: '#F3E8FF',
  },
  button: {
    backgroundColor: '#8719c6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});