# DevOps Fundamental

DEVOPS INTERVIEW PREPARATION

Master Guide

─────────────────────────────────────────

Role: DevOps Engineer

Project: UK Government (CMG)

Experience: 4 Years

Prepared For: DevOps | SRE | Cloud | Platform | DevSecOps | Architect

Toolchain Snapshot

Git | Jenkins | SonarQube | Docker | Trivy | AWS ECR | Kubernetes | AWS EKS | Terraform | Ansible | CloudWatch | AWS

SECTION 1: DEVOPS FUNDAMENTALS

Q1: What is DevOps, and why is it important?

Simple Definition

DevOps is a culture, process, and automation practice that bridges Development and Operations teams to deliver software faster, safer, and more reliably.

Detailed Explanation

DevOps is NOT a tool. It is a philosophy that unifies people, process, and technology. It breaks down the traditional wall between Dev (who write code) and Ops (who run systems). DevOps teams share responsibility for the full software lifecycle — from writing code all the way to running it in production and monitoring it.

Why Is It Used?

Traditional software delivery was slow because Dev and Ops were in separate silos. Dev threw code 'over the wall' to Ops, who then struggled to deploy it. This caused delays, bugs, and blame games. DevOps solves this by making both teams collaborate throughout the full SDLC.

How Does It Work?

DevOps works by applying CAMS — Culture, Automation, Measurement, and Sharing. Teams collaborate using shared tools, automate repetitive tasks (build, test, deploy), measure performance using metrics, and share knowledge across functions. CI/CD pipelines are the engine of DevOps delivery.

Business Value

Faster releases mean faster revenue. Automation reduces human error. Continuous monitoring means faster incident resolution. Studies (DORA Report) show high-performing DevOps teams deploy 200x more frequently with 2,555x faster recovery times than low performers.

Real-Time Example (CMG Project)

In our CMG UK Government project, Dev and Ops teams collaborate on the same Jenkins pipelines, Kubernetes manifests, and Terraform scripts. When a microservice like Payment Service is updated, it goes through Jenkins → SonarQube → Trivy → ECR → EKS without manual handoffs between teams.

Production Usage

DevOps pipelines automate build, test, security scan, and deployment for all 50+ microservices on EKS. Rollback is automated using Helm. Monitoring is real-time via CloudWatch. Deployment frequency improved from bi-monthly to daily releases.

Security Considerations

DevOps enables shift-left security — security checks are embedded in the pipeline (SonarQube for code, Trivy for containers) rather than done at the end. IAM roles follow least privilege. Secrets are managed via AWS Secrets Manager, not hardcoded.

Architect Perspective

A good DevOps architect designs for speed without sacrificing stability or security. The foundation is a reliable CI/CD pipeline, immutable infrastructure using Terraform, and observability via CloudWatch. Architecture decisions should reduce Mean Time to Recover (MTTR) and increase deployment frequency.

Interviewer's Expectation

The interviewer wants you to show that DevOps is a mindset, not a job title or a tool. Demonstrate you understand culture + automation + measurement + sharing.

Common Mistakes

❌ 'DevOps is a tool like Jenkins' → ✅ 'DevOps is a culture and practice. Jenkins is one tool in the DevOps toolchain.'
❌ 'DevOps removes Ops teams' → ✅ 'DevOps integrates Ops into the full SDLC with shared responsibility.'

30-Second Interview Answer

DevOps is a culture and practice that brings Development and Operations together to deliver software faster and more reliably using automation, CI/CD pipelines, and continuous feedback. In our CMG project, we use Jenkins, Docker, and AWS EKS to deploy 50+ microservices daily with security built into every stage.

Easy Memory Trick

Think: Dev + Ops = DevOps. Like a relay race — Dev builds, Ops runs, but both train together, share the baton, and win together.

Q2: What are the key differences between DevOps and Agile?

Simple Definition

Agile focuses on iterative software development. DevOps focuses on end-to-end delivery — from development through operations and monitoring.

Agile vs DevOps Comparison Table

Aspect

Agile

Focus

Software development process

Scope

Dev team only

Goal

Faster iterations (sprints)

Outcome

Working software every sprint

Teams Involved

Dev + QA

Key Practices

Scrum, Kanban, User Stories

Feedback

From product owner after sprint

Automation

Not mandatory

Example

2-week sprint → new feature built

Aspect

DevOps

Focus

Full software delivery lifecycle

Scope

Dev + QA + Ops + Security + Cloud

Goal

Faster, reliable delivery to production

Outcome

Software deployed and monitored in prod

Teams Involved

Dev + QA + Ops + Security

Key Practices

CI/CD, IaC, Monitoring, Automation

Feedback

From production monitoring (real users)

Automation

Core principle

Example

Feature built, tested, deployed, monitored daily

30-Second Answer

Agile improves HOW we build software (iterative sprints). DevOps improves HOW we deliver software end-to-end — build, test, deploy, and monitor. In CMG, we follow Agile sprints for development AND DevOps pipelines for automated delivery to EKS.

Q3: What are the core components of a DevOps culture?

Simple Definition

DevOps culture is built on CAMS: Culture, Automation, Measurement, and Sharing. These four pillars make teams work together efficiently.

Detailed Explanation

DevOps culture has seven pillars: Collaboration (teams work together), Automation (remove manual steps), Measurement (track metrics), Sharing (knowledge transfer), Lean (remove waste), Continuous Improvement (always get better), and Feedback Loops (learn from production).

Why Is It Used?

Without culture, tools are useless. You can install Jenkins and Terraform, but if teams still operate in silos, you haven't achieved DevOps. Culture is the foundation that makes all tools effective.

How Does It Work?

CAMS framework: Culture = shared responsibility and blameless postmortems. Automation = CI/CD pipelines, IaC. Measurement = DORA metrics (Deployment Frequency, Lead Time, MTTR, Change Failure Rate). Sharing = runbooks, wikis, cross-team sessions.

Business Value

Business outcomes: faster delivery, fewer production incidents, reduced burnout, higher employee satisfaction, and better customer experience.

Real-Time Example (CMG Project)

In our CMG project, Dev and Ops teams share the same Jenkins pipelines. When a deployment fails, we conduct a blameless postmortem. Knowledge is shared through internal wikis. Security team is included in pipeline design (DevSecOps). Everyone owns the pipeline together.

Production Usage

No specific tools deployed here, but practiced daily across Jenkins, EKS, Terraform, and monitoring.

Security Considerations

Culture includes security culture. Developers are trained on OWASP top 10. Security reviews happen in sprint planning. Trivy scans are mandatory before ECR push.

Architect Perspective

Culture is not optional — it is the highest-ROI investment in DevOps. Tools without culture produce automation debt. Architect for systems where teams are incentivized to collaborate — shared on-call, shared metrics, shared success criteria.

Interviewer's Expectation

Interviewers want to hear you understand that DevOps is more than tools. Mention CAMS, blameless postmortems, shared responsibility, and continuous improvement.

Common Mistakes

❌ Listing only tools as 'DevOps culture' → ✅ CAMS + real culture practices like blameless postmortems and shared ownership.

30-Second Interview Answer

DevOps culture rests on CAMS — Culture, Automation, Measurement, Sharing. In CMG, all teams own the pipeline together. We automate builds with Jenkins, measure with CloudWatch metrics, and share knowledge through runbooks and postmortems. The goal is shared responsibility, not blame.

Easy Memory Trick

Remember CAMS: Culture → team; Automation → tools; Measurement → metrics; Sharing → knowledge. Like a football team: everyone plays together, tracks the score, and reviews after the game.

Q4: What are the benefits of using containers in DevOps?

Simple Definition

Containers package an application and all its dependencies together, ensuring it runs the same way everywhere — dev, test, staging, and production.

Detailed Explanation

A container is a lightweight, standalone executable package that includes code, runtime, libraries, and settings. Unlike virtual machines, containers share the host OS kernel, making them faster and lighter. Docker is the most popular containerization tool.

Why Is It Used?

Containers solve the classic 'it works on my machine' problem. They provide environment consistency, fast startup, efficient resource use, and enable microservices architecture and scalable deployments on Kubernetes.

How Does It Work?

Docker builds an image from a Dockerfile. The image is immutable and tagged with a version. The container runs the image. In our pipeline: Code → Docker Build → Trivy Scan → Push to ECR → EKS pulls and runs the container.

Business Value

Containers enabled our CMG project to go from monolithic deployments (slow, risky, full-system deploys) to 50+ independently deployable microservices on EKS. Deployment time reduced from hours to minutes.

Real-Time Example (CMG Project)

In CMG: Developer commits code → Jenkins builds Docker image → Trivy scans for vulnerabilities → Image pushed to AWS ECR → EKS pulls image → Pod runs Payment Service or Notification Service independently.

Production Usage

Faster deployments per service. Consistent environments. Easy rollback (just redeploy previous image tag).

Security Considerations

Container images must be scanned with Trivy before being pushed to ECR. Use minimal base images (Alpine/Distroless). Never run containers as root. Implement network policies in Kubernetes. Use ECR lifecycle policies to clean old images.

Architect Perspective

Containers are the foundation of cloud-native architecture. Combined with Kubernetes (orchestration), Helm (packaging), and ECR (registry), containers enable immutable deployments, fast scaling, and fault isolation across microservices.

Interviewer's Expectation

Expect you to know: Docker → ECR → EKS workflow. Know image scanning, base image best practices, and the difference between containers and VMs.

Common Mistakes

❌ 'Containers are the same as VMs' → ✅ 'Containers share the host OS kernel, making them faster and lighter than VMs which emulate a full OS.'
❌ Pushing unscanned images to ECR.

30-Second Interview Answer

Containers package apps with all dependencies, ensuring consistency across environments. In CMG, we build Docker images in Jenkins, scan them with Trivy, push to AWS ECR, and deploy to EKS. This gives us portable, scalable, and secure microservice deployments.

Easy Memory Trick

Container = Lunchbox. Everything you need is packed inside. Open anywhere and it works — dev laptop or AWS EKS.

SECTION 2: CI/CD PIPELINES

CI/CD Overview

Term

Definition

Continuous Integration (CI)

Frequently merge code to shared repo; auto-build and auto-test on every commit

Continuous Delivery (CD)

Code is always in deployable state; deployment to prod is manual/approved

Continuous Deployment

Every passing commit auto-deploys to production with zero human approval

CMG Jenkins Pipeline Flow

Developer → Git Commit → Jenkins Trigger → Maven/npm Build → Unit Tests → SonarQube → Docker Build → Trivy Scan → AWS ECR Push → Helm Chart → AWS EKS Deploy

Q8: What is Continuous Integration (CI), and why is it important?

Simple Definition

CI is the practice of developers merging code frequently (multiple times daily) into a shared repository, triggering automated builds and tests each time.

Detailed Explanation

Without CI, developers work on separate branches for weeks, then face massive merge conflicts. CI prevents this by integrating code continuously. Every commit triggers an automated pipeline: compile → unit test → code quality check → security scan. If any stage fails, the team is notified immediately.

Why Is It Used?

CI catches bugs early when they are small and cheap to fix. It ensures the main branch is always stable and ready to deploy. It removes the 'integration hell' of big-bang merges.

How Does It Work?

Developer commits to Git → Jenkins webhook triggers → Jenkins pipeline starts: pulls code, runs Maven or npm build, runs unit tests, runs SonarQube for code quality, checks code coverage. If all pass, artifact is created.

Business Value

Faster bug detection saves hours of debugging. Always having a clean main branch means faster releases. Business can deliver value more frequently.

Real-Time Example (CMG Project)

In CMG: When a developer pushes to the main branch of any of our 50+ microservice repos, Jenkins automatically picks it up via Git webhook, builds the Spring Boot or Node.js service, runs all unit tests, and fails fast if anything is broken. Teams get Slack notifications.

Production Usage

All 50+ microservices have independent Jenkins pipelines. Builds run in parallel. Failed builds block the ECR push — nothing broken reaches production.

Security Considerations

SonarQube checks for code vulnerabilities, code smells, and coverage. OWASP dependency checks run in the pipeline. Secrets scanning prevents hardcoded passwords in code.

Architect Perspective

CI is not just a pipeline — it is a contract with the team. The contract says: 'The main branch is always healthy.' Architect CI to be fast (under 10 minutes), reliable (no flaky tests), and informative (clear failure messages).

Interviewer's Expectation

Know the difference: CI = frequent code integration + auto-testing. Expect you to describe the pipeline stages and what happens on failure.

Common Mistakes

❌ 'CI is Jenkins' → ✅ 'CI is a practice; Jenkins is one tool that implements it.'
❌ Running builds infrequently (once per day or per week).

30-Second Interview Answer

CI means every code commit automatically triggers a build and test pipeline. In CMG, developers push to Git, Jenkins runs Maven/npm build, SonarQube checks quality, and only if all pass does the image get built. This catches bugs in minutes, not weeks.

Easy Memory Trick

CI = Commit → Integrate → Test Immediately. Like a spell-checker that runs every time you type, not just at the end.

Q10: What is Continuous Delivery (CD)?

Simple Definition

Continuous Delivery ensures software is always in a deployable state. Every change passes through automated stages and can be released to production at any time — but a human approves the final deployment.

Detailed Explanation

CD extends CI. After CI validates code quality, CD automates: build Docker image → scan with Trivy → push to ECR → deploy to staging → run integration tests → require approval → deploy to production. The key difference from Continuous Deployment is the human approval gate before production.

Why Is It Used?

CD reduces the risk of big deployments. Small, frequent releases are safer and easier to roll back. Teams can deploy whenever the business needs — not just once a month.

How Does It Work?

CI validates the code. CD takes that validated artifact and runs it through further automated stages (integration tests, staging deployment) and then gates on human approval. In practice: Jenkins builds the image, Trivy scans it, Helm deploys to staging EKS, QA validates, then approval triggers prod deploy.

Business Value

Businesses can release features to customers on demand. Emergency fixes can be deployed in hours, not weeks. Reduces business risk from large, infrequent releases.

Real-Time Example (CMG Project)

In CMG: After Jenkins CI completes, CD stages deploy microservices to staging EKS. QA runs smoke tests. Business owner approves. Helm then deploys to production EKS in under 5 minutes. For critical government services this approval gate is mandatory.

Production Usage

Staging matches production (same EKS config, same Terraform-provisioned infra). Approval gate is enforced. Audit trail maintained in Jenkins for compliance.

Security Considerations

Every stage is logged for audit. Approval requires authorized personnel. Production deployments follow change management process — critical for UK Government compliance (CAB approval integration).

Architect Perspective

CD = automated confidence + human control. The automated pipeline builds confidence (code is tested at every stage). The approval gate gives control to the business. For regulated environments like UK Government, always include an approval gate.

Interviewer's Expectation

Know the difference: Continuous Delivery = human approves before prod. Continuous Deployment = fully automated to prod. For government projects, CD (with approval) is always used.

Common Mistakes

❌ 'CD and Continuous Deployment are the same' → ✅ 'Continuous Delivery requires human approval for production. Continuous Deployment is fully automated.'

30-Second Interview Answer

Continuous Delivery means code is always production-ready. Every commit passes through build, test, security scan, and staging deploy automatically. In CMG, after automated validation, an authorized approver triggers the final EKS production deployment via Jenkins.

Easy Memory Trick

Delivery = 'it's ready whenever you want it.' Deployment = 'it's already done.' Think: a cake ready to serve (Delivery) vs. already on the table (Deployment).

SECTION 3: INFRASTRUCTURE AS CODE (IaC)

Q7: What is Infrastructure as Code (IaC)?

Simple Definition

IaC means managing and provisioning infrastructure (servers, networks, databases, Kubernetes clusters) using code files instead of manual clicks in a console.

Detailed Explanation

Traditional infrastructure was provisioned manually — an ops engineer would log into AWS console and click to create a server. This was slow, error-prone, and impossible to audit. IaC treats infrastructure configuration as code: written in files, stored in Git, reviewed in PRs, and applied automatically. Terraform (declarative) and Ansible (imperative/configuration) are the main IaC tools we use.

Why Is It Used?

IaC enables: Version control of infrastructure, Consistent environments (no snowflake servers), Fast reproducibility (spin up new env in minutes), Disaster recovery (rebuild from code), Audit trail, and Team collaboration on infra changes.

How Does It Work?

Write Terraform HCL files defining AWS resources (EKS cluster, VPC, EC2, S3, IAM roles). Run 'terraform plan' to preview changes. Run 'terraform apply' to provision. State is stored in S3 (remote backend). Multiple engineers collaborate via Git branches and PR reviews.

Business Value

In CMG, Terraform provisions our entire AWS infrastructure: VPC, subnets, EKS cluster, EC2 instances for legacy Siebel/WebSphere/Documentum, ECR repositories, S3 buckets, IAM roles, and CloudWatch alarms. If we need a new environment, we run Terraform — infrastructure is ready in 20 minutes, not 2 weeks.

Real-Time Example (CMG Project)

Terraform manages EKS cluster for 50+ microservices and EC2 for monolithic apps. Ansible configures OS-level settings, installs agents, manages application configs.

Production Usage

Immutable infrastructure principle: never modify running infra, replace it. Secrets never in Terraform files — use AWS Secrets Manager + Terraform data sources. IAM roles created with least privilege. State file in S3 with encryption and DynamoDB lock to prevent concurrent applies.

Security Considerations

IaC is the foundation of cloud-native architecture. Combine Terraform (provisioning) + Ansible (configuration) for full coverage. Use remote state (S3 + DynamoDB lock). Enforce Terraform via CI/CD (GitOps). Use workspaces or modules for multi-environment management (dev/staging/prod).

Architect Perspective

Know Terraform vs Ansible. Know what 'terraform plan', 'apply', 'destroy' do. Know what remote state is. Know IaC benefits.

Interviewer's Expectation

❌ Using Terraform for configuration management → ✅ Use Terraform for provisioning, Ansible for configuration.
❌ Committing Terraform state files to Git → ✅ Use S3 remote backend with DynamoDB locking.

Common Mistakes

IaC means infrastructure is defined as code files in Git. In CMG, we use Terraform to provision our entire AWS stack — EKS clusters, VPCs, EC2 instances, and IAM roles. Changes go through PR review, Terraform plan is reviewed, then applied via Jenkins. This gives us version control, consistency, and audit trails for infrastructure.

30-Second Interview Answer

IaC = Blueprint for infrastructure. Just like an architect's drawing creates a building, a Terraform file creates cloud infrastructure. Change the drawing, change the building.

Easy Memory Trick

Terraform vs Ansible vs CloudFormation

Aspect

Terraform

Ansible

Type

Provisioning (IaC)

Configuration Management

Language

HCL (Declarative)

YAML (Imperative/Declarative)

State

Maintains state file

Stateless

Cloud

Multi-cloud (AWS, Azure, GCP)

Mainly on-prem + cloud config

Use Case

Create VPC, EKS, EC2, S3

Configure OS, install packages, manage apps

In CMG

Provision all AWS infrastructure

Configure EC2 Siebel/WebSphere servers

Strength

Infrastructure lifecycle

Configuration consistency

SECTION 4: CONTAINERS, DOCKER & KUBERNETES

Containers vs Virtual Machines

Aspect

Containers vs Virtual Machines

OS

Containers share host OS kernel | VMs have full OS

Size

Containers are MBs | VMs are GBs

Startup

Containers start in seconds | VMs take minutes

Isolation

Process-level | Full OS-level

Portability

Very high | Limited

Tool

Docker | VMware, Hyper-V

In CMG

All 50+ microservices run in containers on EKS | Legacy Siebel on EC2

Q13: What is the role of orchestration tools in containerization?

Simple Definition

Orchestration tools like Kubernetes automate the deployment, scaling, networking, and management of containers across a cluster of machines.

Detailed Explanation

Running one container manually is easy. Running 50+ containers across multiple servers — with auto-scaling, load balancing, health checks, rolling updates, and self-healing — is impossible without orchestration. Kubernetes (K8s) is the industry standard orchestrator. AWS EKS is managed Kubernetes on AWS.

Why Is It Used?

Without orchestration, you would manually start/stop containers, watch for crashes, manually scale, and handle networking yourself. Kubernetes automates all of this with Deployments, Services, Ingress, HPA (autoscaling), and self-healing.

How Does It Work?

Kubernetes key concepts: Pod (smallest unit, runs one or more containers), Deployment (declares desired state, handles rolling updates), Service (stable network endpoint for pods), Ingress (HTTP routing), ConfigMap/Secret (configuration), HPA (auto-scales pods), Node (worker machine in the cluster), Namespace (logical separation).

Business Value

In CMG, our 50+ microservices (Payment, Notification, Reporting, User Profile, Document Service) run as Kubernetes Deployments on AWS EKS. Kubernetes ensures 3 replicas of each service run at all times. If a pod crashes, it auto-restarts. During high load (tax submission period for government), HPA auto-scales pods from 3 to 10.

Real-Time Example (CMG Project)

EKS manages the control plane. Worker nodes run on EC2. Helm deploys application charts. HPA scales pods. Network Policies isolate microservices.

Production Usage

RBAC controls who can deploy to which namespace. Network Policies restrict pod-to-pod communication. Secrets are stored in AWS Secrets Manager, injected via ExternalSecrets. Container images only from private ECR. Trivy scans images before they reach EKS. Pod Security Standards enforced.

Security Considerations

EKS = managed control plane (AWS handles master nodes). You manage worker nodes and applications. Architect for: namespace isolation (dev/staging/prod), resource limits on pods (CPU/memory), HPA for auto-scaling, and PodDisruptionBudgets for zero-downtime maintenance.

Architect Perspective

Know: Pod vs Deployment vs Service. Know HPA. Know the difference between Docker and Kubernetes. Know EKS vs self-managed K8s.

Interviewer's Expectation

❌ 'Kubernetes and Docker are the same' → ✅ 'Docker builds and runs containers. Kubernetes orchestrates and manages containers at scale across a cluster.'
❌ Not setting resource limits on pods → causes noisy-neighbor issues.

Common Mistakes

Kubernetes automates container deployment, scaling, and healing. In CMG, we run 50+ microservices on AWS EKS. Kubernetes ensures the right number of pods run, auto-scales during peak government submission periods, and self-heals if pods crash. We use Helm for packaging and deploying application charts.

30-Second Interview Answer

Kubernetes = Traffic controller for containers. Like an airport control tower managing hundreds of planes (containers) — take-off, landing, rerouting, and handling emergencies automatically.

Easy Memory Trick

Q14 & Q31: Deployment Strategies — Blue-Green & Canary

Strategy

How It Works

Blue-Green

Two identical environments: Blue (live) and Green (new version). Switch traffic to Green after testing. Zero-downtime. Easy rollback by switching back to Blue.

Canary

Deploy new version to a small percentage of users (5-10%) first. Monitor metrics. If healthy, gradually roll to 100%. If issues found, roll back only the canary.

Rolling

Replace pods one at a time with the new version. Kubernetes default strategy. No downtime but slow rollback.

In CMG

Blue-Green for major monolith releases (Siebel). Canary for microservices on EKS using Helm chart values to control traffic split.

SECTION 5: DEVSECOPS & SECURITY

Shift-Left Security

What is Shift-Left Security?

Shift-Left means moving security testing earlier in the development lifecycle — into the CI/CD pipeline — rather than waiting until the end. The earlier a vulnerability is found, the cheaper it is to fix.

Security Pipeline Flow (CMG)

CMG DevSecOps Pipeline

Code Push → SonarQube (SAST - code vulnerabilities, code smells) → OWASP Dependency Check (vulnerable libraries) → Docker Build → Trivy Scan (container image CVEs) → ECR (private, policy-controlled) → EKS (RBAC + Network Policies + Pod Security)

Q11: How does DevOps contribute to security?

Simple Definition

DevOps integrates security throughout the pipeline (DevSecOps / Shift-Left). Security is everyone's responsibility, not just the security team's job at the end.

Detailed Explanation

Traditional security was a gate at the end of the release cycle — slow, expensive, and too late. DevOps moves security into every stage: code analysis, dependency scanning, container scanning, infrastructure checks, and runtime monitoring. This is called DevSecOps.

Why Is It Used?

Security bugs found in development cost 10x less to fix than in production. Automated security checks in CI/CD catch vulnerabilities before they reach production. Regulatory compliance (UK Government) requires security at every stage.

How Does It Work?

Stage 1 (Code): SonarQube SAST scans. Stage 2 (Dependencies): OWASP Dependency Check for vulnerable libraries. Stage 3 (Container): Trivy scans Docker images for CVEs. Stage 4 (Infrastructure): Terraform scanning (Checkov/tfsec). Stage 5 (Runtime): CloudWatch anomaly detection. Stage 6 (Access): IAM least privilege, Kubernetes RBAC.

Business Value

UK Government project has strict security requirements (Cyber Essentials Plus). Without DevSecOps, manual security reviews would block every release. With our automated pipeline, security is validated for every commit without slowing down delivery.

Real-Time Example (CMG Project)

SonarQube runs on every Jenkins build for all 50+ microservices. Trivy blocks ECR push if CRITICAL CVEs are found. ECR has image scanning enabled. EKS uses RBAC and Network Policies. Secrets in AWS Secrets Manager. All enforced via Jenkins pipeline code.

Production Usage

Security is a first-class citizen in the pipeline. Implement security as code. Never hardcode secrets. Always scan images. Enforce RBAC. Encrypt data in transit (TLS) and at rest (S3 encryption, EBS encryption). Maintain audit logs for compliance.

Security Considerations

DevSecOps architecture = people + process + tools. People: train devs on secure coding. Process: security gates in CI/CD. Tools: SonarQube + Trivy + IAM + Network Policies. An architect must ensure security is automated and non-negotiable, not a manual checkbox.

Architect Perspective

Interviewers want to see you understand shift-left, SAST vs DAST, container security, secrets management, and compliance. Bonus: mention Trivy by name.

Interviewer's Expectation

❌ Treating security as the last step → ✅ Security at every CI/CD stage
❌ Hardcoding secrets in Dockerfile or code → ✅ AWS Secrets Manager / environment variables injected at runtime

Common Mistakes

DevOps drives DevSecOps — security at every pipeline stage. In CMG, SonarQube checks code quality and security vulnerabilities, Trivy scans Docker images for CVEs before they reach ECR, and Kubernetes RBAC controls who can access what. Security is automated, not manual.

30-Second Interview Answer

DevSecOps = Security rides in the CI/CD car at every stage, not waiting at the destination.

Easy Memory Trick

Q19: Container Security Best Practices

Practice

Details

Scan images

Trivy scans every Docker image before ECR push. CRITICAL CVEs fail the build.

Minimal base images

Use Alpine or Distroless — fewer packages = smaller attack surface

Never run as root

Set USER directive in Dockerfile. Kubernetes SecurityContext: runAsNonRoot: true

ECR lifecycle policy

Auto-delete old images. Only tagged versions kept.

Network Policies

Kubernetes Network Policies restrict which pods can talk to which

Secrets Management

AWS Secrets Manager → ExternalSecrets → Kubernetes Secret. Never in Dockerfile.

Read-only filesystem

readOnlyRootFilesystem: true in Kubernetes pod spec

Image signing

Sign images with AWS Signer or Notary for supply chain security

SECTION 6: MONITORING, OBSERVABILITY & SRE

Q16: What is the role of monitoring and logging in DevOps?

Simple Definition

Monitoring tracks the health and performance of systems in real-time. Logging records events and errors for debugging and auditing. Together they give visibility into what is happening in production.

Detailed Explanation

Monitoring is the eyes and ears of a DevOps team. Without it, you are blind to performance issues, outages, and security incidents. Three pillars of observability: Metrics (what is happening), Logs (what happened), Traces (why it happened and where it went).

Why Is It Used?

You cannot improve what you cannot measure. Monitoring enables proactive incident response (alert before users notice), root cause analysis, capacity planning, and SLA/SLO tracking.

How Does It Work?

CloudWatch collects metrics (CPU, memory, network, pod counts), stores logs (application and infrastructure), and triggers alarms (e.g., CPU > 80% → alert). CloudWatch dashboards give real-time view. Logs Insights enables complex log queries.

Business Value

In CMG, CloudWatch monitors: EKS worker node CPU/memory, Pod health and restarts, Application logs from Spring Boot microservices (Payment Service, Notification Service), EC2 metrics for Siebel/WebSphere/Documentum, ECR image push events, and custom business metrics (failed payments, document processing errors).

Real-Time Example (CMG Project)

CloudWatch Alarms → SNS → Email/PagerDuty. Container Insights for EKS. Log Groups per microservice. Retention policy set to 90 days.

Production Usage

CloudWatch logs must be encrypted. Log access controlled via IAM. Sensitive data (PII, payment data) must not appear in logs — use structured logging with masking. CloudTrail for AWS API audit trail.

Security Considerations

True observability = Metrics + Logs + Traces (distributed tracing). For microservices, a single user request may touch 5 services. Without tracing, you cannot find where latency is introduced. Recommend adding AWS X-Ray for distributed tracing on top of CloudWatch.

Architect Perspective

Know the difference: Monitoring = known unknowns (CPU high). Observability = unknown unknowns (why is this service slow?). Know three pillars. Mention CloudWatch for AWS, bonus for X-Ray.

Interviewer's Expectation

❌ Relying on user complaints to detect issues → ✅ Proactive monitoring with CloudWatch alarms
❌ Not setting retention on logs → huge storage costs and compliance issues

Common Mistakes

Monitoring tracks system health in real-time; logging records events for debugging. In CMG, CloudWatch monitors all EKS workloads and EC2 instances, with alarms for CPU, memory, and application errors. Logs are centralized per microservice with 90-day retention. This enables us to detect and resolve issues before users are impacted.

30-Second Interview Answer

Monitoring = Doctor's checkup. Logging = Patient's medical records. Observability = Diagnosis using both.

Easy Memory Trick

SRE Concepts: SLI, SLO, SLA, Error Budget

Term

Definition + Example

SLI (Service Level Indicator)

A metric that measures service behavior. Example: 'What % of requests return a 200 response in under 200ms?'

SLO (Service Level Objective)

The target for an SLI. Example: '99.9% of requests respond in <200ms over 30 days'

SLA (Service Level Agreement)

A legal/business contract with consequences for breach. Example: 'If availability drops below 99.5%, we provide a credit'

Error Budget

How much failure is allowed. SLO = 99.9% → Error budget = 0.1% downtime per month = ~43.8 minutes

In CMG

SLO: Payment Service 99.95% availability. CloudWatch monitors. If error budget consumed, freeze new deployments, focus on reliability.

SECTION 7: MICROSERVICES vs MONOLITH

Monolith vs Microservices Comparison

Aspect

Monolith

Microservices

Architecture

Single deployable unit

Many independent services

Deployment

Deploy entire app for any change

Deploy only changed service

Scaling

Scale entire application

Scale individual services

Fault Isolation

One bug can crash everything

Failures isolated per service

Tech Stack

Single technology

Each service can use different tech

Development

Slower as app grows

Parallel team development

Complexity

Simple initially

Complex (networking, service discovery)

Database

Shared database

Database per service

In CMG

Siebel, BPM, WebSphere, Documentum

50+ Spring Boot / Node.js on EKS

Deployment Tool

Ansible on EC2

Helm + Kubernetes on EKS

Microservices in CMG Project

We run 50+ microservices on AWS EKS: Payment Service, Notification Service, Reporting Service, User Profile Service, Document Service. Each is independently deployed via Jenkins CI/CD pipeline, runs in its own Docker container, scales independently, and is monitored via CloudWatch Container Insights. Alongside these, we maintain legacy monolithic apps (Siebel CRM, WebSphere, Documentum) on EC2 — a hybrid architecture.

SECTION 8: GIT & VERSION CONTROL

Q6: What is Git, and how does it help in DevOps?

Simple Definition

Git is a distributed version control system that tracks every change to code, allows multiple people to collaborate, and enables branching, merging, and rollback.

Detailed Explanation

Git is the foundation of all DevOps workflows. Every code change, pipeline script, Terraform file, Helm chart, Kubernetes manifest, Ansible playbook, and Dockerfile in our CMG project lives in Git. It enables collaboration (multiple engineers working simultaneously), traceability (who changed what and when), and automation (webhooks trigger Jenkins pipelines).

Why Is It Used?

Without version control, teams cannot collaborate safely. You cannot audit what changed, roll back mistakes, or trigger automation. Git is the single source of truth for all code and configuration.

How Does It Work?

Branching strategy (GitFlow or trunk-based): developers create feature branches, raise PRs, peer reviews, merge to main. Git webhook notifies Jenkins on merge. Jenkins starts CI pipeline automatically.

Business Value

In CMG, every microservice repo uses Git. Developers create feature branches for new Payment Service features. PRs require 2 approvals. Merging to main automatically triggers Jenkins pipeline: build → test → SonarQube → Docker → Trivy → ECR → EKS. Infrastructure changes (Terraform, Ansible) also live in Git.

Real-Time Example (CMG Project)

All 50+ microservice repos. Separate repos for Terraform IaC, Helm charts, and Ansible playbooks. Git webhooks trigger Jenkins automatically.

Production Usage

Never commit secrets to Git. Use .gitignore. Enable branch protection rules (require PR reviews, no direct pushes to main). Enable signed commits for auditability. Scan Git history for accidentally committed secrets using tools like truffleHog.

Security Considerations

Git is the source of truth for everything — code, config, and infrastructure. GitOps = using Git as the single source of truth for both application and infrastructure state. Argocd (GitOps tool) watches Git and auto-syncs Kubernetes state.

Architect Perspective

Know Git branching strategies (GitFlow vs trunk-based). Know Git vs SVN. Know how Git webhooks trigger Jenkins. Mention Git as source of truth for IaC.

Interviewer's Expectation

❌ 'Git is just a backup tool' → ✅ 'Git is the source of truth for code, config, and infrastructure in DevOps, enabling collaboration, automation triggers, and full audit trails.'
❌ Committing sensitive files (AWS keys, passwords) to Git

Common Mistakes

Git is a distributed version control system that is the foundation of our DevOps workflow. In CMG, all code, Terraform infrastructure, Helm charts, and Ansible playbooks are in Git. Developer pushes to a feature branch, PR is reviewed and merged to main, and Jenkins automatically starts the CI/CD pipeline via webhook.

30-Second Interview Answer

Git = Time machine for code. Every change tracked. Every mistake reversible. Every team member in sync.

Easy Memory Trick

Git vs SVN

Aspect

Git vs SVN

Type

Git: Distributed | SVN: Centralized

Offline Work

Git: Yes, full history locally | SVN: No, requires server connection

Branching

Git: Fast, lightweight | SVN: Slow, copies full directory

Performance

Git: Faster | SVN: Slower for large repos

Industry Standard

Git: Yes (GitHub, GitLab, Bitbucket) | SVN: Legacy, declining

In CMG

Git used for everything | SVN not used

SECTION 9: PRODUCTION SCENARIOS & TROUBLESHOOTING

Scenario 1: Production Deployment Failed on EKS

Situation

A new version of Payment Service was deployed to production EKS. After deployment, users reported payment failures. Alert fired in CloudWatch.

Symptoms: CloudWatch alarm: 5xx errors > 10% on Payment Service. Pods showing CrashLoopBackOff in kubectl. Deployment shows 0/3 pods ready.

Analysis / Investigation: kubectl get pods → CrashLoopBackOff. kubectl logs <pod> → application startup error: Cannot connect to database. kubectl describe pod → OOMKilled or missing environment variable. Check recent Helm values changes.

Root Cause: Missing database connection secret in new Helm deployment. Developer forgot to update secret reference in values.yaml for the new environment.

Solution

Immediate: kubectl rollout undo deployment/payment-service → roll back to previous working version. Verify pods come up: kubectl rollout status. Verify payment success rate restores. Fix: update Helm values with correct secret reference, test in staging, redeploy.

Prevention

Add pre-deployment smoke tests that verify DB connectivity before marking deployment healthy. Use Kubernetes readiness probes to prevent traffic to unhealthy pods. Require staging validation before production.

Interview Answer

When Payment Service deployment failed on EKS, I immediately checked CloudWatch for 5xx error spikes, then used kubectl get pods to find CrashLoopBackOff. kubectl logs showed DB connection failure. I ran kubectl rollout undo to restore the previous version in under 2 minutes, then fixed the Helm values file and redeployed through the full pipeline.

Scenario 2: Jenkins Pipeline Build Failure

Situation

Jenkins build failed for Notification Service. Developers cannot merge to main. CI is blocked.

Symptoms: Jenkins shows red build. Maven build error: dependency not found. SonarQube stage not reached.

Analysis / Investigation: Check Jenkins console output → Maven dependency download failure. Check: Is Artifactory/Nexus reachable? Is the dependency version correct? Is there a network issue from Jenkins agent to Maven repo?

Root Cause: Corrupted Maven local cache on Jenkins agent. Dependency jar file was corrupted during last download.

Solution

Clear Maven cache on Jenkins agent: rm -rf ~/.m2/repository. Re-trigger build. If dependency version mismatch, update pom.xml. For persistent issues, restart Jenkins agent.

Prevention

Use Nexus/Artifactory as local proxy for Maven dependencies. Add cache-cleanup stage in Jenkins. Use dependency lock files. Set up alerts for Maven repo connectivity.

Interview Answer

Jenkins build failure for Notification Service showed Maven dependency error. I checked the console output, found a corrupted local cache, cleared the .m2 cache on the agent, and re-triggered. Build passed. To prevent recurrence, we now proxy all Maven dependencies through Nexus.

Scenario 3: High CPU on EKS Worker Node

Situation

CloudWatch alarm fires: EKS worker node CPU at 95%. Multiple pods on same node. Risk of pod eviction.

Symptoms: CloudWatch alarm: CPU > 90% sustained. kubectl top nodes shows one node at 95%. kubectl top pods shows one pod consuming excessive CPU.

Analysis / Investigation: kubectl top pods → identify which pod/service is consuming CPU. kubectl describe pod → check CPU limits. CloudWatch logs → any infinite loop, thread blocking, or processing spike. Check HPA status.

Root Cause: Payment Service processing a large batch job without CPU limits set. Pod consumed all node CPU, starving other pods.

Solution

Immediate: kubectl delete pod <offending-pod> to force reschedule and immediate restart. Set CPU limits in Deployment spec: resources: limits: cpu: '500m'. Enable HPA to scale out load. Review batch processing logic.

Prevention

Always set CPU and memory requests and limits on every pod. Use HPA for auto-scaling. Implement node anti-affinity to spread pods across nodes. Use resource quotas per namespace.

Interview Answer

When we saw 95% CPU on a worker node via CloudWatch, I used kubectl top pods to identify the Payment Service batch job as the culprit. I deleted the pod to force a restart, then added CPU limits to the deployment and enabled HPA. Going forward, all pods have mandatory resource limits enforced by admission controller.

Scenario 4: Security Vulnerability Detected in Container Image

Situation

Trivy scan in Jenkins pipeline finds CRITICAL CVE in base Docker image of Document Service. Pipeline is blocked.

Symptoms: Jenkins Trivy stage fails: CRITICAL CVE-2024-XXXX found in base image. Build marked as failed. Docker image not pushed to ECR.

Analysis / Investigation: Review Trivy report: which CVE, which package, which base image version. Check if fix is available (updated base image). Assess exploitability in our environment.

Root Cause: Base image (node:18) has critical vulnerability in underlying libssl. Fix available in node:18.x.y.

Solution

Update Dockerfile: FROM node:18 → FROM node:18.x.y (patched version). Rebuild image in Jenkins. Trivy scan passes. Push to ECR. Deploy to EKS. For immediate temporary workaround: add Trivy exception with expiry date and document risk acceptance.

Prevention

Pin base image versions in Dockerfiles. Set up automated base image update PRs using Dependabot or Renovate. Set Trivy severity threshold to CRITICAL/HIGH in Jenkins. Regularly review ECR scan results.

Interview Answer

Trivy found a CRITICAL CVE in our Document Service base image. Pipeline blocked — which is exactly the right behavior. I identified the patched base image version, updated the Dockerfile, and the pipeline passed on re-run. We've since added automated base image update tooling to catch these proactively.

SECTION 10: CLOUD & AWS

Why Cloud? Key Benefits

Benefit

Detail

Elasticity

Scale up/down automatically based on demand (AWS Auto Scaling)

Availability

Multi-AZ deployments. 99.99% SLA for core AWS services

Cost Optimization

Pay-as-you-go. No upfront hardware. Reserved/Spot instances for savings

Speed

Provision resources in minutes via Terraform. No hardware procurement

Security

AWS IAM, VPC, Security Groups, KMS encryption, CloudTrail audit

Global Scale

Deploy in multiple AWS regions for low latency and disaster recovery

In CMG

AWS EKS for microservices, EC2 for monoliths, S3 for documents, CloudWatch for monitoring

Q25: Secrets Management in DevOps

Never hardcode secrets (passwords, API keys, tokens) in code, Dockerfiles, or Terraform files. In CMG: AWS Secrets Manager stores all secrets. Jenkins retrieves them at pipeline runtime using IAM roles (no static credentials). Kubernetes pods access secrets via ExternalSecrets Operator (syncs from Secrets Manager to K8s Secrets). Terraform uses data sources to fetch secrets dynamically. Git scanning (truffleHog) prevents accidental commits.

Q26: Immutable Infrastructure

Immutable = Never modify running infrastructure. Instead, replace it with a new version. In CMG: New EKS node configuration? Don't SSH and edit — update Terraform, destroy old nodes, provision new ones. New microservice version? Don't update running container — build new Docker image, deploy new pods, terminate old pods. This ensures consistency, auditability, and eliminates configuration drift.

SECTION 11: ADVANCED DEVOPS TOPICS

Q20: Chaos Engineering

Chaos Engineering is the practice of intentionally injecting failures into a system to find weaknesses before they cause real outages. Principles: define steady state → introduce chaos (kill pods, fail network, spike CPU) → observe → fix weakness. Netflix pioneered this with Chaos Monkey. In a Kubernetes environment, tools like Chaos Mesh or Litmus can randomly kill pods to ensure the system self-heals. In CMG, we would simulate: an EKS node failure (do pods reschedule?), a Notification Service crash (does retry logic work?), or a DB connection drop (does circuit breaker activate?). Chaos Engineering aligns with DevOps by promoting proactive resilience over reactive firefighting.

Q21: Configuration Drift

Configuration drift occurs when actual server state diverges from desired state — due to manual changes, failed partial deployments, or uncontrolled updates. In traditional environments, engineers SSH into servers and make manual changes. Over time, servers become 'snowflakes' (unique, unreproducible). Prevention in CMG: Terraform ensures AWS infrastructure matches state files. Ansible ensures EC2 servers (Siebel, WebSphere) have correct configuration. Regular Ansible runs detect and remediate drift. Immutable infrastructure (replace, don't modify) is the ultimate solution. Treat servers as cattle, not pets.

Q40: Database Migrations in DevOps

Database schema changes must be versioned, automated, and reversible — just like code. Tools: Flyway and Liquibase manage migration scripts. Each script has a version number. On deployment, only unrun scripts execute. In CMG, database migrations for microservices (Payment, User Profile) run as Kubernetes init containers before the main application container starts — ensuring DB schema is always up-to-date before the app runs. Rules: always write rollback scripts, test migrations in staging before production, never modify existing migrations (add new ones instead), and backup DB before major schema changes.

Q30: High Availability in DevOps

HA Technique

Implementation in CMG

Multi-AZ

EKS worker nodes across 3 AZs. EC2 for monoliths in 2 AZs

Load Balancing

AWS ALB distributes traffic across pods. EKS Service LoadBalancer type

Pod Replicas

Minimum 3 replicas per microservice. PodDisruptionBudget prevents all pods going down

Auto Healing

Kubernetes restarts crashed pods. EKS replaces failed nodes

Auto Scaling

HPA scales pods on CPU/memory. Cluster Autoscaler adds/removes nodes

Health Checks

Liveness probes restart unhealthy pods. Readiness probes prevent traffic to starting pods

RTO / RPO

RTO (Recovery Time Objective): < 5 minutes. RPO (Recovery Point Objective): < 1 hour with EBS snapshots

SECTION 12: FINAL CHEAT SHEET & QUICK REVISION

Top DevOps Keywords

Category

Keywords

Culture

CAMS, Blameless Postmortem, Shared Responsibility, Continuous Improvement

CI/CD

Jenkins, Pipeline, Build, Test, SonarQube, Artifact, Helm, Deploy

Containers

Docker, Image, Container, ECR, Registry, Trivy, Scan, Immutable

Orchestration

Kubernetes, EKS, Pod, Deployment, Service, HPA, Helm, Namespace

IaC

Terraform, Ansible, HCL, State, Plan, Apply, Remote Backend, DynamoDB Lock

Security

Shift-Left, DevSecOps, SAST, CVE, RBAC, IAM, Secrets Manager, Least Privilege

Monitoring

CloudWatch, Metrics, Logs, Alarms, Dashboards, Container Insights, SLI, SLO

SRE

SLI, SLO, SLA, Error Budget, MTTR, MTTF, Deployment Frequency, Lead Time

Cloud

AWS, EKS, EC2, S3, ECR, CloudWatch, IAM, VPC, ALB, Auto Scaling

Architecture

Microservices, Monolith, Hybrid, Blue-Green, Canary, Rolling, HA, Multi-AZ

Common Interview Traps — Know These Cold!

Trap Question

Correct Answer

CI vs CD?

CI = integrate + auto-test on commit. CD = always deployable + manual approval for prod. Continuous Deployment = fully automated to prod.

Docker vs Kubernetes?

Docker builds and runs single containers. Kubernetes orchestrates many containers across a cluster at scale.

Terraform vs Ansible?

Terraform provisions infrastructure (create VPC, EKS, EC2). Ansible configures software on existing infrastructure (install, configure, manage).

Monitoring vs Observability?

Monitoring watches known metrics. Observability gives visibility into unknown issues using metrics + logs + traces.

SLI vs SLO vs SLA?

SLI = the measurement. SLO = the target. SLA = the legal contract with consequences.

Continuous Delivery vs Deployment?

Delivery = manual trigger to prod. Deployment = automatic to prod on every passing build.

Monolith vs Microservices?

Monolith = one deployable unit. Microservices = many independent services, each deployable separately.

IaC vs Configuration Management?

IaC (Terraform) provisions infrastructure. CM (Ansible) configures software on that infrastructure.

DORA Metrics — How DevOps is Measured

DORA Metric

Definition

Deployment Frequency

How often code is deployed to production. Elite = multiple times per day.

Lead Time for Changes

Time from code commit to production. Elite = less than 1 hour.

Mean Time to Recovery (MTTR)

Time to recover from a production incident. Elite = less than 1 hour.

Change Failure Rate

% of deployments that cause production incidents. Elite = 0-15%.

One-Day Revision Summary

Morning: Foundations

DevOps = Culture + Automation + Measurement + Sharing (CAMS). Agile = Dev process. DevOps = End-to-end delivery. CI = Frequent integration + auto-test. CD = Always deployable + approval gate. DevSecOps = Shift-left security at every pipeline stage.

Midday: Tools & Pipeline

CMG Pipeline: Git → Jenkins → Maven/npm → SonarQube → Docker → Trivy → ECR → Helm → EKS. Terraform = Provision AWS infra. Ansible = Configure EC2 servers. Docker = Containerize apps. EKS = Orchestrate containers. CloudWatch = Monitor everything.

Afternoon: Architecture & Security

Microservices: 50+ on EKS. Monolith: Siebel, WebSphere, Documentum on EC2. Hybrid architecture. Blue-Green for zero-downtime. Canary for gradual rollout. Security: Trivy (container), SonarQube (code), IAM (access), Secrets Manager (secrets), RBAC (K8s access).

Evening: Scenarios & SRE

Key scenarios: CrashLoopBackOff → kubectl logs → fix → rollout undo. CVE found → update base image → redeploy. High CPU → kubectl top pods → set resource limits → HPA. SLI = metric. SLO = target. SLA = contract. Error budget = allowed failure %. MTTR = how fast you recover.

Last-Minute Interview Summary

What to SAY in Every Answer

1. Define the concept clearly (show you understand the WHY)
2. Give a CMG project example (show real experience)
3. Mention specific tools (Git, Jenkins, Docker, Trivy, EKS, Terraform, CloudWatch)
4. Mention security consideration (shift-left, Trivy, RBAC)
5. Mention business impact (faster delivery, reliability, cost savings)

What NEVER to Say

❌ 'DevOps is a tool' → ✅ DevOps is a culture and practice
❌ 'CI/CD means Jenkins' → ✅ Jenkins is one tool; CI/CD is a software delivery practice
❌ 'DevOps removes Ops teams' → ✅ DevOps integrates Ops into the full SDLC
❌ 'Docker and Kubernetes are the same' → ✅ Docker builds containers; Kubernetes orchestrates them
❌ 'Continuous Deployment and Delivery are the same' → ✅ Delivery has manual approval; Deployment is fully automated

Your Strongest CMG Project Points to Drop in EVERY Answer

• 50+ microservices on AWS EKS (Kubernetes at scale)
• Jenkins CI/CD pipeline: Git → SonarQube → Docker → Trivy → ECR → Helm → EKS
• Terraform for all AWS infrastructure provisioning (IaC at scale)
• Ansible for EC2 configuration (Siebel, WebSphere, Documentum)
• Hybrid architecture: Microservices on EKS + Monoliths on EC2
• CloudWatch for monitoring all services
• DevSecOps: SonarQube + Trivy + IAM + Secrets Manager
• UK Government project = high-security, high-availability requirements

Good Luck! You've Got This.

You have 4 years of real UK Government DevOps experience. Speak confidently. Use your CMG examples.
