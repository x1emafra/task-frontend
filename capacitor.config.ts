import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'task-frontend',
  webDir: 'dist',
  server: {
    url: 'http://10.151.128.39:5173',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;