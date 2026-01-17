import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Image,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../theme/color';
import { AppNavigation } from '../../../types/types';
import {
    useGetTicketById,
    useAddMessage,
    useCloseTicket,
    useGetTicketMessages,
    useUpdateTicket,
    useReopenTicket,
    useSubmitFeedback,
    TicketMessage,
    UpdateTicketData
} from '../../../api/hooks/useSupportTickets';
import LinearGradient from 'react-native-linear-gradient';
import { useAlertStore } from '../../../store/alert.store';

const { width, height } = Dimensions.get('window');

const TicketDetailsScreen: React.FC<AppNavigation> = ({ navigation, route }) => {
    const ticketId = route?.params?.ticketId;
    const [message, setMessage] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [editSubject, setEditSubject] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [reopenReason, setReopenReason] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const showAlert = useAlertStore((state) => state.showAlert);

    const { data: ticket, isLoading, error, refetch } = useGetTicketById(ticketId, !!ticketId);
    const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useGetTicketMessages(ticketId, !!ticketId);
    const { mutate: addMessage, isPending: isSendingMessage } = useAddMessage();
    const { mutate: closeTicket, isPending: isClosing } = useCloseTicket();
    const { mutate: updateTicket, isPending: isUpdating } = useUpdateTicket();
    const { mutate: reopenTicket, isPending: isReopening } = useReopenTicket();
    const { mutate: submitFeedback, isPending: isSubmittingFeedback } = useSubmitFeedback();

    useEffect(() => {
        if (ticket) {
            setEditSubject(ticket.subject);
            setEditDescription(ticket.description);
        }
    }, [ticket]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'OPEN':
                return '#3B82F6';
            case 'IN_PROGRESS':
                return '#F59E0B';
            case 'AWAITING_RESPONSE':
                return '#8B5CF6';
            case 'RESOLVED':
                return '#10B981';
            case 'CLOSED':
                return '#6B7280';
            default:
                return '#9CA3AF';
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'OPEN':
                return 'fiber-new';
            case 'IN_PROGRESS':
                return 'hourglass-empty';
            case 'AWAITING_RESPONSE':
                return 'question-answer';
            case 'RESOLVED':
                return 'check-circle';
            case 'CLOSED':
                return 'lock';
            default:
                return 'info';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleImagePress = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setShowImageModal(true);
    };

    const handleSendMessage = () => {
        if (!message.trim()) {
            showAlert({
                title: 'Missing Message',
                message: 'Please enter a message',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        if (message.trim().length < 5) {
            showAlert({
                title: 'Invalid Message',
                message: 'Message must be at least 5 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        addMessage(
            { ticketId, messageData: { message: message.trim() } },
            {
                onSuccess: () => {
                    setMessage('');
                    refetchMessages();
                    refetch();
                },
            }
        );
    };

    const handleCloseTicket = () => {
        showAlert({
            title: 'Mark as Resolved',
            message: 'Are you sure you want to mark this ticket as resolved?',
            confirmText: 'Resolve',
            cancelText: 'Cancel',
            onConfirm: () => {
                closeTicket(ticketId, {
                    onSuccess: () => {
                        refetch();
                        // Show feedback modal after closing
                        setTimeout(() => {
                            setShowFeedbackModal(true);
                        }, 500);
                    },
                });
            },
        });
    };

    const handleReopenTicket = () => {
        setShowReopenModal(true);
    };

    const handleSubmitReopen = () => {
        if (!reopenReason.trim()) {
            showAlert({
                title: 'Reason Required',
                message: 'Please enter a reason for reopening the ticket',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        if (reopenReason.trim().length < 10) {
            showAlert({
                title: 'Invalid Reason',
                message: 'Reason must be at least 10 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        reopenTicket(
            { ticketId, reason: reopenReason.trim() },
            {
                onSuccess: () => {
                    setShowReopenModal(false);
                    setReopenReason('');
                    refetch();
                },
            }
        );
    };

    const handleSubmitFeedback = () => {
        if (feedbackRating === 0) {
            showAlert({
                title: 'Rating Required',
                message: 'Please select a rating',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        submitFeedback(
            {
                ticketId,
                rating: feedbackRating,
                comment: feedbackComment.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setShowFeedbackModal(false);
                    setFeedbackRating(0);
                    setFeedbackComment('');
                    refetch();
                },
            }
        );
    };

    const handleUpdateTicket = () => {
        if (!editSubject.trim() || editSubject.trim().length < 5) {
            showAlert({
                title: 'Invalid Subject',
                message: 'Subject must be at least 5 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        if (!editDescription.trim() || editDescription.trim().length < 10) {
            showAlert({
                title: 'Invalid Description',
                message: 'Description must be at least 10 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        const ticketData: UpdateTicketData = {
            subject: editSubject.trim(),
            description: editDescription.trim(),
        };

        updateTicket(
            { ticketId, ticketData },
            {
                onSuccess: () => {
                    setShowEditModal(false);
                    refetch();
                },
            }
        );
    };

    const renderStarRating = () => {
        return (
            <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setFeedbackRating(star)}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name={star <= feedbackRating ? 'star' : 'star-border'}
                            size={40}
                            color={star <= feedbackRating ? '#F59E0B' : '#D1D5DB'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderMessage = ({ item }: { item: TicketMessage }) => {
        const isUser = item.senderType === 'USER';
        return (
            <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAdmin]}>
                {!isUser && (
                    <View style={styles.adminAvatar}>
                        <Icon name="support-agent" size={20} color={COLORS.white} />
                    </View>
                )}
                <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAdmin]}>
                    <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
                        {item.message}
                    </Text>
                    {item.attachments && (
                        <TouchableOpacity onPress={() => handleImagePress(item.attachments!.url)}>
                            <Image
                                source={{ uri: item.attachments.url }}
                                style={styles.messageImage}
                                resizeMode="cover"
                            />
                            <View style={styles.imageOverlay}>
                                <Icon name="zoom-in" size={20} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>
                    )}
                    <Text style={[styles.messageTime, isUser && styles.messageTimeUser]}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
                {isUser && (
                    <View style={styles.userAvatar}>
                        <Icon name="person" size={20} color={COLORS.white} />
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <LinearGradient
                    colors={[COLORS.primary, '#9B4DCA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Ticket Details</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </LinearGradient>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading ticket...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !ticket) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <LinearGradient
                    colors={[COLORS.primary, '#9B4DCA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Ticket Details</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </LinearGradient>
                <View style={styles.centerContainer}>
                    <View style={styles.errorIconWrapper}>
                        <Icon name="error-outline" size={48} color="#EF4444" />
                    </View>
                    <Text style={styles.errorTitle}>Failed to load ticket</Text>
                    <Text style={styles.errorText}>Please check your connection and try again</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <LinearGradient
                            colors={[COLORS.primary, '#9B4DCA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.retryButtonGradient}
                        >
                            <Icon name="refresh" size={18} color={COLORS.white} />
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const canInteract = ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED';
    const canReopen = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';
    const hasFeedback = ticket.feedbackRating !== undefined && ticket.feedbackRating !== null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, '#9B4DCA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{ticket.ticketNumber}</Text>
                    <View style={[styles.headerStatusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                        <Icon name={getStatusIcon(ticket.status)} size={12} color={COLORS.white} />
                        <Text style={styles.headerStatusText}>{ticket.status.replace('_', ' ')}</Text>
                    </View>
                </View>
                {canInteract && (
                    <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editButton}>
                        <Icon name="edit" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                )}
                {!canInteract && <View style={{ width: 44 }} />}
            </LinearGradient>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Ticket Info Card */}
                    <View style={styles.ticketInfoCard}>
                        <Text style={styles.ticketSubject}>{ticket.subject}</Text>

                        <View style={styles.ticketMetaRow}>
                            <View style={styles.metaItem}>
                                <View style={styles.metaIconWrapper}>
                                    <Icon name="label" size={14} color={COLORS.primary} />
                                </View>
                                <Text style={styles.metaText}>{ticket.category.replace(/_/g, ' ')}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <View style={styles.metaIconWrapper}>
                                    <Icon name="schedule" size={14} color={COLORS.primary} />
                                </View>
                                <Text style={styles.metaText}>{formatDate(ticket.createdAt)}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionLabel}>Description</Text>
                            <Text style={styles.description}>{ticket.description}</Text>
                        </View>

                        {ticket.attachments && (
                            <TouchableOpacity
                                style={styles.attachmentContainer}
                                onPress={() => handleImagePress(ticket.attachments!.url)}
                            >
                                <Image
                                    source={{ uri: ticket.attachments.url }}
                                    style={styles.attachmentImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.attachmentOverlay}>
                                    <Icon name="zoom-in" size={24} color={COLORS.white} />
                                    <Text style={styles.attachmentOverlayText}>Tap to view</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            {canInteract && (
                                <TouchableOpacity
                                    style={styles.resolveButton}
                                    onPress={handleCloseTicket}
                                    disabled={isClosing}
                                >
                                    {isClosing ? (
                                        <ActivityIndicator size="small" color="#10B981" />
                                    ) : (
                                        <>
                                            <Icon name="check-circle" size={18} color="#10B981" />
                                            <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {canReopen && (
                                <TouchableOpacity
                                    style={styles.reopenButton}
                                    onPress={handleReopenTicket}
                                    disabled={isReopening}
                                >
                                    {isReopening ? (
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                    ) : (
                                        <>
                                            <Icon name="refresh" size={18} color={COLORS.primary} />
                                            <Text style={styles.reopenButtonText}>Reopen Ticket</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {canReopen && !hasFeedback && (
                                <TouchableOpacity
                                    style={styles.feedbackButton}
                                    onPress={() => setShowFeedbackModal(true)}
                                >
                                    <Icon name="star" size={18} color="#F59E0B" />
                                    <Text style={styles.feedbackButtonText}>Give Feedback</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Show existing feedback */}
                        {hasFeedback && (
                            <View style={styles.existingFeedback}>
                                <View style={styles.feedbackHeader}>
                                    <Icon name="star" size={20} color="#F59E0B" />
                                    <Text style={styles.feedbackTitle}>Your Feedback</Text>
                                </View>
                                <View style={styles.feedbackStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Icon
                                            key={star}
                                            name={star <= (ticket.feedbackRating || 0) ? 'star' : 'star-border'}
                                            size={24}
                                            color="#F59E0B"
                                        />
                                    ))}
                                </View>
                                {ticket.feedbackComment && (
                                    <Text style={styles.feedbackCommentText}>"{ticket.feedbackComment}"</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Messages Section */}
                    <View style={styles.messagesSection}>
                        <View style={styles.messagesSectionHeader}>
                            <View style={styles.messagesIconWrapper}>
                                <Icon name="chat" size={18} color={COLORS.primary} />
                            </View>
                            <Text style={styles.messagesSectionTitle}>Conversation</Text>
                            <Text style={styles.messagesCount}>{messages?.length || 0} messages</Text>
                        </View>

                        {messagesLoading ? (
                            <View style={styles.messagesLoading}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        ) : messages && messages.length > 0 ? (
                            <View style={styles.messagesList}>
                                {messages.map((msg, index) => (
                                    <View key={msg.id || index}>
                                        {renderMessage({ item: msg })}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.noMessages}>
                                <Icon name="chat-bubble-outline" size={40} color="#D1D5DB" />
                                <Text style={styles.noMessagesText}>No messages yet</Text>
                                <Text style={styles.noMessagesSubtext}>Start the conversation below</Text>
                            </View>
                        )}
                    </View>

                    {!canInteract && (
                        <View style={styles.closedNotice}>
                            <View style={styles.closedIconWrapper}>
                                <Icon name={ticket.status === 'RESOLVED' ? 'check-circle' : 'lock'} size={24} color="#6B7280" />
                            </View>
                            <Text style={styles.closedNoticeTitle}>
                                {ticket.status === 'RESOLVED' ? 'Ticket Resolved' : 'Ticket Closed'}
                            </Text>
                            <Text style={styles.closedNoticeText}>
                                {ticket.status === 'RESOLVED'
                                    ? 'This ticket has been marked as resolved.'
                                    : 'This ticket has been closed.'}
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Message Input */}
                {canInteract && (
                    <View style={styles.messageInputWrapper}>
                        <View style={styles.messageInputContainer}>
                            <TextInput
                                style={styles.messageInput}
                                placeholder="Type your message..."
                                placeholderTextColor="#A0AEC0"
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                maxLength={1000}
                                editable={!isSendingMessage}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, (!message.trim() || isSendingMessage) && styles.sendButtonDisabled]}
                                onPress={handleSendMessage}
                                disabled={!message.trim() || isSendingMessage}
                            >
                                {isSendingMessage ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <Icon name="send" size={22} color={COLORS.white} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Ticket</Text>
                            <TouchableOpacity
                                onPress={() => setShowEditModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalInputWrapper}>
                                <Text style={styles.modalInputLabel}>Subject</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editSubject}
                                    onChangeText={setEditSubject}
                                    placeholder="Enter subject"
                                    placeholderTextColor="#A0AEC0"
                                    maxLength={255}
                                />
                                <Text style={styles.modalCharCount}>{editSubject.length}/255</Text>
                            </View>

                            <View style={styles.modalInputWrapper}>
                                <Text style={styles.modalInputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.modalInput, styles.modalTextArea]}
                                    value={editDescription}
                                    onChangeText={setEditDescription}
                                    placeholder="Enter description"
                                    placeholderTextColor="#A0AEC0"
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    maxLength={5000}
                                />
                                <Text style={styles.modalCharCount}>{editDescription.length}/5000</Text>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleUpdateTicket}
                                disabled={isUpdating}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, '#9B4DCA']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.modalSaveGradient}
                                >
                                    {isUpdating ? (
                                        <ActivityIndicator size="small" color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.modalSaveText}>Save Changes</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                visible={showFeedbackModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowFeedbackModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.feedbackModalContainer}>
                        <View style={styles.feedbackModalHeader}>
                            <View style={styles.feedbackModalIconWrapper}>
                                <Icon name="star" size={32} color="#F59E0B" />
                            </View>
                            <Text style={styles.feedbackModalTitle}>Rate Your Experience</Text>
                            <Text style={styles.feedbackModalSubtitle}>How was your support experience?</Text>
                        </View>

                        {renderStarRating()}

                        <Text style={styles.ratingLabel}>
                            {feedbackRating === 0 && 'Tap a star to rate'}
                            {feedbackRating === 1 && 'Very Poor'}
                            {feedbackRating === 2 && 'Poor'}
                            {feedbackRating === 3 && 'Average'}
                            {feedbackRating === 4 && 'Good'}
                            {feedbackRating === 5 && 'Excellent!'}
                        </Text>

                        <View style={styles.feedbackInputWrapper}>
                            <Text style={styles.feedbackInputLabel}>Comments (Optional)</Text>
                            <TextInput
                                style={styles.feedbackInput}
                                value={feedbackComment}
                                onChangeText={setFeedbackComment}
                                placeholder="Tell us more about your experience..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                        </View>

                        <View style={styles.feedbackModalFooter}>
                            <TouchableOpacity
                                style={styles.feedbackSkipButton}
                                onPress={() => {
                                    setShowFeedbackModal(false);
                                    setFeedbackRating(0);
                                    setFeedbackComment('');
                                }}
                            >
                                <Text style={styles.feedbackSkipText}>Skip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.feedbackSubmitButton, feedbackRating === 0 && styles.feedbackSubmitDisabled]}
                                onPress={handleSubmitFeedback}
                                disabled={feedbackRating === 0 || isSubmittingFeedback}
                            >
                                <LinearGradient
                                    colors={feedbackRating === 0 ? ['#D1D5DB', '#9CA3AF'] : [COLORS.primary, '#9B4DCA']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.feedbackSubmitGradient}
                                >
                                    {isSubmittingFeedback ? (
                                        <ActivityIndicator size="small" color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.feedbackSubmitText}>Submit Feedback</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Reopen Ticket Modal */}
            <Modal
                visible={showReopenModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowReopenModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.reopenModalContainer}>
                        <View style={styles.reopenModalHeader}>
                            <View style={styles.reopenModalIconWrapper}>
                                <Icon name="refresh" size={32} color={COLORS.primary} />
                            </View>
                            <Text style={styles.reopenModalTitle}>Reopen Ticket</Text>
                            <Text style={styles.reopenModalSubtitle}>Please provide a reason for reopening this ticket</Text>
                        </View>

                        <View style={styles.reopenInputWrapper}>
                            <Text style={styles.reopenInputLabel}>Reason *</Text>
                            <TextInput
                                style={styles.reopenInput}
                                value={reopenReason}
                                onChangeText={setReopenReason}
                                placeholder="Explain why you need to reopen this ticket..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={styles.reopenCharCount}>{reopenReason.length}/500</Text>
                        </View>

                        <View style={styles.reopenModalFooter}>
                            <TouchableOpacity
                                style={styles.reopenCancelButton}
                                onPress={() => {
                                    setShowReopenModal(false);
                                    setReopenReason('');
                                }}
                            >
                                <Text style={styles.reopenCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.reopenSubmitButton}
                                onPress={handleSubmitReopen}
                                disabled={isReopening}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, '#9B4DCA']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.reopenSubmitGradient}
                                >
                                    {isReopening ? (
                                        <ActivityIndicator size="small" color={COLORS.white} />
                                    ) : (
                                        <>
                                            <Icon name="refresh" size={18} color={COLORS.white} />
                                            <Text style={styles.reopenSubmitText}>Reopen Ticket</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Full Screen Image Modal */}
            <Modal
                visible={showImageModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={styles.imageModalOverlay}>
                    <TouchableOpacity
                        style={styles.imageModalCloseButton}
                        onPress={() => setShowImageModal(false)}
                    >
                        <Icon name="close" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                    {selectedImageUrl && (
                        <Image
                            source={{ uri: selectedImageUrl }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 4,
    },
    headerStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerStatusText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
        textTransform: 'uppercase',
    },
    editButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    errorIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.muted,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    retryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    retryButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
    ticketInfoCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    ticketSubject: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 16,
        lineHeight: 26,
    },
    ticketMetaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaIconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    descriptionSection: {
        marginBottom: 16,
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    attachmentContainer: {
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    attachmentImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
    },
    attachmentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    attachmentOverlayText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.white,
    },
    actionButtons: {
        marginTop: 16,
        gap: 10,
    },
    resolveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    resolveButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    reopenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    reopenButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
    },
    feedbackButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F59E0B',
    },
    existingFeedback: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    feedbackTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#92400E',
    },
    feedbackStars: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,
    },
    feedbackCommentText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#78350F',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    messagesSection: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    messagesSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    messagesIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    messagesSectionTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    messagesCount: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.muted,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messagesLoading: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    messagesList: {
        gap: 12,
    },
    messageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    messageWrapperUser: {
        justifyContent: 'flex-end',
    },
    messageWrapperAdmin: {
        justifyContent: 'flex-start',
    },
    adminAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBubble: {
        maxWidth: width * 0.65,
        padding: 14,
        borderRadius: 16,
    },
    messageBubbleUser: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    messageBubbleAdmin: {
        backgroundColor: '#F1F5F9',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    messageTextUser: {
        color: COLORS.white,
    },
    messageImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginTop: 8,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    messageTime: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.muted,
        marginTop: 6,
    },
    messageTimeUser: {
        color: 'rgba(255,255,255,0.7)',
    },
    noMessages: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    noMessagesText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginTop: 12,
    },
    noMessagesSubtext: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.muted,
        marginTop: 4,
    },
    closedNotice: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
    },
    closedIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    closedNoticeTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#374151',
        marginBottom: 4,
    },
    closedNoticeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
    },
    messageInputWrapper: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    messageInput: {
        flex: 1,
        minHeight: 44,
        maxHeight: 100,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: 20,
    },
    modalInputWrapper: {
        marginBottom: 20,
    },
    modalInputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    modalTextArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    modalCharCount: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.muted,
        textAlign: 'right',
        marginTop: 6,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    modalSaveButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalSaveGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalSaveText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
    // Feedback Modal Styles
    feedbackModalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    feedbackModalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    feedbackModalIconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    feedbackModalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    feedbackModalSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 24,
    },
    feedbackInputWrapper: {
        marginBottom: 24,
    },
    feedbackInputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    feedbackInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    feedbackModalFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    feedbackSkipButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },
    feedbackSkipText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    feedbackSubmitButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    feedbackSubmitDisabled: {
        opacity: 0.7,
    },
    feedbackSubmitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    feedbackSubmitText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
    // Image Modal Styles
    imageModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    fullScreenImage: {
        width: width,
        height: height * 0.8,
    },
    // Reopen Modal Styles
    reopenModalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    reopenModalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    reopenModalIconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    reopenModalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    reopenModalSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    reopenInputWrapper: {
        marginBottom: 24,
    },
    reopenInputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    reopenInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    reopenCharCount: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.muted,
        textAlign: 'right',
        marginTop: 6,
    },
    reopenModalFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    reopenCancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },
    reopenCancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    reopenSubmitButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    reopenSubmitGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    reopenSubmitText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
});

export default TicketDetailsScreen;
