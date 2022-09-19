1. 네임스페이스 생성 (Demo 환경에서 진행)
    - 1.1 크리덴셜 정보 획득
        ```bash
        export my_zone=us-central1-a
        export my_cluster=standard-cluster-1

        source <(kubectl completion bash)

        gcloud container clusters get-credentials $my_cluster --zone $my_zone
        ```
    - 1.2 네임스페이스 생성
        ```bash    
        kubectl create -f ./namespace.yaml
        ```
    - 1.3 해당 네이스페이스에 객체 생성
        ```
        kubectl apply -f ./pod1.yaml --namespace=production
        kubectl get pods
        kubectl get pods --namespace=production
        ```

2. Role과 RoleBinding(User A로 진행)
    - 2.1 사용자 지정 역할 만들기
        ```bash
        kubectl create clusterrolebinding cluster-admin-binding --clusterrole cluster-admin --user [USERNAME_1_EMAIL]

        # 역할 생성
        kubectl apply -f pod-reader-role.yaml
        kubectl get pods --namespace=production
        ```
    - 2.2 역할 바인딩 생성
        ```bash
        export USER2=[USERNAME_2_EMAIL]
        sed -i "s/\[USERNAME_2_EMAIL\]/${USER2}/" user2-role-binding.yaml
        cat user2-role-binding.yaml
        ```
3. 접근 제어 테스트