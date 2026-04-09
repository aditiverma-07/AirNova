const express = require('express');
const { getAqiForCity, getHistoryData } = require('../controllers/aqi.controller');

const router = express.Router();

router.get('/history', getHistoryData);
router.get('/', getAqiForCity);

module.exports = router;

