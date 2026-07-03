# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Environment variables (required for production)

Local dev loads `.env` automatically. **EAS builds do not** — you must sync vars before each production build:

```bash
cp .env.example .env   # first time only
npm run sync-eas-env   # pushes EXPO_PUBLIC_* to EAS production/preview/development
eas build --platform android --profile production
```

See `.env.example` for the full list. Without these, the Play Store app gets `undefined` Firebase/Supabase config and fails at runtime.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

# project structure 

```txt
app/
├── _layout.tsx             # Root navigation
├── index.tsx               # Entry point
|
├── (onboarding)/           # Onboarding flow
│   ├── _layout.tsx
│   ├── onboarding1.tsx
│   ├── onboarding2.tsx
│   ├── onboarding3.tsx
|
├── (admin)/                 # ADMIN 
│   ├── _layout.tsx
│   ├── AdminLogin.tsx
|
├── (drawer)/                # Main application
│   ├── _layout.tsx
│   ├── Partnership.tsx
│   ├── Career.tsx
│   ├── FAQs.tsx
│   ├── Gossip.tsx
|   |
│   ├── (tabs)/             # Bottom Tabs inside
│   │   ├── _layout.tsx
│   │   ├── Home.tsx
│   │   ├── Service.tsx
│   │   ├── Book.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
|   |   
│   ├── details/
│   |   └── [id].tsx  


```
