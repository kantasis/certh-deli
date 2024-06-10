#!/usr/local/bin/python3


from kafka import KafkaConsumer

host_ip='192.168.48.2'
host_port='2181'
topic_name='my-topic'
bootstrapServer=f'{host_ip}:{host_port}'

consumer = KafkaConsumer(
   topic_name,
   bootstrap_servers=bootstrapServer,
   group_id='my-group'
)

consumer.topics()

try:
   for message in consumer:
      if message:
         print(f"Received message: {message.value.decode('utf-8')}")
except Exception as e:
    print(f"An exception occurred: {e}")
finally:
    consumer.close()
