import markdown2
import os


def generate_html_guide(markdown_file="README.md", output_file="docs/user_guide.html"):
    if not os.path.exists(markdown_file):
        print(f"Error: Markdown file '{markdown_file}' not found.")
        return

    try:
        with open(markdown_file, 'r', encoding='utf-8') as f:
            markdown_content = f.read()

        html_content = markdown2.markdown(markdown_content, extras=["fenced-code-blocks", "tables"])

        html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discrete Math Calculator - User Guide</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body {{ font-family: 'Roboto', sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: auto; }}
        h1, h2, h3 {{ color: #333; }}
        code {{ background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; }}
        pre code {{ display: block; background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }}
        table {{ border-collapse: collapse; width: 100%; margin-bottom: 1em; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <nav class="top-nav">
        <div class="nav-brand">
            <i class="fas fa-calculator"></i>
            <span>DMC</span>
        </div>
        <div class="nav-links">
            <a href="/combinatorics" class="nav-item" title="Combinatorics">
                <i class="fas fa-cube"></i>
            </a>
            <a href="/probability" class="nav-item" title="Probability">
                <i class="fas fa-dice"></i>
            </a>
            <a href="/graph-theory" class="nav-item" title="Graph Theory">
                <i class="fas fa-project-diagram"></i>
            </a>
            <a href="/automata" class="nav-item" title="Automata">
                <i class="fas fa-cogs"></i>
            </a>
            <a href="/set-theory" class="nav-item" title="Set Theory">
                <i class="fas fa-object-group"></i>
            </a>
            <a href="/number-theory" class="nav-item" title="Number Theory">
                <i class="fas fa-hashtag"></i>
            </a>
            <a href="/logic" class="nav-item" title="Logic">
                <i class="fas fa-brain"></i>
            </a>
        </div>
    </nav>
    <h1>Discrete Math Calculator - User Guide</h1>
    {html_content}
</body>
</html>
"""

        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_template)

        print(f"HTML user guide generated successfully: {output_file}")

    except Exception as e:
        print(f"Error generating HTML guide: {e}")


if __name__ == "__main__":
    generate_html_guide()
