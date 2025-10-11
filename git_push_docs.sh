#!/bin/bash

# Exit if any command fails
set -e

# Stage all changes
git add .

# Commit with a generic message including timestamp
git commit -m "Update documentation: $(date '+%Y-%m-%d %H:%M:%S')" || {
    echo "No changes to commit."
    exit 0
}

# Push to main
git push origin main

echo "Changes pushed successfully!"
