# Azure Pipelines + Variables + Environments + Agents + Service Connections — 10-Minute Interview Runbook

## ⭐ Core Mental Model

```text
Agent              = WHERE the pipeline runs
Service Connection = HOW the pipeline authenticates
Environment        = WHERE / UNDER WHAT CONTROLS it deploys
Artifact           = WHAT gets promoted
Variable           = CONFIGURATION
Parameter          = PIPELINE INPUT / STRUCTURE
```

Overall flow:

```text
Developer
   ↓
Azure Repos
   ↓
Pipeline
   ↓
Trigger → Variables / Parameters
   ↓
Stage → Job → Step → Task / Script
   ↓
Agent
   ↓
Artifact
   ↓
DEV → QA → Approval / Checks → PROD
   ↓
Service Connection
   ↓
Entra ID → Azure RBAC → Azure Resource / AKS
```

---

# 1. Azure Pipelines

### What is Azure Pipelines?

> Azure Pipelines is Azure DevOps' CI/CD service used to automatically build, test, package, scan and deploy applications.

```text
Git Push
   ↓
Pipeline Trigger
   ↓
Build
   ↓
Unit Test
   ↓
Security Scan
   ↓
Package / Artifact
   ↓
DEV → QA → Approval → PROD
```

### CI vs CD

| CI | CD |
|---|---|
| Continuous Integration | Continuous Delivery / Deployment |
| Build and test code changes | Promote/deploy built artifacts |
| Runs frequently | Moves software through environments |

### YAML vs Classic

- **YAML pipeline** → pipeline stored in Git, versioned and reviewed. Preferred.
- **Classic pipeline** → UI-based legacy pipeline.

Typical YAML file:

```text
azure-pipelines.yml
```

---

# 2. Pipeline Hierarchy ⭐

```text
Pipeline
   ↓
Stage
   ↓
Job
   ↓
Step
   ↓
Task / Script
```

| Level | Meaning |
|---|---|
| Pipeline | Complete automation workflow |
| Stage | Logical boundary: Build, Test, DEV, PROD |
| Job | Group of steps running on one agent |
| Step | One action |
| Task | Predefined reusable action |

### Important defaults

- **Stages** run sequentially by default.
- **Jobs in a stage** run in parallel by default.
- `dependsOn` controls ordering/dependencies.

### Task vs Script

```text
Task   → predefined, reusable, versioned action
Script → your own shell commands
```

Example:

```yaml
- task: Docker@2

- bash: |
    echo "Hello"
```

---

# 3. Basic YAML

Minimal pipeline:

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- script: echo "Hello"
```

If only `steps:` are used, Azure Pipelines creates an implicit stage and job.

### Important step types

```text
script
bash
powershell
pwsh
task
checkout
download
publish
template
```

Example:

```yaml
steps:
- checkout: self
  fetchDepth: 0

- script: echo "Hello"

- bash: |
    echo "Multi-line command"
    ls -la

- task: NodeTool@0
  inputs:
    versionSpec: '20.x'

- publish: $(Build.ArtifactStagingDirectory)
  artifact: drop
```

### Useful settings

| Setting | Purpose |
|---|---|
| `displayName` | Friendly UI name |
| `timeoutInMinutes` | Job timeout |
| `continueOnError` | Continue after step failure |
| `retryCountOnTaskFailure` | Retry failed task |
| `workingDirectory` | Step execution directory |
| `env:` | Environment variables |
| `name:` | Step ID for output variables |

---

# 4. Triggers ⭐

Trigger = **when the pipeline starts**.

## CI Trigger

```yaml
trigger:
- main
```

Advanced:

```yaml
trigger:
  batch: true
  branches:
    include:
    - main
    - develop
    - release/*
    exclude:
    - experimental/*
  paths:
    include:
    - app/*
    exclude:
    - docs/*
```

Disable:

```yaml
trigger: none
```

## PR Validation — Interview Trap 🔴

For **Azure Repos Git**:

> PR validation is configured through **Branch Policy → Build Validation**.

Do not rely on:

```yaml
pr:
```

for Azure Repos Git.

### CI vs PR

```text
CI Trigger
Code Push → Pipeline

PR Validation
Feature Branch → PR → Build/Test Validation
```

---

## Scheduled Trigger

```yaml
schedules:
- cron: "0 2 * * *"
  displayName: Nightly build
  branches:
    include:
    - main
  always: false
```

**Cron schedules are UTC.**

---

## Pipeline Completion Trigger

```yaml
resources:
  pipelines:
  - pipeline: build
    source: payment-ci
    trigger:
      branches:
        include:
        - main
```

Meaning:

```text
CI Pipeline completes
        ↓
CD Pipeline starts
```

---

# 5. Variables ⭐

Variables store configuration values.

```yaml
variables:
  environment: dev
  appName: payment-api
```

Use:

```yaml
- script: echo "Deploying $(appName) to $(environment)"
```

### Variable locations

```text
YAML
Pipeline UI
Variable Groups
Runtime / Queue time
Logging commands
Predefined variables
```

### Scope

```text
Pipeline
   ↓
Stage
   ↓
Job
   ↓
Step
```

More specific scopes can override broader ones, subject to Azure DevOps precedence.

---

## Variable Groups

```text
Variable Group
    /   |   \
   /    |    \
Pipeline A B Pipeline C
```

Example:

```yaml
variables:
- group: payment-dev
- name: appName
  value: payment-api
```

Uses:

- Shared environment configuration
- Centralized values
- Secrets
- Key Vault integration

A pipeline must be authorized to use a variable group.

---

## Important Predefined Variables

| Variable | Meaning |
|---|---|
| `Build.BuildId` | Unique run ID |
| `Build.BuildNumber` | Run number |
| `Build.SourceBranch` | Full branch ref |
| `Build.SourceBranchName` | Branch name |
| `Build.Reason` | Why pipeline ran |
| `Build.Repository.Name` | Repository |
| `Build.SourcesDirectory` | Source checkout directory |
| `Build.ArtifactStagingDirectory` | Artifact staging |
| `System.DefaultWorkingDirectory` | Default working directory |
| `Pipeline.Workspace` | Pipeline workspace |
| `Agent.TempDirectory` | Agent temp directory |
| `System.AccessToken` | Pipeline build identity token |

Example:

```text
Build.SourceBranch
= refs/heads/main

Build.SourceBranchName
= main
```

---

# 6. Secret Variables 🔴

Never store secrets directly in YAML.

```text
❌ Password in azure-pipelines.yml

✅ Secret variable
✅ Secret variable group
✅ Azure Key Vault
```

Secrets include:

- Passwords
- API keys
- Tokens
- Client secrets
- Private credentials

### Secret mapping

Secrets are not automatically available as environment variables.

Use:

```yaml
- script: ./deploy.sh
  env:
    DB_PASSWORD: $(DB_PASSWORD)
```

Do not intentionally print secrets.

### Important

> Secrets are masked in logs, but masking is not a reason to print them.

---

# 7. Output Variables

Same job:

```yaml
- bash: |
    echo "##vso[task.setvariable variable=imageTag]$(Build.BuildId)"
  name: setTag
```

Across jobs:

```yaml
- bash: |
    echo "##vso[task.setvariable variable=imageTag;isOutput=true]$(Build.BuildId)"
  name: setTag
```

Another job:

```yaml
variables:
  tag: $[ dependencies.Build.outputs['setTag.imageTag'] ]
```

Across stages:

```text
stageDependencies.<Stage>.<Job>.outputs['<step>.<var>']
```

---

# 8. Parameters ⭐

Parameters are **typed pipeline/template inputs** evaluated at **compile time**.

Example:

```yaml
parameters:
- name: environment
  type: string
  default: dev
  values:
  - dev
  - qa
  - prod

- name: runTests
  type: boolean
  default: true
```

Use:

```yaml
- ${{ if eq(parameters.runTests, true) }}:
  - script: echo "Running tests"
```

### Key difference

> Parameters can change the **pipeline structure**.

Example:

```text
Parameter
   ↓
Should this stage exist?
Should this job exist?
Which environments?
How many regions?
```

### Common parameter types

```text
string
number
boolean
object
step
stepList
job
jobList
deployment
stage
stageList
```

---

# 9. Variable vs Parameter vs Secret ⭐

| Feature | Purpose | Evaluation |
|---|---|---|
| Variable | Runtime configuration | Mostly runtime |
| Secret | Sensitive configuration | Runtime / masked |
| Parameter | Pipeline/template input and structure | Compile time |
| Variable Group | Shared variables | Runtime |
| Environment variable | OS process value | Process runtime |

### Easy memory trick

```text
Parameter → WHAT should pipeline DO?
Variable  → WHAT VALUE should pipeline USE?
Secret    → SENSITIVE VALUE
Environment → WHERE / UNDER WHAT CONTROLS to deploy
```

---

# 10. Expressions ⭐⭐⭐

There are 3 important syntaxes.

| Syntax | Name | Evaluation |
|---|---|---|
| `$(var)` | Macro | Runtime before task |
| `${{ }}` | Template expression | Compile time |
| `$[ ]` | Runtime expression | Runtime |

### Remember

```text
${{ }} → compile time
$( )   → runtime task value
$[ ]   → runtime expression / computed value
```

### When to use what?

```text
Change pipeline structure
        ↓
${{ }} + parameters

Use variable in task/script
        ↓
$(var)

Runtime condition / output dependency
        ↓
$[ ] / condition:
```

Example:

```yaml
condition: and(
  succeeded(),
  eq(variables['Build.SourceBranch'], 'refs/heads/main')
)
```

---

# 11. Conditions ⭐

Condition decides whether a stage/job/step runs.

Default:

```yaml
condition: succeeded()
```

Important functions:

| Function | Meaning |
|---|---|
| `succeeded()` | Dependencies succeeded |
| `failed()` | Dependency failed |
| `always()` | Always runs |
| `succeededOrFailed()` | Runs after success/failure, not cancellation |
| `canceled()` | Run when canceled |

### Critical interview trap 🔴

If you define your own `condition`, it replaces the default `succeeded()`.

Bad:

```yaml
condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
```

This can run even if an earlier dependency failed.

Correct:

```yaml
condition: and(
  succeeded(),
  eq(variables['Build.SourceBranch'], 'refs/heads/main')
)
```

### Cleanup

```text
Build → Test ❌ → Cleanup
                  ↑
           condition: always()
```

---

# 12. Dependencies

Stages are sequential by default.

Jobs inside a stage are parallel by default.

Example:

```yaml
- stage: Build

- stage: Test
  dependsOn: Build

- stage: Security
  dependsOn: Build

- stage: Deploy
  dependsOn:
  - Test
  - Security
```

Architecture:

```text
           Build
          /     \
       Test    Security
          \     /
           Deploy
```

Parallel stage:

```yaml
- stage: Lint
  dependsOn: []
```

---

# 13. Artifacts ⭐

Artifact = output produced by build and stored for later deployment.

```text
Source
  ↓
Build
  ↓
Package
  ↓
Artifact
  ↓
Deploy
```

Examples:

- `app.zip`
- Helm chart
- Terraform plan
- Test results
- Docker image

### Pipeline artifact

Publish:

```yaml
- publish: $(Build.ArtifactStagingDirectory)
  artifact: drop
```

Download:

```yaml
- download: current
  artifact: drop
```

### Artifact types

| Type | Purpose |
|---|---|
| Pipeline Artifact | Build outputs between stages/pipelines |
| Build Artifact | Legacy artifact style |
| Azure Artifacts | Package feeds: NuGet/npm/Maven/PyPI/Universal |
| Container image | Docker image in ACR |

---

# 14. Build Once, Deploy Many ⭐⭐⭐

```text
Source
  ↓
Build ONCE
  ↓
Immutable Artifact
  ↓
DEV
  ↓
QA
  ↓
PROD
```

### Important

Do not rebuild a different binary for each environment.

Instead:

```text
Same artifact
      ↓
DEV → QA → PROD
```

Environment-specific configuration should be supplied separately:

```text
Variable Groups
Key Vault
ConfigMaps
Environment variables
```

### Interview answer

> I prefer build-once-deploy-many because the exact artifact tested in DEV and QA is the artifact promoted to production.

---

# 15. Templates ⭐

Templates prevent duplicate YAML.

```text
Template
 /   |   \
A    B    C
```

Types:

| Template | Reuses |
|---|---|
| Step template | Steps |
| Job template | Jobs |
| Stage template | Stages |
| Variable template | Variables |
| `extends` | Required pipeline structure / governance |

Example:

```yaml
- template: templates/deploy.yml
  parameters:
    environment: dev
```

### Why templates?

- Standard CI/CD
- Security scans
- Docker builds
- Terraform validation
- Deployment logic
- Organization-wide standards
- Less copy/paste

### `extends`

Used when an organization wants to enforce a standard pipeline structure.

---

# 16. Environments ⭐⭐⭐

Environment = deployment target/boundary.

Examples:

```text
DEV
QA
UAT
PROD
```

Environments provide:

- Deployment history
- Permissions
- Approvals
- Checks
- Deployment resources
- Traceability

```text
Pipeline
   ↓
DEV
   ↓
QA
   ↓
PROD
```

### Important trap 🔴

If a YAML pipeline references a non-existing environment, it can be auto-created **without the expected checks**.

Therefore:

> Create production environments first and configure approvals/checks before deployment.

---

# 17. Deployment Jobs

Example:

```yaml
jobs:
- deployment: DeployProd
  environment: production
  strategy:
    runOnce:
      deploy:
        steps:
        - script: echo "Deploying"
```

### Why deployment job?

Because it:

- Targets an Environment
- Gives deployment history
- Supports approvals/checks
- Supports deployment strategies
- Automatically downloads current pipeline artifacts

### Deployment strategies

| Strategy | Meaning |
|---|---|
| `runOnce` | Deploy once |
| `rolling` | Deploy in batches |
| `canary` | Deploy to a small portion first |

Lifecycle:

```text
preDeploy
    ↓
deploy
    ↓
routeTraffic
    ↓
postRouteTraffic
    ↓
success / failure
```

---

# 18. Approvals & Checks 🔴

Production example:

```text
Build
  ↓
QA
  ↓
Production Environment
  ↓
Approval
  ↓
Checks
  ↓
PROD deployment
```

### Approvals

Human approval from users/groups.

### Checks

Automated gates.

Common checks:

```text
Approvals
Branch Control
Business Hours
Exclusive Lock
Required Template
REST / Azure Function
Azure Monitor Alerts
ServiceNow
```

### Environment permissions

```text
Production
├── DevOps Team → Allowed
├── Release Team → Allowed
└── Developer    → Restricted
```

Goal:

> Separation of duties.

---

# 19. Agents ⭐⭐⭐

Agent = **machine that executes pipeline jobs**.

```text
Pipeline
   ↓
Job
   ↓
Agent
   ↓
Git / Docker / Terraform / Python / kubectl / Azure CLI
```

### Microsoft-hosted

```yaml
pool:
  vmImage: ubuntu-latest
```

Microsoft manages the VM.

Characteristics:

- Fresh VM for each job
- Standard tools
- Easy setup
- Public internet access
- Good for standard workloads

### Self-hosted

```yaml
pool:
  name: MyLinuxPool
```

You manage the machine.

Use when:

- Private AKS/database
- Private endpoints
- VNet access
- On-prem resources
- Custom tools
- Special hardware
- Persistent cache
- Compliance requirements

---

# 20. Agent Pool

Pool = collection of agents.

```text
MyLinuxPool
├── Agent-01
├── Agent-02
└── Agent-03
```

If all agents are busy:

```text
Job → Queue → Wait → Agent available → Run
```

Pipelines must be authorized to use the pool.

---

# 21. Capabilities vs Demands ⭐

### Capabilities

What an agent has.

```text
Agent
├── OS = Linux
├── docker = installed
├── terraform = installed
└── kubectl = installed
```

### Demands

What a job requires.

```yaml
pool:
  name: MyPool
  demands:
  - docker
  - Agent.OS -equals Linux
```

Mental model:

```text
Agent capability = I HAVE this
Job demand       = I NEED this
```

If no agent matches:

```text
Job stays queued
```

---

# 22. Self-Hosted Agent

Typical flow:

```text
Create Agent Pool
      ↓
Download agent
      ↓
Configure
      ↓
Authenticate
      ↓
Agent Online
      ↓
Run as service
```

Linux example:

```bash
mkdir myagent
cd myagent

tar zxvf vsts-agent-linux-x64-<version>.tar.gz

./config.sh --unattended \
  --url https://dev.azure.com/<org> \
  --auth pat \
  --token <PAT> \
  --pool MyLinuxPool \
  --agent agent-01 \
  --acceptTeeEula

sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

### Important

The PAT is used for registration. The running agent then uses its own credentials.

---

# 23. Self-Hosted Agent Security 🔴

Pipeline code executes on the agent.

Therefore:

```text
Untrusted pipeline
      ↓
Agent
      ↓
Potential machine compromise
```

Best practices:

- Patch agents
- Least privilege
- Restrict network
- Separate production pools
- Prefer ephemeral agents
- Restrict pool access
- Don't allow untrusted/fork pipelines
- Avoid long-lived credentials
- Monitor activity

---

# 24. Job Types

| Job | Purpose |
|---|---|
| Agent pool job | Normal job on agent |
| Container job | Steps inside container |
| Deployment job | Deployment to environment |
| Server job | Agentless server-side operations |

---

# 25. Service Connections ⭐⭐⭐

Service connection = authenticated connection from Azure DevOps to an external service.

```text
Azure Pipeline
      ↓
Service Connection
      ↓
Azure Subscription
      ↓
AKS / VM / Storage / ACR
```

### Why?

Pipeline needs an identity.

```text
❌ Hardcoded credentials
✅ Service Connection → Identity → Resource
```

Types include:

- Azure Resource Manager
- Docker Registry
- Kubernetes
- GitHub
- SSH
- NuGet/npm
- Generic

---

# 26. Azure Resource Manager Service Connection

```text
Azure DevOps
     ↓
ARM Service Connection
     ↓
Microsoft Entra ID
     ↓
Azure Subscription
     ↓
Azure Resource
```

Authentication options:

```text
Workload Identity Federation → Recommended
Service Principal + Secret    → Older pattern
Managed Identity              → For Azure-hosted resource identity
```

Scope:

```text
Management Group
Subscription
Resource Group
```

Prefer narrow scope where possible.

---

# 27. Service Principal

Service principal = application identity in Microsoft Entra ID.

```text
Pipeline
   ↓
Service Connection
   ↓
Service Principal
   ↓
Entra ID
   ↓
Azure RBAC
   ↓
Azure Resource
```

Older client-secret model:

```text
Pipeline
   ↓
Client Secret
   ↓
Entra ID
```

Problem:

- Secret storage
- Secret rotation
- Expiration
- Leak risk

---

# 28. Workload Identity Federation ⭐⭐⭐

WIF allows Azure DevOps to authenticate without storing a long-lived client secret.

```text
Azure Pipeline
      ↓
OIDC / Federated Identity
      ↓
Microsoft Entra ID
      ↓
Azure RBAC
      ↓
Azure Resource
```

### Interview answer

> Workload identity federation allows Azure DevOps to authenticate to Azure using a federated identity and short-lived token instead of storing a long-lived client secret.

### Advantages

```text
No stored secret
      ↓
Short-lived token
      ↓
Less rotation
      ↓
Lower credential exposure
```

---

# 29. WIF vs Client Secret

| Client Secret | WIF |
|---|---|
| Long-lived secret | No stored long-lived secret |
| Requires rotation | Short-lived token |
| Can expire | No client-secret expiration problem |
| Higher credential exposure | Reduced credential exposure |
| Older pattern | Modern recommended pattern |

---

# 30. Managed Identity vs WIF

### Managed Identity

Identity for an Azure resource.

```text
Azure VM
   ↓
Managed Identity
   ↓
Key Vault
```

### WIF

External workload authenticating without a stored secret.

```text
Azure DevOps Pipeline
   ↓
WIF
   ↓
Entra ID
   ↓
Azure
```

### Easy memory

> Managed Identity = Azure resource identity  
> WIF = federated workload identity

---

# 31. Authentication vs Authorization ⭐

```text
Authentication = WHO are you?
                 ↓
              Entra ID

Authorization  = WHAT can you do?
                 ↓
              Azure RBAC
```

Common failure:

```text
Authentication succeeds
        ↓
RBAC missing
        ↓
AuthorizationFailed
```

Identity is valid, but it does not have enough permissions.

---

# 32. Least Privilege Service Connections 🔴

Best practices:

- Minimum Azure RBAC role
- Narrowest scope
- Dedicated identity per environment
- Separate DEV and PROD connections
- Don't give Owner unnecessarily
- Don't enable "Grant access permission to all pipelines"
- Authorize only required pipelines
- Add approvals/checks to production
- Prefer WIF

Example:

```text
sc-azure-dev  → DEV resource group
sc-azure-prod → PROD resource group
```

---

# 33. Service Connection in YAML

Azure CLI:

```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: 'sc-azure-dev'
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: |
      az group list -o table
```

Docker/ACR:

```yaml
- task: Docker@2
  inputs:
    containerRegistry: 'sc-acr'
    repository: 'payment-api'
    command: buildAndPush
    Dockerfile: '**/Dockerfile'
    tags: |
      $(Build.BuildId)
```

AKS:

```yaml
- task: KubernetesManifest@1
  inputs:
    action: deploy
    connectionType: azureResourceManager
    azureSubscriptionConnection: 'sc-azure-dev'
    azureResourceGroup: rg-aks-dev
    kubernetesCluster: aks-dev
    namespace: payment
    manifests: manifests/*.yml
    containers: 'myacr.azurecr.io/payment-api:$(Build.BuildId)'
```

---

# 34. Agent vs Service Connection vs Environment ⭐⭐⭐

```text
Agent
= WHERE code runs

Service Connection
= HOW pipeline authenticates

Environment
= WHERE / UNDER WHAT CONTROLS deployment happens
```

Example:

```text
Pipeline
   ↓
Agent
   ↓
Runs deployment
   ↓
Environment: PROD
   ↓
Approval / Checks
   ↓
Service Connection
   ↓
Azure / AKS
```

---

# 35. Key Vault Integration

```text
Azure Key Vault
      ↓
Secrets
      ↓
Azure DevOps Pipeline
      ↓
Application Deployment
```

Options:

```text
1. Variable Group linked to Key Vault
2. AzureKeyVault@2 task
3. Application reads Key Vault using Managed Identity
```

Example:

```yaml
- task: AzureKeyVault@2
  inputs:
    azureSubscription: 'sc-azure-dev'
    KeyVaultName: 'kv-payment-dev'
    SecretsFilter: 'DbPassword,ApiKey'
    RunAsPreJob: true

- script: ./deploy.sh
  env:
    DB_PASSWORD: $(DbPassword)
```

Permissions:

> The service connection identity needs access to secrets, such as Get/List or the appropriate Key Vault RBAC role.

---

# 36. Useful Pipeline Patterns

## Cache

```yaml
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    restoreKeys: |
      npm | "$(Agent.OS)"
    path: $(Pipeline.Workspace)/.npm
```

## Matrix

Run same job across multiple OS/images.

```yaml
strategy:
  matrix:
    linux:
      imageName: ubuntu-latest
    windows:
      imageName: windows-latest
```

## Container Job

```yaml
container: node:20

steps:
- script: node --version
```

## Timeout / Retry

```yaml
- job: Build
  timeoutInMinutes: 30
  steps:
  - task: AzureCLI@2
    retryCountOnTaskFailure: 2
```

---

# 37. DevSecOps Pipeline

```text
Code
 ↓
SAST / SonarQube
 ↓
Dependency Scan
 ↓
Container Scan / Trivy
 ↓
IaC Scan
 ↓
Build
 ↓
Artifact
 ↓
Deploy
```

Best practices:

- YAML pipelines
- Templates
- Multi-stage pipelines
- Build once, deploy many
- Branch protection
- Key Vault for secrets
- WIF for Azure authentication
- Least privilege
- Production approvals/checks
- Timeouts and caching
- Meaningful display names
- Publish test results

---

# 38. Complete CI/CD Architecture ⭐⭐⭐

```text
                         Azure DevOps
                              │
                    ┌─────────┴─────────┐
                 Azure Repos          Pipeline
                    │                   │
                    │             Variables / Parameters
                    └──────► Trigger   │
                                  ▼
                               Build
                                  │
                                Agent
                                  │
                             Compile/Test
                                  ▼
                               Artifact
                                  ▼
                                DEV
                                  ▼
                                 QA
                                  ▼
                         Approval / Checks
                                  ▼
                                PROD
                                  ▼
                         Service Connection
                                  ▼
                         Workload Identity
                          Federation
                                  ▼
                            Microsoft Entra ID
                                  ▼
                              Azure RBAC
                                  ▼
                         Azure / AKS / VM
```

Containerized application:

```text
Git
 ↓
PR Validation
 ↓
Build
 ↓
Test
 ↓
SonarQube
 ↓
Docker Build
 ↓
Trivy Scan
 ↓
Push to ACR
 ↓
Deploy DEV
 ↓
Smoke Test
 ↓
QA
 ↓
Approval
 ↓
PROD
```

---

# 39. Command Cheat Sheet

## Azure DevOps CLI

```bash
az extension add --name azure-devops

az devops configure \
  --defaults \
  organization=https://dev.azure.com/<org> \
  project=<project>
```

Create pipeline:

```bash
az pipelines create \
  --name payment-ci \
  --repository payment-api \
  --repository-type tfsgit \
  --branch main \
  --yml-path azure-pipelines.yml
```

List:

```bash
az pipelines list -o table
```

Show:

```bash
az pipelines show --name payment-ci
```

Run:

```bash
az pipelines run \
  --name payment-ci \
  --branch main \
  --parameters environment=qa runTests=true \
  --variables appName=payment-api
```

Runs:

```bash
az pipelines runs list -o table
az pipelines runs show --id <run-id>
```

### Variable groups

```bash
az pipelines variable-group list -o table
```

### Agents

```bash
az pipelines pool list -o table
az pipelines agent list --pool-id <pool-id> -o table
```

### Service connections

```bash
az devops service-endpoint list -o table
az devops service-endpoint show --id <id>
```

---

# 40. Pipeline Debugging

Enable:

```text
System diagnostics
```

or:

```text
system.debug = true
```

Useful commands:

```bash
printenv | sort
pwd
ls -la
df -h
```

Logging:

```yaml
- script: |
    echo "##[error]Something failed"
    echo "##[warning]Be careful"
```

---

# 41. Troubleshooting Runbook ⭐⭐⭐

## Pipeline not starting

```text
1. YAML valid?
      ↓
2. Pipeline enabled?
      ↓
3. CI trigger defined?
      ↓
4. Correct branch?
      ↓
5. Path filters match?
      ↓
6. PR branch policy configured?
      ↓
7. Repository permissions OK?
```

---

## Job waiting for agent

```text
Job
 ↓
Agent Pool
 ↓
Agent available?
 ↓
Agent online?
 ↓
Capability available?
 ↓
Demand satisfied?
```

If no matching agent:

> Job remains queued.

If Microsoft-hosted shows:

```text
No hosted parallelism has been purchased or granted
```

then parallel job capacity/grant is the issue.

---

## Deployment authentication failed

```text
Pipeline
 ↓
Service Connection
 ↓
Authorized?
 ↓
Authentication method
 ↓
WIF / Identity
 ↓
Entra ID
 ↓
Azure RBAC
 ↓
Target Resource
```

### Common errors

| Error | Likely cause |
|---|---|
| Pipeline needs permission | Service connection not authorized |
| `AADSTS70021` | WIF issuer/subject mismatch |
| Secret expired | Client secret expired |
| `AuthorizationFailed` | Missing Azure RBAC |
| Service connection not found | Wrong name/project |
| Key Vault Forbidden | Missing secret permission or firewall |
| Private resource unreachable | Microsoft-hosted agent has no private VNet access |

---

## Production deployment doesn't start

Check:

```text
Build
 ↓
Artifact
 ↓
Deployment Stage
 ↓
Condition
 ↓
Environment
 ↓
Approval
 ↓
Checks
 ↓
Permissions
```

Possible causes:

- Approval pending
- Branch control failed
- Business hours check
- Exclusive lock
- Environment permission
- Pipeline condition false

---

# 42. Common Pipeline Problems

| Problem | Cause / Fix |
|---|---|
| `$(var)` appears literally | Variable undefined/wrong scope |
| Secret empty in script | Map through `env:` |
| `${{ }}` can't see runtime value | Compile-time vs runtime issue |
| Stage runs after failure | Custom condition missing `succeeded()` |
| Stages not parallel | Stages sequential by default |
| Artifact missing | Regular jobs need explicit download |
| PR doesn't trigger | Azure Repos uses branch policy build validation |
| Different binary deployed | Build-once principle violated |
| Pipeline slow | No cache / large checkout / sequential jobs |
| Job queued | No matching agent/capability/demand |
| Private resource unreachable | Use self-hosted/private-connected agent |

---

# 43. Top Interview Questions — Ready Answers

## 1. What is Azure Pipelines?

> Azure Pipelines is a CI/CD service that automates application build, testing and deployment.

## 2. Explain Pipeline → Stage → Job → Step.

> A pipeline is the complete workflow. A stage is a logical boundary such as Build or Production. A job is a group of steps running on one agent. A step is one task or command.

## 3. Stage vs Job?

> Stages are logical pipeline boundaries and run sequentially by default. Jobs inside a stage run in parallel by default unless dependencies are defined.

## 4. Task vs Script?

> A task is a predefined reusable and versioned action. A script contains commands written by the engineer.

## 5. What is a trigger?

> A trigger defines when a pipeline starts, such as a code push, schedule or completion of another pipeline.

## 6. CI vs PR validation?

> CI runs for code pushes. PR validation validates proposed changes before merge. For Azure Repos Git, PR validation is configured using branch policy build validation.

## 7. What is a variable?

> A variable stores configuration values used by the pipeline.

## 8. Variable vs parameter?

> Variables are mainly runtime configuration values. Parameters are typed compile-time inputs and can change pipeline structure.

## 9. How do you handle secrets?

> I use secret variables, secret variable groups or Key Vault. I never store secrets in YAML and map secrets explicitly to the process environment when required.

## 10. `$(var)` vs `${{ }}` vs `$[ ]`?

> `$(var)` is a runtime macro, `${{ }}` is compile-time template syntax, and `$[ ]` is runtime expression syntax used for conditions, dependencies and computed values.

## 11. What is an artifact?

> An artifact is a build output stored so it can be consumed by later stages or pipelines.

## 12. What does build once, deploy many mean?

> Build the application once, publish an immutable artifact, and promote that exact artifact through DEV, QA and PROD without rebuilding.

## 13. What is an Environment?

> An Environment is a deployment target or logical deployment boundary that provides deployment history, permissions, approvals and checks.

## 14. What is a deployment job?

> It is a special job that targets an environment, supports deployment strategies and approvals/checks, and automatically downloads the current pipeline artifacts.

## 15. How do you protect production?

> I use a protected PROD environment with approvals and checks, restricted permissions, branch control, a protected production service connection and branch policies.

## 16. What is an agent?

> An agent is the machine where pipeline jobs actually execute.

## 17. Microsoft-hosted vs self-hosted?

> Microsoft-hosted agents are managed by Microsoft and normally provide a fresh VM for each job. Self-hosted agents are managed by us and are useful for private network access, custom tools and special requirements.

## 18. Why use self-hosted agents?

> Mainly for private resources such as private AKS, databases and private endpoints, or for custom tools, hardware, caching and network/compliance requirements.

## 19. What is an agent pool?

> An agent pool is a collection of agents. Jobs are queued to the pool until a suitable agent is available.

## 20. Capability vs demand?

> Capability describes what an agent has. Demand describes what a job requires. The scheduler matches demands with capabilities.

## 21. What is a service connection?

> A service connection is an authenticated connection that allows an Azure DevOps pipeline to access an external service such as Azure, ACR or Kubernetes.

## 22. What is a service principal?

> A service principal is an application identity in Microsoft Entra ID that can be assigned Azure RBAC permissions.

## 23. What is WIF?

> Workload identity federation allows Azure DevOps to authenticate to Azure using OIDC federation and short-lived tokens without storing a long-lived client secret.

## 24. WIF vs client secret?

> WIF avoids storing a long-lived secret and uses short-lived tokens. Client-secret authentication requires secret storage, rotation and expiration management.

## 25. Managed identity vs WIF?

> Managed identity is an Azure-managed identity attached to an Azure resource. WIF provides federated authentication for workloads such as Azure DevOps pipelines without storing a secret.

## 26. Authentication vs authorization?

> Authentication verifies who the identity is. Authorization determines what that identity is allowed to do. In Azure, Entra ID handles identity and Azure RBAC controls permissions.

## 27. How do you implement least privilege?

> I use dedicated identities per environment, minimum RBAC roles at the narrowest scope, separate service connections and restrict which pipelines can use production connections.

## 28. How do you access Key Vault?

> I can use a Key Vault-linked variable group or `AzureKeyVault@2`. For applications themselves, I prefer managed identity so the application can access Key Vault without storing credentials.

## 29. Why is a secret empty in a script?

> Azure DevOps secret variables are not automatically exposed as environment variables. I explicitly map the secret using `env:`.

## 30. Why does a custom condition run after a failure?

> Because defining a custom condition replaces the default `succeeded()`. I use `and(succeeded(), ...)` when success must also be required.

## 31. Why is my job queued?

> I check whether an agent is online, whether the pool is authorized, whether the agent has the required capabilities and whether the job demands match those capabilities.

## 32. How do you deploy to a private AKS cluster?

> I use a self-hosted, VMSS or managed DevOps agent with private network connectivity to the VNet, then authenticate using a least-privileged service connection.

## 33. Why use templates?

> Templates centralize common CI/CD logic, reduce duplication and enforce organizational standards such as security scans and deployment controls.

## 34. What is `extends`?

> `extends` allows an organization to enforce a common pipeline skeleton, which is useful for governance and security standards.

## 35. What happens if an environment does not exist?

> Azure DevOps can auto-create the referenced environment without the expected checks, so production environments should be created and protected in advance.

## 36. What is a variable group?

> A variable group is a shared collection of variables in the Azure DevOps Library that multiple pipelines can use, including secrets and Key Vault-linked values.

## 37. What is `dependsOn`?

> `dependsOn` controls the execution dependency between stages or jobs. It supports sequential, parallel and fan-in/fan-out pipeline designs.

## 38. What is `always()`?

> `always()` causes a stage, job or step to run regardless of previous success or failure, so it is useful for cleanup or diagnostics.

## 39. How do you debug a pipeline?

> I enable system diagnostics, inspect the failed stage/job/task logs, verify variables and agent details, check service connection authentication and RBAC, and reproduce the failing command directly on the agent where appropriate.

## 40. How would you design a secure Azure DevOps CI/CD pipeline?

> I would use Azure Repos with protected branches and PR validation, a multi-stage YAML pipeline with build, tests and security scanning, publish one immutable artifact and promote that artifact through DEV, QA and PROD. I would use templates, Key Vault for secrets, WIF for Azure authentication, least-privilege service connections, protected environments with approvals/checks, and self-hosted agents only where private network access is required.

---

# 44. 10-Minute Interview Flow

Use this order when explaining the complete pipeline:

```text
1. Azure Repos
      ↓
2. CI / PR Trigger
      ↓
3. Variables / Parameters
      ↓
4. Build Stage
      ↓
5. Agent
      ↓
6. Test + Security Scan
      ↓
7. Artifact
      ↓
8. DEV Environment
      ↓
9. QA Environment
      ↓
10. PROD Approval / Checks
      ↓
11. Service Connection
      ↓
12. WIF
      ↓
13. Entra ID
      ↓
14. Azure RBAC
      ↓
15. Azure / AKS
```

### One-sentence explanation

> Developer pushes code to Azure Repos, the pipeline is triggered, variables and parameters control the run, stages execute jobs on agents, the build produces an immutable artifact, that artifact is promoted through DEV and QA to a protected PROD environment, and Azure access is provided through a least-privileged service connection using workload identity federation.

---

# 🔴 15 Things to Memorize First

```text
1. Pipeline → Stage → Job → Step → Task
2. CI trigger
3. Azure Repos PR validation = Branch Policy Build Validation
4. Variables
5. Variable Groups
6. Parameters
7. Secret variables + env mapping
8. $(var) vs ${{ }} vs $[ ]
9. Custom condition replaces default succeeded()
10. dependsOn
11. Artifact + Build Once, Deploy Many
12. Environment + Approvals + Checks
13. Microsoft-hosted vs Self-hosted Agent
14. Agent Pool + Capabilities + Demands
15. Service Connection + WIF + Entra ID + RBAC
```

---

# ⭐ Final Memory Map

```text
                    AZURE PIPELINES
                          │
             ┌────────────┼─────────────┐
          Trigger      Variables     Parameters
             │             │              │
             └─────────────┼──────────────┘
                           ▼
                    STAGE → JOB → STEP
                           ↓
                     TASK / SCRIPT
                           ↓
                         AGENT
                           ↓
                       ARTIFACT
                           ↓
                    ┌──────┴──────┐
                   DEV           QA
                                  │
                           Approval / Checks
                                  ↓
                                 PROD
                                  ↓
                         Service Connection
                                  ↓
                    Workload Identity Federation
                                  ↓
                           Microsoft Entra ID
                                  ↓
                            Azure RBAC
                                  ↓
                         Azure / AKS / VM
```

## ⭐ Most Important Interview Statement

> **Agent = where the pipeline runs. Service Connection = how the pipeline authenticates. Environment = where and under what controls the deployment happens. Artifact = what gets promoted. Variable = configuration. Parameter = pipeline input and structure.**

## 🔥 Senior Interview Statement

> **I would keep source code in Azure Repos with protected branches and PR validation, use a multi-stage YAML pipeline for build, test and security scanning, publish one immutable artifact and promote that same artifact through DEV, QA and PROD. I would use templates for reusable standards, Key Vault for secrets, workload identity federation for Azure authentication, least-privilege RBAC, protected production environments with approvals and checks, and self-hosted agents only where private network access is required.**
