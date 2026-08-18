@echo off
cd /d "%~dp0"
start "" http://localhost:8532/index.html
python -m http.server 8532
