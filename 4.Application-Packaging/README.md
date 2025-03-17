```bash
helm plugin install https://github.com/hypnoglow/helm-s3.git


aws mb s3://helm-${ACCOUNT_ID}
helm s3 init s3://$S3_BUCKET_NAME

helm repo add packagecatalog s3://$S3_BUCKET_NAME

helm repo list

helm package helm-chart/

helm s3 push ./package_workshop-1.0.0.tgz productcatalog

helm search repo

helm install packagecatalog s3://$S3_BUCKET_NAME/packagecatalog_workshop-1.0.0.tgz --version 1.0.0 --dry-run --debug
helm install packagecatalog s3://$S3_BUCKET_NAME/packagecatalog_workshop-1.0.0.tgz --version 1.0.0
```
