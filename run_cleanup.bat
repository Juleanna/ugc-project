@echo off
:: run_cleanup.bat - Запускач скрипта очищення проекту

chcp 65001 >nul
title Очищення проекту від дублювань

echo ===============================================
echo 🧹 ОЧИЩЕННЯ ПРОЕКТУ ВІД ДУБЛЮВАНЬ
echo ===============================================
echo.

:: Перевіряємо чи ми в правильній директорії
if not exist "backend" (
    echo ❌ Помилка: Директорія 'backend' не знайдена
    echo 💡 Запустіть цей скрипт з кореневої директорії проекту
    echo.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Помилка: Директорія 'frontend' не знайдена
    echo 💡 Запустіть цей скрипт з кореневої директорії проекту
    echo.
    pause
    exit /b 1
)

echo ✅ Структура проекту знайдена
echo.

:: Перевіряємо наявність скриптів
set "powershellScript=cleanup_project.ps1"
set "batchScript=cleanup_project.bat"

echo 🔍 Перевірка наявності скриптів очищення...

if exist "%powershellScript%" (
    echo ✅ PowerShell скрипт знайдено: %powershellScript%
    set "hasPowerShell=1"
) else (
    echo ❌ PowerShell скрипт не знайдено: %powershellScript%
    set "hasPowerShell=0"
)

if exist "%batchScript%" (
    echo ✅ Batch скрипт знайдено: %batchScript%
    set "hasBatch=1"
) else (
    echo ❌ Batch скрипт не знайдено: %batchScript%
    set "hasBatch=0"
)

echo.

:: Якщо немає скриптів, показуємо інструкції
if %hasPowerShell%==0 if %hasBatch%==0 (
    echo ❌ Скрипти очищення не знайдено!
    echo.
    echo 💡 ІНСТРУКЦІЇ ДЛЯ СТВОРЕННЯ СКРИПТІВ:
    echo.
    echo 1. Створіть файл cleanup_project.ps1 та cleanup_project.bat
    echo 2. Скопіюйте код з артефактів Claude
    echo 3. Збережіть файли в кореневій директорії проекту
    echo 4. Запустіть цей скрипт знову
    echo.
    pause
    exit /b 1
)

:: Показуємо меню вибору
echo 🎯 ОБЕРІТЬ СПОСІБ ОЧИЩЕННЯ:
echo.
echo 1. PowerShell скрипт (рекомендовано - більше функцій)
echo 2. Batch скрипт (базова функціональність)
echo 3. Ручне очищення (показати інструкції)
echo 4. Вихід
echo.
set /p choice="Введіть номер (1-4): "

if "%choice%"=="1" goto :run_powershell
if "%choice%"=="2" goto :run_batch
if "%choice%"=="3" goto :manual_cleanup
if "%choice%"=="4" goto :exit
goto :invalid_choice

:run_powershell
if %hasPowerShell%==0 (
    echo ❌ PowerShell скрипт не знайдено!
    goto :menu
)

echo.
echo 🚀 Запуск PowerShell скрипта...
echo.

:: Перевіряємо політику виконання PowerShell
powershell -Command "Get-ExecutionPolicy" | findstr /i "restricted" >nul
if %errorlevel%==0 (
    echo ⚠️  PowerShell має обмежену політику виконання
    echo 💡 Спробуємо запустити з bypass...
    echo.
    powershell -ExecutionPolicy Bypass -File "%powershellScript%"
) else (
    powershell -File "%powershellScript%"
)

goto :end

:run_batch
if %hasBatch%==0 (
    echo ❌ Batch скрипт не знайдено!
    goto :menu
)

echo.
echo 🚀 Запуск Batch скрипта...
echo.
call "%batchScript%"
goto :end

:manual_cleanup
echo.
echo 📋 ІНСТРУКЦІЇ ДЛЯ РУЧНОГО ОЧИЩЕННЯ:
echo.
echo 🗑️  ФАЙЛИ ДО ВИДАЛЕННЯ:
echo    - frontend\src\hooks\useLazyTranslations.js
echo    - frontend\src\hooks\useTranslationAnalytics.js
echo    - frontend\src\components\TranslationPreloader.jsx
echo    - frontend\.idea\ (вся директорія)
echo.
echo 🔍 ФАЙЛИ ДО ПЕРЕВІРКИ (видалити якщо порожні):
echo    - backend\apps\content\views.py
echo    - backend\apps\jobs\views.py
echo    - backend\apps\projects\views.py
echo    - backend\apps\contacts\views.py
echo.
echo 🔄 ФАЙЛИ ДО ЗАМІНИ:
echo    - backend\apps\api\urls.py
echo    - backend\apps\api\translations_views.py
echo    - frontend\src\hooks\useTranslations.js
echo    - frontend\src\contexts\TranslationContext.jsx
echo.
echo 💾 РЕКОМЕНДАЦІЇ:
echo    1. Створіть backup перед змінами
echo    2. Скопіюйте нові файли з артефактів Claude
echo    3. Протестуйте функціональність
echo.
pause
goto :menu

:invalid_choice
echo ❌ Невірний вибір! Спробуйте ще раз.
echo.
goto :menu

:menu
echo.
echo Повернутися до меню? (y/n)
set /p return="Введіть y для повернення або n для виходу: "
if /i "%return%"=="y" goto :run_powershell
if /i "%return%"=="yes" goto :run_powershell
goto :exit

:end
echo.
echo ✅ Операція завершена!
echo.
echo 📋 НАСТУПНІ КРОКИ:
echo 1. Перевірте backup директорію
echo 2. Замініть файли новими версіями з артефактів
echo 3. Протестуйте функціональність
echo.

:exit
echo 👋 Дякуємо за використання скрипта очищення!
pause