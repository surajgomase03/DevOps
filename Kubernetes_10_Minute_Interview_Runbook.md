# Kubernetes — 10-Minute Interview Runbook

> Fast revision based on the provided Kubernetes notes. Focus: architecture, Pods, workloads, networking, security, scaling, and troubleshooting.

## 1. Kubernetes in 30 Seconds

**What:** Kubernetes is a container orchestration platform that automates deployment, scaling, self-healing, networking, storage, and configuration.

**How:**
```text
Desired State (YAML)
        ↓
API Server
        ↓
Controllers reconcile
        ↓
Worker Nodes
        ↓
Pods → Containers
```

**Interview answer:** Kubernetes is a declarative container orchestration platform used to deploy, scale, self-heal, network, and manage containerized workloads.

---

## 2. Cluster Architecture 🔴

```text
KUBERNETES CLUSTER
│
├── CONTROL PLANE
│   ├── kube-apiserver → API / entry point
│   ├── etcd → cluster state
│   ├── kube-scheduler → selects node
│   ├── controller-manager → desired-state reconciliation
│   └── cloud-controller-manager → cloud integration
│
└── WORKER NODE
    ├── kubelet → manages Pods
    ├── kube-proxy → Service networking
    ├── containerd / CRI-O → runs containers
    └── Pods
```

**Key memory:**
```text
API Server → Entry
etcd       → State
Scheduler  → Node
Controller → Desired State
kubelet    → Pod
Runtime    → Container
kube-proxy → Service traffic
```

**Typical request flow:**
```text
kubectl → API Server :6443
        → Auth/RBAC/Admission
        → etcd
        → Controller/Scheduler
        → kubelet
        → Runtime
        → Container
```

---

## 3. Pod 🔴

**Pod = smallest deployable unit.**

```text
Pod
├── Application Container
└── Sidecar (optional)
```

Containers in the same Pod share:
- Network namespace
- Pod IP
- `localhost`
- Volumes when configured

**Pod lifecycle:** `Pending → Running → Succeeded/Failed` (also `Unknown`).

**Init vs Sidecar:**
```text
Init:    runs first → completes → main container
Sidecar: runs alongside main container
```

**Commands:**
```bash
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs <pod> --previous
kubectl exec -it <pod> -- /bin/bash
```

---

## 4. ReplicaSet 🔴

> ReplicaSet maintains the desired number of matching Pods.

```text
Desired = 3
Actual  = 2
    ↓
ReplicaSet creates Pod
    ↓
Actual = 3
```

```text
Deployment
    ↓
ReplicaSet
    ↓
Pods
    ↓
Containers
```

Important:
- Selector identifies managed Pods.
- Template labels must match selector.
- Usually manage ReplicaSets through Deployments.

---

## 5. Deployment 🔴

> Deployment manages stateless workload lifecycle through ReplicaSets and provides rolling updates, rollback, scaling, and revision history.

```text
Deployment
├── ReplicaSet v1 → old Pods
└── ReplicaSet v2 → new Pods
```

Example:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

- `maxSurge` = extra Pods allowed.
- `maxUnavailable` = Pods allowed to be unavailable.
- Zero downtime also depends on a correct **readinessProbe**.

**Strategies:**
- RollingUpdate → gradual replacement
- Recreate → delete old, then create new; downtime
- Blue-Green → switch Service between two versions
- Canary → small percentage gets new version

**Commands:**
```bash
kubectl set image deploy/<name> <container>=<image>
kubectl rollout status deploy/<name>
kubectl rollout history deploy/<name>
kubectl rollout undo deploy/<name>
kubectl rollout undo deploy/<name> --to-revision=2
kubectl rollout pause deploy/<name>
kubectl rollout resume deploy/<name>
kubectl rollout restart deploy/<name>
```

**Rollback:** reactivates an existing old ReplicaSet.

---

## 6. Deployment vs StatefulSet 🔴

| Deployment | StatefulSet |
|---|---|
| Mainly stateless | Stateful workloads |
| Pods interchangeable | Stable Pod identity |
| Web/API | Databases |
| Random/generated names | Stable ordered names |
| Example `api-x7abc` | `mysql-0`, `mysql-1` |

---

## 7. Service 🔴

**Problem:** Pod IPs change.

**Solution:** Service gives stable virtual IP + DNS and routes to matching Pods.

```text
Service
  ↓
Label Selector
  ↓
Pod 1 / Pod 2 / Pod 3
```

| Type | Use |
|---|---|
| ClusterIP | Internal access |
| NodePort | Node IP + high port |
| LoadBalancer | Cloud load balancer |
| ExternalName | External DNS CNAME |
| Headless | Direct Pod discovery |

**Flow:**
```text
Client
 ↓
CoreDNS
 ↓
ClusterIP
 ↓
kube-proxy
 ↓
EndpointSlice
 ↓
Pod IP
```

**Troubleshooting:**
```text
Service unreachable
      ↓
EndpointSlices empty?
      ↓ YES
Selector mismatch OR Pods not Ready
```

Commands:
```bash
kubectl get svc
kubectl describe svc <svc>
kubectl get endpointslices
kubectl get pods --show-labels
```

---

## 8. Kubernetes Networking 🔴

### CNI
Provides Pod networking and Pod IPs.

Examples in the notes:
- Cilium
- Calico
- Amazon VPC CNI

### kube-proxy
Implements Service traffic routing toward backend Pods.

### CoreDNS
Provides Kubernetes service discovery / DNS.

**Golden rule:**
```text
CNI        → Pod networking
CoreDNS    → Name → Service IP
kube-proxy → Service IP → Pod
```

---

## 9. Ingress 🔴

> Ingress provides Layer 7 HTTP/HTTPS routing into Services.

```text
Internet
  ↓
Load Balancer
  ↓
Ingress Controller
  ↓
Host/Path rule
  ↓
Service
  ↓
Pods
```

Example:
```text
example.com/api     → api-service
example.com/payment → payment-service
```

**Service vs Ingress:** Service gives stable access to Pods; Ingress provides HTTP/HTTPS host/path routing.

---

## 10. ConfigMap vs Secret 🔴

**ConfigMap:** non-sensitive configuration.

**Secret:** sensitive values such as passwords, tokens, TLS material.

**Important:** Base64 is **encoding, not encryption**.

Secure approach:
```text
Application
   ↓
Secret management
   ↓
Kubernetes / external secret
```

Restrict Secret access with RBAC.

---

## 11. Probes 🔴

| Probe | Purpose | Failure effect |
|---|---|---|
| Readiness | Can it receive traffic? | Removed from Service endpoints |
| Liveness | Is it alive? | Container may be restarted |
| Startup | Has slow app finished starting? | Protects slow startup from liveness |

**Interview trap:** readiness failure normally does not restart the container.

---

## 12. Scheduling 🔴

```text
Unscheduled Pod
      ↓
Filter eligible nodes
      ↓
Score
      ↓
Bind to node
```

### nodeSelector
Hard label match:
```yaml
nodeSelector:
  disk: ssd
```

### Node Affinity
- `required...` = hard
- `preferred...` = soft

### Pod Anti-Affinity
Spreads Pods apart, useful for HA.

### Taints/Tolerations
```text
Node taint → repels Pods
Pod toleration → allows Pod onto node
```
A toleration allows placement; it does not guarantee placement.

### Topology Spread
Distributes replicas across nodes/zones.

---

## 13. Requests, Limits & QoS 🔴

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

- **Requests** → scheduling/resource reservation
- **Limits** → maximum allowed resource

| QoS | Basic idea |
|---|---|
| Guaranteed | Requests == limits for all containers |
| Burstable | Partial requests/limits |
| BestEffort | No requests/limits |

---

## 14. HPA / VPA / KEDA 🔴

### HPA
Changes **number of Pod replicas**.

```text
Metrics → HPA → Deployment → ReplicaSet → Pods
```

CPU/memory HPA needs a metrics source such as metrics-server and appropriate resource requests.

### VPA
Adjusts Pod resource requests/limits.

### KEDA
Event-driven autoscaling; useful for queue/event workloads and scale-to-zero scenarios.

**Trap:** HPA and VPA can conflict when both try to control the same CPU resource.

---

## 15. RBAC & Pod Security 🔴

RBAC answers:
```text
WHO
 ↓
CAN DO WHAT
 ↓
ON WHICH RESOURCE
 ↓
WHERE
```

Objects:
- Role
- RoleBinding
- ClusterRole
- ClusterRoleBinding
- ServiceAccount

Secure Pod checklist:
```text
Non-root
Least privilege
Drop capabilities
No privilege escalation
Read-only root filesystem where possible
seccomp
NetworkPolicy
Resource requests/limits
Restricted ServiceAccount
Secure Secrets
```

Example:
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
```

```yaml
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop: [ALL]
```

If Kubernetes API access is not required:
```yaml
automountServiceAccountToken: false
```

---

## 16. NetworkPolicy 🔴

> Controls which workloads can communicate.

```text
Frontend ──ALLOW──> Backend ──ALLOW──> Database
Frontend ──DENY──X──> Database
```

**Trap:** Namespace is logical isolation; NetworkPolicy controls network traffic. The CNI must support/enforce NetworkPolicy.

---

## 17. Storage 🟡

```text
Pod
 ↓
PVC
 ↓
PV
 ↓
Storage backend
```

- PV = storage resource
- PVC = storage request
- StorageClass = dynamic provisioning definition

Common access modes:
- RWO
- ROX
- RWX

Stateful workloads often combine StatefulSet + persistent storage.

---

## 18. Monitoring & Logging 🟡

Typical stack:
```text
Prometheus → Metrics
Grafana → Dashboards
Alertmanager → Alerts
```

Logs:
```text
Application
 ↓
stdout/stderr
 ↓
Log collector
 ↓
Central logging
```

Tools mentioned in the notes include Fluent Bit, Elasticsearch/Kibana, Jaeger and AWS X-Ray.

---

## 19. Production HA 🔴

```text
              Service
             /   |              Pod  Pod  Pod
           AZ-A AZ-B AZ-C
```

Use:
- Multiple replicas
- Anti-affinity / topology spread
- Readiness probes
- PodDisruptionBudget
- Requests/limits
- NetworkPolicy
- RBAC
- Backups
- Controlled upgrades

**PDB:** protects availability during voluntary disruptions such as drain/maintenance.

---

## 20. MASTER TROUBLESHOOTING 🔴

### Pod
```text
Problem
 ↓
kubectl get pods
 ↓
kubectl describe pod <name>
 ↓
Events
 ↓
kubectl logs <name>
 ↓
kubectl logs <name> --previous
 ↓
kubectl top pod
```

| Status | First check |
|---|---|
| Pending | Scheduling/resources/taints/PVC |
| CrashLoopBackOff | `logs --previous` |
| ImagePullBackOff | Image/tag/registry auth/network |
| OOMKilled | Memory usage/limit |
| ContainerCreating | Image/volume/CNI |
| Evicted | Node memory/disk pressure |

### Service
```text
DNS?
 ↓
EndpointSlices?
 ↓
Selector matches labels?
 ↓
Pods Ready?
 ↓
Pod IP reachable?
 ↓
Service IP reachable?
 ↓
kube-proxy / NetworkPolicy
```

Useful:
```bash
kubectl get events --sort-by=lastTimestamp
kubectl top pods
kubectl top nodes
kubectl get endpointslices
```

### Node
```text
Node NotReady
 ↓
kubectl describe node <node>
 ↓
Conditions/events
 ↓
kubelet
 ↓
container runtime
 ↓
CNI/network
 ↓
disk/memory pressure
```

Maintenance:
```bash
kubectl cordon <node>
kubectl drain <node>
kubectl uncordon <node>
```

---

## 21. Production Incident Answer 🔥

**Question: How do you handle a Kubernetes production outage?**

> First I assess the impact and check workload health. I use `kubectl get pods` for the overview, `kubectl describe pod` and Events for scheduling/runtime issues, and `kubectl logs --previous` for crash-related failures. I check resource pressure with `kubectl top`, then verify Service EndpointSlices, DNS and NetworkPolicy if traffic is affected. If a recent deployment caused the issue, I restore service quickly with a controlled `kubectl rollout undo`, then investigate the root cause, validate the fix and monitor the rollout.

---

## 22. Top Interview Q → A 🔥

**Q1. What is Kubernetes?**  
> Container orchestration platform for deployment, scaling, networking and self-healing.

**Q2. What is a Pod?**  
> Smallest deployable unit containing one or more containers.

**Q3. Who schedules Pods?**  
> kube-scheduler.

**Q4. Who starts containers?**  
> kubelet through the container runtime.

**Q5. What is etcd?**  
> Distributed key-value store for Kubernetes cluster state.

**Q6. What is kube-apiserver?**  
> Central API entry point handling authentication, authorization, admission and API requests.

**Q7. ReplicaSet vs Deployment?**  
> ReplicaSet maintains Pod count; Deployment manages ReplicaSets and provides rollout/rollback/version management.

**Q8. Why Service?**  
> Pod IPs are dynamic; Service provides stable IP/DNS and routes to matching Pods.

**Q9. CNI vs kube-proxy?**  
> CNI provides Pod networking; kube-proxy implements Service routing.

**Q10. CoreDNS?**  
> Kubernetes service discovery/DNS.

**Q11. Readiness vs Liveness?**  
> Readiness controls traffic eligibility; liveness determines whether the container should be restarted.

**Q12. CrashLoopBackOff?**  
> Container repeatedly fails and Kubernetes applies restart backoff.

**Q13. First command for CrashLoopBackOff?**
```bash
kubectl logs <pod> --previous
```

**Q14. What is OOMKilled?**  
> Container exceeded its memory limit and was killed.

**Q15. What is HPA?**  
> Autoscaler that changes Pod replica count based on metrics.

**Q16. What is RBAC?**  
> Controls who can perform which actions on which resources.

**Q17. What is NetworkPolicy?**  
> Controls allowed network communication between workloads.

**Q18. Deployment vs StatefulSet?**  
> Deployment is mainly for stateless interchangeable Pods; StatefulSet provides stable identity for stateful workloads.

---

## 23. Interview Traps 🔥

| Never say | Correct |
|---|---|
| kubectl = kubelet | kubectl = CLI; kubelet = node agent |
| Pod IP is permanent | Pod IP can change |
| Service DNS points directly to Pod | DNS → Service IP → routing → Pod |
| Readiness failure restarts Pod | It removes Pod from traffic |
| Base64 means Secret is encrypted | Base64 is encoding |
| Namespace gives network isolation | NetworkPolicy controls network traffic |
| Toleration guarantees placement | It only allows a tainted node |
| ReplicaSet performs rollout | Deployment manages rollout |
| Recreate gives zero downtime | Recreate causes downtime |
| HPA changes resource limits | HPA changes replica count |
| `:latest` is ideal production practice | Pin versions/digests |
| RestartPolicy fixes CrashLoopBackOff | Fix the root cause |

---

## 24. 60-Second Final Revision 🔥🔥

```text
KUBERNETES
│
├── CONTROL PLANE
│   ├── API Server → Entry
│   ├── etcd → State
│   ├── Scheduler → Node
│   └── Controller → Desired State
│
├── WORKER
│   ├── kubelet → Pod
│   ├── Runtime → Container
│   └── kube-proxy → Service
│
├── WORKLOADS
│   ├── Pod
│   ├── ReplicaSet
│   ├── Deployment
│   └── StatefulSet
│
├── NETWORK
│   ├── CNI → Pod network
│   ├── Service → Stable access
│   ├── CoreDNS → DNS
│   ├── Ingress → HTTP/HTTPS
│   └── NetworkPolicy → Traffic control
│
├── SECURITY
│   ├── RBAC
│   ├── ServiceAccount
│   ├── Secrets
│   └── securityContext
│
├── SCALING
│   ├── HPA → replicas
│   ├── VPA → resources
│   └── KEDA → events
│
└── DEBUG
    ├── get
    ├── describe
    ├── logs
    ├── logs --previous
    ├── events
    └── top
```

### Senior one-line answer

> Kubernetes is a declarative container orchestration platform where the API Server is the entry point, etcd stores state, Scheduler places Pods, Controllers reconcile desired state, kubelet manages Pods on workers, CNI provides Pod networking, Services provide stable access, and Deployments provide controlled application rollouts.
