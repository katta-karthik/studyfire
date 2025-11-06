@echo off
REM 🚀 StudyFire - Quick Update & Deploy Script (Windows)
REM Run this after making code changes to push to live site

echo 🔥 StudyFire - Deploying Updates...
echo.

REM Check if changes exist
git status --porcelain > nul 2>&1
if errorlevel 1 (
    echo ✅ No changes to deploy!
    pause
    exit /b 0
)

REM Show what changed
echo 📝 Files changed:
git status --short
echo.

REM Ask for commit message
set /p commit_message="💬 What did you change? "

REM If empty, use default
if "%commit_message%"=="" set commit_message=Update StudyFire

REM Commit and push
echo.
echo ⬆️  Pushing to GitHub...
git add .
git commit -m "%commit_message%"
git push

echo.
echo ✅ Deployed! Your changes will be live in 2-3 minutes!
echo 🌐 Check: https://studyfire.onrender.com
echo.
pause
