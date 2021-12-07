const jwt = require('jsonwebtoken')
module.exports = {
    createTokenEmail : (data) => {
        const key = process.env.JWT_KEY
        const token = jwt.sign(data,key,{expiresIn: "15m"})
        return token
    }
}