# 🌿 Azure Repos + Git — Detailed Interview Notes

> **One-liner:** I use **Azure Repos with Git** for source control, **feature branches** for development, **Pull Requests** for controlled integration, and **branch policies** (required reviewers, build validation) to protect important branches like `main`.

Don't learn Azure Repos separately from Git:

```text
Azure Repos
     ↓
Git Repository
     ↓
Branches → Commit → Push → Pull Request
                         ↓
                 Branch Policies
                         ↓
                Build Validation
                         ↓
                      Merge
```

---

## 📑 Contents

1. [What is Azure Repos?](#1-what-is-azure-repos)
2. [Git Architecture: HEAD, origin](#2-git-architecture-head-origin)
3. [Core Commands: clone, fetch, pull, push, branch](#3-core-commands)
4. [Branching Strategies](#4-branching-strategies)
5. [Merge, Conflicts, Rebase, Cherry-pick](#5-merge-conflicts-rebase-cherry-pick)
6. [Undoing Changes: reset, revert, reflog](#6-undoing-changes-reset-revert-reflog)
7. [Stash, Tags, Hooks](#7-stash-tags-hooks)
8. [Pull Requests, Policies & Branch Protection](#8-pull-requests-policies--branch-protection)
9. [Complete Architecture](#9-complete-architecture)
10. [Git Command Cheat Sheet](#10-git-command-cheat-sheet)
11. [Azure CLI for Repos](#11-azure-cli-for-repos)
12. [Hands-On Lab](#12-hands-on-lab)
13. [Troubleshooting Scenarios](#13-troubleshooting-scenarios)
14. [Interview Questions & Answers](#14-interview-questions--answers)
15. [Memory Summary](#15-memory-summary)

---

# 1. What is Azure Repos?

**Azure Repos** is the source-control service in Azure DevOps. It provides **Git repositories** for:

* Source code and version control
* Branching
* Pull Requests and code reviews
* Branch policies
* Collaboration

```text
Azure DevOps → Project → Repos → payment-api
```

## 1.1 Git vs Azure Repos

| Git | Azure Repos |
| --- | --- |
| The **version-control tool** (runs locally) | A **hosting service** for Git repositories |
| Commits, branches, merges | Adds Pull Requests, branch policies, permissions, build validation |
| Works offline | Central remote (`origin`) for the team |

> Azure Repos is similar to GitHub or GitLab. Git is the technology underneath all of them.

## 1.2 Clone URLs and authentication

```text
HTTPS: https://dev.azure.com/<org>/<project>/_git/<repo>
SSH:   git@ssh.dev.azure.com:v3/<org>/<project>/<repo>
```

| Method | Notes |
| --- | --- |
| **HTTPS + Git Credential Manager** | Browser/Entra sign-in. Best for developers |
| **HTTPS + PAT** | Personal Access Token. It expires, so treat it like a password |
| **SSH keys** | Add your public key under **User settings → SSH public keys** |

## 1.3 Useful repo features

* Multiple repos per project, **default branch** (usually `main`)
* **Import** a repo from another Git host
* **Fork** a repo
* **Git LFS** for large binary files
* Branch **locks**, permissions and policies
* **Cherry-pick**, revert and create-branch directly in the PR/branch UI

---

# 2. Git Architecture: HEAD, origin

## 2.1 The four areas

```text
Working Directory
      │  git add
      ▼
Staging Area (index)
      │  git commit
      ▼
Local Repository
      │  git push
      ▼
Remote Repository (Azure Repos)
```

```text
Developer Laptop
       │ git push
       ▼
Remote Repository (Azure Repos)
       │ Pull Request
       ▼
      main
```

## 2.2 `origin`

When you clone, Git creates a remote named **`origin`** that points to the cloned URL.

```bash
git remote -v
```

```text
origin  https://dev.azure.com/org/project/_git/payment-api (fetch)
origin  https://dev.azure.com/org/project/_git/payment-api (push)
```

## 2.3 `HEAD` and `HEAD~1`

`HEAD` points to the currently checked-out commit/branch.

```text
A ── B ── C
          ↑
         HEAD

HEAD~1 = B  (parent)
HEAD~2 = A
```

> **Detached HEAD** = `HEAD` points to a commit, not a branch (for example after `git checkout <commit-id>`). New commits can get lost, so create a branch with `git switch -c <name>`.

---

# 3. Core Commands

## 3.1 `git clone`

Downloads a remote repository (with full history) and creates a local working copy.

```bash
git clone https://dev.azure.com/company/project/_git/payment-api
```

```text
Azure Repos → clone → Developer Laptop
```

## 3.2 `git fetch`

Downloads remote commits and updates **remote-tracking branches** (`origin/main`) **without changing your current branch**.

```bash
git fetch origin
```

```text
Remote main:  A ── B ── C
After fetch:  origin/main = C      local main still = B
```

## 3.3 `git pull`

`git fetch` + **integrate** into the current branch (merge by default, or rebase).

```bash
git pull
git pull --rebase           # fetch + rebase instead of merge
git pull --ff-only          # fail unless it can fast-forward (safe)
```

```text
fetch = download only
pull  = download + integrate
```

| Fetch | Pull |
| --- | --- |
| Downloads remote changes | Downloads + integrates |
| Doesn't change the current branch | Updates the current branch |
| Safer for inspection | Convenient for syncing |

## 3.4 `git push`

Uploads local commits to the remote.

```bash
git push origin feature/payment
git push -u origin feature/payment      # also sets upstream tracking
```

```text
Local: A ── B ── C        Remote: A ── B
After push → Remote: A ── B ── C
```

> If the remote has commits you don't have, push is **rejected (non-fast-forward)**. Fetch/pull first.

## 3.5 `git branch` and `git switch`

```bash
git branch                       # list local branches
git branch -a                    # local + remote
git branch feature/payment       # create
git switch feature/payment       # switch
git switch -c feature/payment    # create + switch
git checkout -b feature/payment  # older equivalent
git branch -d feature/payment    # delete (merged only)
git branch -D feature/payment    # force delete
git push origin --delete feature/payment   # delete remote branch
git fetch --prune                # remove stale remote-tracking branches
```

## 3.6 Why branches?

```text
main
 ├── feature/login
 ├── feature/payment
 └── feature/report
```

Developers work independently without modifying `main` directly.

---

# 4. Branching Strategies

# Git Flow Branching Strategy — Simple + Deep

**Branching strategy** = A way to organize Git branches so developers can work safely without directly disturbing production.

Think of branches as **separate lanes for development**.

```text
                 main
                  ↑
             release/1.0
                  ↑
               develop
              ↑   ↑   ↑
             /    |    \
      feature/login  feature/payment
```

---

## 1. `main` 🔴

**Main = Production code**

```text
main
 ↓
Production
```

* Contains stable code.
* Code here should be production-ready.
* Developers normally don't directly develop features here.

👉 **Remember:** `main = Production`

---

## 2. `develop` 🔴

**develop = Integration branch**

Completed features come together here.

```text
feature/login ──┐
feature/payment ─┼──→ develop
feature/profile ─┘
```

* Developers merge completed features here.
* Testing/integration happens here.
* It contains upcoming changes that are not yet released to production.

👉 **Remember:** `develop = Upcoming version`

---

## 3. `feature/*` 🔴

Used for developing **one feature or change**.

Example:

```text
feature/login
feature/payment
feature/profile
```

Usually created from `develop`:

```text
develop
   |
   +---- feature/login
   |
   +---- feature/payment
```

After development:

```text
feature/login
      ↓
Pull Request
      ↓
develop
```

👉 **Remember:** `feature = Developer's work`

---

## 4. `release/*` 🟡

Used when the application is almost ready for production.

Example:

```text
release/1.0
release/2.0
```

Created from:

```text
develop
   ↓
release/1.0
```

Now the team mainly does:

* Testing
* Bug fixing
* Version preparation
* Final validation

Example:

```text
develop
   ↓
release/1.0
   ↓
Testing
   ↓
Bug fixes
   ↓
Production
```

👉 **Remember:** `release = Final preparation`

---

## 5. `hotfix/*` 🔴

Used for an **urgent production problem**.

Suppose:

```text
Production
   ↓
main
```

A critical bug is discovered.

Create:

```text
hotfix/payment-error
```

from `main`.

```text
main
 |
 +---- hotfix/payment-error
              |
              ↓
         Fix + Test
              |
              ↓
             main
```

After fixing, the fix should also be incorporated into the development line so it isn't lost from future releases.

```text
hotfix
  ├──→ main
  │
  └──→ develop
```

👉 **Remember:** `hotfix = Urgent production fix`

---

# Complete Git Flow

```text
                         Production
                             ↑
                           main
                             ↑
                       release/1.0
                             ↑
                          develop
                       ↑      ↑      ↑
                      /       |       \
                     /        |        \
          feature/login  feature/payment  feature/profile
```

### Normal development

```text
feature
   ↓
develop
   ↓
release
   ↓
main
   ↓
Production
```

### Emergency production fix

```text
main
 ↓
hotfix
 ↓
main
 ↓
Production

hotfix
 ↓
develop
```

---

# Real Example

Suppose you are building an **e-commerce application**.

### Developer 1

Works on login:

```text
feature/login
```

### Developer 2

Works on payment:

```text
feature/payment
```

Both finish:

```text
feature/login ──────┐
                    ├──→ develop
feature/payment ────┘
```

The team tests everything.

When ready:

```text
develop
   ↓
release/1.0
   ↓
Final testing
   ↓
main
   ↓
Production
```

---

# What is a Pull Request?

Usually developers don't directly merge their branch.

```text
feature/login
      ↓
Pull Request
      ↓
Code Review
      ↓
CI Tests
      ↓
Approved
      ↓
develop
```

**Pull Request (PR)** = Request to merge your changes into another branch.

---

# Why use branches?

Without branches:

```text
Everyone → main → 😵
```

One developer's unfinished code could affect production.

With branches:

```text
Developer
   ↓
feature branch
   ↓
Testing / Review
   ↓
develop
   ↓
release
   ↓
main
```

👉 **Branches provide isolation and controlled integration.**

---

# Important Interview Point 🔴

These branch names are **not mandatory Git/Azure Repos requirements**.

You can create:

```text
main
develop
feature/*
release/*
hotfix/*
```

or use another strategy.

The organization decides the branching model.

---

# 🧠 Easy Memory

```text
main       = Production
develop    = Integration
feature    = New feature
release    = Prepare release
hotfix     = Urgent production fix
```

### One-line interview answer

> **Git Flow is a branching model where feature branches are integrated into develop, release branches are used for final testing and stabilization, main represents production, and hotfix branches are used for urgent production fixes.**


## 4.2 Trunk-based development

```text
main  ◄── short-lived feature branches (hours to 1–2 days) via small PRs
```

* Small, frequent merges to `main`, protected by PR validation.
* Feature flags hide unfinished work.
* Fits **continuous delivery** and fast CI/CD.

## 4.3 Comparison

| | Git Flow | Trunk-based |
| --- | --- | --- |
| Branches | Many long-lived (`develop`, `release/*`) | One main + short-lived feature branches |
| Release style | Scheduled releases | Continuous delivery |
| Merge pain | Higher (long-lived branches) | Lower |
| Best for | Versioned/packaged software | SaaS, microservices, high-frequency deploys |

## 4.4 Naming conventions

```text
feature/<ticket>-short-description     feature/1234-payment-validation
bugfix/<ticket>-...                    hotfix/<ticket>-...
release/1.0
```

* Link work items in the PR/commit (for example `#1234`) to connect code and Boards.
* Commit messages: short, imperative subject (`Add payment validation`). Conventional Commits (`feat:`, `fix:`) are common.

---

# 5. Merge, Conflicts, Rebase, Cherry-pick

## 5.1 `git merge`

```bash
git switch develop
git merge feature/payment
```

```text
Before:                       After merge:
main  A ── B                  main  A ── B ───── M
           \                              \     /
            C ── D  feature                C ── D
```

`M` is a **merge commit**. If no divergence exists, Git can just **fast-forward**.

```bash
git merge --no-ff feature/payment     # always create a merge commit
git merge --abort                     # cancel a conflicted merge
```

## 5.2 Merge types in Azure Repos PRs

| Merge type | Result |
| --- | --- |
| **Merge (no fast-forward)** | Merge commit, full history preserved |
| **Squash merge** | All PR commits squashed into **one** commit on the target (clean `main`) |
| **Rebase and fast-forward** | Commits replayed on target, linear history, no merge commit |
| **Semi-linear merge** | Rebase source, then merge commit with no-ff |

> A branch policy can **limit allowed merge types** (for example squash only).

## 5.3 Merge conflict

Occurs when Git can't automatically combine changes (for example two people edit the same line).

```text
<<<<<<< HEAD
your code
=======
other code
>>>>>>> feature
```

Steps:

```text
1. Open the file
2. Decide the correct code
3. Remove conflict markers
4. git add <file>
5. git commit      (or: git rebase --continue / git merge --continue)
```

```bash
git status                     # shows "both modified" files
git add .
git commit -m "Resolve merge conflict"
```

## 5.4 `git rebase`

Replays your commits on top of another base.

```text
Before:                        After:
main  A ── B ── C              main  A ── B ── C
       \                                        \
        D ── E  feature                          D' ── E'
```

```bash
git switch feature/payment
git fetch origin
git rebase origin/main
git rebase --continue     # after resolving conflicts
git rebase --abort        # cancel
git rebase -i HEAD~3      # interactively squash/reword/reorder last 3 commits
```

> `D'` and `E'` are **new commits** (new IDs). Rebase **rewrites history**.

## 5.5 Merge vs Rebase

| Merge | Rebase |
| --- | --- |
| Creates a merge relationship | Replays commits |
| Preserves branch history | Cleaner **linear** history |
| Doesn't rewrite existing commits | Rewrites commit IDs |
| Safer for shared branches | Be careful on shared branches |

> ⭐ **Rule:** Don't rebase commits that others already depend on (pushed shared branches), unless your team has a defined process. If you rebase a branch you've already pushed, use `git push --force-with-lease` (never plain `--force`).

## 5.6 Keeping a feature branch updated

```bash
git switch feature/payment
git fetch origin
git merge origin/develop        # merge-based update: keeps your commits unchanged
# or
git rebase origin/develop       # rebase-based update: cleaner linear history
```

```text
Merge update:  A ── B ── C           Rebase update:  A ── B ── C
                \         \                                    \
                 D ── E ── M                                    D' ── E'
```

## 5.7 `git cherry-pick`

Copies **one specific commit** onto the current branch.

```text
main:     A ── B
feature:  A ── B ── C ── D        (only need C)

git cherry-pick <C>   →   main: A ── B ── C'
```

```bash
git cherry-pick <commit-id>
git cherry-pick -x <commit-id>     # adds "(cherry picked from ...)" to the message
git cherry-pick A..B               # a range
git cherry-pick --abort
```

**Use case:** a bug fix on `develop` is needed in `release/1.0` immediately.

```text
develop (bug-fix commit) → cherry-pick → release
```

---

# 6. Undoing Changes: reset, revert, reflog

## 6.1 `git reset`

Moves the current branch/HEAD to another commit. Three modes:

| Mode | HEAD / branch | Staging area | Working directory |
| --- | --- | --- | --- |
| `--soft` | Moves | **Keeps** changes staged | Keeps |
| `--mixed` (default) | Moves | Resets (unstaged) | **Keeps** changes |
| `--hard` | Moves | Resets | **Discards** changes ⚠️ |

```bash
git reset --soft  HEAD~1     # undo commit, keep changes staged
git reset         HEAD~1     # undo commit, keep changes unstaged (mixed)
git reset --hard  HEAD~1     # undo commit AND discard changes
```

> ⚠️ *I avoid `git reset --hard` unless I'm certain the changes can be discarded.*

## 6.2 `git revert`

Creates a **new commit** that reverses an earlier commit. History is preserved.

```bash
git revert <commit-id>
git revert -m 1 <merge-commit-id>      # revert a merge commit (keep parent 1 = mainline)
```

```text
Before:  A ── B ── C        (C broke production)
After:   A ── B ── C ── R   (R undoes C)
```

## 6.3 Reset vs Revert ⭐

| Reset | Revert |
| --- | --- |
| Moves branch history | Creates a **new commit** |
| Can rewrite history | Preserves history |
| For local/private work | **Good for shared/pushed branches** |
| `--hard` can discard work | Safer for production |

```text
RESET  = move/remove history
REVERT = create a new undo commit
```

> For an already-pushed change on shared `main`, use **`revert`**.

## 6.4 Other undo tools

```bash
git restore <file>                  # discard unstaged changes in a file
git restore --staged <file>         # unstage a file
git commit --amend                  # fix the last commit (message/content), only if not pushed
git reflog                          # history of where HEAD has been, recovers "lost" commits
git reset --hard <commit-from-reflog>   # go back after a mistake
```

> `git reflog` is the safety net: even after `reset --hard`, the old commit IDs are usually still there for a while.

## 6.5 Undo scenario table

| Situation | Fix |
| --- | --- |
| Typo in the last commit message (not pushed) | `git commit --amend` |
| Undo last commit, keep the work | `git reset --soft HEAD~1` (or `--mixed`) |
| Committed on the wrong branch | `git switch correct-branch`, `git cherry-pick <id>`, then `git reset --hard HEAD~1` on the wrong branch |
| Bad commit already pushed to `main` | `git revert <id>`, then push through a PR |
| Lost a commit after reset | `git reflog` → `git reset --hard <id>` or `git switch -c rescue <id>` |
| Staged a file by mistake | `git restore --staged <file>` |
| Secret/password committed | **Rotate the secret first**, then remove it from history (`git filter-repo` / BFG) and force-push, or follow your organization's process |

---

# 7. Stash, Tags, Hooks

## 7.1 `git stash`

Temporarily stores **uncommitted** changes so you can switch tasks.

```text
Working on feature/payment → urgent task arrives → git stash → switch branch → fix → switch back → git stash pop
```

```bash
git stash                            # stash tracked changes
git stash push -m "wip payment"      # with a name
git stash -u                         # also include untracked files
git stash list
git stash pop                        # apply + remove from the stash list
git stash apply                      # apply, keep in the stash list
git stash drop stash@{0}
```

## 7.2 `git tag`

A **named reference to a specific commit**, commonly used for releases.

```bash
git tag v1.0.0                       # lightweight tag
git tag -a v1.0.0 -m "Release 1.0.0" # annotated tag (has author, date, message)
git tag                              # list
git push origin v1.0.0               # push one tag
git push origin --tags               # push all tags
git tag -d v1.0.0                    # delete locally
```

```text
main:  commit A ── commit B ── commit C ← v1.0.0 ── commit D
```

| Lightweight | Annotated |
| --- | --- |
| Just a pointer | Full object with tagger, date, message |
| Quick/private | **Preferred for releases** |

> Pipelines can be triggered by tags (for example `v*`). A pipeline that pushes tags needs **Contribute** and **Create tag** permissions for the build identity.

## 7.3 Git hooks

Scripts that run automatically at Git events: `pre-commit`, `commit-msg`, `pre-push`, `post-merge`.

```text
git commit → pre-commit hook → lint / secret scan → allow or reject commit
```

Use cases: formatting, linting, **secret detection**, commit-message validation, quick local tests. Tools: the `pre-commit` framework, gitleaks, detect-secrets.

```text
Git hook       → client-side automation, can be bypassed (--no-verify) or missing on a machine
Azure Pipeline → server-side CI/CD automation, can be enforced
```

> ⭐ For organization-wide enforcement don't rely only on local hooks. Azure Repos (cloud) doesn't run custom server-side Git hooks, so enforce with **branch policies, build validation and status checks** (and secret scanning/push protection where licensed).

---

# 8. Pull Requests, Policies & Branch Protection

## 8.1 Pull Request (PR)

A request to **merge changes from one branch into another**, with review and validation.

```text
feature/payment ──► Pull Request ──► develop / main
```

A PR provides: code review, discussion, **build validation**, tests, security checks and **branch policy enforcement**.

```text
Developer → feature/payment → git push → Create PR → Reviewer
         → Build Validation → Automated Tests → Approval → Merge → main
```

> **PR ≠ the `git merge` command.** A PR is a collaboration/review workflow. The merge operation happens after the required checks pass.

## 8.2 Required reviewers

```text
Minimum reviewers = 2
PR → Reviewer 1 → Reviewer 2 → Approved → Merge
```

Also possible: **automatically include required reviewers** for certain paths/teams (for example `/infra/*` requires the DevOps team), and **reset votes when new commits are pushed**.

## 8.3 Build validation ⭐

Runs a pipeline on every PR.

```text
PR → Build Pipeline → Compile → Unit Tests → Security Scan → Result

Build ❌ → PR cannot be completed
Build ✅ → other policies → approval → merge
```

```text
Developer creates feature/payment → PR
   → Azure Pipeline → Build → Unit Test → SonarQube → Security Scan
   → All checks PASS → Reviewer approval → Merge
```

> ⚠️ **Gotcha:** for **Azure Repos Git**, the `pr:` trigger in YAML is **not** used. PR pipelines are configured through **branch policy → Build validation**. (The `pr:` trigger applies to GitHub and Bitbucket repos.)

Build validation options: **trigger** (automatic/manual), **policy requirement** (required/optional), **build expiration**, and **path filters** (run only when certain paths change).

## 8.4 Branch policies

```text
main
 ├── Require a Pull Request
 ├── Minimum number of reviewers
 ├── Build validation
 ├── Check for linked work items
 ├── Comment resolution
 ├── Limit merge types
 ├── Status checks (external services)
 └── Automatically included reviewers
```

Policies can apply to a **branch pattern**, for example `release/*`.

## 8.5 Branch protection

```text
Developer ──direct push──X──► main

Developer → feature branch → Pull Request → Review → Build Validation → Approval → main
```

If a developer tries to push directly, they get an error like:

```text
TF402455: Pushes to this branch are not permitted; you must use a pull request to update this branch.
```

## 8.6 Permission vs Policy ⭐

| Permission | Policy |
| --- | --- |
| **WHO** can perform an action | **WHAT CONDITIONS** must be met before merging |
| Can a developer push? Delete a branch? Force push? Bypass policies? | PR required, reviewers, build validation |
| Per user/group | Per branch |

> Tight control: restrict **Force push** and **Bypass policies when completing pull requests**.

## 8.7 PR vs Merge (don't confuse)

```text
Merge = Git operation:  git merge feature/payment
PR    = Review workflow:  Developer → PR → Review → Validation → Merge
```

## 8.8 Example production protection

```text
main → Production
│
├── Direct push restricted
├── PR required
├── Minimum reviewers (2)
├── Build validation (CI must pass)
├── Comment resolution
└── Squash merge only

Developer → feature/payment → PR → main → Reviewer → CI Build → Tests → Security checks
          → Approved → Merge → Production pipeline
```

---

# 9. Complete Architecture

```text
                    Azure DevOps
                         │
                         ▼
                    Azure Repos
                         │
                         ▼
                      Git Repo
                         │
             ┌───────────┴───────────┐
           main                  develop
             │                       │
             │              ┌────────┼────────┐
             │         feature/* feature/* feature/*
             │                       │
             │                       ▼
             │                  Pull Request
             │                       │
             │            ┌──────────┼──────────┐
             │         Review     Build        Tests
             │                  Validation
             │            └──────────┼──────────┘
             │                       ▼
             │                     Merge
             └───────────────────────┘
                         │
                         ▼
                       CI/CD
                         │
                         ▼
                    Azure / AKS
```

---

# 10. Git Command Cheat Sheet

## 10.1 Daily workflow

```bash
git clone <url>
git status
git switch develop
git pull --ff-only
git switch -c feature/payment
git add .
git commit -m "Add payment validation"
git push -u origin feature/payment
```

## 10.2 Inspect

```bash
git log --oneline
git log --oneline --graph --decorate --all
git diff                     # unstaged changes
git diff --staged            # staged changes
git show <commit-id>
git blame <file>
git remote -v
git branch -vv               # branches with upstream and last commit
```

## 10.3 Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@company.com"
git config --global pull.ff only
git config --global init.defaultBranch main
```

## 10.4 Comparison table

| Command | Purpose |
| --- | --- |
| `clone` | Download repository |
| `fetch` | Download remote changes (no integration) |
| `pull` | Fetch + integrate |
| `push` | Upload commits |
| `branch` / `switch` | Manage / change branches |
| `merge` | Combine branches |
| `rebase` | Replay commits on a new base |
| `cherry-pick` | Apply one specific commit |
| `reset` | Move/reset branch history |
| `revert` | Create an undo commit |
| `stash` | Temporarily store uncommitted changes |
| `tag` | Mark a specific commit |
| hook | Run a script on a Git event |
| PR | Request code review and merge |

---

# 11. Azure CLI for Repos

> Verify flags with `az repos --help`.

```bash
az extension add --name azure-devops
az devops configure --defaults organization=https://dev.azure.com/<org> project=<project>

# Repos
az repos create --name payment-api
az repos list -o table
az repos import create --git-source-url https://github.com/org/repo.git --repository payment-api

# Branches
az repos ref list --repository payment-api --filter heads -o table

# Pull requests
az repos pr create --repository payment-api \
  --source-branch feature/payment --target-branch main \
  --title "Add payment validation" --work-items 1234 \
  --auto-complete true --squash true --delete-source-branch true
az repos pr list --status active -o table
az repos pr set-vote --id <pr-id> --vote approve
az repos pr update --id <pr-id> --status completed

# Policies
az repos policy approver-count create --repository-id <repo-id> --branch main \
  --blocking true --enabled true --minimum-approver-count 2 \
  --creator-vote-counts false --allow-downvotes false --reset-on-source-push true
az repos policy list --branch main -o table
```

---

# 12. Hands-On Lab

| Step | Task |
| --- | --- |
| 1 | Create a repo `payment-api` and clone it |
| 2 | Add `README.md`, commit and push to `main` |
| 3 | Create `feature/payment`, commit twice, push |
| 4 | Run `git fetch` from a second clone and see `origin/...` update without changing the local branch |
| 5 | Add branch policies on `main`: PR required, 1 reviewer, build validation, comment resolution |
| 6 | Try `git push origin main` and read the **TF402455** error |
| 7 | Open a PR, review it, fix a failing build, complete it with **squash** |
| 8 | Create a **conflict**: edit the same line in two branches and resolve it |
| 9 | Practice `rebase -i` to squash commits, then `push --force-with-lease` |
| 10 | Make a bad commit on `main` (via PR) and **revert** it |
| 11 | Run `git reset --hard HEAD~1`, then recover with `git reflog` |
| 12 | `git stash` / `git stash pop` while switching branches |
| 13 | Create an annotated tag `v1.0.0` and push it |
| 14 | Cherry-pick a fix from `develop` into `release/1.0` |
| 15 | Add a `pre-commit` hook that blocks secrets |

---

# 13. Troubleshooting Scenarios

## 13.1 Developer pushed broken code directly to `main`

> *How do you prevent this?*

**Prevent:** protect `main` with branch policies: restrict direct pushes, require PRs, set minimum reviewers, enable build validation, and remove **Bypass policies** and **Force push** permissions.

**Fix now:** `git revert <commit>` through a PR (don't rewrite shared history).

## 13.2 PR build failed

```text
PR → Build Validation → FAIL

1. Open the pipeline result
2. Check the failed job/step
3. Read the logs
4. Identify build/test/lint failure
5. Fix the code
6. Commit and push to the same branch
7. Pipeline re-runs automatically
8. Verify validation passes
9. Continue approval and merge
```

## 13.3 Merge conflict in a PR

```text
1. Fetch the latest target branch
2. Update your feature branch (merge or rebase)
3. Resolve conflicts
4. Test locally
5. Commit
6. Push
7. Re-run validation
```

```bash
git fetch origin
git switch feature/payment
git merge origin/main
# resolve conflicts
git add .
git commit
git push
```

## 13.4 More problems

| Problem | Likely cause / fix |
| --- | --- |
| `! [rejected] ... (non-fast-forward)` | Remote has newer commits. `git pull --rebase` (or merge), then push |
| `TF402455 ... must use a pull request` | Branch policy on the target branch. Push to a feature branch and open a PR |
| Authentication failed / 401 | PAT expired/revoked, wrong account in Git Credential Manager, or no repo permission |
| Push denied: "not authorized" | Missing **Contribute** permission on the repo/branch |
| PR can't be completed | Policy not met: reviewers missing, build failed, comments unresolved, work item not linked, merge type not allowed |
| Build validation never started | Path/branch filter doesn't match, or the policy points to a disabled pipeline |
| `refusing to merge unrelated histories` | Merging repos with no common commit. Use `--allow-unrelated-histories` only if intended |
| Detached HEAD | `git switch -c <new-branch>` to keep your commits |
| Huge push rejected / slow clone | Large files in history. Use Git LFS, remove the file from history |
| Line-ending noise in diffs | Set `core.autocrlf` and a `.gitattributes` file |
| Pipeline can't push tag/commit | Grant the build service identity **Contribute / Create tag** |
| Secret leaked in a commit | Rotate the secret immediately, then clean history |

---

# 14. Interview Questions & Answers

## 14.1 Basic

1. **What is Azure Repos?** The Azure DevOps source-control service that hosts Git repositories with Pull Requests, branch policies and permissions.
2. **What is Git?** A distributed version-control system that tracks changes to files over time.
3. **Git vs Azure Repos?** Git is the tool. Azure Repos is a hosting service for Git repos that adds PRs, policies and access control.
4. **What is a repository?** A project's files together with their complete version history.
5. **What is a branch?** A movable pointer to a commit that lets you develop independently.
6. **What is a commit?** A snapshot of changes with a unique ID, author, message and parent(s).
7. **What is `origin`?** The default name of the remote repository you cloned from.
8. **What is `HEAD`?** A pointer to the currently checked-out commit/branch.

## 14.2 Commands

9. **Clone vs pull?** Clone downloads a whole repo the first time. Pull updates an existing local branch from the remote.
10. **Fetch vs pull?** Fetch only downloads remote changes. Pull downloads and integrates them into the current branch.
11. **Merge vs rebase?** Merge combines histories and keeps them. Rebase replays commits on a new base for a linear history but rewrites commit IDs.
12. **Reset vs revert?** Reset moves history (can rewrite it). Revert adds a new commit that undoes a change, so it's safe for shared branches.
13. **Merge vs cherry-pick?** Merge brings a whole branch. Cherry-pick applies one specific commit.
14. **Stash vs commit?** Stash temporarily shelves uncommitted work without creating a commit in history. Commit records a permanent snapshot.
15. **What is a tag?** A named reference to a specific commit, commonly used for releases. Annotated tags are preferred.
16. **What are Git hooks?** Scripts that run at Git events (pre-commit, pre-push). They're client-side and bypassable, so enforce rules with server-side policies and CI.

## 14.3 Azure Repos

17. **What is a Pull Request?** A request to merge a branch into another with review, discussion and validation.
18. **What are branch policies?** Rules a branch enforces before changes merge: PR required, reviewers, build validation, comment resolution, merge type limits.
19. **What is PR validation?** Automated checks (build, tests, scans) that run on a PR before it can complete.
20. **What is build validation?** A branch policy that triggers a pipeline for each PR. A failed build blocks completion.
21. **What are required reviewers?** Policy that requires a minimum number of approvals or specific people/teams to approve a PR.
22. **How do you protect `main`?** Branch policies (PR, reviewers, build validation, comment resolution), restricted direct push, and removing force push and bypass permissions.
23. **How do you prevent direct pushes?** Enable a PR-required policy and deny **Contribute** / push on the protected branch for developers. Changes then go through PRs.
24. **How do you resolve merge conflicts?** Update the branch with the latest target, edit conflicting files, remove markers, `git add`, commit, push, and re-run validation.
25. **How do you handle a failed PR build?** Open the failed run, read the logs, fix the code, push to the same branch, and confirm the validation re-runs and passes.

## 14.4 Extra

26. **How do you undo a pushed commit on `main`?** `git revert` it (for a merge commit use `-m 1`) via a PR.
27. **How do you recover a commit after a bad `reset --hard`?** `git reflog` to find the commit ID, then reset or branch from it.
28. **Why not `git push --force`?** It can overwrite others' commits. Use `--force-with-lease` and only on your own branches.
29. **Squash merge vs merge commit?** Squash gives one clean commit on the target (history of the branch lost). A merge commit preserves the full branch history.
30. **Does the `pr:` trigger work for Azure Repos?** No. For Azure Repos Git, use branch policy build validation.

---

# 15. Memory Summary

```text
clone        = remote → local repository
fetch        = download remote changes, no integration
pull         = fetch + integrate
push         = local → remote
merge        = combine histories
rebase       = replay commits on a new base (rewrites history)
cherry-pick  = copy one specific commit
reset        = move/reset branch history
revert       = new commit that undoes another commit
stash        = temporarily store uncommitted changes
tag          = named reference to a commit
reflog       = safety net to recover lost commits
```

```text
Permission = WHO can do it
Policy     = WHAT CONDITIONS must be met
```

## 🔥 The 10 things to explain without notes

```text
1. clone                  6. reset vs revert
2. fetch vs pull          7. stash
3. push                   8. Pull Request
4. merge vs rebase        9. Branch Policies
5. cherry-pick           10. Build Validation + Required Reviewers
```

### ⭐ One-line interview answer

> **I use Azure Repos with Git for source control, feature branches for development, Pull Requests for controlled code integration, and branch policies such as required reviewers and build validation to protect important branches like `main`. For undoing shared changes I use `revert`, and I enforce rules on the server through policies rather than relying on local hooks.**
