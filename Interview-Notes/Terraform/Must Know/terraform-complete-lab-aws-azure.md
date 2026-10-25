# Terraform complete lab: AWS + Azure

I'll give you one practical Terraform project structure that covers the fundamentals using both AWS and Azure resources. You can study each topic, run the commands, and use the examples for DevOps interviews.

The lab will include:

- AWS: VPC, subnet, security group, EC2, IAM, S3.
- Azure: Resource Group, Virtual Network, subnet, Network Security Group, Linux Virtual Machine.
- Terraform fundamentals: providers, versions, variables, outputs, data blocks, `for_each`, `count`, conditions, locals, modules, lifecycle, dependencies, import and state.

Important: AWS and Azure resources can both be managed by Terraform, but you need credentials for both cloud accounts. To keep the first lab manageable, create AWS and Azure resources in separate folders or enable only one cloud at a time. Real resources may incur charges.

## 1. Recommended project structure

```
terraform-project/
├── main.tf
├── variables.tf
├── outputs.tf
├── providers.tf
├── versions.tf
├── terraform.tfvars
├── modules/
│   ├── aws-ec2/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── azure-vm/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    ├── dev/
    └── prod/
```

Here is what each file does:

| File               | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `versions.tf`      | Defines Terraform and provider version requirements |
| `providers.tf`     | Configures AWS and Azure providers                  |
| `main.tf`          | Defines resources and calls modules                 |
| `variables.tf`     | Declares configurable inputs                        |
| `terraform.tfvars` | Supplies environment-specific values                |
| `outputs.tf`       | Displays useful results                             |
| `modules/`         | Contains reusable infrastructure code               |

Keep credentials out of `terraform.tfvars` and source control. Use AWS IAM roles or profiles, and Azure CLI or managed identity authentication where appropriate.

## 2. File 1 — `versions.tf`

This file defines which Terraform and provider versions the project supports.

```
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}
```

Explanation

- `required_version`: Terraform CLI version constraint.
- `required_providers`: tells Terraform which cloud plugins to install.
- `~> 6.0`: allows compatible AWS provider 6.x versions below 7.0.
- `~> 4.0`: allows compatible AzureRM provider 4.x versions below 5.0.

Terraform downloads these providers when you run `terraform init`. See the official [Terraform version and provider guidance](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/aws-create?utm_source=chatgpt.com).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.hashicorp.com\&sz=32)

HashiCorp Developer



## 3. File 2 — `providers.tf`

```
provider "aws" {
  region = var.aws_region
}

provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
}
```

Explanation

- `provider "aws"` configures AWS.
- `region` decides where AWS resources will be created.
- `provider "azurerm"` configures Azure.
- `features {}` is required by the AzureRM provider.
- `subscription_id` identifies your Azure subscription.

Authenticate before running Terraform:

```
# AWS: use a configured profile or IAM role
aws configure
aws sts get-caller-identity

# Azure: sign in with Azure CLI
az login
az account show
```

Use approved organizational authentication for production. Avoid hardcoding access keys or passwords.

### Why `features {}` in the AzureRM provider

Terraform mein Azure provider ke andar `features {}` block isliye hota hai kyunki AzureRM provider ko apni kuch specific behaviors aur service-related settings configure karne ke liye ye block chahiye hota hai.

Example

```
provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
}
```

Simple explanation

* `provider "azurerm"` — Terraform ko batata hai ki Azure use karna hai.
* `features {}` — AzureRM provider ke feature-specific behavior settings ka block hai.
* `subscription_id` — batata hai ki kis Azure subscription mein resources deploy karne hain.

Important: `features {}` empty hone par bhi valid hai. Iska matlab ye nahi hai ki saare Azure features enable ho rahe hain. Ye provider ki required configuration ka part hai.

Interview question

Q: Why do we use `features {}` in the AzureRM provider?

Answer: "The `features {}` block is required by the AzureRM provider. It allows us to configure provider-specific behavior for Azure resources. It can remain empty when we don't need to customize those behaviors."

Example with a feature setting:

```
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }

  subscription_id = var.azure_subscription_id
}
```

In this example, Terraform prevents deleting a Resource Group through the provider when it still contains resources. This is a safety behavior, not a general Azure permission.

## 4. File 3 — `variables.tf`

Variables let you reuse the same Terraform code with different values.

```
variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1"
}

variable "aws_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "aws_ssh_cidr" {
  description = "Your public IP in CIDR format, such as 203.0.113.10/32"
  type        = string
}

variable "azure_subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "azure_location" {
  type    = string
  default = "Central India"
}

variable "azure_admin_username" {
  type    = string
  default = "azureadmin"
}

variable "azure_ssh_cidr" {
  description = "Your public IP in CIDR format"
  type        = string
}

variable "admin_ssh_public_key" {
  description = "Contents of your SSH public key"
  type        = string
}
```

Interview point: A variable is an input. You can set it through a default, a `.tfvars` file, an environment variable, or the command line.

## 5. File 4 — `terraform.tfvars`

```
aws_region         = "ap-south-1"
aws_instance_type  = "t3.micro"
aws_ssh_cidr       = "YOUR_PUBLIC_IP/32"

azure_subscription_id = "YOUR-AZURE-SUBSCRIPTION-ID"
azure_location        = "Central India"
azure_admin_username  = "azureadmin"
azure_ssh_cidr        = "YOUR_PUBLIC_IP/32"

admin_ssh_public_key = "ssh-ed25519 YOUR_PUBLIC_KEY"
```

Replace the placeholders with your actual values. You can find your public IP using a trusted IP-checking service. Do not use `0.0.0.0/0` for SSH access in this lab, and never commit real secrets or private keys to Git.

## 6. File 5 — `main.tf` (AWS + Azure lab)

This baseline creates an AWS network and EC2 instance, plus an Azure network and Linux VM. It uses the selected cloud providers and common Terraform resource patterns. AWS AMIs are looked up dynamically; Azure VM image details are specified explicitly.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.hashicorp.com\&sz=32)

HashiCorp Developer

+1



AWS resources

```
# 1. AWS VPC
resource "aws_vpc" "main" {
  cidr_block = "10.10.0.0/16"

  tags = {
    Name = "lab-vpc"
  }
}

# 2. AWS subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.10.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "lab-public-subnet"
  }
}

# 3. Internet gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

# 4. Route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# 5. Security group
resource "aws_security_group" "ssh" {
  name   = "lab-ssh-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    description = "SSH from approved IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.aws_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 6. Data block: find the latest matching Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# 7. EC2 instance
resource "aws_instance" "web" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.aws_instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.ssh.id]
  associate_public_ip_address = true

  tags = {
    Name        = "lab-ec2"
    Environment = "dev"
  }

  lifecycle {
    prevent_destroy = true
  }
}
```

### What this AWS code teaches you

| Code                   | Meaning                                          |
| ---------------------- | ------------------------------------------------ |
| `resource "aws_vpc"`   | Creates a VPC                                    |
| `aws_subnet`           | Creates a subnet inside the VPC                  |
| `aws_internet_gateway` | Provides a gateway for internet routing          |
| `aws_route_table`      | Defines the default internet route               |
| `aws_security_group`   | Controls inbound and outbound traffic            |
| `data "aws_ami"`       | Finds an existing AMI; does not create one       |
| `aws_instance`         | Creates the EC2 instance                         |
| `lifecycle`            | Controls Terraform's resource lifecycle behavior |

Important: `prevent_destroy = true` blocks Terraform from destroying this EC2 instance while that lifecycle rule remains in its configuration. Remove the rule deliberately when you need to destroy the lab.

Azure resources

```
# 1. Resource group
resource "azurerm_resource_group" "lab" {
  name     = "rg-terraform-lab"
  location = var.azure_location
}

# 2. Virtual network
resource "azurerm_virtual_network" "main" {
  name                = "vnet-terraform-lab"
  address_space       = ["10.20.0.0/16"]
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name
}

# 3. Subnet
resource "azurerm_subnet" "main" {
  name                 = "subnet-vm"
  resource_group_name  = azurerm_resource_group.lab.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.20.1.0/24"]
}

# 4. Public IP
resource "azurerm_public_ip" "vm" {
  name                = "pip-terraform-lab"
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

# 5. Network security group
resource "azurerm_network_security_group" "vm" {
  name                = "nsg-terraform-lab"
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name

  security_rule {
    name                       = "Allow-SSH-Approved-IP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.azure_ssh_cidr
    destination_address_prefix = "*"
  }
}

# 6. Network interface
resource "azurerm_network_interface" "vm" {
  name                = "nic-terraform-lab"
  location            = azurerm_resource_group.lab.location
  resource_group_name = azurerm_resource_group.lab.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm.id
  }
}

# 7. Attach the NSG to the NIC
resource "azurerm_network_interface_security_group_association" "vm" {
  network_interface_id      = azurerm_network_interface.vm.id
  network_security_group_id = azurerm_network_security_group.vm.id
}

# 8. Linux VM
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "vm-terraform-lab"
  resource_group_name = azurerm_resource_group.lab.name
  location            = azurerm_resource_group.lab.location
  size                = "Standard_B1s"
  admin_username      = var.azure_admin_username

  disable_password_authentication = true

  network_interface_ids = [
    azurerm_network_interface.vm.id
  ]

  admin_ssh_key {
    username   = var.azure_admin_username
    public_key = var.admin_ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  identity {
    type = "SystemAssigned"
  }
}
```

### How Azure resource dependencies work

For the Azure VM, Terraform follows the references to build resources in the correct order:

`Resource Group → VNet → Subnet → NIC → Linux VM`

The public IP and NSG association are also created as required. Terraform infers these dependencies from resource references. The VM has a system-assigned managed identity, but it does not automatically grant permissions to other Azure resources.

Cost and security note: The VM size must be available in your subscription and region. A public IP and VM can incur charges. For a safer production design, prefer private access through a bastion or VPN rather than exposing SSH publicly.

## 7. File 6 — `outputs.tf`

Outputs display useful information after deployment.

```
output "aws_instance_id" {
  value = aws_instance.web.id
}

output "aws_public_ip" {
  value = aws_instance.web.public_ip
}

output "azure_resource_group" {
  value = azurerm_resource_group.lab.name
}

output "azure_vm_public_ip" {
  value = azurerm_public_ip.vm.ip_address
}

output "azure_vm_private_ip" {
  value = azurerm_network_interface.vm.private_ip_address
}
```

Example: After `terraform apply`, run:

```
terraform output
terraform output -raw aws_public_ip
```

An output is useful for passing an IP address, resource ID, or DNS name to another workflow. Avoid exposing credentials or secret values through outputs.

## 8. Must-know Terraform code examples

These are separate learning snippets. Add and test each one in an appropriate test configuration rather than blindly adding duplicate resource blocks to your main lab.

## Choose a topic to study

Select any topic to see its code and a simple explanation.

1Provider and version constraints2Variables and outputs3AWS EC2 resource4Data block5for_each and count6Conditional expression7Local values8Remote state: AWS S39Module call10Dynamic block and filtering11Lifecycle rules12Explicit dependency13Import existing infrastructure14Moved block15Azure Linux VM pattern

### Moved block

moved {\
&#x20; from = aws_instance.old_web\
&#x20; to   = aws_instance.web\
}

&#x20;Copy code

Explanation

Records a resource address change during a refactor, helping Terraform retain the existing object instead of treating it as a new address.

Previous

Next topic&#x20;

## 9. Essential Terraform commands

Run these commands from the directory containing your `.tf` files.

| Command                    | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `terraform init`           | Downloads providers and initializes the backend      |
| `terraform fmt -recursive` | Formats Terraform files, including subdirectories    |
| `terraform validate`       | Checks configuration syntax and internal consistency |
| `terraform plan`           | Previews the proposed infrastructure changes         |
| `terraform apply`          | Creates or updates resources                         |
| `terraform destroy`        | Plans to delete managed resources                    |
| `terraform state list`     | Lists resource addresses recorded in state           |
| `terraform output`         | Displays declared outputs                            |

### Recommended lab execution order

```
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=lab.tfplan
terraform apply lab.tfplan

terraform state list
terraform output
```

After you finish testing, remove `prevent_destroy` from the AWS instance configuration if you intend to delete it. Then review the destroy plan before proceeding.

```
terraform plan -destroy
terraform destroy
```

Do not run `terraform destroy` against a shared or production workspace. The lab creates real cloud resources, so verify that cleanup completed in both AWS and Azure.

## 10. Production concepts to remember

- State: Tracks the relationship between Terraform configuration and real resources.
- Remote backend: Lets teams share state safely; use locking, encryption, versioning, and access controls.
- Plan before apply: Review what will be created, changed, or destroyed.
- Secrets: Marking a value `sensitive` hides it in normal output but does not guarantee it is absent from state.
- Modules: Reuse standard infrastructure patterns across dev, test, and production.
- Drift: Run `terraform plan` to detect differences between declared configuration and actual infrastructure.
- Import: Bring existing infrastructure under Terraform management; importing does not automatically generate a complete configuration for you.

For more detail, use the official [AWS Terraform tutorial](https://developer.hashicorp.com/terraform/tutorials/aws-get-started?utm_source=chatgpt.com) and [Azure Linux VM Terraform quickstart](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-terraform?utm_source=chatgpt.com).&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.hashicorp.com\&sz=32)

HashiCorp Developer

+1



My recommendation: First get the AWS VPC + EC2 lab working, then the Azure Resource Group + VNet + VM lab, and then practice modules, remote state, import, and lifecycle rules. That sequence gives you a strong foundation for DevOps interviews and production change discussions.