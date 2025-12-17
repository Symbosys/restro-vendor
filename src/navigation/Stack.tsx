import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalAlert from '../components/alert/GlobalAlert';
import CustomAlert from '../components/ui/custom/CustomAlert';
import { navigationRef } from '../helpers/navigationService';
import LoginScreen from '../screen/auth/login';
import OTP from '../screen/auth/Otp';
import PrivacyPolicy from '../screen/legal/PrivacyPolicy';
import TermsAndConditions from '../screen/legal/TermsAndCondition';
import OrderDetailsScreen from '../screen/orders/OrderDetails';
import OutletScreen from '../screen/outlet/Outlet';
import PackingScreen from '../screen/packing/PackingItem';
import PackingItemCart from '../screen/packing/PackingItemCart';
import PackingOrderConfirmedScreen from '../screen/packing/PackingOrderConfirm';
import PackingOrderHistoryScreen from '../screen/packing/PackingOrderHistory';
import InstallmentDetailsScreen from '../screen/packing/PackingOrderInstallment';
import ProductsScreen from '../screen/products/MyProducts';
import Splash from '../screen/splash/Splash';
import AISupportAssistantScreen from '../screen/supprot/AiAssistant';
import HelpSupportScreen from '../screen/supprot/HelpAndSupport';
import ReportProblemScreen from '../screen/supprot/ReportIssue';
import NotificationsScreen from '../screen/tabs/Notification';
import DocumentVerification from '../screen/verification/Documents';
import VendorInventoryScreen from '../screen/verification/Inventory';
import ShopDetails from '../screen/verification/ShopDetails';
import Uplod from '../screen/verification/ShopeImge';
import UpdateProfile from '../screen/verification/UpdatePofile';
import { RootStackParamList } from '../types/types';
import BottomTab from './Bottom';
import Analytics from '../screen/tabs/Analytics';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        // initialRouteName='ProductSelection'
      
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
        <Stack.Screen name="ProductSelection" component={VendorInventoryScreen} /> 


        <Stack.Screen name="BottomTab" component={BottomTab} />

        <Stack.Screen name='Notification' component={NotificationsScreen} />

        <Stack.Screen name='MyProducts' component={ProductsScreen} />

        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />

        
        {/* Legal Screen  */}
        <Stack.Screen name='TermsAndConditions' component={TermsAndConditions} />
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy} />

        <Stack.Screen name='Analytics' component={Analytics} />


        {/* Packing Beg  */}
        <Stack.Screen name="PackingBegItems" component={PackingScreen} />
        <Stack.Screen name='Packingcart' component={PackingItemCart} />
        <Stack.Screen name='PackingOrderConfirmation' component={PackingOrderConfirmedScreen} />
        <Stack.Screen name='PackingOrderHistory' component={PackingOrderHistoryScreen} />
        <Stack.Screen name='PackingOrderInstallment' component={InstallmentDetailsScreen} />


        {/* Help And Support */}
        <Stack.Screen name='HelpSupport' component={HelpSupportScreen} />
        <Stack.Screen name='ReportIssue' component={ReportProblemScreen} />
        <Stack.Screen name='AiAssistant' component={AISupportAssistantScreen} />
      </Stack.Navigator>

      <CustomAlert />
      <GlobalAlert />
    </NavigationContainer>
  );
}