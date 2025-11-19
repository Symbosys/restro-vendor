import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    View
} from "react-native";
import { COLORS } from "../../theme/color";

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

/**
 * Global Loading Overlay
 * - Transparent background
 * - Blocks touch
 * - Centered loader
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    message = "Loading...",
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.text}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        width,
        height,
        backgroundColor: "rgba(0,0,0,0.2)", // ⭐ Transparent overlay (background visible)
        justifyContent: "center",
        alignItems: "center",
    },
    loaderContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
});
