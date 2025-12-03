import { supabase } from './supabase';
import { Chore, ChoreStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to manage archived chore IDs in local storage
const ARCHIVED_CHORES_KEY = '@archived_chores';

async function getArchivedChoreIds(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(ARCHIVED_CHORES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function addArchivedChoreId(choreId: string): Promise<void> {
  try {
    const archived = await getArchivedChoreIds();
    if (!archived.includes(choreId)) {
      archived.push(choreId);
      await AsyncStorage.setItem(ARCHIVED_CHORES_KEY, JSON.stringify(archived));
    }
  } catch (error) {
    console.error('Error saving archived chore:', error);
  }
}

async function removeArchivedChoreId(choreId: string): Promise<void> {
  try {
    const archived = await getArchivedChoreIds();
    const filtered = archived.filter(id => id !== choreId);
    await AsyncStorage.setItem(ARCHIVED_CHORES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing archived chore:', error);
  }
}

/**
 * Create a new chore
 */
export async function createChore(data: {
  house_id: string;
  title: string;
  description?: string;
  assigned_to_user_id?: string;
}): Promise<Chore> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: choreData, error } = await supabase
    .from('chores')
    .insert({
      house_id: data.house_id,
      title: data.title,
      description: data.description,
      assigned_to_user_id: data.assigned_to_user_id || null,
      created_by_user_id: user.id,
      status: 'not_done',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return choreData;
}

/**
 * Get chores for a house
 */
export async function getChoresByHouse(houseId: string): Promise<Chore[]> {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('house_id', houseId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Get archived chore IDs from local storage
  const archivedIds = await getArchivedChoreIds();

  // Fetch assigned and created by users separately
  const assignedUserIds = [...new Set(data.filter(c => c.assigned_to_user_id).map(c => c.assigned_to_user_id!))];
  const createdByUserIds = [...new Set(data.map(c => c.created_by_user_id))];

  const allUserIds = [...new Set([...assignedUserIds, ...createdByUserIds])];
  
  let usersMap = new Map();
  if (allUserIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, username, email')
      .in('id', allUserIds);

    users?.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  return data.map(chore => ({
    ...chore,
    archived: archivedIds.includes(chore.id) || chore.archived || false,
    assigned_user: chore.assigned_to_user_id ? usersMap.get(chore.assigned_to_user_id) : undefined,
    created_by_user: usersMap.get(chore.created_by_user_id),
  })) as Chore[];
}

/**
 * Get chores assigned to current user
 */
export async function getChoresForUser(userId: string, houseId: string): Promise<Chore[]> {
  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('house_id', houseId)
    .eq('assigned_to_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch assigned and created by users separately
  const assignedUserIds = [...new Set(data.filter(c => c.assigned_to_user_id).map(c => c.assigned_to_user_id!))];
  const createdByUserIds = [...new Set(data.map(c => c.created_by_user_id))];

  const allUserIds = [...new Set([...assignedUserIds, ...createdByUserIds])];
  
  let usersMap = new Map();
  if (allUserIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, username, email')
      .in('id', allUserIds);

    users?.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  return data.map(chore => ({
    ...chore,
    assigned_user: chore.assigned_to_user_id ? usersMap.get(chore.assigned_to_user_id) : undefined,
    created_by_user: usersMap.get(chore.created_by_user_id),
  })) as Chore[];
}

/**
 * Update chore status to done
 */
export async function completeChore(choreId: string): Promise<Chore> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the chore to verify permissions
  const { data: chore, error: fetchError } = await supabase
    .from('chores')
    .select('*')
    .eq('id', choreId)
    .single();

  if (fetchError || !chore) {
    throw new Error('Chore not found');
  }

  // Check if user is part of the house
  const { data: house } = await supabase
    .from('houses')
    .select('host_id')
    .eq('id', chore.house_id)
    .single();

  if (!house) {
    throw new Error('House not found');
  }

  const isHost = house.host_id === user.id;
  const isAssigned = chore.assigned_to_user_id === user.id;
  const isUnassigned = !chore.assigned_to_user_id;

  // Check if user is a tenant in the house
  let isTenant = false;
  if (!isHost) {
    const { data: member } = await supabase
      .from('house_members')
      .select('*')
      .eq('house_id', chore.house_id)
      .eq('user_id', user.id)
      .single();
    isTenant = !!member;
  }

  // Host, assigned user, or any tenant (for unassigned chores) can complete
  if (!isHost && !isAssigned && (!isTenant || !isUnassigned)) {
    throw new Error('You do not have permission to complete this chore');
  }

  const { data: updatedChore, error } = await supabase
    .from('chores')
    .update({
      status: 'done',
      completed_at: new Date().toISOString(),
    })
    .eq('id', choreId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedChore;
}

/**
 * Assign a chore to a user (host only)
 */
export async function assignChore(choreId: string, userId: string): Promise<Chore> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the chore and house to verify host
  const { data: chore, error: fetchError } = await supabase
    .from('chores')
    .select('house_id')
    .eq('id', choreId)
    .single();

  if (fetchError || !chore) {
    throw new Error('Chore not found');
  }

  const { data: house } = await supabase
    .from('houses')
    .select('host_id')
    .eq('id', chore.house_id)
    .single();

  if (!house || house.host_id !== user.id) {
    throw new Error('Only the host can assign chores');
  }

  const { data: updatedChore, error } = await supabase
    .from('chores')
    .update({
      assigned_to_user_id: userId,
    })
    .eq('id', choreId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedChore;
}

/**
 * Update chore details
 */
export async function updateChore(choreId: string, data: {
  title?: string;
  description?: string;
}): Promise<Chore> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the chore to verify permissions
  const { data: chore, error: fetchError } = await supabase
    .from('chores')
    .select('created_by_user_id, house_id')
    .eq('id', choreId)
    .single();

  if (fetchError || !chore) {
    throw new Error('Chore not found');
  }

  const { data: house } = await supabase
    .from('houses')
    .select('host_id')
    .eq('id', chore.house_id)
    .single();

  const isCreator = chore.created_by_user_id === user.id;
  const isHost = house?.host_id === user.id;

  if (!isCreator && !isHost) {
    throw new Error('You do not have permission to update this chore');
  }

  const { data: updatedChore, error } = await supabase
    .from('chores')
    .update(data)
    .eq('id', choreId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedChore;
}

/**
 * Archive a chore (mark as archived)
 */
export async function archiveChore(choreId: string): Promise<Chore> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the chore to verify permissions
  const { data: chore, error: fetchError } = await supabase
    .from('chores')
    .select('house_id, status')
    .eq('id', choreId)
    .single();

  if (fetchError || !chore) {
    throw new Error('Chore not found');
  }

  // Only archived completed chores
  if (chore.status !== 'done') {
    throw new Error('Only completed chores can be archived');
  }

  // Check if user is part of the house
  const { data: house } = await supabase
    .from('houses')
    .select('host_id')
    .eq('id', chore.house_id)
    .single();

  if (!house) {
    throw new Error('House not found');
  }

  // Check if user is host or tenant in the house
  const isHost = house.host_id === user.id;
  let isTenant = false;

  if (!isHost) {
    const { data: member } = await supabase
      .from('house_members')
      .select('*')
      .eq('house_id', chore.house_id)
      .eq('user_id', user.id)
      .single();
    isTenant = !!member;
  }

  if (!isHost && !isTenant) {
    throw new Error('You do not have permission to archive this chore');
  }

  // Always save to local storage first (as backup)
  try {
    await addArchivedChoreId(choreId);
  } catch (storageError) {
    console.warn('Failed to save archived chore to local storage:', storageError);
  }

  // Try to update archived flag - if column doesn't exist, we'll handle it in app state
  const { data: updatedChore, error } = await supabase
    .from('chores')
    .update({
      archived: true,
    })
    .eq('id', choreId)
    .select()
    .single();

  if (error) {
    // If archived column doesn't exist yet, return chore with archived flag set
    // The app will handle archiving in local state
    // We've already saved to local storage, so this is fine
    const { data: choreData, error: fetchError } = await supabase
      .from('chores')
      .select('*')
      .eq('id', choreId)
      .single();
    
    if (fetchError || !choreData) {
      // Even if DB update fails, we've saved to local storage
      // Return a minimal chore object to prevent crashes
      return {
        id: choreId,
        house_id: chore.house_id,
        title: 'Archived Chore',
        status: 'done' as ChoreStatus,
        created_by_user_id: user.id,
        created_at: new Date().toISOString(),
        archived: true,
      } as Chore;
    }
    
    return { ...choreData, archived: true } as Chore;
  }

  if (!updatedChore) {
    // If update returned null but no error, return minimal chore
    return {
      id: choreId,
      house_id: chore.house_id,
      title: 'Archived Chore',
      status: 'done' as ChoreStatus,
      created_by_user_id: user.id,
      created_at: new Date().toISOString(),
      archived: true,
    } as Chore;
  }

  return { ...updatedChore, archived: true } as Chore;
}

/**
 * Get archived chores for a house
 */
export async function getArchivedChores(houseId: string): Promise<Chore[]> {
  // Try to get archived chores - if archived column doesn't exist, get all completed chores
  // The app will filter based on local archived state
  let query = supabase
    .from('chores')
    .select('*')
    .eq('house_id', houseId)
    .eq('status', 'done')
    .order('completed_at', { ascending: false });

  // Try to filter by archived if column exists
  const { data, error } = await query.eq('archived', true);

  if (error) {
    // If archived column doesn't exist, get all completed chores
    // We'll filter archived ones in the app using local storage
    const { data: completedChores, error: completedError } = await supabase
      .from('chores')
      .select('*')
      .eq('house_id', houseId)
      .eq('status', 'done')
      .order('completed_at', { ascending: false });

    if (completedError || !completedChores) {
      return [];
    }

    // Filter archived chores from local storage
    const archivedIds = await getArchivedChoreIds();
    const archived = completedChores.filter(c => archivedIds.includes(c.id));
    
    if (archived.length === 0) {
      return [];
    }

    // Fetch user info for archived chores
    const assignedUserIds = [...new Set(archived.filter(c => c.assigned_to_user_id).map(c => c.assigned_to_user_id!))];
    const createdByUserIds = [...new Set(archived.map(c => c.created_by_user_id))];
    const allUserIds = [...new Set([...assignedUserIds, ...createdByUserIds])];
    
    let usersMap = new Map();
    if (allUserIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, email')
        .in('id', allUserIds);

      users?.forEach(user => {
        usersMap.set(user.id, user);
      });
    }

    return archived.map(chore => ({
      ...chore,
      archived: true,
      assigned_user: chore.assigned_to_user_id ? usersMap.get(chore.assigned_to_user_id) : undefined,
      created_by_user: usersMap.get(chore.created_by_user_id),
    })) as Chore[];
  }

  // Fetch assigned and created by users separately
  const assignedUserIds = [...new Set(data.filter(c => c.assigned_to_user_id).map(c => c.assigned_to_user_id!))];
  const createdByUserIds = [...new Set(data.map(c => c.created_by_user_id))];

  const allUserIds = [...new Set([...assignedUserIds, ...createdByUserIds])];
  
  let usersMap = new Map();
  if (allUserIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, username, email')
      .in('id', allUserIds);

    users?.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  return data.map(chore => ({
    ...chore,
    assigned_user: chore.assigned_to_user_id ? usersMap.get(chore.assigned_to_user_id) : undefined,
    created_by_user: usersMap.get(chore.created_by_user_id),
  })) as Chore[];
}

/**
 * Delete a chore
 */
export async function deleteChore(choreId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the chore to verify permissions
  const { data: chore, error: fetchError } = await supabase
    .from('chores')
    .select('created_by_user_id, house_id')
    .eq('id', choreId)
    .single();

  if (fetchError || !chore) {
    throw new Error('Chore not found');
  }

  const { data: house } = await supabase
    .from('houses')
    .select('host_id')
    .eq('id', chore.house_id)
    .single();

  const isCreator = chore.created_by_user_id === user.id;
  const isHost = house?.host_id === user.id;

  if (!isCreator && !isHost) {
    throw new Error('You do not have permission to delete this chore');
  }

  // Remove from archived list if it exists
  try {
    await removeArchivedChoreId(choreId);
  } catch (storageError) {
    console.warn('Failed to remove archived chore from local storage:', storageError);
  }

  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', choreId);

  if (error) {
    throw new Error(error.message);
  }
}

