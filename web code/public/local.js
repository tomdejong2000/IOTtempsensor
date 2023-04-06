
$(document).ready(function(){

    let wishmintemperature = -100
    let wishmaxtemperature = 100
    let wishminhumidity = -100
    let wishmaxhumidity = 100
    
    
    let temperature
    let humidity

    


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


});
