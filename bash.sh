#!/usr/bin/env bash
git add .
git commit -m "Bugs"
git push heroku main
heroku logs --tail