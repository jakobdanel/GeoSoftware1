/**
 * @author Jan Hoping, Jakob Danel
 */



var express = require('express');
var router = express.Router();
const databaseFunctions = require('./../databaseFunctions');


//Getting all routes
router.get('/', async function (req, res, next) {
    res.json(await databaseFunctions.loadAllRoutes());
});


//Getting a route with a specific id
router.get('/:id', async (req, res, next) => {
    let message = await databaseFunctions.loadOneRoute(req.params.id);
    if (message.valid) {
        res.status(200).send(message.message);
    } else if (message.message == "No data founded") {
        res.status(404).send(message);
    } else {
        res.status(500).send(message);
    }
});

//Posting a new route
router.post('/', async (req, res, next) => {
    let message = await databaseFunctions.postNewRoute(req.body);
    if (message.successfull) {
        res.status(200).send(message)
    } else {
        res.status(500).send(message)
    }
});

//Update the route with the id to the name given in the body
router.post('/update/:id',async (req,res,next)=>{
    let message = await databaseFunctions.updateRoute(req.params.id,req.body);
    return message;
})

//Delete the route with the specific id
router.delete('/:id', async (req,res,next)=>{
    let message = await databaseFunctions.deleteOneRoute(req.params.id);
    if (message.valid) {
        res.status(200).send(message)
    } else {
        res.status(500).send(message)
    }
})
module.exports = router;