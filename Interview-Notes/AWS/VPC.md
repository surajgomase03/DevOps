# Amazon VPC — Complete DevOps Interview Notes

> **Level:** Intermediate to advanced (4–6 years of experience)
> **Roles covered:** DevOps Engineer, Senior DevOps Engineer, SRE, Cloud Engineer, Platform Engineer
> **Style:** Simple English, pointwise notes, production scenarios, interview-ready answers

**How to use these notes**

1. Read sections 1–13 once to build the mental model.
2. Practise sections 14–15 (commands, Terraform, incidents) in a sandbox AWS account.
3. Drill sections 18–19 (Q&A and answer framework) until you can answer without reading.
4. Use section 20 for last-day revision.

**Conventions**

- `<placeholder>` or `vpc-xxxxxxxx` means "replace with your own value". No real secrets or account IDs appear in these notes.
- **[MANDATORY]** marks a control you should never skip in production. **[OPTIONAL]** marks a design choice that depends on requirements and cost.
- Where behaviour is version-specific or changes over time (quotas, pricing, newer features), the note says "verify in the current AWS documentation".

---

## Table of Contents

1. [What Is Amazon VPC](#1-what-is-amazon-vpc)
2. [Core Components and Terminology](#2-core-components-and-terminology)
3. [CIDR and IP Addressing](#3-cidr-and-ip-addressing)
4. [Subnets](#4-subnets)
5. [Route Tables](#5-route-tables)
6. [Internet Gateway, NAT Gateway and Egress-Only Internet Gateway](#6-internet-gateway-nat-gateway-and-egress-only-internet-gateway)
7. [Security Groups and Network ACLs](#7-security-groups-and-network-acls)
8. [VPC Endpoints and PrivateLink](#8-vpc-endpoints-and-privatelink)
9. [VPC Peering and Transit Gateway](#9-vpc-peering-and-transit-gateway)
10. [Hybrid Connectivity: VPN and Direct Connect](#10-hybrid-connectivity-vpn-and-direct-connect)
11. [DNS in a VPC](#11-dns-in-a-vpc)
12. [VPC Flow Logs and Network Diagnostics](#12-vpc-flow-logs-and-network-diagnostics)
13. [Enterprise Reference Architecture](#13-enterprise-reference-architecture)
14. [Hands-On: Commands and Terraform](#14-hands-on-commands-and-terraform)
15. [Production Troubleshooting Scenarios](#15-production-troubleshooting-scenarios)
16. [Security, Reliability and Best Practices](#16-security-reliability-and-best-practices)
17. [Comparison Tables](#17-comparison-tables)
18. [Interview Questions and Answers](#18-interview-questions-and-answers)
19. [Interview Answer Framework](#19-interview-answer-framework)
20. [Quick Revision](#20-quick-revision)

---

## 1. What Is Amazon VPC

### 1.1 Definition

1. **VPC** stands for **Virtual Private Cloud**.
2. It is a logically isolated virtual network inside AWS where you launch resources such as EC2 instances, load balancers, RDS databases and EKS clusters.
3. You control the IP address range, subnets, routing, gateways and traffic filtering.
4. A VPC belongs to **one AWS Region** and **one AWS account**, and it spans **all Availability Zones (AZs)** in that Region.
5. Think of it as your own data-centre network, but defined entirely in software.

### 1.2 Why it is needed

1. **Isolation:** Your workloads are separated from other customers and from other environments of your own.
2. **Control:** You decide what is public, what is private and what is completely isolated.
3. **Security layering:** Routes, security groups, NACLs, endpoint policies and IAM work together.
4. **Hybrid connectivity:** Connect to on-premises networks using VPN or Direct Connect.
5. **Private access to AWS services:** Use VPC endpoints instead of sending traffic over the internet.
6. **Resilience:** Spread subnets across AZs for high availability.
7. **Visibility:** Flow Logs, Reachability Analyzer and Traffic Mirroring help diagnose and audit traffic.

### 1.3 How it works internally (simplified)

1. AWS runs a software-defined network (SDN) on top of its physical network.
2. Every VPC has an **implicit router**. You do not see it as a device, but it applies your route tables. Its address is the second address of each subnet (the `.1` in a `/24` such as `10.0.1.0/24`).
3. Every packet leaving an Elastic Network Interface (ENI) is checked against: security group (outbound) → NACL (subnet outbound) → route table → destination-side NACL (inbound) → destination-side security group (inbound).
4. Packets between resources in the same VPC are delivered through the `local` route, no gateway needed.

### 1.4 Default VPC vs custom VPC

| Item | Default VPC | Custom VPC |
| --- | --- | --- |
| Created by | AWS automatically in each Region | You |
| CIDR | `172.31.0.0/16` | You choose |
| Subnets | One public subnet per AZ | You design |
| Internet Gateway | Attached, with default route | You create |
| Production use | Not recommended | Recommended |

**[MANDATORY]** Do not run production workloads in the default VPC. Its subnets are public by default, and its CIDR is the same in every account, which causes overlap problems later.

### 1.5 Common interview pointers

- "What is a VPC and why do we need it?" → Q1 in section 18.
- "Does a VPC span AZs or Regions?" → Q2.

---

## 2. Core Components and Terminology

| Component | Purpose | Scope |
| --- | --- | --- |
| VPC | Network boundary | Region |
| CIDR block | IP address range of the VPC | VPC |
| Subnet | Smaller range inside the VPC | Single AZ |
| Route table | Rules that decide where traffic goes | Associated with subnets |
| Internet Gateway (IGW) | Two-way internet connectivity for VPC resources with public IPs | Attached to VPC |
| NAT Gateway | Outbound-only IPv4 internet access for private resources | Subnet (zonal) |
| Egress-only IGW | Outbound-only IPv6 internet access | Attached to VPC |
| Security Group (SG) | Stateful firewall on ENIs | VPC |
| Network ACL (NACL) | Stateless firewall on subnets | VPC, associated with subnets |
| Elastic IP (EIP) | Static public IPv4 address | Region |
| ENI | Virtual network card | Single AZ |
| VPC endpoint | Private path to AWS services | VPC |
| VPC peering | Private link between two VPCs | Two VPCs |
| Transit Gateway (TGW) | Regional network hub | Region |
| Site-to-Site VPN | Encrypted tunnels to on-premises | Region |
| Direct Connect (DX) | Dedicated private circuit to AWS | Location |
| Flow Logs | Metadata about IP traffic | VPC, subnet or ENI |
| DHCP option set | DNS servers, domain name given to instances | VPC |

### Request flow in a typical three-tier application

```text
Internet user
     |
     v
Route 53 (DNS)  ->  returns ALB public address
     |
     v
Internet Gateway
     |
     v
Public subnet: Application Load Balancer (ALB)
     |   (SG: allow 443 from internet)
     v
Private app subnet: EC2 / EKS nodes
     |   (SG: allow app port from ALB SG only)
     v
Private DB subnet: RDS
         (SG: allow DB port from app SG only)

Outbound from app tier:  app subnet -> NAT Gateway (public subnet) -> IGW -> internet
Private AWS service access: app subnet -> VPC endpoint (S3, ECR, STS ...)
```

---

## 3. CIDR and IP Addressing

### 3.1 What it is

1. **CIDR** stands for **Classless Inter-Domain Routing**. It writes an IP range as `address/prefix-length`, for example `10.0.0.0/16`.
2. The prefix length tells how many leading bits are fixed. The remaining bits are the host part.
3. Number of IPv4 addresses = `2^(32 - prefix)`.

### 3.2 Why it is needed

1. Each VPC and each subnet needs a non-overlapping address range.
2. Routing, peering, Transit Gateway and VPN all rely on distinct CIDRs.
3. Poor planning causes IP exhaustion or overlap, and both are painful to fix later.

### 3.3 Key rules (verify current quotas in the AWS documentation)

1. IPv4 VPC CIDR size is between `/16` (65,536 addresses) and `/28` (16 addresses).
2. Use private ranges from RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
3. You cannot change the size of an existing CIDR block, but you can **add secondary CIDR blocks** to a VPC.
4. Subnets are carved from the VPC's CIDR blocks and must not overlap each other.
5. **AWS reserves 5 addresses in every subnet.** For `10.0.1.0/24`:
   - `10.0.1.0` network address
   - `10.0.1.1` VPC router
   - `10.0.1.2` Amazon DNS resolver
   - `10.0.1.3` reserved for future use
   - `10.0.1.255` network broadcast (broadcast is not supported but the address is reserved)

| CIDR | Total addresses | Usable in AWS subnet |
| --- | --- | --- |
| `/16` | 65,536 | 65,531 |
| `/20` | 4,096 | 4,091 |
| `/22` | 1,024 | 1,019 |
| `/24` | 256 | 251 |
| `/26` | 64 | 59 |
| `/28` | 16 | 11 |

### 3.4 Example allocation plan

```text
VPC:            10.0.0.0/16   (65,536 addresses)

Public  AZ-a:   10.0.0.0/24      Public  AZ-b:   10.0.1.0/24
App     AZ-a:   10.0.16.0/20     App     AZ-b:   10.0.32.0/20      <- larger, pods/instances grow here
DB      AZ-a:   10.0.64.0/24     DB      AZ-b:   10.0.65.0/24
Reserved:       10.0.128.0/17  (kept free for future subnets)
```

### 3.5 Production notes

1. Give **application subnets more addresses** than public or database subnets. EKS pods using the VPC CNI each consume a VPC IP address.
2. Reserve a CIDR plan across **all accounts and on-premises**. Keep it in a spreadsheet, wiki or IPAM tool such as **Amazon VPC IP Address Manager (IPAM)**.
3. If you run out of addresses, add a secondary CIDR. For EKS, the `100.64.0.0/10` range is often used for pod subnets with VPC CNI custom networking. Verify the current EKS documentation before choosing.

### 3.6 Common mistakes

1. Using `10.0.0.0/16` for every VPC, then discovering you cannot peer them.
2. Making subnets too small (`/28`) for EKS or autoscaling groups.
3. Forgetting that AWS reserves 5 addresses per subnet.
4. Not leaving unallocated space for future subnets.

### 3.7 Interview pointers

Q3 (CIDR and reserved IPs), Q9 (overlapping CIDRs), Q27 (IP exhaustion in EKS).

---

## 4. Subnets

### 4.1 What it is

1. A subnet is a range of IP addresses inside a VPC.
2. **A subnet lives in exactly one Availability Zone.** A VPC spans AZs, a subnet does not.
3. A subnet is "public" or "private" because of **its route table**, not because of its name.

### 4.2 Subnet types

| Type | Route to IGW | Route to NAT | Typical resources |
| --- | --- | --- | --- |
| Public | Yes (`0.0.0.0/0 -> igw-xxxx`) | Not needed | Internet-facing ALB, NAT Gateway, bastion (if unavoidable) |
| Private (with egress) | No | Yes (`0.0.0.0/0 -> nat-xxxx`) | App servers, EKS nodes, CI runners |
| Isolated (private, no egress) | No | No | Databases, internal-only services |

### 4.3 What makes an instance reachable from the internet

All of the following must be true:

1. The subnet route table has a route to an **IGW** for the destination.
2. The instance has a **public IPv4 address, Elastic IP or IPv6 address**.
3. The **security group** allows the inbound traffic.
4. The **NACL** allows the inbound **and** return traffic.
5. The OS firewall and the application are listening and allow the traffic.

### 4.4 Auto-assign public IP

1. A subnet setting `map_public_ip_on_launch` assigns a public IPv4 address to new instances automatically.
2. **[MANDATORY for production]** Keep it disabled on private subnets. For public subnets, prefer assigning addresses only to the resources that need them (ALB and NAT manage their own addresses).
3. AWS charges for public IPv4 addresses (since 2024). Verify current pricing.

### 4.5 Subnet design for multi-AZ

```text
Region (ap-south-1)
+--------------------------------------------------------------+
| VPC 10.0.0.0/16                                              |
|                                                              |
|  AZ-a                          AZ-b                          |
|  +---------------------+       +---------------------+       |
|  | Public  10.0.0.0/24 |       | Public  10.0.1.0/24 |       |
|  |  ALB node, NAT-a    |       |  ALB node, NAT-b    |       |
|  +---------------------+       +---------------------+       |
|  | App    10.0.16.0/20 |       | App    10.0.32.0/20 |       |
|  |  EC2 / EKS nodes    |       |  EC2 / EKS nodes    |       |
|  +---------------------+       +---------------------+       |
|  | DB     10.0.64.0/24 |       | DB     10.0.65.0/24 |       |
|  |  RDS primary        |       |  RDS standby        |       |
|  +---------------------+       +---------------------+       |
+--------------------------------------------------------------+
```

### 4.6 Common mistakes

1. Putting all subnets in one AZ.
2. Naming a subnet "private" while its route table still points to an IGW.
3. Forgetting that EKS and load balancer controllers discover subnets by **tags** (`kubernetes.io/role/elb` for public, `kubernetes.io/role/internal-elb` for private). Verify current tag requirements in the EKS documentation.
4. Placing RDS in subnets that do not span at least two AZs (a DB subnet group needs subnets in at least two AZs).

### 4.7 Interview pointers

Q4 (public vs private vs isolated), Q5 (what makes a subnet public).

---

## 5. Route Tables

### 5.1 What it is

1. A route table is a set of rules (routes) that decide where network traffic from a subnet is sent.
2. Each route has a **destination** (CIDR or prefix list) and a **target** (local, IGW, NAT Gateway, peering connection, TGW, VPN gateway, endpoint, ENI and others).
3. Every route table has an automatic **local route** for the VPC CIDR. You cannot delete it, and it keeps intra-VPC traffic working.

### 5.2 How routing is decided

1. The router picks the **most specific matching route** (longest prefix match).
2. If two routes have the same prefix, AWS uses a defined priority (static routes beat propagated routes, with further rules for VPN and Direct Connect). Verify the current rule order in the documentation.
3. A subnet is associated with **exactly one** route table. If you do not associate one explicitly, it uses the **main route table**.
4. **[MANDATORY]** Do not put an IGW route in the main route table. Any new subnet would become public automatically. Create explicit route tables.

### 5.3 Example route tables

**Public route table**

| Destination | Target |
| --- | --- |
| `10.0.0.0/16` | local |
| `0.0.0.0/0` | igw-xxxxxxxx |

**Private route table (AZ-a)**

| Destination | Target |
| --- | --- |
| `10.0.0.0/16` | local |
| `0.0.0.0/0` | nat-xxxxxxxx (the NAT Gateway in AZ-a) |
| `pl-xxxxxxxx` (S3 prefix list) | vpce-xxxxxxxx (S3 gateway endpoint) |
| `10.20.0.0/16` | pcx-xxxxxxxx (peering to another VPC) |

**Isolated (database) route table**

| Destination | Target |
| --- | --- |
| `10.0.0.0/16` | local |

### 5.4 Longest prefix match example

Traffic to `10.20.5.7` with these routes:

| Destination | Target |
| --- | --- |
| `10.0.0.0/16` | local |
| `10.20.0.0/16` | peering |
| `0.0.0.0/0` | NAT Gateway |

Result: `10.20.0.0/16` matches and is more specific than `0.0.0.0/0`, so traffic goes through the peering connection.

### 5.5 Blackhole routes

1. If a route's target is deleted or unavailable (for example a deleted NAT Gateway), the route shows status **blackhole**, and matching traffic is dropped.
2. This is a classic cause of "internet access stopped working in only one AZ". See Incident A3 in section 15.

### 5.6 Common mistakes

1. Adding a route only on one side of a peering connection.
2. Leaving routes pointing to deleted NAT Gateways.
3. Using one route table for every subnet, which makes per-AZ NAT impossible.
4. Forgetting route table entries for endpoints or Transit Gateway.

### 5.7 Interview pointers

Q6 (route table basics), Q7 (longest prefix match), Q22 (blackhole route).

---

## 6. Internet Gateway, NAT Gateway and Egress-Only Internet Gateway

### 6.1 Internet Gateway (IGW)

1. **What:** A horizontally scaled, redundant, highly available VPC component that allows communication between the VPC and the internet.
2. **How:** You attach it to a VPC and add a route `0.0.0.0/0 -> igw-xxxx` to a route table. For IPv4, the IGW performs one-to-one NAT between an instance's private IP and its public/Elastic IP.
3. **Cost and limits:** No hourly charge for the IGW itself. Verify current data-transfer and public-IPv4 pricing.
4. **Important:** The IGW does not make an instance public by itself. The instance still needs a public address, a route and permissive security rules.

### 6.2 NAT Gateway

1. **What:** A managed Network Address Translation service that lets instances in private subnets **initiate outbound IPv4 connections** while blocking unsolicited inbound connections.
2. **Why:** Private servers still need patches, package repositories, external APIs and container registries.
3. **How (public NAT Gateway):**
   1. Private instance sends a packet to an internet address.
   2. Private route table matches `0.0.0.0/0 -> nat-xxxx`.
   3. The NAT Gateway (in a **public** subnet) replaces the source IP with its Elastic IP.
   4. The public subnet route table sends the packet to the IGW.
   5. The response returns to the NAT Gateway, which translates it back to the private instance.
4. **Types:** *Public* NAT Gateway (internet access, needs an Elastic IP) and *private* NAT Gateway (for translating addresses toward other VPCs or on-premises networks, no internet access).
5. **Zonal vs regional:** The classic NAT Gateway lives in **one AZ**. AWS has also introduced a regional NAT Gateway option. Verify the current feature set, pricing and Terraform support before using it in a design.
6. **Cost:** Hourly charge plus per-GB data processing, plus data-transfer charges. NAT is one of the most common surprise costs on AWS bills.
7. **Limits:** It scales automatically but has per-destination connection limits. Verify current numbers in the documentation.

**Production pattern: one NAT Gateway per AZ**

```text
AZ-a private RT: 0.0.0.0/0 -> NAT-a (in public-a)
AZ-b private RT: 0.0.0.0/0 -> NAT-b (in public-b)
```

- Benefit: an AZ failure does not break egress for the other AZ, and you avoid cross-AZ data charges.
- Trade-off: higher fixed cost. For dev/test, a single NAT Gateway is acceptable **[OPTIONAL]**.

### 6.3 Egress-Only Internet Gateway (EIGW)

1. IPv6 addresses are globally unique, so there is no NAT for IPv6.
2. An egress-only IGW lets IPv6 instances **initiate outbound** connections while blocking inbound connections started from the internet.
3. Route: `::/0 -> eigw-xxxx`.

### 6.4 Security considerations

1. **[MANDATORY]** Use security groups with least privilege. An IGW route plus a wide-open security group is a common cause of breaches.
2. Restrict egress where compliance requires it (for example, use a firewall or proxy for outbound filtering). NAT Gateway itself does not filter by domain.
3. Use VPC endpoints for AWS service traffic so it does not need to traverse NAT or the internet.

### 6.5 Common mistakes

1. Creating the NAT Gateway in a **private** subnet (it needs an IGW route, so it must sit in a public subnet for internet egress).
2. Forgetting the route in the private route table.
3. Using one NAT Gateway for all AZs in production.
4. Sending large S3/ECR traffic through NAT instead of endpoints.

### 6.6 Interview pointers

Q8 (IGW vs NAT), Q16 (NAT HA design), Q23 (NAT cost reduction).

---

## 7. Security Groups and Network ACLs

### 7.1 Security Group (SG)

1. **What:** A stateful virtual firewall attached to an ENI (and therefore to EC2, RDS, ALB, EKS nodes, endpoints and so on).
2. **Stateful:** If inbound traffic is allowed, the response is automatically allowed, regardless of outbound rules. The same holds in reverse.
3. **Allow rules only.** There are no deny rules. Anything not allowed is denied.
4. **Default behaviour:** A new SG has no inbound rules and allows all outbound. The VPC's default SG allows inbound from itself and all outbound.
5. **SG referencing:** A rule can use another SG as the source. This is better than CIDRs in tiered designs because it follows instances as they scale and change IPs.
6. **Multiple SGs:** An ENI can have several SGs. The rules are combined (union).
7. Changes take effect immediately.

**Three-tier example**

| SG | Inbound rule | Source |
| --- | --- | --- |
| `alb-sg` | TCP 443 | `0.0.0.0/0` (or approved CIDRs / CloudFront prefix list) |
| `app-sg` | TCP 8080 | `alb-sg` |
| `db-sg` | TCP 5432 | `app-sg` |

### 7.2 Network ACL (NACL)

1. **What:** A stateless firewall attached to a **subnet**.
2. **Stateless:** You must allow both the request and the return traffic. Return traffic uses **ephemeral ports** (commonly 1024–65535 for broad compatibility; verify the range your clients and OS use).
3. **Allow and deny rules**, evaluated in ascending **rule number**. The first match wins. A final `*` rule denies anything unmatched.
4. **Default NACL:** allows all inbound and outbound. **Custom NACL:** denies everything until you add rules.
5. A subnet is associated with exactly one NACL.
6. NACLs affect traffic crossing the subnet boundary. Traffic between two instances in the **same subnet** is not filtered by the subnet NACL.

**Example NACL for a web subnet**

| Rule # | Direction | Protocol/Port | Source/Dest | Action |
| --- | --- | --- | --- | --- |
| 100 | Inbound | TCP 443 | `0.0.0.0/0` | ALLOW |
| 110 | Inbound | TCP 1024–65535 | `0.0.0.0/0` | ALLOW (return traffic for outbound calls) |
| 120 | Inbound | TCP 22 | `203.0.113.0/24` | ALLOW (placeholder admin range) |
| `*` | Inbound | All | `0.0.0.0/0` | DENY |
| 100 | Outbound | TCP 443 | `0.0.0.0/0` | ALLOW |
| 110 | Outbound | TCP 1024–65535 | `0.0.0.0/0` | ALLOW (responses to clients) |
| `*` | Outbound | All | `0.0.0.0/0` | DENY |

### 7.3 Best practices

1. **[MANDATORY]** Use SGs as the primary control, with least privilege and SG-to-SG references.
2. **[MANDATORY]** Never open SSH (22) or RDP (3389) to `0.0.0.0/0`. Prefer **AWS Systems Manager Session Manager** (no inbound ports needed).
3. **[OPTIONAL]** Use NACLs for coarse subnet-level controls, such as explicitly blocking a bad CIDR, or compliance-driven segmentation.
4. Manage rules through Infrastructure as Code and review them in pull requests.
5. Use AWS Config rules or Security Hub to detect overly permissive rules.

### 7.4 Common mistakes

1. Assuming NACLs are stateful and forgetting return-traffic rules.
2. Putting a DENY rule at a higher number than an ALLOW rule that matches first.
3. Using `0.0.0.0/0` for database ports.
4. Editing the default SG instead of creating purpose-specific SGs.

### 7.5 Interview pointers

Q10 (SG vs NACL), Q11 (stateful vs stateless), Q21 (NACL blocks return traffic).

---

## 8. VPC Endpoints and PrivateLink

### 8.1 What it is

A VPC endpoint lets resources in your VPC reach supported AWS services (and your own or partner services) **without using an IGW, NAT Gateway, VPN or Direct Connect**. Traffic stays on the AWS network.

### 8.2 Types

| Type | How it works | Services | Cost model |
| --- | --- | --- | --- |
| **Gateway endpoint** | Adds a route (prefix list -> endpoint) to chosen route tables | S3 and DynamoDB | No endpoint charge (other charges may apply) |
| **Interface endpoint** (AWS PrivateLink) | Creates ENIs with private IPs in your subnets; DNS points to them | Many AWS services (ECR, STS, SSM, Secrets Manager, CloudWatch Logs and more) and endpoint services | Hourly per AZ + per-GB processing |
| **Gateway Load Balancer endpoint** | Routes traffic through third-party appliances | Inspection appliances | Hourly + per-GB |

### 8.3 How an interface endpoint works

1. You create the endpoint in selected subnets (one ENI per subnet/AZ).
2. With **Private DNS** enabled, the service's public DNS name (for example the regional STS or ECR hostname) resolves to the endpoint's **private IPs** inside the VPC.
3. Applications keep using the normal SDK/CLI endpoint name, and traffic goes privately.
4. The endpoint ENIs have **security groups**. They must allow HTTPS (443) from the clients.
5. An **endpoint policy** (resource policy on the endpoint) can restrict which principals, actions and resources are allowed through it.

### 8.4 Production example: private EKS nodes pulling images

For nodes with no internet route, typical endpoints are:

- `ecr.api` and `ecr.dkr` (interface) for ECR API and Docker registry,
- `s3` (gateway) because ECR image layers are stored in S3,
- `logs` (interface) for CloudWatch Logs,
- `sts` (interface) for IAM roles for service accounts,
- `ec2` (interface) for the VPC CNI and node operations where needed.

Verify the exact list in the current EKS private cluster documentation, because requirements change by feature.

### 8.5 Security considerations

1. **[MANDATORY]** Endpoint policy is a restriction layer, not a grant. Callers still need IAM permissions.
2. **[OPTIONAL but strong]** Restrict an S3 bucket to your VPC endpoint using the `aws:SourceVpce` condition in the bucket policy. Test carefully, since this can lock out console and CI access.
3. Restrict endpoint SGs to only the subnets or SGs that need access.

### 8.6 Limitations

1. Gateway endpoints are **not reachable from on-premises or from peered VPCs** (routes are local to the VPC's route tables).
2. Interface endpoints cost money per AZ, so balance AZ coverage against cost.
3. Interface endpoints are regional/AZ-bound: a missing endpoint ENI in an AZ means clients in that AZ may route cross-AZ or fail depending on DNS setup.

### 8.7 Common mistakes

1. Creating the S3 gateway endpoint but not associating it with the **correct route tables**.
2. Disabling Private DNS, then wondering why traffic still goes to the public endpoint.
3. Forgetting the endpoint SG (HTTPS 443 inbound).
4. Setting an endpoint policy that blocks required actions (for example ECR layer downloads).

### 8.8 Interview pointers

Q12 (gateway vs interface), Q28 (private cluster image pulls), Q29 (endpoint DNS issue).

---

## 9. VPC Peering and Transit Gateway

### 9.1 VPC peering

1. **What:** A one-to-one private connection between two VPCs. Works across accounts and Regions (inter-Region peering traffic is encrypted and stays on the AWS backbone).
2. **How to set up:** Requester sends a request, accepter accepts, then **both sides add routes** to the peer CIDR, and security groups/NACLs allow the traffic.
3. **Limitations:**
   1. **No overlapping CIDRs.**
   2. **Not transitive:** A-B and B-C does not give A-C.
   3. **No edge-to-edge routing:** A peer cannot use your IGW, NAT Gateway, VPN or Direct Connect connection.
   4. Gateway endpoints are not reachable across peering.
4. **Cost:** No hourly peering charge. Data transfer charges apply, particularly cross-AZ or cross-Region. Verify current pricing.
5. **Use when:** a small number of VPCs need simple, low-cost connectivity.

```text
VPC-A 10.0.0.0/16  <---- pcx ---->  VPC-B 10.1.0.0/16
   RT-A: 10.1.0.0/16 -> pcx          RT-B: 10.0.0.0/16 -> pcx

VPC-A  X  VPC-C   (no transitive routing through VPC-B)
```

### 9.2 AWS Transit Gateway (TGW)

1. **What:** A regional network hub that connects VPCs, VPNs, Direct Connect gateways and other TGWs (through TGW peering).
2. **Why:** Peering becomes unmanageable with many VPCs (a full mesh of N VPCs needs N(N-1)/2 connections). TGW provides hub-and-spoke.
3. **Key concepts:**
   - **Attachment:** a connection from a VPC, VPN, DX gateway or peering to the TGW. For VPC attachments you choose one subnet per AZ.
   - **TGW route table:** controls where traffic from attachments is sent.
   - **Association:** which TGW route table an attachment *uses* for its outbound lookups.
   - **Propagation:** which TGW route tables learn the attachment's CIDRs.
4. **VPC side:** You still need routes in each VPC route table pointing the remote CIDRs to the TGW.
5. **Segmentation pattern:** Separate TGW route tables for `prod`, `non-prod` and `shared-services`, so prod and non-prod cannot talk to each other but both can reach shared services.
6. **Inspection pattern:** Route traffic through a firewall VPC, using **appliance mode** on the attachment so that both directions of a flow use the same AZ appliance. Verify current design guidance.
7. **Cost:** Per-attachment hourly charge plus per-GB data processing. This is higher than peering for heavy traffic between two VPCs.
8. **Cross-account:** Share TGW with **AWS Resource Access Manager (RAM)** inside an AWS Organization.

```text
              +------------------+
 VPC-prod --->|                  |<--- VPC-staging
 VPC-dev  --->|  Transit Gateway |<--- VPC-shared-services
 VPN/DX   --->|                  |<--- VPC-inspection (firewall)
              +------------------+
```

### 9.3 Peering vs Transit Gateway: when to choose

| Requirement | Prefer |
| --- | --- |
| 2–3 VPCs, high-bandwidth, lowest cost | Peering |
| 5+ VPCs, or growth expected | Transit Gateway |
| Need transitive routing or on-prem hub | Transit Gateway |
| Centralised inspection | Transit Gateway (+ firewall VPC) |
| Expose one service to many consumers, even with overlapping CIDRs | PrivateLink |

### 9.4 Common mistakes

1. Adding peering routes in only one VPC.
2. Overlapping CIDRs discovered after the design is approved.
3. Forgetting TGW route table propagation or association.
4. Forgetting security groups and NACLs after routing is correct.

### 9.5 Interview pointers

Q9, Q13 (peering non-transitive), Q14 (TGW vs peering), Q26 (connecting 30 VPCs).

---

## 10. Hybrid Connectivity: VPN and Direct Connect

### 10.1 Site-to-Site VPN

1. **What:** IPsec tunnels between your customer gateway (on-premises router/firewall) and an AWS **virtual private gateway (VGW)** or **Transit Gateway**.
2. **Redundancy:** Each VPN connection has **two tunnels** in different AZs. Configure both on your side.
3. **Routing:** Dynamic (BGP, recommended) or static.
4. **Throughput:** Per-tunnel limits apply (around 1.25 Gbps per tunnel at the time of writing; verify). With Transit Gateway and ECMP, multiple tunnels can be combined.
5. **Encrypted** by default; travels over the public internet.
6. **Use for:** fast setup, backup to Direct Connect, small or moderate traffic.

### 10.2 AWS Direct Connect (DX)

1. **What:** A dedicated private network connection from your location (or a partner's) to AWS.
2. **Virtual interfaces (VIFs):** *Private VIF* (to a VPC through a VGW or Direct Connect gateway), *Transit VIF* (to a TGW), *Public VIF* (to public AWS endpoints).
3. **Direct Connect gateway:** lets one DX connection reach VPCs in multiple Regions/accounts.
4. **Not encrypted by default.** Add **MACsec** (where supported) or run **IPsec VPN over DX** if the compliance policy demands encryption.
5. **Resilience:** For critical workloads, use multiple connections across separate DX locations. A single DX circuit is a single point of failure. Verify AWS's current resiliency recommendations.
6. **Provisioning time:** Weeks, not minutes, because of physical circuits.

### 10.3 Typical hybrid design

```text
On-prem DC --(Direct Connect, primary)---+
                                         +--> Transit Gateway --> VPCs
On-prem DC --(Site-to-Site VPN, backup)--+
```

BGP route preference: Direct Connect routes are generally preferred over VPN for the same prefix. Verify the current route-priority behaviour when designing failover.

### 10.4 Common mistakes

1. Overlapping on-premises and VPC CIDRs.
2. Configuring only one VPN tunnel.
3. Assuming Direct Connect is encrypted.
4. Forgetting route propagation or security group rules for on-premises CIDRs.
5. Forgetting that DNS needs separate design (Route 53 Resolver endpoints).

### 10.5 Interview pointers

Q15 (VPN vs DX), Q26.

---

## 11. DNS in a VPC

### 11.1 What it is

1. Every VPC has an **Amazon-provided DNS resolver (Route 53 Resolver)** at the VPC base CIDR address plus two (for example `10.0.0.2` for `10.0.0.0/16`) and also at `169.254.169.253`.
2. Two VPC attributes control behaviour:
   - `enableDnsSupport`: if true, the Amazon resolver answers queries.
   - `enableDnsHostnames`: if true, instances with public IPs get public DNS hostnames.
3. **Private hosted zones (PHZs)** in Route 53 provide private DNS names that resolve only inside associated VPCs. They require both attributes to be true.

### 11.2 Hybrid DNS: Route 53 Resolver endpoints

| Endpoint | Direction | Use |
| --- | --- | --- |
| Inbound endpoint | On-premises -> AWS | On-prem servers resolve AWS private names |
| Outbound endpoint + rules | AWS -> on-premises | VPC resources resolve on-prem domains |

### 11.3 DNS facts for interviews

1. DNS success does not prove connectivity. DNS failure does not prove routing is broken.
2. There is a per-ENI limit on DNS queries to the Amazon resolver (verify the current value). High query rates (for example from Kubernetes workloads without caching) can cause intermittent resolution failures. Use NodeLocal DNSCache or tune CoreDNS in EKS.
3. Interface endpoint **Private DNS** overrides the public service name inside the VPC.
4. **DHCP option sets** can change the DNS servers handed to instances (for example to point at corporate DNS).

### 11.4 Common mistakes

1. Disabling `enableDnsSupport` and breaking private hosted zones and endpoint DNS.
2. Not associating the PHZ with every VPC that needs it.
3. Sending all DNS to an on-premises server that is unreachable.

### 11.5 Interview pointers

Q17 (DNS in VPC), Q29.

---

## 12. VPC Flow Logs and Network Diagnostics

### 12.1 Flow Logs

1. **What:** Records of IP traffic metadata (not payload) for a VPC, subnet or ENI.
2. **Destinations:** CloudWatch Logs, Amazon S3, Amazon Data Firehose.
3. **Default record fields** include: version, account, interface, source and destination address and port, protocol, packets, bytes, start, end, **action (ACCEPT/REJECT)**, log status. You can use **custom formats** to add fields such as `vpc-id`, `subnet-id`, `pkt-srcaddr`, `flow-direction` and `tcp-flags`.
4. **Aggregation interval:** 10 minutes by default, 1 minute optional. Flow Logs are **not real-time**.
5. **Not captured** (examples): traffic to the Amazon DNS server (when using it), DHCP, instance metadata (`169.254.169.254`), Amazon Time Sync and the VPC router reserved address. Verify the current list in the documentation.
6. **How to read ACCEPT / REJECT:**
   - `REJECT` means a security group or NACL denied the traffic.
   - `ACCEPT` means both SG and NACL allowed that packet at that interface.
   - **Stateless NACL clue:** an inbound request logged `ACCEPT` with the matching return flow logged `REJECT` points to a NACL blocking return traffic.
7. **Cost:** Ingestion, storage and analysis charges. Use S3 + Athena for large-scale analysis, and filter or sample where policy allows.

**Sample record**

```text
2 123456789012 eni-0abc1234def567890 10.0.16.25 10.0.64.10 51234 5432 6 10 840 1700000000 1700000060 REJECT OK
```

Meaning: TCP (protocol 6) from `10.0.16.25:51234` to `10.0.64.10:5432` was rejected. Check the DB security group and the NACLs.

### 12.2 Other diagnostic tools

| Tool | Use |
| --- | --- |
| **VPC Reachability Analyzer** | Analyses configuration (routes, SGs, NACLs, gateways) between a source and destination. It does not send real packets and does not check the OS or application. |
| **Network Access Analyzer** | Finds unintended network access paths (for example internet exposure) |
| **Traffic Mirroring** | Copies packets from an ENI to an analysis tool for deep inspection |
| **CloudWatch metrics** | NAT Gateway, TGW, VPN and endpoint health and throughput |
| **CloudTrail** | Who changed a route, SG or NACL, and when |
| **AWS Config** | History of configuration changes and compliance rules |
| **Linux tools** | `ip route`, `ss`, `curl`, `dig`, `nc`, `traceroute`, `tcpdump` |

### 12.3 Common mistakes

1. Treating Flow Logs as a packet capture.
2. Expecting real-time visibility.
3. Not enabling Flow Logs before an incident.
4. Trusting Reachability Analyzer to prove the application works.

### 12.4 Interview pointers

Q18 (Flow Logs), Q21, Q24 (diagnostics).

---

## 13. Enterprise Reference Architecture

### 13.1 Multi-account, multi-VPC design

```text
AWS Organization
 |
 +-- Network account
 |     +-- Transit Gateway (shared with RAM)
 |     +-- Inspection VPC (firewalls, appliance mode)
 |     +-- Direct Connect gateway + Site-to-Site VPN
 |     +-- Route 53 Resolver endpoints + shared private hosted zones
 |
 +-- Shared-services account
 |     +-- Shared-services VPC (CI/CD runners, artifact repos, monitoring)
 |
 +-- Workload accounts: prod / staging / dev
       +-- App VPC (3-tier subnets across 2-3 AZs)
       +-- VPC endpoints (S3 gateway, ECR, STS, Logs, SSM)
       +-- Flow Logs -> central log archive account (S3)
```

### 13.2 Traffic flow in this design

1. User -> Route 53 -> CloudFront/WAF (optional) -> ALB in public subnets.
2. ALB -> app targets in private subnets (security-group-to-security-group rules).
3. App -> database in isolated subnets.
4. App -> AWS services through VPC endpoints.
5. App -> internet through NAT Gateway (per AZ), or through the central inspection VPC via TGW.
6. App -> on-premises through TGW -> Direct Connect (primary) or VPN (backup).

### 13.3 VPC and Amazon EKS

1. **Pod IPs:** With the default **Amazon VPC CNI**, every pod gets a real VPC IP address from a subnet. Large clusters can exhaust subnet IPs.
2. **Mitigations** (verify current EKS docs): larger or additional subnets, **secondary CIDR with custom networking**, **prefix delegation** (assigns `/28` prefixes to ENIs), or IPv6 clusters.
3. **Subnet tagging:** `kubernetes.io/role/elb` (public) and `kubernetes.io/role/internal-elb` (private) so the AWS Load Balancer Controller can find subnets.
4. **Control plane access:** The API endpoint can be public, private or both. Private-only endpoints require network access to the VPC (VPN, DX, bastion, or a runner inside the VPC).
5. **Egress and endpoints:** Private nodes need NAT or VPC endpoints for ECR, S3, STS and others.
6. **Security groups for pods** and **network policies** add finer control beyond node SGs.
7. **Cross-AZ traffic:** Pods talking across AZs incurs data transfer charges. Use topology-aware routing where practical.

### 13.4 Disaster recovery and high availability

1. Deploy across at least **two AZs** for production **[MANDATORY]**; three for critical services **[OPTIONAL]**.
2. **Multi-Region DR:** a second VPC in another Region with non-overlapping CIDR, replicated data, Route 53 failover records, and infrastructure defined in code so it can be rebuilt quickly.
3. Test failover regularly, including NAT, endpoints and DNS dependencies in the DR Region.

---
## 14. Hands-On: Commands and Terraform

### 14.1 Linux commands for network troubleshooting

Run these **from the source instance** (use SSM Session Manager, not open SSH).

```bash
# 1. Which IP, subnet mask and interface does this host have?
ip addr show

# 2. Which route will the OS use? (default gateway should be the subnet's .1 router)
ip route
ip route get 10.0.64.10        # shows the exact path chosen for one destination

# 3. Is the local service listening? (run on the DESTINATION host)
sudo ss -lntp

# 4. DNS: what does the name resolve to, and which resolver answered?
cat /etc/resolv.conf
dig +short db.internal.example.com
dig db.internal.example.com @169.254.169.253   # query the Amazon resolver directly

# 5. TCP reachability (no data sent, just the handshake)
nc -vz -w 5 10.0.64.10 5432

# 6. HTTPS with timing, showing where it stalls (DNS, connect, TLS, first byte)
curl -sv -o /dev/null -w 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} total=%{time_total}\n' https://example.com

# 7. Hop-by-hop path (TCP mode helps when ICMP is blocked)
sudo traceroute -T -p 443 example.com

# 8. Packet capture on the destination to prove packets arrive (needs sudo)
sudo tcpdump -ni any host 10.0.16.25 and port 5432
```

**How to read the results**

| Observation | Usual meaning | Next step |
| --- | --- | --- |
| `dig` returns nothing or `SERVFAIL` | DNS problem | Check resolver, PHZ association, VPC DNS attributes |
| `nc` hangs then times out | Packet silently dropped | Check route, SG, NACL, blackhole route |
| `nc` says `Connection refused` | Packet arrived, nothing listening | Check service, port, OS firewall |
| `curl` connects but TLS fails | Network is fine | Check certificate, SNI, proxy |
| `tcpdump` shows SYN arriving but no SYN-ACK | Destination OS/app or return path problem | Check app, NACL return rule, asymmetric route |
| `tcpdump` shows nothing | Packet never arrived | Check SG, NACL, routes upstream |

**Rule of thumb:** *timeout* = something dropped it (network layer). *Refused* = it reached the host (application layer).

### 14.2 AWS CLI: read-only investigation commands

Prerequisites: AWS CLI v2 configured, IAM permissions for `ec2:Describe*`. Replace placeholders (`vpc-xxxxxxxx`, `subnet-xxxxxxxx`, Region).

```bash
export AWS_REGION=ap-south-1     # placeholder Region
VPC_ID=vpc-xxxxxxxx              # placeholder

# Subnets: CIDR, AZ, free IPs, public IP default
aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC_ID \
  --query 'Subnets[].{Id:SubnetId,AZ:AvailabilityZone,Cidr:CidrBlock,Free:AvailableIpAddressCount,AutoPublicIP:MapPublicIpOnLaunch}' \
  --output table

# Which route table does a subnet really use? (empty result => main route table)
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=subnet-xxxxxxxx \
  --query 'RouteTables[].{RT:RouteTableId,Routes:Routes}' --output json

# Find blackhole routes anywhere in the VPC
aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC_ID \
  --query 'RouteTables[].Routes[?State==`blackhole`].[DestinationCidrBlock,NatGatewayId,GatewayId]' \
  --output table

# NAT Gateway state (should be "available")
aws ec2 describe-nat-gateways --filter Name=vpc-id,Values=$VPC_ID \
  --query 'NatGateways[].{Id:NatGatewayId,State:State,Subnet:SubnetId}' --output table

# Security group rules for one group
aws ec2 describe-security-group-rules --filters Name=group-id,Values=sg-xxxxxxxx --output table

# NACL entries (look at rule numbers and actions)
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=subnet-xxxxxxxx \
  --query 'NetworkAcls[].Entries' --output json

# Endpoints and their state
aws ec2 describe-vpc-endpoints --filters Name=vpc-id,Values=$VPC_ID \
  --query 'VpcEndpoints[].{Id:VpcEndpointId,Service:ServiceName,Type:VpcEndpointType,State:State,PrivateDNS:PrivateDnsEnabled}' \
  --output table

# Peering connection status (should be "active")
aws ec2 describe-vpc-peering-connections --query 'VpcPeeringConnections[].{Id:VpcPeeringConnectionId,Status:Status.Code}' --output table

# Flow Logs configured?
aws ec2 describe-flow-logs --filter Name=resource-id,Values=$VPC_ID

# VPC DNS attributes
aws ec2 describe-vpc-attribute --vpc-id $VPC_ID --attribute enableDnsSupport
aws ec2 describe-vpc-attribute --vpc-id $VPC_ID --attribute enableDnsHostnames
```

**Reachability Analyzer from the CLI** (configuration analysis, charges apply; verify pricing):

```bash
# 1. Define the path
PATH_ID=$(aws ec2 create-network-insights-path \
  --source eni-xxxxxxxx --destination eni-yyyyyyyy \
  --protocol tcp --destination-port 5432 \
  --query 'NetworkInsightsPath.NetworkInsightsPathId' --output text)

# 2. Run the analysis
ANALYSIS_ID=$(aws ec2 start-network-insights-analysis \
  --network-insights-path-id $PATH_ID \
  --query 'NetworkInsightsAnalysis.NetworkInsightsAnalysisId' --output text)

# 3. Read the result: NetworkPathFound true/false and the blocking component
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $ANALYSIS_ID \
  --query 'NetworkInsightsAnalyses[].{Found:NetworkPathFound,Explanations:Explanations}'
```

If `NetworkPathFound` is `false`, the `Explanations` section names the blocking SG rule, NACL entry or missing route.

### 14.3 Terraform: production-style three-tier VPC

**Assumptions**

- Terraform `>= 1.5`, AWS provider `~> 5.0` (verify current versions; `domain = "vpc"` on `aws_eip` is the provider v5 syntax).
- A **VPC CIDR of `/16`**; the `cidrsubnet()` arithmetic below depends on that.
- An S3 bucket for Flow Logs already exists with a bucket policy that allows log delivery (its ARN is passed in as a variable).
- One NAT Gateway per AZ (production pattern). Set `az_count = 2` or `3`.

**Folder structure**

```text
vpc-terraform/
├── versions.tf        # Terraform and provider constraints
├── variables.tf       # inputs (CIDR, AZ count, names, bucket ARN)
├── main.tf            # VPC, subnets, gateways, routes, endpoint, flow logs
├── outputs.tf         # IDs for other stacks
└── terraform.tfvars   # environment values (no secrets)
```

**`versions.tf`**

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Production: configure a remote backend (S3 + state locking) here.
}

provider "aws" {
  region = var.region
}
```

**`variables.tf`**

```hcl
variable "region" {
  type        = string
  description = "AWS Region"
  default     = "ap-south-1" # placeholder
}

variable "name" {
  type        = string
  description = "Name prefix for resources"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR, must be a /16 for the subnet math below"
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0)) && endswith(var.vpc_cidr, "/16")
    error_message = "vpc_cidr must be a valid IPv4 CIDR with a /16 prefix."
  }
}

variable "az_count" {
  type        = number
  description = "Number of Availability Zones to use"
  default     = 2

  validation {
    condition     = var.az_count >= 2 && var.az_count <= 3
    error_message = "Use 2 or 3 AZs."
  }
}

variable "flow_logs_bucket_arn" {
  type        = string
  description = "ARN of an existing S3 bucket that receives VPC Flow Logs"
}
```

**`main.tf`**

```hcl
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, var.az_count)
}

# ---------- VPC ----------
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true # needed for Route 53 Resolver, PHZs, endpoint DNS
  enable_dns_hostnames = true

  tags = { Name = "${var.name}-vpc" }
}

# Lock down the default SG: no inbound, no outbound rules.
resource "aws_default_security_group" "default" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-default-sg-locked" }
}

# ---------- Subnets ----------
# Public:  10.0.0.0/24, 10.0.1.0/24 ...
resource "aws_subnet" "public" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.this.id
  availability_zone       = local.azs[count.index]
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  map_public_ip_on_launch = false # ALB/NAT get their own addresses

  tags = {
    Name                     = "${var.name}-public-${local.azs[count.index]}"
    "kubernetes.io/role/elb" = "1" # for AWS Load Balancer Controller (verify tag docs)
  }
}

# App: 10.0.16.0/20, 10.0.32.0/20 ... (large, for instances and EKS pods)
resource "aws_subnet" "app" {
  count             = var.az_count
  vpc_id            = aws_vpc.this.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 1)

  tags = {
    Name                              = "${var.name}-app-${local.azs[count.index]}"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# DB: 10.0.64.0/24, 10.0.65.0/24 ...
resource "aws_subnet" "db" {
  count             = var.az_count
  vpc_id            = aws_vpc.this.id
  availability_zone = local.azs[count.index]
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 64)

  tags = { Name = "${var.name}-db-${local.azs[count.index]}" }
}

# ---------- Internet Gateway and NAT (one per AZ) ----------
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-igw" }
}

resource "aws_eip" "nat" {
  count  = var.az_count
  domain = "vpc"
  tags   = { Name = "${var.name}-nat-eip-${local.azs[count.index]}" }
}

resource "aws_nat_gateway" "this" {
  count         = var.az_count
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id # NAT lives in a PUBLIC subnet

  tags       = { Name = "${var.name}-nat-${local.azs[count.index]}" }
  depends_on = [aws_internet_gateway.this]
}

# ---------- Route tables ----------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-rt-public" }
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
}

resource "aws_route_table_association" "public" {
  count          = var.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# One private route table PER AZ so each AZ uses its own NAT Gateway
resource "aws_route_table" "app" {
  count  = var.az_count
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-rt-app-${local.azs[count.index]}" }
}

resource "aws_route" "app_nat" {
  count                  = var.az_count
  route_table_id         = aws_route_table.app[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[count.index].id
}

resource "aws_route_table_association" "app" {
  count          = var.az_count
  subnet_id      = aws_subnet.app[count.index].id
  route_table_id = aws_route_table.app[count.index].id
}

# Isolated DB route table: local route only
resource "aws_route_table" "db" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-rt-db" }
}

resource "aws_route_table_association" "db" {
  count          = var.az_count
  subnet_id      = aws_subnet.db[count.index].id
  route_table_id = aws_route_table.db.id
}

# ---------- S3 gateway endpoint (cuts NAT data-processing cost) ----------
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = aws_route_table.app[*].id

  tags = { Name = "${var.name}-s3-gateway-endpoint" }
}

# ---------- Flow Logs to S3 ----------
resource "aws_flow_log" "vpc" {
  vpc_id                   = aws_vpc.this.id
  traffic_type             = "ALL"
  log_destination_type     = "s3"
  log_destination          = var.flow_logs_bucket_arn
  max_aggregation_interval = 60

  tags = { Name = "${var.name}-flow-logs" }
}
```

**`outputs.tf`**

```hcl
output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "app_subnet_ids" {
  value = aws_subnet.app[*].id
}

output "db_subnet_ids" {
  value = aws_subnet.db[*].id
}

output "nat_public_ips" {
  description = "Egress IPs to give to partners for allow-listing"
  value       = aws_eip.nat[*].public_ip
}
```

**`terraform.tfvars`** (placeholders)

```hcl
name                 = "demo"
region               = "ap-south-1"
vpc_cidr             = "10.0.0.0/16"
az_count             = 2
flow_logs_bucket_arn = "arn:aws:s3:::example-flow-logs-bucket" # placeholder
```

**Run it**

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan      # review: no 0.0.0.0/0 route in app or db route tables except NAT
terraform apply tfplan
```

**Expected result**

- A `10.0.0.0/16` VPC with 3 subnet tiers in each AZ.
- Public subnets route `0.0.0.0/0` to the IGW, app subnets route it to the NAT Gateway in the same AZ, and DB subnets have only the local route.
- S3 traffic from app subnets uses the gateway endpoint.
- Flow Logs deliver to your S3 bucket.

**Why important lines matter**

| Line | Reason |
| --- | --- |
| `aws_default_security_group` with no rules | Prevents accidental use of the permissive default SG |
| `map_public_ip_on_launch = false` | No surprise public IPs |
| `depends_on = [aws_internet_gateway.this]` | NAT Gateway creation needs the IGW to exist first |
| One `aws_route_table.app` per AZ | Enables AZ-local NAT, no cross-AZ dependency |
| DB route table without default route | Database subnet cannot reach the internet |
| `validation` blocks | Fail fast on a wrong CIDR size or AZ count |

**Security notes**

- Terraform state may contain sensitive data. Store it in an encrypted S3 backend with locking and restricted IAM access.
- Never commit `.tfvars` files that contain secrets. This example contains none.
- Run `terraform plan` in CI and require pull-request review for network changes.

---

## 15. Production Troubleshooting Scenarios

Each scenario follows: **Problem → Symptoms/impact → Possible causes → Investigation → Procedure → Root cause → Resolution → Prevention → How to explain it in an interview.**

### Beginner scenarios

#### A1. EC2 in a "public" subnet cannot reach the internet

1. **Problem:** A new web server in a public subnet cannot `curl` external sites and cannot be reached from the internet.
2. **Symptoms and impact:** `curl` times out. Deployment pipeline that installs packages fails.
3. **Possible causes:** No IGW attached, missing `0.0.0.0/0 -> IGW` route, subnet using the main route table, no public/Elastic IP, SG or NACL blocking, OS firewall.
4. **Tools:** `aws ec2 describe-route-tables`, `describe-internet-gateways`, `describe-instances`, `ip route`, Reachability Analyzer.
5. **Procedure:**
   1. Confirm the instance has a public IPv4 or Elastic IP.
   2. Find the route table associated with the subnet (explicit association or main).
   3. Check it has `0.0.0.0/0` to an IGW that is **attached** to this VPC.
   4. Check SG outbound and NACL rules in both directions.
   5. Test from the host with `curl -v` and `ip route get`.
6. **Root cause (typical):** The subnet was associated with the main route table, which had no IGW route.
7. **Resolution:** Associate the subnet with the public route table (or add the route), then retest.
8. **Prevention:** Create explicit route tables in Terraform, do not use the main route table for any subnet, and add a CI check for unexpected IGW routes.
9. **Interview explanation:** "I checked the five conditions for internet reachability in order: public address, route to IGW, SG, NACL, and OS. The route table was the gap. I fixed it in code and added a policy check so subnets cannot silently fall back to the main route table."

#### A2. Application cannot connect to the database (timeout)

1. **Problem:** App servers in the app subnet get a timeout to the DB on port 5432.
2. **Symptoms and impact:** Application errors with `connection timed out`, health checks fail.
3. **Possible causes:** DB SG does not allow the app SG, wrong port/endpoint, NACL blocking, DB in another VPC without peering routes, DB not available.
4. **Tools:** `nc -vz`, `describe-security-group-rules`, Flow Logs, Reachability Analyzer.
5. **Procedure:**
   1. `nc -vz -w 5 <db-endpoint> 5432` from the app host.
   2. If DNS fails, fix DNS first. If it times out, check the DB SG inbound rules for the app SG or CIDR.
   3. Check NACLs for both subnets (including ephemeral return ports).
   4. Check Flow Logs for `REJECT` records on the DB ENI.
6. **Root cause (typical):** DB SG referenced an old app SG after the app was redeployed with a new SG.
7. **Resolution:** Add inbound `5432` from the current app SG.
8. **Prevention:** Manage SG references in IaC, share the app SG as a module output, and alert on Flow Log `REJECT` spikes to DB ports.
9. **Interview explanation:** "Timeout told me packets were being dropped, not refused. I narrowed it to the SG rule using Reachability Analyzer and Flow Logs, fixed the reference, and automated it so SG references come from code outputs."

#### A3. Internet egress broke in only one AZ

1. **Problem:** Pods or instances in AZ-b cannot reach external APIs. AZ-a works.
2. **Symptoms and impact:** Roughly half of the requests fail, intermittent errors behind the load balancer.
3. **Possible causes:** NAT Gateway in AZ-b deleted or failed, route in AZ-b private route table is a **blackhole**, NAT Gateway placed in a subnet without an IGW route, Elastic IP issue.
4. **Tools:** `describe-route-tables` with a blackhole query (section 14.2), `describe-nat-gateways`, CloudTrail.
5. **Procedure:**
   1. Compare the route tables of the two AZs.
   2. Look for `State: blackhole`.
   3. Check NAT Gateway state and its subnet's route table.
   4. Check CloudTrail for `DeleteNatGateway` or `ReplaceRoute` events.
6. **Root cause (typical):** The NAT Gateway was deleted during a cleanup, leaving a blackhole route.
7. **Resolution:** Recreate the NAT Gateway in the public subnet of AZ-b and update the route.
8. **Prevention:** Manage NAT in Terraform, restrict delete permissions, alarm on NAT `ErrorPortAllocation` and on blackhole routes through AWS Config.
9. **Interview explanation:** "Partial failure by AZ made me compare per-AZ configuration. A blackhole route pointed to a deleted NAT Gateway. I restored it and added a Config rule so a blackhole route alerts immediately."

### Intermediate scenarios

#### B1. Two peered VPCs cannot communicate

1. **Problem:** Peering status is `active`, but instances in VPC-A cannot reach VPC-B.
2. **Symptoms and impact:** Timeouts between services in two environments.
3. **Possible causes:** Missing route on one or both sides, route added to wrong route table, SG/NACL, overlapping CIDR, transitive routing expectation.
4. **Tools:** `describe-route-tables`, `describe-vpc-peering-connections`, Reachability Analyzer.
5. **Procedure:**
   1. Verify the peering `Status.Code` is `active`.
   2. In VPC-A, find the route table of the **source subnet** and check for the VPC-B CIDR -> `pcx-...`.
   3. Repeat in VPC-B for the return route.
   4. Check SGs (a cross-account peer can reference the peer SG only in supported configurations; otherwise use CIDRs) and NACLs.
   5. Confirm CIDRs do not overlap.
6. **Root cause (typical):** The route was added only in VPC-A, or in the main route table, while the subnet used a custom one.
7. **Resolution:** Add the missing routes to the correct route tables on both sides.
8. **Prevention:** Peering and routes in a single Terraform module that creates both sides, plus Reachability Analyzer in CI for critical paths.
9. **Interview explanation:** "Active peering only means the link exists. Traffic needs routes in both directions in the right route tables, plus SG and NACL permission. I verified each and fixed the missing return route."

#### B2. Custom NACL breaks traffic although security groups are correct

1. **Problem:** After a security-hardening change, clients can open a connection but responses never arrive, or new connections fail.
2. **Symptoms and impact:** Timeouts only through one subnet, SGs look perfect.
3. **Possible causes:** NACL missing ephemeral port range for return traffic, deny rule with a lower number than an allow rule, outbound rule missing, NACL associated to the wrong subnet.
4. **Tools:** Flow Logs, `describe-network-acls`, Reachability Analyzer.
5. **Procedure:**
   1. Identify the subnet and its associated NACL.
   2. List rules in order and simulate the request and the response manually.
   3. Check Flow Logs: request `ACCEPT` and response `REJECT` suggests a stateless NACL block.
   4. Confirm the ephemeral range matches client OS behaviour.
6. **Root cause (typical):** Outbound NACL allowed only TCP 443 and omitted ephemeral ports for the response to inbound clients.
7. **Resolution:** Add the missing outbound ephemeral-port rule at a number that evaluates before any deny.
8. **Prevention:** Test NACL changes in a lower environment, keep default allow NACLs unless a compliance need exists, and make SGs the primary control.
9. **Interview explanation:** "SGs are stateful and NACLs are not. The Flow Logs pattern of accepted request and rejected response led me to the NACL's missing return-traffic rule."

#### B3. DNS resolution fails for a private service name

1. **Problem:** An instance reaches the IP of an internal service but cannot resolve its private hostname (or an AWS service name stops resolving privately).
2. **Symptoms and impact:** `Name or service not known`, SDK calls fail while `nc` to the IP works.
3. **Possible causes:** PHZ not associated with this VPC, `enableDnsSupport` false, custom DHCP DNS server unreachable, Resolver rule missing, interface endpoint Private DNS disabled.
4. **Tools:** `dig`, `/etc/resolv.conf`, `describe-vpc-attribute`, Route 53 console/CLI.
5. **Procedure:**
   1. Compare `dig name` with `dig name @169.254.169.253`.
   2. If the Amazon resolver works but the default does not, check DHCP options and `resolv.conf`.
   3. Check PHZ associations and VPC DNS attributes.
   4. For on-premises names, check outbound Resolver endpoint and rules.
6. **Root cause (typical):** The PHZ was associated with another VPC only.
7. **Resolution:** Associate the PHZ with the VPC (cross-account associations use the authorise-and-associate process).
8. **Prevention:** Define PHZ associations in IaC and monitor Resolver query logs.
9. **Interview explanation:** "I separated DNS from connectivity: IP worked, name failed. The Amazon resolver query showed the PHZ was not associated, so I fixed the association."

#### B4. NAT Gateway cost suddenly spikes

1. **Problem:** The monthly bill shows a large jump in NAT data-processing charges.
2. **Symptoms and impact:** Unexpected cost, no outage.
3. **Possible causes:** Workloads pulling large S3/ECR/DynamoDB traffic through NAT, cross-AZ NAT traffic, a runaway job or log shipping, container image pulls at scale.
4. **Tools:** Cost Explorer, CloudWatch NAT metrics (`BytesOutToDestination`, `BytesInFromSource`), Flow Logs with S3 + Athena, Cost and Usage Report.
5. **Procedure:**
   1. Find which NAT Gateway and which AZ show the traffic.
   2. Query Flow Logs (with `pkt-dstaddr`) to find top source IPs and destinations.
   3. Map destinations to AWS services (S3, ECR) or external hosts.
6. **Root cause (typical):** Image pulls and S3 reads going through NAT because no gateway/interface endpoints existed.
7. **Resolution:** Add S3 and DynamoDB gateway endpoints and interface endpoints for ECR (and others as needed), cache images, and keep traffic AZ-local.
8. **Prevention:** AWS Budgets and anomaly detection, a dashboard for NAT bytes, endpoints in the base VPC module.
9. **Interview explanation:** "I used Flow Logs and Athena to find the top talkers, saw most traffic was AWS service traffic, and replaced the NAT path with endpoints. That cut the data-processing cost and removed an egress dependency."

### Advanced scenarios

#### C1. EKS pods stuck in `ContainerCreating` because the subnet ran out of IPs

1. **Problem:** New pods fail to start during scale-out.
2. **Symptoms and impact:** Pods in `ContainerCreating`, events such as failed to assign an IP address, autoscaling stalls, customer-facing latency.
3. **Possible causes:** Application subnet too small, pod IPs consumed by many ENIs and warm IP pools, secondary IP warm-target settings holding addresses, leaked ENIs.
4. **Tools:** `kubectl describe pod`, `aws-node` (VPC CNI) logs, `describe-subnets` (`AvailableIpAddressCount`), `describe-network-interfaces`.
5. **Procedure:**
   1. Check pod events and the `aws-node` DaemonSet logs.
   2. Check free IPs in the node subnets.
   3. Check CNI settings such as warm IP and ENI targets (verify current VPC CNI configuration options).
   4. Look for orphaned ENIs.
6. **Root cause (typical):** `/24` subnets for nodes and pods with the default warm settings.
7. **Resolution (short term):** Free IPs (remove orphan ENIs, tune warm targets), scale nodes into other subnets. **Long term:** add a secondary CIDR with CNI custom networking, enable prefix delegation, or plan IPv6.
8. **Prevention:** Size app subnets generously in the CIDR plan, alert when free IPs fall below a threshold, track pods-per-node.
9. **Interview explanation:** "In EKS with the VPC CNI, pods use VPC IPs, so subnet size is a scaling limit. I restored capacity quickly, then redesigned with a secondary CIDR so the cluster is not bounded by the original node subnets."

#### C2. Asymmetric routing through Transit Gateway and a firewall VPC

1. **Problem:** Traffic between two spoke VPCs passes through an inspection firewall. TCP connections hang or reset intermittently.
2. **Symptoms and impact:** Some flows work, others fail, difficult to reproduce, firewall logs show only one direction.
3. **Possible causes:** TGW attachment for the inspection VPC without **appliance mode**, so forward and return packets use different AZ appliances, wrong TGW route table association, missing return routes, stateful firewall seeing half a flow.
4. **Tools:** TGW route tables (`search-transit-gateway-routes`), firewall logs, Flow Logs from both sides, `tcpdump`, Network Manager / Reachability Analyzer.
5. **Procedure:**
   1. Draw the intended path forward and return.
   2. Check which TGW route table each attachment is associated with and what it propagates.
   3. Check the VPC route tables and the inspection VPC's routes in each AZ.
   4. Check appliance mode on the inspection VPC attachment.
6. **Root cause (typical):** Appliance mode was off, so a flow could enter via AZ-a and return via AZ-b, and the stateful firewall dropped the unrecognised return packets.
7. **Resolution:** Enable appliance mode on the inspection attachment and verify symmetric routing (verify current AWS guidance for your firewall design).
8. **Prevention:** Use a documented reference architecture, test failover per AZ, and add synthetic checks across spokes.
9. **Interview explanation:** "Intermittent failure plus a stateful appliance suggested asymmetry. I traced forward and return paths across TGW route tables and found appliance mode disabled. After enabling it, both directions used the same AZ appliance."

#### C3. Hybrid connectivity fails after a new VPC is added (overlapping CIDR)

1. **Problem:** A new VPC's workloads cannot reach on-premises systems, and one existing route to on-premises behaves oddly.
2. **Symptoms and impact:** Some on-premises subnets unreachable, intermittent routing to the wrong destination.
3. **Possible causes:** The new VPC CIDR overlaps with an on-premises or existing VPC range, BGP advertisements conflict, routes prefer the more specific prefix.
4. **Tools:** TGW route tables, BGP route tables on the customer router, IPAM.
5. **Procedure:**
   1. Compare the new CIDR with all CIDRs in IPAM, TGW route tables and on-premises routing.
   2. Check which route wins for the affected prefixes (most specific prefix wins).
6. **Root cause (typical):** The new VPC reused a range already used on-premises.
7. **Resolution:** Re-IP the new VPC (preferably before it hosts workloads), or use a private NAT Gateway / PrivateLink to expose only the required services across overlapping networks.
8. **Prevention:** Central IP planning with VPC IPAM, a CI check that rejects overlapping CIDRs.
9. **Interview explanation:** "Overlap is a design problem, not a configuration tweak. Short term I used PrivateLink for the one required service, and long term I re-addressed the VPC and enforced IPAM allocation."

---

## 16. Security, Reliability and Best Practices

### 16.1 Mandatory controls vs optional design choices

| Area | **Mandatory** | Optional (depends on need and cost) |
| --- | --- | --- |
| Least privilege | SGs allow only required ports and sources; no `0.0.0.0/0` on admin or DB ports | Fine-grained NACL segmentation |
| Admin access | Session Manager or VPN; no open SSH/RDP to the internet | Bastion hosts |
| Subnet design | Workloads and DBs in private/isolated subnets across 2+ AZs | 3 AZs; separate subnet per tier and per team |
| Default VPC/SG | Do not use the default VPC for production; lock down the default SG | Delete the default VPC |
| Encryption in transit | TLS on all application and database links | IPsec over Direct Connect, MACsec |
| Visibility | Flow Logs enabled with retention and access control; CloudTrail on | Traffic Mirroring, 1-minute aggregation |
| Change control | Network via IaC, reviewed pull requests | Policy-as-code (OPA/Checkov/Config rules) |
| HA | One NAT Gateway per AZ in prod; two VPN tunnels | Multi-Region DR network |
| Private AWS access | S3 gateway endpoint (free) is recommended | Interface endpoints for all services |
| Egress control | Defined outbound rules for sensitive workloads | Central firewall with domain filtering (for example AWS Network Firewall) |

### 16.2 Least privilege and secrets

1. IAM controls who can **change** the network. Restrict `ec2:AuthorizeSecurityGroupIngress`, `ec2:CreateRoute`, `ec2:DeleteNatGateway`, `ec2:AttachInternetGateway` and similar actions.
2. Network paths do not replace IAM. Endpoint policies and bucket policies add layers, but identity permissions are still required.
3. Do not store credentials in user data, Terraform variables or tags. Use **AWS Secrets Manager** or **SSM Parameter Store**, reachable through interface endpoints for private subnets.
4. Use IAM roles for instances and EKS service accounts, not long-lived keys.

### 16.3 Network and access controls

1. SG-to-SG references between tiers.
2. Use AWS WAF and Shield on public entry points (ALB/CloudFront) where relevant.
3. Use AWS Network Firewall or a third-party firewall in an inspection VPC for deep inspection and domain filtering **[OPTIONAL]**.
4. Use security group rule limits wisely: verify current quotas (rules per SG, SGs per ENI).
5. Detect risky exposure with AWS Config, Security Hub, **Network Access Analyzer** and GuardDuty (which can use VPC Flow Logs and DNS logs for threat detection).

### 16.4 High availability and disaster recovery

1. Subnets in at least two AZs, with resources spread across them.
2. NAT per AZ with AZ-local routing.
3. Interface endpoints in each AZ you use.
4. Two VPN tunnels, and Direct Connect with a second connection or a VPN backup.
5. DR: define the network with code, keep non-overlapping CIDRs between Regions, replicate data, test failover with Route 53 health checks and routing policies.
6. Rollback: version-control network changes, use `terraform plan` review, and make small incremental changes. Keep the previous route/SG state in code so it can be reverted quickly.

### 16.5 Monitoring, logging and alerting

| Signal | Source | Example alert |
| --- | --- | --- |
| NAT port exhaustion | CloudWatch `ErrorPortAllocation` | Any non-zero sustained value |
| NAT throughput / cost | `BytesOutToDestination` | Spike beyond baseline |
| Rejected traffic | Flow Logs | Rejects to DB ports from unexpected sources |
| VPN tunnel state | `TunnelState` | Tunnel down |
| Config drift | AWS Config | IGW route added to a private route table; SG open to the world |
| Free IPs | Custom metric from `describe-subnets` | Less than a set threshold |
| DNS issues | Resolver query logs | NXDOMAIN or SERVFAIL spikes |
| Who changed it | CloudTrail | `CreateRoute`, `AuthorizeSecurityGroupIngress` in prod |

### 16.6 Scalability and performance

1. Plan IP space for growth, including EKS pods.
2. Spread load across AZs, but keep traffic AZ-local where possible to reduce latency and charges.
3. Use gateway endpoints and interface endpoints to avoid NAT bottlenecks.
4. Use enhanced networking and appropriate instance types for high packet rates (verify current instance bandwidth limits).
5. Mind quotas (SGs, routes per table, VPCs per Region, NAT Gateways per AZ). Verify current values in the **Service Quotas** console.

### 16.7 Cost optimisation

1. Add S3 and DynamoDB **gateway endpoints** (no endpoint charge).
2. Use interface endpoints selectively; they cost per AZ-hour plus data.
3. Keep chatty traffic inside one AZ.
4. In dev/test, a single NAT Gateway or scheduled shutdown is acceptable **[OPTIONAL]**; in production use one per AZ.
5. Release unused Elastic IPs and public IPv4 addresses (public IPv4 addresses are billed; verify current pricing).
6. Review Flow Logs retention and volume; filter or use S3 with lifecycle rules.
7. For many VPCs, compare TGW attachment and data-processing cost against peering.

### 16.8 Backup and recovery

1. Network configuration is recovered from **Terraform code and state backups**, not from backups of the VPC itself.
2. Export or snapshot critical configuration through AWS Config history.
3. Store Flow Logs in S3 with versioning and lifecycle policies.
4. Document and rehearse how to recreate a VPC, endpoints and routing in a DR Region.

### 16.9 Compliance considerations

1. PCI DSS, HIPAA, ISO 27001 and similar frameworks commonly expect network segmentation, restricted access, logging and encryption in transit. Map controls to evidence: SG/NACL rules, Flow Logs, CloudTrail, Config.
2. Keep regulated workloads in isolated subnets or separate accounts/VPCs.
3. Verify the exact requirements of your applicable standard. These notes are not compliance advice.

---

## 17. Comparison Tables

### 17.1 Internet Gateway vs NAT Gateway vs Egress-only IGW

| Feature | Internet Gateway | NAT Gateway | Egress-only IGW |
| --- | --- | --- | --- |
| Direction | Inbound and outbound | Outbound-initiated only | Outbound-initiated only |
| IP version | IPv4 and IPv6 | IPv4 | IPv6 |
| Needs public IP on instance | Yes (or EIP/IPv6) | No (NAT has the EIP) | No (instance has IPv6) |
| Placement | Attached to VPC | In a public subnet | Attached to VPC |
| HA | AWS-managed, redundant | Zonal, create one per AZ | AWS-managed |
| Cost | No gateway charge | Hourly + per-GB | No gateway charge |
| Typical use | Public ALB, public-facing hosts | Private subnets patching, API calls | IPv6 private workloads |

### 17.2 Security Group vs NACL

| Feature | Security Group | NACL |
| --- | --- | --- |
| Level | ENI (instance) | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow and deny |
| Evaluation | All rules together | Lowest number first, first match wins |
| Default (new) | Deny inbound, allow outbound | Custom: deny all; default NACL: allow all |
| Source can be an SG | Yes | No (CIDR only) |
| Typical role | Primary control | Coarse extra layer, explicit blocks |

### 17.3 Gateway endpoint vs Interface endpoint

| Feature | Gateway endpoint | Interface endpoint |
| --- | --- | --- |
| Services | S3, DynamoDB | Many AWS services and PrivateLink services |
| Mechanism | Route table entry (prefix list) | ENI with private IP in your subnet |
| Cost | No endpoint charge | Hourly per AZ + per-GB |
| Security group | No | Yes |
| Reachable from on-premises / peered VPC | No | Yes (through routed connectivity) |
| DNS | Public service name still used, routed privately | Private DNS maps service name to endpoint IPs |

### 17.4 VPC Peering vs Transit Gateway vs PrivateLink

| Feature | Peering | Transit Gateway | PrivateLink |
| --- | --- | --- | --- |
| Connectivity model | VPC to VPC | Hub and spoke | Consumer to a specific service |
| Transitive | No | Yes (by route design) | Not applicable |
| Overlapping CIDRs | Not allowed | Not allowed | **Allowed** |
| Exposes | Whole network (as routed) | Whole network (as routed) | Only the service |
| Scale | Few VPCs | Hundreds | Many consumers |
| Cost | Data transfer | Attachment + data processing | Endpoint hourly + data |

### 17.5 Site-to-Site VPN vs Direct Connect

| Feature | VPN | Direct Connect |
| --- | --- | --- |
| Path | Internet | Dedicated circuit |
| Encryption | IPsec built in | Not by default (add MACsec/IPsec) |
| Setup time | Minutes to hours | Weeks |
| Bandwidth | Limited per tunnel | 1/10/100 Gbps (verify current options) |
| Latency consistency | Variable | More consistent |
| Cost | Lower | Higher (port-hour + data out) |
| Common design | Backup or small sites | Primary enterprise link |

### 17.6 Public vs private vs isolated subnet

| Feature | Public | Private | Isolated |
| --- | --- | --- | --- |
| Route to IGW | Yes | No | No |
| Outbound internet | Through IGW | Through NAT | None |
| Inbound from internet | Possible (if IP and SG allow) | No | No |
| Typical | ALB, NAT | App, EKS nodes | RDS, internal data stores |

### 17.7 One NAT Gateway vs one per AZ

| Feature | Single NAT | NAT per AZ |
| --- | --- | --- |
| Cost | Lowest | Higher |
| AZ failure impact | All private egress can fail if NAT's AZ fails | Only that AZ |
| Cross-AZ data charges | Yes for other AZs | Avoided |
| Use for | Dev/test | Production |

### 17.8 Common interview traps

| Trap | Correct answer |
| --- | --- |
| "An IGW makes a subnet public." | The **route to the IGW** makes it public. The instance also needs a public IP and permissive rules. |
| "NAT Gateway is highly available across AZs." | It is redundant within **one AZ**. Use one per AZ. |
| "Security groups can deny." | No. Allow rules only. Use NACLs for explicit denies. |
| "Peering is transitive." | No. Use Transit Gateway. |
| "Gateway endpoints work from on-premises." | No. Use interface endpoints (or a proxy design). |
| "Flow Logs capture packets." | Only metadata, with aggregation delay. |
| "A VPC is in one AZ." | A VPC spans a Region. A **subnet** is in one AZ. |
| "Direct Connect is encrypted." | Not by default. |
| "Reachability Analyzer proves the app works." | It analyses configuration only. |
| "I can resize a VPC CIDR." | You can add secondary CIDRs but not resize an existing block. |

---
## 18. Interview Questions and Answers

> Answer pattern: **definition → how it works → trade-off or example → follow-up**. Follow-up questions a senior interviewer may ask are shown as **Follow-up**.

### 18.1 Basic concepts

#### Q1. What is Amazon VPC and why do we use it?

1. A VPC (Virtual Private Cloud) is a logically isolated virtual network in an AWS Region where you launch resources.
2. You define the IP range, subnets, routes, gateways and firewalls, so you control what is public, private and isolated.
3. It gives isolation between workloads and environments, private connectivity to on-premises and AWS services, and visibility through Flow Logs.
4. Example: ALB in public subnets, application in private subnets, database in isolated subnets across two AZs.
5. **Follow-up:** "Can you run production in the default VPC?" It is possible but not recommended: its subnets are public by default and its CIDR is the same in every account, which causes overlap problems.

#### Q2. Does a VPC span Availability Zones or Regions? What about a subnet?

1. A VPC is **regional**: it spans all AZs of one Region.
2. A subnet is **zonal**: it exists in exactly one AZ.
3. Therefore, high availability means creating subnets in multiple AZs and spreading resources across them.
4. **Follow-up:** "How do you connect VPCs in different Regions?" Inter-Region peering, Transit Gateway peering, or VPN/DX-based designs.

#### Q3. What is CIDR, and how many usable IPs are in a `/24` AWS subnet?

1. CIDR (Classless Inter-Domain Routing) writes a range as address/prefix, for example `10.0.1.0/24`.
2. Total addresses are `2^(32 - prefix)`. A `/24` has 256.
3. AWS reserves 5 per subnet (network address, VPC router, DNS, future use, broadcast), so 251 are usable.
4. Planning matters because VPC CIDR sizes and overlap constraints are hard to change later.
5. **Follow-up:** "Can you resize the VPC CIDR?" No, but you can add secondary CIDR blocks.

#### Q4. What is the difference between public, private and isolated subnets?

1. **Public:** route table has a route to an IGW. Hosts load balancers, NAT Gateways.
2. **Private:** no direct IGW route. Outbound internet goes through a NAT Gateway. Hosts application servers and EKS nodes.
3. **Isolated:** no route to IGW or NAT. Hosts databases. Can still use endpoints and internal routes.
4. The distinction is purely **routing**, not names.

#### Q5. What makes an EC2 instance reachable from the internet?

1. A route to an IGW in its subnet route table.
2. A public IPv4 address, Elastic IP or IPv6 address.
3. A security group that allows the inbound port.
4. A NACL that allows both the request and the return traffic.
5. An OS firewall and application that accept the connection.
6. If any one is missing, the connection fails. This is the standard checklist for "I can't reach my instance".

#### Q6. What is a route table, and what is the local route?

1. A route table maps destinations to targets (IGW, NAT, peering, TGW, endpoint, local and others).
2. Each subnet uses exactly one route table: an explicit association or the main route table.
3. The **local route** covers the VPC CIDR and enables intra-VPC communication. It cannot be deleted.
4. **Best practice:** do not rely on the main route table. Keep it empty of internet routes so new subnets are private by default.

#### Q7. What is longest prefix match?

1. When several routes match a destination, the **most specific** (longest prefix) route wins.
2. Example: `10.20.0.0/16 -> peering` beats `0.0.0.0/0 -> NAT` for `10.20.5.7`.
3. This lets you send a specific range to a different target without removing the default route.
4. **Follow-up:** "What if two routes have the same prefix?" AWS applies a priority order (for example static versus propagated routes). Verify the current order in the documentation.

#### Q8. What is the difference between an Internet Gateway and a NAT Gateway?

1. **IGW:** two-way internet access for resources with public addresses. No hourly charge.
2. **NAT Gateway:** outbound-only (initiated from inside) IPv4 access for private resources. Placed in a public subnet with an Elastic IP. Hourly and per-GB charges.
3. Private route table: `0.0.0.0/0 -> NAT`. NAT's subnet route table: `0.0.0.0/0 -> IGW`.
4. A NAT Gateway does not allow inbound connections initiated from the internet.
5. **Follow-up:** "Where do you create the NAT Gateway?" In a **public** subnet, one per AZ for production.

### 18.2 Intermediate concepts

#### Q9. What happens when two VPC CIDRs overlap?

1. They cannot be peered, and Transit Gateway cannot route between them cleanly.
2. VPN or Direct Connect to on-premises can fail or route incorrectly if ranges overlap.
3. Solutions: re-IP one network, use **PrivateLink** to expose specific services (works with overlapping CIDRs), or use a private NAT Gateway pattern.
4. Prevention: central IP planning with VPC IPAM and a CI check.

#### Q10. Security group vs NACL: what are the differences?

1. SG is attached to an ENI, NACL to a subnet.
2. SG is stateful, NACL is stateless.
3. SG has allow rules only. NACL has allow and deny rules, evaluated by rule number.
4. SG rules can reference other SGs. NACL rules use CIDRs.
5. Use SGs as the main control and NACLs as an optional coarse layer.
6. **Follow-up:** "Which is evaluated first?" For inbound, the packet passes the subnet NACL, then the SG at the ENI. For outbound, the SG first, then the NACL.

#### Q11. What does stateful versus stateless mean for return traffic?

1. Stateful: the firewall tracks connections, so responses to allowed requests are allowed automatically (security groups).
2. Stateless: each packet is evaluated independently, so return traffic needs its own rule (NACLs).
3. With NACLs you must allow **ephemeral ports** for return traffic.
4. Common bug: inbound 443 allowed but outbound ephemeral ports not allowed, so responses are dropped.

#### Q12. Gateway endpoint vs interface endpoint?

1. **Gateway:** S3 and DynamoDB only, implemented as a route table entry, no endpoint charge.
2. **Interface:** ENIs in your subnets using PrivateLink, many services, has an SG, hourly and data charges.
3. Gateway endpoints are not reachable from on-premises or peered VPCs. Interface endpoints can be reached through routed connectivity.
4. Interface endpoints with **Private DNS** make the normal service hostname resolve to private IPs.
5. **Follow-up:** "How do you restrict an S3 bucket to your VPC?" Use a bucket policy condition on the VPC endpoint (`aws:SourceVpce`) and test for lock-outs of other access paths.

#### Q13. Why is VPC peering non-transitive, and what do you do about it?

1. Each peering is a direct, one-to-one routing relationship. AWS does not forward traffic from one peer through another, nor use a peer's gateways (edge-to-edge routing is not supported).
2. A-B and B-C does not give A-C.
3. Options: add a direct A-C peering, use **Transit Gateway** for hub-and-spoke, or use PrivateLink for service access.

#### Q14. Transit Gateway vs peering: how do you choose?

1. Few VPCs and high bandwidth with low cost: peering.
2. Many VPCs, on-premises integration, transitive routing, segmentation or central inspection: Transit Gateway.
3. TGW adds attachment and data-processing charges and requires TGW route table design (associations and propagation).
4. **Follow-up:** "How would you keep prod and dev from talking?" Separate TGW route tables with propagation controlled so prod and dev attachments do not learn each other's routes.

#### Q15. Site-to-Site VPN vs Direct Connect?

1. VPN: IPsec over the internet, quick to set up, lower cost, variable performance, two tunnels per connection.
2. DX: dedicated circuit, consistent latency, higher throughput, weeks to provision, not encrypted by default.
3. Common enterprise design: DX primary plus VPN backup, both attached to a TGW or Direct Connect gateway.
4. Add MACsec or IPsec over DX when encryption in transit is required.

#### Q16. How do you design NAT Gateways for high availability?

1. A NAT Gateway is redundant within one AZ but is zonal.
2. Create one NAT Gateway **per AZ** and one private route table per AZ pointing to its local NAT.
3. This avoids a single AZ failure breaking egress for all AZs and avoids cross-AZ data charges.
4. Trade-off: higher fixed cost. A single NAT can be acceptable in dev/test.

#### Q17. How does DNS work inside a VPC?

1. The Amazon resolver is at the VPC base address plus two and at `169.254.169.253`.
2. `enableDnsSupport` turns resolver service on. `enableDnsHostnames` gives public DNS names to instances with public IPs.
3. Private hosted zones resolve only in associated VPCs.
4. For hybrid DNS use Route 53 Resolver inbound (on-premises to AWS) and outbound (AWS to on-premises) endpoints with rules.
5. Interface endpoint Private DNS overrides the public service name inside the VPC.

#### Q18. What are VPC Flow Logs and what are their limits?

1. They record metadata (5-tuple, bytes, packets, action ACCEPT/REJECT, interface) for a VPC, subnet or ENI.
2. Destinations: CloudWatch Logs, S3, Firehose.
3. Limits: no payload, aggregation delay (1 or 10 minutes), some traffic types are not logged (for example Amazon DNS queries and instance metadata access).
4. Use to find rejected traffic, top talkers and unexpected communication. Combine with S3 and Athena at scale.
5. A `REJECT` indicates SG or NACL denial. It does not identify which one, so check both.

### 18.3 Advanced technical questions

#### Q19. Elastic IP vs auto-assigned public IP?

1. Auto-assigned public IPv4 is tied to the instance lifecycle and can change after stop/start.
2. An Elastic IP is a static address you own until released and can be remapped between resources (instance, NAT Gateway, network interface).
3. Public IPv4 addresses are billed, so avoid assigning them where not needed (verify current pricing).
4. Prefer a load balancer or NAT with an EIP over giving each instance an address.

#### Q20. What is an egress-only Internet Gateway and why does IPv6 not use NAT?

1. IPv6 addresses are globally unique, so address translation is unnecessary.
2. An egress-only IGW allows outbound IPv6 and return traffic while blocking inbound connections initiated from the internet.
3. Route: `::/0 -> eigw-xxxx` in the private subnet route table.
4. IPv6 security still relies on SGs and NACLs.

#### Q21. A NACL blocks the response traffic. How do you prove it?

1. Check Flow Logs for the instance ENI: the inbound request is `ACCEPT`, the outbound response is `REJECT` (or the reverse for client-initiated flows).
2. List the NACL rules for the subnet and simulate both directions, including ephemeral port ranges.
3. Run Reachability Analyzer, which names the NACL entry that blocks the path.
4. Fix by adding the return-traffic rule at a lower rule number than any deny.
5. Remember: SGs being correct does not matter if the NACL drops the packet.

#### Q22. What is a blackhole route and how do you find it?

1. A route whose target no longer exists or is unavailable (deleted NAT Gateway, deleted peering, detached gateway) is marked `blackhole`. Matching traffic is dropped.
2. Find with `describe-route-tables` and a query on `State==blackhole`, or an AWS Config rule.
3. Fix by recreating the target or updating the route.
4. Symptom: failure confined to one AZ or one destination range.

#### Q23. How do you reduce NAT Gateway cost?

1. Find the top talkers using NAT CloudWatch metrics and Flow Logs with Athena.
2. Add **S3 and DynamoDB gateway endpoints** (no endpoint charge).
3. Add interface endpoints for high-volume AWS services such as ECR, if the data volume justifies the hourly cost.
4. Keep traffic AZ-local with one NAT per AZ and AZ-local routing.
5. Use image caches and package mirrors inside the VPC.
6. Consider IPv6 and egress-only IGW for IPv6-capable traffic.
7. Set budgets and anomaly detection.

#### Q24. Reachability Analyzer vs Flow Logs vs tcpdump: when do you use each?

1. **Reachability Analyzer:** configuration analysis before or after changes. Finds blocking routes/SGs/NACLs. Does not send packets, and does not test the OS or application.
2. **Flow Logs:** historical metadata showing real traffic and ACCEPT/REJECT decisions. Delayed.
3. **tcpdump/Traffic Mirroring:** packet-level proof of what actually arrives and leaves.
4. Typical order: Reachability Analyzer (config), Flow Logs (what really happened), tcpdump (deep dive).

#### Q25. How would you design a highly available production VPC?

1. `/16` CIDR planned in IPAM, with spare space.
2. Three subnet tiers across at least two AZs (public, app, DB).
3. NAT Gateway per AZ with per-AZ private route tables.
4. ALB across public subnets, apps in private, DB in isolated with Multi-AZ.
5. Gateway and interface endpoints for AWS service traffic.
6. SGs with SG-to-SG rules, Session Manager for admin access, NACLs as optional extra.
7. Flow Logs to S3, CloudTrail and Config enabled.
8. Everything as Terraform with CI checks.
9. For DR: second Region with non-overlapping CIDR and tested failover.

#### Q26. Your company needs to connect 30 VPCs and an on-premises data centre. What do you choose?

1. Transit Gateway: peering would need up to 435 connections for a full mesh and is not transitive.
2. Attach all VPCs, plus a VPN and/or DX attachment for on-premises.
3. Use separate TGW route tables for segmentation (prod, non-prod, shared services).
4. Share the TGW across accounts with RAM.
5. Verify there are no overlapping CIDRs before attaching anything.
6. Consider a central inspection VPC with appliance mode if security policy needs it.
7. Cost: attachment-hours plus data processing. Estimate before committing.

### 18.4 Scenario-based questions

#### Q27. EKS pods stay in `ContainerCreating` and the subnet has almost no free IPs. What now?

1. Confirm: `kubectl describe pod`, `aws-node` logs, `AvailableIpAddressCount` on the subnets.
2. Short term: remove orphaned ENIs, tune the CNI warm-IP settings, add nodes in subnets with free IPs.
3. Long term: add a **secondary CIDR** with CNI custom networking, enable **prefix delegation**, or plan IPv6 clusters (verify current EKS guidance).
4. Prevention: size app subnets generously (for example `/20`), alert on low free IPs.
5. **Follow-up:** "Why does EKS use so many IPs?" With the VPC CNI, each pod receives a VPC IP address.

#### Q28. Private EKS nodes with no internet cannot pull images. What do you configure?

1. Create interface endpoints for ECR API and ECR Docker (`ecr.api`, `ecr.dkr`) and a **gateway endpoint for S3** (image layers are stored in S3).
2. Add endpoints for other required services such as STS, CloudWatch Logs, EC2 and SSM as your setup needs (verify the current EKS private cluster requirements).
3. Enable Private DNS on interface endpoints and allow HTTPS 443 from node SGs to the endpoint SGs.
4. Ensure the S3 endpoint is associated with the **node subnet route tables**.
5. Check endpoint policies do not block required actions, and check node IAM permissions.

#### Q29. After creating an interface endpoint, the application still reaches the public service IP. Why?

1. Private DNS may be disabled on the endpoint.
2. The VPC may have `enableDnsSupport` or `enableDnsHostnames` off (both are needed for endpoint Private DNS).
3. The instance may use a custom DNS server that does not forward to the Amazon resolver.
4. The application may use a custom endpoint URL or a hard-coded IP.
5. Verify with `dig <service-hostname>`: it should return private IPs from your subnet.

### 18.5 Production troubleshooting questions

#### Q30. An application server cannot connect to RDS on port 3306. How do you isolate it?

1. Test: `nc -vz -w 5 <db-endpoint> 3306`. Timeout means network drop. Refused means DB side issue. DNS error means a resolution problem.
2. Check DB SG inbound allows 3306 from the app SG.
3. Check app SG outbound, subnet routes, and NACLs in both directions.
4. Check Flow Logs for `REJECT` on the DB ENI.
5. Confirm the DB is available and the endpoint and port are right.
6. Only after TCP works, check credentials, TLS settings and DB logs.

#### Q31. EKS pods cannot reach S3 from private subnets. What do you investigate?

1. Is there an S3 gateway endpoint associated with the node subnet route tables, or a NAT route?
2. Are the pods using the right credentials (IRSA / Pod Identity) and does the role allow the S3 actions?
3. Does the VPC endpoint policy allow the bucket and action?
4. Does the bucket policy restrict by `aws:SourceVpce` or `aws:SourceVpc` in a way that excludes this path?
5. Is DNS resolving the S3 hostname properly (CoreDNS and the VPC resolver)?
6. Distinguish `AccessDenied` (IAM/policy) from timeout (network).

#### Q32. The application works in AZ-a but fails in AZ-b. How do you compare?

1. Compare route tables of the subnets (blackhole routes, NAT target, endpoint associations).
2. Compare NAT Gateway state and subnet placement.
3. Compare NACLs and SGs applied in each AZ.
4. Check that interface endpoints have ENIs in both AZs.
5. Check dependencies: DB replica, EFS mount targets, load balancer targets per AZ.
6. Check CloudTrail for recent changes in AZ-b.

#### Q33. A connection times out. What is your step-by-step method?

1. Identify source, destination, protocol, port, direction.
2. DNS: does the name resolve to the expected IP?
3. Routing: right route table, matching route, healthy target, return route.
4. Security: source SG outbound, destination SG inbound, NACLs, OS firewall.
5. Destination: service listening, healthy, correct port.
6. Evidence: Reachability Analyzer, Flow Logs, `tcpdump`.
7. Fix minimally, retest both directions, document root cause (section 19 has the full framework).

### 18.6 Security and best-practice questions

#### Q34. How do you audit a VPC for accidental internet exposure?

1. Find SGs with `0.0.0.0/0` or `::/0` on non-public ports (AWS Config managed rules, Security Hub).
2. List route tables with an IGW route and the subnets associated.
3. List instances and ENIs with public IPs.
4. Run **Network Access Analyzer** for unintended paths from the internet.
5. Review Flow Logs for unexpected inbound accepts.
6. Automate checks in CI (Checkov or similar) and in AWS Config.

#### Q35. How do you apply least privilege to the network layer?

1. SG-to-SG rules, specific ports, no `0.0.0.0/0` on admin or data ports.
2. Separate SGs per tier and per purpose.
3. Session Manager instead of SSH.
4. Endpoint policies and bucket policies with VPC conditions.
5. IAM restrictions on who can modify networking resources, with approvals through code review.
6. Separate accounts and VPCs for prod and non-prod.

#### Q36. How do you securely connect an application subnet to a database subnet?

1. Database in an isolated subnet (no IGW or NAT route), not publicly accessible.
2. DB SG allows only the DB port from the app SG.
3. TLS between application and database, with certificate verification.
4. Credentials from Secrets Manager (rotation enabled), not from code or environment files.
5. Optional NACLs to limit the DB subnet to app subnet CIDRs.
6. Flow Logs and DB audit logs for visibility.

### 18.7 Follow-up questions a senior interviewer may ask

1. "You said one NAT per AZ. What about cost for 3 AZs in 20 accounts?" Discuss centralised egress through TGW and an inspection VPC versus per-VPC NAT: central egress simplifies control but adds TGW data processing and creates a shared blast radius.
2. "What is the blast radius of a bad route table change?" Everything in associated subnets. Mitigation: IaC review, small changes, per-AZ route tables, AWS Config alerts.
3. "How would you migrate a workload into a new VPC with zero downtime?" Build the new VPC with non-overlapping CIDR, peer or TGW-connect, replicate data, shift traffic gradually using weighted Route 53 or load balancer targets, then decommission.
4. "How would you let a partner access one internal service without exposing the VPC?" PrivateLink: NLB-backed endpoint service and an interface endpoint in the partner VPC. Works with overlapping CIDRs.
5. "Your team asks you to open the DB to the internet temporarily. What do you do?" Decline and offer a safe alternative: SSM port forwarding, a bastion with MFA, or a VPN, with time-limited access and audit logging.
6. "How would you detect if someone adds an IGW route to a private subnet?" AWS Config rule or EventBridge on `CreateRoute`/`ReplaceRoute` CloudTrail events, with an alert and optional auto-remediation.
7. "What changes with IPv6?" No NAT, egress-only IGW for private outbound, global addresses (so SGs matter more), dual-stack routing, and applications must support IPv6.

---

## 19. Interview Answer Framework

Use this for any scenario question such as "X cannot reach Y". Speak it in order. Interviewers mostly judge **method**, not memorised commands.

### 19.1 The eight-step framework

| Step | What you say | VPC-specific examples |
| --- | --- | --- |
| 1. Understand the problem and impact | Ask what is failing, since when, how many users, what changed | One AZ or all? Since a deployment? Prod or non-prod? |
| 2. Check monitoring, logs, metrics, events | Look for evidence before touching anything | Flow Logs `REJECT`, NAT metrics, CloudTrail for recent changes, health checks |
| 3. Verify architecture and configuration | Draw the intended path | Source subnet -> route table -> gateway/endpoint -> destination SG/NACL |
| 4. Narrow down root causes | List hypotheses, rank by likelihood | DNS, route, SG, NACL, endpoint, destination app |
| 5. Run safe diagnostics | Read-only first | `dig`, `nc`, `ip route get`, `describe-*`, Reachability Analyzer |
| 6. Apply the safest fix and validate | Smallest change, with rollback | Add one route or one SG rule, retest both directions |
| 7. Communicate and document | Update stakeholders, write the root cause | Timeline, impact, fix, owner |
| 8. Prevent recurrence | Add monitoring or automation | Config rule, alarm, IaC module, CI check |

### 19.2 VPC adaptation: network troubleshooting order

For pure connectivity problems, step 4 usually follows this order, because it matches how a packet travels:

```text
1. DNS        -> does the name resolve to the right IP?
2. Route      -> does the source subnet have a route to the destination, and a return route?
3. SG         -> source outbound, destination inbound
4. NACL       -> both subnets, both directions, ephemeral ports
5. Gateway    -> NAT/IGW/endpoint/peering/TGW/VPN available and associated?
6. Host/app   -> OS firewall, service listening, health
```

**Interpretation shortcut:** timeout = dropped in the network. Connection refused = reached the host, no listener. TLS error = network is fine.

### 19.3 Worked example answer (about 90 seconds)

> **Question:** "Your private EC2 instances suddenly cannot download packages. How do you troubleshoot?"
>
> "First I'd confirm the impact: which instances, which AZ, and what changed recently. Then I'd look at evidence: CloudTrail for route or NAT changes, and the NAT Gateway state and metrics. My hypothesis list is DNS, route table, NAT Gateway health, SG or NACL egress, and the repository itself.
>
> I'd test from an affected instance with `dig` for DNS and `curl -v` for the connection. If DNS works and the connection times out, I'd check the private route table for `0.0.0.0/0` pointing to an available NAT Gateway, looking for a blackhole route. I'd verify the NAT Gateway sits in a public subnet whose route table has an IGW route, and I'd check outbound SG and NACL rules including return ephemeral ports.
>
> If I find a blackhole route to a deleted NAT Gateway, I'd restore it through Terraform, then validate with `curl` from the instance. I'd post an update with impact and cause, and prevent recurrence with an AWS Config rule for blackhole routes and an alarm on NAT metrics. For the longer term I'd add S3 and ECR endpoints so critical dependencies don't all rely on one NAT path."

### 19.4 Interview delivery tips

1. Say the framework steps out loud: it shows structure.
2. State assumptions ("assuming IPv4 and a NAT Gateway design").
3. Prefer read-only checks first and say so.
4. Mention trade-offs (cost versus resilience).
5. Do not claim you built something you have not. Say "in a design like this, I would…" when talking about hypothetical or learning scenarios, and use your real project experience only where it is genuinely yours.

---

## 20. Quick Revision

### 20.1 Key points to remember

1. VPC = regional. Subnet = one AZ.
2. Public subnet = route to IGW. Reachability also needs a public IP, SG and NACL.
3. NAT Gateway lives in a **public** subnet, is **zonal**, and serves **outbound IPv4** only.
4. SG = stateful, allow only, ENI level. NACL = stateless, allow and deny, subnet level, ordered rules.
5. Peering is non-transitive and needs non-overlapping CIDRs. Transit Gateway gives hub-and-spoke.
6. Gateway endpoints (S3, DynamoDB) use routes. Interface endpoints use ENIs and DNS.
7. AWS reserves 5 IPs per subnet.
8. Longest prefix wins. Blackhole routes drop traffic.
9. Flow Logs show metadata with delay. Reachability Analyzer analyses configuration only.
10. EKS pods consume VPC IPs (with the default VPC CNI), so plan subnet size.

### 20.2 Important commands

| Goal | Command |
| --- | --- |
| Route used for a destination | `ip route get <ip>` |
| TCP test | `nc -vz -w 5 <ip> <port>` |
| DNS test | `dig +short <name>` and `dig <name> @169.254.169.253` |
| Listening ports | `sudo ss -lntp` |
| Subnet free IPs | `aws ec2 describe-subnets --query '...AvailableIpAddressCount'` |
| Blackhole routes | `aws ec2 describe-route-tables --query "RouteTables[].Routes[?State=='blackhole']"` |
| NAT state | `aws ec2 describe-nat-gateways` |
| Endpoint state | `aws ec2 describe-vpc-endpoints` |
| Path analysis | `aws ec2 create-network-insights-path` + `start-network-insights-analysis` |
| Terraform safety | `terraform fmt`, `validate`, `plan -out`, `apply` |

### 20.3 Commonly confused concepts

| Pair | Difference in one line |
| --- | --- |
| IGW vs NAT Gateway | Two-way public access vs outbound-only for private resources |
| SG vs NACL | Stateful instance-level allow-only vs stateless subnet-level allow/deny |
| Public subnet vs public instance | Subnet has an IGW route; instance also needs a public IP |
| Peering vs TGW | One-to-one non-transitive vs hub with routing control |
| Gateway vs interface endpoint | Route-based (S3/DynamoDB) vs ENI/DNS-based (many services) |
| Flow Logs vs Reachability Analyzer | Real traffic history vs configuration simulation |
| VPN vs Direct Connect | Encrypted over internet vs dedicated, unencrypted by default |
| Timeout vs refused | Dropped on the path vs reached host with no listener |
| EIP vs auto-assigned public IP | Static, owned vs ephemeral, tied to instance |
| NAT (IPv4) vs egress-only IGW (IPv6) | Address translation vs outbound-only gateway without translation |

### 20.4 Five-minute revision notes

1. **Design:** `/16` VPC, 3 tiers, 2–3 AZs, per-AZ route tables, NAT per AZ.
2. **Routing:** local route always exists, most specific wins, check for blackholes, no IGW route in the main table.
3. **Security:** SG-to-SG, no open admin ports, NACLs optional, Session Manager.
4. **Private AWS access:** S3/DynamoDB gateway endpoints first (free), interface endpoints where traffic justifies.
5. **Connectivity:** peering for a few VPCs, TGW for many, PrivateLink for single services and overlapping CIDRs, VPN/DX for hybrid.
6. **DNS:** `enableDnsSupport` + `enableDnsHostnames`, PHZ association, Resolver endpoints for hybrid.
7. **Observability:** Flow Logs, CloudTrail, Config, NAT/VPN metrics, Reachability Analyzer.
8. **Troubleshooting order:** DNS -> route -> SG -> NACL -> gateway -> host.
9. **Cost levers:** endpoints, AZ-local traffic, NAT per AZ only where needed, release unused IPs.
10. **Always:** IaC, small changes, document root causes.

### 20.5 Quick-reference cheat sheet

```text
CIDR math      : addresses = 2^(32-prefix)   | AWS usable = addresses - 5
Reserved IPs   : .0 network, .1 router, .2 DNS, .3 future, last = broadcast
Public subnet  : 0.0.0.0/0 -> IGW
Private subnet : 0.0.0.0/0 -> NAT (NAT sits in a PUBLIC subnet)
Isolated       : local route only
S3 endpoint    : gateway type, add to route tables
Peering        : routes on BOTH sides, no transit, no overlap
TGW            : attachments + TGW route tables (association/propagation) + VPC routes
NACL           : lowest rule number wins, allow ephemeral ports for returns
SG             : stateful, allow only, can reference SGs
Flow Logs      : ACCEPT/REJECT, delayed, no payload
Timeout        : drop on path     Refused: no listener     TLS error: network OK
```

### 20.6 Ten rapid-fire questions (with short answers)

1. **Is a VPC regional or zonal?** Regional. Subnets are zonal.
2. **How many IPs does AWS reserve per subnet?** Five.
3. **What makes a subnet public?** A route to an Internet Gateway.
4. **Where do you place a NAT Gateway?** In a public subnet, one per AZ for production.
5. **Are security groups stateful?** Yes. NACLs are stateless.
6. **Can security groups deny traffic?** No, allow rules only.
7. **Is VPC peering transitive?** No.
8. **Which services use gateway endpoints?** S3 and DynamoDB.
9. **Does Direct Connect encrypt by default?** No.
10. **What do Flow Logs record?** Traffic metadata (not payload) with ACCEPT/REJECT, delayed by aggregation.

### 20.7 Final interview readiness checklist

Tick each item only if you can explain it **without notes**.

- [ ] I can draw a three-tier, multi-AZ VPC and explain every route table.
- [ ] I can explain exactly what makes a subnet public and what makes an instance reachable.
- [ ] I can calculate usable IPs for any CIDR and explain the 5 reserved addresses.
- [ ] I can explain NAT Gateway placement, HA design and cost levers.
- [ ] I can compare SG and NACL, including stateful versus stateless and return traffic.
- [ ] I can configure and explain gateway versus interface endpoints and their DNS behaviour.
- [ ] I can choose between peering, Transit Gateway and PrivateLink and justify it.
- [ ] I can explain VPN versus Direct Connect and a resilient hybrid design.
- [ ] I can troubleshoot a timeout using DNS -> route -> SG -> NACL -> gateway -> host.
- [ ] I can read a Flow Log record and use Reachability Analyzer correctly.
- [ ] I can explain EKS pod IP consumption and the mitigation options.
- [ ] I can write or read a Terraform VPC module and explain each resource.
- [ ] I can state which controls are mandatory versus optional and justify them.
- [ ] I have rehearsed the eight-step framework with at least three scenarios aloud.

### 20.8 Official documentation (verify current details here)

- Amazon VPC User Guide: <https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html>
- Subnets: <https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html>
- Route tables: <https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html>
- NAT gateways: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html>
- VPC endpoints and PrivateLink: <https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html>
- Transit Gateway: <https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html>
- Flow Logs: <https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html>
- Reachability Analyzer: <https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html>
- Amazon EKS networking: <https://docs.aws.amazon.com/eks/latest/userguide/eks-networking.html>

> Some of these URLs may be reorganised by AWS over time. If a link moves, search the title on the AWS documentation site.
