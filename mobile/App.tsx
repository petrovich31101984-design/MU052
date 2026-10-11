import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { api } from './src/api';

// Экраны
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExpenseSheetScreen from './src/screens/ExpenseSheetScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SetupScreen from './src/screens/SetupScreen';

const Stack = createStackNavigator();

export default function App() {
  const { isAuthenticated, loadSession } = useAuthStore();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Инициализация API
    const init = async () => {
      await api.initialize();
      await loadSession();
      
      // Проверяем, настроен ли URL
      const testResult = await api.testConnection();
      setIsConfigured(testResult.success);
    };
    
    init();
  }, []);

  // Если конфигурация ещё не загружена, показываем загрузку
  if (isConfigured === null) {
    return null; // Здесь можно добавить SplashScreen
  }

  // Если не настроен URL, показываем экран настройки
  if (!isConfigured) {
    return (
      <>
        <StatusBar style="dark" />
        <SetupScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#1a73e8',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Главная' }}
              />
              <Stack.Screen 
                name="ExpenseSheet" 
                component={ExpenseSheetScreen}
                options={{ title: 'Лист расхода' }}
              />
              <Stack.Screen 
                name="Messages" 
                component={MessagesScreen}
                options={{ title: 'Сообщения' }}
              />
              <Stack.Screen 
                name="Announcements" 
                component={AnnouncementsScreen}
                options={{ title: 'Объявления' }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ title: 'Профиль' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
