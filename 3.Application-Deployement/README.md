#### 0. 환경 확인

```bash
sudo curl --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.23.7/2022-06-29/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl

curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin
```

#### 1. Demo Application 배포

- 1.1 ECR Push

```bash
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
#export AWS_REGION=$(aws configure get region)
export AWS_REGION=us-west-2

aws ecr create-repository --repository-name productpage --region $AWS_REGION
aws ecr create-repository --repository-name ratings --region $AWS_REGION
aws ecr create-repository --repository-name reviews --region $AWS_REGION
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com
```

- 1.2 코드 복사

```bash
git clone https://github.com/moonjukhim/kube.git
cd /home/cloudshell-user/kube/3.Application-Deployement/bookinfo/src

docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/productpage:latest productpage
docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ratings:latest ratings
docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/reviews:latest reviews

docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/productpage:latest:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ratings:latest:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/productpage:latest:latest

```

Deployment, Service 배포

```bash
aws s3 cp s3://aws-tc-largeobjects/ILT-TF-200-COREKS-10-EN/lab-1/ecsdemo-crystal/ ~/ecsdemo-crystal/ --recursive
aws s3 cp s3://aws-tc-largeobjects/ILT-TF-200-COREKS-10-EN/lab-1/ecsdemo-frontend/ ~/ecsdemo-frontend/ --recursive
aws s3 cp s3://aws-tc-largeobjects/ILT-TF-200-COREKS-10-EN/lab-1/ecsdemo-nodejs/ ~/ecsdemo-nodejs/ --recursive

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
```

#### 2. 객체 확인

```bash
kubectl get deployments
kubectl get service ecsdemo-frontend -o wide
```

#### 3. 객체 조정

```bash
kubectl scale deployment ecsdemo-nodejs --replicas=3
kubectl scale deployment ecsdemo-crystal --replicas=3
kubectl get deployments
kubectl scale deployment ecsdemo-frontend --replicas=3

#
kubectl scale deployment ecsdemo-nodejs --replicas=2
kubectl scale deployment ecsdemo-crystal --replicas=2
kubectl scale deployment ecsdemo-frontend --replicas=2
```

#### 4. 리소스 정리

```bash
kubectl delete deployment ecsdemo-nodejs
kubectl delete deployment ecsdemo-crystal
kubectl delete deployment ecsdemo-frontend

kubectl delete service ecsdemo-nodejs
kubectl delete service ecsdemo-crystal
kubectl delete service ecsdemo-frontend
```

#### 5. Manifest 파일

Deployment Manifest 파일

````bash
- 1.2 deployment manifest (deployment.yaml)
  ```bash
  cat > deployment.yaml<<EOF
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: nginx-deployment
    labels:
      app: nginx
  spec:
    replicas: 3
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
            image: moonjukhim/nginx:1.7.8
            ports:
              - containerPort: 80
  EOF
````

Service Manifest 파일

```bash
cat > service.yaml<<EOF
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 60000
      targetPort: 80
EOF
```
