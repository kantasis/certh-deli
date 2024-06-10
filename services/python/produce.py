#!/usr/local/bin/python3

import sys
from kafka import KafkaProducer

message = ' '.join(sys.argv[1:]).encode('utf-8')

# host_ip='192.168.48.4'
host_ip='localhost'
# host_ip='datalake_kafka_container'
host_port='9092'
topic_name='my-topic'
bootstrapServer=f'{host_ip}:{host_port}'

producer = KafkaProducer(
   bootstrap_servers=bootstrapServer,
)

print(f"Sending: {message}")
producer.send(topic_name, message)
producer.flush()
print("message sent")