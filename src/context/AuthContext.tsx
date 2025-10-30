import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VendorAuthContextType {
    token: string | null;              // Vendor token
    vendorId: string | null;           // Vendor ID
    fcmToken: string | null;           // Firebase token
    isAuthenticated: boolean;          // ✅ Whether vendor is logged in
    loading: boolean;                  // Whether session is being restored
    login: (vendorId: string, token: string) => Promise<void>;
    logout: () => Promise<void>;
    setFcmToken: (token: string) => Promise<void>;
    setAuthStatus: (status: boolean) => Promise<void>; // ✅ Independent control
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [fcmToken, setFcmTokenState] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    // 🔹 Restore vendor session on app start
    useEffect(() => {
        const loadAuthData = async () => {
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
            } catch (error) {
                console.error('Failed to load vendor auth data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAuthData();
    }, []);

    // 🔹 Login → Save vendorId + Token
    const login = async (newVendorId: string, newToken: string) => {
        try {
            setVendorId(newVendorId);
            setToken(newToken);
            await AsyncStorage.multiSet([
                ['vendorId', newVendorId],
                ['vendorToken', newToken],
            ]);
        } catch (error) {
            console.error('Failed to save vendor login data:', error);
        }
    };

    // 🔹 Save FCM Token
    const setFcmToken = async (newFcmToken: string) => {
        try {
            setFcmTokenState(newFcmToken);
            await AsyncStorage.setItem('vendorFcmToken', newFcmToken);
        } catch (error) {
            console.error('Failed to save vendor FCM token:', error);
        }
    };

    // 🔹 Manually set authentication status
    const setAuthStatus = async (status: boolean) => {
        try {
            setIsAuthenticated(status);
            await AsyncStorage.setItem('vendorIsAuthenticated', status ? 'true' : 'false');
        } catch (error) {
            console.error('Failed to update vendor authentication status:', error);
        }
    };

    // 🔹 Logout → Clear all data
    const logout = async () => {
        try {
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
        } catch (error) {
            console.error('Failed to clear vendor auth data:', error);
        }
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
            }}
        >
            {children}
        </VendorAuthContext.Provider>
    );
};

// 🔹 Custom Hook
export const useAuth = () => {
    const context = useContext(VendorAuthContext);
    if (!context) {
        throw new Error('useVendorAuth must be used within VendorAuthProvider');
    }
    return context;
};

export default AuthProvider;
