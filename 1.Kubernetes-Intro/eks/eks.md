- [Amazon EKS로 웹 애플리케이션 구축하기](https://catalog.us-east-1.prod.workshops.aws/workshops/9c0aa9ab-90a9-44a6-abe1-8dff360ae428/ko-KR)


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