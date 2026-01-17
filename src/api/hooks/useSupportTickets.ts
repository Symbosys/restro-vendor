import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import api from "../api";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";

// Types based on backend schema
export interface TicketAttachment {
    public_id: string;
    url: string;
}

export interface SupportTicket {
    id: string;
    ticketNumber: string;
    category: 'ORDER_ISSUE' | 'PAYMENT_ISSUE' | 'DELIVERY_ISSUE' | 'ACCOUNT_ISSUE' | 'TECHNICAL_ISSUE' | 'FEEDBACK' | 'COMPLAINT' | 'INQUIRY' | 'BUG' | 'OTHER';
    subject: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_RESPONSE' | 'RESOLVED' | 'CLOSED';
    attachments?: TicketAttachment;
    orderId?: string;
    source?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    feedbackRating?: number;
    feedbackComment?: string;
}

export interface CreateTicketData {
    category: string;
    subject: string;
    description: string;
    priority?: string;
    orderId?: string;
    source?: string;
    image?: {
        uri: string;
        type: string;
        name: string;
    };
}

export interface AddMessageData {
    message: string;
    image?: {
        uri: string;
        type: string;
        name: string;
    };
}

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface TicketsResponse {
    tickets: SupportTicket[];
    pagination: Pagination;
}

export interface UpdateTicketData {
    subject?: string;
    description?: string;
    category?: string;
    priority?: string;
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderType: 'USER' | 'ADMIN';
    senderId: string;
    isAdminReply: boolean;
    message: string;
    attachments: TicketAttachment | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// Create ticket with optional image upload
const createTicket = async (ticketData: CreateTicketData): Promise<SupportTicket> => {
    const formData = new FormData();
    
    formData.append('category', ticketData.category);
    formData.append('subject', ticketData.subject);
    formData.append('description', ticketData.description);
    formData.append('priority', ticketData.priority || 'MEDIUM');
    formData.append('source', ticketData.source || 'MOBILE_APP');
    
    if (ticketData.orderId) {
        formData.append('orderId', ticketData.orderId);
    }
    
    if (ticketData.image) {
        formData.append('image', {
            uri: ticketData.image.uri,
            type: ticketData.image.type,
            name: ticketData.image.name,
        } as any);
    }
    
    const { data } = await api.post('/support/user/tickets/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return data.data;
};

// Get all user tickets
// Get all user tickets
const getAllTickets = async ({ pageParam = 1 }: { pageParam?: any }): Promise<TicketsResponse> => {
    const { data } = await api.get(`/support/user/tickets/all?page=${pageParam}&limit=10`);
    return data.data;
};

// Get ticket by ID
const getTicketById = async (id: string): Promise<SupportTicket> => {
    const { data } = await api.get(`/support/user/tickets/${id}`);
    return data.data;
};

// Get ticket stats
const getTicketStats = async (): Promise<TicketStats> => {
    const { data } = await api.get('/support/user/tickets/stats');
    return data.data;
};

// Add message to ticket
const addMessage = async ({ ticketId, messageData }: { ticketId: string; messageData: AddMessageData }): Promise<any> => {
    const formData = new FormData();
    
    formData.append('message', messageData.message);
    
    if (messageData.image) {
        formData.append('image', {
            uri: messageData.image.uri,
            type: messageData.image.type,
            name: messageData.image.name,
        } as any);
    }
    
    const { data } = await api.post(`/support/user/tickets/${ticketId}/message`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return data.data;
};

// Reopen ticket
const reopenTicket = async ({ ticketId, reason }: { ticketId: string; reason: string }): Promise<SupportTicket> => {
    const { data } = await api.post(`/support/user/tickets/${ticketId}/reopen`, { reason });
    return data.data;
};

// Submit feedback
const submitFeedback = async ({ ticketId, rating, comment }: { ticketId: string; rating: number; comment?: string }): Promise<SupportTicket> => {
    const { data } = await api.post(`/support/user/tickets/${ticketId}/feedback`, {
        rating,
        comment,
    });
    return data.data;
};

// Close ticket
const closeTicket = async (ticketId: string): Promise<SupportTicket> => {
    const { data } = await api.post(`/support/user/tickets/${ticketId}/close`);
    return data.data;
};

// Update ticket
const updateTicket = async ({ ticketId, ticketData }: { ticketId: string; ticketData: UpdateTicketData }): Promise<SupportTicket> => {
    const { data } = await api.put(`/support/user/tickets/${ticketId}`, ticketData);
    return data.data;
};

// Get all messages by ticket ID
const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
    const { data } = await api.get(`/support/user/tickets/${ticketId}/messages`);
    return data.data.messages;
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const useCreateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation<SupportTicket, Error, CreateTicketData>({
        mutationFn: createTicket,
        onSuccess: () => {
            SuccessMessage('Support ticket created successfully');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
        },
        onError: (error) => {
            ErrorMessage(error);
        },
    });
};

export const useGetAllTickets = () => {
    return useInfiniteQuery<TicketsResponse, Error>({
        queryKey: ['tickets'],
        queryFn: getAllTickets,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
    });
};

export const useGetTicketById = (id: string, enabled: boolean = true) => {
    return useQuery<SupportTicket, Error>({
        queryKey: ['ticket', id],
        queryFn: () => getTicketById(id),
        enabled: enabled && !!id,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

export const useGetTicketStats = () => {
    return useQuery<TicketStats, Error>({
        queryKey: ['ticketStats'],
        queryFn: getTicketStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation<SupportTicket, Error, { ticketId: string; ticketData: UpdateTicketData }>({
        mutationFn: updateTicket,
        onSuccess: (_, variables) => {
            SuccessMessage('Ticket updated successfully');
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: (error) => {
            ErrorMessage(error);
        },
    });
};

export const useGetTicketMessages = (ticketId: string, enabled: boolean = true) => {
    return useQuery<TicketMessage[], Error>({
        queryKey: ['ticketMessages', ticketId],
        queryFn: () => getTicketMessages(ticketId),
        enabled: enabled && !!ticketId,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

export const useAddMessage = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, { ticketId: string; messageData: AddMessageData }>({
        mutationFn: addMessage,
        onSuccess: (_, variables) => {
            SuccessMessage('Message sent successfully');
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['ticketMessages', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: (error) => {
            ErrorMessage(error);
        },
    });
};

export const useReopenTicket = () => {
    const queryClient = useQueryClient();

    return useMutation<SupportTicket, Error, { ticketId: string; reason: string }>({
        mutationFn: reopenTicket,
        onSuccess: (_, variables) => {
            SuccessMessage('Ticket reopened successfully');
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
        },
        onError: (error) => {
            ErrorMessage(error);
        },
    });
};

export const useSubmitFeedback = () => {
    const queryClient = useQueryClient();

    return useMutation<SupportTicket, Error, { ticketId: string; rating: number; comment?: string }>({
        mutationFn: submitFeedback,
        onSuccess: () => {
            SuccessMessage('Feedback submitted successfully');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: (error) => {
            ErrorMessage(error);
        },
    });
};

export const useCloseTicket = () => {
    const queryClient = useQueryClient();

    return useMutation<SupportTicket, Error, string>({
        mutationFn: closeTicket,
        onSuccess: () => {
            SuccessMessage('Ticket closed successfully');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
        },
        onError: (error: any) => {
            ErrorMessage(error?.response?.data?.message || error.message || 'Failed to close ticket');
        },
    });
};
