/**
 * @author Jan Hoping, Jakob Danel
 */


/**
 * Storing all possible data about the pois for autocomplete and possting to the server. 
 */
let options = []

/**
 *  Initialize the page. Loading the Poiss and adding autocomplete for them.
 */
let initializePage = () => {
    $.ajax({
        method: "GET",
        url: "../inputPoi",
        success: (response) => {
            for (let i = 0; i < response.length; i++) {
                options.push({
                    value: response[i].properties.name,
                    data: response[i]
                })

            }
            $('#poi').autocomplete({
                source: options
            }, {
                autoFocus: true,
                delay: 0,
                minLength: 0
            });
        },
        error: (data, status, xhr) => {
            console.log(xhr);
        }

    });

}

/**
 * Storing the actual build route.
 */
let route = {
    name: "",
    pois: []
}
initializePage();

/**
 * Checking if an input is actual a Poi.
 * @param {String} text The name of a possible poi 
 * @returns an boolean if the name is a Poi and a String with further information.
 */
let poiInputValid = (text) => {
    let x = {
        isValid: false,
        message: 'This Point of Interest do not exist!'
    }
    options.forEach(element => {
        if (element.value == text) {
            x = {
                isValid: true,
                message: "ok"
            }
        }
    });
    return x;
}
//Storing some HTML-Dom Elements which need event Listener 
let poiInput = document.getElementById("poi");
const addRouteBtn = document.getElementById("add-poi");
const poisList = document.getElementById("pois");
const addPoiErrorMessage = document.getElementById("add-poi-error-message");

//Fires if a new  Poi is pushed to a Tour
addRouteBtn.addEventListener("click", (event) => {
    let validation = poiInputValid(poiInput.value);
    if (validation.isValid) {
        //Appending the list with a new Element
        let listItem = document.createElement('li');
        listItem.appendChild(document.createTextNode(poiInput.value));
        poisList.appendChild(listItem);
        //Feedback message
        addPoiErrorMessage.style = "color:green";
        addPoiErrorMessage.innerHTML = "Successful added";

        //Finding the Poi which is added
        for (let i = 0; i < options.length; i++) {
            const element = options[i];
            if (element.value == poiInput.value) {
                route.pois.push(element.data);
            }
        }
        //resetting poiInput
        poiInput.value = "";
    } else {
        //Feedback message
        addPoiErrorMessage.style = "color:red";
        addPoiErrorMessage.innerHTML = validation.message;
        poiInput.value = "";
    }
});

//Storing some HTML-Dom Elements which need event Listener 
const submitRouteBtn = document.getElementById("submit-route");
let nameInput = document.getElementById("name");
let messageSubmit = document.getElementById("message-submit");

//Fires if the ssubmit Route Button is clicked
submitRouteBtn.addEventListener("click", (event) => {
    //Checking if poiss are in the list.
    if (route.pois.length == 0) {
        //Feedback String and resetting input fields
        messageSubmit.style = "color:red";
        messageSubmit.innerHTML = 'A Tour must have atleast one Stop';
        nameInput.value = "";
        poiInput.value = "";
    } else {
        //Posting the route to the server.
        route.name = nameInput.value;
        $.ajax({
            method: "POST",
            url: "../route",
            data: route,
            success: (response) => {
                if (response.successfull) {
                    messageSubmit.style = "color:green";
                    messageSubmit.innerHTML = "Successfull added";
                    nameInput.value = "";
                    poiInput.value = "";
                } else {
                    //Feedback String and resetting input fields
                    messageSubmit.style = "color:red";
                    messageSubmit.innerHTML = response.message;
                    nameInput.value = "";
                    poiInput.value = "";
                }
            },
            //error handling
            error: (data, status, xhr) => {
                console.log(xhr);
                console.log(data);
                console.log(status);
            }

        });
    }
});

/**
 * Initialize map object
 */
let map = new Map();

/**
 * Add a basemap
 */
map.addTileLayer();

/**
 * The function adding highlighting for the displayed Pois. If a Poi name is typed into the input field, the Poi will appear in a red color.
 * If the input get changed again, the color of the Poi will get blue again. These function also loading the poiData into the map.
 */
let addHighlighting = async () => {
    // Adding all poi to the map.
    let layers = await map.addAllPoiData();
    //Fires everytime the input in the poi input field changes
    poiInput.addEventListener("input", () => {
        //Loop about all Pois
        for (let i = 0; i < layers.length; i++) {
            //Restructuring the data
            let layer = layers[i].layer;
            let geojson = layers[i].geojson;
            const element = layers[i];
            //Check if the input and name are equal
            if (geojson.properties.name == poiInput.value) {
                //Markers and Polygons must be handled differently so here is another if case needed. 
                if (geojson.geometry.type == "Polygon") {
                    //Resetting styles
                    layer.setStyle({
                        color: 'red'
                    });
                } else {
                    //Remove old Marker and replace the marker with a red-marker
                    map.map.removeLayer(layer);
                    console.log(geojson.geometry.coordinates);
                    map.map.addLayer(new L.marker([geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]], {
                        icon: new L.icon({
                            iconUrl: '/../images/marker-icon-red.png'
                        })
                    }).bindPopup(`<div class=popup>${geojson.properties.name}</div>`))
                }
            } else {
                if (geojson.geometry.type == "Polygon") {
                    //Resetting styles
                    layer.setStyle({
                        color: 'blue'
                    });
                } else {
                    //Remove old Marker and replace the marker with a red-marker
                    map.map.removeLayer(layer);
                    console.log(geojson.geometry.coordinates);
                    map.map.addLayer(new L.marker([geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]], {
                        icon: new L.icon({
                            iconUrl: '/../images/marker-icon-blue.png'
                        })
                    }).bindPopup(`<div class=popup>${geojson.properties.name}</div>`))
                }
            }

        }
    });
}


addHighlighting();