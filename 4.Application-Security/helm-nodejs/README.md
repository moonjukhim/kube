### nodejs-sample app + dockerfile + helmchart

#### 1. Node.js App 생성

- 1.0 git clone

```bash
export my_zone=us-central1-a
export my_cluster=cluster-1
source <(kubectl completion bash)
gcloud container clusters create $my_cluster --num-nodes 3 --zone $my_zone --enable-ip-alias
gcloud container clusters get-credentials $my_cluster --zone $my_zone
# 코드 다운로드
git clone https://github.com/moonjukhim/kube.git
```

- 1.1 index.js 파일(kube/4.Application-Security/index.js)
- 1.2 로컬에서 테스트 시에 npm 설치

```bash
npm install
npm start
```

#### 2. Docker 이미지 생성

- 2.1 Dockerfile 확인(kube/4.Application-Security/Dockerfile)
- 2.2 이미지 빌드

```bash
# docker build -t [USERNAME]/[APPNAME]
docker build -t moonjukhim/helm-nodejs .
docker images
```

- 2.3 이미지 푸시

```bash
docker login
docker push moonjukhim/helm-nodejs
```

#### 3. Helm 차트 생성

- 3.1 차트 생성

```bash
# 처음 스스로 생성하는 경우 helm create로 생성
# 기존 차트의 활용(kube/4.Application-Security/helm-nodejs/helm-chart)
helm create helm-chart
```

- 3.2 values.yaml 파일 정보 확인

```yaml
-- ...
image:
repository: <your username>/<appname> # 앞에서 생성한 이미지를 저장한 위치로 지정
tag: latest
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

- 5.0 GitHub에 차트가 저장될 Repository 생성
- 5.1 패키지 생성

```bash
helm package .
```

- 5.2 helm 초기화

```bash
helm repo index .
ls -al
# index.yaml 파일이 생성되었는지 확인
```

- 5.3 Git에 커밋

```bash
# 5.0에서 생성한 Repository 에서
# setting/pages/GitHub Pages 설정 필요!!!
# 사용할 branch를 default 브랜치로 설정
git config --global user.email "moonju.khim@gmail.com"
git config --global user.name "moonjukhim"
git config --global user.password "TOKEN_STRING" # PWD가 아닌 TOKEN으로 변경됨
#
git init
git remote add origin https://github.com/moonjukhim/helm-repository.git
git status
git add *
git commit -m 'initial commit'
git push -u origin master

# git pull [REPOSITORY] [BRANCH]
```

#### 6. helm 리포지터리 업데이트

- 6.1 repository 업데이트

```bash
# $ helm repo add YOUR_REPO_NAME YOUR_GITHUB_IO_URL
helm repo add moonjukhim "https://moonjukhim.github.io/helm-repository/"
helm repo update
helm repo list
```

#### 7. helm 설치

- 7.1 Repository로부터 helm 설치

```bash
helm search repo
# helm install [NAME] [CHART] [flags]
helm install helm-chart moonjukhim/helm-chart
```

#### 8. Helm 차트 제거

- 8.1 helm 차트 제거

```bash
helm delete helm-chart --purge
```
