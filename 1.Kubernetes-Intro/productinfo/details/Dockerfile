FROM ruby:2.7.1-slim

COPY details.rb /opt/microservices/

ARG service_version
ENV SERVICE_VERSION ${service_version:-v1}
ARG enable_external_book_service
ENV ENABLE_EXTERNAL_BOOK_SERVICE ${enable_external_book_service:-false}

EXPOSE 9080
WORKDIR /opt/microservices

CMD ["ruby", "details.rb", "9080"]
