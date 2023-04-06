# IOTtempsensor
assignment for elective IOT datascience

This is a tutorial for a small IOT project with 2 parts.
In the first part of this project we will connect a DHT22 temp and humidity sensor to a raspberry pi pico W to upload data to thingsspeak.com.
The second part of this project we will build a small nodejs server to show data, set thresholds and recieve notifications for every device currently on your network. 

Demovideo:

Pipeline :


![pipeline](https://user-images.githubusercontent.com/32331945/230391536-3068e60a-67b2-443f-9216-c25ee96167f3.jpg)




# Needed for this project:
 - Raspberry pi pico W (be sure it's a W version, regular pico does NOT have wifi and will not work)
 - micro usb cable
 - 3 jump wires
 - DHT22 sensor
 - a thingsspeak account
 - thonny

# microcontroller
 
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
 
 Create 2 variable with you ssid and wifi password outside of the mainloop.
 
 
 
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
You can navigate to "API keys" tab and you should see write and read keys. We want to write data to thingsspeak so we need to write key.
We will do that with a JSON object, if you dont know what JSON is you can google it :).
First we will create a JSON header with the following code.

```
#create json header
HTTP_HEADERS = {'Content-Type': 'application/json'} 
```
Put this somewhere above the mainloop.
After that we will create a variable where you can put your API Write key in from earlier. 

```
THINGSPEAK_WRITE_API_KEY = "your key"
```

Put this somewhere above the mainloop aswell.

Now we want to create a JSON body to put the data in.
Our JSON body has only 2 fields and can be created with the following code.
```
dht_readings = {'field1':T, 'field2':H}
```

This goes inside the mainloop after reading the sensor data.
Its finally time to make a write request to the Thingsspeak API.

```
request = urequests.post( 'http://api.thingspeak.com/update?api_key=' + THINGSPEAK_WRITE_API_KEY, json = dht_readings, headers = HTTP_HEADERS )  
request.close() #end of the request
print(dht_readings) #print the json
```

Put this code at the end of you mainloop. Your mainloop should look like this now

```
while True:
    time.sleep(5) #sensor needs 5 second interval
    T,H = dht_sensor.read() #read sensor and put in variables T and H

    if T is None:  #check if sensor reads data 
        print(" sensor error") 
    else:
        print("{}'C  {}%".format(T,H))
    
    dht_readings = {'field1':T, 'field2':H} #put data in json
    request = urequests.post( 'http://api.thingspeak.com/update?api_key=' + THINGSPEAK_WRITE_API_KEY, json = dht_readings, headers = HTTP_HEADERS ) 
    request.close() #end of the request
    print(dht_readings) #print the json

```

Thats it.
Atleast for the Pico W code.

# webapp
The second part of this project involves creating a small Node.js web application to set maximum and minimum thresholds for temperature and humidity. The application will send a notification when the values go beyond or fall below the set thresholds.

First of all be sure you have NODE.JS installed. You can download the installer from https://nodejs.org/en .
If you dont exactly know what NODE.JS is google it :).
Create a folder and open the command line in that folder.
Start with 
```
npm init
```
The command line will ask you a bunch of questions, just say yes to everything.
Next we will install express.
```
npm install express
```
Now we have most things setup to run your own nodejs server on your local network.
The last thing we need to create is an index.js file.
Start the index.js file with including some libraries and and initializing stuff.

```
const express = require('express')
const app = express()
const port = 3000
const ip = 'yourip'
const path = require('path');
const request = require('request');

let data;
let shortdata;
```

We will come back to the ip part later.
The first thing we need is an endpoint.
```
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
})
```
This will make sure your index.html page which we will create later is the page you will land on when opening the webpage.
To start the server we need the next bit of code
```
app.listen(port, () => {
  console.log(`app running on http://${ip}:${port}`)
})
```
This will let the server start on your localhost and your local ip adress so the webpage will be available for all devices on the same network. ONLY the same networks.
Open a new CMD and write ipconfig and then find your ip4adress. Go back to the ip variable earlier and throw it in there.

Next we need to make our server be able to use local javascript files and JSON object.
```
app.use(express.static('public'));
app.use(express.json());
```

Next we create a html page in the root of our project folder.
You can create a test html page yourself if you want or use the one provided. https://github.com/tomdejong2000/IOTtempsensor/blob/main/web%20code/index.html
It wont be functional yet but you should be able to test if the server runs properly.
Start the server by writing in cmd
```
node index.js
```
And click the url in the cmd to open the webpage.

The next step is reading data from Thingsspeak and getting it to the webpage.
Since we are using nodejs we will need to do a few tricks to get data to the frontend of our webpage.
We will create a new endpoint where we will put all the relevant data.

```
app.get('/data',(req,res) => {

  res.type('json').send(shortdata)

})
```
We wil use this endpoint later in our local javascript to read data and put it into html.

```
const apiUrl = 'your api url';


let updatedata = function(){
  request(apiUrl, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      data = JSON.parse(body)
      shortdata = data.feeds["1"]
      
    } else {
      console.log(error);
    }
  });

}
```
This function will read data from the Thingsspeak api. Replace 'your api url' with the "read a channel feed" url on the API keys page on thingsspeak.
Dont forget to add

```
setInterval(function(){
  updatedata()
},3000)
```
So the data will update every 3 seconds.

Restart the server and navigate to the /data endpoint and you should be able to see the data requested.

For the next step you will need to use the provided html page if you didnt already earlier.
https://github.com/tomdejong2000/IOTtempsensor/blob/main/web%20code/index.html
This page has 2 texts which our javascript will overwrite with the data from api and a form with 4 fields to set the thresholds.

In order to do that we will use jquery, if you hate yourself and want to use vanilla javascript Im sure you can find alternative syntax.
Jquery is already included in the index.html provived.
Now make a folder in the root called "public" and create a file local.js inside there. local.js is also linked in the html already.

Start the file with
```
$(document).ready(function(){

})
````
We will put every function inside of this.

Create some variables next

```

    let wishmintemperature = -100
    let wishmaxtemperature = 100
    let wishminhumidity = -100
    let wishmaxhumidity = 100
    
    
    let temperature
    let humidity
```

We set the wish variables very high and low so that if you dont fill anything in the form later it wont trigger comparisons with "0".
Its time to collect the Json data we put into our own endpoint.
```
    let fetchdata = function(){
        fetch('/data').then(response => response.json()).then (jsonD => {

            temperature = jsonD["field1"]
            humidity = jsonD["field2"]

            $(".temp").text(temperature)
            $(".hmd").text(humidity)

            
        });
    }
    
    setInterval(function() {
        fetchdata();
    },100)
```
This function also updates the temp and hmd class in your html and will show updated data on your page now.
In order to set thresholds and compare data we use a html form but not in the traditional way.

```
$('#Form').submit(function(event) {
        event.preventDefault(); // Prevent the form from submitting
        
        if($('#mintemperature').val()){
            wishmintemperature = $('#mintemperature').val();     
        }
        if($('#maxtemperature').val()){
            wishmaxtemperature = $('#maxtemperature').val();     
        }
        
        if($('#minhumidity').val()){
            wishminhumidity = $('#minhumidity').val();     
        }
        if($('#maxhumidity').val()){
            wishmaxhumidity = $('#maxhumidity').val();     
        }
        
        

    });
```

Instead of posting the data we will simply update the data inside the form and collect the numbers inside there and use them in the next function to compare and send a notification.

```

    let comparedata = function(){
        if(temperature < wishmintemperature){
            alert("its too cold")
        }
        if(temperature > wishmaxtemperature){
            alert("its too warm")
        }
        if(humidity < wishminhumidity){
            alert("humidity is too low")
        }
        if(humidity > wishmaxhumidity){
            alert("humidity is too high")
        }
        

    }
    
    setInterval(function() {comparedata();}, 500)
    
```



Restart the server and everything should work.

