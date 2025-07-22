const express=require("express");
const fetchAndStoreHDFCSavings = require("../controllers/HDFC/savings");
const fetchAndStoreHDFCDigiSave = require("../controllers/HDFC/digisave");
const { fetch } = require("../sb");
const fetchAndStoreHDFCMaxSave = require("../controllers/HDFC/maxsavings");
const fetchAndStoreHDFCFD = require("../controllers/HDFC/fdhdfc");
const fetchAndStoreHDFCRD = require("../controllers/HDFC/rdhdfc");
const fetchAndStoreHDFCMoney = require("../controllers/HDFC/moneyback");
const hdfcrouter = express.Router();

hdfcrouter.get('/savings', fetchAndStoreHDFCSavings);
hdfcrouter.get('/digisave', fetchAndStoreHDFCDigiSave);
hdfcrouter.get('/maxsave',fetchAndStoreHDFCMaxSave);
hdfcrouter.get('/fd',fetchAndStoreHDFCFD);
hdfcrouter.get('/rd',fetchAndStoreHDFCRD);
hdfcrouter.get('/moneyback',fetchAndStoreHDFCMoney);


module.exports=hdfcrouter;