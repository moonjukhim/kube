```bash
eksctl create cluster \
--name ekscluster \
--nodegroup-name eks-nodes \
--node-type t3.medium \
--nodes 3 \
--nodes-min 1 \
--nodes-max 3 \
--managed \
--version ${EKS_VERSION} \
--region ${AWS_REGION}
```