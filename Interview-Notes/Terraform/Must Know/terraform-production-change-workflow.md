# Complete Terraform Production Change — Git Commit to Deployment

Imagine you need to create or update an AWS production EC2 instance using Terraform. You must deploy it safely, get approval, verify the result, and handle failures without damaging production.

In a real interview, explain the process in this order: Commit → PR → Validation → Plan → Approval → Apply → Verification → Troubleshooting.

## 1. End-to-end production workflow

Step 1 — Make the change and commit

Update the Terraform code, run `terraform fmt`, and commit the change to a feature branch.

```
terraform fmt -recursive
git checkout -b feature/update-prod-ec2
git add .
git commit -m "Update production EC2 configuration"
git push origin feature/update-prod-ec2
```

Step 2 — Create a pull request (PR)

Another engineer reviews the code. Check the resource changes, naming, tags, security groups, IAM permissions, and whether any existing resource could be replaced or destroyed. Merge only after the required review and checks pass.

Step 3 — Run automated checks

In the CI pipeline, use the correct Terraform version and production backend.

```
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=tfplan
```

Run configured linting and security scans too. Store the plan securely because it may contain sensitive values.

Step 4 — Review the Terraform plan

Check exactly what Terraform will create, update, replace, or destroy. Confirm the target account, region, workspace or environment, and state file. Investigate unexpected replacements or deletions before proceeding.

Step 5 — Obtain production approval

The change manager or authorized approver reviews the plan, change ticket, impact, backup or rollback plan, and deployment window. The pipeline must pause until approval is granted.

Step 6 — Apply the approved plan

Deploy the exact reviewed saved plan, not a newly generated unreviewed plan.

```
terraform apply tfplan
```

Use the production pipeline's authorized identity, exclusive state locking, and deployment controls.

Step 7 — Verify production

Check Terraform output and state, cloud resource status, application health, monitoring alerts, logs, and connectivity. Compare against the agreed acceptance criteria before closing the change ticket.

## 2. Critical scenario: Terraform apply fails halfway

Example: Terraform creates an EC2 instance and security group successfully, but fails while creating another resource because of an IAM permission error.

The most important rule: Do not blindly rerun Terraform, destroy everything, or manually edit the state file.

Step 1 — Stop and assess the impact

Check the pipeline logs and AWS console. Identify which resources were created, which failed, and whether the application or existing production traffic is affected. Notify the team if there is production impact.

Step 2 — Check Terraform state

Terraform often records successfully created resources in the state, even if a later resource fails. Check the current state and cloud resources to understand what exists.

```
terraform state list
terraform state show aws_instance.app
```

Replace the example resource address with the actual one from your configuration.

Step 3 — Fix the root cause

For example, if the error is `AccessDenied`, correct the missing IAM permission through the approved process. If it is a quota, configuration, or dependency issue, fix that specific problem. Do not grant excessive permissions just to make the pipeline pass.

Step 4 — Generate and review a fresh plan

```
terraform plan -out=tfplan
```

Review the new plan carefully. It may propose to keep existing resources, create missing ones, update resources, or replace something. A previously saved plan may no longer be suitable after a failed apply.

Step 5 — Get the required approval and continue

If the production change or recovery requires approval, obtain it again according to the change policy. Apply the newly reviewed plan through the controlled pipeline.

Step 6 — Verify and close

Confirm that the resources and application are healthy, the state matches the real infrastructure, monitoring is normal, and the change ticket contains the failure reason and recovery actions.

### What if production is already broken?

- Stop further risky changes and follow the incident process.
- If needed, restore service using the team's tested recovery procedure or a reviewed Terraform change that restores the previous known-good configuration.
- Restore data from backups if data has been lost or corrupted; Terraform itself is not a transactional rollback system.
- Do not assume reverting a Git commit automatically restores the old infrastructure. Review and approve the resulting Terraform plan first.
- Never force-unlock the state unless you have confirmed that the lock is stale and no Terraform operation is still running.

## 3. Post-deployment verification checklist

Use this checklist after a successful apply.

Production verification

0 of 8

Terraform apply completed successfully

Expected resources and configuration are present in AWS/Azure

No unexpected resource replacements or deletions occurred

Application health endpoint or smoke test passes

Network, security group, IAM and connectivity checks pass

Logs, metrics and alerts show no new critical issues

Terraform state and cloud resources are consistent

Change ticket updated with plan, approval, result and evidence

## 4. Interview-ready answer

You can say this in simple English:

> “First, I commit my Terraform changes to a feature branch and raise a pull request. After code review, the CI pipeline runs formatting, validation, security checks, and Terraform plan. I carefully review the plan for unexpected changes, especially resource replacements and deletions.
>
> For production, I obtain the required change approval before applying the reviewed saved plan. After deployment, I verify the resources, application health, logs, monitoring, and Terraform state.
>
> If Terraform apply fails halfway, I check the pipeline logs, current state, and actual cloud resources. I fix the root cause, generate a fresh plan, review it, and obtain any required approval before continuing. If production is affected, I follow the incident and recovery process. I never blindly rerun, destroy resources, or manually modify state. Finally, I verify service health and document the outcome in the change ticket.”

Remember: Terraform apply success does not automatically mean the application is healthy. Always verify both the infrastructure and the application.