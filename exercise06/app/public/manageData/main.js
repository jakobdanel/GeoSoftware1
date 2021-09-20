/**
 * These script managing the logic for the manageData page. 
 * @author Jakob Danel
 * @since 1.6.0
 */

/**
 * Saving the input field for the route in the HTML document.
 */
let routeInput = document.getElementById("routeInput");

/**
 * Saving  the  Submit button for the route upload.
 */
let submit = document.getElementById("submit");

/**
 * Defining what should happen if the submit button is clicked.
 */
submit.onclick = function () {
    //Only one file at the same time can be uploaded 
    if (routeInput.files.length == 1) {
        var reader = new FileReader() // File reader to read the file
        reader.readAsText(routeInput.files[0]); // read the uploaded
        reader.addEventListener("load", function () {
            let jsonRoute;
            try {
                jsonRoute = JSON.parse(reader.result);
                console.log(jsonRoute)
            } catch (error) {
                //If the document cannot be parsed.
                alert("Not a valid Json Document");
                return;
            }
            //Route must have a name property 
            if (jsonRoute.properties.name == undefined) {
                alert("Route have no property Name!");
                return;
            }
            //One name can only be used once.
            if (names.includes(jsonRoute.properties.name)) {
                alert("A route with this name already exists");
                return;
            }
            //Must have the geometry type MultiLineString
            if (jsonRoute.geometry.type != "MultiLineString") {
                alert("Input is not a LineString!");
                return;
            }
            console.log("Parsed successful")

            //If all formatting issues be passed posting the route
            $.post("/routeUpload", jsonRoute, (response) => {
                console.log(response);
                //Refreshing the page.
                window.location.href = "/manageData";
            }, "json");
        })
    } else {
        alert("Not a valid input!");
    }
    updateRoutes();
}
/**
 * Sava all route names.
 */
let names = Array();

/**
 * Saving the div with the route data
 */
let dataDiv = document.getElementById("data");
updateRoutes();

/**
 * These function displaying all routes from the database in a table in the dataDiv element of the HTML document.
 */
function updateRoutes() {
    $.ajax({
        url: "/manageData/routes",
        type: "GET"
    }).done((data) => {
        console.log(data.response);
        if (data.response.length == 0) {
            dataDiv.innerHTML = "No routes loaded, please submit a route";
            return;
        }
        //Building the headlines of the table.
        let html = `<table class="table table-bordered"><tr><th>Name</th><th>First Point</th><th>Last Point</th><th>Length</th><th>Delete</th><th>Rename</th><th>Submit renaming</th></tr>`;
        for (let i = 0; i < data.response.length; i++) {
            names.push(data.response[i].properties.name);
            //Generating a new table row for each route.
            html += generateInformationParagraph(data.response, i);
        }
        dataDiv.innerHTML = html + '</table>';
        //Adding Event Listeners for the rename submit button.
        addEventListeners(data.response);
    })
        .fail((error) => console.error(error));
}

/**
 * Generates HTML Code for a table row which conatains information for the route data
 * @param {JSON} data All routes as JSON 
 * @param {number} index The index of the route which should be displayed 
 * @returns The HTML Code as String
 */
function generateInformationParagraph(data, index) {
    return `<tr id="route_${index}"><td>${data[index].properties.name}</td>
    <td>${data[index].geometry.coordinates[0][0][0]}, ${data[index].geometry.coordinates[0][0][1]}</td>
    <td>${data[index].geometry.coordinates[0][data[index].geometry.coordinates[0].length - 1][0]}, 
    ${data[index].geometry.coordinates[0][data[index].geometry.coordinates[0].length - 1][1]}</td>
    <td>${data[index].geometry.coordinates[0].length}</td><td><input class="inp" type="checkbox" id="${data[index]._id}"></input>
    </td><td><input class="rename" type="text" id="rename_${data[index]._id}"></input></td><td><button class="submit-rename"
    id="rename_submit_${data[index]._id}">OK</button</td></tr>`;
}

/**
 * Calling the /deleteRoute post with the given data.
 * @param {JSON} data Data to delete
 */
function deleteData(data) {
    console.log("Delete:");
    console.log(data);
    $.post("/deleteRoute", data, (response) => {
        console.log(response);
    });
}

/**
 * Gets called everytime the delete button is clicked. Finding all clicked checkboxes and making a post request to delete these buttons. 
 */
function del() {
    var checkedBoxes = document.querySelectorAll('.inp:checked');
    for (let i = 0; i < checkedBoxes.length; i++) {
        const element = checkedBoxes[i];
        const id = element.id;
        $.post("/deleteRoute", { _id: id }, (response) => {
            console.log(response);
            window.location.href = "/manageData";
        });

    }
}
/**
 * Adding EventListeners to the submit rename buttons. Every time they got clicked, the function is checking if the new name is valid and changing
 * the name if possible.
 * @param {JSON} routes The routes which are in the database 
 */
function addEventListeners(routes) {
    let inputFields = Array();
    for (let i = 0; i < routes.length; i++) {
        const id = 'rename_' + routes[i]._id;
        inputFields.push(document.getElementById(id));

    }
    let submitButtons = Array();
    for (let i = 0; i < routes.length; i++) {
        const id = 'rename_submit_' + routes[i]._id;
        submitButtons.push(document.getElementById(id));

    }
    for (let i = 0; i < submitButtons.length; i++) {
        const button = submitButtons[i];
        button.addEventListener("click", () => {
            let input = inputFields[i].value;
            if (input == "") {
                alert("Name can not be empty");
            } else if (!checkIfNamePossible(routes, input)) {
                alert("These name already exists");
            } else {
                $.post("/updateRoute", {
                    _id: routes[i]._id,
                    name: input
                }, (response) => {
                    window.location.href = "./index.html"
                })
                routes[i].properties.name = input;
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
function checkIfNamePossible(routes, input) {
    for (let i = 0; i < routes.length; i++) {
        if (routes[i].properties.name == input) {
            return false;
        }
    }
    return true;
}