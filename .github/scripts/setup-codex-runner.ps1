[CmdletBinding()]
param(
  [string]$Repo = "chevalier1216/pantry-to-table",
  [string]$RunnerDir = "C:\actions-runner",
  [string]$RunnerName = "$env:COMPUTERNAME-codex"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/$Repo"

function Refresh-Path {
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath;$env:APPDATA\npm"
}

function Ensure-Winget {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "winget is required to install missing prerequisites automatically. Install App Installer from Microsoft Store, then run this script again."
  }
}

function Ensure-GitHubCli {
  if (Get-Command gh -ErrorAction SilentlyContinue) {
    return
  }

  Ensure-Winget
  Write-Host "Installing GitHub CLI..."
  winget install --id GitHub.cli --exact --accept-package-agreements --accept-source-agreements --silent
  if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI installation failed."
  }
  Refresh-Path

  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI was installed but is not available in PATH yet. Open a new PowerShell window and run this script again."
  }
}

function Ensure-Node {
  if ((Get-Command node -ErrorAction SilentlyContinue) -and (Get-Command npm -ErrorAction SilentlyContinue)) {
    return
  }

  Ensure-Winget
  Write-Host "Installing Node.js LTS..."
  winget install --id OpenJS.NodeJS.LTS --exact --accept-package-agreements --accept-source-agreements --silent
  if ($LASTEXITCODE -ne 0) {
    throw "Node.js installation failed."
  }
  Refresh-Path

  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "Node.js was installed but npm is not available in PATH yet. Open a new PowerShell window and run this script again."
  }
}

function Ensure-Codex {
  if (-not (Get-Command codex -ErrorAction SilentlyContinue)) {
    Ensure-Node
    Write-Host "Installing Codex CLI..."
    npm install -g @openai/codex
    if ($LASTEXITCODE -ne 0) {
      throw "Codex CLI installation failed."
    }
    Refresh-Path
  }

  codex --version
  $status = (codex login status 2>&1 | Out-String).Trim()

  if ($LASTEXITCODE -ne 0 -or $status -notmatch "Logged in using ChatGPT") {
    Write-Host "Codex needs ChatGPT sign-in. A browser sign-in will open now."
    codex login
    if ($LASTEXITCODE -ne 0) {
      throw "Codex ChatGPT sign-in did not complete."
    }
    $status = (codex login status 2>&1 | Out-String).Trim()
  }

  if ($status -notmatch "Logged in using ChatGPT") {
    throw "Codex is not signed in using ChatGPT. Current status: $status"
  }

  Write-Host $status
}

function Ensure-GitHubAuth {
  Ensure-GitHubCli

  gh auth status --hostname github.com *> $null
  if ($LASTEXITCODE -eq 0) {
    return
  }

  Write-Host "GitHub CLI needs authorization. A browser sign-in will open now."
  gh auth login --hostname github.com --git-protocol https --web --scopes "repo,workflow"
  if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI sign-in did not complete."
  }
}

function Get-RunnerRegistrationToken {
  $response = gh api --method POST "repos/$Repo/actions/runners/registration-token" | ConvertFrom-Json
  if (-not $response.token) {
    throw "GitHub did not return a self-hosted runner registration token."
  }
  return $response.token
}

function Ensure-RunnerFiles {
  New-Item -ItemType Directory -Path $RunnerDir -Force | Out-Null

  $configPath = Join-Path $RunnerDir "config.cmd"
  if (Test-Path $configPath) {
    return
  }

  Write-Host "Downloading the latest GitHub Actions runner..."
  $headers = @{ "User-Agent" = "pantry-to-table-runner-bootstrap" }
  $release = Invoke-RestMethod -Headers $headers -Uri "https://api.github.com/repos/actions/runner/releases/latest"
  $asset = $release.assets | Where-Object { $_.name -like "actions-runner-win-x64-*.zip" } | Select-Object -First 1
  if (-not $asset) {
    throw "Could not find the latest Windows x64 GitHub Actions runner asset."
  }

  $zipPath = Join-Path $env:TEMP $asset.name
  Invoke-WebRequest -Headers $headers -Uri $asset.browser_download_url -OutFile $zipPath
  Expand-Archive -Path $zipPath -DestinationPath $RunnerDir -Force
  Remove-Item $zipPath -Force
}

function Ensure-RunnerConfigured {
  $runnerMarker = Join-Path $RunnerDir ".runner"
  if (Test-Path $runnerMarker) {
    Write-Host "GitHub Actions runner is already configured in $RunnerDir."
    return
  }

  $token = Get-RunnerRegistrationToken
  Push-Location $RunnerDir
  try {
    Write-Host "Registering runner $RunnerName for $Repo..."
    & .\config.cmd --unattended --url $RepoUrl --token $token --name $RunnerName --work "_work" --replace
    if ($LASTEXITCODE -ne 0) {
      throw "GitHub Actions runner registration failed."
    }
  }
  finally {
    Pop-Location
  }
}

function Ensure-StartupEntry {
  $startupDir = [Environment]::GetFolderPath("Startup")
  $startupPath = Join-Path $startupDir "pantry-to-table-codex-runner.cmd"
  $startupContent = @"
@echo off
cd /d "$RunnerDir"
call run.cmd
"@
  Set-Content -Path $startupPath -Value $startupContent -Encoding ascii
  Write-Host "Runner startup entry: $startupPath"
}

function Start-Runner {
  $existing = Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "GitHub Actions runner is already running."
    return
  }

  $runPath = Join-Path $RunnerDir "run.cmd"
  Start-Process -FilePath $runPath -WorkingDirectory $RunnerDir -WindowStyle Minimized
  Start-Sleep -Seconds 3

  if (-not (Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue)) {
    throw "Runner process did not stay running. Open $runPath manually to inspect the error."
  }

  Write-Host "GitHub Actions runner started."
}

Write-Host "Setting up pantry-to-table Codex automation on this Windows account..."
Ensure-Codex
Ensure-GitHubAuth
Ensure-RunnerFiles
Ensure-RunnerConfigured
Ensure-StartupEntry
Start-Runner

Write-Host ""
Write-Host "Runner bootstrap complete. GitHub Issues whose title starts with [CODEX] can now trigger the local Codex worker."
