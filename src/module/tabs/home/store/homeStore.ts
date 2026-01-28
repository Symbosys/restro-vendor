import { create } from 'zustand';
import { VendorBroadcastItem } from '../../../../types/order.types';

interface HomeState {
    storeOpen: string | boolean;
    activeTab: 'all' | 'new' | 'preparing' | 'ready' | 'delivered';
    modalVisible: boolean;
    selectedOrder: VendorBroadcastItem | null;

    // Actions
    setStoreOpen: (isOpen: string | boolean) => void;
    setActiveTab: (tab: 'all' | 'new' | 'preparing' | 'ready' | 'delivered') => void;
    setModalVisible: (visible: boolean) => void;
    setSelectedOrder: (order: VendorBroadcastItem | null) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
    storeOpen: true,
    activeTab: 'all',
    modalVisible: false,
    selectedOrder: null,

    setStoreOpen: (isOpen) => set({ storeOpen: isOpen }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setModalVisible: (visible) => set({ modalVisible: visible }),
    setSelectedOrder: (order) => set({ selectedOrder: order }),
}));
