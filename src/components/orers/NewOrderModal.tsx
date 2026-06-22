import React, { useEffect } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../../theme/color';
import { parseToDecimal, getVendorOrderTotal, CalculateDistance } from '../../utils/utils';
import { useVendorById } from '../../hooks/useVendorQueries';
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const maxWidth = Math.min(screenWidth, 375);
interface NewOrderModalProps {
    visible: boolean;
    currentOrder?: any;
    onDismiss: () => void;
    onAccept: () => Promise<void>;
    onReject: () => void;
}
const NewOrderModal: React.FC<NewOrderModalProps> = ({
    visible,
    currentOrder,
    onDismiss,
    onAccept,
    onReject,
}) => {
    const slideAnim = new Animated.Value(screenHeight);
    const translateX = new Animated.Value(0);
    const scale = new Animated.Value(1);
    const { data: vendor } = useVendorById();
    
    // Dynamic values from currentOrder
    const customer = currentOrder ? `${currentOrder.address.receiverName}, ${currentOrder.address.mainAddress}` : 'Alex Doe, Downtown';

    const addressCoords = currentOrder?.address
        ? { latitude: currentOrder.address.latitude, longitude: currentOrder.address.longitude }
        : null;
    const vendorCoords = vendor
        ? { latitude: vendor.latitude, longitude: vendor.longitude }
        : null;
    const distance = (vendorCoords && addressCoords)
        ? CalculateDistance(vendorCoords, addressCoords)
        : undefined;

    const orderValue = getVendorOrderTotal(currentOrder);
    const pickupTime = 'In 15 minutes'; // Hardcoded for now; can be dynamic if ETA available
    const subtitle = distance !== undefined && distance > 0 
        ? `Incoming Order • ${distance.toFixed(2)} km`
        : 'Incoming Order';
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
                                <Text style={styles.subtitle}>{subtitle}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Description List */}
                    <View style={styles.descriptionGrid}>
                        <View style={[styles.descriptionItem, styles.prItem]}>
                            <Text style={styles.label}>Customer</Text>
                            <Text style={styles.value} numberOfLines={1}>{customer}</Text>
                        </View>
                        <View style={[styles.descriptionItem, styles.plItem]}>
                            <Text style={styles.label}>Order Value</Text>
                            <Text style={styles.value}>₹{orderValue.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.descriptionItem, styles.prItem]}>
                            <Text style={styles.label}>Items</Text>
                            {currentOrder?.items?.map((item: any, index: number) => (
                                <Text key={index} style={styles.value} numberOfLines={1}>
                                    {item.quantity} x {item.product?.name?.trim() || 'Unknown Item'} {item.product?.weight ? `(${item.product.weight})` : ''}
                                </Text>
                            )) || <Text style={styles.value}>No items</Text>}
                        </View>
                        <View style={[styles.descriptionItem, styles.plItem]}>
                            <Text style={styles.label}>Pickup Time</Text>
                            <Text style={styles.value}>{pickupTime}</Text>
                        </View>
                    </View>
                    {/* Countdown */}
                    <Text style={styles.countdown}>15s left to respond</Text>
                    {/* Accept/Reject Buttons */}
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={onReject}
                        >
                            <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={onAccept}
                        >
                            <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
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
    buttonWrapper: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 32,
        gap: 16,
    },
    rejectButton: {
        flex: 1,
        height: 56,
        backgroundColor: COLORS.danger,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rejectButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        height: 56,
        backgroundColor: '#22C55E',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    acceptButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
});
export default NewOrderModal;