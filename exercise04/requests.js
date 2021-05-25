/**
 * These file is mentioned to store classses, which can be ussed for API requests.
 * @author Jakob Danel
 * @version 1.4.0
 * @since 1.4.0
 */

/**
 * Empty function, which get no input parameters, do nothing and return nothing, used as default parameter.
 */
let voidFunction = function () { };

/**
 * These class is used to make an request on the current position. These classs has a function as variable, which will be called after the data
 * loaded successfully. It is possibly to pass arguments to these function.
 * @class 
 */
class RequestPosition {

    /**
     * 
     * @param {Function} processingFunction these function will be called after the position has been determined. Arguments for these functions
     * can be passed within args. These function cannot have an return value. By default voidFunction. 
     * @param {any[]} args Passing arguments for the processingFunction. Must be stored as Array. processsingFunction will use the as an Array.
     * By default an empty Array. 
     */
    constructor(processingFunction = voidFunction, args = []) {
        //setting options for the position request.
        this.options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 1000
        };

        //Setting the arguments.
        this.processingFunction = processingFunction;
        this.args = args;

        //Saving the object in a static way, for later using.
        RequestPosition.lastObj = this;
    }

    /**
     * Starting the request of the data.
     */
    request() {
        navigator.geolocation.getCurrentPosition(RequestPosition.success, RequestPosition.error, this.options);

    }
    /**
     * THESE FUNCTION GETS CALLED BY REQUEST. DONT CALL IT YOURSELVE!!!
     * If the requesst was successfull, these function gets called. It calls the processingFunction, by passing a Coordinate object with the
     * current coordinates and then the args.
     * @param {GeolocationPosition} pos an object hold information about the position. 
     */
    static success(pos) {
        console.log(pos);
        RequestPosition.lastObj.processingFunction(new Coordinate(pos.coords.latitude, pos.coords.longitude), RequestPosition.lastObj.args);

    }
    /**
     * THESE FUNCTION GETS CALLED BY REQUEST. DONT CALL IT YOURSELVE!!!
     * These function gets called if an error occured. Just logging the error into the console.
     * @param {GeolocationPositionError} err Holding information about the error. 
     */
    static error(err) {
        console.error(err);
    }



}

/**
 * Super class, for all jquery request classes. Is useless if this class will iniatilized themselve. Only used as constructor, for the different
 * use cases. Dont have any methods, only constructs, the requestObj and the logic, for cases of success and fail.
 * @class
 */
class JQueryRequest {

    /**
     * 
     * @param {Function} processingFunction The function will be called if the request was successful. As first argument it gets the loaded
     * data in the format of String. As second argument the parameter passed with args, which be stored as an Array. As default function the 
     * voidFunction is used.
     * @param {any[]} args Arguments will be used in the processsingFunction. Must be stored in an Array. By default an empty array is used.
     * @constructor
     */
    constructor(processingFunction = voidFunction, args = []) {

        //Setup arguments
        this.processingFunction = processingFunction;
        this.args = args;

    }


}
/**
 * These class is made to make weather requests. Needed is a geographical position and function, which will be called if the requesst was
 * successful. Uses the OpenWeatherMap (OWM) API. See https://openweathermap.org/ for further information.
 * @class
 * @extends {JQueryRequest}
 */
class RequestWeatherData extends JQueryRequest {

    /**
     * 
     * @param {Coordinate} coordinates The coordinates, for which the weather data request, will be made.
     * @param {Function} processingFunction The function will be called if the request was successful. As first argument it gets the loaded
     * data in the format of String. As second argument the parameter passed with args, which be stored as an Array. As default function the 
     * voidFunction is used.
     * @param {any[]} args Arguments will be used in the processsingFunction. Must be stored in an Array. By default an empty array is used.
     * @constructor
     */
    constructor(coordinates, processingFunction = voidFunction, args = []) {

        super(processingFunction, args);

        //Setting the given parameters.
        this.coordinates = coordinates;


    }

    /**
     * By calling these function, the request will be made. First build up a link to make the API request on OpenWeatherMap, then send the
     * request to the URL. If the request was successful, the processingFunction will be called.
     */
    request() {
        let obj = this;
        $.ajax({
            url: linkBuilder(buildLinkObjectWeatherDataRequest([obj.coordinates.longitude, obj.coordinates.latitude]), [true]),
            type: "GET"
        }).done(function (data) { console.log(data); obj.processingFunction(data, obj.args) })
            .fail(function (error) { alert(error) });
    }

}

/**
 * These class is used to make requests, on a Datetime object, by a given unix time. For these an API is used. Further information to the API:
 * https://unixtime.co.za/ 
 * @class
 * @extends {JQueryRequest}
 */
class RequestDateTime extends JQueryRequest {

    /**
     * 
     * @param {number} unixTimeStamp a unix time as an Integer. 
     * @param {Function} processingFunction The function will be called if the request was successful. As first argument it gets the loaded
     * data in the format of String. As second argument the parameter passed with args, which be stored as an Array. As default function the 
     * voidFunction is used.
     * @param {any[]} args Arguments will be used in the processsingFunction. Must be stored in an Array. By default an empty array is used.
     * @constructor
     */
    constructor(unixTimeStamp, processingFunction = voidFunction, args = []) {

        super(processingFunction, args);
        //Setup parameters
        this.unixTimeStamp = unixTimeStamp;

    }
    /** 
    * By calling these function, the request will be made. First build up a link to make the API request on https://unixtime.co.za/, then send the
    * request to the URL. If the request was successful, the processingFunction will be called.
    */
    request() {
        let obj = this;
        $.ajax({
            url: linkBuilder(generateUnixRequestObject(obj.unixTimeStamp)),
            type: "GET"
        }).done(function (data) { obj.processingFunction(data, obj.args) })
            .fail(function (error) { alert(error) });
    }
}

