# IOTtempsensor
assignment for elective IOT datascience

This is a tutorial for a small IOT project.
In this project we will connect a DHT22 temp and humidity sensor to a raspberry pi pico W to upload data to thingsspeak.com.

Needed for this project:
 - Raspberry pi pico W (be sure it's a W version, regular pico does NOT have wifi and will not work)
 - micro usb cable
 - 3 jump wires
 - DHT22 sensor
 - a thingsspeak account
 - thonny
 
Be sure your raspberry pi pico w is flashed with micropython.
https://projects.raspberrypi.org/en/projects/get-started-pico-w/1

First we will look at the wiring for this project.

![afbeelding](https://user-images.githubusercontent.com/32331945/223492712-90717580-716d-4fb3-bccb-0ea4415ebeab.png)

Pink: data(sig) -> pin22 gpio(17) (could use different pins but then you will need to change the pin in the code later on)
Red: vcc(3.3v) -> pin33 3.3v
Black: Ground

The DHT22 sensor has 4 pins: Data(sig), NC(not connected), Vcc(3.3Volt), GND(ground). The position are likely to be different depending on the module and version you bought.

Before we write any code we need to download and import some libraries.
Download the picoDHT22.py and upload it to the pico w.

Now we start writing our code.
Make a file called Main.py and start by importing some libraries.

```
from machine import Pin, I2C
import urequests 
import utime as time
from PicoDHT22 import PicoDHT22 #sensor 
import network, time
```

In order to read the data from the sensor we will need to first tell the pico what port the data is coming in.

```
#initialize sensor with port 17
dht_sensor = PicoDHT22(Pin(17, Pin.OUT, Pin.PULL_DOWN),dht11=True)
```

Next we will need a mainloop to keep reading and printing the data.

```
#main loop
while True:
    time.sleep(5) #sensor needs 5 second interval
    T,H = dht_sensor.read() #read sensor and put in variables T and H

    if T is None:  #check if sensor reads data 
        print(" sensor error") 
    else:
        print("{}'C  {}%".format(T,H))
 ```
 
 Now it should print the humidity and temperature after you upload the code.
 
 The next step will be uploading it to thingsspeak.com to visualize it.
 First we will try to make an internet connection with the pico w.
 
 Create 2 variable with you ssid and wifi password out of the mainloop.
 
 
 
```
ssid = ""
password = ""
```

Following with the code to connect to your wifi.

```
#attempt connecting to internet
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)
while wlan.isconnected() == False:
    print('Waiting for connection...')
    time.sleep(1)
ip = wlan.ifconfig()[0]
print(f'Connected on {ip}')
```

Upload and run the code to check if your pico w connects to the wifi.

The last step if sending the sensor data to the thingsspeak API.
Go to thingsspeak.com and create an account.
After you have created an account navigate to "my channels" and create a new channel with 2 fields, 1 for humidity and 1 for temperature you dont need to worry about the rest.

edit
