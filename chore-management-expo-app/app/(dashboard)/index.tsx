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
    try {
      await signOutUser();
      router.replace('/welcome');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
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
              const { leaveHouse } = await import('@/services/houses');
              await leaveHouse(currentHouse.id);
              // Refresh house to clear current house
              await refreshHouse();
              // Redirect to join house screen
              router.replace('/join-house');
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to leave house');
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
        user?.role === 'host' ? refreshTenants() : Promise.resolve(),
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.text}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>CHORES</Text>
          {currentHouse && (
            <Text style={styles.houseName}>{currentHouse.name}</Text>
          )}
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => {
                // @ts-ignore - archive route exists
                router.push('/archive');
              }} 
              style={styles.archiveButton}
            >
              <Ionicons name="archive-outline" size={18} color={Colors.text} />
              <Text style={styles.archiveText}>Archive</Text>
            </TouchableOpacity>
            {!isHost && (
              <TouchableOpacity onPress={handleLeaveHouse} style={styles.leaveHouseButton}>
                <Text style={styles.leaveHouseText}>Leave House</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={[styles.signOutText, { color: Colors.action }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

      {isHost ? (
        <View style={styles.hostContent}>
          <Text style={styles.sectionTitle}>TENANTS:</Text>
          <TenantList tenants={tenants} onRefresh={refreshTenants} />

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

          <View style={styles.buttonRow}>
            <Button
              title="ADD TASK"
              onPress={() => setShowAddChore(true)}
              style={styles.button}
            />
          </View>
        </View>
      ) : (
        <View style={styles.tenantContent}>
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

          <View style={styles.buttonRow}>
            <Button
              title="ADD"
              onPress={() => setShowAddChore(true)}
              style={styles.button}
            />
          </View>
        </View>
      )}

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
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  houseName: {
    fontSize: 20,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 8,
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
    backgroundColor: Colors.cardBackground,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  archiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  leaveHouseButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  leaveHouseText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textDecorationLine: 'underline',
  },
  signOutButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
  },
});

