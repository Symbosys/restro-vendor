import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useCreateTicket } from '../../../api/hooks/useSupportTickets';
import { useAlertStore } from '../../../store/alert.store';
import { COLORS } from '../../../theme/color';
import { AppNavigation } from '../../../types/types';


// Map frontend categories to backend enum values
const categoryMapping: { [key: string]: string } = {
    'Order Issue': 'ORDER_ISSUE',
    'Payment Issue': 'PAYMENT_ISSUE',
    'Delivery Issue': 'DELIVERY_ISSUE',
    'Account Issue': 'ACCOUNT_ISSUE',
    'Technical Issue': 'TECHNICAL_ISSUE',
    'Feedback': 'FEEDBACK',
    'Complaint': 'COMPLAINT',
    'Inquiry': 'INQUIRY',
    'App Bug': 'BUG',
    'Other': 'OTHER',
};

// Category icons mapping
const categoryIcons: { [key: string]: string } = {
    'Order Issue': 'shopping-bag',
    'Payment Issue': 'payment',
    'Delivery Issue': 'local-shipping',
    'Account Issue': 'person',
    'Technical Issue': 'build',
    'Feedback': 'thumb-up',
    'Complaint': 'report-problem',
    'Inquiry': 'help',
    'App Bug': 'bug-report',
    'Other': 'more-horiz',
};

interface ImageAsset {
    uri: string;
    type: string;
    fileName: string;
    fileSize?: number;
}

const ReportProblemScreen: React.FC<AppNavigation> = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [subject, setSubject] = useState<string>('');
    const [orderId, setOrderId] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [compressing, setCompressing] = useState(false);

    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const camera = useRef<Camera>(null);

    const { mutate: createTicket, isPending } = useCreateTicket();
    const showAlert = useAlertStore((state) => state.showAlert);

    const categories: string[] = [
        'Order Issue',
        'Payment Issue',
        'Delivery Issue',
        'Account Issue',
        'Technical Issue',
        'Feedback',
        'Complaint',
        'Inquiry',
        'App Bug',
        'Other',
    ];

    const handleAddMedia = async () => {
        if (!hasPermission) {
            const granted = await requestPermission();
            if (!granted) {
                showAlert({
                    title: 'Permission Required',
                    message: 'Camera permission is required to take photos.',
                    confirmText: 'OK',
                    cancelText: 'Cancel',
                });
                return;
            }
        }
        setShowCamera(true);
    };

    const compressImageTo200KB = async (uri: string): Promise<{ uri: string; fileSize: number }> => {
        const TARGET_SIZE = 200 * 1024; // 200KB in bytes
        let quality = 80;
        let currentUri = uri;
        let fileSize = 0;

        // Get initial file size
        try {
            const stat = await RNFS.stat(uri.replace('file://', ''));
            fileSize = stat.size;
        } catch (e) {
            console.error('Error getting file size:', e);
        }

        // If already under 200KB, return as is
        if (fileSize <= TARGET_SIZE) {
            return { uri: currentUri, fileSize };
        }

        // Compress iteratively until under 200KB
        while (fileSize > TARGET_SIZE && quality > 10) {
            try {
                const resizedImage = await ImageResizer.createResizedImage(
                    currentUri,
                    1024, // max width
                    1024, // max height
                    'JPEG',
                    quality,
                    0, // rotation
                    undefined, // outputPath (temp)
                    false, // keep meta
                    { mode: 'contain', onlyScaleDown: true }
                );

                currentUri = resizedImage.uri;
                fileSize = resizedImage.size;

                // If still too large, reduce quality
                if (fileSize > TARGET_SIZE) {
                    quality -= 10;
                }
            } catch (e) {
                console.error('Error compressing image:', e);
                break;
            }
        }

        return { uri: currentUri, fileSize };
    };

    const handleCapturePhoto = async () => {
        if (camera.current) {
            try {
                setCompressing(true);
                const photo = await camera.current.takePhoto({
                    flash: 'off'
                });
                const originalUri = 'file://' + photo.path;

                // Compress image to 200KB
                const { uri: compressedUri, fileSize } = await compressImageTo200KB(originalUri);

                setSelectedImage({
                    uri: compressedUri,
                    type: 'image/jpeg',
                    fileName: `ticket_image_${Date.now()}.jpg`,
                    fileSize: fileSize
                });
                setShowCamera(false);
            } catch (e) {
                console.error(e);
                showAlert({
                    title: 'Error',
                    message: 'Failed to take photo',
                    confirmText: 'OK',
                    cancelText: 'Cancel',
                });
            } finally {
                setCompressing(false);
            }
        }
    };

    const handleRemoveImage = (): void => {
        setSelectedImage(null);
    };

    const handleSelectCategory = (index: number) => {
        setSelectedCategory(index);
        setShowCategoryDropdown(false);
    };

    const handleSubmit = (): void => {
        // Validation matching backend schema
        const trimmedSubject = subject.trim();
        const trimmedDescription = description.trim();
        const trimmedOrderId = orderId.trim();

        // Subject validation: min 5, max 255
        if (!trimmedSubject) {
            showAlert({
                title: 'Missing Information',
                message: 'Please enter a subject',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }
        if (trimmedSubject.length < 5) {
            showAlert({
                title: 'Invalid Subject',
                message: 'Subject must be at least 5 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }
        if (trimmedSubject.length > 255) {
            showAlert({
                title: 'Invalid Subject',
                message: 'Subject must not exceed 255 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        // Description validation: min 10, max 5000
        if (!trimmedDescription) {
            showAlert({
                title: 'Missing Information',
                message: 'Please describe the issue',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }
        if (trimmedDescription.length < 10) {
            showAlert({
                title: 'Invalid Description',
                message: 'Description must be at least 10 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }
        if (trimmedDescription.length > 5000) {
            showAlert({
                title: 'Invalid Description',
                message: 'Description must not exceed 5000 characters',
                confirmText: 'OK',
                cancelText: 'Cancel',
            });
            return;
        }

        // Order ID validation: must be numeric if provided (only for Order Issue)
        if (categories[selectedCategory] === 'Order Issue' && trimmedOrderId) {
            if (!/^\d+$/.test(trimmedOrderId)) {
                showAlert({
                    title: 'Invalid Order ID',
                    message: 'Order ID must be a valid number',
                    confirmText: 'OK',
                    cancelText: 'Cancel',
                });
                return;
            }
        }

        const backendCategory = categoryMapping[categories[selectedCategory]];

        const ticketData: any = {
            category: backendCategory,
            subject: trimmedSubject,
            description: trimmedDescription,
            priority: 'MEDIUM',
            source: 'MOBILE_APP',
        };

        // Only include orderId for Order Issue category
        if (categories[selectedCategory] === 'Order Issue' && trimmedOrderId) {
            ticketData.orderId = trimmedOrderId;
        }

        if (selectedImage && selectedImage.uri) {
            ticketData.image = {
                uri: selectedImage.uri,
                type: selectedImage.type || 'image/jpeg',
                name: selectedImage.fileName || `ticket_image_${Date.now()}.jpg`,
            };
        }

        createTicket(ticketData, {
            onSuccess: () => {
                setSelectedCategory(0);
                setSubject('');
                setOrderId('');
                setDescription('');
                setSelectedImage(null);

                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            },
        });
    };

    const renderCategoryItem = ({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            style={[
                styles.dropdownItem,
                index === selectedCategory && styles.dropdownItemSelected,
            ]}
            onPress={() => handleSelectCategory(index)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.dropdownIconWrapper,
                index === selectedCategory && styles.dropdownIconWrapperSelected,
            ]}>
                <Icon
                    name={categoryIcons[item]}
                    size={20}
                    color={index === selectedCategory ? COLORS.white : COLORS.primary}
                />
            </View>
            <Text style={[
                styles.dropdownItemText,
                index === selectedCategory && styles.dropdownItemTextSelected,
            ]}>
                {item}
            </Text>
            {index === selectedCategory && (
                <Icon name="check" size={20} color={COLORS.primary} />
            )}
        </TouchableOpacity>
    );

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
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Report a Problem</Text>
                    <Text style={styles.headerSubtitle}>We're here to help you</Text>
                </View>
                <View style={styles.headerIconContainer}>
                    <Icon name="support-agent" size={28} color={COLORS.white} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Issue Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <Icon name="edit" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.cardTitle}>Issue Details</Text>
                    </View>

                    {/* Category Dropdown */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Issue Category <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowCategoryDropdown(true)}
                            disabled={isPending}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dropdownSelectedIconWrapper}>
                                <Icon
                                    name={categoryIcons[categories[selectedCategory]]}
                                    size={20}
                                    color={COLORS.primary}
                                />
                            </View>
                            <Text style={styles.dropdownButtonText}>
                                {categories[selectedCategory]}
                            </Text>
                            <Icon
                                name="keyboard-arrow-down"
                                size={24}
                                color={COLORS.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Subject <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputContainer}>
                            <Icon name="title" size={20} color={COLORS.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Brief summary of the issue (min 5 chars)"
                                placeholderTextColor="#A0AEC0"
                                value={subject}
                                onChangeText={setSubject}
                                editable={!isPending}
                                maxLength={255}
                            />
                        </View>
                        <Text style={styles.characterCount}>
                            {subject.length}/255 characters
                        </Text>
                    </View>

                    {/* Order ID - Only show for Order Issue category */}
                    {categories[selectedCategory] === 'Order Issue' && (
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Order ID <Text style={styles.optional}>(Optional)</Text></Text>
                            <View style={styles.inputContainer}>
                                <Icon name="receipt" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your Order ID"
                                    placeholderTextColor="#A0AEC0"
                                    value={orderId}
                                    onChangeText={setOrderId}
                                    editable={!isPending}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Description <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Please describe the issue in detail (min 10 chars)..."
                                placeholderTextColor="#A0AEC0"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                                editable={!isPending}
                                maxLength={5000}
                            />
                        </View>
                        <Text style={styles.characterCount}>
                            {description.length}/5000 characters
                        </Text>
                    </View>
                </View>

                {/* Attachment Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <Icon name="attach-file" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.cardTitle}>Attachments</Text>
                    </View>

                    {selectedImage ? (
                        <View style={styles.imagePreviewWrapper}>
                            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                style={styles.imageOverlay}
                            >
                                <Text style={styles.imageFileName}>{selectedImage.fileName}</Text>
                            </LinearGradient>
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={handleRemoveImage}
                                disabled={isPending}
                            >
                                <Icon name="close" size={18} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addAttachmentButton}
                            onPress={handleAddMedia}
                            disabled={isPending}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={['#F8F4FF', '#EDE7F6']}
                                style={styles.attachmentGradient}
                            >
                                <View style={styles.cameraIconWrapper}>
                                    <Icon name="camera-alt" size={28} color={COLORS.primary} />
                                </View>
                                <Text style={styles.attachmentTitle}>Take a Photo</Text>
                                <Text style={styles.attachmentSubtitle}>Capture an image to help us understand the issue</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <LinearGradient
                        colors={['#E8F5E9', '#C8E6C9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.infoBannerGradient}
                    >
                        <View style={styles.infoIconWrapper}>
                            <Icon name="verified-user" size={24} color="#2E7D32" />
                        </View>
                        <View style={styles.infoTextWrapper}>
                            <Text style={styles.infoTitle}>Secure Submission</Text>
                            <Text style={styles.infoDescription}>
                                Your contact info will be attached automatically. We typically respond within 24 hours.
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.submitWrapper}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isPending}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={isPending ? ['#BDBDBD', '#9E9E9E'] : [COLORS.primary, '#9B4DCA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        {isPending ? (
                            <>
                                <ActivityIndicator size="small" color={COLORS.white} />
                                <Text style={styles.submitText}>Submitting...</Text>
                            </>
                        ) : (
                            <>
                                <Icon name="send" size={20} color={COLORS.white} />
                                <Text style={styles.submitText}>Submit Report</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Category Dropdown Modal */}
            <Modal
                visible={showCategoryDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCategoryDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCategoryDropdown(false)}
                >
                    <View style={styles.dropdownModalContainer}>
                        <View style={styles.dropdownModalHeader}>
                            <Text style={styles.dropdownModalTitle}>Select Issue Category</Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryDropdown(false)}
                                style={styles.dropdownCloseButton}
                            >
                                <Icon name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={categories}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderCategoryItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.dropdownList}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Camera Modal */}
            <Modal visible={showCamera} animationType="slide" onRequestClose={() => setShowCamera(false)}>
                <View style={styles.cameraContainer}>
                    {device ? (
                        <Camera
                            ref={camera}
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={showCamera}
                            photo={true}
                        />
                    ) : (
                        <View style={styles.noCameraView}>
                            <Icon name="no-photography" size={64} color="#666" />
                            <Text style={styles.noCameraText}>No Camera Device Found</Text>
                        </View>
                    )}

                    {/* Camera Controls */}
                    <SafeAreaView style={styles.cameraControls} edges={['bottom']}>
                        <TouchableOpacity
                            style={styles.cameraCloseButton}
                            onPress={() => setShowCamera(false)}
                            disabled={compressing}
                        >
                            <Icon name="close" size={28} color={COLORS.white} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.captureButton, compressing && { opacity: 0.5 }]}
                            onPress={handleCapturePhoto}
                            disabled={compressing}
                        >
                            <View style={styles.captureButtonOuter}>
                                {compressing ? (
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                ) : (
                                    <View style={styles.captureButtonInner} />
                                )}
                            </View>
                        </TouchableOpacity>

                        <View style={{ width: 56 }} />
                    </SafeAreaView>

                    {/* Compressing Overlay */}
                    {compressing && (
                        <View style={styles.compressingOverlay}>
                            <View style={styles.compressingBox}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={styles.compressingText}>Optimizing image...</Text>
                            </View>
                        </View>
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
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    card: {
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    inputWrapper: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    optional: {
        color: COLORS.muted,
        fontWeight: '800',
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textPrimary,
        paddingVertical: 14,
    },
    textAreaContainer: {
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    textArea: {
        minHeight: 120,
        paddingVertical: 0,
    },
    characterCount: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: 'right',
        marginTop: 6,
    },
    // Dropdown Styles
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    dropdownSelectedIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dropdownButtonText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    dropdownModalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    dropdownModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dropdownModalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    dropdownCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownList: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingBottom: 32,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 4,
    },
    dropdownItemSelected: {
        backgroundColor: COLORS.primary + '10',
    },
    dropdownIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    dropdownIconWrapperSelected: {
        backgroundColor: COLORS.primary,
    },
    dropdownItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    dropdownItemTextSelected: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    // Image Preview
    imagePreviewWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    imageFileName: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '800',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addAttachmentButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    attachmentGradient: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: COLORS.primary + '40',
    },
    cameraIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    attachmentTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    attachmentSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    infoBanner: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    infoBannerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    infoIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoTextWrapper: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1B5E20',
        marginBottom: 2,
    },
    infoDescription: {
        fontSize: 12,
        color: '#2E7D32',
        lineHeight: 18,
    },
    submitWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 24,
        backgroundColor: '#F5F7FA',
    },
    submitButton: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    submitText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.3,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    noCameraView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    noCameraText: {
        color: '#888',
        fontSize: 16,
        marginTop: 16,
    },
    cameraControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 32,
    },
    cameraCloseButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonOuter: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 4,
        borderColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.white,
    },
    compressingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    compressingBox: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    compressingText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
});

export default ReportProblemScreen;