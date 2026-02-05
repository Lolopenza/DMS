# 🎯 Новая структура проекта

## ✅ Что уже сделано

1. **Создана структура папок:**
   - `core/` - математическая логика
   - `api/` - REST API endpoints
   - `web/` - Frontend (templates + static)
   - `ai/` - AI интеграция
   - `db/` - База данных (готово к использованию)

2. **Созданы базовые файлы:**
   - `ARCHITECTURE.md` - описание архитектуры
   - `MIGRATION_PLAN.md` - план миграции
   - `migrate_core.py` - скрипт для миграции модулей
   - `update_imports.py` - скрипт для обновления импортов
   - `ai/chatbot.py` - сервис для AI чатбота

## 🚀 Следующие шаги

### Вариант 1: Быстрая миграция (рекомендуется)
```bash
# 1. Переместить core модули
python migrate_core.py

# 2. Обновить импорты
python update_imports.py

# 3. Протестировать
python web_app.py
```

### Вариант 2: Постепенная миграция
1. Начать с одного модуля (например, `combinatorics`)
2. Переместить его в `core/`
3. Обновить импорты
4. Протестировать
5. Повторить для остальных

## 📝 Как использовать новую структуру

### Импорты из core:
```python
from core.combinatorics.basic import factorial
from core.automata.dfa import DFA
from core.graph_theory.basics import Graph
```

### Использование AI сервиса:
```python
from ai.chatbot import get_chatbot_service

chatbot = get_chatbot_service()
result = chatbot.chat([
    {'role': 'user', 'content': 'Hello!'}
])
```

### API routes (будут добавлены):
```python
from api.routes.set_theory import set_theory_bp
app.register_blueprint(set_theory_bp)
```

## ⚠️ Важно

- Старые импорты пока работают (обратная совместимость)
- Миграция постепенная - не ломаем существующий код
- Тестируем после каждого шага

## 📚 Документация

- `ARCHITECTURE.md` - полное описание архитектуры
- `MIGRATION_PLAN.md` - детальный план миграции
- `QUICKSTART.md` - как запустить проект
