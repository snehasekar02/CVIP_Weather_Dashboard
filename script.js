
//Declare a variable to store the searched city
var city="";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");
var currentPressure = $("#pressure")
var currentSunrise = $("#sunrise")
var currentSunset = $("#sunset")
var sCity=[];
// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up the API key
var APIKey="a0aca8a89948154a4182dcecc780b513";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // parse the response to display the current weather including the City name. the Date and the weather icon. 
        console.log(response);
        //Dta object from server side Api for icon property.
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name + "<img src="+iconurl+">");
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        // Display the Humidity
        $(currentHumidty).html(response.main.humidity+"%");
        //Display Wind speed and convert to MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");

        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }
        if (response.main && response.main.pressure) {
            $(currentPressure).html(response.main.pressure + " hPa");
        } else {
            $(currentPressure).html("N/A");
        }
        
        if (response.sys && response.sys.sunrise) {
            var sunriseTime = new Date(response.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            $(currentSunrise).html(sunriseTime);
        } else {
            $(currentSunrise).html("N/A");
        }
        
        if (response.sys && response.sys.sunset) {
            var sunsetTime = new Date(response.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            $(currentSunset).html(sunsetTime);
        } else {
            $(currentSunset).html("N/A");
        }

    });
}
    // This function returns the UVIindex response.
function UVIndex(ln,lt){
    //lets build the url for uvindex.
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);
            });
}
    
// Here we display the 5 days forecast for the current city.
function forecast(cityid){
    var dayover= false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (var i = 0; i < 5; i++) { // Loop for next 5 days
            var dateIndex = i * 8; // Incrementing by 8 to get data for each day
            var dateObj = new Date((response.list[dateIndex].dt) * 1000);
            var options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }; // Include 'year' in options
            var date = dateObj.toLocaleDateString('en-US', options);
            var iconcode = response.list[dateIndex].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[dateIndex].main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[dateIndex].main.humidity;
        
            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconurl + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }
        
        
    });
}

//Daynamically add the passed city on the search history
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadlastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);


// Assuming you have a function to get the current date
function getCurrentDate() {
    var today = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
}

// Get the current date and update the HTML
var currentDateElement = document.getElementById('current-date');
currentDateElement.textContent = getCurrentDate();



















