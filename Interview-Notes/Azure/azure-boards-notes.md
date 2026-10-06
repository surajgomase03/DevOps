# Azure Boards — Detailed Interview Preparation Notes

For a 4.5+ years DevOps interview level, don't think of Azure Boards as just a ticketing tool. Think of it as the **work-management and Agile planning component of Azure DevOps**, connected with code, PRs, pipelines, releases, and teams.

---

## 1. Simple Definition

### In simple words

Azure Boards is used by development and DevOps teams to plan, track, assign, and monitor work.

You can manage:

```
Requirements
User stories
Tasks
Bugs
Features
Epics
Sprints
Backlogs
```

### Interview-ready definition

> "Azure Boards is the work-management component of Azure DevOps used to plan, track, prioritize, and manage software development work using work items, backlogs, boards, sprints, and dashboards."

---

## 2. Why Do We Need Azure Boards?

Imagine a project with:

```
20 Developers
5 DevOps Engineers
3 QA Engineers
2 Product Owners
```

Without proper tracking:

```
Developer → "What should I work on?"
QA        → "Which bug should I test?"
DevOps    → "Which deployment is urgent?"
Manager   → "What is the sprint status?"
```

Azure Boards provides a centralized place to track this.

```
Business Requirement
        ↓
Feature
        ↓
User Story
        ↓
Task
        ↓
Developer
        ↓
Code
        ↓
PR
        ↓
Pipeline
        ↓
Deployment
```

---

## 3. Azure DevOps Services

Remember this architecture:

```
Azure DevOps
                         |
       +-----------------+------------------+
       |                 |                  |
       v                 v                  v
    Boards             Repos            Pipelines
       |                 |                  |
    Work Items          Git             CI/CD
       |
       v
    Planning
```

Other services include:

```
Azure Test Plans
Azure Artifacts
```

### Easy memory trick

```
B-R-P-T-A

B = Boards
R = Repos
P = Pipelines
T = Test Plans
A = Artifacts
```

---

## 4. Azure Boards Main Components

```
Azure Boards
│
├── Work Items
│
├── Backlogs
│
├── Boards
│
├── Sprints
│
├── Queries
│
├── Dashboards
│
└── Delivery Plans
```

---

## 5. Work Item

A work item represents a piece of work that needs to be tracked.

Examples:

```
Bug
Task
User Story
Feature
Epic
```

Example:

```
User Story:
"Deploy Payment Service to AKS"
```

Tasks can then be created:

```
Task 1 → Create Dockerfile
Task 2 → Build Docker image
Task 3 → Push image to ACR
Task 4 → Create Helm chart
Task 5 → Deploy to AKS
```

### UI mockup: creating a work item

Navigation: `Boards → Work Items → + New Work Item → User Story`

```
┌──────────────────────────────────────────────────────────────────┐
│ New User Story                                       [Save] [X]   │
├──────────────────────────────────────────────────────────────────┤
│ Title: Deploy Payment Service to AKS                               │
│                                                                      │
│ State: New ▾        Area: Payments ▾      Iteration: Sprint 4 ▾    │
│ Assigned To: Suraj G ▾     Priority: 2 ▾    Story Points: 5         │
│                                                                      │
│ ┌ Description ───────────────────────────────────────────────────┐ │
│ │ As a platform team, I want automated deployment to AKS so that │ │
│ │ releases can be deployed consistently.                          │ │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│ Tabs:  Details | Discussion | Links | Attachments | History         │
│                                                                      │
│ Links:  + Add link →  (Branch, Commit, Pull Request, Build, ...)    │
└──────────────────────────────────────────────────────────────────┘
```

The **Links** tab is the one worth describing in interviews — it's where a work item gets connected to a branch, commit, PR, or pipeline run for traceability.

---

## 6. Work Item Hierarchy

A common hierarchy is:

```
Epic
  |
  v
Feature
  |
  v
User Story
  |
  v
Task
```

Example:

```
EPIC
└── Cloud Migration
     |
     └── FEATURE
          |
          └── Migrate Payment Service
               |
               ├── USER STORY
               │    |
               │    ├── TASK
               │    ├── TASK
               │    └── TASK
               |
               └── BUG
```

### Important

The exact work-item types can vary depending on the Azure DevOps **process template** used by the organization (Agile, Scrum, CMMI, or a custom process).

---

## 7. Epic

An Epic is a large business initiative.

Example:

```
Epic:
AWS → Azure Migration
```

This could take months.

Under it:

```
Epic
 |
 +-- Feature: Network Migration
 |
 +-- Feature: Application Migration
 |
 +-- Feature: Database Migration
 |
 +-- Feature: Monitoring
```

---

## 8. Feature

A Feature is a significant capability within an Epic.

Example:

```
Epic:
Cloud Migration

Feature:
Migrate Kubernetes Applications
```

Then:

```
Feature
   ↓
User Stories
```

---

## 9. User Story

A User Story describes functionality or value from the user's/business perspective.

Typical format:

> As a `<user>`, I want `<functionality>`, so that `<business value>`.

Example:

> As an application team, I want automated deployment to AKS so that releases can be deployed consistently.

---

## 10. Task

A task is a smaller piece of work required to complete a user story.

Example:

```
User Story:
Deploy application to AKS

Tasks:
├── Create Dockerfile
├── Build image
├── Push image to ACR
├── Create Helm chart
├── Configure pipeline
└── Test deployment
```

---

## 11. Bug

A bug represents a defect or unexpected behavior.

Example:

```
Bug:
Payment API returns HTTP 500 in QA.
```

Information can include:

```
Description
Steps to reproduce
Expected result
Actual result
Severity
Priority
Assigned engineer
Environment
Attachments
Related work items
```

### UI mockup: bug work item

```
┌──────────────────────────────────────────────────────────────────┐
│ Bug #4521: Payment API returns HTTP 500 in QA        [Save] [X]   │
├──────────────────────────────────────────────────────────────────┤
│ State: Active ▾     Severity: 2 - High ▾     Priority: 1 ▾         │
│ Assigned To: Priya K ▾   Area: Payments\API   Iteration: Sprint 4  │
│                                                                      │
│ Repro Steps:                                                        │
│  1. Call POST /payments/charge with a valid card                   │
│  2. Observe response                                                │
│                                                                      │
│ System Info:                                                        │
│  Environment: QA  |  Build: payment-api-1.5.128                     │
│                                                                      │
│ Linked work items: User Story #4480 (parent)                        │
│ Links: Pull Request !212 (fix), Build #1281                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. Backlog

A backlog is a prioritized list of work.

Example:

```
Product Backlog

1. Payment API deployment
2. Logging enhancement
3. Security scanning
4. Database migration
5. Monitoring improvement
```

The Product Owner/team can prioritize the work.

### UI mockup: Product Backlog screen

Navigation: `Boards → Backlogs`

```
┌──────────────────────────────────────────────────────────────────┐
│ Product Backlog — Sprint 4 Team                                    │
├──────────────────────────────────────────────────────────────────┤
│ Order │ ID    │ Title                              │ State │ SP   │
│  1    │ 4480  │ Deploy Payment Service to AKS       │ Active│ 5    │
│  2    │ 4502  │ Add structured logging              │ New   │ 3    │
│  3    │ 4510  │ Integrate Trivy security scan        │ New   │ 2    │
│  4    │ 4522  │ Migrate DB schema to v2               │ New   │ 8    │
│  5    │ 4530  │ Add Grafana dashboard for AKS         │ New   │ 3    │
│                                                                      │
│ [Drag to reorder]   Filter: Iteration = Sprint 4 ▾   Tags ▾         │
└──────────────────────────────────────────────────────────────────┘
```

Rows can be dragged to reprioritize, and a right-click lets you "Move to iteration" to pull an item into the active sprint.

---

## 13. Board

The Board provides a visual representation of work.

Typical Kanban-style flow:

```
+---------+---------+----------+---------+
| New     | Active  | Testing  | Done    |
+---------+---------+----------+---------+
| Story A | Story B | Story C  | Story D |
| Bug X   | Task Y  |          |         |
+---------+---------+----------+---------+
```

A team can move work items across columns.

Example:

```
New
 ↓
Active
 ↓
Resolved
 ↓
Closed
```

The exact states depend on the process/work-item configuration.

### UI mockup: Kanban board

Navigation: `Boards → Boards`

```
┌──────────────────────────────────────────────────────────────────┐
│ Sprint 4 Board                                                     │
├───────────┬──────────────┬──────────────┬──────────────┬─────────┤
│   New     │   Active     │   Testing    │   Done       │         │
├───────────┼──────────────┼──────────────┼──────────────┼─────────┤
│ #4502     │ #4480        │ #4479        │ #4470        │         │
│ Add       │ Deploy       │ Fix Helm     │ Add readiness│         │
│ structured│ Payment Svc  │ chart values │ probe        │         │
│ logging   │ to AKS       │              │              │         │
│ [3 pts]   │ [5 pts] 👤SG │ [2 pts] 👤PK │ [2 pts] 👤RM │         │
│           │              │              │              │         │
│ #4510     │ Bug #4521    │              │              │         │
│ Trivy     │ Payment API  │              │              │         │
│ scan      │ 500 error    │              │              │         │
│ [2 pts]   │ [—] 👤PK     │              │              │         │
└───────────┴──────────────┴──────────────┴──────────────┴─────────┘
```

Cards are dragged between columns as work progresses; each card shows ID, title, story points, and assignee avatar.

---

## 14. Sprint

A Sprint is a fixed period in which a team plans and completes a selected amount of work.

Example:

```
Sprint 1
Duration: 2 weeks

Work:

Story 1
Story 2
Story 3
Bug 1
Task 1
```

At the end:

```
Completed
Remaining
Blocked
```

---

## 15. Sprint Planning

Typical flow:

```
Product Backlog
       |
       v
Prioritize
       |
       v
Sprint Planning
       |
       v
Select Stories
       |
       v
Break into Tasks
       |
       v
Assign Team Members
       |
       v
Sprint
```

### UI mockup: Sprints — Taskboard

Navigation: `Boards → Sprints → Taskboard`

```
┌──────────────────────────────────────────────────────────────────┐
│ Sprint 4  (Oct 1 – Oct 14)       Capacity: 60h   Remaining: 38h    │
├──────────────────────────────────────────────────────────────────┤
│ Story #4480: Deploy Payment Service to AKS         5 pts           │
│   ├── Task: Create Dockerfile        [Done]    0h remaining        │
│   ├── Task: Build Docker image       [Active]  4h remaining        │
│   ├── Task: Push image to ACR        [To Do]   2h remaining        │
│   ├── Task: Create Helm chart        [To Do]   6h remaining        │
│   └── Task: Deploy to AKS            [To Do]   4h remaining        │
│                                                                       │
│ Burndown:  ▓▓▓▓▓▓▓░░░░░░░░░  (38h remaining of 60h)                │
└──────────────────────────────────────────────────────────────────┘
```

The burndown chart here is the thing worth narrating: "remaining work trending down across the sprint tells us whether we're on track."

---

## 16. Story Points

Story points estimate the relative effort/complexity of work.

Example:

```
Story A → 2 points
Story B → 5 points
Story C → 8 points
```

Important: **story points are not necessarily hours.** They can represent a combination of:

```
Complexity
Effort
Uncertainty
Risk
```

### Interview question

**Q: Is 5 story points equal to 5 hours?**

> No. Story points are relative estimates of complexity and effort, not direct time measurements.

---

## 17. Priority vs Severity

This is commonly asked.

**Priority** — How urgently should we work on it?

**Severity** — How badly does the issue affect the system?

Example:

```
Production payment failure
Severity = Critical
Priority = High
```

---

## 18. Queries

Azure Boards provides queries to find work items.

Example use cases:

```
Find all:
- Open bugs
- High-priority stories
- Work assigned to me
- Bugs in production
- Tasks in current sprint
```

Conceptually:

```
Work Items
    ↓
Query
    ↓
Filtered Results
```

---

## 19. Example Query

You might create a query such as:

```
Work Item Type = Bug
AND
State != Closed
AND
Priority = 1
```

This gives you important open bugs.

### UI mockup: Query editor

Navigation: `Boards → Queries → New Query`

```
┌──────────────────────────────────────────────────────────────────┐
│ New Query                                             [Run] [Save] │
├──────────────────────────────────────────────────────────────────┤
│ Type of query: Flat list ▾                                         │
│                                                                      │
│ Field               Operator        Value                          │
│ Work Item Type   =             Bug                                 │
│ And  State       <>            Closed                              │
│ And  Priority    =             1                                   │
│ And  Area Path   Under         Payments                            │
│                                                                      │
│ [+ Add clause]                                                      │
├──────────────────────────────────────────────────────────────────┤
│ Results:                                                             │
│  ID    Title                              State    Priority         │
│  4521  Payment API returns 500 in QA       Active   1                │
│  4538  Checkout fails for int'l cards      New      1                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 20. Dashboards

Dashboards provide visibility into project status.

Possible information:

```
Sprint Progress
Bug Count
Velocity
Work Items
Build Status
Deployment Status
Test Results
```

Architecture:

```
Azure Boards
     |
     v
Dashboard
     |
 +---+---+---+
 |   |   |   |
Bug Sprint Work Build
```

### UI mockup: Dashboard

Navigation: `Overview → Dashboards`

```
┌──────────────────────────────────────────────────────────────────┐
│ Payment Platform — Sprint Dashboard                                │
├───────────────────────┬───────────────────────┬───────────────────┤
│ Sprint Burndown        │ Bugs by Priority        │ Build Status       │
│ ▓▓▓▓▓▓▓░░░░░░░         │ P1: ███ 3               │ payment-ci  ✅ 128  │
│ 38h remaining / 60h    │ P2: █████ 5              │ infra-ci    ✅ 44   │
├───────────────────────┼───────────────────────┼───────────────────┤
│ Velocity (last 4 sprints)│ Work Items Assigned to Me │ Release Status    │
│ 18, 22, 20, 24 pts      │ 3 Active, 1 Blocked       │ PROD: ✅ Deployed  │
└───────────────────────┴───────────────────────┴───────────────────┘
```

Each tile is a configurable widget — "Burndown", "Velocity", "Query Results", "Build status" are the ones worth naming in an interview.

---

## 21. Azure Boards + Azure Repos

This is important for DevOps interviews.

Work item:

```
User Story #123
```

Developer writes code → Git Commit. The commit can be associated with the work item. Then a Pull Request can also be associated with the work item.

Flow:

```
Azure Boards
     |
  Work Item #123
     |
     v
Git Branch
     |
     v
Commit
     |
     v
Pull Request
     |
     v
Pipeline
     |
     v
Deployment
```

This gives traceability.

### UI mockup: linking a commit/branch from the work item

```
┌──────────────────────────────────────────────────────────────────┐
│ User Story #4480 — Links tab                                       │
├──────────────────────────────────────────────────────────────────┤
│  + Add link ▾   [Branch | Commit | Pull Request | Build | ...]    │
│                                                                      │
│  Linked items:                                                      │
│   🌿 Branch: users/suraj/4480-deploy-payment-aks                   │
│   📝 Commit: a1b2c3d "Add Dockerfile and Helm chart"                │
│   🔀 Pull Request !212  (Active, 2 reviewers)                       │
│   🏗  Build #1281  payment-ci  (Succeeded)                          │
│   🚀 Release #45  payment-release  (PROD pending approval)          │
└──────────────────────────────────────────────────────────────────┘
```

> Tip: typing `AB#4480` in a commit message or PR description auto-links it to work item #4480 — a small but interview-worthy detail.

---

## 22. Boards + Pipelines

This is particularly useful for DevOps.

Example:

```
Work Item #123
      ↓
Code Change
      ↓
PR
      ↓
Pipeline
      ↓
Build
      ↓
Deployment
```

You can track what work resulted in a particular deployment.

---

## 23. End-to-End Enterprise Flow

Imagine your organization has a requirement:

> Deploy Payment Microservice to Kubernetes.

Azure Boards:

```
EPIC
Cloud Modernization
       |
       v
FEATURE
Microservices Platform
       |
       v
USER STORY
Deploy Payment Service
       |
       +---------+---------+
       |         |         |
      Task      Task      Task
       |         |         |
    Docker     Helm     Pipeline
       |
       v
Azure Repos
       |
       v
Azure Pipeline
       |
       v
Container Registry
       |
       v
AKS
```

This is the DevOps lifecycle.

---

## 24. Azure Boards in Your DevOps Role

### Important distinction

Don't claim:

> "I was responsible for Product Owner activities."

if that wasn't your role.

Instead, based on your actual DevOps experience, you can explain your interaction with Boards/Jira-like work management as:

> "As a DevOps engineer, I would typically receive development, deployment, infrastructure, incident, or change-related work items and update their status, provide technical comments, link relevant PRs or pipeline executions, and coordinate with developers and QA."

That's a realistic DevOps answer.

---

## 25. Azure Boards vs Jira

Since experience with Jira is common for this profile, this comparison is important.

| Azure Boards | Jira |
|---|---|
| Azure DevOps | Atlassian |
| Work Items | Issues |
| Boards | Scrum/Kanban Boards |
| Backlogs | Backlogs |
| Sprint | Sprint |
| Query | JQL |
| Dashboard | Dashboard |
| Azure Repos integration | Bitbucket/GitHub integrations |
| Azure Pipelines integration | CI/CD integrations |

### Interview answer

> "Conceptually Azure Boards and Jira solve similar work-management problems. The main advantage of Azure Boards in an Azure DevOps ecosystem is the native integration with Repos, Pipelines, Test Plans and other Azure DevOps services."

---

## 26. Azure Boards vs Azure Repos

Don't confuse these.

**Azure Boards:** Work, Planning, Tracking, Sprint, Bug, Task

**Azure Repos:** Source Code, Git, Branches, Commits, Pull Requests

### Simple memory trick

> Boards = What work should be done?
> Repos = What code implements the work?

---

## 27. Azure Boards vs Azure Pipelines

**Boards** tracks: What needs to be done? Who is doing it? What is the status?

**Pipelines** handles: How do we build/test/deploy it?

Architecture:

```
Requirement
    |
    v
Azure Boards
    |
    v
Developer
    |
    v
Azure Repos
    |
    v
Azure Pipelines
    |
    v
Application
```

---

## 28. Security

Azure Boards also contains potentially sensitive project information.

Examples:

```
Customer requirements
Architecture information
Production incidents
Security vulnerabilities
Infrastructure details
```

Best practices:

- Follow project permissions
- Use appropriate team/project access
- Don't put passwords in work items
- Don't put API keys in comments
- Don't expose sensitive production data
- Follow organizational data classification policies

---

## 29. What NOT to Put in Azure Boards

Never put:

```
AWS Access Key
AWS Secret Key
Azure Client Secret
Database Password
API Token
Private Key
```

Example of bad practice:

```
Password: MyPassword123
```

Instead:

> "Credential is stored in the approved secret-management system."

---

## 30. Troubleshooting / Scenario Questions

### Scenario 1: Developer says the work item is completed, but deployment isn't done.

Check:

```
Work Item
   ↓
PR
   ↓
PR merged?
   ↓
Pipeline triggered?
   ↓
Build successful?
   ↓
Artifact created?
   ↓
Deployment successful?
```

Don't assume: `Work Item = Deployment`. They are different stages of the lifecycle.

---

### Scenario 2: Production bug reported

Example:

```
Payment API returning 500
```

Possible flow:

```
Production Incident
       |
       v
Bug Work Item
       |
       v
Assign Engineer
       |
       v
Investigate
       |
       v
Fix
       |
       v
PR
       |
       v
Pipeline
       |
       v
QA
       |
       v
Production
       |
       v
Close Bug
```

---

### Scenario 3: Too many tasks in the sprint

As a DevOps engineer, don't blindly accept everything. You can identify:

```
Capacity
Priority
Dependencies
Criticality
Blocked work
```

The team should prioritize work based on capacity and business priorities.

---

## 31. Senior-Level Interview Question

**Q: How do you ensure traceability from requirement to production?**

### Strong answer

> "I would maintain traceability from the work item through the Git branch, commit and pull request, and then through the CI/CD pipeline and deployment. This allows us to identify which requirement resulted in a particular code change and which version was deployed to an environment."

Architecture:

```
Requirement
    ↓
Work Item
    ↓
Branch
    ↓
Commit
    ↓
Pull Request
    ↓
Pipeline
    ↓
Artifact
    ↓
Deployment
```

This is a very good interview answer.

---

## 32. Common Interview Questions

### Basic

1. What is Azure Boards?
2. What is a work item?
3. What is a backlog?
4. What is a sprint?
5. What is a board?
6. What is a user story?
7. What is a task?
8. What is a bug?
9. What is an Epic?
10. What is a Feature?

### Intermediate

11. Azure Boards vs Jira?
12. Azure Boards vs Azure Repos?
13. How do Boards integrate with Pipelines?
14. What are story points?
15. Priority vs severity?
16. How do you track bugs?
17. How do you use sprints?
18. What are queries?
19. How do you create traceability?
20. How do work items connect with Git?

### Advanced

21. How would you implement traceability across SDLC?
22. How would you manage production incidents?
23. How do you prevent sensitive information from being exposed?
24. How would you customize work item processes?
25. How would you design Boards for a large enterprise team?

---

## 33. Interview Answer: What is Azure Boards?

### Short answer

> "Azure Boards is the work-management service in Azure DevOps used for planning, tracking and prioritizing work using work items, backlogs, boards, sprints, queries and dashboards."

### Real-world explanation

```
Requirement
    ↓
Epic
    ↓
Feature
    ↓
User Story
    ↓
Tasks
    ↓
Development
    ↓
PR
    ↓
Pipeline
```

---

## 34. Interview Answer: How do you use Azure Boards as a DevOps Engineer?

> "From a DevOps perspective, I use work items to track infrastructure, deployment, CI/CD, incident, change and automation activities. I update status, document technical findings, link code or deployment information where applicable, and coordinate with development and QA teams."

This is much better than saying:

> "I create user stories."

unless that is actually your responsibility.

---

## 35. What NOT to Say

❌ "Azure Boards is like Git." — Wrong.

❌ "Azure Boards deploys applications." — Wrong.

❌ "Story points are hours." — Incorrect.

❌ "Boards are only for developers." — Boards can be used across development, QA, DevOps, product and other teams.

❌ "I know Azure Boards because I created tickets." — Too shallow for 4–5 years.

Instead discuss: `planning → tracking → dependencies → traceability → incidents → delivery`

---

## 36. Production Best Practices

1. **Clear work items** — avoid "Fix issue"; prefer "Fix Payment API 500 error during transaction processing"
2. **Clear acceptance criteria** — define what "done" means
3. **Prioritize work** — don't treat every issue as equally important
4. **Track dependencies** — e.g. `Network change → Application deployment`
5. **Maintain traceability** — `Work Item → PR → Pipeline → Deployment`
6. **Keep sensitive data out** — use secret-management systems
7. **Keep status accurate** — don't leave work items permanently in "Active"

---

## 37. Memory Trick

```
E-F-S-T

Epic
 ↓
Feature
 ↓
Story
 ↓
Task
```

```
B-R-P

Boards → Work
Repos → Code
Pipelines → Delivery
```

Complete lifecycle:

```
PLAN
 ↓
CODE
 ↓
BUILD
 ↓
TEST
 ↓
DEPLOY
 ↓
MONITOR
```

Azure DevOps provides tools across much of this lifecycle.

---

## 38. 30–60 Second Interview Answer

> "Azure Boards is the work-management component of Azure DevOps. It helps teams plan and track work using work items such as Epics, Features, User Stories, Tasks and Bugs, along with backlogs, Kanban boards and sprints. From a DevOps perspective, I would use it to track infrastructure, CI/CD, deployment, incident and automation work. One important capability is traceability, where a work item can be connected with Git branches, commits, pull requests and pipeline activity. This provides visibility from the original requirement through development and finally to deployment."

---

## 39. Final Revision Sheet

### 10 things you MUST remember

```
1. Azure Boards = Work management
2. Work Item = Trackable unit of work
3. Epic = Large initiative
4. Feature = Major capability
5. User Story = Business/user requirement
6. Task = Smaller implementation work
7. Bug = Defect
8. Backlog = Prioritized work
9. Sprint = Time-boxed development period
10. Traceability = Work Item → Code → PR → Pipeline → Deployment
```

### Most important architecture

```
AZURE BOARDS
                     |
                 Work Item
                     |
                     v
                Azure Repos
                     |
                   Commit
                     |
                     v
                     PR
                     |
                     v
              Azure Pipelines
                     |
                     v
                  Artifact
                     |
                     v
               DEV → QA → PROD
```

### One sentence to memorize

> "Azure Boards manages the work, Azure Repos manages the code, and Azure Pipelines automates the build, test and deployment of that code."

---

## 40. UI Mockup Index (Quick Reference)

These text-based mockups are close enough to the real Azure DevOps layout to describe confidently in an interview without a live demo:

| Screen | Navigation | Section |
|---|---|---|
| New work item form | `Boards → Work Items → + New Work Item` | §5 |
| Bug work item | `Boards → Work Items → + New Work Item → Bug` | §11 |
| Product Backlog | `Boards → Backlogs` | §12 |
| Kanban board | `Boards → Boards` | §13 |
| Sprint Taskboard + burndown | `Boards → Sprints → Taskboard` | §15 |
| Query editor | `Boards → Queries → New Query` | §19 |
| Dashboard | `Overview → Dashboards` | §20 |
| Work item Links tab (traceability) | Open any work item → `Links` tab | §21 |

### How to narrate the UI in an interview

> "On the work item form, I'd fill in title, area, iteration and story points, then use the Links tab to connect it to a branch, commit, pull request or build once development starts — typing `AB#<id>` in a commit message auto-links it. On the Kanban board, cards move across New → Active → Testing → Done as work progresses. During sprint planning, I'd use the Taskboard to break a story into tasks with remaining-hours estimates, and the burndown chart there shows whether the team is on track. For reporting, I'd pull a query — say, open P1 bugs — and pin it as a widget on the team dashboard alongside build and release status, so the whole team sees sprint health and deployment state in one place."
