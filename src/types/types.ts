import { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Outlet: undefined;
  Otp: { mobile: string };
  Login: undefined;
  Documents: undefined;
  UpdateProfile: undefined;
  ShopDetails: undefined;
  ShopImage: undefined;
  SignatureUpload: undefined;
  ProductSelection: undefined;
  BankAccount: undefined;
  BankList: undefined;
  UpdateBankAccount: { bankId: string | number; bankDetails: any };

  Notification: undefined;

  BottomTab: undefined;
  MyProducts: undefined;

  OrderDetails: { orderId: number | string };


  Analytics: undefined;

  // Packing
  PackingBegItems: undefined;
  Packingcart: undefined;
  PackingOrderConfirmation: undefined;
  PackingOrderHistory: undefined;
  PackingOrderInstallment: { orderId?: string; planId?: string } | undefined;

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

  // Issues
  MyTickets: undefined;
  TicketDetails: { ticketId: string };

  // Business Details
  MyShopDetails: undefined;
  MyDocuments: undefined;
};

export type AppNavigation = {
  navigation: NavigationProp<RootStackParamList>;
  route: any;
};
