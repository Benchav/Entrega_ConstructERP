@echo off
title Iniciar Proyecto ConstructERP
echo Iniciando los contenedores de Docker...
cd /d "D:\Entrega_ConstructERP"
docker compose up -d
echo.
echo Esperando a que los servicios se estabilicen...
timeout /t 3 /nobreak >nul
echo Abriendo Frontend y Documentacion API...
start http://localhost
start http://localhost:3000/docs
echo.
echo ¡El proyecto se ha iniciado correctamente! Ya puedes cerrar esta ventana.
pause
