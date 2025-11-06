#!/bin/bash

# 🚀 StudyFire - Quick Update & Deploy Script
# Run this after making code changes to push to live site

echo "🔥 StudyFire - Deploying Updates..."
echo ""

# Check if changes exist
if [ -z "$(git status --porcelain)" ]; then 
    echo "✅ No changes to deploy!"
    exit 0
fi

# Show what changed
echo "📝 Files changed:"
git status --short
echo ""

# Ask for commit message
read -p "💬 What did you change? " commit_message

# If empty, use default
if [ -z "$commit_message" ]; then
    commit_message="Update StudyFire"
fi

# Commit and push
echo ""
echo "⬆️  Pushing to GitHub..."
git add .
git commit -m "$commit_message"
git push

echo ""
echo "✅ Deployed! Your changes will be live in 2-3 minutes!"
echo "🌐 Check: https://studyfire.onrender.com"
echo ""
