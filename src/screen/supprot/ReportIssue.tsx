import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, Asset, MediaType } from 'react-native-image-picker';
import { AppNavigation } from '../../types/types';
import { COLORS } from '../../theme/color';

const { width: screenWidth } = Dimensions.get('window');

const ReportProblemScreen: React.FC<AppNavigation> = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [orderId, setOrderId] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [name, setName] = useState<string>('Alex Smith');
    const [email, setEmail] = useState<string>('alex.smith@example.com');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<Asset | null>(null);

    const categories: string[] = [
        'Order Issue',
        'Delivery Problem',
        'Payment Error',
        'App Bug',
        'Product Quality',
    ];

    const handleAddMedia = (): void => {
        const options = {
            mediaType: 'photo' as MediaType,
            selectionLimit: 1,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                return;
            }
            if (response.assets && response.assets[0]) {
                setSelectedImage(response.assets[0]);
            }
        });
    };

    const handleRemoveImage = (): void => {
        setSelectedImage(null);
    };

    const handleSubmit = (): void => {
        // Simulate submission
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report a Problem</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.body}>
                    {/* Problem Category Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What is the issue related to?</Text>
                        <View style={styles.categoriesContainer}>
                            {categories.map((category: string, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.categoryChip,
                                        index === selectedCategory ? styles.selectedChip : styles.unselectedChip,
                                    ]}
                                    onPress={() => setSelectedCategory(index)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            index === selectedCategory ? styles.selectedText : styles.unselectedText,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Details Input Section */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Order ID (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter your Order ID"
                                placeholderTextColor={COLORS.muted}
                                value={orderId}
                                onChangeText={setOrderId}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.descriptionGroup]}>
                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Please describe the issue..."
                                placeholderTextColor={COLORS.muted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {selectedImage ? (
                            <View style={styles.mediaContainer}>
                                <View style={styles.previewContainer}>
                                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                                    <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
                                        <Icon name="close" size={24} color={COLORS.textPrimary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.mediaContainer}>
                                <TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
                                    <Icon name="add-photo-alternate" size={24} color={COLORS.muted} />
                                    <Text style={styles.addMediaText}>Add Photo/Video</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Contact Information */}
                    <View style={styles.contactSection}>
                        <Text style={styles.sectionTitle}>Your Contact Information</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                >
                    <TouchableOpacity style={styles.submitTouchable} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Submit Report</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Confirmation Toast */}
            {showToast && (
                <View style={styles.toast}>
                    <Icon name="check-circle" size={20} color={COLORS.white} />
                    <Text style={styles.toastText}>Your report has been submitted.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // border-gray-200/50 approx
        backgroundColor: COLORS.background,
    },
    headerLeft: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20, // text-xl
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
        marginRight: 48, // pr-12 approx
        letterSpacing: -0.3,
    },
    headerSpacer: {
        width: 48,
        height: 48,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24, // Extra for submit
    },
    body: {
        flexGrow: 1,
    },
    section: {
        marginBottom: 24, // space-y-6 approx
    },
    sectionTitle: {
        fontSize: 20, // text-xl
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12, // pb-3 pt-2 approx
        letterSpacing: -0.3, // tracking-light approx
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12, // gap-3
    },
    categoryChip: {
        height: 40, // h-10
        paddingHorizontal: 16, // pl-4 pr-4
        borderRadius: 9999, // rounded-full
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    selectedChip: {
        backgroundColor: COLORS.primary + '32', // bg-primary/20 approx
        borderColor: COLORS.primary,
    },
    unselectedChip: {
        backgroundColor: COLORS.white,
        borderColor: '#E5E7EB', // border-gray-200
    },
    categoryText: {
        fontSize: 14, // text-sm
        fontWeight: '600', // font-medium
    },
    selectedText: {
        color: COLORS.primary,
    },
    unselectedText: {
        color: COLORS.muted,
    },
    inputSection: {
        gap: 16, // space-y-4
        flexDirection: 'column',
    },
    inputGroup: {
        gap: 8, // pb-2 approx
    },
    descriptionGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16, // text-base
        fontWeight: '500', // font-medium
        color: COLORS.textPrimary,
    },
    textInput: {
        height: 56, // h-14
        padding: 15,
        borderRadius: 12, // rounded-xl
        borderWidth: 1,
        borderColor: '#D1D5DB', // border-gray-300
        backgroundColor: COLORS.white,
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.textPrimary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1, // shadow-sm
    },
    textArea: {
        minHeight: 144, // min-h-36
        textAlignVertical: 'top',
    },
    mediaContainer: {
        marginTop: 16,
    },
    addMediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56, // py-4 approx
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB', // border-gray-300
        backgroundColor: COLORS.white,
    },
    addMediaText: {
        fontSize: 14, // text-sm
        fontWeight: '500', // font-medium
        color: COLORS.muted,
    },
    previewContainer: {
        position: 'relative',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: COLORS.white,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactSection: {
        gap: 16, // space-y-4
    },
    submitContainer: {
        padding: 16,
        paddingBottom: 24, // pb-6
        backgroundColor: COLORS.background,
    },
    submitButton: {
        height: 56, // h-14
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24, // px-6
    },
    submitText: {
        fontSize: 16, // text-base
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.5, // tracking-wide approx
    },
    toast: {
        position: 'absolute',
        bottom: 96, // bottom-24 approx (6rem=96px)
        left: screenWidth / 2 - 120, // Approximate centering, adjust as needed
        right: screenWidth / 2 + 120 - screenWidth, // Wait, better use transform
        // For exact: use transform: [{ translateX: -width/2 }]
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#111827', // bg-gray-900
        paddingHorizontal: 24, // px-6
        paddingVertical: 12, // py-3
        borderRadius: 9999, // rounded-full
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 8, // shadow-lg approx
        minWidth: 240, // To fit content
        transform: [{ translateX: -screenWidth / 2 }],
    },
    toastText: {
        fontSize: 14, // text-sm
        fontWeight: '500', // font-medium
        color: COLORS.white,
    },
});

export default ReportProblemScreen;