const express=require("express");
const fetchAndStoreKotakProduct = require("../controllers/Kotak/savings");
const kotakrouter = express.Router();

kotakrouter.get('/savings', fetchAndStoreKotakProduct);

module.exports=kotakrouter;