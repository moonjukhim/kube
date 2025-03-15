cat << EOF > Dockerfile
FROM nginx:latest
RUN  echo '<h1> test nginx web page </h1>'  >> index.html
RUN cp /index.html /usr/share/nginx/html
EOF