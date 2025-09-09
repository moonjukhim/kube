##### 1. Help Repository Creation

```bash
# Helm Install
curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
helm version --short

# Helm-s3 plugin install
helm plugin install https://github.com/hypnoglow/helm-s3.git


# export ACCOUNT_ID=[MY_ACCOUNT_ID]
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export S3_BUCKET_NAME=helm-${ACCOUNT_ID}
aws s3 mb s3://${S3_BUCKET_NAME}
helm s3 init s3://${S3_BUCKET_NAME}

# Add Chart Repository
helm repo add packagecatalog s3://$S3_BUCKET_NAME
helm repo list
```

##### 2. Make Helm Chart

```bash
helm create helm-chart
```

##### 3. Review Chart Structure

```bash
ls helm-chart

sed -i "s/ClusterIP/LoadBalancer/g" helm-chart/values.yaml
```

##### 4. Helm Chart Packaging

```bash
helm package helm-chart/
helm s3 push ./helm-chart-0.1.0.tgz packagecatalog
helm search repo
```


##### 5. Install Helm Chart to EKS Cluster

```bash
helm install packagecatalog s3://$S3_BUCKET_NAME/helm-chart-0.1.0.tgz --version 0.1.0 --dry-run --debug
helm install packagecatalog s3://$S3_BUCKET_NAME/helm-chart-0.1.0.tgz --version 0.1.0
```


##### 6. Helm Chart Re-packaging and Re-deployment


```bash
sed -i "s/replicaCount:.*/replicaCount: 3/g" helm-chart/values.yaml

helm upgrade packagecatalog helm-chart/
```

##### 7. 객체 확인

```bash
kubectl get deployment
kubectl get service
```

##### 8. Resource clean-up

```bash
helm delete packagecatalog
helm repo remove packagecatalog
aws s3 rm s3://${S3_BUCKET_NAME} --recursive
```
