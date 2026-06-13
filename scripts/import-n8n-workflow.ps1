param(
  [string]$WorkflowPath = "n8n/workflows/jarvis-pro-interface-v1.json"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedWorkflowPath = Join-Path $repoRoot $WorkflowPath

if (-not (Test-Path $resolvedWorkflowPath)) {
  throw "Workflow file not found: $resolvedWorkflowPath"
}

Write-Host "Importing n8n workflow from $resolvedWorkflowPath"
npx n8n import:workflow --input $resolvedWorkflowPath
Write-Host "n8n workflow import completed. Activate it in n8n after local credential checks."
