@echo off
chcp 65001 >nul
:: translation-manager.bat - Менеджер перекладів для Windows

title Менеджер перекладів

echo ===============================================
echo 🌍 МЕНЕДЖЕР ПЕРЕКЛАДІВ
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
if not exist "create-translations.js" (
    echo ❌ Файл create-translations.js не знайдено!
    echo 💡 Створіть файл та скопіюйте код з артефакту
    echo.
    pause
    exit /b 1
)

:: Головне меню
:menu
cls
echo ===============================================
echo 🌍 МЕНЕДЖЕР ПЕРЕКЛАДІВ
echo ===============================================
echo.
echo Оберіть дію:
echo.
echo 1. 📁 Створити базові файли перекладів
echo 2. 🔍 Перевірити синхронізацію перекладів  
echo 3. ➕ Додати новий переклад
echo 4. 📊 Показати структуру файлів
echo 5. 🧹 Очистити порожні файли
echo 6. ❓ Довідка
echo 7. 🚪 Вихід
echo.
set /p choice="Введіть номер (1-7): "

if "%choice%"=="1" goto :create_translations
if "%choice%"=="2" goto :validate_translations
if "%choice%"=="3" goto :add_translation
if "%choice%"=="4" goto :show_structure
if "%choice%"=="5" goto :cleanup_files
if "%choice%"=="6" goto :show_help
if "%choice%"=="7" goto :exit
goto :invalid_choice

:create_translations
echo.
echo 📁 Створення базових файлів перекладів...
echo.
node create-translations.js create
echo.
echo ✅ Готово! Перевірте директорію frontend/public/locales/
pause
goto :menu

:validate_translations
echo.
echo 🔍 Перевірка синхронізації перекладів...
echo.
node create-translations.js validate
echo.
pause
goto :menu

:add_translation
echo.
echo ➕ Додавання нового перекладу
echo.
set /p namespace="Введіть namespace (common, auth, forms, etc.): "
set /p keypath="Введіть ключ (наприклад, button.submit): "
set /p uk_text="Введіть український текст: "
set /p en_text="Введіть англійський текст (або Enter для пропуску): "

if "%en_text%"=="" set en_text=%uk_text%

echo.
echo 🔄 Додавання перекладу...
node create-translations.js add "%namespace%" "%keypath%" "%uk_text%" "%en_text%"
echo.
pause
goto :menu

:show_structure
echo.
echo 📊 Структура файлів перекладів:
echo.

if exist "frontend\public\locales" (
    echo frontend\public\locales\
    for /d %%d in (frontend\public\locales\*) do (
        echo ├── %%~nd\
        for %%f in (%%d\*.json) do (
            echo │   ├── %%~nf.json
        )
    )
) else (
    echo ❌ Директорія frontend\public\locales не існує
    echo 💡 Спочатку створіть базові файли (опція 1)
)

echo.
pause
goto :menu

:cleanup_files
echo.
echo 🧹 Очищення порожніх файлів...
echo.

set "cleaned=0"

for /r "frontend\public\locales" %%f in (*.json) do (
    if exist "%%f" (
        for %%s in ("%%f") do (
            if %%~zs lss 10 (
                echo    🗑️  Видалено порожній файл: %%f
                del "%%f" 2>nul
                set /a cleaned+=1
            )
        )
    )
)

echo.
if %cleaned%==0 (
    echo ✅ Порожніх файлів не знайдено
) else (
    echo ✅ Очищено %cleaned% файлів
)

echo.
pause
goto :menu

:show_help
echo.
echo ❓ ДОВІДКА
echo.
echo 📋 Структура перекладів:
echo.
echo frontend/public/locales/
echo ├── uk/                    ^(українська^)
echo │   ├── common.json       ^(загальні^)
echo │   ├── navigation.json   ^(навігація^)
echo │   ├── auth.json         ^(автентифікація^)
echo │   ├── forms.json        ^(форми^)
echo │   ├── errors.json       ^(помилки^)
echo │   └── pages.json        ^(сторінки^)
echo └── en/                    ^(англійська^)
echo     └── ...
echo.
echo 🔧 Використання в коді:
echo.
echo // Хук
echo const { t } = useTranslations()
echo const text = t('common.general.save', 'Зберегти')
echo.
echo // Компонент  
echo ^<T k="auth.login.title" fallback="Увійти" /^>
echo.
echo 📖 Ключі мають ієрархічну структуру:
echo namespace.category.item
echo.
echo Приклади:
echo - common.general.save
echo - auth.login.title
echo - forms.validation.required
echo - navigation.menu.home
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
echo 👋 Дякуємо за використання менеджера перекладів!
echo.
exit /b 0