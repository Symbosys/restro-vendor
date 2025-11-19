import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/color';

interface FaqItem {
    question: string;
    answer: string;
}

interface TopicDetailsModalProps {
    topic: string;
    faqs: FaqItem[];
    onClose: () => void;
}

const TopicDetailsModal: React.FC<TopicDetailsModalProps> = ({ topic, faqs, onClose }) => {
    return (
        <SafeAreaView style={styles.modalContainer}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onClose}>
                    <Icon name="arrow-back" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.backText}>Back to Topics</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.title}>{topic}</Text>
                    <View style={styles.faqList}>
                        {faqs.map((faq, index) => (
                            <View key={index} style={styles.faqItem}>
                                <Text style={styles.faqQuestion}>{faq.question}</Text>
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        height: 56,
        justifyContent: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    faqList: {
        gap: 12,
    },
    faqItem: {
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
    faqQuestion: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    faqAnswer: {
        fontSize: 14,
        color: COLORS.muted,
        lineHeight: 20,
    },
});

export default TopicDetailsModal;