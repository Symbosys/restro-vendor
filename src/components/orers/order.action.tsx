import React from "react";
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAcceptOrder, useRejectOrder } from "../../api/hooks/order";
import { COLORS } from "../../theme/color";

/**
 * Professional Accept Order Button (Icon Version)
 */
export const AcceptOrderButton = ({ orderId }: { orderId: string }) => {
    const { mutate: acceptOrder, isPending } = useAcceptOrder();
    
    return (
        <TouchableOpacity 
            style={[styles.button, styles.acceptButton, isPending && styles.disabledButton]} 
            onPress={() => acceptOrder({ orderId })} 
            disabled={isPending}
            activeOpacity={0.7}
        >
            {isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
                <Icon name="check" size={26} color={COLORS.white} />
            )}
        </TouchableOpacity>
    );
}

/**
 * Professional Reject Order Button (Icon Version)
 */
export const RejectOrderButton = ({ orderId }: { orderId: string }) => {
    const { mutate: rejectOrder, isPending } = useRejectOrder();
    
    return (
        <TouchableOpacity 
            style={[styles.button, styles.rejectButton, isPending && styles.disabledButton]} 
            onPress={() => rejectOrder({ orderId })} 
            disabled={isPending}
            activeOpacity={0.7}
        >
            {isPending ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
                <Icon name="close" size={26} color={COLORS.danger} />
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
    acceptButton: {
        backgroundColor: COLORS.primary,
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


