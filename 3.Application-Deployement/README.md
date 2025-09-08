#### 0. 환경 확인

```bash
sudo curl --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.23.7/2022-06-29/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl

curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin

aws eks update-kubeconfig --region $AWS_REGION --name ekscluster
kubectl config current-context
```

#### 1. Demo Application 배포

- 1.1 ECR Repository 생성

```bash
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
#export AWS_REGION=$(aws configure get region)
export AWS_REGION=us-west-2

aws ecr create-repository --repository-name productpage --region $AWS_REGION --output text > /dev/null
aws ecr create-repository --repository-name ratings --region $AWS_REGION --output text > /dev/null
aws ecr create-repository --repository-name reviews --region $AWS_REGION --output text > /dev/null

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com
```

- 1.2 컨테이너 이미지 빌드 및 푸시

```bash
git clone https://github.com/moonjukhim/kube.git
cd kube/3.Application-Deployement/bookinfo/src

docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/productpage:1.0.0 productpage
docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ratings:1.0.0 ratings
docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/reviews:latest reviews

docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/productpage:1.0.0
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ratings:1.0.0
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/productpage:latest


```

- 1.3 컨테이너 배포


