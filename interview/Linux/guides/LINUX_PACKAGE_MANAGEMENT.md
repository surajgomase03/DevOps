================================================================================
SECTION 4: LINUX - PACKAGE MANAGEMENT
================================================================================

Q1. WHAT IS A PACKAGE MANAGER?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

SIMPLE DEFINITION:
Software that automates installation, updating, and removal of applications
and libraries on Linux systems.

DETAILED EXPLANATION:

A package manager is a system utility that:
1. Downloads software packages from repositories (mirrors)
2. Resolves dependencies automatically
3. Installs packages and their required libraries
4. Manages package versions
5. Removes packages cleanly
6. Updates packages to latest versions
7. Tracks installed packages

WHY IS IT USED?

âœ“ Dependency management (automatic)
âœ“ Consistency across systems
âœ“ Security updates distribution
âœ“ Easy rollback capabilities
âœ“ Version control
âœ“ Repository management

HOW DOES IT WORK?

1. Query repository index
2. Download package and dependencies
3. Verify package integrity
4. Extract files to proper locations
5. Update system library cache
6. Configure application

LINUX DISTRIBUTIONS AND PACKAGE MANAGERS:

Debian/Ubuntu        â†’ apt, apt-get, aptitude
Red Hat/CentOS/Fedora â†’ yum, dnf
Arch Linux          â†’ pacman
Alpine Linux        â†’ apk

REAL-TIME EXAMPLE:

Installing Docker on Ubuntu:
$ apt update                    (update repo index)
$ apt install docker.io         (downloads & installs)
$ docker --version              (verify installation)

Installing Docker on CentOS:
$ yum install docker            (downloads & installs)
$ docker --version              (verify installation)

PRODUCTION USAGE:

CMG PROJECT:

Jenkins agent setup:
  Ubuntu agent:
    apt update
    apt install -y git docker.io terraform
    
  CentOS agent:
    yum install -y git docker terraform
    
Kubernetes node setup:
  On all K8s nodes:
    Ubuntu: apt install -y kubelet kubeadm kubectl
    CentOS: yum install -y kubelet kubeadm kubectl

PACKAGE TYPES:

1. Binary packages (.deb, .rpm)
   Compiled, ready to use

2. Source packages (.tar.gz, .src.rpm)
   Source code, must compile

3. Package format
   Contains binaries, config files, dependencies

SECURITY CONSIDERATIONS:

âœ“ Always run 'apt update' before installing
âœ“ Verify package signatures
âœ“ Use trusted repositories only
âœ“ Apply security updates regularly
âœ“ Keep package manager itself updated

INTERVIEWER'S EXPECTATION:

âœ“ Understand package manager purpose
âœ“ Know distribution-specific tools
âœ“ Understand dependency resolution
âœ“ Know how to find packages
âœ“ Know basic install/remove commands

COMMON MISTAKES:

âŒ Installing packages without updating repository index
âŒ Using old/insecure repositories
âŒ Not handling unmet dependencies
âŒ Installing packages from unknown sources

30-SECOND INTERVIEW ANSWER:

"A package manager automates software installation on Linux. It downloads
packages from trusted repositories, automatically resolves dependencies,
installs everything to proper system locations, and allows easy updates or
removal. Different distributions use different managers - apt for Debian/Ubuntu,
yum/dnf for Red Hat/CentOS. This ensures consistency and security across systems."

MEMORY TRICK:

Package Manager = App Store for Linux
Repository = Download server
Package = Software with dependencies
Dependencies = Required libraries

================================================================================

Q2. HOW DO YOU LIST INSTALLED PACKAGES?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

DEBIAN/UBUNTU (APT):

1. List all installed packages
   dpkg -l
   apt list --installed
   
   Output format:
   ii  package-name   version   architecture   description
   
2. List specific package
   dpkg -l | grep docker
   apt list --installed | grep docker
   
3. Show package details
   dpkg -l package-name
   
4. List with description
   apt list --installed --all-versions

RED HAT/CENTOS (YUM/DNF):

1. List all installed packages
   yum list installed
   dnf list installed
   
2. List specific package
   yum list installed | grep docker
   dnf list installed | grep docker
   
3. Show package details
   yum info docker

COMMON USAGE:

1. Check if package installed
   dpkg -l | grep nginx
   yum list installed | grep nginx
   
2. Count installed packages
   dpkg -l | wc -l
   yum list installed | wc -l
   
3. Find package with pattern
   apt list --installed | grep -i python
   yum list installed | grep -i python

EXAMPLES:

1. Ubuntu - Check Docker
   $ dpkg -l | grep docker
   ii  docker.io                    1:20.10.12~3-0~ubuntu-focal
   
2. CentOS - Check Jenkins
   $ yum list installed | grep jenkins
   jenkins.noarch          2.387.1-1.1       @jenkins
   
3. Check specific version
   $ apt list --installed docker.io
   docker.io/focal-security,focal-updates 20.10.12~3-0~ubuntu

CMG PROJECT EXAMPLES:

1. Check Jenkins installation
   Ubuntu: dpkg -l jenkins
   CentOS: yum list installed jenkins
   
2. Verify Kubernetes tools
   dpkg -l | grep -E "kubectl|kubeadm|kubelet"
   yum list installed | grep -E "kubectl|kubeadm|kubelet"
   
3. Check build tools
   dpkg -l | grep -E "git|docker|terraform"
   yum list installed | grep -E "git|docker|terraform"

SCRIPTING EXAMPLE:

#!/bin/bash
# Check if essential DevOps tools are installed

REQUIRED_PACKAGES=("git" "docker" "terraform" "ansible")
OS_TYPE=$(grep "^NAME=" /etc/os-release | cut -d'"' -f2)

if [[ $OS_TYPE == *"Ubuntu"* ]]; then
  CMD="dpkg -l"
elif [[ $OS_TYPE == *"CentOS"* ]]; then
  CMD="yum list installed"
fi

for package in "${REQUIRED_PACKAGES[@]}"; do
  if $CMD | grep -i "$package" > /dev/null; then
    echo "âœ“ $package installed"
  else
    echo "âœ— $package NOT installed"
  fi
done

INTERVIEW TIPS:
  âœ“ Know both apt and yum syntax
  âœ“ Know dpkg -l for Debian systems
  âœ“ Know piping with grep for filtering
  âœ“ Know how to count packages

PRODUCTION BEST PRACTICES:

âœ“ Maintain documented list of required packages
âœ“ Regular audit of installed packages
âœ“ Remove unused packages to reduce attack surface
âœ“ Document why each package is installed
âœ“ Use configuration management (Ansible) for consistency

================================================================================

Q3. HOW DO YOU UPDATE PACKAGES?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

DEBIAN/UBUNTU (APT):

1. Update package index
   apt update
   (Downloads latest package list from repositories)
   
2. Upgrade installed packages
   apt upgrade                    (safe upgrade, keeps dependencies)
   apt dist-upgrade              (distribution upgrade, may remove packages)
   apt full-upgrade              (same as dist-upgrade)
   
3. Update specific package
   apt install --only-upgrade package-name
   
4. Combined (recommended)
   apt update && apt upgrade -y

RED HAT/CENTOS (YUM/DNF):

1. Update package index
   yum check-update
   dnf check-update
   (Just lists updates, doesn't install)
   
2. Update all packages
   yum update
   dnf upgrade
   (Downloads and installs all updates)
   
3. Update specific package
   yum update package-name
   dnf upgrade package-name
   
4. Security updates only
   yum update --security
   dnf upgrade --security

DIFFERENCE BETWEEN UPDATE AND UPGRADE:

apt update     â†’ Updates package INDEX only
apt upgrade    â†’ INSTALLS updates for existing packages
yum update     â†’ Both updates index AND installs

EXAMPLES:

1. Ubuntu system update
   $ apt update
   Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
   ...
   $ apt upgrade -y
   Reading package lists... Done
   ...
   
2. CentOS system update
   $ yum check-update
   docker.io.x86_64  20.10.21-1  updates
   ...
   $ yum update -y
   Loaded plugins: fastestmirror
   ...

SECURITY UPDATES:

Critical for production systems!

Ubuntu security updates:
  apt install -y unattended-upgrades
  (Automatic security updates)

CentOS security updates:
  yum install -y yum-cron
  (Automatic security updates)

CMG PROJECT EXAMPLE:

Jenkins agent security update:
  1. SSH to Jenkins agent
  2. apt update && apt upgrade -y      (Ubuntu)
     OR
     yum update -y                     (CentOS)
  3. systemctl restart jenkins
  4. Verify connectivity

Kubernetes node update:
  1. Drain node: kubectl drain node-name
  2. Update packages: apt update && apt upgrade -y
  3. Reboot if needed: reboot
  4. Uncordon node: kubectl uncordon node-name

PRODUCTION UPDATE STRATEGY:

Development/Test environment:
  Immediate updates for testing

Staging environment:
  Wait 1-2 weeks after release
  Validate compatibility

Production environment:
  Wait 2-4 weeks after release
  Test in staging first
  Plan maintenance window
  Update during low-usage time
  Monitor closely after update

SCRIPTING UPDATE:

#!/bin/bash
# Safe package update with logging

LOG_FILE="/var/log/package-update.log"

echo "Starting package update at $(date)" | tee -a $LOG_FILE

if [ -f /etc/debian_version ]; then
  apt update >> $LOG_FILE 2>&1
  if [ $? -ne 0 ]; then
    echo "ERROR: apt update failed" | tee -a $LOG_FILE
    exit 1
  fi
  apt upgrade -y >> $LOG_FILE 2>&1
  if [ $? -ne 0 ]; then
    echo "ERROR: apt upgrade failed" | tee -a $LOG_FILE
    exit 1
  fi
elif [ -f /etc/redhat-release ]; then
  yum update -y >> $LOG_FILE 2>&1
  if [ $? -ne 0 ]; then
    echo "ERROR: yum update failed" | tee -a $LOG_FILE
    exit 1
  fi
fi

echo "Package update completed at $(date)" | tee -a $LOG_FILE

INTERVIEW TIPS:
  âœ“ Know update vs upgrade difference
  âœ“ Know security update importance
  âœ“ Know system reboot may be needed
  âœ“ Know testing before production update
  âœ“ Know risks of not updating

COMMON MISTAKES:

âŒ Not running 'apt update' before 'apt upgrade'
âŒ Upgrading production without testing
âŒ Not checking if reboot is required
âŒ Ignoring security updates
âŒ Not monitoring after updates

================================================================================

Q4. HOW DO YOU INSTALL PACKAGES?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

DEBIAN/UBUNTU (APT):

1. Install single package
   apt install package-name
   
2. Install multiple packages
   apt install package1 package2 package3
   
3. Install without prompting
   apt install -y package-name
   
4. Install specific version
   apt install package-name=version
   
5. Install from .deb file
   apt install ./package.deb
   dpkg -i package.deb

RED HAT/CENTOS (YUM/DNF):

1. Install single package
   yum install package-name
   dnf install package-name
   
2. Install multiple packages
   yum install package1 package2 package3
   
3. Install without prompting
   yum install -y package-name
   dnf install -y package-name
   
4. Install specific version
   yum install package-name-version
   
5. Install from .rpm file
   yum install ./package.rpm
   dnf install ./package.rpm
   rpm -i package.rpm

INSTALL EXAMPLES:

1. Ubuntu - Install Docker
   $ apt update
   $ apt install -y docker.io
   
2. CentOS - Install Docker
   $ yum install -y docker
   
3. Install multiple tools
   Ubuntu: apt install -y git docker.io terraform curl wget
   CentOS: yum install -y git docker terraform curl wget
   
4. Install specific version
   apt install jenkins=2.387.1
   yum install jenkins-2.387.1

CMG PROJECT - JENKINS AGENT SETUP:

Ubuntu Jenkins Agent:
#!/bin/bash
apt update -y
apt install -y \
  git \
  docker.io \
  openjdk-11-jdk \
  maven \
  terraform \
  curl \
  wget \
  ansible \
  build-essential

CentOS Jenkins Agent:
#!/bin/bash
yum update -y
yum install -y \
  git \
  docker \
  java-11-openjdk \
  maven \
  terraform \
  curl \
  wget \
  ansible \
  gcc \
  make

KUBERNETES NODE SETUP:

Ubuntu K8s node:
apt update -y
apt install -y kubelet kubeadm kubectl
systemctl start kubelet
systemctl enable kubelet

CentOS K8s node:
yum install -y kubelet kubeadm kubectl
systemctl start kubelet
systemctl enable kubelet

PRODUCTION INSTALLATION PATTERN:

1. Update repository
   apt update / yum check-update
   
2. Install package
   apt install -y / yum install -y
   
3. Enable service (if applicable)
   systemctl enable service-name
   
4. Start service
   systemctl start service-name
   
5. Verify installation
   service-name --version
   systemctl status service-name

AUTOMATE WITH SCRIPTS:

#!/bin/bash
# Complete DevOps agent setup

set -e  # Exit on error
LOG="/var/log/devops-setup.log"

log_msg() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG
}

if grep -q "Ubuntu" /etc/os-release; then
  log_msg "Ubuntu detected"
  apt update
  apt install -y docker.io git terraform curl wget
  systemctl start docker
  systemctl enable docker
elif grep -q "CentOS" /etc/os-release; then
  log_msg "CentOS detected"
  yum install -y docker git terraform curl wget
  systemctl start docker
  systemctl enable docker
fi

log_msg "Setup completed"

INTERVIEW TIPS:
  âœ“ Know basic syntax for apt/yum
  âœ“ Know -y flag for automation
  âœ“ Know dependencies are automatic
  âœ“ Know version specification syntax
  âœ“ Know post-install configuration

COMMON MISTAKES:

âŒ Installing without 'apt update' / 'yum check-update'
âŒ Forgetting to start/enable service
âŒ Not checking installation success
âŒ Mixing apt and yum commands
âŒ Not handling package conflicts

================================================================================

Q5. HOW DO YOU REMOVE PACKAGES?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

DEBIAN/UBUNTU (APT):

1. Remove package (keeps config files)
   apt remove package-name
   apt remove -y package-name
   
2. Remove package and dependencies
   apt autoremove
   (Removes orphaned dependencies)
   
3. Remove package and config files
   apt purge package-name
   apt purge -y package-name
   
4. Clean package cache
   apt clean                   (removes all cached packages)
   apt autoclean              (removes old cached packages)

RED HAT/CENTOS (YUM/DNF):

1. Remove package
   yum remove package-name
   yum remove -y package-name
   dnf remove package-name
   
2. Remove package and dependencies
   yum autoremove              (removes unused dependencies)
   dnf autoremove
   
3. Clean package cache
   yum clean all
   dnf clean all

EXAMPLES:

1. Ubuntu - Remove Docker
   $ apt remove -y docker.io
   $ apt autoremove -y
   $ apt clean
   
2. CentOS - Remove Docker
   $ yum remove -y docker
   $ yum autoremove
   $ yum clean all
   
3. Remove multiple packages
   apt remove -y docker.io jenkins git
   
4. Remove and purge config
   apt purge -y jenkins
   (Complete removal including configs)

REMOVE vs PURGE:

remove â†’ Removes package binaries, keeps config files
purge  â†’ Removes package completely including config files

Use purge for complete removal.

PRODUCTION CLEANUP:

Remove unused packages:
  apt autoremove -y
  yum autoremove -y
  
Clean package cache:
  apt clean
  yum clean all
  
Benefits:
  âœ“ Reduces disk usage
  âœ“ Reduces security surface
  âœ“ Faster boot (fewer packages to manage)
  âœ“ Cleaner system

CMG PROJECT:

Clean unused packages on Jenkins agent:
  #!/bin/bash
  apt remove -y $(apt-mark showauto)
  apt autoremove -y
  apt clean
  
Clean old Docker images:
  docker image prune -a -y

SCRIPTING EXAMPLE:

#!/bin/bash
# Cleanup unused packages

PACKAGES_TO_REMOVE=(
  "unnecessary-package1"
  "unnecessary-package2"
  "unnecessary-package3"
)

for pkg in "${PACKAGES_TO_REMOVE[@]}"; do
  if dpkg -l | grep -i "$pkg" > /dev/null; then
    echo "Removing $pkg..."
    apt remove -y "$pkg"
  fi
done

echo "Removing orphaned dependencies..."
apt autoremove -y

echo "Cleaning package cache..."
apt clean

echo "Cleanup completed"

INTERVIEW TIPS:
  âœ“ Know remove vs purge difference
  âœ“ Know autoremove for dependencies
  âœ“ Know apt clean for cache
  âœ“ Know when to use each command

COMMON MISTAKES:

âŒ Removing critical system packages
âŒ Not checking dependencies before removal
âŒ Forgetting to autoremove orphaned packages
âŒ Not understanding remove vs purge

================================================================================

Q6. DIFFERENCE BETWEEN APT AND APT-GET?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

BACKGROUND:

apt-get: Original low-level package manager (older)
apt:     High-level interface introduced in Ubuntu 16.04

APT-GET (OLD):
  apt-get install
  apt-get remove
  apt-get update
  apt-get upgrade
  
APT (NEW):
  apt install
  apt remove
  apt update
  apt upgrade

COMPARISON TABLE:

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Function         â”‚ apt-get             â”‚ apt                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Install          â”‚ apt-get install     â”‚ apt install          â”‚
â”‚ Remove           â”‚ apt-get remove      â”‚ apt remove           â”‚
â”‚ Update index     â”‚ apt-get update      â”‚ apt update           â”‚
â”‚ Upgrade packages â”‚ apt-get upgrade     â”‚ apt upgrade          â”‚
â”‚ Search packages  â”‚ apt-cache search    â”‚ apt search           â”‚
â”‚ Show package     â”‚ apt-cache show      â”‚ apt show             â”‚
â”‚ Autoremove       â”‚ apt-get autoremove  â”‚ apt autoremove       â”‚
â”‚ Clean cache      â”‚ apt-get clean       â”‚ apt clean            â”‚
â”‚ Interactive      â”‚ No                  â”‚ Yes (progress bar)   â”‚
â”‚ Progress display â”‚ Minimal             â”‚ Better formatted     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

ADVANTAGES OF APT:

âœ“ Better progress display
âœ“ More user-friendly
âœ“ Combines related commands
âœ“ Better for interactive use
âœ“ Recommended for most users

EXAMPLES:

Using apt-get:
  $ apt-get update
  $ apt-get install docker.io
  $ apt-get upgrade
  
Using apt:
  $ apt update
  $ apt install docker.io
  $ apt upgrade

SCRIPTING:

Scripts should use apt-get (more stable API):
  #!/bin/bash
  apt-get update -y
  apt-get install -y docker.io
  
Interactive/manual use uses apt:
  $ apt install docker.io

INTERVIEW TIPS:
  âœ“ Know apt is newer/recommended
  âœ“ Know both work similarly
  âœ“ Know apt is more user-friendly
  âœ“ Know apt-get for scripts

================================================================================

Q7. DIFFERENCE BETWEEN YUM AND DNF?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

BACKGROUND:

yum:  Original package manager for Red Hat/CentOS (older)
dnf:  Newer package manager (Fedora 22+, CentOS 8+)

DNF IMPROVEMENTS OVER YUM:

âœ“ Faster dependency resolution
âœ“ Better performance
âœ“ More user-friendly output
âœ“ Cleaner syntax
âœ“ Better plugin system

COMPATIBILITY:

CentOS 7 and older: Use yum
Fedora 22+:        Use dnf
CentOS 8+:         Use dnf (yum is alias to dnf)

COMMAND COMPARISON:

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Function         â”‚ yum                  â”‚ dnf                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Install          â”‚ yum install          â”‚ dnf install          â”‚
â”‚ Remove           â”‚ yum remove           â”‚ dnf remove           â”‚
â”‚ Update           â”‚ yum update           â”‚ dnf upgrade          â”‚
â”‚ Check updates    â”‚ yum check-update     â”‚ dnf check-upgrade    â”‚
â”‚ Search           â”‚ yum search           â”‚ dnf search           â”‚
â”‚ Info             â”‚ yum info             â”‚ dnf info             â”‚
â”‚ List installed   â”‚ yum list installed   â”‚ dnf list installed   â”‚
â”‚ Clean cache      â”‚ yum clean all        â”‚ dnf clean all        â”‚
â”‚ Autoremove       â”‚ N/A                  â”‚ dnf autoremove       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

EXAMPLES:

YUM (CentOS 7):
  $ yum check-update
  $ yum install -y docker git
  $ yum update -y
  $ yum remove docker
  
DNF (Fedora, CentOS 8+):
  $ dnf check-upgrade
  $ dnf install -y docker git
  $ dnf upgrade -y
  $ dnf remove docker

PERFORMANCE:

yum:  Slower dependency resolution (especially with many packages)
dnf:  Faster, more parallel processing

PRACTICAL IMPACT:

Large installation (many dependencies):
  yum install complex-package-with-many-deps  â†’ takes time
  dnf install complex-package-with-many-deps  â†’ faster

INTERVIEW TIPS:
  âœ“ Know dnf is newer
  âœ“ Know CentOS 7 uses yum, CentOS 8+ uses dnf
  âœ“ Know syntax is mostly same
  âœ“ Know dnf is faster

================================================================================

QUICK REVISION - PACKAGE MANAGEMENT
================================================================================

KEY CONCEPTS:

Package Manager   â†’ Automates software installation/updates
Repository        â†’ Server hosting software packages
Dependencies      â†’ Required libraries/packages
Package           â†’ Software with version and metadata

DEBIAN/UBUNTU (APT):

apt update        Update package index
apt upgrade       Upgrade installed packages
apt install       Install package
apt remove        Remove package
apt autoremove    Remove unused dependencies
apt clean         Clean cache
dpkg -l           List installed packages

RED HAT/CENTOS (YUM):

yum check-update  Check for updates
yum update        Update packages
yum install       Install package
yum remove        Remove package
yum autoremove    Remove unused dependencies (CentOS 8+ only)
yum clean all     Clean cache
yum list installed  List installed packages

DNF (FEDORA/CENTOS 8+):

dnf check-upgrade Check for updates
dnf upgrade       Upgrade packages
dnf install       Install package
dnf remove        Remove package
dnf autoremove    Remove unused dependencies
dnf clean all     Clean cache
dnf list installed  List installed packages

BEST PRACTICES:

âœ“ Always run update before install
âœ“ Use -y flag for automation
âœ“ Keep packages updated for security
âœ“ Remove unused packages regularly
âœ“ Document required packages
âœ“ Test updates in dev before production
âœ“ Use configuration management for consistency
âœ“ Keep security updates current

PRODUCTION PATTERNS:

Setup script:
  1. apt/yum update
  2. apt/yum install -y packages
  3. systemctl enable service
  4. systemctl start service
  5. Verify installation

Update script:
  1. apt/yum update
  2. apt/yum install -y package
  3. systemctl restart service
  4. Verify functionality

SECURITY CONSIDERATIONS:

âœ“ Only install from trusted repositories
âœ“ Keep package manager itself updated
âœ“ Apply security updates promptly
âœ“ Use package signatures for verification
âœ“ Audit installed packages regularly
âœ“ Remove packages you don't need

INTERVIEWER EXPECTATIONS:

âœ“ Know distribution-specific commands
âœ“ Understand dependency resolution
âœ“ Know when to use each command
âœ“ Know security update importance
âœ“ Know scripting patterns
âœ“ Know best practices for production

================================================================================

