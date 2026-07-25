# Linux Interview Preparation Guide - Complete Index

## 📚 Overview

Comprehensive Linux interview preparation material for **DevOps, Cloud, SRE, Platform Engineering, and System Administration** roles.

**Project Context:** UK Government Project (CMG)
- AWS EC2, Jenkins, Kubernetes (EKS), Terraform, Ansible, Docker, Git, SonarQube, Trivy, WebSphere, Siebel CRM

---

## 📖 Included Topics

### 1. **LINUX_FILE_COMMANDS.md** (14.31 KB)
**Core File Management & Permissions**

- How do you change file permissions? (chmod)
- How do you change file ownership? (chown)
- How do you find files? (find command)
- How do you count lines in a file? (wc)
- How do you view file contents? (cat, less, more)
- How do you display first 10 lines? (head)
- How do you display last 10 lines? (tail)

**Key Coverage:**
- chmod numeric permissions (400, 600, 644, 755, 777)
- File permission matrix (user, group, other)
- find command syntax and patterns
- CMG project examples (Jenkins, Kubernetes)
- Production best practices
- Security considerations

---

### 2. **LINUX_USER_MANAGEMENT.md** (20.82 KB)
**User & Group Management with Security Focus**

- Difference between su and sudo?
- How do you add users? (useradd)
- How do you delete users? (userdel)
- How do you switch users? (su vs sudo)
- What is root account?
- How do you manage user permissions?
- How do you check logged-in users? (who, w, last)
- How do you display current user? (whoami, id)

**Key Coverage:**
- /etc/passwd and /etc/shadow files
- sudoers configuration (/etc/sudoers)
- su vs sudo comparison with security implications
- useradd, userdel, usermod commands
- Group management (groupadd, groupdel, gpasswd)
- CMG project examples (Jenkins, Kubernetes, WebSphere)
- Production security best practices
- Privilege escalation risks and mitigation

---

### 3. **LINUX_PROCESS_MANAGEMENT.md** (14.87 KB)
**Process Management & Troubleshooting**

- How do you view running processes? (ps, top, htop)
- How do you kill a process? (kill)
- How do you force kill a process? (kill -9)
- How do you find PID? (pgrep, pidof)
- What is top?
- What is ps?
- What is pgrep?
- How do you troubleshoot high CPU usage?
- How do you troubleshoot memory leaks?

**Key Coverage:**
- ps, top, htop, pgrep, pidof commands
- Process states (R, S, D, Z, T, W)
- Kill signals (SIGTERM, SIGKILL, SIGSTOP, SIGCONT)
- Graceful shutdown vs force kill
- Zombie and orphan process handling
- CMG project monitoring examples
- Production troubleshooting patterns
- Performance analysis techniques

---

### 4. **LINUX_PACKAGE_MANAGEMENT.md** (30.7 KB)
**Package Management & System Updates**

- What is a package manager?
- How do you list installed packages?
- How do you update packages?
- How do you install packages?
- How do you remove packages?
- Difference between apt and apt-get?
- Difference between yum and dnf?

**Key Coverage:**
- apt, apt-get, aptitude (Debian/Ubuntu)
- yum, dnf (Red Hat/CentOS)
- Package installation, update, removal workflows
- Dependency resolution
- Security updates and best practices
- apt vs apt-get differences
- yum vs dnf performance comparison
- CMG project deployment examples
- Production update strategies

---

### 5. **LINUX_SERVICES_SYSTEMD.md** (27.42 KB)
**Service Management with Systemd**

- What is systemd?
- How do you start services? (systemctl start)
- How do you stop services? (systemctl stop)
- How do you restart services? (systemctl restart)
- How do you check service status? (systemctl status)
- How do you enable services at boot? (systemctl enable)
- How do you disable services at boot? (systemctl disable)
- What is journalctl?

**Key Coverage:**
- systemd overview and advantages
- systemctl commands (start, stop, restart, reload, enable, disable)
- Service unit files and configuration
- Service dependencies
- Auto-restart policies
- journalctl logging and debugging
- Production service startup/shutdown sequences
- CMG project examples (Jenkins, Kubernetes, Docker)
- Troubleshooting failed services

---

### 6. **README.md** (0.84 KB)
Quick reference and project overview.

---

## 🎯 Learning Path

### Beginner Level
1. File Commands
2. User Management
3. Package Management

### Intermediate Level
1. Process Management
2. Services & Systemd
3. Networking (coming soon)

### Advanced Level
1. Shell Scripting (coming soon)
2. Troubleshooting (coming soon)
3. Linux for DevOps (coming soon)
4. Performance Tuning (coming soon)

---

## 🔒 Security Focus Throughout

Every topic emphasizes:
- ✓ **Least Privilege Principle** - Never use chmod 777
- ✓ **Audit Trails** - Track who did what with sudo
- ✓ **Best Practices** - Production-ready patterns
- ✓ **Common Mistakes** - What NOT to do and why
- ✓ **Risk Assessment** - Impact analysis for each decision

---

## 📋 Answer Format for Every Question

Each question includes:

1. **Simple Definition** - One-sentence explanation
2. **Detailed Explanation** - Complete context and background
3. **Why Is It Used** - Real-world purpose
4. **How Does It Work** - Step-by-step process
5. **Real-Time Example** - Actual command output
6. **Production Usage** - CMG project examples
7. **Security Considerations** - Risk mitigation
8. **Interviewer's Expectation** - What interviewers want to hear
9. **Common Mistakes** - What to avoid
10. **30-Second Answer** - Quick interview response
11. **Memory Trick** - Easy recall technique

---

## 🚀 Production Patterns

All guides include proven production patterns:

### Service Startup Sequence
1. Install service
2. Configure
3. Enable at boot
4. Start service
5. Verify running
6. Check logs

### Graceful Shutdown Pattern
1. Stop service gracefully (SIGTERM)
2. Wait 10 seconds
3. Check if running
4. Force kill if necessary (SIGKILL)

### System Update Pattern
1. Update in development first
2. Test in staging
3. Wait 2-4 weeks
4. Plan maintenance window
5. Update production during low usage
6. Monitor closely

---

## 🔧 Technical Coverage

### Key Commands Taught

**File Management:**
- chmod, chown, find, wc, cat, less, head, tail

**User Management:**
- useradd, userdel, usermod, passwd, su, sudo, id, whoami, groups

**Process Management:**
- ps, top, htop, pgrep, pidof, kill, killall, pkill

**Package Management:**
- apt, apt-get, yum, dnf, dpkg, rpm

**Service Management:**
- systemctl, systemd-analyze, journalctl

---

## 💡 CMG Project Integration

Real-world examples from:
- **AWS EC2** - Instance management, monitoring
- **Jenkins** - Agent setup, process management
- **Kubernetes** - Node management, kubelet service
- **Docker** - Container management, service lifecycle
- **Terraform** - Package deployment automation
- **WebSphere** - Application server management
- **Siebel CRM** - Process monitoring

---

## 🎓 Interview Preparation Tips

### What Interviewers Look For
✓ Troubleshooting skills
✓ Production experience
✓ System administration knowledge
✓ Security awareness
✓ Performance analysis
✓ Root cause analysis

### What NOT to Say
❌ "Linux and Unix are exactly the same"
✅ "Linux is Unix-like but not Unix"

❌ "chmod 777 is the best solution"
✅ "Follow least privilege principle"

❌ "Just restart the server first"
✅ "Investigate root cause before restarting"

---

## 📈 Remaining Topics (Coming Soon)

1. **Networking** - IP commands, DNS, routing, firewall
2. **Storage Management** - Disk, partition, mount, RAID
3. **LVM** - Physical/Logical volumes
4. **Swap** - Memory management
5. **Logging** - Log files, tail, grep, awk, sed
6. **Monitoring** - top, htop, vmstat, iostat, sar
7. **Security** - SELinux, AppArmor, audit logs
8. **SSH** - Key-based authentication
9. **Cron** - Job scheduling
10. **Shell Scripting** - bash, variables, loops
11. **Troubleshooting** - High CPU, memory, disk issues
12. **Linux for DevOps** - Jenkins, Docker, Kubernetes
13. **Production Scenarios** - Critical situations
14. **File System** - Directory structure
15. **Permissions** - SUID, SGID, sticky bit
16. **Cheat Sheet** - Quick reference

---

## 📌 How to Use This Guide

1. **Quick Review** - Use for last-minute prep
2. **Deep Dive** - Study one topic fully
3. **Practice** - Try commands on test system
4. **Interview Day** - Review 30-second answers
5. **Reference** - Bookmark for ongoing learning

---

## ✅ Quality Checklist

- [x] Covers 5 major topics (more coming)
- [x] Multiple perspectives (Interview, Admin, DevOps, Security, Production)
- [x] CMG project examples throughout
- [x] Production-ready patterns
- [x] Security best practices
- [x] Real command output examples
- [x] Common mistakes highlighted
- [x] Interviewer expectations documented
- [x] 30-second answers provided
- [x] Memory tricks included
- [x] Quick revision notes
- [x] Markdown format for easy reading

---

**Last Updated:** January 2024
**Total Content:** 108.97 KB of interview-ready material
**Format:** Markdown (.md files)
**Ready for:** DevOps, Cloud, SRE, Platform Engineering, System Administration interviews

---

*Created with 20+ years of production Linux administration experience*
