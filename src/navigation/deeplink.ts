import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';

export const deeplink: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'mintafresh-vendor://',
    'mintafreshvendor://',
    'https://vendor.mintafresh.com',
    'https://mintafresh.com/vendor',
    'https://mintafresh-vendor.com',
  ],
  config: {
    initialRouteName: 'BottomTab',
    screens: {
      Splash: 'splash',
      Login: 'login',
      Otp: 'otp',
      Outlet: 'outlet',

      UpdateProfile: 'profile/update',
      Documents: 'documents',
      ShopDetails: 'shop-details',
      ShopImage: 'shop-image',
      SignatureUpload: 'signature-upload',
      ProductSelection: 'product-selection',
      BankAccount: 'bank-account',

      BottomTab: {
        initialRouteName: 'Home' as any,
        screens: {
          Home: 'home',
          Orders: 'orders',
          Wallet: 'wallet',
          Inventory: 'inventory',
          Profile: 'profile',
        },
      },

      BankList: 'bank-list',
      Payout: 'payout',
      UpdateBankAccount: 'bank-account/update/:bankId',
      MyDocuments: 'my-documents',
      MyShopDetails: 'my-shop-details',
      TestLocation: 'test-location',
      WorkLocation: 'work-location',

      Notification: 'notification',
      MyProducts: 'my-products',
      OrderDetails: 'order/:orderId',

      TermsAndConditions: 'terms',
      PrivacyPolicy: 'privacy',
      Docs: 'docs/:type',

      Analytics: 'analytics',

      PackingBegItems: 'packing-beg-items',
      Packingcart: 'packing-cart',
      PackingOrderConfirmation: 'packing-order-confirmation',
      PackingOrderHistory: 'packing-order-history',
      PackingOrderInstallment: 'packing-order-installment',

      HelpSupport: 'help-support',
      HowToTrackOrder: 'track-order',
      SupportHistory: 'support-history',
      ChatWithSupport: 'chat-support',
      ReportIssue: 'report-issue',
      AiAssistant: 'ai-assistant',

      MyTickets: 'my-tickets',
      TicketDetails: 'ticket/:ticketId',
    },
  },
};
