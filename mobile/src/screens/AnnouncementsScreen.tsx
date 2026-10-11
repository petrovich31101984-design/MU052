import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useDataStore } from '../store/dataStore';
import { Announcement } from '../types';

export default function AnnouncementsScreen() {
  const { announcements, loadAnnouncements } = useDataStore();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const activeAnnouncements = announcements.filter(a => a.active);

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString('ru-RU')}
        </Text>
      </View>
      <Text style={styles.text}>{item.text}</Text>
      <Text style={styles.author}>От: {item.createdBy}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {activeAnnouncements.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📢</Text>
          <Text style={styles.emptyText}>Нет активных объявлений</Text>
        </View>
      ) : (
        <FlatList
          data={activeAnnouncements}
          renderItem={renderAnnouncement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 12,
  },
  author: {
    fontSize: 14,
    color: '#94a3b8',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});
