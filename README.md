# RocketSingh - Superfast Home Services Platform

## Comprehensive Technical Guide & Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Core Features](#4-core-features)
5. [State Management](#5-state-management)
6. [Database Integration](#6-database-integration)
7. [Authentication & Security](#7-authentication--security)
8. [Notifications System](#8-notifications-system)
9. [File Upload System](#9-file-upload-system)
10. [Routing Structure](#10-routing-structure)
11. [Component Library](#11-component-library)
12. [Development Setup](#12-development-setup)
13. [Deployment](#13-deployment)
14. [API Integration](#14-api-integration)
15. [Troubleshooting](#15-troubleshooting)
16. [Contributing](#16-contributing)

---

## 1. Project Overview

RocketSingh is a comprehensive on-demand home services platform built with React Native (Expo) that connects customers with verified professionals for various home services including plumbing, electrical work, cleaning, carpentry, and more. The platform features a role-based access system with three distinct user types: Users (customers), Professionals (service providers), and Administrators.

### Key Features

- **Multi-role Authentication**: User, Professional, Admin, and SuperAdmin roles
- **Service Booking**: End-to-end booking system with OTP verification
- **Push Notifications**: Real-time alerts using OneSignal
- **Image Uploads**: Multi-file upload with Supabase storage
- **Admin Dashboard**: Comprehensive management interface
- **Professional Profiles**: Service provider management
- **Helpbox System**: Quick assistance feature
- **Banner Management**: Dynamic promotional content
- **Glossary & FAQs**: Self-service knowledge base

### Application Architecture

The application follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────┐ │
│  │  Home   │ │ Services│ │   Book  │ │  About  │ │Contact│ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └──────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management Layer                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Redux Store │  │  React Context│  │   AsyncStorage    │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Service Layer                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  Supabase   │  │   Firebase   │  │    OneSignal       │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Interaction → UI Component → Custom Hook → API Layer → Database
                                                                  │
User Interaction ← UI Component ← Custom Hook ← API Layer ← Database
```

---

## 2. Technology Stack

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| Expo | 54.0.36 | Development platform |
| TypeScript | 5.9.2 | Type safety |
| Expo Router | 6.0.24 | File-based routing |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| Redux Toolkit | 2.12.0 | Global state management |
| React Context | - | User context provider |
| AsyncStorage | 2.2.0 | Local data persistence |

### Backend Services

| Service | Purpose |
|---------|---------|
| **Supabase** | Primary database, authentication, file storage |
| **Firebase** | Authentication, Realtime Database |
| **OneSignal** | Push notifications |
| **Infobip** | SMS/OTP delivery |

### UI & Styling Libraries

| Library | Purpose |
|---------|---------|
| react-native-element-dropdown | Dropdown components |
| react-native-responsive-screen | Responsive design |
| react-native-svg | SVG support |
| @expo/vector-icons | Icon library |
| expo-linear-gradient | Gradient backgrounds |

### Utility Libraries

| Library | Purpose |
|---------|---------|
| axios | HTTP requests |
| react-native-keyboard-aware-scroll-view | Keyboard management |
| @react-native-community/datetimepicker | Date picking |
| expo-image-picker | Image selection |
| expo-document-picker | Document selection |

---

## 3. Project Structure

```
rocketsingh/
├── app/                          # Expo Router - File-based routing
│   ├── (drawer)/                 # Drawer navigation group
│   │   ├── (tabs)/               # Bottom tabs
│   │   │   ├── booking/          # Booking flow screens
│   │   │   │   ├── BookingDetail.tsx
│   │   │   │   ├── BookingOtp.tsx
│   │   │   │   └── BookingVerify.tsx
│   │   │   ├── helpbox/          # Helpbox screens
│   │   │   │   ├── helpboxOTP.tsx
│   │   │   │   └── otpVerifiedHB.tsx
│   │   │   ├── service/          # Service screens
│   │   │   │   └── ServiceDetail.tsx
│   │   │   ├── Home.tsx          # Home screen
│   │   │   ├── Service.tsx       # Services listing
│   │   │   ├── Book.tsx          # Booking form
│   │   │   ├── About.tsx         # About page
│   │   │   ├── Contact.tsx       # Contact page
│   │   │   └── _layout.tsx       # Tabs layout
│   │   ├── admin/                # Admin screens
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── BookingHistory.tsx
│   │   │   ├── BookingDetails_1.tsx
│   │   │   ├── BookingDetails_2.tsx
│   │   │   ├── HelpboxHistory.tsx
│   │   │   ├── HelpboxDetails.tsx
│   │   │   ├── ProfessionalHistory.tsx
│   │   │   ├── ProfessionalDetails.tsx
│   │   │   ├── UpdateProfile.tsx
│   │   │   ├── ViewUpdatedProfile.tsx
│   │   │   ├── AdminPopUpBanner.tsx
│   │   │   ├── ViewNotifications.tsx
│   │   │   └── _layout.tsx       # Admin layout
│   │   ├── FAQs.tsx
│   │   ├── Glossary.tsx
│   │   ├── Partnership.tsx
│   │   ├── Career.tsx
│   │   └── _layout.tsx           # Drawer layout
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── onboarding1.tsx
│   │   ├── onboarding2.tsx
│   │   ├── onboarding3.tsx
│   │   └── _layout.tsx
│   ├── index.tsx                 # Entry point
│   └── _layout.tsx               # Root layout
│
├── api/                          # API integration layer
│   ├── supabase/                 # Supabase operations
│   │   ├── createBookingSupabase.ts
│   │   ├── createCareerSupabase.ts
│   │   ├── createHelpboxSB.ts
│   │   ├── createPartnershipSupabase.ts
│   │   ├── fetchBookingSB.ts
│   │   ├── fetchHelpboxSB.ts
│   │   ├── fetchWorkforceSB.ts
│   │   ├── updateBookingStatusSB.ts
│   │   ├── updateHelpboxStatusSB.ts
│   │   └── updateWorkforceStatusSB.ts
│   ├── hooks/                    # Custom API hooks
│   │   ├── useWorkforceProfile.ts
│   │   └── superadmin/
│   │       ├── updateWorkforceStatusSA.ts
│   │       └── useWorkforceUpdateProfile.ts
│   ├── notifications.ts
│   ├── roadBlocks.tsx
│   └── uploadToStorage.tsx
│
├── components/                   # Reusable components
│   ├── admin/                    # Admin components
│   │   ├── BookingCard.tsx
│   │   ├── ProfessionalCard.tsx
│   │   ├── HelpboxCard.tsx
│   │   ├── CustomTabBar.tsx
│   │   ├── InputField.tsx
│   │   ├── MultiSelectDropdown.tsx
│   │   └── SingleSelectDropdown.tsx
│   ├── bookings/                 # Booking components
│   │   ├── Dropdown.tsx
│   │   ├── DropdownAdd.tsx
│   │   ├── FileUploadBox.tsx
│   │   ├── SubmitOverlay.tsx
│   │   └── TextArea.tsx
│   ├── home/                     # Home components
│   │   ├── NumberBar.tsx
│   │   ├── OurTeamCard.tsx
│   │   ├── ProfessionalCard.tsx
│   │   └── ServicesCard.tsx
│   ├── onBoarding/               # Onboarding components
│   │   ├── ButtonComponent.tsx
│   │   └── onboardingComponent.tsx
│   ├── services/                 # Service components
│   │   ├── ServicesCards.tsx
│   │   ├── ServicesDisplaycard.tsx
│   │   └── SliderCard.tsx
│   ├── BannerManager.tsx
│   ├── CustomDrawer.tsx
│   ├── Header2.tsx
│   ├── Header3drawer.tsx
│   ├── Header4Admin.tsx
│   ├── Header5Admin.tsx
│   └── RoadBlockCard.tsx
│
├── src/                          # Source code
│   ├── context/                  # React contexts
│   │   └── userContext.tsx
│   ├── redux/                    # Redux slices
│   │   ├── authSlice.ts
│   │   └── store.ts
│   ├── services/                 # Service layer
│   │   ├── bannerService.ts
│   │   └── supabaseService.ts
│   ├── utils/                    # Utilities
│   │   ├── fileUploadBooking.ts
│   │   ├── fileUploadRoadBlock.ts
│   │   ├── fileUploadRoadBlockUpdated.ts
│   │   ├── uploadImageToSBCareer.ts
│   │   ├── uploadImageToSBPartnership.ts
│   │   └── uploadWorkforceUpdate.ts
│   ├── data/                     # Static data
│   │   ├── Data.ts
│   │   ├── ServiceData.ts
│   │   ├── FAQsData.tsx
│   │   └── GlossaryData2.ts
│   ├── lib/                      # Library configs
│   │   └── supabase.ts
│   ├── firebase/                 # Firebase config
│   │   └── firebaseConfig.js
│   ├── store/                    # Local stores
│   │   └── otpStore.ts
│   └── types/                    # Type definitions
│       └── assets.d.ts
│
├── assets/                       # Static assets
│   ├── aboutUs/
│   ├── header/
│   ├── home/
│   ├── icons/
│   ├── images/
│   ├── onBoarding/
│   ├── otherImages/
│   ├── services/
│   └── topProfessionals/
│
├── hooks/                        # Custom React hooks
│   └── useBanner.ts
│
├── scripts/                      # Build scripts
│   └── sync-eas-env.mjs
│
├── android/                      # Android native code
├── ios/                          # iOS native code
├── .env.example                  # Environment variables template
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── metro.config.js               # Metro bundler config
├── eslint.config.js              # ESLint configuration
├── google-services.json          # Firebase configuration
└── firebase.json                 # Firebase settings
```

### Important Files Explanation

| File/Directory | Purpose |
|----------------|---------|
| `app/_layout.tsx` | Root layout with authentication and OneSignal initialization |
| `app/index.tsx` | Entry point with splash screen and onboarding check |
| `src/lib/supabase.ts` | Supabase client configuration |
| `src/firebase/firebaseConfig.js` | Firebase initialization |
| `api/notifications.ts` | OneSignal notification system |
| `components/CustomDrawer.tsx` | Custom drawer menu with role-based items |
| `src/data/Data.ts` | Dropdown options and static data |

---

## 4. Core Features

### 4.1 Authentication System

The app uses Firebase Authentication with role-based access control.

#### Login Flow

```
1. User enters 10-digit phone number
2. User enters 6-digit PIN
3. Firebase Authentication validates credentials
4. User role is fetched from Firebase Realtime Database
5. User is redirected based on role
```

#### Role-Based Access

| Role | Access | Screens |
|------|--------|---------|
| **User** | Customer features | Home, Services, Book, About, Contact, FAQs, Glossary |
| **Career** | Professional features | Booking History, Update Profile, Notifications |
| **Admin** | Management features | Booking History, Helpbox History, Banners, Notifications |
| **SuperAdmin** | Full system access | All admin screens, Professional History |

#### Authentication Code Example

```typescript
// app/(drawer)/admin/AdminLogin.tsx
const handleSubmit = async () => {
  const pinPassword = otp.join("");
  
  if (!phoneNumber || pinPassword.length < 6) {
    Alert.alert("Error", "Please enter phone and a valid 6-digit PIN");
    return;
  }

  const email = `${phoneNumber}@rocketsingh.app`;
  const userCredential = await signInWithEmailAndPassword(auth, email, pinPassword);
  const user = userCredential.user;

  if (user) {
    // Fetch user role from Firebase Realtime Database
    const db = getDatabase();
    const userSnapshot = await get(ref(db, `users/${user.uid}`));
    const userData = userSnapshot.val();
    const userRole = userData?.role;

    // Route based on role
    if (userRole === "career") {
      router.push('/admin/BookingHistory');
    } else if (userRole === "admin") {
      router.push('/admin/HelpboxHistory');
    } else if (userRole === "superadmin") {
      router.push('/admin/ProfessionalHistory');
    }
  }
};
```

### 4.2 Service Booking System

#### Booking Flow

```
1. User fills booking form
2. Form validation checks all required fields
3. User uploads photos (up to 5)
4. Form data is submitted
5. Booking record created in Supabase
6. Notification sent to professionals via OneSignal
7. User receives booking confirmation
```

#### Booking Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full Name | Text | Yes | User's full name |
| Phone Number | Text | Yes | 10-digit phone number |
| Service Selection | Dropdown | Yes | Select one service |
| Date | Date Picker | Yes | Service date |
| Preferred Time | Dropdown | Yes | Shift selection |
| City | Dropdown | Yes | Select city |
| Area | Dropdown | Yes | Select area |
| Priority | Dropdown | Yes | Normal/Urgent |
| Budget | Dropdown | Yes | Budget range |
| Photos | File Upload | Yes | Up to 5 images |
| Special Instructions | Text Area | No | Additional notes |

#### Booking Data Schema

```typescript
interface Booking {
  full_name: string;
  phone: string;
  city: string;
  area: string[];
  select_services: string[];
  priority: string;
  select_shift: string;
  work_description: string;
  budget: string;
  service_booking_datetime: string;
  status: 'New / Open' | 'Pending' | 'Completed' | 'Cancelled';
  add_photos_picture: string[];
  bookingid: string;
  created_at: string;
}
```

#### Booking Code Example

```typescript
// app/(drawer)/(tabs)/Book.tsx
const handleSubmit = async () => {
  // Validate required fields
  if (!name.trim()) return Alert.alert('Validation Error', 'Full Name is required');
  if (!cleanNumber || cleanNumber.length !== 10) {
    return Alert.alert('Validation Error', 'Enter a valid 10-digit phone number');
  }
  if (!selectedService) return Alert.alert('Validation Error', 'Please select a service');
  if (!date) return Alert.alert('Validation Error', 'Please select a date');
  if (!selectedShift) return Alert.alert('Validation Error', 'Please choose a time shift');
  if (selectAddPhotos.length === 0) {
    return Alert.alert('Validation Error', 'Please upload at least 1 photo');
  }

  // Upload files to Supabase
  const fileUrls = await uploadMultipleImagesForBooking(selectAddPhotos);

  // Navigate to booking detail with file URLs
  router.push({
    pathname: '/booking/BookingDetail',
    params: {
      name: name.trim(),
      number: cleanNumber,
      selectedService,
      selectedShift,
      selectedArea,
      selectedLocation,
      selectedPriority,
      selectedBudget,
      message: message.trim(),
      date: date.toISOString(),
      fileUrls: JSON.stringify(fileUrls),
    },
  });
};
```

### 4.3 Professional Registration

#### Career Application Flow

```
1. Professional fills application form
2. Uploads ID proof and documents
3. Submits application to Supabase
4. Admin reviews application
5. Admin approves or rejects
6. Account is created if approved
```

#### Professional Fields

| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | Yes |
| Phone Number | Text | Yes |
| Email | Text | Yes |
| Position Applied For | Multi-Select | Yes |
| Years of Experience | Number | Yes |
| ID Proof | File Upload | Yes |
| Preferred Working Area | Multi-Select | Yes |
| Emergency Contact | Text | Yes |
| Cover Letter | Text Area | Yes |
| Resume/CV | File Upload | No |

### 4.4 Admin Dashboard

#### Admin Capabilities

| Feature | Description |
|---------|-------------|
| View Bookings | All bookings with filters |
| Update Booking Status | Change status (New/Open, Pending, Completed, Cancelled) |
| Helpbox Management | View and update helpbox inquiries |
| Professional Review | Review professional applications |
| Banner Management | Create and manage promotional banners |
| User Notifications | View system notifications |

#### Admin Screens

| Screen | Purpose |
|--------|---------|
| `BookingHistory` | View all bookings with filters |
| `BookingDetails_1` | Review new bookings |
| `BookingDetails_2` | Update booking status |
| `HelpboxHistory` | Manage helpbox inquiries |
| `ProfessionalHistory` | Review professional applications |
| `ProfessionalDetails` | View applicant details |
| `UpdateProfile` | Update professional profile |
| `AdminPopUpBanner` | Manage promotional banners |
| `ViewNotifications` | View system notifications |

---

## 5. State Management

### 5.1 Redux Store

The application uses Redux Toolkit for global state management.

#### Store Configuration

```typescript
// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Auth Slice

```typescript
// src/redux/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAdminLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAdminLogin(state) {
      state.isAdminLoggedIn = true;
    },
    setAdminLogout(state) {
      state.isAdminLoggedIn = false;
    },
  },
});

export const { setAdminLogin, setAdminLogout } = authSlice.actions;
export default authSlice.reducer;
```

### 5.2 User Context

React Context is used for user-specific data.

```typescript
// src/context/userContext.tsx
interface UserContextType {
  userCity: string | null;
  userType: string | null;
  userProfession: string | null;
  setUserData: (city: string, type: string, profession: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

### 5.3 Local Storage (AsyncStorage)

AsyncStorage is used for persisting user preferences and app state.

#### Stored Items

| Key | Purpose |
|-----|---------|
| `hasSeenOnboarding` | Onboarding status |
| `userCity` | User's city |
| `userType` | User type (user/career/admin) |
| `userProfession` | User's profession |
| `userProfileSetupCompleted` | Profile completion status |
| `userId` | User identifier |
| `userRole` | Cached user role |

---

## 6. Database Integration

### 6.1 Supabase Configuration

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 6.2 Database Tables

#### Booking Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| bookingid | text | Unique booking identifier |
| full_name | text | Customer full name |
| phone | text | Customer phone number |
| email | text | Customer email |
| city | text | City |
| area | text[] | Selected areas |
| select_services | text[] | Selected services |
| priority | text | Priority level |
| select_shift | text | Shift preference |
| work_description | text | Special instructions |
| budget | text | Budget range |
| service_booking_datetime | timestamp | Booking date/time |
| status | text | Status |
| add_photos_picture | text[] | Photo URLs |
| created_at | timestamp | Creation date |

#### Workforce Table

| Column | Type | Description |
|--------|------|-------------|
| uin | text | Unique identifier |
| full_name | text | Professional name |
| email | text | Email address |
| phone | text | Phone number |
| position_applied_for | text[] | Applied positions |
| preferred_working_area | text[] | Working areas |
| area_of_expertise | text[] | Expertise areas |
| years_of_experience | integer | Experience years |
| emergency_contact_number | text | Emergency contact |
| cover_letter | text | Cover letter |
| message | text | Additional message |
| id_proof | text[] | ID proof URLs |
| resume_cv | text[] | Resume URLs |
| status | text | Application status |
| created_at | timestamp | Creation date |

#### Helpbox Table

| Column | Type | Description |
|--------|------|-------------|
| uin | text | Unique identifier |
| phone | text | User phone |
| date_created | timestamp | Creation date |
| status | text | Status |

### 6.3 CRUD Operations

#### Create Booking

```typescript
// api/supabase/createBookingSupabase.ts
export const createBookingSupabase = async (payload: any) => {
  const { data, error } = await supabase
    .from("booking")
    .insert([payload]);

  if (error) {
    console.log("Supabase error:", error.message);
    throw error;
  }

  return data;
};
```

#### Fetch Bookings

```typescript
// api/supabase/fetchBookingSB.ts
export const fetchBookingsFromSupabase = async () => {
  try {
    const { data: records, error } = await supabase
      .from("booking")
      .select("*")
      .order("service_booking_datetime", { ascending: false });

    if (error) {
      console.log("Supabase Error fetching bookings:", error);
      return [];
    }

    if (!records || records.length === 0) return [];

    return records.map((item) => ({
      id: item.id || item.push_id || "",
      bookingId: item.bookingid,
      fullName: item.full_name || "",
      email: item.email || "",
      phone: item.phone || "",
      city: item.city || "",
      area: item.area || "",
      service: item.select_services || "",
      bookingDate: formatDate(item.service_booking_datetime),
      status: item.status || "New / Open",
      budget: item.budget || "",
      specialRequests: item.work_description || "",
    }));
  } catch (error) {
    console.log("Fetch Error:", error);
    return [];
  }
};
```

#### Update Booking Status

```typescript
// api/supabase/updateBookingStatusSB.ts
export const updateBookingStatusSB = async (
  bookingId: string | number,
  status: string
) => {
  try {
    const { data, error } = await supabase
      .from('booking')
      .update({ status: status })
      .eq('bookingid', bookingId)
      .select();

    if (error) {
      throw new Error(error.message || 'Failed to update status in Supabase');
    }

    return data;
  } catch (error) {
    console.error('Update booking status error:', error);
    throw error;
  }
};
```

---

## 7. Authentication & Security

### 7.1 Firebase Setup

```javascript
// src/firebase/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

### 7.2 Security Flow

#### User Registration

1. Admin creates accounts through dedicated screens:
   - `SuperAdminCreate.tsx` - Create SuperAdmin accounts
   - `AdminCreate.tsx` - Create Admin accounts
   - `ProfessionalCreate.tsx` - Create Professional accounts

2. Account creation process:
   - Phone number + 6-digit PIN
   - Firebase Authentication
   - Role assignment in Firebase Realtime Database

#### User Login

1. Phone number + 6-digit PIN authentication
2. User role fetched from Firebase Realtime Database
3. User redirected based on role

#### Session Management

- Firebase persistence with AsyncStorage
- Session maintained across app restarts
- Automatic logout on token expiry

#### Route Protection

```typescript
// app/_layout.tsx - Security Bouncer
useEffect(() => {
  if (initializing) return;
  
  const inAdminGroup = segments[0] === 'admin';
  
  if (!user && inAdminGroup) {
    router.replace('/Admin');
  } else if (user && segments[0] === 'Admin') {
    router.replace('/admin/BookingHistory');
  }
}, [user, initializing, segments]);
```

### 7.3 Security Best Practices

1. **Environment Variables**: All sensitive credentials stored in `.env`
2. **Firebase Security Rules**: Properly configured for data protection
3. **Supabase RLS**: Row Level Security policies for data access
4. **Authentication Persistence**: Secure token storage in AsyncStorage
5. **Role-Based Access**: Different routes for different roles

---

## 8. Notifications System

### 8.1 OneSignal Integration

```typescript
// api/notifications.ts
import axios from 'axios';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY;

const sendNotification = async (payload: object) => {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.log('Notification skipped: missing OneSignal config');
    return;
  }
  
  await axios.post(
    'https://api.onesignal.com/notifications',
    { app_id: ONESIGNAL_APP_ID, ...payload },
    {
      headers: {
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
```

### 8.2 Notification Types

#### Helpbox Notification (Admin + SuperAdmin)

```typescript
export async function notifyAdminHelpbox(notiPhone: string) {
  await sendNotification({
    filters: [
      { field: 'tag', key: 'role', relation: '=', value: 'admin' },
      { operator: 'OR' },
      { field: 'tag', key: 'role', relation: '=', value: 'superadmin' },
    ],
    headings: { en: '🚀 New Enquiry Available!' },
    contents: { en: `New phone no : "${notiPhone}" has sent you an enquiry.` },
  });
}
```

**Trigger**: User submits helpbox request
**Recipients**: Admin and SuperAdmin roles

#### Professional Notification (Career Role)

```typescript
export async function notifyProfessionals(service: string, bookingArea: string) {
  await sendNotification({
    filters: [
      { field: 'tag', key: 'role', relation: '=', value: 'career' },
    ],
    headings: { en: '🚀 New Job Available!' },
    contents: { en: `New "${service}" booking in ${bookingArea}.` },
  });
}
```

**Trigger**: New booking created
**Recipients**: Career (Professional) role

#### User Notification (Specific User)

```typescript
export async function notifyUsers(service: string, bookingArea: string, customerPhone: string) {
  await sendNotification({
    filters: [
      { field: 'tag', key: 'role', relation: '=', value: 'user' },
      { operator: 'AND' },
      { field: 'tag', key: 'phone', relation: '=', value: customerPhone }
    ],
    headings: { en: 'Booking Accepted 🚀' },
    contents: { en: `Provider has accepted your request for "${service}" in ${bookingArea}.` },
  });
}
```

**Trigger**: Booking accepted by professional
**Recipients**: Specific user by phone tag

### 8.3 OneSignal Setup

```typescript
// app/_layout.tsx - OneSignal Initialization
import { LogLevel, OneSignal } from 'react-native-onesignal';

// Set up debugging
OneSignal.Debug.setLogLevel(LogLevel.Verbose);

// Initialize OneSignal
OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID);

// Request permission
OneSignal.Notifications.requestPermission(true);

// Add default role tag
OneSignal.User.addTag('role', '');

// Handle notification click events
OneSignal.Notifications.addEventListener('click', handleNotificationClick);
```

### 8.4 User Tagging

```typescript
// User login tagging
OneSignal.login(user.uid);
OneSignal.User.addTags({
  role: userRole,
  phone: cleanPhone,
});
```

---

## 9. File Upload System

### 9.1 Upload Configuration

```typescript
// api/uploadToStorage.tsx
import { supabase } from '@/src/lib/supabase';

const BUCKET = 'uploads';
const PRIVATE_DOCS_BUCKET = 'id-documents';

const getMimeType = (uri: string): string => {
  if (uri.includes('png')) return 'image/png';
  if (uri.includes('gif')) return 'image/gif';
  if (uri.includes('webp')) return 'image/webp';
  return 'image/jpeg';
};

const getExtension = (mimeType: string): string => {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/gif') return 'gif';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
};
```

### 9.2 Upload Utilities

#### Public Upload

```typescript
export const uploadToStorage = async (uri: string, fileName?: string): Promise<string> => {
  const { mimeType, path } = buildUploadPath(uri, fileName);
  const arrayBuffer = await readFileAsArrayBuffer(uri);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};
```

#### Private Document Upload

```typescript
export const uploadPrivateDocument = async (uri: string, fileName?: string): Promise<string> => {
  const { mimeType, path } = buildUploadPath(uri, fileName);
  const arrayBuffer = await readFileAsArrayBuffer(uri);

  const { error } = await supabase.storage
    .from(PRIVATE_DOCS_BUCKET)
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Private document upload failed: ${error.message}`);

  return path;
};
```

#### Signed URL Generation

```typescript
export const getSignedDocumentUrl = async (path: string, expiresInSeconds = 60): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(PRIVATE_DOCS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) throw new Error(error?.message || 'Could not generate document link');
  return data.signedUrl;
};
```

### 9.3 File Upload Component

```typescript
// components/bookings/FileUploadBox.tsx
<FileUploadBox
  value={selectAddPhotos}
  onChange={setSelectAddPhotos}
  maxFiles={5}
  maxFileSizeMB={10}
/>
```

**Features:**
- Multi-file selection
- Image preview
- File size validation (max 10MB)
- Format support: PNG, JPG, JPEG, PDF
- Delete individual files
- Lightbox preview for images
- File count tracking

### 9.4 Upload Workflows

#### Booking Photos

```typescript
// src/utils/fileUploadBooking.ts
export const uploadImageToSupabaseBooking = async (file: FileItem) => {
  const fileName = `booking/${Date.now()}-${Math.random()}.${fileExt}`;
  // Upload to "booking" folder in uploads bucket
  // Returns public URL
};
```

#### Career Documents

```typescript
// src/utils/uploadImageToSBCareer.ts
export const uploadImageToSupabaseCareer = async (file: FileItem) => {
  const fileName = `career/${Date.now()}-${Math.random()}.${fileExt}`;
  // Upload to "career" folder in uploads bucket
  // Returns public URL
};
```

#### Partnership Documents

```typescript
// src/utils/uploadImageToSBPartnership.ts
export const uploadImageToSupabasePartnership = async (file: FileItem) => {
  const fileName = `partnership/${Date.now()}-${Math.random()}.${fileExt}`;
  // Upload to "partnership" folder in uploads bucket
  // Returns public URL
};
```

---

## 10. Routing Structure

### 10.1 Expo Router Configuration

The application uses file-based routing with Expo Router.

#### Root Layout

```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
```

### 10.2 Navigation Groups

#### Onboarding Group ((onboarding))

```
app/(onboarding)/
├── _layout.tsx           # Stack with fade animation
├── onboarding1.tsx       # Welcome screen
├── onboarding2.tsx       # Feature overview
└── onboarding3.tsx       # Get started
```

#### Drawer Group ((drawer))

```
app/(drawer)/
├── _layout.tsx           # Drawer navigation
├── (tabs)/               # Bottom tabs
│   ├── _layout.tsx       # Tabs configuration
│   ├── Home.tsx          # Home screen
│   ├── Service.tsx       # Services listing
│   ├── Book.tsx          # Booking form
│   ├── About.tsx         # About page
│   └── Contact.tsx       # Contact page
├── admin/                # Admin screens
│   ├── _layout.tsx       # Admin stack
│   ├── AdminLogin.tsx    # Admin login
│   └── ...               # Other admin screens
├── FAQs.tsx              # FAQ page
├── Glossary.tsx          # Glossary page
├── Partnership.tsx       # Partnership form
└── Career.tsx            # Career application
```

#### Tabs Group Configuration

```typescript
// app/(drawer)/(tabs)/_layout.tsx
<Tabs
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: 'green',
    tabBarInactiveTintColor: 'gray',
  }}
>
  <Tabs.Screen
    name="Home"
    options={{
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="home-outline" size={size} color={color} />
      ),
    }}
  />
  
  <Tabs.Screen
    name="Book"
    options={{
      tabBarLabel: '',
      tabBarButton: (props) => (
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={props.onPress}
            style={styles.floatingButton}
          >
            <CustomAddIcon width={54} height={54} fill="#fff" />
          </TouchableOpacity>
        </View>
      ),
    }}
  />
  // ... other tabs
</Tabs>
```

### 10.3 Navigation Examples

#### Basic Navigation

```typescript
// Navigate to a screen
router.push('/Home');
router.push('/Service');

// Navigate back
router.back();
router.replace('/Home');
```

#### Navigation with Parameters

```typescript
// Single parameter
router.push({
  pathname: '/service/ServiceDetail',
  params: { id: service.id.toString() }
});

// Multiple parameters
router.push({
  pathname: '/booking/BookingDetail',
  params: {
    name: name.trim(),
    number: cleanNumber,
    selectedService,
    selectedShift,
    fileUrls: JSON.stringify(fileUrls),
  },
});
```

#### Navigation with Complex Data

```typescript
// Stringify complex objects
const bookingData = {
  name: 'John Doe',
  service: 'Plumbing',
  details: { priority: 'high', budget: '$500' }
};

router.push({
  pathname: '/booking/BookingDetail',
  params: { 
    data: JSON.stringify(bookingData) 
  }
});

// Parse on receiving screen
const { data } = useLocalSearchParams();
const bookingData = JSON.parse(data as string);
```

### 10.4 Drawer Navigation

```typescript
// components/CustomDrawer.tsx
export default function CustomDrawer(_props: DrawerContentComponentProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const navigateTo = (route: any) => {
    _props.navigation.closeDrawer();
    requestAnimationFrame(() => {
      setTimeout(() => {
        router.push(route);
      }, 0);
    });
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.card}>
        {/* Profile Section */}
        <View style={styles.profileBox}>
          <Image source={require('../assets/images/icon.png')} style={styles.avatar} />
          <Text style={styles.name}>RocketSingh</Text>
        </View>

        {/* Menu Items */}
        <ScrollView contentContainerStyle={styles.menu}>
          <MenuItem label="Home" onPress={() => navigateTo('/Home')} />
          <MenuItem label="Services" onPress={() => navigateTo('/Service')} />
          
          {isLoggedIn ? (
            <>
              <MenuItem label="View Booking" onPress={() => navigateTo('/admin/BookingHistory')} />
              {role === "admin" && (
                <MenuItem label="View Helpbox" onPress={() => navigateTo('/admin/HelpboxHistory')} />
              )}
              {role === "superadmin" && (
                <MenuItem label="Professional History" onPress={() => navigateTo('/admin/ProfessionalHistory')} />
              )}
              <MenuItem label="Log Out" onPress={handleLogout} isLogout={true} />
            </>
          ) : (
            <>
              <MenuItem label="Become a Partner" onPress={() => navigateTo('/Partnership')} />
              <MenuItem label="Join as Professional" onPress={() => navigateTo('/Career')} />
              <MenuItem label="FAQs" onPress={() => navigateTo('/FAQs')} />
              <MenuItem label="Glossary" onPress={() => navigateTo('/Glossary')} />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
```

---

## 11. Component Library

### 11.1 Core Components

#### Dropdown Component

```typescript
// components/bookings/Dropdown.tsx
<Dropdown
  options={services}
  placeholder="Select a Service"
  value={selectedService}
  onSelectOption={setSelectedService}
  onOpen={() => setActiveInput('service')}
  onClose={() => setActiveInput(null)}
/>
```

**Features:**
- Single-select dropdown
- Search functionality
- Custom styling
- Focus/Blur states
- Icon support

#### Multi-Select Dropdown

```typescript
// components/bookings/DropdownAdd.tsx
<DropdownAdd
  options={services}
  placeholder="Select services you offer"
  value={selectedServices}
  onSelectOption={setSelectedServices}
  maxSelections={3}
/>
```

**Features:**
- Multi-select dropdown
- Chip display for selected items
- Max selection limit
- Search functionality
- Custom styling

#### Text Area

```typescript
// components/bookings/TextArea.tsx
<TextArea
  value={message}
  onChangeText={setMessage}
  placeholder="Enter your message here"
  maxHeight={160}
  onFocus={() => setActiveInput('message')}
  onBlur={() => setActiveInput(null)}
/>
```

**Features:**
- Multi-line text input
- Auto-height adjustment
- Max height limit
- Focus/Blur styling
- Scrollable when content exceeds max height

#### File Upload Box

```typescript
// components/bookings/FileUploadBox.tsx
<FileUploadBox
  value={selectedFiles}
  onChange={setSelectedFiles}
  maxFiles={5}
  maxFileSizeMB={10}
/>
```

**Features:**
- Multi-file selection
- Image preview
- File size validation
- Format support: PNG, JPG, JPEG, PDF
- Delete individual files
- Lightbox preview for images
- File count tracking

#### Submit Overlay

```typescript
// components/bookings/SubmitOverlay.tsx
<SubmitOverlay
  visible={overlayVisible}
  status={overlayStatus}
  onClear={clearAllFields}
  onClose={() => setOverlayVisible(false)}
/>
```

**Features:**
- Loading state with spinner
- Success state with checkmark
- Clear form option
- Keep/Close options
- Animated transitions

### 11.2 Admin Components

#### Booking Card

```typescript
// components/admin/BookingCard.tsx
<BookingCard
  item={booking}
  isOpen={openId === booking.id}
  onToggle={() => toggleCard(booking.id)}
  onPress={() => handlePress(booking.id)}
/>
```

**Features:**
- Booking summary display
- Status badge with colors
- View action button
- Expandable details
- Date formatting

#### Professional Card

```typescript
// components/admin/ProfessionalCard.tsx
<ProfessionalCard
  item={applicant}
  isOpen={openId === applicant.id}
  onToggle={() => toggleCard(applicant.id)}
  onPress={() => handlePress(applicant.id)}
/>
```

**Features:**
- Applicant summary display
- Status badge with colors
- View action button
- Contact information
- Application date

#### Helpbox Card

```typescript
// components/admin/HelpboxCard.tsx
<HelpboxCard
  item={helpboxItem}
  isOpen={openId === helpboxItem.id}
  onToggle={() => toggleCard(helpboxItem.id)}
  onPress={() => handlePress(helpboxItem.id)}
/>
```

**Features:**
- Helpbox entry summary
- Status badge with colors
- View action button
- Phone number display
- Creation date

### 11.3 Header Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `Header2` | Main app header | Logo, title, menu button, notification icon |
| `Header3drawer` | Header with drawer | Logo, title, drawer toggle |
| `Header4Admin` | Admin header | Admin menu, notification icon |
| `Header5Admin` | Login header | Minimal header for auth screens |

### 11.4 Form Components

#### Input Field

```typescript
// components/admin/InputField.tsx
<InputField 
  label="Full Name" 
  placeholder="Enter full name" 
  value={name}
  onChangeText={setName}
  keyboardType="default"
/>
```

#### Custom Checkbox

```typescript
// components/admin/CustomCheckbox.tsx
<CustomCheckbox />
```

---

## 12. Development Setup

### 12.1 Prerequisites

```bash
# Node.js 18+
node --version

# npm or yarn
npm --version

# Expo CLI
npm install -g expo-cli

# EAS CLI (for building)
npm install -g eas-cli
```

### 12.2 Environment Setup

#### 1. Clone Repository

```bash
git clone [repository-url]
cd rocketsingh
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required Environment Variables:**

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
EXPO_PUBLIC_DATABASE_URL=your-firebase-database-url

# OneSignal
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
EXPO_PUBLIC_ONESIGNAL_REST_API_KEY=your-onesignal-rest-api-key

# SMS/OTP
EXPO_PUBLIC_INFOBIP_API_KEY=your-infobip-api-key
EXPO_PUBLIC_INFOBIP_BASE_URL=your-infobip-base-url
```

#### 4. Sync EAS Environment Variables

```bash
npm run sync-eas-env
```

### 12.3 Running the App

#### Development

```bash
npm start
# or
expo start
```

#### Android

```bash
npm run android
# or
expo run:android
```

#### iOS

```bash
npm run ios
# or
expo run:ios
```

#### Web

```bash
npm run web
# or
expo start --web
```

### 12.4 Testing

```bash
# Run tests
npm test

# Run TypeScript type check
npx tsc --noEmit

# Lint
npm run lint
```

### 12.5 Troubleshooting Common Issues

#### Environment Variables Not Loading

```bash
# Ensure .env file exists and has all required variables
# Restart the development server
npm start -- --reset-cache
```

#### Firebase Authentication Errors

```bash
# Check Firebase config values in .env
# Verify Firebase project has Authentication enabled
# Check if phone numbers are allowed in Firebase
```

#### Supabase Connection Issues

```bash
# Verify Supabase URL and Anon Key in .env
# Check if tables and RLS policies are properly configured
# Verify network connectivity
```

#### OneSignal Push Notifications

```bash
# Verify OneSignal App ID in .env
# Check if OneSignal is properly initialized in app/_layout.tsx
# Ensure device has push notification permission
# Test with OneSignal dashboard first
```

#### Image Upload Failures

```bash
# Check Supabase storage bucket "uploads" exists
# Verify storage policies allow uploads
# Check file size limits (max 10MB per file)
```

---

## 13. Deployment

### 13.1 EAS Build

#### Production Build

```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

#### Submit to App Stores

```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

### 13.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: CI/CD - Test and Deploy to Google Play

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm test -- --ci --watchAll=false --passWithNoTests

  deploy-internal:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: 'npm'
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          expo-token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: npm install -g eas-cli
      - run: eas build --platform android --profile production --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      - run: eas submit --platform android --auto-submit --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### 13.3 EAS Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 20.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 14. API Integration

### 14.1 Supabase Service

```typescript
// src/services/supabaseService.ts
import { supabase } from '@/src/lib/supabase';

export const announcementService = {
  async createAnnouncement(data: AnnouncementData) {
    const { data: result, error } = await supabase
      .from('roadblock')
      .insert([{
        name: data.name,
        city: data.city,
        user_selection: data.user_selection,
        profession: data.profession || [],
        countdown_timer: data.countdown_timer,
        image_url: data.image_url,
        message: data.message,
        button_text: data.button_text,
        button_link: data.button_link,
        start_date: data.start_date,
        end_date: data.end_date,
        uploaded_by: data.uploaded_by,
        active: true
      }])
      .select();

    if (error) throw error;
    return result;
  },

  async getAllAnnouncements() {
    const { data, error } = await supabase
      .from('roadblock')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async toggleAnnouncementStatus(id: string, active: boolean) {
    const { data, error } = await supabase
      .from('roadblock')
      .update({ active })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('roadblock')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteImageFromStorage(imageUrl: string) {
    // Extract bucket and file path from URL
    // Delete from storage
  }
};
```

### 14.2 Banner Service

```typescript
// src/services/bannerService.ts
export const bannerService = {
  async getActiveBanners(): Promise<Banner[]> {
    const now = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('roadblock')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async getBannersForUser(userCity?: string, userType?: string, userProfession?: string) {
    let query = supabase
      .from('roadblock')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now);

    if (userCity) query = query.contains('city', [userCity]);
    if (userType) query = query.contains('user_selection', [userType]);
    if (userProfession) query = query.contains('profession', [userProfession]);

    const { data, error } = await query.order('created_at', { ascending: false });
    return data || [];
  }
};
```

### 14.3 Road Block API

```typescript
// api/roadBlocks.tsx
export const ROAD_BLOCK_BUTTON_TEXT_OPTIONS = [
  'View More', 'Download Now', 'Install Now', 'Buy Now', 'Learn More',
  'Watch Video', 'Grab Offer', 'Join Now', 'Review Now',
  'Suggest a Feature', 'Other',
];

export type RoadBlock = {
  id: number;
  banner_name: string;
  title: string;
  image_url: string;
  message: string;
  button_text: string;
  button_text_custom: string | null;
  button_link: string;
  countdown_seconds: number | null;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

export const fetchActiveRoadBlock = async (): Promise<RoadBlock | null> => {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('road_blocks')
    .select('*')
    .eq('is_active', true)
    .lte('start_at', nowIso)
    .gte('end_at', nowIso)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as RoadBlock) || null;
};
```

---

## 15. Troubleshooting

### 15.1 Common Issues and Solutions

#### 1. Environment Variables Not Loading

**Symptoms:**
- App crashes on startup
- Firebase/Supabase configuration errors

**Solution:**
```bash
# Ensure .env file exists and has all required variables
ls -la .env

# Restart the development server with cache reset
npm start -- --reset-cache

# For EAS builds, sync environment variables
npm run sync-eas-env
```

#### 2. Firebase Authentication Errors

**Symptoms:**
- Login fails with "Invalid phone or PIN"
- Authentication timeout

**Solution:**
```bash
# Check Firebase config values in .env
# Verify Firebase project has Authentication enabled
# Check if phone numbers are allowed in Firebase
# Verify email format: [phone]@rocketsingh.app
```

#### 3. Supabase Connection Issues

**Symptoms:**
- Data not loading
- Database operations fail

**Solution:**
```bash
# Verify Supabase URL and Anon Key in .env
# Check if tables and RLS policies are properly configured
# Verify network connectivity
# Check Supabase dashboard for errors
```

#### 4. OneSignal Push Notifications

**Symptoms:**
- No notifications received
- Notification permission denied

**Solution:**
```bash
# Verify OneSignal App ID in .env
# Check if OneSignal is properly initialized in app/_layout.tsx
# Ensure device has push notification permission
# Test with OneSignal dashboard first
# Check user tags are set correctly
```

#### 5. Image Upload Failures

**Symptoms:**
- Upload spinner never completes
- File size errors

**Solution:**
```bash
# Check Supabase storage bucket "uploads" exists
# Verify storage policies allow uploads
# Check file size limits (max 10MB per file)
# Verify file format is supported (PNG, JPG, JPEG, PDF)
# Check network connectivity
```

### 15.2 Debugging Tips

#### 1. Enable Debug Logging

```bash
# Enable React Native debugger
expo start --dev-client

# Enable OneSignal debug logs
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
```

#### 2. Check Network Requests

```bash
# Use React Native Debugger
# Open http://localhost:8081/debugger-ui
# Check Console for network logs
```

#### 3. AsyncStorage Inspection

```typescript
// Add this to any component to inspect storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const inspectStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.log('AsyncStorage Items:', items);
};
```

#### 4. Supabase Query Debugging

```typescript
// Log Supabase queries
const { data, error } = await supabase
  .from('booking')
  .select('*')
  .order('service_booking_datetime', { ascending: false });

console.log('Data:', data);
console.log('Error:', error);
```

### 15.3 Performance Optimization

#### 1. FlatList Optimization

```typescript
<FlatList
  data={filteredData}
  renderItem={renderItem}
  keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
  initialNumToRender={8}
  maxToRenderPerBatch={6}
  windowSize={7}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
/>
```

#### 2. Memoization

```typescript
// Use useMemo for expensive computations
const filteredData = useMemo(() => {
  // Filter and sort data
  return data.filter(item => item.status === 'active');
}, [data]);

// Use useCallback for functions
const handlePress = useCallback((id: string) => {
  // Handle press
}, []);

// Use React.memo for components
const BookingCard = React.memo(({ item, onPress }) => {
  // Component logic
});
```

---

## 16. Contributing

### 16.1 Development Guidelines

#### Branch Naming

```
feature/feature-name - New features
bugfix/bug-description - Bug fixes
hotfix/urgent-fix - Critical fixes
release/version - Release branches
```

#### Commit Messages

```
feat: Add booking cancellation functionality
fix: Resolve image upload timeout issue
docs: Update API documentation
style: Format code with prettier
refactor: Optimize state management
test: Add unit tests for booking service
chore: Update dependencies
```

#### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic

### 16.2 Pull Request Process

1. Update documentation
2. Pass all tests
3. Follow code style guidelines
4. Get review from at least one maintainer
5. Resolve all merge conflicts
6. Ensure CI/CD pipeline passes

### 16.3 Adding New Features

#### 1. New Screen

```typescript
// 1. Create screen file in appropriate route
// app/(drawer)/NewScreen.tsx

import { View, Text } from 'react-native';
import Header2 from '@/components/Header2';

export default function NewScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Header2 />
      <View>
        <Text>New Screen Content</Text>
      </View>
    </View>
  );
}

// 2. Update navigation if needed
// app/(drawer)/_layout.tsx

// 3. Add to drawer menu
// components/CustomDrawer.tsx
```

#### 2. New API Endpoint

```typescript
// 1. Create API file
// api/newFeature.ts

import { supabase } from '@/src/lib/supabase';

export const createNewFeature = async (data: any) => {
  const { data: result, error } = await supabase
    .from('table_name')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
};

// 2. Add to service layer
// src/services/newService.ts

// 3. Create custom hook
// api/hooks/useNewFeature.ts
```

#### 3. New Component

```typescript
// 1. Create component in appropriate folder
// components/NewComponent.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NewComponentProps {
  title: string;
  onPress: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text>Press Me</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
});

// 2. Export in index if needed
// components/index.ts
```

---

## Appendix

### A. Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase API URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `EXPO_PUBLIC_DATABASE_URL` | Yes | Firebase database URL |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID` | Yes | OneSignal app ID |
| `EXPO_PUBLIC_ONESIGNAL_REST_API_KEY` | Yes | OneSignal REST API key |

### B. Database Schema Reference

#### Booking Table

```sql
CREATE TABLE booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookingid TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  area TEXT[],
  select_services TEXT[],
  priority TEXT,
  select_shift TEXT,
  work_description TEXT,
  budget TEXT,
  service_booking_datetime TIMESTAMP,
  status TEXT DEFAULT 'New / Open',
  add_photos_picture TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Workforce Table

```sql
CREATE TABLE workforce (
  uin TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  position_applied_for TEXT[],
  preferred_working_area TEXT[],
  area_of_expertise TEXT[],
  years_of_experience INTEGER,
  emergency_contact_number TEXT,
  cover_letter TEXT,
  message TEXT,
  id_proof TEXT[],
  resume_cv TEXT[],
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### C. API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/booking` | POST | Create booking |
| `/booking` | GET | Fetch bookings |
| `/booking/:id` | PUT | Update booking status |
| `/workforce` | POST | Create professional application |
| `/workforce` | GET | Fetch professional applications |
| `/workforce/:id` | PUT | Update professional status |
| `/helpbox` | POST | Create helpbox entry |
| `/helpbox` | GET | Fetch helpbox entries |
| `/partnership` | POST | Create partnership request |

### D. Useful Commands

```bash
# Development
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web

# Testing
npm test           # Run tests
npx tsc --noEmit  # TypeScript type check
npm run lint       # ESLint

# Building
eas build --platform android --profile production
eas build --platform ios --profile production

# Deployment
eas submit --platform android
eas submit --platform ios

# Environment
npm run sync-eas-env  # Sync environment variables
```

---

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

## Support

For support, email help@rocketsingh.app or create an issue in the repository.

---

## Acknowledgments

- Built with Expo and React Native
- Powered by Supabase and Firebase
- Notifications by OneSignal
- Authentication by Firebase Auth
- File storage by Supabase Storage