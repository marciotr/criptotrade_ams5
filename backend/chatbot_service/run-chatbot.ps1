param(
    [switch] $RecreateVenv
)

$here = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
Set-Location $here

if ($RecreateVenv -and (Test-Path .venv)) {
    Write-Host "Removing existing .venv..."
    Remove-Item -Recurse -Force .venv
}

if (-not (Test-Path .venv)) {
    Write-Host "Creating virtual environment..."
    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -3 -m venv .venv
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        python -m venv .venv
    } else {
        Write-Error "Neither 'py' nor 'python' found. Install Python and add to PATH."
        exit 1
    }
}

Write-Host "Activating venv..."
.\.venv\Scripts\Activate.ps1

$venvPython = Join-Path -Path (Get-Location) -ChildPath ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Error "Python not found inside .venv. Did venv creation fail?"
    exit 1
}

Write-Host "Installing requirements (this may take a minute)..."
& $venvPython -m pip install --upgrade pip setuptools wheel
& $venvPython -m pip install -r requirements.txt

Write-Host "Starting chatbot service on port 6000..."
& $venvPython -m uvicorn main:app --reload --port 6000
