/**
 * Building the background logic for the leaflet map and the route the selection
 * @author Jakob Danel
 * @since 1.6.0
 */

/**
 * The HTML element for the dropdown menu.
 */
const dropdown = document.getElementById("routes");

/**
 * The HTML element for the submit Route Button.
 */
const submitRoute = document.getElementById('submitRoute');

/**
 * These function fill the dropdown menu with all routes, which are in the database. It will get all routes from the server and displaying theor
 * names in the dropdown.
 */
function fillDropDownMenu() {
    $.ajax({
        url: "/manageData/routes",
        type: "GET"
    }).done((data) => {
        console.log(data);
        let html = '';
        for (let i = 0; i < data.response.length; i++) {
            const element = data.response[i];
            html += `<option value="${element._id}">${element.properties.name}</option>`;
        }
        dropdown.innerHTML = html;
    })
        .fail((error) => console.error(error));
}
/**
 * Saves the route which is selected. By default undefined.
 */
let route = undefined;

/**
 * Adding an event listener to the submit button. If a route was selct, these function displays these route to the map. 
 */
submitRoute.addEventListener("click", () =>{
    let selected = dropdown.options[dropdown.selectedIndex].value;
    $.post("/loadRoute",{
        _id : selected
    },(response) => {
        console.log(response.response[0].geometry);
        route = L.geoJSON(response.response[0]).addTo(map);
        //window.location.href = "/leafletMap";
    })
});

fillDropDownMenu();



//Leaflet part

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


//Initialize Array for all markers displayed on the map.
let allMarkers = Array();

