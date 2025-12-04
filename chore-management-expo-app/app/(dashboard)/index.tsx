import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ChoreList } from '@/components/ChoreList';
import { TenantList } from '@/components/TenantList';
import { AddChoreModal } from '@/components/AddChoreModal';
import { AssignChoreModal } from '@/components/AssignChoreModal';
import { RoleIndicator } from '@/components/ui/RoleIndicator';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut: signOutUser } = useAuth();
  const { currentHouse, chores, archivedChores, tenants, refreshHouse, refreshChores, refreshArchivedChores, refreshTenants } = useApp();
  const [showAddChore, setShowAddChore] = useState(false);
  const [showAssignChore, setShowAssignChore] = useState(false);
  const [selectedChoreId, setSelectedChoreId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter chores to exclude archived ones and show only active ones
  const activeChores = chores.filter(chore => !chore.archived);

  // Calculate completed tasks count for each user (for gamification placeholder)
  // This counts all completed chores (done status) for each user
  // For assigned chores: count goes to assigned user
  // For unassigned chores: we'll need to track completer in future, for now count all completed
  const completedTasksCount = React.useMemo(() => {
    const count: Record<string, number> = {};
    
    // Initialize all tenants with 0
    tenants.forEach(tenant => {
      count[tenant.id] = 0;
    });
    
    // Count completed chores
    chores.forEach(chore => {
      if (chore.status === 'done' && chore.completed_at) {
        if (chore.assigned_to_user_id) {
          // Assigned chore - count to assigned user
          if (count[chore.assigned_to_user_id] !== undefined) {
            count[chore.assigned_to_user_id] = (count[chore.assigned_to_user_id] || 0) + 1;
          }
        }
        // Note: For unassigned completed chores, we'd need a "completed_by_user_id" field
        // This is a placeholder for future gamification feature
      }
    });
    
    return count;
  }, [chores, tenants]);

  useEffect(() => {
    if (!user) {
      router.replace('/welcome');
      return;
    }

    if (!currentHouse) {
      if (user.role === 'tenant') {
        router.replace('/join-house');
      } else {
        router.replace('/create-house');
      }
    }
  }, [user, currentHouse]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to sign out...');
              await signOutUser();
              console.log('Sign out successful, redirecting...');
              router.replace('/welcome');
            } catch (error: any) {
              console.error('Error signing out:', error);
              Alert.alert('Error', error?.message || 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleLeaveHouse = async () => {
    if (!currentHouse) return;

    Alert.alert(
      'Leave House',
      'Are you sure you want to leave this house? You will need to join another house to continue using the app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to leave house:', currentHouse.id);
              const { leaveHouse } = await import('@/services/houses');
              await leaveHouse(currentHouse.id);
              console.log('Successfully left house');
              // Refresh house to clear current house
              await refreshHouse();
              // Redirect to join house screen
              router.replace('/join-house');
            } catch (error: any) {
              console.error('Error leaving house:', error);
              Alert.alert('Error', error?.message || 'Failed to leave house. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshHouse(),
        refreshChores(),
        refreshArchivedChores(),
        refreshTenants(),
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshHouse, refreshChores, refreshArchivedChores, refreshTenants, user]);

  if (!user || !currentHouse) {
    return null;
  }

  const isHost = user.role === 'host';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6BCF8E"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>CHORES</Text>
            <RoleIndicator role={user.role} style={styles.roleIndicator} />
          </View>
          {currentHouse && (
            <View style={styles.houseNameContainer}>
              <Ionicons name="home-outline" size={20} color="#6BCF8E" />
              <Text style={styles.houseName}>{currentHouse.name}</Text>
            </View>
          )}
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => {
                // @ts-ignore - archive route exists
                router.push('/archive');
              }} 
              style={styles.archiveButton}
            >
              <Ionicons name="archive-outline" size={18} color="#6BCF8E" />
              <Text style={styles.archiveText}>Archive</Text>
            </TouchableOpacity>
            {!isHost && (
              <TouchableOpacity onPress={handleLeaveHouse} style={styles.leaveHouseButton}>
                <Ionicons name="exit-outline" size={18} color="#FFA500" />
                <Text style={styles.leaveHouseText}>Leave House</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Ionicons name="log-out-outline" size={18} color={Colors.action} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

      {isHost ? (
        <View style={styles.hostContent}>
          <TenantList 
            tenants={tenants} 
            currentHouse={currentHouse}
            currentUserId={user.id}
            onRefresh={refreshTenants}
            completedTasksCount={completedTasksCount}
          />

          <Text style={styles.sectionTitle}>CHORES:</Text>
          <ChoreList
            chores={activeChores}
            isHost={true}
            currentUserId={user.id}
            onRefresh={refreshChores}
            onAssign={(choreId) => {
              setSelectedChoreId(choreId);
              setShowAssignChore(true);
            }}
            onComplete={async (choreId) => {
              try {
                const { completeChore } = await import('@/services/chores');
                await completeChore(choreId);
                await refreshChores();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to complete chore');
              }
            }}
            onArchive={async (choreId) => {
              try {
                const { archiveChore } = await import('@/services/chores');
                await archiveChore(choreId);
                // Refresh after a small delay to ensure state is updated
                setTimeout(async () => {
                  try {
                    await refreshChores();
                    await refreshArchivedChores();
                  } catch (refreshError: any) {
                    console.error('Error refreshing after archive:', refreshError);
                  }
                }, 100);
              } catch (error: any) {
                console.error('Archive error:', error);
                // Don't show alert if component is unmounted
                try {
                  Alert.alert('Error', error?.message || 'Failed to archive chore');
                } catch (alertError) {
                  console.error('Error showing alert:', alertError);
                }
                // Re-throw to let ChoreItem handle the error
                throw error;
              }
            }}
          />
        </View>
      ) : (
        <View style={styles.tenantContent}>
          <TenantList 
            tenants={tenants} 
            currentHouse={currentHouse}
            currentUserId={user.id}
            onRefresh={refreshTenants}
            completedTasksCount={completedTasksCount}
          />

          <Text style={styles.sectionTitle}>CHORES:</Text>
          <ChoreList
            chores={activeChores}
            isHost={false}
            currentUserId={user.id}
            onRefresh={refreshChores}
            onComplete={async (choreId) => {
              try {
                const { completeChore } = await import('@/services/chores');
                await completeChore(choreId);
                await refreshChores();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to complete chore');
              }
            }}
            onArchive={async (choreId) => {
              try {
                const { archiveChore } = await import('@/services/chores');
                await archiveChore(choreId);
                // Refresh after a small delay to ensure state is updated
                setTimeout(async () => {
                  try {
                    await refreshChores();
                    await refreshArchivedChores();
                  } catch (refreshError: any) {
                    console.error('Error refreshing after archive:', refreshError);
                  }
                }, 100);
              } catch (error: any) {
                console.error('Archive error:', error);
                // Don't show alert if component is unmounted
                try {
                  Alert.alert('Error', error?.message || 'Failed to archive chore');
                } catch (alertError) {
                  console.error('Error showing alert:', alertError);
                }
                // Re-throw to let ChoreItem handle the error
                throw error;
              }
            }}
          />
        </View>
      )}

      {/* Fixed bottom button */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title={isHost ? "ADD TASK" : "ADD"}
          onPress={() => setShowAddChore(true)}
          style={styles.bottomButton}
        />
      </View>

      <AddChoreModal
        visible={showAddChore}
        onClose={() => {
          setShowAddChore(false);
          refreshChores();
        }}
        houseId={currentHouse.id}
      />

      {isHost && (
        <AssignChoreModal
          visible={showAssignChore}
          onClose={() => {
            setShowAssignChore(false);
            setSelectedChoreId(null);
            refreshChores();
          }}
          choreId={selectedChoreId}
          tenants={tenants}
        />
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  header: {
    marginBottom: 30,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6BCF8E',
    letterSpacing: 2,
  },
  houseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  houseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6BCF8E',
  },
  roleIndicator: {
    marginLeft: 'auto',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1D',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6BCF8E',
  },
  archiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6BCF8E',
  },
  leaveHouseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2A1F0A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  leaveHouseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFA500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2A0A0A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.action,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.action,
  },
  hostContent: {
    flex: 1,
  },
  tenantContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AFAFAF',
    marginTop: 20,
    marginBottom: 12,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0E0E10',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2E',
  },
  bottomButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#1E7D1E',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
});

