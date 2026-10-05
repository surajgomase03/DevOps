# Azure Pipelines — Combined Interview Notes

This file combines two sets of notes:

- **Part A:** Azure Pipelines + Variables + Environments + Agents + Service Connections (detailed, pointwise reference)
- **Part B:** Azure DevOps & Azure Pipelines — Complete Interview Notes (fundamentals to production-level, with interview phrasing and "what not to say")

Read Part A for deep, structured reference (YAML syntax, tables, commands). Read Part B for interview storytelling, analogies, and "don't say this / say this instead" guidance. Together they cover the same topics from two angles, which is useful for revision.

---

# PART A: Azure Pipelines + Variables + Environments + Agents + Service Connections — Detailed Pointwise Notes

> **Mental model:**
> **Agent** = *where* the pipeline runs · **Service connection** = *how* it authenticates · **Environment** = *where/under what controls* it deploys · **Artifact** = *what* gets promoted · **Variable** = configuration · **Parameter** = pipeline input/structure.

This is one of the **most important** areas for an Azure DevOps Engineer interview.

```text
Developer
   ↓
Azure Repos
   ↓
Pipeline ── Trigger ── Variables / Parameters
   ↓
Stage → Job → Step → Task/Script
   ↓
Agent
   ↓
Azure Resource   (via Service Connection)
```

```text
Build → DEV → QA → Approval / Checks → PROD
```

## A — Contents

1. Azure Pipelines Overview
2. Pipeline Structure (Pipeline → Stage → Job → Step → Task)
3. YAML Basics & Step Types
4. Triggers (CI, PR, Scheduled, Pipeline)
5. Variables
6. Parameters
7. Variable vs Parameter vs Secret
8. Expressions & Evaluation Order
9. Conditions & Dependencies
10. Artifacts & Build Once, Deploy Many
11. Templates
12. Environments, Deployment Jobs, Approvals & Checks
13. Agents, Pools, Capabilities & Demands
14. Service Connections & Workload Identity Federation
15. Key Vault Integration
16. Useful Pipeline Patterns
17. Complete Examples
18. Complete CI/CD Architecture
19. Command Cheat Sheet
20. Hands-On Lab
21. Troubleshooting
22. Interview Questions & Answers (40+)
23. Final Memory Map

---

## A1. Azure Pipelines Overview

**What:**
- Azure DevOps' **CI/CD service**.
- Automates: **build, test, package, security scan, deploy**.

**CI vs CD:**
- **CI (Continuous Integration):** every code change is built and tested automatically.
- **CD (Continuous Delivery/Deployment):** the built artifact is deployed through environments automatically (with approvals where needed).

```text
Git Push → Pipeline Trigger → Build → Unit Test → Security Scan → Package
         → Deploy DEV → Deploy QA → Approval → Deploy PROD
```

**Pipeline types:**
- **YAML pipelines** (`azure-pipelines.yml`): code in the repo, versioned and reviewed. **Use this.**
- **Classic pipelines** (UI-designed build and release): legacy. Know they exist.

**Where YAML lives:** usually the repo root (`azure-pipelines.yml`), and you point the pipeline at it (**Pipelines → New pipeline → Azure Repos Git → existing YAML file**).

> 🎤 *Azure Pipelines is a CI/CD service used to automatically build, test and deploy applications.*

---

## A2. Pipeline Structure

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

```text
Pipeline
│
├── Stage: Build
│      └── Job: BuildJob
│              ├── Step (Task)
│              └── Step (Script)
├── Stage: Test
└── Stage: Deploy
```

| Level | What it is | Key facts |
| --- | --- | --- |
| **Pipeline** | The complete automation workflow | Defined in YAML |
| **Stage** | Logical boundary (Build, Test, DEV, PROD) | **Stages run sequentially by default**; can have conditions, approvals |
| **Job** | A group of steps that run **on one agent** | **Jobs in a stage run in parallel by default** unless `dependsOn` is set |
| **Step** | One action in a job | Script, task, checkout, publish, download, template |
| **Task** | A **reusable predefined action** from Azure DevOps or an extension | Versioned, for example `Docker@2`, `AzureCLI@2` |

**Task vs script:**

```text
Task   → predefined, reusable functionality (versioned, with inputs)
Script → your own shell commands
```

**Why stages?** Gate groups of work (Build → Test → Deploy), apply approvals per stage, and re-run a failed stage.

**Why multiple jobs?** Run in parallel, on different OS/agents (Linux build + Windows build), or split slow test suites.

> A **step** can be a task, a script (`script`, `bash`, `powershell`, `pwsh`), or another supported step type.

---

## A3. YAML Basics & Step Types

### Minimal pipeline

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- script: echo "Hello"
```

If you use only `steps:`, Azure Pipelines creates one implicit stage and one job.

### Important top-level sections

```text
name, trigger, pr, schedules, resources, variables, parameters,
pool, stages, jobs, steps, extends, lockBehavior
```

### Step types

| Step | Purpose |
| --- | --- |
| `script` | Cross-platform command (cmd on Windows, bash on Linux/macOS) |
| `bash` / `powershell` / `pwsh` | Run in a specific shell |
| `task` | Run a task, for example `task: Docker@2` |
| `checkout` | Check out repos (`self` or others) |
| `download` | Download artifacts from a pipeline |
| `publish` | Shorthand to publish a **pipeline artifact** |
| `template` | Insert reusable steps |

```yaml
steps:
- checkout: self
  fetchDepth: 0               # full history (needed for some tools, e.g. versioning, Sonar)
- script: echo "Hello"
  displayName: Say hello
- bash: |
    echo "Multi-line"
    ls -la
- task: NodeTool@0
  inputs:
    versionSpec: '20.x'
- publish: $(Build.ArtifactStagingDirectory)
  artifact: drop
```

### Useful job/step settings

| Setting | Meaning |
| --- | --- |
| `displayName` | Friendly name in the UI |
| `timeoutInMinutes` | Cancel a job that runs too long |
| `continueOnError: true` | Step failure doesn't fail the job (partial success) |
| `retryCountOnTaskFailure: 2` | Retry a task on failure |
| `workingDirectory` | Where a step runs |
| `env:` | Environment variables for a step |
| `name:` | Step ID (used for output variables) |

### Pipeline `name` (run number)

```yaml
name: $(Date:yyyyMMdd)$(Rev:.r)       # Build.BuildNumber, e.g. 20260315.1
```

---

## A4. Triggers

A **trigger** defines *when* a pipeline starts.

### CI trigger (code pushed)

```yaml
trigger:
- main                    # shorthand
```

```yaml
trigger:
  batch: true             # batch pushes while a run is in progress
  branches:
    include: [ main, develop, release/* ]
    exclude: [ experimental/* ]
  paths:
    include: [ app/* ]    # useful in monorepos
    exclude: [ docs/* ]
  tags:
    include: [ v* ]
```

```yaml
trigger: none             # disable CI trigger (run manually / by PR policy / schedule)
```

### PR validation

```text
Developer → feature branch → PR → main → Validation pipeline → Build/Test
```

- **CI trigger = code pushed.**
- **PR validation = code proposed for merge.**

> ⭐ **For Azure Repos Git**, the YAML `pr:` trigger is **not** used. Configure PR validation through **Branch policy → Build validation** on the target branch.
> The `pr:` trigger works for **GitHub** and **Bitbucket** repositories. This is a classic interview gotcha.

### Scheduled trigger

```yaml
schedules:
- cron: "0 2 * * *"            # 02:00 UTC daily
  displayName: Nightly build
  branches:
    include: [ main ]
  always: false                # false = only if there are new changes
```

> Cron schedules are in **UTC**.

### Pipeline completion trigger

```yaml
resources:
  pipelines:
  - pipeline: build
    source: payment-ci
    trigger:
      branches:
        include: [ main ]
```

→ A CD pipeline starts when the CI pipeline completes.

### Other triggers and resources

| Trigger | Notes |
| --- | --- |
| Manual run | **Run pipeline** button (can set parameters/variables) |
| Repository resource | Check out additional repos (multi-repo pipelines) |
| Container resource | Trigger/run in containers |
| Webhook / service hook | External events |

---

## A5. Variables

**Variables store values used by the pipeline.**

```yaml
variables:
  environment: dev
  appName: payment-api
```

```yaml
- script: echo "Deploying $(appName) to $(environment)"
```

**Why variables?** Avoid repeating values and make pipelines easy to maintain:

```text
Without: deploy payment-api dev  (repeated 20 times)
With:    deploy $(appName) $(environment)
```

### Where variables can be defined

| Place | Notes |
| --- | --- |
| **YAML** (`variables:`) | Versioned in code. Non-secret only |
| **Pipeline UI** (Edit → Variables) | Can be **secret** or **settable at queue time** |
| **Variable groups** (Pipelines → Library) | Shared across pipelines, can link to **Key Vault** |
| **Runtime** | Set when running the pipeline |
| **Logging commands** | Set by scripts: `##vso[task.setvariable ...]` |
| **Predefined** | Provided by the system (`Build.BuildId`, ...) |

### Scope

```text
Pipeline → Stage → Job → Step
```

A more specific scope can override a broader one, subject to precedence rules.

```yaml
variables:
  region: westeurope          # pipeline level

stages:
- stage: Build
  variables:
    buildConfig: Release      # stage level
  jobs:
  - job: Build
    variables:
      jobVar: x               # job level
```

### Variable groups

```text
              Variable Group  (Library)
             /        |         \
       Pipeline A  Pipeline B  Pipeline C
```

```yaml
variables:
- group: payment-dev                 # variable group
- name: appName                      # inline variable
  value: payment-api
```

- Centralized management (for example `DEV_URL`, `QA_URL`, `PROD_URL`).
- Have **security** (who can use/edit) and can require **approvals/checks** on use.
- A pipeline must be **authorized** to use a group.
- Can **link secrets from Azure Key Vault**.
- Use **one group per environment** (`payment-dev`, `payment-prod`).

### Predefined variables (know these)

| Variable | Meaning |
| --- | --- |
| `Build.BuildId` | Unique numeric run ID |
| `Build.BuildNumber` | Run number/name |
| `Build.SourceBranch` | Full ref, for example `refs/heads/main` |
| `Build.SourceBranchName` | `main` |
| `Build.Reason` | `IndividualCI`, `PullRequest`, `Manual`, `Schedule` |
| `Build.Repository.Name` | Repo name |
| `Build.SourcesDirectory` | Where code is checked out (`/home/vsts/work/1/s`) |
| `Build.ArtifactStagingDirectory` | Staging folder for artifacts |
| `System.DefaultWorkingDirectory` | Default working directory |
| `Pipeline.Workspace` | Workspace root (artifacts downloaded here) |
| `Agent.TempDirectory` | Temp folder |
| `System.PullRequest.*` | PR details |
| `System.AccessToken` | Token of the pipeline's build identity (for REST/git calls) |

### Environment variables vs pipeline variables

```text
Azure Pipeline variable  ≠  OS environment variable
```

- Pipeline variables are **mapped to environment variables** for scripts, with names **uppercased and `.` → `_`**: `Build.BuildNumber` → `$BUILD_BUILDNUMBER`.

| Shell | Syntax |
| --- | --- |
| Bash | `$BUILD_BUILDNUMBER` |
| CMD | `%BUILD_BUILDNUMBER%` |
| PowerShell | `$env:BUILD_BUILDNUMBER` |

### Secret variables 🔴

Secrets: passwords, API keys, tokens, client secrets, private credentials.

- ❌ Never put real secrets in source-controlled YAML.
- ✅ Use **secret variables** (UI), **variable groups** (secret), or **Azure Key Vault**.
- Secrets are **masked** in logs, but **never intentionally print them**.
- ⭐ **Secrets are NOT automatically available as environment variables.** Map them explicitly:

```yaml
- script: ./deploy.sh
  env:
    DB_PASSWORD: $(DB_PASSWORD)     # explicit mapping
```

- ❌ `echo $(DB_PASSWORD)`: don't do this.
- Secrets are not passed to **PR builds from forks** by default.

### Output variables (pass values between steps/jobs/stages)

```yaml
steps:
- bash: echo "##vso[task.setvariable variable=imageTag]$(Build.BuildId)"      # later steps in the same job
  name: setTag

- bash: echo "##vso[task.setvariable variable=imageTag;isOutput=true]$(Build.BuildId)"
  name: setTag                                                              # visible to other jobs
```

```yaml
# Another job in the same stage
- job: Deploy
  dependsOn: Build
  variables:
    tag: $[ dependencies.Build.outputs['setTag.imageTag'] ]
# Another stage uses: stageDependencies.<Stage>.<Job>.outputs['<step>.<var>']
```

### Runtime variables

Values supplied or changed **when a pipeline runs** (for example set in the Run dialog, if the variable is "settable at queue time").

```text
Run Pipeline → environment = QA → Deploy QA
```

---

## A6. Parameters

- **Parameters are pipeline/template inputs**, evaluated at **compile (template-expansion) time**.
- They have **types**, **defaults** and optional allowed **values**, and appear as **form fields** in the Run dialog.

```yaml
parameters:
- name: environment
  displayName: Target environment
  type: string
  default: dev
  values: [ dev, qa, prod ]
- name: runTests
  type: boolean
  default: true
- name: regions
  type: object
  default: [ westeurope, northeurope ]
```

**Types:** `string`, `number`, `boolean`, `object`, `step`, `stepList`, `job`, `jobList`, `deployment`, `deploymentList`, `stage`, `stageList`.

**Use:**

```yaml
- ${{ if eq(parameters.runTests, true) }}:
  - script: echo "Running tests"

- ${{ each region in parameters.regions }}:
  - script: echo "Deploy to ${{ region }}"

environment: ${{ parameters.environment }}
```

> Parameters let you **control structure** (include/exclude stages, loop over lists). Variables cannot do that at compile time.

---

## A7. Variable vs Parameter vs Secret

| Feature | Purpose | Example | Evaluated |
| --- | --- | --- | --- |
| **Variable** | Configuration value | `appName=payment-api` | Mostly at runtime |
| **Secret** | Sensitive value | password/token | Runtime, masked |
| **Parameter** | Pipeline/template input and structure | `environment=prod`, `runTests=true` | **Compile time** |
| **Variable group** | Shared set of variables | environment config | Runtime |
| **Environment variable** | OS-level process value | `$PATH` | In the process |

```text
Parameter → What should the pipeline do/build?
Variable  → What value should the pipeline use?
Secret    → Sensitive configuration
Environment → Deployment target + controls (a different thing!)
```

---

## A8. Expressions & Evaluation Order

### Three syntaxes ⭐

| Syntax | Name | When evaluated | Example |
| --- | --- | --- | --- |
| `$(var)` | **Macro** | **Runtime**, just before a task runs | `echo $(appName)` |
| `${{ }}` | **Template expression** | **Compile time** (template expansion) | `${{ parameters.environment }}` |
| `$[ ]` | **Runtime expression** | **Runtime**, whole value | `condition: $[eq(variables['Build.SourceBranch'], 'refs/heads/main')]` |

```text
${{ }}  → compile time   (parameters, template logic, if/each)
$( )    → runtime        (replaced just before the task executes; stays literal if undefined)
$[ ]    → runtime        (conditions, variable assignment, dependencies/outputs)
```

### Rules of thumb

- Need to **change the pipeline structure** (add/remove stages, loop)? → `${{ }}` with **parameters**.
- Need a **value inside a script/task input**? → `$(var)`.
- Need a **condition or computed value** at runtime? → `$[ ]` / `condition:`.
- A macro `$(var)` for an undefined variable is left as the literal text `$(var)`.
- Template expressions **can't see runtime values** (such as output variables).

### Useful functions

```text
eq, ne, gt, lt, and, or, not, contains, startsWith, endsWith, in, notIn,
format, join, replace, split, coalesce, counter, lower, upper, succeeded(), failed()...
```

```yaml
condition: and(succeeded(), startsWith(variables['Build.SourceBranch'], 'refs/heads/release/'))
```

---

## A9. Conditions & Dependencies

### Conditions

A **condition** decides whether a stage/job/step runs.

```yaml
condition: succeeded()         # default
```

| Function | Runs when |
| --- | --- |
| `succeeded()` | All previous dependencies succeeded (**default**) |
| `failed()` | A previous dependency failed |
| `always()` | **Always**, even if canceled |
| `succeededOrFailed()` | Succeeded or failed, **but not if canceled** |
| `canceled()` | The run was canceled |

> ⭐ **Gotcha:** If you write your own `condition:`, it **replaces** the default `succeeded()`. This runs even if earlier stages **failed**:
> ```yaml
> condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')     # ❌ missing succeeded()
> ```
> Use `and(succeeded(), ...)`.

**Cleanup example:**

```text
Build → Test (❌ fails) → Cleanup (condition: always()) → still runs
```

**Deploy only from `main`:**

```yaml
condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
```

### Dependencies (`dependsOn`)

- **Stages** run **sequentially in order** by default. Each depends on the previous one.
- **Jobs** in a stage run **in parallel** by default.

```yaml
stages:
- stage: Build
- stage: Test
  dependsOn: Build
- stage: Security
  dependsOn: Build
- stage: Deploy
  dependsOn: [ Test, Security ]       # fan-in
```

```text
Build ──┬── Test ──────┐
        └── Security ──┴── Deploy
```

```yaml
- stage: Lint
  dependsOn: []                        # no dependency → starts immediately, in parallel
```

---

## A10. Artifacts & Build Once, Deploy Many

### What are artifacts?

Outputs produced by a build and stored for later use (for example `app.zip`, Helm chart, Terraform plan, test results).

```text
Source → Build → Application Package → Artifact → Deploy
```

### Types of artifacts (interview)

| Type | Used for | How |
| --- | --- | --- |
| **Pipeline artifacts** | Pass build outputs between stages/pipelines | `publish:` / `PublishPipelineArtifact@1`, `download:` |
| **Build artifacts** (legacy) | Older style | `PublishBuildArtifacts@1` |
| **Azure Artifacts** | **Package feeds**: NuGet, npm, Maven, PyPI, Universal | Feeds with permissions and upstream sources |
| **Container images** | Docker images | Pushed to **ACR** |

```yaml
- publish: $(Build.ArtifactStagingDirectory)
  artifact: drop

# later job/stage
- download: current
  artifact: drop
```

> **Deployment jobs automatically download** the current pipeline's artifacts (into `$(Pipeline.Workspace)/<artifact>`). **Regular jobs** need an explicit `download`/`DownloadPipelineArtifact`.

### ⭐ Build once, deploy many

```text
Source → Build ONCE → Artifact → DEV → QA → PROD
```

- Promote the **same immutable artifact** (or image tag/digest) through environments.
- **Don't rebuild** a different binary for each environment.
- Supply **environment-specific configuration** separately (variable groups, ConfigMaps, Key Vault).

---

## A11. Templates

Templates let you **reuse YAML**.

```text
Without: Pipeline A, B, C each have the same 200 lines
With:                Template
                    /    |    \
                   A     B     C
```

### Template types

| Type | Reuses |
| --- | --- |
| **Step** template | A list of steps |
| **Job** template | Jobs |
| **Stage** template | Whole stages |
| **Variable** template | Variables |
| **Extends** template | A **required pipeline skeleton** (governance) |

### Example: a deploy job template

`templates/deploy.yml`:

```yaml
parameters:
- name: environment
  type: string
- name: serviceConnection
  type: string

jobs:
- deployment: Deploy_${{ parameters.environment }}
  displayName: Deploy to ${{ parameters.environment }}
  environment: ${{ parameters.environment }}
  strategy:
    runOnce:
      deploy:
        steps:
        - task: AzureCLI@2
          inputs:
            azureSubscription: ${{ parameters.serviceConnection }}
            scriptType: bash
            scriptLocation: inlineScript
            inlineScript: |
              az account show -o table
```

Used from the main pipeline:

```yaml
- stage: DeployDev
  jobs:
  - template: templates/deploy.yml
    parameters:
      environment: dev
      serviceConnection: sc-azure-dev

- stage: DeployProd
  dependsOn: DeployDev
  jobs:
  - template: templates/deploy.yml
    parameters:
      environment: prod
      serviceConnection: sc-azure-prod
```

### Shared template repo

```yaml
resources:
  repositories:
  - repository: templates
    type: git
    name: Platform/pipeline-templates
    ref: refs/tags/v1.2.0            # pin a version

steps:
- template: build.yml@templates
```

### `extends` (governance)

```yaml
extends:
  template: secure-pipeline.yml@templates
  parameters:
    appName: payment-api
```

- The organization's template controls the pipeline structure (security scan, approvals); teams can only fill in allowed parameters.
- Combine with the **"Required template" check** on environments/service connections so only pipelines that extend the approved template can deploy.

### Why templates?

- Standard build process, security scanning, Docker build, Terraform validation, common deployment logic
- **Organization-wide CI/CD standards** and less copy-paste

```text
templates/
├── build.yml
├── security.yml
├── docker.yml
└── deploy.yml
```

---

## A12. Environments, Deployment Jobs, Approvals & Checks

### What is an Environment?

A **deployment target or logical deployment boundary**: `DEV`, `QA`, `UAT`, `PROD`.

```text
Pipeline → DEV Environment → QA Environment → PROD Environment
```

**Environments give you:**
- **Deployment history** (which run deployed what, and when)
- **Permissions** (who can use/manage the environment)
- **Approvals and checks** (production protection)
- **Resources** (Kubernetes namespaces, VMs) with traceability

> ⚠️ If a YAML pipeline references a **non-existent environment**, it can be **auto-created with no checks**. Create production environments **first** and add approvals.

### Deployment jobs

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

```text
Deployment Job → Environment → Production (with approvals/checks)
```

**Why a deployment job (not a normal job)?**
- Targets an **environment** → enables **approvals, checks and history**.
- **Automatically downloads artifacts**.
- Supports **deployment strategies** and lifecycle hooks.

### Deployment strategies

| Strategy | Behavior |
| --- | --- |
| **`runOnce`** | Run each lifecycle hook once |
| **`rolling`** | Update in batches (for VM targets), with `maxParallel` |
| **`canary`** | Deploy to a small % first (`increments: [10, 20]`), then the rest |

**Lifecycle hooks:**

```text
preDeploy → deploy → routeTraffic → postRouteTraffic → on: success / failure
```

```yaml
strategy:
  runOnce:
    deploy:
      steps: [ ... ]
    on:
      failure:
        steps:
        - script: echo "Rollback"
```

### Typical environment flow

```text
Build → Deploy DEV → Automated Tests → Deploy QA → Approval → Deploy PROD
```

### Approvals 🔴

```text
Pipeline → Build → QA → [Approval required] → Authorized user → PROD continues
```

- Configured on the **environment** (and also on service connections, variable groups, agent pools, secure files).
- Settings: **approvers** (users/groups), instructions, timeout, option for requester to approve their own run (disable for production), approval order.

### Checks 🔴

| Check | Purpose |
| --- | --- |
| **Approvals** | Human sign-off |
| **Branch control** | Only allowed branches (for example `main`, `release/*`) can deploy |
| **Business hours** | Deploy only in permitted windows |
| **Exclusive lock** | One deployment at a time to the environment |
| **Required template** | Pipeline must extend an approved template |
| **Invoke Azure Function / REST API** | Custom validation |
| **Query Azure Monitor alerts** | Block if alerts are firing |
| **ServiceNow** | Change-management gate |

```text
Pipeline → Production Environment → Checks → Pass → Deployment
```

### Environment permissions

```text
Production
├── DevOps Team   → allowed
├── Release Team  → allowed
└── Developer     → restricted
```

**Roles:** Administrator, User, Creator, Reader. Provides **separation of duties**.

---

## A13. Agents, Pools, Capabilities & Demands

### What is an agent?

The **machine that executes pipeline jobs**.

```text
Pipeline → Job → Agent → commands run (git, docker, terraform, python, kubectl)
```

### Microsoft-hosted vs self-hosted

```yaml
pool:
  vmImage: ubuntu-latest        # Microsoft-hosted
```

```yaml
pool:
  name: MyLinuxPool             # self-hosted pool
```

| Microsoft-hosted | Self-hosted |
| --- | --- |
| Microsoft manages the VM | **You** manage the machine |
| Easy setup | More setup |
| **Fresh VM for each job** | Persistent environment possible |
| Standard preinstalled tools | Custom tools, specific versions |
| Public internet access only | **Private network access** (VNet, on-prem, private endpoints) |
| Good for standard builds | Custom/private requirements, big builds, caching |

**Microsoft-hosted images:** `ubuntu-latest`, `ubuntu-24.04`, `windows-latest`, `macos-latest`, and others.

> ⚠️ **Parallel jobs:** Microsoft-hosted agents need **parallel job capacity**. New organizations may need to **request a free parallelism grant**. The error *"No hosted parallelism has been purchased or granted"* means this. Check current Azure DevOps docs for limits and pricing.

### Why self-hosted?

- Reach **private resources** (private AKS, databases, private endpoints, on-prem)
- Custom software/hardware, licensed tools
- Faster builds with **caches** (persistent disk)
- Compliance/network control

**Responsibilities when self-hosted:** OS, patching, security, tools, networking, capacity, agent software lifecycle.

### Agent pool

A **collection of agents**.

```text
Agent Pool
├── Agent-01
├── Agent-02
└── Agent-03
```

- Pools are **organization-level**, with **project-level** access. Pipelines must be **authorized** to use a pool.
- Job waits in the queue if all agents are busy.

### Capabilities & demands

**Capabilities** = what an agent has:

```text
Agent: OS = Linux, docker = installed, terraform = installed, kubectl = installed
```

**Demands** = what a job requires:

```yaml
pool:
  name: MyPool
  demands:
  - docker
  - Agent.OS -equals Linux
```

```text
Job → Demand: docker → matching agent found → runs
                     → no matching agent → job WAITS in queue
```

- **System capabilities** are auto-detected, **user capabilities** are added manually.

### Registering a self-hosted agent (Linux)

```text
Create Agent Pool → Download agent → Configure → Authenticate/register → Agent shows Online
```

```bash
mkdir myagent && cd myagent
tar zxvf vsts-agent-linux-x64-<version>.tar.gz

./config.sh --unattended \
  --url https://dev.azure.com/<org> \
  --auth pat --token <PAT> \
  --pool MyLinuxPool --agent agent-01 \
  --acceptTeeEula

sudo ./svc.sh install        # run as a service
sudo ./svc.sh start
sudo ./svc.sh status
```

- The **PAT is used only for registration** (needs **Agent Pools: Read & manage**). The agent then uses its own credentials.
- Alternatives: authenticate with a **service principal**. Run in a **container** or on **AKS**.

### Scaling agents

| Option | Notes |
| --- | --- |
| **VM Scale Set (VMSS) agents** | Elastic, auto-scaling, ephemeral self-hosted agents in your subscription/VNet |
| **Managed DevOps Pools** | Newer Azure-managed service for self-hosted-style pools inside your VNet |
| **Containers / AKS** | Agents as pods (for example scaled with KEDA) |

### 🔴 Self-hosted agent security

```text
Pipeline code → Agent → commands execute with the agent's access
```

If untrusted pipeline code controls the agent, it can compromise the machine and any credentials on it.

- Don't keep long-lived credentials on agents. Prefer **service connections with WIF**.
- Keep agents **patched**, with **least privilege** and restricted network access.
- **Separate production agent pools** from general ones.
- **Don't let untrusted pipelines/forks** use sensitive pools.
- Prefer **ephemeral agents** (fresh per job).
- Restrict **who can use and manage** the pool. Require **approvals/checks** on the pool.
- Monitor agent activity and logs.

### Linux vs Windows agents

| Linux | Windows |
| --- | --- |
| bash, python, docker, terraform, kubectl, az | PowerShell, .NET Framework, MSBuild, Visual Studio tooling |

Choose the OS the application needs.

### Job types

| Type | Notes |
| --- | --- |
| **Agent pool job** | Normal job on an agent |
| **Container job** | Runs steps inside a container image (`container:`) |
| **Deployment job** | Deploys to an environment |
| **Server (agentless) job** | Runs on the server (manual validation, REST call, delay) |

---

## A14. Service Connections & Workload Identity Federation

### What is a service connection?

A way for pipelines to **authenticate to external services**.

```text
Azure Pipeline → Service Connection → Azure Subscription → AKS / VM / Storage
```

**Types:** Azure Resource Manager, Docker Registry (ACR), Kubernetes, GitHub, SSH, NuGet/npm, Generic, and more.

**Why?** Pipelines need an identity. Don't hardcode usernames/passwords:

```text
❌ Hard-coded credentials
✅ Service Connection → Identity → Azure Resource
```

### Azure Resource Manager (ARM) service connection

```text
Azure DevOps → ARM Service Connection → Microsoft Entra ID → Azure Subscription → Azure Resource
```

**Authentication methods:**

| Method | Notes |
| --- | --- |
| **Workload identity federation (app registration or managed identity)** | ✅ **Recommended**. No stored secret |
| Service principal (secret/certificate) | Older. Secret must be rotated |
| Managed identity | For **self-hosted agents running on an Azure VM** with a managed identity |

**Scope:** subscription, **resource group** (preferred), or management group.

### Service principal

An **application identity in Microsoft Entra ID** that can be assigned **Azure RBAC** roles.

```text
Azure DevOps → Service Connection → Service Principal → Entra ID → Azure RBAC → Azure Resource
```

Older pattern uses a **client secret**:

```text
Pipeline → Service Connection → Service Principal → Client Secret → Entra ID → Azure
Problem: secret rotation, risk if leaked, secrets expire (pipelines suddenly fail)
```

### 🔴 Workload Identity Federation (WIF)

```text
Azure Pipeline → Federated Identity → Microsoft Entra ID → Azure RBAC → Azure Resource
```

- The pipeline obtains a **short-lived token** through **OIDC federation**. **No long-lived client secret** is stored.
- In Entra ID, a **federated credential** on the app registration/managed identity trusts Azure DevOps:
  - **Issuer:** `https://vstoken.dev.azure.com/<organization-id>`
  - **Subject:** `sc://<organization>/<project>/<service-connection-name>`

> 🎤 *Workload identity federation allows Azure DevOps to authenticate to Azure using a federated identity without storing a long-lived client secret in the service connection.*

**Advantages:**
- No secret to store, leak or rotate
- Short-lived tokens, better security posture
- Fewer outages from expired secrets

### WIF vs client secret

| Client secret | Workload identity federation |
| --- | --- |
| Long-lived secret stored in DevOps | **No stored secret** |
| Must rotate (expires) | Short-lived tokens |
| Leak risk | Much lower risk |
| Older approach | **Modern, recommended** |

### Managed identity vs WIF

- **Managed identity** = an Azure-managed identity **for an Azure resource** (VM, AKS, App Service) so the resource needs no stored password.
- **WIF** = lets a workload **outside** the Azure resource context (such as an Azure DevOps pipeline or GitHub Actions) authenticate **without a secret**.

```text
Azure VM → Managed Identity → Key Vault
Pipeline → WIF → Entra ID → Azure
```

### Authentication vs authorization

```text
Authentication = Who are you?        → Microsoft Entra ID
Authorization  = What can you do?    → Azure RBAC
```

```text
Pipeline → Federated identity → Entra ID (authenticated) → Azure RBAC role → Azure Resource
```

> A common failure: **authentication succeeds but RBAC is missing** (identity valid, authorization insufficient).

### 🔴 Least privilege & hardening

- Don't give **Owner**. Use the minimum role (`Contributor` on a **resource group**, or specific roles like *AcrPush*, *Azure Kubernetes Service Cluster User*).
- Automatic WIF creation may assign **Contributor at subscription scope**. **Narrow it** afterwards.
- **Separate service connections** per environment (`sc-azure-dev`, `sc-azure-prod`).
- **Don't tick "Grant access permission to all pipelines."** Authorize only the pipelines that need it.
- Add **approvals/checks** (and **branch control**) on the production service connection.
- Prefer a **dedicated identity per application/team**.

### Using a service connection in YAML

```yaml
- task: AzureCLI@2
  displayName: Azure CLI
  inputs:
    azureSubscription: 'sc-azure-dev'      # service connection name
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: |
      az group list -o table
```

**Build and push a Docker image to ACR:**

```yaml
- task: Docker@2
  inputs:
    containerRegistry: 'sc-acr'            # Docker Registry service connection
    repository: 'payment-api'
    command: buildAndPush
    Dockerfile: '**/Dockerfile'
    tags: |
      $(Build.BuildId)
```

**Deploy to AKS:**

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

### Agent vs service connection vs environment

```text
Agent              = WHERE code runs
Service Connection = HOW the pipeline authenticates
Environment        = deployment target + approvals/checks
```

```text
Pipeline → Agent → runs the deployment → Environment: PROD (approval/checks) → Azure AKS
                         ↑ uses Service Connection to authenticate
```

---

## A15. Key Vault Integration

```text
Azure Key Vault → Secrets → Azure DevOps Pipeline → Application deployment
```

### Options

| Option | How |
| --- | --- |
| **Variable group linked to Key Vault** | Library → Variable group → *Link secrets from Azure Key Vault* |
| **`AzureKeyVault@2` task** | Downloads secrets into pipeline variables at runtime |
| **App reads Key Vault itself** | Application uses **managed identity** at runtime (best for app secrets) |

```yaml
- task: AzureKeyVault@2
  inputs:
    azureSubscription: 'sc-azure-dev'
    KeyVaultName: 'kv-payment-dev'
    SecretsFilter: 'DbPassword,ApiKey'
    RunAsPreJob: true

- script: ./deploy.sh
  env:
    DB_PASSWORD: $(DbPassword)           # still map secrets explicitly
```

### Permissions

- The service connection's identity needs **Get** and **List** on secrets (access policy) or the RBAC role **Key Vault Secrets User**.
- Prefer **Azure RBAC** model for Key Vault, and a **private endpoint** where required.

---

## A16. Useful Pipeline Patterns

### Caching

```yaml
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    restoreKeys: |
      npm | "$(Agent.OS)"
    path: $(Pipeline.Workspace)/.npm
```

### Matrix strategy (parallel variations)

```yaml
strategy:
  matrix:
    linux:
      imageName: ubuntu-latest
    windows:
      imageName: windows-latest
pool:
  vmImage: $(imageName)
```

### Parallelism

```yaml
strategy:
  parallel: 4
```

### Container job

```yaml
container: node:20
steps:
- script: node --version
```

### Timeouts and retries

```yaml
- job: Build
  timeoutInMinutes: 30
  steps:
  - task: AzureCLI@2
    retryCountOnTaskFailure: 2
```

### Typical security/quality stages (DevSecOps)

```text
Code → SAST (SonarQube) → Dependency scan → Container scan (Trivy) → IaC scan → Build → Deploy
```

### Best practices

- Use **YAML**, **templates** and **multi-stage** pipelines.
- **Build once, deploy many**. Pin versions of tasks, images and templates.
- Protect `main` with **PR validation** and **branch policies**.
- **No secrets in YAML**. Use Key Vault and **WIF**.
- **Least privilege** service connections, one per environment.
- **Environments** with approvals/checks for production.
- Set **timeouts**, use **caching**, and keep pipelines fast.
- Fail fast: lint and unit tests first.
- Use meaningful `displayName`s and publish test results.

---

## A17. Complete Examples

### Multi-stage pipeline (corrected, interview level)

```yaml
trigger:
  branches:
    include: [ main ]
  paths:
    exclude: [ docs/* ]

variables:
  appName: payment-api

pool:
  vmImage: ubuntu-latest

stages:

# ------------------------------ BUILD ------------------------------
- stage: Build
  jobs:
  - job: Build
    steps:
    - checkout: self

    - script: |
        echo "Building $(appName) ($(Build.BuildNumber))"
        mkdir -p $(Build.ArtifactStagingDirectory)
        echo "app build" > $(Build.ArtifactStagingDirectory)/app.txt
      displayName: Build

    - script: echo "Running unit tests"
      displayName: Unit tests

    - publish: $(Build.ArtifactStagingDirectory)
      artifact: drop

# ------------------------------ TEST -------------------------------
- stage: Test
  dependsOn: Build
  jobs:
  - job: IntegrationTests
    steps:
    - script: echo "Running integration tests"

# ------------------------------ DEV --------------------------------
- stage: DeployDev
  dependsOn: Test
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployDev
    environment: dev
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Deploying $(appName) from $(Pipeline.Workspace)/drop"

# ------------------------------ PROD -------------------------------
- stage: DeployProd
  dependsOn: DeployDev
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployProd
    environment: prod            # approval/checks configured on this environment
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Deploying to production"
```

> The `pr:` trigger from many tutorials is intentionally omitted: for **Azure Repos Git**, PR validation comes from **branch policy build validation**.

### Parameterized pipeline

```yaml
parameters:
- name: environment
  type: string
  default: dev
  values: [ dev, qa, prod ]
- name: runTests
  type: boolean
  default: true

stages:
- stage: Build
  jobs:
  - job: Build
    steps:
    - ${{ if eq(parameters.runTests, true) }}:
      - script: echo "Running tests"
    - script: echo "Environment: ${{ parameters.environment }}"

- stage: Deploy
  dependsOn: Build
  jobs:
  - deployment: Deploy
    environment: ${{ parameters.environment }}
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Deploying to ${{ parameters.environment }}"
```

### Hierarchy to remember

```text
Pipeline
│
├── trigger / schedules
├── variables
├── parameters
│
└── stages
      ├── stage
      │     └── jobs
      │           └── steps
      │                 ├── script
      │                 └── task
      └── stage
```

---

## A18. Complete CI/CD Architecture

```text
                         Azure DevOps
                              │
                    ┌─────────┴─────────┐
                 Azure Repos          Pipeline
                    │                   │
                    │             Variables / Parameters
                    └──────► Trigger    │
                                  ▼
                               Build ── Agent ── Compile / Test
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
                   Workload Identity Federation
                                  ▼
                            Entra ID
                                  ▼
                             Azure RBAC
                                  ▼
                          Azure Resource / AKS
```

**Containerized app flow:**

```text
Git → PR validation → Build → Test → SonarQube → Docker build → Trivy scan
    → Push to ACR → Deploy DEV (AKS) → Smoke test → QA → Approval → PROD
```

---

## A19. Command Cheat Sheet

> Verify flags with `az pipelines --help`.

### Pipelines

```bash
az extension add --name azure-devops
az devops configure --defaults organization=https://dev.azure.com/<org> project=<project>

az pipelines create --name payment-ci --repository payment-api \
  --repository-type tfsgit --branch main --yml-path azure-pipelines.yml
az pipelines list -o table
az pipelines show --name payment-ci

# Run with parameters/variables
az pipelines run --name payment-ci --branch main \
  --parameters environment=qa runTests=true \
  --variables appName=payment-api

az pipelines runs list -o table
az pipelines runs show --id <run-id>
```

### Pipeline variables and variable groups

```bash
az pipelines variable create --pipeline-name payment-ci --name appName --value payment-api
az pipelines variable create --pipeline-name payment-ci --name DB_PASSWORD --secret true --value '<value>'
az pipelines variable list --pipeline-name payment-ci -o table

az pipelines variable-group create --name payment-dev \
  --variables env=dev appName=payment-api --authorize true
az pipelines variable-group list -o table
```

### Agents and pools

```bash
az pipelines pool list -o table
az pipelines agent list --pool-id <pool-id> -o table
```

### Service connections

```bash
az devops service-endpoint list -o table
az devops service-endpoint show --id <id>
```

### Self-hosted agent (Linux service)

```bash
./config.sh --unattended --url https://dev.azure.com/<org> --auth pat --token <PAT> \
  --pool MyLinuxPool --agent agent-01 --acceptTeeEula
sudo ./svc.sh install && sudo ./svc.sh start
sudo ./svc.sh status
./run.sh                 # run interactively (for testing)
```

### Debugging a pipeline

```text
Run pipeline → check "Enable system diagnostics"     (or variable: system.debug = true)
```

```yaml
- script: |
    echo "##[error]Something failed"
    echo "##[warning]Be careful"
    echo "##vso[task.logissue type=error]Custom error"
```

```bash
# useful inside a step to inspect the agent
printenv | sort
pwd && ls -la
df -h
```

---

## A20. Hands-On Lab

| # | Task |
| --- | --- |
| 1 | Create a repo with a simple app and `azure-pipelines.yml` ("Hello" pipeline) |
| 2 | Convert to **multi-stage**: Build → Test → Deploy |
| 3 | Add **variables**, a **variable group**, and a **secret** (map it with `env:`) |
| 4 | Add **parameters** (`environment`, `runTests`) and run with different values |
| 5 | Add **conditions** (`always()` cleanup, deploy only from `main`) |
| 6 | Publish and consume an **artifact** (`publish` / deployment job) |
| 7 | Refactor deploy into a **template** and reuse for DEV and PROD |
| 8 | Create **environments** `dev` and `prod`. Add an **approval** to `prod` |
| 9 | Add **branch policy build validation** to `main`, and test a PR |
| 10 | Create a **self-hosted agent** (VM/WSL) in a new pool and run a job on it |
| 11 | Create an **ARM service connection** with **workload identity federation**, scoped to one resource group |
| 12 | Use `AzureCLI@2` to run `az group show` with that connection |
| 13 | Build and push a Docker image to **ACR** |
| 14 | Deploy to **AKS** and run a smoke test |
| 15 | Pull a secret from **Key Vault** with `AzureKeyVault@2` |
| 16 | **Break/fix drills** (see below) |

**Break/fix drills:**

| Break | Symptom | Fix |
| --- | --- | --- |
| Remove the RBAC role from the identity | `AuthorizationFailed` | Re-add the minimum role |
| Don't authorize the pipeline for the service connection | "needs permission to access a resource" | Authorize it |
| Add a demand no agent satisfies | Job stays queued | Fix demand/capability |
| Typo in the environment name | New environment auto-created, no approval | Create/fix the environment |
| `condition:` without `succeeded()` | Stage runs after a failure | Use `and(succeeded(), ...)` |
| Rename the service connection (WIF) | `AADSTS70021` (subject mismatch) | Update the federated credential subject |

---

## A21. Troubleshooting

### Pipeline not starting

```text
1. YAML syntax valid?       (Validate / Preview in the editor)
        ↓
2. Pipeline enabled / not paused?
        ↓
3. CI trigger defined?       (trigger: none disables it)
        ↓
4. Correct branch?           (branch filters)
        ↓
5. Path filters match the changed files?
        ↓
6. PR validation configured?  (for Azure Repos: branch policy, not `pr:`)
        ↓
7. Repository connection / permissions OK?
```

### Job waiting for an agent

```text
Job → Agent Pool → Available agent? → Agent online? → Required capability? → Demands satisfied?
```

- No matching agent → job stays **queued**.
- *"No hosted parallelism has been purchased or granted"* → request a free grant or buy parallel jobs.
- Self-hosted agent **offline** → service stopped, VM down, PAT/auth problem, network/proxy.
- All agents busy → add agents / use VMSS.

### Deployment authentication failed

```text
Pipeline → Service Connection → Is the connection authorized for this pipeline?
        → Authentication method → Federation / identity configuration
        → Entra ID → Azure RBAC → Target resource
```

```text
Authentication succeeded BUT RBAC permission missing
→ Identity valid, authorization insufficient
```

| Error | Meaning / fix |
| --- | --- |
| *Pipeline needs permission to access a resource* | Click **Permit** / authorize the connection for the pipeline |
| `AADSTS70021: No matching federated identity record found` | WIF subject/issuer mismatch (connection or project renamed). Fix the federated credential |
| `AADSTS7000222` / secret expired | Client-secret service principal expired. Rotate, or move to **WIF** |
| `AuthorizationFailed` | Identity lacks the Azure RBAC role at that scope |
| *Could not find service connection* | Wrong name, or wrong project |
| Key Vault `Forbidden` | No Get/List (or *Secrets User* role), or Key Vault firewall blocks the agent |
| Can't reach a private resource | Microsoft-hosted agent has no private network access. Use a **self-hosted agent in the VNet** |

### Production deployment doesn't start

```text
Build → Artifact → Deployment stage → Condition → Environment → Approval → Checks → Permission
```

Waiting because of: **approval pending**, **environment check failed** (branch control, business hours, exclusive lock), **pipeline not authorized** for the environment, or the stage **condition** evaluated to false.

### Other common problems

| Problem | Likely cause |
| --- | --- |
| Variable shows as literal `$(var)` | Variable undefined, or wrong scope/name, or used where macros aren't expanded |
| Secret is empty in a script | Not mapped through `env:` |
| Template expression can't see a variable | `${{ }}` runs at compile time, so it can't see runtime values |
| Stage runs after a failure | Custom `condition` missing `succeeded()` |
| Stages not parallel | Stages are sequential by default. Use `dependsOn: []` |
| Artifact not found in a job | Regular jobs must `download` the artifact. Deployment jobs auto-download |
| PR pipeline doesn't trigger | Azure Repos uses **branch policy build validation**, not `pr:` |
| Deploy rebuilt a different binary | Violates build-once. Promote the same artifact/image |
| Task version warnings | Pin task majors, update deprecated tasks |
| Push/tag from pipeline fails | Grant the build service identity Contribute/Create tag, or use `System.AccessToken` correctly |
| Pipeline slow | No caching, large checkout (`fetchDepth`), sequential jobs, undersized agent |

---

## A22. Interview Questions & Answers

### Azure Pipelines

1. **What is Azure Pipelines?** A CI/CD service that automatically builds, tests and deploys applications.
2. **What is a stage?** A logical boundary in a pipeline (Build, Test, DEV, PROD) that runs sequentially by default and can have conditions and approvals.
3. **Stage vs job?** A stage contains jobs. Stages run in sequence by default, jobs in a stage run in parallel by default.
4. **Job vs step?** A job is a group of steps that run on one agent. A step is one action (script/task) inside it.
5. **Task vs script?** A task is a reusable, versioned, predefined action. A script is your own commands.
6. **What is a pipeline trigger?** The rule that starts a pipeline automatically (push, schedule, other pipeline).
7. **CI trigger vs PR validation?** CI runs when code is pushed. PR validation runs when code is proposed for merge. For Azure Repos it's configured via branch policy build validation.
8. **What is a pipeline artifact?** Build output stored and passed to later stages/pipelines for deployment.
9. **What are templates?** Reusable YAML (steps/jobs/stages/variables) to standardize pipelines and avoid duplication.
10. **What is `dependsOn`?** It defines ordering between stages/jobs (and enables fan-out/fan-in). `dependsOn: []` removes dependency.
11. **What are conditions?** Expressions that decide whether a stage/job/step runs. The default is `succeeded()`.
12. **`succeeded()`, `failed()`, `always()`?** Run if all dependencies succeeded / if one failed / always (even if canceled, so good for cleanup).

### Variables

13. **What are pipeline variables?** Named values used across the pipeline, referenced like `$(name)`.
14. **Variable vs parameter?** A variable is a runtime configuration value. A parameter is a typed pipeline/template input evaluated at compile time that can change the pipeline's structure.
15. **What is a variable group?** A shared set of variables in the Library, reusable across pipelines, with security and optional Key Vault linking.
16. **How do you handle secrets?** Secret variables, secret variable groups or Key Vault. Never in YAML. Map them via `env:` and don't print them.
17. **How would you integrate Key Vault?** `AzureKeyVault@2` task or a Key Vault-linked variable group, using a service connection with Get/List (or *Key Vault Secrets User*).
18. **What are runtime variables?** Values supplied or set when a pipeline runs (queue-time variables, output variables from tasks).
19. **`$(var)` vs `${{ }}` vs `$[ ]`?** `$(var)` = macro at runtime before a task runs. `${{ }}` = template expression at compile time. `$[ ]` = runtime expression, used for conditions and computed values.

### Environments

20. **What is an Environment?** A deployment target/boundary (DEV, QA, PROD) that gives deployment history, permissions, approvals and checks.
21. **What is a deployment job?** A special job that deploys to an environment, auto-downloads artifacts and supports strategies (runOnce, rolling, canary).
22. **How do you protect production?** Environment approvals and checks, restricted permissions, a separate protected service connection, branch control and branch policies.
23. **What are approvals?** A manual sign-off by named users/groups before a deployment proceeds.
24. **What are checks?** Automated gates: branch control, business hours, exclusive lock, required template, REST/Azure Function, Azure Monitor alerts.
25. **How do environment permissions work?** Roles (Administrator, User, Creator, Reader) control who can use or manage the environment, giving separation of duties.

### Agents

26. **What is an agent?** The machine that runs a pipeline's jobs.
27. **Microsoft-hosted vs self-hosted?** Microsoft-hosted: Microsoft manages a fresh VM per job. Self-hosted: you manage it and can access private networks and custom tools.
28. **What is an agent pool?** A collection of agents. Jobs queue to a pool.
29. **What are capabilities?** Properties of an agent (OS, installed tools).
30. **What are demands?** Requirements a job places on an agent. A job runs only on agents with matching capabilities.
31. **How do you register a self-hosted agent?** Create a pool, download the agent, run `config.sh` with URL, pool and auth, then install it as a service.
32. **How do you secure self-hosted agents?** Patch, least privilege, no stored secrets, restricted network, separate prod pools, ephemeral agents, restrict who can use the pool, no untrusted/fork pipelines.

### Service connections

33. **What is a service connection?** An authenticated connection from Azure DevOps to an external service so pipelines can use it.
34. **What is an ARM service connection?** A service connection that lets pipelines manage Azure resources in a subscription/resource group via Entra ID.
35. **What is a service principal?** An application identity in Entra ID that can be assigned RBAC roles.
36. **What is workload identity federation?** OIDC-based trust that lets a pipeline get a short-lived Entra token without a stored client secret.
37. **WIF vs client secret?** WIF has no stored secret and short-lived tokens. A client secret is long-lived, must be rotated and can leak or expire.
38. **What is a managed identity?** An Azure-managed identity for an Azure resource so it can access other resources without stored credentials. It's different from WIF, which serves external workloads.
39. **Authentication vs authorization?** Authentication = who you are (Entra ID). Authorization = what you can do (Azure RBAC).
40. **How do you implement least privilege?** A dedicated identity per environment, a minimum RBAC role at the narrowest scope, no "all pipelines" access, and approvals/checks on the production connection.

### Extra

41. **Why can't I use `pr:` in Azure Repos?** For Azure Repos Git, PR validation is configured in branch policies (build validation). `pr:` applies to GitHub/Bitbucket.
42. **Why is my secret empty in a script?** Secrets aren't exposed as environment variables automatically. Map with `env:`.
43. **What is "build once, deploy many"?** Build one immutable artifact/image and promote it through environments, only changing configuration.
44. **How do you reuse pipeline logic across teams?** Shared template repo, versioned/tagged, optionally enforced with `extends` and a required template check.
45. **How do you reach a private AKS/database from a pipeline?** A self-hosted or VMSS/Managed DevOps agent inside the VNet (or with private connectivity).

---

## A23. Final Memory Map

```text
                    AZURE PIPELINES
                          │
             ┌────────────┼─────────────┐
          Trigger      Variables     Parameters
             └────────────┼─────────────┘
                          ▼
                       STAGE → JOB → STEP → TASK / SCRIPT
                          ▼
                        AGENT
                          ▼
                       ARTIFACT
                          ▼
                 ┌────────┴────────┐
                DEV               QA
                                   │
                              Approval/Checks
                                   ▼
                                  PROD
                                   ▼
                         Service Connection
                                   ▼
                         Workload Identity Federation
                                   ▼
                              Entra ID → Azure RBAC → Azure / AKS / VM
```

### 🔴 15 things to memorize first

```text
1. Pipeline → Stage → Job → Step → Task
2. CI trigger
3. PR validation (Azure Repos = branch policy, not pr:)
4. Variables
5. Variable groups
6. Parameters
7. Secret variables (map with env:)
8. $(var) vs ${{ }} vs $[ ]
9. Conditions (custom condition replaces succeeded())
10. dependsOn (stages sequential, jobs parallel)
11. Artifacts + build once, deploy many
12. Environments + approvals/checks
13. Microsoft-hosted vs self-hosted agents
14. Agent pools / capabilities / demands
15. Service Connection + WIF + Entra ID + RBAC
```

### ⭐ Most important mental model

> **Agent = where the pipeline runs. Service Connection = how the pipeline authenticates. Environment = where and under what controls the deployment happens. Artifact = what gets promoted. Variable = configuration. Parameter = pipeline input/structure.**

### ⭐ Senior-level answer: *"How would you design a secure Azure DevOps CI/CD pipeline?"*

> **I would keep the source in Azure Repos with protected branches and PR validation, and use a multi-stage YAML pipeline that builds, tests and runs security checks, publishes an immutable artifact (or image to ACR), and promotes that same artifact through DEV, QA and PROD. I'd use templates, ideally shared and versioned with `extends`, for reusable logic, variable groups for configuration, and Key Vault for secrets, never storing secrets in YAML. Deployments go through Azure DevOps Environments with approvals and checks. For Azure access I'd use a service connection with workload identity federation instead of a client secret, scoped to the minimum Azure RBAC role per environment, and I'd use self-hosted agents inside the VNet only when private network access is required, kept ephemeral and locked down.**

---

# PART B: Azure DevOps & Azure Pipelines — Complete Interview Notes

(Fundamentals through production-level concepts, told with analogies, interview phrasing, and explicit "don't say this / say this instead" guidance. Some topics overlap with Part A — read Part A for the detailed reference tables, and Part B for how to phrase answers out loud.)

## B1. Azure DevOps — What is it?

### Definition

**Azure DevOps** is Microsoft's DevOps platform used to implement the complete software delivery lifecycle:

```text
Plan
  ↓
Code
  ↓
Build
  ↓
Test
  ↓
Security
  ↓
Package
  ↓
Deploy
  ↓
Monitor
```

### Major Azure DevOps services

| Service | Purpose |
|---|---|
| Azure Boards | Work items, bugs, stories, sprint planning |
| Azure Repos | Git repositories |
| Azure Pipelines | CI/CD |
| Azure Test Plans | Testing |
| Azure Artifacts | Package/artifact management |

### Interview answer

> "Azure DevOps is a Microsoft DevOps platform that provides services for planning, source-code management, CI/CD, testing and artifact management. In my DevOps role, the most relevant components are Azure Repos and Azure Pipelines for source control and automated CI/CD."

---

## B2. Azure Pipeline

### What is Azure Pipeline?

Azure Pipelines is the **CI/CD engine** of Azure DevOps.

It automates:

```text
Developer
   ↓
Git Push
   ↓
Pipeline Trigger
   ↓
Build
   ↓
Test
   ↓
Security Scan
   ↓
Artifact / Docker Image
   ↓
Deploy
```

### CI

Continuous Integration means:

> Automatically build and test code whenever developers make changes.

### CD

Continuous Delivery/Deployment means:

> Automatically or semi-automatically deploy the validated application to environments.

---

## B3. Azure Pipeline Architecture

```text
                         Azure DevOps
                              |
                +-------------+-------------+
                |                           |
          Azure Repos                  Azure Pipelines
                |                           |
             Git Push                      |
                |                           |
                +---------- Trigger --------+
                              |
                         YAML Pipeline
                              |
          +-------------------+-------------------+
          |                   |                   |
       Variables          Resources            Parameters
          |                   |                   |
          +-------------------+-------------------+
                              |
                           Stages
                              |
                    +---------+---------+
                    |                   |
                  Build               Test
                    |                   |
                  Jobs                Jobs
                    |                   |
                 Steps               Steps
                    |                   |
             +------+-----+       +-----+------+
             |            |       |            |
           Task         Script   Task        Script
                              |
                            Agent
                              |
                       Self-hosted VM
                              |
                +-------------+-------------+
                |             |             |
              Docker      Terraform      kubectl
```

### Most important hierarchy

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

### Important interview correction

**Agent is NOT another level in the hierarchy.**

The agent is the machine/environment where the job executes.

```text
Job
 ↓
Pool
 ↓
Agent
```

---

## B4. YAML Pipeline

Azure Pipelines can be defined as code using YAML.

Example:

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

stages:

- stage: Build

  jobs:

  - job: BuildApplication

    steps:

    - script: |
        echo "Building application"
        echo "Running tests"
```

### Why YAML?

Because pipeline configuration becomes:

- version controlled
- reviewable
- reusable
- auditable
- easy to reproduce

### Interview answer

> "I prefer YAML pipelines because pipeline configuration is treated as code. We can version it with Git, review changes through pull requests, reuse templates and maintain multi-stage CI/CD pipelines."

---

## B5. Classic Pipeline vs YAML Pipeline

### Classic

Configured through UI.

```text
Azure DevOps UI
      ↓
Build configuration
      ↓
Release configuration
```

### YAML

Configuration stored in repository.

```text
Git
 ↓
azure-pipelines.yml
 ↓
Pipeline
```

### YAML advantages

- Git versioning
- PR review
- templates
- reusable pipelines
- infrastructure-as-code approach
- easier auditing

### Interview recommendation

If asked:

> Which one do you prefer?

Say:

> "For new implementations, I prefer YAML pipelines because pipeline configuration is version controlled and can be reviewed like application code."

### Avoid saying

❌ "Classic pipelines are useless."

Instead:

> "Classic pipelines can still exist in legacy environments, but for new implementations I generally prefer YAML."

---

## B6. Trigger

A trigger determines:

> **When should the pipeline start?**

### CI trigger

```yaml
trigger:
- main
```

Meaning:

```text
Developer
   ↓
Push to main
   ↓
Pipeline starts
```

### Multiple branches

```yaml
trigger:
  branches:
    include:
    - main
    - develop
```

### Exclude branch

```yaml
trigger:
  branches:
    exclude:
    - feature/*
```

### Path trigger

Only run pipeline when specific files change.

```yaml
trigger:
  paths:
    include:
    - application/*
```

Example:

```text
application/
    app.py

documentation/
    README.md
```

Changing README doesn't need application build.

### PR trigger

Conceptually:

```text
Feature branch
     ↓
Pull Request
     ↓
Validation pipeline
     ↓
Build + Test + Security
     ↓
Merge
```

Example syntax where supported:

```yaml
pr:
- main
```

### Important interview nuance

Don't blindly say:

> "`pr:` works the same way for every Git provider."

Trigger behavior depends on the repository/provider configuration. (See Part A, Section A4 — for **Azure Repos Git**, PR validation is configured through **branch policy build validation**, not `pr:`.)

---

## B7. Scheduled Trigger

Example:

```yaml
schedules:
- cron: "0 2 * * *"
  displayName: Nightly Build
  branches:
    include:
    - main
```

Useful for:

- nightly security scans
- dependency checks
- scheduled tests
- maintenance jobs

---

## B8. Pipeline Completion Trigger

One pipeline can start after another pipeline completes.

Architecture:

```text
Build Pipeline
      ↓
Build artifact
      ↓
Deployment Pipeline
```

This is commonly handled through **pipeline resources**.

---

## B9. Resources

## What are resources?

Resources are external things that the pipeline consumes or depends on.

Examples:

```text
Resources
   |
   +-- Pipelines
   |
   +-- Repositories
   |
   +-- Containers
   |
   +-- Packages
```

Example:

```yaml
resources:
  pipelines:
  - pipeline: appBuild
    source: Application-Build
```

Meaning:

> This pipeline consumes another pipeline's output.

### Repository resource

```yaml
resources:
  repositories:
  - repository: templates
    type: git
    name: DevOps/SharedTemplates
```

Useful for centralized templates.

### Container resource

Conceptually:

```yaml
resources:
  containers:
  - container: mycontainer
    image: myregistry/myapp:latest
```

---

## B10. Variables

Variables store values that can change.

Example:

```yaml
variables:
  appName: myapp
  environment: dev
```

Use:

```yaml
- script: |
    echo "Application: $(appName)"
    echo "Environment: $(environment)"
```

---

## B11. Why variables?

Instead of:

```yaml
docker build -t myapp:dev .
```

Use:

```yaml
variables:
  imageName: myapp
  environment: dev
```

Then:

```yaml
docker build -t $(imageName):$(environment) .
```

Benefits:

- easier maintenance
- environment-specific configuration
- reusable pipeline

---

## B12. Types of Variables

### YAML variables

```yaml
variables:
  appName: myapp
```

### UI variables

Configured in Azure DevOps.

### Variable groups

Centralized variables.

Example concept:

```text
Variable Group
      |
      +-- dev configuration
      +-- QA configuration
      +-- common configuration
```

### Secret variables

Used for sensitive values.

Example:

```text
DB_PASSWORD
API_TOKEN
```

### Important

Don't put secrets directly in YAML.

❌ Bad:

```yaml
variables:
  password: MyPassword123
```

Better:

```text
Secret Store
     ↓
Variable / Secret integration
     ↓
Pipeline
```

For production, use Azure Key Vault or another appropriate secret-management solution.

---

## B13. Variables vs Parameters

This is a common interview question.

### Variables

Generally runtime/configuration values.

```yaml
variables:
  environment: dev
```

Use:

```yaml
$(environment)
```

### Parameters

Used more for pipeline structure and compile-time choices.

Conceptually:

```yaml
parameters:
- name: environment
  type: string
  default: dev
```

Use:

```yaml
${{ parameters.environment }}
```

### Memory trick

```text
Parameter → Pipeline design/choice
Variable  → Runtime/configuration value
```

---

## B14. Agent

An agent is the machine that executes pipeline jobs.

Example:

```text
Azure Pipeline
      ↓
Job
      ↓
Agent
      ↓
Commands execute here
```

---

## B15. Microsoft-hosted Agent

Example:

```yaml
pool:
  vmImage: ubuntu-latest
```

Microsoft provides the VM.

Advantages:

- no VM management
- clean environment
- easy setup
- common tools already available

---

## B16. Self-hosted Agent

You manage the machine.

Architecture:

```text
Azure DevOps
      |
  Agent Pool
      |
Self-hosted Agent
      |
Ubuntu VM
      |
+-----+------+-------+-------+
|            |       |       |
Docker   Terraform kubectl Helm
```

Useful when:

- private network access is required
- custom software is required
- special tools are needed
- internal infrastructure must be accessed
- compliance requires controlled build infrastructure

---

## B17. Self-hosted Agent Setup

Typical flow:

```text
Azure DevOps
    ↓
Organization Settings
    ↓
Agent Pools
    ↓
Create Pool
    ↓
Add Agent
    ↓
Download Agent
    ↓
Configure Agent
    ↓
Install as Service
    ↓
Start Agent
    ↓
Agent becomes Online
```

Typical Linux configuration commands:

```bash
./config.sh
```

Then:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Pipeline:

```yaml
pool:
  name: my-linux-agents
```

Test:

```yaml
steps:
- script: |
    hostname
    uname -a
    docker --version
    terraform version
```

---

## B18. Do we need to install tools on Self-hosted Agent?

### YES.

This is very important.

If pipeline executes:

```bash
docker build .
```

the agent needs Docker.

If:

```bash
terraform plan
```

the agent needs Terraform.

If:

```bash
kubectl get pods
```

the agent needs kubectl.

Typical DevOps self-hosted agent:

```text
Ubuntu VM
│
├── Azure DevOps Agent
├── Git
├── Docker
├── Terraform
├── kubectl
├── Helm
├── Azure CLI
├── Python
├── Node.js
└── Security tools
```

Otherwise:

```text
terraform: command not found
```

or:

```text
docker: command not found
```

### Interview answer

> "With self-hosted agents, we are responsible for maintaining the required toolchain, OS patches, security and agent health. With Microsoft-hosted agents, Microsoft manages the underlying VM and provides a predefined software environment."

---

## B19. Golden Image — Production Best Practice

Instead of manually installing tools on every agent:

```text
Golden VM Image
       |
       +-- Git
       +-- Docker
       +-- Terraform
       +-- kubectl
       +-- Helm
       +-- Azure CLI
       |
       ↓
Self-hosted agents
```

This gives consistency.

For larger organizations, ephemeral agents are also useful:

```text
Job starts
   ↓
Fresh agent
   ↓
Build
   ↓
Test
   ↓
Destroy agent
```

Benefits:

- clean environment
- less contamination
- better isolation
- reproducibility

---

## B20. Stage

Stage represents a major phase of pipeline execution.

Example:

```text
Build
  ↓
Test
  ↓
Security
  ↓
Deploy-Dev
  ↓
Deploy-QA
  ↓
Deploy-Prod
```

YAML:

```yaml
stages:

- stage: Build

- stage: Test

- stage: Security

- stage: DeployDev

- stage: DeployProd
```

---

## B21. Job

A job is a group of steps executed together on an agent.

```text
Stage
  ↓
Job
  ↓
Steps
```

Example:

```yaml
jobs:

- job: Build
  steps:

  - script: echo "Build"

  - script: echo "Test"
```

Multiple jobs can run in parallel.

```text
            Stage
              |
       +------+------+
       |             |
    Job A          Job B
       |             |
    Tests         Security
```

---

## B22. Step

A step is an individual operation.

Example:

```yaml
steps:

- script: echo "Install"

- script: echo "Build"

- script: echo "Test"
```

---

## B23. Task

A task is a predefined Azure Pipelines action.

Examples:

```yaml
- task: Docker@2
```

```yaml
- task: AzureCLI@2
```

```yaml
- task: KubernetesManifest@1
```

Tasks simplify common operations.

---

## B24. Script

A script executes shell commands.

Example:

```yaml
- script: |
    echo "Hello"
    docker --version
    terraform version
```

Linux-specific:

```yaml
- bash: |
    echo "Running Bash"
```

PowerShell:

```yaml
- powershell: |
    Write-Host "Running PowerShell"
```

---

## B25. Task vs Script

Very important interview question.

### Task

```yaml
- task: Docker@2
  inputs:
    command: build
    repository: myapp
    Dockerfile: Dockerfile
```

### Script

```yaml
- script: |
    docker build -t myapp .
```

### Task advantages

- standardized
- Azure DevOps integration
- easier configuration
- service connection integration
- less custom scripting

### Script advantages

- maximum CLI flexibility
- custom logic
- useful when no suitable built-in task exists

### Best interview answer

> "I prefer a built-in task when it provides the functionality I need because it gives standardized Azure DevOps integration. I use scripts when I need custom CLI logic or when an appropriate task is unavailable."

### Don't say

❌ "Tasks are always better."

or

❌ "Scripts are always better."

---

## B26. Docker@2

Example:

```yaml
- task: Docker@2
  inputs:
    command: build
    repository: myapp
    Dockerfile: '**/Dockerfile'
    tags: |
      $(Build.BuildId)
```

Docker workflow:

```text
Source Code
    ↓
Dockerfile
    ↓
Docker Build
    ↓
Docker Image
    ↓
Security Scan
    ↓
Registry
```

---

## B27. Docker Build using Script

```yaml
- script: |
    docker build \
      -t myapp:$(Build.BuildId) \
      .
```

Push:

```bash
docker push myregistry/myapp:123
```

---

## B28. Build Once, Deploy Many

One of the most important DevOps principles.

Bad approach:

```text
Build DEV
   ↓
Build QA
   ↓
Build PROD
```

Potential problem:

Different builds can produce different artifacts.

Better:

```text
             Build
               |
          Docker Image
               |
        Security Scan
               |
          Same Artifact
          /     |      \
       DEV      QA      PROD
```

Example:

```text
myapp:1.25
```

Same image should move through environments.

### Interview answer

> "I prefer build-once-deploy-many because the exact artifact tested in lower environments should be promoted to production rather than rebuilding it separately."

---

## B29. dependsOn

Controls execution dependency.

Example:

```yaml
- stage: Test
  dependsOn: Build
```

Means:

```text
Build
  ↓
Test
```

Multiple dependencies:

```yaml
- stage: Deploy
  dependsOn:
  - Build
  - Security
  - Test
```

Architecture:

```text
Build ─────┐
           |
Test ──────┼──→ Deploy
           |
Security ──┘
```

---

## B30. Conditions

Dependencies answer:

> What must complete first?

Conditions answer:

> Under what condition should this execute?

Example:

```yaml
condition: succeeded()
```

Common concepts:

```text
succeeded()
failed()
always()
succeededOrFailed()
```

Example:

```yaml
- script: echo "Cleanup"
  condition: always()
```

Useful for:

- cleanup
- notifications
- failure handling

---

## B31. Pipeline Flow Example

A real-world DevOps pipeline:

```text
Developer
   |
   | git push
   ↓
Azure Repos
   |
   ↓
Trigger
   |
   ↓
Build Stage
   |
   +--> Checkout
   +--> Install dependencies
   +--> Build
   |
   ↓
Test Stage
   |
   +--> Unit Test
   +--> Integration Test
   |
   ↓
Security Stage
   |
   +--> SAST
   +--> Dependency Scan
   +--> Secret Scan
   +--> Container Scan
   |
   ↓
Artifact
   |
   ↓
Deploy DEV
   |
   ↓
Validation
   |
   ↓
Approval
   |
   ↓
Deploy QA
   |
   ↓
Approval
   |
   ↓
Deploy PROD
```

---

## B32. Service Connection

Very important interview topic.

### What is it?

A service connection provides authenticated access from Azure DevOps to an external service/resource.

Architecture:

```text
Azure Pipeline
      |
      ↓
Service Connection
      |
      ↓
Authentication
      |
      ↓
Azure / ACR / Kubernetes / Other Resource
```

---

## B33. Why Service Connection?

Without proper authentication:

```text
Pipeline
   ↓
?????
   ↓
Azure
```

With service connection:

```text
Pipeline
   ↓
Service Connection
   ↓
Secure Authentication
   ↓
Azure Resource
```

---

## B34. Don't hardcode credentials

Bad:

```yaml
- script: |
    az login \
      --username admin \
      --password MyPassword
```

Never do this.

Better:

```text
Pipeline
   ↓
Service Connection
   ↓
Federated/service authentication
   ↓
Azure
```

Use least privilege.

---

## B35. Modern Authentication

For supported scenarios, prefer **workload identity federation/OIDC** rather than long-lived client secrets.

Concept:

```text
Azure DevOps
     ↓
Short-lived identity/token
     ↓
Azure
```

Instead of:

```text
Azure DevOps
     ↓
Long-lived secret
     ↓
Azure
```

### Interview answer

> "I prefer workload identity federation where supported because it avoids storing long-lived client secrets and reduces credential-management risk."

---

## B36. Terraform CI/CD

This is highly relevant to your DevOps profile.

Architecture:

```text
Developer
   ↓
Git
   ↓
Azure Pipeline
   ↓
Security
   |
   +--> Gitleaks
   +--> TFSec
   +--> TFLint
   |
   ↓
Terraform
   |
   +--> fmt
   +--> init
   +--> validate
   +--> plan
   |
   ↓
Review / Approval
   ↓
terraform apply
```

---

## B37. Terraform Commands

Formatting:

```bash
terraform fmt -check
```

Initialization:

```bash
terraform init
```

Validation:

```bash
terraform validate
```

Plan:

```bash
terraform plan
```

Apply:

```bash
terraform apply
```

Destroy:

```bash
terraform destroy
```

---

## B38. Terraform YAML Example

```yaml
stages:

- stage: Validate

  jobs:
  - job: TerraformValidate

    steps:

    - script: terraform fmt -check

    - script: terraform init

    - script: terraform validate


- stage: Plan

  dependsOn: Validate

  jobs:
  - job: TerraformPlan

    steps:

    - script: terraform plan


- stage: Apply

  dependsOn: Plan

  jobs:
  - job: TerraformApply

    steps:

    - script: terraform apply
```

### Production improvement

Don't blindly use:

```bash
terraform apply -auto-approve
```

for production.

Prefer:

```text
Plan
 ↓
Review
 ↓
Approval
 ↓
Apply
```

---

## B39. DevSecOps Pipeline

A strong interview architecture:

```text
                 Git Push
                    |
                    ↓
             Secret Scanning
                Gitleaks
                    |
                    ↓
              IaC Security
                 TFSec
                    |
                    ↓
              TFLint
                    |
                    ↓
          Terraform fmt/validate
                    |
                    ↓
               Terraform Plan
                    |
                    ↓
              PR Review
                    |
                    ↓
            Manual Approval
                    |
                    ↓
             Terraform Apply
```

### Why security early?

Because:

```text
Early detection = cheaper fix
Late detection = expensive fix
```

---

## B40. Branch Protection

Production repository should not allow:

```text
Developer
    |
    +------ direct push ------> main
```

Better:

```text
Developer
    ↓
Feature Branch
    ↓
Pull Request
    ↓
Code Review
    ↓
Build Validation
    ↓
Security Scan
    ↓
Approval
    ↓
Merge main
```

Typical branch policies:

- PR required
- reviewer approval
- build validation
- no direct push
- linked work item if required
- minimum reviewers
- security checks

---

## B41. Templates

Templates provide reusable pipeline code.

Example:

```text
templates/
   |
   ├── terraform.yml
   ├── docker.yml
   ├── security.yml
   └── deploy.yml
```

Pipeline:

```yaml
steps:
- template: templates/docker.yml
```

---

## B42. Why Templates?

Imagine 20 microservices.

Without templates:

```text
20 YAML files
20 copies of same logic
20 places to maintain
```

With templates:

```text
              Shared Template
                    |
        +-----------+-----------+
        |           |           |
      App1        App2        App3
```

Change once → many pipelines benefit.

### Similar concept from Jenkins

```text
Jenkins
   ↓
Shared Library
```

Azure:

```text
Azure Pipelines
   ↓
YAML Templates
```

---

## B43. Parameterized Pipeline

Instead of separate pipelines:

```text
dev-pipeline.yml
qa-pipeline.yml
prod-pipeline.yml
```

Use one reusable pipeline with parameters.

Concept:

```text
             One Pipeline
                  |
        +---------+---------+
        |         |         |
       DEV       QA       PROD
```

This reduces duplication.

---

## B44. Environment

An environment represents a deployment target.

Examples:

```text
dev
qa
uat
prod
```

Architecture:

```text
Pipeline
   |
   +--> DEV
   |
   +--> QA
   |
   +--> PROD
```

Environments can be associated with deployment controls such as approvals/checks.

---

## B45. Approval

Production deployment should generally have stronger controls.

Example:

```text
Build
 ↓
Test
 ↓
Security
 ↓
Deploy DEV
 ↓
Deploy QA
 ↓
Manual Approval
 ↓
PROD
```

### Interview answer

> "For production, I would separate build validation from deployment authorization and use environment-based approvals/checks rather than allowing an unrestricted production deployment."

---

## B46. Artifacts

Artifacts are outputs produced by the build.

Examples:

```text
JAR
WAR
ZIP
Python package
Docker image
Terraform plan
```

Architecture:

```text
Source
  ↓
Build
  ↓
Artifact
  ↓
Store
  ↓
Deploy
```

---

## B47. Docker Registry / ACR

Typical flow:

```text
Git
 ↓
Pipeline
 ↓
Docker Build
 ↓
Security Scan
 ↓
Azure Container Registry
 ↓
AKS
```

Example concept:

```bash
docker build -t myapp:123 .
docker push registry/myapp:123
```

---

## B48. Kubernetes Deployment

Typical Azure architecture:

```text
Azure DevOps
     |
     ↓
Docker Build
     |
     ↓
ACR
     |
     ↓
AKS
     |
     ↓
Kubernetes Deployment
```

Pipeline may use:

```yaml
- task: KubernetesManifest@1
```

or:

```bash
kubectl apply -f deployment.yaml
```

---

## B49. Helm

Instead of maintaining many raw Kubernetes YAML files:

```text
Helm Chart
   |
   +-- deployment.yaml
   +-- service.yaml
   +-- ingress.yaml
   +-- values.yaml
```

Pipeline:

```text
Build
 ↓
Docker Image
 ↓
Push ACR
 ↓
Helm Upgrade
 ↓
AKS
```

Typical command:

```bash
helm upgrade --install myapp ./helm-chart
```

---

## B50. Conditions vs dependsOn

Remember this distinction.

### dependsOn

Controls dependency.

```yaml
dependsOn: Build
```

Meaning:

```text
Build → Test
```

### condition

Controls whether something executes.

```yaml
condition: succeeded()
```

Meaning:

> Run only if previous dependency succeeded.

---

## B51. Matrix Strategy

Useful when testing multiple versions/platforms.

Concept:

```text
              Test
          /     |     \
       Python3.9  3.10  3.11
```

This allows parallel testing.

Interview point:

> "Matrix strategies are useful when the same job needs to execute against multiple versions or configurations."

---

## B52. Caching

Caching can reduce pipeline execution time.

Example:

```text
First build
   ↓
Download dependencies
   ↓
Cache
```

Next build:

```text
Pipeline
   ↓
Cache hit
   ↓
Faster build
```

Useful for:

- npm
- Maven
- Python packages
- Gradle
- other dependency-heavy builds

---

## B53. Pipeline Performance

If pipeline takes 45 minutes and you need to reduce it:

Look at:

```text
1. Parallel jobs
2. Dependency caching
3. Incremental builds
4. Docker layer caching
5. Smaller Docker images
6. Avoid unnecessary checkout/build
7. Reusable artifacts
8. Faster agents
```

### Interview scenario

> "How would you optimize a slow pipeline?"

Answer:

> "First I would identify the bottleneck using pipeline execution timing. Then I would evaluate parallelization, dependency caching, Docker layer reuse, unnecessary steps, agent performance and artifact reuse rather than blindly increasing compute resources."

---

## B54. Secrets Management

Never:

```yaml
password: admin123
```

Never:

```bash
echo "$PASSWORD"
```

if it risks exposing the secret.

Prefer:

```text
Azure Key Vault
      ↓
Secret
      ↓
Secure pipeline integration
      ↓
Application
```

Also:

- don't print secrets
- don't commit secrets
- don't put credentials in Dockerfiles
- don't put credentials in Git
- rotate credentials
- use least privilege

---

## B55. Security Pipeline

A mature pipeline:

```text
Git Push
   ↓
Gitleaks
   ↓
SAST
   ↓
Dependency Scan
   ↓
IaC Scan
   ↓
Docker Image Scan
   ↓
Build
   ↓
Test
   ↓
Artifact
   ↓
Deploy
```

Potential tools:

```text
Gitleaks
TFLint
TFSec
Trivy
SonarQube
Checkmarx
Black Duck
```

Given your existing experience, you can connect this directly to your Jenkins work.

---

## B56. Azure Pipeline vs Jenkins

Very common interview question.

| Jenkins | Azure DevOps |
|---|---|
| Jenkinsfile | azure-pipelines.yml |
| Agent | Agent |
| Shared Library | YAML Template |
| Credentials | Service Connection |
| Plugins | Tasks/Extensions |
| Jenkins Controller | Azure DevOps service |
| Pipeline | Pipeline |
| Stage | Stage |
| Job | Job |

### Strong interview answer

> "The concepts are very similar. In Jenkins I work with Jenkinsfiles, agents, credentials and shared libraries. In Azure Pipelines the equivalent concepts are YAML pipelines, agents, service connections and reusable templates. The biggest difference is that Azure DevOps provides a more integrated platform around repos, pipelines, boards and artifacts."

---

## B57. Azure Pipeline vs GitHub Actions

| Azure DevOps | GitHub Actions |
|---|---|
| YAML pipeline | Workflow YAML |
| Agent | Runner |
| Service connection | Secrets/OIDC/integrations |
| Task | Action |
| Environment | Environment |
| Template | Reusable workflow/action |

Conceptually:

```text
Azure DevOps
     ↓
Pipeline
     ↓
Agent
```

GitHub:

```text
GitHub
  ↓
Workflow
  ↓
Runner
```

---

## B58. Complete Real-World Example

Suppose your company has:

```text
50+ microservices
AWS/Azure
Docker
Kubernetes
Terraform
Git
```

Pipeline:

```text
Developer
    |
    ↓
Feature Branch
    |
    ↓
Pull Request
    |
    ↓
Build Validation
    |
    +---- Unit Test
    +---- SonarQube
    +---- Gitleaks
    +---- Dependency Scan
    |
    ↓
Merge Main
    |
    ↓
Build
    |
    ↓
Docker Image
    |
    ↓
Trivy Scan
    |
    ↓
Container Registry
    |
    ↓
Deploy DEV
    |
    ↓
Smoke Test
    |
    ↓
Deploy QA
    |
    ↓
Approval
    |
    ↓
Deploy PROD
```

This is the type of architecture you should be able to explain in an interview.

---

## B59. Complete YAML Example

A simplified production-style structure:

```yaml
trigger:
  branches:
    include:
    - main

variables:
  appName: myapp
  imageTag: $(Build.BuildId)

stages:

# -------------------------
# BUILD
# -------------------------

- stage: Build

  jobs:

  - job: BuildApplication

    pool:
      vmImage: ubuntu-latest

    steps:

    - checkout: self

    - script: |
        echo "Installing dependencies"
        echo "Building application"
        echo "Running unit tests"

    - task: Docker@2
      inputs:
        command: build
        repository: $(appName)
        Dockerfile: '**/Dockerfile'
        tags: |
          $(imageTag)


# -------------------------
# SECURITY
# -------------------------

- stage: Security

  dependsOn: Build

  jobs:

  - job: SecurityScan

    steps:

    - script: |
        echo "Running security scan"


# -------------------------
# DEV
# -------------------------

- stage: DeployDev

  dependsOn:
  - Build
  - Security

  jobs:

  - deployment: Deploy

    environment: dev

    strategy:
      runOnce:

        deploy:

          steps:

          - script: |
              echo "Deploying to DEV"


# -------------------------
# PROD
# -------------------------

- stage: DeployProd

  dependsOn: DeployDev

  condition: succeeded()

  jobs:

  - deployment: Deploy

    environment: production

    strategy:
      runOnce:

        deploy:

          steps:

          - script: |
              echo "Deploying to PROD"
```

This isn't a complete production deployment by itself, but it demonstrates the architecture you need to understand.

---

## B60. Most Important Interview Questions

You should be able to answer these without notes.

### Fundamentals

1. What is Azure DevOps?
2. What is Azure Pipeline?
3. What is CI/CD?
4. YAML vs Classic pipeline?
5. What is an agent?
6. Microsoft-hosted vs self-hosted?
7. What is a stage?
8. What is a job?
9. What is a step?
10. What is a task?
11. What is a script?

### YAML

12. What is `trigger`?
13. What is `pool`?
14. What are variables?
15. Variables vs parameters?
16. What are resources?
17. What is `dependsOn`?
18. What is `condition`?
19. What are templates?
20. What is a reusable template?
21. What are pipeline artifacts?
22. What is an environment?

### Security

23. What is a service connection?
24. Why shouldn't credentials be stored in YAML?
25. What is workload identity federation?
26. How do you manage secrets?
27. How do you secure production deployments?
28. What is branch protection?
29. How do you integrate security scanning?

### DevOps

30. How do you build Docker images?
31. How do you push to a registry?
32. How do you deploy to Kubernetes?
33. How do you integrate Terraform?
34. How do you implement approval?
35. How do you optimize pipeline execution?
36. How do you troubleshoot failed pipelines?

---

## B61. Troubleshooting Scenario

### Interviewer:

> Pipeline suddenly fails with `docker: command not found`. What will you do?

Don't immediately say:

> "Install Docker."

Think systematically:

```text
Pipeline
   ↓
Which agent?
   ↓
Microsoft-hosted / Self-hosted?
   ↓
Does Docker exist?
   ↓
docker --version
   ↓
PATH?
   ↓
Docker service running?
   ↓
Permissions?
```

For self-hosted:

```bash
which docker
docker --version
systemctl status docker
```

Then fix the actual root cause.

---

## B62. Another Scenario

### Pipeline works on Microsoft-hosted agent but fails on self-hosted.

Possible causes:

```text
Different tool versions
Missing tools
PATH differences
Permissions
Network access
Proxy
Firewall
Docker daemon
Agent user permissions
Certificates
```

Excellent interview answer:

> "I would compare the execution environments first rather than assuming the YAML is wrong."

---

## B63. Production Deployment Failure

If production deployment fails:

Don't immediately rerun everything.

Think:

```text
Deployment failed
      ↓
Check pipeline logs
      ↓
Identify failed stage/task
      ↓
Check application/Kubernetes logs
      ↓
Check configuration
      ↓
Check image/version
      ↓
Assess impact
      ↓
Rollback if required
```

---

## B64. Rollback

Example Kubernetes approach:

```text
Current
  ↓
Version 10
  ↓
Problem
  ↓
Rollback
  ↓
Version 9
```

Helm:

```bash
helm history myapp
```

Then:

```bash
helm rollback myapp <revision>
```

The exact deployment mechanism depends on your implementation.

---

## B65. What NOT to Say in Interviews

This is very important for you.

### ❌ Don't say:

> "Azure DevOps is basically Jenkins."

Better:

> "The concepts overlap, but Azure DevOps provides an integrated suite including Repos, Pipelines, Boards, Test Plans and Artifacts."

---

### ❌ Don't say:

> "Agent is a stage."

Correct:

> "The agent executes jobs; the pool determines which agent is selected."

---

### ❌ Don't say:

> "Task and script are the same."

Correct:

> "A task is a predefined pipeline action, while a script executes commands directly."

---

### ❌ Don't say:

> "Variables are for secrets."

Better:

> "Variables can store configuration values; sensitive values should be protected using secret management mechanisms."

---

### ❌ Don't say:

> "Service connection stores passwords."

Better:

> "A service connection provides authenticated access from Azure DevOps to external resources. The underlying authentication mechanism depends on the service connection type."

---

### ❌ Don't say:

> "Self-hosted agents are always better."

Say:

> "The choice depends on requirements such as private-network access, customization, compliance, cost and operational overhead."

---

### ❌ Don't say:

> "I use `terraform apply -auto-approve` in production."

Better:

> "Production Terraform changes should normally go through plan review and appropriate approval/check mechanisms."

---

### ❌ Don't say:

> "We deploy directly to production after every commit."

Unless that's genuinely your organization's model.

Better:

```text
Build
 ↓
Test
 ↓
Security
 ↓
Approval
 ↓
Production
```

---

## B66. Interview Golden Rules

Remember these **10 rules**:

### Rule 1

```text
Never hardcode secrets.
```

### Rule 2

```text
Build once → Deploy many.
```

### Rule 3

```text
Least privilege.
```

### Rule 4

```text
Production requires controlled deployment.
```

### Rule 5

```text
Pipeline should be version controlled.
```

### Rule 6

```text
Use reusable templates.
```

### Rule 7

```text
Automate testing and security.
```

### Rule 8

```text
Use immutable/versioned artifacts.
```

### Rule 9

```text
Understand the execution environment.
```

### Rule 10

```text
Troubleshoot from logs and evidence, not assumptions.
```

---

## B67. Your 30-Second Azure DevOps Interview Answer

If interviewer asks:

> "Explain how you would design an Azure DevOps pipeline."

You can answer:

> "I would use a YAML-based multi-stage pipeline stored with the application source code. A push or pull request would trigger CI validation including build, unit tests and security scans. After validation, the pipeline would build the application or Docker image and publish a versioned artifact. The same artifact would then be promoted across DEV, QA and PROD. Production deployment would be protected using environments, approvals and appropriate service connections. I would avoid hardcoded credentials and use secure identity mechanisms such as workload identity federation where supported. For reusable logic across multiple applications, I would use YAML templates."

That's a **strong 3–5 year DevOps answer**.

---

## B68. One Master Memory Diagram

Memorize this:

```text
                         AZURE DEVOPS
                              |
       +----------------------+----------------------+
       |                      |                      |
     REPOS                  BOARDS               PIPELINES
       |                                             |
       |                                           YAML
       |                                             |
       |                    +------------------------+----------------+
       |                    |            |            |               |
       |                 Trigger     Variables    Resources       Parameters
       |                    |            |            |               |
       |                    +------------+------------+---------------+
       |                                 |
       |                               Stages
       |                                 |
       |                       +---------+---------+
       |                       |                   |
       |                     Build                Test
       |                       |                   |
       |                     Jobs                Jobs
       |                       |                   |
       |                     Steps               Steps
       |                       |                   |
       |                +------+-----+       +-----+------+
       |                |            |       |            |
       |              Tasks       Scripts   Tasks       Scripts
       |                |
       |              Agent
       |                |
       |        +-------+-------+
       |        |               |
       |     Hosted          Self-hosted
       |                        |
       |                +-------+--------+
       |                |       |        |
       |             Docker Terraform kubectl
       |
       +-----------------------------------------------------------+
                              |
                       Service Connection
                              |
                    Secure Authentication
                              |
                 Azure / ACR / AKS / Other
```

### The mental model to memorize

**"When → What → Where → How → Authenticate"**

```text
WHEN?
  → Trigger

WHAT?
  → Variables / Parameters / Resources

WHERE?
  → Agent / Pool

HOW?
  → Stages → Jobs → Steps → Tasks/Scripts

AUTHENTICATE?
  → Service Connection
```

If you can explain that model clearly and then connect it to a **real project scenario**, you will be much stronger in Azure DevOps interviews than someone who only memorized YAML syntax.

---

# Quick Cross-Reference

| Topic | Part A section | Part B section |
|---|---|---|
| Pipeline/Stage/Job/Step/Task | A2 | B3, B20–B24 |
| YAML basics | A3 | B4 |
| Triggers (CI, PR, schedule) | A4 | B6–B8 |
| Variables | A5 | B10–B12 |
| Parameters | A6, A7 | B13 |
| `$(var)` vs `${{ }}` vs `$[ ]` | A8 | — |
| Conditions & dependsOn | A9 | B29, B30, B50 |
| Artifacts / build once, deploy many | A10 | B28, B46–B47 |
| Templates | A11 | B41–B43 |
| Environments, approvals, checks | A12 | B44–B45 |
| Agents, pools, demands | A13 | B14–B19 |
| Self-hosted agent security / golden image | A13 | B19 |
| Service connections & WIF | A14 | B32–B35 |
| Key Vault | A15 | B54 |
| Terraform CI/CD | — | B36–B39 |
| Docker / ACR / AKS / Helm | — | B47–B49 |
| Matrix, caching, performance | A16 | B51–B53 |
| Troubleshooting | A21 | B61–B64 |
| Azure DevOps vs Jenkins / GitHub Actions | — | B56–B57 |
| "What not to say" interview guidance | — | B65 |
| Interview Q&A | A22 | B60 |
| Memory map | A23 | B68 |
