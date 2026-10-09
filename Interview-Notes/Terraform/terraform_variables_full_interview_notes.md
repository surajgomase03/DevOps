# Terraform Variables --- Complete Interview Preparation Notes

**Topic:** Terraform Variables (1.5--1.6)\
**Target:** DevOps Engineer interview preparation\
**Coverage:** Fundamentals, data types, declaration and assignment,
precedence, locals, outputs, CI/CD, security, troubleshooting, and
interview questions.

------------------------------------------------------------------------

## 1. What Are Terraform Variables?

Terraform variables let you parameterize Infrastructure as Code (IaC)
instead of hardcoding values in every resource.

Without variables:

``` hcl
resource "aws_instance" "web" {
  ami           = "ami-xxxxxxxx"
  instance_type = "t3.micro"
}
```

With variables:

``` hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
}
```

### Benefits

-   Reuse the same Terraform code across multiple environments.
-   Avoid hardcoding environment-specific configuration.
-   Improve maintainability and readability.
-   Enforce data types and validation rules.
-   Integrate infrastructure configuration with CI/CD pipelines.
-   Standardize infrastructure deployments.

## 2. Input Variables, Locals, and Outputs

  -------------------------------------------------------------------------------
  Construct         Syntax            Purpose           Example
  ----------------- ----------------- ----------------- -------------------------
  Input variable    `variable {}`     Accepts           `var.instance_type`
                                      configuration     
                                      from outside the  
                                      module            

  Local value       `locals {}`       Computes or       `local.name_prefix`
                                      reuses            
                                      expressions       
                                      inside a module   

  Output value      `output {}`       Exposes selected  `module.network.vpc_id`
                                      results from a    
                                      module            
  -------------------------------------------------------------------------------

**Remember:** Input variables receive configuration, locals process or
reuse configuration, and outputs return selected results.

``` hcl
variable "environment" {
  type    = string
  default = "dev"
}

locals {
  name_prefix = "app-${var.environment}"
}

output "resource_prefix" {
  value = local.name_prefix
}
```

If `environment = "prod"`, the output value is `app-prod`.

## 3. `variables.tf` vs `terraform.tfvars`

### `variables.tf` --- declaration

Declares the variable, its type, description, default value, validation
rules, and other settings.

``` hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}
```

### `terraform.tfvars` --- assignment

Supplies an actual value for the declared variable.

``` hcl
instance_type = "t3.medium"
```

### `main.tf` --- usage

``` hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
}
```

The `ami_id` variable must also be declared and assigned a valid value.

### Complete flow

1.  **Declare** the input variable in a `.tf` file, conventionally
    `variables.tf`.
2.  **Assign** its value in `terraform.tfvars`, another `.tfvars` file,
    an environment variable, a CLI argument, or another supported input
    source.
3.  **Use** it in configuration through `var.name`.
4.  Run `terraform plan`, review the proposed changes, and apply only
    when appropriate.

> Important: `variables.tf` and `terraform.tfvars` are conventional
> filenames, not mandatory filenames. Terraform loads `.tf` files in the
> root module. A variable assigned in a tfvars file must have a matching
> declaration in the root module.

### Common mistake: undeclared input variable

`terraform.tfvars`:

``` hcl
instance_type = "t3.medium"
```

If there is no `variable "instance_type"` declaration in the root
module, Terraform reports an undeclared input variable error.

**Fix:** Add the matching `variable "instance_type" { ... }`
declaration.

**Rule:** Declare the variable, assign the value, and reference it
correctly.

## 4. Terraform Variable Data Types

### 4.1 Primitive types

  Type       Meaning              Example
  ---------- -------------------- -----------------
  `string`   Text                 `"prod"`
  `number`   Integer or decimal   `3`, `3.5`
  `bool`     Boolean              `true`, `false`

``` hcl
variable "environment" {
  type    = string
  default = "dev"
}

variable "instance_count" {
  type    = number
  default = 2
}

variable "monitoring_enabled" {
  type    = bool
  default = true
}
```

### 4.2 Collection types

  -----------------------------------------------------------------------
  Type                    Description             Example
  ----------------------- ----------------------- -----------------------
  `list(string)`          Ordered values;         `["dev", "prod"]`
                          duplicates allowed      

  `set(string)`           Unique values; no       `["web", "api"]`
                          guaranteed order        

  `map(string)`           Key-value pairs with    `{ env = "prod" }`
                          string values           
  -----------------------------------------------------------------------

**List example:**

``` hcl
variable "availability_zones" {
  type    = list(string)
  default = ["ap-south-1a", "ap-south-1b"]
}
```

Reference an element:

``` hcl
availability_zone = var.availability_zones[0]
```

**Map example:**

``` hcl
variable "instance_types" {
  type = map(string)

  default = {
    dev  = "t3.micro"
    uat  = "t3.small"
    prod = "t3.medium"
  }
}
```

Reference a map entry:

``` hcl
instance_type = var.instance_types["prod"]
```

Lists are useful when order or indexing matters. Maps are useful for
environment-specific configuration.

### 4.3 Complex types: `object` and `tuple`

An `object` contains named attributes with defined types.

``` hcl
variable "server_config" {
  type = object({
    name          = string
    instance_type = string
    monitoring    = bool
  })

  default = {
    name          = "web-server"
    instance_type = "t3.medium"
    monitoring    = true
  }
}
```

Reference an attribute:

``` hcl
instance_type = var.server_config.instance_type
```

A `tuple` is an ordered sequence whose positions can have different
types.

``` hcl
variable "example_tuple" {
  type    = tuple([string, number, bool])
  default = ["prod", 3, true]
}
```

Access its first element:

``` hcl
var.example_tuple[0]
```

This returns `"prod"`.

**Interview tip:** Use `object` for named attributes and `tuple` for a
fixed sequence with positional types.

## 5. Important Arguments in a Variable Block

### `type`

Specifies the expected data type.

``` hcl
variable "instance_type" {
  type = string
}
```

### `default`

Defines a fallback value.

``` hcl
variable "environment" {
  type    = string
  default = "dev"
}
```

Without a default, an input variable is required unless another source
supplies a value.

### `description`

Documents the variable's purpose.

``` hcl
variable "instance_type" {
  type        = string
  description = "EC2 instance size for the application"
}
```

### `sensitive`

Marks a value as sensitive so Terraform redacts it from supported CLI
output.

``` hcl
variable "db_password" {
  type      = string
  sensitive = true
}
```

**Important:** Sensitive marking is not encryption. The value can still
be present in state, plans, or application logs depending on how it is
used.

### `validation`

Enforces custom conditions on the input.

``` hcl
variable "environment" {
  type = string

  validation {
    condition     = contains(["dev", "uat", "prod"], var.environment)
    error_message = "Choose dev, uat, or prod."
  }
}
```

### `nullable`

Controls whether the variable may be `null`.

``` hcl
variable "instance_type" {
  type     = string
  default  = "t3.micro"
  nullable = false
}
```

With `nullable = false`, the variable cannot be set to `null`.

### `ephemeral`

Supported in modern Terraform versions, this marks certain variable
values as ephemeral so Terraform does not persist them in state or plan
files. Its use is restricted to supported contexts.

``` hcl
variable "temporary_token" {
  type      = string
  sensitive = true
  ephemeral = true
}
```

Use this only when the intended use is compatible with Terraform's
ephemeral-value rules. It does not replace secure secret injection or
application-level security.

## 6. Assigning Variable Values

### Method 1: Default value

``` hcl
variable "environment" {
  type    = string
  default = "dev"
}
```

Run:

``` bash
terraform plan
```

If no other source overrides it, Terraform uses `dev`.

### Method 2: `terraform.tfvars`

``` hcl
environment = "prod"
```

Run:

``` bash
terraform plan
```

Terraform automatically loads `terraform.tfvars` from the root module's
working directory.

### Method 3: Custom `.tfvars` file

Create `prod.tfvars`:

``` hcl
environment   = "prod"
instance_type = "t3.medium"
```

Run:

``` bash
terraform plan -var-file="prod.tfvars"
```

Custom files such as `prod.tfvars` are not automatically loaded just
because they have a `.tfvars` extension.

### Method 4: CLI `-var`

``` bash
terraform plan -var="environment=prod"
```

Avoid passing secrets through command-line arguments because they may be
exposed in shell history, process information, or pipeline logs.

### Method 5: Environment variables

``` bash
export TF_VAR_environment="prod"
terraform plan
```

Terraform recognizes the `TF_VAR_` prefix and maps the remaining name to
the input variable.

``` bash
export TF_VAR_instance_count=3
```

This supplies the value for `variable "instance_count"`.

Environment variables can be useful in CI/CD, but secret values should
be handled through protected secret-injection mechanisms.

### Method 6: Automatically loaded variable files

Terraform automatically loads files such as:

``` text
dev.auto.tfvars
prod.auto.tfvars
```

It also recognizes `.auto.tfvars.json` files. If multiple auto-loaded
files assign the same variable, filename ordering can affect the
effective value.

## 7. Variable Precedence: Highest to Lowest

For ordinary Terraform CLI variable inputs, the priority order is:

    Priority Source                                 Example
  ---------- -------------------------------------- -----------------------------------
           1 CLI `-var` and `-var-file` arguments   `-var="environment=prod"`
           2 Auto-loaded `.auto.tfvars` files       `prod.auto.tfvars`
           3 `terraform.tfvars.json`                JSON variable file
           4 `terraform.tfvars`                     Default auto-loaded variable file
           5 Environment variables                  `TF_VAR_environment`
           6 Variable block default                 `default = "dev"`

Within the same priority level, ordering can matter. Later command-line
variable arguments and later lexically ordered auto-loaded files can
override earlier assignments.

Example:

`variables.tf`:

``` hcl
variable "environment" {
  type    = string
  default = "dev"
}
```

`terraform.tfvars`:

``` hcl
environment = "uat"
```

Command:

``` bash
terraform plan -var="environment=prod"
```

The effective value is `prod`.

**Interview scenario:** If production uses an unexpected value, inspect
the pipeline command, supplied variable files, auto-loaded files, and
environment variables before changing the resource configuration.

## 8. Practical Terraform Project Structure

``` text
terraform-project/
├── main.tf
├── variables.tf
├── outputs.tf
├── locals.tf
├── providers.tf
├── versions.tf
├── terraform.tfvars
├── dev.tfvars
├── prod.tfvars
└── .gitignore
```

This is a convention, not a required structure.

-   `main.tf`: resources and data sources.
-   `variables.tf`: input variable declarations.
-   `outputs.tf`: output declarations.
-   `locals.tf`: local expressions.
-   `providers.tf`: provider configuration.
-   `versions.tf`: Terraform and provider version constraints.
-   `*.tfvars`: assigned values.

Example `.gitignore`:

``` gitignore
.terraform/
*.tfstate
*.tfstate.*
*.tfplan
*.tfvars
```

This is a cautious baseline. If you intentionally commit non-sensitive
configuration, allowlist specific safe `.tfvars` files while keeping
secret-bearing files excluded. Never commit credentials or sensitive
state files. Also consider excluding local override files and crash logs
according to your team's workflow.

## 9. Complete Example: Declare → Assign → Use → Output

### Step 1: `variables.tf`

``` hcl
variable "environment" {
  description = "Environment to deploy"
  type        = string

  validation {
    condition     = contains(["dev", "uat", "prod"], var.environment)
    error_message = "Environment must be dev, uat, or prod."
  }
}

variable "ami_id" {
  description = "Valid AMI ID for the target AWS region"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t3.micro"
}

variable "tags" {
  description = "Tags to apply to the instance"
  type        = map(string)
  default     = {}
}
```

### Step 2: `prod.tfvars`

``` hcl
environment   = "prod"
ami_id        = "ami-xxxxxxxx"
instance_type = "t3.medium"

tags = {
  Project     = "payment"
  Environment = "prod"
  ManagedBy   = "Terraform"
}
```

The AMI shown is a placeholder. Replace it with an AMI that exists in
your target AWS region.

### Step 3: `locals.tf`

``` hcl
locals {
  name_prefix = "payment-${var.environment}"

  common_tags = merge(
    var.tags,
    {
      Environment = var.environment
    }
  )
}
```

`merge()` combines maps. When a key appears in both maps, the later
map's value takes precedence.

### Step 4: `main.tf`

``` hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type

  tags = merge(
    local.common_tags,
    {
      Name = local.name_prefix
    }
  )
}
```

### Step 5: `outputs.tf`

``` hcl
output "instance_id" {
  description = "Created EC2 instance ID"
  value       = aws_instance.web.id
}

output "instance_private_ip" {
  description = "Private IP of the EC2 instance"
  value       = aws_instance.web.private_ip
}
```

### Step 6: Execute Terraform

``` bash
terraform init
terraform fmt -check
terraform validate
terraform plan -var-file="prod.tfvars"
terraform apply -var-file="prod.tfvars"
```

Inspect the plan and confirm the proposed changes before applying them
in a real environment.

After successful deployment:

``` bash
terraform output instance_id
terraform output instance_private_ip
```

### What this example demonstrates

-   Input variables make the configuration reusable.
-   Variable validation rejects unsupported environment names.
-   Locals calculate reusable values.
-   Resources consume variables and locals.
-   Outputs expose useful information after deployment.

## 10. Variables with `count` and `for_each`

### Using `count`

``` hcl
variable "instance_count" {
  type    = number
  default = 2
}

resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = var.ami_id
  instance_type = var.instance_type
}
```

If `instance_count = 2`, Terraform manages two instances:

``` text
aws_instance.web[0]
aws_instance.web[1]
```

**Use case:** Creating a specified number of similar instances. Be
careful when changing `count`: removing an index can cause Terraform to
destroy the resource associated with that index.

### Using `for_each`

``` hcl
variable "instance_types" {
  type = map(string)

  default = {
    web = "t3.micro"
    api = "t3.small"
  }
}

resource "aws_instance" "app" {
  for_each      = var.instance_types
  ami           = var.ami_id
  instance_type = each.value

  tags = {
    Name = each.key
  }
}
```

Terraform creates two instances:

``` text
aws_instance.app["web"]
aws_instance.app["api"]
```

**Use case:** Creating resources with meaningful keys such as web, API,
and worker.

Interview tip: `count` uses numeric indexes; `for_each` uses keys or set
elements. `for_each` is often preferable when resources have distinct
identities.

## 11. Variable Validation vs Resource Preconditions

-   **Variable validation:** Checks whether an input value meets the
    rules for that variable.
-   **Preconditions:** Check whether a condition required by a resource
    or data source is true.
-   **Postconditions:** Check whether a result satisfies a condition
    after evaluation.

For example, validating an environment name belongs in a variable block.
Checking a resource-specific requirement can be better expressed as a
resource precondition.

Use the earliest suitable validation point so configuration mistakes are
detected before changes are applied.

## 12. Using Variables in CI/CD Pipelines

A typical production pipeline keeps reusable Terraform code separate
from environment-specific values.

Example Jenkins stage:

``` groovy
stage('Terraform Plan') {
  steps {
    sh '''
      terraform init
      terraform validate
      terraform plan -var-file="prod.tfvars" -out=tfplan
    '''
  }
}
```

A later, appropriately protected deployment stage can apply the reviewed
saved plan:

``` bash
terraform apply tfplan
```

### Production considerations

-   Use a protected branch and appropriate production approvals.
-   Secure the Terraform backend and state access.
-   Pin or constrain Terraform and provider versions.
-   Ensure plan and apply use the same intended configuration and plan
    artifact.
-   Avoid storing sensitive values in Git, logs, or command-line
    arguments.
-   Ensure the correct working directory and variable file are used.
-   Use an appropriate remote backend and locking mechanism for team
    deployments.

A saved plan contains the decisions made during planning. If the
configuration or variable values change, generate and review a new plan
instead of assuming the previous one reflects the latest configuration.

## 13. Six Scenario-Based Interview Questions

Use the structure **problem → root cause → solution → verification →
prevention** when answering scenario questions.

### Scenario 1: Value exists in `terraform.tfvars`, but Terraform reports an undeclared variable

**Root cause:** The variable is assigned a value but not declared in the
root module.

Fix the declaration:

``` hcl
variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t2.micro"
}
```

Keep the assignment in `terraform.tfvars`:

``` hcl
instance_type = "t3.medium"
```

Run:

``` bash
terraform validate
terraform plan
```

**Interview answer:** Check whether the input variable is declared,
verify that the name matches in declaration, assignment, and reference,
then run validation and review the plan. Avoid hardcoding
environment-specific values in resources.

### Scenario 2: Production uses the wrong instance type

Suppose the declaration defaults to `t2.micro`, tfvars assigns
`t3.medium`, but the pipeline runs:

``` bash
terraform apply -var="instance_type=t2.micro"
```

**Root cause:** The CLI `-var` argument overrides the tfvars value.

**Solution:** Remove the unintended override or explicitly supply the
intended value:

``` bash
terraform plan -var="instance_type=t3.medium"
```

Check Jenkins commands, `-var` and `-var-file` arguments, `TF_VAR_`
variables, planned attributes, and final approval.

### Scenario 3: Development works, but production reports a missing variable

The variable has no default, and development supplies `dev.tfvars` while
production accidentally runs `terraform plan` without a file.

**Root cause:** Production does not supply the required value.

**Solution:**

``` bash
terraform plan -var-file="prod.tfvars"
```

Keep environment-specific values separate, explicitly select the right
file, and review the production plan.

### Scenario 4: Terraform accepts an invalid environment name

**Root cause:** The variable lacks validation.

``` hcl
variable "environment" {
  type = string

  validation {
    condition = contains(
      ["dev", "uat", "prod"],
      var.environment
    )
    error_message = "Environment must be dev, uat, or prod."
  }
}
```

Invalid environment names fail variable validation during planning. Do
not remove validation simply to make a pipeline pass.

### Scenario 5: A password appears in Terraform logs or state

**Root cause:** The value may be printed, logged, passed unsafely, or
stored in state. `sensitive = true` does not prevent every form of
exposure.

``` hcl
variable "db_password" {
  type        = string
  description = "Database password"
  sensitive   = true
}
```

Inject the value securely through an approved secret-management
mechanism. Restrict state access, avoid printing secrets, and follow
rotation and incident-response procedures if exposure occurred.

### Scenario 6: A tfvars change is not reflected in the plan

Possible causes include a different working directory, another variable
file, a CLI override, an unused variable, an old saved plan, or editing
a file outside the root module.

Troubleshoot:

``` bash
pwd
ls -la
grep -R 'instance_type' --include='*.tf' .
terraform plan -var-file="prod.tfvars"
```

Review the fresh plan and apply only after confirming the changes.

## 14. Six More Troubleshooting Scenarios

### Scenario 7: Wrong data type

Declaration:

``` hcl
variable "instance_count" {
  type = number
}
```

Incorrect assignment:

``` hcl
instance_count = "three"
```

Fix:

``` hcl
instance_count = 3
```

Check the type, tfvars value, and pipeline input format. Run validation
and planning.

### Scenario 8: Variable declared but not used

Incorrect:

``` hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = "t3.micro"
}
```

Fix:

``` hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
}
```

Generate a fresh plan.

### Scenario 9: Terraform cannot find the variable file

``` bash
pwd
ls -la
find . -maxdepth 3 -name "prod.tfvars"
```

Check the working directory, repository checkout, file path, stage
ordering, and filename capitalization.

### Scenario 10: Variable validation fails

Read the error, inspect the assigned value, check spelling and permitted
values, and correct the input or deliberately update validation if a new
environment is legitimate. Do not remove validation merely to make the
pipeline pass.

### Scenario 11: Sensitive value remains in state

Sensitive marking redacts supported output but does not guarantee the
value is absent from state. Use state access controls, encryption,
secure secret injection, and ephemeral-value features where supported.

### Scenario 12: Wrong variable file selected in production

Inspect the pipeline command, variable file, CLI overrides, and
`TF_VAR_` variables. Verify the AWS account and region independently.
Generate a new plan with the intended production configuration and
require review before applying.

``` bash
terraform plan -var-file="prod.tfvars" -out=tfplan
```

Correct variables do not by themselves guarantee deployment to the
correct AWS account or region. Check provider configuration and
deployment identity too.

## 15. Troubleshooting Commands to Remember

  ----------------------------------------------------------------------------------
  Command                                        Purpose
  ---------------------------------------------- -----------------------------------
  `terraform fmt -check`                         Checks Terraform formatting

  `terraform validate`                           Checks configuration syntax and
                                                 internal consistency

  `terraform plan -var-file="prod.tfvars"`       Reviews changes with a specified
                                                 variable file

  `terraform console`                            Evaluates Terraform expressions
                                                 interactively

  `terraform output`                             Displays root-module outputs

  `pwd`                                          Shows the current directory

  `ls -la`                                       Lists files, including hidden files

  `grep -R 'instance_type' --include='*.tf' .`   Searches Terraform files for
                                                 references
  ----------------------------------------------------------------------------------

Example expression in `terraform console`:

``` hcl
var.environment
```

The console requires initialized configuration and appropriate input
values. Use it to understand expressions and variable evaluation, not as
a substitute for reviewing a plan.

## 16. Quick Interview Revision Questions

1.  **What is a Terraform input variable?**\
    A parameter that lets reusable Terraform configuration accept values
    from external inputs.

2.  **What is the difference between `variables.tf` and
    `terraform.tfvars`?**\
    `variables.tf` conventionally declares variables; `terraform.tfvars`
    supplies their values.

3.  **What happens if a variable has no default?**\
    Terraform requires a value from an applicable input source;
    otherwise, planning or evaluation fails with a missing-value error.

4.  **What is the difference between a list and a map?**\
    A list is ordered and indexed; a map contains key-value pairs.

5.  **What is the difference between a variable and a local?**\
    A variable accepts input; a local computes or reuses an expression
    within a module.

6.  **Does `sensitive = true` encrypt a password?**\
    No. It redacts supported output but does not guarantee the value is
    absent from state or plans.

7.  **How do you use a custom tfvars file?**\
    Pass it explicitly, for example
    `terraform plan -var-file=prod.tfvars`.

8.  **Why is a tfvars change not reflected in a plan?**\
    Check the resource reference, working directory, selected variable
    file, precedence, and whether the plan is fresh.

9.  **How do you restrict valid environment values?**\
    Use a variable validation block with `contains()` or another
    suitable condition.

10. **What is variable precedence?**\
    The priority order used when multiple sources assign values to the
    same input variable.

11. **What is the purpose of output values?**\
    To expose useful results such as resource IDs or endpoints from a
    module.

12. **What is the difference between `count` and `for_each`?**\
    `count` addresses instances by numeric index; `for_each` addresses
    them by keys or set elements.

## 17. Final Memory Sheet

### The five things to remember

1.  **DECLARE:** `variable "name" { ... }`
2.  **ASSIGN:** `name = "value"` in an appropriate variable file or
    other input source.
3.  **USE:** `var.name`
4.  **COMPUTE:** `local.name`
5.  **RETURN:** `output "name" { value = ... }`

### Troubleshooting flow

**Declaration → Assigned value → Precedence → Resource reference →
Execution directory → Plan**

### Production mindset

-   Validate inputs.
-   Separate environment-specific configuration.
-   Protect secrets and state.
-   Review plans before applying.
-   Use approved deployment workflows.
-   Avoid manual state edits as a first troubleshooting step.

### One-line interview summary

"I declare input variables in `.tf` files, assign environment-specific
values through `.tfvars` files or other supported input sources,
reference them using `var.name`, and troubleshoot unexpected values by
checking precedence, validation, working directory, resource references,
and the execution pipeline."
