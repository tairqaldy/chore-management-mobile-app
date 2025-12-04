import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { House, Chore, User } from '@/types';
import { getCurrentUserHouse, getHouseTenants } from '@/services/houses';
import { getChoresByHouse, getArchivedChores } from '@/services/chores';
import { useAuth } from './AuthContext';

interface AppContextType {
  currentHouse: House | null;
  chores: Chore[];
  archivedChores: Chore[];
  tenants: User[];
  loading: boolean;
  refreshHouse: () => Promise<void>;
  refreshChores: () => Promise<void>;
  refreshArchivedChores: () => Promise<void>;
  refreshTenants: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [chores, setChores] = useState<Chore[]>([]);
  const [archivedChores, setArchivedChores] = useState<Chore[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHouse = async () => {
    if (!user) {
      setCurrentHouse(null);
      return;
    }

    try {
      const house = await getCurrentUserHouse();
      setCurrentHouse(house);
    } catch (error) {
      console.error('Error refreshing house:', error);
      setCurrentHouse(null);
    }
  };

  const refreshChores = async () => {
    if (!user || !currentHouse) {
      setChores([]);
      return;
    }

    try {
      // Both host and tenants see all chores in the house
      const allChores = await getChoresByHouse(currentHouse.id);
      setChores(allChores);
    } catch (error) {
      console.error('Error refreshing chores:', error);
      setChores([]);
    }
  };

  const refreshArchivedChores = async () => {
    if (!user || !currentHouse) {
      setArchivedChores([]);
      return;
    }

    try {
      const archived = await getArchivedChores(currentHouse.id);
      setArchivedChores(archived);
    } catch (error) {
      console.error('Error refreshing archived chores:', error);
      setArchivedChores([]);
    }
  };

  const refreshTenants = async () => {
    if (!currentHouse) {
      setTenants([]);
      return;
    }

    try {
      const houseTenants = await getHouseTenants(currentHouse.id);
      
      // Get host user info
      const { supabase } = await import('@/services/supabase');
      const { data: hostUser, error: hostError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentHouse.host_id)
        .single();

      if (hostError) {
        console.error('Error fetching host:', hostError);
      }

      // Filter out host from tenants if they're already there (shouldn't happen, but just in case)
      const tenantsWithoutHost = houseTenants.filter(t => t.id !== currentHouse.host_id);
      
      // Combine host and tenants, with host first
      const allMembers = hostUser ? [hostUser, ...tenantsWithoutHost] : tenantsWithoutHost;
      setTenants(allMembers);
    } catch (error) {
      console.error('Error refreshing tenants:', error);
      setTenants([]);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      refreshHouse().finally(() => setLoading(false));
    } else {
      setCurrentHouse(null);
      setChores([]);
      setArchivedChores([]);
      setTenants([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (currentHouse) {
      refreshChores();
      refreshArchivedChores();
      // Always refresh tenants (includes host) for both roles
      refreshTenants();
    } else {
      setChores([]);
      setArchivedChores([]);
      setTenants([]);
    }
  }, [currentHouse, user]);

  return (
    <AppContext.Provider
      value={{
        currentHouse,
        chores,
        archivedChores,
        tenants,
        loading,
        refreshHouse,
        refreshChores,
        refreshArchivedChores,
        refreshTenants,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

