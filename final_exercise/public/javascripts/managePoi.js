/**
 * @author Jan Hoping, Jakob Danel
 */

/**
 * Stroring the name of all Pois
 */
let names = Array();


/**
 * Storing the DOM-Element for the table
 */
let dataDiv = document.getElementById('data');

/**
 * Generate the HTML table with all Pois and adding the Event Listeners for renaming and deleting the pois
 * @async
 */
let updatePois = async () => {
  let data = await getAllPois();
  if (data.length == 0) {
    dataDiv.innerHTML = "No Point of Interest created, please Submit a Point of Interest";
    return;
  }
  //Create table head
  let html = `<table class="table table-bordered"><tr><th>Name</th><th>URL</th><th>Description</th><th>Type</th><th>Delete</th><th>Rename</th><th>Submit renaming</th></tr>`;
  //generating row by row
  for (let i = 0; i < data.length; i++) {
    names.push(data[i].properties.name);
    html += generateInformationParagraph(data, i);
  }
  dataDiv.innerHTML = innerHTML = html + '</table>'

  addEventListeners(data);
}
updatePois();

/**
 * Generating HTML for a sspecific row in the poi table
 * @param {Object} data The array with all pois  
 * @param {Number} index The index of the Poi for which the row should be build
 * @returns A String with the HTML for the generated row
 */
let generateInformationParagraph = (data, index) => {
  return `<tr id="poi_${index}"><td>${data[index].properties.name}</td><td>${data[index].properties.url}</td><td>${data[index].properties.description}</td><td>${data[index].geometry.type}</td><td><input class="inp" type="checkbox" id="${data[index]._id}"></input></td><td><input class="rename" type="text" id="rename_${data[index]._id}"></input></td><td><button class="submit-rename" id="rename_submit_${data[index]._id}">OK</button</td></tr>`;
}

/**
 * Deleting all selected Pois from the database
 */
let del = async () => {
  let checkedBoxes = document.querySelectorAll('.inp:checked');
  for (let i = 0; i < checkedBoxes.length; i++) {
    await deleteOnePoi(checkedBoxes[i].id);
    window.location.href = '/managePoi';
  }
}

/**
 * Add eventlisteners for renaming the pois. First quering the dom to get all necessary elements and the checking if the new name is a possible
 * name. If the new name is possible update these name.
 */
let addEventListeners = (pois) => {
  let inputFields = Array();
  for (let i = 0; i < pois.length; i++) {
    const id = 'rename_' + pois[i]._id;
    inputFields.push(document.getElementById(id));

  }
  let submitButtons = Array();
  for (let i = 0; i < pois.length; i++) {
    const id = 'rename_submit_' + pois[i]._id;
    submitButtons.push(document.getElementById(id));

  }
  for (let i = 0; i < submitButtons.length; i++) {
    const button = submitButtons[i];
    button.addEventListener("click", () => {
      let input = inputFields[i].value;
      if (input == "") {
        alert("Name can not be empty");
      } else if (!checkIfNamePossible(pois, input)) {
        alert("These name already exists");
      } else {
        $.post("/inputPoi/update", {
          _id: pois[i]._id,
          name: input
        }, (response) => {
          window.location.href = "/managePoi";
        })
        pois[i].properties.name = input;
      }
    })
  }
}

/**
 * Check if the name already exists or not.
 * @param {JSON} routes Routes data 
 * @param {String} input New route name 
 * @returns True if the name is ok, false if not
 */
let checkIfNamePossible = (pois, input) => {
  for (let i = 0; i < pois.length; i++) {
    if (pois[i].properties.name == input) {
      return false;
    }
  }
  return true;
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