import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { api } from '../api';

export default function SetupScreen() {
  const [scriptUrl, setScriptUrl] = useState('');
  const [testing, setTesting] = useState(false);

  const handleConnect = async () => {
    if (!scriptUrl.trim()) {
      Alert.alert('Ошибка', 'Введите URL веб-приложения');
      return;
    }

    setTesting(true);
    try {
      await api.saveConfig(scriptUrl.trim());
      const testResult = await api.testConnection();
      
      if (testResult.success) {
        Alert.alert('Успех', 'Подключение установлено!', [
          { text: 'OK', onPress: () => {
            // Перезапускаем приложение
            // В реальном приложении здесь будет перезагрузка
          }}
        ]);
      } else {
        Alert.alert('Ошибка', testResult.error || 'Не удалось подключиться');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Ошибка подключения к серверу');
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Настройка подключения</Text>
        <Text style={styles.subtitle}>
          Введите URL веб-приложения Google Apps Script
        </Text>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Инструкция:</Text>
          <Text style={styles.instructionText}>
            1. Откройте Google Sheets с базой данных{'\n'}
            2. Расширения → Apps Script{'\n'}
            3. Развернуть → Новое развертывание{'\n'}
            4. Тип: Веб-приложение{'\n'}
            5. Скопируйте URL и вставьте ниже
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>URL веб-приложения</Text>
          <TextInput
            style={styles.input}
            value={scriptUrl}
            onChangeText={setScriptUrl}
            placeholder="https://script.google.com/macros/s/..."
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleConnect}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Подключиться</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} АлкоСпас • Выездная медицинская помощь
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  instructions: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
  },
});
