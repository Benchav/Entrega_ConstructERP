@echo off
title Detener Proyecto ConstructERP
echo Deteniendo los contenedores de Docker...
cd /d "D:\Entrega_ConstructERP"
docker compose down
echo.
echo ¡El proyecto se ha detenido y limpiado correctamente!
pause
