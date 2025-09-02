1. EKS cluster 생성하기 시작

```text
eks 클러스터를 생성하려면 어떻게 해야 해?
```

```bash
sudo curl --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.23.7/2022-06-29/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl

curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin
```

```bash
# Managed Mode
eksctl create cluster \
  --name ekscluster \
  --region us-west-2 \
  --nodegroup-name eks-nodegroup \
  --node-type t3.small \
  --nodes 2 \
  --managed  

# Fargate 
eksctl create cluster --name ekscluster --region us-west-2 --fargate
```

2. EKS에 컨테이너 배포하기

```text
eks에 nginx 컨테이너를 배포하려면 어떻게 해야 해?
```

```bash
cat > deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
EOF
```

```bash
cat > service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
EOF
```

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

3. 배포된 객체들 확인

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

4. 클러스터 삭제

```bash
eksctl delete cluster --name ekscluster  
```

--- 

### EKS Fargate

2. 


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
