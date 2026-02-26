# Specification

## Summary
**Goal:** Fix the missing "Add Team Member" button so it is visible and functional for admin users on both the Team Members page and the Admin Dashboard.

**Planned changes:**
- Restore the "Add Team Member" button in the Team Members page header/toolbar so it is visible to admin users and opens the AddUserModal when clicked
- Audit and fix the Admin Dashboard team members tab to ensure the "Add Team Member" action is also present and correctly invokes the AddUserModal
- Resolve any missing conditions, broken imports, or incorrect conditional rendering that caused the button to be hidden

**User-visible outcome:** Admin users can see and click the "Add Team Member" button on both the Team Members page and the Admin Dashboard team members tab, open the modal, and successfully add new team members.
