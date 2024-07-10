#### 1. deployment manifest 파일 생성

- 1.1 GKE 클러스터에 연결
  ```bash
  export my_zone=us-central1-a
  export my_cluster=standard-cluster-1
  source <(kubectl completion bash)
  gcloud container clusters create $my_cluster --num-nodes 3 --zone $my_zone --enable-ip-alias
  gcloud container clusters get-credentials $my_cluster --zone $my_zone
  ```
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
  ```
- 1.3 디플로이먼트 배포
  ```bash
  kubectl apply -f deployment.yaml
  ```
- 1.4 디플로이먼트 상태 확인
  ```bash
  kubectl get deployments
  kubectl get pod
  kubectl exec -it [POD_NAME] -- /bin/bash
  ```
- 1.5 접속했던 파드에서 빠져 나오기

  ```bash
  exit
  ```

#### 2. 디플로이먼트 스케일업

- 2.1 수동으로 스케일업
  ```bash
  kubectl scale --replicas=4 deployment nginx-deployment
  kubectl get deployments
  ```

#### 3. 서비스 지정

- 3.1 서비스의 매니페스트

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

- 3.2 서비스 생성
  ```bash
  kubectl apply -f service.yaml
  ```
- 3.3 서비스 확인
  ```bash
  kubectl get service nginx
  ```
- 3.4 서비스의 EXTERNAL_IP 정보를 확인 후, 로드밸런서를 통해 서비스 확인

#### 4. 카나리아 배포

- 4.1 카나리아 배포를 위한 deployment 매니페스트

  ```bash
  cat > canary.yaml<<EOF
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: nginx-canary
    labels:
      app: nginx
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: nginx
    template:
      metadata:
        labels:
          app: nginx
          track: canary
          Version: "1.24"
      spec:
        containers:
        - name: nginx
          image: moonjukhim/nginx:1.24
          ports:
          - containerPort: 80
  EOF
  ```

- 4.2 deployment 생성
  ```bash
  kubectl apply -f canary.yaml
  ```
- 4.3 디플로이먼트 확인
  ```bash
  kubectl get deployments
  ```
- 4.4 기존 배포된 디플로이먼트의 레플리카 수를 0으로 설정
  ```bash
  kubectl scale --replicas=0 deployment nginx-deployment
  ```
- 4.5 디플로이먼트 확인
  ```bash
  kubectl get deployments
  ```

---

#### Reference

1. docker run

```bash
docker run -d --name tmp-nginx nginx
docker ps
docker images
docker rmi [IMAGE_NAME]

docker build -t moonjukhim/nginx:1.7.9 .
docker push moonjukhim/nginx:1.7.9

kubectl apply -f deployment.yaml
```