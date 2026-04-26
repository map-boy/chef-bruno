import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chefbruno.app',
  appName: 'Chef Bruno',
  webDir: 'dist-app',
  android: {
    backgroundColor: '#1A1A1A',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1A1A1A',
      showSpinner: false,
    },
  },
};

export default config;