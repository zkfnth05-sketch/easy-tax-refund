@echo off
set "PATH=C:\Users\zkfnt\node-js\node-v22.14.0-win-x64;%PATH%"
echo Using node from:
where node
node -v
echo Starting dev server...
npm run dev
