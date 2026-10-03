# Phase 12 --- Azure Security + DevSecOps

> **Target:** Azure DevOps / DevOps Engineer interview preparation\
> **Style:** Simple English + senior-level concepts + commands +
> architecture diagrams + troubleshooting + interview answers

------------------------------------------------------------------------

# 0. Phase 12 --- Priority Map

## 🔴 MUST KNOW VERY WELL

-   Microsoft Entra ID
-   Authentication vs Authorization
-   Azure RBAC
-   Least Privilege
-   Managed Identity
-   System-assigned vs User-assigned Identity
-   Azure Key Vault
-   Secrets Management
-   NSG
-   Private Endpoint
-   Private DNS
-   DevSecOps
-   CI/CD security
-   Secret scanning
-   SAST
-   Dependency scanning
-   IaC security scanning
-   Container image scanning

## 🟠 MUST KNOW FOR INTERVIEW

-   Azure Firewall
-   Defender for Cloud
-   Microsoft Sentinel
-   Encryption at rest
-   Encryption in transit
-   TLS
-   Service Principal
-   Service Connections
-   Workload Identity Federation
-   Zero Trust
-   Defense in Depth
-   Shift Left

## 🟡 BASIC UNDERSTANDING IS ENOUGH

-   Advanced Sentinel KQL
-   Advanced Azure Firewall policies
-   Advanced cryptography
-   Advanced SOC operations

------------------------------------------------------------------------

# 1. Azure Security --- Big Picture

Azure security can be understood in six layers:

``` text
                         AZURE SECURITY
                              |
          +-------------------+-------------------+
          |                   |                   |
       IDENTITY            NETWORK              DATA
          |                   |                   |
      Entra ID              NSG              Encryption
      RBAC                  Firewall          Key Vault
      Managed Identity      Private EP        TLS
          |                   |                   |
          +-------------------+-------------------+
                              |
                       THREAT PROTECTION
                              |
                 +------------+------------+
                 |                         |
          Defender for Cloud          Sentinel
                 |                         |
          Security posture          SIEM / Analytics
                 |                         |
                 +------------+------------+
                              |
                         DEVSECOPS
                              |
                    Secure CI/CD Pipeline
```

## Core security principle

``` text
AUTHENTICATE
      ↓
AUTHORIZE
      ↓
PROTECT
      ↓
MONITOR
      ↓
DETECT
      ↓
RESPOND
```

------------------------------------------------------------------------

# 2. Microsoft Entra ID ⭐⭐⭐⭐⭐

## What is Microsoft Entra ID?

**Microsoft Entra ID** is Microsoft's cloud identity and access
management service.

It manages identities such as:

-   Users
-   Groups
-   Applications
-   Service principals
-   Managed identities

It supports:

-   Authentication
-   Identity management
-   Application access
-   Conditional Access
-   MFA
-   Integration with Azure RBAC

> **Interview definition:**\
> Microsoft Entra ID is Microsoft's cloud identity and access management
> service used to authenticate identities and provide identity
> information for authorization to Azure and other applications.

------------------------------------------------------------------------

# 3. Authentication vs Authorization ⭐⭐⭐⭐⭐

## Authentication

Question:

> **Who are you?**

Example:

``` text
User
 ↓
Entra ID
 ↓
Password / MFA / Authentication
 ↓
Identity verified
```

## Authorization

Question:

> **What are you allowed to do?**

``` text
Identity
   ↓
RBAC
   ↓
Allowed permissions
```

## Easy memory

``` text
Authentication → WHO?
Authorization   → WHAT CAN YOU DO?
```

### Interview answer

> Authentication verifies the identity. Authorization determines what
> that identity is allowed to access or perform.

------------------------------------------------------------------------

# 4. Entra ID --- Important Concepts

## 4.1 User

Human identity.

``` text
suraj@company.com
```

## 4.2 Group

Collection of users.

``` text
DevOps-Team
   |
   +-- User1
   +-- User2
   +-- User3
```

Permissions can be assigned to the group instead of every individual.

``` text
DevOps-Team
     ↓
RBAC Role
     ↓
Azure Resources
```

## 4.3 Service Principal

An application identity used by software/automation to access Azure.

``` text
Azure Pipeline
      ↓
Service Principal / Federated Identity
      ↓
Entra ID
      ↓
Azure Resource
```

## 4.4 Managed Identity

Azure-managed identity for an Azure resource.

``` text
Azure VM
   ↓
Managed Identity
   ↓
Entra ID
   ↓
Azure Resource
```

------------------------------------------------------------------------

# 5. Azure RBAC ⭐⭐⭐⭐⭐

## What is RBAC?

**RBAC = Role-Based Access Control**

RBAC controls:

> **Who can perform what action on which Azure resource.**

Basic model:

``` text
Security Principal
       +
     Role
       +
     Scope
       ↓
   Permission
```

Example:

``` text
Developer
   ↓
Storage Blob Data Reader
   ↓
Storage Account
```

The developer can read blob data but does not automatically get full
management access to the storage account.

------------------------------------------------------------------------

# 6. Important RBAC Roles

## Owner

Can:

-   Manage resources
-   Manage access
-   Assign RBAC roles

``` text
Owner
  ↓
Resource Management
+
Access Management
```

## Contributor

Can:

-   Create resources
-   Modify resources
-   Delete resources

Normally cannot assign Azure RBAC access.

``` text
Contributor
    ↓
Create
Modify
Delete
```

## Reader

Can:

-   View resources
-   Read configuration

Cannot modify resources.

``` text
Reader
  ↓
Read only
```

## Data-plane roles

Some services have separate roles for access to actual data.

Examples:

``` text
Storage Blob Data Reader
Storage Blob Data Contributor
```

This is important because:

``` text
Management-plane permission
        ≠
Data-plane permission
```

------------------------------------------------------------------------

# 7. RBAC Scope ⭐⭐⭐⭐⭐

RBAC can be assigned at:

``` text
Management Group
       ↓
Subscription
       ↓
Resource Group
       ↓
Resource
```

Example:

``` text
Subscription
   |
   +-- RG-DEV
   |     |
   |     +-- VM
   |     +-- Storage
   |
   +-- RG-PROD
         |
         +-- VM
         +-- Storage
```

If Reader is assigned at `RG-DEV`, the permission can inherit to
resources within that scope.

## Least privilege

Give only the permissions actually required.

Bad:

``` text
Developer
   ↓
Owner
```

Better:

``` text
Developer
   ↓
Required role
   ↓
Smallest practical scope
```

### Interview answer

> I follow the principle of least privilege by assigning the minimum
> required role at the smallest practical scope.

------------------------------------------------------------------------

# 8. Managed Identity ⭐⭐⭐⭐⭐

## What is Managed Identity?

Managed Identity allows an Azure resource/application to authenticate to
supported Azure services without storing credentials such as passwords
or client secrets in application code.

Example:

``` text
VM / App Service / Azure Function
              ↓
        Managed Identity
              ↓
           Entra ID
              ↓
        Access Token
              ↓
           Key Vault
```

The application requests an identity token rather than storing a
password.

------------------------------------------------------------------------

# 9. Types of Managed Identity

## 9.1 System-assigned

Identity is tied to the lifecycle of the Azure resource.

``` text
VM
 ↓
System-assigned identity
```

If the resource is deleted, its system-assigned identity is also
removed.

### Use when:

-   Identity is only needed by one resource
-   Identity should follow the resource lifecycle

------------------------------------------------------------------------

## 9.2 User-assigned

Created as a separate Azure resource.

``` text
              User Assigned Identity
                 /       |       \
                /        |        \
              VM1       VM2      App
```

Can be reused by multiple resources.

### Use when:

-   Multiple resources need the same identity
-   Identity lifecycle should be independent from one resource

------------------------------------------------------------------------

# 10. Managed Identity vs Service Principal

  -----------------------------------------------------------------------
  Managed Identity                    Service Principal
  ----------------------------------- -----------------------------------
  Azure-managed identity              Application identity

  Excellent for Azure-hosted          Useful for applications/automation
  workloads                           

  Avoids storing client secrets in    May use
  normal managed-identity use         secret/certificate/federation

  Azure integrates identity lifecycle Credential lifecycle needs
                                      management

  Strong choice when supported        Useful when managed identity is not
                                      applicable
  -----------------------------------------------------------------------

### Interview answer

> For Azure-hosted workloads, I prefer Managed Identity where supported
> because it removes the need to store long-lived credentials. For
> external automation or unsupported scenarios, I use an appropriate
> application identity with secure credential handling or workload
> federation.

------------------------------------------------------------------------

# 11. Azure Key Vault ⭐⭐⭐⭐⭐

## What is Azure Key Vault?

Azure Key Vault securely stores and manages:

-   Secrets
-   Encryption keys
-   Certificates

Examples:

``` text
Database Password
API Token
API Key
TLS Certificate
Encryption Key
Connection Secret
```

------------------------------------------------------------------------

# 12. Why Key Vault?

## Bad approach

``` text
Application
   ↓
appsettings.json
   ↓
DB_PASSWORD=Password123
```

Or:

``` text
Git Repository
     ↓
secret.txt
     ↓
Password
```

## Better approach

``` text
Application
     ↓
Managed Identity
     ↓
Entra ID
     ↓
RBAC
     ↓
Key Vault
     ↓
Secret
```

### Interview answer

> Key Vault centralizes sensitive information and prevents secrets from
> being hard-coded in application code, configuration files, or source
> repositories.

------------------------------------------------------------------------

# 13. Key Vault --- Secret vs Key vs Certificate

  Object        Purpose
  ------------- ---------------------------------------
  Secret        Passwords, tokens, connection strings
  Key           Cryptographic operations/encryption
  Certificate   TLS/SSL certificate management

Easy memory:

``` text
Secret      → Sensitive value
Key         → Cryptography
Certificate → Identity / TLS
```

------------------------------------------------------------------------

# 14. Key Vault Network Security

Key Vault can be protected using:

-   Public network access restrictions
-   Firewall/network rules
-   Private Endpoint
-   Private DNS

Secure design:

``` text
VNet
 |
 +-- Application
 |
 +-- Private Endpoint
          |
          ↓
       Key Vault
```

DNS:

``` text
Key Vault hostname
        ↓
   Private DNS
        ↓
    Private IP
        ↓
 Private Endpoint
        ↓
    Key Vault
```

------------------------------------------------------------------------

# 15. NSG ⭐⭐⭐⭐⭐

## What is NSG?

**NSG = Network Security Group**

It filters network traffic using rules.

NSG can be associated with:

-   Subnet
-   NIC

It is not directly associated with a VNet.

------------------------------------------------------------------------

# 16. NSG Rule Structure

Important fields:

``` text
Source
Destination
Source Port
Destination Port
Protocol
Priority
Action
```

Example:

``` text
Priority: 100
Source: My IP
Destination: VM
Port: 22
Protocol: TCP
Action: Allow
```

------------------------------------------------------------------------

# 17. NSG Priority ⭐⭐⭐⭐⭐

Lower number = higher priority.

Example:

``` text
Priority 100 → evaluated first
Priority 200 → evaluated second
Priority 300 → evaluated third
```

Example:

``` text
100 → Allow My IP → TCP 22
200 → Deny Internet → TCP 22
```

Traffic from your IP can be allowed before the broader deny rule.

------------------------------------------------------------------------

# 18. NSG Default Rules

Azure NSGs have default rules.

Conceptually:

``` text
Custom Rules
    ↓
Default Rules
    ↓
Implicit final deny for unmatched inbound traffic
```

Important:

> **Custom rules are evaluated before default rules.**

Do not memorize individual default-rule details without understanding
that Azure's default NSG rules provide baseline VNet traffic behavior
and deny unmatched inbound traffic.

------------------------------------------------------------------------

# 19. Useful NSG Commands

### Azure CLI --- list NSGs

``` bash
az network nsg list \
  --resource-group rg-security \
  --output table
```

### Show NSG

``` bash
az network nsg show \
  --resource-group rg-security \
  --name nsg-web
```

### List NSG rules

``` bash
az network nsg rule list \
  --resource-group rg-security \
  --nsg-name nsg-web \
  --output table
```

### Create an NSG

``` bash
az network nsg create \
  --resource-group rg-security \
  --name nsg-web
```

### Create an SSH allow rule

``` bash
az network nsg rule create \
  --resource-group rg-security \
  --nsg-name nsg-web \
  --name Allow-SSH \
  --priority 100 \
  --source-address-prefixes <YOUR-IP>/32 \
  --destination-port-ranges 22 \
  --protocol Tcp \
  --access Allow \
  --direction Inbound
```

> Replace `<YOUR-IP>` with your actual trusted public IP.

------------------------------------------------------------------------

# 20. NSG Troubleshooting

If VM connectivity fails:

``` text
1. Check VM private/public IP
        ↓
2. Check subnet
        ↓
3. Check NSG association
        ↓
4. Check effective security rules
        ↓
5. Check route table
        ↓
6. Check Azure Firewall / NVA
        ↓
7. Check OS firewall
        ↓
8. Check application listening port
        ↓
9. Test with nc/curl
```

Useful Linux commands:

``` bash
ip addr
ip route
ss -lntp
sudo ufw status
curl http://localhost:80
nc -vz <IP> 80
```

------------------------------------------------------------------------

# 21. Private Endpoint ⭐⭐⭐⭐⭐

## What is Private Endpoint?

Private Endpoint provides private connectivity from a VNet to a
supported Azure service using a private IP address in the VNet.

Example:

``` text
Application
     ↓
    VNet
     ↓
Private Endpoint
     ↓
Private IP
     ↓
Azure Storage
```

Instead of:

``` text
Application
     ↓
Public Internet
     ↓
Storage
```

------------------------------------------------------------------------

# 22. Private Endpoint + Private DNS ⭐⭐⭐⭐⭐

Private Endpoint gives the private network path.

Private DNS makes the service hostname resolve correctly.

``` text
Application
     ↓
DNS lookup
     ↓
storageaccount.blob.core.windows.net
     ↓
Private DNS Zone
     ↓
Private IP
     ↓
Private Endpoint
     ↓
Azure Storage
```

### Interview answer

> Private Endpoint provides private connectivity using a private IP,
> while Private DNS allows the normal service hostname to resolve to
> that private endpoint.

------------------------------------------------------------------------

# 23. Private Endpoint Troubleshooting

If an application cannot reach Storage through Private Endpoint:

``` text
1. DNS resolution
       ↓
2. Private DNS zone/link
       ↓
3. Private Endpoint status
       ↓
4. Private IP
       ↓
5. NSG / routing
       ↓
6. Storage firewall/network restrictions
       ↓
7. Authentication
       ↓
8. RBAC
```

Useful command:

``` bash
nslookup <storage-account-name>.blob.core.windows.net
```

Expected private architecture:

``` text
Hostname
   ↓
Private IP
```

If it resolves to an unexpected public endpoint, investigate DNS/private
DNS configuration.

------------------------------------------------------------------------

# 24. Azure Firewall ⭐⭐⭐

## What is Azure Firewall?

Azure Firewall is a managed, centralized network security service.

It can be used for:

-   Network traffic filtering
-   Application traffic filtering
-   Centralized egress control
-   DNAT scenarios
-   Hub-spoke security
-   Centralized policy enforcement

Architecture:

``` text
Internet
   ↓
Azure Firewall
   ↓
Hub VNet
   ↓
Spoke VNet
   ↓
Application
```

------------------------------------------------------------------------

# 25. Hub-Spoke Security

``` text
                       Internet
                          |
                          ↓
                  +---------------+
                  | Azure Firewall|
                  +---------------+
                          |
                       Hub VNet
                      /         \
                     /           \
                    ↓             ↓
              Spoke VNet A   Spoke VNet B
                   |               |
                  App             App
```

Typical purpose:

> Centralize security controls while keeping application workloads in
> separate spoke VNets.

------------------------------------------------------------------------

# 26. NSG vs Azure Firewall ⭐⭐⭐⭐⭐

  -----------------------------------------------------------------------
  NSG                                 Azure Firewall
  ----------------------------------- -----------------------------------
  Subnet/NIC-level filtering          Centralized managed firewall

  Primarily basic network filtering   More advanced centralized filtering

  Distributed                         Centralized

  Lightweight                         More feature-rich

  Good for subnet/NIC controls        Good for centralized network policy
  -----------------------------------------------------------------------

### Interview answer

> I use NSGs for subnet or NIC-level traffic filtering and Azure
> Firewall when centralized and more advanced network traffic control is
> required.

------------------------------------------------------------------------

# 27. Defender for Cloud ⭐⭐⭐

## What is Defender for Cloud?

Microsoft Defender for Cloud provides:

-   Cloud security posture management
-   Security recommendations
-   Security alerts
-   Workload protection capabilities

Mental model:

``` text
Azure Resources
      ↓
Defender for Cloud
      ↓
Assess security posture
      ↓
Recommendations / Alerts
      ↓
Remediation
```

Example:

``` text
VM has risky exposure
       ↓
Defender assessment
       ↓
Security recommendation
       ↓
Engineer remediates
```

------------------------------------------------------------------------

# 28. Microsoft Sentinel ⭐⭐⭐

## What is Sentinel?

**Microsoft Sentinel** is Microsoft's cloud-native SIEM and security
analytics platform.

SIEM:

> Security Information and Event Management

Architecture:

``` text
Azure Logs
Entra ID Logs
Firewall Logs
VM Logs
Application Logs
Other Sources
      |
      ↓
 Microsoft Sentinel
      |
      +-- Analytics
      +-- Correlation
      +-- Alerts
      +-- Incidents
      +-- Investigation
      +-- Automation
```

------------------------------------------------------------------------

# 29. Defender for Cloud vs Sentinel ⭐⭐⭐⭐⭐

  -----------------------------------------------------------------------
  Defender for Cloud                  Microsoft Sentinel
  ----------------------------------- -----------------------------------
  Security posture + workload         SIEM + security analytics
  protection                          

  Security recommendations            Security event analysis

  Cloud/workload security focus       Security operations focus

  Helps identify security weaknesses  Correlates and investigates events
  -----------------------------------------------------------------------

Easy memory:

``` text
Defender → PROTECT / POSTURE
Sentinel → DETECT / INVESTIGATE
```

------------------------------------------------------------------------

# 30. Encryption ⭐⭐⭐⭐⭐

Encryption converts readable data into protected ciphertext.

``` text
Plaintext
   ↓
Encryption
   ↓
Ciphertext
```

------------------------------------------------------------------------

# 31. Encryption at Rest

Protects stored data.

Examples:

``` text
Managed Disk
Storage
Database
Backup
```

Conceptually:

``` text
Application
    ↓
Encrypted Storage
```

Azure services commonly provide encryption at rest by default, with
customer-managed key options for supported services.

------------------------------------------------------------------------

# 32. Encryption in Transit ⭐⭐⭐⭐⭐

Protects data while moving between systems.

``` text
Client
   |
   | HTTPS / TLS
   ↓
Application
```

Think:

``` text
At Rest    → Stored data
In Transit → Moving data
```

------------------------------------------------------------------------

# 33. TLS ⭐⭐⭐⭐⭐

## What is TLS?

**TLS = Transport Layer Security**

TLS protects data transmitted over a network.

It provides:

-   Encryption
-   Integrity
-   Server authentication using certificates

Example:

``` text
Browser
   |
   | HTTPS
   | TLS
   ↓
Application Gateway
   ↓
Application
```

------------------------------------------------------------------------

# 34. TLS Termination

Application Gateway can terminate TLS at the gateway.

``` text
Client
   |
   | HTTPS
   ↓
Application Gateway
   |
   | HTTP or HTTPS
   ↓
Backend
```

This is commonly called:

> TLS termination / SSL offloading

For stronger end-to-end protection, HTTPS can also be used between the
gateway and backend.

------------------------------------------------------------------------

# 35. Secrets Management ⭐⭐⭐⭐⭐

## What is a Secret?

Examples:

``` text
Password
API Key
Token
Connection String
Private Credential
```

## Never do this

``` yaml
variables:
  DB_PASSWORD: "MyPassword123"
```

Never commit secrets to Git.

Bad:

``` text
Git Repository
      ↓
password.txt
```

------------------------------------------------------------------------

# 36. Correct Secrets Architecture

``` text
Application
     ↓
Managed Identity
     ↓
Entra ID
     ↓
RBAC
     ↓
Key Vault
     ↓
Secret
```

CI/CD:

``` text
Azure Pipeline
      ↓
Federated Identity / Service Connection
      ↓
Entra ID
      ↓
Key Vault
      ↓
Required Secret
```

------------------------------------------------------------------------

# 37. What If a Secret Is Leaked? ⭐⭐⭐⭐⭐

Never simply delete the secret from the file and assume the problem is
fixed.

Follow:

``` text
1. Identify exposed credential
        ↓
2. Revoke / rotate it immediately
        ↓
3. Check where it was exposed
        ↓
4. Check logs for unauthorized use
        ↓
5. Remove secret from source/config
        ↓
6. Move secret to Key Vault
        ↓
7. Use Managed/Federated Identity where possible
        ↓
8. Add secret scanning to CI/CD
        ↓
9. Review access and prevent recurrence
```

------------------------------------------------------------------------

# 38. DevSecOps ⭐⭐⭐⭐⭐

## What is DevSecOps?

**DevSecOps = Development + Security + Operations**

Security is integrated into the complete software lifecycle.

Traditional approach:

``` text
Development
    ↓
Build
    ↓
Deploy
    ↓
Security Check
```

DevSecOps:

``` text
Plan
 ↓
Code
 ↓
Build
 ↓
Test
 ↓
Security
 ↓
Deploy
 ↓
Monitor
 ↓
Feedback
```

### Interview answer

> DevSecOps integrates security into the development and operations
> lifecycle so security checks and controls happen throughout the SDLC
> instead of only at the end.

------------------------------------------------------------------------

# 39. DevSecOps CI/CD Pipeline ⭐⭐⭐⭐⭐

``` text
Developer
    ↓
Azure Repos
    ↓
Pull Request
    ↓
Azure Pipeline
    ↓
+---------------------------+
| SAST                      |
| Secret Scan               |
| Dependency Scan           |
| IaC Security Scan         |
| Container Image Scan      |
+---------------------------+
    ↓
Build
    ↓
Unit Tests
    ↓
Artifact / Container Image
    ↓
DEV
    ↓
Security Checks
    ↓
QA
    ↓
Approval / Checks
    ↓
PROD
    ↓
Monitoring
```

------------------------------------------------------------------------

# 40. SAST ⭐⭐⭐⭐⭐

**SAST = Static Application Security Testing**

Scans source code without executing the application.

``` text
Source Code
    ↓
SAST Scanner
    ↓
Security Findings
```

Can identify certain:

-   Insecure coding patterns
-   Injection risks
-   Security weaknesses
-   Hard-coded credentials/patterns

------------------------------------------------------------------------

# 41. Secret Scanning ⭐⭐⭐⭐⭐

Detects accidentally committed credentials.

``` text
Git Push
   ↓
Secret Scanner
   ↓
Credential detected
   ↓
Pipeline / PR blocked
```

Examples:

-   API keys
-   Tokens
-   Passwords
-   Cloud credentials

------------------------------------------------------------------------

# 42. Dependency Scanning ⭐⭐⭐⭐

Applications depend on external packages.

``` text
Application
     ↓
Dependencies
     ↓
Security Scanner
     ↓
Known vulnerabilities
```

Example:

``` text
package.json
requirements.txt
pom.xml
```

Scanner checks dependency versions against vulnerability
databases/policies.

------------------------------------------------------------------------

# 43. IaC Security Scanning ⭐⭐⭐⭐⭐

Infrastructure as Code can contain security misconfigurations.

Examples:

``` text
Terraform
Bicep
ARM templates
Kubernetes manifests
```

Flow:

``` text
Terraform Code
      ↓
IaC Security Scanner
      ↓
Misconfiguration
      ↓
Pipeline fails / warning
```

Examples of risky configuration:

-   Public storage exposure
-   Overly broad network access
-   Open management ports
-   Excessive permissions

------------------------------------------------------------------------

# 44. Container Image Scanning ⭐⭐⭐⭐⭐

``` text
Dockerfile
    ↓
docker build
    ↓
Container Image
    ↓
Image Scanner
    ↓
Vulnerabilities
    ↓
Security Gate
```

Typical checks:

-   OS package vulnerabilities
-   Vulnerable application libraries
-   Base image vulnerabilities
-   Configuration issues

------------------------------------------------------------------------

# 45. Security Gates ⭐⭐⭐⭐⭐

Security gates prevent insecure artifacts from progressing.

``` text
Build
  ↓
SAST
  ↓
Secret Scan
  ↓
Dependency Scan
  ↓
IaC Scan
  ↓
Container Scan
  ↓
Security Gate
  ↓
Deploy
```

Example policy:

``` text
Critical vulnerability
        ↓
       FAIL
        ↓
Deployment blocked
```

The exact threshold should be defined by the organization's security
policy.

------------------------------------------------------------------------

# 46. Azure DevOps Pipeline Security

## Never put credentials directly in YAML

Bad:

``` yaml
steps:
- script: |
    az login --service-principal \
      --password "secret"
```

Better:

``` text
Azure Pipeline
      ↓
Secure Service Connection
      ↓
Federated Identity
      ↓
Entra ID
      ↓
Azure
```

------------------------------------------------------------------------

# 47. Workload Identity Federation ⭐⭐⭐⭐⭐

Modern CI/CD should avoid unnecessary long-lived secrets.

Conceptually:

``` text
Azure DevOps Pipeline
        ↓
Federated Identity
        ↓
Entra ID
        ↓
Short-lived token
        ↓
Azure Resource
```

Benefits:

-   Avoid long-lived client secrets
-   Better credential lifecycle
-   Reduced secret-management burden
-   Stronger CI/CD security

### Interview answer

> Workload identity federation allows supported CI/CD systems to
> authenticate to Entra ID without storing a long-lived client secret.

------------------------------------------------------------------------

# 48. Zero Trust ⭐⭐⭐⭐⭐

Zero Trust is based on principles such as:

``` text
Verify explicitly
      +
Use least privilege
      +
Assume breach
```

Example:

``` text
User
 ↓
Verify identity
 ↓
Check context
 ↓
Check authorization
 ↓
Grant minimum access
```

Do not assume:

``` text
Inside network = trusted
```

Instead:

``` text
Every access request
       ↓
Verify
       ↓
Authorize
```

------------------------------------------------------------------------

# 49. Defense in Depth ⭐⭐⭐⭐⭐

Do not rely on one security control.

Example:

``` text
                  Internet
                     ↓
               Firewall / WAF
                     ↓
                    NSG
                     ↓
             Private Endpoint
                     ↓
                   RBAC
                     ↓
             Managed Identity
                     ↓
                Key Vault
                     ↓
                Encryption
                     ↓
             Defender / Sentinel
```

If one layer is misconfigured, additional controls can still reduce
risk.

------------------------------------------------------------------------

# 50. Shift Left ⭐⭐⭐⭐⭐

## Meaning

Move security checks earlier in the SDLC.

Traditional:

``` text
Code
 ↓
Build
 ↓
Deploy
 ↓
Security Test
```

Shift Left:

``` text
Code
 ↓
Security Scan
 ↓
Build
 ↓
Security Scan
 ↓
Deploy
```

### Interview answer

> Shift Left means performing security and quality checks as early as
> possible in the software development lifecycle.

------------------------------------------------------------------------

# 51. Secure Azure Application --- Production Architecture

``` text
                           USERS
                             |
                             ↓
                    +----------------+
                    | Front Door /   |
                    | App Gateway    |
                    | TLS / WAF      |
                    +----------------+
                             |
                             ↓
                       APPLICATION
                             |
                      Managed Identity
                             |
              +--------------+--------------+
              |              |              |
              ↓              ↓              ↓
          Key Vault       Storage        Database
              |              |              |
              +--------------+--------------+
                             |
                     Private Endpoints
                             |
                       Private DNS
                             |
              +--------------+--------------+
              |
       Network Security
              |
        NSG + Firewall
              |
              ↓
     Defender for Cloud
              |
              ↓
         Sentinel
```

------------------------------------------------------------------------

# 52. Secure CI/CD Architecture

``` text
Developer
    |
    ↓
Azure Repos
    |
    ↓
Pull Request
    |
    ↓
Azure Pipelines
    |
    +---- SAST
    |
    +---- Secret Scan
    |
    +---- Dependency Scan
    |
    +---- IaC Scan
    |
    +---- Container Scan
    |
    ↓
Security Gate
    |
    ↓
Build Artifact
    |
    ↓
DEV
    |
    ↓
QA / Approval
    |
    ↓
PROD
    |
    ↓
Monitor
    |
    +---- Defender for Cloud
    |
    +---- Azure Monitor
    |
    +---- Sentinel
```

------------------------------------------------------------------------

# 53. Practical Scenario --- Secure Azure Application ⭐⭐⭐⭐⭐

## Requirement

Build an application with:

-   Secure authentication
-   No hard-coded secrets
-   Private backend services
-   Secure CI/CD
-   Security monitoring

## Solution

``` text
Developer
   ↓
Azure Repos
   ↓
Azure Pipeline
   ↓
SAST
Secret Scan
Dependency Scan
IaC Scan
Container Scan
   ↓
Security Gate
   ↓
Deploy
   ↓
Application
   ↓
Managed Identity
   ↓
Entra ID + RBAC
   ↓
Key Vault / Storage / Database
   ↓
Private Endpoint
   ↓
Private DNS
```

Network protection:

``` text
Internet
   ↓
App Gateway / WAF
   ↓
NSG
   ↓
Application
   ↓
Private backend
```

Monitoring:

``` text
Resources
   ↓
Defender for Cloud
   ↓
Security alerts
   ↓
Sentinel
   ↓
Investigation / Response
```

------------------------------------------------------------------------

# 54. Scenario --- Developer Committed Password ⭐⭐⭐⭐⭐

### Interview question

> A developer accidentally committed a database password to Git. What
> would you do?

### Answer

``` text
1. Treat the password as compromised.
2. Immediately rotate/revoke the credential.
3. Check repository history and exposure.
4. Review logs for suspicious usage.
5. Remove the secret from source/configuration.
6. Store the replacement in Key Vault.
7. Use Managed Identity where possible.
8. Add secret scanning to the pipeline.
9. Review why the secret was committed.
10. Prevent recurrence with policy and automation.
```

### Strong interview sentence

> **"Deleting the secret from the latest commit is not enough because
> the credential may still exist in Git history or may already have been
> copied."**

------------------------------------------------------------------------

# 55. Scenario --- VM Needs Storage Access ⭐⭐⭐⭐⭐

## Bad architecture

``` text
VM
 ↓
Storage Access Key
 ↓
Stored in application config
```

## Better architecture

``` text
VM
 ↓
Managed Identity
 ↓
Entra ID
 ↓
RBAC
 ↓
Storage
```

### Interview answer

> I would prefer managed identity with the minimum required Storage
> data-plane RBAC role instead of storing a storage account key on the
> VM.

------------------------------------------------------------------------

# 56. Scenario --- Application Cannot Access Key Vault ⭐⭐⭐⭐⭐

Troubleshooting sequence:

``` text
1. DNS
   ↓
2. Network connectivity
   ↓
3. Private Endpoint
   ↓
4. Private DNS
   ↓
5. Firewall / network restrictions
   ↓
6. Managed Identity
   ↓
7. RBAC
   ↓
8. Key Vault configuration
   ↓
9. Application configuration
```

Useful commands:

``` bash
nslookup <key-vault-hostname>
```

``` bash
curl -v https://<key-vault-hostname>
```

Check Azure resource details:

``` bash
az keyvault show \
  --name <vault-name> \
  --resource-group <resource-group>
```

------------------------------------------------------------------------

# 57. Scenario --- VM Is Publicly Exposed

Check:

``` text
Public IP
   ↓
NSG
   ↓
Load Balancer / App Gateway
   ↓
Firewall
   ↓
Application
```

Questions:

-   Does the VM really need a public IP?
-   Can it be private?
-   Is inbound access restricted?
-   Is a WAF required?
-   Is management access restricted to trusted IPs?
-   Is the backend reachable privately?

Preferred pattern where appropriate:

``` text
Internet
   ↓
WAF / Application Gateway
   ↓
Private Application
   ↓
Private Database
```

------------------------------------------------------------------------

# 58. Important Security Commands

## Azure CLI

### Login

``` bash
az login
```

### Current account

``` bash
az account show
```

### List subscriptions

``` bash
az account list --output table
```

### List role assignments

``` bash
az role assignment list \
  --assignee <principal-id> \
  --output table
```

### Show NSGs

``` bash
az network nsg list --output table
```

### Show NSG rules

``` bash
az network nsg rule list \
  --resource-group <rg> \
  --nsg-name <nsg> \
  --output table
```

### List private endpoints

``` bash
az network private-endpoint list \
  --resource-group <rg> \
  --output table
```

### Show Key Vault

``` bash
az keyvault show \
  --name <vault-name> \
  --resource-group <rg>
```

------------------------------------------------------------------------

# 59. Linux Security Troubleshooting Commands

``` bash
ip addr
```

Check IP addresses.

``` bash
ip route
```

Check routing.

``` bash
ss -lntp
```

Check listening TCP ports.

``` bash
sudo ufw status
```

Check Ubuntu firewall status.

``` bash
curl -v http://localhost:80
```

Test local application.

``` bash
curl -v http://<private-ip>:80
```

Test remote HTTP connectivity.

``` bash
nc -vz <private-ip> 80
```

Test TCP connectivity.

``` bash
nslookup <hostname>
```

Test DNS.

``` bash
dig <hostname>
```

Detailed DNS troubleshooting.

------------------------------------------------------------------------

# 60. Key Comparisons --- MUST MEMORIZE ⭐⭐⭐⭐⭐

## Authentication vs Authorization

``` text
Authentication → WHO ARE YOU?
Authorization   → WHAT CAN YOU DO?
```

## Managed Identity vs RBAC

``` text
Managed Identity → Identity
RBAC             → Permission
```

Together:

``` text
Managed Identity
      ↓
     RBAC
      ↓
Permission
```

## Key Vault vs Managed Identity

``` text
Managed Identity → Authentication
Key Vault        → Secret/Key/Certificate Storage
```

## NSG vs Private Endpoint

``` text
NSG
 ↓
Controls traffic

Private Endpoint
 ↓
Provides private connectivity
```

## NSG vs Firewall

``` text
NSG
 ↓
Subnet/NIC-level filtering

Azure Firewall
 ↓
Centralized advanced traffic control
```

## Defender vs Sentinel

``` text
Defender for Cloud
 ↓
Security posture + workload protection

Sentinel
 ↓
SIEM + analytics + investigation
```

## Encryption at Rest vs In Transit

``` text
At Rest
 ↓
Stored data

In Transit
 ↓
Moving data
```

------------------------------------------------------------------------

# 61. Most Important Interview Questions

## Q1. What is Microsoft Entra ID?

> Microsoft Entra ID is Microsoft's cloud identity and access management
> service used to manage identities and authentication and to integrate
> with authorization mechanisms such as Azure RBAC.

## Q2. Authentication vs Authorization?

> Authentication verifies who the user or application is. Authorization
> determines what that identity is allowed to do.

## Q3. What is RBAC?

> RBAC is Azure's role-based authorization model that assigns
> permissions to identities at scopes such as management group,
> subscription, resource group, or resource.

## Q4. Owner vs Contributor vs Reader?

> Owner can manage resources and access. Contributor can manage
> resources but normally cannot assign RBAC access. Reader can view
> resources but cannot modify them.

## Q5. What is least privilege?

> Giving an identity only the minimum permissions required to perform
> its job.

## Q6. What is Managed Identity?

> Managed Identity provides an Azure-managed identity that applications
> can use to authenticate to supported Azure services without storing
> credentials in application code.

## Q7. System-assigned vs User-assigned identity?

> System-assigned identity is tied to the resource lifecycle.
> User-assigned identity is a separate Azure resource and can be reused
> by multiple resources.

## Q8. What is Key Vault?

> Azure Key Vault securely stores and manages secrets, cryptographic
> keys, and certificates.

## Q9. Why use Key Vault?

> To prevent secrets from being hard-coded in source code, configuration
> files, or pipelines and to centralize secure secret management.

## Q10. What is NSG?

> NSG is a network traffic filtering mechanism associated with a subnet
> or NIC that uses prioritized allow/deny rules.

## Q11. What is Private Endpoint?

> Private Endpoint provides private connectivity to a supported Azure
> service using a private IP address in a VNet.

## Q12. Why Private DNS?

> Private DNS allows the normal Azure service hostname to resolve to the
> private endpoint's private IP.

## Q13. What is Azure Firewall?

> Azure Firewall is a managed centralized network security service used
> for traffic filtering and centralized security policies.

## Q14. What is Defender for Cloud?

> Defender for Cloud provides cloud security posture management and
> workload protection capabilities, including security recommendations
> and alerts.

## Q15. What is Microsoft Sentinel?

> Microsoft Sentinel is a cloud-native SIEM and security analytics
> platform used to collect, correlate, investigate, and respond to
> security events.

## Q16. What is DevSecOps?

> DevSecOps integrates security into the development and operations
> lifecycle so security is continuously checked instead of being
> performed only at the end.

## Q17. What is Shift Left?

> Shift Left means moving security and quality checks earlier in the
> software development lifecycle.

## Q18. What is Zero Trust?

> Zero Trust is a security approach based on verifying explicitly,
> applying least privilege, and assuming breach rather than trusting
> users or networks by default.

------------------------------------------------------------------------

# 62. Senior Interview Scenario --- Design Secure Azure Environment

### Question

> How would you design security for a production Azure application?

### Answer structure

``` text
1. Identity
   ↓
   Entra ID + Managed Identity

2. Authorization
   ↓
   RBAC + Least Privilege

3. Secrets
   ↓
   Key Vault

4. Network
   ↓
   NSG + Private Endpoint + Private DNS

5. Centralized network security
   ↓
   Azure Firewall where required

6. Encryption
   ↓
   Encryption at rest + TLS in transit

7. CI/CD security
   ↓
   SAST + Secret + Dependency + IaC + Container scanning

8. Security posture
   ↓
   Defender for Cloud

9. SIEM
   ↓
   Sentinel

10. Monitoring
    ↓
    Azure Monitor / Application Insights
```

### Strong answer

> **"I would start with Entra ID for identity and RBAC using least
> privilege. For Azure-hosted workloads I would use managed identities
> instead of storing long-lived credentials. Secrets and certificates
> would be managed through Key Vault. For networking, I would minimize
> public exposure and use NSGs, Private Endpoints, Private DNS, and
> Azure Firewall where centralized traffic control is required. Data
> would use encryption at rest and TLS in transit. In the CI/CD pipeline
> I would add SAST, secret, dependency, IaC, and container security
> checks with appropriate security gates. Finally, I would use Defender
> for Cloud for security posture and workload protection and Sentinel
> for centralized security analytics and investigation."**

------------------------------------------------------------------------

# 63. 🔥 FINAL REVISION --- 30 Points You MUST KNOW

``` text
01. Entra ID = Identity
02. Authentication = Who are you?
03. Authorization = What can you do?
04. RBAC = Permissions
05. Least privilege = Minimum required access
06. Owner = Resource + access management
07. Contributor = Resource management
08. Reader = Read only
09. RBAC scope = MG → Subscription → RG → Resource
10. Managed Identity = Azure-managed identity
11. System-assigned = Resource lifecycle
12. User-assigned = Independent/reusable identity
13. Key Vault = Secrets + Keys + Certificates
14. Never hard-code secrets
15. NSG = Subnet/NIC traffic filtering
16. Lower NSG priority number = Higher priority
17. Private Endpoint = Private IP connectivity
18. Private DNS = Private hostname resolution
19. Azure Firewall = Centralized advanced network security
20. Defender for Cloud = Security posture/workload protection
21. Sentinel = SIEM/security analytics
22. Encryption at rest = Stored data
23. TLS = Data in transit
24. DevSecOps = Security throughout SDLC
25. SAST = Source-code security scanning
26. Secret scan = Find exposed credentials
27. Dependency scan = Find vulnerable libraries
28. IaC scan = Find infrastructure misconfiguration
29. Container scan = Find image vulnerabilities
30. Shift Left = Security earlier in SDLC
```

------------------------------------------------------------------------

# 64. 🔥 60-Second Phase 12 Revision

``` text
Entra ID
   ↓
Identity

RBAC
   ↓
Authorization

Managed Identity
   ↓
No stored application credentials

Key Vault
   ↓
Secrets / Keys / Certificates

NSG
   ↓
Subnet/NIC traffic filtering

Private Endpoint
   ↓
Private connectivity

Private DNS
   ↓
Private service-name resolution

Azure Firewall
   ↓
Centralized traffic security

Defender for Cloud
   ↓
Security posture + workload protection

Sentinel
   ↓
SIEM + investigation

Encryption
   ↓
Protect data

TLS
   ↓
Protect data in transit

DevSecOps
   ↓
Security in CI/CD

SAST
Secret Scan
Dependency Scan
IaC Scan
Container Scan
   ↓
Security Gate
   ↓
Secure Deployment
```

------------------------------------------------------------------------

# 65. Final Mental Model

> **IDENTITY → ACCESS → NETWORK → DATA → DETECTION → PIPELINE**

``` text
IDENTITY
Entra ID
    ↓
ACCESS
RBAC + Managed Identity
    ↓
NETWORK
NSG + Private Endpoint + Firewall
    ↓
DATA
Key Vault + Encryption + TLS
    ↓
DETECTION
Defender + Sentinel
    ↓
PIPELINE
SAST + Secret + Dependency + IaC + Container Scan
    ↓
SECURE PRODUCTION
```

## One-line interview summary

> **"For Azure security, I use Entra ID for identity, RBAC for
> authorization, managed identities to avoid storing credentials, Key
> Vault for secrets, NSGs and Private Endpoints for network protection,
> Azure Firewall for centralized traffic control where required,
> Defender for Cloud for security posture and workload protection,
> Sentinel for SIEM and security analytics, and I integrate SAST,
> secret, dependency, IaC, and container scanning into CI/CD as part of
> DevSecOps."**
