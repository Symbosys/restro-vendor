import React, { useState, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../theme/color";
import { AppNavigation } from "../../types/types";


const { width: screenWidth } = Dimensions.get("window");

const PRIMARY_COLOR = COLORS.primary;
const ACCENT_COLOR = COLORS.accent;
const BODY_TEXT = COLORS.textSecondary;
const WHITE_30 = "rgba(255, 255, 255, 0.3)";
const WHITE_80 = "rgba(255, 255, 255, 0.8)";
const GRAY_200_80 = "rgba(229, 231, 235, 0.8)";
const BODY_TEXT_80 = "rgba(74, 74, 74, 0.8)";
const BODY_TEXT_60 = "rgba(74, 74, 74, 0.6)";
const BODY_TEXT_50 = "rgba(74, 74, 74, 0.5)";

const PrivacyPolicy = ({ navigation }: AppNavigation) => {
    const [headerHeight, setHeaderHeight] = useState(72);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const scrollY = contentOffset.y;
        const height = contentSize.height - layoutMeasurement.height;
        const calculatedProgress = height > 0 ? Math.min(scrollY / height, 1) : 1;
        setProgress(calculatedProgress);
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View
                style={styles.header}
                onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
            >
                <View
                    style={[styles.headerGradient]}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Privacy Policy</Text>
                        <View style={styles.headerButton} />
                    </View>
                </View>
            </View>

            {/* Progress Bar */}
            <View
                style={[
                    styles.progressBar,
                    { top: headerHeight },
                ]}
            >
                <View
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
            </View>

            {/* Main Content */}
            <ScrollView
                ref={scrollRef}
                style={[styles.main, { marginTop: headerHeight }]}
                contentContainerStyle={styles.mainContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Sub-header */}
                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderText}>
                        Minta Club Private Limited (Brand: Minta Fresh)
                    </Text>
                    <Text style={styles.lastUpdated}>Last Updated: 5/2/2026</Text>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Introduction */}
                    <View style={styles.section}>
                        <Text style={styles.sectionText}>
                            Minta Club Private Limited (“Company”, “we”, “our”, or “us”) operates the brand Minta Fresh, an online platform that enables customers to order raw chicken, fish, and goat meat for home delivery (“Services”).
                        </Text>
                        <Text style={styles.sectionText}>
                            We are committed to protecting your privacy and ensuring transparency in how your personal data is collected, used, stored, and shared in compliance with applicable Indian laws and Google Play policies.
                        </Text>
                    </View>

                    {/* 1. Scope of This Policy */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>1. Scope of This Policy</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            This Privacy Policy applies to:
                        </Text>
                        <Text style={styles.sectionText}>• The Minta Fresh mobile application</Text>
                        <Text style={styles.sectionText}>• Our website and related services</Text>
                        <Text style={styles.sectionText}>• Customers, delivery partners, and business partners</Text>
                        <Text style={styles.sectionText}>
                            By using our Services, you agree to the collection and use of information in accordance with this Policy.
                        </Text>
                    </View>

                    {/* 2. Information We Collect */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="storage" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                        </View>

                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 8 }]}>
                            2.1 Personal Information
                        </Text>
                        <Text style={styles.sectionText}>We may collect:</Text>
                        <Text style={styles.sectionText}>• Name</Text>
                        <Text style={styles.sectionText}>• Mobile number</Text>
                        <Text style={styles.sectionText}>• Email address</Text>
                        <Text style={styles.sectionText}>• Delivery address</Text>
                        <Text style={styles.sectionText}>• Order details (products, quantity, price)</Text>

                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            2.2 Payment Information
                        </Text>
                        <Text style={styles.sectionText}>• We do not store credit/debit card details, UPI IDs, or net banking credentials.</Text>
                        <Text style={styles.sectionText}>• All customer payments are processed through a third-party payment gateway.</Text>

                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            2.3 Device & Usage Information
                        </Text>
                        <Text style={styles.sectionText}>• Device type</Text>
                        <Text style={styles.sectionText}>• Operating system</Text>
                        <Text style={styles.sectionText}>• App version</Text>
                        <Text style={styles.sectionText}>• IP address (for security and fraud prevention)</Text>
                        <Text style={styles.sectionText}>• Crash logs and performance data</Text>
                    </View>

                    {/* 3. Payment Gateway Disclosure */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>3. Payment Gateway Disclosure</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Payments for food orders placed on Minta Fresh are processed securely through PhonePe, a PCI-DSS compliant third-party payment gateway.
                        </Text>
                        <Text style={styles.sectionText}>• Minta Fresh does not hold, store, or control customer payment instruments</Text>
                        <Text style={styles.sectionText}>• Payment data is handled directly by the payment gateway as per their privacy and security standards</Text>
                        <Text style={styles.sectionText}>• Payments are accepted only for the purchase of food and delivery services</Text>
                    </View>

                    {/* 4. Wallet & Refund Clarification */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="account-balance-wallet" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>4. Wallet & Refund Clarification</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Any wallet or balance shown within the app (if applicable) is:
                        </Text>
                        <Text style={styles.sectionText}>• A closed-system adjustment ledger</Text>
                        <Text style={styles.sectionText}>• Used only for refunds, order adjustments, or promotional credits</Text>
                        <Text style={styles.sectionText}>• Not withdrawable</Text>
                        <Text style={styles.sectionText}>• Not transferable</Text>
                        <Text style={styles.sectionText}>• Not a stored-value or financial product</Text>
                    </View>

                    {/* 5. Payout Processor Disclosure */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="people" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>5. Payout Processor Disclosure (Partners & Vendors)</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Settlements to partner vendors and delivery partners are processed through Razor pay/unpay Api Payouts (or bank transfer mechanisms provided by regulated payment service providers).
                        </Text>
                        <Text style={styles.sectionText}>• Payouts represent service fees payable for completed deliveries or fulfilled orders</Text>
                        <Text style={styles.sectionText}>• The Company does not offer any interest, investment, or earning schemes</Text>
                        <Text style={styles.sectionText}>• Payouts are backend operational settlements and not a user-facing financial service</Text>
                        <Text style={styles.sectionText}>
                            • The app includes payment functionality for food orders only. Any wallet shown is used solely for internal order adjustments or refunds and is not withdrawable. Payouts to partners are backend operational settlements and are not user-facing features.
                        </Text>
                    </View>

                    {/* 6. How We Use Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="settings" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>6. How We Use Information</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We use collected information to:
                        </Text>
                        <Text style={styles.sectionText}>• Process and deliver food orders</Text>
                        <Text style={styles.sectionText}>• Facilitate payments and refunds</Text>
                        <Text style={styles.sectionText}>• Settle partner payouts</Text>
                        <Text style={styles.sectionText}>• Provide customer support</Text>
                        <Text style={styles.sectionText}>• Improve app performance and user experience</Text>
                        <Text style={styles.sectionText}>• Comply with legal and regulatory obligations</Text>
                    </View>

                    {/* 7. Data Sharing & Disclosure */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="share" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>7. Data Sharing & Disclosure (Limited)</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We share user data only on a need-to-know basis, strictly limited to:
                        </Text>

                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 12 }]}>
                            7.1 Payment & Payout Partners
                        </Text>
                        <Text style={styles.sectionText}>• Order amount</Text>
                        <Text style={styles.sectionText}>• Transaction reference</Text>
                        <Text style={styles.sectionText}>• Contact details (where required for payment processing)</Text>

                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 12 }]}>
                            7.2 Delivery Partners
                        </Text>
                        <Text style={styles.sectionText}>• Customer name</Text>
                        <Text style={styles.sectionText}>• Delivery address</Text>
                        <Text style={styles.sectionText}>• Contact number (only for order fulfilment)</Text>

                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 12 }]}>
                            7.3 Google Play Services
                        </Text>
                        <Text style={styles.sectionText}>
                            Limited technical and usage data may be shared with Google Play Console, including:
                        </Text>
                        <Text style={styles.sectionText}>• App performance metrics</Text>
                        <Text style={styles.sectionText}>• Crash reports</Text>
                        <Text style={styles.sectionText}>• Device and OS information</Text>
                        <Text style={styles.sectionText}>
                            This data is used solely for app stability, security, and policy compliance.
                        </Text>
                    </View>

                    {/* 8. What We Do NOT Do */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="block" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>8. What We Do NOT Do</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            To avoid any ambiguity:
                        </Text>
                        <Text style={styles.sectionText}>❌ We do not offer financial services</Text>
                        <Text style={styles.sectionText}>❌ We do not provide gambling, betting, or gaming features</Text>
                        <Text style={styles.sectionText}>❌ We do not offer earning, investment, or reward-based monetary programs</Text>
                        <Text style={styles.sectionText}>❌ We do not sell personal data to third parties</Text>
                    </View>

                    {/* 9. Data Retention & Security */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="security" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>9. Data Retention & Security</Text>
                        </View>
                        <Text style={styles.sectionText}>• Data is retained only as long as necessary to provide services or comply with legal requirements</Text>
                        <Text style={styles.sectionText}>• We implement reasonable technical and organizational safeguards to protect user data</Text>
                        <Text style={styles.sectionText}>• Access to data is restricted to authorized personnel only</Text>
                    </View>

                    {/* 10. User Rights */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="person" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>10. User Rights</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Users may:
                        </Text>
                        <Text style={styles.sectionText}>• Request access to their personal data</Text>
                        <Text style={styles.sectionText}>• Request correction or deletion (subject to legal obligations)</Text>
                        <Text style={styles.sectionText}>• Withdraw consent for non-essential communications</Text>
                        <Text style={styles.sectionText}>
                            Requests can be sent to the contact details below.
                        </Text>
                    </View>

                    {/* 11. Children’s Privacy */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="child-care" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>11. Children’s Privacy</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal data from minors.
                        </Text>
                    </View>

                    {/* 12. Changes to This Policy */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="update" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>12. Changes to This Policy</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We may update this Privacy Policy from time to time. Updates will be posted within the app or on our website with a revised “Last Updated” date.
                        </Text>
                    </View>

                    {/* 13. Contact Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="contact-support" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>13. Contact Information</Text>
                        </View>
                        <Text style={styles.sectionText}>Minta Club Private Limited</Text>
                        <Text style={styles.sectionText}>Brand: Minta Fresh</Text>
                        <Text style={styles.sectionText}>Email: support@mintafresh.com</Text>
                        <Text style={styles.sectionText}>
                            Registered Office: Road No.- 1B Basant Vihar, Harmu Housing Colony, Ranchi- 834002, Jharkhand
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    },
    // Header
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    headerGradient: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: COLORS.primary,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.white,
        flex: 1,
        textAlign: "center",
    },
    // Progress Bar
    progressBar: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: WHITE_30,
        zIndex: 10,
    },
    progressFill: {
        height: "100%",
        backgroundColor: COLORS.primary,
    },
    // Main
    main: {
        flex: 1,
        marginTop: 72, // Approximate header height
    },
    mainContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    // Sub-header
    subHeader: {
        paddingVertical: 24,
        alignItems: "center",
    },
    subHeaderText: {
        fontSize: 16,
        color: BODY_TEXT_80,
        textAlign: "center",
    },
    lastUpdated: {
        fontSize: 14,
        color: BODY_TEXT_60,
        textAlign: "center",
        marginTop: 8,
    },
    // Content Card
    contentCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        elevation: 5,
        gap: 24,
    },
    section: {
        gap: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: PRIMARY_COLOR,
    },
    sectionText: {
        fontSize: 16,
        color: BODY_TEXT,
        lineHeight: 28,
    },
});

export default PrivacyPolicy;