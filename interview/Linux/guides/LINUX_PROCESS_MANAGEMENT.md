================================================================================
SECTION 3: LINUX - PROCESS MANAGEMENT
================================================================================

Q1. HOW DO YOU VIEW RUNNING PROCESSES?
─────────────────────────────────────────────────────────────────────────────

COMMANDS: ps, top, htop, pgrep, pidof

1. ps - Static process listing
   ps aux               → All processes, full format
   ps -u jenkins        → Processes by user
   ps -p PID            → Specific process
   ps aux | grep jenkins
   ps -eo pid,user,cmd  → Custom columns
   
   Output columns:
   USER    → Who runs process
   PID     → Process ID
   %CPU    → CPU usage percentage
   %MEM    → Memory usage percentage
   VSZ     → Virtual memory size (KB)
   RSS     → Resident set size (actual memory)
   STAT    → Process state
   START   → Start time
   TIME    → CPU time used
   COMMAND → Command name
   
2. top - Real-time process monitoring
   top                  → Interactive process viewer
   top -u jenkins       → Jenkins processes only
   top -p PID           → Specific process
   top -b -n 1          → Batch mode (one iteration)
   
   Key bindings in top:
   q     → Quit
   Space → Refresh
   1     → Show all CPUs
   k     → Kill process
   u     → Filter by user
   
3. htop - Enhanced top (usually not installed by default)
   htop
   htop -u jenkins
   htop -p PID

4. pgrep - Search process by name
   pgrep jenkins        → PID of jenkins process
   pgrep -l jenkins     → Process name and PID
   pgrep -u jenkins     → All processes by user
   pgrep -f pattern     → Full command pattern

5. pidof - Get PID of program
   pidof java
   pidof jenkins

PROCESS STATES:

R = Running
S = Sleeping (interruptible)
D = Disk sleep (uninterruptible)
Z = Zombie
T = Stopped
W = Paging

EXAMPLES:

1. Find Jenkins process
   ps aux | grep jenkins
   pgrep -l jenkins
   
2. Check Jenkins memory usage
   ps -u jenkins -o pid,vsz,rss,comm
   
3. Monitor CPU usage in real-time
   top -u jenkins
   
4. Find all Java processes
   pgrep -l java
   ps aux | grep java
   
5. CMG PROJECT: Monitor Kubernetes
   ps aux | grep kubelet
   top -p $(pgrep kubelet)
   
   Monitor Jenkins agent
   top -u jenkins
   
   Monitor WebSphere
   ps aux | grep WebSphere

INTERVIEW TIPS:
  ✓ Know ps aux syntax
  ✓ Understand process states
  ✓ Know top for real-time monitoring
  ✓ Know pgrep for quick searches

COMMON MISTAKES:
  ❌ Using ps without proper flags
  ❌ Not knowing top shortcuts
  ❌ Confusion between VSZ and RSS

================================================================================

Q2. HOW DO YOU KILL A PROCESS?
─────────────────────────────────────────────────────────────────────────────

COMMAND: kill

PURPOSE: Send signal to process (default SIGTERM = graceful termination)

SYNTAX:
  kill [SIGNAL] PID
  kill -l                    (list all signals)
  
COMMON SIGNALS:

SIGTERM (15) → Graceful termination (catchable)
SIGKILL (9)  → Force kill (not catchable)
SIGSTOP (19) → Pause process
SIGCONT (18) → Resume process
SIGHUP (1)   → Reload configuration
SIGUSR1 (10) → User-defined
SIGUSR2 (12) → User-defined
SIGINT (2)   → Interrupt (Ctrl+C)

EXAMPLES:

1. Graceful kill (SIGTERM - default)
   kill PID
   kill -15 PID
   kill -TERM PID
   
2. Force kill (SIGKILL - last resort)
   kill -9 PID
   kill -KILL PID
   
3. Kill by process name
   killall jenkins
   killall -9 jenkins
   
4. Kill all processes by user
   killall -u jenkins
   
5. Find and kill
   kill $(pgrep jenkins)
   kill $(pgrep -f "java.*jenkins")
   
6. CMG PROJECT: Kill hung application
   Graceful: kill $(pgrep -f WebSphere)
   Force:    kill -9 $(pgrep -f WebSphere)

STOP AND RESUME:

Pause process (SIGSTOP):
  kill -STOP PID
  
Resume process (SIGCONT):
  kill -CONT PID

INTERVIEW TIPS:
  ✓ Know kill -9 is last resort
  ✓ Understand signal importance
  ✓ Know SIGTERM vs SIGKILL
  ✓ Explain graceful shutdown

COMMON MISTAKES:
  ❌ Using kill -9 first (should try SIGTERM first)
  ❌ Killing wrong process
  ❌ Not checking PID before killing

PROCESS KILL SEQUENCE (PRODUCTION):

1. First attempt: Graceful shutdown
   kill -15 PID
   sleep 5
   
2. Check if still running
   ps -p PID
   
3. If still running: Force kill
   kill -9 PID

SHELL SCRIPT PATTERN:

#!/bin/bash
PID=$(pgrep -f application)
if [ -z "$PID" ]; then
  echo "Process not running"
  exit 0
fi

echo "Gracefully stopping $PID..."
kill -15 $PID
sleep 10

if kill -0 $PID 2>/dev/null; then
  echo "Process still running, force killing..."
  kill -9 $PID
  sleep 2
fi

ps -p $PID >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "ERROR: Could not kill process"
  exit 1
fi
echo "Process stopped successfully"

================================================================================

Q3. HOW DO YOU FORCE KILL A PROCESS?
─────────────────────────────────────────────────────────────────────────────

COMMAND: kill -9, killall -9, pkill -9

WHEN TO USE (Last Resort):
  ✓ Process not responding to SIGTERM
  ✓ Process stuck in uninterruptible sleep
  ✓ Emergency shutdown required
  ✓ Resource exhaustion situation

EXAMPLES:

1. Force kill by PID
   kill -9 PID
   
2. Force kill by process name
   killall -9 jenkins
   
3. Force kill by pattern
   pkill -9 -f pattern
   
4. Force kill all processes by user
   killall -9 -u jenkins

PRODUCTION SCENARIO:

Jenkins hung:
  ps aux | grep java
  kill -9 12345

Kubernetes pod stuck:
  ps aux | grep kubelet
  kill -9 4567

DATABASE STUCK:
  ps aux | grep postgres
  kill -9 5678

SIDE EFFECTS OF KILL -9:

⚠️  No graceful shutdown
⚠️  Buffered data may be lost
⚠️  Temporary files not cleaned
⚠️  Database connections not properly closed
⚠️  Child processes may orphan
⚠️  Resources not released

BEST PRACTICE:

Always try graceful first:
  kill -15 PID            → Graceful (10 seconds)
  sleep 10
  ps -p PID >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    kill -9 PID            → Force if needed
  fi

================================================================================

Q4. HOW DO YOU FIND PID?
─────────────────────────────────────────────────────────────────────────────

COMMANDS: pidof, pgrep, ps

1. pidof - Get PID of program
   pidof java
   pidof jenkins
   pidof postgres
   
2. pgrep - Search process by name/pattern
   pgrep jenkins
   pgrep -l jenkins        (with name)
   pgrep -f pattern        (full command match)
   pgrep -u user           (by user)
   
3. ps with grep
   ps aux | grep java
   ps -u jenkins
   
4. In scripts
   PID=$(pgrep -f application)
   PID=$(pidof java)
   PID=$(ps aux | grep [j]ava | awk '{print $2}')

EXAMPLES:

1. Find Jenkins PID
   pgrep -f jenkins
   pidof java
   
2. Find all Java processes
   pgrep -l java
   ps aux | grep java
   
3. Find process by user
   pgrep -u jenkins -l
   ps -u jenkins
   
4. CMG PROJECT
   Find Kubernetes PID:
   pgrep -f kubelet
   
   Find Docker PID:
   pgrep -f dockerd

USING PID IN SCRIPTS:

#!/bin/bash
PID=$(pgrep -f myapp)

if [ -z "$PID" ]; then
  echo "Application not running"
else
  echo "Application running with PID: $PID"
  kill -TERM $PID
fi

================================================================================

Q5. WHAT IS top?
─────────────────────────────────────────────────────────────────────────────

PURPOSE: Real-time system performance monitoring and process management

FEATURES:
  • Interactive process viewer
  • Real-time CPU and memory usage
  • Process sorting capabilities
  • Signal sending (kill processes)
  • User filtering

SYNTAX:
  top [OPTIONS]
  -u USER      → Show processes for user
  -p PID       → Monitor specific process
  -b           → Batch mode (for scripts/piping)
  -n COUNT     → Number of iterations
  -d DELAY     → Refresh interval (seconds)
  -H           → Show threads

INTERACTIVE COMMANDS:

q             → Quit
Space         → Refresh
h             → Help
1             → Toggle CPU display (all vs summary)
k             → Kill process (prompts for PID and signal)
u             → Filter by username
o             → Change sort column
P             → Sort by CPU usage
M             → Sort by memory usage
T             → Sort by CPU time
N             → Sort by PID
f             → Show/hide columns
</>           → Move sort column left/right

OUTPUT INTERPRETATION:

Header info:
  top - 12:30:45 up 45 days, 2:15,  2 users,  load average: 0.52, 0.48, 0.45
  │
  Task summary:
  Tasks: 120 total, 1 running, 119 sleeping, 0 stopped, 0 zombie
  │
  CPU usage:
  Cpu(s):  5.2%us,  2.1%sy,  0.0%ni, 92.1%id,  0.3%wa,  0.0%hi,  0.3%si,  0.0%st
  │
  Memory:
  Mem:   7897124k total,  5482356k used,  2414768k free
  Swap:  2097148k total,        0k used,  2097148k free

EXAMPLES:

1. Monitor all processes
   top
   
2. Monitor specific user
   top -u jenkins
   
3. Monitor specific process
   top -p 12345
   
4. Batch mode (for scripts)
   top -b -n 1 > top_output.txt
   
5. Monitor with 2-second refresh
   top -d 2
   
6. CMG PROJECT
   Monitor Jenkins agent:
   top -u jenkins
   
   Monitor Kubernetes node:
   top
   (then type 'u' and enter 'kubernetes')
   
   Monitor WebSphere performance:
   top -p $(pgrep -f WebSphere)

INTERVIEW TIPS:
  ✓ Know major display areas
  ✓ Understand load average
  ✓ Know sort options
  ✓ Know how to kill from top

================================================================================

Q6. WHAT IS ps?
─────────────────────────────────────────────────────────────────────────────

PURPOSE: Static process snapshot (one-time view, not real-time)

SYNTAX:
  ps [OPTIONS]
  
COMMON OPTIONS:

a              → All processes with terminal
u              → User format (with user info)
x              → All processes (including without terminal)
e              → Select all processes
f              → Full-format listing
o FORMAT       → Custom output format
-u USER        → Specific user
-p PID         → Specific process
-C COMMAND     → Specific command
--sort FIELD   → Sort by field

EXAMPLES:

1. All processes with details
   ps aux
   
2. Specific user processes
   ps -u jenkins
   ps -u root
   
3. Specific process
   ps -p 1234
   
4. Full command listing
   ps auxf
   
5. Custom columns
   ps -eo pid,user,cpu,mem,comm
   ps -eo pid,user,vsz,rss,start,cmd
   
6. Find process
   ps aux | grep java
   ps -C java
   
7. Tree format (show parent-child)
   ps auxf
   
8. CMG PROJECT
   Jenkins processes:
   ps -u jenkins
   
   Java processes:
   ps aux | grep java
   
   Kubernetes:
   ps -u kubernetes

SORT OPTIONS:

ps aux --sort=-%mem        (by memory, descending)
ps aux --sort=-%cpu        (by CPU, descending)
ps aux --sort=+vsize       (by virtual memory, ascending)
ps aux --sort=+rss         (by resident memory, ascending)

CUSTOM OUTPUT:

ps -eo user,pid,cpu,mem,vsz,rss,comm | head -20
ps -eo user,pid,%cpu,%mem,cmd --sort=-%mem | head -10

INTERVIEW TIPS:
  ✓ Know ps aux (most common)
  ✓ Know how to filter by user/process
  ✓ Know custom output format
  ✓ Know difference between ps and top

WHEN TO USE:

ps     → Quick process snapshot, scripting
top    → Real-time monitoring, interactive use
htop   → Enhanced interactive monitoring

================================================================================

Q7. WHAT IS pgrep?
─────────────────────────────────────────────────────────────────────────────

PURPOSE: Quickly find process ID by name/pattern

SYNTAX:
  pgrep [OPTIONS] PATTERN
  
OPTIONS:

-l              → Show process name with PID
-u USER         → Search for user
-U USER         → Exclude user
-f              → Match full command line
-i              → Case insensitive
-x              → Exact match only
-n              → Newest process
-o              → Oldest process
-c              → Count matching processes

EXAMPLES:

1. Find PID
   pgrep java
   Output: 1234
   
2. Find PID with name
   pgrep -l java
   Output: 1234 java
   
3. Find by user
   pgrep -l -u jenkins
   Output: 
   5678 java
   5679 python
   
4. Full command match
   pgrep -f "java.*jenkins"
   
5. Count processes
   pgrep -c java
   
6. Case insensitive
   pgrep -i JAVA
   
7. Most recent
   pgrep -n java
   
8. Oldest
   pgrep -o java

REAL-TIME USAGE:

Monitor if application is running:
  if pgrep -x "myapp" > /dev/null; then
    echo "Running"
  else
    echo "Not running"
  fi

Kill all matching processes:
  pkill java
  pkill -f "java.*pattern"

CMG PROJECT:

Jenkins health check:
  pgrep -f "jenkins" >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "Jenkins running"
  else
    echo "Jenkins DOWN"
  fi

Count Java processes:
  pgrep -c java

================================================================================

QUICK REVISION - PROCESS MANAGEMENT
================================================================================

KEY COMMANDS:

ps aux              View all processes
top                 Real-time monitoring
pgrep NAME          Find PID by name
pidof PROGRAM       Get program PID
kill -15 PID        Graceful kill
kill -9 PID         Force kill
killall NAME        Kill by name
pkill PATTERN       Kill by pattern

PROCESS STATES:

R  Running
S  Sleeping (interruptible)
D  Disk sleep (uninterruptible)
Z  Zombie
T  Stopped

SIGNALS:

SIGTERM (15)  Graceful termination
SIGKILL (9)   Force kill
SIGSTOP (19)  Pause
SIGCONT (18)  Resume
SIGHUP (1)    Reload config

PRODUCTION BEST PRACTICES:

✓ Always try SIGTERM (-15) first
✓ Wait 10 seconds before SIGKILL (-9)
✓ Use pgrep for quick searches
✓ Use top for performance monitoring
✓ Monitor high CPU/memory processes
✓ Document zombie process causes
✓ Implement process monitoring/alerting

INTERVIEW EXPECTATIONS:

✓ Know ps and top differences
✓ Understand kill signals
✓ Know process filtering
✓ Explain graceful shutdown
✓ Troubleshoot hung processes

================================================================================

