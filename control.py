import paho.mqtt.client as paho
import time
import sys
import os
import json
import RPi.GPIO as GPIO          
from time import sleep

broker = "167.71.34.169"
port = 1883
sleep_time = 10
in1 = 24
in2 = 23
en = 25
temp1=1

GPIO.setmode(GPIO.BCM)
GPIO.setup(in1,GPIO.OUT)
GPIO.setup(in2,GPIO.OUT)
GPIO.setup(en,GPIO.OUT)
GPIO.output(in1,GPIO.LOW)
GPIO.output(in2,GPIO.LOW)
p=GPIO.PWM(en,1000)
p.start(25)

def on_connect(client, userdata, flags, rc):
    if rc==0:
        print("Connected OK")
        client.connected_flag=True #set flag
        subscribe_to_topics(client)
    else:
        print("Bad connection Returned code=",rc)
        client.bad_connection_flag=True

def on_disconnect(client, userdata, rc):
    print("Disconnecting reason "  + str(rc))
    client.connected_flag=False
    client.disconnect_flag=True

def on_message(client, data, msg):
    print(msg.topic + " " + str(msg.qos))
    print(json.dumps(json.loads(msg.payload.decode()), indent=4, sort_keys=True))
    payload = json.loads(msg.payload.decode())
    if (payload["general"]["temperature"] > 25):
        control_actuator('b')
        print("caz deschide")
    elif (payload["general"]["temperature"] < 10):
        control_actuator('f')
        print("caz inchide")

 
def on_publish(client, data, mid):
    print("mid: "+ str(mid))

def on_subscribe(client, data, mid, granted_qos):
    print("Subscribed: "+ str(mid) + " " + str(granted_qos))

def on_log(client, data, level, string):
    print("log: " + string)

def main():
    username = os.environ["USERNAME"]
    password = os.environ["PASSWORD"]

    print("Control...")

    client = paho.Client(client_id=username)        
    client.username_pw_set(username=username,password=password)                  
    client.connected_flag=False
    client.bad_connection_flag=False

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message
    client.on_publish = on_publish
    client.on_subscribe = on_subscribe
    client.on_log = on_log

    # thread triggers callbacks based on received messages
    client.loop_start()

    print("Connecting to broker",broker)
    try:
        client.connect(broker,port)
    except:
        print("Connection failed")
        exit(1) # Should quit or raise flag to quit or retry

    while not client.connected_flag: # waiting for CONNACK
        print("Waiting for CONNACK...")
        time.sleep(1)

    if client.bad_connection_flag: # established a connection but it's not OK
        client.loop_stop()
        sys.exit()

    while True:
        time.sleep(sleep_time)
        pass
def control_actuator(action):
    if action=='r':
        print("run")
        if(temp1==1):
         GPIO.output(in1,GPIO.HIGH)
         GPIO.output(in2,GPIO.LOW)
         print("forward")
         action='z'
        else:
         GPIO.output(in1,GPIO.LOW)
         GPIO.output(in2,GPIO.HIGH)
         print("backward")
         action='z'


    elif action=='s':
        print("stop")
        GPIO.output(in1,GPIO.LOW)
        GPIO.output(in2,GPIO.LOW)
        action='z'

    elif action=='f':
        print("forward")
        GPIO.output(in1,GPIO.HIGH)
        GPIO.output(in2,GPIO.LOW)
        temp1=1
        action='z'

    elif action=='b':
        print("backward")
        GPIO.output(in1,GPIO.LOW)
        GPIO.output(in2,GPIO.HIGH)
        temp1=0
        action='z'

    elif action=='l':
        print("low")
        p.ChangeDutyCycle(25)
        action='z'

    elif action=='m':
        print("medium")
        p.ChangeDutyCycle(50)
        action='z'

    elif action=='h':
        print("high")
        p.ChangeDutyCycle(75)
        action='z'
     
    
    elif action=='e':
        GPIO.cleanup()
    
    else:
        print("<<<  wrong data  >>>")
        print("please enter the defined data to continue.....")
def subscribe_to_topics(client):
    owners_topic = "users/"
    devices_topic = "devices/"

    owner = os.environ["OWNER"]
    sense_devices = os.environ["SENSE"].split(" ")

    client.subscribe(owners_topic + owner, 0)

    for device in sense_devices:
        client.subscribe(devices_topic + device, 0)

if __name__ == "__main__":
    main()

