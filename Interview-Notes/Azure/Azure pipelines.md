# 🚀 Azure Pipelines + Variables + Environments + Agents + Service Connections — Detailed Pointwise Notes

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

---

## 📑 Contents

1. [Azure Pipelines Overview](#1-azure-pipelines-overview)
2. [Pipeline Structure (Pipeline → Stage → Job → Step → Task)](#2-pipeline-structure)
3. [YAML Basics & Step Types](#3-yaml-basics--step-types)
4. [Triggers (CI, PR, Scheduled, Pipeline)](#4-triggers)
5. [Variables](#5-variables)
6. [Parameters](#6-parameters)
7. [Variable vs Parameter vs Secret](#7-variable-vs-parameter-vs-secret)
8. [Expressions & Evaluation Order](#8-expressions--evaluation-order)
9. [Conditions & Dependencies](#9-conditions--dependencies)
10. [Artifacts & Build Once, Deploy Many](#10-artifacts--build-once-deploy-many)
11. [Templates](#11-templates)
12. [Environments, Deployment Jobs, Approvals & Checks](#12-environments-deployment-jobs-approvals--checks)
13. [Agents, Pools, Capabilities & Demands](#13-agents-pools-capabilities--demands)
14. [Service Connections & Workload Identity Federation](#14-service-connections--workload-identity-federation)
15. [Key Vault Integration](#15-key-vault-integration)
16. [Useful Pipeline Patterns](#16-useful-pipeline-patterns)
17. [Complete Examples](#17-complete-examples)
18. [Complete CI/CD Architecture](#18-complete-cicd-architecture)
19. [Command Cheat Sheet](#19-command-cheat-sheet)
20. [Hands-On Lab](#20-hands-on-lab)
21. [Troubleshooting](#21-troubleshooting)
22. [Interview Questions & Answers (40)](#22-interview-questions--answers)
23. [Final Memory Map](#23-final-memory-map)

---

# 1. Azure Pipelines Overview

**What:**
* Azure DevOps' **CI/CD service**.
* Automates: **build, test, package, security scan, deploy**.

**CI vs CD:**
* **CI (Continuous Integration):** every code change is built and tested automatically.
* **CD (Continuous Delivery/Deployment):** the built artifact is deployed through environments automatically (with approvals where needed).

```text
Git Push → Pipeline Trigger → Build → Unit Test → Security Scan → Package
         → Deploy DEV → Deploy QA → Approval → Deploy PROD
```

**Pipeline types:**
* **YAML pipelines** (`azure-pipelines.yml`): code in the repo, versioned and reviewed. **Use this.**
* **Classic pipelines** (UI-designed build and release): legacy. Know they exist.

**Where YAML lives:** usually the repo root (`azure-pipelines.yml`), and you point the pipeline at it (**Pipelines → New pipeline → Azure Repos Git → existing YAML file**).

> 🎤 *Azure Pipelines is a CI/CD service used to automatically build, test and deploy applications.*

---

# 2. Pipeline Structure

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

> A **step** can be a task, a script (`script`, `bash`, `powershell`, `pwsh`), or another supported step type, as noted in the next section.

---

# 3. YAML Basics & Step Types

## 3.1 Minimal pipeline

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- script: echo "Hello"
```

If you use only `steps:`, Azure Pipelines creates one implicit stage and one job.

## 3.2 Important top-level sections

```text
name, trigger, pr, schedules, resources, variables, parameters,
pool, stages, jobs, steps, extends, lockBehavior
```

## 3.3 Step types

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

## 3.4 Useful job/step settings

| Setting | Meaning |
| --- | --- |
| `displayName` | Friendly name in the UI |
| `timeoutInMinutes` | Cancel a job that runs too long |
| `continueOnError: true` | Step failure doesn't fail the job (partial success) |
| `retryCountOnTaskFailure: 2` | Retry a task on failure |
| `workingDirectory` | Where a step runs |
| `env:` | Environment variables for a step |
| `name:` | Step ID (used for output variables) |

## 3.5 Pipeline `name` (run number)

```yaml
name: $(Date:yyyyMMdd)$(Rev:.r)       # Build.BuildNumber, e.g. 20260315.1
```

---

# 4. Triggers

A **trigger** defines *when* a pipeline starts.

## 4.1 CI trigger (code pushed)

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

## 4.2 PR validation

```text
Developer → feature branch → PR → main → Validation pipeline → Build/Test
```

* **CI trigger = code pushed.**
* **PR validation = code proposed for merge.**

> ⭐ **For Azure Repos Git**, the YAML `pr:` trigger is **not** used. Configure PR validation through **Branch policy → Build validation** on the target branch.
> The `pr:` trigger works for **GitHub** and **Bitbucket** repositories. This is a classic interview gotcha.

## 4.3 Scheduled trigger

```yaml
schedules:
- cron: "0 2 * * *"            # 02:00 UTC daily
  displayName: Nightly build
  branches:
    include: [ main ]
  always: false                # false = only if there are new changes
```

> Cron schedules are in **UTC**.

## 4.4 Pipeline completion trigger

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

## 4.5 Other triggers and resources

| Trigger | Notes |
| --- | --- |
| Manual run | **Run pipeline** button (can set parameters/variables) |
| Repository resource | Check out additional repos (multi-repo pipelines) |
| Container resource | Trigger/run in containers |
| Webhook / service hook | External events |

---

# 5. Variables

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

## 5.1 Where variables can be defined

| Place | Notes |
| --- | --- |
| **YAML** (`variables:`) | Versioned in code. Non-secret only |
| **Pipeline UI** (Edit → Variables) | Can be **secret** or **settable at queue time** |
| **Variable groups** (Pipelines → Library) | Shared across pipelines, can link to **Key Vault** |
| **Runtime** | Set when running the pipeline |
| **Logging commands** | Set by scripts: `##vso[task.setvariable ...]` |
| **Predefined** | Provided by the system (`Build.BuildId`, ...) |

## 5.2 Scope

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

## 5.3 Variable groups

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

* Centralized management (for example `DEV_URL`, `QA_URL`, `PROD_URL`).
* Have **security** (who can use/edit) and can require **approvals/checks** on use.
* A pipeline must be **authorized** to use a group.
* Can **link secrets from Azure Key Vault**.
* Use **one group per environment** (`payment-dev`, `payment-prod`).

## 5.4 Predefined variables (know these)

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

## 5.5 Environment variables vs pipeline variables

```text
Azure Pipeline variable  ≠  OS environment variable
```

* Pipeline variables are **mapped to environment variables** for scripts, with names **uppercased and `.` → `_`**: `Build.BuildNumber` → `$BUILD_BUILDNUMBER`.

| Shell | Syntax |
| --- | --- |
| Bash | `$BUILD_BUILDNUMBER` |
| CMD | `%BUILD_BUILDNUMBER%` |
| PowerShell | `$env:BUILD_BUILDNUMBER` |

## 5.6 Secret variables 🔴

Secrets: passwords, API keys, tokens, client secrets, private credentials.

* ❌ Never put real secrets in source-controlled YAML.
* ✅ Use **secret variables** (UI), **variable groups** (secret), or **Azure Key Vault**.
* Secrets are **masked** in logs, but **never intentionally print them**.
* ⭐ **Secrets are NOT automatically available as environment variables.** Map them explicitly:

```yaml
- script: ./deploy.sh
  env:
    DB_PASSWORD: $(DB_PASSWORD)     # explicit mapping
```

* ❌ `echo $(DB_PASSWORD)`: don't do this.
* Secrets are not passed to **PR builds from forks** by default.

## 5.7 Output variables (pass values between steps/jobs/stages)

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

## 5.8 Runtime variables

Values supplied or changed **when a pipeline runs** (for example set in the Run dialog, if the variable is "settable at queue time").

```text
Run Pipeline → environment = QA → Deploy QA
```

---

# 6. Parameters

* **Parameters are pipeline/template inputs**, evaluated at **compile (template-expansion) time**.
* They have **types**, **defaults** and optional allowed **values**, and appear as **form fields** in the Run dialog.

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

# 7. Variable vs Parameter vs Secret

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

# 8. Expressions & Evaluation Order

## 8.1 Three syntaxes ⭐

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

## 8.2 Rules of thumb

* Need to **change the pipeline structure** (add/remove stages, loop)? → `${{ }}` with **parameters**.
* Need a **value inside a script/task input**? → `$(var)`.
* Need a **condition or computed value** at runtime? → `$[ ]` / `condition:`.
* A macro `$(var)` for an undefined variable is left as the literal text `$(var)`.
* Template expressions **can't see runtime values** (such as output variables).

## 8.3 Useful functions

```text
eq, ne, gt, lt, and, or, not, contains, startsWith, endsWith, in, notIn,
format, join, replace, split, coalesce, counter, lower, upper, succeeded(), failed()...
```

```yaml
condition: and(succeeded(), startsWith(variables['Build.SourceBranch'], 'refs/heads/release/'))
```

---

# 9. Conditions & Dependencies

## 9.1 Conditions

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

## 9.2 Dependencies (`dependsOn`)

* **Stages** run **sequentially in order** by default. Each depends on the previous one.
* **Jobs** in a stage run **in parallel** by default.

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

# 10. Artifacts & Build Once, Deploy Many

## 10.1 What are artifacts?

Outputs produced by a build and stored for later use (for example `app.zip`, Helm chart, Terraform plan, test results).

```text
Source → Build → Application Package → Artifact → Deploy
```

## 10.2 Types of artifacts (interview)

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

## 10.3 ⭐ Build once, deploy many

```text
Source → Build ONCE → Artifact → DEV → QA → PROD
```

* Promote the **same immutable artifact** (or image tag/digest) through environments.
* **Don't rebuild** a different binary for each environment.
* Supply **environment-specific configuration** separately (variable groups, ConfigMaps, Key Vault).

---

# 11. Templates

Templates let you **reuse YAML**.

```text
Without: Pipeline A, B, C each have the same 200 lines
With:                Template
                    /    |    \
                   A     B     C
```

## 11.1 Template types

| Type | Reuses |
| --- | --- |
| **Step** template | A list of steps |
| **Job** template | Jobs |
| **Stage** template | Whole stages |
| **Variable** template | Variables |
| **Extends** template | A **required pipeline skeleton** (governance) |

## 11.2 Example: a deploy job template

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

## 11.4 Shared template repo

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

## 11.5 `extends` (governance)

```yaml
extends:
  template: secure-pipeline.yml@templates
  parameters:
    appName: payment-api
```

* The organization's template controls the pipeline structure (security scan, approvals); teams can only fill in allowed parameters.
* Combine with the **"Required template" check** on environments/service connections so only pipelines that extend the approved template can deploy.

## 11.6 Why templates?

* Standard build process, security scanning, Docker build, Terraform validation, common deployment logic
* **Organization-wide CI/CD standards** and less copy-paste

```text
templates/
├── build.yml
├── security.yml
├── docker.yml
└── deploy.yml
```

---

# 12. Environments, Deployment Jobs, Approvals & Checks

## 12.1 What is an Environment?

A **deployment target or logical deployment boundary**: `DEV`, `QA`, `UAT`, `PROD`.

```text
Pipeline → DEV Environment → QA Environment → PROD Environment
```

**Environments give you:**
* **Deployment history** (which run deployed what, and when)
* **Permissions** (who can use/manage the environment)
* **Approvals and checks** (production protection)
* **Resources** (Kubernetes namespaces, VMs) with traceability

> ⚠️ If a YAML pipeline references a **non-existent environment**, it can be **auto-created with no checks**. Create production environments **first** and add approvals.

## 12.2 Deployment jobs

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
* Targets an **environment** → enables **approvals, checks and history**.
* **Automatically downloads artifacts**.
* Supports **deployment strategies** and lifecycle hooks.

## 12.3 Deployment strategies

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

## 12.4 Typical environment flow

```text
Build → Deploy DEV → Automated Tests → Deploy QA → Approval → Deploy PROD
```

## 12.5 Approvals 🔴

```text
Pipeline → Build → QA → [Approval required] → Authorized user → PROD continues
```

* Configured on the **environment** (and also on service connections, variable groups, agent pools, secure files).
* Settings: **approvers** (users/groups), instructions, timeout, option for requester to approve their own run (disable for production), approval order.

## 12.6 Checks 🔴

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

## 12.7 Environment permissions

```text
Production
├── DevOps Team   → allowed
├── Release Team  → allowed
└── Developer     → restricted
```

**Roles:** Administrator, User, Creator, Reader. Provides **separation of duties**.

---

# 13. Agents, Pools, Capabilities & Demands

## 13.1 What is an agent?

The **machine that executes pipeline jobs**.

```text
Pipeline → Job → Agent → commands run (git, docker, terraform, python, kubectl)
```

## 13.2 Microsoft-hosted vs self-hosted

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

## 13.3 Why self-hosted?

* Reach **private resources** (private AKS, databases, private endpoints, on-prem)
* Custom software/hardware, licensed tools
* Faster builds with **caches** (persistent disk)
* Compliance/network control

**Responsibilities when self-hosted:** OS, patching, security, tools, networking, capacity, agent software lifecycle.

## 13.4 Agent pool

A **collection of agents**.

```text
Agent Pool
├── Agent-01
├── Agent-02
└── Agent-03
```

* Pools are **organization-level**, with **project-level** access. Pipelines must be **authorized** to use a pool.
* Job waits in the queue if all agents are busy.

## 13.5 Capabilities & demands

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

* **System capabilities** are auto-detected, **user capabilities** are added manually.

## 13.6 Registering a self-hosted agent (Linux)

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

* The **PAT is used only for registration** (needs **Agent Pools: Read & manage**). The agent then uses its own credentials.
* Alternatives: authenticate with a **service principal**. Run in a **container** or on **AKS**.

## 13.7 Scaling agents

| Option | Notes |
| --- | --- |
| **VM Scale Set (VMSS) agents** | Elastic, auto-scaling, ephemeral self-hosted agents in your subscription/VNet |
| **Managed DevOps Pools** | Newer Azure-managed service for self-hosted-style pools inside your VNet |
| **Containers / AKS** | Agents as pods (for example scaled with KEDA) |

## 13.8 🔴 Self-hosted agent security

```text
Pipeline code → Agent → commands execute with the agent's access
```

If untrusted pipeline code controls the agent, it can compromise the machine and any credentials on it.

* Don't keep long-lived credentials on agents. Prefer **service connections with WIF**.
* Keep agents **patched**, with **least privilege** and restricted network access.
* **Separate production agent pools** from general ones.
* **Don't let untrusted pipelines/forks** use sensitive pools.
* Prefer **ephemeral agents** (fresh per job).
* Restrict **who can use and manage** the pool. Require **approvals/checks** on the pool.
* Monitor agent activity and logs.

## 13.9 Linux vs Windows agents

| Linux | Windows |
| --- | --- |
| bash, python, docker, terraform, kubectl, az | PowerShell, .NET Framework, MSBuild, Visual Studio tooling |

Choose the OS the application needs.

## 13.10 Job types

| Type | Notes |
| --- | --- |
| **Agent pool job** | Normal job on an agent |
| **Container job** | Runs steps inside a container image (`container:`) |
| **Deployment job** | Deploys to an environment |
| **Server (agentless) job** | Runs on the server (manual validation, REST call, delay) |

---

# 14. Service Connections & Workload Identity Federation

## 14.1 What is a service connection?

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

## 14.2 Azure Resource Manager (ARM) service connection

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

## 14.3 Service principal

An **application identity in Microsoft Entra ID** that can be assigned **Azure RBAC** roles.

```text
Azure DevOps → Service Connection → Service Principal → Entra ID → Azure RBAC → Azure Resource
```

Older pattern uses a **client secret**:

```text
Pipeline → Service Connection → Service Principal → Client Secret → Entra ID → Azure
Problem: secret rotation, risk if leaked, secrets expire (pipelines suddenly fail)
```

## 14.4 🔴 Workload Identity Federation (WIF)

```text
Azure Pipeline → Federated Identity → Microsoft Entra ID → Azure RBAC → Azure Resource
```

* The pipeline obtains a **short-lived token** through **OIDC federation**. **No long-lived client secret** is stored.
* In Entra ID, a **federated credential** on the app registration/managed identity trusts Azure DevOps:
  * **Issuer:** `https://vstoken.dev.azure.com/<organization-id>`
  * **Subject:** `sc://<organization>/<project>/<service-connection-name>`

> 🎤 *Workload identity federation allows Azure DevOps to authenticate to Azure using a federated identity without storing a long-lived client secret in the service connection.*

**Advantages:**
* No secret to store, leak or rotate
* Short-lived tokens, better security posture
* Fewer outages from expired secrets

## 14.5 WIF vs client secret

| Client secret | Workload identity federation |
| --- | --- |
| Long-lived secret stored in DevOps | **No stored secret** |
| Must rotate (expires) | Short-lived tokens |
| Leak risk | Much lower risk |
| Older approach | **Modern, recommended** |

## 14.6 Managed identity vs WIF

* **Managed identity** = an Azure-managed identity **for an Azure resource** (VM, AKS, App Service) so the resource needs no stored password.
* **WIF** = lets a workload **outside** the Azure resource context (such as an Azure DevOps pipeline or GitHub Actions) authenticate **without a secret**.

```text
Azure VM → Managed Identity → Key Vault
Pipeline → WIF → Entra ID → Azure
```

## 14.7 Authentication vs authorization

```text
Authentication = Who are you?        → Microsoft Entra ID
Authorization  = What can you do?    → Azure RBAC
```

```text
Pipeline → Federated identity → Entra ID (authenticated) → Azure RBAC role → Azure Resource
```

> A common failure: **authentication succeeds but RBAC is missing** (identity valid, authorization insufficient).

## 14.8 🔴 Least privilege & hardening

* Don't give **Owner**. Use the minimum role (`Contributor` on a **resource group**, or specific roles like *AcrPush*, *Azure Kubernetes Service Cluster User*).
* Automatic WIF creation may assign **Contributor at subscription scope**. **Narrow it** afterwards.
* **Separate service connections** per environment (`sc-azure-dev`, `sc-azure-prod`).
* **Don't tick "Grant access permission to all pipelines."** Authorize only the pipelines that need it.
* Add **approvals/checks** (and **branch control**) on the production service connection.
* Prefer a **dedicated identity per application/team**.

## 14.9 Using a service connection in YAML

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

## 14.10 Agent vs service connection vs environment

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

# 15. Key Vault Integration

```text
Azure Key Vault → Secrets → Azure DevOps Pipeline → Application deployment
```

## 15.1 Options

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

## 15.2 Permissions

* The service connection's identity needs **Get** and **List** on secrets (access policy) or the RBAC role **Key Vault Secrets User**.
* Prefer **Azure RBAC** model for Key Vault, and a **private endpoint** where required.

---

# 16. Useful Pipeline Patterns

## 16.1 Caching

```yaml
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    restoreKeys: |
      npm | "$(Agent.OS)"
    path: $(Pipeline.Workspace)/.npm
```

## 16.2 Matrix strategy (parallel variations)

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

## 16.3 Parallelism

```yaml
strategy:
  parallel: 4
```

## 16.4 Container job

```yaml
container: node:20
steps:
- script: node --version
```

## 16.5 Timeouts and retries

```yaml
- job: Build
  timeoutInMinutes: 30
  steps:
  - task: AzureCLI@2
    retryCountOnTaskFailure: 2
```

## 16.6 Typical security/quality stages (DevSecOps)

```text
Code → SAST (SonarQube) → Dependency scan → Container scan (Trivy) → IaC scan → Build → Deploy
```

## 16.7 Best practices

* Use **YAML**, **templates** and **multi-stage** pipelines.
* **Build once, deploy many**. Pin versions of tasks, images and templates.
* Protect `main` with **PR validation** and **branch policies**.
* **No secrets in YAML**. Use Key Vault and **WIF**.
* **Least privilege** service connections, one per environment.
* **Environments** with approvals/checks for production.
* Set **timeouts**, use **caching**, and keep pipelines fast.
* Fail fast: lint and unit tests first.
* Use meaningful `displayName`s and publish test results.

---

# 17. Complete Examples

## 17.1 Multi-stage pipeline (corrected, interview level)

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

## 17.2 Parameterized pipeline

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

## 17.3 Hierarchy to remember

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

# 18. Complete CI/CD Architecture

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

# 19. Command Cheat Sheet

> Verify flags with `az pipelines --help`.

## 19.1 Pipelines

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

## 19.2 Pipeline variables and variable groups

```bash
az pipelines variable create --pipeline-name payment-ci --name appName --value payment-api
az pipelines variable create --pipeline-name payment-ci --name DB_PASSWORD --secret true --value '<value>'
az pipelines variable list --pipeline-name payment-ci -o table

az pipelines variable-group create --name payment-dev \
  --variables env=dev appName=payment-api --authorize true
az pipelines variable-group list -o table
```

## 19.3 Agents and pools

```bash
az pipelines pool list -o table
az pipelines agent list --pool-id <pool-id> -o table
```

## 19.4 Service connections

```bash
az devops service-endpoint list -o table
az devops service-endpoint show --id <id>
```

## 19.5 Self-hosted agent (Linux service)

```bash
./config.sh --unattended --url https://dev.azure.com/<org> --auth pat --token <PAT> \
  --pool MyLinuxPool --agent agent-01 --acceptTeeEula
sudo ./svc.sh install && sudo ./svc.sh start
sudo ./svc.sh status
./run.sh                 # run interactively (for testing)
```

## 19.6 Debugging a pipeline

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

# 20. Hands-On Lab

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

# 21. Troubleshooting

## 21.1 Pipeline not starting

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

## 21.2 Job waiting for an agent

```text
Job → Agent Pool → Available agent? → Agent online? → Required capability? → Demands satisfied?
```

* No matching agent → job stays **queued**.
* *"No hosted parallelism has been purchased or granted"* → request a free grant or buy parallel jobs.
* Self-hosted agent **offline** → service stopped, VM down, PAT/auth problem, network/proxy.
* All agents busy → add agents / use VMSS.

## 21.3 Deployment authentication failed

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

## 21.4 Production deployment doesn't start

```text
Build → Artifact → Deployment stage → Condition → Environment → Approval → Checks → Permission
```

Waiting because of: **approval pending**, **environment check failed** (branch control, business hours, exclusive lock), **pipeline not authorized** for the environment, or the stage **condition** evaluated to false.

## 21.4b Other common problems

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

# 22. Interview Questions & Answers

## 22.1 Azure Pipelines

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

## 22.2 Variables

13. **What are pipeline variables?** Named values used across the pipeline, referenced like `$(name)`.
14. **Variable vs parameter?** A variable is a runtime configuration value. A parameter is a typed pipeline/template input evaluated at compile time that can change the pipeline's structure.
15. **What is a variable group?** A shared set of variables in the Library, reusable across pipelines, with security and optional Key Vault linking.
16. **How do you handle secrets?** Secret variables, secret variable groups or Key Vault. Never in YAML. Map them via `env:` and don't print them.
17. **How would you integrate Key Vault?** `AzureKeyVault@2` task or a Key Vault-linked variable group, using a service connection with Get/List (or *Key Vault Secrets User*).
18. **What are runtime variables?** Values supplied or set when a pipeline runs (queue-time variables, output variables from tasks).
19. **`$(var)` vs `${{ }}` vs `$[ ]`?** `$(var)` = macro at runtime before a task runs. `${{ }}` = template expression at compile time. `$[ ]` = runtime expression, used for conditions and computed values.

## 22.3 Environments

20. **What is an Environment?** A deployment target/boundary (DEV, QA, PROD) that gives deployment history, permissions, approvals and checks.
21. **What is a deployment job?** A special job that deploys to an environment, auto-downloads artifacts and supports strategies (runOnce, rolling, canary).
22. **How do you protect production?** Environment approvals and checks, restricted permissions, a separate protected service connection, branch control and branch policies.
23. **What are approvals?** A manual sign-off by named users/groups before a deployment proceeds.
24. **What are checks?** Automated gates: branch control, business hours, exclusive lock, required template, REST/Azure Function, Azure Monitor alerts.
25. **How do environment permissions work?** Roles (Administrator, User, Creator, Reader) control who can use or manage the environment, giving separation of duties.

## 22.4 Agents

26. **What is an agent?** The machine that runs a pipeline's jobs.
27. **Microsoft-hosted vs self-hosted?** Microsoft-hosted: Microsoft manages a fresh VM per job. Self-hosted: you manage it and can access private networks and custom tools.
28. **What is an agent pool?** A collection of agents. Jobs queue to a pool.
29. **What are capabilities?** Properties of an agent (OS, installed tools).
30. **What are demands?** Requirements a job places on an agent. A job runs only on agents with matching capabilities.
31. **How do you register a self-hosted agent?** Create a pool, download the agent, run `config.sh` with URL, pool and auth, then install it as a service.
32. **How do you secure self-hosted agents?** Patch, least privilege, no stored secrets, restricted network, separate prod pools, ephemeral agents, restrict who can use the pool, no untrusted/fork pipelines.

## 22.5 Service connections

33. **What is a service connection?** An authenticated connection from Azure DevOps to an external service so pipelines can use it.
34. **What is an ARM service connection?** A service connection that lets pipelines manage Azure resources in a subscription/resource group via Entra ID.
35. **What is a service principal?** An application identity in Entra ID that can be assigned RBAC roles.
36. **What is workload identity federation?** OIDC-based trust that lets a pipeline get a short-lived Entra token without a stored client secret.
37. **WIF vs client secret?** WIF has no stored secret and short-lived tokens. A client secret is long-lived, must be rotated and can leak or expire.
38. **What is a managed identity?** An Azure-managed identity for an Azure resource so it can access other resources without stored credentials. It's different from WIF, which serves external workloads.
39. **Authentication vs authorization?** Authentication = who you are (Entra ID). Authorization = what you can do (Azure RBAC).
40. **How do you implement least privilege?** A dedicated identity per environment, a minimum RBAC role at the narrowest scope, no "all pipelines" access, and approvals/checks on the production connection.

## 22.6 Extra

41. **Why can't I use `pr:` in Azure Repos?** For Azure Repos Git, PR validation is configured in branch policies (build validation). `pr:` applies to GitHub/Bitbucket.
42. **Why is my secret empty in a script?** Secrets aren't exposed as environment variables automatically. Map with `env:`.
43. **What is "build once, deploy many"?** Build one immutable artifact/image and promote it through environments, only changing configuration.
44. **How do you reuse pipeline logic across teams?** Shared template repo, versioned/tagged, optionally enforced with `extends` and a required template check.
45. **How do you reach a private AKS/database from a pipeline?** A self-hosted or VMSS/Managed DevOps agent inside the VNet (or with private connectivity).

---

# 23. Final Memory Map

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

## 🔴 15 things to memorize first

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
