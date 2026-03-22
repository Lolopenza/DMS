.PHONY: up down restart build logs ps clean test-python test-java rag-eval help

PYTHON ?= $(if $(wildcard math-engine/venv/bin/python),$(CURDIR)/math-engine/venv/bin/python,python3)
RAG_EVAL_MIN_PRECISION ?= 0.70

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
	cd math-engine && "$(PYTHON)" app.py

run-backend:
	cd backend && mvn spring-boot:run

# ── Тесты ─────────────────────────────────────────────────────────────────────

test-python:
	cd math-engine && "$(PYTHON)" -m pytest tests/ -v --tb=short

test-java:
	cd backend && mvn test

test:
	make test-python
	make test-java

rag-eval:
	cd math-engine && PYTHONPATH=.. "$(PYTHON)" -m dmc_ai.rag.eval --k 3 --min-precision $(RAG_EVAL_MIN_PRECISION) --output reports/rag_eval_report.json

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
	@echo "  make run-backend  — java backend локально через Maven (без docker)"
	@echo "  make test         — запустить все тесты"
	@echo "  make rag-eval     — запустить RAG eval (precision@k) + quality gate, отчёт в math-engine/reports/"
	@echo "  make clean        — удалить контейнеры, volumes, кеш"
	@echo ""
