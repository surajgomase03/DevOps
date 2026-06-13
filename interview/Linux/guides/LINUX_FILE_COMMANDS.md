================================================================================
   LINUX COMPREHENSIVE INTERVIEW PREPARATION GUIDE v1.0
================================================================================
Senior Linux Administrator | DevOps Architect | SRE | Production Support Lead
20+ Years Real-World Production Experience
UK Government Project (CMG) - Real-World Examples Included
================================================================================

SECTION 1: LINUX FILE & DIRECTORY COMMANDS
================================================================================

Q1. HOW DO YOU CHANGE FILE PERMISSIONS?
─────────────────────────────────────────────────────────────────────────────

COMMAND: chmod

PURPOSE: Modify file and directory permissions for owner, group, and others

SYNTAX:
  chmod [options] MODE FILE
  
PARAMETER BREAKDOWN:
  MODE              → Permission in octal (755) or symbolic (u+x, g-w, o-rwx)
  FILE              → Target file or directory
  -R                → Recursive (apply to directory and contents)
  -c                → Show only changed files
  -v                → Verbose output

OCTAL PERMISSIONS EXPLAINED:
  4 = Read (r)
  2 = Write (w)
  1 = Execute (x)
  
COMMON PERMISSIONS:
  400  → Owner can read only (rw-------)
  600  → Owner can read/write (rw-------)
  644  → Owner RW, Group R, Others R (rw-r--r--)
  755  → Owner RWX, Group RX, Others RX (rwxr-xr-x)
  777  → Everyone can do everything (rwxrwxrwx) ❌ SECURITY RISK

SYMBOLIC NOTATION:
  u = User (owner)
  g = Group
  o = Others
  a = All
  
  + = Add permission
  - = Remove permission
  = = Set exactly
  
  Examples:
    u+x    → Add execute for owner
    g-w    → Remove write for group
    o-rwx  → Remove all for others
    a+r    → Add read for all

REAL EXAMPLES:

1. Make shell script executable
   chmod 755 deploy.sh
   chmod u+x deploy.sh

2. Restrict file to owner only (AWS credentials, SSH keys)
   chmod 600 ~/.ssh/id_rsa
   chmod 600 credentials.txt

3. Remove write permission from group and others
   chmod 644 application.conf

4. Recursive permission change for directory
   chmod -R 755 /var/www/html

5. CMG PROJECT EXAMPLE:
   Jenkins agent requires specific permissions for script execution:
   chmod 755 /jenkins/scripts/deploy.sh
   chmod -R 755 /opt/jenkins-agent/
   
   Restrict sensitive config:
   chmod 600 /opt/jenkins-agent/config.properties

WHEN TO USE:
  ✓ Making scripts executable
  ✓ Securing sensitive files
  ✓ Setting application permissions
  ✓ Managing web server permissions

INTERVIEW TIPS:
  ✓ Mention the least privilege principle
  ✓ Explain why 777 is dangerous
  ✓ Know difference between octal and symbolic
  ✓ Explain what permissions mean (r=4, w=2, x=1)

COMMON MISTAKES:
  ❌ Using chmod 777 (everyone can do everything)
  ❌ Forgetting -R for recursive changes
  ❌ Not understanding difference between read/execute on directories
  ❌ Using wrong mode for sensitive files

ALTERNATIVE COMMANDS:
  setfacl          → Advanced Access Control Lists
  umask            → Default permission mask for new files
  sudo chmod       → If you need elevated privileges

30-SECOND INTERVIEW ANSWER:
"chmod changes file permissions using either octal notation (755, 644) or 
symbolic notation (u+x, g-w). Octal format: first digit owner, second group, 
third others. Values: 4=read, 2=write, 1=execute. For example, chmod 755 
script.sh makes owner read/write/execute, group and others read/execute. 
Always follow least privilege - don't use 777. Use -R flag for recursive 
changes on directories."

MEMORY TRICK:
  "755 = Lucky Number" - Most common permission (rwxr-xr-x)
  "644 = Configuration" - Read/write for owner, read for others
  "600 = Secret" - Only owner can access (for SSH keys, credentials)

SECURITY CONSIDERATIONS:
  ⚠️  SSH Private Keys: Always 600 (chmod 600 ~/.ssh/id_rsa)
  ⚠️  SSH Public Keys: Always 644 (chmod 644 ~/.ssh/id_rsa.pub)
  ⚠️  Application Files: Usually 644 or 755
  ⚠️  Sensitive Config: 600 for files, 700 for directories
  ⚠️  Web Server Files: 755 for directories, 644 for files

REAL-TIME PRODUCTION USAGE:
  
  Scenario 1: Jenkins Agent Setup
    chmod 755 /opt/jenkins-agent/
    chmod 644 /opt/jenkins-agent/config.xml
    chmod 755 /opt/jenkins-agent/workspace/
    
  Scenario 2: Kubernetes Config
    chmod 600 ~/.kube/config
    kubectl requires strict permissions on kubeconfig
    
  Scenario 3: Ansible Automation
    chmod 600 ~/.ssh/id_rsa
    chmod 644 ~/.ssh/authorized_keys

================================================================================

Q2. HOW DO YOU CHANGE FILE OWNERSHIP?
─────────────────────────────────────────────────────────────────────────────

COMMAND: chown, chgrp

PURPOSE: Change file/directory owner and group ownership

SYNTAX:
  chown [OPTIONS] OWNER[:GROUP] FILE
  chgrp [OPTIONS] GROUP FILE
  
PARAMETER BREAKDOWN:
  OWNER             → New owner username
  GROUP             → New group name (optional after :)
  FILE              → Target file/directory
  -R                → Recursive
  -c                → Show only changed files
  -v                → Verbose output
  -L                → Follow symbolic links

EXAMPLES:

1. Change owner only
   chown jenkins deploy.sh
   (Ownership → jenkins user)

2. Change both owner and group
   chown jenkins:jenkins deploy.sh
   (Owner: jenkins, Group: jenkins)

3. Change group only
   chown :docker application.conf
   chgrp docker application.conf

4. Recursive ownership change
   chown -R jenkins:jenkins /opt/jenkins-agent/

5. CMG PROJECT EXAMPLE:
   After WebSphere installation:
   chown -R websphere:websphere /opt/WebSphere
   
   After Kubernetes setup:
   chown root:root /etc/kubernetes/
   chown -R kubernetes:kubernetes /var/lib/kubelet/

WHEN TO USE:
  ✓ Installing applications
  ✓ Setting up service users
  ✓ Fixing file ownership issues
  ✓ Application deployment

INTERVIEW TIPS:
  ✓ Know difference between chown and chgrp
  ✓ Understand ownership vs. permissions
  ✓ Explain why ownership matters

COMMON MISTAKES:
  ❌ Using numeric UID instead of username (usually not required)
  ❌ Forgetting -R for recursive changes
  ❌ Changing ownership without understanding impact

PRODUCTION USAGE:
  Scenario: New application deployment
    chown -R app_user:app_group /opt/application/
    chmod -R 755 /opt/application/
    chmod -R 644 /opt/application/config/
    
================================================================================

Q3. HOW DO YOU FIND FILES?
─────────────────────────────────────────────────────────────────────────────

COMMAND: find

PURPOSE: Search for files/directories with powerful filtering options

SYNTAX:
  find [PATH] [OPTIONS] [EXPRESSION]

PARAMETER BREAKDOWN:
  PATH              → Starting directory (. = current, / = root)
  -name PATTERN     → Find by filename
  -type f/d/l       → Find files(f)/directories(d)/symlinks(l)
  -size +/-SIZE     → Find by size
  -mtime +/-DAYS    → Modified time in days
  -user USERNAME    → Files owned by user
  -perm MODE        → Files with specific permissions
  -exec COMMAND     → Execute command on found files
  -maxdepth LEVEL   → Limit directory depth

COMMON EXAMPLES:

1. Find all .log files
   find / -name "*.log"

2. Find large files (over 100MB)
   find / -size +100M

3. Find files modified in last 7 days
   find / -mtime -7

4. Find files owned by jenkins user
   find / -user jenkins

5. Find files with specific permissions
   find / -perm 777

6. Find and delete (dangerous!)
   find / -name "*.tmp" -exec rm {} \;

7. CMG PROJECT EXAMPLES:
   Find Jenkins logs:
   find /var/log/jenkins -name "*.log" -mtime -7
   
   Find Kubernetes manifests:
   find /opt/kubernetes -name "*.yaml"
   
   Find temporary files:
   find /tmp -type f -mtime +30 -exec rm {} \;

WHEN TO USE:
  ✓ Locating log files
  ✓ Finding large files consuming disk
  ✓ Searching for configuration files
  ✓ Cleanup operations

INTERVIEW TIPS:
  ✓ Know basic find syntax
  ✓ Understand -exec usage
  ✓ Know difference between -name and -iname (case insensitive)

COMMON MISTAKES:
  ❌ Using find / -exec without testing first
  ❌ Not using -maxdepth to limit depth
  ❌ Forgetting quotes in pattern

ALTERNATIVE COMMANDS:
  locate             → Faster but uses database (updatedb)
  grep -r            → Search file contents
  ls -la             → Simple listing

================================================================================

Q4. HOW DO YOU COUNT LINES IN A FILE?
─────────────────────────────────────────────────────────────────────────────

COMMAND: wc

PURPOSE: Count words, lines, and characters in file

SYNTAX:
  wc [OPTIONS] FILE

PARAMETER BREAKDOWN:
  -l                → Count lines only
  -w                → Count words only
  -c                → Count bytes only
  -m                → Count characters
  -L                → Print longest line length

EXAMPLES:

1. Count total lines
   wc -l application.log
   Output: 1500 application.log

2. Count lines in multiple files
   wc -l *.log
   
3. Count lines from pipe
   cat access.log | wc -l
   ps aux | wc -l

4. Find file with most lines
   wc -l * | sort -rn | head -1

5. CMG PROJECT EXAMPLE:
   Count Jenkins log lines:
   wc -l /var/log/jenkins/jenkins.log
   
   Monitor log growth:
   wc -l /var/log/audit/audit.log

WHEN TO USE:
  ✓ Checking log file sizes
  ✓ Monitoring activities
  ✓ Validating data

INTERVIEW TIPS:
  ✓ Know -l flag
  ✓ Understand how to combine with grep

PRODUCTION SCENARIOS:
  Count error messages:
  grep ERROR application.log | wc -l
  
  Count today's log entries:
  grep "$(date +%Y-%m-%d)" system.log | wc -l

================================================================================

Q5. HOW DO YOU VIEW FILE CONTENTS?
─────────────────────────────────────────────────────────────────────────────

COMMAND: cat, less, more, head, tail

PURPOSE: Display file contents

COMMANDS:

1. cat - Display entire file
   cat /etc/passwd
   cat file1.txt file2.txt  (concatenate multiple)

2. less - View large files (paginated)
   less /var/log/syslog
   (Use arrows, Space to scroll, q to quit)

3. more - Older version of less
   more /var/log/syslog

4. head - Show first lines
   head -n 20 /var/log/syslog  (first 20 lines)
   head -5 file.txt            (first 5 lines)

5. tail - Show last lines
   tail -n 20 /var/log/syslog  (last 20 lines)
   tail -f /var/log/syslog     (follow new entries)

INTERVIEW TIPS:
  ✓ Know tail -f for monitoring logs
  ✓ Know head for viewing beginning
  ✓ Less is better than more

PRODUCTION USAGE:
  Monitor application logs in real-time:
  tail -f /var/log/application.log
  
  Check recent errors:
  tail -50 /var/log/syslog | grep ERROR

================================================================================

Q6. HOW DO YOU DISPLAY FIRST 10 LINES?
─────────────────────────────────────────────────────────────────────────────

COMMAND: head

SYNTAX:
  head [OPTIONS] FILE
  head -n 10 FILE
  head -10 FILE

EXAMPLES:

1. First 10 lines (default)
   head /etc/passwd

2. First 20 lines
   head -20 /etc/passwd
   head -n 20 /etc/passwd

3. Display first 10 lines of multiple files
   head *.log

4. From pipe
   cat /var/log/syslog | head -20

CMG PROJECT:
  head -20 /var/log/jenkins/jenkins.log
  head -10 /etc/kubernetes/manifests/kube-apiserver.yaml

================================================================================

QUICK REVISION NOTES - FILE & DIRECTORY COMMANDS
================================================================================

TOP COMMANDS:
  chmod              Change permissions
  chown              Change ownership
  find               Search files/directories
  wc -l              Count lines
  cat/less/more      View files
  head/tail          Display portions

TOP PATTERNS:
  chmod 755          Executable files/directories
  chmod 644          Regular files
  chmod 600          Sensitive files (SSH keys, credentials)
  chmod 700          Secure directories

TOP FIND PATTERNS:
  find / -name "*.log"        All log files
  find / -mtime -7            Files modified last 7 days
  find / -size +100M          Large files
  find / -type d -name "app"  Directories named app

WHAT INTERVIEWER EXPECTS:
  ✓ Understanding of permissions (r, w, x)
  ✓ Ability to search files efficiently
  ✓ Security consciousness (not using 777)
  ✓ Production troubleshooting approach
  ✓ Scripting capability with find/grep

WHAT NOT TO SAY:
  ❌ "I always use chmod 777"
  ❌ "find is slow" (no optimization shown)
  ❌ "I don't remember the permission values"

================================================================================

PRODUCTION BEST PRACTICES:
================================================================================

1. PERMISSION MANAGEMENT
   ✓ Always use least privilege principle
   ✓ Never use 777 or 666
   ✓ SSH keys always 600, directory always 700
   ✓ Application files 644, directories 755
   ✓ Web server files 755 for directories, 644 for files

2. FILE SEARCHING
   ✓ Use find with -maxdepth to limit scope
   ✓ Always test -exec before running on production
   ✓ Use locate if available (faster for repeated searches)
   ✓ Combine find with grep for filtering

3. MONITORING
   ✓ Use tail -f for real-time log monitoring
   ✓ Use wc -l to track log growth
   ✓ Set up log rotation to prevent disk issues
   ✓ Monitor file permissions changes

================================================================================

