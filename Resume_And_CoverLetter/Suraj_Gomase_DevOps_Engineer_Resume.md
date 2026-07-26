# SURAJ GOMASE

**Senior DevOps Engineer | 4+ Years | AWS Certified DevOps Professional | CI/CD & Cloud Specialist | Notice Period: 90 Days (Early Release: 30–45 Days)**

+91 9604851694 | surajgomase303@gmail.com | Mumbai, India | linkedin.com/in/suraj-gomase-340581178

---

## PROFESSIONAL SUMMARY

Results-driven Senior DevOps Engineer with 4+ years of enterprise experience at Tata Consultancy Services, delivering mission-critical CI/CD automation, cloud infrastructure, and container orchestration for UK Government-scale production systems (DWP — serving 20M+ citizens). Proven track record: 80% reduction in deployment time, 70% faster release cycles, and measurable cloud cost savings. Deep expertise in AWS with basic Azure and GCP exposure (EKS, AKS, EC2, VPC, IAM, Lambda, Azure DevOps), Kubernetes/Helm/ArgoCD, Terraform/Terragrunt, Jenkins, GitHub Actions, GitLab CI/CD, Prometheus/Grafana, and Elasticsearch/ELK exposure. Strong communicator with hands-on experience translating stakeholder requirements into automated pipelines, Site Reliability Engineering (SRE) practices, and cross-functional Agile delivery.

---

## TECHNICAL SKILLS

| Category | Skills |
| --- | --- |
| **CI/CD & GitOps** | Jenkins (Declarative, Multibranch), GitHub Actions (OIDC, Matrix, Reusable Workflows), ArgoCD, Webhooks |
| **Cloud Platforms** | AWS (EC2, EKS, ECS, Fargate, Lambda, S3, VPC, IAM, RDS Multi-AZ, ALB, Auto Scaling, Route 53, CloudWatch, Secrets Manager, SQS, SNS, SES, WAF, CloudFormation, Cost Explorer), Azure (AKS, ACR, Azure DevOps Pipelines, Azure Key Vault, Azure Monitor, Azure Virtual Networks, NSGs, ARM Templates, Azure AD/Entra ID), GCP (basic exposure) |
| **IaC & Automation** | Terraform (Modules, Remote State, Workspaces), Ansible (Playbooks, Roles, Inventory, Vault), Python (automation, scripting), Bash Scripting |
| **Containers & K8s** | Docker (Multi-stage, Distroless, BuildKit), Kubernetes (EKS, Self-Managed, Helm, HPA, PDB, RBAC, NetworkPolicy, StatefulSets, DaemonSets), Karpenter, Helm Chart Authoring, OCI Registry |
| **DevSecOps** | SonarQube (Quality Gates), OWASP Dependency Check, Trivy (Image Scanning), Nexus, IAM Least-Privilege, IRSA |
| **Observability** | Prometheus, Grafana (Dashboard-as-Code), Alertmanager, CloudWatch (Metrics, Logs, Alarms), SLO/SLI Design, SRE Monitoring |
| **OS & Linux** | Linux (RHEL, Ubuntu) — Shell Scripting, Service Management, File Systems, User Administration |
| **Cost Optimization** | Spot Instances, Reserved Instances, Savings Plans, Rightsizing (Compute Optimizer), Kubecost, Auto Scaling Policies, Underutilized Resource Detection, S3 Lifecycle Policies |
| **Collaboration** | JIRA, Confluence, Agile/Scrum, Git, GitHub, GitLab, Code Review, Postmortem Writing, RCA Documentation, On-call Incident Response |

---

## WORK EXPERIENCE

### Senior DevOps Engineer | Tata Consultancy Services (TCS)
**Dec 2021 – Present**

*Project: Child Maintenance Group — Department for Work & Pensions (DWP), UK Government | 20M+ citizens served*

**▸ CI/CD Pipeline Automation & GitOps**
- Architected end-to-end Jenkins CI/CD pipelines (DEV → QA → PROD) with declarative Jenkinsfiles covering Maven build, SonarQube SAST, OWASP scanning, Docker image build, and ArgoCD deployment — achieving 60% improvement in deployment efficiency.
- Reduced release cycle time by 70% through full pipeline automation; eliminated manual deployment steps and human error in production releases.
- Implemented ArgoCD (GitOps) for Kubernetes continuous delivery — enabling declarative, self-healing, and auditable deployments with Git as single source of truth.
- Implemented declarative Jenkins pipeline syntax for reusable and maintainable CI/CD workflows across 10+ microservices, improving consistency and reducing maintenance effort.
- Integrated GitHub Actions (OIDC auth to AWS — no static keys) for secure cloud-native automation, and implemented Docker layer caching to reduce build time by 55%.
- Implemented manual approval gates, rollback mechanisms, and blue/green deployment strategies for zero-downtime production releases.

**▸ Infrastructure as Code & Configuration Management**
- Provisioned and managed multi-environment AWS infrastructure (DEV/QA/PROD) using Terraform modules with S3+DynamoDB remote state locking — fully reproducible, versioned infrastructure.
- Authored Ansible playbooks and reusable roles for application deployment, OS patching, server configuration, and middleware automation; integrated with Jenkins for post-provisioning automation.

**▸ AWS Cloud Architecture & Operations**
- Designed highly available, fault-tolerant AWS architectures using EC2, EKS, ECS, Lambda, S3, RDS Multi-AZ, ALB, and Auto Scaling Groups — 99.9%+ availability for government production systems.
- Engineered VPC networking: public/private subnets across 3 AZs, NAT Gateway (HA), Internet Gateway, route tables, Security Groups, and NACLs — defense-in-depth for regulated workloads.
- Implemented IRSA (IAM Roles for Service Accounts) on EKS — eliminated hardcoded AWS credentials from all Kubernetes workloads, achieving zero long-lived static key usage.
- Migrated credential management to AWS Secrets Manager — removed plaintext credentials from pipelines and configuration files while improving access control and rotation.
- Drove AWS cost optimization through Spot Instance adoption, Reserved Instance planning, rightsizing (Compute Optimizer), and idle resource elimination — delivering measurable monthly savings.
- Hands-on with Route 53 (DNS + health checks), WAF, SES, SQS, SNS, AMI lifecycle management, and CloudTrail audit logging.

**▸ Containerization, Kubernetes & GitOps**
- Managed Amazon EKS clusters: node group lifecycle, IAM/IRSA configuration, cluster upgrades, and add-on management (VPC CNI, CoreDNS, EBS CSI driver).
- Managed full Kubernetes resource set: Deployments, StatefulSets, DaemonSets, Services, ConfigMaps, Secrets, Ingress (NGINX), HPA, PDB, NetworkPolicy, and RBAC — across DEV/QA/PROD namespaces.
- Built and maintained Helm charts for standardized parameterized deployments; managed chart versioning, OCI registry publishing, and environment-specific value overrides.
- Authored multi-stage Dockerfiles (distroless/slim base images) reducing image sizes by up to 80%; integrated Trivy image scanning into CI pipelines to block HIGH/CRITICAL CVEs.

**▸ DevSecOps & Security Engineering**
- Integrated SonarQube quality gates and OWASP Dependency Check into CI pipelines — blocking deployments on critical security findings or code quality failures.
- Enforced IAM least-privilege policies, MFA for all privileged accounts, and S3 bucket encryption/versioning across all environments in compliance with UK government security standards.

**▸ Observability & SRE Practices**
- Built Prometheus + Grafana monitoring stacks for Kubernetes workloads: CPU/memory, pod health, deployment frequency, and custom application metrics via /metrics endpoints.
- Configured Alertmanager routing (warning → Slack, critical → incident channels) with grouping and inhibition rules to reduce alert noise; defined SLO/SLI thresholds for critical government services.
- Applied Site Reliability Engineering (SRE) principles for monitoring, alerting, and reliability improvements across production environments.
- Centralized log aggregation using CloudWatch Logs with structured log formats, metric filters, and operational dashboards for 360° production observability.

---

## CERTIFICATIONS

| Certification | Issuer | Status |
| --- | --- | --- |
| **AWS Certified DevOps Engineer — Professional** | Amazon Web Services | ✅ Certified |
| **AWS Certified Cloud Practitioner** | Amazon Web Services | ✅ Certified |

---

## EDUCATION

| Qualification | Institution / Board | Year | Score / Grade |
| --- | --- | --- | --- |
| **B.E. — Mechanical Engineering** | Savitribai Phule Pune University, Pune | 2016–2020 | CGPA: 7.01 / 10 |
| **HSC — Science Stream** | Maharashtra State Board (MSBSHSE), Pune | 2016 | 66.31% |
| **SSC** | Maharashtra State Board (MSBSHSE) | 2014 | 89.80% |

---

## ADDITIONAL INFORMATION

**Languages:** English (Professional), Hindi (Native), Marathi (Native)

**Soft Skills:** Team Leadership, Problem-Solving, Root Cause Analysis, Stakeholder Communication, Agile/Scrum Delivery, Technical Mentorship, Ownership Mindset

**Interests:** Open-source DevOps tools (CNCF ecosystem), Platform Engineering, AI-assisted DevOps workflows, Cloud FinOps
