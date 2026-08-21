#Requires -Version 7
<#
.SYNOPSIS
  Builds Smite2dle and deploys it to the Azure Storage static website.

.DESCRIPTION
  Runs lint + build, verifies the storage account is publicly reachable (a tenant policy on this
  subscription has repeatedly reset publicNetworkAccess to Disabled), uploads dist/ to the $web
  container, and prunes stale hashed assets left over from previous deployments.

.EXAMPLE
  .\deploy.ps1
.EXAMPLE
  .\deploy.ps1 -SkipBuild
#>
param(
  [string]$AccountName = "smite2dle19696",
  [string]$ResourceGroupName = "smite2dle_rg",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $SkipBuild) {
  Write-Host "==> Building" -ForegroundColor Cyan
  npm run lint
  if ($LASTEXITCODE -ne 0) { throw "Lint failed" }
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed" }
}

if (-not (Test-Path "dist/index.html")) {
  throw "dist/index.html not found. Run without -SkipBuild."
}

Write-Host "==> Checking public network access" -ForegroundColor Cyan
$access = az storage account show `
  --name $AccountName `
  --resource-group $ResourceGroupName `
  --query "publicNetworkAccess" -o tsv

if ($access -ne "Enabled") {
  Write-Warning "publicNetworkAccess is '$access' - re-enabling (tenant policy resets this)."
  az storage account update `
    --name $AccountName `
    --resource-group $ResourceGroupName `
    --public-network-access Enabled `
    --output none
}

Write-Host "==> Uploading dist/" -ForegroundColor Cyan
az storage blob upload-batch `
  --account-name $AccountName `
  --auth-mode login `
  --destination '$web' `
  --source dist `
  --overwrite true `
  --output none
if ($LASTEXITCODE -ne 0) { throw "Upload failed" }

Write-Host "==> Pruning stale assets" -ForegroundColor Cyan
$current = Get-ChildItem dist/assets -File | ForEach-Object { "assets/$($_.Name)" }
$remote = az storage blob list `
  --account-name $AccountName `
  --auth-mode login `
  --container-name '$web' `
  --prefix "assets/" `
  --query "[].name" -o tsv

foreach ($blob in $remote) {
  if ($current -notcontains $blob) {
    az storage blob delete `
      --account-name $AccountName `
      --auth-mode login `
      --container-name '$web' `
      --name $blob `
      --output none
    Write-Host "    pruned $blob" -ForegroundColor DarkGray
  }
}

$url = az storage account show `
  --name $AccountName `
  --resource-group $ResourceGroupName `
  --query "primaryEndpoints.web" -o tsv

Write-Host ""
Write-Host "Deployed: $url" -ForegroundColor Green
