### nodejs-sample app + dockerfile + helmchart

1. Node.js App 생성
  - 1.1 index.js 파일
  - 1.2 로컬에서 테스트 시에 npm 설치
  ```bash
  npm install
  npm start
  ```

2. Docker 이미지 생성
  - 2.1 Dockerfile 확인
  - 2.2 이미지 빌드
  ```bash
  # docker build -t moonjukhim/helm-nodejs .
  docker build -t [USERNAME]/[APPNAME]
  docker images
  ```
  - 2.3 이미지 푸시
  ```bash
  docker login
  docker push moonjukhim/helm-nodejs
  ```

3. Helm 차트 생성
  - 3.1 차트 생성
  ```bash
  helm create helm-chart
  ```
  - 3.2 values.yaml 파일 정보 확인
  ```yaml
  -- ...
  image:
  repository: <your username>/<appname>
  tag: latest
  -- ...
  ```
  - 3.3 helm-chart/templates/service.yaml 파일 정보
  ```yaml
  spec:
  type: {{ .Values.service.type }}
  ports:
  - nodePort: {{ .Values.service.exposePort }}
  port: {{ .Values.service.internalPort }}
  targetPort: {{ .Values.service.targetPort }}
  ```

4. Helm 차트 설치
  - 4.1 헬름 차트 설치
  ```bash
  helm install helm-nodejs .
  ```




