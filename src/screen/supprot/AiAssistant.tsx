import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/color';

const AISupportAssistantScreen = () => {
    const [message, setMessage] = useState('');

    const quickReplies = [
        'Track my order',
        'Report a missing item',
        'Contact human support',
    ];

    // Animated typing indicator
    const TypingIndicator = () => {
        const dot1 = new Animated.Value(0);
        const dot2 = new Animated.Value(0);
        const dot3 = new Animated.Value(0);

        React.useEffect(() => {
            const createAnimation = (animatedValue: Animated.Value, delay: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(animatedValue, {
                            toValue: -8,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animatedValue, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            Animated.parallel([
                createAnimation(dot1, 200),
                createAnimation(dot2, 400),
                createAnimation(dot3, 600),
            ]).start();
        }, []);

        return (
            <View style={styles.typingContainer}>
                <Animated.View
                    style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]}
                />
                <Animated.View
                    style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]}
                />
                <Animated.View
                    style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <LinearGradient
                        colors={['#8719C6', '#b58ff0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientTextWrapper}>
                        <Text style={styles.headerTitle}>AI Support Assistant 🤖</Text>
                    </LinearGradient>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="history" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>
                    Chat with our AI to get instant help or report a problem.
                </Text>
                <View style={styles.headerDivider} />
            </View>

            {/* Chat Messages */}
            <ScrollView
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}>
                {/* AI Welcome Message */}
                <View style={styles.messageRow}>
                    <Image
                        source={{
                            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsGPBXz1RpOcGC83yRUP8HPbRV4aUypWdDQFASumvf9ZOdu6_SsHaKAzFjNLvdAk2pZ2nQhkfzlLZzzcVX-Kxgseov6A2bls6pGDeOHHGqmOqV6vuScWJMjFvMGNxbUV92L9IsWlr7nBP1sI3TNskPRz5rxyJrQO8v30CBj63ytpDAV_qcL5Ses6OrUccmVDSzP827TYy_kzU2XF6TW_2kTteJy5Bey2QlygSgn4ZvV-4miCoshI1QMQwf979z6ZIpf9bLlYYrfWti',
                        }}
                        style={styles.avatar}
                    />
                    <View style={styles.messageContainer}>
                        <LinearGradient
                            colors={['#ffffff', '#f9eae9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.aiBubble}>
                            <Text style={styles.aiMessageText}>
                                Hey 👋 I'm MintaBot! How can I help you today?
                            </Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* User Message */}
                <View style={styles.messageRowUser}>
                    <View style={styles.messageContainerUser}>
                        <LinearGradient
                            colors={['#8719C6', '#b58ff0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.userBubble}>
                            <Text style={styles.userMessageText}>
                                My order hasn't been delivered yet.
                            </Text>
                            <Icon name="done" size={16} color={COLORS.white} />
                        </LinearGradient>
                    </View>
                </View>

                {/* AI Typing Indicator */}
                <View style={styles.messageRow}>
                    <Image
                        source={{
                            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWzAiVtFy2esbhtecC_Fk_1VdeALO4flKyim73Nsz6jFjpzsD3c5wQ1zCPeWEbFG5Rp2a-nmVFWNTOTDq8kRsYiviKJmAsba_LHufsX5V8fiYC4YGeLLeCxN2Z7iwMh1CRwPjLzp3yIJuM9eYikRzfSTx1ahZWTm8P4JaT2fPmtRO8ivW3pxNhmLfyLb1ErVB7Av16y1PL_fKLX1Vs3h6CNHh4XBb7-rNC42QSonbcq51ht5l7GPLs7LWjGF7sQBpifGuQ863dVCiD',
                        }}
                        style={styles.avatar}
                    />
                    <View style={styles.messageContainer}>
                        <LinearGradient
                            colors={['#ffffff', '#f9eae9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.aiBubbleTyping}>
                            <TypingIndicator />
                        </LinearGradient>
                    </View>
                </View>

                {/* AI Response Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>
                                Looks like you need human assistance 🧑‍💼
                            </Text>
                            <Text style={styles.cardDescription}>
                                Our AI couldn't resolve the issue. Please connect with a support
                                agent for further help.
                            </Text>
                            <View style={styles.cardButtonsRow}>
                                <LinearGradient
                                    colors={['#8719C6', '#b58ff0']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.primaryButton}>
                                    <TouchableOpacity style={styles.primaryButtonInner}>
                                        <Text style={styles.primaryButtonText}>
                                            Connect to Support Agent
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                                <TouchableOpacity style={styles.secondaryButton}>
                                    <Text style={styles.secondaryButtonText}>Back to FAQs</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Input Section */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                <View style={styles.footer}>
                    {/* Quick Reply Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.quickRepliesContainer}
                        contentContainerStyle={styles.quickRepliesContent}>
                        {quickReplies.map((reply, index) => (
                            <TouchableOpacity key={index} style={styles.quickReplyChip}>
                                <Text style={styles.quickReplyText}>{reply}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Input Bar */}
                    <View style={styles.inputBar}>
                        <View style={styles.inputWrapper}>
                            <TouchableOpacity style={styles.attachmentButton}>
                                <Icon name="attach-file" size={24} color="#757575" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type your message..."
                                placeholderTextColor="#757575"
                                value={message}
                                onChangeText={setMessage}
                            />
                        </View>
                        <TouchableOpacity style={styles.micButton}>
                            <Icon name="mic" size={24} color="#757575" />
                        </TouchableOpacity>
                        <LinearGradient
                            colors={['#8719C6', '#b58ff0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sendButton}>
                            <TouchableOpacity style={styles.sendButtonInner}>
                                <Icon name="send" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.background,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    gradientTextWrapper: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.27,
        color: 'transparent',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#757575',
        textAlign: 'center',
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 12,
        lineHeight: 20,
    },
    headerDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    chatArea: {
        flex: 1,
    },
    chatContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 112,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 16,
    },
    messageRowUser: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    messageContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    messageContainerUser: {
        flex: 1,
        alignItems: 'flex-end',
    },
    aiBubble: {
        maxWidth: '80%',
        borderRadius: 16,
        borderBottomLeftRadius: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    aiBubbleTyping: {
        borderRadius: 16,
        borderBottomLeftRadius: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    aiMessageText: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.textPrimary,
        lineHeight: 22,
    },
    userBubble: {
        maxWidth: '80%',
        borderRadius: 16,
        borderBottomRightRadius: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    userMessageText: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.white,
        lineHeight: 22,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    cardContainer: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 22,
    },
    cardDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: '#757575',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardButtonsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    primaryButton: {
        flex: 1,
        height: 40,
        borderRadius: 20,
    },
    primaryButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.white,
    },
    secondaryButton: {
        minWidth: 84,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E6D9F7',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#8719C6',
    },
    footer: {
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    quickRepliesContainer: {
        marginBottom: 8,
    },
    quickRepliesContent: {
        gap: 8,
        paddingVertical: 8,
    },
    quickReplyChip: {
        height: 32,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#E6D9F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickReplyText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#8719C6',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingLeft: 12,
        paddingRight: 16,
    },
    attachmentButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        paddingLeft: 8,
    },
    micButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    sendButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AISupportAssistantScreen;