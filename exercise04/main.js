/**
 * 
 * These script calls the function and providing the div tag from index.html with data.
 * @author Jakob Danel
 * @since 1.4.0
 */

//Initialize Leaflet map
var map = initializeMap();

//storing drawn data
var drawnItems = new L.FeatureGroup();

//Controlling the draw (Only rectangles, position topright and data stored in drawnItems)
var drawControl = new L.Control.Draw({
    position: "topright",
    draw: {
        polygon: false,
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
    },
    edit: {
        featureGroup: drawnItems
    }
});

//setMarkerToInersection gets called, everytime a new rectangle is drawn
map.on('draw:created', function (e) {
    setMarkersToIntersections(e);
});

//drawn items added to map
map.addLayer(drawnItems);

//draw control added to map
map.addControl(drawControl);

//Basemap added to map
addTileLayer(map);

//Route added to map
let route = addLayerGeoJSON(Route_Uebung4.features[0].geometry, map);

//Initialize Array for all markers dissplayed on the map.
let allMarkers = Array();

