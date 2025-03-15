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
export AWS_REGION=us-east-1

cat << EOF > eks-demo-cluster.yaml
---
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: eks-demo # 생성할 EKS 클러스터명
  region: ${AWS_REGION} # 클러스터를 생성할 리전
  version: "1.27"

vpc:
  cidr: "10.0.0.0/16" # 클러스터에서 사용할 VPC의 CIDR
  nat:
    gateway: HighlyAvailable

managedNodeGroups:
  - name: node-group        # 클러스터의 노드 그룹명
    instanceType: m5.large  # 클러스터 워커 노드의 인스턴스 타입
    desiredCapacity: 3      # 클러스터 워커 노드의 갯수
    volumeSize: 20          # 클러스터 워커 노드의 EBS 용량 (단위: GiB)
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

#### 2. 컨테이너 이미지 생성성

```text
기본 웹페이지를 출력하는 컨테이너 이미지를 생성하는 dockerfile을 생성해줘.
aws ecr에 컨테이너 이미지를 업로드하는 명령어를 알려줘.
```

```bash
docker build -t my-web-server .
```

#### 3. ECR 리포지터리 생성 및 업로드

```bash
# aws ecr create-repository --repository-name <repository-name> --region <region>
aws ecr create-repository --repository-name my-web-app --region us-west-2
# aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-west-2.amazonaws.com
# 이미지 태그
docker tag my-web-server:latest <aws_account_id>.dkr.ecr.us-west-2.amazonaws.com/my-web-app:latest

# 이미지 푸시
docker push <aws_account_id>.dkr.ecr.us-west-2.amazonaws.com/my-web-app:latest
```

#### 4. EKS에 컨테이너 배포

```bash
kubectl delete service my-web-app-service
kubectl delete deployment my-web-app
```

---

````text
# ChatGPT
Query1. 기본 웹페이지를 출력하는 컨테이너 이미지를 생성하는 dockerfile을 생성해줘.
Query2. aws ecr에 컨테이너 이미지를 업로드하는 명령어를 알려줘.
ecr에 업로드한 컨테이미지를 eks에 배포하는 방법을 알려줘.







#### 3. ECR 생성



- 2.0 디렉토리 생성

  ```bash
  mkdir test-image
  cd test-image
````

- 2.1 start.sh

  ```bash
  cat > start.sh <<EOF
  #!/bin/sh
  echo "Hello, world! The time is $(date)."
  EOF
  ```

- 2.2 Dockerfile

  ```bash
  cat > Dockerfile <<EOF
  FROM alpine
  COPY start.sh /
  CMD ["/start.sh"]
  EOF
  ```

- 2.3 실행권한
  ```bash
  chmod +x start.sh
  ```
- 2.4 이미지 생성
  ```bash
  # docker build -t moonjukhim/test-image .
  # docker images
  # sudo ls /var/lib/docker/image/overlay2/layerdb/sha256
  # docker history moonjukhim/test-image
  gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/test-image .
  ```
- 2.5 Container Registry에서 이미지 확인
- 2.6 Deployment 객체 생성
  ```bash
  PROJECT_ID=$(gcloud config get-value project)
  gcloud container clusters get-credentials $my_cluster --zone $my_zone --project $PROJECT_ID
  # Deployment 생성
  kubectl create deployment --image gcr.io/$PROJECT_ID/test-image test-image
  ```

---

#### 3. Cloud Build를 사용한 컨테이너 생성(## 방법B)

- 3.1 cloudbuild.yaml
  ```yaml
  cat > cloudbuild.yaml <<EOF
  steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: [ 'build', '-t', 'gcr.io/${GOOGLE_CLOUD_PROJECT}/test-image', '.' ]
  images:
  - 'gcr.io/${GOOGLE_CLOUD_PROJECT}/test-image'
  EOF
  ```
- 3.2 명령을 통한 Cloud Build 실행
  ```bash
  gcloud builds submit --config cloudbuild.yaml .
  ```

#### 4. References

- https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration
