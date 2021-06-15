/**
 * These script hold methods for adding manipulating and creating Leaflet maps and layers for these maps. 
 * @author Jakob Danel
 * @since 1.4.0
 * @update 1.6.0 changes to make the functions useable for the new way of collecting the data.
 */

/**
 * Storing options for the Basemap
 */
let osmTileLayerOptions = {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
};

/**
 * Storing options for the map (only setting the draw control to false, adding manually a draw control later)
 */
let mapOptionsDefault = {
    drawControl: false
}

/**
 * Creates a new Leaflet map, by the given id and options.
 * @param {String} htmlID The id of the html div tag, for the Leaflet map.
 * @param {L.mapOptions} mapOptions options for the map, in the L.mapOptions style. 
 * @returns The map object
 */
function initializeMap(htmlID = 'map', mapOptions = mapOptionsDefault) {
    return L.map(htmlID, mapOptions).setView([51.9569, 7.6317], 6);
}

/**
 * Adding an OSM tile layer to the given mapObj with the osmTileLayerOptions.
 * @param {L.map} mapObj the map object, where the OSM layer is added to.
 */
function addTileLayer(mapObj) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapObj);

}
/**
 * Adding an Layer to the mapObj, with the data from the geojson object.
 * @param {GeoJSON} geojson An GeoJSON object, with data which will be added to the mapObj.
 * @param {L.map} mapObj The Leaflet map, where the geojson will be added to.
 * @returns 
 */
function addLayerGeoJSON(geojson, mapObj) {
    return L.geoJSON(geojson).addTo(mapObj);
}

/**
 * Set an marker with weather data to a given coordinate. The weather data will be requested at the OpenWeatherMap API.
 * @param {Coordinate} coordinates The coordinatess where the marker will be set.
 */
function setMarkerToPosition(coordinates) {
    let marker = new L.marker([coordinates.latitude, coordinates.longitude]);
    let requestWeather = new RequestWeatherData(coordinates, processWeatherData, [marker]);
    requestWeather.request();
}

/**
 * These function get the weather data and a marker and adding the weather data as HTML content to the marker and adding the marker to the map. 
 * @param {String} weatherData The weather data generated b the OWM API as String in an json format.
 * @param {[L.Marker]} markerData An marker,w hich only holds information about the position. Must be provided in form of an Array of length 1, because
 * of the design of the RequestWeatherData class.
 */
function processWeatherData(weatherData, markerData) {
    weatherData = JSON.parse(weatherData);
    console.log(weatherData);
    let html = generateWeatherDataHTML(weatherData);
    let marker = markerData[0];
    marker.setIcon(createLeafletIcon(weatherData.weather[0].icon));
    marker.bindPopup(html);
    allMarkers.push(marker);
    marker.addTo(map);
}

/**
 * Creates an L.Icon object from the given id.
 * @param {String} weatherID The id of the weather icon given by the OSM request return.
 * @returns An L.ICon object holding an icon with the given ID
 */
function createLeafletIcon(weatherID) {
    return new L.Icon({
        iconUrl: generateIconLink(weatherID),
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    })
}

/**
 * These function gets called everytime a new Layer is drawn to the Leaflet map. First is clears the old marker, then calculates the intersections
 * between the route and the drawn rectangle. Add each intersection it will add an marker provided with current weather state information.
 * @param {L.LeafletEvent} e These event holds information about the drawn items. 
 */
function setMarkersToIntersections(e) {
    if (route == undefined) {
        alert("No route selected. Please select a route!");
    } else {
        clearAllMarkers();
        let intersects = calculateIntersections(e, route);
        for (let i = 0; i < intersects.features.length; i++) {
            addMarker(intersects, i);

        }
    }
}

/**
 * These function doing a partly work for setMarkerToIntersections(), by claculating the intersections betwwen route and the drawn rectangle
 * eith the help of turf. Further information to turf see her: http://turfjs.org/ 
 * @param {L.LeafletEvent} e These event holds information about the drawn items. 
 * @returns The intersection(s) as geojson
 */
function calculateIntersections(e) {
    drawnItems.addLayer(e.layer);
    console.log(route.toGeoJSON());
    console.log(drawnItems.toGeoJSON());
    return turf.lineIntersect(route.toGeoJSON(), drawnItems.toGeoJSON());

}

/**
 * Set an marker to the i-th intersection position from intersects.
 * @param {GeoJSON} intersects the by calculateIntersections() calculated intersectionss 
 * @param {Number} i the Index of the intersection 
 */
function addMarker(intersects, i) {
    let coordinates = intersects.features[i].geometry.coordinates;
    let coordObj = new Coordinate(coordinates[1], coordinates[0]);
    setMarkerToPosition(coordObj);
}

/**
 * Removes all markers, which are currently on the map and saved in allMarkers
 */
function clearAllMarkers() {
    for (let i = 0; i < allMarkers.length; i++) {
        map.removeLayer(allMarkers[i]);
    }
    allMarkers = [];
    drawnItems.clearLayers();
}

