# Chapter 5 — Methodology and System Design

> **Placement**: This chapter follows *Chapter 4: Data Collection* in the diploma thesis.
> It covers the engineering methodology, full system architecture, UML models, MVP scope,
> technology stack rationale, and UI mockup descriptions for the DMC platform.

## Files in this directory

| File | Description |
|------|-------------|
| `chapter5-methodology.md` | Full chapter text (academic English, ~5000 words) |
| `diagrams/*.puml` | PlantUML source files for all UML diagrams |
| `mockups/` | Placeholder directory for Figma PNG exports |

## Building UML diagrams

```bash
# Option 1: PlantUML CLI (requires Java)
java -jar plantuml.jar diagrams/*.puml -o ../figures/

# Option 2: PlantUML online
# Paste .puml contents at https://www.plantuml.com/plantuml/uml

# Option 3: VS Code extension
# Install "PlantUML" extension, open .puml, Alt+D to preview
```

## Converting to LaTeX

The chapter text in `chapter5-methodology.md` is structured with LaTeX-compatible
section labels. To convert:

1. Use `pandoc` for initial conversion:
   ```bash
   pandoc chapter5-methodology.md -o chapter5.tex --top-level-division=chapter
   ```
2. Manually adjust `\label{}` and `\ref{}` references.
3. Insert `\includegraphics{}` for exported diagram PNGs.
4. Compile with `pdflatex → bibtex → pdflatex → pdflatex` or `latexmk -pdf`.
