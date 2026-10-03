# Phase 4 --- Azure Compute 🔴

> **Goal:** Learn Azure Compute from a DevOps Engineer + interview +
> production perspective.
>
> **Priority:** 🔴 Must Know \| 🟡 Important \| 🟢 Good to Know

------------------------------------------------------------------------

# 8. Azure Virtual Machines 🔴🔴

## 8.1 What is an Azure VM?

An **Azure Virtual Machine (VM)** is a virtual server running inside
Azure.

You can use it to run:

-   Linux
-   Windows
-   Applications
-   Web servers
-   Databases
-   DevOps tools
-   Custom workloads

### Basic Architecture

``` text
                    Azure
                      |
                  Resource Group
                      |
                     VNet
                      |
                   Subnet
                      |
                     NIC
                      |
                 Azure VM
              ┌──────┴──────┐
              │             │
           OS Disk       Data Disk
```

### Interview Answer

> **Azure VM is an IaaS service that provides a virtual server where I
> can control the operating system, networking, disks and installed
> applications.**

------------------------------------------------------------------------

# 8.2 VM Creation 🔴

When creating a VM, you typically select:

``` text
VM Creation
    |
    +-- Subscription
    |
    +-- Resource Group
    |
    +-- Region
    |
    +-- Availability Options
    |
    +-- Image
    |
    +-- VM Size
    |
    +-- Administrator
    |
    +-- Authentication
    |
    +-- Disks
    |
    +-- Networking
    |
    +-- Management
```

## Important Selections

### 1. Region

Example:

``` text
Central India
East US
West Europe
```

Choose based on:

-   Application requirements
-   User location
-   Availability
-   Compliance/data residency
-   Cost

### 2. Image

Examples:

``` text
Ubuntu
Windows Server
Red Hat Enterprise Linux
SUSE Linux
```

The image provides the starting operating system.

### 3. VM Size

Determines:

-   CPU
-   RAM
-   Network capability
-   Disk performance limits
-   Cost

### 4. Authentication

For Linux:

``` text
SSH Key
```

is generally preferred over password authentication.

### 5. Networking

Select:

``` text
VNet
  ↓
Subnet
  ↓
NIC
  ↓
VM
```

You may configure:

-   Public IP
-   Private IP
-   NSG
-   Load balancer association

------------------------------------------------------------------------

# 8.3 Azure VM Sizes 🔴

VM size determines the compute resources available to the VM.

``` text
VM Size
   |
   +-- CPU
   +-- RAM
   +-- Network
   +-- Disk performance
   +-- Cost
```

Common VM families include:

  Family     Typical purpose
  ---------- ------------------------
  B-series   Burstable workloads
  D-series   General purpose
  E-series   Memory optimized
  F-series   Compute optimized
  M-series   Large memory workloads
  N-series   GPU workloads

### Easy Memory

``` text
D → General purpose
E → Memory
F → Compute
N → GPU
```

> Exact capabilities vary by VM generation and size, so check the
> selected SKU when designing production workloads.

------------------------------------------------------------------------

# 8.4 VM Image 🔴

An **image** is the template used to create a VM.

``` text
Ubuntu Image
     |
     v
Create VM
     |
     +-- VM1
     +-- VM2
     +-- VM3
```

Images can contain:

-   Operating system
-   Preinstalled software
-   Configuration

Examples:

``` text
Ubuntu 24.04
Windows Server
RHEL
```

------------------------------------------------------------------------

# 8.5 Managed Disks 🔴🔴

Azure Managed Disk is persistent block storage managed by Azure.

``` text
                Azure VM
                   |
          +--------+--------+
          |                 |
       OS Disk          Data Disk
          |                 |
      Managed Disk      Managed Disk
```

### Benefits

-   Azure manages storage infrastructure.
-   You don't manually manage storage accounts for normal VM disk
    operations.
-   Supports snapshots and disk-related management capabilities.
-   Different disk types provide different performance/cost
    characteristics.

------------------------------------------------------------------------

# 8.6 OS Disk 🔴

The **OS disk** contains the operating system.

``` text
OS Disk
   |
   +-- Linux OS
   +-- /etc
   +-- /var
   +-- /home
   +-- Applications
```

### Important

The OS disk is normally required for a VM.

------------------------------------------------------------------------

# 8.7 Data Disk 🔴

A **data disk** is used for application/user data.

``` text
VM
 |
 +-- OS Disk
 |      └── Operating System
 |
 +-- Data Disk
        └── Application Data
```

Example:

``` text
OS Disk
  → OS

Data Disk
  → /data
  → Database files
  → Application files
```

### Production Best Practice

Keep important application data separate from the OS disk when
appropriate.

------------------------------------------------------------------------

# 8.8 OS Disk vs Data Disk 🔴

  -----------------------------------------------------------------------
  OS Disk                             Data Disk
  ----------------------------------- -----------------------------------
  Contains operating system           Contains application/data

  Required for VM                     Added as needed

  Used for boot                       Used for persistent application
                                      data

  Usually not where large app data    Better for application data
  should live                         
  -----------------------------------------------------------------------

### Interview Answer

> **The OS disk contains the operating system required to boot the VM,
> while data disks are additional persistent disks used for application
> and user data.**

------------------------------------------------------------------------

# 8.9 Disk Types 🟡

Common managed disk types include:

-   Standard HDD
-   Standard SSD
-   Premium SSD
-   Premium SSD v2
-   Ultra Disk

``` text
Lower cost / performance
          |
     Standard HDD
          |
     Standard SSD
          |
      Premium SSD
          |
    Premium SSD v2
          |
       Ultra Disk
          |
Higher performance
```

Exact availability depends on VM size, region and configuration.

------------------------------------------------------------------------

# 8.10 NIC --- Network Interface Card 🔴🔴

NIC connects the VM to the Azure network.

``` text
VM
 |
 v
NIC
 |
 v
Subnet
 |
 v
VNet
```

NIC can have:

-   Private IP
-   Public IP association
-   NSG association
-   IP configuration

### Easy Memory

> **NIC = Network connection of the VM.**

------------------------------------------------------------------------

# 8.11 Private IP vs Public IP 🔴

## Private IP

Used for communication inside private networks.

``` text
VM1
 |
 | Private IP
 v
VM2
```

## Public IP

Used when the resource needs public internet connectivity.

``` text
Internet
   |
   v
Public IP
   |
   v
VM
```

### Production

Don't expose SSH/RDP directly to the internet unless required and
appropriately secured.

Prefer:

``` text
Admin
  |
  v
VPN / Bastion / Controlled Access
  |
  v
Private VM
```

------------------------------------------------------------------------

# 8.12 NSG --- Network Security Group 🔴🔴

NSG controls network traffic using rules.

``` text
Internet
   |
   v
 NSG
   |
   v
 NIC / Subnet
   |
   v
 VM
```

Rules can specify:

-   Source
-   Destination
-   Port
-   Protocol
-   Allow/Deny
-   Priority

Example:

``` text
Priority 100
Source: My IP
Port: 22
Action: Allow

Priority 110
Source: Internet
Port: 22
Action: Deny
```

### Important

Lower priority number = higher priority.

``` text
100 → evaluated before 200
200 → evaluated before 300
```

------------------------------------------------------------------------

# 8.13 SSH 🔴🔴

SSH is commonly used to connect to Linux VMs.

``` bash
ssh azureuser@<public-ip>
```

With an SSH key:

``` bash
ssh -i ~/.ssh/id_rsa azureuser@<public-ip>
```

### Troubleshooting SSH

``` text
1. VM running?
      ↓
2. Public/private IP correct?
      ↓
3. NSG allows TCP 22?
      ↓
4. Route correct?
      ↓
5. SSH service running?
      ↓
6. OS firewall allowing 22?
      ↓
7. Correct username?
      ↓
8. Correct SSH key?
```

Useful Linux commands:

``` bash
systemctl status ssh
```

or:

``` bash
systemctl status sshd
```

Check listening ports:

``` bash
ss -lntp
```

------------------------------------------------------------------------

# 8.14 VM Extensions 🔴

VM Extensions allow you to perform post-deployment configuration or
management tasks on VMs.

``` text
Azure VM
   |
   +-- VM Extension
          |
          +-- Install software
          +-- Run script
          +-- Configure monitoring
          +-- Security configuration
```

Examples:

-   Custom Script Extension
-   Azure Monitor Agent
-   Configuration/bootstrap tasks

### Example

``` text
Create VM
   |
   v
VM Extension
   |
   v
Install nginx
   |
   v
Start nginx
```

### Interview Answer

> **VM Extensions are Azure-managed components that help perform
> configuration, software installation, monitoring or other
> post-deployment tasks on VMs.**

------------------------------------------------------------------------

# 8.15 VM Bootstrapping 🔴

Instead of manually configuring every VM:

``` text
Create VM
    |
    v
Extension / cloud-init
    |
    v
Install packages
    |
    v
Configure application
    |
    v
Start service
```

Example:

``` bash
apt update
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

This is useful for DevOps automation.

------------------------------------------------------------------------

# 8.16 Availability Zones 🔴🔴

Availability Zones are physically separate locations within an Azure
region.

``` text
Azure Region
 |
 +-- Zone 1
 |     └── VM
 |
 +-- Zone 2
 |     └── VM
 |
 +-- Zone 3
       └── VM
```

If one zone has an infrastructure failure, workloads in another zone can
continue depending on the architecture.

### Example

``` text
Load Balancer
      |
      +------ Zone 1 → VM1
      |
      +------ Zone 2 → VM2
      |
      +------ Zone 3 → VM3
```

------------------------------------------------------------------------

# 8.17 Availability Sets 🔴

Availability Sets provide logical grouping of VMs to improve
availability within a datacenter through:

-   Fault domains
-   Update domains

``` text
Availability Set
 |
 +-- Fault Domain 1
 |      +-- VM1
 |
 +-- Fault Domain 2
 |      +-- VM2
 |
 +-- Update Domain 1
 +-- Update Domain 2
```

### Fault Domain

Protects against hardware/power/network failure affecting a physical
grouping.

### Update Domain

Controls planned maintenance grouping so not all VMs are updated
simultaneously.

------------------------------------------------------------------------

# 8.18 Availability Set vs Availability Zone 🔴🔴

  -----------------------------------------------------------------------
  Availability Set                    Availability Zone
  ----------------------------------- -----------------------------------
  Logical grouping of VMs             Physically separate zone

  Uses fault/update domains           Uses separate datacenter locations
                                      within region

  Protects against certain localized  Better isolation from zone-level
  hardware/maintenance failures       failures

  Older/common design                 Modern architecture for many
                                      workloads
  -----------------------------------------------------------------------

### Interview Answer

> **Availability Sets distribute VMs across fault and update domains,
> while Availability Zones place VMs in physically separate zones within
> an Azure region.**

------------------------------------------------------------------------

# 9. VM Scale Sets --- VMSS 🔴🔴🔴

## 9.1 What is VMSS?

**Azure Virtual Machine Scale Sets** allow you to deploy and manage a
group of identical or similar VMs as a scalable compute pool.

### Basic Architecture

``` text
                Internet
                   |
                   v
             Load Balancer
                   |
          +--------+--------+
          |        |        |
         VM1      VM2      VM3
          \        |       /
           \       |      /
             VM Scale Set
```

The VM instances are managed as part of one scale-set resource.

------------------------------------------------------------------------

# 9.2 Why VMSS?

Without VMSS:

``` text
VM1
VM2
VM3
VM4
VM5

Manual management
```

With VMSS:

``` text
              VMSS
                |
       +--------+--------+
       |        |        |
      VM1      VM2      VM3
```

Azure can manage instance count and scaling according to configured
policies.

### Common Use Cases

-   Web applications
-   API servers
-   Stateless application tiers
-   CI/CD worker fleets
-   Large-scale compute workloads

------------------------------------------------------------------------

# 9.3 VMSS Autoscaling 🔴🔴🔴

Autoscaling automatically changes the number of VM instances according
to configured rules.

### Scale Out

``` text
Normal Traffic

VMSS
 |
 +-- VM1
 +-- VM2
```

Traffic increases:

``` text
High CPU / High Demand
          |
          v
       Autoscale
          |
          v
VM1 + VM2 + VM3 + VM4
```

### Scale In

``` text
Low Demand
    |
    v
Scale In
    |
    v
VM1 + VM2
```

------------------------------------------------------------------------

# 9.4 Scale-Out vs Scale-In 🔴

### Scale-Out

Increase VM count.

``` text
2 VMs
  ↓
4 VMs
```

Used when demand increases.

### Scale-In

Decrease VM count.

``` text
4 VMs
  ↓
2 VMs
```

Used when demand decreases.

### Memory

``` text
OUT = Add instances
IN  = Remove instances
```

------------------------------------------------------------------------

# 9.5 Autoscaling Example 🔴

Suppose:

``` text
Minimum instances = 2
Maximum instances = 5
```

Rule:

``` text
Average CPU > 70%
       ↓
Add VM
```

Another rule:

``` text
Average CPU < 30%
       ↓
Remove VM
```

Architecture:

``` text
              VMSS
               |
        +------+------+
        |             |
       VM1           VM2
        |
   CPU > 70%
        |
        v
     Scale Out
        |
        v
       VM3
```

> Autoscale rules should be designed with stabilization/cooldown
> behavior and workload characteristics in mind so the system does not
> constantly scale in and out.

------------------------------------------------------------------------

# 9.6 VMSS Instance Count 🔴

Important concepts:

-   Minimum instance count
-   Maximum instance count
-   Current instance count
-   Manual scaling
-   Autoscaling

Example:

``` text
Minimum = 2
Maximum = 6
Current = 3
```

Current state:

``` text
VM1
VM2
VM3
```

If load increases:

``` text
VM1
VM2
VM3
VM4
VM5
```

------------------------------------------------------------------------

# 9.7 VMSS Upgrade Policies 🔴🔴

VMSS supports upgrade strategies that control how changes are applied to
instances.

Common concepts include:

-   Manual
-   Automatic
-   Rolling

### Manual

You control when instances are upgraded.

``` text
New Model
   |
   v
Manual upgrade
   |
   v
Instances
```

### Automatic

Instances are upgraded automatically according to the configured
behavior.

### Rolling

Instances are upgraded in batches.

``` text
10 VMs

Batch 1 → VM1 VM2
Batch 2 → VM3 VM4
Batch 3 → VM5 VM6
...
```

This helps reduce the risk of taking the entire fleet offline during an
update.

------------------------------------------------------------------------

# 9.8 VMSS Health Probes 🔴🔴

Health probes determine whether instances are healthy enough to receive
traffic.

``` text
Load Balancer
      |
      | Health Probe
      v
   VMSS
   / | \
 VM1 VM2 VM3
```

Example:

``` text
GET /health
```

Expected:

``` text
HTTP 200
```

If VM2 returns failure:

``` text
VM1 → Healthy
VM2 → Unhealthy
VM3 → Healthy
```

Traffic can be directed away from the unhealthy instance depending on
the load-balancing configuration.

### Important

> **VM running ≠ application healthy.**

A VM can be running while nginx/application is stopped.

------------------------------------------------------------------------

# 9.9 VMSS + Load Balancer 🔴🔴🔴

Typical production architecture:

``` text
                  Internet
                     |
                     v
              Public Load Balancer
                     |
             +-------+-------+
             |       |       |
            VM1     VM2     VM3
             \       |       /
              \      |      /
                  VMSS
```

For Layer-7 requirements:

``` text
Internet
   |
   v
Application Gateway
   |
   v
VM Scale Set
   |
   +-- VM1
   +-- VM2
   +-- VM3
```

Application Gateway is useful when you need:

-   HTTP/HTTPS routing
-   Host/path-based routing
-   WAF
-   TLS termination

------------------------------------------------------------------------

# 9.10 VMSS Deployment Flow 🔴

``` text
Create VMSS
    |
    v
Choose Image
    |
    v
Choose VM Size
    |
    v
Configure Networking
    |
    v
Configure Instance Count
    |
    v
Configure Load Balancer
    |
    v
Configure Health Probe
    |
    v
Configure Autoscaling
    |
    v
Deploy
```

------------------------------------------------------------------------

# 9.11 VM vs VMSS 🔴🔴

  VM                               VMSS
  -------------------------------- ---------------------------------------
  Individual VM                    Group of VM instances
  Manual scaling commonly used     Supports autoscaling
  Good for unique workloads        Good for repeated/stateless workloads
  One VM lifecycle                 Fleet lifecycle
  Manual management can increase   Centralized management

### Interview Answer

> **A VM is an individual compute instance, while VMSS manages a
> scalable group of VM instances and supports features such as
> autoscaling and fleet-level upgrades.**

------------------------------------------------------------------------

# 9.12 VMSS vs Availability Set 🔴

  -----------------------------------------------------------------------
  VMSS                                Availability Set
  ----------------------------------- -----------------------------------
  Scaling/fleet management            Availability grouping

  Autoscaling                         No autoscaling feature by itself

  Multiple VM instances               Multiple VMs

  Supports upgrade policies           Fault/update domains

  Ideal for scalable application      Useful for availability of VM-based
  tiers                               workloads
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 9.13 VMSS Production Architecture 🔴🔴🔴

``` text
                         Internet
                            |
                            v
                  Application Gateway
                     /           \
                    /             \
             WAF / Routing / TLS
                    |
                    v
              Backend Pool
                    |
                    v
                  VMSS
          +---------+---------+
          |         |         |
         VM1       VM2       VM3
          |         |         |
          +---------+---------+
                    |
                 Health
                 Probes
                    |
                    v
                Autoscale
              /           \
          Scale Out     Scale In
```

------------------------------------------------------------------------

# 9.14 Practical VMSS Scenario 🔴🔴

### Requirement

A company runs a web application.

Normal traffic:

``` text
2 VMs
```

Peak traffic:

``` text
5 VMs
```

Design:

``` text
Internet
   |
   v
Load Balancer
   |
   v
VMSS
   |
   +-- VM1
   +-- VM2
   +-- VM3
   +-- VM4
   +-- VM5
```

Configuration:

``` text
Minimum = 2
Maximum = 5

CPU > 70%
    ↓
Scale Out

CPU < 30%
    ↓
Scale In
```

Health:

``` text
/health
```

If one VM fails:

``` text
VM1 → Healthy
VM2 → Healthy
VM3 → Unhealthy
```

The load balancer stops sending normal traffic to the unhealthy
instance, subject to its configured health probe and backend behavior.

------------------------------------------------------------------------

# 10. VM Troubleshooting 🔴🔴

## Scenario: VM is unreachable

Use this sequence:

``` text
VM Status
   ↓
IP Address
   ↓
NIC
   ↓
Subnet
   ↓
NSG
   ↓
Route Table
   ↓
Public IP / Private connectivity
   ↓
OS Firewall
   ↓
Service
   ↓
Application
```

### Useful Commands

Check IP:

``` bash
ip addr
```

Check routes:

``` bash
ip route
```

Check listening ports:

``` bash
ss -lntp
```

Check service:

``` bash
systemctl status nginx
```

Test locally:

``` bash
curl localhost
```

Test a port:

``` bash
nc -vz <IP> 80
```

------------------------------------------------------------------------

# 10.1 Scenario: SSH Not Working 🔴🔴

``` text
User
 |
 v
Public IP
 |
 v
NSG TCP/22
 |
 v
NIC
 |
 v
VM
 |
 v
OS Firewall
 |
 v
SSH Service
```

Check:

``` bash
systemctl status ssh
```

Then:

``` bash
ss -lntp | grep :22
```

Check NSG:

``` text
Source → Your IP
Destination Port → 22
Action → Allow
```

Do not unnecessarily expose:

``` text
TCP 22 → Internet → Allow
```

------------------------------------------------------------------------

# 10.2 Scenario: VM is Running but Website is Down 🔴🔴

Important interview scenario.

``` text
VM Status
   ↓
Running
   ↓
Website?
   ↓
No
```

Don't assume the VM is healthy.

Check:

``` bash
systemctl status nginx
```

Then:

``` bash
ss -lntp
```

Then:

``` bash
curl localhost
```

Then check:

``` text
NSG
Route
Load Balancer/App Gateway
Health Probe
Application logs
```

### Key Interview Statement

> **A VM being in the Running state only tells me that the VM
> infrastructure is running. I still need to verify the application,
> listening port, health probe and network path.**

------------------------------------------------------------------------

# 10.3 Scenario: VMSS Not Scaling 🔴🔴

Check:

``` text
1. Autoscale enabled?
        ↓
2. Min/max count correct?
        ↓
3. Scale rule correct?
        ↓
4. Metric being collected?
        ↓
5. Threshold reached?
        ↓
6. Cooldown/stabilization behavior?
        ↓
7. Autoscale activity/logs?
        ↓
8. Subscription/VM quota?
```

------------------------------------------------------------------------

# 10.4 Scenario: VMSS Instance Unhealthy 🔴🔴

Check:

``` text
VM running?
    ↓
Application running?
    ↓
Port listening?
    ↓
Health endpoint working?
    ↓
NSG allowing probe?
    ↓
Load Balancer probe configuration?
```

Test application locally:

``` bash
curl http://localhost/health
```

Expected:

``` text
HTTP 200
```

------------------------------------------------------------------------

# 11. Must-Know Azure Compute Checklist 🔴🔴

Before an interview, make sure you can explain:

-   [ ] Azure VM
-   [ ] VM creation
-   [ ] VM size
-   [ ] VM image
-   [ ] Managed Disk
-   [ ] OS Disk
-   [ ] Data Disk
-   [ ] Disk types
-   [ ] NIC
-   [ ] Private IP
-   [ ] Public IP
-   [ ] NSG
-   [ ] SSH
-   [ ] VM Extensions
-   [ ] VM bootstrapping
-   [ ] Availability Set
-   [ ] Fault Domain
-   [ ] Update Domain
-   [ ] Availability Zone
-   [ ] VM Scale Set
-   [ ] VMSS instance count
-   [ ] Scale-out
-   [ ] Scale-in
-   [ ] Autoscaling
-   [ ] VMSS upgrade policies
-   [ ] Health probes
-   [ ] Load Balancer + VMSS
-   [ ] VM troubleshooting
-   [ ] VMSS troubleshooting

------------------------------------------------------------------------

# 12. Final Interview Cheat Sheet 🔴🔴🔴

``` text
VM
 ↓
Compute Instance

Image
 ↓
OS Template

VM Size
 ↓
CPU + RAM + Network + Performance

NIC
 ↓
VM Network Connection

NSG
 ↓
Allow / Deny Network Traffic

OS Disk
 ↓
Operating System

Data Disk
 ↓
Application Data

VM Extension
 ↓
Post-deployment Configuration

Availability Set
 ↓
Fault + Update Domains

Availability Zone
 ↓
Physically Separate Zone

VMSS
 ↓
Group of Scalable VMs

Autoscale
 ↓
Scale Out / Scale In

Health Probe
 ↓
Healthy / Unhealthy Backend
```

------------------------------------------------------------------------

# 🔥 Most Important Interview Questions

## Q1. What is Azure VM?

> Azure VM is an IaaS compute service that provides a virtual server
> where I control the OS, networking, disks and applications.

## Q2. What is a managed disk?

> Managed Disk is Azure-managed persistent block storage used by Azure
> VMs for OS and data storage.

## Q3. OS disk vs data disk?

> OS disk contains the operating system, while data disks are used for
> application and persistent data.

## Q4. What is an NSG?

> NSG is a network security control that allows or denies traffic based
> on source, destination, port, protocol and priority.

## Q5. What is a VMSS?

> VMSS is an Azure service that manages a group of VM instances and
> supports scaling and fleet-level management.

## Q6. What is autoscaling?

> Autoscaling automatically increases or decreases VMSS instance count
> based on configured metrics and rules.

## Q7. What is a health probe?

> A health probe checks whether a backend instance is healthy enough to
> receive traffic.

## Q8. VM running but application unavailable --- what do you check?

> I check the application service, listening port, OS firewall, NSG,
> routing, load balancer or Application Gateway health probe, and
> application logs.

## Q9. Availability Set vs Availability Zone?

> Availability Sets use fault and update domains to improve VM
> availability, while Availability Zones use physically separate zones
> within an Azure region.

## Q10. Why use VMSS?

> VMSS is useful when I need multiple similar VM instances with
> centralized management, autoscaling, health-based traffic distribution
> and controlled upgrades.

------------------------------------------------------------------------

# 🧠 Senior DevOps Mental Model

``` text
                 AZURE COMPUTE
                      |
        +-------------+-------------+
        |                           |
       VM                          VMSS
        |                           |
   +----+----+              +-------+-------+
   |    |    |              |       |       |
 NIC  Disk NSG             VM1     VM2     VM3
   |                           \     |     /
   |                            \    |    /
   +---- VNet                    Load Balancer
                                     |
                                Health Probe
                                     |
                                  Autoscale
                                /          \
                           Scale Out     Scale In
```

### Final Sentence to Remember

> **Azure VM provides individual IaaS compute, while VM Scale Sets
> provide a managed group of VM instances with autoscaling, health-based
> traffic distribution and controlled upgrades. Networking is provided
> through NICs/VNets, traffic is controlled by NSGs, storage uses
> managed disks, and availability can be improved using Availability
> Zones or Availability Sets.**
