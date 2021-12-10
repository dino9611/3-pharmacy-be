const jwt = require("jsonwebtoken")



module.exports = {
    verifyEmailToken : (req,res, next) => {
        // const {token} = req.body
        const token = req.token
        const key = process.env.JWT_KEY
        jwt.verify(token, key, (err, decoded) => {
            if (err){
                console.log(err)
                return res.status(401).send({message: "User Unauthorized"})
            }
            console.log(decoded)
            req.user = decoded
            next();
        })
    }
}