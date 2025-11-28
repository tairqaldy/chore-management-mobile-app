// User types
export type UserRole = 'host' | 'tenant';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

// House types
export interface House {
  id: string;
  name: string;
  description?: string;
  max_tenants: number;
  host_id: string;
  created_at: string;
  updated_at?: string;
}

export interface HouseMember {
  id: string;
  house_id: string;
  user_id: string;
  joined_at: string;
  user?: User; // Populated when fetching with join
}

export interface HouseWithDetails extends House {
  current_tenant_count?: number;
  host_username?: string;
}

// Chore types
export type ChoreStatus = 'not_done' | 'done';

export interface Chore {
  id: string;
  house_id: string;
  title: string;
  description?: string;
  assigned_to_user_id?: string | null;
  created_by_user_id: string;
  status: ChoreStatus;
  archived?: boolean; // Whether the chore is archived
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
  assigned_user?: User; // Populated when fetching with join
  created_by_user?: User; // Populated when fetching with join
}

// Auth types
export interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

// App context types
export interface AppContextType {
  currentHouse: House | null;
  chores: Chore[];
  tenants: User[];
  loading: boolean;
  refreshHouse: () => Promise<void>;
  refreshChores: () => Promise<void>;
  refreshTenants: () => Promise<void>;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  username: string;
  role: UserRole;
}

export interface CreateHouseFormData {
  name: string;
  description?: string;
  max_tenants: number;
}

export interface CreateChoreFormData {
  title: string;
  description?: string;
  assigned_to_user_id?: string;
}

