/**
 * @author Jan Hoping, Jakob Danel
 */

const axios = require('axios').default;

//mongoUsername
let mongoUserName = 'jakobdanel';

/**
 * MongoDB Key
 */
let mongoDBKey = 'b58SbN0IRGzNDN0o';

/**
 * Build up of the Mongo Passsword 
 */
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
                [
                    [Number]
                ]
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
 * The schema for the mongoose Route holding a name and an Array of Pois
 */
const RouteSchema = new mongoose.Schema({
    name: String,
    pois: [PoiSchema]
})
/**
 * The mongoose model based on PoiSchema.
 */
const Poi = mongoose.model('Poi', PoiSchema);

/**
 * The mongoose model based on RouteSchema.
 */
const Route = mongoose.model('Route', RouteSchema);
/**
 * These function try to save the given poiData into the Database. For controlling the function returning an boolean for cheking if the logging
 * was successfull. For connecting the mongoose Framework iss used.
 * @param {GeoJSON} poiData The Data which should be saved into the database. 
 * @returns true if saving was successfull, false if not.
 */
let saveNewPoi = async function (poiData) {

    let arePoiDataValid = await inputPoiValid(poiData, true);
    if (!arePoiDataValid.valid) {
        console.error("Input poiData not valid!");
        return "Input poiData not valid: " + arePoiDataValid.message;
    } else {
        if (poiData.geometry.type == "Polygon") {
            poiData.geometry.coordinates = poiData.geometry.coordinates[0][0];
        }
        const urlCheck = await checkValidURL(poiData.properties.url);
        if (!urlCheck.valid) {
            return urlCheck.message;
        }
        const description = await requestWikipediaAPI(poiData.properties.url);
        poiData.properties.description = description;
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const poi = new Poi(poiData);
        console.log(poi);
        await poi.save()
        if (poi.errors) {
            return 'Server error';
        } else return 'Data logged successful';
    }
};
/**
 * These function check if the given URL return data by a get request.
 * @param {String} url The url which will be checked
 * @returns A object with information about the tried get request. A boolean for determine if the requesst was successfull and on top of that
 * a String with informations.
 */
async function checkValidURL(url) {
    try {
        const response = await axios.get(url);
        if (response.status == 200 || response.status == 304) {
            return {
                valid: true,
                message: "Valid URL"
            };
        } else return {
            valid: false,
            message: "Not an valid URL: " + response.status
        }

    } catch (error) {
        console.log(error)
        return {
            valid: false,
            message: 'Not a valid URL'
        }
    }
}

/**
 * These function load all points which are saved in the database.
 * @returns An Array with all Pois saved in the Database.
 */
let loadAllPois = async function () {
    mongoose.connect(uri, {
        useNewUrlParser: true
    });
    return await Poi.find({});
}

/**
 * These function load one Poi which are saved in the database with the given id.#
 * @param {String} id The id of the Poi
 * @returns An Array with all Pois saved in the Database.
 */
let getOnePoi = async (id) => {
    connectMongoose();
    return await Poi.findById(id);
}

/**
 * These function load all Tours which are saved in the database.
 * @returns An Array with all Tours saved in the Database.
 */
let loadAllRoutes = async function () {
    mongoose.connect(uri, {
        useNewUrlParser: true
    });
    return await Route.find({});
}

/**
 * These function determines if the data are valid to the schema or not. For that reason the function checking on some conditions.
 * The conditions are described inside the function.
 * @param {JSON} poiData The data which are to be checked if there are valid to the schema. 
 * @returns If the data are valid return true, else false.
 */
let inputPoiValid = async function (poiData) {
    let allPois = await loadAllPois();
    //check if type is Feature
    if (poiData.type != 'Feature') {
        return {
            valid: false,
            message: 'check if type is Feature failed'
        }
    }
    //check if geometry is of type polygon or point
    if (!(poiData.geometry.type == 'Point' || poiData.geometry.type == 'Polygon')) {
        return {
            valid: false,
            message: 'check if geometry is of type polygon or point failed'
        }
    }
    //Check if Polygon has atleast for points
    if (poiData.geometry.coordinates[0][0].length < 4 && poiData.geometry.type == 'Polygon') {
        console.log(poiData)
        return {
            valid: false,
            message: 'check if Polygon has atleast for points failed'
        }
    }
    //Check if Point has only one Point
    if (poiData.geometry.coordinates.length != 1 && poiData.geometry.type == 'Point') {
        return {
            valid: false,
            message: 'check if Point has only one Point failed'
        }
    }
    //Check if name is unique 
    if (!isValidName(allPois, poiData)) {
        return {
            valid: false,
            message: 'check if name is unique failed'
        }
    }
    //Check if URL is empty
    if (poiData.properties.url == '') {
        return {
            valid: false,
            message: 'check if URL is empty failed'
        }
    }

    //Check if description property exists
    if (poiData.properties.description == undefined) {
        return {
            valid: false,
            message: 'check if description exists failed'
        }
    }
    //If all possible errors not occured return true
    return {
        valid: true,
        message: 'all checks completed'
    };
}

/**
 * These function determines wether a name of a newPoi is unique or not. To calculate that, the function iterate over all Pois and collecting
 * their names. After that the function iterates a second time over the names and compare the names with the new name. If one name is the same the
 * function returns false. If no doublett is found the function returns true.
 * @param {JSON[]} allPois allPois which are saved in the database. 
 * @param {JSON} newPoi The possible newPoi which should be saved in the database.
 * @returns True if the name of the newPoi is unqique, false if not.
 */
let isValidName = function (allPois, newPoi) {
    let names = allPois.map((poi) => {
        return poi.properties.name
    });
    let newName = newPoi.properties.name;
    for (let i = 0; i < names.length; i++) {
        if (names[i] == newName) {
            return false;
        }

    }
    return true;
}

/**
 * Checking if the URL is from wikipedia and then requesting the text from the wikipedia page.
 * @param {String} url The given url from the user
 * @returns The text given by the request
 */
const requestWikipediaAPI = async (url) => {
    if (url.includes("wikipedia")) {
        const splittedURL = url.split('/');
        console.log(splittedURL);
        const apiUrl = "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                origin: "*",
                action: "parse",
                page: splittedURL[splittedURL.length - 1],
                format: "json",
            });
        try {
            const req = await axios.get(apiUrl);
            const json = await req.data;
            return json.parse.text["*"];
        } catch (e) {
            return e
        }
    } else {
        return 'keine Information vorhanden!'
    }
}

/**
 * Deletes the Poi with the given Url from the database.
 * @param {String} id The id of the Poi
 * @returns An Object holding inforation if the delete was successfull.
 */
let deletePoi = async (id) => {
    mongoose.connect(uri, {
        useNewUrlParser: true
    });
    if (mongoose.Types.ObjectId.isValid(id)) {
        let msg = await Poi.deleteOne({
            _id: id
        });
        return msg;
    } else {
        return "Not a valid ObjectID";
    }

}

/**
 * Updates the Poi with the given Url from the database, by asssigning the name new.
 * @param {Object} data The id of the Poi and the new name must be stored in data
 * @returns An Object holding inforation if the Update was successfull.
 */
let updatePoi = async (data) => {
    mongoose.connect(uri, {
        useNewUrlParser: true
    });
    let doc = await Poi.findById(data._id);

    doc.properties.name = data.name;
    doc.save();
    return "Successfull!"
}

/**
 * Updates the Route with the given Url from the database, by asssigning the name new.
 * @param {Object} data  the new name must be stored in data
 * @param {String} id The String with the id of the data which will be updated
 * @returns An Object holding inforation if the Update was successfull.
 */
let updateRoute = async (id, data) => {
    connectMongoose();
    let doc = await Route.findById(id);
    console.log(doc);
    doc.name = data.name;
    doc.save();
    return "Successfull!"
}
/**
 * Loads the Route with the given Url from the database, by asssigning the name new.
 * @param {String} id The String with the id of the data which will be Loaded
 * @returns An Object holding inforation if the Load was successfull.
 */
let loadOneRoute = async (id) => {
    connectMongoose();
    if (mongoose.Types.ObjectId.isValid(id)) {
        let msg = await Route.findOne({
            _id: id
        });
        if (msg) {
            return {
                message: msg,
                valid: true
            };
        } else {
            return {
                valid: false,
                message: "No data founded"
            }
        }
    } else {
        return {
            valid: false,
            message: "Not a valid ObjectID"
        };
    }
}

/**
 * Deletes the Route with the given Url from the database, by asssigning the name new.
 * @param {String} id The String with the id of the data which will be Deleted
 * @returns An Object holding inforation if the Delete was successfull.
 */
let deleteOneRoute = async (id) => {
    connectMongoose();
    if (mongoose.Types.ObjectId.isValid(id)) {
        let msg = await Route.deleteOne({
            _id: id
        });
        if (msg.n == 1) {
            return {
                valid: true,
                object: msg,
                message: "Successfull"
            };
        } else {
            return {
                valid: false,
                message: "No data founded"
            }
        }
    } else {
        return {
            valid: false,
            message: "Not a valid ObjectID"
        };
    }
}
/**
 * Build a connection to the MongoDB database
 */
let connectMongoose = () => {
    mongoose.connect(uri, {
        useNewUrlParser: true
    });
}
/**
 * Posting a new route to the server. 
 * @param {Object} data Must fit to the Schema definded for Routes.
 * @returns An object with feedback if the posting was successfull
 */
let postNewRoute = async (data) => {
    connectMongoose();
    const route = new Route(data);
    console.log(route);
    await route.save()
    if (route.errors) {
        return {
            message: 'Server error',
            successfull: false
        };
    } else return {
        successfull: true,
        message: 'Data logged successful'
    };

}

//Exporting the functions
module.exports = {
    saveNewPoi: saveNewPoi,
    loadAllPois: loadAllPois,
    getOnePoi: getOnePoi,
    deletePoi: deletePoi,
    updatePoi: updatePoi,
    loadAllRoutes: loadAllRoutes,
    postNewRoute: postNewRoute,
    loadOneRoute: loadOneRoute,
    deleteOneRoute: deleteOneRoute,
    updateRoute: updateRoute,
    inputPoiValid: inputPoiValid,
    mongoose: mongoose
}