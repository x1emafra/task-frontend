import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.emanuel.taskapp',
  appName: 'task-app',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;