# Smite2dle

A Smite 2 version of the Smitedle concept. This first version implements Classic mode as a static React app: a daily god is selected by UTC date, guesses are saved locally for the day, and each guess compares pantheon, class, damage type, range, role, and Smite 2 entry year.

## Local development

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## Azure deployment

The app is prepared for Azure Static Web Apps and should live in the existing `smite2dle_rg` resource group.

```powershell
.\deploy.ps1 -ResourceGroupName smite2dle_rg -AppName smite2dle -Location westeurope
```

Deployment requires the signed-in Azure account to have read/write access to `smite2dle_rg` in the selected subscription.
