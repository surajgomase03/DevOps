# ⚖️ Azure Load Balancing — Detailed Interview + Practical Notes

> **One-liner:** **Load Balancer** = L4 (TCP/UDP), regional. **Application Gateway** = L7 (HTTP/HTTPS), regional, with WAF. **Front Door** = global L7 (HTTP/HTTPS proxy at the edge). **Traffic Manager** = global **DNS-based** routing (not a proxy).

For DevOps interviews, be clear on **which service to use, at which layer, and how traffic flows**.

```text
Azure Load Balancer → Layer 4  (regional)
Application Gateway → Layer 7  (regional)
Front Door          → Layer 7  (global, edge proxy)
Traffic Manager     → DNS      (global, no proxy)
```

---

## 📑 Contents

1. [Azure Load Balancer](#1-azure-load-balancer)
2. [Load Balancer Types, SKUs & Components](#2-load-balancer-types-skus--components)
3. [Health Probes (Load Balancer)](#3-health-probes-load-balancer)
4. [Layer 4 vs Layer 7](#4-layer-4-vs-layer-7)
5. [Application Gateway](#5-application-gateway)
6. [Application Gateway Components & Routing](#6-application-gateway-components--routing)
7. [TLS Termination, Health Probes, WAF](#7-tls-termination-health-probes-waf)
8. [Load Balancer vs Application Gateway](#8-load-balancer-vs-application-gateway)
9. [Azure Front Door](#9-azure-front-door)
10. [Traffic Manager](#10-traffic-manager)
11. [Which Service to Choose (Decision Guide)](#11-which-service-to-choose-decision-guide)
12. [Architectures: App Gateway + VM and AKS](#12-architectures-application-gateway--vm-and-aks)
13. [Practical Lab — Application Gateway](#13-practical-lab--application-gateway)
14. [Command Cheat Sheet](#14-command-cheat-sheet)
15. [Troubleshooting](#15-troubleshooting)
16. [Interview Scenarios](#16-interview-scenarios)
17. [Interview Questions](#17-interview-questions)
18. [Final Memory Table](#18-final-memory-table)

---

# 1. Azure Load Balancer

* A **Layer 4 (TCP/UDP)** load-balancing service that distributes incoming network traffic across backend resources.
* Works on **IP, port and protocol**.
* It does **not** inspect HTTP URL paths such as `/api` or `/login`.

```text
                     Internet
                        |
                   Public IP
                        |
                Azure Load Balancer
                        |
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           VM-1       VM-2       VM-3
```

### How it distributes traffic

* Default: **5-tuple hash** (source IP, source port, destination IP, destination port, protocol). Different connections from the same client can reach different VMs.
* Optional **session persistence** (source IP affinity, 2-tuple or 3-tuple) keeps a client on the same backend.

---

# 2. Load Balancer Types, SKUs & Components

## 2.1 Public vs Internal

**Public Load Balancer** (internet-facing)

```text
Internet → Public Load Balancer → Backend VMs
```

**Internal Load Balancer** (private frontend IP)

```text
Web/App tier → Internal Load Balancer → Backend VMs
```

Common combined design:

```text
Internet → Application Gateway → Internal Load Balancer → Application VMs
```

## 2.2 SKU

| Use | Note |
| --- | --- |
| **Standard SKU** | Use this. Zone-redundant, **secure by default** (closed to inbound traffic until an NSG allows it), SLA-backed, supports HA ports and outbound rules |
| Basic SKU | **Retired**. Don't use it for new designs |

> Also know: **Gateway Load Balancer** (chains NVAs/firewalls transparently) and **Cross-region (global) Load Balancer** (a global L4 tier in front of regional load balancers).

## 2.3 Components (know these for interviews)

| Component | What it is |
| --- | --- |
| **Frontend IP** | IP address clients connect to (public or private) |
| **Backend pool** | VMs / VMSS instances / IPs receiving traffic |
| **Health probe** | Checks whether backend instances are healthy |
| **Load-balancing rule** | Maps frontend IP:port → backend pool:port |
| **Inbound NAT rule** | Forwards a specific frontend port to a **specific** VM (for example `PublicIP:50001 → VM1:22`) |
| **Outbound rule** | Controls outbound (SNAT) connectivity for backend instances |

```text
Client → Frontend IP → Load-balancing rule → Backend pool (VM1, VM2, VM3)
                                ▲
                          Health probe
```

```text
Frontend: TCP 80   →   Backend: TCP 80
```

> Inbound NAT rules are useful for admin access, but **Azure Bastion** is generally preferable to exposing SSH/RDP on a public endpoint.

---

# 3. Health Probes (Load Balancer)

```text
Load Balancer
      | TCP 80
      ▼
    VM-1 ✓
    VM-2 ✓
    VM-3 ✗   ← removed from rotation until the probe succeeds again
```

* Probe types: **TCP**, **HTTP**, **HTTPS**.
* An unhealthy instance stops receiving **new** flows.
* Probes originate from the special platform IP **`168.63.129.16`**. Your NSG must allow the **`AzureLoadBalancer`** service tag (default rule `AllowAzureLoadBalancerInBound` does).

> 🎤 **Why do we need a health probe?** To determine whether backend instances are available to receive traffic.

---

# 4. Layer 4 vs Layer 7

**Layer 4 = Transport layer** (TCP/UDP).

```text
Client → TCP :443 → Load Balancer → VM
```

A Layer 4 load balancer does not decide based on `/api/users`, `/login` or `/images`. **Layer 7** services (Application Gateway, Front Door) read **HTTP/HTTPS** details, so they can route by **hostname and URL path**.

| | L4 | L7 |
| --- | --- | --- |
| Sees | IP, port, protocol | URL, host header, cookies, headers |
| Protocols | TCP, UDP | HTTP, HTTPS (and WebSocket/HTTP2) |
| Examples | Azure Load Balancer | Application Gateway, Front Door |

---

# 5. Application Gateway

* **Azure Application Gateway** is a managed **Layer 7 web traffic load balancer** for HTTP/HTTPS.
* It routes based on application-level information: **hostname, URL path, HTTP settings, backend health**.

```text
Internet → Application Gateway → Backend Pool (VM1, VM2, VM3)
```

### SKU note

* Use the **v2** SKUs (**Standard_v2 / WAF_v2**): autoscaling, zone redundancy, static VIP, better performance.
* The **v1** SKUs were scheduled for retirement on **28 April 2026**, so don't build new designs on v1. Confirm status in current Azure docs.

### Key capabilities

* Path-based and host-based (multi-site) routing
* TLS termination and end-to-end TLS
* HTTP → HTTPS redirect, URL rewrite, header rewrite
* Cookie-based session affinity, connection draining
* WebSocket and HTTP/2 support
* **WAF** (Web Application Firewall)
* Certificates from **Key Vault** (via managed identity)
* Autoscaling and zone redundancy (v2)

---

# 6. Application Gateway Components & Routing

## 6.1 Request flow

```text
Frontend IP
     ▼
Listener
     ▼
Routing Rule
     ▼
Backend Pool
     ▼
Backend (HTTP) Settings
     ▼
Health Probe
```

| Component | Purpose |
| --- | --- |
| **Frontend IP** | Public and/or private IP clients connect to |
| **Listener** | Accepts incoming requests (protocol, port, hostname, certificate) |
| **Routing rule** | Connects a listener to a backend pool and backend settings (basic or path-based) |
| **Backend pool** | Targets: VMs, VMSS, IPs, FQDNs, App Service, etc. |
| **Backend (HTTP) settings** | How the gateway talks to the backend: port, protocol, affinity, timeout, host header |
| **Health probe** | Checks backend health |

## 6.2 Listener

```text
Protocol: HTTPS   Port: 443   Hostname: app.example.com   Certificate: TLS cert
Client → HTTPS :443 → Listener
```

Listener types: **Basic** (one site) and **Multi-site** (host-name based, several sites on one gateway).

## 6.3 Backend HTTP settings

```text
Client HTTPS :443 → Application Gateway → HTTP :8080 → Backend VM
```

Things to understand: backend port and protocol, cookie-based affinity, connection draining, **request timeout**, **host header** behavior.

## 6.4 Path-based routing ⭐

```text
                 Application Gateway
                         |
             ┌───────────┴───────────┐
             ▼                       ▼
         /api/*                   /web/*
             ▼                       ▼
         API VMs                 Web VMs
```

## 6.5 Host-based routing

```text
api.example.com → API backend
web.example.com → Web backend
```

> Path-based = one hostname, different paths. Host-based = different hostnames. Both can be combined.

---

# 7. TLS Termination, Health Probes, WAF

## 7.1 TLS termination

```text
Client ── HTTPS ──► Application Gateway ── HTTP or HTTPS ──► Backend VM
```

Benefits: centralized certificate management, less TLS work on backends, easier certificate rotation, Layer 7 inspection and routing.

| Mode | Meaning |
| --- | --- |
| **TLS termination** | HTTPS to the gateway, HTTP to the backend |
| **End-to-end TLS** | HTTPS to the gateway **and** HTTPS to the backend (re-encrypt) |

## 7.2 Application Gateway health probe

```text
Application Gateway ── GET /health ──► VM-1 ✓   VM-2 ✓   VM-3 ✗
```

> ⚠️ **A VM that is *running* is not necessarily *healthy* for Application Gateway.**

```text
VM = Running ✓   Nginx = Running ✓   Application = Broken ✗   /health = 500 ✗
→ marked UNHEALTHY
```

Probe tips:

* Use a **custom probe** with a dedicated `/health` path rather than relying on the default.
* Probes come from the **Application Gateway subnet**, so backend NSGs must allow traffic from that subnet.
* With multi-site or App Service backends, set the **host header** correctly or the probe may fail.

## 7.3 WAF

**Web Application Firewall** protects web apps from common attacks (for example **SQL injection** and **cross-site scripting**).

```text
Internet → Application Gateway + WAF → Application
```

* Uses managed rule sets (OWASP-based) plus **custom rules** and bot protection.
* Modes: **Detection** (log only) and **Prevention** (block).
* Start in Detection, tune false positives, then move to Prevention.

> 🎤 **Application Gateway + WAF** is used when you need Layer 7 web traffic management plus web application protection.

---

# 8. Load Balancer vs Application Gateway

| Feature | Azure Load Balancer | Application Gateway |
| --- | --- | --- |
| Layer | **L4** | **L7** |
| Protocols | TCP / UDP (any port) | HTTP / HTTPS |
| URL path routing | ❌ | ✅ |
| Host-based routing | ❌ | ✅ |
| TLS termination | ❌ | ✅ |
| WAF | ❌ | ✅ (WAF SKU) |
| Cookie session affinity | ❌ (IP-based only) | ✅ |
| Health probes | ✅ | ✅ |
| Typical use | Network-level load balancing | Web application routing |

```text
Load Balancer       → TCP/UDP
Application Gateway → HTTP/HTTPS → URL/host routing → WAF
```

---

# 9. Azure Front Door

**Global application delivery service.** Think: *the global entry point for web applications.*

```text
                Users
          /       |       \
       India    Europe     USA
          \       |       /
             Front Door  (nearest edge)
                 |
        ┌────────┴────────┐
        ▼                 ▼
   Region A           Region B
   Backend            Backend
```

### Why Front Door?

App deployed in Central India, West Europe and East US: Front Door sends users to a suitable, **healthy** backend based on your routing configuration. It operates at the **application (L7)** layer, and it **proxies** HTTP/HTTPS traffic at Microsoft's edge.

### Concepts

| Term | Meaning |
| --- | --- |
| **Endpoint** | The Front Door hostname/entry point |
| **Origin / origin group** | Backend apps (regions) and their health probe/load-balancing settings |
| **Route** | Maps domains/paths to an origin group |
| **Rules engine** | Header/URL rewrite and redirect rules |

### Features

* Global HTTP/HTTPS routing with **health-based failover**
* Application acceleration (anycast edge network)
* TLS termination and custom domains with managed certificates
* **Caching/CDN** capabilities
* **WAF** integration
* Premium tier adds **Private Link** origins and more security features

> Use **Standard/Premium** tiers. Front Door (classic) is being retired.

> 🎤 *Azure Front Door is a global Layer 7 application delivery service that routes HTTP/HTTPS traffic to globally distributed backends.*

---

# 10. Traffic Manager

**DNS-based traffic routing.** It returns the DNS answer for the "best" endpoint, and the client then connects **directly** to that endpoint.

```text
User → DNS query → Traffic Manager → DNS response (selected endpoint) → User connects to the endpoint
```

> Traffic Manager does **not** sit in the data path and does **not** proxy HTTP traffic.

## 10.1 Routing methods

| Method | Behavior | Use |
| --- | --- | --- |
| **Priority** | Primary endpoint, fail over to secondary | Active/passive failover |
| **Weighted** | Distribute by weights (for example 80/20) | Gradual rollouts, A/B |
| **Performance** | Lowest network latency | Global users |
| **Geographic** | By user's geographic origin | Data residency / regional content |
| **MultiValue** | Returns multiple healthy endpoints | Clients that retry across IPs |
| **Subnet** | Maps client IP ranges to endpoints | Specific networks |

```text
Priority:   Primary → (if down) → Secondary
Weighted:   Region A = 80   Region B = 20
```

## 10.2 Traffic Manager vs Front Door

| Traffic Manager | Front Door |
| --- | --- |
| **DNS-based** | **Global Layer 7** service |
| Returns a DNS response | Proxies HTTP/HTTPS traffic |
| Doesn't carry application traffic | Carries application traffic |
| Works at DNS level (any protocol) | Works at HTTP/HTTPS level |
| **DNS TTL and client caching** affect failover time | Failover at the edge is faster |
| No caching, no WAF | Caching, WAF, TLS offload |

```text
Traffic Manager → DNS decides where you go
Front Door      → Front Door receives your HTTP/HTTPS traffic
```

---

# 11. Which Service to Choose (Decision Guide)

```text
Is the traffic HTTP/HTTPS?
   │
   ├── NO (TCP/UDP) ───────────────► Azure Load Balancer
   │                                  (regional) or Cross-region LB (global)
   │
   └── YES
        │
        ├── Single region?
        │      └── Application Gateway (+ WAF)
        │
        └── Multiple regions / global users?
               ├── Need proxy, caching, WAF, fast failover → Front Door
               │        (often Front Door → Application Gateway → backends)
               └── Only DNS-level failover/steering → Traffic Manager
```

| Requirement | Service |
| --- | --- |
| TCP/UDP load balancing, any port | **Load Balancer** |
| URL/host routing, TLS termination, WAF in one region | **Application Gateway** |
| Global HTTP/HTTPS, edge, caching, WAF | **Front Door** |
| DNS-based global failover or steering, non-HTTP too | **Traffic Manager** |

### Comparison table

| | Load Balancer | Application Gateway | Front Door | Traffic Manager |
| --- | --- | --- | --- | --- |
| Layer | L4 | L7 | L7 | DNS |
| Scope | Regional (or cross-region tier) | Regional | **Global** | **Global** |
| Protocols | TCP/UDP | HTTP/HTTPS | HTTP/HTTPS | Any (DNS) |
| In the data path? | Yes | Yes | Yes | **No** |
| WAF | ❌ | ✅ | ✅ | ❌ |
| TLS termination | ❌ | ✅ | ✅ | ❌ |
| Path/host routing | ❌ | ✅ | ✅ | ❌ |

---

# 12. Architectures: Application Gateway + VM and AKS

## 12.1 Application Gateway + VMs

```text
                         Internet
                            |
                  Public IP of App Gateway
                            |
                 Application Gateway  :443
                            |
                     Listener / WAF
                            |
                     Routing Rule
                            |
                     Backend Pool
                    ┌───────┴───────┐
                    ▼               ▼
                  VM-1             VM-2
              10.0.2.4          10.0.2.5
                    └───────┬───────┘
                       App Subnet
```

> ⭐ Application Gateway must be in a **dedicated subnet**.

```text
VNet 10.0.0.0/16
│
├── appgw-subnet   10.0.10.0/24   → Application Gateway only
├── web-subnet     10.0.1.0/24    → Web VMs
├── app-subnet     10.0.2.0/24    → App VMs
└── db-subnet      10.0.3.0/24    → Database
```

Subnet and NSG notes for **v2**:

* The subnet can contain **only** Application Gateways (no VMs or other resources).
* A `/24` is a common size (supports autoscaling).
* The gateway subnet's NSG must allow **inbound**: client traffic to your listener ports, **GatewayManager on 65200–65535**, and the `AzureLoadBalancer` tag. Blocking these breaks the gateway.
* If you add a UDR on the gateway subnet, `0.0.0.0/0` must go to **Internet**. Routing it to a firewall isn't supported for v2 without special setups.

## 12.2 Application Gateway + AKS

```text
              Internet
                 |
         Application Gateway
                 |
            AKS Cluster
                 |
          Ingress / Gateway
           ┌─────┴─────┐
           ▼           ▼
        Service     Service
           ▼           ▼
          Pods        Pods
```

> **Application Gateway = L7 entry point. AKS = application workload platform.**

AKS ingress options to know:

| Option | Note |
| --- | --- |
| **Application Gateway for Containers** | Azure-hosted L7 gateway built for Kubernetes. Supports **Ingress API and Gateway API** |
| **AGIC** (Application Gateway Ingress Controller) | Older model that programs an Application Gateway from Ingress resources |
| **Application routing add-on (managed NGINX)** | In-cluster NGINX. Microsoft patches critical security issues for it through **November 2026**, since the community ingress-nginx project was retired. A Gateway API mode is available (preview at the time of the announcement) |
| **Istio ingress gateway** | With the Istio service mesh add-on |

> For new AKS designs, plan around **Gateway API** (Application Gateway for Containers or the app routing Gateway API mode) rather than NGINX Ingress.

## 12.3 Typical production chain

```text
User
 ↓
Azure Front Door   (global, WAF, caching)       ← optional
 ↓
Application Gateway (regional L7, WAF)
 ↓
Backend pool: VM / VMSS / AKS
 ↓
Service → App
```

---

# 13. Practical Lab — Application Gateway

> ⚠️ **Cost:** Application Gateway v2 bills hourly while it exists. **Delete the resource group when finished.**

## Step 1 — Add a dedicated subnet

**VNet → Subnets → Add subnet**

```text
Subnet name:    appgw-subnet
Address range:  10.0.10.0/24
```

VNet `10.0.0.0/16` now has `web-subnet 10.0.1.0/24`, `app-subnet 10.0.2.0/24`, `db-subnet 10.0.3.0/24`, `appgw-subnet 10.0.10.0/24`.

## Step 2 — Create two web VMs

```text
vm-web-01, vm-web-02   → both in web-subnet
```

Install Nginx on each:

```bash
sudo apt update
sudo apt install nginx -y
```

VM1:

```bash
echo "Hello from VM1" | sudo tee /var/www/html/index.html
```

VM2:

```bash
echo "Hello from VM2" | sudo tee /var/www/html/index.html
curl localhost
```

> **Tip:** newly created VNets use private subnets by default, so `apt` needs outbound access. Use a temporary public IP, a NAT Gateway, or Azure Bastion + NAT, then remove the public IPs afterwards.

## Step 3 — Create the Application Gateway

**Application Gateways → Create**

```text
Name:    appgw-lab
Region:  Central India
Tier:    Standard V2 (or WAF V2 to try WAF)
Autoscaling: enabled with a small min/max
```

Frontend: **Public** → create a new **Standard, static** public IP.

## Step 4 — Select the Application Gateway subnet

```text
VNet:    vnet-lab
Subnet:  appgw-subnet
```

> Don't select your VM subnet.

## Step 5 — Backend pool

```text
Name: web-backend   →   vm-web-01, vm-web-02
```

```text
Application Gateway → web-backend → VM1, VM2
```

## Step 6 — Listener

```text
Protocol: HTTP    Port: 80    Frontend: Public IP
```

(Production: HTTPS 443 + TLS certificate.)

## Step 7 — Routing rule and backend settings

```text
Rule:      web-rule
Listener:  HTTP :80
Backend:   web-backend
Backend settings: Protocol HTTP, Port 80
```

## Step 8 — Test

```text
http://<application-gateway-public-ip>
```

You should see `Hello from VM1` or `Hello from VM2`. Repeat to observe distribution:

```bash
for i in {1..10}; do curl -s http://<appgw-public-ip>; done
```

## Step 9 — Break the backend

```bash
# on VM1
sudo systemctl stop nginx
```

Wait for the probe to mark VM1 unhealthy (**Application Gateway → Monitoring → Backend health**), then test again. Traffic should go only to VM2.

> This demonstrates **health probe + backend pool + Layer 7 load balancing**.

## Step 10 — Path-based routing

Create two backend pools and a path-based rule:

```text
API Backend (API VM1, API VM2)        Web Backend (Web VM1, Web VM2)

/api/*  → API Backend
/web/*  → Web Backend       (default → Web Backend)
```

```text
                Application Gateway
                       |
          ┌────────────┴────────────┐
          ▼                         ▼
       /api/*                    /web/*
          ▼                         ▼
     API Backend               Web Backend
```

**Portal:** Rules → edit/create rule → **Backend targets** → Target type: Backend pool → **Add multiple targets to create a path-based rule** → add `/api/*` and `/web/*` paths. Create a custom HTTP setting/probe per backend if needed.

## Step 11 — Cleanup

```bash
az group delete --name rg-vnet-lab --yes --no-wait
```

---

# 14. Command Cheat Sheet

> Verify flags with `az <command> --help`, as Azure CLI options change over time.

## 14.1 Standard public Load Balancer

```bash
az network public-ip create -g rg-lb -n lb-pip --sku Standard

az network lb create -g rg-lb -n lb-web --sku Standard \
  --public-ip-address lb-pip \
  --frontend-ip-name fe-web --backend-pool-name be-web

az network lb probe create -g rg-lb --lb-name lb-web -n probe-http \
  --protocol Http --port 80 --path /

az network lb rule create -g rg-lb --lb-name lb-web -n rule-http \
  --protocol Tcp --frontend-port 80 --backend-port 80 \
  --frontend-ip-name fe-web --backend-pool-name be-web --probe-name probe-http

# Add a VM NIC to the backend pool
az network nic ip-config address-pool add -g rg-lb --nic-name vm1-nic \
  --ip-config-name ipconfig1 --lb-name lb-web --address-pool be-web

# Inbound NAT rule (PublicIP:50001 → VM:22)
az network lb inbound-nat-rule create -g rg-lb --lb-name lb-web -n ssh-vm1 \
  --protocol Tcp --frontend-port 50001 --backend-port 22 --frontend-ip-name fe-web
```

> A Standard LB is closed to inbound traffic until an **NSG** allows the port.

## 14.2 Application Gateway (v2)

```bash
az network public-ip create -g rg-vnet-lab -n appgw-pip --sku Standard --allocation-method Static

az network application-gateway create -g rg-vnet-lab -n appgw-lab \
  --sku Standard_v2 --capacity 2 \
  --vnet-name vnet-lab --subnet appgw-subnet \
  --public-ip-address appgw-pip \
  --frontend-port 80 \
  --http-settings-port 80 --http-settings-protocol Http \
  --priority 100 \
  --servers 10.0.1.4 10.0.1.5

# Backend health: the first place to look
az network application-gateway show-backend-health -g rg-vnet-lab -n appgw-lab

az network application-gateway list -o table
az network application-gateway show -g rg-vnet-lab -n appgw-lab
```

### Add a path-based rule (sketch)

```bash
# Second backend pool
az network application-gateway address-pool create -g rg-vnet-lab --gateway-name appgw-lab \
  -n api-backend --servers 10.0.2.4 10.0.2.5

# URL path map
az network application-gateway url-path-map create -g rg-vnet-lab --gateway-name appgw-lab \
  -n pathmap --rule-name api-rule --paths '/api/*' \
  --address-pool api-backend --http-settings appGatewayBackendHttpSettings \
  --default-address-pool appGatewayBackendPool --default-http-settings appGatewayBackendHttpSettings

# Switch the rule to path-based
az network application-gateway rule update -g rg-vnet-lab --gateway-name appgw-lab \
  -n rule1 --rule-type PathBasedRouting --url-path-map pathmap
```

### Custom health probe

```bash
az network application-gateway probe create -g rg-vnet-lab --gateway-name appgw-lab \
  -n probe-health --protocol Http --path /health --interval 30 --timeout 30 \
  --threshold 3 --host-name-from-http-settings true
```

## 14.3 Front Door (Standard/Premium) skeleton

```bash
az afd profile create -g rg-fd --profile-name fd-prof --sku Standard_AzureFrontDoor

az afd endpoint create -g rg-fd --profile-name fd-prof --endpoint-name myapp --enabled-state Enabled

az afd origin-group create -g rg-fd --profile-name fd-prof --origin-group-name og1 \
  --probe-request-type GET --probe-protocol Https --probe-path / --probe-interval-in-seconds 30 \
  --sample-size 4 --successful-samples-required 3 --additional-latency-in-milliseconds 50

az afd origin create -g rg-fd --profile-name fd-prof --origin-group-name og1 --origin-name o1 \
  --host-name app1.azurewebsites.net --origin-host-header app1.azurewebsites.net \
  --priority 1 --weight 1000 --enabled-state Enabled --https-port 443

az afd route create -g rg-fd --profile-name fd-prof --endpoint-name myapp --route-name r1 \
  --origin-group og1 --supported-protocols Https --link-to-default-domain Enabled \
  --forwarding-protocol HttpsOnly
```

## 14.4 Traffic Manager

```bash
az network traffic-manager profile create -g rg-tm -n tm-prof \
  --routing-method Priority --unique-dns-name <unique-name>

az network traffic-manager endpoint create -g rg-tm --profile-name tm-prof -n primary \
  --type externalEndpoints --target app-india.example.com --priority 1

az network traffic-manager endpoint create -g rg-tm --profile-name tm-prof -n secondary \
  --type externalEndpoints --target app-europe.example.com --priority 2

nslookup <unique-name>.trafficmanager.net     # which endpoint is returned?
```

## 14.5 Testing from a client

```bash
curl -I http://<public-ip>
curl -v https://app.example.com
curl -H "Host: app.example.com" http://<appgw-public-ip>/api/health
for i in {1..10}; do curl -s http://<ip>; done      # watch distribution
```

---

# 15. Troubleshooting

## 15.1 Application Gateway: nothing works

```text
Internet → Application Gateway → VM
```

```text
1. Frontend      → Public IP, listener, port correct?
        ↓
2. Routing rule  → listener attached? correct backend pool and backend settings?
        ↓
3. Backend health → Application Gateway → Backend health (want: Healthy)
        ↓ (Unhealthy?)
4. NSG           → does the VM subnet/NIC NSG allow the backend port from appgw-subnet?
        ↓
5. Application   → sudo systemctl status nginx
        ↓
6. Port          → ss -lntp
        ↓
7. Local test    → curl localhost
        ↓
8. Network test  → curl http://<backend-private-ip> from a VM in the VNet
```

## 15.2 Symptom → likely cause

| Symptom | Likely cause |
| --- | --- |
| **502 Bad Gateway** | All backends unhealthy/unreachable, wrong backend port, NSG/UDR blocking, backend TLS certificate problem |
| **503** | No healthy backend, or gateway still starting/updating |
| **504 Gateway Timeout** | Backend too slow, **request timeout** in backend settings too low |
| Backend health "Unknown/Unhealthy" | Probe path returns non-200, wrong probe host header, NSG blocks the gateway subnet |
| Gateway subnet creation fails | Subnet not empty or not dedicated |
| Gateway unhealthy/stuck after NSG change | NSG blocks **GatewayManager 65200–65535** or `AzureLoadBalancer` |
| HTTPS listener fails | Certificate problem, wrong hostname |
| Always the same VM answers | Cookie-based affinity enabled, or single healthy backend |
| WAF blocks a valid request | Rule false positive. Check WAF logs, tune or add exclusions |

## 15.3 Load Balancer checklist

| Problem | Check |
| --- | --- |
| Can't reach frontend | NSG allows the port (Standard LB is closed by default), correct rule and probe |
| All backends "down" | Probe port/path wrong, app not listening, NSG blocks `AzureLoadBalancer` (`168.63.129.16`) |
| Backend can't reach a service on the same LB frontend | **Hairpin** limitation: a backend VM can't reach its own LB frontend through the LB |
| No outbound internet from backends | Standard LB needs an **outbound rule**, NAT Gateway or public IP |
| Uneven distribution | Session persistence setting, long-lived connections |

## 15.4 Traffic Manager / Front Door

| Problem | Check |
| --- | --- |
| Failover slow (Traffic Manager) | **DNS TTL** and client/resolver caching |
| Endpoint shows Degraded | TM health probe path/port/protocol, endpoint reachable? |
| Front Door 503/504 | Origin unhealthy, origin host header wrong, origin not allowing Front Door |
| Origin reachable directly (bypassing Front Door) | Restrict origin to the **`AzureFrontDoor.Backend`** service tag and validate the `X-Azure-FDID` header |

---

# 16. Interview Scenarios

| # | Interviewer asks | Think | Answer |
| --- | --- | --- | --- |
| 1 | Web app on 3 VMs over HTTPS, want URL routing + WAF | HTTPS + L7 + WAF | **Application Gateway (WAF)** |
| 2 | Load balance UDP traffic | UDP = L4 | **Azure Load Balancer** |
| 3 | App in India and Europe, global HTTP routing | Global L7 | **Front Door** |
| 4 | Only DNS-based global failover | DNS | **Traffic Manager** |
| 5 | Internal tier-to-tier TCP load balancing | Private L4 | **Internal Load Balancer** |
| 6 | Need global HTTP routing and regional WAF in each region | Both | **Front Door → Application Gateway** |
| 7 | Gateway shows backend unhealthy though the VM is running | Probe vs app | Check probe path/host header, NSG from gateway subnet, app health |
| 8 | Users get 502 after deployment | Backend problem | Check backend health, backend port, app, certificate |

---

# 17. Interview Questions

**Q1. What is Azure Load Balancer?**
> A Layer 4 (TCP/UDP) load balancer that distributes traffic across backend resources using IP, port and protocol.

**Q2. Public vs Internal Load Balancer?**
> Public has a public frontend for internet traffic. Internal has a private frontend IP for traffic inside the VNet or from on-premises.

**Q3. Components of a Load Balancer?**
> Frontend IP, backend pool, health probe, load-balancing rule, inbound NAT rule, outbound rule.

**Q4. Why do we need a health probe?**
> To detect which backend instances are healthy so traffic goes only to them.

**Q5. What does Layer 4 mean?**
> Transport layer (TCP/UDP). It routes on IP/port/protocol, not on URL or headers.

**Q6. What is Application Gateway?**
> A managed Layer 7 load balancer for HTTP/HTTPS with host/path routing, TLS termination and optional WAF.

**Q7. Path-based vs host-based routing?**
> Path-based routes by URL path (`/api`, `/web`) on one hostname. Host-based routes by hostname (`api.example.com`, `web.example.com`).

**Q8. Application Gateway components?**
> Frontend IP → listener → routing rule → backend pool → backend (HTTP) settings → health probe.

**Q9. What is TLS termination?**
> The gateway decrypts HTTPS and forwards HTTP (or re-encrypts for end-to-end TLS), centralizing certificates and offloading TLS from backends.

**Q10. What is WAF?**
> A web application firewall that blocks common attacks such as SQL injection and cross-site scripting. It runs in Detection or Prevention mode.

**Q11. Load Balancer vs Application Gateway?**
> Load Balancer is L4 for TCP/UDP. Application Gateway is L7 for HTTP/HTTPS with URL/host routing, TLS termination and WAF.

**Q12. Why must Application Gateway have a dedicated subnet?**
> The gateway deploys instances into the subnet and manages them, so the subnet is reserved for gateways only.

**Q13. A VM is running but the gateway marks it unhealthy. Why?**
> The probe checks the application, not just the VM: wrong path/port/host header, an app returning non-200, or an NSG blocking the gateway subnet.

**Q14. What is Front Door?**
> A global Layer 7 service that proxies HTTP/HTTPS at the Microsoft edge with health-based routing, caching, TLS offload and WAF.

**Q15. What is Traffic Manager?**
> A DNS-based traffic router that returns the best endpoint for a DNS query. It doesn't carry the traffic.

**Q16. Traffic Manager vs Front Door?**
> Traffic Manager steers DNS and clients connect directly, so failover depends on DNS TTL. Front Door proxies traffic at the edge and fails over faster, with WAF and caching.

**Q17. Application Gateway vs Front Door?**
> Application Gateway is regional and VNet-integrated. Front Door is global and edge-based. They're often combined: Front Door → Application Gateway → backends.

**Q18. How do you expose AKS apps through Application Gateway?**
> Use Application Gateway for Containers (Ingress/Gateway API) or AGIC, so the gateway is the L7 entry point and AKS hosts the workloads.

**Q19. How do you protect the origin from bypassing Front Door?**
> Allow only the `AzureFrontDoor.Backend` service tag at the origin and validate the `X-Azure-FDID` header.

**Q20. Which SKU of Load Balancer should you use?**
> Standard. It's zone-redundant and secure by default. Basic is retired.

---

# 18. Final Memory Table

| Service | Remember |
| --- | --- |
| **Azure Load Balancer** | L4 TCP/UDP, regional |
| **Application Gateway** | L7 HTTP/HTTPS, regional, path/host routing |
| **Application Gateway WAF** | Web application protection |
| **Front Door** | Global L7 HTTP/HTTPS, edge proxy |
| **Traffic Manager** | DNS-based routing (not a proxy) |

```text
                    INTERNET
                       ↓
                Azure Front Door          (optional, global)
                       ↓
              Application Gateway         (L7 / WAF, regional)
                       ↓
                 Backend Pool
                 /           \
                ↓             ↓
          VM / VMSS          AKS
                ↓             ↓
            Service        Service
                ↓             ↓
               App           Pods
```

### ⭐ The single most important sentence

> **Azure Load Balancer operates at Layer 4 for TCP/UDP, Application Gateway operates at Layer 7 for HTTP/HTTPS and supports path-based routing and WAF, Front Door provides global HTTP/HTTPS application delivery at the edge, and Traffic Manager performs DNS-based endpoint routing without carrying the traffic.**
