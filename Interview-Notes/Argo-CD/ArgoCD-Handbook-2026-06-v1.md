# ArgoCD Handbook v1 | June 2026

**Version**: 1.0 (June 2026)  
**Status**: Complete  
**Audience**: DevOps Engineers, SRE, Platform Engineers  
**Focus**: Production-ready, enterprise-scale ArgoCD

---

## Table of Contents

1. [What is ArgoCD?](#what-is-argocd)
2. [GitOps Principles](#gitops-principles)
3. [Architecture & Components](#architecture--components)
4. [Applications & Projects](#applications--projects)
5. [Sync & Refresh Strategies](#sync--refresh-strategies)
6. [Healthy & Degraded States](#healthy--degraded-states)
7. [Rollback & Drift Detection](#rollback--drift-detection)
8. [Multi-Cluster Deployments](#multi-cluster-deployments)
9. [RBAC & Secrets](#rbac--secrets)
10. [Helm & Kustomize Integration](#helm--kustomize-integration)
11. [Troubleshooting & Best Practices](#troubleshooting--best-practices)
12. [Production Scenarios & Interview Questions](#production-scenarios--interview-questions)

---

## What is ArgoCD?

### Introduction

**What is it?**
- Declarative, GitOps continuous deployment tool for Kubernetes
- Synchronizes cluster state to match Git repository (source of truth)
- Pull-based deployment (cluster pulls from Git, not push from CI/CD)
- Automatically reconciles drift (keeps cluster in desired state)

**Why is it needed?**
- **Problem**: Manual kubectl deployments cause configuration drift
- **Drift**: Cluster state diverges from Git (hard to track, audit, rollback)
- **Solution**: GitOps enforces Git as single source of truth
- **Benefit**: Automated reconciliation, complete audit trail, one-command rollback

**When should it be used?**
- Multi-cluster Kubernetes deployments
- Applications requiring audit trail (compliance, financial, healthcare)
- Teams practicing GitOps (infrastructure as code discipline)
- Production systems needing automatic drift correction

### Internal Working

**Control Flow**:
1. ArgoCD API Server listens for Git webhooks (or polls every 3 minutes)
2. Repo Server clones Git repository at specified revision
3. Application Controller retrieves cluster state via Kubernetes API
4. Three-way merge: Compares Git state vs cluster state vs last-applied-config
5. If different, kubectl applies changes to cluster
6. Monitoring loop updates Application status (Synced/OutOfSync, Healthy/Degraded)

**Component Interaction**:
- API Server ↔ Repo Server: Request manifest rendering (gRPC)
- API Server ↔ Application Controller: Status updates (Kubernetes API)
- Application Controller ↔ Kubernetes API: Query cluster state, apply manifests
- UI/CLI ↔ API Server: REST/gRPC API (port 8080/8083)

**Data Flow**:
```
Git Repository → Repo Server (clone + parse) → Application Controller (diff)
                                           ↓
                                  Kubernetes Cluster
                                           ↓
                                  Application Status
```

### Architecture

**Component Diagram (ASCII)**:
```
┌─────────────────────────────────────────────────────────┐
│                    Git Repository                       │
│              (GitHub, GitLab, Gitea)                   │
└────────────────┬────────────────────────────────────────┘
                 │ webhooks or polling
                 ↓
┌─────────────────────────────────────────────────────────┐
│           ArgoCD Control Plane (Kubernetes)             │
│                                                         │
│  ┌────────────────┐  ┌────────────────┐                │
│  │  API Server    │  │ Repo Server    │                │
│  │ (port 8080)    │←→│ (Git clones)   │                │
│  │ UI / REST/gRPC │  │ (Helm render)  │                │
│  └────────────────┘  └────────────────┘                │
│         ↓                                               │
│  ┌────────────────────────────────────┐                │
│  │ Application Controller             │                │
│  │ (reconciliation loop)              │                │
│  │ (leader election for HA)           │                │
│  └────────────────────────────────────┘                │
│         ↓                                               │
│  ┌────────────────────────────────────┐                │
│  │ Redis (cache, sessions)            │                │
│  └────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│         Target Kubernetes Cluster(s)                    │
│   (Deployments, Services, ConfigMaps, etc.)            │
└─────────────────────────────────────────────────────────┘
```

**Sync Flow**:
```
1. Developer pushes → Git
                ↓
2. Webhook triggers → ArgoCD refresh (immediate)
   OR polling detects (within 3 minutes)
                ↓
3. Repo Server fetches Git + renders manifests
                ↓
4. Application Controller diffs Git vs Cluster
                ↓
5. Shows OutOfSync in UI
                ↓
6. User clicks Sync (or auto-sync enabled)
                ↓
7. kubectl apply changes to cluster
                ↓
8. Pod created/updated, monitoring begins
                ↓
9. Status updates: Synced + Healthy
```

### YAML/Code Examples

**Basic Example** (Minimal Application):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app                    # Application name
  namespace: argocd               # Always in argocd namespace
spec:
  project: default                # RBAC project
  source:
    repoURL: https://github.com/myorg/myrepo  # Git repo
    targetRevision: main          # Branch or tag
    path: k8s/                    # Path to manifests
  destination:
    server: https://kubernetes.default.svc    # Target cluster
    namespace: default            # Target namespace
  syncPolicy:
    automated:
      prune: false                # Don't delete unmanaged resources
      selfHeal: false             # Don't revert manual changes
```

**Intermediate Example** (Production-Ready with Helm):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payment-service-prod
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io  # Cascade delete
spec:
  project: payment-team           # Team-based RBAC isolation
  source:
    repoURL: https://github.com/company/helm-charts
    targetRevision: v1.2.3        # Pin Helm chart version
    path: payment-service
    helm:
      releaseName: payment-svc    # Helm release name
      values: |                   # Inline values override
        replicas: 3
        image:
          tag: v2.5.1
      valuesObject:               # Or reference values file
        environment: production
        logging:
          level: info
  destination:
    server: https://prod-cluster.example.com
    namespace: payment
  syncPolicy:
    automated:
      prune: true                 # Delete resources not in Git
      selfHeal: true              # Revert manual changes
    syncOptions:
      - CreateNamespace=true      # Auto-create namespace
      - PrunePropagationPolicy=foreground  # Clean deletion
    retry:
      limit: 5                    # Retry 5 times on failure
      backoff:
        duration: 5s              # Start with 5s delay
        factor: 2                 # Double delay each retry
        maxDuration: 3m           # Max 3 minutes between retries
```

**Enterprise Example** (Multi-Cluster with Notifications):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-app-enterprise
  namespace: argocd
  annotations:
    notifications.argoproj.io/subscribe.on-sync-failed: slack:devops  # Slack alerts
    notifications.argoproj.io/subscribe.on-health-degraded: pagerduty:sre-team
spec:
  project: platform-team
  source:
    repoURL: https://git.company.com/infrastructure/apps
    targetRevision: refs/heads/main
    path: apps/web
    plugin:
      name: kustomize-build-with-helm  # Custom plugin
      env:
        - name: KUSTOMIZE_ARGS
          value: "--load-restrictor LoadRestrictionsNone"
  destination:
    server: https://prod-us-east-1.example.com
    namespace: web-app
  revisionHistoryLimit: 20        # Keep 20 revision history
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - RespectIgnoreDifferences=true  # Ignore generated fields
    retry:
      limit: 10
      backoff:
        duration: 10s
        factor: 2
        maxDuration: 5m
  ignoreDifferences:              # Ignore managed fields
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas          # Don't compare replicas (managed by HPA)
```

### Commands

**CLI Installation & Setup**:
```bash
# Install ArgoCD CLI (macOS)
brew install argocd

# Or download from GitHub
wget https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd-linux-amd64
sudo mv argocd-linux-amd64 /usr/local/bin/argocd

# Login to ArgoCD server
argocd login <ARGOCD_SERVER>:<PORT> --username admin --password <PASSWORD>

# Or use API token (for CI/CD)
export ARGOCD_TOKEN=$(argocd account generate-token --account ci-pipeline)
```

**Application Management**:
```bash
# List all applications
argocd app list

# Get application details (status, sync state, health)
argocd app get my-app

# Sync application (apply Git changes to cluster)
argocd app sync my-app

# Trigger refresh without sync (just fetch Git, no changes)
argocd app refresh my-app --hard

# Rollback to previous revision
argocd app rollback my-app

# View application logs (pod logs from deployed app)
argocd app logs my-app --follow

# Wait for application to be healthy
argocd app wait my-app --sync

# Delete application
argocd app delete my-app --cascade
```

**Repository Management**:
```bash
# List connected Git repositories
argocd repo list

# Add new Git repository
argocd repo add https://github.com/myorg/myrepo \
  --username git \
  --password <token>

# Test repository connection
argocd repo get https://github.com/myorg/myrepo
```

**Project & RBAC**:
```bash
# List RBAC projects
argocd project list

# Get project details
argocd project get default

# Create new project (for team isolation)
argocd project create team-a \
  --src 'https://github.com/myorg/team-a-*' \
  --dest 'https://kubernetes.default.svc,team-a-*'
```

**Account & Tokens**:
```bash
# List user accounts
argocd account list

# Generate API token (for CI/CD automation)
argocd account generate-token --account ci-pipeline

# Create local user
argocd account create my-user

# Delete user
argocd account delete my-user
```

### Production Usage

**Enterprise Deployment Pattern**:
- Deploy ArgoCD in HA mode (3 replicas of API Server, Application Controller)
- Use managed Kubernetes cluster (EKS, GKE, AKS) for control plane
- Target clusters registered as cluster secrets
- Central Git repository (GitHub, GitLab) as source of truth
- Applications separated by team (projects)
- RBAC policies prevent cross-team access
- Secrets stored in Vault (not Git)
- Continuous monitoring (Prometheus, Grafana)

**Multi-Cluster Pattern**:
- Single ArgoCD instance managing 1-50 clusters
- Each cluster registered with kubeconfig
- Applications specify destination cluster
- Different environments (dev/staging/prod) on different clusters
- PR previews on separate cluster

**Performance Tuning**:
- Increase Application Controller concurrency (default: 25)
- Increase Repo Server parallelism (default: 2)
- Use Redis for caching (single instance fine for < 100 apps)
- Set sync timeout appropriately (default: 300s)

### Security

**Authentication**:
- Local users (basic, not recommended)
- OIDC (GitHub, Google, Okta) - **recommended**
- SAML (enterprise SSO)
- Service accounts (JWT tokens for automation)

**Authorization**:
- Default: `policy.default: role:readonly` (secure by default)
- Projects enforce isolation (which repos, which clusters)
- RBAC policies bind users/groups to roles
- Always use RBAC, never grant admin to everyone

**Secrets Management**:
- ❌ Never commit secrets to Git (permanent in history)
- ✅ Use HashiCorp Vault or AWS Secrets Manager
- ✅ External Secrets Operator syncs to K8s Secret
- Git credentials stored encrypted in ArgoCD secret

**Network Security**:
- HTTPS only (port 8083, not 8080 for prod)
- Network policies restrict inter-pod traffic
- TLS certificates (Let's Encrypt or self-signed)
- Private Git repositories (SSH key or token auth)

### Monitoring

**Key Metrics**:
- `argocd_app_sync_total` - Total sync operations
- `argocd_app_sync_duration_seconds` - Sync latency
- `argocd_app_info` - Application metadata + sync status
- `argocd_reconcile_bucket` - Reconciliation latency histogram
- `redis_memory_used_bytes` - Redis memory usage

**Alerts**:
- SyncOperationFailed (error rate > 5%)
- ApplicationOutOfSync (> 30 minutes)
- APIServerLatencyHigh (p99 > 1s)
- RedisMemoryUsageHigh (> 80%)

**Logs**:
- API Server: `kubectl logs -n argocd -l app=argocd-server`
- Application Controller: `kubectl logs -n argocd -l app=argocd-application-controller`
- Repo Server: `kubectl logs -n argocd -l app=argocd-repo-server`

### Troubleshooting

**Common Errors**:

1. **OutOfSync but Git looks correct**
   - Cause: Repo Server connection issue, slow Git clone
   - Debug: `kubectl logs -n argocd -l app=argocd-repo-server | grep error`
   - Fix: Restart Repo Server pod, check Git credentials

2. **Sync fails with permission error**
   - Cause: ArgoCD service account lacks RBAC
   - Debug: `kubectl auth can-i create deployments --as=system:serviceaccount:argocd:argocd-application-controller -n production`
   - Fix: Add ClusterRole to service account

3. **Application stuck in Progressing**
   - Cause: Pod pending (image pull error, resource shortage)
   - Debug: `kubectl describe pod -n production pod-name`
   - Fix: Check image availability, increase resources

4. **High memory usage**
   - Cause: Redis full, cache holding too much
   - Debug: `kubectl top pod -n argocd`
   - Fix: Reduce cache TTL, increase Redis memory

### FAQs

**Q: How often does ArgoCD check Git?**  
A: Every 180 seconds (3 minutes) by default. Webhooks trigger immediate checks (< 1 second).

**Q: Can I use ArgoCD without webhooks?**  
A: Yes, polling every 3 minutes is sufficient. Webhooks are optional optimization.

**Q: What's the difference between sync and refresh?**  
A: Refresh fetches Git and checks status (no changes). Sync applies changes to cluster.

**Q: How do I rollback a deployment?**  
A: `argocd app rollback my-app` or `git revert` and push.

**Q: Can ArgoCD manage multiple clusters?**  
A: Yes, register each cluster as a cluster secret. Single ArgoCD can manage 50+ clusters.

**Q: Should I enable prune?**  
A: Carefully. Prune deletes resources not in Git. Risky if Git not strictly managed. Enable after 6+ months stability.

### Comparison Tables

| Feature | Push-based CI/CD | Pull-based GitOps (ArgoCD) |
|---------|-----------------|---------------------------|
| Credentials | In pipeline | In cluster |
| Failure mode | Deployment fails (manual retry) | Cluster reverts to Git (automatic) |
| Audit trail | Limited | Complete (Git history) |
| Rollback | Re-run pipeline | Git revert (seconds) |
| Drift detection | Manual | Automatic (3 min) |
| Compliance | Limited | Full (Git audit) |

### Cheat Sheet

```bash
# Quick commands
argocd app list                          # List apps
argocd app get <name>                    # Get status
argocd app sync <name>                   # Deploy
argocd app rollback <name>                # Undo
argocd app delete <name> --cascade       # Delete

# Status codes
Synced = cluster == Git
OutOfSync = cluster != Git
Healthy = app running
Degraded = app failing

# File locations
/etc/argocd/argocd-secret              # Encrypted secrets
/etc/argocd/argocd-cm                  # Config
/etc/argocd/argocd-rbac-cm             # RBAC policies
```

### Revision Notes

- ArgoCD is GitOps deployment tool, not CI/CD
- Git is single source of truth
- Automatic reconciliation every 3 minutes (or webhook)
- Pull-based (cluster pulls from Git, not push from pipeline)
- Secrets: Never in Git, use Vault or External Secrets
- RBAC: Always set default role to readonly
- Monitoring: Track sync latency, health status, error rate

---

## GitOps Principles

### Introduction

**What is GitOps?**
- Operational pattern where Git repository is source of truth
- All infrastructure + application config defined declaratively in Git
- Changes via pull requests (code review + audit trail)
- Automated deployment after merge (no manual kubectl)
- Continuous reconciliation (system corrects drift automatically)

**Why is it needed?**
- **Traditional**: Manual deployments, configuration drift, no audit trail
- **GitOps**: Declarative, version-controlled, auditable, self-healing

**When to use it?**
- All production Kubernetes deployments
- Multi-environment systems (dev/staging/prod)
- Teams requiring compliance/audit trail
- Systems needing quick rollback capability

### Internal Working

**GitOps Loop**:
1. Developer edits manifest in Git branch
2. Creates pull request (code review happens)
3. Merge to main branch
4. Git webhook notifies ArgoCD (or polling detects)
5. ArgoCD fetches new state from Git
6. ArgoCD compares Git state vs cluster state
7. If different, ArgoCD applies changes via kubectl
8. Monitoring updates Application status

**Key Difference from Traditional CI/CD**:
- **CI/CD**: Pipeline has cluster credentials, pushes changes (push model)
- **GitOps**: Cluster has Git credentials, pulls changes (pull model)
- **Security**: GitOps is more secure (cluster creds never exposed to pipeline)

### Architecture

**GitOps Workflow (ASCII)**:
```
Git Repository (source of truth)
         ↓ (webhook or polling)
    ArgoCD Server
         ↓
    Repo Server (clone + parse)
         ↓
    Application Controller (diff + reconcile)
         ↓
    Kubernetes Cluster (apply changes)
         ↓
    Monitoring Loop (update status)
```

### YAML/Code Examples

**GitOps Repository Structure**:
```
my-gitops-repo/
├── apps/
│   ├── api/
│   │   ├── base/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── kustomization.yaml
│   │   └── overlays/
│   │       ├── dev/
│   │       │   └── kustomization.yaml
│   │       ├── staging/
│   │       │   └── kustomization.yaml
│   │       └── prod/
│   │           └── kustomization.yaml
│   └── web/
│       ├── base/
│       └── overlays/
├── charts/
│   └── my-chart/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
└── platform/
    ├── argocd-applications.yaml
    ├── namespaces.yaml
    └── rbac-policies.yaml
```

**GitOps Pull Request Workflow**:
```yaml
# In Git branch (developer creates PR)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3          # Changed from 2 to 3
  template:
    spec:
      containers:
      - image: myapp:v1.5  # Changed from v1.4

# PR: Request code review (automated tests run)
# After approval and merge to main: ArgoCD detects change
# ArgoCD automatically: kubectl apply new manifest
# Result: 3 replicas of v1.5 running (cluster state = Git state)
```

---

## Architecture & Components

### Introduction

**ArgoCD Architecture Overview**:
- **Control Plane**: API Server, Application Controller, Repo Server
- **Data Plane**: Target Kubernetes clusters
- **Storage**: Redis for caching, etcd for CRDs

### Components

**API Server**:
- REST/gRPC API (port 8080/8083)
- Serves UI dashboard
- Handles webhook requests
- Authenticates users (OIDC, local users)
- RBAC enforcement

**Application Controller**:
- Watches Application CRDs
- Runs reconciliation loop every 3 minutes
- Performs leader election (HA)
- Only one leader is active
- Others standby (take over if leader dies)

**Repo Server**:
- Clones Git repositories
- Renders Helm charts (helm template)
- Processes Kustomize (kustomize build)
- Returns final manifests to Controller
- Separate pod (stateless, scales horizontally)

**Redis**:
- Session storage
- Manifest cache
- Task queue
- Default: Single instance (SPOF)
- HA: Redis Sentinel or Cluster

**Kubernetes Objects**:
- Application CRD (defines deployment)
- AppProject CRD (RBAC project)
- Secret (Git credentials, OIDC secrets)
- ConfigMap (ArgoCD config, RBAC policies)

### Internal Communication

```
API Server (REST) ← → Application Controller (Kubernetes API)
                           ↓
                    Repo Server (gRPC)
                           ↓
                    Git Repository
```

### Security Considerations

- All inter-pod communication via mTLS (with service mesh)
- API Server requires HTTPS (port 8083)
- Service account permissions restricted (least privilege)
- Network policies limit traffic between components
- Secrets encrypted at rest (requires KMS or AES encryption)

---

## Applications & Projects

### Introduction

**Application CRD**: Defines source (Git), destination (cluster), sync policy
**Project CRD**: RBAC boundary (isolation between teams)

### YAML Examples

**Basic Application**:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: simple-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/myrepo
    targetRevision: main
    path: manifests/
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated: {}  # Auto-sync on Git changes
```

**Project with RBAC**:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: payment-team
  namespace: argocd
spec:
  sourceRepos:
    - 'https://github.com/company/payment-*'  # Only payment repos
  destinations:
    - namespace: 'payment-*'  # Only payment namespaces
      server: 'https://kubernetes.default.svc'
  roles:
    - name: admin
      policies:
        - p, proj:payment-team:admin, applications, *, payment-team/*, allow
    - name: developer
      policies:
        - p, proj:payment-team:developer, applications, sync, payment-team/*, allow
        - p, proj:payment-team:developer, applications, get, payment-team/*, allow
```

---

## Sync & Refresh Strategies

### Introduction

**Sync**: Apply Git changes to cluster  
**Refresh**: Fetch Git + check status (no changes)

### Sync Strategies

**Manual Sync**:
```yaml
syncPolicy:
  automated: null  # Disabled
# Developer must click "Sync" button in UI
```

**Automatic Sync**:
```yaml
syncPolicy:
  automated:
    prune: false
    selfHeal: false
# ArgoCD automatically syncs when Git changes
```

**With Prune & Self-Heal**:
```yaml
syncPolicy:
  automated:
    prune: true      # Delete resources not in Git
    selfHeal: true   # Revert manual cluster changes
# Full GitOps: Git is 100% authoritative
```

---

## Healthy & Degraded States

### Definition

**Health Status**:
- **Healthy**: All pods running, replicas ready, services have endpoints
- **Degraded**: Some pods crashing, pending, not ready
- **Progressing**: Deployment rolling out (temporary state)
- **Unknown**: ArgoCD can't determine (usually error)

**Health Checks** (built-in Lua scripts):
- Deployment: `status.observedGeneration == spec.generation` && `replicas == readyReplicas`
- StatefulSet: All replicas ready and available
- DaemonSet: All nodes running pod
- Job: Succeeded or running
- Service: Has endpoints

### Custom Health Checks

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  resource.customizations.health.cert-manager.io_Certificate: |
    hs = {}
    if obj.status ~= nil then
      if obj.status.conditions ~= nil then
        for i, condition in ipairs(obj.status.conditions) do
          if condition.type == "Ready" and condition.status == "False" then
            hs.status = "Degraded"
            hs.message = condition.message
            return hs
          end
        end
      end
    end
    hs.status = "Healthy"
    return hs
```

---

## Rollback & Drift Detection

### Rollback

**Via ArgoCD CLI**:
```bash
# Rollback to previous revision
argocd app rollback my-app

# Rollback to specific revision
argocd app rollback my-app 0
```

**Via Git**:
```bash
# Revert last commit
git revert HEAD
git push

# ArgoCD automatically syncs to old version (within 3 min)
```

**Via Git Tag**:
```yaml
# Change Application to point to stable tag
spec:
  source:
    targetRevision: v1.2.0  # Pin to specific version
```

### Drift Detection

**Automatic** (every 3 minutes):
```
Git state vs Cluster state
If different → OutOfSync status
```

**Manual**:
```bash
# Refresh to check drift
argocd app refresh my-app --hard
```

**Three-Way Merge** (handles drift intelligently):
```
If only Git changed → apply Git
If only cluster changed → keep cluster (external modification)
If both changed → requires manual resolution
```

---

## Multi-Cluster Deployments

### Introduction

**Single ArgoCD, Multiple Clusters**:
- Central ArgoCD instance manages 1-50 clusters
- Each cluster registered as "cluster secret"
- Applications specify destination cluster

### Cluster Registration

**Register Cluster**:
```bash
# Get cluster credentials
kubectl config view --minify --flatten > cluster-kubeconfig.yaml

# Register in ArgoCD
argocd cluster add <CLUSTER_NAME> \
  --kubeconfig cluster-kubeconfig.yaml
```

**Verify**:
```bash
argocd cluster list

# Output
NAME                                          VERSION  STATUS  MESSAGE
https://kubernetes.default.svc                1.28     Healthy
https://prod-us-east-1.example.com:6443       1.28     Healthy
https://staging-us-west-2.example.com:6443    1.28     Healthy
```

### Multi-Cluster Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payment-prod-us-east
spec:
  source:
    repoURL: https://github.com/myorg/helm-charts
    targetRevision: main
    path: payment
  destination:
    server: https://prod-us-east-1.example.com:6443  # Specific cluster
    namespace: payment
```

### Multi-Region Pattern

```yaml
# Application for US region
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-prod-us
spec:
  destination:
    server: https://prod-us-east-1.example.com
    namespace: app

---
# Application for EU region
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-prod-eu
spec:
  destination:
    server: https://prod-eu-west-1.example.com
    namespace: app
```

---

## RBAC & Secrets

### RBAC Setup

**Secure Default**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.default: 'role:readonly'  # Everyone starts as read-only
```

**RBAC Policies**:
```yaml
data:
  policy.csv: |
    # Format: p, subject, resource, action, object, effect
    p, role:admin, applications, *, */*, allow
    p, role:developer, applications, sync, team-*/*, allow
    p, role:developer, applications, get, team-*/*, allow
    p, role:viewer, applications, get, */*, allow
    
    # Map OIDC groups to roles
    g, organization:platform-team, role:admin
    g, organization:developers, role:developer
```

**Actions**:
- `get` - View application
- `sync` - Trigger sync
- `create` - Create application
- `delete` - Delete application
- `update` - Edit application

### Secrets Management

**Never in Git**:
```bash
# ❌ WRONG: Storing secrets in Git (permanent in history)
apiVersion: v1
kind: Secret
data:
  password: "base64-encoded-secret"  # Visible in git log forever
```

**Use Vault**:
```bash
# ✅ RIGHT: Store in Vault, reference in manifests
apiVersion: v1
kind: Secret
metadata:
  name: db-password
  annotations:
    avp.kustomize.config.k8s.io/var-kind: SecretsKeyRef
stringData:
  password: <path:secret/data/prod/db#password>
```

**External Secrets Operator**:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-store
spec:
  provider:
    vault:
      server: "https://vault.example.com"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "argocd"
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-secret
spec:
  secretStoreRef:
    name: vault-store
  target:
    name: db-password
  data:
    - secretKey: password
      remoteRef:
        key: secret/data/prod/db
        property: password
```

---

## Helm & Kustomize Integration

### Helm Integration

**Basic Helm Application**:
```yaml
spec:
  source:
    repoURL: https://charts.example.com
    chart: my-app
    targetRevision: 1.2.3  # Chart version
    helm:
      releaseName: my-app-release
      values: |
        replicas: 3
        image:
          tag: v1.5
```

**Helm Values File**:
```yaml
spec:
  source:
    repoURL: https://git.example.com/charts
    path: my-chart
    helm:
      valuesObject:
        environment: production
        logging:
          level: info
        resources:
          requests:
            memory: "256Mi"
          limits:
            memory: "512Mi"
```

### Kustomize Integration

**Basic Kustomize Application**:
```yaml
spec:
  source:
    repoURL: https://git.example.com/apps
    path: my-app/overlays/prod  # Kustomize overlay path
```

**Multi-Environment with Kustomize**:
```
my-app/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── dev/
│   │   ├── kustomization.yaml
│   │   └── deployment-patch.yaml  # 2 replicas, low resources
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── deployment-patch.yaml  # 3 replicas
│   └── prod/
│       ├── kustomization.yaml
│       └── deployment-patch.yaml  # 5 replicas, HPA enabled
```

---

## Troubleshooting & Best Practices

### Common Issues

**Issue: Application OutOfSync**
- **Cause**: Repo Server can't clone Git, slow network, authentication failure
- **Debug**: `kubectl logs -n argocd -l app=argocd-repo-server | grep error`
- **Fix**: Check Git credentials, restart Repo Server, verify network connectivity

**Issue: Sync Fails with Permission Error**
- **Cause**: ArgoCD service account lacks Kubernetes RBAC
- **Debug**: `kubectl auth can-i create deployments --as=system:serviceaccount:argocd:argocd-application-controller -n production`
- **Fix**: Add ClusterRole/ClusterRoleBinding to ArgoCD service account

**Issue: Application Stuck in Progressing**
- **Cause**: Pod pending (image pull error, insufficient resources)
- **Debug**: `kubectl describe pod -n production <pod-name>`
- **Fix**: Check image availability, increase resource limits, debug node resource availability

**Issue: High Memory Usage in ArgoCD**
- **Cause**: Redis full, manifest cache holding too much data
- **Debug**: `kubectl top pod -n argocd` and `redis-cli INFO memory`
- **Fix**: Reduce cache TTL, increase Redis memory, split applications into smaller groups

### Best Practices

**Git Hygiene**:
- ✅ Use branch protection (require code review)
- ✅ Pin image versions (never use 'latest')
- ✅ Pin Helm chart versions
- ✅ Use semantic versioning (v1.2.3)
- ❌ Never commit secrets (use Vault)

**Deployment Strategy**:
- ✅ Manual sync for critical apps (review changes first)
- ✅ Auto-sync for non-critical apps (faster deployment)
- ✅ Use prune carefully (only after Git process is mature)
- ✅ Enable self-heal (keeps cluster in desired state)

**Multi-Cluster**:
- ✅ Separate projects per team (isolation)
- ✅ Register all clusters in central ArgoCD
- ✅ Use cluster labels for targeting
- ✅ Monitor each cluster independently

**Monitoring**:
- ✅ Alert on sync failures
- ✅ Alert on OutOfSync > 30 minutes
- ✅ Monitor API Server latency
- ✅ Track reconciliation time per app

**Backup & Disaster Recovery**:
- ✅ Backup etcd daily (Application CRDs)
- ✅ Backup argocd-secret (credentials)
- ✅ Test restore procedures quarterly
- ✅ Store backups in separate region

---

## Production Scenarios & Interview Questions

### Scenario 1: Sudden 50% OutOfSync

**Situation**: ArgoCD dashboard shows 50% of applications OutOfSync suddenly (5 minutes ago)

**Investigation Steps**:
1. Check if Git server is down: `curl https://github.com/api/v3`
2. Check Repo Server logs: `kubectl logs -n argocd -l app=argocd-repo-server | tail -50`
3. Check network connectivity: `kubectl exec -n argocd argocd-repo-server-0 -- ping github.com`
4. Check disk space: `kubectl exec -n argocd argocd-repo-server-0 -- df -h`

**Root Cause**: Repo Server disk full (Git clones filled disk space)

**Fix**:
```bash
# Increase PVC size
kubectl patch pvc argocd-repo-server -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

# Clean cache
kubectl exec -n argocd argocd-repo-server-0 -- rm -rf /tmp/git-*
```

**Prevention**:
- Monitor disk usage (alert if > 80%)
- Set TTL on Git clones (auto-cleanup)
- Scale Repo Server horizontally if needed

---

### Interview Question: Design Multi-Cluster ArgoCD for 100 services

**Question**: "Design ArgoCD architecture for a SaaS company with 100 microservices, 3 environments (dev/staging/prod), distributed across 2 regions (US/EU). RTO = 15 minutes, RPO = 1 minute. Design for 99.99% uptime."

**Answer Framework**:

**Architecture**:
- Central ArgoCD instance in prod-us cluster (HA: 3 replicas)
- 6 target clusters: prod-us, prod-eu, staging-us, staging-eu, dev-us, dev-eu
- Single Git repository (monorepo) with Kustomize overlays
- Redis Sentinel for HA caching

**Application Structure**:
```
repo/
├── apps/service-1 → 3 Applications (dev, staging, prod)
├── apps/service-2 → 3 Applications
└── ...
├── platform/
    └── argocd-applications.yaml  (app-of-apps pattern)
```

**RBAC**:
- Project per team (isolation)
- Developers: sync + get on own apps
- Platform team: admin on all

**Monitoring**:
- Metrics: sync latency, health status, error rate
- Alerts: sync failures, OutOfSync > 30 min, API latency high
- Dashboard: sync status, deployment timeline

**Disaster Recovery**:
- Backup etcd + argocd-secret daily (Velero)
- Restore time: 30 minutes (RTO 15 min target requires multi-region)
- Data loss tolerance: 24 hours (RPO 1 min requires cross-region replication)

---

### Interview Question: GitOps vs Traditional CI/CD

**Question**: "What are the advantages of GitOps over traditional push-based CI/CD?"

**Answer**:

| Aspect | Traditional CI/CD | GitOps |
|--------|-----------------|---------|
| Credentials | In pipeline (exposure risk) | In cluster (safer) |
| Audit Trail | Limited | Complete (Git history) |
| Rollback | Re-run pipeline | `git revert` (seconds) |
| Drift Detection | Manual | Automatic (3 min) |
| Compliance | Limited visibility | Full traceability |
| Recovery | Manual intervention | Self-healing |

**GitOps Benefits**:
1. **Security**: Cluster credentials never leave cluster
2. **Auditability**: All changes tracked in Git
3. **Reliability**: Automatic drift correction
4. **Speed**: One-command rollback
5. **Compliance**: Full audit trail for regulations

---

### Interview Question: Troubleshoot Failed Sync

**Question**: "Application sync is failing repeatedly. Walk me through your debugging process."

**Answer** (Step-by-step):

1. **Check Application Status**:
   ```bash
   argocd app get my-app
   # Look for error message, sync revision, health status
   ```

2. **Check Application Controller Logs**:
   ```bash
   kubectl logs -n argocd -l app=argocd-application-controller | grep -i my-app
   # Look for RBAC errors, API errors, sync timeouts
   ```

3. **Check Repo Server (Git Cloning)**:
   ```bash
   kubectl logs -n argocd -l app=argocd-repo-server | grep -i error
   # Look for authentication failures, network issues
   ```

4. **Verify Git Credentials**:
   ```bash
   kubectl get secret -n argocd -l argocd.argoproj.io/secret-type=repository
   # Check if credentials exist and are valid
   ```

5. **Check Cluster Connectivity**:
   ```bash
   kubectl get nodes
   # Verify cluster is healthy
   ```

6. **Verify RBAC**:
   ```bash
   kubectl auth can-i create deployments \
     --as=system:serviceaccount:argocd:argocd-application-controller \
     -n production
   # Check service account has permissions
   ```

7. **Manual Sync with Debug**:
   ```bash
   argocd app sync my-app --debug
   # See exact error during sync
   ```

---

## Final Cheat Sheet

```bash
# Installation
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd -n argocd --create-namespace

# Basic Commands
argocd login <server>
argocd app list
argocd app get <app>
argocd app sync <app>
argocd app rollback <app>
argocd app delete <app> --cascade

# GitOps Principles
- Git is single source of truth
- Declarative: describe desired state
- Automatic: reconciliation every 3 minutes
- Self-healing: revert manual changes

# Status Codes
Synced = Cluster matches Git
OutOfSync = Cluster differs from Git
Healthy = App running correctly
Degraded = App failing

# Key Files
/etc/argocd/argocd-secret      # Encrypted secrets
/etc/argocd/argocd-cm          # Config
/etc/argocd/argocd-rbac-cm     # RBAC policies

# RBAC Quick Setup
policy.default: role:readonly   # Secure default
```

---

**End of ArgoCD Handbook v1 (June 2026)**

