"""
Main script that should be run by all devices
"""
from getpass import getpass
import os
import json
import time
import requests


def main():
    print("/=========================/")
    print("Welcome to the SmartAir ecosystem!")
    time.sleep(1)
    username = input("Device username:")
    password = getpass("Device password:")
    device_type = input("Device type (s/c):")
    owner = None
    sense_devices = None
    if (device_type == 'c'):
        import control_test
        owner = input("Owner username:")
        sense_devices = input(
            "Associated sense devices (separated by spaces):")
    elif (device_type == 's'):
        import sense

    print("/=========================/")

    if (username and password and device_type):
        os.environ["USERNAME"] = username
        os.environ["PASSWORD"] = password
        os.environ["TYPE"] = device_type

        if (owner):
            os.environ["OWNER"] = owner

        if (sense_devices):
            os.environ["SENSE"] = sense_devices

        # TODO check if input valid

        if (device_type == 's'):
            sense.main()
        elif (device_type == 'c'):
            control_test.main()
        else:
            print('Type ' + device_type + ' is not valid')

    else:
        print('Provided input is not valid.')


if __name__ == "__main__":
    main()
