const express=require("express");
const fetchAndStoreICICISavings = require("../controllers/ICICI/savingsicici");
const fetchAndStoreBasicICICISavings = require("../controllers/ICICI/basicicici");
const fetchAndStoreYoungICICISavings = require("../controllers/ICICI/young");
const fetchAndStoreICICIFD = require("../controllers/ICICI/icicifd");
const fetchAndStoreICICIRD = require("../controllers/ICICI/icicird");
const icicirouter = express.Router();

icicirouter.get('/savings', fetchAndStoreICICISavings);
icicirouter.get('/basicsavings', fetchAndStoreBasicICICISavings);
icicirouter.get('/youngsavings', fetchAndStoreYoungICICISavings);
icicirouter.get('/fd', fetchAndStoreICICIFD);
icicirouter.get('/rd', fetchAndStoreICICIRD);


module.exports=icicirouter;