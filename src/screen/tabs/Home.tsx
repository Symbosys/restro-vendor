import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Error from '../../components/ui/error/Error';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

// Import from module
import { EVENT_TYPES } from '../../constants/event.constant';
import {
    HomeHeader,
    OfflineView,
    OrderCard,
    OrderDetailModal,
    OrderTabs,
    StoreStatus,
    styles,
    TodaySummary,
    useHome
} from '../../module/tabs/home';
import { handleNewOrder } from '../../socket/handlers/order.handler';
import { wsService } from '../../socket/websocket.service';
import { BroadcastStatus } from '../../types/order.types';
import { CalculateDistance } from '../../utils/utils';

const VendorDashboard = ({ navigation }: AppNavigation) => {
    const queryClient = useQueryClient();
    const {
        storeOpen,
        activeTab,
        setActiveTab,
        modalVisible,
        setModalVisible,
        selectedOrder,
        setSelectedOrder,
        tabs,
        broadcasts,
        isLoading,
        isFetching,
        isFetchingNextPage,
        error,
        handleOrderPress,
        handleEndReached,
        handleOrderAction,
        handleToggleStore,
        handleRefresh,
        refetchBroadcasts,
        refetchVendor,
        vendor
    } = useHome();

    useEffect(() => {
        const handler = (msg: any) => {
            const newBroadcast = handleNewOrder(queryClient, msg);
            if (newBroadcast) {
                // Ensure we open the modal with the new state
                setModalVisible(true);
            }
        };
        wsService.on(EVENT_TYPES.NEW_ORDER, handler);
        return () => wsService.off(EVENT_TYPES.NEW_ORDER, handler);
    }, [queryClient, setModalVisible]);

    const pendingOrders = broadcasts.filter(b => b.status === BroadcastStatus.PENDING);

    const renderEmptyComponent = useCallback(() => {
        if (isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                    <Icon name="shopping-basket" size={50} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptySubtitle}>We couldn't find any orders for this category today. Stay tuned!</Text>
            </View>
        );
    }, [isLoading]);

    if (error) {
        return (
            <Error error={error} onRefresh={() => {
                refetchBroadcasts();
                refetchVendor();
            }} />
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            {!storeOpen ? (
                <OfflineView onGoOnline={handleToggleStore} />
            ) : (
                <>
                    <HomeHeader navigation={navigation} />

                    <FlatList
                        data={Array.from(new Map(broadcasts.map(b => [b.id, b])).values())}
                        renderItem={({ item }) => {
                            const addressCoords = item.order.address
                                ? { latitude: item.order.address.latitude, longitude: item.order.address.longitude }
                                : null;
                            const vendorCoords = vendor
                                ? { latitude: vendor.latitude, longitude: vendor.longitude }
                                : null;
                            const distance = (vendorCoords && addressCoords)
                                ? CalculateDistance(vendorCoords, addressCoords)
                                : undefined;

                            return (
                                <OrderCard
                                    item={item}
                                    onPress={handleOrderPress}
                                    onAction={handleOrderAction}
                                    distance={distance}
                                />
                            );
                        }}
                        keyExtractor={(item) => item.id}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.01}
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.content}
                        ListHeaderComponent={
                            <View>
                                <StoreStatus storeOpen={storeOpen} onToggle={handleToggleStore} />
                                <TodaySummary />
                                <OrderTabs
                                    tabs={tabs}
                                    activeTab={activeTab}
                                    onTabPress={setActiveTab}
                                />
                            </View>
                        }
                        ListEmptyComponent={renderEmptyComponent}
                        ListFooterComponent={
                            <View>
                                {isFetchingNextPage && <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 20 }} />}
                                <View style={{ height: 80 }} />
                            </View>
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching && !isFetchingNextPage}
                                onRefresh={handleRefresh}
                                colors={[COLORS.primary]}
                                tintColor={COLORS.primary}
                            />
                        }
                    />
                </>
            )}

            {modalVisible && (pendingOrders.length > 0 || selectedOrder) && (
                <OrderDetailModal
                    orders={pendingOrders.length > 0 ? pendingOrders : (selectedOrder ? [selectedOrder] : [])}
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </SafeAreaView>
    );
};

export default VendorDashboard;