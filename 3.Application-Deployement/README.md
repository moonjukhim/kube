1. deployment manifest 파일 생성
    - 1.1 GKE 클러스터에 연결
        ```bash
        export my_zone=us-central1-a
        export my_cluster=standard-cluster-1
        source <(kubectl completion bash)
        gcloud container clusters get-credentials $my_cluster --zone $my_zone
        ```
    - 1.2 deployment manifest
        ```bash
        apiVersion: apps/v1
        kind: Deployment
        metadata:
        name: nginx-deployment
        labels:
            app: nginx
        spec:
            replicas: 3
            selector:
                matchLabels:
                app: nginx
            template:
                metadata:
                labels:
                    app: nginx
            spec:
            containers:
            - name: nginx
                image: nginx:1.7.9
                ports:
                - containerPort: 80
        ```
        
