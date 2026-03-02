.PHONY: up down restart build logs ps clean test-python test-java help

# ── Docker ────────────────────────────────────────────────────────────────────

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

build:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

ps:
	docker-compose ps

# ── Разработка (без Docker) ───────────────────────────────────────────────────

run-math:
	cd math-engine && python app.py

run-backend:
	cd backend && ./gradlew bootRun

# ── Тесты ─────────────────────────────────────────────────────────────────────

test-python:
	cd math-engine && python -m pytest tests/ -v --tb=short

test-java:
	cd backend && ./gradlew test

test:
	make test-python
	make test-java

# ── Утилиты ───────────────────────────────────────────────────────────────────

clean:
	docker-compose down -v --remove-orphans
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true

help:
	@echo ""
	@echo "  make up           — запустить всё (docker-compose up -d)"
	@echo "  make down         — остановить всё"
	@echo "  make build        — пересобрать образы"
	@echo "  make logs         — логи всех сервисов"
	@echo "  make ps           — статус контейнеров"
	@echo "  make run-math     — math-engine локально (без docker)"
	@echo "  make run-backend  — java backend локально (без docker)"
	@echo "  make test         — запустить все тесты"
	@echo "  make clean        — удалить контейнеры, volumes, кеш"
	@echo ""
