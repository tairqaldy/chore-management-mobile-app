import { supabase } from './supabase';
import { House, HouseWithDetails, HouseMember, User } from '@/types';

/**
 * Create a new house
 */
export async function createHouse(data: {
  name: string;
  description?: string;
  max_tenants: number;
}): Promise<House> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: houseData, error } = await supabase
    .from('houses')
    .insert({
      name: data.name,
      description: data.description,
      max_tenants: data.max_tenants,
      host_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return houseData;
}

/**
 * Get house by ID
 */
export async function getHouseById(houseId: string): Promise<House | null> {
  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .eq('id', houseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get house for current user (host or tenant)
 */
export async function getCurrentUserHouse(): Promise<House | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // First check if user is a host
  const { data: hostHouse } = await supabase
    .from('houses')
    .select('*')
    .eq('host_id', user.id)
    .single();

  if (hostHouse) {
    return hostHouse;
  }

  // If not a host, check if user is a tenant
  const { data: memberHouse } = await supabase
    .from('house_members')
    .select('house_id')
    .eq('user_id', user.id)
    .single();

  if (memberHouse) {
    const { data: house } = await supabase
      .from('houses')
      .select('*')
      .eq('id', memberHouse.house_id)
      .single();

    if (house) {
      return house;
    }
  }

  return null;
}

/**
 * Get all available houses (for tenant to join)
 */
export async function getAvailableHouses(): Promise<HouseWithDetails[]> {
  const { data, error } = await supabase
    .from('houses')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  // Get host usernames and tenant counts for each house
  const houseIds = data.map(h => h.id);
  const hostIds = [...new Set(data.map(h => h.host_id))];

  // Fetch hosts
  const { data: hosts } = await supabase
    .from('users')
    .select('id, username')
    .in('id', hostIds);

  const hostMap = new Map<string, string>();
  hosts?.forEach(host => {
    hostMap.set(host.id, host.username);
  });

  // Get tenant counts
  const { data: memberCounts } = await supabase
    .from('house_members')
    .select('house_id')
    .in('house_id', houseIds);

  const countsMap = new Map<string, number>();
  memberCounts?.forEach(m => {
    countsMap.set(m.house_id, (countsMap.get(m.house_id) || 0) + 1);
  });

  return data.map(house => ({
    ...house,
    current_tenant_count: countsMap.get(house.id) || 0,
    host_username: hostMap.get(house.host_id),
  })) as HouseWithDetails[];
}

/**
 * Join a house as a tenant
 */
export async function joinHouse(houseId: string): Promise<HouseMember> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if house exists and has space
  const house = await getHouseById(houseId);
  if (!house) {
    throw new Error('House not found');
  }

  // Get current tenant count
  const { count } = await supabase
    .from('house_members')
    .select('*', { count: 'exact', head: true })
    .eq('house_id', houseId);

  if (count !== null && count >= house.max_tenants) {
    throw new Error('House is full');
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('house_members')
    .select('*')
    .eq('house_id', houseId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    throw new Error('Already a member of this house');
  }

  const { data, error } = await supabase
    .from('house_members')
    .insert({
      house_id: houseId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get tenants for a house
 */
export async function getHouseTenants(houseId: string): Promise<User[]> {
  const { data: members, error } = await supabase
    .from('house_members')
    .select('user_id')
    .eq('house_id', houseId);

  if (error) {
    throw new Error(error.message);
  }

  if (!members || members.length === 0) {
    return [];
  }

  const userIds = members.map(m => m.user_id);
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds);

  if (usersError) {
    throw new Error(usersError.message);
  }

  return users || [];
}

/**
 * Remove a tenant from a house (host only)
 */
export async function removeTenant(houseId: string, userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user is the host
  const house = await getHouseById(houseId);
  if (!house || house.host_id !== user.id) {
    throw new Error('Only the host can remove tenants');
  }

  const { error } = await supabase
    .from('house_members')
    .delete()
    .eq('house_id', houseId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Leave a house (tenant only)
 */
export async function leaveHouse(houseId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user is a tenant (not the host)
  const house = await getHouseById(houseId);
  if (!house) {
    throw new Error('House not found');
  }

  if (house.host_id === user.id) {
    throw new Error('Hosts cannot leave their own house. Delete the house instead.');
  }

  // Check if user is a member
  const { data: member } = await supabase
    .from('house_members')
    .select('*')
    .eq('house_id', houseId)
    .eq('user_id', user.id)
    .single();

  if (!member) {
    throw new Error('You are not a member of this house');
  }

  // Remove from house_members
  const { error } = await supabase
    .from('house_members')
    .delete()
    .eq('house_id', houseId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update house details (host only)
 */
export async function updateHouse(houseId: string, data: {
  name?: string;
  description?: string;
  max_tenants?: number;
}): Promise<House> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user is the host
  const house = await getHouseById(houseId);
  if (!house || house.host_id !== user.id) {
    throw new Error('Only the host can update the house');
  }

  const { data: updatedHouse, error } = await supabase
    .from('houses')
    .update(data)
    .eq('id', houseId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedHouse;
}

