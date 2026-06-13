# ⚙️ Linux Process Management

> **Master process monitoring, management, and troubleshooting for production systems**

---

## 📚 Table of Contents

- [Q1: View Running Processes](#q1-view-running-processes)
- [Q2: Kill a Process](#q2-kill-a-process)
- [Q3: Force Kill a Process](#q3-force-kill-a-process)
- [Q4: Find Process ID](#q4-find-process-id)
- [Quick Reference](#-quick-reference)

---

## Q1: View Running Processes

### 🎯 Commands

```bash
ps aux              # All processes, detailed
top                 # Real-time monitoring
htop                # Enhanced interactive
pgrep NAME          # Find by name
```

### 📊 Process State Codes

| State | Meaning | Description |
|-------|---------|-------------|
| **R** | Running | Currently executing |
| **S** | Sleeping | Waiting for event (interruptible) |
| **D** | Disk Sleep | Uninterruptible, waiting for I/O |
| **Z** | Zombie | Process exited, parent didn't clean |
| **T** | Stopped | Suspended |
| **W** | Paging | Swapped out |

### 💡 Real-Time Examples

#### View all processes with details:
```bash
$ ps aux
USER    PID  %CPU %MEM    VSZ   RSS STAT START   TIME COMMAND
root      1   0.0  0.1  24588  2784 S    10:30   0:01 /sbin/init
jenkins 4532   2.5  5.2 1024580 84956 S   10:35   0:45 /usr/bin/java -jar jenkins.war
```

#### Monitor in real-time:
```bash
top
# Press: '1' for all CPUs, 'k' to kill, 'u' to filter user
```

#### Find specific process:
```bash
$ ps aux | grep java
jenkins 4532  2.5  5.2 1024580 84956 S 10:35 0:45 /usr/bin/java -jar jenkins.war
```

#### Quick PID lookup:
```bash
$ pgrep jenkins
4532

$ pgrep -l java
4532 java
4533 java
```

### 🏭 Production Examples (CMG)

#### Monitor Jenkins performance:
```bash
top -u jenkins
# Watch CPU and memory usage
```

#### Check all Kubernetes processes:
```bash
ps aux | grep -E "kubelet|docker"
```

#### Find Docker container processes:
```bash
pgrep -f "docker.*container"
```

### 👨‍💼 Interview Tips

- ✓ Know `ps aux` most common
- ✓ Know what each column means
- ✓ Know `top` for real-time
- ✓ Know process states
- ✓ Know `pgrep` for quick searches

### ⏱️ 30-Second Answer

> *"Use `ps aux` to view all processes with details including user, PID, CPU/memory usage, and command. The output shows: user who owns it, process ID, memory/CPU percentage, virtual and resident memory sizes, process state (R/S/D/Z), start time, and the command. `top` shows real-time updates; `pgrep` quickly finds by name. Different states indicate: R=running, S=sleeping, D=disk wait, Z=zombie."*

---

## Q2: Kill a Process

### 🎯 Command
```bash
kill [SIGNAL] PID
```

### 📊 Common Signals

| Signal | Number | Meaning | Catchable |
|--------|--------|---------|-----------|
| **SIGTERM** | 15 | Graceful termination | ✅ Yes |
| **SIGKILL** | 9 | Force kill | ❌ No |
| **SIGSTOP** | 19 | Pause process | ❌ No |
| **SIGCONT** | 18 | Resume process | ✅ Yes |
| **SIGHUP** | 1 | Reload config | ✅ Yes |
| **SIGINT** | 2 | Interrupt (Ctrl+C) | ✅ Yes |

### 💡 Real-Time Examples

#### Graceful termination (PREFERRED):
```bash
kill -15 4532
# Process has 90 seconds to shut down gracefully
# Application can close connections, save state
```

#### Immediate termination (LAST RESORT):
```bash
kill -9 4532
# Process terminated immediately
# No cleanup possible
```

#### Kill by name:
```bash
killall jenkins
pkill -f "java.*jenkins"
```

#### Kill pause/resume:
```bash
kill -STOP 4532      # Pause the process
# (Process still in memory, suspended)

kill -CONT 4532      # Resume
```

### 🔴 Kill Process Flow

```
1. Send SIGTERM (-15)
   │
   ├─ Process handles gracefully
   ├─ Closes connections
   ├─ Saves state
   └─ Exits cleanly

2. Wait 10 seconds
   │
   ├─ Check if still running
   └─ If exited → Done!

3. If still running → Send SIGKILL (-9)
   │
   ├─ Process terminated immediately
   ├─ No cleanup
   └─ Reclaim resources
```

### 🏭 Production Pattern

#### Safe Jenkins shutdown:
```bash
#!/bin/bash
PID=$(pgrep -f jenkins)

if [ -z "$PID" ]; then
  echo "Jenkins not running"
  exit 0
fi

echo "Stopping Jenkins gracefully..."
kill -15 $PID

# Wait for graceful shutdown
for i in {1..10}; do
  sleep 1
  if ! ps -p $PID > /dev/null; then
    echo "Jenkins stopped successfully"
    exit 0
  fi
done

# Still running, force kill
echo "Force killing Jenkins..."
kill -9 $PID
sleep 1

if ps -p $PID > /dev/null; then
  echo "ERROR: Failed to stop Jenkins"
  exit 1
fi

echo "Jenkins forcefully stopped"
```

### ⚠️ Consequences of SIGKILL

```bash
kill -9 process_id

Consequences:
❌ No graceful shutdown
❌ Open connections aborted
❌ Buffered data lost
❌ Database transactions rolled back
❌ Temporary files not cleaned
❌ Child processes may orphan
❌ Resource locks not released
```

### 👨‍💼 Interview Tips

- ✓ Know SIGTERM vs SIGKILL difference
- ✓ Always try SIGTERM first
- ✓ Know 90-second timeout
- ✓ Know consequences of SIGKILL
- ✓ Explain graceful shutdown importance

### ⏱️ 30-Second Answer

> *"Always try graceful kill first with `kill -15 PID`. The process receives SIGTERM and has 90 seconds to shut down gracefully - closing connections, saving state. Only use `kill -9` if the process doesn't respond after waiting. SIGKILL is immediate but causes data loss and doesn't allow cleanup. In production, always prefer graceful shutdown to prevent corruption or inconsistent state."*

---

## Q3: Force Kill a Process

### 🎯 Command
```bash
kill -9 PID          # Immediate termination
killall -9 NAME      # By name
pkill -9 -f PATTERN  # By pattern
```

### 🔴 When to Use (Emergency Only)

```
✅ USE SIGKILL WHEN:
├─ Process not responding to SIGTERM
├─ Stuck in uninterruptible system call
├─ Emergency shutdown required
├─ Resource exhaustion crisis
└─ Security incident response

❌ NEVER USE FOR:
├─ Normal shutdown
├─ Application updates
├─ Routine restarts
├─ Testing
└─ Because you're impatient
```

### 💡 Examples

#### Hung application:
```bash
# Application not responding
kill -9 $(pgrep -f stuck_app)
```

#### Zombie cleanup:
```bash
# Zombie process left by parent
# (Can't actually kill zombie - parent must reap)
ps aux | grep defunct
# Kill parent process
kill -9 PARENT_PID
```

#### Emergency shutdown:
```bash
# Disk full, system unstable
sudo killall -9 java
sudo killall -9 docker
```

### ⚠️ Production Impact

```
DISASTER SCENARIOS:

Database Process Killed with -9:
  ❌ Open transactions rolled back
  ❌ Connection state corrupted
  ❌ Possible data loss
  ❌ Inconsistent state
  ❌ Long recovery on restart

Application with -9:
  ❌ Graceful shutdown skipped
  ❌ Resources not released
  ❌ Lock files not cleaned
  ❌ Temp data left behind
```

### 👨‍💼 Interview Tips

- ✓ Know when NOT to use -9
- ✓ Know consequences
- ✓ Know it's last resort
- ✓ Know difference from SIGTERM
- ✓ Explain thinking process

---

## Q4: Find Process ID

### 🎯 Commands

```bash
pgrep jenkins           # Find PID
pgrep -l jenkins        # With name
pidof java              # Get PID
ps aux | grep java      # Search
```

### 💡 Examples

#### Find Java process:
```bash
$ pgrep java
4532
4533

$ pgrep -l java
4532 java
4533 java
```

#### Find by pattern:
```bash
pgrep -f "java.*jenkins"
# Matches: /usr/bin/java -Dxxx jenkins.war
```

#### Find by user:
```bash
pgrep -u jenkins
# All processes owned by jenkins
```

#### In scripts:
```bash
#!/bin/bash
PID=$(pgrep -f myapp)

if [ -z "$PID" ]; then
  echo "Application not running"
  systemctl start myapp
else
  echo "Running with PID: $PID"
fi
```

### 🏭 Production Health Check

#### Check if Jenkins running:
```bash
#!/bin/bash
if pgrep -x jenkins > /dev/null; then
  echo "✓ Jenkins running"
else
  echo "✗ Jenkins NOT running - restarting"
  sudo systemctl start jenkins
fi
```

---

## ⚡ Quick Reference

### Most Used Commands

```bash
# View processes
ps aux                    # All processes
ps -u jenkins             # By user
top                       # Real-time
top -u jenkins            # Real-time, user
pgrep -l name             # Find by name

# Kill processes
kill -15 PID              # Graceful
kill -9 PID               # Force (last resort)
killall -15 NAME          # By name
pkill -f PATTERN          # By pattern

# Monitor
top                       # Interactive
top -b -n 1               # Batch mode
ps -p PID -o pid,vsz,rss,comm

# Information
ps -eo pid,user,cpu,mem,cmd | head -10
top -p PID                # Monitor one
```

### Process States Quick Guide

```bash
R → Running (actively using CPU)
S → Sleeping (waiting for event)
D → Disk sleep (I/O wait - uninterruptible)
Z → Zombie (process exited, parent not cleaned)
T → Stopped (suspended)
```

---

## 🎓 Interview Expectations

**What Interviewers Look For:**

- ✅ Know ps and top differences
- ✅ Understand kill signals
- ✅ Know when to use each signal
- ✅ Understand graceful shutdown
- ✅ Know emergency procedures
- ✅ Know troubleshooting mindset
- ✅ Know process states

**Red Flag Answers:**

❌ "I just use `kill -9` for everything"
✅ "I try SIGTERM first, wait, then SIGKILL"

❌ "Doesn't matter if process exits gracefully"
✅ "Graceful shutdown prevents data loss"

---

## 📝 Production Best Practices

### ✅ DO

- ✅ Always try SIGTERM (-15) first
- ✅ Wait 10 seconds before SIGKILL
- ✅ Use pgrep for reliable searches
- ✅ Monitor process resource usage
- ✅ Document crash patterns
- ✅ Set auto-restart policies
- ✅ Alert on zombie processes

### ❌ DON'T

- ❌ Use kill -9 immediately
- ❌ Kill critical processes carelessly
- ❌ Kill PID 1 (init) or kernel processes
- ❌ Kill processes you don't understand
- ❌ Ignore zombie processes
- ❌ Force kill database processes
- ❌ Manual kill - use systemd

---

**Last Updated:** January 2024 | **Ready for:** DevOps, System Admin, SRE Interviews
