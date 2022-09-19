1. 클러스터 생성
```bash
export my_zone=us-central1-a
export my_cluster=standard-cluster-1

gcloud container clusters create $my_cluster --num-nodes 3 --zone $my_zone --enable-ip-alias
```

2. 파드 배포

```bash
kubectl create deployment --image nginx nginx-1
kubectl get pods
export my_nginx_pod=[your_pod_name]
echo $my_nginx_pod
kubectl describe pod $my_nginx_pod
```