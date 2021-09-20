/**
 * @author Jan Hoping, Jakob Danel
 */

const axios = require('axios').default;

var express = require('express');
var router = express.Router();

/**
 * The URL from the bus Api
 */
let url = 'https://rest.busradar.conterra.de/prod/haltestellen';

//Making an get request via axios to get all bus data.
router.get('/', async function (req, res, next) {
    try {
        const req = await axios.get(url);
        const json = await req.data;
        res.status(200).send(json);
    } catch (e) {
        return res.status(500).send(e);
    }
});

module.exports = router;