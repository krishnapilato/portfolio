$jsonPath = "$PSScriptRoot\applications.json"


if (Test-Path -Path $jsonPath) {
    $applications = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json
}
else {
    Write-Host "JSON file with application data not found at $jsonPath."
    exit
}
function Check-ApplicationInstalled {
    param ($appCommand)

    $process = Start-Process -FilePath "powershell" -ArgumentList "/c $appCommand" -NoNewWindow -PassThru -Wait -ErrorAction SilentlyContinue
    if ($process.ExitCode -eq 0) {
        return $true
    }
    else {
        return $false
    }
}

$installedApps = @()
$installSelections = @()

foreach ($app in $applications) {
    
    $isInstalled = Check-ApplicationInstalled -appCommand $app.checkCommand
    if ($isInstalled) {
        $installedApps += $app.name
    }
    else {
        $installSelections += $app
    }
}


if ($installedApps.Count -gt 0) {
    Write-Host "You already have the following applications installed:"
    foreach ($app in $installedApps) {
        Write-Host "- $app"
    }
}
else {
    Write-Host "No applications are currently installed from the list."
}


if ($installSelections.Count -gt 0) {
    Write-Host "`nThe following applications are not installed and can be selected for installation:"
    foreach ($app in $installSelections) {
        $selection = Read-Host "[ ] Install $($app.name) v$($app.version)? (Y/N/Q to quit)"
        
        
        if ($selection -match '^[qQ]$') {
            Write-Host "Quitting the installation process."
            exit
        }

        if ($selection -match '^[yY]$') {
            $app.install = $true
        }
        else {
            $app.install = $false
        }
    }

    
    Write-Host "`nYou selected the following applications to install: "
    foreach ($app in $installSelections) {
        if ($app.install) {
            Write-Host "- $($app.name) v$($app.version)"
            Write-Host "Installing $($app.name) v$($app.version)..."
            Start-Process -NoNewWindow -FilePath $app.installCommand -Wait
            Write-Host "$($app.name) v$($app.version) installed."
        }
    }
}
else {
    Write-Host "`nAll applications are already installed."
}

Write-Host "Done."