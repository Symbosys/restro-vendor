import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalAlert from '../components/alert/GlobalAlert';
import CustomAlert from '../components/ui/custom/CustomAlert';
import { navigationRef } from '../helpers/navigationService';
import LoginScreen from '../screen/auth/login';
import OTP from '../screen/auth/Otp';
import PrivacyPolicy from '../screen/legal/PrivacyPolicy';
import TermsAndConditions from '../screen/legal/TermsAndCondition';
import Docs from '../screen/legal/Docs';
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
import BankAccountScreen from '../screen/verification/BankAccount';
import BankListScreen from '../screen/business_details/bank/BankList';
import UpdateBankAccountScreen from '../screen/business_details/bank/UpdateBankAccount';
import MyDocuments from '../screen/business_details/documents/MyDocuments';
import ShopDetails from '../screen/verification/ShopDetails';
import Uplod from '../screen/verification/ShopeImge';
import SignatureUpload from '../screen/verification/SignatureUpload';
import UpdateProfile from '../screen/verification/UpdatePofile';
import { RootStackParamList } from '../types/types';
import BottomTab from './Bottom';
import Analytics from '../screen/tabs/Analytics';
import MyTicketsScreen from '../screen/supprot/Issues/MyTickets';
import TicketDetailsScreen from '../screen/supprot/Issues/TicketDetails';
import MyShopDetails from '../screen/business_details/shop_details/MyShopDetails';
import TestLocation from '../screen/userAddress/TestLocation';
import WorkLocationScreen from '../screen/business_details/worklocation/WorkLocationScreen';
import PayoutScreen from '../screen/payout/PayoutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        // initialRouteName='ShopImage'

        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OTP} />

        <Stack.Screen name="Outlet" component={OutletScreen} />

        {/* Verification setup */}
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
        <Stack.Screen name="Documents" component={DocumentVerification} />
        <Stack.Screen name="ShopDetails" component={ShopDetails} />
        <Stack.Screen name="ShopImage" component={Uplod} />
        <Stack.Screen name="SignatureUpload" component={SignatureUpload} />
        <Stack.Screen
          name="ProductSelection"
          component={VendorInventoryScreen}
        />
        <Stack.Screen name="BankAccount" component={BankAccountScreen} />

        {/* Bottom Tab */}
        <Stack.Screen name="BottomTab" component={BottomTab} />

        {/* Business Details */}
        <Stack.Screen name="BankList" component={BankListScreen} />
        <Stack.Screen name="Payout" component={PayoutScreen} />
        <Stack.Screen
          name="UpdateBankAccount"
          component={UpdateBankAccountScreen}
        />
        <Stack.Screen name="MyDocuments" component={MyDocuments} />
        <Stack.Screen name="MyShopDetails" component={MyShopDetails} />
        <Stack.Screen name="TestLocation" component={TestLocation} />
        <Stack.Screen name="WorkLocation" component={WorkLocationScreen} />

        <Stack.Screen name="Notification" component={NotificationsScreen} />

        <Stack.Screen name="MyProducts" component={ProductsScreen} />

        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />

        {/* Legal Screen  */}
        <Stack.Screen
          name="TermsAndConditions"
          component={TermsAndConditions}
        />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="Docs" component={Docs} />

        <Stack.Screen name="Analytics" component={Analytics} />

        {/* Packing Beg  */}
        <Stack.Screen name="PackingBegItems" component={PackingScreen} />
        <Stack.Screen name="Packingcart" component={PackingItemCart} />
        <Stack.Screen
          name="PackingOrderConfirmation"
          component={PackingOrderConfirmedScreen}
        />
        <Stack.Screen
          name="PackingOrderHistory"
          component={PackingOrderHistoryScreen}
        />
        <Stack.Screen
          name="PackingOrderInstallment"
          component={InstallmentDetailsScreen}
        />

        {/* Help And Support */}
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="ReportIssue" component={ReportProblemScreen} />
        <Stack.Screen name="AiAssistant" component={AISupportAssistantScreen} />

        {/* Issues  */}
        <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
        <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      </Stack.Navigator>

      <CustomAlert />
      <GlobalAlert />
    </NavigationContainer>
  );
}
