import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import { LegalDocumentType, useGetLegalDocumentByType } from "../../api/hooks/legal.hook";
import { COLORS } from "../../theme/color";

const { width: screenWidth } = Dimensions.get("window");

const Docs = ({ navigation, route }: any) => {
    const { type } = route.params as { type: LegalDocumentType };
    
    // UI States
    const [progress, setProgress] = useState(0);
    const [headerHeight, setHeaderHeight] = useState(72);

    // Fetch dynamic content from server
    const { data: docData, isLoading, error, refetch, isFetching } = useGetLegalDocumentByType(type);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleRefresh = () => {
        refetch();
    };

    // Mapping for user friendly titles
    const titles: Record<LegalDocumentType, string> = {
        [LegalDocumentType.PRIVACY_POLICY]: "Privacy Policy",
        [LegalDocumentType.TERMS_AND_CONDITIONS]: "Terms & Conditions",
        [LegalDocumentType.BUSINESS_AND_PAYMENT]: "Business & Payment",
        [LegalDocumentType.VENDOR_AND_PARTNER]: "Vendor & Partner",
        [LegalDocumentType.CSR_POLICY]: "CSR Policy",
        [LegalDocumentType.REFUND_POLICY]: "Refund Policy",
        [LegalDocumentType.ABOUT_US]: "About Us",
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Fetching Latest Document...</Text>
                </View>
            );
        }

        if (error || !docData) {
            return (
                <View style={styles.centerContainer}>
                    <Icon name="error-outline" size={48} color={COLORS.danger} />
                    <Text style={styles.errorText}>We couldn't load the requested document.</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryText}>Retry Loading</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Wrap the dynamic content in a standard HTML document for uniform rendering
        const htmlWrapper = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, system-ui, Roboto, sans-serif;
                        padding: 20px;
                        line-height: 1.6;
                        color: ${COLORS.textSecondary};
                        background-color: ${COLORS.white};
                        font-size: 15px;
                    }
                    h1, h2, h3 { color: ${COLORS.primary}; margin-top: 1.5em; font-weight: 700; }
                    p { margin-bottom: 1.2em; text-align: justify; }
                    ul, ol { padding-left: 20px; margin-bottom: 1.2em; }
                    li { margin-bottom: 8px; }
                    strong { color: ${COLORS.textPrimary}; }
                </style>
            </head>
            <body>
                ${docData.content}
                <div style="height: 50px;"></div>
            </body>
            </html>
        `;

        return (
            <WebView
                originWhitelist={['*']}
                source={{ html: htmlWrapper }}
                style={styles.webview}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                onScroll={(event) => {
                    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                    const calculatedProgress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
                    setProgress(Math.min(Math.max(calculatedProgress, 0), 1));
                }}
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View
                style={styles.header}
                onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
            >
                <View style={[styles.headerGradient, { paddingTop: 16, paddingBottom: 24 }]}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <View style={styles.titleContainer}>
                             <Text style={styles.headerTitle}>{titles[type] || "Legal Document"}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.headerButton} 
                            onPress={handleRefresh}
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Icon name="refresh" size={24} color={COLORS.white} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBar, { top: headerHeight }]}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            {/* Main Content Area */}
            <View style={[styles.main, { marginTop: headerHeight }]}>
                {docData && (
                    <View style={styles.subHeader}>
                        <Text style={styles.subHeaderText}>{docData.title}</Text>
                        <Text style={styles.lastUpdated}>
                            Version {docData.version} • Published: {new Date(docData.updatedAt).toLocaleDateString()}
                        </Text>
                    </View>
                )}
                {renderContent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
    headerGradient: { backgroundColor: COLORS.primary, paddingHorizontal: 20 },
    headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
    titleContainer: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.white },
    progressBar: { position: "absolute", left: 0, right: 0, height: 4, backgroundColor: "rgba(0,0,0,0.05)", zIndex: 15 },
    progressFill: { height: "100%", backgroundColor: COLORS.accent },
    main: { flex: 1 },
    webview: { flex: 1, backgroundColor: "transparent" },
    subHeader: { 
        padding: 20, 
        backgroundColor: COLORS.white,
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(0,0,0,0.05)',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    subHeaderText: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 4 },
    lastUpdated: { fontSize: 12, color: COLORS.muted },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
    loadingText: { marginTop: 16, fontSize: 14, color: COLORS.muted, fontWeight: "500" },
    errorText: { marginTop: 16, fontSize: 15, color: COLORS.danger, textAlign: "center", fontWeight: "500" },
    retryButton: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, backgroundColor: COLORS.primary, borderRadius: 12, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10 },
    retryText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
});

export default Docs;
