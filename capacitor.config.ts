interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  [key: string]: any;
}

const config: CapacitorConfig = {
  appId: 'com.nestsave.app',
  appName: 'NestSave',
  webDir: 'out'
};

export default config;
