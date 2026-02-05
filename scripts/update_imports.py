#!/usr/bin/env python3
"""
Скрипт для автоматического обновления импортов после миграции
"""
import re
from pathlib import Path

# Маппинг старых импортов на новые
IMPORT_MAPPING = {
    'from automata.': 'from core.automata.',
    'from combinatorics.': 'from core.combinatorics.',
    'from graph_theory.': 'from core.graph_theory.',
    'from set_theory.': 'from core.set_theory.',
    'from logic.': 'from core.logic.',
    'from number_theory.': 'from core.number_theory.',
    'from discrete_probability.': 'from core.discrete_probability.',
    'from algebraic_structures.': 'from core.algebraic_structures.',
    'from functions_relations.': 'from core.functions_relations.',
    
    'import automata': 'import core.automata',
    'import combinatorics': 'import core.combinatorics',
    'import graph_theory': 'import core.graph_theory',
    'import set_theory': 'import core.set_theory',
    'import logic': 'import core.logic',
    'import number_theory': 'import core.number_theory',
    'import discrete_probability': 'import core.discrete_probability',
    'import algebraic_structures': 'import core.algebraic_structures',
    'import functions_relations': 'import core.functions_relations',
}

def update_file_imports(file_path):
    """Обновляет импорты в файле"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for old_import, new_import in IMPORT_MAPPING.items():
            content = content.replace(old_import, new_import)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"❌ Ошибка при обработке {file_path}: {e}")
        return False

def find_python_files(directory):
    """Находит все Python файлы в директории"""
    python_files = []
    for file_path in directory.rglob('*.py'):
        # Пропускаем виртуальное окружение и другие служебные папки
        if 'venv' in str(file_path) or '__pycache__' in str(file_path) or '.git' in str(file_path):
            continue
        python_files.append(file_path)
    
    return python_files

if __name__ == '__main__':
    import os
    
    project_root = Path(__file__).parent
    print("🔄 Обновляем импорты...")
    
    # Файлы для обновления
    files_to_update = [
        project_root / 'web_app.py',
        project_root / 'main.py',
        project_root / 'gui.py',
    ]
    
    # Также обновляем все файлы в проекте
    all_python_files = find_python_files(project_root)
    
    updated_count = 0
    for file_path in all_python_files:
        if update_file_imports(file_path):
            print(f"✅ Обновлен: {file_path.relative_to(project_root)}")
            updated_count += 1
    
    print(f"\n✅ Обновлено файлов: {updated_count}")
    print("\n📝 Проверьте изменения и протестируйте приложение!")
