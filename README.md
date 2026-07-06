# divine-mobile

The mobile client application for the Divine Garbh Sanskar application. Built with React Native and managed via Expo CLI.

## Local Development Startup

### 1. Installation
Navigate to the mobile directory and install dependencies:
```bash
cd divine-mobile
npm install
```

### 2. Launch Developer Tools
Launch the Expo development server:
```bash
npx expo start
```

### 3. Run on Devices
- **Android Emulator**: Press `a` in the terminal to launch.
- **iOS Simulator**: Press `i` in the terminal to launch.
- **Physical Device**: Install the **Expo Go** application on your iOS or Android phone, and scan the terminal QR code to load the app live.

## Security & Gitignore Guidelines

* **Do not commit build folders:** The compiled build outputs (exported in `dist/` or `web-build/`) contain client-side minified code with your public Firebase environment keys embedded. The `.gitignore` has been updated to ignore these folders. Do not bypass it.
* **API Key Restrictions:** If GitHub alerts you about exposed Google/Firebase API keys, go to your **Google Cloud Platform Console -> APIs & Services -> Credentials** and edit your API key. Restrict it to only work for Android Package Names and iOS Bundle Identifiers matching your app. This makes the key completely safe, even if it is seen in your public bundles!

