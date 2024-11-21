const express = require('express');
const { getLeagues, getMatchesByLeague } = require('../controllers/matchController');
const { getMatchesByUser } = require('../controllers/MediathequesController');

const router = express.Router();

// Get the list of leagues
router.get('/leagues', getLeagues);

// Get matches for a specific league in the next 30 days
router.post('/leagues/:leagueId/matches', getMatchesByLeague);



module.exports = router;



/*
Get List of Leagues

Route: GET /api/matches/leagues
Response: List of leagues available from the API-Football service.
Get Matches for a Specific League

Route: GET /api/matches/leagues/:leagueId/matches
Response: List of matches for the specified league in the next 30 days.


*/