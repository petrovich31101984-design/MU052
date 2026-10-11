import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { api } from '../api';

export default function HomeScreen({ navigation }: any) {
  const { employee, logout } = useAuthStore();
  const { loadAnnouncements, announcements } = useDataStore();

  useEffect(() => {
    if (employee) {
      loadAnnouncements();
    }
  }, [employee]);

  const handleToggleShift = async () => {
    if (!employee) return;

    try {
      if (employee.shiftOpen) {
        await api.closeShift(employee.id);
        Alert.alert('Смена закрыта');
      } else {
        await api.openShift(employee.id);
        Alert.alert('Смена открыта');
      }
      // Перезагружаем данные сотрудника
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить статус смены');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const unreadMessages = 0; // TODO: подсчитать непрочитанные сообщения
  const activeAnnouncements = announcements.filter(a => a.active).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Здравствуйте,</Text>
          <Text style={styles.name}>{employee?.fullName}</Text>
          <Text style={styles.position}>{employee?.position}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.shiftCard}>
        <View style={styles.shiftInfo}>
          <Text style={styles.shiftLabel}>Статус смены</Text>
          <Text style={[
            styles.shiftStatus,
            employee?.shiftOpen ? styles.shiftOpen : styles.shiftClosed
          ]}>
            {employee?.shiftOpen ? '🟢 Смена открыта' : '⚪ Смена закрыта'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.shiftButton,
            employee?.shiftOpen ? styles.shiftButtonClose : styles.shiftButtonOpen
          ]}
          onPress={handleToggleShift}
        >
          <Text style={styles.shiftButtonText}>
            {employee?.shiftOpen ? 'Закрыть смену' : 'Открыть смену'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ExpenseSheet')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>📝</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Лист расхода</Text>
            <Text style={styles.menuSubtitle}>Создать новый лист расхода</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Messages')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>💬</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Сообщения</Text>
            <Text style={styles.menuSubtitle}>
              {unreadMessages > 0 
                ? `${unreadMessages} непрочитанных` 
                : 'Нет новых сообщений'}
            </Text>
          </View>
          {unreadMessages > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadMessages}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Announcements')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>📢</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Объявления</Text>
            <Text style={styles.menuSubtitle}>
              {activeAnnouncements > 0 
                ? `${activeAnnouncements} активных` 
                : 'Нет объявлений'}
            </Text>
          </View>
          {activeAnnouncements > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeAnnouncements}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>👤</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Профиль</Text>
            <Text style={styles.menuSubtitle}>Личная информация</Text>
          </View>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  position: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 14,
  },
  shiftCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shiftInfo: {
    marginBottom: 16,
  },
  shiftLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  shiftStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shiftOpen: {
    color: '#16a34a',
  },
  shiftClosed: {
    color: '#64748b',
  },
  shiftButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shiftButtonOpen: {
    backgroundColor: '#16a34a',
  },
  shiftButtonClose: {
    backgroundColor: '#dc2626',
  },
  shiftButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
