import React, { useRef, useState } from "react";
import {
    Linking,
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
    const handleDownloadPress = () => {
        // Handle download
    };
    const handleAcceptPress = () => {
        // Handle accept and continue
    };
    const handleEmailPress = () => {
        Linking.openURL("mailto:customercare@mintaclub.com");
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
                        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
                    <Text style={styles.subHeaderText}>This privacy policy sets out how mintaclub.com uses and protects any information that you give mintaclub.com when you use this website. mintaclub.com is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement. mintaclub.com may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you are happy with any changes.</Text>
                    <Text style={styles.lastUpdated}>Last Updated: November 09, 2025</Text>
                </View>
                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Consent & terms of this Privacy Policy */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>1. Consent & terms of this Privacy Policy</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            By using our platform (website, application or services), you have voluntarily agreed to consent & abide with this privacy policy. You have the option to disagree to abide by our privacy policy; if you choose disagree, you will not be able to access any portion of our platform or gain access to services provided on this platform.
                        </Text>
                    </View>
                    {/* What we collect */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="storage" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>2. What we collect</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We may collect the following information:
                            • name
                            • contact information including email address
                            • demographic information such as postcode, preferences and interests
                            • other information relevant to customer surveys and/or offers
                            For the exhaustive list of cookies we collect see the List of cookies we collect section.
                        </Text>
                    </View>
                    {/* What we do with the information we gather */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="settings" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>3. What we do with the information we gather</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
                            • Internal record keeping.
                            • We may use the information to improve our products and services.
                            • We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.
                            • From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customise the website according to your interests.
                            • Without identifying you personally we may use your information to provide updates on our service offerings and promotional schemes through third party advertising partners ('TPAP'). Our TPAP may use cookies on our website as well as third party websites and social media platforms to understand customer interests to provide updates on our latest service offerings and promotional schemes that are akin to your interests. Our TPAP provide you with complete control over ads experience and you can remove ads shown to you.
                        </Text>
                    </View>
                    {/* Security */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="security" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>4. Security</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure, we have put in place suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.
                        </Text>
                    </View>
                    {/* How we use cookies */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="cookies" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>5. How we use cookies</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyse web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
                            We use traffic log cookies to identify which pages are being used. This helps us analyse data about web page traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
                            Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us. You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
                        </Text>
                    </View>
                    {/* Links to other websites */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="link" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>6. Links to other websites</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Our website may contain links to other websites of interest. However, once you have used these links to leave our site, you should note that we do not have any control over that other website. Therefore, we cannot be responsible for the protection and privacy of any information which you provide whilst visiting such sites and such sites are not governed by this privacy statement. You should exercise caution and look at the privacy statement applicable to the website in question.
                        </Text>
                    </View>
                    {/* Controlling your personal information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="settings" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>7. Controlling your personal information</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            You may choose to restrict the collection or use of your personal information in the following ways:
                            • whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes
                            • if you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at customercare@mintaclub.com
                            We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
                            You may request details of personal information which we hold about you under the Data Protection Act 1998. A small fee will be payable. If you would like a copy of the information held on you please write to us at customercare@mintaclub.com. If you believe that any information we are holding on you is incorrect or incomplete, please write to or email us as soon as possible, at the above address. We will promptly correct any information found to be incorrect.
                        </Text>
                    </View>
                    {/* How can a user opt not to disclose information with FTH? */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="block" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>8. How can a user opt not to disclose information with FTH?</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            You have the option of not disclosing Your Sensitive Personal Data or Information to Us. You can also ask us to remove your data from our database by sending a mail to us at customercare@mintaclub.com. In the event that You choose not to disclose Sensitive Personal Information, you may not be able to access multiple areas of the Platform or avail our e-commerce facility / services provided on the Platform.
                        </Text>
                    </View>
                    {/* Marketing & promotional activity */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="campaign" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>9. Marketing & promotional activity</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            FTH may use your information to provide you with better platform user-experience, send information on products and services which may be of interest to you, send via Short Messaging Services (SMS) marketing promotions, and share such personal information to our business partners on a need-to-know basis to render effective services for better customer experience.
                        </Text>
                    </View>
                    {/* What is NDNC Policy? */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="call" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>10. What is NDNC Policy?</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            By using the Platform, you hereby authorize Us to contact You via email, phone, or SMS (Short Message Service), other applications (android or apple) linked to phone number on the contact details so provided, to furnish You with information about Our Products, Services, product delivery, marketing promotions, & other allied services offered by FTH on its platform. This authorization is licit for the mentioned purposes irrespective of whether You are registered with the NDNC (National Do Not Call) registry.
                        </Text>
                    </View>
                    {/* Indemnity */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="gavel" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>11. Indemnity</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            You agree to indemnify and hold FTH harmless from:(i) any actions, claims, demands, suits, damages, losses, penalties, interest and other charges and expenses (including legal fees and other dispute resolution costs) made by any third party due to or arising out of any violation of the terms of this Policy; (ii)any acts or deeds, including for any non-compliance or violation, of any applicable law, rules, regulations on Your part; or (iii) for violations committed by You.
                        </Text>
                    </View>
                    {/* Governing Law & Severability */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="gavel" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>12. Governing Law & Severability</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            The invalidity or unenforceability of any part of this Policy shall not prejudice or affect the validity or enforceability of the remainder of this Policy. This Policy has been prepared under the provisions of the Indian Information Technology Act, 2000 ("IT Act") and its corresponding rules as enshrined under the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("IT Rules") to monitor information (including sensitive personal data or information) collected, received, possessed, stored, dealt with, or handled by FTH.
                        </Text>
                    </View>
                    {/* Grievances */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="mail" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>13. Grievances</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Should you have any grievances about the processing of your personal information or the privacy policy, you may contact:
                            Minta Club Private Limited
                            HI-76, Harmu Colony, Ranchi - 834002
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
    emailLink: {
        color: PRIMARY_COLOR,
        fontWeight: "bold",
    },
});
export default PrivacyPolicy;