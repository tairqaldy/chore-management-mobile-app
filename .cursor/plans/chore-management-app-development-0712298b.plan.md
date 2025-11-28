<!-- 0712298b-e86e-47a2-8b1a-b6b38e4828dc 22c1a579-85a4-4cb0-8a9a-c1d53fc1c5a5 -->
# Chore Management Mobile App Development Plan

## Project Structure

### Backend Setup

- Create `backend/` folder at root level (`project-4/chore-management-mobile-app/backend/`)
- Add `backend/database.md` with complete database schema design
- Structure: `backend/` will contain Supabase configuration and API utilities (to be implemented later)

### Mobile App Structure

Keep current Expo Router structure but organize with:

- `app/` - Screen routes (welcome, auth, dashboard)
- `components/` - Reusable UI components
- `services/` - Supabase client and API services
- `context/` - Auth and app state management
- `types/` - TypeScript type definitions
- `constants/` - Theme matching wireframe design

## Implementation Steps

### 1. Backend Foundation

**Location**: `backend/database.md`

Create database schema documentation with:

- Users table (id, email, username, role: 'host' | 'tenant', created_at)
- Houses table (id, name, description, max_tenants, host_id, created_at)
- House_Members table (id, house_id, user_id, joined_at)
- Chores table (id, house_id, title, description, assigned_to_user_id, created_by_user_id, status: 'not_done' | 'done', created_at, completed_at)
- Relationships and indexes
- Row Level Security (RLS) policies outline

### 2. Project Dependencies

**File**: `chore-management-expo-app/package.json`

Add dependencies:

- `@supabase/supabase-js` - Supabase client
- `@react-native-async-storage/async-storage` - Local storage for auth
- `expo-secure-store` - Secure token storage

### 3. Theme & Styling

**File**: `chore-management-expo-app/constants/theme.ts`

Update theme to match wireframe:

- Dark gray background (#2a2a2a or similar)
- Light green text (#90EE90 or similar)
- Dark green buttons (#006400 or similar)
- Input field styling matching wireframe

### 4. Type Definitions

**File**: `chore-management-expo-app/types/index.ts`

Create types for:

- User (id, email, username, role)
- House (id, name, description, max_tenants, host_id)
- Chore (id, title, description, assigned_to_user_id, status, house_id)
- Auth context types

### 5. Supabase Service

**Files**:

- `chore-management-expo-app/services/supabase.ts` - Supabase client initialization
- `chore-management-expo-app/services/auth.ts` - Authentication functions (signUp, signIn, signOut)
- `chore-management-expo-app/services/houses.ts` - House CRUD operations
- `chore-management-expo-app/services/chores.ts` - Chore CRUD operations

### 6. Context Providers

**Files**:

- `chore-management-expo-app/context/AuthContext.tsx` - Auth state management
- `chore-management-expo-app/context/AppContext.tsx` - Current user, house, and chores state

### 7. Navigation Structure

**Files**: `chore-management-expo-app/app/_layout.tsx`

Update root layout with:

- Auth flow navigation (welcome → login/signup → dashboard)
- Protected routes
- Stack navigation for auth screens

### 8. Welcome Screen

**File**: `chore-management-expo-app/app/welcome.tsx`

- "CHORES" title (light green)
- Two buttons: "LOGIN" and "SIGN UP" (dark green)
- Navigate to respective screens

### 9. Authentication Screens

**Files**:

- `chore-management-expo-app/app/login.tsx` - Login form (username, password)
- `chore-management-expo-app/app/signup.tsx` - Signup form (username, password, role selection: Tenant/Host)

### 10. First-Time User Flows

**Files**:

- `chore-management-expo-app/app/join-house.tsx` - Tenant: Search and select house (shows list of available houses)
- `chore-management-expo-app/app/create-house.tsx` - Host: Create house form (name, description, max_tenants)

### 11. Dashboard Screens

**Files**:

- `chore-management-expo-app/app/(dashboard)/_layout.tsx` - Dashboard layout
- `chore-management-expo-app/app/(dashboard)/index.tsx` - Main dashboard (different content for host/tenant)

**Host Dashboard**:

- House name display
- List of tenants
- List of chores with assignee
- "ADD TASK" button
- "ASSIGN" button (to assign chore to tenant)
- "FINISH" button (to mark chore complete)

**Tenant Dashboard**:

- House name display
- List of assigned chores
- "ADD" button (to add new chore)
- "FINISH" button (to mark chore complete)

### 12. Chore Management Components

**Files**:

- `chore-management-expo-app/components/ChoreList.tsx` - Display list of chores
- `chore-management-expo-app/components/ChoreItem.tsx` - Individual chore card
- `chore-management-expo-app/components/AddChoreModal.tsx` - Form to add new chore
- `chore-management-expo-app/components/AssignChoreModal.tsx` - Host: Assign chore to tenant
- `chore-management-expo-app/components/TenantList.tsx` - Host: Display tenants

### 13. Reusable UI Components

**Files**:

- `chore-management-expo-app/components/ui/Button.tsx` - Styled button matching wireframe
- `chore-management-expo-app/components/ui/Input.tsx` - Styled input field
- `chore-management-expo-app/components/ui/Card.tsx` - Card container for chores/houses

### 14. Utility Functions

**File**: `chore-management-expo-app/utils/helpers.ts`

- Format dates
- Check if user is first-time (no house assigned/created)
- Validation helpers

## Design Specifications

### Color Scheme (from wireframe)

- Background: Dark gray (#2a2a2a)
- Text: Light green (#90EE90)
- Buttons: Dark green (#006400)
- Input fields: Light green border/text
- Status indicators: Yellow (not done), Green (done), Pink (remove)

### Layout

- Minimal design matching wireframe
- Simple rectangular buttons
- List-based chore display
- Clear navigation flow

## File Structure Summary

```
chore-management-mobile-app/
├── backend/
│   └── database.md
├── chore-management-expo-app/
│   ├── app/
│   │   ├── _layout.tsx (updated)
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── join-house.tsx
│   │   ├── create-house.tsx
│   │   └── (dashboard)/
│   │       ├── _layout.tsx
│   │       └── index.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── ChoreList.tsx
│   │   ├── ChoreItem.tsx
│   │   ├── AddChoreModal.tsx
│   │   ├── AssignChoreModal.tsx
│   │   └── TenantList.tsx
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── houses.ts
│   │   └── chores.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── constants/
│       └── theme.ts (updated)
```

## Implementation Notes

- Use Expo Router file-based routing
- Implement authentication state persistence
- Check user role and first-time status on app load
- Redirect to appropriate screen based on user state
- Use Supabase Auth for authentication
- Implement real-time subscriptions for chores (optional, can be added later)
- Keep design minimal and functional matching wireframe
- All CRUD operations through Supabase service functions

### To-dos

- [ ] Create backend/ folder at root and add database.md with complete schema design (users, houses, house_members, chores tables with relationships and RLS policies)
- [ ] Add Supabase and storage dependencies to package.json (@supabase/supabase-js, @react-native-async-storage/async-storage, expo-secure-store)
- [ ] Update constants/theme.ts with wireframe colors (dark gray background, light green text, dark green buttons)
- [ ] Create types/index.ts with User, House, Chore, and Auth type definitions
- [ ] Create services folder with supabase.ts (client), auth.ts (signUp/signIn/signOut), houses.ts (CRUD), and chores.ts (CRUD)
- [ ] Create context/AuthContext.tsx and context/AppContext.tsx for auth state and app-wide state management
- [ ] Create reusable UI components: components/ui/Button.tsx, Input.tsx, and Card.tsx matching wireframe design
- [ ] Update app/_layout.tsx with auth flow navigation, protected routes, and stack navigation structure
- [ ] Create app/welcome.tsx with CHORES title and LOGIN/SIGN UP buttons
- [ ] Create app/login.tsx and app/signup.tsx with forms (signup includes role selection: Tenant/Host)
- [ ] Create app/join-house.tsx (tenant house search) and app/create-house.tsx (host house creation form)
- [ ] Create app/(dashboard)/_layout.tsx and app/(dashboard)/index.tsx with role-based content (host vs tenant)
- [ ] Create chore management components: ChoreList.tsx, ChoreItem.tsx, AddChoreModal.tsx, AssignChoreModal.tsx, TenantList.tsx
- [ ] Create utils/helpers.ts with utility functions for date formatting, first-time user checks, and validation