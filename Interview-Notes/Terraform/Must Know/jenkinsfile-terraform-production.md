# Production-Level Jenkinsfile for Terraform CI/CD

For a production DevOps Engineer interview, your Jenkins pipeline should demonstrate secure authentication, code validation, security scanning, Terraform plan review, production approval, controlled apply, and post-deployment verification.

This example uses Jenkins + Terraform + AWS, with an IAM role on the Jenkins agent instead of hardcoded AWS access keys. It follows a production-style workflow:

`Git PR → Validate → Security Scan → Terraform Plan → Approval → Apply → Verify`

## 1. Production Jenkinsfile

Assumptions:

- Jenkins runs on a secured agent with Terraform, AWS CLI, TFLint, and Checkov installed.
- The agent gets AWS credentials through an IAM instance profile or another approved temporary-credential mechanism.
- Terraform state is stored in an S3 backend with locking and restricted access.
- A Jenkins credential named `prod-change-approver` is configured as the authorized approval identity. The example below uses Jenkins' built-in approval step; enforce actual approver authorization through Jenkins permissions.
- The production environment is selected only for the protected `main` branch.

## 2. Jenkinsfile code

Save this file as `Jenkinsfile` in your Terraform repository. Replace the example agent label, approver usernames, and health-check URL with your environment's actual values.

```

pipeline {
    agent {
        label 'terraform-aws-prod'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 60, unit: 'MINUTES')
        skipDefaultCheckout(true)
        buildDiscarder(logRotator(
            numToKeepStr: '20',
            artifactNumToKeepStr: '5'
        ))
    }

    environment {
        AWS_DEFAULT_REGION = 'ap-south-1'
        TF_IN_AUTOMATION   = 'true'
        TF_INPUT           = 'false'
        TF_WORKING_DIR     = 'terraform/prod'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    set -eu
                    git status --short
                    terraform version
                    aws sts get-caller-identity
                '''
            }
        }

        stage('Terraform Init') {
            steps {
                dir("${TF_WORKING_DIR}") {
                    sh '''
                        set -eu
                        terraform init -input=false -lockfile=readonly
                    '''
                }
            }
        }

        stage('Format and Validate') {
            steps {
                dir("${TF_WORKING_DIR}") {
                    sh '''
                        set -eu
                        terraform fmt -check -recursive
                        terraform validate
                    '''
                }
            }
        }

        stage('Lint and Security Scan') {
            steps {
                sh '''
                    set -eu
                    tflint --chdir="${TF_WORKING_DIR}" --init
                    tflint --chdir="${TF_WORKING_DIR}"
                    checkov -d "${TF_WORKING_DIR}" \
                        --framework terraform
                '''
            }
        }

        stage('Terraform Plan') {
            steps {
                dir("${TF_WORKING_DIR}") {
                    sh '''
                        set -eu
                        terraform plan \
                          -input=false \
                          -lock-timeout=5m \
                          -out=tfplan
                    '''
                }
            }
        }

        stage('Production Approval') {
            steps {
                script {
                    timeout(time: 15, unit: 'MINUTES') {
                        input(
                            message: """
Approve production Terraform deployment?

Build: ${env.BUILD_NUMBER}
Commit: ${env.GIT_COMMIT ?: 'See checkout logs'}

Review the plan and change ticket before approving.
""",
                            ok: 'Approve deployment',
                            submitter: 'release-manager,platform-lead',
                            submitterParameter: 'APPROVED_BY'
                        )
                    }
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir("${TF_WORKING_DIR}") {
                    sh '''
                        set -eu
                        test -f tfplan
                        terraform apply \
                          -input=false \
                          -lock-timeout=5m \
                          tfplan
                    '''
                }
            }
        }

        stage('Post-deployment Verification') {
            steps {
                dir("${TF_WORKING_DIR}") {
                    sh '''
                        set -eu

                        terraform output
                        terraform plan \
                          -input=false \
                          -lock-timeout=5m \
                          -detailed-exitcode
                    '''
                }

                // Add your application-specific health check here.
                // Example: curl -fsS "$HEALTH_CHECK_URL"
            }
        }
    }

    post {
        success {
            echo 'Terraform pipeline completed successfully.'
        }

        failure {
            echo '''
Pipeline failed. Check the failing stage and Terraform logs.
Inspect actual cloud resources and Terraform state before retrying.
Do not automatically destroy resources or rerun apply blindly.
'''
        }

        aborted {
            echo 'Pipeline aborted. Verify whether any changes were applied.'
        }

        always {
            dir("${TF_WORKING_DIR}") {
                sh 'rm -f tfplan'
            }
            echo "Build result: ${currentBuild.currentResult}"
        }
    }
}

```

## 3. Important production improvements

Before using this Jenkinsfile, make these adjustments:

1. Restrict production deployment to the protected `main` branch. For a Jenkins Multibranch Pipeline, add `when { branch 'main' }` to the production plan, approval, apply, and verification stages. PR builds should run validation and security checks without deploying to production.
2. Do not print every Terraform output. Some outputs may contain sensitive data. Remove `terraform output` from the verification stage.
3. Add an application health check. Configure an approved, non-secret `HEALTH_CHECK_URL` and verify the deployed application with a smoke test, for example:
   ```
   curl --fail --silent --show-error \
     --max-time 10 "$HEALTH_CHECK_URL"
   ```
   Make sure the URL is set and validated before using it.
4. Handle Terraform plan exit codes correctly. With `-detailed-exitcode`, `0` means no changes, `1` means an error, and `2` means changes are present. After a successful apply, unexpected remaining changes should trigger investigation.
5. Protect the plan and state. Keep `tfplan` within the same secured build workspace for approval and apply; don't publish it as a general build artifact. Protect the remote state with restricted IAM access, encryption, locking, and versioning.
6. Handle failed applies safely. If apply fails halfway, inspect logs, state, and real cloud resources, fix the root cause, then generate a new plan and repeat the approval process as required. Never automatically run `terraform destroy` as a rollback.

## 4. Interview answer

> “I use Jenkins declarative pipelines for Terraform CI/CD. After checkout, I run formatting, validation, linting, and security scans. Then I generate and review a Terraform plan. For production, I require authorized approval before applying the exact reviewed plan.
>
> I use IAM roles instead of static AWS keys, remote state with locking, and restricted access to plan files. After deployment, I verify infrastructure and application health. If apply fails halfway, I inspect Terraform state and actual resources, fix the root cause, generate a fresh plan, and continue through the approved deployment process.”

Would you like a daily reminder to practise one production-level Jenkins or Terraform interview scenario?