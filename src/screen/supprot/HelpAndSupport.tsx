import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TopicDetailsModal from '../../components/modal/BrowseTopic';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

const { width: screenWidth } = Dimensions.get('window');

interface FaqItem {
    question: string;
    answer: string;
}

interface QuickHelpItem {
    icon: string;
    title: string;
    description: string;
    navigation: string
}

const HelpSupportScreen = ({ navigation }: AppNavigation) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const quickHelpItems: readonly QuickHelpItem[] = [
        {
            icon: 'report',
            title: 'Report an Issue',
            description: 'Problem with an item',
            navigation: 'ReportIssue',
        },
        // {
        //     icon: 'credit-card',
        //     title: 'Payment & Refunds',
        //     description: 'Billing inquiries',
        //     navigation: 'PaymentAndRefunds',
        // },
        // {
        //     icon: 'manage-accounts',
        //     title: 'Account Settings',
        //     description: 'Update your profile',
        //     navigation: 'AccountSettings',
        // },
    ];

    const browseTopics = [
        { icon: 'delivery-dining', title: 'Delivery' },
        { icon: 'payments', title: 'Payments' },
        { icon: 'person', title: 'My Account' },
        { icon: 'sell', title: 'Promotions & Vouchers' },
    ];

    const getFaqs = (topic: string): FaqItem[] => {
        const faqs: { [key: string]: FaqItem[] } = {
            'Delivery': [
                { question: 'How long does delivery take?', answer: 'Standard delivery takes 3-5 business days within the continental US.' },
                { question: 'What is the delivery fee?', answer: 'Delivery fee is $5 for orders under $50. Free shipping on orders over $50.' },
                { question: 'Can I track my order?', answer: 'Yes, use the Track My Order feature above to monitor your shipment in real-time.' },
            ],
            'Payments': [
                { question: 'What payment methods are accepted?', answer: 'We accept Visa, Mastercard, American Express, PayPal, and Apple Pay.' },
                { question: 'How do I get a refund?', answer: 'Refunds are processed within 7 business days to your original payment method.' },
                { question: 'Is my payment information secure?', answer: 'Yes, all transactions are encrypted with SSL and PCI compliant.' },
            ],
            'My Account': [
                { question: 'How do I change my password?', answer: 'Go to Account Settings, select Security, and follow the reset instructions.' },
                { question: 'How do I update my address?', answer: 'Navigate to Profile in My Account and edit your shipping address details.' },
                { question: 'How can I view my order history?', answer: 'Access Orders section in My Account to see all past purchases and statuses.' },
            ],
            'Promotions & Vouchers': [
                { question: 'How do I apply a voucher code?', answer: 'Enter the code in the Promotions field at checkout and click Apply.' },
                { question: 'Where can I find current promotions?', answer: 'Check the Promotions tab on the home screen or subscribe to our newsletter.' },
                { question: 'Can vouchers be combined?', answer: 'Yes, up to 2 vouchers can be stacked on eligible orders.' },
            ],
        };
        return faqs[topic] || [];
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <TouchableOpacity style={styles.headerRight}>
                    <Text style={styles.contactText} numberOfLines={1}>Contact Us</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchWrapper}>
                        <View style={styles.searchIconContainer}>
                            <Icon name="search" size={24} color={COLORS.muted} />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for FAQs, orders..."
                            placeholderTextColor="#88888880"
                        />
                    </View>
                </View>

                {/* Quick Help Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Help</Text>
                    <View style={styles.quickHelpGrid}>
                        {quickHelpItems.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.quickHelpCard} onPress={() => navigation.navigate(item.navigation as never)}>
                                <Icon name={item.icon} size={24} color={COLORS.primary} />
                                <View style={styles.quickHelpTextContainer}>
                                    <Text style={styles.quickHelpTitle}>{item.title}</Text>
                                    <Text style={styles.quickHelpDescription}>
                                        {item.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Browse by Topic Section */}
                <View style={styles.browseSection}>
                    <Text style={styles.sectionTitle}>Browse by Topic</Text>
                    <View style={styles.browseList}>
                        {browseTopics.map((topic, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.browseItem}
                                onPress={() => setSelectedTopic(topic.title)}
                            >
                                <View style={styles.browseItemLeft}>
                                    <Icon name={topic.icon} size={24} color={COLORS.primary} />
                                    <Text style={styles.browseItemText}>{topic.title}</Text>
                                </View>
                                <Icon name="chevron-right" size={24} color={COLORS.muted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Contact Support Section */}
                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Still need help?</Text>

                    <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientWrapper}
                    >
                        <TouchableOpacity style={styles.chatButton}>
                            <Icon name="chat-bubble" size={24} color={COLORS.white} />
                            <Text style={styles.chatButtonText}>Chat with Us</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    <TouchableOpacity style={styles.aiButton} onPress={() => navigation.navigate("AiAssistant")}>
                        <Icon name="psychology" size={24} color={COLORS.primary} />
                        <Text style={styles.aiButtonText}>Ai Assistant</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.callButton}>
                        <Icon name="call" size={24} color={COLORS.primary} />
                        <Text style={styles.callButtonText}>Call Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.emailButton}>
                        <Icon name="email" size={24} color={COLORS.textPrimary} />
                        <Text style={styles.emailButtonText}>Email Us</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal for Topic Details */}
            <Modal
                visible={!!selectedTopic}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedTopic(null)}
            >
                <TopicDetailsModal
                    topic={selectedTopic || ''}
                    faqs={getFaqs(selectedTopic || '')}
                    onClose={() => setSelectedTopic(null)}
                />
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: COLORS.background,
    },
    headerLeft: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
        flex: 1,
        textAlign: 'center',
        letterSpacing: -0.27,
    },
    headerRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    contactText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
    },
    scrollView: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    searchWrapper: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIconContainer: {
        width: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        paddingHorizontal: 8,
        paddingRight: 16,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    quickHelpGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickHelpCard: {
        width: (screenWidth - 32 - 16) / 2,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    quickHelpTextContainer: {
        marginTop: 12,
    },
    quickHelpTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    quickHelpDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: '#888888',
        lineHeight: 20,
    },
    browseSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
    },
    browseList: {
        gap: 12,
    },
    browseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    browseItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    browseItemText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    contactSection: {
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 24,
    },
    contactTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    gradientWrapper: {
        borderRadius: 28,
        marginBottom: 16,
        overflow: 'hidden',
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: 'transparent',
        paddingVertical: 16,
        paddingHorizontal: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    chatButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.accent,
        borderRadius: 28,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    aiButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.accent,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 28,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    callButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 28,
        paddingVertical: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    emailButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
});

export default HelpSupportScreen;