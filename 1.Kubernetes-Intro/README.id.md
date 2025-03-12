```text
eks에 fargate의 컨테이너를 배포하려면 어떻게 해야 해?
```

```bash
eksctl create cluster --name ekscluster --region us-west-2 --fargate
```


```bash
aws eks create-fargate-profile \
  --fargate-profile-name ek8s-fargate-profile \
  --cluster-name ekscluster \
  --pod-execution-role-arn arn:aws:iam::[ACCOUNT_ID]:role/RoleForEKSFagate \
  --selectors namespace=default
```

역할에 포함되어 있어야 하는 Trusted entities의 내용

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "eks-fargate-pods.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

역할에 포함되어 있어야 하는 권한

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability"
      ],
      "Resource": "arn:aws:ecr:<region>:<account-id>:repository/<repository-name>"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:<region>:<account-id>:log-group:/aws/eks/*"
    }
  ]
}
```
