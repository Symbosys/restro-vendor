import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useVendorDocumentStore } from '../../../api/hooks/document';
import { useAuth } from '../../../context/AuthContext';
import { COLORS } from '../../../theme/color';
import { AppNavigation } from '../../../types/types';

interface DocumentVisibility {
    [key: string]: boolean;
}

const MyDocuments = ({ navigation }: AppNavigation) => {
    const { vendorId } = useAuth();
    const { document, loading, fetchDocument } = useVendorDocumentStore();
    const insets = useSafeAreaInsets();
    const [visibleDocs, setVisibleDocs] = useState<DocumentVisibility>({
        aadhaar: false,
        pan: false,
        fssai: false,
    });

    useEffect(() => {
        if (vendorId) {
            fetchDocument(vendorId);
        }
    }, [vendorId, fetchDocument]);

    const headerPaddingTop = insets.top > 0 ? insets.top + 10 : 30;

    const documents = [
        {
            id: 'aadhaar',
            title: 'Aadhaar Card',
            subtitle: 'National Identity Document',
            icon: 'fingerprint',
            number: document?.aadhaarNumber || 'Not provided',
            verified: document?.isAadhaarVerified || false,
            gradientColors: ['#667eea', '#764ba2'],
            bgColor: '#F0F4FF',
            iconColor: '#667eea',
        },
        {
            id: 'pan',
            title: 'PAN Card',
            subtitle: 'Permanent Account Number',
            icon: 'account-balance-wallet',
            number: document?.panNumber || 'Not provided',
            verified: document?.isPanVerified || false,
            gradientColors: ['#f093fb', '#f5576c'],
            bgColor: '#FFF0F5',
            iconColor: '#f5576c',
        },
        {
            id: 'fssai',
            title: 'FSSAI License',
            subtitle: 'Food Safety Certificate',
            icon: 'restaurant',
            number: document?.fassaiNumber || 'Not provided',
            verified: document?.isFassaiVerified || false,
            gradientColors: ['#4facfe', '#00f2fe'],
            bgColor: '#F0FEFF',
            iconColor: '#00bcd4',
        },
    ];

    const verifiedCount = documents.filter((doc) => doc.verified).length;
    const totalDocuments = documents.length;
    const completionPercentage = Math.round((verifiedCount / totalDocuments) * 100);

    const toggleVisibility = (docId: string) => {
        setVisibleDocs((prev) => ({
            ...prev,
            [docId]: !prev[docId],
        }));
    };

    const formatDocumentNumber = (number: string, type: string, isVisible: boolean) => {
        if (number === 'Not provided') return number;

        if (isVisible) {
            // Show full number with formatting
            if (type === 'aadhaar') {
                return number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
            } else if (type === 'pan') {
                return number.toUpperCase();
            } else if (type === 'fssai') {
                return number;
            }
        } else {
            // Masked view
            if (type === 'aadhaar') {
                return `•••• •••• ${number.slice(-4)}`;
            } else if (type === 'pan') {
                return `${number.slice(0, 3)}••••••${number.slice(-1)}`;
            } else if (type === 'fssai') {
                return `••••••••••${number.slice(-4)}`;
            }
        }
        return number;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.primary}
                translucent={true}
            />

            {/* Premium Header with Gradient Effect */}
            <View style={[styles.headerContainer, { paddingTop: headerPaddingTop }]}>
                <View style={styles.headerGradientOverlay} />
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>My Documents</Text>
                        <Text style={styles.headerSubtitle}>Secure & Verified</Text>
                    </View>
                    <View style={styles.headerBadge}>
                        <Icon name="verified-user" size={20} color="#FFF" />
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Premium Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statsCardHeader}>
                        <View style={styles.statsIconWrapper}>
                            <View style={styles.statsIconGradient}>
                                <Icon name="shield" size={28} color="#FFF" />
                            </View>
                        </View>
                        <View style={styles.statsContent}>
                            <Text style={styles.statsTitle}>Verification Status</Text>
                            <Text style={styles.statsSubtitle}>
                                {verifiedCount} of {totalDocuments} documents verified
                            </Text>
                        </View>
                        <View style={styles.statsPercentage}>
                            <Text style={styles.statsPercentageText}>{completionPercentage}%</Text>
                        </View>
                    </View>

                    {/* Elegant Progress Bar */}
                    <View style={styles.progressWrapper}>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${completionPercentage}%` },
                                ]}
                            >
                                <View style={styles.progressShimmer} />
                            </View>
                        </View>
                    </View>

                    {/* Status Indicator */}
                    {verifiedCount === totalDocuments ? (
                        <View style={styles.successIndicator}>
                            <View style={styles.successIconWrapper}>
                                <Icon name="check-circle" size={18} color="#10B981" />
                            </View>
                            <Text style={styles.successText}>All documents verified successfully</Text>
                        </View>
                    ) : (
                        <View style={styles.warningIndicator}>
                            <View style={styles.warningIconWrapper}>
                                <Icon name="schedule" size={18} color="#F59E0B" />
                            </View>
                            <Text style={styles.warningText}>
                                {totalDocuments - verifiedCount} document(s) pending verification
                            </Text>
                        </View>
                    )}
                </View>

                {/* Documents Section */}
                <View style={styles.documentsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>IDENTITY DOCUMENTS</Text>
                        <View style={styles.securityBadge}>
                            <Icon name="lock" size={12} color="#64748B" />
                            <Text style={styles.securityText}>Encrypted</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Loading your documents...</Text>
                        </View>
                    ) : (
                        <View style={styles.documentsGrid}>
                            {documents.map((doc, index) => (
                                <View key={doc.id} style={styles.documentCard}>
                                    {/* Card Background Gradient Effect */}
                                    <View
                                        style={[
                                            styles.cardGradient,
                                            { backgroundColor: doc.bgColor },
                                        ]}
                                    />

                                    {/* Card Header */}
                                    <View style={styles.cardHeader}>
                                        <View
                                            style={[
                                                styles.cardIconContainer,
                                                { backgroundColor: doc.bgColor },
                                            ]}
                                        >
                                            <Icon name={doc.icon} size={32} color={doc.iconColor} />
                                        </View>
                                        <View
                                            style={[
                                                styles.verificationBadge,
                                                doc.verified
                                                    ? styles.verificationBadgeVerified
                                                    : styles.verificationBadgePending,
                                            ]}
                                        >
                                            <Icon
                                                name={doc.verified ? 'verified' : 'pending'}
                                                size={14}
                                                color={doc.verified ? '#10B981' : '#F59E0B'}
                                            />
                                        </View>
                                    </View>

                                    {/* Card Content */}
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{doc.title}</Text>
                                        <Text style={styles.cardSubtitle}>{doc.subtitle}</Text>

                                        {/* Document Number */}
                                        <View style={styles.documentNumberContainer}>
                                            <View style={styles.documentNumberWrapper}>
                                                <Icon name="tag" size={16} color="#94A3B8" />
                                                <Text
                                                    style={[
                                                        styles.documentNumber,
                                                        visibleDocs[doc.id] && styles.documentNumberVisible,
                                                    ]}
                                                >
                                                    {formatDocumentNumber(
                                                        doc.number,
                                                        doc.id,
                                                        visibleDocs[doc.id]
                                                    )}
                                                </Text>
                                            </View>
                                            {doc.number !== 'Not provided' && (
                                                <TouchableOpacity
                                                    onPress={() => toggleVisibility(doc.id)}
                                                    style={styles.visibilityButton}
                                                    activeOpacity={0.7}
                                                >
                                                    <Icon
                                                        name={visibleDocs[doc.id] ? 'visibility-off' : 'visibility'}
                                                        size={18}
                                                        color={COLORS.primary}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {/* Status Footer */}
                                        <View style={styles.cardFooter}>
                                            {doc.verified ? (
                                                <View style={styles.statusRow}>
                                                    <Icon name="check-circle" size={14} color="#10B981" />
                                                    <Text style={styles.statusTextVerified}>Verified</Text>
                                                </View>
                                            ) : doc.number !== 'Not provided' ? (
                                                <View style={styles.statusRow}>
                                                    <Icon name="schedule" size={14} color="#F59E0B" />
                                                    <Text style={styles.statusTextPending}>Under Review</Text>
                                                </View>
                                            ) : (
                                                <View style={styles.statusRow}>
                                                    <Icon name="error-outline" size={14} color="#EF4444" />
                                                    <Text style={styles.statusTextMissing}>Not Submitted</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                    <View style={styles.securityNoticeHeader}>
                        <View style={styles.securityNoticeIcon}>
                            <Icon name="security" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.securityNoticeTitle}>Security & Privacy</Text>
                    </View>
                    <View style={styles.securityNoticeContent}>
                        <View style={styles.securityItem}>
                            <View style={styles.securityDot} />
                            <Text style={styles.securityItemText}>
                                All documents are encrypted with industry-standard AES-256
                            </Text>
                        </View>
                        <View style={styles.securityItem}>
                            <View style={styles.securityDot} />
                            <Text style={styles.securityItemText}>
                                Verification typically completes within 24-48 hours
                            </Text>
                        </View>
                        <View style={styles.securityItem}>
                            <View style={styles.securityDot} />
                            <Text style={styles.securityItemText}>
                                Your data is never shared without explicit consent
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFB',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    // Premium Header
    headerContainer: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    headerGradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTextContainer: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: 2,
        fontWeight: '500',
    },
    headerBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    // Premium Stats Card
    statsCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.04)',
    },
    statsCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statsIconWrapper: {
        marginRight: 16,
    },
    statsIconGradient: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    statsContent: {
        flex: 1,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: 0.2,
    },
    statsSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '500',
    },
    statsPercentage: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    statsPercentageText: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },
    // Elegant Progress Bar
    progressWrapper: {
        marginBottom: 20,
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    progressShimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    // Status Indicators
    successIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    successIconWrapper: {
        marginRight: 10,
    },
    successText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#047857',
        flex: 1,
    },
    warningIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    warningIconWrapper: {
        marginRight: 10,
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#B45309',
        flex: 1,
    },
    // Documents Section
    documentsSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    securityText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
    },
    loadingContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingVertical: 64,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#64748B',
        fontWeight: '500',
    },
    // Premium Document Cards
    documentsGrid: {
        gap: 16,
    },
    documentCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.04)',
    },
    cardGradient: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.15,
        transform: [{ translateX: 40 }, { translateY: -40 }],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    verificationBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    verificationBadgeVerified: {
        backgroundColor: '#ECFDF5',
    },
    verificationBadgePending: {
        backgroundColor: '#FFFBEB',
    },
    cardContent: {
        gap: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: 0.2,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    documentNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    documentNumberWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    documentNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    },
    documentNumberVisible: {
        color: '#0F172A',
    },
    visibilityButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    cardFooter: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusTextVerified: {
        fontSize: 13,
        fontWeight: '700',
        color: '#047857',
    },
    statusTextPending: {
        fontSize: 13,
        fontWeight: '700',
        color: '#B45309',
    },
    statusTextMissing: {
        fontSize: 13,
        fontWeight: '700',
        color: '#DC2626',
    },
    // Security Notice
    securityNotice: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.04)',
    },
    securityNoticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    securityNoticeIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    securityNoticeTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    securityNoticeContent: {
        gap: 12,
    },
    securityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    securityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginTop: 6,
    },
    securityItemText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        fontWeight: '500',
    },
});

export default MyDocuments;
