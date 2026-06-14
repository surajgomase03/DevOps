# GIT Interview Master

GIT Interview Question & Answers

Master Reference Document

Principal DevOps Architect Edition

Git Interview Questions — BASIC LEVEL

Q1: What is Git?

Git is a distributed version control system (DVCS) that helps developers manage and track changes to their codebase. It allows multiple developers to work on a project simultaneously and facilitates collaboration through branching, merging, and conflict resolution.

Q2: What is a repository in Git?

A repository (or "repo") is a central location where Git stores all the files and directories of a project, along with their complete history. It contains the entire version history of the project, including all commits and branches.

Q3: How do you create a new Git repository?

Navigate to the desired directory in your terminal and run:

git init

This initializes a new empty Git repository in the current directory.

Q4: What is the difference between Git and GitHub?

Git is a version control system — the technology that allows you to manage and track changes in your codebase. GitHub is a web-based hosting service for Git repositories that provides a platform to store, collaborate, and share repositories with others.

Q5: What is the purpose of the "git clone" command?

The git clone command creates a local copy of a remote Git repository, downloading the entire repository including all files, commit history, and branches to your local machine.

git clone https://github.com/user/repo.git

Q6: How do you commit changes in Git?

Follow these steps:

Stage the changes: git add <filename>

Create a commit with a message: git commit -m "Commit message"

Q7: What is the difference between "git pull" and "git fetch"?

git pull = git fetch + git merge. It downloads the latest changes and automatically merges them into the local branch.

git fetch only downloads the latest changes from the remote, updating remote-tracking branches without merging — allowing review before merging.

Q8: How do you resolve merge conflicts in Git?

When Git cannot automatically merge changes from different branches, you must manually edit the conflicting files to select desired changes. Then:

Edit conflicting files to resolve differences

Stage resolved files: git add <file>

Complete the merge: git commit

Q9: How do you revert a commit in Git?

Use git revert followed by the commit hash. This creates a new commit that undoes the changes from the specified commit, preserving history:

git revert <commit-hash>

Q10: How do you push changes to a remote Git repository?

Use git push followed by the remote name and branch:

git push origin main

Git Interview Questions — INTERMEDIATE LEVEL

Q11: What is the difference between a branch and a tag in Git?

Branch: a lightweight, movable pointer to a specific commit used for parallel development. Developers create branches for new features or bug fixes.

Tag: a fixed reference to a specific commit used to mark significant points in history, such as releases or stable versions. Tags do not move.

Q12: How do you merge two branches in Git?

Switch to the target branch: git checkout branch-to-merge-into

Merge: git merge branch-to-merge-from

Resolve any conflicts

Commit: git commit

Q13: What is the purpose of "git rebase"?

Git rebase integrates changes from one branch onto another by moving or combining commits. It produces a cleaner, linear commit history compared to merging. Common uses: incorporating upstream changes, squashing commits, reordering commits for clarity.

Q14: How do you undo the most recent commit in Git?

Create a new reverting commit: git revert HEAD

Remove the commit (keep changes staged): git reset HEAD~1

Q15: What is the "git stash" command used for?

git stash temporarily saves uncommitted changes so you can switch branches or apply hotfixes without committing incomplete work. Retrieve saved changes with git stash apply or git stash pop.

Q16: How do you revert a file to a previous commit in Git?

git checkout <commit-hash> -- <file>

This replaces the current file content with the version from the specified commit.

Q17: What is the purpose of the "git cherry-pick" command?

git cherry-pick applies a specific commit from one branch onto another without merging the entire branch. Useful for selectively applying individual changes.

git cherry-pick <commit-hash>

Q18: How do you delete a branch in Git?

Delete locally (merged): git branch -d <branch-name>

Force delete (unmerged): git branch -D <branch-name>

Delete remote: git push origin --delete <branch-name>

Q19: How do you view the commit history in Git?

git log

Additional flags: --oneline (condensed), --graph (visual), --author (filter by author), --since / --until (date filters), --grep (pattern search).

Git Interview Questions — ADVANCED LEVEL

Q20: What is Git rebase, and when would you use it?

Git rebase modifies the commit history of a branch by moving, combining, or editing commits. Use cases:

Incorporate changes from one branch onto another with linear history

Squash multiple commits into a single commit for cleaner history

Edit or reorder commits to resolve conflicts or improve readability

Q21: What is the difference between "git pull --rebase" and "git pull"?

git pull --rebase: fetches latest changes and replays your local commits on top (git fetch + git rebase) — produces linear history.

git pull: fetches latest changes and merges them (git fetch + git merge) — may create merge commits.

Q22: How do you squash multiple commits into a single commit?

Run interactive rebase: git rebase -i HEAD~n (n = number of commits)

Change "pick" to "squash" (or "s") for commits to combine

Save and exit — Git combines selected commits and prompts for a new message

Q23: What is the "git reflog" command used for?

git reflog shows a log of all reference changes in the repository (branch checkouts, commits, resets). It is invaluable for recovering lost commits or branches since it preserves history of recent operations even after deletions.

git reflog

Q24: How do you set up Git hooks?

Navigate to .git/hooks/ in your repository

Rename the desired hook (e.g., pre-commit.sample → pre-commit) to remove the .sample extension

Customize the hook script with the desired commands or actions

Q25: What is the purpose of the "git bisect" command?

git bisect performs a binary search through commit history to find the specific commit that introduced a bug. It automatically checks out different points in time and allows marking commits as good or bad until the faulty commit is identified.

git bisect start
git bisect bad
git bisect good <known-good-commit>

Q26: How do you sign commits and tags in Git?

Git supports GPG signing to verify authenticity and integrity:

Configure GPG key: git config --global user.signingkey <key-id>

Sign a commit: git commit -S -m "Commit message"

Sign a tag: git tag -s <tag-name>

Q27: What are Git submodules?

Git submodules allow you to include a separate Git repository as a subdirectory within your main repository. Useful for incorporating external dependencies or reusing code from other repositories while keeping them separately manageable.

git submodule add https://github.com/user/repo.git

Q28: How do you set up a Git server?

Options include hosted services (GitHub, GitLab, Bitbucket) or self-hosted solutions:

Gitolite: lightweight access control for self-hosted Git

Gitea: lightweight self-hosted Git service

GitLab Community Edition: full-featured self-hosted DevOps platform

Q29: How can you recover a deleted commit in Git?

Use git reflog to locate the lost commit hash, then recover it:

git reflog
git cherry-pick <recovered-commit-hash>

Or create a new branch at the recovered commit:

git checkout -b recovery-branch <commit-hash>

Git Interview Questions — SCENARIO BASED

Q30: Scenario 1: John pushed changes to the remote. Sarah wants to update her local repository with John's changes. How does she do it?

Sarah runs:

git pull

This fetches changes from the remote repository and merges them into her current branch.

Q31: Scenario 2: Alice committed locally but realized she made a mistake and wants to undo the last commit. How?

git reset HEAD~1

This moves the branch pointer one commit back, removing the last commit while keeping the changes in the working directory for correction.

Q32: Scenario 3: Mark is on a feature branch and needs to switch to another branch for a bug fix without losing his changes. What should he do?

Commit current work:

git add .
git commit -m "Save work in progress"

Switch branches:

git checkout <branch-name>

After fixing the bug, switch back to the feature branch to continue.

Q33: Scenario 4: Emma wants to see the commit history for a specific file. How?

git log <file-name>

This shows commit hash, author, date, and message for every commit that touched the specified file.

Q34: Scenario 5: You made incorrect changes to a file and want to discard them and revert to the last committed version. How?

git checkout -- <file>

This replaces the current file with the last committed version, discarding all uncommitted changes.

Q35: Scenario 6: Some commits in your feature branch are incorrect and need to be removed. How do you selectively remove specific commits?

git rebase -i <commit>

In interactive mode, delete or squash the unwanted commits. Save and exit to apply changes.

Q36: Scenario 7: You want to push only selected commits from a local branch to the remote. How?

Create a new branch from current: git branch <new-branch-name>

Cherry-pick desired commits: git cherry-pick <commit>

Push the new branch: git push origin <new-branch-name>

Q37: Scenario 8: You have local changes and want to pull the latest remote changes without losing them. What is the recommended approach?

git stash

git pull

git stash pop

Stash saves local changes temporarily. After pulling, stash pop reapplies them on top of the updated branch.

Q38: Scenario 9: Someone accidentally pushed sensitive information (e.g., API keys) to the remote. How do you remove it from history?

git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch <file-path>' --prune-empty --tag-name-filter cat -- --all

Then force push and inform all team members to rebase their work on the updated history.

Note: For modern repositories, git-filter-repo is the recommended replacement for filter-branch.

Q39: Scenario 10: You made a mistake in a commit message and want to update it. How?

git commit --amend

Your default editor opens with the current message. Edit, save, and exit — the commit message is updated.

Q40: Scenario 11: You realize some changes in a commit should have been a separate commit. How do you split it?

Run: git rebase -i HEAD~n

Change "pick" to "edit" for the commit to split

Save and exit — Git stops at that commit

Unstage: git reset HEAD^

Selectively stage first part: git add <files>

Commit first part: git commit -m "First part"

Stage and commit second part similarly

Resume rebase: git rebase --continue

Q41: Scenario 12: You accidentally committed a sensitive file. How do you remove it from Git history?

Back up the sensitive file

Remove from history: git filter-branch --tree-filter 'rm -f path/to/sensitive/file' -- --all

Force push: git push --force

Inform team: all members must run git fetch --all && git reset --hard origin/master

Q42: Scenario 13: How do you set up a collaborative Git workflow with another developer?

Create shared remote repo and grant access

Both developers: git clone <repository-url>

Create feature branch: git checkout -b feature-branch

Develop, commit, and push regularly

Use Pull Requests / Merge Requests for code review

Resolve conflicts during review/merge

Merge approved changes into main branch

Delete feature branch after merge: git branch -d feature-branch

Stay updated: git fetch origin && git pull origin <branch>

Q43: Scenario 14: You accidentally pushed a commit to the wrong branch. How do you revert and apply it to the correct branch?

Identify commit hash: git log

Checkout correct branch: git checkout correct-branch

Apply commit: git cherry-pick <commit-hash>

Resolve any conflicts, then commit

Delete wrong branch if needed: git branch -D wrong-branch

Q44: Scenario 15: A buggy feature branch was accidentally merged into main. How do you revert the merge?

Identify merge commit hash: git log

Checkout main: git checkout main

Revert merge: git revert -m 1 <commit-hash>

Resolve conflicts, commit with a descriptive message

Push to remote: git push origin main

Q45: Scenario 16: You are on a long-lived feature branch and want to incorporate the latest changes from main. How?

Commit or stash pending changes

Update main: git checkout main && git pull

Switch back: git checkout feature-branch

Merge: git merge main

Resolve conflicts, commit

Reapply stash if needed: git stash pop

Git Commands Reference

1. git init — Initialize a new Git repository

Example: git init

2. git clone — Clone a remote repository to your local machine

Example: git clone https://github.com/user/repo.git

3. git add — Add files or changes to the staging area

Example: git add file.txt

4. git commit — Commit the staged changes to the repository

Example: git commit -m "Commit message"

5. git status — Show the current status of the repository

Example: git status

6. git log — View the commit history

Example: git log

7. git diff — Show the differences between files or commits

Example: git diff file.txt

8. git branch — List, create, or delete branches

Example: git branch branchname

9. git checkout — Switch to a different branch

Example: git checkout branchname

10. git merge — Merge changes from one branch into another

Example: git merge branchname

11. git remote — Manage remote repositories

Example: git remote add origin https://github.com/user/repo.git

12. git push — Push local changes to a remote repository

Example: git push origin branchname

13. git pull — Fetch and merge changes from a remote repository

Example: git pull origin branchname

14. git fetch — Fetch changes from a remote repository

Example: git fetch origin

15. git stash — Save changes not ready to be committed

Example: git stash

16. git stash pop — Apply the most recent stash and remove it

Example: git stash pop

17. git reset — Reset the repository to a previous commit

Example: git reset commit_hash

18. git revert — Create a new commit that undoes a previous commit

Example: git revert commit_hash

19. git tag — Create and manage tags for marking specific points in history

Example: git tag v1.0.0

20. git remote -v — View the URLs of the remote repositories

Example: git remote -v

21. git config — Set or get repository options

Example: git config --global user.name "Your Name"

22. git show — Show details of a specific commit

Example: git show commit_hash

23. git cherry-pick — Apply a specific commit from one branch to another

Example: git cherry-pick commit_hash

24. git rebase — Reapply commits on top of another base commit

Example: git rebase branchname

25. git blame — Show who changed which lines in a file

Example: git blame file.txt

26. git remote add — Add a new remote repository

Example: git remote add origin https://github.com/user/repo.git

27. git remote remove — Remove a remote repository

Example: git remote remove origin

28. git log --oneline — Show the commit history in condensed format

Example: git log --oneline

29. git log --graph — Show the commit history in graphical representation

Example: git log --graph

30. git log --author — Show the commit history by a specific author

Example: git log --author "John Doe"

31. git branch -d — Delete a branch

Example: git branch -d branchname

32. git branch -m — Rename a branch

Example: git branch -m new_branchname

33. git show-branch — Show branches and their commits

Example: git show-branch

34. git clean — Remove untracked files from the working directory

Example: git clean -f

35. git remote prune — Remove remote-tracking branches that no longer exist on remote

Example: git remote prune origin

36. git log --grep — Show commit history matching a specific pattern

Example: git log --grep "bug fix"

37. git log --since — Show commit history since a specific date

Example: git log --since "2022-01-01"

38. git log --until — Show commit history until a specific date

Example: git log --until "2022-12-31"

39. git bisect — Find the commit that introduced a bug using binary search

Example: git bisect start

40. git reflog — Show a log of all reference changes in the repository

Example: git reflog

41. git remote show — Show information about a remote repository

Example: git remote show origin

42. git revert --no-commit — Revert changes without creating a new commit

Example: git revert --no-commit commit_hash

43. git reset --hard — Discard all changes and reset to a specific commit

Example: git reset --hard commit_hash

44. git config --global alias — Set up an alias for a Git command

Example: git config --global alias.ci commit

45. git archive — Create a tar or zip archive of a Git repository

Example: git archive --format=zip --output=archive.zip master

46. git submodule — Manage Git submodules within a repository

Example: git submodule add https://github.com/user/repo.git

47. git clean -n — Dry run to preview files that will be removed

Example: git clean -n

48. git log --follow — Show the commit history of a renamed file

Example: git log --follow file.txt

49. git show-branch --all — Show commit history of all branches

Example: git show-branch --all
