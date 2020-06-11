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
in3 = 17
in4 = 27
ena = 25
enb = 26
temp1=1

GPIO.setmode(GPIO.BCM)
GPIO.setup(in1,GPIO.OUT)
GPIO.setup(in2,GPIO.OUT)
GPIO.setup(in3,GPIO.OUT)
GPIO.setup(in4,GPIO.OUT)
GPIO.setup(ena,GPIO.OUT)
GPIO.setup(enb,GPIO.OUT)

GPIO.output(in1,GPIO.LOW)
GPIO.output(in2,GPIO.LOW)
GPIO.output(in3,GPIO.LOW)
GPIO.output(in4,GPIO.LOW)
duty_cicle_actuator=GPIO.PWM(ena,1000)
duty_cicle_sprinkler=GPIO.PWM(enb,1000)
duty_cicle_actuator.start(25)
duty_cicle_sprinkler.start(26)

TEMPERATURE_LIMIT = 30
HUMIDITY_LIMIT = 30
CH4_LIMIT = 30
SMOKE_LIMIT = 30
CO_LIMIT = 30
ACTTION_WINDOW = "close_windows"

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
    global TEMPERATURE_LIMIT 
    global HUMIDITY_LIMIT 
    global CH4_LIMIT 
    global SMOKE_LIMIT 
    global CO_LIMIT 
    global ACTTION_WINDOW 
  
    print("TESTING SUBSCRIBE" + msg.topic + " " + str(msg.qos))
    print(json.dumps(json.loads(msg.payload.decode()), indent=4, sort_keys=True))
    payload = json.loads(msg.payload.decode())
  
    if(payload["message_type"]):
        print(payload["message_type"])
        if(payload["message_type"]=="command"):
            if(payload["command"]["type"]=="change_variable"):
                if(payload["command"]["variable"]=="temperature_limit"):
                    TEMPERATURE_LIMIT = payload["command"]["value"]
                elif (payload["command"]["variable"]=="humidity_limit"): 
                    HUMIDITY_LIMIT = payload["command"]["value"]
                elif (payload["command"]["variable"]=="ch4_limit"): 
                    CH4_LIMIT = payload["command"]["value"]
                elif (payload["command"]["variable"]=="smoke_limit"): 
                    SMOKE_LIMIT = payload["command"]["value"]
                elif (payload["command"]["variable"]=="co_limit"): 
                    CO_LIMIT = payload["command"]["value"]
            elif(payload["command"]["type"]=="take_action"):
                ACTTION_WINDOW = payload["command"]["action"]

    control_data = {
        "temperature_limit": TEMPERATURE_LIMIT,
        "humidity_limit": HUMIDITY_LIMIT,
        "ch4_limit": CH4_LIMIT,
        "smoke_limit": SMOKE_LIMIT,
        "co_limit": CO_LIMIT,
        "action_windows": ACTTION_WINDOW
    }
    if(os.path.exists("test1.conf")):
        values_object = json.dumps(control_data, indent=4)
        with open("test1.conf", "w") as writeData:
            writeData.write(values_object)
        with open('test1.conf', 'r') as readData: 
    # Reading from json file 
            values_object = json.load(readData) 
    else:
        # Serializing json
        values_object = json.dumps(control_data, indent=4)
        # Writing to sample.json
        with open("test1.conf", "w") as writeData:
            writeData.write(values_object)
        with open('test1.conf', 'r') as readData: 
        # Reading from json file 
            values_object = json.load(readData) 
            
    if (values_object["action_windows"] == "open_window"):
#        control_actuator('open')
        print("caz deschide geam")
    elif (values_object["action_windows"] == "close_window"):
#        control_actuator('open')
        print("caz inchide geam")

    if(payload["general"]):
        if (payload["general"]["temperature"] > values_object["temperature_limit"]):
            #control_actuator('open')
            print("caz deschide geam")
        elif (payload["general"]["temperature"] < values_object["temperature_limit"]):
    #        control_actuator('close')
            print("caz inchide geam")

    if(payload["poisonous"]):
        if (payload["poisonous"]["smoke"] > values_object["smoke_limit"]):
    #        control_sprinkler("water")
            print("caz deschide stropitoare")
        elif (payload["poisonous"]["smoke"] < values_object["smoke_limit"]):
    #        control_sprinkler("stop")
            print("caz inchide stropitoare")
        elif (payload["poisonous"]["co"] > values_object["co_limit"]):
    #        control_actuator('open')
            print("caz deschide geam")
        elif (payload["poisonous"]["co"] > values_object["smoke_limit"]):
    #        control_actuator('open')
            print("caz deschide geam")



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
        
def control_sprinkler(action):
    if action =='water':
        GPIO.output(in3,GPIO.HIGH)
        GPIO.output(in4,GPIO.LOW)
        print("Sprinkler is now watering the area")
        action = 'z'
    elif action =='stop':
        GPIO.output(in3,GPIO.LOW)
        GPIO.output(in4,GPIO.LOW)
        print("Sprinkler has stopped watering the area")
        action = 'z'
    elif action == "fast":
        duty_cicle_sprinkler.ChangeDutyCycle(75)
        print("Sprinkler's duty cicle is now FAST")
        action = 'z'
    elif action == "medium":
        duty_cicle_sprinkler.ChangeDutyCycle(50)
        print("Sprinkler's duty cicle is now MEDIUM")
        action = 'z'
    elif action == "low":
        duty_cicle_sprinkler.ChangeDutyCycle(25)
        print("Sprinkler's duty cicle is now LOW")
        action = 'z'
    else:
        GPIO.cleanup()
        print("Unfortunately, an error has occured")
           
def control_actuator(action):
    if action=='r':
        print("run")
        if(temp1==1):
         GPIO.output(in1,GPIO.HIGH)
         GPIO.output(in2,GPIO.LOW)
         print("close")
         action='z'
        else:
         GPIO.output(in1,GPIO.LOW)
         GPIO.output(in2,GPIO.HIGH)
         print("backward")
         action='z'

    elif action=='stop':
        print("stop")
        GPIO.output(in1,GPIO.LOW)
        GPIO.output(in2,GPIO.LOW)
        action='z'

    elif action=='close':
        print("Closing window")
        GPIO.output(in1,GPIO.HIGH)
        GPIO.output(in2,GPIO.LOW)
        temp1=1
        action='z'

    elif action=='open':
        print("Opening window")
        GPIO.output(in1,GPIO.LOW)
        GPIO.output(in2,GPIO.HIGH)
        temp1=0
        action='z'

    elif action=='low':
        print("Actuator's duty cicle is LOW")
        duty_cicle_actuator.ChangeDutyCycle(25)
        action='z'

    elif action=='medium':
        print("Actuator's duty cicle is MEDIUM")
        duty_cicle_actuator.ChangeDutyCycle(50)
        action='z'

    elif action=='high':
        print("Actuator's duty cicle is HIGH")
        duty_cicle_actuator.ChangeDutyCycle(75)
        action='z'
    
    else:
        GPIO.cleanup()
        print("Unfortunately, an error has occured")
        
def subscribe_to_topics(client):
    owners_topic = "users/"
    devices_topic = "devices/"

    username = os.environ["USERNAME"]
    client.subscribe(devices_topic + username, 0)

    owner = os.environ["OWNER"]
    sense_devices = os.environ["SENSE"].split(" ")

    client.subscribe(owners_topic + owner, 0)

    for device in sense_devices:
        client.subscribe(devices_topic + device, 0)

if __name__ == "__main__":
    main()




