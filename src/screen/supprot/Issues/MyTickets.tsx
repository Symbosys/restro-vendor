import React, { useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../../theme/color';
import { AppNavigation } from '../../../types/types';
import { useGetAllTickets, useGetTicketStats, SupportTicket } from '../../../api/hooks/useSupportTickets';

const { width } = Dimensions.get('window');

const MyTicketsScreen: React.FC<AppNavigation> = ({ navigation }) => {
    const {
        data,
        isLoading,
        error,
        refetch,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllTickets();

    const { data: stats, isLoading: statsLoading } = useGetTicketStats();

    const tickets = useMemo(() => data?.pages.flatMap(page => page.tickets) || [], [data]);

    const getStatusColor = (status: string) => {
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

    const getStatusIcon = (status: string) => {
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
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays === 1) return 'Yesterday';
            if (diffInDays < 7) return `${diffInDays}d ago`;
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    };

    const StatsCard = ({ icon, label, value, color, gradient }: { icon: string; label: string; value: number; color: string; gradient: string[] }) => (
        <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
        >
            <View style={[styles.statIconContainer, { backgroundColor: color + '30' }]}>
                <Icon name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statValue}>{statsLoading ? '-' : value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </LinearGradient>
    );

    const renderHeader = () => (
        <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Ticket Overview</Text>
            <View style={styles.statsGrid}>
                <StatsCard
                    icon="inbox"
                    label="Total"
                    value={stats?.total || 0}
                    color="#6366F1"
                    gradient={['#EEF2FF', '#E0E7FF']}
                />
                <StatsCard
                    icon="fiber-new"
                    label="Open"
                    value={stats?.open || 0}
                    color="#3B82F6"
                    gradient={['#EFF6FF', '#DBEAFE']}
                />
                <StatsCard
                    icon="hourglass-empty"
                    label="In Progress"
                    value={stats?.inProgress || 0}
                    color="#F59E0B"
                    gradient={['#FFFBEB', '#FEF3C7']}
                />
                <StatsCard
                    icon="check-circle"
                    label="Resolved"
                    value={stats?.resolved || 0}
                    color="#10B981"
                    gradient={['#ECFDF5', '#D1FAE5']}
                />
            </View>
        </View>
    );

    const renderTicketCard = ({ item: ticket }: { item: SupportTicket }) => (
        <TouchableOpacity
            key={ticket.id}
            style={styles.ticketCard}
            onPress={() => navigation.navigate('TicketDetails', { ticketId: ticket.id })}
            activeOpacity={0.7}
        >
            <View style={styles.ticketHeader}>
                <View style={styles.ticketNumberContainer}>
                    <View style={styles.ticketIconWrapper}>
                        <Icon name="confirmation-number" size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '15' }]}>
                    <Icon name={getStatusIcon(ticket.status)} size={14} color={getStatusColor(ticket.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <Text style={styles.ticketSubject} numberOfLines={2}>
                {ticket.subject}
            </Text>

            <Text style={styles.ticketDescription} numberOfLines={2}>
                {ticket.description}
            </Text>

            <View style={styles.ticketDivider} />

            <View style={styles.ticketFooter}>
                <View style={styles.categoryContainer}>
                    <View style={styles.categoryIconWrapper}>
                        <Icon name="label" size={12} color={COLORS.primary} />
                    </View>
                    <Text style={styles.categoryText}>
                        {ticket.category.replace(/_/g, ' ')}
                    </Text>
                </View>
                <View style={styles.dateContainer}>
                    <Icon name="access-time" size={12} color={COLORS.muted} />
                    <Text style={styles.dateText}>{formatDate(ticket.createdAt)}</Text>
                </View>
            </View>

            {ticket.attachments && (
                <View style={styles.attachmentIndicator}>
                    <Icon name="attach-file" size={14} color={COLORS.primary} />
                    <Text style={styles.attachmentText}>Has attachment</Text>
                </View>
            )}

            <View style={styles.ticketArrow}>
                <Icon name="chevron-right" size={20} color={COLORS.muted} />
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.footerLoaderText}>Loading more...</Text>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
                <Icon name="support-agent" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Support Tickets</Text>
            <Text style={styles.emptyText}>
                You haven't created any support tickets yet. We're here to help!
            </Text>
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('ReportIssue')}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[COLORS.primary, '#9B4DCA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createButtonGradient}
                >
                    <Icon name="add-circle" size={20} color={COLORS.white} />
                    <Text style={styles.createButtonText}>Create New Ticket</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

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
                        <Text style={styles.headerTitle}>My Issues</Text>
                        <Text style={styles.headerSubtitle}>Your support history</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </LinearGradient>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading your tickets...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
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
                        <Text style={styles.headerTitle}>My Issues</Text>
                        <Text style={styles.headerSubtitle}>Your support history</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </LinearGradient>
                <View style={styles.centerContainer}>
                    <View style={styles.errorIconWrapper}>
                        <Icon name="error-outline" size={48} color="#EF4444" />
                    </View>
                    <Text style={styles.errorTitle}>Failed to load tickets</Text>
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Premium Gradient Header */}
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
                    <Text style={styles.headerTitle}>My Tickets</Text>
                    <Text style={styles.headerSubtitle}>Your support history</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ReportIssue')}
                    style={styles.addButton}
                >
                    <Icon name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </LinearGradient>

            <FlatList
                data={tickets}
                renderItem={renderTicketCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.scrollContent, tickets.length === 0 && styles.emptyContent]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={tickets.length > 0 ? renderHeader : null}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching && !isFetchingNextPage}
                        onRefresh={refetch}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
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
        paddingVertical: 20,
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
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    statsSection: {
        marginBottom: 20,
    },
    statsSectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 14,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statCard: {
        width: (width - 42) / 2,
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
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
    ticketCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    ticketNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ticketIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ticketNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 22,
        paddingRight: 20,
    },
    ticketDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginBottom: 14,
        lineHeight: 20,
    },
    ticketDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 14,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    categoryIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.muted,
    },
    attachmentIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    attachmentText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
    },
    ticketArrow: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -10,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    createButton: {
        marginTop: 28,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 28,
        paddingVertical: 16,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
    footerLoader: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    footerLoaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.muted,
    },
    emptyContent: {
        flexGrow: 1,
    },
});

export default MyTicketsScreen;
