
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




