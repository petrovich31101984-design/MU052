import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function ProfileScreen() {
  const { employee, logout } = useAuthStore();

  if (!employee) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employee.fullName.split(' ').slice(0, 2).map(n => n[0]).join('')}
          </Text>
        </View>
        <Text style={styles.name}>{employee.fullName}</Text>
        <Text style={styles.position}>{employee.position}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Личная информация</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Персональный номер</Text>
          <Text style={styles.infoValue}>{employee.personalNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Телефон</Text>
          <Text style={styles.infoValue}>{employee.phone || 'Не указан'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Статус</Text>
          <View style={[
            styles.statusBadge,
            employee.status === 'Активен' ? styles.statusActive : styles.statusInactive
          ]}>
            <Text style={[
              styles.statusText,
              employee.status === 'Активен' ? styles.statusTextActive : styles.statusTextInactive
            ]}>
              {employee.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Дата найма</Text>
          <Text style={styles.infoValue}>
            {new Date(employee.hireDate).toLocaleDateString('ru-RU')}
          </Text>
        </View>

        {employee.lastActivity && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Последний вход</Text>
            <Text style={styles.infoValue}>
              {new Date(employee.lastActivity).toLocaleString('ru-RU')}
            </Text>
          </View>
        )}
      </View>

      {employee.note && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Примечание</Text>
          <Text style={styles.noteText}>{employee.note}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: '#16a34a',
  },
  statusTextInactive: {
    color: '#64748b',
  },
  noteText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
