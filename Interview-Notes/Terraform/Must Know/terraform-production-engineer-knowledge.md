# Terraform Production Engineer — Essential Real-World Knowledge

For a Terraform Engineer working in production, knowing commands like `init`, `plan` and `apply` is not enough. You need to understand state management, security, change control, failure recovery, reusable modules, CI/CD and troubleshooting.

Here is a practical production checklist, focused on AWS, Azure and Terraform interviews.

## 1. Terraform state management — highest priority

Terraform state is one of the most critical parts of production infrastructure.

- Remote backend: Store state centrally, not on an engineer's laptop.
- State isolation: Separate state for dev, QA, staging and production.
- Locking: Prevent simultaneous operations from modifying the same state.
- Versioning and recovery: Enable state history or backups where supported.
- Sensitive data: State may contain passwords, tokens and other sensitive attributes even when Terraform marks them `sensitive`.
- Access control: Restrict who can read, write or delete state.
- State migration: Use `terraform init -migrate-state` when changing backend configurations, with a backup and controlled procedure.
- Never manually edit state: Use Terraform state commands or supported import/move operations.
- State drift: Investigate differences between configuration, state and actual infrastructure.

| Cloud | Recommended backend                                                     |
| ----- | ----------------------------------------------------------------------- |
| AWS   | S3 with versioning, restricted IAM permissions and native state locking |
| Azure | Azure Blob Storage with restricted RBAC and native locking              |

Important commands:

```
terraform state list
terraform state show RESOURCE_ADDRESS
terraform state mv OLD_ADDRESS NEW_ADDRESS
terraform state rm RESOURCE_ADDRESS
terraform init -migrate-state
```

Production warning: `terraform state rm` removes an object from Terraform's state tracking; it does not delete the actual cloud resource. But the next plan may propose recreating it.

## 2. Understand the Terraform workflow in production

1\. Code review

Pull request and peer approval

2\. Static checks

fmt, validate, lint, security scan

3\. Terraform plan

Review creates, updates, replacements and destroys

4\. Approval

Required checks for production

5\. Apply and verify

Apply reviewed plan, then verify infrastructure health

Production best practices:

- Pin Terraform and provider versions.
- Commit `.terraform.lock.hcl`.
- Run `terraform fmt -check` and `terraform validate`.
- Review destructive changes carefully.
- Save a plan with `terraform plan -out=tfplan`.
- Apply the reviewed plan with `terraform apply tfplan`.
- Secure saved plan files because they may contain sensitive data.
- Avoid two independent pipelines applying changes to the same state.
- Keep an audit trail of approvals, plan output and deployment results.

The plan used for apply should come from the correct commit and workspace/state configuration. If the plan becomes stale, generate and review a fresh one.

## 3. Security — production must-have

### Authentication

- AWS: prefer IAM roles and temporary credentials over access keys.
- Azure: prefer Managed Identity for workloads running on Azure VMs.
- Azure DevOps: use workload identity federation where appropriate.
- Never hardcode credentials in `.tf`, `.tfvars`, YAML or Git.
- Avoid long-lived credentials on self-hosted agents.
- Use separate identities for dev and production.

### Authorization

Follow the principle of least privilege.

- AWS IAM policies should allow only required actions on required resources.
- Azure RBAC should be scoped to the required subscription, resource group or resource.
- Separate permission to read/write state from permission to create cloud resources where practical.
- Restrict who can run production apply or destroy.
- Protect self-hosted agents because pipeline code may access their assigned identities.

### Secret management

Use AWS Secrets Manager, Azure Key Vault or an approved secret-management integration. Do not assume that marking a Terraform variable as `sensitive = true` encrypts it or removes it from state.

Example:

```
variable "database_password" {
  type      = string
  sensitive = true
}
```

This hides the value in certain Terraform CLI output; it does not guarantee the value will never be stored in state.

## 4. Production-safe Terraform configuration

Know these arguments and functions well.

| Feature                           | Why it matters                                                               |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `lifecycle.prevent_destroy`       | Blocks Terraform from destroying a protected resource while the rule applies |
| `lifecycle.create_before_destroy` | Attempts to create a replacement before removing the old resource            |
| `lifecycle.ignore_changes`        | Ignores specified attribute changes during updates; use sparingly            |
| `depends_on`                      | Declares an explicit dependency when Terraform cannot infer one              |
| `for_each`                        | Creates resources keyed by stable identifiers                                |
| `count`                           | Creates a numbered set of resource instances                                 |
| `locals`                          | Defines reusable expressions                                                 |
| `data` blocks                     | Read existing infrastructure or external information                         |
| `moved` blocks                    | Safely change resource addresses during refactoring                          |
| `import` blocks                   | Bring existing infrastructure under Terraform management                     |
| `check` blocks and preconditions  | Express validations and assumptions                                          |

Example: protect a production database from accidental Terraform destruction.

```
resource "aws_db_instance" "prod" {
  identifier        = "production-db"
  allocated_storage = 20
  engine            = "postgres"
  instance_class    = "db.t3.micro"

  lifecycle {
    prevent_destroy = true
  }
}
```

This is an illustrative snippet, not a complete production database configuration. Production database settings must include appropriate engine versions, credentials, networking, encryption, backups and availability options.

Important: `prevent_destroy` is not a complete backup strategy. If the resource block itself is removed from configuration, that protection may no longer protect the resource as expected. Cloud-side deletion protections and backups may also be needed.

## 5. Modules and repository design

A production Terraform Engineer should avoid copying hundreds of lines of infrastructure code across environments.

Example structure:

```
terraform-infrastructure/
├── modules/
│   ├── network/
│   ├── compute/
│   ├── database/
│   └── monitoring/
├── environments/
│   ├── dev/
│   ├── qa/
│   └── prod/
└── pipelines/
    └── terraform-pipeline.yml
```

Best practices:

- Use reusable modules with clear input variables and outputs.
- Pin module versions or use immutable Git references.
- Separate environment state and credentials.
- Keep environment-specific values in appropriate variable files or pipeline configuration.
- Avoid excessive abstraction: modules should simplify maintenance, not make debugging harder.
- Use stable resource keys with `for_each` to avoid unnecessary replacement when a list changes.
- Define clear module interfaces and document required inputs.

Example module call:

```
module "network" {
  source = "../../modules/network"

  environment = "prod"
  vpc_cidr    = "10.20.0.0/16"
}
```

For production, validate CIDRs, availability zones, naming rules and security requirements rather than relying on hardcoded examples.

## 6. Terraform drift detection

Scenario: Someone manually changes an Azure VM size or AWS security group in the cloud console. Terraform configuration has not changed.

What should you do?

1. Run `terraform plan`.
2. Review the differences between configuration, state and live infrastructure.
3. Confirm whether the manual change was intentional.
4. If approved, update Terraform configuration to reflect the desired state, or allow Terraform to restore the configured state.
5. Review the new plan and apply only after approval.

Commands:

```
terraform plan
terraform plan -refresh-only
terraform apply -refresh-only
```

`terraform plan -refresh-only` previews state updates based on observed infrastructure. `terraform apply -refresh-only` applies those state updates without making the configuration changes that a normal apply might propose.

Production rule: Don't automatically apply every drift correction. Some manual changes may be emergency fixes that need to be understood and incorporated into the code.

## 7. Import existing infrastructure

In production, resources are often created manually before Terraform is introduced.

For example, an existing AWS S3 bucket or Azure Resource Group must be imported before Terraform can manage it without trying to create a duplicate.

Recommended process:

1. Write the matching resource configuration.
2. Add an import block or use the CLI import command.
3. Run `terraform plan`.
4. Reconcile configuration with actual settings.
5. Review the plan carefully before applying.

```
import {
  to = azurerm_resource_group.example
  id = "/subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-existing"
}
```

Importing associates the existing resource with Terraform state; it does not automatically generate a complete configuration that matches every setting.

## 8. Resource replacement and zero-downtime deployments

One of the most important production skills is understanding when Terraform will replace resources.

A change to an immutable attribute may force replacement. This can cause downtime or data loss if the resource is not designed for safe replacement.

Before applying:

- Check for `-/+` replacement indicators in the plan.
- Review every resource marked for destruction.
- Use `create_before_destroy` only when the platform and naming constraints allow it.
- For VMs, use rolling replacement or blue-green deployments where appropriate.
- For databases, plan backups, replication, migration and recovery.
- For load balancers and Kubernetes clusters, plan capacity and health checks.
- Never assume `terraform apply` automatically guarantees zero downtime.

## 9. Production pipeline security and quality gates

A mature Terraform CI/CD pipeline should include:

| Stage                  | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `fmt`                  | Formatting consistency                          |
| `validate`             | Configuration validation                        |
| Linting                | Catch configuration mistakes                    |
| Security scanning      | Detect risky configurations and exposed secrets |
| Policy checks          | Enforce company standards                       |
| `plan`                 | Preview infrastructure changes                  |
| Manual approval        | Review sensitive production changes             |
| `apply`                | Deploy the approved plan                        |
| Post-deployment checks | Confirm resources are healthy                   |

Tools worth knowing include:

- TFLint: Terraform linting.
- Checkov or Trivy: Infrastructure-as-code security scanning.
- OPA/Conftest or a cloud policy framework: Policy enforcement.
- Infracost: Estimate infrastructure cost changes.

Do not rely on scanners alone. Critical controls include protected branches, restricted production identities, approvals and secure handling of plans and state.

## 10. Production recovery and troubleshooting

| Problem                                   | What an engineer should do                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `terraform init` fails                    | Check backend access, provider version, network and authentication                                           |
| State lock error                          | Identify the active operation; never force-unlock blindly                                                    |
| `403 Forbidden`                           | Check identity, permissions, resource scope and data-plane access                                            |
| Resource already exists                   | Inspect ownership and state; import if appropriate                                                           |
| Provider upgrade breaks plan              | Review changelog, lock file and migration requirements                                                       |
| Apply fails halfway                       | Inspect actual resources and state, then create a fresh plan                                                 |
| State becomes unavailable                 | Stop writes, investigate backend access and recover from a verified backup/version                           |
| Pipeline succeeds but application is down | Check health probes, network routes, logs and dependencies                                                   |
| Unexpected resource deletion              | Stop further deployments, preserve evidence, assess recovery options and restore from backups where possible |

Important: Terraform does not provide an automatic rollback transaction for all cloud resources. If an apply partially fails, inspect the real infrastructure before attempting another apply.

## 11. Testing and validation before production

Terraform Engineers should know how to test changes before applying them to real infrastructure.

- Unit-style checks: Validate module inputs, expressions and expected outputs.
- Integration testing: Deploy to a disposable environment and verify resources.
- Plan review: Check unexpected replacements, deletions and permissions.
- Policy testing: Reject public storage, unrestricted security groups or unencrypted resources where policy prohibits them.
- Post-deployment testing: Verify connectivity, health checks, DNS, monitoring and application functionality.
- Cleanup: Destroy test infrastructure only after confirming the correct environment and state.

For advanced testing, learn Terraform's `terraform test` command and how to write test files for reusable modules.

## 12. Cost optimization

Production Terraform code should also help control cloud spending.

- Use tags for application, owner, environment and cost centre.
- Review instance sizes and storage types.
- Identify unattached disks, unused IPs and idle resources.
- Use schedules for non-production environments where appropriate.
- Set cloud budgets and cost alerts separately from Terraform.
- Review cost estimates before deploying expensive changes.
- Avoid creating duplicate resources because of incorrect state or `count`/`for_each` changes.

## 13. Availability, backup and disaster recovery

These are essential for senior-level interviews.

- Deploy across availability zones when appropriate.
- Configure health checks and autoscaling where needed.
- Enable database backups and test restoration.
- Define RPO (Recovery Point Objective) and RTO (Recovery Time Objective).
- Protect critical storage and databases against accidental deletion.
- Test disaster recovery procedures, including state recovery.
- Document dependencies and recovery order.
- Monitor deployment failures and infrastructure health after changes.

Terraform can provision backup policies and recovery infrastructure, but Terraform state backups alone do not back up your application data.

## 14. Advanced topics for a Terraform Engineer

Once the fundamentals are strong, learn these topics:

- Terraform workspaces versus separate environment configurations.
- Provider aliases for multiple AWS accounts or Azure subscriptions.
- Cross-account IAM roles and Azure cross-subscription access.
- Module versioning and upgrade strategies.
- `moved` blocks and state migrations during refactoring.
- `terraform graph` for dependency troubleshooting.
- `terraform console` for expression debugging.
- `terraform providers lock` and provider checksum verification.
- Custom provider development concepts and API rate limits.
- Ephemeral values and write-only arguments where supported by the relevant Terraform/provider version.
- Terraform Cloud or HCP Terraform concepts, including remote execution, policy controls and private registries.

## 15. Production checklist to use before every apply

## Pre-deployment checklist

0/10

Correct account, subscription, region and environment verified

Correct Git commit and Terraform workspace/state confirmed

Authentication and permissions checked

Formatting, validation and security checks passed

Plan reviewed for replacements and deletions

Backups and recovery plans confirmed for critical resources

Required approval received

Plan file securely stored and protected

Apply completed and infrastructure health verified

Deployment logs and change records retained

Reset checklistCopy checklist

## My recommended learning order

1. Terraform state, backend, locking and recovery.
2. AWS IAM roles and Azure Managed Identity.
3. Modules, variables, `for_each`, import and lifecycle rules.
4. Azure DevOps pipelines with plan, approval and apply.
5. Drift detection, replacement and partial failure recovery.
6. Security scanning, policy enforcement, cost optimization and disaster recovery.

For your DevOps interviews, be ready to explain one complete production change from Git commit to approved deployment and post-deployment verification, including what you would do if the apply failed halfway.

I can also help you practise this as a daily 30-minute Terraform production interview exercise, with one scenario, one coding task and revision questions each day. Would you like me to set up a daily reminder for that?