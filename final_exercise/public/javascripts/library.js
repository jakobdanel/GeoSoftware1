/**
 * @author Jan Hoping, Jakob Danel
 */
/**
 * @class
 * These class represent a geographic coordinates, with his values Latitude and Longitude.
 */
class LatLng {

    /**
     * 
     * @constructor
     * @param {Number} lat The Latitude of the coordinate 
     * @param {Number} lng The Longitude of the coordinate
     * @throws Lat or Long are out of Bounds if theyare not in the given boundarys by the definition of the coordinate sysstem
     */
    constructor(lat, lng) {
        if (lat < -180 || lat > 180 || lng < -90 || lng > 90) {
            throwLatLngException("Lat or Lng are out of Bounds", lat, lng);
        } else {
            this.lat = lat;
            this.lng = lng;
        }
    }

    /**
     * Convertes coordinate into Array.
     * @returns {Number[]} The coordinate as Array.
     */
    toArray() {
        return [this.lat, this.lng];
    }

    /**
     * Convertes coordinate to String.
     * @returns {String} The coordinate as String.
     */
    toString() {
        return `(${this.lat},${this.lng})`;
    }
}

/**
 * These function throws an error with the given type.
 * @param {String} type Describe the error which is occured.
 * @param {Number} lat Provides the given Latitude.
 * @param {Number} lng Provides the given Longitude.
 */
function throwLatLngException(type, lat, lng) {
    throw ({
        type: type,
        coordinates: {
            lat: lat,
            lng: lng
        }
    })
}

/**
 * These class represent an Leaflet TileLayer which providing data from the MapBox API
 * @class
 */
class MapBoxTileLayer {

    /**
     * @constructor
     * @param {String} baseUrl API Url for MapBox 
     * @param {String} key API Key for MapBox
     * @param {Object} options Further options for the API structured in the form of MapBox specification. 
     */
    constructor(baseUrl = mapBoxBaseURL, key = mapBoxKey, options = mapBoxOptions) {
        this.baseUrl = baseUrl;
        this.key = key;
        this.options = options;
    }
}

/**
 * The Key for the mapBox API.
 */
const mapBoxKey = 'pk.eyJ1IjoiamFrb2JkYW5lbCIsImEiOiJja2U4aWoyc2QwamVoMnZweHQwM2ttd2hzIn0.bvTiYy0I-JRO0byQm5wZLg';

/**
 * The base URL for the mapBox API.
 */
const mapBoxBaseURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

/*
 * The options for the mapBox API containing information about attribution, maxZoom, id, tileSize, zoomOffset and the accessToken  
 */
const mapBoxOptions = {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapBoxKey
};

const mapBoxTileLayer_ = new MapBoxTileLayer();
/**
 * These class represent a Leaflet Map Object and his additional informations.
 * @class
 */
class Map {

    /**
     * Assigning the variables and initialize a Leaflet map.
     * @constructor
     * @param {String} divId The id of the HTML-Tag which holding the object in the DOM-Tree
     * @param {LatLng} latLng The coordinates, to which the map will be centered.
     * @param {Number} zoomLvl The starting zoom level of the map.
     */
    constructor(divId = "map", latLng = new LatLng(51.943, 7.62), zoomLvl = 14) {
        this.divId = divId;
        this.latlng = latLng;
        this.zoomLvl = zoomLvl;
        try {
            this.map = L.map(this.divId).setView([this.latlng.lat, this.latlng.lng], zoomLvl);
        } catch (error) {
            console.log(error);
        }
        this.gridLayers = [];
        this.layers = new L.FeatureGroup();
    }

    /**
     * This method adds a TileLayer to the map. 
     * @param {MapBoxTileLayer} mapBoxTileLayer The object representing the tileLayer
     */
    addTileLayer(mapBoxTileLayer = mapBoxTileLayer_) {
        let tileLayer = L.tileLayer(mapBoxTileLayer.baseUrl, mapBoxTileLayer.options).addTo(this.map);
        this.gridLayers.push(tileLayer);
    }

    /**
     * Creating an empty FeaturreGroup add them to the map and return the FeatureGroup.
     * @returns {L.FeatureGroup} the created FeatureGroup
     */
    addFeatureGroup() {
        let featureGroup = new L.FeatureGroup();
        this.map.addLayer(featureGroup);
        return featureGroup;
    }

    /**
     * Adding a new Layer to the map with data from the geojson
     * @param {JSON} geojson A GJSON formatted object, which will be added to the map. 
     * @returns {L.Layer} The Layer which is added to the map.
     */
    addGeoJson(geojson) {
        let json = L.geoJson(geojson);
        json.addTo(this.map);
        this.layers.addLayer(json);
        //this.allLayers.addLayer(json);
        return json;
    }

    /**
     * These function binding a popup to the Layer, with the given Content. 
     * @param {L.Layer} layer The layer to which the popup should be added.
     * @param {HTMLElement} content The content of the popup.
     */
    bindPopup(layer, content) {
        layer.bindPopup(content).addTo(this.map);
    }

    /**
     * Adding a Control to the map
     * @param {L.Control} control The Control which will be added
     */
    addControl(control) {
        this.map.addControl(control);
    }

    /**
     * Adding an EventListener to the map.
     * @param {String} eventName The event for which the callBackFunction should be fired.
     * @param {Function} callBackFunction The function which will be called at every event.
     */
    addEventListener(eventName, callBackFunction) {
        this.map.on(eventName, callBackFunction);
    }

    /**
     * These function adding all Poi Data to the Map, by first loading them and then displaying them to the map.
     * Also adding a Popup to the Layers with information about the name.
     */
    async addAllPoiData() {
        let layers = [];
        let response = await getAllPois();
        for (let i = 0; i < response.length; i++) {
            if (response[i].geometry.type == "Point") {
                response[i].geometry.coordinates = response[i].geometry.coordinates[0][0];
            }
            let layer = this.addGeoJson(response[i]);
            this.layers.addLayer(layer);
            this.bindPopup(layer, "<div class=popup>" + response[i].properties.name + '</div>');
            layers.push({
                geojson: response[i],
                layer: layer
            });
        }
        return layers;
    }

    /**
     * Adding one Poi Layer to the map, characterized by the parameter id 
     * @param {String} id The MongoDB id of the Poi which should be added
     */
    async addOnePoi(id) {
        let response = await getOnePoi(id);
        if (response.geometry.type == "Point") {
            response.geometry.coordinates = response.geometry.coordinates[0][0];
        }
        let layer = this.addGeoJson(response);
        this.bindPopup(layer, `<button id=${response._id} onclick=addBusStation('${response._id}')>Show next bus station</button>`);
        this.layers.addLayer(layer);
    }

    /**
     * Adding one Tour Layer to the map, characterized by the parameter id 
     * @param {String} id The MongoDB id of the Tour which should be added
     */
    async addTourData(tourID) {
        let response = await getOneTour(tourID);
        for (let i = 0; i < response.pois.length; i++) {
            const element = response.pois[i];
            console.log(element);
            if (element.geometry.type == "Point") {
                response.pois[i].geometry.coordinates = element.geometry.coordinates[0][0];
            }
            let layer = this.addGeoJson(response.pois[i]);
            this.bindPopup(layer, `<button id=${response.pois[i]._id} onclick=addBusStation('${response.pois[i]._id}')>Show next bus station</button>`);
            this.layers.addLayer(layer);
        };
    }

    /**
     * Adding all bus stations as Marker to the map and bind a popup with the name of the busstation
     */
    async addBusData() {
        let response = await getBusData();
        for (let i = 0; i < response.features.length; i++) {
            let layer = this.addGeoJson(response.features[i]);
            this.layers.addLayer(layer);
            this.bindPopup(layer, response.features[i].properties.lbez);

        }
    }

    /**
     * Remove all Layers from the map.
     */
    clear() {
        const mapBoxTileLayer = mapBoxTileLayer_;
        this.map.eachLayer((layer) => {
            this.map.removeLayer(layer);
        });
        this.layers = new L.FeatureGroup();
        this.addTileLayer(mapBoxTileLayer);
    }
}

/**
 * These function adding a marker with the nearest bus station to the given poi to the map using the function calculateNextBusStation 
 * @param {String} id The id of the poi which should be used.
 */
async function addBusStation(id) {
    let poi = await getOnePoi(id);
    await calculateNextBusStation(poi.geometry.coordinates, poi.geometry.type == "Polygon");
}

/**
 * These function searching for the nearest buss station to the given coordinate and requesting weather data from the server to display 
 * these weather data inside a popup
 * @param {Number[]} coordinates The coordinates of the poi
 * @param {Boolean} isPolygon indicates if the coordinates represent a Polygon or not
 */
async function calculateNextBusStation(coordinates, isPolygon) {
    //If the coordinates are from a Polygon calculating a Centroid via turf
    if (isPolygon) {
        var polygon = turf.polygon(coordinates);

        coordinates = turf.centroid(polygon);
        coordinates = coordinates.geometry.coordinates;
    } else {
        //Restructuring Point data
        coordinates = coordinates[0][0];
    }
    let busStations = await getBusData();
    
    // Holding the min distance is set to a high value for beginning
    let minDistance = 10000000000;
    //Holding the station with the actual minimal distance
    let minStation = null;
    //Looping over all Stations 
    for (let i = 0; i < busStations.features.length; i++) {
        const element = busStations.features[i].geometry.coordinates;
        let distance = distanceInMeter(element, coordinates);
        //If the distance is sshorter replacing the minStation
        if (distance < minDistance) {
            minDistance = distance;
            minStation = busStations.features[i];
        }

    }
    //Get the weather data
    let weatherData = await getWeatherData(minStation.geometry.coordinates);
    var location = minStation.properties.lbez;
    var sky = weatherData.weather[0].description
    var temperatur = (weatherData.main.temp) - 273
    var windspeed = weatherData.wind.speed
    //Ouput Marker
    let layer = L.geoJson(minStation);
    map.map.addLayer(layer);
    layer.bindPopup("<div class=popup>Ort: " + location + '<br>' + "Himmel: " + sky + '<br>' + "Temperatur: " + temperatur + '<br>' + "Windgeschwindigkeit: " + windspeed + " </div>");

}
/**
 * These function takes two geographic points and returns the distance between them. The function uses the Haversine formula for calculation.
 * @param {number[]} p1 A point should be in the form [long,lat] in WGS84. 
 * @param {number[]} p2 A point should be in the form [long,lat] in WGS84.
 * @returns The distance between the two points in meters.
 */
function distanceInMeter(p1, p2) {
    let R = 6371; // Radius of the earth in km
    var dLat = degree2Radian(p2[1] - p1[1]);
    var dLon = degree2Radian(p2[0] - p1[0]);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degree2Radian(p1[1])) * Math.cos(degree2Radian(p2[1])) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; //In Meters
}
/**
 * These function convert an degree value into a radian value.
 * @param {number} degree The degree which should be taken to radian. 
 * @returns The radian value.
 */
function degree2Radian(degree) {
    return degree * (Math.PI / 180)
}

/**
 * These function making an ajax get request to get all Poi data and returning them.
 * @async
 * @returns {Object} All Pois.
 */
async function getAllPois() {
    return pois = await $.ajax({
        url: "../inputPOI",
        type: "GET"
    });

}
/**
 * These function making an ajax POST request to get all Weather data for the coordinates and returning them.
 * @async
 * @param {Number[]} coordinates For thesse coordinates the request will be made 
 * @returns {Object} The Weather data
 */
async function getWeatherData(coordinates) {
    return await $.ajax({
        url: '../inputPOI/weather',
        type: 'POST',
        data: {
            coordinates: coordinates
        }
    })
}
/**
 * These function making an ajax get request to get one Poi data set with the specific id and returning them.
 * @param {String} id The id which will be searched.
 * @async
 * @returns {Object} All Pois.
 */
async function getOnePoi(id) {
    return pois = await $.ajax({
        url: "../inputPOI/" + id,
        type: "GET"
    });

}

/**
 * These function possting the data to the server and returning the answer message.
 * @param {Object} data 
 * @returns {Object} An Object with a message Property describing if the POST was successfull or not.
 */
async function postOnePoi(data) {
    let response = await $.ajax({
        method: 'POST',
        url: '../inputPoi',
        data: data
    })
    return response;
}

/**
 * These function deleting the Poi with the given ID from the Database.
 * @async
 * @param {String} id The ID from the Poi which should be removed.
 * @returns {Object} An Object with information if the DELETE request was successfull.
 */
async function deleteOnePoi(id) {
    let response = await $.ajax({
        method: 'DELETE',
        url: '../inputPoi/' + id
    });
    return response;
}

/**
 * These function requesting all Tours from the server and returning them.
 * @async
 * @returns {Object} All Tour objects
 */
async function getAllTours() {
    let response = await $.ajax({
        method: 'GET',
        url: '../route'
    })
    return response;
}

/**
 * These function requesting a specific Tour by the given ID and returning the Tour.
 * @async
 * @param {String} id The id for the Tour
 * @returns {Object} The specified Tour object.
 */
async function getOneTour(id) {
    let response = await $.ajax({
        method: 'GET',
        url: '../route/' + id
    })
    return response;
}
/**
 * These function deleting the Route with the given ID from the Database.
 * @async
 * @param {String} id The ID from the Route which should be removed.
 * @returns {Object} An Object with information if the DELETE request was successfull.
 */
async function deleteOneTour(id) {
    let response = await $.ajax({
        method: 'DELETE',
        url: '../route/' + id
    });
    return response;
}

/**
 * These function updatign the Route with the given ID from the Database.
 * @async
 * @param {String} id The ID from the Route which should be updated.
 * @returns {Object} An Object with information if the POST request was successfull.
 */
async function updateOneRoute(id, newName) {
    let response = await $.ajax({
        method: 'POST',
        url: '../route/update/' + id,
        data: {
            name: newName
        }
    });
    return response;
}

/**
 * These function making an ajax get request to get all Bus data and returning them.
 * @async
 * @returns {Object} All Bus data
 */
async function getBusData() {
    let response = await $.ajax({
        method: 'GET',
        url: '../busradar'
    })
    return response;
}