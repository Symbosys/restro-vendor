import React, { useState } from 'react';
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
// import GlobalHeader from '../../components/ui/custom/GlobalHeader';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { createBankAccount } from '../../services/bank.service';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

const BankAccountScreen = ({ navigation }: AppNavigation) => {
    const { vendorId } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifsc: '',
        branch: '',
    });

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!form.accountHolder || !form.bankName || !form.accountNumber || !form.ifsc) {
            // You can use a toast or alert here
            console.warn("Please fill all mandatory fields");
            return;
        }

        if (form.accountNumber !== form.confirmAccountNumber) {
            console.warn("Account numbers do not match");
            return;
        }

        if (!vendorId) {
            console.warn("Vendor ID missing");
            return;
        }

        try {
            setLoading(true);
            await createBankAccount({
                vendorId,
                accountHolder: form.accountHolder,
                bankName: form.bankName,
                accountNumber: form.accountNumber,
                ifsc: form.ifsc,
                branch: form.branch,
            });

            // Navigate back to Outlet to trigger status check and next flow
            navigation.reset({
                index: 0,
                routes: [{ name: 'Outlet' }],
            });
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
                            <TextInput
                                style={styles.input}
                                placeholder="Ex. John Doe"
                                placeholderTextColor="#9CA3AF"
                                value={form.accountHolder}
                                onChangeText={(t) => handleChange('accountHolder', t)}
                            />
                        </View>

                        {/* Bank Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bank Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex. HDFC Bank"
                                placeholderTextColor="#9CA3AF"
                                value={form.bankName}
                                onChangeText={(t) => handleChange('bankName', t)}
                            />
                        </View>

                        {/* Account Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Account Number"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="number-pad"
                                value={form.accountNumber}
                                onChangeText={(t) => handleChange('accountNumber', t)}
                                secureTextEntry
                            />
                        </View>

                        {/* Confirm Account Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Account Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter Account Number"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="number-pad"
                                value={form.confirmAccountNumber}
                                onChangeText={(t) => handleChange('confirmAccountNumber', t)}
                            />
                        </View>

                        {/* IFSC Code */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>IFSC Code *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex. HDFC0001234"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                value={form.ifsc}
                                onChangeText={(t) => handleChange('ifsc', t)}
                            />
                        </View>

                        {/* Branch (Optional) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Branch (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex. Indiranagar"
                                placeholderTextColor="#9CA3AF"
                                value={form.branch}
                                onChangeText={(t) => handleChange('branch', t)}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
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
