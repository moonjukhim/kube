```bash
eksctl create cluster \
--name ekscluster \
--nodegroup-name eks-nodes \
--node-type t3.medium \
--nodes 3 \
--nodes-min 1 \
--nodes-max 3 \
--managed \
--version ${EKS_VERSION} \
--region ${AWS_REGION}

sudo curl --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.23.7/2022-06-29/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl

curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin

export AWS_REGION='us-west-2'
eksctl create cluster \
--name ekscluster \
--region ${AWS_REGION}
```

# 2 

```bash
export CLUSTER_NAME=ekscluster
# Fargate 프로필 생성 명령어
aws eks create-fargate-profile \
  --cluster-name $CLUSTER_NAME \
  --fargate-profile-name $CLUSTER_NAME-fargate-profile \
#  --pod-execution-role-arn arn:aws:iam::123456789012:role/EKS_FargatePodExecutionRole \
  --selectors namespace=default \
  --region $REGION
```


# 3 EKS_FargatePodExecutionRole

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeNetworkInterfaces",
        "ec2:CreateNetworkInterface",
        "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    }
  ]
}
```

# 4.