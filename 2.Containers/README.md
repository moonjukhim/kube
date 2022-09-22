#### 0. 쿠버네티스 클러스터 생성
  - 0.1 클러스터 생성
    ```bash
    export my_zone=us-central1-a
    export my_cluster=standard-cluster-1
    gcloud container clusters create $my_cluster --num-nodes 3 --zone $my_zone --enable-ip-alias
    ```

#### 1. API check 
  - 1.1 Cloud Build API가 enable되어 있지 않은 경우 활성화

#### 2. 컨테이너 생성(## 방법A)
  - 2.0 디렉토리 생성
    ```bash
    mkdir test-image
    cd test-image
    ```

  - 2.1 start.sh
    ```bash
    cat > start.sh <<EOF
    #!/bin/sh
    echo "Hello, world! The time is $(date)."
    EOF
    ```

  - 2.2 Dockerfile
    ```bash
    cat > Dockerfile <<EOF
    FROM alpine
    COPY start.sh /
    CMD ["/start.sh"]
    EOF
    ```

  - 2.3 실행권한
    ```bash
    chmod +x start.sh
    ```
  - 2.4 이미지 생성
    ```bash
    # docker build -t moonjukhim/test-image .
    # docker images
    # sudo ls /var/lib/docker/image/overlay2/layerdb/sha256
    # docker history moonjukhim/test-image
    gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/test-image .
    ```
  - 2.5 Container Registry에서 이미지 확인
  - 2.6 Deployment 객체 생성
    ```bash
    PROJECT_ID=$(gcloud config get-value project)
    gcloud container clusters get-credentials $my_cluster --zone $my_zone --project $PROJECT_ID
    # Deployment 생성
    kubectl create deployment --image gcr.io/$PROJECT_ID/test-image test-image
    ```

---    

#### 3. Cloud Build를 사용한 컨테이너 생성(## 방법B)
  - 3.1 cloudbuild.yaml
    ```yaml
    steps:
    - name: 'gcr.io/cloud-builders/docker'
      args: [ 'build', '-t', 'gcr.io/$PROJECT_ID/test-image', '.' ]
    images:
    - 'gcr.io/$PROJECT_ID/test-image'
    ```
  - 3.2 명령을 통한 Cloud Build 실행
    ```bash
    gcloud builds submit --config cloudbuild.yaml .
    ```
    
#### 4. References
  - https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration