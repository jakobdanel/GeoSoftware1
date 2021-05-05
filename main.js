/**
 * These file extends the table in the HTML document with the information gained in tableContent.js
 * @author Jakob Danel 
 * @version 1.1.0
 */

"use strict"

/**
 * These functions generate HTML-Code for the table body. The result can be written in the tbody tag from the HTML page. Its filled
 * with the content of tableData
 * @param {any[][]} tableData a two dimensional array which contain the elements, which should be shown at the HTML table
 * @returns a String with HTML Code with the content from tableData
 */
function makeTableHTML(tableData) {
    var result = "<table border=1>";
    for (var i = 0; i < tableData.length; i++) {
        result += "<tr>";
        for (var j = 0; j < tableData[i].length; j++) {
            result += "<td>" + tableData[i][j] + "</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}
/**
 * A variable which store the route which is actual used for table calculation.
 * 
 */
let actualRoute = routeGJSON;

/**
 * Stores the HTML section with text input
 */
var routeInput = document.getElementById("routeInput");

/**
 * Stores the HTML section with text submit
 */
var routeSubmit = document.getElementById("routeSubmit");

//Defining what should be done if routeSubmit is clicked
routeSubmit.onclick = function () {
    //try to convert input in geojson object
    var input = makeStringToGeoJSONLineString(routeInput.value);
    showTable(input); // if correct inout showing the input in the table
    actualRoute = input; //setting actual route to input.
}

/**
 * Declaring if the polygon is showed in the WebPage or not.
 */
let isShowedPolygon = false;

/**
 * Manipulate the HTML document if the button Show Polygon is clicked, if the Polygon is already visible make the data disappear.
 */
function showPolygon() {
    let button = document.getElementById("showPolygon");
    // checking if the polygon is already showed or not
    if (!isShowedPolygon) {
        document.getElementById("polygonGJSONasString").innerHTML = makeGJSONtoString(makePointArrayToGJSON(polygon));
        button.innerHTML = "Let Polygon data disappear" //Changing content of the button
    } else {
        document.getElementById("polygonGJSONasString").innerHTML = "";
        button.innerHTML = "Show Polygon data" //Changing content of the button
    }
    //changing the status of isShowedPolygon
    isShowedPolygon = !isShowedPolygon;
}

/**
 * Declaring if the route is showed in the WebPage or not.
 */
let isShowedRoute = false;

/**
 * Manipulate the HTML document if the button Show Route is clicked, if the Route is already visible make the data disappear.
 */
function showRoute() {
    let button = document.getElementById("showRoute");
    if (!isShowedRoute) {
        document.getElementById("routeGJSONasString").innerHTML = makeGJSONtoString(actualRoute);
        button.innerHTML = "Let Route data disappear" //Changing content of the button
    } else {
        document.getElementById("routeGJSONasString").innerHTML = "";
        button.innerHTML = "Show Route data" //Changing content of the button
    }
    isShowedRoute = !isShowedRoute;
}

/**
 * Variable that store the HTML object from the input file.
 */
let routeInputFile = document.getElementById("routeInputFile");

/**
 * Variable that store the HTML object from the input file submit button.
 */
let submitInputFile = document.getElementById("submitInputFile");
/*
/ Reading the input file and try to parse it into a geojson object.
/ If the parsing worked displaying the inherited data in the table. 
*/
submitInputFile.onclick = function () {

    if (routeInputFile.files.length == 1) {
        document.getElementById("table").innerHTML = "<tbody></tbody>";
        var reader = new FileReader() // File reader to read the file
        reader.readAsText(routeInputFile.files[0]); // read the uploaded
        reader.addEventListener("load", function () {
            let jsonRoute;
            try {
                jsonRoute = JSON.parse(reader.result);
            } catch (error) {
                alert("Not a valid Json Document");
                return;
            }
            if (jsonRoute.type != "LineString") {
                alert("Input is not a LineString!");
                return;
            }
            showTable(jsonRoute);
            actualRoute = jsonRoute;
        })
    } else {
        alert("Not a valid input!");
    }
}

/**
 * Displays the default route and displaying the data in the table.
 */
function loadDefaultRoute() {
    document.getElementById("table").innerHTML = "<tbody></tbody>";
    showTable(routeGJSON);
    actualRoute = routeGJSON;
}