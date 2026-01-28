export type RootStackParamList = {
  Splash: undefined;
  Simulator: undefined;
  Home: undefined;
  Contract: { tab?: 'electricity' | 'gas' } | undefined;
  Contact: undefined;
  FAQ: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
