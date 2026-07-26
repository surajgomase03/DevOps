# Linux Master Handbook — 2026-07-v1

**Version:** Linux-Handbook-2026-07-v1.md  
**Date:** July 2026  
**Project:** UK Government CMG — AWS EC2, EKS, Jenkins, Terraform, Ansible, Docker, WebSphere, Siebel CRM, BPM (Amazon Linux)  
**Rule:** Same month → append here. New month → create v2 with new content only. Cross-reference instead of duplicate.

---

## VERSIONING RULES

| Rule | Detail |
|------|--------|
| Same Month | Append ALL new content to this file |
| New Month | New file: Linux-Handbook-2026-08-v2.md |
| No Duplication | Each version has UNIQUE content only |
| Cross-Reference | New versions say "See v1 Section X" |
| Sources | Chat history + Linux_Interview.docx + Master Prompt + all scripts |

---

# MODULE 1: LINUX FUNDAMENTALS

## 1.1 What is Linux?

**Simple:** Linux is a free, open-source OS kernel — the engine powering servers, phones, cloud, and containers.  
**Technical:** Monolithic, Unix-like kernel created by Linus Torvalds in 1991 (GPL v2). Combined with GNU tools = GNU/Linux.  
**Analogy:** Linux is the engine of a car — invisible but everything depends on it.

## 1.2 Why Linux Was Created

- Linus Torvalds (Helsinki, 1991) wanted a free Unix-like OS for his PC
- Unix was proprietary and expensive
- Richard Stallman's GNU project had tools but no kernel
- Together → GNU/Linux

## 1.3 Linux Architecture

```
┌──────────────────────────────────────────┐
│  USER APPLICATIONS                       │
│  nginx, java, docker, jenkins, kubectl   │
├──────────────────────────────────────────┤
│  GNU TOOLS / GLIBC                       │
│  bash, ls, cp, grep, awk, sed            │
├──────────────────────────────────────────┤
│  SYSTEM CALL INTERFACE                   │
│  open() read() write() fork() exec()     │
├──────────────────────────────────────────┤
│  LINUX KERNEL                            │
│  Process | Memory | FS | Net | Drivers   │
├──────────────────────────────────────────┤
│  HARDWARE                                │
│  CPU | RAM | Disk | NIC | GPU            │
└──────────────────────────────────────────┘
```

## 1.4 Kernel Components

| Component | Description |
|-----------|-------------|
| Process Management | CFS scheduler, fork/exec, signals, PIDs, namespaces, cgroups |
| Memory Management | Virtual memory, MMU, page tables, OOM killer, swap, huge pages |
| Device Drivers | Hardware abstraction — NIC, disk, GPU, USB. Loadable modules |
| Virtual File System | VFS abstraction — ext4/XFS/NFS all look same to applications |
| Network Stack | TCP/IP, UDP, ICMP, sockets, iptables/nftables hooks |
| IPC | Pipes, signals, shared memory, semaphores, message queues |
| Security | Capabilities, SELinux/AppArmor, namespaces, seccomp, audit |

## 1.5 Linux Distributions

| Distro | Details |
|--------|---------|
| RHEL | Enterprise Linux. Paid support. Source for Rocky/Alma. DNF/RPM. |
| Rocky Linux | Free 1:1 RHEL clone. Replaces CentOS in production. |
| AlmaLinux | RHEL clone. CloudLinux-backed. Popular hosting/cloud. |
| Ubuntu | Debian-based. APT/.deb. LTS every 2 years. Popular cloud/dev. |
| Debian | Ultra-stable base for Ubuntu. Long support cycles. |
| Amazon Linux | AWS-optimized RHEL-based. EC2/SSM/CloudWatch pre-configured. EKS default. |
| SLES | SUSE Linux Enterprise. SAP HANA environments. zypper package manager. |

## 1.6 Interview Q&A

> 🎯 **Interview Tip:** Always mention project distro. CMG uses Amazon Linux 2/AL2023 on EC2.

**Q: What is Linux?**
- Beginner: Free open-source OS kernel by Linus Torvalds (1991)
- Intermediate: Monolithic POSIX-compliant kernel, GPL v2, combined with GNU tools
- Senior: POSIX-compliant monolithic kernel with loadable modules, drives 90%+ cloud workloads and containers via namespaces/cgroups

**Q: Linux vs Unix?**
- Linux is Unix-LIKE (POSIX-compliant) but shares NO Unix source code
- Unix: proprietary (AIX, Solaris, HP-UX)
- Linux: open-source, free, commodity hardware

> ⚠️ **Common Mistake:** "Linux and Unix are the same." → WRONG. Linux is Unix-like, not Unix.

---

# MODULE 2: BOOT PROCESS

## 2.1 Complete Boot Flow

```
POWER ON
   │
   ▼
BIOS / UEFI
   │  POST — test RAM, CPU, devices
   │  BIOS → reads MBR (first 512 bytes)
   │  UEFI → reads EFI System Partition (/boot/efi)
   ▼
GRUB2
   │  Loads vmlinuz (kernel) + initramfs into RAM
   │  Shows boot menu (/boot/grub2/grub.cfg)
   ▼
KERNEL INITIALIZATION
   │  Decompresses, detects hardware (ACPI)
   │  Initializes memory, loads built-in drivers
   │  Mounts initramfs as temporary root
   ▼
initramfs
   │  Tiny RAM filesystem with drivers for real root
   │  Handles LVM, LUKS, RAID, NFS
   │  Mounts real root filesystem
   ▼
systemd (PID 1)
   │  sysinit.target → basic.target → multi-user.target
   │  Starts services in parallel (dependency ordering)
   ▼
LOGIN PROMPT
```

## 2.2 BIOS vs UEFI

| Feature | BIOS | UEFI |
|---------|------|------|
| Partition table | MBR (max 4 primary, 2TB) | GPT (128 partitions, 9.4ZB) |
| Secure Boot | No | Yes |
| Speed | Slower | Faster |
| Bit mode | 16-bit | 32/64-bit |

## 2.3 GRUB2 Management

```bash
# Config files
/etc/default/grub            # Edit this — NEVER edit grub.cfg directly
/boot/grub2/grub.cfg         # GENERATED

# After editing /etc/default/grub:
grub2-mkconfig -o /boot/grub2/grub.cfg         # BIOS
grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg  # UEFI

# Key settings
GRUB_TIMEOUT=5
GRUB_CMDLINE_LINUX="quiet"
# Recovery additions: systemd.unit=rescue.target  rd.break
```

## 2.4 systemd Targets

| Runlevel | Target | Use |
|---------|--------|-----|
| 0 | poweroff.target | Shutdown |
| 1 | rescue.target | Single-user maintenance |
| 3 | multi-user.target | Servers (no GUI) |
| 5 | graphical.target | Desktop |
| 6 | reboot.target | Reboot |

```bash
systemctl get-default
systemctl set-default multi-user.target
systemctl isolate rescue.target
```

## 2.5 initramfs Rebuild

```bash
dracut -f                         # RHEL — rebuild for running kernel
update-initramfs -u               # Debian/Ubuntu
```

## 2.6 Recovery — Rescue Mode

```bash
# At GRUB menu: press 'e', find kernel line, add at end:
systemd.unit=rescue.target
# OR: rd.break  (initramfs shell — for password reset)
# Ctrl+X to boot

# Root password reset via rd.break:
mount -o remount,rw /sysroot
chroot /sysroot
passwd root
touch /.autorelabel              # SELinux relabel
exit && reboot
```

## 2.7 Boot Diagnostics

```bash
systemd-analyze                  # total boot time
systemd-analyze blame            # slowest services
systemd-analyze critical-chain   # dependency chain
systemctl list-units --failed    # failed units
journalctl -b                    # current boot logs
journalctl -b -1                 # previous boot (crash diagnosis)
```

> ⚠️ **Common Mistake:** Editing /boot/grub2/grub.cfg directly. Always edit /etc/default/grub then run grub2-mkconfig.

---

# MODULE 3: KERNEL MODULES & PARAMETERS

## 3.1 Kernel Modules

```bash
lsmod                            # list loaded modules
modprobe e1000e                  # load module (with dependencies)
modprobe -r e1000e               # unload module
modinfo e1000e                   # info: version, params, description
modinfo -p e1000e                # parameters only

# Persistent loading
echo "e1000e" >> /etc/modules-load.d/network.conf

# Blacklist module
echo "blacklist nouveau" >> /etc/modprobe.d/blacklist.conf

# Module parameters
echo "options e1000e InterruptThrottleRate=3000" >> /etc/modprobe.d/e1000e.conf
```

## 3.2 Kernel Parameters (sysctl)

```bash
sysctl -a                        # view all
sysctl net.ipv4.ip_forward       # view specific
sysctl -w net.ipv4.ip_forward=1  # set (temporary)
sysctl -p                        # apply /etc/sysctl.conf

# Persist: /etc/sysctl.d/99-production.conf
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1   # Kubernetes
net.ipv4.tcp_syncookies = 1              # SYN flood protection
net.ipv4.tcp_tw_reuse = 1               # reuse TIME_WAIT
net.core.somaxconn = 65535
kernel.randomize_va_space = 2            # ASLR
kernel.dmesg_restrict = 1
net.ipv4.conf.all.rp_filter = 1
vm.swappiness = 10
vm.overcommit_memory = 1                 # Docker/K8s
fs.inotify.max_user_watches = 524288
fs.file-max = 2097152
```

## 3.3 Kernel Version

```bash
uname -r                         # kernel version
uname -a                         # full info
cat /proc/version                # kernel + compiler
cat /etc/os-release              # distro info
```

---

# MODULE 4: FILESYSTEM HIERARCHY

## 4.1 Full Directory Tree

```
/
├── bin    → Essential binaries → symlink to /usr/bin
├── boot   → Bootloader (vmlinuz, initramfs, grub2/)
├── dev    → Device files (/dev/sda, /dev/null, /dev/tty)
├── etc    → ALL system configuration
│   ├── passwd, shadow, group, fstab, hosts, resolv.conf
│   ├── ssh/sshd_config, sudoers, crontab
│   └── selinux/config, pam.d/, systemd/system/
├── home   → User home directories
├── lib    → Shared libraries → symlink to /usr/lib
├── mnt    → Temporary manual mounts
├── opt    → Third-party software (/opt/IBM/WebSphere)
├── proc   → VIRTUAL: kernel + process info (NOT on disk)
│   ├── /proc/cpuinfo, /proc/meminfo
│   └── /proc/<PID>/status, fd, maps
├── root   → root user home
├── run    → Runtime PID/socket files (tmpfs, cleared on reboot)
├── sbin   → System admin binaries → symlink to /usr/sbin
├── sys    → VIRTUAL: kernel device model (NOT on disk)
├── tmp    → Temp files. World-writable (1777). Cleared on reboot.
├── usr    → User programs
│   ├── bin/ → most commands (git, docker, kubectl)
│   └── local/ → locally compiled software
└── var    → Variable data
    ├── log/ → ALL logs (disk-full risk!)
    └── lib/ → databases, package state
```

## 4.2 Critical Files

| File | Purpose |
|------|---------|
| /etc/passwd | User accounts: user:x:UID:GID:comment:home:shell. World-readable. |
| /etc/shadow | Hashed passwords + aging. Root-only. SHA-512. |
| /etc/group | Groups: groupname:x:GID:member1,member2 |
| /etc/fstab | Persistent mounts. Use UUID not /dev/sdX. Test: mount -a |
| /etc/hosts | Local hostname→IP. Checked BEFORE DNS. |
| /etc/resolv.conf | DNS servers |
| /etc/sudoers | sudo auth. ALWAYS edit with visudo. |
| /etc/nsswitch.conf | Resolution order: files → dns |
| /etc/sysctl.conf | Persistent kernel parameters |
| /etc/selinux/config | SELinux mode |

> ⚠️ **Common Mistake:** Never use /dev/sda in fstab — use UUID from blkid (device names change on reboot).

---

# MODULE 5: FILE PERMISSIONS & ACLs

## 5.1 Permission Structure

```
ls -la /etc/passwd
-rw-r--r--  1  root  root  2847  /etc/passwd
│└┬┘└┬┘└┬┘
│ │  │  └── Others: r-- = 4
│ │  └───── Group:  r-- = 4
│ └──────── Owner:  rw- = 6
└────────── Type: - file  d dir  l link  b block  c char
```

## 5.2 Numeric Permissions

| Mode | Symbolic | Use Case |
|------|----------|----------|
| 777 | rwxrwxrwx | NEVER in production |
| 755 | rwxr-xr-x | Scripts, directories |
| 644 | rw-r--r-- | Config files, web assets |
| 640 | rw-r----- | App configs (group readable) |
| 600 | rw------- | SSH private keys, secrets |
| 400 | r-------- | Read-only private keys |
| 700 | rwx------ | ~/.ssh directory |
| 1777 | rwxrwxrwt | /tmp (sticky bit) |
| 2755 | rwxr-sr-x | SGID shared directory |
| 4755 | rwsr-xr-x | SUID executable |

## 5.3 Commands

```bash
chmod 755 deploy.sh
chmod 600 ~/.ssh/id_rsa
chmod -R 755 /var/www/html
chmod u+x script.sh
chmod go-w file.txt
chown alice file.txt
chown alice:developers file.txt
chown -R www-data:www-data /var/www/
chgrp devops /deploy/
```

## 5.4 Special Permission Bits

**SUID (4xxx)** — Runs as file OWNER:
```bash
chmod 4755 /usr/bin/passwd
# 's' in owner execute position = SUID
# Security audit: find / -perm /4000 -type f 2>/dev/null
```

**SGID (2xxx)** — Runs as file GROUP / new files inherit group:
```bash
chmod 2775 /shared/project
```

**Sticky Bit (1xxx)** — Only owner/root can delete in shared dir:
```bash
chmod 1777 /tmp
```

## 5.5 ACLs

```bash
getfacl /var/www/html
setfacl -m u:alice:rw /etc/app/config.yaml
setfacl -d -m g:devops:rwx /deploy/      # default ACL
setfacl -b file                            # remove ALL ACLs
```

> 🔒 **Security:** Mount /tmp and /home with nosuid in fstab. Audit SUID: find / -perm /6000 -type f 2>/dev/null

---

# MODULE 6: USERS & GROUPS

## 6.1 User Types

| Type | UID | Shell | Purpose |
|------|-----|-------|---------|
| root | 0 | /bin/bash | Superuser |
| System | 1-999 | /sbin/nologin | Service accounts |
| Regular | 1000+ | /bin/bash | Human users |

## 6.2 /etc/passwd & /etc/shadow

```
# /etc/passwd
username:x:UID:GID:GECOS:home:shell
alice:x:1001:1001:Alice Smith:/home/alice:/bin/bash
nginx:x:997:995:Nginx:/var/cache/nginx:/sbin/nologin

# /etc/shadow
username:$6$salt$hash:lastchange:min:max:warn:inactive:expire
# $6$ = SHA-512
```

## 6.3 User Management

```bash
useradd -m -s /bin/bash -c "Alice" alice       # regular user
useradd -r -s /sbin/nologin -M nginx           # service account
passwd alice
echo "alice:pass" | chpasswd                    # non-interactive

# ALWAYS use -a with -aG
usermod -aG docker,sudo alice
# WARNING: usermod -G (without -a) REPLACES all groups!

passwd -l alice                                 # lock
passwd -u alice                                 # unlock
userdel alice                                   # keep home
userdel -r alice                                # remove home

chage -l alice                                  # view aging
chage -M 90 alice                               # max 90 days
chage -W 14 alice                               # warn 14 days
chage -d 0 alice                                # force change now

id alice && groups alice && who && w
last && lastb && lastlog
```

## 6.4 sudo

```bash
# ALWAYS edit with: visudo
alice   ALL=(ALL:ALL) ALL                         # full sudo
alice   ALL=(ALL) /usr/bin/systemctl,/usr/bin/apt # specific
%devops ALL=NOPASSWD: /usr/bin/docker            # group

# Drop-in files (preferred — managed by Ansible)
/etc/sudoers.d/jenkins
/etc/sudoers.d/alice
```

## 6.5 PAM (Pluggable Authentication Modules)

```bash
# Config: /etc/pam.d/  (per-service configs)

# Account lockout: /etc/security/faillock.conf
deny = 5              # lock after 5 failures
unlock_time = 600     # unlock after 10 minutes

# Password complexity: /etc/security/pwquality.conf
minlen = 12
dcredit = -1          # at least 1 digit
ucredit = -1          # at least 1 uppercase
lcredit = -1          # at least 1 lowercase
ocredit = -1          # at least 1 special char

faillock --user alice           # check lockout
faillock --reset --user alice   # unlock
```

---

# MODULE 7: PROCESS MANAGEMENT

## 7.1 Process States

| State | Symbol | Description |
|-------|--------|-------------|
| Running | R | On CPU or in run queue |
| Sleeping | S | Waiting (interruptible) |
| Uninterruptible | D | Waiting for I/O — cannot kill, not even SIGKILL |
| Zombie | Z | Dead, parent not called wait() |
| Stopped | T | Stopped by SIGSTOP or Ctrl+Z |

## 7.2 Process Lifecycle

```
Parent: fork()
        │
        ▼
   Child created (copy)
        │
        ▼ exec() → new program
        │
        ├→ exit() + parent wait() = REAPED (normal)
        ├→ exit() + no parent wait() = ZOMBIE → fix: kill parent
        └→ parent dies first = ORPHAN → re-parented to PID 1 (systemd)
```

## 7.3 Commands

```bash
ps aux                           # all processes
ps -ef                           # full format (shows PPID)
ps -ef --forest                  # parent-child tree
ps -eo pid,ppid,%cpu,%mem,stat,cmd --sort=-%cpu | head

top                              # live (P=CPU M=MEM 1=per-core k=kill)
top -H -p PID                    # threads of PID
htop                             # coloured interactive

pgrep nginx && pgrep -a java && pgrep -u alice
pidof nginx && pstree -p
```

## 7.4 Signals

| Signal | Number | Description |
|--------|--------|-------------|
| SIGHUP | 1 | Reload config (nginx, sshd) |
| SIGINT | 2 | Ctrl+C |
| SIGKILL | 9 | Immediate kill — cannot catch |
| SIGTERM | 15 | Graceful terminate — can catch |
| SIGSTOP | 19 | Pause — cannot catch |
| SIGCONT | 18 | Continue paused |
| SIGUSR1 | 10 | User-defined (nginx log reopen) |

```bash
kill -15 PID          # graceful (try FIRST)
kill -9 PID           # force (LAST RESORT)
kill -HUP PID         # reload
killall nginx         # all named nginx
pkill -f "app.py"     # by command pattern
```

## 7.5 Priority

```bash
# Range: -20 (highest) to +19 (lowest)
nice -n 10 backup.sh       # start lower priority
renice -n 5 -p 1234        # change running process
```

> ⚠️ **Mnemonic:** Higher nice value = LOWER priority (being "nicer" to others = giving yourself less)

---

# MODULE 8: MEMORY MANAGEMENT

## 8.1 free -h Explained

```
              total    used    free  shared  buff/cache  available
Mem:           15Gi    8Gi    1Gi    512Mi      6Gi        6.5Gi
Swap:           2Gi      0     2Gi

KEY: "available" = real usable memory (NOT "free")
Linux uses spare RAM as disk cache (buff/cache) — instantly reclaimable
Low "free" + high "available" = HEALTHY
Low "available" = PROBLEM
```

## 8.2 Memory Investigation

```bash
free -h
vmstat 1 10             # si/so = swap in/out (non-zero = problem)
cat /proc/meminfo
sar -r 1 10

ps aux --sort=-%mem | head -10
ps -eo pid,rss,vsz,cmd --sort=-rss | head
# rss = Resident Set Size = actual physical RAM used

dmesg | grep -i "oom\|killed"    # OOM events
grep "Out of memory" /var/log/messages
```

## 8.3 Swap

```bash
dd if=/dev/zero of=/swapfile bs=1M count=4096
chmod 600 /swapfile              # MUST be 600
mkswap /swapfile
swapon /swapfile
echo "/swapfile none swap sw 0 0" >> /etc/fstab

sysctl -w vm.swappiness=10       # prefer RAM (0=avoid 60=default 10=servers)
echo "vm.swappiness=10" >> /etc/sysctl.conf
```

## 8.4 OOM Killer

```bash
cat /proc/PID/oom_score          # view score (higher = more likely killed)
echo -1000 > /proc/PID/oom_score_adj     # protect process
# In systemd unit: OOMScoreAdjust=-1000
```

## 8.5 Virtual Memory & Huge Pages

```bash
# Each process gets own virtual address space
# MMU translates VA→PA via page tables
# Page fault triggers kernel to allocate physical RAM on first access
# fork() uses Copy-on-Write (CoW)

# Huge pages (for databases, SAP HANA)
cat /proc/meminfo | grep -i huge
echo 1024 > /proc/sys/vm/nr_hugepages
echo "vm.nr_hugepages=1024" >> /etc/sysctl.conf
```

---

# MODULE 9: PACKAGE MANAGEMENT

## 9.1 Overview

| Tool | Distro | Format |
|------|--------|--------|
| rpm | RHEL base | .rpm |
| yum | RHEL 6-7 | .rpm |
| dnf | RHEL 8+ / AL2023 | .rpm |
| apt | Debian/Ubuntu | .deb |
| zypper | SLES | .rpm |

## 9.2 RPM

```bash
rpm -qa                          # all installed
rpm -qa | grep nginx
rpm -qi nginx                    # info
rpm -ql nginx                    # files in package
rpm -qf /etc/nginx/nginx.conf    # which package owns file
rpm -V nginx                     # verify integrity
rpm -ivh package.rpm             # install local
rpm -e nginx                     # remove
rpm -e --nodeps nginx            # remove ignoring deps
```

## 9.3 YUM / DNF

```bash
yum install nginx -y
yum info nginx
yum list installed | grep nginx
yum provides "*/dig"             # find package with command
yum provides /etc/nginx/nginx.conf
yum update -y
yum remove nginx
yum autoremove
yum repolist
yum clean all
yum history                      # transactions
yum history undo 5               # rollback

# DNF (RHEL8+/AL2023)
dnf install nginx
dnf module list
dnf module install nginx:1.18
```

## 9.4 APT (Ubuntu/Debian)

```bash
apt update                       # refresh package index
apt install nginx
apt upgrade
apt remove nginx                 # keep config
apt purge nginx                  # remove + config
apt autoremove
dpkg -l nginx
dpkg -L nginx                    # files in package
dpkg -S /etc/nginx/nginx.conf    # which package owns file
apt --fix-broken install         # fix broken deps
```

## 9.5 Zypper (SLES)

```bash
zypper refresh
zypper update
zypper install nginx
zypper remove nginx
zypper search nginx
zypper patterns
zypper install -t pattern sap_hana
```

## 9.6 RHEL Subscription

```bash
subscription-manager register
subscription-manager list --available
subscription-manager attach --pool=POOL_ID
subscription-manager repos --enable=rhel-9-for-x86_64-baseos-rpms
```

---

# MODULE 10: NETWORKING

## 10.1 OSI Model

| Layer | Name | Examples |
|-------|------|---------|
| 7 | Application | HTTP, HTTPS, SSH, DNS |
| 4 | Transport | TCP, UDP |
| 3 | Network | IP, ICMP, routing |
| 2 | Data Link | Ethernet, ARP |
| 1 | Physical | Cables, fiber |

## 10.2 Key Concepts

| Concept | Detail |
|---------|--------|
| CIDR | /24=256IPs, /16=65536, /32=single. Private: 10/8, 172.16/12, 192.168/16 |
| ARP | IP→MAC within subnet. Cache: arp -n |
| DNS | /etc/resolv.conf. /etc/hosts checked FIRST. |
| TCP handshake | SYN→SYN-ACK→ACK. Close: FIN→ACK→FIN→ACK |
| TIME_WAIT | TCP state after close. Fix: net.ipv4.tcp_tw_reuse=1 |
| NAT | Private→Public IP. AWS NAT Gateway. |

## 10.3 Network Commands

```bash
# Interface (ip replaces deprecated ifconfig)
ip addr show
ip addr show eth0
ip link set eth0 up
ip route show
ip route get 8.8.8.8
ip route add 10.0.0.0/8 via 192.168.1.1
ip route add default via 192.168.1.1

# Connectivity
ping -c 4 target
traceroute target
mtr target                       # continuous + stats (BEST TOOL)
nc -zv host 443                  # test TCP port
curl -v https://target
curl -o /dev/null -w "%{http_code}" https://url

# DNS
dig hostname
dig hostname @8.8.8.8
dig -x 8.8.8.8                   # reverse DNS
dig +short hostname
dig MX gmail.com
nslookup hostname

# Ports (ss replaces deprecated netstat)
ss -tuln                         # listening TCP+UDP
ss -tulnp                        # + process info
ss -tn state ESTABLISHED
ss -s                            # summary stats
ss -tn state TIME-WAIT | wc -l

# Packet capture
tcpdump -i eth0
tcpdump -i eth0 port 80
tcpdump -i eth0 host 10.0.0.5
tcpdump -i eth0 -w capture.pcap  # save for Wireshark
```

## 10.4 DNS Deep Dive

```bash
# /etc/resolv.conf
nameserver 10.0.0.2
nameserver 8.8.8.8
search example.com

# DNS Record Types
A      → IPv4 address
AAAA   → IPv6 address
CNAME  → Canonical name (alias)
MX     → Mail exchanger
NS     → Name server
PTR    → Reverse lookup
TXT    → Text (SPF, DKIM)
SOA    → Start of Authority

# Troubleshooting
dig +trace hostname              # full resolution trace
systemd-resolve --status         # systemd-resolved
cat /run/systemd/resolve/resolv.conf  # effective DNS
```

> ⚠️ **Common Mistake:** Checking firewall before verifying DNS resolves correctly. Always check DNS first.

---

# MODULE 11: FIREWALL

## 11.1 iptables

```bash
# View
iptables -L -n -v
iptables -L -n -v --line-numbers
iptables -t nat -L -n -v

# Allow rules
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -j DROP        # default deny (LAST RULE)

iptables -I INPUT 1 -s 10.0.0.0/8 -j ACCEPT   # insert first
iptables -D INPUT 5               # delete by line number
iptables -F                       # flush all
iptables-save > /etc/iptables/rules.v4

# NAT
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

## 11.2 firewalld (RHEL 7+)

```bash
firewall-cmd --get-active-zones
firewall-cmd --zone=public --list-all
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=10.0.0.0/8 accept'
firewall-cmd --reload
```

## 11.3 nftables (RHEL 8+)

```bash
nft list ruleset
nft add table ip filter
nft add chain ip filter input { type filter hook input priority 0\; policy drop\; }
nft add rule ip filter input tcp dport 22 accept
nft add rule ip filter input tcp dport { 80, 443 } accept
nft list ruleset > /etc/nftables.conf
```

## 11.4 UFW (Ubuntu)

```bash
ufw enable && ufw status verbose
ufw allow 22 && ufw allow 80/tcp
ufw deny 23
ufw allow from 10.0.0.0/8 to any port 5432
```

## 11.5 Safe Firewall Change Procedure

```bash
# Schedule automatic rollback BEFORE making changes
echo "iptables -F && iptables -P INPUT ACCEPT" | at now + 10 minutes
# Make changes → test SSH in NEW session → if OK, cancel rollback
atq && atrm JOB_NUMBER
```

> 🔒 **Security:** Always schedule rollback before firewall changes. Locking yourself out requires console access.

---

# MODULE 12: SSH & SECURITY

## 12.1 SSH Key Authentication Flow

```
CLIENT                              SERVER
~/.ssh/id_ed25519 (private)         ~/.ssh/authorized_keys
~/.ssh/known_hosts (server FPs)

1. ssh alice@server
2. Server sends host fingerprint
3. Client checks known_hosts (TOFU)
4. DH key exchange → session encryption
5. Server challenges client with random data
6. Client signs with private key
7. Server verifies → access granted
Private key NEVER transmitted
```

## 12.2 SSH Setup

```bash
ssh-keygen -t ed25519 -C "alice@cmg"    # modern (best)
ssh-keygen -t rsa -b 4096               # RSA fallback

ssh-copy-id -i ~/.ssh/id_ed25519.pub alice@server

# Critical permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 600 ~/.ssh/authorized_keys
chmod 644 ~/.ssh/id_ed25519.pub
```

## 12.3 SSH Hardening (/etc/ssh/sshd_config)

```
Port 2222
PermitRootLogin no                # CRITICAL
PasswordAuthentication no         # key-based only
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 20
AllowUsers alice bob jenkins      # whitelist
AllowGroups sshusers
X11Forwarding no
UseDNS no
ClientAliveInterval 300
ClientAliveCountMax 2
Banner /etc/ssh/banner
```

```bash
sshd -t                           # test config BEFORE applying
systemctl reload sshd             # apply (keeps existing sessions)
```

## 12.4 SSH Tunneling & Jump Host

```bash
ssh -J alice@bastion alice@10.0.1.50    # ProxyJump (preferred)
ssh -L 5432:rds.internal:5432 alice@bastion  # local port forward

# ~/.ssh/config
Host bastion
    HostName bastion.cmg.gov.uk
    User alice
    IdentityFile ~/.ssh/cmg_ed25519

Host internal-web
    HostName 10.0.1.50
    User ec2-user
    ProxyJump bastion
```

## 12.5 SELinux Deep Dive

```bash
getenforce                        # Enforcing/Permissive/Disabled
sestatus
setenforce 0                      # temporary Permissive (debug only)
setenforce 1                      # back to Enforcing

# Fix denials (NEVER just disable)
ausearch -m avc -ts recent        # see denials
ls -Z /var/www/html/              # show context
restorecon -Rv /var/www/html/     # restore default context
chcon -t httpd_sys_content_t file # change temporarily
semanage fcontext -a -t httpd_sys_content_t "/custom(/.*)?"
restorecon -Rv /custom/
sealert -a /var/log/audit/audit.log  # human-readable
audit2allow -a                    # suggest policy
getsebool -a | grep httpd
setsebool -P httpd_can_network_connect on
```

## 12.6 AppArmor (Ubuntu)

```bash
aa-status
aa-enforce /usr/sbin/nginx
aa-complain /usr/sbin/nginx       # log only
apparmor_parser -r /etc/apparmor.d/usr.sbin.nginx
```

---

# MODULE 13: STORAGE, LVM & FILESYSTEMS

## 13.1 LVM Architecture

```
Physical Disks / EBS Volumes
   /dev/nvme0n1   /dev/nvme1n1
         │              │
         ▼              ▼
   Physical Volumes (PV) ← pvcreate
         └──────────────┘
                │
                ▼
      Volume Group (VG) ← vgcreate (pool)
                │
                ▼
      Logical Volumes (LV) ← lvcreate
      lv_app(100G)  lv_logs(80G)
                │
                ▼
      Filesystem (mkfs.xfs / mkfs.ext4)
                │
                ▼
      Mount Point (/app, /var/log)
```

## 13.2 LVM Commands

```bash
pvcreate /dev/nvme1n1
pvs && pvdisplay

vgcreate vgdata /dev/nvme1n1 /dev/nvme2n1
vgextend vgdata /dev/nvme3n1
vgs && vgdisplay vgdata

lvcreate -L 50G -n lv_app vgdata
lvcreate -l 100%FREE -n lv_data vgdata
lvs && lvdisplay

mkfs.xfs /dev/vgdata/lv_app
mkdir /app && mount /dev/vgdata/lv_app /app
echo "/dev/vgdata/lv_app /app xfs defaults 0 2" >> /etc/fstab
```

## 13.3 Online LVM Expansion (Zero Downtime)

```bash
pvcreate /dev/nvme3n1
vgextend vgdata /dev/nvme3n1
lvextend -l +100%FREE /dev/vgdata/lv_app
xfs_growfs /app              # XFS: mount point
resize2fs /dev/vgdata/lv_app # ext4: device
df -h /app                   # verify
```

## 13.4 LVM Snapshots

```bash
lvcreate -L 5G -s -n snap_app /dev/vgdata/lv_app
mount -o ro /dev/vgdata/snap_app /mnt/snapshot
umount /mnt/snapshot
lvremove /dev/vgdata/snap_app
```

## 13.5 Filesystem Comparison

| FS | Max File | Grow | Shrink | Default | Best For |
|----|---------|------|--------|---------|---------|
| ext4 | 16TB | Yes | Yes | Ubuntu | General purpose |
| XFS | 8EB | Yes | NO | RHEL/AL | Large files, parallel I/O |
| Btrfs | 16EB | Yes | Yes | SLES | Snapshots, CoW |
| tmpfs | RAM | - | - | All | /tmp, /run |

## 13.6 Disk Commands

```bash
lsblk -f                      # devices + FS + UUID
blkid /dev/nvme1n1            # get UUID for fstab
fdisk -l                      # partition details
fdisk /dev/sdb                # interactive partitioner
df -h && df -hT && df -i      # usage, type, inodes
du -sh /var/* | sort -rh | head
lsof | grep deleted           # deleted-but-open files
fsck -f /dev/sdb1             # ext4 repair (unmounted)
xfs_repair /dev/sdb1          # XFS repair (unmounted)
```

## 13.7 RAID

```bash
# RAID levels
RAID 0  → Striping: performance, NO redundancy
RAID 1  → Mirroring: full redundancy, 50% storage
RAID 5  → Parity: can lose 1 disk
RAID 6  → Double parity: can lose 2 disks
RAID 10 → Stripe of mirrors: performance + redundancy

# mdadm
mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
mdadm --detail /dev/md0
cat /proc/mdstat
mdadm --detail --scan >> /etc/mdadm.conf
```

## 13.8 NFS

```bash
# Server
yum install nfs-utils
systemctl enable --now nfs-server

# /etc/exports
/data/shared  192.168.1.0/24(rw,sync,no_root_squash)
/backup       10.0.0.0/8(ro,sync)

# Options: rw/ro, sync/async, root_squash(default), no_root_squash(RISK)
exportfs -ra                  # apply exports
exportfs -v                   # view

# Client
showmount -e nfs-server-ip
mount -t nfs nfs-server:/data /mnt/nfs
# fstab:
nfs-server:/data  /mnt/nfs  nfs  defaults,_netdev  0  0
```

## 13.9 Samba/CIFS

```bash
yum install samba samba-client
# /etc/samba/smb.conf → [shared] section
systemctl enable --now smb nmb
smbpasswd -a alice

# Client mount
mount -t cifs //server/shared /mnt/cifs -o username=alice,password=pass
```

---

# MODULE 14: SYSTEMD & JOURNALD

## 14.1 systemctl Commands

```bash
systemctl start/stop/restart/reload/status nginx
systemctl enable nginx            # start at boot
systemctl disable nginx
systemctl enable --now nginx      # enable AND start (one command)
systemctl is-active nginx         # scripting check
systemctl is-enabled nginx

systemctl list-units --failed     # FIRST check on boot issues
systemctl list-unit-files
systemctl daemon-reload           # re-read unit files after editing
```

## 14.2 Service Unit File

```ini
[Unit]
Description=CMG Application
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/cmgapp
EnvironmentFile=/etc/cmgapp/env.conf
ExecStart=/opt/cmgapp/bin/start --port 8080
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal
MemoryMax=4G
CPUQuota=200%
OOMScoreAdjust=-1000

[Install]
WantedBy=multi-user.target
```

## 14.3 systemd Timers

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Daily Backup Timer

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

```bash
systemctl daemon-reload
systemctl enable --now backup.timer
systemctl list-timers
```

## 14.4 journalctl

```bash
journalctl -u nginx              # service logs
journalctl -u nginx -f           # follow live
journalctl -u nginx -n 100
journalctl -b                    # current boot
journalctl -b -1                 # PREVIOUS boot (crash diagnosis)
journalctl -p err                # errors only
journalctl --since "1 hour ago"
journalctl --since "2026-07-01 09:00" --until "2026-07-01 10:00"
journalctl --disk-usage
journalctl --vacuum-size=500M
journalctl -k                    # kernel messages only

# Make persistent
mkdir -p /var/log/journal
systemctl restart systemd-journald
```

> ⚠️ **Common Mistake:** systemctl enable does NOT start service immediately. Use enable --now.

---

# MODULE 15: LOGGING

## 15.1 Log Files

| File | Content |
|------|---------|
| /var/log/messages | General system (RHEL). Ubuntu: /var/log/syslog |
| /var/log/secure | SSH, sudo, PAM. Ubuntu: /var/log/auth.log |
| /var/log/cron | Cron execution |
| /var/log/dmesg | Kernel ring buffer |
| /var/log/audit/audit.log | auditd security events |
| /var/log/nginx/access.log | nginx access |
| /var/log/wtmp | Login history (read: last) |
| /var/log/btmp | Failed logins (read: lastb) |

## 15.2 Log Analysis

```bash
tail -f /var/log/messages
grep "ERROR" /var/log/app.log
grep -i "fail\|error\|warn" /var/log/messages
grep -E "ERROR|WARN|CRIT" app.log
grep -A3 -B3 "CRITICAL" app.log

# Failed SSH attacks
grep "Failed password" /var/log/secure | awk '{print $11}' | sort | uniq -c | sort -rn

# Kernel messages
dmesg -T && dmesg | grep -i "error\|oom\|fail"
last && lastb && lastlog
```

## 15.3 logrotate

```
/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    postrotate
        kill -USR1 $(cat /var/run/nginx.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
```

```bash
logrotate -d /etc/logrotate.d/nginx   # dry run
logrotate -f /etc/logrotate.d/nginx   # force now
```

## 15.4 auditd

```bash
yum install audit
systemctl enable --now auditd

# /etc/audit/rules.d/audit.rules
-w /etc/passwd -p wa -k passwd_changes
-w /etc/sudoers -p wa -k sudoers_changes
-w /etc/shadow -p wa -k shadow_changes

auditctl -l                     # list active rules
ausearch -k passwd_changes
ausearch -m avc -ts recent      # SELinux denials
ausearch -ua alice -ts today
aureport --failed --summary
```

---

# MODULE 16: PERFORMANCE TUNING

## 16.1 USE Method

- **U** — Utilization: how busy?
- **S** — Saturation: queue building up?
- **E** — Errors: errors occurring?

## 16.2 CPU

```bash
top && htop
mpstat -P ALL 1                  # per-CPU stats
sar -u 1 10
perf top                         # hottest functions
perf record -g -p PID
perf report
```

## 16.3 Memory

```bash
free -h && vmstat 1 10 && sar -r 1 10
ps aux --sort=-%mem | head
ps -eo pid,rss,vsz,cmd --sort=-rss | head
pmap -x PID
```

## 16.4 Disk I/O

```bash
iostat -x 1
# %util near 100% = bottleneck
# await = avg I/O wait time (ms)
iotop -bo
sar -d 1 10
echo mq-deadline > /sys/block/sda/queue/scheduler
# noop/none=SSD/VM, mq-deadline=RHEL8, kyber=NVMe
```

## 16.5 Network

```bash
sar -n DEV 1 10
iftop && nethogs
iperf3 -c server-ip
ping -c 100 target | tail -1
mtr target
```

---

# MODULE 17: SHELL SCRIPTING

## 17.1 Script Template

```bash
#!/bin/bash
set -euo pipefail
# -e: exit on error
# -u: unset variable = error (prevents rm -rf $UNDEFINED/)
# -o pipefail: pipe error propagates

readonly LOG_FILE="/var/log/deploy.log"
log() { echo "[$(date +%H:%M:%S)] [$1] ${*:2}" | tee -a "$LOG_FILE"; }
```

## 17.2 Variables

```bash
NAME="production"
PORT=${1:-8080}              # default if not set
DATE=$(date +%Y%m%d)        # command substitution
readonly MAX=3               # constant

# Special: $0=name $1-$9=args $@=all $#=count $?=exit $$=PID
```

## 17.3 Conditions

```bash
if [[ "$ENV" == "prod" ]]; then
    echo "Production"
elif [[ "$ENV" == "staging" ]]; then
    echo "Staging"
else
    exit 1
fi

# Tests: -f file  -d dir  -z empty  -n not-empty
# Numeric: -eq -ne -gt -lt -ge -le
# [[ ]] supports regex: [[ "$str" =~ ^[0-9]+$ ]]
```

## 17.4 Loops

```bash
for server in web01 web02 web03; do
    ssh "$server" "sudo systemctl restart app"
done

while IFS= read -r line; do
    echo "$line"
done < /etc/hosts

for ((i=0; i<10; i++)); do echo "$i"; done
```

## 17.5 Functions & Error Handling

```bash
check_service() {
    local svc="$1"
    systemctl is-active --quiet "$svc" && return 0 || return 1
}

TMPDIR=$(mktemp -d)
trap "rm -rf '$TMPDIR'" EXIT
trap "log ERROR at line $LINENO" ERR
```

## 17.6 Advanced Features

```bash
# Arrays
servers=("web01" "web02" "web03")
echo "${servers[@]}" && echo "${#servers[@]}"
servers+=("web04")

# String manipulation
echo "${str,,}"           # lowercase
echo "${str^^}"           # uppercase
echo "${str/old/new}"     # replace
echo "${str:0:5}"         # substring

# getopts
while getopts "e:v:h" opt; do
    case $opt in
        e) ENV="$OPTARG" ;;
        v) VERSION="$OPTARG" ;;
        h) usage; exit 0 ;;
    esac
done
```

---

# MODULE 18: CRON & SCHEDULING

## 18.1 Cron Syntax

```
# min hour day month weekday command
  *   *    *   *     *       command

*  = every     ,  = list (0,30)
-  = range (1-5)  /  = step (*/15)

@reboot  @daily  @weekly  @hourly
```

## 18.2 Examples

```bash
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
0 1 * * * find /var/log/app -name "*.log" -mtime +30 -delete
*/15 * * * * /opt/scripts/health-check.sh
0 9-17 * * 1-5 /opt/scripts/report.sh
@reboot /opt/monitoring/agent.sh &
```

## 18.3 Management

```bash
crontab -e && crontab -l
crontab -r    # DELETE ALL — no confirmation, no undo!
crontab -u alice -e
/etc/crontab  /etc/cron.d/  /etc/cron.daily/
```

## 18.4 Troubleshooting

| Problem | Check |
|---------|-------|
| Not running | systemctl status crond; grep CRON /var/log/cron |
| Command not found | Use FULL PATHS /usr/bin/python3 |
| No output | Add >> /var/log/job.log 2>&1 |
| Permission | chmod +x /opt/scripts/backup.sh |
| Test | sudo -u cronuser /opt/scripts/backup.sh |

---

# MODULE 19: CONTAINERS

## 19.1 Linux Kernel Primitives

```
Namespaces (isolation):
  pid, net, mnt, uts, ipc, user

cgroups (resource limits):
  cpu, memory, blkio, net_cls

OverlayFS (image layers):
  Read-only image layers + Read-write container layer (CoW)

seccomp:
  Filter allowed syscalls (Docker drops ~44 by default)
```

## 19.2 Docker

```bash
docker run -d -p 80:80 --name web nginx
docker ps && docker ps -a
docker stop/start/rm container_id
docker rm -f container_id
docker pull nginx:1.24 && docker images && docker rmi nginx
docker build -t myapp:1.0 .
docker push registry/myapp:1.0
docker logs -f container_id
docker exec -it container_id bash
docker stats && docker inspect container_id
docker system df && docker system prune -a
```

## 19.3 Dockerfile Best Practices

```dockerfile
FROM amazonlinux:2023
WORKDIR /app
COPY requirements.txt .
RUN yum update -y && yum install -y python3 && yum clean all
COPY . .
RUN useradd -r -s /sbin/nologin appuser && chown -R appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s CMD curl -f http://localhost:8080/health || exit 1
CMD ["python3", "app.py"]
```

## 19.4 Podman

```bash
# Daemon-less, rootless Docker alternative
podman run nginx && podman ps && podman images
podman generate systemd --name myapp --files
systemctl --user enable --now container-myapp
```

---

# MODULE 20: BACKUP & RECOVERY

## 20.1 tar

```bash
tar -czvf /backup/etc-$(date +%Y%m%d).tar.gz /etc/
tar -cJvf backup.tar.xz /data/           # xz: better compression
tar -tzvf backup.tar.gz                   # list contents
tar -xzvf backup.tar.gz -C /restore/
tar -czvf backup.tar.gz /data/ --exclude="*.log"
```

## 20.2 rsync

```bash
rsync -av /source/ /destination/
rsync -avz -e "ssh -i ~/.ssh/key" /data/ user@backup:/backup/
rsync -av --delete --exclude="*.tmp" --progress --bwlimit=10000 /src/ /dst/
rsync -av --link-dest=/backup/previous/ /data/ /backup/$(date +%Y%m%d)/
rsync -avn /source/ /dest/               # dry run
```

## 20.3 LUKS Encryption

```bash
cryptsetup luksFormat /dev/sdb1
cryptsetup open /dev/sdb1 myencrypted
mkfs.ext4 /dev/mapper/myencrypted
mount /dev/mapper/myencrypted /mnt/secure
umount /mnt/secure && cryptsetup close myencrypted

# Auto-open: /etc/crypttab
myencrypted  /dev/sdb1  /etc/keys/secret.key  luks

cryptsetup luksDump /dev/sdb1
cryptsetup luksAddKey /dev/sdb1          # add backup key
```

---

# MODULE 21: SAP HANA ON LINUX

## 21.1 Kernel Parameters

```bash
# /etc/sysctl.d/sap-hana.conf
vm.swappiness = 10
kernel.numa_balancing = 0
kernel.randomize_va_space = 0     # ASLR off (SAP requirement)
vm.max_map_count = 2147483647
fs.file-max = 20000000
net.ipv4.tcp_slow_start_after_idle = 0
```

## 21.2 Huge Pages

```bash
# HANA_MEMORY_GB * 1024 / 2 = number of 2MB huge pages
# Example: 256GB HANA → 131072 huge pages
echo 131072 > /proc/sys/vm/nr_hugepages
echo "vm.nr_hugepages = 131072" >> /etc/sysctl.d/sap-hana.conf
grep HugePages /proc/meminfo
```

## 21.3 NUMA

```bash
numactl --hardware
numastat -n
numactl --cpunodebind=0 --membind=0 /usr/sap/HDB/start.sh
echo 0 > /proc/sys/kernel/numa_balancing  # disable for HANA
```

## 21.4 Filesystem Layout

```
/hana/data    → XFS, NVMe (data volumes)
/hana/log     → XFS, NVMe separate spindle (log volumes)
/hana/shared  → NFS or local (shared files)
/hana/backup  → large storage
/usr/sap      → SAP software

# Mount options
/dev/vg_hana/lv_data  /hana/data  xfs  noatime,nodiratime,logbsize=256k  0 2
```

## 21.5 saptune (SLES)

```bash
saptune solution list
saptune solution apply HANA
saptune solution verify HANA
saptune status
```

---

# MODULE 22: HIGH AVAILABILITY

## 22.1 HA Concepts

| Concept | Description |
|---------|-------------|
| Active/Passive | One active, one standby. Failover on failure. |
| Active/Active | Both serve traffic. Load balanced. |
| Split-brain | Both nodes think primary. Data corruption risk. |
| Quorum | Voting to prevent split-brain. Needs 3+ nodes. |
| STONITH | Fencing — force-stop the other node to prevent split-brain. |
| VIP | Virtual IP floats between nodes. Clients connect to VIP. |
| RTO | Recovery Time Objective — max acceptable downtime. |
| RPO | Recovery Point Objective — max acceptable data loss. |

## 22.2 Pacemaker + Corosync

```bash
yum install pacemaker corosync pcs fence-agents
pcs cluster auth node1 node2 -u hacluster -p password
pcs cluster start --all
pcs status
pcs resource create VirtualIP IPaddr2 ip=10.0.0.100 cidr_netmask=24
pcs resource create WebService systemd:nginx op monitor interval=30s
pcs constraint colocation add WebService with VirtualIP INFINITY
```

## 22.3 DRBD

```bash
# /etc/drbd.d/mydata.res
resource mydata {
    on node1 { device /dev/drbd0; disk /dev/sdb1; address 10.0.0.1:7789; }
    on node2 { device /dev/drbd0; disk /dev/sdb1; address 10.0.0.2:7789; }
}

drbdadm create-md mydata && drbdadm up mydata
drbdadm primary --force mydata    # make primary
drbdadm status && cat /proc/drbd
```

---

# MODULE 23: DISTRO-SPECIFIC

## 23.1 RHEL

```bash
subscription-manager register
subscription-manager attach --pool=POOL_ID
subscription-manager repos --enable=rhel-9-for-x86_64-baseos-rpms
# SELinux enforcing by default
# firewalld default
# cockpit: systemctl enable --now cockpit.socket → https://host:9090
```

## 23.2 Ubuntu

```bash
# Netplan: /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: true
netplan apply

# UFW
ufw enable && ufw allow 22 && ufw allow 80/tcp

# Snap
snap install aws-cli --classic
snap list && snap refresh

# AppArmor default
aa-status
```

## 23.3 SLES

```bash
zypper refresh && zypper update
zypper install nginx
zypper patterns
zypper install -t pattern sap_hana
saptune solution apply HANA
yast2                                  # GUI admin tool
supportconfig -t /tmp/support/        # collect support data
```

---

# MODULE 24: PRODUCTION SCENARIOS

## Scenario 1: Server Not Reachable
**Symptoms:** SSH timeout  
**Steps:** ping → nc -zv host 22 → mtr → AWS console (SG, instance state) → SSM Session Manager  
**Fix:** Restore SG rule / fix sshd / fix disk full  
**Prevent:** SSM always enabled, disk alerts at 75%, SG via Terraform

## Scenario 2: Disk Full
**Symptoms:** "No space left on device"  
**Steps:** df -h → du -sh /var/* | sort -rh → lsof | grep deleted → truncate log → systemctl reload nginx  
**Fix:** Fix logrotate, reduce log level, LVM expansion  
**Prevent:** logrotate all logs, alert at 75-80%

## Scenario 3: High CPU
**Symptoms:** Sluggish responses, load average high  
**Steps:** top → ps --sort=-%cpu → top -H -p PID (threads) → jstack (Java) → perf top  
**Fix:** Fix infinite loop, kill runaway, renice batch jobs, scale out  
**Prevent:** Load average alerts, profiling in staging

## Scenario 4: OOM Kill
**Symptoms:** Application disappears  
**Steps:** dmesg | grep -i "killed\|oom" → free -h → vmstat (si/so) → jmap -heap PID  
**Fix:** Capture heap dump → analyze MAT → fix memory leak  
**Prevent:** JVM -Xmx limits, container memory limits, heap alerts

## Scenario 5: Jenkins Agent Down
**Symptoms:** Agent offline in Jenkins UI  
**Steps:** ping → SSH → systemctl status jenkins-agent → journalctl -u jenkins-agent → df -h  
**Fix:** Clear workspace, restart agent  
**Prevent:** Ephemeral agents, disk alerts, Kubernetes agents

## Scenario 6: Service Won't Start
**Symptoms:** systemctl start fails  
**Steps:** systemctl status → journalctl -u svc -n 100 → ss -tuln (port conflict) → run manually as service user → ausearch -m avc (SELinux)  
**Fix:** Fix config / port conflict / SELinux context

## Scenario 7: DNS Resolution Failure
**Symptoms:** "Could not resolve host"  
**Steps:** dig hostname → cat /etc/resolv.conf → cat /etc/hosts → AWS: VPC DNS enabled? Route53 zone associated?  
**Fix:** Correct resolv.conf or VPC DNS association

## Scenario 8: Filesystem Corruption
**Symptoms:** "Input/output error", dmesg disk errors  
**Steps:** dmesg | grep -E "error|EIO|sda" → smartctl -a /dev/sda → mount -o remount,ro  
**Fix:** fsck (ext4) or xfs_repair (XFS) when unmounted. AWS: restore from EBS snapshot.

## Scenario 9: Log Rotation Failure
**Symptoms:** /var/log at 95%, logrotate not rotating  
**Steps:** logrotate -d → check error → check directory ownership  
**Fix:** chown appuser:appuser /var/log/app/ → logrotate -f

## Scenario 10: 3 AM Production Outage RCA
```
02:47 Monitor alert: WebSphere down
02:49 SSH works. systemctl status websphere → failed
02:51 journalctl: "ORA-12541: TNS:no listener"
02:53 Oracle listener down on DB server
03:00 DB team restarts listener
03:05 systemctl start websphere → success

ROOT CAUSE: Oracle listener OOM-killed (no swap on small DB VM)
FIX: Add swap, increase VM size
PREVENT: OOM protection for Oracle, DB dependency health checks
```

---

# MODULE 25: INTERVIEW MASTER Q&A

## Beginner Level

| Question | Answer |
|----------|--------|
| What is Linux? | Open-source monolithic kernel (1991, GPL). GNU+kernel = GNU/Linux. |
| What is a shell? | Command interpreter. bash, sh, zsh. bash is superset of sh. |
| chmod 755 meaning? | Owner=rwx(7), group=r-x(5), others=r-x(5). Standard for scripts. |
| What is /etc/passwd? | User accounts: user:x:UID:GID:comment:home:shell. World-readable. Passwords in /etc/shadow. |
| How to kill process? | kill -15 PID (SIGTERM, graceful first). kill -9 PID (SIGKILL, last resort). |
| What is df -h? | Filesystem disk usage human-readable. Focus on Avail and Use%. |
| What is zombie process? | Dead process whose parent hasn't called wait(). Z state. Fix: kill parent. |
| How to check memory? | free -h. "available" column = real usable RAM. NOT "free". |
| What is cron? | Job scheduler. crontab -e. min hour day month weekday command. |
| What is SSH? | Secure Shell. Encrypted remote. Port 22. Key-based auth preferred. |
| What is /proc? | Virtual FS. Live kernel+process data in RAM, not disk. |
| Hard vs soft link? | Hard=same inode (survives deletion). Soft=path pointer (breaks if deleted). |
| Check listening ports? | ss -tuln (modern, replaces netstat). Add -p for process. |
| What is tail -f? | Follow log live as new lines written. |
| What is root? | UID 0. Bypasses all permissions. Disable SSH login. |

## Intermediate Level

| Question | Answer |
|----------|--------|
| Explain LVM | PV→VG→LV→mkfs→mount. Online resize: lvextend+xfs_growfs/resize2fs. |
| What is OOM killer? | Kills processes when RAM+swap full. Score by RSS. Protect: oom_score_adj=-1000. |
| ext4 vs XFS? | ext4: can shrink, general. XFS: NO shrink, fast large files, RHEL/AL default. |
| What is load average? | 1/5/15-min avg of runnable+D-state. Divide by CPU count. >1/core = overloaded. |
| enable vs start? | enable=boot config. start=now. enable --now=both. Independent. |
| What is SELinux? | MAC system. Labels files/processes. Policy enforced by kernel. |
| usermod -G vs -aG? | -G REPLACES all groups. -aG APPENDS. ALWAYS use -a. |
| What is daemon-reload? | Re-reads unit files. REQUIRED after editing ANY .service file. |
| Docker kernel features? | Namespaces(isolation)+cgroups(limits)+OverlayFS(layers)+seccomp. |
| What is swappiness? | vm.swappiness: 0=avoid 60=default 10=servers. |
| LVM online expansion? | lvextend → xfs_growfs (XFS) or resize2fs (ext4). Zero downtime. |
| UUID in fstab? | Stable FS ID from blkid. /dev/sdX can change order on reboot. |
| SSH key auth? | Public on server in authorized_keys. Client signs challenge with private key. |
| What is logrotate? | Cron-based rotation. /etc/logrotate.d/. Test: logrotate -d. |
| Debug cron not running? | crond status, /var/log/cron, full paths, permissions, redirect output. |

## Senior / SRE Level

| Question | Answer |
|----------|--------|
| Virtual memory? | MMU: VA→PA via page tables. Demand paging. CoW for fork(). Overcommit allowed. |
| CFS scheduler? | Completely Fair Scheduler. Red-black tree by vruntime. Fair share by weight. |
| Inode exhaustion? | df shows space but can't create files. df -i shows 100% inodes. |
| What is TIME_WAIT? | TCP after close, waits 2×MSL. Fix: net.ipv4.tcp_tw_reuse=1 |
| What are capabilities? | Fine-grained root privs. setcap cap_net_bind_service=+ep. Replaces SUID. |
| What is eBPF? | Sandboxed kernel programs without modules. Cilium, Falco, bpftrace. |
| What is kdump? | Kernel crash dump → /var/crash. Analyze: crash + vmcore. |
| I/O scheduler? | /sys/block/sda/queue/scheduler. none=SSD, mq-deadline=RHEL8, kyber=NVMe. |
| LUKS encryption? | cryptsetup luksFormat→open→mkfs→mount. /etc/crypttab for auto-open. |
| Thin LVM? | Overprovisioned from thin pool. Risk: pool full = ALL LVs fail. |
| Profile high-CPU Java? | top -H -p PID → jstack PID → perf record -g + perf report. |
| Recover bad fstab? | GRUB edit: systemd.unit=rescue.target or rd.break. Fix fstab. mount -a. |
| What is NUMA? | CPU accesses local RAM faster. numactl for latency-sensitive apps. |
| cgroups v2? | Unified hierarchy RHEL9+/Ubuntu22+. cpu.max, memory.max per service. |
| What is OverlayFS? | Union FS. Read-only image layers + read-write container layer (CoW). |

---

# MODULE 26: INTERVIEW DO'S AND DON'Ts

## Never Say These

| Wrong | Right |
|-------|-------|
| chmod 777 fixes permissions | Apply minimum required. find / -perm /4000 for SUID audit. |
| Disable SELinux to fix access denied | ausearch -m avc → restorecon or semanage fcontext |
| kill -9 is standard | SIGTERM first, wait 10s, then SIGKILL if unresponsive |
| Restart server when something breaks | Capture diagnostics first — journalctl, thread dumps |
| "free" = available memory | "available" = real usable. "free" = unused only. |
| Edit /boot/grub2/grub.cfg directly | Edit /etc/default/grub then grub2-mkconfig |
| usermod -G group (no -a) | usermod -aG group — without -a removes all other groups |
| /dev/sda1 in fstab | UUID from blkid |
| Linux = Unix | Linux is Unix-LIKE (POSIX). Shares no source code. |
| ifconfig / netstat | ip addr and ss — legacy tools not installed on minimal images |

## Senior-Level Phrases

- "I apply the **USE methodology** — Utilization, Saturation, Errors — across CPU, Memory, Disk, Network"
- "I capture diagnostics **before** any intervention that might destroy evidence"
- "I correlate **journald, application logs, and kernel ring buffer** to build an incident timeline"
- "I apply **least-privilege** and audit SUID/SGID bits regularly"
- "I fix SELinux using **ausearch → restorecon** — not by disabling it"
- "**Swap is a safety net, not a solution** — I identify the root cause of memory pressure"
- "For recurring tasks I prefer **systemd timers** over cron — better journald integration"

## CMG Project Context

| Topic | Context |
|-------|---------|
| OS | Amazon Linux 2 / AL2023 on EC2 |
| Containers | Docker + EKS (Kubernetes) worker nodes |
| CI/CD | Jenkins on EC2 agents |
| IaC | Terraform from Jenkins agents |
| Config Mgmt | Ansible playbooks for EC2 |
| Applications | WebSphere, Siebel CRM, BPM |
| Code Quality | SonarQube, Trivy in Jenkins pipeline |
| Access | SSH key-only, PermitRootLogin no, SSM Session Manager |

---

# MODULE 27: CHEAT SHEET

## Commands by Category

```bash
# File & Directory
ls -lah  find / -name "*.log" -mtime +30  du -sh /var/* | sort -rh
tar -czvf archive.tar.gz dir/  tar -xzvf  rsync -av --delete
ln -sf target link  diff file1 file2  wc -l file

# Text Processing
grep -irn "error"  awk -F: '{print $1}'  sed 's/old/new/g'
cut -d: -f1  sort | uniq -c | sort -rn  tail -f log  head -20

# Process
ps aux --sort=-%cpu  top (P=CPU M=MEM 1=core k=kill)  pgrep -a java
kill -15 PID  kill -9 PID  renice -n 10 -p PID  pstree -p

# Services
systemctl start/stop/restart/status/enable/disable/is-active
systemctl daemon-reload  journalctl -u svc -f -b -p err

# Network
ip addr show  ss -tulnp  ping -c4  dig +short  mtr target
nc -zv host 443  tcpdump -i eth0 port 80  ip route get 8.8.8.8

# Storage
lsblk -f  blkid  fdisk  mkfs.xfs  mount  df -h  du -sh
lsof | grep deleted  df -i

# LVM
pvcreate → vgcreate → lvcreate → mkfs → mount
lvextend → xfs_growfs or resize2fs  pvs/vgs/lvs

# Performance
uptime  vmstat 1  iostat -x 1  sar -u/-r/-d  free -h
iotop -bo  perf top  dmesg -T  mpstat -P ALL 1

# Security
find / -perm /4000  ausearch -m avc  getenforce  restorecon
passwd -l user  chage -l user  iptables -L -n -v
firewall-cmd --list-all

# SSH
ssh-keygen -t ed25519  ssh-copy-id  ssh -J bastion target
scp -r dir/ user@host:  ssh -vvv  sshd -t
```

## Top 30 Concepts (Last-Minute Revision)

1. Kernel = core OS. GNU+Kernel = Distribution.
2. Everything is a file — /dev, /proc, /sys are all files.
3. /etc=configs, /var=logs(disk-full risk), /opt=3rd-party, /proc+/sys=virtual.
4. r=4, w=2, x=1. 755=scripts, 644=files, 600=secrets, 700=~/.ssh.
5. SUID(4xxx)=run as owner, SGID(2xxx)=group inherit, Sticky(1xxx)=/tmp.
6. /etc/passwd=metadata(world-readable). /etc/shadow=hashes(root only).
7. sudo=per-command+audit+your-pass. su=full-session+no-audit. Use sudo.
8. Process: R=running, S=sleeping, D=I/O(cannot kill), Z=zombie, T=stopped.
9. SIGTERM(15)=graceful(catchable). SIGKILL(9)=immediate(uncatchable). Try 15 first.
10. Load avg / CPU count. >1.0 per core = overloaded. Includes D-state (I/O).
11. free -h "available" = real usable RAM. "free" = unused only.
12. OOM kills when RAM+swap full. dmesg | grep -i killed.
13. df=filesystem space. du=directory content. lsof|grep deleted=phantom space.
14. LVM: pvcreate→vgcreate→lvcreate→mkfs→mount. lvextend+xfs_growfs=online resize.
15. fstab: UUID(blkid). Test: mount -a. Bad fstab = boot failure.
16. systemd: enable=boot, start=now, --now=both. daemon-reload after unit edits.
17. journalctl -u -f -b. -b -1=previous boot (crash). -p err=errors only.
18. SSH: private on client, public in authorized_keys. chmod 700/.ssh, 600/keys.
19. SELinux: enforcing=blocks. NEVER disable. ausearch→restorecon.
20. Docker = namespaces(isolation)+cgroups(limits)+OverlayFS(layers).
21. XFS: cannot shrink, high perf, RHEL/AL default. ext4: can shrink, general.
22. ss -tuln(listening). ss -tulnp(+PIDs). Replaces deprecated netstat.
23. iostat %util near 100% = disk bottleneck. vmstat si/so>0 = swapping.
24. Cron: min hour day month weekday. crontab -r = DELETE ALL (no undo!).
25. Boot: BIOS/UEFI → GRUB2 → vmlinuz+initramfs → systemd PID1 → login.
26. find -perm /4000=SUID, -size +100M=large, -mtime +30=old.
27. Capabilities replace SUID. setcap cap_net_bind_service=+ep binary.
28. eBPF = kernel observability without modules. Cilium, Falco, Datadog.
29. set -euo pipefail in every bash script. -u prevents rm -rf $UNDEFINED/.
30. Investigate → Root cause → Fix → Prevent. NEVER restart without understanding why.

---

# OFFICIAL DOCUMENTATION REFERENCES

| Topic | URL |
|-------|-----|
| Linux Kernel | https://www.kernel.org/doc/html/latest/ |
| RHEL 9 | https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9 |
| Ubuntu | https://help.ubuntu.com/ |
| SLES | https://documentation.suse.com/ |
| systemd | https://systemd.io/ |
| SELinux | https://selinuxproject.org/ |
| PAM | http://www.linux-pam.org/Linux-PAM-html/ |
| Docker | https://docs.docker.com/ |
| Podman | https://podman.io/docs |
| Pacemaker | https://clusterlabs.org/pacemaker/doc/ |
| SAP HANA Linux | https://help.sap.com/docs/SAP_HANA_PLATFORM |
| Brendan Gregg | https://www.brendangregg.com/linuxperf.html |
| iptables/netfilter | https://netfilter.org/documentation/ |
| LVM | https://sourceware.org/lvm2/ |

---

*End of Linux-Handbook-2026-07-v1.md*  
*Total: 27 Modules | All chat history + uploaded docs + master prompt content included*  
*Next: Linux-Handbook-2026-08-v2.md (August 2026) — new content only, cross-references to v1*


---

---

# ═══════════════════════════════════════════════════════
# PART 2: COMPLETE NOTES + INTERVIEW PREPARATION
# ═══════════════════════════════════════════════════════

> **Note:** Part 1 (above) = Full Handbook (27 modules, concepts + commands).
> **Part 2 (below)** = Condensed Notes + Interview Q&As (3-level answers) + CMG context + Do's & Don'ts.
> Together = complete study + interview preparation in ONE file.

---

# NOTES SECTION 1: LINUX FUNDAMENTALS — QUICK NOTES

## Key Points to Remember

| Concept | Remember This |
|---------|--------------|
| Linux | Open-source monolithic kernel (1991, Linus Torvalds, GPL v2) |
| GNU/Linux | Kernel + GNU tools = complete OS |
| Unix vs Linux | Linux is Unix-LIKE (POSIX) but shares NO Unix source code |
| Distros | RHEL/Rocky/Alma (DNF/RPM), Ubuntu/Debian (APT/deb), Amazon Linux (AWS), SLES (zypper/SAP) |
| CMG project | Amazon Linux 2/AL2023 on EC2 — EKS, Jenkins, Terraform, Ansible, Docker, WebSphere |

## Architecture Layers (top to bottom)

```
User Applications → GNU Tools/glibc → System Calls → Linux Kernel → Hardware
```

## Kernel manages
- **Processes** — CFS scheduler, fork/exec, signals, namespaces, cgroups
- **Memory** — virtual memory, MMU, page tables, OOM killer, swap
- **Drivers** — hardware abstraction via loadable modules
- **VFS** — makes ext4/XFS/NFS look same to apps
- **Network** — TCP/IP stack, iptables/nftables hooks
- **Security** — capabilities, SELinux/AppArmor, seccomp, audit

---

# NOTES SECTION 2: BOOT PROCESS — QUICK NOTES

## Boot Flow (must memorize)
```
POWER ON → BIOS/UEFI (POST) → GRUB2 (loads vmlinuz+initramfs)
→ Kernel init (hardware detect, memory setup)
→ initramfs (temporary root, loads drivers for LVM/LUKS/RAID)
→ systemd PID 1 (sysinit→basic→multi-user.target)
→ LOGIN PROMPT
```

## Key Files
```bash
/etc/default/grub          # Edit this — NEVER edit grub.cfg directly
/boot/grub2/grub.cfg       # Auto-generated by grub2-mkconfig
grub2-mkconfig -o /boot/grub2/grub.cfg   # BIOS regenerate
grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg  # UEFI
```

## Recovery (GRUB edit — add to kernel line)
```
systemd.unit=rescue.target    # rescue shell
rd.break                       # initramfs shell (password reset)
```

## Root Password Reset
```bash
# Boot with rd.break, then:
mount -o remount,rw /sysroot
chroot /sysroot
passwd root
touch /.autorelabel    # SELinux
exit && reboot
```

## Systemd Targets
| Runlevel | Target | Use |
|---------|--------|-----|
| 0 | poweroff.target | Shutdown |
| 1 | rescue.target | Single-user |
| 3 | multi-user.target | Servers |
| 5 | graphical.target | Desktop |
| 6 | reboot.target | Reboot |

---

# NOTES SECTION 3: FILESYSTEM — QUICK NOTES

## Critical Directories
```
/etc    → ALL configs (passwd, shadow, fstab, hosts, sshd_config, sudoers)
/var    → Variable data — logs, databases, spool (DISK FULL RISK)
/proc   → VIRTUAL — live kernel+process data (NOT on disk)
/sys    → VIRTUAL — kernel device model (NOT on disk)
/opt    → Third-party software (WebSphere, Oracle JDK, Splunk)
/tmp    → World-writable (1777), cleared on reboot
/run    → Runtime PID/socket files (tmpfs, cleared on reboot)
```

## Critical Files
```
/etc/passwd      → user:x:UID:GID:comment:home:shell  (world-readable)
/etc/shadow      → hashed passwords + aging (root-only, SHA-512)
/etc/fstab       → persistent mounts — USE UUID not /dev/sdX
/etc/hosts       → local DNS override — checked BEFORE DNS
/etc/resolv.conf → DNS servers
/etc/sudoers     → ALWAYS edit with visudo
/proc/sys/       → live kernel params (writable via sysctl)
```

## Production Rules
- `/var/log` filling = #1 disk-full cause → alert at 75-80%
- Never use `/dev/sda` in fstab → use UUID from `blkid`
- Test fstab before reboot: `mount -a`
- Bad fstab = boot failure → rescue mode to fix

---

# NOTES SECTION 4: PERMISSIONS — QUICK NOTES

## Numeric Permissions
```
r=4  w=2  x=1

755 = rwxr-xr-x → scripts, directories
644 = rw-r--r-- → config files, web assets
640 = rw-r----- → app configs (group readable)
600 = rw------- → SSH private keys, secrets
400 = r-------- → read-only private keys
700 = rwx------ → ~/.ssh directory
1777 = rwxrwxrwt → /tmp (sticky bit)
```

## Special Bits
```bash
SUID (4xxx)   chmod 4755 binary   → runs as FILE OWNER (passwd → root)
SGID (2xxx)   chmod 2775 dir      → new files inherit directory group
Sticky (1xxx) chmod 1777 /tmp     → only owner can delete own files

# Security audit
find / -perm /4000 -type f 2>/dev/null    # SUID
find / -perm /6000 -type f 2>/dev/null    # SUID + SGID
find / -perm -o+w -type f 2>/dev/null     # world-writable
```

## Commands
```bash
chmod 755 script.sh         chmod -R 755 /var/www/
chmod u+x script.sh         chmod go-w file.txt
chown alice:devops file      chown -R www-data /var/www/
getfacl /path               setfacl -m u:alice:rw /file
setfacl -d -m g:devops:rwx /deploy/   # default ACL
```

---

# NOTES SECTION 5: USERS & GROUPS — QUICK NOTES

## Key Commands
```bash
useradd -m -s /bin/bash alice              # regular user
useradd -r -s /sbin/nologin nginx          # service account

usermod -aG docker,sudo alice    # ALWAYS -a (append)
# WITHOUT -a → REPLACES ALL existing groups!

passwd alice
chage -M 90 alice               # max 90 days
chage -W 14 alice               # warn 14 days
chage -d 0 alice                # force change now
chage -l alice                  # view aging info

passwd -l alice / passwd -u alice   # lock / unlock
userdel -r alice                    # delete + remove home

id alice   groups alice   who   w   last   lastb   lastlog
```

## /etc/passwd vs /etc/shadow
```
passwd  → username:x:UID:GID:comment:home:shell   (world-readable)
shadow  → username:$6$hash:days:min:max:warn:...  (root-only)
```

## sudo Rules
```bash
# /etc/sudoers — ALWAYS edit with visudo
alice   ALL=(ALL:ALL) ALL
alice   ALL=(ALL) /usr/bin/systemctl,/usr/bin/apt    # limit commands
%devops ALL=NOPASSWD: /usr/bin/docker                # no password
# Use /etc/sudoers.d/ drop-in files (Ansible managed)
```

## PAM
```
/etc/pam.d/          → per-service PAM configs
/etc/security/faillock.conf    → lockout after N failures
/etc/security/pwquality.conf   → password complexity
faillock --reset --user alice  → unlock account
```

---

# NOTES SECTION 6: PROCESS MANAGEMENT — QUICK NOTES

## Process States
```
R = Running (on CPU or run queue)
S = Sleeping (waiting, interruptible)
D = Uninterruptible I/O (CANNOT kill — not even SIGKILL)
Z = Zombie (dead, parent not called wait())
T = Stopped (Ctrl+Z)
```

## Zombie Fix
```bash
# Zombie cannot be killed — already dead
# Fix: send SIGCHLD to parent → kill -CHLD PARENT_PID
# Or: restart/kill the parent process
# systemd auto-reaps orphans (re-parented to PID 1)
```

## Key Commands
```bash
ps aux                     ps -ef --forest         # tree view
top (P=CPU M=MEM 1=cores)  top -H -p PID           # threads
pgrep -a java              pstree -p

kill -15 PID    # SIGTERM — graceful (try FIRST)
kill -9  PID    # SIGKILL — immediate (LAST RESORT)
kill -HUP PID   # SIGHUP  — reload config
killall nginx   pkill -f "app.py"

nice -n 10 backup.sh        # start with lower priority
renice -n 5 -p PID          # change running process
# -20 = highest priority,  +19 = lowest priority
```

## Signals
| Signal | Number | Use |
|--------|--------|-----|
| SIGHUP | 1 | Reload config (nginx, sshd) |
| SIGKILL | 9 | Immediate kill — uncatchable |
| SIGTERM | 15 | Graceful — catchable (DEFAULT) |
| SIGSTOP | 19 | Pause — uncatchable |
| SIGUSR1 | 10 | nginx log reopen |

---

# NOTES SECTION 7: MEMORY — QUICK NOTES

## free -h Output
```
              total    used    free  buff/cache  available
Mem:           15Gi    8Gi    1Gi       6Gi        6.5Gi

"available" = REAL usable memory (NOT "free")
Linux caches disk in "free" RAM — instantly reclaimable
Low "free" + high "available" = HEALTHY ✓
Low "available" = PROBLEM ✗
```

## Memory Investigation
```bash
free -h                          # check "available"
vmstat 1 10                      # si/so > 0 = swapping (bad!)
ps aux --sort=-%mem | head       # top consumers
dmesg | grep -i "oom\|killed"    # OOM events
```

## OOM Killer
```bash
cat /proc/PID/oom_score          # higher = more likely killed
echo -1000 > /proc/PID/oom_score_adj   # protect process
# In systemd unit: OOMScoreAdjust=-1000
```

## Swap
```bash
dd if=/dev/zero of=/swapfile bs=1M count=4096
chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo "/swapfile none swap sw 0 0" >> /etc/fstab
sysctl -w vm.swappiness=10       # prefer RAM (10=server, 60=default)
```

---

# NOTES SECTION 8: NETWORKING — QUICK NOTES

## Key Concepts
```
CIDR: /24=256IPs, /16=65536, /32=single
Private: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
TCP: SYN→SYN-ACK→ACK (connect). FIN→ACK→FIN→ACK (close)
DNS: /etc/hosts checked FIRST, then /etc/resolv.conf servers
TIME_WAIT: after TCP close. Fix: net.ipv4.tcp_tw_reuse=1
```

## Essential Commands
```bash
ip addr show              # interfaces (replaces ifconfig)
ip route show             # routing table
ip route get 8.8.8.8      # route for destination
ss -tuln                  # listening ports (replaces netstat)
ss -tulnp                 # + process info

ping -c 4 target          # L3 reachability
mtr target                # continuous traceroute + stats
nc -zv host 443           # test TCP port
dig hostname              # DNS query
dig +short hostname        # IP only
dig hostname @8.8.8.8     # specific DNS server
tcpdump -i eth0 port 80   # packet capture
```

## Troubleshooting Order
```
ping → mtr → nc -zv → dig → curl
(L3)   (path)  (L4)   (DNS)  (L7)
```

---

# NOTES SECTION 9: SYSTEMD — QUICK NOTES

## Commands
```bash
systemctl start/stop/restart/reload/status nginx
systemctl enable nginx         # start at boot
systemctl disable nginx
systemctl enable --now nginx   # enable + start (one command!)
systemctl is-active nginx      # active/inactive (scripting)
systemctl list-units --failed  # FIRST check after boot issues
systemctl daemon-reload        # MUST run after editing unit files
```

## Service Unit File Essentials
```ini
[Unit]
After=network.target mysql.service
Requires=mysql.service

[Service]
User=appuser              # NEVER root
Restart=on-failure
RestartSec=10s
OOMScoreAdjust=-1000      # protect from OOM
MemoryMax=4G
StandardOutput=journal

[Install]
WantedBy=multi-user.target
```

## journalctl
```bash
journalctl -u nginx -f          # follow live
journalctl -b                   # current boot
journalctl -b -1                # PREVIOUS boot (crash diagnosis!)
journalctl -p err               # errors only
journalctl --since "1 hour ago"
journalctl --vacuum-size=500M   # reduce journal size
```

## Golden Rules
- `enable` ≠ `start` — use `enable --now` for both
- ALWAYS `daemon-reload` after editing unit files
- `-b -1` (previous boot) is critical for crash diagnosis

---

# NOTES SECTION 10: STORAGE & LVM — QUICK NOTES

## LVM Architecture
```
Disk → pvcreate → PV
PV + PV → vgcreate → VG (pool)
VG → lvcreate → LV (virtual partition)
LV → mkfs → Filesystem
Filesystem → mount → Mount Point
```

## Commands
```bash
pvcreate /dev/nvme1n1
vgcreate vgdata /dev/nvme1n1 /dev/nvme2n1
lvcreate -L 50G -n lv_app vgdata
mkfs.xfs /dev/vgdata/lv_app
mount /dev/vgdata/lv_app /app
pvs / vgs / lvs      # quick overview
```

## Online Expansion (Zero Downtime)
```bash
# 1. Extend VG (if needed)
pvcreate /dev/nvme3n1 && vgextend vgdata /dev/nvme3n1
# 2. Extend LV
lvextend -l +100%FREE /dev/vgdata/lv_app
# 3. Extend filesystem (NO unmount needed)
xfs_growfs /app              # XFS: mount point
resize2fs /dev/vgdata/lv_app # ext4: device
df -h /app                   # verify
```

## Filesystem Comparison
| FS | Grow | Shrink | Default | Best For |
|----|------|--------|---------|---------|
| ext4 | Yes | Yes | Ubuntu | General |
| XFS | Yes | NO | RHEL/AL | Large files |
| tmpfs | - | - | All | /tmp /run |

## Disk Commands
```bash
lsblk -f                # devices + FS + UUID
blkid /dev/nvme1n1      # get UUID for fstab
df -h && df -i          # usage + inode usage
du -sh /var/* | sort -rh | head    # find disk consumers
lsof | grep deleted     # deleted-but-open files (phantom space)
```

---

# NOTES SECTION 11: SSH & SECURITY — QUICK NOTES

## SSH Key Setup
```bash
ssh-keygen -t ed25519 -C "alice@cmg"
ssh-copy-id -i ~/.ssh/id_ed25519.pub alice@server
# Critical permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 600 ~/.ssh/authorized_keys
```

## SSH Hardening (/etc/ssh/sshd_config)
```
PermitRootLogin no          # CRITICAL
PasswordAuthentication no   # key-based only
MaxAuthTries 3
AllowUsers alice bob jenkins
X11Forwarding no
sshd -t                     # test BEFORE applying
systemctl reload sshd       # apply (keeps existing sessions)
```

## SSH Jump Host
```bash
ssh -J alice@bastion alice@10.0.1.50    # ProxyJump
# ~/.ssh/config
Host internal-web
    HostName 10.0.1.50
    ProxyJump bastion
```

## SELinux
```bash
getenforce                  # Enforcing/Permissive/Disabled
setenforce 0                # temporary Permissive (debug only)
ausearch -m avc -ts recent  # see what was denied
restorecon -Rv /path/       # fix context
setsebool -P httpd_can_network_connect on   # boolean
# NEVER disable SELinux — fix the context instead
```

## Firewall
```bash
# firewalld (RHEL 7+)
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -j DROP    # default deny (LAST rule)
iptables-save > /etc/iptables/rules.v4
```

---

# NOTES SECTION 12: PERFORMANCE — QUICK NOTES

## USE Method
- **U**tilization — how busy is the resource?
- **S**aturation — queue building up?
- **E**rrors — errors occurring?

## Key Commands by Resource
```bash
# CPU
top (P=sort CPU) / mpstat -P ALL 1 / sar -u 1 10 / perf top

# Memory
free -h / vmstat 1 (si/so=swap) / ps aux --sort=-%mem | head

# Disk
iostat -x 1                  # %util near 100% = bottleneck
iotop -bo                    # per-process I/O

# Network
sar -n DEV 1 10 / iftop / nethogs / mtr target
```

## Troubleshooting Scenarios
```
High CPU  → top → identify PID → jstack (Java) or perf top (kernel)
High MEM  → free -h → vmstat (si/so) → ps --sort=-%mem → OOM?
Disk Full → df -h → du -sh → lsof|grep deleted → truncate/logrotate
Slow Disk → iostat -x 1 (%util) → iotop (which process)
```

---

# NOTES SECTION 13: SHELL SCRIPTING — QUICK NOTES

## Script Header (Always)
```bash
#!/bin/bash
set -euo pipefail
# -e: exit on error
# -u: unset variable = error (prevents rm -rf $UNDEFINED/)
# -o pipefail: pipe error propagates
```

## Essential Patterns
```bash
# Variables
NAME="prod"                PORT=${1:-8080}           # default value
DATE=$(date +%Y%m%d)       readonly MAX=3             # constant

# Conditions
if [[ "$ENV" == "prod" ]]; then echo "prod"; fi
[ -f file ] [ -d dir ] [ -z "$v" ] [ -n "$v" ]
[ $n -eq 5 ] [ $n -gt 5 ] [ $n -lt 5 ]

# Loops
for server in web01 web02; do ssh "$server" "cmd"; done
while IFS= read -r line; do echo "$line"; done < file

# Functions
log() { echo "[$(date +%H:%M:%S)] $*" | tee -a /var/log/deploy.log; }
trap "rm -f $TMPFILE" EXIT    # cleanup on exit

# Arrays
servers=("web01" "web02" "web03")
echo "${servers[@]}" && echo "${#servers[@]}"
```

---

# NOTES SECTION 14: CRON — QUICK NOTES

## Syntax
```
min hour day month weekday command
 *    *    *    *      *    /opt/script.sh

*/15 * * * *   = every 15 minutes
0 2 * * *      = daily at 2 AM
0 9-17 * * 1-5 = hourly, weekdays 9-5
@reboot        = on system startup
```

## Management
```bash
crontab -e     # edit
crontab -l     # list
crontab -r     # DELETE ALL — no undo!
/etc/cron.d/   # system drop-in files
/etc/crontab   # system-wide (has user field)
```

## Always redirect output
```bash
0 2 * * * /opt/backup.sh >> /var/log/backup.log 2>&1
```

## Troubleshooting
```bash
grep CRON /var/log/cron          # check execution (RHEL)
# Use FULL paths — cron has minimal $PATH
# chmod +x on the script
# Test: sudo -u cronuser /opt/script.sh
```

---

# NOTES SECTION 15: CONTAINERS — QUICK NOTES

## Linux Primitives
```
Namespaces  → isolation (pid, net, mnt, uts, ipc, user)
cgroups     → resource limits (cpu, memory, blkio)
OverlayFS   → image layers (read-only + read-write CoW)
seccomp     → syscall filter
```

## Docker Quick Reference
```bash
docker run -d -p 80:80 --name web nginx
docker ps && docker ps -a
docker logs -f container && docker exec -it container bash
docker build -t myapp:1.0 . && docker push registry/myapp:1.0
docker system df && docker system prune -a     # disk cleanup
```

## Dockerfile Best Practices
```dockerfile
FROM amazonlinux:2023
WORKDIR /app
COPY requirements.txt .           # copy deps first (cache layer)
RUN yum update -y && yum install -y python3 && yum clean all
COPY . .
RUN useradd -r -s /sbin/nologin appuser && chown -R appuser /app
USER appuser                       # NEVER run as root
EXPOSE 8080
HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1
CMD ["python3", "app.py"]
```

---

# ═══════════════════════════════════════════════════════
# INTERVIEW Q&A — COMPLETE 3-LEVEL ANSWERS
# ═══════════════════════════════════════════════════════

# INTERVIEW SECTION 1: BEGINNER QUESTIONS

## Q1: What is Linux?

| Level | Answer |
|-------|--------|
| **Beginner** | Linux is a free, open-source operating system. It is used on servers, phones, and cloud systems. |
| **Intermediate** | Linux is a monolithic, Unix-like kernel created by Linus Torvalds in 1991 under GPL v2. Combined with GNU tools it forms GNU/Linux — a complete OS. POSIX-compliant. |
| **Senior/SRE** | Linux is a POSIX-compliant monolithic kernel with loadable module support. Powers 90%+ of cloud workloads. Enables containers via namespaces and cgroups. CMG runs Amazon Linux 2/AL2023 on EC2 — chosen for native AWS integration, zero licensing cost, and compatibility with Docker, EKS, Terraform, and Ansible. |
| **Keywords** | open-source, POSIX, monolithic kernel, GPL, Unix-like, Linus Torvalds, GNU/Linux, distribution |

---

## Q2: What are the main components of a Linux system?

| Level | Answer |
|-------|--------|
| **Beginner** | Linux has a kernel (manages hardware), shell (takes commands), and filesystem (stores files). |
| **Intermediate** | Three layers: Kernel (manages CPU/memory/devices via system calls), Shell (bash/sh interprets commands), File System (hierarchical — everything is a file). GNU tools bridge user and kernel. |
| **Senior/SRE** | Five layers: Hardware → Kernel (ring 0) → System Call Interface → GNU libc/Tools (ring 3) → Applications. VFS abstracts filesystem types. CFS scheduler manages CPU. MMU handles virtual memory via page tables. On CMG, the kernel manages cgroups/namespaces for EKS pod isolation. |
| **Keywords** | kernel, shell, VFS, system call, glibc, CFS, MMU, user space, kernel space |

---

## Q3: What is the role of the Linux kernel?

| Level | Answer |
|-------|--------|
| **Beginner** | The kernel is the core of Linux. It manages hardware — CPU, memory, disk, and network. |
| **Intermediate** | The kernel runs in Ring 0 (full CPU privilege). Manages process scheduling (CFS), memory (virtual memory, MMU), device drivers, VFS, network stack, and security (capabilities, SELinux). Applications request services via system calls. |
| **Senior/SRE** | The kernel is the bridge between hardware and software. It enforces isolation via namespaces (containers), limits resources via cgroups v2 (pods/services), and protects via seccomp/capabilities. Kernel modules extend functionality without rebooting — e.g., e1000e NIC driver, NFS module. On CMG EKS, kubelet interacts with kernel cgroups to enforce pod resource limits (CPU/memory). |
| **Keywords** | Ring 0, system calls, CFS, MMU, cgroups, namespaces, seccomp, loadable modules |

---

## Q4: What is a shell? Difference between bash and sh?

| Level | Answer |
|-------|--------|
| **Beginner** | A shell is the program that reads your commands and runs them. bash is the most common shell. |
| **Intermediate** | Shell is a command interpreter between user and kernel. sh (Bourne Shell) is the original POSIX shell. bash (Bourne Again Shell) is a superset of sh — adds arrays, `[[ ]]`, command history, tab completion. Scripts using bash-only syntax fail if run with sh. |
| **Senior/SRE** | bash extends sh with: arrays, associative arrays, `[[ ]]` advanced conditionals, process substitution `<()`, string manipulation `${var,,}`, `getopts`. In CMG Jenkins pipelines, sh steps run `/bin/sh` (may be dash on Ubuntu). Always specify `#!/bin/bash` for bash-specific features. Use `set -euo pipefail` in every production script. |
| **Keywords** | bash, sh, POSIX, shebang, set -euo pipefail, command interpreter, interactive shell |

---

## Q5: What are popular Linux distributions?

| Level | Answer |
|-------|--------|
| **Beginner** | Popular distros include Ubuntu, RHEL, CentOS, Debian, and Amazon Linux. |
| **Intermediate** | Two families: RHEL-based (RHEL, Rocky, AlmaLinux, Amazon Linux — use DNF/RPM) and Debian-based (Ubuntu, Debian — use APT/deb). SLES (zypper) for SAP. Choice depends on support needs, ecosystem, and workload. |
| **Senior/SRE** | CMG uses Amazon Linux 2/AL2023 — RHEL-based, AWS-optimized, pre-integrated with SSM, CloudWatch, and EKS. Rocky Linux replaces CentOS for RHEL-compatible production. SLES is mandatory for SAP HANA (saptune, YaST, specific kernel parameters). Each distro family has different: package format (rpm vs deb), firewall (firewalld vs ufw), init default target, and security framework (SELinux vs AppArmor). |
| **Keywords** | RHEL, Rocky, AlmaLinux, Ubuntu, Debian, Amazon Linux, SLES, DNF, APT, zypper |

---

## Q6: How do you change file permissions in Linux?

| Level | Answer |
|-------|--------|
| **Beginner** | Use chmod. Example: `chmod 755 script.sh` gives the owner full access, others can read and run. |
| **Intermediate** | `chmod` changes permissions using numeric (755, 644) or symbolic (u+x, go-w) modes. r=4, w=2, x=1. `chmod 755` = owner rwx, group/others r-x. `chmod 644` = owner rw, others r. `chmod -R` applies recursively. |
| **Senior/SRE** | Apply least-privilege: 755 for executables, 644 for configs, 600 for secrets (SSH keys), 700 for ~/.ssh. SSH strictly enforces key permissions — "Permissions 0644 for id_rsa are too open" error if key is world-readable. For shared team directories, use SGID (chmod 2775) so new files inherit group, plus ACLs (setfacl) for fine-grained per-user control. On CMG, deployment scripts are 750 (owner + devops group only), SSH keys are 600. |
| **Keywords** | chmod, chown, r=4 w=2 x=1, octal, least privilege, SUID, SGID, sticky bit, ACL, setfacl |

---

## Q7: What is the purpose of grep?

| Level | Answer |
|-------|--------|
| **Beginner** | `grep` searches for text patterns in files. Example: `grep "ERROR" app.log` finds error lines. |
| **Intermediate** | `grep -i` (case insensitive), `-r` (recursive), `-n` (line numbers), `-v` (invert/exclude), `-c` (count), `-A/-B/-C` (context lines), `-E` (extended regex). Pipe with other commands for powerful filtering. |
| **Senior/SRE** | Production patterns: `grep "Failed password" /var/log/secure \| awk '{print $11}' \| sort \| uniq -c \| sort -rn \| head` — top attacking IPs. `grep -E "ERROR\|WARN\|CRIT" app.log \| grep -v "expected"` — filter noise. `zgrep "ERROR" app.log.gz` — search compressed logs. For large files use `ripgrep (rg)` — 10x faster. On CMG, grep pipelines are used in Jenkins to parse test results and SonarQube output. |
| **Keywords** | grep, egrep, -i, -r, -v, -A/-B/-C, regex, pipeline, zgrep, log analysis |

---

## Q8: How do you find files in Linux?

| Level | Answer |
|-------|--------|
| **Beginner** | Use `find`. Example: `find /var/log -name "*.log"` finds all log files. |
| **Intermediate** | `find` filters by: -name, -type (f/d/l), -size (+100M), -mtime (+30 days), -perm (/4000 SUID), -user, -exec. Example: `find /var/log -name "*.log" -mtime +30 -delete` removes old logs. |
| **Senior/SRE** | Production uses: Security audit `find / -perm /4000 -type f 2>/dev/null` (SUID). Disk cleanup `find /var/log -size +100M -exec ls -lh {} \;`. Performance: `find / -name "*.log" \| xargs grep "ERROR"` (xargs faster than -exec for many files). Inode debug: `find / -xdev -printf "%h
" \| sort \| uniq -c \| sort -rn \| head` (dir with most files). On CMG, Ansible uses find in cleanup roles for log retention policy. |
| **Keywords** | find, -name, -type, -size, -mtime, -perm, -exec, xargs, locate, SUID audit |

---

## Q9: What is the purpose of the top command?

| Level | Answer |
|-------|--------|
| **Beginner** | `top` shows running processes and how much CPU and memory they use, updated in real time. |
| **Intermediate** | `top` shows: load average, CPU breakdown (us=user, sy=kernel, wa=I/O wait, id=idle), memory, and per-process stats. Interactive: P=sort by CPU, M=sort by memory, 1=per-core view, k=kill process, H=show threads. |
| **Senior/SRE** | For production troubleshooting: `top` quickly reveals CPU hogs (P key), OOM pressure (memory section), and I/O-bound processes (high wa%). `top -H -p PID` shows individual threads — critical for Java performance issues. `top -b -n 1` runs non-interactive (good for scripts). Combine with `jstack PID` for Java thread dumps. On CMG, top is the first command when WebSphere response times degrade. |
| **Keywords** | top, htop, load average, us/sy/wa/id, CPU states, interactive keys, thread view, -H flag |

---

## Q10: How do you check disk usage?

| Level | Answer |
|-------|--------|
| **Beginner** | Use `df -h` to see how full each disk partition is. |
| **Intermediate** | `df -h` = filesystem-level space (total/used/available per mount). `df -hT` adds filesystem type. `df -i` shows inode usage (important — 100% inodes = cannot create files even if space available). `du -sh /path` = directory content size. They measure differently. |
| **Senior/SRE** | Production disk-full investigation: `df -h` (which FS full?) → `du -sh /var/* \| sort -rh \| head` (biggest dirs) → `lsof \| grep deleted` (deleted files held open — space not freed!) → `truncate -s 0 /var/log/big.log` (truncate, don't delete, if process holds fd) → `systemctl reload nginx` (reopen log files). `df -i` is critical — 100% inodes on a filesystem with space means many small files exist. Find: `find / -xdev -printf "%h
" \| sort \| uniq -c \| sort -rn \| head`. CMG: CloudWatch disk alarm at 75%. |
| **Keywords** | df -h, du -sh, inode exhaustion, df -i, lsof deleted, truncate, logrotate, disk-full investigation |

---

# INTERVIEW SECTION 2: INTERMEDIATE QUESTIONS

## Q11: What is SSH and how does it work?

| Level | Answer |
|-------|--------|
| **Beginner** | SSH lets you securely connect to a remote server over the internet. It encrypts everything. |
| **Intermediate** | SSH (Secure Shell) creates an encrypted tunnel. Flow: TCP connect → server sends fingerprint → client verifies (known_hosts) → Diffie-Hellman key exchange for session key → authenticate (password or key) → encrypted shell. Port 22. Key-based auth: public key on server (authorized_keys), private key stays on client. |
| **Senior/SRE** | SSH key auth flow: client and server perform DH key exchange (encrypted channel). Server challenges client with random data encrypted using client's public key. Client decrypts with private key → proves ownership without sending private key. ProxyJump (-J) creates end-to-end encrypted tunnel through bastion — bastion only sees TCP, not SSH content. CMG: Jenkins agents use ed25519 keys stored in Jenkins credentials. PermitRootLogin no, PasswordAuthentication no, AllowUsers whitelist on all EC2. SSM Session Manager provides fallback access without SSH port. |
| **Keywords** | Diffie-Hellman, authorized_keys, known_hosts, ProxyJump, ed25519, PermitRootLogin, SSM Session Manager |

---

## Q12: How do you kill a process in Linux?

| Level | Answer |
|-------|--------|
| **Beginner** | Use `kill PID` to stop a process. If it won't stop, use `kill -9 PID`. |
| **Intermediate** | `kill -15 PID` sends SIGTERM (graceful — process can catch and clean up). `kill -9 PID` sends SIGKILL (immediate — cannot be caught). Always try SIGTERM first. `killall nginx` kills all processes named nginx. `pkill -f "pattern"` kills by command line pattern. |
| **Senior/SRE** | SIGKILL should be last resort — it gives the process no chance to: close database connections, flush write buffers, release locks, write final logs. This can corrupt databases and leave orphaned lock files. Proper escalation: SIGTERM → wait 10-30s → SIGKILL. For Java: take thread dump first (`jstack PID > /tmp/td.txt`) before killing — dumps preserve evidence. In systemd: `TimeoutStopSec=30` gives 30s for graceful stop before SIGKILL. On CMG, WebSphere has a custom shutdown script that flushes sessions before stopping. |
| **Keywords** | SIGTERM, SIGKILL, graceful shutdown, kill, pkill, killall, thread dump, TimeoutStopSec |

---

## Q13: What is the purpose of rsync?

| Level | Answer |
|-------|--------|
| **Beginner** | `rsync` copies files between locations. It only copies changed files, making it faster than cp. |
| **Intermediate** | `rsync` does incremental file sync using checksums/timestamps. Key options: `-a` (archive, preserves permissions/timestamps), `-v` (verbose), `-z` (compress), `--delete` (mirror, remove files not in source), `--progress`, `--bwlimit`. Works locally or over SSH. |
| **Senior/SRE** | Production patterns: Hard-link backup `rsync -av --link-dest=/backup/previous/ /data/ /backup/$(date +%Y%m%d)/` — unchanged files are hard-linked (saves disk space). Zero-downtime code deploy: `rsync -av --delete /new-release/ /var/www/` then `ln -sf /var/www/release-$(date) /var/www/current`. `--checksum` ensures byte-level integrity (slower but reliable for critical data). `--bwlimit=10000` prevents saturating network (KB/s). On CMG, Ansible uses rsync via synchronize module for config file distribution. |
| **Keywords** | rsync, --delete, --link-dest, incremental, checksum, archive mode, bandwidth limiting, deployment |

---

## Q14: How do you check system hardware information?

| Level | Answer |
|-------|--------|
| **Beginner** | Use `lshw` for hardware info, `lscpu` for CPU, `free -h` for memory. |
| **Intermediate** | `lscpu` (CPU details), `lsmem` (memory layout), `lsblk` (block devices), `lspci` (PCI devices — NIC, GPU), `lsusb` (USB devices), `dmidecode` (BIOS/DMI info — vendor, serial numbers), `hwinfo` (detailed). On VMs/cloud: `lshw` may show virtual hardware. |
| **Senior/SRE** | On AWS EC2: `curl http://169.254.169.254/latest/meta-data/instance-type` (instance type), `dmidecode -t system \| grep UUID` (instance ID). For disk health: `smartctl -a /dev/sda` (SMART data — reallocated sectors, temperature). For NUMA topology: `numactl --hardware` (critical for SAP HANA sizing). `cat /proc/cpuinfo` shows per-core details including CPU flags (important for virtualization: vmx/svm). `lsmod` shows loaded kernel modules. |
| **Keywords** | lshw, lscpu, lsblk, dmidecode, smartctl, numactl, /proc/cpuinfo, SMART, NUMA |

---

## Q15: What is a firewall in Linux?

| Level | Answer |
|-------|--------|
| **Beginner** | A firewall controls which network connections are allowed or blocked based on rules. |
| **Intermediate** | Linux firewalls hook into the kernel's netfilter framework. Tools: iptables (classic, rule chains), firewalld (RHEL 7+, zone-based, wraps iptables/nftables), nftables (RHEL 8+, modern replacement), ufw (Ubuntu, simplified). Rules filter traffic by port, protocol, source IP, and direction (INPUT/OUTPUT/FORWARD). |
| **Senior/SRE** | netfilter processes packets through chains: PREROUTING → INPUT/FORWARD → POSTROUTING. iptables rule order matters — first match wins. Production: use firewalld zones for server roles (public=minimal, internal=trusted). Safe change procedure: schedule rollback with `at` before applying changes. AWS: Security Groups are stateful and preferred over host iptables for perimeter filtering — host firewall is defense-in-depth layer. CMG: Security Groups (Terraform-managed) + host firewalld on EC2 instances. All SG changes peer-reviewed in pull requests. |
| **Keywords** | netfilter, iptables, firewalld, nftables, zones, chains, INPUT/OUTPUT/FORWARD, Security Group, defense-in-depth |

---

## Q16: How do you check system IP address?

| Level | Answer |
|-------|--------|
| **Beginner** | Use `ip addr show` to see the IP address. |
| **Intermediate** | `ip addr show` (or `ip a`) shows all interfaces with IPv4/IPv6 addresses, MAC, and state. `ip addr show eth0` for a specific interface. Replaces deprecated `ifconfig`. `ip route show` shows routing table. `ip route get 8.8.8.8` shows which interface/route is used for a destination. |
| **Senior/SRE** | Modern networking uses iproute2 suite (`ip` command). `ifconfig` and `netstat` are deprecated net-tools — often not installed on minimal images. In EC2: `curl http://169.254.169.254/latest/meta-data/local-ipv4` (instance private IP) and `public-ipv4` (public IP). For EKS nodes: pod IPs are from VPC CIDR (VPC CNI plugin). Troubleshooting: `ip addr` → check interface state (UP/DOWN), correct IP/subnet, correct MTU. `ip neigh` shows ARP table. `ss -s` for socket statistics. |
| **Keywords** | ip addr, iproute2, ifconfig deprecated, ip route, EIP, VPC, ENI, MTU, ARP |

---

## Q17: What is the purpose of cron daemon?

| Level | Answer |
|-------|--------|
| **Beginner** | Cron runs scheduled tasks automatically at specified times. |
| **Intermediate** | The crond daemon reads crontab files and executes commands at scheduled times. Syntax: `minute hour day month weekday command`. `crontab -e` edits user crontab. System jobs in `/etc/crontab` and `/etc/cron.d/`. cron has minimal PATH so use full paths. Redirect output to logs (2>&1). |
| **Senior/SRE** | Production considerations: (1) cron has no dependency management — if a job runs long, next instance starts anyway (use lock files or flock). (2) Missing environment variables — cron runs with minimal env; source profile if needed. (3) Systemd timers are superior — better logging (journald), catch-up on missed runs (Persistent=true), dependency ordering, random delays. (4) Monitor cron job exits with logging + alerting. CMG: log rotation (logrotate) and backup scripts run via cron. Jenkins pipeline replaces most cron automation. `crontab -r` (no -a) deletes ALL jobs — common dangerous mistake. |
| **Keywords** | crond, crontab -e, /etc/cron.d, PATH, systemd timers, flock, Persistent=true, log rotation |

---

## Q18: How do you mount a filesystem?

| Level | Answer |
|-------|--------|
| **Beginner** | Use `mount /dev/sdb1 /mnt/data` to attach a disk to a directory. |
| **Intermediate** | `mount device mountpoint` attaches filesystem. Options: `-t` (type: ext4, xfs, nfs), `-o` (options: ro, noatime, nosuid). `umount /mnt/data` detaches. `/etc/fstab` makes mounts persistent — read at boot. Use UUID from `blkid` not device names. Test: `mount -a` (mounts all fstab entries without rebooting). |
| **Senior/SRE** | Production EBS attach workflow: attach in AWS console → `lsblk` (confirm device) → `blkid` (get UUID) → `mkfs.xfs /dev/nvme1n1` (format) → `mkdir /data` → `mount /dev/nvme1n1 /data` → add UUID to `/etc/fstab` → `mount -a` (test) → verify `df -h`. For NFS: add `_netdev` option so systemd waits for network. `fuser -m /mnt/data` or `lsof +D /mnt/data` shows what's blocking unmount. `mount -o remount,rw /` — remount root read-write in rescue mode. |
| **Keywords** | mount, umount, /etc/fstab, UUID, blkid, _netdev, noatime, nosuid, EBS, NFS |

---

## Q19: What is the purpose of iptables?

| Level | Answer |
|-------|--------|
| **Beginner** | iptables is a firewall tool that creates rules to allow or block network connections. |
| **Intermediate** | iptables configures the Linux kernel's netfilter packet filtering. Tables: filter (default), nat, mangle. Chains: INPUT (incoming), OUTPUT (outgoing), FORWARD (routed). Rules are processed top to bottom — first match wins. `-A` appends, `-I` inserts, `-D` deletes. Default policy (ACCEPT or DROP) applies if no rule matches. |
| **Senior/SRE** | iptables is being replaced by nftables (RHEL8+). For new deployments prefer nftables or firewalld (which uses nftables backend). iptables chain processing: PREROUTING (DNAT) → routing decision → INPUT (local processes) or FORWARD (routed) → POSTROUTING (SNAT/masquerade). Stateful tracking: `-m state --state ESTABLISHED,RELATED -j ACCEPT` allows return traffic without explicit rules. Production: always save rules (`iptables-save`). AWS EC2: Security Groups handle perimeter; iptables is defense-in-depth. Safe change procedure: `echo "iptables -F" \| at now + 5 minutes` (auto-rollback if locked out). |
| **Keywords** | netfilter, chains, tables, PREROUTING, POSTROUTING, stateful, conntrack, nftables, firewalld, iptables-save |

---

## Q20: How do you compress and decompress files?

| Level | Answer |
|-------|--------|
| **Beginner** | Use `gzip file` to compress and `gunzip file.gz` to decompress. For directories use `tar -czvf archive.tar.gz dir/`. |
| **Intermediate** | Compression tools: gzip (.gz, fast), bzip2 (.bz2, better compression), xz (.xz, best compression, slowest), lz4 (fastest, less compression). tar combines archiving and compression: `tar -czvf` (create+gzip), `tar -cjvf` (create+bzip2), `tar -cJvf` (create+xz), `tar -xvf` (extract auto-detect). |
| **Senior/SRE** | Production choices: (1) Log archival: gzip (fast, reasonable compression — logrotate uses this). (2) Backups: xz (best compression for large data at rest). (3) Real-time streaming: lz4 (lowest latency). `zcat/zgrep/zless` — read gzipped files without decompressing. `pigz` — parallel gzip for large files (uses all CPU cores). `tar --exclude-vcs --exclude="*.tmp"` for clean backups. Verify archive: `tar -tzvf backup.tar.gz \| head` before deleting source. On CMG, logrotate compresses with gzip (delaycompress), backup scripts use xz. |
| **Keywords** | gzip, bzip2, xz, lz4, tar, zcat, zgrep, pigz, compression ratio, decompression |

---

# INTERVIEW SECTION 3: SENIOR / SRE QUESTIONS

## Q21: How do you troubleshoot high CPU usage?

| Level | Answer |
|-------|--------|
| **Beginner** | I use top to see which process uses most CPU, then investigate or restart it. |
| **Intermediate** | (1) `top` — identify PID with high %CPU. Check if us% (user code), sy% (kernel), or wa% (I/O wait). (2) `ps -eo pid,%cpu,cmd --sort=-%cpu \| head`. (3) For Java: `top -H -p PID` (threads) → `jstack PID` (thread dump). (4) If wa% high → disk issue, not CPU → use `iostat -x 1`. |
| **Senior/SRE** | Structured approach: (1) Characterize with `uptime` (load trend), `mpstat -P ALL 1` (per-core). (2) Identify PID: `ps --sort=-%cpu`, `pstree -p`. (3) Profile: `perf top` (kernel/user function hotspots), `perf record -g -p PID && perf report`. (4) Java: `jstack PID > /tmp/td.txt` → grep RUNNABLE → find hot threads → map to code. (5) Runaway cron: check /var/log/cron for rapid spawning. (6) CRITICAL: capture diagnostics BEFORE killing — restart destroys evidence. On CMG: BPM processor thread in infinite loop identified via jstack, not top. |
| **Keywords** | top, perf top, jstack, thread dump, us%/sy%/wa%, mpstat, CPU profiling, investigation methodology |
| **CMG Example** | WebSphere CPU spike: top -H -p $(pgrep java) → one thread at 100% → jstack captured thread dump → found infinite loop in BPM task processor → patch deployed. |

---

## Q22: How do you troubleshoot memory issues/leaks?

| Level | Answer |
|-------|--------|
| **Beginner** | I check free -h to see memory usage and look for which process uses the most. |
| **Intermediate** | (1) `free -h` — check "available" (not "free"). (2) `vmstat 1 5` — si/so columns (non-zero = swapping). (3) `ps aux --sort=-%mem \| head` — top consumers. (4) `dmesg \| grep -i "oom\|killed"` — OOM events. (5) For Java: `jmap -heap PID` — heap usage. |
| **Senior/SRE** | Memory leak diagnosis: (1) Establish baseline RSS for process. (2) Track growth: `watch -n 30 "ps -o rss,pid,cmd -p PID"`. (3) Map analysis: `pmap -x PID` — look for heap growing. (4) Java: `jstat -gc PID 5s` (GC stats) + `jmap -dump:format=b,file=/tmp/heap.bin PID` → Eclipse MAT analysis. (5) Interim mitigation: `Restart=always` in systemd unit + `MemoryMax=4G` as hard limit. (6) OOM protection: `OOMScoreAdjust=-1000` for critical services. On CMG: BPM instances not completing → 50,000 objects in heap → fixed process model end events. |
| **Keywords** | RSS, VSZ, vmstat si/so, OOM killer, pmap, jmap, jstat, heap dump, Eclipse MAT, MemoryMax |
| **CMG Example** | WebSphere heap grew to 95% over 48h. jstat showed Old Gen full, GC at 50% CPU. jmap dump → MAT analysis → 50,000 uncompleted BPM task instances → fixed BPM process end event. |

---

## Q23: How do you perform a zero-downtime disk expansion?

| Level | Answer |
|-------|--------|
| **Beginner** | I would add more disk space using LVM and expand the volume while the server is running. |
| **Intermediate** | (1) Attach new EBS volume in AWS console. (2) `pvcreate /dev/nvme3n1`. (3) `vgextend vgdata /dev/nvme3n1`. (4) `lvextend -l +100%FREE /dev/vgdata/lv_data`. (5) `xfs_growfs /data` (XFS) or `resize2fs /dev/vgdata/lv_data` (ext4). (6) `df -h /data` to verify. Zero downtime — no unmount needed. |
| **Senior/SRE** | Complete runbook: Pre-check: `vgdisplay vgdata` (VFree space), `df -h /data` (current usage), `lvdisplay` (LV size). If VG has space: skip pvcreate/vgextend. Identify FS type: `lsblk -f` or `blkid`. XFS: `xfs_growfs /data` (MUST use mount point, NOT device). ext4: `resize2fs /dev/vgdata/lv_app`. Verify: `df -h` + `lvdisplay`. One-liner for ext4: `lvextend -L +50G --resizefs /dev/vgdata/lv_app`. Post: update monitoring thresholds, update CMDB, document in change log. On CMG: 8-minute online EBS expansion for WebSphere data volume — no downtime. |
| **Keywords** | lvextend, xfs_growfs, resize2fs, vgextend, pvcreate, online expansion, EBS, zero downtime |
| **CMG Example** | /data at 85% (85GB/100GB). Attached 50GB EBS → pvcreate → vgextend → lvextend → xfs_growfs. Total time: 8 minutes. Zero downtime. |

---

## Q24: How do you manage a service that fails repeatedly?

| Level | Answer |
|-------|--------|
| **Beginner** | I check the logs with journalctl and fix whatever is causing it to fail. |
| **Intermediate** | (1) `systemctl status svc` — exit code and failure reason. (2) `journalctl -u svc -n 100` — full error. (3) Fix root cause. (4) `systemctl reset-failed svc` (reset failure counter). (5) `systemctl start svc`. Configure in unit: `Restart=on-failure`, `RestartSec=10s`, `StartLimitBurst=3`. |
| **Senior/SRE** | Systematic: identify failure type (crash vs timeout vs config error). For crash loop: capture core dump (`systemd-coredump`), check `coredumpctl list`. For OOM: `OOMScoreAdjust=-1000` + `MemoryMax`. For config errors: `service -t` to test config. Prevent restart loop: `StartLimitIntervalSec=60` (max 3 restarts in 60s) then `StartLimitAction=none` (don't escalate). Monitor: `systemctl is-failed svc` in healthcheck. Alert on: `systemctl list-units --state=failed`. For critical services add `OnFailure=notify-service@%i.service` to trigger alert. |
| **Keywords** | Restart=on-failure, StartLimitBurst, reset-failed, coredumpctl, OnFailure, systemd watchdog |

---

## Q25: How do you handle a disk full emergency in production?

| Level | Answer |
|-------|--------|
| **Beginner** | I find and delete large files to free up space. |
| **Intermediate** | (1) `df -h` — confirm which FS. (2) `du -sh /var/* \| sort -rh \| head`. (3) `lsof \| grep deleted` — phantom space. (4) `truncate -s 0 /var/log/big.log`. (5) `logrotate -f`. (6) Fix logrotate config. |
| **Senior/SRE** | Triage order: (1) `df -hT` — identify full filesystem and type. (2) `du -sh /var/* \| sort -rh \| head -10` (3) `lsof \| grep deleted` — CRITICAL: deleted files held open by processes don't free space until process releases fd. Fix: `systemctl reload nginx` (reopen logs) or restart process. (4) `docker system prune -a` if Docker. (5) `df -i` — inode exhaustion (separate from space). (6) Immediate relief without data loss: `truncate -s 0 file` (safer than rm when process holds fd). Long-term: fix logrotate, add LVM space, set monitoring at 75%. Post-incident: add CloudWatch alarm at 75% (CMG: PagerDuty integration). |
| **Keywords** | df -h, du -sh, lsof deleted, truncate, logrotate, docker prune, inode exhaustion, 75% alert |
| **CMG Example** | /var/log at 100% at 3 AM. lsof \| grep deleted showed WebSphere holding 3 old log handles. systemctl reload websphere freed 40GB immediately. Root cause: logrotate misconfiguration. |

---

# INTERVIEW SECTION 4: SCENARIO-BASED QUESTIONS

## S1: Server Not Reachable After Security Group Change

```
SITUATION: Production server unreachable after network team made Security Group changes.

INVESTIGATION STEPS:
1. ping server-ip          → ICMP timeout (network/SG issue)
2. nc -zv server-ip 22    → Connection timeout (port 22 blocked)
3. AWS Console             → Instance running ✓, SG changed ✓
4. SSM Session Manager     → Access server without SSH port

ROOT CAUSE: Security Group rule for port 22 removed during cleanup

FIX: Re-add inbound rule for port 22 from VPN CIDR via Terraform PR

PREVENTION:
- All SG changes via Terraform with peer review
- SSM Session Manager always enabled (access without SSH)
- Alert on SG rule changes via AWS Config
```

## S2: Jenkins Build Fails — No Space Left on Device

```
SITUATION: All Jenkins builds failing with "No space left on device"

INVESTIGATION:
df -h                    → /var/lib/jenkins at 100%
du -sh /var/lib/jenkins/* | sort -rh
→ workspace/ = 180GB (old build artifacts)
→ builds/ = 45GB (old build history)

FIX:
# Clear old workspaces
find /var/lib/jenkins/workspace -mtime +7 -exec rm -rf {} +
# Docker cleanup if Docker builds
docker system prune -a
# Expand LVM
lvextend -l +100%FREE /dev/vgdata/lv_jenkins
xfs_growfs /var/lib/jenkins

PREVENTION:
- Jenkins: discard old builds (keep last 10)
- Workspace cleanup post-build
- Disk alert at 75%
- Move to Kubernetes ephemeral agents
```

## S3: WebSphere Application Slow — Memory Pressure

```
SITUATION: WebSphere response times increased from 200ms to 30s over 48 hours

INVESTIGATION:
top               → CPU 95% (all GC threads)
jstat -gc PID 5s  → OldGen 99%, GC running every 2s
jmap -heap PID    → heap: 6.9GB/7GB used
jmap -dump:format=b,file=/tmp/heap.bin PID
Eclipse MAT       → 50,000 BPM task instances retained

ROOT CAUSE: BPM process instances not completing (missing end event in process model)

FIX:
1. Rolling restart of WebSphere (immediate relief)
2. Deploy BPM process model fix (add end events)
3. Clear stale instances from BPM database

PREVENTION:
- JVM heap monitoring alert at 80%
- BPM process model review checklist
- Heap dump automation on OOM
```

## S4: EKS Node Not Ready

```
SITUATION: kubectl get nodes shows one node in NotReady state

INVESTIGATION ON NODE:
systemctl status kubelet     → active (running)
journalctl -u kubelet -n 100 → "failed to get image... context deadline exceeded"
df -h                        → /var/lib/docker at 100%
docker system df             → 45GB unused images

ROOT CAUSE: Docker image disk full → kubelet cannot pull new images → node NotReady

FIX:
docker system prune -a       # free space
systemctl restart kubelet    # trigger re-registration

PREVENTION:
- ImageGCHighThresholdPercent: 85 (auto-cleanup)
- Disk alert at 75%
- Regular docker prune cron job
- Larger EBS volume for /var/lib/docker
```

---

# INTERVIEW SECTION 5: WHAT NOT TO SAY

## Critical Mistakes to Avoid

| ❌ WRONG | ✅ RIGHT |
|---------|---------|
| "chmod 777 fixes it" | "Apply minimum required permissions. Audit: find / -perm /4000" |
| "Disable SELinux to fix access denied" | "ausearch -m avc → restorecon or semanage fcontext" |
| "kill -9 is how I stop processes" | "SIGTERM first, wait 10s, then SIGKILL only if unresponsive" |
| "Restart the server when something breaks" | "Capture diagnostics first — journalctl, thread dumps, strace" |
| '"free" column = available memory' | '"available" column = real usable RAM' |
| "Edit /boot/grub2/grub.cfg directly" | "Edit /etc/default/grub then grub2-mkconfig" |
| "usermod -G group" | "usermod -aG group — without -a removes ALL existing groups" |
| "/dev/sda1 in fstab" | "UUID from blkid — device names change on reboot" |
| "Linux and Unix are the same" | "Linux is Unix-LIKE (POSIX). No shared source code." |
| "Use ifconfig/netstat" | "Use ip addr and ss — legacy tools not installed on minimal images" |

## Senior-Level Phrases That Impress

- *"I apply the **USE methodology** — Utilization, Saturation, Errors — across CPU, Memory, Disk, Network"*
- *"I capture diagnostics **before** any intervention that might destroy evidence"*
- *"I correlate **journald, application logs, and kernel ring buffer** to build an incident timeline"*
- *"**Swap is a safety net, not a solution** — I identify the root cause of memory pressure"*
- *"I fix SELinux by identifying the correct context with **ausearch → restorecon** — not by disabling it"*
- *"For recurring tasks I prefer **systemd timers** over cron — better journald integration and dependency ordering"*
- *"I apply **least-privilege principles** and audit SUID/SGID bits: find / -perm /6000 -type f"*

---

# CMG PROJECT CONTEXT — USE IN EVERY ANSWER

| Area | Details |
|------|---------|
| **OS** | Amazon Linux 2 / AL2023 on EC2 |
| **CI/CD** | Jenkins on EC2 agents — shell steps run bash |
| **Containers** | Docker + EKS Kubernetes (Amazon Linux worker nodes) |
| **IaC** | Terraform executed from Jenkins agents |
| **Config Mgmt** | Ansible playbooks for EC2 configuration |
| **Applications** | WebSphere app server, Siebel CRM, BPM on EC2 |
| **Code Quality** | SonarQube, Trivy container scanning in Jenkins pipeline |
| **Source Control** | Git — Jenkins webhook triggers |
| **Monitoring** | CloudWatch agent on EC2, Prometheus/Grafana on EKS |
| **Access** | SSH key-only, PermitRootLogin no, SSM Session Manager |
| **Linux used for** | Jenkins agents, EKS nodes, Terraform servers, app servers, monitoring |

---

# FINAL CHEAT SHEET — TOP 30 CONCEPTS

1. Kernel = core OS. GNU+Kernel = Distribution.
2. Everything is a file — /dev, /proc, /sys.
3. /etc=configs, /var=logs (disk-full!), /opt=3rdparty, /proc+/sys=virtual.
4. r=4, w=2, x=1. 755=scripts, 644=files, 600=secrets, 700=~/.ssh.
5. SUID(4xxx)=run as owner. SGID(2xxx)=group inherit. Sticky(1xxx)=/tmp.
6. /etc/passwd=metadata(world-read). /etc/shadow=hashes(root only).
7. sudo=per-cmd+audit. su=full-session+no-audit. Use sudo.
8. R=running, S=sleeping, D=I/O(no kill!), Z=zombie, T=stopped.
9. SIGTERM(15)=graceful. SIGKILL(9)=immediate. Try 15 first.
10. Load avg / CPU count. >1.0 per core = overloaded.
11. free -h "available" = real RAM. "free" = unused only.
12. OOM fires when RAM+swap full. dmesg | grep -i killed.
13. df=filesystem space. du=directory content. lsof|grep deleted=phantom.
14. LVM: pvcreate→vgcreate→lvcreate→mkfs→mount. Online: lvextend+xfs_growfs.
15. fstab: UUID from blkid. Test: mount -a. Bad fstab = boot failure.
16. systemd: enable=boot, start=now, --now=both. daemon-reload after edits.
17. journalctl -u svc -f -b -b -1 -p err. -b -1 = previous boot.
18. SSH: private on client, public in authorized_keys. 700/600 permissions.
19. SELinux: enforcing=blocks. NEVER disable. ausearch→restorecon.
20. Docker = namespaces+cgroups+OverlayFS.
21. XFS: cannot shrink, high perf. ext4: can shrink, general.
22. ss -tuln (listening). ss -tulnp (+PIDs). Replaces netstat.
23. iostat %util 100% = disk bottleneck. vmstat si/so>0 = swapping.
24. Cron: min hour day month weekday. crontab -r = DELETE ALL!
25. Boot: BIOS/UEFI→GRUB2→vmlinuz+initramfs→systemd PID1→login.
26. find -perm /4000=SUID. find -size +100M=large. find -mtime +30=old.
27. Capabilities replace SUID. setcap cap_net_bind_service=+ep.
28. eBPF = kernel observability. Cilium, Falco, Datadog use it.
29. set -euo pipefail always. -u prevents rm -rf $UNDEFINED/.
30. Investigate→Root cause→Fix→Prevent. NEVER restart without understanding.

---

*End of Linux-Notes-Interview-2026-07-v1.md*
*Version: July 2026 | Sources: All chat sessions + Linux_Interview.docx + Master Prompt*
*Next month: v2 with new unique content only. Cross-references to v1 used instead of repeating.*
