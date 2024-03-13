- [Amazon EKS로 웹 애플리케이션 구축하기](https://catalog.us-east-1.prod.workshops.aws/workshops/9c0aa9ab-90a9-44a6-abe1-8dff360ae428/ko-KR)

0. 클러스터를 생성하기 위해 권한 설정

   - 0.1 IAM 서비스에서 Roles로 이동
   - 0.2 Create role 클릭
   - 0.3 Trusted entity type:AWS service, Use case에서 "EKS" 선택, 아래 "EKS-Cluster" 선택 후, Next 클릭
   - 0.4 AmazonEKSClusterPolicy가 선택되어 있는 것을 확인 후, Next 클릭
   - 0.5 Role name에 "eksClusterRole" 입력 후, "Create role" 클릭

1. Setting up Amazon EKS

```bash
sudo curl --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.23.7/2022-06-29/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl
curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin
export AWS_REGION=ap-northeast-2
# ex) export AWS_REGION=ap-northeast-2

eksctl create cluster \
--name ekscluster \
--nodegroup-name eks-nodes \
--node-type t3.medium \
--nodes 3 \
--nodes-min 1 \
--nodes-max 3 \
--managed \
--version 1.23 \
--region ${AWS_REGION}

```

2. kube config 파일 업데이트

```bash
aws eks update-kubeconfig --name ekscluster
```

3. 노드 확인

```bash
kubectl get nodes
```

4. Example

```bash
aws s3 cp s3://aws-tc-largeobjects/ILT-TF-200-COREKS-10-EN/lab-1/ecsdemo-crystal/ ~/ecsdemo-crystal/ --recursive
aws s3 cp s3://aws-tc-largeobjects/ILT-TF-200-COREKS-10-EN/lab-1/ecsdemo-frontend/ ~/ecsdemo-frontend/ --recursive
aws s3 cp s3://aws-tc-largeobjects/ILT-TF-200-COREKS-10-EN/lab-1/ecsdemo-nodejs/ ~/ecsdemo-nodejs/ --recursive

# git clone https://github.com/aws-containers/ecsdemo-frontend.git
# git clone https://github.com/aws-containers/ecsdemo-nodejs.git
# git clone https://github.com/aws-containers/ecsdemo-crystal.git

#
cd ~/ecsdemo-nodejs
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl get deployment ecsdemo-nodejs

#
cd ~/ecsdemo-crystal
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml

#
cd ~/ecsdemo-frontend
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml

#
kubectl get deployments
kubectl get service ecsdemo-frontend -o wide

#
kubectl scale deployment ecsdemo-nodejs --replicas=3
kubectl scale deployment ecsdemo-crystal --replicas=3
kubectl get deployments
kubectl scale deployment ecsdemo-frontend --replicas=3

#
kubectl scale deployment ecsdemo-nodejs --replicas=2
kubectl scale deployment ecsdemo-crystal --replicas=2
kubectl scale deployment ecsdemo-frontend --replicas=2
```
