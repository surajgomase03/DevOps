# Azure Pipelines — Complete Interview Guide

## Contents

1. **Part 1 — Core 20 Questions (Detailed):** the must-know topics with full explanations, diagrams and ready answers.
2. **Part 2 — Full Question Bank (85 Questions):** pointwise sheet from basic → intermediate → senior/scenario-based, with the memory map and the senior one-minute answer.

---

## Part 1 — Core 20 Questions (Detailed)

### 1. What is Azure Pipelines?

> **Azure Pipelines is a CI/CD service in Azure DevOps used to automatically build, test, package, and deploy applications.**

* Supports **YAML** and **Classic** pipelines.
* Supports multiple languages and platforms.
* Can deploy to **Azure, Kubernetes, VMs, containers**, etc.
* Uses **agents** to execute pipeline jobs.

**Flow:**

```text
Developer
   ↓
Git Push / PR
   ↓
Azure Pipeline
   ↓
Build → Test → Package
   ↓
Artifact
   ↓
Deploy
   ↓
Dev → QA → UAT → Prod
```

---

### 2. CI vs CD?

#### CI — Continuous Integration

> Automatically **build and test code whenever developers commit or create PRs**.

```text
Code Commit
   ↓
Build
   ↓
Unit Test
   ↓
Code Quality
   ↓
Artifact
```

#### CD — Continuous Delivery / Deployment

> Automatically **deploys the validated artifact to environments**.

```text
Artifact
   ↓
Dev
   ↓
QA
   ↓
UAT
   ↓
Production
```

**Interview point:**

> CI focuses mainly on **integrating and validating code**, while CD focuses on **releasing and deploying the validated artifact**.

---

### 3. YAML vs Classic?

#### YAML Pipeline

* Pipeline configuration stored as code.
* Version controlled with Git.
* Easy to review through PR.
* Supports reusable templates.
* Preferred for modern enterprise pipelines.

#### Classic Pipeline

* Created/configured through Azure DevOps UI.
* Configuration is not primarily maintained as code.
* Easier for beginners.
* Less convenient for large-scale standardization.

**Interview answer:**

> I prefer YAML because the pipeline definition is version-controlled, reviewable, reusable, and easier to standardize across projects.

---

### 4. Stage vs Job vs Step vs Task?

Think of the hierarchy:

```text
Pipeline
   ↓
Stage
   ↓
Job
   ↓
Step
   ↓
Task
```

#### Stage

Logical phase of the pipeline.

```yaml
stages:
- stage: Build
- stage: Deploy
```

#### Job

Collection of steps executed by an agent.

```yaml
jobs:
- job: BuildApplication
```

#### Step

Individual execution unit inside a job.

```yaml
steps:
- script: npm install
```

#### Task

Pre-built Azure DevOps action.

```yaml
steps:
- task: Docker@2
```

**Simple interview answer:**

> Stage represents a major phase, job represents work executed on an agent, step is an individual action, and task is a pre-built pipeline action.

---

### 5. What is a CI trigger?

A CI trigger automatically starts a pipeline when code is pushed.

Example:

```yaml
trigger:
- main
```

Now:

```text
Developer
   ↓
git push
   ↓
main branch
   ↓
Pipeline automatically starts
```

You can also control branches:

```yaml
trigger:
  branches:
    include:
    - main
    - develop
```

**Interview point:**

> CI triggers automate pipeline execution after code changes.

---

### 6. What is PR validation in Azure Repos?

PR validation runs pipeline checks when a developer creates or updates a Pull Request.

Typical flow:

```text
Developer
   ↓
Feature Branch
   ↓
Pull Request
   ↓
Build + Test + Security Scan
   ↓
Validation
   ↓
Merge allowed
```

Typical checks:

* Build
* Unit tests
* SonarQube
* Security scanning
* Terraform validation
* Docker build
* Kubernetes manifest validation

**Enterprise practice:**

> I use PR validation to prevent untested or broken code from being merged into protected branches.

---

### 7. Variable vs Parameter?

#### Variable

Used for values that may change during pipeline execution.

```yaml
variables:
  environment: dev
```

Use:

```yaml
$(environment)
```

#### Parameter

Used mainly for **pipeline structure/configuration** and is evaluated before execution.

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

#### Simple difference

| Variable                        | Parameter                        |
| ------------------------------- | -------------------------------- |
| Runtime-oriented                | Template/compile-time            |
| Can be changed during execution | Usually defined before execution |
| Good for values                 | Good for pipeline structure      |
| `$(var)`                        | `${{ parameters.x }}`            |

**Interview answer:**

> Variables are mainly runtime values, while parameters are compile-time inputs used to control pipeline templates and structure.

---

### 8. `$( )` vs `${{ }}` vs `$[ ]`?

This is **very important for interviews.**

#### `$(variable)`

Runtime macro expression.

```yaml
echo $(Build.BuildNumber)
```

Used to access variables during task execution.

---

#### `${{ }}`

Compile-time/template expression.

```yaml
${{ parameters.environment }}
```

Used for:

* Parameters
* Templates
* Conditional insertion
* Pipeline structure

---

#### `$[ ]`

Runtime expression.

```yaml
condition: $[eq(variables['Build.SourceBranch'], 'refs/heads/main')]
```

Used mainly for:

* Conditions
* Runtime expressions
* Dynamic variable evaluation

#### Easy memory trick

```text
${{ }}  → Compile time
$( )    → Runtime variable
$[ ]    → Runtime expression/condition
```

---

### 9. What is a Variable Group?

> A **Variable Group** is a centralized collection of pipeline variables that can be shared across multiple pipelines.

Example:

```text
Variable Group
 ├── appName
 ├── environment
 ├── databaseHost
 └── API configuration
```

Pipeline:

```yaml
variables:
- group: production-config
```

For secrets, Azure DevOps can integrate variable groups with **Azure Key Vault**.

**Interview point:**

> Variable groups help centralize configuration and avoid duplicating common variables across pipelines.

---

### 10. What is an Artifact?

> An artifact is the **output/package produced by a build that can be consumed by later deployment stages**.

Example:

```text
Source Code
    ↓
Build
    ↓
Application Package
    ↓
Artifact
    ↓
Deploy to Dev
    ↓
Deploy to QA
    ↓
Deploy to Prod
```

Examples:

* `.zip`
* `.jar`
* `.war`
* Docker image
* Helm package
* Terraform package

**Important:**

> Build artifacts should be immutable and traceable to a specific source commit/build.

---

### 11. What does "Build once, deploy many" mean?

> Build the application **one time**, create one immutable artifact, and deploy that same artifact across all environments.

Bad approach:

```text
Build → Dev
Build → QA
Build → Prod
```

This can create different binaries.

Better:

```text
Source
  ↓
Build ONCE
  ↓
Artifact v1.25
  ↓
Dev
  ↓
QA
  ↓
UAT
  ↓
Prod
```

**Interview answer:**

> This ensures the exact artifact tested in lower environments is the one deployed to production.

---

### 12. Microsoft-hosted vs Self-hosted agent?

#### Microsoft-hosted agent

Azure provides and manages the VM.

Advantages:

* No infrastructure management.
* Fresh environment.
* Easy to start.
* Microsoft maintains the image.

Example:

```yaml
pool:
  vmImage: ubuntu-latest
```

#### Self-hosted agent

We manage the agent machine.

Advantages:

* Custom software/tools.
* Private network access.
* Internal systems access.
* More control.

Example:

```text
Azure DevOps
     ↓
Self-hosted Agent
     ↓
Private Network
     ↓
Internal Application
```

**Interview answer:**

> I use Microsoft-hosted agents for standard workloads and self-hosted agents when the pipeline requires private network access, custom tooling, or controlled infrastructure.

---

### 13. What is an Agent Pool?

> An **Agent Pool** is a collection of agents available to execute pipeline jobs.

Example:

```text
Agent Pool: Linux-Production
       |
       +-- Agent 01
       +-- Agent 02
       +-- Agent 03
```

Pipeline:

```yaml
pool:
  name: Linux-Production
```

**Purpose:**

* Organize agents.
* Share agents across pipelines.
* Control execution capacity.

---

### 14. What is a Service Connection?

> A **Service Connection** provides Azure DevOps pipelines with authenticated access to an external service.

Examples:

* Azure subscription
* Docker registry
* Kubernetes cluster
* AWS
* GitHub

Example:

```text
Azure Pipeline
      ↓
Service Connection
      ↓
Azure
```

Instead of storing credentials directly in YAML:

```yaml
# Don't do this
password: "MyPassword123"
```

Use a secure service connection.

---

### 15. WIF vs Client Secret?

#### Client Secret

Traditional authentication:

```text
Pipeline
   ↓
Client ID + Client Secret
   ↓
Microsoft Entra ID
   ↓
Azure
```

Problem:

* Secret must be stored.
* Secret can expire.
* Rotation is required.
* Secret leakage creates security risk.

#### WIF — Workload Identity Federation

Uses federated identity instead of a stored secret.

```text
Azure DevOps
      ↓
Federated Identity
      ↓
Microsoft Entra ID
      ↓
Azure Resource
```

**Interview answer:**

> I prefer Workload Identity Federation because it avoids storing long-lived client secrets and provides short-lived identity-based authentication.

---

### 16. What is an Environment?

> An Azure DevOps **Environment** represents a deployment target such as Dev, QA, UAT, or Production.

Example:

```text
Azure DevOps
     |
     +-- Dev
     +-- QA
     +-- UAT
     +-- Production
```

Environments can provide:

* Deployment history
* Approvals
* Checks
* Security controls
* Resource tracking

---

### 17. Environment vs Service Connection?

This is a common interview question.

#### Service Connection

Answers:

> **"How does the pipeline authenticate/connect to the target?"**

Example:

```text
Pipeline
   ↓
Service Connection
   ↓
Azure Subscription
```

#### Environment

Answers:

> **"Where are we deploying, and what deployment controls apply?"**

Example:

```text
Pipeline
   ↓
Production Environment
   ↓
Approval
   ↓
Azure Resources
```

#### Easy memory

```text
Service Connection = HOW I CONNECT

Environment = WHERE I DEPLOY + CONTROLS
```

---

### 18. What is Pipeline Authorization?

> Pipeline authorization controls whether a pipeline is allowed to use protected resources such as service connections, variable groups, agent pools, or environments.

Example:

```text
Pipeline
   ↓
Request Service Connection
   ↓
Authorization Check
   ↓
Allowed
   ↓
Azure
```

**Security principle:**

> Don't allow every pipeline to automatically access production resources.

---

### 19. How do you secure production?

A strong senior-level answer:

> I use multiple layers of controls rather than relying on a single security mechanism.

#### 1. Branch protection

```text
Feature
   ↓
PR
   ↓
Validation
   ↓
main
```

#### 2. PR validation

* Build
* Unit tests
* Security scans
* Code quality

#### 3. Production approval

```text
Pipeline
   ↓
Production
   ↓
Manual/Required Approval
   ↓
Deploy
```

#### 4. Use WIF

Avoid long-lived client secrets.

#### 5. Secrets management

Use:

* Azure Key Vault
* Secret variables
* Variable groups where appropriate

Never hardcode secrets.

#### 6. Least privilege

Service connections should have only the permissions they need.

#### 7. Environment checks

Use production environment approvals/checks.

#### 8. Artifact immutability

```text
Build once
   ↓
Same artifact
   ↓
Production
```

#### 9. Auditability

Track:

* Who triggered deployment
* Which commit
* Which artifact
* Which pipeline
* When deployment occurred

---

### 20. How do you design an enterprise CI/CD pipeline?

#### Senior-level answer

> I design the pipeline with separation of CI and CD, immutable artifacts, security gates, reusable templates, environment controls, and least-privilege authentication.

Architecture:

```text
                  Developer
                      |
                      ↓
                Feature Branch
                      |
                      ↓
                     PR
                      |
             +--------+--------+
             | PR Validation   |
             | Build           |
             | Unit Test       |
             | SAST            |
             | Dependency Scan |
             +--------+--------+
                      |
                      ↓
                    Merge
                      |
                      ↓
                CI Pipeline
                      |
             +--------+--------+
             | Build           |
             | Test            |
             | Scan            |
             | Package         |
             +--------+--------+
                      |
                      ↓
               Immutable Artifact
                      |
          +-----------+-----------+
          ↓                       ↓
        Dev                     QA
          |                       |
          +-----------+-----------+
                      ↓
                     UAT
                      |
                Approval/Checks
                      |
                      ↓
                  Production
```

#### Enterprise design principles

**1. Reusable YAML templates**

```text
templates/
 ├── build.yml
 ├── security.yml
 ├── docker.yml
 └── deploy.yml
```

**2. Build once, deploy many**

```text
Build → Artifact → Dev → QA → UAT → Prod
```

**3. Secure authentication**

```text
Pipeline
   ↓
WIF
   ↓
Entra ID
   ↓
Azure
```

**4. Environment protection**

```text
Production
   ↓
Approval
   ↓
Checks
   ↓
Deployment
```

**5. Secrets**

```text
Pipeline
   ↓
Key Vault
```

**6. Least privilege**

Each service connection gets only required permissions.

**7. Observability**

After deployment:

```text
Deploy
  ↓
Health Check
  ↓
Monitoring
  ↓
Rollback if required
```

#### ⭐ 30-second interview answer

> **"For an enterprise Azure DevOps pipeline, I would use YAML pipelines with reusable templates. PR validation would perform build, unit testing, code quality and security checks. After merge, CI would build the application once and publish an immutable artifact. CD would promote that same artifact through Dev, QA, UAT and Production. I would secure Azure access using Workload Identity Federation, store secrets in Key Vault, use service connections with least privilege, and protect Production with environments, approvals and checks. I would also maintain deployment history, auditability, monitoring and rollback capability."**

---

## Part 2 — Full Question Bank (85 Questions)

Below is a **pointwise Azure Pipelines interview sheet**, ordered from **basic → intermediate → senior/scenario-based**.

---

### 1. Azure Pipelines Basics

#### Q1. What is Azure Pipelines?

> Azure Pipelines is a CI/CD service in Azure DevOps used to automatically build, test, package and deploy applications and infrastructure.

```text
Code
 ↓
Build
 ↓
Test
 ↓
Security Scan
 ↓
Artifact
 ↓
Deploy DEV
 ↓
Deploy QA
 ↓
Deploy PROD
```

---

#### Q2. What is CI?

> **Continuous Integration** means automatically building and testing code whenever developers integrate changes into a shared repository.

#### Q3. What is CD?

> **Continuous Delivery/Deployment** automates the process of delivering or deploying validated application changes to environments.

---

#### Q4. CI vs CD?

| CI                   | CD                                    |
| -------------------- | ------------------------------------- |
| Build and test       | Deploy and release                    |
| Validates code       | Delivers validated artifact           |
| Runs frequently      | Promotes artifact across environments |
| Detects issues early | Automates deployment                  |

---

#### Q5. What is a pipeline?

> A pipeline is an automated workflow that defines how code is built, tested, packaged and deployed.

---

#### Q6. What is a YAML pipeline?

> A YAML pipeline defines CI/CD configuration as code in a YAML file, normally stored in the repository.

Example:

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- script: echo "Build application"
- script: echo "Run tests"
```

---

#### Q7. YAML vs Classic Pipeline?

> **YAML pipelines** store pipeline configuration as code and support version control, templates and code review. **Classic pipelines** are configured primarily through the Azure DevOps UI.

For modern DevOps practices, YAML is generally preferred.

---

### 2. Pipeline Structure

#### Q8. What is a Stage?

> A stage is a logical boundary in a pipeline, commonly representing environments or major phases such as Build, Test and Production.

```text
Stage
 ↓
Job
 ↓
Step
 ↓
Task / Script
```

---

#### Q9. What is a Job?

> A job is a collection of steps that execute together on an agent.

---

#### Q10. What is a Step?

> A step is an individual action in a job, such as running a script or task.

---

#### Q11. What is a Task?

> A task is a reusable predefined action provided by Azure DevOps or an extension.

Example:

```yaml
- task: AzureCLI@2
```

---

#### Q12. Task vs Script?

> **Task** is a predefined reusable action. **Script** allows me to execute commands directly using Bash, PowerShell or another supported shell.

---

#### Q13. What is `dependsOn`?

> `dependsOn` defines the dependency between stages or jobs.

```yaml
dependsOn: Build
```

Means the current stage/job depends on `Build`.

---

#### Q14. What is a condition?

> A condition controls whether a stage, job or step should execute.

Example:

```yaml
condition: succeeded()
```

---

#### Q15. Common pipeline conditions?

```text
succeeded()
failed()
always()
succeededOrFailed()
canceled()
```

Examples:

```yaml
condition: succeeded()
```

Run only after successful dependencies.

```yaml
condition: always()
```

Useful for cleanup or diagnostics regardless of dependency result.

---

### 3. Triggers

#### Q16. What is a CI trigger?

> A CI trigger automatically starts a pipeline when changes are pushed to configured branches.

```yaml
trigger:
- main
```

---

#### Q17. What is a scheduled trigger?

> It starts a pipeline according to a defined schedule.

Example use:

```text
Nightly security scan
Nightly infrastructure validation
```

---

#### Q18. What is PR validation?

> PR validation runs checks before a pull request is merged.

Important Azure Repos point:

> **For Azure Repos Git, PR validation is configured through branch policies/build validation rather than relying on a YAML `pr:` trigger.**

---

#### Q19. How do you protect the main branch?

> I use branch policies such as required reviewers, build validation, comment resolution and restrictions on direct pushes/bypass permissions.

---

### 4. Variables

#### Q20. What is a pipeline variable?

> A variable stores configuration data that can be reused during pipeline execution.

Example:

```yaml
variables:
  environment: dev
```

Use:

```yaml
$(environment)
```

---

#### Q21. What is a secret variable?

> A secret variable stores sensitive values such as passwords or tokens and prevents them from being exposed normally in pipeline logs.

---

#### Q22. Are secret variables automatically available as environment variables?

> No. Secret variables should be explicitly mapped when needed.

```yaml
env:
  PASSWORD: $(mySecret)
```

---

#### Q23. What is a variable group?

> A variable group is a centralized collection of variables that can be shared across pipelines.

Example:

```text
Variable Group
 ├── environment
 ├── region
 └── configuration
```

---

#### Q24. Variable vs Parameter?

> **Variable** is generally runtime/configuration data. **Parameter** is a compile-time input used to control pipeline structure and behavior.

```text
Variable
→ configuration/value

Parameter
→ pipeline structure/input
```

---

#### Q25. What are the Azure Pipeline expression types?

#### Macro

```text
$(variable)
```

> Evaluated during task execution.

#### Template expression

```text
${{ parameters.name }}
```

> Evaluated during template expansion/compile time.

#### Runtime expression

```text
$[ ... ]
```

> Evaluated at runtime for conditions and expressions.

---

### 5. Parameters

#### Q26. Why use parameters?

> Parameters allow reusable templates to accept inputs and change pipeline structure at compile time.

Example:

```yaml
parameters:
- name: environment
  type: string
  default: dev
```

---

#### Q27. Variable vs parameter — interview example?

> If I need to pass an environment name as configuration, I can use a variable. If I want to decide whether a particular stage or job exists in the generated pipeline, I would use a parameter.

---

### 6. Artifacts

#### Q28. What is an artifact?

> An artifact is the output/package produced by a build that can be consumed by later stages or deployment pipelines.

```text
Source
 ↓
Build
 ↓
Artifact
 ↓
DEV
 ↓
QA
 ↓
PROD
```

---

#### Q29. Why use artifacts?

> To separate **build from deployment** and promote the same tested artifact through environments.

#### Senior answer:

> **Build once and deploy the same immutable artifact across environments.**

---

#### Q30. Artifact vs source code?

> Source code is the input to the pipeline. Artifact is the validated output produced by the pipeline.

---

### 7. Templates

#### Q31. What are pipeline templates?

> Templates allow common pipeline logic to be reused across multiple pipelines.

Example:

```text
templates/
 ├── build.yml
 ├── security.yml
 └── deploy.yml
```

---

#### Q32. Why use templates?

> To reduce duplication, standardize CI/CD processes and centrally maintain common pipeline logic.

---

#### Q33. What is a template repository?

> A repository containing reusable pipeline templates that can be consumed by multiple application repositories.

---

### 8. Agents

#### Q34. What is an Azure Pipelines Agent?

> An agent is the compute environment that executes pipeline jobs.

```text
Pipeline
   ↓
Agent
   ↓
Job
   ↓
Tasks
```

---

#### Q35. Microsoft-hosted vs Self-hosted agent?

| Microsoft-hosted                   | Self-hosted                            |
| ---------------------------------- | -------------------------------------- |
| Managed by Microsoft               | Managed by organization                |
| Fresh VM/image per job             | Persistent/custom environment possible |
| Easy setup                         | More administration                    |
| Public Azure DevOps service access | Can be placed in private network       |
| Limited customization              | High customization                     |

---

#### Q36. When would you use a self-hosted agent?

> When the pipeline needs access to private resources such as private AKS, internal databases, private endpoints or on-premises systems, or requires custom software/network configuration.

---

#### Q37. What is an Agent Pool?

> An agent pool is a collection of agents available to run pipeline jobs.

---

#### Q38. What are capabilities and demands?

> **Capabilities** describe what an agent has. **Demands** specify what capabilities a job requires.

Example:

```text
Agent capability:
docker=true

Job demand:
docker
```

---

### 9. Service Connections

#### Q39. What is a Service Connection?

> A service connection is a configured authentication connection that allows Azure Pipelines to access external services such as Azure, Docker registries or Kubernetes.

---

#### Q40. Why use Service Connections?

> To securely authenticate pipelines to external resources without hard-coding credentials in YAML.

---

#### Q41. What is an Azure Resource Manager service connection?

> It is a service connection that allows Azure DevOps pipelines to authenticate to Azure resources and perform authorized operations.

---

#### Q42. What is Workload Identity Federation?

> Workload Identity Federation allows Azure DevOps to authenticate to Microsoft Entra ID using an OIDC token instead of storing a long-lived client secret.

```text
Azure Pipeline
      ↓
OIDC Token
      ↓
Microsoft Entra ID
      ↓
Short-lived access token
      ↓
Azure Resource
```

---

#### Q43. WIF vs Client Secret?

| WIF                             | Client Secret                   |
| ------------------------------- | ------------------------------- |
| No long-lived secret            | Long-lived credential           |
| OIDC-based                      | Secret-based                    |
| Short-lived token               | Secret must be stored/rotated   |
| Reduces credential leakage risk | Higher secret-management burden |

---

#### Q44. How do you secure a Service Connection?

> Use workload identity federation where supported, least-privilege RBAC, restrict which pipelines can use the connection and avoid storing credentials in source code.

---

### 10. Environments

#### Q45. What is an Azure DevOps Environment?

> An environment represents a deployment target or boundary such as DEV, QA or PROD and provides deployment history, permissions, approvals and checks.

---

#### Q46. What are approvals and checks?

> They are controls that must be satisfied before a pipeline can access a protected resource or proceed with deployment.

Examples:

```text
Manual approval
Branch control
Business hours
Azure Monitor check
REST API check
```

---

#### Q47. How do you protect production?

> I use a dedicated production environment with approvals/checks, restricted permissions, controlled service connections and deployment policies.

---

#### Q48. Environment vs Service Connection?

> **Environment = where/under what deployment controls the application is deployed.**

> **Service Connection = how the pipeline authenticates to an external service.**

```text
Pipeline
   |
   +── Environment → PROD + approvals/checks
   |
   +── Service Connection → Azure authentication
```

---

### 11. Security

#### Q49. How do you secure Azure Pipelines?

> I use:
>
> 1. Least-privilege service connections
> 2. Workload Identity Federation
> 3. Secret variables/Key Vault
> 4. Protected environments
> 5. Branch policies
> 6. Required reviewers
> 7. Build validation
> 8. Restricted pipeline permissions
> 9. Security scanning
> 10. Self-hosted agents only where required and properly secured

---

#### Q50. How do you use Key Vault in a pipeline?

> I store secrets in Azure Key Vault and retrieve them securely during deployment using an appropriately authorized service connection or identity.

```text
Pipeline
   ↓
Service Connection / Identity
   ↓
Key Vault
   ↓
Secret
   ↓
Application deployment
```

Never:

```text
❌ password: MyPassword123
```

inside YAML.

---

#### Q51. What security scans would you add?

> I would include:

```text
SAST
 ↓
Secret Scan
 ↓
Dependency Scan
 ↓
IaC Scan
 ↓
Container Scan
 ↓
Security Gate
```

---

### 12. Deployment Strategies

#### Q52. What is rolling deployment?

> Gradually replace or update instances while keeping part of the application available.

---

#### Q53. What is blue-green deployment?

> Maintain two environments, Blue and Green, and switch traffic from the current environment to the new version after validation.

```text
Users
  ↓
Load Balancer
  ↓
Blue → Current
Green → New
```

---

#### Q54. What is canary deployment?

> Deploy the new version to a small percentage of users or instances first, monitor it, and gradually increase traffic if healthy.

```text
95% → Old
5%  → New
      ↓
Monitor
      ↓
25%
      ↓
50%
      ↓
100%
```

---

#### Q55. Rolling vs Blue-Green vs Canary?

| Strategy   | Main idea                             |
| ---------- | ------------------------------------- |
| Rolling    | Replace instances gradually           |
| Blue-Green | Switch between two environments       |
| Canary     | Gradually expose users to new version |

---

### 13. Deployment Jobs

#### Q56. What is a deployment job?

> A deployment job is a special Azure Pipelines job designed for deployments and can integrate with environments, deployment history, approvals and deployment strategies.

---

#### Q57. Why use deployment jobs?

> They provide better deployment tracking and integrate deployments with Azure DevOps environments and their controls.

---

### 14. Pipeline Conditions & Dependencies

#### Q58. How do you deploy PROD only after QA succeeds?

```yaml
dependsOn: QA

condition: succeeded()
```

Conceptually:

```text
Build
 ↓
QA
 ↓
PROD
```

---

#### Q59. How do you run cleanup even if deployment fails?

```yaml
condition: always()
```

---

#### Q60. How do you skip PROD for a feature branch?

> Use branch-based conditions or parameters.

Example concept:

```yaml
condition: and(
  succeeded(),
  eq(variables['Build.SourceBranch'], 'refs/heads/main')
)
```

---

### 15. Pipeline Failure Scenarios

#### Q61. Pipeline suddenly starts failing. What do you check?

> I check:

```text
1. Failed stage/job
2. Failed task
3. Error message/logs
4. Agent availability
5. Service connection
6. Secrets/variables
7. Dependencies
8. Network/connectivity
9. Recent code/config changes
10. External service health
```

---

#### Q62. Build succeeds but deployment fails. What do you check?

> I verify the artifact, deployment environment, service connection permissions, target resource health, network connectivity, configuration/secrets and deployment logs.

---

#### Q63. Pipeline cannot access Azure resources?

Check:

```text
Service Connection
       ↓
Authentication
       ↓
RBAC
       ↓
Pipeline authorization
       ↓
Network connectivity
       ↓
Target resource
```

---

#### Q64. Service connection authentication fails?

Check:

1. Service connection status
2. WIF/federated credential configuration
3. Entra identity/service principal
4. RBAC permissions
5. Subscription/tenant
6. Pipeline authorization
7. Expired credentials if secret-based

---

#### Q65. Deployment to private AKS fails from Microsoft-hosted agent. Why?

> The Microsoft-hosted agent may not have network access to the private AKS API endpoint. I would use an appropriately network-connected self-hosted/managed agent and verify DNS, routing, NSGs, firewall and AKS access.

```text
Microsoft-hosted Agent
        X
        |
   Private AKS

Self-hosted Agent
        ↓
      VNet
        ↓
   Private AKS
```

---

### 16. Advanced Interview Questions

#### Q66. How would you design an enterprise Azure DevOps pipeline?

> I would use YAML pipelines with reusable templates, separate Build and Deployment stages, immutable artifacts, security scanning, environment approvals/checks, Key Vault for secrets, workload identity federation for Azure authentication, least-privilege RBAC and self-hosted agents only where private connectivity is required.

```text
Developer
   ↓
Azure Repos
   ↓
PR + Branch Policy
   ↓
Build
   ↓
Test
   ↓
Security Scan
   ↓
Artifact
   ↓
DEV
   ↓
QA
   ↓
Approval
   ↓
PROD
```

---

#### Q67. Why build once and deploy many?

> To ensure that the exact artifact tested in earlier environments is the artifact deployed to production.

```text
Source
 ↓
Build ONCE
 ↓
Artifact
 ├── DEV
 ├── QA
 └── PROD
```

---

#### Q68. How do you prevent unauthorized production deployment?

> I protect the production environment with permissions, approvals/checks, branch policies, controlled service connections and pipeline authorization.

---

#### Q69. How do you prevent secrets from leaking?

> I use Key Vault or secret variables, avoid hard-coding secrets, map secrets only where required, restrict access and ensure scripts do not print sensitive values.

---

#### Q70. What is pipeline authorization?

> Pipeline authorization controls whether a pipeline is allowed to consume protected resources such as service connections, variable groups, environments or agent pools, depending on their security configuration.

---

#### Q71. What happens if two pipelines deploy simultaneously to production?

> I would use environment/resource controls, deployment strategy and appropriate concurrency controls so deployments don't conflict.

---

#### Q72. How do you roll back a deployment?

> Ideally I redeploy the previously validated immutable artifact or use the platform's supported rollback mechanism. I avoid rebuilding different source code just to perform a rollback.

---

#### Q73. How do you implement zero-downtime deployment?

> I use an appropriate strategy such as rolling, blue-green or canary deployment, combined with health probes, readiness checks and controlled traffic switching.

---

### 17. Azure Pipelines + Terraform

#### Q74. How do you deploy Terraform through Azure Pipelines?

```text
Git
 ↓
PR
 ↓
terraform fmt
 ↓
terraform validate
 ↓
terraform plan
 ↓
Approval
 ↓
terraform apply
```

---

#### Q75. Should `terraform plan` and `apply` use different code?

> No. I prefer generating and reviewing a plan from the same code/version and applying the approved plan to maintain consistency.

---

#### Q76. Where do you store Terraform state?

> Usually in a secured remote backend such as Azure Storage, with appropriate access control, locking/concurrency handling and restricted permissions.

---

### 18. Azure Pipelines + Kubernetes

#### Q77. How do you deploy an application to AKS?

```text
Code
 ↓
Build
 ↓
Docker Image
 ↓
Container Scan
 ↓
Push to ACR
 ↓
Deploy to AKS
 ↓
Health Check
```

---

#### Q78. How does Azure Pipeline authenticate to AKS?

> Through an appropriately configured Kubernetes/Azure service connection or Azure identity mechanism, with the minimum required permissions.

---

#### Q79. What if AKS deployment succeeds but application is unavailable?

Check:

```text
Pod status
 ↓
Events
 ↓
Container logs
 ↓
Readiness/Liveness probes
 ↓
Service
 ↓
Endpoints
 ↓
Ingress
 ↓
DNS
 ↓
NSG / Firewall / Network
```

---

### 19. Senior Scenario Questions

#### Q80. Developer wants to deploy directly to PROD. What do you do?

> I would not allow unrestricted direct deployment. I would enforce branch policies, build validation, production environment approvals/checks and restricted deployment permissions.

---

#### Q81. How would you handle DEV, QA and PROD?

```text
Build
  ↓
Artifact
  ↓
DEV
  ↓
QA
  ↓
Approval
  ↓
PROD
```

> I build once and promote the same artifact through environments. Environment-specific configuration is injected during deployment rather than rebuilding the application.

---

#### Q82. How do you handle environment-specific secrets?

> Store secrets centrally in Key Vault and retrieve them during deployment using the appropriate identity/service connection. I don't create separate hard-coded secrets in YAML.

---

#### Q83. How do you reduce pipeline duplication?

> Use reusable YAML templates, template repositories, variable groups and standardized stages/jobs.

---

#### Q84. How do you make pipelines faster?

> I use caching where appropriate, parallel jobs, reusable build artifacts, optimized Docker builds, dependency caching and avoid unnecessary repeated work.

---

#### Q85. How do you secure self-hosted agents?

> Keep them patched, restrict network access, use dedicated pools where appropriate, minimize installed credentials, restrict pipeline access, monitor them and avoid running untrusted workloads on shared agents.

---

### 🔥 20 Questions You MUST Memorize

If you have very little time, memorize these:

```text
1. What is Azure Pipelines?
2. CI vs CD?
3. YAML vs Classic?
4. Stage vs Job vs Step vs Task?
5. CI trigger?
6. PR validation in Azure Repos?
7. Variable vs Parameter?
8. $( ) vs ${{ }} vs $[ ]?
9. Variable Group?
10. Artifact?
11. Build once, deploy many?
12. Microsoft-hosted vs Self-hosted agent?
13. Agent Pool?
14. Service Connection?
15. WIF vs Client Secret?
16. Environment?
17. Environment vs Service Connection?
18. Pipeline authorization?
19. How do you secure production?
20. How do you design an enterprise CI/CD pipeline?
```

### 🧠 30-Second Memory Map

```text
SOURCE
  ↓
Azure Repos
  ↓
PR + Branch Policy
  ↓
PIPELINE
  ↓
Stage
  ↓
Job
  ↓
Step
  ↓
Agent
  ↓
BUILD + TEST + SECURITY
  ↓
ARTIFACT
  ↓
ENVIRONMENT
  ↓
Approval / Checks
  ↓
Service Connection
  ↓
WIF / Entra ID
  ↓
Azure
```

#### ⭐ The 12 lines I would memorize word-for-word

> **Azure Pipelines = CI/CD automation.**

> **Stage = major pipeline boundary.**

> **Job = collection of steps executed together on an agent.**

> **Step = individual pipeline action.**

> **Task = predefined reusable action.**

> **Artifact = build output promoted between environments.**

> **Agent = where the pipeline executes.**

> **Service Connection = how the pipeline authenticates to an external service.**

> **Environment = deployment target plus deployment controls.**

> **Variable = configuration value.**

> **Parameter = compile-time pipeline input/structure.**

> **WIF = passwordless OIDC-based authentication using short-lived credentials.**

#### 🔥 Senior one-minute answer

> **"I use Azure Pipelines as a YAML-based CI/CD platform. Code changes go through Azure Repos branch policies and PR validation, then the pipeline builds, tests and security-scans the application and produces an immutable artifact. I promote that same artifact through DEV, QA and PROD using deployment jobs and environments. Production is protected using approvals, checks and restricted permissions. For Azure authentication I prefer service connections using workload identity federation with least-privilege RBAC. Secrets are stored in Key Vault, reusable YAML templates standardize the pipelines, and self-hosted agents are used when private network access or custom tooling is required."**
