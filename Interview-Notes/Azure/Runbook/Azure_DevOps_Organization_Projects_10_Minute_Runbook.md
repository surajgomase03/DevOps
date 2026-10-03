# 🚀 Azure DevOps Organization & Projects — 10-Minute Interview Runbook

## 1. ⭐ Core hierarchy

```text
Organization
      ↓
   Project
      ↓
    Team
      ↓
Repos | Boards | Pipelines | Artifacts
```

| Component | Simple meaning |
|---|---|
| **Organization** | Top-level DevOps container |
| **Project** | Application/team workspace |
| **Team** | Group of users working on project |
| **Repos** | Source code |
| **Boards** | Work tracking |
| **Pipelines** | CI/CD |
| **Artifacts** | Packages |
| **Environment** | Deployment target + approvals/checks |
| **Service Connection** | Pipeline authentication to external service |

**Remember:** Organization = Company / DevOps workspace.

---

# 2. Organization

**Interview answer:**

> Azure DevOps Organization is the top-level container where Azure DevOps resources are managed. It can contain multiple projects, users, permissions, policies and other organization-level resources.

Example:

```text
ABC Organization
 ├── Payment Project
 ├── Banking Project
 └── Customer Portal
```

URL:

```text
https://dev.azure.com/<organization>
```

### Remember

**Organization = Company / DevOps workspace**

---

# 3. ⭐ Organization vs Subscription vs Entra Tenant

Very common interview question.

```text
Microsoft Entra Tenant
       │
       ├── Azure DevOps Organization
       │
       └── Azure Subscription
                │
                ├── VM
                ├── VNet
                ├── AKS
                └── Storage
```

| Component | Purpose |
|---|---|
| **Entra Tenant** | Identity/users/groups |
| **Azure Subscription** | Azure cloud resources |
| **DevOps Organization** | Projects/code/pipelines/work tracking |

They connect through:

```text
Azure DevOps Pipeline
       ↓
Service Connection
       ↓
Azure Subscription
       ↓
Azure Resources
```

**Interview answer:**

> Azure Subscription manages Azure resources, while Azure DevOps Organization manages DevOps work such as repositories, boards, pipelines and artifacts. A service connection connects the pipeline to Azure.

---

# 4. Project

A **Project** is a logical workspace inside an Organization.

```text
Organization
     ↓
Payment-Service
 ├── Repos
 ├── Boards
 ├── Pipelines
 ├── Artifacts
 └── Teams
```

**Remember:**

> **Project = Application / Product workspace**

Typical project setup:

```text
Git
Agile / Scrum
Private
```

### How many projects?

Don't unnecessarily create many projects.

```text
One product/security boundary
          ↓
      One Project
          ↓
 Multiple Teams + Repos
```

Create separate projects when you need **security isolation, different processes, administration or compliance boundaries**.

---

# 5. Team

**Team = group of users inside a project.**

Example:

```text
Payment Project
 ├── Backend Team
 ├── Frontend Team
 ├── QA Team
 └── DevOps Team
```

Teams can have their own:

- Backlog
- Boards
- Sprints
- Area paths
- Iteration paths
- Dashboards

### Area vs Iteration

```text
Area Path      = WHERE the work belongs
Iteration Path = WHEN the work happens
```

Example:

```text
Area:      Payment\Backend
Iteration: Payment\Sprint-5
```

---

# 6. ⭐ Core Azure DevOps Services

## Azure Repos

Stores source code.

```text
Developer
   ↓
Git Repo
   ↓
Pull Request
   ↓
main
```

Typical flow:

```text
Clone
 ↓
Branch
 ↓
Code
 ↓
Commit
 ↓
Push
 ↓
Pull Request
 ↓
Review
 ↓
Merge
```

---

## Azure Boards

Used for **work tracking**.

```text
Epic
 ↓
Feature
 ↓
User Story
 ↓
Task / Bug
```

Also:

- Backlog
- Sprint
- Kanban
- Work items

---

## Azure Pipelines

Used for **CI/CD automation**.

```text
Git Push
   ↓
Build
   ↓
Test
   ↓
Security Scan
   ↓
Package
   ↓
Deploy
```

### CI

```text
Build → Test → Docker Build → Push Image
```

### CD

```text
Dev → QA → Approval → Production
```

---

## Azure Artifacts

Package management.

Supports packages such as:

```text
NuGet
npm
Maven
Python/PyPI
Universal Packages
```

Mental model:

```text
Pipeline
   ↓
Build Package
   ↓
Azure Artifacts Feed
   ↓
Application
```

---

# 7. ⭐ Security & Permissions

Question:

> **Who can perform what action?**

Think:

```text
Organization
     ↓
Project
     ↓
Repository
     ↓
Branch
     ↓
Pipeline / Environment / Service Connection
```

### Allow vs Deny vs Not Set

| State | Meaning |
|---|---|
| **Allow** | Permission granted |
| **Deny** | Explicitly blocked |
| **Not set** | Nothing granted at that scope |

**Interview trap:** Don't assume `Not set = Allow`.

Use **groups** instead of managing individual users wherever possible.

---

# 8. ⭐ Branch Policies — Protect `main`

Very important for DevOps interviews.

```text
Developer
    ↓
Feature Branch
    ↓
Pull Request
    ↓
Code Review
    ↓
Build Validation
    ↓
Approved
    ↓
main
```

Typical policies:

- PR required
- Minimum reviewers
- Build validation
- Linked work items
- Comment resolution
- Restrict bypass
- Reset approvals after new commits

### Permission vs Policy

| Branch Permission | Branch Policy |
|---|---|
| Who can push/force-push/bypass | Rules PR must satisfy |
| User/group based | Branch based |

### Interview answer

> I protect main by requiring pull requests, reviewers and successful build validation, while restricting direct pushes and bypass permissions.

---

# 9. ⭐ Service Connection

Very important.

```text
Azure DevOps Pipeline
        ↓
Service Connection
        ↓
Azure
        ↓
AKS / VM / Storage
```

It provides authenticated access from Azure DevOps to external services.

### Security

Remember:

```text
Workload Identity Federation
        ↓
No stored secret
        ↓
Least-privilege Azure RBAC
```

Best practices:

- Prefer workload identity federation.
- Give minimum required Azure RBAC.
- Use separate connections for environments.
- Don't allow every pipeline to use production connection.
- Add production approvals/checks.

---

# 10. ⭐ Environment

Used to control deployments.

```text
Build
 ↓
Dev
 ↓
QA
 ↓
Approval
 ↓
Production
```

Production environment can have:

- Approvals
- Branch control
- Business-hours checks
- Exclusive lock
- Required templates
- API/Azure Function checks
- Permissions

---

# 11. ⭐ Complete DevOps Flow

Memorize this:

```text
Developer
   ↓
Azure Repos
   ↓
Feature Branch
   ↓
Pull Request
   ↓
Branch Policies
   ↓
Azure Pipeline
   ↓
Build
   ↓
Test
   ↓
Security Scan
   ↓
Package / Docker Image
   ↓
Dev
   ↓
QA
   ↓
Approval / Checks
   ↓
Production
   ↓
AKS / VM / Azure
```

This is your **main interview architecture**.

---

# 12. 🔥 Troubleshooting Runbook

## Developer cannot push

Check in this order:

```text
User in Project?
      ↓
Repository access?
      ↓
Contribute permission?
      ↓
Branch protected?
      ↓
Direct push restricted?
      ↓
Need PR?
```

For `main`:

```text
Direct push ❌
     ↓
Feature branch
     ↓
PR
     ↓
Review + validation
     ↓
Merge
```

---

## Pipeline cannot deploy to Azure

Check:

```text
Pipeline
   ↓
Service Connection
   ↓
Authentication
   ↓
Azure RBAC
   ↓
Target Resource
   ↓
Environment permissions/checks
```

Common causes:

- Service connection not authorized
- Credential/federation problem
- Missing Azure RBAC role
- Production approval pending
- Environment permission issue
- Firewall/private endpoint blocking agent

---

# 13. ⭐ 10 Questions You MUST Know

### Q1. What is Azure DevOps Organization?

> Top-level container for Azure DevOps resources such as projects, users, permissions and DevOps services.

### Q2. Organization vs Project?

> Organization is the top-level container; project is a workspace inside the organization.

### Q3. Project vs Team?

> Project contains DevOps resources; team is a group of users managing work inside that project.

### Q4. Subscription vs Organization?

> Subscription manages Azure resources; Organization manages DevOps resources.

### Q5. How do you connect DevOps to Azure?

> Using a service connection, preferably workload identity federation with least-privilege Azure RBAC.

### Q6. How do you protect `main`?

> PR requirement, reviewers, build validation and restricted direct push/bypass.

### Q7. Permission vs Branch Policy?

> Permission controls who can perform an action; policy controls what requirements a PR must satisfy.

### Q8. What is Azure Pipeline?

> CI/CD automation for building, testing and deploying applications.

### Q9. What is Azure Artifacts?

> Package management service for packages such as npm, Maven, NuGet and Python.

### Q10. How do you secure production?

> Separate production service connection, least-privilege access, protected environment, approvals/checks and pipeline authorization.

---

# 🧠 Final 60-Second Revision

```text
ORGANIZATION
     ↓
PROJECT
     ↓
TEAM
     ↓
 ┌─────────┬─────────┬────────────┬───────────┐
 ↓         ↓         ↓            ↓
REPOS    BOARDS   PIPELINES    ARTIFACTS
 ↓                   ↓
CODE               CI/CD
                    ↓
              ENVIRONMENT
                    ↓
             APPROVAL/CHECK
                    ↓
               PRODUCTION
```

### ⭐ Must remember

```text
Organization = Top level
Project      = Workspace
Team         = People
Repos        = Code
Boards       = Work
Pipelines    = CI/CD
Artifacts    = Packages
Permissions  = Access
Policy       = Rules
Service Conn = Azure authentication
Environment  = Deployment control
```

### ⭐ Most important interview statement

> **Azure DevOps Organization is the top-level DevOps boundary. Projects contain teams, repositories, boards, pipelines and artifacts. Permissions control access, branch policies protect source code, and environments plus service connections secure deployments to Azure.**
