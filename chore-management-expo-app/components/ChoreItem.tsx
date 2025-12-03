import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chore } from '@/types';
import { Card } from './ui/Card';
import { Colors } from '@/constants/theme';
import { formatDate } from '@/utils/helpers';

interface ChoreItemProps {
  chore: Chore;
  isHost: boolean;
  currentUserId?: string;
  onComplete?: (choreId: string) => void;
  onAssign?: (choreId: string) => void;
  onArchive?: (choreId: string) => void | Promise<void>;
  onDelete?: (choreId: string) => void | Promise<void>;
  isArchiveView?: boolean;
}

export function ChoreItem({ chore, isHost, currentUserId, onComplete, onAssign, onArchive, onDelete, isArchiveView }: ChoreItemProps) {
  const statusColor = chore.status === 'done' ? Colors.statusDone : Colors.statusNotDone;

  const isAssignedToMe = chore.assigned_to_user_id === currentUserId;
  const isUnassigned = !chore.assigned_to_user_id;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{chore.title}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      </View>

      {chore.description && (
        <Text style={styles.description}>{chore.description}</Text>
      )}

      {isHost && chore.assigned_user && (
        <Text style={styles.assignedTo}>
          Assigned to: {chore.assigned_user.username}
        </Text>
      )}

      {isHost && isUnassigned && (
        <Text style={styles.assignedTo}>Unassigned</Text>
      )}

      {!isHost && isAssignedToMe && (
        <Text style={styles.assignedTo}>Assigned to you</Text>
      )}

      {!isHost && isUnassigned && (
        <Text style={styles.assignedTo}>Unassigned - Available for everyone</Text>
      )}

      {!isHost && !isAssignedToMe && !isUnassigned && chore.assigned_user && (
        <Text style={styles.assignedTo}>
          Assigned to: {chore.assigned_user.username}
        </Text>
      )}

      <Text style={styles.date}>{formatDate(chore.created_at)}</Text>

      {isArchiveView ? (
        // Archive view: show delete button
        <View style={styles.actions}>
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDelete]}
              onPress={() => onDelete(chore.id)}
            >
              <Text style={[styles.actionText, styles.deleteText]}>DELETE</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        // Regular view: show complete/assign/archive buttons
        <>
          {isHost && (
            <View style={styles.actions}>
              {chore.status === 'not_done' && (
                <>
                  {!chore.assigned_to_user_id && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onAssign?.(chore.id)}
                    >
                      <Text style={styles.actionText}>ASSIGN</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onComplete?.(chore.id)}
                  >
                    <Text style={styles.actionText}>FINISH</Text>
                  </TouchableOpacity>
                </>
              )}
              {chore.status === 'done' && onArchive && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onArchive(chore.id)}
                >
                  <Text style={styles.actionText}>ARCHIVE</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!isHost && (
            <View style={styles.actions}>
              {chore.status === 'not_done' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onComplete?.(chore.id)}
                >
                  <Text style={styles.actionText}>FINISH</Text>
                </TouchableOpacity>
              )}
              {chore.status === 'done' && onArchive && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onArchive(chore.id)}
                >
                  <Text style={styles.actionText}>ARCHIVE</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 8,
  },
  assignedTo: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.6,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.button,
    borderRadius: 4,
  },
  actionText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonDelete: {
    backgroundColor: Colors.error,
  },
  deleteText: {
    color: '#FFFFFF',
  },
});

