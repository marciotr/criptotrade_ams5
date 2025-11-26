@echo off

cd /d %~dp0
echo Iniciando APIs...

echo.
echo CryptoApi...
cd .\backend\cryptoApi
start dotnet watch
cd ..\..

echo.
echo CurrencyAvailables...
cd .\backend\currencyAvailables
start dotnet watch
cd ..\..

echo.
echo UserApi...
cd .\backend\userApi
start dotnet watch
cd ..\..

echo.
echo WalletApi2...
cd .\backend\walletApi2
start dotnet watch
cd ..\..

echo.
echo gatewayApi...
cd .\backend\gatewayApi
start dotnet watch
cd ..\..

echo.
echo WalletApi2...
cd .\backend\walletApi2
start dotnet run
cd ..\..

echo.
echo Frontend...
cd /d %~dp0\frontend

if not exist node_modules (
    echo Instalando dependências do Frontend...
    npm install
)

echo Iniciando Frontend...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Todas as APIs e o Frontend foram iniciados.
pause