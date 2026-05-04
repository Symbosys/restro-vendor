import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Error from '../../components/ui/error/Error';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

// Import from module
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

const VendorDashboard = ({ navigation }: AppNavigation) => {
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

    console.log("broadcasts", broadcasts);

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

                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={handleRefresh}
                                colors={[COLORS.primary]}
                                tintColor={COLORS.primary}
                            />
                        }
                    >
                        <StoreStatus storeOpen={storeOpen} onToggle={handleToggleStore} />

                        <TodaySummary />

                        <OrderTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabPress={setActiveTab}
                        />

                        <FlatList
                            scrollEnabled={false}
                            data={broadcasts}
                            renderItem={({ item }) => (
                                <OrderCard 
                                    item={item} 
                                    onPress={handleOrderPress} 
                                    onAction={handleOrderAction}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            onEndReached={handleEndReached}
                            onEndReachedThreshold={0.1}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.mainContent}
                            ListEmptyComponent={renderEmptyComponent}
                            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 20 }} /> : null}
                        />

                        <View style={{ height: 60 }} />
                    </ScrollView>
                </>
            )}

            {/* {modalVisible && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedOrder(null);
                    }}
                    onAction={handleOrderAction}
                />
            )} */}
        </SafeAreaView>
    );
};

export default VendorDashboard;