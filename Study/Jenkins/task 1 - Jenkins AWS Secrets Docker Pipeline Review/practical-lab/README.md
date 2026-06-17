# Practical Lab: Jenkins + AWS Secrets Manager + Docker

## What You Will Do

You will perform this practical flow:

```text
Jenkins
  -> AWS Secrets Manager
  -> read Docker Hub username and token
  -> Docker login
  -> Docker build
  -> Docker push
```

This is a simple real-world DevOps practical.

---

## Folder Structure

```text
practical-lab/
  app/
    Dockerfile
    package.json
    server.js
    test.js
  aws/
    create-secret-command.md
    iam-policy-secrets-manager.json
    secret-example.json
  jenkins/
    Jenkinsfile
```

---

## Prerequisites

Install these on the Jenkins agent machine:

- Git
- Docker
- Node.js and npm
- AWS CLI
- jq
- Jenkins

Also required:

- AWS account
- Docker Hub account
- Docker Hub access token

Do not use your Docker Hub password. Use a Docker Hub access token.

---

## Step 1: Test the App Locally

Go to the app folder:

```bash
cd practical-lab/app
```

Install dependencies:

```bash
npm install
```

Run test:

```bash
npm test
```

Run app:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Health endpoint:

```text
http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

---

## Step 2: Build Docker Image Locally

From `practical-lab/app`:

```bash
docker build -t jenkins-practical:local .
```

Run container:

```bash
docker run -p 3000:3000 jenkins-practical:local
```

Open:

```text
http://localhost:3000
```

This proves your Dockerfile works before Jenkins is involved.

---

## Step 3: Create Docker Hub Access Token

In Docker Hub:

1. Go to Account Settings.
2. Go to Personal Access Tokens.
3. Create a token.
4. Copy the token.

You need:

```text
Docker username
Docker access token
```

---

## Step 4: Store Docker Credentials in AWS Secrets Manager

Use this secret format:

```json
{
  "username": "your-dockerhub-username",
  "password": "your-dockerhub-access-token"
}
```

Create the secret:

```bash
aws secretsmanager create-secret \
  --name dev/dockerhub/jenkins-practical \
  --description "Docker Hub credentials for Jenkins practical lab" \
  --secret-string '{"username":"your-dockerhub-username","password":"your-dockerhub-access-token"}' \
  --region ap-south-1
```

Test it:

```bash
aws secretsmanager get-secret-value \
  --secret-id dev/dockerhub/jenkins-practical \
  --query SecretString \
  --output text \
  --region ap-south-1
```

Expected output:

```json
{"username":"your-dockerhub-username","password":"your-dockerhub-access-token"}
```

Test jq:

```bash
aws secretsmanager get-secret-value \
  --secret-id dev/dockerhub/jenkins-practical \
  --query SecretString \
  --output text \
  --region ap-south-1 | jq -r '.username'
```

Expected output:

```text
your-dockerhub-username
```

---

## Step 5: Give Jenkins Permission to Read the Secret

Best option:

Attach an IAM role to the Jenkins EC2 instance or Jenkins agent.

Use the policy in:

```text
aws/iam-policy-secrets-manager.json
```

Replace:

```text
REPLACE_AWS_ACCOUNT_ID
```

with your AWS account ID.

Minimum required permissions:

```json
{
  "Action": [
    "secretsmanager:GetSecretValue",
    "secretsmanager:DescribeSecret"
  ]
}
```

Test from Jenkins machine:

```bash
aws sts get-caller-identity
```

Then:

```bash
aws secretsmanager get-secret-value \
  --secret-id dev/dockerhub/jenkins-practical \
  --query SecretString \
  --output text \
  --region ap-south-1
```

If this works on the Jenkins agent, Jenkins can read the secret.

---

## Step 6: Update Jenkinsfile

Open:

```text
jenkins/Jenkinsfile
```

Replace:

```groovy
IMAGE_REPO = 'REPLACE_DOCKERHUB_USERNAME/jenkins-practical'
```

Example:

```groovy
IMAGE_REPO = 'suraj123/jenkins-practical'
```

Keep this:

```groovy
SECRET_ID = 'dev/dockerhub/jenkins-practical'
```

because this matches the AWS secret name.

---

## Step 7: Create Jenkins Pipeline Job

In Jenkins:

1. Click `New Item`.
2. Select `Pipeline`.
3. Configure source code repository.
4. In pipeline script path, use:

```text
Study/Jenkins/task 1 - Jenkins AWS Secrets Docker Pipeline Review/practical-lab/jenkins/Jenkinsfile
```

If this repository root is already the Jenkins workspace root, that path will work.

If you copy only the lab folder to a separate repo, use:

```text
jenkins/Jenkinsfile
```

---

## Step 8: Run Jenkins Build

Expected stages:

```text
Checkout
Prepare Image Tag
Preflight Check
Install App Dependencies
Get Secret and Docker Login
Docker Build
Docker Push
```

Expected final result:

```text
Docker image pushed to Docker Hub
```

Example image:

```text
docker.io/your-dockerhub-username/jenkins-practical:build-15-a1b2c3d4e5f6
```

---

## Simple Explanation

Jenkins does not know your Docker password directly.

Instead:

1. Jenkins logs in to AWS using IAM.
2. Jenkins asks AWS Secrets Manager for the Docker credentials.
3. AWS checks IAM permissions.
4. AWS returns the secret securely.
5. Jenkins uses the secret only during the build.
6. Docker logs in using `--password-stdin`.
7. Jenkins builds and pushes the image.

---

## Common Errors and Fixes

### Error: `AccessDeniedException`

Meaning:

Jenkins does not have permission to read the secret.

Fix:

- Check IAM role.
- Check secret ARN in policy.
- Check AWS region.
- Run `aws sts get-caller-identity`.

### Error: `SecretNotFoundException`

Meaning:

Secret name or region is wrong.

Fix:

- Confirm secret name is `dev/dockerhub/jenkins-practical`.
- Confirm region is `ap-south-1`.

### Error: `jq: command not found`

Meaning:

`jq` is not installed on Jenkins agent.

Fix:

Install jq.

### Error: `docker: command not found`

Meaning:

Docker is not installed on Jenkins agent.

Fix:

Install Docker and allow Jenkins user to run Docker.

### Error: `denied: requested access to the resource is denied`

Meaning:

Docker Hub user cannot push to that repository.

Fix:

- Check `IMAGE_REPO`.
- Create the Docker Hub repository.
- Confirm Docker token has write permission.

---

## Interview Summary

You can explain this practical like this:

I created a Jenkins pipeline that builds and pushes a Docker image. Instead of storing Docker credentials in Jenkinsfile, I stored them in AWS Secrets Manager. Jenkins authenticates to AWS using IAM, retrieves the secret at runtime, parses it using jq, logs in to Docker Hub using `--password-stdin`, builds the Docker image, tags it with build number and Git SHA, and pushes it to Docker Hub. This improves security because secrets are encrypted by AWS KMS, access is controlled by IAM, and credentials are not hardcoded in source code.

