/**
 * Initialize Map
 */
let map = new Map();

/**
 * Loading the Poi and tour data adding autocomplete for the input fields and adding eventListeners to the submitButtons
 */
async function initializeMap() {
    //Add basemap
    map.addTileLayer();

    //load the data
    let allPois = await getAllPois();
    let allTours = await getAllTours();

    let poiOptions = [];
    let tourOptions = [];
    for (let i = 0; i < allPois.length; i++) {
        poiOptions.push({
            value: allPois[i].properties.name,
            data: allPois[i]
        })
    }
    //Adding autocomplete
    $('#search-poi').autocomplete({
        source: poiOptions
    }, {
        autoFocus: true,
        delay: 0,
        minLength: 0
    });
    $('#search-tour').autocomplete({
        source: tourOptions
    }, {
        autoFocus: true,
        delay: 0,
        minLength: 0
    });
    for (let i = 0; i < allTours.length; i++) {
        tourOptions.push({
            value: allTours[i].name,
            data: allTours[i]
        })
    }
    //Saving dom-elements
    const searchPoiButton = document.getElementById("submit-poi");
    const searchTourButton = document.getElementById("submit-tour");
    const searchPoiInput = document.getElementById("search-poi");
    const searchTourInput = document.getElementById("search-tour");

    //Clearing the map and searching for the given PoiName and loading if founded
    searchPoiButton.addEventListener("click", (ev) => {
        map.clear();
        let inputName = searchPoiInput.value;
        let found = false;
        for (let i = 0; i < allPois.length; i++) {
            const element = allPois[i];
            if (element.properties.name == inputName) {
                map.addOnePoi(element._id);
                found = true;
                searchPoiInput.value = "";
            }

        }
        if(!found){
            alert("Point of Interest not found");
            searchPoiInput.value = "";
        }
    });

    //Clearing the map and searching for the given Tourname and loading if founded 
    searchTourButton.addEventListener("click", (ev) => {
        map.clear();
        let inputName = searchTourInput.value;
        let found = false;
        for (let i = 0; i < allTours.length; i++) {
            const element = allTours[i];
            if (element.name == inputName) {
                map.addTourData(element._id);
                found = true;
                searchTourInput.value = "";
            }
        }
        if(!found){
            alert("Tour not found");
            searchPoiInput.value = "";
        }
    });
}

initializeMap();