# BOOORING Frontend (React)

## Деплой на Netlify

### 1. Загрузите код в GitHub репозиторий
- Создайте новый репозиторий: `boooring-frontend`
- Загрузите все файлы из этой папки
- Файл `netlify.toml` уже настроен

### 2. Подключите к Netlify:
- Перейдите на https://netlify.com
- Нажмите "New site from Git"
- Выберите ваш GitHub репозиторий `boooring-frontend`

### 3. Build настройки (автоматически подхватятся):
- Build command: `npm run build`
- Publish directory: `build`

### 4. Environment Variables на Netlify:
```
REACT_APP_BACKEND_URL=https://ваш-railway-backend-url.up.railway.app
```

### 5. Custom Domain:
- В настройках Netlify добавьте домен: `boooring.space`
- В Hostinger DNS добавьте CNAME запись на ваш netlify URL

## Локальный запуск:
```bash
npm install
npm start
```

Frontend будет доступен на http://localhost:3000

## Важно:
- Сначала деплойте backend на Railway
- Получите URL backend'а
- Добавьте этот URL в переменную REACT_APP_BACKEND_URL
- Затем деплойте frontend на Netlify