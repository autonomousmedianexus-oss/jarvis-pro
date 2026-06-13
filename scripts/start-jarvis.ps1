param(
  [int]$N8nPort = 5678,
  [int]$JarvisPort = 5173
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Starting n8n on http://localhost:$N8nPort"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$repoRoot'; `$env:N8N_PORT='$N8nPort'; npx n8n start"
)

Write-Host "Starting Jarvis Web on http://localhost:$JarvisPort"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$repoRoot'; npm run dev -- --host 127.0.0.1 --port $JarvisPort"
)

Start-Sleep -Seconds 5
Start-Process "http://localhost:$JarvisPort"
Start-Process "http://localhost:$N8nPort"

Write-Host "Jarvis Web and n8n were started in separate PowerShell windows."
