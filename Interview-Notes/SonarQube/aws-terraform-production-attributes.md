# AWS Terraform — Production Attribute Checklist (Must-have vs Should-have, with explanations)

**Must-have** = skip it and prod breaks, gets exposed, or fails an audit.
**Should-have** = only applies under a specific condition — noted inline.

---

## 0. The 6-Pillar Memory Framework (use this in interviews)

| Pillar | Question | Typical attribute |
|---|---|---|
| **E** – Encryption | Is data at rest/in transit encrypted? | `encrypted`, `kms_key_id` |
| **N** – Network exposure | Can the internet reach this by default? | `publicly_accessible`, `assign_public_ip` |
| **H** – High availability | Does it survive an AZ failure? | `multi_az`, multi-AZ subnets |
| **D** – Deletion safety | Can it be destroyed by accident? | `deletion_protection`, `prevent_destroy` |
| **L** – Logging | Can you debug it after an incident? | `retention_in_days`, access logs |
| **I** – IAM least privilege | Is the identity scoped down? | no `*`/`*`, `permissions_boundary` |

Say this in an interview: *"I run every resource through encryption, exposure, HA, deletion safety, logging, and IAM before calling it production-ready."*

---

## 1. `aws_vpc`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `enable_dns_support` | Must | always | Turns on Amazon-provided DNS resolution inside the VPC. Without it, instances can't resolve `.amazonaws.com` endpoints (S3, RDS, ECR) — API calls from EC2 will time out. |
| `enable_dns_hostnames` | Must | always | Assigns DNS hostnames to instances with public/private IPs. Required for VPC endpoints, EKS, and RDS endpoint DNS to resolve correctly — without it you're forced to hardcode IPs, which break on restart. |
| `instance_tenancy` | Must | always | `default` shares physical hardware (cheap); `dedicated` guarantees your own hardware (2–3x cost). Only override for licensing terms that require dedicated hardware (some Oracle/Windows licenses). |
| Flow Logs | Should | compliance/audit need | Captures a record of IP traffic going to/from network interfaces. This is your only way to forensically answer "who talked to what" after a security incident — most SOC2/PCI audits require it. |
| Secondary CIDR | Should | IP exhaustion | Adds extra address space to a VPC that's running out of IPs — common with large EKS clusters where every pod can consume an IP. |

## 2. `aws_subnet`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `map_public_ip_on_launch` | Must | true=public / false=private | Auto-assigns a public IP to every instance launched in that subnet. Leaving it `true` on a "private" subnet accidentally exposes instances to the internet — a classic misconfiguration. |
| `availability_zone` spread | Must | always | Placing subnets across ≥2 AZs is what makes your architecture survive a data-center-level outage; single-AZ = single point of failure. |
| `assign_ipv6_address_on_creation` | Should | VPC has IPv6 CIDR | Auto-assigns IPv6 addresses on launch. Irrelevant if you haven't opted the VPC into IPv6 at all. |
| `enable_resource_name_dns_a_record_on_launch` | Should | service discovery needs | Lets EC2 instances get a private DNS A record automatically — useful for internal service discovery (e.g. EKS worker nodes referencing each other by name). |

## 3. `aws_internet_gateway` / `aws_nat_gateway`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `depends_on` (route table → IGW) | Must | always | Terraform doesn't always infer that a route needs the IGW to exist first; an explicit dependency avoids a race condition on `apply` that can silently fail to route traffic. |
| One NAT GW per AZ | Should | prod HA | A NAT Gateway lives in one AZ. If that AZ goes down and you only have one NAT GW, every private subnet loses internet access — one per AZ removes that single point of failure. Costs 2-3x more, so dev/staging often use just one. |
| EIP `domain = "vpc"` | Must | always | Declares the Elastic IP is for the VPC platform (not the deprecated EC2-Classic). Required for NAT Gateway attachment. |

## 4. `aws_route_table`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| Explicit subnet association | Must | always | If you don't associate a subnet, it silently falls back to the VPC's main route table — meaning traffic could route somewhere you didn't intend (e.g. a "private" subnet accidentally getting a route to the IGW). |
| Separate public/private route tables | Must | always | Public subnets route `0.0.0.0/0` to the IGW; private subnets route it to a NAT Gateway. Sharing one table means you can't have both behaviors at once. |

## 5. `aws_security_group`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `name_prefix` + `create_before_destroy` | Must | always | With plain `name`, Terraform must destroy the old SG before creating the new one — if anything still references it, that fails and causes downtime. `name_prefix` + `create_before_destroy` builds the replacement first. |
| No `0.0.0.0/0` on ingress | Must | except public ALB 80/443 | Opening ingress to the whole internet is the #1 cause of breached EC2 instances (SSH/RDP brute force, exposed DB ports). Only a public load balancer's 80/443 should legitimately be open to all. |
| `revoke_rules_on_delete` | Should | circular SG references | Some SGs reference each other (SG-A allows traffic from SG-B and vice versa), which can block deletion. This flag force-clears rules first so Terraform can tear both down. |
| Separate SGs per tier | Must | always | One flat SG for web+app+db means a compromised web server has network-level access to your database. Tiered SGs enforce least-privilege at the network layer. |

## 6. `aws_instance`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `metadata_options.http_tokens = "required"` | Must | always | Forces IMDSv2 (token-based) instead of IMDSv1. IMDSv1 is vulnerable to SSRF attacks that trick the instance into leaking its IAM credentials via the metadata endpoint — this was the root cause of the 2019 Capital One breach. |
| `root_block_device.encrypted` | Must | always | Encrypts the boot volume at rest. Without it, anyone with a snapshot of the volume (e.g. via a misconfigured share) can read the raw disk contents. |
| `monitoring = true` | Should | prod workloads | Enables 1-minute (vs 5-minute) CloudWatch metrics — needed for fast autoscaling reactions and tighter alerting; not worth the extra cost for disposable dev instances. |
| `disable_api_termination` | Should | stateful/critical instances | Prevents accidental termination via API/console. Useful for bastion hosts or license servers where a `terraform destroy` typo would be costly to recover from. |
| `iam_instance_profile` (not hardcoded keys) | Must | always | Grants AWS permissions to the instance via a role instead of embedding access keys in code/AMI — hardcoded keys are a top cause of leaked-credential incidents (e.g. committed to GitHub). |
| `ebs_optimized` | Should | older instance families | Dedicates bandwidth for EBS I/O. Nitro-based instance types (most current generations) have this on by default, so it's a non-issue there. |

## 7. `aws_ebs_volume`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `encrypted`, `kms_key_id` | Must | always | Same rationale as root volume encryption — protects data at rest if the physical disk or a snapshot is ever exposed. |
| `type = "gp3"` | Should | new volumes | gp3 decouples IOPS/throughput from size and is ~20% cheaper than gp2 for the same performance — not a security requirement, just a cost/perf best practice. |
| `snapshot_id` | Should | restoring from backup | Only relevant when provisioning a volume to recover data, not for fresh volumes. |

## 8. `aws_s3_bucket` family
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| Versioning | Must | state/artifact buckets | Keeps prior versions of an object when it's overwritten or deleted — your only protection against accidental overwrite/delete, especially critical for a Terraform state bucket. |
| SSE (KMS) | Must | always | Encrypts objects at rest. With a KMS (not just AES256) key, you also get an audit trail of who decrypted what via CloudTrail. |
| All 4 public-access-block flags | Must | unless intentional static site | Blocks any bucket policy or ACL from making objects public, even if someone writes one by mistake later. This is the single biggest guardrail against the "leaky S3 bucket" class of breaches. |
| `lifecycle_rule` | Should | logs/backups | Automatically transitions objects to cheaper storage classes or deletes them after N days — without it, log buckets grow unbounded and quietly rack up storage cost. |
| Access logging | Should | compliance/audit trail | Records every request made to the bucket (who, what, when) to a separate log bucket — needed to investigate unauthorized access after the fact. |
| Object Lock | Should | WORM/compliance | Makes objects genuinely undeletable/unmodifiable for a retention period — required for financial/legal records under regulations like SEC 17a-4. |

## 9. `aws_iam_role` / `aws_iam_policy`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| Scoped `assume_role_policy` | Must | always | Defines exactly which principal (service/account) can assume this role. A wildcard principal means *anyone* could potentially assume it and inherit its permissions. |
| `permissions_boundary` | Should | multi-team/self-serve accounts | Caps the maximum permissions a role can ever have, even if its attached policy grants more — a safety net so a developer can't accidentally (or maliciously) create an admin-level role. |
| No wildcard `Action`+`Resource` together | Must | always | `"Action": "*", "Resource": "*"` grants full account access — the IAM equivalent of leaving the front door open. Scope both to what's actually needed. |
| `max_session_duration` tuned down | Should | highly privileged roles | Shortens how long temporary credentials from this role stay valid — limits how much damage a leaked credential can do before it expires. |

## 10. `aws_db_instance` (RDS)
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `storage_encrypted`, `kms_key_id` | Must | always | Encrypts the underlying storage. Note: this can't be enabled after the fact — you'd have to snapshot, copy encrypted, and restore, so it must be set at creation. |
| `multi_az` | Should | prod/critical DBs | Runs a synchronously-replicated standby in a second AZ; RDS auto-fails-over to it if the primary AZ has an outage. Doubles compute cost, which is why dev/staging usually skip it. |
| `publicly_accessible = false` | Must | unless intentionally public | Prevents the DB from getting a public IP reachable from the internet. A public RDS instance is a direct target for credential-stuffing/brute-force attacks. |
| `deletion_protection` | Must | prod | Blocks `terraform destroy` / console delete from actually deleting the instance until you explicitly disable the flag — a safety catch against fat-fingered deletes. |
| `backup_retention_period` | Must | ≥7 days prod | Enables automated daily snapshots kept for N days, letting you point-in-time-restore after data corruption or accidental deletes. `0` disables backups entirely. |
| `performance_insights_enabled` | Should | perf debugging needed | Gives query-level performance visibility (which queries are consuming the most DB load) — valuable for troubleshooting, but an added cost most teams only enable when they actually need it. |
| `enabled_cloudwatch_logs_exports` | Should | centralized log needs | Ships DB error/slow-query logs to CloudWatch so they can be searched/alerted on centrally instead of pulled manually. |
| Custom `parameter_group_name` | Should | workload tuning | Lets you override engine defaults (e.g. `max_connections`, `slow_query_log`) — only needed when defaults don't fit your actual traffic pattern. |

## 11. `aws_lb` (ALB/NLB)
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `enable_deletion_protection` | Must | prod | Same idea as RDS — blocks accidental deletion of a load balancer that's actively serving production traffic. |
| `drop_invalid_header_fields` | Must | always | Rejects malformed HTTP headers, closing off HTTP request-smuggling/desync attack vectors where a crafted header confuses the LB and backend differently. |
| Access logs | Should | compliance/debugging | Logs every request (client IP, latency, response code) to S3 — essential for diagnosing "why did this specific request fail" after the fact. |
| `idle_timeout` | Should | long-lived connections | Controls how long the LB keeps an idle connection open. Only needs raising above the 60s default for websockets or large file uploads that naturally sit idle longer. |

## 12. `aws_lb_target_group`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| Tuned `health_check` block | Must | always | Determines how the LB decides a backend instance is unhealthy and stops sending it traffic — a loose health check means users get routed to broken instances for longer. |
| Lower `deregistration_delay` | Should | frequent deploys | Controls how long the LB waits before fully removing a draining instance from rotation. Default 300s means each rolling deploy takes 5 extra minutes per batch — painful for frequent releases. |
| `stickiness` | Should | stateful apps | Pins a client to the same backend instance across requests. Only needed if the app stores session state locally instead of in a shared store (Redis, DynamoDB). |

## 13. `aws_autoscaling_group`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `health_check_type = "ELB"` | Must | behind a load balancer | With the default `"EC2"` type, the ASG only checks if the instance is running — not if the *application* on it is actually responding. `"ELB"` uses the target group's health check instead, catching app-level failures. |
| `instance_refresh` block | Must | always | Enables rolling replacement of instances when the launch template changes, instead of leaving old instances running until manually terminated — critical for zero-downtime deploys. |
| Multi-AZ `vpc_zone_identifier` | Must | always | Lets the ASG spread instances across AZs so an AZ failure only takes out part of your fleet, not all of it. |
| `termination_policies` | Should | scale-in preference matters | Controls which instance gets killed first during scale-in (e.g. oldest launch template version) — only relevant if you care about which specific instance survives. |
| Warm pools | Should | fast scale-up needs | Keeps pre-initialized (stopped) instances ready to go, cutting scale-up latency for spiky traffic patterns — extra cost most steady-traffic apps don't need. |

## 14. `aws_launch_template`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `metadata_options.http_tokens = "required"` | Must | always | Same IMDSv2 rationale as `aws_instance` — but here it applies to every instance the ASG launches from this template. |
| `block_device_mappings[].ebs.encrypted` | Must | always | Ensures every new instance launched from the template gets an encrypted volume automatically, without relying on each engineer remembering to set it. |
| `update_default_version = true` | Should | ASG should track latest | Automatically points the ASG at the newest template version when you push a change — without it, you have to manually update the ASG's reference every time. |

## 15. `aws_eks_cluster`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `encryption_config` for secrets | Must | always | Encrypts Kubernetes Secrets at rest in etcd using a KMS key — without it, anyone with etcd access (or an etcd snapshot) can read secrets in plaintext. |
| `endpoint_public_access = false` / CIDR-restricted | Must | prod | Controls whether the Kubernetes API server is reachable from the internet. A fully public, unrestricted API endpoint is a direct attack surface onto your cluster control plane. |
| `enabled_cluster_log_types` | Should | prod/security audit | Turns on control-plane logs (API server, audit, authenticator) to CloudWatch — needed to investigate "who did what to the cluster," but adds log volume/cost most dev clusters skip. |
| `capacity_type = "SPOT"` | Should | non-critical/batch workloads | Uses discounted spot capacity for worker nodes — fine for interruption-tolerant batch jobs, risky for anything needing guaranteed uptime. |

## 16. `aws_ecs_service`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `assign_public_ip = false` | Must | private-subnet workloads | Prevents Fargate tasks from getting a public IP by default — tasks should reach the internet (if needed) via NAT Gateway, not a direct public interface. |
| `enable_execute_command = false` | Should | true only when debugging | Controls whether `ecs exec` (a shell into the running container) is allowed. Leaving it always-on is an unnecessary attack surface — enable temporarily only when you need to debug a live container. |
| `deployment_circuit_breaker` | Should | prod | Automatically rolls back a deployment if new tasks keep failing health checks, instead of getting stuck retrying forever and taking capacity down with it. |

## 17. `aws_lambda_function`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `reserved_concurrent_executions` | Should | limited downstream capacity | Caps how many instances of the function can run simultaneously — prevents a traffic spike from opening thousands of DB connections at once and overwhelming a downstream database. |
| `tracing_config` (X-Ray) | Should | distributed tracing needed | Adds request tracing across service boundaries so you can see where time is spent in a multi-service call chain — overkill for a trivial standalone function. |
| `dead_letter_config` | Should | async invocations | Captures events that fail processing (from SNS/S3/EventBridge triggers) into a queue instead of silently dropping them after retries are exhausted. |
| `vpc_config` | Should | needs private resource access | Attaches the function to your VPC so it can reach private resources like RDS — but adds cold-start latency, so skip it if the function only talks to public AWS APIs. |

## 18. `aws_cloudwatch_log_group`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `retention_in_days` | Must | always | Without this set, logs are kept forever by default — a slow, invisible cost leak that often goes unnoticed until the bill is reviewed months later. |
| `kms_key_id` | Should | sensitive log data | Encrypts log contents with your own key rather than the AWS-managed default — needed when logs might contain sensitive data (PII, tokens) for compliance reasons. |

## 19. `aws_kms_key`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `enable_key_rotation` | Must | always | Automatically rotates the underlying key material yearly while keeping the same key ID — limits how long any single key version stays in use if compromised, at no cost. |
| `deletion_window_in_days` | Must | always | Enforces a waiting period (7-30 days) before a deleted key is actually destroyed — since data encrypted with a KMS key becomes permanently unreadable once the key is gone, this window is your undo button. |
| Multi-region key | Should | cross-region DR | Lets the same key be used to decrypt data replicated to a second region — only relevant if you're running active-active or DR across regions. |

## 20. `aws_ecr_repository`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `scan_on_push` | Must | always | Automatically scans every pushed image for known CVEs — catches vulnerable base images/dependencies before they reach production. |
| `image_tag_mutability = "IMMUTABLE"` | Should | prod | Prevents a tag (e.g. `:v1.2`) from being overwritten once pushed, so you can't accidentally (or maliciously) swap out what a given tag points to. Dev environments often keep tags mutable for `:latest` convenience. |
| Lifecycle policy | Should | in practice, always | Automatically expires old/untagged images — without it, storage cost grows indefinitely as every CI build pushes a new image. |

## 21. `aws_sns_topic` / `aws_sqs_queue`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `kms_master_key_id` | Must | sensitive payloads | Encrypts message contents at rest — relevant any time messages might carry customer or business-sensitive data. |
| `redrive_policy` → DLQ | Must | always | Redirects a message to a dead-letter queue after it fails processing N times, instead of looping forever or silently vanishing — without this, you lose visibility into failed events entirely. |
| Raised `message_retention_seconds` | Should | consumers can be down long | Extends how long an unprocessed message stays in the queue — matters if your consumer might be offline for maintenance longer than the 4-day default. |

## 22. `aws_dynamodb_table`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `point_in_time_recovery` | Must | prod | Lets you restore the table to any point in the last 35 days — your safety net against accidental writes/deletes or application bugs that corrupt data. |
| `server_side_encryption` | Must | always | Encrypts table data at rest, same rationale as S3/EBS. |
| `deletion_protection_enabled` | Must | prod | Blocks the table from being deleted via API/Terraform until explicitly turned off — guards against accidental destroys of a table with no backups configured. |
| `ttl` block | Should | items naturally expire | Auto-deletes items past a timestamp attribute (e.g. session tokens, cache entries) — saves you from writing a manual cleanup job. |
| Global tables | Should | multi-region active-active | Replicates the table across regions for low-latency reads/writes globally — only relevant for genuinely multi-region applications. |

## 23. `aws_route53_record`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `alias` block instead of static IP | Must | pointing at ALB/CloudFront/S3 | AWS-managed resources like ALBs change their underlying IPs over time — an alias record tracks that automatically, while a hardcoded IP will eventually break. |
| `evaluate_target_health = true` | Should | automatic failover wanted | Makes Route53 stop routing to a target if its health check fails, instead of blindly resolving to a dead endpoint. |
| Health checks + failover routing | Should | active-passive DR | Only needed when you have a standby environment in another region that should take over automatically if primary goes down. |

## 24. `aws_cloudfront_distribution`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `viewer_protocol_policy = "redirect-to-https"` | Must | always | Forces all viewer traffic onto HTTPS — without it, clients can request content over plain HTTP, exposing traffic to interception. |
| `minimum_protocol_version = "TLSv1.2_2021"` | Must | always | Rejects connections using outdated, vulnerable TLS versions (1.0/1.1) — required by most modern compliance baselines. |
| Logging | Should | compliance/debugging | Records every request to S3 for later analysis — useful for investigating traffic anomalies or abuse. |
| WAF association | Should | public-facing prod sites | Adds a Web Application Firewall in front of the distribution to block common attack patterns (SQLi, XSS, bot traffic) — strongly recommended for public sites but not universally mandatory. |
| `is_ipv6_enabled` | Should | IPv6 clients need support | Only matters if you actually need to serve IPv6-only clients. |

## 25. Cross-cutting / commonly forgotten
| Item | Level | Condition | What it means & why it matters |
|---|---|---|---|
| Tags (`Environment`, `Owner`, `ManagedBy`) | Must | every resource | Without tags, cost allocation and "who owns this and can I delete it" become guesswork during audits or cleanups. |
| `lifecycle { prevent_destroy = true }` | Should | irreplaceable data stores | A Terraform-level guard that makes `terraform destroy` error out on this specific resource — extra insurance beyond the AWS-side deletion protection flag. |
| VPC Endpoints | Should | private subnets need AWS API access | Lets private-subnet resources reach AWS services (S3, DynamoDB, etc.) without routing through a NAT Gateway — cheaper and keeps traffic off the public internet path entirely. |
| NACLs beyond default | Should | defense-in-depth requirement | A second, stateless layer of network filtering on top of security groups — only needed when a compliance control explicitly requires layered network controls. |
| Cost allocation tags | Should | FinOps/showback needed | Lets finance attribute cloud spend back to specific teams/projects — only matters once someone's asking "who is spending what." |

---

## How to hold this in your head for an interview

1. **Lead with the framework**: encryption, exposure, HA, deletion protection, logging, IAM.
2. **Give 2–3 concrete examples per category** you know cold.
3. **Explicitly call out must vs should** and *why*: "IMDSv2 is non-negotiable because it closes an SSRF-to-credential-theft path — that's how Capital One got breached. Multi-AZ RDS is a should, because it's a pure cost/HA tradeoff I'd make differently in dev vs prod."
4. **Anchor on a story** — a real resource you've broken or fixed with this discipline lands far better than reciting attributes.

---

## Addendum — Resources & attributes missing from the original list

A few security/governance-critical resources didn't make the original "top 25 compute/network" cut but come up constantly in interviews and real prod audits. Adding them here rather than pretending the list above was complete.

### 26. `aws_cloudtrail`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `is_multi_region_trail` | Must | always | Captures API activity across **all** regions, not just the one you created the trail in — without it, an attacker (or a careless teammate) operating in an untracked region leaves no audit trail. |
| `enable_log_file_validation` | Must | always | Adds a cryptographic digest so you can prove logs weren't tampered with after the fact — important for any compliance framework and for trusting your own incident investigation. |
| S3 destination with SSE + versioning | Must | always | CloudTrail logs are the record of "who did what" in your account — if that bucket itself isn't locked down, an attacker can delete their own tracks. |
| `enable_logging` | Must | always | Easy to forget — a trail resource can exist but be toggled off, silently producing zero logs. |

### 27. `aws_secretsmanager_secret`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `kms_key_id` | Must | always | Encrypts the secret value at rest with a CMK you control (vs the AWS-managed default) — needed for auditability of who decrypted a secret via CloudTrail. |
| `rotation_rules` / `aws_secretsmanager_secret_rotation` | Should | DB credentials, API keys | Automatically rotates the secret on a schedule — without it, a leaked credential (e.g. in a log or old commit) stays valid forever. |
| Never put the secret value in a `.tf` file / state in plaintext | Must | always | Terraform state is often stored in S3/remote backends that other people can read — writing secrets as plain resource arguments leaks them into state history. Use `ephemeral` values, SSM references, or set outside Terraform. |

### 28. `aws_acm_certificate`
| Attribute | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `validation_method = "DNS"` | Must | almost always | DNS validation auto-renews forever as long as the validation CNAME stays in place; email validation requires manual click-through and *will* let your cert silently expire. |
| `lifecycle { create_before_destroy = true }` | Must | always | Prevents a brief window where the old cert is destroyed before the new one is ready, which would break HTTPS on anything referencing it (ALB, CloudFront). |

### 29. Baseline account/org-level guardrails (often assumed, rarely provisioned)
| Item | Level | Condition | What it means & why it matters |
|---|---|---|---|
| `aws_guardduty_detector` | Should | prod accounts | Continuous threat-detection service (compromised credentials, crypto-mining, port scanning) — cheap relative to the blast radius it catches. |
| `aws_config_configuration_recorder` + rules | Should | compliance-driven orgs | Continuously records resource configuration and flags drift from policy (e.g. "no S3 bucket should be public") — this is how you catch a manual console change that undoes your Terraform. |
| Default VPC security group locked down | Must | always | Every VPC gets a default SG that allows all traffic between resources attached to it. If you don't explicitly strip its rules, anything launched without an explicit SG inherits an overly permissive one. |
| Root account: no access keys, MFA enabled | Must | always | The root user bypasses IAM policies entirely — this is pure account hygiene, not a Terraform resource, but it's the first thing auditors and interviewers check. |

### 30. Commonly-missed attributes *within* resources already covered
| Resource | Attribute | Level | What it means & why it matters |
|---|---|---|---|
| `aws_db_instance` | `iam_database_authentication_enabled` | Should | Lets you authenticate to the DB using short-lived IAM tokens instead of long-lived DB passwords — removes another class of credential to leak/rotate. |
| `aws_db_instance` | `ca_cert_identifier` | Should | Pins which CA certificate the DB uses for TLS — matters if you're enforcing encrypted client connections (`sslmode=verify-full`). |
| `aws_s3_bucket` | `bucket_key_enabled` | Should | Reduces KMS API calls (and cost) for SSE-KMS buckets with high request volume — a cost optimization, not a security gap. |
| `aws_s3_bucket_cors_configuration` | full block | Should | Only needed if the bucket is accessed directly from browser JS (e.g. a web app uploading to S3) — leaving it default-closed is correct unless you have this use case. |
| `aws_instance` | `disable_api_stop` | Should | Separate from `disable_api_termination` — blocks *stopping* (not just terminating) via API, relevant for instances that must never be paused (e.g. a license server counting uptime). |
| `aws_autoscaling_group` | `mixed_instances_policy` | Should | Diversifies across instance types/purchase options (on-demand + spot) for cost savings and better spot availability — only worth the complexity for large, cost-sensitive fleets. |
| `aws_lb` | WAF (`aws_wafv2_web_acl_association`) | Should | Same rationale as CloudFront WAF — ALBs fronting public web apps benefit from a WAF layer blocking common exploit patterns before they hit your app. |
| `aws_ecs_task_definition` | `runtime_platform`, non-root `user` in container | Should | Running containers as non-root limits the blast radius if the container is compromised — a container escape from a root process has far more host-level impact. |

---

**Bottom line on completeness**: no checklist like this is ever fully "done" — AWS adds new resources/attributes constantly. The 6-pillar framework (E-N-H-D-L-I) is what generalizes; treat every table above as worked examples of that framework, not a list to memorize verbatim.
