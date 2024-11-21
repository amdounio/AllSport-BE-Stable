
const {ResetToken,userMunicipalityHistory } = require("../database/relations")
const { Op } = require("sequelize");
const Sequelize = require('sequelize')
module.exports = {

    
    deleteExpiredTokens : async()=>{
        const deleteResetToken = await ResetToken.destroy({
            where: {
                expiration: { [Op.lt]: Sequelize.fn('CURDATE') },
            }
        });
    },
    
    deleteExpiredUserMunicipalityHistory : async()=>{
        const deleteResetToken = await userMunicipalityHistory.destroy({
            where: {
                expiration: { [Op.lt]: Sequelize.fn('CURDATE') },
            }
        });
    },
    
    getResetToken : async(token)=>{
        try {
            const record = await ResetToken.findOne({
                where: {
                    token: token,
                }
            });
            
            return record
        } catch (error) {
            console.log(error);
        }
    }
}
