import express from "express";
import fetchAndStoreKotakProduct from "../controllers/Kotak/savings.js";
import fetchAndStoreAce from "../controllers/Kotak/acekotak.js";

const kotakrouter = express.Router();

kotakrouter.get('/savings', fetchAndStoreKotakProduct);
kotakrouter.get('/acesavings', fetchAndStoreAce);

export default kotakrouter;
