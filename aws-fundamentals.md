# AWS Fundamentals — Complete DevOps Interview Notes

> **Level:** Beginner foundations to intermediate/advanced interview depth (4–6 years of experience)
> **Roles covered:** DevOps Engineer, Senior DevOps Engineer, SRE, Cloud Engineer, Platform Engineer
> **Style:** Simple English, pointwise notes, production scenarios, interview-ready answers

**How to use these notes**

1. Read sections 1–14 to build the foundation.
2. Practise sections 15–16 (commands, Terraform, incidents) in a sandbox AWS account.
3. Drill sections 20–21 (Q&A and answer framework) until you can answer without reading.
4. Use section 22 for last-day revision.

**Conventions**

- `<placeholder>` or `123456789012` style values are examples. No real secrets, keys or account IDs appear here.
- **[MANDATORY]** marks a control you should never skip in production. **[OPTIONAL]** marks a design choice that depends on requirements and cost.
- Prices, quotas, Region lists and newer features change often. Where that applies, the note says "verify in the current AWS documentation".

---

## Table of Contents

1. [Cloud Computing Basics](#1-cloud-computing-basics)
2. [What Is AWS and the Core Service Map](#2-what-is-aws-and-the-core-service-map)
3. [AWS Global Infrastructure](#3-aws-global-infrastructure)
4. [High Availability, Fault Tolerance and Resilience](#4-high-availability-fault-tolerance-and-resilience)
5. [Disaster Recovery](#5-disaster-recovery)
6. [Scalability and Elasticity](#6-scalability-and-elasticity)
7. [Shared Responsibility Model](#7-shared-responsibility-model)
8. [AWS Accounts, Organizations and Landing Zones](#8-aws-accounts-organizations-and-landing-zones)
9. [Ways to Access AWS: Console, CLI, SDK, API](#9-ways-to-access-aws-console-cli-sdk-api)
10. [IAM Basics You Must Know First](#10-iam-basics-you-must-know-first)
11. [Infrastructure as Code](#11-infrastructure-as-code)
12. [Core Services Overview: Compute, Storage, Network, Database](#12-core-services-overview-compute-storage-network-database)
13. [Monitoring, Logging and Governance Basics](#13-monitoring-logging-and-governance-basics)
14. [Pricing, Billing and Cost Basics](#14-pricing-billing-and-cost-basics)
15. [Hands-On: Commands and Terraform](#15-hands-on-commands-and-terraform)
16. [Production Troubleshooting Scenarios](#16-production-troubleshooting-scenarios)
17. [Security, Reliability and Best Practices](#17-security-reliability-and-best-practices)
18. [Comparison Tables](#18-comparison-tables)
19. [Enterprise Reference Architecture](#19-enterprise-reference-architecture)
20. [Interview Questions and Answers](#20-interview-questions-and-answers)
21. [Interview Answer Framework](#21-interview-answer-framework)
22. [Quick Revision](#22-quick-revision)

---

## 1. Cloud Computing Basics

### 1.1 What it is

1. Cloud computing means using computing resources (servers, storage, databases, networking, security, monitoring) **over the internet, on demand**, instead of buying and running all the hardware yourself.
2. You rent capacity from a provider such as AWS and pay for what you use.
3. The provider owns and maintains the physical data centres. You configure and operate your resources on top.

### 1.2 Why it is needed

1. **No large upfront hardware cost.** You do not buy servers months before you need them.
2. **Speed.** A server takes minutes, not weeks.
3. **Elasticity.** Capacity grows and shrinks with demand.
4. **Global reach.** You can deploy near your users in many Regions.
5. **Managed services.** AWS runs databases, queues and Kubernetes control planes for you.
6. **Pay-as-you-go.** You are billed per usage (per second, per hour, per GB or per request, depending on the service).

### 1.3 Traditional vs cloud: hosting a website

| Step | Traditional (on-premises) | Cloud (AWS) |
| --- | --- | --- |
| 1 | Order a physical server and wait | Launch an EC2 instance in minutes |
| 2 | Install and configure the OS | Choose an AMI (machine image) |
| 3 | Arrange networking and storage | Create a VPC, subnets, EBS volumes |
| 4 | Replace faulty hardware yourself | AWS maintains the hardware |
| 5 | Pay for peak capacity even when idle | Scale in and pay for actual usage |

### 1.4 Service models: IaaS, PaaS, SaaS

| Model | Meaning | You manage | Provider manages | AWS example |
| --- | --- | --- | --- | --- |
| **IaaS** (Infrastructure as a Service) | Virtual infrastructure | OS, runtime, app, data | Hardware, virtualisation | EC2, EBS, VPC |
| **PaaS** (Platform as a Service) | Managed platform to run code | App, data | OS, runtime, scaling | Elastic Beanstalk, RDS (managed DB) |
| **SaaS** (Software as a Service) | Finished software | Usage and configuration | Everything else | Amazon WorkSpaces, Amazon Chime |
| **FaaS / Serverless** | Run code without servers | Code, config | Servers, scaling | Lambda, Fargate |

Easy memory trick: more *as a Service* means **less** for you to manage.

### 1.4.1 Deployment models

1. **Public cloud:** All resources run at a cloud provider (for example AWS).
2. **Private cloud / on-premises:** Infrastructure runs in your own data centre.
3. **Hybrid cloud:** A mix, connected by VPN or Direct Connect.
4. **Multi-cloud:** Using more than one cloud provider.

### 1.5 Cloud benefits in one line each (interview favourites)

1. Trade capital expense for variable expense.
2. Benefit from massive economies of scale.
3. Stop guessing capacity.
4. Increase speed and agility.
5. Stop spending money running data centres.
6. Go global in minutes.

### 1.6 Common mistakes

1. Treating the cloud like a data centre (lift-and-shift without redesign) and getting high cost and low resilience.
2. Forgetting that "managed service" does not mean "no responsibility" (see section 7).
3. Leaving unused resources running.

### 1.7 Interview pointers

Q1 (cloud computing), Q2 (IaaS/PaaS/SaaS).

---

## 2. What Is AWS and the Core Service Map

### 2.1 Definition

**AWS** stands for **Amazon Web Services**. It is a cloud platform with a very large catalogue of services for compute, storage, networking, databases, security, analytics, machine learning and more.

### 2.2 Core service map

| Requirement | AWS service | Notes |
| --- | --- | --- |
| Virtual server | **EC2** (Elastic Compute Cloud) | IaaS compute |
| Object storage | **S3** (Simple Storage Service) | Buckets and objects |
| Block storage | **EBS** (Elastic Block Store) | Disks for EC2 |
| Shared file storage | **EFS** (Elastic File System) | NFS for Linux |
| Private network | **VPC** (Virtual Private Cloud) | Network boundary |
| Identity and permissions | **IAM** (Identity and Access Management) | Who can do what |
| Managed relational DB | **RDS** / Aurora | MySQL, PostgreSQL and others |
| NoSQL | **DynamoDB** | Key-value / document |
| Auto scaling | **EC2 Auto Scaling** | Add/remove instances |
| Load balancing | **ELB** (ALB, NLB, GWLB) | Distribute traffic |
| DNS and routing | **Route 53** | DNS, health checks |
| CDN | **CloudFront** | Edge caching |
| Monitoring | **CloudWatch** | Metrics, logs, alarms |
| Audit | **CloudTrail** | API call history |
| IaC | **CloudFormation**, CDK (and Terraform from HashiCorp) | Infrastructure as Code |
| Containers | **ECS**, **EKS**, **ECR**, **Fargate** | Container platform |
| Serverless | **Lambda** | Event-driven functions |
| Messaging | **SQS**, **SNS**, **EventBridge** | Queues, pub/sub, events |
| Secrets | **Secrets Manager**, **SSM Parameter Store** | Secret and config storage |
| Encryption keys | **KMS** (Key Management Service) | Managed keys |

### 2.3 Example: a typical DevOps stack

```text
Developer -> Git -> CI/CD pipeline -> container image -> ECR
                                                    |
                          EKS / EC2 (apps in private subnets of a VPC)
                                   |            |             |
                                  RDS          S3        CloudWatch
          IAM roles control access ---------------------------^
```

### 2.4 Interview pointers

Q3 (service categories), Q4 (what AWS service for what).

---

## 3. AWS Global Infrastructure

### 3.1 The building blocks

| Term | Meaning |
| --- | --- |
| **Region** | A separate geographical area containing multiple AZs |
| **Availability Zone (AZ)** | One or more isolated data centres inside a Region |
| **Data centre** | Physical facility with servers, storage, networking, power and cooling |
| **Edge location** | Site used by services such as CloudFront to cache content near users |
| **Local Zone** | Extension of a Region into a metro area for very low latency |
| **Wavelength Zone** | AWS infrastructure inside telecom 5G networks (niche) |
| **Outposts** | AWS infrastructure installed in your own data centre (niche) |

### 3.2 Region

1. A Region is a geographical area, for example Mumbai (`ap-south-1`), Hyderabad (`ap-south-2`), Singapore (`ap-southeast-1`), Northern Virginia (`us-east-1`), Ireland (`eu-west-1`).
2. Each Region is **independent**. Resources are not automatically replicated to another Region.
3. Not every service or feature is available in every Region. Pricing differs by Region.
4. **How to choose a Region:**
   1. **Latency** to your users.
   2. **Data residency and compliance** (laws that require data to stay in a country).
   3. **Service availability** (does the Region support the services you need?).
   4. **Cost** (prices vary by Region).
5. Some services are global in nature (IAM, Route 53, CloudFront management), while most resources are regional.

### 3.3 Availability Zone

1. An AZ is an isolated location in a Region. It has independent power, cooling and networking, so a failure in one AZ should not affect another.
2. AZs in a Region are connected with high-bandwidth, low-latency private links.
3. AZ names such as `ap-south-1a` are **mapped per account**. `ap-south-1a` in your account may be a different physical AZ from `ap-south-1a` in another account. Use **AZ IDs** (for example `aps1-az1`) when coordinating across accounts.
4. Deploying across AZs improves availability, but it does **not** guarantee zero downtime. The application must tolerate failure, and remaining AZs need enough capacity.

### 3.4 Region vs AZ

| Feature | Region | Availability Zone |
| --- | --- | --- |
| Meaning | Geographical area | Isolated location inside a Region |
| Contains | Multiple AZs | One or more data centres |
| Example | `ap-south-1` | `ap-south-1a` |
| Protects against | Regional disaster (with multi-Region design) | Data-centre-level failure (with multi-AZ design) |
| Network between them | Internet or AWS backbone (higher latency) | Private low-latency links |
| Typical design | Cross-Region DR | Multi-AZ high availability |

Easy memory trick: Region = city or area. AZ = separate building cluster in that area.

### 3.5 Edge locations and CloudFront

1. Edge locations cache eligible content closer to users, reducing latency and origin load.
2. Example: Website origin in Mumbai, users in London. CloudFront serves cached static files from a London edge location.
3. Edge locations also power Route 53 DNS responses, AWS WAF and Shield protection at the edge, and Global Accelerator.

### 3.6 Local Zones

1. A Local Zone places selected services (compute, storage) near a large city.
2. Used for latency-sensitive workloads such as media production, interactive applications and real-time processing.
3. It is **not** a Region and not a normal AZ.

### 3.7 Global infrastructure diagram

```text
AWS Global Infrastructure
 |
 +-- Region: ap-south-1 (Mumbai)
 |     +-- AZ: aps1-az1  (one or more data centres)
 |     +-- AZ: aps1-az2
 |     +-- AZ: aps1-az3
 |
 +-- Region: eu-west-1 (Ireland)
 |     +-- AZ ... AZ ... AZ
 |
 +-- Edge locations (CloudFront, Route 53) in many cities
 +-- Local Zones (metro extensions of a Region)
```

### 3.8 Common mistakes

1. Assuming resources replicate across Regions automatically.
2. Assuming two AZs protect against a whole-Region outage.
3. Hard-coding AZ names across accounts.
4. Choosing a Region without checking service availability and data residency.

### 3.9 Interview pointers

Q5 (Region), Q6 (AZ), Q7 (Region vs AZ), Q8 (edge location), Q9 (Region selection).

---

## 4. High Availability, Fault Tolerance and Resilience

### 4.1 High availability (HA)

1. **What:** Designing a system so it stays **available** even when some components fail.
2. **How it works (typical web architecture):**
   1. Users send requests to an Application Load Balancer (ALB).
   2. The ALB checks target health and sends traffic only to healthy targets.
   3. Targets run in at least two AZs.
   4. If an instance or an AZ fails, the ALB stops sending traffic there.
   5. Auto Scaling replaces failed instances and restores capacity.
3. HA needs more than two servers: **health checks, spare capacity, stateless design, resilient dependencies** (database, cache, queues) and tested failover.

```text
Users
  |
  v
Application Load Balancer (spans 2+ AZs)
  |-------------------------|
  v                         v
AZ-a: App instance(s)     AZ-b: App instance(s)
  \                         /
   +----> RDS Multi-AZ <---+   (primary in one AZ, standby in another)
```

### 4.2 Fault tolerance (FT)

1. **What:** The system continues operating **through** failures with little or no interruption.
2. It usually needs more redundancy (and cost) than HA. Example: running at 100% capacity even after losing one AZ by over-provisioning across three AZs.
3. HA = quickly recovers or continues with possible reduced capacity. FT = continues with the required behaviour through the failure.

### 4.3 Resilience

1. Resilience is the ability to **withstand and recover** from failures and disruptions.
2. It combines HA, fault tolerance, DR, observability and tested runbooks.

### 4.4 Key design principles

1. **Remove single points of failure.**
2. **Be stateless** where possible: store sessions in a cache or database, not on one server.
3. **Use health checks and auto-healing.**
4. **Design for failure**: assume any component can fail.
5. **Use managed multi-AZ options** (RDS Multi-AZ, S3, DynamoDB) where suitable.
6. **Test failure** with game days or chaos experiments (for example AWS Fault Injection Service).

### 4.5 HA vs FT vs DR

| Concept | Goal | Typical scope | Example |
| --- | --- | --- | --- |
| High availability | Keep serving with minimal downtime | Within a Region (multi-AZ) | ALB + ASG across 2 AZs |
| Fault tolerance | Continue without interruption through failure | Within a Region, more redundancy | Over-provisioned 3-AZ design |
| Disaster recovery | Recover after major disruption | Often cross-Region | Backups or standby in another Region |

### 4.6 Common mistakes

1. "Two servers = HA" without health checks, load balancer or a resilient database.
2. Capacity not enough after an AZ loss.
3. Single-AZ database or single NAT Gateway.
4. Sticky local state on instances.

### 4.7 Interview pointers

Q10 (HA), Q11 (HA vs FT), Q22 (design a highly available app).

---

## 5. Disaster Recovery

### 5.1 What it is

Disaster recovery (DR) is the plan and the infrastructure to recover after a major disruption, such as a regional outage, accidental deletion, ransomware or data corruption.

### 5.2 Key terms

1. **RPO (Recovery Point Objective):** the maximum acceptable **data loss**, measured in time. RPO of 15 minutes means you can lose at most the last ~15 minutes of data.
2. **RTO (Recovery Time Objective):** the target **time to restore** service. RTO of 1 hour means service should be back within an hour.
3. Lower RPO and RTO cost more.

### 5.3 The four DR strategies

| Strategy | Description | RPO / RTO | Relative cost |
| --- | --- | --- | --- |
| **Backup and restore** | Back up data; rebuild infrastructure and restore on disaster | Hours | Lowest |
| **Pilot light** | Core pieces (for example database replica) always running; the rest is started on disaster | Tens of minutes | Low |
| **Warm standby** | A scaled-down but fully working copy runs all the time; scale up on disaster | Minutes | Medium |
| **Multi-site active/active** | Full workload runs in more than one location serving traffic | Near zero | Highest |

### 5.4 Example

1. Production in Mumbai (`ap-south-1`).
2. Database backups and replicas copied to another Region.
3. Infrastructure defined in Terraform so it can be created in the DR Region.
4. Route 53 health checks and failover records move traffic.
5. A **tested** runbook describes who does what.

### 5.5 Production notes

1. **[MANDATORY]** Back up critical data and **test restores**. An untested backup is not a backup.
2. **[MANDATORY]** Write down RPO and RTO per workload with the business.
3. **[OPTIONAL]** Multi-Region active/active only when the business requires it, because of cost and complexity (data consistency, latency).
4. Keep DR Region CIDRs and quotas ready, and keep AMIs, container images and secrets replicated where needed.

### 5.6 Common mistakes

1. Never testing failover or restore.
2. Backups stored in the same account/Region as production with the same credentials (a compromised account loses both).
3. DR Region quotas too low to scale up.
4. Forgetting dependencies: DNS, certificates, secrets, IAM, third-party endpoints.

### 5.7 Interview pointers

Q12 (RPO and RTO), Q13 (DR strategies), Q23 (choose a DR strategy).

---

## 6. Scalability and Elasticity

### 6.1 Scalability

Scalability is the ability to handle more (or less) load by changing resources.

| Type | What changes | Example | Pros | Limits |
| --- | --- | --- | --- | --- |
| **Vertical** (scale up/down) | Size of one machine | Move from `m5.large` to `m5.2xlarge` | Simple, few app changes | Size limits, restart needed, single point of failure |
| **Horizontal** (scale out/in) | Number of machines | 2 instances to 6 behind a load balancer | HA + capacity, automatable | App must be stateless or share state correctly |

### 6.2 Elasticity

1. Elasticity means capacity **adjusts automatically** to demand, up and down.
2. Scalability = *can* grow. Elasticity = grows and shrinks **automatically** as demand changes.
3. Example: normal traffic uses 2 instances. A sale drives Auto Scaling to 6. After the sale it scales back to 2.

### 6.3 How EC2 Auto Scaling works (step by step)

1. You create a **launch template** (AMI, instance type, security groups, user data).
2. You create an **Auto Scaling group (ASG)** with min, desired and max capacity and subnets across AZs.
3. You attach a **load balancer target group** and enable ELB health checks.
4. You define **scaling policies**: target tracking (for example keep average CPU at 50%), step, scheduled or predictive scaling.
5. CloudWatch metrics trigger scaling actions. The ASG launches or terminates instances and balances across AZs.

### 6.4 Production notes

1. Use **target tracking** policies by default.
2. Set sensible cooldown/warm-up values so the group does not flap.
3. Set the **max** to cap cost.
4. Scale on a metric that reflects load (request count per target, queue depth) not just CPU.
5. Make instances disposable: configuration in AMI or user data, state outside.

### 6.5 Common mistakes

1. Stateful instances behind an ASG.
2. Min = max = 1 and calling it "auto scaling".
3. Slow startup so new instances are not ready when the spike hits.
4. No max limit, causing a bill spike.

### 6.6 Interview pointers

Q14 (vertical vs horizontal), Q15 (scalability vs elasticity).

---

## 7. Shared Responsibility Model

### 7.1 What it is

AWS and the customer share responsibility for security.

- **AWS is responsible for security OF the cloud:** physical data centres, hardware, the global network, and the foundational software that runs the services.
- **The customer is responsible for security IN the cloud:** what you put in the cloud and how you configure it.

### 7.2 Customer responsibilities (typical)

1. IAM users, roles, permissions, MFA.
2. Network configuration: VPC, security groups, NACLs.
3. Guest OS patching on EC2 (and your containers and application dependencies).
4. Application security and secrets management.
5. Data classification, encryption settings and access controls.
6. Logging and monitoring configuration.

### 7.3 It depends on the service

| Service type | Example | AWS manages more of... | You still manage |
| --- | --- | --- | --- |
| Infrastructure (IaaS) | EC2 | Hardware, hypervisor | Guest OS, patches, firewall, app, data |
| Managed service | RDS | OS, DB engine patching (within options), backups tooling | DB users, network access, parameter choices, data, encryption settings |
| Abstracted / serverless | S3, Lambda, DynamoDB | Almost all infrastructure | IAM policies, bucket policies, encryption config, code, data |

### 7.4 Interview examples

1. A public S3 bucket leaking data is the **customer's** configuration responsibility.
2. A failed power supply in an AWS data centre is **AWS's** responsibility.
3. Unpatched OS on an EC2 web server is the **customer's** responsibility.

### 7.5 Interview pointers

Q16 (shared responsibility).

---

## 8. AWS Accounts, Organizations and Landing Zones

### 8.1 AWS account

1. An AWS account is a **security, billing and resource boundary**.
2. Each account has a **root user** (the email used to create it). **[MANDATORY]** Protect the root user with MFA, do not use it for daily work, and do not create access keys for it.
3. Strong isolation comes from separate accounts, not just separate VPCs.

### 8.2 Why use multiple accounts

1. Isolate production from development (blast radius).
2. Separate billing and cost tracking per team or environment.
3. Apply different guardrails and permissions.
4. Centralise security and logging in dedicated accounts.
5. Work within service quotas per account.

### 8.3 AWS Organizations

1. Lets you manage multiple accounts centrally under a **management account**.
2. **Organizational Units (OUs)** group accounts (for example Prod, NonProd, Security).
3. **Service Control Policies (SCPs)** set the maximum permissions for accounts in an OU. SCPs do not grant permissions. They restrict what IAM can allow.
4. **Consolidated billing** combines billing across accounts.

### 8.4 Common multi-account layout

```text
Organization (management account: billing and org only)
 |
 +-- Security OU
 |     +-- Log archive account (CloudTrail, Config, Flow Logs)
 |     +-- Security tooling account (GuardDuty, Security Hub)
 |
 +-- Infrastructure OU
 |     +-- Network account (Transit Gateway, DNS)
 |     +-- Shared services account (CI/CD, artifact registry)
 |
 +-- Workloads OU
       +-- Prod accounts
       +-- Non-prod accounts (dev, test, staging)
```

AWS Control Tower can set up a landing zone with guardrails and a baseline multi-account structure. Verify current features in the documentation.

### 8.5 Common mistakes

1. Everything in one account.
2. Using the root user for daily tasks.
3. Running workloads in the management account.
4. SCP expectations wrong (thinking an SCP grants permissions).

### 8.6 Interview pointers

Q17 (account and Organizations), Q24 (SCP vs IAM policy).

---

## 9. Ways to Access AWS: Console, CLI, SDK, API

| Method | What it is | Example | Typical use |
| --- | --- | --- | --- |
| **Management Console** | Web UI | Create an S3 bucket by clicking | Learning, quick checks |
| **AWS CLI** | Command-line tool | `aws s3 ls` | Scripts, troubleshooting |
| **SDK** | Language libraries | Python `boto3` | Applications and automation |
| **AWS API** | HTTPS endpoints behind everything | Signed requests (SigV4) | Underlies Console, CLI and SDKs |
| **IaC** | Declarative templates | Terraform, CloudFormation, CDK | Repeatable production changes |

Key facts:

1. Console, CLI and SDK all call the **same AWS APIs**.
2. Every API call needs **credentials and permission**, and is recorded in **CloudTrail**.
3. For production, prefer **IaC and pipelines** over clicking in the Console. Manual changes cause **drift**.

### 9.1 Authentication for the CLI

1. **[MANDATORY]** Do not use long-lived access keys when avoidable. Prefer **IAM Identity Center (SSO)** or **IAM roles** with temporary credentials.
2. On EC2, ECS, EKS and Lambda use **roles** attached to the compute, not keys in files.

### 9.2 Interview pointers

Q18 (CLI vs SDK vs API vs IaC).

---

## 10. IAM Basics You Must Know First

### 10.1 What it is

**IAM (Identity and Access Management)** controls **who** (authentication) can do **what** (authorization) on **which** resources.

### 10.2 Core concepts

| Concept | Meaning |
| --- | --- |
| **User** | A person or application identity with long-term credentials (avoid for applications) |
| **Group** | Collection of users sharing permissions |
| **Role** | An identity with permissions that is **assumed** temporarily by a user, service or another account |
| **Policy** | A JSON document that allows or denies actions on resources |
| **Principal** | Who is making the request |
| **MFA** | Multi-factor authentication |

### 10.3 Policy structure

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOneBucket",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::example-bucket",
        "arn:aws:s3:::example-bucket/*"
      ]
    }
  ]
}
```

Explanation:

1. `Effect`: `Allow` or `Deny`.
2. `Action`: the API operations.
3. `Resource`: which resources (ARNs). `example-bucket` is a placeholder.
4. `ListBucket` applies to the bucket ARN, `GetObject` applies to the object ARNs (`/*`). This split is a common source of errors.

### 10.4 How permissions are evaluated (simplified)

1. By default, everything is **denied** (implicit deny).
2. An explicit **Allow** in an applicable policy can grant access.
3. An explicit **Deny** anywhere **always wins**.
4. Other layers can also restrict: SCPs, permission boundaries, session policies and resource policies.

### 10.5 Best practices

1. **[MANDATORY]** Least privilege: grant only what is needed.
2. **[MANDATORY]** MFA for human users, especially privileged ones.
3. **[MANDATORY]** Use roles for workloads, not access keys.
4. Use IAM Access Analyzer to find unintended external access and unused permissions.
5. Rotate or remove unused credentials.

### 10.6 Common mistakes

1. `"Action": "*", "Resource": "*"` on a role.
2. Access keys committed to Git.
3. Missing `Resource` split for bucket vs object actions.
4. Forgetting that a resource policy in another account also needs to allow cross-account access.

### 10.7 Interview pointers

Q19 (IAM role vs user), Q25 (policy evaluation), Q31 (cross-account access).

---

## 11. Infrastructure as Code

### 11.1 What it is

Infrastructure as Code (IaC) means defining infrastructure in files so it can be **created, reviewed, versioned and repeated** consistently.

### 11.2 Tools

| Tool | Type | Notes |
| --- | --- | --- |
| **Terraform** | Declarative, multi-cloud | HCL language, state file, large provider ecosystem |
| **AWS CloudFormation** | Declarative, AWS-native | JSON/YAML templates, stacks, no separate state file to manage |
| **AWS CDK** | Code that generates CloudFormation | TypeScript, Python and others |
| **Ansible** | Configuration management (can also provision) | Procedural-style tasks, agentless |

### 11.3 Declarative vs imperative

1. **Declarative:** you describe the **desired end state** ("I want 3 instances"). The tool works out how to get there. Terraform and CloudFormation are declarative.
2. **Imperative:** you give **steps** ("create instance, then create another"). Shell scripts and CLI commands are imperative.
3. Declarative is safer for repeatable infrastructure because running it twice does not create duplicates.

### 11.4 Benefits

1. Repeatability and consistency across environments.
2. Version control and code review for infrastructure changes.
3. Faster, automated provisioning and recovery.
4. Fewer manual errors.
5. Easier drift detection.

### 11.5 Terraform workflow

```text
write .tf files -> terraform init -> terraform fmt/validate -> terraform plan -> review -> terraform apply
                                                                        |
                                                                state stored in a remote backend (S3 + locking)
```

### 11.6 Production notes

1. **[MANDATORY]** Remote, encrypted state with locking. Restrict access to state (it can contain sensitive values).
2. **[MANDATORY]** Run `plan` in CI and require review before `apply`.
3. Never hard-code secrets in code.
4. Pin provider and module versions.
5. Detect **drift** (differences between code and reality) regularly.

### 11.7 Common mistakes

1. Local state shared via chat or Git.
2. Manual console changes that Terraform later reverts.
3. One giant state for all environments.
4. Applying without reading the plan.

### 11.8 Interview pointers

Q20 (IaC), Q26 (Terraform state and drift).

---

## 12. Core Services Overview: Compute, Storage, Network, Database

This is a map of what you will study next. Details of each service belong in its own notes.

### 12.1 Compute

| Service | Use |
| --- | --- |
| EC2 | Virtual servers with full OS control |
| Auto Scaling | Add/remove EC2 capacity automatically |
| ECS / EKS / Fargate | Containers (Fargate is serverless compute for containers) |
| Lambda | Short event-driven functions |
| Elastic Beanstalk | PaaS for web apps |

### 12.2 Storage

| Service | Type | Key points |
| --- | --- | --- |
| S3 | Object | Virtually unlimited; storage classes; versioning; lifecycle rules; very high durability |
| EBS | Block | One AZ; attaches to EC2; snapshots stored in S3-backed storage |
| EFS | File (NFS) | Shared across instances and AZs |
| Glacier classes | Archive | Cheap, slower retrieval |

### 12.3 Networking

| Service | Use |
| --- | --- |
| VPC | Private network boundary (see the dedicated VPC notes) |
| ELB | Load balancing (ALB for HTTP/HTTPS, NLB for TCP/UDP at high performance) |
| Route 53 | DNS and health-check-based routing |
| CloudFront | CDN |
| Direct Connect / VPN | Hybrid connectivity |

### 12.4 Databases

| Service | Use |
| --- | --- |
| RDS / Aurora | Managed relational databases; Multi-AZ for HA; read replicas for read scaling |
| DynamoDB | Managed NoSQL, single-digit-millisecond performance at scale |
| ElastiCache | In-memory cache (Redis/Valkey, Memcached) |

### 12.5 Multi-AZ vs read replica (frequently confused)

| Feature | Multi-AZ | Read replica |
| --- | --- | --- |
| Purpose | **High availability** / failover | **Read scaling** (and sometimes DR) |
| Replication | Typically synchronous to a standby | Typically asynchronous |
| Serves traffic | Standby does not serve reads (classic Multi-AZ instance deployment) | Serves read traffic |
| Failover | Automatic | Manual promotion (generally) |

Details vary by engine and deployment option (for example Aurora and Multi-AZ DB clusters). Verify in the RDS documentation.

### 12.6 Interview pointers

Q4, Q27 (EBS vs S3 vs EFS).

---

## 13. Monitoring, Logging and Governance Basics

| Service | What it does | Typical question |
| --- | --- | --- |
| **CloudWatch** | Metrics, logs, alarms, dashboards | "How do you alert on high CPU?" |
| **CloudTrail** | Records AWS **API calls** (who did what, when) | "Who deleted this security group?" |
| **AWS Config** | Tracks resource configuration changes and compliance rules | "Which security groups allow 0.0.0.0/0 on port 22?" |
| **Systems Manager (SSM)** | Session Manager, Patch Manager, Parameter Store | "How do you access instances without SSH?" |
| **Trusted Advisor** | Best-practice checks | "Any cost or security recommendations?" |
| **GuardDuty** | Threat detection | "Is there suspicious activity?" |
| **Security Hub** | Aggregates security findings | "What is our posture?" |
| **AWS Health** | Service events affecting your account | "Is AWS having an issue?" |

Key distinctions:

1. **CloudWatch = what is happening in my systems** (metrics, logs).
2. **CloudTrail = who did what through the AWS API** (audit).
3. **Config = what does my configuration look like, and has it changed or become non-compliant?**

### 13.1 Common mistakes

1. CloudTrail not enabled in all Regions or not protected from deletion.
2. Alarms without an action or owner.
3. Logs kept forever without lifecycle rules.

### 13.2 Interview pointers

Q21 (CloudWatch vs CloudTrail vs Config).

---

## 14. Pricing, Billing and Cost Basics

### 14.1 Pricing principles

1. **Pay as you go:** pay for what you use.
2. **Pay less when you reserve:** Savings Plans and Reserved Instances give discounts for a usage commitment.
3. **Pay less at scale:** volume pricing for some services.
4. **Spot Instances:** large discounts for interruptible capacity.
5. Data transfer **into** AWS is generally free. Transfer **out**, across Regions and sometimes across AZs is charged. Verify current rates.

### 14.2 EC2 purchase options

| Option | Best for | Trade-off |
| --- | --- | --- |
| On-Demand | Unpredictable, short-term | Highest hourly price |
| Savings Plans / Reserved | Steady baseline usage | Commitment |
| Spot | Fault-tolerant, flexible jobs (CI runners, batch, stateless workers) | Can be interrupted with short notice |
| Dedicated Hosts/Instances | Licence or compliance needs | Cost |

### 14.3 Cost tools

1. **Cost Explorer**, **Budgets**, **Cost and Usage Report**, **Cost Anomaly Detection**.
2. **Tags** (for example `team`, `env`, `owner`) activated as cost allocation tags.

### 14.4 Common cost surprises

1. NAT Gateway data processing.
2. Idle resources (unattached EBS volumes, old snapshots, idle load balancers, unused Elastic IPs and public IPv4 addresses).
3. Cross-AZ and cross-Region data transfer.
4. Over-provisioned instances.
5. Log retention with no expiry.

### 14.5 Interview pointers

Q28 (cost optimisation).

---
## 15. Hands-On: Commands and Terraform

### 15.1 AWS CLI: first steps and safe checks

Prerequisites: AWS CLI v2 installed. Authenticate with **IAM Identity Center (SSO)** or an assumed role. Avoid long-lived keys. Replace placeholders such as the profile name and Region.

```bash
# 1. Configure SSO (interactive; stores a profile, no static keys)
aws configure sso --profile demo

# 2. Log in when the session expires
aws sso login --profile demo

# 3. WHO AM I? Always run this before changing anything.
aws sts get-caller-identity --profile demo
```

Expected output (example, with placeholder values):

```json
{
    "UserId": "AROAEXAMPLEID:session-name",
    "Account": "123456789012",
    "Arn": "arn:aws:sts::123456789012:assumed-role/ExampleRole/session-name"
}
```

Why it matters: it shows the **account and role** you are about to act as. Many production mistakes come from running a command in the wrong account.

```bash
export AWS_PROFILE=demo
export AWS_REGION=ap-south-1          # placeholder Region

# Regions enabled for this account
aws ec2 describe-regions --query 'Regions[].RegionName' --output text

# AZ names and AZ IDs in this Region (use AZ IDs across accounts)
aws ec2 describe-availability-zones \
  --query 'AvailabilityZones[].{Name:ZoneName,Id:ZoneId,State:State}' --output table

# Running instances (read-only)
aws ec2 describe-instances \
  --filters Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].{Id:InstanceId,Type:InstanceType,AZ:Placement.AvailabilityZone,Name:Tags[?Key==`Name`]|[0].Value}' \
  --output table

# S3 buckets in the account
aws s3 ls

# Who changed things recently? (CloudTrail, last 10 events of one type)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteSecurityGroup \
  --max-items 10

# Simulate whether a role can do an action (does not change anything)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/ExampleRole \
  --action-names s3:GetObject \
  --resource-arns arn:aws:s3:::example-bucket/file.txt
```

Tips:

1. `--query` uses JMESPath to filter the JSON output. `--output table` is easier to read.
2. Use `--dry-run` where supported (for example `aws ec2 run-instances --dry-run`) to check permissions without creating anything.
3. Add `--debug` when a call fails mysteriously (look for the credentials source and endpoint). Do not paste debug output publicly because it can reveal sensitive values.

### 15.2 Credential problems: how to debug

```bash
aws configure list                    # which profile, credentials source and Region are in use
env | grep -i '^AWS_'                 # environment variables can override your profile (check for stale keys)
aws sts get-caller-identity           # confirms what AWS actually sees
```

Credential lookup order (simplified, verify in the CLI docs): command-line options, environment variables, assume-role/SSO/web identity settings in profiles, shared credentials file, container credentials (ECS/EKS), and the EC2 instance profile. A stale `AWS_ACCESS_KEY_ID` in the environment can silently override your SSO profile.

### 15.3 Python (boto3) example with error handling

```python
#!/usr/bin/env python3
"""List S3 buckets and flag any without default encryption or full public-access blocking.
Read-only. Uses the default credential chain (SSO profile, role, etc.)."""
import logging
import sys

import boto3
from botocore.exceptions import ClientError

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("bucket-audit")


def main() -> int:
    s3 = boto3.client("s3")
    try:
        buckets = [b["Name"] for b in s3.list_buckets()["Buckets"]]
    except ClientError as exc:
        log.error("Cannot list buckets: %s", exc.response["Error"]["Code"])
        return 1

    for name in buckets:
        # 1) Is default encryption configured?
        try:
            s3.get_bucket_encryption(Bucket=name)
            encrypted = True
        except ClientError as exc:
            code = exc.response["Error"]["Code"]
            encrypted = False if code == "ServerSideEncryptionConfigurationNotFoundError" else None
            if encrypted is None:
                log.warning("%s: encryption check failed (%s)", name, code)

        # 2) Are all four public-access blocks enabled?
        try:
            cfg = s3.get_public_access_block(Bucket=name)["PublicAccessBlockConfiguration"]
            fully_blocked = all(cfg.values())
        except ClientError as exc:
            fully_blocked = False
            if exc.response["Error"]["Code"] != "NoSuchPublicAccessBlockConfiguration":
                log.warning("%s: public-access check failed", name)

        if encrypted is False or not fully_blocked:
            log.warning("REVIEW %s encrypted=%s public_access_fully_blocked=%s", name, encrypted, fully_blocked)
        else:
            log.info("OK     %s", name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

What it does and why: it uses the standard credential chain (no keys in code), handles `ClientError` per bucket so one failure does not stop the audit, and only reads configuration. Use it as a pattern for governance scripts. Newer buckets have default encryption (SSE-S3) enabled by AWS, so a "not found" result may be uncommon. Verify current S3 defaults in the documentation.

### 15.4 Terraform: a minimal, safe starter (S3 bucket + remote-state-ready layout)

**Assumptions:** Terraform `>= 1.5`, AWS provider `~> 5.0` (verify current versions). This is a **learning example** that is close to production practice for a private bucket.

**Folder structure**

```text
aws-basics/
├── versions.tf
├── variables.tf
├── main.tf
└── outputs.tf
```

**`versions.tf`**

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Production: add a remote backend, for example:
  # backend "s3" {
  #   bucket       = "<your-state-bucket>"      # placeholder
  #   key          = "aws-basics/terraform.tfstate"
  #   region       = "ap-south-1"
  #   encrypt      = true
  #   use_lockfile = true                       # S3 native locking in recent versions; verify for your Terraform version
  # }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      project = var.project
      env     = var.env
      owner   = var.owner
    }
  }
}
```

**`variables.tf`**

```hcl
variable "region" {
  type    = string
  default = "ap-south-1" # placeholder
}

variable "project" { type = string }
variable "env"     { type = string }
variable "owner"   { type = string }

variable "bucket_name" {
  type        = string
  description = "Globally unique bucket name"
}
```

**`main.tf`**

```hcl
resource "aws_s3_bucket" "artifacts" {
  bucket = var.bucket_name
}

# Block every form of public access
resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Keep object history (protects against accidental overwrite/delete)
resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypt at rest with S3-managed keys (use a KMS key if policy requires it)
resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Expire old versions to control cost
resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"
    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# Deny any request that is not over TLS
data "aws_iam_policy_document" "tls_only" {
  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.artifacts.arn,
      "${aws_s3_bucket.artifacts.arn}/*",
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "tls_only" {
  bucket = aws_s3_bucket.artifacts.id
  policy = data.aws_iam_policy_document.tls_only.json

  depends_on = [aws_s3_bucket_public_access_block.artifacts]
}
```

**`outputs.tf`**

```hcl
output "bucket_arn" {
  value = aws_s3_bucket.artifacts.arn
}
```

**Run it**

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -var 'project=demo' -var 'env=dev' -var 'owner=platform-team' \
               -var 'bucket_name=<globally-unique-name>' -out=tfplan
terraform apply tfplan
```

**Expected result:** one private, versioned, encrypted bucket with a lifecycle rule and a TLS-only policy.

| Block | Why it exists |
| --- | --- |
| `default_tags` | Every resource gets owner/env tags for cost and governance |
| Public access block | Prevents accidental public exposure (a shared-responsibility item) |
| Versioning + lifecycle | Recoverability without unlimited cost growth |
| TLS-only policy | Enforces encryption in transit |
| Remote backend (commented) | Needed for team use, locking and safe state |

Clean up when practising: `terraform destroy` (a versioned bucket must be emptied of all versions first).

### 15.5 Linux and general checks on an EC2 instance

```bash
# Instance metadata (IMDSv2: token first). Shows which AZ and role the instance has.
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/   # role name only
```

**[MANDATORY]** Require **IMDSv2** on instances (it protects against SSRF-based credential theft). Never print the credentials returned by the metadata service into logs.

---

## 16. Production Troubleshooting Scenarios

Each scenario follows: **Problem → Symptoms/impact → Possible causes → Investigation → Procedure → Root cause → Resolution → Prevention → How to explain it in an interview.**

### Beginner scenarios

#### A1. `AccessDenied` from the CLI although "I have admin"

1. **Problem:** `aws s3 ls` or an EC2 call returns `AccessDenied` or `UnauthorizedOperation`.
2. **Symptoms and impact:** Pipeline or engineer blocked.
3. **Possible causes:** Wrong account or role (stale environment variables), SCP or permission boundary blocking, missing resource policy, session expired, wrong Region, explicit Deny.
4. **Tools:** `aws sts get-caller-identity`, `aws configure list`, `env | grep AWS_`, IAM policy simulator, CloudTrail event for the failed call (the error message often names the denying policy type).
5. **Procedure:**
   1. Run `sts get-caller-identity`. Is it the account and role you expected?
   2. Check for environment variables overriding your profile.
   3. Read the error text: "explicit deny", "no identity-based policy allows" and "with an explicit deny in a service control policy" point to different layers.
   4. Use the policy simulator or review attached policies, boundaries and SCPs.
6. **Root cause (typical):** An old `AWS_ACCESS_KEY_ID` in the shell environment overrode the SSO profile and pointed to a limited identity.
7. **Resolution:** Unset the variables, log in with SSO and retest.
8. **Prevention:** Use SSO and roles, avoid static keys in shells, and teach `sts get-caller-identity` as a first step.
9. **Interview explanation:** "I verified who I was authenticating as before debugging permissions. The issue was the credential source, not the policy."

#### A2. Resource "missing" in the console

1. **Problem:** An EC2 instance or bucket you created is not visible.
2. **Possible causes:** Wrong Region selected, wrong account or role, filtering, resource deleted, different AZ/Region.
3. **Procedure:** Check the Region selector, run the equivalent CLI command per Region, and check CloudTrail for create/delete events.
4. **Root cause (typical):** The console was set to a different Region.
5. **Prevention:** Set a default Region in the CLI profile, use tags, and use Resource Explorer or AWS Config aggregated views.
6. **Interview explanation:** "Most AWS resources are Regional. I checked Region and account first, then CloudTrail."

#### A3. Unexpected AWS bill

1. **Problem:** Monthly bill is far above forecast.
2. **Possible causes:** Forgotten instances or load balancers, NAT Gateway data, large data transfer, snapshots, logs, a compromised credential mining crypto.
3. **Tools:** Cost Explorer (group by service, Region, usage type, tag), Budgets, Cost Anomaly Detection, CloudTrail.
4. **Procedure:**
   1. Group cost by service, then by usage type, then by Region and account.
   2. Look for Regions you do not use (sign of credential compromise).
   3. Identify resource owners with tags.
   4. Stop or remove waste. If compromise is suspected, rotate credentials and engage the security team immediately.
5. **Root cause (typical):** Large NAT Gateway data processing from container image pulls.
6. **Resolution:** Add VPC endpoints for S3 and ECR, set lifecycle policies, and clean up idle resources.
7. **Prevention:** Budgets and anomaly alerts, mandatory tags, scheduled shutdown for non-prod, SCP to deny unused Regions.
8. **Interview explanation:** "I narrowed the spike from service to usage type to resource, found the driver, fixed it, and added budgets and tagging so it is caught early."

### Intermediate scenarios

#### B1. Application down after an AZ problem

1. **Problem:** One AZ is degraded and the service has errors.
2. **Symptoms and impact:** Partial or full outage, depending on design.
3. **Possible causes:** All instances or the database in one AZ, load balancer with only one AZ enabled, insufficient remaining capacity, cross-AZ dependency such as a single NAT Gateway.
4. **Tools:** ELB target health, CloudWatch metrics per AZ, ASG activity history, AWS Health dashboard.
5. **Procedure:**
   1. Check the AWS Health dashboard and your target health per AZ.
   2. Confirm the ASG spans multiple AZs and is launching in healthy AZs.
   3. Check remaining capacity and the database (failover state).
   4. If needed, shift traffic away from the impaired AZ (for example, deregister targets or use zonal shift where available; verify current feature support).
6. **Root cause (typical):** The ASG was configured with subnets in a single AZ.
7. **Resolution:** Add subnets in other AZs and increase desired capacity.
8. **Prevention:** Multi-AZ by default in modules, capacity planning for N-1 AZs, game days.
9. **Interview explanation:** "Multi-AZ is only real if every layer is multi-AZ and the remaining AZs have capacity. I verified every tier and fixed the gap."

#### B2. Terraform drift: someone changed a security group in the console

1. **Problem:** `terraform plan` shows unexpected changes, or an emergency console change disappears after the next apply.
2. **Procedure:**
   1. Run `terraform plan` and read each diff.
   2. Check CloudTrail to see who changed what and why.
   3. Decide whether the console change was needed. If yes, put it in code. If no, apply to revert.
3. **Resolution:** Update code to match the approved state, apply and communicate.
4. **Prevention:** Restrict console write access in production, use break-glass roles with logging, and run drift detection on a schedule.
5. **Interview explanation:** "Code is the source of truth. I used CloudTrail to understand the change, reconciled it through a reviewed pull request, and reduced manual change access."

#### B3. EC2 instance cannot reach an AWS API (timeout)

1. **Problem:** Instance in a private subnet times out calling an AWS service.
2. **Possible causes:** No NAT Gateway or VPC endpoint, route table missing, security group egress, DNS issue, proxy settings.
3. **Procedure:** `curl -v` the service endpoint, `dig`, check the subnet route table and endpoint (see the VPC notes), check the instance role permissions separately from the network.
4. **Root cause (typical):** Private subnet had no NAT route and no endpoint for the service.
5. **Resolution:** Add a VPC endpoint (or NAT route if internet egress is acceptable).
6. **Prevention:** Standard VPC module with endpoints.
7. **Interview explanation:** "Timeout means network path, `AccessDenied` means identity. I separated the two and fixed the network path."

### Advanced scenarios

#### C1. Suspected credential leak (access key committed to Git)

1. **Problem:** A GitHub scan or AWS notification says an access key is exposed.
2. **Impact:** Possible unauthorised access, crypto mining, data exfiltration.
3. **Procedure (act fast, in this order):**
   1. **Deactivate** the key immediately (do not just delete, so you can audit its use first). Then rotate or replace with role-based access.
   2. Review **CloudTrail** for everything that key did, across all Regions.
   3. Check for new IAM users/roles/keys, new instances, changed policies, new Regions in use.
   4. Contain: revoke sessions (for roles, attach a deny-before-time policy to invalidate older sessions), isolate resources.
   5. Remove the secret from Git history and treat it as compromised forever.
   6. Notify the security team and follow the incident process.
4. **Root cause (typical):** Long-lived key stored in code.
5. **Prevention:** Roles and SSO instead of keys, pre-commit and CI secret scanning, GuardDuty, SCPs, short-lived credentials, Secrets Manager.
6. **Interview explanation:** "Contain first, investigate with CloudTrail, then eradicate and prevent. The permanent fix was removing static keys from the workflow."

#### C2. Regional outage and DR failover

1. **Problem:** The primary Region has a major service disruption.
2. **Procedure:**
   1. Confirm scope using the AWS Health dashboard and your own monitoring. Declare an incident.
   2. Compare the situation with RPO and RTO. Decide on failover with business stakeholders.
   3. Execute the runbook: promote the database replica, scale up the DR environment, update DNS (Route 53 failover/weighted), verify the application.
   4. Monitor, communicate status, then plan failback.
3. **Common problems:** Quotas too low in the DR Region, replication lag greater than RPO, missing secrets or certificates, DNS TTL too high, untested runbook.
4. **Prevention:** Regular DR tests, infrastructure in code, quota checks, replicated secrets and images.
5. **Interview explanation:** "A DR plan is judged by tested RPO and RTO. I'd describe the runbook, the decision point and what we practise."

#### C3. Cross-account access fails

1. **Problem:** A role in Account A cannot read an S3 bucket in Account B.
2. **Causes:** Missing resource policy on the bucket, missing identity policy in Account A, an SCP blocking, KMS key policy not allowing the principal, wrong trust policy on an assumed role, external ID mismatch.
3. **Procedure:** For cross-account access **both sides must allow** it (identity policy in A and resource policy in B, or an assumable role in B with a trust policy for A). If KMS encrypts the data, the key policy must allow it too. Read the exact denial message and check CloudTrail in both accounts.
4. **Resolution:** Fix the missing side.
5. **Prevention:** Centralised, reviewed cross-account patterns, IAM Access Analyzer.
6. **Interview explanation:** "I check identity policy, resource policy or trust policy, SCPs, and KMS. The answer is nearly always one missing layer."

---

## 17. Security, Reliability and Best Practices

### 17.1 Mandatory controls vs optional design choices

| Area | **Mandatory** | Optional (depends on need and cost) |
| --- | --- | --- |
| Root user | MFA, no access keys, locked away, only for tasks that require it | Hardware MFA key |
| Human access | SSO / federation with MFA, least privilege | Just-in-time elevation tooling |
| Workload access | IAM roles, no static keys | Permission boundaries |
| Multi-account | Separate prod from non-prod | Many fine-grained accounts, Control Tower |
| Logging | CloudTrail (all Regions) to a protected bucket | Organization trail with log-file validation, CloudTrail Lake |
| Data protection | Encryption at rest and in transit, S3 public access blocked by default | Customer-managed KMS keys, Object Lock |
| Network | Private subnets for workloads and databases, least-privilege SGs | Central inspection firewall |
| Patching | Patch process for EC2 and container images | Immutable infrastructure with automatic AMI rebuilds |
| Resilience | Multi-AZ for production; tested backups | Multi-Region active/active |
| IaC | Code review and remote locked state | Policy as code (OPA, Checkov, Config) |
| Cost | Budgets and tagging | Savings Plans, Spot |

### 17.2 Least privilege and secrets

1. Start with no access and add what is needed. Use IAM Access Analyzer to generate policies from observed activity and to find unused access.
2. Never store secrets in code, AMIs, user data, tags or Terraform variable files. Use **Secrets Manager** or **SSM Parameter Store** (SecureString), and fetch them at runtime with a role.
3. Enable rotation for database credentials where supported.
4. Encrypt with **KMS** and control key access in key policies.

### 17.3 Network and access controls

1. Security groups with least privilege, no `0.0.0.0/0` for SSH/RDP/database ports.
2. Use **Session Manager** instead of opening SSH.
3. Put workloads in private subnets, use endpoints for AWS service traffic.
4. Use WAF and Shield on public entry points.
5. Enforce **IMDSv2** on EC2.

### 17.4 High availability and DR

1. Multi-AZ at every tier (load balancer, compute, database, NAT).
2. Health checks and auto-healing (Auto Scaling, ELB health checks).
3. Backups with retention, cross-account/Region copies for critical data, **restore tests**.
4. Infrastructure in code so it can be rebuilt.
5. Define RPO and RTO per workload and choose the DR strategy to match.

### 17.5 Monitoring, logging and alerting

1. CloudWatch alarms on the golden signals: latency, traffic, errors, saturation.
2. Centralised logs with retention rules.
3. CloudTrail plus alerts on high-risk events (root login, IAM policy changes, security group changes, disabled logging).
4. AWS Config rules and Security Hub for compliance posture.
5. Every alarm has an owner and a runbook link.

### 17.6 Scalability and performance

1. Stateless services with Auto Scaling and target-tracking policies.
2. Cache with CloudFront and ElastiCache where suitable.
3. Use queues (SQS) to absorb spikes.
4. Know your **service quotas** and request increases before you need them.

### 17.7 Cost optimisation

1. Right-size instances using usage data (Compute Optimizer).
2. Savings Plans for steady load, Spot for flexible workloads.
3. Delete idle resources, expire old snapshots and logs.
4. Use S3 lifecycle policies and the right storage class.
5. Reduce data transfer: keep traffic AZ-local, use endpoints and CloudFront.
6. Tag everything and review spend regularly.

### 17.8 Backup, recovery and rollback

1. Use AWS Backup or native snapshots, with tested restores and defined retention.
2. Version S3 buckets, and protect critical data with MFA delete or Object Lock where appropriate.
3. Deploy with strategies that allow quick **rollback** (blue/green, canary, versioned artifacts).
4. Keep IaC versioned so infrastructure can be reverted by reverting code (note that stateful resources need care).

### 17.9 Compliance considerations

1. Frameworks such as PCI DSS, HIPAA, ISO 27001 and SOC 2 need evidence: access logs, change history, encryption settings, network segmentation.
2. Use **AWS Artifact** to obtain AWS compliance reports. Compliance of **your** workload is still your responsibility (shared responsibility model).
3. Use data-residency controls (Region selection, SCPs that deny other Regions) where required.
4. These notes are not compliance advice. Verify the requirements of your applicable standard.

---

## 18. Comparison Tables

### 18.1 Region vs Availability Zone vs Edge location vs Local Zone

| Feature | Region | AZ | Edge location | Local Zone |
| --- | --- | --- | --- | --- |
| What | Geographical area | Isolated location in a Region | Cache/entry point near users | Metro extension of a Region |
| Used for | Placement, DR, compliance | High availability | CDN, DNS, edge security | Low latency in a city |
| You deploy compute there? | Yes (in its AZs) | Yes | No (service-managed) | Yes, selected services |
| Example | `ap-south-1` | `aps1-az1` | CloudFront POP | Metro-specific zone |

### 18.2 High availability vs fault tolerance vs disaster recovery

See section 4.5.

### 18.3 Vertical vs horizontal scaling

See section 6.1.

### 18.4 IaaS vs PaaS vs SaaS

See section 1.4.

### 18.5 IAM user vs group vs role

| Feature | User | Group | Role |
| --- | --- | --- | --- |
| Represents | One identity | Collection of users | Assumable identity |
| Credentials | Long-term (password, keys) | None | **Temporary** via STS |
| Can be assumed by services | No | No | Yes |
| Best use | Rarely (prefer SSO) | Organising human permissions | Workloads, cross-account, federation |

### 18.6 Identity-based vs resource-based policy

| Feature | Identity-based policy | Resource-based policy |
| --- | --- | --- |
| Attached to | User, group, role | Resource (S3 bucket, SQS queue, KMS key, role trust) |
| Has `Principal` element | No (the attached identity is the principal) | Yes |
| Cross-account | Needs the other side to allow too | Can grant a principal in another account directly (some services need both sides) |

### 18.7 CloudWatch vs CloudTrail vs Config

| Service | Answers | Data |
| --- | --- | --- |
| CloudWatch | How is it performing? | Metrics, logs, alarms |
| CloudTrail | Who did what via the API? | API event history |
| Config | What is the configuration and is it compliant? | Resource configuration history and rules |

### 18.8 EBS vs S3 vs EFS

| Feature | EBS | S3 | EFS |
| --- | --- | --- | --- |
| Type | Block | Object | File (NFS) |
| Attach to | One EC2 instance (typical; multi-attach for some types) | Accessed via API/URL | Many instances/containers |
| Scope | One AZ | Regional | Regional (multi-AZ) |
| Use | Boot disks, databases | Artifacts, backups, static assets, data lakes | Shared files, CMS content |

### 18.9 EC2 purchase options

See section 14.2.

### 18.10 Backup and restore vs pilot light vs warm standby vs active/active

See section 5.3.

### 18.11 Common interview traps

| Trap | Correct answer |
| --- | --- |
| "Two AZs protect against a Region outage." | No. Use multi-Region DR for regional failure. |
| "Multi-AZ guarantees zero downtime." | It reduces risk. The app must handle failover and capacity must remain. |
| "AWS secures everything." | AWS secures the cloud. You secure what you put **in** it. |
| "Region and AZ are the same idea at different sizes." | Different failure domains with different purposes. |
| "`ap-south-1a` is the same AZ in every account." | Names are mapped per account. Use AZ IDs. |
| "Scalability and elasticity are identical." | Elasticity is automatic adjustment up **and down**. |
| "An SCP grants permissions." | It only restricts the maximum. |
| "Explicit Allow beats Deny." | Explicit Deny always wins. |
| "Backups = disaster recovery." | Backups are one input. DR also needs infrastructure, runbooks and tested RPO/RTO. |
| "Read replicas give automatic failover." | Multi-AZ is for failover. Replicas are for read scaling (details vary by engine). |
| "Console clicks are fine for production." | Use IaC and review. Manual changes cause drift. |
| "CloudTrail shows CPU usage." | That is CloudWatch. CloudTrail records API calls. |

---

## 19. Enterprise Reference Architecture

### 19.1 A standard multi-account, multi-AZ web platform

```text
                           Users
                             |
                        Route 53 (DNS)
                             |
                    CloudFront + AWS WAF  (edge locations)
                             |
 +--------------------------- Region ap-south-1 -----------------------------+
 |  Workload account (prod)                                                   |
 |   VPC                                                                      |
 |    Public subnets  (AZ-a, AZ-b)  : ALB, NAT Gateways                       |
 |    Private subnets (AZ-a, AZ-b)  : EC2 Auto Scaling / EKS nodes            |
 |    Isolated subnets(AZ-a, AZ-b)  : RDS Multi-AZ                            |
 |    VPC endpoints                 : S3, ECR, STS, Logs, SSM                 |
 |   S3 (artifacts, backups)  IAM roles  KMS keys  Secrets Manager            |
 +----------------------------------------------------------------------------+
        |                    |                       |
   CloudWatch           CloudTrail / Config      Backups (cross-Region copy)
   (workload acct)      -> Log archive account   -> DR Region (pilot light/warm standby)
```

### 19.2 Request flow

1. User resolves the domain through Route 53.
2. Request hits CloudFront (cached content served at the edge) and AWS WAF filters bad requests.
3. Origin request goes to the ALB in public subnets.
4. ALB forwards to healthy targets in private subnets across AZs.
5. The application reads or writes RDS (Multi-AZ) and S3, using IAM roles and secrets fetched at runtime.
6. Logs and metrics go to CloudWatch. API activity goes to CloudTrail in a central log archive account.

### 19.3 CI/CD integration

```text
Git push -> CI (build, test, scan) -> image to ECR / artifact to S3
         -> CD (Terraform plan/apply for infra; deploy to ASG or EKS)
         -> health checks -> automatic rollback on failure
CI/CD uses an IAM role via OIDC federation (no stored AWS keys).
```

### 19.4 Design decisions to explain in interviews

1. **Why multiple accounts?** Blast radius, billing, guardrails.
2. **Why private subnets?** Reduce exposure. Only the load balancer is public.
3. **Why roles and OIDC?** No long-lived keys to leak.
4. **Why Multi-AZ and what is the DR level?** HA inside the Region, DR tier chosen by RPO/RTO.
5. **What is the cost trade-off?** Per-AZ NAT, Multi-AZ database and idle DR resources cost more, so tier them by business criticality.

---
## 20. Interview Questions and Answers

> Answer pattern: **definition → how it works → trade-off or example → follow-up**. Follow-up questions a senior interviewer may ask are shown as **Follow-up**.

### 20.1 Basic concepts

#### Q1. What is cloud computing and why do companies use it?

1. Cloud computing is on-demand access to computing resources (servers, storage, databases, networking) over the internet with pay-as-you-go pricing.
2. Companies use it for speed (minutes to provision), elasticity, global reach, lower upfront cost and managed services.
3. Example: instead of buying servers for a peak sale, you scale EC2 up for the sale and back down afterwards.
4. **Follow-up:** "Is the cloud always cheaper?" No. Poorly managed cloud spend can exceed on-premises cost. Savings come from right-sizing, elasticity, managed services and removing idle resources.

#### Q2. Explain IaaS, PaaS and SaaS with AWS examples.

1. **IaaS:** you get virtual infrastructure and manage OS and above. Example: EC2.
2. **PaaS:** you deploy code or data and the platform manages OS and runtime. Examples: Elastic Beanstalk, RDS.
3. **SaaS:** finished software you just use, for example Amazon WorkSpaces.
4. Rule: the more "as a service", the less you manage and the less low-level control you have.
5. **Follow-up:** "Where does Lambda fit?" Serverless / FaaS: you manage only code and configuration.

#### Q3. What is AWS and how are its services grouped?

1. AWS (Amazon Web Services) is a cloud platform offering services on demand.
2. Main categories: compute, storage, networking, databases, security and identity, management and monitoring, developer tools, analytics, machine learning, containers and serverless.
3. A DevOps engineer mostly works with EC2/EKS, VPC, IAM, S3, ELB, Auto Scaling, RDS, CloudWatch, CloudTrail and IaC tools.

#### Q4. Which AWS service would you use for each of these: virtual server, object storage, private network, permissions, DNS, monitoring, container registry?

1. Virtual server: EC2.
2. Object storage: S3.
3. Private network: VPC.
4. Permissions: IAM.
5. DNS: Route 53.
6. Monitoring: CloudWatch (and CloudTrail for API audit).
7. Container registry: ECR.

#### Q5. What is an AWS Region?

1. A Region is a separate geographical area with multiple AZs, for example `ap-south-1` (Mumbai).
2. Regions are independent: resources are not replicated automatically across them.
3. Service availability and pricing differ by Region.
4. Interview line: "A Region is a geographical location containing multiple isolated Availability Zones."

#### Q6. What is an Availability Zone?

1. An AZ is one or more data centres in a Region with independent power, cooling and networking.
2. AZs in a Region are connected by low-latency private links, yet isolated from each other's failures.
3. Deploying across AZs protects against an AZ-level failure, but does not guarantee zero downtime.
4. **Follow-up:** "Is `ap-south-1a` the same in every account?" No. AZ names are mapped per account. Use AZ IDs.

#### Q7. What is the difference between a Region and an AZ?

1. Region = geographical area. AZ = isolated location inside a Region.
2. Region protects against regional disasters (needs multi-Region design). AZ protects against local failures (multi-AZ design).
3. Latency between AZs is low, while between Regions it is higher.
4. Data does not leave a Region unless you configure it to, which matters for compliance.

#### Q8. What is an edge location and what is it used for?

1. A site used by CloudFront and other edge services to cache and serve content near users.
2. It reduces latency and origin load.
3. Edge locations are not places where you run your own EC2 instances. (Local Zones are.)

#### Q9. How do you choose an AWS Region?

1. **Latency** to users.
2. **Compliance and data residency.**
3. **Service availability** (some services or features are not in all Regions).
4. **Cost** (prices differ by Region).
5. DR pairing: pick a second Region that also meets compliance needs.

#### Q10. What is high availability and how do you achieve it on AWS?

1. HA means the system keeps serving requests despite component failures.
2. Use multiple AZs, a load balancer with health checks, Auto Scaling, managed multi-AZ databases and stateless application design.
3. Remove single points of failure: single NAT Gateway, single-AZ database, single instance.
4. Test failures. HA you have not tested is an assumption.

#### Q11. What is the difference between high availability and fault tolerance?

1. HA minimises downtime and recovers quickly, often with brief disruption or reduced capacity.
2. Fault tolerance continues operating through failures with no or negligible interruption, which costs more because of extra redundancy.
3. Example: two instances across two AZs behind an ALB is HA. Running enough spare capacity across three AZs so that losing one AZ changes nothing is closer to fault tolerance.

#### Q12. What are RPO and RTO?

1. **RPO** (Recovery Point Objective): maximum acceptable data loss measured in time.
2. **RTO** (Recovery Time Objective): maximum acceptable time to restore service.
3. Example: RPO 15 minutes means backups or replication must make loss at most ~15 minutes. RTO 1 hour means service back within an hour.
4. They drive the DR strategy and its cost.
5. **Follow-up:** "How do you reduce RPO?" More frequent backups, continuous replication, cross-Region replicas.

#### Q13. Explain the four DR strategies.

1. **Backup and restore:** cheapest, slowest (hours).
2. **Pilot light:** core data and minimal infrastructure always on, scale up on disaster.
3. **Warm standby:** scaled-down full environment running, scale up on disaster.
4. **Multi-site active/active:** full capacity in multiple locations, near-zero RTO/RPO, highest cost and complexity.
5. Choose by RPO/RTO and budget.

#### Q14. What is the difference between vertical and horizontal scaling?

1. Vertical: bigger machine (more CPU/RAM). Simple, but has limits, may need downtime and is a single point of failure.
2. Horizontal: more machines behind a load balancer. Scales further and improves availability, but needs stateless design.
3. Cloud-native designs prefer horizontal scaling.

#### Q15. What is the difference between scalability and elasticity?

1. Scalability: the ability to handle growth by adding resources.
2. Elasticity: resources automatically scale out **and in** with demand.
3. Example: Auto Scaling from 2 to 6 instances during peak and back to 2 afterwards.

#### Q16. Explain the Shared Responsibility Model.

1. AWS is responsible for security **of** the cloud: facilities, hardware, global network, managed service infrastructure.
2. Customer is responsible for security **in** the cloud: IAM, network configuration, OS patching on EC2, application security, data and encryption choices.
3. The split depends on the service. On EC2 you patch the guest OS. On RDS AWS handles more, but you still manage access, network exposure and data.
4. Example: a public S3 bucket exposing data is the customer's responsibility.

#### Q17. What is an AWS account, and why use AWS Organizations?

1. An account is a security, billing and resource boundary.
2. Organizations manages many accounts: OUs, consolidated billing and SCPs.
3. Multiple accounts limit blast radius and let you apply different guardrails to prod and non-prod.
4. **Follow-up:** "Why not use one account with many VPCs?" Accounts give stronger IAM and billing isolation and separate service quotas.

#### Q18. What is the difference between the AWS Console, CLI, SDK, API and IaC?

1. All of them ultimately call AWS APIs.
2. Console: web UI for learning and quick checks. CLI: scripts and troubleshooting. SDK: applications (for example boto3). IaC: repeatable, reviewed infrastructure changes.
3. In production, prefer IaC and pipelines to avoid drift and keep an audit trail.

#### Q19. What is the difference between an IAM user and an IAM role?

1. A user has long-term credentials (password, access keys). A role has no long-term credentials and is **assumed** to get temporary credentials from STS.
2. Use roles for EC2, ECS, EKS, Lambda, cross-account access and CI/CD (via OIDC). Use SSO/federation for humans.
3. Roles reduce the risk of leaked keys because credentials expire.

### 20.2 Intermediate concepts

#### Q20. What is Infrastructure as Code and what are its benefits?

1. IaC defines infrastructure in versioned files so it can be created and changed automatically.
2. Benefits: repeatability, review, version history, automation, fewer manual errors, faster recovery.
3. Declarative tools (Terraform, CloudFormation) describe the desired end state. Imperative scripts describe steps.
4. **Follow-up:** "Terraform vs CloudFormation?" Terraform is multi-cloud and uses an external state file you must protect. CloudFormation is AWS-native, manages state for you in stacks, and may support new AWS features at launch.

#### Q21. CloudWatch vs CloudTrail vs Config?

1. CloudWatch: metrics, logs and alarms, answering "how is it performing?".
2. CloudTrail: API call history, answering "who did what and when?".
3. Config: resource configuration history and compliance rules, answering "what is the configuration and is it compliant?".
4. Example: CPU spike is CloudWatch. Someone deleted a security group is CloudTrail. A rule that flags open SSH is Config.

#### Q22. How would you design a highly available web application on AWS?

1. VPC with public, private and isolated subnets in at least two AZs.
2. ALB in public subnets, application in an Auto Scaling group (or EKS) in private subnets across AZs.
3. RDS Multi-AZ in isolated subnets. Static content on S3 and CloudFront.
4. One NAT Gateway per AZ, or VPC endpoints for AWS service traffic.
5. IAM roles, security groups with least privilege, secrets in Secrets Manager.
6. CloudWatch alarms, health checks, backups and tested recovery.
7. Everything in Terraform with CI/CD and rollback.

#### Q23. How do you choose a DR strategy?

1. Ask the business for the **RPO and RTO** and the budget.
2. RPO/RTO of hours: backup and restore. Tens of minutes: pilot light. Minutes: warm standby. Near zero: active/active.
3. Check data-consistency challenges for active/active.
4. Test regularly and measure the achieved RPO/RTO.

#### Q24. What is an SCP and how is it different from an IAM policy?

1. An SCP (Service Control Policy) in Organizations sets the **maximum permissions** for accounts in an OU. It never grants permissions.
2. An IAM policy grants permissions to identities.
3. Effective permission = what IAM allows **and** what the SCP allows.
4. Use SCPs for guardrails, such as denying unused Regions or disabling CloudTrail.

#### Q25. How does IAM evaluate a request?

1. Default is implicit deny.
2. An explicit Allow in an applicable policy permits the action.
3. An explicit Deny always wins.
4. SCPs, permission boundaries and session policies further limit the maximum.
5. For cross-account access both the identity side and the resource side must allow it.

#### Q26. How does Terraform state work and what is drift?

1. State maps your code to real resources and stores their attributes.
2. For teams, keep state remote (for example S3), encrypted, access-controlled and locked.
3. Drift is a difference between real infrastructure and code, for example a console change.
4. `terraform plan` shows drift. Fix by updating code or reapplying.
5. State can contain secrets, so restrict access.

#### Q27. EBS vs S3 vs EFS: when do you use each?

1. EBS: block storage for one EC2 instance (boot disks, databases). AZ-scoped.
2. S3: object storage for artifacts, backups, static assets, data lakes. Regional, highly durable.
3. EFS: shared NFS file system across many instances and AZs.
4. EBS snapshots protect EBS volumes. Use cross-AZ/Region copies for recovery.

#### Q28. How do you optimise AWS cost?

1. Visibility: tags, Cost Explorer, Budgets, anomaly detection.
2. Right-size using Compute Optimizer data.
3. Commit with Savings Plans for steady usage. Use Spot for fault-tolerant workloads.
4. Remove idle resources (unattached EBS, old snapshots, idle load balancers, unused IPs).
5. Reduce data transfer and NAT cost with endpoints and AZ-local traffic.
6. Lifecycle rules for S3 and log retention.
7. Schedule non-production shutdowns.

#### Q29. Multi-AZ vs read replica?

1. Multi-AZ is for **availability** with automatic failover (typically a synchronous standby in another AZ).
2. Read replicas are for **read scaling** (typically asynchronous), and can also be used for DR with manual promotion.
3. Behaviour differs by engine and deployment type (for example Aurora). Verify in the documentation.

#### Q30. What are Spot Instances and where do you use them?

1. Spare EC2 capacity at a large discount, but AWS can reclaim it with short notice.
2. Good for stateless, fault-tolerant, flexible workloads: CI runners, batch jobs, containers with multiple instance types.
3. Not for single stateful databases.
4. Use diversified instance types and Capacity Rebalancing or interruption handling.

#### Q31. How does cross-account access work?

1. Preferred: a role in the target account with a **trust policy** allowing the source account's principal. The source assumes it with STS and gets temporary credentials.
2. Alternative: a resource policy (for example on S3 or SQS) that names the other account's principal. The source identity policy must also allow the action.
3. If KMS encryption is involved, the key policy must permit the principal.
4. Use external IDs for third-party access, and Access Analyzer to review external access.

### 20.3 Scenario-based and production troubleshooting questions

#### Q32. You get `AccessDenied` when running an AWS CLI command. How do you troubleshoot?

1. `aws sts get-caller-identity` to confirm account and role.
2. Check for environment variables overriding the profile (`aws configure list`).
3. Read the error text: it often indicates explicit deny, SCP or missing allow.
4. Review identity policies, permission boundaries, SCPs, resource policies and KMS policies.
5. Use the IAM policy simulator and CloudTrail to find the denying layer.
6. Apply the smallest permission fix that follows least privilege.

#### Q33. The AWS bill doubled this month. What do you do?

1. Use Cost Explorer: group by service, then usage type, Region, account and tag.
2. Identify the driver (NAT data, EC2, data transfer, snapshots, logs).
3. Check for unused Regions or unknown resources (possible credential compromise).
4. Fix the driver and clean up idle resources.
5. Add budgets, anomaly detection, tagging and SCPs to prevent recurrence.

#### Q34. One AZ is impaired and your application is partially failing. What do you do?

1. Check AWS Health dashboard, ELB target health and metrics per AZ.
2. Verify that compute and the database are multi-AZ and that the ASG is launching in healthy AZs.
3. Make sure the remaining AZs have capacity. Raise desired capacity if needed.
4. If necessary, shift traffic away from the impaired AZ (verify current options such as zonal shift).
5. Communicate status. After recovery, review capacity planning and add a game day.

#### Q35. An access key was found in a public Git repository. What are your steps?

1. Deactivate the key immediately (keep it for audit), then replace it with role-based access.
2. Review CloudTrail across all Regions for what the key did.
3. Look for new users, roles, keys, instances and policy changes. Contain and remove anything unauthorised.
4. Remove the secret from the repository history, and treat it as compromised forever.
5. Notify the security team.
6. Prevent: SSO and roles, secret scanning in CI, GuardDuty, short-lived credentials.

### 20.4 Security and best-practice questions

#### Q36. What steps do you take to secure a new AWS account?

1. Protect the root user with MFA, remove or never create root access keys, and store credentials securely.
2. Set up SSO/federation with MFA and least-privilege roles instead of IAM users.
3. Enable CloudTrail in all Regions with logs sent to a protected bucket (ideally a separate log account).
4. Enable GuardDuty, Security Hub and Config (or use Control Tower baselines).
5. Block public S3 access at the account level, enable default encryption, require IMDSv2.
6. Add SCPs (deny unused Regions, deny leaving the Organization, deny disabling logging).
7. Set budgets and alerts, and enforce tagging.
8. Define alternate security and billing contacts.

#### Q37. How do you manage secrets in AWS?

1. Use Secrets Manager (with rotation) or SSM Parameter Store SecureString.
2. Applications fetch secrets at runtime using an IAM role.
3. Encrypt with KMS and control access through IAM and key policies.
4. Never place secrets in code, images, user data or Terraform plain-text variables committed to Git.
5. Audit access with CloudTrail and rotate regularly.

### 20.5 Follow-up questions a senior interviewer may ask

1. "Why are some resources global and others Regional?" IAM, Route 53 and CloudFront management are global control planes. Most resources (EC2, VPC, RDS, S3 buckets) live in one Region.
2. "How do you stop engineers from using the wrong Region?" An SCP that denies actions outside approved Regions (with exceptions for global services), plus default Region in profiles.
3. "What is the blast radius of an IAM mistake?" Everything the role can touch. Limit with accounts, boundaries, SCPs and least privilege.
4. "How would you migrate a workload to AWS with minimal risk?" Assess, plan landing zone, replicate data, run in parallel, test, cut over gradually with rollback, then optimise.
5. "How do you give a CI pipeline access to AWS without keys?" OIDC federation to an IAM role with a trust policy restricted to the repository and branch.
6. "What would you do if the AWS Region you rely on has an outage?" Decide with business input based on RPO/RTO, execute the tested DR runbook, move DNS, communicate, then fail back.
7. "Two AZs or three?" Three AZs allow losing one while keeping 2/3 capacity (lower over-provisioning cost than two AZs needing 100% in each), but add complexity. Decide by criticality and Region support.

---

## 21. Interview Answer Framework

Use this for any scenario question. Say the steps aloud.

### 21.1 The eight-step framework

| Step | What you say | AWS-specific examples |
| --- | --- | --- |
| 1. Understand problem and impact | Ask what is failing, scope, start time, recent changes | One Region/AZ/account? After a deployment? |
| 2. Check monitoring, logs, metrics, events | Gather evidence before changing anything | CloudWatch, CloudTrail, AWS Health, ELB target health |
| 3. Verify architecture and configuration | Draw the intended design | Account, Region, VPC, IAM role, dependencies |
| 4. Narrow down root causes | List hypotheses and rank them | Identity vs network vs capacity vs change |
| 5. Run safe diagnostics | Read-only first | `sts get-caller-identity`, `describe-*`, policy simulator |
| 6. Apply the safest fix and validate | Smallest change, with rollback | One policy statement, one route, one scale-out |
| 7. Communicate and document | Update stakeholders and record root cause | Incident timeline, owner, follow-ups |
| 8. Prevent recurrence | Add monitoring or automation | Config rule, alarm, IaC module, SCP |

### 21.2 AWS adaptations

1. **Permission problems:** account/role -> credential source -> identity policy -> resource policy -> SCP/boundary -> KMS -> explicit deny.
2. **Network problems:** DNS -> route -> security group -> NACL -> gateway/endpoint -> host/app.
3. **Availability problems:** scope (AZ/Region/service) -> health checks -> capacity -> dependencies (DB, cache) -> recent changes.
4. **Cost problems:** service -> usage type -> account/Region -> resource -> owner (tags).
5. **Timeout vs AccessDenied:** timeout is the network path. AccessDenied means the request arrived and was rejected by authorization.

### 21.3 Worked example (about 90 seconds)

> **Question:** "Your production application in AWS is slow and some users get errors. What do you do?"
>
> "First I'd confirm the impact: how many users, which endpoints, since when, and what changed, such as a deployment or a scaling event. Then I'd check evidence: CloudWatch dashboards for latency, error rate and saturation, ELB target health per AZ, and the AWS Health dashboard for any AWS-side issue.
>
> I'd verify the architecture: is the traffic balanced across AZs, is the Auto Scaling group at its maximum, is the database CPU, connections or storage the bottleneck? My hypotheses would be a bad deployment, capacity limits, an unhealthy AZ, a database bottleneck or a downstream dependency.
>
> I'd run safe checks: target health, ASG activity history, RDS metrics and the application logs. If, for example, the ASG hit its max and CPU is saturated, I'd raise capacity as the safest short-term fix, then validate that latency and errors fall. If it's a bad release I'd roll back.
>
> After recovery I'd communicate status, write up the timeline and root cause, and add prevention such as a target-tracking policy on request count, a higher max with a budget alarm, and a canary deployment with automatic rollback."

### 21.4 Delivery tips

1. State your assumptions out loud.
2. Prefer read-only diagnostics first and say so.
3. Mention trade-offs (cost versus resilience).
4. Do not claim you built something you did not. Use "in a design like this I would…" for hypothetical cases, and use your real project experience only where it is genuinely yours.

---

## 22. Quick Revision

### 22.1 Key points to remember

1. Region = geographical area. AZ = isolated location in a Region. Edge location = content caching site.
2. Resources are Regional by default and are **not** replicated automatically.
3. Multi-AZ = high availability. Multi-Region = disaster recovery.
4. HA recovers quickly. Fault tolerance continues through failure. DR recovers after major disruption.
5. RPO = acceptable data loss. RTO = acceptable downtime.
6. Elasticity = automatic scale out and in.
7. Shared responsibility: AWS secures the cloud. You secure what is in it.
8. Use roles and SSO, not static keys. Protect the root user with MFA.
9. IAM: implicit deny, explicit Allow grants, explicit Deny wins. SCPs only restrict.
10. IaC with remote locked state and reviewed plans. Console clicks cause drift.
11. CloudWatch = performance. CloudTrail = who did what. Config = configuration and compliance.
12. Tag everything. Budgets and anomaly detection from day one.

### 22.2 Important commands

| Goal | Command |
| --- | --- |
| Who am I? | `aws sts get-caller-identity` |
| Credential and Region source | `aws configure list` |
| SSO login | `aws sso login --profile <name>` |
| Regions | `aws ec2 describe-regions` |
| AZs and AZ IDs | `aws ec2 describe-availability-zones` |
| Recent API events | `aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=<Event>` |
| Test a permission | `aws iam simulate-principal-policy ...` |
| Check permissions without acting | add `--dry-run` where supported |
| Terraform safe flow | `terraform fmt`, `validate`, `plan -out`, `apply` |

### 22.3 Commonly confused concepts

| Pair | Difference in one line |
| --- | --- |
| Region vs AZ | Geographic area vs isolated location inside it |
| HA vs FT | Fast recovery vs continuous operation through failure |
| HA vs DR | Survive local failure vs recover from major disruption |
| Scalability vs elasticity | Can grow vs grows and shrinks automatically |
| Vertical vs horizontal | Bigger machine vs more machines |
| RPO vs RTO | Data loss tolerance vs downtime tolerance |
| User vs role | Long-term credentials vs temporary assumed identity |
| SCP vs IAM policy | Maximum allowed vs actual grant |
| CloudWatch vs CloudTrail | Performance data vs API audit |
| Multi-AZ vs read replica | Failover vs read scaling |
| Backup vs DR | Data copy vs full recovery capability |
| Timeout vs AccessDenied | Network path problem vs authorization problem |

### 22.4 Five-minute revision notes

1. **Global infrastructure:** Region, AZ, edge, Local Zone. Pick Regions by latency, compliance, service availability and cost.
2. **Resilience:** multi-AZ everywhere, health checks, stateless apps, auto-healing, tested failover.
3. **DR:** define RPO/RTO, choose backup/restore, pilot light, warm standby or active/active, test restores.
4. **Scaling:** horizontal with Auto Scaling and target tracking, cap with a max.
5. **Security:** shared responsibility, roles over keys, MFA, least privilege, CloudTrail everywhere, encryption, no public buckets.
6. **Accounts:** multi-account with Organizations, SCP guardrails, central logging.
7. **Automation:** IaC, CI/CD with OIDC, remote state, drift detection.
8. **Observability:** CloudWatch, CloudTrail, Config, alarms with owners.
9. **Cost:** tags, budgets, right-size, Savings Plans/Spot, endpoints, lifecycle rules.
10. **Troubleshooting:** identity vs network vs capacity vs change. Read-only first.

### 22.5 Quick-reference cheat sheet

```text
Region        : independent geographic area (ap-south-1)       | not auto-replicated
AZ            : isolated location in Region (use AZ IDs across accounts)
HA            : multi-AZ + LB + health checks + auto healing
DR            : cross-Region; RPO (data loss) / RTO (time)
Strategies    : backup-restore < pilot light < warm standby < active/active (cost increases)
Scaling       : vertical = bigger; horizontal = more; elastic = automatic both ways
Shared resp.  : AWS = OF the cloud;  you = IN the cloud
IAM evaluation: implicit deny -> explicit allow -> explicit deny always wins; SCP only limits
First CLI cmd : aws sts get-caller-identity
Cost levers   : tags, budgets, right-size, savings plans, spot, endpoints, lifecycle
Audit         : CloudTrail (who) | Config (what/compliance) | CloudWatch (how)
```

### 22.6 Ten rapid-fire questions (with short answers)

1. **What is a Region?** A geographical area with multiple AZs.
2. **Are AZ names the same across accounts?** No, use AZ IDs.
3. **Does multi-AZ protect from a Region outage?** No, use multi-Region DR.
4. **What does RTO measure?** Time to restore service.
5. **What does RPO measure?** Acceptable data loss in time.
6. **Which wins in IAM: Allow or Deny?** Explicit Deny.
7. **Does an SCP grant permissions?** No.
8. **Who is responsible for patching a guest OS on EC2?** The customer.
9. **Which service shows who deleted a resource?** CloudTrail.
10. **First command when debugging CLI permissions?** `aws sts get-caller-identity`.

### 22.7 Final interview readiness checklist

Tick each item only if you can explain it **without notes**.

- [ ] I can explain Region, AZ, edge location and Local Zone, and how to choose a Region.
- [ ] I can explain HA, fault tolerance and DR with a concrete AWS example of each.
- [ ] I can define RPO and RTO and choose a DR strategy for given values.
- [ ] I can explain vertical vs horizontal scaling and how Auto Scaling works end to end.
- [ ] I can explain the shared responsibility model with examples for EC2, RDS and S3.
- [ ] I can explain multi-account design, Organizations and SCPs.
- [ ] I can explain IAM users, roles, policies and the evaluation logic, including cross-account access.
- [ ] I can compare Console, CLI, SDK, API and IaC, and describe a safe Terraform workflow.
- [ ] I can distinguish CloudWatch, CloudTrail and Config with examples.
- [ ] I can debug `AccessDenied`, an unexpected bill and an AZ failure using the eight-step framework.
- [ ] I can list the first steps to secure a new AWS account.
- [ ] I have rehearsed at least three scenarios aloud.

### 22.8 Next topics (recommended order)

IAM in depth, then VPC (see the separate VPC notes), EC2 and EBS, S3, load balancing and Auto Scaling, RDS, CloudWatch/CloudTrail/Config, Terraform on AWS, and EKS.

### 22.9 Official documentation (verify current details here)

- AWS Global Infrastructure: <https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions-availability-zones.html>
- Shared Responsibility Model: <https://aws.amazon.com/compliance/shared-responsibility-model/>
- AWS Well-Architected Framework: <https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html>
- Disaster recovery of workloads on AWS: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html>
- IAM User Guide: <https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html>
- AWS Organizations: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html>
- AWS CLI User Guide: <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html>

> Some of these URLs may be reorganised by AWS over time. If a link moves, search the title on the AWS documentation site.
