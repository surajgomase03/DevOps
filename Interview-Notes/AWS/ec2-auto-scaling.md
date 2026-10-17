# Amazon EC2 Auto Scaling — Complete DevOps Interview Notes

> **Level:** Intermediate to advanced (4–6 years of experience)
> **Roles covered:** DevOps Engineer, Senior DevOps Engineer, SRE, Cloud Engineer, Platform Engineer
> **Style:** Simple English, pointwise notes, production scenarios, interview-ready answers

**How to use these notes**

1. Read sections 1–14 to build the mental model.
2. Practise sections 15–16 (CLI, Terraform, incidents) in a sandbox AWS account.
3. Drill sections 20–21 (Q&A and answer framework) until you can answer without reading.
4. Use section 22 for last-day revision.

**Conventions**

- `<placeholder>` values and names such as `prod-web-asg` are examples. No real secrets, keys or account IDs appear here.
- **[MANDATORY]** marks a control you should never skip in production. **[OPTIONAL]** marks a design choice that depends on requirements and cost.
- Defaults, quotas and newer features change. Where that applies, the note says "verify in the current AWS documentation".

---

## Table of Contents

1. [What Is EC2 Auto Scaling](#1-what-is-ec2-auto-scaling)
2. [Core Components and Terminology](#2-core-components-and-terminology)
3. [How Auto Scaling Works Internally](#3-how-auto-scaling-works-internally)
4. [Capacity: Minimum, Desired and Maximum](#4-capacity-minimum-desired-and-maximum)
5. [Launch Templates](#5-launch-templates)
6. [Health Checks and Instance Replacement](#6-health-checks-and-instance-replacement)
7. [Scaling Policies](#7-scaling-policies)
8. [Cooldown, Warm-up and Health Check Grace Period](#8-cooldown-warm-up-and-health-check-grace-period)
9. [Metrics and Choosing a Scaling Signal](#9-metrics-and-choosing-a-scaling-signal)
10. [Lifecycle States and Lifecycle Hooks](#10-lifecycle-states-and-lifecycle-hooks)
11. [Termination Policies, Scale-in Protection and Suspended Processes](#11-termination-policies-scale-in-protection-and-suspended-processes)
12. [Instance Refresh, Warm Pools and Deployments](#12-instance-refresh-warm-pools-and-deployments)
13. [Spot Instances and Mixed Instances Policy](#13-spot-instances-and-mixed-instances-policy)
14. [Load Balancers, Networking and Security](#14-load-balancers-networking-and-security)
15. [Hands-On: CLI and Terraform](#15-hands-on-cli-and-terraform)
16. [Production Troubleshooting Scenarios](#16-production-troubleshooting-scenarios)
17. [Security, Reliability and Best Practices](#17-security-reliability-and-best-practices)
18. [Comparison Tables](#18-comparison-tables)
19. [Enterprise Reference Architecture](#19-enterprise-reference-architecture)
20. [Interview Questions and Answers](#20-interview-questions-and-answers)
21. [Interview Answer Framework](#21-interview-answer-framework)
22. [Quick Revision](#22-quick-revision)

---

## 1. What Is EC2 Auto Scaling

### 1.1 Definition

1. **Amazon EC2 Auto Scaling** is an AWS service that **automatically maintains the number of EC2 instances you want** and **adjusts that number** according to demand, schedules and health.
2. You define an **Auto Scaling group (ASG)** with a minimum, desired and maximum size, a **launch template** that describes how to launch instances, and optional **scaling policies**.
3. The service launches instances when capacity is needed, terminates them when it is not, and **replaces unhealthy instances**.
4. EC2 Auto Scaling itself has **no extra charge**. You pay for the EC2 resources, CloudWatch alarms and other services it uses.

### 1.2 Why it is needed

1. **High availability:** replace failed instances and spread capacity across Availability Zones (AZs).
2. **Scalability and elasticity:** add capacity for peaks, remove it afterwards.
3. **Cost optimisation:** do not pay for idle servers. Use Spot and right-sized fleets.
4. **Fault recovery:** self-healing without a human on call for every instance failure.
5. **Consistency:** every instance is created from the same versioned template.
6. **Automation:** fewer manual EC2 operations, and safe rolling changes with instance refresh.

### 1.3 Example

An application normally needs 2 instances, and a sale pushes traffic up.

| Situation | Capacity |
| --- | --- |
| Normal traffic | 2 instances |
| Sale traffic | Scale out to 6 |
| Traffic falls | Scale in to 2 |
| An instance fails its health check | Replaced automatically |

The numbers are illustrative. The scaling policy and your limits decide the real values.

### 1.4 Scaling vocabulary

1. **Scale out / scale in** (horizontal): add or remove instances. This is what Auto Scaling does.
2. **Scale up / scale down** (vertical): change the size of one instance. Auto Scaling does **not** do this by itself. You change the instance type in the launch template and roll it out (for example with instance refresh).
3. **Scalability** = ability to handle growth. **Elasticity** = automatic scale out **and** in with demand.

### 1.5 What Auto Scaling is not

1. It does not fix a slow database or a downstream bottleneck by adding web servers.
2. It does not make a stateful application stateless.
3. It does not guarantee capacity. EC2 capacity, quotas and the group maximum all limit it.

### 1.6 Interview pointers

Q1 (what and why), Q4 (scale out vs scale up).

---

## 2. Core Components and Terminology

| Component | Purpose |
| --- | --- |
| **Auto Scaling group (ASG)** | Logical group of EC2 instances managed as one unit, with min/desired/max capacity |
| **Launch template** | Versioned recipe for new instances: AMI, instance type, security groups, IAM profile, user data, storage, metadata options |
| **Scaling policy** | Rule for how capacity changes (target tracking, step, simple, scheduled, predictive) |
| **CloudWatch alarm / metric** | Signal that triggers or drives a policy |
| **Health check** | Decides whether an instance is healthy (EC2 status, load balancer, custom) |
| **Load balancer + target group** | Spread traffic to healthy instances. ASG registers and deregisters instances |
| **Lifecycle hook** | Pauses an instance during launch or termination so you can run custom actions |
| **Termination policy** | Rules that choose which instance to remove on scale in |
| **Instance refresh** | Rolling replacement of instances to apply a new AMI or template |
| **Warm pool** | Pre-initialised instances held ready for faster scale out |
| **Scheduled action** | Time-based change of min, max or desired capacity |
| **Mixed instances policy** | Multiple instance types and On-Demand/Spot purchase options in one ASG |
| **Service-linked role** | `AWSServiceRoleForAutoScaling`, the role Auto Scaling uses to call EC2, ELB and CloudWatch for you |

### 2.1 Architecture

```text
                           Users
                             |
                   Application Load Balancer
                             |  health checks + traffic
                    +--------+--------+
                    v                 v
                AZ-a subnet       AZ-b subnet
              [EC2] [EC2]        [EC2] [EC2]      <- instances of ONE Auto Scaling group
                    ^
                    | launches / terminates / replaces
        +-----------+-------------------------+
        |        Auto Scaling group           |
        |  min / desired / max                |
        |  launch template (AMI, type, SG..)  |
        +-----------+-------------------------+
                    ^
                    | scaling policies <- CloudWatch alarms / metrics (CPU, requests per target, queue depth)
```

### 2.2 Interview pointers

Q2 (components).

---

## 3. How Auto Scaling Works Internally

### 3.1 The control loop (step by step)

1. You set min, desired and max and the policies.
2. **CloudWatch** receives metrics (EC2, ALB, custom). For target tracking, Auto Scaling creates and manages the alarms itself.
3. When a policy decides capacity should change, it **changes the desired capacity** (within min and max).
4. The ASG notices that **current capacity differs from desired** and acts:
   1. **Scale out:** launch instances from the launch template into chosen subnets (AZs).
   2. **Scale in:** pick instances using the termination policy, deregister from the load balancer, terminate.
5. New instances go through **Pending** to **InService** (and through lifecycle hooks if configured), and are registered with the target group.
6. **Health checks** run continuously. An unhealthy instance is **replaced**.
7. The ASG also **rebalances** across AZs if they become uneven.

### 3.2 Instance lifecycle states

```text
Pending -> (Pending:Wait -> Pending:Proceed, if a launch hook exists) -> InService
InService -> Terminating -> (Terminating:Wait -> Terminating:Proceed, if a termination hook exists) -> Terminated

Other paths: InService <-> Standby (temporarily out of service), Detaching/Detached, EnteringStandby,
             Warmed:* states (warm pool)
```

### 3.3 Scaling processes (can be suspended)

| Process | What it does |
| --- | --- |
| `Launch` / `Terminate` | Add or remove instances |
| `HealthCheck` | Check instance health |
| `ReplaceUnhealthy` | Replace instances marked unhealthy |
| `AZRebalance` | Rebalance instances across AZs |
| `AlarmNotification` | Accept alarm actions for scaling policies |
| `ScheduledActions` | Run scheduled actions |
| `AddToLoadBalancer` | Register new instances with the load balancer |
| `InstanceRefresh` | Perform instance refresh |

Suspending processes is a **debugging and maintenance tool**. A forgotten suspended process (for example `Launch` or `AlarmNotification`) silently stops scaling. See section 16, scenario A1.

### 3.4 Multi-AZ behaviour and rebalancing

1. You give the ASG subnets in several AZs (`VPCZoneIdentifier`). It tries to keep instances **evenly balanced**.
2. If an AZ fails or has no capacity, the ASG launches instances in the other AZs.
3. If AZs become uneven (for example after an AZ recovers), **AZ rebalancing** launches new instances in the under-used AZ and then terminates old ones (launch before terminate), so capacity is not reduced.
4. The maximum can be briefly exceeded during rebalancing (verify the allowed overage in the documentation).

### 3.5 Failure behaviour

1. If a launch fails (no capacity, bad parameter, quota), the ASG **retries**, with increasing delays after repeated failures, and records the failure in **scaling activities**.
2. Always read the **scaling activity history** first when "Auto Scaling is not working".

### 3.6 Interview pointers

Q7 (multi-AZ and rebalancing), Q22 (suspended processes).

---

## 4. Capacity: Minimum, Desired and Maximum

### 4.1 Definitions

| Setting | Meaning |
| --- | --- |
| **Minimum** | The group will not go below this through scaling policies. Failed instances are replaced to stay at or above it |
| **Desired** | The number of instances the group is **trying** to run right now. Policies change this value |
| **Maximum** | The upper limit. No scaling action goes above it |

### 4.2 Example

Minimum 2, desired 3, maximum 8.

| Situation | Outcome |
| --- | --- |
| Normal demand | 3 instances |
| High demand | Scale out to 5 |
| Very high demand | Up to 8, never more |
| Low demand | Scale in, never below 2 |
| One unhealthy instance | Replaced to restore the desired count |

### 4.3 Important points

1. Min, desired and max set the **boundaries and the target**. They do not decide **when** to scale. Policies do.
2. **Maximum too low** is the most common reason scaling "stops". The group is already at its cap.
3. **Maximum too high** with a broken metric can cause an expensive runaway. Use a sensible cap and a budget alarm.
4. Setting `min = max = desired` gives a **fixed-size self-healing group**. That is valid for something like a single bastion or a fixed license-limited fleet, but it is **not** elastic scaling.
5. Manually changing desired capacity fights with policies. Make permanent changes in the policy or infrastructure code, and in Terraform consider `ignore_changes = [desired_capacity]` when policies manage it.
6. Capacity can also be expressed in **weights** (instance weighting, for example vCPUs) when using mixed instance types (verify in the documentation).
7. **Capacity Rebalancing** and **default instance warm-up** are separate settings (sections 8 and 13).

### 4.4 Interview pointers

Q3 (min/desired/max).

---

## 5. Launch Templates

### 5.1 What it is

A **launch template** stores the settings used to launch EC2 instances. It supports **versions**. The ASG points at a template and a version (a number, `$Latest` or `$Default`).

### 5.2 What it contains

1. **AMI ID** (the image), **instance type** (or overrides in a mixed policy).
2. **Security groups**, **IAM instance profile**, **key pair** (avoid, prefer Session Manager).
3. **User data** (bootstrap script), **block device mappings** (root and data volumes, encryption).
4. **Metadata options:** `HttpTokens=required` to enforce **IMDSv2**, hop limit.
5. **Network interface settings**, **tag specifications** for instances and volumes, monitoring (detailed monitoring), placement and credit specification.

### 5.3 Launch template vs launch configuration

| Feature | Launch template | Launch configuration (legacy) |
| --- | --- | --- |
| Versions | Yes | No (immutable, create a new one) |
| Mixed instances, Spot with multiple types | Yes | No |
| Newer EC2 features | Yes | No |
| Status | **Recommended** | **Deprecated.** AWS stopped allowing new launch configurations for new accounts and recommends migration. Verify the current status |

### 5.4 Template versions and rollouts

1. Changing a template creates a **new version**. Existing instances are **not** changed.
2. New instances use the version the ASG references. If the ASG uses `$Latest`, a new version affects **future launches** immediately, which can surprise you. Prefer a **pinned version number** in production, and roll out intentionally with **instance refresh**.
3. In Terraform, referencing `latest_version` updates the ASG, and an `instance_refresh` block can roll instances automatically.

### 5.5 Production notes

1. **[MANDATORY]** Enforce IMDSv2 (`http_tokens = required`).
2. **[MANDATORY]** Use an **instance profile** (role), not keys in user data.
3. Use **encrypted EBS volumes**. If you use a **customer-managed KMS key**, the Auto Scaling **service-linked role** needs access through the key policy or a grant. Missing it causes launch failures (see scenario A3).
4. Build a **golden AMI** (pre-installed software) to shorten boot time. Keep user data small. Fetch config at boot from SSM Parameter Store or Secrets Manager.
5. Tag instances (`app`, `env`, `owner`) for cost allocation.

### 5.6 Common mistakes

1. User data that takes 10 minutes, so the health check grace period expires first.
2. AMI from another Region or an AMI that was deleted or not shared.
3. Security group from a different VPC than the subnets.
4. Using `$Latest` and shipping an untested template to production by accident.

### 5.7 Interview pointers

Q5 (launch template vs configuration), Q25 (security).

---

## 6. Health Checks and Instance Replacement

### 6.1 Health check types

| Type | What it checks | Notes |
| --- | --- | --- |
| **EC2** (default) | EC2 instance status (instance state, system and instance status checks) | Does **not** know if your application is working |
| **ELB** | The load balancer's target health check (HTTP, TCP) | **Must be enabled** on the ASG (`HealthCheckType=ELB`). Detects application failure |
| **VPC Lattice / EBS** | Other integrations (verify availability) | |
| **Custom** | Your own system calls `set-instance-health` | For application-level checks outside the load balancer |

### 6.2 How replacement works

1. A health check marks an instance **Unhealthy**.
2. The `ReplaceUnhealthy` process **terminates** the instance and launches a replacement (the default order is terminate then launch, so capacity briefly drops. Verify any newer replacement-behaviour settings).
3. If the instance is registered with a load balancer, it is **deregistered** first and connections drain according to the **deregistration delay**.

### 6.3 Health check grace period

1. A timer that starts when an instance enters **InService**. During it, the ASG **ignores** failing health checks, giving the application time to start.
2. **Too short:** healthy-to-be instances are killed before they finish booting, causing a **launch-terminate loop**.
3. **Too long:** a really broken instance stays in the group longer.
4. Set it a bit longer than your typical boot-and-warm-up time. The default differs between the console and the API/CLI (console 300 seconds, API default 0). Set it explicitly.

### 6.4 Good health endpoints

1. Return **200 quickly** and check **local readiness** (process up, can serve).
2. Do **not** make the health check depend on every downstream system. If the database is down, **all** instances fail and the ASG replaces the whole fleet, which makes the outage worse.
3. Use a **deep health check** only for monitoring and alerts, not for instance replacement.

### 6.5 Common mistakes

1. Leaving health checks as EC2-only behind an ALB, so a hung application stays in the group.
2. Grace period shorter than boot time.
3. Health endpoint that checks the database, causing mass replacement during a database incident.
4. Security group or NACL that blocks the load balancer from reaching the health check port.

### 6.6 Interview pointers

Q6 (EC2 vs ELB health), Q28 (launch-terminate loop).

---

## 7. Scaling Policies

### 7.1 Overview

| Policy | Decides by | Best for |
| --- | --- | --- |
| **Target tracking** | Keep a metric near a target value | **Default choice** for most workloads |
| **Step scaling** | Bigger adjustment for a bigger alarm breach | Fine-grained control, custom metrics |
| **Simple scaling** | One adjustment per alarm, then cooldown | Legacy, mostly replaced by step/target tracking |
| **Scheduled** | Time-based min/max/desired changes | Predictable patterns (office hours, sales) |
| **Predictive** | Machine-learning forecast of load from history | Recurring cyclic patterns, with slow-launching instances |

### 7.2 Target tracking (most important)

1. **What:** You pick a metric and a **target value** (for example average CPU 50%, or 1,000 requests per target). Auto Scaling **creates and manages the CloudWatch alarms** and adjusts capacity to keep the metric near the target, like a thermostat.
2. **Predefined metrics:** `ASGAverageCPUUtilization`, `ASGAverageNetworkIn`, `ASGAverageNetworkOut`, `ALBRequestCountPerTarget`. You can also use a **custom metric** (for example queue backlog per instance).
3. **Behaviour:**
   1. **Scale out** is aggressive: capacity is added proportionally to how far the metric is above the target.
   2. **Scale in** is conservative: it removes capacity only when the metric stays well below the target, to avoid dropping too far.
   3. If a metric has **insufficient data**, target tracking does **not scale in**.
   4. With **several target tracking policies**, the group **scales out if any policy** wants to, and **scales in only if all policies** agree.
4. **Do not edit or delete** the alarms that target tracking creates. Change the policy instead.
5. A metric used for target tracking must **change inversely with capacity** (more instances means a lower value per instance). Total request count does not work. **Requests per target** does.
6. **ALBRequestCountPerTarget** needs a `ResourceLabel` of the form `app/<alb-name>/<id>/targetgroup/<tg-name>/<id>`.
7. Scale-in can be disabled in a policy (`DisableScaleIn`) if you want a different mechanism to scale in.

```text
Target: average CPU = 50%.   Current 80% with 4 instances
=> needed capacity ~ 4 x 80/50 = 6.4 -> scale out toward 7 (bounded by max)
```

### 7.3 Step scaling

1. A CloudWatch alarm triggers a policy with **steps**: different adjustments for different breach sizes.
2. Example: CPU 60–70% add 1, 70–85% add 2, above 85% add 4.
3. It **keeps responding** while the alarm stays in the breach state (using the instance warm-up to avoid over-counting new instances).
4. You manage the **alarms and thresholds** yourself. More control, more work.

### 7.4 Simple scaling

1. One alarm, one fixed adjustment, then a **cooldown** (default 300 seconds) during which no further simple scaling occurs.
2. It reacts slowly to big spikes because it waits for the cooldown. AWS recommends **target tracking or step scaling** instead.

### 7.5 Scheduled scaling

1. Change min, max or desired at a **specific time or recurrence** (cron), optionally with a time zone.
2. Example: raise the minimum to 10 at 08:30 on weekdays, lower it to 2 at 20:00.
3. Combine with dynamic policies: schedule moves the **baseline**, policies handle surprises.
4. Remember that a scheduled action to **lower** the minimum does not remove instances faster than scale-in rules allow. The group scales in through the normal process.

### 7.6 Predictive scaling

1. Uses **machine learning on up to 14 days of history** (verify) of load metrics to **forecast** demand and schedule capacity **ahead** of time.
2. Modes: **forecast only** (to evaluate) and **forecast and scale**.
3. Works best for **recurring daily/weekly patterns**. It complements, not replaces, target tracking (which handles unexpected load).
4. Needs enough history and a metric that scales with capacity. Newly created groups lack data.

### 7.7 Combining policies

1. Typical production: **target tracking** (ALB requests per target) + **scheduled** baseline + **predictive** for cyclical traffic + sensible **max**.
2. When several policies disagree, the ASG uses the policy that gives the **largest capacity** for scale out.

### 7.8 Common mistakes

1. Using simple scaling with a long cooldown for spiky traffic.
2. Using total request count (not per target) as a target tracking metric.
3. Manually editing target-tracking alarms.
4. Setting the target too high (for example 90% CPU) with no headroom, so latency suffers before capacity arrives.
5. No `max` limit.

### 7.9 Interview pointers

Q9 (policy types), Q10 (target tracking), Q11 (step vs simple), Q12 (scheduled and predictive).

---

## 8. Cooldown, Warm-up and Health Check Grace Period

These three are **commonly confused**.

| Setting | What it controls | Applies to |
| --- | --- | --- |
| **Default cooldown** | Time after a scaling activity during which **simple scaling** will not launch or terminate more instances (default 300 seconds) | Simple scaling policies |
| **Instance warm-up** | Time a **new instance** needs before its metrics are counted in the group's aggregate (CPU and so on) | Target tracking, step scaling, instance refresh |
| **Health check grace period** | Time after an instance becomes InService during which **health check failures are ignored** | Health checks |

### 8.1 Why warm-up matters

1. A new instance has **low CPU** while booting. If its metrics were counted immediately, the average would drop and the group could think it has too much capacity and **scale in too early**, or fail to count that new capacity and **over-scale out**.
2. **Default instance warm-up** (a group-level setting, recommended over per-policy values and cooldowns) makes all dynamic policies and instance refresh use one consistent warm-up value.
3. Set it to your **real time to become useful** (boot, bootstrap, caches warm).

### 8.2 Related ELB settings

1. **Deregistration delay** (target group, default 300 seconds): how long the load balancer lets in-flight requests finish before an instance is fully removed. Set it to your longest normal request duration plus margin.
2. **Slow start** (target group): gradually increase traffic to a newly registered target.

### 8.3 Common mistakes

1. Warm-up much shorter than real boot time, causing over-scaling or flapping.
2. Using a long cooldown to hide a bad policy.
3. Deregistration delay of 300 seconds with a 5-second API, which slows scale in and rolling updates needlessly (or too short for long uploads, which cuts requests).

### 8.4 Interview pointers

Q13 (cooldown vs warm-up vs grace period).

---

## 9. Metrics and Choosing a Scaling Signal

### 9.1 Where metrics come from

1. **EC2 metrics** in CloudWatch: `CPUUtilization`, `NetworkIn/Out`, `DiskReadOps` and so on. **Basic monitoring** publishes every 5 minutes. **Detailed monitoring** every 1 minute (extra cost). For responsive scaling, use detailed monitoring.
2. **ALB metrics:** `RequestCountPerTarget`, `TargetResponseTime`, `HTTPCode_Target_5XX_Count`.
3. **ASG group metrics** (must be enabled, 1-minute granularity): `GroupMinSize`, `GroupMaxSize`, `GroupDesiredCapacity`, `GroupInServiceInstances`, `GroupPendingInstances`, `GroupTerminatingInstances`, `GroupTotalInstances` and, with weights, capacity-unit metrics.
4. **Custom metrics:** memory (CloudWatch agent), queue depth (SQS), business metrics.

### 9.2 Choosing the right metric

| Workload type | Good metric | Why |
| --- | --- | --- |
| CPU-bound service | Average CPU | Directly reflects load |
| Web or API behind ALB | **Requests per target** | Reflects demand independent of CPU efficiency |
| Queue workers | **Backlog per instance** (queue length divided by running instances) | Reflects work waiting |
| Memory-bound | Custom memory metric from the CloudWatch agent | CPU may stay low |
| Latency-sensitive | Latency via step scaling or custom metric (carefully) | Latency also depends on downstream systems |

### 9.3 Why CPU is not always the answer

If a web app is slow because the **database** is slow, CPU can stay at 25%. Adding web servers does not help and may increase database load. Scale on the **real bottleneck** and monitor the whole chain (database latency, connection pools, queue backlog, response time).

### 9.4 Backlog-per-instance example (SQS workers)

1. Acceptable backlog per instance = (acceptable latency) / (average processing time per message). Example: 60 s latency target, 2 s per message gives 30 messages per instance.
2. Publish `BacklogPerInstance = ApproximateNumberOfMessagesVisible / GroupInServiceInstances` as a custom metric every minute.
3. Create a **target tracking** policy with target value 30 on that metric.
4. Add **scale-in protection** or a **lifecycle hook** so busy workers finish messages before termination.

### 9.5 Interview pointers

Q18 (choosing metrics), Q20 (SQS workers).

---

## 10. Lifecycle States and Lifecycle Hooks

### 10.1 What it is

**Lifecycle hooks** pause an instance at a transition so you can run custom actions.

| Transition | Hook state |
| --- | --- |
| Launching (`autoscaling:EC2_INSTANCE_LAUNCHING`) | `Pending:Wait` then `Pending:Proceed` |
| Terminating (`autoscaling:EC2_INSTANCE_TERMINATING`) | `Terminating:Wait` then `Terminating:Proceed` |

### 10.2 How it works (step by step)

1. The ASG starts a launch or termination and the instance enters the **Wait** state.
2. A **notification** is sent (EventBridge, SNS or SQS), or the instance itself reads its state.
3. Your automation runs (Lambda, SSM Automation, script on the instance).
4. The automation calls **`complete-lifecycle-action`** with `CONTINUE` or `ABANDON`.
5. If it needs more time, it calls **`record-lifecycle-action-heartbeat`** to extend the wait.
6. If nobody responds before the **heartbeat timeout** (default 3600 seconds, and an overall limit applies, verify), the **default result** (`CONTINUE` or `ABANDON`) is applied.

### 10.3 Use cases

**Launch hook:** install a security agent, join a cluster, pull configuration, register with a service discovery system, run a smoke test before taking traffic.

**Termination hook:** finish or hand over in-flight jobs, flush logs and metrics, deregister from a service registry, take a diagnostic snapshot, **drain a queue worker**.

### 10.4 Important points

1. A hook does **not** make an instance healthy and does not guarantee your script succeeds. Configure **timeouts and the default result** carefully. For launch hooks, `ABANDON` terminates the instance. For termination hooks, `CONTINUE` is usually the safe default so scale in is not blocked forever.
2. During `Pending:Wait` the instance is **not yet** InService and is **not registered** with the load balancer.
3. **Instances in Wait states still cost money.** Long waits slow scaling and rolling updates.
4. Hooks also run during **instance refresh** and **AZ rebalancing** replacements.
5. Make automation **idempotent** and **monitored**. A broken hook can stall the whole group.

```bash
aws autoscaling put-lifecycle-hook \
  --auto-scaling-group-name prod-web-asg \
  --lifecycle-hook-name drain-before-terminate \
  --lifecycle-transition autoscaling:EC2_INSTANCE_TERMINATING \
  --heartbeat-timeout 300 \
  --default-result CONTINUE
```

### 10.5 Lifecycle hooks vs health checks

| Lifecycle hooks | Health checks |
| --- | --- |
| Pause transitions for custom actions | Detect whether an instance is healthy |
| Support initialisation and graceful shutdown | Decide whether replacement is needed |
| Coordinate automation | Do not run arbitrary scripts |

### 10.6 Common mistakes

1. No default result thought through, so failed automation blocks scaling.
2. Hook timeout shorter than the real work.
3. Forgetting that the instance is billed while waiting.
4. Not completing the action on error paths.

### 10.7 Interview pointers

Q15 (lifecycle hooks).

---

## 11. Termination Policies, Scale-in Protection and Suspended Processes

### 11.1 Termination policies

When the group must remove an instance, the termination policy chooses which one.

| Policy | Idea |
| --- | --- |
| **Default** | Balance AZs first, then prefer instances on the oldest launch template or configuration, then those closest to the next billing hour (verify the exact order) |
| `OldestInstance` | Prefer the oldest instance |
| `NewestInstance` | Prefer the newest (useful when testing) |
| `OldestLaunchTemplate` | Prefer instances from the oldest template version |
| `ClosestToNextInstanceHour` | Closest to the next billing hour (less relevant with per-second billing) |
| `AllocationStrategy` | Align with the Spot/On-Demand allocation strategy in mixed groups |
| Custom Lambda | Your own selection logic (verify availability) |

AWS applies **AZ balance first** in most cases, so the policy picks **within** the AZ that needs to shrink. Do not rely on a policy as a guarantee of exactly which instance is removed.

### 11.2 Instance scale-in protection

1. Protects an instance from being chosen during **normal scale in** (and rebalancing replacement in some cases).
2. Useful for a worker that is processing a long job. Set protection at job start, remove at job end.
3. It does **not** protect from health-check replacement, Spot interruption, manual termination or instance refresh unless configured (instance refresh has its own handling, verify).
4. Too many protected instances **block scale in**, and the group can stay over-provisioned (cost).

### 11.3 Suspending processes, Standby and Detach

1. **Suspend** specific processes (for example `ReplaceUnhealthy`, `AZRebalance`, `AlarmNotification`) during maintenance or debugging. Always resume and track it.
2. **Standby:** move an instance out of service temporarily (it is deregistered from the load balancer, and capacity is not replaced if you choose to decrement desired). Use it to debug or patch an instance without it being replaced.
3. **Detach:** remove the instance from the group (optionally decrementing desired capacity). **Attach** an existing instance to add it.

```bash
aws autoscaling enter-standby --auto-scaling-group-name prod-web-asg \
  --instance-ids i-0123456789abcdef0 --should-decrement-desired-capacity
# ... debug ...
aws autoscaling exit-standby --auto-scaling-group-name prod-web-asg --instance-ids i-0123456789abcdef0
```

### 11.4 Common mistakes

1. Debugging by suspending `Launch` or `HealthCheck`, then forgetting to resume.
2. Permanently protecting instances.
3. Assuming the termination policy overrides AZ balancing.

### 11.5 Interview pointers

Q14 (termination policy and protection), Q22 (suspend, standby, detach).

---

## 12. Instance Refresh, Warm Pools and Deployments

### 12.1 Instance refresh

1. **What:** A managed **rolling replacement** of the instances in an ASG, used to roll out a new AMI, launch template version or configuration change.
2. **How it works:**
   1. You change the launch template (for example a new AMI) and start an instance refresh.
   2. Auto Scaling replaces instances in **batches**, keeping at least **MinHealthyPercentage** healthy (for example 90%).
   3. Each new instance must pass health checks and the **instance warm-up** before the next batch.
   4. You can set **checkpoints** (pause at a percentage for validation), **skip matching** (do not replace instances already on the desired configuration), and **automatic rollback** on failure with alarms (verify availability).
3. **Key settings:** `MinHealthyPercentage`, optionally `MaxHealthyPercentage` (allow temporary extra capacity so replacement is launch-first), `InstanceWarmup`, `CheckpointPercentages`, `CheckpointDelay`, `ScaleInProtectedInstances`, `StandbyInstances`.
4. **Pre-requisites for safe rollout:** ELB health checks enabled, realistic warm-up, a working health endpoint, enough headroom.

```bash
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name prod-web-asg \
  --preferences '{"MinHealthyPercentage":90,"InstanceWarmup":180,"CheckpointPercentages":[20,50,100],"CheckpointDelay":300}'

aws autoscaling describe-instance-refreshes --auto-scaling-group-name prod-web-asg
aws autoscaling cancel-instance-refresh   --auto-scaling-group-name prod-web-asg   # if something looks wrong
```

### 12.2 Deployment strategies with ASGs

| Strategy | How | Pros | Cons |
| --- | --- | --- | --- |
| **Instance refresh (rolling)** | Replace instances in batches | Simple, built in, no extra infrastructure | Mixed versions during rollout, slower rollback |
| **Blue/green with two ASGs** | New ASG with new AMI behind a second target group, then shift ALB listener weights | Fast rollback, test before switching | Double capacity temporarily, more automation |
| **Canary** | Weighted target groups (for example 5% to the new ASG) | Limit risk | More moving parts |
| **CodeDeploy in-place / blue-green** | Deploy application revisions to ASG instances | Application-level control | CodeDeploy agent and setup |
| **Immutable AMI (golden image) + refresh** | Bake AMI per release | Reproducible | Needs an AMI pipeline |

### 12.3 Warm pools

1. A **warm pool** keeps a set of **pre-initialised instances** (in `Stopped`, `Running` or `Hibernated` state) ready so scale out is much faster than a full cold boot.
2. Good for applications with **long initialisation** (large caches, heavy bootstrap) where you cannot shorten boot time with an AMI.
3. Trade-offs: you pay for **stopped instance storage** (and for running or hibernated instances at their respective costs), and the design adds complexity (lifecycle hooks run on warm-pool transitions). Verify current limits and pricing.
4. Alternatives to reduce launch time: golden AMI, smaller user data, predictive scaling, scale-out headroom (lower target).

### 12.4 Maximum instance lifetime

1. You can set a **maximum instance lifetime** (up to 1 year) so instances are replaced regularly, helping with patching and configuration drift.
2. Replacement follows the same safe-replacement rules. Plan capacity headroom.

### 12.5 Common mistakes

1. Using `$Latest` and expecting a controlled rollout without an instance refresh.
2. Low MinHealthyPercentage on a small group, causing an outage during refresh.
3. Instance refresh with no ELB health checks, so it believes bad instances are fine.
4. No rollback plan (cancel, revert template version, refresh back).

### 12.6 Interview pointers

Q16 (instance refresh), Q19 (warm pools), Q21 (deployment strategies), Q31 (refresh stuck).

---

## 13. Spot Instances and Mixed Instances Policy

### 13.1 Spot basics

1. **Spot Instances** use spare EC2 capacity at a large discount, but AWS can **reclaim** them with a **two-minute interruption notice**.
2. Good for **stateless, fault-tolerant, flexible** workloads: CI/CD agents, batch jobs, web tiers with enough On-Demand base, containers.
3. Not good for a single stateful database or anything that cannot tolerate sudden loss.

### 13.2 Mixed instances policy

1. An ASG can use **several instance types** and combine **On-Demand and Spot**.
2. **Key settings:**
   1. `OnDemandBaseCapacity`: a fixed number of On-Demand instances (the guaranteed base).
   2. `OnDemandPercentageAboveBaseCapacity`: percentage of On-Demand beyond the base (the rest is Spot).
   3. `SpotAllocationStrategy`: **`price-capacity-optimized`** is the usual recommendation (balances price and interruption risk). `capacity-optimized` favors pools with spare capacity. `lowest-price` is **not** recommended for most uses.
   4. **Instance type overrides** or **attribute-based instance type selection** (specify vCPU/memory ranges and let AWS choose types).
   5. **Capacity Rebalancing:** proactively launch a replacement when AWS signals a Spot instance is at elevated risk (a **rebalance recommendation**), then terminate the old one.
3. **Diversify** across many instance types, sizes and AZs. A single type in a single AZ is a single capacity pool and is interrupted together.

### 13.3 Handling interruptions

1. Watch the **interruption notice** (instance metadata or EventBridge) and **drain**: stop accepting new work, finish or checkpoint jobs, deregister from the load balancer.
2. Use a **lifecycle termination hook** and idempotent job design.
3. Keep an **On-Demand base** for critical capacity.
4. Auto Scaling **tries** to replace interrupted capacity, but replacement depends on available Spot capacity and your settings.

### 13.4 Example mixed policy

```text
OnDemandBaseCapacity = 2                      (always 2 On-Demand)
OnDemandPercentageAboveBaseCapacity = 30      (above the base: 30% On-Demand, 70% Spot)
SpotAllocationStrategy = price-capacity-optimized
Instance types = m6i.large, m5.large, m6a.large, m5a.large, c6i.xlarge ...  (similar size family)
CapacityRebalance = true
```

### 13.5 Common mistakes

1. Spot with one instance type.
2. No On-Demand base for critical services.
3. No interruption handling.
4. Mixing very different instance sizes without weights, causing unbalanced capacity.

### 13.6 Interview pointers

Q17 (Spot and mixed instances), Q33 (Spot interruptions).

---

## 14. Load Balancers, Networking and Security

### 14.1 ASG with an Application Load Balancer

1. Attach one or more **target groups** to the ASG. The ASG **registers** new instances and **deregisters** terminating ones automatically.
2. Enable **ELB health checks** on the ASG so unhealthy targets are replaced.
3. **Request flow:** user -> ALB (public subnets) -> healthy target in the ASG (private subnets) -> backend services.

### 14.2 Networking design

1. Put the ASG in **private subnets** across at least **two AZs** (three for critical services).
2. Size subnets with enough free IP addresses for scale-out (remember AWS reserves 5 per subnet).
3. Outbound access (patching, package repositories, APIs) through **NAT Gateways** (one per AZ) or **VPC endpoints** (S3, ECR, SSM, CloudWatch Logs).
4. Use **Session Manager** for admin access. No inbound SSH.

### 14.3 Security group design

| Group | Inbound rule |
| --- | --- |
| ALB SG | HTTPS 443 from approved clients |
| Instance SG | Application port **from the ALB SG only** |
| Database SG | DB port from the instance SG only |

Common mistake: opening the application port (for example 8080) to the whole internet on every instance.

### 14.4 IAM and the service-linked role

1. Instances use an **instance profile** with least-privilege permissions (for example SSM core, CloudWatch agent, specific S3 or Secrets Manager access).
2. Auto Scaling uses the **service-linked role** `AWSServiceRoleForAutoScaling` to act on your behalf.
3. If you use an encrypted AMI or EBS volumes with a **customer-managed KMS key**, grant that service-linked role access (key policy or grant), otherwise launches fail.
4. Anyone allowed to **pass a role** (`iam:PassRole`) when creating a launch template can attach a powerful instance profile. Restrict it.

### 14.5 Interview pointers

Q8 (ASG with ALB), Q25 (security).

---
## 15. Hands-On: CLI and Terraform

### 15.1 AWS CLI: investigation and operations

Prerequisites: AWS CLI v2, SSO or role-based authentication, and the right Region. **Always** confirm the account first.

```bash
aws sts get-caller-identity                      # which account and role am I using?
export AWS_REGION=ap-south-1                     # placeholder
ASG=prod-web-asg                                 # placeholder

# ---- Read-only: what is the group doing? ----
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names $ASG \
  --query 'AutoScalingGroups[0].{Min:MinSize,Desired:DesiredCapacity,Max:MaxSize,HC:HealthCheckType,Grace:HealthCheckGracePeriod,Warmup:DefaultInstanceWarmup,AZs:AvailabilityZones,Suspended:SuspendedProcesses[].ProcessName,TGs:TargetGroupARNs}' \
  --output json

aws autoscaling describe-auto-scaling-instances \
  --query "AutoScalingInstances[?AutoScalingGroupName=='$ASG'].{Id:InstanceId,AZ:AvailabilityZone,State:LifecycleState,Health:HealthStatus,Protected:ProtectedFromScaleIn}" \
  --output table

# MOST USEFUL when "scaling is not working": why did launches or terminations happen or fail?
aws autoscaling describe-scaling-activities --auto-scaling-group-name $ASG --max-items 20 \
  --query 'Activities[].{Time:StartTime,Status:StatusCode,Cause:Cause,Msg:StatusMessage}' --output table

aws autoscaling describe-policies --auto-scaling-group-name $ASG --output json
aws autoscaling describe-scheduled-actions --auto-scaling-group-name $ASG --output table
aws autoscaling describe-lifecycle-hooks --auto-scaling-group-name $ASG --output json
aws autoscaling describe-instance-refreshes --auto-scaling-group-name $ASG --output table

# Alarms that drive scaling: state OK / ALARM / INSUFFICIENT_DATA
aws cloudwatch describe-alarms --query "MetricAlarms[?contains(AlarmName,'$ASG') || contains(AlarmName,'TargetTracking')].{Name:AlarmName,State:StateValue,Reason:StateReason}" --output table

# Which launch template version does the group use, and what is in it?
aws ec2 describe-launch-template-versions --launch-template-id lt-0123456789abcdef0 --versions '$Latest' '$Default'

# Account limits that can block scaling
aws autoscaling describe-account-limits
aws service-quotas get-service-quota --service-code ec2 --quota-code L-1216C47A   # Running On-Demand Standard instances (vCPUs); verify the code

# ---- Operations (these CHANGE things: confirm the target first) ----
aws autoscaling set-desired-capacity --auto-scaling-group-name $ASG --desired-capacity 4 --honor-cooldown
aws autoscaling update-auto-scaling-group --auto-scaling-group-name $ASG --min-size 2 --max-size 10
aws autoscaling enable-metrics-collection --auto-scaling-group-name $ASG --granularity "1Minute"
aws autoscaling set-instance-protection --auto-scaling-group-name $ASG \
  --instance-ids i-0123456789abcdef0 --protected-from-scale-in
aws autoscaling set-instance-health --instance-id i-0123456789abcdef0 --health-status Unhealthy
aws autoscaling suspend-processes --auto-scaling-group-name $ASG --scaling-processes AZRebalance
aws autoscaling resume-processes  --auto-scaling-group-name $ASG --scaling-processes AZRebalance
```

Notes:

1. `describe-scaling-activities` is the first stop for failures. Its `StatusMessage` names the real cause (no capacity, invalid parameter, KMS error, quota).
2. `set-desired-capacity` is a temporary override. A policy can change it again. Permanent changes belong in the policy or IaC.
3. `--honor-cooldown` only matters for simple scaling cooldowns.
4. The quota code above is an example. Verify codes in Service Quotas for your account.

### 15.2 A read-only diagnostic script (Bash)

```bash
#!/usr/bin/env bash
# asg-diagnose.sh <asg-name>
# Read-only: prints the facts you need when "traffic rose but the ASG did not scale".
set -euo pipefail

ASG="${1:?usage: $0 <asg-name>}"
command -v aws >/dev/null || { echo "aws CLI not found" >&2; exit 1; }

echo "== Identity =="
aws sts get-caller-identity --query '[Account,Arn]' --output text

echo; echo "== Capacity and settings =="
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "$ASG" \
  --query 'AutoScalingGroups[0].{Min:MinSize,Desired:DesiredCapacity,Max:MaxSize,InService:length(Instances[?LifecycleState==`InService`]),Suspended:SuspendedProcesses[].ProcessName,HC:HealthCheckType}' \
  --output table

echo; echo "== Last 10 scaling activities =="
aws autoscaling describe-scaling-activities --auto-scaling-group-name "$ASG" --max-items 10 \
  --query 'Activities[].[StartTime,StatusCode,Cause]' --output table

echo; echo "== Policies =="
aws autoscaling describe-policies --auto-scaling-group-name "$ASG" \
  --query 'ScalingPolicies[].[PolicyName,PolicyType,Enabled]' --output table

echo; echo "== Alarms not in OK state =="
aws cloudwatch describe-alarms --state-value ALARM INSUFFICIENT_DATA \
  --query 'MetricAlarms[].[AlarmName,StateValue]' --output table || true

echo; echo "Checklist: at Max? Suspended processes? INSUFFICIENT_DATA alarms? Failed activities (capacity, quota, KMS)?"
```

Why: it removes guesswork by showing capacity limits, suspended processes, recent failures, and alarm state in one pass, and it changes nothing.

### 15.3 Terraform: a production-style web tier (ALB + ASG)

**Assumptions**

- Terraform `>= 1.5`, AWS provider `~> 5.0` (verify current versions).
- An existing VPC with **public subnets** (for the ALB) and **private subnets** (for instances, with NAT or VPC endpoints for outbound access).
- An **ACM certificate** already issued in the same Region as the ALB.
- Amazon Linux 2023 demo app on port **8080**. Replace the user data with your real bootstrap.

**Folder structure**

```text
asg-web/
├── versions.tf
├── variables.tf
├── main.tf          # IAM, security groups, ALB, launch template, ASG, policies, schedule
├── outputs.tf
└── terraform.tfvars # environment values (no secrets)
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
  # Production: configure an encrypted remote backend with locking.
}

provider "aws" {
  region = var.region
}
```

**`variables.tf`**

```hcl
variable "region" {
  type    = string
  default = "ap-south-1" # placeholder
}

variable "name" {
  type        = string
  description = "Name prefix, for example prod-web"
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Subnets for the ALB (at least 2 AZs)"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Subnets for the instances (at least 2 AZs)"
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the HTTPS listener"
}

variable "allowed_client_cidrs" {
  type        = list(string)
  description = "Who may reach the ALB. Use specific ranges if the app is not public."
  default     = ["0.0.0.0/0"]
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "ami_id" {
  type        = string
  description = "Pinned AMI ID. Empty string uses the latest Amazon Linux 2023 at plan time."
  default     = ""
}

variable "min_size" {
  type    = number
  default = 2
}

variable "max_size" {
  type    = number
  default = 8
}

variable "app_port" {
  type    = number
  default = 8080
}
```

**`main.tf`**

```hcl
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

locals {
  ami_id = var.ami_id != "" ? var.ami_id : data.aws_ssm_parameter.al2023.value

  # Demo bootstrap. In production prefer a baked AMI and a tiny user data script.
  user_data = <<-EOT
    #!/bin/bash
    set -euxo pipefail
    dnf install -y nginx
    cat > /etc/nginx/conf.d/app.conf <<'CONF'
    server {
      listen ${var.app_port};
      location /healthz { return 200 "ok\n"; add_header Content-Type text/plain; }
      location /        { return 200 "hello from $hostname\n"; add_header Content-Type text/plain; }
    }
    CONF
    systemctl enable --now nginx
  EOT
}

# ---------------- IAM for instances (SSM Session Manager, no SSH keys) ----------------
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "instance" {
  name               = "${var.name}-instance-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "instance" {
  name = "${var.name}-instance-profile"
  role = aws_iam_role.instance.name
}

# ---------------- Security groups ----------------
resource "aws_security_group" "alb" {
  name_prefix = "${var.name}-alb-"
  description = "ALB: HTTPS in, app port to instances"
  vpc_id      = var.vpc_id

  lifecycle { create_before_destroy = true }
}

resource "aws_security_group" "app" {
  name_prefix = "${var.name}-app-"
  description = "Instances: app port from ALB only"
  vpc_id      = var.vpc_id

  lifecycle { create_before_destroy = true }
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  for_each          = toset(var.allowed_client_cidrs)
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = each.value
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_ingress_rule" "alb_http_redirect" {
  for_each          = toset(var.allowed_client_cidrs)
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = each.value
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_egress_rule" "alb_to_app" {
  security_group_id            = aws_security_group.alb.id
  referenced_security_group_id = aws_security_group.app.id
  ip_protocol                  = "tcp"
  from_port                    = var.app_port
  to_port                      = var.app_port
}

resource "aws_vpc_security_group_ingress_rule" "app_from_alb" {
  security_group_id            = aws_security_group.app.id
  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = var.app_port
  to_port                      = var.app_port
}

# Outbound for patching and AWS APIs (tighten with VPC endpoints and egress rules if policy requires)
resource "aws_vpc_security_group_egress_rule" "app_out" {
  security_group_id = aws_security_group.app.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# ---------------- Application Load Balancer ----------------
resource "aws_lb" "web" {
  name                       = "${var.name}-alb"
  load_balancer_type         = "application"
  internal                   = false
  subnets                    = var.public_subnet_ids
  security_groups            = [aws_security_group.alb.id]
  drop_invalid_header_fields = true
  # enable_deletion_protection = true   # recommended in production
}

resource "aws_lb_target_group" "web" {
  name                 = "${var.name}-tg"
  port                 = var.app_port
  protocol             = "HTTP"
  vpc_id               = var.vpc_id
  deregistration_delay = 60 # seconds. Set to longest normal request time plus margin.

  health_check {
    path                = "/healthz"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.web.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06" # verify the current recommended policy
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.web.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ---------------- Launch template ----------------
resource "aws_launch_template" "web" {
  name_prefix   = "${var.name}-lt-"
  image_id      = local.ami_id
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.instance.name
  }

  vpc_security_group_ids = [aws_security_group.app.id]
  user_data              = base64encode(local.user_data)

  monitoring {
    enabled = true # 1-minute EC2 metrics for faster scaling
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv2 only
    http_put_response_hop_limit = 1
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      encrypted             = true
      delete_on_termination = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.name}-web"
      Application = "web"
      ManagedBy   = "terraform"
    }
  }

  tag_specifications {
    resource_type = "volume"
    tags = {
      Application = "web"
      ManagedBy   = "terraform"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ---------------- Auto Scaling group ----------------
resource "aws_autoscaling_group" "web" {
  name                = "${var.name}-asg"
  min_size            = var.min_size
  max_size            = var.max_size
  desired_capacity    = var.min_size
  vpc_zone_identifier = var.private_subnet_ids
  target_group_arns   = [aws_lb_target_group.web.arn]

  health_check_type         = "ELB" # replace instances whose APPLICATION is unhealthy
  health_check_grace_period = 180   # a little longer than normal boot time
  default_instance_warmup   = 120   # seconds before a new instance's metrics count

  capacity_rebalance = false # set true when using Spot in a mixed instances policy
  termination_policies = ["OldestLaunchTemplate", "Default"]

  # Pinned numeric version: a template change updates the ASG, and instance_refresh rolls it out safely
  launch_template {
    id      = aws_launch_template.web.id
    version = aws_launch_template.web.latest_version
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 90
      instance_warmup        = 120
      checkpoint_percentages = [50, 100]
      checkpoint_delay       = 300
      auto_rollback          = true # verify support in your provider version
    }
  }

  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupPendingInstances",
    "GroupTerminatingInstances",
    "GroupTotalInstances",
  ]

  tag {
    key                 = "Name"
    value               = "${var.name}-web"
    propagate_at_launch = true
  }

  tag {
    key                 = "ManagedBy"
    value               = "terraform"
    propagate_at_launch = true
  }

  lifecycle {
    # Scaling policies change desired capacity. Do not let Terraform fight them.
    ignore_changes = [desired_capacity]
  }

  depends_on = [aws_lb_listener.https]
}

# ---------------- Scaling policies ----------------
# 1) Main signal: requests per target
resource "aws_autoscaling_policy" "requests" {
  name                   = "${var.name}-requests-per-target"
  autoscaling_group_name = aws_autoscaling_group.web.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.web.arn_suffix}/${aws_lb_target_group.web.arn_suffix}"
    }
    target_value = 500 # requests per target per minute: tune with load tests
  }
}

# 2) Backstop: CPU
resource "aws_autoscaling_policy" "cpu" {
  name                   = "${var.name}-cpu"
  autoscaling_group_name = aws_autoscaling_group.web.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 60
  }
}

# ---------------- Scheduled baseline (office hours) ----------------
resource "aws_autoscaling_schedule" "scale_up_weekdays" {
  scheduled_action_name  = "weekday-morning-baseline"
  autoscaling_group_name = aws_autoscaling_group.web.name
  recurrence             = "0 9 * * MON-FRI"
  time_zone              = "Asia/Kolkata"
  min_size               = 4
  max_size               = var.max_size
  desired_capacity       = -1 # leave desired unchanged
}

resource "aws_autoscaling_schedule" "scale_down_evening" {
  scheduled_action_name  = "weekday-evening-baseline"
  autoscaling_group_name = aws_autoscaling_group.web.name
  recurrence             = "0 21 * * MON-FRI"
  time_zone              = "Asia/Kolkata"
  min_size               = var.min_size
  max_size               = var.max_size
  desired_capacity       = -1
}

# ---------------- Optional lifecycle hook ----------------
# Only enable this if automation will COMPLETE the action. Otherwise every scale in waits for the timeout.
# resource "aws_autoscaling_lifecycle_hook" "drain" {
#   name                   = "drain-before-terminate"
#   autoscaling_group_name = aws_autoscaling_group.web.name
#   lifecycle_transition   = "autoscaling:EC2_INSTANCE_TERMINATING"
#   heartbeat_timeout      = 300
#   default_result         = "CONTINUE"
# }
```

**`outputs.tf`**

```hcl
output "alb_dns_name" {
  value = aws_lb.web.dns_name
}

output "asg_name" {
  value = aws_autoscaling_group.web.name
}
```

**`terraform.tfvars`** (placeholders)

```hcl
name                 = "prod-web"
region               = "ap-south-1"
vpc_id               = "vpc-xxxxxxxx"
public_subnet_ids    = ["subnet-aaaaaaaa", "subnet-bbbbbbbb"]
private_subnet_ids   = ["subnet-cccccccc", "subnet-dddddddd"]
certificate_arn      = "arn:aws:acm:ap-south-1:123456789012:certificate/example"
allowed_client_cidrs = ["0.0.0.0/0"]
```

**Run it**

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan      # read it: new ASG, ALB, SGs, launch template
terraform apply tfplan
```

**Expected result**

- An HTTPS ALB in public subnets forwarding to instances in private subnets across at least two AZs.
- An ASG with min 2 and max 8, ELB health checks, IMDSv2, encrypted volumes and no SSH.
- Two target tracking policies (requests per target and CPU) and weekday scheduled baselines.
- Changing the AMI or user data creates a new template version, and `instance_refresh` rolls instances in batches.

**Why important lines matter**

| Line | Reason |
| --- | --- |
| `health_check_type = "ELB"` | Replace instances whose app is down, not only those whose OS is down |
| `health_check_grace_period` | Prevents killing instances still booting |
| `default_instance_warmup` | One consistent warm-up for policies and refresh |
| `latest_version` pinned to a number | A template change is a deliberate, refreshed rollout |
| `instance_refresh` | Safe rolling replacement with a minimum healthy percentage |
| `ignore_changes = [desired_capacity]` | Terraform does not undo scaling decisions |
| App SG only from the ALB SG | No direct internet access to instances |
| `http_tokens = "required"` | Enforces IMDSv2 |
| `deregistration_delay = 60` | Faster, controlled drain on scale in and refresh |

**Production hardening beyond this example:** pin the AMI to a tested golden image, remote state with locking, ALB access logs, WAF, deletion protection, CloudWatch alarms for ALB 5xx and `GroupInServiceInstances`, and budgets.

### 15.4 Mixed instances policy snippet (Spot + On-Demand)

Use **either** a `launch_template` block **or** a `mixed_instances_policy` block in the ASG, not both.

```hcl
  # Replace the launch_template block in aws_autoscaling_group.web with this:
  capacity_rebalance = true

  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 2
      on_demand_percentage_above_base_capacity = 30
      spot_allocation_strategy                 = "price-capacity-optimized"
    }

    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.web.id
        version            = aws_launch_template.web.latest_version
      }

      override { instance_type = "m6i.large" }
      override { instance_type = "m5.large" }
      override { instance_type = "m6a.large" }
      override { instance_type = "m5a.large" }
    }
  }
```

What it does: 2 On-Demand instances are always present, and above that 30% On-Demand and 70% Spot, across several similar instance types to reduce interruption risk, with capacity rebalancing on.

---

## 16. Production Troubleshooting Scenarios

Each scenario follows: **Problem → Symptoms/impact → Possible causes → Investigation → Procedure → Root cause → Resolution → Prevention → How to explain it in an interview.**

### Beginner scenarios

#### A1. Traffic increased but Auto Scaling did not launch instances

1. **Problem:** Load is high and latency is rising, but the instance count stays the same.
2. **Symptoms and impact:** Slow responses, 5xx errors, `GroupDesiredCapacity` flat.
3. **Possible causes:**
   1. Group is **already at max**.
   2. Alarm is `OK` or `INSUFFICIENT_DATA` (metric not published, wrong dimension, basic 5-minute monitoring).
   3. **Policy not attached** or targets the wrong ASG, metric or resource label.
   4. **Suspended processes** (`Launch`, `AlarmNotification`).
   5. Launch **failing** (no capacity, quota, bad template, KMS, IP exhaustion).
   6. Warm-up or cooldown still active.
   7. Wrong metric (CPU low because the bottleneck is elsewhere).
4. **Tools:** `describe-auto-scaling-groups`, `describe-scaling-activities`, `describe-policies`, CloudWatch alarm history, ALB metrics, the diagnostic script in 15.2.
5. **Procedure:**
   1. Compare desired and max. At max? Raise it (carefully).
   2. Check suspended processes.
   3. Read the **last scaling activities**. Failed launches show their reason.
   4. Check the alarm state and history. Is the metric arriving?
   5. Confirm the policy and metric match the real bottleneck.
   6. Check quotas (vCPU) and subnet free IPs.
6. **Root cause (typical):** Max size was 4 and the group was already at 4 during the peak, or the launch failed with `InsufficientInstanceCapacity` in one instance type.
7. **Resolution:** Raise max (with cost guardrails), add instance type and AZ diversity, or fix the failing launch cause. Temporarily set desired capacity manually if users are suffering now.
8. **Prevention:** Alarm when `GroupDesiredCapacity` is near max, alarm on failed scaling activities, load test and review limits, use mixed instance types.
9. **Interview explanation:** "I followed the signal chain: metric, alarm, policy, group limits, launch. The activity history showed where it broke, and I fixed that link and added an alert for it."

#### A2. Instances launch and terminate in a loop

1. **Problem:** The group keeps launching new instances that get terminated within minutes.
2. **Symptoms and impact:** Capacity never stabilises, cost for short-lived instances, scaling activity log full of replacements.
3. **Possible causes:** ELB health check fails (wrong path or port, security group blocks the ALB, app not started), **grace period too short**, user data fails, AMI incompatible, instance cannot reach dependencies (no NAT/endpoint), health endpoint depends on a broken downstream system.
4. **Tools:** `describe-scaling-activities` (cause: "health check failed"), target group health, instance console output and user data log (`/var/log/cloud-init-output.log`), security groups, Session Manager.
5. **Procedure:**
   1. Look at the termination cause in activities.
   2. Check target health reason in the target group (`Request timed out`, `Health checks failed with 503`).
   3. Put a bad instance in **Standby** (or suspend `ReplaceUnhealthy`) to keep it alive for debugging.
   4. Check the boot logs and the app locally (`curl localhost:8080/healthz`).
   5. Check the ALB SG to instance SG rule and the health check port.
6. **Root cause (typical):** The instance SG allowed port 8080 only from the wrong SG, or boot took 6 minutes while the grace period was 120 seconds.
7. **Resolution:** Fix the SG or app, raise the grace period, bake an AMI to shorten boot.
8. **Prevention:** Test health checks in a lower environment, use a golden AMI, alert on `GroupTerminatingInstances` and unhealthy host count.
9. **Interview explanation:** "A loop means the group thinks instances are unhealthy before they can be healthy. I preserved one instance with Standby to debug and found the cause."

#### A3. Launch fails: capacity, quota, IP or KMS errors

1. **Problem:** Scaling activities show `Failed` launches.
2. **Common messages and causes:**
   1. `InsufficientInstanceCapacity`: AWS lacks that type in that AZ right now.
   2. `VcpuLimitExceeded` / `InstanceLimitExceeded`: EC2 quota reached.
   3. `InvalidParameter` / `InvalidAMIID`: wrong AMI, wrong Region, SG from a different VPC.
   4. `Client.InternalError: Client error on launch` with encrypted volumes: the **service-linked role cannot use the KMS key**.
   5. No free IP addresses in the subnet.
   6. `InvalidIamInstanceProfile`, or `iam:PassRole` missing for the creator.
3. **Procedure:** Read `StatusMessage` in `describe-scaling-activities`. Check quotas, subnet `AvailableIpAddressCount`, the template and KMS key policy.
4. **Resolution:** Use multiple instance types and AZs (mixed policy), request a quota increase, add subnets, grant the service-linked role KMS access (key policy or grant), fix the template.
5. **Prevention:** Diversify instance types, monitor quotas and subnet IPs, validate templates in CI, and test an actual launch after KMS or AMI changes.
6. **Interview explanation:** "Scaling failures are visible in the activity history. I map the error text to capacity, quota, template, IP space or KMS and fix that."

### Intermediate scenarios

#### B1. Scale in drops in-flight requests or kills busy workers

1. **Problem:** Users see errors during scale in, or a worker is terminated mid-job.
2. **Possible causes:** Short deregistration delay, long-running requests, no graceful shutdown handling, no lifecycle hook, no scale-in protection for long jobs, queue visibility timeout shorter than the job.
3. **Procedure:** Check the target group deregistration delay, app SIGTERM handling, and ASG activity times.
4. **Resolution:**
   1. Set the **deregistration delay** to the longest normal request plus margin.
   2. Handle `SIGTERM`: stop accepting new work, finish current work.
   3. Add a **termination lifecycle hook** to drain, or use **scale-in protection** while a job runs.
   4. For queue workers, set message visibility timeout longer than the job and make jobs idempotent.
5. **Prevention:** Test scale-in under load, use conservative scale-in (target tracking does this by default).
6. **Interview explanation:** "Scale in is a controlled shutdown problem. I combined connection draining, a termination hook and idempotent jobs."

#### B2. The group flaps (scales out then in repeatedly)

1. **Problem:** Capacity oscillates, increasing cost and instability.
2. **Possible causes:** Warm-up too short (new instances' low CPU lowers the average), simple scaling with thresholds close together, scale-in alarm too aggressive, metric noise, multiple policies fighting, a scheduled action overriding.
3. **Procedure:** Plot `GroupDesiredCapacity` with the metric and alarm history. Check warm-up and policy types.
4. **Resolution:** Set realistic **default instance warm-up**, prefer target tracking, widen gaps between scale-out and scale-in thresholds, smooth the metric, review scheduled actions.
5. **Prevention:** Load-test scaling behaviour, document the policy design.
6. **Interview explanation:** "Flapping usually comes from feedback delay. I fixed warm-up and used target tracking, which is designed to scale in conservatively."

#### B3. AZ imbalance or an AZ failure

1. **Problem:** Instances are concentrated in one AZ, or an AZ is impaired.
2. **Possible causes:** Subnets only in some AZs, no capacity for the instance type in an AZ, `AZRebalance` suspended, an AZ outage, single-AZ dependencies (NAT, database, EFS mount target).
3. **Procedure:** Count instances per AZ, read activities for launch errors per AZ, check the AWS Health dashboard and each tier's AZ placement.
4. **Resolution:** Add subnets in other AZs, diversify instance types, resume `AZRebalance`, fix single-AZ dependencies, temporarily raise capacity so the remaining AZs carry the load.
5. **Prevention:** At least two (preferably three) AZs, capacity for N-1 AZs, one NAT Gateway per AZ.
6. **Interview explanation:** "I check that every tier is multi-AZ and that surviving AZs have capacity. Then I fix the weak link."

#### B4. Instance refresh stuck or failing

1. **Problem:** Instance refresh stays `InProgress` or fails.
2. **Possible causes:** New instances failing health checks (bad AMI or user data), warm-up very long, MinHealthyPercentage too high for a small group (cannot replace anything), protected or standby instances, lifecycle hooks waiting, capacity or quota failures, checkpoint waiting for your approval.
3. **Procedure:** `describe-instance-refreshes` (status reason), scaling activities, target health, hooks.
4. **Resolution:** Cancel the refresh, fix the cause (revert the template version if necessary), and restart. Allow `MaxHealthyPercentage` above 100 for launch-first replacement where supported.
5. **Prevention:** Test AMIs in staging, use checkpoints and auto rollback, set warm-up from real data.
6. **Interview explanation:** "A stuck refresh nearly always means new instances never become healthy, so I look at their health and boot logs, roll back, and fix the image."

#### B5. Spot interruptions cause capacity gaps

1. **Problem:** Capacity drops suddenly and recovers slowly.
2. **Possible causes:** Single instance type or AZ, `lowest-price` strategy, no On-Demand base, no interruption handling, Capacity Rebalancing off, a Spot capacity crunch.
3. **Resolution:** Diversify instance types and AZs, use `price-capacity-optimized`, add an On-Demand base, enable Capacity Rebalancing, drain on the two-minute notice.
4. **Prevention:** Test interruptions (AWS Fault Injection Service), alarm on in-service capacity.
5. **Interview explanation:** "Spot needs diversification and graceful handling. I keep a guaranteed On-Demand base for critical capacity."

### Advanced scenarios

#### C1. Runaway scaling and a cost spike

1. **Problem:** The group scales to its maximum and stays there, and the bill jumps.
2. **Possible causes:** An attack or bot traffic, a bad deployment causing retries and high CPU, a metric that rises with instance count, scale-in blocked (protected instances, hooks stuck), a too-high maximum, a lifecycle hook that keeps instances in `Wait`, a wrong target value.
3. **Procedure:** Check what traffic or error pattern drives the metric (ALB logs, WAF), check `GroupInServiceInstances` vs desired, protected or standby instances, and hooks.
4. **Resolution:** Stop the cause (block traffic with WAF, roll back the release), temporarily lower the max, remove stuck protection or hooks, and let scale-in proceed.
5. **Prevention:** A sensible `max_size`, budget and anomaly alarms, AWS WAF rate limits, health of scale-in mechanisms, alerts when capacity stays at max.
6. **Interview explanation:** "The maximum is a cost safety valve. I diagnosed what drove demand, stopped it, and added alerts for sustained max capacity."

#### C2. Scale out is too slow for spikes

1. **Problem:** A flash sale causes errors for several minutes before capacity arrives.
2. **Causes:** Long boot and bootstrap, 5-minute basic monitoring, high target values (little headroom), reactive-only scaling, cold caches.
3. **Resolution:** Golden AMI and a tiny user data, **detailed monitoring**, lower target for headroom, **scheduled** and **predictive scaling** before known events, **warm pools**, ALB **slow start**, pre-warm the load balancer for extreme spikes by contacting AWS Support (verify the current process), and use queues or caches to absorb bursts.
4. **Prevention:** Load test with realistic ramps and measure time-to-serve for new instances.
5. **Interview explanation:** "I shorten time-to-capacity with better images and monitoring, and I don't rely only on reactive scaling for known events."

#### C3. Long-running or stateful workloads on an ASG

1. **Problem:** Scale in terminates instances holding long jobs or local state.
2. **Resolution options:**
   1. Make instances **stateless**. Move state to RDS, ElastiCache, S3 or EFS.
   2. For long jobs, use **scale-in protection** per instance during work, or a **termination lifecycle hook** to drain.
   3. For queues, scale on backlog per instance and use idempotent processing.
   4. For genuinely stateful systems, prefer managed services or a design with controlled replacement (not elastic scaling).
3. **Interview explanation:** "Auto Scaling works best with disposable instances. For long jobs I protect or drain, and for stateful systems I choose a different pattern."

---

## 17. Security, Reliability and Best Practices

### 17.1 Mandatory controls vs optional design choices

| Area | **Mandatory** | Optional (depends on need and cost) |
| --- | --- | --- |
| Multi-AZ | Subnets in at least two AZs | Three AZs, N-1 capacity design |
| Health checks | ELB health checks for load-balanced apps, realistic grace period | Custom health with `set-instance-health` |
| Maximum | Sensible `max_size` and cost alarms | Per-environment budgets |
| Launch template | IMDSv2 required, IAM instance profile, encrypted EBS, no secrets in user data | Golden AMI pipeline, warm pool |
| Access | Session Manager, no inbound SSH, SG from ALB only | VPC endpoints for SSM and ECR |
| IAM | Least-privilege instance profile, restrict `iam:PassRole` | Permission boundaries |
| KMS | Service-linked role access to customer-managed keys when used | Separate keys per environment |
| Deployment | Controlled rollout (pinned template version + instance refresh or blue/green) | Checkpoints, auto rollback, canary |
| Monitoring | Alarms: failed scaling activities, capacity near max, unhealthy hosts, ALB 5xx | Predictive scaling, dashboards |
| Scaling signal | A metric that reflects the real bottleneck | Custom metrics (queue backlog) |
| Cost | Tags, budgets | Spot with On-Demand base, Savings Plans for baseline |
| IaC | Defined in code with review, `ignore_changes` for desired capacity | Policy as code |

### 17.2 Least privilege and secrets

1. Instance profile only for what the workload needs. Fetch secrets from **Secrets Manager** or **SSM Parameter Store** at boot, not from user data or the AMI.
2. Users who can create launch templates and ASGs can attach roles. Restrict `iam:PassRole` to specific roles and conditions.
3. Use SCPs and IAM conditions to **require IMDSv2** at launch (`ec2:MetadataHttpTokens`).
4. Do not bake credentials into AMIs.

### 17.3 Network and access controls

1. Private subnets, SG-to-SG rules, no public IPs on instances (`associate_public_ip_address = false`).
2. ALB with TLS, WAF, access logs. Instances reachable only from the ALB.
3. VPC endpoints for AWS service traffic to reduce NAT dependency and cost.
4. Session Manager with logging to CloudWatch or S3.

### 17.4 High availability and disaster recovery

1. Multi-AZ everywhere (ALB, ASG, database, cache, NAT).
2. Enough capacity that losing one AZ still serves load (over-provision or scale quickly).
3. Diversify instance types for capacity availability.
4. For regional disasters: infrastructure as code plus data replication, and a second Region ASG at the chosen DR level (pilot light: min 0 or 1, warm standby: min small).
5. Test failure: terminate instances, fail an AZ (route changes, FIS), run game days.

### 17.5 Rollback and failure recovery

1. Keep **previous launch template versions** and AMIs. Roll back by pointing the ASG to the previous version and running an instance refresh.
2. For blue/green, keep the old ASG until the new one is proven, then switch listener weights back if needed.
3. Use **auto rollback** and alarms in instance refresh where supported.
4. Record the AMI ID and template version for every release.

### 17.6 Monitoring, logging and alerting

| Signal | Source | Example alert |
| --- | --- | --- |
| Capacity near max | `GroupDesiredCapacity` vs `GroupMaxSize` | Desired at max for more than 15 minutes |
| Failed scaling activities | EventBridge (`EC2 Instance Launch Unsuccessful`) | Any launch failure |
| Unhealthy hosts | ALB `UnHealthyHostCount` | Greater than 0 sustained |
| Latency and errors | ALB `TargetResponseTime`, `HTTPCode_Target_5XX_Count` | Above SLO |
| Pending/terminating stuck | `GroupPendingInstances`, `GroupTerminatingInstances` | Non-zero for too long (stuck hooks) |
| Spot interruptions | EventBridge Spot interruption warnings | Count spikes |
| Quotas | Service Quotas / CloudWatch usage | Above 80% of vCPU quota |
| Changes | CloudTrail | Policy or ASG changes in prod |
| Cost | Budgets, anomaly detection | Spend above forecast |

### 17.7 Scalability and performance

1. Choose a scale metric that tracks the true bottleneck. Use requests per target for web tiers.
2. Keep boot time short (golden AMI) and use detailed monitoring.
3. Provide headroom: a lower target value and a higher minimum for known peaks.
4. Watch downstream limits (database connections, third-party rate limits). Scaling web servers can overload them.
5. Keep within quotas. Request increases early.

### 17.8 Cost optimisation

1. Right-size instance types (Compute Optimizer). Use Graviton where compatible.
2. **Spot** with an On-Demand base for fault-tolerant tiers. **Savings Plans** for the steady baseline.
3. Scale in aggressively enough: avoid protected or hook-stuck instances sitting idle.
4. Use scheduled scaling to lower non-production at night and weekends.
5. Cap with `max_size`. Alert on sustained max.
6. Use VPC endpoints and per-AZ NAT thoughtfully, and keep traffic AZ-local.

### 17.9 Backup and recovery

1. Instances are disposable: **recover by launching from AMI and configuration**, not by backing up the instance.
2. Back up the data layer (RDS, EBS snapshots for data volumes, S3 versioning) and AMIs (copy to a DR Region).
3. Keep the launch template, user data and infrastructure code in version control.

### 17.10 Compliance considerations

1. Evidence needed: change history (CloudTrail, Config), patched AMIs (AMI pipeline records), encrypted volumes, restricted access, logging.
2. Use **maximum instance lifetime** or regular instance refresh to ensure instances pick up patched AMIs.
3. These notes are not compliance advice. Verify requirements of your applicable standard.

---

## 18. Comparison Tables

### 18.1 Scaling policy types

| Policy | You define | Alarms | Reaction | Best for |
| --- | --- | --- | --- | --- |
| Target tracking | Metric and target value | Managed by AWS | Proportional, aggressive out, conservative in | Most workloads |
| Step | Alarm thresholds and step adjustments | You manage | Larger breach gives larger change | Custom, fine-grained control |
| Simple | One alarm, one adjustment | You manage | One action then cooldown | Legacy |
| Scheduled | Time and capacity | None | At the given time | Known patterns |
| Predictive | Metric and mode | Forecast-based | Ahead of time | Cyclical traffic |

### 18.2 Cooldown vs warm-up vs health check grace period

See section 8.

### 18.3 EC2 health check vs ELB health check

| Feature | EC2 | ELB |
| --- | --- | --- |
| Checks | Instance and system status | Application response (HTTP/TCP) on the health check path and port |
| Detects hung application | No | Yes |
| Default for ASG | Yes | No, must be enabled |
| Typical use | Standalone workers | Anything behind a load balancer |

### 18.4 Launch template vs launch configuration

See section 5.3.

### 18.5 Instance refresh vs blue/green ASG vs in-place deployment

| Feature | Instance refresh | Blue/green (two ASGs) | In-place (CodeDeploy) |
| --- | --- | --- | --- |
| Rollback speed | Slower | Fast (switch listener) | Moderate |
| Extra capacity | Small | Double temporarily | Small |
| Complexity | Low | Higher | Medium |
| Best for | Image-based rolling updates | Risky changes needing quick rollback | App-only deploys without new AMI |

### 18.6 EC2 Auto Scaling vs Application Auto Scaling vs EKS autoscalers

| Item | Scales what | Notes |
| --- | --- | --- |
| **EC2 Auto Scaling** | Number of EC2 instances in an ASG | This document |
| **Application Auto Scaling** | Other AWS resources: ECS service task count, DynamoDB capacity, Lambda provisioned concurrency, Aurora replicas and more | Different API (`application-autoscaling`) |
| **Kubernetes HPA / VPA** | Pods (replicas/resources) | Inside the cluster |
| **Cluster Autoscaler / Karpenter** | Nodes for pods | Cluster Autoscaler works through ASGs (managed node groups are ASG-backed). Karpenter launches EC2 directly with flexible instance selection |

### 18.7 Spot allocation strategies

| Strategy | Idea | Recommendation |
| --- | --- | --- |
| `price-capacity-optimized` | Cheap pools with deep capacity | Usually the best default |
| `capacity-optimized` | Deepest capacity pools | When interruption cost is high |
| `lowest-price` | Cheapest pools only | Usually avoid |

### 18.8 Vertical vs horizontal scaling

| Feature | Vertical (scale up) | Horizontal (scale out) |
| --- | --- | --- |
| What changes | Instance size | Instance count |
| Downtime | Usually restart | None |
| Limit | Largest instance size | Quotas, app design |
| Auto Scaling | No (change template) | Yes |

### 18.9 Common interview traps

| Trap | Correct answer |
| --- | --- |
| "Auto Scaling handles scale up (bigger instances)." | It scales out/in. For bigger instances change the template and refresh. |
| "Min = max = desired is auto scaling." | It is self-healing at a fixed size, not elastic. |
| "EC2 health checks detect an app crash." | No, only instance status. Enable ELB health checks. |
| "Cooldown applies to all policies." | Simple scaling. Others use warm-up. |
| "Target tracking alarms can be edited." | Do not edit them. Change the policy. |
| "Use total request count for target tracking." | Use requests **per target**. |
| "Termination policy decides exactly which instance dies." | AZ balance and other rules come first. |
| "A lifecycle hook makes the instance healthy." | It only pauses. You must complete the action. |
| "Spot instances are always cheaper and safe." | They can be reclaimed in two minutes. Diversify and keep an On-Demand base. |
| "Launch configurations are fine for new work." | They are deprecated. Use launch templates. |
| "`$Latest` is safe in production." | It changes future launches silently. Pin versions. |
| "CPU is always the right metric." | Scale on the real bottleneck (requests per target, backlog). |
| "Scaling out always fixes slowness." | Not if the bottleneck is downstream (database, API limits). |

---

## 19. Enterprise Reference Architecture

### 19.1 Production web tier

```text
Route 53 -> CloudFront + WAF (optional) -> ALB (public subnets, 3 AZs, TLS)
                                              |
                                  Target group (health: /healthz)
                                              |
        +-------------------- Auto Scaling group (private subnets, 3 AZs) ---------------------+
        |  Launch template: golden AMI, IMDSv2, encrypted EBS, instance profile (SSM only)     |
        |  Policies: target tracking (requests/target) + CPU backstop + scheduled + predictive |
        |  Instance refresh: 90% healthy, checkpoints, auto rollback                           |
        |  Mixed instances: On-Demand base + Spot (price-capacity-optimized)                   |
        +--------------------------------------------------------------------------------------+
                  |                      |                         |
              RDS Multi-AZ        ElastiCache/Redis          S3 (assets, artifacts)
        Logs/metrics -> CloudWatch ; API audit -> CloudTrail ; Config rules ; Budgets
```

### 19.2 Release flow

```text
Git push -> CI (build, test, scan) -> Packer/EC2 Image Builder bakes AMI -> new launch template version (pinned)
        -> Terraform plan/apply (reviewed) -> instance refresh (checkpoints, alarms, auto rollback)
        -> smoke tests -> done   |  failure -> cancel refresh and revert template version
```

### 19.3 Where Auto Scaling shows up in other designs

1. **EKS managed node groups** are backed by ASGs. **Cluster Autoscaler** scales those ASGs, and **Karpenter** provisions nodes directly based on pending pods.
2. **ECS on EC2** uses an ASG as a capacity provider, with managed scaling from task demand.
3. **CI/CD runners** on Spot ASGs, scaled by queue depth.
4. **Batch/queue workers** scaled on backlog per instance.

### 19.4 Design decisions to explain

1. **Why target tracking on requests per target?** Reflects demand directly and scales in conservatively.
2. **Why ELB health checks and a grace period?** Application-level health and no boot-time kills.
3. **Why pinned template versions plus instance refresh?** Controlled, reversible rollouts.
4. **Why mixed instances with an On-Demand base?** Cost savings without risking critical capacity.
5. **Why a `max_size`?** Cost and blast-radius protection against runaway scaling.

---
## 20. Interview Questions and Answers

> Answer pattern: **definition → how it works → trade-off or example → follow-up**. Follow-up questions a senior interviewer may ask are shown as **Follow-up**.

### 20.1 Basic concepts

#### Q1. What is Amazon EC2 Auto Scaling and why do we use it?

1. It automatically maintains the desired number of EC2 instances and adjusts that number based on policies, schedules and health checks.
2. Benefits: high availability (self-healing, multi-AZ), elasticity, cost savings, consistency (launch template) and automation.
3. Example: 2 instances normally, 6 during a sale, back to 2 after.
4. There is no extra charge for Auto Scaling itself. You pay for the underlying resources.
5. **Follow-up:** "Does it fix a slow database?" No. Adding web servers does not remove a downstream bottleneck.

#### Q2. What are the main components of EC2 Auto Scaling?

1. **Launch template:** how to launch instances (AMI, type, SGs, profile, user data).
2. **Auto Scaling group:** min/desired/max, subnets/AZs, health check settings.
3. **Scaling policies** and **CloudWatch alarms/metrics.**
4. **Load balancer and target group** for traffic distribution.
5. **Health checks, lifecycle hooks, termination policies, instance refresh, warm pools.**
6. The **service-linked role** that lets the service act in your account.

#### Q3. Explain minimum, desired and maximum capacity.

1. **Minimum:** the floor. Scaling policies do not go below it, and failed instances are replaced to stay at or above it.
2. **Desired:** the current target count. Policies change this value.
3. **Maximum:** the ceiling and the cost safety valve.
4. These define boundaries and the target. Policies decide **when** to change it.
5. **Follow-up:** "Traffic is high but nothing scales. First check?" Whether desired already equals max.

#### Q4. What is the difference between scale out/in and scale up/down?

1. Scale **out/in** (horizontal) changes the **number** of instances. This is what Auto Scaling does.
2. Scale **up/down** (vertical) changes the **size** of an instance. To do this, change the instance type in the launch template and roll out with an instance refresh.
3. Horizontal scaling improves availability and has no hard size limit, but needs a stateless design. Vertical scaling is simpler but has limits and usually needs a restart.

#### Q5. Launch template vs launch configuration?

1. Launch templates are **versioned**, support mixed instance types, Spot options and newer EC2 features. Launch configurations are immutable and **deprecated**.
2. Always use launch templates for new work, and migrate old groups.
3. Pin a template **version** in production so changes roll out deliberately. `$Latest` can change future launches unexpectedly.
4. Enforce IMDSv2, an instance profile and encrypted volumes in the template.

#### Q6. EC2 vs ELB health checks in an ASG?

1. EC2 health checks (default) check instance state and status checks. They do **not** know if your application works.
2. ELB health checks use the target group's HTTP/TCP check, so they detect an application failure. They must be **enabled** on the ASG.
3. Use ELB health checks for anything behind a load balancer, with a **grace period** longer than boot time.
4. Keep health endpoints **shallow** (local readiness). A health check that depends on the database can cause mass replacement during a database incident.

#### Q7. How does Auto Scaling handle multiple Availability Zones?

1. You provide subnets in several AZs. The ASG spreads instances **evenly**.
2. If an AZ fails or lacks capacity, it launches in the other AZs.
3. **AZ rebalancing** launches new instances in under-used AZs and then terminates old ones, so capacity does not drop.
4. True resilience also needs multi-AZ dependencies (NAT, database, caches) and capacity for the loss of one AZ.

#### Q8. How does an ASG work with an Application Load Balancer?

1. Attach a target group to the ASG. The ASG registers new instances and deregisters terminating ones.
2. Enable ELB health checks so unhealthy targets are replaced.
3. Request flow: client -> ALB in public subnets -> instances in private subnets.
4. Security groups: ALB SG allows 443 from clients, instance SG allows the app port **from the ALB SG only**.
5. Tune **deregistration delay** and **slow start** for graceful scale in and gentle warm-up.
6. Use **requests per target** as a scaling metric.

### 20.2 Intermediate concepts

#### Q9. What types of scaling policies exist?

1. **Target tracking:** keep a metric near a target value. The default recommendation.
2. **Step scaling:** different adjustments for different alarm breach sizes.
3. **Simple scaling:** one adjustment then a cooldown. Legacy.
4. **Scheduled scaling:** change capacity at set times.
5. **Predictive scaling:** forecast cyclical demand and scale ahead of it.
6. Combine them: scheduled/predictive for the expected, target tracking for the unexpected.

#### Q10. How does target tracking work, and what are its rules?

1. You choose a metric and target (for example 500 requests per target, or CPU 60%). Auto Scaling creates and manages the alarms and adjusts capacity proportionally.
2. Scale out is aggressive. Scale in is conservative and does not happen when data is insufficient.
3. With several target tracking policies, scale out happens if **any** wants it, scale in only if **all** agree.
4. The metric must move inversely with capacity (requests per target, not total requests).
5. Do not edit the managed alarms. Change the policy.
6. `ALBRequestCountPerTarget` needs the ALB and target group resource label.

#### Q11. Step scaling vs simple scaling?

1. Both use CloudWatch alarms that you manage.
2. Simple scaling makes **one** adjustment and then waits for the **cooldown**, so it reacts slowly to large spikes.
3. Step scaling uses **multiple steps** (bigger breach gives bigger adjustment) and keeps responding while the alarm remains, using warm-up to avoid over-counting new instances.
4. Prefer target tracking, or step scaling when you need custom control. Avoid simple scaling for new designs.

#### Q12. When do you use scheduled and predictive scaling?

1. **Scheduled:** known events or business hours (raise the minimum at 09:00 on weekdays).
2. **Predictive:** recurring daily or weekly patterns, especially when instances take time to become ready. It forecasts from history (needs enough data).
3. Neither replaces dynamic policies. Unexpected load still needs target tracking.
4. Evaluate predictive scaling in forecast-only mode before enabling scaling.

#### Q13. Cooldown vs warm-up vs health check grace period?

1. **Cooldown:** after a scaling action, simple scaling waits (default 300 s).
2. **Instance warm-up:** time before a new instance's metrics count toward the group aggregate (target tracking, step scaling, instance refresh). Prefer the group's **default instance warm-up**.
3. **Health check grace period:** time after InService during which health-check failures are ignored.
4. They solve different problems: scaling decisions, metric accuracy and health replacement.

#### Q14. What are termination policies and scale-in protection?

1. A termination policy chooses which instance to remove on scale in (default, oldest instance, newest instance, oldest launch template, and others). AZ balance is considered first, so it is not a guarantee of which instance dies.
2. **Scale-in protection** prevents an instance from being chosen in normal scale in. Useful for instances running long jobs.
3. Protection does not stop health replacement, Spot interruption or manual termination, and too many protected instances block scale in.
4. Lifecycle hooks, protection and termination policies solve different problems: drain, protect and choose.

#### Q15. What are lifecycle hooks and how do they work?

1. They pause an instance in `Pending:Wait` (launch) or `Terminating:Wait` (termination) so automation can run.
2. Notification via EventBridge, SNS or SQS. Automation calls `complete-lifecycle-action` (`CONTINUE` or `ABANDON`), and can extend with a heartbeat.
3. If nothing responds before the timeout, the default result applies.
4. Use cases: agent install, configuration, registration (launch). Drain jobs, deregister, flush logs (termination).
5. Risks: instances cost money while waiting, a stuck hook stalls scaling and refresh, so design timeouts and defaults carefully.

#### Q16. What is instance refresh and how do you use it safely?

1. A managed rolling replacement of instances to apply a new AMI or launch template version.
2. It keeps `MinHealthyPercentage` healthy, waits for health checks and warm-up between batches, and supports checkpoints, skip matching and auto rollback.
3. Pre-requisites: ELB health checks, a realistic warm-up, a working health endpoint and enough headroom.
4. Rollback: cancel the refresh, revert the template version and refresh again. Or use auto rollback.
5. For fast rollback needs, blue/green with two ASGs can be better.

#### Q17. How do Spot Instances and mixed instances policies work in an ASG?

1. A mixed instances policy lets one ASG use several instance types and combine On-Demand with Spot.
2. Settings: On-Demand base, percentage above base, Spot allocation strategy (`price-capacity-optimized` recommended), instance type overrides or attribute-based selection, Capacity Rebalancing.
3. Spot can be reclaimed with a two-minute notice. Diversify types and AZs, keep an On-Demand base for critical capacity and drain on the notice.
4. Replacement of interrupted capacity depends on available Spot capacity.

#### Q18. How do you choose the scaling metric?

1. Match the metric to the true bottleneck and make sure it moves inversely with instance count.
2. Web/API behind ALB: requests per target. CPU-bound: average CPU. Queue workers: backlog per instance. Memory-bound: custom memory metric.
3. CPU is not always right. If the database is slow, CPU stays low and more web servers do not help.
4. Use detailed monitoring (1-minute) for responsive scaling.

#### Q19. What is a warm pool and when do you use it?

1. A set of pre-initialised instances (stopped, running or hibernated) held ready so scale out is faster.
2. Useful when initialisation is long and cannot be shortened with a golden AMI.
3. Costs: stopped instances still cost for EBS storage, running and hibernated cost more. Adds complexity with lifecycle hooks.
4. Alternatives: golden AMI, smaller user data, predictive scaling, more headroom.

### 20.3 Advanced technical questions

#### Q20. How would you auto scale SQS queue workers?

1. Scale on **backlog per instance**: `ApproximateNumberOfMessagesVisible / InService instances`.
2. Compute the target: acceptable latency divided by average processing time per message.
3. Publish it as a custom metric and use a **target tracking** policy.
4. Protect busy workers: scale-in protection or a termination hook, visibility timeout longer than processing time, idempotent jobs and a dead-letter queue.
5. Consider scaling to zero (min 0) when idle if latency allows.

#### Q21. How do you deploy a new version with zero or minimal downtime on an ASG?

1. **Instance refresh** (rolling): simple, with min healthy percentage, checkpoints and rollback.
2. **Blue/green** with two ASGs and weighted target groups: fast rollback, higher temporary cost.
3. **Canary:** shift a small share of traffic first.
4. **CodeDeploy** for application-level deploys.
5. Immutable AMIs built by a pipeline give reproducibility. Always have a rollback plan and health checks that detect failures.

#### Q22. How do you take an instance out of service for debugging without it being replaced?

1. Use **Standby**: it is deregistered from the load balancer and not replaced if you decrement desired capacity.
2. Or **suspend** `ReplaceUnhealthy` (and possibly `HealthCheck`) for the group, but remember to resume.
3. Or **detach** the instance from the group.
4. Preserve evidence (console output, logs, snapshots) before cleanup.
5. Always track suspended processes. A forgotten suspension silently stops scaling or healing.

#### Q23. How does Auto Scaling relate to EKS and Kubernetes autoscaling?

1. EKS managed node groups are backed by ASGs.
2. HPA scales pods. **Cluster Autoscaler** scales ASGs when pods are unschedulable. **Karpenter** launches nodes directly with flexible instance selection.
3. EC2 Auto Scaling scales instances. Application Auto Scaling scales other services (ECS tasks, DynamoDB, Lambda concurrency).
4. Pod and node scaling must be sized together: pod requests and limits, node capacity, subnet IPs (VPC CNI).

#### Q24. What limits and quotas can block scaling?

1. Group `max_size` and the number of ASGs per Region.
2. EC2 **vCPU quotas** per family (On-Demand and Spot).
3. **Capacity:** `InsufficientInstanceCapacity` for an instance type in an AZ (use more types and AZs).
4. **Subnet IP addresses.**
5. ENI, EBS, security group or Elastic IP quotas. API rate limits during large scale actions.
6. KMS permission issues for encrypted volumes.
7. Verify current quotas in Service Quotas and request increases early.

#### Q25. How do you secure an Auto Scaling setup?

1. Launch template: IMDSv2 required, instance profile with least privilege, encrypted EBS, no secrets in user data, no key pair (use Session Manager).
2. Network: private subnets, SG from the ALB only, endpoints for AWS APIs.
3. IAM: restrict `iam:PassRole`, and who can modify ASGs and launch templates.
4. KMS: service-linked role access for customer-managed keys.
5. Patching: baked AMIs, regular refresh or max instance lifetime.
6. Audit: CloudTrail, Config rules (for example IMDSv2 and public IP checks).

#### Q26. How do you optimise the cost of an ASG?

1. Right-size instances, consider Graviton.
2. Spot with an On-Demand base, Savings Plans for the baseline.
3. Use scheduled scaling for non-production.
4. Make sure scale in works (no stuck protection or hooks) and cap `max_size`.
5. Reduce NAT and cross-AZ costs with endpoints and AZ-local design.
6. Tag for cost allocation and set budgets and anomaly alerts.

### 20.4 Scenario-based and production troubleshooting questions

#### Q27. Traffic increased but Auto Scaling did not launch instances. How do you troubleshoot?

1. Compare desired capacity with max (already at max?).
2. Check **suspended processes**.
3. Read **scaling activities** for failed launches (capacity, quota, template, KMS, IP).
4. Check the alarm state and history (is it `OK` or `INSUFFICIENT_DATA`, is the metric arriving?).
5. Confirm the policy, metric and resource label are correct.
6. Check warm-up or cooldown effects.
7. Fix the broken link, and as a short-term measure set desired capacity manually. Add alerts for capacity near max and failed activities.

#### Q28. Instances launch and are terminated repeatedly. Why?

1. The group sees them as unhealthy before they are ready: ELB health check failing (wrong path/port, SG blocks the ALB, app not started).
2. **Grace period** shorter than boot time. User data failing.
3. Put one instance in Standby, check cloud-init logs and `curl localhost/healthz`, and read target health reasons.
4. Fix the SG or app, extend the grace period, bake an AMI.
5. Make health checks shallow so a downstream outage does not kill the whole fleet.

#### Q29. The group scales out and in repeatedly (flapping). What do you do?

1. Check warm-up (too short makes new instances' low metrics distort the average).
2. Prefer target tracking, widen scale-in and scale-out threshold gaps if using step scaling, and check for multiple policies or scheduled actions fighting.
3. Smooth noisy metrics and review the metric choice.
4. Test scaling with load ramps.

#### Q30. Users see errors during scale in. How do you fix it?

1. Set the target group **deregistration delay** to cover your longest normal request.
2. Handle `SIGTERM` gracefully in the application.
3. Add a **termination lifecycle hook** to drain work, or use scale-in protection for long jobs.
4. For queue workers: visibility timeout greater than job time, and idempotent processing.
5. Keep scale in conservative (target tracking).

#### Q31. An instance refresh is stuck. What do you check?

1. `describe-instance-refreshes` status reason, then scaling activities.
2. Are new instances becoming healthy (target health, boot logs)? A bad AMI or user data is the usual cause.
3. MinHealthyPercentage too high for a small group, protected or standby instances, hooks waiting, quota or capacity failures, checkpoints awaiting approval.
4. Cancel, revert the template version, fix and restart. Use checkpoints and auto rollback next time.

#### Q32. One AZ is impaired. How does your design behave, and what do you do?

1. The ALB stops sending traffic to unhealthy targets. The ASG launches replacements in healthy AZs (if capacity and quotas allow).
2. Verify the remaining AZs have capacity (headroom for N-1). Raise desired capacity if needed.
3. Check single-AZ dependencies (NAT, database, mount targets).
4. After recovery, let AZ rebalancing restore balance (or resume it if suspended).
5. Review capacity planning and run a game day.

#### Q33. Spot interruptions are causing capacity gaps. What do you change?

1. Diversify instance types and AZs. Use `price-capacity-optimized`.
2. Keep an **On-Demand base** for critical capacity.
3. Enable **Capacity Rebalancing** and handle the two-minute notice (drain, checkpoint).
4. Alarm on in-service capacity and test with interruption simulations.

#### Q34. Scale-out launches fail. How do you find the cause and fix it?

1. `describe-scaling-activities` and read `StatusMessage`.
2. Map the message: capacity (`InsufficientInstanceCapacity`), quota (`VcpuLimitExceeded`), template (`InvalidAMIID`, wrong SG/VPC), IP exhaustion, KMS (service-linked role cannot use the key), IAM profile or `PassRole`.
3. Fix: more instance types and AZs, quota increase, correct template, add subnets, KMS key policy or grant, correct profile.
4. Prevent with quota alarms, subnet IP monitoring and validated templates.

### 20.5 Security and best-practice questions

#### Q35. What does a production-ready ASG look like?

1. At least two or three AZs in private subnets, behind an ALB with TLS.
2. Launch template: golden AMI, IMDSv2, encrypted EBS, least-privilege instance profile, Session Manager.
3. ELB health checks with a realistic grace period and default warm-up.
4. Target tracking on requests per target (and CPU backstop), scheduled/predictive for known patterns, sensible `max_size`.
5. Instance refresh with checkpoints and rollback, pinned template versions, everything in Terraform.
6. Alarms: capacity near max, failed activities, unhealthy hosts, 5xx, quotas. Budgets and tags.
7. Mixed instances with an On-Demand base if cost matters. Tested failure scenarios.

#### Q36. How would you handle a stateful application on an ASG?

1. Prefer to make it stateless: move state to RDS, ElastiCache, S3 or EFS.
2. If state remains on instances, use scale-in protection, termination hooks and replication, but accept the added complexity.
3. For databases and truly stateful systems, use managed services or purpose-built clustering rather than elastic scaling.
4. For session state, use a shared store rather than sticky sessions where possible.

### 20.6 Follow-up questions a senior interviewer may ask

1. "Why not simply over-provision instead of auto scaling?" Cost and operational safety. Auto Scaling also provides self-healing and consistent builds, but you still keep sensible headroom for fast spikes.
2. "How do you load test an auto scaling policy?" Ramp load realistically, measure time from alarm to serving traffic, check warm-up, observe scale in after the peak, and watch downstream systems.
3. "What would you do if AWS runs out of your instance type in an AZ?" Use multiple instance types and AZs (mixed policy, attribute-based selection), and consider capacity reservations for critical baselines.
4. "How do you patch instances?" Build a new AMI regularly, update the template version and run an instance refresh. Avoid patching in place.
5. "How do you prevent a bad AMI from taking down production?" Test in staging, pinned versions, checkpoints, auto rollback, health checks that reflect readiness, and a quick revert procedure.
6. "Target tracking or step scaling for a spiky API?" Target tracking on requests per target for most cases, with lower targets for headroom, plus scheduled/predictive for known peaks. Step scaling only if you need custom control.
7. "How does this change on Kubernetes?" HPA scales pods, Cluster Autoscaler or Karpenter scales nodes, and the ASG becomes an implementation detail of node groups.

---

## 21. Interview Answer Framework

Use this for any scenario question. Say the steps aloud.

### 21.1 The eight-step framework

| Step | What you say | Auto Scaling-specific examples |
| --- | --- | --- |
| 1. Understand problem and impact | Which group, what symptom, since when, what changed | Latency up? Capacity flat? Deployment or template change? |
| 2. Check monitoring, logs, metrics, events | Evidence first | ALB metrics, CloudWatch alarms, `GroupDesiredCapacity`, scaling activities, CloudTrail |
| 3. Verify architecture and configuration | Draw the chain | Metric -> alarm -> policy -> min/desired/max -> launch template -> subnets -> target group |
| 4. Narrow down root causes | Rank hypotheses | At max, suspended process, alarm no data, launch failure, health check loop |
| 5. Run safe diagnostics | Read-only first | `describe-scaling-activities`, `describe-policies`, target health, cloud-init logs |
| 6. Apply the safest fix and validate | Smallest change, with rollback | Raise max, fix SG, extend grace period, revert template version, manual desired capacity short term |
| 7. Communicate and document | Status, timeline, root cause | Incident note, owner, follow-ups |
| 8. Prevent recurrence | Alerts and automation | Alarm near max, failed-activity alerts, IaC, load tests, budgets |

### 21.2 Auto Scaling adaptations

1. **Not scaling out:** limits (max, quotas) -> suspended processes -> activities (failed launches) -> alarm and metric -> policy target.
2. **Launch-terminate loop:** termination cause -> target health -> SG and port -> boot logs -> grace period -> health endpoint depth.
3. **Slow scale-out:** boot time -> monitoring granularity -> target headroom -> predictive/scheduled -> warm pool.
4. **Bad rollout:** pause or cancel the refresh -> compare healthy and unhealthy instances -> revert the template version -> fix the image.
5. **Cost spike:** what drives demand -> stuck scale in (protection, hooks) -> max size -> Spot/On-Demand mix.

### 21.3 Worked example (about 90 seconds)

> **Question:** "Traffic increased, but your Auto Scaling group did not launch instances. What do you do?"
>
> "First I'd confirm the impact: which group, which symptoms and since when, and whether anything changed such as a deployment, a template version or a policy edit. Then I'd look at the evidence: ALB request count and latency, the CloudWatch alarm state, `GroupDesiredCapacity`, and the ASG scaling activity history.
>
> My hypotheses, in order: the group is already at its maximum, a process such as `Launch` or `AlarmNotification` is suspended, the alarm is in `INSUFFICIENT_DATA` or the metric is wrong, or launches are failing because of capacity, quota, a bad template or a KMS permission. I'd run read-only checks: `describe-auto-scaling-groups`, `describe-scaling-activities`, `describe-policies` and the alarm history.
>
> Say the activity history shows `InsufficientInstanceCapacity` for one instance type in one AZ. The safest fix is to add more instance types and AZs, and in the short term raise desired capacity manually in a healthy AZ. I'd validate by watching in-service capacity and latency recover, then write up the timeline. For prevention I'd move to a mixed instances policy, add alarms for capacity near max and for failed scaling activities, and load test the scaling behaviour."

### 21.4 Delivery tips

1. State assumptions out loud ("assuming an ALB, ELB health checks and a launch template").
2. Walk the chain from signal to launch. It shows structure.
3. Prefer read-only diagnostics first and say so.
4. Mention trade-offs (cost versus headroom, Spot versus stability).
5. Do not claim you built something you did not. Use "in a design like this I would…" for hypotheticals, and use your real project experience only where it is genuinely yours.

---

## 22. Quick Revision

### 22.1 Key points to remember

1. ASG = min / desired / max + launch template + policies + health checks. Auto Scaling itself is free.
2. Scale **out/in** is automatic. Scale **up/down** needs a template change and refresh.
3. **Launch templates**, not launch configurations. Pin versions. IMDSv2 required.
4. **ELB health checks** for apps behind a load balancer. Grace period longer than boot time. Shallow health endpoints.
5. **Target tracking** is the default policy. Use requests per target for web, backlog per instance for queues.
6. **Cooldown** (simple scaling), **warm-up** (metrics of new instances), **grace period** (health failures ignored).
7. Instance **refresh** for rolling updates (min healthy %, checkpoints, rollback). Blue/green for fast rollback.
8. **Lifecycle hooks** pause for custom actions. Complete them or set the default result. Instances cost while waiting.
9. **Termination policy** picks the instance (AZ balance first). **Scale-in protection** protects busy ones.
10. **Spot** with mixed instance types, `price-capacity-optimized`, On-Demand base, Capacity Rebalancing.
11. "Not scaling": at max? suspended process? failed activity? alarm no data? wrong metric?
12. Always cap `max_size` and alert when capacity sits at max.

### 22.2 Important commands

| Goal | Command |
| --- | --- |
| Group settings | `aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names <asg>` |
| Why did it launch/fail? | `aws autoscaling describe-scaling-activities --auto-scaling-group-name <asg>` |
| Policies | `aws autoscaling describe-policies --auto-scaling-group-name <asg>` |
| Instance states | `aws autoscaling describe-auto-scaling-instances` |
| Set capacity | `aws autoscaling set-desired-capacity ...` |
| Change limits | `aws autoscaling update-auto-scaling-group --min-size N --max-size M` |
| Rolling update | `aws autoscaling start-instance-refresh ...` / `describe-instance-refreshes` / `cancel-instance-refresh` |
| Debug an instance | `aws autoscaling enter-standby ...` / `exit-standby` |
| Pause a process | `aws autoscaling suspend-processes` / `resume-processes` |
| Protect an instance | `aws autoscaling set-instance-protection --protected-from-scale-in` |
| Hooks | `aws autoscaling put-lifecycle-hook` / `complete-lifecycle-action` |
| Limits | `aws autoscaling describe-account-limits` |

### 22.3 Commonly confused concepts

| Pair | Difference in one line |
| --- | --- |
| Scale out vs scale up | More instances vs bigger instance |
| Scalability vs elasticity | Can grow vs grows and shrinks automatically |
| Cooldown vs warm-up | Wait after simple scaling vs wait before counting new metrics |
| Warm-up vs grace period | Metric accuracy vs health-check tolerance |
| EC2 vs ELB health check | Instance status vs application health |
| Lifecycle hook vs health check | Pause for actions vs detect failure |
| Termination policy vs scale-in protection | Which instance to remove vs do not remove this one |
| Launch template vs configuration | Versioned and current vs immutable and deprecated |
| Target tracking vs step scaling | Managed thermostat vs manual thresholds and steps |
| Scheduled vs predictive | Fixed times vs ML forecast |
| EC2 Auto Scaling vs Application Auto Scaling | EC2 instances vs other AWS resources (ECS, DynamoDB, Lambda) |
| Instance refresh vs blue/green | In-group rolling replacement vs two groups with traffic switch |

### 22.4 Five-minute revision notes

1. **Design:** ALB + ASG in private subnets, 2–3 AZs, launch template with golden AMI, IMDSv2, instance profile.
2. **Limits:** min, max, desired. Cap max. Watch quotas and subnet IPs.
3. **Health:** ELB checks, grace period, shallow endpoint.
4. **Scaling:** target tracking (requests per target), scheduled and predictive for patterns, simple scaling avoided.
5. **Timing:** default instance warm-up, detailed monitoring, headroom, warm pools if boot is slow.
6. **Lifecycle:** hooks for drain and bootstrap, protection for long jobs, deregistration delay for connections.
7. **Rollouts:** pinned versions, instance refresh with checkpoints and rollback, or blue/green.
8. **Cost:** Spot with On-Demand base, Savings Plans for baseline, scheduled scale-in for non-prod.
9. **Troubleshooting:** activity history first, then limits, suspended processes, alarms, launch errors, health checks.
10. **Security:** least privilege, SG from ALB only, Session Manager, KMS access for the service-linked role.

### 22.5 Quick-reference cheat sheet

```text
Capacity      : min <= desired <= max ; policies change desired ; max is the cost cap
Scale         : out/in = ASG ; up/down = change template + instance refresh
Health        : EC2 (instance) | ELB (app, must enable) | grace period > boot time
Policies      : target tracking (default) | step | simple (legacy) | scheduled | predictive
Metrics       : web = ALBRequestCountPerTarget ; workers = backlog per instance ; CPU is not universal
Timers        : cooldown (simple) | warm-up (metrics) | grace period (health) | deregistration delay (ELB drain)
Hooks         : Pending:Wait / Terminating:Wait ; complete-lifecycle-action ; set default result
Refresh       : MinHealthyPercentage, checkpoints, warm-up, auto rollback ; cancel = stop
Spot          : mixed instances, many types, price-capacity-optimized, On-Demand base, 2-min notice
First check   : describe-scaling-activities -> at max? -> suspended? -> alarm state? -> launch errors?
```

### 22.6 Ten rapid-fire questions (with short answers)

1. **Does Auto Scaling scale vertically?** No, it scales out and in.
2. **What are the three capacity settings?** Minimum, desired, maximum.
3. **Which health check detects a crashed app behind an ALB?** ELB (must be enabled).
4. **Which policy type is recommended by default?** Target tracking.
5. **Which metric for a web tier behind an ALB?** Requests per target.
6. **What is the health check grace period for?** Ignoring health failures while an instance boots.
7. **What does a lifecycle hook do?** Pauses launch or termination for custom actions.
8. **What replaces launch configurations?** Launch templates.
9. **Which Spot strategy is usually recommended?** `price-capacity-optimized`.
10. **First command when scaling is not working?** `describe-scaling-activities`.

### 22.7 Final interview readiness checklist

Tick each item only if you can explain it **without notes**.

- [ ] I can draw the ASG + ALB architecture and explain the control loop from metric to launch.
- [ ] I can explain min, desired and max and why max matters for cost and for "not scaling".
- [ ] I can explain launch templates, versions and why to pin them, and the template security settings.
- [ ] I can compare EC2 and ELB health checks and explain the grace period.
- [ ] I can compare target tracking, step, simple, scheduled and predictive scaling, and know target tracking rules.
- [ ] I can explain cooldown, warm-up and grace period without mixing them up.
- [ ] I can choose scaling metrics (requests per target, backlog per instance) and explain why CPU is not always right.
- [ ] I can explain lifecycle hooks, termination policies, scale-in protection and Standby.
- [ ] I can explain instance refresh, blue/green and warm pools, and a rollback plan.
- [ ] I can explain Spot and mixed instances policies with interruption handling.
- [ ] I can read and write a Terraform ASG with ALB, policies and instance refresh.
- [ ] I can troubleshoot "not scaling", "launch-terminate loop", "scale in drops requests" and "refresh stuck" with the eight-step framework.
- [ ] I can explain how EC2 Auto Scaling relates to Application Auto Scaling, Cluster Autoscaler and Karpenter.
- [ ] I have rehearsed at least three scenarios aloud.

### 22.8 Official documentation (verify current details here)

- What is Amazon EC2 Auto Scaling: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html>
- Auto Scaling groups: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html>
- Target tracking scaling policies: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html>
- Step and simple scaling policies: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-simple-step.html>
- Predictive scaling: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-predictive-scaling.html>
- Lifecycle hooks: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html>
- Instance refresh: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-instance-refresh.html>
- Warm pools: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-warm-pools.html>
- Mixed instances groups: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-mixed-instances-groups.html>
- Troubleshooting Amazon EC2 Auto Scaling: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/CHAP_Troubleshooting.html>

> Some of these URLs may be reorganised by AWS over time. If a link moves, search the title on the AWS documentation site.
