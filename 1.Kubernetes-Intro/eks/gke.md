```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip 
sudo aws/install -i /usr/local/aws-cli -b /usr/local/bin
aws --version
```

```bash
git clone https://github.com/aws-containers/ecsdemo-frontend.git
git clone https://github.com/aws-containers/ecsdemo-nodejs.git
git clone https://github.com/aws-containers/ecsdemo-crystal.git
```

```bash
gcloud container clusters get-credentials standard-cluster-1 --zone us-central1-a --project [PROJECT_ID]
```

```bash
cd ~/ecsdemo-nodejs
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl get deployment ecsdemo-nodejs

cd ~/ecsdemo-crystal
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml

cd ~/ecsdemo-frontend
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml

kubectl get deployments
kubectl get service ecsdemo-frontend -o wide
```

```bash
kubectl scale deployment ecsdemo-nodejs --replicas=3
kubectl scale deployment ecsdemo-crystal --replicas=3
kubectl scale deployment ecsdemo-frontend --replicas=3
kubectl get deployments
```
