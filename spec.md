# Specification

## Summary
**Goal:** Add an optional "Conference Name" text input field to the Create Task modal form.

**Planned changes:**
- Add a "Conference Name" text input field to the Create Task modal, positioned between the task title and description fields
- Update the backend Task data type and `createTask` function to accept and store the optional `conferenceName` field
- Include the Conference Name value in the data submitted when creating a task
- Display the conference name on existing task cards when present
- Add a "Conference Name" column to the CSV export

**User-visible outcome:** Users can optionally enter a conference name when creating a task. If provided, it appears on the task card and is included in CSV exports.
