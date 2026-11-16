@echo off
title A1 Tiling Pty Ltd - Localhost Server
echo ===================================================
echo   Starting A1 Tiling Pty Ltd on http://localhost:3000
echo ===================================================
echo.
npm run dev
if %ERRORLEVEL% NEQ 0 (
  echo Server stopped or encountered an error.
  pause
)

