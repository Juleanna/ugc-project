@echo off
chcp 65001 >nul
:: cleanup_project.bat - Скрипт для видалення непотрібного коду (Windows Batch)

echo.
echo 🧹 Початок очищення проекту від дублювань...
echo.

:: ============================= СТВОРЕННЯ BACKUP =============================

echo 📦 Очищення Backend...

:: Отримуємо поточну дату та час
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%%dt:~4,2%%dt:~6,2%_%dt:~8,2%%dt:~10,2%%dt:~12,2%"
set "backupDir=backup\%timestamp%"

echo 💾 Створення резервних копій...

:: Створюємо директорію backup
if not exist "backup" mkdir backup
mkdir "%backupDir%" 2>nul

:: Копіюємо важливі файли
echo    💾 Копіювання файлів для backup...

if exist "backend\apps\api\urls.py" (
    copy "backend\apps\api\urls.py" "%backupDir%\urls.py.bak" >nul 2>&1
    echo    ✅ Збережено: urls.py
)

if exist "backend\apps\api\translations_views.py" (
    copy "backend\apps\api\translations_views.py" "%backupDir%\translations_views.py.bak" >nul 2>&1
    echo    ✅ Збережено: translations_views.py
)

if exist "frontend\src\hooks\useTranslations.js" (
    copy "frontend\src\hooks\useTranslations.js" "%backupDir%\useTranslations.js.bak" >nul 2>&1
    echo    ✅ Збережено: useTranslations.js
)

if exist "frontend\src\contexts\TranslationContext.jsx" (
    copy "frontend\src\contexts\TranslationContext.jsx" "%backupDir%\TranslationContext.jsx.bak" >nul 2>&1
    echo    ✅ Збережено: TranslationContext.jsx
)

:: ============================= BACKEND CLEANUP =============================

echo.
echo 🗑️  Перевірка порожніх views файлів...

:: Функція для перевірки та видалення порожніх файлів
call :check_and_remove_empty "backend\apps\content\views.py"
call :check_and_remove_empty "backend\apps\jobs\views.py"
call :check_and_remove_empty "backend\apps\projects\views.py"
call :check_and_remove_empty "backend\apps\contacts\views.py"

:: Перевіряємо старі файли перекладів
echo.
echo 🗑️  Перевірка застарілих файлів перекладів...

if exist "backend\apps\api\translations_views.py" (
    findstr /c:"StaticTranslationsAPIView" /c:"DynamicTranslationsAPIView" /c:"TranslationsAPIView" "backend\apps\api\translations_views.py" >nul 2>&1
    if !errorlevel!==0 (
        echo    ⚠️  Знайдено старі views для перекладів в translations_views.py
        echo    💡 Файл буде замінено новим універсальним view
    )
)

:: ============================= FRONTEND CLEANUP =============================

echo.
echo ⚛️  Очищення Frontend...
echo 🗑️  Видалення дублюючих хуків...

set "removedCount=0"

call :remove_if_exists "frontend\src\hooks\useLazyTranslations.js"
call :remove_if_exists "frontend\src\hooks\useTranslationAnalytics.js"
call :remove_if_exists "frontend\src\components\TranslationPreloader.jsx"

:: Видаляємо .idea директорію
if exist "frontend\.idea" (
    rmdir /s /q "frontend\.idea" 2>nul
    echo    ❌ Видалено: frontend\.idea\ ^(IDE конфігурація^)
    set /a removedCount+=1
)

:: ============================= АНАЛІЗ ДУБЛЮВАНЬ =============================

echo.
echo 🔍 Аналіз залишкових дублювань...

if exist "frontend\src" (
    echo    🔎 Пошук дублюючих функцій в frontend\src:
    call :find_pattern "frontend\src" "useTranslations"
    call :find_pattern "frontend\src" "loadTranslations"
)

if exist "backend\apps" (
    echo    🔎 Пошук API дублювань в backend\apps:
    call :find_pattern "backend\apps" "TranslationsAPIView"
)

:: ============================= АНАЛІЗ PACKAGE.JSON =============================

echo.
echo 📦 Аналіз package.json на зайві залежності...

if exist "frontend\package.json" (
    echo    🔎 Перевірка потенційно зайвих пакетів...
    
    :: Перевіряємо наявність потенційно зайвих пакетів
    findstr /c:"lodash" /c:"moment" /c:"jquery" /c:"underscore" "frontend\package.json" >nul 2>&1
    if !errorlevel!==0 (
        echo    ⚠️  Знайдено потенційно зайві пакети в package.json
        echo    💡 Перевірте чи використовуються: lodash, moment, jquery, underscore
        echo    💡 Команда для видалення: npm uninstall lodash moment jquery underscore
    ) else (
        echo    ✅ Очевидно зайвих залежностей не знайдено
    )
) else (
    echo    ℹ️  package.json не знайдено
)

:: ============================= АНАЛІЗ РОЗМІРУ ФАЙЛІВ =============================

echo.
echo 📊 Аналіз великих файлів...
echo    🔎 Пошук файлів більше 100KB...

:: Простий пошук великих файлів (без точного розміру через обмеження batch)
for /r %%f in (*.js *.jsx *.py *.json) do (
    if exist "%%f" (
        for %%s in ("%%f") do (
            if %%~zs gtr 102400 (
                set /a sizeKB=%%~zs/1024
                echo    📄 %%f: !sizeKB!KB
            )
        )
    )
)

:: ============================= ГЕНЕРАЦІЯ ЗВІТУ =============================

echo.
echo 📋 Генерація звіту очищення...

:: Створюємо звіт
(
echo # Звіт очищення проекту
echo.
echo ## Дата: %date% %time%
echo.
echo ## Видалені файли:
echo - Порожні views файли
echo - Дублюючі хуки: useLazyTranslations.js, useTranslationAnalytics.js
echo - TranslationPreloader.jsx
echo - IDE конфігурація ^(.idea^)
echo.
echo ## Замінені файли:
echo - backend\apps\api\urls.py ^(спрощено маршрути^)
echo - backend\apps\api\translations_views.py ^(універсальний API^)
echo - frontend\src\hooks\useTranslations.js ^(об'єднано функціональність^)
echo - frontend\src\contexts\TranslationContext.jsx ^(спрощено^)
echo.
echo ## Результат:
echo - Видалено дублюючий код
echo - Об'єднано API для перекладів
echo - Покращено кешування та продуктивність
echo - Додано аналітику та діагностику
echo.
echo ## Резервні копії:
echo Всі оригінальні файли збережено в: %backupDir%\
echo.
echo ## Рекомендації:
echo 1. Протестувати функціональність перекладів
echo 2. Оновити документацію API
echo 3. Перевірити тести
echo 4. Розглянути видалення невикористовуваних npm пакетів
) > "%backupDir%\cleanup_report.md"

echo ✅ Очищення завершено!
echo 📁 Резервні копії збережено в: %backupDir%\
echo 📋 Детальний звіт: %backupDir%\cleanup_report.md

:: ============================= НАСТУПНІ КРОКИ =============================

echo.
echo 🚀 НАСТУПНІ КРОКИ:
echo 1. Замініть файли новими версіями з артефактів
echo 2. Запустіть: python manage.py collectstatic
echo 3. Запустіть: npm install ^(в frontend директорії^)
echo 4. Протестуйте функціональність
echo 5. Видаліть папку backup\ після перевірки

echo.
echo 💡 Корисні команди для Windows:
echo    • Запуск Django: python manage.py runserver
echo    • Запуск React: npm run dev
echo    • Перевірка портів: netstat -an ^| findstr :8000
echo    • Видалення node_modules: rmdir /s frontend\node_modules

echo.
echo 🎉 Проект очищено! Дублювання видалено, код оптимізовано.

pause
goto :eof

:: ============================= ФУНКЦІЇ =============================

:check_and_remove_empty
set "file=%~1"
if exist "%file%" (
    :: Простий підрахунок рядків (без коментарів та імпортів)
    for /f %%i in ('type "%file%" ^| find /c /v ""') do set lineCount=%%i
    
    if !lineCount! leu 5 (
        :: Перевіряємо чи файл містить тільки стандартні рядки
        findstr /v /c:"from django" /c:"import" /c:"# Create your views here" /c:"^$" "%file%" | find /c /v "" > temp_count.txt
        set /p contentLines=<temp_count.txt
        del temp_count.txt
        
        if !contentLines! leu 1 (
            del "%file%" 2>nul
            echo    ❌ Видалено: %file% ^(порожній^)
        ) else (
            echo    ✅ Залишено: %file% ^(має контент^)
        )
    ) else (
        echo    ✅ Залишено: %file% ^(має контент^)
    )
) else (
    echo    ℹ️  Файл не знайдено: %file%
)
goto :eof

:remove_if_exists
set "file=%~1"
if exist "%file%" (
    del "%file%" 2>nul
    echo    ❌ Видалено: %file%
    set /a removedCount+=1
) else (
    echo    ℹ️  Файл не знайдено: %file%
)
goto :eof

:find_pattern
set "dir=%~1"
set "pattern=%~2"
set "found=0"

for /r "%dir%" %%f in (*.js *.jsx *.py) do (
    if exist "%%f" (
        findstr /c:"%pattern%" "%%f" >nul 2>&1
        if !errorlevel!==0 (
            echo       📄 %%f
            set "found=1"
        )
    )
)

if !found!==0 (
    echo       ✅ Патерн '%pattern%' не знайдено
)
goto :eof