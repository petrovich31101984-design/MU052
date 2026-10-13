# Адаптация Google Apps Script для мобильного приложения

Для работы мобильного приложения нужно добавить новые функции в ваш Google Apps Script.

## 📝 Что нужно добавить

Откройте файл `public/google-apps-script-webapp.js` и добавьте следующие функции в конец файла:

### 1. Авторизация сотрудника

```javascript
function authenticateEmployee(personalNumber, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  if (!sheet) {
    return { success: false, error: 'Лист "Сотрудники" не найден' };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const empId = row[0];
    const empNumber = String(row[1]);
    const empName = row[2];
    const empPassword = row[3];
    const empStatus = row[4];
    const empPosition = row[5];
    const empHireDate = row[6];
    const empBlocked = row[8];
    const empPhone = row[9];
    const empLastActivity = row[12];
    const empNote = row[13];
    const empShiftOpen = row[14];
    
    if (empNumber === personalNumber && empPassword === password) {
      if (empBlocked === 'ДА') {
        return { success: false, error: 'Аккаунт заблокирован' };
      }
      
      if (empStatus === 'Уволен') {
        return { success: false, error: 'Аккаунт уволен' };
      }
      
      // Возвращаем данные сотрудника
      return {
        success: true,
        data: {
          id: empId,
          personalNumber: empNumber,
          fullName: empName,
          password: empPassword,
          status: empStatus,
          position: empPosition,
          hireDate: empHireDate instanceof Date ? empHireDate.toISOString() : empHireDate,
          blocked: empBlocked === 'ДА',
          phone: empPhone,
          lastActivity: empLastActivity instanceof Date ? empLastActivity.toISOString() : empLastActivity,
          note: empNote,
          shiftOpen: empShiftOpen === 'ДА'
        }
      };
    }
  }
  
  return { success: false, error: 'Неверный персональный номер или пароль' };
}
```

### 2. Получение листов расхода сотрудника

```javascript
function getEmployeeExpenseSheets(employeeId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Листы расхода');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1)
    .filter(row => row[1] === employeeId && row[12] !== 'ДА') // Только неархивные
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = row[i];
        if (h === 'Позиции (JSON)') {
          try {
            obj['items'] = JSON.parse(val || '[]');
          } catch (e) {
            obj['items'] = [];
          }
        } else if (val instanceof Date) {
          obj[h] = val.toISOString();
        } else {
          obj[h] = val || '';
        }
      });
      
      // Маппинг полей
      return {
        id: obj['ID'] || '',
        employeeId: obj['Сотрудник_ID'] || '',
        employeeName: obj['Сотрудник'] || '',
        patientName: obj['Пациент'] || '',
        patientBirthDate: obj['Дата рождения пациента'] || '',
        date: obj['Дата'] || '',
        month: obj['Месяц'] || '',
        callCategory: obj['Категория выезда'] || '',
        therapyName: obj['Название терапии'] || '',
        therapyCost: parseFloat(obj['Стоимость терапии'] || '0'),
        items: obj['items'] || [],
        totalAmount: parseFloat(obj['Итого по препаратам'] || '0'),
        archived: obj['Архив'] === 'ДА'
      };
    });
}
```

### 3. Получение сообщений сотрудника

```javascript
function getEmployeeMessages(employeeId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Чат');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1)
    .filter(row => row[1] === employeeId || row[3] === employeeId)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = row[i];
        if (val instanceof Date) {
          obj[h] = val.toISOString();
        } else {
          obj[h] = val || '';
        }
      });
      
      return {
        id: obj['ID'] || '',
        fromId: obj['От кого (ID)'] || '',
        fromName: obj['От кого (ФИО)'] || '',
        toId: obj['Кому (ID)'] || '',
        toName: obj['Кому (ФИО)'] || '',
        role: obj['Роль'] || '',
        text: obj['Текст'] || '',
        date: obj['Дата и время'] || '',
        read: obj['Прочитано'] === 'ДА',
        priority: obj['Приоритет'] || 'Обычное'
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
```

### 4. Обновите функцию `doGet`

Добавьте новые case в функцию `doGet`:

```javascript
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch(action) {
      // ... существующие case ...
      
      case 'authenticateEmployee':
        const personalNumber = e.parameter.personalNumber;
        const password = e.parameter.password;
        return jsonResponse(authenticateEmployee(personalNumber, password));
        
      case 'getEmployeeExpenseSheets':
        const employeeId = e.parameter.employeeId;
        return jsonResponse(getEmployeeExpenseSheets(employeeId));
        
      case 'getEmployeeMessages':
        const empId = e.parameter.employeeId;
        return jsonResponse(getEmployeeMessages(empId));
        
      // ... остальные case ...
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}
```

## 🚀 Как применить изменения

1. Откройте Google Sheets с базой данных
2. Перейдите в **Расширения → Apps Script**
3. Добавьте новые функции в конец файла
4. Обновите функцию `doGet`
5. Сохраните (Ctrl+S)
6. **Развернуть → Управление развертываниями**
7. Выберите ваше развертывание
8. Нажмите **Редактировать** (иконка карандаша)
9. Выберите **Новая версия**
10. Нажмите **Развернуть**

## ✅ Проверка

После обновления вы можете проверить новые функции:

```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=authenticateEmployee&personalNumber=001&password=123
```

Должен вернуться JSON с данными сотрудника или ошибкой.

## 🔐 Безопасность

⚠️ **Важно:** В текущей реализации пароли хранятся в открытом виде. Для продакшена рекомендуется:
- Хэшировать пароли перед сохранением
- Использовать токены для авторизации
- Добавить HTTPS только для API запросов

## 📱 Следующие шаги

После адаптации Apps Script:
1. Скопируйте папку `mobile/` в новый репозиторий
2. Установите зависимости: `npm install`
3. Запустите: `npm start`
4. Отсканируйте QR-код в Expo Go
5. Введите URL вашего Apps Script
6. Авторизуйтесь с персональным номером и паролем

Готово! 🎉
