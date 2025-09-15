# GitOps

#### 1. CodeCommit 리포지토리 생성

```bash
export AWS_REGION=us-west-2
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

git clone https://github.com/moonjukhim/kube.git
```

```bash
aws codecommit create-repository \
  --repository-name AppCodeRepo \
  --repository-description "Repository for storing application code"

# 다음과 같은 형태의 SSH URL을 복사해두고 다음에 사용
# ssh://git-codecommit.us-west-2.amazonaws.com/v1/repos/AppCodeRepo

aws codecommit create-repository \
  --repository-name ManifestRepo \
  --repository-description "Repository for storing Kubernetes manifest files"
```

```bash
aws ecr create-repository --repository-name eks-gitops-demo
```

#### 2. CodeCommit 및 ECR 연결 설정

- 2.1 CodeCommit

```bash
aws iam create-user --user-name gitUser
```

```bash
aws iam attach-user-policy \
  --user-name gitUser \
  --policy-arn arn:aws:iam::aws:policy/AWSCodeCommitPowerUser
```

```bash
ssh-keygen -t rsa -b 4096 -C "codecommit" -f ~/.ssh/codecommit_rsa
chmod 700 ~/.ssh && chmod 600 ~/.ssh/codecommit_rsa

aws iam upload-ssh-public-key \
  --user-name gitUser \
  --ssh-public-key-body file://~/.ssh/codecommit_rsa.pub
```

```bash
aws iam list-ssh-public-keys --user-name gitUser
```

```bash
KEYID=$(aws iam list-ssh-public-keys --user-name gitUser | jq -r '.[] | .[] | .SSHPublicKeyId')
echo $KEYID
```

```bash
cat <<'CONF' >> ~/.ssh/config
Host git-codecommit.*.amazonaws.com
  User KEYID     
  IdentityFile ~/.ssh/codecommit_rsa
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
CONF
```

```bash
sed -i "s|KEYID|${KEYID}|g" ~/.ssh/config
```

```bash
cat ~/.ssh/id_rsa
```

```bash
ssh $KEYID@git-codecommit.$AWS_REGION.amazonaws.com
# 다음처럼 메시지가 나와야 함.
# You have successfully authenticated over SSH. 
```

- 2.1 ECR

```bash
aws iam create-user --user-name ecrUser
```

```bash
aws iam attach-user-policy \
  --user-name ecrUser \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
```

```bash
aws iam create-access-key --user-name ecrUser
```

```bash

aws ecr get-login-password --region us-west-2 \
  | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com
```

```bash
aws iam list-access-keys --user-name ecrUser
```

#### 3. 코드 준비

```bash
cd kube/7.cicd/app/ && ls
```

```bash
sed -i "s|ACCOUNTID|${ACCOUNT_ID}|g" Jenkinsfile
sed -i "s|REGION|${AWS_REGION}|g" Jenkinsfile
```

```bash
cat Jenkinsfile
cat Dockerfile
```

```bash
git config --global user.email "eks@example.com"
git config --global user.name "eks"
git config --global init.defaultBranch main
```

```bash
git init
```

```bash
git add .
git commit -m "initial commit"
git push --set-upstream ssh://$KEYID@git-codecommit.$AWS_REGION.amazonaws.com/v1/repos/AppCodeRepo main
```

#### 4. Jenkins 구성

```bash
# Amazon-linux 2023
sudo dnf install -y java-17-amazon-corretto
sudo alternatives --config java
java -version
```
```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo \
  https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
```

```bash
sudo yum upgrade -y
sudo yum install jenkins -y
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

- plugin 설치
    - AWS Credential
    - Docker pipeline
    - ECR
    - SSH Agent

- Jenkins에서 gitUser Credential 생성
    - SSH Username with private key 선택
    - ID : gitUser
    - Description : SSH keys for AWS CodeCommit authentication
    - Username : $KEYID
    - KEY 복사

- Jenkins에서 ecrUser Credential 생성
    - Kind : AWS Credentials
    - ID : ecrUser
    - Description :  Access keys for Amazon ECR authentication
    - EcrUserAccessKey : 
    - EcrUserSecretAccessKey : 

- New Item
    - Enter an item name : JenkinsPipeline
    - Pipeline 선택
    - Triggers
        - Poll SCM 선택
            - Schedule : H/2 * * * *
    - Pipeline
        - Definition : Pipeline script from SCM 선택
            - SCM : Git 선택
                - Repository URL : ssh://git-codecommit.us-west-2.amazonaws.com/v1/repos/AppCodeRepo
                - Credentials : gitUser에 해당하는 credential 선택
                - Brach : */main 으로 변경

- Build Now 클릭

- 만약 빌드가 fail날 경우

```bash
# 임시폴더 만들기
sudo mkdir -p /var/lib/jenkins/tmp
sudo chown jenkins:jenkins /var/lib/jenkins/tmp

# systemd로 Jenkins 자바 옵션 오버라이드
sudo systemctl edit jenkins
```

```bash
getent group docker || sudo groupadd docker
sudo usermod -aG docker jenkins
sudo systemctl restart docker
sudo systemctl restart jenkins
    
ls -l /var/run/docker.sock
sudo -u jenkins -H docker version
sudo -u jenkins -H docker ps

sudo chgrp docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock
```

#### 5. K8S 매니페스트 파일 생성

```bash
mkdir ../manifest && cd ../manifests
```

```bash
cat << EOF > deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eks-sample-linux-deployment
  namespace: eks-sample-app
  labels:
    app: eks-sample-linux-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: eks-sample-linux-app
  template:
    metadata:
      labels:
        app: eks-sample-linux-app
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values:
                - amd64
                - arm64
      containers:
      - name: sample
        image: ACCOUNTID.dkr.ecr.REGION.amazonaws.com/eks-gitops-demo:1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
          name: http
      nodeSelector:
        kubernetes.io/os: linux
EOF
```

```bash
sed -i "s|ACCOUNTID|${ACCOUNT_ID}|g" deployment.yaml
sed -i "s|REGION|${AWS_REGION}|g" deployment.yaml
```

```bash
cat << EOF > service.yaml
apiVersion: v1
kind: Service
metadata:
  name: eks-sample-linux-service
  namespace: eks-sample-app
  labels:
    app: eks-sample-linux-app
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  selector:
    app: eks-sample-linux-app
EOF
```

```bash
git init
```

```bash
git add .
git commit -m "initial commit"
git push --set-upstream ssh://git-codecommit.$AWS_REGION.amazonaws.com/v1/repos/ManifestRepo main
```

#### 6. ArgoCD 구성

```bash
kubectl create namespace argocd
```

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/951656f08338a0eaf10c0b1d4022056baf4c635c/manifests/install.yaml
```

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

```bash
kubectl get service argocd-server -n argocd -o yaml
```

```bash
kubectl get service argocd-server -n argocd
```

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o yaml | grep -i password && printf "\n"
```

```bash
echo <ENCODED_PASSWORD> | base64 --decode && echo
```

- admin / 디코드된 패스워드로 로그인

- 왼쪽 탐색 창의 Settings 클릭
    - Projects를 선택
        - NEW PROJECT를 선택하고,
        - Project Name : gitops-project,
        - Description : Argo CD project to host the application 입력

- CodeCommit에 액세스할 수 있도록 설정
    - Settings 선택
        - Repository certificates and know hosts 선택
        - ADD SSH KNOW HOSTS 선택 (cat ~/.ssh/known_hosts)
        - 복사하여 붙여넣고 생성

    - Settings 선택
        - Repository 선택
        - +CONNECT REPO 선택
            - VIA SSH 선택
            - Name : ManifestRepo
            - Project : gitops-project 선택
            - Repository URL : ssh://<KEY_ID>@git-codecommit.<AWS_REGION>.amazonaws.com/v1/repos/ManifestRepo 입력
            - SSH private key data : cat ~/.ssh/codecommit_rsa의 값을 입력

- Project 구성
    - Settings 선택
        - Projects 선택
        - gitops-project 선택
        - SOURCE REPOSITORIES 카드에서 EDIT 선택
            - ADD SOURCE 에서 ManifestRepo가 포함된 URL 선택 -> Save
        - DESTINATIONS 카드에서 EDIT 선택
            - ADD DESTINATION 클릭
            - Server : https://kubernetes.default.svc를 선택,
            - Name  : * 
            - Namespace : eks-sample-app 입력 -> Save
        - CLUSTER RESOURCE ALLOW LIST 카드에서 EDIT 선택
            - CLUSTER RESOURCE ALLOW LIST 에서 Kind 및 Group에서 기본값 * 그대로 유지
            - NAMESPACE RESOURCE ALLOW LIST 에서 Kind 및 Group에서 기본값 * 그대로 유지

- Argo CD 애플리케이션 생성
    - Applications 선택
        - CREATE APPLICATION 선택
        - Application Name : eks-sample-linux-app
        - Project Name : gitops-project 선택
        - Sync Policy : Automatic 선택
            - PRUNE RESOURCES, SELF HEAL 체크
        - Sync OPTION 에서 AUTO-CREATE NAMESPACE 선택
        - SOURCE
            - Repository URL : ManifestRepo가 포함된 URL 선택
            - Revision : HEAD
            - Path : ./ 입력
        - DESTINATION 
            - Cluster URL : https://kubernetes.default.svc
            - Namespace : eks-sample-app

- 서비스 확인하기

```bash
kubectl get service -n eks-sample-app
```

#### 7. 파이프라인 구동

```bash
pwd
```

```bash
kubectl delete -f  . --ignore-not-found=true
```

```bash
kubectl get service,deployment,pod -n eks-sample-app
```

```bash
cd ../app
cp Jenkinsfile-Final Jenkinsfile
```

```bash
KEYID=$(aws iam list-ssh-public-keys --user-name gitUser | jq -r '.[] | .[] | .SSHPublicKeyId')
sed -i "s|ACCOUNTID|${ACCOUNT_ID}|g" Jenkinsfile
sed -i "s|REGION|${AWS_REGION}|g" Jenkinsfile
sed -i "s|KEYID|${KEYID}|g" Jenkinsfile
```

```bash
cat Jenkinsfile
```

```bash
cp Dockerfile-Final Dockerfile
```

```bash
cp src/v2_index.html src/index.html
```

```bash
git commit -a -m "Updated application to version 2.0"
git push
```

- Jenkins에서 파이프라인 확인


#### 8. 리소스 정리

- EKS
- Cloud9
- IAM User

---
[GitOps](https://www.eksworkshop.com/docs/automation/gitops/)
