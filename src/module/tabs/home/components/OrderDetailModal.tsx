import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatDistanceToNow } from 'date-fns';
import { VendorBroadcastItem, OrderStatus, BroadcastStatus } from '../../../../types/order.types';
import { modalStyles } from '../styles/homeStyles';
import { COLORS } from '../../../../theme/color';

interface OrderModalProps {
    order: VendorBroadcastItem;
    visible: boolean;
    onClose: () => void;
    onAction?: (action: 'accept' | 'reject' | 'markReady', orderId: string) => void;
}

const OrderDetailModal: React.FC<OrderModalProps> = ({ order: broadcast, visible, onClose, onAction }) => {
    const { order } = broadcast;
    const [countdown, setCountdown] = useState(15);

    // 15-second countdown timer - auto close modal
    useEffect(() => {
        if (!visible) {
            setCountdown(15);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [visible, onClose]);

    const handleAction = (action: 'accept' | 'reject' | 'markReady') => {
        onAction?.(action, order.id);
        onClose();
    };

    if (!visible) return null;

    const getStatusTheme = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.VENDOR_PENDING:
                return { color: '#10b981', label: 'NEW ORDER' };
            case OrderStatus.PREPARING:
                return { color: '#f59e0b', label: 'PREPARING' };
            case OrderStatus.READY_FOR_PICKUP:
                return { color: COLORS.primary, label: 'READY' };
            case OrderStatus.DELIVERED:
                return { color: '#64748b', label: 'DELIVERED' };
            default:
                return { color: '#64748b', label: status };
        }
    };

    const theme = getStatusTheme(order.status);
    const isNewOrder = broadcast.status === BroadcastStatus.PENDING;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    {/* Premium Header */}
                    <View style={[modalStyles.header, { borderLeftColor: theme.color }]}>
                        <View style={modalStyles.headerTop}>
                            <View style={modalStyles.handleBar} />
                        </View>
                        <View style={modalStyles.headerMain}>
                            <View style={modalStyles.headerInfo}>
                                <View style={modalStyles.orderIdRow}>
                                    <Text style={modalStyles.orderLabel}>Order</Text>
                                    <Text style={modalStyles.orderId}>#{order.orderNumber}</Text>
                                </View>
                                <Text style={modalStyles.orderTimestamp}>
                                    {formatDistanceToNow(new Date(order.timestamps.placedAt), { addSuffix: true })}
                                </Text>
                            </View>
                            <View style={modalStyles.headerActions}>
                                {/* Countdown Timer */}
                                <View style={[modalStyles.countdownCircle, { borderColor: theme.color }]}>
                                    <Text style={[modalStyles.countdownText, { color: theme.color }]}>{countdown}</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
                                    <Icon name="close" size={24} color="#1e293b" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* Status Stripe */}
                        <View style={[modalStyles.statusStrip, { backgroundColor: theme.color }]}>
                            {isNewOrder && <View style={modalStyles.pulsingDot} />}
                            <Text style={modalStyles.statusText}>{theme.label}</Text>
                        </View>
                    </View>

                    <ScrollView
                        style={modalStyles.body}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={modalStyles.bodyContent}
                    >
                        {/* Order Items Section */}
                        <View style={modalStyles.card}>
                            <View style={modalStyles.cardHeader}>
                                <Icon name="shopping-basket" size={22} color="#1e293b" />
                                <Text style={modalStyles.cardTitle}>Order Items</Text>
                                <View style={modalStyles.badge}>
                                    <Text style={modalStyles.badgeText}>{order.items.length}</Text>
                                </View>
                            </View>
                            <View style={modalStyles.cardBody}>
                                {order.items.map((item, index) => (
                                    <View
                                        key={item.id}
                                        style={[
                                            modalStyles.itemRow,
                                            index !== order.items.length - 1 && modalStyles.itemRowBorder
                                        ]}
                                    >
                                        <View style={[modalStyles.itemIcon, { backgroundColor: theme.color + '15' }]}>
                                            <Icon name="restaurant" size={20} color={theme.color} />
                                        </View>
                                        <View style={modalStyles.itemDetails}>
                                            <Text style={modalStyles.itemName} numberOfLines={1}>{item.product.name}</Text>
                                            <Text style={modalStyles.itemMeta}>Quantity: {item.quantity}</Text>
                                        </View>
                                        <Text style={modalStyles.itemPrice}>₹{item.totalPrice.toFixed(0)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Order Summary Section */}
                        <View style={modalStyles.card}>
                            <View style={modalStyles.cardHeader}>
                                <Icon name="payments" size={22} color="#1e293b" />
                                <Text style={modalStyles.cardTitle}>Bill Summary</Text>
                            </View>
                            <View style={modalStyles.cardBody}>
                                <View style={modalStyles.summaryLine}>
                                    <Text style={modalStyles.summaryLabel}>Item Total</Text>
                                    <Text style={modalStyles.summaryValue}>₹{order.subtotal.toFixed(0)}</Text>
                                </View>
                                {/* <View style={modalStyles.summaryLine}>
                                    <Text style={modalStyles.summaryLabel}>Delivery Fee</Text>
                                    <Text style={modalStyles.summaryValue}>₹{order.deliveryFee.toFixed(0)}</Text>
                                </View> */}
                                <View style={modalStyles.totalLine}>
                                    <Text style={modalStyles.totalLabel}>Grand Total</Text>
                                    <Text style={[modalStyles.totalAmount, { color: theme.color }]}>
                                        ₹{order.paidAmount?.toFixed(0) || (order.subtotal + order.deliveryFee).toFixed(0)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Customer Info Placeholder - to make card look fuller */}
                        <View style={modalStyles.card}>
                            {/* <View style={modalStyles.cardHeader}>
                                <Icon name="person" size={22} color="#1e293b" />
                                <Text style={modalStyles.cardTitle}>Customer Information</Text>
                            </View>
                            <View style={modalStyles.cardBody}>
                                <View style={modalStyles.summaryLine}>
                                    <Text style={modalStyles.summaryLabel}>Name</Text>
                                    <Text style={modalStyles.summaryValue}>John Doe</Text>
                                </View>
                                <View style={modalStyles.summaryLine}>
                                    <Text style={modalStyles.summaryLabel}>Delivery at</Text>
                                    <Text style={modalStyles.summaryValue} numberOfLines={1}>24, Greens Park, Mumbai</Text>
                                </View>
                            </View> */}
                        </View>

                        {/* Action Buttons */}
                        {(isNewOrder || order.status === OrderStatus.PREPARING) && (
                            <View style={modalStyles.actionsCard}>
                                {isNewOrder ? (
                                    <View style={modalStyles.actionRow}>
                                        <TouchableOpacity
                                            style={modalStyles.declineBtn}
                                            onPress={() => handleAction('reject')}
                                            activeOpacity={0.8}
                                        >
                                            <Icon name="close" size={22} color="#e11d48" />
                                            <Text style={modalStyles.declineBtnText}>Decline</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[modalStyles.acceptBtn, { backgroundColor: theme.color }]}
                                            onPress={() => handleAction('accept')}
                                            activeOpacity={0.8}
                                        >
                                            <Icon name="check" size={22} color="#fff" />
                                            <Text style={modalStyles.acceptBtnText}>Accept Order</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[modalStyles.fullBtn, { backgroundColor: theme.color }]}
                                        onPress={() => handleAction('markReady')}
                                        activeOpacity={0.8}
                                    >
                                        <Icon name="check-circle" size={24} color="#fff" />
                                        <Text style={modalStyles.fullBtnText}>Mark Ready for Pickup</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default OrderDetailModal;
