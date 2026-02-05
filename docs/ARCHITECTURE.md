# 🏗️ Архитектура проекта DMC

## 📁 Структура проекта

```
dmc/
├── core/              # Ядро DMC - математическая логика
│   ├── combinatorics/
│   ├── automata/
│   ├── graph_theory/
│   ├── set_theory/
│   ├── logic/
│   ├── number_theory/
│   ├── discrete_probability/
│   ├── algebraic_structures/
│   └── functions_relations/
│
├── api/               # REST API endpoints
│   ├── routes/        # API маршруты
│   ├── schemas/       # Marshmallow схемы
│   ├── middleware/    # Auth, CORS, etc.
│   └── __init__.py
│
├── web/               # Frontend (Flask templates + JS)
│   ├── templates/     # HTML шаблоны
│   ├── static/        # CSS, JS, images
│   ├── routes.py      # Web routes (рендеринг страниц)
│   └── __init__.py
│
├── ai/                # AI интеграция
│   ├── chatbot.py     # AI чатбот логика
│   ├── vision.py      # Обработка изображений
│   ├── prompts/       # Промпты для AI
│   └── __init__.py
│
├── db/                # База данных
│   ├── models/        # SQLAlchemy модели
│   ├── migrations/    # Alembic миграции
│   └── __init__.py
│
├── utils/             # Утилиты (общие)
│   ├── config.py
│   ├── validation.py
│   └── ...
│
├── web_app.py         # Главный Flask app (пока здесь)
├── requirements.txt
└── .env
```

## 🔄 План миграции

### Этап 1: Создание структуры ✅
- [x] Создать папки core/, api/, web/, ai/, db/
- [x] Создать __init__.py файлы

### Этап 2: Перемещение core логики
- [ ] Переместить все математические модули в core/
- [ ] Обновить импорты в web_app.py

### Этап 3: Выделение API
- [ ] Создать api/routes/ с отдельными файлами для каждого endpoint
- [ ] Вынести схемы в api/schemas/
- [ ] Обновить web_app.py для использования api routes

### Этап 4: Реорганизация web
- [ ] Переместить templates/ и static/ в web/
- [ ] Создать web/routes.py для web страниц
- [ ] Обновить пути в Flask app

### Этап 5: Выделение AI
- [ ] Переместить AI логику из web_app.py в ai/chatbot.py
- [ ] Создать ai/vision.py для обработки изображений

### Этап 6: База данных
- [ ] Создать db/models/ для будущих моделей
- [ ] Настроить Alembic для миграций

## 📝 Правила импортов

```python
# ✅ Правильно
from core.combinatorics.basic import factorial
from api.routes.set_theory import set_theory_bp
from web.routes import web_bp
from ai.chatbot import ChatbotService

# ❌ Неправильно
from combinatorics.basic import factorial  # Старый способ
```

## 🎯 Принципы

1. **Разделение ответственности**: каждый модуль отвечает за свою область
2. **Обратная совместимость**: старые импорты работают через __init__.py
3. **Постепенная миграция**: не ломаем существующий код
4. **Документация**: каждый модуль имеет README
