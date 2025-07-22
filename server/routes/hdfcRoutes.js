const express=require("express");
const fetchAndStoreHDFCSavings = require("../controllers/HDFC/savings");
const fetchAndStoreHDFCDigiSave = require("../controllers/HDFC/digisave");
const { fetch } = require("../sb");
const fetchAndStoreHDFCMaxSave = require("../controllers/HDFC/maxsavings");
const fetchAndStoreHDFCFD = require("../controllers/HDFC/fdhdfc");
const hdfcrouter = express.Router();

hdfcrouter.get('/savings', fetchAndStoreHDFCSavings);
hdfcrouter.get('/digisave', fetchAndStoreHDFCDigiSave);
hdfcrouter.get('/maxsave',fetchAndStoreHDFCMaxSave);
hdfcrouter.get('/fd',fetchAndStoreHDFCFD);


module.exports=hdfcrouter;