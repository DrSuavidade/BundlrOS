# Build Electron main/preload scripts
# Compiles TypeScript to JS and renames to .cjs for ESM package compatibility

$electronDir = Join-Path $PSScriptRoot "..\electron"

# Compile TypeScript
Write-Host "Compiling Electron TypeScript..." -ForegroundColor Cyan
Push-Location $electronDir
npx tsc -p tsconfig.json
Pop-Location

# Rename .js to .cjs
Write-Host "Renaming outputs to .cjs..." -ForegroundColor Cyan
$jsFiles = Get-ChildItem -Path $electronDir -Filter "*.js"
foreach ($file in $jsFiles) {
    $newName = $file.FullName -replace '\.js$', '.cjs'
    if (Test-Path $newName) {
        Remove-Item $newName -Force
    }
    Rename-Item -Path $file.FullName -NewName ($file.Name -replace '\.js$', '.cjs')
}

# Rename .js.map to .cjs.map
$mapFiles = Get-ChildItem -Path $electronDir -Filter "*.js.map" -ErrorAction SilentlyContinue
foreach ($file in $mapFiles) {
    $newName = $file.FullName -replace '\.js\.map$', '.cjs.map'
    if (Test-Path $newName) {
        Remove-Item $newName -Force
    }
    Rename-Item -Path $file.FullName -NewName ($file.Name -replace '\.js\.map$', '.cjs.map')
}

Write-Host "Electron build complete!" -ForegroundColor Green
