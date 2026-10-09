import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useOrderDetails } from '../../api/hooks/order';
import {
  AcceptOrderButton,
  MarkReadyButton,
  RejectOrderButton,
} from '../../components/orers/order.action';
import { EVENT_TYPES } from '../../constants/event.constant';
import { useAuth } from '../../context/AuthContext';
import { useVendorById } from '../../hooks/useVendorQueries';
import { wsService } from '../../socket/websocket.service';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import {
  CalculateDistance,
  getVendorOrderTotal,
  parseToDecimal,
} from '../../utils/utils';

const OrderDetailsScreen = ({ navigation, route }: AppNavigation) => {
  const { orderId } = route.params || {};
  console.log('order id : => ', orderId);
  const {
    data: order,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useOrderDetails({ id: orderId });
  const { vendorId } = useAuth();
  const { data: vendor } = useVendorById();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const isAssigned = !!(
    order?.orderVendorAssignments?.vendorId &&
    String(order.orderVendorAssignments.vendorId) === String(vendorId)
  );

  React.useEffect(() => {
    const handleWsEvent = (event: any) => {
      console.log(
        '📬 WebSocket event received on vendor OrderDetails screen:',
        event,
      );
      const eventOrderId = event?.data?.orderId;
      const eventOrderNumber = event?.data?.orderNumber;

      // Invalidate if the event refers to the current order being viewed
      const isMatchingId = orderId && String(eventOrderId) === String(orderId);
      const isMatchingFetchedId =
        order?.id && String(eventOrderId) === String(order.id);
      const isMatchingFetchedNumber =
        order?.orderNumber &&
        String(eventOrderNumber) === String(order.orderNumber);

      if (isMatchingId || isMatchingFetchedId || isMatchingFetchedNumber) {
        console.log('🔄 Match found, invalidating order details query cache');
        queryClient.invalidateQueries({ queryKey: ['order-details'] });
        queryClient.invalidateQueries({
          queryKey: ['vendorBroadcastedOrders'],
        });
      }
    };

    const eventsToListen = [
      EVENT_TYPES.DELIVERY_ACCEPTED,
      EVENT_TYPES.ORDER_PICKED_UP,
      EVENT_TYPES.ORDER_DELIVERED,
    ];

    eventsToListen.forEach(eventType => {
      wsService.on(eventType, handleWsEvent);
    });

    return () => {
      eventsToListen.forEach(eventType => {
        wsService.off(eventType, handleWsEvent);
      });
    };
  }, [orderId, order?.id, order?.orderNumber, queryClient]);

  const addressCoords = order?.address
    ? { latitude: order.address.latitude, longitude: order.address.longitude }
    : null;
  const vendorCoords = vendor
    ? { latitude: vendor.latitude, longitude: vendor.longitude }
    : null;
  const distance =
    vendorCoords && addressCoords
      ? CalculateDistance(vendorCoords, addressCoords)
      : undefined;

  console.log('order', order);

  const isRejectedByMe = order?.vendorBroadcasts?.some(
    b => String(b.vendorId) === String(vendorId) && b.status === 'REJECTED',
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.errorCard}>
            <Icon name="error-outline" size={48} color={COLORS.danger} style={{ marginBottom: 12 }} />
            <Text style={styles.errorText}>
              Failed to load order details.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CANCELLED':
        return COLORS.danger;
      case 'DELIVERED':
        return '#22C55E';
      case 'PREPARING':
        return '#F59E0B';
      case 'READY_FOR_PICKUP':
        return COLORS.primary;
      default:
        return '#64748B';
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const safeFormat = (
    dateStr: string | null | undefined,
    formatStr: string,
  ) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return format(date, formatStr);
    } catch (e) {
      return '';
    }
  };

  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';

  return (
    <View style={styles.container}>
      {/* Dynamic Ambient Background Glow Blobs */}
      <View
        style={[
          styles.bgGlowTopRight,
          isDelivered
            ? { backgroundColor: 'rgba(34, 197, 94, 0.12)' }
            : isCancelled
            ? { backgroundColor: 'rgba(255, 159, 163, 0.2)' }
            : null,
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.bgGlowLeft,
          isDelivered
            ? { backgroundColor: 'rgba(240, 253, 244, 0.6)' }
            : isCancelled
            ? { backgroundColor: 'rgba(249, 234, 233, 0.6)' }
            : null,
        ]}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 130 + Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Order Summary Card */}
        <LinearGradient
          colors={
            isDelivered
              ? ['#FFFFFF', '#F4FBF7']
              : isCancelled
              ? ['#FFFFFF', '#FFF5F6']
              : ['#FFFFFF', '#FDF8FF']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.orderSummaryCard,
            isDelivered && {
              borderColor: 'rgba(34, 197, 94, 0.18)',
              shadowColor: '#22C55E',
              shadowOpacity: 0.08,
            },
            isCancelled && {
              borderColor: 'rgba(239, 68, 68, 0.18)',
              shadowColor: COLORS.danger,
              shadowOpacity: 0.08,
            },
          ]}
        >
          <View style={styles.orderSummaryHeader}>
            <View
              style={[
                styles.orderSummaryAccentLine,
                isDelivered && { backgroundColor: '#22C55E' },
                isCancelled && { backgroundColor: COLORS.danger },
              ]}
            />
            <Text style={styles.orderNumber}>
              Order #{order.orderNumber.split('-').pop()}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: `${getStatusColor(order.status)}14` },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {order.status.replace(/_/g, ' ')}
              </Text>
            </View>

            {order.timestamps.estimatedDelivery && (
              <View style={styles.infoChip}>
                <Icon name="schedule" size={14} color={COLORS.primary} />
                <Text style={styles.infoChipText}>
                  Delivery by{' '}
                  {safeFormat(order.timestamps.estimatedDelivery, 'h:mm a')}
                </Text>
              </View>
            )}

            {distance !== undefined && distance > 0 ? (
              <View style={styles.infoChip}>
                <Icon name="location-on" size={15} color={COLORS.primary} />
                <Text style={styles.infoChipText}>
                  {distance.toFixed(2)} km away
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* Delivery Partner Card (if assigned) */}
        {isAssigned && order.orderDeliveryAssignment && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Delivery Partner</Text>
            <LinearGradient
              colors={['#FFFFFF', '#FAFAFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.deliveryCard,
                (isCancelled || isDelivered) && { opacity: 0.85 },
              ]}
            >
              <View style={styles.deliveryInfoRow}>
                <View style={styles.partnerProfile}>
                  <View style={styles.avatarContainer}>
                    {order.orderDeliveryAssignment.deliveryPartner?.image
                      ?.url ? (
                      <Image
                        source={{
                          uri: order.orderDeliveryAssignment.deliveryPartner
                            .image.url,
                        }}
                        style={styles.partnerAvatar}
                      />
                    ) : (
                      <View style={styles.partnerAvatarPlaceholder}>
                        <Icon name="person" size={26} color={COLORS.muted} />
                      </View>
                    )}
                  </View>
                  <View style={styles.partnerDetails}>
                    <Text style={styles.partnerName} numberOfLines={1}>
                      {order.orderDeliveryAssignment.deliveryPartner?.name ||
                        'Assigned'}
                    </Text>
                    <Text style={styles.partnerRole}>Delivery Executive</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    handleCall(
                      order.orderDeliveryAssignment?.deliveryPartner
                        ?.mobile || '',
                    )
                  }
                  activeOpacity={0.8}
                  disabled={isCancelled || isDelivered}
                >
                  <LinearGradient
                    colors={
                      isCancelled || isDelivered
                        ? ['#CBD5E1', '#94A3B8']
                        : [COLORS.primary, COLORS.primaryDark]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.callCircle}
                  >
                    <Icon name="phone" size={20} color={COLORS.white} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {order.orderDeliveryAssignment.pickupOtp && (
                <View style={styles.otpContainer}>
                  <View style={styles.otpInfo}>
                    <View style={styles.otpIconBadge}>
                      <Icon name="vpn-key" size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.otpLabel}>Pickup Code</Text>
                  </View>
                  <View style={styles.otpBadge}>
                    <Text style={styles.otpValue}>
                      {order.orderDeliveryAssignment.pickupOtp}
                    </Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Ordered Items */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ordered Items</Text>
          <View style={styles.itemsCard}>
            <View style={styles.itemsList}>
              {order.items.map((item, index) => {
                const itemVendorPrice =
                  parseToDecimal(item.product?.vendorPrice) ||
                  parseToDecimal(item.unitPrice);
                const imageUrl =
                  (item.product as any)?.images?.[0]?.image?.url ||
                  (item.product as any)?.images?.[0]?.url ||
                  (typeof (item.product as any)?.images?.[0] === 'string'
                    ? (item.product as any).images[0]
                    : null) ||
                  (item.product as any)?.image?.url ||
                  (typeof (item.product as any)?.image === 'string'
                    ? (item.product as any).image
                    : null) ||
                  (item.product as any)?.imageUrl;
                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Icon name="fastfood" size={20} color={COLORS.muted} />
                        </View>
                      )}
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantity}>{item.quantity}x</Text>
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>
                          {item.product.name}
                          {item.product.weight
                            ? ` (${item.product.weight})`
                            : ''}
                          {item.product.pieces
                            ? ` (${item.product.pieces} pcs)`
                            : ''}
                        </Text>
                        {item.notes && (
                          <Text style={styles.itemNote}>{item.notes}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.itemPrice}>
                      ₹
                      {(itemVendorPrice * Number(item.quantity || 0)).toFixed(
                        2,
                      )}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.subtotalDivider} />

            <View style={styles.pricingList}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Item Total</Text>
                <Text style={styles.priceValue}>
                  ₹{getVendorOrderTotal(order).toFixed(2)}
                </Text>
              </View>

              <LinearGradient
                colors={
                  isDelivered
                    ? ['#F0FDF4', '#DCFCE7']
                    : isCancelled
                    ? ['#FFF5F5', '#FFEBEB']
                    : ['#FAF4FE', '#F5EBFD']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.totalRowContainer,
                  isDelivered && { borderColor: 'rgba(34, 197, 94, 0.2)' },
                  isCancelled && { borderColor: 'rgba(239, 68, 68, 0.15)' },
                ]}
              >
                <Text style={styles.totalLabel}>Total Earnings</Text>
                <Text
                  style={[
                    styles.totalValue,
                    isDelivered && { color: '#059669' },
                    isCancelled && { color: COLORS.danger },
                  ]}
                >
                  ₹{getVendorOrderTotal(order).toFixed(2)}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* History / Timeline */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.historyCard}>
            <View style={styles.timelineList}>
              {order.tracking?.map((track, index) => {
                const isLatest = index === 0;
                const isEventCancelled = track.eventType === 'CANCELLED';
                const isEventDelivered =
                  track.eventType === 'DELIVERED' ||
                  track.eventType === 'ORDER_DELIVERED';
                return (
                  <View key={track.id} style={styles.timelineItem}>
                    {isEventDelivered ? (
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.timelineCircleDelivered}
                      >
                        <Icon name="check-circle" size={16} color={COLORS.white} />
                      </LinearGradient>
                    ) : isEventCancelled ? (
                      <LinearGradient
                        colors={['#EF4444', '#F87171']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.timelineCircleCancelled}
                      >
                        <Icon name="close" size={16} color={COLORS.white} />
                      </LinearGradient>
                    ) : isLatest ? (
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.timelineCircleActive}
                      >
                        <Icon name="adjust" size={16} color={COLORS.white} />
                      </LinearGradient>
                    ) : (
                      <View style={styles.timelineCircle}>
                        <Icon name="check" size={15} color={COLORS.primary} />
                      </View>
                    )}

                    {index !== (order.tracking?.length || 0) - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isEventDelivered && {
                            backgroundColor: 'rgba(16, 185, 129, 0.25)',
                          },
                          isEventCancelled && {
                            backgroundColor: 'rgba(239, 68, 68, 0.25)',
                          },
                        ]}
                      />
                    )}

                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineTitle,
                          isEventDelivered && { color: '#059669' },
                          isEventCancelled && { color: COLORS.danger },
                        ]}
                      >
                        {track.eventType.replace(/_/g, ' ')}
                      </Text>
                      <Text style={styles.timelineTime}>
                        {safeFormat(track.timestamp, 'MMM d, h:mm a')}
                      </Text>
                      {track.notes && (
                        <Text
                          style={[
                            styles.itemNote,
                            isEventDelivered && { color: '#047857' },
                            isEventCancelled && { color: '#991B1B' },
                          ]}
                        >
                          {track.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons Floating Footer */}
      {order.status === 'VENDOR_PENDING' && !isRejectedByMe && (
        <View
          style={[
            styles.actionButtonsContainer,
            { paddingBottom: 16 },
          ]}
        >
          <RejectOrderButton orderId={order.id} label="Reject" />
          <AcceptOrderButton orderId={order.id} label="Accept" />
        </View>
      )}

      {order.status === 'PREPARING' && isAssigned && (
        <View
          style={[
            styles.actionButtonsContainer,
            { paddingBottom: 16 },
          ]}
        >
          <MarkReadyButton orderId={order.id} label="Mark As Ready" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Background Ambient Blobs */
  bgGlowTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(181, 143, 240, 0.12)',
  },
  bgGlowLeft: {
    position: 'absolute',
    top: 260,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(249, 234, 233, 0.4)',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },

  /* Loading & Error States */
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
  },
  errorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
    width: '100%',
    maxWidth: 320,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  /* Main Scroll Content */
  main: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },

  /* Order Summary Card */
  orderSummaryCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.1)',
    marginBottom: 8,
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  orderSummaryAccentLine: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  orderNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(135, 25, 198, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  /* Section Containers & Titles */
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 12,
  },

  /* Delivery Partner Card */
  deliveryCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(135, 25, 198, 0.18)',
    padding: 2,
    backgroundColor: COLORS.white,
  },
  partnerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    backgroundColor: '#F5F3F8',
  },
  partnerAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    backgroundColor: '#F5F3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerDetails: {
    marginLeft: 14,
    flex: 1,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  partnerRole: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 3,
    fontWeight: '500',
  },
  callCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  /* OTP Section */
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F5FD',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(135, 25, 198, 0.25)',
    marginTop: 16,
  },
  otpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(135, 25, 198, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  otpBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.12)',
  },
  otpValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },

  /* Ordered Items Card */
  itemsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
  },
  itemsList: {
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F3F8',
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
  },
  productImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(135, 25, 198, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
  },
  quantityBadge: {
    backgroundColor: 'rgba(135, 25, 198, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  itemNote: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subtotalDivider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: 'rgba(135, 25, 198, 0.08)',
  },
  pricingList: {
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  priceLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.12)',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },

  /* Order Timeline Card */
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 25, 198, 0.08)',
  },
  timelineList: {
    gap: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  timelineCircleActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  timelineCircleDelivered: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  timelineCircleCancelled: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  timelineCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(135, 25, 198, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 16,
    top: 34,
    bottom: -20,
    width: 2,
    backgroundColor: 'rgba(135, 25, 198, 0.15)',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  timelineTime: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },

  /* Bottom Floating Action Bar */
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(135, 25, 198, 0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
});

export default OrderDetailsScreen;
