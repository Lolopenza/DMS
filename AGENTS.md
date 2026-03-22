# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

DMC (Discrete Math Calculator) is a 3-tier web application:

| Service | Tech | Port | Run command |
|---------|------|------|-------------|
| **Frontend** | React 18 + Vite + Tailwind | 3000 | `cd frontend && npx vite --host 0.0.0.0` |
| **Backend** | Spring Boot 3.2.5, Java 21, Maven | 8080 | See below |
| **Math Engine** | FastAPI + Uvicorn, Python | 8081 | `cd math-engine && python3 app.py` |

Infrastructure (via Docker Compose): PostgreSQL 16 (:5432), Redis 7 (:6379), RabbitMQ 3.13 (:5672).

### Starting infrastructure

```bash
cd /workspace && docker compose up -d postgres redis rabbitmq
```

Wait for healthy status before starting application services.

### Starting the backend

The backend needs environment variables for database, Redis, RabbitMQ, and JWT config. Always run `mvn clean` first if migrations have changed (stale Flyway migration files in `target/` cause version conflicts).

```bash
cd /workspace/backend && \
SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/dmc_db" \
SPRING_DATASOURCE_USERNAME=dmc_user \
SPRING_DATASOURCE_PASSWORD=1234 \
SPRING_REDIS_HOST=localhost \
SPRING_REDIS_PORT=6379 \
SPRING_RABBITMQ_HOST=localhost \
SPRING_RABBITMQ_PORT=5672 \
SPRING_RABBITMQ_USERNAME=dmc_rabbit \
SPRING_RABBITMQ_PASSWORD=guest \
DMC_MATH_ENGINE_URL=http://localhost:8081 \
DMC_JWT_SECRET=change-me-to-a-long-random-string-at-least-64-chars-long-here \
DMC_JWT_EXPIRATION_MS=86400000 \
mvn spring-boot:run -DskipTests -B
```

### Gotchas

- **Flyway migration conflicts**: If you see "Found more than one migration with version N", run `mvn clean` in the backend directory. This happens when stale migration files remain in `target/classes/db/migration/`.
- **Frontend node_modules**: The repo has a partial `node_modules` checked in. If Vite fails with `ERR_MODULE_NOT_FOUND`, delete `node_modules` and run `npm install` again.
- **`.env` file**: Copy `.env.example` to `.env` and change Docker hostnames (`postgres`, `redis`, `rabbitmq`, `math-engine`) to `localhost` for local dev.
- **Python PATH**: pip installs to `~/.local/bin` — ensure it's on PATH.
- **Math engine APIs** use trailing slashes (FastAPI redirects 307 without them). The Vite proxy handles this transparently for the frontend.
- **No backend tests**: The backend has only the main application class (no business logic code yet), so there are no test files. The Makefile's `test-java` target references `./gradlew test` but the project uses Maven.

### Testing

- **Math engine**: `cd math-engine && python3 -m pytest tests/ -v` (88 tests)
- **Lint**: `cd math-engine && python3 -m flake8 --max-line-length=120`
- **Backend build**: `cd backend && mvn clean compile -DskipTests -B`
