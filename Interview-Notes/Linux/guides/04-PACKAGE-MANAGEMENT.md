# 📦 Linux Package Management

> **Master software installation, updates, and dependency management across different Linux distributions**

---

## 📚 Table of Contents

- [Q1: What is a Package Manager?](#q1-what-is-a-package-manager)
- [Q2: List Installed Packages](#q2-list-installed-packages)
- [Q3: Update Packages](#q3-update-packages)
- [Q4: Install Packages](#q4-install-packages)
- [Q5: Remove Packages](#q5-remove-packages)
- [Q6: apt vs apt-get](#q6-apt-vs-apt-get)
- [Q7: yum vs dnf](#q7-yum-vs-dnf)
- [Quick Reference](#-quick-reference)

---

## Q1: What is a Package Manager?

### 📖 Simple Definition
Software that automates installation, updates, and removal of applications and their dependencies on Linux systems.

### 🔄 How It Works

```
1. Query Repository (Mirror Servers)
        │
        ↓
2. Resolve Dependencies Automatically
        │
        ↓
3. Download Package + Dependencies
        │
        ↓
4. Verify Package Integrity
        │
        ↓
5. Extract to System Locations
        │
        ↓
6. Update Library Cache
        │
        ↓
7. Configure Application
```

### 💡 Why Use Package Managers?

| Benefit | Without | With |
|---------|---------|------|
| **Dependencies** | Manual | Automatic |
| **Consistency** | Each system different | Identical across systems |
| **Updates** | Manual process | One command |
| **Removal** | Leave files behind | Clean removal |
| **Security** | Must find patches | Automatic security updates |

### 🐧 Distribution Package Managers

| Distribution | Package Manager | Command |
|-------------|-----------------|---------|
| Ubuntu/Debian | apt / apt-get | `apt install` |
| CentOS 7 | yum | `yum install` |
| CentOS 8+ | dnf | `dnf install` |
| Fedora | dnf | `dnf install` |
| Red Hat | yum/dnf | `yum/dnf install` |
| Alpine | apk | `apk add` |

### 🏭 Real-World Example (CMG Project)

#### Install Docker on Ubuntu:
```bash
$ apt update
$ apt install -y docker.io
$ docker --version
Docker version 20.10.12
```

#### Install Docker on CentOS:
```bash
$ yum install -y docker
$ docker --version
Docker version 20.10.12
```

### 👨‍💼 Interview Tips

- ✓ Know what package managers do
- ✓ Know distribution differences
- ✓ Know dependency resolution
- ✓ Understand repository concept
- ✓ Know security aspect

### ⏱️ 30-Second Answer

> *"A package manager automates software installation and management. It downloads packages from trusted repositories, automatically resolves and installs dependencies, and tracks what's installed for easy updates or removal. Different distributions use different managers - apt for Debian/Ubuntu, yum/dnf for Red Hat/CentOS. This ensures consistency, security, and simplifies system administration."*

---

## Q2: List Installed Packages

### 🎯 Commands

#### Debian/Ubuntu:
```bash
dpkg -l                        # All packages
apt list --installed           # Apt format
dpkg -l | grep docker          # Search
```

#### Red Hat/CentOS:
```bash
yum list installed             # All packages
dnf list installed             # Dnf format
yum list installed | grep docker
```

### 💡 Examples

#### Ubuntu - List installed:
```bash
$ apt list --installed | head -5
adduser/focal,now 3.118 all [installed]
apt/focal-updates,focal-security,now 2.0.2ubuntu0.4 all [installed]
base-files/focal-updates,now 11.1+deb9u6+11 i386 [installed]
```

#### CentOS - List installed:
```bash
$ yum list installed | head -5
Loaded plugins: fastestmirror
Installed Packages
adduser.noarch             3.118-1.fc25             @anaconda
yum.noarch                 3.4.3-158.fc25           @anaconda
```

#### Check if package installed:
```bash
# Ubuntu
if dpkg -l | grep -q docker; then
  echo "Docker is installed"
fi

# CentOS
if yum list installed | grep -q docker; then
  echo "Docker is installed"
fi
```

### 🏭 Production Audit

#### List essential DevOps tools:
```bash
#!/bin/bash
for pkg in git docker terraform ansible curl wget; do
  if apt list --installed 2>/dev/null | grep -q "^$pkg"; then
    echo "✓ $pkg installed"
  else
    echo "✗ $pkg NOT installed"
  fi
done
```

---

## Q3: Update Packages

### 🎯 Commands

#### Debian/Ubuntu:
```bash
apt update                # Update package index
apt upgrade               # Upgrade existing packages
apt full-upgrade          # Distribution upgrade
apt install --only-upgrade PACKAGE
```

#### Red Hat/CentOS:
```bash
yum check-update          # Check for updates
yum update                # Install all updates
yum update PACKAGE        # Update specific package
yum update --security     # Only security updates
```

### 🔄 Update vs Upgrade

| Command | What It Does |
|---------|-------------|
| `apt update` | Downloads latest package INDEX only |
| `apt upgrade` | INSTALLS updates for existing packages |
| `yum update` | Both updates index AND installs |
| `apt full-upgrade` | May remove packages for dependencies |

### 💡 Safe Update Pattern

#### Development/Test:
```bash
apt update && apt upgrade -y
# Immediate updates for testing
```

#### Production:
```bash
# 1. Plan maintenance window
# 2. Backup system
# 3. Test in staging
# 4. Wait 2-4 weeks for stability
# 5. Update production
# 6. Monitor closely

apt update
apt upgrade -y
systemctl restart critical-services
# Verify all services running
```

### 🏭 Automated Updates

#### Ubuntu - Unattended upgrades:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Enable security updates only
cat /etc/apt/apt.conf.d/50unattended-upgrades
```

#### CentOS - Yum-cron:
```bash
sudo yum install yum-cron
sudo systemctl start yum-cron
sudo systemctl enable yum-cron
```

### ⚠️ When NOT to Update

```bash
❌ DON'T UPDATE IN PRODUCTION WHEN:
├─ No maintenance window planned
├─ No backup available
├─ No staging environment
├─ Peak business hours
├─ Critical application running
└─ Unknown package changes
```

### 👨‍💼 Interview Tips

- ✓ Know update vs upgrade
- ✓ Know security importance
- ✓ Know testing first
- ✓ Know production strategy
- ✓ Know automated options

---

## Q4: Install Packages

### 🎯 Commands

#### Debian/Ubuntu:
```bash
apt install PACKAGE              # Install
apt install PACKAGE1 PACKAGE2    # Multiple
apt install -y PACKAGE           # No prompt
apt install PACKAGE=VERSION      # Specific version
```

#### Red Hat/CentOS:
```bash
yum install PACKAGE
yum install -y PACKAGE
yum install PACKAGE-VERSION
```

### 💡 Installation Pattern

#### Step-by-step installation:
```bash
# 1. Update package index
apt update

# 2. Install package
apt install -y docker.io

# 3. Enable at boot
systemctl enable docker

# 4. Start service
systemctl start docker

# 5. Verify
docker --version
systemctl status docker
```

### 🏭 Production Setup (CMG)

#### Jenkins agent setup:
```bash
#!/bin/bash
apt update -y

# Install essential tools
apt install -y \
  git \
  docker.io \
  openjdk-11-jdk \
  maven \
  terraform \
  curl \
  wget

# Start services
systemctl start docker
systemctl enable docker

echo "✓ Jenkins agent ready"
```

#### Kubernetes node setup:
```bash
#!/bin/bash
apt update -y

# Install K8s components
apt install -y \
  kubelet \
  kubeadm \
  kubectl

# Enable and start
systemctl enable kubelet
systemctl start kubelet

echo "✓ Kubernetes node ready"
```

---

## Q5: Remove Packages

### 🎯 Commands

#### Debian/Ubuntu:
```bash
apt remove PACKAGE           # Remove (keep config)
apt purge PACKAGE            # Remove + config
apt autoremove               # Remove orphaned deps
apt clean                    # Clean package cache
```

#### Red Hat/CentOS:
```bash
yum remove PACKAGE
yum autoremove               # Remove unused
yum clean all                # Clean cache
```

### 💡 Cleanup Pattern

#### Safe cleanup:
```bash
# 1. Remove unused packages
apt autoremove -y

# 2. Clean package cache
apt clean

# 3. Verify space saved
df -h
```

### 🏭 Production Maintenance

#### Regular cleanup script:
```bash
#!/bin/bash
echo "Cleaning unused packages..."
apt autoremove -y
apt clean

echo "Removing old kernel images..."
apt remove -y --purge \
  $(dpkg -l | grep '^rc' | awk '{print $2}')

echo "Cleanup complete"
df -h
```

---

## Q6: apt vs apt-get

### 📊 Comparison

| Feature | apt-get | apt |
|---------|---------|-----|
| **User experience** | Basic | User-friendly |
| **Output** | Minimal | Formatted |
| **Progress bar** | No | Yes ✓ |
| **Stability** | Stable API | Still stable |
| **Recommended** | Scripts | Manual/interactive |
| **Output** | Minimal | Better formatted |

### 💡 Practical Differences

#### apt-get (scripting):
```bash
#!/bin/bash
apt-get update
apt-get install -y docker.io
# Stable, used in automation
```

#### apt (interactive):
```bash
# Manual usage
$ apt update
Get:1 http://archive.ubuntu.com focal InRelease
Hit:2 http://security.ubuntu.com focal-security InRelease
Setting up docker.io (20.10.12)
✓ Better for humans
```

### ⏱️ Which to Use?

```
SCRIPTS → apt-get
  └─ More stable API
  └─ Predictable behavior

INTERACTIVE → apt
  └─ Better output
  └─ Progress bars
  └─ Easier to read
```

---

## Q7: yum vs dnf

### 📊 Comparison

| Feature | yum | dnf |
|---------|-----|-----|
| **Performance** | Slower | Faster ✓ |
| **Dependency resolution** | Slower | Optimized ✓ |
| **Supported** | CentOS 7 | CentOS 8+, Fedora |
| **Plugins** | Yes | Better ✓ |
| **Parallelization** | Limited | Full ✓ |

### 💡 When to Use

#### CentOS 7 → Use yum:
```bash
yum install docker
yum update
yum remove docker
```

#### CentOS 8+/Fedora → Use dnf:
```bash
dnf install docker
dnf upgrade
dnf remove docker
```

#### CentOS 8 compatibility:
```bash
# Both work (yum is alias to dnf)
yum install docker     # Works
dnf install docker     # Works
```

### 🏆 dnf Advantages

```
✓ MUCH faster dependency resolution
✓ Parallel processing
✓ Better error messages
✓ Modern Python 3 based
✓ Better memory usage
```

---

## ⚡ Quick Reference

### Common Operations

```bash
# Debian/Ubuntu
apt update                    # Update index
apt upgrade -y                # Install updates
apt install -y PACKAGE        # Install
apt remove -y PACKAGE         # Remove
apt autoremove -y             # Remove unused
apt clean                     # Clean cache
dpkg -l                       # List installed

# Red Hat/CentOS
yum check-update              # Check for updates
yum update -y                 # Install updates
yum install -y PACKAGE        # Install
yum remove -y PACKAGE         # Remove
yum autoremove                # Remove unused
yum clean all                 # Clean cache
yum list installed            # List installed

# DNF (Fedora/CentOS 8+)
dnf check-upgrade             # Check for updates
dnf upgrade -y                # Install updates
dnf install -y PACKAGE        # Install
dnf remove -y PACKAGE         # Remove
dnf autoremove                # Remove unused
dnf clean all                 # Clean cache
```

### Production Patterns

#### Safe production install:
```bash
# 1. Update index
apt update

# 2. Install package
apt install -y PACKAGE

# 3. Verify installation
PACKAGE --version
systemctl status PACKAGE

# 4. Check logs
journalctl -u PACKAGE -n 20
```

#### Security update only:
```bash
# Critical patches
yum update --security

# Or automated
sudo systemctl start yum-cron
```

---

## 🎓 Interview Expectations

**What Interviewers Look For:**

- ✅ Know distribution differences
- ✅ Understand dependency resolution
- ✅ Know apt vs apt-get usage
- ✅ Know yum vs dnf differences
- ✅ Understand security updates
- ✅ Know scripting patterns
- ✅ Know production best practices

**Red Flag Answers:**

❌ "All package managers are the same"
✅ "Different distributions use different managers"

❌ "apt-get and apt are exactly the same"
✅ "apt is newer and user-friendly; apt-get is stable for scripts"

---

## 📝 Production Best Practices

### ✅ DO

- ✅ Always `update` before installing
- ✅ Test updates in staging first
- ✅ Use automation tools for consistency
- ✅ Automate security updates
- ✅ Document why each package is installed
- ✅ Remove unused packages regularly
- ✅ Use version pinning for critical packages

### ❌ DON'T

- ❌ Install without updating index
- ❌ Update production without testing
- ❌ Mix package managers on one system
- ❌ Ignore security updates
- ❌ Keep unused packages (security risk)
- ❌ Use untrusted repositories

---

**Last Updated:** January 2024 | **Ready for:** DevOps, Cloud, SRE Interviews
