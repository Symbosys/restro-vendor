import React from 'react';
import { Animated, StyleSheet, Text, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigation } from '../types/types';
import { COLORS } from '../theme/color';
import Home from '../screen/tabs/Home';
import Orders from '../screen/tabs/Orders';
import Wallet from '../screen/tabs/Wallet'; // ✅ ADDED
import Profile from '../screen/tabs/Profile';
import Analytics from '../screen/tabs/Analytics';
// import Notification from '../screen/tabs/Notification';  // ❌ REMOVED
import { WebSocketProvider } from '../context/WebSocketContext';

export type RootTabParamList = {
    Home: undefined;
    Orders: undefined;
    Wallet: undefined; // ✅ ADDED
    Analytics: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTab = ({ navigation }: AppNavigation) => {
    return (
        // <WebSocketProvider>
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: string = '';
                        switch (route.name) {
                            case 'Home':
                                iconName = 'home';
                                break;
                            case 'Orders':
                                iconName = 'receipt';
                                break;
                            case 'Wallet': // ✅ ADDED
                                iconName = 'account-balance-wallet';
                                break;
                            case 'Analytics':
                                iconName = 'bar-chart';
                                break;
                            case 'Profile':
                                iconName = 'person';
                                break;
                            default:
                                iconName = 'circle';
                        }
                        return (
                            <Animated.View
                                style={[
                                    styles.iconContainer,
                                    { transform: [{ scale: focused ? 1.2 : 1 }] },
                                ]}>
                                <MaterialIcons name={iconName} size={size} color={color} />
                            </Animated.View>
                        );
                    },
                    tabBarLabel: ({ color }) => (
                        <Text
                            style={[styles.tabLabel, { color }]}
                            numberOfLines={1}
                        >
                            {route.name}
                        </Text>
                    ),
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.muted,
                    tabBarStyle: styles.tabBar,
                    tabBarItemStyle: styles.tabBarItem,
                })}>
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Orders" component={Orders} />

                {/* ❌ Removed Notification
                <Tab.Screen name="Notification" component={Notification} />
                */}

                {/* ✅ Added Wallet */}
                <Tab.Screen name="Wallet" component={Wallet} />

                <Tab.Screen name='Analytics' component={Analytics} />
                <Tab.Screen name="Profile" component={Profile} />
            </Tab.Navigator>
        </SafeAreaView>
        // </WebSocketProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    tabBar: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        height: Platform.OS === 'ios' ? 85 : 70,
        shadowColor: COLORS.textPrimary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderTopWidth: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabBarItem: {
        paddingVertical: 4,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});

export default BottomTab;
