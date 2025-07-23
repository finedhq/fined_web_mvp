import express from 'express';
import fetchAndStoreSBIProduct from '../controllers/SBI/sbisavings.js';
import fetchAndStoreSBIFD from '../controllers/SBI/sbifd.js';
import fetchAndStoreSBITaxSaverFD from '../controllers/SBI/sbitaxsaverfd.js';
import fetchAndStoreSBIRD from '../controllers/SBI/sbird.js';
import fetchAndStoreSBIPPF from '../controllers/SBI/sbippf.js';
import fetchAndStoreSBINPS from '../controllers/SBI/sbinps.js';
import fetchAndStoreSBIUnnati from '../controllers/SBI/sbiunnaticard.js';
import fetchAndStoreSBISimply from '../controllers/SBI/sbisimplysave.js';
const router = express.Router();

router.get('/savings', fetchAndStoreSBIProduct);
router.get('/fd', fetchAndStoreSBIFD);
router.get('/taxsaverfd', fetchAndStoreSBITaxSaverFD);
router.get('/rd', fetchAndStoreSBIRD);
router.get('/ppf', fetchAndStoreSBIPPF);
router.get("/nps",fetchAndStoreSBINPS);
router.get('/unnaticard',fetchAndStoreSBIUnnati)
router.get('/simplysave',fetchAndStoreSBISimply)
export default router;