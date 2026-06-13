================================================================================
SECTION 2: LINUX - USER MANAGEMENT
================================================================================

Q1. DIFFERENCE BETWEEN su AND sudo
─────────────────────────────────────────────────────────────────────────────

su vs sudo - A Critical Production Distinction

┌─────────────┬──────────────────────────────┬──────────────────────────────┐
│ ASPECT      │ su (Switch User)             │ sudo (Super User Do)         │
├─────────────┼──────────────────────────────┼──────────────────────────────┤
│ Purpose     │ Switch to another user       │ Execute command as another   │
│             │ (usually root)               │ user without switching       │
├─────────────┼──────────────────────────────┼──────────────────────────────┤
│ Password    │ Requires TARGET USER password│ Requires YOUR password       │
│             │ (usually root password)      │ (your own password)          │
├─────────────┼──────────────────────────────┼──────────────────────────────┤
│ Environment │ Full shell environment       │ Runs single command, keeps   │
│             │ changes to target user       │ current environment          │
├─────────────┼──────────────────────────────┼──────────────────────────────┤
│ Logging     │ Minimal - hard to audit      │ Fully logged to /var/log     │
├─────────────┼──────────────────────────────┼──────────────────────────────┤
│ Security    │ Shares root password = risk  │ No password sharing = secure │
├─────────────┼──────────────────────────────┼──────────────────────────────┤
│ Use Case    │ Interactive shell as root    │ Single administrative tasks  │
├─────────────┼──────────────────────────────┼──────────────────────────────┤
│ Auditability│ Poor - no audit trail        │ Excellent - full logging     │
└─────────────┴──────────────────────────────┴──────────────────────────────┘

SYNTAX:

su [OPTIONS] [USERNAME]
su -                    (Switch to root, load profile)
su - jenkins            (Switch to jenkins user)
su                      (Switch to root, keep current environment)

sudo [OPTIONS] COMMAND
sudo systemctl restart apache2
sudo -i                 (Interactive root shell like 'su -')
sudo -u jenkins whoami  (Execute as jenkins user)

REAL EXAMPLES:

1. Switch to root with full environment
   su -                          (password: root's password)
   # Now you're root with /root as home

2. Execute single command as root
   sudo systemctl restart nginx
   (password: your password)

3. Switch to jenkins user
   su - jenkins                  (password: jenkins's password)

4. Execute command as different user
   sudo -u jenkins whoami
   
5. Execute interactive root shell via sudo
   sudo -i                       (password: your password)
   # Full root shell without knowing root password

CMG PROJECT EXAMPLES:

Scenario 1: Jenkins Agent Deployment
  Regular user needs to restart Jenkins:
  sudo systemctl restart jenkins        ✓ (no password sharing)
  
  NOT: su - jenkins                     ❌ (requires sharing password)

Scenario 2: Kubernetes Administration
  Deploy new configuration:
  sudo kubectl apply -f manifest.yaml   ✓
  
  NOT: su -                             ❌ (too much privilege)

Scenario 3: Application Startup
  Start WebSphere:
  sudo -u websphere /opt/WebSphere/bin/startServer.sh

PRODUCTION BEST PRACTICE:

✓ ALWAYS use sudo for automated tasks
✓ NEVER share root password (use su)
✓ Configure sudoers for specific commands
✓ Never distribute root account password
✓ Use sudo for Jenkins automation
✓ Use sudo for Ansible playbooks

SECURITY PERSPECTIVE:

Risk of su (Switch User):
  ⚠️  Root password shared across team
  ⚠️  No audit trail of who did what
  ⚠️  Accidental mistakes affect everything
  ⚠️  Can't be revoked per person
  ⚠️  Multiple users logged in as root

Risk Mitigation with sudo:
  ✓ Root password kept secret
  ✓ Full audit trail in /var/log/auth.log
  ✓ Granular permission control
  ✓ Easy revocation per user
  ✓ Specific commands authorized only

SUDOERS CONFIGURATION:

File: /etc/sudoers (edit with: visudo)

Examples:
  jenkins ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
  → jenkins can restart nginx without password
  
  devops ALL=(ALL) ALL
  → devops can run any command with sudo
  
  %docker ALL=(ALL) NOPASSWD: /usr/bin/docker
  → All users in docker group can run docker commands

30-SECOND INTERVIEW ANSWER:
"su switches to another user's shell (requires that user's password), while 
sudo executes a single command as another user (requires your password). sudo 
is better for production because it's auditable, doesn't require password 
sharing, and can be configured with granular permissions. Never share root 
password; use sudo instead."

MEMORY TRICK:
  su = "Switch User" = New shell = That user's password
  sudo = "Super User Do" = Single command = Your password

COMMON MISTAKES:
  ❌ Using su for automated scripts
  ❌ Sharing root password across team
  ❌ Giving unrestricted sudo access
  ❌ Not understanding the security implications

INTERVIEW EXPECTATIONS:
  ✓ Know the difference clearly
  ✓ Understand security implications
  ✓ Know sudoers configuration
  ✓ Explain production best practices

================================================================================

Q2. HOW DO YOU ADD USERS?
─────────────────────────────────────────────────────────────────────────────

COMMAND: useradd, adduser

SYNTAX:
  useradd [OPTIONS] USERNAME
  adduser [OPTIONS] USERNAME (interactive, Debian/Ubuntu)

PARAMETER BREAKDOWN:
  -u UID              → Specify User ID (default: next available)
  -g GID              → Primary group
  -G GROUPS           → Additional groups (comma-separated)
  -d HOME             → Home directory path
  -s SHELL            → Login shell (/bin/bash, /bin/nologin)
  -m                  → Create home directory
  -M                  → Don't create home directory
  -p PASSWORD         → Set password (encrypted)
  -c COMMENT          → User description
  -e EXPIRY           → Account expiration date (YYYY-MM-DD)

EXAMPLES:

1. Create basic user
   useradd jenkins
   
2. Create user with home directory and shell
   useradd -m -s /bin/bash jenkins
   
3. Create user with specific UID and GID
   useradd -u 1001 -g developers -m -s /bin/bash dev_user
   
4. Add user to multiple groups
   useradd -m -s /bin/bash -G docker,sudo,jenkins jenkins
   
5. Create service user (no login shell)
   useradd -r -s /bin/nologin -m elasticsearch
   (flags: -r = system user)
   
6. Set password
   useradd -m -s /bin/bash jenkins
   passwd jenkins                    (set password interactively)
   
   OR use:
   echo "password123" | passwd jenkins --stdin

7. CMG PROJECT EXAMPLE:
   Create Jenkins agent user:
   useradd -m -s /bin/bash -G docker,sudo -c "Jenkins Agent" jenkins
   
   Create Kubernetes service user:
   useradd -r -s /bin/nologin -m -c "Kubernetes" kubernetes
   
   Create application user:
   useradd -u 1005 -m -s /bin/bash -c "WebSphere User" websphere

AFTER CREATING USER:

Set password:
  passwd jenkins

Add to sudoers:
  usermod -aG sudo jenkins
  
  OR edit /etc/sudoers:
  visudo
  jenkins ALL=(ALL) NOPASSWD: ALL

Configure SSH (if needed):
  su - jenkins
  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
  # Add public key to ~/.ssh/authorized_keys

WHEN TO USE:
  ✓ Setting up application users
  ✓ Creating service accounts
  ✓ System administration
  ✓ Access control

VERIFICATION:

Check user created:
  grep jenkins /etc/passwd
  id jenkins
  finger jenkins

COMMON MISTAKES:
  ❌ Not setting password after useradd
  ❌ Not creating home directory
  ❌ Using weak passwords
  ❌ Not adding to necessary groups

INTERVIEW TIPS:
  ✓ Know -m flag creates home directory
  ✓ Know -G for multiple groups
  ✓ Know -s for shell
  ✓ Know -r for system users

PRODUCTION BEST PRACTICES:
  ✓ Always create home directory (-m)
  ✓ Set strong passwords
  ✓ Use -r for service accounts
  ✓ Use /bin/nologin for service users
  ✓ Document user purpose

================================================================================

Q3. HOW DO YOU DELETE USERS?
─────────────────────────────────────────────────────────────────────────────

COMMAND: userdel

SYNTAX:
  userdel [OPTIONS] USERNAME
  
PARAMETER BREAKDOWN:
  -r                  → Remove home directory and mail spool
  -f                  → Force deletion (even if logged in)
  -Z                  → Remove SELinux mapping

EXAMPLES:

1. Delete user (keep home directory)
   userdel jenkins
   
2. Delete user and home directory
   userdel -r jenkins
   
3. Force delete (even if user logged in)
   userdel -f -r jenkins

VERIFICATION:
  grep jenkins /etc/passwd
  (should return nothing)

BEFORE DELETION:

Kill user processes:
  killall -u jenkins
  
Check for running processes:
  ps -u jenkins
  
Backup user data (if needed):
  tar -czf jenkins_backup.tar.gz /home/jenkins/

INTERVIEW TIPS:
  ✓ Always use -r to remove home directory
  ✓ Kill processes before deletion
  ✓ Backup important data first

COMMON MISTAKES:
  ❌ Not using -r (orphans home directory)
  ❌ Not killing user processes first

================================================================================

Q4. HOW DO YOU SWITCH USERS?
─────────────────────────────────────────────────────────────────────────────

COMMAND: su, sudo -i, sudo -u

SYNTAX:
  su [USERNAME]
  su -                        (with login shell)
  sudo -i                     (interactive root)
  sudo -u USERNAME bash       (run as specific user)

EXAMPLES:

1. Switch to root
   su -
   (password: root's password)
   
2. Switch to jenkins user
   su - jenkins
   (password: jenkins's password)
   
3. Become root via sudo (if authorized)
   sudo -i
   (password: your password)
   
4. Run command as jenkins
   sudo -u jenkins whoami
   
5. CMG PROJECT EXAMPLE:
   Deploy as jenkins user:
   sudo -u jenkins /opt/jenkins/deploy.sh

DIFFERENCE: su vs sudo -i
  su -          → Need root password
  sudo -i       → Need your password (if sudoers configured)

================================================================================

Q5. WHAT IS ROOT ACCOUNT?
─────────────────────────────────────────────────────────────────────────────

DEFINITION: Special system user with UID 0, unrestricted permissions

ROOT CHARACTERISTICS:
  UID 0               → User ID zero (reserved for root)
  GID 0               → Group ID zero
  Home: /root         → Root's home directory
  Shell: /bin/bash    → Root's login shell
  Permissions: ALL    → Can do anything on the system

ROOT LOCATION:
  /etc/passwd:  root:x:0:0:root:/root:/bin/bash
  /etc/shadow:  root password hash stored here

ROOT CAPABILITIES:
  ✓ Read/write any file
  ✓ Kill any process
  ✓ Change user/group permissions
  ✓ Load kernel modules
  ✓ Configure network
  ✓ Mount filesystems
  ✓ Install software
  ✓ Access hardware directly

DANGERS OF ROOT:
  ⚠️  One mistake destroys system
  ⚠️  No restrictions on damage
  ⚠️  Malware runs with full privileges
  ⚠️  Hard to audit actions
  ⚠️  Sharing password is security risk

PRODUCTION BEST PRACTICES:

DO:
  ✓ Disable direct root login
  ✓ Use sudo for admin tasks
  ✓ Restrict root access
  ✓ Use strong root password
  ✓ Change root password on system access
  ✓ Monitor root activities

DON'T:
  ❌ Use root for regular tasks
  ❌ Share root password
  ❌ Run applications as root
  ❌ Allow remote SSH as root
  ❌ Use root for development

DISABLE ROOT LOGIN:

Lock root account:
  passwd -l root

Disable SSH root login:
  Edit /etc/ssh/sshd_config:
    PermitRootLogin no
    
  Then restart SSH:
    systemctl restart sshd

Allow sudo without password (for root-like access):
  visudo
  jenkins ALL=(ALL) NOPASSWD: ALL

CMG PROJECT: Kubernetes Security
  Containers should NEVER run as root
  Use specific user (e.g., 1000:1000)
  Security policy: disallow privileged containers

================================================================================

Q6. HOW DO YOU MANAGE USER PERMISSIONS?
─────────────────────────────────────────────────────────────────────────────

METHODS:

1. FILE PERMISSIONS (chmod, chown)
   chmod 755 /opt/app
   chown app:app /opt/app
   
2. GROUP MEMBERSHIP (usermod -G)
   usermod -aG docker jenkins
   usermod -aG sudo devops
   
3. SUDO CONFIGURATION (sudoers file)
   visudo
   jenkins ALL=(ALL) NOPASSWD: /usr/bin/systemctl
   
4. ACLs (Advanced)
   setfacl -m u:jenkins:rwx /opt/app
   
5. SELinux (Security Enhanced Linux)
   semanage user -a -R "sysadm_r" localuser_u

SUDOERS CONFIGURATION:

File: /etc/sudoers (ALWAYS edit with visudo)

Syntax:
  USER HOST=(RUNAS) COMMANDS

Examples:
  jenkins ALL=(ALL) ALL
  → jenkins can run any command
  
  jenkins ALL=(ALL) NOPASSWD: /usr/bin/systemctl
  → jenkins can control systemctl without password
  
  %docker ALL=(ALL) NOPASSWD: /usr/bin/docker
  → All users in docker group can run docker without password
  
  jenkins ALL=(ALL) NOPASSWD: /opt/jenkins/deploy.sh
  → jenkins can run specific script only

GROUP MEMBERSHIP:

Add user to group:
  usermod -aG groupname username
  
Groups for common roles:
  sudo        → Administrative access
  docker      → Docker access
  wheel       → Equivalent to sudo on RHEL
  jenkins     → Jenkins specific
  kubernetes  → Kubernetes services

CMG PROJECT SUDOERS:

For Jenkins agent:
  jenkins ALL=(ALL) NOPASSWD: /usr/bin/systemctl
  jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker
  
For DevOps team:
  %devops ALL=(ALL) NOPASSWD: ALL

VERIFY PERMISSIONS:

Check user groups:
  groups jenkins
  
Check sudo access:
  sudo -l
  
Check sudoers:
  sudo cat /etc/sudoers
  visudo -c   (check syntax)

PRODUCTION BEST PRACTICES:
  ✓ Always use visudo (checks syntax)
  ✓ Follow least privilege
  ✓ Document sudoers rules
  ✓ Use groups for team access
  ✓ Use NOPASSWD carefully (only safe commands)
  ✓ Audit sudoers regularly

================================================================================

Q7. HOW DO YOU CHECK LOGGED-IN USERS?
─────────────────────────────────────────────────────────────────────────────

COMMANDS: who, w, finger, last, logname, id

1. who - Currently logged-in users
   who
   who -a        (all information)
   who -H        (with headers)
   
   Output:
   jenkins  pts/0        2026-06-13 12:30 (192.168.1.100)
   devops   tty1         2026-06-13 08:00

2. w - Users and what they're doing
   w
   w -h          (no headers)
   
   Output shows: user, terminal, login time, idle time, CPU usage, command

3. finger - Detailed user information
   finger
   finger jenkins    (specific user)

4. last - Login history
   last
   last jenkins      (jenkins login history)
   last -f /var/log/wtmp   (specific file)

5. logname - Current user name
   logname
   
6. id - User ID and group information
   id
   id jenkins

7. ps aux - All running processes
   ps aux | grep jenkins
   ps -u jenkins     (processes by user)

CMG PROJECT EXAMPLE:

Monitor Jenkins agent activity:
  w | grep jenkins
  ps -u jenkins | wc -l

Check DevOps team access:
  w | grep devops
  last | grep devops

WHEN TO USE:
  ✓ Troubleshooting system issues
  ✓ Auditing access
  ✓ Checking active sessions
  ✓ Security investigations

INTERVIEW TIPS:
  ✓ Know who, w, and id commands
  ✓ Understand last for audit trail
  ✓ Know ps for process verification

================================================================================

Q8. HOW DO YOU DISPLAY CURRENT USER?
─────────────────────────────────────────────────────────────────────────────

COMMANDS: whoami, logname, id, who am i

1. whoami - Current effective user
   whoami
   Output: jenkins
   
2. logname - Original login user
   logname
   
3. id - Current user ID and groups
   id
   Output: uid=1001(jenkins) gid=1001(jenkins) groups=1001(jenkins),999(docker)
   
4. who am i - Who you are in current session
   who am i
   Output: jenkins  pts/0  2026-06-13 12:30

DIFFERENCE:

  whoami   → Effective user (current)
  logname  → Original login user
  
Example:
  Logged in as jenkins, switched to root via sudo -i
  whoami    → root
  logname   → jenkins

EXAMPLES:

1. Check current user before running command
   [jenkins@prod ~]$ whoami
   jenkins

2. Verify sudo access changed user
   [jenkins@prod ~]$ sudo -i
   [root@prod ~]# whoami
   root

3. In scripts
   if [ "$(whoami)" != "root" ]; then
     echo "This script must be run as root"
     exit 1
   fi

CMG PROJECT: Jenkins Agent Health Check
  #!/bin/bash
  if [ "$(whoami)" != "jenkins" ]; then
    echo "ERROR: Must run as jenkins user"
    exit 1
  fi
  
  Current user: $(whoami)
  User groups: $(id)

================================================================================

QUICK REVISION - USER MANAGEMENT
================================================================================

KEY DIFFERENCES:
  su          → Switch to another user's shell (that user's password)
  sudo        → Execute command as another user (your password)
  useradd     → Create user
  userdel     → Delete user
  usermod     → Modify user properties
  
IMPORTANT FILES:
  /etc/passwd         User account information
  /etc/shadow         User password hashes (root only)
  /etc/group          Group information
  /etc/gshadow        Group password hashes
  /etc/sudoers        Sudo configuration

TOP COMMANDS:
  useradd -m -s /bin/bash -G groups USERNAME
  userdel -r USERNAME
  passwd USERNAME
  usermod -aG GROUP USERNAME
  visudo              (edit sudoers safely)
  sudo -l             (check sudo permissions)

INTERVIEW EXPECTATIONS:
  ✓ Deep understanding of su vs sudo
  ✓ Security-first thinking
  ✓ Knowledge of sudoers configuration
  ✓ User/group management experience
  ✓ Least privilege principle

WHAT NOT TO SAY:
  ❌ "I share root password with the team"
  ❌ "su and sudo are the same"
  ❌ "I give everyone full sudo access"
  ❌ "I don't configure sudoers"

PRODUCTION BEST PRACTICES:
  ✓ Never share root password
  ✓ Use sudo for everything
  ✓ Configure sudoers granularly
  ✓ Create home directories for users
  ✓ Use -r for system users
  ✓ Set appropriate shells (/bin/nologin for services)
  ✓ Add users to necessary groups only
  ✓ Audit user/group changes

================================================================================

