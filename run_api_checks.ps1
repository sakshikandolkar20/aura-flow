$ErrorActionPreference = "Stop"

$python = ".\.venv\Scripts\python.exe"
$server = $null
$startedByScript = $false

if (-not (Test-Path $python)) {
    Write-Host "Virtual environment python not found at $python"
    Write-Host "Create venv first: python -m venv .venv"
    exit 1
}

if (Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue) {
    Write-Host "Backend already running on port 5000. Reusing it..."
}
else {
    Write-Host "Starting backend..."
    $server = Start-Process -FilePath $python -ArgumentList "app.py" -PassThru
    $startedByScript = $true
}

try {
    Start-Sleep -Seconds 3
    Write-Host "Running API checks..."
    & $python test_api.py
}
finally {
    if ($startedByScript -and $server -and -not $server.HasExited) {
        Write-Host "Stopping backend..."
        Stop-Process -Id $server.Id -Force
    }
}
