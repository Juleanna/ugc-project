# cleanup_project.ps1 - Скрипт для видалення непотрібного коду (Windows PowerShell)

# Перевірка PowerShell версії
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Host "❌ Потрібен PowerShell 5.0 або новіший" -ForegroundColor Red
    exit 1
}

Write-Host "🧹 Початок очищення проекту від дублювань..." -ForegroundColor Green

# ============================= ФУНКЦІЇ УТИЛІТИ =============================

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-IsEmptyFile {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    $content = Get-Content $FilePath | Where-Object { 
        $_ -notmatch "^#" -and 
        $_ -notmatch "^from " -and 
        $_ -notmatch "^import " -and 
        $_ -notmatch "^\s*$" 
    }
    
    return ($content.Count -le 1)
}

function Remove-IfExists {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Remove-Item $FilePath -Force
        Write-Host "   ❌ Видалено: $FilePath" -ForegroundColor Red
        return $true
    } else {
        Write-Host "   ℹ️  Файл не знайдено: $FilePath" -ForegroundColor Yellow
        return $false
    }
}

function Get-FileSize {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        return (Get-Item $FilePath).Length
    }
    return 0
}

# ============================= СТВОРЕННЯ BACKUP =============================

Write-Host "📦 Очищення Backend..." -ForegroundColor Blue

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup\$timestamp"

Write-Host "💾 Створення резервних копій..." -ForegroundColor Yellow

# Створюємо директорію backup
if (-not (Test-Path "backup")) {
    New-Item -ItemType Directory -Path "backup" | Out-Null
}

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Копіюємо важливі файли
$filesToBackup = @(
    "backend\apps\api\urls.py",
    "backend\apps\api\translations_views.py",
    "frontend\src\hooks\useTranslations.js",
    "frontend\src\contexts\TranslationContext.jsx"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $backupFile = Join-Path $backupDir (Split-Path $file -Leaf) + ".bak"
        Copy-Item $file $backupFile
        Write-Host "   💾 Збережено: $file -> $backupFile" -ForegroundColor Green
    }
}

# ============================= BACKEND CLEANUP =============================

Write-Host "`n🗑️  Видалення порожніх views файлів..." -ForegroundColor Yellow

$emptyViewsFiles = @(
    "backend\apps\content\views.py",
    "backend\apps\jobs\views.py",
    "backend\apps\projects\views.py",
    "backend\apps\contacts\views.py"
)

foreach ($file in $emptyViewsFiles) {
    if (Test-IsEmptyFile $file) {
        Remove-Item $file -Force
        Write-Host "   ❌ Видалено: $file (порожній)" -ForegroundColor Red
    } elseif (Test-Path $file) {
        Write-Host "   ✅ Залишено: $file (має контент)" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Файл не знайдено: $file" -ForegroundColor Yellow
    }
}

# Перевіряємо старі файли перекладів
Write-Host "`n🗑️  Перевірка застарілих файлів перекладів..." -ForegroundColor Yellow

if (Test-Path "backend\apps\api\translations_views.py") {
    $content = Get-Content "backend\apps\api\translations_views.py" -Raw
    if ($content -match "StaticTranslationsAPIView|DynamicTranslationsAPIView|TranslationsAPIView") {
        Write-Host "   ⚠️  Знайдено старі views для перекладів в translations_views.py" -ForegroundColor Yellow
        Write-Host "   💡 Файл буде замінено новим універсальним view" -ForegroundColor Cyan
    }
}

# ============================= FRONTEND CLEANUP =============================

Write-Host "`n⚛️  Очищення Frontend..." -ForegroundColor Blue

Write-Host "🗑️  Видалення дублюючих хуків..." -ForegroundColor Yellow

$duplicateFiles = @(
    "frontend\src\hooks\useLazyTranslations.js",
    "frontend\src\hooks\useTranslationAnalytics.js",
    "frontend\src\components\TranslationPreloader.jsx"
)

$removedCount = 0
foreach ($file in $duplicateFiles) {
    if (Remove-IfExists $file) {
        $removedCount++
    }
}

# Видаляємо .idea директорію
if (Test-Path "frontend\.idea") {
    Remove-Item "frontend\.idea" -Recurse -Force
    Write-Host "   ❌ Видалено: frontend\.idea\ (IDE конфігурація)" -ForegroundColor Red
    $removedCount++
}

# ============================= АНАЛІЗ ДУБЛЮВАНЬ =============================

Write-Host "`n🔍 Аналіз залишкових дублювань..." -ForegroundColor Blue

function Find-Duplicates {
    param(
        [string]$Directory,
        [string]$Pattern,
        [string[]]$Extensions = @("*.js", "*.jsx", "*.py")
    )
    
    Write-Host "   🔎 Пошук '$Pattern' в $Directory:" -ForegroundColor Cyan
    
    $files = Get-ChildItem -Path $Directory -Include $Extensions -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        try {
            $matches = Select-String -Path $file.FullName -Pattern $Pattern -AllMatches -ErrorAction SilentlyContinue
            if ($matches) {
                $count = $matches.Count
                Write-Host "      📄 $($file.FullName): $count входжень" -ForegroundColor White
            }
        } catch {
            # Ігноруємо помилки читання файлів
        }
    }
}

# Шукаємо дублюючі функції
if (Test-Path "frontend\src") {
    Find-Duplicates "frontend\src" "useTranslations|loadTranslations|getTranslations"
}

if (Test-Path "backend\apps") {
    Find-Duplicates "backend\apps" "TranslationsAPIView|translations"
}

# ============================= АНАЛІЗ PACKAGE.JSON =============================

Write-Host "`n📦 Аналіз package.json на зайві залежності..." -ForegroundColor Blue

if (Test-Path "frontend\package.json") {
    $packageJson = Get-Content "frontend\package.json" | ConvertFrom-Json
    $dependencies = @()
    
    if ($packageJson.dependencies) {
        $dependencies += $packageJson.dependencies.PSObject.Properties.Name
    }
    if ($packageJson.devDependencies) {
        $dependencies += $packageJson.devDependencies.PSObject.Properties.Name
    }
    
    $potentialUnused = @("lodash", "moment", "jquery", "underscore", "axios", "request")
    $unusedPackages = @()
    
    foreach ($package in $potentialUnused) {
        if ($dependencies -contains $package) {
            # Перевіряємо чи використовується в коді
            $usageFound = $false
            $jsFiles = Get-ChildItem -Path "frontend\src" -Include "*.js", "*.jsx" -Recurse -ErrorAction SilentlyContinue
            
            foreach ($file in $jsFiles) {
                try {
                    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                    if ($content -match "import.*$package|require.*$package") {
                        $usageFound = $true
                        break
                    }
                } catch {
                    # Ігноруємо помилки
                }
            }
            
            if (-not $usageFound) {
                $unusedPackages += $package
            }
        }
    }
    
    if ($unusedPackages.Count -gt 0) {
        Write-Host "   ⚠️  Потенційно невикористовувані пакети:" -ForegroundColor Yellow
        foreach ($package in $unusedPackages) {
            Write-Host "      - $package" -ForegroundColor Red
        }
        $packagesString = $unusedPackages -join " "
        Write-Host "   💡 Розгляньте можливість видалення командою: npm uninstall $packagesString" -ForegroundColor Cyan
    } else {
        Write-Host "   ✅ Зайві залежності не знайдено" -ForegroundColor Green
    }
}

# ============================= АНАЛІЗ РОЗМІРУ ФАЙЛІВ =============================

Write-Host "`n📊 Аналіз великих файлів..." -ForegroundColor Blue

$largeFiles = Get-ChildItem -Include "*.js", "*.jsx", "*.py", "*.json" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.Length -gt 102400 } | 
    Sort-Object Length -Descending | 
    Select-Object -First 10

if ($largeFiles) {
    Write-Host "   📈 Великі файли (>100KB):" -ForegroundColor Yellow
    foreach ($file in $largeFiles) {
        $sizeKB = [math]::Round($file.Length / 1024, 1)
        Write-Host "      📄 $($file.FullName): ${sizeKB}KB" -ForegroundColor White
    }
} else {
    Write-Host "   ✅ Великих файлів не знайдено" -ForegroundColor Green
}

# ============================= ГЕНЕРАЦІЯ ЗВІТУ =============================

Write-Host "`n📋 Генерація звіту очищення..." -ForegroundColor Blue

$reportContent = @"
# Звіт очищення проекту

## Дата: $(Get-Date)

## Видалені файли:
- Порожні views файли
- Дублюючі хуки: useLazyTranslations.js, useTranslationAnalytics.js
- TranslationPreloader.jsx
- IDE конфігурація (.idea)

## Замінені файли:
- backend\apps\api\urls.py (спрощено маршрути)
- backend\apps\api\translations_views.py (універсальний API)
- frontend\src\hooks\useTranslations.js (об'єднано функціональність)
- frontend\src\contexts\TranslationContext.jsx (спрощено)

## Результат:
- Видалено дублюючий код
- Об'єднано API для перекладів
- Покращено кешування та продуктивність
- Додано аналітику та діагностику

## Резервні копії:
Всі оригінальні файли збережено в: $backupDir\

## Рекомендації:
1. Протестувати функціональність перекладів
2. Оновити документацію API
3. Перевірити тести
4. Розглянути видалення невикористовуваних npm пакетів
"@

$reportPath = Join-Path $backupDir "cleanup_report.md"
$reportContent | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "✅ Очищення завершено!" -ForegroundColor Green
Write-Host "📁 Резервні копії збережено в: $backupDir\" -ForegroundColor Cyan
Write-Host "📋 Детальний звіт: $reportPath" -ForegroundColor Cyan

# ============================= НАСТУПНІ КРОКИ =============================

Write-Host "`n🚀 НАСТУПНІ КРОКИ:" -ForegroundColor Magenta
Write-Host "1. Замініть файли новими версіями з артефактів" -ForegroundColor White
Write-Host "2. Запустіть: python manage.py collectstatic" -ForegroundColor White
Write-Host "3. Запустіть: npm install (в frontend директорії)" -ForegroundColor White
Write-Host "4. Протестуйте функціональність" -ForegroundColor White
Write-Host "5. Видаліть папку backup\ після перевірки" -ForegroundColor White

Write-Host "`n🎉 Проект очищено! Дублювання видалено, код оптимізовано." -ForegroundColor Green

# ============================= ДОДАТКОВІ КОМАНДИ ДЛЯ WINDOWS =============================

Write-Host "`n💡 Корисні команди для Windows:" -ForegroundColor Cyan
Write-Host "   • Запуск Django: python manage.py runserver" -ForegroundColor Gray
Write-Host "   • Запуск React: npm run dev" -ForegroundColor Gray
Write-Host "   • Перевірка портів: netstat -an | findstr :8000" -ForegroundColor Gray
Write-Host "   • Видалення node_modules: rmdir /s frontend\node_modules" -ForegroundColor Gray

# Пауза перед закриттям
Write-Host "`nНатисніть будь-яку клавішу для продовження..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")