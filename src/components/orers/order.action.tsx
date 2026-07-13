import React from "react";
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Text,
  View
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAcceptOrder, useRejectOrder, useMarkOrderReady } from "../../api/hooks/order";
import { COLORS } from "../../theme/color";

/**
 * Professional Accept Order Button
 */
export const AcceptOrderButton = ({ orderId, label }: { orderId: string, label?: string }) => {
    const { mutate: acceptOrder, isPending } = useAcceptOrder();
    
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                label ? styles.buttonWithLabel : null, 
                styles.acceptButton, 
                isPending && styles.disabledButton
            ]} 
            onPress={() => acceptOrder({ orderId })} 
            disabled={isPending}
            activeOpacity={0.7}
        >
            {isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
                <View style={styles.contentContainer}>
                    <Icon name="check" size={24} color={COLORS.white} />
                    {label ? <Text style={[styles.labelText, { color: COLORS.white }]}>{label}</Text> : null}
                </View>
            )}
        </TouchableOpacity>
    );
}

/**
 * Professional Mark Ready Button
 */
export const MarkReadyButton = ({ orderId, label }: { orderId: string, label?: string }) => {
    const { mutate: markReady, isPending } = useMarkOrderReady();
    
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                label ? styles.buttonWithLabel : null, 
                styles.readyButton, 
                isPending && styles.disabledButton
            ]} 
            onPress={() => markReady({ orderId })} 
            disabled={isPending}
            activeOpacity={0.7}
        >
            {isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
                <View style={styles.contentContainer}>
                    <Icon name="restaurant" size={24} color={COLORS.white} />
                    {label ? <Text style={[styles.labelText, { color: COLORS.white }]}>{label}</Text> : null}
                </View>
            )}
        </TouchableOpacity>
    );
}

/**
 * Professional Reject Order Button
 */
export const RejectOrderButton = ({ orderId, label }: { orderId: string, label?: string }) => {
    const { mutate: rejectOrder, isPending } = useRejectOrder();
    
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                label ? styles.buttonWithLabel : null, 
                styles.rejectButton, 
                isPending && styles.disabledButton
            ]} 
            onPress={() => rejectOrder({ orderId })} 
            disabled={isPending}
            activeOpacity={0.7}
        >
            {isPending ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
                <View style={styles.contentContainer}>
                    <Icon name="close" size={24} color={COLORS.danger} />
                    {label ? <Text style={[styles.labelText, { color: COLORS.danger }]}>{label}</Text> : null}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        width: 48,
        borderRadius: 24, // Circular for a clean icon-only look
        justifyContent: 'center',
        alignItems: 'center',
        // Depth & Elevation
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonWithLabel: {
        width: 'auto',
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    labelText: {
        fontSize: 15,
        fontWeight: '800',
    },
    acceptButton: {
        backgroundColor: COLORS.primary,
    },
    readyButton: {
        backgroundColor: '#22C55E', // Green for "Ready"
    },
    rejectButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.danger,
    },
    disabledButton: {
        opacity: 0.5,
    }
});
