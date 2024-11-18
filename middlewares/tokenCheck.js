const jwt = require("jsonwebtoken");


module.exports = {
    checkExpireToken: async (req, res, next) => {
        const authorization = req.headers.authorization
        try {
            if (authorization !== undefined && authorization !== '' && authorization !== null) {
                const token = req.headers.authorization.replace('Bearer', '')
                if (token) {
                    const decodeToken = jwt.decode(token)
                    if (Date.now() >= decodeToken.exp * 1000) {
                        res.status(401).json({ tokenExpired: "your session is expired please try to login" })
                    } else {
                        next()
                    }
                }
            } else {
                res.status(401).json({ tokenExpired: "Access denied" })
            }
        } catch (error) {
            console.log(error);
            res.status(401).json({ error: 'internal server error!', error })
        }
    }

    
}