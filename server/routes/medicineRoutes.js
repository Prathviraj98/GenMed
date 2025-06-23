const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/search', medicineController.searchMedicines);
router.get('/suggestions', medicineController.getSuggestions);

module.exports = router;
