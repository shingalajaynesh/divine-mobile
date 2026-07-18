# divine-mobile

The mobile client application for the Divine Garbh Sanskar application. Built with React Native, React Native Web, and managed via Expo CLI.

## Core Features

- **Maternal Health logs**: Mobile-optimized vitals tracking (sleep patterns, hydration levels, mood logging, and prenatal nutrition).
- **Daily Activities Quotient**: Step-by-step guides for PQ, IQ, EQ, and SQ activities tailored to the user's current pregnancy week.
- **Partner Dashboard**: Co-parenting interface where partners log shared activities, view vitals, and review progress.
- **Support Desk Hub**: Patient ticket creator, chat history, and direct WhatsApp handoff guides.

---

## Directory Map

```text
divine-mobile/
├── src/
│   ├── components/      # Reusable Native widgets (Audio, Video, reading overlays)
│   ├── config/          # Firebase and Apollo Client configs
│   ├── graphql/         # Operations (queries & mutations)
│   ├── theme/           # Style definitions, sizing, and colors
│   └── views/           # Primary page views (TodayDashboard, VitalsTracker)
├── App.js               # Application entry point & routing navigator
└── app.json             # Expo configuration properties
```

---

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
- **Android Emulator**: Press `a` in the terminal to launch on your active emulator.
- **iOS Simulator**: Press `i` in the terminal to launch on your active simulator.
- **Physical Device**: Install the **Expo Go** application on your iOS or Android phone, and scan the terminal QR code to load the app live.

---

## Security & Gitignore Guidelines

* **Do not commit build folders:** The compiled build outputs (exported in `dist/` or `web-build/`) contain client-side minified code with your public Firebase environment keys embedded. The `.gitignore` has been updated to ignore these folders. Do not bypass it.
* **API Key Restrictions**: If GitHub alerts you about exposed Google/Firebase API keys, go to your **Google Cloud Platform Console -> APIs & Services -> Credentials** and edit your API key. Restrict it to only work for Android Package Names and iOS Bundle Identifiers matching your app. This makes the key completely safe, even if it is seen in your public bundles!

---

## ⚠️ Security Warning: Rotate Credentials

> [!WARNING]
> If any secrets, API keys, passwords, database connection strings, or tokens were previously hardcoded in the source code files, those values remain visible in the repository's git commit history. 
> 
> **You must immediately rotate all previously hardcoded keys and credentials before deploying this application to production.**

