import { NavigationProp } from "@react-navigation/native";




export type RootStackParamList = {
    Splash: undefined;
    Outlet: undefined;
    Otp: { mobile: string };
    Login: undefined;
    Documents: undefined;
    UpdateProfile: undefined;
    ShopDetails: undefined;
    ShopImage: undefined;

    Notification: undefined;

    BottomTab: undefined;
    MyProducts: undefined;

    OrderDetails: { orderId: number | string };

    // Packing
    PackingBegItems: undefined;
    Packingcart: undefined;
    PackingOrderConfirmation: undefined;
    PackingOrderHistory: undefined;
    PackingOrderInstallment: undefined;


    // Legal screen
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;

    // Support
  HelpSupport: undefined;
  HowToTrackOrder: undefined;
  SupportHistory: undefined;
  ChatWithSupport: undefined;
  ReportIssue: undefined;
  AiAssistant: undefined;
};


export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
}

