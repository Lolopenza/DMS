#!/usr/bin/env python3
"""
Скрипт для миграции core модулей в новую структуру
"""
import os
import shutil
from pathlib import Path

# Модули для перемещения в core/
CORE_MODULES = [
    'combinatorics',
    'automata',
    'graph_theory',
    'set_theory',
    'logic',
    'number_theory',
    'discrete_probability',
    'algebraic_structures',
    'functions_relations',
]

def migrate_core_modules():
    """Перемещает модули в core/"""
    project_root = Path(__file__).parent
    
    print("🔄 Начинаем миграцию core модулей...")
    
    for module in CORE_MODULES:
        src = project_root / module
        dst = project_root / 'core' / module
        
        if src.exists() and src.is_dir():
            if dst.exists():
                print(f"⚠️  {module} уже существует в core/, пропускаем...")
            else:
                print(f"📦 Перемещаем {module} → core/{module}")
                shutil.move(str(src), str(dst))
                print(f"✅ {module} перемещен")
        else:
            print(f"⚠️  {module} не найден, пропускаем...")
    
    print("\n✅ Миграция core модулей завершена!")
    print("\n📝 Следующие шаги:")
    print("1. Обновите импорты в web_app.py")
    print("2. Запустите: python update_imports.py")
    print("3. Протестируйте приложение")

if __name__ == '__main__':
    migrate_core_modules()
