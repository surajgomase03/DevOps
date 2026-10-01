# 🔥 Azure VNet — 10-Minute Interview Runbook

Use this for **quick revision before an Azure DevOps interview**. Focus on these points rather than memorizing a full portal lab.

## ⏱️ How to Use (10 minutes)

| Time | Do this |
| --- | --- |
| 0–2 min | Sections 1–4: VNet, CIDR, IPs, NIC |
| 2–5 min | Sections 5–9: NSG, route table, UDR, effective routes |
| 5–7 min | Sections 10–13: peering, service/private endpoint, private DNS |
| 7–9 min | Sections 14–15: troubleshooting flow and scenarios |
| 9–10 min | Section 16–17: Q&A and the final 30-second revision |

---

# 1. Azure VNet ⭐

* **VNet** = logically isolated network in Azure. Similar to an **AWS VPC**.
* A VNet contains: subnets, NICs, private IPs, route tables, NSGs, peering.

```text
VNet: 10.0.0.0/16
   |
   ├── Web   10.0.1.0/24
   ├── App   10.0.2.0/24
   └── DB    10.0.3.0/24
```

> 🎤 **Answer:** *"Azure VNet provides private network isolation and communication for Azure resources. I use subnets to separate workloads and NSGs and routes to control and direct traffic."*

---

# 2. CIDR & Subnet ⭐

```text
10.0.0.0/16   → 65,536 addresses
10.0.1.0/24   → 256 addresses  (251 usable in Azure)
```

* Azure **reserves 5 IPs per subnet**: network address (`.0`), default gateway (`.1`), Azure DNS (`.2`, `.3`) and broadcast (last).
* **Usable IPs = total − 5.**
* ⚠️ Subnets in a VNet **cannot overlap**, and must fit inside the VNet address space.

> 🎤 **Why divide a VNet into subnets?** *"For workload isolation, security control, routing and easier network management."*

---

# 3. Private IP vs Public IP ⭐

| Private IP | Public IP |
| --- | --- |
| Used for VM ↔ VM, VM ↔ Azure service, VNet ↔ VNet | Used when a resource needs internet-facing connectivity |
| Example: `10.0.1.10` | Internet-routable |

> ⚠️ **A public IP does NOT automatically make a VM accessible.** You still need:
> **NSG allowing the port + OS firewall + application listening.**

---

# 4. NIC ⭐

```text
VM → NIC → Private IP → Subnet → VNet
```

* The NIC provides the VM's network connectivity. It holds the IP configuration and connects the VM to a subnet.

> 🎤 **Answer:** *"The VM communicates through its network interface, which contains its IP configuration and connects it to a subnet."*

---

# 5. NSG ⭐⭐⭐

**NSG = Network Security Group** → controls whether traffic is **ALLOW or DENY**.

* Associated with: **Subnet OR NIC** (never the VNet).
* If NSGs exist on both, **both must allow** the traffic.
* A rule has: **source, destination, port, protocol, direction, priority, action**.

```text
Source: 10.0.1.0/24 → Destination: App subnet
Port: 8080  Protocol: TCP  Action: Allow  Priority: 100
```

### Priority ⭐

```text
100 → 110 → 200   (lower number = higher priority; first match wins)
```

> ⚠️ Custom rules are evaluated **before** Azure's default rules (priority 65000+).

### Stateful ⭐

> If allowed traffic establishes a connection, **return traffic is allowed automatically**. You don't need a separate reverse rule for the response.

---

# 6. NSG vs Route Table ⭐⭐⭐

| NSG | Route Table |
| --- | --- |
| Controls traffic | Decides traffic path |
| Allow / Deny | Next hop / destination |
| Security | Routing |
| Associated with subnet **or NIC** | Associated with **subnet** |
| Example: allow TCP 443 | Example: send traffic to a firewall |

> **NSG = Can traffic go? Route = Where does traffic go?**

---

# 7. Default NSG Rules ⭐

| Direction | Priority | Rule | Action |
| --- | ---: | --- | --- |
| Inbound | 65000 | AllowVnetInBound | Allow |
| Inbound | 65001 | AllowAzureLoadBalancerInBound | Allow |
| Inbound | 65500 | DenyAllInBound | **Deny** |
| Outbound | 65000 | AllowVnetOutBound | Allow |
| Outbound | 65001 | AllowInternetOutBound | Allow |
| Outbound | 65500 | DenyAllOutBound | **Deny** |

⚠️ Don't say *"there are no default rules."* There **are**, you can't delete them, but custom rules with a lower number override them.

---

# 8. Route Table & UDR ⭐⭐⭐

* **Route table** = determines the path traffic takes. Associated with a **subnet** (not a single VM).
* **UDR** = **User Defined Route**, a custom route you create.

```text
Destination: 0.0.0.0/0
Next hop:    Virtual appliance
Next hop IP: 10.0.10.4
```

```text
App VM → Route Table → UDR → Firewall → Internet
```

### Longest prefix match ⭐

```text
Routes: 10.0.0.0/16   10.0.1.0/24
Traffic to 10.0.1.20 → matches /24 (more specific)
```

> **More specific route wins.** If prefixes are equal: **UDR > BGP > System route**.

> If the next hop is an **NVA VM**, enable **IP forwarding** on its NIC and in the OS.

---

# 9. Effective Routes ⭐⭐⭐

When VM networking doesn't work:

**Portal:** VM → Networking → NIC → **Effective routes**

Check: **Destination → Next hop → Route source**

```bash
az network nic show-effective-route-table -g my-rg -n vm1-nic -o table
```

> 🎤 **Answer:** *"I check effective routes because they show the routes actually applied to the NIC, including system routes and custom routes."*

Same idea for security:

```bash
az network nic list-effective-nsg -g my-rg -n vm1-nic
```

---

# 10. VNet Peering ⭐⭐⭐

```text
VNet-A (10.0.0.0/16)  ↔ Peering ↔  VNet-B (10.1.0.0/16)
```

* Uses the **Azure backbone**.
* **Regional** and **global** peering (between supported regions).
* Address spaces **must not overlap**.
* Configured as **two links** (A→B and B→A).
* **Not transitive.**

```text
A ↔ B ↔ C      A ❌→ C automatically
```

> ⚠️ Peering is **not** a VPN. A VPN is an encrypted tunnel, mainly for on-premises connectivity.

---

# 11. Service Endpoint ⭐⭐

Gives **subnet-based** access to supported Azure services over the Azure backbone.

```text
App VM → App Subnet → Service Endpoint → Azure Storage
```

> **Key point:** Service Endpoint does **not** create a private IP for the service in your VNet. The service keeps its public endpoint model.

---

# 12. Private Endpoint ⭐⭐⭐

Creates a **private IP/NIC in your VNet** for a supported service through **Azure Private Link**.

```text
App VM → Private IP (10.0.2.20) → Private Endpoint → Storage
```

### Private Endpoint vs Service Endpoint

| Service Endpoint | Private Endpoint |
| --- | --- |
| Subnet-based | Private IP/NIC |
| Service keeps its public endpoint model | Private connectivity |
| No private IP for the service in the VNet | Private IP in the VNet |
| Simpler | More isolation/control |

---

# 13. Private DNS ⭐⭐⭐

Common interview follow-up. Applications use `storageaccount.blob.core.windows.net`.

```text
Application → DNS query → Private DNS → Private IP → Private Endpoint → Storage
```

For Blob: `privatelink.blob.core.windows.net`

**Checklist:**
1. Private DNS zone exists
2. Zone is **linked to the VNet**
3. **A record** points to the private endpoint IP
4. Custom/on-premises DNS forwards the zone correctly

```bash
nslookup storageaccount.blob.core.windows.net
# Inside the VNet you should see a private 10.x.x.x IP
```

> ⭐ **Private Endpoint without correct DNS causes name-resolution/connectivity problems.**

---

# 14. VM-to-VM Troubleshooting ⭐⭐⭐

Web VM → App VM:8080 failing? **Don't randomly modify NSGs.** Follow:

```text
1. Source IP
      ↓
2. Destination IP
      ↓
3. Effective Routes
      ↓
4. Effective Security Rules
      ↓
5. NSG priority
      ↓
6. OS firewall
      ↓
7. Port listening?
      ↓
8. Application healthy?
      ↓
9. Test connectivity
```

```bash
ip addr                          # IP of this VM
ip route                         # routes inside the OS
ss -lntp                         # is the app listening?
curl http://10.0.2.10:8080
nc -vz 10.0.2.10 8080
```

### Network Watcher shortcuts

```bash
az network watcher test-ip-flow -g my-rg --vm vm1 --direction Outbound --protocol TCP \
  --local 10.0.1.10:50000 --remote 10.0.2.10:8080

az network watcher show-next-hop -g my-rg --vm vm1 --source-ip 10.0.1.10 --dest-ip 10.0.2.10
```

---

# 15. 🔥 5 Troubleshooting Scenarios

| # | Scenario | Check in this order |
| --- | --- | --- |
| 1 | NSG allows 8080 but connection fails | Effective security rules → OS firewall → application |
| 2 | VM can't reach another network | NIC → effective routes → UDR → next hop |
| 3 | Port 8080 unreachable | `ss -lntp \| grep 8080`. If nothing is listening, NSG changes won't fix it |
| 4 | Private Endpoint exists, app can't connect | DNS resolution → Private DNS zone → VNet link → private IP → Private Endpoint |
| 5 | VM has a public IP but SSH fails | Public IP → NSG TCP/22 → NIC/subnet NSG → OS firewall → `sshd` service |

### Scenario flows

```text
S1: Effective Security Rules → OS Firewall → Application

S2: NIC → Effective Routes → UDR → Next Hop

S3: ss -lntp | grep 8080 → nothing listening? → fix the app/service

S4: DNS → Private DNS zone → VNet link → Private IP → Private Endpoint

S5: Public IP → NSG TCP/22 → NIC/Subnet → OS firewall → sshd
```

### Bonus scenario: new VM has no internet

```text
New VNets default to private subnets → add an explicit outbound method:
NAT Gateway, public IP, Standard LB outbound rule, or UDR to a firewall
```

---

# 16. ⭐ Most Asked Questions

**Q1. NSG vs Route Table?**
> NSG controls whether traffic is allowed or denied. Route table determines where the traffic goes.

**Q2. Can an NSG be attached directly to a VNet?**
> No. An NSG is associated with a subnet or NIC.

**Q3. Can a route table be attached directly to a VM?**
> No. A route table is associated with a subnet.

**Q4. What is UDR?**
> A User Defined Route is a custom route used to control traffic flow, for example sending traffic through a firewall or NVA.

**Q5. What happens if two subnet CIDRs overlap?**
> Azure doesn't allow overlapping subnet address ranges within the same VNet.

**Q6. Is VNet peering transitive?**
> No, basic VNet peering is not automatically transitive.

**Q7. Service Endpoint vs Private Endpoint?**
> Service Endpoint provides subnet-based access to supported Azure services. Private Endpoint provides a private IP in the VNet for the service through Private Link.

**Q8. Why Private DNS with Private Endpoint?**
> Applications use DNS names. Private DNS lets the service hostname resolve to the private endpoint IP.

**Q9. How do you troubleshoot VM connectivity?**
> I check IPs, effective routes, effective security rules, NSG priorities, OS firewall, the listening port, and finally the application.

**Q10. What is longest prefix match?**
> When several routes match a destination, the more specific route (longer prefix) is preferred.

---

# 17. 🧠 Final 30-Second Revision

```text
VNet → Subnets → NIC → Private IP
```

```text
NSG                      = ALLOW / DENY            (subnet or NIC, stateful, lower number wins)
Route Table              = WHERE traffic goes      (subnet)
UDR                      = CUSTOM route
Effective Routes         = ACTUAL routing
Effective Security Rules = ACTUAL NSG result
Peering                  = VNet ↔ VNet             (no overlap, not transitive)
Service Endpoint         = Subnet → Azure Service  (no private IP)
Private Endpoint         = Private IP → Azure Service
Private DNS              = Hostname → Private IP
```

```text
Azure subnet usable IPs = total − 5
```

### 🔥 One line to remember

> **NSG = Can I go? → Route = Where do I go? → UDR = Change my path → Peering = Connect VNets → Private Endpoint = Private IP to a service → DNS = Find that private IP.**