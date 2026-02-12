# Discrete Math Calculator (DMC)

Веб-приложение для дискретной математики: комбинаторика, автоматы, графы, теория множеств, логика, теория чисел, вероятность, AI-чатбот.

## Запуск

```bash
# Виртуальное окружение (один раз)
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Зависимости
pip install -r requirements.txt

# Переменные окружения: создайте .env в корне проекта
# OPENROUTER_API_KEY=sk-or-v1-...   — для чатбота (бесплатные модели: google/gemma-3-12b-it:free)
# FLASK_SECRET_KEY=любая-строка     — для session (опционально)

# Запуск
python web_app.py
```

Откройте http://127.0.0.1:5000/

## Структура проекта

| Папка | Назначение |
|-------|------------|
| **core/** | Математика: combinatorics, automata, graph_theory, set_theory, logic, number_theory, discrete_probability, algebraic_structures, functions_relations, visualization |
| **web/** | Фронт: `templates/` (HTML), `static/` (CSS, JS) |
| **ai/** | Чатбот (OpenRouter) |
| **api/** | Заготовка под отдельные API-роуты (сейчас всё в web_app) |
| **utils/** | Общие утилиты |
| **mcp_server/** | Отдельный MCP-сервис |
| **scripts/** | Проверка API-ключа, зависимостей; скрипты запуска под Windows |

Точка входа — **web_app.py**: раздаёт страницы, статику и обрабатывает все `POST /api/...` (расчёты и чатбот). Состояние только в Flask session (именованные множества в Set Theory).

## Скрипты (по желанию)

- `python scripts/check_api_key.py` — проверить OpenRouter API key
- `python scripts/check_dependencies.py` — проверить установленные пакеты
- `scripts/run_app.ps1`, `scripts/run.ps1` — запуск под Windows

## Требования

См. `requirements.txt`. Основное: Flask, SymPy, NumPy, Matplotlib, NetworkX, python-dotenv, marshmallow, easyocr, openai (для OpenRouter).
