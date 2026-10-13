import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { ExpenseItem, Nomenclature } from '../types';

export default function ExpenseSheetScreen({ navigation }: any) {
  const { employee } = useAuthStore();
  const { nomenclature, loadNomenclature, createExpenseSheet } = useDataStore();
  
  const [patientName, setPatientName] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [callCategory, setCallCategory] = useState('Первичный');
  const [therapyName, setTherapyName] = useState('');
  const [therapyCost, setTherapyCost] = useState('');
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNomenclaturePicker, setShowNomenclaturePicker] = useState(false);

  useEffect(() => {
    loadNomenclature();
  }, []);

  const addItem = (nom: Nomenclature) => {
    const existingItem = items.find(i => i.nomenclatureId === nom.id);
    
    if (existingItem) {
      setItems(items.map(i => 
        i.nomenclatureId === nom.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.pricePerUnit }
          : i
      ));
    } else {
      setItems([...items, {
        nomenclatureId: nom.id,
        name: nom.name,
        category: nom.category,
        quantity: 1,
        pricePerUnit: nom.currentPrice,
        total: nom.currentPrice,
      }]);
    }
    
    setShowNomenclaturePicker(false);
  };

  const updateQuantity = (nomenclatureId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter(i => i.nomenclatureId !== nomenclatureId));
    } else {
      setItems(items.map(i => 
        i.nomenclatureId === nomenclatureId 
          ? { ...i, quantity, total: quantity * i.pricePerUnit }
          : i
      ));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      Alert.alert('Ошибка', 'Введите ФИО пациента');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы один препарат');
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const success = await createExpenseSheet({
        employeeId: employee!.id,
        employeeName: employee!.fullName,
        patientName,
        patientBirthDate,
        date: now.toISOString(),
        month,
        callCategory,
        therapyName,
        therapyCost: parseFloat(therapyCost) || 0,
        items,
        totalAmount,
        archived: false,
      });

      if (success) {
        Alert.alert('Успех', 'Лист расхода создан', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Ошибка', 'Не удалось создать лист расхода');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при создании листа расхода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация о пациенте</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ФИО пациента *</Text>
          <TextInput
            style={styles.input}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Иванов Иван Иванович"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Дата рождения</Text>
          <TextInput
            style={styles.input}
            value={patientBirthDate}
            onChangeText={setPatientBirthDate}
            placeholder="ДД.ММ.ГГГГ"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Категория выезда</Text>
          <View style={styles.categoryButtons}>
            {['Первичный', 'Повторный', 'Курс'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  callCategory === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCallCategory(cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  callCategory === cat && styles.categoryButtonTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Название терапии</Text>
          <TextInput
            style={styles.input}
            value={therapyName}
            onChangeText={setTherapyName}
            placeholder="Введите название терапии"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Стоимость терапии (₽)</Text>
          <TextInput
            style={styles.input}
            value={therapyCost}
            onChangeText={setTherapyCost}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Препараты и расходники</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNomenclaturePicker(true)}
        >
          <Text style={styles.addButtonText}>+ Добавить препарат</Text>
        </TouchableOpacity>

        {items.map(item => (
          <View key={item.nomenclatureId} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
            <View style={styles.itemControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.nomenclatureId, item.quantity - 1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.nomenclatureId, item.quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.itemTotal}>{item.total.toLocaleString('ru-RU')} ₽</Text>
            </View>
          </View>
        ))}

        {items.length > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalAmount}>{totalAmount.toLocaleString('ru-RU')} ₽</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Создать лист расхода</Text>
        )}
      </TouchableOpacity>

      {showNomenclaturePicker && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите препарат</Text>
            <ScrollView style={styles.nomenclatureList}>
              {nomenclature.map(nom => (
                <TouchableOpacity
                  key={nom.id}
                  style={styles.nomenclatureItem}
                  onPress={() => addItem(nom)}
                >
                  <Text style={styles.nomenclatureName}>{nom.name}</Text>
                  <Text style={styles.nomenclaturePrice}>
                    {nom.currentPrice.toLocaleString('ru-RU')} ₽
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNomenclaturePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  itemCategory: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginLeft: 'auto',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  submitButton: {
    backgroundColor: '#dc2626',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  nomenclatureList: {
    maxHeight: 400,
  },
  nomenclatureItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomenclatureName: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  nomenclaturePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  modalCloseButton: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});
