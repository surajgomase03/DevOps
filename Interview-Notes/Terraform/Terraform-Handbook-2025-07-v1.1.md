# TERRAFORM HANDBOOK
### VERSION 1 | JULY 2025 | FOUNDATION EDITION
#### Production Notes + Interview Question Bank — Consolidated Markdown Edition

---

## 📌 Handbook Metadata

| Field | Value |
|---|---|
| **Version** | V1 — Foundation Edition (single active file — Rule 0) |
| **Month** | July 2025 |
| **Status** | ACTIVE — edited in place; frozen only on explicit "go with version 2" command (Rule 0.1) |
| **Next Version** | Created only on explicit command — no auto-versioning (Rule 0) |
| **Engineer** | Suraj Gomase — Senior DevOps Engineer, TCS |
| **Project** | UK Government DWP — CMG (Child Maintenance Group) |
| **Stack** | AWS EKS \| Jenkins \| Terraform \| Helm \| ArgoCD \| Vault |
| **Source** | Consolidated from `Terraform_NOTES_V1_July2025_Suraj.docx` + `Terraform_INTERVIEW_V1_July2025_Suraj.docx` |
| **Coverage** | Part 1: 15 Notes sections · Part 2: deduplicated interview index (131 questions cross-referenced) |
| **Rule** | Duplicate concepts never re-stored — see changelog for the consolidation pass |

---

## 📋 CHANGELOG — V1 (July 2025)

> **V1 — Initial Foundation — ALL NEW CONTENT**
>
> ✅ Part 1, Sections 1–14: Fundamentals, State, Drift, Modules, Advanced HCL, Providers/Imports, Security Groups, VPC Architecture, ALB, Security, IRSA, My Mistakes, Jenkins CI/CD, Cheat Sheet
>
> ✅ Part 2, Q1–Q136: Beginner → Intermediate → Advanced → Scenario-based → Rapid Fire → Mistake-based interview questions, each with detailed point-wise answer + 30-second answer
>
> NOTE: V2 will add NEW topics only and will reference this file for any foundational concepts already covered here — never repeated.

> NOTE: this file is edited in place going forward (Rule 0) — the
> "V2 will..." language above is superseded; a new file is only ever
> created on explicit command.

> **V1 — Interview Question Consolidation Pass**
>
> ✅ All 131 interview questions (Q1–Q85, Q91–Q120, Q121–Q136)
> analyzed and converted into structured concept notes. 24 new
> concepts added across §2, §3, §4, §5, §6, §10, §11, §12, §13, and a
> new §15 (Enterprise Architecture, Tooling & Operations). 9 existing
> sections enriched. Part 2 rebuilt from a 136-entry Q&A bank into a
> lean cross-reference index — full detail: see the summary at the end
> of Part 2.

> **V1 — Consolidation Update — Section 1.5 Completed (Rule 6)**
>
> ✅ Section 1.5 Variables was previously a summary. Rewritten as the
> COMPLETE topic per Rule 6, merging in: the 3 core variable types
> (Input / Local / Output), supported data types (primitives +
> complex collections), key optional arguments (default, sensitive,
> validation), variable referencing syntax, and the full list of
> value-assignment sources (CLI flags, auto-loaded files, env vars,
> defaults). Everything else in Part 1 and Part 2 was already complete
> and is unchanged — no duplication.

---

## Table of Contents

**PART 1 — PRODUCTION NOTES**

| # | Section |
|---|---|
| 01 | Terraform Fundamentals — Workflow, Building Blocks, Variables |
| 02 | State Management — State File, Remote State, S3+DynamoDB, Commands |
| 03 | State Drift — Detection, Root Causes, Remediation, Prevention |
| 04 | Modules — Design Patterns, CMG Structure, Interface, Communication |
| 05 | Advanced HCL — count vs for_each, Lifecycle Rules, Locals, Dynamic Blocks |
| 06 | Providers & Imports — Version Pinning, Lock File, Import Block |
| 07 | Security Groups — 3-Tier Design, Circular Deps, Default SG |
| 08 | AWS VPC Architecture — 3-Tier, HA Rules, EC2 Placement, CIDR |
| 09 | ALB — Config Rules, Access Logs, Target Groups, TLS Policy |
| 10 | Security — IAM, IMDSv2, EBS, AMI, Keypair, Secrets Management |
| 11 | IRSA & EKS Operations — OIDC + Trust Policy + Zero-Downtime Upgrades + Add-ons |
| 12 | My Mistakes — 10 Categories, 30+ Real Mistakes with Fixes |
| 13 | CI/CD Pipeline — Jenkins Production Config + GitOps Comparison |
| 14 | V1 Quick Reference Cheat Sheet |
| 15 | Enterprise Architecture, Tooling & Operations — 15 subsections |

**PART 2 — INTERVIEW QUESTION INDEX (131 Questions, Deduplicated)**

| # | Section | Range |
|---|---|---|
| 1 | Beginner | Q1–Q20 |
| 2 | Intermediate | Q21–Q50 |
| 3 | Advanced | Q51–Q75 |
| 4 | Scenario-Based | Q76–Q90 |
| 5 | Rapid Fire | Q91–Q120 |
| 6 | My Mistakes (as interview Q&A) | Q121–Q136 |

---

## 📊 Coverage Tracker — vs. Full 54-Topic Learning Order

Tracked against the master-prompt learning order (Introduction → Enterprise Best Practices). Legend: ✅ Fully Covered · 🟡 Partial · ⬜ Pending (candidate for V2+).

| # | Topic | Status | Where |
|---|---|---|---|
| 1 | Introduction to IaC | ✅ | §1 |
| 2 | Installing Terraform | ⬜ | — |
| 3 | Terraform CLI | ✅ | §1 |
| 4 | init/validate/fmt/plan/apply/destroy | ✅ | §1 |
| 5 | Providers | ✅ | §6 |
| 6 | Resources | ✅ | §1 |
| 7 | Variables | ✅ | §1 |
| 8 | Outputs | 🟡 | §4 |
| 9 | Data Sources | ✅ | §10.1, §2.8 (terraform_remote_state) |
| 10 | Locals | ✅ | §5 |
| 11 | Expressions & Functions | ✅ | §5.6 (for), §5.7 (cidrsubnet), §14 |
| 12 | Conditionals | ⬜ | — |
| 13 | count | ✅ | §5 |
| 14 | for_each | ✅ | §5 |
| 15 | Dynamic Blocks | ✅ | §5 |
| 16 | Modules | ✅ | §4 |
| 17 | Module Sources | 🟡 | §4.6 (Git tag versioning) |
| 18 | Backend | ✅ | §2 |
| 19 | State File | ✅ | §2 |
| 20 | Remote State | ✅ | §2 |
| 21 | State Commands | ✅ | §2, §14 |
| 22 | State Locking | ✅ | §2.2, §2.9, §2.12(a) |
| 23 | Import | ✅ | §6 |
| 24 | Moved Blocks | ✅ | §2.6, §14 |
| 25 | Lifecycle | ✅ | §5 |
| 26 | depends_on | 🟡 | §12.5 |
| 27 | Provisioners | ⬜ | — |
| 28 | Connection Blocks | ⬜ | — |
| 29 | Workspaces | ✅ | §2.7 |
| 30 | Environment Management | ✅ | §2.3, §2.11 |
| 31 | Sensitive Variables | ✅ | §1.5, §14 |
| 32 | Validation | 🟡 | §1.5, §4.6 |
| 33 | Preconditions/Postconditions | ⬜ | — |
| 34 | Terraform Console | ✅ | §15.11 |
| 35 | Graph | ✅ | §15.6 |
| 36 | Debugging | ✅ | §3, §12, §15.15 |
| 37 | Testing | ✅ | §4.7 (Terratest), §15.3 (policy as code) |
| 38 | CI/CD Integration | ✅ | §13 |
| 39 | AWS Provider | ✅ | §7–§11 |
| 40 | Azure Provider | ⬜ | — |
| 41 | GCP Provider | ⬜ | — |
| 42 | Kubernetes & Helm Providers | ⬜ | — |
| 43 | Security | ✅ | §7, §10, §15.12 |
| 44 | Performance | 🟡 | §15.7 (-parallelism) |
| 45 | Cost Optimization | ✅ | §15.13 |
| 46 | Production Folder Structure | 🟡 | §4 |
| 47 | Reusable Modules | ✅ | §4 |
| 48 | Disaster Recovery | ✅ | §15.5 |
| 49 | Troubleshooting | ✅ | §3, §12, §15.15 |
| 50 | Enterprise Best Practices | ✅ | §15 throughout |
| 51 | Hands-on Labs | ⬜ | — |
| 52 | Interview Preparation | ✅ | Part 2 index (131 Q cross-referenced) |
| 53 | Cheat Sheets | ✅ | §14 |
| 54 | Revision Notes | 🟡 | §14 |

**Pending (⬜, candidates for the next in-place addition):** Installing
Terraform, Conditionals, Provisioners/Connection Blocks,
Preconditions/Postconditions, Azure/GCP/Kubernetes providers,
Hands-on Labs.

---

# PART 1 — PRODUCTION NOTES


### SECTION 1 [ V1 CORE CONCEPTS ] — TERRAFORM FUNDAMENTALS


**1.1 What is Terraform?**

- Open-source Infrastructure as Code (IaC) tool by HashiCorp — define
  infrastructure in code.

- Declarative — you state WHAT you want; Terraform computes HOW to
  achieve it.

- Multi-cloud — AWS, Azure, GCP, Kubernetes, and 3,000+ providers from
  one tool.

- Idempotent — running same config multiple times always gives same
  result.

- Uses HCL (HashiCorp Configuration Language) — readable, concise,
  structured.

- CMG: all 200+ AWS resources (VPC, EKS, IAM, SGs, CloudWatch) managed
  via Terraform.

**1.2 Why Terraform Over Manual / Console?**

|                                               |                                                |
|-----------------------------------------------|------------------------------------------------|
| **Problem Without Terraform**                 | **Solution With Terraform**                    |
| Manual clicks — error-prone, not reproducible | Code defines infra — same result every time    |
| No audit trail — who changed what?            | Git history — every change tracked with author |
| Different envs drift over time                | Same code → identical dev, UAT, prod           |
| Hard to share knowledge                       | Code is documentation — self-explaining        |
| AWS-only tools (CloudFormation)               | One tool for all clouds                        |

**1.3 Core Workflow — Every Step**

|                                                                   |
|-------------------------------------------------------------------|
| terraform init \# Download providers, setup backend, init modules |
| terraform validate \# Syntax + config check — no AWS calls — fast |
| terraform fmt \# Auto-format code — run before every commit       |
| terraform plan -out=plan.out \# Preview changes — SAVE to file    |
| terraform apply plan.out \# Execute EXACT saved plan              |
| terraform destroy \# Tear down all managed resources              |

> **CI/CD Pipeline Order**
>
> init → validate → fmt -check → tfsec scan → plan -out → approval gate → apply saved plan
>
> Always save plan with -out. Apply the saved file. What you reviewed = what gets applied.


**1.4 The 6 Core Building Blocks**

|              |                                             |                                             |
|--------------|---------------------------------------------|---------------------------------------------|
| **Block**    | **Role**                                    | **Example**                                 |
| terraform {} | Version + backend + required providers      | required_version = "\>= 1.5"                |
| provider {}  | Cloud plugin — auth, region                 | provider "aws" { region = var.region }      |
| resource {}  | Infrastructure to create — tracked in state | resource "aws_vpc" "main" { ... }           |
| variable {}  | Declare input parameters                    | variable "env" { type = string }            |
| output {}    | Export values after apply                   | output "vpc_id" { value = aws_vpc.main.id } |
| data {}      | Read existing resources — no create         | data "aws_ami" "latest" { ... }             |

**1.5 Variables — Full Flow**

- Variables let you parameterize Infrastructure as Code (IaC) instead
  of hardcoding static values into every resource block.

- Terraform actually splits "variables" into **3 distinct types** —
  people casually call all of them "variables," but they behave very
  differently:

|                          |                                                                                    |
|--------------------------|-------------------------------------------------------------------------------------|
| **Type**                 | **Role**                                                                          |
| Input Variables (`variable {}`) | Parameters passed IN from outside to customize a deployment                |
| Local Values (`locals {}`)      | Internal, computed values — private to the module, cannot be set externally |
| Output Values (`output {}`)     | Data returned OUT after apply — e.g. a server IP or DB endpoint             |

> **❌ Real Mistake — variables.tf vs tfvars**
>
> Assigned values in terraform.tfvars but forgot to DECLARE in variables.tf.
>
> Terraform error: "Reference to undeclared input variable"
>
> RULE: variables.tf = DECLARE. terraform.tfvars = ASSIGN.
>
> Flow: terraform.tfvars → variables.tf (declaration) → var.name in main.tf

**Declaring an Input Variable**

- Input variables are formally defined inside a `variable` block,
  usually organized in a standalone `variables.tf` file.

```hcl
variable "instance_type" {
  type        = string
  description = "The sizing type of the cloud virtual machine"
  default     = "t2.micro"
  sensitive   = false
}
```

**Supported Data Types**

- Terraform strictly enforces variable data constraints. Supported
  types are:

|                         |                                             |
|-------------------------|---------------------------------------------|
| **Category**            | **Types**                                  |
| Primitives               | string, number, bool                       |
| Complex Collections      | list, map, set, object, tuple              |

**Key Optional Arguments**

|                |                                                                                  |
|----------------|------------------------------------------------------------------------------------|
| **Argument**   | **Purpose**                                                                     |
| default        | Sets a fallback value. If omitted, the variable becomes mandatory at runtime.  |
| sensitive      | When `true`, masks the value in CLI output and logs — prevents password/token exposure. |
| validation     | Enforces formatting or range conditions before `terraform plan` runs.         |

**Referencing Variables**

- Once declared, call a variable anywhere in resource code using the
  `var.` prefix.

```hcl
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type  # References the variable declared above
}
```

**Assigning Variable Values — Sources**

- You can inject actual values at runtime through several avenues.
  Terraform picks the highest-priority source available:

|                       |                                                                          |
|-----------------------|----------------------------------------------------------------------------|
| **Source**            | **How**                                                                 |
| CLI Flags             | Directly override via `terraform apply -var="instance_type=t3.medium"` |
| Auto-loaded Files     | Values in `terraform.tfvars` or any `*.auto.tfvars` file — loaded automatically |
| Environment Variables | OS-level vars prefixed `TF_VAR_` — e.g. `TF_VAR_instance_type`        |
| Default Values        | The `default` set inside the `variable {}` block itself                |

**Full Declare → Assign → Use Flow**

|                                                               |
|---------------------------------------------------------------|
| \# variables.tf — DECLARE                                     |
| variable "environment" {                                      |
| description = "Deployment environment"                        |
| type = string                                                 |
| validation {                                                  |
| condition = contains(\["dev","uat","prod"\], var.environment) |
| error_message = "Must be dev, uat, or prod."                  |
| }                                                             |
| }                                                             |
|                                                               |
| \# terraform.tfvars — ASSIGN                                  |
| environment = "prod"                                          |
| vpc_cidr = "10.0.0.0/16"                                      |
|                                                               |
| \# main.tf — USE                                              |
| resource "aws_vpc" "main" { cidr_block = var.vpc_cidr }       |

**1.6 Variable Precedence (highest → lowest)**

|              |                           |                                       |
|--------------|---------------------------|---------------------------------------|
| **Priority** | **Source**                | **Example**                           |
| 1            | CLI -var flag             | terraform apply -var="env=prod"       |
| 2            | -var-file flag            | terraform apply -var-file=prod.tfvars |
| 3            | .auto.tfvars              | prod.auto.tfvars (auto-loaded)        |
| 4            | terraform.tfvars          | terraform.tfvars (auto-loaded)        |
| 5            | TF_VAR\_ env var          | export TF_VAR_environment=prod        |
| 6            | Default in variable block | variable "x" { default = "dev" }      |

### SECTION 2 [ V1 CRITICAL TOPIC ] — STATE MANAGEMENT


**2.1 What Is the State File?**

- terraform.tfstate — JSON file mapping every .tf resource to a real AWS
  resource.

- Stores: resource IDs, ARNs, ALL attributes, dependencies, outputs,
  provider metadata.

- Also stores two tracking fields: **serial** — increments on every
  state write, out-of-order writes signal corruption; **lineage** — a
  unique UUID for this state's history that never changes.

- Terraform reads state before EVERY plan to compute what needs to
  change.

- Without state: Terraform cannot know what exists — recreates
  everything every apply.

- State is NOT a backup — it is METADATA about infrastructure.

- State contains secrets (RDS passwords, EKS endpoints) — treat as
  highly sensitive.

> **CRITICAL Security Rules for State**
>
> NEVER commit .tfstate to Git — add *.tfstate to .gitignore
>
> ALWAYS encrypt S3 state bucket with KMS (customer-managed key)
>
> ALWAYS restrict S3 access via bucket policy to minimum IAM roles
>
> ALWAYS enable S3 versioning — enables recovery from accidental deletion
>
> ALWAYS enable DynamoDB locking — prevents concurrent corruption
>
> ALWAYS block all S3 public access — state must NEVER be public
>
> Consider MFA delete on the state bucket — extra protection against
> accidental/malicious deletion
>
> Enable CloudTrail on the state bucket — audit every read/write to
> the state file


**2.2 Remote State — S3 + DynamoDB (CMG Pattern)**

|                                                       |
|-------------------------------------------------------|
| \# backend.tf — full CMG production config            |
| terraform {                                           |
| backend "s3" {                                        |
| bucket = "cmg-terraform-state-prod"                   |
| key = "eks/prod/terraform.tfstate"                    |
| region = "eu-west-2"                                  |
| encrypt = true                                        |
| kms_key_id = "arn:aws:kms:eu-west-2:...:key/prod-key" |
| dynamodb_table = "cmg-terraform-locks"                |
| }                                                     |
| }                                                     |

**2.3 Partial Backend Config — Dynamic Per Environment**

|                                                                        |
|------------------------------------------------------------------------|
| \# backend.tf — shell only (no dynamic values)                         |
| terraform { backend "s3" { region = "eu-west-2" } }                    |
|                                                                        |
| \# backends/prod.tfvars — passed at jenkins init stage                 |
| bucket = "cmg-terraform-state-prod"                                    |
| key = "eks/prod/terraform.tfstate"                                     |
| dynamodb_table = "cmg-terraform-locks-prod"                            |
| kms_key_id = "arn:aws:kms:..."                                         |
|                                                                        |
| \# Jenkins: selects config based on branch name                        |
| terraform init -backend-config=backends/\${TF_ENV}.tfvars -reconfigure |

> **📌 Remember — `-migrate-state`**
>
> Add `-migrate-state` to `terraform init -backend-config=...` when
> switching an existing environment to a NEW backend (not just
> re-pointing to the same one). It copies existing state into the new
> backend automatically instead of starting empty.

**2.4 Environment Isolation Rules**

- Separate S3 bucket per environment — cmg-state-dev, cmg-state-uat,
  cmg-state-prod.

- Separate DynamoDB lock table per environment — cmg-locks-dev,
  cmg-locks-uat, cmg-locks-prod.

- Separate KMS key per environment — prod key must NEVER decrypt dev
  state.

- Separate IAM role per environment — Jenkins dev role cannot write to
  prod state bucket.

- S3 bucket policy DENY all except the specific Jenkins IAM role for
  that environment.

**2.5 All State Commands with Purpose**

|                               |                                      |                                             |
|-------------------------------|--------------------------------------|---------------------------------------------|
| **Command**                   | **What It Does**                     | **When To Use**                             |
| terraform state list          | List all tracked resources           | Verify resources after import or migration  |
| terraform state show \<addr\> | Show full attributes of one resource | Compare vs real AWS for drift investigation |
| terraform state mv src dst    | Rename resource — no destroy         | Before renaming resource in .tf code        |
| terraform state rm \<addr\>   | Remove from state — AWS untouched    | Decommissioning resource from TF management |
| terraform state pull          | Download state to stdout             | Backup before any state surgery             |
| terraform state push file     | Upload state to backend              | Emergency restore — DANGEROUS               |
| terraform import addr id      | Adopt existing resource into state   | Migrating existing AWS resources to TF      |
| terraform force-unlock ID     | Remove stuck DynamoDB lock           | After confirming NO active apply            |
| terraform plan -refresh-only  | Detect drift — no config changes     | Nightly drift detection cron                |
| terraform apply -refresh-only | Accept drift into state              | After reviewing and approving drift         |

**2.6 Renaming Resources Without Recreation**

> **Renaming in .tf code without state action = DESTROY + CREATE**
>
> Old name in state + new name in code = Terraform treats as delete old + create new.
>
> For EKS cluster: that means full cluster destruction and recreation = data loss + downtime.


|                                                                            |
|----------------------------------------------------------------------------|
| \# Method 1: terraform state mv (all versions)                             |
| terraform state mv aws_security_group.old module.sg.aws_security_group.eks |
| terraform plan \# Must show: No changes.                                   |
|                                                                            |
| \# Method 2: moved block (Terraform 1.1+) — preferred                      |
| moved {                                                                    |
| from = aws_security_group.old                                              |
| to = module.sg.aws_security_group.eks                                      |
| }                                                                          |
| \# Shows in plan output before applying — Git-tracked, reviewable          |
| \# Remove moved block after successful apply                               |

|                       |                                  |                                       |
|-----------------------|----------------------------------|----------------------------------------|
| **Aspect**            | **terraform state mv**          | **moved {} block**                   |
| Terraform version     | All versions                    | 1.1+                                 |
| Audit trail           | Not in Git — shell history only | In .tf code — Git-tracked, in PR     |
| Review before apply   | No — executed immediately       | Yes — shows in plan output first     |
| Rollback              | Manually reverse the command    | Revert code in Git                   |
| Risk                  | Higher — no plan preview        | Lower — plan shows move before apply |
| Best for              | Quick one-off renames           | Production code refactoring          |

**2.7 Workspaces vs Separate Backends**

- Workspaces let you manage multiple environments from the SAME config
  — each gets its own state, same backend.

- Commands: `terraform workspace new dev`, `select prod`, `list`,
  `show` (prints current active workspace name), `delete`.

- Workspaces share the SAME S3 bucket with different state key
  prefixes — weaker security isolation than separate backends.

- Separate backends give each environment its own S3 bucket, DynamoDB
  table, and KMS key — stronger isolation, more setup.

|                      |                                       |                                                 |
|----------------------|----------------------------------------|--------------------------------------------------|
| **Aspect**           | **Workspaces**                       | **Separate Backends**                          |
| State storage        | Same S3 bucket, different key prefix | Separate S3 buckets                            |
| Security isolation   | Weaker — same bucket policy          | Stronger — separate bucket policies + KMS keys |
| Setup complexity     | Simple                               | More setup                                     |
| Team access control  | Harder to restrict by env            | Easy — IAM role per environment                |

- CMG uses both: workspace for environment naming convenience +
  separate backend configs for actual isolation.

**2.8 terraform_remote_state — Cross-State Data Sharing**

- Reads output values from another Terraform state file — enables
  loosely-coupled, independently-owned infrastructure.

- Use case: a networking team manages the VPC independently; the EKS
  team reads VPC outputs without owning that state.

- Separate state files = separate blast radius — a bug in one config
  cannot corrupt another team's state, and each team applies
  independently.

|                                                                                              |
|------------------------------------------------------------------------------------------------|
| data "terraform_remote_state" "vpc" {                                                        |
| backend = "s3"                                                                               |
| config = { bucket="cmg-state-prod", key="networking/terraform.tfstate", region="eu-west-2" } |
| }                                                                                            |
| module "eks" {                                                                               |
| vpc_id = data.terraform_remote_state.vpc.outputs.vpc_id                                      |
| private_subnet_ids = data.terraform_remote_state.vpc.outputs.private_subnet_ids              |
| }                                                                                            |

**2.9 What Breaks Without State Locking — Concurrent Apply Corruption**

> **❌ Real Mistake — Two Engineers Applying Simultaneously**
>
> Both engineers read state at the same snapshot (T=0). Engineer A
> creates Resource X and writes state (serial N+1). Engineer B — still
> working from the T=0 snapshot — creates Resource Y and writes state,
> OVERWRITING Engineer A's change.
>
> Final state has Y but NOT X. Resource X is now an orphan — it exists
> in AWS but not in state. The next plan tries to create X again,
> causing a duplicate-resource error.
>
> RECOVERY: restore state from S3 versioning → `terraform import` the
> orphaned resource → verify `terraform plan` shows 0 changes.
>
> PREVENTION: DynamoDB locking is a one-time 5-minute setup that
> prevents this permanently — see 2.2.

**2.10 Multi-Cloud State Isolation**

- NEVER mix AWS and Azure/GCP resources in one Terraform config — a
  provider error blocks the whole apply.

- Use separate Terraform directories per cloud — separate state,
  separate IAM/auth, separate CI/CD pipeline.

- State for all clouds can still live in one S3 bucket with separate
  key paths — e.g. `aws/prod`, `azure/prod`, `gcp/prod` — giving one
  central audit trail.

- Auth uses each cloud's native method: IAM Role for AWS, OIDC for
  Azure/GCP — no long-lived credentials anywhere.

- Cross-cloud communication happens via `terraform_remote_state` (2.8)
  or shared variable files — never a mixed-provider config.

**2.11 Migrating Environments Off a Shared Backend**

> **❌ Real Mistake — Three Environments, One Backend**
>
> Dev, UAT, and prod accidentally shared one remote backend. Risk: one
> bad apply can touch all three environments, lock contention across
> teams, and zero security isolation between environments.

Safe separation procedure:

1. Announce a maintenance window — freeze ALL pipeline runs.
2. Backup current shared state: `terraform state pull >
   shared-backup-YYYYMMDD.json`.
3. Create separate S3 buckets + DynamoDB tables + KMS keys per
   environment.
4. For each environment: select its workspace, then run
   `terraform init -backend-config=backends/<env>.tfvars -migrate-state
   -reconfigure` — this copies state to the new backend automatically.
5. `terraform state list` — verify all resources migrated.
6. `terraform plan` — must show 0 changes for that environment.
7. Repeat steps 4–6 for every remaining environment.
8. Update CI/CD pipelines to use the new per-environment backend
   configs.
9. Delete the old shared backend ONLY after 48 hours of confirmed
   stable operation on the new backends.

**2.12 State & Infrastructure Recovery Playbook**

*(a) Stuck DynamoDB lock*

1. Confirm NO active apply — check CI/CD for any running pipeline.
2. Get lock details: `aws dynamodb get-item --table-name
   cmg-terraform-locks --key '{"LockID":{"S":"<state-key>"}}'`.
3. Check the lock's "Created" timestamp — 30+ minutes old with no
   active build means it is stuck.
4. `terraform force-unlock LOCK_ID` — confirm with "yes".
5. `terraform plan -refresh-only` to verify state integrity after
   unlock.
6. Post-incident: alert when lock age exceeds 30 minutes.

*(b) Corrupted or deleted state file*

1. STOP all Terraform operations immediately.
2. List S3 object versions for the state key: `aws s3api
   list-object-versions --bucket <bucket> --prefix <state-key>`.
3. Identify the pre-corruption version by timestamp.
4. Restore it: `aws s3api copy-object --bucket <bucket> --copy-source
   "<bucket>/<key>?versionId=GOOD_VERSION" --key <key>`.
5. `terraform plan -refresh-only` to find any drift since the restored
   snapshot.
6. `terraform import` any resources created after the restored
   snapshot.
7. `terraform plan` must show 0 changes to confirm full recovery.
8. This is why S3 versioning on the state bucket is mandatory — it IS
   the entire recovery mechanism.

*(c) Uncontrolled apply / accidental destroy (e.g. `-auto-approve`
during an incident, or a wrongly-run `terraform destroy`)*

1. STOP — do not run further Terraform commands until damage is
   assessed.
2. Declare a Sev-1 incident — notify team lead/stakeholders, revoke
   the actor's access if it was a mistaken/malicious action.
3. Pull the CI/CD log — list every resource created, modified, or
   destroyed.
4. Freeze the pipeline to prevent accidental re-runs.
5. Restore state from S3 versioning (procedure `(b)` above) for any
   destroyed resources.
6. For wrongly-created resources: `terraform state rm` + remove from
   `.tf` + `terraform destroy -target`.
7. `terraform apply` recreates destroyed infrastructure from the
   restored state (CMG: ~20 min for 200+ resources); redeploy
   applications via the app-layer GitOps tool afterwards.
8. Verify: `terraform plan -refresh-only` must show 0 drift.
9. Permanent fix: remove `-auto-approve` from all pipelines, add a
   manual approval gate, add `prevent_destroy` to all critical prod
   resources, and add an SCP blocking destructive delete APIs at the
   org level for anyone but the pipeline role.

*(d) Resource deleted manually outside Terraform*

|                          |                                |                                              |
|--------------------------|--------------------------------|----------------------------------------------|
| **Resource deleted**     | **Terraform action next plan** | **Data loss?**                               |
| EC2 instance             | Recreates from config          | In-memory data + EBS if not separate         |
| RDS instance             | Recreates empty database       | YES — all data gone — restore snapshot first |
| S3 bucket (with objects) | Recreates empty bucket         | YES — objects gone forever                   |
| EKS cluster              | Full cluster recreation ~20min | No — workloads need redeployment             |
| IAM role                 | Recreates role + attachments   | No — safe                                    |

- If the resource should stay deleted instead: `terraform state rm
  <addr>` → remove from `.tf` code → commit.
- Prevention: `prevent_destroy = true` on critical resources, plus
  CloudTrail → EventBridge → SNS alerting on deletion of critical
  resource types.

*(e) Rollback philosophy*

- Terraform has **no built-in rollback** — it is forward-only by
  design.
- To "undo": either fix the issue in code and re-apply toward the
  desired state, or restore the pre-apply state from S3 versioning and
  apply to revert.
- S3 versioning is the rollback mechanism — this is why it is
  mandatory, not optional.
- Prevention: always use `plan -out` and review the plan before
  `apply`.

### SECTION 3 [ V1 STATE ] — STATE DRIFT — DETECTION & REMEDIATION


**3.1 What Is Drift and Why It Happens**

- Drift = real AWS infrastructure differs from what Terraform state
  believes.

- Causes: manual console changes, auto-scaling events, external
  automation, broken pipelines.

- Danger: next plan may revert a legitimate emergency fix or create
  duplicate resources.

**3.2 Detection Commands**

|                                                                        |
|------------------------------------------------------------------------|
| \# Primary drift detection command                                     |
| terraform plan -refresh-only                                           |
| \# Exit 0 = no drift (state matches real AWS)                          |
| \# Exit 2 = drift detected (what changed shown in output)              |
|                                                                        |
| \# CI/CD-friendly with explicit exit codes                             |
| terraform plan -refresh-only -detailed-exitcode                        |
| \# Exit 0=clean \| Exit 1=error \| Exit 2=changes present              |
|                                                                        |
| \# Investigate specific resource drift                                 |
| terraform state show module.eks.aws_eks_cluster.main \# What TF thinks |
| aws eks describe-cluster --name cmg-eks-prod \# What AWS has           |

**3.3 Drift Response Decision Tree**

> **DRIFT RESPONSE — WHAT TO DO**
>
> TYPE 1: Emergency ops fix (SG rule opened for incident)
>
> → DO NOT revert. Add to .tf code. Commit. Apply.
>
> TYPE 2: Auto-scaling changed desired_count
>
> → Add lifecycle { ignore_changes = [scaling_config[0].desired_size] }
>
> TYPE 3: Console tag added by monitoring tool
>
> → Add ignore_changes = [tags["LastScanned"]] or add tag to .tf
>
> TYPE 4: Unexplained mutation
>
> → Check CloudTrail FIRST. Could be unauthorised change.
>
> → aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=...
>
> RULE: NEVER blindly run apply -refresh-only without reviewing all drift items.


**3.4 Automated Nightly Drift Detection (CMG)**

|                                                                                            |
|--------------------------------------------------------------------------------------------|
| triggers { cron('0 2 \* \* \*') } // 2 AM daily                                            |
|                                                                                            |
| stage("Drift Check") {                                                                     |
| steps {                                                                                    |
| script {                                                                                   |
| def rc = sh(script: "terraform plan -refresh-only -detailed-exitcode", returnStatus: true) |
| if (rc == 2) {                                                                             |
| slackSend(channel:'#infra-alerts', color:'danger',                                         |
| message:'DRIFT DETECTED in \${TF_ENV}!')                                                   |
| error('Drift found — manual review required')                                              |
| }                                                                                          |
| }                                                                                          |
| }                                                                                          |
| }                                                                                          |

**3.5 -refresh=false vs -refresh-only vs Default — Why "0 Changes" Can Lie**

|                     |                                                              |                    |                                       |
|---------------------|--------------------------------------------------------------|--------------------|---------------------------------------|
| **Flag**            | **What It Does**                                             | **AWS API Calls?** | **Use Case**                          |
| -refresh=false      | Reads state file only — skips AWS API calls completely       | No                 | NEVER in prod — hides all drift       |
| -refresh-only       | Compares real AWS vs state — shows drift without config diff | Yes                | Drift detection, nightly cron         |
| Default (no flag)   | Refreshes state from AWS + computes config diff              | Yes                | Normal plan/apply cycle               |
| apply -refresh-only | Updates state to match real AWS — accepts drift              | Yes                | Accepting legitimate drift into state |

> **❌ Real Mistake — "0 Changes" Despite Real Drift**
>
> A plan showed zero changes even though infrastructure had been
> modified outside Terraform. Root causes, most common first: (1)
> `-refresh=false` was set in the pipeline — it reads the state file
> only and never calls AWS, so drift is completely invisible; (2) the
> modified attribute is inside `ignore_changes` — intentionally hidden
> from Terraform; (3) the resource isn't in state at all.
>
> RULE: NEVER use `-refresh=false` in production pipelines. Confirm any
> suspected case with `terraform plan -refresh-only`, which forces a
> real AWS comparison — exit code 2 confirms drift.

**3.6 Prevention Checklist — Systemic Fixes**

- Nightly drift detection: `terraform plan -refresh-only` + Slack alert
  on exit code 2 (see 3.4).
- Remove `-refresh=false` from every pipeline — it is the single
  biggest cause of invisible drift.
- CloudTrail → EventBridge → SNS alerting on deletion of critical
  resource types (`DeleteCluster`, `DeleteDBInstance`,
  `TerminateInstances`).
- Monthly state audit: `terraform state list` cross-checked against
  the real AWS resource inventory.
- A long stretch with no drift detection usually means these controls
  are missing, not that drift never happened — treat "state believes a
  resource exists that was actually deleted weeks ago" as a process
  gap to fix, not just a one-off cleanup.

### SECTION 4 [ V1 MODULES ] — MODULES — DESIGN & COMMUNICATION


**4.1 Module Fundamentals**

- A module is any directory containing .tf files — even a single file
  qualifies.

- Root module = directory you run terraform from — owns backend, calls
  child modules.

- Child modules = reusable packages with defined inputs (variables) and
  outputs.

- Module = function: Variables = parameters. Resources = body. Outputs =
  return values.

> **❌ Real Mistake — Modules Cannot Access Each Other Directly**
>
> Tried to use aws_subnet.private_subnet.id inside the EC2 module.
>
> Terraform error: resource from another module is not accessible.
>
> RULE: Modules NEVER reference each other's resources directly.
>
> CORRECT: VPC module → output → root module → passes as input → EC2 module variable.


**4.2 CMG Module Structure**

|                                                                          |
|--------------------------------------------------------------------------|
| cmg-terraform/                                                           |
| ├── main.tf \# Root: calls all child modules, wires outputs to inputs    |
| ├── variables.tf \# Root variable declarations                           |
| ├── outputs.tf \# Root outputs                                           |
| ├── locals.tf \# common_tags, name_prefix, is_prod logic                 |
| ├── versions.tf \# Provider + Terraform version pins                     |
| ├── backend.tf \# Shell — config at init time                            |
| ├── environments/ \# dev.tfvars \| uat.tfvars \| prod.tfvars             |
| ├── backends/ \# dev.tfvars \| uat.tfvars \| prod.tfvars                 |
| └── modules/                                                             |
| ├── vpc/ \# VPC, subnets, IGW, NAT GWs — outputs: vpc_id, subnet_ids     |
| ├── eks/ \# EKS cluster, node groups, OIDC — outputs: endpoint, oidc_url |
| ├── iam/ \# IAM roles, IRSA — outputs: role ARNs                         |
| ├── security-groups/ \# EKS SG, node SG, ALB SG — outputs: sg_ids        |
| └── monitoring/ \# CloudWatch dashboards + alarms                        |

**4.3 Module Interface — variables.tf and outputs.tf**

|                                                                                                     |
|-----------------------------------------------------------------------------------------------------|
| \# modules/vpc/variables.tf                                                                         |
| variable "cidr_block" {                                                                             |
| description = "VPC CIDR block"                                                                      |
| type = string                                                                                       |
| validation { condition = can(cidrnetmask(var.cidr_block)); error_message = "Valid CIDR required." } |
| }                                                                                                   |
| variable "az_count" { type = number; default = 3 }                                                  |
| variable "environment" { type = string }                                                            |
|                                                                                                     |
| \# modules/vpc/outputs.tf                                                                           |
| output "vpc_id" { value = aws_vpc.main.id }                                                         |
| output "private_subnet_ids" {                                                                       |
| value = { for k,v in aws_subnet.private : k =\> v.id }                                              |
| }                                                                                                   |
| output "public_subnet_ids" {                                                                        |
| value = { for k,v in aws_subnet.public : k =\> v.id }                                               |
| }                                                                                                   |

**4.4 Root Module Wiring**

|                                                                                                     |
|-----------------------------------------------------------------------------------------------------|
| module "vpc" { source = "./modules/vpc"; cidr_block = var.vpc_cidr; environment = var.environment } |
| module "security_groups" { source = "./modules/security-groups"; vpc_id = module.vpc.vpc_id }       |
| module "eks" {                                                                                      |
| source = "./modules/eks"                                                                            |
| vpc_id = module.vpc.vpc_id                                                                          |
| private_subnet_ids = module.vpc.private_subnet_ids \# map output                                    |
| cluster_sg_id = module.security_groups.cluster_sg_id                                                |
| }                                                                                                   |
| \# RULE: All communication flows through root. Modules never talk to each other.                    |

**4.5 Accessing Map Outputs — All Methods**

|                                                                                  |
|----------------------------------------------------------------------------------|
| \# private_subnet_ids = { "private-2a"="subnet-abc", "private-2b"="subnet-def" } |
|                                                                                  |
| \# Known key                                                                     |
| subnet_id = var.private_subnet_ids\["private-2a"\]                               |
|                                                                                  |
| \# First value (order not guaranteed in maps)                                    |
| subnet_id = values(var.private_subnet_ids)\[0\]                                  |
|                                                                                  |
| \# All values as list (for ALB)                                                  |
| subnets = values(var.public_subnet_ids)                                          |
|                                                                                  |
| \# Transform with for expression                                                 |
| all_ids = \[for k,v in var.private_subnet_ids : v\]                              |

**4.6 Module Versioning with Git Tags**

- Reusable modules are pinned to a Git tag (e.g. `v3.2.1`) in the
  `source` argument — guarantees every caller gets the exact same
  tested module code.

- Reduces duplication significantly across environments: one set of
  validated modules, per-environment tfvars supply the differences
  (instance sizes, counts) instead of copy-pasted code.

- Variable `validation {}` blocks on module inputs catch wrong values
  at plan time with a clear error message, before any resource touches
  AWS.

**4.7 Testing Modules — Terratest**

- Testing pyramid: `terraform validate` (syntax) → `tfsec` (security)
  → plan review → Terratest (integration).

- **Terratest**: a Go testing framework that deploys real
  infrastructure into a test AWS account, asserts against it via the
  AWS API, then destroys it.

- Terratest flow: deploy the module → assert outputs are non-empty and
  correct → run AWS API assertions against the real resources →
  destroy.

- **Kitchen-Terraform**: a Ruby-based alternative to Terratest.

- **Conftest + OPA**: unit-tests the `plan` JSON output without
  deploying anything — fast and cheap, good for policy checks (see
  §15.3).

- CMG approach: `tfsec` + OPA run in every pipeline build; Terratest
  runs weekly against the dev account to validate all modules
  end-to-end.

### SECTION 5 [ V1 ADVANCED ] — ADVANCED HCL — count, for_each, LIFECYCLE, LOCALS


**5.1 count vs for_each — Identity Is Everything**

> **❌ Real Mistake — count Middle Insertion = Production Outage**
>
> Used count for subnets. Inserted a new subnet at position 0.
>
> Terraform destroyed and recreated ALL subnets after position 0.
>
> EKS nodes lost networking — full production outage.


|                      |                                        |                                         |
|----------------------|----------------------------------------|-----------------------------------------|
| **Feature**          | **count**                              | **for_each**                            |
| Identity basis       | Array index — positional (0,1,2)       | Map key — stable string                 |
| Remove/insert middle | CASCADE: destroy+recreate all after it | SAFE: only affects that key             |
| Reference syntax     | resource.name\[0\]                     | resource.name\["key"\]                  |
| Splat operator       | resource\[\*\].id ✓                    | values(resource)\[\*\].id               |
| Conditional create   | count = var.x ? 1 : 0 ✓                | for_each = var.x ? {x:1} : {} (verbose) |
| Production use       | Only truly identical resources         | Subnets, SGs, IAM roles, node groups    |

> **⚠️ Common Mistake — Splat on a for_each Resource**
>
> `[*]` only works on LIST-like (count) resources. `for_each` produces
> a MAP, and `resource[*].id` on a map errors with "Splat expressions
> are not allowed when the left-hand side is a map." Fix:
> `values(resource)[*].id` (converts the map to a list first), or a
> `for` expression: `[for s in resource : s.id]`.

|                                                            |
|------------------------------------------------------------|
| variable "subnet_config" {                                 |
| default = {                                                |
| "private-2a" = { cidr="10.0.1.0/24", az="eu-west-2a" }     |
| "private-2b" = { cidr="10.0.2.0/24", az="eu-west-2b" }     |
| "private-2c" = { cidr="10.0.3.0/24", az="eu-west-2c" }     |
| }                                                          |
| }                                                          |
| resource "aws_subnet" "private" {                          |
| for_each = var.subnet_config                               |
| cidr_block = each.value.cidr                               |
| availability_zone = each.value.az                          |
| vpc_id = aws_vpc.main.id                                   |
| tags = { Name = "cmg-\${each.key}" }                       |
| }                                                          |
| \# Adding "private-2d" = ONE new subnet. Others untouched. |

**5.2 Lifecycle Rules — All Four**

|                                                                                           |
|-------------------------------------------------------------------------------------------|
| resource "aws_eks_node_group" "main" {                                                    |
| \# ...config...                                                                           |
| lifecycle {                                                                               |
| create_before_destroy = true \# New created BEFORE old deleted — zero downtime            |
| prevent_destroy = true \# Block terraform destroy on this resource                        |
| ignore_changes = \[                                                                       |
| scaling_config\[0\].desired_size \# Cluster Autoscaler owns this                          |
| \]                                                                                        |
| \# replace_triggered_by = \[aws_launch_template.nodes.id\] \# Force replace on dep change |
| }                                                                                         |
| }                                                                                         |

> **🚀 Best Practice — replace_triggered_by in Production**
>
> Real use: a Jenkins agent EC2 instance should be replaced whenever
> its launch template gets a new AMI (monthly patching). Without
> `replace_triggered_by`, the EC2 instance keeps running the OLD AMI
> even after the launch template is updated.
>
> ```
> resource "aws_launch_template" "jenkins_agent" { name_prefix = "cmg-jenkins-"; image_id = var.ami_id }
> resource "aws_instance" "jenkins_agent" {
>   launch_template { id = aws_launch_template.jenkins_agent.id; version = "$Latest" }
>   lifecycle { replace_triggered_by = [aws_launch_template.jenkins_agent.id] }
> }
> ```

**5.3 Locals — DRY Code**

|                                                                         |
|-------------------------------------------------------------------------|
| locals {                                                                |
| common_tags = {                                                         |
| Environment = var.environment                                           |
| Project = "CMG"                                                         |
| ManagedBy = "Terraform"                                                 |
| CostCenter = "CMG-UK-GOV"                                               |
| Owner = "devops@cmg.gov.uk"                                             |
| }                                                                       |
| name_prefix = "cmg-\${var.environment}"                                 |
| is_prod = var.environment == "prod"                                     |
| instance_type = local.is_prod ? "t3.xlarge" : "t3.medium"               |
| min_nodes = local.is_prod ? 3 : 1                                       |
| }                                                                       |
| \# Every resource: tags = merge(local.common_tags, { Service = "eks" }) |
| \# Change one tag here → all 200+ resources updated on next apply.      |

**5.4 Dynamic Blocks**

|                                                                   |
|-------------------------------------------------------------------|
| \# Instead of 8 identical ingress blocks — dynamic block from map |
| locals {                                                          |
| ingress_rules = {                                                 |
| "https" = { from=443, to=443, proto="tcp" }                       |
| "kubelet" = { from=10250, to=10250, proto="tcp" }                 |
| "dns" = { from=53, to=53, proto="udp" }                           |
| }                                                                 |
| }                                                                 |
| resource "aws_security_group" "nodes" {                           |
| dynamic "ingress" {                                               |
| for_each = local.ingress_rules                                    |
| content {                                                         |
| from_port = ingress.value.from                                    |
| to_port = ingress.value.to                                        |
| protocol = ingress.value.proto                                    |
| cidr_blocks = \["10.0.0.0/8"\]                                    |
| }                                                                 |
| }                                                                 |
| }                                                                 |

### SECTION 6 [ V1 FUNDAMENTALS ] — PROVIDERS & IMPORTS


**6.1 Version Pinning — Always**

|                                                                        |
|------------------------------------------------------------------------|
| terraform {                                                            |
| required_version = "\>= 1.5.0, \< 2.0.0"                               |
| required_providers {                                                   |
| aws = { source = "hashicorp/aws", version = "~\> 5.0" }                |
| kubernetes = { source = "hashicorp/kubernetes", version = "~\> 2.23" } |
| helm = { source = "hashicorp/helm", version = "~\> 2.12" }             |
| }                                                                      |
| }                                                                      |
| provider "aws" { region = var.aws_region }                             |
| \# NO credentials — EC2 IAM Role provides STS tokens automatically     |

> **❌ Real Mistakes — Provider Config**
>
> Wrong: version = "5.0" (exact — may not exist). Correct: ~> 5.0 (allows 5.x patches)
>
> Wrong: Putting "region" inside required_providers block. Region goes in provider {} only.
>
> Wrong: Not committing .terraform.lock.hcl. Always commit — locks exact version for all.


**6.2 Import — CLI vs Block**

|                                                                      |
|----------------------------------------------------------------------|
| \# CLI import (all Terraform versions)                               |
| terraform import module.vpc.aws_vpc.main vpc-0abc1234                |
| terraform plan \# Fix attribute drift until 0 changes                |
|                                                                      |
| \# import block (Terraform 1.5+) — preferred in production           |
| import { to = module.vpc.aws_vpc.main; id = "vpc-0abc1234" }         |
| import { to = module.eks.aws_eks_cluster.main; id = "cmg-eks-prod" } |
| \# terraform apply — imports all at once                             |
| \# Remove import blocks after successful apply                       |
|                                                                      |
| \# RULE: Write .tf resource block FIRST, then import.                |
| \# After import: plan must show 0 changes before declaring done.     |

**Bulk Import Strategy (40+ Resources)**

1. Group resources by dependency order: networking → security → IAM →
   compute → monitoring.
2. Inventory all real resource IDs via AWS CLI before starting.
3. Write `.tf` resource blocks for each group BEFORE importing that
   group.
4. Use `import {}` blocks (1.5+) — Git-tracked, repeatable,
   PR-reviewable — over one-off CLI imports for bulk work.
5. **Terraformer** can auto-generate starter `.tf` code from existing
   cloud resources — always clean up the generated code before
   production use: `terraformer import aws
   --resources=vpc,subnet,security_group --regions=eu-west-2`.
6. Migrating FROM CloudFormation specifically: use **cf2tf** to
   generate starter HCL from CFN templates, import in dependency
   order, and disable (don't delete) the CFN stack once Terraform
   shows 0 changes — delete only after 48 hours of stable operation.
7. GOAL: `terraform plan` shows 0 changes for every imported resource
   before declaring the migration complete.

**6.3 Safe Provider Version Upgrades**

> **❌ Real Mistake — Silent Breakage From Provider Defaults**
>
> Providers change default attribute values between major versions. If
> an attribute isn't explicitly set in `.tf`, the provider default
> applies — and if that default changes (e.g. AWS provider 4.x → 5.x
> changed `http_tokens` default to `"required"` on EC2), `plan` shows a
> `~` (modify) even though nothing in the `.tf` code changed. Applied
> without review, this silently modifies real resources.

Safe upgrade procedure:

1. Read the full CHANGELOG from current to target version — search for
   "BREAKING CHANGE."
2. Update the version constraint (e.g. `~> 5.0` — allows 5.x patches,
   blocks 6.0).
3. `terraform init -upgrade` in dev. Review the `git diff` on
   `.terraform.lock.hcl`.
4. `terraform plan` in dev — review EVERY `~` carefully; any
   unexpected modification is a default-value change.
5. Explicitly set all security-sensitive attributes in `.tf` code —
   never rely on provider defaults for these.
6. Test in dev for 48 hours minimum, commit the updated lock file.
7. Deploy to UAT with full regression tests, then prod in a
   maintenance window. Never jump multiple major versions at once.

**6.4 Terragrunt — DRY Wrapper**

- A thin wrapper around Terraform that adds DRY backend config,
  dependency management between modules, and hooks.
- Solves: backend config duplication across 10+ modules — instead of
  pasting the same S3 bucket config repeatedly, one root
  `terragrunt.hcl` and all modules inherit it.
- `dependency` blocks declare inter-module relationships for ordered
  applies; `terragrunt run-all apply` applies every module in the
  correct dependency order.
- When NOT to use it: fewer than ~10 modules or fewer than 3 AWS
  accounts — plain Terraform is simpler and has less tooling overhead.

**6.5 CDKTF — Cloud Development Kit for Terraform**

- Lets you author Terraform using Python, TypeScript, Java, or Go
  instead of HCL.
- Under the hood, CDKTF synthesizes your code into standard Terraform
  JSON configuration — same providers, same state, same plan/apply,
  just a different authoring experience.
- Use it when the team is developer-heavy with little HCL experience,
  or needs complex programmatic logic that's awkward in HCL.
- Avoid it when the team is comfortable with HCL — the extra synthesis
  step adds complexity and debugging is harder; the HCL ecosystem also
  has far more examples and documentation.

### SECTION 7 [ V1 SECURITY ] — SECURITY GROUPS — 3-TIER DESIGN


|                    |                                         |              |                                                 |
|--------------------|-----------------------------------------|--------------|-------------------------------------------------|
| **Security Group** | **Inbound**                             | **Outbound** | **Real Mistake**                                |
| ALB SG             | 80 from 0.0.0.0/0 \| 443 from 0.0.0.0/0 | All traffic  | Tried restricting egress to App SG — wrong      |
| App SG             | 22 from Bastion SG \| 80 from ALB SG    | All traffic  | Used CIDR for SSH instead of SG reference       |
| Bastion SG         | 22 from trusted IP /32 only             | All traffic  | Opened 22 to 0.0.0.0/0 — never do this          |
| Data SG            | 5432 from App SG only                   | None         | Added NAT route to data tier — no internet ever |

> **❌ Real Mistake — Circular SG Dependency**
>
> ALB SG referenced App SG AND App SG referenced ALB SG = Terraform Cycle error.
>
> FIX: Use aws_security_group_rule resources instead of inline ingress/egress blocks.


|                                                                            |
|----------------------------------------------------------------------------|
| \# FIX: aws_security_group_rule breaks the cycle                           |
| resource "aws_security_group_rule" "alb_to_app" {                          |
| type = "ingress"                                                           |
| from_port = 80; to_port = 80; protocol = "tcp"                             |
| security_group_id = aws_security_group.app.id                              |
| source_security_group_id = aws_security_group.alb.id                       |
| }                                                                          |
| \# SG-to-SG is always preferred over CIDRs for east-west traffic.          |
| \# If bastion IP changes, CIDR breaks. SG reference follows automatically. |

### SECTION 8 [ V1 ARCHITECTURE ] — AWS VPC ARCHITECTURE


|              |                 |                       |                              |
|--------------|-----------------|-----------------------|------------------------------|
| **Tier**     | **Subnet**      | **Resources**         | **Route Table**              |
| Public       | Public (3 AZs)  | ALB, Bastion, NAT GWs | IGW → 0.0.0.0/0              |
| Private-App  | Private (3 AZs) | EKS nodes, EC2 app    | NAT GW (own AZ) → 0.0.0.0/0  |
| Private-Data | Data (3 AZs)    | RDS, ElastiCache      | NO internet route — isolated |

> **❌ Real Mistake — All Subnets in Same AZ**
>
> Put all subnets in us-east-1b. Single AZ failure = full outage.
>
> CORRECT: Spread across 3 AZs — us-east-1a, us-east-1b, us-east-1c.


> **❌ Real Mistake — Single Route Table for All Private Subnets**
>
> 3 NAT GWs + 1 shared route table = ZERO HA benefit.
>
> If NAT-GW-a fails, ALL 3 AZs lose internet egress.
>
> CORRECT: Each AZ private subnet → its OWN route table → its OWN NAT GW.
>
> AZ-a subnet → route-table-a → NAT-GW-a
>
> AZ-b subnet → route-table-b → NAT-GW-b
>
> AZ-c subnet → route-table-c → NAT-GW-c


> **❌ Real Mistake — CIDR Overlap**
>
> Used 10.0.1.0/24 for both public and private subnet. AWS rejects duplicate CIDRs.
>
> CORRECT: Public: 10.0.1-3.0/24 | Private: 10.0.4-6.0/24 | Data: 10.0.7-9.0/24


|              |                    |                   |                                       |
|--------------|--------------------|-------------------|---------------------------------------|
| **Instance** | **Subnet**         | **Public IP**     | **Mistake**                           |
| Bastion      | Public             | true (required!)  | Set false — could not reach it        |
| App EC2      | Private            | false (required!) | Set true — exposed to internet        |
| ALB          | ALL public subnets | AWS managed       | Used private subnets — must be public |
| RDS          | Data subnet        | Never             | No mistake — always private           |

### SECTION 9 [ V1 AWS SERVICES ] — ALB — APPLICATION LOAD BALANCER


|                     |                           |                                            |
|---------------------|---------------------------|--------------------------------------------|
| **Config**          | **Wrong**                 | **Correct**                                |
| Subnets             | Private subnets           | values(var.public_subnet_ids) — ALL public |
| TLS policy          | ELBSecurityPolicy-2016-08 | ELBSecurityPolicy-TLS13-1-2-2021-06        |
| Deletion protection | false                     | true in production                         |
| Certificate         | Hardcoded fake ARN        | aws_acm_certificate resource reference     |
| HTTPS listener      | No ssl_policy             | ssl_policy + certificate_arn required      |

> **❌ Real Mistake — ALB Logs Not Appearing**
>
> Created S3 bucket but forgot the bucket policy.
>
> ALB silently fails to write logs without PutObject permission for ELB service account.


|                                                             |
|-------------------------------------------------------------|
| data "aws_elb_service_account" "main" {}                    |
| resource "aws_s3_bucket_policy" "alb_logs" {                |
| bucket = aws_s3_bucket.alb_logs.id                          |
| policy = jsonencode({                                       |
| Statement = \[{                                             |
| Effect = "Allow"                                            |
| Principal = { AWS = data.aws_elb_service_account.main.arn } |
| Action = "s3:PutObject"                                     |
| Resource = "\${aws_s3_bucket.alb_logs.arn}/\*"              |
| }\]                                                         |
| })                                                          |
| }                                                           |

### SECTION 10 [ V1 SECURITY ] — SECURITY BEST PRACTICES


|               |                                     |                                              |
|---------------|-------------------------------------|----------------------------------------------|
| **Area**      | **Wrong**                           | **Correct**                                  |
| AWS Auth      | access_key + secret_key in provider | IAM Role on EC2 — zero credentials in code   |
| IMDSv2        | Not set (IMDSv1 default)            | http_tokens = "required" in metadata_options |
| EBS           | gp2, unencrypted                    | gp3 + encrypted = true in root_block_device  |
| AMI           | Hardcoded ami-xxxxx                 | data "aws_ami" with most_recent + filter     |
| Keypair       | tls_private_key resource            | aws_key_pair with public_key only (var)      |
| IAM policy    | Resource = "\*"                     | Resource = \[specific_arn, "\${arn}:\*"\]    |
| Tags          | name = "x" (lowercase)              | Name = "x" (capital N for AWS console)       |
| Instance type | t2.micro                            | t3.micro (current gen, better perf)          |

**10.1 Never Hardcode AMI IDs — Data Source Pattern**

|                                                                     |
|---------------------------------------------------------------------|
| data "aws_ami" "al2023" {                                           |
| most_recent = true                                                  |
| owners = \["amazon"\]                                               |
| filter { name = "name"; values = \["al2023-ami-\*-x86_64"\] }       |
| }                                                                   |
| \# ami = data.aws_ami.al2023.id — always current, always right region |

**10.2 Secrets Management**

- NEVER put secrets in `.tf` files, `.tfvars` files, or hardcoded
  variable defaults.
- `sensitive = true` hides a value from CLI/log output but the value
  IS still stored in the state file in plaintext — state encryption
  (2.1) is the real protection layer, not `sensitive`.
- Best practice: reference an **AWS Secrets Manager** ARN in Terraform
  — the actual secret value never touches Terraform at all.
- For RDS specifically: `manage_master_user_password = true` lets RDS
  create and rotate the master password automatically via its own
  Secrets Manager integration.
- **HashiCorp Vault provider**: fetches secrets at apply time via
  OIDC/IAM auth — no static tokens stored anywhere.
- **Secrets rotation**:

|                          |                                                                     |
|--------------------------|----------------------------------------------------------------------|
| RDS master password      | manage_master_user_password = true — automatic rotation via Secrets Manager |
| Other app secrets        | aws_secretsmanager_secret_rotation resource — configure a rotation Lambda |
| KMS keys                 | enable_key_rotation = true on aws_kms_key — annual rotation, transparent |
| IRSA / pod credentials   | Auto-rotated by AWS STS — short-lived tokens, no rotation needed     |

### SECTION 11 [ V1 EKS ] — IRSA — IAM ROLES FOR SERVICE ACCOUNTS


- IRSA = pod-level IAM identity via OIDC. Each pod gets its OWN IAM
  role.

- Before IRSA: all pods on a node shared the node IAM role —
  over-permissioned.

- With IRSA: payment pod → only payment SQS. Notification pod → only
  SES. Least privilege.

|                                                                                            |
|--------------------------------------------------------------------------------------------|
| \# Step 1: OIDC Provider                                                                   |
| data "tls_certificate" "eks" { url = aws_eks_cluster.main.identity\[0\].oidc\[0\].issuer } |
| resource "aws_iam_openid_connect_provider" "eks" {                                         |
| client_id_list = \["sts.amazonaws.com"\]                                                   |
| thumbprint_list = \[data.tls_certificate.eks.certificates\[0\].sha1_fingerprint\]          |
| url = aws_eks_cluster.main.identity\[0\].oidc\[0\].issuer                                  |
| }                                                                                          |
|                                                                                            |
| \# Step 2: Trust Policy — scoped to ONE service account in ONE namespace                   |
| condition {                                                                                |
| test = "StringEquals"                                                                      |
| variable = "OIDC_ISSUER:sub"                                                               |
| values = \["system:serviceaccount:payment:payment-service-sa"\]                            |
| }                                                                                          |
|                                                                                            |
| \# Step 3: IAM Role + least-privilege policy                                               |
| resource "aws_iam_role" "payment_service" {                                                |
| name = "cmg-payment-\${var.environment}"                                                   |
| assume_role_policy = data.aws_iam_policy_document.trust.json                               |
| }                                                                                          |
| \# Step 4: Annotate the K8s ServiceAccount with the role ARN                               |
| \# eks.amazonaws.com/role-arn: <output of aws_iam_role.payment_service.arn>                |
| \# Output the role ARN from Terraform for the Helm chart to consume                        |

**11.2 Zero-Downtime EKS Version Upgrades**

Prerequisites:

- `create_before_destroy = true` on all `aws_eks_node_group` resources.
- Pod Disruption Budgets configured on all critical workloads.
- `update_config { max_unavailable_percentage = 33 }` — at most 1/3 of
  nodes replaced at once.
- Test in dev, wait, then UAT, wait, then prod. Never skip minor
  versions — EKS only supports upgrading one minor version at a time.

Upgrade flow:

1. Update the `kubernetes_version` variable (e.g. `"1.27"` →
   `"1.28"`).
2. `terraform plan` — review: control plane update + node group
   replacement.
3. `terraform apply` — control plane upgrades first (~8 min, no
   workload impact).
4. New node group is created (new AMI) — new nodes join as Ready.
5. Kubernetes scheduler migrates pods to new nodes respecting PDBs —
   no service interruption.
6. Old node group is drained and deleted.
7. Update EKS add-ons (11.3) to versions compatible with the new
   control plane.

**11.3 EKS Add-ons Configuration**

- `aws_eks_addon` manages CoreDNS, kube-proxy, vpc-cni, and the EBS CSI
  driver.
- `resolve_conflicts = "OVERWRITE"` allows Terraform to update add-on
  config rather than erroring on drift.
- `vpc-cni` needs its own IRSA role — it makes EC2 API calls for IP
  address management.
- Pin add-on versions explicitly — never let them auto-update; update
  them as part of the EKS version upgrade process (11.2).

|                                                                     |
|---------------------------------------------------------------------|
| resource "aws_eks_addon" "coredns" {                                |
| cluster_name = aws_eks_cluster.main.name                            |
| addon_name = "coredns"                                              |
| addon_version = "v1.10.1-eksbuild.6"                                |
| resolve_conflicts = "OVERWRITE"                                     |
| }                                                                   |
| resource "aws_eks_addon" "vpc_cni" {                                |
| cluster_name = aws_eks_cluster.main.name                            |
| addon_name = "vpc-cni"                                              |
| service_account_role_arn = aws_iam_role.vpc_cni.arn \# IRSA for CNI |
| }                                                                   |

### SECTION 12 [ V1 LEARNINGS ] — MY MISTAKES — ALL CATEGORIES


**12.1 Syntax Mistakes (terraform validate catches these)**

|        |                     |                                                 |                                             |
|--------|---------------------|-------------------------------------------------|---------------------------------------------|
| **\#** | **Mistake**         | **Wrong**                                       | **Correct**                                 |
| 1      | Quoting reference   | "var.region" (literal string)                   | var.region (no quotes)                      |
| 2      | VPC ID attribute    | aws_vpc.main.vpc_id                             | aws_vpc.main.id                             |
| 3      | SG in VPC           | security_groups = \[sg.id\]                     | vpc_security_group_ids = \[sg.id\]          |
| 4      | NAT GW route        | gateway_id = nat_gw.id                          | nat_gateway_id = nat_gw.id                  |
| 5      | Key pair attribute  | aws_key_pair.key.id                             | aws_key_pair.key.key_name                   |
| 6      | Instance AZ         | availability_zone = "1a" on aws_instance        | subnet_id = subnet.id (AZ follows subnet)   |
| 7      | Splat on for_each   | resource\[\*\].id                               | values(resource)\[\*\].id                   |
| 8      | Interpolation typo  | "S{each.key}"                                   | "\${each.key}" or each.key                  |
| 9      | Duplicate tags      | { Env = "dev", Env = "prod" }                   | One key per object — no duplicates          |
| 10     | Map key quoting     | public-1 = {} (unquoted with hyphen)            | "public-1" = {} (always quote with hyphens) |
| 11     | Version constraint  | version = "5.0"                                 | version = "~\> 5.0"                         |
| 12     | Region in providers | required_providers { aws = { region = "..." } } | Region goes in provider {} block only       |

**12.2 Architecture Mistakes**

|        |                                         |                                         |                                      |
|--------|-----------------------------------------|-----------------------------------------|--------------------------------------|
| **\#** | **Mistake**                             | **Impact**                              | **Fix**                              |
| 1      | All subnets in same AZ                  | One AZ failure = full outage            | Spread across all 3 AZs              |
| 2      | One route table for all private subnets | 3 NAT GWs = zero HA benefit             | Each AZ gets own route table         |
| 3      | CIDR overlap across tiers               | AWS rejects duplicate CIDRs             | Public: 1-3, Private: 4-6, Data: 7-9 |
| 4      | Cross-tier for_each key mismatch        | Key "private-1" not in public-keyed map | locals translation map               |
| 5      | Data subnet with internet route         | Database reachable from internet        | No routes = isolated                 |

**12.3 Security Mistakes**

|        |                            |                                       |                                           |
|--------|----------------------------|---------------------------------------|-------------------------------------------|
| **\#** | **Mistake**                | **Risk**                              | **Fix**                                   |
| 1      | SSH open to 0.0.0.0/0      | CIS violation, internet SSH access    | Restrict to trusted IP /32 only           |
| 2      | CIDR-based SSH to app tier | IP changes break rule                 | Use source_security_group_id = bastion_sg |
| 3      | IMDSv2 not set             | SSRF attack steals IAM credentials    | http_tokens = "required"                  |
| 4      | EBS unencrypted / gp2      | Data at rest exposed, compliance fail | encrypted=true, volume_type="gp3"         |
| 5      | Private key in Terraform   | Key in state file — anyone can read   | Generate locally, use public key only     |
| 6      | IAM Resource = "\*"        | Over-permissioned — security finding  | Scope to specific ARN                     |

**12.4 Module Design Mistakes**

|        |                                                      |                                                 |
|--------|------------------------------------------------------|-------------------------------------------------|
| **\#** | **Mistake**                                          | **Fix**                                         |
| 1      | Module accessing another module's resources directly | Use outputs → root → inputs pattern             |
| 2      | AWS-generated IDs as root input variables            | Module outputs flowing between modules          |
| 3      | Resource in wrong module (ALB SG in EC2 module)      | Resource belongs in the module that owns it     |
| 4      | Output name mismatch between module and caller       | Names must match exactly — use snake_case       |
| 5      | Not outputting values that callers reference         | Every value a caller uses must be in outputs.tf |

**12.5 Performance & Debugging Mistakes**

|        |                                                        |                                                                                     |
|--------|----------------------------------------------------------|-----------------------------------------------------------------------------------|
| **\#** | **Mistake**                                            | **Fix**                                                                          |
| 1      | Overusing depends_on where Terraform already detects the dependency via reference | Forces sequential creation, doubling apply time — only use depends_on for hidden dependencies (e.g. IAM eventual consistency) that Terraform cannot infer |
| 2      | "Reference to undeclared resource" error                | Check for a typo in the resource name, confirm the block exists in the current config, and confirm it isn't actually in another module (use outputs instead) |

### SECTION 13 [ V1 CI/CD ] — JENKINS CI/CD — FULL PRODUCTION PIPELINE


|                                                                                                         |
|---------------------------------------------------------------------------------------------------------|
| pipeline {                                                                                              |
| agent { label "terraform-agent" } // EC2 with IAM Role — zero credentials in code                       |
| environment {                                                                                           |
| TF_ENV = '\${env.BRANCH_NAME}'                                                                          |
| PLAN_FILE = 'tf-\${TF_ENV}-\${BUILD_NUMBER}.plan'                                                       |
| }                                                                                                       |
| options { disableConcurrentBuilds() }                                                                   |
| stages {                                                                                                |
| stage("Init") { steps { sh "terraform init -backend-config=backends/\${TF_ENV}.tfvars -reconfigure" } } |
| stage("Validate") { steps { sh "terraform validate" } }                                                 |
| stage("Fmt") { steps { sh "terraform fmt -check -recursive" } }                                         |
| stage("Scan") { steps { sh "tfsec . --minimum-severity HIGH" } }                                        |
| stage("Plan") {                                                                                         |
| steps {                                                                                                 |
| sh "terraform plan -var-file=environments/\${TF_ENV}.tfvars -out=\${PLAN_FILE} -no-color"               |
| sh "terraform show -no-color \${PLAN_FILE} \> plan.txt"                                                 |
| archiveArtifacts "plan.txt"                                                                             |
| }                                                                                                       |
| }                                                                                                       |
| stage('Approve') {                                                                                      |
| when { branch 'main' }                                                                                  |
| steps { timeout(time:4,unit:"HOURS") { input("Approve prod apply?") } }                                 |
| }                                                                                                       |
| stage("Apply") { steps { sh "terraform apply -input=false -no-color \${PLAN_FILE}" } }                  |
| }                                                                                                       |
| post { always { sh "rm -f \${PLAN_FILE}" } }                                                            |
| }                                                                                                       |

**13.2 GitOps for Terraform — Atlantis vs Terraform Cloud vs Jenkins**

|                 |                              |                                  |                                      |
|-----------------|------------------------------|----------------------------------|--------------------------------------|
| **Feature**     | **Jenkins (CMG)**            | **Atlantis**                     | **Terraform Cloud**                  |
| Plan on PR      | Manual trigger               | Auto on every PR comment         | Auto on PR                           |
| Plan visibility | Archived artifact            | Posted as PR comment             | Terraform Cloud UI                   |
| Apply trigger   | Manual approval gate         | atlantis apply PR comment        | UI button or auto merge              |
| State storage   | S3 + DynamoDB (self-managed) | S3 + DynamoDB (self-managed)     | Managed by HashiCorp                 |
| Cost            | EC2 cost only                | Server cost only                 | Free + paid tiers                    |
| Best for        | Existing Jenkins investment  | GitOps-first, developer-friendly | No infra to manage, budget available |

- All three implement the same GitOps principle: infrastructure
  changes only happen through reviewed code, never direct console
  access.
- `disableConcurrentBuilds()` in Jenkins prevents parallel-apply race
  conditions — the same protection DynamoDB locking gives at the state
  layer, applied at the pipeline layer.

### SECTION 14 [ V1 REFERENCE ] — V1 QUICK REFERENCE CHEAT SHEET


|                                                      |                                                         |
|------------------------------------------------------|---------------------------------------------------------|
| **Command / Rule**                                   | **Purpose / Correct Value**                             |
| terraform init -backend-config=f.tfvars -reconfigure | Dynamic backend per environment                         |
| terraform plan -refresh-only                         | Detect drift — exit 2 = drift found                     |
| terraform plan -detailed-exitcode                    | CI: exit 0=clean, 1=error, 2=changes                    |
| terraform state mv src dst                           | Rename without destroy — plan must show 0 after         |
| moved { from=X to=Y }                                | Declarative rename — Git-tracked (TF 1.1+)              |
| terraform state rm addr                              | Remove from TF management — AWS untouched               |
| terraform state pull                                 | Backup state before surgery                             |
| terraform force-unlock ID                            | Remove stuck lock — confirm no active apply FIRST       |
| prevent_destroy = true                               | Block accidental deletion — prod EKS, RDS, S3           |
| create_before_destroy = true                         | Zero-downtime replacement — EKS node groups             |
| ignore_changes = \[desired_size\]                    | Cluster Autoscaler owns this — TF must not fight it     |
| for_each \> count (always)                           | Key-based = stable. Index-based = cascade danger.       |
| values(map)\[\*\].id                                 | Splat on for_each — NOT resource\[\*\].id               |
| aws_key_pair.key.key_name                            | NOT .id — EC2 wants Key Name not Key Pair ID            |
| vpc_security_group_ids                               | NOT security_groups (EC2-Classic, retired 2022)         |
| nat_gateway_id                                       | NOT gateway_id (that is for IGW/VPN)                    |
| http_tokens = "required"                             | IMDSv2 enforcement — disable IMDSv1                     |
| gp3 + encrypted = true                               | Always on root_block_device — never gp2                 |
| values(var.public_subnet_ids)                        | ALB subnets — all public as list                        |
| ELBSecurityPolicy-TLS13-1-2-2021-06                  | Latest TLS policy for HTTPS listeners                   |
| data "aws_elb_service_account"                       | Required for ALB access logs S3 bucket policy           |
| data "aws_ami" + filters                             | Never hardcode AMI ID — always fetch dynamically        |
| Name (capital N) in tags                             | Lowercase "name" not displayed in AWS console           |
| .terraform.lock.hcl → commit to Git                  | Locks exact provider version for all team members       |
| sensitive = true                                     | Hides from logs — value still in state — encrypt state! |
| State "serial" field                                 | Increments every state write — out-of-order = corruption |
| State "lineage" field                                | Unique UUID for state history — never changes            |
| terraform state rm vs destroy                        | state rm = tracking only. destroy = deletes from AWS.    |
| -migrate-state (with init -backend-config)            | Copies existing state into a new backend automatically   |
| terraform apply -replace=addr                         | Correct replacement — shows plan first (taint deprecated) |
| terraform workspace show                              | Prints current active workspace name                     |
| terraform plan -target=addr                            | Plan/apply only one resource — always follow with full apply |
| terraform plan -destroy                                | Preview a destroy without doing it                        |
| terraform console                                      | Interactive REPL — test functions/expressions before use  |
| terraform graph \| dot -Tpng                           | Visual dependency graph — debug cycles/ordering            |
| -parallelism=N (default 10)                            | Raise for big creates, lower for API rate limits/prod safety |
| Terraformer                                             | Auto-generates starter Terraform HCL from existing cloud resources |
| aws_instance has no az argument                        | AZ is determined by subnet_id, not a direct argument       |

---

### SECTION 15 [ V1 EXPANSION ] — ENTERPRISE ARCHITECTURE, TOOLING & OPERATIONS


**15.1 Multi-Account Enterprise Architecture**

- Separate AWS accounts per environment: management, dev, staging,
  prod, shared-services.
- The CI/CD system runs in the management account and assumes an IAM
  role in each target account via provider `assume_role` (15.10).
- Separate state per account: separate S3 buckets, DynamoDB tables,
  and KMS keys.
- SCPs at the AWS Organization level deny all resource mutations
  except through the Terraform pipeline IAM role.
- A private, versioned module registry (Git repo with tags) is shared
  across all accounts — see 4.6.

**15.2 Scaling Terraform to 1000+ Resources**

- A single state with 1000+ resources makes `plan` take minutes and
  creates a huge blast radius.
- Decompose state by component: separate state files for networking,
  EKS, IAM, monitoring, etc.
- Components communicate via `terraform_remote_state` (2.8) — loose
  coupling, independent team ownership.
- Separate CI/CD pipeline per component — a networking change doesn't
  trigger an EKS apply, and a bad EKS apply cannot corrupt the
  networking state.
- Use `-parallelism=20` (15.7) for large initial creates; default is
  10.

**15.3 Policy as Code — tfsec, OPA, Sentinel**

|                |                                                        |
|----------------|----------------------------------------------------------|
| **Tool**       | **What It Does**                                       |
| tfsec          | Static analysis of `.tf` files before plan — finds misconfigurations (open SGs, unencrypted EBS) |
| OPA + Conftest | Scans the `plan` JSON output — enforces custom rules the plan must comply with |
| Sentinel       | Terraform Enterprise only — runs after plan, before apply; blocks apply on policy violation |

|                                                                       |
|-----------------------------------------------------------------------|
| \# tfsec in pipeline                                                  |
| tfsec . --minimum-severity HIGH --format json --out tfsec-report.json |
|                                                                       |
| \# OPA + Conftest — deny SSH open to the internet                     |
| terraform show -json plan.out \> plan.json                            |
| conftest test plan.json --policy policy/                              |
| deny\[msg\] {                                                         |
| r := input.resource_changes\[\_\]                                     |
| r.type == "aws_security_group_rule"                                   |
| r.change.after.cidr_blocks\[\_\] == "0.0.0.0/0"                       |
| r.change.after.from_port == 22                                        |
| msg := sprintf("SSH open to internet in %s", \[r.address\])           |
| }                                                                     |

**15.4 Blue-Green Deployments**

- Maintain two identical environments: blue (current prod) and green
  (new version). Terraform manages both plus the routing layer.
- Shift traffic via Route53 weighted routing or ALB target group
  listener-rule weights — a `tfvars` change and apply.
- Cutover: `blue_weight=0, green_weight=100` → apply → monitor.
  Rollback: revert the weights and apply again — sub-1-minute RTO.
- Common use: EKS version upgrades — blue runs current version, green
  runs new version; validate green, shift traffic, then decommission
  blue.

**15.5 Disaster Recovery for Terraform-Managed Infrastructure**

- State lives in S3 with cross-region replication — state survives a
  regional outage.
- Terraform code in Git is always available for a full rebuild.
- Maintain separate DR-region Terraform configs — same modules,
  DR-region variables, and a distinct backend state key (e.g.
  `eks/dr-eu-west-1/terraform.tfstate`).
- To extend an existing config to a new DR region: add a provider
  `alias` for the region, call existing modules with `providers =
  { aws = aws.dr }`, use a non-overlapping VPC CIDR, and use `data
  "aws_availability_zones"` instead of hardcoded AZ names so modules
  work in any region.
- Data DR is handled separately by AWS-native features: RDS Multi-AZ,
  S3 cross-region replication.
- Run regular DR drills: apply to the DR region, validate, destroy —
  actually test the runbook, don't just document it.

**15.6 terraform graph — Dependency Debugging**

- Outputs a DOT-format representation of all resource dependencies.
- `terraform graph | dot -Tpng -o infra-graph.png` renders a visual
  dependency map (install graphviz first).
- Useful for: understanding unexpected creation order, finding hidden
  dependencies causing cycle errors, and documenting complex
  infrastructure for new team members.

**15.7 The -parallelism Flag**

- Terraform creates/destroys resources in parallel; default is 10
  concurrent operations.
- Increase (`-parallelism=20`) for large initial environment builds.
- Decrease (`-parallelism=5`) when hitting AWS API rate limits, for
  sensitive production changes where a more observable/serial-like
  apply is preferred, or for IAM-heavy configs (IAM has lower API rate
  limits than most services).

**15.8 terraform plan -destroy**

- Generates a plan showing exactly what WOULD be destroyed — does not
  destroy anything, purely a preview.
- Use before any `terraform destroy` to review what will be removed;
  combine with `-target` for a selective destroy preview.
- Useful in CI/CD for scheduled dev-environment teardown — review the
  archived plan before applying it.

**15.9 terraform taint (Deprecated) vs -replace**

- `terraform taint` directly modified state to mark a resource for
  replacement — no plan preview, immediate state change. Deprecated
  because it bypassed the plan → review → apply safety pattern.
- Replacement: `terraform plan -replace=addr` /
  `terraform apply -replace=addr` — shows the replacement in the plan
  BEFORE any action is taken.

**15.10 Cross-Account IAM Role Assumption**

- Use a provider `alias` with `assume_role` — the provider assumes a
  role in the target account.
- The source account (CI/CD) needs `sts:AssumeRole` permission on the
  target role; the target role's trust policy must allow the source
  account/role.
- Multiple aliased providers can be used, one per target account.

|                                                                 |
|-----------------------------------------------------------------|
| provider "aws" {                                                |
| alias = "prod"                                                  |
| assume_role {                                                   |
| role_arn = "arn:aws:iam::PROD_ACCOUNT:role/TerraformDeployRole" |
| session_name = "TerraformDeploy"                                |
| external_id = var.external_id \# extra security                |
| }                                                               |
| }                                                               |
| resource "aws_eks_cluster" "prod" { provider = aws.prod; ... }  |

**15.11 terraform console**

- Opens an interactive REPL for evaluating Terraform expressions
  without running apply.
- Useful for testing functions (`cidrsubnet`, `merge`, `formatlist`)
  before adding them to code, querying current state values, and
  debugging complex `for` expressions or conditionals — much faster
  than a trial-and-error plan/apply cycle.

**15.12 Enterprise Network Security Controls**

- All security groups, NACLs, WAF rules, and VPC Flow Logs managed by
  Terraform — full audit trail, peer review, no manual console
  changes.
- `aws_default_security_group` with no ingress/egress strips all
  default rules on the default SG.
- `aws_flow_log` for VPC Flow Logs; `aws_wafv2_web_acl` for rate
  limiting/IP blocks/geo restrictions; `aws_networkfirewall_firewall`
  for deep packet inspection.
- SCPs at the org level block any console change to security groups —
  only the Terraform pipeline IAM role can modify them.

**15.13 Tagging Strategy & Cost Optimization**

- Mandatory tags on every resource (Environment, CostCenter, Team,
  Service, Project) defined once in `local.common_tags` (5.3) and
  merged into every resource — nothing escapes tagging.
- Add `validation {}` on the CostCenter variable to catch typos at
  plan time; enforce with an AWS Config `required-tags` rule that
  flags non-compliant resources.
- AWS Cost Explorer filters spend by tag; Terraform-managed AWS
  Budgets alert when a team/project exceeds threshold.
- Cost levers directly in Terraform: per-environment instance sizing
  in `tfvars` (dev small, prod large), a Terraform-managed Lambda that
  scales dev EKS node groups to zero overnight, S3 lifecycle rules
  (transition to Glacier after 90 days, expire after 365), and
  CloudWatch right-sizing alarms on low CPU utilization.

**15.14 Large-Scale Infrastructure Refactoring**

- Map every resource that needs to move: old address → new address.
- Use `moved {}` blocks (4.6, 2.6) for all moves — Git-tracked,
  PR-reviewable, and can be batched.
- Execute in small batches (10–20 resources per PR) — never move
  everything in one PR.
- After each batch, `terraform plan` must show 0 changes before moving
  to the next batch. Delete the `moves.tf` file in a final cleanup PR
  once the full refactor is verified.

**15.15 Troubleshooting: Unexpected Destroys & Partial Apply Failures**

*Plan shows unexpected destroys (e.g. 50 resources):*

- STOP — never apply without understanding why.
- Read the plan output carefully for the root cause. Common causes:
  `count` → `for_each` migration without `state mv`, a module rename
  without a `moved` block, a removed `depends_on` changing creation
  order, or a `for_each` map key change (old key destroyed, new key
  created).
- Fix based on root cause (`state mv`, `moved` block, or revert), then
  verify `terraform plan` shows 0 changes.

*Apply fails halfway through:*

- Don't panic — Terraform handles partial applies gracefully; the
  state file tracks exactly what was created so far, and Terraform is
  idempotent — safe to re-run.
- `terraform plan` shows current vs desired state. Check the error
  message — most common causes are IAM permission denied, quota
  exceeded, or API rate limiting.
- Fix the root cause, then re-run `terraform apply` — it skips
  already-created resources and continues from the failure point.

---

# PART 2 — INTERVIEW QUESTION INDEX

Every question below has been converted into structured concept notes
in Part 1 per the Interview Question Integration Rule — this index is
a cross-reference for interview prep, not a duplicate answer store.
Find the question, jump to the location, and you have the full answer
plus surrounding context.

### SECTION 1 — BEGINNER (Q1–Q20)

| Q# | Question (short) | Concept | Part 1 Location |
|---|---|---|---|
| Q1 | What is Terraform and why used? | IaC fundamentals | §1.1–1.2 |
| Q2 | Terraform workflow, every step | init→validate→fmt→plan→apply | §1.3, §13 |
| Q3 | What is the state file? | State file contents | §2.1 |
| Q4 | plan vs apply | Core workflow | §1.3 |
| Q5 | What is Remote State? | S3+DynamoDB backend | §2.2 |
| Q6 | What is a module? | Module fundamentals | §4.1 |
| Q7 | variables.tf vs terraform.tfvars | Declare vs assign | §1.5 |
| Q8 | What is a provider? | Provider plugins, version pinning | §6.1 |
| Q9 | count vs for_each, danger of count | Identity basis, cascade risk | §5.1 |
| Q10 | Lifecycle rules — all four | create_before_destroy, prevent_destroy, ignore_changes, replace_triggered_by | §5.2 |
| Q11 | terraform import | Import CLI + block | §6.2 |
| Q12 | validate vs plan | Command comparison | §1.3 |
| Q13 | terraform fmt in CI/CD | fmt -check -recursive | §1.3, §13 |
| Q14 | resource vs data source | Data source pattern | §1.4, §10.1 |
| Q15 | depends_on — when to use | Explicit dependencies | §1 |
| Q16 | What are outputs? | Module interface | §4.3 |
| Q17 | locals block vs variable | DRY code | §5.3 |
| Q18 | Workspaces vs separate backends | State isolation strategy | §2.7 |
| Q19 | Securing the state file | State security controls | §2.1 |
| Q20 | sensitive = true | Variable masking, still in state | §1.5, §10.2 |

### SECTION 2 — INTERMEDIATE (Q21–Q50)

| Q# | Question (short) | Concept | Part 1 Location |
|---|---|---|---|
| Q21 | Structuring code for Dev/UAT/Prod | Modules + per-env tfvars/backends | §2.4, §4.2 |
| Q22 | Handling state drift | Drift detection/response | §3.1–3.3 |
| Q23 | Resource manually deleted — what happens | Deletion impact table | §2.12(d) |
| Q24 | Renaming a resource without recreation | state mv / moved block | §2.6 |
| Q25 | Plan shows 0 changes but infra changed | -refresh=false root cause | §3.5 |
| Q26 | 3 envs share one backend — separate safely | Shared backend migration | §2.11 |
| Q27 | count + middle insertion — module scenario | Cascade destruction | §5.1 |
| Q28 | Recovery after apply -auto-approve incident | Incident recovery playbook | §2.12(c) |
| Q29 | State shows resource deleted weeks ago | Prevention checklist | §3.6 |
| Q30 | Importing 40 AWS resources | Bulk import strategy | §6.2 |
| Q31 | IRSA configuration | OIDC + trust policy + role | §11 |
| Q32 | Managing secrets in Terraform | Secrets Manager, Vault, rotation | §10.2 |
| Q33 | Zero-downtime EKS upgrades | Upgrade prerequisites + flow | §11.2 |
| Q34 | terraform_remote_state | Cross-state data sharing | §2.8 |
| Q35 | .terraform.lock.hcl | Provider version lock | §6.1, §6.3 |
| Q36 | Provider upgrade breaks silently | Default-value change risk | §6.3 |
| Q37 | Concurrent apply without locking | State corruption mechanics | §2.9 |
| Q38 | Making code reusable across teams | Modules + locals + tfvars + Git tags | §4.1, §4.6 |
| Q39 | for_each unknown value at plan time | Static iteration set fix | §5.5 |
| Q40 | State in multi-cloud projects | Multi-cloud isolation | §2.10 |
| Q41 | moved block vs state mv | Comparison table | §2.6 |
| Q42 | Jenkins approval gate | Manual approval pipeline stage | §13.1 |
| Q43 | What is Terragrunt? | DRY wrapper | §6.4 |
| Q44 | Detecting provider default value changes | Safe upgrade procedure | §6.3 |
| Q45 | Partial backend config for multi-env | -backend-config pattern | §2.3 |
| Q46 | Tagging strategy at scale | common_tags + Cost Explorer/Config | §5.3, §15.13 |
| Q47 | Dynamic blocks | Repeated nested config from a map | §5.4 |
| Q48 | cidrsubnet — automatic CIDR allocation | CIDR function | §5.7 |
| Q49 | Cost optimisation with Terraform | Scheduling, lifecycle rules, right-sizing | §15.13 |
| Q50 | for expression | Collection transforms | §5.6 |

### SECTION 3 — ADVANCED (Q51–Q75)

| Q# | Question (short) | Concept | Part 1 Location |
|---|---|---|---|
| Q51 | Multi-account enterprise architecture | Account separation, SCPs | §15.1 |
| Q52 | Terraform at 1000+ resources | State decomposition | §15.2 |
| Q53 | Policy as code — tfsec/OPA/Sentinel | Static/plan-level/enterprise policy gates | §15.3 |
| Q54 | GitOps — Atlantis vs TFC vs Jenkins | CI/CD comparison | §13.2 |
| Q55 | Zero-downtime EKS upgrades (advanced) | Same as Q33 | §11.2 |
| Q56 | CloudFormation → Terraform migration | cf2tf + phased import | §6.2 |
| Q57 | Provider upgrade strategy in production | Same as Q36/Q44 | §6.3 |
| Q58 | What is CDKTF? | Terraform via Python/TS/Java/Go | §6.5 |
| Q59 | Blue-green deployments | Traffic-weight cutover pattern | §15.4 |
| Q60 | Disaster recovery for Terraform infra | DR-region config, RTO, drills | §15.5 |
| Q61 | terraform graph for dependency debugging | DOT graph rendering | §15.6 |
| Q62 | -parallelism flag | Concurrency tuning | §15.7 |
| Q63 | replace_triggered_by in production | Real example | §5.2 |
| Q64 | terraform plan -destroy | Destroy preview | §15.8 |
| Q65 | Secrets rotation | RDS/Secrets Manager/KMS/IRSA rotation | §10.2 |
| Q66 | State corrupted or deleted — recovery | S3 versioning restore procedure | §2.12(b) |
| Q67 | Testing modules — Terratest | Testing pyramid | §4.7 |
| Q68 | terraform taint — why deprecated | -replace flag | §15.9 |
| Q69 | Cross-account IAM role assumption | provider alias + assume_role | §15.10 |
| Q70 | terraform console | Interactive REPL | §15.11 |
| Q71 | Enterprise network security controls | SG/WAF/Flow Logs/Firewall as code | §15.12 |
| Q72 | EKS add-ons configuration | aws_eks_addon | §11.3 |
| Q73 | -refresh=false vs -refresh-only | Flag comparison table | §3.5 |
| Q74 | Cost allocation & chargeback via tags | Tagging + Cost Explorer/Budgets/Config | §15.13 |
| Q75 | Large-scale infrastructure refactoring | Batched moved blocks | §15.14 |

### SECTION 4 — SCENARIO-BASED (Q76–Q90)

| Q# | Question (short) | Concept | Part 1 Location |
|---|---|---|---|
| Q76 | Prod EKS down, state locked | Stuck lock recovery | §2.12(a) |
| Q77 | Junior engineer ran destroy on prod | Incident response timeline | §2.12(c) |
| Q78 | Security team's emergency console change reverting | Drift Type 1 response | §3.3 |
| Q79 | Design IRSA for payment microservice | IRSA least-privilege pattern | §11, §11.1 |
| Q80 | 3 envs accidentally share a backend | Same as Q26 | §2.11 |
| Q81 | Apply failing halfway through | Partial-apply troubleshooting | §15.15 |
| Q82 | Add 3 IAM roles without affecting existing | for_each additive-only behavior | §5.1 |
| Q83 | Plan shows 50 unexpected destroys | Root-cause troubleshooting | §15.15 |
| Q84 | Rolling back a failed apply | Forward-only philosophy | §2.12(e) |
| Q85 | Extending Terraform to a new DR region | Provider alias pattern | §15.5 |

### SECTION 5 — RAPID FIRE (Q91–Q120)

One-liners already folded into their concept sections and the cheat
sheet (§14) — see: Q92/94 state serial+lineage (§2.1), Q96 state rm vs
destroy (§14), Q98 -migrate-state (§2.3, §14), Q100 taint deprecated
(§15.9), Q105 terraform graph (§15.6), Q109 replace_triggered_by
(§5.2), Q111 workspace show (§2.7, §14), Q112 -target flag (§14),
Q118 EC2 az argument (§14), Q120 Terraformer (§6.2, §14). All other
rapid-fire items (Q91, Q93, Q95, Q97, Q99, Q101–104, Q106–108,
Q110, Q113–117, Q119) restate facts already fully covered in §1–§10
and §14 — no new content.

### SECTION 6 — MY MISTAKES (Q121–Q136)

All 16 entries are the direct source material for the mistake tables
already in §12.1–§12.4, plus Q129 and Q133 which are now in the new
§12.5. Every mistake in this range maps 1:1 to an existing table row —
no new content beyond §12.

---

## ✅ What's New in This Edition (Interview-Question Consolidation Pass)

**V1 stays V1** — per the single-active-file rule, this was an in-place
update, not a new version.

**Questions processed:** 131 (Q1–Q85, Q91–Q120, Q121–Q136)

**New concepts added to Part 1 (24):** §2.7 Workspaces vs Separate
Backends · §2.8 terraform_remote_state · §2.9 Concurrent Apply
Corruption · §2.10 Multi-Cloud State Isolation · §2.11 Shared-Backend
Migration · §2.12 State & Infrastructure Recovery Playbook (5 parts)
· §3.5 -refresh flag comparison · §3.6 Prevention Checklist · §4.6
Module Versioning · §4.7 Terratest · §5.5 for_each Unknown Value ·
§5.6 for Expressions · §5.7 cidrsubnet · §6.3 Safe Provider Upgrades ·
§6.4 Terragrunt · §6.5 CDKTF · §10.2 Secrets Management · §11.2
Zero-Downtime EKS Upgrades · §11.3 EKS Add-ons · §12.5 Performance &
Debugging Mistakes · §13.2 GitOps Comparison · §15 (15 new
subsections: multi-account, scale, policy-as-code, blue-green, DR,
graph, parallelism, plan -destroy, taint/-replace, cross-account IAM,
console, network security, tagging/cost, refactoring, troubleshooting)

**Existing concepts updated/enriched (9):** §2.1 state security rules
+ serial/lineage · §2.3 -migrate-state note · §2.6 moved-vs-state-mv
table · §5.1 splat-on-map footnote · §5.2 replace_triggered_by
example · §5.4 dynamic block conditional pattern · §10.1 AMI data
source snippet · §11.1 annotate-ServiceAccount step · §14 cheat sheet
(15 new rows)

**Duplicate questions skipped (~98):** all of Q1–Q17, Q19–Q22, Q24,
Q27, Q31, Q33/Q55 (same content, counted once), Q41–Q42, Q45–Q47,
Q51–Q54 dup-checked against §15 additions, Q56–Q65 dup-checked, Q68–
Q85 dup-checked, and the full Q91–Q136 range — each mapped to
already-covered material and folded in rather than re-stored as
separate Q&A blocks. Near-identical incident-recovery questions (Q23,
Q28, Q66, Q76, Q77, Q84) were merged into ONE canonical playbook
(§2.12) instead of five overlapping procedures.

**Handbook sections modified:** §2, §3, §4, §5, §6, §10, §11, §12,
§13, §14, Table of Contents, Coverage Tracker — plus new §15 and this
rebuilt Part 2 index.

**Part 2 restructuring:** the original 136-question Q&A bank (with
repeated 30-second-answer boxes and follow-up-question lists) has been
replaced with this lean cross-reference index. The substance now lives
exactly once, in Part 1 — this removes several hundred lines of
duplicated explanation while keeping full interview-prep traceability.

**Rapid Fire sections:** not yet added — per-topic 🔥 Rapid Fire blocks
and the end-of-handbook 🔥🔥 Master Rapid Fire chapter (new
requirement from the updated master prompt) are queued as the next
pass over this same file.

---

*Terraform-Handbook-2025-07-v1.md — single active file, edited in
place. Frozen only on explicit "go with version 2" command.*
