@echo off
title SK Motor POS — Launcher
color 0A

echo.
echo  ========================================
echo   SK Motor POS - Memulai Aplikasi...
echo  ========================================
echo.

:: Cek apakah port 3000 sudah dipakai
netstat -an | find "LISTENING" | find ":3000" >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Server sudah berjalan di port 3000
    echo  [>>] Membuka browser...
    timeout /t 1 /nobreak >nul
    start http://localhost:3000
    goto :end
)

echo  [>>] Memulai server Next.js...
echo  [i]  Harap tunggu 10-15 detik...
echo.

:: Mulai server di background
start /B cmd /c "cd /d "%~dp0" && npm run dev > "%~dp0logs\server.log" 2>&1"

:: Buat folder logs kalau belum ada
if not exist "%~dp0logs" mkdir "%~dp0logs"

:: Tunggu server siap
echo  [..] Menunggu server siap
set counter=0
:wait_loop
timeout /t 2 /nobreak >nul
netstat -an | find "LISTENING" | find ":3000" >nul 2>&1
if %errorlevel% == 0 goto :server_ready
set /a counter+=1
if %counter% geq 15 goto :timeout
echo  [..] Masih menunggu... (%counter%/15)
goto :wait_loop

:server_ready
echo.
echo  [OK] Server berhasil berjalan!
echo  [>>] Membuka SK Motor POS di browser...
timeout /t 1 /nobreak >nul
start http://localhost:3000
goto :end

:timeout
echo.
echo  [!!] Server belum siap dalam 30 detik.
echo  [i]  Coba buka manual: http://localhost:3000
echo  [i]  Atau jalankan: npm run dev
pause
goto :end

:end
echo.
echo  [i]  Untuk menutup server, tutup jendela CMD yang terbuka
echo  [i]  atau tekan Ctrl+C di jendela server.
echo.
timeout /t 3 /nobreak >nul
exit
