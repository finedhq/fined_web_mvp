import express from "express";
import fetchAndStoreHDFCSavings from "../controllers/HDFC/savings.js";
import fetchAndStoreHDFCDigiSave from "../controllers/HDFC/digisave.js";
import fetchAndStoreHDFCMaxSave from "../controllers/HDFC/maxsavings.js";
import fetchAndStoreHDFCFD from "../controllers/HDFC/fdhdfc.js";
import fetchAndStoreHDFCRD from "../controllers/HDFC/rdhdfc.js";
import fetchAndStoreHDFCMoney from "../controllers/HDFC/moneyback.js";

const hdfcrouter = express.Router();

hdfcrouter.get('/savings', fetchAndStoreHDFCSavings);
hdfcrouter.get('/digisave', fetchAndStoreHDFCDigiSave);
hdfcrouter.get('/maxsave', fetchAndStoreHDFCMaxSave);
hdfcrouter.get('/fd', fetchAndStoreHDFCFD);
hdfcrouter.get('/rd', fetchAndStoreHDFCRD);
hdfcrouter.get('/moneyback', fetchAndStoreHDFCMoney);

export default hdfcrouter;
