# Azure Key Vault — Interview Notes

## 1. Simple Definition

Azure Key Vault is a managed Azure service used to securely store and manage sensitive information such as:

- Passwords
- API keys
- Database connection strings
- Secrets
- Certificates
- Encryption keys

### Interview one-liner

> "Azure Key Vault is a centralized and secure service for storing secrets, keys and certificates, so we don't hardcode sensitive credentials in application code or CI/CD pipelines."

---

## 2. Why do we need Azure Key Vault?

Without Key Vault:

```
Application
   ↓
Password/API Key stored in code ❌
   ↓
Git Repository
   ↓
Security Risk
```

With Key Vault:

```
Application / Pipeline
        ↓
Authentication
        ↓
Azure Key Vault
        ↓
Secret / Key / Certificate
```

### Main benefits

1. No hardcoded secrets
2. Centralized secret management
3. Access control using Microsoft Entra ID
4. Secret versioning
5. Secret expiration
6. Certificate management
7. Encryption key management
8. Auditing and monitoring
9. Integration with Azure DevOps
10. Supports applications such as AKS, App Service, VMs, Functions, etc.

---

## 3. What can Azure Key Vault store?

There are three important categories:

| Type | Example | Purpose |
|---|---|---|
| Secrets | DB password, API token | Sensitive configuration |
| Keys | RSA/EC keys | Encryption/signing |
| Certificates | TLS/SSL certificate | Certificate lifecycle |

### Easy memory trick

```
S-K-C

Secrets → Keys → Certificates
```

---

## 4. How does Azure Key Vault work?

Example:

```
Developer
   |
   v
Azure DevOps Pipeline
   |
   | Authenticate using Service Connection
   v
Microsoft Entra ID
   |
   | Authorization
   v
Azure Key Vault
   |
   +---- DB Password
   +---- API Key
   +---- Certificate
   |
   v
Application Deployment
```

The important point is:

> The application/pipeline gets authorized to access the vault; it doesn't need the Key Vault master password.

---

## 5. Authentication vs Authorization

This is a common interview question.

### Authentication

Who are you?

```
Azure DevOps Pipeline
        ↓
Microsoft Entra ID
        ↓
Identity verified
```

### Authorization

What are you allowed to access?

```
Pipeline Identity
      ↓
Key Vault
      ↓
Secret: READ ✅
Secret: DELETE ❌
```

### Memory trick

> Authentication = Who are you?
> Authorization = What can you do?

---

## 6. Azure Key Vault + Managed Identity

This is an important production concept.

Suppose an application runs on an Azure VM.

Bad approach:

```
VM
 ↓
username/password stored in config ❌
 ↓
Key Vault
```

Better approach:

```
Azure VM
   |
   | Managed Identity
   v
Microsoft Entra ID
   |
   v
Azure Key Vault
   |
   v
Secret
```

The VM gets an identity from Azure. You grant that identity permission to read a specific secret.

> No username/password or client secret needs to be stored inside the VM.

---

## 7. System-assigned vs User-assigned Managed Identity

### System-assigned

Identity is tied to the Azure resource.

```
VM
 |
 └── System Assigned Identity
```

If the VM is deleted, the identity is also deleted.

### User-assigned

Identity exists independently.

```
User Assigned Identity
       |
       +---- VM
       +---- App Service
       +---- Function
```

Useful when multiple resources need the same identity.

### Interview answer

> "I prefer managed identity wherever supported because it eliminates long-lived credentials and reduces secret-management overhead."

---

## 8. Azure Key Vault + Azure DevOps Pipeline

This is very important for an Azure DevOps interview.

Typical flow:

```
Developer
   ↓
Git
   ↓
Azure Pipeline
   ↓
Build
   ↓
Test
   ↓
Azure Key Vault
   ↓
Retrieve required secrets
   ↓
Deploy
   ↓
AKS / VM / App Service
```

For example, your application needs:

```
DB_USERNAME
DB_PASSWORD
API_KEY
```

Instead of:

```yaml
variables:
  DB_PASSWORD: "MyPassword123"   # ❌
```

you store them in Key Vault.

---

## 9. Azure DevOps Key Vault integration

A common Azure Pipeline approach is the `AzureKeyVault` task.

Example:

```yaml
steps:

- task: AzureKeyVault@2
  inputs:
    azureSubscription: 'my-service-connection'
    KeyVaultName: 'my-prod-keyvault'
    SecretsFilter: '*'
    RunAsPreJob: true
```

Then pipeline tasks can consume the retrieved secret variables.

For example:

```yaml
- script: |
    echo "Application deployment started"
    ./deploy.sh
```

### Important security point

Never do this:

```yaml
- script: echo $(DB_PASSWORD)
```

because you don't want secrets appearing in logs.

---

## 10. SecretsFilter

Instead of retrieving everything:

```yaml
SecretsFilter: '*'
```

you can retrieve only required secrets:

```yaml
SecretsFilter: DB-PASSWORD,API-KEY
```

### Best practice

Prefer:

```
Only required secrets
        ↓
Least privilege
        ↓
Lower exposure
```

rather than retrieving every secret.

---

## 11. Azure Key Vault + AKS

Very important for a DevOps interview.

Architecture:

```
Developer
   ↓
Git
   ↓
Azure Pipeline
   ↓
Docker Image
   ↓
ACR
   ↓
AKS
   |
   | Workload Identity / CSI Driver
   ↓
Azure Key Vault
   |
   +---- DB Password
   +---- API Secret
   +---- Certificate
```

A common modern pattern is the **Azure Key Vault Secrets Store CSI Driver** with Azure identity integration.

Conceptually:

```
Pod
 ↓
Identity
 ↓
Azure Key Vault
 ↓
Secret
 ↓
Mounted into Pod / exposed to application
```

This avoids putting secrets directly into Git-managed Kubernetes YAML.

---

## 12. Why not store secrets in Kubernetes Secret?

Kubernetes Secrets are useful, but they are not automatically equivalent to a dedicated enterprise secret-management system.

A common enterprise approach is:

```
Azure Key Vault
      ↓
Central secret management
      ↓
AKS
      ↓
Application
```

Benefits include:

- Centralized management
- Rotation
- Auditing
- Azure identity integration
- Reduced secret duplication

---

## 13. Secret Rotation

Suppose the database password is:

```
DB_PASSWORD = abc123
```

After some time, security policy requires rotation.

Instead of changing it manually across 20 applications:

```
20 applications
   ↓
20 config files ❌
```

Centralize it:

```
Azure Key Vault
       |
       └── DB_PASSWORD
              ↓
         Applications
```

Update the secret centrally and design applications/pipelines to consume the updated version appropriately.

---

## 14. Secret vs Key vs Certificate

### Secret

Used for:

```
Password
API token
Connection string
Client secret
```

### Key

Used for:

```
Encryption
Decryption
Digital signing
```

### Certificate

Used for:

```
TLS/SSL
Application identity
Secure communication
```

### Memory

> Secret = sensitive value
> Key = cryptographic operation
> Certificate = identity + public key information

---

## 15. Access Control

Azure Key Vault can use Azure RBAC for authorization.

Example:

```
DevOps Pipeline Identity
        |
        ↓
Key Vault RBAC
        |
        └── Key Vault Secrets User
                    |
                    ↓
             Read secrets
```

You should follow least privilege.

If the pipeline only needs to read secrets:

```
READ ✅
WRITE ❌
DELETE ❌
```

Don't give `Owner ❌` or `Contributor ❌` unless genuinely required.

---

## 16. Production Example — Interview Answer

You can explain a realistic enterprise scenario like this:

> "In a production CI/CD setup, I would keep database credentials, API credentials and other sensitive configuration in Azure Key Vault rather than storing them in the repository or YAML file. Azure DevOps would authenticate using a secure service connection or workload identity, retrieve only the required secrets, and use them during deployment. Access would follow least privilege, and production secrets would be separated from lower environments."

This is a conceptual example unless you have actually implemented it in production — adjust to your real experience.

---

## 17. Environment-specific Key Vaults

A mature enterprise setup can use separate vaults:

```
DEV
 |
 └── kv-myapp-dev

QA
 |
 └── kv-myapp-qa

UAT
 |
 └── kv-myapp-uat

PROD
 |
 └── kv-myapp-prod
```

Why? Because you don't want:

```
DEV Pipeline
      ↓
Production Secrets ❌
```

Instead:

```
DEV Pipeline  → DEV Key Vault
QA Pipeline   → QA Key Vault
PROD Pipeline → PROD Key Vault
```

---

## 18. Azure Key Vault Security Best Practices

1. **Don't hardcode secrets**

   ```yaml
   password: MyPassword123   # ❌
   ```

2. **Use managed identity where possible**

   ```
   Application → Managed Identity → Key Vault
   ```

3. **Use least privilege** — give only required permissions.

4. **Separate environments** — DEV ≠ PROD.

5. **Enable logging/monitoring** — monitor access to sensitive resources.

6. **Enable soft delete / appropriate recovery protections** — protect against accidental deletion.

7. **Use expiration policies** — secrets/certificates should have controlled lifetimes.

8. **Rotate credentials** — don't keep credentials forever.

9. **Restrict network access** — use appropriate firewall/private networking controls where required.

10. **Never print secrets**

    ```bash
    echo $PASSWORD   # ❌
    ```

---

## 19. Troubleshooting

| Problem | Possible Cause | Check | Fix |
|---|---|---|---|
| Pipeline cannot access Key Vault | Service connection issue | Pipeline logs | Verify identity/permissions |
| Secret not found | Wrong secret name | Key Vault | Correct name |
| Access denied | Missing RBAC | IAM permissions | Grant required role |
| Application cannot retrieve secret | Identity issue | Application identity | Verify managed identity |
| Secret appears empty | Incorrect variable/reference | Pipeline YAML | Check variable mapping |
| Production deployment fails | Wrong environment vault | Pipeline variables | Verify environment configuration |
| AKS can't retrieve secret | Identity/CSI configuration | Pod events/logs | Fix identity/provider configuration |
| Secret exposed in logs | Debugging/echo | Pipeline logs | Remove secret output |

---

## 20. Common Interview Questions

### Basic

1. What is Azure Key Vault?
2. Why do we need Key Vault?
3. What is a secret?
4. What is a key?
5. What is a certificate?
6. What is Managed Identity?
7. What is Microsoft Entra ID?
8. Why shouldn't secrets be stored in Git?
9. What is RBAC?
10. What is least privilege?

### Intermediate

11. How do you integrate Key Vault with Azure DevOps?
12. How does Azure Pipeline authenticate to Key Vault?
13. How do you access Key Vault from an Azure VM?
14. System-assigned vs user-assigned managed identity?
15. How do you manage DEV/QA/PROD secrets?
16. How do you rotate secrets?
17. How do you prevent secret exposure in pipeline logs?
18. How would you use Key Vault with AKS?
19. Why use Key Vault instead of YAML variables?
20. How do you troubleshoot Access Denied?

### Advanced

21. How would you design Key Vault for a large enterprise?
22. How would you implement least privilege?
23. How would you handle secret rotation without application downtime?
24. How would you secure Key Vault network access?
25. How would you integrate Key Vault with AKS?
26. What happens if Key Vault becomes temporarily unavailable?
27. How would you audit Key Vault access?
28. How would you handle production and non-production secrets?
29. How would you migrate hardcoded secrets into Key Vault?
30. Key Vault vs AWS Secrets Manager?

---

## 21. Azure Key Vault vs AWS Secrets Manager

Since AWS experience is common for this profile, this comparison is very useful.

| Azure | AWS |
|---|---|
| Azure Key Vault | AWS Secrets Manager |
| Microsoft Entra ID | IAM |
| Managed Identity | IAM Role |
| Azure RBAC | IAM Policy |
| Azure DevOps | Jenkins/GitHub Actions |
| AKS | EKS |
| ACR | ECR |

### Memory

> Key Vault = Azure's centralized secrets/keys/certificates service.

---

## 22. Scenario Interview Question

**Interviewer:** "A developer has stored a database password inside Azure DevOps YAML. What would you do?"

### Strong answer

1. Remove the hardcoded secret.
2. Rotate the exposed password immediately.
3. Store the new credential in Azure Key Vault.
4. Configure secure identity-based access.
5. Give the pipeline only required read permission.
6. Update YAML to retrieve the secret securely.
7. Check Git history because removing it from the latest commit may not remove historical exposure.
8. Check pipeline logs for accidental exposure.
9. Review access/audit logs.
10. Follow the organization's incident/security process.

This shows security + DevOps + incident response thinking.

---

## 23. 30–60 Second Interview Answer

> "Azure Key Vault is a managed Azure service used to securely store and manage secrets, cryptographic keys and certificates. In a CI/CD environment, I would avoid hardcoding passwords or API keys in Git or YAML. Instead, Azure DevOps can authenticate securely to Key Vault and retrieve only the required secrets during deployment. For Azure workloads, I would prefer managed identity where supported and use RBAC with least privilege. For AKS, Key Vault can also be integrated using identity-based access and the Secrets Store CSI Driver. I would additionally implement secret rotation, auditing, environment separation and proper network controls."

### Memory trick

```
KEY VAULT = S.A.F.E.

S → Secrets
A → Access control
F → Federated/managed identity
E → Encryption + auditing
```

### Most important interview flow

```
Azure DevOps
     ↓
Identity
     ↓
Microsoft Entra ID
     ↓
RBAC
     ↓
Azure Key Vault
     ↓
Secret
     ↓
Application / Deployment
```
