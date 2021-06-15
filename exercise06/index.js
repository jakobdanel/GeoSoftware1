/**
 * The backend of these project. 
 * @author Jakob Danel
 * @since 1.6.0
 */

/**
 * Import and saving express module 
 */
let express = require("express");

/**
 * Import and saving path module
 */
let path = require("path");

/**
 * Import and saving request module
 */
let request = require("request");


/**
 * Import and saving mongodb module
 */
const mongodb = require('mongodb');

/**
 * The name of the host.
 */
let hostname = "localhost";


/**
 * The port on which the server works
 */
let port = 1234;

/**
 * Inititalize the server. The app object is the main object, which will be modified with updates for the work of the server.
 */
let app = express();

/**
 * An client object for the connection to MongoDB
 */
const MongoClient = mongodb.MongoClient;

/**
 * Importing the api keys locally.
 */
let keys = require('./keys.js')

/**
 * API key for weather API
 */
let appid = keys.appid;

/**
 * Password for mongodb
 */
let mongo_password = keys.mongoPassword;


//let appid = "d345396dfeb64f14b5d793cfe9f08cf1";


// middleware
app.use(express.json({ limit: "10000kb", extended: true, parameterLimit: 1000000 }));
app.use(express.urlencoded({ limit: "10000kb", extended: true, parameterLimit: 1000000 }));

/**
 * These get request returns all routes which are stored in the database. Format is an array which is stored in an attribute response.
 */
app.get("/manageData/routes", async (request, response) => {

    const uri = generateMongoURI(mongo_password, "route");
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    //Connecting with MongoDB
    client.connect((connectError, connectResult) => {
        if (connectError) {
            //Logging errors
            console.error(connectError);
        } else {
            //Connecting to the collection
            connectResult.db("route").collection("route", (collectionError, collectionResult) => {
                if (collectionError) {
                    console.error(collectionError);
                } else {
                    //Using the find method with no filter means, that you get all elements back
                    collectionResult.find().toArray((databaseError, data) => {
                        if (databaseError) {
                            console.error(databaseError)
                        } else {
                            response.json({
                                response: data
                            })
                            console.log("GET: /manageData/routes at " + String(new Date()));
                            //Closing response and client
                            response.end();
                            client.close();
                        }
                    })
                }
            })
        }
    });
});

/**
 * With these post request you can upload a new Route to the database. The function uses the insertDataToDB function. The mandatory format
 * for the post body is described at these function. The response is an String message, that the inserting was successfull. 
 */
app.post("/routeUpload", (request, response) => {
    insertDataToDB("route", request.body, "route");
    response.json({
        response: "Successfull logged"
    })
    console.log("POST: /routeUpload _id: " + request.body.properties.name + "at " + String(new Date()));
    response.end();
});

/**
 * These post request delete one route. For an successfull post you need to send the _id of the route to these post request and it will delete
 * the route with these _id. As response it is send an short information String.
 */
app.post("/deleteRoute", async (request, response) => {

    const uri = generateMongoURI(mongo_password, "route");
    const client = generateClient(uri);

    //Connecting to MongoDB
    client.connect((connectError, connectResult) => {
        if (connectError) {
            console.error(connectError);
        } else {
            //Connecting to route
            connectResult.db("route").collection("route", (collectionError, collectionResult) => {
                if (collectionError) {
                    console.error(collectionError);
                } else {
                    //Deleting by searching for the _id of the object.
                    collectionResult.deleteOne({
                        "_id": mongodb.ObjectId(request.body._id)
                    }, (err, res) => {
                        if (err) {
                            console.error(err);
                        } else {
                            //response.redirect("/manageData/index.html");
                            response.json({
                                response: "Successfull"
                            })
                            response.end();
                            client.close();
                            console.log(`POST: /deleteRoute _id: ${request.body._id} at ${new Date()}`);
                        }
                    });
                };
            });
        };
    });
});

/**
 * These post request returning weather data for given coordinates. By giving coordinates with lat lon in WGS84 these post will respond with
 * weather data from the OpenWeatherAPI. The response is in the format from OpenWeatherMap
 */
app.post("/requestWeatherData", (req, response) => {
    //Using request with the builded link and an callback function.
    request(linkBuilder(buildLinkObjectWeatherDataRequest([req.body.lon, req.body.lat]), [true]), (error, res, body) => {
        if (error) {
            console.error(error);
        } else {
            response.json({
                response: res.body
            })
            console.log(`POST /requestWeatherData lat/lon: ${req.body.lat}/${req.body.lon} at ${new Date()}`);
            response.end();
        }
    });
});

/**
 * Generate an MongoClient object for a given URI.
 * @param {String} uri 
 * @returns The client for the given Uri.
 */
function generateClient(uri) {
    return new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}
/**
 * Not used! Buggy!
 * 
 * These function connecting to the given mogoClient and call connectToCollection if successfull. Actual problem is that the client.close()
 * statement closes the connection before the callback ended.
 * @param {mongodb.MongoClient} client The MongoClient object for the connection
 * @param {Function} callback An callback used in connectToCollection to mainpulate the database.
 */
function connectToClient(client, callback) {
    client.connect((connectError, connectResult) => {
        if (connectError) {
            console.error(connectError);
        } else {
            connectToCollection(connectResult, callback);
            client.close();
        }
    })
}

/**
 * Not used! Buggy!
 * 
 * These function get called in connectToClient, if the connection is successfull. These function will try to connect to the collection and 
 * if the function is successsfull. It will call the callback function with the collection result.
 * @param {MongoCallbackResult} connectResult The result of the mongo connect callback. 
 * @param {Function} callback A callback function to manipulate the database.
 */
function connectToCollection(connectResult, callback) {
    connectResult.db("route").collection("route", (collectionError, collectionResult) => {
        if (collectionError) {
            console.error(collectionError);
        } else {
            callback(collectionResult);
        }
    });
}

/**
 * These function returning one route, which will be searched by the given _id in the request.
 */
app.post("/loadRoute", (request, response) => {
    const uri = generateMongoURI(mongo_password, "route");
    const client = generateClient(uri);

    //Connecting to client
    client.connect((connectError, connectResult) => {
        if (connectError) {
            console.error(connectError);
        } else {
            //Connecting to collection
            connectResult.db("route").collection("route", (collectionError, collectionResult) => {
                if (collectionError) {
                    console.error(collectionError);
                } else {
                    //Quering for the route
                    collectionResult.find({ "_id": mongodb.ObjectId(request.body._id) }).toArray((databaseError, data) => {
                        if (databaseError) {
                            console.error(databaseError);
                        } else {
                            response.json({
                                response: data
                            });
                            console.log(`POST /loadRoute _id: ${request.body._id} at ${new Date()}`);
                            response.end();
                            client.close();
                        }
                    });
                }
            })
        }
    });
});

/**
 * These post update the name of a route. The post body needs an _id and a new name and the server will quering for that route and update 
 * the name of these route. The response is an information String.
 */
app.post("/updateRoute", (request, response) => {
    const uri = generateMongoURI(mongo_password, "route");
    const client = generateClient(uri);

    //Connecting to database
    client.connect((connectError, connectResult) => {
        if (connectError) {
            console.error(connectError);
        } else {
            //Connecting to collection
            connectResult.db("route").collection("route", (collectionError, collectionResult) => {
                if (collectionError) {
                    console.error(collectionError);
                } else {
                    //Set the route with the given _id to the given name
                    collectionResult.updateOne({
                        "_id": mongodb.ObjectId(request.body._id)
                    }, {
                        "$set": {
                            "properties.name": request.body.name
                        }
                    }, (updateError, result) => {
                        if (updateError) {
                            console.error(updateError);
                        } else {
                            response.json({
                                response: "Successfull updated"
                            })
                            console.log(`POST /updateRoute _id ${request.body._id} to name: ${request.body.name} at ${new Date()}`);
                            response.end();
                            client.close();
                        }
                    })
                }
            })
        }
    });
})

//Using the public files static.
app.use(express.static(path.join(__dirname, "public")));

/**
 * Build an URI for connection to the MongoDB Atlas Server. Here static with the user "jdanel".
 * @param {String} password The password for the user jdanel.
 * @param {String} dbName The name of the database, which will be used.
 * @returns The URI as String.
 */
function generateMongoURI(password, dbName) {
    return `mongodb+srv://jdanel:${password}@cluster0.dtitd.mongodb.net/${dbName}?retryWrites=true&w=majority`;
}

/**
 * Inserting the given data to the MongoDB database on the given database and collection. The function is async.
 * @param {String} dbName The name of the database as String.
 * @param {JSON} data The data which should be inserted into the database.
 * @param {String} collectionName The name of the collection.
 */
async function insertDataToDB(dbName, data, collectionName) {

    const uri = generateMongoURI(mongo_password, dbName);
    console.log(uri);
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    //Connecting...
    client.connect(err => {
        const collection = client.db(dbName).collection(collectionName);
        collection.insertOne(data, (error, item) => {
            if (err) {
                console.error(error);
            } else {
                console.log('Logged succesfully');
            }
        });
    });
    client.close();
}


/*
The input file should have these format:
 
 
        {
            "type": "Feature",
            "properties": {
                "name": "nameXY"
                // some additional properties ... must not exists
            },
            "geometry": {
                "type": "MultiLineString",
                "coordinates": [
                    [
                        //some coordinates
                        [
                            1,2
                        ],
                        [
                          2,3
                        ],
                    ]
                }
            }
 
*/


//Let the app listen to the hostname and port. Starting the server here.
app.listen(port, hostname, () => {
    console.log(`Listening to: ${hostname}:${port}`);
});



/**
 * These function generates an URL from a given JS object. The JS object should have the following schema: The object must provide an
 * key with name baseURL, with the base URL of the adress. Also it should have a key mandatory, which holds an object, with all attributes for 
 * the request that are mandatory. The mandatory object can only hold keys with single value items, which must be strings. Also their could be an
 * optional key with information about optional parameters. These optional object workss in the same way as the mandatory object with the one exception,
 * that only the keyss which are marked by useOptional are used.
 * @param {any} object The object for generating the link. Conditions are desscribed above.
 * @param {boolean[]} useOptionals An array with booleans. Must have the same length as the optional object keys has. If the n-th index is true, the value and the n-th
 * key will bey used, if false it will be not used.
 * @example Example for the object input:
 *  {
 *     baseURL: "https://1234.de",
 *     mandatory:
 *      {
 *          key1: arg1,
 *          key2: arg2,
 *          key3: arg3
 *      },
 *    optional:
 *      {
 *          key4: arg4,
 *          key5: arg5,
 *      }                
 * } 
 * @returns The generated URL as a String.
 */
function linkBuilder(object, useOptionals = []) {
    let link = object.baseURL + "?";
    for (let i = 0; i < Object.keys(object.mandatory).length; i++) {
        if (i == 0) {
            let key = Object.keys(object.mandatory)[i];
            link += key + "=" + object.mandatory[key];
        } else {
            let key = Object.keys(object.mandatory)[i];
            link += "&" + key + "=" + object.mandatory[key];
        }
    }
    if (object.optional != undefined) {
        for (let i = 0; i < Object.keys(object.optional).length; i++) {
            if (useOptionals[i]) {
                let key = Object.keys(object.optional)[i];
                link += "&" + key + "=" + object.optional[key];
            }
        }
    }
    return link;
}


/**
 * These function can be used to create an object for the linkBuilder function to make an API request for WeatherData at OpenWeatherMap. Using the
 * coordinates as the only changing variable.
 * @param {number[]} coordinates Contains the coordinates for the request. Should be an array of length two. Coordinates in WGS84 and the format
 * should be [lat,long].
 * @returns An object corrosponding to the conditions of the linkBuilder function. 
 */
function buildLinkObjectWeatherDataRequest(coordinates) {
    return {
        baseURL: "https://api.openweathermap.org/data/2.5/weather",
        mandatory: {
            lat: coordinates[1],
            lon: coordinates[0],
            appid: appid,
        },
        optional: {
            units: "metric"
        }
    }
}
