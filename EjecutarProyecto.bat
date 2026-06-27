@echo off
title Iniciar Proyecto ConstructERP
echo Iniciando los contenedores de Docker...
cd /d "D:\Entrega_ConstructERP"
docker compose up -d
echo.
echo ¡El proyecto se ha iniciado correctamente! Ya puedes cerrar esta ventana.
pause
