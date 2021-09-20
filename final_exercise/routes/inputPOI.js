/**
 * @author Jan Hoping, Jakob Danel
 */

//Inport all needed librarys
var express = require('express');
const databaseFunctions = require('./../databaseFunctions');
var router = express.Router();
const axios = require('axios');

//Sending back all Pois
router.get('/', async function (req, res, next) {
  let allPois = await databaseFunctions.loadAllPois();
  res.json(allPois);
  res.end();
});

//sending back the Poi with the specific id
router.get('/:id',async function(req,res,next){
  let poi = await databaseFunctions.getOnePoi(req.params.id);
  res.json(poi);
  res.end();
});

//Posting a new Poi
router.post('/', async (req, res, next) => {
  console.log(req.body);
  let mes = await databaseFunctions.saveNewPoi(req.body);
  res.json({
    message: mes
  })

  res.end();
});

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
 * Storing the API key for the OpenWeatherMap API.
 */
let appid = "d345396dfeb64f14b5d793cfe9f08cf1";

//Posting the coordinates here to get the weather data for the given coordinates
router.post('/weather',async (req,res,next) => {
  console.log(req.body.coordinates);
  let url = buildLinkObjectWeatherDataRequest(req.body.coordinates);
  url = linkBuilder(url);
  console.log(url);
  {
    try {
        const req = await axios.get(url);
        const json = await req.data;
        res.status(200).send(json);
    } catch (e) {
        return res.status(500).send({
          error: "Error"
        });
    }
} 
})

//Posting a new Name with a specific id here and update the related Poi
router.post('/update', async (req,res, next) => {
  let msg = await databaseFunctions.updatePoi(req.body);
  res.json({
    message: msg
  })
})

//Delete the Poi with the given id
router.delete('/:id', async (req,res, next) => {
  console.log(req.params.id);
  let del = await databaseFunctions.deletePoi(req.params.id);
  res.json({
    message: del
  });
  res.send();
})

module.exports = router;