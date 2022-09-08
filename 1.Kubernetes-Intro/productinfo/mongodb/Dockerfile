FROM mongo:5.0.10
WORKDIR /app/data/
COPY ratings_data.json /app/data/
COPY script.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/script.sh
