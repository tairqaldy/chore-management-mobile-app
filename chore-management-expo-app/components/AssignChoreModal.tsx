import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from './ui/Button';
import { Colors } from '@/constants/theme';
import { assignChore } from '@/services/chores';
import { User } from '@/types';

interface AssignChoreModalProps {
  visible: boolean;
  onClose: () => void;
  choreId: string | null;
  tenants: User[];
}

export function AssignChoreModal({ visible, onClose, choreId, tenants }: AssignChoreModalProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!choreId) {
    return null;
  }

  const handleSubmit = async () => {
    if (!selectedTenantId) {
      Alert.alert('Error', 'Please select a tenant');
      return;
    }

    setLoading(true);
    try {
      await assignChore(choreId, selectedTenantId);
      setSelectedTenantId(null);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to assign chore');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTenantId(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Assign Chore</Text>
            <Text style={styles.subtitle}>Select a tenant:</Text>

            {tenants.length === 0 ? (
              <Text style={styles.emptyText}>No tenants available</Text>
            ) : (
              <View style={styles.tenantsList}>
                {tenants.map((tenant) => (
                  <TouchableOpacity
                    key={tenant.id}
                    style={[
                      styles.tenantButton,
                      selectedTenantId === tenant.id && styles.tenantButtonSelected,
                    ]}
                    onPress={() => setSelectedTenantId(tenant.id)}
                  >
                    <Text
                      style={[
                        styles.tenantText,
                        selectedTenantId === tenant.id && styles.tenantTextSelected,
                      ]}
                    >
                      {tenant.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.buttons}>
              <Button
                title="CANCEL"
                onPress={handleClose}
                variant="secondary"
                style={styles.button}
              />
              <Button
                title="ASSIGN"
                onPress={handleSubmit}
                loading={loading}
                disabled={!selectedTenantId || tenants.length === 0}
                style={styles.button}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  tenantsList: {
    marginBottom: 20,
  },
  tenantButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.cardBackground,
    marginBottom: 8,
  },
  tenantButtonSelected: {
    backgroundColor: Colors.button,
    borderColor: Colors.button,
  },
  tenantText: {
    fontSize: 16,
    color: Colors.text,
  },
  tenantTextSelected: {
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginVertical: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});

