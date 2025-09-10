## 1 핵심 영역

| 구분 | 세부 항목 | 도구 / 기술 |
|------|-----------|-------------|
| 소스 코드 관리 (SCM) | 버전 관리, 협업 | Git, GitHub, GitLab, Bitbucket |
| CI/CD (지속적 통합/배포) | 빌드 자동화, 테스트, 배포 파이프라인 | Jenkins, GitHub Actions, GitLab CI, CircleCI, Argo CD, Tekton |
| 컨테이너 & 오케스트레이션 | 애플리케이션 컨테이너화 및 배포 | Docker, Podman, Kubernetes, OpenShift |
| 구성 관리 <br>(Configuration Management) | 서버/환경 자동화 관리 | Ansible, Chef, Puppet, SaltStack |
| 인프라 자동화 (IaC) | 코드 기반 인프라 관리 | Terraform, AWS CloudFormation, Pulumi |
| 모니터링 & 로깅 | 시스템/애플리케이션 성능 추적 | Prometheus, Grafana, ELK Stack (Elasticsearch, Logstash, Kibana), Loki |
| 협업 & 커뮤니케이션 | 협업 툴, 애자일/칸반 보드 | Jira, Confluence, Slack, Microsoft Teams |
| 보안 (DevSecOps) | 코드/빌드/배포 단계 보안 통합 | SonarQube, Snyk, Trivy, HashiCorp Vault |


---

MLOps = DevOps + ML

## 1 기초 지식 준비

| 구분                     | 학습 항목 | 세부 내용                          |
|-------------------------|-----------|---------------------------------|
| (1) 머신러닝/<br>딥러닝 기본기 | - Python, NumPy, Pandas, Scikit-learn<br>- TensorFlow / PyTorch<br>- 데이터 전처리, 모델 학습, 하이퍼파라미터 튜닝 | - 데이터 분석 및 ML 기초 라이브러리 <br>- 딥러닝 프레임워크 사용 경험<br>- ML 모델 구축 및 최적화 경험 |
| (2) 소프트웨어<br> 엔지니어링 &<br> DevOps 기초 | - Git / GitHub<br> - Docker<br> - Kubernetes<br> - CI/CD 개념| - 버전 관리 기본<br> - 애플리케이션 및 모델 컨테이너화<br> -  컨테이너 배포 및 스케일링 기본기<br> - GitHub Actions, GitLab CI, Jenkins 등 자동화 파이프라인 |
| (3) 클라우드 환경 이해 | - AWS<br> - GCP<br> - Azure<br> - 공통 | - S3, SageMaker, Lambda<br> - AI Platform, Vertex AI<br> - Azure ML<br> - MLOps는 대부분 클라우드 서비스와 연결되므로 클라우드 기본기 있으면 유리|


## 2 MLOps 핵심 개념

| 구분 | 세부 항목 | 도구 / 기술 |
|------|-----------|-------------|
| 데이터 관리<br> or 데이터 엔지니어링 | - 데이터 버전 관리<br> - Feature Store | - DVC, LakeFS, Delta Lake<Br> - Feast, SageMaker Feature Store |
| 모델 학습 & 실험 관리 | - 실험 관리 도구<br> - 실험 추적 및 로깅 | - MLflow, Weights & Biases(W&B), Neptune.ai<br> - Experiments, 메트릭 로깅 |
| 모델 패키징 & 배포 | - 컨테이너화<br> - 배포/서빙 프레임워크<br> - CI/CD | - Docker<br> - Kubernetes + Kubeflow, Seldon Core, BentoML<br> - 모델 배포 파이프라인 |
| 모델 모니터링 & 운영 | - 데이터 품질<br> - 성능 모니터링<br> - 운영 자동화 | - 데이터 드리프트 탐지<br> - Prometheus, Grafana, Evidently AI<br> - 재학습 트리거 |
| 워크플로우 <br>오케스트레이션 | - 파이프라인 오케스트레이션 | - Kubeflow Pipelines<br> - Airflow<br> - Prefect, Dagster |

## 3. 추천 자료

- 책:
    - Practical MLOps (O’Reilly)
    - Machine Learning Engineering (Andriy Burkov)
- 강의:
    - Coursera: MLOps (DeepLearning.AI)
    - Udemy: MLOps with MLflow, Kubernetes
- 실습 플랫폼:
    - Kaggle + MLflow
    - AWS SageMaker Studio Lab (무료)