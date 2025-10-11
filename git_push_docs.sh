#!/bin/bash
# Exit immediately if a command fails
set -e

# Navigate to the repo root
cd "$(dirname "$0")"

# Stage all changes
git add .

# Commit with a generic message including timestamp
if git diff-index --quiet HEAD --; then
    echo "No changes to commit."
    exit 0
else
    git commit -m "Update documentation: $(date '+%Y-%m-%d %H:%M:%S') - $(git diff --name-only | tr '\n' ', ')"
fi

# Push to main
git push origin main

echo "Changes pushed successfully to the 'documentation' repo!"