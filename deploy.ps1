param(
  [string]$ResourceGroupName = "smite2dle_rg",
  [string]$AppName = "smite2dle",
  [string]$Location = "westeurope"
)

$ErrorActionPreference = "Stop"

npm install
npm run build

$existing = az staticwebapp show --name $AppName --resource-group $ResourceGroupName --query "name" -o tsv 2>$null

if (-not $existing) {
  az staticwebapp create `
    --name $AppName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --source "." `
    --branch "main" `
    --app-location "/" `
    --output-location "dist" `
    --login-with-github
} else {
  Write-Host "Static Web App '$AppName' already exists in '$ResourceGroupName'."
  Write-Host "Run 'az staticwebapp secrets list' and configure your CI/CD deployment token if needed."
}
