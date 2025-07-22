const express=require("express");
const fetchAndStoreKotakProduct = require("../controllers/Kotak/savings");
const fetchAndStoreAce = require("../controllers/Kotak/acekotak");
const kotakrouter = express.Router();

kotakrouter.get('/savings', fetchAndStoreKotakProduct);
kotakrouter.get('/acesavings', fetchAndStoreAce);

module.exports=kotakrouter;