/**
 * These Vue object holding the data and methods for the Vue application, which is supposed to run the input fields from Vue
 */
let inputRoute = new Vue({
    el: '#input-route',
    data: {
        message: "Input Geojson",
        feedback: "No valid input"
    },
    methods: {
        submitRoute: loadRouteData
    }
})

/**
 * These Vue object holding the data and methods for the Vue application, which is supposed to run the table from Vue
 */
let routeTable = new Vue({
    el: '#route-table',
    data: {
        hasData: false,
        sections: null
    },
    methods: {}
});

/**
 * Holds the String for the feedback message if the input is no LineString. 
 */
const feedbackNoLineString = "Input must be a LineString";

/**
 * Holds the String for the feedback message if the input has no valid JSON syntax. 
 */
const feedbackNoValidJSON = "No valid JSON!";

/**
 * Holds the String for the feedback message if the input has no coordinate key. 
 */
const feedbackCoordinatesUndefined = "Input must have coordinates";

/**
 * Holds the String for the feedback message if the input not have a single point in the coordinate key. 
 */
const feedbackCorordinatesLengthNull = "Coordinates must have at least one point!";

/**
 * Holds the String for the feedback message if the input is valid. 
 */
const feedbackInputValid = "These input working!";

/**
 * These function is made to build the table, if the "Submit Route" button is pushed. First the function checking weither the input is
 * valid or not, and pushing error messages to the user if not. If the input was valid the method call loadRouteData() to generate the HTML
 * for the section Table.
 * @returns null if the input is'nt a valid input.
 */
function loadRouteData() {
    const input = inputRoute.$data.message;
    let jsonInput;
    //Checking for valid JSON syntax and parse if possible
    try {
        jsonInput = JSON.parse(input);
    } catch (error) {
        inputRoute.feedback = feedbackNoValidJSON;
        return;
    }
    //Checking if key type with value LineString exists
    if (jsonInput.type != "LineString") {
        inputRoute.feedback = feedbackNoLineString;
        return;
    }

    //Checking if coordinate is undefined
    if (jsonInput.coordinates == undefined) {
        inputRoute.feedback = feedbackCoordinatesUndefined;
        return;
    }

    //Checking if coordinate have at least one point.
    if (jsonInput.coordinates.length == 0) {
        inputRoute.feedback = feedbackCorordinatesLengthNull;
        return;
    }
    inputRoute.feedback = feedbackInputValid;

    //build up the table
    buildSectionObject(jsonInput);
    routeTable.hasData = true;

}

/**
 * These function build up an object, which contains the information from the table. It use the convertTableValues written in exercise02 and
 * convert the data from these 2D-Array into an object for better useability and easier understanding of the HTML-Code. In the send is 
 * setting the sectionss attribute from the routeTable data to these object.
 * @param {JSON} jsonInput The Json object generated from the User input. 
 */
function buildSectionObject(jsonInput) {
    let tableData = convertTableValues(jsonInput);
    let sec = new Array(0);
    for (let i = 0; i < tableData.length; i++) {
        const element = tableData[i];
        sec.push({

            section: element[0],
            distance: element[1],
            firstElement: element[2],
            lastElement: element[3],
            isInside: element[4]
        });
    }
    routeTable.sections = sec;
}