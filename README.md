# RocketSingh Tackles

RocketSingh Tackles is a cross-platform home services app built with Expo, React Native, and Expo Router. The app helps customers browse maintenance services, submit bookings, contact the team, apply for careers, and explore partnership opportunities.

## Features

- Service catalog with detailed service pages
- Booking flow with customer details, OTP verification, and confirmation screens
- Drawer and bottom-tab navigation for Home, Services, Book, About, Contact, FAQs, Career, Gossip, and Partnership
- Admin login and booking-management screens
- Airtable-backed booking, career, partnership, and contact/helpbox submissions
- Cloudinary file upload support
- Android, iOS, and web support through Expo

## Tech Stack

- Expo SDK 54
- React 19 and React Native 0.81
- Expo Router 6
- React Navigation drawer and tabs
- Redux Toolkit
- Axios
- Airtable
- TypeScript

## Project Structure

```txt
app/
  _layout.tsx                    Root Expo Router layout
  index.tsx                      Initial route
  (onboarding)/                  Onboarding screens
  (admin)/                       Admin authentication route group
  (drawer)/                      Main drawer routes
    (tabs)/                      Home, Service, Book, About, Contact tabs
  booking/                       Booking detail, OTP, and confirmation routes
  service/                       Service detail route

src/
  api/                           Airtable and OTP API clients
  assets/                        App images and service media
  components/                    Shared UI components
  data/                          Static service, FAQ, and form option data
  navigationStack/               Legacy navigation components
  redux/                         Redux store and slices
  Screens/                       Main screen implementations

assets/
  images/                        Expo app icons and splash assets
  onBoarding/                    Onboarding images
```

## Prerequisites

- Node.js 20 or newer
- npm
- Expo CLI through `npx expo`
- Android Studio for Android development builds
- Xcode for iOS builds on macOS

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local `.env` file in the project root. You can start from `.env.example`:

```bash
EXPO_PUBLIC_AIRTABLE_TOKEN=
EXPO_PUBLIC_AIRTABLE_BASE_ID=
EXPO_PUBLIC_AIRTABLE_API_URL_BOOKING=
EXPO_PUBLIC_AIRTABLE_API_URL_SERVICES=
EXPO_PUBLIC_AIRTABLE_API_URL_CAREER=
EXPO_PUBLIC_AIRTABLE_API_URL_PARTNERSHIP=
EXPO_PUBLIC_AIRTABLE_API_URL_HELPBOX=
EXPO_PUBLIC_CLOUDINARY_URL=
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
EXPO_PUBLIC_TWILIO_BASE_URL=
```

Start the Expo development server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

## Available Scripts

```bash
npm start       # Start Expo
npm run android # Build and run the Android app
npm run ios     # Build and run the iOS app
npm run web     # Start the web version
npm run lint    # Run Expo linting
```

## Environment Notes

This project reads public Expo environment variables from `process.env.EXPO_PUBLIC_*`. Do not commit `.env`, keystores, service account files, or production credentials. Keep production secrets in your deployment/build provider or a secure local environment.

## Build Notes

The Expo app configuration is stored in `app.json`. Android native configuration is included under `android/`, and iOS native configuration is included under `ios/`.

For release builds, configure the required credentials locally or in EAS before building.

## License

Private project. All rights reserved.
