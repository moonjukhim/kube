sudo yum install -y amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
sudo systemctl enable amazon-ssm-agent

#### 1. CodeCommit 리포지토리 생성

```bash
aws codecommit create-repository \
  --repository-name AppCodeRepo \
  --repository-description "Repository for storing Dockerfile, Jenkinsfile, and application code"

# 다음과 같은 형태의 SSH URL을 복사해두고 다음에 사용
# ssh://git-codecommit.us-west-2.amazonaws.com/v1/repos/AppCodeRepo

aws codecommit create-repository \
  --repository-name ManifestRepo \
  --repository-description "Repository for storing Kubernetes manifest files"
```
#### 2. CodeCommit 및 ECR 연결 설정

```bash
aws iam create-user --user-name gitUser
```

```bash
aws iam attach-user-policy \
  --user-name gitUser \
  --policy-arn arn:aws:iam::aws:policy/AWSCodeCommitPowerUser
```

```bash
ssh-keygen
aws iam upload-ssh-public-key \
  --user-name gitUser \
  --ssh-public-key-body file://~/.ssh/id_rsa.pub
```

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
  | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-west-2.amazonaws.com
```

#### 3. 코드 준비

```bash
cd app && ls
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

#### 5. K8S 매니페스트 파일 생성

#### 6. ArgoCD 구성



---
[GitOps](https://www.eksworkshop.com/docs/automation/gitops/)
