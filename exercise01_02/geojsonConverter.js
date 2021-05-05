/**
 * This script helps to transfom Strings into JSON, JSON into String and array content into JSON with a focus on the JSON subtype GeoJSON.
 * @author Jakob Danel
 * @version 1.1.0
 * 
 */
"use strict"
/**
 * Parses an String into a JSON object if the type of the object is LineString
 * @param {String} input A String which should be in a GeoJSON form with the type LineString, otherwise the page shows an alert.  
 * @returns The JSON Object from the input String.
 */
function makeStringToGeoJSONLineString(input) {
    let json;
    try {
        json = JSON.parse(input);
    } catch (error) {
        alert("Input is not a valid JSON object");
        return;
    }
    if (json.type != "LineString") {
        alert("Input is not a LineString!");
    } else {
        return json;
    }

}

/**
 * These function creating a LineString geojson object from a input array of points.
 * @param {number[][]} inputPoints an array of points, which will be converted into an GeoJSON object of these points. 
 * @returns The corresponding geojson object to the input Points.
 */
function makePointArrayToGJSON(inputPoints) {
    let json = {
        "type": "LineString",
        "coordinates": inputPoints,
    }

    return json;
}

/**
 * 
 * These function creating a Polygon geojson object from a input array of points.
 * @param {number[][]} inputPoints an array of points, which will be converted into an GeoJSON object of these points. First and last point musst have the same coordinates.
 * @returns The corresponding geojson object to the input Points.
 */
function makePolygonToGJSON(inputPoints) {
    let json = {
        "type": "Polygon",
        "coordinates": inputPoints,
    }

    return json;
}

/**
 * These function creating a Point geojson object from the input Point.
 * @param {number[]} inputPoint The point which will converted into geojson. Must be in WGS84 and the format [long,lat] 
 * @returns The corresponding geojson object to the input Points.
 */
function makePointToGJSON(inputPoint) {
    let outputString = {
        "type": "Point",
        "coordinates": inputPoint,
    }

    return outputString;
}

/**
 * Parses a json object into an String via JSON.stringify()
 * @param {json} geojson The geojson which will be parsed.
 * @returns The parsed String containing informations about the geojson oject.
 */
function makeGJSONtoString(geojson) {
    return JSON.stringify(geojson);
}
/**
 * Save and download a geojson object as a file.
 * Mostly the same function: https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
 * @param {*} filename The name which the file should have.
 * @param {*} filecontent The data which will be stored in the file.
 */
function save(filename, filecontent) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(filecontent, null, 2)], {
        type: "text/plain"
    }));
    a.setAttribute("download", filename + ".geojson");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Uses the the save function with a given name and the route data.
 */
function saveRoute() {
    save("route", routeGJSON);
}

/**
 * Uses the save function with a given name and the polygon data.
 */
function savePolygon() {
    save("polygon", polygonGJSON);
}