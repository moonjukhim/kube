#### 0. 쿠버네티스 클러스터 생성
  - 0.1 클러스터 생성
    ```bash
    export my_zone=us-central1-a
    export my_cluster=standard-cluster-1
    export PROJECT_ID=$(gcloud config get-value project)
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
    cat > app.js <<EOF
    const express = require('express')
    const app = express()
    const port = 3000

    app.get('/', (req, res) => {
        res.send("Hello World!!")
    })

    app.listen(port, () => {
        console.log('Example App listening on port ${port}')
    })
    EOF
    ```

  - 2.2 Dockerfile
    ```bash
    cat > Dockerfile <<EOF
    FROM node:latest

    COPY . /var/www
    WORKDIR /var/www
    RUN npm install

    EXPOSE 3001

    ENTRYPOINT ["node", "app.js"]
    EOF
    ```

  - 2.3 package.json 파일 생성  
    ```bash
    cat > package.json <<EOF
    {
        "name": "nodejs",
        "version": "1.0.0",
        "description": "",
        "main": "app.js",
        "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "",
        "license": "ISC"
      }
    EOF
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
    cat > cloudbuild.yaml <<EOF
    steps:
    - name: 'gcr.io/cloud-builders/docker'
      args: [ 'build', '-t', 'gcr.io/${GOOGLE_CLOUD_PROJECT}/test-image', '.' ]
    images:
    - 'gcr.io/${GOOGLE_CLOUD_PROJECT}/test-image'
    EOF
    ```
  - 3.2 명령을 통한 Cloud Build 실행
    ```bash
    gcloud builds submit --config cloudbuild.yaml .
    ```
    
#### 4. References
  - https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration