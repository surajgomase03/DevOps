# Azure Release Pipeline — Detailed Interview Notes

For a 4.5+ years DevOps interview level, understand Release Pipeline as **CD (Continuous Delivery/Deployment)** rather than only memorizing the UI.

---

## 1. What is Azure Release Pipeline?

### Simple definition

An Azure Release Pipeline automates the deployment of an application from a build artifact to different environments such as:

```
DEV → QA → UAT → PROD
```

### Interview-ready definition

> "A release pipeline is a CD mechanism that takes a validated build artifact and deploys it across multiple environments using deployment tasks, variables, service connections, approvals, and deployment conditions."

---

## 2. Why do we need a Release Pipeline?

Imagine developers manually deploy applications:

```
Developer
   ↓
Build
   ↓
Copy files manually
   ↓
Login to server
   ↓
Run commands
   ↓
Deploy
```

Problems:

- Human mistakes
- Inconsistent deployments
- No proper audit trail
- Difficult rollback
- Slow deployment
- Production configuration mistakes
- Difficult to repeat the same deployment

With release automation:

```
Build Artifact
      ↓
Release Pipeline
      ↓
DEV
      ↓
QA
      ↓
UAT
      ↓
Approval
      ↓
PROD
```

Everything becomes repeatable and auditable.

---

## 3. Basic Release Pipeline Architecture

```
Developer
                     |
                     v
               Git Repository
                     |
                     v
                CI Pipeline
                     |
          +----------+----------+
          |                     |
        Build                  Test
          |                     |
          +----------+----------+
                     |
                     v
                  Artifact
                     |
                     v
             Release Pipeline
                     |
             +-------+-------+
             |               |
            DEV             QA
                             |
                         Approval
                             |
                             v
                            PROD
```

### Remember

```
CI = Build and Test
CD = Deploy
```

---

## 4. Build Pipeline vs Release Pipeline

This is a very common interview question.

| Build Pipeline | Release Pipeline |
|---|---|
| Mainly CI | Mainly CD |
| Builds application | Deploys application |
| Runs tests | Deploys artifact |
| Performs quality checks | Performs deployment |
| Creates artifact | Consumes artifact |
| Example: JAR/ZIP/Docker image | Example: Deploy to DEV/QA/PROD |

### Example

```
Build Pipeline
      ↓
myapp-1.5.zip
      ↓
Release Pipeline
      ↓
DEV → QA → PROD
```

### Interview answer

> "The build pipeline produces a versioned artifact, while the release or deployment pipeline takes that artifact and promotes it through environments."

---

## 5. What is an Artifact?

An artifact is the output of the build process that will be deployed.

Examples:

```
JAR
WAR
ZIP
Docker Image
Helm Chart
Python Package
Terraform Package
```

Example:

```
Source Code
    ↓
Build
    ↓
myapp.jar
```

The release pipeline uses:

```
myapp.jar
```

---

## 6. Why should we deploy the same artifact?

Production best practice:

```
Build Once
                  |
                  v
             myapp:1.5
                  |
        +---------+---------+
        |         |         |
       DEV       QA       PROD
```

Don't do:

```
Build DEV
   ↓
Build QA
   ↓
Build PROD
```

Because the artifacts could be different.

### Interview answer

> "I prefer build-once-deploy-many. The same tested and approved artifact should be promoted across environments to reduce deployment inconsistency."

---

## 7. Release Pipeline Stages

Typical enterprise pipeline:

```
Build
  ↓
DEV
  ↓
QA
  ↓
UAT
  ↓
Production Approval
  ↓
PROD
```

Example:

```
+----------------+
| Build Artifact |
+-------+--------+
        |
        v
+---------------+
| DEV Deployment|
+-------+-------+
        |
        v
+---------------+
| QA Deployment |
+-------+-------+
        |
        v
+---------------+
| UAT Deployment|
+-------+-------+
        |
        v
+---------------+
| Manual Approval|
+-------+-------+
        |
        v
+---------------+
| PROD Deployment|
+---------------+
```

---

## 8. Classic Release Pipeline

Azure DevOps historically provided a Classic Release Pipeline through the UI.

Concept:

```
Azure DevOps
     |
     v
Releases
     |
     +---- Artifact
     |
     +---- DEV
     |
     +---- QA
     |
     +---- PROD
```

You configure it through the Azure DevOps UI. You don't necessarily write YAML for the Classic Release Pipeline.

---

## 9. YAML Multi-Stage Pipeline

Modern approach is generally to define CI/CD in YAML.

```yaml
stages:

- stage: Build
  jobs:
  - job: Build
    steps:
    - script: echo "Build application"

- stage: DeployDev
  dependsOn: Build
  jobs:
  - deployment: Deploy
    environment: dev
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Deploy to DEV"

- stage: DeployProd
  dependsOn: DeployDev
  jobs:
  - deployment: Deploy
    environment: production
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Deploy to PROD"
```

---

## 10. Classic Release vs YAML

| Classic Release | YAML Multi-stage |
|---|---|
| UI-based | Code-based |
| Configuration stored in Azure DevOps UI | YAML stored in Git |
| Difficult to review as code | PR review possible |
| Older approach | Preferred for many new implementations |
| Less convenient for versioning | Version controlled |
| Can still exist in enterprises | Strong IaC/DevOps approach |

### What to say

Don't say:

> "Classic Release Pipeline is useless."

Say:

> "Classic Release Pipelines are still found in legacy enterprise environments, but for new implementations I generally prefer YAML multi-stage pipelines because the deployment definition is version controlled and can be reviewed through Git."

---

## 11. Release Pipeline Components

Understand these components:

```
Release Pipeline
│
├── Artifact
│
├── Stages / Environments
│
├── Tasks
│
├── Variables
│
├── Service Connections
│
├── Approvals
│
├── Deployment Conditions
│
└── Deployment Strategy
```

---

## 12. Artifact

The release pipeline needs something to deploy.

Example:

```
Build Pipeline
      |
      v
app.jar
      |
      v
Release Pipeline
```

For Docker:

```
Build
 ↓
Docker Image
 ↓
ACR
 ↓
Deployment
```

---

## 13. Variables

Different environments usually need different configurations.

Example:

```
DEV:
DATABASE_HOST=dev-db

QA:
DATABASE_HOST=qa-db

PROD:
DATABASE_HOST=prod-db
```

Don't create separate codebases for this.

Use configuration:

```
Application
     |
     +---- DEV variables
     +---- QA variables
     +---- PROD variables
```

---

## 14. Secret Variables

Never hardcode:

```yaml
password: MyPassword123
```

Instead:

```
Secret Store
     ↓
Pipeline
     ↓
Deployment
```

Possible approaches include:

- Secret variables
- Variable groups
- Azure Key Vault
- Workload identity / managed identity where applicable
- Service connections

---

## 15. Service Connection

A service connection allows Azure DevOps to securely authenticate with external resources.

Architecture:

```
Azure Pipeline
      |
      v
Service Connection
      |
      v
Authentication
      |
      v
Azure
      |
      +---- VM
      +---- ACR
      +---- AKS
      +---- App Service
```

### Example

If deploying to Azure resources:

```
Pipeline
   ↓
Azure Service Connection
   ↓
Azure Resource
```

### Security principle

Use:

```
Least privilege
```

Don't give the pipeline unnecessary permissions.

---

## 16. Approvals

Production deployment often needs approval.

Example:

```
Build
  ↓
DEV
  ↓
QA
  ↓
UAT
  ↓
Approval
  ↓
PROD
```

Example:

```
QA Deployment
      |
      v
Production Approval
      |
      +---- Approved → PROD
      |
      +---- Rejected → Stop
```

### Why?

To prevent accidental production deployment.

---

## 17. Pre-Deployment vs Post-Deployment Controls

### Pre-deployment

Things checked before deployment.

Examples:

- Approval
- Branch validation
- Change management
- Security checks

### Post-deployment

Things performed after deployment.

Examples:

- Smoke test
- Health check
- API validation
- Monitoring
- Notification

---

## 18. Deployment Conditions

Conditions control whether deployment should happen.

Example:

```
Build successful
      ↓
Deploy DEV
```

If DEV fails:

```
DEV FAILED
   ↓
Do not continue
```

Conceptually:

```yaml
condition: succeeded()
```

---

## 19. dependsOn

`dependsOn` controls dependency.

Example:

```yaml
- stage: DeployProd
  dependsOn: DeployQA
```

Means:

```
Deploy QA
    ↓
Deploy PROD
```

Without the dependency, your stages may not follow the intended sequence.

---

## 20. Deployment Jobs

A deployment job is designed specifically for deployment workflows.

Example:

```yaml
jobs:

- deployment: DeployApplication

  environment: production

  strategy:

    runOnce:

      deploy:

        steps:

        - script: |
            echo "Deploying application"
```

Important terms:

```
deployment
environment
strategy
runOnce
steps
```

---

## 21. Deployment Strategies

For production, deployment doesn't always have to mean:

```
Old Version → New Version
```

There are multiple strategies.

### Rolling

```
10 servers
 ↓
Deploy gradually
 ↓
2 servers at a time
```

### Blue-Green

```
Blue = Current
Green = New

Users
  |
  v
Blue

Deploy new version
  |
  v
Green

Test Green
  |
  v
Switch traffic
```

### Canary

```
Users
  |
  +---- 95% → Old
  |
  +---- 5%  → New
```

If successful:

```
5%
 ↓
25%
 ↓
50%
 ↓
100%
```

---

## 22. Real Kubernetes Release Architecture

Since Kubernetes/EKS experience is common in this role, understand this model very well.

```
Developer
   |
   v
Git
   |
   v
Azure Pipeline
   |
   +---- Build
   |
   +---- Unit Test
   |
   +---- Security Scan
   |
   v
Docker Image
   |
   v
Container Registry
   |
   v
Release / Deployment
   |
   v
Kubernetes
   |
   +---- Deployment
   +---- Service
   +---- Ingress
```

For Azure:

```
Azure DevOps
      |
      v
Docker Build
      |
      v
Azure Container Registry
      |
      v
AKS
```

AWS equivalent:

```
Jenkins
   |
   v
Docker Build
   |
   v
ECR
   |
   v
EKS
```

---

## 23. Docker Release Example

Build:

```bash
docker build -t myapp:1.5 .
```

Push:

```bash
docker push myregistry/myapp:1.5
```

Deployment:

```yaml
containers:
- name: myapp
  image: myregistry/myapp:1.5
```

The important principle is:

```
Image 1.5
   ↓
DEV
   ↓
QA
   ↓
PROD
```

Same image.

---

## 24. Helm Release Example

You can deploy using Helm.

```bash
helm upgrade --install myapp ./helm-chart \
  --set image.tag=1.5
```

Architecture:

```
Pipeline
   ↓
Docker Image
   ↓
Registry
   ↓
Helm
   ↓
Kubernetes
```

---

## 25. Terraform Release

Release pipelines can also deploy infrastructure.

Example:

```
Git
 ↓
Terraform
 ↓
Plan
 ↓
Review
 ↓
Approval
 ↓
Apply
```

Commands:

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

Production:

```
terraform plan
       ↓
Review
       ↓
Approval
       ↓
terraform apply
```

Avoid blindly doing:

```bash
terraform apply -auto-approve
```

in production.

---

## 26. Real Enterprise Example

Suppose you have 50 microservices.

Pipeline:

```
Git
                     |
                     v
              Pull Request
                     |
                     v
              Build Validation
                     |
          +----------+----------+
          |          |          |
        Build      Test      Security
          |          |          |
          +----------+----------+
                     |
                     v
                Docker Image
                     |
                     v
                   ACR
                     |
                     v
               Deploy DEV
                     |
                     v
              Smoke Testing
                     |
                     v
                Deploy QA
                     |
                     v
              Integration Test
                     |
                     v
                 Approval
                     |
                     v
                Deploy PROD
```

---

## 27. Example YAML

A simplified multi-stage deployment:

```yaml
trigger:
- main

variables:
  imageName: myapp
  imageTag: $(Build.BuildId)

stages:

# BUILD
- stage: Build

  jobs:
  - job: Build

    pool:
      vmImage: ubuntu-latest

    steps:

    - checkout: self

    - script: |
        echo "Build application"
        echo "Run tests"

    - task: Docker@2
      inputs:
        command: build
        repository: $(imageName)
        Dockerfile: '**/Dockerfile'
        tags: |
          $(imageTag)


# DEV
- stage: DeployDev

  dependsOn: Build

  jobs:

  - deployment: DeployDev

    environment: dev

    strategy:

      runOnce:

        deploy:

          steps:

          - script: |
              echo "Deploying to DEV"


# QA
- stage: DeployQA

  dependsOn: DeployDev

  jobs:

  - deployment: DeployQA

    environment: qa

    strategy:

      runOnce:

        deploy:

          steps:

          - script: |
              echo "Deploying to QA"


# PROD
- stage: DeployProd

  dependsOn: DeployQA

  condition: succeeded()

  jobs:

  - deployment: DeployProd

    environment: production

    strategy:

      runOnce:

        deploy:

          steps:

          - script: |
              echo "Deploying to PROD"
```

---

## 28. Important YAML Concepts

Understand these:

```
trigger:     When pipeline starts.
pool:        Which agent executes the job.
variables:   Configuration values.
stages:      Major phases.
jobs:        Units of execution.
steps:       Individual actions.
task:        Predefined Azure Pipeline functionality.
script:      Shell command execution.
dependsOn:   Execution dependency.
condition:   Execution rule.
environment: Deployment target/control boundary.
```

---

## 29. Release Pipeline Troubleshooting

### Scenario 1: DEV deployment succeeds, PROD fails

Don't say:

> "I will rerun the pipeline."

First check:

```
1. Which task failed?
2. What is the error?
3. Which agent executed it?
4. Service connection valid?
5. Target resource reachable?
6. Credentials/permissions?
7. Configuration difference?
8. Artifact/image correct?
9. Network/firewall?
10. Recent infrastructure change?
```

---

### Scenario 2: Service Connection Authentication Failure

Possible error:

```
Authentication failed
Unauthorized
403 Forbidden
```

Check:

```
Pipeline
   ↓
Service Connection
   ↓
Credential / Federation
   ↓
Permissions
   ↓
Target Resource
```

Possible causes:

- expired credential
- incorrect identity
- insufficient RBAC
- service connection misconfiguration
- resource changed
- federated identity configuration issue

---

### Scenario 3: Docker Image Not Found

Example:

```
ImagePullBackOff
```

Check:

```bash
kubectl describe pod <pod-name>
```

Then:

```bash
kubectl get pods
kubectl get deployment
kubectl describe deployment <deployment-name>
```

Check:

- image name
- image tag
- registry
- authentication
- image existence
- network connectivity

---

### Scenario 4: Deployment Succeeded but Application Is Down

Never assume:

> "Pipeline is green, so application is healthy."

Pipeline success only means deployment tasks completed successfully.

Check:

```bash
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl describe pod <pod>
kubectl logs <pod>
```

Then:

```
Pipeline Success
      ≠
Application Health
```

This is a very good senior-level interview point.

---

### Scenario 5: Production deployment is successful but users report errors

Think:

```
Deployment
   ↓
Application
   ↓
Dependencies
   ↓
Database
   ↓
Network
   ↓
External APIs
```

Check:

- application logs
- Kubernetes events
- health endpoints
- metrics
- database connectivity
- external dependency health
- configuration
- recent changes

If required:

```
Rollback
```

---

## 30. Rollback

Suppose:

```
Current version = 1.4
New version = 1.5
```

Deployment:

```
1.4 → 1.5
```

Problem occurs.

Rollback:

```
1.5 → 1.4
```

### Important interview point

Rollback strategy should be designed before production deployment, not invented during an incident.

---

## 31. Release Pipeline Security

### Secrets

Never commit:

```
password
API key
AWS secret key
Azure client secret
database password
```

into Git.

### Least privilege

Example:

```
DEV deployment identity
    ↓
DEV permissions
```

Don't unnecessarily give:

```
DEV identity
    ↓
Subscription Owner
```

### Service Connections

Use dedicated identities.

Better:

```
Pipeline
 ↓
Deployment Identity
 ↓
Required Resource
```

rather than:

```
Pipeline
 ↓
Administrator
 ↓
Everything
```

---

## 32. Secret Rotation

Credentials should not live forever.

Example:

```
Old credential
      ↓
Rotation process
      ↓
New credential
      ↓
Update integration
      ↓
Disable old credential
```

For modern authentication, prefer short-lived/federated identity mechanisms where supported.

---

## 33. Release Pipeline Best Practices

1. **Build once, deploy many**

```
Build → Artifact → DEV → QA → PROD
```

2. **Version artifacts**

Use:

```
1.0.1
1.0.2
Build ID
Git SHA
```

Avoid relying only on `latest` for production releases.

3. **Secure secrets** — use secret management.

4. **Least privilege** — deployment identities should have only required permissions.

5. **Production approval** — use appropriate approvals/checks.

6. **Automated testing** — run unit tests, integration tests, smoke tests, security tests.

7. **Rollback plan** — always know: "How will I recover if this deployment fails?"

8. **Monitoring**

```
Deploy
 ↓
Health Check
 ↓
Metrics
 ↓
Logs
 ↓
Alerts
```

9. **Auditability** — track who, what, when, which version, which environment.

10. **Infrastructure as Code** — don't manually configure infrastructure whenever possible. Use Terraform, Bicep, ARM or CloudFormation as appropriate.

---

## 34. Release Pipeline vs Jenkins

| Jenkins | Azure DevOps |
|---|---|
| Jenkinsfile | YAML pipeline |
| Jenkins Agent | Azure Pipeline Agent |
| Jenkins Credentials | Service Connection / secret integration |
| Shared Library | YAML Templates |
| Jenkins Build | Pipeline Build |
| Deploy Stage | Deployment Stage |
| Jenkins Environment | Azure DevOps Environment |
| Jenkins plugins | Azure Pipeline Tasks/Extensions |

### Interview answer

> "Conceptually they are similar. In Jenkins I would typically use a Jenkinsfile with agents, credentials and shared libraries. In Azure DevOps I can use YAML pipelines with agents, service connections and reusable templates."

---

## 35. Release Pipeline vs Argo CD

This is particularly important if your profile includes Kubernetes/GitOps.

### Azure Release/Pipeline

Generally:

```
Pipeline
   ↓
Deploy
   ↓
Kubernetes
```

### Argo CD

GitOps model:

```
Git Repository
      |
      v
Desired State
      |
      v
Argo CD
      |
      v
Kubernetes
```

Argo CD continuously compares:

```
Git Desired State
       vs
Cluster Actual State
```

and reconciles differences according to its configuration.

### Interview point

Don't say:

> "Argo CD is just another deployment task."

Better:

> "Argo CD is a GitOps continuous delivery tool. The Git repository acts as the source of truth for Kubernetes desired state, and Argo CD reconciles that state with the cluster."

---

## 36. Release Pipeline vs GitHub Actions

| Azure Release/Pipeline | GitHub Actions |
|---|---|
| Azure DevOps | GitHub |
| Pipeline | Workflow |
| Agent | Runner |
| Task | Action |
| Environment | Environment |
| YAML | YAML |
| Service Connection | Secrets/OIDC/integrations |

---

## 37. Interview Questions — Basic

**Q1. What is an Azure Release Pipeline?**
> It automates application deployment across environments.

**Q2. What is the difference between build and release?**
> Build creates and validates the artifact; release deploys that artifact.

**Q3. What is an artifact?**
> A versioned output produced by the build process that can be deployed.

**Q4. Why use multiple environments?**
> To validate the application progressively before production.

**Q5. Why do we need approval?**
> To introduce controlled authorization before sensitive deployments such as production.

---

## 38. Intermediate Interview Questions

**Q6. Why build once and deploy many?**
> To ensure the exact artifact tested in lower environments is the one deployed to production.

**Q7. What is a service connection?**
> A secure authentication mechanism that allows Azure DevOps to interact with external resources.

**Q8. What is `dependsOn`?**
> It defines execution dependency between stages or jobs.

**Q9. What is an environment?**
> A logical deployment target such as DEV, QA or PROD that can also provide deployment controls such as approvals and checks.

**Q10. What's the difference between pre-deployment and post-deployment conditions?**
> Pre-deployment conditions (such as approvals and branch checks) are evaluated before a deployment starts; post-deployment actions (such as smoke tests and health checks) run after deployment to confirm it actually succeeded.

**Q11. What is the difference between a deployment job and a regular job?**
> A deployment job targets an environment, which gives you deployment history, approvals/checks, automatic artifact download, and support for deployment strategies like `runOnce`, `rolling`, and `canary`. A regular job has none of that environment-level tracking.

**Q12. How would you design zero-downtime production deployment?**
> I would use a deployment strategy like blue-green or canary on Kubernetes, with health checks and automated rollback if the new version fails, combined with the same build-once artifact promoted from lower environments.

---

## 39. Azure DevOps UI Walkthrough Examples

These are **text-based mockups** of the actual Azure DevOps screens, useful for describing the UI confidently in an interview even without a live demo.

### 39.1 Classic Release Pipeline — Pipeline canvas

Navigation: `Pipelines → Releases → New pipeline`

```
┌──────────────────────────────────────────────────────────────────┐
│ Pipeline: payment-api-release                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Artifacts                     Stages                             │
│  ┌──────────────┐     ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │ + Add         │────▶│   DEV   │──▶│   QA    │──▶│  PROD   │    │
│  │ payment-ci    │     │ Pre:    │   │ Pre:    │   │ Pre:    │    │
│  │ (Build pipe)  │     │ none    │   │ approval│   │ approval│    │
│  └──────────────┘     │ 3 tasks │   │ 4 tasks │   │ 5 tasks │    │
│                        └─────────┘   └─────────┘   └─────────┘    │
│                                                                    │
│  [Continuous deployment trigger: ON]   [Create release]          │
└──────────────────────────────────────────────────────────────────┘
```

- Each stage box is clickable → opens the **tasks list** for that stage (e.g. `Azure CLI`, `Deploy to Kubernetes`, `Replace tokens`).
- The small person icon on a stage's pre-deployment conditions means **approval required**.
- `Continuous deployment trigger` toggle controls whether a new build artifact auto-starts a release.

### 39.2 Stage → Tasks screen

```
┌──────────────────────────────────────────────────────────────────┐
│ Stage: QA                                                          │
├──────────────────────────────────────────────────────────────────┤
│ Agent job                                                           │
│   Agent pool: Azure Pipelines  |  Agent Specification: ubuntu-latest│
│                                                                     │
│   1. ⚙  Download build artifacts                                   │
│   2. ⚙  Azure CLI  — az acr login                                  │
│   3. ⚙  Docker  — pull & tag image                                 │
│   4. ⚙  Kubernetes Manifest  — deploy to AKS (namespace: qa)       │
│   5. ⚙  Bash script — run smoke test                               │
│                                                                     │
│  [+ Add a task]                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 39.3 Pre-deployment approval dialog (on a stage)

```
┌──────────────────────────────────────────────┐
│ Pre-deployment conditions — PROD              │
├────────────────────────────────────────────────┤
│ Triggers                                        │
│  ◉ After stage      ○ Manual only               │
│      Stage: QA                                  │
│                                                  │
│ Pre-deployment approvals            [ON ●]      │
│   Approvers:  release-managers@company.com      │
│   ☐ The user requesting a release or deployment │
│      should not approve their own release       │
│   Timeout: 30 days                               │
│                                                  │
│ Gates                               [OFF]        │
│                                                  │
│                        [Save]   [Cancel]        │
└──────────────────────────────────────────────┘
```

### 39.4 Release summary view (after triggering)

```
┌──────────────────────────────────────────────────────────────────┐
│ Release-45  (payment-api)                     Created: 2 min ago  │
├──────────────────────────────────────────────────────────────────┤
│  Stage      Status            Deployed by      Duration           │
│  DEV        ✅ Succeeded      Automated         1m 20s            │
│  QA         ✅ Succeeded      Automated         2m 05s            │
│  PROD       ⏳ Pending approval  —              —                 │
│                                                                     │
│  [Approve]  [Reject]  [Reassign]                                   │
└──────────────────────────────────────────────────────────────────┘
```

Clicking **Approve** prompts for an optional comment, then the PROD stage starts.

### 39.5 YAML pipeline run — environment view

For a YAML multi-stage pipeline, the equivalent screen is under `Pipelines → <pipeline name> → Run → stages`, and separately under `Pipelines → Environments → production`:

```
┌──────────────────────────────────────────────────────────────────┐
│ Environment: production                                           │
├──────────────────────────────────────────────────────────────────┤
│ Resources        Deployment history            Approvals & checks │
│  (none added)    Run #128  payment-api  ✅  3 min ago              │
│                   Run #127  payment-api  ✅  1 day ago              │
│                   Run #126  payment-api  ❌  2 days ago (rolled    │
│                                                 back manually)      │
│                                                                     │
│  Checks configured:                                                │
│   • Approvals: release-managers (1 approver required)              │
│   • Branch control: main only                                      │
│   • Business hours: Mon–Fri 09:00–18:00 IST                        │
└──────────────────────────────────────────────────────────────────┘
```

This is the screen you'd point to in an interview when explaining "deployment history and traceability per environment."

### 39.6 Service connection screen

Navigation: `Project settings → Service connections → New service connection → Azure Resource Manager`

```
┌──────────────────────────────────────────────────────────────────┐
│ New Azure Resource Manager service connection                     │
├──────────────────────────────────────────────────────────────────┤
│ Identity type:                                                     │
│  ◉ Workload identity federation (automatic)                       │
│  ○ Workload identity federation (manual)                          │
│  ○ Service principal (automatic)                                  │
│  ○ Service principal (manual)                                     │
│  ○ Managed identity                                                │
│                                                                     │
│ Scope level:   Subscription  ▾                                     │
│ Subscription:  pay-prod-subscription                                │
│ Resource group: rg-payment-prod               (recommended: set)   │
│                                                                     │
│ Service connection name: sc-azure-prod                              │
│ ☐ Grant access permission to all pipelines   ← leave UNCHECKED     │
│                                                                     │
│                                    [Save]                           │
└──────────────────────────────────────────────────────────────────┘
```

Leaving **"Grant access permission to all pipelines"** unchecked, then explicitly authorizing only the pipelines that need it, is a least-privilege point worth mentioning out loud.

### 39.7 Variable group (Library) screen, linked to Key Vault

Navigation: `Pipelines → Library → + Variable group`

```
┌──────────────────────────────────────────────────────────────────┐
│ Variable group: payment-prod                                      │
├──────────────────────────────────────────────────────────────────┤
│ Link secrets from an Azure key vault as variables   [ON ●]         │
│   Azure subscription: sc-azure-prod                                 │
│   Key vault name:      kv-payment-prod                              │
│                                                                      │
│   Variables                                                         │
│    ┌───────────────┬───────────────┐                                │
│    │ Name          │ Value         │                                │
│    ├───────────────┼───────────────┤                                │
│    │ DbPassword 🔒 │ ********      │  (from Key Vault, masked)      │
│    │ ApiKey 🔒     │ ********      │  (from Key Vault, masked)      │
│    │ env_name      │ production    │  (plain, inline)               │
│    └───────────────┴───────────────┘                                │
│                                                                       │
│ Pipeline permissions:  payment-release  ✅ Authorized                │
│ Security: release-managers → Administrator role                     │
└──────────────────────────────────────────────────────────────────┘
```

### 39.8 How to narrate this in an interview

> "In the Classic Release Pipeline UI, I'd set up an artifact source linked to the build pipeline, then define stages for DEV, QA, and PROD. Each stage has its own task list — for Kubernetes deployments that's typically `Azure CLI`, `Docker`, and `Kubernetes Manifest` tasks. On the PROD stage, I'd configure pre-deployment approvals under 'Pre-deployment conditions' so a release manager has to sign off before it continues. For the equivalent YAML pipeline, the same approval and audit trail lives under `Pipelines → Environments → production`, which shows deployment history and the checks configured on that environment — approvals, branch control, and business hours, for example."

---

## 40. Final Quick Revision

```
Build Pipeline   = CI (build, test, package)
Release Pipeline = CD (deploy to DEV/QA/PROD)

Artifact          = versioned output of the build
Build once        = deploy many (same artifact/image everywhere)

Pre-deployment    = approvals, branch checks, change mgmt (before deploy)
Post-deployment   = smoke test, health check, monitoring (after deploy)

dependsOn  = ordering between stages/jobs
condition  = whether a stage/job/step runs at all

Service Connection = how the pipeline authenticates to Azure/ACR/AKS
Approvals & Checks  = who/what must sign off before PROD

Deployment strategies:
  Rolling     -> update in batches
  Blue-Green  -> deploy to idle environment, then switch traffic
  Canary      -> small % first, increase gradually

Pipeline success ≠ Application health   (always verify post-deploy)
Rollback plan must exist BEFORE deployment, not invented during an incident
```
