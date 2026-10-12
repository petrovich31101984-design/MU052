/**
 * Google Apps Script для системы учёта сотрудников
 * Версия 3.0.0 с поддержкой мобильного приложения
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Откройте Google Sheets
 * 2. Расширения → Apps Script
 * 3. Удалите весь старый код
 * 4. Вставьте этот код
 * 5. Сохраните (Ctrl+S)
 * 6. Разверните → Управление развертываниями
 * 7. Нажмите карандаш (редактировать)
 * 8. Версия: Новая версия
 * 9. Разверните
 */

// ==================== ОБРАБОТКА ЗАПРОСОВ ====================

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch(action) {
      case 'test':
        return jsonResponse({ 
          success: true, 
          title: SpreadsheetApp.getActiveSpreadsheet().getName(),
          sheets: SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName())
        });
      case 'getEmployees':
        return jsonResponse(getEmployeesData());
      case 'getNomenclature':
        return jsonResponse(getNomenclatureData());
      case 'getPrices':
        return jsonResponse(getPricesData());
      case 'getPriceHistory':
        return jsonResponse(getPricesData());
      case 'getArrivals':
        return jsonResponse(getArrivalsData());
      case 'getExpenses':
        return jsonResponse(getExpensesData());
      case 'getExpenseSheets':
        return jsonResponse(getExpenseSheetsData());
      case 'getReturns':
        return jsonResponse(getReturnsData());
      case 'getChat':
        return jsonResponse(getChatData());
      case 'getAuditLog':
        return jsonResponse(getAuditLogData());
      case 'getAnnouncements':
        return jsonResponse(getAnnouncementsData());
      
      // НОВЫЕ ФУНКЦИИ ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ
      case 'authenticateEmployee':
        return jsonResponse(authenticateEmployee(e.parameter.personalNumber, e.parameter.password));
      case 'getEmployeeExpenseSheets':
        return jsonResponse(getEmployeeExpenseSheets(e.parameter.employeeId));
      case 'getEmployeeMessages':
        return jsonResponse(getEmployeeMessages(e.parameter.employeeId));
      
      default:
        return jsonResponse({ error: 'Неизвестное действие GET: ' + action });
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

function doPost(e) {
  try {
    Logger.log('doPost получен: ' + e.postData.contents);
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    Logger.log('Действие: ' + action);
    
    switch(action) {
      case 'addEmployee':
        addEmployeeRow(data.data);
        return jsonResponse({ success: true });
      case 'updateEmployee':
        updateEmployeeRow(data.data.id, data.data.data);
        return jsonResponse({ success: true });
      case 'updateEmployeeShift':
        updateEmployeeShiftRow(data.data.id, data.data.shiftOpen);
        return jsonResponse({ success: true });
      case 'deleteEmployee':
        deleteEmployeeRow(data.data.id);
        return jsonResponse({ success: true });
      case 'addArrival':
        addArrivalRow(data.data);
        return jsonResponse({ success: true });
      case 'updateArrival':
        updateArrivalRow(data.data.id, data.data.data);
        return jsonResponse({ success: true });
      case 'deleteArrival':
        deleteArrivalRow(data.data.id);
        return jsonResponse({ success: true });
      case 'archiveArrival':
        archiveArrivalRow(data.data.id);
        return jsonResponse({ success: true });
      case 'restoreArrival':
        restoreArrivalRow(data.data.id);
        return jsonResponse({ success: true });
      case 'addExpense':
        addExpenseRow(data.data);
        return jsonResponse({ success: true });
      case 'addReturn':
        addReturnRow(data.data);
        return jsonResponse({ success: true });
      case 'addChatMessage':
        addChatMessageRow(data.data);
        return jsonResponse({ success: true });
      case 'addAuditLog':
        addAuditLogRow(data.data);
        return jsonResponse({ success: true });
      case 'clearAuditLog':
        clearAuditLog();
        return jsonResponse({ success: true });
      case 'updateNomenclature':
        updateNomenclatureRow(data.data);
        return jsonResponse({ success: true });
      case 'addNomenclature':
        addNomenclatureRow(data.data);
        return jsonResponse({ success: true });
      case 'deleteNomenclature':
        deleteNomenclatureRow(data.data.id);
        return jsonResponse({ success: true });
      case 'addExpenseSheet':
        addExpenseSheetRow(data.data);
        return jsonResponse({ success: true });
      case 'updateExpenseSheet':
        updateExpenseSheetRow(data.data.id, data.data.data);
        return jsonResponse({ success: true });
      case 'archiveExpenseSheet':
        archiveExpenseSheetRow(data.data.id);
        return jsonResponse({ success: true });
      case 'restoreExpenseSheet':
        restoreExpenseSheetRow(data.data.id);
        return jsonResponse({ success: true });
      case 'createAnnouncement':
        createAnnouncementRow(data.data);
        return jsonResponse({ success: true });
      case 'setupDatabase':
        setupDatabase();
        return jsonResponse({ success: true, message: 'База данных создана' });
      default:
        return jsonResponse({ error: 'Неизвестное действие: ' + action });
    }
  } catch (error) {
    Logger.log('Ошибка в doPost: ' + error.toString());
    return jsonResponse({ error: error.toString() });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== МОБИЛЬНОЕ ПРИЛОЖЕНИЕ ====================

function authenticateEmployee(personalNumber, password) {
  Logger.log('🔐 Авторизация сотрудника: ' + personalNumber);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  if (!sheet) {
    return { success: false, error: 'Лист "Сотрудники" не найден' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const empNumber = String(row[1] || '').trim();
    const empPassword = String(row[3] || '');
    
    if (empNumber === String(personalNumber).trim() && empPassword === password) {
      const empBlocked = row[8];
      const empStatus = row[4];
      
      if (empBlocked === 'ДА') {
        return { success: false, error: 'Аккаунт заблокирован' };
      }
      
      if (empStatus === 'Уволен') {
        return { success: false, error: 'Аккаунт уволен' };
      }
      
      Logger.log('✅ Сотрудник авторизован: ' + row[2]);
      
      return {
        success: true,
         {
          id: row[0],
          personalNumber: empNumber,
          fullName: row[2],
          password: empPassword,
          status: empStatus,
          position: row[5],
          hireDate: row[6] instanceof Date ? row[6].toISOString() : row[6],
          blocked: empBlocked === 'ДА',
          phone: row[9],
          lastActivity: row[12] instanceof Date ? row[12].toISOString() : row[12],
          note: row[13],
          shiftOpen: row[14] === 'ДА'
        }
      };
    }
  }
  
  Logger.log('❌ Неверный персональный номер или пароль');
  return { success: false, error: 'Неверный персональный номер или пароль' };
}

function getEmployeeExpenseSheets(employeeId) {
  Logger.log('📋 Получение листов расхода для сотрудника: ' + employeeId);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Листы расхода');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const result = data.slice(1)
    .filter(row => String(row[1]) === String(employeeId) && row[12] !== 'ДА')
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = row[i];
        if (h === 'Позиции (JSON)') {
          try { obj['items'] = JSON.parse(val || '[]'); } 
          catch (e) { obj['items'] = []; }
        } else if (val instanceof Date) {
          obj[h] = val.toISOString();
        } else {
          obj[h] = val || '';
        }
      });
      
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
  
  Logger.log('📋 Найдено листов расхода: ' + result.length);
  return result;
}

function getEmployeeMessages(employeeId) {
  Logger.log('💬 Получение сообщений для сотрудника: ' + employeeId);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Чат');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const result = data.slice(1)
    .filter(row => String(row[1]) === String(employeeId) || String(row[3]) === String(employeeId))
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
  
  Logger.log('💬 Найдено сообщений: ' + result.length);
  return result;
}

// ==================== ЧТЕНИЕ ДАННЫХ ====================

function readSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1).filter(row => row[0] !== '').map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      const val = row[i];
      if (h === 'Месяц') {
        if (val instanceof Date) {
          const year = val.getFullYear();
          const month = String(val.getMonth() + 1).padStart(2, '0');
          obj[h] = `${year}-${month}`;
        } else {
          obj[h] = val || '';
        }
      } else if (val instanceof Date) {
        obj[h] = val.toISOString();
      } else {
        obj[h] = val || '';
      }
    });
    return obj;
  });
}

function getEmployeesData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1).filter(row => row[0] !== '').map((row, rowIndex) => {
    const obj = {};
    headers.forEach((h, i) => {
      const val = row[i];
      if (h === 'Персональный номер') {
        const cell = sheet.getRange(rowIndex + 2, i + 1);
        const textValue = cell.getDisplayValue();
        obj[h] = textValue || '';
      } else if (h === 'Месяц') {
        if (val instanceof Date) {
          const year = val.getFullYear();
          const month = String(val.getMonth() + 1).padStart(2, '0');
          obj[h] = `${year}-${month}`;
        } else {
          obj[h] = val || '';
        }
      } else if (val instanceof Date) {
        obj[h] = val.toISOString();
      } else {
        obj[h] = val || '';
      }
    });
    return obj;
  });
}

function getNomenclatureData() { return readSheetData('Номенклатура'); }
function getPricesData() { return readSheetData('Цены'); }
function getArrivalsData() { 
  const data = readSheetData('Приход');
  return data.map(row => {
    const result = Object.assign({}, row);
    try {
      const itemsJson = row['Позиции (JSON)'] || '[]';
      result.items = JSON.parse(itemsJson);
    } catch (e) {
      result.items = [];
    }
    return result;
  });
}
function getExpensesData() { return readSheetData('Расход'); }
function getReturnsData() { return readSheetData('Возвраты'); }
function getExpenseSheetsData() { 
  const data = readSheetData('Листы расхода');
  return data.map(row => {
    const result = Object.assign({}, row);
    try {
      const itemsJson = row['Позиции (JSON)'] || '[]';
      result.items = JSON.parse(itemsJson);
    } catch (e) {
      result.items = [];
    }
    return result;
  });
}
function getChatData() { return readSheetData('Чат'); }
function getAuditLogData() { return readSheetData('Журнал изменений'); }
function getAnnouncementsData() { return readSheetData('Объявления'); }

// ==================== ЗАПИСЬ ДАННЫХ ====================

function addEmployeeRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  sheet.getRange('B2:B1000').setNumberFormat('@');
  
  sheet.appendRow([
    data.id || '',
    "'" + String(data.personalNumber || ''),
    data.fullName || '',
    data.password || data.passwordHash || '',
    data.status || 'Активен',
    data.position || '',
    data.hireDate || new Date(),
    data.fireDate || '',
    data.blocked ? 'ДА' : 'НЕТ',
    data.phone || '',
    data.email || '',
    new Date(),
    '',
    data.note || '',
    data.shiftOpen ? 'ДА' : 'НЕТ'
  ]);
  
  writeAudit('Сотрудники', data.id, 'Создание', '', 'Сотрудник: ' + data.fullName);
}

function updateEmployeeRow(id, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  const allData = sheet.getDataRange().getValues();
  
  sheet.getRange('B2:B1000').setNumberFormat('@');
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === id) {
      if (data.status !== undefined) sheet.getRange(i + 1, 5).setValue(data.status);
      if (data.blocked !== undefined) sheet.getRange(i + 1, 9).setValue(data.blocked ? 'ДА' : 'НЕТ');
      if (data.note !== undefined) sheet.getRange(i + 1, 14).setValue(data.note);
      if (data.personalNumber !== undefined) {
        const cell = sheet.getRange(i + 1, 2);
        cell.setNumberFormat('@');
        cell.setValue("'" + String(data.personalNumber));
      }
      if (data.fullName !== undefined) sheet.getRange(i + 1, 3).setValue(data.fullName);
      if (data.position !== undefined) sheet.getRange(i + 1, 6).setValue(data.position);
      if (data.phone !== undefined) sheet.getRange(i + 1, 10).setValue(data.phone);
      if (data.shiftOpen !== undefined) sheet.getRange(i + 1, 15).setValue(data.shiftOpen ? 'ДА' : 'НЕТ');
      break;
    }
  }
  
  writeAudit('Сотрудники', id, 'Изменение', '', JSON.stringify(data));
}

function updateEmployeeShiftRow(id, shiftOpen) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  const allData = sheet.getDataRange().getValues();
  
  sheet.getRange('B2:B1000').setNumberFormat('@');
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      sheet.getRange(i + 1, 15).setValue(shiftOpen ? 'ДА' : 'НЕТ');
      const newStatus = shiftOpen ? 'Активен' : 'Неактивен';
      sheet.getRange(i + 1, 5).setValue(newStatus);
      const personalNumber = String(allData[i][1] || '');
      const cell = sheet.getRange(i + 1, 2);
      cell.setNumberFormat('@');
      cell.setValue("'" + personalNumber);
      writeAudit('Сотрудники', id, 'Изменение смены', '', shiftOpen ? 'Смена открыта' : 'Смена закрыта');
      break;
    }
  }
}

function deleteEmployeeRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  if (!sheet) throw new Error('Лист "Сотрудники" не найден');
  
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      const employeeName = allData[i][2];
      sheet.deleteRow(i + 1);
      writeAudit('Сотрудники', id, 'Удаление', 'Сотрудник: ' + employeeName, '');
      return;
    }
  }
  
  throw new Error('Сотрудник с ID ' + id + ' не найден');
}

function addArrivalRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Приход');
  
  let dateValue = data.date || new Date();
  if (dateValue instanceof Date) dateValue = dateValue.toISOString();
  
  let monthValue = data.month || '';
  if (monthValue instanceof Date) {
    const year = monthValue.getFullYear();
    const month = String(monthValue.getMonth() + 1).padStart(2, '0');
    monthValue = `${year}-${month}`;
  }
  
  sheet.appendRow([
    data.id || '',
    data.employeeId || '',
    data.employeeName || '',
    dateValue,
    monthValue,
    data.amount || 0,
    data.shifts || 0,
    data.addedBy || 'Руководитель',
    data.type || 'Плановый',
    data.comment || '',
    JSON.stringify(data.items || []),
    new Date(),
    'НЕТ'
  ]);
  
  writeAudit('Приход', data.id, 'Создание', '', 'Приход: ' + data.amount + '₽');
  SpreadsheetApp.flush();
}

function updateArrivalRow(id, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Приход');
  if (!sheet) throw new Error('Лист "Приход" не найден');
  
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      if (data.employeeId !== undefined) sheet.getRange(i + 1, 2).setValue(data.employeeId);
      if (data.employeeName !== undefined) sheet.getRange(i + 1, 3).setValue(data.employeeName);
      if (data.date !== undefined) sheet.getRange(i + 1, 4).setValue(data.date);
      if (data.amount !== undefined) sheet.getRange(i + 1, 6).setValue(data.amount);
      if (data.items !== undefined) sheet.getRange(i + 1, 11).setValue(JSON.stringify(data.items));
      writeAudit('Приход', id, 'Изменение', '', JSON.stringify(data));
      SpreadsheetApp.flush();
      break;
    }
  }
}

function deleteArrivalRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Приход');
  if (!sheet) throw new Error('Лист "Приход" не найден');
  
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      const arrivalData = allData[i];
      sheet.deleteRow(i + 1);
      writeAudit('Приход', id, 'Удаление', 'Приход: ' + arrivalData[5] + '₽', '');
      SpreadsheetApp.flush();
      return;
    }
  }
  
  throw new Error('Приход с ID ' + id + ' не найден');
}

function archiveArrivalRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Приход');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      sheet.getRange(i + 1, 13).setValue('ДА');
      writeAudit('Приход', id, 'Архивирование', '', '');
      SpreadsheetApp.flush();
      break;
    }
  }
}

function restoreArrivalRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Приход');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      sheet.getRange(i + 1, 13).setValue('НЕТ');
      writeAudit('Приход', id, 'Восстановление из архива', '', '');
      SpreadsheetApp.flush();
      break;
    }
  }
}

function addExpenseRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Расход');
  sheet.appendRow([
    data.id || '',
    data.employeeId || '',
    data.employeeName || '',
    new Date(),
    data.callDate || '',
    data.month || '',
    data.nomenclatureId || '',
    data.nomenclatureName || '',
    data.quantity || 0,
    data.unit || '',
    data.patientName || '',
    data.patientBirthDate || '',
    data.callId || '',
    'ДА',
    data.localTime || new Date(),
    'НЕТ',
    data.note || ''
  ]);
  writeAudit('Расход', data.id, 'Создание', '', 'Расход: ' + data.quantity + ' ' + data.nomenclatureName);
}

function addReturnRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Возвраты');
  sheet.appendRow([
    data.id || '',
    data.employeeId || '',
    data.employeeName || '',
    new Date(),
    data.month || '',
    data.nomenclatureId || '',
    data.nomenclatureName || '',
    data.quantity || 0,
    data.unit || '',
    data.status || 'Новый',
    data.correctedBy || '',
    data.correctedQuantity || '',
    '',
    data.comment || '',
    data.reason || ''
  ]);
  writeAudit('Возвраты', data.id, 'Создание', '', 'Возврат: ' + data.quantity);
}

function addExpenseSheetRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Листы расхода');
  sheet.appendRow([
    data.id || '',
    data.employeeId || '',
    data.employeeName || '',
    data.patientName || '',
    data.patientBirthDate || '',
    data.date || new Date(),
    data.month || '',
    data.callCategory || '',
    data.therapyName || '',
    data.therapyCost || 0,
    JSON.stringify(data.items || []),
    data.totalAmount || 0,
    data.archived ? 'ДА' : 'НЕТ',
    new Date()
  ]);
  writeAudit('Листы расхода', data.id, 'Создание', '', 'Лист расхода: ' + data.patientName);
}

function updateExpenseSheetRow(id, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Листы расхода');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      if (data.patientName !== undefined) sheet.getRange(i + 1, 4).setValue(data.patientName);
      if (data.patientBirthDate !== undefined) sheet.getRange(i + 1, 5).setValue(data.patientBirthDate);
      if (data.date !== undefined) sheet.getRange(i + 1, 6).setValue(data.date);
      if (data.callCategory !== undefined) sheet.getRange(i + 1, 8).setValue(data.callCategory);
      if (data.therapyName !== undefined) sheet.getRange(i + 1, 9).setValue(data.therapyName);
      if (data.therapyCost !== undefined) sheet.getRange(i + 1, 10).setValue(data.therapyCost);
      if (data.items !== undefined) sheet.getRange(i + 1, 11).setValue(JSON.stringify(data.items));
      if (data.totalAmount !== undefined) sheet.getRange(i + 1, 12).setValue(data.totalAmount);
      writeAudit('Листы расхода', id, 'Изменение', '', JSON.stringify(data));
      break;
    }
  }
}

function archiveExpenseSheetRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Листы расхода');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      sheet.getRange(i + 1, 13).setValue('ДА');
      writeAudit('Листы расхода', id, 'Архивирование', '', '');
      break;
    }
  }
}

function restoreExpenseSheetRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Листы расхода');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      sheet.getRange(i + 1, 13).setValue('НЕТ');
      writeAudit('Листы расхода', id, 'Восстановление из архива', '', '');
      break;
    }
  }
}

function addChatMessageRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Чат');
  sheet.appendRow([
    data.id || '',
    data.fromId || '',
    data.fromName || '',
    data.toId || '',
    data.toName || '',
    data.role || 'Руководитель',
    data.text || '',
    new Date(),
    'НЕТ',
    data.type || 'Личное',
    data.priority || 'Обычное'
  ]);
}

function createAnnouncementRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Объявления');
  sheet.appendRow([
    data.id || '',
    data.title || '',
    data.text || '',
    data.recipients ? data.recipients.join(',') : '',
    data.createdBy || '',
    data.date || new Date(),
    data.active ? 'ДА' : 'НЕТ'
  ]);
  writeAudit('Объявления', data.id, 'Создание', '', 'Объявление: ' + data.title);
}

function addAuditLogRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Журнал изменений');
  sheet.appendRow([
    data.id || 'LOG-' + Utilities.getUuid().substring(0, 8),
    new Date(),
    data.userId || '',
    data.userName || '',
    data.role || '',
    data.sheet || '',
    data.recordId || '',
    data.action || '',
    data.field || '',
    data.oldValue || '',
    data.newValue || '',
    data.ip || '',
    data.device || ''
  ]);
}

function clearAuditLog() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Журнал изменений');
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

function addNomenclatureRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Номенклатура');
  sheet.appendRow([
    data.id || '',
    data.name || '',
    data.category || 'ЛС ПКУ',
    data.unit || 'Штуки',
    data.manufacturer || '',
    data.packageQuantity || 1,
    '',
    data.active !== false ? 'ДА' : 'НЕТ',
    new Date(),
    ''
  ]);
  
  const pricesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Цены');
  pricesSheet.appendRow([
    'PRC-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
    data.id,
    data.name || '',
    data.currentPrice || 0,
    new Date(),
    '',
    'Руководитель',
    new Date(),
    ''
  ]);
  
  writeAudit('Номенклатура', data.id, 'Создание', '', 'Номенклатура: ' + data.name);
}

function deleteNomenclatureRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Номенклатура');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(id)) {
      const nomenclatureName = allData[i][1];
      sheet.deleteRow(i + 1);
      writeAudit('Номенклатура', id, 'Удаление', 'Номенклатура: ' + nomenclatureName, '');
      break;
    }
  }
}

function updateNomenclatureRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Номенклатура');
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.id) {
      if (data.name !== undefined) sheet.getRange(i + 1, 2).setValue(data.name);
      if (data.category !== undefined) sheet.getRange(i + 1, 3).setValue(data.category);
      if (data.unit !== undefined) sheet.getRange(i + 1, 4).setValue(data.unit);
      if (data.manufacturer !== undefined) sheet.getRange(i + 1, 5).setValue(data.manufacturer);
      if (data.active !== undefined) sheet.getRange(i + 1, 7).setValue(data.active ? 'ДА' : 'НЕТ');
      break;
    }
  }
  
  if (data.currentPrice !== undefined) {
    const pricesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Цены');
    const pricesData = pricesSheet.getDataRange().getValues();
    
    for (let i = 1; i < pricesData.length; i++) {
      if (pricesData[i][1] === data.id && (!pricesData[i][5] || pricesData[i][5] === '')) {
        pricesSheet.getRange(i + 1, 6).setValue(new Date());
        break;
      }
    }
    
    const nomData = readSheetData('Номенклатура');
    const nom = nomData.find(n => n['ID'] === data.id);
    pricesSheet.appendRow([
      'PRC-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
      data.id,
      nom ? nom['Название'] : '',
      data.currentPrice,
      new Date(),
      '',
      data.changedBy || 'Руководитель',
      new Date(),
      data.comment || ''
    ]);
  }
  
  writeAudit('Номенклатура', data.id, 'Изменение', '', JSON.stringify(data));
}

// ==================== ЖУРНАЛ ====================

function writeAudit(sheetName, recordId, action, oldValue, newValue) {
  try {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Журнал изменений');
    logSheet.appendRow([
      'LOG-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
      new Date(),
      'MGR',
      'Руководитель',
      'Руководитель',
      sheetName,
      recordId,
      action,
      '',
      oldValue,
      newValue,
      '',
      ''
    ]);
  } catch(e) {
    Logger.log('Ошибка записи в журнал: ' + e.toString());
  }
}

// ==================== СОЗДАНИЕ БАЗЫ ДАННЫХ ====================

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Лист1');
  
  createSheet_Employees(ss);
  createSheet_Nomenclature(ss);
  createSheet_Prices(ss);
  createSheet_Arrival(ss);
  createSheet_Expenses(ss);
  createSheet_Returns(ss);
  createSheet_ExpenseSheets(ss);
  createSheet_InitialStock(ss);
  createSheet_Chat(ss);
  createSheet_AuditLog(ss);
  createSheet_Settings(ss);
  createSheet_Reports(ss);
  createSheet_Announcements(ss);
  
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  
  return 'База данных успешно создана!';
}

function formatHeader(sheet, columnsCount) {
  const headerRange = sheet.getRange(1, 1, 1, columnsCount);
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setWrap(true);
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);
}

function createSheet_Employees(ss) {
  let sheet = ss.getSheetByName('Сотрудники');
  if (!sheet) sheet = ss.insertSheet('Сотрудники');
  
  const headers = ['ID', 'Персональный номер', 'ФИО', 'Пароль (хэш)', 'Статус', 'Должность', 'Дата найма', 'Дата увольнения', 'Заблокирован', 'Телефон', 'Email', 'Дата регистрации', 'Последний вход', 'Примечание', 'Смена открыта'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(3, 250);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(10, 150);
  sheet.getRange('B2:B1000').setNumberFormat('@');
  
  const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['Активен', 'Неактивен', 'Отпуск', 'Уволен']).build();
  sheet.getRange('E2:E1000').setDataValidation(statusRule);
  
  const boolRule = SpreadsheetApp.newDataValidation().requireValueInList(['ДА', 'НЕТ']).build();
  sheet.getRange('I2:I1000').setDataValidation(boolRule);
  sheet.getRange('O2:O1000').setDataValidation(boolRule);
}

function createSheet_Nomenclature(ss) {
  let sheet = ss.getSheetByName('Номенклатура');
  if (!sheet) sheet = ss.insertSheet('Номенклатура');
  
  const headers = ['ID', 'Название', 'Категория', 'Ед. измерения', 'Производитель', 'Количество в упаковке', 'Штрих-код', 'Актуальна', 'Дата создания', 'Примечание'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(2, 300);
  
  const categoryRule = SpreadsheetApp.newDataValidation().requireValueInList(['ЛС ПКУ', 'ЛС', 'Оборудование', 'Расходный материал']).build();
  sheet.getRange('C2:C1000').setDataValidation(categoryRule);
  
  const unitRule = SpreadsheetApp.newDataValidation().requireValueInList(['Ампулы', 'Таблетки', 'Флаконы', 'Штуки', 'Упаковки']).build();
  sheet.getRange('D2:D1000').setDataValidation(unitRule);
}

function createSheet_Prices(ss) {
  let sheet = ss.getSheetByName('Цены');
  if (!sheet) sheet = ss.insertSheet('Цены');
  
  const headers = ['ID', 'Номенклатура_ID', 'Название', 'Цена за ед. (₽)', 'Дата начала', 'Дата окончания', 'Кем изменено', 'Дата изменения', 'Примечание'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(3, 300);
  sheet.getRange('D2:D10000').setNumberFormat('#,##0.00');
}

function createSheet_Arrival(ss) {
  let sheet = ss.getSheetByName('Приход');
  if (!sheet) sheet = ss.insertSheet('Приход');
  
  const headers = ['ID', 'Сотрудник_ID', 'ФИО сотрудника', 'Дата', 'Месяц', 'Сумма (₽)', 'Количество смен', 'Кем внесено', 'Тип', 'Комментарий', 'Позиции (JSON)', 'Дата внесения', 'Архив'];
  
  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  
  if (currentHeaders.length !== headers.length || 
      !headers.every((h, i) => currentHeaders[i] === h)) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(3, 250);
  sheet.setColumnWidth(11, 400);
  sheet.getRange('F2:F10000').setNumberFormat('#,##0.00');
  
  const archiveRule = SpreadsheetApp.newDataValidation().requireValueInList(['ДА', 'НЕТ']).build();
  sheet.getRange('M2:M10000').setDataValidation(archiveRule);
}

function createSheet_Expenses(ss) {
  let sheet = ss.getSheetByName('Расход');
  if (!sheet) sheet = ss.insertSheet('Расход');
  
  const headers = ['ID', 'Сотрудник_ID', 'ФИО сотрудника', 'Дата внесения', 'Дата вызова', 'Месяц', 'Номенклатура_ID', 'Название', 'Количество', 'Ед. изм.', 'Пациент ФИО', 'Пациент ДР', 'Вызов_ID', 'Синхр.', 'Локальное время', 'Отредакт.', 'Примечание'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(3, 250);
  sheet.setColumnWidth(8, 300);
  sheet.setColumnWidth(11, 250);
}

function createSheet_Returns(ss) {
  let sheet = ss.getSheetByName('Возвраты');
  if (!sheet) sheet = ss.insertSheet('Возвраты');
  
  const headers = ['ID', 'Сотрудник_ID', 'ФИО сотрудника', 'Дата создания', 'Месяц', 'Номенклатура_ID', 'Название', 'Количество', 'Ед. изм.', 'Статус', 'Кем скорр.', 'Скорр. кол-во', 'Дата обработки', 'Комментарий', 'Причина'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(3, 250);
  sheet.setColumnWidth(7, 300);
  
  const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['Новый', 'Принят', 'Отклонён', 'Скорректирован']).build();
  sheet.getRange('J2:J10000').setDataValidation(statusRule);
}

function createSheet_ExpenseSheets(ss) {
  let sheet = ss.getSheetByName('Листы расхода');
  if (!sheet) sheet = ss.insertSheet('Листы расхода');
  
  const headers = ['ID', 'Сотрудник_ID', 'Сотрудник', 'Пациент', 'Дата рождения пациента', 'Дата', 'Месяц', 'Категория выезда', 'Название терапии', 'Стоимость терапии', 'Позиции (JSON)', 'Итого по препаратам', 'Архив', 'Дата создания'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(4, 250);
  sheet.setColumnWidth(11, 400);
  sheet.getRange('J2:J10000').setNumberFormat('#,##0.00');
  sheet.getRange('L2:L10000').setNumberFormat('#,##0.00');
  
  const categoryRule = SpreadsheetApp.newDataValidation().requireValueInList(['Первичный', 'Повторный', 'Мед.отвод', 'Неустойка', 'Курс']).build();
  sheet.getRange('H2:H10000').setDataValidation(categoryRule);
}

function createSheet_InitialStock(ss) {
  let sheet = ss.getSheetByName('Начальные остатки');
  if (!sheet) sheet = ss.insertSheet('Начальные остатки');
  
  const headers = ['ID', 'Сотрудник_ID', 'ФИО', 'Номенклатура_ID', 'Название', 'Количество', 'Ед. изм.', 'Дата', 'Кем внесено', 'Период', 'Примечание'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
}

function createSheet_Chat(ss) {
  let sheet = ss.getSheetByName('Чат');
  if (!sheet) sheet = ss.insertSheet('Чат');
  
  const headers = ['ID', 'От кого (ID)', 'От кого (ФИО)', 'Кому (ID)', 'Кому (ФИО)', 'Роль', 'Текст', 'Дата и время', 'Прочитано', 'Тип', 'Приоритет'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(7, 400);
}

function createSheet_AuditLog(ss) {
  let sheet = ss.getSheetByName('Журнал изменений');
  if (!sheet) sheet = ss.insertSheet('Журнал изменений');
  
  const headers = ['ID', 'Дата и время', 'Пользователь ID', 'Пользователь ФИО', 'Роль', 'Лист', 'Запись_ID', 'Действие', 'Поле', 'Было', 'Стало', 'IP', 'Устройство'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(10, 200);
  sheet.setColumnWidth(11, 200);
}

function createSheet_Settings(ss) {
  let sheet = ss.getSheetByName('Настройки');
  if (!sheet) sheet = ss.insertSheet('Настройки');
  
  const headers = ['Параметр', 'Значение', 'Описание', 'Кем изменено', 'Дата'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  const settings = [
    ['Название подразделения', 'Выездное подразделение №1', '', 'SYSTEM', new Date()],
    ['Версия системы', '3.0.0', 'С поддержкой мобильного приложения', 'SYSTEM', new Date()],
  ];
  sheet.getRange(2, 1, settings.length, headers.length).setValues(settings);
}

function createSheet_Reports(ss) {
  let sheet = ss.getSheetByName('Отчёты');
  if (!sheet) sheet = ss.insertSheet('Отчёты');
  
  const headers = ['ID', 'Тип', 'Период', 'Дата', 'Сотрудник_ID', 'ФИО', 'Вызовы', 'Приход (₽)', 'Расход (₽)', 'Остаток (₽)', 'Общий остаток (₽)', 'Статус', 'Кем сформ.', 'Примечание'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
}

function createSheet_Announcements(ss) {
  let sheet = ss.getSheetByName('Объявления');
  if (!sheet) sheet = ss.insertSheet('Объявления');
  
  const headers = ['ID', 'Заголовок', 'Текст', 'Получатели', 'Кем создано', 'Дата', 'Активно'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 500);
}

function fixPersonalNumberFormat() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Сотрудники');
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  sheet.getRange('B2:B1000').setNumberFormat('@');
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const personalNumber = String(data[i][1] || '');
    if (personalNumber) {
      sheet.getRange(i + 1, 2).setValue("'" + personalNumber);
    }
  }
}
