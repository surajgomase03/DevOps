# Azure Repos + Git — 10-Minute Interview Runbook

## 1. Core Mental Model

```text
Azure DevOps
     ↓
Azure Repos
     ↓
Git Repository
     ↓
Feature Branch
     ↓
Commit → Push
     ↓
Pull Request
     ↓
Review + Build Validation
     ↓
Merge → main
     ↓
CI/CD → Azure / AKS
```

**One-liner:**  
I use Azure Repos with Git for source control, feature branches for development, Pull Requests for controlled integration, and branch policies such as required reviewers and build validation to protect important branches like `main`.

---

## 2. Azure Repos vs Git

| Git | Azure Repos |
|---|---|
| Version-control tool | Git repository hosting service |
| Runs locally | Central remote repository |
| Commit, branch, merge | PR, policies, permissions |
| Can work offline | Team collaboration |

**Remember:**

> Git = technology/tool  
> Azure Repos = hosting + collaboration

---

## 3. Git Architecture

```text
Working Directory
       ↓ git add
Staging Area
       ↓ git commit
Local Repository
       ↓ git push
Azure Repos
```

### `origin`

Remote repository name created automatically after clone.

```bash
git remote -v
```

### `HEAD`

Points to the currently checked-out commit/branch.

```text
A → B → C
        ↑
       HEAD

HEAD~1 = B
HEAD~2 = A
```

---

## 4. Most Important Git Commands

### Clone

First time downloading repository:

```bash
git clone <repo-url>
```

**Remote → Local**

### Fetch

Download remote changes **without modifying current branch**:

```bash
git fetch origin
```

### Pull

Fetch + integrate:

```bash
git pull
git pull --rebase
git pull --ff-only
```

### Interview trap

> **Fetch = download only**  
> **Pull = download + integrate**

### Push

Local → Remote:

```bash
git push origin feature/payment
git push -u origin feature/payment
```

If the remote has newer commits, you may get a `non-fast-forward` rejection. Fetch/pull, resolve if needed, and push again.

---

## 5. Branches

```bash
git branch
git branch -a

git switch -c feature/payment
git switch feature/payment

git branch -d feature/payment
git branch -D feature/payment

git push origin --delete feature/payment
```

Typical:

```text
main
 ├── feature/login
 ├── feature/payment
 └── feature/report
```

**Why branches?**

> Developers can work independently without directly modifying `main`.

---

## 6. Daily Developer Workflow

```bash
git clone <url>

git status

git switch main
git pull --ff-only

git switch -c feature/payment

# make changes

git add .
git commit -m "Add payment validation"

git push -u origin feature/payment
```

Then:

```text
Create PR
   ↓
Review
   ↓
Build Validation
   ↓
Tests / Security Scan
   ↓
Approval
   ↓
Merge
```

---

## 7. Merge vs Rebase

### Merge

Combines histories.

```bash
git merge feature/payment
```

```text
A → B ───── M
     \     /
      C → D
```

Doesn't rewrite existing commits.

### Rebase

Replays your commits on a new base.

```bash
git rebase origin/main
```

```text
Before:

A → B → C
     \
      D → E

After:

A → B → C → D' → E'
```

**Rebase rewrites commit IDs.**

### Remember

> **Merge = preserve history**  
> **Rebase = clean linear history + rewritten commits**

Don't casually rebase shared branches.

If you rebased your own already-pushed branch:

```bash
git push --force-with-lease
```

Avoid plain:

```bash
git push --force
```

---

## 8. Cherry-pick

Copies **one specific commit**.

```bash
git cherry-pick <commit-id>
```

Example:

```text
develop
A → B → C → D
        ↑
      bug fix

release
A → B

cherry-pick C

release
A → B → C'
```

### Use case

A production bug fix exists in another branch and you need only that particular commit.

---

## 9. Reset vs Revert

### Reset

Moves branch/HEAD backward.

```bash
git reset --soft HEAD~1
git reset HEAD~1
git reset --hard HEAD~1
```

| Mode | Result |
|---|---|
| `--soft` | Changes remain staged |
| `--mixed` | Changes remain unstaged |
| `--hard` | Changes discarded |

⚠️ `--hard` can delete local changes.

### Revert

Creates a **new commit** that reverses an old commit.

```bash
git revert <commit-id>
```

```text
A → B → C → R
          ↑
       undo C
```

### Golden rule

```text
Local/private work → reset

Already pushed/shared main → revert
```

---

## 10. `reflog` — Git Safety Net

If you accidentally do:

```bash
git reset --hard
```

use:

```bash
git reflog
```

Find the previous commit and recover:

```bash
git reset --hard <commit-id>
```

or:

```bash
git switch -c rescue <commit-id>
```

**Remember:**

> `reflog` = history of where `HEAD` has been.

---

## 11. Stash

Temporarily save uncommitted work.

```text
Working on payment
       ↓
Urgent production task
       ↓
git stash
       ↓
Switch branch
       ↓
Fix production issue
       ↓
Return
       ↓
git stash pop
```

Commands:

```bash
git stash
git stash -u
git stash list
git stash pop
git stash apply
git stash drop stash@{0}
```

### `pop` vs `apply`

```text
pop    = apply + remove stash
apply  = apply + keep stash
```

---

## 12. Tags

Tag = named reference to a commit.

Commonly used for releases.

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

```text
A → B → C → D
        ↑
      v1.0.0
```

**Interview answer:**

> A Git tag identifies a specific commit, commonly used to mark releases.

---

## 13. Pull Request

A PR is a **review and controlled integration workflow**.

```text
Feature Branch
      ↓
    Push
      ↓
 Pull Request
      ↓
 Code Review
      ↓
 Build Validation
      ↓
 Tests / Security
      ↓
 Approval
      ↓
    Merge
      ↓
    main
```

### Important

> **PR ≠ `git merge`**

PR is the collaboration/review process.

`git merge` is the Git operation that combines branches.

---

## 14. Branch Policies

Protect `main` using:

```text
main
 ├── PR required
 ├── Minimum reviewers
 ├── Build validation
 ├── Linked work items
 ├── Comment resolution
 ├── Merge-type restrictions
 ├── Status checks
 └── Required reviewers
```

Example:

```text
Developer
    ↓
feature/payment
    ↓
Pull Request
    ↓
2 reviewers
    ↓
Build Validation
    ↓
Tests
    ↓
Approved
    ↓
main
```

---

## 15. Permission vs Policy

| Permission | Policy |
|---|---|
| **WHO** can perform action | **WHAT conditions** must be satisfied |
| Push | PR required |
| Delete branch | Reviewers |
| Force push | Build validation |
| Bypass policy | Comment resolution |

### Easy memory trick

> **Permission = WHO**  
> **Policy = CONDITIONS**

---

## 16. Build Validation

For Azure Repos Git:

```text
PR
 ↓
Build Validation
 ↓
Build
 ↓
Unit Tests
 ↓
Security Scan
 ↓
PASS → PR can continue
FAIL → PR blocked
```

### Important Azure interview trap

For **Azure Repos Git**, PR validation is configured through:

**Branch Policy → Build Validation**

Do not rely on:

```yaml
pr:
```

for Azure Repos Git.

---

## 17. Branch Protection — Production Example

```text
main
 │
 ├── Direct push ❌
 ├── PR required
 ├── 2 reviewers
 ├── Build validation
 ├── Comment resolution
 ├── Squash merge
 ├── Force push ❌
 └── Bypass policy ❌
```

Developer workflow:

```text
feature/payment
       ↓
      PR
       ↓
 Review + CI + Security
       ↓
    Approved
       ↓
      main
       ↓
 Production Pipeline
```

---

## 18. Merge Conflict

Occurs when Git cannot automatically combine changes.

Example:

```text
<<<<<<< HEAD
your code
=======
other developer code
>>>>>>> feature
```

### Resolution

```text
1. Fetch latest target branch
2. Update feature branch
3. Open conflicting file
4. Decide correct code
5. Remove conflict markers
6. git add
7. Commit
8. Push
9. Build validation runs again
```

Example:

```bash
git fetch origin
git switch feature/payment
git merge origin/main

# resolve conflicts

git add .
git commit
git push
```

---

## 19. Git Flow vs Trunk-Based

### Git Flow

```text
main
 ↓
develop
 ↓
feature/*
 ↓
release/*
 ↓
main
```

Useful for scheduled/versioned releases.

### Trunk-Based

```text
main
 ↑
short-lived feature branch
 ↑
small PR
```

Small, frequent merges.

| Git Flow | Trunk-Based |
|---|---|
| More long-lived branches | Short-lived branches |
| Scheduled releases | Frequent releases |
| More merge complexity | Simpler flow |
| Versioned software | SaaS / microservices |

---

## 20. Most Important Troubleshooting

### Developer cannot push to main

Check:

```text
Branch policy?
     ↓
PR required?
     ↓
Contribute permission?
     ↓
Force push restriction?
     ↓
Bypass permission?
```

If protected:

```text
main ❌
   ↓
feature branch
   ↓
PR
   ↓
Review + validation
   ↓
Merge
```

### PR build failed

```text
Open PR
 ↓
Open pipeline result
 ↓
Check failed job
 ↓
Read logs
 ↓
Identify build/test/lint issue
 ↓
Fix code
 ↓
Push same branch
 ↓
Pipeline reruns
 ↓
Validation passes
```

### Non-fast-forward error

```text
Remote has newer commits
        ↓
git fetch
        ↓
git pull --rebase
        ↓
Resolve conflicts if needed
        ↓
git push
```

### Authentication failed

Check:

- PAT expired/revoked
- Wrong Git Credential Manager account
- Repository permission
- SSH key configuration

---

## 21. Must-Know Command Table

| Command | Remember |
|---|---|
| `clone` | Remote → local |
| `fetch` | Download only |
| `pull` | Fetch + integrate |
| `push` | Local → remote |
| `branch` | Manage branches |
| `switch` | Change branch |
| `merge` | Combine branches |
| `rebase` | Replay commits |
| `cherry-pick` | Copy one commit |
| `reset` | Move history |
| `revert` | New undo commit |
| `stash` | Temporarily save work |
| `tag` | Mark commit/release |
| `reflog` | Recover lost commits |
| `PR` | Review + controlled merge |

---

## 22. Top 15 Interview Questions — Ready Answers

### 1. What is Azure Repos?

> Azure Repos is the source-control service in Azure DevOps that hosts Git repositories and provides Pull Requests, branch policies and permissions.

### 2. Git vs Azure Repos?

> Git is the version-control tool, while Azure Repos is the hosting and collaboration service around Git.

### 3. Clone vs pull?

> Clone downloads a repository for the first time. Pull updates an existing local branch from the remote.

### 4. Fetch vs pull?

> Fetch downloads remote changes without integrating them. Pull downloads and integrates them into the current branch.

### 5. Merge vs rebase?

> Merge combines histories without rewriting existing commits. Rebase replays commits on a new base and creates new commit IDs.

### 6. Reset vs revert?

> Reset moves branch history and can rewrite it. Revert creates a new commit that reverses a previous commit, so I use revert for shared branches.

### 7. What is cherry-pick?

> Cherry-pick applies one specific commit to another branch.

### 8. What is stash?

> Stash temporarily stores uncommitted changes so I can switch branches or handle another task.

### 9. What is a Pull Request?

> A Pull Request is a controlled workflow for reviewing and validating code before merging it into another branch.

### 10. How do you protect main?

> I require PRs, minimum reviewers, build validation, comment resolution and restrict direct push, force push and bypass permissions.

### 11. What is build validation?

> It runs a CI pipeline against a PR and blocks completion when the required build or validation fails.

### 12. Permission vs policy?

> Permission controls who can perform an action, while policy defines the conditions that must be satisfied before merging.

### 13. How do you undo a production commit?

> If the commit is already pushed to shared main, I use `git revert` and merge the revert through a PR instead of rewriting shared history.

### 14. How do you recover after `reset --hard`?

> I use `git reflog` to find the previous commit and recover it with `git reset` or by creating a rescue branch.

### 15. Does `pr:` YAML trigger work for Azure Repos?

> No. For Azure Repos Git, PR validation is configured through branch policy build validation.

---

# Final 60-Second Revision

```text
Azure Repos = Git hosting + PR + Policies

clone       = remote → local
fetch       = download remote changes, no integration
pull        = fetch + integrate
push        = local → remote

merge       = combine histories
rebase      = replay commits on new base
cherry-pick = copy one specific commit
reset       = move/reset history
revert      = new commit that undoes another commit
stash       = temporarily store uncommitted work
tag         = named reference to a commit
reflog      = recover lost commits

PR         = review workflow
Permission = WHO can do it
Policy     = WHAT conditions must be met
Build Validation = CI check for PR
```

## ⭐ One-Line Interview Answer

> **I use Azure Repos with Git for source control, feature branches for development, Pull Requests for controlled code integration, and branch policies such as required reviewers and build validation to protect important branches like `main`. For undoing shared changes I use `revert`, and I enforce rules through branch policies rather than relying only on local hooks.**
