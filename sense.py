from grove.gpio import GPIO
from grove.adc import ADC
from grove.button import Button
from grove.factory import Factory
from subprocess import call
import bme680 as bm
import paho.mqtt.client as paho
import sys
import os
import simplejson
import time
import math
import mraa

broker = "167.71.34.169"
port = 9001
sleep_time = 3

LANGUAGE = "en"
# LANGUAGE = "fr"

SMOKE_LIMIT = 100
GAS_LIMIT = 100
CO_LIMIT = 100

RL_VALUE = 5

GAS_CH4 = 0
GAS_CO = 1
GAS_SMOKE = 2

# LPGCurve  =  [2.3,0.21,-0.47]
CH4Curve = [2.3, 0.47, -0.36]
COCurve = [2.3,0.72,-0.34]
SmokeCurve = [2.3,0.53,-0.44]

Ro = 10

DIGITAL_INPUT_PIN = 5
DIGITAL_OUTPUT_PIN = 16
PWM_PIN = 12
UART_PIN = 14
ANALOG_PIN = 0

class GroveGasSensorMQ2:
    def __init__(self, channel):
        self.channel = channel
        self.adc = ADC()

    @property
    def MQ2(self):
        value = self.adc.read_raw(self.channel)
        return value

def MQResistanceCalculation(raw_adc):
    return RL_VALUE*(4095-raw_adc)/raw_adc

def MQGetGasPercentage(rs_ro_ratio, gas_id):
    if (gas_id == GAS_CH4):
        return MQGetPercentage(rs_ro_ratio, CH4Curve)
    elif (gas_id == GAS_CO):
        return MQGetPercentage(rs_ro_ratio, COCurve)
    elif (gas_id == GAS_SMOKE):
        return MQGetPercentage(rs_ro_ratio, SmokeCurve)

    return 0

def MQGetPercentage(rs_ro_ratio, pcurve):
    return pow(10, (((math.log(rs_ro_ratio,10)-pcurve[1])/pcurve[2])+pcurve[0]))

class GroveBME680Sensor(object):
    def __init__(self):
        snr = bm.BME680(bm.I2C_ADDR_PRIMARY)

        # over sample, make data more accuracy
        snr.set_humidity_oversample(bm.OS_2X)
        snr.set_pressure_oversample(bm.OS_4X)
        snr.set_temperature_oversample(bm.OS_8X)
        snr.set_filter(bm.FILTER_SIZE_3)
        snr.set_gas_status(bm.ENABLE_GAS_MEAS)

        # profile # 0
        snr.set_gas_heater_temperature(320)
        snr.set_gas_heater_duration(150)
        snr.select_gas_heater_profile(0)

        # profile # 1
        # snr.set_gas_heater_profile(200, 150, nb_profile=1)
        # snr.select_gas_heater_profile(1)

        # Initial reading
        snr.get_sensor_data()
        snr.get_sensor_data()
        snr.get_sensor_data()

        self.snr = snr

    def read(self):
        if self.snr.get_sensor_data():
            return self.snr.data
        return None

def getCH4(mq2Reading):
    return MQGetGasPercentage(MQResistanceCalculation(mq2Reading)/Ro,GAS_CH4)

def getCO(mq2Reading):
    return MQGetGasPercentage(MQResistanceCalculation(mq2Reading)/Ro,GAS_CO)

def getSmoke(mq2Reading):
    return MQGetGasPercentage(MQResistanceCalculation(mq2Reading)/Ro,GAS_SMOKE)

def getTemperature(bme680Reading):
    return bme680Reading.temperature

def getPressure(bme680Reading):
    return bme680Reading.pressure

def getHumidity(bme680Reading):
    return bme680Reading.humidity

def getGasResistance(bme680Reading):
    return bme680Reading.gas_resistance

def isVibrating(value):
    return not value

def getIAQ(gasResistance, humidity):
    return math.log(gasResistance, 10) + 0.04*humidity

def sampleSensorsData(MQ2Sensor, BME680Sensor):
    sumCH4 = 0
    sumCO = 0
    sumSmoke = 0
    sumTemperature = 0
    sumHumidity = 0
    sumPressure = 0
    sumGasResistance = 0

    for i in range(0, 10):
        mq2Reading = MQ2Sensor.MQ2
        bme680Reading = BME680Sensor.read()

        sumCH4 = sumCH4 + getCH4(mq2Reading)
        sumCO = sumCO + getCO(mq2Reading)
        sumSmoke = sumSmoke + getSmoke(mq2Reading)

        if bme680Reading:
            sumTemperature = sumTemperature + getTemperature(bme680Reading)
            sumHumidity = sumHumidity + getHumidity(bme680Reading)
            sumPressure = sumPressure + getPressure(bme680Reading)
            if bme680Reading.heat_stable:
                sumGasResistance = sumGasResistance + getGasResistance(bme680Reading)
        time.sleep(0.1)


    CH4 = sumCH4/10
    CO = sumCO/10
    Smoke = sumSmoke/10
    Temperature = sumTemperature/10
    Humidity = sumHumidity/10
    Pressure = sumPressure/10
    GasResistance = sumGasResistance/10

    sensorsData = {
        "CH4": CH4,
        "CO": CO,
        "Smoke": Smoke,
        "Temperature": Temperature,
        "Humidity": Humidity,
        "Pressure": Pressure,
        "GasResistance": GasResistance
    }

    return sensorsData

class GroveSW420Sensor():
    def __init__(self, channel):
        self.channel = channel
        self.sensor = GPIO(channel, GPIO.IN)

    def read(self):
        return self.sensor.read()

class DigitalLedButton(object):
    '''
    Grove Red/Yellow/Blue Led Button class
    all of them has a gpio button with low valid level of pressing,
    and a gpio led with high valid level for lighting.
    Args:
        pin(int): the number of gpio/slot your grove device connected.
    '''
    def __init__(self, pin, invert_pins=False):
        output_pin = pin
        input_pin = pin + 1
        if (invert_pins):
            output_pin, input_pin = input_pin, output_pin

        # High = light on
        self.led = Factory.getOneLed("GPIO-HIGH", output_pin)
        # Low = pressed
        self.__btn = Factory.getButton("GPIO-LOW", input_pin)
        self.__on_event = None
        self.__btn.on_event(self, DigitalLedButton.__handle_event)

    @property
    def on_event(self):
        '''
        Property access with
            callback -- a callable function/object,
                        will be called when there is button event
            callback prototype:
                callback(index, code, time)
            callback argument:
                Args:
                    index(int): button index, be in 0 to [button count - 1]
                    code (int): bits combination of
                              -  Button.EV_LEVEL_CHANGED
                              -  Button.EV_SINGLE_CLICK
                              -  Button.EV_DOUBLE_CLICK
                              -  Button.EV_LONG_PRESS
                    time(time): event generation time
                Returns: none
        Examples:
            set
            .. code-block:: python
                obj.on_event = callback
            get
            .. code-block:: python
                callobj = obj.on_event
        '''
        return self.__on_event

    @on_event.setter
    def on_event(self, callback):
        if not callable(callback):
            return
        self.__on_event = callback

    def __handle_event(self, evt):
        # print("event index:{} event:{} pressed:{}"
        #       .format(evt['index'], evt['code'], evt['presesed']))
        if callable(self.__on_event):
            # the customized behavior
            self.__on_event(evt['index'], evt['code'], evt['time'])
            return

        # the default behavior
        self.led.brightness = self.led.MAX_BRIGHT
        event = evt['code']
        if event & Button.EV_SINGLE_CLICK:
            self.led.light(True)
            print("turn on  LED")
        elif event & Button.EV_DOUBLE_CLICK:
            self.led.blink()
            print("blink    LED")
        elif event & Button.EV_LONG_PRESS:
            self.led.light(False)
            print("turn off LED")

def get_path_from_action(action):
    if (action == "attention"):
        return "wav_files/" + LANGUAGE + "/attention.wav"
    elif (action == "co"):
        return "wav_files/" + LANGUAGE + "/co.wav"
    elif (action == "gas"):
        return "wav_files/" + LANGUAGE + "/gas.wav"
    elif (action == "smoke"):
        return "wav_files/" + LANGUAGE + "/smoke.wav"
    elif (action == "earthquake"):
        return "wav_files/" + LANGUAGE + "/earthquake.wav"
    elif (action == "opening_windows"):
        return "wav_files/" + LANGUAGE + "/opening_windows.wav"
    elif (action == "closing_windows"):
        return "wav_files/" + LANGUAGE + "/closing_windows.wav"
    elif (action == "cover_yourself"):
        return "wav_files/" + LANGUAGE + "/cover_yourself.py"

def play_sound(action):
    call(["aplay", get_path_from_action(action)])

def warn_if_necessary(data):
    co = data["poisonous"]["co"]
    smoke = data["poisonous"]["smoke"]
    gas = data["poisonous"]["ch4"]
    vibration = data["hazardous"]["vibration"]

    if (smoke > SMOKE_LIMIT):
        play_sound("attention")
        play_sound("smoke")
        play_sound("closing_windows")
    elif (co > CO_LIMIT):
        play_sound("attention")
        play_sound("co")
        play_sound("opening_windows")
    elif (gas > GAS_LIMIT):
        play_sound("attention")
        play_sound("gas")
        play_sound("opening_windows")
    if (vibration == True):
        play_sound("attention")
        play_sound("earthquake")
        play_sound("cover_yourself")

def on_connect(client, userdata, flags, rc):
    if rc==0:
        print("Connected OK")
        client.connected_flag=True #set flag
    else:
        print("Bad connection Returned code=",rc)
        client.bad_connection_flag=True

def on_disconnect(client, userdata, rc):
    print("Disconnecting reason "  + str(rc))
    client.connected_flag=False
    client.disconnect_flag=True

def on_message(client, data, msg):
    print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))

def on_publish(client, data, mid):
    print("mid: "+ str(mid))

def on_subscribe(client, data, mid, granted_qos):
    print("Subscribed: "+ str(mid) + " " + str(granted_qos))

def on_log(client, data, level, string):
    print("log: " + string)

def main():
    MQ2Sensor = GroveGasSensorMQ2(ANALOG_PIN)
    BME680Sensor = GroveBME680Sensor()
    SW420Sensor =  GroveSW420Sensor(DIGITAL_INPUT_PIN)
    redButton = DigitalLedButton(DIGITAL_OUTPUT_PIN)
    yellowButton = DigitalLedButton(PWM_PIN)
    blueButton = DigitalLedButton(UART_PIN, True)

    username = os.environ["USERNAME"]
    password = os.environ["PASSWORD"]
    topic = "devices/" + username
    print("Sensing...")

    client = paho.Client(client_id=username, transport="websockets")
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
    except e:
        print("Connection failed", e)
        exit(1) # Should quit or raise flag to quit or retry

    while not client.connected_flag: # waiting for CONNACK
        print("Waiting for CONNACK...")
        time.sleep(1)

    if client.bad_connection_flag: # established a connection but it's not OK
        client.loop_stop()
        sys.exit()

    # TODO subscribe to user control topics or something
    while (True):
        sensorsData = sampleSensorsData(MQ2Sensor, BME680Sensor)
        IAQ = getIAQ(sensorsData["GasResistance"], sensorsData["Humidity"])
        sw420Reading = SW420Sensor.read()

        print('CH4 value: {0} ppm'.format(sensorsData["CH4"]))
        print('CO value: {0} ppm'.format(sensorsData["CO"]))
        print('SMOKE value: {0} ppm'.format(sensorsData["Smoke"]))
        print('Temperature value: {0:.2f} C'.format(sensorsData["Temperature"]))
        print('Pressure value: {0:.2f} hPa'.format(sensorsData["Pressure"]))
        print('Humidity value: {0:.2f} %RH'.format(sensorsData["Humidity"]))
        print('Indoor Air Quality: {0} '.format(IAQ))
        print ('Vibration: {0}'.format(isVibrating(sw420Reading)))
        print ("#####################################")

        # defining a params dict for the parameters to be sent to the API
        data = {
            'general': {
                'temperature': sensorsData["Temperature"],
                'pressure': sensorsData["Pressure"],
                'humidity': sensorsData["Humidity"]
            },
            'hazardous': {
                'vibration': isVibrating(sw420Reading)
            },
            'poisonous': {
                'smoke': sensorsData["Smoke"],
                'co': sensorsData["CO"],
                'ch4': sensorsData["CH4"]
            }
        }

        warn_if_necessary(simplejson.loads(simplejson.dumps(data)))

        ret = client.publish(topic,simplejson.dumps(data), 2)
        time.sleep(sleep_time)


if __name__ == "__main__":
    main()

