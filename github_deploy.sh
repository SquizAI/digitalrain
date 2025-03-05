#!/bin/bash

echo "GitHub Deployment Helper for DigitalRain"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    echo "Please install Git from https://git-scm.com/"
    exit 1
fi

echo "✅ Git is installed"

# Check if repository is already initialized
if [ -d ".git" ]; then
    echo "✅ Git repository already initialized"
    
    # Check remote
    if git remote -v | grep -q "origin"; then
        echo "✅ Remote 'origin' already configured"
        remote_url=$(git remote get-url origin)
        echo "   Current remote URL: $remote_url"
        
        read -p "Do you want to change the remote URL? (y/n): " change_remote
        if [ "$change_remote" = "y" ] || [ "$change_remote" = "Y" ]; then
            read -p "Enter new GitHub repository URL: " new_remote_url
            git remote set-url origin "$new_remote_url"
            echo "Remote URL updated to: $new_remote_url"
        fi
    else
        echo "⚠️  No remote 'origin' configured"
        read -p "Enter GitHub repository URL: " remote_url
        git remote add origin "$remote_url"
        echo "Remote 'origin' added with URL: $remote_url"
    fi
else
    echo "⚠️  Git repository not initialized"
    
    # Initialize repository
    read -p "Do you want to initialize a new Git repository? (y/n): " init_repo
    if [ "$init_repo" = "y" ] || [ "$init_repo" = "Y" ]; then
        git init
        echo "✅ Git repository initialized"
        
        # Configure remote
        read -p "Enter GitHub repository URL: " remote_url
        git remote add origin "$remote_url"
        echo "Remote 'origin' added with URL: $remote_url"
    else
        echo "❌ Repository initialization skipped"
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes"
    
    # Ask to commit changes
    read -p "Do you want to commit all changes? (y/n): " commit_changes
    if [ "$commit_changes" = "y" ] || [ "$commit_changes" = "Y" ]; then
        read -p "Enter commit message: " commit_message
        git add .
        git commit -m "$commit_message"
        echo "✅ Changes committed"
    else
        echo "❌ Commit skipped"
        exit 1
    fi
else
    echo "✅ No uncommitted changes"
fi

# Push to GitHub
read -p "Do you want to push to GitHub now? (y/n): " push_to_github
if [ "$push_to_github" = "y" ] || [ "$push_to_github" = "Y" ]; then
    # Check for branches
    if [[ $(git branch | wc -l) -eq 0 ]]; then
        echo "⚠️  No branches found, creating main branch"
        git checkout -b main
    fi
    
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo "Current branch: $current_branch"
    
    # Push to GitHub
    echo "Pushing to GitHub..."
    git push -u origin "$current_branch"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub"
        remote_url=$(git remote get-url origin)
        echo "Your code is now available at: ${remote_url%.git}"
    else
        echo "❌ Failed to push to GitHub"
        echo "Please check your credentials and repository access"
    fi
else
    echo "❌ Push skipped"
fi

echo ""
echo "GitHub deployment helper complete!" 