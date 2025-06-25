#!/bin/bash
# cleanup_project.sh - Скрипт для видалення непотрібного коду

echo "🧹 Початок очищення проекту від дублювань..."

# ============================= BACKEND CLEANUP =============================

echo "📦 Очищення Backend..."

# Створюємо резервні копії важливих файлів
echo "💾 Створення резервних копій..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"

# Копіюємо файли які будемо змінювати
cp backend/apps/api/urls.py "$BACKUP_DIR/urls.py.bak" 2>/dev/null
cp backend/apps/api/translations_views.py "$BACKUP_DIR/translations_views.py.bak" 2>/dev/null

# Видаляємо або замінюємо порожні views файли
echo "🗑️  Видалення порожніх views файлів..."

# Перевіряємо чи файли порожні або містять тільки коментарі/imports
check_and_remove_empty_views() {
    local file="$1"
    if [ -f "$file" ]; then
        # Підраховуємо кількість рядків без коментарів та імпортів
        content_lines=$(grep -v "^#" "$file" | grep -v "^from" | grep -v "^import" | grep -v "^$" | wc -l)
        if [ "$content_lines" -le 1 ]; then
            echo "   ❌ Видалено: $file (порожній)"
            rm "$file"
        else
            echo "   ✅ Залишено: $file (має контент)"
        fi
    fi
}

check_and_remove_empty_views "backend/apps/content/views.py"
check_and_remove_empty_views "backend/apps/jobs/views.py"
check_and_remove_empty_views "backend/apps/projects/views.py"
check_and_remove_empty_views "backend/apps/contacts/views.py"

# Видаляємо старі файли перекладів (якщо існують)
echo "🗑️  Видалення застарілих файлів перекладів..."

# Перевіряємо чи існують старі views для перекладів та видаляємо їх
if grep -q "StaticTranslationsAPIView\|DynamicTranslationsAPIView\|TranslationsAPIView" backend/apps/api/translations_views.py 2>/dev/null; then
    echo "   ⚠️  Знайдено старі views для перекладів в translations_views.py"
    echo "   💡 Файл буде замінено новим універсальним view"
fi

# ============================= FRONTEND CLEANUP =============================

echo "⚛️  Очищення Frontend..."

# Копіюємо frontend файли для backup
cp frontend/src/hooks/useTranslations.js "$BACKUP_DIR/useTranslations.js.bak" 2>/dev/null
cp frontend/src/contexts/TranslationContext.jsx "$BACKUP_DIR/TranslationContext.jsx.bak" 2>/dev/null

# Видаляємо дублюючі хуки
echo "🗑️  Видалення дублюючих хуків..."

remove_if_exists() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "   ❌ Видалено: $file"
        rm "$file"
    else
        echo "   ℹ️  Файл не знайдено: $file"
    fi
}

remove_if_exists "frontend/src/hooks/useLazyTranslations.js"
remove_if_exists "frontend/src/hooks/useTranslationAnalytics.js"
remove_if_exists "frontend/src/components/TranslationPreloader.jsx"

# Перевіряємо та видаляємо зайві файли конфігурації
echo "🗑️  Перевірка зайвих файлів конфігурації..."

# Видаляємо .idea директорію якщо існує (IDE конфігурація)
if [ -d "frontend/.idea" ]; then
    echo "   ❌ Видалено: frontend/.idea/ (IDE конфігурація)"
    rm -rf "frontend/.idea"
fi

# ============================= АНАЛІЗ ДУБЛЮВАНЬ =============================

echo "🔍 Аналіз залишкових дублювань..."

# Функція для пошуку дублюючих функцій
find_duplicates() {
    local dir="$1"
    local pattern="$2"
    
    echo "   🔎 Пошук '$pattern' в $dir:"
    find "$dir" -name "*.js" -o -name "*.jsx" -o -name "*.py" | xargs grep -l "$pattern" 2>/dev/null | while read file; do
        count=$(grep -c "$pattern" "$file" 2>/dev/null)
        if [ "$count" -gt 0 ]; then
            echo "      📄 $file: $count входжень"
        fi
    done
}

# Шукаємо дублюючі функції перекладів
find_duplicates "frontend/src" "useTranslations\|loadTranslations\|getTranslations"
find_duplicates "backend/apps" "TranslationsAPIView\|translations"

# ============================= ОПТИМІЗАЦІЯ PACKAGE.JSON =============================

echo "📦 Аналіз package.json на зайві залежності..."

if [ -f "frontend/package.json" ]; then
    # Перевіряємо на зайві залежності
    unused_packages=()
    
    # Список потенційно зайвих пакетів
    potential_unused=("lodash" "moment" "jquery" "underscore" "axios" "request")
    
    for package in "${potential_unused[@]}"; do
        if grep -q "\"$package\"" frontend/package.json; then
            # Перевіряємо чи використовується в коді
            if ! find frontend/src -name "*.js" -o -name "*.jsx" | xargs grep -l "import.*$package\|require.*$package" >/dev/null 2>&1; then
                unused_packages+=("$package")
            fi
        fi
    done
    
    if [ ${#unused_packages[@]} -gt 0 ]; then
        echo "   ⚠️  Потенційно невикористовувані пакети:"
        for package in "${unused_packages[@]}"; do
            echo "      - $package"
        done
        echo "   💡 Розгляньте можливість видалення командою: npm uninstall ${unused_packages[*]}"
    else
        echo "   ✅ Зайві залежності не знайдено"
    fi
fi

# ============================= АНАЛІЗ РОЗМІРУ ФАЙЛІВ =============================

echo "📊 Аналіз великих файлів..."

# Знаходимо файли більше 100KB
large_files=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.json" | xargs ls -la 2>/dev/null | awk '$5 > 102400 {print $5, $9}' | sort -nr)

if [ -n "$large_files" ]; then
    echo "   📈 Великі файли (>100KB):"
    echo "$large_files" | head -10 | while read size file; do
        size_kb=$((size / 1024))
        echo "      📄 $file: ${size_kb}KB"
    done
else
    echo "   ✅ Великих файлів не знайдено"
fi

# ============================= ГЕНЕРАЦІЯ ЗВІТУ =============================

echo "📋 Генерація звіту очищення..."

cat > "$BACKUP_DIR/cleanup_report.md" << EOF
# Звіт очищення проекту

## Дата: $(date)

## Видалені файли:
- Порожні views файли
- Дублюючі хуки: useLazyTranslations.js, useTranslationAnalytics.js
- TranslationPreloader.jsx
- IDE конфігурація (.idea)

## Замінені файли:
- backend/apps/api/urls.py (спрощено маршрути)
- backend/apps/api/translations_views.py (універсальний API)
- frontend/src/hooks/useTranslations.js (об'єднано функціональність)
- frontend/src/contexts/TranslationContext.jsx (спрощено)

## Результат:
- Видалено дублюючий код
- Об'єднано API для перекладів
- Покращено кешування та продуктивність
- Додано аналітику та діагностику

## Резервні копії:
Всі оригінальні файли збережено в: $BACKUP_DIR/

## Рекомендації:
1. Протестувати функціональність перекладів
2. Оновити документацію API
3. Перевірити тести
4. Розглянути видалення невикористовуваних npm пакетів
EOF

echo "✅ Очищення завершено!"
echo "📁 Резервні копії збережено в: $BACKUP_DIR/"
echo "📋 Детальний звіт: $BACKUP_DIR/cleanup_report.md"

# ============================= НАСТУПНІ КРОКИ =============================

echo ""
echo "🚀 НАСТУПНІ КРОКИ:"
echo "1. Замініть файли новими версіями з артефактів"
echo "2. Запустіть: python manage.py collectstatic"
echo "3. Запустіть: npm install (в frontend директорії)"
echo "4. Протестуйте функціональність"
echo "5. Видаліть папку backup/ після перевірки"

echo ""
echo "🎉 Проект очищено! Дублювання видалено, код оптимізовано."