# Math Lab Platform

Adaptive learning platform для IT-студентов по математике с AI-генерацией задач, интеллектуальной проверкой ответов и персонализированным обучением.

## Архитектура

```
Frontend (React/Vite)
    |
    Nginx (reverse proxy)
    ├── /api/*    → Backend (Spring Boot)
    └── /api/v1/* → Math Engine (FastAPI)

Backend ←→ Math Engine (двусторонняя связь):
  Backend → Math Engine: генерация задач, верификация ответов
  Math Engine → Backend: BKT-аналитика для learning feedback
```

### Компоненты и порты

| Компонент | Стек | Порт | Описание |
|-----------|------|------|----------|
| **frontend** | React + Vite | 3000 | UI: калькуляторы, чат, практика, аналитика |
| **backend** | Spring Boot (Java 21) | 8080 | Auth, BKT, курсы, аналитика, геймификация |
| **math-engine** | FastAPI (Python) | 8081 | Вычисления, AI-генерация задач, чат-бот |
| **dmc_ai** | Python-пакет | — | LLM-интеграция: Gemini/Groq, RAG pipeline |
| **postgres** | PostgreSQL 16 | 5432 | База данных (internal) |
| **redis** | Redis | 6379 | Кеш (internal) |
| **rabbitmq** | RabbitMQ | 5672/15672 | Message broker (internal) |

## Ключевые фичи

### AI-интеграция

- **AI Chatbot** — математический тьютор на базе Google Gemini с fallback на Groq (LLaMA 3.3 70B). Поддержка мультимодальности (фото задач). RAG-pipeline обогащает контекст образовательными материалами.
- **AI Problem Generation** — генерация задач в реальном времени по трём типам:
  - *Math* — задачи по дискретной математике с символьными выражениями
  - *Code Practice* — coding-задачи в стиле LeetCode (sorting, searching, recursion)
  - *Code-to-Math (Math Bug Hunter)* — анализ кода: студент определяет Big-O или рекуррентное соотношение
- **AI Verification** — трёхуровневая проверка ответов:
  - Символьная (SymPy) — `simplify(expected - candidate) == 0`
  - LLM Code Judge — AI-ревью кода без запуска
  - LLM Semantic Judge — AI-оценка правильности ответа
- **AI Learning Feedback** — персонализированный мотивирующий фидбек по результатам BKT-аналитики
- **Career Tracks** — контекстуализация задач под профессию: Backend Architect, Data Scientist, Game Developer

### Backend-модули

- **Auth** — JWT-аутентификация (access + refresh), сессии, сброс пароля, login lockout
- **BKT (Bayesian Knowledge Tracing)** — адаптивная оценка знаний по модели Corbett-Anderson (1994) с difficulty-зависимыми параметрами
- **Learning** — курсы, модули, уроки, прогресс, граф зависимостей, рекомендации
- **Analytics** — BKT-сводки, траектории навыков, экспорт в CSV и Google Colab
- **Gamification** — стрики, daily goals, ачивменты (First Steps, Week Warrior, Mastery King, Colab Analyst)
- **Admin** — управление пользователями, задачами, настройками, статистика
- **Feedback** — отзывы студентов о платформе

### Математические калькуляторы (math-engine)

| Модуль | Операции |
|--------|----------|
| Combinatorics | факториал, перестановки, сочетания, биномиальные коэффициенты, число Каталана |
| Logic | таблицы истинности, эквивалентность, нормальные формы, импликации |
| Set Theory | объединение, пересечение, разность, степень множества, отношения |
| Graph Theory | DFS, BFS, компоненты связности, циклы, Дейкстра, MST Краскала |
| Automata | DFA, NFA, PDA, машины Тьюринга, regex, минимизация, NFA→DFA |
| Number Theory | GCD, LCM, факторизация, Эйлер, RSA, CRT, модулярная арифметика |
| Probability | условная, Байес, биномиальная, Пуассон, гипергеометрическая, Venn |
| Linear Algebra | матрицы, определители, собственные значения, СЛАУ, ортогонализация |
| Algorithms | сортировки, поиск, DP, жадные, divide-and-conquer, графовые |
| Calculus | дифференцирование, интегрирование (через SymPy) |

## Быстрый локальный запуск

### 1. Math Engine

```bash
cd math-engine
python3 -m venv .venv
source .venv/bin/activate    # Linux/macOS
# .venv\Scripts\Activate.ps1 # Windows

pip install -r requirements.txt
python app.py
```

Swagger UI: http://localhost:8081/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Открыть: http://localhost:3000

### 3. Backend (опционально, для auth/BKT/analytics)

```bash
cd backend
mvn spring-boot:run
```

## Docker Compose

```bash
# Development (с hot-reload и всеми портами)
docker-compose up -d

# Production (строгий режим, только nginx на :80)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Development**: http://localhost:3000 (frontend), http://localhost:8081 (math-engine), http://localhost:8080 (backend), http://localhost:15672 (RabbitMQ UI)

**Production**: http://localhost (все сервисы за nginx)

```bash
docker-compose ps          # статус контейнеров
docker-compose logs -f     # логи всех сервисов
docker-compose down        # остановить
```

## Переменные окружения

Корневой `.env` файл (см. `.env.example`):

| Переменная | Назначение |
|------------|-----------|
| `GOOGLE_AI_API_KEY` | Google Gemini API (основной LLM) |
| `GEMINI_MODEL` | Модель Gemini (default: `models/gemini-2.0-flash`) |
| `GROQ_API_KEY` | Groq API (fallback LLM) |
| `GROQ_MODEL` | Модель Groq (default: `llama-3.3-70b-versatile`) |
| `JWT_SECRET` | Секрет для JWT-токенов (мин. 64 символа) |
| `JWT_EXPIRATION_MS` | Время жизни access-токена |
| `MATH_ENGINE_URL` | URL math-engine для backend |
| `MATH_ENGINE_API_KEY` | Внутренний ключ между сервисами |
| `POSTGRES_*` | Настройки PostgreSQL |
| `REDIS_*` | Настройки Redis |
| `RABBITMQ_*` | Настройки RabbitMQ |

## Тестирование

```bash
make test              # все тесты (Python + Java)
make test-python       # unit/integration тесты math-engine
make test-java         # unit/integration тесты backend
make rag-eval          # RAG precision@k evaluation
```

## Makefile-команды

```bash
make up                # docker-compose up -d
make down              # docker-compose down
make build             # пересобрать образы
make logs              # логи всех сервисов
make run-math          # math-engine локально
make run-backend       # backend локально через Maven
make clean             # удалить контейнеры, volumes, кеш
```

## Типичные проблемы

- **Ошибки CORS/404**: убедитесь, что math-engine запущен на `8081`, фронт на `3000`.
- **Не работает чат**: проверьте `GOOGLE_AI_API_KEY` (или `GROQ_API_KEY` для fallback).
- **401/403 от backend**: проверьте `JWT_SECRET` и что токен передаётся в Authorization header или cookie.

Дополнительно по backend-структуре: [backend/README.md](backend/README.md).
