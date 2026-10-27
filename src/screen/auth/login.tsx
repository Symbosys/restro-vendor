import { NavigationProp } from '@react-navigation/native';
import { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/types';
import { ErrorMessage } from '../../utils/utils';
import { COLORS } from '../../theme/color';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: { navigation: NavigationProp<RootStackParamList> }) => {
  const insets = useSafeAreaInsets();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const { isAuthenticated } = useAuth();

  console.log({ isAuthenticated });

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'BottomTab' }],
      });
    }
  }, [isAuthenticated]);

  const handleOpenModal = () => {
    setShowPhoneModal(true);
  };

  const handleCloseModal = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPhoneModal(false);
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (phoneNumber.length === 10) {
        const res = await api.post('/auth/vendor/request-otp', {
          mobile: phoneNumber,
        });
        if (res.data.success) {
          ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
          navigation.navigate('Otp', { mobile: phoneNumber });
        }
      } else {
        ToastAndroid.show(
          'Please enter a valid 10-digit number',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      console.log({ error });
      ErrorMessage(error as AxiosError | Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[{ paddingTop: insets.top, flex: 1 }]}>
        {/* Top full-bleed logo section – ignores safe area for max height */}
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Bottom section starts right after */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenModal}>
            <Text style={styles.primaryButtonText}>Log in with phone number</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By tapping, I accept the{' '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('TermsAndConditions')}
              >
                terms of service
              </Text>
              {' & '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                privacy policy
              </Text>
            </Text>
          </View>
        </View>

        {/* Modal */}
        <Modal
          visible={showPhoneModal}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={handleCloseModal}
          onShow={() => {
            Animated.parallel([
              Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          }}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { paddingTop: insets.top + 20, paddingBottom: 30 },
                ]}
              >
                <Text style={styles.brandName}>Vendor Partner</Text>
                <Text style={styles.brandTagline}>Quick & fresh.</Text>
              </View>

              <View style={styles.modalBody}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={{ flex: 1 }}
                >
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View style={styles.topContentWrapper}>
                      <Text style={styles.modalTitle}>
                        Enter your mobile number to manage orders
                      </Text>

                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mobile Number</Text>
                        <View style={styles.phoneInputWrapper}>
                          <View style={styles.countryCodeContainer}>
                            <Text style={styles.flagEmoji}>🇮🇳</Text>
                            <Text style={styles.countryCode}>+91</Text>
                            <Icon name="keyboard-arrow-down" size={20} color="#000000" />
                          </View>
                          <View style={styles.divider} />
                          <TextInput
                            style={styles.phoneInput}
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder=""
                            placeholderTextColor="#A0A0A0"
                          />
                          {phoneNumber.length > 0 && (
                            <TouchableOpacity onPress={() => setPhoneNumber('')}>
                              <Icon name="cancel" size={20} color="#A0A0A0" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.modalFooter}>
                      <TouchableOpacity
                        style={[
                          styles.continueButton,
                          (phoneNumber.length < 10 || loading) && styles.continueButtonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={phoneNumber.length < 10 || loading}
                      >
                        <Text
                          style={[
                            styles.continueButtonText,
                            phoneNumber.length < 10 && styles.continueButtonTextDisabled,
                          ]}
                        >
                          {loading ? 'Continue...' : 'Continue'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.modalTermsContainer}>
                        <Text style={styles.modalTermsText}>
                          I accept the{' '}
                          <Text
                            style={styles.modalTermsLink}
                            onPress={() => {
                              handleCloseModal();
                              navigation.navigate('TermsAndConditions');
                            }}
                          >
                            terms of service
                          </Text>
                          {' & '}
                          <Text
                            style={styles.modalTermsLink}
                            onPress={() => {
                              handleCloseModal();
                              navigation.navigate('PrivacyPolicy');
                            }}
                          >
                            privacy policy
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topSection: {
    flex: 1,
    backgroundColor: "#fff",
    position: 'relative',
  },

  logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },

  bottomSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#666666',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  // Modal styles
  modalContainer: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'transparent',
  },
  modalHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginTop: 10,
  },
  brandTagline: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '800',
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  topContentWrapper: {},
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 24,
    lineHeight: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginBottom: -8,
    marginLeft: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: { fontSize: 18, marginRight: 6 },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginRight: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#000000',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
    fontWeight: '500',
  },
  modalFooter: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#A0A0A0',
  },
  modalTermsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTermsText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalTermsLink: {
    color: '#666666',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default LoginScreen;