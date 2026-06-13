# 📁 Linux File & Directory Commands

> **Master the essential file management commands for production Linux systems**

---

## 📚 Table of Contents

- [Q1: How to Change File Permissions?](#q1-how-to-change-file-permissions)
- [Q2: How to Change File Ownership?](#q2-how-to-change-file-ownership)
- [Q3: How to Find Files?](#q3-how-to-find-files)
- [Q4: How to Count Lines in a File?](#q4-how-to-count-lines-in-a-file)
- [Q5: How to View File Contents?](#q5-how-to-view-file-contents)
- [Q6: How to Display First 10 Lines?](#q6-how-to-display-first-10-lines)
- [Quick Reference](#-quick-reference)

---

## Q1: How to Change File Permissions?

### 🎯 Command
```bash
chmod [OPTIONS] MODE FILE
```

### 📖 Simple Definition
Change read (r), write (w), and execute (x) permissions for user, group, and others on a file.

### 🔍 Permission Basics

#### Permission Types:
| Symbol | Permission | Files | Directories |
|--------|-----------|-------|-------------|
| **r** | Read | View file content | List directory |
| **w** | Write | Edit file | Create/delete files |
| **x** | Execute | Run as program | Enter directory |

#### Permission Levels:
| Category | Symbol |
|----------|--------|
| **User** (Owner) | u |
| **Group** | g |
| **Other** | o |
| **All** | a |

### 🔢 Numeric Permissions

```
r (read)    = 4
w (write)   = 2
x (execute) = 1
```

#### Common Permission Combinations:

| Permission | Number | Usage |
|-----------|--------|-------|
| **400** | r--------\- | Read-only by owner |
| **600** | rw------- | Read/write by owner |
| **644** | rw-r--r-- | Readable by all, writable by owner |
| **755** | rwxr-xr-x | Owner full, others read+execute |
| **777** | rwxrwxrwx | ⚠️ Everyone full access (NOT recommended) |

### 💡 Real-Time Examples

#### Change to readable only:
```bash
chmod 644 script.sh
# Result: -rw-r--r--
```

#### Make executable:
```bash
chmod +x deploy.sh
# Result: -rwxr-xr-x
```

#### Remove write permission for group/other:
```bash
chmod go-w file.txt
# Result: -rw-r--r--
```

#### Recursive permission change:
```bash
chmod -R 755 /opt/application/
# Changes all files and directories
```

### 🏭 Production Examples (CMG Project)

#### Jenkins agent script:
```bash
chmod 755 /opt/jenkins-agent/start-agent.sh
# Owner: execute, Group: execute, Other: execute
```

#### Kubernetes config file:
```bash
chmod 600 ~/.kube/config
# Only owner can read (contains secrets)
```

#### Docker socket:
```bash
chmod 666 /var/run/docker.sock
# Multiple users need access
```

### ⚠️ Security Considerations

> 🔐 **NEVER use `chmod 777`** - This allows everyone to read, write, and execute

#### Best Practices:
- ✅ Use **least privilege principle**
- ✅ Give only necessary permissions
- ✅ Keep sensitive files **600** or **640**
- ✅ Keep scripts **755** (owner: all, others: read+execute)
- ✅ Audit permissions regularly

#### Bad vs Good:
```bash
# ❌ BAD - Everyone has full access
chmod 777 database.conf

# ✅ GOOD - Only owner can access
chmod 600 database.conf
```

### 👨‍💼 Interview Tips

> What the interviewer wants to hear:

- ✓ Understand numeric vs symbolic permissions
- ✓ Know the `least privilege principle`
- ✓ Know production file permission standards
- ✓ Never suggest `chmod 777` as a solution
- ✓ Explain why certain permissions are dangerous

### ❌ Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Using `777` everywhere | Security risk | Use `644` or `755` |
| Ignoring setuid bit | Permission issues | Use `4755` when needed |
| Not making scripts executable | Scripts won't run | Add `+x` permission |
| Recursive on single file | Unnecessary | Don't use `-R` for files |

### ⏱️ 30-Second Interview Answer

> *"chmod changes file permissions using either symbolic or numeric notation. Symbolic uses letters (r, w, x) and operators, while numeric uses: 4 for read, 2 for write, 1 for execute. For example, chmod 755 gives owner full permissions, and group/others can read and execute. The key principle is least privilege - never use 777. Instead, grant only the minimum permissions needed. Different file types need different permissions: scripts need execute bit, config files should be 600 or 640."*

### 🧠 Memory Trick

```
chmod = "CHange MODe"

Remember: 4+2+1 = 7 (full permissions)
        4+2 = 6 (read + write)
        4+1 = 5 (read + execute)
```

---

## Q2: How to Change File Ownership?

### 🎯 Command
```bash
chown [OPTIONS] OWNER:GROUP FILE
```

### 📖 Simple Definition
Transfer file/directory ownership from one user to another, and optionally change the group.

### 💡 Real-Time Examples

#### Change owner only:
```bash
chown jenkins script.sh
# Script now owned by jenkins user
```

#### Change owner and group:
```bash
chown jenkins:jenkins-group script.sh
# Owner: jenkins, Group: jenkins-group
```

#### Change group only:
```bash
chown :docker /var/run/docker.sock
# Group changed to docker
```

#### Recursive change (directories):
```bash
chown -R jenkins:jenkins /opt/jenkins-agent/
# All files and subdirectories owned by jenkins
```

### 🏭 Production Example

#### Jenkins agent setup:
```bash
chown -R jenkins:jenkins /var/lib/jenkins
chown -R jenkins:jenkins /opt/jenkins-agent
chmod 755 /opt/jenkins-agent
chmod 600 /var/lib/jenkins/.ssh/id_rsa
```

### ⚠️ Security Note

> 🔐 Only root can use `chown` command

```bash
# Regular user CANNOT do this
$ chown newuser file.txt
chown: changing ownership of 'file.txt': Operation not permitted

# Must be root or use sudo
sudo chown newuser file.txt
```

### 👨‍💼 Interview Tips

- ✓ Know owner vs group difference
- ✓ Know recursive flag `-R`
- ✓ Know only root can change owner
- ✓ Understand why ownership matters
- ✓ Know production use cases

### ⏱️ 30-Second Answer

> *"chown changes file ownership. You can change the owner, the group, or both. The syntax is `chown owner:group file`. Use `-R` for recursive changes on directories. Only the root user can change ownership of someone else's file. This is important in production when applications need to access files owned by specific users."*

---

## Q3: How to Find Files?

### 🎯 Command
```bash
find [PATH] [CRITERIA] [ACTION]
```

### 📖 Simple Definition
Search for files based on various criteria like name, size, type, permissions, or modification time.

### 🔍 Common Search Criteria

| Criteria | Description | Example |
|----------|-------------|---------|
| `-name` | Exact filename match | `find . -name "*.log"` |
| `-iname` | Case-insensitive name | `find . -iname "*.LOG"` |
| `-type` | File type (f/d) | `find . -type f` |
| `-size` | File size | `find . -size +100M` |
| `-mtime` | Modified days ago | `find . -mtime -7` |
| `-user` | File owner | `find . -user jenkins` |
| `-perm` | Permissions | `find . -perm 777` |

### 💡 Real-Time Examples

#### Find all log files:
```bash
find /var/log -name "*.log" -type f
# Results: All .log files in /var/log
```

#### Find large files (over 100MB):
```bash
find / -type f -size +100M
# Results: All files larger than 100MB
```

#### Find recently modified files (last 7 days):
```bash
find /home -type f -mtime -7
# Results: Files modified in last 7 days
```

#### Find all Python files owned by user:
```bash
find /opt -name "*.py" -user jenkins
# Results: Python files owned by jenkins
```

#### Find and delete temp files:
```bash
find /tmp -type f -mtime +30 -delete
# Deletes files older than 30 days
```

### 🏭 Production Examples (CMG)

#### Find Jenkins logs older than 30 days:
```bash
find /var/log/jenkins -name "*.log" -mtime +30
```

#### Find Docker images using disk:
```bash
find /var/lib/docker -type f -size +1G
```

#### Find Terraform state files:
```bash
find /opt/terraform -name "*.tfstate"
```

### 👨‍💼 Interview Tips

- ✓ Know `-name` and `-type` basics
- ✓ Know `-mtime` for time-based search
- ✓ Know `-exec` for command execution
- ✓ Know size filters (`+`, `-`)
- ✓ Know common production patterns

### ⏱️ 30-Second Answer

> *"The find command searches for files based on various criteria. You specify a starting path, then add criteria like -name, -type, -mtime. For example, `find /var/log -name '*.log' -type f` finds all log files in /var/log. You can also use -exec to run commands on results, like `find . -name '*.tmp' -delete` to remove temp files."*

---

## Q4: How to Count Lines in a File?

### 🎯 Command
```bash
wc [OPTIONS] FILE
```

### 📖 Simple Definition
Count words, lines, characters, or bytes in a file.

### 📊 Common Options

```bash
wc -l FILE          # Count lines
wc -w FILE          # Count words
wc -c FILE          # Count bytes
wc -m FILE          # Count characters
wc -l *.log         # Count lines in all .log files
```

### 💡 Real-Time Examples

#### Count log lines:
```bash
$ wc -l /var/log/syslog
47582 /var/log/syslog
# File has 47,582 lines
```

#### Count lines in multiple files:
```bash
$ wc -l *.log
    100 app.log
    250 error.log
    340 access.log
    690 total
```

#### Count with pipe (from another command):
```bash
ps aux | wc -l
# Count running processes
```

### 🏭 Production Example

#### Monitor log file growth:
```bash
wc -l /var/log/jenkins/jenkins.log
# Compare daily to track growth
```

---

## Q5: How to View File Contents?

### 🎯 Commands

#### View entire file:
```bash
cat file.txt              # Display all content
less file.txt             # Page through content
more file.txt             # Page through content (older)
```

#### View specific portions:
```bash
head -20 file.txt         # First 20 lines
tail -20 file.txt         # Last 20 lines
head -c 1000 file.txt     # First 1000 bytes
```

### 💡 Real-Time Examples

#### View full configuration:
```bash
cat /etc/jenkins/jenkins.conf
```

#### View last 100 lines of log:
```bash
tail -100 /var/log/syslog
```

#### Follow log in real-time:
```bash
tail -f /var/log/jenkins/jenkins.log
# Continues to display new lines as they're added
```

### 🏭 Production Pattern

#### Monitor application startup:
```bash
tail -f /var/log/application/app.log &
systemctl start application
```

---

## ⚡ Quick Reference

### Common Permission Patterns

```bash
# Web files (readable by all, writable by owner)
chmod 644 index.html

# Scripts (executable by all)
chmod 755 deploy.sh

# Private configuration (only owner readable)
chmod 600 database.conf

# Directory (standard permissions)
chmod 755 /opt/application

# Set-uid bit (run with owner permissions)
chmod 4755 /usr/bin/sudo
```

### Useful One-Liners

```bash
# Find all world-writable files (security risk)
find / -type f -perm -002

# Find all files with setuid bit
find / -type f -perm -4000

# Find recently changed files
find / -type f -mtime -1

# Count total lines in project
find . -name "*.py" | xargs wc -l
```

---

## 🎓 Interview Expectations

**What Interviewers Look For:**

- ✅ Understand file permissions (r, w, x)
- ✅ Know numeric notation (644, 755, 777)
- ✅ Never suggest `chmod 777` as solution
- ✅ Know least privilege principle
- ✅ Know find command patterns
- ✅ Understand security implications
- ✅ Know production best practices

**What NOT to Say:**

❌ "I just use `chmod 777` to fix permission issues"
✅ "I identify the minimum required permissions"

❌ "File permissions don't matter much"
✅ "File permissions are critical for security"

---

## 📝 Production Best Practices

### ✅ DO

- ✅ Use specific permissions (644, 755)
- ✅ Keep sensitive files readable only by owner
- ✅ Review permissions during code reviews
- ✅ Document why certain permissions are set
- ✅ Use least privilege principle
- ✅ Audit permissions regularly

### ❌ DON'T

- ❌ Use `chmod 777` ever
- ❌ Make sensitive files world-readable
- ❌ Ignore permission warnings
- ❌ Use recursive `-R` without checking first
- ❌ Change root-owned files casually

---

**Last Updated:** January 2024 | **Ready for:** DevOps, System Admin, Platform Engineering Interviews
