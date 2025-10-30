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
  
   BottomTab: undefined;
};


export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
}

