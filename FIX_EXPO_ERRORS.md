# Инструкция по исправлению ошибок Expo

## Проблема 1: Несовместимость версий SDK
Ваш Expo Go использует SDK 57, а проект на SDK 52.

## Проблема 2: Отсутствуют файлы иконок
Нужны файлы: icon.png, adaptive-icon.png, splash.png, favicon.png

---

## Решение:

### Шаг 1: Обновите package.json

Откройте файл `MOBILE_PACKAGE_JSON.txt` в текущем проекте, скопируйте его содержимое и замените содержимое файла `package.json` в вашем репозитории `employee-mobile_v_0.1`.

**Или выполните в терминале (Windows):**
```bash
cd C:\Users\Evgeniy\Desktop\employee-mobile_v_0.1
copy /Y ..\MOBILE_PACKAGE_JSON.txt package.json
```

### Шаг 2: Обновите app.json

Откройте файл `MOBILE_APP_JSON.txt` в текущем проекте, скопируйте его содержимое и замените содержимое файла `app.json` в вашем репозитории.

**Или выполните в терминале (Windows):**
```bash
copy /Y ..\MOBILE_APP_JSON.txt app.json
```

### Шаг 3: Создайте папку assets и иконки

```bash
cd C:\Users\Evgeniy\Desktop\employee-mobile_v_0.1
mkdir assets
```

#### Вариант A: Используйте любой PNG файл

Если у вас есть любой PNG файл (например, logo.png), скопируйте его в папку assets и переименуйте:

```bash
copy C:\путь\к\вашему\logo.png assets\icon.png
copy C:\путь\к\вашему\logo.png assets\adaptive-icon.png
copy C:\путь\к\вашему\logo.png assets\splash.png
copy C:\путь\к\вашему\logo.png assets\favicon.png
```

#### Вариант B: Создайте простые иконки онлайн

1. Перейдите на https://www.favicon-generator.org/
2. Загрузите любой PNG файл (или используйте logo.png из веб-проекта)
3. Скачайте набор иконок
4. Скопируйте файлы в папку `assets/`:
   - icon.png (1024x1024)
   - adaptive-icon.png (1024x1024)
   - splash.png (1284x2778)
   - favicon.png (48x48)

#### Вариант C: Используйте временные заглушки

Создайте простые текстовые файлы (это временное решение):

```bash
echo "placeholder" > assets\icon.png
echo "placeholder" > assets\adaptive-icon.png
echo "placeholder" > assets\splash.png
echo "placeholder" > assets\favicon.png
```

**Внимание:** Вариант C может вызвать ошибки при сборке, но позволит запустить приложение в режиме разработки.

### Шаг 4: Переустановите зависимости

```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Шаг 5: Запустите приложение

```bash
npm start
```

### Шаг 6: Отсканируйте QR-код

Откройте Expo Go на телефоне и отсканируйте QR-код.

---

## Если возникнут ошибки:

### Ошибка: "Unable to resolve asset"
Убедитесь, что все файлы иконок существуют в папке `assets/`

### Ошибка: "Project is incompatible with this version of Expo Go"
Проверьте, что в `package.json` указана версия `"expo": "~57.0.0"`

### Ошибка: "Cannot find module"
Удалите `node_modules` и `package-lock.json`, затем выполните `npm install` заново

---

## Готово!

После выполнения всех шагов приложение должно запуститься без ошибок.

Если возникнут проблемы — напишите текст ошибки, и я помогу разобраться!
