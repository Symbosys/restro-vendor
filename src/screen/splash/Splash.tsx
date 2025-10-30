import React, {useEffect} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { useAuth } from '../../context/AuthContext';



type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Splash = () => {
  const navigation = useNavigation<NavigationProps>();
  const { isAuthenticated, vendorId, token } = useAuth()
  console.log(isAuthenticated, vendorId, token)

  // 🚀 Navigation Logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        navigation.navigate('BottomTab');
      } else if (!vendorId || !token) {
        navigation.navigate('Login');
      } else {
        navigation.navigate('Outlet');
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, vendorId, token, navigation]);

  return (
    <View style={styles.container}>
      {/* Add your splash screen logo or image here */}
      <Image
        source={require('../../assets/logo/LOGO.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: '70%',
  },
});

export default Splash;
