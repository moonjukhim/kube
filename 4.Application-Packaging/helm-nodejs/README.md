### nodejs-sample app + dockerfile + helmchart

#### 1. Node.js App 생성

- 1.0 git clone

```bash
export my_zone=us-central1-a
export my_cluster=standard-cluster-1
source <(kubectl completion bash)
gcloud container clusters create $my_cluster --num-nodes 3 --zone $my_zone --enable-ip-alias
gcloud container clusters get-credentials $my_cluster --zone $my_zone
# 코드 다운로드
git clone https://github.com/moonjukhim/kube.git
```

- 1.1 index.js 파일(kube/4.Application-Security/helm-nodejs/index.js)
- 1.2 로컬에서 테스트 시에 npm 설치

```bash
npm install
npm start
```

#### 2. Docker 이미지 생성

- 2.1 Dockerfile 확인(kube/4.Application-Security/helm-nodejs/Dockerfile)
- ~~2.2 이미지 빌드(Docker Hub)~~

```bash
# to docker hub
### docker build -t [USERNAME]/[APPNAME]
# docker build -t moonjukhim/helm-nodejs .
# docker images

# docker login
# docker push moonjukhim/helm-nodejs
```

- 2.3 이미지 빌드 & 푸시(Cloud Container Registry)

```bash
gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/helm-nodejs .
```

#### 3. Helm 차트 생성

- 3.1 차트 생성

```bash
# 처음 스스로 생성하는 경우 helm create로 생성
# 기존 차트의 활용(kube/4.Application-Security/helm-nodejs/helm-chart)
helm create helm-chart
```

- 3.2 values.yaml 파일 정보 확인(Chart.yaml의 appVersion 정보 확인 필요!!)

```yaml
-- ...
image:
repository: <your username>/<appname> # 앞에서 생성한 이미지를 저장한 위치로 지정
tag: latest # gcr.io/[PROJECT_NAME]/helm-nodejs 의 형태
-- ...
```

- 3.3 helm-chart/templates/service.yaml 파일 정보

```yaml
spec:
type: { { .Values.service.type } }
ports:
  - nodePort: { { .Values.service.exposePort } }
port: { { .Values.service.internalPort } }
targetPort: { { .Values.service.targetPort } }
```

#### 4. Helm 차트 설치

- 4.1 헬름 차트 설치

```bash
helm install helm-nodejs .
```

#### 5. 차트를 패키징로 생성

- 5.0 Cloud Artifact Registry에 차트가 저장될 Repository 생성
- 5.0 "helm-repo"로 저장소 이름 지정, Region은 "us-central1"으로 지정 후, 생성

- 5.1 패키지 생성

```bash
helm package .
```

- 5.2 helm 이 레지스트리에 접속하기 위해 인증

```bash
gcloud auth print-access-token | helm registry login -u oauth2accesstoken \
--password-stdin https://us-central1-docker.pkg.dev
# index.yaml 파일이 생성되었는지 확인
```

- 5.3 Artifact Registry에 차트 내보내기

```bash
helm push helm-chart-0.1.0.tgz oci://us-central1-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/helm-repo
```

#### 6. helm 리포지터리 확인

- 6.1 repository 확인

```bash
gcloud artifacts docker images list us-central1-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/helm-repo
```

#### 7. helm 설치

- 7.1 Repository로부터 helm 설치

```bash
helm install helm-chart oci://us-central1-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/helm-repo/helm-chart --version 0.1.0
# 설치된 차트 확인
helm list
```

#### 8. Helm 차트 제거

- 8.1 helm 차트 제거

```bash
helm delete helm-chart --purge
```
