# Jenkins CI/CD Pipeline Explained in Simple Words

Let's understand the Jenkinsfile step by step using a real production example.

Scenario: Your team needs to update an AWS EC2 instance using Terraform. You push code to Git, Jenkins checks it, an authorized person approves the deployment, and Jenkins deploys the change to production.

## 1. Understand the complete flow

1

Git commit

Developer pushes Terraform code

2

Checkout

Jenkins downloads the code

3

Init

Terraform connects to its provider and remote state

4

Validate + scan

Check syntax, formatting, and security

5

Plan

Show the proposed infrastructure changes

6

Approval

Release manager reviews and approves

7

Apply

Terraform makes the approved changes

8

Verify

Check infrastructure and application health

The important difference is:

- CI (Continuous Integration): checks that your Terraform code is valid and meets quality/security requirements.
- CD (Continuous Delivery/Deployment): prepares, approves, and deploys the infrastructure changes.

For production infrastructure, deployment should have explicit approval and controlled permissions.

## 2. Explain each Jenkins stage

### Stage 1 — Checkout

```
stage('Checkout') {
    steps {
        checkout scm
    }
}
```

What happens?

Jenkins downloads the Terraform code from your Git repository.

For example, the repository contains:

```
terraform-project/
├── Jenkinsfile
└── terraform/
    └── prod/
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        └── .terraform.lock.hcl
```

Production check: Confirm that Jenkins is building the correct commit and protected branch.

### Stage 2 — Terraform Init

```
terraform init -input=false -lockfile=readonly
```

What happens?

Terraform prepares the working directory. It downloads the required providers, initializes the backend, and reads the provider lock file.

For AWS, this is where Terraform connects to the configured S3 remote state backend.

- `-input=false`: prevents interactive prompts.
- `-lockfile=readonly`: uses the committed dependency lock file without modifying it.

Production check: Verify that the agent has the correct AWS identity and permission to access the state bucket.

### Stage 3 — Format and Validate

```
terraform fmt -check -recursive
terraform validate
```

What happens?

- `terraform fmt -check`: checks whether the Terraform files follow the expected formatting.
- `terraform validate`: checks Terraform configuration syntax and internal consistency.

For example, if you have an invalid resource argument, validation may fail and stop the pipeline.

Production check: Fix the issue in Git and rerun the pipeline. Do not bypass failed checks just to deploy.

### Stage 4 — Lint and Security Scan

```
tflint --chdir="terraform/prod" --init
tflint --chdir="terraform/prod"

checkov -d "terraform/prod" --framework terraform
```

What happens?

- TFLint detects Terraform configuration issues and potential provider-specific mistakes.
- Checkov checks infrastructure code against security policies.

For example, a security scan may flag an S3 bucket that is publicly accessible or a security group that permits unrestricted inbound traffic.

Production check: Review findings, fix serious issues, and allow exceptions only through an approved policy.

### Stage 5 — Terraform Plan

```
terraform plan -input=false -lock-timeout=5m -out=tfplan
```

What happens?

Terraform compares your configuration, the state, and the actual infrastructure to determine the proposed changes.

Example:

```
Plan: 1 to add, 1 to change, 0 to destroy.
```

This means Terraform proposes creating one resource and modifying one resource.

The `-out=tfplan` option saves the plan so that the pipeline can apply the reviewed plan later.

Production check: Review all additions, modifications, replacements, and deletions. If the plan shows unexpected destruction, stop and investigate.

### Stage 6 — Production Approval

```
input(
    message: 'Approve production deployment?',
    ok: 'Approve deployment',
    submitter: 'release-manager,platform-lead'
)
```

What happens?

Jenkins pauses and waits for an authorized person to approve the deployment.

The approver should review:

- The change request and deployment window.
- The Terraform plan and potential downtime.
- Backups and recovery arrangements.
- The impact on production resources.

Important: The example's `submitter` setting works only when the corresponding Jenkins users/groups and permissions are configured correctly. The Jenkins environment must enforce who is allowed to approve.

### Stage 7 — Terraform Apply

```
terraform apply -input=false -lock-timeout=5m tfplan
```

What happens?

Terraform executes the saved plan that was generated before approval.

For example, it updates the EC2 instance configuration or creates a security group.

Why not just run `terraform apply -auto-approve`?

Because production deployment should use the approved plan. Running a fresh plan or using auto-approval without the required controls could deploy changes that were never reviewed.

### Stage 8 — Post-deployment Verification

After apply, verify both the infrastructure and the application.

| Check         | What you verify                                       |
| ------------- | ----------------------------------------------------- |
| Terraform     | Apply completed successfully                          |
| AWS           | Expected resources exist and are configured correctly |
| Application   | Health endpoint or smoke test passes                  |
| Monitoring    | No unexpected critical alarms                         |
| Logs          | No new errors caused by the deployment                |
| Change record | Approval, result, and evidence are recorded           |

For a production pipeline, remove `terraform output` unless you have confirmed that it cannot expose secrets.

The original example also runs:

```
terraform plan -input=false -lock-timeout=5m -detailed-exitcode
```

This checks whether further changes are pending. Its exit codes are `0` for no changes, `1` for an error, and `2` when changes are present. Because exit code `2` is nonzero, a normal shell step may mark the build as failed. Handle these codes explicitly and investigate unexpected remaining changes rather than treating them as a successful health check.

## 3. What happens if Terraform apply fails halfway?

Suppose Terraform creates an EC2 instance successfully but fails to create the next resource because of an IAM permission error.

1. Jenkins marks the apply stage as failed.
2. Check the Terraform error logs and determine which operations succeeded.
3. Inspect Terraform state and the actual AWS resources.
4. Fix the missing permission through the approved process.
5. Generate a fresh Terraform plan.
6. Review the changes and obtain any required production approval.
7. Apply the reviewed plan and rerun post-deployment verification.

Do not automatically destroy the resources or blindly rerun the previous saved plan. Terraform apply is not a transactional rollback.

## 4. Three important improvements before using this Jenkinsfile in production

- Branch protection: Run the production deployment stages only for the protected `main` branch; pull requests should run checks without deploying.
- Plan security: Protect the saved plan and remote state because they may contain sensitive values. Keep the plan in a secured workspace, and clean it up after use.
- Real health checks: Add a configured application health URL and an actual smoke test. Terraform reporting success alone does not prove the application works.

Interview summary: “Jenkins automates the Terraform workflow. It checks out code, initializes Terraform, validates and scans the configuration, creates a plan, waits for production approval, applies the reviewed plan, and verifies the deployment. If apply fails, I inspect the state and real resources, fix the cause, create a fresh plan, and continue through the approved recovery process.”

Would you like a daily reminder to practise one Jenkins or Terraform production interview scenario?