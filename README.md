# Shift Master

Restaurant Management & Task Management Platform

Complete Product Specification for Lovable

Build a professional, scalable, mobile-friendly and web-based task management platform for restaurant managers.

The application must be designed specifically for restaurant operations across multiple branches and multiple manager shifts.

The entire application UI must be English only.

The system must support:

Web.

Mobile responsive design.

Offline usage.

Automatic synchronization when internet returns.

Multiple branches.

Multiple managers.

Different shifts.

Role-based permissions.

Recurring tasks.

One-time tasks.

Temporary tasks.

Private management tasks.

Task assignments.

Before/After task photos.

Notifications and reminders.

Shift handover.

Reporting and audit history.



1. Main Objective

The application should prevent restaurant managers from forgetting operational responsibilities.

Every manager should be able to open the application and immediately understand:

What tasks do I have?

What is high priority?

What is overdue?

What needs to be checked now?

What tasks are assigned specifically to me?

What tasks belong to my current shift?

What tasks have already been completed?

What tasks need to be handed over to the next shift?

The application should be more than a simple To-Do List.

It should connect:

Branch → User → Role → Shift → Section → Task → Assignment → Priority → Schedule → Reminder → Completion → History → Handover



2. Authentication / Login

When the application opens, show a Login screen.

Login fields:

Branch Number

Employee Number

After login, the system automatically identifies:

Employee name.

Employee number.

Branch.

Role.

Permissions.

Assigned shift.

Tasks assigned to the user.

General branch tasks.

Management tasks visible to that user.

Every important action must be recorded.

Example:

Completed by Hashem
Completed at 06:17 AM



3. User Roles

Support multiple roles.

Area Manager

Can:

Manage multiple branches.

Create tasks for Branch Managers.

Monitor task completion across branches.

View management tasks.

View reports.

View task history.

Manage permissions according to configured access.

Branch Manager

Can:

Manage their branch.

View branch managers/users according to permissions.

Create tasks.

Assign tasks to specific managers.

Create recurring tasks.

Manage branch sections.

Monitor task completion.

View shift handovers.

View reports.

Shift Manager

Can:

View tasks assigned to their shift.

Complete assigned tasks.

Create or assign tasks if permission is enabled.

Hand over pending tasks to the next shift.

Permissions must be configurable rather than permanently hard-coded.



4. Management-Only Tasks

Create a separate task visibility level called:

Management Tasks

These tasks are intended for Area Managers and Branch Managers.

Regular employees must NOT see these tasks.

Example:

Area Manager creates:

“Inspect Branch 123 equipment issue and send update.”

Assigned to:
Branch Manager

The Area Manager can see:

Assigned branch.

Assigned manager.

Task status.

Due date.

Completion date.

Completed by.

Notes.

Before/After photos.

Branch Managers can see management tasks assigned to them.

Depending on permissions, Branch Managers may also be able to see management tasks assigned by the Area Manager to other branches, but they must not be able to modify or complete another manager’s task.

This visibility must be controlled through permissions.



5. Dashboard

After login, show a clean Dashboard.

Main sections:

Daily Tasks

Weekly Tasks

Monthly Tasks

Month End

QA

Finance

Training

PPFV

Custom Sections

Each section should appear as a dashboard card.

Example:

DAILY TASKS
12 Pending

QA
4 Pending

FINANCE
2 Pending

Cards should also be able to show:

Pending count.

Overdue count.

Completed count.



6. Custom Sections

The predefined sections are:

Daily Tasks

Weekly Tasks

Monthly Tasks

Month End

QA

Finance

Training

PPFV

However, the system must allow authorized users to create additional sections.

Example:

+ Add Section

The user can define:

Section name.

Icon.

Color.

Visibility.

Order.

Possible future sections:

Safety

Maintenance

Operations

Security

Inventory

The application must never require code changes just because management wants to create a new section.



7. Task Creation

Provide a clear:

+ Add Task

button.

Task fields:

Task Name.

Description.

Section.

Priority.

Assigned To.

Assigned Shift.

Branch.

Start Date.

End Date.

Due Time, if applicable.

Repeat Frequency.

Reminder Interval.

One-Time / Recurring.

Temporary Task toggle.

Notes.

Attachments.

Photos.



8. Priority

Every task has:

HIGH

MEDIUM

LOW

Task ordering must prioritize:

High → Medium → Low

Overdue high-priority tasks should appear above normal tasks.



9. Task Status

Use:

Pending

Task has not been completed.

Completed

Task has been completed.

Overdue

The expected time/date has passed and the task is still incomplete.

Completed tasks must NOT be deleted from the screen.

When completed:

Show a check mark.

Move the task to the bottom of the list.

Keep it visible.

Preserve its history.

Pending and overdue tasks remain above completed tasks.



10. Recurring Tasks

Support flexible recurring schedules.

Examples:

Every 30 minutes.

Every hour.

Every 2 hours.

Every 3 hours.

Every 4 hours.

Daily.

Weekly.

Monthly.

Every 2 months.

Every 3 months.

Every 6 months.

Yearly.

Custom frequency.

Example:

Check 3PO Devices

Start:
6:00 AM

Repeat:
Every 3 hours

After completion:
the current occurrence becomes Completed and the next occurrence is generated according to the schedule.



11. Temporary Tasks

A task can have:

Start Date → End Date

Example:

Area Manager says:

“Focus on QA this month because there may be an unexpected visit.”

Create:

QA Focus

Start:
August 1

End:
August 31

Repeat:
Every 3 hours

After August 31:
the task automatically stops generating reminders/occurrences.

This feature must work for any section, including:

QA.

Finance.

Training.

Custom sections.



12. One-Time Tasks

Support tasks that happen only once.

Example:

Collect product from Branch X

Assign to:
Hashem

After completion:

Mark Completed.

Do not generate another occurrence.

Keep the task in history.



13. Task Assignment

Authorized managers can assign a task to:

One specific manager.

Multiple managers.

A specific shift.

All managers in a branch.

Example:

Branch Manager creates:

“Collect stock from Branch X”

Assigned To:
Hashem

Hashem sees:

Assigned to You

There is NO Accept button.

The task is mandatory for the assigned user.

The available action is:

Complete



14. Manager-to-Manager Tasks

A manager can assign a task to another manager when their permission allows it.

Example:

Night Shift Manager creates a task for Morning Shift Manager.

The next manager sees the task when starting their shift.

Display:

Created by.

Assigned to.

Assigned branch.

Assigned shift.

Priority.

Due date.

Status.



15. Task Three-Dot Menu

Every task should have a three-dot menu.

Options:

Edit Task.

Change Priority.

Change Schedule.

Change Repeat Frequency.

Change Reminder.

Change Assigned Person.

Change Assigned Shift.

Move to Another Section.

Duplicate Task.

Pause Task.

Archive Task.

Delete Task.

Deletion requires confirmation.



16. Daily Tasks

Daily Tasks are operational checks performed during shifts.

Examples:

3PO / Third-Party Delivery Devices

Examples:

HungerStation.

Jahez.

Mrsool.

Keeta.

Other third-party delivery systems.

At opening, for example 6:00 AM:

Check:

Device is present.

Device is charging.

Device is charged.

Device is powered on.

Status is Open.

Device can receive orders.

This is a reminder/checking system.

Do NOT build an automatic system-status monitoring feature for these devices.

Example:

Check 3PO Devices

Repeat:
Every 3 hours.



17. ATM / Kiosk / Self-Service Checks

Daily Tasks may include:

Check ATM/self-service equipment.

Check that devices are operational.

Check charging status when applicable.

Check paper availability.

Check for visible issues.

These tasks must be editable and configurable.



18. Cleaning / Restaurant Operational Checks

Daily Tasks can include:

Restaurant cleanliness.

Specific area inspections.

Back Sink inspection.

Soap availability.

Sanitizer availability.

UHC inspection.

UHC Tray inspection.

Check metal parts for damage/bending.

Check Tongs cleanliness.

Other operational checks.

These are examples only.

Management must be able to create additional checks.



19. Weekly Tasks

Weekly Tasks can include:

Weekly inventory/counting.

Stock counting.

Weekly operational checks.

Other recurring weekly responsibilities.

The manager can select the recurring day, for example:

Every Saturday



20. Monthly Tasks

Monthly Tasks can include:

Monthly inventory.

Monthly reports.

Administrative checks.

Operational reviews.

Other monthly requirements.



21. Month End

Month End is a separate section from Monthly Tasks.

Examples:

Close monthly attendance/time records.

Upload attendance records.

Close monthly inventory.

Complete monthly reports.

Complete month-end financial tasks.

Any other month closing requirements.



22. QA

Create a dedicated:

QA — Quality Assurance

section.

Examples:

Inspect equipment legs/supports.

Check for rust.

Paint/treat affected areas.

Inspect UHC trays.

Check damaged metal parts.

Check Tongs.

Inspect cleanliness.

Prepare restaurant for QA visits.

QA tasks may be:

Daily.

Weekly.

Monthly.

Every 6 months.

Yearly.

Temporary.



23. Finance

Create:

Finance

Examples:

Camera checks.

Invoice checks.

Cash checks.

Safe/cash drawer checks.

Gift Cards.

Free Orders.

Other financial checks.

Finance tasks must be fully configurable.



24. Training

Create:

Training

Support:

Training tasks.

Training dates.

Assigned employee.

Completion status.

Notes.

Recurring training when required.



25. PPFV

Create:

PPFV

This section should be configurable according to the company’s official PPFV process.

Tasks may relate to visits, people, performance, or other PPFV requirements.



26. Before / After Photos

Every task should optionally support photos.

Especially for:

QA.

Maintenance.

Equipment issues.

Repairs.

Damage.

Cleaning.

Operational problems.

Support:

Before Photo

Example:
A broken piece of equipment.

Manager uploads a photo showing the problem.

After Photo

After repair, the manager uploads another photo showing the completed repair.

A task can contain:

One Before photo.

Multiple Before photos.

One After photo.

Multiple After photos.

Store:

Photo.

Uploaded by.

Upload date.

Upload time.

Example task:

Repair damaged equipment

Before:
[Photo of damaged equipment]

After:
[Photo of repaired equipment]

Then:

Complete

This provides visual evidence that the task was actually completed.



27. Photo History

Photos must remain attached to the task history.

Do not replace the original Before photo when an After photo is uploaded.

The system must clearly distinguish:

BEFORE

and

AFTER



28. Team Dashboard

Managers with appropriate permissions can see the managers in their branch.

Example:

Jeffrey — Branch Manager

Mustafa

Riyadh

Hashem

Other Managers

Nasser — Annual Leave

Clicking a manager opens a summary:

Assigned Tasks.

Completed Tasks.

Pending Tasks.

Overdue Tasks.

Responsibilities.

Current shift.

Recent activity.

Do not allow unauthorized editing of another manager’s tasks.



29. Area Manager Dashboard

The Area Manager should have a separate management view.

Show:

Branches

For every branch:

Branch name/number.

Branch Manager.

Number of pending tasks.

Number of completed tasks.

Number of overdue tasks.

Management tasks assigned.

Completion percentage.

The Area Manager can drill down:

Area Manager → Branch → Manager → Task



30. Management Task Visibility

Management tasks should have controlled visibility.

Example:

Area Manager assigns:

“Prepare branch for upcoming QA visit.”

To:
Branch 123 Manager.

The Area Manager can track it.

Branch 123 Manager sees it.

Other Branch Managers may see the task only if the Area Manager’s permissions allow cross-branch visibility.

Regular restaurant employees must not see management-only tasks.



31. Task History / Audit Log

Record:

Created by.

Assigned by.

Assigned to.

Edited by.

Completed by.

Completion date.

Completion time.

Branch.

Shift.

Priority.

Status changes.

Photo uploads.

Notes.

Example:

Task:
Check 3PO Devices

Created by:
Jeffrey

Assigned to:
Hashem

Completed by:
Hashem

Completed at:
06:17 AM



32. Shift Management

Support the restaurant’s different shifts.

Current shift structures include:

6 AM → 3 PM

Breakfast / Opening shift.

This shift may have overtime.

If overtime is selected:
6 AM → 6 PM.

9 AM → 6 PM

12 PM → 9 PM

No overtime question for this shift according to the current operating rule.

6 PM → 6 AM

This is a fixed 12-hour shift and does not ask whether the manager wants overtime.

9 PM → 6 AM

This is a fixed shift and does not ask about overtime.

Shift rules must be configurable from Settings.



33. Overtime

For the 6 AM → 3 PM shift, the system can ask before the shift ends:

Will you continue working overtime?

Options:

YES

or

NO

If YES:
extend the shift according to the configured overtime duration, for example until 6 PM.

If NO:
start the Shift Handover process.

Do not ask the overtime question for shifts configured as fixed/no-overtime.



34. Shift Handover

Before the manager leaves the shift, show:

Shift Handover

Display:

Completed Tasks.

Pending Tasks.

Overdue Tasks.

One-Time Tasks still incomplete.

Tasks assigned to the next shift.

Notes.

The manager can add notes.

Example:

Handover from Hashem

Pending:

Check stock.

Follow up on delivery device.

Notes:
“Keeta device needs follow-up.”

The next manager sees this information when starting the shift.



35. Task Templates

Support reusable templates.

Examples:

Opening Shift Template.

Closing Shift Template.

Daily Restaurant Template.

QA Visit Preparation Template.

Finance Template.

Month End Template.

A template can be applied to:

One branch.

Multiple branches.

A shift.

Multiple shifts.



36. Search

Provide global task search.

Examples:

Search:
ATM

Shows related ATM tasks.

Search:
QA

Shows QA tasks.



37. Filters

Support:

High.

Medium.

Low.

Pending.

Completed.

Overdue.

Assigned to Me.

Assigned to Others.

Today.

This Week.

This Month.

Management Tasks.



38. Favorites

Allow users to mark tasks as Favorites.

Favorite tasks should be easy to access.



39. Notes

Allow users to add notes to tasks.

Example:

“Paper roll replaced.”

“UHC tray replaced.”

“Equipment repaired.”

Notes must be saved in task history.



40. Reports

Provide statistics for:

Daily completion.

Weekly completion.

Monthly completion.

Overdue tasks.

Completed tasks.

Manager performance.

Branch performance.

Management task completion.

QA completion.

Finance completion.



41. Offline Mode

The application must continue working when there is no internet.

Offline users can:

View cached tasks.

Complete tasks.

Add notes.

Add photos.

Create tasks if authorized.

Edit tasks if authorized.

When internet returns:
automatically synchronize changes.

Do not lose data.

Implement conflict handling for cases where multiple users modify the same task while offline.



42. Notifications

Support reminders based on task configuration.

Examples:

Every 30 minutes.

Every hour.

Every 3 hours.

Daily.

Weekly.

Monthly.

Notifications can appear:

Inside the application.

As mobile push notifications.

Notification settings must be configurable.



43. Overdue Tasks

When a task passes its expected time without completion:

Mark it Overdue.

Keep it visible.

Place it high in the task list.

Show an attention indicator.

Do not delete it.

After completion:
move it to Completed.



44. Recurring Task Architecture

Separate:

Task Definition

from

Task Occurrence

Example:

Task Definition:
Check 3PO Devices

Occurrences:

6:00 AM.

9:00 AM.

12:00 PM.

3:00 PM.

Each occurrence must have its own:

Status.

Completion time.

Completed by.

Notes.

Photos if applicable.

This is important for accurate reporting and audit history.



45. Settings / Administration

Create an Administration / Settings area.

Authorized users can manage:

Users.

Branches.

Roles.

Permissions.

Shifts.

Overtime rules.

Sections.

Tasks.

Templates.

Notifications.

Recurring schedules.

Archive.

System settings.



46. Multiple Branches

The application must support multiple restaurants/branches.

Each branch has its own:

Managers.

Users.

Shifts.

Tasks.

Sections.

Templates.

Reports.

Management tasks.

Data must be properly isolated by branch while still allowing Area Managers to manage multiple branches.



47. Copy Tasks Between Branches

Authorized users can copy tasks/templates from one branch to another.

Example:

A strong QA checklist created in Branch A can be copied to Branch B, C and D.



48. Archive

Use Archive instead of immediately deleting historical tasks.

Archived tasks remain available for:

History.

Reports.

Audits.

Permanent deletion should require appropriate permission and confirmation.



49. English-Only Interface

The entire application interface must be in English.

Examples:

Login

Dashboard

Daily Tasks

Weekly Tasks

Monthly Tasks

Month End

QA

Finance

Training

PPFV

Settings

Users

Branches

Shifts

Tasks

Complete

Pending

Overdue

Completed

Assigned to You

Shift Handover

Reports

Notifications

Do not create Arabic UI labels.

User-created task names, notes and descriptions may contain any language.



50. UI / UX

The interface should be modern, clean and extremely easy to use during restaurant operations.

Prioritize:

Speed.

Large touch-friendly controls.

Clear task status.

Clear priority.

Minimal clicks.

Fast task completion.

Strong visual hierarchy.

Dashboard should use cards.

Task lists should clearly separate:

ACTIVE / PENDING

from

COMPLETED

Completed tasks remain visible but are moved below active tasks.



51. Task Ordering

Recommended order:

High + Overdue

High

Medium + Overdue

Medium

Low + Overdue

Low

Completed

Within the same priority, sort by due time/date.



52. Add Task UX

The Add Task screen should be simple.

Required flow:

+ Add Task

→ Task Name
→ Section
→ Priority
→ Assign To
→ Shift
→ Start Date
→ End Date
→ Repeat
→ Reminder
→ Photos/Attachments
→ Save

Advanced settings can be hidden under:

Advanced Options



53. Database / Architecture

Design the backend and database for scalability.

Recommended conceptual entities:

Users

Roles

Permissions

Branches

Shifts

Sections

Tasks

Task Occurrences

Task Assignments

Task Comments/Notes

Task Photos

Task Attachments

Task History

Notifications

Shift Handovers

Templates

Branch Settings

Overtime Rules

Use proper relationships and indexes.

Do not hard-code restaurant-specific tasks into the application logic.



54. Security

Implement proper role-based access control.

Users must only be able to perform actions allowed by their role and permissions.

Important examples:

Regular employees cannot access management-only tasks.

A manager cannot modify another manager’s task unless authorized.

Branch Managers should only manage their own branch unless granted cross-branch access.

Area Managers can access authorized branches.

Sensitive management information must not be visible to unauthorized users.



55. Final Product Philosophy

The application should feel like a digital operating system for restaurant managers.

When a manager starts a shift, the app should immediately answer:

“What do I need to do now?”

When a manager finishes a shift, the app should answer:

“What did I complete, and what still needs to be handed over?”

When an Area Manager checks the branches, the app should answer:

“Which manager has which responsibilities, what has been completed, and what is still outstanding?”

For maintenance/QA issues, the app should answer:

“What was wrong, who was responsible, and where is the Before/After evidence?”

The system must remain flexible enough that management can create new sections, tasks, schedules, users, branches and workflows without requiring developers to change the application code.

Build the product with a production-ready architecture and clean UX, not as a simple prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ad1f09cd-2781-4c3b-ae27-665e4ae196b4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
