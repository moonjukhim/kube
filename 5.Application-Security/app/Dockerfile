FROM node:20-alpine

RUN apk add --no-cache ca-certificates && update-ca-certificates
WORKDIR /app

RUN wget -qO /etc/ssl/certs/rds-global-bundle.pem \
    https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

COPY package*.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
