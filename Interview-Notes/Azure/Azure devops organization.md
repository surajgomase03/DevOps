# 🏢 Azure DevOps Organization & Projects — Detailed Interview Notes

> **One-liner:** An **Organization** is the top-level DevOps boundary. **Projects** live inside it, and each project holds **teams, repos, boards, pipelines and artifacts**. **Permissions**, **branch policies** and **environment checks** protect the delivery process.

```text
Azure DevOps Organization
          │
          ▼
       Project
          │
    ┌─────┼──────────────┬────────────┐
    ▼     ▼              ▼            ▼
  Repos  Boards       Pipelines     Artifacts
                          │
                          ▼
                    Environments / Service connections
```

```text
Organization = Company / DevOps workspace
Project      = Application / Product workspace
Team         = Group of people working on the project
Repos        = Source code
Boards       = Work tracking
Pipelines    = CI/CD
Artifacts    = Packages
Permissions  = Who can do what
```

---

## 📑 Contents

1. [Organization](#1-azure-devops-organization)
2. [Organization vs Azure Subscription vs Entra Tenant](#2-organization-vs-azure-subscription-vs-entra-tenant)
3. [Project](#3-azure-devops-project)
4. [Teams](#4-teams)
5. [Core Services (Repos, Boards, Pipelines, Artifacts)](#5-core-services)
6. [Security & Permissions](#6-security--permissions)
7. [Branch Policies (Protecting main)](#7-branch-policies-protecting-main)
8. [Pipeline, Environment & Service Connection Security](#8-pipeline-environment--service-connection-security)
9. [Real Example & Complete Flow](#9-real-example--complete-flow)
10. [Important Terms](#10-important-terms)
11. [Command Cheat Sheet (`az devops`)](#11-command-cheat-sheet-az-devops)
12. [Hands-On Lab](#12-hands-on-lab)
13. [Troubleshooting Scenarios](#13-troubleshooting-scenarios)
14. [Interview Questions](#14-interview-questions)
15. [One-Minute Revision](#15-one-minute-revision)

---

# 1. Azure DevOps Organization

## 1.1 What is it?

An **Azure DevOps Organization** is the **top-level container** where Azure DevOps work is managed. It can contain many projects.

```text
Organization
│
├── Project-A
├── Project-B
├── Project-C
└── Project-D
```

**Example:** company `ABC Technologies` → organization `abc-devops`, with projects such as Payment Application, Banking Application, Customer Portal, Internal Tools.

## 1.2 Organization URL

```text
https://dev.azure.com/<organization>
https://dev.azure.com/abccompany                  ← organization
https://dev.azure.com/abccompany/payment-app      ← project
```

```text
abccompany  = Organization
payment-app = Project
```

## 1.3 Organization responsibilities

* Projects
* Users, groups and **access levels**
* Policies (security, user, application connection policies)
* Billing and licensing
* Organization-level permissions
* Extensions
* Agent pools (organization-level), organization settings

## 1.4 Azure DevOps Services vs Server

| | Azure DevOps **Services** | Azure DevOps **Server** |
| --- | --- | --- |
| Hosting | Cloud (Microsoft-hosted) | **On-premises**, self-managed |
| Top level | **Organization** | **Project collection** |
| URL | `dev.azure.com/<org>` | Your own server URL |

## 1.5 Link the organization to Microsoft Entra ID

* An organization can be **connected to a Microsoft Entra tenant**. This is the recommended setup in companies.
* Benefits: users sign in with corporate identities, **Conditional Access/MFA** apply, **group-based access** (Entra groups), and access is removed when a user leaves the company.
* Without it, access depends on individual Microsoft accounts.

## 1.6 Access levels and billing (concept)

| Access level | For |
| --- | --- |
| **Stakeholder** | Free, limited (for example view/update work items) |
| **Basic** | Standard developers: repos, pipelines, boards |
| **Basic + Test Plans** | Test management |
| **Visual Studio subscriber** | Included with a VS subscription |

> Pricing and free-tier limits (free users, parallel jobs, minutes) change over time. Check the current Azure DevOps pricing page.

---

# 2. Organization vs Azure Subscription vs Entra Tenant

> ⭐ Important interview question.

**Azure Subscription** manages **Azure cloud resources**:

```text
Subscription → VM, VNet, Storage Account, AKS, Database
```

**Azure DevOps Organization** manages **DevOps work**:

```text
Organization → Projects, Repos, Boards, Pipelines, Artifacts
```

```text
            Microsoft Entra Tenant   (identity: users, groups, service principals)
                 /            \
                /              \
   Azure DevOps Organization     Azure Subscription(s)
   (code, boards, pipelines)     (VMs, AKS, storage...)
                \              /
                 \            /
              Service Connection
       (pipeline identity → Azure RBAC role on the subscription)
```

> 🎤 **Interview answer:** *"An Azure Subscription manages Azure cloud resources, while an Azure DevOps Organization manages DevOps projects, source code, work items, pipelines and artifacts. They connect through a service connection."*

---

# 3. Azure DevOps Project

## 3.1 What is a project?

A **Project** is a **logical workspace inside an organization**.

```text
Organization
      │
      ▼
   Project
      │
 ┌────┼──────────────┐
 ▼    ▼              ▼
Repos Boards      Pipelines   (+ Artifacts, Test Plans, Teams, permissions)
```

## 3.2 Example project layout

```text
Payment-Service
│
├── Repos
│    └── payment-api
│
├── Boards
│    ├── Epics
│    ├── Features
│    ├── User Stories
│    └── Tasks
│
├── Pipelines
│    ├── CI
│    └── CD
│
└── Artifacts
     └── payment-package
```

## 3.3 Why projects matter

Projects **separate applications or teams**. Each can have its own repositories, pipelines, teams, boards, permissions and work items.

```text
Organization: ABC
│
├── E-Commerce
├── Payment
├── HR-Portal
└── Customer-App
```

## 3.4 Creating a project

You provide:

```text
Project Name
Description
Visibility
Version Control
Work Item Process
```

**Version control:** **Git** (or the older TFVC). Use Git.

**Work item process:**

| Process | Typical use |
| --- | --- |
| **Basic** | Simplest, small teams |
| **Agile** | Epics, Features, User Stories, Tasks, Bugs |
| **Scrum** | Product Backlog Items, Tasks, Bugs |
| **CMMI** | Formal, requirement-heavy |

> Most modern teams use **Git + Agile or Scrum**.

## 3.5 Project visibility

| Private | Public |
| --- | --- |
| Only authorized users can access | Anyone can view (anonymous read access) |
| **Typical company project** | For suitable open-source/public projects |

> Public projects must be **allowed by an organization policy** first. Company code should be **Private**.

## 3.6 ⭐ How many projects should you create?

| Approach | When |
| --- | --- |
| **Fewer projects** (even one project with many repos and teams) | Teams collaborate, share pipelines/artifacts, want cross-team reporting and simple administration. Commonly recommended |
| **Separate projects** | You need **security isolation**, different work item processes, separate administrators, or different compliance boundaries |

> 🎤 *"I'd start with one project per product or security boundary, and use teams, area paths and repo permissions inside it, instead of creating many small projects."*

---

# 4. Teams

## 4.1 What is a team?

A **Team** is a group of users working **within a project**.

```text
Project: Payment-App
│
├── DevOps Team
├── Backend Team
├── Frontend Team
├── QA Team
└── Security Team
```

A team can have its own: **members, backlog, boards, sprints, area paths, iteration paths, dashboards**.

## 4.2 Why use teams?

One project with 100 developers shouldn't share one backlog.

```text
Payment-App
│
├── Backend Team   → own backlog and sprints
├── Frontend Team  → own backlog and sprints
└── DevOps Team    → own backlog and sprints
```

## 4.3 Area paths and iteration paths

| Concept | Meaning |
| --- | --- |
| **Area path** | Logical area/component of the product. A team's backlog is the work items under the area path(s) it owns |
| **Iteration path** | Time-box such as `Sprint 1`, `Sprint 2` |

```text
Area:      Payment-App\Backend    → Backend Team's backlog
Iteration: Payment-App\Sprint 5   → current sprint
```

## 4.4 Project vs Team

| Project | Team |
| --- | --- |
| Larger container | Group inside a project |
| Contains repos/pipelines/boards | Focuses on **work management** |
| Contains multiple teams | Belongs to a project |
| Project-level configuration | Team-level backlog/sprint configuration |

```text
Project = Application/workspace
Team    = People working on it
```

---

# 5. Core Services

## 5.1 Azure Repos

* Stores source code. Mostly **Git**.

```text
Project → Repos → payment-api, frontend, infrastructure
```

### Typical Git workflow

```text
Clone → Create branch → Write code → git add → git commit → git push
      → Pull Request → Code review → Merge
```

Then:

```text
Merge → Azure Pipeline → Build → Test → Deploy
```

## 5.2 Azure Boards

**Work tracking**: Epics, Features, User Stories, Tasks, Bugs, backlogs, sprints, Kanban boards.

```text
Epic
 └── Feature
       └── User Story
             ├── Task
             └── Task
```

## 5.3 Azure Pipelines

**CI/CD** automation.

```text
Developer → Git Push → Pipeline Trigger → Build → Unit Test → Security Scan
          → Package → Deploy → Azure / AKS / VM
```

```text
CI: Build → Test → Docker Build → Push Image
CD: Deploy to Dev → QA → Approval → Prod (AKS)
```

## 5.4 Azure Artifacts

Package management for **NuGet, npm, Maven, Python (PyPI), Universal Packages**.

```text
Pipeline → Build Package → Azure Artifacts → Application / Deployment
```

> Azure Artifacts uses **feeds** with permissions, upstream sources (for example npmjs, PyPI) and retention policies.

## 5.5 Azure Test Plans (extra)

Manual and exploratory testing (needs a Test Plans license).

---

# 6. Security & Permissions

> Permissions answer: **Who is allowed to perform what action?**

```text
Developer → can clone, create branch, create PR
Developer → cannot modify the production pipeline
```

## 6.1 Permission scope hierarchy

```text
Organization
      ↓
Project
      ↓
Team
      ↓
Repository
      ↓
Branch
      ↓
Pipeline / Environment / Service connection / Feed
```

Permissions can be set at each level, and lower levels **inherit** from higher ones unless overridden.

## 6.2 Users and groups

* Individual users can be granted access, but **prefer groups** (ideally **Entra ID groups**) so access is managed in one place.

```text
DevOps-Developers (group)
        ├── User A
        ├── User B
        └── User C
```

## 6.3 Built-in groups

| Group | Typical permissions |
| --- | --- |
| **Project Administrators** | Broad project administration |
| **Contributors** | Normal development: code, work items, pipelines (subject to specific permissions) |
| **Readers** | Read-only |
| **Build Administrators** | Manage build pipelines |
| **Release Administrators** | Manage release pipelines/environments |
| **Project Collection Administrators** | **Organization-wide** administration |

> Don't make everyone a Project Administrator.

## 6.4 Permission states ⭐

| State | Meaning |
| --- | --- |
| **Allow** | Permission granted |
| **Deny** | **Explicitly denied** |
| **Not set** | Nothing granted at this scope (effectively no access unless inherited) |
| **Allow / Deny (inherited)** | Comes from a parent scope or group |

* **Explicit Deny wins** over Allow (with the nuance that inherited Deny can be overridden by an explicit Allow at a lower scope for the same identity).
* Group membership **combines**: if any group denies, the user is denied.
* Adding a user to a group doesn't automatically give unrestricted access everywhere.

> To see why access is granted/denied, use **Security → "Check access"** / the user's effective permissions view.

## 6.5 Example permission matrix

| Group | Repo | Pipeline | Production |
| --- | --- | --- | --- |
| Developer | Read/Write (Contribute) | Run / limited edit | No |
| QA | Read | Run/test | No |
| DevOps | Read/Write | Manage | Yes, with controls |
| Manager | Read | View | Depends |

> Effective permissions depend on project, repository, branch, pipeline, environment and group configuration.

## 6.6 Repository permissions

Control who can: **Read, Contribute, Create branches, Create tags, Manage permissions, Delete repository, Manage policies, Force push, Bypass policies**.

```text
Developer     → Read + Contribute
Project Admin → Repository administration
```

---

# 7. Branch Policies (Protecting `main`)

> ⭐ Extremely important for DevOps interviews.

`main` is the production branch. You don't want direct pushes.

```text
Developer → feature branch → Pull Request → Reviewer → Build Validation → Approved → main
```

## 7.1 Typical policies

```text
main branch
│
├── Require a Pull Request (no direct push)
├── Minimum number of reviewers (for example 2)
├── Build validation (CI must pass)
├── Check for linked work items
├── Comment resolution required
├── Limit merge types (squash / rebase / merge)
├── Automatically include required reviewers (by path/team)
└── Reset approvals when new commits are pushed
```

## 7.2 Policy vs permission

| Branch permission | Branch policy |
| --- | --- |
| Who can push/force-push/bypass | Rules every PR must satisfy |
| Per user/group | Per branch |

> Anyone with **"Bypass policies when completing pull requests"** can skip policies. Restrict that permission tightly.

---

# 8. Pipeline, Environment & Service Connection Security

## 8.1 Pipeline permissions

Control who can **edit, run, delete** a pipeline and **use resources**.

```text
Developer → run CI pipeline
DevOps    → modify CI/CD pipelines
Production deployment → requires additional authorization
```

> ⭐ **Pipeline resource authorization:** a pipeline must be **authorized** to use protected resources: service connections, variable groups, secure files, agent pools and environments.

## 8.2 Environments and checks

```text
Build → Deploy Dev → Test → Approval → Deploy Production
```

Production environments can have:

* **Approvals** (named approvers)
* **Checks**: branch control, business hours, exclusive lock, required template, invoke Azure Function/REST API
* **Permissions** (who can use or manage the environment)

## 8.3 Service connections

```text
Azure DevOps Pipeline → Azure Service Connection → Azure Subscription → AKS / VM / Storage
```

> A service connection provides an authenticated connection between Azure DevOps and an external service so pipelines can interact with it.

Best practices:

* Prefer **workload identity federation** (no stored secrets) over a client secret/certificate.
* Grant the identity only the **Azure RBAC role it needs** at the **narrowest scope** (resource group, not subscription).
* Use **separate service connections** per environment (dev vs prod).
* **Don't grant access to all pipelines.** Authorize specific pipelines, and add **approvals/checks** on the production connection.

## 8.4 Least privilege

```text
Developer              → code + normal development permissions
DevOps                 → pipeline administration
Release/Platform team  → production deployment permissions
```

---

# 9. Real Example & Complete Flow

## 9.1 Banking application

```text
Organization
      ▼
ABC-Bank
      ▼
Payment-Platform  (project)
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
Repos Boards       Pipelines
 │      │              │
 │      │              ├── Build
 │      │              ├── Test
 │      │              ├── Security Scan
 │      │              └── Deployment ──► Azure ──► AKS
 │      └── Stories / Tasks / Bugs
 └── Application Source Code
```

## 9.2 Complete flow to memorize

```text
                    ORGANIZATION
                         │
                         ▼
                      PROJECT
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
      REPOS            BOARDS           TEAMS
        │                │
        │                ├── Epic → Feature → Story → Task
        ▼
     Git Push
        ▼
     PIPELINE ── Build ── Test ── Scan ── Package
        ▼
     ARTIFACT
        ▼
     DEPLOYMENT  ── Dev ── QA ── Approval ── Prod
        ▼
    Azure / AKS / VM
```

## 9.3 CI/CD example step by step

**1. Developer**

```bash
git clone <repo>
git checkout -b feature/payment
git add .
git commit -m "Add payment validation"
git push -u origin feature/payment
```

**2. Pull Request**

```text
feature/payment → Pull Request → main
Policies: code review + build validation + tests
```

**3. CI pipeline**

```text
Git → Build → Unit Test → SonarQube → Docker Build → Push Image
```

**4. CD**

```text
Artifact / Docker image → Dev → QA → Approval/Checks → Production
```

---

# 10. Important Terms

| Term | Simple meaning |
| --- | --- |
| Organization | Top-level Azure DevOps workspace |
| Project | Application/team workspace |
| Team | Group of users with its own backlog |
| Repo | Source code |
| Boards | Work tracking |
| Pipeline | CI/CD automation |
| Artifact | Package storage |
| Permission | Who can do what |
| Branch policy | Rules protecting branches |
| Service connection | Pipeline authentication to external services |
| Environment | Deployment target (with approvals/checks) |
| Agent | Machine that executes pipeline jobs |
| Agent pool | Group of agents |
| Area path / Iteration path | Product area / sprint time-box |
| Access level | License type: Stakeholder, Basic, etc. |

---

# 11. Command Cheat Sheet (`az devops`)

> Verify flags with `az devops --help`, since the extension changes over time.

## 11.1 Setup

```bash
az extension add --name azure-devops
az login                                           # Entra sign-in
az devops configure --defaults \
  organization=https://dev.azure.com/abccompany project=Payment-Service
```

> You can also use `az devops login` with a **PAT** (personal access token). PATs are personal, expire, and shouldn't be hardcoded. Prefer Entra sign-in or a service principal/managed identity for automation.

## 11.2 Projects and teams

```bash
az devops project create --name Payment-Service --visibility private \
  --process Agile --source-control git
az devops project list -o table
az devops project show --project Payment-Service

az devops team create --name "Backend Team" --project Payment-Service
az devops team list --project Payment-Service -o table
```

## 11.3 Users and groups

```bash
az devops user add --email-id user@company.com --license-type express    # Basic
az devops user list -o table
az devops security group list --project Payment-Service -o table
```

## 11.4 Repos and pull requests

```bash
az repos create --name payment-api --project Payment-Service
az repos list -o table
az repos pr create --source-branch feature/payment --target-branch main \
  --title "Add payment validation" --reviewers user@company.com
az repos pr list --status active -o table
```

## 11.5 Branch policies

```bash
# Require 2 approvers on main
az repos policy approver-count create \
  --repository-id <repo-id> --branch main \
  --blocking true --enabled true \
  --minimum-approver-count 2 \
  --creator-vote-counts false --allow-downvotes false --reset-on-source-push true

# Require comment resolution
az repos policy comment-required create \
  --repository-id <repo-id> --branch main --blocking true --enabled true

az repos policy list --branch main -o table
```

## 11.6 Pipelines

```bash
az pipelines create --name payment-ci --repository payment-api \
  --repository-type tfsgit --branch main --yml-path azure-pipelines.yml
az pipelines run --name payment-ci --branch main
az pipelines list -o table
az pipelines runs list -o table
```

## 11.7 Service connections

```bash
az devops service-endpoint list -o table
```

## 11.8 Minimal CI pipeline (for reference)

```yaml
trigger:
  branches:
    include: [ main ]

pool:
  vmImage: ubuntu-latest

steps:
  - script: echo "Build and test"
    displayName: Build
```

---

# 12. Hands-On Lab

| Step | Task |
| --- | --- |
| 1 | Create an Azure DevOps organization at `dev.azure.com` (connect to your Entra tenant if you have one) |
| 2 | Create a project `Payment-Service`: **Private**, **Git**, process **Agile** |
| 3 | Create teams `Backend Team` and `DevOps Team`. Look at each team's backlog and area path |
| 4 | Create a repo `payment-api`, clone it and push a first commit |
| 5 | Add work items: Epic → Feature → User Story → Task |
| 6 | Add **branch policies** on `main` (PR required, 1 reviewer, build validation) |
| 7 | Create a feature branch, push a change, open a **Pull Request**, and watch the policies |
| 8 | Create a simple pipeline from `azure-pipelines.yml` and trigger it |
| 9 | Create a custom security group `DevOps-Developers`. Give it Contribute on the repo, and deny **Delete repository** |
| 10 | Create an **environment** `prod` and add an **approval** check |
| 11 | Break/fix: remove your Contribute permission, try to push, restore it |

---

# 13. Troubleshooting Scenarios

## 13.1 Developer cannot push code

```text
1. Is the user added to the project?
        ↓
2. Does the user have repository access?
        ↓
3. Does the user have the Contribute permission?
        ↓
4. Is the branch protected (policy)?
        ↓
5. Is direct push restricted?
        ↓
6. Does the developer need a Pull Request?
```

For `main`:

```text
Direct push ❌ → Feature branch → Pull Request → Review + validation → Merge
```

## 13.2 Developer can see the repo but cannot modify it

```text
Repository → Security → User/Group → Contribute permission
```

```text
Read = Allow    Contribute = Not set   →   Clone/Pull ✅   Push ❌
```

## 13.3 Pipeline cannot deploy to Azure

```text
Pipeline → Service connection → Authentication → Azure RBAC → Target resource
        → Environment permissions/checks
```

Common causes:

* Pipeline **not authorized** to use the service connection
* Expired/invalid credentials (client secret expired) or broken federation
* Missing **Azure RBAC role** for the connection's identity
* Environment approval/check pending, or no permission on the environment
* Resource firewall/private endpoint blocks the agent

## 13.4 More scenarios

| Problem | Likely cause |
| --- | --- |
| User can't create a project | Lacks the "Create new projects" org permission |
| User can't be invited | Not in the Entra tenant, or the org's user policy blocks external guests |
| Pipeline waits "This pipeline needs permission to access a resource" | Authorize the service connection/variable group/environment for that pipeline |
| PR can't be completed | Policy not met: reviewers, failed build validation, unresolved comments |
| "Required" build validation never starts | Path filter or branch filter doesn't match, or the build definition is disabled |
| Former employee still has access | Org not linked to Entra, or access granted outside group-based control |
| Everyone can approve prod | Approval check is missing/too broad. Use specific approvers |

---

# 14. Interview Questions

**Q1. What is an Azure DevOps Organization?**
> The top-level container for Azure DevOps resources such as projects, users, permissions and DevOps services.

**Q2. What is a project?**
> A logical workspace inside an organization containing repositories, boards, pipelines, teams and artifacts.

**Q3. Project vs team?**
> A project is the main workspace with the DevOps resources. A team is a group of users in the project that manages its own work items, backlogs, boards and sprints.

**Q4. Azure subscription vs Azure DevOps organization?**
> A subscription holds Azure cloud resources. An organization holds DevOps projects, code, work items, pipelines and artifacts. A service connection links the two.

**Q5. How do you connect Azure DevOps to Azure?**
> Through a service connection, ideally using workload identity federation, with a minimal Azure RBAC role on the target scope.

**Q6. Why connect the organization to Entra ID?**
> Central identity, MFA/Conditional Access, group-based access and automatic access removal when people leave.

**Q7. How many projects should we create?**
> Prefer fewer projects (one per product or security boundary) with teams and permissions inside. Split projects only for isolation, different processes or compliance.

**Q8. What are Azure Boards?**
> Work tracking with epics, features, user stories, tasks, bugs, backlogs, sprints and Kanban boards.

**Q9. What are Azure Repos?**
> Git repositories for storing and managing source code.

**Q10. What is Azure Pipelines?**
> A CI/CD service to automatically build, test and deploy applications.

**Q11. What is Azure Artifacts?**
> Package management for NuGet, npm, Maven, Python and Universal Packages through feeds.

**Q12. Allow vs Deny vs Not set?**
> Allow grants access, Deny explicitly blocks it (and wins), Not set grants nothing at that scope.

**Q13. How do you secure the main branch?**
> Branch policies: require PRs, minimum reviewers, build validation, comment resolution, and restrict direct pushes and bypass permission.

**Q14. Branch policy vs branch permission?**
> Permissions say who can do what (push, force push, bypass). Policies are rules each PR must satisfy.

**Q15. How do you implement least privilege?**
> Assign roles by need, use groups instead of individuals, avoid Project Administrator for developers, and restrict production pipelines, environments and service connections.

**Q16. How do you protect production deployments?**
> Environment approvals and checks (branch control, exclusive lock), restricted environment permissions, a separate production service connection, and pipeline authorization.

**Q17. What is a pipeline authorization?**
> A pipeline must be explicitly allowed to use protected resources such as service connections, variable groups, agent pools and environments.

**Q18. Developer can't push to main. Why?**
> `main` likely has branch policies requiring a PR, so push to a feature branch and open a PR. Or the user lacks Contribute permission.

**Q19. What are area paths and iteration paths?**
> Area path organizes work by product area and defines which work items belong to a team's backlog. Iteration path defines sprints/time-boxes.

**Q20. What is a PAT and should you use it?**
> A Personal Access Token authenticates a user to Azure DevOps APIs. It's personal and expires. For automation prefer service principals or managed identities, and never hardcode PATs.

---

# 15. One-Minute Revision

```text
Organization     = Top-level Azure DevOps container
Project          = Workspace for an application/team
Team             = Group of users with its own backlog
Repos            = Source code
Boards           = Work tracking
Pipelines        = CI/CD
Artifacts        = Packages
Permissions      = Access control (Allow / Deny / Not set)
Branch Policies  = Protect important branches
Service Connection = Pipeline authentication to external services
Environment      = Deployment target with approvals/checks
```

```text
ORGANIZATION → PROJECT → TEAM

PROJECT
 ├── REPOS      → Code
 ├── BOARDS     → Work
 ├── PIPELINES  → Automation
 └── ARTIFACTS  → Packages
```

### ⭐ Most important interview statement

> **An Azure DevOps Organization is the top-level DevOps boundary, connected to an Entra tenant for identity. Projects are created inside it, and each project can contain teams, repositories, boards, pipelines and artifacts. Permissions control access to these resources, while branch policies, pipeline authorization, and environment approvals and checks protect the software delivery process. Pipelines reach Azure through a least-privilege service connection, preferably using workload identity federation.**
