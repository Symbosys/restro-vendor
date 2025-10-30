// NewOrderModal.tsx
import React, { useEffect } from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const maxWidth = Math.min(screenWidth, 375);

interface NewOrderModalProps {
    visible: boolean;
    onDismiss: () => void;
    onAccept: () => void;
    onReject: () => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
    visible,
    onDismiss,
    onAccept,
    onReject,
}) => {
    const slideAnim = new Animated.Value(screenHeight);
    const translateX = new Animated.Value(0);
    const scale = new Animated.Value(1);

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 300,
                friction: 30,
            }).start();
            // Start pulse animation
            const pulseAnim = Animated.loop(
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnim.start();
            return () => pulseAnim.stop();
        } else {
            Animated.timing(slideAnim, {
                toValue: screenHeight,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.setValue(event.translationX);
        })
        .onEnd((event) => {
            const { translationX } = event;
            if (translationX > 100) {
                // Swipe right - Accept
                Animated.spring(translateX, {
                    toValue: 300,
                    useNativeDriver: true,
                }).start(() => {
                    translateX.setValue(0);
                    onAccept();
                });
            } else if (translationX < -100) {
                // Swipe left - Reject
                Animated.spring(translateX, {
                    toValue: -300,
                    useNativeDriver: true,
                }).start(() => {
                    translateX.setValue(0);
                    onReject();
                });
            } else {
                // Return to center
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        });

    if (!visible) {
        return null;
    }

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Handle */}
                    <TouchableOpacity style={styles.handleContainer} onPress={onDismiss}>
                        <View style={styles.handle} />
                    </TouchableOpacity>

                    {/* Profile Header */}
                    <View style={styles.header}>
                        <View style={styles.contentCenter}>
                            <View style={styles.logoWrapper}>
                                <Image
                                    style={styles.logo}
                                    source={{
                                        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjbhdYJjg3w9wtSBEohKeeLh5ygbAtzWshh2rN_739aiz-5MEBZQ5piQhUJLCZ0v_K1xUOzLNjlnFRvcU5qHTv37NEXvgAW4tCF8wd26Pvpw21msSd7DgtiLvNe0vzlSdUqMgL-L3r3wKVCRPIu_qmqCKlNvUKET-zFYsZ52jT_BtyZqWKr6vD6_w46TAA4LWXTxfHngxVVxukrydvfiqkWO-hhziy1sFYM6SNZCL61yEk7_ukzigsK0zLuf0NLppPPdmskfD7Qnk-',
                                    }}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.titleWrapper}>
                                <Text style={styles.title}>New Order</Text>
                                <Text style={styles.subtitle}>The Gourmet Kitchen</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description List */}
                    <View style={styles.descriptionGrid}>
                        <View style={[styles.descriptionItem, styles.prItem]}>
                            <Text style={styles.label}>Customer</Text>
                            <Text style={styles.value}>Alex Doe, Downtown</Text>
                        </View>
                        <View style={[styles.descriptionItem, styles.plItem]}>
                            <Text style={styles.label}>Order Value</Text>
                            <Text style={styles.value}>₹640</Text>
                        </View>
                        <View style={[styles.descriptionItem, styles.prItem]}>
                            <Text style={styles.label}>Items</Text>
                            <Text style={styles.value}>3 items</Text>
                        </View>
                        <View style={[styles.descriptionItem, styles.plItem]}>
                            <Text style={styles.label}>Pickup Time</Text>
                            <Text style={styles.value}>In 15 minutes</Text>
                        </View>
                    </View>

                    {/* Countdown */}
                    <Text style={styles.countdown}>15s left to respond</Text>

                    {/* Swipe to Accept/Reject */}
                    <View style={styles.sliderWrapper}>
                        <View style={styles.sliderOuter}>
                            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
                                <MaterialIcons name="close" size={32} color={COLORS.danger} />
                            </TouchableOpacity>
                            <GestureDetector gesture={pan}>
                                <Animated.View
                                    style={[
                                        styles.sliderHandleWrapper,
                                        {
                                            transform: [{ translateX }],
                                        },
                                    ]}
                                >
                                    <Animated.View
                                        style={[
                                            {
                                                transform: [{ scale }],
                                            },
                                        ]}
                                    >
                                        <View style={styles.sliderHandle} />
                                        <MaterialIcons
                                            name="phone-in-talk"
                                            size={40}
                                            color={COLORS.white}
                                        />
                                    </Animated.View>
                                </Animated.View>
                            </GestureDetector>
                            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                                <MaterialIcons name="check" size={32} color="#22C55E" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: '100%',
        maxWidth,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    handleContainer: {
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 4,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
    },
    header: {
        padding: 16,
    },
    contentCenter: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 128,
        height: 128,
        borderRadius: 64,
    },
    titleWrapper: {
        alignItems: 'center',
        gap: 4,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 28,
        letterSpacing: -1,
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.muted,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    descriptionGrid: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    descriptionItem: {
        flex: 1,
        minWidth: '50%',
        flexDirection: 'column',
        gap: 4,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E5E9',
    },
    prItem: {
        paddingRight: 8,
    },
    plItem: {
        paddingLeft: 8,
    },
    label: {
        color: COLORS.muted,
        fontSize: 12,
        lineHeight: 16,
    },
    value: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    countdown: {
        color: COLORS.muted,
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
        paddingTop: 4,
        paddingBottom: 4,
        paddingHorizontal: 16,
    },
    sliderWrapper: {
        width: '100%',
        padding: 16,
        paddingBottom: 32,
    },
    sliderOuter: {
        position: 'relative',
        flexDirection: 'row',
        height: 80,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 40,
        backgroundColor: '#E5E7EB',
        padding: 8,
    },
    rejectButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.danger + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#22C55E20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderHandleWrapper: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -40,
        marginTop: -40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 4,
        borderColor: COLORS.background,
    },
    sliderHandle: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primary,
    },
});

export default NewOrderModal;