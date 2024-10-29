$jsonPath = "$PSScriptRoot\applications.json"
$logPath = "$PSScriptRoot\logs\install_log.txt"

if (!(Test-Path -Path "$PSScriptRoot\logs")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\logs" | Out-Null
}

function Log-Message {
    param (
        [string]$message
    )
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "$timestamp - $message" | Out-File -FilePath $logPath -Append -Encoding UTF8
}

Log-Message "Starting installation process..."

if (Test-Path -Path $jsonPath) {
    $applications = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json
    Log-Message "Loaded application data from JSON file."
}
else {
    Write-Host "JSON file with application data not found at $jsonPath."
    Log-Message "Error: JSON file with application data not found at $jsonPath."
    exit
}

function Check-ApplicationInstalled {
    param ($appCommand)
    $process = Start-Process -FilePath "powershell" -ArgumentList "/c $appCommand" -NoNewWindow -PassThru -Wait -ErrorAction SilentlyContinue
    return $process.ExitCode -eq 0
}

$installedApps = @()
$installSelections = @()


foreach ($app in $applications) {
    $isInstalled = Check-ApplicationInstalled -appCommand $app.checkCommand
    if ($isInstalled) {
        $installedApps += $app.name
        Log-Message "Detected installed application: $($app.name) v$($app.version)"
    }
    else {
        $installSelections += $app
        Log-Message "Application not installed: $($app.name) v$($app.version)"
    }
}

if ($installedApps.Count -gt 0) {
    Write-Host "You already have the following applications installed:"
    foreach ($app in $installedApps) {
        Write-Host "- $app"
    }
    Log-Message "Listed already installed applications."
}
else {
    Write-Host "No applications are currently installed from the list."
    Log-Message "No applications from the list are currently installed."
}


if ($installSelections.Count -gt 0) {
    Write-Host "`nThe following applications are not installed and can be selected for installation:"
    foreach ($app in $installSelections) {
        $selection = Read-Host "[ ] Install $($app.name) v$($app.version)? (Y/N/Q to quit)"

        if ($selection -match '^[qQ]$') {
            Write-Host "Quitting the installation process."
            Log-Message "User quit the installation process."
            exit
        }

        $app.install = $selection -match '^[yY]$'
        Log-Message "User selected to install $($app.name): $($app.install)"
    }

    Write-Host "`nYou selected the following applications to install: "
    foreach ($app in $installSelections) {
        if ($app.install) {
            Write-Host "- $($app.name) v$($app.version)"
            Write-Host "Installing $($app.name) v$($app.version)..."
            Log-Message "Starting installation of $($app.name) v$($app.version)"
            Start-Process -NoNewWindow -FilePath $app.installCommand -Wait
            Log-Message "$($app.name) v$($app.version) installed successfully."
            Write-Host "$($app.name) v$($app.version) installed."
        }
    }
}
else {
    Write-Host "`nAll applications are already installed."
    Log-Message "All applications are already installed."
}

Write-Host "Done."
Log-Message "Installation process completed."

$basePath = "C:\Users\PowerUser\Documents\GitHub\portfolio"
$dockerComposePathBackend = Join-Path -Path $basePath -ChildPath "backend\java\docker-compose.yml"
$dockerComposePathFrontend = Join-Path -Path $basePath -ChildPath "frontend\angular\docker-compose.yml"

if (Test-Path -Path $dockerComposePathBackend) {
    Write-Host "Starting Docker containers for the backend..."
    Log-Message "Starting Docker containers for the backend."

    $workingDirBackend = Join-Path -Path $basePath -ChildPath "backend\java"
    if (Test-Path -Path $workingDirBackend) {
        Start-Process -FilePath "docker-compose" -ArgumentList "-f $dockerComposePathBackend up -d" -WorkingDirectory $workingDirBackend -Wait
        Write-Host "Backend Docker containers started successfully."
        Log-Message "Backend Docker containers started successfully."
    }
    else {
        Write-Host "Working directory for backend not found: $workingDirBackend"
        Log-Message "Error: Working directory for backend not found: $workingDirBackend"
    }
}
else {
    Write-Host "Docker Compose file not found at $dockerComposePathBackend."
    Log-Message "Error: Docker Compose file not found at $dockerComposePathBackend."
}

if (Test-Path -Path $dockerComposePathFrontend) {
    Write-Host "Starting Docker containers for the frontend..."
    Log-Message "Starting Docker containers for the frontend."

    $workingDirFrontend = Join-Path -Path $basePath -ChildPath "frontend\angular"
    if (Test-Path -Path $workingDirFrontend) {
        Start-Process -FilePath "docker-compose" -ArgumentList "-f $dockerComposePathFrontend up -d" -WorkingDirectory $workingDirFrontend -Wait
        Write-Host "Frontend Docker containers started successfully."
        Log-Message "Frontend Docker containers started successfully."
    }
    else {
        Write-Host "Working directory for frontend not found: $workingDirFrontend"
        Log-Message "Error: Working directory for frontend not found: $workingDirFrontend"
    }
}
else {
    Write-Host "Docker Compose file not found at $dockerComposePathFrontend."
    Log-Message "Error: Docker Compose file not found at $dockerComposePathFrontend."
}

Write-Host "Docker containers are running. Press any key to exit and keep containers running."
[System.Console]::ReadKey() | Out-Null


$confirmQuit = Read-Host "Are you sure you want to stop and remove all Docker containers? (Y/N)"
if ($confirmQuit -match '^[yY]$') {
    Write-Host "Quitting the installation process."
    Log-Message "User quit the installation process."
    
    Start-Process -FilePath "powershell" -ArgumentList "-Command docker stop -f $(docker ps -aq)" -NoNewWindow -Wait
    Start-Process -FilePath "powershell" -ArgumentList "-Command docker rm -f $(docker ps -aq)" -NoNewWindow -Wait

    Write-Host "All Docker containers stopped and removed."
    Log-Message "All Docker containers stopped and removed."
}
else {
    Write-Host "Docker containers will remain running."
}