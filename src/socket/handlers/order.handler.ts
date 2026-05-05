import { QueryClient } from "@tanstack/react-query";
import { VendorBroadcastItem, BroadcastStatus, OrderSnapshot } from "../../types/order.types";

/**
 * Handler for the 'new_order' WebSocket event.
 * Injects the incoming order into the React Query cache for real-time UI updates.
 * 
 * @param queryClient - The TanStack Query client instance
 * @param msg - The WebSocket message payload
 */
export const handleNewOrder = (queryClient: QueryClient, msg: any): VendorBroadcastItem | null => {
    if (!msg?.data) return null;
    
    console.log('📡 [WS] New Order Received:', msg.data.orderNumber);

    const newBroadcast: VendorBroadcastItem = {
        id: `ws-${msg.data.id}-${Date.now()}`,
        orderId: msg.data.id,
        vendorId: msg.data.vendorId || '',
        status: BroadcastStatus.PENDING,
        notifiedAt: new Date().toISOString(),
        order: msg.data as unknown as OrderSnapshot
    };

    // 🚀 Update all caches starting with "vendorBroadcastedOrders"
    queryClient.setQueriesData({ queryKey: ['vendorBroadcastedOrders'] }, (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;

        return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
                if (index === 0) {
                    const exists = page.data.broadcasts.some((b: any) => b.order?.id === msg.data.id);
                    if (exists) return page;

                    return {
                        ...page,
                        data: {
                            ...page.data,
                            broadcasts: [newBroadcast, ...page.data.broadcasts]
                        }
                    };
                }
                return page;
            })
        };
    });

    return newBroadcast;
};
