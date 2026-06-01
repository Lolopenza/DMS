import os, glob

d = r'c:\Programming\math-lab\DMS\frontend\src\pages\subjects\discrete-math\api'
old_str = "const MATH_ENGINE_BASE = '/api/calculator';"
new_str = "const MATH_ENGINE_BASE = (import.meta.env.VITE_API_BASE_URL || '/api') + '/calculator';"

for f in glob.glob(d + '/*.js'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed {f}")
