# Amazon EC2: Complete Notes and Scenario-Based Interview Prep

**Level:** Beginner to Advanced | **Focus:** AWS, Production Scenarios, Interview Preparation

Structured for 4.5+ years of DevOps experience: AWS administration, CI/CD, Terraform, Kubernetes/EKS, security, troubleshooting, cost optimization, and real-world interview questions.

---

# Part 1: EC2 Detailed Notes

## 1. What is Amazon EC2?

Amazon EC2 (Elastic Compute Cloud) is an AWS service that provides virtual servers in the cloud. You can create, configure, operate, scale, and terminate servers as required.

- **Amazon:** AWS cloud platform.
- **Compute:** CPU, memory, networking, and processing power.
- **Cloud:** Resources are available on demand over a network.
- **Elastic:** You can increase or decrease capacity as workload requirements change.

### Why do we use EC2?

- Host web applications and APIs.
- Run application servers such as Apache, Nginx, Tomcat, and WebSphere.
- Run Jenkins controllers or agents.
- Host monitoring tools such as Prometheus and Grafana.
- Run scripts, automation, and scheduled jobs.
- Host databases when a self-managed database is required.
- Run legacy monolithic applications.
- Create bastion hosts for controlled administrative access.
- Run Terraform, Ansible, and other DevOps automation workloads.
- Host container workloads or self-managed Kubernetes components when appropriate.

**Real-world example:** In a typical enterprise environment, a legacy application might run on EC2, while newer microservices run on Amazon EKS. Jenkins pipelines can deploy the legacy application to EC2 and deploy microservices to EKS.

---

## 2. How EC2 Works

```text
Developer / DevOps Engineer
        |
AWS Console, CLI, Terraform or SDK
        |
Amazon EC2
(Instance type + AMI + IAM role + network settings)
        |
 +------+---------+-----------+-----------+
 |      |         |           |           |
Compute Storage  Networking  Security     |
vCPU,   EBS or   VPC, subnet, IAM, SG,    |
RAM     instance ENI, IP     NACL,        |
        store                key pairs    |
 +------+---------+-----------+-----------+
        |
Running application
(Web server, API, Jenkins, or other workload)
```

### EC2 creation flow

1. Select an AWS Region.
2. Select an Availability Zone through the subnet configuration, or let AWS choose within the selected subnet.
3. Choose an Amazon Machine Image (AMI).
4. Select an instance type.
5. Configure the VPC and subnet.
6. Configure the security group.
7. Attach an IAM instance profile if the application needs AWS API access.
8. Configure the key pair or an alternative access method such as AWS Systems Manager Session Manager.
9. Configure EBS volumes and other instance settings.
10. Launch the instance.
11. Verify the instance status checks.
12. Connect to the instance and configure the application.
13. Monitor, patch, back up, scale, and optimize the instance.

---

## 3. Important EC2 Components

| Component | Purpose |
| --- | --- |
| AMI | Template used to launch an instance |
| Instance type | Defines compute, memory, storage, and network capabilities |
| EBS | Persistent block storage |
| Instance store | Temporary local storage on supported instance types |
| VPC | Isolated virtual network |
| Subnet | Network segment inside a specific Availability Zone |
| Security group | Stateful virtual firewall for network interfaces |
| Key pair | SSH key-based authentication, where configured |
| IAM role | Grants AWS API permissions to applications on the instance |
| Elastic IP | Static public IPv4 address that can be reassociated |
| ENI | Elastic Network Interface |
| User data | Bootstrap script or configuration supplied at launch |
| Metadata service | Provides instance information and temporary role credentials |
| CloudWatch | Metrics, logs, and alarms |
| Auto Scaling | Adjusts instance capacity according to policies and desired capacity |
| Load balancer | Distributes application traffic across targets |

---

## 4. Amazon Machine Image (AMI)

An AMI is a template used to launch EC2 instances. It defines the operating system and can include preinstalled software and configuration.

### What does an AMI contain?

- A root-volume template.
- Operating system and installed software.
- Block-device mapping.
- Launch permissions and architecture compatibility.
- Configuration needed to initialize the machine.

### Types of AMIs

- **AWS-provided AMIs:** For example, Amazon Linux.
- **Marketplace AMIs:** Third-party operating systems and software.
- **Community AMIs:** Shared by other AWS users; inspect trustworthiness carefully.
- **Custom AMIs:** Created by your organization with required packages and hardening.

### How to create an AMI

1. Launch and configure an EC2 instance.
2. Install the application, dependencies, agents, and security patches.
3. Remove secrets, temporary files, and machine-specific configuration.
4. Create an AMI from the instance.
5. Test launching a new instance from that AMI.
6. Use the approved AMI in Auto Scaling groups or deployment workflows.

AWS generally creates EBS snapshots for the EBS-backed volumes included in the image.

### AMI vs EBS snapshot

| AMI | EBS snapshot |
| --- | --- |
| Used as an instance-launch template | Point-in-time backup of an EBS volume |
| Includes launch metadata and block-device mappings | Captures volume data |
| Can include snapshots of associated EBS volumes | Does not independently define a complete instance launch configuration |
| Useful for golden images and repeatable provisioning | Useful for volume backup, restoration, and migration |

**Interview question:** Can you launch multiple EC2 instances from one AMI?

Yes. You can launch multiple compatible instances from the same AMI, with each instance receiving its own instance identity and writable storage volumes as configured.

---

## 5. EC2 Instance Types

An instance type determines the hardware resources allocated to an EC2 instance.

### Main instance families

| Family | Primary purpose | Example workloads |
| --- | --- | --- |
| General purpose (M, T) | Balanced CPU and memory | Web servers, Jenkins agents, small applications |
| Compute optimized (C) | High CPU performance | CPU-intensive builds, batch jobs, compute workloads |
| Memory optimized (R, X, U) | High memory capacity | In-memory databases, analytics, large caches |
| Storage optimized (I, D, H) | High storage performance or capacity | Search engines, distributed storage, data-intensive workloads |
| Accelerated computing (P, G, Inf, Trn) | GPU or specialized accelerators | AI/ML, graphics, model inference and training |

Exact instance capabilities depend on the generation and specific size.

### Understanding an instance name

Example: `m7i.large`

- `m`: general-purpose family.
- `7`: generation.
- `i`: additional family variant identifier.
- `large`: size within that family.

Do not assume all instance types offer the same network throughput, storage, CPU architecture, or hardware features.

### What is a burstable instance?

T-family instances can use CPU credits to burst above their baseline CPU performance.

- Useful for workloads with intermittent CPU spikes.
- Sustained high CPU consumption can exhaust credits in applicable operating modes.
- Monitor CPU utilization and CPU credit metrics where applicable.
- For consistently high CPU demand, compare compute-optimized or other suitable instance families.

### How do you select an instance type in production?

- Measure CPU and memory utilization.
- Identify application latency and throughput requirements.
- Check architecture compatibility, such as x86 versus Arm.
- Evaluate network and EBS bandwidth requirements.
- Run load tests.
- Review CloudWatch metrics and application-level telemetry.
- Compare cost and availability.
- Right-size based on measured usage rather than assumptions.

---

## 13. How to Connect to EC2

### 13.1 Connect to a Linux instance using SSH

**Prerequisites:**

- Instance is running and passes required status checks.
- The correct private key is available.
- Security group permits SSH from the approved source.
- Route tables, public IP or private connectivity, and OS configuration permit access.
- Correct username is used for the AMI.

**Example:**

```bash
chmod 400 devops-key.pem

ssh -i devops-key.pem ec2-user@<PUBLIC_IP>
```

**Common default usernames:**

- Amazon Linux: `ec2-user`
- Ubuntu: `ubuntu`
- RHEL: commonly `ec2-user` or `root`, depending on the image configuration; verify the image documentation.

### 13.2 Connect using AWS Systems Manager Session Manager

Session Manager can provide shell access without opening inbound SSH or managing SSH keys, when prerequisites are satisfied.

**Requirements include:**

- SSM Agent installed and running.
- An appropriate IAM role attached to the instance.
- Systems Manager permissions configured correctly.
- Network connectivity to Systems Manager endpoints through the internet, NAT, or VPC endpoints.
- Required account and operator permissions.

This is often preferred in enterprise environments because access can be controlled through IAM and audited.

### 13.3 Windows EC2

- Connect using RDP when network access and security rules permit.
- Use the appropriate Windows credentials.
- Restrict RDP access to approved networks.
- Consider Systems Manager for managed access where supported.

---

## 14. EC2 Monitoring Using CloudWatch

Monitoring should cover the operating system, infrastructure, and application.

### Important metrics

| Metric | What it tells you |
| --- | --- |
| CPUUtilization | Percentage of allocated CPU utilization |
| StatusCheckFailed | Whether supported EC2 health checks are failing |
| NetworkIn | Incoming network traffic |
| NetworkOut | Outgoing network traffic |
| DiskReadBytes | Bytes read from instance storage |
| DiskWriteBytes | Bytes written to instance storage |
| EBSReadOps | EBS read operations |
| EBSWriteOps | EBS write operations |
| EBSIOBalance% | I/O credit balance for supported volume configurations |
| CPUCreditBalance | Remaining CPU credits for applicable burstable instances |

> **Important:** EC2 basic metrics do not automatically provide every guest operating system metric. For memory usage, filesystem utilization, and detailed OS-level metrics, configure the CloudWatch agent or another monitoring agent.

### Production monitoring setup

- Enable relevant EC2 metrics.
- Install and configure the CloudWatch agent.
- Collect memory, disk, and application logs.
- Create CloudWatch alarms for CPU, status-check failures, and critical capacity thresholds.
- Send alarm notifications to the operations team using SNS or an integrated alerting system.
- Create dashboards for instance health and application performance.
- Integrate with Prometheus/Grafana where appropriate.
- Test alert delivery and recovery procedures.

### Example alarm thresholds

*These are illustrative starting points, not universal production thresholds.*

- CPU above 80% for 5 minutes.
- Root filesystem above 85%.
- Memory usage above 85%.
- Failed status check.
- Application health endpoint returning errors.
- EBS volume latency or queue depth exceeding workload-specific thresholds.

Use application latency, request rate, error rate, and saturation metrics alongside infrastructure metrics.

---

## 15. EC2 Status Checks

Amazon EC2 provides infrastructure and instance-level health checks, with attached-EBS checks also available. Application-level status checks can be configured separately.

### System status check failure

Usually indicates an issue with the underlying AWS infrastructure or host.

**Possible causes:**

- Underlying hardware issue.
- Loss of network connectivity.
- Host power or system problem.

**Actions:**

- Review the status-check details and AWS Health notifications.
- Check scheduled events.
- Determine whether automatic recovery is supported and configured.
- Consider stop/start for a suitable EBS-backed instance if appropriate.
- For critical services, fail over to a healthy instance or replace the instance through Auto Scaling.

### Instance status check failure

Usually indicates a problem with the guest operating system or its network configuration.

**Possible causes:**

- OS boot failure.
- Incorrect network configuration.
- Exhausted memory.
- Filesystem corruption.
- Kernel or startup problem.

**Actions:**

- Check system and instance status separately.
- Review EC2 console output and system logs.
- Use serial console access if supported and authorized.
- Check recent OS, kernel, firewall, or boot configuration changes.
- Repair the OS or recover from a healthy snapshot or AMI.

### Attached EBS status check failure

Investigate EBS reachability and volume I/O problems. Check the volume state, metrics, recent changes, and AWS Health events.

---

## 16. EC2 Auto Scaling

Amazon EC2 Auto Scaling automatically maintains the required number of instances and can adjust capacity based on demand.

### Important components

- **Launch template:** Defines the AMI, instance type, security groups, IAM profile, storage, and other launch settings.
- **Auto Scaling group (ASG):** Defines minimum, desired, and maximum capacity.
- **Scaling policy:** Controls when capacity increases or decreases.
- **Health checks:** Help identify unhealthy instances for replacement.
- **Load balancer integration:** Distributes traffic across healthy registered targets.

### Example

Suppose an application needs:

- Minimum capacity: 2 instances.
- Desired capacity: 2 instances.
- Maximum capacity: 6 instances.

When demand rises, a scaling policy can increase capacity. When demand falls, it can reduce capacity, subject to policy settings and cooldown or warm-up behavior.

### Types of scaling

- **Target tracking:** Maintains a metric near a target, such as average CPU utilization.
- **Step scaling:** Adjusts capacity by different amounts based on alarm thresholds.
- **Simple scaling:** Adjusts capacity based on a CloudWatch alarm and configured adjustment.
- **Scheduled scaling:** Changes capacity according to a known schedule.
- **Predictive scaling:** Forecasts future demand using historical patterns for supported configurations.

### Production best practices

- Deploy across multiple Availability Zones.
- Use health checks and load balancer integration.
- Use launch templates and versioned configuration.
- Make instances replaceable rather than relying on manual server repairs.
- Keep application state outside individual instances where possible.
- Use lifecycle hooks when controlled startup or shutdown is needed.
- Monitor scaling events and test scale-in behavior carefully.

---

## 17. Elastic Load Balancing with EC2

A load balancer distributes requests across registered targets.

### Common load balancer types

- **Application Load Balancer (ALB):** HTTP/HTTPS traffic, host-based routing, path-based routing.
- **Network Load Balancer (NLB):** Layer 4 traffic and use cases requiring high-performance TCP/UDP or supported TLS handling.
- **Gateway Load Balancer (GWLB):** Deploys and scales supported virtual network appliances.

### Typical architecture

```text
Users / Clients
      |
Application Load Balancer
(HTTPS listener, rules, health checks)
      |
  +---+---+
  |       |
EC2-A   EC2-B
(AZ A)  (AZ B)

Instances managed by an Auto Scaling group
```

### Troubleshooting an unhealthy target

- Check the target group's health status and reason.
- Verify the health-check path and expected response code.
- Check whether the application process is running.
- Confirm the application listens on the correct interface and port.
- Check the EC2 security group allows traffic from the load balancer security group.
- Review application logs and load balancer access logs.
- Verify network ACLs and routes.
- Check startup time, timeout, and health-check thresholds.

---

## 18. EC2 High Availability and Disaster Recovery

High availability means minimizing service interruption when an instance, Availability Zone, or other component fails.

### High-availability design

- Use at least two Availability Zones for critical workloads where appropriate.
- Deploy an Auto Scaling group across those zones.
- Put a load balancer in front of the application.
- Keep important application data on durable services rather than instance-local storage.
- Back up EBS volumes and maintain recoverable AMIs.
- Store application artifacts in durable storage such as S3 or an appropriate artifact repository.
- Monitor health and automate replacement.
- Test recovery procedures regularly.

### Backup vs high availability vs disaster recovery

- **Backup:** Helps recover data after deletion, corruption, or other loss.
- **High availability:** Helps maintain service during failures.
- **Disaster recovery:** Restores a service in a defined recovery timeframe after a major disruption.

Know your **RPO** (Recovery Point Objective) and **RTO** (Recovery Time Objective) when designing recovery procedures.

---

## 19. EC2 Cost Optimization

Cost optimization is a key responsibility for DevOps and SRE engineers.

### Practical strategies

- Right-size instances based on actual CPU, memory, network, and storage demand.
- Stop non-production instances outside working hours when safe.
- Use Auto Scaling to match capacity to demand.
- Evaluate Savings Plans or Reserved Instances for stable eligible usage.
- Use Spot Instances for interruption-tolerant workloads.
- Delete unused EBS volumes after verifying they are not needed.

---

# Part 2: 15 Real-World Scenario-Based Interview Questions and Answers

These scenarios cover the major EC2 concepts that interviewers expect a DevOps Engineer, Cloud Engineer, Platform Engineer, or SRE with 4.5+ years of experience to understand.

For every scenario, prepare to explain:

- What is the problem?
- How will you troubleshoot it?
- Which AWS services and Linux commands will you use?
- What is the root cause and permanent fix?
- How will you prevent it from happening again?

---

## Scenario 1: EC2 is running, but you cannot connect through SSH

*Networking + Security + Linux*

**Interviewer:** You launched an EC2 instance in AWS. The instance state is `running`, but you cannot connect using SSH. How will you troubleshoot?

### Answer: Step by step

**Step 1: Check the instance health**

- Verify the instance is running.
- Check system and instance status checks.
- Review the EC2 console output if the instance failed during boot.

**Step 2: Check network configuration**

- If connecting over the internet, verify the instance has a public IPv4 address or another suitable public route.
- Confirm the subnet route table has a route to an Internet Gateway.
- Check that the security group allows inbound TCP port 22 from your approved public IP.
- Check the network ACL's inbound and outbound rules, including ephemeral response ports.
- Verify that the client is connecting to the correct IP address.

**Step 3: Check authentication**

- Verify the correct private key.
- Check the Linux username.
- Check the SSH daemon and OS firewall if you have an alternative access method.

```bash
chmod 400 devops-key.pem
ssh -i devops-key.pem ec2-user@<PUBLIC_IP>
```

After gaining access:

```bash
sudo systemctl status sshd
sudo ss -lntp | grep ':22'
sudo journalctl -u sshd --since "30 minutes ago"
```

**Step 4: Check an alternative access method**

Use AWS Systems Manager Session Manager if the instance is configured and managed for it.

**Permanent fix:**

- Use restricted security group rules.
- Prefer Session Manager when suitable.
- Monitor status checks.
- Document a standard access and recovery procedure.

> **Interview takeaway:** An instance can be `running` without being reachable. Instance state, network reachability, and authentication are three different things.

---

## Scenario 2: EC2 CPU utilization suddenly reaches 100%

*Performance + CloudWatch + SRE*

**Interviewer:** A production EC2 instance was running normally, but CPU utilization suddenly reached 100%. The application is slow. What will you do?

### Answer: Step by step

**Step 1: Check CloudWatch**

- Review `CPUUtilization`.
- Identify when the spike started.
- Correlate it with deployment events, traffic changes, and scheduled jobs.
- Review application latency and error rates.

**Step 2: Identify the process consuming CPU**

```bash
top
ps aux --sort=-%cpu | head
uptime
```

**Step 3: Investigate the root cause**

Possible causes:

- Infinite loops or inefficient application code.
- Increased user traffic.
- Too many application threads or processes.
- Expensive database queries.
- A runaway background job.
- Malware or an unexpected process.

**Step 4: Mitigate the incident**

- Stop or correct a confirmed runaway process, if safe.
- Roll back a faulty release when evidence supports it.
- Scale out behind a load balancer if the application is horizontally scalable.
- Resize the instance if sustained workload requirements justify it.

**Step 5: Prevent recurrence**

- Configure CloudWatch alarms.
- Use Auto Scaling for suitable workloads.
- Add application-level metrics and distributed tracing.
- Conduct load testing and capacity planning.

> **Important:** If the instance uses a burstable T-family type, also inspect applicable CPU credit metrics. A depleted CPU credit balance can explain throttled performance, but it does not by itself explain every 100% CPU incident.

---

## Scenario 3: EC2 root disk is 100% full

*EBS + Linux + Storage*

**Interviewer:** Your application has stopped working because the root filesystem is full. How will you resolve the problem without losing data?

### Answer: Step by step

**Step 1: Identify the affected filesystem**

```bash
df -h
df -i
lsblk
```

- `df -h`: checks filesystem space.
- `df -i`: checks inode exhaustion.
- `lsblk`: shows disks and partitions.

**Step 2: Find what is consuming space**

```bash
sudo du -xhd1 /var 2>/dev/null | sort -h
sudo du -xhd1 / 2>/dev/null | sort -h
```

Check application logs, temporary files, container images, caches, and core dumps.

**Step 3: Recover space safely**

- Rotate or archive logs according to retention requirements.
- Remove only verified disposable files.
- Investigate deleted files still held open by running processes.
- Avoid deleting database files or important logs blindly.

**Step 4: Increase storage if necessary**

- Modify the EBS volume size in AWS.
- Confirm the volume modification has progressed sufficiently.
- Extend the partition if the disk layout requires it.
- Extend the filesystem using the correct OS-specific tool.
- Verify the new capacity.

Examples of filesystem tools, depending on the configuration:

```bash
sudo growpart /dev/nvme0n1 1
sudo resize2fs /dev/nvme0n1p1
```

For XFS, use `xfs_growfs` on the mounted filesystem instead of `resize2fs`. Device names and partition numbers must be verified before running commands.

**Permanent fix:**

- Set disk utilization alarms.
- Configure log rotation.
- Apply retention policies.
- Monitor both filesystem space and inodes.

> **Interview takeaway:** Increasing an EBS volume does not always automatically enlarge the partition and filesystem inside Linux.

---

## Scenario 4: Your EC2 public IP changes after a restart

*Networking + Elastic IP*

**Interviewer:** Your application was working using a public IP. After stopping and starting the EC2 instance, the IP changed and users cannot reach the application. Why?

### Answer

An automatically assigned public IPv4 address can change when an EC2 instance is stopped and started.

**How I will fix it:**

- Verify the new public IP.
- Check DNS records and any external systems pointing to the old IP.
- Associate an Elastic IP if a stable public IPv4 address is genuinely required.
- Alternatively, put the instance behind an Application Load Balancer and use a DNS name.
- Update configuration and verify connectivity.

**Important differences:**

- Private IPv4 normally remains the same through stop/start.
- Auto-assigned public IPv4 can change.
- An Elastic IP provides a stable public IPv4 address while appropriately allocated and associated.
- A load balancer is generally preferable to binding production application access to an individual EC2 address.

**Permanent fix:** Use Route 53 with an appropriate load balancer or another stable service endpoint rather than relying on an individual instance's public IP.

---

## Scenario 5: An EC2 instance needs to access S3, but AWS returns `AccessDenied`

*IAM + Security*

**Interviewer:** An application running on EC2 needs to download files from S3, but the AWS CLI returns `AccessDenied`. What will you check?

### Answer: Step by step

**Step 1: Verify the identity being used**

```bash
aws sts get-caller-identity
```

Confirm the account and principal are the expected ones.

**Step 2: Check the IAM role**

- Confirm the EC2 instance has the correct IAM instance profile.
- Verify the role's permissions policy allows the required S3 actions.
- Check the resource ARN, bucket name, and object path.

**Step 3: Check other access controls**

Access may also be restricted by:

- An S3 bucket policy.
- AWS Organizations service control policies.
- A permissions boundary.
- A VPC endpoint policy.
- An explicit deny.
- KMS key permissions when accessing encrypted objects.

**Step 4: Apply least privilege**

For example, an application that only downloads files should normally receive only the necessary read permissions for the relevant bucket or prefix.

Do not solve the problem by granting `AdministratorAccess` or making the bucket public.

**Permanent fix:** Use an EC2 IAM role with temporary credentials and narrowly scoped permissions. Do not store permanent AWS access keys in scripts or application configuration.

> **Interview takeaway:** IAM identity permissions are only one part of the AWS authorization decision.

---

## Scenario 6: EC2 is healthy, but the application is not accessible

*Linux + Application Troubleshooting*

**Interviewer:** Your EC2 instance is running and both status checks are passing, but users receive `502 Bad Gateway` or `Connection refused`. What will you do?

### Answer: Step by step

**Step 1: Check the application service**

```bash
sudo systemctl status nginx
sudo systemctl status httpd
```

Check the actual service used by your application.

**Step 2: Verify the listening port**

```bash
sudo ss -lntp
curl -v http://localhost:8080/
```

Check whether the application is listening on the expected port and interface.

**Step 3: Check application logs**

```bash
sudo journalctl -u nginx --since "30 minutes ago"
sudo tail -n 100 /var/log/messages
```

Review application-specific logs as well.

**Step 4: Check the network path**

- Security group inbound rules.
- Load balancer listener and target group.
- Target health-check path and port.
- OS firewall.
- Network ACLs and routing.
- Backend or database connectivity.

**Step 5: Restore service**

Fix the failed dependency or service configuration. Roll back the release if the failure started immediately after a deployment and rollback is appropriate.

### Understand these errors

| Error | Common interpretation |
| --- | --- |
| Connection refused | Nothing is accepting the connection, or a firewall actively rejects it |
| Connection timed out | Traffic may be dropped or the destination may be unreachable |
| 502 Bad Gateway | Proxy or load balancer cannot obtain a valid backend response |
| 503 Service Unavailable | Service or backend capacity may be unavailable |

**Permanent fix:** Configure health checks, application monitoring, structured logs, and deployment rollback procedures.

---

## Scenario 7: EC2 instance is running, but its status check fails

*Infrastructure + Recovery*

**Interviewer:** An EC2 instance is in the `running` state, but the status check is failing. How do you troubleshoot?

### Answer

First, identify which check failed.

**1. System status check**

Usually points to an underlying AWS infrastructure issue.

Actions:

- Check AWS Health and scheduled events.
- Review system status-check details.
- Consider supported automatic recovery mechanisms.
- Consider stopping and starting an EBS-backed instance if appropriate, understanding that this can move it to different underlying hardware and change its auto-assigned public IP.

**2. Instance status check**

Usually points to a problem with the guest OS or its networking.

Actions:

- Review console output and system logs.
- Investigate boot failures, filesystem problems, memory exhaustion, or incorrect network configuration.
- Use an authorized serial console or recovery approach if available.
- Repair the system or replace it from a known-good image if recovery is safer.

**3. Attached EBS status check**

Investigate EBS connectivity and I/O issues, including volume state, metrics, and AWS Health events.

**Permanent fix:**

- Use multi-AZ architecture for critical services.
- Automate replacement through Auto Scaling where suitable.
- Maintain recoverable AMIs and backups.
- Test disaster-recovery procedures.

> **Key concept:** `running` describes instance state, not proof that the operating system or application is healthy.

---

## Scenario 8: Your application must handle a sudden increase in traffic

*Auto Scaling + Load Balancing*

**Interviewer:** Your application runs on two EC2 instances. Traffic increases tenfold during a campaign. How will you handle the load?

### Answer

I would design a scalable and highly available architecture.

```text
Users
  |
Application Load Balancer
  |
Auto Scaling Group
  |
EC2-A    EC2-B    EC2-C+
(Instances spread across Availability Zones)
```

**Step 1: Configure Auto Scaling**

For example:

- Minimum: 2 instances.
- Desired: 2 instances.
- Maximum: 10 instances.

Actual capacity depends on load testing and capacity requirements.

**Step 2: Configure scaling policies**

- Target tracking using average CPU utilization, or a suitable request-based metric.
- Appropriate instance warm-up and health checks.
- Scaling limits and notifications.

**Step 3: Configure the load balancer**

- Register instances in a target group.
- Set suitable health checks.
- Allow traffic from the load balancer security group to the application security group.

**Step 4: Validate the whole system**

Scaling EC2 alone might not resolve a bottleneck in the database, connection pool, or downstream service. Check those components too.

**Step 5: Test**

Run load tests, verify scale-out and scale-in behavior, and test failure in one Availability Zone.

**Permanent fix:** Make application instances replaceable and stateless where possible. Store persistent data in appropriate shared or managed services.

---

## Scenario 9: You need to update an EC2 application without downtime

*High Availability + Deployment Strategy*

**Interviewer:** Your production application runs on four EC2 instances. You need to deploy a new version without downtime. What approach will you use?

### Answer

I would use a rolling deployment or blue-green deployment, depending on the application's architecture and rollback requirements.

### Option A: Rolling deployment

1. Build and test the release in the CI pipeline.
2. Prepare the new artifact or launch template version.
3. Update a subset of instances.
4. Wait for application startup and health checks.
5. Verify error rates and latency.
6. Continue with the remaining instances.
7. Roll back if validation fails.

### Option B: Blue-green deployment

- **Blue:** Current production environment.
- **Green:** New environment running the new version.

Steps:

1. Create the green environment.
2. Deploy the new application.
3. Run smoke tests and health checks.
4. Shift traffic using the load balancer or another suitable traffic-routing mechanism.
5. Monitor the application.
6. Roll traffic back to blue if issues occur.
7. Retire blue only after the rollback window and validation requirements are satisfied.

### Important considerations

- Database schema changes must be backward compatible where required.
- Session state must not depend on a single instance.
- Load balancer deregistration and connection draining must be handled.
- Health checks must validate application readiness, not merely whether a port is open.

**Permanent fix:** Automate deployment and rollback using Jenkins or another CI/CD system, version artifacts, and monitor releases with application-level metrics.

---

## Scenario 10: An EC2 instance has stopped, but the AWS bill is still increasing

*EBS + Billing + Cost Optimization*

**Interviewer:** You stopped a non-production EC2 instance, but its monthly AWS cost did not become zero. Why?

### Answer

Stopping an EC2 instance normally stops its compute-instance usage charges, but other resources can continue to incur charges.

**Check:**

- **EBS volumes:** Persistent storage continues to incur applicable storage charges.
- **EBS snapshots:** Stored snapshots can continue to incur charges.
- **Elastic IP addresses:** An allocated public IPv4 address can incur charges even when not associated, and public IPv4 pricing generally applies under current AWS pricing rules.
- **Load balancers:** Existing load balancers can continue to incur charges.
- **NAT Gateway:** Charges may continue while it exists, including applicable processing charges.
- **Data transfer and other associated resources:** These can contribute to the bill.

### How I will investigate

- Open AWS Cost Explorer.
- Filter by service, Region, and usage type.
- Inspect EC2 instances, EBS volumes, snapshots, public IPv4 addresses, and networking resources.
- Identify the exact resource before deleting anything.

### Permanent fix

- Apply ownership and environment tags.
- Automate shutdown schedules for eligible development instances.
- Remove verified unused resources.
- Establish snapshot retention policies.
- Set AWS Budgets and cost alerts.

> **Interview takeaway:** Stopping an instance is not the same as deleting all resources associated with it. Cost optimization requires understanding the entire resource lifecycle.

---

## Scenario 11: Your EC2 instance was terminated accidentally

*AMI + EBS + Disaster Recovery*

**Interviewer:** A team member accidentally terminated a production EC2 instance. The application is down. How will you recover it?

### Answer: Step by step

**Step 1: Confirm what was deleted**

- Identify the terminated instance ID and its attached resources.
- Check whether the root EBS volume was deleted on termination.
- Inspect persistent EBS volumes, snapshots, AMIs, and backups.
- Review CloudTrail events to understand who terminated the instance and when.

**Step 2: Recover the application**

If a suitable AMI exists:

- Launch a replacement instance from the AMI.
- Configure the correct subnet, security groups, IAM role, and instance type.
- Restore application data from persistent storage or backups if needed.
- Register the replacement with the load balancer.
- Verify health checks and application functionality.

If a root volume or data volume survived, evaluate whether it can safely be attached to a replacement instance.

**Step 3: Restore traffic**

- Update target registrations or routing where necessary.
- Validate DNS, TLS, application dependencies, and data integrity.
- Confirm service health and monitor errors.

### How will you prevent it?

- Restrict `ec2:TerminateInstances` permissions.
- Use change approvals for production.
- Enable CloudTrail and relevant alerts.
- Maintain tested AMIs and backups.
- Use Auto Scaling for replaceable application servers.
- Configure termination protection as an additional safeguard where appropriate.

> **Important:** Termination protection is not a substitute for IAM controls or backups. It does not prevent every possible deletion pathway.

> **Interview takeaway:** EC2 instances should be replaceable, but durable application data must have its own recovery strategy.

---

## Scenario 12: You have to stop 100 development EC2 instances every night

*Automation + AWS CLI + IAM*

**Interviewer:** Your company has 100 development EC2 instances. They should stop at night and start every morning to reduce costs. How will you automate this?

### Answer

I would use tag-based scheduling with EventBridge and an appropriate automation mechanism, such as Lambda, Systems Manager Automation, or a scheduling solution supported by the environment.

**Step 1: Identify eligible instances**

For example, apply these tags:

```text
Environment = dev
AutoSchedule = enabled
```

Never select instances solely by instance type or by stopping every instance in the account.

**Step 2: Create a schedule**

- Schedule a stop action at the approved evening time.
- Schedule a start action before business hours.
- Use the correct time zone and daylight-saving considerations if relevant.

**Step 3: Configure least-privilege permissions**

The automation role needs only the permissions necessary to discover eligible instances and perform approved start/stop operations.

**Step 4: Implement safety checks**

- Exclude production and shared infrastructure.
- Respect maintenance windows and active jobs.
- Handle instances already stopped or in transitional states.
- Log the instance IDs processed and report failures.

**Step 5: Validate**

- Confirm instances start successfully.
- Check application health after startup.
- Notify resource owners when an instance fails to start.

*Note: the source text ends here, partway through the example AWS CLI command for this scenario. Scenarios 13 to 15 were not included.*
