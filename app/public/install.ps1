# ==============================================================================
# Solaxis CLI Installer for Windows (PowerShell)
#
# Quick Install via Web:
#   irm https://solaxis.run/install.ps1 | iex
#   or
#   irm http://localhost:3000/install.ps1 | iex
#
# Local Repository Install:
#   powershell -ExecutionPolicy Bypass -File .\install.ps1
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "   ____        _             _     " -ForegroundColor Cyan
Write-Host "  / ___|  ___ | | __ ___  _ (_)___ " -ForegroundColor Cyan
Write-Host "  \___ \ / _ \| |/ _` \ \/ /| / __|" -ForegroundColor Cyan
Write-Host "   ___) | (_) | | (_| |>  < | \__ \" -ForegroundColor Cyan
Write-Host "  |____/ \___/|_|\__,_/_/\_\|_|___/" -ForegroundColor Cyan
Write-Host "  Serverless Web3 Micro-Instances on Solana & MagicBlock ER" -ForegroundColor DarkGray
Write-Host ""

# ------------------------------------------------------------------------------
# 1. Pre-flight Check: Node.js
# ------------------------------------------------------------------------------
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCmd) {
    Write-Host "✖ Error: Node.js is required but was not found on your system." -ForegroundColor Red
    Write-Host "Please install Node.js (v20.x LTS recommended) via winget or the official website:"
    Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor Cyan
    Write-Host "  https://nodejs.org" -ForegroundColor Cyan
    Write-Host "After installing Node.js, restart PowerShell and re-run this script."
    exit 1
}

$nodeVer = & node -v
Write-Host "==> Found Node.js: $nodeVer" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 2. Setup Directories
# ------------------------------------------------------------------------------
$SolaxisHome = if ($env:SOLAXIS_HOME) { $env:SOLAXIS_HOME } else { Join-Path $HOME ".solaxis" }
$BinDir = Join-Path $SolaxisHome "bin"

if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}

$IsLocal = $false
$RepoDir = ""

if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot "cli\package.json"))) {
    $IsLocal = $true
    $RepoDir = $PSScriptRoot
} elseif (Test-Path ".\cli\package.json") {
    $IsLocal = $true
    $RepoDir = (Get-Location).Path
}

# ------------------------------------------------------------------------------
# 3. Build / Fetch Solaxis CLI
# ------------------------------------------------------------------------------
if ($IsLocal) {
    Write-Host "==> Installing from local repository: $RepoDir" -ForegroundColor Green
    $CliEntry = Join-Path $RepoDir "cli\dist\bin\solaxis.js"

    if (-not (Test-Path $CliEntry)) {
        Write-Host "==> Building Solaxis packages..." -ForegroundColor Green
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            Push-Location $RepoDir
            & pnpm build
            Pop-Location
        } else {
            Push-Location $RepoDir
            & npx -y pnpm build
            Pop-Location
        }
    }
} else {
    Write-Host "==> Downloading Solaxis CLI from GitHub..." -ForegroundColor Green
    $SolaxisRepo = Join-Path $SolaxisHome "repo"

    $gitCmd = Get-Command git -ErrorAction SilentlyContinue
    if (-not $gitCmd) {
        Write-Host "✖ Error: git is required to download Solaxis." -ForegroundColor Red
        Write-Host "Install git via: winget install Git.Git" -ForegroundColor Cyan
        exit 1
    }

    if (Test-Path (Join-Path $SolaxisRepo ".git")) {
        Write-Host "Updating existing checkout at $SolaxisRepo..." -ForegroundColor DarkGray
        Push-Location $SolaxisRepo
        & git pull --quiet
        Pop-Location
    } else {
        & git clone --depth 1 https://github.com/Team-Managed/Solaxis.git $SolaxisRepo --quiet
    }

    Write-Host "==> Building Solaxis distribution..." -ForegroundColor Green
    Push-Location $SolaxisRepo
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        & pnpm install --frozen-lockfile=false
        & pnpm build
    } else {
        & npx -y pnpm install --frozen-lockfile=false
        & npx -y pnpm build
    }
    Pop-Location

    $CliEntry = Join-Path $SolaxisRepo "cli\dist\bin\solaxis.js"
}

if (-not (Test-Path $CliEntry)) {
    Write-Host "✖ Build failed: $CliEntry not found." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# 4. Create Windows Executable Shims (CMD and PowerShell)
# ------------------------------------------------------------------------------
$CmdShimPath = Join-Path $BinDir "solaxis.cmd"
$PsShimPath  = Join-Path $BinDir "solaxis.ps1"

# Windows Command Prompt batch shim
$CmdContent = @"
@echo off
node "$CliEntry" %*
"@
Set-Content -Path $CmdShimPath -Value $CmdContent -Force

# Windows PowerShell script shim
$PsContent = @"
& node "$CliEntry" `$args
"@
Set-Content -Path $PsShimPath -Value $PsContent -Force

Write-Host "==> Created executable shims at $BinDir" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 5. Add to User Environment PATH
# ------------------------------------------------------------------------------
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($UserPath -notlike "*$BinDir*") {
    $NewUserPath = if ($UserPath -and $UserPath.Trim().Length -gt 0) {
        "$UserPath;$BinDir"
    } else {
        $BinDir
    }
    [Environment]::SetEnvironmentVariable("Path", $NewUserPath, "User")
    $env:Path += ";$BinDir"
    Write-Host "==> Added $BinDir to User PATH environment variable." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# 6. Verification
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "✓ Solaxis CLI installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Try running:"
Write-Host "  solaxis --help" -ForegroundColor Cyan
Write-Host "  solaxis new my-custom-engine" -ForegroundColor Cyan
Write-Host "  solaxis invoke my-custom-engine -i 50 --tee" -ForegroundColor Cyan
Write-Host "  solaxis vm" -ForegroundColor Cyan
Write-Host ""
