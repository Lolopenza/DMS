# Math Lab Platform

Монорепозиторий образовательной math-платформы с фронтендом на React/Vite и вычислительным сервисом на FastAPI.

## Компоненты и порты

| Компонент | Порт | Описание |
|-----------|------|---------|
| **frontend** | 3000 | React + Vite (dev); Nginx (prod) |
| **math-engine** | 8081 | FastAPI: math computations & AI chat |
| **backend** | 8080 | Spring Boot: orchestration (internal) |
| **postgres** | 5432 | Database (internal only) |
| **redis** | 6379 | Cache (internal only) |
| **rabbitmq** | 5672, 15672 | Message broker (internal only) |

Во время локальной разработки фронтенд проксирует:

- `/api/v1/*` → `http://localhost:8081` (math-engine)
- `/api/*` → `http://localhost:8080` (Java backend)

**📖 Полная справка**: [`docs/PORTS-AND-SERVICES.md`](docs/PORTS-AND-SERVICES.md)

## Быстрый локальный запуск (math-engine + frontend)

### 1. Запуск math-engine

```bash
cd math-engine

# Python 3.11+ рекомендуется
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

# Используется корневой .env (для чат-бота)
# GOOGLE_AI_API_KEY=ваш_ключ
# GEMINI_MODEL=models/gemini-2.0-flash
# GROQ_API_KEY=резервный_ключ
# GROQ_MODEL=llama-3.3-70b-versatile

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
# Development (с hot-reload и всеми портами)
docker-compose up -d

# Production (строгий режим, только nginx на :80)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Development**: Доступен через:
- Frontend: `http://localhost:3000`
- Math-engine: `http://localhost:8081`
- Backend: `http://localhost:8080`
- RabbitMQ UI: `http://localhost:15672`

**Production**: Доступен только через nginx:
- `http://localhost` (или ваш domain)
- Все backend-сервисы внутри Docker network

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

- `GOOGLE_AI_API_KEY`
- `GEMINI_MODEL`

Рекомендуемый резервный провайдер (failover):

- `GROQ_API_KEY`
- `GROQ_MODEL`

## Типичные проблемы

- `python web_app.py` не работает: в текущей версии нет Flask-приложения `web_app.py`, используйте `python app.py` в папке `math-engine`.
- Ошибки CORS/404 с фронта: убедитесь, что `math-engine` запущен на `8081`, а фронт на `3000`.
- Не работает чат: проверьте `GOOGLE_AI_API_KEY` и `GROQ_API_KEY`.

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

## Документация (docs/)

| Документ | Назначение |
|----------|-----------|
| **[PORTS-AND-SERVICES.md](docs/PORTS-AND-SERVICES.md)** | 📍 Все порты, сетевая топология, troubleshooting |
| **[API-TESTING-DOCKER-BEST-PRACTICES.md](docs/API-TESTING-DOCKER-BEST-PRACTICES.md)** | 🧪 Тестирование API, smoke-checks, Docker-рекомендации |
| **[DOCKER-PROD-RUNBOOK.md](docs/DOCKER-PROD-RUNBOOK.md)** | 🚀 Production deployment, health checks, security |
| **[TESTING.md](docs/TESTING.md)** | ✅ Тестирование: unit, integration, system tests |
| **[waves/wave-4/README.md](docs/waves/wave-4/README.md)** | 🔐 Отложенный план Auth/Security Phase 2 (backlog) |
| **[TAXONOMY.md](docs/TAXONOMY.md)** | 📚 Классификация предметов и модулей платформы |
| **[ADD-NEW-SUBJECT-PLAYBOOK.md](docs/ADD-NEW-SUBJECT-PLAYBOOK.md)** | ➕ Playbook для добавления нового предмета |

Дополнительно по backend-структуре: **[backend/README.md](backend/README.md)**.

**Не рекомендуется** трогать архаичные docs (удалены).

