/**
 * @author Jan Hoping, Jakob Danel
 */

/**
 * Stroring the name of all Tours
 */
let names = Array();

/**
 * Storing the DOM-Element for the table
 */
let dataDiv = document.getElementById('data');

/**
 * Generate the HTML table with all Tours and adding the Event Listeners for renaming and deleting the pois
 * @async
 */
let updateTours = async () => {
    let data = await getAllTours();
    if (data.length == 0) {
        dataDiv.innerHTML = "No Tours created, please Submit a Poi";
        return;
    }
  //Create table head
    let html = `<table class="table table-bordered"><tr><th>Name</th><th>Number of Pois</th><th>Show</th><th>Delete</th><th>Rename</th><th>Submit renaming</th></tr>`;
     //generating row by row
    for (let i = 0; i < data.length; i++) {
        html += generateInformationParagraph(data, i);
    }
    dataDiv.innerHTML = innerHTML = html + '</table>'

    addEventListeners(data);
}
updatePois();

/**
 * Generating HTML for a sspecific row in the Tour table
 * @param {Object} data The array with all Tours  
 * @param {Number} index The index of the Tour for which the row should be build
 * @returns A String with the HTML for the generated row
 */
let generateInformationParagraph = (data, index) => {
    return `<tr id="tour_${index}"><td>${data[index].name}</td><td>${data[index].pois.length}</td><td><button class ="show-tour" id="show-tour-${data[index]._id}">Show</button></td><td><input class="inp" type="checkbox" id="${data[index]._id}"></input></td><td><input class="rename" type="text" id="rename_${data[index]._id}"></input></td><td><button class="submit-rename" id="rename_submit_${data[index]._id}">OK</button</td></tr>`;
}


/**
 * Deleting all selected Tours from the database
 */
let del = async () => {
    let checkedBoxes = document.querySelectorAll('.inp:checked');
    for (let i = 0; i < checkedBoxes.length; i++) {
        let msg = await deleteOneTour(checkedBoxes[i].id);
        console.log(msg);
        window.location.href = '/manageTour';
    }
}
/**
 * Add eventlisteners for renaming the Tours. First quering the dom to get all necessary elements and the checking if the new name is a possible
 * name. If the new name is possible update these name.
 */
let addEventListeners = (tours) => {
    let inputFields = Array();
    for (let i = 0; i < tours.length; i++) {
        const id = 'rename_' + tours[i]._id;
        inputFields.push(document.getElementById(id));

    }
    let submitButtons = Array();
    for (let i = 0; i < tours.length; i++) {
        const id = 'rename_submit_' + tours[i]._id;
        submitButtons.push(document.getElementById(id));

    }
    for (let i = 0; i < submitButtons.length; i++) {
        const button = submitButtons[i];
        button.addEventListener("click", async () => {
            let input = inputFields[i].value;
            if (input == "") {
                alert("Name can not be empty");
            } else {
                await updateOneRoute(tours[i]._id, input);
                routes[i].name = input;
                window.location.href = '../manageTour';
            }
        })
    }
    
    let showBtns = Array();
    let ids = Array();
    for (let i = 0; i < tours.length; i++) {
        const id = 'show-tour-'+tours[i]._id;
        ids.push(tours[i]._id);
        showBtns.push(document.getElementById(id));        
    }
    for (let i = 0; i < showBtns.length; i++) {
        showBtns[i].addEventListener("click", async () =>{
            map.clear();
            map.addTourData(ids[i]);
        });
        
    }
}

/**
 * Add a map to the page
 */
 let map = new Map('map', new LatLng(51.943, 7.62), 14);

 /**
  * Add a BaseMap
  */
 map.addTileLayer();
 
 /**
  * Adding all Poi data to the map.
  */
 map.addAllPoiData();