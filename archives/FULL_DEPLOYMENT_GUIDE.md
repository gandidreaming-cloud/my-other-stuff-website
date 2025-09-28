# 🚀 BOOORING.SPACE - Полная инструкция по деплою

## 📋 ПОРЯДОК ДЕЙСТВИЙ (ВАЖНО СОБЛЮДАТЬ!)

### ШАГ 1: НАСТРОЙКА БАЗЫ ДАННЫХ (MongoDB Atlas)
1. Перейдите на https://www.mongodb.com/atlas
2. Создайте бесплатный аккаунт
3. Создайте новый кластер:
   - Выберите "M0 Sandbox" (бесплатно навсегда)
   - Регион: любой ближайший к вам
   - Имя кластера: `boooring-cluster`
4. Создайте пользователя базы данных:
   - Username: `boooring_user`
   - Password: придумайте сложный пароль и СОХРАНИТЕ
5. Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0)
6. Connect → Connect your application → скопируйте строку подключения:
   ```
   mongodb+srv://boooring_user:<password>@boooring-cluster.xxxxx.mongodb.net/boooring_db
   ```
   Замените `<password>` на ваш реальный пароль!

---

### ШАГ 2: GITHUB РЕПОЗИТОРИИ
1. Зайдите на https://github.com
2. Создайте 2 новых репозитория:
   - `boooring-backend` (публичный)
   - `boooring-frontend` (публичный)
3. Загрузите файлы:
   - В `boooring-backend` → все файлы из папки `backend/`
   - В `boooring-frontend` → все файлы из папки `frontend/`

---

### ШАГ 3: ДЕПЛОЙ BACKEND (Railway)
1. Перейдите на https://railway.app
2. Войдите через GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Выберите репозиторий `boooring-backend`
5. В настройках проекта добавьте Variables:
   ```
   MONGO_URL = ваша_строка_подключения_из_mongodb
   DB_NAME = boooring_db
   CORS_ORIGINS = https://boooring.space
   ```
6. Railway автоматически сделает деплой
7. ВАЖНО: скопируйте URL вашего backend'а (например: https://boooring-backend-production.up.railway.app)

---

### ШАГ 4: ДЕПЛОЙ FRONTEND (Netlify)  
1. Перейдите на https://netlify.com (у вас уже есть аккаунт)
2. "New site from Git"
3. Выберите репозиторий `boooring-frontend`
4. Build settings (должны подхватиться автоматически):
   - Build command: `npm run build`
   - Publish directory: `build`
5. В Environment variables добавьте:
   ```
   REACT_APP_BACKEND_URL = URL_с_шага_3_railway
   ```
6. Deploy site
7. Скопируйте ваш netlify URL (например: amazing-site-123456.netlify.app)

---

### ШАГ 5: НАСТРОЙКА ДОМЕНА (Hostinger)
1. Зайдите в панель управления Hostinger
2. Найдите управление DNS для домена `boooring.space`
3. Добавьте CNAME запись:
   - Type: CNAME
   - Name: @ (или оставьте пустым)
   - Target: ваш_netlify_URL (без https://)
4. Сохраните изменения
5. Подождите 24 часа для распространения DNS

---

### ШАГ 6: НАСТРОЙКА SSL В NETLIFY
1. В настройках Netlify перейдите в "Domain management"
2. Add custom domain: `boooring.space`
3. Netlify автоматически настроит SSL сертификат

---

## 🎯 РЕЗУЛЬТАТ:
После всех шагов ваш сайт будет доступен на https://boooring.space

## 🆘 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ:

### Backend не запускается:
- Проверьте переменную MONGO_URL
- Убедитесь, что в MongoDB разрешен доступ с любых IP

### Frontend не подключается к backend:
- Проверьте переменную REACT_APP_BACKEND_URL
- Убедитесь, что в ней нет лишнего слеша в конце

### Домен не работает:
- Подождите до 24 часов для DNS propagation
- Проверьте CNAME запись в Hostinger

## 📞 ПОДДЕРЖКА:
- Railway: https://docs.railway.app
- Netlify: https://docs.netlify.com  
- MongoDB Atlas: https://docs.atlas.mongodb.com

## 🎉 ПОЗДРАВЛЯЮ! 
Ваш сайт BOOORING.SPACE готов к запуску! 🚀