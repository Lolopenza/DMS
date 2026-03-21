# Math Lab Platform

Монорепозиторий образовательной math-платформы с фронтендом на React/Vite и вычислительным сервисом на FastAPI.

## Что запускаем

- `math-engine` (FastAPI): API дискретной математики, порт `8081`
- `frontend` (Vite): интерфейс, порт `3000`

Во время локальной разработки фронтенд проксирует:

- `/api/v1/*` -> `http://localhost:8081`
- `/api/*` -> `http://localhost:8080` (Java backend, если нужен)

## Быстрый локальный запуск (math-engine + frontend)

### 1. Запуск math-engine

```bash
cd math-engine

# Python 3.11+ рекомендуется
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

# Создайте файл math-engine/.env (для чат-бота)
# OPENROUTER_API_KEY=ваш_ключ
# OPENROUTER_MODEL=google/gemma-3-12b-it:free

python app.py
```

Проверка статуса:

```bash
curl http://localhost:8081/api/v1/status
```

Swagger UI:

- `http://localhost:8081/docs`

### 2. Запуск frontend

В новом терминале:

```bash
cd frontend
npm install
npm run dev
```

Открыть:

- `http://localhost:3000`

## Запуск через Docker Compose

Запуск всех сервисов (включая `nginx`, `backend`, `math-engine`, `postgres`, `redis`, `rabbitmq`):

```bash
docker-compose up -d
```

Открыть приложение:

- `http://localhost`

Полезные команды:

```bash
docker-compose ps
docker-compose logs -f math-engine
docker-compose logs -f nginx
docker-compose down
```

## Переменные окружения

Для Docker используется корневой файл `.env`.

Минимум для `math-engine`:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

Для локального запуска `math-engine` переменные нужно положить в `math-engine/.env` (именно этот путь читает `app.py`).

## Типичные проблемы

- `python web_app.py` не работает: в текущей версии нет Flask-приложения `web_app.py`, используйте `python app.py` в папке `math-engine`.
- Ошибки CORS/404 с фронта: убедитесь, что `math-engine` запущен на `8081`, а фронт на `3000`.
- Не работает чат: проверьте `OPENROUTER_API_KEY`.

## Тестирование

Быстрые команды из корня репозитория:

```bash
make test-python
make rag-eval
```

Проверка frontend:

```bash
cd frontend
npm run build
```

Подробные инструкции:

- `docs/TESTING.md`

## Дальнейшее развитие Frontend

План масштабирования до полноценной платформы с большим числом секций:

- `docs/FRONTEND-FULL-PLAN.md`
