import { useRef, useState } from "react";
import {
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

const TermsAndConditions = ({ navigation }: AppNavigation) => {
    const [headerHeight, setHeaderHeight] = useState(72);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

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

    const handleAcceptPress = () => {
        // Handle accept and continue
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View
                style={styles.header}
                onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
            >
                <View
                    style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Terms & Conditions</Text>
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
                        Minta Club Private Limited (Brand Name: Minta Fresh)
                    </Text>
                    <Text style={styles.lastUpdated}>Last Updated: 50/02/2026</Text>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* 1. About Us */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>1. About Us</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Minta Club Private Limited (“Company”, “we”, “our”, “us”) is a company incorporated under the Companies Act, 2013, India.
                        </Text>
                        <Text style={styles.sectionText}>
                            Minta Fresh is a brand owned and operated by Minta Club Private Limited.
                        </Text>
                        <Text style={styles.sectionText}>
                            Minta Fresh operates an online platform for the sale and delivery of raw food products, including raw chicken, raw fish, and raw goat meat, sourced from authorized vendors and delivered to customers.
                        </Text>
                    </View>

                    {/* 2. Nature of Services */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>2. Nature of Services (Important Disclosure)</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Minta Fresh is strictly a food ordering and delivery platform.
                        </Text>
                        <Text style={styles.sectionText}>• We enable customers to place orders for raw meat and fish products</Text>
                        <Text style={styles.sectionText}>• We coordinate packaging and delivery of these products</Text>
                        <Text style={styles.sectionText}>• We do not provide cooked food, ready-to-eat meals, or restaurant dining services</Text>
                        <Text style={styles.sectionText}>
                            This app is not a financial service, investment platform, gaming app, or reward-based application.
                        </Text>
                    </View>

                    {/* 3. Eligibility to Use the App */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="person" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>3. Eligibility to Use the App</Text>
                        </View>
                        <Text style={styles.sectionText}>You must be:</Text>
                        <Text style={styles.sectionText}>• At least 18 years old</Text>
                        <Text style={styles.sectionText}>• Legally capable of entering into a binding contract under Indian law</Text>
                        <Text style={styles.sectionText}>
                            By using the app, you confirm that you meet these requirements.
                        </Text>
                    </View>

                    {/* 4. Orders & Product Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local_shipping" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>4. Orders & Product Information</Text>
                        </View>
                        <Text style={styles.sectionText}>• All products sold are raw and perishable</Text>
                        <Text style={styles.sectionText}>• Product images are representative and actual appearance may vary</Text>
                        <Text style={styles.sectionText}>• Weight may vary slightly due to natural processing of raw meat</Text>
                        <Text style={styles.sectionText}>• Products must be cooked thoroughly before consumption</Text>
                    </View>

                    {/* 5. Pricing & Payments */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>5. Pricing & Payments</Text>
                        </View>
                        <Text style={styles.sectionText}>• Prices displayed are inclusive of applicable taxes unless stated otherwise</Text>
                        <Text style={styles.sectionText}>• Payments are accepted only for purchasing food and delivery services</Text>
                        <Text style={styles.sectionText}>• Payments are processed via third-party payment gateways</Text>
                        <Text style={styles.sectionText}>• The Company does not store customer card or bank details</Text>
                    </View>

                    {/* 6. No Financial Services Declaration */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>6. No Financial Services Declaration (Critical)</Text>
                        </View>
                        <Text style={styles.sectionText}>Minta Fresh does NOT:</Text>
                        <Text style={styles.sectionText}>• Offer banking services</Text>
                        <Text style={styles.sectionText}>• Offer wallets with withdrawable balance</Text>
                        <Text style={styles.sectionText}>• Offer stored-value accounts</Text>
                        <Text style={styles.sectionText}>• Provide loans, credit, investments, or interest-bearing products</Text>
                        <Text style={styles.sectionText}>• Provide any form of financial advisory service</Text>
                        <Text style={styles.sectionText}>
                            Any payment functionality exists solely to complete food purchase transactions.
                        </Text>
                    </View>

                    {/* 7. Wallet / Credits */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="account-balance-wallet" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>7. Wallet / Credits (If Applicable)</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            If an in-app wallet or credit balance is shown:
                        </Text>
                        <Text style={styles.sectionText}>• It is a closed-system adjustment mechanism</Text>
                        <Text style={styles.sectionText}>• Used only for:</Text>
                        <Text style={styles.sectionText}>  • Refunds</Text>
                        <Text style={styles.sectionText}>  • Order adjustments</Text>
                        <Text style={styles.sectionText}>  • Promotional price corrections</Text>
                        <Text style={styles.sectionText}>• Wallet balance cannot be withdrawn as cash</Text>
                        <Text style={styles.sectionText}>• Wallet balance cannot be transferred to other users</Text>
                        <Text style={styles.sectionText}>• Wallet balance cannot be used outside the Minta Fresh platform</Text>
                    </View>

                    {/* 8. No Rewards, Earnings, or Incentives */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="star" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>8. No Rewards, Earnings, or Incentives</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Minta Fresh does NOT operate any reward, earning, or cash-based incentive program.
                        </Text>
                        <Text style={styles.sectionText}>Specifically:</Text>
                        <Text style={styles.sectionText}>• No “earn money” features</Text>
                        <Text style={styles.sectionText}>• No betting, gaming, or chance-based rewards</Text>
                        <Text style={styles.sectionText}>• No monetary rewards for app usage</Text>
                        <Text style={styles.sectionText}>• No investment or income opportunities</Text>
                        <Text style={styles.sectionText}>
                            Any discounts or promotions (if offered) are price reductions only, not monetary rewards.
                        </Text>
                    </View>

                    {/* 9. Delivery & Acceptance */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local_shipping" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>9. Delivery & Acceptance</Text>
                        </View>
                        <Text style={styles.sectionText}>• Delivery timelines are estimates</Text>
                        <Text style={styles.sectionText}>• Customers must inspect products at the time of delivery</Text>
                        <Text style={styles.sectionText}>• Issues must be reported immediately upon delivery</Text>
                        <Text style={styles.sectionText}>
                            Once accepted, the order is considered delivered in good condition.
                        </Text>
                    </View>

                    {/* 10. Refunds & Cancellations */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="undo" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>10. Refunds & Cancellations</Text>
                        </View>
                        <Text style={styles.sectionText}>• Due to the perishable nature of raw meat and fish, cancellations may be restricted</Text>
                        <Text style={styles.sectionText}>• Refunds, if applicable, are processed:</Text>
                        <Text style={styles.sectionText}>• To the original payment method OR</Text>
                        <Text style={styles.sectionText}>• As non-withdrawable adjustment credits within the app</Text>
                        <Text style={styles.sectionText}>
                            • The app includes payment functionality for food orders only. Any wallet shown is used solely for internal order adjustments or refunds and is not withdrawable. Payouts to partners are backend operational settlements and are not user-facing features.
                        </Text>
                        <Text style={styles.sectionText}>• Refund eligibility is determined at the Company’s discretion.</Text>
                    </View>

                    {/* 11. Partner & Vendor Settlements */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="people" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>11. Partner & Vendor Settlements</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Payments to vendors, delivery partners, or service providers are handled through backend settlement processes and are not customer-facing features.
                        </Text>
                        <Text style={styles.sectionText}>
                            Customers do not participate in or access partner payout systems.
                        </Text>
                    </View>

                    {/* 12. Prohibited Use */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="block" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>12. Prohibited Use</Text>
                        </View>
                        <Text style={styles.sectionText}>Users agree not to:</Text>
                        <Text style={styles.sectionText}>• Misuse payment features</Text>
                        <Text style={styles.sectionText}>• Attempt unauthorized withdrawals</Text>
                        <Text style={styles.sectionText}>• Use the app for unlawful purposes</Text>
                        <Text style={styles.sectionText}>• Reverse engineer or abuse the platform</Text>
                    </View>

                    {/* 13. Intellectual Property */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="copyright" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>13. Intellectual Property</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            All content, branding, trademarks, and software belong to Minta Club Private Limited.
                        </Text>
                        <Text style={styles.sectionText}>
                            Unauthorized use is strictly prohibited.
                        </Text>
                    </View>

                    {/* 14. Limitation of Liability */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="gavel" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>14. Limitation of Liability</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            To the maximum extent permitted by law, the Company shall not be liable for:
                        </Text>
                        <Text style={styles.sectionText}>• Indirect or consequential damages</Text>
                        <Text style={styles.sectionText}>• Improper handling or cooking of raw products</Text>
                        <Text style={styles.sectionText}>• Delays caused by factors beyond control</Text>
                    </View>

                    {/* 15. Governing Law & Jurisdiction */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="location-on" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>15. Governing Law & Jurisdiction</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            These Terms shall be governed by the laws of India.
                        </Text>
                        <Text style={styles.sectionText}>
                            Courts at Ranchi, Jharkhand shall have exclusive jurisdiction.
                        </Text>
                    </View>

                    {/* 16. Changes to Terms */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="update" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>16. Changes to Terms</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We may update these Terms from time to time.
                        </Text>
                        <Text style={styles.sectionText}>
                            Continued use of the app constitutes acceptance of the revised Terms.
                        </Text>
                    </View>

                    {/* 17. Mandatory Terms for Raw Poultry, Meat & Fish Products */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>17. Mandatory Terms for Raw Poultry, Meat & Fish Products</Text>
                        </View>

                        {/* Clause 1 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 1: Nature of Products
                        </Text>
                        <Text style={styles.sectionText}>
                            1.1 Minta Fresh supplies raw, freshly cut chicken, fish, and goat meat intended only for cooking purposes.
                        </Text>
                        <Text style={styles.sectionText}>
                            1.2 All products are uncooked, unprocessed, and not ready-to-eat or ready-to-cook.
                        </Text>
                        <Text style={styles.sectionText}>
                            1.3 Raw meat and fish, when freshly cut and unwashed, may have a natural odor, which is an inherent characteristic of fresh raw products and does not indicate spoilage.
                        </Text>
                        <Text style={styles.sectionText}>
                            1.4 This natural odor typically reduces or disappears after proper washing and complete cooking.
                        </Text>
                        <Text style={styles.sectionText}>
                            1.5 Natural variations in odor, appearance, or texture are normal for raw agricultural food products and do not constitute a defect.
                        </Text>
                        <Text style={[styles.sectionText, { fontWeight: "700" }]}>Clarification:</Text>
                        <Text style={styles.sectionText}>• Natural odor = inherent characteristic of fresh raw meat/fish</Text>
                        <Text style={styles.sectionText}>• Spoilage = slimy texture, abnormal discoloration, or strong putrid smell</Text>

                        {/* Clause 2 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 2: Processing & Cleaning Disclosure
                        </Text>
                        <Text style={styles.sectionText}>2.1 Products are supplied raw and unwashed.</Text>
                        <Text style={styles.sectionText}>
                            2.2 Minta Fresh does not represent the products as cleaned, washed, or ready-to-cook.
                        </Text>
                        <Text style={styles.sectionText}>
                            2.3 Washing of raw meat prior to delivery is intentionally avoided to:
                        </Text>
                        <Text style={styles.sectionText}>• Maintain freshness</Text>
                        <Text style={styles.sectionText}>• Reduce cross-contamination risk</Text>
                        <Text style={styles.sectionText}>• Ensure timely delivery</Text>

                        {/* Clause 3 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 3: Product Disclosure & Acceptance
                        </Text>
                        <Text style={styles.sectionText}>
                            3.1 Product descriptions and notices clearly disclose that:
                        </Text>
                        <Text style={styles.sectionText}>• Products are raw and unwashed</Text>
                        <Text style={styles.sectionText}>• Cleaning and proper cooking are required before consumption</Text>
                        <Text style={styles.sectionText}>
                            3.2 By placing an order, the customer confirms acceptance of these disclosures.
                        </Text>

                        {/* Clause 4 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 4: Delivery & Freshness
                        </Text>
                        <Text style={styles.sectionText}>
                            4.1 Products are generally delivered fresh within 30–45 minutes of cutting, subject to operational conditions.
                        </Text>
                        <Text style={styles.sectionText}>
                            4.2 Minor variations in odor, colour, or texture are natural characteristics of raw meat and fish and shall not be treated as quality defects.
                        </Text>

                        {/* Clause 5 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 5: Customer Responsibility
                        </Text>
                        <Text style={styles.sectionText}>
                            5.1 After delivery, responsibility for:
                        </Text>
                        <Text style={styles.sectionText}>• Cleaning</Text>
                        <Text style={styles.sectionText}>• Handling</Text>
                        <Text style={styles.sectionText}>• Storage</Text>
                        <Text style={styles.sectionText}>• Cooking</Text>
                        <Text style={styles.sectionText}>
                            rests entirely with the customer.
                        </Text>
                        <Text style={styles.sectionText}>
                            5.2 Customers are advised to follow safe food-handling practices and ensure complete cooking before consumption.
                        </Text>

                        {/* Clause 6 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 6: Refunds & Replacements (Raw Products)
                        </Text>
                        <Text style={styles.sectionText}>
                            6.1 Due to hygiene and safety reasons, raw meat and fish products are non-returnable.
                        </Text>
                        <Text style={styles.sectionText}>
                            6.2 Refunds or replacements may be considered only if:
                        </Text>
                        <Text style={styles.sectionText}>• Product is spoiled at the time of delivery</Text>
                        <Text style={styles.sectionText}>• Incorrect item is delivered</Text>
                        <Text style={styles.sectionText}>• Quantity is materially short</Text>
                        <Text style={styles.sectionText}>
                            6.3 Claims must be raised with supporting evidence within 10 minutes of delivery.
                        </Text>
                        <Text style={styles.sectionText}>
                            6.4 Refunds are not applicable for:
                        </Text>
                        <Text style={styles.sectionText}>• Cleaning-related concerns</Text>
                        <Text style={styles.sectionText}>• Natural raw product odor or appearance</Text>
                        <Text style={styles.sectionText}>• Issues arising after washing or cooking</Text>

                        {/* Clause 7 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 7: Limitation of Liability
                        </Text>
                        <Text style={styles.sectionText}>
                            7.1 Minta Club Private Limited shall not be liable for issues arising due to:
                        </Text>
                        <Text style={styles.sectionText}>• Post-delivery handling</Text>
                        <Text style={styles.sectionText}>• Improper cleaning or storage</Text>
                        <Text style={styles.sectionText}>• Undercooking or contamination after delivery</Text>
                        <Text style={styles.sectionText}>
                            7.2 Any liability, if established, shall be limited to the value of the product delivered.
                        </Text>

                        {/* Clause 8 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 8: Governing Law & Jurisdiction
                        </Text>
                        <Text style={styles.sectionText}>
                            8.1 These Terms shall be governed by the laws of India.
                        </Text>
                        <Text style={styles.sectionText}>
                            8.2 Courts and Consumer Commissions at Ranchi, Jharkhand shall have jurisdiction.
                        </Text>

                        {/* Clause 9 */}
                        <Text style={[styles.sectionText, { fontWeight: "700", marginTop: 16 }]}>
                            Clause 9: Food Safety & Regulatory Compliance
                        </Text>
                        <Text style={styles.sectionText}>
                            The products supplied are raw food ingredients intended for consumer-side handling and cooking.
                        </Text>
                        <Text style={styles.sectionText}>
                            Consumers are advised to follow safe food-handling practices, including thorough cleaning and complete cooking before consumption.
                        </Text>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="contact-support" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                        </View>
                        <Text style={styles.sectionText}>Minta Club Private Limited</Text>
                        <Text style={styles.sectionText}>Brand: Minta Fresh</Text>
                        <Text style={styles.sectionText}>Email: support@mintafresh.com</Text>
                        <Text style={styles.sectionText}>Contact Us : 7050664577</Text>
                        <Text style={styles.sectionText}>
                            Address: Road No.- 1B Basant Vihar, Harmu Housing Colony, Ranchi- 834002, Jharkhand
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

export default TermsAndConditions;