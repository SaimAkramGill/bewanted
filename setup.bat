@echo off
echo Setting up beWanted MERN Stack Project...

echo.
echo 1. Installing root dependencies...
call npm install

echo.
echo 2. Creating server directory and installing server dependencies...
if not exist server mkdir server
cd server
call npm install
cd ..

echo.
echo 3. Installing client dependencies...
if exist client (
    cd client
    call npm install
    cd ..
) else (
    echo Client directory not found. Please create React app first with:
    echo npx create-react-app client
)

echo.
echo 4. Creating environment files...
if not exist server\.env (
    echo NODE_ENV=development > server\.env
    echo PORT=5000 >> server\.env
    echo MONGODB_URI=mongodb://localhost:27017/bewanted >> server\.env
    echo JWT_SECRET=your-super-secret-jwt-key-change-this >> server\.env
    echo JWT_EXPIRE=30d >> server\.env
)

if not exist client\.env (
    echo REACT_APP_API_URL=http://localhost:5000/api > client\.env
)

echo.
echo Setup complete! 
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Update server\.env with your MongoDB URI and JWT secret
echo 3. Run 'npm run dev' to start both servers
echo.
pause