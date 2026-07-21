import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    Linking,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { COLORS } from '../../theme/color';
import {
    useInitVendorSupportChatSession,
    useVendorSupportChatHistory,
    useSendVendorSupportChatMessage,
    useResolveVendorSupportChatSession,
} from '../../api/hooks/useSupportChat';

// --- Vendor Support Option Interfaces ---
interface VendorSubOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    actionType?: 
        | 'rider_delay'
        | 'out_of_stock'
        | 'prep_extension'
        | 'payout_status'
        | 'commission_info'
        | 'bank_update'
        | 'menu_toggle'
        | 'busy_mode'
        | 'rider_misbehavior'
        | 'general_info';
}

interface VendorPrimaryCategory {
    id: string;
    title: string;
    icon: string;
    badge?: string;
    description: string;
    subOptions: VendorSubOption[];
}

// --- Chat Message Interface ---
interface UIChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text?: string;
    timestamp: string;
    cardType?: string;
    data?: any;
}

const AISupportAssistantScreen = ({ navigation }: any) => {
    const route = useRoute<any>();
    const { orderId } = route?.params || {};

    // --- Database Vendor Support Chat Hooks ---
    const initChatMutation = useInitVendorSupportChatSession();
    const sendChatMutation = useSendVendorSupportChatMessage();
    const resolveChatMutation = useResolveVendorSupportChatSession();
    const { data: dbChatSession, isLoading: isLoadingChat } = useVendorSupportChatHistory(orderId);

    // Local UI states
    const [messageInput, setMessageInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<VendorPrimaryCategory | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Initialize Vendor DB Chat Session on mount if needed
    useEffect(() => {
        if (!dbChatSession && !initChatMutation.isPending) {
            initChatMutation.mutate({ orderId: orderId ? orderId.toString() : undefined });
        }
    }, [orderId]);

    const getCurrentTime = (dateStr?: string) => {
        const d = dateStr ? new Date(dateStr) : new Date();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Synced escalation attempt counter from PostgreSQL DB
    const escalationAttempts = dbChatSession?.escalationCount || 0;

    // --- Vendor Categories & Options Data ---
    const vendorCategories: VendorPrimaryCategory[] = useMemo(() => [
        {
            id: 'order_ops',
            title: 'Kitchen & Order Prep',
            icon: 'restaurant',
            badge: 'Live Orders',
            description: 'Pickup delays, item out of stock, prep time',
            subOptions: [
                {
                    id: 'rider_delayed_opt',
                    title: 'Delivery executive delayed for pickup',
                    description: 'Nudge driver or re-assign pickup',
                    icon: 'two-wheeler',
                    actionType: 'rider_delay',
                },
                {
                    id: 'item_out_of_stock_opt',
                    title: 'Item in active order is out of stock',
                    description: 'Notify customer or request dish replacement',
                    icon: 'remove-shopping-cart',
                    actionType: 'out_of_stock',
                },
                {
                    id: 'prep_extension_opt',
                    title: 'Request prep time extension (+15 mins)',
                    description: 'Add extra time for high rush orders',
                    icon: 'add-alarm',
                    actionType: 'prep_extension',
                },
            ],
        },
        {
            id: 'payout_settlement',
            title: 'Payouts & Bank Transfers',
            icon: 'account-balance-wallet',
            badge: 'Weekly Cycle',
            description: 'Settlement status, commission & bank details',
            subOptions: [
                {
                    id: 'payout_status_opt',
                    title: 'Where is my weekly payout settlement?',
                    description: 'Check bank transfer status & reference ID',
                    icon: 'currency-rupee',
                    actionType: 'payout_status',
                },
                {
                    id: 'commission_info_opt',
                    title: 'Commission & fee breakdown inquiry',
                    description: 'View platform commission %, TCS/TDS deductions',
                    icon: 'receipt-long',
                    actionType: 'commission_info',
                },
                {
                    id: 'bank_update_opt',
                    title: 'Update store bank account / IFSC code',
                    description: 'Submit bank account modification request',
                    icon: 'account-balance',
                    actionType: 'bank_update',
                },
            ],
        },
        {
            id: 'menu_catalog',
            title: 'Menu & Stock Management',
            icon: 'restaurant-menu',
            description: 'Toggle item availability & update dish prices',
            subOptions: [
                {
                    id: 'menu_toggle_opt',
                    title: 'Toggle item in stock / sold out',
                    description: 'Quickly turn off unavailable items',
                    icon: 'toggle-on',
                    actionType: 'menu_toggle',
                },
                {
                    id: 'price_update_opt',
                    title: 'Update dish price or combo details',
                    description: 'Submit price revision request',
                    icon: 'edit',
                    actionType: 'general_info',
                },
            ],
        },
        {
            id: 'outlet_status',
            title: 'Outlet & Operating Hours',
            icon: 'storefront',
            description: 'Pause store during rush or schedule holidays',
            subOptions: [
                {
                    id: 'busy_mode_opt',
                    title: 'Enable Temporary Store Pause (Busy Mode)',
                    description: 'Pause incoming orders for 30m / 60m',
                    icon: 'pause-circle-filled',
                    actionType: 'busy_mode',
                },
                {
                    id: 'holiday_schedule_opt',
                    title: 'Set upcoming holiday store closure',
                    description: 'Schedule closed dates in advance',
                    icon: 'event-busy',
                    actionType: 'general_info',
                },
            ],
        },
        {
            id: 'rider_conduct',
            title: 'Delivery Partner Conduct',
            icon: 'report-problem',
            description: 'Report rider refusal or unprofessional behavior',
            subOptions: [
                {
                    id: 'rider_refusal_opt',
                    title: 'Rider refused to pick up prepared order',
                    description: 'Request immediate replacement driver',
                    icon: 'cancel-presentation',
                    actionType: 'rider_misbehavior',
                },
                {
                    id: 'rider_conduct_opt',
                    title: 'Rider misbehavior or improper handling',
                    description: 'Report conduct issue to fleet safety',
                    icon: 'security',
                    actionType: 'rider_misbehavior',
                },
            ],
        },
    ], []);

    // Format DB messages into UI format
    const uiMessages: UIChatMessage[] = useMemo(() => {
        if (!dbChatSession?.messages || dbChatSession.messages.length === 0) {
            return [
                {
                    id: 'msg_welcome',
                    sender: 'ai',
                    text: `Hello! 👋 I'm **MintaBot**, your 24/7 Vendor Partner Support Assistant.\n\nHow can I help your restaurant outlet today?`,
                    timestamp: getCurrentTime(),
                },
                {
                    id: 'msg_categories',
                    sender: 'ai',
                    text: 'Please select a vendor support category below:',
                    timestamp: getCurrentTime(),
                    cardType: 'category_grid',
                },
            ];
        }

        return dbChatSession.messages.map(m => ({
            id: m.id,
            sender: m.senderType === 'USER' || m.senderType === 'VENDOR' ? 'user' : 'ai',
            text: m.messageText,
            timestamp: getCurrentTime(m.createdAt),
            cardType: m.cardType || undefined,
            data: m.cardData,
        }));
    }, [dbChatSession]);

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
    }, [uiMessages, isTyping]);

    // Animated Typing Indicator Component
    const TypingIndicator = () => {
        const dot1 = useRef(new Animated.Value(0)).current;
        const dot2 = useRef(new Animated.Value(0)).current;
        const dot3 = useRef(new Animated.Value(0)).current;

        useEffect(() => {
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
                createAnimation(dot1, 100),
                createAnimation(dot2, 300),
                createAnimation(dot3, 500),
            ]).start();
        }, []);

        return (
            <View style={styles.typingContainer}>
                <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
                <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
                <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
            </View>
        );
    };

    // Send Message via API
    const sendMessageToDb = (text: string, cardType?: string, cardData?: any) => {
        if (!dbChatSession?.sessionId) return;
        setIsTyping(true);
        sendChatMutation.mutate(
            {
                sessionId: dbChatSession.sessionId,
                messageText: text,
                cardType,
                cardData,
            },
            {
                onSettled: () => setIsTyping(false),
            }
        );
    };

    // Handlers for vendor choices
    const handleCategorySelect = (category: VendorPrimaryCategory) => {
        setSelectedCategory(category);
        sendMessageToDb(category.title, 'sub_options', category.subOptions);
    };

    const handleSubOptionSelect = (subOption: VendorSubOption) => {
        sendMessageToDb(subOption.title, subOption.actionType, subOption);
    };

    const handleUnresolvedIssue = () => {
        sendMessageToDb("No, this didn't resolve my vendor query 😞");
    };

    // Call Vendor Helpline
    const handleCallVendorSupport = () => {
        const phoneNumber = 'tel:18008887777';
        Linking.canOpenURL(phoneNumber)
            .then(supported => {
                if (supported) {
                    Linking.openURL(phoneNumber);
                } else {
                    Alert.alert('Vendor Help Desk', 'Dedicated Helpline: +91 1800-888-7777');
                }
            })
            .catch(() => {
                Alert.alert('Vendor Help Desk', 'Helpline: +91 1800-888-7777');
            });
    };

    // Send Free Form Message
    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        const text = messageInput.trim();
        setMessageInput('');
        sendMessageToDb(text);
    };

    // Reset Session
    const handleResetChat = () => {
        if (dbChatSession?.sessionId) {
            resolveChatMutation.mutate({ sessionId: dbChatSession.sessionId });
        }
        initChatMutation.mutate({ orderId: orderId ? orderId.toString() : undefined });
    };

    if (isLoadingChat) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={['top']}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Connecting to Vendor Support DB...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>

                    <LinearGradient
                        colors={['#8719C6', '#b58ff0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientTextWrapper}>
                        <Text style={styles.headerTitle}>Vendor Support AI 🤖</Text>
                    </LinearGradient>

                    <TouchableOpacity onPress={handleResetChat} style={styles.headerButton}>
                        <Icon name="refresh" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Subtitle & DB Synced Attempt Counter */}
                <View style={styles.headerSubtitleRow}>
                    <Text style={styles.headerSubtitle}>
                        Restaurant Partner Support • 24/7 Helpline
                    </Text>
                    {escalationAttempts > 0 && (
                        <View style={styles.attemptBadge}>
                            <Text style={styles.attemptBadgeText}>
                                Attempts: {escalationAttempts}/5
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.headerDivider} />
            </View>

            {/* Chat Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}>

                {uiMessages.map((msg, index) => (
                    <View key={msg.id || index}>
                        {/* Message Bubble */}
                        <View style={msg.sender === 'user' ? styles.messageRowUser : styles.messageRow}>
                            {msg.sender === 'ai' && (
                                <Image
                                    source={{
                                        uri: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=100&q=80',
                                    }}
                                    style={styles.avatar}
                                />
                            )}

                            <View style={msg.sender === 'user' ? styles.messageContainerUser : styles.messageContainer}>
                                {msg.sender === 'ai' ? (
                                    <LinearGradient
                                        colors={['#ffffff', '#f8f4ff']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.aiBubble}>
                                        <Text style={styles.aiMessageText}>{msg.text}</Text>
                                        <Text style={styles.timestampText}>{msg.timestamp}</Text>
                                    </LinearGradient>
                                ) : (
                                    <LinearGradient
                                        colors={['#8719C6', '#b58ff0']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.userBubble}>
                                        <Text style={styles.userMessageText}>{msg.text}</Text>
                                        <Icon name="done-all" size={16} color={COLORS.white} />
                                    </LinearGradient>
                                )}
                            </View>
                        </View>

                        {/* Vendor Interactive Cards */}

                        {/* 1. Category Grid */}
                        {msg.cardType === 'category_grid' && (
                            <View style={styles.cardContainer}>
                                <Text style={styles.sectionHeaderTitle}>Select vendor support topic:</Text>
                                <View style={styles.categoriesGrid}>
                                    {vendorCategories.map(cat => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={styles.categoryCard}
                                            onPress={() => handleCategorySelect(cat)}
                                            activeOpacity={0.7}>
                                            <View style={styles.categoryCardTop}>
                                                <View style={styles.categoryIconBox}>
                                                    <Icon name={cat.icon} size={22} color={COLORS.primary} />
                                                </View>
                                                {cat.badge && (
                                                    <View style={styles.categoryBadge}>
                                                        <Text style={styles.categoryBadgeText}>{cat.badge}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.categoryTitle}>{cat.title}</Text>
                                            <Text style={styles.categoryDesc} numberOfLines={2}>
                                                {cat.description}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* 2. Sub Options List */}
                        {msg.cardType === 'sub_options' && msg.data && (
                            <View style={styles.cardContainer}>
                                {msg.data.map((sub: VendorSubOption) => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        style={styles.subOptionCard}
                                        onPress={() => handleSubOptionSelect(sub)}
                                        activeOpacity={0.7}>
                                        <View style={styles.subOptionLeft}>
                                            <Icon name={sub.icon} size={22} color={COLORS.primary} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.subOptionTitle}>{sub.title}</Text>
                                                <Text style={styles.subOptionDesc}>{sub.description}</Text>
                                            </View>
                                        </View>
                                        <Icon name="chevron-right" size={22} color="#AAA" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* 3. Rider Delay Action Card */}
                        {msg.cardType === 'rider_delay' && (
                            <View style={styles.cardContainer}>
                                <View style={styles.vendorCardBox}>
                                    <View style={styles.cardHeaderRow}>
                                        <Icon name="two-wheeler" size={24} color={COLORS.primary} />
                                        <Text style={styles.cardHeaderTitle}>Pickup Driver Status Nudge</Text>
                                    </View>
                                    <Text style={styles.cardBodyText}>
                                        We have dispatched an automated SMS alert to the delivery partner. Fleet operations are monitoring your pickup location.
                                    </Text>
                                    <TouchableOpacity style={styles.vendorActionBtn} onPress={() => Alert.alert('Rider Alert Sent', 'Driver alerted of order readiness!')}>
                                        <Text style={styles.vendorActionBtnText}>Nudge Driver & Notify Fleet</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.unresolvedLinkBtn} onPress={handleUnresolvedIssue}>
                                        <Text style={styles.unresolvedLinkText}>Didn't solve issue / Talk to agent</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* 4. Payout Status Card */}
                        {msg.cardType === 'payout_status' && (
                            <View style={styles.cardContainer}>
                                <View style={styles.vendorCardBox}>
                                    <View style={styles.cardHeaderRow}>
                                        <Icon name="account-balance-wallet" size={24} color="#059669" />
                                        <Text style={[styles.cardHeaderTitle, { color: '#059669' }]}>Weekly Payout Settlement</Text>
                                    </View>
                                    <Text style={styles.cardBodyText}>
                                        Weekly payout settlements are transferred every Tuesday by 2:00 PM directly to your registered bank account.
                                    </Text>
                                    <TouchableOpacity style={styles.vendorActionBtn} onPress={() => Alert.alert('Payout Statement', 'Opening payout breakdown...')}>
                                        <Text style={styles.vendorActionBtnText}>View Latest Settlement Statement</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* 5. Busy Mode Pause Store Card */}
                        {msg.cardType === 'busy_mode' && (
                            <View style={styles.cardContainer}>
                                <View style={styles.vendorCardBox}>
                                    <View style={styles.cardHeaderRow}>
                                        <Icon name="pause-circle-filled" size={24} color="#E65100" />
                                        <Text style={[styles.cardHeaderTitle, { color: '#E65100' }]}>Store Pause (Busy Mode)</Text>
                                    </View>
                                    <Text style={styles.cardBodyText}>
                                        Experiencing high kitchen rush? You can temporarily pause new incoming orders for 30 or 60 minutes.
                                    </Text>
                                    <View style={styles.buttonRowGroup}>
                                        <TouchableOpacity
                                            style={styles.halfBtn}
                                            onPress={() => Alert.alert('Store Paused', 'Store paused for 30 mins')}>
                                            <Text style={styles.halfBtnText}>Pause 30 Mins</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.halfBtn}
                                            onPress={() => Alert.alert('Store Paused', 'Store paused for 60 mins')}>
                                            <Text style={styles.halfBtnText}>Pause 60 Mins</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* 6. Rider Misbehavior Escalation Card */}
                        {msg.cardType === 'rider_misbehavior' && (
                            <View style={styles.cardContainer}>
                                <View style={styles.vendorCardBox}>
                                    <View style={styles.cardHeaderRow}>
                                        <Icon name="report-problem" size={24} color="#D32F2F" />
                                        <Text style={[styles.cardHeaderTitle, { color: '#D32F2F' }]}>Rider Misconduct Escalation</Text>
                                    </View>
                                    <Text style={styles.cardBodyText}>
                                        Minta Fresh maintains zero tolerance for improper rider conduct. Please report details so our safety team can investigate.
                                    </Text>
                                    <TouchableOpacity style={styles.vendorDangerBtn} onPress={handleUnresolvedIssue}>
                                        <Text style={styles.vendorDangerBtnText}>Report Rider Misconduct</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* 7. Attempt-Locked Vendor Call Support Card (Unlocked on 5th Attempt in DB) */}
                        {msg.cardType === 'call_support' && (
                            <View style={styles.cardContainer}>
                                <LinearGradient
                                    colors={['#8719C6', '#5B1186']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.callSupportCard}>
                                    <View style={styles.callCardHeader}>
                                        <View style={styles.callIconCircle}>
                                            <Icon name="headset-mic" size={28} color="#8719C6" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.callCardTitle}>Dedicated Vendor Helpline Unlocked</Text>
                                            <Text style={styles.callCardSub}>
                                                You tried {escalationAttempts} times. Partner support line is ready.
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.callInfoBox}>
                                        <Icon name="phone-in-talk" size={20} color="#FFD700" />
                                        <Text style={styles.callInfoText}>Vendor Line: +91 1800-888-7777 (24/7 Desk)</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.makeCallBtn}
                                        onPress={handleCallVendorSupport}
                                        activeOpacity={0.8}>
                                        <Icon name="call" size={22} color={COLORS.white} />
                                        <Text style={styles.makeCallBtnText}>Call Vendor Partner Support Now</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        )}
                    </View>
                ))}

                {/* Animated Typing Indicator */}
                {isTyping && (
                    <View style={styles.messageRow}>
                        <Image
                            source={{
                                uri: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=100&q=80',
                            }}
                            style={styles.avatar}
                        />
                        <View style={styles.messageContainer}>
                            <View style={styles.aiBubbleTyping}>
                                <TypingIndicator />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input Footer */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                <View style={styles.footer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.quickRepliesContainer}
                        contentContainerStyle={styles.quickRepliesContent}>
                        {vendorCategories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.quickReplyChip}
                                onPress={() => handleCategorySelect(cat)}>
                                <Text style={styles.quickReplyText}>{cat.title}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.quickReplyChip} onPress={handleUnresolvedIssue}>
                            <Text style={styles.quickReplyText}>📞 Vendor Helpline</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.inputBar}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type your vendor query or issue..."
                                placeholderTextColor="#888"
                                value={messageInput}
                                onChangeText={setMessageInput}
                                onSubmitEditing={handleSendMessage}
                            />
                        </View>

                        <LinearGradient
                            colors={['#8719C6', '#b58ff0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sendButton}>
                            <TouchableOpacity style={styles.sendButtonInner} onPress={handleSendMessage}>
                                <Icon name="send" size={20} color={COLORS.white} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    header: {
        backgroundColor: COLORS.white,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
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
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
    },
    headerSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },
    attemptBadge: {
        backgroundColor: '#FFE0B2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    attemptBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#E65100',
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
        paddingTop: 12,
        paddingBottom: 24,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 14,
    },
    messageRowUser: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: 14,
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
        maxWidth: '85%',
        borderRadius: 16,
        borderBottomLeftRadius: 0,
        paddingHorizontal: 14,
        paddingVertical: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
    },
    aiBubbleTyping: {
        borderRadius: 16,
        borderBottomLeftRadius: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    aiMessageText: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    timestampText: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        borderBottomRightRadius: 0,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        elevation: 2,
    },
    userMessageText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.white,
        lineHeight: 20,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    cardContainer: {
        marginBottom: 16,
        marginLeft: 42,
    },
    sectionHeaderTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        elevation: 2,
    },
    categoryCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3E5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#E65100',
    },
    categoryTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    categoryDesc: {
        fontSize: 11,
        color: '#777',
        lineHeight: 14,
    },
    subOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    subOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    subOptionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    subOptionDesc: {
        fontSize: 11,
        color: '#777',
    },
    vendorCardBox: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    cardHeaderTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    cardBodyText: {
        fontSize: 12,
        color: '#555',
        lineHeight: 18,
        marginBottom: 12,
    },
    vendorActionBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    vendorActionBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.white,
    },
    vendorDangerBtn: {
        backgroundColor: '#D32F2F',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    vendorDangerBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.white,
    },
    unresolvedLinkBtn: {
        paddingVertical: 8,
        alignItems: 'center',
        marginTop: 6,
    },
    unresolvedLinkText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D32F2F',
        textDecorationLine: 'underline',
    },
    buttonRowGroup: {
        flexDirection: 'row',
        gap: 10,
    },
    halfBtn: {
        flex: 1,
        backgroundColor: '#F3E5F5',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    halfBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    callSupportCard: {
        borderRadius: 16,
        padding: 16,
        elevation: 4,
    },
    callCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    callIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callCardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.white,
    },
    callCardSub: {
        fontSize: 11,
        color: '#E0BBE4',
        marginTop: 2,
    },
    callInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 14,
    },
    callInfoText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.white,
    },
    makeCallBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 25,
    },
    makeCallBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.white,
    },
    footer: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 6,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    quickRepliesContainer: {
        marginBottom: 6,
    },
    quickRepliesContent: {
        gap: 8,
        paddingVertical: 4,
    },
    quickReplyChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F3E5F5',
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    quickReplyText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 22,
        paddingHorizontal: 14,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    sendButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AISupportAssistantScreen;