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

### Interview Questions

**Q: What is ArgoCD in one sentence?**  
A: ArgoCD is a declarative GitOps deployment tool that continuously synchronizes Kubernetes cluster state to match the desired state defined in a Git repository.

**Q: What's the key difference between ArgoCD and traditional CI/CD?**  
A: Traditional CI/CD (like Jenkins) is push-based: pipeline has cluster credentials and pushes changes. ArgoCD is pull-based: cluster has Git credentials and pulls changes. This makes ArgoCD more secure because cluster credentials never leave the cluster.

**Q: Why is Git as source of truth important?**  
A: Git provides complete audit trail (who changed what, when), enables easy rollback (git revert), prevents configuration drift (cluster self-heals), and supports compliance requirements (all changes tracked).

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

### Interview Questions

**Q: What are the advantages of GitOps over traditional push-based CI/CD?**  
A: 
- **Security**: Cluster credentials stay in cluster (not in pipeline)
- **Auditability**: All changes tracked in Git history (compliance)
- **Rollback**: Single `git revert` vs re-running entire pipeline
- **Drift detection**: Automatic (every 3 min) vs manual checks
- **Compliance**: Full traceability for regulatory requirements (HIPAA, PCI-DSS)
- **Recovery**: Self-healing (automatic reversion to Git state)

---

## Architecture & Components

### Introduction

**ArgoCD Architecture Overview**:
- **Control Plane**: API Server, Application Controller, Repo Server
- **Data Plane**: Target Kubernetes clusters
- **Storage**: Redis for caching, etcd for CRDs

### Interview Questions

**Q: Design ArgoCD architecture for a SaaS company with 100 microservices, 3 environments (dev/staging/prod), across 2 regions (US/EU). RTO=15min, RPO=1min. Design for 99.99% uptime.**

A:
- **Control Plane**: Central ArgoCD in prod-us cluster (HA: 3 replicas API Server, 3 replicas App Controller)
- **Target Clusters**: 6 clusters (prod-us, prod-eu, staging-us, staging-eu, dev-us, dev-eu), all registered as cluster secrets
- **Storage**: Redis Sentinel (3 nodes) for HA caching
- **Source**: Single monorepo with Kustomize overlays (base + overlays/dev|staging|prod)
- **Applications**: 100 services × 3 envs = 300 Applications (use app-of-apps pattern for declarative management)
- **RBAC**: Project per team (isolation), roles per team (admin for seniors, developer for juniors)
- **Monitoring**: Prometheus + Grafana (track sync latency, health status, error rate)
- **DR**: Backup etcd + argocd-secret daily via Velero to separate region
- **RTO**: 30 minutes (restore from backup) - for 15 min RTO, need cross-region replication
- **RPO**: 24 hours (daily backups) - for 1 min RPO, need continuous replication (more complex)

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
    automated: {}
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
    - 'https://github.com/company/payment-*'
  destinations:
    - namespace: 'payment-*'
      server: 'https://kubernetes.default.svc'
  roles:
    - name: admin
      policies:
        - p, proj:payment-team:admin, applications, *, payment-team/*, allow
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
  automated: null
```

**Automatic Sync**:
```yaml
syncPolicy:
  automated:
    prune: false
    selfHeal: false
```

**With Prune & Self-Heal**:
```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
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

---

## Rollback & Drift Detection

### Rollback

**Via ArgoCD CLI**:
```bash
argocd app rollback my-app
argocd app rollback my-app 0
```

**Via Git**:
```bash
git revert HEAD
git push
```

### Drift Detection

**Automatic** (every 3 minutes):
```
Git state vs Cluster state
If different → OutOfSync status
```

**Three-Way Merge**:
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

### Interview Questions

**Q: How would you scale a single ArgoCD instance to manage 5000+ applications?**

A:
- **Horizontal Scaling**: 5+ API Server replicas, 5+ App Controller replicas, 8+ Repo Server replicas
- **Performance Tuning**: Increase app controller concurrency (25 → 100), increase repo server parallelism (2 → 8)
- **Caching**: Use Redis Cluster instead of single Redis, enable aggressive caching (TTL tuning)
- **Architectural**: Use app-of-apps pattern to break into logical groups, or separate ArgoCD instances per 1000 apps
- **Monitoring**: Track reconciliation latency per app, queue depth, identify bottlenecks (Git clone time vs cluster API latency)
- **Limits**: Be aware of Kubernetes API rate limits, Git server rate limits, consider pagination/batching

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
  policy.default: 'role:readonly'
```

**RBAC Policies**:
```yaml
data:
  policy.csv: |
    p, role:admin, applications, *, */*, allow
    p, role:developer, applications, sync, team-*/*, allow
    p, role:developer, applications, get, team-*/*, allow
    p, role:viewer, applications, get, */*, allow
    
    g, organization:platform-team, role:admin
    g, organization:developers, role:developer
```

### Secrets Management

**Never in Git**:
```bash
# ❌ WRONG: Storing secrets in Git (permanent in history)
```

**Use Vault**:
```bash
# ✅ RIGHT: Store in Vault, reference in manifests
```

**External Secrets Operator**:
```yaml
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

### Interview Questions

**Q: How would you design RBAC for a multi-tenant ArgoCD serving 20 independent teams?**

A:
- **Project Per Team**: Create AppProject `team-a`, `team-b`, etc. Each has own sourceRepos and destinations
- **Source Restrictions**: `team-a` can only deploy from `github.com/company/team-a-*` repos
- **Destination Restrictions**: `team-a` can only deploy to `team-a-*` namespaces on allowed clusters
- **Role Hierarchy**: admin (can do everything in project), developer (can sync), viewer (can only view)
- **OIDC Groups**: Map OIDC group `organization:team-a` to project role `team-a:admin`
- **Isolation**: Teams can't see/modify each other's apps (enforced by ArgoCD RBAC)
- **Compliance**: Audit logs show which team deployed what, when (for compliance)

**Q: What's the difference between RBAC and Projects in ArgoCD?**

A:
- **RBAC (Role-Based Access Control)**: Controls WHO can do WHAT (policies, roles, users)
  - Example: `admin` role can do `sync` action on applications
- **Projects**: Control WHAT CAN BE DEPLOYED (source repos, destination clusters/namespaces)
  - Example: `team-a` project can deploy from `team-a-*` repos to `team-a-*` namespaces
- **Together**: User must have both permission (RBAC role) AND right scope (project) to deploy

---

## Helm & Kustomize Integration

### Helm Integration

**Basic Helm Application**:
```yaml
spec:
  source:
    repoURL: https://charts.example.com
    chart: my-app
    targetRevision: 1.2.3
    helm:
      releaseName: my-app-release
      values: |
        replicas: 3
        image:
          tag: v1.5
```

### Kustomize Integration

**Basic Kustomize Application**:
```yaml
spec:
  source:
    repoURL: https://git.example.com/apps
    path: my-app/overlays/prod
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
│   ├── staging/
│   └── prod/
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
- **Fix**: Check image availability, increase resource limits

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

### Interview Questions

**Q: Walk me through debugging a failed sync operation step-by-step.**

A (Systematic Approach):

1. **Get Application Status**:
   ```bash
   argocd app get my-app
   ```

2. **Check Application Controller Logs**:
   ```bash
   kubectl logs -n argocd -l app=argocd-application-controller | grep -i my-app
   ```

3. **Check Repo Server (Git Cloning)**:
   ```bash
   kubectl logs -n argocd -l app=argocd-repo-server | grep -i error
   ```

4. **Verify Git Credentials**:
   ```bash
   kubectl get secret -n argocd -l argocd.argoproj.io/secret-type=repository
   ```

5. **Check Cluster Connectivity**:
   ```bash
   kubectl get nodes
   ```

6. **Verify RBAC**:
   ```bash
   kubectl auth can-i create deployments \
     --as=system:serviceaccount:argocd:argocd-application-controller \
     -n production
   ```

7. **Manual Sync with Debug**:
   ```bash
   argocd app sync my-app --debug
   ```

**Q: How do you handle secrets in a GitOps workflow without committing them to Git?**

A: Three main approaches (ranked by security):

1. **External Secrets Operator (Best)**:
   - ArgoCD creates `ExternalSecret` CRD in cluster
   - Operator fetches from Vault/AWS Secrets Manager
   - Syncs to standard Kubernetes `Secret`
   - Git never sees actual secret values

2. **Sealed Secrets**:
   - Encrypt secrets with public key before Git
   - Only ArgoCD's private key can decrypt (in sealed-secrets controller)
   - Still visible as encrypted values in Git (less ideal)

3. **ArgoCD Plugins with Templating**:
   - Use `helm secrets` plugin
   - Template files reference `<vault://path/to/secret>`
   - Repo Server replaces at render time
   - Raw secret never in Git

**Q: Explain a production incident where something went wrong with ArgoCD.**

A (Scenario Example):

**Situation**: Sudden 50% OutOfSync in production  
**Symptoms**: ArgoCD shows 50 apps OutOfSync in 5 minutes  
**Investigation**:
- Checked Git server: healthy
- Checked Repo Server logs: disk full error (Git clones filled disk)
- Checked PVC: 99% used

**Root Cause**: Repo Server PVC filled up (accumulated git clones not cleaned up)

**Immediate Fix**:
- Increased PVC size: `kubectl patch pvc argocd-repo-server -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'`
- Cleaned cache: `kubectl exec argocd-repo-server-0 -- rm -rf /tmp/git-*`
- Restarted Repo Server pod

**Prevention**:
- Added alert: disk usage > 80%
- Set TTL on Git clone cache (auto-cleanup after 7 days)
- Scaled Repo Server to 3 replicas (distribute clone operations)

**Postmortem Learning**: Always set resource quotas + monitoring, don't rely on manual cleanup

---

## Cheat Sheet

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
```

---

**End of ArgoCD Handbook v1 (June 2026)**

**Note on Future Versions**: 
- Next handbook (v2, July 2026) will only contain NEW or UPDATED topics
- Interview questions will be integrated into their relevant topic sections
- No duplication of fully-covered topics across months
- Each monthly edition builds on the previous without redundancy

