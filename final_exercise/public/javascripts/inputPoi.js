/**
 * @author Jan Hoping, Jakob Danel
 */

/**
 * Stores the map object.
 */
let mymap = new Map('map', new LatLng(51.943, 7.62), 14);

/**
 * Add the basemap
 */
mymap.addTileLayer();

/**
 * Stores the Layer drawn with Leaflet draw
 */
let drawnItem = mymap.addFeatureGroup();

/**
 * Stores if an item is drawn
 */
let isDrawn = false;

/**
 * Store Leaflet Draw
 */
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
//Add Leaflet draw and a EventListener If a new Draw is created
mymap.addControl(drawControl);
mymap.addEventListener("draw:created", drawCreated);


/**
 * Handling the Event if a Layer isDrawn if no Layer iss drawn storing the new Layer.
 * @param {Event} e The Event from Leaflet Draw with data about the drawn object. 
 * 
 */
function drawCreated(e) {
    if (isDrawn) {
        alert("Only one polygon or marker is allowed");
        return;
    }
    isDrawn = true;
    let layer = e.layer;
    drawnItem.addLayer(layer);
}

// Add EventListener to the map.
mymap.addEventListener("draw:created", drawCreated);
mymap.addEventListener("draw:deleted", (e) => isDrawn = false);

/**
 * Posting a new Poi to the Server and giving the User Feedback vie a text. From the data of the formula the function building a Geojson
 * object and posting it to the server.
 */
async function postPoi() {
    let geo = drawnItem.toGeoJSON().features[0].geometry;
    let data = {
        'properties': {
            'name': inputFields.input.name,
            'url': inputFields.input.url,
            'description': inputFields.input.description,
        },
        'type': 'Feature',
        'geometry': {
            'type': geo.type,
            'coordinates': [geo.coordinates]
        }
    }
    let response = await postOnePoi(data);
    inputFields.message = response.message;

}

/**
 * Vue object storing data and methods for formular input.
 */
let inputFields = new Vue({
    el: '#inputFields',
    data: {
        labels: {
            name: 'Name:',
            url: 'URL:',
            description: 'Description:'
        },
        input: {
            name: '',
            url: '',
            description: ''
        },
        message: ''
    },
    methods: {
        submitInput: postPoi
    }
});

/**
 * Posting the geojson inputted into the textfield to the server. Giving the user feedback vie a text.
 */
let postGeoJson = async function () {
    let response = await postOnePoi(JSON.parse(textInputField.input.geojson));
    textInputField.message = response.message;
};

let textInputField = new Vue({
    el: '#textInputField',
    data: {
        input: {
            geojson: ''
        },
        message: ''
    },
    methods: {
        submitInput: postGeoJson
    }
})

/**
 * The HTML DOM-Element for the file input.
 *  */
let file = document.getElementById('fileInput');

/**
 * Function for posting the file to the server.
 */
let postFile = async function () {
    var reader = new FileReader() // File reader to read the file
    reader.readAsText(file.files[0]); // read the uploaded
    reader.addEventListener("load", async function () {
        let json;
        try {
            json = JSON.parse(reader.result);
        } catch (error) {
            alert("Not a valid Json Document");
            return;
        }
        let response = await postOnePoi(json);
        fileUploadField.message = response.message;
    })
}

/**
 * Handles the Event if a File is selected
 * @param {Event} evt The event object passed by the event 
 */
async function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        let json;
        try {
            console.log(reader.result);
            json = JSON.parse(reader.result);
        } catch (error) {
            alert("Not a valid Json Document");
            return;
        }
        let response = await postOnePoi(json);
        fileUploadField.message = response.message;
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}
/**
 * Handles the Event if a File is dragged over the HTML Element
 * @param {Event} evt The event object passed by the event 
 */
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; 
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

/**
 * The Vue Object for storing the data and methods for the file Input.
 */
let fileUploadField = new Vue({
    el: '#fileUploadField',
    data: {
        input: null,
        message: '',
    },
    methods: {
        submitInput: postFile
    }
});