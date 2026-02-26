# Specification

## Summary
**Goal:** Fix the "Add Team Member" modal by removing the permission error that blocks users from adding team members, and ensure the form saves successfully.

**Planned changes:**
- Remove the role-based permission check in the `addTeamMember` backend function so any authenticated user can add team members
- Remove the "You do not have permission to add team members" error banner from the `AddUserModal` frontend component
- Ensure submitting the form correctly calls the backend and saves the new team member

**User-visible outcome:** Users can open the Add Team Member modal, fill in Name, Email ID, and Role fields, and successfully save a new team member without seeing any permission error.
