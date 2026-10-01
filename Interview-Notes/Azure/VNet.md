# 🌐 Azure VNet — Complete Interview + Practical Notes

> **One-liner:** A **VNet** is a private, isolated network in Azure. You split it into **subnets**, filter traffic with **NSGs**, steer traffic with **route tables/UDRs**, connect networks with **peering/VPN**, and reach PaaS services privately with **Service Endpoints** or **Private Endpoints (+ Private DNS)**.

For a DevOps interview, learn VNet as **how traffic actually flows**, how you **secure** it, and how you **troubleshoot** it. Not just definitions.

---

## 📑 Contents

1. [What is a VNet](#1-what-is-a-vnet)
2. [Address Space & CIDR](#2-address-space--cidr)
3. [Subnets](#3-subnets)
4. [Private IP vs Public IP](#4-private-ip-vs-public-ip)
5. [NIC](#5-nic-network-interface)
6. [NSG](#6-nsg--network-security-group)
7. [Routing: Route Tables, UDR, System Routes](#7-routing-route-tables-udr-system-routes)
8. [VNet Peering](#8-vnet-peering)
9. [Service Endpoint vs Private Endpoint](#9-service-endpoint-vs-private-endpoint)
10. [Private DNS](#10-private-dns-very-important)
11. [Connecting to On-Premises (VPN / ExpressRoute)](#11-connecting-to-on-premises)
12. [Outbound Internet Access](#12-outbound-internet-access)
13. [NSG vs Route Table vs Azure Firewall](#13-nsg-vs-route-table-vs-azure-firewall)
14. [Full Architecture & Traffic Flow](#14-full-architecture--traffic-flow)
15. [Command Cheat Sheet](#15-command-cheat-sheet)
16. [Practical Lab](#16-practical-lab)
17. [Troubleshooting](#17-troubleshooting)
18. [Interview Questions & Answers](#18-interview-questions--answers)
19. [Final Memory Map](#19-final-memory-map)

---

# 1. What is a VNet

* **VNet (Virtual Network)** is a **logically isolated network** in Azure.
* It lets Azure resources communicate with each other, the internet, on-premises networks and other VNets.
* Similar to an **AWS VPC**.

```text
                    Internet
                       |
                  Public IP
                       |
                ┌────────────┐
                │    VM      │
                │    NIC     │
                └─────┬──────┘
                      |
                 ┌────▼─────┐
                 │ Subnet   │
                 └────┬─────┘
                      |
              ┌───────▼────────┐
              │      VNet      │
              │ 10.0.0.0/16    │
              └────────────────┘
```

## 1.1 AWS → Azure mapping

| AWS | Azure |
| --- | --- |
| VPC | **VNet** |
| Subnet | Subnet |
| Security Group | **NSG** |
| NACL | NSG on the **subnet** (closest equivalent) |
| Route Table | Route Table |
| ENI | **NIC** |
| Internet Gateway | Built-in internet connectivity (public IP / NAT Gateway) |
| NAT Gateway | **NAT Gateway** |
| VPC Peering | **VNet Peering** |
| PrivateLink / Interface Endpoint | **Private Endpoint** |
| VPC Endpoint | Service Endpoint / Private Endpoint (depends on use case) |
| Transit Gateway | Virtual WAN / hub-and-spoke |

## 1.2 Scope facts (good interview points)

* A VNet is **regional** and belongs to **one subscription**.
* A VNet can have **multiple address spaces**.
* A **subnet can span all Availability Zones** in the region. (In AWS a subnet lives in one AZ.)
* Traffic between subnets in the same VNet is allowed and routed automatically (unless you block it with NSGs or UDRs).

---

# 2. Address Space & CIDR

**VNet address space** = the range of private IP addresses available inside the VNet.

```text
VNet Address Space: 10.0.0.0/16
Range:              10.0.0.0 → 10.0.255.255   (65,536 addresses)
```

**CIDR** = Classless Inter-Domain Routing. `/16` means the first 16 bits are the **network portion**.

> **Smaller `/number` → more IPs.** `/16` has many IPs, `/24` fewer, `/28` very few.

| CIDR | Total IPs | Usable in Azure (minus 5) | Typical use |
| --- | ---: | ---: | --- |
| `/16` | 65,536 | n/a | VNet |
| `/24` | 256 | **251** | Common subnet |
| `/25` | 128 | 123 | Subnet |
| `/26` | 64 | 59 | Subnet (Firewall/Bastion minimum) |
| `/27` | 32 | 27 | Small subnet (Gateway) |
| `/28` | 16 | 11 | Very small subnet |
| `/29` | 8 | 3 | **Smallest** subnet Azure allows |

## 2.1 Example design

```text
VNet: 10.0.0.0/16
│
├── Web Subnet   10.0.1.0/24
├── App Subnet   10.0.2.0/24
└── DB Subnet    10.0.3.0/24
```

## 2.2 ⭐ Azure reserves 5 IPs in every subnet

For `10.0.1.0/24`:

| IP | Purpose |
| --- | --- |
| `10.0.1.0` | Network address |
| `10.0.1.1` | Azure default gateway |
| `10.0.1.2` | Azure DNS mapping |
| `10.0.1.3` | Azure DNS mapping |
| `10.0.1.255` | Broadcast address (reserved, though Azure doesn't support broadcast) |

```text
256 total − 5 reserved = 251 usable
```

> **Easy memory:** Azure subnet usable IPs = **Total IPs − 5**.

## 2.3 Rules

* Subnet ranges must **fit inside** the VNet address space.
* Subnets in the same VNet **must not overlap**.
* Plan address spaces **before** creating VNets. VNets that will be peered or connected to on-premises **must not overlap**.

> 🎤 **Interview answer:** *"VNet address space defines the IP range of an Azure Virtual Network using CIDR notation. For example, `10.0.0.0/16` covers `10.0.0.0` to `10.0.255.255`, which can be divided into smaller subnets. Azure reserves five addresses in each subnet, so a /24 has 251 usable addresses."*

---

# 3. Subnets

A **subnet** is a smaller IP network inside a VNet.

```text
VNet: 10.0.0.0/16
        |
        +--- Web subnet → 10.0.1.0/24
        +--- App subnet → 10.0.2.0/24
        +--- DB subnet  → 10.0.3.0/24
```

### Why use subnets?

* **Network segmentation**: dividing one large network into smaller separate networks to improve security, control and limit unwanted communication
* Security (NSGs per subnet)
* Application tiers (web / app / DB)
* Routing (route tables per subnet)
* Isolation

```text
Internet → Web Subnet → App Subnet → DB Subnet
```

NSGs and route tables control traffic between these tiers.

### Special-purpose subnets (fixed names)

| Subnet name | Used for |
| --- | --- |
| `GatewaySubnet` | VPN Gateway / ExpressRoute Gateway |
| `AzureFirewallSubnet` | Azure Firewall (minimum `/26`) |
| `AzureBastionSubnet` | Azure Bastion (minimum `/26`) |

> **Can two subnets overlap?** No. Subnet ranges in a VNet must fit within the address space and must not overlap.

---

# 4. Private IP vs Public IP

## 4.1 Private IP

* Used for communication **inside private networks**.
* Not directly reachable from the public internet.
* Assigned to a NIC from the subnet range (dynamic by default, or static).

```text
VM1  10.0.1.10   ←→   VM2  10.0.2.10     (if routing and NSG rules allow)
```

**Private ranges (RFC 1918):**

```text
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
```

## 4.2 Public IP

* Gives a **public-facing address** to supported resources.

```text
Internet → Public IP → Azure resource
```

**Common uses:** public-facing VM, Load Balancer, Application Gateway, NAT Gateway, Azure Firewall, VPN Gateway.

| Private IP | Public IP |
| --- | --- |
| Internal communication | Internet-facing communication |
| RFC 1918 address | Internet-routable address |
| Used inside VNet/private connectivity | Used for public connectivity |
| Not directly internet reachable | Reachable depending on resource and security rules |

> Use **Standard SKU** public IPs (static, zone-capable, secure by default, meaning closed to inbound traffic until an NSG allows it). Basic SKU public IPs are retired or being retired.

### ⭐ Interview trick

> **Does assigning a public IP automatically make a VM reachable from the internet?**
> **No.** You also need correct NSG rules, routing, and the application and OS firewall configured to accept the traffic.

---

# 5. NIC (Network Interface)

* The **NIC** is the VM's network connection to the VNet. AWS equivalent: **ENI**.

```text
VM
 └── NIC
      ├── Private IP
      ├── Public IP association
      ├── NSG association
      └── Subnet
```

### What a NIC provides

* Private IP (and optional extra IP configurations)
* Public IP association
* NSG association
* Subnet membership
* Optional **IP forwarding** (needed when the VM acts as a router/firewall/NVA)
* Optional **accelerated networking**

### Why it matters

```text
VM → NIC → NSG → route selection → destination
```

* A VM can have **multiple NICs** (for example frontend and backend networks), all in the **same VNet**.
* The NIC is what the NSG, effective routes and effective security rules are checked against when troubleshooting.

> 🎤 **Interview line:** *"A NIC provides network connectivity to a VM. It holds the IP configuration and can have an NSG associated, and it connects the VM to a subnet in the VNet."*

---

# 6. NSG — Network Security Group

> One of the **most important Azure interview topics**.

**NSG** = a network traffic filtering mechanism with allow/deny rules. Rules match on **source, destination, port, protocol, direction, priority** and **action**.

```text
Internet
   | TCP 443
   ▼
NSG
   ├── Allow 443
   ├── Deny 22
   └── Deny other traffic
```

## 6.1 Rule structure

```text
Priority: 100
Name:     Allow-HTTPS
Source:   Internet
Destination: VM
Protocol: TCP
Destination Port: 443
Action:   Allow
```

* **Lower number = higher priority.** Custom rules use 100–4096.
* Evaluation **stops at the first matching rule**.

```text
100 → Allow SSH
200 → Deny SSH      ← never reached for SSH, because 100 matches first
```

## 6.2 Default rules

Azure creates default rules automatically. You **cannot delete** them, but you can **override** them with a higher-priority custom rule.

| Direction | Priority | Name | Action | Meaning |
| --- | ---: | --- | --- | --- |
| Inbound | 65000 | `AllowVnetInBound` | Allow | VNet-to-VNet traffic allowed |
| Inbound | 65001 | `AllowAzureLoadBalancerInBound` | Allow | Azure Load Balancer health probes |
| Inbound | 65500 | `DenyAllInBound` | **Deny** | Everything else denied |
| Outbound | 65000 | `AllowVnetOutBound` | Allow | VNet traffic allowed |
| Outbound | 65001 | `AllowInternetOutBound` | Allow | Internet-bound traffic allowed |
| Outbound | 65500 | `DenyAllOutBound` | **Deny** | Everything else denied |

```text
Traffic
   ↓
Custom rule 100 → 200 → 300 ...
   ↓ (no match)
Default rules 65000+
   ↓
Allow / Deny
```

```text
VNet traffic     → Allow
Unknown inbound  → Deny
```

> 🎤 **Interview line:** *"Azure NSGs have built-in default rules. Custom rules are evaluated first by priority. If none matches, the default rules apply."*

## 6.3 Where an NSG can be associated

```text
Subnet    OR    NIC     (or both)
```

> ❌ **An NSG cannot be associated with a VNet itself.**

When NSGs exist at **both** levels, **both must allow the traffic**:

```text
INBOUND:   Internet → [Subnet NSG] → [NIC NSG] → VM
OUTBOUND:  VM → [NIC NSG] → [Subnet NSG] → Internet
```

## 6.4 Helpful NSG features

| Feature | Purpose |
| --- | --- |
| **Service tags** | Named IP groups, for example `Internet`, `VirtualNetwork`, `AzureLoadBalancer`, `Storage` |
| **Application Security Groups (ASG)** | Group VMs logically (web, app, db) and use them as source/destination in rules |
| **NSG flow logs** | Log allowed/denied traffic for analysis |

## 6.5 NSG inbound and outbound

```text
INBOUND                                OUTBOUND
Internet                               VM
   | TCP 443                            |
Public IP                              NIC
   |                                    |
  NIC                                  NSG
   |                                    |
  NSG                                Internet
   |
  VM
```

## 6.6 ⭐ Azure NSG vs AWS Security Group vs AWS NACL

| Feature | **Azure NSG** | **AWS Security Group** | **AWS NACL** |
| --- | --- | --- | --- |
| Applied to | **NIC or Subnet** | ENI / EC2 | Subnet |
| Stateful? | ✅ Stateful | ✅ Stateful | ❌ **Stateless** |
| Allow rules | ✅ | ✅ | ✅ |
| Deny rules | ✅ | ❌ (allow only) | ✅ |
| Rule evaluation | By **priority** number | All applicable rules | By rule number, lowest first |
| Main purpose | Control network traffic | Protect instances | Subnet-level filtering |

```text
AZURE:  NSG  → Subnet + NIC
AWS:    NACL → Subnet        SG → ENI/EC2
```

> **Stateful** = remembers connections, so return traffic is allowed automatically. **Stateless** = checks every packet independently, so you must allow return traffic explicitly.
> 🧠 *Stateful = remembers. Stateless = checks every packet.*

---

# 7. Routing: Route Tables, UDR, System Routes

> **NSG = Is the traffic allowed?**
> **Route table = Where should the traffic go?**

## 7.1 System routes

Azure creates routes automatically for:

* The VNet address space and subnets
* Peered VNets
* Internet (`0.0.0.0/0`)
* Certain platform endpoints

You don't configure basic subnet-to-subnet routing inside a VNet.

## 7.2 Route table and UDR

* A **Route Table** holds routes.
* A **UDR (User Defined Route)** is a custom route you add, to override or extend system routes.

```text
Destination: 10.20.0.0/16
Next hop:    Azure Firewall (10.0.10.4)
```

### Next hop types

| Next hop type | Use |
| --- | --- |
| **Virtual appliance** | Send traffic to a firewall/NVA (needs an IP) |
| **Virtual network gateway** | Send to VPN/ExpressRoute gateway |
| **Virtual network** | Route within the VNet |
| **Internet** | Send directly to the internet |
| **None** | **Drop** the traffic (blackhole) |

## 7.3 Association

* A route table is associated with a **subnet**, not an individual VM.

```text
Route Table → App Subnet → VM
```

## 7.4 ⭐ Route selection

```text
1. Longest prefix match wins  (most specific route)
2. If prefixes are equal: UDR > BGP > System route
```

```text
Route 1: 10.0.0.0/8
Route 2: 10.10.0.0/16
Destination 10.10.1.10 → /16 wins (more specific)
```

## 7.5 Hub-and-spoke with a firewall

```text
                   Hub VNet
              ┌────────────────┐
              │ Azure Firewall │
              └───────┬────────┘
                      |
          ┌───────────┴───────────┐
          |                       |
      Spoke VNet 1           Spoke VNet 2
          |                       |
       App VM                  App VM
```

Force spoke traffic through the firewall with a UDR on the spoke subnets:

```text
Destination: 0.0.0.0/0
Next hop:    Virtual appliance
Next hop IP: <Firewall private IP>
```

> If the next hop is an **NVA VM** (not Azure Firewall), enable **IP forwarding** on its NIC and in the OS.

---

# 8. VNet Peering

**VNet Peering** connects two Azure VNets **privately** over **Microsoft's backbone network** (not the public internet).

```text
VNet A  10.0.0.0/16  ←── Peering ──►  VNet B  10.1.0.0/16
```

### Types

| Type | Meaning |
| --- | --- |
| **Regional peering** | VNets in the **same region** |
| **Global peering** | VNets in **different regions** |

### Requirements and facts

* Address spaces **must not overlap**.

```text
❌ VNet A 10.0.0.0/16  +  VNet B 10.0.0.0/16
✅ VNet A 10.0.0.0/16  +  VNet B 10.1.0.0/16
```

* Peering is configured as **two links** (A→B and B→A).
* Peering settings to know: allow virtual network access, **allow forwarded traffic**, **gateway transit / use remote gateway**.
* Traffic still has to pass **NSGs** and routes.

### ⭐ Peering is NOT transitive

```text
A ↔ B
B ↔ C
does NOT mean A ↔ C
```

To connect A and C: peer them directly, or route through a hub **firewall/NVA/gateway** (hub-and-spoke), or use Virtual WAN.

---

# 9. Service Endpoint vs Private Endpoint

> **Must-know comparison.**

## 9.1 Service Endpoint

* A **subnet-level** setting that lets the subnet reach supported Azure services (Storage, SQL, Key Vault, Service Bus, etc.) **over the Azure backbone**.
* The service is then restricted to selected VNets/subnets.
* The service **keeps its public endpoint/IP**. No private IP is created in your VNet.

```text
VM → Subnet → [Service Endpoint] → Azure backbone → Azure Storage
```

## 9.2 Private Endpoint

* Creates a **NIC with a private IP from your VNet** that maps to a specific service instance through **Azure Private Link**.

```text
App Subnet → Private Endpoint (10.0.2.10) → Azure Storage
```

## 9.3 Comparison

| Service Endpoint | Private Endpoint |
| --- | --- |
| Subnet-based capability | Creates a network interface in your VNet |
| Service still uses its **public** endpoint, with VNet identity | Service gets a **private IP in your VNet** |
| No private IP for the service | Private IP assigned |
| Simpler | More private / isolated |
| Supported Azure services | Azure services and Private Link-enabled services |
| DNS stays on the public name | **DNS configuration is critical** |
| Not usable from on-premises | Reachable from on-premises over VPN/ExpressRoute |

```text
Service Endpoint → "Secure access from my subnet"
Private Endpoint → "Give the service a private IP in my VNet"
```

### Quick-answer table

| Question | Answer |
| --- | --- |
| Which gives the service a private IP in your VNet? | **Private Endpoint** |
| Which is subnet-based, with no private IP for the service? | **Service Endpoint** |
| What must you configure carefully with Private Endpoint? | **DNS** |

## 9.4 Public IP vs Private Endpoint

```text
Public IP:         Internet → Public IP → Azure resource
Private Endpoint:  VNet → Private IP → Private Endpoint → Azure service
```

## 9.5 Don't confuse peering and Private Endpoint

```text
VNet Peering     → VNet ↔ VNet
Private Endpoint → VNet → a Private Link-enabled service
```

---

# 10. Private DNS (VERY IMPORTANT)

Applications connect using the service **hostname**, not the private IP. With a Private Endpoint, the hostname must resolve to the **private IP**.

```text
Application
     | storageaccount.blob.core.windows.net
     ▼
Private DNS zone  (privatelink.blob.core.windows.net)
     ▼
10.0.2.10  (Private Endpoint)
     ▼
Azure Storage
```

### Setup checklist

1. Create the Private Endpoint (sub-resource such as `blob`).
2. Create/use a **Private DNS zone**, for example `privatelink.blob.core.windows.net`.
3. **Link the zone to the VNet(s)** that need to resolve it.
4. Make sure an **A record** points to the private endpoint IP (a DNS zone group does this automatically).
5. If using custom DNS or on-premises DNS, **forward** the relevant zone to Azure DNS (`168.63.129.16`) or a DNS resolver.

### Test

```bash
nslookup mystorage.blob.core.windows.net
# Expected from inside the VNet: a private IP (10.x.x.x)
# If you see a public IP → DNS is not configured correctly
```

> 🎤 **Interview answer:** *"Applications connect by hostname. Private DNS lets the service hostname resolve to the private endpoint's private IP. Without it, clients may resolve the public address and bypass the private endpoint."*

---

# 11. Connecting to On-Premises

| Option | What it is | Notes |
| --- | --- | --- |
| **Site-to-Site VPN** | Encrypted IPsec tunnel over the internet via **VPN Gateway** | Needs `GatewaySubnet`, quick to set up |
| **Point-to-Site VPN** | Individual client to Azure | For remote users |
| **ExpressRoute** | **Private dedicated connection** through a provider | Higher bandwidth/reliability, not over the public internet |

### VNet Peering vs VPN

| VNet Peering | VPN |
| --- | --- |
| Azure-to-Azure VNet connectivity | Encrypted tunnel (Azure ↔ on-premises or other networks) |
| Uses Azure backbone | Uses VPN Gateway/tunnel |
| Low latency | Tunnel overhead |
| No gateway needed for basic peering | VPN Gateway required |

---

# 12. Outbound Internet Access

A VM needs an **outbound method** to reach the internet:

| Method | Notes |
| --- | --- |
| **NAT Gateway** | Recommended: shared, static outbound IPs per subnet |
| Public IP on the VM/NIC | Simple, but exposes the VM |
| Standard Load Balancer outbound rules | For LB-fronted VMs |
| **Azure Firewall / NVA** (via UDR `0.0.0.0/0`) | Central egress control |

> ⚠️ **Default outbound access change:** Historically, Azure VMs got implicit internet access with no explicit method. Newly created VNets are moving to **private subnets by default**, so you must configure an **explicit outbound method** (NAT Gateway, UDR/firewall, etc.). Existing VNets are unaffected. Microsoft's cutoff date was extended to **31 March 2026**, so check current docs for your environment.

---

# 13. NSG vs Route Table vs Azure Firewall

## 13.1 NSG vs Route Table

```text
Traffic
   |
   +---- Route Table → Where does it go?
   |
   +---- NSG        → Is it allowed?
```

> *A route table controls traffic forwarding. An NSG filters traffic based on security rules.*

## 13.2 NSG vs Azure Firewall

| NSG | Azure Firewall |
| --- | --- |
| Basic network traffic filtering | Managed, centralized network security service |
| Associated with NIC/subnet | Dedicated Azure resource |
| Primarily L3/L4 | Broader: FQDN/application rules, threat intelligence, etc. |
| Distributed filtering | Centralized inspection |
| Good for subnet/NIC-level security | Good for central, organization-wide control |

> Don't say "NSG replaces Firewall." They solve different problems and are **used together**.

---

# 14. Full Architecture & Traffic Flow

## 14.1 Architecture to draw in an interview

```text
                         INTERNET
                            |
                       Public IP
                            |
                     Application Gateway
                            |
                  ┌─────────┴─────────┐
                  │                   │
             Web Subnet           Web Subnet
                  │                   │
                NSG                 NSG
                  │                   │
                  └─────────┬─────────┘
                            |
                       App Subnet
                            |
                           NSG
                            |
                           VM
                            |
                     Route Table (UDR)
                            |
                       Azure Firewall
                            |
               ┌────────────┴────────────┐
               |                         |
          VNet Peering               On-Prem (VPN/ExpressRoute)
               |
          Other VNet
```

PaaS access:

```text
Application → Private Endpoint → Private IP → Private DNS → Azure Storage / SQL / Key Vault
```

## 14.2 Scenario: Web VM → App VM on port 8080

```text
Web VM 10.0.1.10  →  App VM 10.0.2.10:8080

Web VM → NIC → NSG → route selection → App subnet → NIC → NSG → App VM
```

Verify:

1. Source and destination IPs are correct.
2. A route exists (check effective routes).
3. NSG allows **TCP 8080** (subnet NSG and NIC NSG, in both directions where relevant).
4. The app is **listening** on 8080.
5. The **OS firewall** allows 8080.
6. The application itself is healthy.

---

# 15. Command Cheat Sheet

## 15.1 Create networking (Azure CLI)

```bash
# VNet + first subnet
az network vnet create \
  --resource-group my-rg --name my-vnet \
  --address-prefixes 10.0.0.0/16 \
  --subnet-name WebSubnet --subnet-prefixes 10.0.1.0/24

# More subnets
az network vnet subnet create -g my-rg --vnet-name my-vnet -n AppSubnet --address-prefixes 10.0.2.0/24
az network vnet subnet create -g my-rg --vnet-name my-vnet -n DBSubnet  --address-prefixes 10.0.3.0/24

# View
az network vnet list -o table
az network vnet show -g my-rg -n my-vnet
az network vnet subnet list -g my-rg --vnet-name my-vnet -o table
```

## 15.2 NSG

```bash
az network nsg create -g my-rg -n web-nsg

az network nsg rule create \
  -g my-rg --nsg-name web-nsg -n Allow-HTTPS \
  --priority 100 --direction Inbound --access Allow --protocol Tcp \
  --source-address-prefixes Internet --source-port-ranges '*' \
  --destination-address-prefixes '*' --destination-port-ranges 443

# Associate with a subnet
az network vnet subnet update -g my-rg --vnet-name my-vnet -n WebSubnet --network-security-group web-nsg

# Associate with a NIC
az network nic update -g my-rg -n vm1-nic --network-security-group web-nsg

az network nsg rule list -g my-rg --nsg-name web-nsg -o table
```

## 15.3 Route table / UDR

```bash
az network route-table create -g my-rg -n app-rt

az network route-table route create \
  -g my-rg --route-table-name app-rt -n to-firewall \
  --address-prefix 0.0.0.0/0 \
  --next-hop-type VirtualAppliance \
  --next-hop-ip-address 10.0.10.4

az network vnet subnet update -g my-rg --vnet-name my-vnet -n AppSubnet --route-table app-rt
```

## 15.4 VNet peering (create **both** directions)

```bash
az network vnet peering create -g my-rg -n A-to-B --vnet-name vnet-a \
  --remote-vnet vnet-b --allow-vnet-access --allow-forwarded-traffic

az network vnet peering create -g my-rg -n B-to-A --vnet-name vnet-b \
  --remote-vnet vnet-a --allow-vnet-access --allow-forwarded-traffic

az network vnet peering list -g my-rg --vnet-name vnet-a -o table
```

> For VNets in different resource groups or subscriptions, pass the **full resource ID** in `--remote-vnet`.

## 15.5 Service Endpoint

```bash
az network vnet subnet update -g my-rg --vnet-name my-vnet -n AppSubnet \
  --service-endpoints Microsoft.Storage

az storage account network-rule add -g my-rg --account-name mystorage \
  --vnet-name my-vnet --subnet AppSubnet

az storage account update -g my-rg -n mystorage --default-action Deny
```

## 15.6 Private Endpoint + Private DNS

```bash
# Private endpoint for Blob
az network private-endpoint create \
  -g my-rg -n pe-storage --vnet-name my-vnet --subnet PrivateEndpointSubnet \
  --private-connection-resource-id <storage-account-resource-id> \
  --group-id blob --connection-name pe-storage-conn

# Private DNS zone, VNet link and zone group
az network private-dns zone create -g my-rg -n privatelink.blob.core.windows.net

az network private-dns link vnet create -g my-rg \
  -z privatelink.blob.core.windows.net -n link-my-vnet -v my-vnet -e false

az network private-endpoint dns-zone-group create -g my-rg --endpoint-name pe-storage \
  -n default --private-dns-zone privatelink.blob.core.windows.net --zone-name blob
```

## 15.7 NAT Gateway (explicit outbound)

```bash
az network public-ip create -g my-rg -n nat-pip --sku Standard --allocation-method Static
az network nat gateway create -g my-rg -n nat-gw --public-ip-addresses nat-pip --idle-timeout 10
az network vnet subnet update -g my-rg --vnet-name my-vnet -n AppSubnet --nat-gateway nat-gw
```

## 15.8 Network Watcher: troubleshooting tools

```bash
# What routes and NSG rules apply to a NIC?
az network nic show-effective-route-table -g my-rg -n vm1-nic -o table
az network nic list-effective-nsg -g my-rg -n vm1-nic

# Would this packet be allowed or denied (and by which rule)?
az network watcher test-ip-flow -g my-rg --vm vm1 --direction Outbound --protocol TCP \
  --local 10.0.1.10:50000 --remote 10.0.2.10:8080

# Where does the next hop go?
az network watcher show-next-hop -g my-rg --vm vm1 --source-ip 10.0.1.10 --dest-ip 10.0.2.10

# End-to-end connectivity test
az network watcher test-connectivity -g my-rg --source-resource vm1 \
  --dest-resource vm2 --dest-port 8080
```

## 15.9 Linux checks inside the VM

```bash
ip addr                         # IP of this VM
ip route                        # routes inside the OS
ss -lntp                        # is the app listening?
nc -vz 10.0.2.10 8080           # test the port
curl -v http://10.0.2.10:8080
nslookup mystorage.blob.core.windows.net
sudo iptables -L                # or: sudo nft list ruleset
```

---

# 16. Practical Lab

Build this:

```text
VNet 10.0.0.0/16
│
├── WebSubnet  10.0.1.0/24
├── AppSubnet  10.0.2.0/24
└── DBSubnet   10.0.3.0/24
```

| Step | Task |
| --- | --- |
| 1 | Create the VNet |
| 2 | Create the 3 subnets |
| 3 | Create a VM in the Web subnet |
| 4 | Create a VM in the App subnet |
| 5 | Create an NSG. Allow TCP 22, 80, 443, 8080 **only from appropriate sources** |
| 6 | Test: `ping <private-ip>` and `curl http://<private-ip>:8080` |
| 7 | Create a route table with a UDR (`0.0.0.0/0` → virtual appliance). Use a real firewall/NVA, not a nonexistent next hop |
| 8 | Create a second VNet (`10.1.0.0/16`), peer both directions, test private connectivity |
| 9 | Create a Storage Account. Test **Service Endpoint**, then repeat with **Private Endpoint + Private DNS** |

> Comparing Service Endpoint vs Private Endpoint in practice is excellent interview preparation.

---

# 17. Troubleshooting

## 17.1 VM-A cannot reach VM-B

Don't randomly change NSGs. Check in order:

```text
1. IP        → ip addr (confirm source and destination IPs)
      ↓
2. Routing   → effective routes: "Where is the packet going?"
      ↓
3. NSG       → source, destination, port, protocol, priority, direction
               (both subnet NSG and NIC NSG; check effective security rules)
      ↓
4. OS firewall → iptables / nftables
      ↓
5. Application → ss -lntp (is it listening?)
      ↓
6. Test      → nc -vz <ip> <port> / curl
```

## 17.2 Internet not working

```text
VM → NIC → NSG → Route → NAT/Public IP → Internet
```

1. Does the VM have an **outbound method** (NAT Gateway, public IP, LB outbound, firewall)? New private subnets don't have default outbound.
2. Is an NSG blocking outbound?
3. Is a **UDR** forcing traffic to an NVA/firewall that drops it?
4. Is the **firewall** allowing it?
5. Is **DNS** working?

## 17.3 Private Endpoint not working

| Check | Fix |
| --- | --- |
| `nslookup` returns a **public** IP | Private DNS zone missing or not linked to the VNet, or custom DNS not forwarding |
| Name resolves, connection times out | NSG/UDR blocking, or the endpoint is not in **Approved** state |
| Works in Azure, fails from on-premises | On-prem DNS not forwarding the `privatelink` zone, or no route over VPN/ExpressRoute |
| Storage still reachable publicly | Public network access / firewall on the service not restricted |

## 17.4 Effective routes and effective security rules

* **Effective routes** show the routes actually applied to a NIC (VNet, Internet, peering, UDR, gateway). They answer: *"Where is Azure actually sending this traffic?"*
* **Effective security rules** show the combined NSG rules applied to a NIC. They answer: *"Why is this traffic allowed or denied?"*

## 17.5 Symptom → likely cause

| Symptom | Likely cause |
| --- | --- |
| Timeout between subnets | NSG deny, UDR sending traffic to a firewall that drops it, app not listening |
| Peering shows `Connected` but no traffic | NSG, missing return route, overlapping/forwarded-traffic setting |
| A can't reach C through B | Peering is **not transitive** |
| Public IP attached, still unreachable | NSG not allowing the port, or OS firewall/app |
| Private endpoint resolves to public IP | Private DNS zone missing or not linked |
| New VM has no internet | Private subnet default, no NAT Gateway/public IP/firewall route |
| Traffic via NVA fails | IP forwarding not enabled on NVA NIC/OS |

---

# 18. Interview Questions & Answers

## 18.1 Basic

1. **What is Azure VNet?** A logically isolated private network in Azure for resources to communicate with each other, other VNets, on-premises and the internet.
2. **What is a subnet?** A smaller IP range inside a VNet used for segmentation, security and routing.
3. **What is CIDR?** Notation for an IP range and prefix length, for example `10.0.0.0/16` (65,536 addresses).
4. **What is a private IP?** An internal, RFC 1918 address, not directly reachable from the internet.
5. **What is a public IP?** An internet-routable address for supported resources. It doesn't guarantee access without NSG and service configuration.
6. **What is a NIC?** The VM's network interface. It holds the IP configuration and connects the VM to a subnet.
7. **What is an NSG?** A stateful traffic filter with allow/deny rules based on source, destination, port, protocol, direction and priority.
8. **What is a route table?** It determines the next hop for network traffic.
9. **What is a UDR?** A custom route that overrides or extends system routes, for example to force traffic through a firewall.
10. **What is VNet peering?** A private connection between two VNets over Microsoft's backbone.

## 18.2 Intermediate

11. **NSG vs route table?** NSG decides whether traffic is allowed. Route table decides where it goes.
12. **NSG vs Azure Firewall?** NSG is basic L3/L4 filtering on NIC/subnet. Azure Firewall is a centralized managed service with broader capabilities. They're used together.
13. **Can an NSG attach to a VNet?** No.
14. **Where can an NSG be associated?** Subnet and/or NIC.
15. **Can peered VNets have overlapping CIDRs?** No. Address spaces must not overlap.
16. **Is peering transitive?** No.
17. **Regional vs global peering?** Same region vs different regions.
18. **How does Azure select a route?** Longest prefix match. For equal prefixes: UDR > BGP > system route.
19. **What are system routes?** Routes Azure creates automatically for the VNet, subnets, peering, internet and platform endpoints.
20. **Why use UDRs?** To force traffic through a firewall/NVA, override defaults, or blackhole traffic.

## 18.3 Advanced

21. **Service Endpoint vs Private Endpoint?** Service Endpoint secures subnet access to the service's public endpoint. Private Endpoint gives the service a private IP in your VNet and needs correct DNS.
22. **Why does a Private Endpoint need DNS consideration?** Apps use hostnames. Private DNS must resolve the hostname to the private IP, or clients will resolve the public address.
23. **How would you troubleshoot a Private Endpoint?** `nslookup` from inside the VNet (private IP expected), check the Private DNS zone, VNet link and A record, connection approval state, NSG/UDR, and the service's public access settings.
24. **How would you force traffic through Azure Firewall?** A route table on the subnets with `0.0.0.0/0` → Virtual appliance → firewall private IP, plus firewall rules allowing the traffic.
25. **How would you design hub-and-spoke?** A hub VNet with Azure Firewall, gateways and shared services. Spoke VNets peered to the hub, with UDRs sending spoke traffic via the firewall and gateway transit for on-premises access.
26. **How would you troubleshoot VM-to-VM connectivity?** IP → effective routes → effective NSG rules (subnet and NIC) → OS firewall → listening port → `nc`/`curl`. Use Network Watcher (IP flow verify, next hop, connection troubleshoot).
27. **How would you troubleshoot internet connectivity?** Check for an outbound method (NAT Gateway/public IP/firewall), NSG outbound rules, UDRs, firewall rules and DNS.
28. **How do you securely connect an Azure VM to Azure Storage?** Use a Private Endpoint with Private DNS and disable public access. A Service Endpoint with a storage firewall is the simpler alternative.
29. **How do you connect two VNets?** VNet peering (regional or global), or a VNet-to-VNet VPN when peering isn't suitable.
30. **How do you connect Azure to on-premises?** Site-to-Site VPN Gateway for encrypted tunnels over the internet, or ExpressRoute for a private dedicated connection.

## 18.4 🔥 10 answers to memorize

| # | Question | Answer |
| --- | --- | --- |
| 1 | VNet? | A logically isolated network in Azure providing private networking and connectivity to other VNets, on-premises and the internet. |
| 2 | NSG? | A traffic filter that allows/denies traffic by source, destination, protocol, port, direction and priority. |
| 3 | Route table? | Determines the next hop for network traffic. |
| 4 | UDR? | A custom route used to control traffic flow, for example through a firewall or NVA. |
| 5 | VNet peering? | Privately connects two VNets over Microsoft's backbone. |
| 6 | Is peering transitive? | No. A↔B and B↔C does not give A↔C. |
| 7 | Service Endpoint? | Lets a subnet securely reach supported Azure services over the backbone and restricts the service to selected VNets/subnets. |
| 8 | Private Endpoint? | A private NIC/IP in your VNet giving private connectivity to a Private Link-enabled service. |
| 9 | Service vs Private Endpoint? | Service Endpoint secures access from a subnet. Private Endpoint gives the service a private IP and requires careful DNS. |
| 10 | NSG vs route table? | NSG: allowed or denied. Route table: where it goes. |

---

# 19. Final Memory Map

```text
                    AZURE VNET
                       |
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Subnet         CIDR       Address Space
          |
    ┌─────┴──────┐
    ↓            ↓
   NIC           NSG
    |             |
Private IP     Allow/Deny
    |
Public IP
    |
Routing → Route Table → UDR → Next Hop
                                   |
                       ┌───────────┴───────────┐
                       ↓                       ↓
                 VNet Peering             Firewall/NVA
                       |
                  Other VNet

PaaS connectivity
       |
 ┌─────┴───────────────┐
 ↓                     ↓
Service Endpoint    Private Endpoint
                       |
                  Private IP → Private DNS → Azure Service
```

## ⭐ The 5 concepts you must not confuse

```text
NSG              → controls (allows/denies) traffic
Route Table      → decides where traffic goes
UDR              → a custom route
VNet Peering     → connects VNet to VNet
Private Endpoint → private IP connectivity to a service
```

### Quick facts to remember

```text
Azure subnet usable IPs   = total − 5
NSG                       = stateful, attaches to subnet / NIC, never to VNet
NSG priority              = lower number wins; defaults at 65000+
Route selection           = longest prefix; then UDR > BGP > system
Peering                   = non-overlapping CIDRs, non-transitive, two links
Private Endpoint          = needs Private DNS
New private subnets      = need an explicit outbound method (NAT Gateway etc.)
```

> **Next level after this:** Azure VNet practical scenarios and troubleshooting questions. Interviewers often give a broken architecture and ask *"why can't VM A reach VM B?"* rather than asking only for definitions.
