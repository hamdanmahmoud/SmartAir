from getpass import getpass
import os
import json
import time
import requests
import sense


def main():
    print("/=========================/")
    print("Welcome to the SmartAir ecosystem!")
    time.sleep(1)
    username = input("Device username:")
    password = getpass("Device password:")
    owner = None

    print("/=========================/")

    if (username and password):
        os.environ["USERNAME"] = username
        os.environ["PASSWORD"] = password

        if (owner):
            os.environ["OWNER"] = owner

        sense.main()

    else:
        print('Please provide valid username and password.')


if __name__ == "__main__":
    main()
