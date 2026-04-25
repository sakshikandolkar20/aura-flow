$ErrorActionPreference = "Stop"

$python = ".\.venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    Write-Host "Virtual environment python not found at $python"
    Write-Host "Create venv first: python -m venv .venv"
    exit 1
}

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,
        [Parameter(Mandatory = $true)]
        [string]$FailureMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host $FailureMessage
        exit $LASTEXITCODE
    }
}

Write-Host "Installing dependencies from requirements.txt..."
Invoke-CheckedCommand -Command { & $python -m pip install -r requirements.txt } -FailureMessage "Dependency installation failed."

Write-Host "Rebuilding model file..."
$modelPath = "co2_model_{0}.pkl" -f (Get-Date -Format "yyyyMMdd_HHmmss")
Write-Host "Saving model as $modelPath ..."
Invoke-CheckedCommand -Command { & $python -c "from save_model import build_and_save_model; build_and_save_model(model_path='$modelPath'); print('Model saved:', '$modelPath')" } -FailureMessage "Model regeneration failed."

Write-Host "Running end-to-end API checks..."
Invoke-CheckedCommand -Command { powershell -ExecutionPolicy Bypass -File .\run_api_checks.ps1 } -FailureMessage "API checks failed."

Write-Host "All done."
