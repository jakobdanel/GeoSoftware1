/**
 * @version 1.3.0
 * @author Jakob Danel
 */

"use strict"

/**
 * Options for the Coordinate Request.
 */
var optionsCoordinateRequest = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 1000
};

/**
 * Saving coordinates given by the geolocation requestWeather.
 */
let coordinates = Array();

/**
 * These function gets called, if the position request was successful. It logs the coordinates from the pos object and make the API call for
 * OpenWeatherMap (OWM).
 * @param {GeolocationPosition} pos Passing these argument is wanted by the getCurrentPosition function. It haves information about the position
 * of the device. 
 */
function successPositionRequest(pos) {
    console.log(pos)
    var crd = pos.coords;
    coordinates[0] = crd.longitude;
    coordinates[1] = crd.latitude;

    //builds a link for the API request on OWM.
    let link = linkBuilder(buildLinkObjectWeatherDataRequest(coordinates), [true]);
    requestingWeatherData(link);
}

/**
 * These function gets called if the position reqeusst failing. It will show the error message in the console.
 * @param {Error} err Error Object from getCurrentPosition, which holds information about the type of error.
 */
function errorPositionRequest(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}


/**
 * These function can be used to create an object for the linkBuilder function to make an API request for WeatherData at OpenWeatherMap. Using the
 * coordinates as the only changing variable.
 * @param {number[]} coordinates Contains the coordinates for the request. Should be an array of length two. Coordinates in WGS84 and the format
 * should be [lat,long].
 * @returns An object corrosponding to the conditions of the linkBuilder function. 
 */
function buildLinkObjectWeatherDataRequest(coordinates) {
    return {
        baseURL: "https://api.openweathermap.org/data/2.5/weather",
        mandatory: {
            lat: coordinates[1],
            lon: coordinates[0],
            appid: appid,
        },
        optional: {
            units: "metric"
        }
    }
}
/**
 * Saving the current XHR object for the last XHR request, which was made. For every new XHR request the variable will be overwritten.
 */
var currentXHR;

/**
 * Saving the response of an XHR request as String. Getting overwritten for every new XHR request.
 */
var jsonString;

/**
 * These function can be used to check the state of currentXHR. If the status is equal 200 and the readyState is equal 4, meaning that
 * the request was successfull. These function saving the responseText in jsonString and calling the function saved in successFunction.
 */
function stateChangeCheck() {
    if (currentXHR.status == 200 && currentXHR.readyState == 4) {
        jsonString = currentXHR.responseText;
        successFunction();
    }
}
/**
 * Saving the function which should be called if the XHR request was successfull. Function will be called in stateChangeCheck. At default
 * it is the function parseWeatherData
 */
let successFunction = parseWeatherData;

/**
 * Saving the XMLHttpRequest object for the request of weather data at the OpenWeatherMap API.
 */
let requestWeatherData = new XMLHttpRequest();

/**
 * These function requesting the weather data. First setting the currentXHR to requestWeatherData and the onreadystatechnage function to
 * stateChangeCheck. Than making the request as an asynchronic GET request with the given link. 
 * @param {String} link Should be an URL for the OWM API.
 */
function requestingWeatherData(link) {
    currentXHR = requestWeatherData;
    requestWeatherData.onreadystatechange = stateChangeCheck;

    requestWeatherData.open("GET", link, true);
    requestWeatherData.send();
}

/**
 * These function generates an URL from a given JS object. The JS object should have the following schema: The object must provide an
 * key with name baseURL, with the base URL of the adress. Also it should have a key mandatory, which holds an object, with all attributes for 
 * the request that are mandatory. The mandatory object can only hold keys with single value items, which must be strings. Also their could be an
 * optional key with information about optional parameters. These optional object workss in the same way as the mandatory object with the one exception,
 * that only the keyss which are marked by useOptional are used.
 * @param {any} object The object for generating the link. Conditions are desscribed above.
 * @param {boolean[]} useOptionals An array with booleans. Must have the same length as the optional object keys has. If the n-th index is true, the value and the n-th
 * key will bey used, if false it will be not used.
 * @example Example for the object input:
 *  {
 *     baseURL: "https://1234.de",
 *     mandatory:
 *      {
 *          key1: arg1,
 *          key2: arg2,
 *          key3: arg3
 *      },
 *    optional:
 *      {
 *          key4: arg4,
 *          key5: arg5,
 *      }                
 * } 
 * @returns The generated URL as a String.
 */
function linkBuilder(object, useOptionals) {
    let link = object.baseURL + "?";
    for (let i = 0; i < Object.keys(object.mandatory).length; i++) {
        if (i == 0) {
            let key = Object.keys(object.mandatory)[i];
            link += key + "=" + object.mandatory[key];
        } else {
            let key = Object.keys(object.mandatory)[i];
            link += "&" + key + "=" + object.mandatory[key];
        }
    }
    if (object.optional != undefined) {
        for (let i = 0; i < Object.keys(object.optional).length; i++) {
            if (useOptionals[i]) {
                let key = Object.keys(object.optional)[i];
                link += "&" + key + "=" + object.optional[key];
            }
        }
    }
    return link;
}

/**
 * Generates the URL for the png of the current weather state by the given id.
 * @param {String} iconID The id for the icon, provided by the weatherData 
 * @returns The Url as a Stirng.
 */
function generateIconLink(iconID) {
    return "http://openweathermap.org/img/wn/" + iconID + "@2x.png";
}
/**
 * Saving the response from the OpenWeaterMap API as JSON.
 */
var weatherData;

/**
 * Parsing the weatherData into JSON. Can get called if the weather data request wass successful. Also setting the innerHTML of the div 
 * with id data to the response as an default value, if the conversion into human readable values failures.
 * Here also the DateTime for the current time gets requested, because only at this point, we can get sure that the needed data are 
 * succesfully loaded.
 */
function parseWeatherData() {
    document.getElementById("data").innerHTML = jsonString;
    weatherData = JSON.parse(jsonString);
    requestingDateTime(weatherData.dt + weatherData.timezone, setActualTime);
}

/**
 * These function creating the HTML for the data tag, with the weather stored in weatherDataJSON. The work iss divided in some subfunctions,
 * to make this more clear. Only working with the return of the OpenWeatherMap API. 
 * @param {JSON} weatherDataJSON 
 */
function showData(weatherDataJSON) {
    //Logging the data into the conssole for debugging.
    console.log(weatherDataJSON);
    let htmlText;
    htmlText = generateWeatherDataHTML(htmlText, weatherDataJSON);

    //generate keys for rain and snow (with the point annotation it does not work, I believe because the leading number).
    let key3 = "3h";
    let key1 = "1h";

    generateDummysRainSnow(weatherDataJSON);
    htmlText = generateRainSnowTableHTML(htmlText, weatherDataJSON, key1, key3);

    //Adding Information about sunrise/sunset
    htmlText += generateHTMLContent("p", "Sunrise: " + sunriseTime.Datetime);
    htmlText += generateHTMLContent("p", "Sunset: " + sunsetTime.Datetime);

    //Adding infoss about location
    htmlText += generateHTMLContent("p", weatherDataJSON.sys.country + ", " + weatherDataJSON.name);

    //setting the HTML content into the div Tag.
    let div = document.getElementById("data");
    div.innerHTML = htmlText;

    setupCompass(weatherDataJSON);


}

/**
 * Setting up the compass. Credits to Joshua Carrol. https://github.com/JoshuaCarroll/Compass-/
 *
 * @param {JSON} jsonData The weather data generated by OpenWeatherMap as JSON.
 */
function setupCompass(jsonData) {
    var compass = new Compass("canvasCompass");
    compass.set(1);
    compass.animate(jsonData.wind.deg);
}

/**
 *  Extend the given htmlText by HTML Code with informations about weather, like temperature, humidity etc. Informations gained by jsonData
 * @param {String} htmlText The html Text which will be extended.
 * @param {JSON} jsonData The weather data generated by OpenWeatherMap as JSON.
 * @returns The extended htmlText String. 
 */
function generateWeatherDataHTML(htmlText, jsonData) {
    htmlText += generateHTMLContent("p", "Current time: " + actualTime.Datetime);
    htmlText += generateHTMLContent("h1", "Weather for current position:");
    htmlText += generateHTMLContent("p", "Current Positon: Latitude: " + jsonData.coord.lat + ", Longitude: " + jsonData.coord.lon);
    htmlText += generateHTMLContent("p", "Current weather state: " + jsonData.weather[0].description);
    htmlText += "<img src=" + generateIconLink(jsonData.weather[0].icon) + " />";
    htmlText += generateHTMLContent("p", "Temperature: " + jsonData.main.temp + "C, Feels Like: " + jsonData.main.feels_like + "C");
    htmlText += generateHTMLContent("p", "Temperatures measured from " + jsonData.main.temp_min + "C to " + jsonData.main.temp_max + "C today");
    htmlText += generateHTMLContent("p", "Atmospheric pressure: " + jsonData.main.pressure + "hpa");
    htmlText += generateHTMLContent("p", "Humitidy: " + jsonData.main.humidity + "%");
    htmlText += generateHTMLContent("p", "Visibility is " + jsonData.visibility + " meters.");
    htmlText += generateHTMLContent("p", "Wind speed is " + jsonData.wind.speed + " meter/sec");
    htmlText += generateHTMLContent("p", "Wind direction:");
    htmlText += "<canvas id=\"canvasCompass\" width=\"200\" height=\"200\"></canvas>";
    htmlText += generateHTMLContent("p", "Cloudiness: " + jsonData.clouds.all + "%");
    return htmlText;
}

/**
 * If the JSON object has no rain or snow attribute it initialize dummys for these attributes, so the generateRainSnowTableHTML function can
 * work with it.
 * @param {JSON} jsonData The weather data generated by OpenWeatherMap as JSON.
 */
function generateDummysRainSnow(jsonData) {
    if (jsonData.rain == undefined) {
        jsonData.rain = {
            dummy: -1
        };
    }
    if (jsonData.snow == undefined) {
        jsonData.snow = {
            dummy: -1
        };
    }
}
/**
 * Extend the htmlText with HTML code for a table describing the sow- and rainfall in the past 3 hours.
 * @param {String} htmlText The html Text which will be extended.
 * @param {JSON} jsonData The weather data generated by OpenWeatherMap as JSON.
 * @param {String} key1 Key to access data which are one hour or less old.
 * @param {String} key3 Key to access data which are three hour or less old.
 * @returns The extended htmlText String. 
 */
function generateRainSnowTableHTML(htmlText, jsonData, key1, key3) {
    htmlText += "<table> <tr> <th></th><th>Rain in mm</th><th>Snow in mm</th></tr><tr><td>Last 1h</td>";
    htmlText += generateHTMLContent("td", String(checkIfUndefinedValue(jsonData.rain[key1])));
    htmlText += generateHTMLContent("td", String(checkIfUndefinedValue(jsonData.snow[key1])));
    htmlText += "</tr><tr><td>Last 3h</td>";
    htmlText += generateHTMLContent("td", String(checkIfUndefinedValue(jsonData.rain[key3])));
    htmlText += generateHTMLContent("td", String(checkIfUndefinedValue(jsonData.snow[key3])));
    htmlText += "</table>";
    return htmlText;
}

/**
 * Generate a filled HTML Tag.
 * @param {String} htmlTag The name of the HTML tag. E.g. p or h1.
 * @param {String} innerHTML The text which should be inside the tag. 
 * @returns The HTML code as a String.
 */
function generateHTMLContent(htmlTag, innerHTML) {
    return "<" + htmlTag + ">" + innerHTML + "</" + htmlTag + ">";
}

/**
 * Check if a value is undefined or not, if is undefined replace it with 0.
 * @param {number} value A value which should be checked.
 * @returns 0 if value is undefined else return value.
 */
function checkIfUndefinedValue(value) {
    if (value == undefined) {
        return 0;
    } else {
        return value;
    }
}

/**
 * Generating a link for requesting a time object, from a unix time stamp
 * @param {number} unixTime unixTime as number. 
 * @returns The URL for an API request.
 */
function generateUnixRequestObject(unixTime) {
    return {
        baseURL: "https://showcase.api.linx.twenty57.net/UnixTime/fromunixtimestamp",
        mandatory: {
            unixtimestamp: unixTime
        }
    }
}

/**
 * XHR object for the time request.
 */
let requestTime = new XMLHttpRequest();

/**
 * Saving the time object for the moment of weather data call.
 */
var actualTime;

/**
 * Saving the sunrise date object for that day.
 */
var sunriseTime;

/**
 * Saving the sunset object for that day
 */
var sunsetTime;

/**
 * Requesting via XHR request an DateTime object from a given unix time.
 * @param {number} unix Time stamp in unix which will be requested as Date object.
 * @param {Function} succFunction will be called if the request is successful. 
 */
function requestingDateTime(unix, succFunction) {
    //Setting variables and functions.
    successFunction = succFunction;
    currentXHR = requestTime;
    requestTime.onreadystatechange = stateChangeCheck;

    //request
    requestTime.open("GET", linkBuilder(generateUnixRequestObject(unix, [])), true);
    requestTime.send();
}

/**
 * Setting the actual time object.
 * Calling the sunrise request.
 */
function setActualTime() {
    actualTime = JSON.parse(jsonString);
    requestingDateTime(weatherData.sys.sunrise + weatherData.timezone, setSunriseTime);
}

/**
 * Setting the sunrise object.
 * Calling the sunset object.
 */
function setSunriseTime() {
    sunriseTime = JSON.parse(jsonString);
    requestingDateTime(weatherData.sys.sunset + weatherData.timezone, setSunsetTime);


}

/**
 * Setting the sunset object.
 */
function setSunsetTime() {
    sunsetTime = JSON.parse(jsonString);
    showData(weatherData);
}

//Requesting the position, if it will be successful starting request Weather data and displaying them. 
navigator.geolocation.getCurrentPosition(successPositionRequest, errorPositionRequest, optionsCoordinateRequest);

