# Specification

## Summary
**Goal:** Extend TaskFlow with a "Carry Forward" task status, a Team Members view in the Admin Dashboard, carry-forward notifications, and custom date-range report exports.

**Planned changes:**
- Add `#CarryForward` as a new task status variant in the Motoko backend; update `updateTaskStatus`, `getAllTasks`, and `getTasksByAssignee` to support it.
- Add a "Team Members" section to the Admin Dashboard listing all team members as clickable cards; expanding a card shows all tasks assigned to that person sorted by deadline then priority, plus a status summary (Pending, In Progress, Completed, Carry Forward counts).
- Add "Carry Forward" as a selectable status in TaskCard and TaskStatusControl dropdowns with a distinct purple/indigo color badge.
- Add carry-forward task reminders to the NotificationBell panel, labeled "Carry Forward — needs attention", evaluated on page load and every 5 minutes.
- Enhance the Report Download UI in the Admin Dashboard with a custom date-range picker (start date, end date) and an "Export Custom Range" button that exports a CSV filtered by deadline range with a filename reflecting the selected dates.

**User-visible outcome:** Admins can view per-member task summaries, mark tasks as "Carry Forward," receive in-app reminders for carry-forward tasks, and download task reports for any custom date range.
