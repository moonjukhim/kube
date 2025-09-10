## 1 DevOps 핵심 영역

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

## 책

| 단계    | 책 제목                                               | 특징                                               |
| ----- | -------------------------------------------------- | ------------------------------------------------ |
| 입문    | **The DevOps Handbook** (Gene Kim 외)               | DevOps 철학과 원칙을 정리한 고전, “왜 DevOps인가?” 이해에 적합      |
| 입문/실무 | **Accelerate** (Nicole Forsgren 외)                 | DORA Metrics(배포 빈도, 변경 실패율 등)로 DevOps 성과를 계량화한 책 |
| 실무    | **Site Reliability Engineering (SRE)** (Google)    | 대규모 시스템 운영 경험 기반, DevOps/SRE 차이와 실무 노하우          |
| 실무    | **Continuous Delivery** (Jez Humble, David Farley) | CI/CD 파이프라인 설계와 자동화 원리 정리                        |
| 실무/심화 | **Infrastructure as Code** (Kief Morris)           | Terraform, CloudFormation 등 IaC 개념과 패턴 학습        |


## 강의

| 플랫폼         | 강의 제목                                                             | 특징                                                |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| Coursera    | **Continuous Integration & Continuous Deployment** (Google Cloud) | CI/CD 파이프라인 중심, GCP 기반 실습                         |
| Coursera    | **DevOps on AWS Specialization** (AWS)                            | AWS 기반 DevOps 실무 (CodePipeline, CodeBuild, ECS 등) |
| Udemy       | **Docker & Kubernetes: The Complete Guide** (Stephen Grider)      | Docker/K8s 입문\~실무, 가장 평이 좋은 강의 중 하나               |
| Udemy       | **CI/CD with Jenkins, Git, Docker, Kubernetes**                   | Jenkins 중심의 CI/CD 실습형 강의                          |

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


---

## DevOps Vs. MLOps

| 구분 | DevOps | MLOps |
|------|--------|-------|
| 소스/데이터 관리 | Git, GitHub, GitLab, Bitbucket (코드 버전 관리) | DVC, LakeFS, Delta Lake (데이터 버전 관리), Feature Store (Feast, SageMaker Feature Store) |
| CI/CD (지속적 통합/배포) | Jenkins, GitHub Actions, GitLab CI, CircleCI, Argo CD, Tekton | MLflow Pipelines, Kubeflow Pipelines, GitHub Actions, GitLab CI (모델 학습 + 배포 자동화) |
| 컨테이너 & 오케스트레이션 | Docker, Podman, Kubernetes, OpenShift | Docker, Kubernetes, Kubeflow, Seldon Core, BentoML (모델 배포/서빙) |
| 구성/인프라 관리 | Ansible, Chef, Puppet, SaltStack, Terraform, CloudFormation | IaC 도구 동일하게 활용 (Terraform, CloudFormation) + 모델 학습 환경 자동화 |
| 실험/학습 관리 | (일반 SW는 필요 없음) | MLflow, Weights & Biases, Neptune.ai (실험 추적 및 메트릭 로깅) |
| 모니터링 & 로깅 | Prometheus, Grafana, ELK Stack, Loki (시스템/애플리케이션 모니터링) | Prometheus, Grafana, Evidently AI (데이터/모델 드리프트, 성능 모니터링) |
| 협업 & 커뮤니케이션 | Jira, Confluence, Slack, Teams | 동일하게 사용 + 추가로 모델 실험 공유 도구(W&B Reports 등) |
| 보안 (DevSecOps / MLOps 보안) | SonarQube, Snyk, Trivy, Vault (코드 및 빌드 보안) | 모델 보안/데이터 프라이버시 검증, 모델 접근 제어 (IAM, Unity Catalog 등) |
