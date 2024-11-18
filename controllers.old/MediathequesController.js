const { Match } = require("../config/relation");
const flatted = require('flatted');
const { Sequelize } = require('sequelize'); // Ensure Sequelize is imported


const getMatchesByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const matches = await Match.findAll({
            where: {
                user_id: userId,
            },
            order: [
                ['createdAt', 'DESC'], // Order by creation date in descending order
            ],
        });

        if (!matches.length) {
            return res.status(404).json({ message: 'No matches found for this user' });
        }
        
        // Parse and group matches by date into the required format
        const groupedMatches = Object.values(matches.reduce((acc, match) => {
            const createdDate = match.createdAt.toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
            if (!acc[createdDate]) {
                acc[createdDate] = {
                    Date: createdDate,
                    data: []
                };
            }
            acc[createdDate].data.push({
                ...match.toJSON(),
                data: flatted.parse(match.data) // Parse the flattened JSON data for readability
            });
            return acc;
        }, {}));

        res.status(200).json(groupedMatches);
        
    } catch (error) {
        console.error('Error fetching matches by user:', error);
        res.status(500).json({ message: 'Error fetching matches' });
    }
};




const deleteMatchById = async (req, res) => {
    const { matchId } = req.params; // ID of the specific match to delete
    const { userId } = req.body; // User ID provided in the request body
    const { mediathequeId } = req.body; // User ID provided in the request body

    try {
        // Fetch all matches for the given user
        const matches = await Match.findAll({
            where: { user_id: userId }
        });

        let matchFound = false;

        // Loop through each match to find and delete the specific matchId within the data field
        for (let match of matches) {
            // Parse the JSON data if necessary
            let matchData = flatted.parse(match.data);

            // Ensure data is an array
            if (Array.isArray(matchData)) {
                
                const initialLength = matchData.length;

                // Filter out objects that match the given matchId
                matchData = matchData.filter(item => {
                    // Check if item is an object and has a nested match object with an id
                    if (item && typeof item === 'object') {
                        // Check for id in the match object
                        if (item.match && item.match.id === parseInt(matchId)) {
                            console.log("Found match with id:", item.match.id);
                            return false; // Exclude this item if its match.id matches
                        }
                
                        // Check for id in firstTeam or secondTeam objects
                        if (item.firstTeam && item.firstTeam.id === parseInt(matchId)) {
                            console.log("Found firstTeam with id:", item.firstTeam.id);
                            return false; // Exclude this item if its firstTeam.id matches
                        }
                
                        if (item.secondTeam && item.secondTeam.id === parseInt(matchId)) {
                            console.log("Found secondTeam with id:", item.secondTeam.id);
                            return false; // Exclude this item if its secondTeam.id matches
                        }
                    }
                
                    return true; // Keep all other items
                });

                // Check if a match was removed
                if (matchData.length !== initialLength) {
                    matchFound = true;

                    // Update the data column with modified JSON
                    await match.update({ data: flatted.stringify(matchData) });
                    break; // Exit the loop after finding and updating the first relevant match
                }
            }
        }

        if (matchFound) {
            res.status(200).json({ message: `Match with id ${matchId} successfully deleted.` });
        } else {
            res.status(404).json({ message: 'Match not found.' });
        }
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ message: 'Error deleting match' });
    }
};








module.exports = { getMatchesByUser,deleteMatchById };
