FROM ubuntu:latest

RUN apt-get update 
RUN apt-get install nodejs npm -y
RUN apt-get install curl netcat-traditional net-tools -y
RUN apt-get install openssh-server -y

CMD ["tail", "-f", "/dev/null"]
# apt-get update 
# --fix-missing?