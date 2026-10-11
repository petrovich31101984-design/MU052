import { create } from 'zustand';
import { Employee, AuthState } from '../types';
import * as SecureStore from 'expo-secure-store';

interface AuthStore extends AuthState {
  login: (employee: Employee) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  employee: null,
  token: null,

  login: async (employee: Employee) => {
    // Сохраняем данные сотрудника в SecureStore
    await SecureStore.setItemAsync('employee', JSON.stringify(employee));
    await SecureStore.setItemAsync('token', employee.id);
    
    set({
      isAuthenticated: true,
      employee,
      token: employee.id,
    });
  },

  logout: async () => {
    // Удаляем данные из SecureStore
    await SecureStore.deleteItemAsync('employee');
    await SecureStore.deleteItemAsync('token');
    
    set({
      isAuthenticated: false,
      employee: null,
      token: null,
    });
  },

  loadSession: async () => {
    try {
      const employeeJson = await SecureStore.getItemAsync('employee');
      const token = await SecureStore.getItemAsync('token');
      
      if (employeeJson && token) {
        const employee = JSON.parse(employeeJson) as Employee;
        set({
          isAuthenticated: true,
          employee,
          token,
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки сессии:', error);
    }
  },
}));
