1. API check 
    - Cloud Build API가 enable되어 있지 않은 경우 활성화

2. 컨테이너 생성(## 방법A)
    - 2.0 디렉토리 생성
        ```bash
        mkdir test-image
        cd test-image
        ```
    - 2.1 start.sh
        ```bash
        #!/bin/sh
        echo "Hello, world! The time is $(date)."
        ```
    - 2.2 Dockerfile
        ```
        FROM alpine
        COPY start.sh /
        CMD ["/start.sh"]
        ```
    - 2.3 실행권한
        ```bash
        chmod +x start.sh
        ```
    - 2.4 이미지 생성
        ```bash
        gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/test-image .
        ```
    - 2.5 Container Registry에서 이미지 확인
    - 2.6 Deployment 객체 생성
        ```bash
        gcloud container clusters get-credentials cluster-1 --zone us-central1-c --project [PROJECT_NAME]

        kubectl create deployment --image gcr.io/[PROJECT_NAME]/test-image test-image
        ```

---    

3. Cloud Build를 사용한 컨테이너 생성(## 방법B)
    - 3.1 cloudbuild.yaml
        ```yaml
        steps:
        - name: 'gcr.io/cloud-builders/docker'
        args: [ 'build', '-t', 'gcr.io/$PROJECT_ID/test-image', '.' ]
        images:
        - 'gcr.io/$PROJECT_ID/test-image'
        ```
    
4. References
    - https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration