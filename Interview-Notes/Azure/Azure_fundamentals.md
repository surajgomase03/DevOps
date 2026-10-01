# ☁️ Azure Fundamentals — Phase 1: Core Concepts (Interview Notes)

> **One-liner:** Azure resources live in a **Resource Group**, inside a **Subscription**, organized by **Management Groups** under a **Microsoft Entra tenant**. Everything is created through **Azure Resource Manager (ARM)**, and physically deployed in a **Region** (optionally across **Availability Zones**).

---

## 📑 Contents

1. [Azure Regions](#1-azure-regions)
2. [Availability Zones](#2-availability-zones)
3. [Subscriptions](#3-subscriptions)
4. [Management Groups](#4-management-groups)
5. [Resource Groups](#5-resource-groups)
6. [Azure Resource Manager (ARM)](#6-azure-resource-manager-arm)
7. [Azure Resources](#7-azure-resources)
8. [Azure Portal](#8-azure-portal)
9. [Azure CLI](#9-azure-cli)
10. [Azure PowerShell](#10-azure-powershell)
11. [Azure Cloud Shell](#11-azure-cloud-shell)
12. [Azure Service Health](#12-azure-service-health)
13. [Azure Pricing Basics](#13-azure-pricing-basics)
14. [Most Important Hierarchy](#14-most-important-hierarchy)
15. [One-Line Revision Table](#15-one-line-revision-table)
16. [Command Cheat Sheet](#16-command-cheat-sheet)
17. [Interview Questions](#17-interview-questions)
18. [DevOps Interview Flow](#18-devops-interview-flow)

---

# 1. Azure Regions

* **Azure Region** = a geographical location containing one or more Azure datacenters.
* Examples: `Central India`, `South India`, `West Europe`, `East US`.
* Regions are connected through Microsoft's global network.

### Choose a region based on

| Factor | Why it matters |
| --- | --- |
| User/application location | Lower latency |
| Latency | Faster response times |
| **Data residency** | Where your data is physically stored (legal/compliance) |
| Service availability | Not every service exists in every region |
| Pricing | Prices differ by region |
| Disaster recovery needs | Pick a suitable paired/secondary region |

### Region Pair

A **region pair** = two Azure regions in the same geography, used to improve **resiliency** (the ability of a system to handle failures and recover without major impact) and disaster recovery.

```text
Primary → Central India
DR      → South India
```

> 🎤 **Interview:** *What is an Azure region?*
> An Azure region is a geographical area containing one or more Azure datacenters where Azure resources can be deployed.

---

# 2. Availability Zones

* **Availability Zone (AZ)** = physically separate datacenter locations **within an Azure region**.
* Each zone has **independent power, cooling and networking**.
* Purpose: protect applications from **datacenter-level failures**.

```text
Azure Region: Central India

 ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
 │ Availability  │   │ Availability  │   │ Availability  │
 │    Zone 1     │   │    Zone 2     │   │    Zone 3     │
 └───────────────┘   └───────────────┘   └───────────────┘
```

Deploy supported resources across multiple zones:

```text
VM1 → Zone 1
VM2 → Zone 2
VM3 → Zone 3        → improves high availability
```

### Zonal vs zone-redundant

| Type | Meaning |
| --- | --- |
| **Zonal** | Resource is pinned to **one specific zone** (for example a VM in Zone 1) |
| **Zone-redundant** | The service automatically spreads/replicates across zones (for example zone-redundant storage) |

> ⚠️ Not every region has Availability Zones, and not every service supports them.

### Remember

```text
Region = geographical location
Zone   = physically separate datacenter location inside a region
```

---

# 3. Azure Subscriptions

* A **subscription** is a **logical and billing boundary** for Azure resources.
* Azure resources are created **inside a subscription**.
* A subscription is associated with:
  * Billing
  * Access control
  * Resource limits (quotas)
  * **Governance** (rules, policies and controls used to manage resources properly)
* One organization can have **multiple subscriptions**.

```text
Company
   |
   ├── Production Subscription
   ├── Development Subscription
   └── Testing Subscription
```

### Why multiple subscriptions?

* Separate environments (prod / dev / test)
* Separate billing
* Security isolation
* Different RBAC requirements
* Governance and quota isolation

> 🎤 **Interview:** *What is an Azure subscription?*
> A subscription is a logical boundary used to organize Azure resources, manage access, quotas and billing.

---

# 4. Management Groups

* **Management Group** = a container used to organize **multiple Azure subscriptions**.
* Main purpose: apply **governance at large scale**.
* **Azure Policy** and **RBAC** assigned to a management group are **inherited** by everything beneath it.

```text
Root Management Group
        |
   ┌────┴─────┐
   |          |
Production   Non-Production
   |             |
 Sub A         Sub C
 Sub B         Sub D
```

* Management groups can be nested (up to 6 levels deep, not counting the root and the subscription level).

> **Remember:** Management Group → manages subscriptions.

---

# 5. Resource Groups

* **Resource Group (RG)** = a logical container for Azure resources.
* Resources in one RG can belong to **different Azure services**.

```text
Resource Group: prod-rg

 ├── Virtual Machine
 ├── VNet
 ├── NSG
 ├── Load Balancer
 └── Storage Account
```

### Important points

* Every Azure resource belongs to **exactly one** resource group.
* A resource group belongs to **a single subscription**.
* Resources in the same RG **can be in different regions**.
* RGs help with: organization, access control, monitoring, lifecycle management and cost management.

### ⭐ Important interview point

> If you **delete a resource group**, the resources inside it are generally **deleted as well**.
> Use **resource locks** (`CanNotDelete` / `ReadOnly`) to protect important resource groups.

### Remember

```text
Management Group → Subscription
Subscription     → Resource Group
Resource Group   → Resources
```

---

# 6. Azure Resource Manager (ARM)

* **ARM** is Azure's **management layer** (control plane).
* It provides a consistent way to: create, update and delete resources, manage access, apply policies and organize resources.
* Every tool goes through ARM, so the same RBAC, policies, locks and tags apply regardless of the tool.

```text
User
 |
 +---- Azure Portal
 +---- Azure CLI
 +---- PowerShell
 +---- Terraform
 +---- ARM / Bicep templates
 |
 ▼
Azure Resource Manager
 |
 ▼
Azure Resources
```

### ARM templates (Infrastructure as Code)

* ARM supports **IaC** using **ARM templates**, which are **JSON-based**.
* Used to deploy Azure infrastructure **consistently and repeatably**.
* **Bicep** is a simpler language that compiles to ARM templates.
* ARM templates are **declarative** and **idempotent**.

> 🎤 **Interview:** *What is ARM?*
> Azure Resource Manager is the management layer of Azure that provides a consistent API and control plane for creating, managing, securing and organizing Azure resources.

---

# 7. Azure Resources

* A **resource** = an individual Azure service/component that you create and manage.

**Examples:** Virtual Machine, Virtual Network, Subnet, Storage Account, Key Vault, Load Balancer, Azure Kubernetes Service (AKS), Azure SQL Database, Public IP, Network Security Group.

```text
Resource Group
      |
      ├── VNet
      ├── Subnet
      ├── VM
      ├── NSG
      └── Public IP
```

### Every resource has

| Property | Example |
| --- | --- |
| Name | `my-prod-vm` |
| Resource type | `Microsoft.Compute/virtualMachines` |
| Region | `centralindia` |
| Subscription | `Production` |
| Resource group | `prod-rg` |

**Naming examples:** `my-prod-vm`, `my-prod-vnet`, `my-prod-storage`

### Tags

* **Tags** are `key:value` labels on resources and resource groups, for example `env:prod`, `owner:devops`, `costcenter:1234`.
* Used for **organization, cost reporting and automation**.

---

# 8. Azure Portal

* **Azure Portal** = web-based graphical interface for managing Azure → `https://portal.azure.com`

### What you can do

* Create resources, configure VMs, create VNets
* Monitor resources, view costs
* Configure RBAC, manage storage
* View Service Health, configure alerts

| ✅ Advantages | ❌ Disadvantages |
| --- | --- |
| Easy for beginners | Manual operations are hard to reproduce |
| Visual representation of resources | Not ideal for large-scale infrastructure deployment |
| Useful for troubleshooting | Higher risk of configuration drift |

> **For DevOps:** prefer automation with Terraform, Azure CLI, PowerShell, Bicep/ARM or pipelines where appropriate.

---

# 9. Azure CLI

* **Azure CLI** = command-line tool for managing Azure (`az` commands).
* Works on **Windows, Linux, macOS** and **Azure Cloud Shell**.

```bash
az login
az account list
az account show
az group create --name my-rg --location centralindia
az resource list
```

### DevOps usage

* CI/CD pipelines
* Automation scripts
* Infrastructure management
* Troubleshooting

---

# 10. Azure PowerShell

* Manages Azure through PowerShell **cmdlets** (the `Az` module).
* Commonly used by Windows administrators and automation teams.

```powershell
Connect-AzAccount
Get-AzResourceGroup
New-AzResourceGroup -Name my-rg -Location CentralIndia
```

### Azure CLI vs Azure PowerShell

| Azure CLI | Azure PowerShell |
| --- | --- |
| `az` commands | `Az` cmdlets |
| Cross-platform | Cross-platform |
| Popular in DevOps/scripts | Popular with PowerShell admins |
| Example: `az vm list` | Example: `Get-AzVM` |
| Output is JSON by default | Output is objects |

---

# 11. Azure Cloud Shell

* **Cloud Shell** = browser-accessible command-line environment provided by Azure (`https://shell.azure.com` or from the Portal).
* No need to install Azure CLI or PowerShell locally.

```text
Azure Portal
     |
 Cloud Shell
   /       \
Bash     PowerShell
```

### Important features

* **Pre-authenticated** with your Azure account
* Azure CLI and Azure PowerShell available
* Can work with Azure resources directly
* Persistent storage through a storage account / file share

### When is it useful?

* Quick administration and troubleshooting
* Running CLI commands
* Learning Azure
* Working from a machine without Azure CLI installed

---

# 12. Azure Service Health

Azure Service Health provides information about Azure **service availability and issues** that may affect your resources.

| Area | Scope | Shows |
| --- | --- | --- |
| **Azure Status** | Overall Azure (global) | Broad service outages |
| **Service Health** | Services/regions **you use** | Service issues, planned maintenance, health advisories |
| **Resource Health** | A **specific resource** | VM unavailable, degraded or healthy |

```text
Azure Status    → Overall Azure
Service Health  → Services/regions affecting you
Resource Health → Specific resource
```

> You can create **Service Health alerts** to be notified of incidents and planned maintenance.

---

# 13. Azure Pricing Basics

Azure generally follows a **pay-as-you-go** cloud pricing model: you pay for the resources/services you consume.

### Common cost factors

* Compute usage
* Storage capacity
* Network traffic
* Database usage
* Number of requests/operations
* Data transfer
* Reserved capacity/commitment options

```text
VM
 |
 ├── Compute cost
 ├── Disk cost
 ├── Public IP
 └── Network / data transfer (egress)
```

### Pricing concepts

| Option | What it means |
| --- | --- |
| **Pay-As-You-Go** | Pay for actual consumption. No long-term commitment |
| **Reservations** | Commit to specific resources for a period. Discounted compared with equivalent pay-as-you-go |
| **Azure Savings Plan** | Commit to a certain amount of eligible **compute spend**. Savings versus pay-as-you-go |
| **Spot VMs** | Use spare capacity at a discount, but they can be **evicted** |
| **Azure Hybrid Benefit** | Use existing eligible on-premises licenses to reduce cost |
| **Free tier** | Certain services/free amounts, subject to eligibility and limits |

### Cost tools

| Tool | Purpose |
| --- | --- |
| **Pricing Calculator** | Estimate the cost of a planned solution |
| **TCO Calculator** | Compare on-premises vs Azure costs |
| **Cost Management + Billing** | Monitor spending, analyze costs, create budgets, set alerts, identify trends |
| **Azure Advisor** | Recommendations, including cost optimization |
| **Tags** | Allocate costs to teams/projects |

---

# 14. Most Important Hierarchy

### 🔥 Memorize this

```text
Microsoft Entra Tenant
        ↓
Management Group
        ↓
Subscription
        ↓
Resource Group
        ↓
Resources
```

And the physical layout:

```text
Region
  ↓
Availability Zones
  ↓
Azure Resources
```

### Both views together

```text
LOGICAL (management)                    PHYSICAL (location)

Entra Tenant                            Geography
   └─ Management Group                     └─ Region (paired with another region)
        └─ Subscription                         └─ Availability Zones 1, 2, 3
             └─ Resource Group                        └─ Datacenters
                  └─ Resources
```

> **Policy and RBAC are inherited downward** through this hierarchy (Management Group → Subscription → Resource Group → Resource).

---

# 15. One-Line Revision Table

| Topic | Remember |
| --- | --- |
| **Region** | Geographical Azure location |
| **Availability Zone** | Separate datacenter location within a region |
| **Subscription** | Billing + management boundary |
| **Management Group** | Organizes subscriptions |
| **Resource Group** | Logical container for resources |
| **ARM** | Azure resource management / control layer |
| **Resource** | Individual Azure service/component |
| **Portal** | GUI for Azure |
| **CLI** | Command-line Azure management |
| **PowerShell** | Azure management using PowerShell |
| **Cloud Shell** | Browser-based CLI/PowerShell environment |
| **Service Health** | Information about Azure/service/resource health |
| **Pricing** | Pay for consumed resources/services |

---

# 16. Command Cheat Sheet

## 16.1 Azure CLI

### Login and subscriptions

```bash
az login
az account list --output table
az account show
az account set --subscription "<name-or-id>"
az account list-locations --output table       # list regions
```

### Resource groups

```bash
az group create --name my-rg --location centralindia
az group list --output table
az group show --name my-rg
az group delete --name my-rg --yes --no-wait
az group exists --name my-rg
```

### Resources

```bash
az resource list --resource-group my-rg --output table
az resource show --ids <resource-id>
az resource list --tag env=prod
```

### Tags and locks

```bash
az group update --name my-rg --tags env=prod owner=devops
az lock create --name no-delete --lock-type CanNotDelete --resource-group my-rg
az lock list --resource-group my-rg
```

### Deploy a template (ARM / Bicep)

```bash
az deployment group create \
  --resource-group my-rg \
  --template-file main.bicep
```

### Zones (example: VM in Zone 1)

```bash
az vm create \
  --resource-group my-rg \
  --name vm1 \
  --image Ubuntu2204 \
  --zone 1
```

### Management groups

```bash
az account management-group list
az account management-group create --name prod-mg
```

## 16.2 Azure PowerShell

```powershell
Connect-AzAccount
Get-AzSubscription
Set-AzContext -Subscription "<name-or-id>"

Get-AzResourceGroup
New-AzResourceGroup -Name my-rg -Location CentralIndia
Remove-AzResourceGroup -Name my-rg -Force

Get-AzResource -ResourceGroupName my-rg
Get-AzVM
```

---

# 17. Interview Questions

**Q1. What is an Azure region?**
> A geographical area containing one or more Azure datacenters where resources can be deployed.

**Q2. What is an Availability Zone?**
> A physically separate datacenter location within a region, with independent power, cooling and networking. It protects against datacenter-level failures.

**Q3. Region vs Availability Zone?**
> A region is a geographical location. A zone is a separate datacenter location inside that region.

**Q4. What is a region pair?**
> Two regions in the same geography used together for resiliency and disaster recovery, for example Central India and South India.

**Q5. What is a subscription?**
> A logical boundary for organizing resources, managing access and quotas, and billing.

**Q6. Why use multiple subscriptions?**
> Environment separation (prod/dev/test), billing separation, security isolation, different RBAC needs and quota isolation.

**Q7. What is a management group?**
> A container for organizing multiple subscriptions so policies and access can be applied at scale and inherited.

**Q8. What is a resource group?**
> A logical container for Azure resources that share a lifecycle. Each resource belongs to exactly one resource group.

**Q9. What happens when you delete a resource group?**
> The resources inside it are generally deleted too. Resource locks can prevent accidental deletion.

**Q10. Can resources in one resource group be in different regions?**
> Yes. The resource group has its own location (for metadata), but its resources can be in different regions.

**Q11. What is ARM?**
> The management layer of Azure providing a consistent API and control plane for creating, managing, securing and organizing resources. The Portal, CLI, PowerShell, Terraform and templates all go through ARM.

**Q12. What is an ARM template?**
> A JSON-based, declarative IaC file for deploying Azure resources consistently. Bicep is the simpler language that compiles to it.

**Q13. Azure CLI vs PowerShell?**
> Both are cross-platform. CLI uses `az` commands and is popular in DevOps scripts. PowerShell uses `Az` cmdlets and is popular with PowerShell admins.

**Q14. What is Cloud Shell?**
> A browser-based, pre-authenticated shell (Bash or PowerShell) with Azure CLI and PowerShell available and persistent storage. No local installation is needed.

**Q15. Azure Status vs Service Health vs Resource Health?**
> Azure Status is global. Service Health is personalized to the services and regions you use. Resource Health is for a specific resource.

**Q16. How does Azure pricing work?**
> Pay-as-you-go based on consumption (compute, storage, network, database, requests), with discount options such as Reservations, Savings Plans and Spot VMs.

**Q17. Reservation vs Savings Plan?**
> A Reservation commits to specific resources for a period. A Savings Plan commits to an hourly amount of eligible compute spend and is more flexible.

**Q18. What is the Azure hierarchy?**
> Entra tenant → management groups → subscriptions → resource groups → resources.

**Q19. How would you reduce Azure costs?**
> Right-size resources, use Reservations/Savings Plans, shut down unused resources, use Spot VMs for interruptible workloads, use tags for cost allocation, set budgets and alerts, and review Azure Advisor recommendations.

---

# 18. DevOps Interview Flow

If the interviewer asks:

### *"How do you deploy an application/infrastructure in Azure?"*

```text
Azure Tenant
     ↓
Subscription
     ↓
Resource Group
     ↓
Region / Availability Zone
     ↓
VNet
     ↓
Subnet
     ↓
Azure Resources
     ↓
Application
     ↓
Monitoring + Service Health
     ↓
Cost Management
```

### ⭐ One-line interview answer

> **In Azure I work inside a tenant and subscription, group resources into resource groups, and deploy to a region (across Availability Zones for high availability) through Azure Resource Manager. I use IaC such as Terraform, Bicep or ARM templates and CI/CD pipelines for repeatable deployments, apply governance with RBAC, Azure Policy, tags and locks, and monitor with Service Health, Azure Monitor and Cost Management.**

> This gives you the foundation before moving into Azure networking, compute, storage, identity and Azure DevOps.
