import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLogoutFunction } from '../helpers/navigationService';

interface VendorAuthContextType {
    token: string | null;
    vendorId: string | null;
    fcmToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (vendorId: string, token: string) => Promise<void>;
    logout: () => Promise<void>;
    setFcmToken: (token: string) => Promise<void>;
    setAuthStatus: (status: boolean) => Promise<void>;
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [fcmToken, setFcmTokenState] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLogoutFunction(logout); // 🔥 expose logout globally
    });

    useEffect(() => {
        const loadSession = async () => {
            try {
                const [
                    storedToken,
                    storedVendorId,
                    storedFcmToken,
                    storedIsAuthenticated,
                ] = await Promise.all([
                    AsyncStorage.getItem('vendorToken'),
                    AsyncStorage.getItem('vendorId'),
                    AsyncStorage.getItem('vendorFcmToken'),
                    AsyncStorage.getItem('vendorIsAuthenticated'),
                ]);

                if (storedToken) setToken(storedToken);
                if (storedVendorId) setVendorId(storedVendorId);
                if (storedFcmToken) setFcmTokenState(storedFcmToken);
                if (storedIsAuthenticated === 'true') setIsAuthenticated(true);
            } catch (e) {
                console.log('Failed to restore session:', e);
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    const login = async (id: string, tok: string) => {
        setVendorId(id);
        setToken(tok);
        await AsyncStorage.multiSet([
            ['vendorId', id],
            ['vendorToken', tok],
        ]);
    };

    const setFcmToken = async (newToken: string) => {
        setFcmTokenState(newToken);
        await AsyncStorage.setItem('vendorFcmToken', newToken);
    };

    const setAuthStatus = async (status: boolean) => {
        setIsAuthenticated(status);
        await AsyncStorage.setItem('vendorIsAuthenticated', status ? 'true' : 'false');
    };

    const logout = async () => {
        setToken(null);
        setVendorId(null);
        setFcmTokenState(null);
        setIsAuthenticated(false);

        await AsyncStorage.multiRemove([
            'vendorToken',
            'vendorId',
            'vendorFcmToken',
            'vendorIsAuthenticated',
        ]);
    };

    return (
        <VendorAuthContext.Provider
            value={{
                token,
                vendorId,
                fcmToken,
                isAuthenticated,
                loading,
                login,
                logout,
                setFcmToken,
                setAuthStatus,
            }}>
            {children}
        </VendorAuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(VendorAuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthProvider;
