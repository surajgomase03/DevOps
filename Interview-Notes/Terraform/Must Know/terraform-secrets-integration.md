# Secrets Integration with Terraform — Production Approach

In production, we should never hardcode passwords, API keys, database credentials, or cloud access keys inside Terraform code or Git.

As a Terraform Engineer, you should know how to integrate secrets with:

- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- CI/CD pipeline secret variables
- IAM roles, Azure Managed Identity, or workload identity federation to avoid static cloud credentials

The best approach is to let Terraform authenticate using an identity and retrieve only the secrets it needs, with least-privilege access.

## 1. AWS Secrets Manager integration

Example: Your application database password is stored in AWS Secrets Manager, and Terraform needs to read it.

Git repository

Terraform code — no password stored

IAM role / instance profile

Authenticates Terraform without static AWS keys

AWS Secrets Manager

Stores the database password securely

Terraform / application

Receives the secret only where required

### Step 1 — Store a secret in AWS

Create a secret in AWS Secrets Manager, for example:

- Secret name: `prod/db-credentials`
- Secret value: JSON containing the database username and password

Terraform should use an EC2 instance profile, an IAM role, or another approved AWS identity to authenticate. Give that identity only the permissions it needs to read the relevant secret.

### Step 2 — Read the secret in Terraform

```
provider "aws" {
  region = "ap-south-1"
}

data "aws_secretsmanager_secret_version" "db" {
  secret_id = "prod/db-credentials"
}

locals {
  db_credentials = jsondecode(
    data.aws_secretsmanager_secret_version.db.secret_string
  )
}

variable "db_password" {
  type      = string
  sensitive = true
}
```

This demonstrates retrieving and decoding a secret. In a real configuration, avoid unnecessary secret retrieval and pass credentials only to the resource that genuinely requires them.

Important production warning: reading a secret through a Terraform data source can store its value in Terraform state and plan files. The `sensitive` flag hides values in some CLI output; it does not prevent them from being stored in state. Protect your state backend and plan artifacts accordingly.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.aws.amazon.com\&sz=32)

AWS Prescriptive Guidance

+2



## 2. Azure Key Vault integration

The Azure equivalent is to store secrets in Azure Key Vault and grant the Terraform execution identity access to the required secret.

```
provider "azurerm" {
  features {}
}

data "azurerm_key_vault" "existing" {
  name                = "my-prod-keyvault"
  resource_group_name = "prod-rg"
}

data "azurerm_key_vault_secret" "db_password" {
  name         = "db-password"
  key_vault_id = data.azurerm_key_vault.existing.id
}

output "password" {
  value     = data.azurerm_key_vault_secret.db_password.value
  sensitive = true
}
```

This is a learning example, not the preferred way to deliver an application password. The secret value can still be present in Terraform state.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://registry.terraform.io\&sz=32)

Terraform Registry

+1



For a production setup, use a managed identity or workload identity federation where supported, and grant access through Key Vault's configured authorization model.

## 3. Best production design

Terraform identity

Authenticates without hardcoded cloud credentials.

Secrets Manager / Key Vault

Stores and rotates passwords and API keys.

Application retrieves its secret at runtime

The application uses its own IAM role or managed identity, avoiding unnecessary exposure of secret values to Terraform.

## 4. Interview questions you should be ready for

- Where do you store secrets? AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault.
- How does Terraform authenticate? IAM role, managed identity, or workload identity federation rather than static credentials.
- Does `sensitive = true` encrypt the secret? No. It primarily redacts supported output; state and plan files still need protection.
- How do you rotate passwords? Use the secret manager's rotation process and ensure applications can handle the updated credentials.
- What if a secret leaks into Git? Revoke or rotate it immediately, investigate exposure, and remove it from the repository history as appropriate. Removing the text alone does not invalidate the credential.

Production recommendation: Let Terraform create infrastructure and permissions; whenever possible, let the running application retrieve its own secrets directly from the secret manager.