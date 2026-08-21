#Requires -Version 7
<#
.SYNOPSIS
  Builds Smite2dle and deploys it to Azure Static Web Apps.

.DESCRIPTION
  Runs lint + build, then publishes dist/ with the Static Web Apps CLI.

  The deployment token is read from the SWA_DEPLOYMENT_TOKEN environment
  variable when present; otherwise it is fetched with the Azure CLI, which
  requires you to be signed in to the subscription that owns the app:

    az login
    az account set --subscription "Visual Studio Enterprise Subscription"

.EXAMPLE
  .\deploy.ps1
.EXAMPLE
  .\deploy.ps1 -SkipBuild
.EXAMPLE
  .\deploy.ps1 -Environment preview
#>
param(
  [string]$AppName = "smite2dle",
  [string]$ResourceGroupName = "smite2dle_rg",
  [string]$Environment = "production",
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

$token = $env:SWA_DEPLOYMENT_TOKEN

if (-not $token) {
  Write-Host "==> Fetching deployment token" -ForegroundColor Cyan
  $token = az staticwebapp secrets list `
    --name $AppName `
    --resource-group $ResourceGroupName `
    --query "properties.apiKey" -o tsv

  if (-not $token) {
    throw "Could not read the deployment token. Run 'az login' and select the right subscription."
  }
}

Write-Host "==> Deploying to '$Environment'" -ForegroundColor Cyan
npx --yes @azure/static-web-apps-cli@2 deploy ./dist --env $Environment --deployment-token $token
if ($LASTEXITCODE -ne 0) { throw "Deployment failed" }

$url = az staticwebapp show `
  --name $AppName `
  --resource-group $ResourceGroupName `
  --query "defaultHostname" -o tsv

Write-Host ""
Write-Host "Deployed: https://$url" -ForegroundColor Green
