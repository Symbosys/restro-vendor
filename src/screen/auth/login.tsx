import {Axios, AxiosError} from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../api/api';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { ErrorMessage } from '../../utils/utils';
import { useAuth } from '../../context/AuthContext';

const {width, height} = Dimensions.get('window');

const LoginScreen = ({navigation}: {navigation: NavigationProp<RootStackParamList>}) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const { isAuthenticated } = useAuth()
  

  console.log({isAuthenticated})

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'BottomTab' }],
      });
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (showPhoneModal) {
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
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPhoneModal, slideAnim, backdropAnim]);

  const handleCloseModal = () => {
    setShowPhoneModal(false);
  };

  const handleOpenModal = () => {
    setShowPhoneModal(true);
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
          navigation.navigate('Otp', {mobile: phoneNumber});
        }
      } else {
        ToastAndroid.show(
          'Please enter a valid 10-digit number',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      console.log({error});
      ErrorMessage(error as AxiosError | Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="" />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Green Background Section with Image */}
      <View style={styles.topSection}>
        {/* Delivery Person Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Quick & fresh.</Text>
      </View>

      {/* Bottom White Section */}
      <View style={styles.bottomSection}>
        {/* Primary Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleOpenModal}>
          <Text style={styles.primaryButtonText}>Log in with phone number</Text>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By tapping, I accept the{' '}
            <Text style={styles.termsLink}>terms of service</Text>
            {' & '}
            <Text style={styles.termsLink}>privacy policy</Text>
          </Text>
        </View>
      </View>

      {/* Phone Number Modal */}
      <Modal
        visible={showPhoneModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropAnim,
                },
              ]}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{translateY: slideAnim}],
              },
            ]}>
            {/* Green Header */}
            <ImageBackground
              source={require('../../assets/logo/LOGO.png')}
              style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleCloseModal}>
                <Icon name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButtonModal}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>

              <Text style={styles.lowestPriceText}>Quick & Fresh</Text>
            </ImageBackground>

            {/* White Content */}
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>
                Enter your mobile number to manage orders
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.phoneInputWrapper}>
                  <View style={styles.countryCodeContainer}>
                    <Text style={styles.flagEmoji}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                    <Icon name="keyboard-arrow-down" size={20} color="#000" />
                  </View>
                  <View style={styles.divider} />
                  <TextInput
                    style={styles.phoneInput}
                    placeholder=""
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    (phoneNumber.length < 10 || loading) &&
                      styles.continueButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={phoneNumber.length < 10 || loading}>
                  <Text
                    style={[
                      styles.continueButtonText,
                      phoneNumber.length < 10 &&
                        styles.continueButtonTextDisabled,
                      {opacity: loading ? 0.5 : 1},
                    ]}>
                    {loading ? 'Continue...' : 'Continue'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalTermsContainer}>
                  <Text style={styles.modalTermsText}>
                    I accept the{' '}
                    <Text style={styles.modalTermsLink}>terms of service</Text>
                    {' & '}
                    <Text style={styles.modalTermsLink}>privacy policy</Text>
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9eae9',
  },
  skipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'black',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 25,
    zIndex: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#f9eae9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FF69B4',
    fontStyle: 'italic',
    textShadowColor: '#8B008B',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 0,
    letterSpacing: -2,
  },
  bySwiggy: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: -10,
  },
  tagline: {
    fontSize: 26,
    color: 'black',
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
  },
  illustration: {
    width: width * 0.8,
    height: height * 0.4,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#8719C6',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  secondaryButtonText: {
    color: '#1D9C3A',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    backgroundColor: '#1D9C3A',
    paddingTop: 220,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  skipButtonModal: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#0C6B26',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 25,
    zIndex: 10,
  },
  modalLogoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  modalLogoText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#FF69B4',
    fontStyle: 'italic',
    textShadowColor: '#8B008B',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 0,
    letterSpacing: -2,
  },
  modalBySwiggy: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: -8,
  },
  lowestPriceText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
    marginTop: 5,
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 30,
    lineHeight: 32,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#',
    marginBottom: 10,
    marginLeft: 5,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8719C6',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 5,
  },
  divider: {
    width: 2,
    height: 24,
    backgroundColor: '#000000',
    marginHorizontal: 15,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  modalFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  continueButton: {
    backgroundColor: '#1D9C3A',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
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



// import React, { useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ImageBackground,
//   StatusBar,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

// const { width } = Dimensions.get('window');

// const LoginScreen = () => {
//   const [mobileNumber, setMobileNumber] = useState('');

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="transparent"
//         translucent
//       />
//       {/* Replace with the correct path to your image asset */}
//       <ImageBackground
//         source={require('../../assets/login/login_bg.png')}
//         style={styles.backgroundImage}
//         resizeMode="cover">
//         <View style={styles.contentContainer}>
//           {/* Title Section */}
//           <View style={styles.headerContainer}>
//             <Text style={styles.titleText}>Minta Fresh</Text>
//             <Text style={styles.subtitleText}>
//               Order Uncooked Chicken & Fish
//             </Text>
//           </View>

//           {/* Input Field */}
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.textInput}
//               placeholder="Enter your Mobile Number"
//               placeholderTextColor="#A68B6C" // A warm, brownish-gray for placeholder
//               keyboardType="phone-pad"
//               value={mobileNumber}
//               onChangeText={setMobileNumber}
//             />
//           </View>

//           {/* Gradient Button with Shadow */}
//           <TouchableOpacity activeOpacity={0.8} style={styles.buttonContainer}>
//             <LinearGradient
//               // The exact warm golden-orange gradient colors from the image
//               colors={['#EFA853', '#D98C3A']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={styles.gradientButton}>
//               <Text style={styles.buttonText}>Send OTP</Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Bottom Sign Up Link */}
//           <View style={styles.signupContainer}>
//             <Text style={styles.signupText}>
//               Don't have an account?{' '}
//               <Text style={styles.signupLink}>Sign Up</Text>
//             </Text>
//           </View>
//         </View>
//       </ImageBackground>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   backgroundImage: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   contentContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: 50,
//   },
//   titleText: {
//     fontSize: 42,
//     fontWeight: 'bold',
//     color: '#8B5E3C', // The specific warm brown color
//     marginBottom: 10,
//     // Use a clean sans-serif font. On Android 'sans-serif-medium' works well.
//     fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
//   },
//   subtitleText: {
//     fontSize: 18,
//     color: '#6F4E37', // A slightly darker brown for subtitle
//     fontWeight: '400',
//   },
//   inputContainer: {
//     width: '100%',
//     height: 60,
//     backgroundColor: 'rgba(255, 255, 255, 0.7)', // Slightly transparent white
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#DBC3A3', // Light warm border color
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 25,
//   },
//   textInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#6F4E37', // Input text color
//   },
//   buttonContainer: {
//     width: '100%',
//     borderRadius: 30,
//     // Shadow properties to create the glowing effect
//     shadowColor: '#D98C3A',
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.4,
//     shadowRadius: 10,
//     elevation: 10, // For Android
//   },
//   gradientButton: {
//     width: '100%',
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 30,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   signupContainer: {
//     position: 'absolute',
//     bottom: 50,
//   },
//   signupText: {
//     fontSize: 16,
//     color: '#6F4E37',
//   },
//   signupLink: {
//     fontWeight: 'bold',
//     // You can add an underline or different color here if needed
//   },
// });

// export default LoginScreen;