# Create AWS Secrets Manager Secret

Replace the values first:

- `REPLACE_DOCKERHUB_USERNAME`
- `REPLACE_DOCKERHUB_ACCESS_TOKEN`
- Region if you are not using `ap-south-1`

Command:

```bash
aws secretsmanager create-secret \
  --name dev/dockerhub/jenkins-practical \
  --description "Docker Hub credentials for Jenkins practical lab" \
  --secret-string '{"username":"REPLACE_DOCKERHUB_USERNAME","password":"REPLACE_DOCKERHUB_ACCESS_TOKEN"}' \
  --region ap-south-1
```

Test secret retrieval:

```bash
aws secretsmanager get-secret-value \
  --secret-id dev/dockerhub/jenkins-practical \
  --query SecretString \
  --output text \
  --region ap-south-1
```

Test jq parsing:

```bash
aws secretsmanager get-secret-value \
  --secret-id dev/dockerhub/jenkins-practical \
  --query SecretString \
  --output text \
  --region ap-south-1 | jq .
```
