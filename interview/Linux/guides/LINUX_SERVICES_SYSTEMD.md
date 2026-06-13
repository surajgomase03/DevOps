================================================================================
SECTION 5: LINUX - SERVICES & SYSTEMD
================================================================================

Q1. WHAT IS SYSTEMD?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

SIMPLE DEFINITION:
Modern Linux init system (service manager) that manages system startup,
services, and system processes.

BACKGROUND:

Traditional init (System V):
  Used in older Linux systems
  Sequential startup
  /etc/init.d/service command
  Slower boot, limited features

Modern systemd:
  Parallel startup (faster)
  Centralized service management
  systemctl command
  Dependency-based startup
  Used in: CentOS 7+, Ubuntu 15.04+, Fedora, RHEL 7+

WHAT SYSTEMD MANAGES:

âœ“ Service startup and shutdown
âœ“ Process dependencies
âœ“ Parallel execution
âœ“ System logging (journalctl)
âœ“ Resource limits
âœ“ Auto-restart on failure

UNIT FILES:

Location: /etc/systemd/system/ (custom services)
Location: /usr/lib/systemd/system/ (distribution provided)

Format: service.service, socket.socket, mount.mount, timer.timer

EXAMPLE SERVICE FILE:

/etc/systemd/system/jenkins.service:

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

WHY IS IT USED?

âœ“ Faster system startup (parallel processing)
âœ“ Better dependency management
âœ“ Automatic service restart on failure
âœ“ Resource isolation
âœ“ Centralized logging
âœ“ Standard across modern distributions

HOW DOES IT WORK?

1. Parse unit files
2. Build dependency tree
3. Start units in parallel (respecting dependencies)
4. Manage running services
5. Handle signals and restarts

REAL-TIME EXAMPLE:

Start Jenkins service:
  systemctl start jenkins

Check status:
  systemctl status jenkins
  
View logs:
  journalctl -u jenkins -f

CMG PROJECT:

Kubernetes node service:
  /etc/systemd/system/kubelet.service
  
Jenkins agent service:
  /etc/systemd/system/jenkins-agent.service
  
Docker service:
  /lib/systemd/system/docker.service (pre-installed)

INTERVIEW TIPS:
  âœ“ Know systemd is modern init system
  âœ“ Know systemctl command
  âœ“ Know unit file locations
  âœ“ Know service dependencies

================================================================================

Q2. HOW DO YOU START SERVICES?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

COMMAND: systemctl start

SYNTAX:
  systemctl start service-name

EXAMPLES:

1. Start Docker
   systemctl start docker
   
2. Start Jenkins
   systemctl start jenkins
   
3. Start Kubernetes kubelet
   systemctl start kubelet
   
4. Start Nginx
   systemctl start nginx
   
5. Start multiple services
   systemctl start docker nginx jenkins

VERIFY SERVICE STARTED:

systemctl status docker
systemctl is-active docker

Check if running:
systemctl is-active --quiet docker && echo "Running" || echo "Not running"

REAL-TIME OUTPUT:

$ systemctl start docker
$ systemctl status docker

â— docker.service - Docker Application Container Engine
   Loaded: loaded (/lib/systemd/system/docker.service; enabled)
   Active: active (running) since Thu 2024-01-15 10:30:45 UTC; 5s ago
     Docs: https://docs.docker.com/engine/reference/commandline/dockerd/
  Main PID: 4532 (dockerd)

CMG PROJECT EXAMPLES:

1. Start Kubernetes kubelet after reboot
   systemctl start kubelet
   systemctl status kubelet
   
2. Start Jenkins agent
   systemctl start jenkins-agent
   systemctl status jenkins-agent
   
3. Start Docker daemon
   systemctl start docker
   systemctl status docker

TROUBLESHOOTING START FAILURES:

Service won't start:

1. Check if enabled
   systemctl is-enabled service-name
   
2. View error logs
   journalctl -u service-name -n 20
   journalctl -u service-name -p err
   
3. Check service file
   systemctl cat service-name
   
4. Debug with verbose output
   systemctl start service-name --no-block
   journalctl -u service-name -f

EXAMPLE - SERVICE WON'T START:

$ systemctl start jenkins
Job for jenkins.service failed because the control process exited with error code.
See "systemctl status jenkins" and "journalctl -xe" for details.

$ journalctl -u jenkins -n 10
Jan 15 10:30:45 hostname jenkins[4532]: Error: unable to access jarfile /usr/share/jenkins/jenkins.war
$ ls -la /usr/share/jenkins/jenkins.war
(file not found - need to reinstall)

STARTING SPECIFIC INSTANCE:

Multiple instances of same service:
  systemctl start jenkins@primary
  systemctl start jenkins@secondary
  systemctl status jenkins@primary

USING TARGET SERVICES:

Start all services in a target:
  systemctl start multi-user.target

INTERVIEW TIPS:
  âœ“ Know systemctl start syntax
  âœ“ Know how to verify service started
  âœ“ Know how to troubleshoot start failures
  âœ“ Know journalctl for debugging

COMMON MISTAKES:

âŒ Not checking if service is enabled (won't start on boot)
âŒ Not verifying service actually started
âŒ Not checking logs when start fails
âŒ Using old service restart command

================================================================================

Q3. HOW DO YOU STOP SERVICES?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

COMMAND: systemctl stop

SYNTAX:
  systemctl stop service-name

EXAMPLES:

1. Stop Docker
   systemctl stop docker
   
2. Stop Jenkins
   systemctl stop jenkins
   
3. Stop Nginx
   systemctl stop nginx
   
4. Stop multiple services
   systemctl stop docker jenkins nginx

VERIFY SERVICE STOPPED:

systemctl status nginx
systemctl is-active nginx

REAL-TIME OUTPUT:

$ systemctl stop docker
$ systemctl status docker

â— docker.service - Docker Application Container Engine
   Loaded: loaded (/lib/systemd/system/docker.service; enabled)
   Active: inactive (dead) since Thu 2024-01-15 10:35:22 UTC; 3s ago

GRACEFUL STOP PROCESS:

1. systemctl sends SIGTERM to service
2. Service has TimeoutStopSec (default 90 seconds) to shut down
3. If still running after timeout â†’ SIGKILL sent

CHECK STOP TIMEOUT:

systemctl show -p TimeoutStopSec docker
TimeoutStopSec=90s

CMG PROJECT EXAMPLE:

Before AWS EC2 shutdown:

#!/bin/bash
echo "Stopping services gracefully..."
systemctl stop jenkins-agent
sleep 5
systemctl stop docker
sleep 5
systemctl stop kubelet
sleep 5

echo "All services stopped"

EC2 MAINTENANCE SEQUENCE:

1. Drain Kubernetes node
   kubectl drain node-name --ignore-daemonsets
   
2. Stop applications
   systemctl stop application-service
   
3. Stop Docker
   systemctl stop docker
   
4. Stop Kubernetes
   systemctl stop kubelet
   
5. Perform maintenance
   (update, patch, etc)
   
6. Start Kubernetes
   systemctl start kubelet
   
7. Uncordon node
   kubectl uncordon node-name
   
8. Start applications
   systemctl start application-service

FORCE STOP (LAST RESORT):

Normal stop (preferred):
  systemctl stop service-name
  
Force stop (kill -9):
  systemctl kill -s SIGKILL service-name

INTERVIEW TIPS:
  âœ“ Know graceful stop
  âœ“ Know stop timeout
  âœ“ Know production drain pattern
  âœ“ Know how to verify stopped

COMMON MISTAKES:

âŒ Not gracefully stopping before maintenance
âŒ Force stopping when not necessary
âŒ Not waiting for dependencies to stop
âŒ Not checking service fully stopped

================================================================================

Q4. HOW DO YOU RESTART SERVICES?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

COMMAND: systemctl restart

SYNTAX:
  systemctl restart service-name

RESTART VS RELOAD:

restart:  Full stop and start (all connections closed)
reload:   Reload config without full restart (connections preserved)

EXAMPLES:

1. Full restart Docker
   systemctl restart docker
   (All containers stopped and restarted)
   
2. Reload Nginx config
   systemctl reload nginx
   (No connection drop, just reload config)
   
3. Restart Jenkins
   systemctl restart jenkins
   
4. Restart multiple
   systemctl restart docker nginx

WHEN TO USE EACH:

restart â†’ When you need clean slate
reload  â†’ When you just changed config and want no downtime

NGINX EXAMPLE:

Config change:
  vim /etc/nginx/nginx.conf
  
Check config syntax:
  nginx -t
  
Reload (no downtime):
  systemctl reload nginx
  
Restart (downtime):
  systemctl restart nginx

DOCKER RESTART:

Restart Docker daemon:
  systemctl restart docker
  
Effect:
  âœ“ All containers stopped
  âœ“ Docker daemon restarted
  âœ“ Containers may auto-restart if restart policy set
  
Restart policy:
  --restart=always
  --restart=unless-stopped
  --restart=on-failure

CMG PROJECT:

Jenkins restart after plugin update:
  systemctl restart jenkins
  journalctl -u jenkins -f    (monitor restart)
  
Kubernetes restart:
  systemctl restart kubelet
  kubectl get nodes             (verify health)

AUTOMATIC RESTART ON FAILURE:

In service file:
[Service]
Restart=on-failure
RestartSec=5
StartLimitBurst=3
StartLimitIntervalSec=60

Effect:
  âœ“ Restart if exits abnormally
  âœ“ Wait 5 seconds before restart
  âœ“ Max 3 restarts in 60 seconds
  âœ“ Then stop trying

MONITOR RESTART:

journalctl -u service-name -f
systemctl status service-name

INTERVIEW TIPS:
  âœ“ Know restart vs reload difference
  âœ“ Know when to use each
  âœ“ Know auto-restart policy
  âœ“ Know how to monitor restarts

================================================================================

Q5. HOW DO YOU CHECK SERVICE STATUS?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

COMMAND: systemctl status

SYNTAX:
  systemctl status service-name
  systemctl is-active service-name
  systemctl is-enabled service-name
  systemctl is-failed service-name

REAL-TIME EXAMPLES:

1. Full status
   $ systemctl status docker
   
   â— docker.service - Docker Application Container Engine
      Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
      Active: active (running) since Thu 2024-01-15 10:30:45 UTC; 1h 5m ago
        Docs: https://docs.docker.com/engine/reference/commandline/dockerd/
     Main PID: 4532 (dockerd)
       CGroup: /system.slice/docker.service
               â””â”€4532 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
   
   Jan 15 10:30:45 hostname systemd[1]: Started Docker Application Container Engine.

2. Quick check (running?)
   systemctl is-active docker
   active
   
3. Quick check (enabled?)
   systemctl is-enabled docker
   enabled
   
4. Check if failed
   systemctl is-failed docker
   (inactive - not failed)

STATUS OUTPUT BREAKDOWN:

Loaded:      Service file found and parsed
Active:      Current state (active/inactive/failed)
Enabled:     Starts on boot (enabled/disabled)
Vendor:      Distribution default
Main PID:    Process ID of main process
CGroup:      Process group
Memory/CPU:  Resource usage

ACTIVE STATES:

active (running)    â†’ Service is running
active (exited)     â†’ Service completed and exited successfully
active (waiting)    â†’ Service waiting for event
inactive (dead)     â†’ Service is stopped
failed              â†’ Service failed to start
unknown             â†’ Unknown state

CMG PROJECT MONITORING:

1. Check all critical services
   #!/bin/bash
   SERVICES=("docker" "kubelet" "jenkins-agent")
   
   for svc in "${SERVICES[@]}"; do
     echo -n "$svc: "
     systemctl is-active $svc || echo "NOT RUNNING"
   done
   
2. Monitor service health
   systemctl status docker jenkins-agent kubelet
   
3. Check failed services
   systemctl list-units --state=failed

DETAILED STATUS CHECK:

systemctl show docker              (all properties)
systemctl show -p State docker     (specific property)
systemctl show -p MainPID docker
systemctl show -p MemoryCurrent docker

MONITORING PRODUCTION:

Alert if service down:
  #!/bin/bash
  if ! systemctl is-active --quiet docker; then
    echo "ALERT: Docker service is down"
    systemctl start docker
    systemctl status docker | mail -s "Docker restarted" admin@example.com
  fi

QUICK CHECK FOR TROUBLESHOOTING:

1. Is service running?
   systemctl is-active service
   
2. Is service enabled?
   systemctl is-enabled service
   
3. When did it start?
   systemctl show -p ActiveEnterTimestamp service
   
4. Why did it fail?
   journalctl -u service -n 50
   
5. Resource usage
   systemctl status service

INTERVIEW TIPS:
  âœ“ Know status command output
  âœ“ Know is-active / is-enabled
  âœ“ Know different states
  âœ“ Know how to check failed services
  âœ“ Know how to monitor continuously

================================================================================

Q6. HOW DO YOU ENABLE SERVICES AT BOOT?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

COMMAND: systemctl enable

SYNTAX:
  systemctl enable service-name
  systemctl disable service-name
  systemctl is-enabled service-name

WHAT IS ENABLE?

Enable â†’ Creates symlink so service starts automatically at boot

EXAMPLES:

1. Enable Docker to start on boot
   systemctl enable docker
   Created symlink /etc/systemd/system/multi-user.target.wants/docker.service
   
2. Enable Jenkins
   systemctl enable jenkins
   
3. Enable Kubernetes
   systemctl enable kubelet
   
4. Enable multiple
   systemctl enable docker kubernetes nginx

ENABLE VS START:

enable  â†’ Configure to start at boot (doesn't start now)
start   â†’ Start immediately (not at boot)

Together (most common):
  systemctl enable --now docker
  (Enables AND starts)

VERIFY ENABLED:

systemctl is-enabled docker
enabled

Check enabled services:
  systemctl list-unit-files --state=enabled | head -20

DISABLE (OPPOSITE):

Remove from boot startup:
  systemctl disable docker
  
Verify disabled:
  systemctl is-enabled docker
  disabled

PRODUCTION PATTERN:

New service setup:
  1. systemctl enable service-name    (on boot)
  2. systemctl start service-name     (start now)
  
Or together:
  systemctl enable --now service-name

CMG PROJECT:

Jenkins agent EC2 startup:
  systemctl enable docker
  systemctl enable jenkins-agent
  (Both will start on boot)

Kubernetes node startup:
  systemctl enable kubelet
  systemctl enable docker
  (Critical for node health)

DISASTER RECOVERY:

If service mysteriously stops:
  Verify it's enabled:
    systemctl is-enabled docker
    
  If not enabled, enable it:
    systemctl enable docker
    systemctl start docker
    
  Prevent future issues:
    Add monitoring
    Check if auto-restart is configured

ENABLE FOR DIFFERENT TARGETS:

Default (multi-user.target):
  systemctl enable service-name
  
Start in graphical target:
  systemctl enable --scope=user service-name

COMMON PRODUCTION ISSUES:

Service not starting after reboot:

1. Check if enabled
   systemctl is-enabled service-name
   
2. If not, enable it
   systemctl enable service-name
   
3. Reboot to test
   reboot
   
4. Verify running
   systemctl is-active service-name

SCRIPTING:

#!/bin/bash
# Ensure critical services are enabled

CRITICAL_SERVICES=("docker" "kubelet" "jenkins-agent")

for svc in "${CRITICAL_SERVICES[@]}"; do
  if ! systemctl is-enabled $svc > /dev/null; then
    echo "Enabling $svc"
    systemctl enable $svc
  fi
  
  if ! systemctl is-active $svc > /dev/null; then
    echo "Starting $svc"
    systemctl start $svc
  fi
done

echo "All critical services are enabled and running"

INTERVIEW TIPS:
  âœ“ Know enable vs start
  âœ“ Know enable --now
  âœ“ Know verify enabled
  âœ“ Know disable opposite
  âœ“ Production best practices

COMMON MISTAKES:

âŒ Enabling but not starting (service won't run until reboot)
âŒ Starting but not enabling (service won't run after reboot)
âŒ Not verifying after enable
âŒ Assuming service is enabled without checking

================================================================================

Q7. WHAT IS JOURNALCTL?
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

PURPOSE: View and manage systemd system journal (centralized logging)

BACKGROUND:

Traditional logs:
  /var/log/messages
  /var/log/secure
  /var/log/auth.log
  Multiple files, hard to correlate

systemd logging:
  All in journal (binary format, indexed)
  Correlated by unit, priority, user
  Faster searches
  Better organization

BASIC SYNTAX:

journalctl                    View all logs
journalctl -u service-name    View service logs
journalctl -f                 Follow (tail) logs
journalctl -n 50              Last 50 lines
journalctl -p err             Only errors

EXAMPLES:

1. View Docker logs
   journalctl -u docker
   
2. View Jenkins logs
   journalctl -u jenkins
   
3. Follow logs in real-time
   journalctl -u docker -f
   
4. Only error and critical
   journalctl -u docker -p err
   
5. Last 100 lines
   journalctl -n 100
   
6. Today's logs
   journalctl -u docker --since today
   
7. Last 2 hours
   journalctl -u docker --since "2 hours ago"

REAL-TIME EXAMPLE:

$ journalctl -u docker -f

Jan 15 10:30:45 hostname docker[4532]: time="2024-01-15T10:30:45.123456Z" level=info msg="Starting api server"
Jan 15 10:30:46 hostname docker[4532]: time="2024-01-15T10:30:46.234567Z" level=info msg="Server started"
Jan 15 10:30:47 hostname docker[4532]: time="2024-01-15T10:30:47.345678Z" level=info msg="Listening on /var/run/docker.sock"

PRIORITIES:

emerg    Emergency (system unusable)
alert    Alert (immediate action required)
crit     Critical
err      Error
warning  Warning
notice   Notice (important)
info     Informational
debug    Debug

COMMON OPTIONS:

-u UNIT             Unit logs only
-f, --follow        Follow mode
-n NUM              Last N lines
-p PRIORITY         Filter by priority
--since WHEN        After this time
--until WHEN        Before this time
-b                  Boot logs
--no-pager          Don't use pager (full output)
-o FORMAT           Output format
--reverse           Newest last

OUTPUT FORMATS:

journalctl -u docker -o short          (default, concise)
journalctl -u docker -o short-iso      (with ISO timestamps)
journalctl -u docker -o json           (JSON format)
journalctl -u docker -o json-pretty    (pretty JSON)

CMG PROJECT EXAMPLES:

1. Troubleshoot Jenkins startup
   journalctl -u jenkins -n 50
   journalctl -u jenkins -p err
   
2. Check Docker errors
   journalctl -u docker -p warning
   journalctl -u docker --since "10 minutes ago"
   
3. Monitor Kubernetes startup
   journalctl -u kubelet -f
   journalctl -u kubelet -p err

SEARCHING LOGS:

journalctl GREP_FIELD=VALUE

Find by message:
  journalctl MESSAGE=text
  
Find by executable:
  journalctl _EXE=/usr/bin/docker
  
Find by PID:
  journalctl _PID=1234

DEBUGGING FAILED SERVICE:

1. Get error logs
   journalctl -u service-name -p err
   
2. Get recent logs
   journalctl -u service-name -n 100
   
3. Follow startup
   systemctl start service-name
   journalctl -u service-name -f
   
4. Get boot logs
   journalctl -u service-name -b

CLEANING JOURNAL:

Vacuum (keep only recent):
  journalctl --vacuum=time:7d         (keep 7 days)
  journalctl --vacuum=size:100M       (keep under 100MB)

INTERVIEW TIPS:
  âœ“ Know journalctl syntax
  âœ“ Know follow mode (-f)
  âœ“ Know priority filtering
  âœ“ Know time filtering
  âœ“ Know how to debug failed services
  âœ“ Know difference from old logs

COMMON MISTAKES:

âŒ Using tail instead of journalctl
âŒ Not using -f flag for monitoring
âŒ Not filtering by unit
âŒ Journal growing too large (need to vacuum)

================================================================================

QUICK REVISION - SYSTEMD & SERVICES
================================================================================

KEY COMMANDS:

systemctl start service           Start service
systemctl stop service            Stop service
systemctl restart service         Restart service
systemctl reload service          Reload config without restart
systemctl enable service          Auto-start on boot
systemctl disable service         Don't auto-start on boot
systemctl status service          Service status
systemctl is-active service       Is running?
systemctl is-enabled service      Is enabled?
systemctl is-failed service       Did it fail?
journalctl -u service             Service logs
journalctl -u service -f          Follow logs
systemctl list-units --failed     Show failed units

PRODUCTION STARTUP SEQUENCE:

1. Install service
   apt/yum install package
   
2. Configure (if needed)
   vim /etc/service/config.conf
   
3. Enable at boot
   systemctl enable service
   
4. Start service
   systemctl start service
   
5. Verify running
   systemctl status service
   
6. Check logs
   journalctl -u service -n 20

PRODUCTION STOP SEQUENCE (MAINTENANCE):

1. Drain load (if applicable)
   kubectl drain node-name
   
2. Stop gracefully
   systemctl stop service
   
3. Perform maintenance
   (update, patch, backup)
   
4. Start service
   systemctl start service
   
5. Verify healthy
   systemctl status service
   
6. Rejoin cluster
   kubectl uncordon node-name

SERVICE FILE LOCATIONS:

/usr/lib/systemd/system/     Distribution-provided (don't edit)
/etc/systemd/system/         Custom/user services (edit here)

KEY PROPERTIES IN SERVICE FILE:

[Unit]
Description=Service description
After=network.target              (start after network)
Requires=other.service            (requires other service)
Wants=optional.service            (optional dependency)

[Service]
Type=simple|forking|oneshot       (how service runs)
User=username                     (run as user)
ExecStart=/path/to/binary         (startup command)
ExecStop=/bin/kill $MAINPID       (stop command)
Restart=on-failure                (restart if fails)
RestartSec=10                     (wait 10 sec before restart)

[Install]
WantedBy=multi-user.target        (enable target)

PRODUCTION BEST PRACTICES:

âœ“ Always enable services at boot
âœ“ Configure auto-restart for critical services
âœ“ Monitor service status continuously
âœ“ Keep logs for troubleshooting
âœ“ Test startup sequence after changes
âœ“ Document all custom services
âœ“ Use meaningful descriptions
âœ“ Set appropriate restart policies
âœ“ Monitor journal size

MONITORING AND ALERTING:

Check running services:
  systemctl status docker jenkins-agent kubelet
  
Alert on failure:
  systemctl is-active service || alert "Service down"
  
Monitor logs:
  journalctl -u service -f
  
Check boot behavior:
  systemctl is-enabled service

INTERVIEWER EXPECTATIONS:

âœ“ Know systemctl basic commands
âœ“ Know start/stop/restart differences
âœ“ Know enable vs start
âœ“ Know how to troubleshoot failures
âœ“ Know journalctl for debugging
âœ“ Know production patterns
âœ“ Know service file basics
âœ“ Know restart policies

================================================================================

