## 1 기초 지식 준비

| 구분                     | 학습 항목 | 세부 내용                          |
|-------------------------|-----------|---------------------------------|
| (1) 머신러닝/<br>딥러닝 기본기 | - Python, NumPy, Pandas, Scikit-learn<br>- TensorFlow / PyTorch<br>- 데이터 전처리, 모델 학습, 하이퍼파라미터 튜닝 | - 데이터 분석 및 ML 기초 라이브러리 <br>- 딥러닝 프레임워크 사용 경험<br>- ML 모델 구축 및 최적화 경험 |
| (2) 소프트웨어<br> 엔지니어링 &<br> DevOps 기초 | - Git / GitHub<br> - Docker<br> - Kubernetes<br> - CI/CD 개념| - 버전 관리 기본<br> - 애플리케이션 및 모델 컨테이너화<br> -  컨테이너 배포 및 스케일링 기본기<br> - GitHub Actions, GitLab CI, Jenkins 등 자동화 파이프라인 |
| (3) 클라우드 환경 이해 | - AWS<br> - GCP<br> - Azure<br> - 공통 | - S3, SageMaker, Lambda<br> - AI Platform, Vertex AI<br> - Azure ML<br> - MLOps는 대부분 클라우드 서비스와 연결되므로 클라우드 기본기 있으면 유리|


## 2 MLOps 핵심 개념

| 구분 | 세부 항목 | 도구 / 기술 |
|------|-----------|-------------|
| 데이터 관리<br> 데이터 엔지니어링 | - 데이터 버전 관리<br> - Feature Store | - DVC, LakeFS, Delta Lake<Br> - Feast, SageMaker Feature Store |
| 모델 학습 & 실험 관리 | - 실험 관리 도구<br> - 실험 추적 및 로깅 | - MLflow, Weights & Biases(W&B), Neptune.ai<br> - Experiments, 메트릭 로깅 |
| 모델 패키징 & 배포 | - 컨테이너화<br> - 배포/서빙 프레임워크<br> - CI/CD | - Docker<br> - Kubernetes + Kubeflow, Seldon Core, BentoML<br> - 모델 배포 파이프라인 |
| 모델 모니터링 & 운영 | - 데이터 품질<br> - 성능 모니터링<br> - 운영 자동화 | - 데이터 드리프트 탐지<br> - Prometheus, Grafana, Evidently AI<br> - 재학습 트리거 |
| 워크플로우 오케스트레이션 | 파이프라인 오케스트레이션 | Kubeflow Pipelines, Airflow, Prefect, Dagster |
