import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ToastAndroid,
    ActivityIndicator,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { COLORS } from '../../theme/color';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { useVendorById } from '../../hooks/useVendorQueries';

const { height } = Dimensions.get('window');

interface SignatureUploadProps {
    navigation: NavigationProp<RootStackParamList>;
}

const SignatureUpload: React.FC<SignatureUploadProps> = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true); // State to control scroll
    const { vendorId } = useAuth();
    const { data: vendor, refetch: refetchVendor } = useVendorById();
    const signatureRef = useRef<SignatureViewRef>(null);

    const existingSignatureUrl = vendor?.signature?.url;

    const handleEmpty = () => {
        ToastAndroid.show('Please provide a signature', ToastAndroid.SHORT);
    };

    const handleClear = () => {
        signatureRef.current?.clearSignature();
    };

    const handleConfirm = () => {
        signatureRef.current?.readSignature();
    };

    // Functions to toggle scroll
    const handleBegin = () => setScrollEnabled(false);
    const handleEnd = () => setScrollEnabled(true);

    const handleOK = async (signature: string) => {
        setLoading(true);
        try {
            const formData = new FormData();

            formData.append('signature', {
                uri: signature,
                type: 'image/png',
                name: 'signature.png',
            } as any);

            if (vendor?.status !== 'APPROVED') {
                formData.append('status', 'PENDING');
            }

            const response = await api.put(`/vendor/${vendorId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                await refetchVendor();
                ToastAndroid.show('Signature submitted successfully!', ToastAndroid.SHORT);
                if (vendor?.status === 'APPROVED') {
                    navigation.goBack();
                } else {
                    navigation.reset({ index: 0, routes: [{ name: 'Outlet' }] });
                }
            } else {
                throw new Error(response.data.message || 'Submission failed');
            }
        } catch (error) {
            console.error(error);
            ToastAndroid.show('Failed to submit signature', ToastAndroid.LONG);
        } finally {
            setLoading(false);
        }
    };

    const renderExistingSignaturePreview = () => (
        <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Existing Signature</Text>
            <View style={styles.previewWrapper}>
                {existingSignatureUrl ? (
                    <Image
                        source={{ uri: existingSignatureUrl }}
                        style={styles.previewImage}
                    />
                ) : (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                )}
            </View>
        </View>
    );

    const renderSignaturePad = () => (
        <View style={styles.content}>
            <Text style={styles.mainTitle}>Digital Signature</Text>
            <Text style={styles.subTitle}>
                Your signature is required to verify your business and complete the onboarding process.
            </Text>

            {existingSignatureUrl && renderExistingSignaturePreview()}

            <View style={styles.padContainer}>
                <View style={styles.padWrapper}>
                    <SignatureScreen
                        ref={signatureRef}
                        onOK={handleOK}
                        onEmpty={handleEmpty}
                        onBegin={handleBegin} // Disable scroll when drawing starts
                        onEnd={handleEnd}     // Enable scroll when drawing ends
                        descriptionText="Sign within this box"
                        clearText="Clear"
                        confirmText="Save"
                        webStyle={webStyle}
                        autoClear={false}
                        bgHeight={350}
                    />
                </View>
                <View style={styles.padFooter}>
                    <Text style={styles.padFooterText}>
                        By signing, you agree to our{' '}
                        <Text
                            style={styles.linkText}
                            onPress={() => navigation.navigate('TermsAndConditions' as any)}
                        >
                            Terms & Conditions
                        </Text>
                        {' '}and{' '}
                        <Text
                            style={styles.linkText}
                            onPress={() => navigation.navigate('PrivacyPolicy' as any)}
                        >
                            Privacy Policy
                        </Text>.
                    </Text>
                </View>
            </View>

            <View style={styles.tipsContainer}>
                <View style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>Use your finger or a stylus for better precision.</Text>
                </View>
                <View style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>Ensure the signature matches your official documents.</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verification</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled} // Controlled by drawing state
            >
                {renderSignaturePad()}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClear} disabled={loading}>
                        <Text style={styles.clearButtonText}>Clear Pad</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledBtn]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Proceed</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const webStyle = `
  .m-signature-pad {
    box-shadow: none;
    border: none;
    background-color: transparent;
  }
  .m-signature-pad--body {
    border: none;
    background-color: transparent;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body, html {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: transparent;
  }
`;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
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
        flexGrow: 1,
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 12,
        lineHeight: 36,
    },
    subTitle: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 32,
    },
    padContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
    },
    padWrapper: {
        width: '100%',
        height: 350,
        backgroundColor: '#F8FAFC',
    },
    padFooter: {
        padding: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },
    padFooterText: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 18,
    },
    linkText: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
        fontWeight: '700',
    },
    tipsContainer: {
        marginTop: 24,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginRight: 10,
    },
    tipText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    footer: {
        padding: 24,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    clearButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '700',
    },
    submitButton: {
        flex: 2,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledBtn: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
        elevation: 0,
    },
    previewContainer: {
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    previewWrapper: {
        width: '100%',
        height: 100,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    previewImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
});

export default SignatureUpload;