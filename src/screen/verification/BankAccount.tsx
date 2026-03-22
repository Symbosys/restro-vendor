import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm as useRHForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { z } from 'zod';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { useVendorById } from '../../hooks/useVendorQueries';
import { createBankAccount } from '../../services/bank.service';
import useAlertStore from '../../store/useAlertStore';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { CreateVendorBankAccountValidator } from '../../validations/bank.validator';

// Extend the imported schema with confirmAccountNumber for the form
const BankAccountFormSchema = CreateVendorBankAccountValidator.extend({
    confirmAccountNumber: z.string().min(1, "Please confirm your account number"),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
});

type BankAccountFormValues = z.infer<typeof BankAccountFormSchema>;

const BankAccountScreen = ({ navigation }: AppNavigation) => {
    const { vendorId } = useAuth();
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlertStore();
    const { data: vendor } = useVendorById();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useRHForm<BankAccountFormValues>({
        resolver: zodResolver(BankAccountFormSchema),
        defaultValues: {
            accountHolder: '',
            bankName: '',
            accountNumber: '',
            confirmAccountNumber: '',
            ifsc: '',
            branch: '',
        },
    });

    const onSubmit = async (data: BankAccountFormValues) => {
        if (!vendorId) {
            showAlert("Error", "Vendor ID missing", "error");
            return;
        }

        try {
            setLoading(true);
            await createBankAccount({
                vendorId,
                accountHolder: data.accountHolder,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                ifsc: data.ifsc,
                branch: data.branch || "",
            });

            // Navigate back to Outlet to trigger status check and next flow
            // navigation.reset({
            //     index: 0,
            //     routes: [{ name: 'Outlet' }],
            // });
            if (vendor?.status === 'APPROVED') {
                navigation.goBack();
            } else {
                navigation.navigate('SignatureUpload');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>Bank Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Add Bank Account</Text>
                        <Text style={styles.subtitle}>
                            Provide your bank details to receive payouts directly.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Account Holder Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Holder Name *</Text>
                            <Controller
                                control={control}
                                name="accountHolder"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.accountHolder && styles.inputError]}
                                        placeholder="Ex. John Doe"
                                        placeholderTextColor="#9CA3AF"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.accountHolder && (
                                <Text style={styles.errorText}>{errors.accountHolder.message}</Text>
                            )}
                        </View>

                        {/* Bank Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bank Name *</Text>
                            <Controller
                                control={control}
                                name="bankName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.bankName && styles.inputError]}
                                        placeholder="Ex. HDFC Bank"
                                        placeholderTextColor="#9CA3AF"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.bankName && (
                                <Text style={styles.errorText}>{errors.bankName.message}</Text>
                            )}
                        </View>

                        {/* Account Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Number *</Text>
                            <Controller
                                control={control}
                                name="accountNumber"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.accountNumber && styles.inputError]}
                                        placeholder="Enter Account Number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="number-pad"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        secureTextEntry
                                    />
                                )}
                            />
                            {errors.accountNumber && (
                                <Text style={styles.errorText}>{errors.accountNumber.message}</Text>
                            )}
                        </View>

                        {/* Confirm Account Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Account Number *</Text>
                            <Controller
                                control={control}
                                name="confirmAccountNumber"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.confirmAccountNumber && styles.inputError]}
                                        placeholder="Re-enter Account Number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="number-pad"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.confirmAccountNumber && (
                                <Text style={styles.errorText}>{errors.confirmAccountNumber.message}</Text>
                            )}
                        </View>

                        {/* IFSC Code */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>IFSC Code *</Text>
                            <Controller
                                control={control}
                                name="ifsc"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.ifsc && styles.inputError]}
                                        placeholder="Ex. HDFC0001234"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="characters"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.ifsc && (
                                <Text style={styles.errorText}>{errors.ifsc.message}</Text>
                            )}
                        </View>

                        {/* Branch (Optional) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Branch (Optional)</Text>
                            <Controller
                                control={control}
                                name="branch"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.branch && styles.inputError]}
                                        placeholder="Ex. Indiranagar"
                                        placeholderTextColor="#9CA3AF"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.branch && (
                                <Text style={styles.errorText}>{errors.branch.message}</Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.submitButtonText}>Save Details</Text>
                        <Icon name="arrow-right" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    headerSection: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    formContainer: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default BankAccountScreen;
