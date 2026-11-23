@echo off
echo Creating .env file for ApexSIS...

(
echo DB_HOST=127.0.0.1
echo DB_PORT=3306
echo DB_NAME=school_information_system
echo DB_USER=root
echo DB_PASS=
echo.
echo JWT_SECRET=ApexSIS_Super_Secure_Secret_Key_2026_Enterprise_System_DeepMind!
echo.
echo CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176
echo.
echo APP_ENV=development
) > .env

echo.
echo SUCCESS! .env file has been created.
echo You can now run: npm run dev
echo.
pause
