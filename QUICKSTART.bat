@echo off
REM MERN Gym Management System - Quick Start for Windows

color 0A
cls

echo.
echo ================================================================================
echo           MERN GYM MANAGEMENT SYSTEM - WINDOWS QUICK START
echo ================================================================================
echo.

echo [STEP 1] Seed test database with test users
echo Command: node Backend\seed.js
echo.
echo This creates:
echo   - Admin: admin@test.com / admin123
echo   - Trainer: trainer@test.com / trainer123
echo   - Member: member@test.com / member123
echo.
echo Run in terminal:
echo   cd Backend
echo   node seed.js
echo.
pause

echo.
echo [STEP 2] Start Backend Server
echo Command: npm start (from Backend directory)
echo.
echo Server will run on: http://localhost:5000
echo.
echo Run in TERMINAL 1:
echo   cd Backend
echo   npm start
echo.
pause

echo.
echo [STEP 3] Start Frontend Server
echo Command: npm start (from Frontend directory)
echo.
echo App will open at: http://localhost:3000
echo.
echo Run in TERMINAL 2:
echo   cd Frontend
echo   npm start
echo.
pause

echo.
echo [STEP 4] Login to Application
echo.
echo Navigate to: http://localhost:3000
echo.
echo TEST ACCOUNTS:
echo.
echo +-----------+--------------------------+-----------+-----------+
echo ^| Role      ^| Email                    ^| Password  ^| Access    ^|
echo +-----------+--------------------------+-----------+-----------+
echo ^| Admin     ^| admin@test.com           ^| admin123  ^| Admin     ^|
echo ^| Trainer   ^| trainer@test.com         ^| trainer123^| Trainer   ^|
echo ^| Member    ^| member@test.com          ^| member123 ^| Member    ^|
echo +-----------+--------------------------+-----------+-----------+
echo.
pause

echo.
echo ================================================================================
echo                         TROUBLESHOOTING TIPS
echo ================================================================================
echo.
echo If you get "module not found" errors:
echo   cd Backend
echo   npm install
echo.
echo If MongoDB connection fails:
echo   1. Install MongoDB Community Edition
echo   2. Start MongoDB service
echo   3. Or use MongoDB Atlas (update MONGODB_URI in Backend\.env)
echo.
echo If ports are already in use:
echo   Find process: netstat -ano ^| findstr :5000
echo   Kill process: taskkill /PID [pid_number] /F
echo.
echo For more help, see:
echo   - SETUP_GUIDE.md (Detailed instructions)
echo   - IMPLEMENTATION_STATUS.md (System architecture)
echo.
echo ================================================================================
echo.
echo Everything is set up! Open your browser and go to:
echo   http://localhost:3000
echo.
pause