# Vue Demo Application

Демонстрационный frontend на Vue.js с Docker поддержкой и CI/CD.

## Локальный запуск

### Режим разработки

```
npm install
npm run dev
```

Приложение доступно на http://localhost:5173

### С Docker Compose

```
docker-compose up --build
```

Приложение доступно на http://localhost:8080

## Команды

- `npm run dev` - Запуск dev сервера
- `npm run build` - Production сборка
- `npm run preview` - Предпросмотр production сборки
- `npm test` - Запуск тестов
- `npm run lint` - Проверка кода ESLint
- `npm run format` - Форматирование кода Prettier

## CI/CD

GitHub Actions автоматически:
- Проверяет качество кода (ESLint, Prettier)
- Запускает unit тесты (Vitest)
- Собирает Docker образ
- Выполняет интеграционные тесты (проверка доступности страницы)
- Публикует приложение на GitHub Pages

## GitHub Pages

Приложение доступно по адресу: https://fpmi-hci-2025.github.io/project11b-backend-svobodnaya/
