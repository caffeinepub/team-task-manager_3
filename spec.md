# Specification

## Summary
**Goal:** Fix invisible text in light mode and update dark mode accent colors to a teal color scheme.

**Planned changes:**
- In light mode, update all text colors (headings, body, labels, stat values, sidebar links, card text, etc.) to dark near-black values (e.g., #111827) so they are readable on white/light backgrounds
- Update CSS custom properties for foreground, card text, muted text, and sidebar text in the light theme to use dark values
- In dark mode, replace all purple/violet/orange accent colors with teal shades (teal-400 #2dd4bf, teal-500 #14b8a6, teal-600 #0d9488)
- Apply teal accents to: active sidebar highlight, primary action buttons (e.g., "+ New Task"), progress bars, badges, icons, chart accents, and active nav indicators
- Define teal accent CSS variables for the dark theme
- Preserve the dark near-black background in dark mode

**User-visible outcome:** In light mode, all text is clearly visible and readable. In dark mode, the application uses a teal accent color scheme instead of purple/orange, while keeping the dark background intact.
