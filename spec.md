# Specification

## Summary
**Goal:** Fix the Reminders dropdown panel overlap with toolbar elements and improve color contrast throughout the application.

**Planned changes:**
- Reposition the Reminders dropdown panel so it opens below the notification bell icon without overlapping the Export button or the date filter buttons (This Week, This Month, Custom)
- Ensure proper z-index layering so all toolbar controls remain fully visible and accessible when the Reminders panel is open
- Fix the Done column header so its text and icon are clearly readable against the dark green background
- Improve contrast between task card backgrounds and body text (title, description, assignee names, date text) in all columns
- Ensure status badge labels (To Do, In Progress, Done) have sufficient contrast between text and badge background colors
- Ensure column count badge numerals are readable against their background
- Fix all body text throughout the app to meet a minimum contrast ratio of 4.5:1 against its background

**User-visible outcome:** The Reminders panel no longer covers toolbar controls, and all text throughout the app is clearly readable with proper contrast against its background.
