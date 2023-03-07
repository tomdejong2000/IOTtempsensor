from machine import Pin, I2C
import urequests 
import utime as time
from PicoDHT22 import PicoDHT22 #sensor 
import network, time
import secret #file with ssid, password and api key

#create json header
HTTP_HEADERS = {'Content-Type': 'application/json'} 
THINGSPEAK_WRITE_API_KEY = secret.key

ssid = secret.ssid
password = secret.password

#initialize sensor with port 17
dht_sensor = PicoDHT22(Pin(17, Pin.OUT, Pin.PULL_DOWN),dht11=True)

#attempt connecting to internet
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)
while wlan.isconnected() == False:
    print('Waiting for connection...')
    time.sleep(1)
ip = wlan.ifconfig()[0]
print(f'Connected on {ip}')


#main loop
while True:
    time.sleep(5) #sensor needs 5 second interval
    T,H = dht_sensor.read() #read sensor and put in variables T and H

    if T is None:  #check if sensor reads data 
        print(" sensor error") 
    else:
        print("{}'C  {}%".format(T,H))
    
    dht_readings = {'field1':T, 'field2':H} #put data in json
    request = urequests.post( 'http://api.thingspeak.com/update?api_key=' + THINGSPEAK_WRITE_API_KEY, json = dht_readings, headers = HTTP_HEADERS )  #api request
    request.close() #end of the request
    print(dht_readings) #print the json
    
