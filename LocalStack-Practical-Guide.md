# LocalStack Practical Guide for Local AWS Practice Setup

This document is a local copy of the LocalStack practical guide for practicing AWS locally.

## 1. Prerequisites

### Docker Desktop
- LocalStack runs using Docker, so Docker must be installed and running.
- Download Docker Desktop: https://www.docker.com/products/docker-desktop/
- Create a Docker account and sign in from Docker Desktop.
- Check Docker installation:
  - `docker --version`
  - `docker ps`

### AWS CLI
- AWS CLI is used to run AWS commands from your terminal.
- LocalStack supports using AWS CLI against local AWS endpoints.
- Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Check installation:
  - `aws --version`
- Configure dummy AWS credentials for LocalStack:
  - `aws configure`
- Use these values:
  - `AWS Access Key ID: test`
  - `AWS Secret Access Key: test`
  - `Default region name: us-east-1`
  - `Default output format: json`
- These are dummy credentials for local practice only.

### Python and pip
- LocalStack CLI and awslocal can be installed using Python pip.
- Check Python:
  - `python --version` or `python3 --version`
- Check pip:
  - `pip --version` or `pip3 --version`

## 2. Install LocalStack

- The easiest way to start LocalStack is using the LocalStack CLI.
- Install LocalStack:
  - `pip install localstack`
- For Mac/Linux, if needed:
  - `pip3 install localstack`
- Check installation:
  - `localstack --version`
- Start LocalStack:
  - `localstack start`
- Run LocalStack in the background:
  - `localstack start -d`
- Check status:
  - `localstack status`
- Stop LocalStack:
  - `localstack stop`

## 3. Install awslocal

- `awslocal` is a wrapper around AWS CLI that automatically sends AWS CLI commands to LocalStack instead of real AWS.
- Install:
  - `pip install awscli-local`
- Check:
  - `awslocal --version`
- Use awslocal for LocalStack commands so you do not need to pass endpoint URLs manually.

## 4. Alternative: Run LocalStack Using Docker Directly

- You can also run LocalStack directly with Docker.

```bash
docker run --rm -it \
  -p 4566:4566 \
  -p 4510-4559:4510-4559 \
  localstack/localstack
```

- Port `4566` is the main LocalStack endpoint used by AWS services.
- To run it in detached mode:

```bash
docker run -d \
  --name localstack-main \
  -p 4566:4566 \
  -p 4510-4559:4510-4559 \
  localstack/localstack
```

- Check container:
  - `docker ps`
- Stop container:
  - `docker stop localstack-main`
- Remove container:
  - `docker rm localstack-main`

## 5. Basic S3 Practice Commands

### Create an S3 bucket
- `awslocal s3 mb s3://my-data-bucket`

### List buckets
- `awslocal s3 ls`

### Create a sample file
- `echo "order_id,amount" > orders.csv`
- `echo "1,500" >> orders.csv`
- `echo "2,900" >> orders.csv`

### Upload file to S3
- `awslocal s3 cp orders.csv s3://my-data-bucket/raw/orders.csv`

### List files inside bucket
- `awslocal s3 ls s3://my-data-bucket/raw/`

### Download file from S3
- `awslocal s3 cp s3://my-data-bucket/raw/orders.csv downloaded_orders.csv`

### Delete file
- `awslocal s3 rm s3://my-data-bucket/raw/orders.csv`

### Delete bucket
- `awslocal s3 rb s3://my-data-bucket --force`

## 6. Basic SQS Practice Commands

- Create queue:
  - `awslocal sqs create-queue --queue-name orders-queue`
- List queues:
  - `awslocal sqs list-queues`
- Store queue URL in variable:
  - `QUEUE_URL=$(awslocal sqs get-queue-url --queue-name orders-queue --query 'QueueUrl' --output text)`
- Send message:
  - `awslocal sqs send-message --queue-url $QUEUE_URL --message-body '{"order_id":101,"amount":1200}'`
- Receive message:
  - `awslocal sqs receive-message --queue-url $QUEUE_URL`
- Delete queue:
  - `awslocal sqs delete-queue --queue-url $QUEUE_URL`

## 7. Basic DynamoDB Practice Commands

### Create table
```bash
awslocal dynamodb create-table \
  --table-name Customers \
  --attribute-definitions AttributeName=customer_id,AttributeType=S \
  --key-schema AttributeName=customer_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### List tables
- `awslocal dynamodb list-tables`

### Insert item
```bash
awslocal dynamodb put-item \
  --table-name Customers \
  --item '{"customer_id":{"S":"C001"},"name":{"S":"Anurag"},"city":{"S":"Bengaluru"}}'
```

### Read item
- `awslocal dynamodb get-item --table-name Customers --key '{"customer_id":{"S":"C001"}}'`

### Scan table
- `awslocal dynamodb scan --table-name Customers`

### Delete table
- `awslocal dynamodb delete-table --table-name Customers`

## 8. Basic Lambda Practice

### Create a file named `lambda_function.py`
```python
def handler(event, context):
    return {
        "statusCode": 200,
        "body": "Hello from LocalStack Lambda"
    }
```

### Zip the file
- `zip function.zip lambda_function.py`

### Create Lambda function
```bash
awslocal lambda create-function \
  --function-name hello-localstack \
  --runtime python3.11 \
  --handler lambda_function.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::000000000000:role/lambda-role
```

### Invoke Lambda
- `awslocal lambda invoke --function-name hello-localstack output.json`

### Check output
- `cat output.json`

### Delete Lambda
- `awslocal lambda delete-function --function-name hello-localstack`

## 9. Practice Mini Project for Students

### Project: Local AWS Data Pipeline

Build this small project locally:
- Raw CSV file → Upload to LocalStack S3 → Send message to SQS → Lambda reads event → Process or log the file information

This helps students understand how cloud pipelines work without spending money on AWS.

## 10. Important LocalStack Website for Services

- Official service support list: https://docs.localstack.cloud/aws/services/
- LocalStack supports many AWS services such as:
  - S3
  - Lambda
  - DynamoDB
  - SQS
  - SNS
  - Glue
  - Kinesis
  - Redshift
  - IAM
  - CloudWatch
  - Step Functions

## 11. Common Errors and Fixes

### Docker is not running
- Error may occur when Docker Desktop is closed.
- Fix:
  - `docker ps`
- If it fails, open Docker Desktop and try again.

### LocalStack not responding
- Check status:
  - `localstack status`
- Restart:
  - `localstack stop`
  - `localstack start -d`

### awslocal command not found
- Install again:
  - `pip install awscli-local`
  - or `pip3 install awscli-local`

### AWS CLI asks for credentials
- Configure dummy credentials:
  - `aws configure`
- Use:
  - `test` / `test`
  - `us-east-1`
  - `json`

## 12. Why Students Should Use LocalStack

- LocalStack allows practice of AWS services locally without real cloud billing.
- Students can create, delete, and experiment with AWS resources safely.
- It is especially useful for practicing:
  - S3 for storage
  - SQS for messaging
  - Lambda for serverless processing
  - DynamoDB for NoSQL
  - Glue/Kinesis basics depending on support
  - CloudWatch-style monitoring concepts

---

This local document mirrors the LocalStack practical guide content from the Notion page and is stored here in the workspace.
