param(
  [int]$N8nPort = 5678,
  [int]$JarvisPort = 5173
)

$ErrorActionPreference = "Stop"

# Starts the local Jarvis restore stack without changing workflow data.
# n8n keeps credentials and workflow state in the local user profile.

$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Starting local n8n for Jarvis on http://localhost:$N8nPort"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$repoRoot'; `$env:N8N_PORT='$N8nPort'; npx n8n start"
)

Write-Host "Starting Jarvis Web (Vite) on http://localhost:$JarvisPort"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$repoRoot'; npm run dev -- --host 127.0.0.1 --port $JarvisPort"
)

Start-Sleep -Seconds 5
Start-Process "http://localhost:$JarvisPort"
Start-Process "http://localhost:$N8nPort"

Write-Host "Jarvis Web and n8n were started in separate PowerShell windows."
Write-Host "If Jarvis cannot connect, verify that the n8n workflow is active and the local OpenAI credential is connected."
