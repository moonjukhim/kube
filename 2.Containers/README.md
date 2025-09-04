#### 0. 쿠버네티스 클러스터 생성

1. eksctl, kubectl download

```bash
# kubectl, eksctl download
sudo curl --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.23.7/2022-06-29/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl

curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin
```

2. make yaml file

```bash
# export AWS_REGION=[MY_AWS_REGION]
# export AWS_REGION=us-east-1
# export ACCOUNT_ID=[MY_ACCOUNT_ID]

cat << EOF > eks-demo-cluster.yaml
---
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: eks-demo # 생성할 EKS 클러스터명
  region: ${AWS_REGION} # 클러스터를 생성할 리전
  version: "1.31"

vpc:
  cidr: "10.0.0.0/16" # 클러스터에서 사용할 VPC의 CIDR
  nat:
    gateway: HighlyAvailable

managedNodeGroups:
  - name: node-group          # 클러스터의 노드 그룹명
    instanceType: t3.small   # 클러스터 워커 노드의 인스턴스 타입
    desiredCapacity: 3        # 클러스터 워커 노드의 갯수
    volumeSize: 20            # 클러스터 워커 노드의 EBS 용량 (단위: GiB)
    privateNetworking: true
    iam:
      withAddonPolicies:
        imageBuilder: true # Amazon ECR에 대한 권한 추가
        albIngress: true  # albIngress에 대한 권한 추가
        cloudWatch: true # cloudWatch에 대한 권한 추가
        autoScaler: true # auto scaling에 대한 권한 추가
        ebs: true # EBS CSI Driver에 대한 권한 추가

cloudWatch:
  clusterLogging:
    enableTypes: ["*"]

iam:
  withOIDC: true
EOF
```

3. create cluster

```bash
eksctl create cluster -f eks-demo-cluster.yaml
```

#### 2. ECR 리포지터리 생성

```text
기본 웹페이지를 출력하는 컨테이너 이미지를 생성하는 dockerfile을 생성해줘.
aws ecr에 컨테이너 이미지를 업로드하는 명령어를 알려줘.
```

```bash
# 리포지터리 생성
export AWS_REGION=us-west-2
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr create-repository --repository-name my-web-app --region $AWS_REGION
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com
```

#### 3. 이미지 생성 및 명령어

```bash
cat << EOF > Dockerfile
FROM nginx:latest
RUN  echo '<h1> test nginx web page </h1>'  >> index.html
RUN cp /index.html /usr/share/nginx/html
EOF
```

```bash
docker build -t test-image .
docker images
docker run -p 8080:80 --name test-nginx test-image &
docker ps
docker logs -f test-nginx
docker exec -it test-nginx /bin/bash
docker stop test-nginx
docker rm test-nginx
```

##### 4. 이미지 푸시

```bash
# 인증 정보
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker tag test-image:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/my-web-app:latest

docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/my-web-app:latest
```

#### 5. EKS에 컨테이너 배포

```bash
cat <<EOF> deployment.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-frontend
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demo-frontend
  template:
    metadata:
      labels:
        app: demo-frontend
    spec:
      containers:
        - name: demo-frontend
          image: $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/my-web-app:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 80
EOF
```

```bash
cat <<EOF> service.yaml
---
apiVersion: v1
kind: Service
metadata:
  name: demo-frontend
spec:
  selector:
    app: demo-frontend
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
EOF
```

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

####

```bash
kubectl get svc demo-frontend
```

####

```bash
kubectl delete  service demo-frontend
kubectl delete deployment demo-frontend
```

#####

```bash
eksctl delete cluster --name ekscluster
```
