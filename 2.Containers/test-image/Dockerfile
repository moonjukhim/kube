FROM node:latest

COPY . /var/www
WORKDIR /var/www
RUN npm install

EXPOSE 3001

ENTRYPOINT ["node", "app.js"]

