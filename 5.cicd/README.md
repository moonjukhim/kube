1. 환경 설정
  - 1.1 CloudBuild API 활성화
    ```bash
    gcloud services enable container.googleapis.com \
    cloudbuild.googleapis.com \
    sourcerepo.googleapis.com \
    containeranalysis.googleapis.com
    ```
  - 1.2 도커 이미지가 저장될 저장소 생성
    ```bash
    gcloud artifacts repositories create my-repository \
      --repository-format=docker \
      --location=us-central1
    ```
  - 1.3 클러스터 생성
    ```bash
    gcloud container clusters create hello-cloudbuild \
      --num-nodes 1 --region us-central1
    ```  
  - 1.4 git 설정
    ```bash
    git config --global user.email "you@example.com"  
    git config --global user.name "Your Name"
    ```

2. 소스가 저장될 저장소 생성
  - 2.1 두 개의 리포지토리 생성
    ```bash
    gcloud source repos create hello-cloudbuild-app
    gcloud source repos create hello-cloudbuild-env 
    ```
  - 2.2 코드 복제
    ```bash
    gcloud source repos clone hello-cloudbuild-app
    cp demo/* hello-cloudbuild-app
    


