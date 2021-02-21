# SmartAir

<p align="center">
  <img align="center" width="400" height="400" src="https://user-images.githubusercontent.com/37018010/98451913-21eb4100-2153-11eb-88b8-30c2e5afdc4f.png" />
</p>

<br>

### System diagram:

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/37018010/98451856-8f4aa200-2152-11eb-9959-4ac4bd98ad00.png" />
</p>

<br>

### (Outdated)

API-ul poate fi accesat la http://167.71.34.169/api, asa cum este descris in documentatie. Exemplu cu response formatat in powershell:

curl -X GET "http://167.71.34.169/api/devices/sense1/readings" | python3 -m json.tool

sau, acelasi response, dar neformatat:

curl "http://167.71.34.169/api/devices/sense1/readings"

Desigur, functioneaza doar cu curl instalat.

Tips: in powershell, putem executa urmatoarea comanda:

```
.\postmanerator_windows_amd64.exe -collection collection.json --output=collection.html
```

...si voila! Documentatia e generata in format HTML.

## Air-Sense

<p align="center">
    <img align="center" src="https://user-images.githubusercontent.com/37018010/89524779-d2ad1180-d7ed-11ea-88a9-d8086a07f41a.png"/>
</p>

### Short description

Python library for Seeedstudio Grove sensors that monitors air quality factors in real time.

### Prerequisites and instructions

Provided that you have:

- Raspberry PI OS (32-bit)
- the Grove Base Hat attached to it
- MQ2 sensor plugged into analogue port A0
- BME680 sensor plugged into digital port D5
- Red LED button plugged into digital port D16
- Yellow LED button plugged into serial port PWM
- Blue LED button plugged into serial port UART
- UART and PWM enabled
- Bluetooth activated and connected to the speakers

You can follow these instructions:

First, install the official grove library on the Raspberry Pi:

```
curl -sL https://github.com/Seeed-Studio/grove.py/raw/master/install.sh | sudo bash -s -
```

Afterwards, you'll need the latest mqtt client implemented by the paho team :

```
pip3 install paho-mqtt
```

And you're good to go! Just run the main script:

```
python3 main.py
```

Or, in case further access is required:

```
sudo python3 main.py
```

# SmartAir-UI