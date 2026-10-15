# UR Driver's Delight — Guidelines

## Components

The design system exports these components — import them from `@ws-63d3a351e6d238772733/7a5fdc80-bcab-4df0-9bdc-e236b0c31514` and compose them before building anything from scratch:

`Constants`, `LanguageContext`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-63d3a351e6d238772733/7a5fdc80-bcab-4df0-9bdc-e236b0c31514/styles.css` (source — preferred import)
- `@ws-63d3a351e6d238772733/7a5fdc80-bcab-4df0-9bdc-e236b0c31514/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

