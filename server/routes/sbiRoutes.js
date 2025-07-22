const express=require("express");
const  fetchAndStoreSBIProduct  = require("../controllers/SBI/sbisavings");
const fetchAndStoreSBIFD = require("../controllers/SBI/sbifd");
const fetchAndStoreSBITaxSaverFD = require("../controllers/SBI/sbitaxsaverfd");
const fetchAndStoreSBIRD = require("../controllers/SBI/sbird");
const fetchAndStoreSBIPPF = require("../controllers/SBI/sbippf");
const fetchAndStoreSBINPS = require("../controllers/SBI/sbinps");
const fetchAndStoreSBIUnnati = require("../controllers/SBI/sbiunnaticard");
const fetchAndStoreSBISimply = require("../controllers/SBI/sbisimplysave");
const router = express.Router();

router.get('/savings', fetchAndStoreSBIProduct);
router.get('/fd', fetchAndStoreSBIFD);
router.get('/taxsaverfd', fetchAndStoreSBITaxSaverFD);
router.get('/rd', fetchAndStoreSBIRD);
router.get('/ppf', fetchAndStoreSBIPPF);
router.get("/nps",fetchAndStoreSBINPS);
router.get('/unnaticard',fetchAndStoreSBIUnnati)
router.get('/simplysave',fetchAndStoreSBISimply)
module.exports=router;