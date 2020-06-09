Provided that you have Raspberry PI OS (32-bit), follow these instructions:

First, install the grove library:

```
curl -sL https://github.com/Seeed-Studio/grove.py/raw/master/install.sh | sudo bash -s -
```

Afterwards, you'll need the latest mqtt client implemented by the paho team:

```
pip3 install paho-mqtt
```

And you're good to go! Just run the main script:

```
python3 smartair.py
```

Or, in case further access is required:

```
sudo python3 smartair.py
```
