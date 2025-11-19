import React, { useRef, useState } from "react";
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../theme/color";
import { AppNavigation } from "../../types/types";


const PRIMARY_COLOR = COLORS.primary;
const ACCENT_COLOR = COLORS.accent;
const BODY_TEXT = COLORS.textSecondary;
const WHITE_30 = "rgba(255, 255, 255, 0.3)";
const BODY_TEXT_80 = "rgba(74, 74, 74, 0.8)";
const BODY_TEXT_60 = "rgba(74, 74, 74, 0.6)";


const TermsAndConditions = ({ navigation }: AppNavigation) => {
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
    const handleDownloadPress = () => {
        // Handle download
    };
    const handleAcceptPress = () => {
        // Handle accept and continue
    };
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: COLORS.white }
            ]}
        >
            {/* Header */}
            <View
                style={styles.header}
                onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
            >
                <View
                    style={[
                        styles.headerGradient,
                        { backgroundColor: COLORS.primary }
                    ]}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Terms & Conditions</Text>
                        <TouchableOpacity style={styles.headerButton} onPress={handleDownloadPress}>
                            <Icon name="download" size={24} color={COLORS.white} />
                        </TouchableOpacity>
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
                    style={[
                        styles.progressFill,
                        {
                            width: `${progress * 100}%`,
                            backgroundColor: COLORS.primary
                        }
                    ]}
                />
            </View>
            {/* Main Content */}
            <ScrollView
                ref={scrollRef}
                style={styles.main}
                contentContainerStyle={styles.mainContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Sub-header */}
                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderText}>Minta Club Pvt Ltd. (“FTH”) is the owner of the brand mintafresh.com and the website www.mintafresh.com, the minta fresh mobile application on iOS and Android devices (together referred as ”Platform”).</Text>
                    <Text style={styles.lastUpdated}>Last Updated: November 09, 2025</Text>
                </View>
                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Customer Registration and Privacy Policy */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>1. Customer Registration and Privacy Policy</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            The platform provides for registration process to serve its customer better and may now or in the future collect the following personally identifiable information to serve you better: a) Name including first and last name; b) email address; c) mobile phone numbers and contact details; d) Postal Pin code; e) Personal demographic profile like your age, gender, occupation, location, education, address etc.,
                            By completing the registration or placing an order, the Customer agrees to receive promotional and transactional communication, text messages, mobile notifications, phone calls and newsletters. The Customer can opt out by contacting the customer service at customercare@mintaclub.com. We will never sell or provide your information to third party companies or outside agencies for commercial purposes. However, the platform may contain links to other web sites that we do not directly manage such as Google Analytics used to understand and optimize user’s behaviour. FTH shall not be responsible for the privacy policies of such external web sites.
                        </Text>
                    </View>
                    {/* Who Can Sign Up */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="person" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>2. Who Can Sign Up</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Any person can sign up for services provided if he or she is competent to enter a contract. Section 11 of the Indian Contract Act, 1872 specifies that every person is competent to contract provided he or she has attained the age of 18 years, is of sound mind and not disqualified from contracting by any other law to which he or she is subject to.
                        </Text>
                    </View>
                    {/* Terms of access to Platform */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>3. Terms of access to Platform</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            FTH grants customers limited access rights for personal use on this platform and not to download (other than page caching) or edit any portion of it.
                            The access to this platform is for personal use of the Customer and not for any commercial use or to access its contents to collect and use of product listings, descriptions, or prices; any derivative use of this platform or any use of data mining, robots, or similar data gathering and extraction tools. No portions of this platform may be reproduced, duplicated, copied, sold, resold or otherwise exploited for any commercial purpose without express written consent of FTH.
                            Further no Customer is authorized to frame or utilize framing techniques to enclose any trademark, logo, or other proprietary information (including images, text, page layout, or form) on the platform without express written consent of FTH.
                            Any unauthorized use automatically terminates the permission granted by FTH.
                        </Text>
                    </View>
                    {/* Pricing */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local_shipping" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>4. Pricing</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Prices displayed for all the products on www.mintafresh.com exclude GST. The prices of all products mentioned at the time of ordering will be charged on the date of the delivery except for fresh food products. In case fresh food prices are higher or lower on the date of delivery, additional charges will be collected or refunded at the time of the delivery of the order.
                        </Text>
                    </View>
                    {/* Delivery and Handling Charges */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="undo" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>5. Delivery and Handling Charges</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            FTH may impose delivery and handling fees and taxes from time to time.
                            FTH endeavours to fulfil orders on time, but the actual delivery time may differ from the delivery time stated at the time of placing the order. Delivery delays will be communicated by FTH.
                        </Text>
                    </View>
                    {/* Order Cancellation */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="gavel" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>6. Order Cancellation</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            A Customer can opt to cancel order within 15 minute for the order placed either online or by calling our customer service and receive refund of advance paid if any. This is not applicable for Express delivery orders since those are processed and shipped immediately. To avoid any damage claims after delivery, users are recommended to inspect the product seal before accepting the order.
                            FTH reserves the right to cancel any order at its discretion based on product availability or if it suspects any fraudulent transaction by a customer or breaches the terms & conditions of using the platform.
                        </Text>
                    </View>
                    {/* Return & Refunds */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>7. Return & Refunds</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            FTH believes in Centum Customer satisfaction and "no questions asked return and refund policy" for issues relating to quality or freshness of its supplies. Customer may request for a refund/replacement within 1 hours of delivery of the products in case of any quality issues.
                            The mode of refund shall be as determined by FTH from time to time, such as, credit to mintacash, or to the original payment source. However, considering the order value and challenges to refund for cash on delivery orders in particular, the refunds will be applied to the subsequent purchases or credited to Customers mintacash account.
                        </Text>
                    </View>
                    {/* Customer Acceptance */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="person" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>8. Customer Acceptance</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            I hereby agree upon:
                            a. To pay extra cost claimed by FTH in the case of redelivery due to wrong name or address or any other wrong information provided while booking order.
                            b. To use the platform to transact for lawful purposes in compliance with all applicable laws and regulation.
                            c. To provide authentic and true information in all instances and authorize FTH to validate the information provided at any point to time and reject registration if any details are found to be untrue wholly or partly.
                            d. To access the services made available on the platform and to purchase the products offered at my own risk after using best and prudent judgement as a well-informed Customer.
                            e. That the delivery address provided is correct and proper in all respects.
                            f. That the product descriptions have been carefully checked before placing the order and agree to be bound by the terms and conditions of sale.
                            g. That there may be excess / short quantity when ordering a cut SKU of a particular product. For example, the Steak version of a particular fish may have some variance in the final weight, given the fact it is hard to cut a fish in to an exact weight without damaging the shape of the Steak piece. In such instances, I agree to pay the difference amount at the time of delivery or adjust excess payment against next order.
                        </Text>
                    </View>
                    {/* Obligations of Visitor / Customer */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>9. Obligations of Visitor / Customer</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            I hereby unconditionally undertake not to use the Platform for:
                            a. Disseminating any objectionable material, harassing, libelous, abusive, threatening, harmful, vulgar, obscene, or any unlawful activity.
                            b. To transmit material that constitutes a criminal offence or results in civil liability or otherwise breaches any relevant laws, regulations or code of practice.
                            c. To gain unauthorized access to other computer network systems.
                            d. Interfere with any other person's right to use or enjoyment of the platform. Breach of applicable laws.
                            e. Interfere or disrupt networks or web sites connected to the platform.
                            f. Make, transmit or store electronic copies of materials protected by copyright without the permission of FTH.
                            g. To post customer review feedback in violation of this policy or right of any third party, including copyright, trademark, privacy or other personal or proprietary right(s), and cause injury to any person or entity.
                            h. To post comments containing libelous or otherwise unlawful, threatening, abusive or obscene material, or contain software viruses, political campaigning, commercial solicitation, chain letters, mass mailings or any form of "spam".
                            i. Not to use a false email address, impersonate any person or entity, or otherwise mislead as to the origin of any Customer feedback submitted on the Platform.
                            j. To be solely responsible for the content of any Customer Feedback made and agree upon to indemnify FTH for all claims resulting from such Customer Feedback submitted.
                        </Text>
                    </View>
                    {/* Customer Reviews & Feedback */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local_shipping" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>10. Customer Reviews & Feedback</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            To post customer review feedback in violation of this policy or right of any third party, including copyright, trademark, privacy or other personal or proprietary right(s), and cause injury to any person or entity.
                        </Text>
                    </View>
                    {/* Unsubscribe Process */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="undo" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>11. Unsubscribe Process</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            By taking the steps below, you can choose not to get any marketing or sales messages from us in the future. You can unsubscribe by emailing: customercare@mintaclub.com or by writing to Minta Club Private Limited HI-76, Harmu Colony, Ranchi – 834002, Email: info@mintaclub.com.
                        </Text>
                    </View>
                    {/* Pictures & Colors */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="gavel" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>12. Pictures & Colors</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            FTH has made every effort to display the products and its colors on the platform as accurately as possible. FTH does not guarantee nor take responsibility for variations in pictorial representations for fresh foods and colors variation due to technical reasons.
                        </Text>
                    </View>
                    {/* Right to Modify Terms & Conditions of Service */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>13. Right to Modify Terms & Conditions of Service</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            FTH reserves unconditional right to modify terms and conditions of transacting business on mintafresh platform without any prior notification and consent of customers. When a registered customer accesses mintafresh platform, he or she is deemed to have accepted the latest version of the Terms & Conditions on the Site.
                        </Text>
                    </View>
                    {/* Governing Law and Jurisdiction */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="person" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>14. Governing Law and Jurisdiction</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            All disputes arising out of or in doing business on the platform shall be amicably settled at the first instance by mutual discussions and negotiations. In the event the dispute is not resolved then the same may be referred to arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996 or any enactment of statutory modification thereof. The arbitration proceedings shall be in the English/Hindi language and shall be held in Ranchi. The award of the arbitral tribunal shall be final and binding upon the parties and no appeal against the same shall lie to any court. The courts of competent jurisdiction in Bangalore shall have exclusive jurisdiction over any dispute, differences or claims arising out of this agreement.
                        </Text>
                    </View>
                    {/* Copyright & Trademark Rights */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>15. Copyright & Trademark Rights</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            The Customer acknowledges that access to this platform does not confer and shall not be considered as conferring upon anyone any license under any of FTH or any third party's intellectual property rights.
                            FTH expressly reserve all intellectual property rights in all text, programs, products, processes, technology, content, and other materials, which appear on the Platform.
                            All rights, including copyright, on this platform is owned by FTH.
                            Any use of this platform or its contents, including copying or storing it either in whole or part, is prohibited without the permission of FTH.
                            The names and logos and all related product and service names, design marks and slogans are the trademarks or service marks of FTH.
                            References on mintafresh Platform to any names, marks, products, or services of third parties or hypertext links to third party sites or information provided is solely for customer convenience and does not in any way constitute or imply FTH endorsement, sponsorship or recommendation of the third party, information, product or service.
                            FTH is not responsible for content of any third-party sites and does not make any representations regarding the content or accuracy of material on such sites. Customers deciding to link to any such third-party websites, are doing entirely at their own risk.
                            All materials, including images, text, illustrations, designs, icons, photographs, programs, music clips or downloads, video clips and written and other materials hosted on mintafresh platform (collectively, the "Promotional Material") are intended solely for customer convenience. All software used in mintafresh platform is the property of FTH or its licensees and protected by copyright laws.
                            The Contents and software in mintafresh platform are to be used only as a shopping resource. Any other use, including the reproduction, modification, distribution, transmission, republication, display, of the Contents on this platform is strictly prohibited.
                            All Contents are copyrights, trademarks, and/or other intellectual property owned, controlled, or licensed by FTH and its affiliates and are protected by copyright laws.
                            The compilation (meaning the collection, arrangement, and assembly) of all Contents on this platform is the exclusive property of FTH and is also protected by copyright laws.
                            Objectionable Material
                            While all IT security measures are taken to ensure wholesome and socially acceptable content are available on mintafresh platform, notwithstanding the best efforts the customer understands and accepts the risk that while using this platform or any services provided on the www.mintafresh.com, one may encounter Content that may be deemed by some to be offensive, indecent, or objectionable, which Content may or may not be identified as such.
                            FTH and its affiliates shall have no liability to Customer for Content that may be deemed offensive, indecent, or objectionable to you.
                        </Text>
                    </View>
                    {/* Indemnity */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local_shipping" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>16. Indemnity</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            As a Customer, I hereby agree upon to defend, indemnify and hold harmless FTH, its employees, directors, officers, agents and their successors and assigns from and against any and all claims, liabilities, damages, losses, costs and expenses, including attorney's fees, caused by or arising out of claims based upon my actions or inactions, which may result in any loss or liability to FTH or any third party including but not limited to breach of any warranties, representations or undertakings or in relation to the non-fulfilment of any obligations under this User Agreement or arising out of violation of any applicable laws, regulations including but not limited to Intellectual Property Rights, payment of statutory dues and taxes, claim of libel, defamation, violation of rights of privacy or publicity, loss of service to other subscribers and infringement of intellectual property or other rights.
                            This clause shall survive the expiry or termination of this User Agreement. We may terminate this User Agreement at any time, without notice or liability to FTH.
                        </Text>
                    </View>
                    {/* Grievances */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="undo" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>17. Grievances</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Details of the Grievance contact is given below;
                            Minta Club Private Limited
                            HI-76, Harmu Colony, Ranchi – 834002
                            Email: info@mintaclub.com
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