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