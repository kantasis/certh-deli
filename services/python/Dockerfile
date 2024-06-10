FROM python:3.11

# Don't use the 3.12 version. It's new and doesn't work well with kafka.
# FROM python:3.12

RUN apt update
RUN apt install netcat-traditional
RUN pip install kafka-python
RUN pip install psycopg2

CMD ["tail", "-f", "/dev/null"]
