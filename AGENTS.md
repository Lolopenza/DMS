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

The `docker-compose.override.yml` has `mem_limit`/`cpus` resource constraints that cause cgroup errors in Cursor Cloud VMs (nested containers). Use only the base compose file plus `docker-compose.dev-local.yml` for port mappings:

```bash
cd /workspace && docker compose -f docker-compose.yml -f docker-compose.dev-local.yml up -d postgres redis rabbitmq
```

Wait for healthy status before starting application services.

### Starting the backend

The backend's `application.yml` uses these env var names (not the `SPRING_*` prefixed ones): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, `DMC_MATH_ENGINE_URL`, `JWT_SECRET`. Always run `mvn clean` first if migrations have changed.

```bash
cd /workspace/backend && \
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=dmc_db \
DB_USERNAME=dmc_user \
DB_PASSWORD=1234 \
REDIS_HOST=localhost \
REDIS_PORT=6379 \
DMC_MATH_ENGINE_URL=http://localhost:8081 \
JWT_SECRET=change-me-to-a-long-random-string-at-least-64-chars-long-here \
JWT_ACCESS_TTL_SECONDS=86400 \
mvn spring-boot:run -DskipTests -B
```

### Gotchas

- **Backend env var names**: The `application.yml` uses `DB_HOST`, `DB_USERNAME`, etc. — NOT `SPRING_DATASOURCE_*` or `SPRING_REDIS_HOST`. Using the wrong names causes the app to fall back to defaults (e.g., Redis tries to connect to hostname `redis` instead of `localhost`).
- **Docker cgroup errors**: The `docker-compose.override.yml` includes `mem_limit`/`cpus` constraints that cause `unable to apply cgroup configuration` errors in Cursor Cloud VMs (Docker-in-Docker nested containers). Use `docker-compose.dev-local.yml` instead for port mappings without resource limits.
- **Flyway migration conflicts**: If you see "Found more than one migration with version N", run `mvn clean` in the backend directory. This happens when stale migration files remain in `target/classes/db/migration/`.
- **Frontend node_modules**: The repo has a partial `node_modules` checked in. If Vite fails with `ERR_MODULE_NOT_FOUND`, delete `node_modules` and run `npm install` again.
- **`.env` file**: Copy `.env.example` to `.env` and change Docker hostnames (`postgres`, `redis`, `rabbitmq`, `math-engine`) to `localhost` for local dev.
- **Python PATH**: pip installs to `~/.local/bin` — ensure it's on PATH (`export PATH="$HOME/.local/bin:$PATH"`).
- **Math engine APIs** use trailing slashes (FastAPI redirects 307 without them). The Vite proxy handles this transparently for the frontend.
- **No backend tests**: The backend has only the main application class (no business logic code yet), so there are no test files. The Makefile's `test-java` target references `./gradlew test` but the project uses Maven.
- **pytest warning filter**: `math-engine/pytest.ini` has warning filters referencing `pyparsing.exceptions.PyparsingDeprecationWarning` which doesn't exist in newer pyparsing versions. Override with `-o "filterwarnings="` if tests fail on startup.

### Testing

- **Math engine**: `cd math-engine && python3 -m pytest tests/ -v -o "filterwarnings="` (113 tests)
- **Lint**: `cd math-engine && python3 -m flake8 --max-line-length=120`
- **Backend build**: `cd backend && mvn clean compile -DskipTests -B`
