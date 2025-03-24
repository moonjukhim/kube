#### 0. 기존 노드 그룹이 있는 EKS 클러스터


```bash
kubectl get nodes
```

#### 2. Aurora DB Setup

1. Security Group Creation

```bash
export SG_ID=$(aws ec2 create-security-group --group-name aurora-db-sg --description "SG for Aurora DB" --vpc-id <vpc-id> --query 'GroupId' --output text)
aws ec2 create-security-group --group-name aurora-db-sg --description "SG for Aurora DB" --vpc [VPC_ID]
export SG_ID=[SECURITY_GROUP_ID]
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3306 --cidr 10.0.0.0/16
aws ec2 describe-security-groups --group-ids $SG_ID


```

2. Subnet Group 생성

```bash
aws rds create-db-subnet-group \
    --db-subnet-group-name aurora-subnet-group \
    --db-subnet-group-description "Subnet group for Aurora DB" \
    --subnet-ids subnet-123abc subnet-456def
```

3. Aurora DB Creation

```bash
aws rds create-db-cluster \
    --db-cluster-identifier my-aurora-cluster \
    --engine aurora-mysql \
    --master-username admin \
    --master-user-password mypassword \
    --vpc-security-group-ids $SG_ID \
    --db-subnet-group-name aurora-subnet-group
```

```bash
aws rds create-db-instance \
    --db-instance-identifier my-aurora-instance \
    --db-cluster-identifier my-aurora-cluster2 \
    --engine aurora-mysql \
    --db-instance-class db.t3.medium \
    --publicly-accessible \
    --db-subnet-group-name aurora-subnet-group \
    --no-multi-az
```

IAM DB 인증이 활성화되지 않은 경우 활성화

```bash
# Create Database in POD
kubectl apply -f exterName.yaml
kubectl apply -f eks-rds.yaml

kubectl run -it --rm --image=mysql:latest --restart=Never mysql-client -- mysql -h [ENDPOINT] -u dbadmin -pmypassword

export DB_ENDPOINT=<rds_database_endpoint>
mysql -h $DB_ENDPOINT -P 3306 -u[MY_ID] -p[MY_PASSWORD]
```

```sql
CREATE DATABASE dev;
CREATE TABLE dev.product (prodId VARCHAR(120), prodName VARCHAR(120));
INSERT INTO dev.product (prodId,prodName) VALUES ('999','Mountain New Bike');
```

```sql
CREATE USER workshop_user IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS' REQUIRE SSL;
GRANT USAGE ON *.* TO 'workshop_user'@'%'
GRANT ALL PRIVILEGES ON dev.* TO 'workshop_user'@'%'

select user,plugin,host from mysql.user where user like '%workshop_user%';
show grants for workshop_user; 
```


#### 3. Kubernetes에 애플리케이션 배포

```bash
aws eks update-kubeconfig --region us-east-1 --name eks-demo2

# helm
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


#### Create an IAM role amd map

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

#### Redeploy Helm Chart

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