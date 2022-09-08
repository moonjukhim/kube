FROM mysql:8.0.30
# MYSQL_ROOT_PASSWORD must be supplied as an env var

COPY ./mysqldb-init.sql /docker-entrypoint-initdb.d
