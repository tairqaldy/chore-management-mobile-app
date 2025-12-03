# Code Explanation - Chore Management Mobile App

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [Key Components](#key-components)
6. [Services Layer](#services-layer)
7. [Context Providers](#context-providers)
8. [Routing & Navigation](#routing--navigation)
9. [Data Flow](#data-flow)
10. [Styling & Theming](#styling--theming)
11. [Key Features](#key-features)
12. [Database Schema](#database-schema)
13. [Development Workflow](#development-workflow)

---

## Project Overview

This is a **React Native mobile application** built with **Expo** for managing household chores. The app enables collaboration between house hosts and tenants to assign, track, and complete chores efficiently.

### Key Characteristics:
- **Platform**: React Native with Expo Router (file-based routing)
- **Backend**: Supabase (PostgreSQL database with real-time capabilities)
- **Authentication**: Supabase Auth with secure token storage
- **State Management**: React Context API
- **Type Safety**: TypeScript throughout

---

## Architecture & Tech Stack

### Core Technologies

```
Frontend Framework: React Native 0.81.5
Routing: Expo Router 6.0.15 (file-based routing)
Backend: Supabase (PostgreSQL + Auth + Storage)
State Management: React Context API
Language: TypeScript 5.9.2
Build Tool: Expo CLI
```

### Key Dependencies

- **@supabase/supabase-js**: Backend API client
- **expo-router**: File-based routing system
- **expo-secure-store**: Secure token storage (iOS Keychain/Android Keystore)
- **@react-native-async-storage/async-storage**: Local storage for archived chores
- **@expo/vector-icons**: Icon library (Ionicons)
- **react-native-safe-area-context**: Safe area handling for notches/islands

### Architecture Pattern

The app follows a **layered architecture**:

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (Screens, Components, UI)          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│      Context Layer                  │
│  (AuthContext, AppContext)          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│      Services Layer                 │
│  (auth.ts, houses.ts, chores.ts)    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│      Data Layer                     │
│  (Supabase Client)                  │
└─────────────────────────────────────┘
```

---

## Project Structure

```
chore-management-expo-app/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry point (redirects to welcome)
│   ├── welcome.tsx              # Welcome/login screen
│   ├── login.tsx                # Login screen
│   ├── signup.tsx               # Sign up screen
│   ├── create-house.tsx         # Host: Create house screen
│   ├── join-house.tsx           # Tenant: Join house screen
│   ├── archive.tsx              # Archive view for completed chores
│   ├── (dashboard)/             # Dashboard group route
│   │   ├── _layout.tsx          # Dashboard layout
│   │   └── index.tsx            # Main dashboard screen
│   └── (tabs)/                  # Tabs group (if needed)
│
├── components/                  # Reusable UI components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx           # Custom button component
│   │   ├── Input.tsx            # Custom input component
│   │   ├── Card.tsx             # Card container component
│   │   └── RoleIndicator.tsx   # Role badge component
│   ├── ChoreList.tsx            # Chore list container
│   ├── ChoreItem.tsx            # Individual chore item
│   ├── TenantList.tsx           # Tenant list (host view)
│   ├── AddChoreModal.tsx        # Modal for adding chores
│   └── AssignChoreModal.tsx    # Modal for assigning chores
│
├── context/                     # React Context providers
│   ├── AuthContext.tsx          # Authentication state management
│   └── AppContext.tsx           # App-level state (house, chores, tenants)
│
├── services/                    # API service layer
│   ├── supabase.ts             # Supabase client configuration
│   ├── auth.ts                 # Authentication service functions
│   ├── houses.ts               # House management service functions
│   └── chores.ts               # Chore management service functions
│
├── types/                       # TypeScript type definitions
│   └── index.ts                # All type definitions
│
├── utils/                       # Utility functions
│   └── helpers.ts              # Helper functions (validation, formatting)
│
├── constants/                   # App constants
│   └── theme.ts                # Theme colors and fonts
│
└── hooks/                      # Custom React hooks (if any)
```

---

## Core Concepts

### 1. User Roles

The app has two distinct user roles:

- **Host**: Creates and manages a house, assigns chores to tenants, can see all tenants
- **Tenant**: Joins an existing house, can create chores, complete assigned chores

### 2. House System

- Each house has one **host** (the creator)
- Multiple **tenants** can join a house (up to `max_tenants`)
- Users can only belong to one house at a time
- Hosts cannot join other houses (must leave their house first)

### 3. Chore Lifecycle

```
Created → Assigned (optional) → Completed → Archived
```

- **Created**: Chore is created by host or tenant
- **Assigned**: Host can assign chore to a specific tenant (optional)
- **Completed**: Any house member can mark chore as done
- **Archived**: Completed chores can be archived (moved to archive view)

### 4. Authentication Flow

```
App Start → Check Session → 
  ├─ No Session → Welcome Screen
  └─ Has Session → Check User Role →
      ├─ Host → Check House → Create/Join House or Dashboard
      └─ Tenant → Check House → Join House or Dashboard
```

---

## Key Components

### Screen Components

#### `welcome.tsx`
- Entry point for unauthenticated users
- Shows welcome message and login/signup buttons
- Redirects authenticated users to appropriate screen

#### `login.tsx` / `signup.tsx`
- Authentication screens with consistent styling
- Form validation (email, password, username)
- Role selection (host/tenant) on signup
- Back button positioned for iPhone notch/island

#### `create-house.tsx`
- Host-only screen for creating a new house
- Form fields: name, description (optional), max tenants
- Validates input and creates house in database

#### `join-house.tsx`
- Tenant-only screen for joining available houses
- Lists all houses with available slots
- Shows house details (name, description, tenant count, host)
- Tap to join functionality

#### `(dashboard)/index.tsx`
- Main app screen after authentication
- Different views for host vs tenant:
  - **Host**: Shows tenants list, all chores, assign functionality
  - **Tenant**: Shows chores list, add chore functionality
- Pull-to-refresh support
- Archive navigation
- Sign out functionality

#### `archive.tsx`
- View for archived (completed) chores
- Shows all archived chores for the current house
- Can unarchive or delete archived chores

### UI Components

#### `Button.tsx`
- Customizable button component
- Supports primary/secondary variants
- Loading state with spinner
- Disabled state handling

#### `Input.tsx`
- Form input component with label
- Error message display
- Supports various input types (text, email, password, numeric)
- Multiline support for descriptions

#### `Card.tsx`
- Container component for cards
- Consistent styling with shadows and borders
- Used for house cards, chore items, etc.

#### `ChoreList.tsx`
- Displays list of chores using FlatList
- Handles empty state
- Pull-to-refresh support
- Passes chore data to ChoreItem components

#### `ChoreItem.tsx`
- Individual chore display
- Shows chore title, description, assigned user, creator
- Action buttons based on role (complete, assign, archive, delete)
- Status indicators (not done/done)

#### `AddChoreModal.tsx`
- Modal for creating new chores
- Form with title, description, optional assignment
- Validates input before submission

#### `AssignChoreModal.tsx`
- Host-only modal for assigning chores to tenants
- Lists all tenants in the house
- Updates chore assignment in database

---

## Services Layer

The services layer abstracts all database operations and provides a clean API for components.

### `supabase.ts`
**Purpose**: Configure and export Supabase client

**Key Features**:
- Custom storage adapter using `expo-secure-store` for mobile
- Falls back to `localStorage` for web
- Secure token storage (iOS Keychain/Android Keystore)
- Auto-refresh tokens enabled

**Code Structure**:
```typescript
// Creates Supabase client with secure storage
export const supabase = createClient(url, key, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### `auth.ts`
**Purpose**: Handle all authentication operations

**Functions**:
- `signUp()`: Create new user account and profile
- `signIn()`: Authenticate existing user
- `signOut()`: Clear session and tokens
- `getCurrentUser()`: Fetch current user profile
- `getSession()`: Get current auth session
- `isEmailVerified()`: Check email verification status
- `resendVerificationEmail()`: Resend verification email

**Flow**:
1. Create/auth user in Supabase Auth
2. Create/fetch user profile in `users` table
3. Return user data with role

### `houses.ts`
**Purpose**: Manage house-related operations

**Functions**:
- `createHouse()`: Create new house (host only)
- `getHouseById()`: Fetch house by ID
- `getCurrentUserHouse()`: Get house for current user (host or tenant)
- `getAvailableHouses()`: List houses with available slots
- `joinHouse()`: Add tenant to house
- `leaveHouse()`: Remove tenant from house
- `getHouseTenants()`: Get all tenants in a house

**Key Logic**:
- Hosts are identified by `host_id` in `houses` table
- Tenants are in `house_members` table with `house_id` and `user_id`
- `getCurrentUserHouse()` checks both tables

### `chores.ts`
**Purpose**: Manage chore operations

**Functions**:
- `createChore()`: Create new chore
- `getChoresByHouse()`: Get all chores for a house
- `getChoresForUser()`: Get chores assigned to specific user
- `completeChore()`: Mark chore as done
- `assignChore()`: Assign chore to tenant (host only)
- `updateChore()`: Update chore details (creator or host)
- `archiveChore()`: Archive completed chore
- `getArchivedChores()`: Get archived chores for house
- `deleteChore()`: Delete chore (creator or host)

**Permission Logic**:
- **Create**: Host or tenant
- **Complete**: Host, assigned user, or any tenant (for unassigned)
- **Assign**: Host only
- **Update**: Creator or host
- **Archive**: Host or tenant (completed chores only)
- **Delete**: Creator or host

**Archiving System**:
- Uses local storage (`AsyncStorage`) as backup
- Stores archived chore IDs locally
- Falls back to local storage if database column doesn't exist
- Combines database and local storage for reliability

---

## Context Providers

### `AuthContext.tsx`
**Purpose**: Manage authentication state globally

**State**:
- `user`: Current user object (User | null)
- `session`: Supabase session object
- `loading`: Initial loading state

**Methods**:
- `signIn(email, password)`: Sign in user
- `signUp(email, password, username, role)`: Sign up new user
- `signOut()`: Sign out current user

**Behavior**:
- Clears session on app start (forces re-login)
- Listens to auth state changes via Supabase
- Handles token refresh errors gracefully
- Updates user state when session changes

**Usage**:
```typescript
const { user, signIn, signOut, loading } = useAuth();
```

### `AppContext.tsx`
**Purpose**: Manage app-level data (house, chores, tenants)

**State**:
- `currentHouse`: Current user's house (House | null)
- `chores`: Active chores array
- `archivedChores`: Archived chores array
- `tenants`: House tenants array (host only)
- `loading`: Loading state

**Methods**:
- `refreshHouse()`: Refresh current house data
- `refreshChores()`: Refresh active chores
- `refreshArchivedChores()`: Refresh archived chores
- `refreshTenants()`: Refresh tenants list

**Behavior**:
- Automatically loads house when user changes
- Loads chores and tenants when house changes
- Only loads tenants for hosts
- Provides refresh methods for pull-to-refresh

**Usage**:
```typescript
const { currentHouse, chores, refreshChores } = useApp();
```

**Dependencies**:
- Depends on `AuthContext` (uses `useAuth()`)
- Only loads data when user is authenticated

---

## Routing & Navigation

### Expo Router (File-Based Routing)

The app uses **Expo Router** for navigation, which uses the file system to define routes.

### Route Structure

```
/ (index.tsx)                    → Redirects to /welcome
/welcome                         → Welcome screen
/login                           → Login screen
/signup                          → Sign up screen
/create-house                    → Create house (host)
/join-house                      → Join house (tenant)
/(dashboard)                     → Dashboard group
  └── /(dashboard)/index          → Main dashboard
/archive                         → Archive view
```

### Layout Files

#### `app/_layout.tsx` (Root Layout)
- Wraps entire app with providers
- Sets up Stack navigator
- Configures screen options (no headers, no gestures)
- Provides AuthContext and AppContext

#### `app/(dashboard)/_layout.tsx`
- Dashboard-specific layout
- Stack navigator for dashboard screens

### Navigation Features

- **No Headers**: All screens use custom headers
- **No Gestures**: Swipe back disabled for controlled navigation
- **Programmatic Navigation**: Uses `useRouter()` hook
- **Replace vs Push**: Uses `replace()` to prevent back navigation in auth flow

### Navigation Flow

```
Welcome → Login/Signup → 
  ├─ Host → Create House → Dashboard
  └─ Tenant → Join House → Dashboard
```

---

## Data Flow

### Authentication Flow

```
1. User opens app
   ↓
2. AuthContext checks for session
   ↓
3. No session → Welcome screen
   ↓
4. User signs in/up
   ↓
5. AuthContext updates user state
   ↓
6. AppContext detects user change
   ↓
7. AppContext loads house data
   ↓
8. Redirect to appropriate screen
```

### Chore Creation Flow

```
1. User taps "Add Task" button
   ↓
2. AddChoreModal opens
   ↓
3. User fills form and submits
   ↓
4. createChore() service called
   ↓
5. Supabase inserts chore into database
   ↓
6. Modal closes, refreshChores() called
   ↓
7. AppContext fetches updated chores
   ↓
8. ChoreList re-renders with new chore
```

### Chore Completion Flow

```
1. User taps "Complete" on chore
   ↓
2. completeChore() service called
   ↓
3. Service checks permissions
   ↓
4. Supabase updates chore status
   ↓
5. refreshChores() called
   ↓
6. ChoreList updates to show completed state
```

---

## Styling & Theming

### Theme System

Located in `constants/theme.ts`, the app uses a consistent color scheme:

**Colors**:
- `background`: `#0E0E10` (dark background) / `#2a2a2a` (legacy)
- `text`: `#90EE90` (light green)
- `button`: `#006400` (dark green)
- `#6BCF8E`: Primary green (used in newer screens)
- `#AFAFAF`: Gray text for subtitles

**Design Patterns**:
- Dark theme throughout
- Green accent color for actions
- Consistent typography (42px titles, 20px subtitles)
- Card-based layouts with shadows
- iPhone notch/island safe areas

### Screen Styling

**Consistent Patterns** (login, signup, create-house, join-house):
- Dark background (`#0E0E10`)
- Large title (42px, fontWeight: '900', color: `#6BCF8E`)
- Subtitle (20px, color: `#AFAFAF`)
- Back button at `top: 60px` (notch-safe)
- Content padding: `20px` with `paddingTop: 80px`

### Component Styling

- **Buttons**: Dark green background, light green text
- **Cards**: Dark gray background (`#1A1A1D`), rounded corners, shadows
- **Inputs**: Light green borders and text
- **Status Indicators**: Color-coded (yellow for not done, green for done)

---

## Key Features

### 1. Role-Based Access Control

- Different UI and functionality for hosts vs tenants
- Permission checks in service layer
- Role-based routing (host → create-house, tenant → join-house)

### 2. House Management

- One house per user
- Host creates house, tenants join
- Max tenant limit enforcement
- Leave house functionality for tenants

### 3. Chore Management

- Create, assign, complete, archive, delete chores
- Unassigned chores can be completed by any tenant
- Assigned chores can be completed by assignee or host
- Archive view for completed chores

### 4. Real-Time Updates

- Pull-to-refresh on dashboard
- Context providers refresh data on navigation
- Manual refresh methods available

### 5. Secure Authentication

- Supabase Auth with secure token storage
- Session management with auto-refresh
- Email verification support (currently disabled for testing)

### 6. Offline Support (Partial)

- Archived chores stored in local storage
- Falls back to local storage if database unavailable
- Not full offline support, but resilient to some failures

---

## Database Schema

### Tables (Inferred from Code)

#### `users`
```sql
id: UUID (primary key, references auth.users)
email: TEXT
username: TEXT
role: TEXT ('host' | 'tenant')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `houses`
```sql
id: UUID (primary key)
name: TEXT
description: TEXT (nullable)
max_tenants: INTEGER
host_id: UUID (references users.id)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `house_members`
```sql
id: UUID (primary key)
house_id: UUID (references houses.id)
user_id: UUID (references users.id)
joined_at: TIMESTAMP
```

#### `chores`
```sql
id: UUID (primary key)
house_id: UUID (references houses.id)
title: TEXT
description: TEXT (nullable)
assigned_to_user_id: UUID (nullable, references users.id)
created_by_user_id: UUID (references users.id)
status: TEXT ('not_done' | 'done')
archived: BOOLEAN (nullable, may not exist in all versions)
created_at: TIMESTAMP
updated_at: TIMESTAMP
completed_at: TIMESTAMP (nullable)
```

### Relationships

- **User → House**: One-to-one (host) or many-to-one (tenant via house_members)
- **House → Chores**: One-to-many
- **House → Tenants**: One-to-many (via house_members)
- **Chore → User**: Many-to-one (assigned_to_user_id, created_by_user_id)

### Row Level Security (RLS)

Supabase RLS policies (inferred):
- Users can only see their own profile
- Users can only see houses they belong to
- Users can only see chores in their house
- Hosts can assign chores, tenants can complete them

---

## Development Workflow

### Running the App

```bash
# Start development server
npm start

# Start with tunnel (for device testing)
npm run start:tunnel

# Platform-specific
npm run ios
npm run android
npm run web
```

### Environment Variables

Required in `.env` or `app.json`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Code Organization Principles

1. **Separation of Concerns**: Services handle data, components handle UI
2. **Type Safety**: TypeScript types for all data structures
3. **Reusability**: Components are modular and reusable
4. **Context for Global State**: Auth and app state in contexts
5. **Service Layer**: All API calls abstracted in services

### Common Patterns

#### Error Handling
```typescript
try {
  await someService();
  await refreshData();
} catch (error: any) {
  Alert.alert('Error', error.message || 'Failed');
}
```

#### Loading States
```typescript
const [loading, setLoading] = useState(false);
// Set loading before async operation
// Clear loading in finally block
```

#### Permission Checks
```typescript
if (user?.role !== 'host') {
  router.replace('/welcome');
  return;
}
```

### Testing Considerations

- 2FA disabled for easier testing
- Email verification can be disabled
- Test with multiple users (host + tenants)
- Test house creation, joining, leaving
- Test chore lifecycle (create, assign, complete, archive)

---

## Additional Notes

### Security Considerations

- Tokens stored securely using `expo-secure-store`
- Password validation (minimum 6 characters)
- Username validation (alphanumeric + underscores, min 3 chars)
- Email validation (regex pattern)
- Permission checks in service layer

### Performance Optimizations

- FlatList for efficient list rendering
- Lazy loading of modals
- Context providers only load data when needed
- Pull-to-refresh for manual updates

### Known Limitations

- No real-time subscriptions (uses pull-to-refresh)
- Archive system uses local storage as fallback
- One house per user limitation
- No push notifications
- Email verification currently disabled for testing

### Future Enhancements (Potential)

- Real-time updates with Supabase subscriptions
- Push notifications for chore assignments
- Multiple house support
- Chore scheduling/recurring chores
- Statistics and analytics
- Photo attachments for chores
- Comments on chores

---

## Conclusion

This codebase follows modern React Native best practices with:
- **Clear separation of concerns** (services, contexts, components)
- **Type safety** with TypeScript
- **Consistent styling** and theming
- **Role-based access control**
- **Secure authentication** with Supabase
- **Modular, reusable components**

The architecture is scalable and maintainable, with clear patterns for adding new features.

