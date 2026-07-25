# 🔧 Linux Services & Systemd

> **Master systemd service management, unit files, and production service lifecycle**

---

## 📚 Table of Contents

- [Q1: What is Systemd?](#q1-what-is-systemd)
- [Q2: Start Services](#q2-start-services)
- [Q3: Stop Services](#q3-stop-services)
- [Q4: Restart Services](#q4-restart-services)
- [Q5: Check Service Status](#q5-check-service-status)
- [Q6: Enable Services at Boot](#q6-enable-services-at-boot)
- [Q7: Using Journalctl](#q7-using-journalctl)
- [Quick Reference](#-quick-reference)

---

## Q1: What is Systemd?

### 📖 Simple Definition
Modern Linux init system that manages service startup, services, and system processes with parallel execution and dependency management.

### 🔄 Evolution

```
OLD System V Init (Deprecated)
  ├─ Sequential startup (SLOW)
  ├─ Scripts in /etc/init.d/
  ├─ Limited features
  └─ No dependency management

MODERN Systemd (Current Standard)
  ├─ Parallel startup (FAST)
  ├─ Unit files in /etc/systemd/
  ├─ Rich features
  └─ Full dependency management
```

### 🎯 What Systemd Manages

```
✓ Service startup and shutdown
✓ Process dependencies
✓ Parallel execution
✓ System logging (journalctl)
✓ Resource limits
✓ Auto-restart on failure
✓ Socket activation
✓ Timer units
```

### 📁 Unit File Locations

```
/usr/lib/systemd/system/      Distribution-provided (READ ONLY)
/etc/systemd/system/           Custom/user services (EDIT HERE)
/run/systemd/system/           Runtime units
```

### 📋 Example Service Unit File

```ini
[Unit]
Description=Jenkins CI/CD Server
After=network.target
Wants=docker.service

[Service]
Type=simple
User=jenkins
Group=jenkins
WorkingDirectory=/var/lib/jenkins
ExecStart=/usr/bin/java -jar /usr/share/jenkins/jenkins.war
ExecStop=/bin/kill $MAINPID
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 💡 Systemd Advantages

| Feature | System V | Systemd |
|---------|----------|---------|
| **Startup Speed** | Slow (sequential) | Fast (parallel) ✓ |
| **Dependencies** | Limited | Full ✓ |
| **Logging** | Multiple files | Centralized journal ✓ |
| **Restart Policy** | Manual | Automatic ✓ |
| **Ease of Use** | Complex scripts | Simple configs ✓ |

### 🏭 Production Setup Example

#### Simple Jenkins service:
```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins
sudo journalctl -u jenkins -f
```

### 👨‍💼 Interview Tips

- ✓ Know systemd is modern init
- ✓ Know parallel startup benefits
- ✓ Know unit file structure
- ✓ Know /etc/systemd/system/
- ✓ Know advantages over init.d

### ⏱️ 30-Second Answer

> *"systemd is the modern Linux init system that manages services and daemons. It replaces older System V init. Key advantages: parallel startup (faster), dependency management, centralized logging with journalctl, and auto-restart on failure. Services are defined in unit files (in /etc/systemd/system/) with [Unit], [Service], and [Install] sections. Managed with systemctl command."*

---

## Q2: Start Services

### 🎯 Command
```bash
systemctl start SERVICE_NAME
```

### 💡 Examples

#### Start Docker:
```bash
sudo systemctl start docker
```

#### Start Jenkins:
```bash
sudo systemctl start jenkins
```

#### Start multiple services:
```bash
sudo systemctl start docker jenkins kubelet
```

#### Verify service started:
```bash
$ sudo systemctl status docker

● docker.service - Docker Application Container Engine
     Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled)
     Active: active (running) since Thu 2024-01-15 10:30:45 UTC; 5s ago
   Main PID: 4532 (dockerd)
    CGroup: /system.slice/docker.service
            └─4532 /usr/bin/dockerd
```

#### Quick status check:
```bash
systemctl is-active docker
active

# In scripts
if systemctl is-active --quiet docker; then
  echo "Docker is running"
fi
```

### 🏭 Production Pattern

#### Application startup sequence:
```bash
#!/bin/bash
set -e  # Exit on error

echo "Starting infrastructure services..."

# Start in order
systemctl start docker
sleep 2

systemctl start jenkins-agent
sleep 2

systemctl start kubelet
sleep 5

echo "Verifying all services..."
for service in docker jenkins-agent kubelet; do
  if systemctl is-active --quiet $service; then
    echo "✓ $service running"
  else
    echo "✗ $service FAILED"
    exit 1
  fi
done

echo "✓ All services started successfully"
```

### ⚠️ Service Won't Start?

#### Debug process:
```bash
# 1. Check status
systemctl status jenkins

# 2. View recent logs
journalctl -u jenkins -n 20

# 3. Check for errors
systemctl status jenkins

# 4. Verify permissions
ls -la /var/lib/jenkins

# 5. Test manually
sudo -u jenkins /usr/bin/java -jar /usr/share/jenkins/jenkins.war

# 6. Check if port in use
ss -tulpn | grep 8080
```

### 👨‍💼 Interview Tips

- ✓ Know systemctl start syntax
- ✓ Know how to verify started
- ✓ Know how to debug failures
- ✓ Know startup order matters
- ✓ Know journalctl for logs

---

## Q3: Stop Services

### 🎯 Command
```bash
systemctl stop SERVICE_NAME
```

### 💡 Examples

#### Stop Docker:
```bash
sudo systemctl stop docker
```

#### Stop multiple services:
```bash
sudo systemctl stop jenkins docker
```

#### Verify stopped:
```bash
$ systemctl is-active docker
inactive (dead)
```

### 🏭 Production Shutdown Pattern

#### Safe shutdown before maintenance:
```bash
#!/bin/bash

echo "Preparing for maintenance..."

# 1. Drain Kubernetes node (if applicable)
kubectl drain node-name --ignore-daemonsets

# 2. Stop applications gracefully
systemctl stop jenkins-agent
sleep 3

# 3. Stop infrastructure
systemctl stop docker
sleep 3

systemctl stop kubelet
sleep 3

# 4. Verify stopped
for service in kubelet docker jenkins-agent; do
  if systemctl is-active --quiet $service; then
    echo "✗ $service still running!"
  else
    echo "✓ $service stopped"
  fi
done

echo "✓ Ready for maintenance"
```

### 🔄 Graceful Shutdown

```
systemctl stop sends SIGTERM (signal 15)
        │
        ├─ Process has TimeoutStopSec (default 90 sec)
        │
        ├─ Process does cleanup
        ├─ Process closes connections
        └─ Process exits
        
After timeout → SIGKILL (signal 9) sent
        └─ Process terminated immediately
```

---

## Q4: Restart Services

### 🎯 Commands

```bash
systemctl restart SERVICE           # Full stop and start
systemctl reload SERVICE            # Reload config (no downtime)
systemctl reload-or-restart SERVICE # Try reload first, restart if needed
```

### 📊 Restart vs Reload

| Command | What Happens | Downtime | Use Case |
|---------|-------------|----------|----------|
| **restart** | Stop and start | Brief | Major changes |
| **reload** | Reload config | None | Config-only changes |
| **reload-or-restart** | Auto-choose | Minimal | Safe default |

### 💡 Examples

#### Nginx restart vs reload:

```bash
# Edit config
vim /etc/nginx/nginx.conf

# Option 1: Full restart (brief downtime)
systemctl restart nginx
# All connections closed and reopened

# Option 2: Reload (no downtime) - PREFERRED
systemctl reload nginx
# Config reloaded without dropping connections
```

#### Jenkins restart (requires restart):
```bash
# Plugin update requires restart
systemctl restart jenkins

# Monitor the restart
journalctl -u jenkins -f
# Wait for "Jenkins is fully up and running"
```

### 🏭 Production Example

#### After configuration change:
```bash
#!/bin/bash
CONFIG_FILE=/etc/app/app.conf

# Make change
sudo sed -i 's/old_value/new_value/' $CONFIG_FILE

# Verify config syntax (app-specific)
app-validate-config $CONFIG_FILE

# Reload config
systemctl reload-or-restart app

# Verify running
systemctl is-active app

# Check logs
journalctl -u app -n 20
```

### 👨‍💼 Interview Tips

- ✓ Know restart vs reload
- ✓ Know when to use each
- ✓ Know downtime implications
- ✓ Know reload prevents connection drops
- ✓ Know verification is critical

---

## Q5: Check Service Status

### 🎯 Commands

```bash
systemctl status SERVICE            # Full status
systemctl is-active SERVICE         # Is running? (returns 0 or 1)
systemctl is-enabled SERVICE        # Will start on boot?
systemctl is-failed SERVICE         # Did it fail?
```

### 💡 Status Output Breakdown

```bash
$ systemctl status docker

● docker.service - Docker Application Container Engine
    ├─ Loaded: loaded (/usr/lib/systemd/system/docker.service)
    ├─ Active: active (running) since Thu 2024-01-15 10:30:45 UTC
    ├─ Docs: https://docs.docker.com
    ├─ Main PID: 4532 (dockerd)
    ├─ CGroup: /system.slice/docker.service
    │           └─4532 /usr/bin/dockerd
    └─ Recent logs:
        Jan 15 10:30:45 host systemd[1]: Started Docker Application Container Engine
        Jan 15 10:30:46 host docker[4532]: time="2024-01-15T10:30:46.123Z" level=info msg="API Server started"
```

### 📊 Status Fields Explained

| Field | Meaning |
|-------|---------|
| `Loaded` | Unit file found and parsed |
| `Active` | Current state |
| `Enabled` | Starts on boot |
| `Main PID` | Process ID of main process |
| `CGroup` | Resource control group |

### 💡 Practical Examples

#### Quick check (scripts):
```bash
if systemctl is-active --quiet docker; then
  echo "✓ Docker running"
else
  echo "✗ Docker not running"
  systemctl start docker
fi
```

#### Check if enabled for boot:
```bash
$ systemctl is-enabled docker
enabled

# If not enabled
systemctl enable docker
```

#### Check failed services:
```bash
$ systemctl is-failed docker
inactive

# List all failed services
systemctl list-units --state=failed
```

### 🏭 Production Health Check

#### Monitor critical services:
```bash
#!/bin/bash

CRITICAL_SERVICES=("docker" "kubelet" "jenkins-agent")

for svc in "${CRITICAL_SERVICES[@]}"; do
  STATUS=$(systemctl is-active $svc)
  ENABLED=$(systemctl is-enabled $svc)
  
  if [ "$STATUS" = "active" ] && [ "$ENABLED" = "enabled" ]; then
    echo "✓ $svc: running and enabled"
  else
    echo "✗ $svc: status=$STATUS, enabled=$ENABLED"
    # Alert
  fi
done
```

---

## Q6: Enable Services at Boot

### 🎯 Commands

```bash
systemctl enable SERVICE             # Enable (start on boot)
systemctl disable SERVICE            # Disable (don't start on boot)
systemctl enable --now SERVICE       # Enable AND start now
systemctl is-enabled SERVICE         # Check if enabled
```

### 🔄 Enable vs Start

```
systemctl enable  → Creates symlink → Will start on boot (doesn't start now)
systemctl start   → Starts service now (won't start on boot if not enabled)

TOGETHER (most common):
systemctl enable --now SERVICE
```

### 💡 Examples

#### Enable at boot:
```bash
# Docker will start on reboot
sudo systemctl enable docker
# Created symlink /etc/systemd/system/multi-user.target.wants/docker.service
```

#### Enable AND start:
```bash
sudo systemctl enable --now docker
# Enables for boot AND starts immediately
```

#### Disable (don't auto-start):
```bash
sudo systemctl disable docker
# Won't start on next boot
```

#### Verify enabled:
```bash
$ systemctl is-enabled docker
enabled

$ systemctl is-enabled jenkins
disabled
```

### 🏭 EC2 Instance Setup

#### Initial setup for production:
```bash
#!/bin/bash

echo "Setting up EC2 instance..."

# Install Docker
apt update && apt install -y docker.io

# Enable for boot
systemctl enable docker

# Start immediately
systemctl start docker

# Verify
systemctl is-enabled docker   # Should show: enabled
systemctl is-active docker    # Should show: active

echo "✓ Docker ready (will start on reboot)"
```

### ⚠️ Common Issue

#### Service won't start after reboot:

```bash
# You enabled but didn't start:
systemctl enable jenkins
# (service will start on next boot, but not now)

# Use enable --now instead:
systemctl enable --now jenkins
```

### 👨‍💼 Interview Tips

- ✓ Know enable vs start difference
- ✓ Know enable --now pattern
- ✓ Know is-enabled check
- ✓ Know symlink concept
- ✓ Know production best practices

---

## Q7: Using Journalctl

### 🎯 Command
```bash
journalctl [OPTIONS]
```

### 💡 Common Usage

```bash
# View all logs
journalctl

# Service logs only
journalctl -u docker

# Follow in real-time
journalctl -u docker -f

# Only errors
journalctl -u docker -p err

# Last 50 lines
journalctl -u docker -n 50

# Since specific time
journalctl -u docker --since "1 hour ago"
```

### 📊 Priority Levels

```
emerg   Emergency (system unusable)
alert   Alert (immediate action)
crit    Critical
err     Error
warning Warning
notice  Normal notice
info    Informational
debug   Debug info
```

### 💡 Examples

#### View Docker logs:
```bash
$ journalctl -u docker

Jan 15 10:30:45 hostname docker[4532]: INFO: Starting Docker daemon
Jan 15 10:30:46 hostname docker[4532]: INFO: API listening on /var/run/docker.sock
```

#### Follow Jenkins in real-time:
```bash
$ journalctl -u jenkins -f
Jan 15 10:35:12 hostname jenkins[5432]: INFO: Jenkins is fully up and running
Jan 15 10:35:13 hostname jenkins[5432]: INFO: Loaded plugins
```

#### Only errors:
```bash
$ journalctl -u docker -p err
Jan 15 10:40:22 hostname docker[4532]: ERROR: Failed to start container
```

### 🏭 Production Debugging

#### Service startup debugging:
```bash
#!/bin/bash
SERVICE="jenkins"

echo "Starting $SERVICE..."
systemctl start $SERVICE

echo "Waiting for startup..."
sleep 3

echo "Checking logs..."
journalctl -u $SERVICE -n 20

echo "Checking status..."
systemctl status $SERVICE
```

#### Monitor startup logs:
```bash
# In one terminal
journalctl -u jenkins -f

# In another
systemctl restart jenkins
# Watch logs as service starts
```

### 👨‍💼 Interview Tips

- ✓ Know journalctl syntax
- ✓ Know -f for follow
- ✓ Know -u for unit
- ✓ Know priority filtering
- ✓ Know time filtering

---

## ⚡ Quick Reference

### Most Used Commands

```bash
# Status checks
systemctl status SERVICE
systemctl is-active SERVICE
systemctl is-enabled SERVICE

# Start/stop/restart
systemctl start SERVICE
systemctl stop SERVICE
systemctl restart SERVICE
systemctl reload SERVICE

# Enable/disable
systemctl enable SERVICE
systemctl disable SERVICE
systemctl enable --now SERVICE

# Logs
journalctl -u SERVICE
journalctl -u SERVICE -f
journalctl -u SERVICE -p err
journalctl -u SERVICE -n 50
```

### Service Startup Pattern

```bash
# 1. Install
apt install SERVICE

# 2. Configure (if needed)
vim /etc/SERVICE/config.conf

# 3. Enable at boot
systemctl enable SERVICE

# 4. Start now
systemctl start SERVICE

# 5. Verify
systemctl status SERVICE

# 6. Check logs
journalctl -u SERVICE -n 20
```

### Production Maintenance

```bash
# Before update
systemctl disable SERVICE      # Won't auto-restart
systemctl stop SERVICE         # Stop gracefully

# Do maintenance

# After update
systemctl enable SERVICE       # Re-enable for boot
systemctl start SERVICE        # Start service
systemctl status SERVICE       # Verify running
```

---

## 🎓 Interview Expectations

**What Interviewers Look For:**

- ✅ Know systemctl basic commands
- ✅ Know enable vs start
- ✅ Know start/stop/restart
- ✅ Know journalctl for debugging
- ✅ Know production patterns
- ✅ Know service dependencies
- ✅ Know how to troubleshoot

**Red Flag Answers:**

❌ "I just restart the service"
✅ "I check logs first, then investigate before restarting"

❌ "Enable and start are the same thing"
✅ "Enable sets boot startup; start runs now"

---

## 📝 Production Best Practices

### ✅ DO

- ✅ Enable critical services at boot
- ✅ Use enable --now for simplicity
- ✅ Monitor journalctl for errors
- ✅ Set Restart=on-failure in unit file
- ✅ Test service restart procedure
- ✅ Document all custom services
- ✅ Alert on service failures

### ❌ DON'T

- ❌ Only start without enabling (won't survive reboot)
- ❌ Edit /etc/systemd/system/ without reloading
- ❌ Assume service is running without checking
- ❌ Ignore service failures
- ❌ Over-use SIGKILL instead of graceful stop
- ❌ Forget to verify after changes

---

**Last Updated:** January 2024 | **Ready for:** DevOps, SRE, System Admin Interviews
