FROM gcr.io/istio-testing/websphere-liberty:22.0.0.8-full-java8-ibmjava

ENV SERVERDIRNAME reviews

COPY ./servers/LibertyProjectServer /opt/ol/wlp/usr/servers/defaultServer/

RUN /opt/ol/wlp/bin/featureUtility installServerFeatures  --acceptLicense /opt/ol/wlp/usr/servers/defaultServer/server.xml && \
    chmod -R g=rwx /opt/ol/wlp/output/defaultServer/

ARG service_version
ARG enable_ratings
ARG star_color
ENV SERVICE_VERSION ${service_version:-v1}
ENV ENABLE_RATINGS ${enable_ratings:-false}
ENV STAR_COLOR ${star_color:-black}

CMD ["/opt/ol/wlp/bin/server", "run", "defaultServer"]
