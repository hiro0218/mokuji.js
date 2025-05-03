#!/bin/bash
set -ev

# Blow up current dist
rm -rf dist;

# Build it
npm run build;

# Initialize dist as it's own repo
URL=$(git remote get-url origin);
cd dist

git init;
git remote add origin $URL
git checkout -b gh-pages

# Force push changes to gh-pages branch
git add -A . && git commit -m 'bump gh-pages' && git push origin gh-pages -f;
cd -;

# Blow it up again to ensure that next build won't hiccup.
rm -rf dist;

echo 'Deploy Completed!'
