let mongoUserName = 'jakobdanel';
let mongoDBKey = 'igsUpUB6YS0Ka4zx';
let uri = `mongodb+srv://${mongoUserName}:${mongoDBKey}@poimanager.2i67p.mongodb.net/PoiManager?retryWrites=true&w=majority`;
const mongoose = require('mongoose');

/**
 * The mongoose schema for the poi data, following the rules of geojson. Properties are based on the structure of the conditions based on the
 * exercise. 
 */
const PoiSchema = new mongoose.Schema({
    type: String,
    geometry: {
        type: String,
        coordinates: [
            [Number]
        ]
    },
    properties: {
        name: String,
        url: String,
        description: String
    },
}, 
//Needed to tell mongoose that type is a key-value and not a keyword to declare a type definition.
{
    typeKey: "$type"
});

/**
 * The mongoose model based on PoiSchema.
 */
const Poi = mongoose.model('Poi', PoiSchema);

/**
 * These function try to save the given poiData into the Database. For controlling the function returning an boolean for cheking if the logging
 * was successfull. For connecting the mongoose Framework iss used.
 * @param {GeoJSON} poiData The Data which should be saved into the database. 
 * @returns true if saving was successfull, false if not.
 */
let saveNewPoi = async function (poiData) {
    mongoose.connect(uri, {
        useNewUrlParser: true
    });
    const poi = new Poi(poiData);
    await poi.save()
    if (poi.errors) {
        return false;
    } else return true;
};

//Test data 
let json = {

    type: "Feature",
    properties: {
        name: "Historisches Rathaus",
        url: "https://en.wikipedia.org/wiki/Historical_City_Hall_of_M%C3%BCnster",
        description: "..."
    },
    geometry: {
        type: "Point",

        coordinates: [
            [7.627979815006256, 51.96171464749894]
        ]
    },


};

//Test function 
let foo = async function () {
    let test = await saveNewPoi(json);

    console.log(test)
}

//Calling the test function
foo();


module.exports = {
    loadAllPois: saveNewPoi
}