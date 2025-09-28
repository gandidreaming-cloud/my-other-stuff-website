# BOOORING.SPACE - Deployment Guide

## 🎯 ПОШАГОВАЯ ИНСТРУКЦИЯ ДЛЯ ДЕПЛОЯ

### АРХИТЕКТУРА:
- Frontend (React) → Netlify (бесплатно)
- Backend (FastAPI) → Railway (бесплатно) 
- Database → MongoDB Atlas (бесплатно)
- Домен → boooring.space → Netlify

---

## ШАГ 1: НАСТРОЙКА MONGODB ATLAS (БАЗА ДАННЫХ)

1. Перейти на https://www.mongodb.com/atlas
2. Нажать "Try Free"
3. Создать аккаунт
4. Создать новый кластер:
   - Выбрать "M0 Sandbox" (бесплатно)
   - Регион: любой ближайший
   - Имя кластера: "boooring"
5. Создать пользователя базы данных:
   - Username: boooring_user
   - Password: (сохранить!)
6. Добавить IP адрес: 0.0.0.0/0 (доступ отовсюду)
7. Скопировать Connection String:
   `mongodb+srv://boooring_user:<password>@boooring.xxxxx.mongodb.net/boooring_db`

---

## ШАГ 2: НАСТРОЙКА BACKEND НА RAILWAY

1. Перейти на https://railway.app
2. Войти через GitHub
3. Нажать "New Project" → "Deploy from GitHub repo"
4. Создать новый репозиторий на GitHub с backend кодом
5. Выбрать репозиторий
6. Railway автоматически деплоит
7. Добавить Environment Variables:
   - `MONGO_URL` = (строка из MongoDB Atlas)
   - `DB_NAME` = boooring_db
   - `CORS_ORIGINS` = https://boooring.space
8. Скопировать URL backend'а: https://xxxxx.railway.app

---

## ШАГ 3: НАСТРОЙКА FRONTEND НА NETLIFY

1. Открыть https://netlify.com
2. Войти в аккаунт (у вас уже есть)
3. Нажать "New site from Git"
4. Выбрать GitHub репозиторий с frontend кодом
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Environment Variables:
   - `REACT_APP_BACKEND_URL` = https://xxxxx.railway.app
7. Deploy site
8. В настройках домена добавить: boooring.space

---

## ШАГ 4: НАСТРОЙКА ДОМЕНА НА HOSTINGER

1. Войти в Hostinger
2. Найти управление DNS для boooring.space
3. Добавить записи:
   - Type: CNAME
   - Name: @
   - Target: (ваш netlify URL, например: amazing-site-123456.netlify.app)
4. Ждать 24 часа для propagation

---

## ФАЙЛЫ ДЛЯ ЗАГРУЗКИ:

### Backend репозиторий:
- /backend/ (вся папка)
- requirements.txt
- README.md

### Frontend репозиторий:  
- /frontend/src/ (вся папка)
- /frontend/public/ (вся папка)
- package.json
- tailwind.config.js
- postcss.config.js

---

## ВАЖНЫЕ ССЫЛКИ:
- MongoDB Atlas: https://www.mongodb.com/atlas
- Railway: https://railway.app  
- Netlify: https://netlify.com
- GitHub: https://github.com

После деплоя сайт будет доступен на https://boooring.space 🚀