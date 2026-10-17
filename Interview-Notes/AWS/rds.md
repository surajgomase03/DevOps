# Amazon RDS — Complete DevOps Interview Notes

> **Level:** Intermediate to advanced (4–6 years of experience)
> **Roles covered:** DevOps Engineer, Senior DevOps Engineer, SRE, Cloud Engineer, Platform Engineer, DBA-adjacent roles
> **Style:** Simple English, pointwise notes, production scenarios, interview-ready answers

**How to use these notes**

1. Read sections 1–14 to build the mental model.
2. Practise sections 15–16 (CLI, SQL, Terraform, incidents) in a sandbox AWS account.
3. Drill sections 20–21 (Q&A and answer framework) until you can answer without reading.
4. Use section 22 for last-day revision.

**Conventions**

- `<placeholder>` values and names such as `prod-orders-db` are examples. No real passwords, keys, tokens or account IDs appear here.
- **[MANDATORY]** marks a control you should never skip in production. **[OPTIONAL]** marks a design choice that depends on requirements and cost.
- RDS behaviour differs by **engine** (MySQL, PostgreSQL, Oracle, SQL Server and so on) and by **version**. Defaults, quotas, supported versions and newer features change. Where that applies, the note says "verify in the current AWS documentation".
- Examples mostly use **RDS for MySQL** and **RDS for PostgreSQL**. Aurora is covered where it differs.

---

## Table of Contents

1. [What Is Amazon RDS](#1-what-is-amazon-rds)
2. [What RDS Manages and What You Manage](#2-what-rds-manages-and-what-you-manage)
3. [Supported Engines and Deployment Options](#3-supported-engines-and-deployment-options)
4. [Core Components: Instance, Endpoint, Subnet Group, Security Group](#4-core-components-instance-endpoint-subnet-group-security-group)
5. [Parameter Groups and Option Groups](#5-parameter-groups-and-option-groups)
6. [Multi-AZ Deployments and Failover](#6-multi-az-deployments-and-failover)
7. [Read Replicas](#7-read-replicas)
8. [Backups, Snapshots and Point-in-Time Recovery](#8-backups-snapshots-and-point-in-time-recovery)
9. [Storage, IOPS and Connections](#9-storage-iops-and-connections)
10. [Security: Encryption, TLS, Authentication and Secrets](#10-security-encryption-tls-authentication-and-secrets)
11. [Monitoring, Logging and Alerting](#11-monitoring-logging-and-alerting)
12. [Maintenance, Upgrades and Blue/Green Deployments](#12-maintenance-upgrades-and-bluegreen-deployments)
13. [RDS Proxy](#13-rds-proxy)
14. [Disaster Recovery and Cost Optimization](#14-disaster-recovery-and-cost-optimization)
15. [Hands-On: CLI, SQL and Terraform](#15-hands-on-cli-sql-and-terraform)
16. [Production Troubleshooting Scenarios](#16-production-troubleshooting-scenarios)
17. [Security, Reliability and Best Practices](#17-security-reliability-and-best-practices)
18. [Comparison Tables](#18-comparison-tables)
19. [Enterprise Reference Architecture](#19-enterprise-reference-architecture)
20. [Interview Questions and Answers](#20-interview-questions-and-answers)
21. [Interview Answer Framework](#21-interview-answer-framework)
22. [Quick Revision](#22-quick-revision)

---

## 1. What Is Amazon RDS

### 1.1 Definition

1. **Amazon Relational Database Service (RDS)** is a **managed relational database service**. AWS runs the database servers, storage, backups, patching and failover automation. You run the schema, queries, users and tuning.
2. You pick an **engine** (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2) or **Amazon Aurora** (MySQL- and PostgreSQL-compatible), an **instance class**, storage and a network placement. RDS creates the database and gives you an **endpoint** (a DNS name) to connect to.
3. You do **not** get operating-system access (SSH or RDP) on standard RDS. For OS access you would use **RDS Custom** (Oracle and SQL Server) or run the database on EC2.
4. You pay for instance hours, storage, provisioned IOPS (if used), backup storage beyond the free allowance, data transfer and optional features. There is no charge for the RDS service itself apart from these resources.

### 1.2 Why it is needed

1. **Less undifferentiated work:** patching, backups and failover automation are built in.
2. **High availability:** Multi-AZ gives automatic failover to a standby in another Availability Zone (AZ).
3. **Recovery:** automated backups and **point-in-time recovery (PITR)**.
4. **Scalability:** vertical scaling (bigger class), storage autoscaling and **read replicas** for read-heavy load.
5. **Security:** encryption with AWS Key Management Service (KMS), TLS, VPC isolation, IAM integration and Secrets Manager.
6. **Visibility:** CloudWatch metrics, Enhanced Monitoring, Performance Insights, logs and events.

### 1.3 Example

An orders application needs MySQL.

| Need | RDS feature |
| --- | --- |
| Survive an AZ failure | Multi-AZ |
| Roll back a bad migration at 14:07 | PITR to 14:06 into a new instance |
| Reports must not slow checkout | Read replica for reporting |
| Passwords must not live in code | RDS-managed secret in Secrets Manager |
| Disk fills as data grows | Storage autoscaling with a maximum |

### 1.4 When not to use RDS

1. You need **OS-level control**, unsupported extensions, a custom engine build or an unsupported version. Consider RDS Custom or EC2.
2. You need a **key-value or document** model at extreme scale. Consider DynamoDB or DocumentDB.
3. You need a **data warehouse**. Consider Redshift.
4. You need **cross-engine tuning at kernel level**, such as custom huge pages or custom storage layout.

### 1.5 Interview pointers

Q1 (what and why), Q19 (RDS vs database on EC2).

---

## 2. What RDS Manages and What You Manage

This follows the **shared responsibility model**.

| Area | AWS manages | You manage |
| --- | --- | --- |
| Hardware, host OS, hypervisor | Yes | No |
| Database engine installation and minor patching | Yes (within your maintenance settings) | Choose versions, window and upgrade timing |
| Storage provisioning and replication | Yes | Size, type, IOPS and autoscaling limit |
| Automated backups and snapshots | Runs them | Retention, copy to other Regions, restore tests |
| Multi-AZ failover automation | Yes | Choose to enable it, app reconnect logic |
| Network placement | Provides the service | VPC, subnets, security groups, public access |
| Encryption | Provides KMS integration | Enable at creation, key policy, TLS in the client |
| Database users, privileges, schema | No | Yes |
| Query performance, indexes, locks | No | Yes |
| Parameter tuning | Provides parameter groups | Set and test values |
| Monitoring | Provides metrics and tools | Alarms, dashboards, on-call |
| Application connection handling | No | Pooling, timeouts, retries |

### 2.1 Key points

1. AWS can patch and restart the instance, but it **cannot fix a bad query or a missing index**.
2. Backups exist only if you configured retention (and a restore only works if you have tested it).
3. A Multi-AZ failover causes a short outage. **Your application must retry and re-resolve DNS.**

### 2.2 Interview pointers

Q2 (what AWS manages and what you manage).

---

## 3. Supported Engines and Deployment Options

### 3.1 Engines

| Engine | Notes |
| --- | --- |
| **MySQL** | Popular open source. Read replicas, Multi-AZ instance and cluster, Blue/Green |
| **PostgreSQL** | Rich features and extensions (a fixed allowed list). Read replicas, Multi-AZ instance and cluster |
| **MariaDB** | MySQL fork. Similar features to MySQL |
| **Oracle** | Licence-included or bring-your-own-licence (BYOL). Uses option groups |
| **SQL Server** | Licence-included. Uses option groups. Some features differ (for example Multi-AZ mechanism) |
| **Db2** | IBM Db2 on RDS. Check supported features |
| **Aurora MySQL / PostgreSQL** | Cloud-native engine with shared cluster storage (section 3.3) |

Supported versions, Multi-AZ options, instance classes and limits vary. Always verify in the current AWS documentation before you design.

### 3.2 Deployment options

| Option | What it means |
| --- | --- |
| **Single-AZ DB instance** | One instance in one AZ. Cheapest. Dev and test only |
| **Multi-AZ DB instance** | Primary plus one **synchronous standby** in another AZ. Standby is **not readable**. Automatic failover |
| **Multi-AZ DB cluster** | One writer plus **two readable standbys** in three AZs (MySQL and PostgreSQL). Faster failover, readable reader endpoint |
| **Read replica(s)** | Asynchronous copies for read scaling and DR. Separate endpoints |
| **Aurora cluster** | Writer plus up to 15 Aurora Replicas sharing one storage volume |
| **RDS Custom** | Managed with OS and database access, for Oracle and SQL Server workloads needing customisation |
| **RDS on Outposts** | RDS on AWS Outposts hardware for on-premises data residency needs |

### 3.3 Aurora in one minute

1. Aurora separates **compute** and **storage**. The cluster volume grows automatically (up to 128 TiB) and keeps **six copies across three AZs**.
2. Replicas read from the same storage, so **replica lag is usually small** (tens of milliseconds, typically).
3. Failover promotes a replica. It is usually faster than standard Multi-AZ because there is no storage resync.
4. Extras: **Aurora Global Database** (cross-Region, low lag), **Aurora Serverless v2** (capacity scales in ACUs), fast clones and Backtrack (MySQL-compatible).
5. Trade-off: it is AWS-specific and generally costs more per instance than standard RDS for similar compute.

### 3.4 Interview pointers

Q3 (engines and options), Q21 (Aurora vs RDS).

---

## 4. Core Components: Instance, Endpoint, Subnet Group, Security Group

### 4.1 Architecture (single Region, Multi-AZ instance)

```text
                           VPC (10.0.0.0/16)
   +--------------------------------------------------------------------+
   |  App subnets (private)                                             |
   |     [ App / ECS / EKS / EC2 ] --- SG: app-sg                       |
   |                |                                                   |
   |                v  TCP 3306 (only from app-sg)                      |
   |  DB subnets (private, no route to Internet Gateway)                |
   |   AZ-a                                  AZ-b                       |
   |  +--------------------+   sync   +--------------------+            |
   |  | PRIMARY (writer)   |--------->| STANDBY            |            |
   |  | EBS volume         |  repl.   | EBS volume         |            |
   |  +--------------------+          +--------------------+            |
   |        ^   endpoint: prod-orders-db.<id>.<region>.rds.amazonaws.com |
   +--------------------------------------------------------------------+
   Backups -> S3 (managed by RDS) ; Logs/metrics -> CloudWatch ; Keys -> KMS
```

### 4.2 DB instance and instance class

1. A **DB instance** is the isolated database environment: compute, memory, network and attached storage.
2. The **DB instance class** sets vCPU, memory and network capacity. Families include:
   1. **General purpose:** `db.m*` (balanced).
   2. **Memory optimised:** `db.r*`, `db.x*` (large caches, many connections).
   3. **Burstable:** `db.t*` (CPU credits). Fine for dev and test. **Risky for steady production load** because CPU credits can run out.
3. Many classes use **Graviton** processors (names with a `g` such as `db.m7g`). They often give better price/performance. Test your engine version and extensions first.
4. Changing the class is a **modify** operation. It needs a restart (a short outage on Single-AZ, a failover on Multi-AZ).
5. Instance class limits many things, including `max_connections` (defaults are formulas based on memory).

### 4.3 Endpoint

1. The **endpoint** is a DNS name, for example `prod-orders-db.<id>.<region>.rds.amazonaws.com`, plus a port (3306 MySQL, 5432 PostgreSQL, 1433 SQL Server, 1521 Oracle).
2. After a failover the endpoint **DNS record changes** to point to the new primary. The IP address changes. **Never connect by IP address.**
3. Clients that cache DNS for a long time (long JVM DNS TTL, connection pools that never re-resolve) keep sending traffic to the old primary and fail. Set a short DNS TTL and use pool validation and retry.
4. Other endpoints:
   1. **Read replica endpoint:** one per replica.
   2. **Multi-AZ DB cluster:** a cluster (writer) endpoint, a reader endpoint and instance endpoints.
   3. **Aurora:** cluster endpoint (writer), reader endpoint (load balances readers), custom endpoints and instance endpoints.
   4. **RDS Proxy endpoint** (section 13).
5. Outside the VPC, the endpoint resolves to a **public IP only if the instance is publicly accessible**. Inside the VPC it resolves to a private IP.

### 4.4 DB subnet group

1. A **DB subnet group** is a set of subnets (in the same VPC) where RDS may place the instance. It must cover **at least two AZs** (even for Single-AZ instances).
2. Use **private subnets** reserved for databases, with no route to an internet gateway.
3. Include a subnet in every AZ you plan to use, with enough free IPs for failover, replicas and maintenance.
4. You cannot move an instance to another VPC by editing the subnet group. You must restore from a snapshot to the new VPC (or use a replica or migration tool).

### 4.4.1 Subnet layout example

| Tier | Subnets | Routes |
| --- | --- | --- |
| Public | `10.0.0.0/24`, `10.0.1.0/24`, `10.0.2.0/24` | Internet gateway (ALB, NAT) |
| App (private) | `10.0.10.0/24` ... | NAT gateway for outbound |
| **Database (private)** | `10.0.20.0/24`, `10.0.21.0/24`, `10.0.22.0/24` | **Local only** |

### 4.5 Security group for RDS

1. A **security group (SG)** is a stateful firewall on the instance's network interface.
2. **[MANDATORY]** Allow the database port **only from the application's security group**, not from `0.0.0.0/0` and not from wide CIDR ranges.
3. Do not open outbound rules wider than needed (the default allow-all outbound is usually fine for RDS, but review it in regulated environments).
4. Use separate SGs for the app, the DB, the bastion or admin path, and RDS Proxy.
5. Typical rule:

| Direction | Protocol/Port | Source | Reason |
| --- | --- | --- | --- |
| Inbound | TCP 3306 | `sg-app` | Application to database |
| Inbound | TCP 3306 | `sg-proxy` (if used) | Proxy to database |
| Inbound | TCP 3306 | `sg-admin` (SSM-based bastion) | Admin tools |

6. **Network ACLs** (NACLs) are stateless and apply to subnets. They rarely cause RDS trouble unless someone edited them, but check them when SGs look correct and connections still time out.

### 4.6 Public accessibility

1. **Publicly accessible = Yes** gives the instance a public IP and DNS that resolves publicly. Even then, the **SG still decides** who can connect, and the subnet must route to an internet gateway.
2. **[MANDATORY]** Keep production databases **not publicly accessible**. For developer access use **AWS Systems Manager (SSM) Session Manager port forwarding**, a VPN or AWS Client VPN, or a bastion with no inbound SSH.

### 4.7 Interview pointers

Q4 (instance, class, endpoint), Q5 (subnet group), Q6 (security group and public access).

---

## 5. Parameter Groups and Option Groups

### 5.1 Parameter groups

1. A **DB parameter group** holds engine configuration values (what you would put in `my.cnf` or `postgresql.conf`). One parameter group is attached to an instance.
2. The **default parameter group cannot be changed**. Create a **custom** parameter group and attach it.
3. A parameter group belongs to a **family** such as `mysql8.0` or `postgres16`. A major version upgrade needs a parameter group of the new family.
4. Parameters are **dynamic** or **static**:
   1. **Dynamic:** applied without restart (with the default apply method `immediate`, or `pending-reboot`).
   2. **Static:** applied only after a **reboot**. The instance shows the status **`pending-reboot`** until you restart it.
5. Changing the *attached parameter group* itself also needs a reboot to take effect.
6. **Aurora** has two levels: **DB cluster parameter groups** (cluster-wide) and **DB parameter groups** (per instance).

### 5.2 Useful parameters (names depend on engine; verify for your version)

| Goal | MySQL | PostgreSQL |
| --- | --- | --- |
| Force TLS | `require_secure_transport = 1` | `rds.force_ssl = 1` |
| Slow query log | `slow_query_log = 1`, `long_query_time = 2` | `log_min_duration_statement = 2000` (ms) |
| Connection limit | `max_connections` | `max_connections` |
| Time zone | `time_zone` | `timezone` |
| Preload libraries | n/a | `shared_preload_libraries` (static, for example `pg_stat_statements`, `pgaudit`) |
| Log output | `log_output = FILE` | `log_statement`, `log_connections`, `log_disconnections` |

### 5.3 Option groups

1. **Option groups** enable extra engine features on engines that use them, mainly **Oracle, SQL Server, MySQL and MariaDB** (for example the MariaDB audit plugin for MySQL, TDE for Oracle and SQL Server, native backup/restore for SQL Server).
2. **PostgreSQL does not use option groups.** Enable extensions with `CREATE EXTENSION` and, where required, `shared_preload_libraries`.

### 5.4 Safe change process

1. Create a custom parameter group in IaC and review the diff.
2. Test in a lower environment with a production-like load.
3. Apply during a window and **plan for the reboot** if any parameter is static.
4. Check `describe-db-instances` for `ParameterApplyStatus` = `pending-reboot`.
5. Keep a record of what changed (for rollback).

### 5.5 Common mistakes

1. Editing the default group (not allowed) or forgetting to attach the custom group.
2. Forgetting that static changes sit in `pending-reboot` until a restart. A later maintenance reboot then applies surprise changes.
3. Setting `max_connections` far above what memory supports, then hitting out-of-memory.
4. Copying values from a different instance class.

### 5.6 Interview pointers

Q13 (static vs dynamic parameters, option groups).

---

## 6. Multi-AZ Deployments and Failover

### 6.1 Multi-AZ DB instance deployment

1. RDS creates a **primary** in one AZ and a **standby** in another AZ, with **synchronous** replication of storage. A write is acknowledged only after it is durable in both.
2. The standby is **not readable**. It exists for high availability, not read scaling.
3. On failure, RDS **promotes the standby** and updates the endpoint DNS. AWS documentation typically quotes **about 60–120 seconds**; verify the current figure. Large crash-recovery work or long transactions can make it longer.
4. Backups and some maintenance run against the standby to reduce impact on the primary.

### 6.2 What triggers a failover

1. Primary host or AZ failure, or the network path to it failing.
2. Storage failure on the primary.
3. **Instance class change** or OS/engine patching (the standby is patched first, then a failover happens).
4. Manual **reboot with failover** (the standard way to test).
5. An unresponsive primary detected by RDS health checks.

### 6.3 Failover sequence (step by step)

```text
1. RDS detects failure (health checks / AZ event)
2. Standby is promoted to primary (engine recovery runs)
3. Endpoint DNS CNAME is updated to the new primary
4. Old primary host is replaced and becomes the new standby (resyncs)
5. Clients with open connections get errors; they reconnect after DNS update
6. RDS events are published: failover started / completed
```

### 6.4 Multi-AZ DB cluster deployment (MySQL and PostgreSQL)

1. One **writer** and **two readable standbys** in three AZs. Replication is **semi-synchronous**: the writer waits for at least one standby to acknowledge.
2. A **reader endpoint** load balances reads across standbys. Standbys can serve read traffic.
3. Failover is typically **faster** (AWS documents around 35 seconds or less; verify), and write latency can be lower because of local storage options.
4. Limits: only some engines, versions and instance classes are supported, and some features (for example certain replicas and upgrade paths) differ. Verify in the documentation.

### 6.5 Application requirements for a clean failover

1. Use the **endpoint DNS name**, never an IP.
2. Keep DNS caching short (for Java, set `networkaddress.cache.ttl` to a low value, such as 5–30 seconds).
3. Set **connection and socket timeouts**. Use pool validation (`SELECT 1`) and **retry with exponential backoff and jitter** for idempotent operations.
4. Make transactions **idempotent** or wrap them so that a retry does not double-charge.
5. Consider **RDS Proxy** (section 13) to absorb connection storms and preserve app connections during failover.
6. **Test failover** regularly in staging: `aws rds reboot-db-instance --db-instance-identifier <id> --force-failover`.

### 6.6 Multi-AZ is not a backup

1. Synchronous replication copies **everything**, including a bad `DROP TABLE` or a corrupt write. You still need backups and PITR.
2. Multi-AZ protects against **infrastructure failure**, not human or application error, and not Region loss.

### 6.7 Interview pointers

Q7 (Multi-AZ), Q9 (Multi-AZ vs read replica), Q20 (instance vs cluster), Q24 (failover internals).

---

## 7. Read Replicas

### 7.1 What they are

1. A **read replica** is a read-only copy of a source DB instance, updated **asynchronously** using the engine's native replication.
2. Each replica has **its own endpoint**. Your application must send reads to it explicitly (or through a library, proxy or reader endpoint where available).
3. Uses: **scale reads**, offload **reporting and analytics**, serve **users in another Region**, and act as a **DR copy** that can be **promoted**.
4. For RDS MySQL, MariaDB and PostgreSQL you can have many replicas per source (up to 15 at the time of writing; verify), and you can create **cross-Region** replicas. Oracle and SQL Server replicas have their own rules and licences.
5. A replica can itself be **Multi-AZ**, and replicas can have **different instance classes** and parameter groups than the source (the replica should be large enough to keep up).

### 7.2 Replica lag

1. Because replication is asynchronous, a replica can be **behind**. The CloudWatch metric is **`ReplicaLag`** (seconds).
2. Causes of lag:
   1. **Write-heavy source** or large transactions (single-threaded apply in older MySQL setups).
   2. **Under-sized replica** (CPU, IOPS) or a replica running heavy reporting queries.
   3. **Long-running queries on the replica** causing conflicts (PostgreSQL hot standby conflicts).
   4. **Network distance** (cross-Region).
   5. **Schema changes** (large `ALTER TABLE`) on the source.
3. Fixes: bigger replica or storage IOPS, tune parallel replication, break up large transactions, move heavy reports elsewhere, add `max_standby_streaming_delay` tuning for PostgreSQL, or use an Aurora/Multi-AZ cluster if you need smaller lag.
4. **Application impact:** after a write, a read from the replica may not see it. Use **read-after-write routing** (read your own writes from the primary) for those flows.

### 7.3 Promotion

1. You can **promote** a replica to a standalone DB instance. It stops replicating and becomes writable. **This cannot be undone.**
2. Promotion is used for **DR** (cross-Region), **sharding or splitting** a workload, and as the cutover step in some migrations.
3. After promotion you must repoint the application, create a new replica set, and fix backups and Multi-AZ on the new primary.
4. Data written to the source but not yet replicated is **lost** (RPO equals the lag at the time).

### 7.4 Requirements and notes

1. **Automated backups must be enabled** on the source for MySQL and MariaDB replicas (they need binary logs). A retention of 0 disables them.
2. Replicas of an **encrypted** source must be encrypted. Cross-Region replicas need a **KMS key in the target Region**.
3. Replica security groups are **separate**. Allow the application to reach the replica endpoint.
4. A read replica is **not a backup**. It copies bad writes too.
5. PostgreSQL replication slots that are inactive can hold WAL and fill source storage. Monitor `OldestReplicationSlotLag` and `TransactionLogsDiskUsage`.

### 7.5 Multi-AZ vs read replica (quick view)

| Feature | Multi-AZ instance | Read replica |
| --- | --- | --- |
| Purpose | High availability | Read scaling, reporting, DR |
| Replication | Synchronous | Asynchronous |
| Readable | No (standby) | Yes |
| Failover | Automatic | Manual promotion |
| Cross-Region | No | Yes |
| Own endpoint | No (same endpoint) | Yes |

### 7.6 Interview pointers

Q8 (read replicas), Q9 (Multi-AZ vs read replica), Q26 (replica lag).

---

## 8. Backups, Snapshots and Point-in-Time Recovery

### 8.1 Automated backups

1. RDS takes a **daily snapshot** during your **backup window** and continuously uploads **transaction logs**. Together they allow **PITR**.
2. The **backup retention period** is **0 to 35 days**. **0 disables automated backups** (and prevents replicas for engines that need them). The CLI default and the console default can differ, so set it explicitly.
3. Backups are stored in **Amazon S3, managed by RDS** (you do not see the bucket).
4. Backup storage up to the size of your provisioned database storage in the Region is free; extra backup storage is billed. Verify current pricing.
5. **When you delete an instance**, automated backups are deleted with it unless you choose to **retain automated backups**. **Manual snapshots remain.**
6. On a **Single-AZ** instance, the backup can briefly suspend I/O. On **Multi-AZ**, backups are generally taken from the standby, so impact on the primary is small (engine-specific; verify).

### 8.2 Manual snapshots

1. A **manual DB snapshot** is user-initiated and kept **until you delete it**.
2. Use before risky changes (major upgrade, schema migration) and for long-term retention.
3. Snapshots can be **copied** (to another Region or re-encrypted with another KMS key) and **shared** with other AWS accounts.
4. Sharing an **encrypted** snapshot requires a **customer-managed KMS key** whose key policy allows the other account. Snapshots encrypted with the default `aws/rds` key cannot be shared.
5. **Never make snapshots public** unless the data is genuinely public (and encrypted snapshots cannot be made public).

### 8.3 Point-in-time recovery (PITR)

1. PITR restores to **any second within the retention window**, up to the **latest restorable time** (typically about 5 minutes behind now).
2. **PITR always creates a NEW DB instance** with a new endpoint. It never rewinds the existing one.
3. After the restore you must: attach the right **SG, subnet group, parameter group and option group** (they are not always inherited automatically; set them explicitly), enable Multi-AZ if needed, and check backup settings.
4. Cut over by repointing the application (or by renaming instances, which needs care) after you validate data.
5. For targeted recovery (one table), restore to a new instance and **copy only the needed rows** back.

### 8.4 Restoring from a snapshot

1. `restore-db-instance-from-db-snapshot` creates a new instance from a snapshot, in any compatible configuration (different class, Multi-AZ or storage type).
2. To **encrypt an unencrypted database**: snapshot -> **copy the snapshot with encryption** (choose a KMS key) -> restore from the encrypted copy. (section 10.2)

### 8.5 AWS Backup and cross-Region copies

1. **AWS Backup** centralises backup plans, retention, cross-Region and cross-account copies, vault lock (immutability) and reports for RDS and other services.
2. **Cross-Region automated backup replication** (supported for several engines; verify) replicates snapshots and transaction logs to another Region, enabling **PITR in the DR Region**.
3. For ransomware and insider-threat protection, copy backups to a **separate account** with restricted access and consider **Backup Vault Lock**.

### 8.6 Restore testing

1. A backup that has never been restored is an assumption. **Schedule restore tests** (monthly or per policy) and record the **restore time** (your real RTO) and data validation results.
2. Measure restore time: large databases can take hours. Storage is lazily loaded, so the first queries on a restored volume can be slow (warm-up).

### 8.7 Common mistakes

1. Retention set to 0 or 1 day for production.
2. Expecting PITR to overwrite the existing instance.
3. Not carrying SG, parameter group and subnet group settings to the restored instance.
4. Deleting an instance with `skip-final-snapshot` and no manual snapshot.
5. Using the default KMS key for snapshots that must be shared.

### 8.8 Interview pointers

Q10 (automated vs manual), Q11 (PITR), Q35 (encrypting an existing database), Q32 (data corruption scenario).

---

## 9. Storage, IOPS and Connections

### 9.1 Storage types

| Type | Notes |
| --- | --- |
| **General Purpose SSD gp3** | Baseline IOPS and throughput that do not depend on size; you can provision more above the baseline. Usual default choice. Verify limits per engine and size |
| **General Purpose SSD gp2** | IOPS scale with size (about 3 IOPS per GiB) with **burst credits**. Small volumes can run out of burst (`BurstBalance` falls) |
| **Provisioned IOPS SSD (io1 / io2 Block Express)** | Consistent high IOPS and low latency for I/O-intensive production. Costs more |
| **Magnetic (standard)** | Legacy. Avoid |

1. Typical maximum storage is **64 TiB** for most engines (SQL Server is lower; verify).
2. **Storage can grow but cannot shrink.** To reduce size you must migrate to a new, smaller instance (dump/restore, DMS or logical replication).
3. After a storage modification there is a **cool-down** (about 6 hours) before another one, and optimisation can take time. Plan changes ahead of need, not at 99% full. Verify the current rules.
4. IOPS and throughput are limited by **both** the volume and the **instance class** (network/EBS bandwidth). A big volume on a small class can still be capped.

### 9.2 Storage autoscaling

1. Enable it by setting a **maximum storage threshold** (`max_allocated_storage`).
2. RDS scales up automatically when **free space is low** (roughly under 10% of allocated storage), the condition lasts a few minutes, and enough time has passed since the last change. The increase is the larger of a minimum step, a percentage of storage, or a predicted amount (verify exact values).
3. **[MANDATORY]** Still set an **alarm on `FreeStorageSpace`**. Autoscaling hides growth, can hit the maximum, and costs more money as the disk grows.
4. A runaway process (a log table, a bad batch job) can fill the disk and scale cost. Find the cause, do not just add space.

### 9.3 IOPS troubleshooting

1. Check `ReadIOPS`, `WriteIOPS`, `ReadLatency`, `WriteLatency`, `DiskQueueDepth` and (for gp2) `BurstBalance`.
2. Compare with the volume and **instance class** limits (EBS-optimised bandwidth). Also look at `EBSIOBalance%` and `EBSByteBalance%` for burstable classes.
3. High `DiskQueueDepth` with high latency means the storage is saturated. Fix by tuning queries and indexes first, then by gp3/io2 IOPS, then by a larger class.

### 9.4 Connections

1. The **default `max_connections`** is derived from instance memory. For example (verify for your version):
   1. MySQL: `{DBInstanceClassMemory/12582880}`
   2. PostgreSQL: `LEAST({DBInstanceClassMemory/9531392}, 5000)`
2. Each connection uses memory. **More connections do not mean more throughput.** Too many active connections cause context switching and out-of-memory conditions.
3. Symptoms of connection exhaustion: `Too many connections` (MySQL), `remaining connection slots are reserved` (PostgreSQL), apps timing out waiting for a connection.
4. Fixes: **connection pooling** in the app (right-sized pool), **RDS Proxy**, closing idle connections, lowering per-pod pool sizes (remember `pods × pool size`), a larger class, and fixing leaks (connections not closed).
5. Lambda and autoscaling fleets are a classic cause: every new instance opens many connections. Use RDS Proxy.

### 9.5 Interview pointers

Q12 (storage types and autoscaling), Q25 (connection management), Q30 (storage full scenario).

---

## 10. Security: Encryption, TLS, Authentication and Secrets

### 10.1 Defence in depth

```text
Network:      private subnets -> SG from app only -> no public access
Identity:     IAM controls the RDS API; DB users/IAM auth control SQL access
Data:         KMS encryption at rest; TLS in transit
Secrets:      Secrets Manager (RDS-managed master password), rotation
Audit:        CloudTrail (API), DB audit logs, Config rules, Security Hub
Protection:   deletion protection, final snapshot, backups in another account
```

### 10.2 Encryption at rest

1. RDS uses **AES-256 with AWS KMS**. It encrypts the storage, automated backups, snapshots, read replicas and logs of the instance.
2. **Choose encryption when you create the instance.** You cannot simply turn it on for an existing unencrypted instance.
3. **To encrypt an existing database:**
   1. Take a snapshot.
   2. **Copy the snapshot with encryption enabled** and choose a KMS key.
   3. **Restore** from the encrypted copy to a new instance.
   4. Test, cut over, and delete the old instance after a safe period.
   For minimal downtime use a read replica or AWS Database Migration Service (DMS) approach, or Blue/Green where supported.
4. Use a **customer-managed KMS key** when you need key policies, rotation control, audit through CloudTrail or **cross-account snapshot sharing**.
5. Disabling or deleting the KMS key makes the database **inaccessible**. Protect the key (deletion waiting period, key policy, alarms).
6. Encryption has **no meaningful application change** and low performance impact.

### 10.3 Encryption in transit (TLS)

1. RDS supports TLS connections. Download the **RDS CA certificate bundle** (for example the global bundle) and make clients **verify the server certificate** (`verify-full` in PostgreSQL, `--ssl-mode=VERIFY_IDENTITY` in MySQL).
2. **Enforce TLS on the server:** PostgreSQL `rds.force_ssl = 1`, MySQL `require_secure_transport = 1` (SQL Server uses `rds.force_ssl`; Oracle uses SSL options).
3. **CA certificates expire and are rotated.** Track your instances' CA identifier (`CACertificateIdentifier`) and plan rotation before expiry. A forgotten expiry breaks clients that verify the CA. Verify the current CA names and dates in the documentation.

### 10.4 Authentication options

| Method | How it works | Notes |
| --- | --- | --- |
| **Native DB users and passwords** | Password stored in the database | Needs strong passwords, rotation and a secrets store |
| **IAM database authentication** | Client uses a short-lived **auth token** (valid **15 minutes** for opening the connection) from `aws rds generate-db-auth-token` | MySQL, PostgreSQL, MariaDB; **TLS is required**; policy action `rds-db:connect`; good for services with IAM roles; connection rate limits apply |
| **Kerberos / Active Directory** | Directory authentication for supported engines | Common for SQL Server, Oracle, PostgreSQL, MySQL in AD environments |
| **Secrets Manager** | Stores and rotates the password | Pairs with native users |

### 10.5 Master user password and Secrets Manager

1. The **master user** has high privileges. Do **not** use it from applications.
2. **[MANDATORY]** Do not put the master password in code, Terraform variables, state files, tickets or CI logs.
3. Use **RDS-managed master user password** (`manage_master_user_password = true`): RDS creates the secret in **Secrets Manager**, rotates it automatically, and you never see the password in your IaC or Terraform state (state holds only the secret ARN). You can choose the KMS key for the secret.
4. For application users, create **least-privilege users** and store credentials in Secrets Manager with **rotation** (a Lambda rotation function, or IAM database authentication to avoid passwords).
5. Application code reads the secret at start-up (and refreshes when rotation happens) using its **IAM role** (`secretsmanager:GetSecretValue` on that secret ARN only).

### 10.6 Other security controls

1. **Deletion protection:** blocks accidental deletion of the instance. **Final snapshot** on delete.
2. **IAM policies:** restrict who can `DeleteDBInstance`, `ModifyDBInstance`, `DeleteDBSnapshot`, `ModifyDBSnapshotAttribute` (sharing) and `RestoreDBInstanceFromDBSnapshot`. Use tags and conditions.
3. **Auditing:** CloudTrail for the RDS API. Database audit logging (MariaDB audit plugin via option group for MySQL, `pgaudit` for PostgreSQL, SQL Server Audit, Oracle auditing) exported to CloudWatch Logs.
4. **AWS Config rules** such as `rds-instance-public-access-check`, `rds-storage-encrypted`, `rds-multi-az-support`, `rds-instance-deletion-protection-enabled` detect drift. **Security Hub** and **Amazon GuardDuty RDS Protection** help find risk and suspicious logins.
5. **Patch** minor versions regularly and keep out of unsupported versions (Extended Support costs extra).
6. **Least privilege inside the database:** separate users for migrations (DDL), the app (DML) and read-only reporting.
7. Use **VPC endpoints** for Secrets Manager and KMS if the app subnets have no NAT.

### 10.7 Common mistakes

1. Publicly accessible instance with an SG open to `0.0.0.0/0`.
2. Plain-text master password in Terraform variables (it lands in the state file).
3. Application using the master user.
4. Unencrypted database discovered late (hard to fix).
5. Unencrypted connections allowed (no `force_ssl`).
6. Sharing snapshots with `all` or deleting a KMS key still in use.

### 10.8 Interview pointers

Q14 (encryption), Q15 (Secrets Manager and IAM auth), Q34 (hardening), Q35 (encrypt existing), Q36 (enforce TLS), Q37 (auditing and compliance), Q33 (password leak).

---

## 11. Monitoring, Logging and Alerting

### 11.1 CloudWatch metrics (standard, free, 1-minute granularity)

| Metric | Why it matters |
| --- | --- |
| `CPUUtilization` | Sustained high CPU: missing indexes, heavy queries, undersized class |
| `FreeableMemory` | Low memory: swapping, too many connections, large sorts |
| `SwapUsage` | Any steady swap is a warning |
| `FreeStorageSpace` | Disk filling. **Alarm early** |
| `DatabaseConnections` | Approaching `max_connections` |
| `ReadLatency`, `WriteLatency` | Storage or query pressure |
| `ReadIOPS`, `WriteIOPS`, `DiskQueueDepth` | Storage saturation |
| `BurstBalance` (gp2), `EBSIOBalance%`, `EBSByteBalance%` | Burst credits running out |
| `CPUCreditBalance` (burstable classes) | Credits exhausted -> CPU throttled |
| `ReplicaLag` | Replica falling behind |
| `NetworkReceiveThroughput`, `NetworkTransmitThroughput` | Network limits |
| `BinLogDiskUsage` (MySQL) | Binary logs consuming space |
| `OldestReplicationSlotLag`, `TransactionLogsDiskUsage`, `MaximumUsedTransactionIDs` (PostgreSQL) | Stuck slots, WAL growth, transaction ID wraparound risk |

### 11.2 Enhanced Monitoring

1. Shows **OS-level metrics** (per-process CPU and memory, file system, load) at intervals from **1 to 60 seconds**, sent to CloudWatch Logs through an **IAM role** that RDS assumes.
2. Use it to tell whether CPU is the engine or something else, and to see memory distribution.
3. Costs extra for the log volume at high granularity.

### 11.3 Performance Insights and Database Insights

1. **Performance Insights (PI)** shows **database load** as **average active sessions (AAS)** compared with the number of vCPUs, and breaks it down by **top SQL, wait events, users and hosts**.
2. If AAS is **above the vCPU count** for a long time, the database is overloaded (CPU or waiting on locks/I/O).
3. A short free retention is included, and longer retention is paid. AWS has been integrating PI capabilities into **CloudWatch Database Insights**. Verify the current console and retention details.
4. Use PI to find the **top SQL by load** and the **wait events** (for example I/O waits, lock waits, `CPU`).

### 11.4 Logs

1. Export **error, general, slow query, audit and upgrade logs** to **CloudWatch Logs** (`enable-cloudwatch-logs-exports`).
2. Turn on the **slow query log** (MySQL `slow_query_log`, `long_query_time`) or `log_min_duration_statement` (PostgreSQL). The general log is very verbose; enable it only briefly.
3. Add **log retention** in CloudWatch Logs to control cost, and **metric filters** for critical errors.
4. **PostgreSQL:** add `pg_stat_statements` for query statistics.

### 11.5 RDS events and notifications

1. RDS publishes **events** (failover, reboot, backup, low storage, maintenance, configuration change, security group changes).
2. Create **event subscriptions** to **Amazon SNS** for instance, snapshot and parameter group categories, and route them to email, chat or incident tools.

### 11.6 Recommended alarms (starting values; tune per workload)

| Alarm | Example threshold | Why |
| --- | --- | --- |
| `CPUUtilization` | > 80% for 10 minutes | Saturation |
| `FreeableMemory` | < 15–20% of instance memory | Memory pressure |
| `FreeStorageSpace` | < 20% (or an absolute GiB value) | Disk filling |
| `DatabaseConnections` | > 80% of `max_connections` | Exhaustion |
| `ReadLatency` / `WriteLatency` | > engine/app baseline (for example 20 ms) | Storage trouble |
| `ReplicaLag` | > 30 seconds (or app tolerance) | Stale reads |
| `DiskQueueDepth` | Sustained high | Saturated I/O |
| `BurstBalance` / `CPUCreditBalance` | < 20% | Credits about to run out |
| Events: failover, low storage | Any | Immediate attention |
| `MaximumUsedTransactionIDs` (PostgreSQL) | Approaching the wraparound limit | Prevent forced shutdown-like behaviour |

### 11.7 Application-side monitoring

1. Track **query latency, error rate, pool wait time, active connections and retry counts** in the application. The database alone does not show what users feel.
2. Use **tracing** (OpenTelemetry or AWS X-Ray) to connect slow requests to slow queries.

### 11.8 Interview pointers

Q16 (key metrics), Q27 (Performance Insights), Q37 (audit logs).

---

## 12. Maintenance, Upgrades and Blue/Green Deployments

### 12.1 Maintenance window

1. A weekly **maintenance window** (at least 30 minutes) is when RDS applies **required maintenance** and pending changes that wait for the window (OS and engine patches).
2. Pick a quiet period for your users. Maintenance on **Multi-AZ** usually patches the standby, fails over, then patches the former primary, so the visible impact is about **one failover**. On Single-AZ it is a **restart outage**.
3. Some updates are **required** and AWS applies them even if you postpone (for example security-related).

### 12.2 Minor and major version upgrades

| | Minor upgrade | Major upgrade |
| --- | --- | --- |
| Example | 8.0.35 -> 8.0.36 | MySQL 5.7 -> 8.0, PostgreSQL 14 -> 16 |
| Risk | Low (bug and security fixes) | Higher (behaviour, SQL, optimiser, extensions) |
| Automatic? | Optional via **auto minor version upgrade** | **Never automatic** (you start it) |
| Parameter group | Same family | **New family** needed |
| Downtime | Restart or failover | Longer; depends on engine and size |

1. **Auto minor version upgrade:** convenient, but production teams often **disable it** and control upgrades through a tested pipeline, or leave it on for lower environments.
2. **Major upgrade checklist:**
   1. Read the engine release notes and **deprecated features**.
   2. Take a **manual snapshot**.
   3. **Test on a restored copy** (or a Blue/Green green environment) with production-like queries and run a **performance comparison**.
   4. Check **extensions, parameter groups, option groups** and application driver compatibility.
   5. Upgrade replicas as the engine requires (replicas often need to be upgraded with or after the source; verify the engine rule).
   6. Plan the window, **rollback** (snapshot restore) and communication.
   7. After the upgrade run **`ANALYZE`** (PostgreSQL) to refresh statistics.
3. **Extended Support:** when a major engine version reaches end of standard support, RDS may keep running it with **Extended Support at extra cost** instead of forcing an upgrade. Track end-of-support dates and plan upgrades early. Verify current dates and pricing.

### 12.3 Blue/Green Deployments

1. **Amazon RDS Blue/Green Deployments** create a **green** staging environment, a synchronised copy of your **blue** production environment, so you can change it safely (major version upgrade, parameter changes, schema changes) and **switch over** in a short time.
2. How it works:
   1. RDS builds the green environment (including replicas) from blue and keeps it in sync using **logical replication** (green is **read-only** by default).
   2. You change green (upgrade, parameters, storage) and test it.
   3. **Switchover** checks health and replica lag, blocks writes briefly, waits for green to catch up, then **renames endpoints** so the same endpoint names now point to green. This typically takes **about a minute or less** (verify).
   4. Old blue instances remain (renamed with an `-old` suffix) so you can inspect or roll back by hand, then delete them to stop cost.
3. Benefits: low downtime, rehearsal before cutover, **no application connection string change** because endpoint names are preserved.
4. Limits and cautions (verify in the documentation):
   1. Supported engines and versions are limited (RDS MySQL, MariaDB, PostgreSQL and Aurora at the time of writing).
   2. You **pay for both environments** while they exist.
   3. Some changes and features are not supported on green, and **long-running transactions or heavy writes** can delay switchover.
   4. Logical replication has constraints (for example primary keys, certain DDL and objects). Test.
   5. Switchover can time out and then rolls back safely, so run it in a quiet period.
5. Alternatives: snapshot restore plus DMS, read replica promotion, or the Multi-AZ failover approach for instance-class changes.

### 12.4 Zero-surprise change process

1. Everything in IaC and peer-reviewed.
2. Change in a lower environment first. Snapshot before production change.
3. Use `apply_immediately = false` by default so changes wait for the window, and call out changes that cause restarts.
4. Announce the window, watch metrics and events, have a rollback decision point.

### 12.5 Interview pointers

Q17 (maintenance and upgrades), Q22 (Blue/Green).

---

## 13. RDS Proxy

### 13.1 What it is

1. **Amazon RDS Proxy** is a fully managed **database proxy** that sits between the application and RDS or Aurora (MySQL, PostgreSQL, MariaDB, SQL Server).
2. It **pools and shares connections**. Many client connections are **multiplexed** onto fewer database connections, so the database sees a stable, small number of connections.
3. It **keeps client connections alive during failover** and reconnects to the new writer itself, which reduces failover impact on the application (AWS documents a notable reduction in failover time; verify the current figure).
4. It can authenticate clients with **IAM** and fetch database credentials from **Secrets Manager**, and it can **require TLS**.

### 13.2 Architecture

```text
Lambda / ECS / EKS pods  --TLS-->  RDS Proxy endpoint (in VPC, private)
   (thousands of client conns)        | pooled, multiplexed (fewer DB conns)
                                      v
                           RDS instance / cluster (primary)
        Proxy reads credentials from Secrets Manager (via IAM role)
```

### 13.3 When to use it

1. **AWS Lambda** or highly elastic fleets that open and close many connections.
2. Applications that **cannot pool well** (many small processes).
3. When you want **faster, smoother failover** behaviour for apps.
4. To centralise credentials with Secrets Manager and **IAM authentication**.

### 13.4 Concepts and limits

1. **Multiplexing** reuses a database connection between transactions. **Pinning** happens when a session uses state that must stay on one database connection (for example some `SET` statements, temporary tables, session variables, prepared statements or locks in some engines). A pinned client **holds one database connection** and loses the multiplexing benefit. Watch the CloudWatch metrics `DatabaseConnectionsCurrentlySessionPinned`. Avoid session state, or keep transactions short.
2. Connection pool settings: `MaxConnectionsPercent`, `MaxIdleConnectionsPercent`, and `ConnectionBorrowTimeout`.
3. **Additional latency** is small but real. It adds a **cost** (priced per vCPU-hour of the database). It must live in the same VPC and subnets with its own SG.
4. A proxy is **not** a read/write splitter by itself. You can create **read-only proxy endpoints** that route to replicas (verify engine support).
5. Application behaviour still needs retries: some in-flight transactions fail at failover.

### 13.5 Security

1. Place the proxy in **private subnets**. Allow `sg-app` -> `sg-proxy` and `sg-proxy` -> `sg-db` only.
2. Use Secrets Manager secrets per database user, scoped by the proxy's IAM role.
3. Require TLS between client and proxy and between proxy and database.

### 13.6 Interview pointers

Q18 (RDS Proxy), Q25 (connection management), Q24 (failover).

---

## 14. Disaster Recovery and Cost Optimization

### 14.1 Terms

1. **RPO (Recovery Point Objective):** how much data you can lose (time).
2. **RTO (Recovery Time Objective):** how long you can be down.
3. **Multi-AZ** covers an AZ failure. **A Region failure needs a cross-Region plan.**

### 14.2 DR options for RDS (cheapest to fastest)

| Strategy | RPO | RTO | Notes |
| --- | --- | --- | --- |
| **Cross-Region snapshot copy** (manual or AWS Backup) | Hours (snapshot interval) | Hours (restore time) | Cheapest. Test restore time |
| **Cross-Region automated backup replication** | Minutes (transaction logs) | Hours | PITR in the DR Region. Verify engine support |
| **Cross-Region read replica** (promote) | Seconds to minutes (replica lag) | Minutes | Pay for a running replica. Manual promotion and repoint |
| **Aurora Global Database** | Typically about a second | Typically about a minute (managed failover) | Aurora only. Higher cost |
| **Multi-Region active-active** | Near zero | Near zero | Needs app design (for example conflict handling). Complex |

### 14.3 DR runbook outline (cross-Region replica)

1. Declare the incident and the decision-maker.
2. **Promote** the cross-Region replica. Wait for it to become available.
3. Reconfigure it: Multi-AZ, backups, parameter group, SG, monitoring, a new replica.
4. Update **DNS or secrets/config** so the application uses the new endpoint (the app tier must also exist in the DR Region).
5. Validate data and traffic, then communicate.
6. Plan **failback** (re-seed a replica in the original Region, then switch back in a window).
7. Test the whole runbook at least twice a year (game days).

### 14.4 Cost levers

| Lever | Detail |
| --- | --- |
| **Right-size** instance classes | Use Performance Insights and CloudWatch. Many databases are oversized |
| **Graviton classes** | Often cheaper for similar performance |
| **Reserved Instances / savings commitments** | 1- or 3-year commitments for steady databases. Reserved Instances are size-flexible within a family for some engines. Verify current options such as database savings plans |
| **Storage type** | gp3 instead of gp2 or io1 where it fits. Provision IOPS only when needed |
| **Autoscaling cap** | Set `max_allocated_storage` to avoid runaway cost |
| **Backup retention** | Right-size. Delete old manual snapshots. Remember cross-Region copies are billed |
| **Multi-AZ** | Roughly doubles instance cost. Keep it for production. Dev and test can be Single-AZ |
| **Read replicas** | Remove idle replicas. Match replica size to the workload |
| **Stop dev databases** | An instance can be **stopped for up to 7 days**, then RDS starts it automatically. Storage and backups are still billed. Some configurations cannot be stopped (for example instances with read replicas; verify) |
| **Extended Support** | Upgrade before standard support ends to avoid extra fees |
| **Performance Insights retention** | Keep the free period unless you need more |
| **Data transfer** | Avoid cross-AZ and cross-Region traffic where possible. Keep the app and database in the same AZ when it makes sense (with failover in mind) |
| **Tags and Budgets** | Tag by team and environment. Alert on cost anomalies |

### 14.5 Interview pointers

Q23 (cross-Region DR), Q12 (storage cost), Q19 (RDS vs EC2 cost).

---

## 15. Hands-On: CLI, SQL and Terraform

> Use a **sandbox account**. RDS instances cost money while they exist. Replace every `<placeholder>`. No secrets appear below. Passwords are never typed on the command line.

### 15.1 AWS CLI: create and inspect

```bash
# Variables (placeholders)
export AWS_REGION=<region>                 # for example ap-south-1
export DB_ID=lab-orders-db
export SUBNET_IDS="<subnet-a-id> <subnet-b-id>"   # private DB subnets in 2 AZs
export DB_SG_ID=<db-security-group-id>

# 1. DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name lab-db-subnets \
  --db-subnet-group-description "Lab DB subnets" \
  --subnet-ids $SUBNET_IDS

# 2. Create a MySQL instance. The master password is generated and stored
#    in Secrets Manager by RDS (no password on the command line).
aws rds create-db-instance \
  --db-instance-identifier "$DB_ID" \
  --engine mysql \
  --engine-version <supported-version> \
  --db-instance-class db.t4g.micro \
  --allocated-storage 20 \
  --max-allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --master-username dbadmin \
  --manage-master-user-password \
  --db-subnet-group-name lab-db-subnets \
  --vpc-security-group-ids "$DB_SG_ID" \
  --no-publicly-accessible \
  --backup-retention-period 7 \
  --deletion-protection \
  --copy-tags-to-snapshot \
  --enable-cloudwatch-logs-exports error slowquery \
  --tags Key=Environment,Value=lab Key=Owner,Value=<team>
```

**Explanation**

1. `--engine-version` must be a currently supported version. List them with `aws rds describe-db-engine-versions --engine mysql --query 'DBEngineVersions[].EngineVersion'`.
2. `--manage-master-user-password` makes RDS create and rotate the master secret in Secrets Manager.
3. `--storage-encrypted` uses the default `aws/rds` key unless you pass `--kms-key-id <key-arn>`.
4. `db.t4g.micro` is for labs only. Use a class that fits the workload for production.
5. `--max-allocated-storage` turns on storage autoscaling with a cap.

**Expected output (shape):** a JSON document with `"DBInstanceStatus": "creating"`. Creation takes several minutes.

```bash
# 3. Wait until available, then read the endpoint
aws rds wait db-instance-available --db-instance-identifier "$DB_ID"

aws rds describe-db-instances --db-instance-identifier "$DB_ID" \
  --query 'DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address,Port:Endpoint.Port,MultiAZ:MultiAZ,Encrypted:StorageEncrypted,Public:PubliclyAccessible,Secret:MasterUserSecret.SecretArn}' \
  --output table
```

**Expected output (shape):**

```text
-----------------------------------------------------------------------
|                         DescribeDBInstances                         |
+-----------+-----------------------------------+------+--------------+
|  Encrypted|  Endpoint                         | Port |  MultiAZ ... |
+-----------+-----------------------------------+------+--------------+
|  True     |  lab-orders-db.<id>.<region>.rds.amazonaws.com | 3306 | False |
```

### 15.2 AWS CLI: day-two operations

```bash
# Modify (changes with downtime wait for the maintenance window unless --apply-immediately)
aws rds modify-db-instance --db-instance-identifier "$DB_ID" \
  --multi-az --backup-retention-period 14        # applied in next window

aws rds modify-db-instance --db-instance-identifier "$DB_ID" \
  --db-instance-class db.m7g.large --apply-immediately   # restart/failover happens now

# Manual snapshot before a risky change
aws rds create-db-snapshot --db-instance-identifier "$DB_ID" \
  --db-snapshot-identifier "$DB_ID-pre-change-$(date +%Y%m%d%H%M)"
aws rds wait db-snapshot-available --db-snapshot-identifier "<snapshot-id>"

# Point-in-time restore to a NEW instance (always a new instance)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier "$DB_ID" \
  --target-db-instance-identifier "$DB_ID-restore" \
  --restore-time 2026-10-15T08:06:00Z \
  --db-subnet-group-name lab-db-subnets \
  --vpc-security-group-ids "$DB_SG_ID" \
  --no-publicly-accessible
# or: --use-latest-restorable-time

# Test failover (Multi-AZ only). Causes a brief outage. Do this in staging first.
aws rds reboot-db-instance --db-instance-identifier "$DB_ID" --force-failover

# Read replica, promote
aws rds create-db-instance-read-replica \
  --db-instance-identifier "$DB_ID-replica1" \
  --source-db-instance-identifier "$DB_ID"
aws rds promote-read-replica --db-instance-identifier "$DB_ID-replica1"   # irreversible

# Encrypt an unencrypted database: snapshot -> encrypted copy -> restore
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier <unencrypted-snapshot-id> \
  --target-db-snapshot-identifier <encrypted-copy-id> \
  --kms-key-id <kms-key-arn-or-alias>
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier "$DB_ID-enc" \
  --db-snapshot-identifier <encrypted-copy-id> \
  --db-subnet-group-name lab-db-subnets \
  --vpc-security-group-ids "$DB_SG_ID"

# Cross-Region snapshot copy (run against the DESTINATION Region)
aws rds copy-db-snapshot --region <dr-region> \
  --source-db-snapshot-identifier arn:aws:rds:<source-region>:<account-id>:snapshot:<snapshot-id> \
  --target-db-snapshot-identifier <name-in-dr> \
  --kms-key-id <dr-region-kms-key-arn>

# Clean up the lab (deletion protection must be turned off first)
aws rds modify-db-instance --db-instance-identifier "$DB_ID" --no-deletion-protection --apply-immediately
aws rds delete-db-instance --db-instance-identifier "$DB_ID" \
  --final-db-snapshot-identifier "$DB_ID-final"   # or --skip-final-snapshot in a throwaway lab
```

**Notes**

1. Without `--apply-immediately`, most modifications wait for the next maintenance window. Check `PendingModifiedValues` in `describe-db-instances`.
2. `--restore-time` must be inside the retention window and not later than `LatestRestorableTime`.
3. Restored instances **do not always inherit** security groups, parameter groups and option groups. Set them explicitly.
4. Cross-Region copies of encrypted snapshots need a KMS key in the **destination** Region.

### 15.3 AWS CLI: investigation toolbox

```bash
# Current state, pending changes, parameter group status
aws rds describe-db-instances --db-instance-identifier "$DB_ID" \
  --query 'DBInstances[0].{Status:DBInstanceStatus,Class:DBInstanceClass,AZ:AvailabilityZone,Secondary:SecondaryAvailabilityZone,Pending:PendingModifiedValues,ParamStatus:DBParameterGroups,CA:CACertificateIdentifier}'

# Recent events (last 6 hours = 360 minutes): failover, reboot, backup, low storage
aws rds describe-events --source-type db-instance --source-identifier "$DB_ID" --duration 360

# Parameter values that differ from default (user-modified)
aws rds describe-db-parameters --db-parameter-group-name <param-group> \
  --source user --query 'Parameters[].[ParameterName,ParameterValue,ApplyType]' --output table

# Logs
aws rds describe-db-log-files --db-instance-identifier "$DB_ID"
aws rds download-db-log-file-portion --db-instance-identifier "$DB_ID" \
  --log-file-name error/mysql-error.log --output text | tail -n 50

# Metrics: free storage over the last hour (bytes)
aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name FreeStorageSpace \
  --dimensions Name=DBInstanceIdentifier,Value="$DB_ID" \
  --start-time "$(date -u -d '1 hour ago' +%FT%TZ)" --end-time "$(date -u +%FT%TZ)" \
  --period 300 --statistics Minimum

# Who changed it? (API audit)
aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue="$DB_ID" \
  --max-results 20 --query 'Events[].[EventTime,EventName,Username]' --output table

# Security group rules on the DB
aws ec2 describe-security-groups --group-ids "$DB_SG_ID" \
  --query 'SecurityGroups[0].IpPermissions'

# Connectivity test from an app host (no credentials needed to test the port)
nc -zv <endpoint> 3306        # or: timeout 5 bash -c '</dev/tcp/<endpoint>/3306' && echo open
nslookup <endpoint>           # should return a PRIVATE IP inside the VPC
```

(`date -u -d` is GNU date syntax. On macOS use `date -u -v-1H`.)

### 15.4 IAM database authentication and TLS (MySQL example)

```bash
# 1. Enable IAM auth on the instance
aws rds modify-db-instance --db-instance-identifier "$DB_ID" \
  --enable-iam-database-authentication --apply-immediately
```

```sql
-- 2. Create the database user (run once as an admin user)
CREATE USER 'app_user'@'%' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
GRANT SELECT, INSERT, UPDATE, DELETE ON orders.* TO 'app_user'@'%';
ALTER USER 'app_user'@'%' REQUIRE SSL;
```

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "rds-db:connect",
    "Resource": "arn:aws:rds-db:<region>:<account-id>:dbuser:<DbiResourceId>/app_user"
  }]
}
```

```bash
# 3. Get a 15-minute token and connect over TLS (token is a password substitute; do not log it)
curl -sSo /tmp/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
TOKEN=$(aws rds generate-db-auth-token --hostname <endpoint> --port 3306 \
        --region <region> --username app_user)
mysql --host=<endpoint> --port=3306 --user=app_user \
      --ssl-ca=/tmp/global-bundle.pem --ssl-mode=VERIFY_IDENTITY \
      --enable-cleartext-plugin --password="$TOKEN" -e "SELECT CURRENT_USER(), @@version;"
```

**Explanation:** `DbiResourceId` (looks like `db-XXXXXXXX`) is the instance's **resource ID**, not its name (`aws rds describe-db-instances --query 'DBInstances[0].DbiResourceId'`). The token is signed with the caller's IAM credentials. TLS is mandatory. Cleartext plugin is needed because the token is sent as the password inside the TLS channel.

**Expected output:**

```text
+----------------+-----------+
| CURRENT_USER() | @@version |
+----------------+-----------+
| app_user@%     | 8.0.xx    |
+----------------+-----------+
```

### 15.5 Reading the master secret safely

```bash
SECRET_ARN=$(aws rds describe-db-instances --db-instance-identifier "$DB_ID" \
  --query 'DBInstances[0].MasterUserSecret.SecretArn' --output text)

# Fetch inside a script that pipes straight into the client. Never echo it or save it to a file.
aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["username"])'   # prints the username only
```

### 15.6 Useful SQL for investigation

**MySQL**

```sql
SHOW VARIABLES LIKE 'max_connections';
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW GLOBAL STATUS LIKE 'Max_used_connections';
SHOW FULL PROCESSLIST;                              -- who is running what
SELECT * FROM information_schema.innodb_trx\G       -- open transactions, age
SELECT * FROM sys.schema_unused_indexes LIMIT 20;
SELECT * FROM sys.statement_analysis ORDER BY total_latency DESC LIMIT 10;
SHOW REPLICA STATUS\G                               -- on a replica (older versions: SHOW SLAVE STATUS)
CALL mysql.rds_kill(<thread_id>);                   -- RDS-safe way to kill a session
CALL mysql.rds_show_configuration;                  -- binlog retention etc.
```

**PostgreSQL**

```sql
SHOW max_connections;
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
SELECT pid, usename, state, now() - query_start AS runtime, wait_event_type, wait_event, left(query,120)
FROM pg_stat_activity WHERE state <> 'idle' ORDER BY runtime DESC LIMIT 10;
SELECT pg_terminate_backend(<pid>);                 -- end a session
SELECT now() - pg_last_xact_replay_timestamp() AS replica_delay;   -- run on a replica
SELECT slot_name, active,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal
FROM pg_replication_slots;                          -- inactive slots hold WAL
SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY 2 DESC;  -- wraparound watch
SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
CREATE USER app_user; GRANT rds_iam TO app_user;    -- enable IAM auth for this user
```

**Expected output:** result sets whose columns are as named. Use them to confirm hypotheses (many `Sleep` connections suggests a pool leak, a long `innodb_trx` suggests a stuck transaction).

### 15.7 Terraform: production-style RDS MySQL (managed secret, Multi-AZ, encrypted)

> Terraform was **not run** while writing these notes. Treat the HCL as a reviewed template: run `terraform fmt`, `validate` and `plan`, and check argument names against your provider version. Engine versions change, so look up a supported value first.

**Folder structure**

```text
rds-mysql/
├── versions.tf        # Terraform and provider constraints
├── variables.tf
├── main.tf            # KMS, SG, subnet group, parameter group, instance, monitoring role
├── alarms.tf          # CloudWatch alarms
├── outputs.tf
└── envs/
    ├── dev.tfvars
    └── prod.tfvars
```

**versions.tf**

```hcl
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}
```

**variables.tf**

```hcl
variable "region" { type = string }
variable "name" {
  type    = string
  default = "prod-orders-db"
}
variable "vpc_id" { type = string }
variable "db_subnet_ids" {
  type        = list(string)
  description = "Private subnets in at least two AZs"
}
variable "app_security_group_id" {
  type        = string
  description = "SG of the application allowed to reach the database"
}
variable "engine_version" {
  type        = string
  description = "Supported MySQL version. Check: aws rds describe-db-engine-versions --engine mysql"
}
variable "instance_class" {
  type    = string
  default = "db.m7g.large"
}
variable "allocated_storage" {
  type    = number
  default = 100
}
variable "max_allocated_storage" {
  type    = number
  default = 500
}
variable "multi_az" {
  type    = bool
  default = true
}
variable "backup_retention_days" {
  type    = number
  default = 14
}
variable "alarm_topic_arn" {
  type        = string
  description = "SNS topic for alarms"
}
variable "apply_immediately" {
  type    = bool
  default = false
}
variable "tags" {
  type    = map(string)
  default = {}
}
```

**main.tf**

```hcl
# ---- Encryption key (customer-managed) ----
resource "aws_kms_key" "rds" {
  description             = "${var.name} storage and secret encryption"
  enable_key_rotation     = true
  deletion_window_in_days = 30
  tags                    = var.tags
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.name}"
  target_key_id = aws_kms_key.rds.key_id
}

# ---- Network ----
resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnets"
  subnet_ids = var.db_subnet_ids
  tags       = var.tags
}

resource "aws_security_group" "db" {
  name        = "${var.name}-sg"
  description = "Database access from the application only"
  vpc_id      = var.vpc_id
  tags        = var.tags
}

resource "aws_vpc_security_group_ingress_rule" "from_app" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = var.app_security_group_id
  ip_protocol                  = "tcp"
  from_port                    = 3306
  to_port                      = 3306
  description                  = "MySQL from application SG"
}

# ---- Parameter group ----
resource "aws_db_parameter_group" "this" {
  name   = "${var.name}-params"
  family = "mysql8.0"

  parameter {
    name  = "require_secure_transport"
    value = "1"
  }
  parameter {
    name  = "slow_query_log"
    value = "1"
  }
  parameter {
    name  = "long_query_time"
    value = "2"
  }
  tags = var.tags
}

# ---- Enhanced Monitoring role ----
data "aws_iam_policy_document" "monitoring_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["monitoring.rds.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "monitoring" {
  name               = "${var.name}-enhanced-monitoring"
  assume_role_policy = data.aws_iam_policy_document.monitoring_assume.json
  tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "monitoring" {
  role       = aws_iam_role.monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ---- The database ----
resource "aws_db_instance" "this" {
  identifier     = var.name
  engine         = "mysql"
  engine_version = var.engine_version
  instance_class = var.instance_class

  # Storage
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage # storage autoscaling cap
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds.arn

  # Credentials: RDS creates and rotates the secret. No password in code or state.
  username                      = "dbadmin"
  manage_master_user_password   = true
  master_user_secret_kms_key_id = aws_kms_key.rds.key_id

  # Network
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  multi_az               = var.multi_az
  port                   = 3306

  # Config
  parameter_group_name                = aws_db_parameter_group.this.name
  iam_database_authentication_enabled = true

  # Backup and protection
  backup_retention_period   = var.backup_retention_days
  backup_window             = "20:00-21:00"   # UTC
  maintenance_window        = "sun:21:30-sun:22:30"
  copy_tags_to_snapshot     = true
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.name}-final"

  # Upgrades
  auto_minor_version_upgrade = false   # control upgrades through the pipeline
  allow_major_version_upgrade = false
  apply_immediately          = var.apply_immediately

  # Observability
  enabled_cloudwatch_logs_exports       = ["error", "slowquery"]
  monitoring_interval                   = 60
  monitoring_role_arn                   = aws_iam_role.monitoring.arn
  performance_insights_enabled          = true
  performance_insights_kms_key_id       = aws_kms_key.rds.arn

  tags = var.tags

  lifecycle {
    prevent_destroy = true
    # If autoscaling grows storage, do not let Terraform shrink it back (it cannot).
    ignore_changes = [allocated_storage]
  }
}

# ---- Optional read replica ----
resource "aws_db_instance" "replica" {
  count               = 0 # set to 1 to create
  identifier          = "${var.name}-replica1"
  replicate_source_db = aws_db_instance.this.identifier
  instance_class      = var.instance_class
  publicly_accessible = false
  storage_encrypted   = true
  kms_key_id          = aws_kms_key.rds.arn
  skip_final_snapshot = true
  tags                = var.tags
}
```

**alarms.tf**

```hcl
locals {
  db_dim = { DBInstanceIdentifier = aws_db_instance.this.identifier }
}

resource "aws_cloudwatch_metric_alarm" "cpu" {
  alarm_name          = "${var.name}-cpu-high"
  namespace           = "AWS/RDS"
  metric_name         = "CPUUtilization"
  dimensions          = local.db_dim
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"
  alarm_actions       = [var.alarm_topic_arn]
  ok_actions          = [var.alarm_topic_arn]
  treat_missing_data  = "breaching"
}

resource "aws_cloudwatch_metric_alarm" "free_storage" {
  alarm_name          = "${var.name}-free-storage-low"
  namespace           = "AWS/RDS"
  metric_name         = "FreeStorageSpace"
  dimensions          = local.db_dim
  statistic           = "Minimum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 20 * 1024 * 1024 * 1024 # 20 GiB in bytes
  comparison_operator = "LessThanThreshold"
  alarm_actions       = [var.alarm_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "connections" {
  alarm_name          = "${var.name}-connections-high"
  namespace           = "AWS/RDS"
  metric_name         = "DatabaseConnections"
  dimensions          = local.db_dim
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 5
  threshold           = 400 # set to ~80% of max_connections for your class
  comparison_operator = "GreaterThanThreshold"
  alarm_actions       = [var.alarm_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "freeable_memory" {
  alarm_name          = "${var.name}-memory-low"
  namespace           = "AWS/RDS"
  metric_name         = "FreeableMemory"
  dimensions          = local.db_dim
  statistic           = "Minimum"
  period              = 300
  evaluation_periods  = 3
  threshold           = 1 * 1024 * 1024 * 1024 # 1 GiB; adjust to class size
  comparison_operator = "LessThanThreshold"
  alarm_actions       = [var.alarm_topic_arn]
}

resource "aws_db_event_subscription" "this" {
  name             = "${var.name}-events"
  sns_topic        = var.alarm_topic_arn
  source_type      = "db-instance"
  source_ids       = [aws_db_instance.this.identifier]
  event_categories = ["failover", "failure", "low storage", "maintenance", "notification", "recovery"]
}
```

**outputs.tf**

```hcl
output "endpoint" { value = aws_db_instance.this.address }
output "port"     { value = aws_db_instance.this.port }
output "master_secret_arn" {
  value       = aws_db_instance.this.master_user_secret[0].secret_arn
  description = "Secrets Manager ARN. The password itself is never in Terraform state."
}
```

**Commands and expected output**

```bash
terraform init
terraform fmt -check && terraform validate     # expected: "Success! The configuration is valid."
terraform plan -var-file=envs/dev.tfvars -out=tfplan
terraform apply tfplan                          # Multi-AZ creation can take 10-20+ minutes
```

**Explanation of key decisions**

1. `manage_master_user_password = true` removes the plain `var.db_password` pattern. The password is not in code, `tfvars` or state.
2. `prevent_destroy`, `deletion_protection` and a final snapshot protect against accidental deletion.
3. `ignore_changes = [allocated_storage]` avoids a plan that tries to shrink autoscaled storage (which RDS rejects).
4. `auto_minor_version_upgrade = false` is a policy choice. If you leave it on, pin `engine_version` loosely or you will see drift in plans.
5. Changes with downtime (class, engine version, some parameters) wait for the window unless `apply_immediately = true`. Review the plan for "forces replacement" before applying.
6. The Terraform state may still contain sensitive values (for example the secret ARN is fine, but treat state as sensitive). Use an **encrypted remote backend** (S3 with KMS and locking).

### 15.8 RDS Proxy snippet (Terraform)

```hcl
resource "aws_db_proxy" "this" {
  name                   = "${var.name}-proxy"
  engine_family          = "MYSQL"
  role_arn               = aws_iam_role.proxy.arn        # allows secretsmanager:GetSecretValue on the secret
  vpc_subnet_ids         = var.db_subnet_ids
  vpc_security_group_ids = [aws_security_group.proxy.id]
  require_tls            = true
  idle_client_timeout    = 1800

  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "REQUIRED"                              # clients use IAM tokens
    secret_arn  = "<application-user-secret-arn>"         # an app-user secret, not the master
  }
}

resource "aws_db_proxy_default_target_group" "this" {
  db_proxy_name = aws_db_proxy.this.name
  connection_pool_config {
    max_connections_percent      = 80
    max_idle_connections_percent = 40
    connection_borrow_timeout    = 120
  }
}

resource "aws_db_proxy_target" "this" {
  db_proxy_name          = aws_db_proxy.this.name
  target_group_name      = aws_db_proxy_default_target_group.this.name
  db_instance_identifier = aws_db_instance.this.identifier
}
```

The IAM role and security group resources (`aws_iam_role.proxy`, `aws_security_group.proxy`) are omitted for brevity. The proxy SG must be allowed on the database SG, and the app SG must be allowed on the proxy SG.

### 15.9 A read-only RDS audit script (Bash)

```bash
#!/usr/bin/env bash
# rds-audit.sh - read-only. Lists risky RDS settings in the current Region.
set -euo pipefail

tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
aws rds describe-db-instances --output json > "$tmp"

python3 -I - "$tmp" <<'PY'
import json, sys

with open(sys.argv[1]) as f:
    instances = json.load(f)["DBInstances"]

for d in instances:
    issues = []
    if d.get("PubliclyAccessible"):                    issues.append("PUBLIC")
    if not d.get("StorageEncrypted"):                  issues.append("NOT-ENCRYPTED")
    if not d.get("MultiAZ"):                           issues.append("SINGLE-AZ")
    if not d.get("DeletionProtection"):                issues.append("NO-DELETION-PROTECTION")
    if d.get("BackupRetentionPeriod", 0) < 7:          issues.append("BACKUP<7d")
    if d.get("AutoMinorVersionUpgrade") is False:      issues.append("AUTO-MINOR-OFF(info)")
    if not d.get("EnabledCloudwatchLogsExports"):      issues.append("NO-LOG-EXPORTS")
    if not d.get("IAMDatabaseAuthenticationEnabled"):  issues.append("NO-IAM-AUTH(info)")
    if "MasterUserSecret" not in d:                    issues.append("NO-MANAGED-MASTER-SECRET(info)")
    name = d["DBInstanceIdentifier"]
    engine = d["Engine"]
    print(f"{name:40} {engine:12} {','.join(issues) or 'OK'}")
PY
```

**Expected output:**

```text
prod-orders-db                           mysql        AUTO-MINOR-OFF(info)
legacy-reports                           postgres     PUBLIC,NOT-ENCRYPTED,SINGLE-AZ,NO-DELETION-PROTECTION
```

(Findings marked `(info)` are design choices, not necessarily defects. Single-AZ is normal in dev.)

---

## 16. Production Troubleshooting Scenarios

Each scenario follows: **Problem → Symptoms/impact → Possible causes → Investigation → Procedure → Root cause → Resolution → Prevention → How to explain it in an interview.**

### Beginner scenarios

#### A1. Application cannot connect to RDS

1. **Problem:** A new or existing application gets timeouts or connection errors to the database.
2. **Symptoms and impact:** `Connection timed out`, `Unknown host`, `Access denied`, `SSL connection error`. The feature using the database is down.
3. **Possible causes:**
   1. **Security group** does not allow the app's SG on the DB port (timeout).
   2. **Wrong endpoint, port or DNS** (typo, old IP, wrong environment).
   3. **Route or NACL** problem, or the app is in a different VPC with no peering or Transit Gateway.
   4. **Public vs private** mismatch: connecting from the internet to a private instance.
   5. **Credentials** wrong, user host restriction (`'user'@'10.%'`), expired or rotated secret (`Access denied`).
   6. **TLS** required but the client does not use it (or the CA bundle is outdated).
   7. Instance not `available` (rebooting, failing over, storage full).
   8. `max_connections` reached (`Too many connections`).
4. **Tools:** `describe-db-instances`, `describe-events`, `nc -zv`, `nslookup`, VPC Reachability Analyzer, flow logs, `mysql`/`psql` client with verbose output.
5. **Procedure (layer by layer):**
   1. Instance status and recent events (is it `available`?).
   2. **DNS:** `nslookup <endpoint>` from the app host. Private IP expected.
   3. **Network:** `nc -zv <endpoint> 3306`. A **timeout** points to SG/NACL/route. **Connection refused** or an immediate error points to the database side.
   4. **SG:** the DB SG inbound rule allows the app SG (or the app's real source, such as the proxy or NAT).
   5. **Auth:** try the client with the same user and TLS flags. `Access denied` is credentials or host. Read the error code.
   6. **Capacity:** `Threads_connected` versus `max_connections`.
6. **Root cause (typical):** The app moved to a new SG or subnet and the DB SG still allowed only the old one, or a secret was rotated and the app cached the old password.
7. **Resolution:** Add the SG-to-SG rule, fix the config, refresh the secret in the app, update the CA bundle.
8. **Prevention:** IaC with SG references, a connectivity smoke test in deployment pipelines, secret refresh on authentication failure, alarms on connection errors.
9. **Interview explanation:** "I check from the outside in: instance state, DNS, port reachability, security group, then authentication and TLS. A timeout means network, an error message means the database responded."

#### A2. Storage almost full (or full)

1. **Problem:** `FreeStorageSpace` is dropping fast. At zero, the database may stop accepting writes or crash into storage-full.
2. **Symptoms and impact:** Write errors (`No space left on device`, `The table is full`), instance status `storage-full`, replicas stall.
3. **Possible causes:** Real data growth, a **runaway batch** or **log table**, huge **binary logs** (MySQL, `BinLogDiskUsage`) or **WAL retained by an inactive replication slot** (PostgreSQL), long transactions preventing cleanup, temp tables or large sorts, storage autoscaling disabled or **at its maximum**.
4. **Tools:** `FreeStorageSpace`, `BinLogDiskUsage`, `TransactionLogsDiskUsage`, `OldestReplicationSlotLag`, SQL size queries, events.
5. **Procedure:**
   1. Check autoscaling and its **max threshold** (`describe-db-instances` -> `MaxAllocatedStorage`).
   2. **Add space now** to stop the bleeding: `modify-db-instance --allocated-storage <bigger> --apply-immediately` (storage can only go up).
   3. Find the consumer:
      - MySQL: `SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024/1024,2) AS gb FROM information_schema.tables GROUP BY table_schema ORDER BY gb DESC;` and check binlog retention (`CALL mysql.rds_show_configuration;`).
      - PostgreSQL: inactive slots (section 15.6), long transactions, big tables with `pg_total_relation_size`.
   4. Stop the offender (kill the batch, drop an unused slot, shorten binlog retention with `mysql.rds_set_configuration`).
6. **Root cause (typical):** A nightly job wrote an unbounded audit table, or a dead replica's replication slot retained WAL for days.
7. **Resolution:** Increase storage, stop the growth, archive or purge data with a plan, drop the slot.
8. **Prevention:** `FreeStorageSpace` alarm at 20% (and a second at 10%), autoscaling with a sensible cap and an alarm when near the cap, data retention policies, slot monitoring, capacity reviews.
9. **Interview explanation:** "First stop the outage by adding space, because storage can grow quickly. Then find what is growing so I fix the cause, and add alarms so it never reaches zero again."

#### A3. Database password leaked

1. **Problem:** A database password appears in a repository, a log, a chat message or a screenshot.
2. **Symptoms and impact:** Possible unauthorised access. Treat as a security incident.
3. **Possible causes:** Hard-coded credentials, a secret in a Terraform variable or CI log, an overly broad access policy.
4. **Tools:** CloudTrail, database audit logs, `SHOW PROCESSLIST`/`pg_stat_activity`, VPC flow logs, GuardDuty, Secrets Manager rotation history.
5. **Procedure:**
   1. **Rotate immediately.** For managed secrets: `aws secretsmanager rotate-secret --secret-id <arn>`. For app users: `ALTER USER ... IDENTIFIED BY '<new-from-secrets-manager>'`. Update the secret, then let the app pick it up.
   2. Confirm the **network path**: private subnets and SG limit who could use it even if leaked.
   3. **Review activity** since the exposure: audit logs, unusual users or hosts, large reads, new users or grants.
   4. Remove the secret from the source (and **rewrite history** where needed; assume it is permanently exposed).
   5. Notify security and follow the incident process.
6. **Root cause (typical):** A credential committed to Git, or logged by a debug statement.
7. **Resolution:** Rotate, remove, audit, notify.
8. **Prevention:** RDS-managed secrets, Secrets Manager with rotation, IAM database authentication, pre-commit and CI secret scanning, masked logs, least-privilege users.
9. **Interview explanation:** "Rotate first, then investigate. I rely on network controls to limit blast radius and check audit logs for misuse. Long term, no static passwords where IAM authentication or managed rotation can be used."

### Intermediate scenarios

#### B1. High CPU on the database

1. **Problem:** `CPUUtilization` is high and latency is rising.
2. **Symptoms and impact:** Slow queries, timeouts, queue build-up, possible connection exhaustion.
3. **Possible causes:** A **new slow query** after a release, **missing index** or changed plan, **connection storm**, batch or report on the primary, **lock contention**, burstable class out of **CPU credits**, many tiny queries (N+1), autovacuum (PostgreSQL), undersized class.
4. **Tools:** Performance Insights (top SQL and waits), slow query log, `SHOW FULL PROCESSLIST` / `pg_stat_activity`, Enhanced Monitoring, `EXPLAIN`.
5. **Procedure:**
   1. When did it start? Correlate with deployments and traffic.
   2. Performance Insights: is AAS above vCPUs? What are the **top SQL** and **wait events**?
   3. Check `CPUCreditBalance` (burstable classes).
   4. `EXPLAIN` the top queries. Look for full scans and missing indexes.
   5. Check connection count and sleeping/idle-in-transaction sessions.
6. **Root cause (typical):** A release added a query that scans a large table without an index.
7. **Resolution:** Short term: kill the offending sessions, roll back the release or throttle the feature, move reports to a replica. Fix: add the index (online DDL where possible), rewrite the query, cache results. Scale up only if the workload is legitimately larger.
8. **Prevention:** Query review and load tests in CI, slow query alerts, PI dashboards, `pg_stat_statements`, avoid burstable classes for steady load.
9. **Interview explanation:** "I look for what changed, find the top SQL in Performance Insights, and fix the query or index. Scaling up is the last step because it hides inefficiency."

#### B2. Failover happened and the application reports errors

1. **Problem:** After an RDS failover the application keeps erroring for minutes, or never recovers without a restart.
2. **Symptoms and impact:** `Communications link failure`, `connection reset`, read-only errors (`The MySQL server is running with the --read-only option`) or long timeouts. Orders fail.
3. **Possible causes:** The app **cached DNS** and still talks to the old primary. The pool holds **dead connections**. No retry logic or timeouts too long. **Connecting by IP.** The app connected to a **replica endpoint** for writes. Transactions interrupted without idempotency.
4. **Tools:** `describe-events` (failover timestamps), app logs, DNS TTL checks, pool metrics.
5. **Procedure:**
   1. Confirm the failover in RDS events and duration.
   2. Verify the app uses the **endpoint name**, resolved at connect time.
   3. Check DNS caching (JVM TTL, OS, sidecars) and the pool settings (validation query, max lifetime).
   4. Check for read-only errors that mean writes went to a stale or wrong node.
   5. Restart the affected app instances if they are stuck, as a short-term fix.
6. **Root cause (typical):** A Java service cached DNS forever and kept sending traffic to the old primary.
7. **Resolution:** Set a short DNS TTL, enable pool validation and a sensible max lifetime, add retry with backoff for idempotent calls, use **RDS Proxy**.
8. **Prevention:** Regular failover tests in staging (`--force-failover`), chaos testing, documented client settings, alarms on RDS failover events.
9. **Interview explanation:** "A failover is an expected event with a DNS flip. The database recovers in a minute or two, so remaining errors point to client behaviour: DNS caching, stale pooled connections or missing retries."

#### B3. Read replica lag is high

1. **Problem:** `ReplicaLag` keeps growing and users see stale data.
2. **Symptoms and impact:** Missing recent writes on reports or read paths, replication errors, potential failover/DR data loss (large RPO).
3. **Possible causes:** Heavy writes or a **huge transaction** or `ALTER` on the source, **undersized replica**, heavy queries on the replica, I/O limits, **replication errors**, cross-Region latency, PostgreSQL conflicts or long-running queries on the replica.
4. **Tools:** `ReplicaLag`, replica CPU/IOPS, `SHOW REPLICA STATUS\G` or PostgreSQL `pg_stat_replication` on the source, Performance Insights on the replica, events.
5. **Procedure:**
   1. Is the lag steady, spiky or growing? Compare source write rate.
   2. Check the replica metrics and class vs the source.
   3. Look for long queries on the replica and kill if safe.
   4. Check replication status and errors.
   5. Look for a recent large change on the source.
6. **Root cause (typical):** A weekly report on a replica that was half the size of the source, plus a bulk update on the source.
7. **Resolution:** Resize the replica or raise IOPS, chunk large writes, move heavy reports, tune parallel replication. If broken, recreate the replica.
8. **Prevention:** Match replica size to the source, alarm on lag, **read-after-write routing** for sensitive flows, run big changes in small batches.
9. **Interview explanation:** "Lag means the replica cannot apply changes as fast as they arrive. I find out whether the source is writing too much or the replica is too weak, then fix that side."

#### B4. "Too many connections"

1. **Problem:** New connections are rejected while the database CPU may look fine.
2. **Symptoms and impact:** `ERROR 1040 (08004): Too many connections` or PostgreSQL `remaining connection slots are reserved...`. Intermittent failures under load.
3. **Possible causes:** App pool size × instance count too large after scale-out, **connection leaks** (not returned to the pool), **Lambda** concurrency spikes, idle-in-transaction sessions, a small class with a low `max_connections`.
4. **Tools:** `DatabaseConnections`, `SHOW PROCESSLIST`, `pg_stat_activity`, application pool metrics.
5. **Procedure:**
   1. Compare current connections with `max_connections`.
   2. Group connections by user/host/state to find the owner.
   3. Kill idle sessions safely if needed. Fix the leak or pool size.
   4. Put **RDS Proxy** in front, or reduce pods' pool sizes.
6. **Root cause (typical):** Autoscaling from 10 to 80 pods with a pool of 20 each (1,600 connections) against a database with a limit of about 900.
7. **Resolution:** Smaller per-pod pools, RDS Proxy, close leaks, scale the class if the work needs it.
8. **Prevention:** Budget connections (`pods × pool`), alarm at 80% of the limit, proxy for bursty clients, connection limits per user.
9. **Interview explanation:** "More connections do not give more throughput. I budget connections across all clients and use pooling or RDS Proxy so the database sees a stable number."

### Advanced scenarios

#### C1. A bad deployment corrupted data; restore with PITR

1. **Problem:** A release at 14:05 ran a faulty migration or job that updated or deleted rows wrongly. It was noticed at 14:40.
2. **Symptoms and impact:** Wrong totals, missing records, customer complaints. Multi-AZ does not help because the bad write replicated.
3. **Possible causes:** Missing `WHERE` clause, buggy migration, no dry run, no backup before the change.
4. **Tools:** Automated backups and PITR, manual snapshots, binary logs/audit logs (to find affected rows), restore to a new instance.
5. **Procedure:**
   1. **Stop the damage:** pause the job, disable the feature, put the app in maintenance or read-only mode if needed.
   2. **Take a manual snapshot now** (preserves the current state for forensics).
   3. **PITR to just before the change** (for example 14:04) into a **new instance** with correct SG, subnet group and parameter group.
   4. **Validate** the restored data. Compare row counts and checksums.
   5. Choose the recovery path:
      - **Targeted repair:** copy the affected rows from the restored instance into production (best when only some data was damaged and new valid writes exist since 14:05).
      - **Full cutover:** repoint the app to the restored instance (you lose valid writes made after the restore point, so reconcile them).
   6. Rebuild Multi-AZ, replicas and monitoring on the new instance if you cut over.
6. **Root cause (typical):** A migration without a transaction or review, run directly in production.
7. **Resolution:** Targeted repair or cutover, plus a data reconciliation report.
8. **Prevention:** Migrations reviewed and tested on production-like copies, **snapshot before risky changes**, small batches with checks, least-privilege DDL access, feature flags, **regular restore drills** so you know the real RTO.
9. **Interview explanation:** "PITR gives me a new instance at a chosen time. I take a snapshot of the damaged state first, restore, validate, and then repair or cut over depending on how much valid data came after the mistake."

#### C2. Major version upgrade causes a performance regression (or Blue/Green switchover stalls)

1. **Problem:** After a major upgrade, queries are slower or the application fails. Alternatively, a Blue/Green switchover does not complete.
2. **Symptoms and impact:** Higher CPU and latency, plan changes, features broken by deprecations, or a switchover that times out and rolls back.
3. **Possible causes:** **Stale statistics** (PostgreSQL needs `ANALYZE` after a major upgrade), optimiser changes, removed or changed SQL behaviour, incompatible extensions or drivers, parameter group differences (new family). For switchover: **long-running transactions**, heavy write load, **replica lag** on green, unsupported objects, a missing primary key breaking logical replication.
4. **Tools:** Performance Insights (compare before and after), slow log, `EXPLAIN`, `pg_stat_statements`, Blue/Green deployment status and events, CloudTrail.
5. **Procedure (regression):**
   1. Run `ANALYZE` (PostgreSQL) or update statistics. Compare top queries before and after.
   2. Compare parameter group values (old family vs new).
   3. Check extension and driver versions.
   4. If the impact is severe and you used Blue/Green, **do not delete blue**. Roll back to the old environment (switch back or repoint) per your runbook. Otherwise restore from the pre-upgrade snapshot.
6. **Procedure (switchover stalled):** read the deployment's status messages, check green replica lag, kill or wait for long transactions on blue, reduce write load, retry in a quiet window.
7. **Root cause (typical):** Skipped `ANALYZE`, or a nightly job held a long transaction during switchover.
8. **Resolution:** Refresh statistics, tune the plans, fix the incompatibility, or roll back.
9. **Prevention:** Rehearse the upgrade with production-like data and **query replay**, use Blue/Green for major upgrades, keep a rollback plan, upgrade in a low-traffic window, and keep staging versions aligned with production.
10. **Interview explanation:** "I treat a major upgrade as a release: test on a copy, snapshot first, use Blue/Green to rehearse and cut over, run statistics after, and keep the old environment until I trust the new one."

#### C3. PostgreSQL: disk full from WAL, or transaction ID wraparound warning

1. **Problem:** Storage fills even though table sizes are stable, or `MaximumUsedTransactionIDs` is climbing toward the wraparound limit.
2. **Symptoms and impact:** `TransactionLogsDiskUsage` is growing, `FreeStorageSpace` falling, warnings about wraparound, and in the worst case the database stops accepting writes to protect data.
3. **Possible causes:** An **inactive replication slot** (a dead replica, DMS task or logical consumer) retaining WAL, a **long-running transaction** or **prepared transaction** blocking vacuum, **autovacuum** not keeping up or disabled for big tables, very high write rates.
4. **Tools:** `pg_replication_slots`, `pg_stat_activity` (oldest `xact_start`), `pg_prepared_xacts`, `age(datfrozenxid)`, `OldestReplicationSlotLag`, `MaximumUsedTransactionIDs`.
5. **Procedure:**
   1. Check slots: `SELECT slot_name, active, restart_lsn FROM pg_replication_slots;`. **Drop an unused inactive slot** (`SELECT pg_drop_replication_slot('<name>');`) after confirming its consumer is dead.
   2. Find old transactions: `SELECT pid, now()-xact_start AS age, state, query FROM pg_stat_activity WHERE xact_start IS NOT NULL ORDER BY age DESC;`. End the blocker (`pg_terminate_backend`) if safe.
   3. Check autovacuum activity and tune (more workers, lower scale factor on big tables) and run a manual `VACUUM (FREEZE)` on the oldest tables if the XID age is high.
   4. Add storage if the disk is nearly full to give breathing room.
6. **Root cause (typical):** A decommissioned DMS task left a slot behind, so WAL accumulated for days.
7. **Resolution:** Drop the slot, end the long transaction, vacuum, and add storage.
8. **Prevention:** Alarms on `OldestReplicationSlotLag`, `TransactionLogsDiskUsage` and `MaximumUsedTransactionIDs`, an owner and cleanup step for every slot, `idle_in_transaction_session_timeout`, autovacuum tuning.
9. **Interview explanation:** "WAL growth with stable tables usually means something is holding it back: an inactive slot or a long transaction. I find it in the catalog views and remove it, then alarm on it."

---

## 17. Security, Reliability and Best Practices

### 17.1 Mandatory controls vs optional design choices

| Area | **Mandatory** | Optional (depends on need and cost) |
| --- | --- | --- |
| Network | Private subnets, no public access, SG allows app SG only | VPC endpoints for Secrets Manager/KMS, RDS Proxy |
| Encryption | Encryption at rest (KMS) enabled **at creation**, TLS enforced | Customer-managed KMS key with cross-account sharing |
| Credentials | No plain-text passwords in code or state; RDS-managed secret or Secrets Manager | IAM database authentication, scheduled rotation for app users |
| Access in DB | Application uses a least-privilege user, not the master user | Separate users for migration, app and read-only |
| Availability | Multi-AZ for production | Multi-AZ DB cluster, Aurora, cross-Region replica |
| Backups | Automated backups (retention suited to RPO), a tested restore | AWS Backup cross-account/cross-Region copies, Vault Lock |
| Deletion safety | Deletion protection, final snapshot | Service control policies (SCPs) blocking delete |
| Monitoring | Alarms: CPU, memory, storage, connections, latency, replica lag, events | Enhanced Monitoring (1 s), Performance Insights long retention |
| Logging | Error and slow query logs exported with retention | Audit plugin/pgaudit to a SIEM |
| Changes | IaC, peer review, snapshot before risky changes | Blue/Green for major upgrades |
| Upgrades | A planned process for minor and major versions, track end-of-support | Auto minor upgrade in lower environments |
| Cost | Tags, budgets, storage autoscaling cap | Reserved Instances/commitments, Graviton |
| Client behaviour | Retry with backoff, short DNS TTL, pool validation | Read/write splitting, caching layer |

### 17.2 Least privilege and secrets

1. Use **separate database users** for schema migration (DDL), application (DML only on needed schemas) and reporting (read-only). Never use the master user in applications.
2. Prefer **IAM database authentication** or **Secrets Manager** with rotation. Scope `secretsmanager:GetSecretValue` to the exact secret and restrict by condition.
3. Restrict RDS **control-plane** IAM actions: `rds:DeleteDBInstance`, `rds:ModifyDBInstance`, `rds:DeleteDBSnapshot`, `rds:ModifyDBSnapshotAttribute`, `rds:RestoreDBInstanceFromDBSnapshot`, `rds:StopDBInstance`. Use tag-based conditions and separate production roles.
4. Protect the **KMS key**: key policy for specific principals, deletion waiting period, alarm on `ScheduleKeyDeletion`.

### 17.3 Network and access controls

1. Database subnets have **no internet route**. Access goes through the app tier, SSM port forwarding or a VPN.
2. Security groups reference SGs, not CIDRs. Review them regularly.
3. Use **VPC flow logs** and **CloudTrail**. For cross-VPC access use peering or Transit Gateway with narrow SG and route rules.
4. Turn on **GuardDuty RDS Protection** and AWS Config rules for public access, encryption and Multi-AZ.

### 17.4 High availability and disaster recovery

1. **Multi-AZ** for production. Test failover. Make clients failover-aware.
2. Decide **RPO/RTO** and choose the DR strategy from section 14. Write and rehearse the runbook.
3. Keep infrastructure code for the DR Region ready, including KMS keys, SGs and subnet groups.
4. Replicas are not backups. Backups are not tested until restored.

### 17.5 Rollback and failure recovery

1. **Before a risky change:** manual snapshot, a tested rollback path (PITR or snapshot restore or Blue/Green blue environment).
2. **After a bad change:** stop the damage, preserve evidence (snapshot), restore into a new instance, validate, and repair or cut over.
3. Keep the **old instance** for a short, defined time after a cutover, then delete it to save cost.

### 17.6 Monitoring, logging and alerting

1. Alarms in section 11.6, plus RDS event subscriptions to your paging channel.
2. Dashboards that show CPU, connections, latency, IOPS, storage, replica lag and **application** error rates side by side.
3. Slow query review on a schedule, not only during incidents.
4. Document runbooks and attach them to alarms.

### 17.7 Scalability and performance

1. Fix queries and indexes first. Then cache, then read replicas, then scale up, then shard or move to Aurora/other stores.
2. Use gp3 or io2 deliberately. Size the instance class for both **CPU/memory** and **EBS bandwidth**.
3. Control connections with pooling and **RDS Proxy**.
4. Avoid long transactions and large batch operations during peak. Chunk them.

### 17.8 Cost optimisation

1. See the table in section 14.4. Review costs monthly with tags and Cost Explorer.
2. Delete unused snapshots, replicas and stopped-and-forgotten instances.
3. Right-size using utilisation data after at least a few weeks of metrics.

### 17.9 Backup and recovery

1. Retention matched to RPO and compliance. Copies in another Region and account for critical data.
2. **Restore drills**: measure the real RTO and verify data integrity. Record results.
3. Protect backups from deletion (IAM, SCP, Vault Lock).

### 17.10 Compliance considerations

1. Encryption at rest and in transit, audit logging and retention, access reviews and key management are common requirements (PCI DSS, HIPAA, SOC 2, ISO 27001, GDPR).
2. Check that the chosen engine, features and Region are covered by the relevant **AWS compliance programme** documents (AWS Artifact), and document **shared responsibility**.
3. Data residency: keep snapshots and replicas in approved Regions only.

---

## 18. Comparison Tables

### 18.1 Multi-AZ instance vs Multi-AZ cluster vs Aurora vs read replica

| Feature | Multi-AZ DB instance | Multi-AZ DB cluster | Aurora cluster | Read replica |
| --- | --- | --- | --- | --- |
| Purpose | HA | HA + read scaling | HA + read scaling | Read scaling, DR |
| Replication | Sync, storage level | Semi-sync, engine level | Shared storage (6 copies, 3 AZs) | Async, engine level |
| Readable standby | No | Yes (2) | Yes (up to 15 replicas) | Yes |
| Typical failover | About 1–2 minutes | Often about 35 seconds or less | Often about 30 seconds or less | Manual promotion |
| Cross-Region | No | No | Global Database | Yes |
| Cost | 2× instance | 3× instances | Per instance + I/O or storage model | Per replica |

(Failover numbers are indicative. Verify in the documentation.)

### 18.2 Automated backups vs manual snapshots

| Feature | Automated backups | Manual snapshots |
| --- | --- | --- |
| Created by | RDS (daily + logs) | You |
| Retention | 0–35 days | Until you delete |
| PITR | Yes | No (fixed point) |
| Deleted with the instance | Yes (unless retained) | No |
| Use | Operational recovery | Before changes, long-term, copies |

### 18.3 gp2 vs gp3 vs io1/io2

| Feature | gp2 | gp3 | io1 / io2 |
| --- | --- | --- | --- |
| IOPS | Tied to size, burst | Baseline independent of size, configurable | Provisioned |
| Cost | Moderate | Usually lower than gp2 at the same performance | Highest |
| Use | Legacy | Default choice | High, consistent I/O |

### 18.4 RDS vs Aurora vs database on EC2

| Aspect | RDS (standard engines) | Aurora | Database on EC2 |
| --- | --- | --- | --- |
| Operations effort | Low | Low | **High** (you patch, back up, fail over) |
| OS access | No (RDS Custom aside) | No | Yes |
| Engines | MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2 | MySQL/PostgreSQL compatible | Anything |
| HA | Multi-AZ | Built in | You build it |
| Scaling reads | Replicas | Replicas on shared storage | You build it |
| Cost | Higher than raw EC2, lower than ops time | Often higher per instance | Lowest infrastructure cost, highest people cost |

### 18.5 RDS Proxy vs application pool vs PgBouncer

| Aspect | App-side pool | RDS Proxy | PgBouncer/ProxySQL (self-managed) |
| --- | --- | --- | --- |
| Who runs it | App library | AWS | You |
| Shared across app instances | No | **Yes** | Yes |
| Failover handling | App retries | Proxy keeps client connections and reconnects | You configure |
| Cost | None | Per vCPU-hour | Compute and ops effort |
| Best for | Steady, few app instances | Lambda, bursty fleets | Fine control, special modes |

### 18.6 Upgrade approaches

| Approach | Downtime | Rollback | Cost | Notes |
| --- | --- | --- | --- | --- |
| In-place upgrade | Minutes or more | Snapshot restore | Low | Simple. Risky for large databases |
| **Blue/Green** | About a minute | Keep blue environment | Pay for both temporarily | Best for major upgrades where supported |
| Snapshot restore + test | N/A (test only) | N/A | Temporary | Rehearsal |
| DMS/logical replication | Near zero | Reverse replication | Medium | Cross-engine or version jumps |

### 18.7 Common interview traps

1. **"Multi-AZ gives me read scaling."** Not for the instance deployment: the standby is not readable.
2. **"Read replicas are my backup."** They copy bad writes.
3. **"PITR restores my instance."** It creates a **new** instance.
4. **"I can encrypt an existing DB by editing it."** You must snapshot, copy encrypted and restore.
5. **"Storage can be reduced."** No. Storage can only grow.
6. **"Multi-AZ protects me from a bad migration."** It replicates the mistake.
7. **"Failover is instant."** It takes a minute or two (instance deployment), and your app must reconnect.
8. **"Autoscaling storage means I don't need alarms."** You still need alarms and a cap.
9. **"I'll just connect to the IP."** The IP changes.
10. **"Deleting the instance keeps automated backups."** Not unless you retain them. Manual snapshots stay.

---

## 19. Enterprise Reference Architecture

### 19.1 Production three-tier design with RDS

```text
Users -> Route 53 -> CloudFront + WAF -> ALB (public subnets, 3 AZs, TLS)
                                            |
                                  ECS/EKS/EC2 app tier (private subnets, ASG)
                                            |  IAM role + Secrets Manager (app secret)
                          +-----------------+------------------+
                          |                                    |
                   RDS Proxy (private)                    ElastiCache (cache)
                          |
        +-----------------+-------------------------------------------+
        |  DB subnets (private, no internet route), 3 AZs             |
        |  RDS MySQL/PostgreSQL Multi-AZ (writer + standby)           |
        |  KMS-encrypted, TLS enforced, deletion protection           |
        |  Read replica (reporting) in another AZ                     |
        +-------------------------------------------------------------+
   Backups: automated (14-35 d) + AWS Backup (cross-account, cross-Region copy, Vault Lock)
   DR Region: cross-Region read replica (promote) or backup replication + IaC ready
   Observability: CloudWatch alarms, Performance Insights, logs -> CloudWatch -> SIEM
   Control plane: Terraform pipeline, CloudTrail, Config rules, Security Hub, GuardDuty
   Admin access: SSM Session Manager port forwarding (no public DB, no inbound SSH)
```

### 19.2 Change and release flow

1. Schema changes go through version-controlled migrations (Flyway or Liquibase), reviewed and run by the pipeline with a **migration user**, not by hand.
2. Pipeline: test on an ephemeral database -> staging (restored from a masked snapshot) -> production with a **pre-change snapshot**.
3. Use **expand/contract** migrations (add column, deploy code, backfill, switch, drop later) so releases and rollbacks do not need lock-heavy changes.
4. Infrastructure changes (class, parameters, versions) via Terraform plan review, with a window and a rollback plan. Major upgrades via Blue/Green.

### 19.3 Where RDS shows up in other designs

1. **Serverless:** Lambda -> RDS Proxy -> RDS.
2. **Containers:** EKS pods with IRSA (IAM roles for service accounts) fetching secrets or IAM tokens.
3. **Analytics offload:** read replica or export to S3/Redshift for heavy analytics.
4. **Multi-account:** shared database account with strict access, snapshots copied to a backup account.

### 19.4 Design decisions to explain in an interview

1. Why Multi-AZ instance vs Multi-AZ cluster vs Aurora (cost, failover time, read scaling).
2. How you handle connections (pool sizes, RDS Proxy) as the app scales.
3. How you protect against **both** infrastructure failure (Multi-AZ) and logical failure (PITR, snapshots, tested restores).
4. How secrets are managed and rotated without downtime.
5. How you upgrade (Blue/Green, rehearsal, rollback).
6. How you meet RPO/RTO in a Region failure and how you proved it (drills).

---

## 20. Interview Questions and Answers

> Answer pattern: **definition → how it works → trade-off or example → follow-up**. Follow-up questions a senior interviewer may ask are shown as **Follow-up**.

### 20.1 Basic concepts

#### Q1. What is Amazon RDS and why do we use it?

1. A managed relational database service. AWS runs the servers, storage, backups, patching and failover automation. You manage schema, users, queries and tuning.
2. Benefits: high availability (Multi-AZ), automated backups and PITR, easy scaling (class, storage, read replicas), encryption, monitoring and less operational work.
3. Example: an orders app gets Multi-AZ for AZ failures, PITR for mistakes and a replica for reports.
4. You pay for instance hours, storage, IOPS, backup storage beyond the free allowance and data transfer.
5. **Follow-up:** "Does RDS make queries fast?" No. It runs the database. Indexing and query design are still yours.

#### Q2. What does AWS manage in RDS and what do you manage?

1. AWS: hardware, host OS, engine installation and patching (in your window), storage replication, backups execution, failover automation, the service control plane.
2. You: VPC and security groups, public access, parameter tuning, version choices and upgrade timing, database users and privileges, schema and indexes, backup retention and restore tests, alarms, and application connection handling.
3. Remember: **a failover is automatic, but the application must reconnect.**
4. **Follow-up:** "Can AWS restore my dropped table?" Only if you have backups, and a restore always goes to a new instance. You then repair the data.

#### Q3. Which engines and deployment options does RDS support?

1. Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2, plus Aurora MySQL and PostgreSQL.
2. Options: Single-AZ, Multi-AZ DB instance, Multi-AZ DB cluster (MySQL and PostgreSQL), read replicas, Aurora clusters, RDS Custom, RDS on Outposts.
3. Features vary by engine and version (option groups, replicas, Blue/Green, IAM auth). Verify in the documentation before designing.
4. Choose by compatibility, licence, features and cost.

#### Q4. What is a DB instance, an instance class and an endpoint?

1. A **DB instance** is the isolated database environment (compute, memory, storage attachment, network).
2. The **instance class** (for example `db.m7g.large`) sets vCPU, memory and network capacity. Burstable `db.t*` classes use CPU credits and are not suited to steady production load.
3. The **endpoint** is a DNS name and port. After a failover DNS points to the new primary, so apps must use the name and re-resolve it. **Never use the IP.**
4. **Follow-up:** "What changes the endpoint?" A restore, a replica or a new instance gets a new endpoint. A failover keeps the name but changes the IP behind it.

#### Q5. What is a DB subnet group and why does it need two AZs?

1. A named set of subnets in one VPC where RDS can place instances.
2. It must span at least **two AZs** so RDS can place a standby, a replacement or a replica, even if you start Single-AZ.
3. Use private, database-only subnets with no internet route, and keep spare IPs.
4. You cannot move an instance to another VPC by editing it. Restore a snapshot into the new subnet group.

#### Q6. How do you secure network access to RDS?

1. Place it in **private subnets** with **public accessibility off**.
2. The security group allows the DB port **only from the application SG** (or proxy SG), not from `0.0.0.0/0`.
3. Admin access: SSM Session Manager port forwarding, VPN or a locked-down bastion.
4. Check NACLs, routes and flow logs when connections time out.
5. **Follow-up:** "Instance is public but the SG is closed. Can people connect?" No. The SG still blocks them. But a public instance is one SG mistake away from exposure, so avoid it.

#### Q7. Explain Multi-AZ for a DB instance.

1. RDS keeps a **synchronous standby** in another AZ. Writes are acknowledged after both copies are durable.
2. The standby is **not readable**. On failure RDS promotes it and updates the endpoint DNS, usually in about 1–2 minutes.
3. Triggers: AZ or host failure, storage failure, class change or patching, reboot with failover.
4. It does **not** protect from bad data, since the mistake replicates. You still need backups.
5. **Follow-up:** "How do you test it?" `reboot-db-instance --force-failover` in staging while the app is under load.

#### Q8. What are read replicas and when do you use them?

1. Read-only copies updated **asynchronously**. Each has its own endpoint.
2. Uses: scale reads, offload reporting, cross-Region reads and DR.
3. Replicas can be promoted to standalone instances (irreversible). Data not yet replicated is lost at promotion.
4. Watch `ReplicaLag`. Use read-after-write routing for flows that must see their own writes.
5. For MySQL and MariaDB the source needs **automated backups enabled** (binary logs).

#### Q9. What is the difference between Multi-AZ and read replicas?

1. **Multi-AZ instance:** HA, synchronous, standby not readable, automatic failover, same endpoint, same Region.
2. **Read replica:** read scaling and DR, asynchronous, readable, manual promotion, own endpoint, can be cross-Region.
3. Use both: Multi-AZ for availability and replicas for read scale or DR.
4. **Follow-up:** "Is a Multi-AZ DB cluster the same as a read replica?" No. It has two readable standbys with semi-synchronous replication and a reader endpoint, but it is a single HA cluster.

#### Q10. Automated backups vs manual snapshots?

1. **Automated:** daily snapshot plus transaction logs, retention 0–35 days, enable PITR, deleted with the instance unless retained.
2. **Manual:** you create it, kept until you delete it, no PITR, survives instance deletion, can be copied and shared.
3. Use manual snapshots before risky changes and for long-term retention. Use AWS Backup for policy-driven copies.
4. Retention 0 disables automated backups (and blocks replicas where they need logs).

### 20.2 Intermediate concepts

#### Q11. How does point-in-time recovery work?

1. RDS restores the latest daily snapshot and replays transaction logs up to the chosen time (within retention and before the latest restorable time, about 5 minutes ago).
2. It always creates a **new instance** with a new endpoint.
3. Set the right SG, subnet group, parameter group and options on the new instance, validate data, then repair or cut over.
4. Restore time grows with database size and log volume, so measure it in drills.
5. **Follow-up:** "Can you restore a single table?" Not directly. Restore to a new instance and copy the table or rows.

#### Q12. Explain RDS storage types and storage autoscaling.

1. **gp3** (default choice, baseline IOPS independent of size), **gp2** (IOPS tied to size, burst credits), **io1/io2** (provisioned IOPS for demanding workloads).
2. Storage can grow but **cannot shrink**. There is a cool-down between modifications, so do not wait until 99%.
3. **Autoscaling** (`max_allocated_storage`) grows storage when free space is low for a few minutes. It needs a cap and an alarm on `FreeStorageSpace`.
4. IOPS is also bounded by the **instance class** EBS bandwidth.
5. **Follow-up:** "The disk is huge and mostly empty. How do you shrink it?" Migrate to a new smaller instance (dump/restore, DMS or logical replication).

#### Q13. What are parameter groups and option groups? Static vs dynamic parameters?

1. A **parameter group** holds engine settings. Default groups are read-only, so create a custom one in the right family (for example `mysql8.0`).
2. **Dynamic** parameters apply without restart. **Static** parameters apply after a **reboot** (status `pending-reboot`).
3. **Option groups** add engine features for Oracle, SQL Server, MySQL and MariaDB. PostgreSQL uses extensions and `shared_preload_libraries` instead.
4. Manage them in IaC and test changes first. Remember a major upgrade needs a parameter group of the new family.
5. **Follow-up:** "Why did a maintenance reboot change behaviour?" A static parameter was waiting in `pending-reboot`.

#### Q14. How does RDS encryption at rest work?

1. AES-256 with KMS. It covers storage, automated backups, snapshots, replicas and logs.
2. Choose it **at creation**. Replicas of an encrypted source are encrypted. Cross-Region copies need a key in the destination Region.
3. Use a **customer-managed key** for key policy control, rotation, audit and cross-account snapshot sharing.
4. If the key is disabled or deleted, the database becomes inaccessible. Protect the key.
5. Add TLS for data in transit.

#### Q15. How do you manage database credentials: Secrets Manager vs IAM authentication?

1. **RDS-managed master secret** (`manage_master_user_password`): RDS creates and rotates the secret. No password in code, `tfvars` or Terraform state.
2. **Secrets Manager** for application users, with rotation, read by the app's IAM role (scoped to the secret ARN).
3. **IAM database authentication** (MySQL, PostgreSQL, MariaDB): the app gets a short-lived token (valid 15 minutes to open a connection) from `generate-db-auth-token` using `rds-db:connect`. TLS is required. No stored password.
4. Trade-offs: IAM auth has connection rate limits and needs token handling. Secrets Manager has per-secret costs and needs refresh on rotation.
5. Never use the master user in applications.

#### Q16. Which CloudWatch metrics do you watch for RDS?

1. Capacity: `CPUUtilization`, `FreeableMemory`, `SwapUsage`, `FreeStorageSpace`, `DatabaseConnections`.
2. Storage: `ReadLatency`, `WriteLatency`, `ReadIOPS`, `WriteIOPS`, `DiskQueueDepth`, `BurstBalance`, `EBSIOBalance%`.
3. Burstable credits: `CPUCreditBalance`.
4. Replication: `ReplicaLag`. PostgreSQL: `OldestReplicationSlotLag`, `TransactionLogsDiskUsage`, `MaximumUsedTransactionIDs`. MySQL: `BinLogDiskUsage`.
5. Also RDS events for failover and low storage, plus application latency and errors.

#### Q17. How do you handle RDS maintenance and upgrades?

1. A weekly **maintenance window** applies required patches. Multi-AZ maintenance means about one failover. Single-AZ means a restart.
2. **Minor** upgrades are low risk and can be automatic. Many teams control them through a pipeline. **Major** upgrades are never automatic.
3. Major upgrade steps: release notes, snapshot, test on a copy or Blue/Green, check extensions and drivers, new parameter group family, upgrade, `ANALYZE` (PostgreSQL), monitor.
4. Track end-of-support dates. Extended Support costs extra.
5. Prefer **Blue/Green** for major upgrades where supported.

#### Q18. What is RDS Proxy and when would you use it?

1. A managed proxy that **pools and multiplexes connections** between clients and RDS or Aurora, supports IAM auth and Secrets Manager, and handles failover reconnection.
2. Use for Lambda, bursty autoscaling fleets and apps that cannot pool.
3. Limits: extra latency and cost, **pinning** (session state keeps one database connection), engine support, must be in the VPC with its own SG.
4. It does not replace app-level retries.
5. **Follow-up:** "How do you know pinning is a problem?" Watch `DatabaseConnectionsCurrentlySessionPinned` and the proxy logs. Avoid session variables and temporary tables.

#### Q19. When would you run a database on EC2 instead of RDS?

1. When you need **OS access**, unsupported engines, versions or extensions, custom storage layouts or special licensing.
2. Cost is lower for raw infrastructure but you take on patching, backups, failover, monitoring and on-call.
3. Consider **RDS Custom** (Oracle and SQL Server) as a middle path.
4. For most teams RDS is cheaper once engineer time is counted.

#### Q20. Multi-AZ DB instance vs Multi-AZ DB cluster?

1. **Instance:** one standby, synchronous, not readable, failover about 1–2 minutes.
2. **Cluster:** writer plus two readable standbys in three AZs, semi-synchronous, reader endpoint, faster failover (often about 35 seconds or less).
3. Cluster is available for MySQL and PostgreSQL with limits on versions, classes and some features. Verify first.
4. Cost is higher with the cluster (three instances).
5. Choose cluster when you need faster failover and read capacity without Aurora. Choose Aurora for deeper scale and features.

### 20.3 Advanced technical questions

#### Q21. How does Aurora differ from standard RDS, and when would you choose it?

1. Aurora separates compute and storage. The cluster volume keeps six copies across three AZs and grows automatically (up to 128 TiB).
2. Replicas share storage, so lag is small and failover is fast (typically around 30 seconds or less).
3. Features: up to 15 replicas, Global Database, Serverless v2, fast clone, Backtrack (MySQL-compatible).
4. Choose for high read scale, fast failover, large databases or global needs. Standard RDS fits simpler or cost-sensitive workloads and engines Aurora does not support.
5. Trade-offs: AWS-specific, a different cost model (instance plus storage and I/O options) and slightly different behaviours. Verify current pricing.

#### Q22. How do Blue/Green Deployments work and what are the risks?

1. RDS builds a **green** copy of blue, keeps it in sync using logical replication (read-only), and lets you change and test it (for example a major upgrade).
2. **Switchover** checks health and lag, blocks writes briefly, waits for green to catch up and swaps endpoint names, typically in about a minute or less. No connection string change.
3. Blue becomes `-old`. Keep it for a rollback window, then delete.
4. Risks: supported engines and versions only, cost of two environments, logical replication limits (primary keys, some DDL and objects), long transactions delaying or failing switchover. Test beforehand.
5. **Follow-up:** "Can writes go to green before switchover?" By default no. Green is read-only to protect sync.

#### Q23. How do you design disaster recovery for RDS across Regions?

1. Start with RPO/RTO. Multi-AZ covers only an AZ.
2. Options: cross-Region snapshot copy (cheap, hours), cross-Region backup replication (PITR in DR), **cross-Region read replica** (minutes to promote), **Aurora Global Database** (about a second RPO, about a minute RTO).
3. Prepare in the DR Region: KMS keys, subnet groups, SGs, IaC, app tier and DNS/secret switch.
4. Runbook: promote, reconfigure (Multi-AZ, backups), repoint, validate, plan failback.
5. Drill it. Untested DR is a hope.

#### Q24. Walk through what happens during a Multi-AZ failover.

1. RDS detects the failure (health checks or an AZ event).
2. The standby is promoted and runs engine recovery.
3. The endpoint DNS record points to the new primary.
4. The old primary is replaced and resyncs as the new standby.
5. Existing client connections drop. Clients must re-resolve DNS and reconnect.
6. Events show failover started and completed.
7. App best practice: short DNS TTL, pool validation, timeouts, retries with backoff, idempotent writes, optionally RDS Proxy.
8. **Follow-up:** "Why can failover take longer than expected?" Long crash recovery (large uncommitted transactions), busy workload or DNS caching on the client.

#### Q25. How do you manage database connections at scale?

1. Know the limit (`max_connections`, derived from memory). More connections mean more memory and context switching, not more throughput.
2. Budget: `instances × pool size` must fit within the limit with headroom.
3. Use right-sized app pools, **RDS Proxy** for bursty or serverless clients, timeouts, and leak detection.
4. Watch `DatabaseConnections`, idle-in-transaction sessions and pool wait time.
5. Set `idle_in_transaction_session_timeout` (PostgreSQL) and kill orphaned sessions.

#### Q26. How do you handle replica lag?

1. Find the cause: heavy writes or large transactions on source, undersized replica, long queries on replica, replication errors, network.
2. Fix: resize replica or IOPS, chunk writes, move reports elsewhere, tune replication parallelism, check errors, recreate if broken.
3. In the application, route read-after-write to the primary and tolerate staleness elsewhere.
4. Alarm on `ReplicaLag`. Remember lag equals your RPO if you promote.
5. Consider Aurora or a Multi-AZ cluster if you need much smaller lag.

#### Q27. How do you use Performance Insights to find a performance problem?

1. Look at **database load (AAS)** against vCPU count. Sustained above the vCPU line means overload.
2. Slice by **top SQL**, **waits**, users and hosts. Identify the dominant query and wait type (CPU, I/O, lock).
3. Compare with the time of a deployment. Run `EXPLAIN` on the top SQL and fix indexes or queries.
4. AWS has been folding capabilities into CloudWatch Database Insights. Verify the current console and retention.
5. Combine with slow query logs and Enhanced Monitoring for OS-level detail.

### 20.4 Scenario-based and production troubleshooting questions

#### Q28. The application cannot connect to the database. How do you troubleshoot?

1. Check the instance status and recent events.
2. DNS: `nslookup` the endpoint from the app host. Expect a private IP.
3. Network: `nc -zv <endpoint> 3306`. A timeout means SG, NACL or route. A quick refusal or error means the DB responded.
4. Security group: does it allow the app's SG? Did the app's SG or subnet change?
5. Auth and TLS: credentials, host restrictions, rotated secret, required TLS and CA bundle.
6. Capacity: `Too many connections`, storage full.
7. Fix the broken layer and add a connectivity smoke test to the pipeline.

#### Q29. The database CPU is at 95%. What do you do?

1. Check what changed (release, traffic, batch).
2. Performance Insights: top SQL and waits. Check `CPUCreditBalance` on burstable classes.
3. Short-term: kill offending sessions, throttle or roll back the feature, move reports to a replica.
4. Fix: add or adjust indexes, rewrite queries, cache, reduce N+1.
5. Scale up only if the workload truly grew. Add slow-query alerts and load tests to prevent recurrence.

#### Q30. FreeStorageSpace is almost zero. What do you do?

1. **Stop the outage:** increase allocated storage now (`modify-db-instance`, storage grows only). Check autoscaling and its cap.
2. Find the cause: big tables, binary logs (MySQL), inactive replication slots or WAL (PostgreSQL), runaway jobs, temp usage.
3. Remove the cause: stop the job, drop a dead slot, adjust binlog retention, purge or archive with a plan.
4. Prevent: alarms at 20% and 10%, an autoscaling cap and an alarm near it, retention policies.
5. Remember storage cannot be shrunk later, so avoid blindly adding terabytes.

#### Q31. After a failover the application keeps failing for minutes. Why?

1. The failover itself takes 1–2 minutes. Longer failures point to the client.
2. Check DNS caching (for example Java TTL), connection pools holding dead connections, missing validation, missing retries, connecting by IP, writes sent to a replica endpoint.
3. Short term: restart affected app instances.
4. Fix: short DNS TTL, pool validation and max lifetime, retries with backoff, RDS Proxy.
5. Test failover regularly in staging.

#### Q32. A bad deployment corrupted production data. How do you recover?

1. Stop the damage: pause the job or feature, set read-only mode.
2. Take a manual snapshot of the current state for forensics.
3. **PITR to just before the change** into a new instance with correct SG, subnet group and parameters.
4. Validate, then either **repair** (copy affected rows into production) or **cut over** (and reconcile newer valid writes).
5. Prevent: migrations tested on production-like copies, snapshot before risky changes, small batches, restore drills.
6. **Follow-up:** "Why not just use Multi-AZ?" It replicates the mistake. It protects infrastructure, not logic errors.

#### Q33. A database password was committed to Git. What do you do?

1. **Rotate now.** Secrets Manager rotation or `ALTER USER`, then update the app secret.
2. Check exposure: audit logs, new users or grants, unusual hosts, CloudTrail and GuardDuty. Network controls (private subnets, SGs) limit blast radius.
3. Remove it from the repository and treat it as permanently exposed. Notify security.
4. Prevent: RDS-managed secrets, Secrets Manager, IAM authentication, secret scanning in pre-commit and CI, masked logs.

### 20.5 Security and best-practice questions

#### Q34. How would you harden a production RDS instance?

1. Private subnets, not public, SG allows the app SG only.
2. KMS encryption at creation, TLS enforced (`rds.force_ssl` or `require_secure_transport`) with certificate verification.
3. RDS-managed master secret, least-privilege database users, IAM authentication where practical, no master user in the app.
4. Deletion protection, final snapshot, backups with tested restores, cross-account copies, restricted IAM for destructive APIs.
5. Log exports, audit plugin, CloudTrail, Config rules, Security Hub and GuardDuty.
6. Patch policy, end-of-support tracking and IaC with reviews.

#### Q35. How do you encrypt an existing unencrypted RDS database?

1. You cannot enable it in place. Snapshot -> copy the snapshot with encryption (choose a KMS key) -> restore to a new instance.
2. Test the new instance, set SG, subnet group and parameters, then cut over. Plan downtime for writes between the snapshot and the cutover.
3. For minimal downtime, use a replica or DMS-based approach to stay in sync, then switch.
4. Delete the unencrypted instance and old snapshots afterwards.
5. Add an AWS Config rule so new unencrypted databases are detected.

#### Q36. How do you enforce TLS for RDS connections?

1. Server side: PostgreSQL `rds.force_ssl = 1`, MySQL `require_secure_transport = 1` (parameter group), per-user `REQUIRE SSL`, SQL Server `rds.force_ssl`.
2. Client side: use the RDS CA bundle and verify the certificate (`verify-full`, `VERIFY_IDENTITY`).
3. Track the **CA certificate expiry and rotation** to avoid surprise failures.
4. RDS Proxy can require TLS too.
5. Test in staging because old clients may not support the required TLS versions.

#### Q37. How do you audit and meet compliance requirements on RDS?

1. API activity: CloudTrail. Configuration compliance: AWS Config rules (public access, encryption, Multi-AZ, deletion protection, backup).
2. In-database auditing: MariaDB audit plugin (MySQL option group), `pgaudit`, SQL Server Audit, Oracle auditing. Export to CloudWatch Logs with retention and to a SIEM.
3. Encryption, key management, access reviews and backup retention evidence.
4. Use AWS Artifact for compliance reports and confirm the Region and engine are in scope. Document shared responsibility.

### 20.6 Follow-up questions a senior interviewer may ask

1. "Your DB is sized for peak but idle most of the time. What do you do?" Right-size with metrics, consider Aurora Serverless v2 for spiky loads, schedule stop/start for dev, use reserved capacity for the steady baseline.
2. "How do you roll out a schema change without downtime?" Expand/contract migrations, online DDL tools or engine features, small batches, run off-peak, tested on a production-size copy, snapshot first.
3. "How would you migrate an on-premises database to RDS?" Assess with Schema Conversion Tool if cross-engine, use native dump/restore for small and DMS or logical replication for near-zero downtime, cut over after validation.
4. "How do you give a developer temporary read access to production data?" IAM database authentication or a read-only user through SSM port forwarding, time-bound, audited, preferably against a masked replica or restored copy.
5. "How do you split reads and writes in the app?" Separate endpoints (writer and replica or reader), a framework or proxy that routes by intent, read-after-write rules, and a fallback if the replica lags.
6. "What if AWS wants to patch during business hours?" Set the window correctly, apply required maintenance early manually in a safe window, use Multi-AZ so the impact is one failover.
7. "When do you choose DynamoDB instead of RDS?" Key-based access at massive scale, flexible schema, single-digit millisecond latency, no complex joins or transactions across entities.

---

## 21. Interview Answer Framework

Use this for any scenario question. Say the steps aloud.

### 21.1 The eight-step framework

| Step | What you say | RDS-specific examples |
| --- | --- | --- |
| 1. Understand problem and impact | What is failing, who is affected, since when, what changed | Errors or latency? One service or all? Release, failover or maintenance? |
| 2. Check monitoring, logs, metrics, events | Evidence first | RDS events, CloudWatch (CPU, memory, storage, connections, latency), Performance Insights, slow log, app errors |
| 3. Verify architecture and configuration | Draw the chain | App -> DNS -> proxy -> SG -> endpoint -> instance -> storage; parameter group; Multi-AZ/replicas |
| 4. Narrow down root causes | Rank hypotheses | Network/SG, auth, connections, bad query, storage, failover, replica lag |
| 5. Run safe diagnostics | Read-only first | `describe-db-instances`, `describe-events`, `nc`, `SHOW PROCESSLIST`, `pg_stat_activity`, `EXPLAIN` |
| 6. Apply the safest fix and validate | Smallest change, with rollback | Kill a runaway query, add an index online, add storage, fix an SG, PITR to a new instance |
| 7. Communicate and document | Status, timeline, root cause | Incident updates, post-incident review, action items |
| 8. Prevent recurrence | Alerts and automation | Alarms, slot monitoring, connection budgets, IaC, restore drills, failover tests |

### 21.2 RDS adaptations

1. **Cannot connect:** instance state -> DNS -> port reachability -> SG -> auth/TLS -> connection limit.
2. **Slow database:** what changed -> top SQL and waits -> plans and indexes -> connections -> resources.
3. **Disk filling:** add storage -> find the consumer (tables, logs, slots) -> stop growth -> alarms.
4. **Failover trouble:** confirm failover -> client DNS and pool behaviour -> retries -> proxy.
5. **Data damage:** stop writes -> snapshot -> PITR new instance -> validate -> repair or cut over.
6. **Security incident:** rotate -> audit activity -> remove exposure -> harden.

### 21.3 Worked example (about 90 seconds)

> **Question:** "Your application suddenly cannot connect to RDS. What do you do?"
>
> "First I'd confirm the impact: which services, since when, and whether anything changed: a deployment, a security group edit, a secret rotation, a failover or maintenance. Then I'd check RDS events and the instance status to see if it is available.
>
> I'd test layer by layer from an app host: does the endpoint resolve to the right private IP, and does the port answer? A timeout points to the network, meaning the security group, NACL or route. A quick error means the database answered, so I'd look at authentication, TLS and the connection limit. I'd run read-only checks: `describe-db-instances`, `describe-events`, `nc -zv`, and look at `DatabaseConnections` against the limit.
>
> Say the DB security group only allows the old application SG after a redeploy. The safest fix is to add the SG-to-SG rule for the new one and watch connections recover. Then I'd write up the timeline, put the rules in Terraform with SG references, and add a connectivity smoke test to the pipeline and an alarm on connection errors."

### 21.4 Delivery tips

1. State assumptions ("assuming Multi-AZ MySQL in private subnets behind an app tier").
2. Walk the chain from client to storage. It shows structure.
3. Prefer read-only diagnostics first and say so.
4. Mention trade-offs (cost versus availability, replicas versus Proxy, speed versus risk).
5. Do not claim you built something you did not. Use "in a design like this I would…" for hypotheticals, and use your real project experience only where it is genuinely yours.

---

## 22. Quick Revision

### 22.1 Key points to remember

1. RDS = managed relational database. AWS runs infrastructure and patching. You own schema, queries, users and tuning.
2. **Multi-AZ = availability** (sync, standby not readable, DNS failover). **Read replica = read scale/DR** (async, readable, promote manually).
3. **Backups:** automated 0–35 days + logs = PITR. **PITR creates a new instance.** Manual snapshots persist.
4. **Storage grows, never shrinks.** gp3 default. Autoscaling needs a cap and an alarm.
5. **Encrypt at creation.** To encrypt later: snapshot -> encrypted copy -> restore.
6. **Never connect by IP. Failover changes DNS.** Retries, short TTL, pool validation.
7. Use **RDS-managed master secret** or Secrets Manager. No plain-text passwords in code or Terraform state.
8. Private subnets, SG from app SG only, TLS enforced, deletion protection.
9. Static parameters need a **reboot** (`pending-reboot`). Custom parameter groups only.
10. Use **RDS Proxy** for bursty connections and smoother failover. Watch pinning.
11. **Blue/Green** for low-downtime major upgrades. Keep blue for rollback.
12. Multi-AZ does not protect from bad writes. **Backups and tested restores do.**

### 22.2 Important commands

```bash
aws rds describe-db-instances --db-instance-identifier <id>
aws rds describe-events --source-type db-instance --source-identifier <id> --duration 360
aws rds modify-db-instance --db-instance-identifier <id> --multi-az --apply-immediately
aws rds reboot-db-instance --db-instance-identifier <id> --force-failover
aws rds create-db-snapshot --db-instance-identifier <id> --db-snapshot-identifier <snap>
aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier <id> \
  --target-db-instance-identifier <new-id> --use-latest-restorable-time
aws rds create-db-instance-read-replica --db-instance-identifier <replica> --source-db-instance-identifier <id>
aws rds promote-read-replica --db-instance-identifier <replica>
aws rds generate-db-auth-token --hostname <endpoint> --port 3306 --region <region> --username <user>
nc -zv <endpoint> 3306
```

```sql
SHOW FULL PROCESSLIST;                       -- MySQL
SELECT * FROM pg_stat_activity;              -- PostgreSQL
SELECT slot_name, active FROM pg_replication_slots;   -- PostgreSQL slots
```

### 22.3 Commonly confused concepts

| Pair | Difference |
| --- | --- |
| Multi-AZ vs read replica | Availability (sync, not readable) vs read scaling (async, readable) |
| Automated backup vs snapshot | Retention-limited with PITR vs kept until deleted |
| Failover vs promotion | Automatic standby takeover vs manual, one-way replica promotion |
| Static vs dynamic parameter | Reboot required vs applied live |
| Parameter group vs option group | Engine settings vs engine feature add-ons |
| RDS vs Aurora | Per-instance storage vs shared cluster storage |
| IAM auth vs Secrets Manager | Short-lived token, no password vs stored and rotated password |
| Pooling vs RDS Proxy | Per-app instance vs shared managed layer |
| Public accessibility vs security group | Gets a public IP vs allows or blocks traffic |
| Storage autoscaling vs alarms | Hides growth vs warns about growth |

### 22.4 Five-minute revision notes

1. **Create it right:** private subnets, SG from app SG, KMS encryption, TLS, managed secret, Multi-AZ, deletion protection, backups (retention 7–35 days), log exports, Performance Insights.
2. **Run it well:** alarms (CPU, memory, storage, connections, latency, replica lag, events), slow query review, connection budget, tested failover, maintenance window.
3. **Recover it:** failover for infrastructure, PITR/snapshot for logical damage, cross-Region plan for disasters. Practise restores.
4. **Change it safely:** IaC, snapshot first, Blue/Green for major upgrades, expand/contract migrations.
5. **Troubleshoot:** events -> DNS -> port -> SG -> auth/TLS -> connections -> top SQL -> storage.

### 22.5 Quick-reference cheat sheet

| Need | Use |
| --- | --- |
| Survive AZ failure | Multi-AZ |
| Scale reads | Read replicas or Aurora replicas |
| Undo a bad change | PITR to a new instance |
| Region failure | Cross-Region replica, backup copy or Aurora Global |
| Too many connections | Pooling, RDS Proxy |
| No passwords in code | RDS-managed secret, Secrets Manager, IAM auth |
| Major upgrade with low downtime | Blue/Green |
| Slow queries | Performance Insights, slow log, `EXPLAIN` |
| Disk filling | Add storage, find consumer, alarms |
| Cost control | Right-size, gp3, reserved capacity, stop dev DBs, delete old snapshots |

### 22.6 Ten rapid-fire questions (with short answers)

1. **Is the Multi-AZ standby readable?** No (for the DB instance deployment).
2. **Does PITR overwrite the instance?** No. It creates a new one.
3. **Can you shrink RDS storage?** No.
4. **Can you encrypt an existing instance in place?** No. Snapshot, encrypted copy, restore.
5. **How long is an IAM auth token valid for opening a connection?** 15 minutes.
6. **Which parameters need a reboot?** Static ones (`pending-reboot`).
7. **What is the maximum automated backup retention?** 35 days.
8. **What protects against accidental deletion?** Deletion protection and a final snapshot.
9. **What reduces connection storms from Lambda?** RDS Proxy.
10. **First command for a connectivity timeout?** `nc -zv <endpoint> <port>` from the app host, then check the SG.

### 22.7 Final interview readiness checklist

Tick each item only if you can explain it **without notes**.

- [ ] I can draw the app -> proxy -> RDS Multi-AZ architecture with subnets and security groups.
- [ ] I can explain what AWS manages and what I manage.
- [ ] I can compare Multi-AZ instance, Multi-AZ cluster, read replicas and Aurora.
- [ ] I can explain a failover step by step and what the application must do.
- [ ] I can explain automated backups, snapshots and PITR, and run a restore drill.
- [ ] I can explain storage types, autoscaling and why storage cannot shrink.
- [ ] I can explain parameter groups (static vs dynamic) and option groups.
- [ ] I can explain encryption at rest, TLS enforcement and how to encrypt an existing database.
- [ ] I can explain Secrets Manager, RDS-managed master secrets and IAM database authentication.
- [ ] I can pick CloudWatch metrics and alarms, and use Performance Insights.
- [ ] I can explain minor and major upgrades and Blue/Green Deployments.
- [ ] I can explain RDS Proxy, multiplexing and pinning.
- [ ] I can design DR for a Region failure with RPO and RTO.
- [ ] I can read and write a Terraform RDS definition with a managed secret and monitoring.
- [ ] I can troubleshoot "cannot connect", "high CPU", "storage full", "failover errors", "data corruption" and "leaked password" with the eight-step framework.
- [ ] I have rehearsed at least three scenarios aloud.

### 22.8 Official documentation (verify current details here)

- What is Amazon RDS: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html>
- Multi-AZ deployments: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html>
- Read replicas: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html>
- Backing up and restoring: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html>
- Encrypting RDS resources: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html>
- Password management with Secrets Manager: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-secrets-manager.html>
- IAM database authentication: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html>
- Working with parameter groups: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithParamGroups.html>
- Blue/Green Deployments: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/blue-green-deployments.html>
- Amazon RDS Proxy: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html>
- Monitoring RDS: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/MonitoringOverview.html>
- Troubleshooting RDS: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Troubleshooting.html>

> Some of these URLs may be reorganised by AWS over time. If a link moves, search the title on the AWS documentation site.
