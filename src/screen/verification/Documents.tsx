import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, ToastAndroid, Image, StyleSheet, StatusBar, TextInput, TouchableOpacity, Text } from 'react-native';
import { RootStackParamList } from '../../types/types';
import { useVendorDocumentStore } from '../../api/hooks/document';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/color';

type DocumentType = 'aadhaar' | 'pan' | 'fssai';

const DocumentVerification = ({ navigation }: { navigation: NavigationProp<RootStackParamList> }) => {

  const { vendorId } = useAuth();
  const { document, loading, error, fetchDocument, verifyDocument } = useVendorDocumentStore();

  const [activeStep, setActiveStep] = useState<DocumentType>('aadhaar');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [panInput, setPanInput] = useState('');
  const [fassaiInput, setFassaiInput] = useState('');

  useEffect(() => {
    fetchDocument(vendorId ?? '2');
  }, [fetchDocument]);

  useEffect(() => {
    if (document?.aadhaarNumber) setAadhaarInput(document.aadhaarNumber);
    if (document?.panNumber) setPanInput(document.panNumber);
    if (document?.fassaiNumber) setFassaiInput(document.fassaiNumber);
  }, [document]);

  const documentConfig = {
    aadhaar: {
      title: 'Aadhaar Card',
      subtitle: 'Enter your 12-digit Aadhaar number',
      placeholder: '1234 5678 9012',
      maxLength: 12,
      keyboardType: 'numeric' as const,
      icon: '📇',
      image: 'https://tse3.mm.bing.net/th/id/OIP._setQBl__4Bpyi8cf4UtSQHaFI?pid=Api&P=0&h=180',
      validate: (val: string) => /^\d{12}$/.test(val),
      errorMsg: 'Please enter a valid 12-digit Aadhaar number',
    },
    pan: {
      title: 'PAN Card',
      subtitle: 'Enter your 10-character PAN number',
      placeholder: 'ABCDE1234F',
      maxLength: 10,
      keyboardType: 'default' as const,
      icon: '🪪',
      image: 'https://img.freepik.com/free-vector/id-document-personal_24877-81921.jpg',
      validate: (val: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val.toUpperCase()),
      errorMsg: 'Please enter a valid PAN (e.g., ABCDE1234F)',
    },
    fssai: {
      title: 'FSSAI License',
      subtitle: 'Enter your 14-digit FSSAI number',
      placeholder: '12345678901234',
      maxLength: 14,
      keyboardType: 'numeric' as const,
      icon: '🏪',
      image: require('../../assets/image/fassai.png'),
      validate: (val: string) => /^\d{14}$/.test(val),
      errorMsg: 'Please enter a valid 14-digit FSSAI number',
    },
  };

  const config = documentConfig[activeStep];

  const getCurrentInput = () => {
    switch (activeStep) {
      case 'aadhaar': return aadhaarInput;
      case 'pan': return panInput;
      case 'fssai': return fassaiInput;
    }
  };

  const setCurrentInput = (val: string) => {
    switch (activeStep) {
      case 'aadhaar': setAadhaarInput(val); break;
      case 'pan': setPanInput(val); break;
      case 'fssai': setFassaiInput(val); break;
    }
  };

  const isVerified = () => {
    switch (activeStep) {
      case 'aadhaar': return document?.isAadhaarVerified ?? false;
      case 'pan': return document?.isPanVerified ?? false;
      case 'fssai': return document?.isFassaiVerified ?? false;
    }
  };

  const hasDocument = () => {
    switch (activeStep) {
      case 'aadhaar': return !!document?.aadhaarNumber;
      case 'pan': return !!document?.panNumber;
      case 'fssai': return !!document?.fassaiNumber;
    }
  };

  const handleVerify = async () => {
    let input = getCurrentInput();

    if (activeStep === 'pan') {
      input = input.toUpperCase();
    }

    if (!config.validate(input)) {
      ToastAndroid.show(config.errorMsg, ToastAndroid.SHORT);
      return;
    }

    try {
      const data = {
        ...(activeStep === 'aadhaar' && { aadhaarNumber: input }),
        ...(activeStep === 'pan' && { panNumber: input }),
        ...(activeStep === 'fssai' && { fassaiNumber: input }),
      };

      await verifyDocument(data);
      ToastAndroid.show(`${config.title} verified successfully!`, ToastAndroid.SHORT);

      if (activeStep === 'aadhaar') {
        setActiveStep('pan');
      } else if (activeStep === 'pan') {
        setActiveStep('fssai');
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
      }
    } catch {
      ToastAndroid.show(error || `Failed to verify ${config.title}`, ToastAndroid.LONG);
    }
  };

  const verifiedCount =
    (document?.isAadhaarVerified ? 1 : 0) +
    (document?.isPanVerified ? 1 : 0) +
    (document?.isFassaiVerified ? 1 : 0);

  const allVerified = verifiedCount === 3;

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>✨ Document Verification</Text>
          <Text style={styles.headerSubtitle}>Complete your KYC in 3 simple steps</Text>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            {['aadhaar', 'pan', 'fssai'].map((step, index) => {
              const stepVerified =
                (step === 'aadhaar' && document?.isAadhaarVerified) ||
                (step === 'pan' && document?.isPanVerified) ||
                (step === 'fssai' && document?.isFassaiVerified);

              return (
                <View key={step} style={styles.progressStep}>
                  <View style={[
                    styles.progressDot,
                    stepVerified && styles.progressDotCompleted,
                    activeStep === step && styles.progressDotActive,
                  ]}>
                    <Text style={styles.progressDotText}>
                      {stepVerified ? '✓' : index + 1}
                    </Text>
                  </View>
                  {index < 2 && <View style={[
                    styles.progressLine,
                    stepVerified && styles.progressLineCompleted,
                  ]} />}
                </View>
              );
            })}
          </View>

          <Text style={styles.progressText}>
            {verifiedCount} of 3 documents verified
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Type Selector */}
        <View style={styles.selectorContainer}>
          {(['aadhaar', 'pan', 'fssai'] as DocumentType[]).map((step) => {
            const isActive = activeStep === step;
            const stepVerified =
              (step === 'aadhaar' && document?.isAadhaarVerified) ||
              (step === 'pan' && document?.isPanVerified) ||
              (step === 'fssai' && document?.isFassaiVerified);

            return (
              <TouchableOpacity
                key={step}
                style={[
                  styles.selectorItem,
                  isActive && styles.selectorItemActive,
                  stepVerified && styles.selectorItemVerified,
                ]}
                onPress={() => setActiveStep(step)}
              >
                <Text style={styles.selectorIcon}>{documentConfig[step].icon}</Text>
                <Text style={[
                  styles.selectorText,
                  isActive && styles.selectorTextActive,
                ]}>
                  {documentConfig[step].title}
                </Text>
                {stepVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.cardInner}>
            {/* Document Image with Decorative Background */}
            <View style={styles.imageSection}>
              <View style={styles.imageDecorationLeft} />
              <View style={styles.imageDecorationRight} />
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={typeof config.image === 'string' ? { uri: config.image } : config.image}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>{config.title}</Text>
              <Text style={styles.cardSubtitle}>{config.subtitle}</Text>
            </View>

            {/* Input Field */}
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  keyboardType={config.keyboardType}
                  value={getCurrentInput()}
                  onChangeText={setCurrentInput}
                  maxLength={config.maxLength}
                  placeholder={config.placeholder}
                  editable={!isVerified()}
                  placeholderTextColor="#a0aec0"
                  textAlign="center"
                />
                {isVerified() && (
                  <View style={styles.inputIconVerified}>
                    <Text style={styles.inputIconText}>✓</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Verify Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  (loading || (hasDocument() && isVerified())) && styles.buttonDisabled,
                ]}
                onPress={!loading && !(hasDocument() && isVerified()) ? handleVerify : undefined}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : isVerified() ? '✓ Verified Successfully' : '🔐 Verify Document'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Message */}
            {isVerified() && (
              <View style={styles.successContainer}>
                <View style={styles.successBadge}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successText}>
                    Document verified and secured
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Navigation Buttons */}
        {!allVerified && (
          <View style={styles.navButtonsContainer}>
            {activeStep !== 'aadhaar' && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => {
                  if (activeStep === 'pan') setActiveStep('aadhaar');
                  else if (activeStep === 'fssai') setActiveStep('pan');
                }}
              >
                <Text style={styles.navButtonText}>← Previous</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            {activeStep !== 'fssai' && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => {
                  if (activeStep === 'aadhaar') setActiveStep('pan');
                  else if (activeStep === 'pan') setActiveStep('fssai');
                }}
              >
                <Text style={styles.navButtonText}>Next →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Complete Button */}
        {allVerified && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] })}
          >
            <Text style={styles.completeButtonText}>
              🎉 Complete Verification & Continue
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.95,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  progressDotActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    transform: [{ scale: 1.1 }],
  },
  progressDotCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  progressDotText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressLine: {
    width: 32,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressLineCompleted: {
    backgroundColor: '#10b981',
  },
  progressText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectorItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  selectorItemActive: {
    backgroundColor: COLORS.primary,
  },
  selectorItemVerified: {
    backgroundColor: '#f0fdf4',
  },
  selectorIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10b981',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 20,
  },
  cardInner: {
    padding: 24,
  },
  imageSection: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  imageDecorationLeft: {
    position: 'absolute',
    left: -20,
    top: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    opacity: 0.5,
  },
  imageDecorationRight: {
    position: 'absolute',
    right: -20,
    bottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.highlight,
    opacity: 0.5,
  },
  imageContainer: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    padding: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  image: {
    height: 160,
    width: 220,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#718096',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#f7fafc',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  textInput: {
    fontSize: 22,
    fontWeight: '600',
    backgroundColor: '#f7fafc',
    textAlign: 'center',
    paddingVertical: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#2d3748',
  },
  inputIconVerified: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: '#10b981',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e0',
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  successIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#10b981',
  },
  successText: {
    color: '#065f46',
    fontSize: 15,
    fontWeight: '600',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 2,
  },
  navButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DocumentVerification;