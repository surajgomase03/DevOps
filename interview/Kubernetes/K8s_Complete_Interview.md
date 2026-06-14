# K8s Complete Interview

KUBERNETES

Real-Time Interview Preparation Guide

100+ Questions | CMG Project Aligned | Senior DevOps / SRE / Platform Engineer

Prepared for: Suraj Gomase | TCS → Next Role

📌 SECTION 1: Kubernetes Fundamentals & Architecture

Q1: What is Kubernetes and why is it used?

💡 SIMPLE DEFINITION

Kubernetes (K8s) is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. Think of it as a smart traffic controller that manages thousands of containers across multiple servers automatically.

🏗️ CMG PROJECT EXAMPLE

In our CMG (Child Maintenance Group) project at TCS, we manage 50+ microservices (Payment Service, Notification Service, Case Management Service, etc.) on AWS EKS.

Without Kubernetes, our team would manually manage container placement, restarts, scaling — which is impossible at scale.

EKS handles scheduling, self-healing, rolling updates, and service discovery automatically.

▶ Why Is It Used?

Automated scheduling of containers across nodes based on resource availability

Self-healing: automatically restarts failed containers, replaces unhealthy nodes

Horizontal scaling: scale Pods up/down based on CPU/memory (HPA)

Rolling updates with zero downtime

Service discovery and load balancing built-in

Secret and config management

🎤 30-SECOND INTERVIEW ANSWER

Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. In our CMG project at TCS, we use AWS EKS to run 50+ microservices. Kubernetes provides self-healing, auto-scaling via HPA, rolling updates, and built-in service discovery — solving the problem of manually managing containers at scale.

🧠 MEMORY TRICK

"K8s = 8 letters between K and s" | Think: Docker BUILDS the ship (container), Kubernetes is the CAPTAIN managing the fleet (cluster).

Q2: Explain the core components of Kubernetes architecture.

💡 SIMPLE DEFINITION

Kubernetes has two main parts: Control Plane (the brain — manages the cluster) and Worker Nodes (the muscle — run the actual containers).

▶ Control Plane Components

Component

Role

Key Point

kube-apiserver

Front door of Kubernetes

All kubectl commands hit this first

etcd

Distributed key-value store

Stores ALL cluster state, config, metadata

kube-scheduler

Decides which node runs which Pod

Checks CPU, memory, taints, affinity

kube-controller-manager

Runs controllers (Node, Replication, Endpoint, etc.)

Maintains desired state continuously

▶ Worker Node Components

Component

Role

Key Point

kubelet

Agent on every node

Talks to control plane, ensures containers run

kube-proxy

Network proxy on every node

Manages iptables/IPVS rules for Services

Container Runtime

Runs containers (containerd, CRI-O)

Implements CRI interface

# Architecture Flow:

kubectl apply -f deployment.yaml

↓

kube-apiserver  (validates & stores in etcd)

↓

kube-scheduler  (selects best node)

↓

kubelet on node (pulls image, starts container)

↓

kube-proxy      (sets up network rules)

↓

Container Runtime (containerd) runs the container

🏗️ CMG PROJECT EXAMPLE

In our EKS cluster, AWS manages the Control Plane (kube-apiserver, etcd, scheduler) — we never SSH into master nodes.

We manage Worker Nodes via EKS Node Groups (EC2 instances).

Our Jenkins Agent EC2 has kubeconfig configured to interact with kube-apiserver for deployments.

⚠️ INTERVIEWER EXPECTS

Mention etcd as the source of truth — 'If etcd is lost, the entire cluster state is lost'

Explain kube-apiserver is the ONLY component others talk to

In EKS, control plane is AWS managed — we only manage data plane (nodes)

Q3: What is a Pod in Kubernetes? Why is it the smallest deployable unit?

💡 SIMPLE DEFINITION

A Pod is like a wrapper around one or more containers that share the same network (same IP address) and storage. It's the smallest unit because containers inside a Pod are tightly coupled and always run together on the same node.

▶ Key Characteristics

Shared network namespace: all containers in a Pod share one IP address

Containers communicate via localhost (port-based, not IP-based)

Shared storage volumes accessible to all containers in the Pod

Pods are ephemeral — they can be killed and recreated anytime

Each Pod gets a unique cluster-internal IP address

# Example: Pod with two containers sharing storage

apiVersion: v1

kind: Pod

metadata:

name: payment-service-pod

namespace: cmg-payments

spec:

containers:

- name: payment-app

image: 123456789.dkr.ecr.eu-west-2.amazonaws.com/payment-service:v1.2.0

ports:

- containerPort: 8080

- name: log-sidecar

image: fluent/fluent-bit:latest

# Shares same network and volumes as payment-app

🏗️ CMG PROJECT EXAMPLE

In CMG, our Payment Service Pod runs the main Spring Boot container + a Fluent Bit sidecar for log shipping to ELK Stack.

Both containers share the same Pod IP and can access the same log volume.

Q5: Explain Namespaces in Kubernetes. When would you use them?

💡 SIMPLE DEFINITION

Namespaces are virtual clusters within one physical Kubernetes cluster. They provide isolation, access control, and resource quotas for different teams or environments.

Use Cases

Commands

Resource isolation between teams

kubectl get namespaces

RBAC per namespace

kubectl create ns cmg-payments

Resource quotas (CPU/memory limits)

kubectl get pods -n cmg-payments

Separate dev/staging/prod environments

kubectl config set-context --namespace=cmg-payments

🏗️ CMG PROJECT EXAMPLE

In CMG EKS cluster, we use namespaces: cmg-payments, cmg-notifications, cmg-case-mgmt, cmg-reporting, kube-system, monitoring

Each namespace has its own RBAC policies — developers cannot accidentally delete production Pods.

Resource quotas prevent any single namespace from consuming all cluster resources.

# CMG Namespace setup example

kubectl create namespace cmg-payments

kubectl create namespace cmg-notifications

# Apply resource quota to namespace

kubectl apply -f - <<EOF

apiVersion: v1

kind: ResourceQuota

metadata:

name: cmg-payments-quota

namespace: cmg-payments

spec:

hard:

requests.cpu: '10'

requests.memory: 20Gi

limits.cpu: '20'

limits.memory: 40Gi

EOF

Q7: What is a Service in Kubernetes? Why is it needed?

💡 SIMPLE DEFINITION

A Service is a stable network endpoint (fixed IP + DNS name) for a group of Pods. It's needed because Pod IPs change every time a Pod is restarted — Services provide a permanent address.

▶ Service Types Comparison

Type

Access

Use Case

ClusterIP

Internal cluster access only

Default. Used for microservice-to-microservice communication

NodePort

External via NodeIP:Port (30000-32767)

Used in dev/test. Not recommended for production

LoadBalancer

External via Cloud Load Balancer

Used in CMG for public-facing APIs via AWS ALB

ExternalName

Maps to external DNS name

Used to connect to external databases/APIs

# CMG Payment Service - ClusterIP (internal microservice)

apiVersion: v1

kind: Service

metadata:

name: payment-service

namespace: cmg-payments

spec:

type: ClusterIP

selector:

app: payment-service    # Matches Pod label

ports:

- port: 80               # Service port (other services call this)

targetPort: 8080        # Pod's actual container port

🏗️ CMG PROJECT EXAMPLE

Internal services like Payment → Notification use ClusterIP services.

Public-facing APIs exposed via LoadBalancer type → AWS ALB → Ingress → ClusterIP service chain.

DNS: payment-service.cmg-payments.svc.cluster.local

Q8: Differentiate between ClusterIP, NodePort, and LoadBalancer Service types.

# Traffic flow for each Service type:

ClusterIP (internal only):

Other Pod → ClusterIP:80 → kube-proxy → Pod:8080

NodePort (external dev access):

Browser → NodeIP:30080 → kube-proxy → Pod:8080

LoadBalancer (production external):

Internet → AWS ALB → NodePort → kube-proxy → Pod:8080

Ingress (recommended for HTTP/HTTPS):

Internet → ALB → Ingress Controller → ClusterIP:80 → Pod:8080

⚠️ WHAT NOT TO SAY

Don't say 'NodePort is used in production' — it exposes high ports (30000-32767) and is a security risk. Production uses LoadBalancer or Ingress.

Q9: What is a Deployment in Kubernetes? Difference between ReplicaSet and Deployment.

💡 SIMPLE DEFINITION

A Deployment manages the lifecycle of Pods using ReplicaSets. It provides rolling updates, rollbacks, and self-healing. ReplicaSet just ensures N replicas are running — Deployment adds versioning and update strategies ON TOP of ReplicaSet.

ReplicaSet

Deployment

Ensures N replicas running

Manages ReplicaSets

Low-level controller

Higher-level controller

No built-in update strategy

Rolling updates + rollbacks

Managed by Deployment

Versioning of deployments

You rarely create these directly

Use this for all stateless apps

# CMG Payment Service Deployment

apiVersion: apps/v1

kind: Deployment

metadata:

name: payment-service

namespace: cmg-payments

spec:

replicas: 3

selector:

matchLabels:

app: payment-service

strategy:

type: RollingUpdate

rollingUpdate:

maxSurge: 1        # Can have 1 extra Pod during update

maxUnavailable: 0  # Zero downtime — all 3 must be available

template:

metadata:

labels:

app: payment-service

spec:

containers:

- name: payment-service

image: 123456789.dkr.ecr.eu-west-2.amazonaws.com/payment-service:v1.2.0

ports:

- containerPort: 8080

resources:

requests:

memory: '256Mi'

cpu: '250m'

limits:

memory: '512Mi'

cpu: '500m'

Q11: What is a StatefulSet and when would you use it?

💡 SIMPLE DEFINITION

StatefulSet is like a Deployment but for STATEFUL apps. Each Pod gets a permanent name (db-0, db-1, db-2), stable storage (own PVC), and they start/stop in ORDER. Regular Deployments have random Pod names and shared/no persistent storage.

Deployment

StatefulSet

Random Pod names (payment-xyz123)

Stable ordered names (mysql-0, mysql-1)

Shared or no persistent storage

Each Pod has own PVC (dedicated storage)

Can scale up/down in any order

Scale up 0→1→2, Scale down 2→1→0

Used for stateless microservices

Used for databases, Kafka, Zookeeper

🏗️ CMG PROJECT EXAMPLE

In CMG, our Oracle database layer runs on EC2 (not K8s) — but if we moved it to K8s, we'd use StatefulSet.

For Kafka message queues in our notification pipeline, StatefulSet ensures stable broker IDs.

In production Kubernetes environments I've managed: Redis Sentinel and Elasticsearch clusters run as StatefulSets.

Q12: What is a DaemonSet and when would you use it?

💡 SIMPLE DEFINITION

DaemonSet ensures ONE copy of a Pod runs on EVERY node. If new nodes join the cluster, the Pod is automatically added. Perfect for node-level agents.

Fluent Bit / Fluentd — log collection agent on every node

Prometheus Node Exporter — scrapes node-level metrics (CPU, memory, disk)

AWS CloudWatch Agent — ship metrics/logs to CloudWatch from every node

Calico/Cilium CNI agents — network plugin running on every node

Datadog agent / New Relic agent — APM on every node

🏗️ CMG PROJECT EXAMPLE

In CMG, we run Fluent Bit as a DaemonSet on all EKS worker nodes. It collects container logs from /var/log/containers/ and ships them to our ELK Stack for centralized logging.

Q13: Explain ConfigMaps and Secrets. What's the difference?

💡 SIMPLE DEFINITION

ConfigMap = configuration data (non-sensitive). Secret = sensitive data (passwords, API keys). Both decouple config from code so you can change config without rebuilding Docker images.

ConfigMap

Secret

Non-sensitive configuration

Sensitive credentials

Stored as plain text

Base64 encoded (NOT encrypted by default!)

DB URL, app settings, feature flags

DB passwords, API keys, TLS certs

Mounted as files or env vars

Ideally backed by HashiCorp Vault or AWS Secrets Manager

⚠️ SECURITY ALERT — WHAT INTERVIEWERS LOVE TO ASK

Kubernetes Secrets are ONLY Base64 encoded, NOT encrypted by default!

BEST PRACTICE: Enable etcd encryption at rest + use External Secrets Operator with HashiCorp Vault or AWS Secrets Manager

In CMG: We use HashiCorp Vault + Vault Agent Injector to inject secrets into Pods — zero secrets stored in K8s etcd

# ConfigMap example — CMG app config

apiVersion: v1

kind: ConfigMap

metadata:

name: cmg-app-config

namespace: cmg-payments

data:

DB_HOST: 'oracle-db.cmg.internal'

APP_ENV: 'production'

LOG_LEVEL: 'INFO'

# Secret example (use Vault in production!)

apiVersion: v1

kind: Secret

metadata:

name: cmg-db-secret

namespace: cmg-payments

type: Opaque

data:

DB_PASSWORD: cGFzc3dvcmQxMjM=  # base64 encoded

Q14: What is Ingress in Kubernetes? How does it differ from a LoadBalancer Service?

💡 SIMPLE DEFINITION

Ingress is a smart HTTP/HTTPS router that routes traffic based on URL path or hostname to different services — using just ONE load balancer. LoadBalancer Service needs a SEPARATE load balancer for EACH service (expensive!).

# Traffic flow with Ingress:

Internet

↓

AWS ALB (1 Load Balancer for entire cluster)

↓

Ingress Controller (AWS Load Balancer Controller)

↓

Ingress Rules:

/api/payments  → payment-service:80

/api/notify    → notification-service:80

/api/cases     → case-mgmt-service:80

↓

ClusterIP Service

↓

Pod

Feature

Ingress

LoadBalancer Service

Layer 7 (HTTP/HTTPS)

Layer 4 (TCP/UDP)

1 LB for all services

1 LB per service (costly!)

Path-based routing

No path routing

TLS termination

Pass-through only

Host-based routing

Not supported

🏗️ CMG PROJECT EXAMPLE

In CMG, we use AWS Load Balancer Controller as Ingress Controller.

One AWS ALB handles all 50+ microservices via path-based routing.

SSL/TLS termination at ALB using AWS Certificate Manager (ACM) certificates.

Cost saving: Instead of 50 ALBs (one per service), we use 1 ALB with Ingress rules.

# CMG Ingress example

apiVersion: networking.k8s.io/v1

kind: Ingress

metadata:

name: cmg-ingress

namespace: cmg-payments

annotations:

kubernetes.io/ingress.class: alb

alb.ingress.kubernetes.io/scheme: internet-facing

alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-west-2:123:certificate/abc

spec:

rules:

- host: api.cmg.gov.uk

http:

paths:

- path: /api/payments

pathType: Prefix

backend:

service:

name: payment-service

port:

number: 80

🌐 SECTION 2: Kubernetes Networking

Q16: Explain the Kubernetes Networking Model.

💡 SIMPLE DEFINITION

Kubernetes uses a FLAT networking model. Every Pod gets its own IP. All Pods can talk to all other Pods WITHOUT NAT (Network Address Translation). This is implemented by a CNI (Container Network Interface) plugin.

▶ 3 Core Kubernetes Networking Rules

Rule 1: All Pods can communicate with ALL other Pods without NAT

Rule 2: All Nodes can communicate with ALL Pods without NAT

Rule 3: The IP a Pod sees itself as = what others see it as (no IP masquerading)

# Pod-to-Pod communication on same node (via CNI bridge):

Pod-A (eth0: 10.0.1.5) → veth0 → CNI Bridge (cbr0) → veth1 → Pod-B (eth0: 10.0.1.6)

# Pod-to-Pod communication across nodes (via overlay network):

Pod-A (Node-1: 10.0.1.5) → VXLAN encapsulation → Node-2 → Pod-B (10.0.2.5)

# In AWS EKS — using VPC CNI (no overlay, native VPC IPs):

Pod gets real VPC IP address → direct routing via AWS VPC

🏗️ CMG PROJECT EXAMPLE

In CMG EKS, we use AWS VPC CNI plugin — each Pod gets a REAL VPC IP address (no overlay network needed).

Payment Service Pod (10.0.45.23) can directly talk to Notification Service Pod (10.0.47.89).

CNI assigns secondary IPs from EC2 ENIs (Elastic Network Interfaces) to Pods.

Q19: What are Network Policies in Kubernetes? When would you use them?

💡 SIMPLE DEFINITION

Network Policies are K8s firewall rules for Pods. By default, all Pods can talk to all other Pods. Network Policies RESTRICT this — you define exactly WHICH Pods can talk to WHICH Pods.

# CMG: Allow only Payment Service to talk to Database Pod

apiVersion: networking.k8s.io/v1

kind: NetworkPolicy

metadata:

name: allow-payment-to-db

namespace: cmg-payments

spec:

podSelector:

matchLabels:

app: oracle-db           # Apply policy TO database pods

policyTypes:

- Ingress

ingress:

- from:

- podSelector:

matchLabels:

app: payment-service  # ONLY payment-service can connect

ports:

- protocol: TCP

port: 1521               # Oracle DB port

⚠️ IMPORTANT: CNI Must Support NetworkPolicy

Not all CNI plugins support NetworkPolicy!

Supported: Calico, Cilium, Weave Net

NOT supported: Flannel (basic), AWS VPC CNI (alone)

In CMG EKS: We use Calico alongside AWS VPC CNI for NetworkPolicy enforcement

Q20: How does Kubernetes handle DNS for services and pods?

💡 SIMPLE DEFINITION

Kubernetes uses CoreDNS as internal DNS server. It auto-creates DNS records for every Service. Pods resolve service names to ClusterIPs without needing to know actual IPs.

# DNS naming patterns:

# Service DNS (FQDN):

<service-name>.<namespace>.svc.cluster.local

Example: payment-service.cmg-payments.svc.cluster.local

# Short form (within same namespace):

payment-service

# Cross-namespace (from cmg-notifications to cmg-payments):

payment-service.cmg-payments.svc.cluster.local

# Pod DNS (less used):

10-0-1-5.cmg-payments.pod.cluster.local

🏗️ CMG PROJECT EXAMPLE

In CMG, our Notification Service calls Payment Service using: http://payment-service.cmg-payments.svc.cluster.local:80/api/payment-status — CoreDNS resolves this to the ClusterIP, kube-proxy routes to a healthy Pod.

🚀 SECTION 3: Deployment Strategies & Scaling

Q21: Describe the process of a rolling update in Kubernetes.

💡 SIMPLE DEFINITION

Rolling update replaces old Pods with new Pods ONE BY ONE (or in batches), ensuring the application is ALWAYS available during update. Zero downtime deployment.

# Rolling Update flow:

Old State: [Pod-v1] [Pod-v1] [Pod-v1]  (replicas: 3)

Step 1: Create new Pod-v2         [Pod-v1] [Pod-v1] [Pod-v1] [Pod-v2]

Step 2: Wait for Pod-v2 Ready

Step 3: Kill one Pod-v1           [Pod-v1] [Pod-v1] [Pod-v2]

Step 4: Create next Pod-v2        [Pod-v1] [Pod-v1] [Pod-v2] [Pod-v2]

Step 5: Kill one Pod-v1           [Pod-v1] [Pod-v2] [Pod-v2]

Step 6: Final Pod switch           [Pod-v2] [Pod-v2] [Pod-v2]

# Controlled by maxSurge and maxUnavailable

# maxSurge: 1 = max 1 extra Pod during update

# maxUnavailable: 0 = zero Pods unavailable during update

🏗️ CMG PROJECT EXAMPLE

In CMG, our Jenkins pipeline triggers rolling updates via Helm upgrade.

Jenkins → Docker Build → ECR Push → helm upgrade --install payment-service ./charts/payment

With maxUnavailable: 0 and maxSurge: 1, we achieve zero-downtime deployments for UK government users.

# Rollback commands

kubectl rollout status deployment/payment-service -n cmg-payments

kubectl rollout history deployment/payment-service -n cmg-payments

kubectl rollout undo deployment/payment-service -n cmg-payments

kubectl rollout undo deployment/payment-service --to-revision=3 -n cmg-payments

Q23: What is Horizontal Pod Autoscaling (HPA)? How does it work?

💡 SIMPLE DEFINITION

HPA automatically increases or decreases the number of Pod replicas based on CPU/memory usage or custom metrics. It's like auto-hiring/firing workers when workload increases/decreases.

# HPA for CMG Payment Service

apiVersion: autoscaling/v2

kind: HorizontalPodAutoscaler

metadata:

name: payment-service-hpa

namespace: cmg-payments

spec:

scaleTargetRef:

apiVersion: apps/v1

kind: Deployment

name: payment-service

minReplicas: 3

maxReplicas: 20

metrics:

- type: Resource

resource:

name: cpu

target:

type: Utilization

averageUtilization: 70  # Scale when CPU > 70%

- type: Resource

resource:

name: memory

target:

type: Utilization

averageUtilization: 80

Autoscaler

What it scales

When to use

HPA

Adds/removes Pod replicas

CPU/Memory/Custom metrics — stateless apps

VPA

Adjusts CPU/Memory per Pod

Right-sizing containers, needs restart

Cluster Autoscaler

Adds/removes EC2 nodes

When Pods can't be scheduled due to no capacity

🏗️ CMG PROJECT EXAMPLE

In CMG, during month-end payment processing, our Payment Service HPA scales from 3 → 15 replicas automatically. Cluster Autoscaler adds new EC2 nodes if needed. After peak, it scales back down — saving costs.

Q27: Explain Liveness and Readiness Probes. Why are they important?

💡 SIMPLE DEFINITION

Liveness = Is the container ALIVE? (restart if not). Readiness = Is the container READY to serve traffic? (remove from Service if not). Both are health checks Kubernetes performs on containers.

Liveness Probe

Readiness Probe

Is the app running (not deadlocked)?

Is the app ready for traffic?

Fails → Kubernetes RESTARTS the container

Fails → Kubernetes REMOVES Pod from Service endpoints

Detects deadlocks, infinite loops

Prevents traffic to starting/overloaded Pods

Like: Is the chef still awake?

Like: Is the chef ready to take orders?

# CMG Payment Service — Full probe configuration

containers:

- name: payment-service

image: ecr.../payment-service:v1.2.0

livenessProbe:

httpGet:

path: /actuator/health/liveness   # Spring Boot health endpoint

port: 8080

initialDelaySeconds: 30  # Wait 30s before first check

periodSeconds: 10        # Check every 10 seconds

failureThreshold: 3      # Restart after 3 failures

readinessProbe:

httpGet:

path: /actuator/health/readiness

port: 8080

initialDelaySeconds: 20

periodSeconds: 5

failureThreshold: 3

⚠️ COMMON INTERVIEW TRAP

Q: 'Can you use the same endpoint for both probes?'

A: Technically yes, but best practice is separate endpoints.

Liveness = is app alive (basic ping), Readiness = is app ready (checks DB connections, cache, dependencies)

🔐 SECTION 4: Security & Access Control

Q29: Explain Role-Based Access Control (RBAC) in Kubernetes.

💡 SIMPLE DEFINITION

RBAC controls WHO can do WHAT to WHICH resources. Instead of giving everyone admin access, you give each person/service only the minimum permissions they need.

▶ RBAC Building Blocks

Object

Scope

Example

Role

Permissions within 1 namespace

Developer can view Pods in cmg-payments

ClusterRole

Permissions across entire cluster

SRE can view all nodes cluster-wide

RoleBinding

Assigns Role to Subject in namespace

Give dev-team the 'Developer' Role

ClusterRoleBinding

Assigns ClusterRole to Subject cluster-wide

Give monitoring SA cluster-wide read access

# CMG RBAC Example: Developer access to cmg-payments namespace

# Step 1: Create Role

apiVersion: rbac.authorization.k8s.io/v1

kind: Role

metadata:

name: cmg-developer-role

namespace: cmg-payments

rules:

- apiGroups: [""]

resources: ["pods", "services", "configmaps"]

verbs: ["get", "list", "watch"]  # Read-only

- apiGroups: ["apps"]

resources: ["deployments"]

verbs: ["get", "list", "watch", "update"]  # Can update deployments

# Step 2: Bind to developer group

apiVersion: rbac.authorization.k8s.io/v1

kind: RoleBinding

metadata:

name: cmg-developer-binding

namespace: cmg-payments

subjects:

- kind: Group

name: cmg-developers  # AWS IAM group

apiGroup: rbac.authorization.k8s.io

roleRef:

kind: Role

name: cmg-developer-role

apiGroup: rbac.authorization.k8s.io

🏗️ CMG PROJECT EXAMPLE

In CMG EKS, we use aws-auth ConfigMap to map IAM roles/users to Kubernetes RBAC.

Developers: Read-only access to dev namespace only.

Jenkins Service Account: Deploy access to all namespaces via ClusterRole.

SRE Team: Admin access via ClusterRoleBinding.

Q30: What are Service Accounts? How are they used?

💡 SIMPLE DEFINITION

Service Accounts are identities for PODS (not humans). When a Pod needs to call the Kubernetes API or AWS services, it uses a Service Account — not a human username/password.

🏗️ CMG PROJECT — IRSA (IAM Roles for Service Accounts)

IRSA is AWS EKS's way to give Kubernetes Pods fine-grained AWS IAM permissions WITHOUT using AWS access keys.

Example: Payment Service Pod needs to write to S3 — we attach an IAM Role to its Service Account.

No hardcoded AWS credentials. Temporary credentials via OIDC token exchange.

Setup: 1) Create IAM Role with S3 permissions

2) Annotate K8s Service Account with IAM Role ARN

3) Pod automatically gets temp AWS credentials via IRSA

# CMG IRSA Setup for Payment Service

apiVersion: v1

kind: ServiceAccount

metadata:

name: payment-service-sa

namespace: cmg-payments

annotations:

eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/CMG-Payment-S3-Role

# In Deployment

spec:

serviceAccountName: payment-service-sa

Q32: What are Pod Security Standards (PSS)?

Level

Restrictions

Use Case

Privileged

No restrictions

System-level tools, CNI plugins

Baseline

Prevents common escalations

Default for most workloads — blocks hostNetwork, hostPID

Restricted

Maximum hardening

Runs as non-root, no privilege escalation, read-only root filesystem

🏗️ CMG PROJECT EXAMPLE

In CMG, all application namespaces use Restricted PSS level. System namespaces (kube-system, monitoring) use Privileged. This ensures CMG microservices run as non-root users with minimal Linux capabilities — critical for UK government security compliance.

📊 SECTION 5: Monitoring & Logging

Q33: How do you monitor a Kubernetes cluster? What tools are commonly used?

💡 SIMPLE DEFINITION

Monitoring = collect metrics + visualize + alert. Kubernetes monitoring has 4 layers: Infrastructure (nodes), Cluster (K8s components), Application (Pods), and Business metrics.

Tool

Purpose

What it monitors

Prometheus

Metrics scraping & storage

kubectl top, Pod metrics, custom metrics

Grafana

Dashboards & visualization

Node CPU/Memory, Pod health, SLO dashboards

AWS CloudWatch

AWS-native monitoring

EC2 metrics, EKS control plane logs, alarms

ELK Stack

Centralized logging

Application logs, audit logs, error analysis

Fluent Bit

Log collector

DaemonSet ships logs from nodes to Elasticsearch

Alertmanager

Alert routing

PagerDuty/Slack alerts for SLO breaches

🏗️ CMG PROJECT EXAMPLE

In CMG, our monitoring stack:

Prometheus + Grafana: Pod/Node metrics, custom dashboards per service

AWS CloudWatch: EKS control plane logs, EC2 metrics, custom alarms

ELK Stack: Application logs from all 50+ microservices via Fluent Bit DaemonSet

Alertmanager: PagerDuty alerts for P1 incidents (payment failures, SLO breaches)

Q34: How do you collect logs from applications running in Kubernetes?

# CMG Logging Architecture:

App Container (stdout/stderr)

↓

Container Runtime (containerd) → /var/log/containers/

↓

Fluent Bit DaemonSet (reads log files from node)

↓

Elasticsearch (storage & indexing)

↓

Kibana (visualization & search)

# Rule: ALL applications MUST write logs to stdout/stderr

# Never write to log files inside containers — they'll be lost on restart

⚠️ INTERVIEWER EXPECTS

Mention 3 logging patterns: Node-level DaemonSet (preferred), Sidecar container (legacy apps), Direct API (app ships own logs)

In production always use stdout/stderr — never log files inside containers

CMG uses Fluent Bit DaemonSet for efficiency (low resource overhead vs Fluentd)

⚡ SECTION 6: Advanced Kubernetes Concepts

Q37: Explain the concept of Taints and Tolerations.

💡 SIMPLE DEFINITION

Taints REPEL Pods from nodes (like a 'No Entry' sign on a node). Tolerations allow specific Pods to IGNORE that taint (like a VIP pass). Together they control which Pods run on which nodes.

# Taint a node (mark it for special workloads only)

kubectl taint nodes node-gpu-1 workload=gpu:NoSchedule

# Only Pods with this toleration can run on node-gpu-1

spec:

tolerations:

- key: 'workload'

operator: 'Equal'

value: 'gpu'

effect: 'NoSchedule'

# CMG Use Case: Taint Jenkins agent nodes

kubectl taint nodes jenkins-agent-1 role=jenkins:NoSchedule

# Only Jenkins agent Pods tolerate this — no app Pods land on Jenkins nodes

Taint Effect

Meaning

Impact

NoSchedule

Do NOT schedule new Pods here

Immediate — existing Pods stay

PreferNoSchedule

Try to avoid this node

Soft preference — Pods may still land here

NoExecute

Evict existing Pods + no new Pods

Removes ALL non-tolerating Pods immediately

Q38: What are Node Affinity and Anti-Affinity?

💡 SIMPLE DEFINITION

Node Affinity = PULL Pods TOWARD specific nodes. Anti-Affinity = PUSH Pods AWAY from each other. Taints/Tolerations are on NODES. Affinity is on PODS.

# CMG: Ensure Payment Service Pods spread across AZs (high availability)

spec:

affinity:

podAntiAffinity:

requiredDuringSchedulingIgnoredDuringExecution:

- labelSelector:

matchLabels:

app: payment-service

topologyKey: 'topology.kubernetes.io/zone'

# Ensures no 2 payment-service Pods in same AZ

nodeAffinity:

requiredDuringSchedulingIgnoredDuringExecution:

nodeSelectorTerms:

- matchExpressions:

- key: node-type

operator: In

values: ['application']  # Only run on 'application' nodes

🏗️ CMG PROJECT EXAMPLE

In CMG EKS, we use Pod Anti-Affinity with topologyKey: topology.kubernetes.io/zone to spread Payment Service Pods across 3 AZs (eu-west-2a, eu-west-2b, eu-west-2c). If one AZ fails, 2/3 Pods remain available — 99.9%+ uptime maintained.

Q41: What is a Helm chart? Why is it useful?

💡 SIMPLE DEFINITION

Helm is the package manager for Kubernetes — like apt for Ubuntu or npm for Node.js. A Helm chart packages ALL Kubernetes YAML files for an application into a single, versioned, parameterizable unit.

# CMG Helm Chart Structure:

payment-service/

├── Chart.yaml          # Chart metadata (name, version, description)

├── values.yaml         # Default configuration values

├── values-dev.yaml     # Dev environment overrides

├── values-staging.yaml # Staging overrides

├── values-prod.yaml    # Production overrides

└── templates/

├── deployment.yaml # Uses {{ .Values.replicaCount }}

├── service.yaml

├── ingress.yaml

├── configmap.yaml

├── hpa.yaml

└── serviceaccount.yaml

# Deploy with Helm

helm upgrade --install payment-service ./payment-service \

-f values-prod.yaml \

--namespace cmg-payments \

--set image.tag=v1.2.0

🏗️ CMG PROJECT EXAMPLE

In CMG CI/CD pipeline: Jenkins builds Docker image → pushes to ECR → calls helm upgrade with new image tag.

Same Helm chart deploys to dev/staging/prod with different values.yaml — single source of truth.

helm rollback payment-service 3 — instant rollback to any previous deployment.

Q43: What is a Pod Disruption Budget (PDB)? When would you use it?

💡 SIMPLE DEFINITION

PDB sets a MINIMUM number of Pods that must stay running during planned disruptions (node drains, cluster upgrades). It PREVENTS Kubernetes from accidentally taking down too many Pods at once.

# CMG: Payment Service must always have at least 2 Pods running

apiVersion: policy/v1

kind: PodDisruptionBudget

metadata:

name: payment-service-pdb

namespace: cmg-payments

spec:

minAvailable: 2        # OR: maxUnavailable: 1

selector:

matchLabels:

app: payment-service

# Effect: During kubectl drain / node upgrade,

# K8s will WAIT until 2 Pods are healthy before evicting more

🏗️ CMG PROJECT EXAMPLE

In CMG, during EKS node upgrades (AWS Managed Node Group rolling update), PDB ensures payment-service always has 2/3 replicas available. Prevents all 3 Pods from being evicted simultaneously — protecting UK child payment processing.

Q45: What is GitOps and how does it relate to Kubernetes?

💡 SIMPLE DEFINITION

GitOps = Git is the SINGLE SOURCE OF TRUTH for cluster state. Every change to the cluster goes through a Git Pull Request. An automated agent (ArgoCD/Flux) continuously syncs the cluster to match what's in Git.

# GitOps Flow in CMG:

Developer pushes code

↓

Jenkins CI Pipeline (build, test, scan, push to ECR)

↓

Jenkins updates values.yaml in GitOps repo (new image tag)

↓

ArgoCD detects change in Git repo

↓

ArgoCD syncs change to EKS cluster

↓

New Pod rolled out, old Pod terminated

# Benefits: Full audit trail (who changed what when) in Git

# Rollback = git revert PR (instant rollback)

🏗️ CMG PROJECT EXAMPLE

In CMG, we use ArgoCD for GitOps. Kubernetes manifests/Helm values live in a separate 'gitops-config' repo. Developers never kubectl apply directly to production — everything flows through Git → ArgoCD. This gives us full audit trail required for UK government compliance.

🔧 SECTION 7: Troubleshooting Scenarios

Q46: SCENARIO: Your application Pods are constantly restarting. How do you investigate?

💡 SITUATION

Pods show high RESTARTS count. Could be CrashLoopBackOff, OOMKilled, or probe failures.

▶ Step-by-Step Investigation

# Step 1: Check restart count and status

kubectl get pods -n cmg-payments

# RESTARTS column shows how many times Pod restarted

# Step 2: Describe Pod — check Events section

kubectl describe pod payment-service-abc123 -n cmg-payments

# Look for: OOMKilled, Liveness probe failed, BackOff

# Step 3: Check current logs

kubectl logs payment-service-abc123 -n cmg-payments

# Step 4: Check PREVIOUS container logs (CRUCIAL — before restart)

kubectl logs payment-service-abc123 -n cmg-payments --previous

# Step 5: Check resource usage

kubectl top pod payment-service-abc123 -n cmg-payments

Status

Cause

Solution

OOMKilled

Container killed for exceeding memory limit

Increase memory limit or fix memory leak

CrashLoopBackOff

App crashes repeatedly, K8s backs off restarts

Check --previous logs for app errors/exceptions

Liveness probe failed

Health check failing → K8s restarts container

Fix health endpoint or increase initialDelaySeconds

ImagePullBackOff

Cannot pull container image

Check image name, tag, ECR permissions

🏗️ CMG REAL INCIDENT

INCIDENT: Payment Service CrashLoopBackOff in production

SYMPTOMS: 40+ restarts in 30 minutes, payment processing failing

ROOT CAUSE: Memory leak in Spring Boot app — heap exhausted → OOMKilled

INVESTIGATION: kubectl logs --previous showed OutOfMemoryError in Java heap

FIX: Increased memory limit from 512Mi to 1Gi + fixed connection pool leak

PREVENTION: Added JVM heap metrics to Prometheus dashboard with alert at 85% usage

Q48: SCENARIO: Pods stuck in ImagePullBackOff. What's wrong?

💡 SITUATION

Kubernetes cannot pull the container image from the registry. Pod stays in Pending/ImagePullBackOff state.

# Diagnose ImagePullBackOff

kubectl describe pod <pod-name> -n cmg-payments

# Events will show: Failed to pull image 'ecr.../payment:latest'

# Error: unauthorized: authentication required

# Common fixes:

# 1. Check image name and tag

kubectl get pod payment-pod -o yaml | grep image

# 2. Verify ECR permissions (IRSA or node IAM role)

aws ecr describe-images --repository-name payment-service --region eu-west-2

# 3. Create imagePullSecret for private registry

kubectl create secret docker-registry ecr-secret \

--docker-server=123456789.dkr.ecr.eu-west-2.amazonaws.com \

--docker-username=AWS \

--docker-password=$(aws ecr get-login-password --region eu-west-2)

🏗️ CMG PROJECT EXAMPLE

In CMG, Worker Nodes have an IAM Role with AmazonEC2ContainerRegistryReadOnly policy — no imagePullSecrets needed. If ImagePullBackOff occurs, we first verify the IAM role is correctly attached to the Node Group and the ECR repo exists in eu-west-2.

Q39: SCENARIO: Pod stuck in Pending state. How do you debug?

# Step 1: Describe the pod — Events section is KEY

kubectl describe pod <pod-name> -n cmg-payments

# Common Event messages and their meaning:

# 'Insufficient cpu' / 'Insufficient memory'

→ Cluster doesn't have enough resources

→ Fix: Check kubectl top nodes / Add more nodes via Cluster Autoscaler

# '0/3 nodes are available: 3 node(s) didn't match pod affinity'

→ Affinity/NodeSelector rules too strict

→ Fix: Check nodeSelector, affinity, taints/tolerations

# 'pod has unbound immediate PersistentVolumeClaims'

→ PVC cannot find matching PV

→ Fix: Check StorageClass, PV availability, access modes

# Commands to investigate

kubectl get events -n cmg-payments --sort-by='.lastTimestamp'

kubectl top nodes

kubectl describe nodes | grep -A 5 'Allocatable'

kubectl get pvc -n cmg-payments

Q40: SCENARIO: Application unreachable from outside the cluster. How to troubleshoot?

# Systematic troubleshooting — bottom up:

# Step 1: Check if Pods are running and READY

kubectl get pods -n cmg-payments -l app=payment-service

# Step 2: Check Service endpoints — are Pods selected?

kubectl describe svc payment-service -n cmg-payments

# Check 'Endpoints:' field — should show Pod IPs

# Step 3: Test Service internally (exec into another Pod)

kubectl exec -it debug-pod -n cmg-payments -- curl payment-service:80/health

# Step 4: Check Ingress rules and events

kubectl describe ingress cmg-ingress -n cmg-payments

# Step 5: Check Ingress Controller Pods

kubectl get pods -n kube-system | grep alb-ingress

kubectl logs -n kube-system <alb-controller-pod>

# Step 6: Check AWS Security Groups (EKS specific)

# Ensure ALB security group allows port 80/443 from internet

# Ensure worker node security group allows ALB to reach NodePort

Q63: SCENARIO: Service not routing traffic to any Pods.

# Most common cause: selector mismatch

# Check Service selector

kubectl get svc payment-service -n cmg-payments -o yaml | grep selector -A 5

# Check Pod labels

kubectl get pods -n cmg-payments --show-labels

# Selector MUST exactly match Pod label

# Service: selector: app: payment-service

# Pod:     labels:   app: payment-service  ← must match!

# Verify endpoints

kubectl get endpoints payment-service -n cmg-payments

# Should show: 10.0.1.5:8080,10.0.1.6:8080,10.0.1.7:8080

# If shows <none> → selector mismatch or Pods not Ready

🎯 SECTION 8: Deployment Strategies & GitOps

Q98: How would you implement Blue/Green deployments in Kubernetes?

💡 SIMPLE DEFINITION

Blue = current live version. Green = new version. Both run simultaneously. When Green is verified, switch ALL traffic from Blue to Green instantly by changing Service selector.

# CMG Blue/Green Deployment Implementation

# Blue (current) Deployment

apiVersion: apps/v1

kind: Deployment

metadata:

name: payment-service-blue

spec:

replicas: 3

selector:

matchLabels:

app: payment-service

version: blue

template:

metadata:

labels:

app: payment-service

version: blue

spec:

containers:

- image: ecr.../payment:v1.0.0

# Service currently points to BLUE

apiVersion: v1

kind: Service

metadata:

name: payment-service

spec:

selector:

app: payment-service

version: blue  # ← CHANGE TO 'green' to switch traffic

# When Green is ready — instant switch (1 command!):

kubectl patch svc payment-service -n cmg-payments \

-p '{"spec":{"selector":{"version":"green"}}}'

Advantages

Disadvantages

Instant traffic switch (no Pod restarts)

Doubles resource consumption during deployment

Immediate full rollback (switch selector back)

Need to clean up old Blue after switch

Zero downtime guaranteed

Both versions run simultaneously (possible DB issues)

Easy to test Green before switching

Cost: 2x pods during deployment window

Q99: How would you implement Canary deployments in Kubernetes?

💡 SIMPLE DEFINITION

Canary deployment sends a small % of traffic (5-10%) to the new version while 90-95% goes to the stable version. You gradually increase traffic if metrics look good. Reduces blast radius of bad deployments.

# Simple Canary via replica ratio (without service mesh):

# Stable: 9 replicas → 90% traffic

# Canary: 1 replica → 10% traffic

# Both share same Service selector (app: payment-service)

# Canary Deployment

apiVersion: apps/v1

kind: Deployment

metadata:

name: payment-service-canary

spec:

replicas: 1  # 1 out of 10 total = 10% traffic

selector:

matchLabels:

app: payment-service

track: canary

template:

metadata:

labels:

app: payment-service  # Same label as stable — gets traffic!

track: canary

spec:

containers:

- image: ecr.../payment:v2.0.0-rc1

# Advanced canary with Ingress (NGINX Ingress Controller):

annotations:

nginx.ingress.kubernetes.io/canary: 'true'

nginx.ingress.kubernetes.io/canary-weight: '10'  # 10% traffic

🏗️ CMG PROJECT EXAMPLE

In CMG, we use canary deployments for high-risk payment calculation changes. We route 5% of traffic to new version, monitor error rates and latency in Grafana for 30 minutes. If metrics are healthy, Jenkins pipeline increases canary to 25% → 50% → 100%.

💾 SECTION 9: Storage in Kubernetes

Q15: How does Kubernetes handle storage orchestration?

💡 SIMPLE DEFINITION

Kubernetes storage has 3 key objects: PersistentVolume (actual storage), PersistentVolumeClaim (request for storage), and StorageClass (type of storage + automatic provisioning).

# CMG Storage Flow (Dynamic Provisioning with AWS EBS):

Developer creates PVC requesting 10Gi storage

↓

K8s finds matching StorageClass (aws-ebs-gp3)

↓

StorageClass calls AWS EBS provisioner

↓

AWS creates 10Gi EBS volume

↓

K8s creates PV and binds it to PVC

↓

Pod mounts PVC as volume

# StorageClass for AWS EBS GP3

apiVersion: storage.k8s.io/v1

kind: StorageClass

metadata:

name: aws-ebs-gp3

provisioner: ebs.csi.aws.com

parameters:

type: gp3

encrypted: 'true'

reclaimPolicy: Delete

volumeBindingMode: WaitForFirstConsumer  # Create volume in same AZ as Pod

Access Mode

Description

Use Case

ReadWriteOnce (RWO)

One node can mount read-write

AWS EBS, most block storage — StatefulSets

ReadOnlyMany (ROX)

Multiple nodes can mount read-only

Shared config files, static content

ReadWriteMany (RWX)

Multiple nodes can mount read-write

AWS EFS, NFS — shared file storage across Pods

☁️ SECTION 10: AWS EKS Specific Topics

EKS Architecture Overview

# CMG EKS Architecture:

AWS Account (UK Gov - eu-west-2)

├── VPC

│   ├── Public Subnets (3 AZs) → ALB, NAT Gateway

│   └── Private Subnets (3 AZs) → EKS Worker Nodes, Pods

├── EKS Control Plane (AWS Managed)

│   ├── kube-apiserver (HA across AZs)

│   ├── etcd (managed by AWS)

│   └── kube-scheduler, kube-controller-manager

├── EKS Node Groups (Worker Nodes)

│   ├── app-nodegroup (m5.xlarge x3) → microservices

│   ├── jenkins-nodegroup (c5.2xlarge x2) → Jenkins agents

│   └── monitoring-nodegroup (r5.xlarge x2) → Prometheus, ELK

├── AWS Load Balancer Controller → ALB/NLB provisioning

├── Cluster Autoscaler → Node scaling

├── AWS VPC CNI → Pod networking

└── IRSA → Pod AWS API access

Key EKS Interview Topics

EKS Control Plane is fully managed by AWS — no master node SSH access

Worker Nodes are EC2 instances in your VPC (you manage them)

IRSA: IAM Roles for Service Accounts — no hardcoded AWS credentials in Pods

aws-auth ConfigMap maps IAM users/roles to K8s RBAC roles

EKS Add-ons: VPC CNI, kube-proxy, CoreDNS (managed by AWS)

EKS Fargate: serverless nodes — no EC2 management, per-Pod billing

Q77: What is etcd in Kubernetes? What are its key characteristics?

💡 SIMPLE DEFINITION

etcd is Kubernetes's database. It stores EVERYTHING about the cluster — all Pod definitions, Service configs, Secrets, ConfigMaps. If etcd is lost, the entire cluster state is lost.

Distributed key-value store using Raft consensus algorithm

Runs as 3 or 5 members (odd number for quorum)

Quorum = (n+1)/2 members must agree for writes (3 nodes = need 2 to agree)

In EKS: AWS manages etcd — fully HA, multi-AZ, automatic backup

⚠️ INTERVIEW KEY POINTS

etcd must be backed up regularly with etcdctl snapshot save

In self-managed K8s: encrypt etcd at rest using AES-CBC or AES-GCM

In AWS EKS: AWS manages etcd backup and encryption automatically

Lost etcd = lost cluster — this is why etcd backup is critical

Q92: How can you ensure high availability of the Kubernetes control plane?

Run 3+ kube-apiserver instances behind a load balancer

Run etcd as a 3 or 5-member cluster across different nodes/AZs

kube-controller-manager and kube-scheduler use leader election (only 1 active at a time)

Take regular etcd snapshots for disaster recovery

Use managed control planes (EKS/GKE/AKS) where HA is built-in

🏗️ CMG PROJECT EXAMPLE

In CMG, we use AWS EKS — AWS automatically runs the control plane in HA mode across 3 AZs. We never touch master nodes. AWS guarantees 99.95% SLA for EKS control plane. We focus entirely on managing worker nodes and application deployments.

🛡️ SECTION 11: Admission Controllers & Webhooks

Q71: What is an Admission Controller in Kubernetes?

💡 SIMPLE DEFINITION

Admission Controllers are security checkpoints that intercept requests to the K8s API AFTER authentication/authorization but BEFORE saving to etcd. They can MUTATE (modify) or VALIDATE (approve/reject) objects.

# Request lifecycle with Admission Controllers:

kubectl apply → API Server → Authentication → Authorization

↓

Mutating Admission Webhooks (modify request)

↓

Validating Admission Webhooks (approve/reject)

↓

etcd (stored)

Controller

Action

Example Use Case

MutatingAdmissionWebhook

Can MODIFY requests

Auto-inject Vault sidecar, add labels, set resource defaults

ValidatingAdmissionWebhook

Can REJECT requests

Block containers running as root, enforce image policies

LimitRanger

Built-in — enforces limits

Set default CPU/memory if not specified

ResourceQuota

Built-in — namespace quotas

Prevent namespace from using too many resources

OPA Gatekeeper

Policy-as-code enforcement

Block untrusted registries, enforce naming conventions

🏗️ CMG PROJECT EXAMPLE

In CMG, we use Vault Agent Injector (Mutating Webhook) — automatically injects Vault sidecar container into Pods to fetch secrets.

We also use OPA Gatekeeper (Validating Webhook) — enforces policies like 'all images must come from CMG ECR' and 'Pods must have resource limits set'.

🔮 SECTION 12: Advanced Miscellaneous Topics

Q57: Explain the lifecycle of a Pod.

Phase

Meaning

Common Cause

Pending

Accepted by K8s, container not yet created

Image pulling, insufficient resources, PVC pending

Running

At least 1 container running/starting

Normal operating state

Succeeded

All containers terminated successfully (exit 0)

Completed Job/CronJob Pods

Failed

All containers terminated, at least 1 with error

App crashed, OOMKilled

Unknown

State cannot be determined

Node communication failure

Q58: What are Init Containers and when are they useful?

💡 SIMPLE DEFINITION

Init Containers run TO COMPLETION before the main app container starts. Like setup workers who prepare the workspace before the main employee arrives.

# CMG: Init Container waits for Oracle DB to be ready

spec:

initContainers:

- name: wait-for-db

image: busybox

command: ['sh', '-c', 'until nc -z oracle-db 1521; do sleep 5; done']

# Main container only starts after DB is reachable

containers:

- name: payment-service

image: ecr.../payment-service:v1.2.0

Wait for external dependency (DB, cache, message queue) before starting app

Run database migrations before app starts

Clone Git repo or download config files

Set file permissions on shared volumes

Q59: Explain resource requests and limits in Kubernetes.

💡 SIMPLE DEFINITION

Requests = minimum guaranteed resources (used for scheduling). Limits = maximum allowed resources (enforced at runtime). Think: Requests = reserved seat on a plane. Limits = maximum luggage allowed.

Requests

Limits

Minimum resources guaranteed

Maximum resources allowed

Used by Scheduler to find a node

Exceeding CPU limit → throttled

Node must have at least this much available

Exceeding Memory limit → OOMKilled (restarted)

Set this to normal operating usage

Set this to peak usage + buffer

⚠️ QoS Classes — Interviewers Love This!

Guaranteed: requests == limits (highest priority, last to be evicted)

Burstable: limits > requests (medium priority)

BestEffort: no requests or limits set (lowest priority, first evicted under pressure)

CMG Best Practice: Always set requests AND limits. Guaranteed QoS for critical services like Payment.

Q74: What is kubeconfig and how is it used?

# kubeconfig file: ~/.kube/config

# Structure:

clusters:    # List of clusters (EKS, minikube, etc.)

users:       # Authentication credentials per cluster

contexts:    # Cluster + user + namespace combination

current-context: cmg-production  # Active context

# CMG: Jenkins Agent kubeconfig for EKS

aws eks update-kubeconfig \

--region eu-west-2 \

--name cmg-eks-cluster \

--kubeconfig /home/jenkins/.kube/config

# Switch between contexts

kubectl config get-contexts

kubectl config use-context cmg-production

kubectl config use-context cmg-staging

Q85: What is kubectl drain used for?

# kubectl drain — gracefully remove all Pods from a node

# Used before: node maintenance, upgrade, decommission

kubectl drain node-worker-1 \

--ignore-daemonsets \    # Don't evict DaemonSet Pods (Fluent Bit, etc.)

--delete-emptydir-data \  # Allow deletion of Pods using emptyDir

--grace-period=60         # Give Pods 60s to finish

# After drain: node is marked Unschedulable

# PDBs are RESPECTED — K8s waits before evicting to maintain minAvailable

# After maintenance — uncordon to allow scheduling again

kubectl uncordon node-worker-1

# kubectl cordon — just marks unschedulable, doesn't evict existing Pods

kubectl cordon node-worker-1

Q36: Describe a scenario where you would use a Custom Resource Definition (CRD) and Operator.

💡 SIMPLE DEFINITION

CRDs extend K8s API with custom resource types. Operators are custom controllers that manage these CRDs — encoding human operational knowledge into code.

🏗️ CMG PROJECT EXAMPLE — Vault Operator

In CMG, we use the HashiCorp Vault Operator (a CRD + Custom Controller).

CRD: VaultStaticSecret — defines which secrets to sync from Vault to K8s

Operator: Watches VaultStaticSecret CRDs, fetches secrets from Vault, creates K8s Secrets

Result: Developers just create a VaultStaticSecret resource — Operator handles secret sync automatically

# CRD usage example (VaultStaticSecret)

apiVersion: secrets.hashicorp.com/v1beta1

kind: VaultStaticSecret

metadata:

name: payment-db-secret

namespace: cmg-payments

spec:

type: kv-v2

mount: cmg-secrets

path: payment-service/database

destination:

name: payment-db-credentials  # Creates K8s Secret with this name

create: true

⚡ QUICK REVISION NOTES & CHEAT SHEET

Top Kubernetes Commands — Must Know

# ===== POD COMMANDS =====

kubectl get pods -n <ns> -o wide

kubectl describe pod <pod> -n <ns>

kubectl logs <pod> -n <ns> --previous

kubectl exec -it <pod> -n <ns> -- /bin/sh

kubectl top pods -n <ns> --sort-by=cpu

# ===== DEPLOYMENT COMMANDS =====

kubectl rollout status deployment/<name> -n <ns>

kubectl rollout history deployment/<name> -n <ns>

kubectl rollout undo deployment/<name> -n <ns>

kubectl scale deployment/<name> --replicas=5 -n <ns>

kubectl set image deployment/<name> <container>=<new-image> -n <ns>

# ===== DEBUGGING COMMANDS =====

kubectl get events -n <ns> --sort-by='.lastTimestamp'

kubectl get endpoints <svc> -n <ns>

kubectl debug pod/<name> -it --image=busybox --copy-to=debug-pod

kubectl diff -f deployment.yaml

# ===== NODE COMMANDS =====

kubectl top nodes

kubectl describe node <node>

kubectl drain <node> --ignore-daemonsets --delete-emptydir-data

kubectl cordon <node>

kubectl uncordon <node>

# ===== HELM COMMANDS =====

helm list -n <ns>

helm upgrade --install <release> <chart> -f values-prod.yaml -n <ns>

helm rollback <release> <revision> -n <ns>

helm history <release> -n <ns>

Interview Keywords — Use These in Answers

Core Concepts

Advanced Concepts

Declarative vs Imperative

IRSA (IAM Roles for Service Accounts)

Self-healing

GitOps / ArgoCD

Rolling updates / Rollback

etcd as source of truth

Horizontal Pod Autoscaling

CNI plugin / VPC CNI

Resource requests/limits

CoreDNS / Service discovery

OOMKilled

Ingress Controller / ALB

CrashLoopBackOff

RBAC / least privilege

PodDisruptionBudget

Pod Security Standards

Common Interview Traps — Avoid These Mistakes

Wrong Answer

Correct Answer

Context

'Secrets are encrypted'

Secrets are Base64 ENCODED, not encrypted. Enable etcd encryption + use Vault.

Security Q

'NodePort is used in production'

Production uses LoadBalancer + Ingress. NodePort is dev/test only.

Service Types Q

'Docker is required for K8s'

K8s uses Container Runtime Interface (CRI). containerd/CRI-O is now default.

Architecture Q

'DaemonSet runs on master nodes'

DaemonSet runs on all worker nodes (and possibly control plane if tolerated).

DaemonSet Q

'Namespaces provide strong isolation'

Namespaces are logical — they don't provide network isolation. Use NetworkPolicies for that.

Namespaces Q

'HPA and VPA can be used together'

HPA+VPA conflict on CPU metrics. Use VPA for memory only if combining them.

Autoscaling Q

30-Second Answers Bank

What is Kubernetes?

K8s is a container orchestration platform that automates deployment, scaling, and management of containerized apps. In CMG, we use AWS EKS to run 50+ microservices with self-healing, auto-scaling via HPA, and zero-downtime deployments via Helm.

What is the difference between Deployment and StatefulSet?

Deployment manages stateless apps — Pods have random names and no persistent storage. StatefulSet manages stateful apps (like databases) — Pods have stable ordered names (db-0, db-1), own PVCs, and ordered start/stop. In CMG, microservices use Deployments; databases would use StatefulSets.

How do you handle Kubernetes secrets securely?

By default, K8s Secrets are only Base64 encoded, not encrypted. In CMG, we use HashiCorp Vault + External Secrets Operator. Secrets live in Vault, synced to K8s at runtime. We enable RBAC on Secrets and etcd encryption at rest. No secrets in Git, no hardcoded credentials.

How do you achieve zero-downtime deployments?

Using Kubernetes Deployments with RollingUpdate strategy, maxUnavailable: 0 and maxSurge: 1. Combined with Readiness Probes — K8s only removes old Pods when new Pods are verified ready. In CMG, our Jenkins pipeline uses helm upgrade which triggers rolling updates automatically.

Most Frequently Asked Kubernetes Interview Questions

1. What is Kubernetes and why is it better than Docker alone?

2. Explain K8s architecture — control plane vs worker nodes

3. What is a Pod? Why is it the smallest deployable unit?

4. Difference between Deployment, StatefulSet, and DaemonSet?

5. What is a Service? Types of Services?

6. What is Ingress? Difference from LoadBalancer Service?

7. How does rolling update work? How to rollback?

8. What is HPA? How does it work?

9. Explain RBAC in Kubernetes

10. How do you manage secrets securely?

11. What is a PodDisruptionBudget?

12. How do you troubleshoot CrashLoopBackOff?

13. What is GitOps? How does ArgoCD work?

14. What is etcd? Why is it critical?

15. How does Kubernetes DNS work?

One-Day Revision Summary

Topic

Key Concepts

Revision Time

Architecture

Control Plane (API Server, etcd, Scheduler, Controller) + Worker Nodes (kubelet, kube-proxy, CRI)

Hour 1

Workloads

Pod → ReplicaSet → Deployment → StatefulSet → DaemonSet → Job/CronJob

Hour 2

Networking

Services (ClusterIP/NodePort/LB), Ingress, NetworkPolicy, CoreDNS

Hour 3

Storage

PV, PVC, StorageClass, Access Modes (RWO/ROX/RWX)

Hour 4

Security

RBAC, ServiceAccounts, IRSA, Secrets (Vault), PSS, Admission Controllers

Hour 5

Scaling

HPA (replicas), VPA (resources), Cluster Autoscaler (nodes)

Hour 6

Troubleshooting

CrashLoopBackOff, Pending, ImagePullBackOff, Service not routing

Hour 7

Advanced

Taints/Tolerations, Affinity, PDB, Init Containers, Blue/Green, Canary, GitOps

Hour 8

KUBERNETES + EKS

Addendum — New Questions (File 2)

📋 DOCUMENT UPDATE SUMMARY — FILE 2

Questions Already Existing (answered in File 1 — NOT duplicated): ~30

New Questions Added: ~25 (EKS Scenarios, EKS Commands, K8s Scenarios, Resource Quotas, Operators deep-dive, kubectl command bank)

Duplicate Questions Ignored: Q1-Q10 Basic K8s, Q1-Q10 Intermediate K8s, StatefulSet, DaemonSet, Rolling Updates, Helm, RBAC (all answered in File 1)

Topics Updated: EKS Deep Dive, Kubernetes Scenarios, kubectl Command Reference, eksctl Command Reference

🎭 KUBERNETES SCENARIO QUESTIONS

QS1: Node becomes unresponsive and needs to be replaced. How do you replace it without downtime?

💡 SITUATION

One EKS worker node is unresponsive. All Pods on it need to be migrated to healthy nodes without application downtime.

▶ Step-by-Step Node Replacement Procedure

# Step 1: Drain the unresponsive node (gracefully evict all Pods)

kubectl drain node-worker-3 \

--ignore-daemonsets \

--delete-emptydir-data \

--grace-period=60 \

--timeout=300s

# Pods are rescheduled to healthy nodes

# PodDisruptionBudgets are RESPECTED during drain

# Step 2: Cordon the node (mark as unschedulable — no NEW Pods land here)

kubectl cordon node-worker-3

# Step 3: Verify all Pods moved off the node

kubectl get pods --all-namespaces -o wide | grep node-worker-3

# Step 4: Remove the node from cluster (or terminate EC2 instance)

kubectl delete node node-worker-3

# In AWS EKS — terminate the EC2 instance from ASG

# ASG will automatically provision replacement node

# Step 5: Verify new node joined and is Ready

kubectl get nodes

# Step 6: Uncordon if reusing the node (after repair)

kubectl uncordon node-worker-3

🏗️ CMG PROJECT EXAMPLE

In CMG EKS Managed Node Group: we use Rolling Update strategy for node upgrades.

AWS automatically drains, terminates, and replaces nodes one at a time.

PDBs ensure payment-service always has minimum 2 replicas during node replacement.

Cluster Autoscaler ensures new node joins before workloads are impacted.

⚠️ INTERVIEWER EXPECTS

Mention drain BEFORE delete — never delete first

Mention PodDisruptionBudgets — shows HA awareness

Mention --ignore-daemonsets — shows real-world knowledge (DaemonSet Pods can't be evicted)

Mention Cluster Autoscaler auto-replacement in EKS

QS2: Stateful application needs persistent storage. How do you ensure data is retained across Pod rescheduling?

💡 SITUATION

A database running in K8s must retain data even when Pods restart, reschedule, or are updated.

# Solution: StatefulSet + PersistentVolumeClaims + StorageClass

# 1. StorageClass (AWS EBS GP3 — automatically provisions volumes)

apiVersion: storage.k8s.io/v1

kind: StorageClass

metadata:

name: aws-ebs-gp3

provisioner: ebs.csi.aws.com

parameters:

type: gp3

encrypted: 'true'

volumeBindingMode: WaitForFirstConsumer

# 2. StatefulSet with VolumeClaimTemplates

apiVersion: apps/v1

kind: StatefulSet

metadata:

name: mysql

namespace: cmg-data

spec:

replicas: 3

volumeClaimTemplates:       # Each Pod gets its OWN PVC

- metadata:

name: mysql-data

spec:

accessModes: [ReadWriteOnce]

storageClassName: aws-ebs-gp3

resources:

requests:

storage: 50Gi

template:

spec:

containers:

- name: mysql

volumeMounts:

- name: mysql-data

mountPath: /var/lib/mysql

Pod

PVC (auto-created)

Storage

mysql-0

mysql-data-mysql-0 (PVC)

50Gi EBS volume (unique)

mysql-1

mysql-data-mysql-1 (PVC)

50Gi EBS volume (unique)

mysql-2

mysql-data-mysql-2 (PVC)

50Gi EBS volume (unique)

🔑 KEY POINT

Scaling DOWN a StatefulSet does NOT delete PVCs automatically. PVCs persist and reattach when Pod is recreated. Manual deletion required if data is no longer needed.

QS3: Pods with high CPU usage detected. How do you investigate and mitigate?

# Investigation Steps:

# Step 1: Identify high-CPU Pods across cluster

kubectl top pods --all-namespaces --sort-by=cpu

# Step 2: Check which node is overloaded

kubectl top nodes

# Step 3: Describe the Pod for resource limits

kubectl describe pod <high-cpu-pod> -n cmg-payments

# Check: 'Limits' and 'Requests' section

# Step 4: Look inside the container

kubectl exec -it <pod-name> -n cmg-payments -- top

# Step 5: Check application logs for clues

kubectl logs <pod-name> -n cmg-payments --tail=100

# Mitigation Options:

# Option 1: Scale horizontally (distribute load)

kubectl scale deployment payment-service --replicas=6 -n cmg-payments

# Option 2: Enable HPA to auto-scale

kubectl autoscale deployment payment-service --cpu-percent=70 --min=3 --max=15 -n cmg-payments

# Option 3: Adjust resource limits if they're too low

# Update Deployment YAML and apply

🏗️ CMG PROJECT EXAMPLE

In CMG, during month-end processing, Payment Service CPU spikes to 95%.

HPA automatically scales from 3 → 12 replicas when CPU > 70%.

Cluster Autoscaler adds new EC2 nodes if existing nodes are full.

After processing, HPA scales back down — cost savings maintained.

QS4: Need to enforce communication restrictions between microservices. How would you achieve this?

💡 SOLUTION

Use Kubernetes NetworkPolicies. Default: deny all. Then explicitly allow only required communication paths.

# CMG: Default deny all in cmg-payments namespace

apiVersion: networking.k8s.io/v1

kind: NetworkPolicy

metadata:

name: default-deny-all

namespace: cmg-payments

spec:

podSelector: {}    # Applies to ALL pods in namespace

policyTypes:

- Ingress

- Egress

# No rules = deny all ingress and egress

# CMG: Allow Notification Service → Payment Service

apiVersion: networking.k8s.io/v1

kind: NetworkPolicy

metadata:

name: allow-notification-to-payment

namespace: cmg-payments

spec:

podSelector:

matchLabels:

app: payment-service

policyTypes:

- Ingress

ingress:

- from:

- namespaceSelector:

matchLabels:

name: cmg-notifications

podSelector:

matchLabels:

app: notification-service

ports:

- protocol: TCP

port: 8080

⚠️ INTERVIEW TRAP

NetworkPolicies only work if your CNI plugin supports them! Flannel alone does NOT support NetworkPolicies. In CMG EKS, we use Calico CNI alongside VPC CNI for NetworkPolicy enforcement.

QS5: Schedule specific pods on specific nodes based on custom requirements. How?

💡 SIMPLE DEFINITION

Use a combination of Node Labels + Node Affinity + Taints + Tolerations to control where Pods land.

Method

Type

Use Case

nodeSelector

Simple label match

Pod must run on nodes with label 'disktype: ssd'

Node Affinity

Flexible rules (required/preferred)

Pod MUST run in AZ eu-west-2a OR eu-west-2b

Taints + Tolerations

Node repels Pods unless they tolerate

GPU node only runs GPU workloads

Pod Affinity/Anti-Affinity

Schedule near/away from other Pods

Spread Payment Pods across AZs

# CMG: Schedule payment-service ONLY on high-memory nodes

# Step 1: Label the nodes

kubectl label nodes node-highmem-1 node-type=high-memory

kubectl label nodes node-highmem-2 node-type=high-memory

# Step 2: Add nodeAffinity to Payment Service Deployment

spec:

affinity:

nodeAffinity:

requiredDuringSchedulingIgnoredDuringExecution:

nodeSelectorTerms:

- matchExpressions:

- key: node-type

operator: In

values: ['high-memory']

podAntiAffinity:

requiredDuringSchedulingIgnoredDuringExecution:

- labelSelector:

matchLabels:

app: payment-service

topologyKey: 'kubernetes.io/hostname'

# No 2 payment Pods on same node

QS6: Scale a Kubernetes Deployment manually. How?

# Method 1: kubectl scale (immediate, imperative)

kubectl scale deployment payment-service --replicas=5 -n cmg-payments

# Method 2: kubectl edit (interactive edit of live object)

kubectl edit deployment payment-service -n cmg-payments

# Change spec.replicas: 5 in the editor

# Method 3: kubectl patch (scriptable)

kubectl patch deployment payment-service -n cmg-payments \

-p '{"spec":{"replicas":5}}'

# Method 4: Update YAML and apply (GitOps friendly)

# Edit deployment.yaml: replicas: 5

kubectl apply -f deployment.yaml

# Verify

kubectl get deployment payment-service -n cmg-payments

kubectl rollout status deployment/payment-service -n cmg-payments

🏗️ CMG PROJECT EXAMPLE

In CMG, we never scale manually in production — HPA handles it automatically. For planned events (batch processing), we pre-scale via Jenkins pipeline: kubectl scale deployment payment-service --replicas=10 before batch job starts.

QS7: Replace unresponsive node + Implement blue-green deployments using GitOps. How?

💡 GITOPS BLUE-GREEN FLOW

GitOps = Git is source of truth. All changes go through Git PR → ArgoCD syncs to cluster. Blue-Green uses two Deployments, one Service — switch by updating Service selector in Git.

# CMG GitOps Blue-Green Implementation

# Git Repository Structure:

gitops-config/

├── apps/

│   ├── payment-service-blue/   # Blue environment

│   │   ├── deployment.yaml     # image: payment:v1.0

│   │   └── kustomization.yaml

│   └── payment-service-green/  # Green environment

│       ├── deployment.yaml     # image: payment:v2.0

│       └── kustomization.yaml

└── services/

└── payment-service.yaml    # selector: version: blue/green

# Blue-Green Switch (via Git PR):

# 1. Jenkins builds new image → pushes to ECR as :v2.0

# 2. Update green/deployment.yaml with new image tag

# 3. ArgoCD deploys green environment

# 4. Test green environment (smoke tests)

# 5. Raise PR: change service selector from 'blue' to 'green'

# 6. PR approved → ArgoCD applies → instant traffic switch

# Rollback = revert PR → selector switches back to blue

📊 RESOURCE QUOTAS & MULTI-TENANCY

QRQ1: Explain Resource Quotas in Kubernetes and how they help with cluster resource management.

💡 SIMPLE DEFINITION

Resource Quotas are namespace-level limits that cap total CPU, memory, Pod count, and storage a team can consume. They prevent one team's app from monopolizing shared cluster resources.

# CMG: Resource Quota per team namespace

apiVersion: v1

kind: ResourceQuota

metadata:

name: cmg-payments-quota

namespace: cmg-payments

spec:

hard:

# Compute

requests.cpu: '20'          # Total CPU requests across all Pods

requests.memory: 40Gi       # Total memory requests

limits.cpu: '40'            # Total CPU limits

limits.memory: 80Gi         # Total memory limits

# Object count

pods: '50'                  # Max 50 Pods

services: '20'              # Max 20 Services

persistentvolumeclaims: '10' # Max 10 PVCs

secrets: '30'               # Max 30 Secrets

configmaps: '30'            # Max 30 ConfigMaps

# Check current usage vs quota

kubectl describe resourcequota cmg-payments-quota -n cmg-payments

⚠️ IMPORTANT: LimitRange works WITH ResourceQuota

ResourceQuota: Total limits for the entire namespace

LimitRange: Default requests/limits per individual Pod (if not specified in YAML)

Without LimitRange: A Pod with no limits counts as 0 against quota but can use ALL node resources!

Best Practice: Always use BOTH together

# LimitRange: Default limits for any Pod that doesn't specify them

apiVersion: v1

kind: LimitRange

metadata:

name: cmg-payments-limits

namespace: cmg-payments

spec:

limits:

- type: Container

default:           # Applied if container doesn't set limits

cpu: 500m

memory: 512Mi

defaultRequest:    # Applied if container doesn't set requests

cpu: 100m

memory: 128Mi

max:               # Container cannot exceed these

cpu: '4'

memory: 8Gi

🏗️ CMG PROJECT EXAMPLE

In CMG EKS, each microservice team has their own namespace with Resource Quota.

cmg-payments team: 20 CPU, 40Gi RAM, 50 Pods max

cmg-notifications team: 10 CPU, 20Gi RAM, 30 Pods max

Prevents Payment Service team from accidentally consuming all cluster resources during load testing.

QRQ2: Scenario: Multi-tenant EKS cluster. Ensure resource isolation between teams.

Mechanism

Purpose

Implementation

Namespace per team

Logical separation of resources

kubectl create ns cmg-team-a

ResourceQuota per namespace

Cap total resource consumption

Max CPU/Memory per team namespace

LimitRange per namespace

Set Pod-level defaults and caps

Each Pod max 4 CPU, 8Gi RAM

NetworkPolicy

Isolate inter-namespace traffic

Team A Pods cannot reach Team B Pods

RBAC

Restrict API access per team

Team A can only manage their namespace

Pod Security Standards

Enforce security per namespace

All Pods run as non-root

☁️ AWS EKS DEEP DIVE — NEW QUESTIONS

QEKS1: What is the difference between Amazon EKS and self-managed Kubernetes clusters?

Amazon EKS (Managed)

Self-Managed Kubernetes

AWS manages control plane (apiserver, etcd, scheduler)

You install and manage kube-apiserver, etcd, etc.

Automatic HA across multiple AZs

You must configure HA yourself

Managed updates and patches (no downtime)

Manual updates and certificate rotation

No master node SSH or management

Full control but full responsibility

Integrated with IAM, ECR, ALB, CloudWatch

Manual integration with cloud services

Pay per cluster hour (~$0.10/hr) + worker nodes

No control plane cost — only infrastructure cost

🏗️ CMG PROJECT EXAMPLE

In CMG, we use EKS because: AWS manages control plane HA across 3 AZs. We focus ONLY on application deployment, not Kubernetes infrastructure. Security patches applied automatically. Reduces operational overhead for a UK government project with strict SLAs.

QEKS2: What is EKS Managed Node Groups?

💡 SIMPLE DEFINITION

Managed Node Groups let AWS create, manage, and lifecycle EC2 worker nodes for you. You define instance type, size, and scaling — AWS handles node provisioning, AMI updates, and graceful draining during upgrades.

# Create Managed Node Group via Terraform (CMG approach)

resource "aws_eks_node_group" "cmg_app_nodes" {

cluster_name    = aws_eks_cluster.cmg.name

node_group_name = "cmg-app-nodegroup"

node_role_arn   = aws_iam_role.eks_node_role.arn

subnet_ids      = aws_subnet.private[*].id

instance_types = ["m5.xlarge"]

scaling_config {

desired_size = 3

min_size     = 2

max_size     = 10

}

update_config {

max_unavailable = 1  # Rolling update: 1 node at a time

}

labels = {

role = "application"

environment = "production"

}

}

Managed Node Group Benefits

Limitations

AWS manages EC2 lifecycle

Less control over node configuration

Automatic AMI updates

Cannot use custom AMIs easily

Graceful drain during updates

Limited flexibility vs self-managed

Works with Cluster Autoscaler

Integrated with EKS

QEKS3: What are the benefits of using AWS Fargate with EKS?

💡 SIMPLE DEFINITION

Fargate = serverless worker nodes. You don't manage EC2 instances at all. Each Pod gets its own isolated compute environment. Pay per Pod CPU/memory — no idle node cost.

Fargate Benefits

Fargate Limitations

No EC2 management (serverless nodes)

Cannot use DaemonSets on Fargate Pods

Automatic scaling per Pod

Cold start latency for new Pods

Strong isolation (each Pod = dedicated VM)

Limited to certain AWS regions/AZs

No node patching needed

No GPU support

Pay only for Pod compute time

More expensive for long-running steady workloads

🏗️ CMG PROJECT EXAMPLE

In CMG, we use Fargate for batch/one-off Jobs (report generation, data exports) — pay only for the duration of the Job.

We use Managed Node Groups for always-on microservices (Payment Service, Notification Service) — more cost-effective for continuous workloads.

QEKS4: How can you integrate AWS App Mesh with EKS?

💡 SIMPLE DEFINITION

AWS App Mesh is a service mesh that provides traffic routing, observability, and mTLS security for microservices. It runs Envoy proxy as a sidecar in each Pod.

# App Mesh Architecture in CMG EKS:

Payment Service Pod:

├── payment-app container (main app)

└── envoy sidecar (App Mesh proxy)

↓ intercepts all traffic

↓ enforces routing rules

↓ reports metrics to CloudWatch

# App Mesh Components:

# Mesh: Top-level service mesh boundary

# Virtual Service: Logical service name

# Virtual Node: Represents actual K8s Service/Pod

# Virtual Router: Traffic routing rules

# Benefits in CMG:

# - mTLS between Payment → Notification (zero-trust)

# - Traffic weights for canary deployments

# - Distributed tracing via X-Ray

# - Circuit breaking (prevent cascade failures)

QEKS5: What is EKS Pod Identity Webhook (IRSA)? How does it enhance security?

💡 ALREADY ANSWERED IN FILE 1 — QUICK REVIEW

IRSA = IAM Roles for Service Accounts

Pods get temporary AWS credentials via OIDC token exchange — no hardcoded access keys

See Section 4 of File 1 for full IRSA deep-dive

Key security benefit: Principle of Least Privilege at Pod level

QEKS6: EKS Scenario: Application needs to scale based on a custom metric (not CPU/Memory). How?

💡 SOLUTION

Custom metrics HPA using KEDA (Kubernetes Event-Driven Autoscaling) or Prometheus Adapter. HPA v2 supports custom and external metrics.

# CMG: Scale Payment Service based on SQS Queue depth

# (scale up when unprocessed payment messages pile up)

# Using KEDA (Kubernetes Event-Driven Autoscaling):

apiVersion: keda.sh/v1alpha1

kind: ScaledObject

metadata:

name: payment-scaler

namespace: cmg-payments

spec:

scaleTargetRef:

name: payment-service

minReplicaCount: 2

maxReplicaCount: 20

triggers:

- type: aws-sqs-queue

authenticationRef:

name: keda-aws-credentials

metadata:

queueURL: https://sqs.eu-west-2.amazonaws.com/123/cmg-payments-queue

queueLength: '10'      # Scale: 1 Pod per 10 messages in queue

awsRegion: eu-west-2

# KEDA auto-scales Payment Service based on SQS queue depth:

# 0 messages → 2 Pods (min)

# 100 messages → 10 Pods

# 200 messages → 20 Pods (max)

🏗️ CMG PROJECT EXAMPLE

In CMG, our payment batch processing uses SQS. Instead of guessing when to scale, KEDA automatically scales Payment Service workers based on actual queue depth — ensuring payments are processed within SLA during peak periods.

QEKS7: EKS Scenario: Multi-AZ EKS cluster for high availability. Setup?

# CMG EKS Multi-AZ Setup (via Terraform):

# VPC across 3 AZs

resource "aws_vpc" "cmg_vpc" {

cidr_block = "10.0.0.0/16"

}

# Private subnets in each AZ for worker nodes

resource "aws_subnet" "private" {

count             = 3

vpc_id            = aws_vpc.cmg_vpc.id

cidr_block        = cidrsubnet("10.0.0.0/16", 4, count.index)

availability_zone = data.aws_availability_zones.available.names[count.index]

tags = {

"kubernetes.io/cluster/cmg-eks" = "shared"

"kubernetes.io/role/internal-elb" = "1"

}

}

# EKS cluster — control plane auto-spans all AZs

resource "aws_eks_cluster" "cmg" {

vpc_config {

subnet_ids = aws_subnet.private[*].id  # All 3 AZ subnets

}

}

# Pod Anti-Affinity: Spread app Pods across AZs

affinity:

podAntiAffinity:

requiredDuringSchedulingIgnoredDuringExecution:

- topologyKey: topology.kubernetes.io/zone

🏗️ CMG HA Architecture

3 AZs: eu-west-2a, eu-west-2b, eu-west-2c

EKS Control Plane: AWS manages HA automatically across all AZs

Worker Nodes: 3 nodes per AZ (9 total) via Managed Node Group

Payment Service: 1 Pod per AZ minimum (podAntiAffinity rule)

AWS ALB: Multi-AZ load balancer (Ingress) routes traffic across AZs

RDS Multi-AZ: Automatic failover if primary AZ fails

QEKS8: Implement fine-grained access control in EKS. How?

💡 EKS Access Control = IAM + RBAC (Two layers)

AWS IAM controls who can connect to EKS API. Kubernetes RBAC controls what they can do once connected. The aws-auth ConfigMap bridges IAM identities to K8s RBAC.

# Layer 1: aws-auth ConfigMap — IAM to K8s RBAC mapping

apiVersion: v1

kind: ConfigMap

metadata:

name: aws-auth

namespace: kube-system

data:

mapRoles: |

# Jenkins Agent IAM Role → cluster-admin RBAC

- rolearn: arn:aws:iam::123456789:role/CMG-Jenkins-Agent-Role

username: jenkins-agent

groups:

- system:masters

# Developer IAM Role → view-only RBAC

- rolearn: arn:aws:iam::123456789:role/CMG-Developer-Role

username: developer

groups:

- cmg-developer-group

mapUsers: |

# SRE individual user

- userarn: arn:aws:iam::123456789:user/suraj.gomase

username: suraj

groups:

- system:masters

# Layer 2: Kubernetes RBAC for cmg-developer-group

# (see File 1, Section 4 for full RBAC YAML)

⌨️ KUBECTL COMMAND REFERENCE BANK

Core kubectl Commands with Full Breakdown

▶ Pod Management

# Get pods with details

kubectl get pods -n cmg-payments -o wide --show-labels

# -o wide: shows Node name, Pod IP, etc.

# --show-labels: shows all labels

# Get only Running pods

kubectl get pods --field-selector=status.phase=Running -n cmg-payments

# Forward local port to Pod (for debugging)

kubectl port-forward pod/payment-pod-abc123 8080:8080 -n cmg-payments

# Access at: http://localhost:8080

# Copy file from Pod to local

kubectl cp cmg-payments/payment-pod-abc123:/app/logs/app.log ./app.log

# Watch pods in real-time

kubectl get pods -n cmg-payments -w

▶ Deployment Management

# Update image in deployment (triggers rolling update)

kubectl set image deployment/payment-service \

payment-service=123456789.dkr.ecr.eu-west-2.amazonaws.com/payment-service:v2.0 \

-n cmg-payments

# Check rollout status (wait for completion)

kubectl rollout status deployment/payment-service -n cmg-payments

# View rollout history

kubectl rollout history deployment/payment-service -n cmg-payments

# Preview changes before applying

kubectl diff -f deployment.yaml

# Apply and record change

kubectl apply -f deployment.yaml --record

▶ RBAC Commands

# Create Role (namespace-scoped)

kubectl create role cmg-dev-role \

--verb=get,list,watch \

--resource=pods,services,deployments \

-n cmg-payments

# Bind Role to Service Account

kubectl create rolebinding cmg-dev-binding \

--role=cmg-dev-role \

--serviceaccount=cmg-payments:payment-sa \

-n cmg-payments

# Check what permissions a user/SA has

kubectl auth can-i get pods --as=system:serviceaccount:cmg-payments:payment-sa -n cmg-payments

kubectl auth can-i delete secrets --as=developer -n cmg-payments

# List all RBAC bindings in namespace

kubectl get rolebindings -n cmg-payments

kubectl get clusterrolebindings

▶ ConfigMap and Secret Management

# Create ConfigMap from file

kubectl create configmap cmg-app-config --from-file=config.ini -n cmg-payments

# Create ConfigMap from literal values

kubectl create configmap cmg-app-config \

--from-literal=DB_HOST=oracle-db.cmg.internal \

--from-literal=LOG_LEVEL=INFO \

-n cmg-payments

# Create Secret (AVOID in production — use Vault!)

kubectl create secret generic cmg-db-secret \

--from-literal=DB_PASSWORD=supersecret \

-n cmg-payments

# Decode a secret value

kubectl get secret cmg-db-secret -n cmg-payments -o jsonpath='{.data.DB_PASSWORD}' | base64 -d

▶ Ingress Management

# Create Ingress (imperative — for quick test)

kubectl create ingress cmg-ingress \

--rule='api.cmg.gov.uk/payments=payment-service:80' \

-n cmg-payments

# List all ingresses

kubectl get ingresses -n cmg-payments

# Describe Ingress (check rules, LB address, events)

kubectl describe ingress cmg-ingress -n cmg-payments

# Delete Ingress

kubectl delete ingress cmg-ingress -n cmg-payments

▶ Service Account Management

# Create Service Account

kubectl create serviceaccount payment-service-sa -n cmg-payments

# Annotate with IRSA role

kubectl annotate serviceaccount payment-service-sa \

eks.amazonaws.com/role-arn=arn:aws:iam::123456789:role/CMG-Payment-Role \

-n cmg-payments

# Check SA details

kubectl describe serviceaccount payment-service-sa -n cmg-payments

⚙️ EKSCTL COMMAND REFERENCE

ℹ️ NOTE: eksctl vs AWS CLI vs Terraform

eksctl: CLI specifically for EKS — great for quick cluster creation and management

AWS CLI: General-purpose AWS commands — use for IAM, EC2, ECR, etc.

Terraform: Infrastructure-as-Code — preferred for production (CMG uses Terraform!)

In CMG: We use Terraform for all EKS infrastructure. eksctl used for quick debugging/inspection.

Cluster Operations

# Create cluster (quick — auto-selects AZs, instance types)

eksctl create cluster \

--name=cmg-eks-cluster \

--region=eu-west-2 \

--nodegroup-name=cmg-app-nodes \

--node-type=m5.xlarge \

--nodes=3 \

--nodes-min=2 \

--nodes-max=10 \

--managed

# List all clusters

eksctl get cluster --region=eu-west-2

# Delete cluster (deletes all associated resources!)

eksctl delete cluster --name=cmg-eks-cluster --region=eu-west-2

Node Group Operations

# Scale existing node group

eksctl scale nodegroup \

--cluster=cmg-eks-cluster \

--name=cmg-app-nodes \

--nodes=5 \

--region=eu-west-2

# Create new node group

eksctl create nodegroup \

--cluster=cmg-eks-cluster \

--name=cmg-gpu-nodes \

--node-type=p3.2xlarge \

--nodes=2 \

--managed

# List node groups

eksctl get nodegroup --cluster=cmg-eks-cluster

# Delete node group

eksctl delete nodegroup \

--cluster=cmg-eks-cluster \

--name=cmg-gpu-nodes

IAM Identity Mapping (aws-auth)

# Add IAM Role to EKS cluster (maps to K8s RBAC)

eksctl create iamidentitymapping \

--cluster=cmg-eks-cluster \

--arn=arn:aws:iam::123456789:role/CMG-Developer-Role \

--group=cmg-developer-group \

--username=developer \

--region=eu-west-2

# View all IAM mappings

eksctl get iamidentitymapping --cluster=cmg-eks-cluster

# Delete IAM mapping

eksctl delete iamidentitymapping \

--cluster=cmg-eks-cluster \

--arn=arn:aws:iam::123456789:role/CMG-Developer-Role

IRSA (IAM Service Accounts)

# Create IRSA-enabled service account

eksctl create iamserviceaccount \

--cluster=cmg-eks-cluster \

--name=payment-service-sa \

--namespace=cmg-payments \

--attach-policy-arn=arn:aws:iam::123456789:policy/CMG-Payment-S3-Policy \

--approve

# This creates: K8s ServiceAccount + IAM Role + OIDC trust policy

# List IRSA service accounts

eksctl get iamserviceaccount --cluster=cmg-eks-cluster

# Delete IRSA service account

eksctl delete iamserviceaccount \

--cluster=cmg-eks-cluster \

--name=payment-service-sa \

--namespace=cmg-payments

Fargate Profile Management

# Create Fargate profile (Pods in namespace run on Fargate)

eksctl create fargateprofile \

--cluster=cmg-eks-cluster \

--name=cmg-batch-fargate \

--namespace=cmg-batch \

--labels app=batch-job

# List Fargate profiles

eksctl get fargateprofile --cluster=cmg-eks-cluster

# Delete Fargate profile

eksctl delete fargateprofile \

--cluster=cmg-eks-cluster \

--name=cmg-batch-fargate

🤖 KUBERNETES OPERATORS — DEEP DIVE

QOP1: What are Kubernetes Operators? How do they extend Kubernetes functionality?

💡 SIMPLE DEFINITION

An Operator = Custom Resource Definition (CRD) + Custom Controller. It packages operational knowledge for complex apps into code. Instead of a human running backups, scaling, and upgrades manually, an Operator does it automatically.

# Operator Pattern:

Without Operator (manual DBA work):

- DBA manually creates MySQL pods

- DBA manually takes backups every night

- DBA manually handles failover

- DBA manually does version upgrades

With MySQL Operator:

- Create a MySQLCluster CRD

- Operator watches the CRD

- Operator automatically: provisions MySQL, takes backups, handles failover, does upgrades

# Example: Create a MySQL cluster with 3 nodes using Operator

apiVersion: mysql.oracle.com/v2

kind: InnoDBCluster          # Custom Resource (CRD)

metadata:

name: cmg-mysql-cluster

namespace: cmg-data

spec:

secretName: mysql-root-secret

instances: 3               # 3-node MySQL cluster

version: '8.0.32'

backupProfiles:

- name: daily-backup

dumpInstance:

storage:

s3Compliant:

bucketName: cmg-mysql-backups

# Operator handles everything from here!

🏗️ CMG PROJECT EXAMPLE

In CMG, we use these Operators:

1. HashiCorp Vault Operator — auto-syncs secrets from Vault to K8s Secrets

2. External Secrets Operator — fetches secrets from AWS Secrets Manager

3. AWS Load Balancer Controller — manages ALB/NLB from Ingress resources

4. Cluster Autoscaler — manages EC2 node scaling based on Pod scheduling needs

5. Prometheus Operator — manages Prometheus + Alertmanager configuration as CRDs

Operation Type

What It Means

Who Handles It

Day 1 Ops

Deploy the application

Handled by standard Kubernetes Deployments

Day 2 Ops

Operate the application

Automated by Operator (backups, upgrades, scaling, recovery)

Domain Knowledge

App-specific logic encoded in Operator

MySQL failover logic, Kafka rebalancing, etc.

📋 REPEATED QUESTIONS — FILE 1 vs FILE 2

✅ QUESTIONS ANSWERED IN FILE 1 — NOT DUPLICATED HERE

Q1: What is Kubernetes? → File 1, Section 1, Q1

Q2: Core components of Kubernetes? → File 1, Section 1, Q2

Q3: What is a Pod? → File 1, Section 1, Q3

Q4: What is a ReplicaSet? → File 1, Section 1, Q10

Q5: What is a Deployment? → File 1, Section 1, Q9

Q6: Container scaling in Kubernetes? → File 1, Section 3, Q23/Q25

Q7: What is a Namespace? → File 1, Section 1, Q5

Q8: Service discovery and load balancing? → File 1, Section 1, Q7/Q8

Q9: What is a ConfigMap? → File 1, Section 1, Q13

Q10: Expose Deployment externally? → File 1, Section 1, Q7/Q8/Q14

StatefulSet → File 1, Section 1, Q11

DaemonSet → File 1, Section 1, Q12

Rolling Updates → File 1, Section 3, Q21

Helm → File 1, Section 6, Q41

RBAC → File 1, Section 4, Q29

PodDisruptionBudget → File 1, Section 6, Q43

CRDs overview → File 1, Section 6, Q36

Liveness/Readiness Probes → File 1, Section 3, Q27

Node Affinity/Anti-Affinity → File 1, Section 6, Q38

Taints and Tolerations → File 1, Section 6, Q37

GitOps → File 1, Section 6, Q45

🆕 NEW QUESTIONS ADDED IN THIS ADDENDUM (File 2)

K8s Scenario S1: Node replacement procedure (drain/cordon/uncordon)

K8s Scenario S2: Persistent storage for stateful apps (PV/PVC/StatefulSet)

K8s Scenario S3: High CPU investigation and mitigation

K8s Scenario S4: NetworkPolicy for microservice communication restrictions

K8s Scenario S5: Node scheduling with Affinity + Taints

K8s Scenario S6: Manual Deployment scaling — all 4 methods

K8s Scenario S7: GitOps Blue-Green deployment full workflow

RQ1: Resource Quotas + LimitRange — namespace resource management

RQ2: Multi-tenant EKS isolation mechanisms

EKS1: EKS vs self-managed Kubernetes comparison

EKS2: Managed Node Groups — Terraform configuration

EKS3: Fargate with EKS — benefits and trade-offs

EKS4: AWS App Mesh integration

EKS6: Custom metric scaling with KEDA + SQS

EKS7: Multi-AZ EKS HA setup

EKS8: Fine-grained access control (IAM + aws-auth + RBAC)

OP1: Kubernetes Operators deep dive — Day 2 operations

kubectl Command Bank: RBAC, ConfigMaps, Secrets, Ingress, Port-forward, SA

eksctl Command Reference: Cluster, NodeGroup, IAM mapping, IRSA, Fargate
