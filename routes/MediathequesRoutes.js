const express = require('express');
const { getLeagues, getMatchesByLeague } = require('../controllers/matchController');
const { getMatchesByUser,deleteMatchById } = require('../controllers/MediathequesController');

const router = express.Router();

// Get the list of leagues
router.get('/matches/:userId', getMatchesByUser);
router.post('/matches/:matchId', deleteMatchById);

module.exports = router;
