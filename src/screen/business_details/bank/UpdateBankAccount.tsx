import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Loader from '../../../components/ui/Loader';
import { useAuth } from '../../../context/AuthContext';
import { useUpdateBankAccount } from '../../../api/hooks/bank';
import { COLORS } from '../../../theme/color';
import { AppNavigation } from '../../../types/types';
import { useRoute } from '@react-navigation/native';

const UpdateBankAccountScreen = ({ navigation }: AppNavigation) => {
    const { vendorId } = useAuth();
    const route = useRoute<any>();
    const { bankId, bankDetails } = route.params || {};

    const updateBankMutation = useUpdateBankAccount();

    const [form, setForm] = useState({
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
        branch: '',
    });

    useEffect(() => {
        if (bankDetails) {
            setForm({
                accountHolder: bankDetails.accountHolder || '',
                bankName: bankDetails.bankName || '',
                accountNumber: bankDetails.accountNumber || '',
                ifsc: bankDetails.ifsc || '',
                branch: bankDetails.branch || '',
            });
        }
    }, [bankDetails]);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!vendorId || !bankId) return;

        try {
            await updateBankMutation.mutateAsync({
                id: bankId,
                payload: {
                    accountHolder: form.accountHolder,
                    bankName: form.bankName,
                    accountNumber: form.accountNumber,
                    ifsc: form.ifsc,
                    branch: form.branch,
                    vendorId: vendorId // Assuming payload needs it or it is ignored, checking service def
                }
            });

            navigation.goBack();
        } catch (error) {
            console.error(error);
        }
    };

    if (updateBankMutation.isPending) return <Loader />;

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>Update Bank Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Holder Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.accountHolder}
                                onChangeText={(t) => handleChange('accountHolder', t)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bank Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.bankName}
                                onChangeText={(t) => handleChange('bankName', t)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Number *</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="number-pad"
                                value={form.accountNumber}
                                onChangeText={(t) => handleChange('accountNumber', t)}
                            // secureTextEntry // Updating should probably show it? Or assume it's masked initially but editable? Let's show it for update.
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>IFSC Code *</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="characters"
                                value={form.ifsc}
                                onChangeText={(t) => handleChange('ifsc', t)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Branch</Text>
                            <TextInput
                                style={styles.input}
                                value={form.branch}
                                onChangeText={(t) => handleChange('branch', t)}
                            />
                        </View>

                        {bankDetails?.rejectReason && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorTitle}>Reject Reason:</Text>
                                <Text style={styles.errorText}>{bankDetails.rejectReason}</Text>
                            </View>
                        )}

                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Update Details</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
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
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        elevation: 4,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FAC7C7',
        marginTop: 10,
    },
    errorTitle: {
        color: '#DC2626',
        fontWeight: '700',
        marginBottom: 4,
    },
    errorText: {
        color: '#7F1D1D',
    }
});

export default UpdateBankAccountScreen;
