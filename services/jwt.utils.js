//Imports
const { Question, Answer, InputType, OptionChoice,Municipality, ResetToken } = require("../database/relations")
const jwt = require('jsonwebtoken');
const { JWT_KEY, TOKEN_TIME_EXPIRES } = require('../../config/constantes');
const Cryptr = require('cryptr');
const constantes = require('../../config/constantes');
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const cryptr = new Cryptr(constantes.SECRET_KEY);

module.exports = {
    verifyToken: async (authorizations) => {
        const authorization = authorizations
        try {
            if (authorization) {
                const decryptedId = cryptr.decrypt(authorization);
                if (decryptedId) {
                    const resetToken = await ResetToken.findOne({
                        where : {id : decryptedId }
                    })
                    const verfication = await jwt.verify(resetToken.token,JWT_KEY)
                    if (verfication) {
                        const decode = jwt.decode(resetToken.token)
                        if (Date.now() >= decode.exp * 1000) {
                            return null
                        }else{
                            return decode
                        }
                    }else{
                        return null
                    }
                }else{
                    return null
                }
            } else {
                return null
            }
        } catch (error) {
            console.log(error);
        }
    },


    // const verfication = await jwt.verify(authorization, JWT_KEY)
    //                 if (verfication) {
    //                     const decodeToken = jwt.decode(authorization)
    //                     if (Date.now() >= decodeToken.exp * 1000) {
    //                         return null
    //                     } else {
    //                         return decodeToken
    //                     }
    //                 } else {
    //                     return null
    //                 }
    generatTokenForuser: function (userData, municipality, expiresIn = null, desactivation = false) {
        return jwt.sign({
            userId: userData.id,
            municipalityId: municipality.id,
            PEC: municipality.PEC,
            Desactivate: desactivation,
        },
            JWT_KEY,
            {
                expiresIn: expiresIn ? expiresIn : TOKEN_TIME_EXPIRES
            })
    },

    parseAuthorization: function (authorization) {
        return (authorization != null) ? authorization.replace('Bearer', '') : null;
    },

    getUserId: function (authorization) {
        let userId = -1;
        let token = module.exports.parseAuthorization(authorization);
        if (token != null) {
            try {
                let jwtToken = jwt.verify(token, JWT_KEY);
                if (jwtToken != null) {
                    userId = jwtToken.userId;
                }
            } catch (err) { }
        }
        return userId;
    },

    getTokenParams: function (authorization) {
        let tokenParams = new Object;
        let token = module.exports.parseAuthorization(authorization);
        if (token != null) {
            try {
                let jwtToken = jwt.verify(token, JWT_KEY);
                if (jwtToken != null) {
                    tokenParams.userId = jwtToken.userId;
                    tokenParams.roles = jwtToken.roles;
                    tokenParams.status = jwtToken.status;
                }
            } catch (err) { }
        }
        return tokenParams;
    },

    getAnswerByid: async (municipalityId, questionId) => {
        try {
            const answer = await Answer.findAll({
                order: [
                    ['id', 'DESC']],
                where: {
                    municipalityId: municipalityId,
                    QuestionId: questionId,
                    lastAnswer: true
                },
                limite: 1
            });
            if (answer) {

                return answer[0];
            } else {
                return null
            }
        } catch (error) {
            return ({ error: "Internal server Error !! " + error })
        }
    },

    getAnswer: async function (id) {
        try {
            let answer = ''
            const entity = await Answer.findOne({
                where: {
                    id: id,
                },
                include: [{
                    model: Question,
                    include: [
                        { model: InputType }
                    ]
                }]

            });
            const findIndex = [88,203,210,110].findIndex(r=> r===entity.Question.id)
            if (entity) {
                if (entity.Question.InputType.inputTypeName == "Checkbox" || entity.Question.InputType.inputTypeName == "Radio") {
                    const response = entity.answerText.split(',')
                    for (let i = 0; i < response.length; i++) {
                        const option = await OptionChoice.findOne({
                            where: {
                                id: response[i]
                            }
                        })
                        if (option) {
                            answer = answer + ' ' + option.optionChoiceName + ' ; '
                        }

                    }
                }
                if (entity.Question.InputType.inputTypeName == "Municipality" ) {
                    const response = entity.answerText.split(',')
                    for (let i = 0; i < response.length; i++) {
                        const municipality = await Municipality.findOne({
                            where: {
                                id: response[i]
                            }
                        })
                        if (municipality) {
                            answer = answer + ' ' + municipality.name +','+' Codice ISTAT '+ municipality.code +' ; '
                        }
                        
                    }
                }
                if (entity.Question.InputType.inputTypeName == "Number" ) {
                    answer = entity.answerNumeric
                }
                if (answer) {
                    return answer.toString()
                } else if (!answer && findIndex !== -1) {
                    return 'Ulteriori Amministrazioni;'
                }else {
                    if (entity.answerText) {
                        return entity.answerText.toString()
                    }else{
                        return ''
                    }
                    
                }
            } else {
                return null
            }
        } catch (error) {
            console.log(error);
        }
    },
    getAnswerByidMany: async (municipalityId, questionId) => {
        try {
            const answer = await Answer.findAll({
                
                order: [
                    ['id', 'DESC']],
                where: {
                    municipalityId: municipalityId,
                    QuestionId: questionId,
                    createdAt : {
                        [Op.eq]: sequelize.col("updatedAt")
                    }
                },
                limite: 1
            });
            if (answer) {

                return answer[0];
            } else {
                return null
            }
        } catch (error) {
            return ({ error: "Internal server Error !! " + error })
        }
    },

    getAnswerMany: async function (id) {
        try {
            let answer = ''
            const entity = await Answer.findOne({
                where: {
                    id: id,
                },
                include: [{
                    model: Question,
                    include: [
                        { model: InputType }
                    ]
                }]

            });
            const findIndex = [88,203,210,110].findIndex(r=> r===entity.Question.id)
            if (entity) {
                if (entity.Question.InputType.inputTypeName == "Checkbox" || entity.Question.InputType.inputTypeName == "Radio") {
                    const response = entity.answerText.split(',')
                    for (let i = 0; i < response.length; i++) {
                        const option = await OptionChoice.findOne({
                            where: {
                                id: response[i]
                            }
                        })
                        if (option) {
                            answer = answer + ' ' + option.optionChoiceName + ' ; '
                        }

                    }
                }
                if (entity.Question.InputType.inputTypeName == "Municipality" ) {
                    const response = entity.answerText.split(',')
                    for (let i = 0; i < response.length; i++) {
                        const municipality = await Municipality.findOne({
                            where: {
                                id: response[i]
                            }
                        })
                        if (municipality) {
                            answer = answer + ' ' + municipality.name +','+' Codice ISTAT '+ municipality.code +' ; '
                        }
                        
                    }
                }
                if (entity.Question.InputType.inputTypeName == "Number" ) {
                    answer = entity.answerNumeric
                }
                if (answer) {
                    return answer
                } else if (!answer && findIndex !== -1) {
                    return 'Ulteriori Amministrazioni;'
                }else {
                    return entity.answerText
                }
            } else {
                return 'NOT FOUND'
            }
        } catch (error) {
            console.log(error);
        }
    },

    getOptionsId: async (responseTable, optionGroupId) => {
        let optionsIdText = ''
        try {
            for (let ansO = 0; ansO < responseTable.length; ansO++) {
                const options = await OptionChoice.findOne({
                    where: {
                        optionChoiceName: responseTable[ansO].trim(),
                        optionGroupId: optionGroupId
                    }
                })
                if (options) {
                    optionsIdText = optionsIdText + ',' + options.id

                } else {
                    optionsIdText = optionsIdText + ''

                }

            }
            return optionsIdText
        } catch (error) {
            console.log(error);
        }

    }
}