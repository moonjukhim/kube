1. API check 
    - Cloud Build API가 enable되어 있지 않은 경우 활성화

2. 컨테이너 생성
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
    - 2.5 이미지 확인

