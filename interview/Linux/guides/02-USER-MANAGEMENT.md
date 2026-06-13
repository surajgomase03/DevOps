# 👥 Linux User & Group Management

> **Master user management, privilege escalation, and security controls for production systems**

---

## 📚 Table of Contents

- [Q1: su vs sudo - The Critical Difference](#q1-su-vs-sudo---the-critical-difference)
- [Q2: How to Add Users?](#q2-how-to-add-users)
- [Q3: How to Delete Users?](#q3-how-to-delete-users)
- [Q4: User Authentication Files](#q4-user-authentication-files)
- [Q5: Sudoers Configuration](#q5-sudoers-configuration)
- [Quick Reference](#-quick-reference)

---

## Q1: su vs sudo - The Critical Difference

### 🎯 Comparison Table

| Feature | **su** (Switch User) | **sudo** (Super User Do) |
|---------|------------------|---------------------|
| **What it does** | Switch to another user account | Run single command as another user |
| **Password needed** | Target user's password | Your password |
| **Security** | ⚠️ HIGH RISK - password sharing | ✅ SAFE - auditable |
| **Auditing** | ❌ Not logged | ✅ All commands logged |
| **Best for** | Emergency access only | Regular privilege escalation |
| **Production use** | ❌ NOT RECOMMENDED | ✅ RECOMMENDED |

### 📖 Simple Definitions

#### `su` - Switch User
```bash
su - jenkins
# You must enter jenkins user's password
# You become jenkins user completely
# All actions appear to be by jenkins
```

#### `sudo` - Super User Do
```bash
sudo systemctl restart jenkins
# You enter YOUR password
# Only this command runs as root
# Everything is logged with your name
```

### 🔴 Why su is Dangerous

```
❌ PROBLEMS WITH su:

1. Password Sharing
   └─ You must know jenkins password
   └─ Password must be shared with team
   └─ Multiple people know the password
   └─ Can't change without updating team

2. No Audit Trail
   └─ Can't track who did what
   └─ "someone" deleted the database
   └─ Could be any user with password
   └─ Impossible to audit

3. No Accountability
   └─ Can't prove who made changes
   └─ Can't investigate incidents
   └─ Security disaster for compliance
```

### 🟢 Why sudo is Better

```
✅ ADVANTAGES OF sudo:

1. No Password Sharing
   └─ Each person uses their own password
   └─ No team password needed
   └─ Easy to revoke access
   └─ User leaves: just remove from sudoers

2. Complete Audit Trail
   └─ Every command logged
   └─ Clear timestamp
   └─ User identification
   └─ Investigate incidents easily

3. Accountability
   └─ Clear who did what
   └─ Matches compliance requirements
   └─ Legal trail for audits
```

### 💡 Real-Time Examples

#### ❌ BAD - Using su
```bash
# Team needs to restart Jenkins
$ su - jenkins
Password: (shared jenkins password - SECURITY RISK!)
$ systemctl restart jenkins
$ exit
# No one knows who did it!
```

#### ✅ GOOD - Using sudo
```bash
# Authorized users can restart Jenkins
$ sudo systemctl restart jenkins
[sudo] password for john:

# Log shows:
# Jan 15 10:30:45 hostname john sudo: john : TTY=pts/0 ; PWD=/home/john ; 
#   USER=root ; COMMAND=/bin/systemctl restart jenkins
```

### 🏭 Production Example (CMG Project)

#### Jenkins Agent Access

**❌ BAD APPROACH:**
```bash
# Team shares jenkins password
su - jenkins
# Then run agent tasks
# No way to track who did what
```

**✅ GOOD APPROACH:**
```bash
# Each team member has sudo access
sudo systemctl start jenkins-agent
sudo systemctl status jenkins-agent
sudo journalctl -u jenkins-agent

# /etc/sudoers configuration:
jenkins-admins ALL=(ALL) /bin/systemctl, /bin/journalctl
```

### 👨‍💼 Interview Tips

> **What interviewers want to hear:**

- ✅ Understand the security difference
- ✅ Know su requires password sharing
- ✅ Know sudo provides audit trail
- ✅ Know sudo is best practice
- ✅ Explain why su is not used in production
- ✅ Know sudoers configuration

### ⏱️ 30-Second Answer

> *"su switches to another user and requires that user's password - it's dangerous because you must share passwords and there's no audit trail. sudo runs a single command as another user with YOUR password, providing full logging. su is legacy; modern production systems use sudo for accountability and security. sudo entries are logged with timestamp and user, making it impossible to misattribute actions."*

### 🧠 Memory Trick

```
su  = "Switch User" = Switch identity completely
sudo = "Super User DO" = Do one command as someone else

su  is like: Handing them the keys (they have full access)
sudo is like: Asking for permission each time (controlled access)
```

---

## Q2: How to Add Users?

### 🎯 Command
```bash
useradd [OPTIONS] USERNAME
```

### 📖 Simple Definition
Create a new user account on the Linux system.

### 🔧 Common Options

```bash
useradd -m -s /bin/bash -d /home/jenkins jenkins
# -m : Create home directory
# -s : Set shell
# -d : Set home directory path
# -u : Specify UID
# -g : Set primary group
# -G : Add to supplementary groups
```

### 💡 Complete User Setup

```bash
# 1. Create user
sudo useradd -m -s /bin/bash -d /home/jenkins -u 2001 jenkins

# 2. Set password
sudo passwd jenkins
Enter password: ****
Confirm password: ****

# 3. Add to group
sudo usermod -aG docker jenkins

# 4. Verify
id jenkins
# uid=2001(jenkins) gid=2001(jenkins) groups=2001(jenkins),999(docker)
```

### 🏭 Production Example (CMG)

#### Jenkins Agent User Creation

```bash
#!/bin/bash
# Setup Jenkins agent user

# Create jenkins user
sudo useradd -m -s /bin/bash -d /var/lib/jenkins jenkins

# Add to docker group (for container management)
sudo usermod -aG docker jenkins

# Create SSH directory
sudo mkdir -p /var/lib/jenkins/.ssh
sudo chmod 700 /var/lib/jenkins/.ssh

# Fix permissions
sudo chown -R jenkins:jenkins /var/lib/jenkins

echo "✓ Jenkins user created and configured"
```

### 👨‍💼 Interview Tips

- ✓ Know basic useradd syntax
- ✓ Know common options (-m, -s, -d)
- ✓ Know how to set password
- ✓ Know how to add to groups
- ✓ Know verification commands

---

## Q3: How to Delete Users?

### 🎯 Command
```bash
userdel [OPTIONS] USERNAME
```

### 📖 Simple Definition
Remove a user account from the system.

### ⚠️ Important Options

```bash
userdel username          # Just remove user account
userdel -r username       # Remove user + home directory
userdel -f username       # Force remove (even if logged in)
```

### 💡 Examples

#### Safe user deletion:
```bash
# Remove user but keep home directory (backup first!)
sudo userdel jenkins

# Then clean up manually
sudo rm -rf /var/lib/jenkins
```

#### Complete removal:
```bash
# Remove user AND home directory
sudo userdel -r jenkins
```

### ⚠️ Before Deleting

```bash
# 1. Backup user data
tar czf jenkins-backup.tar.gz /var/lib/jenkins

# 2. Kill any running processes
sudo pkill -u jenkins

# 3. Check for cron jobs
sudo crontab -u jenkins -l

# 4. Remove from sudo
sudo visudo  # Remove jenkins entries

# 5. Remove from groups
sudo groups jenkins

# 6. Only then delete
sudo userdel -r jenkins
```

---

## Q4: User Authentication Files

### 📁 /etc/passwd - User Accounts

**Format:**
```
username:x:uid:gid:comment:home_dir:shell
```

**Example:**
```
jenkins:x:2001:2001:Jenkins CI/CD:/var/lib/jenkins:/bin/bash
```

| Field | Meaning |
|-------|---------|
| `jenkins` | Username |
| `x` | Password (stored in /etc/shadow) |
| `2001` | UID (User ID) |
| `2001` | GID (Group ID) |
| `Jenkins CI/CD` | Comment/description |
| `/var/lib/jenkins` | Home directory |
| `/bin/bash` | Login shell |

### 🔐 /etc/shadow - Passwords

**Format:**
```
username:encrypted_password:last_changed:min:max:warn:inactive:expire:reserved
```

**Example:**
```
jenkins:$6$abcd1234...:19000:0:99999:7:::
```

| Field | Meaning |
|-------|---------|
| `jenkins` | Username |
| `$6$...` | Encrypted password (hashed) |
| `19000` | Days since Jan 1, 1970 password set |
| `0` | Min days before can change |
| `99999` | Max days before must change |
| `7` | Days warning before expiry |
| `disabled` | Days inactive before lock |

### ⚠️ Security Rules

```bash
# /etc/passwd - Should be readable by all
-rw-r--r-- root root /etc/passwd

# /etc/shadow - Should be readable only by root!
-rw-r----- root root /etc/shadow

# If shadow world-readable = SECURITY RISK
chmod 640 /etc/shadow  # Fix it!
```

### 💡 Viewing User Info

```bash
# View specific user
grep jenkins /etc/passwd
grep jenkins /etc/shadow

# List all users
cut -d: -f1 /etc/passwd

# Count total users
wc -l /etc/passwd
```

---

## Q5: Sudoers Configuration

### 📁 The sudoers File
```
/etc/sudoers - Controls sudo access
/etc/sudoers.d/ - Drop-in configuration files
```

### ⚠️ ALWAYS edit with visudo!

```bash
# CORRECT - Uses syntax checking
sudo visudo

# WRONG - Can break sudo!
sudo vim /etc/sudoers
```

### 🔧 Sudoers Syntax

#### Basic Format:
```bash
user  host=(run_as)  command
```

#### Examples:

```bash
# User jenkins can run systemctl without password
jenkins ALL=(ALL) NOPASSWD: /bin/systemctl

# User john can restart apache on any host
john ALL=(ALL) /usr/sbin/apachectl restart

# Users in docker group can manage docker
%docker ALL=(ALL) NOPASSWD: /usr/bin/docker

# Only specific command with password
jenkins ALL=(ALL) /usr/bin/systemctl restart jenkins
```

### 💡 Real-World Configuration

#### DevOps Team Jenkins Access

```bash
# File: /etc/sudoers.d/jenkins-admins
Cmnd_Alias JENKINS_COMMANDS = \
  /bin/systemctl start jenkins, \
  /bin/systemctl stop jenkins, \
  /bin/systemctl restart jenkins, \
  /bin/systemctl status jenkins, \
  /usr/bin/journalctl -u jenkins

%jenkins-admins ALL=(ALL) NOPASSWD: JENKINS_COMMANDS
```

#### Kubernetes Node Access

```bash
# File: /etc/sudoers.d/k8s-admins
%k8s-admins ALL=(ALL) NOPASSWD: \
  /bin/systemctl start kubelet, \
  /bin/systemctl stop kubelet, \
  /bin/systemctl restart kubelet, \
  /bin/kubectl, \
  /usr/bin/journalctl
```

### 👨‍💼 Interview Tips

- ✓ Know sudoers file location
- ✓ Know syntax (user host command)
- ✓ Know ALWAYS use visudo
- ✓ Know NOPASSWD for automation
- ✓ Know groups with %

---

## ⚡ Quick Reference

### User Management Commands

```bash
# Create user
sudo useradd -m -s /bin/bash -d /home/username username
sudo passwd username

# Modify user
sudo usermod -aG docker username          # Add to group
sudo usermod -s /bin/bash username        # Change shell

# Delete user
sudo userdel -r username                  # With home directory

# View user info
id username
groups username
finger username
```

### Groups

```bash
# Create group
sudo groupadd developers

# Add user to group
sudo usermod -aG developers john
sudo gpasswd -a john developers

# Remove from group
sudo gpasswd -d john developers

# List group members
grep developers /etc/group
```

### Sudo Access

```bash
# Check current sudo privileges
sudo -l

# Edit sudoers (ALWAYS use visudo)
sudo visudo
sudo visudo -f /etc/sudoers.d/jenkins-admins

# Verify sudoers syntax
sudo visudo -c

# Run command as specific user
sudo -u jenkins -s             # Shell as jenkins
sudo -u jenkins command        # Run command as jenkins
```

---

## 🎓 Interview Expectations

**What Interviewers Look For:**

- ✅ Understand su vs sudo security differences
- ✅ Know why sudo is production standard
- ✅ Know sudoers configuration basics
- ✅ Know audit trail importance
- ✅ Know user creation process
- ✅ Know group management
- ✅ Understand /etc/passwd and /etc/shadow

**Red Flag Answers:**

❌ "We share the jenkins password"
✅ "Each person uses sudo with their own credentials"

❌ "su and sudo are basically the same"
✅ "su requires password sharing; sudo provides audit trail"

---

## 📝 Production Best Practices

### ✅ DO

- ✅ Use sudo for all privilege escalation
- ✅ Use sudoers files for configuration
- ✅ Monitor sudo usage logs
- ✅ Remove sudo access when users leave
- ✅ Use groups for access management
- ✅ Always use visudo to edit

### ❌ DON'T

- ❌ Use su or share passwords
- ❌ Edit /etc/sudoers directly (breaks sudo!)
- ❌ Use NOPASSWD for interactive shells
- ❌ Give excessive sudo permissions
- ❌ Forget to verify sudoers syntax
- ❌ Store passwords in scripts

---

**Last Updated:** January 2024 | **Ready for:** DevOps, System Admin, Security Interviews
