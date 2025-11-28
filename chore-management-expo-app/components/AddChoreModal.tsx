import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert, ScrollView } from 'react-native';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Colors } from '@/constants/theme';
import { createChore } from '@/services/chores';

interface AddChoreModalProps {
  visible: boolean;
  onClose: () => void;
  houseId: string;
  assignedToUserId?: string;
}

export function AddChoreModal({ visible, onClose, houseId, assignedToUserId }: AddChoreModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = () => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await createChore({
        house_id: houseId,
        title: title.trim(),
        description: description.trim() || undefined,
        assigned_to_user_id: assignedToUserId,
      });
      setTitle('');
      setDescription('');
      setErrors({});
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create chore');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setErrors({});
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
            <Text style={styles.title}>Add Chore</Text>

            <Input
              label="Title:"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter chore title"
              error={errors.title}
            />

            <Input
              label="Description:"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter chore description (optional)"
              multiline
              numberOfLines={4}
            />

            <View style={styles.buttons}>
              <Button
                title="CANCEL"
                onPress={handleClose}
                variant="secondary"
                style={styles.button}
              />
              <Button
                title="ADD"
                onPress={handleSubmit}
                loading={loading}
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
    marginBottom: 20,
    textAlign: 'center',
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

