import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useVendorById } from '../../../hooks/useVendorQueries';
import { COLORS } from '../../../theme/color';
import { AppNavigation } from '../../../types/types';

const DetailRow = ({ icon, label, value, isLink = false, onPress }: { icon: string, label: string, value: string | undefined | null, isLink?: boolean, onPress?: () => void }) => {
    if (!value) return null;
    return (
        <TouchableOpacity
            style={styles.detailRow}
            activeOpacity={isLink ? 0.7 : 1}
            onPress={isLink ? onPress : undefined}
            disabled={!isLink}
        >
            <View style={styles.detailIconContainer}>
                <Icon name={icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={[styles.detailValue, isLink && styles.linkText]}>{value}</Text>
            </View>
            {isLink && <Icon name="chevron-right" size={20} color="#9CA3AF" />}
        </TouchableOpacity>
    );
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const MyShopDetails = ({ navigation }: AppNavigation) => {
    const { data: vendor, isLoading } = useVendorById();
    const insets = useSafeAreaInsets();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading Shop Profile...</Text>
            </View>
        );
    }

    if (!vendor) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>No Shop Details Found</Text>
            </View>
        );
    }

    const openMap = () => {
        const fullAddress = `${vendor.mainAddress}, ${vendor.city}, ${vendor.state}`;
        const url = Platform.select({
            ios: `maps:0,0?q=${fullAddress}`,
            android: `geo:0,0?q=${fullAddress}`,
        });
        if (url) Linking.openURL(url);
    };

    const callNumber = () => {
        Linking.openURL(`tel:${vendor.mobile}`);
    };

    const mailTo = () => {
        Linking.openURL(`mailto:${vendor.email}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                bounces={false}
            >
                {/* --- Hero Image Section --- */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: vendor.images?.url || 'https://via.placeholder.com/400' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.gradientOverlay} />

                    {/* Header Controls */}
                    <View style={[styles.headerControls, { marginTop: insets.top + 10 }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Shop Title Block */}
                    <View style={styles.titleBlock}>
                        <View style={styles.statusRow}>
                            {vendor.isOpen ? (
                                <View style={[styles.badge, styles.badgeOpen]}>
                                    <View style={styles.dotOpen} />
                                    <Text style={styles.badgeTextOpen}>OPEN NOW</Text>
                                </View>
                            ) : (
                                <View style={[styles.badge, styles.badgeClosed]}>
                                    <View style={styles.dotClosed} />
                                    <Text style={styles.badgeTextClosed}>CLOSED</Text>
                                </View>
                            )}

                            <View style={[styles.badge, styles.badgeStatus, { backgroundColor: vendor.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
                                <Text style={[styles.badgeTextStatus, { color: vendor.status === 'APPROVED' ? '#10B981' : '#F59E0B' }]}>
                                    {vendor.status}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.shopName} numberOfLines={2}>{vendor.shopName}</Text>
                        <Text style={styles.shopCity}>
                            Vendor ID: #{vendor.id}
                        </Text>
                    </View>
                </View>

                {/* --- Content Body --- */}
                <View style={styles.bodyContainer}>

                    {/* Important Failure Notices */}
                    {(vendor.rejectReason || vendor.blockReason) && (
                        <View style={[styles.card, styles.warningCard]}>
                            <View style={styles.warningHeader}>
                                <Icon name="warning" size={20} color="#B45309" />
                                <Text style={styles.warningTitle}>Action Required</Text>
                            </View>
                            {vendor.rejectReason && (
                                <View style={styles.reasonRow}>
                                    <Text style={styles.reasonLabel}>Rejection Reason:</Text>
                                    <Text style={styles.reasonText}>{vendor.rejectReason}</Text>
                                </View>
                            )}
                            {vendor.blockReason && (
                                <View style={styles.reasonRow}>
                                    <Text style={styles.reasonLabel}>Block Reason:</Text>
                                    <Text style={styles.reasonText}>{vendor.blockReason}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* 1. Basic Info Card */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>BUSINESS PROFILE</Text>

                        <View style={styles.profileHeader}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {vendor.ownerName?.substring(0, 2).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.profileTexts}>
                                <Text style={styles.ownerName}>{vendor.ownerName}</Text>
                                <Text style={styles.companyName}>{vendor.companyName}</Text>

                                {/* Registration Dates */}
                                <View style={styles.dateRow}>
                                    <Icon name="event" size={12} color="#6B7280" />
                                    <Text style={styles.dateText}>Joined {formatDate(vendor.createdAt)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Icon name="phone" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Mobile Number</Text>
                                <Text style={styles.detailValue}>{vendor.mobile}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Icon name="email" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Email Address</Text>
                                <Text style={styles.detailValue}>{vendor.email}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Icon name="call" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Contact Number</Text>
                                <Text style={styles.detailValue}>{vendor.contactNumber}</Text>
                            </View>
                        </View>
                    </View>

                    {/* 2. Location Details Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <Text style={styles.sectionTitle}>LOCATION DETAILS</Text>
                            <TouchableOpacity onPress={openMap}>
                                <Text style={styles.actionText}>View on Map</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.addressBox}>
                            <View style={styles.addressRow}>
                                <Icon name="store" size={20} color="#6B7280" style={{ marginTop: 2 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.addressLabel}>Complete Address</Text>
                                    <Text style={styles.addressText}>{vendor.completeAddress}</Text>
                                </View>
                            </View>

                            <View style={styles.dividerSmall} />

                            <View style={styles.addressRow}>
                                <Icon name="map" size={20} color="#6B7280" style={{ marginTop: 2 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.addressLabel}>Main Address</Text>
                                    <Text style={styles.addressText}>
                                        {vendor.mainAddress}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.gridContainer}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>City</Text>
                                    <Text style={styles.gridValue}>{vendor.city}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>State</Text>
                                    <Text style={styles.gridValue}>{vendor.state}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>Pincode</Text>
                                    <Text style={styles.gridValue}>{vendor.pincode}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>Country</Text>
                                    <Text style={styles.gridValue}>{vendor.country}</Text>
                                </View>
                                {vendor.floor ? (
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>Floor</Text>
                                        <Text style={styles.gridValue}>{vendor.floor}</Text>
                                    </View>
                                ) : null}
                            </View>

                        </View>
                    </View>

                    {/* 3. Status & Signature Card */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>VERIFICATION & STATUS</Text>

                        <View style={styles.verificationRow}>
                            <View style={styles.verificationItem}>
                                <Text style={styles.verificationLabel}>Account Status</Text>
                                <View style={[styles.verifiedBadge, { backgroundColor: vendor.isActive ? '#ECFDF5' : '#FEF2F2', borderColor: vendor.isActive ? '#D1FAE5' : '#FECACA' }]}>
                                    <Icon name={vendor.isActive ? "check-circle" : "cancel"} size={16} color={vendor.isActive ? "#059669" : "#DC2626"} />
                                    <Text style={[styles.verifiedText, { color: vendor.isActive ? "#059669" : "#DC2626" }]}>
                                        {vendor.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.verificationItem}>
                                <Text style={styles.verificationLabel}>Approval</Text>
                                <View style={[styles.verifiedBadge, { backgroundColor: vendor.isApproved ? '#ECFDF5' : '#FFFBEB', borderColor: vendor.isApproved ? '#D1FAE5' : '#FEF3C7' }]}>
                                    <Icon name={vendor.isApproved ? "verified" : "pending"} size={16} color={vendor.isApproved ? "#059669" : "#D97706"} />
                                    <Text style={[styles.verifiedText, { color: vendor.isApproved ? "#059669" : "#D97706" }]}>
                                        {vendor.isApproved ? 'Approved' : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* System Info */}
                        <View style={styles.systemInfoContainer}>
                            <View style={styles.systemRow}>
                                <Text style={styles.systemLabel}>Last Updated:</Text>
                                <Text style={styles.systemValue}>{formatDate(vendor.updatedAt)}</Text>
                            </View>
                        </View>

                        {/* Signature */}
                        {vendor.signature?.url && (
                            <View style={styles.signatureContainer}>
                                <Text style={styles.signatureLabel}>Authorized Signature</Text>
                                <View style={styles.signatureBox}>
                                    <Image
                                        source={{ uri: vendor.signature.url }}
                                        style={styles.signatureImage}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.watermark}>
                                        <Text style={styles.watermarkText}>DIGITALLY SIGNED</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '500',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
    },
    heroContainer: {
        width: '100%',
        height: 340,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    headerControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    titleBlock: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
    },
    shopName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    shopCity: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badgeOpen: {
        backgroundColor: 'rgba(5, 150, 105, 0.9)',
    },
    badgeClosed: {
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
    },
    badgeStatus: {
        // backgroundColor handled inline
    },
    badgeTextOpen: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    badgeTextClosed: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    badgeTextStatus: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dotOpen: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#34D399',
    },
    dotClosed: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FCA5A5',
    },

    // Body Styles
    bodyContainer: {
        marginTop: -32,
        paddingHorizontal: 16,
        gap: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    warningCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FCD34D',
        borderWidth: 1,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B45309',
    },
    reasonRow: {
        marginTop: 4,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#92400E',
    },
    reasonText: {
        fontSize: 13,
        color: '#92400E',
        marginTop: 2,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 1.5,
        marginBottom: 20,
    },

    // Profile Card
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 16,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    profileTexts: {
        flex: 1,
    },
    ownerName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
        marginBottom: 6,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '600',
    },
    linkText: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },


    // Address Card
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
    addressBox: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 8,
    },
    addressLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '700',
        marginBottom: 2,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
        fontWeight: '500',
    },
    dividerSmall: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 8,
    },
    gridItem: {
        minWidth: '45%',
    },
    gridLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '700',
        marginBottom: 2,
    },
    gridValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },

    // Verification
    verificationRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
    },
    verificationItem: {
        flex: 1,
    },
    verificationLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '500',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    verifiedText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#059669',
    },
    systemInfoContainer: {
        marginBottom: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    systemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    systemLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    systemValue: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    signatureContainer: {
        marginTop: 8,
    },
    signatureLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
        fontWeight: '500',
    },
    signatureBox: {
        height: 120,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    signatureImage: {
        width: '90%',
        height: '90%',
        opacity: 0.9,
    },
    watermark: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        opacity: 0.5,
    },
    watermarkText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#D1D5DB',
        letterSpacing: 1,
    },
});

export default MyShopDetails;