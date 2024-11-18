const axios = require('axios');

// Define your API-Football credentials
const API_KEY = process.env.API_FOOTBALL_KEY; // Make sure to set your API key in the .env file
const API_URL = 'https://v3.football.api-sports.io';

module.exports = {
    getLeagues: async (req, res) => {
        try {
            const response = await axios.get(`${API_URL}/leagues`, {
                headers: {
                    'x-apisports-key': API_KEY,
                },
            });
    
            // Parse the data to the desired format
            const leagues = response.data.response.map(league => {
                return {
                    id: league.league.id,
                    image: league.league.logo,
                    title: league.league.name,
                    subtitle: league.league.type, // optional
                    sport: {
                        image: "link_to_football_image", // Replace with the actual image URL for football
                        title: "Football",
                        subtitle: "Football",
                        firstColorGradientOverlay: "#f14b4b",
                        secondColorGradientOverlay: "#f14b4b"
                    }
                };
            });
    
            res.status(200).json(leagues);
        } catch (error) {
            console.error('Error fetching leagues:', error);
            res.status(500).json({ error: 'Error fetching leagues' });
        }
    }
    ,

    getMatchesByLeague: async (req, res) => {
        const { leagueId } = req.params;
        const { season, date } = req.body; // Read the date from the request body
        const parsedDate = new Date(date);
       // const formattedDate = parsedDate.toISOString().split('T')[0]; // "YYYY-MM-DD" format
        const formattedDate = date.split('T')[0]; // Extracts "YYYY-MM-DD"
    
        try {
            const response = await axios.get(`${API_URL}/fixtures`, {
                headers: {
                    'x-apisports-key': API_KEY,
                },
                params: {
                    league: leagueId,
                    season: season,
                    date: formattedDate
                }
            });

            console.log(response);
    
            // Transform the response to the desired format
            const matches = response.data.response.map(match => {
                return {
                    id: match.fixture.id,
                    periods: {
                        first: match.fixture.periods.first,
                        second: match.fixture.periods.second
                    
                    },
                    status:match.fixture.status,
                    address:match.fixture.venue.name + " " +match.fixture.venue.city,
                    firstTeam: {
                        id: match.teams.home.id,
                        name: match.teams.home.name,
                        logo: match.teams.home.logo
                    },
                    secondTeam: {
                        id: match.teams.away.id,
                        name: match.teams.away.name,
                        logo: match.teams.away.logo
                    },
                    startDate: match.fixture.date, // Start date of the match
                    endDate: match.fixture.date,   // End date of the match (if applicable)
                    championship: {}                // Leave empty for now
                };
            });
    
            res.status(200).json(matches);
        } catch (error) {
            console.error(`Error fetching matches for league ${leagueId}:`, error);
            res.status(500).json({ error: 'Error fetching matches' });
        }
    }
    
    
};



