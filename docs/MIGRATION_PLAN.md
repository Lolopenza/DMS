# 🔄 План миграции проекта

## Текущий статус: Этап 1 ✅

Структура создана, начинаем постепенную миграцию.

## Этап 2: Перемещение core логики (Следующий)

### Шаг 1: Переместить математические модули
```bash
# Эти папки уже существуют, нужно их переместить в core/
mv combinatorics core/
mv automata core/
mv graph_theory core/
mv set_theory core/
mv logic core/
mv number_theory core/
mv discrete_probability core/
mv algebraic_structures core/
mv functions_relations core/
```

### Шаг 2: Обновить импорты
- В `web_app.py` заменить:
  - `from combinatorics.basic import ...` → `from core.combinatorics.basic import ...`
  - И так далее для всех модулей

### Шаг 3: Создать обратную совместимость
- В `core/__init__.py` добавить реэкспорты для старых импортов

## Этап 3: Выделение AI (Параллельно)

### Шаг 1: Создать ai/chatbot.py
- Вынести логику из `web_app.py` route `/api/chatbot`
- Создать класс `ChatbotService`

### Шаг 2: Создать ai/vision.py
- Вынести обработку изображений
- Поддержка разных моделей

## Этап 4: Выделение API routes

### Шаг 1: Создать api/routes/set_theory.py
- Вынести `/api/set_theory` endpoint

### Шаг 2: Повторить для всех endpoints
- combinatorics, probability, graph_theory, etc.

## Этап 5: Реорганизация web

### Шаг 1: Переместить templates и static
```bash
mv templates web/
mv static web/
```

### Шаг 2: Обновить пути в Flask
- Изменить `template_folder` и `static_folder`

## Порядок выполнения

1. ✅ Создать структуру папок
2. ⏳ Переместить core модули
3. ⏳ Выделить AI логику
4. ⏳ Выделить API routes
5. ⏳ Реорганизовать web

## ⚠️ Важно

- Не ломать существующий код
- Тестировать после каждого шага
- Коммитить изменения постепенно
