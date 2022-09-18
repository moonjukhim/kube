```bash
gcloud services enable container.googleapis.com \
    cloudbuild.googleapis.com \
    sourcerepo.googleapis.com \
    containeranalysis.googleapis.com

gcloud artifacts repositories create my-repository \
  --repository-format=docker \
  --location=us-central1

gcloud container clusters create hello-cloudbuild \
    --num-nodes 1 --region us-central1

git config --global user.email "you@example.com"  
git config --global user.name "Your Name"
```


```bash
gcloud source repos create hello-cloudbuild-app
gcloud source repos create hello-cloudbuild-env

