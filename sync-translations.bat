@echo off
chcp 65001 >nul
:: sync-translations.bat - Синхронізація перекладів для Windows

title Синхронізація перекладів

echo ===============================================
echo 🔄 СИНХРОНІЗАЦІЯ ПЕРЕКЛАДІВ
echo ===============================================
echo.

:: Перевіряємо Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не знайдено!
    echo 💡 Встановіть Node.js з https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Перевіряємо наявність скрипта
if not exist "sync-translations.js" (
    echo ❌ Файл sync-translations.js не знайдено!
    echo 💡 Створіть файл та скопіюйте код з артефакту
    echo.
    pause
    exit /b 1
)

:: Перевіряємо структуру проекту
if not exist "frontend\public\locales" (
    echo ❌ Директорія frontend\public\locales не знайдена!
    echo 💡 Спочатку створіть базові переклади
    echo.
    pause
    exit /b 1
)

:: Головне меню
:menu
cls
echo ===============================================
echo 🔄 СИНХРОНІЗАЦІЯ ПЕРЕКЛАДІВ
echo ===============================================
echo.
echo Оберіть дію:
echo.
echo 1. 🔄 Синхронізувати всі переклади
echo 2. 🔍 Перевірити структуру перекладів
echo 3. 🧹 Очистити дублікати
echo 4. ⚙️  Показати конфігурацію
echo 5. 📊 Показати статистику
echo 6. 💾 Створити backup
echo 7. 🔧 Налаштування
echo 8. ❓ Довідка
echo 9. 🚪 Вихід
echo.
set /p choice="Введіть номер (1-9): "

if "%choice%"=="1" goto :sync_all
if "%choice%"=="2" goto :validate_structure
if "%choice%"=="3" goto :clean_duplicates
if "%choice%"=="4" goto :show_config
if "%choice%"=="5" goto :show_statistics
if "%choice%"=="6" goto :create_backup
if "%choice%"=="7" goto :settings
if "%choice%"=="8" goto :show_help
if "%choice%"=="9" goto :exit
goto :invalid_choice

:sync_all
echo.
echo 🔄 Синхронізація всіх перекладів...
echo.
echo ⏳ Це може зайняти деякий час...
echo.

node sync-translations.js sync

if %errorlevel%==0 (
    echo.
    echo ✅ Синхронізація завершена успішно!
    echo 💡 Перевірте результати у файлах перекладів
) else (
    echo.
    echo ❌ Помилка під час синхронізації!
    echo 💡 Перевірте логи вище для деталей
)

echo.
pause
goto :menu

:validate_structure
echo.
echo 🔍 Перевірка структури перекладів...
echo.

node sync-translations.js validate

echo.
pause
goto :menu

:clean_duplicates
echo.
echo 🧹 Очищення дублікатів...
echo.

node sync-translations.js clean

echo.
pause
goto :menu

:show_config
echo.
echo ⚙️  Поточна конфігурація:
echo.

node sync-translations.js config

echo.
pause
goto :menu

:show_statistics
echo.
echo 📊 Статистика перекладів:
echo.

if exist "frontend\public\locales" (
    echo 📁 Структура директорій:
    echo.
    for /d %%d in (frontend\public\locales\*) do (
        echo    🌐 %%~nd:
        for %%f in (%%d\*.json) do (
            for %%s in ("%%f") do (
                set /a sizeKB=%%~zs/1024
                echo       📄 %%~nf.json (%%~zs bytes)
            )
        )
        echo.
    )
    
    echo 📊 Підрахунок файлів:
    set /a totalFiles=0
    for /r "frontend\public\locales" %%f in (*.json) do (
        set /a totalFiles+=1
    )
    echo    Всього файлів: !totalFiles!
    
) else (
    echo ❌ Директорія перекладів не знайдена
)

echo.
pause
goto :menu

:create_backup
echo.
echo 💾 Створення backup перекладів...
echo.

if exist "frontend\public\locales" (
    set "timestamp=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
    set "timestamp=!timestamp: =0!"
    set "backupDir=translation-backups\!timestamp!"
    
    mkdir "!backupDir!" 2>nul
    xcopy "frontend\public\locales" "!backupDir!" /E /I /H /Y >nul
    
    echo ✅ Backup створено: !backupDir!
    echo 💡 Розмір backup:
    for /f %%s in ('dir "!backupDir!" /s /-c ^| find "bytes"') do echo    %%s
) else (
    echo ❌ Директорія перекладів не знайдена
)

echo.
pause
goto :menu

:settings
echo.
echo 🔧 НАЛАШТУВАННЯ
echo.
echo Оберіть налаштування для зміни:
echo.
echo 1. Базова мова (зараз: uk)
echo 2. Цільові мови (зараз: en, ru)
echo 3. Автопереклад (зараз: вимкнено)
echo 4. Створення backup (зараз: увімкнено)
echo 5. Сортування ключів (зараз: увімкнено)
echo 6. Повернутися до головного меню
echo.
set /p setting="Введіть номер (1-6): "

if "%setting%"=="1" goto :change_base_locale
if "%setting%"=="2" goto :change_target_locales
if "%setting%"=="3" goto :toggle_auto_translate
if "%setting%"=="4" goto :toggle_backup
if "%setting%"=="5" goto :toggle_sort_keys
if "%setting%"=="6" goto :menu
goto :settings

:change_base_locale
echo.
echo 🌐 Зміна базової мови
echo.
echo Поточна базова мова: uk
echo.
echo Доступні мови: uk, en, ru, pl, de, fr, es, it
set /p new_locale="Введіть код нової базової мови: "

echo.
echo ⚠️  Зміна базової мови вимагає ручного редагування файлу конфігурації
echo 💡 Відредагуйте файл translation-sync.config.js
echo 💡 Змініть baseLocale: '%new_locale%'

pause
goto :settings

:change_target_locales
echo.
echo 🎯 Зміна цільових мов
echo.
echo Поточні цільові мови: en, ru
echo.
echo Доступні мови: uk, en, ru, pl, de, fr, es, it
echo.
echo ⚠️  Зміна цільових мов вимагає ручного редагування файлу конфігурації
echo 💡 Відредагуйте файл translation-sync.config.js
echo 💡 Змініть targetLocales: ['en', 'ru', 'ваша_мова']

pause
goto :settings

:toggle_auto_translate
echo.
echo 🤖 Автопереклад
echo.
echo Поточний стан: ВИМКНЕНО
echo.
echo ⚠️  Автопереклад вимагає API ключ від Google Translate або DeepL
echo ⚠️  Налаштування в файлі translation-sync.config.js
echo.
echo 💡 Кроки для увімкнення:
echo 1. Отримайте API ключ від провайдера перекладів
echo 2. Додайте ключ в .env файл
echo 3. Змініть autoTranslate.enabled: true в конфігурації

pause
goto :settings

:toggle_backup
echo.
echo 💾 Автоматичний backup
echo.
echo Поточний стан: УВІМКНЕНО
echo.
echo Автоматичний backup створює копію перед кожною синхронізацією
echo Це рекомендується для безпеки даних
echo.
echo 💡 Для зміни відредагуйте options.createBackup в конфігурації

pause
goto :settings

:toggle_sort_keys
echo.
echo 🔤 Сортування ключів
echo.
echo Поточний стан: УВІМКНЕНО
echo.
echo Сортування ключів полегшує читання та знаходження перекладів
echo Рекомендується залишити увімкненим
echo.
echo 💡 Для зміни відредагуйте options.sortKeys в конфігурації

pause
goto :settings

:show_help
echo.
echo ❓ ДОВІДКА
echo.
echo 🔄 СИНХРОНІЗАЦІЯ ПЕРЕКЛАДІВ
echo.
echo Цей інструмент допомагає синхронізувати переклади між мовами.
echo.
echo 📋 Основні функції:
echo    • Автоматичне додавання відсутніх ключів
echo    • Створення backup перед змінами
echo    • Валідація структури перекладів
echo    • Очищення дублікатів
echo    • Сортування ключів
echo.
echo 🌐 Підтримувані мови:
echo    • uk (українська) - базова мова
echo    • en (англійська)
echo    • ru (російська)
echo    • pl (польська)
echo    • de (німецька)
echo    • fr (французька)
echo    • es (іспанська)
echo    • it (італійська)
echo.
echo 📁 Структура файлів:
echo    frontend/public/locales/
echo    ├── uk/
echo    │   ├── common.json
echo    │   ├── navigation.json
echo    │   └── ...
echo    └── en/
echo        ├── common.json
echo        └── ...
echo.
echo 🔧 Конфігурація:
echo    Основні налаштування в файлі translation-sync.config.js
echo.
echo ⚠️  ВАЖЛИВО:
echo    • Завжди створюйте backup перед синхронізацією
echo    • Перевіряйте результат після синхронізації
echo    • Базова мова (uk) - еталон для інших мов
echo.
echo 💡 ПОРАДИ:
echo    • Використовуйте ієрархічні ключі (namespace.category.item)
echo    • Не використовуйте спеціальні символи в ключах
echo    • Регулярно перевіряйте структуру перекладів
echo    • Ведіть версіонування змін через Git
echo.

pause
goto :menu

:invalid_choice
echo.
echo ❌ Невірний вибір! Спробуйте ще раз.
echo.
pause
goto :menu

:exit
echo.
echo 👋 Дякуємо за використання синхронізатора перекладів!
echo.
echo 💡 Не забудьте:
echo    • Перевірити результати синхронізації
echo    • Зробити commit змін в Git
echo    • Протестувати переклади в додатку
echo.
exit /b 0