# Terraform State Management: Interview Guide (CMG / EKS)

> Contents: 1 Architecture, 2 Core Concepts, 3 Code, 4 Commands, 5 Advanced Topics (Workspaces, Remote State, Locking, Multi-cloud, Recovery Playbook), 6 Scenarios, 7 Troubleshooting Flow, 8 Troubleshooting Commands, 9 Final Memory Sheet

---

## 1. Architecture (Graphical View)

### 1.1 Big picture: how state fits in

```
 Developer ──► Git (PR) ──► Jenkins Pipeline ──► Terraform CLI
                                                     │
                       ┌─────────────────────────────┼─────────────────────────┐
                       │                             │                         │
                       ▼                             ▼                         ▼
              1. LOCK (DynamoDB)           2. READ/WRITE STATE (S3)      3. CALL AWS APIs
              cmg-terraform-locks          cmg-terraform-state-prod      EKS / VPC / RDS / IAM
              LockID = bucket/key          key: eks/prod/terraform.tfstate   (real infra)
                                           ├─ versioning ON
                                           ├─ KMS encrypted (CMK)
                                           ├─ public access BLOCKED
                                           └─ bucket policy: only prod Jenkins role
```

### 1.2 Mermaid: apply lifecycle

```mermaid
sequenceDiagram
    participant J as Jenkins (env IAM role)
    participant T as Terraform
    participant D as DynamoDB (lock)
    participant S as S3 (state, KMS)
    participant A as AWS APIs
    J->>T: terraform init -backend-config=backends/prod.tfvars
    J->>T: terraform plan
    T->>D: acquire lock (LockID)
    T->>S: read state (decrypt via KMS)
    T->>A: refresh: read real resources
    T-->>J: diff (state vs code vs real)
    J->>T: terraform apply
    T->>A: create/update/destroy
    T->>S: write new state (serial + 1)
    T->>D: release lock
```

### 1.3 Environment isolation

```
        DEV                     UAT                      PROD
  ┌──────────────┐       ┌──────────────┐        ┌──────────────┐
  │ S3 cmg-state-dev  │  │ S3 cmg-state-uat  │   │ S3 cmg-state-prod │
  │ DDB cmg-locks-dev │  │ DDB cmg-locks-uat │   │ DDB cmg-locks-prod│
  │ KMS dev-key       │  │ KMS uat-key       │   │ KMS prod-key      │
  │ IAM jenkins-dev   │  │ IAM jenkins-uat   │   │ IAM jenkins-prod  │
  └──────────────┘       └──────────────┘        └──────────────┘
   ✗ dev role cannot read/write prod bucket; prod key cannot decrypt dev state
```

### 1.4 Three-way relationship (key concept)

```
        .tf CODE  (desired)
             │
             │  plan compares all three
             ▼
   ┌──────► STATE (what TF believes exists) ◄──────┐
   │                                                │
 refresh                                          import
   │                                                │
   └────────── REAL AWS (what actually exists) ─────┘

 code != state          -> plan shows changes (normal apply)
 state != real AWS      -> DRIFT (detect with plan -refresh-only)
 in AWS, not in state   -> needs terraform import
 in state, not in code  -> plan wants to DESTROY it
```

---

## 2. Core Concepts (Point-wise)

- **State file**: `terraform.tfstate`, a JSON map of each `.tf` resource to a real AWS resource.
- Stores: IDs, ARNs, all attributes, dependencies, outputs, provider metadata.
- **`serial`**: increments on every state write. A lower or out-of-order serial signals a conflict or corruption.
- **`lineage`**: a UUID for the state's history that never changes. A mismatch means a different history.
- Terraform reads state before every plan. Without it, Terraform recreates everything.
- State is **metadata, not a backup** of infrastructure.
- State holds **secrets** (RDS passwords, endpoints), so treat it as highly sensitive.

### Security rules
- NEVER commit `*.tfstate` to Git.
- ALWAYS encrypt S3 with a customer-managed KMS key.
- ALWAYS restrict access via bucket policy to minimum IAM roles.
- ALWAYS enable S3 versioning.
- ALWAYS enable DynamoDB locking.
- ALWAYS block all public access.
- Consider MFA delete, and enable CloudTrail on the bucket.

### Isolation rules
- Separate bucket, lock table, KMS key and IAM role per environment.
- Bucket policy DENY for everyone except that environment's Jenkins role.

> Bonus: Terraform 1.10+ supports native S3 locking (`use_lockfile = true`), so DynamoDB is no longer required. Existing CMG-style setups still use DynamoDB.

---

## 3. Code

### 3.1 Full backend (single environment)

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "cmg-terraform-state-prod"
    key            = "eks/prod/terraform.tfstate"
    region         = "eu-west-2"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:eu-west-2:<acct>:key/prod-key"
    dynamodb_table = "cmg-terraform-locks"
  }
}
```

### 3.2 Partial backend config (dynamic per environment)

```hcl
# backend.tf  (shell only, no dynamic values)
terraform {
  backend "s3" {
    region = "eu-west-2"
  }
}
```

```hcl
# backends/prod.tfvars
bucket         = "cmg-terraform-state-prod"
key            = "eks/prod/terraform.tfstate"
dynamodb_table = "cmg-terraform-locks-prod"
kms_key_id     = "arn:aws:kms:eu-west-2:<acct>:key/prod-key"
```

```bash
terraform init -backend-config=backends/${TF_ENV}.tfvars -reconfigure
# Moving an existing environment to a NEW backend (copies state):
terraform init -backend-config=backends/prod.tfvars -migrate-state
```

### 3.3 Bootstrap resources for the backend (create once, separate config)

```hcl
resource "aws_kms_key" "state" {
  description         = "Terraform state key (prod)"
  enable_key_rotation = true
}

resource "aws_s3_bucket" "state" {
  bucket = "cmg-terraform-state-prod"
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.state.arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "locks" {
  name         = "cmg-terraform-locks-prod"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"          # must be exactly "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

### 3.4 Bucket policy: only the prod Jenkins role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyAllExceptProdJenkins",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::cmg-terraform-state-prod",
        "arn:aws:s3:::cmg-terraform-state-prod/*"
      ],
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalArn": "arn:aws:iam::<acct>:role/jenkins-prod"
        }
      }
    },
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::cmg-terraform-state-prod",
        "arn:aws:s3:::cmg-terraform-state-prod/*"
      ],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    }
  ]
}
```

> Note: a Deny-all-except policy can lock out admins too. Include a break-glass admin role in the allowed principals.

### 3.5 Jenkins pipeline (env selected by branch)

```groovy
pipeline {
  agent any
  environment {
    TF_ENV = "${env.BRANCH_NAME == 'main' ? 'prod' : (env.BRANCH_NAME == 'release' ? 'uat' : 'dev')}"
  }
  stages {
    stage('Init') {
      steps { sh 'terraform init -backend-config=backends/${TF_ENV}.tfvars -reconfigure' }
    }
    stage('Plan') {
      steps { sh 'terraform plan -out=tfplan' }
    }
    stage('Approval') {
      when { branch 'main' }
      steps { input message: 'Apply to PROD?' }
    }
    stage('Apply') {
      steps { sh 'terraform apply tfplan' }
    }
  }
}
```

### 3.6 Rename without recreation

```hcl
# Method 1 (preferred, TF 1.1+): moved block, reviewable in PR and shown in plan
moved {
  from = aws_security_group.old
  to   = module.sg.aws_security_group.eks
}
# Remove the moved block after a successful apply
```

```bash
# Method 2: state mv (all versions, immediate, no plan preview)
terraform state pull > backup-$(date +%F).tfstate
terraform state mv aws_security_group.old module.sg.aws_security_group.eks
terraform plan    # must show: No changes.
```

### 3.7 Import (command and TF 1.5+ block)

```bash
terraform import aws_db_instance.main cmg-prod-db
```

```hcl
# TF 1.5+: reviewable import
import {
  to = aws_db_instance.main
  id = "cmg-prod-db"
}
# terraform plan -generate-config-out=generated.tf  (can draft the resource code)
```

### 3.8 Nightly drift detection (cron / Jenkins)

```bash
terraform init -backend-config=backends/prod.tfvars -reconfigure
terraform plan -refresh-only -detailed-exitcode
# exit 0 = no drift, 2 = drift detected -> alert Slack/email
```

---

## 4. All State Commands

| Command | What it does | When to use |
|---|---|---|
| `terraform state list` | List tracked resources | Verify after import or migration |
| `terraform state show <addr>` | Full attributes of one resource | Compare to real AWS (drift) |
| `terraform state mv src dst` | Rename in state, no destroy | Before renaming in code |
| `terraform state rm <addr>` | Remove from state, AWS untouched | Stop managing a resource |
| `terraform state pull` | Download state to stdout | Backup before any surgery |
| `terraform state push file` | Upload state to backend | Emergency restore (DANGEROUS) |
| `terraform import addr id` | Adopt an existing resource | Bring manual resources under TF |
| `terraform force-unlock ID` | Remove a stuck lock | Only after confirming NO active apply |
| `terraform plan -refresh-only` | Detect drift | Nightly cron |
| `terraform apply -refresh-only` | Accept drift into state | After reviewing the drift |

---

## 5. Advanced Topics (Simple Points)

### 5.1 Workspaces vs Separate Backends

- **Workspaces**: many environments from the SAME config. Each gets its own state, in the same backend.
- Workspace commands:
  - `terraform workspace new dev`
  - `terraform workspace select prod`
  - `terraform workspace list`
  - `terraform workspace show` (prints the current workspace)
  - `terraform workspace delete dev`
- Workspaces share the SAME S3 bucket, with different key prefixes, so isolation is weaker.
- **Separate backends**: each environment gets its own S3 bucket, DynamoDB table and KMS key. Isolation is stronger, but setup is more work.

| Aspect | Workspaces | Separate Backends |
|---|---|---|
| State storage | Same bucket, different key prefix | Separate buckets |
| Security isolation | Weaker (same bucket policy) | Stronger (own policies + KMS keys) |
| Setup | Simple | More setup |
| Access control per env | Hard | Easy (IAM role per env) |

- **CMG uses both**: workspace for naming convenience, separate backend configs for real isolation.

### 5.2 `terraform_remote_state` (share data across states)

- It reads OUTPUT values from another state file.
- Use case: the networking team owns the VPC, and the EKS team reads the VPC outputs without owning that state.
- Separate state files mean a separate blast radius. A bug in one config can't corrupt another team's state.
- Each team applies independently.

```hcl
data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "cmg-state-prod"
    key    = "networking/terraform.tfstate"
    region = "eu-west-2"
  }
}

module "eks" {
  vpc_id             = data.terraform_remote_state.vpc.outputs.vpc_id
  private_subnet_ids = data.terraform_remote_state.vpc.outputs.private_subnet_ids
}
```

- The reading role needs read access to the other state, and values must be exposed as `output` in the source config.

### 5.3 What breaks without state locking

Real mistake: two engineers applying at the same time.

1. Both read the same state snapshot at T=0.
2. Engineer A creates Resource X and writes state (serial N+1).
3. Engineer B, still on the T=0 snapshot, creates Resource Y and writes state, OVERWRITING A's change.
4. Final state has Y but NOT X. X is now an orphan: it exists in AWS but not in state.
5. The next plan tries to create X again and fails with a duplicate-resource error.

- **Recovery:** restore state from S3 versioning, `terraform import` the orphaned resource, then confirm `terraform plan` shows 0 changes.
- **Prevention:** DynamoDB locking. It is a one-time 5-minute setup (see 3.1).

### 5.4 Multi-cloud state isolation

- NEVER mix AWS and Azure/GCP in one config. A provider error blocks the whole apply.
- Use separate directories per cloud, each with its own state, auth and CI/CD pipeline.
- State can still live in one S3 bucket with separate key paths (`aws/prod`, `azure/prod`, `gcp/prod`). This gives one central audit trail.
- Use each cloud's native auth: IAM role for AWS, OIDC for Azure/GCP. No long-lived credentials.
- Cross-cloud sharing goes through `terraform_remote_state` or shared variable files, never a mixed-provider config.

### 5.5 Migrating environments off a shared backend

Real mistake: dev, UAT and prod all shared one backend.
- Risks: one bad apply can hit all three environments, teams hit lock contention, and there is no security isolation.

Safe procedure:
1. Announce a maintenance window and freeze ALL pipelines.
2. Back up: `terraform state pull > shared-backup-YYYYMMDD.json`.
3. Create separate S3 buckets, DynamoDB tables and KMS keys per environment.
4. For each environment, select its workspace, then run:
   ```bash
   terraform init -backend-config=backends/<env>.tfvars -migrate-state -reconfigure
   ```
5. Run `terraform state list` to verify that all resources migrated.
6. Run `terraform plan`. It must show 0 changes.
7. Repeat steps 4-6 for every remaining environment.
8. Update the CI/CD pipelines to the new per-environment backend configs.
9. Delete the old shared backend ONLY after 48 hours of stable operation.

### 5.6 Recovery playbook

#### (a) Stuck DynamoDB lock
1. Confirm there is NO active apply: check CI/CD for running pipelines.
2. Get the lock details:
   ```bash
   aws dynamodb get-item --table-name cmg-terraform-locks \
     --key '{"LockID":{"S":"<state-key>"}}'
   ```
3. Check the "Created" time. 30+ minutes old with no active build means it's stuck.
4. Run `terraform force-unlock LOCK_ID` and confirm with `yes`.
5. Run `terraform plan -refresh-only` to verify state integrity.
6. Post-incident: alert when lock age exceeds 30 minutes.

#### (b) Corrupted or deleted state file
1. STOP all Terraform operations immediately.
2. List versions:
   ```bash
   aws s3api list-object-versions --bucket <bucket> --prefix <state-key>
   ```
3. Identify the pre-corruption version by timestamp.
4. Restore it:
   ```bash
   aws s3api copy-object --bucket <bucket> \
     --copy-source "<bucket>/<key>?versionId=GOOD_VERSION" --key <key>
   ```
5. Run `terraform plan -refresh-only` to find drift since the snapshot.
6. `terraform import` any resources created after the restored snapshot.
7. Run `terraform plan`. It must show 0 changes.
- S3 versioning IS the recovery mechanism, which is why it's mandatory.

#### (c) Uncontrolled apply or accidental destroy
Examples: `-auto-approve` during an incident, or a wrongly run `terraform destroy`.
1. STOP. Run no more Terraform commands until the damage is assessed.
2. Declare a Sev-1, notify the lead and stakeholders, and revoke the actor's access if the action was mistaken or malicious.
3. Pull the CI/CD log and list every resource created, modified or destroyed.
4. Freeze the pipeline to prevent re-runs.
5. Restore state from S3 versioning (procedure b) for destroyed resources.
6. For wrongly created resources: `terraform state rm`, remove them from the `.tf` code, then `terraform destroy -target`.
7. Run `terraform apply` to recreate destroyed infrastructure from the restored state. For CMG that is about 20 min for 200+ resources. Then redeploy applications via GitOps.
8. Verify that `terraform plan -refresh-only` shows 0 drift.
9. Permanent fix:
   - Remove `-auto-approve` from all pipelines.
   - Add a manual approval gate.
   - Add `prevent_destroy` to critical prod resources.
   - Add an SCP that blocks destructive delete APIs for everyone except the pipeline role.

```hcl
resource "aws_db_instance" "prod" {
  # ...
  lifecycle {
    prevent_destroy = true
  }
}
```

#### (d) Resource deleted manually outside Terraform

| Deleted | Next plan | Data loss? |
|---|---|---|
| EC2 instance | Recreates from config | In-memory data, plus EBS if not separate |
| RDS instance | Recreates an EMPTY database | YES. Restore a snapshot first |
| S3 bucket (with objects) | Recreates an empty bucket | YES. Objects gone forever |
| EKS cluster | Full recreation, about 20 min | No, but workloads need redeploying |
| IAM role | Recreates role + attachments | No, safe |

- If it should stay deleted: `terraform state rm <addr>`, remove it from the `.tf` code, then commit.
- Prevention: `prevent_destroy = true` on critical resources, plus CloudTrail → EventBridge → SNS alerts on deletion of critical resource types.

#### (e) Rollback philosophy
- Terraform has NO built-in rollback. It is forward-only by design.
- To "undo", either fix the code and re-apply toward the desired state, or restore the pre-apply state from S3 versioning and apply to revert.
- S3 versioning is the rollback mechanism.
- Prevention: always use `plan -out` and review the plan before `apply`.

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

---

## 6. Scenario Questions and Answers

### Q1. Teammate renamed a resource into a module and the plan shows 1 destroy and 1 create. What do you do?

**Why it happens:** the old address is in state and the new address isn't, so Terraform treats it as delete old plus create new. For an EKS cluster that means downtime and data loss.

**Answer**
1. Don't apply. Run `terraform state pull > backup.tfstate`.
2. Add a `moved {}` block (see 3.6), so the move is in Git and shown in the plan.
3. Run `plan`. It should show the move and no destroy.
4. Apply, then remove the `moved` block in a follow-up PR.

`state mv` is only for a quick one-off, because it has no plan preview and no audit trail.

---

### Q2. A Jenkins apply was killed mid-run and now "Error acquiring the state lock". What do you do?

```
Error: Error acquiring the state lock
Lock Info:
  ID:        a1b2c3d4-...
  Operation: OperationTypeApply
  Who:       jenkins@build-node-3
  Created:   2026-10-09 09:12:44 UTC
```

**Answer**
1. Read the lock info for the ID, who holds it, and when it was taken.
2. Confirm no apply is running: check Jenkins and ask the team.
3. Inspect the item in the DynamoDB table (`LockID` = `bucket/key`).
4. Run `terraform force-unlock a1b2c3d4-...`.
5. Run `terraform plan` to check for a partial apply. Restore a previous S3 version if state is inconsistent.

Never force-unlock while an apply may still be running, because two writers can corrupt state.

---

### Q3. Nightly drift job: someone changed an EKS security group rule in the console. How do you handle it?

**Answer**
1. `terraform plan -refresh-only` flags it (exit code 2 triggers the alert).
2. Find who and why with CloudTrail.
3. Decide:
   - **Change was wrong:** run a normal `terraform apply`, which reverts AWS to match the code.
   - **Change was valid (emergency fix):** update the `.tf` code to match, then `terraform apply -refresh-only` to accept it into state.
4. Prevent it: least-privilege IAM (no console writes in prod), drift alerts, and a review process.

---

### Q4. Prod state file was deleted or corrupted. What's your recovery plan?

**Answer**
1. **S3 versioning**: list versions and restore the latest good one.
   ```bash
   aws s3api list-object-versions --bucket cmg-terraform-state-prod --prefix eks/prod/terraform.tfstate
   aws s3api get-object --bucket cmg-terraform-state-prod --key eks/prod/terraform.tfstate \
     --version-id <GOOD_VERSION> restored.tfstate
   ```
2. Check `serial` and `lineage` in the restored file. It should be the highest serial of the correct lineage.
3. Put it back by copying the version over the current object, or use `terraform state push restored.tfstate` as a last resort.
4. Run `terraform plan`. Expect no changes, or only changes made since that version.
5. If there is no version history, rebuild with `terraform import` per resource, then verify with `state list` and `plan`.

**Prevention:** versioning, MFA delete, restrictive bucket policy, CloudTrail.

---

### Q5. Migrate an existing environment from local state to S3. Steps and risks?

**Answer**
1. Back up the local state: `cp terraform.tfstate backup.tfstate`.
2. Create the bucket (versioning, KMS, public access block) and the DynamoDB table (see 3.3).
3. Add the backend block, then run:
   ```bash
   terraform init -backend-config=backends/prod.tfvars -migrate-state
   ```
4. Verify with `terraform state list` and `terraform plan`. Expect "No changes."
5. Remove local state files and make sure `*.tfstate` is in `.gitignore`.

**Key difference:**
- `-migrate-state` copies existing state to the new backend.
- `-reconfigure` only re-points to a backend and does NOT copy state. Without migration, Terraform starts empty and would try to recreate everything.

---

### Q6. Adopt a manually created RDS instance, and stop managing another resource. How?

**Adopt**
1. Write the `aws_db_instance.main` resource block.
2. `terraform import aws_db_instance.main cmg-prod-db` (or an `import {}` block on 1.5+).
3. Run `plan` and adjust the code until it shows no changes.

**Stop managing**
1. `terraform state pull > backup.tfstate`.
2. `terraform state rm aws_instance.legacy`. The AWS resource stays and Terraform just forgets it.
3. Remove the code too, or the next apply will try to create it again.

Verify both with `terraform state list` and a clean `plan`.

---

## 7. Troubleshooting Flow

### 7.1 Decision tree (Mermaid)

```mermaid
flowchart TD
    A[Terraform command fails or plan looks wrong] --> B{Error type?}
    B -->|Lock error| C[Read lock info: ID, who, when]
    C --> D{Apply still running?}
    D -->|Yes| E[Wait. Do NOT unlock]
    D -->|No| F[terraform force-unlock ID]
    F --> G[Run plan, check for partial apply]

    B -->|Plan wants destroy and create| H{Was code renamed or moved?}
    H -->|Yes| I[Add moved block or state mv, plan shows No changes]
    H -->|No| J[terraform state show addr vs real AWS, check forced-replacement attribute]

    B -->|Plan wants to create everything| K{State empty or wrong backend?}
    K --> L[Check backend tfvars, key, bucket, env, init -reconfigure]
    L --> M{State object missing?}
    M -->|Yes| N[Restore S3 version or import resources]

    B -->|Unexpected changes nobody made| O[plan -refresh-only to confirm drift]
    O --> P{Drift valid?}
    P -->|No| Q[apply to revert]
    P -->|Yes| R[Update code, apply -refresh-only]

    B -->|Access denied / KMS error| S[Check IAM role, bucket policy, KMS key policy, env]

    B -->|Resource exists in AWS, not in state| T[terraform import, then plan]
    B -->|Resource in state, should not be managed| U[state rm, remove code]
    B -->|Serial or lineage mismatch| V[state pull, compare, restore correct version]
```

### 7.2 Same flow as a checklist

```
1. Read the exact error message first.
2. Which backend/env am I pointing at?          -> terraform init output, backends/<env>.tfvars
3. Is state reachable and decryptable?          -> state list, IAM / bucket policy / KMS
4. Is something holding the lock?                -> lock info + DynamoDB item
5. Is plan showing destroy/create?               -> rename/move? forced replacement?
6. Is it drift?                                  -> plan -refresh-only
7. Back up before ANY surgery                    -> state pull > backup.tfstate
8. Fix with the smallest tool                    -> moved / mv / import / rm / restore
9. Verify                                        -> state list + plan = No changes
```

---

## 8. Troubleshooting Commands to Remember

```bash
# ---- Inspect ----
terraform state list
terraform state list | grep eks
terraform state show aws_eks_cluster.main
terraform output
terraform show

# ---- Backup (ALWAYS before surgery) ----
terraform state pull > backup-$(date +%F-%H%M).tfstate

# ---- Init / backend problems ----
terraform init -backend-config=backends/prod.tfvars -reconfigure
terraform init -backend-config=backends/prod.tfvars -migrate-state

# ---- Locks ----
terraform force-unlock <LOCK_ID>
aws dynamodb scan --table-name cmg-terraform-locks-prod
aws dynamodb delete-item --table-name cmg-terraform-locks-prod \
  --key '{"LockID":{"S":"cmg-terraform-state-prod/eks/prod/terraform.tfstate"}}'   # last resort

# ---- Drift ----
terraform plan -refresh-only
terraform plan -refresh-only -detailed-exitcode     # 0 clean, 2 drift
terraform apply -refresh-only

# ---- Rename / move / adopt / forget ----
terraform state mv <old> <new>
terraform import <addr> <id>
terraform state rm <addr>

# ---- Recovery from S3 versioning ----
aws s3api list-object-versions --bucket <bkt> --prefix <key>
aws s3api get-object --bucket <bkt> --key <key> --version-id <id> restored.tfstate
terraform state push restored.tfstate               # DANGEROUS, last resort

# ---- Debug ----
TF_LOG=DEBUG terraform plan 2> debug.log
terraform plan -target=<addr>                       # only for emergencies
terraform validate
terraform providers
```

---

## 9. Final Memory Sheet (Quick Revision)

### 9.1 One-liners
- **State** = the mapping of `.tf` to real AWS resources (metadata, not a backup).
- **`serial`** goes up on every write. **`lineage`** is the permanent UUID.
- **Remote backend** = S3 + DynamoDB + KMS.
- **Partial backend** = shell in code, values in `backends/<env>.tfvars`.
- **Isolation** = separate bucket, table, KMS key and IAM role per environment.

### 9.2 Which tool when?

| Situation | Use |
|---|---|
| Renamed or moved resource | `moved {}` (preferred) or `state mv` |
| Exists in AWS, not in TF | `import` |
| Stop managing a resource | `state rm` |
| Stuck lock | `force-unlock` (after confirming no active apply) |
| Detect drift | `plan -refresh-only` |
| Accept drift | `apply -refresh-only` |
| Revert drift | normal `apply` |
| Move to new backend | `init -migrate-state` |
| Re-point to same backend | `init -reconfigure` |
| Before surgery | `state pull > backup` |
| Lost state | S3 version restore, else import |

### 9.3 Never forget
1. Never commit state to Git.
2. Never force-unlock during an active apply.
3. Never skip a backup before state surgery.
4. Never apply a plan with unexpected destroy.
5. Always end with `plan` showing "No changes."

### 9.4 Security checklist (7 items)
`KMS CMK` · `versioning` · `DynamoDB lock` · `block public access` · `least-privilege bucket policy` · `MFA delete` · `CloudTrail`

### 9.5 `state mv` vs `moved {}`

| | `state mv` | `moved {}` |
|---|---|---|
| Version | all | 1.1+ |
| Audit | shell history only | Git and PR |
| Preview | none | shown in plan |
| Rollback | manual | revert in Git |
| Use for | quick one-off | production refactoring |

### 9.6 Advanced topics, quick recall

| Topic | Remember |
|---|---|
| Workspaces | Same config, same bucket, different key prefix, weaker isolation |
| Separate backends | Own bucket + table + KMS + IAM, stronger isolation |
| CMG approach | Workspace for naming, separate backends for isolation |
| `terraform_remote_state` | Reads another state's OUTPUTS, separate blast radius |
| No locking | Last write wins, so an orphaned resource and duplicate error |
| Multi-cloud | Separate dirs + state + pipeline per cloud, OIDC auth, one bucket with key paths |
| Shared backend fix | Freeze, backup, new backends, `-migrate-state`, verify, wait 48h, delete old |
| Stuck lock | Confirm no apply, `force-unlock`, `plan -refresh-only` |
| Deleted state | Stop, list S3 versions, `copy-object` a good version, `plan -refresh-only`, import extras |
| Accidental destroy | Sev-1, freeze pipeline, restore state, apply, remove `-auto-approve`, add `prevent_destroy` + SCP |
| Manually deleted RDS or S3 | Data LOST. Restore snapshot first |
| Rollback | None built in. Use S3 versioning, and `plan -out` before apply |

### 9.7 STAR-style closing line (CMG)
"On CMG, I run isolated S3, DynamoDB, KMS and IAM per environment with partial backend config selected by Jenkins branch. I use `moved` blocks for refactors, nightly `plan -refresh-only` for drift, and S3 versioning for recovery, so state changes are safe, auditable and recoverable."
