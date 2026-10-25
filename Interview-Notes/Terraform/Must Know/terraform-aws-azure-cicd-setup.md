# End-to-end DevOps setup: Terraform + AWS + Azure + CI/CD

I'll explain this as a real DevOps project, in simple English, from infrastructure setup to running Terraform through a pipeline.

The main concept is: don't store cloud credentials in your Terraform code. Give the machine or pipeline a secure identity, grant that identity the required permissions, and let Terraform use it.

You can implement this pattern for both AWS and Azure. The authentication mechanism differs:

- AWS: IAM Role attached to an EC2 instance, using temporary credentials.
- Azure: Managed Identity attached to an Azure VM, using Microsoft Entra ID.
- CI/CD: A self-hosted agent installed on the VM runs Terraform, Git commands and pipeline jobs.

## 1. Understand the architecture

Git repository

Terraform code, variables and pipeline YAML

Code pushed to repository

CI/CD pipeline

Azure DevOps or another supported pipeline system

Runs jobs on a self-hosted agent

AWS EC2

IAM Role

Temporary AWS credentials

Terraform → AWS

Azure VM

Managed Identity

Microsoft Entra token

Terraform → Azure

Remote Terraform state

AWS: S3 bucket · Azure: Blob Storage

One important design choice: you can use an EC2 instance for AWS jobs and an Azure VM for Azure jobs, or use a properly secured self-hosted agent on one platform to deploy to the other cloud. Cross-cloud access needs its own identity configuration and permissions.

# 2. AWS implementation — EC2 + IAM Role + Terraform

## Step 1: Create an EC2 instance

In AWS Console:

1. Open EC2 → Launch Instance.
2. Select Ubuntu Server or Amazon Linux.
3. Choose an instance type suitable for your agent workload.
4. Configure networking and security groups.
5. Attach an IAM instance profile to the instance.
6. Launch the instance.

The IAM instance profile supplies an IAM role to the EC2 instance. Terraform can obtain temporary credentials through the EC2 Instance Metadata Service rather than using access keys stored in a file.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



## Step 2: Create an IAM role

Create a role that EC2 can assume.

- Trusted entity: AWS service.
- Use case: EC2.
- Attach only the permissions needed for the resources Terraform will manage.
- Attach the role to the EC2 instance.

For example, if Terraform manages a VPC, the role needs appropriate VPC permissions. If it manages EC2 instances, it needs the necessary EC2 permissions. Add `iam:PassRole` only if the deployment needs to pass a role to another AWS service.

Do not give the role unrestricted administrator permissions just to make the pipeline work.

## Step 3: Create an S3 bucket for Terraform state

Create an S3 bucket separately before initializing the main Terraform project.

Recommended configuration:

- Block public access.
- Enable versioning.
- Enable encryption.
- Restrict access to the Terraform execution role.
- Enable native S3 state locking with a supported Terraform version.

The bucket is the remote backend; it is separate from the resources managed by your application Terraform code.

## Step 4: Configure the Terraform project

Suggested directory structure:

terraform-aws/

`main.tf`

AWS resources

`providers.tf`

AWS provider

`backend.tf`

S3 state backend

`variables.tf`

Inputs

`backend.tf`

```

terraform {
  backend "s3" {
    bucket       = "my-company-terraform-state"
    key          = "prod/terraform.tfstate"
    region       = "ap-south-1"
    use_lockfile = true
  }
}

```

Replace the example bucket with your actual bucket. `use_lockfile = true` uses native S3 locking in supported Terraform versions.

`providers.tf`

```

provider "aws" {
  region = "ap-south-1"
}

```

Notice that there is no `access_key` or `secret_key` in the provider. When Terraform runs on the EC2 instance, the AWS provider can use the attached IAM role automatically.

`main.tf` — example resource:

```

resource "aws_s3_bucket" "app" {
  bucket = "my-company-demo-app-bucket-12345"
}

```

Use a globally unique bucket name. This is just a demonstration resource.

## Step 5: Install Terraform and verify authentication

Install Terraform and Git on the EC2 instance, then clone the repository.

Check the instance role:

```
aws sts get-caller-identity
```

This should return the AWS account and assumed-role identity. Then run:

```
terraform init
terraform fmt -check
terraform validate
terraform plan
```

If permissions and configuration are correct, Terraform should initialize the backend and generate a plan.

Do not run the example resource in production without reviewing the plan and confirming the target account and bucket names.

## Step 6: Add Azure DevOps CI/CD

If your company uses Azure DevOps, install a self-hosted Azure Pipelines agent on the EC2 instance and register it with your Azure DevOps agent pool. Microsoft documents the Linux agent setup and running it as a service.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://learn.microsoft.com\&sz=32)

Microsoft Learn



Example pipeline:

```

trigger:
  branches:
    include:
      - main

pool:
  name: AWS-Terraform-Agents

steps:
  - checkout: self

  - script: terraform init
    workingDirectory: terraform-aws
    displayName: Initialize Terraform

  - script: terraform fmt -check
    workingDirectory: terraform-aws
    displayName: Check formatting

  - script: terraform validate
    workingDirectory: terraform-aws
    displayName: Validate Terraform

  - script: terraform plan
    workingDirectory: terraform-aws
    displayName: Create Terraform plan

```

This pipeline assumes Terraform is installed on the agent and the agent's EC2 instance has the correct IAM role. Add a reviewed, controlled apply stage for actual deployment.

# 3. Azure implementation — VM + Managed Identity + Terraform

The Azure implementation follows the same design, but AWS IAM roles are replaced with Azure Managed Identity and Azure RBAC.

## Step 1: Create an Azure VM

In Azure Portal:

1. Create a Resource Group.
2. Create an Ubuntu Linux VM.
3. Configure networking and restricted administrative access.
4. Enable a system-assigned Managed Identity under the VM's Identity settings.
5. Save the configuration.

A system-assigned identity is associated with the VM's lifecycle. Azure manages its credentials automatically.

## Step 2: Assign permissions to the identity

Assign the VM's managed identity the required roles.

| Role                          | Scope and purpose                                                    |
| ----------------------------- | -------------------------------------------------------------------- |
| Storage Blob Data Contributor | Read and write the Terraform state in the designated container       |
| Contributor                   | Manage required Azure resources at an appropriately restricted scope |
| Additional roles              | Only when required for specific services or role assignments         |

You should keep the state-storage permission separate from infrastructure permissions where practical.

For a production environment, use the narrowest scope possible. Avoid giving the VM identity broad subscription-wide permissions if it only manages one resource group.

## Step 3: Create Azure Blob Storage for Terraform state

Create the following before initializing your workload configuration:

- Storage Account.
- Private Blob container named `tfstate`.
- Appropriate network and identity access controls.
- Storage protection such as versioning and recovery features, where supported by your design.

The backend storage must exist before Terraform can initialize it.

## Step 4: Configure the backend

`backend.tf`

```

terraform {
  backend "azurerm" {
    use_msi              = true
    use_azuread_auth     = true
    storage_account_name = "yourtfstateaccount"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}

```

- `use_msi = true`: use the VM's Managed Identity.
- `use_azuread_auth = true`: authenticate to Blob Storage using Microsoft Entra ID.
- `storage_account_name`: existing Storage Account.
- `container_name`: existing Blob container.
- `key`: state file name.

For a system-assigned identity, you do not need to set `client_id`. HashiCorp documents this authentication method for compute-attached identities. Depending on the backend/provider version and configuration, the tenant or subscription context may still need to be supplied through non-secret environment variables.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.hashicorp.com\&sz=32)

HashiCorp Developer

+1



## Step 5: Configure the Azure provider

`providers.tf`

```

provider "azurerm" {
  features {}
  use_msi = true
}

```

Set the required subscription context in the VM's execution environment if it is not automatically resolved:

```
export ARM_USE_MSI=true
export ARM_SUBSCRIPTION_ID="your-subscription-id"
export ARM_TENANT_ID="your-tenant-id"
```

The tenant and subscription IDs are identifiers, not passwords. Environment variables avoid hardcoding them into reusable provider configuration. The provider documentation describes Managed Identity authentication and the associated environment variables.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://registry.terraform.io\&sz=32)

Terraform Registry

+1



## Step 6: Create an Azure resource

`main.tf`

```

resource "azurerm_resource_group" "demo" {
  name     = "rg-terraform-demo"
  location = "Central India"
}

```

The managed identity must have permission to create the resource group at the relevant scope. A role scoped only to an existing resource group may not permit creating a new resource group.

## Step 7: Verify authentication and run Terraform

On the VM, install Azure CLI, Terraform and Git.

For a system-assigned identity, you can test Azure authentication with:

```
az login --identity
az account show
```

Then run Terraform:

```
terraform init
terraform fmt -check
terraform validate
terraform plan
```

If the backend or provider reports an authentication error, check the identity configuration, role assignments, subscription context and network access. The Azure CLI test is useful for troubleshooting, but the Terraform backend must still be configured to use Managed Identity or another supported authentication method.

## Step 8: Run Azure Terraform through Azure DevOps

Install a self-hosted Azure Pipelines agent on the Azure VM and register it in a pool such as `Azure-Terraform-Agents`.

Your pipeline can then run on that agent:

```

trigger:
  branches:
    include:
      - main

pool:
  name: Azure-Terraform-Agents

steps:
  - checkout: self

  - script: terraform init
    workingDirectory: terraform-azure
    displayName: Initialize Terraform

  - script: terraform fmt -check
    workingDirectory: terraform-azure
    displayName: Check formatting

  - script: terraform validate
    workingDirectory: terraform-azure
    displayName: Validate Terraform

  - script: terraform plan
    workingDirectory: terraform-azure
    displayName: Create Terraform plan

```

This assumes the agent has Terraform installed, the managed identity is enabled, and the backend and provider configurations are correct.

For production, add a protected approval before applying changes. Make sure the apply stage uses the exact reviewed plan, rather than generating a different plan after approval.

# 4. Compare AWS and Azure

| Feature                | AWS                           | Azure                           |
| ---------------------- | ----------------------------- | ------------------------------- |
| Execution machine      | EC2 instance                  | Azure VM                        |
| Identity               | IAM Role / instance profile   | Managed Identity                |
| Credential retrieval   | EC2 Instance Metadata Service | Azure Managed Identity endpoint |
| Permission model       | IAM policies                  | Azure RBAC                      |
| Terraform state        | S3 bucket                     | Blob container                  |
| Backend locking        | S3 lock file                  | Azure Blob native locking       |
| Authentication secrets | No static keys required       | No client secret required       |
| Pipeline               | Self-hosted agent             | Self-hosted agent               |

## 5. What if you want one Azure DevOps pipeline for both clouds?

You can create one repository with separate Terraform folders and pipeline stages:

Azure Repos / GitHub

Azure DevOps Pipeline

AWS stage

EC2 self-hosted agent

IAM role

S3 backend

Deploy AWS resources

Azure stage

Azure VM self-hosted agent

Managed Identity

Blob backend

Deploy Azure resources

For example, use this repository structure:

```
infrastructure/
├── aws/
│   ├── backend.tf
│   ├── providers.tf
│   └── main.tf
├── azure/
│   ├── backend.tf
│   ├── providers.tf
│   └── main.tf
└── azure-pipelines.yml
```

You can use separate jobs or stages with separate agent pools. Keep AWS and Azure state isolated, and ensure each job runs only against its intended environment.

A single VM can sometimes deploy to both clouds, but that requires both cloud identities to be available and securely configured. For stronger isolation, separate agents and narrowly scoped permissions are preferable.

## 6. Common production mistakes to avoid

- Do not store AWS access keys, Azure client secrets, or state files in Git.
- Do not assume that access to the cloud provider automatically grants access to the remote state backend.
- Do not let untrusted pull requests run on an agent with production credentials.
- Do not give a self-hosted agent unrestricted access to production resources.
- Do not run `terraform apply` or `terraform destroy` automatically against production without appropriate controls.
- Do not share the same state file across development, QA and production.

## 7. Interview-ready explanation

You can explain the entire design in about one minute:

“I set up a self-hosted Azure DevOps agent on an EC2 instance for AWS deployments and on an Azure VM for Azure deployments. For AWS, I attach an IAM role to the EC2 instance, and Terraform obtains temporary credentials automatically. For Azure, I enable a Managed Identity on the VM and assign the required RBAC roles. I store Terraform state remotely in S3 for AWS and Azure Blob Storage for Azure. The pipeline runs initialization, validation and planning, followed by an approved apply stage. This avoids static credentials, supports team collaboration and gives us controlled, repeatable infrastructure deployments.”

Official references:

- [AWS provider authentication](https://github.com/hashicorp/terraform-provider-aws?utm_source=chatgpt.com)
- [Terraform S3 backend](https://developer.hashicorp.com/terraform/language/backend/s3?utm_source=chatgpt.com)
- [Terraform Azure backend](https://developer.hashicorp.com/terraform/language/backend/azurerm?utm_source=chatgpt.com)
- [Azure Managed Identity provider setup](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/managed_service_identity.html?utm_source=chatgpt.com)
- [Azure DevOps self-hosted Linux agents](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/linux?utm_source=chatgpt.com)

Would you like a daily reminder to practise this AWS-and-Azure Terraform project, with one hands-on task and interview questions each day?