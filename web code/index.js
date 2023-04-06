const express = require('express')
const app = express()
const port = 3000
const ip = 'yourip'
const path = require('path');
const request = require('request');



let data;
let shortdata;

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(port, () => {
  console.log(`app running on http://${ip}:${port}`)
})

// Static Files
app.use(express.static('public'));
app.use(express.json());




app.get('/data',(req,res) => {

  res.type('json').send(shortdata)

})



const apiUrl = 'your api url';


let updatedata = function(){
  request(apiUrl, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      data = JSON.parse(body)
      shortdata = data.feeds["1"]
      //console.log(shortdata)
    } else {
      console.log(error);
    }
  });

}

setInterval(function(){
  updatedata()
},3000)
