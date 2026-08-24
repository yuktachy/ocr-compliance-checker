
# OCR COMPLIANCE CHECKER
### 1. Make sure u have uv downloaded globally on your computer.
for mac/linux
```code
curl -LsSf https://astral.sh/uv/install.sh | sh
```
if u use homebrew for mac
```code
brew install uv
```
for windows
```code
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```
### 2. clone our repo , go to repo folder and stay on main branch
```code
git clone https://github.com/yuktachy/ocr-compliance-checker.git
cd ocr-compliance-checker
git checkout main
```
### 3. use this cmd to install dependencies.
```code
uv sync
```
### 4. Also create .env file and fill it!
### 5. just run this to see in everything in action
```code
uv run uvicorn backend.app.main:app --reload
```