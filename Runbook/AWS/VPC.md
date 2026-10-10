# Amazon VPC: L5 Quick Revision Book

> **Target:** Senior DevOps Engineer, SRE, Cloud Engineer, Platform Engineer (about 5 years of experience)
> **Read time:** 10–15 minutes. Section 9 is a standalone 5-minute sheet.
> **Conventions:** `xxxx` in IDs means "your value". **[CHANGES]** marks a command that modifies resources. **[VERIFY]** marks version-dependent or pricing-dependent facts. Check the AWS docs (links at the end).

## Table of Contents

1. [Concept Quick Revision](#1-concept-quick-revision)
2. [Architecture and Integration](#2-architecture-and-integration)
3. [Important Commands and Configuration](#3-important-commands-and-configuration)
4. [Scenario-Based Troubleshooting](#4-scenario-based-troubleshooting)
5. [Universal Troubleshooting Framework](#5-universal-troubleshooting-framework)
6. [L5 Interview Questions and Key Answers](#6-l5-interview-questions-and-key-answers)
7. [Common Mistakes and Interview Traps](#7-common-mistakes-and-interview-traps)
8. [Official References](#8-official-references)
9. [Final 5-Minute Revision Sheet](#9-final-5-minute-revision-sheet)

---

## 1. Concept Quick Revision

Order: fundamentals first, then connectivity, then operations.

### 1.1 VPC

- **What:** A logically isolated virtual network in one AWS Region and one account. It spans all AZs in the Region.
- **Why:** Isolation, control over IP ranges, routing and filtering, private connectivity to on-prem and AWS services.
- **How:** An implicit router applies route tables. Same-VPC traffic uses the `local` route.
- **Example:** `10.0.0.0/16` VPC with public, app and DB subnets in 2–3 AZs.
- **Interview point:** The **VPC is regional; a subnet is zonal**. The default VPC is for demos, not production.

### 1.2 CIDR and IP planning

- **What:** `address/prefix`. Addresses = `2^(32-prefix)`. VPC IPv4 size is `/16` to `/28`.
- **Why:** Overlapping CIDRs break peering, TGW, VPN and DX. Fixing it later means re-IPing.
- **How:** AWS reserves **5 IPs per subnet**: `.0` network, `.1` router, `.2` DNS, `.3` future, last address broadcast. You cannot resize a CIDR, but you can add **secondary CIDRs**.
- **Example:** `/24` subnet gives 251 usable IPs.
- **Interview point:** Size app subnets generously. EKS pods use VPC IPs with the default VPC CNI. Use **VPC IPAM** to prevent overlap.

### 1.3 Subnets

- **What:** An IP range inside the VPC, in exactly one AZ.
- **Why:** Separates tiers and spreads workloads across AZs.
- **How:** Public, private and isolated are defined **only by the route table**.
- **Example:** ALB and NAT in public, app in private, RDS in isolated (local route only).
- **Interview point:** An instance is internet-reachable only if **all five** hold: IGW route, public/Elastic/IPv6 address, SG allows, NACL allows both directions, OS and app listening.

### 1.4 Route tables

- **What:** Rules mapping a destination CIDR or prefix list to a target (local, IGW, NAT, peering, TGW, VGW, endpoint, ENI).
- **Why:** They decide where traffic goes.
- **How:** **Longest prefix match** wins. A subnet uses exactly one table (explicit or the main table). A route to a deleted target becomes **blackhole** and drops traffic.
- **Example:** `10.20.0.0/16 -> pcx` beats `0.0.0.0/0 -> NAT` for `10.20.5.7`.
- **Interview point:** Never put an IGW route in the **main** route table. New subnets would silently become public.

### 1.5 Internet Gateway, NAT Gateway, Egress-only IGW

- **IGW:** Two-way internet for resources with public addresses. No hourly charge. It does not make an instance public by itself.
- **NAT Gateway:** Outbound-only IPv4 for private subnets. A classic (zonal) NAT sits in a **public** subnet with an Elastic IP.
- **Egress-only IGW:** Outbound-only IPv6 (`::/0 -> eigw`). IPv6 has no NAT.
- **Example:** Per-AZ private route table points `0.0.0.0/0` to the NAT in the same AZ.
- **Interview point:** Zonal NAT is redundant within one AZ only, so use **one per AZ** in production. **[VERIFY]** AWS added a **regional NAT gateway** mode (announced Nov 2025). It spans AZs automatically, does not need a public subnet, and AWS says it does not support private connectivity (use zonal for private NAT). Check pricing and Terraform provider support before using it.

### 1.6 Security Groups and NACLs

- **SG:** Stateful, allow-only, attached to ENIs, can reference other SGs. All rules are evaluated together.
- **NACL:** Stateless, allow and deny, attached to subnets, rules evaluated by lowest number first, first match wins. CIDR sources only.
- **Example:** `db-sg` allows 5432 only from `app-sg`. A NACL denies a known bad CIDR.
- **Interview point:** NACLs need **ephemeral port** rules for return traffic. Use SGs as the primary control and NACLs as an optional coarse layer. NACLs do not filter traffic inside the same subnet.

### 1.7 VPC endpoints and PrivateLink

- **Gateway endpoint:** S3 and DynamoDB only. Route table entry (prefix list). No endpoint charge.
- **Interface endpoint:** ENIs in your subnets, has an SG, many services, hourly per-AZ and per-GB cost. **Private DNS** makes the normal service hostname resolve to private IPs.
- **Example:** Private EKS nodes use `ecr.api`, `ecr.dkr`, `sts`, `logs` interface endpoints plus an `s3` gateway endpoint (ECR layers come from S3). **[VERIFY]** the exact list in current EKS docs.
- **Interview point:** Gateway endpoints are **not reachable from on-prem or peered VPCs**. An endpoint policy restricts, it never grants. IAM is still required.

### 1.8 Peering vs Transit Gateway vs PrivateLink

- **Peering:** One-to-one, non-transitive, no overlapping CIDRs, routes needed on **both** sides, no edge-to-edge routing through the peer's IGW, NAT, VPN or DX.
- **Transit Gateway:** Regional hub. Attachments, TGW route tables, **association** (which table an attachment uses) and **propagation** (which tables learn its routes). VPC route tables still need routes to the TGW. Share with RAM.
- **PrivateLink:** Consumer reaches one service only. **Works with overlapping CIDRs.**
- **Interview point:** Full mesh of N VPCs needs `N(N-1)/2` peerings (30 VPCs = 435). Use TGW for scale and segmentation.

### 1.9 Hybrid: Site-to-Site VPN and Direct Connect

- **VPN:** IPsec over the internet, two tunnels per connection, BGP preferred, fast to set up.
- **Direct Connect:** Dedicated circuit, consistent latency, weeks to provision, **not encrypted by default** (add MACsec or IPsec over DX).
- **Example:** DX primary and VPN backup, both attached to TGW or a DX gateway.
- **Interview point:** A single DX circuit is a single point of failure. Hybrid DNS needs Route 53 Resolver endpoints.

### 1.10 DNS in a VPC

- **What:** The Amazon resolver is at VPC base + 2 (for example `10.0.0.2`) and at `169.254.169.253`.
- **How:** `enableDnsSupport` turns the resolver on. `enableDnsHostnames` gives public DNS names. Private hosted zones need both and must be **associated with each VPC**. Resolver inbound endpoint: on-prem to AWS. Outbound endpoint plus rules: AWS to on-prem.
- **Interview point:** DNS success does not prove connectivity. Per-ENI DNS query limits can cause intermittent failures in busy Kubernetes clusters. **[VERIFY]** the limit and consider NodeLocal DNSCache.

### 1.11 Observability

- **Flow Logs:** Metadata only (5-tuple, bytes, packets, ACCEPT/REJECT). Delayed (aggregation interval of 10 minutes by default, 1 minute optional). Destinations: CloudWatch Logs, S3, Firehose.
- **Not logged (per AWS docs):** traffic to the Amazon DNS server, instance metadata (`169.254.169.254`), Amazon Time Sync (`169.254.169.123`), the default VPC router reserved address, Windows license activation.
- **Reachability Analyzer:** Analyses **configuration** (routes, SGs, NACLs, gateways). It sends no packets and cannot see the OS or app.
- **Others:** CloudTrail (who changed it), AWS Config (drift), Network Access Analyzer (unintended exposure), Traffic Mirroring (packets).
- **Interview point:** Enable Flow Logs **before** the incident.

---

## 2. Architecture and Integration

### 2.1 Reference architecture

```text
                    Internet
                       |
                 Route 53 / CloudFront+WAF (optional)
                       |
                 Internet Gateway
                       |
 +---------------------+---------------------------------------------+
 | VPC 10.0.0.0/16                                                   |
 |  AZ-a                              AZ-b                           |
 |  Public  : ALB node, NAT-a         Public  : ALB node, NAT-b      |
 |  App     : EC2 / EKS nodes (/20)   App     : EC2 / EKS nodes      |
 |  DB      : RDS primary (isolated)  DB      : RDS standby          |
 |                                                                   |
 |  App RT-a: 0/0 -> NAT-a, S3 prefix list -> gateway endpoint       |
 |  App RT-b: 0/0 -> NAT-b                                           |
 |  DB  RT  : local only                                             |
 |  Interface endpoints (ECR, STS, Logs, SSM...) in each AZ          |
 +---------+---------------------------------------------------------+
           | TGW attachment (1 subnet per AZ)
     +-----+--------------------+
     | Transit Gateway          |---- Inspection VPC (appliance mode)
     | (shared via RAM)         |---- Shared-services VPC
     +-----+--------------------+
           |
   Direct Connect (primary) + Site-to-Site VPN (backup)  -->  On-prem
```

### 2.2 End-to-end workflow (user request)

1. User resolves the name through Route 53 and gets the ALB address.
2. Traffic enters through the IGW to the ALB in public subnets. `alb-sg` allows 443.
3. ALB forwards to app targets in private subnets. `app-sg` allows the app port from `alb-sg` only.
4. App connects to the DB in isolated subnets. `db-sg` allows 5432 from `app-sg` only.
5. App calls AWS services through endpoints, and the internet through the per-AZ NAT.
6. App reaches on-prem through TGW then DX (or VPN as backup).
7. Flow Logs go to S3, CloudTrail and Config record changes.

**Packet check order:** source SG outbound, source NACL outbound, route table, destination NACL inbound, destination SG inbound.

### 2.3 Integrations

| Technology | How it depends on VPC | What breaks when it fails |
|---|---|---|
| **EKS** | Pods use VPC IPs (VPC CNI). Subnets tagged `kubernetes.io/role/elb` and `internal-elb`. Private API endpoint needs VPC access | Pods stuck in `ContainerCreating` (IP exhaustion), LB controller cannot find subnets, nodes cannot pull images |
| **Terraform** | Defines VPC, routes, endpoints as code | Drift, accidental route or NAT deletion, state lock issues |
| **CI/CD runners** | Need egress or endpoints, private API access | Pipelines fail on package or registry access |
| **Docker/ECR** | `ecr.api`, `ecr.dkr`, S3 gateway endpoint | Image pull timeouts on private nodes |
| **Monitoring** | Flow Logs, NAT/TGW/VPN metrics, Resolver query logs | Blind spots during incidents |
| **Security** | SGs, NACLs, endpoint policies, WAF, Network Firewall, GuardDuty (uses Flow Logs and DNS logs) | Exposure or over-blocking |
| **Linux** | Routes, resolver config, local firewall | App-level timeouts despite correct AWS config |
| **IAM/Secrets** | Endpoint policies, Secrets Manager and STS via interface endpoints | `AccessDenied` or timeouts for credentials |

### 2.4 Most important dependencies to check when troubleshooting

1. DNS (resolver, PHZ association, DHCP options, endpoint Private DNS).
2. Route table actually associated with the **source** subnet, and the **return** route.
3. Target health: NAT state, peering `active`, TGW attachment and propagation, endpoint `available`.
4. SG outbound and inbound, NACLs on both subnets, both directions.
5. Destination service listening and healthy.
6. Recent changes: CloudTrail and Terraform history.

---

## 3. Important Commands and Configuration

Read-only unless marked **[CHANGES]**. Run host commands via SSM Session Manager, not open SSH.

| Command / Configuration | Purpose | What to Check |
|---|---|---|
| `ip route get <ip>` | Route the OS will use | Gateway should be the subnet `.1` router |
| `nc -vz -w 5 <host> <port>` | TCP handshake test | **Timeout** = dropped on path. **Refused** = reached host, no listener |
| `dig +short <name>` then `dig <name> @169.254.169.253` | Compare default resolver with Amazon resolver | If only the Amazon resolver works, check DHCP options and `resolv.conf` |
| `curl -sv -w 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect}\n' -o /dev/null <url>` | Where it stalls | Slow DNS, connect or TLS stage |
| `sudo ss -lntp` | Is the service listening (run on destination) | Port bound to `0.0.0.0` or the right IP |
| `sudo tcpdump -ni any host <ip> and port <p>` | Packet-level proof | SYN arrives but no SYN-ACK = app or return path. Nothing = dropped upstream |
| `aws ec2 describe-subnets --filters Name=vpc-id,Values=<vpc> --query 'Subnets[].{Id:SubnetId,AZ:AvailabilityZone,Free:AvailableIpAddressCount}'` | Free IPs per subnet | Low `Free` on EKS subnets |
| `aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=<subnet>` | Route table of one subnet | Empty result means the **main** table is used |
| `aws ec2 describe-route-tables --filters Name=vpc-id,Values=<vpc> --query 'RouteTables[].Routes[?State==`blackhole`]'` | Find blackhole routes | Any result is a broken target |
| `aws ec2 describe-nat-gateways --filter Name=vpc-id,Values=<vpc>` | NAT state and subnet | State `available`, subnet has IGW route |
| `aws ec2 describe-security-group-rules --filters Name=group-id,Values=<sg>` | SG rules | Source SG is the **current** one |
| `aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=<subnet>` | NACL entries | Rule order, ephemeral ports, deny before allow |
| `aws ec2 describe-vpc-endpoints --filters Name=vpc-id,Values=<vpc>` | Endpoint state, type, Private DNS | `available`, `PrivateDnsEnabled=true`, correct route tables |
| `aws ec2 describe-vpc-peering-connections` | Peering status | `active`, then check routes on both sides |
| `aws ec2 describe-vpc-attribute --vpc-id <vpc> --attribute enableDnsSupport` (and `enableDnsHostnames`) | DNS attributes | Both true for PHZ and endpoint DNS |
| `aws ec2 describe-flow-logs --filter Name=resource-id,Values=<vpc>` | Are Flow Logs on | Destination, interval, fields |
| `aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id <rtb> --filters Name=state,Values=active` | TGW routes | Expected CIDRs present, no blackhole |
| `aws ec2 create-network-insights-path` then `start-network-insights-analysis` then `describe-network-insights-analyses` **[CHANGES: creates analysis objects, billed]** | Reachability Analyzer | `NetworkPathFound` false names the blocking SG, NACL or route. **[VERIFY]** pricing |
| `aws ec2 create-route` / `replace-route` / `delete-route` **[CHANGES: can cause outage]** | Edit routes | Change via IaC, one route at a time, verify the target first |
| `aws ec2 authorize-security-group-ingress` **[CHANGES]** | Add SG rule | Narrow source and port, never `0.0.0.0/0` on admin or DB ports |
| `aws ec2 modify-vpc-endpoint` **[CHANGES]** | Change endpoint route tables, SGs, policy | A wrong policy blocks ECR layer pulls |
| `aws ec2 delete-nat-gateway` **[CHANGES: breaks egress]** | Remove NAT | Check which route tables point to it first |
| `terraform fmt`, `validate`, `plan -out=tfplan`, `apply tfplan` | Safe IaC workflow | Plan shows no unexpected `0.0.0.0/0` routes in app or DB tables |

**Reachability Analyzer reminder:** a "reachable" result does not prove the app works. It ignores the OS firewall and application state.

### Key configuration patterns

```text
Public RT      : 10.0.0.0/16 local | 0.0.0.0/0 -> igw
Private RT (a) : 10.0.0.0/16 local | 0.0.0.0/0 -> nat-a | S3 prefix list -> vpce
Isolated RT    : 10.0.0.0/16 local
Peering        : route to peer CIDR on BOTH sides + SG/NACL allow
TGW            : VPC RT -> TGW, plus TGW association and propagation
NACL web       : in 443 | in 1024-65535 (returns) | out 443 | out 1024-65535
```

---

## 4. Scenario-Based Troubleshooting

Always lead with evidence, not guesses. Each scenario ends with a speakable answer.

### S1. Private instances in one AZ suddenly cannot reach the internet

**Problem:** "Pods in AZ-b fail to call external APIs. AZ-a is fine."

**First checks:** What changed? Compare AZ-a and AZ-b private route tables and NAT state.

**Commands/tools:** blackhole route query, `describe-nat-gateways`, CloudTrail (`DeleteNatGateway`, `ReplaceRoute`, `DeleteRoute`), `curl -v` from an affected host.

**Possible causes:** NAT deleted (route is blackhole), NAT subnet lost its IGW route, EIP problem, wrong route table association, SG/NACL egress change.

**Resolution:** Recreate or repoint the NAT through Terraform. Then retest with `curl`.

**Prevention:** NAT per AZ in IaC, restrict delete permissions, Config rule or EventBridge alert for blackhole routes, alarm on NAT metrics.

**Interview answer:** "A failure confined to one AZ makes me compare per-AZ config. I check route tables for blackholes, NAT state and the NAT subnet's IGW route, and CloudTrail for recent changes. If a NAT was deleted, I restore it through Terraform, validate from an affected host, and add a Config rule so blackhole routes alert immediately."

### S2. App gets a timeout connecting to the database

**Problem:** "Connection timed out to RDS port 5432."

**First checks:** Timeout means dropped, not refused. Confirm DNS returns the right IP.

**Commands/tools:** `nc -vz -w 5`, `describe-security-group-rules`, `describe-network-acls`, Flow Logs (REJECT on DB ENI), Reachability Analyzer.

**Possible causes:** DB SG references an old app SG, wrong endpoint or port, NACL missing return ports, DB in another VPC without routes, DB not available.

**Resolution:** Fix the SG source to the current app SG (or fix the route or NACL once confirmed).

**Prevention:** SG references from IaC module outputs, alert on REJECT spikes to DB ports.

**Interview answer:** "A timeout points at the network, so I walk DNS, route, SG, NACL in packet order. Flow Logs showed REJECT on the DB ENI and the DB SG referenced a replaced app SG. I fixed the reference in Terraform and wired the SG ID through module outputs so it can't go stale."

### S3. Peering is `active` but VPCs cannot talk

**Problem:** "Peering shows active, still timeouts between VPC-A and VPC-B."

**First checks:** Active only means the link exists.

**Commands/tools:** `describe-route-tables` for the **source subnet's** table on both sides, SG and NACL rules, CIDR comparison.

**Possible causes:** Route on one side only, route in the wrong table, SG or NACL blocks, overlapping CIDRs, expecting transitive routing.

**Resolution:** Add routes to the correct tables on both sides.

**Prevention:** One Terraform module creates the peering and both routes. Reachability Analyzer check for critical paths in CI.

**Interview answer:** "Active peering is necessary, not sufficient. I verify routes in the table actually associated with the source subnet and the return routes on the other side, then SG and NACL. I fixed the missing return route and put both sides in one module."

### S4. SGs are correct but a NACL change broke traffic

**Problem:** "After hardening, clients connect but responses never arrive."

**First checks:** Which subnet and which NACL? Request versus response.

**Commands/tools:** Flow Logs (request ACCEPT, response REJECT), `describe-network-acls`, Reachability Analyzer.

**Possible causes:** Missing ephemeral port rule, a lower-numbered deny, wrong association, missing outbound rule.

**Resolution:** Add the missing return-traffic rule with a rule number below any deny.

**Prevention:** Test in lower environment. Keep NACLs simple and rely on SGs.

**Interview answer:** "SGs are stateful, NACLs aren't. Accepted request plus rejected response in Flow Logs pointed to the NACL's return path. Adding the ephemeral range at the right rule number fixed it."

### S5. Private DNS name or AWS service name does not resolve

**Problem:** "IP works, name fails" or "app still hits the public service IP after creating an interface endpoint."

**First checks:** Separate DNS from connectivity.

**Commands/tools:** `dig <name>` versus `dig <name> @169.254.169.253`, `/etc/resolv.conf`, `describe-vpc-attribute`, endpoint `PrivateDnsEnabled`.

**Possible causes:** PHZ not associated with this VPC, `enableDnsSupport` or `enableDnsHostnames` off, custom DHCP DNS unreachable or not forwarding, missing Resolver rule, Private DNS disabled, hard-coded endpoint URL or IP.

**Resolution:** Fix the association or attribute, or enable Private DNS. For custom DNS, forward to the Amazon resolver.

**Prevention:** PHZ associations and VPC DNS attributes in IaC, Resolver query logs.

**Interview answer:** "I compared the default resolver with the Amazon resolver. The Amazon one worked, so the problem was DHCP or association, not routing. I fixed the association in code."

### S6. EKS pods stuck in `ContainerCreating` (no free IPs)

**Problem:** "Scale-out fails, pods can't get an IP address."

**First checks:** Pod events, `aws-node` logs, free IPs on node subnets.

**Commands/tools:** `kubectl describe pod`, `kubectl logs -n kube-system -l k8s-app=aws-node`, `describe-subnets`, `describe-network-interfaces` (orphaned ENIs).

**Possible causes:** Small node subnets (`/24`), warm-IP and warm-ENI settings holding addresses, leaked ENIs, too many pods per node.

**Resolution (short term):** Remove orphaned ENIs, tune warm targets, add nodes in subnets with space. **(Long term):** secondary CIDR with CNI custom networking, prefix delegation, or IPv6 clusters. **[VERIFY]** current VPC CNI docs.

**Prevention:** Size app subnets generously in the IPAM plan. Alert on low free IPs.

**Interview answer:** "With the VPC CNI, pods consume VPC IPs, so subnet size caps scale. I restored capacity quickly, then redesigned with a secondary CIDR so cluster growth isn't bound by the original node subnets."

### S7. Private EKS nodes cannot pull images

**Problem:** "`ImagePullBackOff`, nodes have no internet route."

**First checks:** Timeout (network) or `AccessDenied` (IAM or policy)?

**Commands/tools:** `describe-vpc-endpoints`, route tables of node subnets, endpoint SGs, `dig <ecr hostname>`.

**Possible causes:** Missing `ecr.api` or `ecr.dkr` endpoint, no S3 gateway endpoint (or not associated with node route tables), Private DNS off, endpoint SG blocks 443 from nodes, restrictive endpoint policy, missing STS or logs endpoints.

**Resolution:** Create or fix the endpoints, associate the S3 endpoint with node route tables, allow 443 from node SGs. **[VERIFY]** the current EKS private cluster endpoint list.

**Prevention:** Bake endpoints into the base VPC module and test image pulls in CI.

**Interview answer:** "ECR needs the API and Docker interface endpoints plus an S3 gateway endpoint because layers live in S3. I check DNS returns private IPs, the endpoint SG allows 443, and the S3 endpoint is on the node route tables."

### S8. Intermittent failures through Transit Gateway and a firewall VPC

**Problem:** "Some TCP flows between spoke VPCs hang or reset."

**First checks:** Draw forward and return paths. Suspect asymmetry with a stateful appliance.

**Commands/tools:** TGW route tables (`search-transit-gateway-routes`), association and propagation per attachment, firewall logs (only one direction seen), per-AZ routes in the inspection VPC.

**Possible causes:** Appliance mode disabled on the inspection attachment, wrong association, missing return route.

**Resolution:** Enable **appliance mode** on the inspection VPC attachment and verify symmetric routing. **[VERIFY]** current guidance for your firewall design.

**Prevention:** Reference architecture, per-AZ failover tests, synthetic checks between spokes.

**Interview answer:** "Intermittent plus stateful firewall means asymmetric routing until proven otherwise. I traced both directions through TGW route tables and found appliance mode off, so forward and return flows landed on different AZ appliances. Enabling it kept both directions on one AZ."

### S9. NAT Gateway bill spikes

**Problem:** "NAT data-processing charges jumped."

**First checks:** Which NAT, which AZ, which sources and destinations.

**Commands/tools:** Cost Explorer, CloudWatch `BytesOutToDestination`, Flow Logs plus Athena (top talkers).

**Possible causes:** S3, ECR or DynamoDB traffic going through NAT, cross-AZ NAT use, runaway job, log shipping, mass image pulls.

**Resolution:** Add S3 and DynamoDB gateway endpoints, interface endpoints for high-volume services, keep traffic AZ-local, cache images.

**Prevention:** Budgets and anomaly detection, NAT bytes dashboard, endpoints in the base module.

**Interview answer:** "I used Flow Logs in Athena to find top talkers. Most was AWS service traffic, so I moved it to endpoints. That cut cost and removed a dependency on NAT."

### S10. Intermittent outbound failures under load (port exhaustion)

**Problem:** "Random outbound connection failures during peaks. NAT is healthy."

**First checks:** NAT metrics for `ErrorPortAllocation`, connection count, and concentration to a single destination.

**Commands/tools:** CloudWatch NAT metrics, Flow Logs, application connection pool settings.

**Possible causes:** Too many concurrent connections to one destination IP and port from one NAT, no connection reuse, short-lived connections.

**Resolution:** Reuse connections (keep-alive and pooling), spread load, and use endpoints for AWS services. **[VERIFY]** NAT connection and scaling limits in current docs.

**Prevention:** Alarm on any sustained `ErrorPortAllocation`.

**Interview answer:** "Healthy NAT with intermittent failures made me check port allocation errors. I fixed connection reuse in the app and moved AWS traffic to endpoints, then added an alarm on the metric."

### S11. Everything looks correct but it still times out (obvious fix fails)

**Problem:** "SG, routes and NACLs all look right, Reachability Analyzer says reachable, and it still fails."

**First checks:** Do not assume. Prove where packets stop.

**Commands/tools:** `tcpdump` on both ends, `ss -lntp`, `ip route get`, Flow Logs on **both** ENIs.

**Possible causes:** OS firewall (`iptables`/`nftables`), service bound to `127.0.0.1`, asymmetric return route, wrong ENI or source SG (multi-ENI host), the check was done in a different VPC or Region, stale DNS pointing to an old IP, proxy settings.

**Resolution:** Fix the confirmed layer. Reachability Analyzer cannot see the host or app.

**Prevention:** Health checks on the real port, standard host baselines, and Flow Logs on in all tiers.

**Interview answer:** "When config looks right I prove packet flow instead of re-reading config. `tcpdump` at the destination showed SYNs arriving and nothing replying, so I moved to the host: the service was bound to localhost. The network was fine."

### S12. New VPC cannot reach on-prem (overlapping CIDR)

**Problem:** "A newly added VPC can't reach on-prem and one old route now misbehaves."

**First checks:** Compare the new CIDR against IPAM, TGW route tables and on-prem BGP.

**Commands/tools:** TGW route tables, customer router BGP table, IPAM.

**Possible causes:** The new range overlaps on-prem or another VPC. More-specific prefixes win and hijack traffic.

**Resolution:** Re-IP the new VPC (best before it holds workloads). Short term, expose only required services via PrivateLink or a private NAT pattern.

**Prevention:** IPAM allocation and a CI check that rejects overlap.

**Interview answer:** "Overlap is a design problem, not a config tweak. Short term I used PrivateLink for the one required service. Long term I re-addressed the VPC and enforced IPAM allocation."

---

## 5. Universal Troubleshooting Framework

Use this for any unfamiliar "X cannot reach Y" or "Y is slow" scenario. Say the steps aloud.

1. **Symptoms and business impact:** What fails, since when, how many users, what changed? Prod or non-prod?
2. **Scope:** One AZ, one subnet, one service, or everything? Compare working and failing.
3. **Evidence first:** Monitoring, Flow Logs, NAT/TGW/VPN metrics, CloudTrail and deploy history.
4. **Trace the full path:** Source, DNS, route, gateway or endpoint, destination, **and the return path**.
5. **Check every layer:** App, host OS, SG, NACL, route, gateway, DNS, IAM (for service calls), quotas.
6. **Test hypotheses with evidence:** Read-only first (`dig`, `nc`, `describe-*`, Reachability Analyzer, `tcpdump`).
7. **Safe fix and validation:** Smallest change, via IaC, with rollback. Retest in both directions.
8. **Prevent recurrence:** Alarm, Config rule, IaC module, CI check. Document the root cause.

**Adapt to urgency:** For a live outage, mitigate first (fail over, roll back the last change) and investigate after. For cost or design questions, spend more time on steps 3–4.

### Decision tree

```text
Connection fails
 |
 +-- DNS resolves to expected IP?
 |     no --> check resolver, PHZ association, DHCP options, DNS attributes, endpoint Private DNS
 |     yes
 |
 +-- Error type?
 |     "Connection refused" --> reached host: service down/wrong port/bound to localhost/OS firewall
 |     TLS/cert error       --> network OK: cert, SNI, proxy, clock
 |     timeout              --> continue below
 |
 +-- Source subnet route to destination (and return route)?
 |     no / blackhole --> fix route or target (NAT, pcx, TGW, endpoint)
 |     yes
 |
 +-- Source SG outbound + destination SG inbound allow it?
 |     no --> fix SG (reference current SG)
 |     yes
 |
 +-- NACLs on both subnets allow both directions + ephemeral ports?
 |     no --> fix rule number/order/ports
 |     yes
 |
 +-- Gateway healthy and associated? (NAT state, pcx active, TGW propagation, VPN tunnels, endpoint)
 |     no --> fix gateway
 |     yes
 |
 +-- tcpdump on destination: do SYNs arrive?
       no  --> upstream drop: re-check Flow Logs REJECT, asymmetric routing
       yes --> host/app: listener, OS firewall, app health
```

---

## 6. L5 Interview Questions and Key Answers

### Core concepts

**Q1. VPC regional or zonal? Subnet?**
- VPC is regional (all AZs). Subnet is one AZ.
- HA means subnets in at least two AZs with resources spread across them.
- *Follow-up:* Cross-Region? Inter-Region peering, TGW peering, or VPN/DX designs.

**Q2. What makes a subnet public, and an instance reachable?**
- Subnet: route to an IGW. Instance: also needs a public/Elastic/IPv6 address, SG and NACL allow, and an app listening.
- *Follow-up:* Why not use the main route table for the IGW route? New subnets become public by default.

**Q3. CIDR and reserved IPs?**
- `2^(32-prefix)` addresses, minus 5 reserved per subnet. `/24` gives 251.
- Cannot resize, can add secondary CIDRs.
- *Follow-up:* How do you prevent overlap? IPAM and a CI check.

### Internal working

**Q4. How does routing decide?**
- Longest prefix match. Local route always exists. A subnet uses one table (explicit or main).
- Static beats propagated for equal prefixes, with more rules for VPN/DX. **[VERIFY]** order.
- *Follow-up:* What is a blackhole? Route with a deleted or unavailable target. Traffic is dropped.

**Q5. How does a NAT Gateway work?**
- Private route `0.0.0.0/0 -> NAT`. NAT (public subnet) swaps source to its EIP, sends via the IGW, and reverses the response.
- No inbound connections from the internet.
- *Follow-up:* Regional NAT? Spans AZs automatically, no public subnet needed, no private-NAT use. **[VERIFY]** cost and IaC support.

**Q6. Packet evaluation order inside a VPC?**
- Outbound: SG then NACL then route. Inbound: NACL then SG.
- *Follow-up:* Does the NACL filter same-subnet traffic? No.

### Architecture and integrations

**Q7. Peering vs TGW vs PrivateLink?**
- Peering: few VPCs, non-transitive, cheap. TGW: many VPCs, transitive by route design, segmentation, on-prem hub. PrivateLink: one service, overlapping CIDRs allowed.
- *Follow-up:* Keep prod and dev apart? Separate TGW route tables with controlled propagation.

**Q8. Design a connection for 30 VPCs plus on-prem.**
- TGW with RAM sharing, segmented route tables, DX primary plus VPN backup, no overlaps (verify first), inspection VPC with appliance mode if required.
- *Follow-up:* Cost? Attachment-hours plus per-GB. Estimate before committing.

**Q9. Gateway vs interface endpoint?**
- Gateway: S3 and DynamoDB, route-based, free, local to VPC. Interface: ENI plus SG plus Private DNS, many services, billed, reachable via routed connectivity.
- *Follow-up:* Lock a bucket to your VPC? `aws:SourceVpce` condition. Test for lock-outs of console and CI.

**Q10. Hybrid DNS?**
- Resolver inbound endpoint (on-prem to AWS), outbound endpoint plus rules (AWS to on-prem), PHZ associations.

### Production troubleshooting

**Q11. A connection times out. Your method?**
- Source, destination, port, direction. DNS, route (and return), SG, NACL, gateway, host. Evidence from Flow Logs and `tcpdump`. Smallest fix, retest.
- *Follow-up:* Timeout vs refused? Dropped on path vs reached host with no listener.

**Q12. Works in AZ-a, fails in AZ-b?**
- Compare route tables (blackhole, NAT target), NAT state, NACLs, SGs, endpoint ENIs per AZ, per-AZ dependencies (mount targets, replicas). CloudTrail for recent changes.

**Q13. Prove a NACL blocks the response.**
- Flow Logs show request ACCEPT and response REJECT. List NACL rules both directions. Reachability Analyzer names the entry.

**Q14. Reachability Analyzer vs Flow Logs vs tcpdump?**
- Config analysis (no packets) vs historical metadata (delayed) vs packet truth. Use in that order.

### Security and reliability

**Q15. Least privilege at the network layer?**
- SG-to-SG, specific ports, no admin or DB ports to the world, Session Manager over SSH, endpoint and bucket policies, IAM limits on `CreateRoute`, `AuthorizeSecurityGroupIngress`, `AttachInternetGateway`, `DeleteNatGateway`.

**Q16. Audit for accidental internet exposure?**
- Config and Security Hub rules for open SGs, list IGW routes and their subnets, public IP inventory, **Network Access Analyzer**, review Flow Logs for unexpected inbound ACCEPT, CI scanning of Terraform.

**Q17. Secure app-to-DB?**
- Isolated DB subnet, SG from app SG only, TLS with verification, Secrets Manager rotation, Flow Logs and DB audit logs.
- *Follow-up:* "Open the DB to the internet temporarily?" Decline. Offer SSM port forwarding, VPN or MFA bastion, time-limited and audited.

### Scaling and performance

**Q18. EKS pod IP exhaustion?**
- VPC CNI gives each pod a VPC IP. Short term: free orphan ENIs, tune warm targets, add subnets. Long term: secondary CIDR with custom networking, prefix delegation, IPv6. **[VERIFY]** current docs.

**Q19. Reduce NAT cost and risk?**
- Gateway endpoints (free), interface endpoints for heavy services, AZ-local traffic, image and package caches, budgets and anomaly detection.
- *Follow-up:* Centralised egress for many VPCs? Simpler control, but TGW data processing and shared blast radius.

### Failure recovery and design trade-offs

**Q20. HA production VPC design?**
- `/16` from IPAM, three tiers across 2–3 AZs, NAT per AZ with per-AZ route tables, ALB public, apps private, DB isolated Multi-AZ, endpoints, SG-to-SG, Flow Logs, CloudTrail and Config, all in Terraform with CI checks. DR Region has a non-overlapping CIDR and tested failover.

**Q21. VPN vs Direct Connect?**
- VPN: fast, encrypted, internet-based, variable. DX: consistent, high bandwidth, weeks to provision, not encrypted by default. Best practice is DX primary plus VPN backup, with redundant DX locations for critical workloads.

**Q22. Blast radius of a bad route table change?**
- Every associated subnet. Mitigate with IaC review, small changes, per-AZ tables, Config alerts, and rollback from version control.

**Q23. Zero-downtime migration to a new VPC?**
- Non-overlapping CIDR, connect via peering or TGW, replicate data, shift traffic gradually (weighted Route 53 or LB targets), then decommission.

**Q24. What changes with IPv6?**
- No NAT. Egress-only IGW for private outbound. Global addresses make SGs more important. Dual-stack routing. Apps must support IPv6.

---

## 7. Common Mistakes and Interview Traps

### Configuration mistakes

| Mistake | Correct approach |
|---|---|
| Same `10.0.0.0/16` in every VPC | Plan with IPAM, keep spare space, no overlaps |
| `/28` or `/24` subnets for EKS | Large app subnets (for example `/20`), secondary CIDR if needed |
| NAT Gateway in a private subnet | Place it in a **public** subnet (zonal NAT) |
| One NAT for all AZs in prod | One per AZ with per-AZ route tables |
| IGW route in the main route table | Explicit route tables only, main table left empty of internet routes |
| Peering route on one side only | Routes on both sides in the correct tables |
| S3 endpoint not on the right route tables | Associate with every route table that needs it |
| Endpoint SG missing 443 | Allow 443 from client SGs or CIDRs |

### Frequently confused concepts

| Confusion | Correct approach |
|---|---|
| IGW makes a subnet public | The **route** does. The instance also needs an address and permissive rules |
| NAT Gateway is multi-AZ | Zonal NAT is one AZ. Regional mode is a separate option **[VERIFY]** |
| SGs can deny | Allow-only. Use NACLs for denies |
| NACLs are stateful | Stateless: allow return ports |
| Peering is transitive | It is not. Use TGW |
| Gateway endpoints work from on-prem | They don't. Use interface endpoints |
| Flow Logs are packet capture | Metadata only, delayed |
| Direct Connect is encrypted | Not by default |

### Incorrect troubleshooting approaches

- **Guessing the root cause:** Gather evidence first (Flow Logs, CloudTrail, `tcpdump`).
- **Starting with the app when it times out:** Timeout is network. Refused is host or app.
- **Trusting Reachability Analyzer as proof:** It checks config only. Verify on the host.
- **Making several changes at once:** One change, then retest, so you know what fixed it.
- **Fixing in the console only:** Fix via IaC or you will cause drift.

### Security mistakes and production anti-patterns

- SSH or RDP open to `0.0.0.0/0`. Use Session Manager.
- DB in a public subnet or with a public IP. Use isolated subnets.
- Using the default VPC or default SG. Lock down the default SG.
- No Flow Logs until after an incident. Enable them early with retention and access control.
- Broad `ec2:*` network permissions. Restrict route, SG, IGW and NAT mutations.
- Relying on NACLs as the only control. SGs are primary.

### Commonly incomplete interview answers

- **"Use Transit Gateway"** without association, propagation, VPC routes, CIDR overlap and cost.
- **"Check security groups"** without route, NACL, DNS and host checks.
- **"Add a NAT Gateway"** without HA per AZ, cost and endpoint alternatives.
- **"Use VPC endpoints"** without gateway vs interface, Private DNS, SG and endpoint policy.
- **Claiming experience you don't have.** Say "in a design like this, I would...".

---

## 8. Official References

- VPC User Guide: <https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html>
- Route tables: <https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html>
- NAT gateways (incl. regional): <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html> and <https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateways-regional.html>
- Flow logs and limitations: <https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html> and <https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs-limitations.html>
- PrivateLink and endpoints: <https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html>
- Transit Gateway: <https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html>
- Reachability Analyzer: <https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html>
- Amazon EKS networking: <https://docs.aws.amazon.com/eks/latest/userguide/eks-networking.html>

> Quotas, pricing and newer features (regional NAT, VPC CNI options, DNS query limits) change. Confirm in the docs and Service Quotas before quoting numbers.

---

## 9. Final 5-Minute Revision Sheet

### Top concepts

1. VPC = regional. Subnet = one AZ. AWS reserves 5 IPs per subnet.
2. Public = route to IGW. Reachable = route + public IP + SG + NACL + app.
3. Longest prefix wins. Blackhole = deleted target, traffic dropped. No IGW route in the main table.
4. NAT (zonal) lives in a **public** subnet, outbound IPv4 only, one per AZ. Regional NAT exists **[VERIFY]**.
5. SG: stateful, allow-only, ENI, can reference SGs. NACL: stateless, allow/deny, subnet, ordered, needs ephemeral ports.
6. Gateway endpoint (S3, DynamoDB): route-based, free, VPC-local. Interface endpoint: ENI + SG + Private DNS, billed.
7. Peering: non-transitive, no overlap, routes both sides. TGW: attachments + association + propagation + VPC routes. PrivateLink: one service, overlap OK.
8. VPN: encrypted, two tunnels. DX: dedicated, not encrypted by default.
9. Flow Logs: metadata, delayed, some traffic not logged. Reachability Analyzer: config only.
10. EKS pods use VPC IPs: plan subnet size.

### Most useful commands

```text
ip route get <ip>                       nc -vz -w 5 <host> <port>
dig <name> ; dig <name> @169.254.169.253  sudo ss -lntp
sudo tcpdump -ni any host <ip> and port <p>
aws ec2 describe-route-tables (blackhole query)   describe-nat-gateways
describe-security-group-rules   describe-network-acls   describe-vpc-endpoints
describe-subnets (AvailableIpAddressCount)   describe-flow-logs
create-network-insights-path -> start-network-insights-analysis (billed)
terraform fmt | validate | plan -out | apply
```

### Common troubleshooting scenarios

| Scenario | First thing to check |
|---|---|
| One AZ loses egress | Blackhole route / deleted NAT |
| App to DB timeout | DB SG source, NACL, Flow Logs REJECT |
| Peering active, no traffic | Routes on both sides, correct table |
| Response never arrives | NACL ephemeral ports |
| Name fails, IP works | PHZ association, DNS attributes, DHCP |
| Pods `ContainerCreating` | Subnet free IPs, orphan ENIs |
| Private nodes can't pull images | ECR + S3 endpoints, Private DNS, SG 443 |
| Intermittent via firewall | Appliance mode, asymmetric routing |
| NAT bill spike | Flow Logs top talkers, add endpoints |
| Config looks right, still fails | `tcpdump`, host firewall, bind address |

### Important integrations

EKS (subnet size and tags), Terraform (per-AZ route tables, state security), ECR/S3/STS (endpoints), Route 53 (PHZ, Resolver), CloudTrail/Config (change tracking), GuardDuty (Flow Logs), TGW/DX/VPN (hybrid).

### Critical security and reliability practices

- SG-to-SG, no `0.0.0.0/0` on admin or DB ports, Session Manager over SSH.
- Private and isolated subnets for workloads and DBs across 2+ AZs.
- NAT per AZ, two VPN tunnels, redundant DX.
- Flow Logs, CloudTrail and Config on. Network changes via IaC and pull request.
- Endpoint and bucket policies restrict but IAM still grants.
- Do not use the default VPC or default SG for production.

### Ten rapid-fire questions

1. VPC regional or zonal? **Regional (subnet is zonal).**
2. Reserved IPs per subnet? **Five.**
3. What makes a subnet public? **A route to an IGW.**
4. Where does a (zonal) NAT Gateway go? **Public subnet, one per AZ.**
5. SGs stateful? **Yes. NACLs are stateless.**
6. Can SGs deny? **No.**
7. Peering transitive? **No.**
8. Which services use gateway endpoints? **S3 and DynamoDB.**
9. Does DX encrypt by default? **No.**
10. Timeout vs refused? **Dropped on path vs reached host with no listener.**

### Short speaking points

- "I trace the packet in order: DNS, route, SG, NACL, gateway, host."
- "Timeout means the network dropped it. Refused means it reached the host."
- "I use read-only diagnostics first, make the smallest change through IaC, and retest both directions."
- "Active peering or a reachable Reachability Analyzer result is necessary evidence, not proof the app works."
- "I would prevent recurrence with an alarm, a Config rule and a module change."
