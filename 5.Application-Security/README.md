#### 0. 기존 노드 그룹이 있는 EKS 클러스터


```bash
kubectl get nodes
```

#### 2. Aurora DB Setup

1. Security Group Creation

```bash
export VPC_ID="[EKS가 있는 VPC의 ID]"
export SG_ID=$(aws ec2 create-security-group --group-name aurora-db-sg --description "SG for Aurora DB" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3306 --cidr 10.0.0.0/16
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3306 --source-group sg-061574b8485b689ca
aws ec2 describe-security-groups --group-ids $SG_ID

# Cleaning
aws ec2 delete-security-group --group-name aurora-db-sg --vpc $VPC_ID

```

2. Subnet Group 생성

```bash
export DB_SUBNET_GROUP=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" "Name=tag:Name,Values=*Private*" --query "Subnets[].SubnetId" --output text)
aws rds create-db-subnet-group \
    --db-subnet-group-name aurora-subnet-group \
    --db-subnet-group-description "Subnet group for Aurora DB" \
    --subnet-ids ${DB_SUBNET_GROUP}
```

3. Aurora DB Creation

```bash
aws rds create-db-cluster \
    --db-cluster-identifier my-aurora-cluster \
    --engine aurora-mysql \
    --master-username admin \
    --master-user-password mypassword \
    --vpc-security-group-ids $SG_ID \
    --db-subnet-group-name aurora-subnet-group \
    --enable-iam-database-authentication
```

```bash
aws rds create-db-instance \
    --db-instance-identifier my-aurora-instance \
    --db-cluster-identifier my-aurora-cluster \
    --engine aurora-mysql \
    --db-instance-class db.t3.medium \
    --publicly-accessible \
    --db-subnet-group-name aurora-subnet-group \
    --no-multi-az
```

```bash
export DB_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier my-aurora-instance --query "DBInstances[].Endpoint.Address" --output text)
```


```bash
kubectl run netshoot --rm -it --restart=Never   --image=nicolaka/netshoot --   sh -lc '
HOST="my-aurora-cluster.cluster-cf03v0vzjps6.us-west-2.rds.amazonaws.com"; PORT=3306;
echo "== DNS =="; nslookup "$HOST" || dig +short "$HOST";
echo "== TCP =="
nc -vz "$HOST" "$PORT" || { echo "TCP 실패"; exit 2; }
'


# Create Database in POD
# kubectl apply -f ExternalName.yaml
# kubectl apply -f eks-rds.yaml

kubectl run -it --rm --image=mysql:latest --restart=Never mysql-client -- mysql -h $DB_ENDPOINT -uadmin -pmypassword


aws rds describe-db-instances --db-instance-identifier my-aurora-instance --query "DBInstances[].Endpoint.Address" --output text

mysql -h $DB_ENDPOINT -P 3306 -uadmin -ppassword
```

```sql
CREATE DATABASE appdb;
CREATE TABLE appdb.product (prodId VARCHAR(120), prodName VARCHAR(120));
INSERT INTO appdb.product (prodId,prodName) VALUES ('999','Mountain New Bike');
```

```sql
CREATE USER 'app_iam_user'@'%' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON appdb.* TO 'app_iam_user'@'%';


select user,plugin,host from mysql.user where user like '%app_iam_user%';
show grants for app_iam_user; 
```




#### OIDC 연결

```bash
export CLUSTER_NAME=ekscluster
export AWS_REGION=us-west-2
eksctl utils associate-iam-oidc-provider \
  --cluster $CLUSTER_NAME \
  --region $AWS_REGION \
  --approve

aws eks describe-cluster \
  --name $CLUSTER_NAME --region $AWS_REGION \
  --query "cluster.identity.oidc.issuer" --output text
aws iam list-open-id-connect-providers
```


#### IRSA 역할 권한

```bash
aws rds describe-db-clusters \
  --db-cluster-identifier my-aurora-cluster \
  --query "DBClusters[0].DbClusterResourceId" --output text
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["rds:GenerateDBAuthToken","rds:DescribeDBClusters"], "Resource": "*" },
    {
      "Effect": "Allow",
      "Action": "rds-db:connect",
      "Resource": "arn:aws:rds-db:<REGION>:<ACCOUNT_ID>:dbuser:<DBI_RESOURCE_ID>/app_iam_user"
    }
  ]
}
```



#### 3. Application Build

```bash
export AWS_REGION=us-west-2
export ACCOUNT_ID=''
aws ecr create-repository --repository-name webapp --region $AWS_REGION --output text > /dev/null
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com

cd 5.Application-Security/app
docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/webapp:1.0.0 .
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/webapp:1.0.0
```



```bash
aws eks update-kubeconfig --region us-east-1 --name eks-demo2

# helm install
curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

```bash
git clone https://github.com/aws-containers/eks-app-mesh-polyglot-demo.git
cd eks-app-mesh-polyglot-demo
helm install workshop workshop/helm-chart/

kubectl get pods -n workshop
export LB_NAME=$(kubectl get svc frontend -n workshop -o jsonpath="{.status.loadBalancer.ingress[*].hostname}") 
echo $LB_NAME
```

#### 4. Create an IAM policy for DB

```bash
# Export the required Environment variables
export RESOURCE_ID=<REPLACE_WITH_THE_RESOURCE_ID>  # RDS \ Cluster \ Configuration
export AWS_ACCOUNT=<REPLACE_WITH_AWS_ACCOUNT_ID>
export AWS_REGION=us-east-1

# Create the IAM Policy File
cat << EOF > iam_policy.json
{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Effect": "Allow",
         "Action": [
             "rds-db:connect"
         ],
         "Resource": [
             "arn:aws:rds-db:$AWS_REGION:$AWS_ACCOUNT:dbuser:$RESOURCE_ID/workshop_user"
         ]
      }
   ]
}
EOF

# Create the IAM Policy
aws iam create-policy \
  --region ${AWS_REGION} \
  --policy-name "Aurora_IAM_Policy" \
  --policy-document file://iam_policy.json
 
 
# Export the Policy ARN 
export AURORA_IAM_POLICY_ARN=$(aws --region ${AWS_REGION} iam list-policies --query 'Policies[?PolicyName==`'Aurora_IAM_Policy'`].Arn' --output text)

```


#### 5. Create an IAM role amd map

```bash
# Create an IAM OIDC provider for your cluster
# eksctl utils associate-iam-oidc-provider \
#  --region=$AWS_REGION \
#  --cluster=$EKS_CLUSTER \
#  --approve

export EKS_CLUSTER=eks-demo2
eksctl create iamserviceaccount \
  --cluster $EKS_CLUSTER \
  --name aurora-irsa \
  --namespace workshop \
  --attach-policy-arn $AURORA_IAM_POLICY_ARN \
  --override-existing-serviceaccounts \
  --approve

kubectl describe sa aurora-irsa -n workshop

```

#### 6. Redeploy Helm Chart

```bash
vi workshop/helm-chart/values-aurora.yaml

## change strings from to
# name: DATABASE_SERVICE_URL  <<<<-----
# name: DB_REGION             <<<<-----
```

```bash
helm upgrade \
    -f workshop/helm-chart/values-aurora.yaml \
    workshop \
    workshop/helm-chart/

# verify
kubectl get pods -n workshop

export LB_NAME=$(kubectl get svc frontend -n workshop -o jsonpath="{.status.loadBalancer.ingress[*].hostname}") 
echo $LB_NAME
```


#### 7. Clearn up

- Aurora_IAM_Policy
- eksworkspace-admin Role
- aurora-db-sg

----




#### EFS 설치 및 설정

```bash
MOUNT_TARGET_GROUP_NAME="eks-efs-group"
MOUNT_TARGET_GROUP_DESC="NFS access to EFS from EKS worker nodes"
MOUNT_TARGET_GROUP_ID=$(aws ec2 create-security-group --group-name $MOUNT_TARGET_GROUP_NAME --description "$MOUNT_TARGET_GROUP_DESC" --vpc-id $VPC_ID | jq --raw-output '.GroupId')
aws ec2 authorize-security-group-ingress --group-id $MOUNT_TARGET_GROUP_ID --protocol tcp --port 2049 --cidr $CIDR_BLOCK
```


```bash
FILE_SYSTEM_ID=$(aws efs create-file-system | jq --raw-output '.FileSystemId')
echo "The File System ID is $FILE_SYSTEM_ID"
```

available로 상태가 바뀔 때까지 기다렸다가 진행.

```bash
aws efs describe-file-systems --file-system-id $FILE_SYSTEM_ID
```


EKS 노드를 호스팅하는 서브넷 확인

```bash
subnets=($(aws ec2 describe-subnets --filters "Name=tag:aws:cloudformation:logical-id,Values=EksPublic*" | jq --raw-output '.Subnets[].SubnetId'))
for subnet in ${subnets[@]}
do
    echo "creating mount target in " $subnet
    aws efs create-mount-target --file-system-id $FILE_SYSTEM_ID --subnet-id $subnet --security-groups $MOUNT_TARGET_GROUP_ID
done
```

탑재 대상의 LifeCycleState가 available로 바뀔 때까지 기다렸다가 진행.

```bash
aws efs describe-mount-targets --file-system-id $FILE_SYSTEM_ID | jq --raw-output '.MountTargets[].LifeCycleState'
```

#### 2. EFS CSI 드라이버 설치


```bash
helm repo add aws-efs-csi-driver https://kubernetes-sigs.github.io/aws-efs-csi-driver/
helm repo update
helm upgrade --install aws-efs-csi-driver --namespace kube-system --set image.tag=v2.0.0 aws-efs-csi-driver/aws-efs-csi-driver
```

배포된 Pod 정보 확인

```bash
kubectl get pods -n kube-system | grep efs
```

#### 3. 영구 볼륨 배포

```bash
git clone https://github.com/kubernetes-sigs/aws-efs-csi-driver.git
cd aws-efs-csi-driver/examples/kubernetes/multiple_pods/
```

EFS의 file system ID 확인

```bash
aws efs describe-file-systems --query "FileSystems[*].FileSystemId" --output text
```

manifest 파일에서 volumeHandle의 값을 변경

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: efs-pv
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  storageClassName: efs-sc
  csi:
    driver: efs.csi.aws.com
    volumeHandle: [REPLACE_HERE]
```

Pod 배포

```bash
kubectl apply -f specs/pv.yaml
kubectl apply -f specs/claim.yaml
kubectl apply -f specs/storageclass.yaml
```

```bash
kubectl apply -f specs/pod1.yaml
kubectl apply -f specs/pod2.yaml
kubectl get pods --watch
```

```bash
kubectl describe pv efs-pv
```

공유 확인

```bash
kubectl exec -ti app1 -- tail -f /data/out1.txt
kubectl exec -ti app2 -- tail -f /data/out2.txt
kubectl exec -ti app2 -- tail -f /data/out1.txt
```

##### 자원 정리

```bash
kubectl delete -f specs/
```

---

https://aws.amazon.com/ko/blogs/containers/using-iam-database-authentication-with-workloads-running-on-amazon-eks/