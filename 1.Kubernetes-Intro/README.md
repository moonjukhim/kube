1. 클러스터 생성
    - 1.1 menu에서 Kubernetes Engine > Clusters 이동
    - 1.2 클러스터의 이름을 "standard-cluster-1"로 지정
    - 1.3 "Create" 버튼을 클릭하고 "Standard" 모드의 클러스터 생성(5~6분정도 소요)

2. 워크로드 배포
    - 2.1 Kubernetes Engine > Workloads에서 "Deploy" 클릭
    - 2.2 "Continue" 클릭
    - 2.3 "VIEW YAML"을 눌러 내용을 확인 후, 배포

3. 워크로드 노출을 위한 서비스(Service)
    - 3.1 workload메뉴에서 "nginx-1" 이름을 클릭
    - 3.2 하단 부분의 Exposing services 부분에서 "Expose" 버튼 클릭
    - 3.3 기본값 그대로 생성 클릭

###### 

1. 명령어를 통한 클러스터 생성
    - 1.1 클러스터 생성
    ```bash
    export my_zone=us-central1-a
    export my_cluster=standard-cluster-1

    gcloud container clusters create $my_cluster --num-nodes 3 --zone $my_zone --enable-ip-alias
    ```

2. 명령어를 통한 파드 배포
    - kubectl 명령
    ```bash
    kubectl create deployment --image nginx nginx-1
    kubectl get pods
    export my_nginx_pod=[your_pod_name]
    echo $my_nginx_pod
    kubectl describe pod $my_nginx_pod
    ```