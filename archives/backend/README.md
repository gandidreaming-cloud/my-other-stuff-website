# BOOORING Backend (FastAPI)

## Деплой на Railway.app

### 1. Создайте новый проект на Railway
- Перейдите на https://railway.app
- Войдите через GitHub
- Нажмите "New Project" → "Deploy from GitHub repo"

### 2. Загрузите этот код в GitHub репозиторий
- Создайте новый репозиторий: `boooring-backend`
- Загрузите все файлы из этой папки

### 3. Environment Variables на Railway:
```
MONGO_URL=mongodb+srv://boooring_user:<password>@boooring.xxxxx.mongodb.net/boooring_db
DB_NAME=boooring_db
CORS_ORIGINS=https://boooring.space
```

### 4. Railway автоматически:
- Установит Python 3.11
- Установит зависимости из requirements.txt
- Запустит сервер командой из package.json

### 5. После деплоя:
- Скопируйте URL вашего backend'а (например: https://boooring-backend-production.up.railway.app)
- Используйте этот URL в frontend как REACT_APP_BACKEND_URL

## Локальный запуск:
```bash
pip install -r requirements.txt
uvicorn backend.server:app --reload
```

Backend будет доступен на http://localhost:8000