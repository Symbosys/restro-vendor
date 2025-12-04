import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { COLORS } from '../../theme/color';
import { useAlertStore } from '../../store/alert.store';

const { width } = Dimensions.get('window');

const GlobalAlert = () => {
    // Subscribe to store values
    const {
        visible,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
        hideAlert
    } = useAlertStore();

    const handleCancel = () => {
        if (onCancel) onCancel();
        hideAlert();
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        hideAlert();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    {/* Header Line */}
                    <View style={styles.headerLine} />

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    headerLine: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
        marginBottom: 16,
        opacity: 0.3,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: 'rgba(74, 74, 74, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#666666',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default GlobalAlert;