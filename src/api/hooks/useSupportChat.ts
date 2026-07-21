import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";

export interface ChatMessage {
    id: string;
    sessionId: string;
    senderType: 'USER' | 'VENDOR' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SYSTEM_BOT';
    messageText: string;
    cardType?: string;
    cardData?: any;
    createdAt: string;
}

export interface SupportChatSession {
    id: string;
    sessionId: string;
    chatType: string;
    status: string;
    escalationCount: number;
    isEscalated: boolean;
    orderId?: string;
    messages: ChatMessage[];
    order?: any;
}

/**
 * Hook to initialize or retrieve vendor support chat session
 */
export const useInitVendorSupportChatSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { orderId?: string; vendorId?: string; chatType?: string }) => {
            const { data } = await api.post('/support/chat/session/init', {
                ...params,
                initiatorType: 'VENDOR',
            });
            return data.data as SupportChatSession;
        },
        onSuccess: (session) => {
            queryClient.invalidateQueries({ queryKey: ['vendor-support-chat-history'] });
        },
    });
};

/**
 * Hook to fetch vendor support chat history
 */
export const useVendorSupportChatHistory = (orderId?: string, sessionId?: string) => {
    const identifier = sessionId || orderId || 'VENDOR_GENERAL';

    return useQuery({
        queryKey: ['vendor-support-chat-history', identifier],
        queryFn: async () => {
            const { data } = await api.get('/support/chat/history', {
                params: { orderId, sessionId },
            });
            return data.data as SupportChatSession;
        },
        refetchInterval: 5000, // Poll for agent messages when escalated
    });
};

/**
 * Hook to send a message in vendor support chat
 */
export const useSendVendorSupportChatMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            sessionId: string;
            messageText: string;
            cardType?: string;
            cardData?: any;
        }) => {
            const { data } = await api.post('/support/chat/message/send', {
                ...params,
                senderType: 'VENDOR',
            });
            return data.data as SupportChatSession;
        },
        onSuccess: (session) => {
            queryClient.setQueryData(['vendor-support-chat-history', session.sessionId], session);
            if (session.orderId) {
                queryClient.setQueryData(['vendor-support-chat-history', session.orderId], session);
            }
            queryClient.invalidateQueries({ queryKey: ['vendor-support-chat-history'] });
        },
    });
};

/**
 * Hook to resolve vendor support chat session
 */
export const useResolveVendorSupportChatSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { sessionId: string; feedbackRating?: number; feedbackComment?: string }) => {
            const { data } = await api.post('/support/chat/session/resolve', params);
            return data.data as SupportChatSession;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-support-chat-history'] });
        },
    });
};
