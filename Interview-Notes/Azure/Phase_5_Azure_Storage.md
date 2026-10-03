# Phase 5 --- Azure Storage

> **Goal:** Learn Azure Storage from DevOps interview + production
> perspective.
>
> **Priority:** 🔴 Must Know \| 🟡 Important \| 🟢 Good to Know

------------------------------------------------------------------------

# 1. Storage Account 🔴

## What is a Storage Account?

A **Storage Account** is the top-level Azure resource that provides
access to Azure Storage services.

``` text
Azure Subscription
       |
       +-- Resource Group
              |
              +-- Storage Account
                     |
                     +-- Blob Storage
                     |     +-- Containers
                     |           +-- Blobs
                     |
                     +-- Azure Files
                     |
                     +-- Queue Storage
                     |
                     +-- Table Storage
```

### Must Know

-   Storage Account is the main container for Azure Storage services.
-   A storage account can provide:
    -   Blob Storage
    -   Azure Files
    -   Queue Storage
    -   Table Storage
-   Storage account names must be globally unique.
-   Storage supports encryption at rest by default.
-   Storage can be protected using RBAC, SAS, Private Endpoint and
    network rules.

### Interview Answer

> **Azure Storage Account is the top-level resource used to provide
> scalable and durable storage services such as Blob, Files, Queue and
> Table Storage.**

------------------------------------------------------------------------

# 2. Blob Storage 🔴

## What is Blob Storage?

**Blob = Binary Large Object**

Blob Storage is Azure's **object storage** service.

It is commonly used for:

-   Images
-   Videos
-   Documents
-   Backups
-   Logs
-   Application packages
-   Static website files
-   Data lakes

``` text
Application
     |
     v
Storage Account
     |
     v
Blob Container
     |
     +-- image1.jpg
     +-- image2.png
     +-- backup.zip
     +-- app.tar.gz
```

## Blob Hierarchy

``` text
Storage Account
      |
      +-- Container
             |
             +-- Blob
             +-- Blob
             +-- Blob
```

### Example

``` text
Storage Account: mystorage123
        |
        +-- images
        |     +-- photo1.jpg
        |     +-- photo2.jpg
        |
        +-- backups
              +-- db-backup.zip
```

------------------------------------------------------------------------

# 3. Blob Types 🟡

Azure Blob Storage supports different blob types.

## 3.1 Block Blob 🔴

Used for most normal object/file storage.

Examples:

-   Images
-   Videos
-   Documents
-   Application packages
-   Backups

``` text
Application
     |
     v
Block Blob
     |
     +-- file/data blocks
```

## 3.2 Append Blob

Optimized for append operations.

Common use:

-   Logs
-   Audit records

``` text
Log 1
  ↓
Log 2
  ↓
Log 3
  ↓
Append Blob
```

## 3.3 Page Blob

Optimized for random read/write operations.

Commonly associated with scenarios such as virtual-machine disks.

> **Interview tip:** Know the names and basic use cases. Do not confuse
> Page Blob with Azure Managed Disks.

------------------------------------------------------------------------

# 4. Containers 🔴

A **container** is a logical grouping of blobs.

``` text
Storage Account
       |
       +-- images
       |     +-- a.jpg
       |     +-- b.jpg
       |
       +-- logs
       |     +-- app.log
       |
       +-- backups
             +-- db.zip
```

### Important

-   A container exists inside a storage account.
-   A blob exists inside a container.
-   Containers help organize blobs.
-   Access can be controlled at the storage/container/data level
    depending on the authorization mechanism.

------------------------------------------------------------------------

# 5. Azure Files 🔴

Azure Files provides **managed file shares**.

It is useful when applications need a shared filesystem rather than
object storage.

``` text
VM1 ----\
         \
VM2 ------> Azure File Share
         /
VM3 ----/
```

### Common use cases

-   Shared application files
-   Configuration files
-   Legacy applications
-   Shared content
-   Lift-and-shift workloads

### Protocols

Depending on the Azure Files configuration, file shares can use
protocols such as:

-   SMB
-   NFS

# Azure Files: SMB vs NFS

Azure Files lets you access files using different communication methods (protocols).

## 1. SMB

**SMB = Server Message Block**

- Commonly used with **Windows**
- Used for sharing files over a network
- Example: `\\server\shared-folder`

👉 Think: **Windows file sharing**

## 2. NFS

**NFS = Network File System**

- Commonly used with **Linux/Unix**
- Allows Linux servers to access shared files over a network
- Example: `/mnt/shared`

👉 Think: **Linux file sharing**

## Easy way to remember

| Protocol | Mainly used with | Think                |
| -------- | ---------------- | -------------------- |
| **SMB**  | Windows          | Windows file sharing |
| **NFS**  | Linux/Unix       | Linux file sharing   |

## Interview answer

> Azure Files supports **SMB for Windows-based file sharing** and **NFS for Linux/Unix-based file sharing**, depending on the storage account and share configuration.
------------------------------------------------------------------------

# 6. Blob Storage vs Azure Files 🔴

  Feature                  Blob Storage      Azure Files
  ------------------------ ----------------- --------------------
  Storage type             Object            Managed file share
  Access model             Objects/blobs     Files/directories
  Common protocol          REST/SDK          SMB/NFS
  Images/videos            Excellent         Possible
  Shared filesystem        Not primary use   Yes
  Backups                  Excellent         Possible
  Legacy file-share apps   Not ideal         Excellent

### Easy Memory

``` text
Blob  = Object
Files = File Share
Disk  = Block Storage
```

------------------------------------------------------------------------

# 7. Queue Storage 🟡

Azure Queue Storage provides **message-based asynchronous
communication**.

``` text
Application
     |
     | Add message
     v
Queue
     |
     | Get message
     v
Worker
     |
     v
Process
```

### Example

An application receives an image upload.

Instead of processing the image immediately:

``` text
User
 |
 v
Application
 |
 +--> Store image in Blob
 |
 +--> Put message in Queue
             |
             v
          Worker
             |
             v
       Process image
```

### Benefits

-   Decouples applications
-   Supports asynchronous processing
-   Helps absorb traffic spikes
-   Worker can process messages independently

### Interview Answer

> **Azure Queue Storage is used to decouple application components by
> storing messages that can be processed asynchronously by workers.**

------------------------------------------------------------------------

# 8. Table Storage 🟡

Azure Table Storage is a **NoSQL key-value/entity store**.

Useful for:

-   Simple structured data
-   Large amounts of non-relational data
-   Applications that do not need relational database features

Concept:

``` text
Table
 |
 +-- PartitionKey
 +-- RowKey
 +-- Property
 +-- Property
```

### Important

Table Storage is **not the same as Azure SQL Database**.

``` text
Azure SQL       = Relational database
Table Storage   = NoSQL entity/key-value storage
```

------------------------------------------------------------------------

# 9. Storage Access Tiers 🔴

Blob Storage supports access tiers.

Main tiers:

-   Hot
-   Cool
-   Cold
-   Archive

``` text
Frequently accessed
       |
       v
      HOT
       |
       v
      COOL
       |
       v
      COLD
       |
       v
    ARCHIVE
       |
       v
Rarely accessed
```

## 9.1 Hot

Use when data is accessed frequently.

Examples:

-   Active application data
-   Frequently accessed images
-   Current files

## 9.2 Cool

Use when data is accessed less frequently.

Examples:

-   Older backups
-   Infrequently accessed files

## 9.3 Cold

Useful for data accessed even less frequently than Cool.

## 9.4 Archive

Used for long-term archival data.

Examples:

-   Long-term backups
-   Compliance data
-   Historical records

Archive has higher retrieval latency and is intended for data that does
not need frequent immediate access.

### Interview Memory

``` text
Hot     = frequently accessed
Cool    = less frequently accessed
Cold    = rarely accessed
Archive = long-term archival
```

> **Important:** Storage cost is not only about GB/month. Consider
> transaction costs, retrieval costs, redundancy and minimum-duration
> considerations when choosing a tier.

------------------------------------------------------------------------

# 10. Storage Replication 🔴🔴

Replication protects data against hardware, zone or regional failures
depending on the selected redundancy option.

Main options:

-   LRS
-   ZRS
-   GRS
-   GZRS

------------------------------------------------------------------------

# 11. LRS --- Locally Redundant Storage 🔴

**LRS = Local Redundancy**

Data is replicated within a single Azure region/storage cluster.

``` text
Region
 |
 +-- Storage
      |
      +-- Copy 1
      +-- Copy 2
      +-- Copy 3
```

### Use when

-   Lower-cost redundancy is acceptable.
-   Protection from local hardware failures is the main requirement.
-   Cross-zone or cross-region protection is not required.

### Memory

> **LRS = Local**

------------------------------------------------------------------------

# 12. ZRS --- Zone-Redundant Storage 🔴

**ZRS = Zone Redundancy**

Data is replicated synchronously across availability zones in the same
Azure region.

``` text
Region
 |
 +-- Zone 1
 |     +-- Data
 |
 +-- Zone 2
 |     +-- Data
 |
 +-- Zone 3
       +-- Data
```

### Use when

You want protection against failure of an availability zone while
keeping data in the same region.

### Memory

> **ZRS = Zones**

------------------------------------------------------------------------

# 13. GRS --- Geo-Redundant Storage 🔴

**GRS = Geo Redundancy**

Data is replicated to a secondary Azure region.

``` text
Primary Region
      |
      | Replication
      v
Secondary Region
```

### Use when

You need protection against a regional disaster.

### Memory

> **GRS = Geography**

------------------------------------------------------------------------

# 14. GZRS --- Geo-Zone-Redundant Storage 🔴

GZRS combines zone redundancy in the primary region with geo-replication
to a secondary region.

``` text
Primary Region
 |
 +-- Zone 1
 +-- Zone 2
 +-- Zone 3
 |
 +-------- Replication -------->
                              Secondary Region
```

### Memory

> **GZRS = Zones + Geography**

------------------------------------------------------------------------

# 15. Replication Quick Table 🔴

  Type   Primary protection
  ------ ----------------------------
  LRS    Local hardware failure
  ZRS    Availability-zone failure
  GRS    Regional disaster
  GZRS   Zone + regional protection

### Easy Memory

``` text
LRS  → Local
ZRS  → Zones
GRS  → Geography
GZRS → Zones + Geography
```

------------------------------------------------------------------------

# 16. Read Access Variants 🟡

You may also see:

-   RA-GRS
-   RA-GZRS

`RA` means **Read Access**.

Conceptually:

``` text
Primary Region
      |
      | Replication
      v
Secondary Region
      |
      +-- Read access
```

These options can allow read access to replicated secondary data,
subject to the service/configuration behavior.

------------------------------------------------------------------------

# 17. Storage Security 🔴🔴

Important security mechanisms:

``` text
                 Azure Storage
                      |
       +--------------+--------------+
       |              |              |
      RBAC            SAS        Access Keys
       |              |              |
 Identity-based   Delegated     Account-level
 authorization      access        credentials
       |
       +------ Private Endpoint
       |
       +------ Encryption
```

------------------------------------------------------------------------

# 18. Access Keys 🔴

Storage accounts have access keys that can authenticate requests to the
storage account.

Typically there are two keys:

``` text
Storage Account
 |
 +-- Key1
 |
 +-- Key2
```

### Why two keys?

They support key rotation.

Example:

``` text
Application → Key1

Generate/prepare Key2
       ↓
Update application
       ↓
Test
       ↓
Regenerate Key1
```

### Security concern

Access keys can provide broad access depending on how they are used.

Therefore:

> Prefer identity-based access such as Microsoft Entra ID + RBAC when
> possible.

### Interview Question

**Q: Should you store a storage account key directly in application
code?**

**Answer:**

> No. Avoid hard-coding storage keys. Prefer managed identity with Entra
> ID and RBAC. If a secret is unavoidable, store it securely in a
> service such as Key Vault.

------------------------------------------------------------------------

# 19. SAS --- Shared Access Signature 🔴

SAS provides **delegated and time-limited access** to storage resources.

Example:

``` text
Application
    |
    | SAS
    v
Blob
```

SAS can restrict things such as:

-   Resource
-   Permissions
-   Start time
-   Expiry time
-   Protocol
-   IP/network restrictions

### Example

You want a user to download one file for 30 minutes.

Instead of giving the user the storage account key:

``` text
User
 |
 | Temporary SAS
 | Read-only
 | Expires in 30 min
 v
Blob
```

### Memory

> **SAS = temporary/delegated access**

------------------------------------------------------------------------

# 20. RBAC --- Role-Based Access Control 🔴🔴

RBAC provides identity-based authorization.

``` text
User / VM / Application
          |
          v
     Entra ID Identity
          |
          v
         RBAC
          |
          v
      Azure Storage
```

Examples of data roles include:

-   Storage Blob Data Reader
-   Storage Blob Data Contributor
-   Storage Blob Data Owner

### Principle

Give the identity only the permissions it needs.

This is the **least privilege** principle.

------------------------------------------------------------------------

# 21. Access Key vs SAS vs RBAC 🔴

  Method       Concept                        Typical use
  ------------ ------------------------------ -------------------------------
  Access Key   Storage account credential     Application/account access
  SAS          Delegated temporary access     Temporary file access
  RBAC         Identity-based authorization   Production application access

### Easy Memory

``` text
Access Key = Account credential
SAS        = Temporary delegated access
RBAC       = Identity + role
```

### Preferred production pattern

``` text
Managed Identity
       ↓
    Entra ID
       ↓
      RBAC
       ↓
    Storage
```

------------------------------------------------------------------------

# 22. Private Endpoint 🔴🔴

Private Endpoint allows a supported Azure service to be accessed through
a **private IP address in your VNet**.

Example:

``` text
VNet
 |
 +-- Application VM
 |
 +-- Private Endpoint
          |
          v
   Azure Storage
```

The application can access the storage service privately rather than
relying on its public endpoint.

------------------------------------------------------------------------

# 23. Private Endpoint + Private DNS 🔴

Private DNS is important because applications normally use a hostname.

Conceptually:

``` text
Application
     |
     | storage hostname
     v
Private DNS
     |
     | resolves to private IP
     v
Private Endpoint
     |
     v
Azure Storage
```

### Troubleshooting

Run:

``` bash
nslookup <storage-account-hostname>
```

You should verify that the name resolves correctly for the private
endpoint design.

------------------------------------------------------------------------

# 24. Storage Network Security 🔴

Storage can be protected using network controls such as:

-   Public network access settings
-   Storage firewall/network rules
-   Virtual network restrictions where supported
-   Private Endpoint
-   Private DNS

Secure design:

``` text
Application
     |
     v
Private VNet
     |
     v
Private Endpoint
     |
     v
Azure Storage
```

------------------------------------------------------------------------

# 25. Encryption 🔴

Azure Storage provides encryption at rest.

Conceptually:

``` text
Application
     |
     | TLS
     v
Azure Storage
     |
     | Encryption at rest
     v
Stored Data
```

### Encryption at rest

Data stored in Azure Storage is encrypted.

### Encryption in transit

Use secure protocols such as HTTPS/TLS.

### Customer-managed keys

For applicable scenarios, organizations can use customer-managed
encryption keys with Azure Key Vault/Managed HSM according to service
support and configuration.

------------------------------------------------------------------------

# 26. Public Access vs Private Access 🔴

A production application should not automatically expose storage
publicly.

Prefer:

``` text
Application
     |
     v
Private Endpoint
     |
     v
Storage
```

instead of:

``` text
Internet
    |
    v
Public Storage Endpoint
```

when private networking is appropriate for the workload.

------------------------------------------------------------------------

# 27. Secure Production Architecture 🔴🔴

A common secure design:

``` text
                  Azure VNet
                     |
              +------+------+
              |             |
          Application     Private DNS
              |
              v
        Managed Identity
              |
              v
          Microsoft
          Entra ID
              |
              v
             RBAC
              |
              v
       Private Endpoint
              |
              v
        Azure Storage
              |
              v
        Encrypted Data
```

### Interview Explanation

> The application uses a managed identity. Entra ID authenticates the
> identity, RBAC authorizes access to the required storage data, and a
> private endpoint provides private network connectivity. Storage
> encryption protects data at rest and TLS protects data in transit.

------------------------------------------------------------------------

# 28. Storage Use Cases 🔴

## Application images

``` text
User
 |
 v
Application
 |
 v
Blob Storage
```

Use:

-   Blob Storage
-   Appropriate access tier
-   Appropriate redundancy

------------------------------------------------------------------------

## Long-term backup

``` text
Application
     |
     v
Backup
     |
     v
Blob Storage
     |
     v
Cool / Archive
```

Choose redundancy and tier according to recovery requirements and access
frequency.

------------------------------------------------------------------------

## Shared files

``` text
VM1 ----\
VM2 -----+---- Azure Files
VM3 ----/
```

Use Azure Files when applications need a shared file system.

------------------------------------------------------------------------

## Temporary download

``` text
Application
     |
     v
Generate SAS
     |
     v
User
     |
     v
Blob
```

Use a short-lived SAS with minimum required permissions.

------------------------------------------------------------------------

# 29. Storage Troubleshooting 🔴🔴

### Scenario

> Application cannot access Blob Storage.

Follow this order:

``` text
1. DNS
   ↓
2. Network connectivity
   ↓
3. Private Endpoint
   ↓
4. Network/firewall rules
   ↓
5. Authentication
   ↓
6. RBAC/SAS permissions
   ↓
7. Container/blob access
   ↓
8. Application configuration
   ↓
9. Logs
```

------------------------------------------------------------------------

# 30. Troubleshooting Example --- Private Endpoint 🔴

### Problem

Application cannot access Blob Storage.

### Step 1 --- Check DNS

``` bash
nslookup <storage-account-hostname>
```

Verify the expected private resolution.

### Step 2 --- Check private endpoint

Verify:

-   Private endpoint exists
-   Correct VNet/subnet
-   Connection status
-   Private IP

### Step 3 --- Check network rules

Verify:

-   Storage firewall
-   Public network access settings
-   VNet/network restrictions

### Step 4 --- Check identity

Verify:

-   Managed identity exists
-   Correct identity is being used

### Step 5 --- Check RBAC

Verify the identity has the required data-plane role.

### Step 6 --- Check application

Verify:

-   Correct storage account
-   Correct container
-   Correct blob
-   Correct endpoint
-   Correct credentials/token flow

------------------------------------------------------------------------

# 31. Scenario --- Storage Key Leaked 🔴🔴

### Interview Question

> What will you do if a storage account access key is leaked?

### Answer

``` text
1. Identify the compromised key
        ↓
2. Investigate where it was exposed
        ↓
3. Check logs/activity
        ↓
4. Rotate/regenerate the compromised key
        ↓
5. Update applications to use the new key
        ↓
6. Validate application access
        ↓
7. Remove the secret from source code/logs/config
        ↓
8. Move toward Entra ID + Managed Identity + RBAC
```

### Important

Do not simply rotate a key without first considering which applications
use it.

If both keys are in use, plan rotation carefully to avoid an outage.

------------------------------------------------------------------------

# 32. Storage Account vs Blob vs Container 🔴

``` text
Storage Account
      |
      +-- Container
             |
             +-- Blob
             +-- Blob
```

### Remember

-   Storage Account = top-level storage resource
-   Container = logical grouping
-   Blob = object/file stored inside container

------------------------------------------------------------------------

# 33. Blob vs Files vs Managed Disk 🔴🔴

  Service        Type            Main use
  -------------- --------------- ----------------------------------
  Blob Storage   Object          Images, backups, documents, logs
  Azure Files    File share      Shared filesystem
  Managed Disk   Block storage   VM disks

### Easy Memory

``` text
Blob  → Object
Files → File Share
Disk  → VM Block Storage
```

------------------------------------------------------------------------

# 34. Queue vs Blob 🔴

  Blob                  Queue
  --------------------- ----------------------------
  Stores objects/data   Stores messages
  Images                Work messages
  Videos                Processing requests
  Backups               Asynchronous communication
  Documents             Decoupling

Example:

``` text
Image
  ↓
Blob

"Process image 123"
  ↓
Queue
```

------------------------------------------------------------------------

# 35. Production Design Example 🔴🔴

### Requirement

A web application needs to upload customer documents securely.

### Design

``` text
                    Internet
                       |
                       v
                 Web Application
                       |
                       v
                Managed Identity
                       |
                       v
                    Entra ID
                       |
                       v
                     RBAC
                       |
                       v
                Private Endpoint
                       |
                       v
                 Blob Storage
                       |
             +---------+---------+
             |                   |
          Container           Encryption
             |
             +-- documents/
             +-- invoices/
             +-- reports/
```

### Why?

-   Blob Storage → object data
-   Managed Identity → avoids hard-coded credentials
-   Entra ID → identity
-   RBAC → least privilege
-   Private Endpoint → private connectivity
-   Encryption → protects stored data
-   Containers → organize objects

------------------------------------------------------------------------

# 36. Interview Questions 🔴🔴

## Q1. What is Azure Storage?

> Azure Storage is a scalable and durable cloud storage platform
> providing services such as Blob, Files, Queue and Table Storage.

## Q2. What is Blob Storage?

> Blob Storage is Azure object storage used for unstructured data such
> as images, videos, documents, backups and logs.

## Q3. Blob vs Azure Files?

> Blob is object storage, while Azure Files provides managed file shares
> that applications can access like a filesystem.

## Q4. What is a container?

> A container is a logical grouping of blobs inside a storage account.

## Q5. LRS vs ZRS?

> LRS keeps redundant copies locally, while ZRS synchronously replicates
> data across availability zones in the same region.

## Q6. GRS vs GZRS?

> GRS provides geo-replication to a secondary region, while GZRS
> combines zone redundancy in the primary region with geo-replication.

## Q7. Access Key vs SAS?

> An access key is a storage-account credential, while SAS provides
> delegated access with restrictions such as permissions and expiry.

## Q8. Why prefer RBAC over storage keys?

> RBAC provides identity-based, role-based access and supports least
> privilege, reducing the need to distribute long-lived storage
> credentials.

## Q9. What is a Private Endpoint?

> A Private Endpoint provides a private IP in a VNet for accessing a
> supported Azure service privately.

## Q10. Why is Private DNS important?

> Applications use hostnames, so Private DNS ensures the storage
> hostname resolves to the private endpoint correctly in a private
> networking design.

## Q11. What happens if a storage key is leaked?

> Investigate the exposure, rotate the compromised key safely, update
> dependent applications, review logs, remove the secret from insecure
> locations and move toward managed identity and RBAC where possible.

------------------------------------------------------------------------

# 37. Must-Know Comparisons 🔴🔴

## LRS vs ZRS vs GRS vs GZRS

``` text
LRS
Local
 ↓
ZRS
Zones
 ↓
GRS
Geography
 ↓
GZRS
Zones + Geography
```

## Access Methods

``` text
Access Key → Account credential

SAS → Temporary delegated access

RBAC → Identity + Role
```

## Networking

``` text
Service Endpoint
      ↓
Subnet-based access to supported Azure service

Private Endpoint
      ↓
Private IP in VNet for service access
```

------------------------------------------------------------------------

# 38. DevOps Engineer Must-Know Checklist 🔴🔴

Before an Azure DevOps interview, you should be able to explain:

-   [ ] Storage Account
-   [ ] Blob Storage
-   [ ] Container
-   [ ] Block Blob
-   [ ] Append Blob
-   [ ] Page Blob
-   [ ] Azure Files
-   [ ] Queue Storage
-   [ ] Table Storage
-   [ ] Hot tier
-   [ ] Cool tier
-   [ ] Cold tier
-   [ ] Archive tier
-   [ ] LRS
-   [ ] ZRS
-   [ ] GRS
-   [ ] GZRS
-   [ ] RA-GRS / RA-GZRS
-   [ ] Access Keys
-   [ ] SAS
-   [ ] RBAC
-   [ ] Managed Identity
-   [ ] Private Endpoint
-   [ ] Private DNS
-   [ ] Storage firewall/network rules
-   [ ] Encryption at rest
-   [ ] TLS/HTTPS
-   [ ] Key Vault integration concepts
-   [ ] Storage troubleshooting
-   [ ] Storage key rotation
-   [ ] Secure production architecture

------------------------------------------------------------------------

# 39. Final One-Page Cheat Sheet 🔴🔴

``` text
STORAGE ACCOUNT
      |
      +-- Blob       → Object storage
      |      |
      |      +-- Container
      |
      +-- Files      → Managed file share
      |
      +-- Queue      → Messages / async processing
      |
      +-- Table      → NoSQL entities
```

``` text
ACCESS TIERS

Hot
 ↓
Cool
 ↓
Cold
 ↓
Archive
```

``` text
REDUNDANCY

LRS  → Local
ZRS  → Zones
GRS  → Geography
GZRS → Zones + Geography
```

``` text
SECURITY

Access Key → Account credential
SAS        → Delegated temporary access
RBAC       → Identity-based access
MI         → Azure-managed application identity
```

``` text
NETWORKING

Private Endpoint
       ↓
Private IP
       ↓
Azure Storage

Private DNS
       ↓
Hostname → Private IP
```

------------------------------------------------------------------------

# 40. Best Production Pattern 🔴🔴🔴

``` text
                    Application
                         |
                         v
                  Managed Identity
                         |
                         v
                      Entra ID
                         |
                         v
                        RBAC
                         |
                         v
                    Private DNS
                         |
                         v
                  Private Endpoint
                         |
                         v
                   Azure Storage
                         |
              +----------+----------+
              |                     |
         Appropriate             Encryption
         Redundancy
```

### Senior Interview Answer

> **For a production workload, I would select the storage service based
> on the access pattern: Blob for object data, Azure Files for shared
> file systems, Queue for asynchronous messaging, and Table for simple
> NoSQL data. I would choose the redundancy and access tier based on
> availability, disaster-recovery and access-frequency requirements. For
> security, I would prefer managed identity with Entra ID and RBAC, use
> private endpoints and private DNS for private connectivity where
> appropriate, and protect data using encryption and TLS.**

------------------------------------------------------------------------

# Final Memory Formula

``` text
Storage
  ↓
Service
  ↓
Tier
  ↓
Replication
  ↓
Network
  ↓
Identity
  ↓
Authorization
  ↓
Encryption
  ↓
Monitoring
```

> **Interview mindset:** Don't just say "I know Blob Storage." Explain
> **what data is stored, how it is accessed, how it is replicated, how
> it is secured, how it is privately connected, and how you troubleshoot
> it.**
