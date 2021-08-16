//Initialize map.
let mymap = L.map('map').setView([51.943, 7.62], 14);


let mapBoxKey = 'pk.eyJ1IjoiamFrb2JkYW5lbCIsImEiOiJja2U4aWoyc2QwamVoMnZweHQwM2ttd2hzIn0.bvTiYy0I-JRO0byQm5wZLg';
/**
 * The base URL for the mapBox API.
 */
let mapBoxBaseURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

/*
 * The options for the mapBox API containing information about attribution, maxZoom, id, tileSize, zoomOffset and the accessToken  
 */
let mapBoxOptions = {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapBoxKey
};
/**
 * This method adds a TileLayer to a given Leaflet Basemap. 
 * @param {L.Map | L.LayerGroup<any>} baseMap The Leaflet object containing the Basemap, to which the tileLayer should be added.
 * @param {String} tileLayerURL The URL for the API, which are passing the TileLayer Data.
 * @param {any} tileLayerOptions Options to specify the TileLayer. Format of the options are specified by the TileLayer API.
 * By default an empty object.
 */
function addTileLayerToMap(baseMap, tileLayerURL, tileLayerOptions = {}) {
    L.tileLayer(tileLayerURL, tileLayerOptions).addTo(baseMap);
}


//add tileLayer
addTileLayerToMap(mymap, mapBoxBaseURL, mapBoxOptions);

let drawnItem = new L.FeatureGroup();
let isDrawn = false;
mymap.addLayer(drawnItem);
let drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItem
    },
    draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: true
    }
});
mymap.addControl(drawControl);

mymap.on('draw:created', function (e) {
    if (isDrawn) {
        alert("Only one polygon or marker is allowed");
        return;
    }
    isDrawn = true;
    var type = e.layerType,
        layer = e.layer;
    drawnItem.addLayer(layer);
});


mymap.on('draw:deleted',function(e){
    isDrawn = false;
});
async function loadAllPointsOfInterests(){
    
}
let pois = await loadAllPointsOfInterests();
var inputFields = new Vue({
    el: '#inputFields',
    data: {
        labels : {
            name: 'Name:',
            url: 'URL:',
            description: 'Description:'
        },
        input: {
            name: '',
            url: '',
            description:''
        }
    },
    methods: {
        submitInput: function () {
            console.log("Hello World!");
        }
    }
});

