FROM python:3.7.7-slim

WORKDIR /

COPY requirements.txt ./
RUN pip3 install -vvv --no-cache-dir -r requirements.txt

COPY test-requirements.txt ./
RUN pip3 install --no-cache-dir -r test-requirements.txt

COPY productpage.py /opt/microservices/
COPY tests/unit/* /opt/microservices/
COPY templates /opt/microservices/templates
COPY static /opt/microservices/static
COPY requirements.txt /opt/microservices/

ARG flood_factor
ENV FLOOD_FACTOR ${flood_factor:-0}

EXPOSE 9080
WORKDIR /opt/microservices
RUN python -m unittest discover

CMD ["python", "productpage.py", "9080"]
