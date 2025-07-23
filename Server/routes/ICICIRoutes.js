import express from "express";
import fetchAndStoreICICISavings from "../controllers/ICICI/savingsicici.js";
import fetchAndStoreBasicICICISavings from "../controllers/ICICI/basicicici.js";
import fetchAndStoreYoungICICISavings from "../controllers/ICICI/young.js";
import fetchAndStoreICICIFD from "../controllers/ICICI/icicifd.js";
import fetchAndStoreICICIRD from "../controllers/ICICI/icicird.js";

const icicirouter = express.Router();

icicirouter.get('/savings', fetchAndStoreICICISavings);
icicirouter.get('/basicsavings', fetchAndStoreBasicICICISavings);
icicirouter.get('/youngsavings', fetchAndStoreYoungICICISavings);
icicirouter.get('/fd', fetchAndStoreICICIFD);
icicirouter.get('/rd', fetchAndStoreICICIRD);

export default icicirouter;
