# Linux Interview

Linux Interview Preparation Guide

DevOps | SRE | Platform Engineering | Production Support

Project Context: UK Government Project (CMG)

AWS EC2, Jenkins, EKS, Terraform, Ansible, Docker, Git, SonarQube, Trivy, WebSphere, Siebel CRM, BPM

Table of Contents

1. Linux Fundamentals

Covers core OS concepts: kernel, shell, distributions, and the Linux vs Unix distinction.

Q1. What is Linux?

Definition

Linux is a free, open-source operating system kernel. Distributions (Ubuntu, RHEL, CentOS, Amazon Linux) package the kernel with tools and utilities into a full OS.

How It Works

The kernel sits between hardware and applications, managing CPU, memory, processes, devices, and file systems. Distributions add package managers, shells, and GUI/CLI tools on top.

CMG / Production Example

On the CMG project, Amazon Linux/Ubuntu EC2 instances run Jenkins agents, EKS worker nodes, and Terraform execution servers - all powered by the Linux kernel.

30-Sec Interview Answer

Linux is an open-source kernel; combined with GNU tools and a package manager it forms a distribution like Ubuntu or RHEL. It's the standard OS for cloud and DevOps infrastructure because it's free, stable, scriptable, and secure.

Common Mistake

Saying 'Linux is an operating system' without clarifying it's technically the kernel - the OS is the kernel plus surrounding tools (a distribution).

Q2. Difference between Linux and Unix?

Definition

Unix is a proprietary OS family from the 1970s (AIX, Solaris, HP-UX). Linux is an open-source, Unix-like kernel inspired by Unix design principles but written from scratch.

How It Works

Both follow the same philosophy: everything is a file, small composable tools, multi-user/multi-tasking. Linux is free and runs on far more hardware; Unix variants are vendor-specific and licensed.

CMG / Production Example

CMG infrastructure runs entirely on Linux (Amazon Linux EC2) rather than commercial Unix, because it's free, has huge community support, and integrates natively with AWS, Docker, and Kubernetes.

30-Sec Interview Answer

Linux is Unix-like but not Unix - it doesn't share Unix source code, it's open-source, free, and more widely used in cloud/DevOps. Commercial Unix (AIX, Solaris) is licensed and used mostly in legacy enterprise systems.

Common Mistake

Saying 'Linux and Unix are exactly the same.' Correct answer: Linux is Unix-like but not Unix.

Q3. What are the main components of a Linux system?

Definition

The three core components are: the kernel (manages hardware/resources), the shell (command interpreter for user interaction), and the file system (organizes and stores data).

How It Works

The kernel runs in privileged mode and talks to hardware. The shell (bash, sh) is a user-space program that takes commands, parses them, and asks the kernel (via system calls) to execute them. The file system provides the directory structure everything lives in.

CMG / Production Example

On a Jenkins build server: the kernel schedules build processes and manages memory/disk I/O, bash scripts (shell) run the build pipeline steps, and the file system (/var, /opt, /home/jenkins) stores workspaces and artifacts.

30-Sec Interview Answer

A Linux system has three layers: the kernel (core, talks to hardware), the shell (interface for running commands), and the file system (hierarchical storage for everything, since 'everything is a file' in Linux).

Common Mistake

Forgetting the file system as a core component, or confusing 'shell' with 'terminal' - the terminal is just the window; the shell is the program interpreting commands inside it.

Q4. What is the role of the Linux kernel?

Definition

The kernel is the core program that manages CPU scheduling, memory allocation, device drivers, process management, and system calls between hardware and software.

How It Works

It runs in 'kernel space' with full hardware access. Applications run in 'user space' and request kernel services through system calls (e.g., opening a file, allocating memory, starting a process).

CMG / Production Example

On EKS worker nodes, the kernel manages cgroups and namespaces - the underlying technology that lets Kubernetes isolate and run multiple containers (pods) on the same physical/virtual machine.

30-Sec Interview Answer

The kernel is the heart of Linux - it manages hardware resources (CPU, memory, disks, network) and provides a controlled interface (system calls) for applications to use them safely.

Common Mistake

Confusing the kernel with the whole OS, or saying applications talk directly to hardware - they always go through the kernel via system calls.

Q5. What is a shell in Linux, and what's the difference between bash and sh?

Definition

A shell is a command-line interpreter that reads commands, executes them, and shows output. 'sh' (Bourne Shell) is the original minimal POSIX shell; 'bash' (Bourne Again Shell) is a more feature-rich superset used as the default on most Linux distros.

How It Works

When you type a command, the shell parses it, expands variables/wildcards, finds the binary in $PATH, forks a child process, and executes it. bash adds features like command history, tab completion, arrays, and advanced scripting (sh lacks these).

CMG / Production Example

Jenkins pipeline shell steps (`sh` step in Jenkinsfile) typically invoke /bin/sh or /bin/bash on the Jenkins agent to run Terraform, kubectl, and Ansible commands as part of the CI/CD pipeline.

30-Sec Interview Answer

A shell is the command interpreter between user and kernel. bash is a superset of sh with extra scripting features (arrays, [[ ]], history). For portability, scripts often start with #!/bin/sh, but most production scripts use #!/bin/bash for richer features.

Common Mistake

Assuming bash and sh are identical - bash-specific syntax (arrays, [[ ]]) fails if the script's shebang is #!/bin/sh and sh is linked to dash (common on Ubuntu).

Q6. What are some popular Linux distributions, and which is used in production?

Definition

Popular distributions include Ubuntu, Debian, Fedora, CentOS/RHEL, and Amazon Linux. Each differs mainly in package manager, release cycle, and support model.

How It Works

Debian-based (Ubuntu, Debian) use APT/.deb packages; RHEL-based (CentOS, Fedora, Amazon Linux) use YUM/DNF and .rpm packages. Enterprise distros (RHEL) offer paid support and longer security update cycles.

CMG / Production Example

CMG uses Amazon Linux on EC2 for EKS worker nodes and Jenkins agents because it's optimized for AWS, has fast security patching, and integrates with AWS tooling (SSM, CloudWatch agent) out of the box.

30-Sec Interview Answer

Common distros: Ubuntu/Debian (APT-based, popular for cloud/dev), RHEL/CentOS/Amazon Linux (YUM/DNF-based, enterprise/AWS-friendly). Choice depends on package ecosystem, support contracts, and cloud-provider optimization.

Common Mistake

Assuming all distros use the same package manager - using `apt` commands on a YUM-based system (or vice versa) is a common interview and real-world error.

2. File System & Hierarchy

Linux Filesystem Hierarchy Diagram

/
├── bin   (essential user binaries)
├── boot  (bootloader files, kernel)
├── dev   (device files)
├── etc   (system config files)
├── home  (user home directories)
├── opt   (optional/third-party software)
├── proc  (virtual - process & kernel info)
├── root  (root user's home)
├── tmp   (temporary files)
├── usr   (user programs, libraries)
└── var   (variable data: logs, spool, cache)

Q7. Explain the Linux File System Hierarchy (key directories: /, /bin, /sbin, /etc, /var, /tmp, /home, /opt, /proc, /dev, /usr).

Definition

Linux organizes everything under a single root (/) directory tree. Each top-level directory has a defined purpose per the Filesystem Hierarchy Standard (FHS): /bin (user binaries), /sbin (admin binaries), /etc (configs), /var (variable/log data), /tmp (temp files), /home (user dirs), /opt (third-party apps), /proc (virtual process info), /dev (device files), /usr (read-only user programs/libraries).

How It Works

Everything is mounted under /. /proc and /dev are virtual file systems generated by the kernel in memory (not real disk files) - /proc shows live process/kernel info, /dev represents hardware devices as files.

CMG / Production Example

On CMG app servers: WebSphere binaries sit under /opt/IBM, application logs go to /var/log/<app>, Jenkins agent workspace lives under /home/jenkins, and Terraform/Ansible configs are kept in /etc or /opt/terraform.

30-Sec Interview Answer

/ is the root of everything. /etc holds configs, /var holds logs and variable data (grows over time - common disk-full culprit), /tmp is cleared on reboot, /opt is for third-party software like WebSphere, and /proc & /dev are virtual filesystems for process and device info.

Common Mistake

Storing application data or logs directly under / or filling /tmp without cleanup - /var filling up (especially /var/log) is one of the most common 'disk full' production incidents.

Q8. What is the Root Account in Linux?

Definition

The root account (UID 0) is the superuser with unrestricted access to all files, commands, and system settings.

How It Works

Root bypasses all permission checks. Commands like `sudo` grant temporary root privileges to regular users for specific commands, controlled via /etc/sudoers.

CMG / Production Example

On CMG EC2 instances, direct root login over SSH is disabled (PermitRootLogin no) for security; engineers use named IAM users with sudo access for Ansible playbook execution and deployments.

30-Sec Interview Answer

Root is the all-powerful Linux admin account. Best practice is to disable direct root SSH login, use named accounts with sudo, and follow least-privilege - never operate as root for daily tasks.

Common Mistake

Working as root for routine tasks or enabling SSH root login - this violates least-privilege and makes audit trails useless since actions can't be tied to individual users.

Q9. What is /etc/passwd?

Definition

/etc/passwd is a world-readable text file storing user account information: username, UID, GID, home directory, and default shell.

How It Works

Each line format is username:x:UID:GID:comment:home_dir:shell. The 'x' in the password field means the actual hashed password is stored in /etc/shadow, not here.

CMG / Production Example

When Ansible creates a 'jenkins' or 'appuser' service account on CMG app servers, an entry is added to /etc/passwd defining its UID, home directory (/home/appuser), and shell (often /bin/bash or /sbin/nologin for service accounts).

30-Sec Interview Answer

/etc/passwd stores user account metadata (UID, GID, home dir, shell) and is readable by everyone, but it does NOT store passwords - those live in the protected /etc/shadow file.

Common Mistake

Thinking /etc/passwd stores actual passwords - it only stores a placeholder 'x'; real (hashed) passwords are in /etc/shadow, which is restricted to root.

Q10. What is /etc/shadow?

Definition

/etc/shadow stores encrypted/hashed user passwords and password aging policies (expiry, last change date), readable only by root.

How It Works

Format: username:hashed_password:last_changed:min_age:max_age:warn_period:inactive:expire. The hash uses algorithms like SHA-512.

CMG / Production Example

Security audits on CMG servers check /etc/shadow permissions (must be 000 or 600, owned by root) to ensure no unauthorized user can read password hashes and attempt offline cracking.

30-Sec Interview Answer

/etc/shadow holds hashed passwords and aging rules, restricted to root only (permissions 000/600). This separation from /etc/passwd prevents normal users from reading password hashes.

Common Mistake

Leaving /etc/shadow world-readable (a misconfiguration that exposes password hashes to offline brute-force attacks) - always verify with `ls -l /etc/shadow`.

Q11. What is /etc/fstab?

Definition

/etc/fstab (file system table) defines how disk partitions, devices, and remote filesystems are automatically mounted at boot.

How It Works

Each line specifies: device (UUID/path), mount point, filesystem type, mount options, dump flag, and fsck order. The system reads this file at boot to mount everything listed.

CMG / Production Example

On CMG EC2 instances with additional EBS volumes for application data or Docker storage, /etc/fstab entries ensure the extra volume auto-mounts to /data or /var/lib/docker after every reboot.

30-Sec Interview Answer

/etc/fstab automates filesystem mounting at boot - defining device, mount point, type, and options. A bad entry here can prevent the server from booting, so always test with `mount -a` before rebooting.

Common Mistake

Editing /etc/fstab incorrectly and rebooting without testing - a typo can drop the server into emergency mode, requiring console/recovery access to fix.

Q12. What is /proc?

Definition

/proc is a virtual filesystem that exposes real-time kernel and process information as files - it doesn't exist on disk, it's generated by the kernel in memory.

How It Works

Each running process has a directory /proc/<PID>/ with files like status, cmdline, and fd. System-wide info like /proc/cpuinfo, /proc/meminfo, and /proc/loadavg are read by tools like top and free.

CMG / Production Example

When troubleshooting high memory on a CMG WebSphere app server, checking /proc/<PID>/status or /proc/meminfo gives live data without installing extra tools - useful on minimal/hardened images.

30-Sec Interview Answer

/proc is a virtual filesystem giving a live window into kernel and process state - tools like top, free, and ps read from here. Changes here often happen in real time and aren't persisted to disk.

Common Mistake

Trying to back up or treat /proc like a normal directory (e.g., copying it) - it has zero real size and contains live, transient kernel data.

Q13. What is /etc/hosts?

Definition

/etc/hosts is a local text file mapping hostnames to IP addresses, checked before DNS lookups.

How It Works

Format: IP_address  hostname  [aliases]. The system's name resolver (controlled by /etc/nsswitch.conf) typically checks /etc/hosts first, then falls back to DNS.

CMG / Production Example

On CMG Jenkins agents, /etc/hosts entries can be used to override DNS for internal services (e.g., pointing to an internal SonarQube or Nexus server) during testing without changing actual DNS records.

30-Sec Interview Answer

/etc/hosts provides local, static hostname-to-IP mapping that's checked before DNS - useful for quick overrides, testing, or environments without DNS.

Common Mistake

Leaving stale entries in /etc/hosts after an IP changes - this causes confusing 'works on one server, not another' DNS resolution issues that are hard to trace.

Q14. What is a symbolic link, and how is it different from a hard link? How do you create each?

Definition

A symbolic (soft) link is a pointer/shortcut file referencing another file's path. A hard link is an additional directory entry pointing to the same inode (same data) as the original file.

How It Works

Symlink: `ln -s /path/to/target linkname` - creates a new inode containing just the target path; breaks if the target is deleted/moved, can cross filesystems, and can link to directories. Hard link: `ln /path/to/target linkname` - shares the same inode number as the original; both names are equally 'real', survives deletion of the original name, but cannot cross filesystems or link directories.

CMG / Production Example

On CMG build servers, a symlink like /opt/java -> /opt/java11.0.20 lets Jenkins jobs reference a stable path (/opt/java/bin/java) while the actual JDK version is upgraded by just changing the symlink target.

30-Sec Interview Answer

Symlink = shortcut pointing to a path (separate inode, can break, cross-filesystem OK). Hard link = another name for the same inode (same data, can't cross filesystems or link directories). `ln -s target link` for soft, `ln target link` for hard.

Common Mistake

Deleting the original file of a symlink and expecting the symlink to still work (it becomes a 'broken link') - or assuming hard links work across different mounted filesystems, which they don't.

3. Permissions

Covers r/w/x permissions, numeric (octal) notation, and special bits (SUID, SGID, Sticky Bit).

Numeric Permission Reference

400

Owner read-only - typical for SSH private keys (id_rsa)

600

Owner read+write - sensitive config files, private keys

644

Owner read+write, group/others read-only - standard files (configs, scripts not executed)

755

Owner full, group/others read+execute - scripts, binaries, directories

777

Everyone full access - AVOID in production; security risk

Q15. Explain Read (r), Write (w), Execute (x) and numeric permissions (chmod 755, chmod 644).

Definition

r (read=4), w (write=2), x (execute=1) are permission bits for owner, group, and others. Numeric permissions sum these values per group, e.g., 755 = rwxr-xr-x, 644 = rw-r--r--.

How It Works

For files: r=view contents, w=modify/delete, x=run as program. For directories: r=list contents, w=create/delete files inside, x=enter/cd into the directory. `chmod 755 file.sh` gives owner rwx, group/others r-x (good for executable scripts). `chmod 644 file.txt` gives owner rw-, group/others r-- (good for config/data files).

CMG / Production Example

Deployment scripts on Jenkins agents are set to `chmod 755 deploy.sh` so Jenkins (owner) can execute them and other team members can read/execute, while config files holding non-sensitive settings use `chmod 644`.

30-Sec Interview Answer

r=4, w=2, x=1, summed per owner/group/other. 755 (rwxr-xr-x) is standard for executable scripts; 644 (rw-r--r--) is standard for regular files. Always apply least privilege - don't use 777.

Common Mistake

Using `chmod 777` to 'fix' a permission error - the correct fix is identifying the right owner/group and minimum permission needed, not opening full access to everyone.

Q16. What are SUID, SGID, and Sticky Bit?

Definition

SUID (Set User ID, 4xxx) makes a file execute with the file owner's privileges. SGID (Set Group ID, 2xxx) makes a file execute with the group's privileges, or makes new files in a directory inherit the directory's group. Sticky Bit (1xxx) on a directory means only the file owner (or root) can delete/rename their own files there.

How It Works

SUID example: /usr/bin/passwd has SUID set so any user can run it with root privileges to update /etc/shadow. SGID on a shared directory ensures all new files inherit the group, useful for team collaboration. Sticky bit on /tmp (mode 1777) prevents users from deleting each other's files in a shared temp directory.

CMG / Production Example

A shared deployment directory like /opt/app/releases used by multiple team members can have SGID set (`chmod 2775`) so all uploaded artifacts inherit the 'devops' group, simplifying permission management across the CMG team.

30-Sec Interview Answer

SUID runs a program as its owner (e.g., passwd runs as root), SGID runs as the group or makes files inherit the directory's group, and Sticky Bit (seen on /tmp) restricts file deletion to the file's owner even in a shared writable directory.

Common Mistake

Setting SUID on custom scripts or binaries unnecessarily - SUID on a writable/scriptable file is a major privilege-escalation risk and a top finding in security audits.

4. Users & Groups

Q17. Difference between su and sudo?

Definition

`su` switches to another user's full session (often root), requiring that user's password. `sudo` runs a single command with elevated privileges, using the requesting user's own password, governed by /etc/sudoers.

How It Works

`su username` opens a new shell as that user (su - for full login environment). `sudo command` checks /etc/sudoers (or sudo group membership) to see if the user is allowed, logs the action, then runs just that one command as root (or another specified user).

CMG / Production Example

On CMG servers, individual engineers use `sudo systemctl restart <app-service>` rather than `su - root`, so every privileged action is logged with the actual username in /var/log/secure for audit compliance (important for a UK Gov project).

30-Sec Interview Answer

su switches your entire session to another user and needs their password; sudo runs one command as root using your own password and is fully audit-logged. sudo is preferred for least-privilege and accountability.

Common Mistake

Sharing the root password for `su` access - this destroys audit trails. sudo with per-user permissions and logging is the production-correct approach, especially for compliance-heavy government projects.

Q18. How do you add, delete, and modify users and groups (useradd, usermod, groupadd, passwd)?

Definition

`useradd username` creates a user, `userdel username` removes one, `usermod -aG groupname username` adds a user to a group, `groupadd groupname` creates a group, and `passwd username` sets/changes a password.

How It Works

useradd creates an /etc/passwd entry, home directory, and default group. usermod -aG appends (the -a is critical - without it, the user is REMOVED from all other groups and added only to the new one). groupadd adds a line to /etc/group. passwd updates the hashed entry in /etc/shadow.

CMG / Production Example

Ansible playbooks on CMG provision a 'jenkins' service account on each new EC2 worker node with `useradd -m -s /bin/bash jenkins`, add it to the 'docker' group with `usermod -aG docker jenkins` so it can run Docker builds without sudo.

30-Sec Interview Answer

useradd/userdel manage accounts, groupadd manages groups, usermod -aG (always with -a!) adds a user to a group without removing existing memberships, and passwd sets the password stored in /etc/shadow.

Common Mistake

Running `usermod -G group username` without -a - this REPLACES all the user's group memberships with just that one group, potentially breaking their access to other resources (e.g., removing them from 'docker' or 'sudo' group accidentally).

Q19. How do you check logged-in users and the current user (who, w, whoami, id)?

Definition

`whoami` shows the current username, `who`/`w` show all currently logged-in users and their sessions, and `id` shows the current user's UID, GID, and group memberships.

How It Works

`who` reads /var/run/utmp for active login sessions. `w` adds CPU/idle time and current command per session. `id` queries /etc/passwd and /etc/group for the full identity context of a user.

CMG / Production Example

During a security incident on a CMG server, `who` and `last` (login history) help identify which engineer was logged in at the time of an unexpected config change, supporting the audit trail.

30-Sec Interview Answer

whoami = 'who am I right now', who/w = 'who else is logged in and what are they doing', id = 'what's my UID/GID and group memberships' - all essential for quick identity and access checks during troubleshooting.

Common Mistake

Confusing `who` (logged-in sessions) with `whoami` (current identity) - they answer different questions and are both commonly asked in quick-fire interview rounds.

5. Process Management

Q20. Explain Process, PID, PPID, Foreground/Background, Zombie, Orphan, and Daemon processes.

Definition

A process is a running instance of a program with a unique PID (Process ID) and a PPID (Parent Process ID, the process that started it). Foreground processes occupy the terminal; background processes (started with &) run without blocking it. A zombie is a finished process whose exit status hasn't been read by its parent. An orphan is a process whose parent died before it did (gets re-parented to init/PID 1). A daemon is a long-running background service process (often named with a trailing 'd', e.g., sshd).

How It Works

When a process exits, it becomes a zombie (Z state) until the parent calls wait() to read its exit code; if the parent never does, zombies accumulate (though they consume no resources beyond a process table entry). If a parent dies first, the kernel re-parents orphans to PID 1 (init/systemd), which reaps them.

CMG / Production Example

On a CMG Jenkins agent, if a build script forks subprocesses and the main script crashes without cleanup, those subprocesses become orphans reparented to PID 1 - visible via `ps -ef --forest` showing PPID 1 for unexpected long-running build helper processes.

30-Sec Interview Answer

Process = running program (PID/PPID identify it and its parent). Foreground blocks the shell, background (&) doesn't. Zombie = dead process awaiting parent to read exit status (harmless, just a table entry). Orphan = parent died, re-parented to init. Daemon = background service.

Common Mistake

Trying to `kill` a zombie process - it's already dead and can't be killed; you must fix/kill the parent process so it reaps the zombie, or it gets reaped automatically once re-parented to init.

Q21. How do you view running processes (ps, top, htop, pgrep) and find a process's PID?

Definition

`ps aux` lists a snapshot of all running processes. `top`/`htop` show a live, auto-refreshing view of processes with CPU/memory usage. `pgrep processname` finds PIDs matching a process name.

How It Works

`ps aux` columns show USER, PID, %CPU, %MEM, STAT, COMMAND. `top` sorts by CPU by default (press M for memory, P for CPU); `htop` is the same but with a friendlier color UI and tree view. `pgrep -f java` searches the full command line for 'java' and returns matching PIDs.

CMG / Production Example

When a CMG WebSphere app server feels slow, `top` immediately shows if a Java process is consuming 100%+ CPU; `pgrep -f WebSphere` or `ps -ef | grep java` confirms the exact PID before taking action like a thread dump or restart.

30-Sec Interview Answer

ps aux gives a one-time snapshot (good for scripting/grep), top/htop give a live real-time view (good for active troubleshooting), and pgrep is the fast way to get a PID by process name for use in scripts.

Common Mistake

Running `ps aux | grep processname` and accidentally matching the grep command itself in the output - use `pgrep` or `grep -v grep` to avoid this.

Q22. How do you kill or force-kill a process (kill, killall, pkill)?

Definition

`kill PID` sends a signal (default SIGTERM=15, graceful) to a process by PID. `kill -9 PID` sends SIGKILL (immediate, ungraceful termination). `killall name` and `pkill name` kill all processes matching a name.

How It Works

SIGTERM (15) asks the process to shut down cleanly (it can catch this signal and clean up resources/connections). SIGKILL (9) is handled by the kernel directly and cannot be caught or ignored - the process is terminated instantly, possibly leaving locks/temp files behind.

CMG / Production Example

When a CMG application server's Java process hangs and won't respond to `systemctl stop`, the standard escalation is: try `kill PID` first (graceful), wait, then `kill -9 PID` only if it's truly unresponsive - never jump straight to -9.

30-Sec Interview Answer

kill sends SIGTERM by default for graceful shutdown; kill -9 (SIGKILL) forces immediate termination and should be a last resort since it skips cleanup. killall/pkill target processes by name instead of PID.

Common Mistake

Defaulting to `kill -9` for everything - this can corrupt application state, leave orphaned database connections or lock files, and skip important shutdown hooks. Always try graceful termination first.

Q23. How do you troubleshoot high CPU usage and memory leaks?

Definition

High CPU troubleshooting identifies which process/thread is consuming CPU using top/htop/pidstat. Memory leak troubleshooting identifies a process whose memory (RES/RSS) grows continuously over time without being released.

How It Works

For CPU: run `top`, sort by %CPU, identify the PID, then drill into threads with `top -H -p PID` or take a thread dump (jstack for Java) to find the hot method/loop. For memory leaks: monitor RES/RSS over time with `top` or `ps -o rss,pid,cmd`, check `free -m` for overall memory pressure, and for Java apps take heap dumps to find growing object retention.

CMG / Production Example

On a CMG WebSphere app server experiencing gradual slowdown, the team monitors JVM heap via WebSphere admin console and OS-level memory via `free -m` and `ps`, correlating growth with deployment timestamps to identify a memory leak introduced by a recent BPM application release.

30-Sec Interview Answer

High CPU: use top/htop to find the offending PID, then drill into threads or take a profile/thread dump. Memory leaks: track RES memory growth over time per process, correlate with app logs/deployments, and use heap dumps for managed-runtime apps (Java/.NET).

Common Mistake

Immediately restarting the service to 'fix' high CPU/memory without capturing diagnostics first (thread dump, heap dump, top snapshot) - this destroys the evidence needed for root cause analysis, and the issue will recur.

Q24. What is nice/renice, and how do you control process priority?

Definition

`nice` sets the scheduling priority of a process when starting it; `renice` changes the priority of an already-running process. Priority (niceness) ranges from -20 (highest priority) to 19 (lowest priority).

How It Works

`nice -n 10 command` starts a command with lower priority (niceness 10), so it yields CPU to other processes. `renice -n 5 -p PID` changes a running process's niceness. Only root can set negative (higher-priority) values.

CMG / Production Example

A background log-archival script on a CMG monitoring server is started with `nice -n 15` so it doesn't compete for CPU with the actual monitoring agents (Prometheus node_exporter, etc.) during business hours.

30-Sec Interview Answer

nice/renice adjust how much CPU scheduling priority a process gets, from -20 (most favored) to 19 (least favored). Useful for de-prioritizing batch/background jobs so they don't impact production workloads.

Common Mistake

Confusing niceness direction - a HIGHER nice value means LOWER priority (the process is being 'nicer' to others), which is counter-intuitive and often answered backwards in interviews.

6. Package Management

Q25. What is a package manager, and what's the difference between apt/apt-get and yum/dnf?

Definition

A package manager installs, updates, configures, and removes software along with its dependencies. APT/apt-get (Debian/Ubuntu, .deb packages) and YUM/DNF (RHEL/CentOS/Amazon Linux, .rpm packages) are the two major families.

How It Works

apt-get is the older Debian tool; apt is a newer, more user-friendly front-end with better defaults and progress bars (apt update, apt install, apt upgrade). YUM is the older RHEL tool; DNF (Dnf - Dandified YUM) is its modern, faster replacement with better dependency resolution, used in RHEL8+/Fedora/Amazon Linux 2023.

CMG / Production Example

CMG's Amazon Linux EC2 instances use `yum install` or `dnf install` to provision tools like Docker, Ansible, and AWS CLI via Ansible playbooks during instance bootstrap (user-data or post-launch configuration).

30-Sec Interview Answer

apt/apt-get manage .deb packages on Debian/Ubuntu; yum/dnf manage .rpm packages on RHEL-family distros. apt and dnf are the modern, preferred front-ends over apt-get and yum respectively, offering cleaner output and better dependency handling.

Common Mistake

Mixing package manager commands across distro families (e.g., running `apt-get install` on Amazon Linux) - always check `/etc/os-release` first to confirm the distro before choosing commands.

Q26. How do you list, install, update, and remove packages?

Definition

List installed: `dpkg -l` (Debian) or `rpm -qa` (RHEL). Install: `apt install pkg` or `yum/dnf install pkg`. Update: `apt update && apt upgrade` or `yum/dnf update`. Remove: `apt remove pkg` or `yum/dnf remove pkg`.

How It Works

`apt update` refreshes the package index (metadata) from repositories; `apt upgrade` actually installs newer versions of installed packages. On RHEL, `yum update` does both index refresh and upgrade in one step. Removing a package may leave config files behind unless you use `apt purge` or `rpm -e --allmatches`.

CMG / Production Example

Before patching CMG EC2 instances, Ansible runs `yum update -y` during a maintenance window, then validates application services restart correctly - critical for a government project's security patching SLAs.

30-Sec Interview Answer

Use update to refresh repo metadata, upgrade/update to apply new package versions, install/remove for individual packages, and dpkg -l / rpm -qa to audit what's currently installed - essential for compliance and vulnerability scanning (e.g., Trivy results).

Common Mistake

Running `apt upgrade` or `yum update` on a production server without a maintenance window or rollback plan - an OS-level package update can break application dependencies (e.g., a Java or glibc version bump affecting WebSphere).

7. Services (systemd)

Q27. Explain systemctl start/stop/restart/status/enable/disable and how do you start/stop services?

Definition

systemctl is the systemd control command. `start`/`stop`/`restart` control a service's running state right now. `enable`/`disable` control whether the service starts automatically at boot. `status` shows current state, recent logs, and PID.

How It Works

`systemctl start svc` runs the unit file's ExecStart command. `restart` = stop then start (use `reload` if the service supports config reload without downtime). `enable` creates a symlink in /etc/systemd/system/<target>.wants/ so the service starts at boot; `disable` removes it. `enable` alone does NOT start the service now - you need both `enable` and `start`.

CMG / Production Example

CMG runbook for EC2 maintenance: before instance shutdown, run `systemctl stop <app-service>` to gracefully drain the WebSphere/BPM application; after the instance restarts, run `systemctl start <app-service>` (or rely on `enable` having been set so it auto-starts).

30-Sec Interview Answer

start/stop/restart control the service NOW; enable/disable control boot behavior. status gives you the quickest health check (active/inactive/failed + last log lines). Always enable AND start a new service if it should run now and survive reboots.

Common Mistake

Assuming `systemctl enable service` also starts it immediately - it only configures it for the NEXT boot. You must separately run `systemctl start service` to start it in the current session.

Q28. What is journalctl, and how do you use it to check logs/troubleshoot service failures?

Definition

journalctl queries the systemd journal - a centralized binary log store for kernel messages, service stdout/stderr, and system events.

How It Works

`journalctl -u servicename` shows logs for a specific unit. `-f` follows logs live (like tail -f). `-b` shows logs since the last boot. `--since`/`--until` filter by time. `-p err` filters by priority level.

CMG / Production Example

When a CMG WebSphere service fails to start after deployment, `journalctl -u websphere-app -n 100 --no-pager` quickly shows the last 100 log lines including the exact startup error (e.g., port conflict, missing config), without needing to find the right file in /var/log.

30-Sec Interview Answer

journalctl is the systemd log viewer - use -u for a specific service, -f to follow live, -b for current boot only, and -p err to filter errors. It's the first command to run when `systemctl status` shows a 'failed' service.

Common Mistake

Forgetting that journalctl logs can be volatile (in-memory only) unless persistent storage is configured (/var/log/journal exists) - after a reboot, logs from a crash may be lost if persistence isn't enabled.

Q29. What is /etc/systemd/system and daemon-reload, and how do you troubleshoot a service that won't start?

Definition

/etc/systemd/system holds custom and overridden systemd unit files (service definitions). `systemctl daemon-reload` tells systemd to re-read unit files after you create/edit one, without restarting the whole system.

How It Works

After writing or editing a .service file in /etc/systemd/system/, you must run `systemctl daemon-reload` before `start` - otherwise systemd uses its old cached definition. To troubleshoot a failed start: check `systemctl status svc` for the error summary, `journalctl -u svc -n 50` for detailed logs, verify the ExecStart path/permissions, and check for port conflicts with `ss -tuln`.

CMG / Production Example

When deploying a custom systemd unit for a CMG monitoring agent, Ansible's sequence is: copy the .service file to /etc/systemd/system/, run `systemctl daemon-reload`, then `systemctl enable --now monitoring-agent` - skipping daemon-reload is a frequent cause of 'changes not taking effect' tickets.

30-Sec Interview Answer

Custom service files go in /etc/systemd/system/. Always run `daemon-reload` after editing them. To debug a failing service: status -> journalctl -> check binary paths/permissions/ports - in that order.

Common Mistake

Editing a .service file and running `systemctl restart` directly without `daemon-reload` first - systemd will use the OLD configuration, and your changes appear to have 'no effect', causing confusion.

8. Networking

Q30. How do you check the system's IP address and network configuration (ip addr vs ifconfig)?

Definition

`ip addr` (or `ip a`) is the modern command to show IP addresses and network interfaces, replacing the deprecated `ifconfig`.

How It Works

`ip addr show` lists all interfaces with their IPv4/IPv6 addresses, MAC addresses, and state (UP/DOWN). `ifconfig` shows similar info but is part of the deprecated net-tools package, often not installed by default on modern distros.

CMG / Production Example

On CMG EC2 instances, `ip addr show eth0` confirms the private IP assigned by AWS VPC DHCP, useful when verifying that an EKS worker node or Jenkins agent registered with the correct subnet/IP.

30-Sec Interview Answer

Use `ip addr` (modern, part of iproute2) instead of `ifconfig` (deprecated, net-tools). Both show interface IPs, but ip command also handles routing, links, and tunnels - it's the standard on current distros.

Common Mistake

Relying on `ifconfig` in scripts for new systems - it may not be installed at all on minimal/container images, causing 'command not found' errors. Use `ip addr` for portability.

Q31. How do you check connectivity, DNS resolution, and routes (ping, dig, nslookup, traceroute, ip route)?

Definition

`ping` tests basic reachability via ICMP. `dig`/`nslookup` query DNS to resolve hostnames to IPs. `traceroute` shows the network path/hops to a destination. `ip route` (or `route -n`) shows the routing table.

How It Works

`ping -c 4 host` sends 4 ICMP echo requests and reports loss/latency. `dig hostname` shows detailed DNS records (A, CNAME, TTL); `nslookup hostname` is a simpler/older alternative. `traceroute host` shows each router hop and its latency, useful for identifying where a connection is being dropped or slowed.

CMG / Production Example

When a CMG Jenkins agent can't reach an internal Nexus/SonarQube server, the troubleshooting order is: `ping` (basic reachability) -> `dig`/`nslookup` (does the hostname resolve correctly to the expected internal IP?) -> `traceroute` (where does the path break/stop?) -> check security groups/NACLs in AWS.

30-Sec Interview Answer

ping = is it reachable? dig/nslookup = does the name resolve correctly? traceroute = where does the path break? ip route = what's my routing table? Together these isolate whether an issue is DNS, routing, firewall, or the remote service itself.

Common Mistake

Jumping straight to 'firewall issue' without first confirming DNS resolves to the correct IP - many 'connectivity' issues are actually DNS misconfigurations (wrong IP returned) rather than network/firewall blocks.

Q32. What is the difference between netstat and ss, and how do you check listening ports?

Definition

Both `netstat` and `ss` (socket statistics) show network connections and listening ports. `ss` is the modern, faster replacement for `netstat`, which is deprecated in net-tools.

How It Works

`ss -tuln` shows: -t (TCP), -u (UDP), -l (listening sockets only), -n (numeric ports/IPs, don't resolve names). `netstat -tuln` shows the same info with the older tool. ss reads directly from kernel data structures, making it much faster on systems with many connections.

CMG / Production Example

When a CMG application fails to start with a 'port already in use' error, `ss -tuln | grep <port>` quickly shows what's already bound to that port, including the PID with `ss -tulnp` (requires root for full PID visibility).

30-Sec Interview Answer

ss is the modern replacement for netstat - both can show listening ports with -tuln, but ss is faster and recommended on current systems. -t/-u for TCP/UDP, -l for listening only, -n for numeric output.

Common Mistake

Assuming a 'connection refused' error always means the firewall is blocking - first check with `ss -tuln` whether the application is even listening on that port at all; if it's not listed, the app itself failed to bind, not the network.

Q33. What is iptables, and how do you view/allow rules (e.g., allow SSH)?

Definition

iptables is the traditional Linux kernel firewall administration tool, filtering packets based on chains of rules (INPUT, OUTPUT, FORWARD).

How It Works

`iptables -L -n -v` lists current rules with packet counts. To allow SSH: `iptables -A INPUT -p tcp --dport 22 -j ACCEPT` appends a rule accepting TCP traffic on port 22. Rules are processed in order, top to bottom, with the first match winning - so rule ORDER matters. Rules don't persist across reboot unless saved (e.g., `iptables-save > /etc/iptables/rules.v4` or via a service).

CMG / Production Example

On CMG, AWS Security Groups handle most perimeter filtering, but iptables/firewalld may still be used as host-based defense-in-depth on EC2 instances, especially for restricting which internal services (e.g., monitoring agents) can reach an application port.

30-Sec Interview Answer

iptables filters traffic via ordered rule chains (INPUT/OUTPUT/FORWARD). To allow SSH: append an ACCEPT rule for tcp/22. Always save rules persistently, and remember rule ORDER determines which rule wins (first match).

Common Mistake

Adding a restrictive DROP rule via SSH without first allowing your own SSH session explicitly, or without a console/out-of-band access path - this can instantly lock you out of the server with no way back in except via cloud console.

Q34. Explain key networking concepts: OSI Model, TCP/IP, DNS, DHCP, CIDR/Subnet, Load Balancer, Reverse Proxy, NAT, Firewall.

Definition

OSI Model is a 7-layer conceptual framework (Physical, Data Link, Network, Transport, Session, Presentation, Application) describing how network communication works. TCP/IP is the practical 4-layer protocol suite the internet runs on. DNS resolves names to IPs. DHCP assigns IPs dynamically. CIDR notation (e.g., 10.0.0.0/24) defines subnet size. A Load Balancer distributes traffic across multiple servers. A Reverse Proxy sits in front of servers, forwarding client requests to them. NAT translates private IPs to public (and vice versa). A Firewall filters traffic by rules.

How It Works

Data flows down the OSI/TCP-IP layers on the sender (application -> ... -> physical) and up on the receiver. /24 CIDR = 256 IPs (255.255.255.0 subnet mask), giving 254 usable host addresses. A load balancer (e.g., AWS ALB) health-checks backend targets and routes traffic only to healthy ones. A reverse proxy (e.g., Nginx) can also do TLS termination, caching, and routing based on path/host.

CMG / Production Example

On CMG's AWS architecture: an Application Load Balancer (ALB) distributes traffic across EKS pods/EC2 app servers (load balancer), each VPC subnet is defined in CIDR (e.g., 10.0.1.0/24 for a private app subnet), NAT Gateways let private subnet EC2 instances reach the internet for package updates, and Security Groups act as the firewall layer.

30-Sec Interview Answer

OSI = 7-layer theoretical model; TCP/IP = practical 4-layer stack. DNS = name resolution, DHCP = dynamic IP assignment, CIDR = IP range notation (/24 = 256 addresses), Load Balancer = traffic distribution across healthy backends, Reverse Proxy = request forwarding/TLS termination, NAT = private-to-public IP translation, Firewall = traffic filtering by rules.

Common Mistake

Confusing a Load Balancer with a Reverse Proxy - a load balancer's primary job is distributing load across multiple backends for availability/scaling, while a reverse proxy's primary job is forwarding/transforming requests to one or more backend services (though many tools, like Nginx, do both).

9. Storage Management & LVM

LVM Architecture

Physical Disk
   |
   v
Physical Volume (PV)
   |
   v
Volume Group (VG)
   |
   v
Logical Volume (LV)
   |
   v
Filesystem (ext4/xfs)
   |
   v
Mount Point (e.g., /data)

Q35. How do you check disk usage (df vs du) and free disk space?

Definition

`df -h` shows filesystem-level disk space usage (total/used/available per mounted filesystem) in human-readable format. `du -sh directory` shows the total size of a specific directory/file (disk usage by content).

How It Works

df reads filesystem metadata directly - very fast. du recursively walks directories summing file sizes - can be slow on large trees. They can disagree if a file is deleted but still held open by a running process (df shows it as used; du won't see the deleted file in the directory tree).

CMG / Production Example

When a CMG app server alerts on disk-full, the workflow is: `df -h` to confirm WHICH filesystem is full (e.g., /var at 95%), then `du -sh /var/* | sort -rh | head -10` to find the largest subdirectories (often /var/log) and identify the culprit log file.

30-Sec Interview Answer

df -h = how full is each filesystem (the big picture); du -sh = how big is this specific folder (drilling down). Use df first to find the full filesystem, then du to find what's consuming space within it.

Common Mistake

Seeing df report a filesystem as full, deleting large log files, but df STILL shows it full - this happens when a running process holds the deleted file open; the space isn't freed until the process is restarted (check with `lsof | grep deleted`).

Q36. What is the PV -> VG -> LV architecture in LVM?

Definition

LVM (Logical Volume Manager) adds a flexible layer between physical disks and filesystems: Physical Volumes (PV, the raw disks/partitions), Volume Groups (VG, a pool combining one or more PVs), and Logical Volumes (LV, resizable 'virtual partitions' carved from a VG, on which filesystems are created).

How It Works

`pvcreate /dev/sdb1` initializes a disk as a PV. `vgcreate vgdata /dev/sdb1` creates a VG from one or more PVs. `lvcreate -L 20G -n lvapp vgdata` creates a 20GB LV. A filesystem (ext4/xfs) is then created on the LV with `mkfs` and mounted. LVs can be resized (grown) on the fly if the VG has free space, without unmounting (for most filesystems).

CMG / Production Example

On CMG EC2 instances, application data volumes use LVM so that when an application's storage needs grow, the team can attach a new EBS volume, extend the VG (`vgextend`), grow the LV (`lvextend`), and resize the filesystem (`resize2fs`/`xfs_growfs`) - all without downtime.

30-Sec Interview Answer

LVM stack: Disk -> PV (pvcreate) -> VG (vgcreate, pool of PVs) -> LV (lvcreate, resizable virtual partition) -> Filesystem -> Mount point. Its main benefit is online resizing and flexible storage management across multiple physical disks.

Common Mistake

Forgetting that growing an LV does NOT automatically grow the filesystem on top of it - after `lvextend`, you must also run `resize2fs` (ext4) or `xfs_growfs` (XFS) to actually make the new space usable.

Q37. How do you create, enable, and check Swap?

Definition

Swap is disk space used as overflow 'virtual RAM' when physical memory is full. It's created as either a swap file or a dedicated swap partition.

How It Works

To create swap: `dd if=/dev/zero of=/swapfile bs=1M count=2048` (creates a 2GB file), `chmod 600 /swapfile`, `mkswap /swapfile`, then `swapon /swapfile` to activate it. To make it permanent (survive reboot), add an entry to /etc/fstab. To disable: `swapoff /swapfile`. Check usage with `free -h` or `swapon -s`.

CMG / Production Example

On smaller CMG EC2 instance types (e.g., t3.medium) running Jenkins build agents, a swap file is configured as a safety net so a memory-intensive Maven/Gradle build doesn't get OOM-killed during occasional spikes, though heavy reliance on swap signals the instance is undersized.

30-Sec Interview Answer

Swap = disk-backed overflow memory. Create with dd/fallocate + mkswap + swapon, persist via /etc/fstab. High swap usage indicates memory pressure - it's a safety net, not a substitute for adequate RAM, since swap I/O is much slower than RAM.

Common Mistake

Setting the swapfile permissions too open (not 600) before running mkswap - swap can temporarily hold sensitive data from memory, so it should be readable only by root, same as /etc/shadow.

Q38. How do you mount and unmount a filesystem (mount, umount, lsblk, blkid)?

Definition

`mount device mountpoint` attaches a filesystem to a directory in the tree. `umount mountpoint` detaches it. `lsblk` lists block devices and their mount points in a tree view. `blkid` shows filesystem UUIDs and types.

How It Works

`mount /dev/sdb1 /data` makes the contents of /dev/sdb1 accessible under /data. `umount /data` (or `umount /dev/sdb1`) detaches it - this fails with 'device busy' if any process has open files/CWD on that filesystem (check with `lsof +D /data` or `fuser -m /data`). `lsblk` and `blkid` are read-only inspection tools used before mounting to identify the right device/UUID.

CMG / Production Example

When attaching a new EBS volume to a CMG EC2 instance for additional Docker image storage, the process is: `lsblk` to identify the new device (e.g., /dev/nvme1n1), `mkfs -t ext4 /dev/nvme1n1`, `mount /dev/nvme1n1 /var/lib/docker`, then add an /etc/fstab entry using its UUID (from `blkid`) for persistence across reboots.

30-Sec Interview Answer

mount/umount attach/detach filesystems; lsblk shows the device tree and current mounts; blkid identifies filesystem type and UUID (preferred over /dev/sdX names in fstab since device names can change). Use `fuser`/`lsof` to find what's blocking an unmount.

Common Mistake

Using /dev/sdb1-style device names in /etc/fstab instead of UUIDs - device naming order can change between reboots (especially with multiple attached volumes), causing the wrong volume to mount at a path, or boot failures.

10. Logs & Log Analysis

Q39. How do you check and analyze logs (/var/log, tail, less, grep, awk, sed, dmesg, journalctl)?

Definition

/var/log is the standard location for system and application logs (e.g., /var/log/messages or /var/log/syslog for general system logs, /var/log/secure or /var/log/auth.log for authentication). `dmesg` shows kernel ring buffer messages (boot/hardware events).

How It Works

`tail -f /var/log/app.log` follows a log live. `less file` allows scrollable viewing of large files without loading everything into memory. `grep 'ERROR' file` filters matching lines; add `-i` for case-insensitive, `-r` for recursive directory search. `awk '{print $1,$5}' file` extracts specific columns. `sed 's/old/new/g' file` does find-and-replace, often used to redact or transform log lines before analysis.

CMG / Production Example

Investigating a CMG WebSphere outage: `tail -f /var/log/websphere/SystemOut.log` to watch errors live, `grep -i 'OutOfMemory' SystemOut.log*` across rotated logs to find when an OOM first occurred, and `journalctl -u websphere --since '1 hour ago'` to correlate with systemd-level service restarts.

30-Sec Interview Answer

/var/log is log central; tail -f for live monitoring, less for browsing large files, grep to filter for errors/patterns (with -r for recursive, -i for case-insensitive), awk/sed for extracting/transforming fields, dmesg for kernel/hardware events, journalctl for systemd service logs.

Common Mistake

Using `cat` on a multi-GB log file - this can consume huge memory/CPU and flood the terminal. Always use `tail`, `less`, or `grep` on large files instead of `cat`.

11. Monitoring & Performance Tuning

Q40. How do you check CPU, memory, and load average (top, htop, vmstat, free, uptime)?

Definition

`top`/`htop` give a live overview of CPU and memory per process. `free -h` shows total/used/free/available memory and swap. `uptime` shows load average (1, 5, 15-minute averages of runnable+waiting processes). `vmstat 1` shows CPU, memory, and I/O stats refreshed every second.

How It Works

Load average should generally be compared against the number of CPU cores - a load average of 4 on a 4-core machine means it's fully utilized; on a 1-core machine it means heavy queuing. `free -h`'s 'available' column (not 'free') is the realistic figure of usable memory, since Linux uses 'free' RAM for disk cache (which is reclaimable).

CMG / Production Example

On CMG monitoring servers, a Grafana/Prometheus dashboard visualizes node_exporter metrics (CPU, memory, load), but `uptime` and `top` remain the fastest first commands when SSH'ing in during an active incident before dashboards load.

30-Sec Interview Answer

top/htop for live process-level CPU/memory, free -h for system memory (watch 'available', not 'free'), uptime for load average (compare against CPU core count), vmstat for a quick combined CPU/memory/IO snapshot over time.

Common Mistake

Panicking over a low 'free' memory value in `free -h` - Linux intentionally uses spare RAM for disk caching, which is instantly reclaimable. The 'available' column is the metric that matters for capacity decisions.

Q41. How do you identify CPU bottlenecks, disk I/O issues, and use vmstat/iostat/sar?

Definition

vmstat reports CPU, memory, and I/O activity over time. iostat reports per-device disk I/O statistics (throughput, queue size, %util). sar (System Activity Reporter) provides historical performance data across CPU, memory, disk, and network.

How It Works

In vmstat output, high values in the 'r' (run queue) column relative to CPU core count indicate CPU contention; high 'wa' (I/O wait) indicates processes are blocked waiting on disk. `iostat -x 1` shows %util per disk - sustained values near 100% indicate the disk is the bottleneck. `sar -u` (CPU), `sar -r` (memory), `sar -d` (disk) pull historical data, useful for 'it was slow at 2am last night' investigations (requires sysstat to be running and collecting).

CMG / Production Example

When a CMG database-backed application slows down during nightly batch BPM jobs, `iostat -x 1` on the app/DB server reveals if the underlying EBS volume is hitting its IOPS limit (%util near 100%), pointing to a storage performance issue rather than application code.

30-Sec Interview Answer

vmstat's 'r' column = CPU contention, 'wa' column = I/O wait. iostat's %util near 100% = disk bottleneck. sar gives historical trends (requires sysstat collection enabled in advance) - without it, you can't retroactively diagnose a performance issue from last night.

Common Mistake

Not having sysstat/sar configured BEFORE an incident - when asked 'what happened at 2am', without historical sar data you have no way to retroactively investigate, only real-time tools like top/vmstat which show the current moment.

12. Security

Q42. What is a firewall, and what are SELinux/AppArmor and audit logs?

Definition

A firewall filters network traffic by rules (ports, IPs, protocols). SELinux (RHEL/CentOS) and AppArmor (Ubuntu/Debian) are Mandatory Access Control (MAC) systems that restrict what processes can do regardless of file permissions, using security policies/profiles. Audit logs (auditd, /var/log/audit/audit.log) record security-relevant system events for compliance and forensics.

How It Works

SELinux assigns security 'contexts' (labels) to files and processes; even if a process has Unix permission to access a file, SELinux policy can still deny it (defense in depth). AppArmor achieves similar goals using path-based profiles per application, generally considered simpler to manage than SELinux. auditd logs events like file access, command execution, and authentication per configured rules.

CMG / Production Example

As a UK Government project, CMG likely has compliance requirements (e.g., Cyber Essentials/ISO 27001) where SELinux/AppArmor enforcement mode and auditd are mandatory on EC2 instances, with audit logs shipped to a central SIEM for monitoring.

30-Sec Interview Answer

Firewall = network traffic control. SELinux/AppArmor = Mandatory Access Control limiting what processes can do even beyond file permissions (defense in depth). auditd = detailed security event logging for compliance/forensics. Never disable SELinux to 'fix' a permission issue - find the correct policy/context instead.

Common Mistake

Setting SELinux to 'disabled' or 'permissive' to quickly resolve an 'access denied' error - the correct approach is to identify the right SELinux context (`ls -Z`, `chcon`, or `semanage`) or create a policy exception, preserving the security control.

Q43. What are Linux password policies and how are they enforced?

Definition

Password policies enforce rules like minimum length, complexity, expiration, and history, typically configured via PAM (/etc/pam.d/) and /etc/login.defs, and enforced per-user via /etc/shadow aging fields.

How It Works

`chage -l username` shows password aging info (last change, expiry). `chage -M 90 username` sets max password age to 90 days. PAM modules like pam_pwquality enforce complexity (minimum length, character classes) at password-change time.

CMG / Production Example

On a UK Gov project like CMG, password policies (90-day expiry, complexity requirements, account lockout after failed attempts via pam_faillock) are standard compliance requirements, often enforced and audited centrally rather than per-server.

30-Sec Interview Answer

Password policies (length, complexity, expiry, history, lockout) are enforced via PAM modules and /etc/login.defs/chage. They're a key compliance control, especially on regulated/government projects, and are typically checked during security audits.

Common Mistake

Setting password expiry without also configuring a warning period (chage -W) - users get locked out unexpectedly with no notice, causing avoidable access-related incidents.

13. SSH

Q44. What is SSH, how does key-based authentication work, and what are known_hosts/authorized_keys?

Definition

SSH (Secure Shell) is an encrypted protocol for remote login and command execution. Key-based authentication uses a public/private key pair: the private key stays on the client (never shared), and the public key is placed in ~/.ssh/authorized_keys on the server.

How It Works

`ssh-keygen -t rsa` generates a key pair. `ssh-copy-id user@host` copies the public key to the remote server's authorized_keys file. During login, the server challenges the client to prove possession of the private key (via a cryptographic signature) - if it matches the public key in authorized_keys, access is granted without a password. known_hosts (on the client) stores fingerprints of servers you've connected to, protecting against man-in-the-middle attacks by warning if a server's key suddenly changes.

CMG / Production Example

CMG Jenkins agents use SSH key-based authentication (not passwords) to connect to target EC2 application servers for deployments - the Jenkins master holds the private key (often via SSH credentials in Jenkins credential store), and each target server's authorized_keys contains the corresponding public key.

30-Sec Interview Answer

SSH key auth: private key stays on client, public key goes in server's ~/.ssh/authorized_keys. The server never sees the private key - it verifies a cryptographic challenge. known_hosts on the client prevents MITM attacks by detecting unexpected server key changes. Key auth is more secure than passwords and is standard for automation (Jenkins, Ansible).

Common Mistake

Setting overly permissive permissions on ~/.ssh or the private key file (e.g., 644 instead of 600/700) - SSH will refuse to use a private key that's readable by group/others, as a security safeguard.

14. Cron & Job Scheduling

Q45. What is crontab, what's the cron syntax, and how do you list/remove cron jobs?

Definition

crontab is the table of scheduled jobs for a user. Cron syntax has 5 time fields plus the command: minute (0-59), hour (0-23), day-of-month (1-31), month (1-12), day-of-week (0-7, where 0 and 7 = Sunday).

How It Works

`crontab -e` edits the current user's crontab. `crontab -l` lists current jobs. `crontab -r` removes ALL jobs for that user (no confirmation!). System-wide cron jobs live in /etc/crontab or /etc/cron.d/. Example: `0 2 * * * /opt/scripts/backup.sh` runs daily at 2:00 AM (minute=0, hour=2, every day/month/weekday).

CMG / Production Example

On CMG monitoring servers, a cron job like `0 1 * * * find /var/log/app -name '*.log' -mtime +30 -delete` runs nightly at 1 AM to clean up application logs older than 30 days, preventing /var from filling up.

30-Sec Interview Answer

Cron format: minute hour day month weekday command (5 fields + command). crontab -e edits, -l lists, -r removes everything (use with caution). Common patterns: `0 2 * * *` = daily 2 AM, `*/15 * * * *` = every 15 minutes.

Common Mistake

Running `crontab -r` thinking it removes one job - it deletes the ENTIRE crontab for that user with no undo. To remove a single job, use `crontab -e` and delete just that line.

Q46. What is the at command, and how is it different from cron?

Definition

`at` schedules a ONE-TIME job to run at a specific future time, unlike cron which is for RECURRING jobs.

How It Works

`echo 'command' | at 14:30` or `at 14:30` (then type commands, Ctrl+D to finish) schedules a one-off task. `atq` lists pending at jobs; `atrm jobnumber` removes a specific pending job. Requires the `atd` service to be running.

CMG / Production Example

Before a planned CMG maintenance window, an engineer might use `at` to schedule a one-time script that re-enables a load balancer target group 2 hours later, as a safety net in case they forget to do it manually.

30-Sec Interview Answer

cron = recurring schedule (runs repeatedly per the 5-field schedule); at = one-time future execution. Use atq to view pending at jobs and atrm to cancel one. Requires atd service running.

Common Mistake

Using cron with a one-time hack (e.g., a date far in the future then manually removing the crontab entry) instead of simply using `at`, which is purpose-built for one-off scheduled tasks and self-cleans after running.

15. Shell Scripting

Q47. How do you create and execute a shell script, and what is the Shebang (#!)?

Definition

A shell script is a text file of commands. The Shebang (#!/bin/bash as the first line) tells the kernel which interpreter to use to run the script.

How It Works

Create the file (e.g., script.sh), add `#!/bin/bash` as line 1, write commands, save, then `chmod +x script.sh` to make it executable, and run with `./script.sh`. Alternatively, run any script without execute permission via `bash script.sh`, which bypasses the shebang/permission requirement.

CMG / Production Example

Every CMG Jenkins pipeline shell step effectively runs a small shell script (often starting implicitly with #!/bin/sh on the agent) to execute terraform, kubectl, ansible-playbook, and docker commands as part of the CI/CD stages.

30-Sec Interview Answer

The shebang line (#!/bin/bash) at the top of a script tells the OS which interpreter to use. chmod +x makes it executable, then run with ./script.sh. Without execute permission, you can still run it via `bash script.sh`.

Common Mistake

Forgetting `chmod +x` and then getting 'Permission denied' when running `./script.sh` - or forgetting the shebang line entirely, causing the script to run in the CALLING shell's interpreter, which may not support the syntax used.

Q48. How do you define/access variables, read user input, and pass arguments to a shell script?

Definition

Variables: `VAR=value` (no spaces around =), accessed with `$VAR` or `${VAR}`. User input: `read VAR` pauses and waits for input. Script arguments: $1, $2... are positional parameters, $0 is the script name, $# is the argument count, $@ is all arguments.

How It Works

`NAME="jenkins"` then `echo "User is $NAME"`. `read -p "Enter name: " NAME` prompts and stores input. A script run as `./deploy.sh production v1.2` has $1=production, $2=v1.2, $#=2.

CMG / Production Example

A CMG deployment script `deploy.sh` might be called from Jenkins as `./deploy.sh $ENVIRONMENT $BUILD_VERSION`, using $1 and $2 inside the script to target the correct EKS namespace and Docker image tag.

30-Sec Interview Answer

VAR=value to set (no spaces!), $VAR or ${VAR} to read. read for interactive input. $1-$9 for positional args, $@ for all args, $# for arg count, $0 for the script's own name - fundamental for any parameterized automation script.

Common Mistake

Writing `VAR = value` with spaces around the equals sign - bash interprets this as running a command called 'VAR' with arguments '=' and 'value', producing a 'command not found' error.

Q49. How do you use if statements, for loops, and while loops in shell scripts?

Definition

`if [ condition ]; then ... fi` for conditional logic. `for var in list; do ... done` to iterate over items. `while [ condition ]; do ... done` to loop while a condition remains true.

How It Works

Test conditions use operators like -eq, -ne, -gt, -lt (numeric), = / != (string), -f / -d (file/directory exists). [[ ]] (bash-specific) supports more advanced syntax like && and || directly inside the brackets, while [ ] (POSIX) needs -a/-o or separate brackets.

CMG / Production Example

A CMG health-check script might use: `for pod in $(kubectl get pods -n app -o name); do kubectl describe $pod | grep -q Running || echo "$pod not running"; done` to loop through EKS pods and flag any not in Running state.

30-Sec Interview Answer

if/then/fi for branching, for...in...done for iteration over lists, while...done for condition-based loops. Use [[ ]] in bash for more powerful conditionals; [ ] for POSIX portability. Always quote variables ("$VAR") to avoid word-splitting bugs.

Common Mistake

Forgetting spaces inside [ ] brackets (e.g., `[$x -eq 1]` instead of `[ $x -eq 1 ]`) - bash requires spaces around the brackets and operators, otherwise it throws a syntax error or behaves unexpectedly.

16. Linux for DevOps

Q50. How does Linux integrate with Jenkins, Docker, Kubernetes, Terraform, and Ansible?

Definition

Linux is the runtime foundation for all major DevOps tools: Jenkins agents run as Linux processes executing shell/bash steps; Docker uses Linux kernel features (namespaces, cgroups) for containerization; Kubernetes worker nodes are Linux machines running kubelet and container runtimes; Terraform and Ansible are CLI tools executed from a Linux shell, often via SSH.

How It Works

Jenkins agents are typically Linux EC2 instances with Java, Docker, kubectl, Terraform, and Ansible installed; pipeline 'sh' steps run bash commands. Docker relies on Linux cgroups (resource limits) and namespaces (isolation) - it doesn't run natively on non-Linux without a Linux VM underneath. EKS worker nodes are Linux EC2 instances joined to the cluster, running kubelet as a systemd service. Ansible connects to target Linux hosts via SSH and runs modules as shell commands/Python scripts.

CMG / Production Example

CMG's full pipeline: a Jenkins agent (Linux EC2) checks out code from Git, runs SonarQube/Trivy scans (shell commands), builds a Docker image (using the Linux kernel's container features), runs Terraform to provision/update AWS infrastructure, uses Ansible (over SSH) to configure WebSphere app servers, and deploys to EKS worker nodes (Linux EC2 instances) via kubectl/Helm.

30-Sec Interview Answer

Every DevOps tool ultimately runs ON Linux or AGAINST Linux hosts: Jenkins agents are Linux machines running shell steps, Docker is built on Linux kernel primitives (cgroups/namespaces), Kubernetes worker nodes are Linux servers, and Terraform/Ansible are Linux CLI tools that provision and configure infrastructure, often over SSH.

Common Mistake

Underestimating how much DevOps troubleshooting is actually Linux troubleshooting - a 'failed Jenkins build' or 'pod CrashLoopBackOff' often traces back to a Linux-level issue: disk full, file permissions, DNS resolution, or a missing package on the underlying host.

17. Linux Production Scenarios

Each scenario follows: Situation -> Symptoms -> Investigation Commands -> Root Cause -> Solution -> Prevention.

Scenario: Server Not Reachable

Situation

A CMG EC2 application server is unreachable via SSH or HTTP.

Symptoms

ssh connection times out; ping fails or succeeds (helps narrow down the layer); monitoring shows the instance as down.

Investigation

Check AWS console - is the instance running? Check Security Group/NACL rules for port 22/443. Try `ping`, then `traceroute`, then `telnet host 22`. Check instance system logs via AWS console (EC2 -> Get System Log) if SSH itself is failing.

Root Cause

Common causes: Security Group rule changed/removed, instance ran out of disk space causing SSH daemon to fail, instance crashed/hung, or a network ACL change.

Solution

Restore the correct Security Group rule, or use AWS Systems Manager Session Manager (no SSH needed) to access the instance and investigate further (check disk space, sshd status).

Prevention

Use Infrastructure as Code (Terraform) for Security Groups so changes are reviewed/auditable; set up disk space alerting before it hits 100%; enable SSM Session Manager as a fallback access method.

Interview Answer

I'd first check if it's a network/security-group issue (ping, telnet to port 22) vs the instance itself being down (AWS console status checks). If SSH itself is broken but the instance is running, I'd use SSM Session Manager as an alternative access path to investigate further - logging in via console as a last resort.

Scenario: Disk Full

Situation

A CMG monitoring alert fires: '/var filesystem at 100% on app server'.

Symptoms

Application logging fails, services may crash or fail to write temp files, deployments fail mid-way.

Investigation

`df -h` to confirm which filesystem is full. `du -sh /var/* | sort -rh | head -10` to find the largest directories. Check `/var/log` for runaway log files (e.g., a debug-mode log growing unbounded).

Root Cause

Often a misconfigured log rotation (logrotate not running or misconfigured), an application stuck in a debug-logging loop, or old Docker images/containers accumulating on a build server.

Solution

Identify and safely truncate or compress the offending log (`> /path/to/huge.log` to truncate without deleting the inode if a process holds it open, or use `truncate -s 0`), free up Docker space with `docker system prune`, then fix the root cause (logrotate config, app log level).

Prevention

Configure logrotate for all application logs, set up disk usage alerts at 75-80% (not just 100%), and schedule regular cleanup cron jobs for Docker images/temp files on build servers.

Interview Answer

I'd run df -h to confirm the full filesystem, then du -sh to find the biggest consumer - usually logs. I'd truncate (not delete, to avoid breaking open file handles) the offending log, fix the underlying logrotate or log-level config, and add proactive alerting at 75-80% so we catch it before it's critical.

Scenario: Application Down / Port Not Listening

Situation

A CMG WebSphere/BPM application is unreachable; users report the site is down.

Symptoms

Connection refused on the app's port; `systemctl status` shows the service failed or not running.

Investigation

`systemctl status app-service` for current state and error summary. `journalctl -u app-service -n 100` for detailed startup errors. `ss -tuln | grep <port>` to confirm if anything is listening on the expected port at all.

Root Cause

Common causes: application failed to start due to a config error from a recent deployment, a port conflict with another process, insufficient memory causing the JVM to fail startup, or a dependency (database connection) being unavailable.

Solution

Read the startup error from journalctl/application logs to identify the specific failure (config syntax error, missing dependency, port conflict), fix the root cause, then `systemctl restart app-service` and verify with `ss -tuln` that it's now listening.

Prevention

Validate configuration changes in a staging environment before production deployment; add health-check based alerting (not just 'is the process running' but 'is the port responding correctly'); use readiness probes in Kubernetes/EKS deployments.

Interview Answer

I wouldn't restart blindly - first systemctl status and journalctl to see WHY it failed. If it's a config issue from a recent deploy, I'd fix the config and restart; if it's a resource issue (OOM), I'd check memory with free/top first. Then verify the fix with ss -tuln to confirm the port is actually listening again.

Scenario: DNS Resolution Failure

Situation

A CMG Jenkins agent can't resolve an internal hostname (e.g., nexus.internal.cmg.local) needed for a build.

Symptoms

Build fails with 'could not resolve host' errors when pulling dependencies or pushing artifacts.

Investigation

`dig nexus.internal.cmg.local` or `nslookup nexus.internal.cmg.local` to test resolution directly. Check `/etc/resolv.conf` for correct DNS server IPs. Check `/etc/hosts` for conflicting static entries. Verify the EC2 instance's VPC DNS settings (enableDnsSupport/enableDnsHostnames) and the correct Route53 private hosted zone association.

Root Cause

Common causes: /etc/resolv.conf pointing to the wrong DNS server (especially after a network config change or DHCP renewal), a stale/incorrect /etc/hosts entry overriding DNS, or the VPC's private hosted zone not being associated with the instance's VPC.

Solution

Correct /etc/resolv.conf (or fix the underlying DHCP/VPC DNS config so it's auto-correct), remove stale /etc/hosts entries, or fix the Route53 private hosted zone VPC association via Terraform.

Prevention

Manage DNS configuration via Terraform/VPC settings rather than manual edits, avoid hardcoding /etc/hosts entries for services that have proper DNS records, and add a DNS resolution check to instance health checks.

Interview Answer

I'd test resolution directly with dig/nslookup to confirm it's a DNS issue and not something else, then check /etc/resolv.conf for the configured DNS servers and /etc/hosts for any stale overrides. For AWS, I'd also verify the VPC's DNS settings and Route53 private hosted zone associations are correct.

Scenario: Jenkins Agent Down

Situation

A CMG Jenkins build agent shows as 'offline' in the Jenkins master UI.

Symptoms

Builds queue up or fail to be scheduled; the agent node shows red/offline in Jenkins.

Investigation

SSH to the agent EC2 instance - is it reachable? `systemctl status` for the Jenkins agent service (if running as a service) or check the Java agent process with `ps aux | grep jenkins`. Check disk space (`df -h`) - a full disk often kills the agent's workspace operations. Check memory (`free -h`) - agent JVM may have been OOM-killed. Check connectivity from agent to Jenkins master (network/security group).

Root Cause

Common causes: disk full (agent can't write workspace files), agent process crashed/OOM-killed, EC2 instance itself stopped/terminated (e.g., spot instance reclaimed), or a network/security-group change blocking agent-to-master connectivity.

Solution

Free disk space if full, restart the agent process/service, restart the EC2 instance if it's stopped, or fix the security group/network path. For ephemeral/spot agents, simply let the autoscaling/Jenkins cloud plugin provision a replacement.

Prevention

Use ephemeral, autoscaled Jenkins agents (e.g., via EC2 Fleet or Kubernetes plugin) so a dead agent is automatically replaced; monitor disk/memory on persistent agents; set up alerting on agent connectivity in Jenkins itself.

Interview Answer

First I'd check if the EC2 instance is even running, then SSH in to check disk space and memory - the two most common causes of a 'dead' agent. If it's a persistent agent, I'd fix and restart it; if it's an ephemeral/autoscaled agent, I'd just let the system provision a fresh replacement and investigate the dead one's logs separately.

Final Linux Cheat Sheet

Top Linux Commands (Quick Reference)

File/Dir

ls, cd, pwd, mkdir, rm, cp, mv, touch, cat, find, ln -s

Text Processing

grep, head, tail, sort, uniq, wc, sed, awk, diff

Permissions

chmod, chown, chgrp

Process

ps aux, top, htop, kill, kill -9, pkill, nice, renice

Services

systemctl start/stop/restart/status/enable/disable, journalctl -u

Storage

df -h, du -sh, lsblk, fdisk, mount, umount, blkid

LVM

pvcreate, vgcreate, lvcreate, lvextend, resize2fs/xfs_growfs

Networking

ip addr, ss -tuln, ping, dig, traceroute, curl, wget, iptables -L

Users

useradd, usermod -aG, groupadd, passwd, chage -l, su, sudo

Compression

tar -czvf / -xvf, gzip, gunzip, unzip

SSH

ssh-keygen -t rsa, ssh-copy-id, ssh user@host, scp

Monitoring

top, htop, free -h, uptime, vmstat 1, iostat -x 1, sar

Cron

crontab -e/-l/-r, at, atq, atrm

Top Troubleshooting Commands by Scenario

High CPU

top / htop (sort by CPU), pidstat, ps -eo pid,%cpu,cmd --sort=-%cpu

High Memory

free -h, top (sort by MEM), ps -eo pid,%mem,rss,cmd --sort=-%mem

Disk Full

df -h, du -sh /var/* | sort -rh | head, lsof | grep deleted

Disk I/O Slow

iostat -x 1, vmstat 1 (check 'wa' column), sar -d

Network/DNS

ping, dig, nslookup, traceroute, ss -tuln, ip route

Service Failure

systemctl status, journalctl -u <service> -n 100

SSH Failure

ssh -v (verbose), check Security Group/port 22, check ~/.ssh permissions (700/600)

Interview Traps - Always Correct These

WRONG: 'Linux and Unix are exactly the same.' -> CORRECT: Linux is Unix-like but not Unix.

WRONG: 'chmod 777 is the fix for permission errors.' -> CORRECT: Apply least-privilege; find the correct owner/group and minimum permission.

WRONG: 'Restart the server/service first when something breaks.' -> CORRECT: Investigate root cause (logs, top, df) before restarting - restarting destroys diagnostic evidence.

WRONG: 'kill -9 is the standard way to stop a process.' -> CORRECT: Try graceful SIGTERM first; SIGKILL (-9) is a last resort that can corrupt state.

WRONG: 'Disable SELinux/firewall to fix access issues.' -> CORRECT: Identify the correct policy/rule exception instead of disabling security controls.

WRONG: '/etc/passwd stores passwords.' -> CORRECT: /etc/passwd stores user metadata; hashed passwords are in /etc/shadow.

What Interviewers Look For

Troubleshooting Skills - structured investigation (logs -> metrics -> root cause), not guesswork or random restarts

Production Experience - real examples (like CMG: EC2, Jenkins agents, EKS nodes, WebSphere) rather than textbook-only answers

Security Awareness - default to least-privilege, never suggest disabling security controls as a fix

Performance Analysis - knowing WHICH tool answers WHICH question (top vs iostat vs sar)

Root Cause Analysis - always asking 'why did this happen' and 'how do we prevent recurrence', not just 'how do we fix it now'

One-Day Revision / Last-Minute Summary

File System: / is root; /etc=configs, /var=logs/data (common disk-full spot), /tmp=temp, /opt=3rd party apps, /proc & /dev=virtual

Permissions: r=4,w=2,x=1; 755=scripts, 644=files, 600=secrets/keys; SUID/SGID/Sticky = special access bits

Users: /etc/passwd=metadata, /etc/shadow=hashed passwords (root only); sudo (per-command, audited) > su (full session)

Process: ps/top/htop to view; kill (SIGTERM) before kill -9 (SIGKILL); zombie=dead, awaiting parent reap

Services: systemctl start/stop=now, enable/disable=on boot; journalctl -u for logs; daemon-reload after editing unit files

Networking: ip addr (not ifconfig), ss -tuln (not netstat), ping->dig->traceroute to isolate connectivity vs DNS vs routing issues

Storage/LVM: df -h (filesystem-level) vs du -sh (directory-level); LVM = PV->VG->LV->Filesystem, lvextend needs resize2fs/xfs_growfs after

Logs: /var/log + journalctl; tail -f to follow, grep/awk/sed to filter/transform; never cat huge files

Cron: minute hour day month weekday command; crontab -e/-l/-r; at for one-time jobs

Security: least privilege always; never disable SELinux/firewall as a 'fix'; SSH key auth (private stays local, public on server)

DevOps: Linux underlies Jenkins agents, Docker (cgroups/namespaces), EKS worker nodes, and is the execution environment for Terraform/Ansible

Golden rule for any production incident: Investigate (logs/metrics) -> Identify root cause -> Fix -> Prevent recurrence. Never restart-first.
