@echo off
cd /d "%~dp0"
start "" http://localhost:8532/index.html
vercel dev --listen 8532
