import { NavigationProp} from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Outlet: undefined;
  Otp: { mobile: string };
  Login: undefined;
  Documents: undefined;
  UpdateProfile: undefined;
  ShopDetails: undefined;

  TestLocation: undefined;

  ShopImage: undefined;
  SignatureUpload: undefined;
  ProductSelection: undefined;
  BankAccount: undefined;
  BankList: undefined;
  UpdateBankAccount: { bankId: string | number; bankDetails: any };

  Notification: undefined;
  Payout: undefined;

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
  Docs: { type: string };

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
  WorkLocation: undefined;
};

export type AppNavigation = {
  navigation: NavigationProp<RootStackParamList>;
  route: any;
};
