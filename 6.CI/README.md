
```bash
# kubectl, eksctl download
sudo curl --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.23.7/2022-06-29/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl
# eksctl
curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin
# helm
curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```


```bash
# Amazon-linux 2023
sudo dnf install -y java-17-amazon-corretto
sudo alternatives --config java
java -version
```

```bash
sudo yum install jenkins -y
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

```text
/* Jenkinsfile */
def imageTag
node {

    def app

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout scm
    }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */

        app = docker.build("eks-gitops-demo")
    }

    stage('Test image') {
        /* Run a test framework against our image. */

        app.inside {
            sh 'echo "Tests passed"'
        }
    }

    stage('Push image') {
        /* Finally, we'll push the image with two tags:
         * First, the incremental build number from Jenkins
         * Second, the 'latest' tag.
         * Pushing multiple tags is cheap, as all the layers are reused. */
        imageTag = sh(script: "head -n 1 Dockerfile | sed 's/#//'", returnStdout: true).trim()
        docker.withRegistry('https://ACCOUNTID.dkr.ecr.REGION.amazonaws.com', 'ecr:REGION:ecrUser') {
        /*    app.push("${env.BUILD_NUMBER}") */
            app.push("${imageTag}")
            app.push("latest")
        }
        echo "Pushed image with tag: ${imageTag}"
    }
}
```


---

[GitOps](https://www.eksworkshop.com/docs/automation/gitops/)
