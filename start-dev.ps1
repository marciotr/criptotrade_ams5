# Define o diretório onde o script está rodando como raiz
$root = $PSScriptRoot

# Lista dos seus serviços (Backend)
$services = @(
    "cryptoApi",
    "currencyAvailables",
    "userApi",
    "walletApi2",
    "gatewayApi"
)

Write-Host "Iniciando ambiente de desenvolvimento..." -ForegroundColor Cyan

# Loop para iniciar cada API em uma nova janela do PowerShell
foreach ($service in $services) {
    $path = Join-Path $root "backend\$service"
    
    if (Test-Path $path) {
        Write-Host "Iniciando $service..." -ForegroundColor Green
        # Abre uma nova janela PowerShell, navega e roda o dotnet watch
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$path'; dotnet watch"
    } else {
        Write-Host "ERRO: Pasta não encontrada: $path" -ForegroundColor Red
    }
}

# Configuração do Frontend
$frontendPath = Join-Path $root "frontend"

if (Test-Path $frontendPath) {
    Write-Host "Verificando Frontend..." -ForegroundColor Yellow
    Set-Location $frontendPath

    # Verifica se node_modules existe, senão instala
    if (-not (Test-Path "node_modules")) {
        Write-Host "Instalando dependências do Frontend..." -ForegroundColor Yellow
        npm install
    }

    Write-Host "Iniciando Frontend..." -ForegroundColor Green
    # Inicia o servidor de dev em nova janela
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
} else {
    Write-Host "ERRO: Pasta Frontend não encontrada!" -ForegroundColor Red
}

Write-Host "Tudo iniciado."