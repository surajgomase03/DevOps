# TERRAFORM HANDBOOK
### VERSION 1 | JULY 2025 | FOUNDATION EDITION
#### Production Notes + Interview Question Bank — Consolidated Markdown Edition

---

## 📌 Handbook Metadata

| Field | Value |
|---|---|
| **Version** | V1 — Foundation Edition |
| **Month** | July 2025 |
| **Status** | 🔒 **READ-ONLY** — archived, never edit (Rule 1) |
| **Next Version** | V2 — first new month (new topics only, no duplication — Rule 2/3) |
| **Engineer** | Suraj Gomase — Senior DevOps Engineer, TCS |
| **Project** | UK Government DWP — CMG (Child Maintenance Group) |
| **Stack** | AWS EKS \| Jenkins \| Terraform \| Helm \| ArgoCD \| Vault |
| **Source** | Consolidated from `Terraform_NOTES_V1_July2025_Suraj.docx` + `Terraform_INTERVIEW_V1_July2025_Suraj.docx` |
| **Coverage** | Part 1: 14 Notes sections · Part 2: 136 interview Q&A |
| **Rule** | V2 onwards references this file — no repeated content |

---

## 📋 CHANGELOG — V1 (July 2025)

> **V1 — Initial Foundation — ALL NEW CONTENT**
>
> ✅ Part 1, Sections 1–14: Fundamentals, State, Drift, Modules, Advanced HCL, Providers/Imports, Security Groups, VPC Architecture, ALB, Security, IRSA, My Mistakes, Jenkins CI/CD, Cheat Sheet
>
> ✅ Part 2, Q1–Q136: Beginner → Intermediate → Advanced → Scenario-based → Rapid Fire → Mistake-based interview questions, each with detailed point-wise answer + 30-second answer
>
> NOTE: V2 will add NEW topics only and will reference this file for any foundational concepts already covered here — never repeated.

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
| 10 | Security — IAM, IMDSv2, EBS, AMI, Keypair, Least Privilege |
| 11 | IRSA — OIDC + IAM Trust Policy + Terraform Configuration |
| 12 | My Mistakes — 9 Categories, 30+ Real Mistakes with Fixes |
| 13 | Jenkins CI/CD Pipeline — Full Production Configuration |
| 14 | V1 Quick Reference Cheat Sheet |

**PART 2 — INTERVIEW QUESTION BANK (136 Questions)**

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
| 8 | Outputs | 🟡 | §4, Q136 |
| 9 | Data Sources | 🟡 | §10 (AMI) |
| 10 | Locals | ✅ | §5 |
| 11 | Expressions & Functions | 🟡 | §5, §14 |
| 12 | Conditionals | ⬜ | — |
| 13 | count | ✅ | §5 |
| 14 | for_each | ✅ | §5 |
| 15 | Dynamic Blocks | ✅ | §5 |
| 16 | Modules | ✅ | §4 |
| 17 | Module Sources | 🟡 | §4 |
| 18 | Backend | ✅ | §2 |
| 19 | State File | ✅ | §2 |
| 20 | Remote State | ✅ | §2 |
| 21 | State Commands | ✅ | §2, §14 |
| 22 | State Locking | 🟡 | §2, §14 (force-unlock) |
| 23 | Import | ✅ | §6 |
| 24 | Moved Blocks | ✅ | §14 |
| 25 | Lifecycle | ✅ | §5 |
| 26 | depends_on | ⬜ | — |
| 27 | Provisioners | ⬜ | — |
| 28 | Connection Blocks | ⬜ | — |
| 29 | Workspaces | ⬜ | — |
| 30 | Environment Management | 🟡 | §6 (backend-config) |
| 31 | Sensitive Variables | ✅ | §14 |
| 32 | Validation | 🟡 | §1 (variables.tf example) |
| 33 | Preconditions/Postconditions | ⬜ | — |
| 34 | Terraform Console | ⬜ | — |
| 35 | Graph | ⬜ | — |
| 36 | Debugging | 🟡 | §3, §12 |
| 37 | Testing | ⬜ | — |
| 38 | CI/CD Integration | ✅ | §13 |
| 39 | AWS Provider | ✅ | §7–§11 |
| 40 | Azure Provider | ⬜ | — |
| 41 | GCP Provider | ⬜ | — |
| 42 | Kubernetes & Helm Providers | ⬜ | — |
| 43 | Security | ✅ | §7, §10 |
| 44 | Performance | ⬜ | — |
| 45 | Cost Optimization | ⬜ | — |
| 46 | Production Folder Structure | 🟡 | §4 |
| 47 | Reusable Modules | ✅ | §4 |
| 48 | Disaster Recovery | ⬜ | — |
| 49 | Troubleshooting | ✅ | §3, §12 |
| 50 | Enterprise Best Practices | 🟡 | throughout |
| 51 | Hands-on Labs | ⬜ | — |
| 52 | Interview Preparation | ✅ | Part 2 (136 Q&A) |
| 53 | Cheat Sheets | ✅ | §14 |
| 54 | Revision Notes | 🟡 | §14 |

**V2 candidates (⬜ Pending):** Installing Terraform, Conditionals, depends_on, Provisioners/Connection Blocks, Workspaces, Preconditions/Postconditions, Terraform Console, Graph, Testing, Azure/GCP/Kubernetes providers, Performance, Cost Optimization, Disaster Recovery, Hands-on Labs.

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

> **❌ Real Mistake — variables.tf vs tfvars**
>
> Assigned values in terraform.tfvars but forgot to DECLARE in variables.tf.
>
> Terraform error: "Reference to undeclared input variable"
>
> RULE: variables.tf = DECLARE. terraform.tfvars = ASSIGN.
>
> Flow: terraform.tfvars → variables.tf (declaration) → var.name in main.tf


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

---

# PART 2 — INTERVIEW QUESTION BANK

### SECTION 1 — BEGINNER LEVEL (Q1 – Q20)

#### Q1 [ Beginner ] — What is Terraform and why is it used?


- Open-source Infrastructure as Code (IaC) tool by HashiCorp — define
  infra in code.

- Declarative — you state WHAT you want; Terraform computes HOW to
  create it.

- Multi-cloud — AWS, Azure, GCP, Kubernetes, 3,000+ providers, one
  workflow.

- Idempotent — running the same config multiple times gives the same
  result.

- Why used: manual console is error-prone, not reproducible, no audit
  trail.

- With Terraform: version-controlled infra, reproducible environments,
  team collaboration.

- CMG: all 200+ AWS resources (VPC, EKS, IAM, SGs, CloudWatch) managed
  via Terraform.

- Alternative to: CloudFormation (AWS-only), ARM templates (Azure-only),
  manual clicks.

|                                                                                                                                                                                                                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                     |
| *Terraform is an open-source IaC tool by HashiCorp. I define AWS infrastructure in HCL declaratively — Terraform computes and creates it. In CMG we manage 200+ resources across 3 EKS clusters. It gives version control, reproducibility, and zero manual console changes in production.* |

> **Follow-up Questions**
>
> → Terraform vs Ansible — key difference?
>
> → What is declarative vs imperative?
>
> → What providers have you used in production?


#### Q2 [ Beginner ] — Explain the Terraform workflow — every step and why it matters.


- Step 1 — terraform init: downloads provider plugins, sets up backend,
  initialises modules.

- Step 2 — terraform validate: syntax + config check — no AWS calls,
  very fast.

- Step 3 — terraform fmt: auto-formats code to canonical style.

- Step 4 — terraform plan -out=plan.out: previews exact changes — saves
  to file.

- Step 5 — terraform apply plan.out: executes the EXACT saved plan — no
  surprises.

- Step 6 — terraform destroy: tears down all managed resources (use
  carefully).

> **CMG CI/CD Pipeline Order**
>
> init → validate → fmt -check → tfsec scan → plan -out → approval gate → apply saved plan
>
> Key: Always save plan with -out flag. Apply the saved file.
>
> What was reviewed = what gets applied. No plan-to-apply drift possible.


|                                                                                                                                                                                                                                                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                              |
| *The workflow is: init downloads providers, validate checks syntax, plan previews and saves changes to file, then apply executes that exact file. In CMG we add tfsec security scan and a manual approval gate before any production apply. Saving plan to file is critical — it guarantees what was reviewed is exactly what runs.* |

> **Follow-up Questions**
>
> → Why save plan to a file with -out?
>
> → What does -reconfigure do in init?
>
> → What is -detailed-exitcode?


#### Q3 [ Beginner ] — What is the Terraform state file? What does it contain?


- terraform.tfstate — JSON file that is Terraform's memory of every
  resource it manages.

- Maps every .tf resource block to a real AWS resource ID, ARN, and all
  its attributes.

- Contains: resource IDs, ARNs, all attribute values, dependencies,
  outputs, provider metadata.

- Without state: Terraform cannot know what already exists — it
  recreates everything every apply.

- State is NOT a backup — it is metadata about infrastructure.

- State contains secrets (RDS passwords, keys) — always encrypt and
  restrict access.

- CMG: state stored in S3 with KMS encryption, versioning enabled,
  DynamoDB locking.

> **NEVER commit .tfstate to Git**
>
> Add *.tfstate to .gitignore
>
> State contains all resource secrets in plaintext


|                                                                                                                                                                                                                                                                                                                            |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                    |
| *State file is Terraform's memory — JSON mapping .tf code to real AWS resource IDs and attributes. Without it Terraform cannot compute what changed. It contains secrets so in CMG we store it in S3 with KMS encryption, restrict access via bucket policy, and enable versioning for recovery from accidental deletion.* |

> **Follow-up Questions**
>
> → What is state locking?
>
> → What happens if state is accidentally deleted?
>
> → What command lists all state resources?


#### Q4 [ Beginner ] — What is the difference between terraform plan and terraform apply?


- terraform plan — PREVIEW only. Reads state + config, computes diff,
  shows what WILL change. Nothing modified.

- terraform apply — EXECUTES. Calls AWS APIs, creates/modifies/destroys
  real resources.

- Plan symbols: Green + = create. Yellow ~ = modify. Red - = destroy.

- Best practice: terraform plan -out=plan.out then terraform apply
  plan.out.

- Using -out flag: ensures what was reviewed is EXACTLY what gets
  applied.

- NEVER use -auto-approve in production — removes human review
  checkpoint.

|                                                                                                                                                                                                                                                                     |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                             |
| *Plan is a safe preview — shows changes without making any. Apply executes them. In CMG I always save plan with -out flag and apply that exact file so there is zero difference between what was reviewed and what runs. We never use -auto-approve on production.* |

> **Follow-up Questions**
>
> → What is the -target flag in plan/apply?
>
> → Can you apply without running plan first?
>
> → What is terraform plan -refresh-only?


#### Q5 [ Beginner ] — What is Remote State and why is it needed?


- Remote state stores terraform.tfstate in S3 instead of local disk.

- Without remote state: only one person can use Terraform — no team
  collaboration possible.

- Remote state enables: shared access, state locking, encryption,
  versioning, backup.

- S3 = state storage. DynamoDB lock table = prevents two simultaneous
  applies corrupting state.

- Before any apply: Terraform writes lock item to DynamoDB. After apply:
  lock item deleted.

- Stuck lock: terraform force-unlock LOCK_ID — only after confirming NO
  active apply.

|                                        |
|----------------------------------------|
| terraform { backend "s3" {             |
| bucket = "cmg-terraform-state-prod"    |
| key = "eks/prod/terraform.tfstate"     |
| region = "eu-west-2"                   |
| encrypt = true                         |
| dynamodb_table = "cmg-terraform-locks" |
| }}                                     |

|                                                                                                                                                                                                                                                                                                |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                        |
| *Remote state in S3 allows the whole team to share one state. DynamoDB locking prevents two engineers applying simultaneously which would corrupt state. In CMG we have separate S3 buckets per environment with KMS encryption and S3 versioning so we can recover from accidental deletion.* |

> **Follow-up Questions**
>
> → What happens if two engineers apply simultaneously without locking?
>
> → How do you recover a deleted state file?
>
> → What is partial backend config?


#### Q6 [ Beginner ] — What is a Terraform module? Explain with your project.


- A module is any directory containing .tf files — even a single file
  qualifies.

- Root module = directory you run terraform from. Calls child modules.

- Child modules = reusable packages with defined inputs (variables) and
  outputs.

- Think: function in programming. Variables = parameters. Resources =
  body. Outputs = return values.

- GOLDEN RULE: Modules NEVER reference each other's resources directly.

- Communication: Module A outputs a value → root module passes it →
  Module B receives as input.

- CMG: 5 modules — vpc, eks, iam, security-groups, monitoring. Root
  wires them together.

|                                                                                                                                                                                                                                                                                                                                          |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                  |
| *A module is a reusable Terraform package — inputs in via variables, resources created inside, outputs returned. In CMG we have 5 modules. VPC module outputs vpc_id and subnet IDs. Root module passes these to the EKS module as inputs. Modules never talk to each other directly — all communication flows through the root module.* |

> **Follow-up Questions**
>
> → How do modules communicate?
>
> → What is the difference between root and child module?
>
> → Can a module call another module?


#### Q7 [ Beginner ] — What is the difference between variables.tf and terraform.tfvars?


- variables.tf = DECLARATION. Defines that a variable exists, its type,
  description, validation.

- terraform.tfvars = ASSIGNMENT. Provides the actual value for a
  declared variable.

- Must declare in variables.tf FIRST — tfvars value without declaration
  causes error.

- Error message: "Reference to undeclared input variable"

- Flow: terraform.tfvars → variables.tf → var.name used in resources.

> **Real mistake I made**
>
> Assigned values in tfvars but forgot to declare in variables.tf.
>
> Got: "Reference to undeclared input variable"
>
> Fix: Always declare in variables.tf first, THEN assign in tfvars.


|                                                                                                                                                                                                                                                                                                                |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                        |
| *variables.tf declares variables with type and description. terraform.tfvars assigns their values. You must declare first — assigning without declaration causes an error. In CMG we have separate tfvars per environment: dev.tfvars for small nodes, prod.tfvars for large nodes with prevent_destroy true.* |

> **Follow-up Questions**
>
> → What is variable precedence?
>
> → How do you pass variables in Jenkins?
>
> → What does sensitive = true do?


#### Q8 [ Beginner ] — What is a provider in Terraform?


- A provider is a plugin that translates HCL resource blocks into cloud
  API calls.

- Without a provider, Terraform cannot create any resource — it does not
  know the API.

- AWS provider supports 1,000+ resource types: aws_vpc, aws_eks_cluster,
  aws_iam_role, etc.

- Downloaded automatically by terraform init from Terraform Registry.

- ALWAYS pin provider versions — prevents silent upgrades breaking your
  config.

- Commit .terraform.lock.hcl to Git — locks exact version for all team
  members.

- CMG: IAM Role on Jenkins EC2 — zero credentials in provider block.

> **Real mistake — provider config errors**
>
> Wrong: version = "5.0" → Correct: version = "~> 5.0" (allows patches)
>
> Wrong: region inside required_providers block → region goes in provider {} only
>
> Wrong: Not committing lock file → always commit .terraform.lock.hcl


|                                                                                                                                                                                                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                              |
| *A provider plugin translates HCL into cloud API calls. The AWS provider converts aws_eks_cluster block into AWS EKS CreateCluster API call. I always pin to ~\> 5.0 and commit the lock file. In CMG the Jenkins EC2 has an IAM Role attached — zero credentials in provider code.* |

> **Follow-up Questions**
>
> → How does Terraform authenticate to AWS without credentials?
>
> → What is .terraform.lock.hcl?
>
> → Can you use multiple providers in one config?


#### Q9 [ Beginner ] — Explain count vs for_each — when to use each and the danger of count.


- count = creates N resources identified by ARRAY INDEX (0, 1, 2...).

- for_each = creates resources from a map/set identified by MAP KEY
  (string).

- CRITICAL DANGER with count: inserting or removing a middle item shifts
  all subsequent indexes.

- Index shift = Terraform sees those as different resources = cascading
  destroy + recreate.

- for_each: removing one key only affects that specific resource —
  others completely untouched.

- Use count for: truly identical resources or conditional create (count
  = var.x ? 1 : 0).

- Use for_each for: subnets, security groups, IAM roles — anything with
  meaningful names.

> **Real mistake I made**
>
> Used count for subnets. Inserted a new subnet at position 0.
>
> Terraform destroyed and recreated ALL subnets after position 0.
>
> EKS nodes lost networking — production outage.


|                                                                                                                                                                                                                                                                                                                        |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                |
| *count uses index position as identity — inserting in the middle cascades destroys. for_each uses a string key — removing one item only affects that one resource. In CMG I always use for_each for subnets, security groups, and IAM roles. I only use count for truly identical resources with no meaningful names.* |

> **Follow-up Questions**
>
> → How do you migrate from count to for_each without destroying resources?
>
> → What is the splat operator and when does it break?


#### Q10 [ Beginner ] — What are Terraform lifecycle rules? Explain all four.


|                       |                                              |                                              |                                                    |
|-----------------------|----------------------------------------------|----------------------------------------------|----------------------------------------------------|
| **Rule**              | **What It Does**                             | **CMG Example**                              | **When to Use**                                    |
| create_before_destroy | New resource created BEFORE old is deleted   | EKS node groups — zero downtime rotation     | Resource replacement causes downtime without it    |
| prevent_destroy       | Terraform errors if plan would destroy this  | All prod EKS clusters, RDS, state S3 bucket  | Critical prod resources that must never be deleted |
| ignore_changes        | Stop tracking changes to specific attributes | desired_size — Cluster Autoscaler manages it | External system changes an attribute after create  |
| replace_triggered_by  | Force replace when another resource changes  | EC2 replace when launch template AMI changes | Resource must be fresh when dependency changes     |

|                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                      |
| *Four lifecycle rules. create_before_destroy gives zero-downtime replacements — critical for EKS node groups. prevent_destroy blocks accidental deletion — I use it on all CMG prod EKS clusters and RDS. ignore_changes stops Terraform fighting Cluster Autoscaler over node count. replace_triggered_by forces fresh resource when a dependency changes.* |

> **Follow-up Questions**
>
> → Why does create_before_destroy require name_prefix instead of name?
>
> → Can prevent_destroy be overridden?
>
> → When would ignore_changes cause problems?


#### Q11 [ Beginner ] — What does terraform import do and how do you use it?


- Brings existing AWS resources (not created by Terraform) under
  Terraform management.

- Adds resource entry to state file with all its real AWS attributes.

- MUST write the .tf resource block first — import only adds to state,
  does not generate code.

- After import: run terraform plan — fix attribute differences until
  plan shows 0 changes.

- import {} block (Terraform 1.5+): declared in .tf files, Git-tracked,
  PR-reviewable.

- CLI import: terraform import resource_address aws_resource_id.

|                                                                      |
|----------------------------------------------------------------------|
| \# import block (1.5+) — preferred                                   |
| import { to = module.vpc.aws_vpc.main; id = "vpc-0abc123" }          |
| import { to = module.eks.aws_eks_cluster.main; id = "cmg-eks-prod" } |
| \# terraform apply imports all. Remove blocks after apply.           |
|                                                                      |
| \# CLI (all versions)                                                |
| terraform import module.vpc.aws_vpc.main vpc-0abc123                 |

|                                                                                                                                                                                                                                                                                                                                                                                            |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                    |
| *terraform import adopts existing AWS resources into Terraform state management. I write the resource block first, then import — Terraform adds it to state. After import I run plan to find attribute differences and fix .tf code until plan shows 0 changes. In CMG we used this when migrating 40 manually-created resources. I prefer import blocks in 1.5+ as they are Git-tracked.* |

#### Q12 [ Beginner ] — What is terraform validate and how is it different from terraform plan?


|                    |                                              |                    |           |                          |
|--------------------|----------------------------------------------|--------------------|-----------|--------------------------|
| **Command**        | **Checks**                                   | **AWS API calls?** | **Speed** | **When to run**          |
| terraform validate | Syntax, types, references, required args     | No                 | Very fast | Always before plan in CI |
| terraform plan     | All above + real infrastructure state + diff | Yes                | Slower    | Before every apply       |
| terraform apply    | All above + executes changes                 | Yes                | Slowest   | After reviewing plan     |

|                                                                                                                                                                                                                                                                                                            |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                    |
| *validate checks syntax and config correctness without calling AWS APIs — very fast. plan does all that plus queries real AWS to compute a diff. I run validate as the second CI/CD stage right after init. It catches typos, wrong types, missing required arguments before wasting time on a full plan.* |

#### Q13 [ Beginner ] — What is terraform fmt and why do you use it in CI/CD?


- Automatically reformats .tf files to canonical Terraform style —
  indentation, alignment, spacing.

- terraform fmt = auto-fix files. terraform fmt -check = CI mode — exits
  1 if any file needs formatting.

- terraform fmt -recursive = processes all subdirectories including
  modules.

- In CMG Jenkins: terraform fmt -check -recursive — fails build if any
  file is unformatted.

- Enforces team coding style with zero discussion — machine decides
  format.

|                                                                                                                                                                                                                                                                                                      |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                              |
| *terraform fmt auto-formats .tf files to canonical style. In CI I use terraform fmt -check -recursive which exits with code 1 if any file needs formatting — this fails the build. It enforces consistent style across the whole team automatically. Run terraform fmt locally before every commit.* |

#### Q14 [ Beginner ] — What is the difference between a resource and a data source?


- resource {} — CREATES and manages infrastructure. Tracked in state.
  Appears in plan.

- data {} — READS existing infrastructure. No creation. Not tracked as
  managed resource.

- Data source: always just reads — never shows as create/modify/destroy
  in plan output.

|                                                                     |
|---------------------------------------------------------------------|
| \# resource — creates new VPC (tracked in state)                    |
| resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }            |
|                                                                     |
| \# data source — reads existing latest AL2023 AMI (not tracked)     |
| data "aws_ami" "al2023" {                                           |
| most_recent = true                                                  |
| owners = \["amazon"\]                                               |
| filter { name = "name"; values = \["al2023-ami-\*-x86_64"\] }       |
| }                                                                   |
| ami = data.aws_ami.al2023.id \# Always current, always right region |

|                                                                                                                                                                                                                                                                                                                            |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                    |
| *resource creates and manages infra — tracked in state, appears in plan as create/modify/destroy. data source reads existing infra without creating anything. In CMG I use data sources for: latest EKS AMI, existing ACM certificates, secrets from Secrets Manager, ELB service account ARN for ALB logs bucket policy.* |

#### Q15 [ Beginner ] — What is depends_on and when should you actually use it?


- Creates an explicit dependency between resources — forces creation
  order.

- Terraform detects dependencies automatically when you reference one
  resource in another.

- depends_on is ONLY needed when dependency CANNOT be detected by
  reference.

- Most common legitimate use: IAM eventual consistency — role exists but
  policy not yet propagated.

- Overusing depends_on creates unnecessary ordering and slows down
  parallel applies.

> **Real mistake I made**
>
> Added depends_on = [aws_security_group.app] when not needed.
>
> Terraform already detected that dependency through the reference.
>
> Only use depends_on when absolutely necessary.


|                                                                            |
|----------------------------------------------------------------------------|
| \# Correct use: IAM eventual consistency before EKS creation               |
| resource "time_sleep" "wait_iam" {                                         |
| depends_on = \[aws_iam_role_policy_attachment.eks_cluster_policy\]         |
| create_duration = "30s"                                                    |
| }                                                                          |
| resource "aws_eks_cluster" "main" { depends_on = \[time_sleep.wait_iam\] } |

|                                                                                                                                                                                                                                                                                                                                                                                                        |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                |
| *depends_on forces explicit resource ordering when Terraform cannot detect the dependency through resource references. The most common case is IAM eventual consistency — the role exists in state but its policy attachment hasn't propagated to all AWS regions yet. In CMG I add a 30-second time_sleep after IAM policy attachments before EKS cluster creation to prevent intermittent failures.* |

#### Q16 [ Beginner ] — What are outputs in Terraform and why are they important?


- Outputs export values from a module after apply — like function return
  values.

- Modules use outputs to share computed values (IDs, ARNs, endpoints)
  with callers.

- Root outputs display in terminal and are queryable with terraform
  output command.

- terraform output -raw eks_endpoint — Jenkins uses this to configure
  kubectl after apply.

- RULE: If another module needs something from yours — always create an
  output for it.

|                                                                                                 |
|-------------------------------------------------------------------------------------------------|
| \# modules/vpc/outputs.tf                                                                       |
| output "vpc_id" { value = aws_vpc.main.id }                                                     |
| output "private_subnet_ids" { value = { for k,v in aws_subnet.private : k =\> v.id } }          |
|                                                                                                 |
| \# Root module — pass VPC output to EKS as input                                                |
| module "eks" { vpc_id = module.vpc.vpc_id; private_subnet_ids = module.vpc.private_subnet_ids } |

|                                                                                                                                                                                                                                                                                                                 |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                         |
| *Outputs are how modules share values. VPC module outputs vpc_id and subnet map. Root module passes them to EKS module as inputs. In CMG, Jenkins uses terraform output -raw eks_endpoint right after apply to configure kubectl for the next deployment stage. Without outputs, modules are isolated islands.* |

#### Q17 [ Beginner ] — What is a locals block? How is it different from a variable?


- locals = computed values INSIDE the module — like local variables in
  programming.

- variables = INPUTS from outside — provided by the calling module.

- Locals CANNOT be overridden from outside — purely internal to the
  module.

- Variables CAN be overridden by the caller — they are the module
  interface.

|                                                                                     |
|-------------------------------------------------------------------------------------|
| locals {                                                                            |
| common_tags = { Environment=var.environment, ManagedBy="Terraform", Project="CMG" } |
| name_prefix = "cmg-\${var.environment}"                                             |
| is_prod = var.environment == "prod"                                                 |
| inst_type = local.is_prod ? "t3.xlarge" : "t3.medium"                               |
| }                                                                                   |
| \# Every resource: tags = merge(local.common_tags, { Service = "eks" })             |

|                                                                                                                                                                                                                                                                                                                                                               |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                       |
| *Locals are computed values inside a module — cannot be overridden externally. Variables are interface inputs provided by the caller. In CMG I use a common_tags local merged into every resource — one change here updates all 200+ resources on the next apply. Locals also drive environment-conditional sizing: prod gets t3.xlarge, dev gets t3.medium.* |

#### Q18 [ Beginner ] — What is workspace in Terraform? When is it better to use separate backends?


- Workspaces let you manage multiple environments from the same config —
  each with own state.

- Commands: terraform workspace new dev, select prod, list, show,
  delete.

- Workspaces share the SAME S3 bucket — weaker security isolation than
  separate backends.

- Separate backends: separate S3 bucket, DynamoDB table, KMS key per
  environment.

- CMG uses both: workspace for environment naming + separate backend
  configs for isolation.

|                     |                                      |                                                |
|---------------------|--------------------------------------|------------------------------------------------|
| **Aspect**          | **Workspaces**                       | **Separate Backends**                          |
| State storage       | Same S3 bucket, different key prefix | Separate S3 buckets                            |
| Security isolation  | Weaker — same bucket policy          | Stronger — separate bucket policies + KMS keys |
| Setup complexity    | Simple                               | More setup                                     |
| Team access control | Harder to restrict by env            | Easy — IAM role per environment                |

|                                                                                                                                                                                                                                                                                                                                                                  |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                          |
| *Workspaces manage multiple environments from same code with separate state prefixes in one bucket. For strong production isolation I use separate backend configs — separate S3 buckets, DynamoDB tables, and KMS keys per environment. In CMG dev and prod have completely isolated backends so a dev engineer's IAM role cannot touch the prod state bucket.* |

#### Q19 [ Beginner ] — How do you secure the Terraform state file?


- S3 bucket: KMS customer-managed key encryption, server-side encryption
  enabled.

- S3 versioning: enables recovery if state is accidentally deleted or
  corrupted.

- S3 block public access: all public access blocked — state must NEVER
  be public.

- S3 bucket policy: DENY all except the specific Jenkins IAM role for
  that environment.

- DynamoDB: prevents concurrent applies from corrupting state —
  mandatory in teams.

- MFA delete: extra protection against accidental state deletion.

- CloudTrail on S3 bucket: audit every read/write to state file.

- .gitignore: \*.tfstate \*.tfstate.\* — never commit state to Git.

|                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                     |
| *State security requires multiple layers. Encrypt S3 bucket with KMS CMK. Enable versioning for recovery. Block all public access. Restrict via bucket policy to only the Jenkins IAM role. Enable DynamoDB locking. Add CloudTrail for audit. And critically — add \*.tfstate to .gitignore. State contains all your infrastructure secrets in plaintext.* |

#### Q20 [ Beginner ] — What is sensitive = true on a variable?


- Marks a variable as sensitive — hides its value from terminal output
  and CI/CD logs.

- Shows as (sensitive value) in plan/apply output instead of the real
  value.

- IMPORTANT: value IS still stored in the state file in plaintext.

- sensitive = true only hides display — it does NOT prevent state
  storage.

- This is why state bucket encryption with KMS is non-negotiable.

|                                                                                  |
|----------------------------------------------------------------------------------|
| variable "db_password" {                                                         |
| type = string                                                                    |
| sensitive = true                                                                 |
| description = "RDS master password — supply via tfvars, never hardcode default"  |
| }                                                                                |
| \# Plan/apply shows: db_password = (sensitive value)                             |
| \# But state file has: "db_password": "MyRealPassword123!" — encrypt that state! |

|                                                                                                                                                                                                                                                                                                                                                                                     |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                             |
| *sensitive = true hides a variable's value from terminal and CI/CD logs — it shows as (sensitive value). But the value IS stored in plaintext in the state file. This is why KMS encryption on the state S3 bucket is mandatory. In CMG we also use AWS Secrets Manager for passwords and only reference ARNs in Terraform — the actual secret value never even touches Terraform.* |

|                                                |
### SECTION 2 — INTERMEDIATE LEVEL (Q21 – Q50)

#### Q21 [ Intermediate ] — How do you structure Terraform code for Dev, UAT, and Production?


- Pattern: Modules + per-environment tfvars + per-environment backend
  configs.

- One set of reusable modules: vpc, eks, iam, security-groups,
  monitoring.

- Per-env var files: environments/dev.tfvars (small),
  environments/prod.tfvars (large).

- Per-env backend config: backends/dev.tfvars → cmg-state-dev,
  backends/prod.tfvars → cmg-state-prod.

- Jenkins selects both configs based on branch name: dev branch → dev
  configs.

- ISOLATION: separate S3 bucket, DynamoDB table, and KMS key per
  environment.

- ISOLATION: separate IAM role per environment — dev role cannot touch
  prod state.

- SAFETY: prevent_destroy on all prod critical resources. Manual
  approval gate for prod.

|                 |               |               |                   |
|-----------------|---------------|---------------|-------------------|
| **Setting**     | **Dev**       | **UAT**       | **Production**    |
| Node type       | t3.medium     | t3.large      | t3.xlarge         |
| Min nodes       | 1             | 2             | 3                 |
| AZ count        | 2             | 2             | 3                 |
| prevent_destroy | false         | false         | true              |
| Approval gate   | No            | No            | Yes — 4hr timeout |
| State bucket    | cmg-state-dev | cmg-state-uat | cmg-state-prod    |

|                                                                                                                                                                                                                                                                                                                                            |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                    |
| *I use modules plus per-environment tfvars and backend configs. Five shared modules. Jenkins selects the right configs based on branch. Complete isolation: separate S3 buckets, DynamoDB tables, KMS keys, and IAM roles per environment. Production has prevent_destroy on all critical resources and a mandatory manual approval gate.* |

> **Follow-up Questions**
>
> → Why not workspaces alone?
>
> → How do you prevent dev code reaching prod?
>
> → How do you separate state if environments currently share one backend?


#### Q22 [ Intermediate ] — How do you handle Terraform state drift?


- Drift = real AWS infra differs from what Terraform state file believes
  exists.

- Causes: manual console changes, auto-scaling, external automation,
  broken pipelines.

- Danger: next plan may revert an emergency fix or try to create
  duplicate resources.

- Detect: terraform plan -refresh-only — compares real AWS vs state,
  ignores .tf config.

- Exit 0 = clean. Exit 2 = drift found. Use -detailed-exitcode flag in
  scripts.

- RULE: Always check CloudTrail BEFORE accepting drift — could be
  unauthorised change.

- If emergency fix: add change to .tf code, commit to Git, apply to
  bring under control.

- If autoscaling: add lifecycle { ignore_changes =
  \[scaling_config\[0\].desired_size\] }.

- Prevention: nightly Jenkins cron running plan -refresh-only, Slack
  alert on exit 2.

|                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                            |
| *Drift is real infra diverging from state. I detect it with terraform plan -refresh-only — exit code 2 means drift. I always check CloudTrail first to understand what changed and why. Emergency op fixes get added to Terraform code. Auto-scaling changes get lifecycle ignore_changes. In CMG we run nightly drift detection and Slack-alert on any findings.* |

> **Follow-up Questions**
>
> → What is the difference between plan and plan -refresh-only?
>
> → Can you completely prevent drift?
>
> → What does -refresh=false do?


#### Q23 [ Intermediate ] — What happens if someone manually deletes a Terraform-managed resource?


- State still has the resource entry — Terraform believes it exists.

- Next plan: Terraform queries AWS → gets ResourceNotFound → removes
  from in-memory state.

- Plan shows resource as to-be-created (green +) — Terraform wants to
  recreate it.

- Apply recreates it — but DATA is permanently lost (RDS data, S3
  objects NOT recovered).

- If resource should stay deleted: terraform state rm addr → remove from
  .tf code → commit.

- Prevention: prevent_destroy = true on critical resources.

- Prevention: CloudTrail → EventBridge → SNS alert on critical resource
  deletion.

|                          |                                |                                              |
|--------------------------|--------------------------------|----------------------------------------------|
| **Resource deleted**     | **Terraform action**           | **Data loss?**                               |
| EC2 instance             | Recreates from config          | In-memory data + EBS if not separate         |
| RDS instance             | Recreates empty database       | YES — all data gone — restore snapshot first |
| S3 bucket (with objects) | Recreates empty bucket         | YES — objects gone forever                   |
| EKS cluster              | Full cluster recreation ~20min | No — workloads need redeployment             |
| IAM role                 | Recreates role + attachments   | No — safe                                    |

|                                                                                                                                                                                                                                                                                                                                                                                            |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                    |
| *State still shows the resource. Next plan Terraform queries AWS, gets ResourceNotFound, plans recreation. Apply recreates it — but stateful data like RDS is gone forever. In CMG all critical resources have prevent_destroy = true plus CloudTrail alerts for deletion of EKS clusters and RDS instances. For RDS: always restore from snapshot first, then reconcile Terraform state.* |

#### Q24 [ Intermediate ] — How do you rename a Terraform resource without destroying and recreating it?


- Simply renaming in .tf code = Terraform sees old address as delete +
  new address as create.

- For EKS cluster: that means full cluster destruction + recreation =
  major downtime.

- Method 1 — terraform state mv: updates state address, no destroy. All
  Terraform versions.

- Method 2 — moved {} block: declared in .tf code, Terraform 1.1+.
  Git-tracked, PR-reviewable.

- Always run terraform plan AFTER — must show: No changes.
  Infrastructure is up-to-date.

|                                                                               |
|-------------------------------------------------------------------------------|
| \# Method 1: CLI state mv                                                     |
| terraform state mv aws_security_group.old_sg module.sg.aws_security_group.eks |
| terraform plan \# Must show 0 changes                                         |
|                                                                               |
| \# Method 2: moved block (preferred — Git-tracked)                            |
| moved {                                                                       |
| from = aws_security_group.old_sg                                              |
| to = module.sg.aws_security_group.eks                                         |
| }                                                                             |
| \# Remove block after successful apply                                        |

|                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                            |
| *terraform state mv or the moved {} block both transfer state address without destroying the real resource. I prefer moved blocks in production — they go through Git PR review and are visible in plan output before apply. Process: add moved block, rename in code, run plan (must show 0 changes), apply, remove moved block.* |

#### Q25 [ Intermediate ] — Plan shows zero changes but infrastructure was modified outside Terraform. Why?


- Most common: -refresh=false used in pipeline — reads only state file,
  never calls AWS.

- Second: modified attribute is in ignore_changes — intentionally
  invisible to Terraform.

- Third: resource is completely unmanaged — not in state at all.

- Confirm: run terraform plan -refresh-only — forces real AWS API
  comparison.

- Exit 2 = drift confirmed. Also cross-check with CloudTrail for root
  cause.

> **NEVER use -refresh=false in production pipelines**
>
> -refresh=false reads state file only — never calls AWS APIs.
>
> Any drift between state and real AWS is completely invisible.
>
> False sense of security — "No changes" while infrastructure is drifting silently.


|                                                                                                                                                                                                                                                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                              |
| *This happens when -refresh=false is used — Terraform reads state file only, never queries AWS. All drift is invisible. I confirm by running terraform plan -refresh-only which forces AWS API queries — exit code 2 confirms drift. I remove -refresh=false from all pipelines. Also check if ignore_changes is hiding the change.* |

#### Q26 [ Intermediate ] — Three environments share one remote backend. How do you safely separate them?


- Risk: one bad apply can touch all three envs. Lock contention. No
  security isolation.

- Step 1: Announce maintenance window — freeze ALL pipeline runs during
  migration.

- Step 2: Backup current state: terraform state pull \>
  shared-backup-DATE.json

- Step 3: Create separate S3 buckets + DynamoDB tables + KMS keys per
  environment.

- Step 4: For each environment: select workspace → init with
  -migrate-state → verify.

- Step 5: terraform plan must show 0 changes for each environment after
  migration.

- Step 6: Update Jenkins pipelines to use per-environment backend
  configs.

- Step 7: Delete old shared backend ONLY after 48 hours of confirmed
  clean operation.

|                                                                                |
|--------------------------------------------------------------------------------|
| \# Migrate dev environment                                                     |
| terraform workspace select dev                                                 |
| terraform state pull \> dev-backup.json                                        |
| terraform init -backend-config=backends/dev.tfvars -migrate-state -reconfigure |
| terraform state list \# Verify all resources present                           |
| terraform plan \# Must show 0 changes                                          |
| \# Repeat for uat and prod                                                     |

|                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                            |
| *Freeze all applies first. Backup state. Create separate S3 buckets, DynamoDB tables, KMS keys per environment. For each: run terraform init with -migrate-state flag which copies state to the new backend automatically. Verify with terraform plan showing 0 changes. Only decommission old shared backend after 48 hours of stable operation on new backends.* |

#### Q27 [ Intermediate ] — A module uses count. You insert a resource in the middle. What breaks and why?


- count uses array INDEX as resource identity — position 0, 1, 2, 3...

- Inserting at position 0 shifts all existing items: \[0\]→\[1\],
  \[1\]→\[2\], \[2\]→\[3\].

- Terraform sees resources at new indexes as DIFFERENT from resources at
  old indexes.

- Plan shows: destroy old indexes, create new indexes — cascading
  destruction.

- For subnets: destroys networking → EKS nodes lose connectivity →
  production outage.

|                                                                  |
|------------------------------------------------------------------|
| \# BEFORE: 3 subnets                                             |
| \# aws_subnet.private\[0\] = 10.0.1.0/24 (AZ-a) ← EKS nodes here |
| \# aws_subnet.private\[1\] = 10.0.2.0/24 (AZ-b)                  |
| \# aws_subnet.private\[2\] = 10.0.3.0/24 (AZ-c)                  |
|                                                                  |
| \# INSERT 10.0.0.0/24 at position 0:                             |
| \# \[0\] = 10.0.0.0/24 NEW                                       |
| \# \[1\] = 10.0.1.0/24 was \[0\] → DESTROY + RECREATE            |
| \# \[2\] = 10.0.2.0/24 was \[1\] → DESTROY + RECREATE            |
| \# \[3\] = 10.0.3.0/24 was \[2\] → DESTROY + RECREATE            |
| \# Result: 3 subnets destroyed → EKS nodes offline → outage      |

|                                                                                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                          |
| *count uses index position as identity. Inserting at position 0 shifts all higher indexes — Terraform sees them as changed resources and plans destroy+recreate for everything after the insertion point. For subnets this removes EKS node networking causing a production outage. The fix is migrating to for_each with stable string keys using terraform state mv before changing the code.* |

#### Q28 [ Intermediate ] — Someone ran terraform apply -auto-approve during an incident. Recovery sequence.


1.  STOP: do not run any more Terraform commands — assess damage first.

2.  DECLARE Sev-1: notify team lead, management, stakeholders
    immediately.

3.  IDENTIFY: pull Jenkins log — list every resource created, modified,
    destroyed.

4.  FREEZE: disable the Jenkins job to prevent accidental re-runs.

5.  RESTORE: for destroyed resources — restore from S3 state versioning,
    then apply.

6.  RESTORE: for wrongly created resources — terraform state rm + remove
    from .tf + destroy -target.

7.  VERIFY: terraform plan -refresh-only — must show 0 drift after
    recovery.

8.  PERMANENT FIX: remove -auto-approve, add manual approval gate with
    4-hour timeout.

|                                                                                            |
|--------------------------------------------------------------------------------------------|
| \# Restore state from S3 versioning                                                        |
| aws s3api list-object-versions --bucket cmg-state-prod --prefix eks/prod/terraform.tfstate |
| \# Find version before incident timestamp                                                  |
| aws s3api copy-object \\                                                                   |
| --bucket cmg-state-prod \\                                                                 |
| --copy-source "cmg-state-prod/eks/prod/terraform.tfstate?versionId=PREV_ID" \\             |
| --key eks/prod/terraform.tfstate                                                           |

|                                                                                                                                                                                                                                                                                                                                                                                          |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                  |
| *First: stop all Terraform and declare Sev-1. Check Jenkins log for exact changes. Restore state from S3 versioning for destroyed resources. Run terraform apply to recreate infrastructure. Redeploy apps via ArgoCD. Post-incident: permanently remove -auto-approve from all production pipelines and add a manual approval gate. Document in blameless post-mortem within 48 hours.* |

#### Q29 [ Intermediate ] — State shows a resource exists but it was deleted weeks ago. What does this reveal?


- Reveals: no automated drift detection — weeks of invisible
  state/reality mismatch.

- Reveals: pipelines likely using -refresh=false — drift was never
  detected during plan.

- Reveals: no CloudTrail alerting on critical resource deletion.

- Diagnose: terraform state show resource → AWS CLI confirm it is truly
  gone.

- Fix if deleted: terraform state rm → remove from .tf code → commit.

- Fix if should exist: run terraform plan (shows as to-create) → apply
  recreates it.

> **Systemic Fixes to Implement Immediately**
>
> 1. Nightly drift detection: terraform plan -refresh-only + Slack alert on exit 2
>
> 2. Remove -refresh=false from all pipelines
>
> 3. CloudTrail → EventBridge → SNS for DeleteCluster, DeleteDBInstance, TerminateInstances
>
> 4. Monthly state audit: terraform state list vs AWS resource inventory


|                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                       |
| *This reveals weeks without drift detection — a critical process gap. I diagnose with terraform state show and AWS CLI to confirm the resource is truly gone. If deleted: terraform state rm and remove from code. If should exist: apply recreates it. The real fix is implementing nightly drift detection cron, CloudTrail delete alerts, and removing -refresh=false from all pipelines.* |

#### Q30 [ Intermediate ] — How do you import 40 AWS resources into Terraform? Walk through the process.


- Group by dependency order: networking first → security → IAM → compute
  → monitoring.

- Inventory all resource IDs using AWS CLI before starting.

- Write .tf resource blocks for each group BEFORE importing.

- After each group import: terraform plan — fix attribute drift until 0
  changes.

- Use import {} blocks (Terraform 1.5+) — Git-tracked, repeatable,
  PR-reviewable.

- Use Terraformer to auto-generate starter .tf code — clean up before
  production use.

- GOAL: terraform plan shows 0 changes for ALL 40 resources before
  declaring complete.

|                                                                                  |
|----------------------------------------------------------------------------------|
| \# Terraformer — generate starter code                                           |
| terraformer import aws --resources=vpc,subnet,security_group --regions=eu-west-2 |
|                                                                                  |
| \# import blocks in imports.tf (1.5+)                                            |
| import { to=module.vpc.aws_vpc.main; id="vpc-0abc123" }                          |
| import { to=module.vpc.aws_subnet.private\["2a"\]; id="subnet-0aaa" }            |
| import { to=module.eks.aws_eks_cluster.main; id="cmg-eks-prod" }                 |
|                                                                                  |
| terraform apply \# imports all                                                   |
| \# Fix any attribute drift in .tf code                                           |
| terraform plan \# must show 0 changes — migration complete                       |

|                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                     |
| *I group by dependency order and write .tf resource blocks first. Then use import blocks (1.5+) which are Git-tracked. After each group I run plan to find attribute drift and fix .tf code until 0 changes. Terraformer generates starter code to save time but always needs cleanup. Migration is done only when every resource shows 0 changes in plan.* |

#### Q31 [ Intermediate ] — What is IRSA and how do you configure it with Terraform?


- IRSA = IAM Roles for Service Accounts — pod-level AWS IAM identity
  using OIDC.

- Before IRSA: all pods on a node shared the node's IAM role — massively
  over-permissioned.

- With IRSA: payment pod has only payment SQS access. Notification pod
  has only SES.

- Uses OIDC: EKS creates an OIDC endpoint. AWS STS trusts tokens from
  that endpoint.

- Steps: 1) Create OIDC provider. 2) IAM trust policy scoped to one
  SA. 3) Attach policy. 4) Annotate K8s SA.

|                                                                                   |
|-----------------------------------------------------------------------------------|
| \# OIDC Provider                                                                  |
| resource "aws_iam_openid_connect_provider" "eks" {                                |
| client_id_list = \["sts.amazonaws.com"\]                                          |
| thumbprint_list = \[data.tls_certificate.eks.certificates\[0\].sha1_fingerprint\] |
| url = aws_eks_cluster.main.identity\[0\].oidc\[0\].issuer                         |
| }                                                                                 |
|                                                                                   |
| \# Trust policy — scoped to ONE service account in ONE namespace                  |
| condition {                                                                       |
| test = "StringEquals"                                                             |
| variable = "OIDC_ISSUER:sub"                                                      |
| values = \["system:serviceaccount:payment:payment-service-sa"\]                   |
| }                                                                                 |

|                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                   |
| *IRSA gives individual pods their own AWS IAM identity via OIDC. In CMG 15+ microservices each have their own IRSA role. Payment service can only access the payment SQS queue and S3 bucket. The trust policy condition system:serviceaccount:namespace:sa-name ensures only that specific pod can assume the role — true least privilege at pod level.* |

#### Q32 [ Intermediate ] — How do you manage secrets in Terraform?


- NEVER put secrets in .tf files, .tfvars files, or hardcoded variable
  defaults.

- sensitive = true hides value from logs but value IS still in state
  file in plaintext.

- Best: AWS Secrets Manager — reference ARN in Terraform, not the actual
  secret value.

- For RDS: manage_master_user_password = true — RDS creates and rotates
  automatically.

- HashiCorp Vault provider: fetches secrets at apply time via OIDC/IAM
  auth — no static tokens.

- State encryption: S3 KMS encryption protects any secrets that do end
  up in state.

|                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                     |
| *In CMG we never store secrets in .tf files or tfvars. For RDS we use manage_master_user_password = true — RDS handles creation and rotation. For application secrets we reference Secrets Manager ARNs — the actual value never touches Terraform. State bucket uses KMS encryption as the last line of defense for any sensitive values.* |

#### Q33 [ Intermediate ] — How do you handle EKS upgrades with zero downtime in Terraform?


9.  Prerequisite: create_before_destroy = true on all aws_eks_node_group
    resources.

10. Prerequisite: Pod Disruption Budgets configured on all critical
    workloads in Kubernetes.

11. Step 1: Update kubernetes_version variable (e.g. "1.27" → "1.28").

12. Step 2: terraform plan — shows control plane update + node group
    replacement.

13. Step 3: terraform apply — control plane upgrades first (~8 min, no
    workload impact).

14. Step 4: Terraform creates NEW node group (create_before_destroy —
    new nodes join as Ready).

15. Step 5: Kubernetes scheduler migrates pods to new nodes respecting
    PDBs.

16. Step 6: Old node group drained and deleted after all pods migrated.

17. Step 7: Update EKS add-ons: CoreDNS, kube-proxy, vpc-cni to
    compatible versions.

|                                                                                                                                                                                                                                                                                                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                      |
| *Zero-downtime EKS upgrades need create_before_destroy on node groups and PDBs on workloads. Terraform upgrades control plane first (no workload impact), then creates new node group — pods migrate to new nodes respecting PDBs — old nodes drained and deleted. In CMG we did this for 1.25 → 1.26 → 1.27 → 1.28 with zero downtime each time. Always test in dev first.* |

#### Q34 [ Intermediate ] — What is terraform_remote_state and when do you use it?


- Reads output values from another Terraform state file — enables loose
  coupling.

- Use case: networking team manages VPC independently. EKS team reads
  VPC outputs.

- Separate state files = separate blast radius. VPC bug cannot corrupt
  EKS state.

- Each team applies independently — networking change does not trigger
  EKS apply.

|                                                                                              |
|----------------------------------------------------------------------------------------------|
| data "terraform_remote_state" "vpc" {                                                        |
| backend = "s3"                                                                               |
| config = { bucket="cmg-state-prod", key="networking/terraform.tfstate", region="eu-west-2" } |
| }                                                                                            |
| module "eks" {                                                                               |
| vpc_id = data.terraform_remote_state.vpc.outputs.vpc_id                                      |
| private_subnet_ids = data.terraform_remote_state.vpc.outputs.private_subnet_ids              |
| }                                                                                            |

|                                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                          |
| *terraform_remote_state reads outputs from another state file. In CMG networking team manages VPC and outputs vpc_id and subnet IDs. EKS team reads these via remote state — no tight coupling. A VPC change by networking does not require EKS team to run apply. Separate state files give separate blast radius and separate team ownership.* |

#### Q35 [ Intermediate ] — What is .terraform.lock.hcl and why must you commit it to Git?


- Auto-generated by terraform init — records exact provider version and
  cryptographic hash.

- Ensures all team members and all CI/CD agents use identical provider
  binary.

- Without it: different init runs may download different provider
  versions.

- Different versions = inconsistent behaviour = hard-to-debug
  environment differences.

- To upgrade providers: terraform init -upgrade → review lock file diff
  → test → commit.

|                                                                                                                                                                                                                                                                                                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                      |
| *The lock file records the exact provider version and hash downloaded by terraform init. Always commit it to Git. Without it, different developers or CI/CD runs may get different provider patch versions which causes inconsistent and hard-to-debug behaviour. To upgrade: run init -upgrade, review the diff carefully, test in dev, then commit the updated lock file.* |

#### Q36 [ Intermediate ] — How does a provider version upgrade break infrastructure silently?


- Providers change default attribute values between major versions.

- If you do not explicitly set an attribute, your code relies on the
  provider default.

- After upgrading: plan shows ~ (modify) even though you changed nothing
  in .tf code.

- Without careful review, this modification gets applied silently to
  real resources.

- Example: AWS provider 4.x → 5.x changed http_tokens default to
  "required" on EC2.

- Prevention: read full CHANGELOG before upgrading. Review every ~ in
  plan output carefully.

- Fix: explicitly set all security-sensitive attributes — never rely on
  provider defaults.

|                                                                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                            |
| *Provider upgrades can change attribute defaults silently. If you don't explicitly set an attribute in .tf, the provider default applies — and if that default changes in a new version, plan shows a modification you didn't intend. I read the full CHANGELOG before upgrading, run plan in dev and review every ~ carefully, then explicitly set any changed attributes to lock the behaviour.* |

#### Q37 [ Intermediate ] — Two engineers applied simultaneously without locking. What is corrupted and how do you recover?


- Both read state at T=0. Both have the same snapshot.

- Engineer A creates Resource X → writes state with X (serial N+1).

- Engineer B creates Resource Y → writes from T=0 snapshot + Y →
  OVERWRITES A's state.

- Final state has Y but NOT X. X is an orphan — exists in AWS but not in
  state.

- State serial is broken — next plan tries to create X again (duplicate
  resource error).

- Recovery: restore from S3 versioning → import orphaned resources →
  verify 0 changes.

- Prevention: enable DynamoDB locking — 5-minute setup that prevents
  this permanently.

|                                                                                                                                                                                                                                                                                                                                                                                 |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                         |
| *Without locking both engineers read the same state snapshot. The last writer overwrites the first writer's state changes. Resource X is created in AWS but not in state — orphaned. Recovery: restore from S3 versioning to last good state, import orphaned resources, verify clean plan. Prevention: enable DynamoDB locking immediately — it is a one-time 5-minute setup.* |

#### Q38 [ Intermediate ] — How do you make Terraform code reusable across environments and teams?


- Modules with validated inputs and documented outputs — define once,
  use many times.

- Locals for DRY common values — common_tags local in every module,
  merged into all resources.

- Per-environment tfvars — same modules, different sizes for dev vs
  prod.

- Variable validation blocks — catch wrong values at plan time with
  clear error messages.

- Dynamic blocks — generate repeated nested blocks from a map, zero
  copy-paste.

- for_each on module calls — deploy same module for multiple clusters or
  regions.

- Module versioning with Git tags — v3.2.1 pins exact version for
  reproducibility.

|                                                                                                                                                                                                                                                                                                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                      |
| *Reusable Terraform has three layers. Modules with validated inputs and clear outputs. Locals for DRY config — changing the project tag in common_tags updates all 200+ CMG resources. Per-environment tfvars — same modules, dev.tfvars has t3.medium, prod.tfvars has t3.xlarge. In CMG this reduced our code by 60% and eliminated all environment-specific duplication.* |

#### Q39 [ Intermediate ] — for_each fails with unknown value at plan time. Why and how do you fix it?


- for_each must be fully evaluated at PLAN time — Terraform needs exact
  instance count before calling AWS.

- If for_each value comes from a resource not yet created, it is
  "unknown" and plan fails.

- Error: "The for_each value depends on resource attributes that cannot
  be determined until apply."

- Fix A: Use static input variable for the iteration set (cleanest —
  always known at plan).

- Fix B: terraform apply -target to create dependency first, then full
  apply.

- Fix C: Split into two configs — Config 1 creates dependency, Config 2
  reads it via remote_state.

|                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                     |
| *for_each is evaluated at plan time to determine exact resource count. If the iteration set contains "unknown" values from resources not yet created, plan fails. The cleanest fix is using a static input variable for the iteration set. If unavoidable, -target the dependency first then run full apply. For complex cases, split into two Terraform configs communicating via terraform_remote_state.* |

#### Q40 [ Intermediate ] — How do you manage Terraform state in multi-cloud projects?


- NEVER mix AWS and Azure resources in one Terraform config — provider
  error blocks everything.

- Separate Terraform directories per cloud — separate state, IAM, CI/CD
  pipeline.

- State: all can live in S3 with separate key paths (aws/prod,
  azure/prod, gcp/prod).

- Auth: each cloud uses its native method — IAM Role (AWS), OIDC
  (Azure), Workload Identity (GCP).

- Cross-cloud communication: terraform_remote_state data source or
  shared variable files.

|                                                                                                                                                                                                                                                                                                                                                                                 |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                         |
| *For multi-cloud I use separate Terraform configs per cloud — never mixed. All state lives in S3 with separate key paths giving one audit trail. Each cloud authenticates via its native method: IAM Role for AWS, OIDC for Azure and GCP — no long-lived credentials anywhere. Separate CI/CD pipelines per cloud prevent a failed Azure apply from blocking AWS deployments.* |

#### Q41 [ Intermediate ] — What is the moved block and how is it different from terraform state mv?


|                     |                                 |                                      |
|---------------------|---------------------------------|--------------------------------------|
| **Aspect**          | **terraform state mv**          | **moved {} block**                   |
| Terraform version   | All versions                    | 1.1+                                 |
| Audit trail         | Not in Git — shell history only | In .tf code — Git-tracked, in PR     |
| Review before apply | No — executed immediately       | Yes — shows in plan output first     |
| Rollback            | Manually reverse the command    | Revert code in Git                   |
| Risk                | Higher — no plan preview        | Lower — plan shows move before apply |
| Best for            | Quick one-off renames           | Production code refactoring          |

|                                                                                                                                                                                                                                                                                                                                         |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                 |
| *Both rename a resource in state without destroying it. terraform state mv is immediate — not tracked in Git. The moved block is declarative in .tf code — goes through Git PR review, shows in plan before apply, rollback is a Git revert. In production I always prefer moved blocks for the audit trail and safety of plan review.* |

#### Q42 [ Intermediate ] — How do you implement a Jenkins approval gate for production Terraform?


- Use Jenkins input() step with a timeout — pipeline pauses and waits
  for human approval.

- Use when { branch "main" } to apply gate ONLY for production branch.

- Archive plan output as Jenkins artifact so approvers can review it
  before clicking Approve.

- Add submitter restriction — only senior DevOps engineers can approve
  prod applies.

- Add disableConcurrentBuilds() — prevents two engineers applying
  simultaneously.

|                                                        |
|--------------------------------------------------------|
| stage("Approve") {                                     |
| when { branch "main" }                                 |
| steps {                                                |
| timeout(time: 4, unit: "HOURS") {                      |
| input(message: "Review plan.txt. Approve prod apply?", |
| submitter: "senior-devops-group")                      |
| }                                                      |
| }                                                      |
| }                                                      |

|                                                                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                            |
| *Jenkins input() step pauses the pipeline and waits for human approval. I use when { branch "main" } to restrict it to production only. The plan output is archived as a Jenkins artifact so approvers read the exact changes before clicking Approve. Submitter restriction ensures only senior DevOps engineers can approve. 4-hour timeout prevents pipelines hanging forever.* |

#### Q43 [ Intermediate ] — What is Terragrunt and when would you use it?


- Thin wrapper around Terraform adding DRY backend config, dependency
  management, and hooks.

- Main problem solved: backend config duplication across 10+ modules —
  paste the same S3 bucket 10 times.

- Single root terragrunt.hcl — all modules inherit backend config
  automatically.

- dependency blocks declare inter-module relationships for ordered
  applies.

- terragrunt run-all apply — applies all modules in correct dependency
  order.

- When NOT to use: fewer than 10 modules. CMG has 5 modules — pure
  Terraform is cleaner.

|                                                                                                                                                                                                                                                                                                                                                                  |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                          |
| *Terragrunt eliminates backend config duplication when you have 10+ modules. One root terragrunt.hcl defines S3 bucket and DynamoDB table — all modules inherit it. dependency blocks declare inter-module relationships for terragrunt run-all. In CMG we have 5 modules so pure Terraform is cleaner. I would adopt Terragrunt at 10+ modules or 3+ accounts.* |

#### Q44 [ Intermediate ] — How do you detect and respond to provider default value changes?


- Providers change default attribute values between versions — your code
  may rely on old default.

- After upgrade: plan shows ~ (modify) even though you changed nothing
  in .tf code.

- Step 1: Read full CHANGELOG from current to target version — search
  for BREAKING CHANGE.

- Step 2: terraform init -upgrade in dev. Check git diff
  .terraform.lock.hcl.

- Step 3: terraform plan in dev — review EVERY ~ carefully for
  unexpected modifications.

- Step 4: Explicitly set all security-sensitive attributes — never rely
  on provider defaults.

- Step 5: Test 48 hours in dev, commit lock file, deploy to UAT, then
  prod.

|                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                            |
| *Provider default changes cause silent plan modifications. I always read the full CHANGELOG before upgrading, run plan in dev and review every ~ character — any unexpected modification is a default change. I explicitly set all security-sensitive attributes like http_tokens and volume encryption in .tf code to prevent default changes from affecting us.* |

#### Q45 [ Intermediate ] — How do you handle partial backend configuration for multiple environments?


- Problem: Terraform backend {} block does not support variables — you
  cannot use var.env.

- Solution: Partial backend config — leave dynamic values out of .tf
  file.

- Pass remaining values at init time via -backend-config flag pointing
  to a tfvars file.

- Jenkins selects the correct backend config file based on the branch
  name (TF_ENV variable).

|                                                                        |
|------------------------------------------------------------------------|
| \# backend.tf — static values only                                     |
| terraform { backend "s3" { region = "eu-west-2" } }                    |
|                                                                        |
| \# backends/prod.tfvars                                                |
| bucket = "cmg-terraform-state-prod"                                    |
| key = "eks/prod/terraform.tfstate"                                     |
| dynamodb_table = "cmg-terraform-locks-prod"                            |
|                                                                        |
| \# Jenkins pipeline                                                    |
| terraform init -backend-config=backends/\${TF_ENV}.tfvars -reconfigure |

|                                                                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                            |
| *Backend blocks cannot use variables so I use partial backend config. The .tf file only has static values like region. Dynamic values (bucket, key, dynamodb table) come from per-environment tfvars files passed via -backend-config at init time. Jenkins selects the right file based on branch name. The -reconfigure flag is needed when switching environments to reinitialise the backend.* |

#### Q46 [ Intermediate ] — How do you implement tagging strategy with Terraform at scale?


- Define all required tags in a common_tags local — single source of
  truth.

- Use merge(local.common_tags, { resource-specific-tags }) on every
  resource.

- Changing one tag in locals updates all 200+ CMG resources on the next
  apply.

- Add variable validation to enforce tag values — catch wrong
  environment names at plan.

- Use AWS Config rule to alert on missing required tags — compliance
  enforcement.

|                                                                    |
|--------------------------------------------------------------------|
| locals {                                                           |
| common_tags = {                                                    |
| Environment = var.environment                                      |
| Project = "CMG"                                                    |
| ManagedBy = "Terraform"                                            |
| CostCenter = "CMG-UK-GOV"                                          |
| Owner = "devops@cmg.gov.uk"                                        |
| }                                                                  |
| }                                                                  |
| resource "aws_eks_cluster" "main" {                                |
| tags = merge(local.common_tags, { Service = "eks-control-plane" }) |
| }                                                                  |

|                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                     |
| *I define all required tags in a common_tags local and merge it into every resource. One change to common_tags propagates to all 200+ CMG resources. This enables cost allocation by environment, compliance auditing, and clear ownership. I also add AWS Config rules to alert on missing required tags so nothing slips through without proper tagging.* |

#### Q47 [ Intermediate ] — How do you use dynamic blocks in Terraform?


- Dynamic blocks generate repeated nested configuration blocks from a
  collection.

- Replace 8 identical ingress blocks with one dynamic block reading from
  a map.

- Adding a new rule = one line in the map — zero code duplication.

- Also useful for: conditional blocks (for_each = var.x ? \[1\] : \[\]).

|                                                                           |
|---------------------------------------------------------------------------|
| locals {                                                                  |
| ingress_rules = {                                                         |
| "https" = { from=443, to=443, proto="tcp", cidrs=\["10.0.0.0/8"\] }       |
| "kubelet" = { from=10250, to=10250, proto="tcp", cidrs=\["10.0.0.0/8"\] } |
| "dns-tcp" = { from=53, to=53, proto="tcp", cidrs=\["10.0.0.0/8"\] }       |
| }                                                                         |
| }                                                                         |
| resource "aws_security_group" "nodes" {                                   |
| dynamic "ingress" {                                                       |
| for_each = local.ingress_rules                                            |
| content {                                                                 |
| from_port=ingress.value.from; to_port=ingress.value.to                    |
| protocol=ingress.value.proto; cidr_blocks=ingress.value.cidrs             |
| }                                                                         |
| }                                                                         |
| }                                                                         |

|                                                                                                                                                                                                                                                                                                                                                                                                 |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                         |
| *Dynamic blocks generate repeated nested config from a map — eliminating copy-paste. In CMG I use them for security group rules: instead of 8 identical ingress blocks, I have one dynamic block reading from a local map. Adding a new port rule means one line in the map. I also use dynamic blocks for conditional EKS encryption config: for_each = var.enable_encryption ? \[1\] : \[\].* |

#### Q48 [ Intermediate ] — What is cidrsubnet and how do you use it for automatic CIDR allocation?


- cidrsubnet(prefix, newbits, netnum) — calculates subnet CIDRs
  automatically from parent CIDR.

- Eliminates manual CIDR planning — no overlap errors.

- newbits = extra bits to add to prefix length. netnum = subnet number.

|                                                                             |
|-----------------------------------------------------------------------------|
| variable "vpc_cidr" { default = "10.0.0.0/16" }                             |
|                                                                             |
| \# Generate 3 private subnet CIDRs automatically                            |
| locals {                                                                    |
| private_cidrs = \[for i in range(3) : cidrsubnet(var.vpc_cidr, 8, i)\]      |
| \# Result: \["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"\]                  |
|                                                                             |
| public_cidrs = \[for i in range(3) : cidrsubnet(var.vpc_cidr, 8, i + 100)\] |
| \# Result: \["10.0.100.0/24", "10.0.101.0/24", "10.0.102.0/24"\]            |
| }                                                                           |

|                                                                                                                                                                                                                                                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                      |
| *cidrsubnet calculates subnet CIDRs automatically from the VPC CIDR. No manual planning, no overlap errors. I use it with a for expression to generate all subnet CIDRs from one VPC CIDR variable. If the VPC CIDR changes, all subnets recalculate automatically. In CMG this eliminated all manual CIDR planning errors.* |

#### Q49 [ Intermediate ] — How do you implement cost optimisation using Terraform?


- Consistent tags: Environment + CostCenter + Team on every resource —
  AWS Cost Explorer filtering.

- Per-env instance sizing in tfvars: dev gets t3.medium, prod gets
  t3.xlarge.

- Dev environment scheduling: Lambda function (Terraform-managed) scales
  EKS nodes to 0 at night.

- S3 lifecycle rules: transition to Glacier after 90 days, expire after
  365 days.

- Right-sizing alerts: CloudWatch alarm on low CPU utilisation — all
  managed as code.

- CMG result: \$4,500/month saved via right-sizing and dev environment
  scheduling.

|                                                                                                                                                                                                                                                                                                                                                                               |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                       |
| *Cost optimisation starts with consistent tags so spending can be tracked by environment and team. Per-env tfvars ensure dev never accidentally gets prod-sized resources. A Lambda function managed by Terraform scales EKS dev node groups to zero overnight — that alone saves significant cost. S3 lifecycle rules and right-sizing alarms are all defined in Terraform.* |

#### Q50 [ Intermediate ] — What is the for expression in Terraform and when do you use it?


- for expression transforms a collection — like a map/filter in
  programming.

- Can produce a list or a map from any iterable.

- Use for: transforming module outputs, filtering resources, building
  maps from lists.

|                                                                                     |
|-------------------------------------------------------------------------------------|
| \# List → Map (transform subnet objects to AZ→ID map)                               |
| locals {                                                                            |
| subnet_by_az = { for s in var.subnets : s.az =\> s.id }                             |
| \# Result: { "eu-west-2a" = "subnet-abc", "eu-west-2b" = "subnet-def" }             |
|                                                                                     |
| \# Filter — only private subnets                                                    |
| private_ids = \[for s in var.subnets : s.id if s.type == "private"\]                |
|                                                                                     |
| \# Build list of ARNs from role names                                               |
| role_arns = \[for r in var.roles : "arn:aws:iam::\${local.account_id}:role/\${r}"\] |
| }                                                                                   |

|                                                                                                                                                                                                                                                                                                                                                          |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                  |
| *The for expression transforms collections — it is like map/filter in Python. I use it to transform module outputs: turning a list of subnet objects into a map keyed by AZ name. I also use it to filter only private subnets from a mixed list, or to build ARN strings from a list of role names. It is more readable than complex nested functions.* |

|                                            |
### SECTION 3 — ADVANCED LEVEL (Q51 – Q75)

#### Q51 [ Advanced ] — Design a multi-account Terraform architecture for enterprise.


- Separate AWS accounts: management, dev, staging, prod,
  shared-services.

- Jenkins in management account assumes IAM role in target account via
  provider assume_role.

- Separate state per account: separate S3 buckets, DynamoDB tables, KMS
  keys.

- SCP at org level: deny all resource mutations except via Terraform
  pipeline IAM role.

- Private module registry: versioned modules in Git repo, shared across
  all accounts.

|                                                                 |
|-----------------------------------------------------------------|
| provider "aws" {                                                |
| alias = "prod_account"                                          |
| region = "eu-west-2"                                            |
| assume_role {                                                   |
| role_arn = "arn:aws:iam::PROD_ACCOUNT:role/TerraformDeployRole" |
| session_name = "TerraformDeploy-\${var.build_id}"               |
| }                                                               |
| }                                                               |

|                                                                                                                                                                                                                                                                                                                                                                                          |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                  |
| *Enterprise multi-account: separate AWS accounts for dev, staging, prod. Jenkins in management account assumes IAM roles in target accounts via provider assume_role. Separate state buckets per account. SCPs at org level block console changes — only Terraform pipeline IAM role can modify infrastructure. Versioned modules in a private Git registry shared across all accounts.* |

#### Q52 [ Advanced ] — How do you handle Terraform at scale with 1000+ resources?


- Single state with 1000+ resources: plan takes minutes, blast radius is
  huge.

- State decomposition: separate state per component — vpc.tfstate,
  eks.tfstate, iam.tfstate.

- Components communicate via terraform_remote_state data source — loose
  coupling.

- Each team owns their component state: platform team = networking,
  DevOps team = EKS.

- Separate CI/CD pipelines per component: networking change does not
  trigger EKS apply.

- Blast radius: EKS apply cannot corrupt networking state. Independent
  operations.

- Use -parallelism=20 for large initial creates. Default is 10.

|                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                            |
| *At 1000+ resources I decompose state into separate files per component: networking, EKS, IAM, monitoring. Components share data via terraform_remote_state. Each component has its own S3 key, CI/CD pipeline, and team ownership. This reduces plan time from minutes to seconds and limits blast radius — a bad EKS apply cannot corrupt the networking state.* |

#### Q53 [ Advanced ] — Explain policy as code with tfsec, OPA, and Sentinel.


- tfsec: static analysis of .tf files before plan. Finds
  misconfigurations — open SGs, unencrypted EBS.

- OPA + Conftest: scans plan JSON output. Enforces rules plan output
  must comply with.

- Sentinel (Terraform Enterprise): runs after plan, before apply. Blocks
  apply on violation.

- In CMG Jenkins: tfsec --minimum-severity HIGH fails the build on
  high-severity findings.

|                                                                       |
|-----------------------------------------------------------------------|
| \# tfsec in pipeline                                                  |
| tfsec . --minimum-severity HIGH --format json --out tfsec-report.json |
|                                                                       |
| \# OPA + Conftest                                                     |
| terraform show -json plan.out \> plan.json                            |
| conftest test plan.json --policy policy/                              |
|                                                                       |
| \# OPA policy — deny SSH to 0.0.0.0/0                                 |
| deny\[msg\] {                                                         |
| r := input.resource_changes\[\_\]                                     |
| r.type == "aws_security_group_rule"                                   |
| r.change.after.cidr_blocks\[\_\] == "0.0.0.0/0"                       |
| r.change.after.from_port == 22                                        |
| msg := sprintf("SSH open to internet in %s", \[r.address\])           |
| }                                                                     |

|                                                                                                                                                                                                                                                                                                                                                                                          |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                  |
| *Three layers of policy as code. tfsec does static scanning before plan — catches hardcoded secrets, open SGs, unencrypted volumes. OPA with Conftest scans the plan JSON — enforces architecture rules like no 0.0.0.0/0 on port 22. Sentinel (in Terraform Enterprise) runs between plan and apply — violations block the apply. In CMG we use tfsec and OPA in our Jenkins pipeline.* |

#### Q54 [ Advanced ] — How do you implement GitOps for Terraform? Compare Atlantis vs Terraform Cloud vs Jenkins.


|                 |                              |                                  |                                      |
|-----------------|------------------------------|----------------------------------|--------------------------------------|
| **Feature**     | **Jenkins (CMG)**            | **Atlantis**                     | **Terraform Cloud**                  |
| Plan on PR      | Manual trigger               | Auto on every PR comment         | Auto on PR                           |
| Plan visibility | Archived artifact            | Posted as PR comment             | Terraform Cloud UI                   |
| Apply trigger   | Manual approval gate         | atlantis apply PR comment        | UI button or auto merge              |
| State storage   | S3 + DynamoDB (self-managed) | S3 + DynamoDB (self-managed)     | Managed by HashiCorp                 |
| Cost            | EC2 cost only                | Server cost only                 | Free + paid tiers                    |
| Best for        | Existing Jenkins investment  | GitOps-first, developer-friendly | No infra to manage, budget available |

|                                                                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                                   |
| *We use Jenkins for GitOps in CMG — existing investment, EC2 agents have IAM roles, full control. Atlantis would give better developer experience with plan-as-PR-comment. Terraform Cloud removes all operational overhead. The key metric I value is disableConcurrentBuilds() preventing parallel apply race conditions. All three support the GitOps principle of infrastructure changes only through reviewed code.* |

#### Q55 [ Advanced ] — How do you implement zero-downtime EKS cluster version upgrades?


18. Prereq: create_before_destroy = true on all node groups.

19. Prereq: Pod Disruption Budgets on all critical workloads.

20. Prereq: update_config { max_unavailable_percentage = 33 } — at most
    1/3 nodes at once.

21. Prereq: Test in dev, wait 1 week, then UAT, wait 1 week, then prod.

22. Step 1: Update kubernetes_version variable (e.g. "1.27" → "1.28").

23. Step 2: terraform plan — review: control plane update + node group
    replacement.

24. Step 3: terraform apply — control plane upgrades first (~8 min, no
    workload impact).

25. Step 4: New node group created (new AMI) — new nodes join cluster as
    Ready.

26. Step 5: Kubernetes scheduler migrates pods respecting PDBs — no
    service interruption.

27. Step 6: Old node group drained and deleted.

28. Step 7: Update EKS add-ons to versions compatible with new control
    plane version.

|                                                                                                                                                                                                                                                                                                                                                                |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                        |
| *Zero-downtime EKS upgrade requires create_before_destroy and PDBs. Terraform upgrades control plane first (no workload impact), creates new node group, pods migrate respecting PDBs, old group deleted. In CMG we did 1.25→1.26→1.27→1.28 with zero downtime each time. Never skip minor versions — EKS only supports one at a time. Always test dev first.* |

#### Q56 [ Advanced ] — How do you migrate existing resources from CloudFormation to Terraform?


29. Step 1: Audit all CloudFormation stacks — inventory resource IDs.

30. Step 2: Use cf2tf tool to auto-generate starter Terraform HCL.

31. Step 3: Clean up generated code — add modules, validation, proper
    structure.

32. Step 4: Import resources in dependency order (networking → security
    → compute).

33. Step 5: After each group: terraform plan — fix attribute drift.

34. Step 6: When plan shows 0 changes: DISABLE CloudFormation stack (not
    delete — rollback safety).

35. Step 7: Monitor Terraform operation for 48 hours.

36. Step 8: Delete CloudFormation stack only after confident Terraform
    fully owns all resources.

|                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                      |
| *I use cf2tf to generate starter Terraform code from CloudFormation templates, then import resources in dependency order. After each import I run plan to fix attribute drift. When all resources show 0 changes I disable (not delete) the CloudFormation stack as a rollback option. After 48 hours of stable Terraform operation I delete the CFN stack.* |

#### Q57 [ Advanced ] — How do you implement provider version safe upgrade strategy in production?


37. Step 1: Read full CHANGELOG from current to target — search BREAKING
    CHANGE.

38. Step 2: Update version constraint: ~\> 5.0 (allows 5.x patches,
    blocks 6.0).

39. Step 3: terraform init -upgrade in dev. Review git diff
    .terraform.lock.hcl.

40. Step 4: terraform plan in dev — review EVERY ~ for default value
    changes.

41. Step 5: Explicitly set any attributes with changed defaults in .tf
    code.

42. Step 6: Test dev environment for 48 hours minimum.

43. Step 7: Commit updated .terraform.lock.hcl to Git.

44. Step 8: Deploy to UAT with full regression tests.

45. Step 9: Deploy to prod in maintenance window.

|                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                            |
| *Safe provider upgrades: read full CHANGELOG for breaking changes, upgrade in dev, run plan and review every ~ for default value changes, explicitly set changed defaults in .tf code. Commit the updated lock file — this is critical. Test dev 48 hours, then UAT, then prod in maintenance window. Never jump multiple major versions at once.* |

#### Q58 [ Advanced ] — What is CDKTF and when would you use it over standard HCL?


- CDKTF = Cloud Development Kit for Terraform — write Terraform using
  Python, TypeScript, Java, Go.

- Under the hood: CDKTF synthesises your code into standard Terraform
  JSON configuration.

- Same providers, same state, same plan/apply — just different authoring
  experience.

- When to use: team is developer-heavy with no HCL experience. Need
  complex programmatic logic.

- When NOT to use: team is comfortable with HCL. Extra synthesis step
  adds complexity. Debugging is harder.

|                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                               |
| *CDKTF lets you write Terraform infrastructure in Python or TypeScript, which synthesises to standard Terraform JSON. Same providers and state — just different authoring. Use it when your team is developer-heavy and uncomfortable with HCL. I would stick with HCL for operations-focused teams — it is simpler, better documented, and the ecosystem of examples is far larger.* |

#### Q59 [ Advanced ] — How do you handle blue-green deployments with Terraform?


- Maintain two identical environments: blue (current prod) and green
  (new version).

- Shift traffic using Route53 weighted routing or ALB target group
  weights.

- Terraform manages: both environments + Route53/ALB pointing to active
  environment.

- Cutover: update weight variable (blue=0, green=100). Apply. Monitor.
  Rollback = revert weights.

- CMG: used for EKS version upgrades. Blue = current version, Green =
  new version.

|                                                                                                           |
|-----------------------------------------------------------------------------------------------------------|
| \# Traffic weight variable                                                                                |
| variable "blue_weight" { default = 100 }                                                                  |
| variable "green_weight" { default = 0 }                                                                   |
|                                                                                                           |
| \# ALB rule weight                                                                                        |
| resource "aws_lb_listener_rule" "blue" { action { target_group_arn=blue_tg; weight=var.blue_weight } }    |
| resource "aws_lb_listener_rule" "green" { action { target_group_arn=green_tg; weight=var.green_weight } } |
|                                                                                                           |
| \# Cutover: change variables and apply                                                                    |
| \# blue_weight=0, green_weight=100 → instant cutover                                                      |
| \# Rollback: blue_weight=100, green_weight=0 → \< 1 min RTO                                               |

|                                                                                                                                                                                                                                                                                                                                                                             |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                     |
| *Blue-green with Terraform: maintain two environments, shift traffic via ALB weight variables. Cutover is a tfvars change and apply. Rollback is revert the variable change and apply again — sub-1-minute RTO. In CMG we use this for EKS upgrades: Blue runs current version, Green runs new version, we validate Green, shift traffic, monitor, then decommission Blue.* |

#### Q60 [ Advanced ] — How do you implement disaster recovery for Terraform-managed infrastructure?


- State in S3 with cross-region replication — state survives regional
  outage.

- Terraform code in Git — always available for rebuilding.

- Separate DR region Terraform configs — identical to primary with DR
  region variables.

- RTO: Terraform recreates 200+ CMG resources in ~20 minutes
  (automated).

- Regular DR drills: apply to DR region, validate, destroy — test the
  runbook.

- Data DR is separate: RDS Multi-AZ, S3 cross-region replication — AWS
  native handles data.

|                                                                                                                                                                                                                                                                                                                                                                                                        |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                |
| *Infrastructure DR uses Terraform to recreate everything in a DR region. State in S3 with cross-region replication. Terraform code in Git always available. Separate DR region configs — same modules, different region variables. In CMG we can recreate all infrastructure in ~20 minutes. Data DR is separate — RDS Multi-AZ and S3 cross-region replication handle data. We run annual DR drills.* |

#### Q61 [ Advanced ] — How do you use terraform graph to debug dependency issues?


- terraform graph outputs a DOT format representation of all resource
  dependencies.

- Render: terraform graph \| dot -Tpng \> graph.png — visual dependency
  map.

- Useful for: understanding why resources are being created in
  unexpected order.

- Useful for: finding hidden dependencies causing cycle errors.

- Useful for: documenting complex infrastructure for team knowledge
  sharing.

|                                                           |
|-----------------------------------------------------------|
| \# Generate and render dependency graph                   |
| terraform graph \| dot -Tpng -o infra-graph.png           |
|                                                           |
| \# For a specific module only                             |
| terraform graph -type=plan \| dot -Tsvg \> plan-graph.svg |
|                                                           |
| \# Install graphviz first: apt-get install graphviz       |

|                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                                                       |
| *terraform graph generates a DOT format dependency graph. Piped to dot -Tpng it produces a visual map of all resource dependencies. I use it to debug unexpected ordering, find hidden dependencies causing cycle errors, and document complex infrastructure for new team members. In CMG I generated the graph when we had a mysterious cycle error in security group dependencies — the visual immediately showed the circular reference.* |

#### Q62 [ Advanced ] — What is the -parallelism flag and when do you adjust it?


- Terraform creates/destroys resources in parallel to speed up apply.
  Default parallelism = 10.

- Increase for large initial creates: terraform apply -parallelism=20.

- Decrease for AWS API rate limits: terraform apply -parallelism=5.

- Decrease for sensitive prod changes: lower parallelism = more
  observable, serial-like.

- IAM resources often have lower API rate limits — reduce parallelism
  when creating many IAM resources.

|                                                                                                                                                                                                                                                                                                                                                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                 |
| *Terraform parallelises resource operations with a default of 10 concurrent operations. For large initial environment creates with 100+ resources I increase to 20 for speed. For sensitive production changes or when hitting AWS API rate limits I decrease to 5 for more controlled, observable applies. For IAM-heavy configs I keep it at 5 as IAM has lower rate limits than other AWS services.* |

#### Q63 [ Advanced ] — How do you implement replace_triggered_by in production?


- replace_triggered_by forces this resource to be replaced when another
  specified resource changes.

- Use case: EC2 instance must be replaced when launch template AMI
  version changes.

- Without it: EC2 instance keeps running old AMI even after launch
  template update.

|                                                                                     |
|-------------------------------------------------------------------------------------|
| resource "aws_launch_template" "jenkins_agent" {                                    |
| name_prefix = "cmg-jenkins-"                                                        |
| image_id = var.ami_id                                                               |
| }                                                                                   |
|                                                                                     |
| resource "aws_instance" "jenkins_agent" {                                           |
| launch_template { id = aws_launch_template.jenkins_agent.id; version = "\$Latest" } |
|                                                                                     |
| lifecycle {                                                                         |
| replace_triggered_by = \[aws_launch_template.jenkins_agent.id\]                     |
| \# When launch template changes (new AMI), this EC2 is automatically replaced       |
| }                                                                                   |
| }                                                                                   |

|                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                            |
| *replace_triggered_by forces resource replacement when a dependency changes. In CMG I use it on Jenkins agent EC2 instances: when the launch template gets a new AMI (monthly security patching), replace_triggered_by automatically replaces the EC2 instances on the next apply. Without it, instances keep running the old AMI even after the template update.* |

#### Q64 [ Advanced ] — What is terraform plan -destroy and when do you use it?


- terraform plan -destroy generates a plan showing exactly what WOULD be
  destroyed.

- Does NOT destroy anything — purely a preview of the destroy operation.

- Use before terraform destroy to review exactly what will be removed.

- Can be combined with -target: terraform plan -destroy
  -target=module.old_service.

- In CI/CD: useful for dev environment nightly teardown — review before
  scheduled destroy.

|                                                           |
|-----------------------------------------------------------|
| \# Preview destruction without doing it                   |
| terraform plan -destroy -var-file=environments/dev.tfvars |
|                                                           |
| \# Save destroy plan and apply it                         |
| terraform plan -destroy -out=destroy.plan                 |
| terraform apply destroy.plan                              |

|                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                     |
| *terraform plan -destroy previews what would be destroyed without actually doing anything. I use it before any destroy operation to review exactly what will be removed. In CMG we use it in the dev teardown pipeline — the plan is archived as a Jenkins artifact, reviewed, then applied. It also works with -target for selective destruction preview.* |

#### Q65 [ Advanced ] — How do you implement secrets rotation for Terraform-managed resources?


- RDS: use manage_master_user_password = true — RDS Secrets Manager
  integration rotates automatically.

- External rotation: AWS Secrets Manager rotation Lambda rotates secret.
  Terraform uses ARN reference — unaffected.

- For Terraform-created secrets: use aws_secretsmanager_secret_rotation
  resource to configure rotation.

- Key rotation: aws_kms_key has enable_key_rotation = true — annual
  rotation, transparent to Terraform.

- IRSA credentials: auto-rotated by AWS STS — short-lived, no rotation
  needed.

|                                                                                                                                                                                                                                                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                        |
| *For RDS I use manage_master_user_password = true — RDS integrates with Secrets Manager and rotates automatically. For other secrets I configure rotation in Secrets Manager via Terraform using aws_secretsmanager_secret_rotation resource. KMS keys have enable_key_rotation = true for annual rotation. IRSA credentials are short-lived STS tokens — no rotation needed.* |

#### Q66 [ Advanced ] — How do you handle Terraform state in a disaster — state file corrupted or deleted?


46. Step 1: STOP all Terraform operations — do not run any commands.

47. Step 2: Check S3 versioning — list versions: aws s3api
    list-object-versions --bucket cmg-state-prod.

48. Step 3: Identify pre-corruption version by timestamp.

49. Step 4: Restore: aws s3api copy-object with versionId to restore
    previous version.

50. Step 5: terraform plan -refresh-only — identify any drift since
    restored state.

51. Step 6: terraform import for any resources created after the
    restored state snapshot.

52. Step 7: terraform plan — must show 0 changes. Confirm full recovery.

|                                                                                            |
|--------------------------------------------------------------------------------------------|
| \# List versions                                                                           |
| aws s3api list-object-versions --bucket cmg-state-prod --prefix eks/prod/terraform.tfstate |
|                                                                                            |
| \# Restore previous version                                                                |
| aws s3api copy-object \\                                                                   |
| --bucket cmg-state-prod \\                                                                 |
| --copy-source "cmg-state-prod/eks/prod/terraform.tfstate?versionId=GOOD_VERSION" \\        |
| --key eks/prod/terraform.tfstate                                                           |

|                                                                                                                                                                                                                                                                                                                                                                                                        |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                |
| *State disaster recovery relies on S3 versioning. Stop all operations. List S3 versions to find the pre-corruption snapshot. Restore using copy-object with the versionId. Run plan -refresh-only to find resources created after the restored snapshot. Import those resources. Verify clean plan. This is why S3 versioning on the state bucket is mandatory — it is the entire recovery mechanism.* |

#### Q67 [ Advanced ] — How do you test Terraform modules? What is Terratest?


- Testing levels: validate (syntax) → tfsec (security) → plan review →
  Terratest (integration).

- Terratest: Go testing framework — deploys real infra in test AWS
  account, validates, destroys.

- Terratest test: deploy module → check outputs are non-empty → run AWS
  API assertions → destroy.

- Kitchen-Terraform: Ruby-based alternative to Terratest.

- Conftest + OPA: unit-test plan JSON without deploying — fast, cheap.

- CMG approach: tfsec + OPA in pipeline. Terratest runs weekly against
  dev account.

|                                                                                                                                                                                                                                                                                                                                                                                                   |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                           |
| *Terraform testing pyramid: validate for syntax, tfsec for security, Conftest+OPA for plan-level policy, and Terratest for full integration tests. Terratest deploys real infrastructure in a test account, makes AWS API assertions, then destroys. In CMG we run tfsec and OPA in every pipeline build. Terratest runs weekly against the dev account to validate all modules work end-to-end.* |

#### Q68 [ Advanced ] — What is terraform taint and why is it deprecated?


- terraform taint marked a resource for destruction and recreation on
  next apply.

- Deprecated in Terraform 1.x because it modified state directly without
  a plan review.

- Replacement: terraform plan -replace=resource.address or terraform
  apply -replace=.

- -replace shows you the replacement plan FIRST — you review before any
  action.

- This follows the plan → review → apply safety pattern.

|                                                             |
|-------------------------------------------------------------|
| \# Deprecated (still works but avoid):                      |
| terraform taint module.eks.aws_eks_node_group.main          |
|                                                             |
| \# Correct (1.x+): shows plan first                         |
| terraform plan -replace=module.eks.aws_eks_node_group.main  |
| terraform apply -replace=module.eks.aws_eks_node_group.main |

|                                                                                                                                                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                           |
| *terraform taint directly modified state to mark a resource for replacement — no plan preview, immediate state change. It was deprecated in 1.x because it bypassed the plan-review-apply safety pattern. The replacement is -replace flag which shows exactly what will be replaced in plan output before any action. In CMG we only use -replace, never taint.* |

#### Q69 [ Advanced ] — How do you handle cross-account IAM role assumption in Terraform?


- Use provider alias with assume_role — the provider assumes a role in
  the target account.

- Source account (Jenkins) has permission to sts:AssumeRole on the
  target account role.

- Target account role has a trust policy allowing the source account to
  assume it.

- Can use multiple aliased providers — one per target account.

- CMG: Jenkins in management account, assumes TerraformDeployRole in
  prod account.

|                                                                 |
|-----------------------------------------------------------------|
| provider "aws" {                                                |
| alias = "prod"                                                  |
| region = "eu-west-2"                                            |
| assume_role {                                                   |
| role_arn = "arn:aws:iam::PROD_ACCOUNT:role/TerraformDeployRole" |
| session_name = "TerraformDeploy"                                |
| external_id = var.external_id \# Extra security                 |
| }                                                               |
| }                                                               |
|                                                                 |
| \# Use aliased provider in resource                             |
| resource "aws_eks_cluster" "prod" {                             |
| provider = aws.prod                                             |
| name = "cmg-eks-prod"                                           |
| }                                                               |

|                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                     |
| *Cross-account Terraform uses provider aliases with assume_role. The Jenkins IAM role has sts:AssumeRole permission on the TerraformDeployRole in the target account. That role has a trust policy allowing the Jenkins source account role. In CMG Jenkins runs in a management account and assumes separate deploy roles in dev, UAT, and prod accounts — clean account-level isolation.* |

#### Q70 [ Advanced ] — What is the terraform console command and when do you use it?


- terraform console opens an interactive REPL for evaluating Terraform
  expressions.

- Useful for: testing functions (cidrsubnet, merge, formatlist) before
  using in code.

- Useful for: querying current state values interactively.

- Useful for: debugging complex for expressions or conditionals.

|                                     |
|-------------------------------------|
| \# Start console                    |
| terraform console                   |
|                                     |
| \# Test cidrsubnet calculation      |
| \> cidrsubnet("10.0.0.0/16", 8, 1)  |
| \# Result: "10.0.1.0/24"            |
|                                     |
| \# Test merge function              |
| \> merge({a="x"}, {b="y"})          |
| \# Result: { "a" = "x", "b" = "y" } |
|                                     |
| \# Query state value                |
| \> module.vpc.vpc_id                |
| \# Result: "vpc-0abc1234"           |

|                                                                                                                                                                                                                                                                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                             |
| *terraform console is an interactive REPL for testing expressions without running apply. I use it to validate cidrsubnet calculations before adding them to code, test complex for expressions, and query current state values. It is the fastest way to debug a function or expression — much faster than trial and error with plan/apply cycles.* |

#### Q71 [ Advanced ] — How do you implement network security controls using Terraform at enterprise scale?


- All security groups defined in Terraform — audit trail, peer review,
  no manual changes.

- aws_security_group_rule for inter-SG relationships — breaks circular
  dependencies.

- aws_default_security_group with NO ingress/egress — strips all default
  rules.

- VPC Flow Logs: aws_flow_log resource — every VPC gets flow logs via
  module.

- AWS WAF: aws_wafv2_web_acl managed by Terraform — rate limiting, IP
  blocks, geo restrictions.

- AWS Network Firewall: aws_networkfirewall_firewall for deep packet
  inspection.

- SCPs blocking console SG changes: only Terraform pipeline IAM role can
  modify SGs.

|                                                                                                                                                                                                                                                                                                                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                             |
| *At enterprise scale all security groups, NACLs, WAF rules, and VPC Flow Logs are managed by Terraform. The aws_default_security_group resource with no ingress/egress blocks strips all default rules. SG-to-SG references instead of CIDRs for internal traffic. SCPs at org level prevent any console changes to SGs in prod. Every SG change goes through a PR with mandatory security review.* |

#### Q72 [ Advanced ] — How do you handle Terraform configuration for EKS add-ons?


- aws_eks_addon resource manages CoreDNS, kube-proxy, vpc-cni, and EBS
  CSI driver.

- resolve_conflicts = "OVERWRITE" — allows Terraform to update add-on
  config.

- vpc-cni needs IRSA role for IP address management API calls.

- Pin add-on versions to avoid unexpected updates. Update as part of EKS
  version upgrade.

|                                                                     |
|---------------------------------------------------------------------|
| resource "aws_eks_addon" "coredns" {                                |
| cluster_name = aws_eks_cluster.main.name                            |
| addon_name = "coredns"                                              |
| addon_version = "v1.10.1-eksbuild.6"                                |
| resolve_conflicts = "OVERWRITE"                                     |
| }                                                                   |
|                                                                     |
| resource "aws_eks_addon" "vpc_cni" {                                |
| cluster_name = aws_eks_cluster.main.name                            |
| addon_name = "vpc-cni"                                              |
| service_account_role_arn = aws_iam_role.vpc_cni.arn \# IRSA for CNI |
| }                                                                   |

|                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                            |
| *EKS add-ons are managed with aws_eks_addon resource. I pin add-on versions — never let them auto-update. The vpc-cni add-on needs an IRSA role since it makes EC2 API calls for IP address management. I update add-on versions as part of EKS version upgrade process — always check compatible versions in AWS documentation before upgrading.* |

#### Q73 [ Advanced ] — What is the difference between terraform plan -refresh=false and -refresh-only?


|                     |                                                              |                    |                                       |
|---------------------|--------------------------------------------------------------|--------------------|---------------------------------------|
| **Flag**            | **What It Does**                                             | **AWS API Calls?** | **Use Case**                          |
| -refresh=false      | Reads state file only — skips AWS API calls completely       | No                 | NEVER in prod — hides all drift       |
| -refresh-only       | Compares real AWS vs state — shows drift without config diff | Yes                | Drift detection, nightly cron         |
| Default (no flag)   | Refreshes state from AWS + computes config diff              | Yes                | Normal plan/apply cycle               |
| apply -refresh-only | Updates state to match real AWS — accepts drift              | Yes                | Accepting legitimate drift into state |

|                                                                                                                                                                                                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                           |
| *-refresh=false reads state file only — completely hides drift, never call AWS. This is dangerous in production and should be removed from all pipelines. -refresh-only is the opposite — it ONLY compares real AWS vs state, ignoring .tf config changes. Exit code 2 means drift found. Default plan does both: refresh from AWS then diff against config. Use -refresh-only for nightly drift detection cron.* |

#### Q74 [ Advanced ] — How do you implement cost allocation and chargeback using Terraform tags?


- Mandatory tags on every resource: Environment, CostCenter, Team,
  Service, Project.

- Use a locals common_tags map merged into every resource — no resource
  escapes tagging.

- Add variable validation: CostCenter must match predefined list —
  catches typos.

- AWS Cost Explorer: filter by tag to see spending per
  environment/team/service.

- AWS Budgets (Terraform-managed): alert when team/project exceeds
  budget.

- Enforce with AWS Config rule: required-tags — marks non-compliant
  resources.

|                                                                      |
|----------------------------------------------------------------------|
| locals {                                                             |
| common_tags = {                                                      |
| Environment = var.environment                                        |
| CostCenter = "CMG-UK-GOV-2024"                                       |
| Team = "Platform"                                                    |
| Service = var.service_name                                           |
| ManagedBy = "Terraform"                                              |
| }                                                                    |
| }                                                                    |
| \# Every resource: tags = merge(local.common_tags, { Name = "..." }) |

|                                                                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                            |
| *Cost allocation uses consistent tags on every resource. I define all required tags in a common_tags local and merge into every resource — nothing escapes. AWS Cost Explorer filters by CostCenter tag to show spending per team. AWS Budgets resources (also Terraform-managed) alert when spend exceeds threshold. AWS Config required-tags rule marks any untagged resource as non-compliant.* |

#### Q75 [ Advanced ] — How do you handle large-scale infrastructure refactoring in Terraform?


- Plan: map all resources that need to move — old address → new address.

- Use moved blocks (1.1+) for all moves — Git-tracked, PR-reviewable,
  batch moveable.

- Execute in small batches — never move all 200 resources in one PR.

- After each batch: terraform plan must show 0 changes.

- Feature flag: use a variable to enable new module structure while
  keeping old as backup.

- If using state mv CLI: document every command in a script that is
  committed to Git.

|                                                                                                                                                                                                                                                                                                                                                                                        |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                |
| *Large refactors use moved blocks — I create a moves.tf file with all the address changes. PR review shows exactly what moves. Plan must show 0 changes after each batch of moves. I work in small batches: 10-20 resources per PR. This reduces risk and makes debugging easier if something goes wrong. After the full refactor the moves.tf file is deleted in a final cleanup PR.* |

|                                            |
### SECTION 4 — SCENARIO-BASED (Q76 – Q90)

#### Q76 [ Scenario ] — Production EKS cluster is down. Terraform state is locked and nothing can run.


53. STEP 1: Confirm NO active apply — check Jenkins all-builds view for
    any running pipelines.

54. STEP 2: Get lock details from DynamoDB:

- aws dynamodb get-item --table-name cmg-terraform-locks --key
  '{"LockID":{"S":"cmg-state-prod/eks/prod/terraform.tfstate"}}'

55. STEP 3: Check lock "Created" timestamp — if \> 30 minutes old and no
    active Jenkins build, it is stuck.

56. STEP 4: Get Lock ID from the error message or DynamoDB item
    "Info.ID" field.

57. STEP 5: terraform force-unlock LOCK_ID — type "yes" to confirm.

58. STEP 6: terraform plan -refresh-only to verify state integrity after
    unlock.

59. STEP 7: Post-incident: add CloudWatch alarm alerting when lock age
    \> 30 min.

|                                                                                                                                                                                                                                                                                                                                                                                                          |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                  |
| *First confirm no active apply by checking Jenkins. Look at DynamoDB lock timestamp — 30+ minutes with no active Jenkins build means stuck. Run terraform force-unlock with the Lock ID from the error message. After unlock, run plan -refresh-only to verify state integrity. Post-incident: add a CloudWatch alarm monitoring lock record age so we catch stuck locks before they block deployments.* |

#### Q77 [ Scenario ] — Junior engineer ran terraform destroy on production. Complete incident response.


60. T+0: REVOKE junior engineer AWS access immediately — stop further
    damage.

61. T+1: Declare Sev-1 — notify CTO, team lead, all stakeholders. Open
    war room.

62. T+2: Check S3 state versioning — restore state from before destroy
    command.

63. T+5: terraform plan — shows all destroyed resources as
    to-be-created.

64. T+8: terraform apply — recreates all infrastructure (~20 min for
    CMG).

65. T+28: Redeploy microservices via ArgoCD/Helm (~10 min).

66. T+38: Full service restoration. Total downtime ~38 minutes.

67. POST-INCIDENT: Add prevent_destroy to ALL prod resources. Remove
    destroy from junior IAM policy.

68. POST-INCIDENT: Add SCP blocking DeleteCluster, DeleteDBInstance at
    org level.

69. POST-INCIDENT: Require MFA for any destructive terraform operations.

|                                                                                                                                                                                                                                                                                                                                                                                                                     |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                             |
| *Revoke access immediately to stop further damage. Declare Sev-1. Restore state from S3 versioning. terraform plan shows everything as to-create. Apply recreates infrastructure in ~20 minutes. Redeploy apps via ArgoCD. Total recovery ~38 minutes. Post-incident: add prevent_destroy to all prod resources, remove destroy permissions from junior roles, add SCP blocking critical delete APIs at org level.* |

#### Q78 [ Scenario ] — Security team made emergency console change. Next Terraform plan wants to revert it.


- DO NOT apply the plan — it will revert the emergency fix and cause
  another outage.

- Check CloudTrail: confirm who made the change, when, and what exactly
  changed.

- Option A (preferred): Add change to .tf code → commit to Git → PR →
  apply.

- Option B (short-term): Add ignore_changes for that attribute with
  explanatory comment.

- Work with security team: establish fast-track PR process for emergency
  changes.

- Long-term: All console-blocked via SCP. Emergency changes via
  fast-track PR with \< 30min approval.

|                                                                                                                                                                                                                                                                                                                                                                                                       |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                               |
| *Do not apply — it reverts the emergency fix causing another outage. Confirm with CloudTrail. Add the emergency change to Terraform code, commit, raise PR. Apply to bring it under Terraform management. Work with the security team to establish a fast-track emergency PR process so all future emergency changes go through code review rather than console — faster approval, full audit trail.* |

#### Q79 [ Scenario ] — Payment microservice needs AWS access. Design the Terraform IRSA config.


- Create OIDC provider for EKS cluster (one per cluster, shared across
  services).

- Create least-privilege IAM policy: SQS receive/delete for payment
  queue only.

- Create IAM role with trust policy scoped to payment service account in
  payment namespace.

- Attach policy to role. Output role ARN for Helm chart annotation.

|                                                                                      |
|--------------------------------------------------------------------------------------|
| \# Trust policy — ONE service account, ONE namespace                                 |
| condition {                                                                          |
| test = "StringEquals"                                                                |
| variable = "\${oidc_issuer}:sub"                                                     |
| values = \["system:serviceaccount:payment:payment-service-sa"\]                      |
| }                                                                                    |
|                                                                                      |
| \# Least-privilege policy                                                            |
| Statement = \[                                                                       |
| { Action=\["sqs:ReceiveMessage","sqs:DeleteMessage"\], Resource=payment_queue_arn }, |
| { Action="secretsmanager:GetSecretValue", Resource="cmg/payment/\*" }                |
| \]                                                                                   |

|                                                                                                                                                                                                                                                                                                                                                                                                 |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                         |
| *I create an OIDC provider for the cluster, an IAM role with trust policy scoped to only the payment service account in the payment namespace, and a least-privilege policy allowing SQS receive/delete for the payment queue only. The role ARN is an output from Terraform, consumed by the Helm chart to annotate the Kubernetes ServiceAccount. Only the payment pod can assume this role.* |

#### Q80 [ Scenario ] — Three environments accidentally share one remote backend. Safe separation procedure.


70. STEP 1: Announce maintenance window — freeze ALL pipeline runs.

71. STEP 2: Backup current shared state: terraform state pull \>
    shared-backup-YYYYMMDD.json

72. STEP 3: Create new infrastructure — separate S3 buckets, DynamoDB
    tables, KMS keys per env.

73. STEP 4: For dev: terraform workspace select dev → init
    -backend-config=backends/dev.tfvars -migrate-state

74. STEP 5: terraform state list — verify all dev resources migrated.

75. STEP 6: terraform plan -var-file=environments/dev.tfvars — must show
    0 changes.

76. STEP 7: Repeat steps 4-6 for UAT and production.

77. STEP 8: Update Jenkins pipelines to use per-environment backend
    configs.

78. STEP 9: Delete old shared backend ONLY after 48 hours stable
    operation on new backends.

|                                                                                                                                                                                                                                                                                                                                                                      |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                              |
| *Freeze all applies. Backup shared state. Create separate S3 buckets, DynamoDB tables, KMS keys per environment. For each environment: select workspace, run init with -migrate-state which copies state automatically to the new backend, verify with plan showing 0 changes. After all three are migrated and stable for 48 hours, delete the old shared backend.* |

#### Q81 [ Scenario ] — Terraform apply is failing halfway through. Some resources created, some not. What do you do?


- DO NOT panic. Terraform is designed to handle partial apply
  gracefully.

- State file tracks exactly what was created so far.

- Run terraform plan — shows current state vs desired state. Review
  carefully.

- Check error message — most common causes: IAM permission denied, quota
  exceeded, API rate limit.

- Fix the root cause (request quota increase, fix IAM policy).

- Re-run terraform apply — Terraform skips already-created resources and
  continues from failure point.

- Idempotency: safe to re-run. Terraform will not duplicate successfully
  created resources.

|                                                                                                                                                                                                                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                           |
| *Terraform handles partial apply gracefully — state tracks what was created. Run plan to see current state vs desired. Check the error message to find root cause (usually IAM permissions, quota, or API rate limits). Fix the root cause then re-run apply. Terraform skips already-created resources and continues from the failure point. It is idempotent — safe to re-run.* |

#### Q82 [ Scenario ] — You need to add 3 new IAM roles to the EKS cluster. How do you do it without affecting existing roles?


- If existing roles use for_each with a map — just add three new entries
  to the map.

- for_each adds ONLY the new keys — existing roles are completely
  untouched.

- Plan shows only 3 additions (green +) and zero modifications to
  existing.

- If existing roles use count — DANGER: adding in the middle cascades.
  Migrate to for_each first.

|                                                     |
|-----------------------------------------------------|
| variable "service_iam_roles" {                      |
| default = {                                         |
| "payment" = { ... } \# existing                     |
| "notification" = { ... } \# existing                |
| "case-mgmt" = { ... } \# existing                   |
| "document" = { ... } \# NEW — just add here         |
| "reporting" = { ... } \# NEW                        |
| "audit" = { ... } \# NEW                            |
| }                                                   |
| }                                                   |
| \# Plan shows: 3 to add, 0 to change, 0 to destroy. |

|                                                                                                                                                                                                                                                                                                                                                                               |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                       |
| *If roles use for_each with a map, I just add the three new entries to the map. for_each adds only new keys — existing roles are completely untouched. Plan shows 3 additions, 0 changes to existing. If they used count, I would migrate to for_each first using terraform state mv to avoid cascading issues. In CMG all IAM roles use for_each precisely for this reason.* |

#### Q83 [ Scenario ] — A Terraform plan shows 50 resources will be destroyed unexpectedly. What do you do?


- STOP — never apply without understanding why 50 resources are being
  destroyed.

- Read the plan output carefully — which resources and why? Look for the
  root cause.

- Common causes: count to for_each change without state mv, module
  rename without moved block.

- Common cause: removed depends_on changed creation order unexpectedly.

- Common cause: for_each map key change — old keys being destroyed, new
  keys being created.

- Fix based on root cause: state mv, moved blocks, or reverting the
  change.

- Always verify: terraform plan must show 0 changes after fix.

|                                                                                                                                                                                                                                                                                                                                                                                         |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                 |
| *Never apply a plan with unexpected destructions. Read every - in the plan output carefully. Most common cause: map keys changed in for_each — old key being destroyed, new key being created. Or a resource was renamed without state mv. I identify the root cause, apply the appropriate fix (state mv, moved block, or revert), and verify plan shows 0 changes before proceeding.* |

#### Q84 [ Scenario ] — How do you roll back a failed Terraform apply in production?


- Terraform does NOT have built-in rollback — it is forward-only by
  design.

- Option 1: Fix the issue in code and re-apply to reach desired state.

- Option 2: Restore state from S3 versioning (pre-apply version) → apply
  to revert.

- Option 3: If specific resource was wrongly modified: update .tf to
  previous config → apply.

- For destroyed resources: restore state from S3 versioning → apply
  recreates.

- Prevention: always use plan -out and review before apply.

|                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                   |
| *Terraform has no native rollback — it is forward-only. For a failed apply I either fix the issue in .tf code and re-apply, or restore the pre-apply state from S3 versioning and apply to revert. S3 versioning is the rollback mechanism — it is why it is mandatory. After restoring state I run plan -refresh-only to verify consistency before any further applies.* |

#### Q85 [ Scenario ] — New region needed for DR. How do you extend existing Terraform to cover it?


- Add provider alias for the new region.

- Call existing modules with provider = aws.dr_region and DR-specific
  variables.

- New backend key for DR state: eks/dr-eu-west-1/terraform.tfstate.

- If modules hardcode AZ names: use data "aws_availability_zones" to
  fetch dynamically.

- DR region can have reduced capacity: dr.tfvars with fewer nodes,
  smaller instances.

|                                                                        |
|------------------------------------------------------------------------|
| provider "aws" { alias="dr"; region="eu-west-1" }                      |
|                                                                        |
| module "vpc_dr" {                                                      |
| source = "./modules/vpc"                                               |
| providers = { aws = aws.dr }                                           |
| cidr_block = "10.1.0.0/16" \# different CIDR — no overlap with primary |
| environment = "\${var.environment}-dr"                                 |
| }                                                                      |

|                                                                                                                                                                                                                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                           |
| *I add a provider alias for the DR region and call existing modules with providers = { aws = aws.dr }. Use a different VPC CIDR to avoid overlap with primary region. A separate dr.tfvars defines reduced capacity — smaller nodes, fewer of them. New backend key for DR state. Data source for AZs fetches the DR region's AZ names dynamically — modules work in any region.* |

|                                         |
### SECTION 5 — RAPID FIRE (Q91 – Q120)

**One-line answers. Master these for whiteboard and rapid-fire interview
rounds.**

|        |                                     |                                                                          |
|--------|-------------------------------------|--------------------------------------------------------------------------|
| **\#** | **Question**                        | **One-Line Answer**                                                      |
| 91     | What does terraform init download?  | Provider plugins, modules — sets up backend connection                   |
| 92     | What is state serial number?        | Increments every state write — out-of-order = corruption                 |
| 93     | What does -refresh=false do?        | Reads state file only — never queries AWS — hides all drift              |
| 94     | What is lineage in state file?      | Unique UUID for this state history — never changes                       |
| 95     | terraform plan exit code 2?         | -detailed-exitcode only: changes are present                             |
| 96     | terraform state rm vs destroy?      | state rm = removes from tracking only. destroy = deletes from AWS.       |
| 97     | What is .terraform.lock.hcl?        | Exact provider version lock — always commit to Git                       |
| 98     | What does -migrate-state do?        | Copies existing state to new backend during reconfiguration              |
| 99     | What is moved {} block?             | Declarative rename in .tf — no destroy, Git-tracked, Terraform 1.1+      |
| 100    | Is terraform taint still used?      | Deprecated — use terraform apply -replace=resource instead               |
| 101    | What does for_each = {} create?     | Zero resources — empty map — conditional resource pattern                |
| 102    | count = var.x ? 1 : 0 means?        | Create resource if true, skip if false                                   |
| 103    | What is sensitive = true?           | Hides value from logs — value still stored in state — encrypt state!     |
| 104    | Why depends_on for EKS?             | IAM eventual consistency — policy takes seconds to propagate             |
| 105    | What does terraform graph output?   | DOT format dependency graph — pipe to dot -Tpng \> graph.png             |
| 106    | What does prevent_destroy do?       | Terraform errors if plan would destroy this resource                     |
| 107    | What is create_before_destroy?      | New resource created before old deleted — zero downtime replacement      |
| 108    | What is ignore_changes used for?    | Cluster Autoscaler owns desired_size — Terraform must not reset it       |
| 109    | What is replace_triggered_by?       | Force resource replacement when another specified resource changes       |
| 110    | What is partial backend config?     | Shell in .tf, dynamic values via -backend-config at init time            |
| 111    | What is terraform workspace show?   | Prints current active workspace name                                     |
| 112    | What is the -target flag?           | Plan/apply only specific resource — always follow with full apply        |
| 113    | Why use -out in terraform plan?     | Saved plan = exactly what gets applied — prevents plan-to-apply drift    |
| 114    | VPC ID attribute in Terraform?      | .id not .vpc_id — every AWS resource exposes .id                         |
| 115    | EC2 SG argument in VPC?             | vpc_security_group_ids — not security_groups (EC2-Classic, retired 2022) |
| 116    | NAT Gateway route argument?         | nat_gateway_id — not gateway_id (that is for IGW/VPN)                    |
| 117    | Key pair attribute for EC2?         | key_name = aws_key_pair.demo.key_name — NOT .id                          |
| 118    | Does aws_instance have az argument? | No — AZ is determined by subnet_id                                       |
| 119    | Get first value from map output?    | values(var.my_map)\[0\]                                                  |
| 120    | What is Terraformer?                | Auto-generates starter Terraform HCL from existing AWS resources         |

|                                                                  |
### SECTION 6 — MY MISTAKES AS INTERVIEW QUESTIONS (Q121 – Q136)

**Real mistakes I made — interviewers often ask exactly these scenarios.
Know them cold.**

#### Q121 [ Mistake-Based ] — What is the most common HCL syntax mistake beginners make?


- Quoting a reference instead of using it directly — causes 30% of
  beginner errors.

- "var.region" in HCL is the LITERAL STRING "var.region" — not the
  variable value.

- var.region (no quotes) is the actual value of the variable.

|                                                                                   |
|-----------------------------------------------------------------------------------|
| WRONG: provider "aws" { region = "var.region" } \# literal string                 |
| WRONG: vpc_security_group_ids = \["aws_security_group.app.id"\] \# literal string |
|                                                                                   |
| CORRECT: provider "aws" { region = var.region }                                   |
| CORRECT: vpc_security_group_ids = \[aws_security_group.app.id\]                   |

|                                                                                                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                           |
| *The most common mistake is quoting a reference — "var.region" is the literal string "var.region", not the variable value. In HCL: quotes = string literal, no quotes = expression/reference. This causes 30% of beginner errors. I made this mistake on provider region, security group IDs, and interpolation.* |

#### Q122 [ Mistake-Based ] — How do you fix a circular dependency between two security groups?


- ALB SG references App SG AND App SG references ALB SG = Cycle error.

- Terraform cannot create either SG first because both depend on the
  other.

- Fix: Use aws_security_group_rule resources instead of inline
  ingress/egress blocks.

- aws_security_group_rule references SG IDs AFTER both SGs are created —
  no cycle.

|                                                                                                                                                                                                                                                                                                                                                                       |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                               |
| *Circular SG dependency: ALB SG and App SG reference each other in inline blocks causing a cycle. Fix: replace inline ingress/egress with aws_security_group_rule resources. Each rule is a separate resource that references SG IDs after both SGs exist — cycle broken. Also use source_security_group_id instead of cidr_blocks for internal SG-to-SG references.* |

#### Q123 [ Mistake-Based ] — Why did all three AZs lose internet egress when one NAT Gateway failed?


- Because all 3 private subnets shared ONE route table pointing to
  NAT-GW-a.

- When AZ-a failed, that route table's target (NAT-GW-a) was
  unavailable.

- All three private subnets used that one route table — all three lost
  egress simultaneously.

- Having 3 NAT Gateways without 3 separate route tables provides ZERO
  HA.

- Fix: Each AZ private subnet gets its OWN route table pointing to its
  OWN NAT Gateway.

|                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                     |
| *This happened because three private subnets shared one route table pointing at NAT-GW-a. When AZ-a failed, all three subnets lost egress — one failure took down everything. Three NAT Gateways without three separate route tables gives zero HA. Fix: each AZ private subnet gets its own route table pointing to the NAT Gateway in that same AZ. AZ failure now only affects that AZ.* |

#### Q124 [ Mistake-Based ] — ALB logs not appearing in S3. What is the most common cause?


- Missing S3 bucket policy — the ELB service account cannot write to the
  bucket.

- ALB silently fails to write logs when the bucket policy is missing or
  incorrect.

- Must grant PutObject permission to the ELB service account ARN for the
  specific bucket.

- Use data "aws_elb_service_account" to get the correct account ARN —
  varies by region.

|                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                     |
| *The most common cause is a missing S3 bucket policy. ALB needs PutObject permission granted to the ELB service account. I use the aws_elb_service_account data source to get the correct ARN for the region and create a bucket policy granting it PutObject on the log bucket. Without this, ALB silently fails to write logs — no error, just empty S3.* |

#### Q125 [ Mistake-Based ] — Why should you never generate a private key with the tls_private_key resource?


- tls_private_key stores the private key in Terraform state file in
  plaintext.

- Anyone with S3 state access can read the private key and SSH to all
  your servers.

- State file is accessible to all Jenkins agents — broad access to a
  private key is dangerous.

- Correct: generate key pair with ssh-keygen locally. Only put PUBLIC
  key in Terraform.

- Reference: key_name = aws_key_pair.demo.key_name (NOT .id).

|                                                                                                                                                                                                                                                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                            |
| *tls_private_key puts the private key in the state file in plaintext. Anyone who can run terraform state pull (all Jenkins agents) can read it and SSH to every server. The correct approach: generate with ssh-keygen locally, put only the public key in Terraform via the public_key variable, use aws_key_pair resource. Private key never touches Terraform.* |

#### Q126 [ Mistake-Based ] — count vs for_each — explain the cascade destruction problem with a real example.


- I had 3 subnets using count. Inserted a new CIDR at position 0 in the
  list.

- count\[0\] = new subnet. count\[1\] = was old \[0\]. count\[2\] = was
  old \[1\]. count\[3\] = was old \[2\].

- Terraform: \[1\] changed (new cidr), \[2\] changed, \[3\] changed →
  destroy + recreate all three.

- Result: 3 EKS node subnets destroyed → EKS nodes offline → all pods
  evicted → outage.

- Fix: migrate to for_each with stable string keys. Removing or adding a
  key only affects that key.

|                                                                                                                                                                                                                                                                                                                                                                                                          |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                                  |
| *I inserted a new subnet CIDR at position 0 in a count list. count\[1\] now had a different CIDR from before — Terraform planned destroy+recreate for all 3 existing subnets. EKS node networking was destroyed — production outage. Fix: migrate to for_each where each subnet has a stable string key like "private-2a". Adding a new key only creates that one subnet — others completely untouched.* |

#### Q127 [ Mistake-Based ] — You deployed ALB in private subnets. Traffic is not working. Why?


- Internet-facing ALB MUST be in public subnets — private subnets cannot
  receive internet traffic.

- ALB in private subnet: no internet path to it — clients cannot reach
  it.

- Fix: subnets = values(var.public_subnet_ids) — use ALL public subnets.

- Also: ensure all AZs are covered — ALB needs at least 2 AZs (all AZs
  recommended).

|                                                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                          |
| *An internet-facing ALB must be in public subnets with internet routing. I mistakenly used private subnets — ALB existed but clients could not reach it because there is no internet path to private subnets. Fix: use values(var.public_subnet_ids) to use all public subnets. Also ensure all AZs are covered — an ALB in only 2 out of 3 AZs loses capacity if one AZ fails.* |

#### Q128 [ Mistake-Based ] — What is the CIDR overlap error and how do you fix it?


- AWS rejects duplicate CIDR blocks within the same VPC.

- I used 10.0.1.0/24 for both a public subnet and a private subnet.

- Terraform error: InvalidSubnet.Conflict — CIDR already in use.

- Fix: Plan CIDRs before starting. Use distinct ranges per tier.

- CMG pattern: Public 10.0.1-3.0/24 \| Private 10.0.4-6.0/24 \| Data
  10.0.7-9.0/24

|                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                   |
| *I reused the same CIDR 10.0.1.0/24 for both a public and private subnet. AWS error: CIDR conflict. Fix: plan distinct CIDR ranges per tier before creating resources. In CMG: public subnets use 10.0.1-3.0/24, private app subnets use 10.0.4-6.0/24, data subnets use 10.0.7-9.0/24. Using cidrsubnet function makes this automatic and overlap-free.* |

#### Q129 [ Mistake-Based ] — How do you debug a "Reference to undeclared resource" error?


- Error means you reference a resource type.name that does not exist in
  the same config.

- Common causes: typo in resource name, resource in different module,
  resource not created yet.

- Check: does the resource block exist in the current config? grep for
  the resource type.name.

- Check: are you trying to cross-module reference? Use outputs instead.

- Check: did you accidentally delete the resource block?

|                                                                                                                                                                                                                                                                                                                                                                                            |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                    |
| *Reference to undeclared resource means the resource_type.resource_name you referenced does not exist in scope. I check: is there a typo in the name? Does the block exist in this config? Am I accidentally trying to reference a resource from another module (use outputs instead)? Most often it is a typo in the resource name or forgetting to add the output in the source module.* |

#### Q130 [ Mistake-Based ] — What happened when you used the wrong route argument for a NAT Gateway?


- Used gateway_id = aws_nat_gateway.demo.id in an aws_route resource.

- gateway_id argument is only for Internet Gateways and VPN Gateways.

- Terraform error: InvalidParameterValue — incorrect argument for NAT
  Gateway.

- Fix: use nat_gateway_id = aws_nat_gateway.demo.id for NAT Gateway
  routes.

|                                                                                                                                                                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                           |
| *I used gateway_id instead of nat_gateway_id in the aws_route resource for a private subnet route. gateway_id is only for Internet Gateways and VPN Gateways. Terraform error: InvalidParameterValue. Fix: nat_gateway_id = aws_nat_gateway.demo.id. Easy to remember: the argument name tells you the resource type it expects.* |

#### Q131 [ Mistake-Based ] — Why was your EC2 instance not accessible via SSH through the bastion?


- App instance App SG allowed SSH from CIDR 10.0.1.0/24 instead of from
  bastion SG.

- If bastion IP changed (auto-assigned public IP changes on restart),
  CIDR rule breaks.

- Fix: use source_security_group_id = aws_security_group.bastion.id
  instead of CIDR.

- SG-to-SG reference: always preferred for internal east-west traffic.

- SG reference follows the resource automatically — if bastion IP
  changes, rule still works.

|                                                                                                                                                                                                                                                                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                             |
| *I used a CIDR block for the bastion SSH rule instead of SG reference. When the bastion was restarted and got a new IP, the old CIDR no longer matched. Fix: source_security_group_id = aws_security_group.bastion.id. SG-to-SG references follow the resource regardless of IP changes — the correct approach for all internal east-west traffic.* |

#### Q132 [ Mistake-Based ] — What is the splat operator limitation with for_each resources?


- Splat operator \[\*\] works on LIST (count) resources:
  aws_subnet.private\[\*\].id.

- for_each creates a MAP — splat \[\*\] does NOT work on maps.

- Error: Splat expressions are not allowed when the left-hand side is a
  map.

- Fix for maps: values(aws_subnet.private)\[\*\].id — converts map to
  list first.

- Or use for expression: \[for s in aws_subnet.private : s.id\].

|                                                                                                                                                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                           |
| *I tried to use resource\[\*\].id on a for_each resource — splat only works on count (list) resources. for_each produces a map. Fix: values(resource)\[\*\].id converts the map values to a list first, then splat works. Alternatively use a for expression: \[for s in resource : s.id\]. This is a very common mistake when switching from count to for_each.* |

#### Q133 [ Mistake-Based ] — How did overusing depends_on cause a slow Terraform apply?


- Added depends_on on resources where Terraform already detects the
  dependency via reference.

- Result: resources that could be created in parallel were forced into
  sequential creation.

- Apply time doubled because parallelism was artificially eliminated.

- Rule: only use depends_on when the dependency CANNOT be detected
  through reference.

- Terraform is smart — it already detects all implicit dependencies from
  resource references.

|                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                                       |
| *I added depends_on on several resources where Terraform already detected dependencies through resource references. This forced sequential creation and doubled apply time. depends_on creates explicit ordering that overrides Terraform's parallel graph execution. Only use it for hidden dependencies like IAM eventual consistency — not for dependencies Terraform can already detect.* |

#### Q134 [ Mistake-Based ] — You used count for IAM roles. A new role was inserted in the middle. What broke?


- IAM roles had count = 3. New role inserted at index 1 in the list.

- Original roles at \[1\] and \[2\] shifted to \[2\] and \[3\].

- Terraform: role at \[1\] has different name → destroy old role →
  create new role.

- Role at \[2\] same thing → destroy and recreate.

- Result: 2 IAM roles destroyed and recreated → all pods using those
  roles lost access temporarily.

- Fix: migrate to for_each with role names as keys. Adding a key only
  creates that role.

|                                                                                                                                                                                                                                                                                                                                                                  |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                          |
| *I inserted a new IAM role in the middle of a count list. Roles at \[1\] and \[2\] were destroyed and recreated with different names. Pods using those roles lost access during recreation causing service errors. The fix was migrating to for_each using role names as keys — adding a new role name only creates that role, all others completely untouched.* |

#### Q135 [ Mistake-Based ] — How did you debug a module output name mismatch error?


- Error: "Unsupported attribute: module.ec2 does not have attribute
  app_sg_id."

- Root module was calling module.ec2.app_sg_id but output was named
  "appSGid" in module.

- Output names must match EXACTLY between the module definition and the
  caller.

- Fix: rename output in modules/ec2/outputs.tf to "app_sg_id"
  (snake_case).

- Convention: always use snake_case for output names — consistent,
  predictable.

|                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                      |
| *I got "unsupported attribute" error when calling module.ec2.app_sg_id. The module had output "appSGid" (camelCase) but the root module expected "app_sg_id" (snake_case). Output names must match exactly between definition and caller. Fix: rename to snake_case. Convention: always use snake_case for all output names — it is the Terraform standard.* |

#### Q136 [ Mistake-Based ] — You tried to use a resource from another module directly. What happened?


- Tried to use aws_subnet.private_subnet.id from the EC2 module
  directly.

- Terraform error: A reference to a resource type must be followed by at
  least one attribute access.

- Resources from other modules are NOT accessible — modules are
  completely encapsulated.

- Fix: Add output to VPC module. Pass via root module as input variable
  to EC2 module.

- GOLDEN RULE: Modules are black boxes. Only outputs and variables cross
  module boundaries.

|                                                                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **⚡ 30-SECOND ANSWER**                                                                                                                                                                                                                                                                                                                                                            |
| *I tried to reference aws_subnet.private_subnet.id from inside the EC2 module — an error. Modules are completely encapsulated. Fix: add output "private_subnet_ids" to VPC module. Root module passes module.vpc.private_subnet_ids as input to EC2 module via variable. Modules communicate ONLY through outputs → root → inputs. Never direct cross-module resource references.* |

---

## ✅ What's New in This Edition

This is the **V1 Foundation Edition** — the first Terraform handbook in this system. All content above is new.

**Next edition (V2):** will add only new/updated topics per the coverage tracker's pending list, and will reference this file (e.g. "See V1 §4" or "See V1 Q6") instead of repeating anything already documented here.

---

*End of Terraform-Handbook-2025-07-v1.md — this file is now READ-ONLY per the monthly handbook versioning rules.*
