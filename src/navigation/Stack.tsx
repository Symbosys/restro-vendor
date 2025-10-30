import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OutletScreen from '../screen/outlet/Outlet';
import Splash from '../screen/splash/Splash';
import { RootStackParamList } from '../types/types';
import DocumentVerification from '../screen/Documents/Documents';
import LoginScreen from '../screen/auth/login';
import OTP from '../screen/auth/Otp';
import UpdateProfile from '../screen/profile/UpdatePofile'; 
import Uplod from '../screen/profile/ShopeImge';  
import ShopDetails from '../screen/verification/ShopDetails';
import BottomTab from './Bottom';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName='Uplod'
      
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OTP} />

        <Stack.Screen name="Outlet" component={OutletScreen} />

         {/* Verification setup */}
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
        <Stack.Screen name="Documents" component={DocumentVerification} />
        <Stack.Screen name='ShopDetails' component={ShopDetails} />
        <Stack.Screen name="ShopImage" component={Uplod} /> 


        <Stack.Screen name="BottomTab" component={BottomTab} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}